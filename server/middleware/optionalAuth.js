const { verifyToken } = require('../utils/jwt');

// Same as auth.js but never rejects the request. If a valid Bearer token is
// present, req.user is populated; otherwise req.user stays undefined and the
// request proceeds normally. Useful for routes that support (but don't
// require) authenticated access, keeping backwards compatibility with
// existing unauthenticated clients.
function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (token && scheme === 'Bearer') {
    try {
      req.user = verifyToken(token);
    } catch (err) {
      // Invalid/expired token - ignore and treat as unauthenticated rather
      // than failing the request.
      req.user = undefined;
    }
  }

  next();
}

module.exports = optionalAuth;
