// Summit Write — Writing Courses API (Phase 2, Part 3).
// Mounted at /api/write/courses

const express = require('express');
const { requireAuth } = require('../middleware/auth');
const db = require('../services/db');
const { awardProgress } = require('../services/sw-progress');
const { evaluateActivity } = require('../services/course-grader');
const { COURSES, COURSE_ORDER } = require('../services/course-content');

const router = express.Router();
router.use(requireAuth);
router.use((req, res, next) => {
  if (!req.dbUser) return res.status(400).json({ error: 'User not synced' });
  next();
});

const PASS_SCORE = 70;

// ── Helpers ────────────────────────────────────────────────────────────────────

async function getCourseProgress(studentId, courseId) {
  const { rows } = await db.query(
    'SELECT * FROM sw_course_progress WHERE student_id=$1 AND course_id=$2',
    [studentId, courseId]
  );
  if (rows[0]) return rows[0];
  const { rows: created } = await db.query(
    `INSERT INTO sw_course_progress (student_id, course_id) VALUES ($1, $2)
     ON CONFLICT (student_id, course_id) DO UPDATE SET student_id=$1 RETURNING *`,
    [studentId, courseId]
  );
  return created[0];
}

function courseUnlocked(course, progressByCourse) {
  if (!course.prereq) return true;
  const prereqProgress = progressByCourse[course.prereq];
  return !!prereqProgress?.completed_at;
}

// Strip server-only "answer key" fields before sending a lesson to the client.
function sanitizeActivity(activity) {
  if (!activity) return activity;
  const clean = { ...activity };
  delete clean.correctTools;
  if (Array.isArray(clean.items)) {
    clean.items = clean.items.map((item) => {
      const { correct, ...rest } = item;
      return rest;
    });
  }
  if (Array.isArray(clean.questions)) {
    clean.questions = clean.questions.map((q) => {
      const { correctIndex, ...rest } = q;
      return rest;
    });
  }
  if (clean.remix) clean.remix = sanitizeActivity(clean.remix);
  return clean;
}

function sanitizeLesson(lesson) {
  const clean = { ...lesson };
  if (clean.activity) clean.activity = sanitizeActivity(clean.activity);
  if (clean.exitCheck) clean.exitCheck = sanitizeActivity(clean.exitCheck);
  if (clean.testOut) {
    const { correctTools, ...restTestOut } = clean.testOut;
    clean.testOut = restTestOut;
  }
  return clean;
}

function findLesson(course, lessonNum) {
  return course.lessons.find((l) => l.id === lessonNum);
}

// ── GET /api/write/courses — list all courses with progress ─────────────────────

router.get('/', async (req, res) => {
  try {
    const studentId = req.dbUser.id;
    const progressByCourse = {};
    for (const courseId of COURSE_ORDER) {
      progressByCourse[courseId] = await getCourseProgress(studentId, courseId);
    }

    const courses = COURSE_ORDER.map((courseId) => {
      const course = COURSES[courseId];
      const progress = progressByCourse[courseId];
      const totalLessons = course.lessons.length;
      const completedLessons = Array.isArray(progress.completed_lessons) ? progress.completed_lessons : [];
      return {
        id: course.id,
        title: course.title,
        subtitle: course.subtitle,
        arc: course.arc,
        description: course.description,
        badge: course.badge,
        totalLessons,
        completedLessons: completedLessons.length,
        currentLesson: Math.min(progress.current_lesson || 1, totalLessons),
        completedAt: progress.completed_at,
        unlocked: courseUnlocked(course, progressByCourse),
        prereq: course.prereq,
      };
    });

    res.json({ courses });
  } catch (e) {
    console.error('GET /api/write/courses error:', e.message);
    res.status(500).json({ error: 'Failed to load courses' });
  }
});

// ── GET /api/write/courses/:courseId — course detail + lesson list ──────────────

