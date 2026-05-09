import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';
import TopBar from '../components/TopBar.jsx';
import PathNode from '../components/PathNode.jsx';

export default function AdventureMapPage() {
  const {
    zones, navigate, startLevel, startBoss,
    isZoneUnlocked, isLevelCompleted, isZoneCompleted,
    character, currentZone, wrongQueue, logoutUser, username,
  } = useGame();

  const reviewCount = wrongQueue.filter(w => w.nextReviewAt <= Date.now()).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <StarField />
      <TopBar
        title="Adventure Map"
        onBack={null}
      />

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px 16px 40px',
      }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          {/* Nav buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: reviewCount > 0 ? 10 : 20 }}>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => navigate('store')}>
              🛒 Store
            </button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => navigate('profile')}>
              👤 {character?.name || 'Profile'}
            </button>
            <button
              className="btn-outline"
              style={{ padding: '0 12px', fontSize: 12, color: 'var(--text-dim)' }}
              onClick={() => { if (window.confirm('Sign out?')) logoutUser(); }}
              title={`Signed in as ${username || 'Guest'}`}
            >
              ↩
            </button>
          </div>

          {reviewCount > 0 && (
            <button
              className="btn-outline"
              style={{ width: '100%', marginBottom: 20, borderColor: 'var(--gold)', color: 'var(--gold)', fontSize: 14 }}
              onClick={() => navigate('adventure_map')}
            >
              🔁 Review Queue ({reviewCount} due)
            </button>
          )}

          {/* Zones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {zones.map((zone, zoneIdx) => {
              const unlocked = isZoneUnlocked(zone.id);
              const completed = isZoneCompleted(zone.id);

              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: zoneIdx * 0.1 }}
                  style={{ opacity: unlocked ? 1 : 0.4 }}
                >
                  {/* Zone header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    marginBottom: 12, padding: '12px 16px',
                    background: completed ? zone.color + '22' : 'var(--card)',
                    border: `1px solid ${unlocked ? zone.color + '44' : 'var(--border)'}`,
                    borderRadius: 16,
                  }}>
                    <span style={{ fontSize: 28 }}>{zone.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 800, color: unlocked ? 'var(--text)' : 'var(--text-dim)' }}>
                        {zone.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>{zone.theme}</div>
                    </div>
                    {!unlocked && <span style={{ fontSize: 18 }}>🔒</span>}
                    {completed && <span style={{ fontSize: 14, color: zone.color, fontWeight: 700 }}>✓ Complete</span>}
                  </div>

                  {/* Levels */}
                  {unlocked && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 16 }}>
                      {zone.levels.map((level, levelIdx) => {
                        const prevLevel = levelIdx > 0 ? zone.levels[levelIdx - 1] : null;
                        const levelLocked = prevLevel && !isLevelCompleted(zone.id, prevLevel.id);
                        const levelCompleted = isLevelCompleted(zone.id, level.id);
                        const isFirst = levelIdx === 0;

                        return (
                          <PathNode
                            key={level.id}
                            level={level}
                            zoneColor={zone.color}
                            completed={levelCompleted}
                            locked={!isFirst && levelLocked}
                            isBoss={false}
                            isActive={!levelCompleted && (isFirst || !levelLocked)}
                            onClick={() => startLevel(zone.id, level.id)}
                          />
                        );
                      })}

                      {/* Boss node */}
                      <PathNode
                        level={{ name: zone.bossName, skillTag: zone.bossDescription }}
                        zoneColor={zone.color}
                        completed={false}
                        locked={!isZoneCompleted(zone.id)}
                        isBoss={true}
                        isActive={isZoneCompleted(zone.id)}
                        onClick={() => startBoss(zone.id)}
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
