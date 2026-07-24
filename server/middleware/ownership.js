// Small helper used alongside `optionalAuth` to guard mutating routes that
// operate on a specific user's data (expenses, tractor logs, reminders,
// cart, orders, soil analyses, farmer products, ...).
//
// Behavior (kept backwards-compatible on purpose):
//   - If the request has NO authenticated user (no/invalid Bearer token),
//     the check passes through unchanged so existing/legacy clients that
//     don't send a token yet keep working exactly as before.
//   - If the request DOES have an authenticated user, their id must match
//     the resource's owner id, otherwise the request is rejected with 403.
//
// Returns true if the request may proceed, false if a response has already
// been sent (caller should `return` immediately).
function assertOwnership(req, res, ownerId) {
  if (!req.user) return true; // no token provided - allow (legacy behavior)
  if (!ownerId) return true; // nothing to compare against
  if (String(req.user.id) !== String(ownerId)) {
    res.status(403).json({ error: 'Forbidden: you may only access or modify your own data.' });
    return false;
  }
  return true;
}

// Resolves the effective userId to use for a request: prefers the
// authenticated user's id (from the token) when present, otherwise falls
// back to whatever was supplied by the client (body/params/query).
function resolveUserId(req, suppliedUserId) {
  if (req.user && req.user.id) return req.user.id;
  return suppliedUserId;
}

module.exports = { assertOwnership, resolveUserId };
