'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const economy = require('../services/economy');
const { SEASON } = require('../services/catalog');

const router = express.Router();

async function ensureProgress(userId) {
  await db.query(
    `INSERT INTO user_season_progress (user_id, season_id) VALUES ($1, $2)
     ON CONFLICT (user_id, season_id) DO NOTHING`,
    [userId, SEASON.id]
  );
}

// GET /api/season/track
router.get('/track', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  try {
    await ensureProgress(userId);
    const prog = await db.query(
      'SELECT season_xp, claimed_tiers FROM user_season_progress WHERE user_id = $1 AND season_id = $2',
      [userId, SEASON.id]
    );
    const seasonXp = prog.rows[0]?.season_xp || 0;
    const claimed = prog.rows[0]?.claimed_tiers || [];
    return res.json({
      season: { id: SEASON.id, name: SEASON.name, starts_at: SEASON.starts_at, ends_at: SEASON.ends_at },
      tiers: SEASON.tiers,
      seasonXp,
      claimed,
    });
  } catch (e) {
    console.error('season track error:', e.message);
    return res.status(500).json({ error: 'Failed to load season' });
  }
});

// POST /api/season/claim  { tier_index }
router.post('/claim', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const tierIndex = parseInt(req.body.tier_index, 10);
  const tier = SEASON.tiers.find((t) => t.tier_index === tierIndex);
  if (!tier) return res.status(400).json({ error: 'Unknown tier' });

  try {
    await ensureProgress(userId);
    const prog = await db.query(
      'SELECT season_xp, claimed_tiers FROM user_season_progress WHERE user_id = $1 AND season_id = $2 FOR UPDATE',
      [userId, SEASON.id]
    );
    const seasonXp = prog.rows[0]?.season_xp || 0;
    const claimed = prog.rows[0]?.claimed_tiers || [];
    if (seasonXp < tier.xp_required) return res.status(400).json({ error: 'Tier not reached' });
    if (claimed.includes(tierIndex)) return res.status(400).json({ error: 'Already claimed' });

    await db.query(
      `UPDATE user_season_progress SET claimed_tiers = array_append(claimed_tiers, $3)
       WHERE user_id = $1 AND season_id = $2`,
      [userId, SEASON.id, tierIndex]
    );
    if (tier.reward_coins || tier.reward_gems) {
      await economy.grantRewards(userId, { coins: tier.reward_coins || 0, gems: tier.reward_gems || 0, reason: 'season', refId: String(tierIndex) });
    }
    let grantedItem = null;
    if (tier.reward_item) {
      await db.query(
        `INSERT INTO user_inventory (user_id, item_id, quantity, equipped) VALUES ($1, $2, 1, FALSE)
         ON CONFLICT (user_id, item_id) DO UPDATE SET quantity = user_inventory.quantity + 1`,
        [userId, tier.reward_item]
      );
      grantedItem = tier.reward_item;
    }
    const wallet = await economy.getWallet(userId);
    return res.json({ ok: true, wallet, item: grantedItem });
  } catch (e) {
    console.error('season claim error:', e.message);
    return res.status(500).json({ error: 'Failed to claim tier' });
  }
});

module.exports = router;
