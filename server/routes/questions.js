const express = require('express');
const { requireAuth } = require('../middleware/auth');
const supabase = require('../services/supabase');
const claude = require('../services/claude');

const router = express.Router();

/** Middleware that checks if the authenticated user has a Pro subscription. */
function requirePro(req, res, next) {
  if (!req.dbUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (req.dbUser.subscription !== 'pro') {
    return res.status(403).json({ error: 'Pro subscription required' });
  }
  next();
}

/**
 * GET /api/questions/sets
 * List public sets plus the authenticated teacher's own sets.
 */
router.get('/sets', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;

  const { data, error } = await supabase
    .from('question_sets')
    .select('*, questions(count)')
    .or(`is_public.eq.true${userId ? `,creator_id.eq.${userId}` : ''}`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('questions GET /sets error:', error);
    return res.status(500).json({ error: 'Failed to fetch question sets' });
  }

  return res.json({ sets: data });
});

/**
 * POST /api/questions/sets
 * Create a new question set.
 * Body: { name, subject, description?, is_public? }
 */
router.post('/sets', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User not synced' });
  }

  const { name, subject, description, is_public } = req.body;
  if (!name || !subject) {
    return res.status(400).json({ error: 'name and subject are required' });
  }

  const { data, error } = await supabase
    .from('question_sets')
    .insert({
      creator_id: userId,
      name,
      subject,
      description: description || null,
      is_public: is_public === true,
    })
    .select()
    .single();

  if (error) {
    console.error('questions POST /sets error:', error);
    return res.status(500).json({ error: 'Failed to create question set' });
  }

  return res.status(201).json({ set: data });
});

/**
 * GET /api/questions/sets/:id
 * Get a question set along with all its questions.
 */
router.get('/sets/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  const { data: set, error: setError } = await supabase
    .from('question_sets')
    .select('*')
    .eq('id', id)
    .single();

  if (setError || !set) {
    return res.status(404).json({ error: 'Question set not found' });
  }

  const { data: questions, error: qError } = await supabase
    .from('questions')
    .select('*')
    .eq('set_id', id)
    .order('position', { ascending: true });

  if (qError) {
    console.error('questions GET /sets/:id questions error:', qError);
    return res.status(500).json({ error: 'Failed to fetch questions' });
  }

  return res.json({ set: { ...set, questions: questions || [] } });
});

/**
 * POST /api/questions/sets/:id/questions
 * Add a question to a set.
 * Body: { question, options, correct_index, explanation, hint?, topic?, difficulty?, subject? }
 */
router.post('/sets/:id/questions', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User not synced' });
  }

  const { id } = req.params;

  // Verify set ownership
  const { data: set, error: setError } = await supabase
    .from('question_sets')
    .select('id, creator_id')
    .eq('id', id)
    .single();

  if (setError || !set) {
    return res.status(404).json({ error: 'Question set not found' });
  }

  if (set.creator_id !== userId) {
    return res.status(403).json({ error: 'Not the owner of this set' });
  }

  const { question, options, correct_index, explanation, hint, topic, difficulty, subject } =
    req.body;

  if (!question || !options || correct_index === undefined || !explanation) {
    return res
      .status(400)
      .json({ error: 'question, options, correct_index, and explanation are required' });
  }

  if (!Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ error: 'options must be an array with at least 2 items' });
  }

  // Determine position (append at end)
  const { count } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('set_id', id);

  const { data, error } = await supabase
    .from('questions')
    .insert({
      set_id: id,
      question,
      options,
      correct_index,
      explanation,
      hint: hint || null,
      topic: topic || null,
      difficulty: difficulty || 'medium',
      subject: subject || null,
      position: (count || 0) + 1,
    })
    .select()
    .single();

  if (error) {
    console.error('questions POST /sets/:id/questions error:', error);
    return res.status(500).json({ error: 'Failed to add question' });
  }

  return res.status(201).json({ question: data });
});

/**
 * PUT /api/questions/:id
 * Update a question.
 */
router.put('/questions/:id', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User not synced' });
  }

  const { id } = req.params;

  // Verify ownership through the set
  const { data: existing, error: fetchError } = await supabase
    .from('questions')
    .select('id, set_id, question_sets(creator_id)')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (existing.question_sets?.creator_id !== userId) {
    return res.status(403).json({ error: 'Not the owner of this question' });
  }

  const allowed = [
    'question',
    'options',
    'correct_index',
    'explanation',
    'hint',
    'topic',
    'difficulty',
    'subject',
    'position',
  ];
  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('questions PUT /:id error:', error);
    return res.status(500).json({ error: 'Failed to update question' });
  }

  return res.json({ question: data });
});

/**
 * DELETE /api/questions/:id
 * Delete a question.
 */
router.delete('/questions/:id', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) {
    return res.status(400).json({ error: 'User not synced' });
  }

  const { id } = req.params;

  const { data: existing, error: fetchError } = await supabase
    .from('questions')
    .select('id, set_id, question_sets(creator_id)')
    .eq('id', id)
    .single();

  if (fetchError || !existing) {
    return res.status(404).json({ error: 'Question not found' });
  }

  if (existing.question_sets?.creator_id !== userId) {
    return res.status(403).json({ error: 'Not the owner of this question' });
  }

  const { error } = await supabase.from('questions').delete().eq('id', id);

  if (error) {
    console.error('questions DELETE /:id error:', error);
    return res.status(500).json({ error: 'Failed to delete question' });
  }

  return res.json({ deleted: true });
});

/**
 * POST /api/questions/ai/generate
 * Generate a single question using Claude AI. Pro only.
 * Body: { topic, difficulty, subject }
 */
router.post('/ai/generate', requireAuth, requirePro, async (req, res) => {
  const { topic, difficulty, subject } = req.body;

  if (!topic || !subject) {
    return res.status(400).json({ error: 'topic and subject are required' });
  }

  const question = await claude.generateQuestion(
    topic,
    difficulty || 'medium',
    subject
  );

  if (!question) {
    return res.status(502).json({ error: 'AI generation failed — try again' });
  }

  return res.json({ question });
});

/**
 * POST /api/questions/ai/extract
 * Extract questions from raw text. Pro only.
 * Body: { text, subject }
 */
router.post('/ai/extract', requireAuth, requirePro, async (req, res) => {
  const { text, subject } = req.body;

  if (!text || !subject) {
    return res.status(400).json({ error: 'text and subject are required' });
  }

  const questions = await claude.extractQuestionsFromText(text, subject);

  if (questions === null) {
    return res.status(502).json({ error: 'AI extraction failed — try again' });
  }

  return res.json({ questions });
});

module.exports = router;
