import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { calculateXP, calculateElevation, getNextQuestion } from '../lib/mastery.js';
import Mountain from '../components/mountain/Mountain.jsx';
import ElevationBar from '../components/mountain/ElevationBar.jsx';
import SummitCelebration from '../components/mountain/SummitCelebration.jsx';
import QuestionCard from '../components/game/QuestionCard.jsx';
import ResultFlash from '../components/game/ResultFlash.jsx';
import StreakIndicator from '../components/game/StreakIndicator.jsx';
import XPFloat from '../components/game/XPFloat.jsx';

function normalizeQuestions(rawQuestions) {
  return rawQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options || { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
    correct: q.correct,
    explanation: q.explanation,
    stimulus: q.stimulus || null,
    stimulus_type: q.stimulus_type || null,
    difficulty: q.difficulty || 1,
    tags: q.tags || [],
  }));
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function SoloGame() {
  const { navigate, screenParams, user } = useApp();
  const { setId, setTitle } = screenParams || {};
  const playerName = user?.name || user?.username || 'You';

  // ── Questions ──────────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [phase, setPhase] = useState('loading'); // loading | question | result | summited

  // ── Mastery state (refs for mutable game logic, mirrored to state for render) ──
  const masteredIdsRef  = useRef([]);
  const wrongCountsRef  = useRef({});
  const queueRef        = useRef([]);
  const answeredCountRef = useRef(0);

  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer,  setSelectedAnswer]   = useState(null);
  const [answerResult,    setAnswerResult]      = useState(null);
  const [elevation,       setElevation]         = useState(0);
  const [xp,              setXp]                = useState(0);
  const [streak,          setStreak]            = useState(0);
  const [masteredCount,   setMasteredCount]     = useState(0);
  const [showFlash,       setShowFlash]         = useState(false);
  const [showXPFloat,     setShowXPFloat]       = useState(false);
  const [xpFloatAmt,      setXpFloatAmt]        = useState(0);
  const [xpFloatKey,      setXpFloatKey]        = useState(0);

  const advanceTimerRef = useRef(null);

  // ── Load questions ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!setId) { navigate('student_dashboard'); return; }
    let cancelled = false;
    api.get(`/api/questions/sets/${setId}`)
      .then((data) => {
        if (cancelled) return;
        const raw = data.set?.questions || [];
        if (!raw.length) { navigate('student_dashboard'); return; }
        const normalized = shuffle(normalizeQuestions(raw));
        setQuestions(normalized);
        setCurrentQuestion({ ...normalized[0], _startTime: Date.now() });
        setPhase('question');
      })
      .catch(() => { if (!cancelled) navigate('student_dashboard'); });
    return () => { cancelled = true; };
  }, [setId, navigate]);

  // ── Process answer ─────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((letter) => {
    if (selectedAnswer || phase !== 'question' || !currentQuestion) return;
    setSelectedAnswer(letter);

    const question = currentQuestion;
    const correct = letter === question.correct;
    answeredCountRef.current += 1;

    let xpGained = 0;
    let mastered = false;
    let newStreak = streak;

    if (correct) {
      newStreak = streak + 1;
      const wrongCount = wrongCountsRef.current[question.id] || 0;
      mastered = !masteredIdsRef.current.includes(question.id);
      if (mastered) masteredIdsRef.current = [...masteredIdsRef.current, question.id];
      xpGained = calculateXP(wrongCount + 1, newStreak, mastered);

      queueRef.current = queueRef.current.filter((item) => item.question.id !== question.id);

      setStreak(newStreak);
      setXp((prev) => {
        const next = prev + xpGained;
        if (mastered && masteredIdsRef.current.length >= questions.length) {
          // summit bonus
          return next + 200;
        }
        return next;
      });
      setMasteredCount(masteredIdsRef.current.length);

      if (xpGained > 0) {
        setXpFloatAmt(xpGained);
        setXpFloatKey((k) => k + 1);
        setShowXPFloat(true);
        setTimeout(() => setShowXPFloat(false), 1200);
      }
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 600);
    } else {
      newStreak = 0;
      wrongCountsRef.current = {
        ...wrongCountsRef.current,
        [question.id]: (wrongCountsRef.current[question.id] || 0) + 1,
      };
      const wc = wrongCountsRef.current[question.id];
      queueRef.current = queueRef.current.filter((item) => item.question.id !== question.id);
      const dueAt = answeredCountRef.current + (wc === 1 ? 3 : wc === 2 ? 2 : 1);
      queueRef.current = [...queueRef.current, { question, dueAtIndex: dueAt }];
      setStreak(0);
    }

    const newElevation = calculateElevation(masteredIdsRef.current.length, questions.length);
    setElevation(newElevation);

    setAnswerResult({
      correct,
      xpGained,
      mastered,
      streak: newStreak,
      explanation: correct || (wrongCountsRef.current[question.id] || 0) >= 3
        ? question.explanation
        : null,
      hint: (wrongCountsRef.current[question.id] || 0) === 2 ? '💡 Think carefully about this one.' : null,
    });
    setPhase('result');

    // Check summit
    if (correct && masteredIdsRef.current.length >= questions.length) {
      setTimeout(() => setPhase('summited'), correct ? 1600 : 3100);
      return;
    }

    // Get next question
    const nextQ = getNextQuestion(
      questions,
      queueRef.current,
      masteredIdsRef.current,
      wrongCountsRef.current,
      answeredCountRef.current
    );

    const delay = correct ? 1500 : 3000;
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      setPhase('question');
      setSelectedAnswer(null);
      setAnswerResult(null);
      if (nextQ) {
        setCurrentQuestion({ ...nextQ, _startTime: Date.now() });
      }
    }, delay);
  }, [selectedAnswer, phase, currentQuestion, streak, questions]);

  // Cleanup
  useEffect(() => () => { if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current); }, []);

  const players = [{ id: 'solo', name: playerName, elevation, summited: elevation >= 100, color: '#F5A623' }];

  return (
    <div
      style={{
        minHeight: '100vh',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg)',
        fontFamily: 'Nunito, sans-serif',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ResultFlash correct={answerResult?.correct} show={showFlash} />

      {/* Top bar */}
      <div
        style={{
          flexShrink: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          background: 'rgba(15,23,32,0.85)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 20,
          gap: '12px',
        }}
      >
        <button
          onClick={() => navigate('student_dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 700,
            padding: '4px 8px',
            borderRadius: '8px',
            fontFamily: 'Nunito, sans-serif',
            flexShrink: 0,
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%',
            }}
          >
            {setTitle || 'Solo Practice'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {masteredCount}/{questions.length || '?'} mastered
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            ⬆ {elevation}%
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>elevation</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
            ⚡ {xp} XP
          </span>
          <StreakIndicator streak={streak} />
        </div>
      </div>

      {/* Mountain */}
      <div
        style={{
          flexShrink: 0,
          height: '34vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Mountain players={players} highlightId="solo" showLabels interactive={false} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <XPFloat key={xpFloatKey} show={showXPFloat} amount={xpFloatAmt} />
          </div>
        </div>
        <div
          style={{
            width: '80px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 8px 8px 0',
          }}
        >
          <ElevationBar elevation={elevation} masteredCount={masteredCount} totalCount={questions.length || 0} />
        </div>
      </div>

      {/* Question / Result */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <AnimatePresence mode="wait">
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', padding: '60px 24px', color: 'var(--text-muted)', fontWeight: 600 }}
            >
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{ width: '28px', height: '28px', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', borderRadius: '50%' }}
              />
              Loading questions…
            </motion.div>
          )}

          {phase === 'question' && (
            <motion.div
              key={`q-${currentQuestion?.id}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
            >
              <QuestionCard
                question={currentQuestion}
                onAnswer={handleAnswer}
                disabled={!!selectedAnswer}
                selected={selectedAnswer}
              />
            </motion.div>
          )}

          {phase === 'result' && answerResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.24 }}
            >
              <ResultCard result={answerResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SummitCelebration
        show={phase === 'summited'}
        xpEarned={xp}
        playerName={playerName}
        onDismiss={() => navigate('student_dashboard')}
      />
    </div>
  );
}

function ResultCard({ result }) {
  const { correct, explanation, xpGained, mastered, streak } = result;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        border: `2px solid ${correct ? 'var(--pine-light)' : 'var(--sunset)'}`,
        borderRadius: '18px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontSize: '22px', fontWeight: 800, color: correct ? 'var(--pine-light)' : 'var(--sunset)' }}>
          {correct ? 'Correct! ✓' : 'Not quite —'}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {xpGained > 0 && (
            <span style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid var(--border-gold)', borderRadius: '20px', padding: '4px 12px', fontSize: '14px', fontWeight: 800, color: 'var(--gold)' }}>
              +{xpGained} XP
            </span>
          )}
          {mastered && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.2 }}
              style={{ background: 'rgba(245,166,35,0.12)', border: '1px solid var(--gold)', borderRadius: '20px', padding: '4px 12px', fontSize: '13px', fontWeight: 800, color: 'var(--gold)' }}
            >
              ✨ Mastered!
            </motion.span>
          )}
        </div>
      </div>

      {correct && streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,112,67,0.1)', border: '1px solid rgba(255,112,67,0.35)', borderRadius: '12px', padding: '6px 14px', fontSize: '13px', fontWeight: 700, color: '#FF7043', alignSelf: 'flex-start' }}
        >
          🔥 {streak}x streak!
        </motion.div>
      )}

      {explanation && (
        <div style={{ background: 'rgba(240,237,230,0.04)', border: '1px solid var(--border)', borderRadius: '12px', padding: '14px 16px' }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.7, color: 'var(--text-mid)' }}>{explanation}</p>
          {!correct && (
            <p style={{ margin: '10px 0 0', fontSize: '13px', color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: 600 }}>
              This one comes back around.
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity, delay }}
            style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--text-muted)' }}
          />
        ))}
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {correct ? 'Next question in a moment…' : 'Take your time — next question coming…'}
        </span>
      </div>
    </motion.div>
  );
}
