// Summit Write — AP World History essay module API.
// Mounted at /api/write

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const grader = require('../services/write-grader');
const { parseSaqPrompt } = require('../services/saq-parser');
const { LEVEL_THRESHOLDS, levelForXp, BADGES, getProgress, awardProgress } = require('../services/sw-progress');

const router = express.Router();

// ── Guided Walk: adaptive writing profile ─────────────────────────────────────
async function getWritingProfile(studentId) {
  const { rows } = await db.query('SELECT * FROM sw_writing_profiles WHERE student_id=$1', [studentId]);
  if (rows[0]) return rows[0];
  const { rows: created } = await db.query(
    `INSERT INTO sw_writing_profiles (student_id) VALUES ($1)
     ON CONFLICT (student_id) DO UPDATE SET student_id=$1 RETURNING *`,
    [studentId]
  );
  return created[0];
}

// 2 perfect Guided Walks in a row for an essay type levels that type up (capped at 3).
async function updateWritingProfileAfterWalk(studentId, essayType, grading) {
  const profile = await getWritingProfile(studentId);
  const typeKey = essayType.toLowerCase();
  const levelCol = `${typeKey}_level`;

  const lastScores = { ...(profile.last_rubric_scores || {}) };
  const meta = { ...(lastScores._meta || {}) };
  const streakKey = `${typeKey}_streak`;
  const perfect = grading.score === grading.maxScore;

  let streak = meta[streakKey] || 0;
  let level = profile[levelCol] || 1;
  if (perfect) {
    streak += 1;
    if (streak >= 2 && level < 3) { level += 1; streak = 0; }
  } else {
    streak = 0;
  }
  meta[streakKey] = streak;
  lastScores[typeKey] = grading.breakdown;
  lastScores._meta = meta;

  const weak = new Set(profile.weak_skills || []);
  const strong = new Set(profile.strong_skills || []);
  for (const [key, c] of Object.entries(grading.breakdown || {})) {
    const tag = `${essayType}:${key}`;
    if (c.earned) { strong.add(tag); weak.delete(tag); } else { weak.add(tag); strong.delete(tag); }
  }

  const weakSkills = Array.from(weak);
  const strongSkills = Array.from(strong);
  const { rows } = await db.query(
    `UPDATE sw_writing_profiles SET ${levelCol}=$2, weak_skills=$3, strong_skills=$4,
       guided_walks_completed=guided_walks_completed+1, last_rubric_scores=$5, updated_at=NOW()
     WHERE student_id=$1 RETURNING *`,
    [studentId, level, weakSkills, strongSkills, JSON.stringify(lastScores)]
  );
  return rows[0];
}

// Loads + validates an assignment for the Guided Walk; sends an error response and
// returns null if the assignment can't be used, otherwise returns { user, assignment, saqStructure }.
async function loadGuidedWalkAssignment(req, res) {
  const user = req.dbUser;
  if (!user) { res.status(400).json({ error: 'User not synced' }); return null; }
  const { rows } = await db.query('SELECT * FROM sw_assignments WHERE id=$1', [req.params.assignmentId]);
  const assignment = rows[0];
  if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return null; }
  const isOwner = assignment.teacher_id === user.id;
  if (!assignment.published && !isOwner) { res.status(403).json({ error: 'Not published' }); return null; }
  if (!assignment.guided_walk_enabled) { res.status(403).json({ error: 'Guided Walk is not enabled for this assignment' }); return null; }
  if (assignment.type !== 'SAQ') { res.status(400).json({ error: 'Guided Walk currently supports SAQ assignments only' }); return null; }
  const saqStructure = parseSaqPrompt(assignment.prompt);
  if (!saqStructure) { res.status(400).json({ error: 'This assignment prompt is not formatted for the Guided Walk' }); return null; }
  return { user, assignment, saqStructure };
}

// Loads + validates an assignment for the LEQ Guided Walk ("The Long Game").
async function loadLeqGuidedWalkAssignment(req, res) {
  const user = req.dbUser;
  if (!user) { res.status(400).json({ error: 'User not synced' }); return null; }
  const { rows } = await db.query('SELECT * FROM sw_assignments WHERE id=$1', [req.params.assignmentId]);
  const assignment = rows[0];
  if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return null; }
  const isOwner = assignment.teacher_id === user.id;
  if (!assignment.published && !isOwner) { res.status(403).json({ error: 'Not published' }); return null; }
  if (!assignment.guided_walk_enabled) { res.status(403).json({ error: 'Guided Walk is not enabled for this assignment' }); return null; }
  if (assignment.type !== 'LEQ') { res.status(400).json({ error: 'This Guided Walk is for LEQ assignments only' }); return null; }
  return { user, assignment };
}

// Loads + validates an assignment for the DBQ Guided Walk ("Reading the Room").
async function loadDbqGuidedWalkAssignment(req, res) {
  const user = req.dbUser;
  if (!user) { res.status(400).json({ error: 'User not synced' }); return null; }
  const { rows } = await db.query('SELECT * FROM sw_assignments WHERE id=$1', [req.params.assignmentId]);
  const assignment = rows[0];
  if (!assignment) { res.status(404).json({ error: 'Assignment not found' }); return null; }
  const isOwner = assignment.teacher_id === user.id;
  if (!assignment.published && !isOwner) { res.status(403).json({ error: 'Not published' }); return null; }
  if (!assignment.guided_walk_enabled) { res.status(403).json({ error: 'Guided Walk is not enabled for this assignment' }); return null; }
  if (assignment.type !== 'DBQ') { res.status(400).json({ error: 'This Guided Walk is for DBQ assignments only' }); return null; }
  const { rows: docs } = await db.query('SELECT * FROM sw_documents WHERE assignment_id=$1 ORDER BY doc_number', [assignment.id]);
  if (docs.length < 3) { res.status(400).json({ error: 'This DBQ needs at least 3 documents for the Guided Walk' }); return null; }
  return { user, assignment, documents: docs };
}

async function getOrCreateGwSession(studentId, assignmentId) {
  const { rows } = await db.query(
    'SELECT * FROM sw_guided_walk_sessions WHERE student_id=$1 AND assignment_id=$2',
    [studentId, assignmentId]
  );
  if (rows[0]) return rows[0];
  const { rows: created } = await db.query(
    `INSERT INTO sw_guided_walk_sessions (student_id, assignment_id) VALUES ($1,$2)
     ON CONFLICT (student_id, assignment_id) DO UPDATE SET student_id=$1 RETURNING *`,
    [studentId, assignmentId]
  );
  return created[0];
}

// ── GET /api/write/progress ───────────────────────────────────────────────────
router.get('/progress', requireAuth, async (req, res) => {
  if (!req.dbUser) return res.status(400).json({ error: 'User not synced' });
  try {
    const prog = await getProgress(req.dbUser.id);
    const nextLevelXp = LEVEL_THRESHOLDS[prog.level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    res.json({ progress: prog, badgeDefs: BADGES, nextLevelXp, thresholds: LEVEL_THRESHOLDS });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load progress' });
  }
});

// ── GET /api/write/assignments ────────────────────────────────────────────────
// Teacher: own assignments. Student: published assignments in joined classes + their submissions.
router.get('/assignments', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  try {
    if (user.role === 'teacher') {
      const { rows } = await db.query(
        `SELECT a.*, c.name AS class_name,
           (SELECT COUNT(*) FROM sw_submissions s WHERE s.assignment_id=a.id) AS submission_count,
           (SELECT COUNT(*) FROM sw_documents d WHERE d.assignment_id=a.id) AS doc_count
         FROM sw_assignments a LEFT JOIN classes c ON c.id=a.class_id
         WHERE a.teacher_id=$1 ORDER BY a.created_at DESC`,
        [user.id]
      );
      return res.json({ assignments: rows, role: 'teacher' });
    }
    const { rows } = await db.query(
      `SELECT a.*, c.name AS class_name,
         (SELECT COUNT(*) FROM sw_documents d WHERE d.assignment_id=a.id) AS doc_count,
         (SELECT json_build_object('id', s.id, 'ai_score', s.ai_score, 'max_score', s.max_score,
                                   'teacher_score', s.teacher_score, 'attempt_number', s.attempt_number,
                                   'submitted_at', s.submitted_at)
          FROM sw_submissions s
          WHERE s.assignment_id=a.id AND s.student_id=$1
          ORDER BY s.submitted_at DESC LIMIT 1) AS latest_submission
       FROM sw_assignments a
       LEFT JOIN classes c ON c.id=a.class_id
       WHERE a.published=true
         AND (a.class_id IS NULL OR a.class_id IN (SELECT class_id FROM class_members WHERE student_id=$1))
       ORDER BY a.due_date NULLS LAST, a.created_at DESC`,
      [user.id]
    );
    return res.json({ assignments: rows, role: 'student' });
  } catch (e) {
    console.error('write/assignments error:', e.message);
    res.status(500).json({ error: 'Failed to load assignments' });
  }
});

