'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const economy = require('../services/economy');
const { ITEMS } = require('../services/catalog');

const router = express.Router();
const ITEM_BY_ID = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

// GET /api/economy/wallet
router.get('/wallet', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  try {
    const wallet = await economy.getWallet(userId);
    return res.json(wallet);
  } catch (e) {
    console.error('wallet error:', e.message);
    return res.status(500).json({ error: 'Failed to load wallet' });
  }
});

// GET /api/economy/catalog
router.get('/catalog', requireAuth, async (_req, res) => {
  return res.json({ items: ITEMS });
});

// GET /api/economy/inventory
router.get('/inventory', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  try {
    const { rows } = await db.query(
      `SELECT ui.item_id, ui.quantity, ui.equipped, id.kind, id.category, id.name, id.rarity, id.payload
       FROM user_inventory ui JOIN item_definitions id ON id.id = ui.item_id
       WHERE ui.user_id = $1`,
      [userId]
    );
    const cosmetics = rows.filter((r) => r.kind === 'cosmetic');
    const boosts = rows.filter((r) => r.kind === 'boost');
    return res.json({ cosmetics, boosts });
  } catch (e) {
    console.error('inventory error:', e.message);
    return res.status(500).json({ error: 'Failed to load inventory' });
  }
});

// POST /api/economy/equip  { item_id, equipped }
router.post('/equip', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const { item_id, equipped = true } = req.body;
  const def = ITEM_BY_ID[item_id];
  if (!def || def.kind !== 'cosmetic') return res.status(400).json({ error: 'Not an equippable item' });

  try {
    // Verify ownership
    const own = await db.query('SELECT 1 FROM user_inventory WHERE user_id = $1 AND item_id = $2', [userId, item_id]);
    if (!own.rows.length) return res.status(403).json({ error: 'You do not own this item' });

    // Unequip others in same category, equip this one
    await db.query(
      `UPDATE user_inventory ui SET equipped = FALSE
       FROM item_definitions id
       WHERE ui.item_id = id.id AND ui.user_id = $1 AND id.category = $2`,
      [userId, def.category]
    );
    if (equipped) {
      await db.query('UPDATE user_inventory SET equipped = TRUE WHERE user_id = $1 AND item_id = $2', [userId, item_id]);
    }

    // Bridge to climber_customizations so rendering picks it up
    const p = def.payload || {};
    const field = p.color ? 'color' : p.trail_effect ? 'trail_effect' : p.flag_design ? 'flag_design' : p.silhouette ? 'silhouette' : null;
    if (field && equipped) {
      const value = p.color || p.trail_effect || p.flag_design || p.silhouette;
      await db.query(
        `INSERT INTO climber_customizations (student_id, ${field})
         VALUES ($1, $2)
         ON CONFLICT (student_id) DO UPDATE SET ${field} = $2, updated_at = NOW()`,
        [userId, value]
      );
    }

    const { rows } = await db.query(
      `SELECT item_id, equipped FROM user_inventory WHERE user_id = $1 AND equipped = TRUE`, [userId]
    );
    return res.json({ ok: true, equipped: rows });
  } catch (e) {
    console.error('equip error:', e.message);
    return res.status(500).json({ error: 'Failed to equip' });
  }
});

// POST /api/economy/boost/activate  { item_id }
router.post('/boost/activate', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const { item_id } = req.body;
  const def = ITEM_BY_ID[item_id];
  if (!def || def.kind !== 'boost') return res.status(400).json({ error: 'Not a boost' });

  try {
    // Consume one from inventory
    const upd = await db.query(
      `UPDATE user_inventory SET quantity = quantity - 1
       WHERE user_id = $1 AND item_id = $2 AND quantity > 0 RETURNING quantity`,
      [userId, item_id]
    );
    if (!upd.rows.length) return res.status(400).json({ error: 'None in inventory' });

    const durationMin = def.payload?.duration_min || 0;
    const expiresAt = durationMin ? new Date(Date.now() + durationMin * 60000).toISOString() : null;
    await db.query(
      `INSERT INTO boost_activations (user_id, item_id, category, expires_at, consumed)
       VALUES ($1, $2, $3, $4, FALSE)`,
      [userId, item_id, def.category, expiresAt]
    );
    return res.json({ ok: true, category: def.category, expiresAt, remaining: upd.rows[0].quantity });
  } catch (e) {
    console.error('boost activate error:', e.message);
    return res.status(500).json({ error: 'Failed to activate boost' });
  }
});

module.exports = router;
