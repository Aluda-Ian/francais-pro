const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/auth');
const { authorize: authorizeRoles } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

// GET /api/dashboard/admin
router.get('/admin', requireAuth, authorizeRoles('admin'), async (req, res, next) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalInstructors = await User.countDocuments({ role: 'instructor' });
        const totalCourses = await Course.countDocuments();
        const totalEnrollments = await Enrollment.countDocuments();

        const recentEnrollments = await Enrollment.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('student', 'name email avatar')
            .populate('course', 'title');

        const recentBookings = await require('../models/Booking').find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('student', 'name email avatar')
            .populate('liveClass', 'title');

        res.json({
            metrics: {
                totalStudents,
                totalInstructors,
                totalCourses,
                totalEnrollments
            },
            recentEnrollments,
            recentBookings
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/student
router.get('/student', requireAuth, authorizeRoles('student', 'admin'), async (req, res, next) => {
    try {
        const studentId = req.user.id;

        const enrollments = await Enrollment.find({ student: studentId })
            .populate('course', 'title thumbnail level curriculum')
            .sort({ createdAt: -1 });

        const activeCoursesCount = enrollments.filter(e => e.status === 'active').length;
        const completedCoursesCount = enrollments.filter(e => e.status === 'completed').length;

        res.json({
            metrics: {
                totalEnrolled: enrollments.length,
                activeCourses: activeCoursesCount,
                completedCourses: completedCoursesCount
            },
            enrollments
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/dashboard/instructor
router.get('/instructor', requireAuth, authorizeRoles('instructor', 'admin'), async (req, res, next) => {
    try {
        const instructorId = req.user.id;

        const myCourses = await Course.find({ instructor: instructorId });
        const courseIds = myCourses.map(c => c._id);

        const enrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });

        res.json({
            metrics: {
                totalCourses: myCourses.length,
                totalStudentsEnrolled: enrollments
            },
            recentCourses: myCourses.slice(0, 5)
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
