const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getInstructorBusySlots } = require('../utils/googleCalendar');
const LiveClass = require('../models/LiveClass');
const Booking = require('../models/Booking');

// GET /api/calendar/slots/:instructorId — Get instructor busy slots
router.get('/slots/:instructorId', async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const timeMin = from ? new Date(from) : new Date();
    const timeMax = to ? new Date(to) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const { default: User } = require('../models/User');
    const instructor = await User.findById(req.params.instructorId).select('email');
    if (!instructor) return res.status(404).json({ error: 'Instructor not found.' });

    const busySlots = await getInstructorBusySlots({
      instructorCalendarId: instructor.email,
      timeMin,
      timeMax,
    });

    // Also get scheduled live classes for this instructor
    const scheduledClasses = await LiveClass.find({
      instructor: req.params.instructorId,
      status: 'scheduled',
      scheduledAt: { $gte: timeMin, $lte: timeMax },
    }).select('scheduledAt endAt title');

    res.json({ busySlots, scheduledClasses });
  } catch (err) { next(err); }
});

// GET /api/calendar/upcoming — Student's upcoming classes
router.get('/upcoming', authMiddleware, async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      student: req.user._id,
      status: 'confirmed',
    })
    .populate({
      path: 'liveClass',
      match: { scheduledAt: { $gte: new Date() }, status: 'scheduled' },
      select: 'title scheduledAt durationMinutes curriculum level googleMeetLink instructor',
      populate: { path: 'instructor', select: 'name avatar' },
    })
    .sort({ createdAt: 1 });

    const upcoming = bookings.filter((b) => b.liveClass).map((b) => ({
      bookingId: b._id,
      class: b.liveClass,
      bookedAt: b.createdAt,
      calendarEventAdded: !!b.studentCalendarEventId,
    }));

    res.json({ upcoming });
  } catch (err) { next(err); }
});

module.exports = router;
