import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SoundService from '../../lib/sound.js';
import Icon from '../ui/Icon.jsx';

export default function AchievementToast({ achievements = [], onDismiss }) {
  const first = achievements[0];

  useEffect(() => {
    if (first) {
      SoundService.play('achievement');
      const t = setTimeout(onDismiss, 4000);
      return () => clearTimeout(t);
    }
  }, [first, onDismiss]);

  return (
    <AnimatePresence>
      {first && (
        <motion.div
          key={first.key}
          initial={{ opacity: 0, y: 80, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 8000,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-gold)',
            borderRadius: '16px',
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            maxWidth: '320px',
            boxShadow: 'var(--shadow-gold)',
            cursor: 'pointer',
          }}
          onClick={onDismiss}
        >
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
            <Icon name="trophy" size={32} color="#F5A623" fill="rgba(245,166,35,0.25)" />
          </div>
          <div>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--gold)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '3px',
            }}>
              Achievement Unlocked
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              color: 'var(--text)',
            }}>
              {first.label}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
