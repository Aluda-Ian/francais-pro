const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    topic: { type: String, default: '' }, // e.g., "Subjunctive Mood", "Past Tense"

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // French curriculum context
    curriculum: {
      type: String,
      required: true,
      enum: ['IB', 'IGCSE', 'CBSE', 'Conversation', 'Exam Prep', 'DELF/DALF', 'General'],
    },
    level: {
      type: String,
      required: true,
      enum: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'HL', 'SL', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    },

    // Scheduling
    scheduledAt: { type: Date, required: true },
    durationMinutes: { type: Number, required: true, min: 15, max: 240, default: 60 },
    endAt: { type: Date }, // computed from scheduledAt + durationMinutes

    // Capacity
    maxStudents: { type: Number, default: 20 },
    enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Google Integrations
    googleMeetLink: { type: String, default: '' },
    googleCalendarEventId: { type: String, default: '' },
    googleCalendarLink: { type: String, default: '' }, // link to view the event

    // Pricing
    price: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: 'USD' },
    isFree: { type: Boolean, default: false },

    // Status
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },

    // Recording
    recordingUrl: { type: String, default: '' },
    isRecorded: { type: Boolean, default: false },

    // Related course (optional linkage)
    relatedCourse: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', default: null },

    // Cancellation
    cancelledReason: { type: String, default: '' },
    cancelledAt: { type: Date },
    rescheduledTo: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
liveClassSchema.virtual('spotsRemaining').get(function () {
  return Math.max(0, this.maxStudents - (this.enrolledStudents?.length || 0));
});

liveClassSchema.virtual('isFull').get(function () {
  return this.enrolledStudents?.length >= this.maxStudents;
});

liveClassSchema.virtual('isUpcoming').get(function () {
  return this.status === 'scheduled' && this.scheduledAt > new Date();
});

// Pre-save: compute endAt
liveClassSchema.pre('save', function (next) {
  if (this.scheduledAt && this.durationMinutes) {
    this.endAt = new Date(this.scheduledAt.getTime() + this.durationMinutes * 60 * 1000);
  }
  next();
});

// Indexes
liveClassSchema.index({ scheduledAt: 1, status: 1 });
liveClassSchema.index({ instructor: 1, scheduledAt: -1 });
liveClassSchema.index({ curriculum: 1, level: 1 });

module.exports = mongoose.model('LiveClass', liveClassSchema);