// ── POST /api/write/assignments — create (teacher) ───────────────────────────
router.post('/assignments', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const { title, type, prompt, context, classId, dueDate, isUnitTest, dbqWeight, published, documents = [] } = req.body;
  if (!title || !type || !prompt) return res.status(400).json({ error: 'title, type, and prompt are required' });
  if (!['SAQ', 'LEQ', 'DBQ'].includes(type)) return res.status(400).json({ error: 'Invalid type' });

  try {
    const id = uuidv4();
    await db.query(
      `INSERT INTO sw_assignments (id, class_id, teacher_id, title, type, prompt, context, due_date, is_unit_test, dbq_weight, published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [id, classId || null, user.id, title, type, prompt, context || null, dueDate || null,
       !!isUnitTest, dbqWeight ?? 0.6, !!published]
    );
    for (let i = 0; i < documents.length; i++) {
      const d = documents[i];
      await db.query(
        `INSERT INTO sw_documents (assignment_id, doc_number, title, body, image_url, source, year, happ_hint)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [id, i + 1, d.title || null, d.body || null, d.image_url || null, d.source || null, d.year || null, d.happ_hint || null]
      );
    }
    res.json({ ok: true, assignmentId: id });
  } catch (e) {
    console.error('write/assignments POST error:', e.message);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// ── PATCH /api/write/assignments/:id — publish/unpublish/edit basics ─────────
router.patch('/assignments/:id', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const { published, title, prompt, context, dueDate, isUnitTest, dbqWeight, guidedWalkEnabled } = req.body;
  try {
    await db.query(
      `UPDATE sw_assignments SET
         published           = COALESCE($3, published),
         title               = COALESCE($4, title),
         prompt              = COALESCE($5, prompt),
         context             = COALESCE($6, context),
         due_date            = COALESCE($7, due_date),
         is_unit_test        = COALESCE($8, is_unit_test),
         dbq_weight          = COALESCE($9, dbq_weight),
         guided_walk_enabled = COALESCE($10, guided_walk_enabled)
       WHERE id=$1 AND teacher_id=$2`,
      [req.params.id, user.id,
       typeof published === 'boolean' ? published : null,
       title || null, prompt || null, context || null,
       dueDate || null, typeof isUnitTest === 'boolean' ? isUnitTest : null,
       dbqWeight ?? null,
       typeof guidedWalkEnabled === 'boolean' ? guidedWalkEnabled : null]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update assignment' });
  }
});

// ── DELETE /api/write/assignments/:id — remove an unpublished/empty assignment
router.delete('/assignments/:id', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  try {
    const { rows: subCount } = await db.query(
      'SELECT COUNT(*)::int AS n FROM sw_submissions WHERE assignment_id=$1', [req.params.id]
    );
    if (subCount[0].n > 0) {
      return res.status(409).json({ error: 'Cannot delete an assignment with student submissions. Unpublish it instead.' });
    }
    const { rows } = await db.query(
      'DELETE FROM sw_assignments WHERE id=$1 AND teacher_id=$2 RETURNING id',
      [req.params.id, user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
});

// ── GET /api/write/assignments/:id — detail with documents ───────────────────
router.get('/assignments/:id', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  try {
    const { rows } = await db.query('SELECT * FROM sw_assignments WHERE id=$1', [req.params.id]);
    const assignment = rows[0];
    if (!assignment) return res.status(404).json({ error: 'Not found' });

    const isOwner = assignment.teacher_id === user.id;
    if (!assignment.published && !isOwner) return res.status(403).json({ error: 'Not published' });

    const { rows: docs } = await db.query(
      'SELECT * FROM sw_documents WHERE assignment_id=$1 ORDER BY doc_number', [req.params.id]
    );
    // happ_hint is a private teacher field
    const documents = docs.map((d) => (isOwner ? d : { ...d, happ_hint: undefined }));

    const { rows: drafts } = await db.query(
      'SELECT essay_text, updated_at FROM sw_drafts WHERE user_id=$1 AND assignment_id=$2',
      [user.id, req.params.id]
    );
    const { rows: subs } = await db.query(
      'SELECT id, ai_score, max_score, attempt_number, submitted_at FROM sw_submissions WHERE assignment_id=$1 AND student_id=$2 ORDER BY submitted_at DESC',
      [req.params.id, user.id]
    );

    res.json({ assignment, documents, draft: drafts[0] || null, submissions: subs, rubric: grader.RUBRICS[assignment.type] });
  } catch (e) {
    console.error('write/assignments/:id error:', e.message);
    res.status(500).json({ error: 'Failed to load assignment' });
  }
});

// ── PUT /api/write/drafts/:assignmentId — autosave ────────────────────────────
router.put('/drafts/:assignmentId', requireAuth, async (req, res) => {
  if (!req.dbUser) return res.status(400).json({ error: 'User not synced' });
  try {
    await db.query(
      `INSERT INTO sw_drafts (user_id, assignment_id, essay_text, updated_at)
       VALUES ($1,$2,$3,NOW())
       ON CONFLICT (user_id, assignment_id) DO UPDATE SET essay_text=$3, updated_at=NOW()`,
      [req.dbUser.id, req.params.assignmentId, req.body.essayText || '']
    );
    res.json({ ok: true, savedAt: Date.now() });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// ── POST /api/write/generate-prompt — AI assignment generator (teacher) ──────
router.post('/generate-prompt', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const { description, type } = req.body;
  if (!description || !type) return res.status(400).json({ error: 'description and type required' });
  const result = await grader.generateAssignmentPrompt({ description, type });
  res.json(result);
});

// ── POST /api/write/precheck — fast pre-submission scan ──────────────────────
router.post('/precheck', requireAuth, async (req, res) => {
  const { assignmentId, essayText } = req.body;
  if (!assignmentId || !essayText) return res.status(400).json({ error: 'assignmentId and essayText required' });
  try {
    const { rows } = await db.query('SELECT type, prompt FROM sw_assignments WHERE id=$1', [assignmentId]);
    if (!rows[0]) return res.status(404).json({ error: 'Assignment not found' });
    const checks = await grader.precheck({ essayType: rows[0].type, prompt: rows[0].prompt, essayText });
    res.json({ checks, aiEnabled: grader.hasKey });
  } catch (e) {
    res.status(500).json({ error: 'Precheck failed' });
  }
});

// ── POST /api/write/grade — full submission grading ───────────────────────────
router.post('/grade', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  const { assignmentId, essayText } = req.body;
  if (!assignmentId || !essayText || essayText.trim().length < 20) {
    return res.status(400).json({ error: 'assignmentId and a non-trivial essayText are required' });
  }
  try {
    const { rows } = await db.query('SELECT * FROM sw_assignments WHERE id=$1', [assignmentId]);
    const assignment = rows[0];
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const { rows: docs } = await db.query(
      'SELECT doc_number, title, body, source, year FROM sw_documents WHERE assignment_id=$1 ORDER BY doc_number',
      [assignmentId]
    );
    const { rows: prevSubs } = await db.query(
      'SELECT COUNT(*)::int AS n FROM sw_submissions WHERE assignment_id=$1 AND student_id=$2',
      [assignmentId, user.id]
    );
    const attemptNumber = (prevSubs[0]?.n || 0) + 1;

    const grading = await grader.gradeEssay({
      essayType: assignment.type,
      prompt: assignment.prompt,
      essayText,
      documents: docs,
      attemptNumber,
    });

    const submissionId = uuidv4();
    await db.query(
      `INSERT INTO sw_submissions (id, assignment_id, student_id, essay_text, attempt_number, ai_score, max_score, grading_json)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [submissionId, assignmentId, user.id, essayText, attemptNumber, grading.score, grading.maxScore, JSON.stringify(grading)]
    );

    // Gamification: XP + skills + badges
    const firstAttempt = attemptNumber === 1;
    const xpGain = Math.round(grading.score * 15 * (firstAttempt ? 1.5 : 1));
    const skillUpdates = {};
    for (const [k, v] of Object.entries(grading.breakdown || {})) {
      skillUpdates[k] = v.earned ? +8 : -3;
    }
    const newBadges = [];
    if (attemptNumber === 1) {
      const { rows: total } = await db.query('SELECT COUNT(*)::int AS n FROM sw_submissions WHERE student_id=$1', [user.id]);
      if (total[0].n === 1) newBadges.push('trail_blazer');
    }
    if (assignment.type === 'DBQ' && grading.score >= 6) newBadges.push('summit_writer');
    if (grading.breakdown?.evidence_documents?.points === 3) newBadges.push('sourcing_scout');
    const { rows: ctxCount } = await db.query(
      `SELECT COUNT(*)::int AS n FROM sw_submissions
       WHERE student_id=$1 AND (grading_json->'breakdown'->'contextualization'->>'earned')='true'`,
      [user.id]
    );
    if (ctxCount[0].n >= 5) newBadges.push('context_climber');
    const { rows: cplxCount } = await db.query(
      `SELECT COUNT(*)::int AS n FROM sw_submissions
       WHERE student_id=$1 AND (grading_json->'breakdown'->'complexity'->>'earned')='true'`,
      [user.id]
    );
    if (cplxCount[0].n >= 3) newBadges.push('complexity_king');

    const award = await awardProgress(user.id, { xpGain, skillUpdates, newBadges });

    res.json({ submissionId, grading, award, attemptNumber });
  } catch (e) {
    console.error('write/grade error:', e.message);
    res.status(500).json({ error: 'Grading failed' });
  }
});

// ── GET /api/write/submissions/:id ────────────────────────────────────────────
router.get('/submissions/:id', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  try {
    const { rows } = await db.query(
      `SELECT s.*, a.title AS assignment_title, a.type AS assignment_type, a.prompt AS assignment_prompt, a.teacher_id,
              u.name AS student_name
       FROM sw_submissions s
       JOIN sw_assignments a ON a.id=s.assignment_id
       JOIN users u ON u.id=s.student_id
       WHERE s.id=$1`,
      [req.params.id]
    );
    const sub = rows[0];
    if (!sub) return res.status(404).json({ error: 'Not found' });
    if (sub.student_id !== user.id && sub.teacher_id !== user.id) return res.status(403).json({ error: 'Forbidden' });
    res.json({ submission: sub, rubric: grader.RUBRICS[sub.assignment_type] });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load submission' });
  }
});

// ── POST /api/write/revise — re-grade one criterion ───────────────────────────
router.post('/revise', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  const { submissionId, criterion, revisedPassage } = req.body;
  if (!submissionId || !criterion || !revisedPassage) return res.status(400).json({ error: 'submissionId, criterion, revisedPassage required' });
  try {
    const { rows } = await db.query(
      `SELECT s.*, a.type, a.prompt FROM sw_submissions s JOIN sw_assignments a ON a.id=s.assignment_id
       WHERE s.id=$1 AND s.student_id=$2`,
      [submissionId, user.id]
    );
    const sub = rows[0];
    if (!sub) return res.status(404).json({ error: 'Submission not found' });

    const grading = sub.grading_json || {};
    const prev = grading.breakdown?.[criterion];
    const result = await grader.regradeCriterion({
      essayType: sub.type,
      prompt: sub.prompt,
      originalEssay: sub.essay_text,
      criterion,
      revisedPassage,
      previousFeedback: prev?.feedback,
    });
    if (!result) return res.status(500).json({ error: 'Revision grading failed' });

    const improved = result.points > (prev?.points || 0);
    if (improved) {
      grading.breakdown[criterion] = { ...prev, ...result, revised: true };
      grading.score = Object.values(grading.breakdown).reduce((s, c) => s + (c.points || 0), 0);
      await db.query(
        'UPDATE sw_submissions SET grading_json=$2, ai_score=$3 WHERE id=$1',
        [submissionId, JSON.stringify(grading), grading.score]
      );
      const award = await awardProgress(user.id, {
        xpGain: result.points * 10,
        skillUpdates: { [criterion]: +10 },
        newBadges: ['revision_ranger'],
      });
      return res.json({ result, improved: true, newScore: grading.score, award });
    }
    res.json({ result, improved: false, newScore: grading.score });
  } catch (e) {
    console.error('write/revise error:', e.message);
    res.status(500).json({ error: 'Revision failed' });
  }
});

// ── Practice drills ───────────────────────────────────────────────────────────
router.post('/drill/generate', requireAuth, async (req, res) => {
  const { criterion, essayType = 'DBQ' } = req.body;
  if (!criterion) return res.status(400).json({ error: 'criterion required' });
  res.json(await grader.generateDrill({ criterion, essayType }));
});

router.post('/drill/grade', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  const { criterion, drillPrompt, answer } = req.body;
  if (!criterion || !answer) return res.status(400).json({ error: 'criterion and answer required' });
  const result = await grader.gradeDrill({ criterion, drillPrompt, answer });
  const award = await awardProgress(user.id, {
    xpGain: result.earned ? 50 : 15,
    skillUpdates: { [criterion]: result.earned ? +10 : +2 },
    newBadges: [],
  });
  res.json({ result, award });
});

// ── Teacher: inbox ────────────────────────────────────────────────────────────
router.get('/inbox', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  try {
    const { rows } = await db.query(
      `SELECT s.id, s.assignment_id, s.attempt_number, s.ai_score, s.max_score, s.teacher_score, s.submitted_at,
              u.name AS student_name, a.title AS assignment_title, a.type AS assignment_type, c.name AS class_name
       FROM sw_submissions s
       JOIN sw_assignments a ON a.id=s.assignment_id
       JOIN users u ON u.id=s.student_id
       LEFT JOIN classes c ON c.id=a.class_id
       WHERE a.teacher_id=$1
       ORDER BY s.submitted_at DESC LIMIT 200`,
      [user.id]
    );
    res.json({ submissions: rows });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load inbox' });
  }
});

// ── Teacher: override score / note ────────────────────────────────────────────
router.patch('/submissions/:id', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const { teacherScore, teacherNote } = req.body;
  try {
    const { rows } = await db.query(
      `UPDATE sw_submissions s SET teacher_score=COALESCE($3, s.teacher_score), teacher_note=COALESCE($4, s.teacher_note)
       FROM sw_assignments a
       WHERE s.id=$1 AND a.id=s.assignment_id AND a.teacher_id=$2
       RETURNING s.id`,
      [req.params.id, user.id, teacherScore ?? null, teacherNote ?? null]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update submission' });
  }
});

// ── Teacher: MCQ entry ────────────────────────────────────────────────────────
router.post('/mcq', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  const { assignmentId, studentId, score } = req.body;
  if (!assignmentId || !studentId || score == null) return res.status(400).json({ error: 'assignmentId, studentId, score required' });
  try {
    await db.query(
      `INSERT INTO sw_mcq_scores (assignment_id, student_id, score, entered_by)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (assignment_id, student_id) DO UPDATE SET score=$3, entered_by=$4, entered_at=NOW()`,
      [assignmentId, studentId, score, user.id]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save MCQ score' });
  }
});

// ── Teacher: gradebook for one assignment ────────────────────────────────────
router.get('/gradebook/:assignmentId', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  try {
    const { rows: arows } = await db.query(
      'SELECT * FROM sw_assignments WHERE id=$1 AND teacher_id=$2', [req.params.assignmentId, user.id]
    );
    const assignment = arows[0];
    if (!assignment) return res.status(404).json({ error: 'Not found' });

    const { rows } = await db.query(
      `SELECT u.id AS student_id, u.name AS student_name,
        (SELECT json_build_object('id', s.id, 'ai_score', s.ai_score, 'max_score', s.max_score,
                                  'teacher_score', s.teacher_score, 'attempt_number', s.attempt_number,
                                  'grading_json', s.grading_json)
         FROM sw_submissions s
         WHERE s.assignment_id=$1 AND s.student_id=u.id
         ORDER BY COALESCE(s.teacher_score, s.ai_score) DESC NULLS LAST, s.submitted_at DESC LIMIT 1) AS best_submission,
        (SELECT m.score FROM sw_mcq_scores m WHERE m.assignment_id=$1 AND m.student_id=u.id) AS mcq_score
       FROM users u
       WHERE u.id IN (
         SELECT student_id FROM class_members WHERE class_id=$2
         UNION SELECT student_id FROM sw_submissions WHERE assignment_id=$1
       )
       ORDER BY u.name`,
      [req.params.assignmentId, assignment.class_id]
    );

    const dbqWeight = parseFloat(assignment.dbq_weight) || 0.6;
    const students = rows.map((r) => {
      const sub = r.best_submission;
      const essayScore = sub ? (sub.teacher_score ?? sub.ai_score) : null;
      const essayPct = sub && essayScore != null ? Math.round((essayScore / sub.max_score) * 100) : null;
      const mcq = r.mcq_score != null ? parseFloat(r.mcq_score) : null;
      let unitGrade = null;
      if (assignment.is_unit_test && essayPct != null && mcq != null) {
        unitGrade = Math.round(essayPct * dbqWeight + mcq * (1 - dbqWeight));
      }
      return { ...r, essay_score: essayScore, essay_pct: essayPct, unit_grade: unitGrade };
    });

    res.json({ assignment, students, dbqWeight });
  } catch (e) {
    console.error('write/gradebook error:', e.message);
    res.status(500).json({ error: 'Failed to load gradebook' });
  }
});

// ── Teacher: analytics (rubric heatmap + reteach flags) ───────────────────────
router.get('/analytics/:assignmentId', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  try {
    const { rows: arows } = await db.query(
      'SELECT * FROM sw_assignments WHERE id=$1 AND teacher_id=$2', [req.params.assignmentId, user.id]
    );
    if (!arows[0]) return res.status(404).json({ error: 'Not found' });

    const { rows } = await db.query(
      `SELECT DISTINCT ON (s.student_id) s.student_id, u.name AS student_name, s.grading_json
       FROM sw_submissions s JOIN users u ON u.id=s.student_id
       WHERE s.assignment_id=$1
       ORDER BY s.student_id, s.submitted_at DESC`,
      [req.params.assignmentId]
    );

    const criteria = Object.keys(grader.RUBRICS[arows[0].type]?.criteria || {});
    const heatmap = rows.map((r) => ({
      student_name: r.student_name,
      cells: criteria.map((c) => ({ criterion: c, earned: !!r.grading_json?.breakdown?.[c]?.earned })),
    }));

    const flags = [];
    for (const c of criteria) {
      const earnedCount = rows.filter((r) => r.grading_json?.breakdown?.[c]?.earned).length;
      if (rows.length >= 3 && earnedCount / rows.length < 0.5) {
        flags.push({
          criterion: c,
          pct_missed: Math.round((1 - earnedCount / rows.length) * 100),
          message: `${Math.round((1 - earnedCount / rows.length) * 100)}% of students missed ${c.replace(/_/g, ' ')}`,
        });
      }
    }

    res.json({ criteria, heatmap, flags, submissionCount: rows.length });
  } catch (e) {
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

// ── Guided Walk: SAQ "The Art of Three" ───────────────────────────────────────

// GET /api/write/guided-walk/:assignmentId — get-or-create session, returns everything
// the client needs to render the walk.
router.get('/guided-walk/:assignmentId', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const profile = await getWritingProfile(ctx.user.id);
    res.json({ assignment: ctx.assignment, saqStructure: ctx.saqStructure, session, profile, rubric: grader.RUBRICS.SAQ });
  } catch (e) {
    console.error('guided-walk GET error:', e.message);
    res.status(500).json({ error: 'Failed to load guided walk' });
  }
});

// PATCH /api/write/guided-walk/:assignmentId — autosave (phase / part responses / reflection)
router.patch('/guided-walk/:assignmentId', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const { phase, partResponses, reflection } = req.body;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET
         phase          = COALESCE($3, phase),
         part_responses = COALESCE($4, part_responses),
         reflection     = COALESCE($5, reflection),
         updated_at     = NOW()
       WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id,
       phase || null,
       partResponses ? JSON.stringify(partResponses) : null,
       reflection ?? null]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('guided-walk PATCH error:', e.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// POST /api/write/guided-walk/:assignmentId/decode — Phase 2 highlight elements + MCQ
router.post('/guided-walk/:assignmentId/decode', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    if (session.decode_data && !req.body?.regenerate) {
      return res.json({ decode: session.decode_data });
    }
    const decode = await grader.generateDecodeBundle({
      context: ctx.assignment.context,
      title: ctx.assignment.title,
      partAText: ctx.saqStructure.parts.A.text,
    });
    await db.query(
      `UPDATE sw_guided_walk_sessions SET decode_data=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(decode)]
    );
    res.json({ decode });
  } catch (e) {
    console.error('guided-walk decode error:', e.message);
    res.status(500).json({ error: 'Failed to generate prompt decode' });
  }
});

// POST /api/write/guided-walk/:assignmentId/ask — Clio's next Socratic question for one part
router.post('/guided-walk/:assignmentId/ask', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { part } = req.body;
    if (!['A', 'B', 'C'].includes(part)) return res.status(400).json({ error: 'part must be A, B, or C' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses[part] || { locked: false, finalText: '', history: [] };

    const profile = await getWritingProfile(ctx.user.id);
    const weakSkills = (profile.weak_skills || [])
      .filter((s) => s.startsWith('SAQ:'))
      .map((s) => s.split(':')[1]);

    const { question } = await grader.generateClioQuestion({
      assignmentTitle: ctx.assignment.title,
      partLabel: part,
      partText: ctx.saqStructure.parts[part].text,
      studentLevel: profile.saq_level || 1,
      weakSkills,
      history: current.history,
    });

    current.history = [...current.history, { role: 'clio', text: question }];
    partResponses[part] = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ question, history: current.history });
  } catch (e) {
    console.error('guided-walk ask error:', e.message);
    res.status(500).json({ error: 'Failed to get a question from Clio' });
  }
});

