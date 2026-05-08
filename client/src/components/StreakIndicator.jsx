import { motion, AnimatePresence } from 'framer-motion';

export default function StreakIndicator({ streak }) {
  if (streak < 2) return null;

  const color = streak >= 5 ? 'var(--gold)' : streak >= 3 ? '#FF7043' : 'var(--coral)';
  const label = streak >= 5 ? '🔥 ON FIRE!' : streak >= 3 ? '⚡ STREAK!' : `${streak}x`;

  return (
    <AnimatePresence>
      <motion.div
        key={streak}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: `rgba(${streak >= 5 ? '255,184,48' : '232,68,90'},0.15)`,
          border: `1px solid ${color}`,
          borderRadius: 20, padding: '4px 12px',
          color, fontWeight: 800, fontSize: 13,
        }}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        {label}
      </motion.div>
    </AnimatePresence>
  );
}
