const express = require('express');
const jwt = require('jsonwebtoken');
const supabase = require('../services/supabase');

const router = express.Router();

/**
 * Verify a Bearer token using Clerk secret key first, falling back to JWT_SECRET.
 * Returns the decoded payload or throws.
 */
function verifyToken(token) {
  const secrets = [process.env.CLERK_SECRET_KEY, process.env.JWT_SECRET].filter(Boolean);
  for (const secret of secrets) {
    try {
      return jwt.verify(token, secret);
    } catch (_) {
      // try next
    }
  }
  throw new Error('Invalid or expired token');
}

/**
 * POST /auth/sync
 * Accepts a Clerk JWT in the Authorization header.
 * Upserts the user in the Supabase `users` table.
 */
router.post('/sync', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  const clerkId = payload.sub || payload.id;
  if (!clerkId) {
    return res.status(400).json({ error: 'Token missing subject claim' });
  }

  const email =
    payload.email ||
    (payload.email_addresses && payload.email_addresses[0]?.email_address) ||
    null;
  const name =
    payload.name ||
    [payload.first_name, payload.last_name].filter(Boolean).join(' ') ||
    null;

  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: clerkId,
        email,
        name,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'clerk_id', returning: 'representation' }
    )
    .select()
    .single();

  if (error) {
    console.error('auth/sync supabase error:', error);
    return res.status(500).json({ error: 'Failed to sync user' });
  }

  return res.json({ user: data });
});

/**
 * GET /auth/me
 * Returns the Supabase user record for the authenticated caller.
 */
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  const token = authHeader.slice(7);
  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ error: err.message });
  }

  const clerkId = payload.sub || payload.id;
  if (!clerkId) {
    return res.status(400).json({ error: 'Token missing subject claim' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'User not found — call /auth/sync first' });
  }

  return res.json({ user: data });
});

module.exports = router;
