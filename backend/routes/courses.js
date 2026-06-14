const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// GET /api/courses/my-courses — Instructor's own courses
router.get('/my-courses', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
    res.json({ data: courses });
  } catch (err) { next(err); }
});

// GET /api/courses — Browse courses
router.get('/', async (req, res, next) => {
  try {
    const { curriculum, level, isFree, search, instructor, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const filter = { isPublished: true };
    if (curriculum) filter.curriculum = curriculum;
    if (level) filter.level = level;
    if (isFree === 'true') filter.isFree = true;
    if (search) filter.$text = { $search: search };
    if (instructor) filter.instructor = instructor;

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar qualifications')
      .select('-modules')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({ courses, pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

// GET /api/courses/featured — Featured courses for homepage
router.get('/featured', async (req, res, next) => {
  try {
    const courses = await Course.find({ isPublished: true, isFeatured: true })
      .populate('instructor', 'name avatar')
      .select('-modules')
      .sort({ enrolledCount: -1 })
      .limit(6);
    res.json({ courses });
  } catch (err) { next(err); }
});

// GET /api/courses/:idOrSlug — Course details
router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/)
      ? { _id: idOrSlug }
      : { slug: idOrSlug };

    const course = await Course.findOne({ ...query, isPublished: true })
      .populate('instructor', 'name avatar bio qualifications specializations');

    if (!course) return res.status(404).json({ error: 'Course not found.' });
    res.json({ course });
  } catch (err) { next(err); }
});

// POST /api/courses — Create course (instructor/admin)
router.post('/', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const course = new Course({ ...req.body, instructor: req.user._id });
    await course.save();
    res.status(201).json({ course, message: 'Course created successfully.' });
  } catch (err) { next(err); }
});

// PATCH /api/courses/:id — Update course
router.patch('/:id', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found.' });
    if (course.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this course.' });
    }
    Object.assign(course, req.body);
    await course.save();
    res.json({ course, message: 'Course updated.' });
  } catch (err) { next(err); }
});

// GET /api/courses/:id/enrollment-status — Check if logged-in student is enrolled
router.get('/:id/enrollment-status', authMiddleware, async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    res.json({ enrolled: !!enrollment, enrollment });
  } catch (err) {
    next(err);
  }
});

// POST /api/courses/:id/enroll — Enroll in a course (Student only, checks subscription limits)
router.post('/:id/enroll', authMiddleware, authorize('student'), async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const studentId = req.user.id;

    // 1. Fetch and verify course exists and is published
    const course = await Course.findById(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({ error: 'Course not found or is not published.' });
    }

    // 2. Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'You are already enrolled in this course.' });
    }

    // 3. Fetch user with populated subscription plan
    const user = await User.findById(studentId).populate('subscription');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // 4. Verify user has an active subscription
    if (!user.subscription) {
      return res.status(403).json({
        error: 'You do not have an active subscription. Please subscribe to a plan to enroll in courses.'
      });
    }

    if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
      return res.status(403).json({
        error: 'Your subscription plan has expired. Please renew or upgrade your plan to enroll in courses.'
      });
    }

    // 5. Enforce plan limit
    const limit = user.subscription.courseLimit;
    // -1 represents unlimited course access
    if (limit !== -1 && user.coursesEnrolledCount >= limit) {
      return res.status(403).json({
        error: `You have reached your subscription's course enrollment limit of ${limit} courses. Please upgrade your plan to enroll in more courses.`
      });
    }

    // 6. Create enrollment and update user
    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      status: 'active',
      paymentStatus: 'free' // Subscriptions cover the course
    });

    await enrollment.save();

    user.coursesEnrolledCount += 1;
    if (!user.enrolledCourses.includes(courseId)) {
      user.enrolledCourses.push(courseId);
    }
    await user.save();

    // Increment course's enrolledCount
    course.enrolledCount = (course.enrolledCount || 0) + 1;
    await course.save();

    res.status(201).json({
      success: true,
      message: '🎉 Successfully enrolled in the course!',
      enrollment
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
