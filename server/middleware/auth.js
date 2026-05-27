const jwt = require('jsonwebtoken');
const db = require('../services/db');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  const secrets = [process.env.CLERK_SECRET_KEY, process.env.JWT_SECRET].filter(Boolean);

  let payload = null;
  for (const secret of secrets) {
    try { payload = jwt.verify(token, secret); break; } catch (_) {}
  }

  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = payload;

  const clerkId = payload.sub || payload.id;
  if (clerkId) {
    try {
      const { rows } = await db.query('SELECT * FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
      if (rows[0]) req.dbUser = rows[0];
    } catch (e) {
      console.error('requireAuth db error:', e.message);
    }
  }

  next();
}

module.exports = { requireAuth };
