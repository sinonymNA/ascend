import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import { getSocket } from '../lib/socket.js';
import Mountain from '../components/mountain/Mountain.jsx';
import ElevationBar from '../components/mountain/ElevationBar.jsx';
import SummitCelebration from '../components/mountain/SummitCelebration.jsx';
import QuestionCard from '../components/game/QuestionCard.jsx';
import ResultFlash from '../components/game/ResultFlash.jsx';
import StreakIndicator from '../components/game/StreakIndicator.jsx';
import XPFloat from '../components/game/XPFloat.jsx';

// ─── StudentGame ──────────────────────────────────────────────────────────────

export default function StudentGame() {
  const { navigate, gameState, setGameState, user } = useApp();

  const playerName   = gameState?.playerName || user?.name || 'You';
  const playerId     = gameState?.playerId   || user?.id   || 'me';
  const gameCode     = gameState?.gameCode   || '';

  // ── State ─────────────────────────────────────────────────────────────────────
  const [currentQuestion, setCurrentQuestion]   = useState(null);
  const [selectedAnswer,  setSelectedAnswer]    = useState(null);
  const [answerResult,    setAnswerResult]       = useState(null);
  const [elevation,       setElevation]          = useState(gameState?.elevation || 0);
  const [xpEarned,        setXpEarned]           = useState(gameState?.xp || 0);
  const [streak,          setStreak]             = useState(0);
  const [masteredCount,   setMasteredCount]      = useState(0);
  const [totalCount,      setTotalCount]         = useState(gameState?.totalQuestions || 0);
  const [classmatesPositions, setClassmatesPositions] = useState([]);
  const [phase,           setPhase]              = useState('question'); // 'question'|'result'|'summited'
  const [showXPFloat,     setShowXPFloat]        = useState(false);
  const [xpFloatAmount,   setXpFloatAmount]      = useState(0);
  const [xpFloatKey,      setXpFloatKey]         = useState(0);
  const [paused,          setPaused]             = useState(false);
  const [showFlash,       setShowFlash]          = useState(false);
  const [summitPosition,  setSummitPosition]     = useState(null);

  const advanceTimerRef = useRef(null);

  // ── Auto-advance after result ─────────────────────────────────────────────────
  const scheduleAdvance = useCallback((correct, nextQuestion) => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    const delay = correct ? 1500 : 3000;
    advanceTimerRef.current = setTimeout(() => {
      setPhase('question');
      setSelectedAnswer(null);
      setAnswerResult(null);
      if (nextQuestion) {
        setCurrentQuestion({ ...nextQuestion, _startTime: Date.now() });
      }
    }, delay);
  }, []);

  // ── Seed first question if game was already active when we joined ─────────────
  useEffect(() => {
    if (gameState?.firstQuestion) {
      setCurrentQuestion({ ...gameState.firstQuestion, _startTime: Date.now() });
    }
    if (gameState?.questionCount) {
      setTotalCount(gameState.questionCount);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Socket event handlers ─────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onQuestionNext({ question }) {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      setCurrentQuestion(question);
      setPhase('question');
      setSelectedAnswer(null);
      setAnswerResult(null);
    }

    function onAnswerResult(result) {
      setAnswerResult(result);
      setPhase('result');

      if (result.correct) {
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 600);
      }

      if (result.elevation !== undefined) setElevation(result.elevation);
      if (result.xpGained)  {
        setXpEarned((prev) => prev + (result.xpGained || 0));
        setXpFloatAmount(result.xpGained);
        setXpFloatKey((k) => k + 1);
        setShowXPFloat(true);
        setTimeout(() => setShowXPFloat(false), 1200);
      }
      if (result.streak        !== undefined) setStreak(result.streak);
      if (result.masteredCount !== undefined) setMasteredCount(result.masteredCount);
      if (result.totalCount    !== undefined) setTotalCount(result.totalCount);

      if (result.summited) {
        setSummitPosition(result.position || null);
        setPhase('summited');
        return;
      }

      scheduleAdvance(result.correct, result.nextQuestion);
    }

    function onClassmatesPositions(positions) {
      setClassmatesPositions(positions || []);
    }

    function onGamePaused() {
      setPaused(true);
    }

    function onGameResumed() {
      setPaused(false);
    }

    function onGameEnded(results) {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      setGameState((prev) => ({ ...prev, results, finalElevation: elevation, finalXP: xpEarned }));
      navigate('results');
    }

    socket.on('question:next',         onQuestionNext);
    socket.on('answer:result',         onAnswerResult);
    socket.on('classmates:positions',  onClassmatesPositions);
    socket.on('game:paused',           onGamePaused);
    socket.on('game:resumed',          onGameResumed);
    socket.on('game:ended',            onGameEnded);

    return () => {
      socket.off('question:next',        onQuestionNext);
      socket.off('answer:result',        onAnswerResult);
      socket.off('classmates:positions', onClassmatesPositions);
      socket.off('game:paused',          onGamePaused);
      socket.off('game:resumed',         onGameResumed);
      socket.off('game:ended',           onGameEnded);
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [navigate, setGameState, scheduleAdvance, elevation, xpEarned]);

  // ── Answer handler ────────────────────────────────────────────────────────────
  const handleAnswer = useCallback((letter) => {
    if (selectedAnswer || phase !== 'question' || !currentQuestion) return;

    const timeTakenMs = currentQuestion._startTime
      ? Date.now() - currentQuestion._startTime
      : 0;

    setSelectedAnswer(letter);
    getSocket()?.emit('student:answer', {
      gameCode,
      questionId: currentQuestion.id,
      selected:   letter,
      timeTakenMs,
    });
  }, [selectedAnswer, phase, currentQuestion, gameCode]);

  // ── Dismiss summit celebration ────────────────────────────────────────────────
  const handleDismissSummit = useCallback(() => {
    setPhase('question');
  }, []);

  // ── Build player list for Mountain ───────────────────────────────────────────
  const allPlayers = [
    { id: playerId, name: playerName, elevation, summited: elevation >= 100, color: '#F5A623' },
    ...classmatesPositions
      .filter((p) => p.name !== playerName)
      .map((p) => ({
        id:       p.name,
        name:     p.name,
        elevation: p.elevation || 0,
        summited:  p.summited || (p.elevation || 0) >= 100,
        color:     p.elevation >= elevation ? '#52B788' : '#4a5568',
      })),
  ];

  // ─── Render ───────────────────────────────────────────────────────────────────

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
      {/* ── ResultFlash overlay ──────────────────────────────────────────────── */}
      <ResultFlash correct={answerResult?.correct} show={showFlash} />

      {/* ── TOP BAR (≈15%) ───────────────────────────────────────────────────── */}
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
        }}
      >
        {/* Elevation */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span
            className="cinzel"
            style={{ fontSize: '18px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1 }}
          >
            ⬆ {elevation}%
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            elevation
          </span>
        </div>

        {/* XP total */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--text)',
              lineHeight: 1,
            }}
          >
            ⚡ {xpEarned} XP
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {masteredCount}/{totalCount || '?'} mastered
          </span>
        </div>

        {/* Streak */}
        <StreakIndicator streak={streak} />
      </div>

      {/* ── MOUNTAIN SECTION (≈40%) ───────────────────────────────────────────── */}
      <div
        style={{
          flexShrink: 0,
          height: '38vh',
          position: 'relative',
          display: 'flex',
          alignItems: 'stretch',
          overflow: 'hidden',
        }}
      >
        {/* Mountain */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Mountain
            players={allPlayers}
            highlightId={playerId}
            showLabels
            interactive={false}
          />

          {/* XP Float — centered on mountain */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
            }}
          >
            <XPFloat key={xpFloatKey} show={showXPFloat} amount={xpFloatAmount} />
          </div>
        </div>

        {/* Elevation bar — right side */}
        <div
          style={{
            width: '80px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingRight: '8px',
            paddingTop: '8px',
            paddingBottom: '8px',
          }}
        >
          <ElevationBar
            elevation={elevation}
            masteredCount={masteredCount}
            totalCount={totalCount || 0}
          />
        </div>
      </div>

      {/* ── QUESTION SECTION (≈45%, scrollable) ──────────────────────────────── */}
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
          {phase === 'question' && !currentQuestion && (
            <motion.div
              key="waiting-phase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.24 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '40px 24px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ fontSize: '40px', lineHeight: 1 }}
              >
                ⛰️
              </motion.div>
              <p
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: 0,
                  letterSpacing: '0.04em',
                }}
              >
                Waiting for the climb to begin…
              </p>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === 'question' && currentQuestion && (
            <motion.div
              key="question-phase"
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
              key="result-phase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
            >
              <ResultCard result={answerResult} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── PAUSE OVERLAY ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {paused && (
          <motion.div
            key="pause-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 150,
              background: 'rgba(10,16,26,0.82)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px',
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22, delay: 0.05 }}
              style={{ fontSize: '52px', lineHeight: 1 }}
            >
              ⏸
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              style={{ textAlign: 'center' }}
            >
              <p
                style={{
                  fontFamily: 'Cinzel, serif',
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  margin: '0 0 8px',
                  letterSpacing: '0.05em',
                }}
              >
                Game Paused
              </p>
              <p style={{ fontSize: '15px', color: 'var(--text-mid)', fontWeight: 600 }}>
                Your teacher has paused the game. Hold tight!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SUMMIT CELEBRATION ───────────────────────────────────────────────── */}
      <SummitCelebration
        show={phase === 'summited'}
        xpEarned={xpEarned}
        position={summitPosition}
        playerName={playerName}
        onDismiss={handleDismissSummit}
      />
    </div>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────

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
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              fontSize: '22px',
              fontWeight: 800,
              color: correct ? 'var(--pine-light)' : 'var(--sunset)',
            }}
          >
            {correct ? 'Correct! ✓' : 'Not quite —'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* XP gained */}
          {xpGained > 0 && (
            <span
              style={{
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid var(--border-gold)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--gold)',
              }}
            >
              +{xpGained} XP
            </span>
          )}
          {/* Mastered badge */}
          {mastered && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.2 }}
              style={{
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid var(--gold)',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--gold)',
              }}
            >
              ✨ Mastered!
            </motion.span>
          )}
        </div>
      </div>

      {/* Streak callout */}
      {correct && streak >= 3 && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255,112,67,0.1)',
            border: '1px solid rgba(255,112,67,0.35)',
            borderRadius: '12px',
            padding: '6px 14px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#FF7043',
            alignSelf: 'flex-start',
          }}
        >
          🔥 {streak}x streak — keep going!
        </motion.div>
      )}

      {/* Explanation */}
      {explanation && (
        <div
          style={{
            background: 'rgba(240,237,230,0.04)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '14px 16px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '14px',
              lineHeight: 1.7,
              color: 'var(--text-mid)',
            }}
          >
            {explanation}
          </p>
          {!correct && (
            <p
              style={{
                margin: '10px 0 0',
                fontSize: '13px',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
                fontWeight: 600,
              }}
            >
              This one comes back around.
            </p>
          )}
        </div>
      )}

      {/* Next hint */}
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
