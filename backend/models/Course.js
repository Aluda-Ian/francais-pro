const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  videoUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // minutes
  description: { type: String, default: '' },
  resources: [{ name: String, url: String }],
  isFree: { type: Boolean, default: false }, // preview lesson
  order: { type: Number, default: 0 },
});

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  lessons: [lessonSchema],
  order: { type: Number, default: 0 },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: true },
    shortDescription: { type: String, maxlength: 300 },

    // French curriculum type
    curriculum: {
      type: String,
      required: true,
      enum: ['IB', 'IGCSE', 'CBSE', 'Conversation', 'Exam Prep', 'DELF/DALF'],
    },
    // IB: HL/SL, IGCSE: Core/Extended, CBSE: Class 9/10/11/12
    level: {
      type: String,
      required: true,
      enum: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'HL', 'SL', 'Class 9', 'Class 10', 'Class 11', 'Class 12'],
    },
    // Specific paper / track e.g. "French A: Language & Literature", "French B"
    track: { type: String, default: '' },

    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' },
    isFree: { type: Boolean, default: false },

    thumbnail: { type: String, default: '' },
    previewVideoUrl: { type: String, default: '' },
    language: { type: String, default: 'French' },

    modules: [moduleSchema],

    // Live class component
    includesLiveClasses: { type: Boolean, default: false },
    liveClassesCount: { type: Number, default: 0 },

    // Requirements & outcomes
    requirements: [String],
    learningOutcomes: [String],
    targetAudience: [String],

    // Metadata
    duration: { type: Number, default: 0 }, // total hours
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },

    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug from title
courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  // Compute total duration from all lessons
  this.duration = this.modules.reduce((total, mod) => {
    return total + mod.lessons.reduce((t, l) => t + (l.duration || 0), 0);
  }, 0) / 60; // convert minutes to hours
  next();
});

// Indexes for search
courseSchema.index({ curriculum: 1, level: 1 });
courseSchema.index({ isPublished: 1, isFeatured: -1 });
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Course', courseSchema);