// POST /api/write/guided-walk/:assignmentId/answer — evaluate a student's response to one part
router.post('/guided-walk/:assignmentId/answer', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { part, text } = req.body;
    if (!['A', 'B', 'C'].includes(part)) return res.status(400).json({ error: 'part must be A, B, or C' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses[part] || { locked: false, finalText: '', history: [] };
    if (current.locked) return res.status(409).json({ error: 'This part is already locked' });

    const profile = await getWritingProfile(ctx.user.id);

    const evalResult = await grader.evaluateClioResponse({
      assignmentTitle: ctx.assignment.title,
      partLabel: part,
      partText: ctx.saqStructure.parts[part].text,
      studentLevel: profile.saq_level || 1,
      studentText: text,
      history: current.history,
    });

    const studentTurns = current.history.filter((h) => h.role === 'student').length + 1;
    const advance = !!(evalResult.advance || studentTurns >= 5);

    current.history = [...current.history, { role: 'student', text }, { role: 'clio', text: evalResult.clio_response }];
    if (advance) {
      current.locked = true;
      current.finalText = text;
    }
    partResponses[part] = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ...evalResult, advance, history: current.history, locked: current.locked, finalText: current.finalText });
  } catch (e) {
    console.error('guided-walk answer error:', e.message);
    res.status(500).json({ error: 'Failed to evaluate your response' });
  }
});

