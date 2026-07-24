const mongoose = require('mongoose');

const tractorLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  usageHours: Number,
  fuelUsed: Number,
  maintenanceNote: String
});

module.exports = mongoose.model('TractorLog', tractorLogSchema);