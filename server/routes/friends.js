'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

// GET /api/friends — list all friends with profile info
router.get('/', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  try {
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.name, u.level, u.xp, u.weekly_xp,
              u.predicted_sat, u.predicted_act, u.login_streak,
              cc.color AS climber_color
       FROM friendships f
       JOIN users u ON u.id = f.friend_id
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE f.user_id = $1
       ORDER BY u.weekly_xp DESC`,
      [userId]
    );
    return res.json({ friends: rows });
  } catch (e) {
    console.error('friends GET error:', e.message);
    return res.status(500).json({ error: 'Failed to load friends' });
  }
});

// POST /api/friends/:username — add a friend by username
router.post('/:username', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { username } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT id, username, name, level FROM users WHERE username = $1 LIMIT 1',
      [username.trim().toLowerCase()]
    );
    const friend = rows[0];
    if (!friend) return res.status(404).json({ error: 'User not found' });
    if (friend.id === userId) return res.status(400).json({ error: 'Cannot add yourself' });

    // Bidirectional friendship
    await db.query(
      `INSERT INTO friendships (user_id, friend_id) VALUES ($1, $2), ($2, $1)
       ON CONFLICT DO NOTHING`,
      [userId, friend.id]
    );

    return res.json({ ok: true, friend });
  } catch (e) {
    console.error('friends POST error:', e.message);
    return res.status(500).json({ error: 'Failed to add friend' });
  }
});

// DELETE /api/friends/:friendId — remove a friend
router.delete('/:friendId', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { friendId } = req.params;
  try {
    await db.query(
      'DELETE FROM friendships WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)',
      [userId, friendId]
    );
    return res.json({ ok: true });
  } catch (e) {
    console.error('friends DELETE error:', e.message);
    return res.status(500).json({ error: 'Failed to remove friend' });
  }
});

module.exports = router;
