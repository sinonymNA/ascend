import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/**
 * Full-screen summit celebration overlay.
 *
 * Props:
 *   show      — bool
 *   xpEarned  — number
 *   position  — rank in class (1-based)
 *   playerName — string
 *   onDismiss — function
 */
export default function SummitCelebration({
  show = false,
  xpEarned = 0,
  position = null,
  playerName = '',
  onDismiss,
}) {
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (!show) {
      confettiFiredRef.current = false;
      return;
    }
    if (confettiFiredRef.current) return;
    confettiFiredRef.current = true;

    // Dynamically import canvas-confetti to avoid SSR issues
    import('canvas-confetti').then(({ default: confetti }) => {
      // First burst
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#F5A623', '#FFFFFF', '#52B788', '#E8F4F8', '#C8851A'],
        zIndex: 9999,
      });

      // Second burst from left
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.65 },
          colors: ['#F5A623', '#FFFFFF', '#E8F4F8'],
          zIndex: 9999,
        });
      }, 300);

      // Third burst from right
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.65 },
          colors: ['#F5A623', '#FFFFFF', '#C8851A'],
          zIndex: 9999,
        });
      }, 600);
    });
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="summit-celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.35 }}
          onClick={onDismiss}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(ellipse at center, rgba(30,45,65,0.97) 0%, rgba(10,16,26,0.99) 100%)',
            cursor: 'pointer',
          }}
        >
          {/* Mountain emoji hero */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.15 }}
            style={{ fontSize: '72px', lineHeight: 1, marginBottom: '16px' }}
          >
            🏔️
          </motion.div>

          {/* Summit Reached headline */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
          >
            <div
              className="cinzel"
              style={{
                fontSize: 'clamp(28px, 6vw, 52px)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #F5A623 0%, #E8D5A0 50%, #C8851A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
                marginBottom: '8px',
              }}
            >
              Summit Reached
            </div>
          </motion.div>

          {/* Player name */}
          {playerName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-mid)',
                marginBottom: '28px',
              }}
            >
              {playerName}
            </motion.div>
          )}

          {/* Stats panel */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-gold)',
              borderRadius: '20px',
              padding: '24px 40px',
              display: 'flex',
              gap: '40px',
              alignItems: 'center',
              boxShadow: 'var(--shadow-gold)',
              marginBottom: '32px',
            }}
          >
            {/* XP */}
            <div style={{ textAlign: 'center' }}>
              <div
                className="cinzel"
                style={{ fontSize: '32px', fontWeight: 700, color: 'var(--gold)' }}
              >
                +{xpEarned}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  fontFamily: 'Nunito, sans-serif',
                  fontWeight: 600,
                  marginTop: '4px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                XP Earned
              </div>
            </div>

            {/* Divider */}
            {position !== null && (
              <div style={{ width: '1px', height: '48px', background: 'var(--border)' }} />
            )}

            {/* Position */}
            {position !== null && (
              <div style={{ textAlign: 'center' }}>
                <div
                  className="cinzel"
                  style={{ fontSize: '32px', fontWeight: 700, color: 'var(--pine-light)' }}
                >
                  #{position}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    fontFamily: 'Nunito, sans-serif',
                    fontWeight: 600,
                    marginTop: '4px',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  In Class
                </div>
              </div>
            )}
          </motion.div>

          {/* Dismiss hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}
          >
            Tap anywhere to continue
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
