import React from 'react';
import { motion } from 'framer-motion';

/**
 * Presentational 8×8 (configurable) block grid.
 * Props:
 *   grid        — 2D array [rows][cols] of color string | null
 *   size        — grid dimension (default 8)
 *   preview     — array of {r,c} cells to highlight as placement preview
 *   previewOk   — bool: is the previewed placement valid
 *   previewColor— color for the preview
 *   clearing    — Set of "r,c" keys currently animating out
 *   onCellEnter — (r,c) => void
 *   onCellClick — (r,c) => void
 */
export default function BlockGrid({
  grid, size = 8, preview = [], previewOk = true, previewColor = '#F5A623',
  clearing = new Set(), onCellEnter, onCellClick,
}) {
  const previewSet = new Set(preview.map((p) => `${p.r},${p.c}`));
  const CELL = 100 / size;

  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', maxWidth: '340px', display: 'block', margin: '0 auto', touchAction: 'manipulation' }}>
      <rect x="0" y="0" width="100" height="100" rx="3" fill="var(--bg)" stroke="var(--border)" strokeWidth="0.5" />
      {grid.map((row, r) =>
        row.map((cell, c) => {
          const key = `${r},${c}`;
          const isPreview = previewSet.has(key);
          const isClearing = clearing.has(key);
          const x = c * CELL;
          const y = r * CELL;
          let fill = 'rgba(255,255,255,0.03)';
          if (cell) fill = cell;
          if (isPreview) fill = previewOk ? previewColor : '#E85D4A';
          return (
            <motion.rect
              key={key}
              x={x + 0.6} y={y + 0.6}
              width={CELL - 1.2} height={CELL - 1.2}
              rx="1.6"
              fill={fill}
              opacity={isPreview && !cell ? 0.55 : 1}
              animate={isClearing ? { scale: [1, 1.15, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: isPreview && !cell ? 0.55 : 1 }}
              transition={{ duration: isClearing ? 0.35 : 0.12 }}
              style={{ transformOrigin: `${x + CELL / 2}px ${y + CELL / 2}px`, cursor: onCellClick ? 'pointer' : 'default' }}
              onMouseEnter={() => onCellEnter?.(r, c)}
              onClick={() => onCellClick?.(r, c)}
            />
          );
        })
      )}
    </svg>
  );
}
