'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const economy = require('../services/economy');
const { LEAGUE_TIERS, LEAGUE_COHORT_SIZE, LEAGUE_PROMOTE, LEAGUE_RELEGATE } = require('../services/catalog');

const router = express.Router();

function mondayUTC(d = new Date()) {
  const x = new Date(d);
  const day = x.getUTCDay() || 7;
  x.setUTCDate(x.getUTCDate() - day + 1);
  return x.toISOString().slice(0, 10);
}

function tierIndex(tier) {
  const i = LEAGUE_TIERS.indexOf(tier);
  return i < 0 ? 0 : i;
}

// Lazily assign the user to a cohort for the current week.
async function ensureMembership(userId) {
  const week = mondayUTC();
  const existing = await db.query(
    `SELECT lm.id, lm.league_id, l.tier FROM league_members lm
     JOIN leagues l ON l.id = lm.league_id
     WHERE lm.user_id = $1 AND l.week_start = $2`,
    [userId, week]
  );
  if (existing.rows.length) return existing.rows[0];

  // Determine tier: carry from last week's result, else bronze
  const last = await db.query(
    `SELECT l.tier, lm.result FROM league_members lm
     JOIN leagues l ON l.id = lm.league_id
     WHERE lm.user_id = $1 AND l.week_start < $2
     ORDER BY l.week_start DESC LIMIT 1`,
    [userId, week]
  );
  let tier = 'bronze';
  if (last.rows.length) {
    const prev = last.rows[0];
    let idx = tierIndex(prev.tier);
    if (prev.result === 'promoted') idx = Math.min(LEAGUE_TIERS.length - 1, idx + 1);
    else if (prev.result === 'relegated') idx = Math.max(0, idx - 1);
    tier = LEAGUE_TIERS[idx];
  }

  // Find a cohort in this tier+week with room, else create new
  const cohorts = await db.query(
    `SELECT l.id, l.cohort_index, COUNT(lm.id) AS n
     FROM leagues l LEFT JOIN league_members lm ON lm.league_id = l.id
     WHERE l.tier = $1 AND l.week_start = $2
     GROUP BY l.id, l.cohort_index
     ORDER BY l.cohort_index`,
    [tier, week]
  );
  let leagueId = null;
  for (const c of cohorts.rows) {
    if (Number(c.n) < LEAGUE_COHORT_SIZE) { leagueId = c.id; break; }
  }
  if (!leagueId) {
    const nextIdx = cohorts.rows.length;
    const ins = await db.query(
      `INSERT INTO leagues (tier, week_start, cohort_index) VALUES ($1, $2, $3)
       ON CONFLICT (tier, week_start, cohort_index) DO UPDATE SET tier = EXCLUDED.tier
       RETURNING id`,
      [tier, week, nextIdx]
    );
    leagueId = ins.rows[0].id;
  }

  await db.query(
    `INSERT INTO league_members (league_id, user_id) VALUES ($1, $2)
     ON CONFLICT (league_id, user_id) DO NOTHING`,
    [leagueId, userId]
  );
  return { league_id: leagueId, tier };
}

// GET /api/leagues/me
router.get('/me', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  try {
    const membership = await ensureMembership(userId);
    const { rows } = await db.query(
      `SELECT u.id, u.username, u.name, u.level, u.weekly_xp,
              cc.color AS climber_color
       FROM league_members lm
       JOIN users u ON u.id = lm.user_id
       LEFT JOIN climber_customizations cc ON cc.student_id = u.id
       WHERE lm.league_id = $1
       ORDER BY u.weekly_xp DESC, u.level DESC`,
      [membership.league_id]
    );
    const members = rows.map((r, i) => ({
      id: r.id, username: r.username, name: r.name, level: r.level,
      weekly_xp: r.weekly_xp || 0, climber_color: r.climber_color, rank: i + 1,
    }));
    const myRank = members.find((m) => m.id === userId)?.rank || null;
    return res.json({
      tier: membership.tier,
      weekStart: mondayUTC(),
      members,
      myRank,
      promoteCount: LEAGUE_PROMOTE,
      relegateCount: LEAGUE_RELEGATE,
    });
  } catch (e) {
    console.error('leagues me error:', e.message);
    return res.status(500).json({ error: 'Failed to load league' });
  }
});

// POST /api/leagues/settle  (secret-guarded; promote/relegate last completed week)
router.post('/settle', async (req, res) => {
  if (req.headers['x-settle-secret'] !== (process.env.SETTLE_SECRET || 'summit-settle')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const week = mondayUTC();
  try {
    // Settle all leagues from before the current week that are not yet settled
    const leagues = await db.query(
      `SELECT id, tier FROM leagues WHERE week_start < $1`, [week]
    );
    let settled = 0;
    for (const lg of leagues.rows) {
      const members = await db.query(
        `SELECT lm.id, lm.user_id, lm.result, u.weekly_xp
         FROM league_members lm JOIN users u ON u.id = lm.user_id
         WHERE lm.league_id = $1 AND lm.result IS NULL
         ORDER BY u.weekly_xp DESC`,
        [lg.id]
      );
      if (!members.rows.length) continue;
      const n = members.rows.length;
      for (let i = 0; i < n; i++) {
        const m = members.rows[i];
        let result = 'stayed';
        if (i < LEAGUE_PROMOTE) result = 'promoted';
        else if (i >= n - LEAGUE_RELEGATE) result = 'relegated';
        await db.query(
          `UPDATE league_members SET final_rank = $2, result = $3, weekly_xp = $4 WHERE id = $1`,
          [m.id, i + 1, result, m.weekly_xp || 0]
        );
        // Reward top finishers
        if (i < LEAGUE_PROMOTE) {
          await economy.grantRewards(m.user_id, { coins: 200 - i * 20, gems: i === 0 ? 5 : 2, reason: 'league', refId: lg.tier });
        }
        settled++;
      }
    }
    return res.json({ settled });
  } catch (e) {
    console.error('league settle error:', e.message);
    return res.status(500).json({ error: 'Failed to settle' });
  }
});

module.exports = router;
