const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, required: true },
  date: { type: Date, required: true },
  isSent: { type: Boolean, default: false },
  cropType: { type: String },
  reminderType: { type: String, enum: ['manual', 'planting', 'fertilizer', 'watering'], default: 'manual' },
  frequency: { type: String, enum: ['once', 'daily', 'weekly', 'monthly'], default: 'once' },
  nextReminder: { type: Date }
});

module.exports = mongoose.model('Reminder', reminderSchema);