const express = require('express');
const db = require('../services/db');

const router = express.Router();

// POST /api/waitlist — save email (public, no auth required)
router.post('/', async (req, res) => {
  const { email, source = 'landing' } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  const trimmed = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return res.status(400).json({ error: 'Please enter a valid email address' });
  }

  try {
    await db.query(
      'INSERT INTO waitlist (email, source) VALUES ($1, $2)',
      [trimmed, source]
    );
    const { rows } = await db.query('SELECT COUNT(*) AS count FROM waitlist');
    return res.status(201).json({ ok: true, count: parseInt(rows[0].count, 10) });
  } catch (e) {
    if (e.code === '23505') {
      const { rows } = await db.query('SELECT COUNT(*) AS count FROM waitlist');
      return res.status(409).json({ ok: false, error: 'already_on_list', count: parseInt(rows[0].count, 10) });
    }
    console.error('waitlist POST error:', e.message);
    return res.status(500).json({ error: 'Failed to join waitlist' });
  }
});

// GET /api/waitlist/count — public count
router.get('/count', async (_req, res) => {
  try {
    const { rows } = await db.query('SELECT COUNT(*) AS count FROM waitlist');
    return res.json({ count: parseInt(rows[0].count, 10) });
  } catch (e) {
    return res.json({ count: 0 });
  }
});

module.exports = router;
