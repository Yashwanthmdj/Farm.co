const mongoose = require('mongoose');

// User schema matches frontend registration fields: phone, name, pin, role, language
// Additional optional profile fields (email, farmName, theme) were added to
// support the profile update endpoint without breaking existing documents.
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  pin: { type: String, required: true },
  role: { type: String, enum: ['farmer', 'customer'], required: true },
  language: { type: String, default: 'en' },
  email: { type: String, default: '' },
  farmName: { type: String, default: '' },
  theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
