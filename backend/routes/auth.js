const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { getAuthUrl, getTokensFromCode, createOAuth2Client } = require('../config/google');
const { google } = require('googleapis');

// Helper: Sign JWT
const signToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
});

// ============================================================
// POST /api/auth/register
// ============================================================
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').optional().isIn(['student', 'instructor']).withMessage('Invalid role'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role = 'student', curriculum, level } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const user = new User({ name, email, passwordHash: password, role, curriculum, level });
    await user.save();

    const token = signToken(user._id);
    res.status(201).json({ token, user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/auth/login
// ============================================================
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is deactivated. Contact support.' });
    }

    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    const token = signToken(user._id);
    res.json({ token, user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/auth/google — Initiate Google OAuth
// ============================================================
router.get('/google', (req, res) => {
  const { role = 'student', connectCalendar, userId, redirect } = req.query;
  const state = { role };
  if (connectCalendar === 'true') {
    state.connectCalendar = true;
    state.userId = userId;
  }
  if (redirect) {
    state.redirect = redirect;
  }
  const authUrl = getAuthUrl(JSON.stringify(state));
  res.redirect(authUrl);
});

// ============================================================
// GET /api/auth/google/callback — Google OAuth callback
// ============================================================
router.get('/google/callback', async (req, res, next) => {
  try {
    const { code, state } = req.query;
    if (!code) return res.status(400).json({ error: 'No authorization code received.' });

    const tokens = await getTokensFromCode(code);
    const { access_token, refresh_token } = tokens;

    const stateData = state ? JSON.parse(state) : {};

    if (stateData.connectCalendar && stateData.userId) {
      // Find user and connect calendar
      const user = await User.findById(stateData.userId);
      if (!user) return res.status(404).json({ error: 'User not found.' });

      user.googleAccessToken = access_token;
      if (refresh_token) user.googleRefreshToken = refresh_token;
      await user.save({ validateBeforeSave: false });

      // Redirect back to settings page
      const defaultRedirect = stateData.redirect || 'http://localhost:3000/dashbord-settings.html';
      return res.redirect(`${defaultRedirect}?calendar_connected=true`);
    }

    // Fetch user info from Google
    const oauth2Client = createOAuth2Client(access_token, refresh_token);
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: googleUser } = await oauth2.userinfo.get();

    // Find or create user
    let user = await User.findOne({ $or: [{ googleId: googleUser.id }, { email: googleUser.email }] });

    if (user) {
      // Update Google tokens
      user.googleId = googleUser.id;
      user.googleAccessToken = access_token;
      if (refresh_token) user.googleRefreshToken = refresh_token;
      user.lastLoginAt = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      // Create new user
      user = new User({
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.id,
        googleAccessToken: access_token,
        googleRefreshToken: refresh_token,
        avatar: googleUser.picture,
        role: stateData.role || 'student',
        isEmailVerified: true,
      });
      await user.save();
    }

    const token = signToken(user._id);
    // Redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
    res.redirect(`${frontendUrl}/sign-in.html?token=${token}&success=true`);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/auth/me — Get current user
// ============================================================
router.get('/me', require('../middleware/auth'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+googleAccessToken +googleRefreshToken').populate('subscription');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PUT /api/auth/profile — Update user profile
// ============================================================
router.put('/profile', require('../middleware/auth'), async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const { name, email, phone, gender, tagline, avatar } = req.body;

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (phone !== undefined) user.phone = phone;
    if (gender !== undefined) user.gender = gender;
    if (tagline !== undefined) user.bio = tagline; // bio is schema field
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();
    // Populate subscription before converting to public profile
    await user.populate('subscription');
    res.json({ success: true, user: user.toPublicProfile() });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/auth/google-url — Get Google OAuth URL (for frontend)
// ============================================================
router.get('/google-url', (req, res) => {
  const { role = 'student', connectCalendar, userId, redirect } = req.query;
  const state = { role };
  if (connectCalendar === 'true') {
    state.connectCalendar = true;
    state.userId = userId;
  }
  if (redirect) {
    state.redirect = redirect;
  }
  const authUrl = getAuthUrl(JSON.stringify(state));
  res.json({ url: authUrl });
});

module.exports = router;
