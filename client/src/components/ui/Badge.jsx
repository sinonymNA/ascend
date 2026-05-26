import React from 'react';

/**
 * Small badge / pill component.
 *
 * Props:
 *   variant   — 'gold' | 'pine' | 'sunset' | 'rock' | 'sky'  (default 'gold')
 *   children  — text / emoji content
 *   className — extra classes
 *   style     — inline style overrides
 */

const VARIANT_STYLES = {
  gold: {
    background: 'var(--gold-soft)',
    color: 'var(--gold)',
    border: '1px solid var(--border-gold)',
  },
  pine: {
    background: 'var(--pine-soft)',
    color: 'var(--pine-light)',
    border: '1px solid rgba(82,183,136,0.25)',
  },
  sunset: {
    background: 'var(--sunset-soft)',
    color: 'var(--sunset)',
    border: '1px solid rgba(232,93,74,0.25)',
  },
  rock: {
    background: 'rgba(74,85,104,0.3)',
    color: 'var(--text-mid)',
    border: '1px solid rgba(74,85,104,0.4)',
  },
  sky: {
    background: 'rgba(45,107,138,0.25)',
    color: '#6BBCDB',
    border: '1px solid rgba(45,107,138,0.4)',
  },
};

export default function Badge({
  variant = 'gold',
  children,
  className = '',
  style = {},
}) {
  const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.gold;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontFamily: 'Nunito, sans-serif',
        fontWeight: 700,
        fontSize: '12px',
        lineHeight: 1,
        padding: '4px 10px',
        borderRadius: '999px',
        whiteSpace: 'nowrap',
        ...variantStyle,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
