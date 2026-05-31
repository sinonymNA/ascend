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

// GET /auth/me — return current user record + update login streak
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

    const user = rows[0];
    const today = new Date().toISOString().slice(0, 10);
    const lastDate = user.last_login_date ? String(user.last_login_date).slice(0, 10) : null;

    let streakUpdate = null;
    if (lastDate !== today) {
      // Check if yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      let newStreak;
      let shieldUsed = false;
      if (lastDate === yesterdayStr) {
        newStreak = (user.login_streak || 0) + 1;
      } else if (lastDate) {
        if ((user.streak_shield_count || 0) > 0) {
          newStreak = (user.login_streak || 0) + 1;
          shieldUsed = true;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      const earnedShield = newStreak > 0 && newStreak % 7 === 0;

      // Wrapped in try/catch so missing columns don't break /auth/me entirely
      try {
        await db.query(
          `UPDATE users SET
             last_login_date   = $2,
             login_streak      = $3,
             streak_shield_count = GREATEST(0, streak_shield_count - $4) + $5
           WHERE id = $1`,
          [user.id, today, newStreak, shieldUsed ? 1 : 0, earnedShield ? 1 : 0]
        );
        streakUpdate = { newStreak, shieldUsed, earnedShield, isNewDay: true };
        user.login_streak = newStreak;
        user.last_login_date = today;
        if (shieldUsed) user.streak_shield_count = Math.max(0, (user.streak_shield_count || 0) - 1);
        if (earnedShield) user.streak_shield_count = (user.streak_shield_count || 0) + 1;
      } catch (streakErr) {
        console.warn('auth/me streak update skipped (column may not exist yet):', streakErr.message);
      }
    }

    const { password_hash: _ph, ...safeUser } = user;
    return res.json({ user: safeUser, streakUpdate });
  } catch (e) {
    console.error('auth/me error:', e.message);
    return res.status(500).json({ error: 'DB error' });
  }
});

// POST /auth/diagnostic-done — mark diagnostic as complete
router.post('/diagnostic-done', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try { payload = verifyToken(authHeader.slice(7)); } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  const clerkId = payload.sub || payload.id;
  try {
    await db.query('UPDATE users SET diagnostic_done = TRUE WHERE clerk_id = $1', [clerkId]);
    return res.json({ ok: true });
  } catch (e) {
    console.error('diagnostic-done error:', e.message);
    return res.status(500).json({ error: 'DB error' });
  }
});

// GET /me/customization  (mounted at /api/users → /api/users/me/customization)
router.get('/me/customization', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try { payload = verifyToken(authHeader.slice(7)); } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  const clerkId = payload.sub || payload.id;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
    if (!userRes.rows[0]) return res.status(404).json({ error: 'Not found' });
    const userId = userRes.rows[0].id;
    await db.query(
      `INSERT INTO climber_customizations (student_id) VALUES ($1)
       ON CONFLICT (student_id) DO NOTHING`,
      [userId]
    );
    const custRes = await db.query(
      'SELECT silhouette, color, trail_effect, flag_design FROM climber_customizations WHERE student_id = $1',
      [userId]
    );
    return res.json(custRes.rows[0] || { silhouette: 'default', color: '#F5A623', trail_effect: 'none', flag_design: 'default' });
  } catch (e) {
    console.error('customization GET error:', e.message);
    return res.status(500).json({ error: 'DB error' });
  }
});

// PATCH /me/customization  (mounted at /api/users → /api/users/me/customization)
router.patch('/me/customization', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  let payload;
  try { payload = verifyToken(authHeader.slice(7)); } catch (e) {
    return res.status(401).json({ error: e.message });
  }
  const clerkId = payload.sub || payload.id;
  const { color, silhouette, trail_effect, flag_design } = req.body;
  try {
    const userRes = await db.query('SELECT id FROM users WHERE clerk_id = $1 LIMIT 1', [clerkId]);
    if (!userRes.rows[0]) return res.status(404).json({ error: 'Not found' });
    const userId = userRes.rows[0].id;
    await db.query(
      `INSERT INTO climber_customizations (student_id, color, silhouette, trail_effect, flag_design)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (student_id) DO UPDATE SET
         color         = COALESCE($2, climber_customizations.color),
         silhouette    = COALESCE($3, climber_customizations.silhouette),
         trail_effect  = COALESCE($4, climber_customizations.trail_effect),
         flag_design   = COALESCE($5, climber_customizations.flag_design),
         updated_at    = NOW()`,
      [userId, color || null, silhouette || null, trail_effect || null, flag_design || null]
    );
    const { rows } = await db.query(
      'SELECT silhouette, color, trail_effect, flag_design FROM climber_customizations WHERE student_id = $1',
      [userId]
    );
    return res.json(rows[0]);
  } catch (e) {
    console.error('customization PATCH error:', e.message);
    return res.status(500).json({ error: 'DB error' });
  }
});

module.exports = router;
