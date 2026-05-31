import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Optimistic per-answer coin float — cosmetic only.
export default function CoinFloat({ amount, triggerKey, x = '50%', y = '62%' }) {
  return (
    <AnimatePresence>
      {amount > 0 && (
        <motion.div
          key={triggerKey}
          initial={{ opacity: 0, y: 0, scale: 0.8 }}
          animate={{ opacity: 1, y: -42, scale: 1.15 }}
          exit={{ opacity: 0, y: -64 }}
          transition={{ duration: 1.0, ease: 'easeOut' }}
          style={{
            position: 'absolute', left: x, top: y, transform: 'translateX(-50%)',
            pointerEvents: 'none', zIndex: 60,
            fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: 700,
            color: '#F5A623', textShadow: '0 2px 8px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          🪙 +{amount}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
