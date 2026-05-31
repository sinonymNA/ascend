'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

// ─── Achievement definitions ──────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { key: 'first_mastery',  label: 'Climber',          check: (u) => u.total_mastered >= 1 },
  { key: 'mastery_10',     label: 'Finding the Trail', check: (u) => u.total_mastered >= 10 },
  { key: 'mastery_50',     label: 'Alpine Trekker',    check: (u) => u.total_mastered >= 50 },
  { key: 'mastery_100',    label: 'Century Climber',   check: (u) => u.total_mastered >= 100 },
  { key: 'mastery_500',    label: 'Peak Performer',    check: (u) => u.total_mastered >= 500 },
  { key: 'summit_1',       label: 'First Summit',      check: (u) => u.sessions_summited >= 1 },
  { key: 'summit_5',       label: 'Summit Veteran',    check: (u) => u.sessions_summited >= 5 },
  { key: 'level_5',        label: 'Elevating',         check: (u) => u.level >= 5 },
  { key: 'level_10',       label: 'Summit Master',     check: (u) => u.level >= 10 },
  { key: 'streak_best_10', label: 'Unstoppable',       check: (u) => u.all_time_streak >= 10 },
  { key: 'week_50',        label: 'Weekly Warrior',    check: (u) => u.weekly_total >= 50 },
];

async function checkAndAwardAchievements(userId, stats, existingAchievements) {
  const earned = new Set(existingAchievements.map((a) => a.achievement));
  const newlyEarned = [];

  for (const ach of ACHIEVEMENTS) {
    if (earned.has(ach.key)) continue;
    if (ach.check(stats)) {
      try {
        await db.query(
          'INSERT INTO user_achievements (user_id, achievement) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [userId, ach.key]
        );
        newlyEarned.push({ key: ach.key, label: ach.label });
      } catch (_) {}
    }
  }
  return newlyEarned;
}

// POST /api/progress/solo — save solo session results
router.post('/solo', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { setId, masteredCount, questionsTotal, xpEarned, streakBest, summited } = req.body;
  if (!setId) return res.status(400).json({ error: 'setId is required' });

  const mastered = parseInt(masteredCount, 10) || 0;
  const total    = parseInt(questionsTotal, 10) || 0;
  const xp       = parseInt(xpEarned, 10) || 0;
  const streak   = parseInt(streakBest, 10) || 0;

  try {
    // Upsert subject progress
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

    // Accumulate XP, weekly_xp, and level
    if (xp > 0) {
      const monday = (() => {
        const d = new Date();
        const day = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() - day + 1);
        return d.toISOString().slice(0, 10);
      })();

      // Try full update with weekly_xp columns; fall back to basic xp+level if those columns don't exist
      try {
        await db.query(
          `UPDATE users SET
             xp       = xp + $1,
             level    = GREATEST(1, FLOOR((xp + $1) / 500) + 1),
             weekly_xp = CASE
               WHEN weekly_xp_reset_at IS NULL OR weekly_xp_reset_at < $3::date
               THEN $1
               ELSE weekly_xp + $1
             END,
             weekly_xp_reset_at = $3::date
           WHERE id = $2`,
          [xp, userId, monday]
        );
      } catch (_) {
        await db.query(
          `UPDATE users SET
             xp    = xp + $1,
             level = GREATEST(1, FLOOR((xp + $1) / 500) + 1)
           WHERE id = $2`,
          [xp, userId]
        );
      }
    }

    // Fetch updated user + aggregate stats for achievement checks
    const { rows: userRows } = await db.query(
      'SELECT xp, level, weekly_xp FROM users WHERE id = $1',
      [userId]
    );
    const user = userRows[0] || {};

    const { rows: statsRows } = await db.query(
      `SELECT
         COALESCE(SUM(mastered_count), 0)  AS total_mastered,
         COALESCE(MAX(streak_best), 0)     AS all_time_streak,
         COALESCE(SUM(sessions_count), 0)  AS sessions_count
       FROM user_subject_progress WHERE user_id = $1`,
      [userId]
    );
    const aggStats = statsRows[0] || {};

    // Count how many subjects have been summited (mastered_count >= questions_total)
    const { rows: summitRows } = await db.query(
      `SELECT COUNT(*) AS cnt FROM user_subject_progress
       WHERE user_id = $1 AND mastered_count >= questions_total AND questions_total > 0`,
      [userId]
    );

    const stats = {
      total_mastered:   parseInt(aggStats.total_mastered, 10),
      all_time_streak:  parseInt(aggStats.all_time_streak, 10),
      sessions_summited: parseInt(summitRows[0]?.cnt || 0, 10) + (summited ? 1 : 0),
      level:            user.level || 1,
      weekly_total:     user.weekly_xp || 0,
    };

    const { rows: achRows } = await db.query(
      'SELECT achievement FROM user_achievements WHERE user_id = $1',
      [userId]
    );
    const newAchievements = await checkAndAwardAchievements(userId, stats, achRows);

    return res.json({
      ok: true,
      xp: user.xp,
      level: user.level,
      newAchievements,
    });
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

// GET /api/progress/achievements — return user achievements
router.get('/achievements', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  try {
    const { rows } = await db.query(
      'SELECT achievement, earned_at FROM user_achievements WHERE user_id = $1 ORDER BY earned_at',
      [userId]
    );
    return res.json({ achievements: rows });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

module.exports = router;
