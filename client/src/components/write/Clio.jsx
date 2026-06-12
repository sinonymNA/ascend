'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { GW } from '../../lib/guidedWalkTheme.js';

// ── Clio, Muse of History ──────────────────────────────────────────────────
// A small scholar-owl avatar that lives in the bottom-left corner of the
// Guided Walk and narrates each phase through a parchment speech bubble.
// states: 'idle' | 'speaking' | 'celebrating'

function ClioAvatar({ state, reduceMotion }) {
  const idleAnim = reduceMotion ? {} : {
    y: [0, -3, 0],
    rotate: [0, -1.5, 0, 1.5, 0],
  };
  const idleTransition = { duration: 4, repeat: Infinity, ease: 'easeInOut' };

  const celebrateAnim = reduceMotion ? {} : { scale: [1, 1.05, 1] };
  const celebrateTransition = { duration: 0.6, repeat: Infinity, repeatDelay: 0.4, ease: 'easeInOut' };

  const anim = state === 'celebrating' ? celebrateAnim : idleAnim;
  const transition = state === 'celebrating' ? celebrateTransition : idleTransition;

  return (
    <motion.div animate={anim} transition={transition} style={{ position: 'relative', width: 76, height: 76 }}>
      <svg viewBox="0 0 76 76" width="76" height="76" aria-hidden>
        {/* body */}
        <ellipse cx="38" cy="44" rx="26" ry="24" fill={GW.amber} />
        <ellipse cx="38" cy="48" rx="18" ry="16" fill={GW.parchment} />
        {/* wings */}
        <ellipse cx="16" cy="46" rx="8" ry="14" fill={GW.charcoal} opacity="0.85" />
        <ellipse cx="60" cy="46" rx="8" ry="14" fill={GW.charcoal} opacity="0.85" />
        {/* head */}
        <circle cx="38" cy="26" r="20" fill={GW.amber} />
        {/* laurel / scholar cap accent */}
        <path d="M20 16 C26 6 50 6 56 16" stroke={GW.gold} strokeWidth="3" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="16" r="2.4" fill={GW.gold} />
        <circle cx="56" cy="16" r="2.4" fill={GW.gold} />
        {/* eyes */}
        <circle cx="29" cy="26" r="8" fill={GW.parchment} />
        <circle cx="47" cy="26" r="8" fill={GW.parchment} />
        <motion.g
          animate={reduceMotion ? {} : { scaleY: [1, 1, 0.1, 1, 1, 1, 1, 1] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.46, 0.5, 0.54, 0.6, 1, 1, 1] }}
          style={{ transformBox: 'fill-box', originX: 0.5, originY: 0.5 }}
        >
          <circle cx="29" cy="26" r="3.4" fill={GW.ink} />
          <circle cx="47" cy="26" r="3.4" fill={GW.ink} />
        </motion.g>
        {/* beak */}
        <path d="M35 33 L41 33 L38 39 Z" fill={GW.gold} />
        {/* book */}
        <g transform="translate(24 56)">
          <rect x="0" y="0" width="28" height="6" rx="1.5" fill={GW.charcoal} />
          <rect x="1" y="1" width="12" height="4" fill={GW.parchment} opacity="0.85" />
          <rect x="15" y="1" width="12" height="4" fill={GW.parchment} opacity="0.6" />
        </g>
      </svg>
      {state === 'celebrating' && !reduceMotion && (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span key={i}
              initial={{ opacity: 0, scale: 0, x: 38, y: 30 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0.6],
                x: 38 + Math.cos((i / 5) * Math.PI * 2) * 44,
                y: 30 + Math.sin((i / 5) * Math.PI * 2) * 44,
              }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.12, ease: 'easeOut' }}
              style={{ position: 'absolute', top: 0, left: 0, fontSize: 14, pointerEvents: 'none' }}>
              ✦
            </motion.span>
          ))}
        </>
      )}
    </motion.div>
  );
}

export default function Clio({ text, state = 'idle', style = {} }) {
  const reduceMotion = useReducedMotion();
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (text) setDisplayText(text);
  }, [text]);

  return (
    <div style={{
      position: 'fixed', bottom: 16, left: 16, zIndex: 60,
      display: 'flex', alignItems: 'flex-end', gap: 12,
      maxWidth: 'calc(100vw - 32px)', pointerEvents: 'none',
      ...style,
    }}>
      <div style={{ flexShrink: 0, pointerEvents: 'auto' }}>
        <ClioAvatar state={state} reduceMotion={reduceMotion} />
      </div>
      <AnimatePresence mode="wait">
        {displayText && (
          <motion.div
            key={displayText}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{
              pointerEvents: 'auto',
              background: GW.parchment,
              color: GW.ink,
              borderRadius: 16,
              padding: '12px 16px',
              maxWidth: 380,
              fontFamily: 'Nunito, sans-serif',
              fontStyle: 'italic',
              fontSize: 14.5,
              lineHeight: 1.55,
              boxShadow: '0 10px 28px rgba(0,0,0,0.35)',
              border: `1px solid ${GW.amber}55`,
              marginBottom: 14,
            }}
          >
            <span style={{ fontStyle: 'normal', fontWeight: 800, fontFamily: 'Cinzel, serif', color: GW.amber, marginRight: 6 }}>
              Clio
            </span>
            {displayText}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
