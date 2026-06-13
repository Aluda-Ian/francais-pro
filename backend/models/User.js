const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    passwordHash: {
      type: String,
      select: false, // Never returned in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    // Google OAuth
    googleId: { type: String, sparse: true },
    googleAccessToken: { type: String, select: false },
    googleRefreshToken: { type: String, select: false },

    // Profile
    avatar: { type: String, default: '' },
    bio: { type: String, maxlength: 500, default: '' },
    phone: { type: String, default: '' },
    country: { type: String, default: '' },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },

    // Instructor-specific
    qualifications: [String],    // e.g., ['IB Examiner', 'DELF Certified']
    languages: [String],         // e.g., ['French', 'English']
    specializations: [String],   // e.g., ['IB French A', 'IGCSE French']

    // Student-specific
    curriculum: {
      type: String,
      enum: ['IB', 'IGCSE', 'CBSE', 'Other', ''],
      default: '',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Elementary', 'Intermediate', 'Upper-Intermediate', 'Advanced', 'HL', 'SL', ''],
      default: '',
    },

    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Full profile URL
userSchema.virtual('avatarUrl').get(function () {
  return this.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=002395&color=fff`;
});

// Pre-save: Hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  if (this.passwordHash) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Method: Verify password
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Method: Public profile (no sensitive data)
userSchema.methods.toPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatarUrl: this.avatarUrl,
    bio: this.bio,
    country: this.country,
    gender: this.gender,
    curriculum: this.curriculum,
    level: this.level,
    specializations: this.specializations,
    qualifications: this.qualifications,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('User', userSchema);
