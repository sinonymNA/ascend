import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GameCode — displays the game join code prominently.
 *
 * Props:
 *   code — string (e.g. 'ABC123')
 */
export default function GameCode({ code = '' }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-gold)',
        borderRadius: '20px',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        boxShadow: 'var(--shadow-gold)',
      }}
    >
      {/* Label */}
      <div
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        Join Code
      </div>

      {/* Code display */}
      <div
        className="cinzel"
        style={{
          fontSize: 'clamp(32px, 6vw, 52px)',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.22em',
          lineHeight: 1,
          background: 'linear-gradient(135deg, #F5A623, #C8851A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {code || '———'}
      </div>

      {/* Copy button */}
      <motion.button
        onClick={handleCopy}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: copied ? 'var(--pine-soft)' : 'rgba(245,166,35,0.10)',
          border: `1px solid ${copied ? 'rgba(82,183,136,0.35)' : 'var(--border-gold)'}`,
          borderRadius: '12px',
          padding: '9px 20px',
          cursor: 'pointer',
          color: copied ? 'var(--pine-light)' : 'var(--gold)',
          fontFamily: 'Nunito, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
        }}
      >
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              ✓ Copied!
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <ClipboardIcon />
              Copy Code
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Join URL hint */}
      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          fontFamily: 'Nunito, sans-serif',
          textAlign: 'center',
        }}
      >
        Students go to <strong style={{ color: 'var(--text-mid)' }}>summit.app/join</strong> and enter this code
      </div>
    </div>
  );
}

function ClipboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
