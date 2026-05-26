const express = require('express');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../services/supabase');
const gameEngine = require('../services/gameEngine');

const router = express.Router();

/** Generate an 8-character uppercase game code. */
function generateGameCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * POST /api/sessions
 * Create a new game session.
 * Body: { set_id, class_id? }
 */
router.post('/', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) {
    return res.status(400).json({ error: 'User not synced — call /auth/sync first' });
  }

  const { set_id, class_id } = req.body;
  if (!set_id) {
    return res.status(400).json({ error: 'set_id is required' });
  }

  // Load questions for the set
  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .eq('set_id', set_id)
    .order('position', { ascending: true });

  if (qError) {
    console.error('sessions POST / questions error:', qError);
    return res.status(500).json({ error: 'Failed to load questions' });
  }

  if (!questions || questions.length === 0) {
    return res.status(400).json({ error: 'Question set has no questions' });
  }

  // Generate unique game code
  let gameCode;
  let tries = 0;
  while (tries < 20) {
    gameCode = generateGameCode();
    const { data: existing } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('game_code', gameCode)
      .maybeSingle();
    if (!existing) break;
    tries++;
  }

  // Persist to Supabase
  const { data: session, error: insertError } = await supabase
    .from('game_sessions')
    .insert({
      teacher_id: teacherId,
      set_id,
      class_id: class_id || null,
      game_code: gameCode,
      status: 'lobby',
    })
    .select()
    .single();

  if (insertError) {
    console.error('sessions POST / insert error:', insertError);
    return res.status(500).json({ error: 'Failed to create session' });
  }

  // Initialize in-memory game engine
  const engineSession = gameEngine.createSession(gameCode, teacherId, questions);
  engineSession.classId = class_id || null;
  engineSession.setId = set_id;

  return res.status(201).json({
    sessionId: session.id,
    gameCode,
  });
});

/**
 * GET /api/sessions/:gameCode
 * Get current session status.
 */
router.get('/:gameCode', requireAuth, async (req, res) => {
  const { gameCode } = req.params;

  // Check in-memory first for live status
  const liveSession = gameEngine.getSession(gameCode);

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*, question_sets(name, subject)')
    .eq('game_code', gameCode)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const players = liveSession ? gameEngine.getClassSnapshot(gameCode) : [];

  return res.json({
    session: {
      ...data,
      liveStatus: liveSession?.status || data.status,
      playerCount: players.length,
      players,
    },
  });
});

/**
 * GET /api/sessions/:gameCode/results
 * Get full results after a game ends.
 */
router.get('/:gameCode/results', requireAuth, async (req, res) => {
  const { gameCode } = req.params;

  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('game_code', gameCode)
    .single();

  if (sessionError || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  // Get per-student progress
  const { data: progress, error: progressError } = await supabase
    .from('session_progress')
    .select('*, users(id, name, email)')
    .eq('session_id', session.id);

  if (progressError) {
    console.error('sessions GET /:gameCode/results progress error:', progressError);
  }

  // Get question-level attempts
  const { data: attempts, error: attemptsError } = await supabase
    .from('question_attempts')
    .select('*, questions(id, question, topic)')
    .eq('session_id', session.id);

  if (attemptsError) {
    console.error('sessions GET /:gameCode/results attempts error:', attemptsError);
  }

  // Also merge live snapshot if game is still in memory
  const liveSession = gameEngine.getSession(gameCode);
  const liveSnapshot = liveSession ? gameEngine.getClassSnapshot(gameCode) : null;

  return res.json({
    session,
    progress: progress || [],
    attempts: attempts || [],
    liveSnapshot,
  });
});

/**
 * POST /api/sessions/:sessionId/assign
 * Create an assignment linking a session to a class with a due date.
 * Body: { class_id, due_date }
 */
router.post('/:sessionId/assign', requireAuth, async (req, res) => {
  const teacherId = req.dbUser?.id;
  if (!teacherId) {
    return res.status(400).json({ error: 'User not synced' });
  }

  const { sessionId } = req.params;
  const { class_id, due_date } = req.body;

  if (!class_id || !due_date) {
    return res.status(400).json({ error: 'class_id and due_date are required' });
  }

  // Verify teacher owns this session
  const { data: session, error: sessionError } = await supabase
    .from('game_sessions')
    .select('id, teacher_id')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (session.teacher_id !== teacherId) {
    return res.status(403).json({ error: 'Not the owner of this session' });
  }

  const { data, error } = await supabase
    .from('assignments')
    .insert({
      session_id: sessionId,
      class_id,
      teacher_id: teacherId,
      due_date,
    })
    .select()
    .single();

  if (error) {
    console.error('sessions POST /:sessionId/assign error:', error);
    return res.status(500).json({ error: 'Failed to create assignment' });
  }

  return res.status(201).json({ assignment: data });
});

module.exports = router;
