const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const cropDatabase = require('../utils/cropDatabase');
const { sendCropScheduleSMS, sendSMS, sendReminderSMS, normalizeIndianPhone } = require('../utils/fast2sms');
const optionalAuth = require('../middleware/optionalAuth');
const { assertOwnership, resolveUserId } = require('../middleware/ownership');

router.use(optionalAuth);

// Test SMS endpoint for debugging.
// Protected: requires header `x-admin-key` matching process.env.ADMIN_KEY.
// If ADMIN_KEY is not configured, this endpoint is disabled entirely
// (returns 403) so it can never be hit accidentally in production.
router.post('/test-sms', async (req, res) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return res.status(403).json({ error: 'This endpoint is disabled (ADMIN_KEY is not configured on the server).' });
  }
  const providedKey = req.headers['x-admin-key'];
  if (!providedKey || providedKey !== adminKey) {
    return res.status(403).json({ error: 'Forbidden: invalid or missing x-admin-key header' });
  }

  const { mobileNumber, message } = req.body;

  if (!mobileNumber || !message) {
    return res.status(400).json({ error: 'Mobile number and message are required' });
  }

  try {
    const result = await sendSMS(mobileNumber, message);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Test SMS failed:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all available crops
router.get('/crops', (req, res) => {
  const crops = Object.keys(cropDatabase).map(key => ({
    id: key,
    name: cropDatabase[key].name
  }));
  res.json(crops);
});

// Get crop information
router.get('/crop/:cropType', (req, res) => {
  const cropType = req.params.cropType;
  const crop = cropDatabase[cropType];
  if (!crop) {
    return res.status(404).json({ error: 'Crop not found' });
  }
  res.json(crop);
});

// Create automatic reminders for a crop
router.post('/crop-schedule', async (req, res) => {
  const userId = resolveUserId(req, req.body.userId);
  const { cropType, plantingDate } = req.body;
  if (!assertOwnership(req, res, userId)) return;

  try {
    const crop = cropDatabase[cropType];
    if (!crop) {
      return res.status(404).json({ error: 'Crop not found' });
    }

    const plantingDateObj = new Date(plantingDate);
    const reminders = [];

    // Create planting reminder (as a plain object, not saved yet)
    const plantingReminder = {
      userId,
      message: `Plant ${crop.name} today`,
      date: plantingDateObj,
      cropType,
      reminderType: 'planting',
      frequency: 'once'
    };
    reminders.push(plantingReminder);

    // Create fertilizer reminders
    crop.fertilizerSchedule.forEach((schedule, index) => {
      // schedule.timing is a free-text description like "At planting" or
      // "30-35 days after planting". Try to extract a numeric day offset;
      // fall back to a sensible default (staggered every 14 days, or 0 for
      // "At planting"/similar phrasing) when no number is present so this
      // never throws.
      const timingMatch = schedule.timing && schedule.timing.match(/\d+/);
      const isAtPlanting = /at planting|pre-planting|basal/i.test(schedule.timing || '');
      const daysToAdd = timingMatch ? parseInt(timingMatch[0]) : (isAtPlanting ? 0 : index * 14);
      const reminderDate = new Date(plantingDateObj);
      reminderDate.setDate(reminderDate.getDate() + daysToAdd);
      
      const reminder = {
        userId,
        message: `${crop.name} - ${schedule.stage}: Apply ${schedule.type} (${schedule.amount})`,
        date: reminderDate,
        cropType,
        reminderType: 'fertilizer',
        frequency: 'once'
      };
      reminders.push(reminder);
    });

    // Create watering reminders (weekly for the first month)
    for (let week = 1; week <= 4; week++) {
      const wateringDate = new Date(plantingDateObj);
      wateringDate.setDate(wateringDate.getDate() + (week * 7));
      
      const reminder = {
        userId,
        message: `${crop.name} - Weekly watering schedule check`,
        date: wateringDate,
        cropType,
        reminderType: 'watering',
        frequency: 'weekly'
      };
      reminders.push(reminder);
    }

    // Save all reminders at once
    const savedReminders = await Reminder.insertMany(reminders);

    // Send SMS notification about crop schedule creation
    try {
      const user = await User.findById(userId);
      if (user && user.phone) {
        await sendCropScheduleSMS(user.phone, user.name, crop.name, savedReminders.length);
        console.log(`SMS notification sent for crop schedule creation to ${user.phone}`);
      }
    } catch (smsError) {
      console.error('Failed to send SMS notification for crop schedule:', smsError.message);
      // Don't fail the entire request if SMS fails
    }

    res.json({
      message: `Created ${savedReminders.length} reminders for ${crop.name}`,
      reminders: savedReminders
    });

  } catch (error) {
    console.error('Error creating crop schedule:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Add reminder
// NOTE: We intentionally do NOT send the actual reminder SMS here and do NOT
// set isSent=true. The reminder cron job (see index.js) is responsible for
// sending the SMS at (or after) the scheduled date/time. Sending it here
// would notify the user immediately instead of at the scheduled time, and
// marking isSent=true would cause the cron job to skip it entirely.
router.post('/add', async (req, res) => {
  const userId = resolveUserId(req, req.body.userId);
  const { message, date } = req.body;
  if (!assertOwnership(req, res, userId)) return;

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (!date) {
    return res.status(400).json({ error: 'date is required' });
  }

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) {
    return res.status(400).json({ error: 'Invalid date' });
  }

  try {
    const reminder = await Reminder.create({
      userId,
      message: String(message).trim(),
      date: parsedDate,
      reminderType: 'manual',
      isSent: false,
    });

    const user = await User.findById(userId);
    let smsStatus = { scheduled: false, sentNow: false, error: null };

    // In-app confirmation
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId,
        title: 'Reminder scheduled',
        message: `"${reminder.message}" set for ${parsedDate.toLocaleString()}`,
      });
    } catch (e) {
      /* non-fatal */
    }

    if (user && user.phone) {
      const phone = normalizeIndianPhone(user.phone);
      if (!phone) {
        smsStatus.error = `Phone "${user.phone}" is invalid. Use a 10-digit Indian number.`;
      } else {
        // Always send a short "scheduled" confirmation SMS
        try {
          const formattedDate = parsedDate.toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          await sendSMS(
            phone,
            `Hello ${user.name}! Farm.co: Reminder "${reminder.message}" scheduled for ${formattedDate}.`
          );
          smsStatus.scheduled = true;
        } catch (smsError) {
          console.error('Reminder confirmation SMS failed:', smsError.message);
          smsStatus.error = smsError.message;
        }

        // If due within 2 minutes (or already past), send the actual reminder SMS now
        const msUntilDue = parsedDate.getTime() - Date.now();
        if (msUntilDue <= 2 * 60 * 1000) {
          try {
            await sendReminderSMS(phone, user.name, reminder.message, reminder.date);
            reminder.isSent = true;
            await reminder.save();
            smsStatus.sentNow = true;
          } catch (smsError) {
            console.error('Immediate reminder SMS failed:', smsError.message);
            smsStatus.error = smsError.message;
          }
        }
      }
    } else {
      smsStatus.error = 'No phone number on your profile. Update Profile with a 10-digit mobile.';
    }

    const payload = reminder.toObject();
    payload.smsStatus = smsStatus;
    res.status(201).json(payload);
  } catch (error) {
    console.error('Error adding reminder:', error);
    res.status(500).json({ error: 'Server Error', details: error.message });
  }
});

// Manually trigger SMS for a reminder (useful for testing)
router.post('/:id/send-sms', async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    if (!assertOwnership(req, res, reminder.userId)) return;

    const user = await User.findById(reminder.userId);
    if (!user || !user.phone) {
      return res.status(400).json({
        error: 'No phone number on your account. Add a 10-digit Indian mobile in Profile.',
      });
    }

    const phone = normalizeIndianPhone(user.phone);
    if (!phone) {
      return res.status(400).json({
        error: `Invalid phone "${user.phone}". Update Profile with a 10-digit number like 9876543210.`,
      });
    }

    const result = await sendReminderSMS(phone, user.name, reminder.message, reminder.date);
    reminder.isSent = true;
    await reminder.save();

    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        userId: reminder.userId,
        title: 'Reminder SMS sent',
        message: reminder.message,
      });
    } catch (e) {
      /* ignore */
    }

    res.json({ success: true, reminder, sms: result });
  } catch (error) {
    console.error('Send-SMS endpoint failed:', error.message);
    res.status(500).json({
      error: error.message || 'Failed to send SMS. Check Fast2SMS balance and API key.',
    });
  }
});

// Get reminders for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const reminders = await Reminder.find({ userId: req.params.userId })
      .sort({ date: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// Mark reminder as sent
router.put('/:id/sent', async (req, res) => {
  try {
    const existing = await Reminder.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    if (!assertOwnership(req, res, existing.userId)) return;

    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { isSent: true },
      { new: true }
    );
    res.json(reminder);
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

module.exports = router; 