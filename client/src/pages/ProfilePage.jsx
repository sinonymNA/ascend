import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import TopBar from '../components/TopBar.jsx';
import XPBar from '../components/XPBar.jsx';

export default function ProfilePage() {
  const {
    character, playerLevel, xp, xpToNextLevel,
    totalCorrect, totalAnswered, accuracy,
    maxStreak, coins, completedLevels, zones,
    equippedCosmetics, cosmetics,
    navigate, resetGame,
  } = useGame();

  const totalLevels = zones.reduce((sum, z) => sum + z.levels.length, 0);
  const completedCount = Object.values(completedLevels).reduce((sum, lvls) => sum + lvls.length, 0);

  const equippedItems = equippedCosmetics.map(id => cosmetics.find(c => c.id === id)).filter(Boolean);

  const stats = [
    { label: 'Questions Answered', value: totalAnswered, icon: '📝' },
    { label: 'Correct Answers', value: totalCorrect, icon: '✅' },
    { label: 'Accuracy', value: `${accuracy}%`, icon: '🎯' },
    { label: 'Best Streak', value: maxStreak, icon: '🔥' },
    { label: 'Levels Complete', value: `${completedCount}/${totalLevels}`, icon: '⚔️' },
    { label: 'Coins Earned', value: coins, icon: '🪙' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Profile" onBack={() => navigate('adventure_map')} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Hero card */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 24, padding: 24, marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24, margin: '0 auto 12px',
                background: 'linear-gradient(135deg, var(--gold), #FF9500)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 36,
              }}>
                {character?.emoji || '⚔️'}
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
                {character?.name || 'Hero'}
              </h2>
              <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 16 }}>
                Level {playerLevel} · {character?.class || 'Adventurer'}
              </p>
              <XPBar />

              {equippedItems.length > 0 && (
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 14 }}>
                  {equippedItems.map(item => (
                    <span
                      key={item.id}
                      title={item.name}
                      style={{ fontSize: 22 }}
                    >
                      {item.emoji}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 16, padding: '14px 16px',
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}
                >
                  <div style={{ fontSize: 18 }}>{stat.icon}</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--text)' }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Reset */}
            <button
              className="btn-outline"
              style={{ width: '100%', color: 'var(--coral)', borderColor: 'rgba(232,68,90,0.3)' }}
              onClick={() => {
                if (window.confirm('Reset all progress? This cannot be undone.')) {
                  resetGame();
                }
              }}
            >
              Reset Progress
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
