const { verifyToken } = require('../utils/jwt');

// Requires a valid `Authorization: Bearer <token>` header. On success sets
// req.user = { id, phone, role } and calls next(); otherwise responds 401.
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (!token || scheme !== 'Bearer') {
    return res.status(401).json({ error: 'Authentication required. Missing or invalid Authorization header.' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // { id, phone, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

module.exports = auth;
