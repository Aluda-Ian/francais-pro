const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/auth');

// GET /api/courses — Browse courses
router.get('/', async (req, res, next) => {
  try {
    const { curriculum, level, isFree, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;

    const filter = { isPublished: true };
    if (curriculum) filter.curriculum = curriculum;
    if (level) filter.level = level;
    if (isFree === 'true') filter.isFree = true;
    if (search) filter.$text = { $search: search };

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

module.exports = router;
