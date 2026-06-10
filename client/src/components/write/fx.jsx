'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

// ── Summit Write — shared cinematic FX kit ────────────────────────────────────
// Vignette, particle fields, ornate gold framing, metallic text, rank stamps.

export const GOLD = '#F5A623';
export const GOLD_DEEP = '#8B6914';
export const GOLD_LIGHT = '#FFE9B8';

// Metallic gold gradient for display text
export const goldText = {
  background: `linear-gradient(175deg, ${GOLD_LIGHT} 0%, ${GOLD} 38%, #C8851A 62%, ${GOLD_LIGHT} 100%)`,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

// ── Film vignette + grain overlay (fixed, sits above content visuals) ────────
export function Vignette({ strength = 0.55 }) {
  return (
    <div aria-hidden style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50,
      background: `radial-gradient(ellipse at 50% 42%, transparent 52%, rgba(0,0,0,${strength}) 130%)`,
    }} />
  );
}

// ── Floating particle field (embers / dust / snow) ────────────────────────────
export function ParticleField({ count = 14, color = GOLD, type = 'ember', zIndex = 2 }) {
  const parts = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    size: type === 'dust' ? 1.5 + Math.random() * 2 : 2 + Math.random() * 3,
    dur: 9 + Math.random() * 14,
    delay: Math.random() * 12,
    drift: (Math.random() - 0.5) * 60,
    opacity: type === 'dust' ? 0.18 + Math.random() * 0.2 : 0.3 + Math.random() * 0.4,
  })), [count, type]);

  return (
    <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex, overflow: 'hidden' }}>
      {parts.map((p) => (
        <motion.div key={p.id}
          initial={{ y: '105vh', x: 0, opacity: 0 }}
          animate={{
            y: type === 'snow' ? '105vh' : '-8vh',
            x: [0, p.drift, p.drift * 0.4, p.drift],
            opacity: [0, p.opacity, p.opacity, 0],
          }}
          transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: type === 'snow' ? '-3vh' : 'auto',
            bottom: type === 'snow' ? 'auto' : 0,
            width: p.size, height: p.size, borderRadius: '50%',
            background: color,
            boxShadow: type === 'ember' ? `0 0 ${p.size * 3}px ${color}` : 'none',
          }} />
      ))}
    </div>
  );
}

// ── Ornate gold corner flourish (one corner; rotated per position) ───────────
function Corner({ rotate, color }) {
  const pos = {
    0: { top: -1, left: -1 },
    90: { top: -1, right: -1 },
    180: { bottom: -1, right: -1 },
    270: { bottom: -1, left: -1 },
  }[rotate];
  return (
    <svg aria-hidden width="26" height="26" viewBox="0 0 26 26" style={{
      position: 'absolute', ...pos, transform: `rotate(${rotate}deg)`, pointerEvents: 'none',
    }}>
      <path d="M1 18 L1 5 Q1 1 5 1 L18 1" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M1 11 L1 5 Q1 1 5 1 L11 1" fill="none" stroke={GOLD_LIGHT} strokeWidth="0.8" strokeLinecap="round" opacity="0.7" />
      <circle cx="20" cy="1.2" r="1.6" fill={color} />
      <circle cx="1.2" cy="20" r="1.6" fill={color} />
    </svg>
  );
}

// ── Ornate framed panel — the standard AAA card ───────────────────────────────
export function OrnateCard({ children, glow, accent = GOLD, style = {}, ...rest }) {
  return (
    <div {...rest} style={{
      position: 'relative',
      background: 'linear-gradient(165deg, rgba(36,53,72,0.92), rgba(22,33,48,0.96))',
      border: `1px solid ${accent}38`,
      borderRadius: 14,
      boxShadow: glow
        ? `0 0 28px ${accent}1E, 0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)`
        : '0 16px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06)',
      ...style,
    }}>
      <Corner rotate={0} color={accent} />
      <Corner rotate={90} color={accent} />
      <Corner rotate={180} color={accent} />
      <Corner rotate={270} color={accent} />
      {children}
    </div>
  );
}

// ── Ornate section heading: ──── ◆ TITLE ◆ ──── ─────────────────────────────
export function SectionTitle({ children, color = GOLD, style = {} }) {
  const rule = { flex: 1, height: 1, background: `linear-gradient(90deg, transparent, ${color}55)` };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 0 14px', ...style }}>
      <div style={rule} />
      <span style={{ color, fontSize: 8, lineHeight: 1 }}>◆</span>
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 800, letterSpacing: '0.22em',
        color, textShadow: `0 0 18px ${color}40`, whiteSpace: 'nowrap',
      }}>{children}</span>
      <span style={{ color, fontSize: 8, lineHeight: 1 }}>◆</span>
      <div style={{ ...rule, background: `linear-gradient(90deg, ${color}55, transparent)` }} />
    </div>
  );
}

