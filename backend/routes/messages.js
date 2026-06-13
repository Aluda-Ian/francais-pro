const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/auth');
const Message = require('../models/Message');
const User = require('../models/User');

// ============================================================
// GET /api/messages/contacts
// Get a list of users the current user has chatted with
// ============================================================
router.get('/contacts', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find all messages where the user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    // Extract unique contacts and keep track of the latest message
    const contactsMap = new Map();

    for (let msg of messages) {
      const isSender = msg.sender.toString() === userId.toString();
      const contactId = isSender ? msg.receiver.toString() : msg.sender.toString();

      if (!contactsMap.has(contactId)) {
        contactsMap.set(contactId, {
          contactId,
          latestMessage: msg,
          unreadCount: 0
        });
      }

      // Count unread messages from this contact
      if (!isSender && !msg.read) {
        contactsMap.get(contactId).unreadCount += 1;
      }
    }

    // Fetch user details for the contacts
    const contactIds = Array.from(contactsMap.keys());
    const users = await User.find({ _id: { $in: contactIds } }, 'name email avatar role');

    const result = users.map(u => {
      const data = contactsMap.get(u._id.toString());
      return {
        user: u,
        latestMessage: data.latestMessage,
        unreadCount: data.unreadCount
      };
    });

    // Sort by latest message date
    result.sort((a, b) => new Date(b.latestMessage.createdAt) - new Date(a.latestMessage.createdAt));

    res.json({ contacts: result });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/messages/search
// Search for a user to start a chat
// ============================================================
router.get('/search', authMiddleware, async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ users: [] });

    // Only search students and instructors
    const users = await User.find({
      $and: [
        { _id: { $ne: req.user._id } },
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    }).limit(10).select('name email avatar role');

    res.json({ users });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/messages/:userId
// Get chat history with a specific user
// ============================================================
router.get('/:userId', authMiddleware, async (req, res, next) => {
  try {
    const myId = req.user._id;
    const otherId = req.params.userId;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(otherId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: otherId },
        { sender: otherId, receiver: myId }
      ]
    }).sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { sender: otherId, receiver: myId, read: false },
      { $set: { read: true } }
    );

    res.json({ messages });
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/messages
// Send a new message
// ============================================================
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { receiver, content } = req.body;
    const sender = req.user._id;

    if (!receiver || !content) {
      return res.status(400).json({ error: 'Receiver and content are required' });
    }

    const newMessage = new Message({
      sender,
      receiver,
      content
    });

    await newMessage.save();

    res.status(201).json({ message: newMessage });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
