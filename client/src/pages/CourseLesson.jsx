'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW } from '../lib/guidedWalkTheme.js';
import Clio from '../components/write/Clio.jsx';
import { TopBar, PhaseShell, GwButton } from '../components/write/gwShared.jsx';
import { VisualExplainer, ActivityRunner } from '../components/write/courseActivities.jsx';

// ── Writing Courses — lesson runner ("course_lesson") ─────────────────────────
// Generic flow: opener → visual (if present) → practice (if present) →
// exitcheck (with adaptive remix on a sub-70 first attempt) → result.
// Capstone lessons instead go opener → capstone → result, where "capstone"
// hands off to the existing Guided Walk and polls for its completion.

const BADGE_INFO = {
  saq_mastery: { name: 'SAQ Mastery', icon: '📜' },
  leq_mastery: { name: 'LEQ Mastery', icon: '⚖️' },
  dbq_mastery: { name: 'DBQ Mastery', icon: '🗂️' },
};

const cardStyle = {
  background: GW.parchmentDark,
  border: `1px solid ${GW.amber}30`,
  borderRadius: 12,
  padding: '14px 16px',
};

function Tag({ children }) {
  return (
    <div style={{
      fontFamily: 'Cinzel, serif', fontWeight: 800, letterSpacing: '0.22em',
      fontSize: 12, color: GW.amber, textTransform: 'uppercase', textAlign: 'center', marginBottom: 4,
    }}>{children}</div>
  );
}

// ── Phase: Opener ──────────────────────────────────────────────────────────
function OpenerPhase({ lesson, testOutAvailable, onBegin, onTestOut, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ textAlign: 'center', marginTop: '10vh' }}>
        <Tag>Lesson</Tag>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 5.5vw, 42px)', color: GW.ink, margin: '0 0 10px', fontWeight: 800 }}>
          {lesson.title}
        </h1>
        <div style={{ fontSize: 12.5, color: GW.amber, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>
          {lesson.subtitle}
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 15, maxWidth: 480, margin: '0 auto 32px', lineHeight: 1.6 }}>
          {lesson.opener}
        </p>
        <GwButton onClick={onBegin}>Begin</GwButton>
      </motion.div>
      {testOutAvailable && lesson.testOut && (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          style={{ ...cardStyle, borderColor: `${GW.sage}50`, marginTop: 16 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 12, color: GW.sage, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
            Test-Out Available
          </div>
          <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.55, marginBottom: 12 }}>{lesson.testOut.instructions}</div>
          <GwButton variant="secondary" onClick={onTestOut}>Try the Test-Out</GwButton>
        </motion.div>
      )}
    </PhaseShell>
  );
}

// ── Phase: Visual ────────────────────────────────────────────────────────────
function VisualPhase({ lesson, onContinue, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <Tag>{lesson.title}</Tag>
      <VisualExplainer visual={lesson.visual} />
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <GwButton onClick={onContinue}>Continue</GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Phase: Practice ──────────────────────────────────────────────────────────
function PracticePhase({ lesson, onSubmit, onResult, done, onContinue, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <Tag>Practice</Tag>
      <ActivityRunner activity={lesson.activity} onSubmit={onSubmit} onResult={onResult} label="Give it a try" />
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 8 }}>
          <GwButton onClick={onContinue}>Continue to Exit Check</GwButton>
        </motion.div>
      )}
    </PhaseShell>
  );
}

// ── Phase: Exit check (with adaptive remix) ───────────────────────────────────
function ExitCheckPhase({ activity, variant, onSubmit, onResult, exitResult, onTryRemix, onSeeResults, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <Tag>{variant === 'remix' ? 'One More Try' : 'Exit Check'}</Tag>
      <ActivityRunner key={variant} activity={activity} onSubmit={onSubmit} onResult={onResult} label="This one counts" submitLabel="Submit" />
      {exitResult && exitResult.finalized && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 8 }}>
          <GwButton onClick={onSeeResults}>See Your Results</GwButton>
        </motion.div>
      )}
      {exitResult && !exitResult.finalized && exitResult.remix && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 13, color: GW.inkSoft, fontStyle: 'italic', marginBottom: 10 }}>
            Not quite there yet — let's try one more, similar question.
          </div>
          <GwButton onClick={onTryRemix}>Try a Similar One</GwButton>
        </motion.div>
      )}
    </PhaseShell>
  );
}

