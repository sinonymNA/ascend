'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { GW, DECODE_COLORS } from '../../lib/guidedWalkTheme.js';

// ── Shared Guided Walk UI kit — used by the SAQ, LEQ, and DBQ walks ──────────

// Renders text with color-coded <mark> highlights for decoded prompt elements.
// Elements not found as substrings are silently skipped (never crashes).
export function HighlightedText({ text, elements, revealed }) {
  if (!text) return null;
  const marks = [];
  for (const key of revealed) {
    const val = elements?.[key];
    if (!val) continue;
    const idx = text.indexOf(val);
    if (idx === -1) continue;
    marks.push({ start: idx, end: idx + val.length, key });
  }
  marks.sort((a, b) => a.start - b.start);
  const clean = [];
  let lastEnd = 0;
  for (const m of marks) {
    if (m.start < lastEnd) continue;
    clean.push(m);
    lastEnd = m.end;
  }
  const segments = [];
  let cursor = 0;
  for (const m of clean) {
    if (m.start > cursor) segments.push({ text: text.slice(cursor, m.start) });
    segments.push({ text: text.slice(m.start, m.end), key: m.key });
    cursor = m.end;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor) });

  return (
    <>
      {segments.map((seg, i) => seg.key ? (
        <motion.mark key={i}
          initial={{ backgroundColor: 'rgba(0,0,0,0)' }}
          animate={{ backgroundColor: `${DECODE_COLORS[seg.key]}55` }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ borderRadius: 3, padding: '0 2px', color: GW.ink, fontWeight: 700 }}
        >{seg.text}</motion.mark>
      ) : <React.Fragment key={i}>{seg.text}</React.Fragment>)}
    </>
  );
}

// Ink-dot progress bar. `phases` is the ordered list of phase names for this walk;
// the server may report 'complete' once graded — treated as `completePhase`.
export function ProgressDots({ phases, phase, completePhase = 'rubric' }) {
  const idx = phases.indexOf(phase === 'complete' ? completePhase : phase);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {phases.map((p, i) => (
        <div key={p} style={{
          width: i === idx ? 18 : 7, height: 7, borderRadius: 4,
          background: i <= idx ? GW.amber : `${GW.ink}22`,
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

export function TopBar({ title, phases, phase, onBack, completePhase }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 40,
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
      }}>{title}</div>
      <ProgressDots phases={phases} phase={phase} completePhase={completePhase} />
    </div>
  );
}

export function PreviewBanner() {
  return (
    <div style={{
      background: GW.charcoal, color: GW.parchment, textAlign: 'center',
      padding: '8px 14px', fontSize: 12.5, fontWeight: 800, letterSpacing: '0.04em',
      fontFamily: 'Nunito, sans-serif',
    }}>
      👁 TEACHER PREVIEW — this is what students see. Submissions are disabled.
    </div>
  );
}

export function GwButton({ children, onClick, disabled, variant = 'primary', style = {} }) {
  const variants = {
    primary: { background: GW.amber, color: GW.parchment, border: 'none' },
    secondary: { background: 'transparent', color: GW.ink, border: `1.5px solid ${GW.ink}40` },
  };
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick} disabled={disabled}
      style={{
        ...variants[variant],
        borderRadius: 12, padding: '13px 28px', fontSize: 14.5, fontWeight: 800,
        fontFamily: 'Nunito, sans-serif', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, letterSpacing: '0.02em',
        ...style,
      }}>
      {children}
    </motion.button>
  );
}

// One-focus-object-at-a-time shell — fade + 8px float reveal (respects reduced motion).
export function PhaseShell({ children, maxWidth = 640, reduceMotion }) {
  const variants = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -8 } };
  return (
    <motion.div
      variants={variants} initial="initial" animate="animate" exit="exit"
      transition={{ duration: 0.35, ease: 'easeInOut' }}
      style={{ maxWidth, margin: '0 auto', padding: '40px 20px 120px', display: 'flex', flexDirection: 'column', gap: 20 }}
    >{children}</motion.div>
  );
}
