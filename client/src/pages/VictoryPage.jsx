import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';

export default function VictoryPage() {
  const { character, totalCorrect, totalAnswered, accuracy, playerLevel, coins, navigate } = useGame();
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      const fire = (opts) => confetti({ ...opts, colors: ['#FFB830', '#E8445A', '#2ECC71', '#5B9CF6', '#7B4FE9'] });
      setTimeout(() => fire({ particleCount: 80, spread: 100, origin: { x: 0.2, y: 0.5 } }), 300);
      setTimeout(() => fire({ particleCount: 80, spread: 100, origin: { x: 0.8, y: 0.5 } }), 500);
      setTimeout(() => fire({ particleCount: 120, spread: 120, origin: { x: 0.5, y: 0.3 } }), 800);
    }
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } },
  };
  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <StarField />
      <div className="content-max" style={{ textAlign: 'center' }}>
        <motion.div variants={container} initial="hidden" animate="show">
          <motion.div variants={item} style={{ fontSize: 80, marginBottom: 16 }}>
            🏆
          </motion.div>

          <motion.h1 variants={item} style={{
            fontFamily: 'Cinzel, serif', fontSize: 36, fontWeight: 900,
            background: 'linear-gradient(135deg, #FFB830, #FF9500)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 8,
          }}>
            VICTORY!
          </motion.h1>

          <motion.p variants={item} style={{ fontSize: 18, color: 'var(--text-mid)', marginBottom: 32 }}>
            {character?.name}, you have conquered all five zones!
            <br />
            <span style={{ fontSize: 15, color: 'var(--text-dim)' }}>The AP World History exam has no secrets left for you.</span>
          </motion.p>

          {/* Stats */}
          <motion.div variants={item} style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: 14, marginBottom: 32,
          }}>
            {[
              { label: 'Questions Conquered', value: totalAnswered, icon: '📝' },
              { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
              { label: 'Hero Level', value: playerLevel, icon: '⚔️' },
              { label: 'Coins Collected', value: coins, icon: '🪙' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: 'var(--card)', border: '1px solid var(--gold)',
                borderRadius: 16, padding: '16px 12px',
              }}>
                <div style={{ fontSize: 24 }}>{stat.icon}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--gold)', margin: '4px 0' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              className="btn-gold"
              style={{ width: '100%', fontSize: 16 }}
              onClick={() => navigate('adventure_map')}
            >
              Play Again for Mastery
            </button>
            <button
              className="btn-outline"
              style={{ width: '100%' }}
              onClick={() => navigate('profile')}
            >
              View Full Stats
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
