const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const LiveClass = require('../models/LiveClass');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { addToStudentCalendar, cancelCalendarEvent, updateCalendarEvent } = require('../utils/googleCalendar');
const { sendBookingConfirmation } = require('../utils/emailService');

// ============================================================
// POST /api/bookings — Book a live class
// ============================================================
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { liveClassId } = req.body;
    const student = req.user;

    // 1. Fetch the live class
    const liveClass = await LiveClass.findById(liveClassId)
      .populate('instructor', 'name email');

    if (!liveClass) return res.status(404).json({ error: 'Live class not found.' });
    if (liveClass.status !== 'scheduled') {
      return res.status(400).json({ error: `Cannot book a class that is ${liveClass.status}.` });
    }
    const minutesUntilStart = (new Date(liveClass.scheduledAt) - new Date()) / (1000 * 60);
    if (minutesUntilStart < 30) {
      return res.status(400).json({
        error: 'Bookings must be made at least 30 minutes before the class starts.',
      });
    }
    if (liveClass.isFull) {
      return res.status(409).json({ error: 'This class is fully booked. Please choose another session.' });
    }

    // 2. Check if already booked
    const existingBooking = await Booking.findOne({ student: student._id, liveClass: liveClassId });
    if (existingBooking) {
      return res.status(409).json({ error: 'You have already booked this class.' });
    }

    // 2b. Fetch user and verify subscription limits
    const user = await User.findById(student._id).populate('subscription');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (!user.subscription) {
      return res.status(403).json({
        error: 'You do not have an active subscription. Please subscribe to a plan to book live classes.'
      });
    }

    if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < new Date()) {
      return res.status(403).json({
        error: 'Your subscription plan has expired. Please renew or upgrade your plan to book live classes.'
      });
    }

    const limit = user.subscription.liveClassLimit;
    if (limit !== -1 && user.liveClassesBookedCount >= limit) {
      return res.status(403).json({
        error: `You have reached your subscription's live class booking limit of ${limit} classes. Please upgrade your plan to book more classes.`
      });
    }

    // 3. Add student to live class
    liveClass.enrolledStudents.push(student._id);
    await liveClass.save();

    // 4. Create booking record
    const booking = new Booking({
      student: student._id,
      liveClass: liveClassId,
      status: 'confirmed',
      amountPaid: liveClass.price,
      currency: liveClass.currency,
      paymentStatus: liveClass.isFree ? 'free' : 'paid',
    });

    // 5. Add event to student's Google Calendar (if they have OAuth tokens)
    const studentWithTokens = await User.findById(student._id).select('+googleAccessToken +googleRefreshToken');
    if (studentWithTokens?.googleAccessToken && liveClass.googleMeetLink) {
      try {
        const endTime = new Date(liveClass.scheduledAt.getTime() + liveClass.durationMinutes * 60 * 1000);
        const studentEventId = await addToStudentCalendar({
          studentAccessToken: studentWithTokens.googleAccessToken,
          studentRefreshToken: studentWithTokens.googleRefreshToken,
          title: `Français Pro: ${liveClass.title}`,
          description: `${liveClass.description || liveClass.topic || ''}\nInstructor: ${liveClass.instructor?.name}`,
          startTime: liveClass.scheduledAt,
          endTime,
          meetLink: liveClass.googleMeetLink,
        });
        if (studentEventId) booking.studentCalendarEventId = studentEventId;
      } catch (calErr) {
        console.warn('[Booking] Student calendar update failed (non-critical):', calErr.message);
      }
    }

    // Sync attendee list to instructor's Google Calendar event if it exists
    if (liveClass.googleCalendarEventId) {
      try {
        const enrolledUsers = await User.find({ _id: { $in: liveClass.enrolledStudents } }).select('email');
        const attendeeEmails = enrolledUsers.map(u => u.email);
        if (liveClass.instructor?.email) attendeeEmails.push(liveClass.instructor.email);

        await updateCalendarEvent({
          eventId: liveClass.googleCalendarEventId,
          updates: {
            attendees: attendeeEmails.map(email => ({ email }))
          }
        });
      } catch (calErr) {
        console.warn('[Booking] Instructor calendar attendee sync failed (non-critical):', calErr.message);
      }
    }

    await booking.save();

    // Increment user's live class booked count
    user.liveClassesBookedCount = (user.liveClassesBookedCount || 0) + 1;
    await user.save();

    // 6. Send confirmation email
    try {
      await sendBookingConfirmation({
        to: student.email,
        studentName: student.name,
        classTitle: liveClass.title,
        scheduledAt: liveClass.scheduledAt,
        meetLink: liveClass.googleMeetLink,
        calendarLink: liveClass.googleCalendarLink,
      });
      booking.confirmationEmailSent = true;
      booking.confirmationEmailSentAt = new Date();
      await booking.save({ validateBeforeSave: false });
    } catch (emailErr) {
      console.warn('[Booking] Confirmation email failed (non-critical):', emailErr.message);
    }

    // 7. Emit socket notification to the class room
    const io = req.app.get('io');
    if (io) {
      io.to(`class:${liveClassId}`).emit('booking-update', {
        spotsRemaining: liveClass.spotsRemaining,
        enrolledCount: liveClass.enrolledStudents.length,
      });
    }

    res.status(201).json({
      booking: {
        id: booking._id,
        status: booking.status,
        liveClass: {
          id: liveClass._id,
          title: liveClass.title,
          scheduledAt: liveClass.scheduledAt,
          meetLink: liveClass.googleMeetLink,
          calendarLink: liveClass.googleCalendarLink,
          curriculum: liveClass.curriculum,
          level: liveClass.level,
          instructor: liveClass.instructor?.name,
        },
        calendarEventAdded: !!booking.studentCalendarEventId,
        confirmationEmailSent: booking.confirmationEmailSent,
      },
      message: `🎉 Booking confirmed! Check your email for the Google Meet link.`,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/bookings — Get all bookings (Admin only)
// ============================================================
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'instructor') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    let query = {};
    if (req.user.role === 'instructor') {
      // Fetch classes of this instructor to scope the bookings
      const instructorClasses = await LiveClass.find({ instructor: req.user._id }).select('_id');
      const classIds = instructorClasses.map(c => c._id);
      query = { liveClass: { $in: classIds } };
    }

    const bookings = await Booking.find(query)
      .populate('student', 'name email')
      .populate({
        path: 'liveClass',
        select: 'title scheduledAt durationMinutes status instructor',
        populate: { path: 'instructor', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/bookings/my — Get student's bookings
// ============================================================
router.get('/my', authMiddleware, async (req, res, next) => {
  try {
    const { status, upcoming } = req.query;

    const filter = { student: req.user._id };
    if (status) filter.status = status;

    let bookings = await Booking.find(filter)
      .populate({
        path: 'liveClass',
        select: 'title scheduledAt durationMinutes curriculum level googleMeetLink status instructor',
        populate: { path: 'instructor', select: 'name avatar' },
      })
      .sort({ createdAt: -1 });

    if (upcoming === 'true') {
      bookings = bookings.filter(
        (b) => b.liveClass?.scheduledAt > new Date() && b.liveClass?.status === 'scheduled'
      );
    }

    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/bookings/:id/join — Get (fresh) Meet link for a booking
// ============================================================
router.get('/:id/join', authMiddleware, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id })
      .populate('liveClass', 'googleMeetLink scheduledAt durationMinutes status title');

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.status === 'cancelled') return res.status(400).json({ error: 'This booking was cancelled.' });

    const liveClass = booking.liveClass;

    // Class must be within 15 minutes of starting or ongoing
    const now = new Date();
    const classStart = new Date(liveClass.scheduledAt);
    const minutesUntilStart = (classStart - now) / (1000 * 60);

    if (minutesUntilStart > 15 && liveClass.status !== 'ongoing') {
      return res.status(400).json({
        error: 'The class hasn\'t started yet.',
        minutesUntilStart: Math.round(minutesUntilStart),
        classStart: liveClass.scheduledAt,
      });
    }

    if (!liveClass.googleMeetLink) {
      return res.status(503).json({ error: 'Google Meet link is not available yet. Please contact support.' });
    }

    // Log join time
    booking.joinedAt = booking.joinedAt || now;
    await booking.save({ validateBeforeSave: false });

    res.json({
      meetLink: liveClass.googleMeetLink,
      classTitle: liveClass.title,
      joinedAt: booking.joinedAt,
    });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/bookings/:id — Cancel a booking
// ============================================================
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, student: req.user._id })
      .populate('liveClass');

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'Booking is already cancelled.' });
    }

    const liveClass = booking.liveClass;

    // Check cancellation policy: must cancel at least 30 minutes before
    const minutesUntilClass = (new Date(liveClass.scheduledAt) - new Date()) / (1000 * 60);
    if (minutesUntilClass < 30) {
      return res.status(400).json({
        error: 'Cancellations must be made at least 30 minutes before the class starts.',
      });
    }

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || 'Student cancelled';
    await booking.save();

    // Decrement user's live class booked count
    const user = await User.findById(req.user._id);
    if (user && user.liveClassesBookedCount > 0) {
      user.liveClassesBookedCount -= 1;
      await user.save();
    }

    // Remove student from live class
    liveClass.enrolledStudents = liveClass.enrolledStudents.filter(
      (id) => id.toString() !== req.user._id.toString()
    );
    await liveClass.save();

    // Sync Google Calendars on cancellation
    const studentWithTokens = await User.findById(req.user._id).select('+googleAccessToken +googleRefreshToken');
    if (booking.studentCalendarEventId && studentWithTokens?.googleAccessToken) {
      try {
        await cancelCalendarEvent(
          booking.studentCalendarEventId,
          'primary',
          studentWithTokens.googleAccessToken,
          studentWithTokens.googleRefreshToken
        );
      } catch (calErr) {
        console.warn('[Booking] Student calendar event cancel failed (non-critical):', calErr.message);
      }
    }

    if (liveClass.googleCalendarEventId) {
      try {
        const enrolledUsers = await User.find({ _id: { $in: liveClass.enrolledStudents } }).select('email');
        const attendeeEmails = enrolledUsers.map(u => u.email);
        const instructorUser = await User.findById(liveClass.instructor).select('email');
        if (instructorUser?.email) attendeeEmails.push(instructorUser.email);

        await updateCalendarEvent({
          eventId: liveClass.googleCalendarEventId,
          updates: {
            attendees: attendeeEmails.map(email => ({ email }))
          }
        });
      } catch (calErr) {
        console.warn('[Booking] Instructor calendar attendee sync failed (non-critical):', calErr.message);
      }
    }

    res.json({ message: 'Booking cancelled successfully.', refundEligible: liveClass.price > 0 });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
