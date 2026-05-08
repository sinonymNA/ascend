import { motion } from 'framer-motion';

export default function BossHealthBar({ bossHp, playerHp, bossName }) {
  const bossColor = bossHp > 50 ? 'var(--coral)' : bossHp > 25 ? '#FF7043' : '#FF1744';
  const playerColor = playerHp > 50 ? 'var(--green)' : playerHp > 25 ? '#FFC107' : 'var(--coral)';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Boss HP */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--coral)', fontWeight: 700 }}>
            ☠ {bossName}
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{bossHp} HP</span>
        </div>
        <div style={{
          height: 12, background: 'var(--bg-mid)', borderRadius: 6,
          overflow: 'hidden', border: '1px solid rgba(232,68,90,0.3)',
        }}>
          <motion.div
            style={{ height: '100%', background: bossColor, borderRadius: 6 }}
            animate={{ width: `${bossHp}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Player HP */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
            ⚔ You
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{playerHp} HP</span>
        </div>
        <div style={{
          height: 12, background: 'var(--bg-mid)', borderRadius: 6,
          overflow: 'hidden', border: '1px solid rgba(46,204,113,0.3)',
        }}>
          <motion.div
            style={{ height: '100%', background: playerColor, borderRadius: 6 }}
            animate={{ width: `${playerHp}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  );
}
