const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },

    // Payment
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentStatus: {
      type: String,
      enum: ['free', 'paid', 'pending', 'refunded'],
      default: 'free',
    },
    paymentIntentId: { type: String, default: '' },

    // Progress tracking
    completedLessons: [{ type: String }], // lesson IDs
    progressPercent: { type: Number, default: 0, min: 0, max: 100 },
    lastAccessedAt: { type: Date },
    completedAt: { type: Date },

    // Certificate
    certificateIssued: { type: Boolean, default: false },
    certificateUrl: { type: String, default: '' },
    certificateIssuedAt: { type: Date },

    // Status
    status: {
      type: String,
      enum: ['active', 'completed', 'expired', 'refunded'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Unique enrollment per student per course
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

// Pre-save: auto-complete when 100%
enrollmentSchema.pre('save', function (next) {
  if (this.progressPercent >= 100 && !this.completedAt) {
    this.completedAt = new Date();
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
