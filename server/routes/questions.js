const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const claude = require('../services/claude');

const router = express.Router();

function requirePro(req, res, next) {
  if (!req.dbUser) return res.status(401).json({ error: 'Unauthorized' });
  if (req.dbUser.subscription !== 'pro') return res.status(403).json({ error: 'Pro subscription required' });
  next();
}

// GET /api/questions/sets
router.get('/sets', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  try {
    const { rows } = await db.query(
      `SELECT qs.*,
        (SELECT COUNT(*) FROM questions q WHERE q.set_id = qs.id) AS question_count
       FROM question_sets qs
       WHERE qs.is_public = true ${userId ? 'OR qs.creator_id = $1' : ''}
       ORDER BY qs.created_at DESC`,
      userId ? [userId] : []
    );
    return res.json({ sets: rows });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to fetch sets' });
  }
});

// POST /api/questions/sets
router.post('/sets', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { title, subject, description, is_public, questions: qs } = req.body;
  if (!title || !subject) return res.status(400).json({ error: 'title and subject are required' });

  try {
    const { rows } = await db.query(
      `INSERT INTO question_sets (creator_id, title, subject, description, is_public)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, title, subject, description || null, !!is_public]
    );
    const set = rows[0];

    // Optionally bulk-insert questions
    if (Array.isArray(qs) && qs.length > 0) {
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        await db.query(
          `INSERT INTO questions
             (set_id, stimulus, stimulus_type, question, option_a, option_b, option_c, option_d,
              correct, explanation, difficulty, historical_thinking, tags, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [set.id, q.stimulus||null, q.stimulus_type||null, q.question,
           q.options?.A||q.option_a||'', q.options?.B||q.option_b||'',
           q.options?.C||q.option_c||'', q.options?.D||q.option_d||'',
           q.correct, q.explanation||null, q.difficulty||1,
           q.historical_thinking||[], Array.isArray(q.tags)?q.tags:(q.tags||'').split(',').map(t=>t.trim()).filter(Boolean),
           i+1]
        );
      }
      await db.query('UPDATE question_sets SET question_count = $1 WHERE id = $2', [qs.length, set.id]);
      set.question_count = qs.length;
    }

    return res.status(201).json({ id: set.id, set });
  } catch (e) {
    console.error('POST /sets error:', e.message);
    return res.status(500).json({ error: 'Failed to create set' });
  }
});

// PUT /api/questions/sets/:id
router.put('/sets/:id', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  const { title, subject, description, questions: qs } = req.body;

  try {
    const { rows: own } = await db.query(
      'SELECT id FROM question_sets WHERE id = $1 AND creator_id = $2', [req.params.id, userId]
    );
    if (!own[0]) return res.status(403).json({ error: 'Not your set' });

    if (title || subject || description !== undefined) {
      await db.query(
        `UPDATE question_sets SET title=COALESCE($1,title), subject=COALESCE($2,subject),
         description=COALESCE($3,description) WHERE id=$4`,
        [title||null, subject||null, description!==undefined?description:null, req.params.id]
      );
    }

    if (Array.isArray(qs)) {
      await db.query('DELETE FROM questions WHERE set_id = $1', [req.params.id]);
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        await db.query(
          `INSERT INTO questions
             (set_id, stimulus, stimulus_type, question, option_a, option_b, option_c, option_d,
              correct, explanation, difficulty, historical_thinking, tags, order_index)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
          [req.params.id, q.stimulus||null, q.stimulus_type||null, q.question,
           q.options?.A||q.option_a||'', q.options?.B||q.option_b||'',
           q.options?.C||q.option_c||'', q.options?.D||q.option_d||'',
           q.correct, q.explanation||null, q.difficulty||1,
           q.historical_thinking||[], Array.isArray(q.tags)?q.tags:(q.tags||'').split(',').map(t=>t.trim()).filter(Boolean),
           i+1]
        );
      }
      await db.query('UPDATE question_sets SET question_count = $1 WHERE id = $2', [qs.length, req.params.id]);
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error('PUT /sets/:id error:', e.message);
    return res.status(500).json({ error: 'Failed to update set' });
  }
});

// GET /api/questions/sets/:id
router.get('/sets/:id', requireAuth, async (req, res) => {
  try {
    const { rows: sets } = await db.query('SELECT * FROM question_sets WHERE id = $1', [req.params.id]);
    if (!sets[0]) return res.status(404).json({ error: 'Set not found' });
    const { rows: questions } = await db.query(
      'SELECT * FROM questions WHERE set_id = $1 ORDER BY order_index ASC', [req.params.id]
    );
    return res.json({ set: { ...sets[0], questions } });
  } catch (e) {
    return res.status(500).json({ error: 'DB error' });
  }
});

// DELETE /api/questions/:id
router.delete('/questions/:id', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  try {
    const { rows } = await db.query(
      `SELECT q.id FROM questions q
       JOIN question_sets qs ON qs.id = q.set_id
       WHERE q.id = $1 AND qs.creator_id = $2`,
      [req.params.id, userId]
    );
    if (!rows[0]) return res.status(403).json({ error: 'Not found or not your question' });
    await db.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    return res.json({ deleted: true });
  } catch (e) {
    return res.status(500).json({ error: 'Failed to delete question' });
  }
});

// POST /api/questions/ai/generate  (Pro only)
router.post('/ai/generate', requireAuth, requirePro, async (req, res) => {
  const { topic, difficulty, subject } = req.body;
  if (!topic) return res.status(400).json({ error: 'topic is required' });

  const question = await claude.generateQuestion(topic, difficulty || 2, subject || 'history');
  if (!question) return res.status(502).json({ error: 'AI generation failed — try again' });
  return res.json(question);
});

// POST /api/questions/ai/extract  (Pro only)
router.post('/ai/extract', requireAuth, requirePro, async (req, res) => {
  const { text, subject } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });

  const questions = await claude.extractQuestionsFromText(text, subject || 'history');
  if (questions === null) return res.status(502).json({ error: 'AI extraction failed — try again' });
  return res.json(questions);
});

module.exports = router;
