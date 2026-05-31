'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const economy = require('../services/economy');
const { COINS_PER_MASTERED, GEM_REWARDS, STREAK_MILESTONES, LEVEL_UNLOCK_ITEMS } = require('../services/catalog');

const router = express.Router();

// Grant streak-milestone gems idempotently (one grant per milestone ever).
async function grantStreakMilestones(userId, allTimeStreak) {
  let gems = 0;
  for (const m of STREAK_MILESTONES) {
    if (allTimeStreak < m) continue;
    const existing = await db.query(
      `SELECT 1 FROM currency_ledger WHERE user_id = $1 AND reason = 'streak_milestone' AND ref_id = $2 LIMIT 1`,
      [userId, String(m)]
    );
    if (existing.rows.length) continue;
    await economy.grantRewards(userId, { gems: GEM_REWARDS.streak_milestone, reason: 'streak_milestone', refId: String(m) });
    gems += GEM_REWARDS.streak_milestone;
  }
  return gems;
}

// Grant level-unlock cosmetics into inventory for each level newly reached.
async function grantLevelUnlocks(userId, prevLevel, newLevel) {
  for (let lvl = prevLevel + 1; lvl <= newLevel; lvl++) {
    const itemId = LEVEL_UNLOCK_ITEMS[lvl];
    if (!itemId) continue;
    await db.query(
      `INSERT INTO user_inventory (user_id, item_id, quantity, equipped) VALUES ($1, $2, 1, FALSE)
       ON CONFLICT (user_id, item_id) DO NOTHING`,
      [userId, itemId]
    );
  }
}

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
  const answered = Math.max(0, parseInt(req.body.answered, 10) || 0);
  const correct  = Math.max(0, parseInt(req.body.correct, 10) || 0);
  const prevLevel = req.dbUser.level || 1;

  try {
    // Read prior state for idempotent coin grants + summit-transition detection
    const priorRes = await db.query(
      'SELECT mastered_count, coins_awarded FROM user_subject_progress WHERE user_id = $1 AND set_id = $2',
      [userId, setId]
    );
    const priorMastered = priorRes.rows[0]?.mastered_count || 0;
    const priorCoinsAwarded = priorRes.rows[0]?.coins_awarded || 0;

    // Upsert subject progress
    const upsertRes = await db.query(
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
         updated_at        = NOW()
       RETURNING mastered_count`,
      [userId, setId, mastered, total, xp, streak]
    );
    const newMastered = upsertRes.rows[0]?.mastered_count || priorMastered;

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

    // ─── Economy: grant coins + gems (server-authoritative) ───────────────────
    let coinsEarned = 0;
    let gemsEarned = 0;
    try {
      await economy.ensureWallet(userId);

      // Coins: idempotent on mastered count for this set
      const masteredDelta = Math.max(0, newMastered - priorCoinsAwarded);
      if (masteredDelta > 0) {
        coinsEarned = COINS_PER_MASTERED * masteredDelta;
        await economy.grantRewards(userId, { coins: coinsEarned, reason: 'answer', refId: setId });
        await db.query(
          'UPDATE user_subject_progress SET coins_awarded = $3 WHERE user_id = $1 AND set_id = $2',
          [userId, setId, newMastered]
        );
      }

      // Gems: summit transition (first time fully mastering this set)
      const newlySummited = total > 0 && priorMastered < total && newMastered >= total;
      if (newlySummited) {
        await economy.grantRewards(userId, { gems: GEM_REWARDS.summit, reason: 'summit', refId: setId });
        gemsEarned += GEM_REWARDS.summit;
      }

      // Gems: each newly earned achievement
      if (newAchievements.length) {
        const g = newAchievements.length * GEM_REWARDS.achievement;
        await economy.grantRewards(userId, { gems: g, reason: 'achievement', refId: newAchievements.map((a) => a.key).join(',') });
        gemsEarned += g;
      }

      // Gems: streak milestones crossed (idempotent)
      gemsEarned += await grantStreakMilestones(userId, stats.all_time_streak);

      // Gems + cosmetic unlocks: levels gained
      const newLevel = user.level || 1;
      if (newLevel > prevLevel) {
        const g = (newLevel - prevLevel) * GEM_REWARDS.level_up;
        await economy.grantRewards(userId, { gems: g, reason: 'level_up', refId: String(newLevel) });
        gemsEarned += g;
        await grantLevelUnlocks(userId, prevLevel, newLevel);
      }

      // Advance daily quests
      await economy.advanceQuests(userId, {
        answers: answered,
        correct,
        mastered: masteredDelta,
        bestStreak: streak,
        summits: newlySummited ? 1 : 0,
      });

      // Season XP
      if (xp > 0) {
        const { SEASON } = require('../services/catalog');
        await db.query(
          `INSERT INTO user_season_progress (user_id, season_id, season_xp) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, season_id) DO UPDATE SET season_xp = user_season_progress.season_xp + $3`,
          [userId, SEASON.id, xp]
        );
      }
    } catch (econErr) {
      console.warn('economy grant skipped:', econErr.message);
    }

    const wallet = await economy.getWallet(userId).catch(() => ({ coins: 0, gems: 0 }));

    return res.json({
      ok: true,
      xp: user.xp,
      level: user.level,
      newAchievements,
      wallet,
      coinsEarned,
      gemsEarned,
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
