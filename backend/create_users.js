const mongoose = require('mongoose');
const User = require('./models/User');

const DB_URI = 'mongodb://localhost:27017/francais-pro';

async function createTestUsers() {
    try {
        await mongoose.connect(DB_URI);
        console.log('Connected to DB');

        const usersToCreate = [
            {
                name: 'Test Tutor',
                email: 'tutor@francaispro.com',
                passwordHash: 'password123',
                role: 'instructor'
            },
            {
                name: 'Test Student',
                email: 'student@francaispro.com',
                passwordHash: 'password123',
                role: 'student'
            }
        ];

        for (const userData of usersToCreate) {
            let existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const newUser = new User(userData);
                await newUser.save();
                console.log(`Created ${userData.role}: ${userData.email}`);
            } else {
                console.log(`User ${userData.email} already exists. Updating password...`);
                existingUser.passwordHash = userData.passwordHash;
                await existingUser.save();
                console.log(`Updated password for ${userData.email}`);
            }
        }

    } catch (err) {
        console.error('Error creating users:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from DB');
    }
}

createTestUsers();
