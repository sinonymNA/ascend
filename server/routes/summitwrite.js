// Summit Write — AP World History essay module API.
// Mounted at /api/write

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const grader = require('../services/write-grader');

const router = express.Router();

const LEVEL_THRESHOLDS = [0, 300, 700, 1400, 2500, 4000, 6000, 8500, 11500, 15000];

function levelForXp(xp) {
  let lvl = 1;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) lvl = i + 1;
  }
  return lvl;
}

const BADGES = [
  { id: 'trail_blazer', name: 'Trail Blazer', desc: 'First essay submitted', icon: '🥾' },
  { id: 'context_climber', name: 'Contextualization Climber', desc: 'Earned contextualization 5 times', icon: '🧗' },
  { id: 'sourcing_scout', name: 'Sourcing Scout', desc: 'Earned full document evidence on a DBQ', icon: '🔍' },
  { id: 'complexity_king', name: 'Complexity Crown', desc: 'Earned complexity 3 times', icon: '👑' },
  { id: 'revision_ranger', name: 'Revision Ranger', desc: 'Improved a score through revision', icon: '🔄' },
  { id: 'summit_writer', name: 'Summit Writer', desc: 'Earned 6+ on a DBQ', icon: '🏔' },
];

async function getProgress(studentId) {
  const { rows } = await db.query('SELECT * FROM sw_student_progress WHERE student_id=$1', [studentId]);
  if (rows[0]) return rows[0];
  const { rows: created } = await db.query(
    `INSERT INTO sw_student_progress (student_id) VALUES ($1)
     ON CONFLICT (student_id) DO UPDATE SET student_id=$1 RETURNING *`,
    [studentId]
  );
  return created[0];
}

async function awardProgress(studentId, { xpGain = 0, skillUpdates = {}, newBadges = [] }) {
  const prog = await getProgress(studentId);
  const xp = (prog.xp || 0) + xpGain;
  const level = levelForXp(xp);

  const skills = { ...(prog.skills || {}) };
  for (const [k, delta] of Object.entries(skillUpdates)) {
    skills[k] = Math.max(0, Math.min(100, (skills[k] || 30) + delta));
  }

  const badges = Array.isArray(prog.badges) ? [...prog.badges] : [];
  const earned = [];
  for (const b of newBadges) {
    if (!badges.includes(b)) { badges.push(b); earned.push(b); }
  }
  const badgeBonus = earned.length * 100;

  // Streak: one submission per day keeps it alive; gap of 1 day allowed once implicitly via date math
  const today = new Date().toISOString().slice(0, 10);
  let streak = prog.streak_days || 0;
  const last = prog.last_submission_date ? new Date(prog.last_submission_date).toISOString().slice(0, 10) : null;
  if (last !== today) {
    const gap = last ? Math.round((new Date(today) - new Date(last)) / 86400000) : Infinity;
    streak = gap <= 2 ? streak + 1 : 1;
  }

  await db.query(
    `UPDATE sw_student_progress
     SET xp=$2, level=$3, skills=$4, badges=$5, streak_days=$6, last_submission_date=$7, updated_at=NOW()
     WHERE student_id=$1`,
    [studentId, xp + badgeBonus, levelForXp(xp + badgeBonus), JSON.stringify(skills), JSON.stringify(badges), streak, today]
  );
  return { xp: xp + badgeBonus, level: levelForXp(xp + badgeBonus), xpGain: xpGain + badgeBonus, streak, newBadges: earned };
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
  const { published } = req.body;
  try {
    await db.query(
      'UPDATE sw_assignments SET published=COALESCE($3, published) WHERE id=$1 AND teacher_id=$2',
      [req.params.id, user.id, typeof published === 'boolean' ? published : null]
    );
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update assignment' });
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

module.exports = router;