router.get('/:courseId', async (req, res) => {
  try {
    const course = COURSES[req.params.courseId];
    if (!course) return res.status(404).json({ error: 'Course not found' });

    const studentId = req.dbUser.id;
    const progressByCourse = {};
    for (const courseId of COURSE_ORDER) {
      progressByCourse[courseId] = await getCourseProgress(studentId, courseId);
    }
    const progress = progressByCourse[course.id];
    const unlocked = courseUnlocked(course, progressByCourse);
    const completedLessons = Array.isArray(progress.completed_lessons) ? progress.completed_lessons : [];
    const lessonScores = progress.lesson_scores || {};

    const lessons = course.lessons.map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      subtitle: lesson.subtitle,
      capstone: !!lesson.capstone,
      completed: completedLessons.includes(lesson.id),
      score: lessonScores[lesson.id] ?? null,
      locked: !unlocked || lesson.id > (progress.current_lesson || 1),
    }));

    res.json({
      id: course.id,
      title: course.title,
      subtitle: course.subtitle,
      arc: course.arc,
      description: course.description,
      badge: course.badge,
      prereq: course.prereq,
      unlocked,
      currentLesson: Math.min(progress.current_lesson || 1, course.lessons.length),
      completedAt: progress.completed_at,
      lessons,
    });
  } catch (e) {
    console.error('GET /api/write/courses/:courseId error:', e.message);
    res.status(500).json({ error: 'Failed to load course' });
  }
});

// ── GET /api/write/courses/:courseId/lessons/:lessonNum — lesson content ────────

