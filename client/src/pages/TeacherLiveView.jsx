import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import { getSocket } from '../lib/socket.js';
import Mountain from '../components/mountain/Mountain.jsx';
import LiveStats from '../components/teacher/LiveStats.jsx';
import HeatMap from '../components/teacher/HeatMap.jsx';
import Modal from '../components/ui/Modal.jsx';

// ─── TeacherLiveView ──────────────────────────────────────────────────────────

export default function TeacherLiveView() {
  const { navigate, gameState, setGameState } = useApp();

  const gameCode   = gameState?.gameCode   || '——';
  const className  = gameState?.className  || 'Class';
  const questions  = gameState?.questions  || [];

  // ── State ─────────────────────────────────────────────────────────────────────
  const [players,     setPlayers]     = useState(gameState?.players || []);
  const [attempts,    setAttempts]    = useState({});
  const [paused,      setPaused]      = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showReview,  setShowReview]  = useState(false);
  const [reviewQ,     setReviewQ]     = useState(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [summitedIds, setSummitedIds] = useState(new Set());
  const [flashSumm,   setFlashSumm]   = useState(null); // name of student who just summited
  const [ending,      setEnding]      = useState(false);

  const startTimeRef  = useRef(Date.now());
  const timerRef      = useRef(null);

  // ── Timer ─────────────────────────────────────────────────────────────────────
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSecs(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // ── Socket events ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    function onStudentJoined(data) {
      const player = data?.player || data;
      if (!player?.name) return;
      setPlayers((prev) => {
        if (prev.find((p) => (p.id || p.name) === (player.id || player.name))) return prev;
        return [...prev, { id: player.id || player.name, name: player.name, elevation: 0, xp: 0, answered: 0, mastered: 0, summited: false }];
      });
    }

    function onStudentAnswered(data) {
      // data: { questionId, studentId, correct }
      if (!data?.questionId) return;
      setAttempts((prev) => {
        const q = prev[data.questionId] || { correct: 0, total: 0 };
        return {
          ...prev,
          [data.questionId]: {
            correct: q.correct + (data.correct ? 1 : 0),
            total:   q.total   + 1,
          },
        };
      });
      // Update player answered count
      setPlayers((prev) =>
        prev.map((p) =>
          (p.id || p.name) === data.studentId
            ? { ...p, answered: (p.answered || 0) + 1 }
            : p
        )
      );
    }

    function onStudentSummited(data) {
      const studentId = data?.id || data?.name;
      if (!studentId) return;
      setSummitedIds((prev) => new Set([...prev, studentId]));
      setFlashSumm(data?.name || studentId);
      setTimeout(() => setFlashSumm(null), 3000);
      setPlayers((prev) =>
        prev.map((p) =>
          (p.id || p.name) === studentId ? { ...p, summited: true, elevation: 100 } : p
        )
      );
    }

    function onProgressUpdate(data) {
      // data: array of { id, name, elevation, xp, mastered, summited }
      if (!Array.isArray(data)) return;
      setPlayers((prev) => {
        const updated = [...prev];
        data.forEach((d) => {
          const idx = updated.findIndex((p) => (p.id || p.name) === (d.id || d.name));
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], ...d };
          }
        });
        return updated;
      });
    }

    socket.on('student:joined',       onStudentJoined);
    socket.on('student:answered',     onStudentAnswered);
    socket.on('student:summited',     onStudentSummited);
    socket.on('game:progress_update', onProgressUpdate);

    return () => {
      socket.off('student:joined',       onStudentJoined);
      socket.off('student:answered',     onStudentAnswered);
      socket.off('student:summited',     onStudentSummited);
      socket.off('game:progress_update', onProgressUpdate);
    };
  }, []);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handlePauseResume = useCallback(() => {
    const socket = getSocket();
    if (!paused) {
      socket?.emit('teacher:pause_game', { gameCode });
      setPaused(true);
      setShowReview(true);
    } else {
      socket?.emit('teacher:resume_game', { gameCode });
      setPaused(false);
      setShowReview(false);
      setReviewQ(null);
    }
  }, [paused, gameCode]);

  const handleReviewQuestion = useCallback((q) => {
    setReviewQ(q);
    getSocket()?.emit('teacher:review_question', { gameCode, questionId: q.id });
  }, [gameCode]);

  const handleEndGame = useCallback(() => {
    setEnding(true);
    getSocket()?.emit('teacher:end_game', { gameCode });
    setGameState((prev) => ({ ...prev, players, endedAt: Date.now() }));
    navigate('results');
  }, [gameCode, navigate, players, setGameState]);

  const handleBack = useCallback(() => {
    setShowEndConfirm(true);
  }, []);

  // ── Summited count ────────────────────────────────────────────────────────────
  const summitedCount = players.filter((p) => p.summited || p.elevation >= 100).length;

  // ── Elapsed time format ───────────────────────────────────────────────────────
  const mins = Math.floor(elapsedSecs / 60).toString().padStart(2, '0');
  const secs = (elapsedSecs % 60).toString().padStart(2, '0');

  // ── Mountain player colors ────────────────────────────────────────────────────
  const mountainPlayers = players.map((p) => ({
    id:        p.id || p.name,
    name:      p.name,
    elevation: p.elevation || 0,
    summited:  p.summited || (p.elevation || 0) >= 100,
    color:
      p.summited || (p.elevation || 0) >= 100
        ? '#F5A623'               // gold — summited
        : (p.elevation || 0) > 50
        ? '#52B788'               // pine-light — ahead
        : '#4a7a8a',              // blue-grey — behind
  }));

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {/* ── TOP BAR ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(15,23,32,0.9)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          flexShrink: 0,
        }}
      >
        {/* Back */}
        <button
          onClick={handleBack}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 700,
            transition: 'color 0.15s',
            padding: '8px 0',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
        >
          ← <span style={{ fontSize: '14px' }}>End Game</span>
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
            Live Game
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '0 6px' }}>·</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-mid)' }}>
            {className}
          </span>
        </div>

        {/* Timer + status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {paused && (
            <span
              style={{
                background: 'rgba(232,93,74,0.15)',
                border: '1px solid rgba(232,93,74,0.4)',
                borderRadius: '20px',
                padding: '3px 10px',
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--sunset)',
              }}
            >
              ⏸ Paused
            </span>
          )}
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {mins}:{secs}
          </span>
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '60% 40%',
          gap: 0,
          minHeight: 0,
        }}
      >
        {/* ── LEFT: Mountain ─────────────────────────────────────────────────── */}
        <div
          style={{
            borderRight: '1px solid var(--border)',
            padding: '20px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Summit counter overlay */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <div
              className="cinzel"
              style={{ fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '0.08em' }}
            >
              {players.length} climber{players.length !== 1 ? 's' : ''}
            </div>
            <AnimatePresence>
              {summitedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    background: 'rgba(245,166,35,0.12)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: 'var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  🏔️ {summitedCount} summited
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mountain SVG */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <Mountain
              players={mountainPlayers}
              highlightId={null}
              showLabels
              interactive
            />
          </div>

          {/* Summited toast */}
          <AnimatePresence>
            {flashSumm && (
              <motion.div
                key={flashSumm}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '20px',
                  padding: '8px 18px',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  whiteSpace: 'nowrap',
                  boxShadow: 'var(--shadow-gold)',
                  zIndex: 10,
                }}
              >
                🏔️ {flashSumm} summited!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── RIGHT: Control Panel ────────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Game Code
              </div>
              <div
                className="cinzel"
                style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em' }}
              >
                {gameCode}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Time
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {mins}:{secs}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Live Stats */}
            <section>
              <SectionTitle>Live Stats</SectionTitle>
              <LiveStats players={players} />
            </section>

            {/* Heat Map */}
            {questions.length > 0 && (
              <section>
                <SectionTitle>Question Difficulty</SectionTitle>
                <HeatMap questions={questions} attempts={attempts} />
              </section>
            )}

            {/* Review panel (when paused) */}
            <AnimatePresence>
              {showReview && questions.length > 0 && (
                <motion.section
                  key="review-panel"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <SectionTitle>Review a Question</SectionTitle>
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      overflow: 'hidden',
                      maxHeight: '260px',
                      overflowY: 'auto',
                    }}
                  >
                    {questions.map((q, i) => (
                      <button
                        key={q.id}
                        onClick={() => handleReviewQuestion(q)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          width: '100%',
                          padding: '10px 14px',
                          background: reviewQ?.id === q.id ? 'rgba(245,166,35,0.08)' : 'transparent',
                          border: 'none',
                          borderBottom: '1px solid var(--border)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => { if (reviewQ?.id !== q.id) e.currentTarget.style.background = 'rgba(240,237,230,0.04)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = reviewQ?.id === q.id ? 'rgba(245,166,35,0.08)' : 'transparent'; }}
                      >
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            background: reviewQ?.id === q.id ? 'var(--gold)' : 'var(--bg-elevated)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: reviewQ?.id === q.id ? '#0F1720' : 'var(--text-muted)',
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span
                          style={{
                            fontSize: '13px',
                            color: reviewQ?.id === q.id ? 'var(--text)' : 'var(--text-mid)',
                            fontWeight: reviewQ?.id === q.id ? 700 : 600,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {q.text?.length > 60 ? q.text.slice(0, 58) + '…' : q.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* ── Action Buttons ──────────────────────────────────────────────── */}
          <div
            style={{
              flexShrink: 0,
              padding: '16px 20px',
              borderTop: '1px solid var(--border)',
              display: 'flex',
              gap: '10px',
            }}
          >
            <motion.button
              onClick={handlePauseResume}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn-secondary"
              style={{
                flex: 1,
                border: paused ? '1px solid var(--pine-light)' : '1px solid var(--border)',
                color: paused ? 'var(--pine-light)' : 'var(--text-mid)',
                fontSize: '14px',
                padding: '11px 16px',
              }}
            >
              {paused ? '▶ Resume' : '⏸ Pause & Review'}
            </motion.button>

            <motion.button
              onClick={() => setShowEndConfirm(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="btn-danger"
              style={{ flex: 1, fontSize: '14px', padding: '11px 16px' }}
              disabled={ending}
            >
              ⏹ End Game
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── End Game Confirm Modal ────────────────────────────────────────────── */}
      <Modal open={showEndConfirm} onClose={() => setShowEndConfirm(false)} maxWidth="400px">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>⏹</div>
          <div>
            <h2
              className="cinzel"
              style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px' }}
            >
              End the Game?
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.6 }}>
              All students will be taken to the results screen. This can't be undone.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setShowEndConfirm(false)}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              onClick={() => { setShowEndConfirm(false); handleEndGame(); }}
              className="btn-danger"
              style={{ flex: 1 }}
              disabled={ending}
            >
              End Game
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
    <div
      style={{
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        marginBottom: '10px',
      }}
    >
      {children}
    </div>
  );
}