// POST /api/write/guided-walk/:assignmentId/reflection — optional, non-graded reflection
router.post('/guided-walk/:assignmentId/reflection', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    await db.query(
      `UPDATE sw_guided_walk_sessions SET reflection=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, req.body?.text || '']
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save reflection' });
  }
});

// POST /api/write/guided-walk/:assignmentId/compile — compile the 3 locked parts, grade,
// create a submission, and award XP/badges + update the adaptive profile.
router.post('/guided-walk/:assignmentId/compile', requireAuth, async (req, res) => {
  try {
    const ctx = await loadGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    for (const p of ['A', 'B', 'C']) {
      if (!partResponses[p]?.locked) return res.status(409).json({ error: `Part ${p} is not complete yet` });
    }
    const compiledText = `a) ${partResponses.A.finalText}\n\nb) ${partResponses.B.finalText}\n\nc) ${partResponses.C.finalText}`;

    const { rows: prevSubs } = await db.query(
      'SELECT COUNT(*)::int AS n FROM sw_submissions WHERE assignment_id=$1 AND student_id=$2',
      [ctx.assignment.id, ctx.user.id]
    );
    const attemptNumber = (prevSubs[0]?.n || 0) + 1;

    const grading = await grader.gradeEssay({
      essayType: 'SAQ',
      prompt: ctx.assignment.prompt,
      essayText: compiledText,
      documents: [],
      attemptNumber,
    });

    const submissionId = uuidv4();
    await db.query(
      `INSERT INTO sw_submissions (id, assignment_id, student_id, essay_text, attempt_number, ai_score, max_score, grading_json)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [submissionId, ctx.assignment.id, ctx.user.id, compiledText, attemptNumber, grading.score, grading.maxScore, JSON.stringify(grading)]
    );

    const skillUpdates = {};
    for (const [k, v] of Object.entries(grading.breakdown || {})) {
      skillUpdates[k] = v.earned ? +8 : -3;
    }
    const newBadges = [];
    if (attemptNumber === 1) {
      const { rows: total } = await db.query('SELECT COUNT(*)::int AS n FROM sw_submissions WHERE student_id=$1', [ctx.user.id]);
      if (total[0].n === 1) newBadges.push('trail_blazer');
    }
    // +50 XP Guided Walk completion bonus on top of the usual essay-grading award
    const xpGain = Math.round(grading.score * 15 * (attemptNumber === 1 ? 1.5 : 1)) + 50;

    const award = await awardProgress(ctx.user.id, { xpGain, skillUpdates, newBadges });
    const profile = await updateWritingProfileAfterWalk(ctx.user.id, 'SAQ', grading);

    await db.query(
      `UPDATE sw_guided_walk_sessions SET phase='complete', rubric_result=$3, completed_at=NOW(), updated_at=NOW()
       WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(grading)]
    );

    res.json({ submissionId, grading, award, profile, compiledText, attemptNumber });
  } catch (e) {
    console.error('guided-walk compile error:', e.message);
    res.status(500).json({ error: 'Failed to compile and grade your essay' });
  }
});

// ── Guided Walk: LEQ "The Long Game" ──────────────────────────────────────────

const LEQ_ASK_STAGES = ['contextualization', 'evidence_1', 'evidence_2', 'complexity'];

function defaultLeqStageState(stage) {
  if (stage.startsWith('evidence')) return { step: 'evidence', evidenceText: '', analysisText: '', locked: false, history: [] };
  if (stage === 'complexity') return { pathway: null, locked: false, finalText: '', history: [] };
  return { locked: false, finalText: '', history: [] };
}

// Extra context fed to the grader for stages that build on earlier answers.
function buildLeqStageContext(graderStage, current, partResponses) {
  if (graderStage === 'analysis') {
    return `\nStudent's evidence for this point: ${current.evidenceText || ''}`;
  }
  if (graderStage === 'complexity') {
    const ctxText = partResponses.contextualization?.finalText || '';
    const ev1 = partResponses.evidence_1 || {};
    const ev2 = partResponses.evidence_2 || {};
    return `\nFor reference, here is the rest of the student's essay so far:\nContextualization: ${ctxText}\nEvidence 1: ${ev1.evidenceText || ''} — Analysis: ${ev1.analysisText || ''}\nEvidence 2: ${ev2.evidenceText || ''} — Analysis: ${ev2.analysisText || ''}`;
  }
  return '';
}

// GET /api/write/guided-walk-leq/:assignmentId — get-or-create session
router.get('/guided-walk-leq/:assignmentId', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const profile = await getWritingProfile(ctx.user.id);
    res.json({
      assignment: ctx.assignment, session, profile,
      rubric: grader.RUBRICS.LEQ, complexityPathways: grader.LEQ_COMPLEXITY_PATHWAYS,
    });
  } catch (e) {
    console.error('guided-walk-leq GET error:', e.message);
    res.status(500).json({ error: 'Failed to load guided walk' });
  }
});

