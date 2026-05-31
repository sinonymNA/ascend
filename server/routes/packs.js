'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const economy = require('../services/economy');
const { PACKS } = require('../services/catalog');

const router = express.Router();

// GET /api/packs/types
router.get('/types', requireAuth, async (_req, res) => {
  const packs = Object.values(PACKS)
    .filter((p) => p.currency !== 'grant')
    .map((p) => ({ type: p.type, currency: p.currency, cost: p.cost, slots: p.slots, weights: p.weights }));
  return res.json({ packs });
});

// POST /api/packs/open  { type }
router.post('/open', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const { type } = req.body;
  const pack = PACKS[type];
  if (!pack || pack.currency === 'grant') return res.status(400).json({ error: 'Invalid pack type' });

  try {
    const { results, wallet } = await economy.openPack(userId, type);
    return res.json({ results, wallet });
  } catch (e) {
    if (e.status === 400) return res.status(400).json({ error: e.message });
    console.error('pack open error:', e.message);
    return res.status(500).json({ error: 'Failed to open pack' });
  }
});

module.exports = router;
