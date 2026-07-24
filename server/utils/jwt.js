const jwt = require('jsonwebtoken');

// JWT secret. In production this MUST be set via the JWT_SECRET env var.
// A development fallback is provided so local/testing setups keep working,
// but a warning is logged so it's obvious this isn't safe for production.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-insecure-secret-change-me';
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set in the environment. Using an insecure development default. Set JWT_SECRET in your .env for production use.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = { signToken, verifyToken, JWT_SECRET };
