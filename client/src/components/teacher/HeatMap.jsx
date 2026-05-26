import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Question heat map for teacher view.
 *
 * Props:
 *   questions — array of { id, text, difficulty? }
 *   attempts  — object map: { [questionId]: { correct: number, total: number } }
 */
export default function HeatMap({ questions = [], attempts = {} }) {
  const rows = useMemo(() => {
    return questions
      .map((q) => {
        const stats = attempts[q.id] || { correct: 0, total: 0 };
        const pct = stats.total > 0 ? stats.correct / stats.total : null;
        return { ...q, ...stats, pct };
      })
      // Sort: null (no data) last, then hardest (lowest pct) first
      .sort((a, b) => {
        if (a.pct === null && b.pct === null) return 0;
        if (a.pct === null) return 1;
        if (b.pct === null) return -1;
        return a.pct - b.pct;
      });
  }, [questions, attempts]);

  if (rows.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
        No questions to display.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {rows.map((row, i) => (
        <HeatRow key={row.id} row={row} index={i} />
      ))}
    </div>
  );
}

function getBarColor(pct) {
  if (pct === null) return '#4a5568';         // no data → rock
  if (pct > 0.70)  return '#52B788';          // green — mostly mastered
  if (pct > 0.40)  return '#F5A623';          // yellow — some struggling
  return '#E85D4A';                            // red — most struggling
}

function getDifficultyLabel(pct) {
  if (pct === null)  return { label: 'No data', color: 'var(--text-muted)' };
  if (pct > 0.70)   return { label: 'Mostly mastered', color: '#52B788' };
  if (pct > 0.40)   return { label: 'Some struggling',  color: '#F5A623' };
  return                  { label: 'Most struggling',   color: '#E85D4A' };
}

function HeatRow({ row, index }) {
  const barColor  = getBarColor(row.pct);
  const pctFill   = row.pct !== null ? row.pct * 100 : 0;
  const { label, color: labelColor } = getDifficultyLabel(row.pct);
  const shortText = row.text
    ? (row.text.length > 72 ? row.text.slice(0, 70) + '…' : row.text)
    : `Question ${index + 1}`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.24 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Top row: question text + stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-mid)',
          lineHeight: '1.45',
          fontFamily: 'Nunito, sans-serif',
          flex: 1,
        }}>
          {shortText}
        </p>
        <div style={{ flexShrink: 0, textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: labelColor }}>
            {row.pct !== null ? `${Math.round(row.pct * 100)}%` : '—'}
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {row.total > 0 ? `${row.correct}/${row.total}` : 'No attempts'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '6px',
        background: 'var(--bg-mid)',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${pctFill}%` }}
          transition={{ duration: 0.55, ease: 'easeOut', delay: index * 0.04 + 0.1 }}
          style={{
            height: '100%',
            background: barColor,
            borderRadius: '3px',
          }}
        />
      </div>

      {/* Status label */}
      <div style={{ fontSize: '11px', color: labelColor, fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
        {label}
      </div>
    </motion.div>
  );
}
