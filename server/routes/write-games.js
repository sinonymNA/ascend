// Summit Write — Practice Games (Phase 2, Part 4).
// Mounted at /api/write/games

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const { awardProgress } = require('../services/sw-progress');
const { getRound, getById } = require('../services/speedround-content');
const { PROMPTS, getRandomPrompt, getById: getThrowdownPromptById } = require('../services/throwdown-content');
const throwdownEngine = require('../services/throwdownEngine');
const { PROMPTS: TRIBUNAL_PROMPTS, getRandomPrompt: getRandomTribunalPrompt, getById: getTribunalPromptById } = require('../services/tribunal-content');
const tribunalEngine = require('../services/tribunalEngine');
const relayEngine = require('../services/relayEngine');

const router = express.Router();
router.use(requireAuth);
router.use((req, res, next) => {
  if (!req.dbUser) return res.status(400).json({ error: 'User not synced' });
  next();
});

// ── GET /api/write/games/speed-round — a fresh round of sentences ───────────

router.get('/speed-round', async (req, res) => {
  const count = Math.min(parseInt(req.query.count, 10) || 12, 24);
  const round = getRound(count).map(({ id, text }) => ({ id, text }));
  res.json({ round });
});

// ── POST /api/write/games/speed-round/submit — score a completed round ──────

router.post('/speed-round/submit', async (req, res) => {
  try {
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const results = [];
    let correctCount = 0;
    let score = 0;

    for (const a of answers) {
      const item = getById(a?.id);
      if (!item) continue;
      const correct = a.choice === item.type;
      let points = 0;
      if (correct) {
        correctCount += 1;
        const timeMs = Math.max(0, Math.min(5000, Number(a.timeMs) || 5000));
        const speedBonus = Math.round(((5000 - timeMs) / 5000) * 5);
        points = 10 + speedBonus;
      }
      score += points;
      results.push({ id: item.id, text: item.text, type: item.type, yourChoice: a.choice || null, correct, points });
    }

    const total = results.length;
    const studentId = req.dbUser.id;

    await db.query(
      'INSERT INTO sw_speed_round_runs (student_id, score, correct_count, total) VALUES ($1, $2, $3, $4)',
      [studentId, score, correctCount, total]
    );

    const xpGain = Math.min(25, Math.round(correctCount * 1.5));
    const award = await awardProgress(studentId, { xpGain });

    const { rows: bestRows } = await db.query(
      'SELECT MAX(score) AS best FROM sw_speed_round_runs WHERE student_id=$1',
      [studentId]
    );
    const personalBest = bestRows[0]?.best ?? score;

    const { rows: leaderboard } = await db.query(
      `SELECT r.score, r.correct_count, r.total, r.created_at, u.name, u.username
       FROM sw_speed_round_runs r
       JOIN users u ON u.id = r.student_id
       ORDER BY r.score DESC, r.created_at ASC
       LIMIT 5`
    );

    res.json({
      score,
      correctCount,
      total,
      results,
      award,
      personalBest,
      leaderboard: leaderboard.map((r) => ({
        name: r.name || r.username,
        score: r.score,
        correctCount: r.correct_count,
        total: r.total,
      })),
    });
  } catch (e) {
    console.error('POST /api/write/games/speed-round/submit error:', e.message);
    res.status(500).json({ error: 'Failed to score speed round' });
  }
});

// ── THESIS THROWDOWN ─────────────────────────────────────────────────────────

// GET /api/write/games/thesis-throwdown/prompts — prompt bank for teacher picker
router.get('/thesis-throwdown/prompts', async (req, res) => {
  res.json({ prompts: PROMPTS });
});

// POST /api/write/games/thesis-throwdown/create — teacher launches a room
router.post('/thesis-throwdown/create', async (req, res) => {
  if (req.dbUser.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { promptId } = req.body || {};
  const prompt = (promptId && getThrowdownPromptById(promptId)) || getRandomPrompt();

  const session = throwdownEngine.createSession(req.dbUser.id, prompt);
  res.json({ roomCode: session.code, prompt });
});

// ── THE TRIBUNAL ──────────────────────────────────────────────────────────────

// GET /api/write/games/tribunal/prompts — SAQ prompt bank for teacher picker
router.get('/tribunal/prompts', async (req, res) => {
  res.json({ prompts: TRIBUNAL_PROMPTS });
});

// POST /api/write/games/tribunal/create — teacher launches a room
router.post('/tribunal/create', async (req, res) => {
  if (req.dbUser.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { promptId } = req.body || {};
  const prompt = (promptId && getTribunalPromptById(promptId)) || getRandomTribunalPrompt();

  const session = tribunalEngine.createSession(req.dbUser.id, prompt);
  res.json({ roomCode: session.code, prompt });
});

// ── THE RELAY ─────────────────────────────────────────────────────────────────
// Reuses the Thesis Throwdown LEQ-style prompt bank — same "evaluate the
// extent to which" prompts work for a relay-written LEQ paragraph.

// GET /api/write/games/relay/prompts — prompt bank for teacher picker
router.get('/relay/prompts', async (req, res) => {
  res.json({ prompts: PROMPTS });
});

// POST /api/write/games/relay/create — teacher launches a room
router.post('/relay/create', async (req, res) => {
  if (req.dbUser.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { promptId } = req.body || {};
  const prompt = (promptId && getThrowdownPromptById(promptId)) || getRandomPrompt();

  const session = relayEngine.createSession(req.dbUser.id, prompt);
  res.json({ roomCode: session.code, prompt });
});

module.exports = router;
