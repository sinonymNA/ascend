import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * SVG mountain component.
 *
 * Props:
 *   players     — array of { id, name, elevation (0-100), color }
 *   highlightId — id of player to highlight (larger circle, gold stroke)
 *   showLabels  — bool
 *   interactive — bool (hover tooltips)
 */

// ─── Mountain geometry ────────────────────────────────────────────────────────
// The mountain is a natural-ish triangle with slight curved sides, fitting
// in a 400×500 viewBox.  The slope goes from the base (y=440) up to the
// peak (200, 40).  Left slope and right slope are defined as cubic bezier
// segments so we can parameterise position along the outline.

const PEAK     = { x: 200, y: 40  };
const BASE_L   = { x: 30,  y: 440 };
const BASE_R   = { x: 370, y: 440 };

// We'll use the *left* slope as the canonical path for players.
// elevationToSVGPosition(0)   → near base-left / base centre
// elevationToSVGPosition(100) → peak

// For simplicity players are distributed along the central axis of the
// mountain (x = 200 moving slightly left or right based on index to avoid
// overlap), and y is linearly interpolated from base to peak.

function elevationToSVGPosition(elevation) {
  const t = Math.max(0, Math.min(1, elevation / 100));
  // y: from 430 (base) to 55 (near peak)
  const y = 430 - t * (430 - 55);
  // x: stays near centre – slight natural sway
  const x = 200;
  return { x, y };
}

// Zone band definitions (elevation %)
const ZONES = [
  { label: 'Base Camp',       min: 0,  max: 25, fill: '#1a3d2e',            textY: 420 },
  { label: 'Trail',           min: 25, max: 50, fill: '#243040',            textY: 330 },
  { label: 'Alpine',          min: 50, max: 75, fill: '#2d3748',            textY: 240 },
  { label: 'Summit Approach', min: 75, max: 90, fill: '#4a5568',            textY: 165 },
  { label: 'Peak',            min: 90, max: 100, fill: '#c8d8e8',           textY: 90  },
];

// Clip path for each zone band (horizontal slices of the triangle)
function zoneBandPath(yTop, yBottom) {
  // Left-edge x at a given y on the left slope: x = 30 + (200-30)*(440-y)/(440-40)*...
  // We parameterise by t = (440 - y) / (440 - 40)
  function leftX(y) {
    const t = (440 - y) / 400;
    return BASE_L.x + t * (PEAK.x - BASE_L.x);
  }
  function rightX(y) {
    const t = (440 - y) / 400;
    return BASE_R.x + t * (PEAK.x - BASE_R.x);
  }
  const lTop   = leftX(yTop);
  const rTop   = rightX(yTop);
  const lBot   = leftX(yBottom);
  const rBot   = rightX(yBottom);
  return `M ${lTop},${yTop} L ${rTop},${yTop} L ${rBot},${yBottom} L ${lBot},${yBottom} Z`;
}

