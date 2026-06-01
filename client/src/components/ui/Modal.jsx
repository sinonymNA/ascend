import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Icon from './Icon.jsx';

/**
 * Full-screen modal with backdrop blur.
 *
 * Props:
 *   open      — bool
 *   onClose   — function (called when backdrop clicked or Escape pressed)
 *   children  — modal content
 *   maxWidth  — CSS value for the panel max-width (default '520px')
 *   closable  — bool, whether backdrop/Escape closes it (default true)
 */
export default function Modal({
  open,
  onClose,
  children,
  maxWidth = '520px',
  closable = true,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!open || !closable) return;
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, closable, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={closable ? onClose : undefined}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: 'rgba(10, 16, 26, 0.75)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.93, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
              width: '100%',
              maxWidth,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 48px rgba(0,0,0,0.55)',
              position: 'relative',
            }}
          >
            {closable && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontSize: '20px',
                  lineHeight: 1,
                  padding: '4px',
                  borderRadius: '6px',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <Icon name="xCircle" size={20} />
              </button>
            )}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
