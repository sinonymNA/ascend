'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const economy = require('../services/economy');
const { QUESTS } = require('../services/catalog');

const router = express.Router();
const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

function utcDate() { return new Date().toISOString().slice(0, 10); }

// GET /api/quests/today
router.get('/today', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  try {
    const rows = await economy.ensureDailyQuests(userId);
    const quests = rows.map((r) => {
      const def = QUEST_BY_ID[r.quest_id] || {};
      return {
        quest_id: r.quest_id,
        description: def.description,
        progress: r.progress,
        target: r.target,
        claimed: r.claimed,
        reward_coins: def.reward_coins || 0,
        reward_gems: def.reward_gems || 0,
        complete: r.progress >= r.target,
      };
    });
    return res.json({ quests });
  } catch (e) {
    console.error('quests today error:', e.message);
    return res.status(500).json({ error: 'Failed to load quests' });
  }
});

// POST /api/quests/claim  { quest_id }
router.post('/claim', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const { quest_id } = req.body;
  const def = QUEST_BY_ID[quest_id];
  if (!def) return res.status(400).json({ error: 'Unknown quest' });
  const today = utcDate();

  try {
    // Verify completion and not yet claimed, then mark claimed atomically
    const upd = await db.query(
      `UPDATE user_daily_quests SET claimed = TRUE
       WHERE user_id = $1 AND quest_id = $2 AND quest_date = $3
         AND claimed = FALSE AND progress >= target
       RETURNING id`,
      [userId, quest_id, today]
    );
    if (!upd.rows.length) return res.status(400).json({ error: 'Quest not claimable' });

    await economy.grantRewards(userId, {
      coins: def.reward_coins || 0,
      gems: def.reward_gems || 0,
      reason: 'quest',
      refId: quest_id,
    });
    const wallet = await economy.getWallet(userId);
    return res.json({ ok: true, wallet });
  } catch (e) {
    console.error('quest claim error:', e.message);
    return res.status(500).json({ error: 'Failed to claim quest' });
  }
});

module.exports = router;
