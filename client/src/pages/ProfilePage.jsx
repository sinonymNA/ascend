import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import TopBar from '../components/TopBar.jsx';
import XPBar from '../components/XPBar.jsx';
import CharacterCard from '../components/CharacterCard.jsx';

export default function ProfilePage() {
  const {
    character, playerLevel, xp, xpToNextLevel,
    totalCorrect, totalAnswered, accuracy,
    maxStreak, coins, completedLevels, zones,
    equippedCosmetics, username, syncStatus,
    navigate, resetGame, logoutUser,
  } = useGame();

  const totalLevels = zones.reduce((sum, z) => sum + z.levels.length, 0);
  const completedCount = Object.values(completedLevels).reduce((sum, lvls) => sum + lvls.length, 0);


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
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <CharacterCard
                  character={character}
                  equippedCosmetics={equippedCosmetics}
                  size="lg"
                  animate
                />
              </div>
              <p style={{ color: 'var(--text-mid)', fontSize: 14, marginBottom: 16 }}>
                Level {playerLevel} · {character?.class || 'Adventurer'}
              </p>
              <XPBar />
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

            {/* Account */}
            {username && (
              <div style={{
                background: 'var(--card)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 16px', marginBottom: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>Signed in as</div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{username}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {syncStatus === 'ok' && <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ Saved</span>}
                  {syncStatus === 'syncing' && <span style={{ fontSize: 11, color: 'var(--gold)' }}>Saving...</span>}
                  {syncStatus === 'error' && <span style={{ fontSize: 11, color: 'var(--coral)' }}>Offline</span>}
                  <button
                    className="btn-outline"
                    style={{ padding: '6px 14px', fontSize: 13 }}
                    onClick={() => { if (window.confirm('Sign out?')) logoutUser(); }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}

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
