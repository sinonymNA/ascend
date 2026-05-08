import { motion } from 'framer-motion';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function AnswerChoice({
  letter, text, chosen, correct, revealed, onSelect, disabled,
}) {
  const isChosen = chosen === letter;
  const isCorrect = correct === letter;

  let borderColor = 'var(--border)';
  let bg = 'var(--card)';
  let labelBg = 'var(--bg-mid)';
  let textColor = 'var(--text)';

  if (revealed) {
    if (isCorrect) {
      borderColor = 'var(--green)';
      bg = 'var(--green-soft)';
      labelBg = 'var(--green)';
      textColor = 'var(--text)';
    } else if (isChosen && !isCorrect) {
      borderColor = 'var(--coral)';
      bg = 'var(--coral-soft)';
      labelBg = 'var(--coral)';
    }
  } else if (isChosen) {
    borderColor = 'var(--blue-light)';
    bg = 'rgba(91,156,246,0.1)';
    labelBg = 'var(--blue-light)';
  }

  return (
    <motion.button
      onClick={() => !disabled && onSelect(letter)}
      disabled={disabled}
      style={{
        width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14,
        background: bg, border: `2px solid ${borderColor}`,
        borderRadius: 16, padding: '14px 16px',
        cursor: disabled ? 'default' : 'pointer',
        textAlign: 'left', transition: 'all 0.15s ease',
        color: textColor,
      }}
      whileHover={!disabled ? { scale: 1.01, borderColor: 'var(--text-mid)' } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
      layout
    >
      <span style={{
        minWidth: 28, height: 28, borderRadius: 8,
        background: labelBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 13, fontWeight: 800,
        color: revealed && (isCorrect || isChosen) ? 'white' : 'var(--text-mid)',
        flexShrink: 0, transition: 'background 0.15s',
      }}>
        {revealed && isCorrect ? '✓' : revealed && isChosen && !isCorrect ? '✗' : letter}
      </span>
      <span style={{ fontSize: 15, lineHeight: 1.5, paddingTop: 2 }}>{text}</span>
    </motion.button>
  );
}
