require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// --- Route Imports ---
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const bookingRoutes = require('./routes/bookings');
const calendarRoutes = require('./routes/calendar');
const contactRoutes = require('./routes/contact');
const liveClassRoutes = require('./routes/liveClasses');
const blogRoutes = require('./routes/blogs');
const tutorRoutes = require('./routes/tutors');
const dashboardRoutes = require('./routes/dashboard');
const settingsRoutes = require('./routes/settings');

// --- App Init ---
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// --- Connect to MongoDB ---
connectDB();

// --- Global Rate Limiter ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { error: 'Too many requests, please try again later.' },
});

// --- Middleware ---
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// --- Health Check ---
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    platform: 'Français Pro API',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/live-classes', liveClassRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);

// --- Socket.io: Real-time notifications ---
io.on('connection', (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Join a room tied to a specific live class
  socket.on('join-class-room', (classId) => {
    socket.join(`class:${classId}`);
    console.log(`[Socket] ${socket.id} joined room class:${classId}`);
  });

  // Notify room when class is about to start (called from booking route)
  socket.on('class-starting-soon', ({ classId, meetLink }) => {
    io.to(`class:${classId}`).emit('class-alert', {
      type: 'starting-soon',
      message: 'Your class starts in 15 minutes!',
      meetLink,
    });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Export io for use in routes
app.set('io', io);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// --- Error Handler ---
app.use(errorHandler);

// --- Start Server ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║       🇫🇷  Français Pro API           ║
  ║  Server running on port ${PORT}          ║
  ║  Environment: ${process.env.NODE_ENV || 'development'}          ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = { app, server };
// Trigger reload for new DB URI
