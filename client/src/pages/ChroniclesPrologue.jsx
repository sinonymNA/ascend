import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

// ── Chronicles of the Keep — Cinematic Prologue ───────────────────────────────

// Detect scene text type for styling
function sceneType(text) {
  if (text.startsWith('“') || text.startsWith('"')) return 'dialogue';
  if (text.length <= 36) return 'impact';
  return 'narrative';
}

// Typewriter hook
function useTypewriter(text, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const activeRef = useRef(true);
  const idxRef = useRef(0);

  useEffect(() => {
    activeRef.current = true;
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);

    function tick() {
      if (!activeRef.current) return;
      if (idxRef.current >= text.length) {
        setDone(true);
        return;
      }
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      setTimeout(tick, speed);
    }
    const t = setTimeout(tick, speed);
    return () => {
      activeRef.current = false;
      clearTimeout(t);
    };
  }, [text, speed]);

  const skip = () => {
    if (done) return;
    activeRef.current = false;
    setDisplayed(text);
    setDone(true);
  };

  return { displayed, done, skip };
}

// Ambient dust motes
function DustMotes() {
  const motes = useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: `${5 + Math.random() * 90}%`,
      size: 1 + Math.random() * 2.5,
      opacity: 0.08 + Math.random() * 0.28,
      duration: 18 + Math.random() * 24,
      delay: -Math.random() * 30,
    }));
  }, []);

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {motes.map((m) => (
        <motion.div
          key={m.id}
          style={{
            position: 'absolute',
            bottom: '-10px',
            left: m.left,
            width: `${m.size}px`,
            height: `${m.size}px`,
            borderRadius: '50%',
            background: `rgba(200,169,110,${m.opacity})`,
          }}
          animate={{ y: [0, -(window.innerHeight + 20)] }}
          transition={{
            duration: m.duration,
            delay: m.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}

// Candle flicker overlay
function CandleFlicker() {
  const candles = useMemo(() => [
    { left: '8%', duration: 3.1, delay: 0 },
    { left: '18%', duration: 4.7, delay: 0.8 },
    { left: '82%', duration: 3.8, delay: 1.2 },
    { left: '90%', duration: 5.2, delay: 0.3 },
    { left: '50%', duration: 6.3, delay: 2.1 },
  ], []);

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }}>
      {candles.map((c, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            bottom: 0,
            left: c.left,
            width: '120px',
            height: '60%',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(200,120,20,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
          animate={{ opacity: [0.4, 0.9, 0.5, 1, 0.4] }}
          transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// Scene text component
function SceneText({ text, displayed, done }) {
  const type = sceneType(text);

  const baseStyle = {
    lineHeight: '1.9',
    letterSpacing: '0.01em',
    transition: 'color 0.3s',
  };

  if (type === 'impact') {
    return (
      <div style={{
        ...baseStyle,
        fontFamily: 'Cinzel, serif',
        fontSize: 'clamp(18px, 4vw, 24px)',
        fontWeight: 700,
        color: '#C8A96E',
        textAlign: 'center',
        letterSpacing: '0.06em',
        textShadow: '0 2px 20px rgba(200,169,110,0.3)',
      }}>
        {displayed}
        {!done && <Cursor />}
      </div>
    );
  }

  if (type === 'dialogue') {
    return (
      <div style={{
        ...baseStyle,
        fontFamily: 'Georgia, serif',
        fontSize: 'clamp(15px, 2.5vw, 17px)',
        fontStyle: 'italic',
        color: 'rgba(220,195,150,0.92)',
        paddingLeft: '20px',
        borderLeft: '2px solid rgba(200,169,110,0.3)',
      }}>
        {displayed}
        {!done && <Cursor />}
      </div>
    );
  }

  return (
    <div style={{
      ...baseStyle,
      fontFamily: 'Georgia, serif',
      fontSize: 'clamp(14px, 2.5vw, 16px)',
      color: 'rgba(235,225,210,0.85)',
      whiteSpace: 'pre-wrap',
    }}>
      {displayed}
      {!done && <Cursor />}
    </div>
  );
}

function Cursor() {
  return (
    <motion.span
      animate={{ opacity: [1, 0] }}
      transition={{ duration: 0.7, repeat: Infinity }}
      style={{ display: 'inline-block', marginLeft: '2px', color: '#C8A96E' }}
    >
      ▋
    </motion.span>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function ChroniclesPrologue() {
  const { navigate, screenParams } = useApp();
  const { gameId, slug, prologue: prologueProp } = screenParams;

  const [prologueText, setPrologueText] = useState(prologueProp || '');
  const [currentScene, setCurrentScene] = useState(0);
  const [showCTA, setShowCTA] = useState(false);

  // Fetch prologue from API if not passed through screenParams
  useEffect(() => {
    if (prologueProp || !gameId) return;
    api.get(`/api/edumissions/games/${gameId}`)
      .then((data) => {
        if (data.game?.prologue) setPrologueText(data.game.prologue);
      })
      .catch(console.error);
  }, [gameId, prologueProp]);

  const scenes = useMemo(
    () => prologueText.split('\n\n').filter(Boolean),
    [prologueText]
  );

  const currentText = scenes[currentScene] || '';
  const isLastScene = currentScene === scenes.length - 1;
  const { displayed, done, skip } = useTypewriter(currentText, 16);

  // Show CTA button after last scene finishes typing
  useEffect(() => {
    if (isLastScene && done) {
      const t = setTimeout(() => setShowCTA(true), 800);
      return () => clearTimeout(t);
    }
  }, [isLastScene, done]);

  function handleTap() {
    if (!done) {
      skip();
      return;
    }
    if (isLastScene) return; // CTA button handles navigation
    setCurrentScene((s) => s + 1);
  }

  const progress = scenes.length ? ((currentScene + 1) / scenes.length) * 100 : 0;

  if (!prologueText && !gameId) {
    navigate('chronicles_map', { gameId, slug });
    return null;
  }

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 35%, rgba(55,28,8,0.99) 0%, rgba(6,4,2,1) 65%)',
        cursor: done && isLastScene ? 'default' : 'pointer',
        userSelect: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Parchment texture */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(200,150,50,0.012) 3px, rgba(200,150,50,0.012) 6px)',
      }} />

      <DustMotes />
      <CandleFlicker />

      {/* Game title watermark */}
      <div style={{
        position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, textAlign: 'center', pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: 'Cinzel, serif', fontSize: '11px', fontWeight: 700,
          color: 'rgba(200,169,110,0.35)', letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          Chronicles of the Keep
        </div>
      </div>

      {/* Scene content */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: '560px', width: '100%', padding: '0 32px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ width: '100%', textAlign: sceneType(currentText) === 'narrative' ? 'left' : 'center' }}
          >
            <SceneText text={currentText} displayed={displayed} done={done} />
          </motion.div>
        </AnimatePresence>

        {/* "Tap to continue" hint */}
        <AnimatePresence>
          {done && !isLastScene && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: '28px',
                fontSize: '12px',
                color: 'rgba(200,169,110,0.45)',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: 600,
                letterSpacing: '0.06em',
              }}
            >
              tap to continue
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enter the Keep CTA */}
        <AnimatePresence>
          {showCTA && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}
              onClick={(e) => e.stopPropagation()}
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(200,169,110,0.4)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('chronicles_map', { gameId, slug })}
                style={{
                  background: 'linear-gradient(135deg, #6B4F0A, #C8A96E)',
                  border: 'none',
                  color: '#1a0f04',
                  borderRadius: '14px',
                  padding: '15px 40px',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  fontFamily: 'Cinzel, serif',
                  letterSpacing: '0.06em',
                  boxShadow: '0 8px 30px rgba(100,70,10,0.6)',
                }}
              >
                Enter the Keep →
              </motion.button>
              <button
                onClick={() => navigate('student_dashboard')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(200,169,110,0.35)', fontSize: '12px',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 600,
                }}
              >
                ← Back to shelf
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: '2px',
        background: 'rgba(200,169,110,0.08)',
        zIndex: 10,
      }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, rgba(200,169,110,0.4), rgba(200,169,110,0.8))',
            borderRadius: '0 1px 1px 0',
          }}
        />
      </div>

      {/* Scene counter */}
      <div style={{
        position: 'absolute', bottom: '12px', right: '16px',
        fontSize: '11px', color: 'rgba(200,169,110,0.25)',
        fontFamily: 'Nunito, sans-serif', fontWeight: 700,
        zIndex: 10, letterSpacing: '0.08em',
      }}>
        {currentScene + 1} / {scenes.length}
      </div>

      {/* Skip all hint (top-right) */}
      {currentScene < scenes.length - 3 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentScene(scenes.length - 1);
          }}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '5px 12px',
            color: 'rgba(200,169,110,0.4)', fontSize: '11px',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700,
            cursor: 'pointer', zIndex: 20, letterSpacing: '0.06em',
          }}
        >
          Skip all →
        </button>
      )}
    </div>
  );
}
