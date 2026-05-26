import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import { connectSocket, getSocket } from '../lib/socket.js';

// ─── Simple atmospheric mountain SVG ──────────────────────────────────────────

function AtmosphericMountain() {
  return (
    <svg
      width="260"
      height="180"
      viewBox="0 0 260 180"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="mtnGlow" cx="50%" cy="70%" r="55%">
          <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#0F1720" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="skyFade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b1526" />
          <stop offset="100%" stopColor="#1a2d4a" />
        </linearGradient>
      </defs>
      {/* Sky */}
      <rect width="260" height="180" fill="url(#skyFade)" />
      {/* Stars */}
      {[[28,18,0.9],[70,10,0.7],[110,22,1.0],[160,8,0.8],[210,15,1.1],[240,28,0.8]].map(([x,y,r],i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="white" opacity="0.65" />
      ))}
      {/* Far ridge */}
      <polygon points="0,145 60,90 110,112 155,72 210,100 260,80 260,180 0,180" fill="#162030" />
      {/* Main mountain */}
      <polygon points="130,20 230,155 30,155" fill="#2D6A4F" />
      {/* Rock face */}
      <polygon points="130,20 175,90 85,90" fill="#3D5A40" />
      {/* Snow cap */}
      <polygon points="130,20 155,65 105,65" fill="#E8F4F8" />
      <polygon points="130,20 140,48 122,50" fill="#ffffff" />
      {/* Glow */}
      <ellipse cx="130" cy="130" rx="130" ry="60" fill="url(#mtnGlow)" />
    </svg>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function SummitLogo() {
  return (
    <div
      className="cinzel"
      style={{
        fontSize: '32px',
        fontWeight: 700,
        background: 'linear-gradient(135deg, #F5A623, #C8851A)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        letterSpacing: '0.12em',
      }}
    >
      SUMMIT
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function StudentJoin() {
  const { navigate, setGameState } = useApp();

  // Step: 'code' | 'name' | 'lobby'
  const [step, setStep] = useState('code');
  const [gameCode, setGameCode] = useState('');
  const [name, setName] = useState('');
  const [shakeCode, setShakeCode] = useState(false);
  const [shakeName, setShakeName] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState('');
  const [classmates, setClassmates] = useState([]);

  const codeInputRef = useRef(null);
  const nameInputRef = useRef(null);

  // Autofocus inputs on step change
  useEffect(() => {
    if (step === 'code') codeInputRef.current?.focus();
    if (step === 'name') nameInputRef.current?.focus();
  }, [step]);

  // ── Step 1: Validate game code format ────────────────────────────────────────
  const handleCodeSubmit = useCallback(() => {
    const trimmed = gameCode.trim();
    if (trimmed.length < 4) {
      setShakeCode(true);
      setError('Code must be at least 4 characters');
      setTimeout(() => setShakeCode(false), 600);
      return;
    }
    setError('');
    setStep('name');
  }, [gameCode]);

  // ── Step 2: Connect socket and join ─────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setShakeName(true);
      setTimeout(() => setShakeName(false), 600);
      return;
    }
    if (trimmedName.length < 1) {
      setShakeName(true);
      setError('Please enter your name');
      setTimeout(() => setShakeName(false), 600);
      return;
    }

    setJoining(true);
    setError('');

    try {
      const socket = connectSocket(null); // students join without auth token

      // Listen for lobby confirmation
      socket.once('game:lobby', (data) => {
        setGameState({ ...data, gameCode, playerName: trimmedName });
        navigate('student_game');
      });

      // Listen for errors (wrong code, game not started, etc.)
      socket.once('join:error', (data) => {
        setError(data?.message || 'Could not join — check your game code and try again.');
        setJoining(false);
        setStep('code');
      });

      // Listen for updated classmate lists
      socket.on('student:joined', (data) => {
        if (data?.players) {
          setClassmates(data.players);
        } else if (data?.name) {
          setClassmates((prev) => {
            if (prev.find((p) => p.name === data.name)) return prev;
            return [...prev, { name: data.name }];
          });
        }
      });

      // Lobby phase — waiting for teacher to start
      socket.once('lobby:state', (data) => {
        if (data?.players) setClassmates(data.players);
        setStep('lobby');
        setJoining(false);
      });

      socket.emit('student:join', { gameCode, name: trimmedName });

      // Fallback: if no lobby:state event arrives, assume we're in lobby
      setTimeout(() => {
        if (joining) {
          setStep('lobby');
          setJoining(false);
        }
      }, 3000);

    } catch (err) {
      setError('Connection failed. Please try again.');
      setJoining(false);
    }
  }, [name, gameCode, navigate, setGameState, joining]);

  // ── Key handlers ─────────────────────────────────────────────────────────────
  const handleCodeKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleCodeSubmit();
  }, [handleCodeSubmit]);

  const handleNameKeyDown = useCallback((e) => {
    if (e.key === 'Enter') handleJoin();
  }, [handleJoin]);

  // ── Cleanup socket on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      const socket = getSocket();
      socket?.off('student:joined');
    };
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: 'Nunito, sans-serif',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '500px',
          height: '300px',
          background: 'radial-gradient(ellipse at center, rgba(45,106,79,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <AnimatePresence mode="wait">

        {/* ── STEP 1: Enter game code ─────────────────────────────────────────── */}
        {step === 'code' && (
          <motion.div
            key="step-code"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              width: '100%',
              maxWidth: '440px',
            }}
          >
            <SummitLogo />

            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 'clamp(22px, 5vw, 28px)',
                  fontWeight: 800,
                  color: 'var(--text)',
                  margin: '0 0 8px',
                }}
              >
                Enter your game code
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                Your teacher has a code on the screen
              </p>
            </div>

            {/* Code input */}
            <div style={{ width: '100%', position: 'relative' }}>
              <input
                ref={codeInputRef}
                type="text"
                value={gameCode}
                maxLength={8}
                className={shakeCode ? 'animate-shake' : ''}
                onChange={(e) => {
                  setError('');
                  setGameCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                }}
                onKeyDown={handleCodeKeyDown}
                placeholder="XXXXXXXX"
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: `2px solid ${shakeCode ? 'var(--sunset)' : 'var(--border)'}`,
                  borderRadius: '16px',
                  color: 'var(--gold)',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '48px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '20px 70px 20px 20px',
                  outline: 'none',
                  letterSpacing: '0.15em',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  caretColor: 'var(--gold)',
                }}
                onFocus={(e) => {
                  if (!shakeCode) e.target.style.borderColor = 'var(--border-gold)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)';
                }}
                onBlur={(e) => {
                  if (!shakeCode) e.target.style.borderColor = 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {/* Arrow submit button */}
              <button
                onClick={handleCodeSubmit}
                disabled={!gameCode.trim()}
                aria-label="Continue"
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  background: gameCode.trim().length >= 4 ? 'var(--gold)' : 'rgba(245,166,35,0.2)',
                  border: 'none',
                  cursor: gameCode.trim().length >= 4 ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  color: gameCode.trim().length >= 4 ? '#0F1720' : 'var(--text-muted)',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                →
              </button>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ color: 'var(--sunset)', fontSize: '14px', fontWeight: 700, margin: 0 }}
              >
                {error}
              </motion.p>
            )}

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
              Press Enter or tap the arrow to continue
            </p>
          </motion.div>
        )}

        {/* ── STEP 2: Enter display name ──────────────────────────────────────── */}
        {step === 'name' && (
          <motion.div
            key="step-name"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '28px',
              width: '100%',
              maxWidth: '440px',
            }}
          >
            <SummitLogo />

            {/* Game code badge */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245,166,35,0.08)',
                border: '1px solid var(--border-gold)',
                borderRadius: '20px',
                padding: '6px 16px',
              }}
            >
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Game Code
              </span>
              <span
                className="cinzel"
                style={{ fontSize: '16px', fontWeight: 700, color: 'var(--gold)', letterSpacing: '0.1em' }}
              >
                {gameCode}
              </span>
              <button
                onClick={() => { setStep('code'); setError(''); }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '12px',
                  padding: '0 0 0 4px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ textAlign: 'center' }}>
              <h1
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: 'clamp(22px, 5vw, 28px)',
                  fontWeight: 800,
                  color: 'var(--text)',
                  margin: '0 0 8px',
                }}
              >
                What should we call you?
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                This is your name on the mountain
              </p>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                maxLength={20}
                className={shakeName ? 'animate-shake' : ''}
                onChange={(e) => { setError(''); setName(e.target.value); }}
                onKeyDown={handleNameKeyDown}
                placeholder="Your name..."
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: `2px solid ${shakeName ? 'var(--sunset)' : 'var(--border)'}`,
                  borderRadius: '14px',
                  color: 'var(--text)',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '22px',
                  fontWeight: 700,
                  textAlign: 'center',
                  padding: '16px 20px',
                  outline: 'none',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                  caretColor: 'var(--gold)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--border-gold)';
                  e.target.style.boxShadow = '0 0 0 3px rgba(245,166,35,0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = shakeName ? 'var(--sunset)' : 'var(--border)';
                  e.target.style.boxShadow = 'none';
                }}
              />

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ color: 'var(--sunset)', fontSize: '14px', fontWeight: 700, margin: 0, textAlign: 'center' }}
                >
                  {error}
                </motion.p>
              )}

              <motion.button
                className="btn-primary"
                onClick={handleJoin}
                disabled={joining || !name.trim()}
                whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(245,166,35,0.4)' }}
                whileTap={{ scale: 0.97 }}
                style={{ width: '100%', fontSize: '17px', padding: '16px 32px' }}
              >
                {joining ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SpinnerIcon />
                    Joining…
                  </span>
                ) : (
                  'Join the Climb →'
                )}
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* ── LOBBY: Waiting for teacher ──────────────────────────────────────── */}
        {step === 'lobby' && (
          <motion.div
            key="step-lobby"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              width: '100%',
              maxWidth: '480px',
            }}
          >
            <SummitLogo />

            {/* Pulsing mountain */}
            <motion.div
              animate={{ scale: [1, 1.03, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <AtmosphericMountain />
            </motion.div>

            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: 'var(--text-mid)',
                  margin: '0 0 6px',
                  lineHeight: 1.5,
                }}
              >
                Waiting for your teacher to start the climb…
              </p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay }}
                    style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--gold)' }}
                  />
                ))}
              </div>
            </div>

            {/* Classmates list */}
            {classmates.length > 0 && (
              <div
                style={{
                  width: '100%',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border)',
                    fontSize: '12px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>Climbers Ready</span>
                  <span style={{ color: 'var(--pine-light)' }}>{classmates.length}</span>
                </div>
                <div style={{ maxHeight: '200px', overflowY: 'auto', padding: '8px 0' }}>
                  <AnimatePresence initial={false}>
                    {classmates.map((p, i) => {
                      const isMe = p.name === name.trim();
                      return (
                        <motion.div
                          key={p.name}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '8px 16px',
                            background: isMe ? 'rgba(245,166,35,0.07)' : 'transparent',
                          }}
                        >
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isMe ? 'var(--gold)' : 'var(--bg-elevated)',
                              border: `2px solid ${isMe ? 'var(--gold)' : 'var(--border)'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 800,
                              color: isMe ? '#0F1720' : 'var(--text-mid)',
                              flexShrink: 0,
                            }}
                          >
                            {p.name?.[0]?.toUpperCase() || '?'}
                          </span>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: isMe ? 800 : 600,
                              color: isMe ? 'var(--gold)' : 'var(--text)',
                            }}
                          >
                            {p.name}
                            {isMe && (
                              <span
                                style={{
                                  marginLeft: '8px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  color: 'var(--text-muted)',
                                  background: 'rgba(245,166,35,0.1)',
                                  borderRadius: '10px',
                                  padding: '2px 8px',
                                }}
                              >
                                You
                              </span>
                            )}
                          </span>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {classmates.length === 0 && (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
                You're the first one here! Others will show up soon.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
      style={{
        width: '16px',
        height: '16px',
        border: '2.5px solid rgba(15,23,32,0.3)',
        borderTopColor: '#0F1720',
        borderRadius: '50%',
      }}
    />
  );
}
