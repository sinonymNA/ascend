'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';
import Clio from '../components/write/Clio.jsx';

// ── Speed Round — "Describe or Explain?" (screen "speed_round") ─────────────
// Quick warm-up game: sentences appear one at a time, students tap DESCRIBE or
// EXPLAIN as fast as possible. Points for correct + speed bonus. Ends with a
// global leaderboard.

const ROUND_MS = 5000;

function Header({ onBack }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', background: `${GW.parchment}E8`, backdropFilter: 'blur(6px)',
      borderBottom: `1px solid ${GW.amber}30`,
    }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: GW.ink, fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
        opacity: 0.7, padding: '6px 10px',
      }}>← Back</button>
      <div style={{
        fontFamily: 'Cinzel, serif', fontWeight: 800, letterSpacing: '0.18em',
        fontSize: 13, color: GW.amber, textTransform: 'uppercase',
      }}>Speed Round</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function IntroPhase({ onStart, loading }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '14vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 6vw, 38px)', color: GW.ink, margin: '0 0 12px', fontWeight: 800 }}>
        Describe or Explain?
      </h1>
      <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14.5, lineHeight: 1.6, margin: '0 auto 28px' }}>
        Twelve sentences, one at a time. Tap <strong>DESCRIBE</strong> if it just states what happened —
        tap <strong>EXPLAIN</strong> if it gives the reason or mechanism WHY/HOW. Faster correct answers earn more points.
      </p>
      <GwButton onClick={onStart} disabled={loading}>{loading ? 'Loading…' : 'Start'}</GwButton>
    </div>
  );
}

function PlayingPhase({ item, index, total, onAnswer }) {
  const [progress, setProgress] = useState(1);
  const startRef = useRef(Date.now());
  const doneRef = useRef(false);

  useEffect(() => {
    startRef.current = Date.now();
    doneRef.current = false;
    setProgress(1);
    const raf = setInterval(() => {
      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, 1 - elapsed / ROUND_MS);
      setProgress(remaining);
      if (remaining <= 0 && !doneRef.current) {
        doneRef.current = true;
        onAnswer(null, ROUND_MS);
      }
    }, 50);
    return () => clearInterval(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id]);

  const tap = (choice) => {
    if (doneRef.current) return;
    doneRef.current = true;
    onAnswer(choice, Date.now() - startRef.current);
  };

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '8vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {index + 1} / {total}
        </div>
        <div style={{ flex: 1, height: 6, borderRadius: 4, background: `${GW.ink}12`, marginLeft: 14, overflow: 'hidden' }}>
          <motion.div
            initial={false}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.05, ease: 'linear' }}
            style={{ height: '100%', background: progress < 0.3 ? GW.rose : GW.amber, borderRadius: 4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          style={{
            background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14,
            padding: '28px 22px', minHeight: 110, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, color: GW.ink, lineHeight: 1.55, textAlign: 'center', fontFamily: 'Georgia, serif',
          }}>
          "{item.text}"
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => tap('describe')} style={{
          padding: '20px 12px', borderRadius: 14, border: `2px solid ${GW.blue}`, background: `${GW.blue}1a`,
          color: GW.ink, fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 16, letterSpacing: '0.06em',
          cursor: 'pointer', textTransform: 'uppercase',
        }}>🌡️ Describe</motion.button>
        <motion.button whileTap={{ scale: 0.96 }} onClick={() => tap('explain')} style={{
          padding: '20px 12px', borderRadius: 14, border: `2px solid ${GW.amber}`, background: `${GW.amber}1a`,
          color: GW.ink, fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 16, letterSpacing: '0.06em',
          cursor: 'pointer', textTransform: 'uppercase',
        }}>⚙️ Explain</motion.button>
      </div>
    </div>
  );
}

