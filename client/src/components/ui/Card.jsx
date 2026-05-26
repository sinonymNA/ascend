import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Card component.
 *
 * Props:
 *   elevated  — bool  (uses --bg-elevated background)
 *   hover     — bool  (adds gold glow hover effect)
 *   onClick   — function
 *   padding   — 'none' | 'sm' | 'md' | 'lg'  (default 'md')
 *   className — extra classes
 *   children  — content
 *   style     — inline style overrides
 */

const PADDING_MAP = {
  none: '0',
  sm:   '12px',
  md:   '24px',
  lg:   '36px',
};

export default function Card({
  elevated = false,
  hover = false,
  onClick,
  padding = 'md',
  className = '',
  children,
  style = {},
  ...rest
}) {
  const baseClass = elevated ? 'card-elevated' : 'card';
  const hoverClass = (hover || onClick) ? 'card-hover' : '';
  const paddingValue = PADDING_MAP[padding] ?? PADDING_MAP.md;
  const isClickable = !!onClick;

  return (
    <motion.div
      className={`${baseClass} ${hoverClass} ${className}`}
      style={{ padding: paddingValue, cursor: isClickable ? 'pointer' : undefined, ...style }}
      onClick={onClick}
      whileHover={
        hover || isClickable
          ? {
              borderColor: 'rgba(245,166,35,0.35)',
              boxShadow: '0 0 24px rgba(245,166,35,0.18)',
            }
          : {}
      }
      whileTap={isClickable ? { scale: 0.985 } : {}}
      transition={{ duration: 0.18 }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
