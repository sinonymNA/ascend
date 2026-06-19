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
const { PROMPTS: AUCTION_PROMPTS, getRandomPrompt: getRandomAuctionPrompt, getById: getAuctionPromptById } = require('../services/evidence-auction-content');
const auctionEngine = require('../services/auctionEngine');
const { RUBRICS } = require('../services/write-grader');

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

// ── EVIDENCE AUCTION ──────────────────────────────────────────────────────────

// GET /api/write/games/auction/prompts — thesis + evidence-card bank for teacher picker
router.get('/auction/prompts', async (req, res) => {
  res.json({ prompts: AUCTION_PROMPTS });
});

// POST /api/write/games/auction/create — teacher launches a room
router.post('/auction/create', async (req, res) => {
  if (req.dbUser.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { promptId } = req.body || {};
  const prompt = (promptId && getAuctionPromptById(promptId)) || getRandomAuctionPrompt();

  const session = auctionEngine.createSession(req.dbUser.id, prompt);
  res.json({ roomCode: session.code, thesis: session.thesis });
});

// ── BLIND PEER GRADE ──────────────────────────────────────────────────────────
// Individual, async-compatible: a student grades an anonymized classmate's
// already-AI-graded essay against a simplified rubric (point granted or not,
// plus a one-sentence justification per criterion), then sees the AI's real
// score for comparison. No socket session — this rides on the existing
// sw_submissions/grading_json pipeline from POST /api/write/grade.

// POST /api/write/games/peer-grade/start — fetch an anonymized essay to grade
router.post('/peer-grade/start', async (req, res) => {
  try {
    const graderId = req.dbUser.id;
    const { rows } = await db.query(
      `SELECT s.id, s.essay_text, a.type AS essay_type, a.title AS assignment_title, a.prompt
       FROM sw_submissions s
       JOIN sw_assignments a ON a.id = s.assignment_id
       WHERE s.student_id != $1
         AND s.grading_json IS NOT NULL
         AND NOT EXISTS (
           SELECT 1 FROM sw_peer_grades pg WHERE pg.submission_id = s.id AND pg.grader_id = $1
         )
       ORDER BY (SELECT COUNT(*) FROM sw_peer_grades pg2 WHERE pg2.submission_id = s.id) ASC, RANDOM()
       LIMIT 1`,
      [graderId]
    );

    const sub = rows[0];
    if (!sub) return res.json({ submission: null });

    const criteria = RUBRICS[sub.essay_type]?.criteria || {};
    res.json({
      submission: {
        id: sub.id,
        essayText: sub.essay_text,
        assignmentTitle: sub.assignment_title,
        essayType: sub.essay_type,
        prompt: sub.prompt,
        criteria,
      },
    });
  } catch (e) {
    console.error('POST /api/write/games/peer-grade/start error:', e.message);
    res.status(500).json({ error: 'Failed to find an essay to grade' });
  }
});

// POST /api/write/games/peer-grade/:submissionId/submit — score it, compare to AI
router.post('/peer-grade/:submissionId/submit', async (req, res) => {
  try {
    const graderId = req.dbUser.id;
    const { submissionId } = req.params;
    const scores = (req.body && req.body.scores) || {};

    const { rows } = await db.query(
      `SELECT s.id, s.student_id, s.grading_json, a.type AS essay_type
       FROM sw_submissions s
       JOIN sw_assignments a ON a.id = s.assignment_id
       WHERE s.id = $1`,
      [submissionId]
    );
    const sub = rows[0];
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    if (sub.student_id === graderId) return res.status(403).json({ error: 'You cannot peer-grade your own essay' });
    if (!sub.grading_json) return res.status(400).json({ error: 'This essay has not been AI-graded yet' });

    const { rows: existing } = await db.query(
      'SELECT id FROM sw_peer_grades WHERE submission_id=$1 AND grader_id=$2',
      [submissionId, graderId]
    );
    if (existing[0]) return res.status(409).json({ error: 'You already peer-graded this essay' });

    const criteria = RUBRICS[sub.essay_type]?.criteria || {};
    let peerTotal = 0;
    const criterionScores = {};
    for (const [key, def] of Object.entries(criteria)) {
      const entry = scores[key] || {};
      const granted = !!entry.granted;
      if (granted) peerTotal += def.points;
      criterionScores[key] = { granted, note: typeof entry.note === 'string' ? entry.note.slice(0, 500) : '' };
    }

    const aiTotal = sub.grading_json.score;
    const diff = Math.abs(peerTotal - aiTotal);
    const accuracy = diff <= 1 ? 'full' : diff === 2 ? 'partial' : 'none';
    const xpGain = accuracy === 'full' ? 20 : accuracy === 'partial' ? 8 : 2;

    await db.query(
      `INSERT INTO sw_peer_grades (submission_id, grader_id, criterion_scores, peer_total, ai_total, accuracy, xp_gain)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [submissionId, graderId, JSON.stringify(criterionScores), peerTotal, aiTotal, accuracy, xpGain]
    );

    const award = await awardProgress(graderId, {
      xpGain,
      newBadges: accuracy === 'full' ? ['rubric_eye'] : [],
    });

    res.json({
      peerTotal,
      aiTotal,
      diff,
      accuracy,
      xpGain,
      award,
      aiBreakdown: sub.grading_json.breakdown,
      maxScore: sub.grading_json.maxScore,
    });
  } catch (e) {
    console.error('POST /api/write/games/peer-grade/:submissionId/submit error:', e.message);
    res.status(500).json({ error: 'Failed to submit peer grade' });
  }
});

// GET /api/write/games/peer-grade/received/:submissionId — author sees how peers scored their essay
router.get('/peer-grade/received/:submissionId', async (req, res) => {
  try {
    const userId = req.dbUser.id;
    const { submissionId } = req.params;

    const { rows: subRows } = await db.query(
      'SELECT id, student_id FROM sw_submissions WHERE id=$1',
      [submissionId]
    );
    const sub = subRows[0];
    if (!sub) return res.status(404).json({ error: 'Submission not found' });
    if (sub.student_id !== userId) return res.status(403).json({ error: 'Not your submission' });

    const { rows: grades } = await db.query(
      `SELECT criterion_scores, peer_total, ai_total, accuracy, created_at
       FROM sw_peer_grades WHERE submission_id=$1 ORDER BY created_at ASC`,
      [submissionId]
    );

    res.json({
      peerGrades: grades.map((g) => ({
        criterionScores: g.criterion_scores,
        peerTotal: g.peer_total,
        aiTotal: g.ai_total,
        accuracy: g.accuracy,
        createdAt: g.created_at,
      })),
    });
  } catch (e) {
    console.error('GET /api/write/games/peer-grade/received error:', e.message);
    res.status(500).json({ error: 'Failed to load peer grades' });
  }
});

module.exports = router;