function elevToY(elevation) {
  return 440 - (elevation / 100) * (440 - 40);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Mountain({
  players = [],
  highlightId = null,
  showLabels = true,
  interactive = false,
}) {
  const hasSummited = players.some((p) => p.elevation >= 90);

  // Spread players horizontally to reduce overlap
  const playerPositions = useMemo(() => {
    // Sort by elevation so lower players are drawn first
    const sorted = [...players].sort((a, b) => a.elevation - b.elevation);
    return sorted.map((player, i) => {
      const pos = elevationToSVGPosition(player.elevation);
      // Offset by index so nearby players don't stack
      const offset = ((i % 5) - 2) * 14;
      return { ...player, svgX: pos.x + offset, svgY: pos.y };
    });
  }, [players]);

  return (
    <svg
      viewBox="0 0 400 500"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
      aria-label="Mountain progress view"
    >
      <defs>
        {/* Sky gradient */}
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#0b1526" />
          <stop offset="60%"  stopColor="#1a2d4a" />
          <stop offset="100%" stopColor="#1e3a5a" />
        </linearGradient>

        {/* Snow gradient for peak zone */}
        <linearGradient id="snowGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%"   stopColor="#aac4d4" />
          <stop offset="100%" stopColor="#e8f4f8" />
        </linearGradient>

        {/* Clip path for mountain silhouette */}
        <clipPath id="mountainClip">
          <path d={`M ${PEAK.x},${PEAK.y} L ${BASE_R.x},${BASE_R.y} L ${BASE_L.x},${BASE_L.y} Z`} />
        </clipPath>

        {/* Gold glow filter */}
        <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
          <feColorMatrix in="blur" type="matrix"
            values="1 0.7 0 0 0   0.5 0.3 0 0 0   0 0 0 0 0   0 0 0 1 0"
            result="goldBlur" />
          <feMerge>
            <feMergeNode in="goldBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Sky background */}
      <rect x="0" y="0" width="400" height="500" fill="url(#skyGrad)" />

      {/* Stars (simple fixed dots) */}
      {STAR_POSITIONS.map((s, i) => (
        <circle key={i} cx={s[0]} cy={s[1]} r={s[2]} fill="white" opacity={s[3]} />
      ))}

      {/* Zone fills (clipped to mountain triangle) */}
      <g clipPath="url(#mountainClip)">
        {ZONES.map((zone) => {
          const yTop    = elevToY(zone.max);
          const yBottom = elevToY(zone.min);
          const fillColor = zone.min >= 90 ? 'url(#snowGrad)' : zone.fill;
          return (
            <path
              key={zone.label}
              d={zoneBandPath(yTop, yBottom)}
              fill={fillColor}
            />
          );
        })}
      </g>

      {/* Mountain outline */}
      <path
        d={`M ${PEAK.x},${PEAK.y} L ${BASE_R.x},${BASE_R.y} L ${BASE_L.x},${BASE_L.y} Z`}
        fill="none"
        stroke="rgba(240,237,230,0.12)"
        strokeWidth="1.5"
      />

      {/* Zone divider lines */}
      {ZONES.slice(0, -1).map((zone) => {
        const y  = elevToY(zone.max);
        const lx = BASE_L.x + ((440 - y) / 400) * (PEAK.x - BASE_L.x);
        const rx = BASE_R.x + ((440 - y) / 400) * (PEAK.x - BASE_R.x);
        return (
          <line
            key={zone.label}
            x1={lx} y1={y}
            x2={rx} y2={y}
            stroke="rgba(240,237,230,0.12)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
        );
      })}

      {/* Zone labels (left side) */}
      {showLabels && ZONES.map((zone) => {
        const midElevation = (zone.min + zone.max) / 2;
        const y = elevToY(midElevation);
        const lx = BASE_L.x + ((440 - y) / 400) * (PEAK.x - BASE_L.x);
        const labelX = Math.max(8, lx - 6);
        return (
          <text
            key={zone.label}
            x={labelX}
            y={y + 4}
            textAnchor="end"
            fontSize="9"
            fill="rgba(168,184,200,0.65)"
            fontFamily="Nunito, sans-serif"
            fontWeight="600"
          >
            {zone.label}
          </text>
        );
      })}

      {/* Summit flag */}
      {hasSummited && (
        <g>
          <line x1="200" y1="40" x2="200" y2="16" stroke="#F5A623" strokeWidth="1.5" />
          <polygon
            points="200,16 218,22 200,28"
            fill="#F5A623"
          />
        </g>
      )}

      {/* Players */}
      {playerPositions.map((player) => {
        const isHighlighted = player.id === highlightId;
        const r = isHighlighted ? 11 : 8;

        return (
          <motion.g
            key={player.id}
            layoutId={`climber-${player.id}`}
            animate={{ cx: player.svgX, cy: player.svgY }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          >
            {/* Glow behind highlighted player */}
            {isHighlighted && (
              <circle
                cx={player.svgX}
                cy={player.svgY}
                r={18}
                fill="rgba(245,166,35,0.15)"
              />
            )}

            {/* Player circle */}
            <circle
              cx={player.svgX}
              cy={player.svgY}
              r={r}
              fill={player.color || '#52B788'}
              stroke={isHighlighted ? '#F5A623' : 'rgba(240,237,230,0.4)'}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              filter={isHighlighted ? 'url(#goldGlow)' : undefined}
            />

            {/* Summited star */}
            {player.elevation >= 90 && (
              <text
                x={player.svgX}
                y={player.svgY - r - 4}
                textAnchor="middle"
                fontSize="9"
              >
                ⭐
              </text>
            )}

            {/* Name label */}
            {showLabels && (
              <text
                x={player.svgX}
                y={player.svgY - r - 5}
                textAnchor="middle"
                fontSize={isHighlighted ? '10' : '9'}
                fill={isHighlighted ? '#F5A623' : 'rgba(240,237,230,0.75)'}
                fontFamily="Nunito, sans-serif"
                fontWeight="700"
              >
                {player.name?.length > 10
                  ? player.name.slice(0, 9) + '…'
                  : player.name}
              </text>
            )}

            {/* Interactive tooltip area */}
            {interactive && (
              <title>{`${player.name} — ${player.elevation}% elevation`}</title>
            )}
          </motion.g>
        );
      })}
    </svg>
  );
}

// Static star positions [x, y, radius, opacity]
const STAR_POSITIONS = [
  [30,  20,  0.9, 0.7], [70,  10,  0.7, 0.5], [110, 25,  1.0, 0.8],
  [155, 8,   0.8, 0.6], [240, 15,  1.1, 0.9], [290, 30,  0.7, 0.5],
  [330, 12,  0.9, 0.7], [360, 28,  0.8, 0.6], [390, 8,   1.0, 0.8],
  [20,  50,  0.7, 0.4], [60,  45,  0.9, 0.6], [350, 55,  0.8, 0.5],
  [380, 40,  1.0, 0.7], [130, 18,  0.6, 0.4], [175, 35,  0.8, 0.5],
  [310, 22,  0.7, 0.6], [260, 38,  0.9, 0.4], [80,  38,  0.6, 0.3],
];