router.get('/:courseId/lessons/:lessonNum', async (req, res) => {
  try {
    const course = COURSES[req.params.courseId];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const lessonNum = parseInt(req.params.lessonNum, 10);
    const lesson = findLesson(course, lessonNum);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    const studentId = req.dbUser.id;
    const progressByCourse = {};
    for (const courseId of COURSE_ORDER) {
      progressByCourse[courseId] = await getCourseProgress(studentId, courseId);
    }
    const progress = progressByCourse[course.id];
    const unlocked = courseUnlocked(course, progressByCourse);
    if (!unlocked) return res.status(403).json({ error: 'Complete the prerequisite course first' });
    if (lessonNum > (progress.current_lesson || 1)) {
      return res.status(403).json({ error: 'This lesson is locked — finish the previous lesson first' });
    }

    const completedLessons = Array.isArray(progress.completed_lessons) ? progress.completed_lessons : [];
    const lessonScores = progress.lesson_scores || {};

    // Test-out: only meaningful for lessons that define a testOut block, and only
    // before the lesson itself has been completed. Per spec, SAQ Lesson 4 unlocks
    // a test-out option once Lessons 1-3 are all perfect scores.
    let testOutAvailable = false;
    if (lesson.testOut && !completedLessons.includes(lessonNum)) {
      const priorLessons = course.lessons.filter((l) => l.id < lessonNum && !l.capstone);
      testOutAvailable = priorLessons.length > 0 && priorLessons.every((l) => (lessonScores[l.id] ?? 0) === 100);
    }

    let capstoneStatus = null;
    if (lesson.capstone) {
      const { rows } = await db.query(
        'SELECT completed_at, rubric_result FROM sw_guided_walk_sessions WHERE student_id=$1 AND assignment_id=$2',
        [studentId, lesson.capstone.assignmentId]
      );
      const session = rows[0];
      capstoneStatus = {
        guidedWalkCompleted: !!session?.completed_at,
        score: session?.rubric_result?.score ?? null,
        maxScore: session?.rubric_result?.maxScore ?? null,
      };
    }

    res.json({
      courseId: course.id,
      courseTitle: course.title,
      totalLessons: course.lessons.length,
      lesson: sanitizeLesson(lesson),
      completed: completedLessons.includes(lessonNum),
      score: lessonScores[lessonNum] ?? null,
      testOutAvailable,
      capstoneStatus,
    });
  } catch (e) {
    console.error('GET /api/write/courses/:courseId/lessons/:lessonNum error:', e.message);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
});

// ── Progress update helper ───────────────────────────────────────────────────────

async function markLessonComplete(studentId, course, lessonNum, score) {
  const progress = await getCourseProgress(studentId, course.id);
  const completedLessons = new Set(Array.isArray(progress.completed_lessons) ? progress.completed_lessons : []);
  completedLessons.add(lessonNum);
  const lessonScores = { ...(progress.lesson_scores || {}) };
  lessonScores[lessonNum] = Math.max(lessonScores[lessonNum] ?? 0, score);

  const totalLessons = course.lessons.length;
  const currentLesson = Math.min(Math.max(progress.current_lesson || 1, lessonNum + 1), totalLessons);
  const courseComplete = lessonNum === totalLessons;

  await db.query(
    `UPDATE sw_course_progress
     SET completed_lessons=$3, lesson_scores=$4, current_lesson=$5, completed_at=$6, updated_at=NOW()
     WHERE student_id=$1 AND course_id=$2`,
    [
      studentId,
      course.id,
      Array.from(completedLessons),
      JSON.stringify(lessonScores),
      currentLesson,
      courseComplete ? new Date() : progress.completed_at,
    ]
  );

  let award = null;
  if (courseComplete) {
    award = await awardProgress(studentId, { xpGain: 150, newBadges: [course.badge] });
  } else {
    const firstTime = !(Array.isArray(progress.completed_lessons) && progress.completed_lessons.includes(lessonNum));
    award = await awardProgress(studentId, { xpGain: firstTime ? 30 : 10 });
  }

  return { courseComplete, award };
}

// ── POST /api/write/courses/:courseId/lessons/:lessonNum/activity ────────────────
// Practice activity — gives feedback, does not gate progression.

router.post('/:courseId/lessons/:lessonNum/activity', async (req, res) => {
  try {
    const course = COURSES[req.params.courseId];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const lessonNum = parseInt(req.params.lessonNum, 10);
    const lesson = findLesson(course, lessonNum);
    if (!lesson || !lesson.activity) return res.status(404).json({ error: 'Activity not found' });

    const result = await evaluateActivity({
      activityType: lesson.activity.type,
      config: lesson.activity,
      response: req.body.response,
      lessonTitle: lesson.title,
    });

    res.json(result);
  } catch (e) {
    console.error('POST .../activity error:', e.message, '| course:', req.params.courseId, '| lesson:', req.params.lessonNum);
    res.status(500).json({ error: 'Failed to evaluate activity' });
  }
});

// ── POST /api/write/courses/:courseId/lessons/:lessonNum/exit-check ──────────────

router.post('/:courseId/lessons/:lessonNum/exit-check', async (req, res) => {
  try {
    const course = COURSES[req.params.courseId];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const lessonNum = parseInt(req.params.lessonNum, 10);
    const lesson = findLesson(course, lessonNum);
    if (!lesson || !lesson.exitCheck) return res.status(404).json({ error: 'Exit check not found' });

    const variant = req.body.variant === 'remix' ? 'remix' : 'primary';
    const exitConfig = variant === 'remix' && lesson.exitCheck.remix
      ? { ...lesson.exitCheck, ...lesson.exitCheck.remix }
      : lesson.exitCheck;

    const result = await evaluateActivity({
      activityType: lesson.exitCheck.type,
      config: exitConfig,
      response: req.body.response,
      lessonTitle: lesson.title,
    });

    const studentId = req.dbUser.id;
    const passed = result.score >= PASS_SCORE;

    if (passed || variant === 'remix' || !lesson.exitCheck.remix) {
      // Either they passed, or this was their remix attempt (or there's no
      // remix to fall back to) — finalize the lesson either way so students
      // never get stuck.
      const { courseComplete, award } = await markLessonComplete(studentId, course, lessonNum, result.score);
      return res.json({ ...result, finalized: true, passed: true, courseComplete, award });
    }

    // First attempt below the threshold, with a remix available.
    res.json({
      ...result,
      finalized: false,
      passed: false,
      remix: sanitizeActivity({ ...lesson.exitCheck.remix, type: lesson.exitCheck.type, passScore: lesson.exitCheck.passScore }),
    });
  } catch (e) {
    console.error('POST .../exit-check error:', e.message, '| course:', req.params.courseId, '| lesson:', req.params.lessonNum);
    res.status(500).json({ error: 'Failed to evaluate exit check' });
  }
});

// ── POST /api/write/courses/:courseId/lessons/:lessonNum/test-out ────────────────

router.post('/:courseId/lessons/:lessonNum/test-out', async (req, res) => {
  try {
    const course = COURSES[req.params.courseId];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const lessonNum = parseInt(req.params.lessonNum, 10);
    const lesson = findLesson(course, lessonNum);
    if (!lesson || !lesson.testOut) return res.status(404).json({ error: 'Test-out not available for this lesson' });

    const studentId = req.dbUser.id;
    const progress = await getCourseProgress(studentId, course.id);
    const lessonScores = progress.lesson_scores || {};
    const priorLessons = course.lessons.filter((l) => l.id < lessonNum && !l.capstone);
    const eligible = priorLessons.length > 0 && priorLessons.every((l) => (lessonScores[l.id] ?? 0) === 100);
    if (!eligible) return res.status(403).json({ error: 'Test-out requires a perfect score on the previous lessons' });

    const result = await evaluateActivity({
      activityType: 'bridge',
      config: lesson.testOut,
      response: req.body.response,
      lessonTitle: `${lesson.title} (test-out)`,
    });

    if (result.score >= (lesson.testOut.passScore ?? PASS_SCORE)) {
      const { courseComplete, award } = await markLessonComplete(studentId, course, lessonNum, 100);
      return res.json({ ...result, finalized: true, passed: true, courseComplete, award });
    }

    res.json({ ...result, finalized: false, passed: false });
  } catch (e) {
    console.error('POST .../test-out error:', e.message, '| course:', req.params.courseId, '| lesson:', req.params.lessonNum);
    res.status(500).json({ error: 'Failed to evaluate test-out' });
  }
});

// ── POST /api/write/courses/:courseId/lessons/:lessonNum/check-capstone ──────────
// Capstone lessons complete by finishing the linked Guided Walk; this checks
// whether that's happened and, if so, finalizes the lesson.

router.post('/:courseId/lessons/:lessonNum/check-capstone', async (req, res) => {
  try {
    const course = COURSES[req.params.courseId];
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const lessonNum = parseInt(req.params.lessonNum, 10);
    const lesson = findLesson(course, lessonNum);
    if (!lesson || !lesson.capstone) return res.status(404).json({ error: 'Capstone not found' });

    const studentId = req.dbUser.id;
    const { rows } = await db.query(
      'SELECT completed_at, rubric_result FROM sw_guided_walk_sessions WHERE student_id=$1 AND assignment_id=$2',
      [studentId, lesson.capstone.assignmentId]
    );
    const session = rows[0];
    if (!session?.completed_at) {
      return res.json({ finalized: false, passed: false, message: 'Complete the Guided Walk first.' });
    }

    const rubric = session.rubric_result || {};
    const pct = rubric.maxScore ? Math.round((rubric.score / rubric.maxScore) * 100) : 100;
    const { courseComplete, award } = await markLessonComplete(studentId, course, lessonNum, pct);
    res.json({ finalized: true, passed: true, score: pct, courseComplete, award });
  } catch (e) {
    console.error('POST .../check-capstone error:', e.message, '| course:', req.params.courseId, '| lesson:', req.params.lessonNum);
    res.status(500).json({ error: 'Failed to check capstone status' });
  }
});

module.exports = router;
