import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, color = 'var(--blue-light)', label }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div style={{ width: '100%' }}>
      {label && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--text-mid)' }}>{label}</span>
          <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>{current}/{total}</span>
        </div>
      )}
      <div style={{
        height: 8, background: 'var(--bg-mid)',
        borderRadius: 4, overflow: 'hidden',
        border: '1px solid var(--border)',
      }}>
        <motion.div
          style={{ height: '100%', background: color, borderRadius: 4 }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
