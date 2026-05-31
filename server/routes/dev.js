const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { grantRewards } = require('../services/economy');

// Dev-only endpoint: grant 1,000,000 coins (for testing packs, etc.)
// Only works in development mode
router.post('/grant-coins', requireAuth, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

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
