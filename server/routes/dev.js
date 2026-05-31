const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { grantRewards } = require('../services/economy');

// Dev endpoint: grant 1,000,000 coins (requires auth, for testing only)
router.post('/grant-coins', requireAuth, async (req, res) => {
  try {
    const userId = req.dbUser.id;
    await grantRewards(userId, { coins: 1000000, gems: 0, reason: 'dev-test-grant' });
    res.json({ ok: true, coins: 1000000 });
  } catch (err) {
    console.error('Dev grant-coins error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
