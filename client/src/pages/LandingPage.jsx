import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function LandingPage() {
  const { navigate, character } = useGame();

  const handleStart = () => {
    navigate(character ? 'adventure_map' : 'exam_select');
  };

  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <StarField />

      <motion.div
        className="content-max"
        variants={container}
        initial="hidden"
        animate="show"
        style={{ textAlign: 'center', paddingTop: 40 }}
      >
        {/* Logo */}
        <motion.div variants={item} style={{ marginBottom: 24 }}>
          <div style={{
            width: 90, height: 90, borderRadius: 24,
            background: 'linear-gradient(135deg, var(--gold), #FF9500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44, margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(255,184,48,0.4)',
          }}>
            ⚔️
          </div>
          <h1 style={{
            fontFamily: 'Cinzel, serif', fontSize: 52, fontWeight: 900,
            letterSpacing: 6, margin: 0,
            background: 'linear-gradient(135deg, #FFB830, #FF9500)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            ASCEND
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-mid)', letterSpacing: 3, marginTop: 6, textTransform: 'uppercase' }}>
            Conquer Your Exam
          </p>
        </motion.div>

        {/* Tagline */}
        <motion.p variants={item} style={{
          fontSize: 17, color: 'var(--text-mid)', lineHeight: 1.7,
          marginBottom: 36, maxWidth: 380, margin: '0 auto 36px',
        }}>
          Turn AP World History into an epic RPG adventure. Battle through five zones, defeat bosses, and conquer your exam.
        </motion.p>

        {/* Feature pills */}
        <motion.div variants={item} style={{
          display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center',
          marginBottom: 36,
        }}>
          {['250 Questions', '5 Epic Zones', 'Boss Battles', 'XP & Rewards'].map(feat => (
            <span key={feat} style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: '6px 14px',
              fontSize: 13, color: 'var(--text-mid)', fontWeight: 600,
            }}>
              {feat}
            </span>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div variants={item} style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
          <motion.button
            className="btn-coral"
            style={{ fontSize: 18, padding: '16px 48px', width: '100%', maxWidth: 320 }}
            onClick={handleStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {character ? 'Continue Adventure' : 'Begin Your Journey'}
          </motion.button>
          {!character && (
            <p style={{ fontSize: 12, color: 'var(--text-dim)' }}>
              Free to play · All questions included
            </p>
          )}
        </motion.div>

        {/* Zone preview */}
        <motion.div variants={item} style={{ marginTop: 48 }}>
          <p style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 2 }}>
            Five Zones of Knowledge
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { emoji: '🏛', name: 'Ancient Empires' },
              { emoji: '🕌', name: 'Medieval Crossroads' },
              { emoji: '⛵', name: 'Age of Connection' },
              { emoji: '⚔️', name: 'Revolutionary Age' },
              { emoji: '🌍', name: 'Modern World' },
            ].map(z => (
              <div key={z.name} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '10px 14px', background: 'var(--card)',
                border: '1px solid var(--border)', borderRadius: 16,
                minWidth: 80,
              }}>
                <span style={{ fontSize: 22 }}>{z.emoji}</span>
                <span style={{ fontSize: 10, color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.3 }}>
                  {z.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
