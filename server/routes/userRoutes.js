const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

function sanitizeUser(user) {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.pin;
  return userObj;
}

// Register a new user OR log in an existing one (the frontend uses a single
// combined flow: if the phone already exists this behaves as a login).
// This endpoint stays PUBLIC (no auth middleware) since it's how users
// obtain their token in the first place.
router.post('/register', async (req, res) => {
  try {
    const { phone, name, language, role, pin } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone is required' });
    }

    let user = await User.findOne({ phone });

    if (user) {
      // --- Login path ---
      if (!pin) {
        return res.status(400).json({ error: 'PIN is required' });
      }

      let pinMatches = false;
      try {
        pinMatches = await bcrypt.compare(pin, user.pin);
      } catch (compareErr) {
        pinMatches = false;
      }

      if (!pinMatches) {
        // Support legacy plaintext PINs stored before bcrypt hashing was
        // introduced. If it matches the plaintext value, transparently
        // rehash it so future logins use bcrypt.
        if (user.pin === pin) {
          pinMatches = true;
          user.pin = await bcrypt.hash(pin, SALT_ROUNDS);
        }
      }

      if (!pinMatches) {
        return res.status(401).json({ error: 'Invalid PIN' });
      }

      // Only update fields if provided (for profile update, not login)
      if (name) user.name = name;
      if (language) user.language = language;
      if (role && !user.role) user.role = role; // Only set role if not set
      await user.save();

      const token = signToken(user);
      return res.json({ ...sanitizeUser(user), token });
    }

    // --- Registration path ---
    if (!role || !pin) {
      return res.status(400).json({ error: 'Role and PIN are required for first time registration' });
    }
    const hashedPin = await bcrypt.hash(pin, SALT_ROUNDS);
    user = new User({ phone, name, language, role, pin: hashedPin });
    await user.save();

    const token = signToken(user);
    res.status(201).json({ ...sanitizeUser(user), token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user', details: error.message });
  }
});

// Check if user exists by phone. Public.
router.get('/check', async (req, res) => {
  const { phone } = req.query;
  if (!phone) return res.json({ exists: false });
  const user = await User.findOne({ phone });
  res.json({ exists: !!user });
});

// Get the currently authenticated user's profile.
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile', details: error.message });
  }
});

// Update the currently authenticated user's profile.
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, language, farmName, email, theme } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name !== undefined) user.name = name;
    if (language !== undefined) user.language = language;
    if (farmName !== undefined) user.farmName = farmName;
    if (email !== undefined) user.email = email;
    if (theme !== undefined) user.theme = theme;

    await user.save();
    res.json(sanitizeUser(user));
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
});

module.exports = router;
