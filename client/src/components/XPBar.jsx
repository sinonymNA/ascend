import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';

export default function XPBar({ compact = false }) {
  const { xp, xpToNextLevel, xpPercent, playerLevel } = useGame();

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 700 }}>
          Lv {playerLevel}
        </span>
        <div style={{
          flex: 1, height: 6, background: 'var(--bg-mid)',
          borderRadius: 3, overflow: 'hidden', minWidth: 60,
        }}>
          <motion.div
            style={{ height: '100%', background: 'var(--gold)', borderRadius: 3 }}
            initial={false}
            animate={{ width: `${xpPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
          {xp}/{xpToNextLevel}
        </span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700 }}>
          Level {playerLevel}
        </span>
        <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
          {xp} / {xpToNextLevel} XP
        </span>
      </div>
      <div style={{
        height: 10, background: 'var(--bg-mid)',
        borderRadius: 5, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <motion.div
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, var(--gold), #FF9500)',
            borderRadius: 5,
            boxShadow: '0 0 8px rgba(255,184,48,0.5)',
          }}
          initial={false}
          animate={{ width: `${xpPercent}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
