import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SoundService from '../../lib/sound.js';
import Icon from '../ui/Icon.jsx';

const UNLOCKS = {
  3:  'New climber silhouette unlocked',
  5:  'Gold Sparkle trail effect unlocked',
  7:  'Streak Shield earned',
  8:  'Banner flag design unlocked',
  10: 'Fire trail effect unlocked',
  12: 'New climber silhouette unlocked',
  15: 'Rainbow trail effect unlocked',
  20: 'Summit Cross flag unlocked',
};

export default function LevelUp({ show, level, onDone }) {
  useEffect(() => {
    if (show) {
      SoundService.play('level-up');
      const t = setTimeout(onDone, 3200);
      return () => clearTimeout(t);
    }
  }, [show, onDone]);

  const unlock = UNLOCKS[level];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="levelup"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(15,23,32,0.92)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={onDone}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
            style={{ textAlign: 'center', padding: '40px 32px' }}
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 8, 0] }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Icon name="mountain" size={72} color="var(--gold)" />
            </motion.div>

            <div style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(14px, 3vw, 18px)',
              color: 'var(--text-muted)',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              Level Up
            </div>

            <motion.div
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200, damping: 16 }}
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(56px, 12vw, 96px)',
                fontWeight: 700,
                lineHeight: 1,
                background: 'linear-gradient(135deg, #F5A623, #C8851A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '20px',
              }}
            >
              {level}
            </motion.div>

            {unlock && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  background: 'rgba(245,166,35,0.12)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                }}
              >
                <Icon name="gift" size={16} color="var(--gold)" />
                <span>{unlock}</span>
              </motion.div>
            )}

            <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Tap anywhere to continue
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
