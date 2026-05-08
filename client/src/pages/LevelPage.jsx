import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StreakIndicator from '../components/StreakIndicator.jsx';
import TopBar from '../components/TopBar.jsx';

function ResultScreen() {
  const {
    sessionAnswers, currentZone, currentLevel,
    zones, completeLevel, navigate, resetSession,
  } = useGame();

  const correct = sessionAnswers.filter(a => a.correct).length;
  const total = sessionAnswers.length;
  const pct = Math.round((correct / total) * 100);
  const perfect = pct === 100;

  const zone = zones.find(z => z.id === currentZone);
  const level = zone?.levels.find(l => l.id === currentLevel);

  useEffect(() => {
    if (perfect) {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
  }, [perfect]);

  const handleNext = () => {
    completeLevel(currentZone, currentLevel);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '24px 0' }}
    >
      <div style={{ fontSize: 64, marginBottom: 12 }}>
        {perfect ? '🏆' : pct >= 70 ? '⭐' : pct >= 50 ? '👍' : '📚'}
      </div>
      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, fontWeight: 700, marginBottom: 6 }}>
        {perfect ? 'Perfect Score!' : pct >= 70 ? 'Well Done!' : pct >= 50 ? 'Keep Going!' : 'Keep Practicing!'}
      </h2>
      <p style={{ color: 'var(--text-mid)', marginBottom: 8 }}>
        {level?.name} complete
      </p>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontSize: 28, fontWeight: 900, color: pct >= 70 ? 'var(--gold)' : 'var(--text-mid)',
        marginBottom: 24,
      }}>
        <span style={{ color: 'var(--green)' }}>{correct}</span>
        <span style={{ color: 'var(--text-dim)', fontSize: 18 }}>/</span>
        <span>{total}</span>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 28 }}>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 20px' }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>{pct}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Accuracy</div>
        </div>
        {perfect && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--gold)', borderRadius: 14, padding: '12px 20px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--gold)' }}>+30 🪙</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Perfect Bonus</div>
          </div>
        )}
      </div>

      <button className="btn-coral" style={{ width: '100%' }} onClick={handleNext}>
        Continue →
      </button>
    </motion.div>
  );
}

export default function LevelPage() {
  const {
    currentQuestion, sessionIndex, sessionQuestions,
    sessionComplete, showFeedback, streak,
    currentZone, currentLevel, zones,
    navigate, resetSession,
  } = useGame();

  const zone = zones.find(z => z.id === currentZone);
  const level = zone?.levels.find(l => l.id === currentLevel);

  if (!sessionQuestions.length) {
    return (
      <div className="page-container" style={{ justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-mid)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar
        title={level?.name || 'Level'}
        onBack={() => { resetSession(); navigate('adventure_map'); }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          {!sessionComplete ? (
            <>
              {/* Progress */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                    {zone?.emoji} {zone?.name}
                  </div>
                  <StreakIndicator streak={streak} />
                </div>
                <ProgressBar
                  current={sessionIndex}
                  total={sessionQuestions.length}
                  color={zone?.color || 'var(--blue-light)'}
                />
              </div>

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
            </>
          ) : (
            <ResultScreen />
          )}
        </div>
      </div>
    </div>
  );
}
