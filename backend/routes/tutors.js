const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LiveClass = require('../models/LiveClass');

// ============================================================
// GET /api/tutors — Get all active tutors with filtering
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { search, country, gender, curriculum, specialization } = req.query;

    // Filter by active instructors/admins
    const filter = {
      role: { $in: ['instructor', 'admin'] },
      isActive: true
    };

    // Name or Bio search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } }
      ];
    }

    // Gender filter
    if (gender) {
      filter.gender = gender;
    }

    // Country filter
    if (country) {
      filter.country = { $regex: country, $options: 'i' };
    }

    // Specializations / Curriculum filter
    if (curriculum) {
      filter.specializations = { $regex: curriculum, $options: 'i' };
    }
    if (specialization) {
      filter.specializations = { $regex: specialization, $options: 'i' };
    }

    const tutors = await User.find(filter)
      .select('name email avatar bio country gender qualifications languages specializations createdAt')
      .sort({ name: 1 });

    // Format output
    const formattedTutors = tutors.map(tutor => tutor.toPublicProfile());

    res.json({ tutors: formattedTutors });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/tutors/:id — Get details of a single tutor
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const tutor = await User.findOne({
      _id: req.params.id,
      role: { $in: ['instructor', 'admin'] },
      isActive: true
    });

    if (!tutor) {
      return res.status(404).json({ error: 'Tutor not found.' });
    }

    res.json({ tutor: tutor.toPublicProfile() });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/tutors/:id/slots — Get upcoming booking slots for tutor
// ============================================================
router.get('/:id/slots', async (req, res, next) => {
  try {
    const slots = await LiveClass.find({
      instructor: req.params.id,
      status: 'scheduled',
      scheduledAt: { $gte: new Date() }
    })
    .sort({ scheduledAt: 1 });

    res.json({ slots });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
