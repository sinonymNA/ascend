import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const CLASS_COLORS = {
  warrior: '#E8445A',
  scholar: '#5B9CF6',
  rogue:   '#7B4FE9',
};

const CLASS_EMOJIS = {
  warrior: '⚔️',
  scholar: '📚',
  rogue:   '🗡️',
};

export default function LevelUpModal({ show, level, character, onDismiss }) {
  const color = CLASS_COLORS[character?.class] || '#FFB830';
  const emoji = CLASS_EMOJIS[character?.class] || '⚔️';

  useEffect(() => {
    if (show) {
      const t = setTimeout(onDismiss, 2500);
      return () => clearTimeout(t);
    }
  }, [show, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onDismiss}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(10,10,20,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            cursor: 'pointer',
          }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 200 }}
            style={{ textAlign: 'center', pointerEvents: 'none' }}
          >
            <motion.div
              animate={{ boxShadow: [`0 0 0px ${color}`, `0 0 60px ${color}88`, `0 0 0px ${color}`] }}
              transition={{ duration: 1.2, repeat: 1 }}
              style={{
                width: 120, height: 120, borderRadius: '50%',
                background: `radial-gradient(circle at 35% 35%, ${color}, ${color}88)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 56, margin: '0 auto 20px',
              }}
            >
              {emoji}
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: 14, letterSpacing: 4,
                color: color, marginBottom: 8, fontWeight: 700,
              }}>
                LEVEL UP!
              </div>
              <div style={{
                fontSize: 72, fontWeight: 900,
                background: `linear-gradient(135deg, ${color}, #FFB830)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1, marginBottom: 12,
              }}>
                {level}
              </div>
              <div style={{ color: 'var(--text-mid)', fontSize: 16 }}>
                {character?.name || 'Hero'} grows stronger!
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