// PATCH /api/write/guided-walk-leq/:assignmentId — autosave (phase / part responses / reflection)
router.patch('/guided-walk-leq/:assignmentId', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const { phase, partResponses, reflection } = req.body;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET
         phase          = COALESCE($3, phase),
         part_responses = COALESCE($4, part_responses),
         reflection     = COALESCE($5, reflection),
         updated_at     = NOW()
       WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id,
       phase || null,
       partResponses ? JSON.stringify(partResponses) : null,
       reflection ?? null]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('guided-walk-leq PATCH error:', e.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/decode — Phase 2 highlight elements + historical-skill MCQ
router.post('/guided-walk-leq/:assignmentId/decode', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    if (session.decode_data && !req.body?.regenerate) {
      return res.json({ decode: session.decode_data });
    }
    const decode = await grader.generateLeqDecodeBundle({
      context: ctx.assignment.context,
      title: ctx.assignment.title,
      promptText: ctx.assignment.prompt,
    });
    await db.query(
      `UPDATE sw_guided_walk_sessions SET decode_data=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(decode)]
    );
    res.json({ decode });
  } catch (e) {
    console.error('guided-walk-leq decode error:', e.message);
    res.status(500).json({ error: 'Failed to generate prompt decode' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/thesis — Phase 3 thesis builder (claim + reasoning)
router.post('/guided-walk-leq/:assignmentId/thesis', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { claim, reasoning } = req.body;
    if (!claim || !claim.trim() || !reasoning || !reasoning.trim()) {
      return res.status(400).json({ error: 'claim and reasoning are required' });
    }

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses.thesis || { locked: false, attempts: 0 };
    if (current.locked) return res.status(409).json({ error: 'Thesis is already locked' });

    const attemptNumber = (current.attempts || 0) + 1;
    const evalResult = await grader.evaluateLeqThesis({
      assignmentTitle: ctx.assignment.title,
      prompt: ctx.assignment.prompt,
      claim, reasoning, attemptNumber,
    });

    partResponses.thesis = { claim, reasoning, attempts: attemptNumber, locked: !!evalResult.approved };
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ...evalResult, attempts: attemptNumber, locked: partResponses.thesis.locked });
  } catch (e) {
    console.error('guided-walk-leq thesis error:', e.message);
    res.status(500).json({ error: 'Failed to evaluate your thesis' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/complexity-pathway — Phase 6 pathway choice
router.post('/guided-walk-leq/:assignmentId/complexity-pathway', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { pathway } = req.body;
    if (!grader.LEQ_COMPLEXITY_PATHWAYS[pathway]) return res.status(400).json({ error: 'Invalid pathway' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    if (partResponses.complexity?.locked) return res.status(409).json({ error: 'Complexity is already locked' });
    partResponses.complexity = { pathway, locked: false, finalText: '', history: [] };
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ok: true, pathway });
  } catch (e) {
    console.error('guided-walk-leq complexity-pathway error:', e.message);
    res.status(500).json({ error: 'Failed to set complexity pathway' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/ask — Clio's next question for a stage
router.post('/guided-walk-leq/:assignmentId/ask', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { stage } = req.body;
    if (!LEQ_ASK_STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses[stage] || defaultLeqStageState(stage);
    if (stage === 'complexity' && !current.pathway) {
      return res.status(409).json({ error: 'Choose a complexity pathway first' });
    }

    const graderStage = stage.startsWith('evidence')
      ? (current.step === 'analysis' ? 'analysis' : 'evidence')
      : stage === 'complexity' ? 'complexity' : 'contextualization';

    const profile = await getWritingProfile(ctx.user.id);
    const weakSkills = (profile.weak_skills || [])
      .filter((s) => s.startsWith('LEQ:'))
      .map((s) => s.split(':')[1]);

    const { question } = await grader.generateLeqStageQuestion({
      stage: graderStage,
      assignmentTitle: ctx.assignment.title,
      prompt: ctx.assignment.prompt,
      thesis: partResponses.thesis,
      stageContext: buildLeqStageContext(graderStage, current, partResponses),
      pathway: stage === 'complexity' ? current.pathway : null,
      studentLevel: profile.leq_level || 1,
      history: current.history,
    });

    current.history = [...current.history, { role: 'clio', text: question }];
    partResponses[stage] = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ question, history: current.history, step: current.step });
  } catch (e) {
    console.error('guided-walk-leq ask error:', e.message);
    res.status(500).json({ error: 'Failed to get a question from Clio' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/answer — evaluate a student's response to a stage
router.post('/guided-walk-leq/:assignmentId/answer', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { stage, text } = req.body;
    if (!LEQ_ASK_STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses[stage] || defaultLeqStageState(stage);
    if (current.locked) return res.status(409).json({ error: 'This stage is already locked' });
    if (stage === 'complexity' && !current.pathway) {
      return res.status(409).json({ error: 'Choose a complexity pathway first' });
    }

    const graderStage = stage.startsWith('evidence')
      ? (current.step === 'analysis' ? 'analysis' : 'evidence')
      : stage === 'complexity' ? 'complexity' : 'contextualization';

    const profile = await getWritingProfile(ctx.user.id);

    const evalResult = await grader.evaluateLeqStageResponse({
      stage: graderStage,
      assignmentTitle: ctx.assignment.title,
      prompt: ctx.assignment.prompt,
      thesis: partResponses.thesis,
      stageContext: buildLeqStageContext(graderStage, current, partResponses),
      pathway: stage === 'complexity' ? current.pathway : null,
      studentLevel: profile.leq_level || 1,
      studentText: text,
      history: current.history,
    });

    const studentTurns = current.history.filter((h) => h.role === 'student').length + 1;
    const advance = !!(evalResult.advance || studentTurns >= 5);

    current.history = [...current.history, { role: 'student', text }, { role: 'clio', text: evalResult.clio_response }];

    if (advance) {
      if (stage.startsWith('evidence') && graderStage === 'evidence') {
        current.evidenceText = text;
        current.step = 'analysis';
        current.history = []; // fresh conversation for the analysis sub-step
      } else if (stage.startsWith('evidence') && graderStage === 'analysis') {
        current.analysisText = text;
        current.step = 'done';
        current.locked = true;
      } else {
        current.locked = true;
        current.finalText = text;
      }
    }

    partResponses[stage] = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({
      ...evalResult, advance, history: current.history, locked: current.locked, step: current.step,
      evidenceText: current.evidenceText, analysisText: current.analysisText, finalText: current.finalText,
    });
  } catch (e) {
    console.error('guided-walk-leq answer error:', e.message);
    res.status(500).json({ error: 'Failed to evaluate your response' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/reflection — optional, non-graded reflection
router.post('/guided-walk-leq/:assignmentId/reflection', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    await db.query(
      `UPDATE sw_guided_walk_sessions SET reflection=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, req.body?.text || '']
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save reflection' });
  }
});

// POST /api/write/guided-walk-leq/:assignmentId/compile — compile thesis + contextualization +
// 2x evidence/analysis + complexity into a full LEQ, grade, create a submission, and award XP/badges.
router.post('/guided-walk-leq/:assignmentId/compile', requireAuth, async (req, res) => {
  try {
    const ctx = await loadLeqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};

    if (!partResponses.thesis?.locked) return res.status(409).json({ error: 'Thesis is not locked yet' });
    if (!partResponses.contextualization?.locked) return res.status(409).json({ error: 'Contextualization is not complete yet' });
    if (!partResponses.evidence_1?.locked) return res.status(409).json({ error: 'Evidence 1 is not complete yet' });
    if (!partResponses.evidence_2?.locked) return res.status(409).json({ error: 'Evidence 2 is not complete yet' });
    if (!partResponses.complexity?.locked) return res.status(409).json({ error: 'Complexity is not complete yet' });

    const thesisSentence = `${partResponses.thesis.claim} ${partResponses.thesis.reasoning}`.trim();
    const compiledText = [
      partResponses.contextualization.finalText,
      thesisSentence,
      `${partResponses.evidence_1.evidenceText} ${partResponses.evidence_1.analysisText}`.trim(),
      `${partResponses.evidence_2.evidenceText} ${partResponses.evidence_2.analysisText}`.trim(),
      partResponses.complexity.finalText,
    ].join('\n\n');

    const { rows: prevSubs } = await db.query(
      'SELECT COUNT(*)::int AS n FROM sw_submissions WHERE assignment_id=$1 AND student_id=$2',
      [ctx.assignment.id, ctx.user.id]
    );
    const attemptNumber = (prevSubs[0]?.n || 0) + 1;

    const grading = await grader.gradeEssay({
      essayType: 'LEQ',
      prompt: ctx.assignment.prompt,
      essayText: compiledText,
      documents: [],
      attemptNumber,
    });

    const submissionId = uuidv4();
    await db.query(
      `INSERT INTO sw_submissions (id, assignment_id, student_id, essay_text, attempt_number, ai_score, max_score, grading_json)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [submissionId, ctx.assignment.id, ctx.user.id, compiledText, attemptNumber, grading.score, grading.maxScore, JSON.stringify(grading)]
    );

    const skillUpdates = {};
    for (const [k, v] of Object.entries(grading.breakdown || {})) {
      skillUpdates[k] = v.earned ? +8 : -3;
    }
    const newBadges = [];
    if (attemptNumber === 1) {
      const { rows: total } = await db.query('SELECT COUNT(*)::int AS n FROM sw_submissions WHERE student_id=$1', [ctx.user.id]);
      if (total[0].n === 1) newBadges.push('trail_blazer');
    }
    // +50 XP Guided Walk completion bonus on top of the usual essay-grading award
    const xpGain = Math.round(grading.score * 15 * (attemptNumber === 1 ? 1.5 : 1)) + 50;

    const award = await awardProgress(ctx.user.id, { xpGain, skillUpdates, newBadges });
    const profile = await updateWritingProfileAfterWalk(ctx.user.id, 'LEQ', grading);

    await db.query(
      `UPDATE sw_guided_walk_sessions SET phase='complete', rubric_result=$3, completed_at=NOW(), updated_at=NOW()
       WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(grading)]
    );

    res.json({ submissionId, grading, award, profile, compiledText, attemptNumber });
  } catch (e) {
    console.error('guided-walk-leq compile error:', e.message);
    res.status(500).json({ error: 'Failed to compile and grade your essay' });
  }
});

