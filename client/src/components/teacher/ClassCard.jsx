import React from 'react';
import { motion } from 'framer-motion';

/**
 * ClassCard
 * Props: { name, subject, studentCount, lastActivity, classCode, onClick }
 */
export default function ClassCard({ name, subject, studentCount = 0, lastActivity, classCode, onClick }) {
  const subjectColors = {
    'AP World History': { bg: 'rgba(45,106,79,0.25)', text: '#52B788' },
    'APUSH':            { bg: 'rgba(45,107,138,0.25)', text: '#5BB8D4' },
    'AP Gov':           { bg: 'rgba(107,78,138,0.25)', text: '#A57DD8' },
    'AP Human Geo':     { bg: 'rgba(138,107,45,0.25)', text: '#D4A55B' },
    'Other':            { bg: 'rgba(74,85,104,0.25)', text: '#9BB0C4' },
  };
  const color = subjectColors[subject] || subjectColors['Other'];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'No activity yet';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ borderColor: 'rgba(245,166,35,0.4)', boxShadow: '0 0 28px rgba(245,166,35,0.15)', y: -2 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.18 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: '17px', fontWeight: 700, color: 'var(--text)', margin: 0, marginBottom: '6px' }}>
            {name}
          </h3>
          <span style={{
            display: 'inline-block',
            background: color.bg,
            color: color.text,
            fontSize: '12px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            letterSpacing: '0.02em',
          }}>
            {subject || 'No Subject'}
          </span>
        </div>
        {/* Mountain mini-icon */}
        <svg width="32" height="22" viewBox="0 0 32 22" fill="none" style={{ opacity: 0.3, flexShrink: 0 }}>
          <polygon points="16,2 30,20 2,20" fill="var(--text-mid)" />
          <polygon points="16,2 22,10 10,10" fill="var(--snow)" />
        </svg>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text)', fontFamily: 'Nunito, sans-serif' }}>{studentCount}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Students</span>
        </div>
        <div style={{ width: '1px', background: 'var(--border)', alignSelf: 'stretch' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-mid)' }}>{formatDate(lastActivity)}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Last Activity</span>
        </div>
      </div>

      {/* Class code */}
      {classCode && (
        <div style={{
          background: 'rgba(245,166,35,0.08)',
          border: '1px solid var(--border-gold)',
          borderRadius: '10px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Class Code</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em' }}>
            {classCode}
          </span>
        </div>
      )}
    </motion.div>
  );
}
