const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { authorize } = require('../middleware/auth');
const LiveClass = require('../models/LiveClass');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { createMeetSession, cancelCalendarEvent } = require('../utils/googleCalendar');
const { sendBookingConfirmation, sendCancellationNotice } = require('../utils/emailService');

// ============================================================
// GET /api/live-classes — Browse available live classes
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { curriculum, level, status = 'scheduled', page = 1, limit = 12 } = req.query;

    const filter = { status };
    if (curriculum) filter.curriculum = curriculum;
    if (level) filter.level = level;

    // Only upcoming classes for public view
    filter.scheduledAt = { $gte: new Date() };

    const classes = await LiveClass.find(filter)
      .populate('instructor', 'name avatar bio qualifications')
      .sort({ scheduledAt: 1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await LiveClass.countDocuments(filter);

    res.json({
      liveClasses: classes,
      pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/live-classes/:id — Get single live class
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id)
      .populate('instructor', 'name avatar bio qualifications specializations')
      .populate('relatedCourse', 'title slug thumbnail');

    if (!liveClass) return res.status(404).json({ error: 'Live class not found.' });
    res.json({ liveClass });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/live-classes — Create live class (instructor/admin)
// ============================================================
router.post('/', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const {
      title, description, topic, curriculum, level,
      scheduledAt, durationMinutes, maxStudents, price,
      isFree, relatedCourse,
    } = req.body;

    // Create the Google Meet session + Calendar event
    const startTime = new Date(scheduledAt);
    const endTime = new Date(startTime.getTime() + (durationMinutes || 60) * 60 * 1000);

    let meetLink = '';
    let googleCalendarEventId = '';
    let googleCalendarLink = '';

    try {
      const meetSession = await createMeetSession({
        title: `${curriculum} French — ${title}`,
        description: `${description || topic || ''}\n\nLevel: ${level} | Instructor: ${req.user.name}`,
        startTime,
        endTime,
        attendeeEmails: [req.user.email],
      });
      meetLink = meetSession.meetLink;
      googleCalendarEventId = meetSession.eventId;
      googleCalendarLink = meetSession.htmlLink;
    } catch (googleErr) {
      console.warn('[LiveClass] Google Calendar unavailable, creating class without Meet link:', googleErr.message);
    }

    const liveClass = new LiveClass({
      title, description, topic, curriculum, level,
      instructor: req.user._id,
      scheduledAt: startTime,
      durationMinutes: durationMinutes || 60,
      maxStudents: maxStudents || 20,
      price: isFree ? 0 : (price || 0),
      isFree: isFree || price === 0,
      relatedCourse: relatedCourse || null,
      googleMeetLink: meetLink,
      googleCalendarEventId,
      googleCalendarLink,
    });

    await liveClass.save();
    res.status(201).json({ liveClass, message: 'Live class created successfully.' });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/live-classes/:id — Cancel a class (instructor/admin)
// ============================================================
router.delete('/:id', authMiddleware, authorize('instructor', 'admin'), async (req, res, next) => {
  try {
    const liveClass = await LiveClass.findById(req.params.id);
    if (!liveClass) return res.status(404).json({ error: 'Live class not found.' });

    // Only the instructor or admin can cancel
    if (liveClass.instructor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to cancel this class.' });
    }

    const { reason } = req.body;
    liveClass.status = 'cancelled';
    liveClass.cancelledAt = new Date();
    liveClass.cancelledReason = reason || '';
    await liveClass.save();

    // Cancel Google Calendar event
    if (liveClass.googleCalendarEventId) {
      await cancelCalendarEvent(liveClass.googleCalendarEventId);
    }

    // Notify all enrolled students
    const bookings = await Booking.find({ liveClass: liveClass._id, status: 'confirmed' })
      .populate('student', 'name email');

    await Promise.allSettled(bookings.map(async (booking) => {
      await sendCancellationNotice({
        to: booking.student.email,
        studentName: booking.student.name,
        classTitle: liveClass.title,
        reason,
      });
      booking.status = 'cancelled';
      await booking.save();
    }));

    res.json({ message: `Class cancelled. ${bookings.length} student(s) notified.` });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