function ResultsPhase({ result, onPlayAgain, onBack }) {
  if (!result) return null;
  const { score, correctCount, total, results, personalBest, leaderboard, award } = result;
  const wrong = results.filter((r) => !r.correct);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: GW.amber, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Round Complete
        </div>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', margin: '8px auto 14px',
          background: GW.sageSoft, border: `3px solid ${GW.sage}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 32, color: GW.ink,
        }}>{score}</div>
        <div style={{ fontSize: 14, color: GW.inkSoft, fontWeight: 700 }}>{correctCount}/{total} correct</div>
        {score >= personalBest && (
          <div style={{ fontSize: 13, color: GW.sage, fontWeight: 800, marginTop: 4 }}>🏆 New personal best!</div>
        )}
        {award?.xpGain > 0 && (
          <div style={{ fontSize: 14, fontWeight: 800, color: GW.amber, marginTop: 8 }}>+{award.xpGain} XP</div>
        )}
      </div>

      {wrong.length > 0 && (
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 12, color: GW.rose, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Worth a second look
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {wrong.map((r) => (
              <div key={r.id} style={{
                background: GW.roseSoft, border: `1px solid ${GW.rose}40`, borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: GW.ink, lineHeight: 1.5,
              }}>
                <div style={{ fontStyle: 'italic', marginBottom: 4 }}>"{r.text}"</div>
                <div style={{ fontWeight: 700, color: GW.inkSoft }}>
                  This {r.type === 'describe' ? 'describes WHAT happened' : 'explains WHY/HOW it happened'} —
                  it's <strong>{r.type.toUpperCase()}</strong>{r.yourChoice ? `, not ${r.yourChoice.toUpperCase()}` : ' (you ran out of time)'}.
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {leaderboard?.length > 0 && (
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 12, color: GW.amber, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            Leaderboard
          </div>
          <div style={{ background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12, overflow: 'hidden' }}>
            {leaderboard.map((r, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderTop: i > 0 ? `1px solid ${GW.amber}20` : 'none',
                fontSize: 13.5, color: GW.ink,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, color: GW.amber, width: 20 }}>{i + 1}</span>
                  <span style={{ fontWeight: 700 }}>{r.name}</span>
                </div>
                <span style={{ fontWeight: 800 }}>{r.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        <GwButton onClick={onPlayAgain}>Play Again</GwButton>
        <GwButton variant="secondary" onClick={onBack}>Back</GwButton>
      </div>
    </div>
  );
}

export default function SpeedRound() {
  const { navigate } = useApp();
  const [phase, setPhase] = useState('intro');
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onBack = () => navigate('write_home');

  const start = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/api/write/games/speed-round?count=12');
      setRound(res.round);
      setAnswers([]);
      setIndex(0);
      setPhase('playing');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onAnswer = useCallback((choice, timeMs) => {
    setAnswers((prev) => {
      const next = [...prev, { id: round[index].id, choice, timeMs }];
      if (next.length >= round.length) {
        (async () => {
          try {
            const res = await api.post('/api/write/games/speed-round/submit', { answers: next });
            setResult(res);
            setPhase('results');
          } catch (e) {
            setError(e.message);
          }
        })();
      } else {
        setIndex((i) => i + 1);
      }
      return next;
    });
  }, [round, index]);

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <Header onBack={onBack} />
      {error && (
        <div style={{ textAlign: 'center', color: GW.rose, fontWeight: 700, padding: 20 }}>{error}</div>
      )}
      {phase === 'intro' && <IntroPhase onStart={start} loading={loading} />}
      {phase === 'playing' && round[index] && (
        <PlayingPhase item={round[index]} index={index} total={round.length} onAnswer={onAnswer} />
      )}
      {phase === 'results' && <ResultsPhase result={result} onPlayAgain={start} onBack={onBack} />}
      <Clio
        text={
          phase === 'intro' ? "Tap fast, but tap right — speed only counts on correct answers." :
          phase === 'results' ? (result?.correctCount === result?.total ? 'Flawless round — your instincts are sharp.' : 'Good round — review the ones you missed.') :
          ''
        }
        state={phase === 'results' && result?.correctCount === result?.total ? 'celebrating' : 'idle'}
      />
    </div>
  );
}
