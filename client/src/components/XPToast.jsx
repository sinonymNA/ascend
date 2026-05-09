import { motion, AnimatePresence } from 'framer-motion';

export default function XPToast({ show, amount }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={amount + Date.now()}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -48, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
            pointerEvents: 'none', zIndex: 50,
            background: 'linear-gradient(135deg, #FFB830, #FF9500)',
            color: '#1a1a2e', fontWeight: 900, fontSize: 15,
            padding: '4px 12px', borderRadius: 20,
            boxShadow: '0 4px 14px rgba(255,184,48,0.5)',
            whiteSpace: 'nowrap',
          }}
        >
          +{amount} XP ⚡
        </motion.div>
      )}
    </AnimatePresence>
  );
}
