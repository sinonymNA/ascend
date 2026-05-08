import { motion } from 'framer-motion';
import AnswerChoice from './AnswerChoice.jsx';
import { useGame } from '../context/GameContext.jsx';

export default function QuestionCard({ question, sessionIndex, totalQuestions }) {
  const { sessionAnswers, showFeedback, answerQuestion } = useGame();
  const answer = sessionAnswers.find(a => a.questionId === question.id);
  const chosen = answer?.chosen || null;
  const revealed = showFeedback && chosen !== null;

  const skillColors = {
    causation: '#5B9CF6', contextualization: '#7B4FE9',
    ccot: '#2ECC71', comparison: '#FFB830', evidence: '#E8445A',
    trade: '#5B9CF6', religion: '#7B4FE9', political: '#E8445A',
    social: '#2ECC71', cultural: '#FFB830', blending: '#FF7043',
    enlightenment: '#5B9CF6', revolution: '#E8445A', nationalism: '#FFB830',
    industry: '#7B4FE9', reform: '#2ECC71',
    imperialism: '#E8445A', wars: '#FF7043', coldwar: '#5B9CF6',
    decolonization: '#2ECC71', globalization: '#7B4FE9',
  };

  const skillColor = skillColors[question.skillTag] || 'var(--blue-light)';
  const difficultyStars = '★'.repeat(question.difficulty) + '☆'.repeat(3 - question.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{
            background: `${skillColor}22`, color: skillColor,
            border: `1px solid ${skillColor}44`,
            borderRadius: 20, padding: '3px 10px',
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5,
          }}>
            {question.skillTag}
          </span>
          <span style={{ fontSize: 12, color: 'var(--gold)', letterSpacing: 1 }}>
            {difficultyStars}
          </span>
        </div>
        <span style={{ fontSize: 13, color: 'var(--text-dim)', fontWeight: 600 }}>
          {sessionIndex + 1} / {totalQuestions}
        </span>
      </div>

      {/* Question text */}
      <div style={{
        background: 'var(--bg-mid)', borderRadius: 16, padding: '18px 20px',
        marginBottom: 16, border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: 16, lineHeight: 1.65, color: 'var(--text)', margin: 0 }}>
          {question.text}
        </p>
      </div>

      {/* Choices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Object.entries(question.choices).map(([letter, text]) => (
          <AnswerChoice
            key={letter}
            letter={letter}
            text={text}
            chosen={chosen}
            correct={question.correct}
            revealed={revealed}
            onSelect={(l) => answerQuestion(question.id, l)}
            disabled={revealed || chosen !== null}
          />
        ))}
      </div>
    </motion.div>
  );
}
