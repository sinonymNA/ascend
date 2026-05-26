import React from 'react';
import { motion } from 'framer-motion';

/**
 * Vertical progress bar for a student's own elevation.
 *
 * Props:
 *   elevation     — 0-100
 *   masteredCount — number of questions mastered
 *   totalCount    — total questions in set
 */

const ZONES = [
  { label: 'Peak',            min: 90,  max: 100, color: '#e8f4f8' },
  { label: 'Summit Approach', min: 75,  max: 90,  color: '#a0b4c4' },
  { label: 'Alpine',          min: 50,  max: 75,  color: '#4a5568' },
  { label: 'Trail',           min: 25,  max: 50,  color: '#2d6a4f' },
  { label: 'Base Camp',       min: 0,   max: 25,  color: '#1a3d2e' },
];

function getZoneForElevation(elevation) {
  for (const z of ZONES) {
    if (elevation >= z.min && elevation <= z.max) return z;
  }
  return ZONES[ZONES.length - 1];
}

export default function ElevationBar({
  elevation = 0,
  masteredCount = 0,
  totalCount = 0,
}) {
  const zone = getZoneForElevation(elevation);
  const clampedElevation = Math.max(0, Math.min(100, elevation));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        userSelect: 'none',
      }}
    >
      {/* Elevation % */}
      <div style={{ textAlign: 'center' }}>
        <div
          className="cinzel"
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--gold)',
            lineHeight: 1,
          }}
        >
          {clampedElevation}%
        </div>
        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            marginTop: '3px',
            fontFamily: 'Nunito, sans-serif',
          }}
        >
          {masteredCount}/{totalCount} mastered
        </div>
      </div>

      {/* Vertical bar container */}
      <div
        style={{
          position: 'relative',
          width: '36px',
          height: '220px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
        }}
      >
        {/* Zone segments (stacked, top to bottom = high to low elevation) */}
        {[...ZONES].map((z) => {
          const segHeight = ((z.max - z.min) / 100) * 220;
          return (
            <div
              key={z.label}
              title={z.label}
              style={{
                width: '100%',
                height: `${segHeight}px`,
                background: z.color,
                opacity: 0.35,
                borderRadius:
                  z.min === 90 ? '8px 8px 0 0'
                  : z.min === 0  ? '0 0 8px 8px'
                  : '0',
              }}
            />
          );
        })}

        {/* Filled progress overlay */}
        <motion.div
          initial={{ height: '0%' }}
          animate={{ height: `${clampedElevation}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(to top, var(--pine-light), ${zone.color})`,
            borderRadius: '0 0 8px 8px',
            opacity: 0.75,
          }}
        />

        {/* Gold indicator line */}
        <motion.div
          initial={{ bottom: '0%' }}
          animate={{ bottom: `${clampedElevation}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          style={{
            position: 'absolute',
            left: '-8px',
            right: '-8px',
            height: '3px',
            background: 'var(--gold)',
            borderRadius: '2px',
            boxShadow: 'var(--shadow-gold)',
          }}
        />

        {/* Zone divider ticks */}
        {ZONES.slice(0, -1).map((z) => {
          const bottomPct = `${z.min}%`;
          return (
            <div
              key={`tick-${z.min}`}
              style={{
                position: 'absolute',
                bottom: bottomPct,
                left: '-4px',
                right: '-4px',
                height: '1px',
                background: 'rgba(240,237,230,0.15)',
              }}
            />
          );
        })}

        {/* Zone labels (right side) */}
        {ZONES.map((z) => {
          const midPct = (z.min + z.max) / 2;
          return (
            <div
              key={`label-${z.label}`}
              style={{
                position: 'absolute',
                bottom: `${midPct}%`,
                left: '44px',
                transform: 'translateY(50%)',
                fontSize: '10px',
                color:
                  elevation >= z.min && elevation <= z.max
                    ? 'var(--text-mid)'
                    : 'var(--text-muted)',
                fontFamily: 'Nunito, sans-serif',
                fontWeight: elevation >= z.min && elevation <= z.max ? 700 : 400,
                whiteSpace: 'nowrap',
              }}
            >
              {z.label}
            </div>
          );
        })}
      </div>

      {/* Current zone badge */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'Nunito, sans-serif',
          color: zone.color,
          background: 'rgba(0,0,0,0.25)',
          border: `1px solid ${zone.color}44`,
          borderRadius: '20px',
          padding: '3px 10px',
        }}
      >
        {zone.label}
      </div>
    </div>
  );
}