// ── Guided Walk: DBQ "Reading the Room" ───────────────────────────────────────

const DBQ_HAPP_FULL_DOC = 1;
const DBQ_HAPP_ABBREV_DOCS = [2, 3];
const DBQ_EVIDENCE_STAGES = ['evidence_1', 'evidence_2', 'evidence_3'];
const DBQ_ASK_STAGES = ['contextualization', ...DBQ_EVIDENCE_STAGES, 'evidence_beyond', 'complexity'];

function defaultDbqStageState(stage) {
  if (DBQ_EVIDENCE_STAGES.includes(stage)) return { docNumber: null, step: 'evidence', evidenceText: '', sourcingText: '', locked: false, history: [] };
  if (stage === 'complexity') return { pathway: null, locked: false, finalText: '', history: [] };
  return { locked: false, finalText: '', history: [] }; // contextualization, evidence_beyond
}

// Extra context fed to the grader for stages that build on earlier answers.
function buildDbqStageContext(graderStage, current, partResponses, documents) {
  if (graderStage === 'sourcing') {
    const doc = documents.find((d) => d.doc_number === current.docNumber);
    let block = `\nStudent's evidence summary/connection for this document: ${current.evidenceText || ''}`;
    if (doc?.happ_hint) block += `\n(Internal grading hint, do not reveal to student): ${doc.happ_hint}`;
    return block;
  }
  if (graderStage === 'complexity') {
    const ctxText = partResponses.contextualization?.finalText || '';
    const usedDocs = DBQ_EVIDENCE_STAGES.map((s) => partResponses[s]?.docNumber).filter(Boolean);
    const unusedDocs = documents.map((d) => d.doc_number).filter((n) => !usedDocs.includes(n));
    const docLines = DBQ_EVIDENCE_STAGES.map((s) => {
      const ev = partResponses[s] || {};
      return `Document ${ev.docNumber}: ${ev.evidenceText || ''} — Sourcing: ${ev.sourcingText || ''}`;
    }).join('\n');
    return `\nFor reference, here is the rest of the student's essay so far:\nContextualization: ${ctxText}\n${docLines}\nOutside evidence: ${partResponses.evidence_beyond?.finalText || ''}\nDBQ-specific complexity coaching: complexity often comes from noticing what's NOT in the documents (unused document numbers: ${unusedDocs.join(', ') || 'none'}), or from connecting the documents' time period to what came before or after.`;
  }
  return '';
}

// GET /api/write/guided-walk-dbq/:assignmentId — get-or-create session
router.get('/guided-walk-dbq/:assignmentId', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const profile = await getWritingProfile(ctx.user.id);
    const isOwner = ctx.assignment.teacher_id === ctx.user.id;
    const documents = ctx.documents.map((d) => (isOwner ? d : { ...d, happ_hint: undefined }));
    res.json({
      assignment: ctx.assignment, documents, session, profile,
      rubric: grader.RUBRICS.DBQ, complexityPathways: grader.LEQ_COMPLEXITY_PATHWAYS,
      happDimensions: grader.HAPP_DIMENSIONS,
      happFullDoc: DBQ_HAPP_FULL_DOC, happAbbrevDocs: DBQ_HAPP_ABBREV_DOCS,
    });
  } catch (e) {
    console.error('guided-walk-dbq GET error:', e.message);
    res.status(500).json({ error: 'Failed to load guided walk' });
  }
});

