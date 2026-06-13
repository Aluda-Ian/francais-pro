const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { sendBookingConfirmation } = require('../utils/emailService');
const nodemailer = require('nodemailer');

// POST /api/contact
router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, subject, message, curriculum } = req.body;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    await transporter.sendMail({
      from: `"Français Pro Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      replyTo: email,
      subject: `[Contact Form] ${subject || 'New enquiry'} — ${name}`,
      html: `
        <h2 style="color:#002395;">🇫🇷 New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
        ${curriculum ? `<p><strong>Curriculum Interest:</strong> ${curriculum}</p>` : ''}
        <p><strong>Message:</strong></p>
        <div style="background:#f8f9ff;padding:16px;border-left:4px solid #002395;border-radius:8px;">${message}</div>
        <hr>
        <p style="color:#999;font-size:12px;">Sent from Français Pro contact form</p>
      `,
    });

    // Auto-reply to enquirer
    await transporter.sendMail({
      from: `"Français Pro" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `Merci for reaching out — Français Pro`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;">
          <h2 style="color:#002395;">🇫🇷 Merci, ${name}!</h2>
          <p>We've received your message and will get back to you within 24 hours.</p>
          <p>In the meantime, feel free to browse our courses or book a free trial class.</p>
          <p style="color:#555;font-size:13px;margin-top:24px;">— The Français Pro Team 🇫🇷</p>
        </div>
      `,
    });

    res.json({ message: 'Your message has been sent. We\'ll be in touch within 24 hours!' });
  } catch (err) { next(err); }
});

module.exports = router;