// ── Metallic title with animated shine sweep ──────────────────────────────────
export function ShineTitle({ children, size = 'clamp(26px, 7vw, 44px)', style = {} }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', ...style }}>
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: size, fontWeight: 900, letterSpacing: '0.08em',
        ...goldText,
        filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.8)) drop-shadow(0 0 24px rgba(245,166,35,0.3))',
      }}>{children}</span>
      <motion.span aria-hidden
        animate={{ x: ['-120%', '220%'] }}
        transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 2.4, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: '40%',
          background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.55), transparent)',
          mixBlendMode: 'overlay', pointerEvents: 'none',
        }} />
    </span>
  );
}

// ── Letter rank from a score fraction ─────────────────────────────────────────
export function rankFor(pct) {
  if (pct >= 0.99) return { letter: 'S', color: '#FFD75E', label: 'Summit Conquered' };
  if (pct >= 0.8) return { letter: 'A', color: GOLD, label: 'Masterful Climb' };
  if (pct >= 0.65) return { letter: 'B', color: '#52B788', label: 'Strong Ascent' };
  if (pct >= 0.45) return { letter: 'C', color: '#7BA8C9', label: 'Steady Progress' };
  return { letter: 'D', color: '#E85D4A', label: 'Base Camp' };
}

// ── Rank medallion stamp ──────────────────────────────────────────────────────
export function RankStamp({ pct, size = 110 }) {
  const r = rankFor(pct);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', position: 'relative',
      background: `radial-gradient(circle at 32% 28%, ${r.color}30, rgba(10,14,20,0.9) 72%)`,
      border: `3px solid ${r.color}`,
      boxShadow: `0 0 36px ${r.color}50, inset 0 0 22px ${r.color}25`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        position: 'absolute', inset: 6, borderRadius: '50%',
        border: `1px solid ${r.color}60`,
      }} />
      <span style={{
        fontFamily: 'Cinzel, serif', fontSize: size * 0.46, fontWeight: 900, color: r.color,
        textShadow: `0 0 22px ${r.color}90`, lineHeight: 1,
      }}>{r.letter}</span>
    </div>
  );
}

// ── Rotating god-ray burst (place behind reveals) ─────────────────────────────
export function RayBurst({ color = GOLD, size = 560, opacity = 0.5 }) {
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <motion.svg aria-hidden viewBox="-100 -100 200 200" width={size} height={size}
      animate={{ rotate: 360 }}
      transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -size / 2, marginLeft: -size / 2, pointerEvents: 'none' }}>
      {rays.map((deg) => (
        <polygon key={deg} points="0,0 -7,-100 7,-100"
          fill={color} opacity={opacity * 0.16}
          transform={`rotate(${deg})`} />
      ))}
    </motion.svg>
  );
}

// ── Mouse parallax hook — returns {x, y} in [-1, 1] ──────────────────────────
export function useParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (window.matchMedia?.('(pointer: coarse)').matches) return;
    const onMove = (e) => setOffset({
      x: (e.clientX / window.innerWidth) * 2 - 1,
      y: (e.clientY / window.innerHeight) * 2 - 1,
    });
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);
  return offset;
}

// ── Glossy AAA button ─────────────────────────────────────────────────────────
export function GlossButton({ children, accent = GOLD, dark = '#1C1208', style = {}, disabled, ...rest }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.035, boxShadow: `0 0 30px ${accent}55, 0 8px 22px rgba(0,0,0,0.5)` }}
      whileTap={disabled ? {} : { scale: 0.965 }}
      disabled={disabled}
      {...rest}
      style={{
        position: 'relative', overflow: 'hidden',
        background: `linear-gradient(180deg, ${accent} 0%, ${accent} 45%, #C8851A 100%)`,
        border: `1px solid ${GOLD_LIGHT}55`,
        borderRadius: 12, padding: '13px 26px',
        color: dark, fontWeight: 900, fontSize: 14, fontFamily: 'Nunito, sans-serif',
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
        boxShadow: `0 6px 22px ${accent}40, inset 0 1px 0 rgba(255,255,255,0.5)`,
        ...style,
      }}>
      {children}
    </motion.button>
  );
}
