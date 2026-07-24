const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const optionalAuth = require('../middleware/optionalAuth');
const { assertOwnership, resolveUserId } = require('../middleware/ownership');

router.use(optionalAuth);

// GET /api/notifications/user/:userId - list notifications for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/notifications - create a notification
router.post('/', async (req, res) => {
  try {
    const userId = resolveUserId(req, req.body.userId);
    const { title, message } = req.body;
    if (!userId || !title || !message) {
      return res.status(400).json({ error: 'userId, title and message are required' });
    }
    if (!assertOwnership(req, res, userId)) return;

    const notification = await Notification.create({ userId, title, message });
    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST /api/notifications/mark-read - mark one (or all) notifications as read
router.post('/mark-read', async (req, res) => {
  try {
    const { notificationId, userId } = req.body;

    if (notificationId) {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' });
      }
      if (!assertOwnership(req, res, notification.userId)) return;
      notification.read = true;
      await notification.save();
      return res.json(notification);
    }

    if (userId) {
      if (!assertOwnership(req, res, userId)) return;
      await Notification.updateMany({ userId, read: false }, { $set: { read: true } });
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'notificationId or userId is required' });
  } catch (error) {
    console.error('Error marking notification(s) read:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router;
