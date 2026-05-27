const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../services/db');

const router = express.Router();

function verifyToken(token) {
  const secrets = [process.env.CLERK_SECRET_KEY, process.env.JWT_SECRET].filter(Boolean);
  for (const secret of secrets) {
    try { return jwt.verify(token, secret); } catch (_) {}
  }
  throw new Error('Invalid or expired token');
}

// POST /auth/sync — upsert user from Clerk JWT
router.post('/sync', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  let payload;
  try { payload = verifyToken(authHeader.slice(7)); } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  const clerkId = payload.sub || payload.id;
  if (!clerkId) return res.status(400).json({ error: 'Token missing subject claim' });

  const email = payload.email || payload.email_addresses?.[0]?.email_address || null;
  const name = payload.name || [payload.first_name, payload.last_name].filter(Boolean).join(' ') || null;
  const role = payload.role || 'teacher';

  try {
    const { rows } = await db.query(
      `INSERT INTO users (clerk_id, email, name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (clerk_id) DO UPDATE
         SET email = EXCLUDED.email, name = COALESCE(EXCLUDED.name, users.name)
       RETURNING *`,
      [clerkId, email, name, role]
    );
    return res.json({ user: rows[0] });
  } catch (e) {
    console.error('auth/sync error:', e.message);
    return res.status(500).json({ error: 'Failed to sync user' });
  }
});

// GET /auth/me — return current user record
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing Authorization header' });
  }

  let payload;
  try { payload = verifyToken(authHeader.slice(7)); } catch (e) {
    return res.status(401).json({ error: e.message });
  }

  const clerkId = payload.sub || payload.id;
  try {
    const { rows } = await db.query('SELECT * FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
    if (!rows[0]) return res.status(404).json({ error: 'User not found — call /auth/sync first' });
    return res.json({ user: rows[0] });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
