const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../services/db');

const router = express.Router();

function verifyToken(token) {
  const secrets = [process.env.CLERK_SECRET_KEY, process.env.JWT_SECRET].filter(Boolean);
  for (const secret of secrets) {
    try { return jwt.verify(token, secret); } catch (_) {}
  }
  throw new Error('Invalid or expired token');
}

function signToken(payload) {
  const secret = process.env.JWT_SECRET || process.env.CLERK_SECRET_KEY;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign(payload, secret, { expiresIn: '30d' });
}

// POST /auth/register — username + password account creation
router.post('/register', async (req, res) => {
  const { username, password, role = 'student', name, email } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  const u = username.trim().toLowerCase();
  if (u.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
  if (!/^[a-z0-9_]+$/.test(u)) return res.status(400).json({ error: 'Username may only contain letters, numbers, and underscores' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (!['teacher', 'student'].includes(role)) return res.status(400).json({ error: 'Role must be teacher or student' });

  let passwordHash;
  try { passwordHash = await bcrypt.hash(password, 10); } catch (e) {
    return res.status(500).json({ error: 'Server error' });
  }

  const id = uuidv4();
  const clerkId = `local:${id}`;

  try {
    const { rows } = await db.query(
      `INSERT INTO users (id, clerk_id, username, password_hash, email, name, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, clerk_id, username, email, name, role, subscription, xp, level, created_at`,
      [id, clerkId, u, passwordHash, email?.trim() || null, name?.trim() || u, role]
    );
    const user = rows[0];
    let token;
    try { token = signToken({ sub: clerkId, id: user.id, role: user.role, name: user.name }); } catch (e) {
      return res.status(500).json({ error: e.message });
    }
    return res.status(201).json({ token, user });
  } catch (e) {
    if (e.code === '23505') return res.status(409).json({ error: 'Username already taken' });
    console.error('auth/register error:', e.message);
    return res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /auth/login — username + password login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

  try {
    const { rows } = await db.query(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      [username.trim().toLowerCase()]
    );
    const user = rows[0];
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

    let token;
    try { token = signToken({ sub: user.clerk_id, id: user.id, role: user.role, name: user.name }); } catch (e) {
      return res.status(500).json({ error: e.message });
    }
    const { password_hash: _ph, ...safeUser } = user;
    return res.json({ token, user: safeUser });
  } catch (e) {
    console.error('auth/login error:', e.message);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /auth/sync — upsert user from Clerk JWT (legacy / Clerk-backed accounts)
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
    if (!rows[0]) return res.status(404).json({ error: 'User not found' });
    const { password_hash: _ph, ...safeUser } = rows[0];
    return res.json({ user: safeUser });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
