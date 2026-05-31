'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

// Get the Monday of the current ISO week
function getMondayDate() {
  const d = new Date();
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - day + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Reset weekly_xp if the reset date is before this Monday
async function maybeResetWeeklyXP(userId) {
  const monday = getMondayDate().toISOString().slice(0, 10);
  await db.query(
    `UPDATE users SET weekly_xp = 0, weekly_xp_reset_at = $2
     WHERE id = $1 AND (weekly_xp_reset_at IS NULL OR weekly_xp_reset_at < $2)`,
    [userId, monday]
  );
}

// GET /api/leaderboard/weekly — top 50 by weekly XP
router.get('/weekly', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  await maybeResetWeeklyXP(userId);

  try {
    const { rows } = await db.query(
      `SELECT id, username, name, level, weekly_xp,
              cc.color AS climber_color
       FROM users u
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE u.role = 'student' AND u.weekly_xp > 0
       ORDER BY u.weekly_xp DESC
       LIMIT 50`
    );

    // Find user's own rank
    const { rows: rankRows } = await db.query(
      `SELECT COUNT(*) + 1 AS rank
       FROM users
       WHERE role = 'student' AND weekly_xp > (SELECT weekly_xp FROM users WHERE id = $1)`,
      [userId]
    );
    const userRank = parseInt(rankRows[0]?.rank || '1', 10);

    // Get current user's own entry
    const { rows: selfRows } = await db.query(
      `SELECT id, username, name, level, weekly_xp,
              cc.color AS climber_color
       FROM users u
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE u.id = $1`,
      [userId]
    );

    return res.json({ board: rows, userRank, self: selfRows[0] || null });
  } catch (e) {
    console.error('leaderboard/weekly error:', e.message);
    return res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

// GET /api/leaderboard/weekly/friends — weekly XP, filtered to friends
router.get('/weekly/friends', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  try {
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.name, u.level, u.weekly_xp,
              cc.color AS climber_color
       FROM friendships f
       JOIN users u ON u.id = f.friend_id
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE f.user_id = $1
       UNION
       SELECT u.id, u.username, u.name, u.level, u.weekly_xp,
              cc.color AS climber_color
       FROM users u
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE u.id = $1
       ORDER BY weekly_xp DESC
       LIMIT 50`,
      [userId]
    );
    return res.json({ board: rows });
  } catch (e) {
    console.error('leaderboard/friends error:', e.message);
    return res.status(500).json({ error: 'Failed to load friends leaderboard' });
  }
});

// GET /api/leaderboard/subject/:setId — top 50 by mastered_count in a set
router.get('/subject/:setId', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { setId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.name, u.level,
              usp.mastered_count, usp.sessions_count, usp.streak_best,
              cc.color AS climber_color
       FROM user_subject_progress usp
       JOIN users u ON u.id = usp.user_id
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE usp.set_id = $1
       ORDER BY usp.mastered_count DESC
       LIMIT 50`,
      [setId]
    );

    const { rows: rankRows } = await db.query(
      `SELECT COUNT(*) + 1 AS rank
       FROM user_subject_progress
       WHERE set_id = $1 AND mastered_count > (
         SELECT COALESCE(mastered_count, 0) FROM user_subject_progress
         WHERE user_id = $2 AND set_id = $1
       )`,
      [setId, userId]
    );

    return res.json({ board: rows, userRank: parseInt(rankRows[0]?.rank || '1', 10) });
  } catch (e) {
    console.error('leaderboard/subject error:', e.message);
    return res.status(500).json({ error: 'Failed to load subject leaderboard' });
  }
});

module.exports = router;
