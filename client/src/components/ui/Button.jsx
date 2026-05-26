import React from 'react';
import { motion } from 'framer-motion';

/**
 * Reusable Button component.
 *
 * Props:
 *   variant  — 'primary' | 'secondary' | 'ghost' | 'danger'  (default: 'primary')
 *   size     — 'sm' | 'md' | 'lg'                             (default: 'md')
 *   loading  — bool  (shows spinner, disables interaction)
 *   disabled — bool
 *   onClick  — function
 *   type     — button | submit | reset                        (default: 'button')
 *   className — extra classes
 *   children — content
 */

const SIZE_OVERRIDES = {
  sm: { fontSize: '13px', padding: '8px 18px', borderRadius: '10px', gap: '6px' },
  md: {},  // defaults from CSS classes
  lg: { fontSize: '17px', padding: '14px 36px', borderRadius: '14px', gap: '10px' },
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
  style = {},
  ...rest
}) {
  const baseClass = `btn-${variant}`;
  const sizeStyle = SIZE_OVERRIDES[size] || {};
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      className={`${baseClass} ${className}`}
      style={{ ...sizeStyle, ...style }}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      whileTap={isDisabled ? {} : { scale: 0.96 }}
      whileHover={isDisabled ? {} : { scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner variant={variant} />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}

function Spinner({ variant }) {
  const color =
    variant === 'primary' ? '#0F1720'
    : variant === 'danger' ? '#fff'
    : 'var(--text-mid)';

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      style={{ flexShrink: 0, animation: 'spin 0.7s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="3" strokeOpacity="0.25" />
      <path
        d="M12 3a9 9 0 0 1 9 9"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
