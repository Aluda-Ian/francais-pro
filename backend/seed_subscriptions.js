const mongoose = require('mongoose');
const SubscriptionType = require('./models/SubscriptionType');

const DB_URI = 'mongodb://127.0.0.1:27017/francais-pro';

async function seedSubscriptions() {
  try {
    await mongoose.connect(DB_URI);
    console.log('Connected to DB for plan seeding.');

    // Clear existing plans (optional/during seed)
    await SubscriptionType.deleteMany({});
    console.log('Cleared old subscription plans.');

    const plans = [
      {
        name: 'Free Trial Plan',
        price: 0,
        courseLimit: 1,
        liveClassLimit: 2,
        durationDays: 30
      },
      {
        name: 'Standard Pro Plan',
        price: 29,
        courseLimit: 5,
        liveClassLimit: 10,
        durationDays: 30
      },
      {
        name: 'Ultimate Unlimited Plan',
        price: 79,
        courseLimit: -1, // Unlimited
        liveClassLimit: -1, // Unlimited
        durationDays: 30
      }
    ];

    for (const p of plans) {
      const plan = new SubscriptionType(p);
      await plan.save();
      console.log(`Seeded plan: ${plan.name}`);
    }

    console.log('Successfully seeded all subscription plans!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Seeding process finished.');
  }
}

seedSubscriptions();
