const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const Enrollment = require('./models/Enrollment');
const Booking = require('./models/Booking');
const LiveClass = require('./models/LiveClass');

async function cleanDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/francais-pro');
        console.log('Connected to MongoDB');

        // 1. Keep specific admin/tutor users (like Aluda-Ian or specific emails)
        // Let's identify the core users by looking at existing ones
        const users = await User.find({});
        const coreEmails = ['admin@francaispro.com', 'ian@francaispro.com', 'aluda@francaispro.com', 'demo@francaispro.com']; // Adjust based on real users
        
        console.log(`Found ${users.length} total users.`);
        
        const coreUserIds = users.filter(u => 
            u.role === 'admin' || 
            u.name.toLowerCase().includes('aluda') || 
            u.name.toLowerCase().includes('ian') ||
            (u.email && u.email.includes('admin'))
        ).map(u => u._id);

        console.log(`Identified ${coreUserIds.length} core users to keep.`);

        // Delete users NOT in coreUserIds
        const userDeleteRes = await User.deleteMany({ _id: { $nin: coreUserIds } });
        console.log(`Deleted ${userDeleteRes.deletedCount} dummy users.`);

        // 2. Courses
        // Let's keep courses created by core users, delete the rest
        const courseDeleteRes = await Course.deleteMany({ instructor: { $nin: coreUserIds } });
        console.log(`Deleted ${courseDeleteRes.deletedCount} dummy courses.`);

        // 3. Enrollments & Bookings
        // Just wipe all enrollments and bookings so we start fresh, unless they belong to core users
        const enrollDeleteRes = await Enrollment.deleteMany({ student: { $nin: coreUserIds } });
        console.log(`Deleted ${enrollDeleteRes.deletedCount} dummy enrollments.`);

        const bookingDeleteRes = await Booking.deleteMany({ student: { $nin: coreUserIds } });
        console.log(`Deleted ${bookingDeleteRes.deletedCount} dummy bookings.`);

        // 4. Live Classes
        const liveClassDeleteRes = await LiveClass.deleteMany({ instructor: { $nin: coreUserIds } });
        console.log(`Deleted ${liveClassDeleteRes.deletedCount} dummy live classes.`);

        console.log('Database cleanup complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

cleanDatabase();
