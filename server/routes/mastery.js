'use strict';
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');

const router = express.Router();

// GET /api/mastery/:setId — load user's mastery state for a question set
router.get('/:setId', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { setId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT question_id, mastered, wrong_count, correct_count, next_review_at
       FROM user_question_mastery
       WHERE user_id = $1 AND set_id = $2`,
      [userId, setId]
    );

    const now = new Date();
    const masteredIds = [];
    const dueIds = [];
    const wrongCounts = {};

    for (const row of rows) {
      wrongCounts[row.question_id] = row.wrong_count;
      if (row.mastered) {
        if (row.next_review_at && new Date(row.next_review_at) <= now) {
          dueIds.push(row.question_id); // due for spaced-rep review
        } else {
          masteredIds.push(row.question_id); // solidly mastered, skip
        }
      }
    }

    return res.json({ masteredIds, dueIds, wrongCounts });
  } catch (e) {
    console.error('mastery GET error:', e.message);
    return res.status(500).json({ error: 'Failed to load mastery' });
  }
});

// POST /api/mastery/sync — bulk upsert question-level mastery after a session
router.post('/sync', requireAuth, async (req, res) => {
  const userId = req.dbUser?.id;
  if (!userId) return res.status(400).json({ error: 'User not synced' });

  const { setId, answers } = req.body;
  if (!setId || !Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({ error: 'setId and answers[] are required' });
  }

  // SM-2-style intervals based on correct_count after this answer
  function nextReview(correctCount, wasCorrect) {
    if (!wasCorrect) return addDays(1);
    if (correctCount === 1) return addDays(3);
    if (correctCount === 2) return addDays(7);
    return addDays(21);
  }

  function addDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString();
  }

  try {
    for (const { questionId, correct, wrongCount } of answers) {
      if (!questionId) continue;

      // Fetch existing row to compute updated counts
      const { rows } = await db.query(
        `SELECT mastered, wrong_count, correct_count FROM user_question_mastery
         WHERE user_id = $1 AND question_id = $2`,
        [userId, questionId]
      );

      const existing = rows[0];
      const newWrong = Math.max(wrongCount ?? 0, existing?.wrong_count ?? 0);
      const newCorrect = correct ? ((existing?.correct_count ?? 0) + 1) : (existing?.correct_count ?? 0);
      const mastered = correct && newWrong <= 1;
      const review = nextReview(newCorrect, correct);

      await db.query(
        `INSERT INTO user_question_mastery
           (user_id, question_id, set_id, mastered, wrong_count, correct_count, next_review_at, last_seen_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (user_id, question_id) DO UPDATE SET
           mastered       = CASE WHEN EXCLUDED.mastered THEN TRUE ELSE user_question_mastery.mastered END,
           wrong_count    = GREATEST(user_question_mastery.wrong_count, EXCLUDED.wrong_count),
           correct_count  = EXCLUDED.correct_count,
           next_review_at = EXCLUDED.next_review_at,
           last_seen_at   = NOW()`,
        [userId, questionId, setId, mastered, newWrong, newCorrect, review]
      );
    }

    return res.json({ ok: true, synced: answers.length });
  } catch (e) {
    console.error('mastery sync error:', e.message);
    return res.status(500).json({ error: 'Failed to sync mastery' });
  }
});

module.exports = router;
