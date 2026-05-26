import { AnimatePresence, motion } from 'framer-motion';

/**
 * XPFloat — floating "+100 XP ⚡" text that rises and fades.
 *
 * Props:
 *   show   — bool
 *   amount — number
 *   animKey — optional key to re-trigger animation (e.g. timestamp)
 */
export default function XPFloat({ show, amount, animKey }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={animKey ?? `xp-${amount}`}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -60, scale: 1.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 50,
            /* Cinzel font for the gold gradient text */
            fontFamily: 'Cinzel, serif',
            fontWeight: 700,
            fontSize: '20px',
            whiteSpace: 'nowrap',
            /* Gold gradient text */
            background: 'linear-gradient(135deg, #F5A623 0%, #E8D5A0 50%, #C8851A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 8px rgba(245,166,35,0.6))',
          }}
        >
          +{amount} XP ⚡
        </motion.div>
      )}
    </AnimatePresence>
  );
}
