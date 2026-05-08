import { motion } from 'framer-motion';

export default function PathNode({
  level, zoneColor, completed, locked, isBoss, isActive, onClick,
}) {
  const bg = locked ? 'var(--bg-mid)' : completed ? zoneColor : 'var(--card)';
  const border = locked ? 'var(--border)' : completed ? zoneColor : zoneColor + '88';
  const textColor = locked ? 'var(--text-dim)' : 'var(--text)';
  const icon = isBoss ? '💀' : completed ? '✓' : locked ? '🔒' : '⚔';

  return (
    <motion.button
      onClick={onClick}
      disabled={locked}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        background: bg, border: `2px solid ${border}`,
        borderRadius: 16, padding: '14px 16px',
        cursor: locked ? 'default' : 'pointer',
        textAlign: 'left', opacity: locked ? 0.5 : 1,
        boxShadow: isActive ? `0 0 20px ${zoneColor}44` : 'none',
      }}
      whileHover={!locked ? { scale: 1.02, x: 4 } : {}}
      whileTap={!locked ? { scale: 0.98 } : {}}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: completed ? zoneColor : 'var(--bg-mid)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, flexShrink: 0,
        border: `1px solid ${border}`,
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: textColor }}>
          {isBoss ? `Boss: ${level.name || 'Final Boss'}` : level.name}
        </div>
        {level.skillTag && (
          <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2 }}>
            {level.skillTag}
          </div>
        )}
      </div>
      {completed && (
        <div style={{ fontSize: 12, color: zoneColor, fontWeight: 700 }}>DONE</div>
      )}
      {isActive && !completed && !locked && (
        <motion.div
          style={{
            width: 8, height: 8, borderRadius: '50%',
            background: zoneColor,
          }}
          animate={{ scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}
    </motion.button>
  );
}
