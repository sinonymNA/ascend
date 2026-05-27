const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const gameEngine = require('../services/gameEngine');

const router = express.Router();

function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// POST /api/sessions
router.post('/', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) return res.status(400).json({ error: 'User not synced' });

  const { set_id, class_id } = req.body;
  if (!set_id) return res.status(400).json({ error: 'set_id is required' });

  try {
    const { rows: questions } = await db.query(
      'SELECT * FROM questions WHERE set_id = $1 ORDER BY order_index ASC',
      [set_id]
    );
    if (!questions.length) return res.status(400).json({ error: 'Question set has no questions' });

    // Unique game code
    let gameCode;
    for (let i = 0; i < 20; i++) {
      gameCode = generateGameCode();
      const { rows } = await db.query('SELECT id FROM game_sessions WHERE game_code = $1', [gameCode]);
      if (!rows[0]) break;
    }

    const { rows } = await db.query(
      `INSERT INTO game_sessions (teacher_id, set_id, class_id, game_code, status)
       VALUES ($1, $2, $3, $4, 'lobby') RETURNING *`,
      [teacherId, set_id, class_id || null, gameCode]
    );
    const session = rows[0];

    // Map DB rows to game engine question format
    const engineQuestions = questions.map(q => ({
      id: q.id,
      stimulus: q.stimulus,
      stimulus_type: q.stimulus_type,
      question: q.question,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      correct: q.correct,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    const engineSession = gameEngine.createSession(gameCode, teacherId, engineQuestions);
    engineSession.classId = class_id || null;
    engineSession.setId = set_id;

    return res.status(201).json({ sessionId: session.id, gameCode });
  } catch (e) {
    console.error('sessions POST / error:', e.message);
    return res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/sessions/:gameCode
router.get('/:gameCode', requireAuth, async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT gs.*, qs.title as set_title, qs.subject as set_subject
       FROM game_sessions gs
       LEFT JOIN question_sets qs ON qs.id = gs.set_id
       WHERE gs.game_code = $1`,
      [req.params.gameCode]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Session not found' });

    const live = gameEngine.getSession(req.params.gameCode);
    const players = live ? gameEngine.getClassSnapshot(req.params.gameCode) : [];

    return res.json({
      session: {
        ...rows[0],
        liveStatus: live?.status || rows[0].status,
        playerCount: players.length,
        players,
      },
    });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

// GET /api/sessions/:gameCode/results
router.get('/:gameCode/results', requireAuth, async (req, res) => {
  try {
    const { rows: sessions } = await db.query(
      'SELECT * FROM game_sessions WHERE game_code = $1', [req.params.gameCode]
    );
    if (!sessions[0]) return res.status(404).json({ error: 'Session not found' });
    const sessionId = sessions[0].id;

    const { rows: progress } = await db.query(
      `SELECT sp.*, u.name, u.email
       FROM session_progress sp JOIN users u ON u.id = sp.student_id
       WHERE sp.session_id = $1`,
      [sessionId]
    );
    const { rows: attempts } = await db.query(
      `SELECT qa.*, q.question as question_text, q.tags
       FROM question_attempts qa JOIN questions q ON q.id = qa.question_id
       WHERE qa.session_id = $1`,
      [sessionId]
    );

    const live = gameEngine.getSession(req.params.gameCode);
    return res.json({
      session: sessions[0],
      progress,
      attempts,
      liveSnapshot: live ? gameEngine.getClassSnapshot(req.params.gameCode) : null,
    });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

// POST /api/sessions/:sessionId/assign
router.post('/:sessionId/assign', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  const { class_id, due_date } = req.body;
  if (!class_id || !due_date) return res.status(400).json({ error: 'class_id and due_date required' });

  try {
    const { rows } = await db.query(
      'SELECT id FROM game_sessions WHERE id = $1 AND teacher_id = $2',
      [req.params.sessionId, teacherId]
    );
    if (!rows[0]) return res.status(403).json({ error: 'Session not found or not your session' });

    const { rows: asgn } = await db.query(
      'INSERT INTO assignments (session_id, class_id, due_date) VALUES ($1, $2, $3) RETURNING *',
      [req.params.sessionId, class_id, due_date]
    );
    return res.status(201).json({ assignment: asgn[0] });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to create assignment' });
  }
});

module.exports = router;
