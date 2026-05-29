const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

// POST /api/progress/solo — save solo session results (requireAuth)
router.post('/solo', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { setId, masteredCount, questionsTotal, xpEarned, streakBest } = req.body;
  if (!setId) return res.status(400).json({ error: 'setId is required' });

  const mastered = parseInt(masteredCount, 10) || 0;
  const total    = parseInt(questionsTotal, 10) || 0;
  const xp       = parseInt(xpEarned, 10) || 0;
  const streak   = parseInt(streakBest, 10) || 0;

  try {
    await db.query(
      `INSERT INTO user_subject_progress
         (user_id, set_id, mastered_count, questions_total, xp_earned, streak_best,
          sessions_count, last_practiced_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, NOW(), NOW())
       ON CONFLICT (user_id, set_id) DO UPDATE SET
         mastered_count    = GREATEST(user_subject_progress.mastered_count, EXCLUDED.mastered_count),
         questions_total   = EXCLUDED.questions_total,
         xp_earned         = user_subject_progress.xp_earned + EXCLUDED.xp_earned,
         streak_best       = GREATEST(user_subject_progress.streak_best, EXCLUDED.streak_best),
         sessions_count    = user_subject_progress.sessions_count + 1,
         last_practiced_at = NOW(),
         updated_at        = NOW()`,
      [userId, setId, mastered, total, xp, streak]
    );

    // Accumulate XP on user and recalculate level
    if (xp > 0) {
      await db.query(
        `UPDATE users SET
           xp    = xp + $1,
           level = GREATEST(1, FLOOR((xp + $1) / 500) + 1)
         WHERE id = $2`,
        [xp, userId]
      );
    }

    const { rows } = await db.query('SELECT xp, level FROM users WHERE id = $1', [userId]);
    return res.json({ ok: true, xp: rows[0]?.xp, level: rows[0]?.level });
  } catch (e) {
    console.error('progress/solo POST error:', e.message);
    return res.status(500).json({ error: 'Failed to save progress' });
  }
});

// GET /api/progress/solo — return all subject progress for current user
router.get('/solo', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  try {
    const { rows } = await db.query(
      `SELECT usp.*, qs.title AS set_title, qs.subject AS set_subject
       FROM user_subject_progress usp
       JOIN question_sets qs ON qs.id = usp.set_id
       WHERE usp.user_id = $1
       ORDER BY usp.last_practiced_at DESC NULLS LAST`,
      [userId]
    );
    return res.json({ progress: rows });
  } catch (e) {
    console.error('progress/solo GET error:', e.message);
    return res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

module.exports = router;
