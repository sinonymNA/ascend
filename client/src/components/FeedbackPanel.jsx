import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import XPToast from './XPToast.jsx';

export default function FeedbackPanel() {
  const {
    lastAnswerCorrect, lastAnswerExplanation,
    streak, dismissFeedback,
    sessionIndex, sessionQuestions, xpGainAmount,
  } = useGame();

  const isLast = sessionIndex + 1 >= sessionQuestions.length;

  return (
    <div style={{ position: 'relative' }}>
      {lastAnswerCorrect && <XPToast show amount={xpGainAmount} />}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={{
        background: 'var(--card)',
        border: `2px solid ${lastAnswerCorrect ? 'var(--green)' : 'var(--coral)'}`,
        borderRadius: 20, padding: 20,
        boxShadow: lastAnswerCorrect
          ? '0 0 24px rgba(46,204,113,0.2)'
          : '0 0 24px rgba(232,68,90,0.2)',
      }}
    >
      {/* Result header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 24 }}>
          {lastAnswerCorrect ? '✅' : '❌'}
        </span>
        <div>
          <div style={{
            fontSize: 16, fontWeight: 800,
            color: lastAnswerCorrect ? 'var(--green)' : 'var(--coral)',
          }}>
            {lastAnswerCorrect ? 'Correct!' : 'Not quite.'}
          </div>
          {lastAnswerCorrect && streak >= 3 && (
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 700 }}>
              🔥 {streak} in a row!
            </div>
          )}
        </div>
        {lastAnswerCorrect && (
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 13, color: 'var(--gold)', fontWeight: 800 }}>+{xpGainAmount} XP</div>
            <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>+10 🪙</div>
          </div>
        )}
      </div>

      {/* Explanation */}
      {lastAnswerExplanation && (
        <div style={{
          background: 'var(--bg-mid)', borderRadius: 12,
          padding: '12px 14px', marginBottom: 16,
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-mid)', margin: 0 }}>
            {lastAnswerExplanation}
          </p>
        </div>
      )}

      {/* Continue button */}
      <button
        className={lastAnswerCorrect ? 'btn-gold' : 'btn-coral'}
        style={{ width: '100%' }}
        onClick={dismissFeedback}
      >
        {isLast ? 'See Results →' : 'Continue →'}
      </button>
    </motion.div>
    </div>
  );
}
