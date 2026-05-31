'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const economy = require('../services/economy');

const router = express.Router();

// POST /api/minigame/blitz/finish  { setId, correctCount, durationMs }
router.post('/blitz/finish', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const correctCount = Math.max(0, parseInt(req.body.correctCount, 10) || 0);
  const durationMs = Math.max(1, parseInt(req.body.durationMs, 10) || 60000);

  // Sanity: cannot answer faster than ~1.2s each on average
  const maxPlausible = Math.ceil(durationMs / 1200) + 2;
  const counted = Math.min(correctCount, maxPlausible);
  const coins = Math.min(counted * 12, 600);

  try {
    await economy.grantRewards(userId, { coins, reason: 'blitz', refId: req.body.setId || null });
    await economy.advanceQuests(userId, { answers: counted, correct: counted });
    const wallet = await economy.getWallet(userId);
    return res.json({ wallet, coinsAwarded: coins });
  } catch (e) {
    console.error('blitz finish error:', e.message);
    return res.status(500).json({ error: 'Failed to finish blitz' });
  }
});

// POST /api/minigame/boss/finish  { setId, won, correctCount }
router.post('/boss/finish', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const won = !!req.body.won;
  const correctCount = Math.max(0, parseInt(req.body.correctCount, 10) || 0);

  try {
    let pack = null;
    if (won) {
      const opened = await economy.openPack(userId, 'boss', { granted: true });
      pack = opened.results;
      await economy.grantRewards(userId, { gems: 3, reason: 'boss', refId: req.body.setId || null });
    } else {
      await economy.grantRewards(userId, { coins: correctCount * 8, reason: 'boss', refId: req.body.setId || null });
    }
    await economy.advanceQuests(userId, { answers: correctCount, correct: correctCount });
    const wallet = await economy.getWallet(userId);
    return res.json({ wallet, pack, won });
  } catch (e) {
    console.error('boss finish error:', e.message);
    return res.status(500).json({ error: 'Failed to finish boss' });
  }
});

// POST /api/minigame/blockblast/finish  { setId, linesCleared, correctCount, score }
router.post('/blockblast/finish', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });
  const linesCleared = Math.max(0, parseInt(req.body.linesCleared, 10) || 0);
  const correctCount = Math.max(0, parseInt(req.body.correctCount, 10) || 0);

  // Coins from lines but capped by how many questions were answered correctly
  const coins = Math.min(linesCleared * 15, correctCount * 30);

  try {
    await economy.grantRewards(userId, { coins, reason: 'blockblast', refId: req.body.setId || null });
    await economy.advanceQuests(userId, { answers: correctCount, correct: correctCount });
    const wallet = await economy.getWallet(userId);
    return res.json({ wallet, coinsAwarded: coins });
  } catch (e) {
    console.error('blockblast finish error:', e.message);
    return res.status(500).json({ error: 'Failed to finish block blast' });
  }
});

module.exports = router;
