import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import { useEffect, useRef, useState } from 'react';

export default function CoinCounter() {
  const { coins } = useGame();
  const prevCoins = useRef(coins);
  const [showGain, setShowGain] = useState(null);

  useEffect(() => {
    const diff = coins - prevCoins.current;
    if (diff > 0) {
      setShowGain(`+${diff}`);
      const t = setTimeout(() => setShowGain(null), 1500);
      prevCoins.current = coins;
      return () => clearTimeout(t);
    }
    prevCoins.current = coins;
  }, [coins]);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 18 }}>🪙</span>
      <motion.span
        key={coins}
        style={{ fontSize: 15, fontWeight: 800, color: 'var(--gold)' }}
        initial={{ scale: 1.3 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {coins.toLocaleString()}
      </motion.span>
      <AnimatePresence>
        {showGain && (
          <motion.span
            key={showGain + Date.now()}
            style={{
              position: 'absolute', top: -20, right: 0,
              fontSize: 13, fontWeight: 800, color: 'var(--gold)',
              pointerEvents: 'none',
            }}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -16 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
          >
            {showGain}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
