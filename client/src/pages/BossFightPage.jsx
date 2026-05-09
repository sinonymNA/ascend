import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext.jsx';
import QuestionCard from '../components/QuestionCard.jsx';
import FeedbackPanel from '../components/FeedbackPanel.jsx';
import BossHealthBar from '../components/BossHealthBar.jsx';
import StreakIndicator from '../components/StreakIndicator.jsx';
import CharacterCard from '../components/CharacterCard.jsx';
import TopBar from '../components/TopBar.jsx';

function BossResultScreen() {
  const { bossDefeated, currentZone, zones, completeBoss, navigate, resetSession, bossHp, playerHp } = useGame();
  const fired = useRef(false);

  useEffect(() => {
    if (bossDefeated && !fired.current) {
      fired.current = true;
      confetti({
        particleCount: 150, spread: 90,
        origin: { y: 0.4 },
        colors: ['#FFB830', '#E8445A', '#2ECC71'],
      });
    }
  }, [bossDefeated]);

  const zone = zones.find(z => z.id === currentZone);

  const handleNext = () => {
    if (bossDefeated) {
      completeBoss(currentZone);
    } else {
      resetSession();
      navigate('adventure_map');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ textAlign: 'center', padding: '24px 0' }}
    >
      <div style={{ fontSize: 72, marginBottom: 16 }}>
        {bossDefeated ? '🏆' : '💀'}
      </div>
      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
        {bossDefeated ? 'Boss Defeated!' : 'Defeated by the Boss'}
      </h2>
      <p style={{ color: 'var(--text-mid)', marginBottom: 24 }}>
        {bossDefeated
          ? `${zone?.bossName} has fallen! New zones unlocked.`
          : `${zone?.bossName} was too powerful. Study more and try again!`}
      </p>

      {bossDefeated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'inline-flex', gap: 16, marginBottom: 28,
            background: 'var(--gold-soft)', border: '1px solid var(--gold)',
            borderRadius: 16, padding: '14px 24px',
          }}
        >
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>+200</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>XP</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--gold)' }}>+50 🪙</div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Coins</div>
          </div>
        </motion.div>
      )}

      <button
        className={bossDefeated ? 'btn-gold' : 'btn-coral'}
        style={{ width: '100%' }}
        onClick={handleNext}
      >
        {bossDefeated ? 'Claim Victory →' : 'Back to Map'}
      </button>
    </motion.div>
  );
}

export default function BossFightPage() {
  const {
    character, equippedCosmetics,
    currentQuestion, sessionIndex, sessionQuestions,
    sessionComplete, showFeedback, streak,
    currentZone, zones, bossHp, playerHp,
    navigate, resetSession,
  } = useGame();

  const zone = zones.find(z => z.id === currentZone);

  if (!sessionQuestions.length) {
    return (
      <div className="page-container" style={{ justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-mid)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Boss atmosphere header */}
      <div style={{
        background: 'linear-gradient(180deg, rgba(232,68,90,0.15) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(232,68,90,0.3)',
        padding: '16px 20px',
        position: 'sticky', top: 0, zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <button
              className="btn-outline"
              style={{ padding: '6px 14px', fontSize: 13 }}
              onClick={() => { resetSession(); navigate('adventure_map'); }}
            >
              ← Retreat
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: 'var(--coral)' }}>
                ⚔ BOSS BATTLE
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                {zone?.bossName}
              </div>
            </div>
            <StreakIndicator streak={streak} />
          </div>
          <BossHealthBar bossHp={bossHp} playerHp={playerHp} bossName={zone?.bossName || 'Boss'} />
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          {!sessionComplete ? (
            <>
              {/* Question counter */}
              {/* Character vs Boss portraits */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <CharacterCard character={character} equippedCosmetics={equippedCosmetics} size="sm" animate />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 2 }}>
                    Q {sessionIndex + 1}/{sessionQuestions.length}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--coral)' }}>⚔️</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48 }}>{zone?.emoji || '👹'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{zone?.bossName}</div>
                </div>
              </div>

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
            <BossResultScreen />
          )}
        </div>
      </div>
    </div>
  );
}