// PATCH /api/write/guided-walk-dbq/:assignmentId — autosave (phase / part responses / reflection)
router.patch('/guided-walk-dbq/:assignmentId', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const { phase, partResponses, reflection } = req.body;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET
         phase          = COALESCE($3, phase),
         part_responses = COALESCE($4, part_responses),
         reflection     = COALESCE($5, reflection),
         updated_at     = NOW()
       WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id,
       phase || null,
       partResponses ? JSON.stringify(partResponses) : null,
       reflection ?? null]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error('guided-walk-dbq PATCH error:', e.message);
    res.status(500).json({ error: 'Failed to save progress' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/triage — Phase 1 document triage piles
router.post('/guided-walk-dbq/:assignmentId/triage', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { triage } = req.body;
    if (!triage || typeof triage !== 'object') return res.status(400).json({ error: 'triage is required' });

    const docNumbers = new Set(ctx.documents.map((d) => d.doc_number));
    const cleaned = {};
    for (const [k, v] of Object.entries(triage)) {
      const docNum = Number(k);
      if (docNumbers.has(docNum) && (v === 'supports' || v === 'complicates')) cleaned[docNum] = v;
    }

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses.documents || {};
    current.triage = cleaned;
    partResponses.documents = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ok: true, triage: cleaned });
  } catch (e) {
    console.error('guided-walk-dbq triage error:', e.message);
    res.status(500).json({ error: 'Failed to save document triage' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/happ — Phase 2 HAPP Deep Dive responses
router.post('/guided-walk-dbq/:assignmentId/happ', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { docNumber, dimension, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });
    const num = Number(docNumber);
    const doc = ctx.documents.find((d) => d.doc_number === num);
    if (!doc) return res.status(400).json({ error: 'Invalid docNumber' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses.documents || {};

    let feedback;
    if (num === DBQ_HAPP_FULL_DOC) {
      if (!grader.HAPP_DIMENSIONS[dimension]) return res.status(400).json({ error: 'Invalid dimension' });
      const result = await grader.evaluateHappResponse({ assignmentTitle: ctx.assignment.title, document: doc, dimension, studentText: text });
      feedback = result.feedback;
      const full = current.happFull || { docNumber: DBQ_HAPP_FULL_DOC, responses: {}, locked: false };
      full.responses = { ...(full.responses || {}), [dimension]: text };
      full.docNumber = DBQ_HAPP_FULL_DOC;
      full.locked = Object.keys(grader.HAPP_DIMENSIONS).every((d) => !!full.responses[d]);
      current.happFull = full;
    } else if (DBQ_HAPP_ABBREV_DOCS.includes(num)) {
      const result = await grader.evaluateHappResponse({ assignmentTitle: ctx.assignment.title, document: doc, dimension: dimension || 'context', studentText: text });
      feedback = result.feedback;
      const abbrev = current.happAbbrev || {};
      current.happAbbrev = { ...abbrev, [num]: { note: text, locked: true } };
    } else {
      return res.status(400).json({ error: 'This document is not part of the HAPP Deep Dive' });
    }

    const happAbbrevDone = DBQ_HAPP_ABBREV_DOCS.every((n) => current.happAbbrev?.[n]?.locked);
    current.locked = !!(current.happFull?.locked && happAbbrevDone);
    partResponses.documents = current;

    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ok: true, feedback, documents: current });
  } catch (e) {
    console.error('guided-walk-dbq happ error:', e.message);
    res.status(500).json({ error: 'Failed to save HAPP response' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/thesis — Phase 3 thesis builder (same as LEQ)
router.post('/guided-walk-dbq/:assignmentId/thesis', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { claim, reasoning } = req.body;
    if (!claim || !claim.trim() || !reasoning || !reasoning.trim()) {
      return res.status(400).json({ error: 'claim and reasoning are required' });
    }

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses.thesis || { locked: false, attempts: 0 };
    if (current.locked) return res.status(409).json({ error: 'Thesis is already locked' });

    const attemptNumber = (current.attempts || 0) + 1;
    const evalResult = await grader.evaluateLeqThesis({
      assignmentTitle: ctx.assignment.title,
      prompt: ctx.assignment.prompt,
      claim, reasoning, attemptNumber,
    });

    partResponses.thesis = { claim, reasoning, attempts: attemptNumber, locked: !!evalResult.approved };
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ...evalResult, attempts: attemptNumber, locked: partResponses.thesis.locked });
  } catch (e) {
    console.error('guided-walk-dbq thesis error:', e.message);
    res.status(500).json({ error: 'Failed to evaluate your thesis' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/complexity-pathway — Phase 5 pathway choice (same as LEQ)
router.post('/guided-walk-dbq/:assignmentId/complexity-pathway', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { pathway } = req.body;
    if (!grader.LEQ_COMPLEXITY_PATHWAYS[pathway]) return res.status(400).json({ error: 'Invalid pathway' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    if (partResponses.complexity?.locked) return res.status(409).json({ error: 'Complexity is already locked' });
    partResponses.complexity = { pathway, locked: false, finalText: '', history: [] };
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ ok: true, pathway });
  } catch (e) {
    console.error('guided-walk-dbq complexity-pathway error:', e.message);
    res.status(500).json({ error: 'Failed to set complexity pathway' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/ask — Clio's next question for a stage
router.post('/guided-walk-dbq/:assignmentId/ask', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { stage, docNumber } = req.body;
    if (!DBQ_ASK_STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses[stage] || defaultDbqStageState(stage);

    if (DBQ_EVIDENCE_STAGES.includes(stage) && !current.docNumber) {
      const num = Number(docNumber);
      const doc = ctx.documents.find((d) => d.doc_number === num);
      if (!doc) return res.status(400).json({ error: 'A valid docNumber is required to start this stage' });
      const usedDocs = DBQ_EVIDENCE_STAGES.map((s) => partResponses[s]?.docNumber).filter(Boolean);
      if (usedDocs.includes(num)) return res.status(409).json({ error: 'This document is already used by another evidence stage' });
      current.docNumber = num;
    }
    if (stage === 'complexity' && !current.pathway) {
      return res.status(409).json({ error: 'Choose a complexity pathway first' });
    }

    const document = DBQ_EVIDENCE_STAGES.includes(stage)
      ? ctx.documents.find((d) => d.doc_number === current.docNumber)
      : null;

    const graderStage = DBQ_EVIDENCE_STAGES.includes(stage)
      ? (current.step === 'sourcing' ? 'sourcing' : 'evidence')
      : stage === 'evidence_beyond' ? 'outside_evidence'
      : stage === 'complexity' ? 'complexity'
      : 'contextualization';

    const profile = await getWritingProfile(ctx.user.id);

    let question;
    if (graderStage === 'contextualization' || graderStage === 'complexity') {
      const result = await grader.generateLeqStageQuestion({
        stage: graderStage,
        assignmentTitle: ctx.assignment.title,
        prompt: ctx.assignment.prompt,
        thesis: partResponses.thesis,
        stageContext: buildDbqStageContext(graderStage, current, partResponses, ctx.documents),
        pathway: stage === 'complexity' ? current.pathway : null,
        studentLevel: profile.dbq_level || 1,
        history: current.history,
      });
      question = result.question;
    } else {
      const result = await grader.generateDbqStageQuestion({
        stage: graderStage,
        assignmentTitle: ctx.assignment.title,
        prompt: ctx.assignment.prompt,
        thesis: partResponses.thesis,
        document,
        stageContext: buildDbqStageContext(graderStage, current, partResponses, ctx.documents),
        studentLevel: profile.dbq_level || 1,
        history: current.history,
      });
      question = result.question;
    }

    current.history = [...current.history, { role: 'clio', text: question }];
    partResponses[stage] = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({ question, history: current.history, step: current.step, docNumber: current.docNumber });
  } catch (e) {
    console.error('guided-walk-dbq ask error:', e.message);
    res.status(500).json({ error: 'Failed to get a question from Clio' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/answer — evaluate a student's response to a stage
router.post('/guided-walk-dbq/:assignmentId/answer', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const { stage, text } = req.body;
    if (!DBQ_ASK_STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
    if (!text || !text.trim()) return res.status(400).json({ error: 'text is required' });

    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};
    const current = partResponses[stage] || defaultDbqStageState(stage);
    if (current.locked) return res.status(409).json({ error: 'This stage is already locked' });
    if (DBQ_EVIDENCE_STAGES.includes(stage) && !current.docNumber) {
      return res.status(409).json({ error: 'Choose a document for this stage first' });
    }
    if (stage === 'complexity' && !current.pathway) {
      return res.status(409).json({ error: 'Choose a complexity pathway first' });
    }

    const document = DBQ_EVIDENCE_STAGES.includes(stage)
      ? ctx.documents.find((d) => d.doc_number === current.docNumber)
      : null;

    const graderStage = DBQ_EVIDENCE_STAGES.includes(stage)
      ? (current.step === 'sourcing' ? 'sourcing' : 'evidence')
      : stage === 'evidence_beyond' ? 'outside_evidence'
      : stage === 'complexity' ? 'complexity'
      : 'contextualization';

    const profile = await getWritingProfile(ctx.user.id);
    const stageContext = buildDbqStageContext(graderStage, current, partResponses, ctx.documents);

    let evalResult;
    if (graderStage === 'contextualization' || graderStage === 'complexity') {
      evalResult = await grader.evaluateLeqStageResponse({
        stage: graderStage,
        assignmentTitle: ctx.assignment.title,
        prompt: ctx.assignment.prompt,
        thesis: partResponses.thesis,
        stageContext,
        pathway: stage === 'complexity' ? current.pathway : null,
        studentLevel: profile.dbq_level || 1,
        studentText: text,
        history: current.history,
      });
    } else {
      evalResult = await grader.evaluateDbqStageResponse({
        stage: graderStage,
        assignmentTitle: ctx.assignment.title,
        prompt: ctx.assignment.prompt,
        thesis: partResponses.thesis,
        document,
        stageContext,
        studentLevel: profile.dbq_level || 1,
        studentText: text,
        history: current.history,
      });
    }

    const studentTurns = current.history.filter((h) => h.role === 'student').length + 1;
    const advance = !!(evalResult.advance || studentTurns >= 5);

    current.history = [...current.history, { role: 'student', text }, { role: 'clio', text: evalResult.clio_response }];

    if (advance) {
      if (DBQ_EVIDENCE_STAGES.includes(stage) && graderStage === 'evidence') {
        current.evidenceText = text;
        current.step = 'sourcing';
        current.history = []; // fresh conversation for the sourcing sub-step
      } else if (DBQ_EVIDENCE_STAGES.includes(stage) && graderStage === 'sourcing') {
        current.sourcingText = text;
        current.step = 'done';
        current.locked = true;
      } else {
        current.locked = true;
        current.finalText = text;
      }
    }

    partResponses[stage] = current;
    await db.query(
      `UPDATE sw_guided_walk_sessions SET part_responses=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(partResponses)]
    );
    res.json({
      ...evalResult, advance, history: current.history, locked: current.locked, step: current.step,
      docNumber: current.docNumber, evidenceText: current.evidenceText, sourcingText: current.sourcingText, finalText: current.finalText,
    });
  } catch (e) {
    console.error('guided-walk-dbq answer error:', e.message);
    res.status(500).json({ error: 'Failed to evaluate your response' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/reflection — optional, non-graded reflection
router.post('/guided-walk-dbq/:assignmentId/reflection', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    await db.query(
      `UPDATE sw_guided_walk_sessions SET reflection=$3, updated_at=NOW() WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, req.body?.text || '']
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save reflection' });
  }
});

// POST /api/write/guided-walk-dbq/:assignmentId/compile — compile contextualization + thesis +
// 3x document evidence/sourcing + outside evidence + complexity into a full DBQ, grade,
// create a submission, and award XP/badges.
router.post('/guided-walk-dbq/:assignmentId/compile', requireAuth, async (req, res) => {
  try {
    const ctx = await loadDbqGuidedWalkAssignment(req, res);
    if (!ctx) return;
    const session = await getOrCreateGwSession(ctx.user.id, ctx.assignment.id);
    const partResponses = session.part_responses || {};

    if (!partResponses.documents?.locked) return res.status(409).json({ error: 'Document Triage / HAPP Deep Dive is not complete yet' });
    if (!partResponses.thesis?.locked) return res.status(409).json({ error: 'Thesis is not locked yet' });
    if (!partResponses.contextualization?.locked) return res.status(409).json({ error: 'Contextualization is not complete yet' });
    for (const s of DBQ_EVIDENCE_STAGES) {
      if (!partResponses[s]?.locked) return res.status(409).json({ error: `${s.replace('_', ' ')} is not complete yet` });
    }
    if (!partResponses.evidence_beyond?.locked) return res.status(409).json({ error: 'Outside evidence is not complete yet' });
    if (!partResponses.complexity?.locked) return res.status(409).json({ error: 'Complexity is not complete yet' });

    const thesisSentence = `${partResponses.thesis.claim} ${partResponses.thesis.reasoning}`.trim();
    const docParagraphs = DBQ_EVIDENCE_STAGES.map((s) => {
      const ev = partResponses[s];
      return `(Document ${ev.docNumber}) ${ev.evidenceText} ${ev.sourcingText}`.trim();
    });
    const compiledText = [
      partResponses.contextualization.finalText,
      thesisSentence,
      ...docParagraphs,
      partResponses.evidence_beyond.finalText,
      partResponses.complexity.finalText,
    ].join('\n\n');

    const { rows: prevSubs } = await db.query(
      'SELECT COUNT(*)::int AS n FROM sw_submissions WHERE assignment_id=$1 AND student_id=$2',
      [ctx.assignment.id, ctx.user.id]
    );
    const attemptNumber = (prevSubs[0]?.n || 0) + 1;

    const grading = await grader.gradeEssay({
      essayType: 'DBQ',
      prompt: ctx.assignment.prompt,
      essayText: compiledText,
      documents: ctx.documents,
      attemptNumber,
    });

    const submissionId = uuidv4();
    await db.query(
      `INSERT INTO sw_submissions (id, assignment_id, student_id, essay_text, attempt_number, ai_score, max_score, grading_json)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [submissionId, ctx.assignment.id, ctx.user.id, compiledText, attemptNumber, grading.score, grading.maxScore, JSON.stringify(grading)]
    );

    const skillUpdates = {};
    for (const [k, v] of Object.entries(grading.breakdown || {})) {
      skillUpdates[k] = v.earned ? +8 : -3;
    }
    const newBadges = [];
    if (attemptNumber === 1) {
      const { rows: total } = await db.query('SELECT COUNT(*)::int AS n FROM sw_submissions WHERE student_id=$1', [ctx.user.id]);
      if (total[0].n === 1) newBadges.push('trail_blazer');
    }
    if (grading.breakdown?.evidence_documents?.points === 3) newBadges.push('sourcing_scout');
    if (grading.score >= 6) newBadges.push('summit_writer');

    // +50 XP Guided Walk completion bonus on top of the usual essay-grading award
    const xpGain = Math.round(grading.score * 15 * (attemptNumber === 1 ? 1.5 : 1)) + 50;

    const award = await awardProgress(ctx.user.id, { xpGain, skillUpdates, newBadges });
    const profile = await updateWritingProfileAfterWalk(ctx.user.id, 'DBQ', grading);

    await db.query(
      `UPDATE sw_guided_walk_sessions SET phase='complete', rubric_result=$3, completed_at=NOW(), updated_at=NOW()
       WHERE student_id=$1 AND assignment_id=$2`,
      [ctx.user.id, ctx.assignment.id, JSON.stringify(grading)]
    );

    res.json({ submissionId, grading, award, profile, compiledText, attemptNumber });
  } catch (e) {
    console.error('guided-walk-dbq compile error:', e.message);
    res.status(500).json({ error: 'Failed to compile and grade your essay' });
  }
});

// ── PORTFOLIO ──────────────────────────────────────────────────────────────────
// A student's writing history: every sw_submissions row (independent essays AND
// the rows guided-walk compile produces), enriched with mode, a growth timeline
// per essay type, a skill heatmap, and auto-generated milestones.

const SKILL_LABELS = {
  ...grader.RUBRICS.SAQ.criteria,
  ...grader.RUBRICS.LEQ.criteria,
  ...grader.RUBRICS.DBQ.criteria,
};

function buildPortfolio(submissions, guidedAssignmentIds) {
  const gwSet = new Set(guidedAssignmentIds);

  const entries = submissions.map((s) => ({
    id: s.id,
    assignmentId: s.assignment_id,
    type: s.type,
    title: s.title,
    score: s.ai_score,
    maxScore: s.max_score,
    mode: gwSet.has(s.assignment_id) ? 'guided' : 'independent',
    attemptNumber: s.attempt_number,
    date: s.submitted_at,
    essayText: s.essay_text,
    breakdown: s.grading_json?.breakdown || null,
    overallFeedback: s.grading_json?.overallFeedback || null,
    strengthSummary: s.grading_json?.strengthSummary || null,
    growthTarget: s.grading_json?.growthTarget || null,
  }));

  const growthTimeline = { SAQ: [], LEQ: [], DBQ: [] };
  for (const e of entries) {
    if (growthTimeline[e.type]) {
      growthTimeline[e.type].push({ date: e.date, score: e.score, maxScore: e.maxScore, attemptNumber: e.attemptNumber });
    }
  }

  const skillTallies = {};
  for (const e of entries) {
    if (!e.breakdown) continue;
    for (const [key, b] of Object.entries(e.breakdown)) {
      if (!skillTallies[key]) skillTallies[key] = { earned: 0, total: 0 };
      skillTallies[key].total += 1;
      if (b.earned) skillTallies[key].earned += 1;
    }
  }
  const skillHeatmap = Object.entries(skillTallies).map(([key, t]) => ({
    key,
    label: SKILL_LABELS[key]?.label || key,
    earnedRate: t.total > 0 ? t.earned / t.total : 0,
    attempts: t.total,
  }));

  const milestones = [];
  const firstGuided = entries.find((e) => e.mode === 'guided');
  if (firstGuided) milestones.push({ key: 'first_guided_walk', label: 'First Guided Walk completed', icon: '🥾', date: firstGuided.date });

  const firstPerfectSaq = entries.find((e) => e.type === 'SAQ' && e.score === e.maxScore);
  if (firstPerfectSaq) milestones.push({ key: 'first_saq_perfect', label: 'First 3/3 SAQ', icon: '🎯', date: firstPerfectSaq.date });

  const firstLeqAbove4 = entries.find((e) => e.type === 'LEQ' && e.score > 4);
  if (firstLeqAbove4) milestones.push({ key: 'first_leq_above_4', label: 'First LEQ above 4 points', icon: '⚖️', date: firstLeqAbove4.date });

  if (entries.length >= 10) milestones.push({ key: 'ten_essays', label: '10 essays written', icon: '🔥', date: entries[9].date });

  milestones.sort((a, b) => new Date(a.date) - new Date(b.date));

  return { entries, growthTimeline, skillHeatmap, milestones, totalEssays: entries.length };
}

// GET /api/write/portfolio — the current student's own portfolio
router.get('/portfolio', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user) return res.status(400).json({ error: 'User not synced' });
  try {
    const { rows: submissions } = await db.query(
      `SELECT s.id, s.assignment_id, s.essay_text, s.ai_score, s.max_score, s.grading_json, s.submitted_at, s.attempt_number,
              a.type, a.title
       FROM sw_submissions s
       JOIN sw_assignments a ON a.id = s.assignment_id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at ASC`,
      [user.id]
    );
    const { rows: gwRows } = await db.query(
      'SELECT assignment_id FROM sw_guided_walk_sessions WHERE student_id=$1 AND completed_at IS NOT NULL',
      [user.id]
    );
    res.json(buildPortfolio(submissions, gwRows.map((r) => r.assignment_id)));
  } catch (e) {
    console.error('GET /api/write/portfolio error:', e.message);
    res.status(500).json({ error: 'Failed to load portfolio' });
  }
});

// GET /api/write/portfolio/:studentId — a teacher viewing one of their students' portfolios
router.get('/portfolio/:studentId', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  try {
    const { studentId } = req.params;
    const { rows: owned } = await db.query(
      `SELECT 1 FROM sw_submissions s JOIN sw_assignments a ON a.id = s.assignment_id
       WHERE s.student_id=$1 AND a.teacher_id=$2 LIMIT 1`,
      [studentId, user.id]
    );
    const { rows: inClass } = await db.query(
      `SELECT 1 FROM class_members cm JOIN classes c ON c.id = cm.class_id
       WHERE cm.student_id=$1 AND c.teacher_id=$2 LIMIT 1`,
      [studentId, user.id]
    );
    if (!owned[0] && !inClass[0]) return res.status(403).json({ error: "Not your student" });

    const { rows: submissions } = await db.query(
      `SELECT s.id, s.assignment_id, s.essay_text, s.ai_score, s.max_score, s.grading_json, s.submitted_at, s.attempt_number,
              a.type, a.title
       FROM sw_submissions s
       JOIN sw_assignments a ON a.id = s.assignment_id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at ASC`,
      [studentId]
    );
    const { rows: gwRows } = await db.query(
      'SELECT assignment_id FROM sw_guided_walk_sessions WHERE student_id=$1 AND completed_at IS NOT NULL',
      [studentId]
    );
    const { rows: studentRows } = await db.query('SELECT id, name, username FROM users WHERE id=$1', [studentId]);
    res.json({ student: studentRows[0] || null, ...buildPortfolio(submissions, gwRows.map((r) => r.assignment_id)) });
  } catch (e) {
    console.error('GET /api/write/portfolio/:studentId error:', e.message);
    res.status(500).json({ error: 'Failed to load student portfolio' });
  }
});

// GET /api/write/class-portfolio/:classId — class roster with per-student portfolio
// summary stats, for the teacher's sortable class dashboard.
router.get('/class-portfolio/:classId', requireAuth, async (req, res) => {
  const user = req.dbUser;
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });
  try {
    const { classId } = req.params;
    const { rows: classRows } = await db.query('SELECT id, name FROM classes WHERE id=$1 AND teacher_id=$2', [classId, user.id]);
    const klass = classRows[0];
    if (!klass) return res.status(403).json({ error: 'Not your class' });

    const { rows: roster } = await db.query(
      `SELECT u.id AS student_id, u.name, u.username
       FROM class_members cm JOIN users u ON u.id = cm.student_id
       WHERE cm.class_id = $1 ORDER BY u.name ASC`,
      [classId]
    );

    const { rows: submissions } = await db.query(
      `SELECT s.student_id, s.ai_score, s.max_score, s.grading_json, s.submitted_at
       FROM sw_submissions s
       WHERE s.student_id IN (SELECT student_id FROM class_members WHERE class_id=$1)
       ORDER BY s.submitted_at ASC`,
      [classId]
    );

    const byStudent = new Map();
    for (const s of submissions) {
      if (!byStudent.has(s.student_id)) byStudent.set(s.student_id, []);
      byStudent.get(s.student_id).push(s);
    }

    const students = roster.map((r) => {
      const subs = byStudent.get(r.student_id) || [];
      const totalEssays = subs.length;
      let avgPct = null, lastPct = null, weakestSkill = null;

      if (totalEssays > 0) {
        const pcts = subs.map((s) => s.ai_score / s.max_score);
        avgPct = Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100);
        lastPct = Math.round(pcts[pcts.length - 1] * 100);

        const tallies = {};
        for (const s of subs) {
          for (const [key, b] of Object.entries(s.grading_json?.breakdown || {})) {
            if (!tallies[key]) tallies[key] = { earned: 0, total: 0 };
            tallies[key].total += 1;
            if (b.earned) tallies[key].earned += 1;
          }
        }
        let lowestRate = Infinity;
        for (const [key, t] of Object.entries(tallies)) {
          const rate = t.earned / t.total;
          if (rate < lowestRate) { lowestRate = rate; weakestSkill = { key, label: SKILL_LABELS[key]?.label || key, rate }; }
        }
      }

      return {
        studentId: r.student_id,
        name: r.name || r.username,
        totalEssays,
        avgPct,
        lastPct,
        weakestSkill,
      };
    });

    res.json({ class: klass, students });
  } catch (e) {
    console.error('GET /api/write/class-portfolio/:classId error:', e.message);
    res.status(500).json({ error: 'Failed to load class portfolio' });
  }
});

module.exports = router;