// ── Phase: Test-out ────────────────────────────────────────────────────────────
function TestOutPhase({ activity, onSubmit, onResult, testOutResult, onContinueLesson, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <Tag>Test-Out</Tag>
      <ActivityRunner activity={activity} onSubmit={onSubmit} onResult={onResult} label="Make your case" submitLabel="Submit" />
      {testOutResult && !testOutResult.finalized && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: 8 }}>
          <div style={{ fontSize: 13, color: GW.inkSoft, fontStyle: 'italic', marginBottom: 10 }}>
            Not this time — let's go through the lesson instead.
          </div>
          <GwButton onClick={onContinueLesson}>Continue with the Lesson</GwButton>
        </motion.div>
      )}
    </PhaseShell>
  );
}

// ── Phase: Capstone ────────────────────────────────────────────────────────────
function CapstonePhase({ lesson, capstoneStatus, onBeginWalk, onCheck, checking, message, reduceMotion }) {
  const completed = !!capstoneStatus?.guidedWalkCompleted;
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <Tag>Capstone</Tag>
      <div style={{ ...cardStyle, borderColor: `${GW.amber}40`, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink, marginBottom: 6 }}>
          {lesson.capstone.assignmentTitle}
        </div>
        <div style={{ fontSize: 13.5, color: GW.inkSoft, lineHeight: 1.55 }}>
          This lesson finishes with a full Guided Walk — Clio will walk you through writing a complete response.
        </div>
        {completed && (
          <div style={{ marginTop: 12, fontSize: 13, fontWeight: 800, color: GW.sage }}>
            Guided Walk completed{capstoneStatus.score != null && capstoneStatus.maxScore != null
              ? ` — scored ${capstoneStatus.score}/${capstoneStatus.maxScore}` : ''}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <GwButton onClick={onBeginWalk}>{completed ? 'Redo the Guided Walk' : 'Begin Guided Walk'}</GwButton>
        <GwButton variant="secondary" onClick={onCheck} disabled={checking}>
          {checking ? 'Checking…' : "I've Finished — Check"}
        </GwButton>
        {message && <div style={{ fontSize: 13, color: GW.inkSoft, fontStyle: 'italic', textAlign: 'center' }}>{message}</div>}
      </div>
    </PhaseShell>
  );
}

// ── Phase: Result ──────────────────────────────────────────────────────────────
function ResultPhase({ score, finalResult, courseComplete, onContinue, reduceMotion }) {
  const award = finalResult?.award;
  const passed = finalResult?.passed !== false;
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ textAlign: 'center', marginTop: '6vh' }}>
        <Tag>{courseComplete ? 'Course Complete!' : 'Lesson Complete'}</Tag>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', margin: '16px auto 20px',
          background: passed ? GW.sageSoft : GW.amberSoft,
          border: `3px solid ${passed ? GW.sage : GW.amber}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 32, color: GW.ink,
        }}>{score != null ? score : '—'}</div>
        {award?.xpGain > 0 && (
          <div style={{ fontSize: 15, fontWeight: 800, color: GW.amber, marginBottom: 8 }}>+{award.xpGain} XP</div>
        )}
        {award?.newBadges?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            {award.newBadges.map((b) => (
              <div key={b} style={{
                display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 800, color: GW.ink,
                background: GW.amberSoft, border: `1px solid ${GW.amber}50`, borderRadius: 999, padding: '6px 16px',
              }}>
                <span style={{ fontSize: 18 }}>{BADGE_INFO[b]?.icon || '🏅'}</span>
                Badge earned: {BADGE_INFO[b]?.name || b}
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <GwButton onClick={onContinue}>{courseComplete ? 'Back to Courses' : 'Next Lesson'}</GwButton>
        </div>
      </motion.div>
    </PhaseShell>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function CourseLesson() {
  const { navigate, screenParams } = useApp();
  const { courseId, lessonNum } = screenParams || {};
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('opener');
  const [clio, setClio] = useState({ text: '', state: 'idle' });

  const [practiceDone, setPracticeDone] = useState(false);
  const [exitVariant, setExitVariant] = useState('primary');
  const [remixActivity, setRemixActivity] = useState(null);
  const [exitResult, setExitResult] = useState(null);
  const [testOutResult, setTestOutResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [capstoneChecking, setCapstoneChecking] = useState(false);
  const [capstoneMsg, setCapstoneMsg] = useState(null);

  useEffect(() => {
    if (!courseId || !lessonNum) { navigate('write_courses'); return; }
    setLoading(true);
    setError(null);
    setPhase('opener');
    setClio({ text: '', state: 'idle' });
    setPracticeDone(false);
    setExitVariant('primary');
    setRemixActivity(null);
    setExitResult(null);
    setTestOutResult(null);
    setFinalResult(null);
    setCapstoneMsg(null);
    (async () => {
      try {
        const res = await api.get(`/api/write/courses/${courseId}/lessons/${lessonNum}`);
        setData(res);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, lessonNum]);

  const lesson = data?.lesson;
  const isCapstone = !!lesson?.capstone;
  const phases = isCapstone
    ? ['opener', 'capstone', 'result']
    : ['opener', ...(lesson?.visual ? ['visual'] : []), ...(lesson?.activity ? ['practice'] : []), 'exitcheck', 'result'];

  // Clio narration per phase
  useEffect(() => {
    if (!lesson) return;
    if (phase === 'opener') {
      setClio({ text: lesson.opener || `Let's work on "${lesson.title}" — ${lesson.subtitle}.`, state: 'idle' });
    } else if (phase === 'visual') {
      setClio({ text: 'Take a look at this before we practice.', state: 'idle' });
    } else if (phase === 'practice') {
      setClio({ text: "Try it yourself — I'll give you feedback as you go.", state: 'idle' });
    } else if (phase === 'exitcheck') {
      setClio({
        text: exitVariant === 'remix'
          ? "Let's try a similar one — you've got this."
          : 'This is the real check. Give it your best shot.',
        state: 'idle',
      });
    } else if (phase === 'testout') {
      setClio({ text: 'Show me what you can do — ace this and skip ahead.', state: 'idle' });
    } else if (phase === 'capstone') {
      setClio({ text: 'Time to put it all together in a full Guided Walk.', state: 'idle' });
    } else if (phase === 'result') {
      const passed = finalResult?.passed !== false;
      setClio({
        text: finalResult?.courseComplete
          ? "You've completed the whole course — beautifully done."
          : (passed ? 'Nicely done — on to the next one.' : 'Good effort — every attempt sharpens the skill.'),
        state: passed ? 'celebrating' : 'idle',
      });
    }
  }, [phase, lesson, exitVariant, finalResult]);

  const goNext = useCallback(() => {
    setPhase((cur) => {
      const idx = phases.indexOf(cur);
      return phases[idx + 1] || cur;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  const onBegin = () => goNext();

  const onTestOut = () => setPhase('testout');

  const onPracticeSubmit = useCallback(async (value) => {
    return api.post(`/api/write/courses/${courseId}/lessons/${lessonNum}/activity`, { response: value });
  }, [courseId, lessonNum]);

  const onPracticeResult = () => setPracticeDone(true);

  const onExitSubmit = useCallback(async (value) => {
    return api.post(`/api/write/courses/${courseId}/lessons/${lessonNum}/exit-check`, { response: value, variant: exitVariant });
  }, [courseId, lessonNum, exitVariant]);

  const onExitResult = (res) => setExitResult(res);

  const onTryRemix = () => {
    setRemixActivity(exitResult.remix);
    setExitVariant('remix');
    setExitResult(null);
  };

  const onSeeResults = () => {
    setFinalResult(exitResult);
    setPhase('result');
  };

  const onTestOutSubmit = useCallback(async (value) => {
    return api.post(`/api/write/courses/${courseId}/lessons/${lessonNum}/test-out`, { response: value });
  }, [courseId, lessonNum]);

  const onTestOutResult = (res) => {
    setTestOutResult(res);
    if (res.finalized && res.passed) {
      setFinalResult(res);
      setPhase('result');
    }
  };

  const onContinueLessonFromTestOut = () => setPhase(phases[1] || 'exitcheck');

  const onBeginWalk = () => {
    navigate(lesson.capstone.screen, { assignmentId: lesson.capstone.assignmentId });
  };

  const onCheckCapstone = useCallback(async () => {
    setCapstoneChecking(true);
    setCapstoneMsg(null);
    try {
      const res = await api.post(`/api/write/courses/${courseId}/lessons/${lessonNum}/check-capstone`, {});
      if (res.finalized) {
        setFinalResult(res);
        setPhase('result');
      } else {
        setCapstoneMsg(res.message || 'Not finished yet — complete the Guided Walk first.');
      }
    } catch (e) {
      setCapstoneMsg(e.message);
    } finally {
      setCapstoneChecking(false);
    }
  }, [courseId, lessonNum]);

  const onResultContinue = () => {
    if (finalResult?.courseComplete) {
      navigate('write_courses');
    } else {
      navigate('course_lesson', { courseId, lessonNum: Number(lessonNum) + 1 });
    }
  };

  const onBack = () => navigate('write_courses');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: GW.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft }}>Loading the lesson…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: GW.parchment, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ color: GW.rose, fontFamily: 'Nunito, sans-serif', fontWeight: 700, padding: '0 20px', textAlign: 'center' }}>
          {error || 'Could not load this lesson.'}
        </div>
        <GwButton onClick={onBack}>Back</GwButton>
      </div>
    );
  }

  const score = phase === 'result' ? (finalResult?.score ?? null) : null;

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <TopBar title={data.courseTitle} phases={phases} phase={phase} onBack={onBack} completePhase="result" />
      <AnimatePresence mode="wait">
        {phase === 'opener' && (
          <OpenerPhase key="opener" lesson={lesson} testOutAvailable={data.testOutAvailable} onBegin={onBegin} onTestOut={onTestOut} reduceMotion={reduceMotion} />
        )}
        {phase === 'visual' && (
          <VisualPhase key="visual" lesson={lesson} onContinue={goNext} reduceMotion={reduceMotion} />
        )}
        {phase === 'practice' && (
          <PracticePhase key="practice" lesson={lesson} onSubmit={onPracticeSubmit} onResult={onPracticeResult} done={practiceDone} onContinue={goNext} reduceMotion={reduceMotion} />
        )}
        {phase === 'exitcheck' && (
          <ExitCheckPhase key="exitcheck" activity={exitVariant === 'remix' ? remixActivity : lesson.exitCheck} variant={exitVariant}
            onSubmit={onExitSubmit} onResult={onExitResult} exitResult={exitResult}
            onTryRemix={onTryRemix} onSeeResults={onSeeResults} reduceMotion={reduceMotion} />
        )}
        {phase === 'testout' && (
          <TestOutPhase key="testout" activity={{ ...lesson.testOut, type: 'bridge' }}
            onSubmit={onTestOutSubmit} onResult={onTestOutResult} testOutResult={testOutResult}
            onContinueLesson={onContinueLessonFromTestOut} reduceMotion={reduceMotion} />
        )}
        {phase === 'capstone' && (
          <CapstonePhase key="capstone" lesson={lesson} capstoneStatus={data.capstoneStatus}
            onBeginWalk={onBeginWalk} onCheck={onCheckCapstone} checking={capstoneChecking} message={capstoneMsg} reduceMotion={reduceMotion} />
        )}
        {phase === 'result' && (
          <ResultPhase key="result" score={score} finalResult={finalResult} courseComplete={!!finalResult?.courseComplete}
            onContinue={onResultContinue} reduceMotion={reduceMotion} />
        )}
      </AnimatePresence>
      <Clio text={clio.text} state={clio.state} />
    </div>
  );
}
