const mongoose = require('mongoose');

const subscriptionTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    courseLimit: {
      type: Number,
      required: [true, 'Course limit is required'],
      comment: 'Use -1 or a very high number for unlimited',
    },
    liveClassLimit: {
      type: Number,
      required: [true, 'Live class limit is required'],
      comment: 'Use -1 or a very high number for unlimited',
    },
    durationDays: {
      type: Number,
      default: 30,
      min: [1, 'Duration must be at least 1 day'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SubscriptionType', subscriptionTypeSchema);
