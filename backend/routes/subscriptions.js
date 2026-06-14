const express = require('express');
const router = express.Router();
const SubscriptionType = require('../models/SubscriptionType');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// GET /api/subscriptions/plans — Fetch all subscription plans
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await SubscriptionType.find().sort({ price: 1 });
    res.json({ plans });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions/plans — Create a new plan (Admin only)
router.post('/plans', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const { name, price, courseLimit, liveClassLimit, durationDays } = req.body;
    
    if (!name || price === undefined || courseLimit === undefined || liveClassLimit === undefined) {
      return res.status(400).json({ error: 'Please provide name, price, courseLimit, and liveClassLimit.' });
    }

    const existingPlan = await SubscriptionType.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({ error: `A subscription plan with the name "${name}" already exists.` });
    }

    const plan = new SubscriptionType({
      name,
      price: Number(price),
      courseLimit: Number(courseLimit),
      liveClassLimit: Number(liveClassLimit),
      durationDays: durationDays ? Number(durationDays) : 30
    });

    await plan.save();
    res.status(201).json({ plan, message: 'Plan created successfully!' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/subscriptions/plans/:id — Delete a plan (Admin only)
router.delete('/plans/:id', authMiddleware, authorize('admin'), async (req, res, next) => {
  try {
    const plan = await SubscriptionType.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    await plan.deleteOne();
    res.json({ message: 'Plan deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/subscriptions/subscribe — Subscribe/Upgrade to a plan (Student only)
router.post('/subscribe', authMiddleware, authorize('student'), async (req, res, next) => {
  try {
    const { planId } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'Please provide a planId.' });
    }

    const plan = await SubscriptionType.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: 'Subscription plan not found.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Set new subscription and reset cycle usage limits
    user.subscription = plan._id;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);
    user.subscriptionExpiresAt = expiresAt;
    
    // Reset limits for the new cycle
    user.coursesEnrolledCount = 0;
    user.liveClassesBookedCount = 0;

    await user.save();
    await user.populate('subscription');

    res.json({
      success: true,
      message: `Successfully subscribed to the "${plan.name}" plan!`,
      user: user.toPublicProfile()
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
