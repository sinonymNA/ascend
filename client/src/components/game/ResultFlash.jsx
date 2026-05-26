import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ResultFlash — full-screen flash on answer submission.
 *
 * Props:
 *   correct — bool
 *   show    — bool (controls mount/unmount)
 */
export default function ResultFlash({ correct, show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={correct ? 'correct-flash' : 'wrong-flash'}
          initial={{ opacity: 0.8 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: correct
              ? 'rgba(82,183,136,0.22)'
              : 'rgba(232,93,74,0.22)',
            pointerEvents: 'none',
          }}
        />
      )}
    </AnimatePresence>
  );
}
