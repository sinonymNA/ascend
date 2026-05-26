import { motion, AnimatePresence } from 'framer-motion';

/**
 * StreakIndicator — shows current correct-answer streak.
 *
 * Props:
 *   streak — number (0 = hidden)
 *
 * Bonus labels:
 *   ≥ 3  → "On Fire!"
 *   ≥ 5  → "Blazing!"
 *   ≥ 10 → "Unstoppable!"
 */

function getBonusLabel(streak) {
  if (streak >= 10) return 'Unstoppable!';
  if (streak >= 5)  return 'Blazing!';
  if (streak >= 3)  return 'On Fire!';
  return null;
}

export default function StreakIndicator({ streak = 0 }) {
  // Hidden when streak is 0
  if (streak === 0) return null;

  const bonusLabel = getBonusLabel(streak);

  const color = streak >= 10
    ? 'var(--gold)'
    : streak >= 5
    ? '#FF7043'
    : streak >= 3
    ? '#FF9966'
    : 'var(--text-mid)';

  const bg = streak >= 10
    ? 'rgba(245,166,35,0.15)'
    : streak >= 5
    ? 'rgba(255,112,67,0.15)'
    : streak >= 3
    ? 'rgba(255,153,102,0.12)'
    : 'rgba(168,184,200,0.10)';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={streak}
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{
          scale: [0.7, 1.15, 1],
          opacity: 1,
        }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 22 }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: bg,
          border: `1px solid ${color}44`,
          borderRadius: '20px',
          padding: '5px 14px',
          color,
          fontWeight: 800,
          fontSize: '14px',
          fontFamily: 'Nunito, sans-serif',
          whiteSpace: 'nowrap',
        }}
      >
        <span style={{ fontSize: '16px' }}>🔥</span>
        <span>{streak}</span>
        {bonusLabel && (
          <span style={{ fontSize: '12px', opacity: 0.85, fontWeight: 700 }}>
            {bonusLabel}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
