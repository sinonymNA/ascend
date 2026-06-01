import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../ui/Icon.jsx';

/**
 * Individual climber marker.
 * Positioned absolutely within a relative container.
 *
 * Props:
 *   elevation   — 0-100 (controls bottom offset %)
 *   color       — CSS color string
 *   name        — player name
 *   highlighted — bool
 *   summited    — bool
 */
export default function Climber({
  elevation = 0,
  color = '#52B788',
  name = '',
  highlighted = false,
  summited = false,
}) {
  // Map elevation to bottom % so 0 = bottom, 100 = top
  const bottomPct = Math.max(2, Math.min(96, elevation));

  return (
    <motion.div
      initial={false}
      animate={{ bottom: `${bottomPct}%` }}
      transition={{ type: 'spring', stiffness: 60, damping: 18 }}
      style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '3px',
        pointerEvents: 'none',
        zIndex: highlighted ? 10 : 5,
      }}
    >
      {/* Summited flag */}
      {summited && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{ lineHeight: 1, display: 'flex' }}
        >
          <Icon name="flag" size={14} color="#F5A623" />
        </motion.div>
      )}

      {/* Name label */}
      {name && (
        <span
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontWeight: 700,
            fontSize: highlighted ? '11px' : '10px',
            color: highlighted ? 'var(--gold)' : 'rgba(240,237,230,0.8)',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
          }}
        >
          {name.length > 10 ? name.slice(0, 9) + '…' : name}
        </span>
      )}

      {/* Climber body */}
      <motion.div
        animate={
          highlighted
            ? { boxShadow: ['0 0 0 0 rgba(245,166,35,0.5)', '0 0 0 8px rgba(245,166,35,0)', '0 0 0 0 rgba(245,166,35,0.5)'] }
            : {}
        }
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{
          width:        highlighted ? '24px' : '18px',
          height:       highlighted ? '24px' : '18px',
          borderRadius: '50%',
          background:   color,
          border:       highlighted
            ? '2.5px solid #F5A623'
            : '1.5px solid rgba(240,237,230,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: highlighted ? '11px' : '9px',
        }}
      >
        {/* Mini hiker icon */}
        <svg
          width={highlighted ? 12 : 9}
          height={highlighted ? 12 : 9}
          viewBox="0 0 24 24"
          fill="none"
        >
          {/* Simplified hiker: circle head + body line + arms */}
          <circle cx="12" cy="5" r="3" fill="rgba(255,255,255,0.9)" />
          <line x1="12" y1="8" x2="12" y2="18" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="7"  y1="13" x2="17" y2="13" stroke="rgba(255,255,255,0.9)" strokeWidth="2"   strokeLinecap="round" />
          <line x1="12" y1="18" x2="8"  y2="24" stroke="rgba(255,255,255,0.9)" strokeWidth="2"   strokeLinecap="round" />
          <line x1="12" y1="18" x2="16" y2="24" stroke="rgba(255,255,255,0.9)" strokeWidth="2"   strokeLinecap="round" />
        </svg>
      </motion.div>
    </motion.div>
  );
}
