const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    liveClass: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', required: true },

    // Status
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'attended', 'no-show', 'postponed'],
      default: 'confirmed',
    },

    // Payment
    amountPaid: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    paymentStatus: {
      type: String,
      enum: ['free', 'pending', 'paid', 'refunded'],
      default: 'free',
    },
    paymentIntentId: { type: String, default: '' }, // Stripe payment intent

    // Google Calendar integration
    studentCalendarEventId: { type: String, default: '' }, // event added to student's GCal
    meetLinkSentAt: { type: Date },

    // Email confirmation
    confirmationEmailSent: { type: Boolean, default: false },
    confirmationEmailSentAt: { type: Date },

    // Reminder
    reminderSent: { type: Boolean, default: false },
    reminderSentAt: { type: Date },

    // Cancellation
    cancelledAt: { type: Date },
    cancellationReason: { type: String, default: '' },
    refundStatus: { type: String, enum: ['none', 'pending', 'processed'], default: 'none' },

    // Attendance
    joinedAt: { type: Date },
    leftAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Ensure a student can only book a class once
bookingSchema.index({ student: 1, liveClass: 1 }, { unique: true });

// Virtual: duration attended (in minutes)
bookingSchema.virtual('attendanceDuration').get(function () {
  if (this.joinedAt && this.leftAt) {
    return Math.round((this.leftAt - this.joinedAt) / (1000 * 60));
  }
  return null;
});

module.exports = mongoose.model('Booking', bookingSchema);
