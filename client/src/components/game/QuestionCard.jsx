import { motion } from 'framer-motion';

const LABELS = ['A', 'B', 'C', 'D'];

const DIFFICULTY_LABELS = {
  1: 'Base Camp',
  2: 'Alpine',
  3: 'Summit',
};

const DIFFICULTY_COLORS = {
  1: '#52B788',
  2: '#F5A623',
  3: '#E85D4A',
};

/**
 * Game QuestionCard — live classroom version.
 *
 * Props:
 *   question   — { id, text, stimulus, choices: { A,B,C,D }, difficulty, tags }
 *   onAnswer   — (letter: string) => void
 *   disabled   — bool  (after an answer is selected)
 *   selected   — 'A'|'B'|'C'|'D'|null  (currently selected letter)
 */
export default function QuestionCard({
  question,
  onAnswer,
  disabled = false,
  selected = null,
}) {
  if (!question) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        padding: 40,
        color: 'var(--text-muted)',
      }}>
        <div style={{ fontSize: 36 }}>⏳</div>
        <p style={{ fontSize: 15, fontWeight: 600 }}>Waiting for question…</p>
      </div>
    );
  }

  const diffColor = DIFFICULTY_COLORS[question.difficulty] || 'var(--text-mid)';
  const diffLabel = DIFFICULTY_LABELS[question.difficulty] || '';
  const choices   = question.options || question.choices || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{ width: '100%' }}
    >
      {/* Meta row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 14,
        flexWrap: 'wrap',
      }}>
        {diffLabel && (
          <span style={{
            background: `${diffColor}22`,
            color: diffColor,
            border: `1px solid ${diffColor}44`,
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.4,
            textTransform: 'uppercase',
          }}>
            {diffLabel}
          </span>
        )}
        {(question.tags || []).slice(0, 2).map((tag) => (
          <span key={tag} style={{
            background: 'rgba(168,184,200,0.12)',
            color: 'var(--text-mid)',
            borderRadius: 20,
            padding: '3px 10px',
            fontSize: 11,
            fontWeight: 600,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Optional stimulus */}
      {question.stimulus && (
        <div style={{
          background: 'rgba(240,237,230,0.04)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '14px 16px',
          marginBottom: 14,
          fontSize: 13,
          lineHeight: 1.7,
          color: 'var(--text-mid)',
          fontStyle: 'italic',
        }}>
          {question.stimulus}
        </div>
      )}

      {/* Question text */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: '16px 18px',
        marginBottom: 16,
      }}>
        <p style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: 'var(--text)',
          margin: 0,
          fontWeight: 600,
        }}>
          {question.question || question.text}
        </p>
      </div>

      {/* Answer choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {LABELS.map((letter) => {
          const text        = choices[letter];
          if (!text) return null;
          const isSelected  = selected === letter;

          return (
            <motion.button
              key={letter}
              onClick={() => !disabled && onAnswer?.(letter)}
              whileTap={disabled ? {} : { scale: 0.97 }}
              whileHover={disabled ? {} : { borderColor: 'rgba(245,166,35,0.45)' }}
              transition={{ duration: 0.12 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                background: isSelected
                  ? 'rgba(245,166,35,0.10)'
                  : 'var(--bg-card)',
                border: `1.5px solid ${isSelected ? 'var(--gold)' : 'var(--border)'}`,
                borderRadius: 12,
                padding: '12px 16px',
                cursor: disabled ? 'default' : 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              {/* Letter badge */}
              <span style={{
                flexShrink: 0,
                width: 28,
                height: 28,
                borderRadius: 8,
                background: isSelected ? 'var(--gold)' : 'rgba(168,184,200,0.15)',
                color: isSelected ? '#0F1720' : 'var(--text-mid)',
                fontWeight: 800,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.15s, color 0.15s',
              }}>
                {letter}
              </span>
              <span style={{
                fontSize: 15,
                lineHeight: 1.55,
                color: isSelected ? 'var(--text)' : 'var(--text-mid)',
                fontWeight: isSelected ? 700 : 500,
                paddingTop: 4,
                transition: 'color 0.15s',
              }}>
                {text}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
