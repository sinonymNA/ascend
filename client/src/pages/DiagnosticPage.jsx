import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { useGame } from '../context/GameContext.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StreakIndicator from '../components/StreakIndicator.jsx';

export default function DiagnosticPage() {
  const {
    currentQuestion, sessionIndex, sessionQuestions,
    sessionComplete, showFeedback, streak,
    finishDiagnostic,
  } = useGame();

  useEffect(() => {
    if (sessionComplete) {
      finishDiagnostic();
    }
  }, [sessionComplete, finishDiagnostic]);

  if (!currentQuestion && !sessionComplete) {
    return (
      <div className="page-container" style={{ justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-mid)' }}>Loading questions...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="content-max" style={{ paddingTop: 16 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 20 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, margin: 0 }}>
                Diagnostic Quest
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', margin: '2px 0 0' }}>
                Mapping your knowledge
              </p>
            </div>
            <StreakIndicator streak={streak} />
          </div>
          <ProgressBar
            current={sessionIndex}
            total={sessionQuestions.length}
            color="var(--gold)"
          />
        </motion.div>

        {/* Question / Feedback */}
        <AnimatePresence mode="wait">
          {!showFeedback && currentQuestion && (
            <motion.div key={`q-${sessionIndex}`}>
              <QuestionCard
                question={currentQuestion}
                sessionIndex={sessionIndex}
                totalQuestions={sessionQuestions.length}
              />
            </motion.div>
          )}
          {showFeedback && (
            <motion.div key="feedback">
              <FeedbackPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
