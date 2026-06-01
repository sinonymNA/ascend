import React from 'react';
import { motion } from 'framer-motion';
import Icon from '../ui/Icon.jsx';

/**
 * LiveStats — real-time game stats for teacher view.
 *
 * Props:
 *   players — array of { id, name, elevation, xp, answered, mastered, summited }
 */
export default function LiveStats({ players = [] }) {
  if (!players.length) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: 14,
      }}>
        Waiting for students to join…
      </div>
    );
  }

  const totalPlayers   = players.length;
  const summited       = players.filter((p) => p.summited || p.elevation >= 100).length;
  const avgElevation   = Math.round(
    players.reduce((acc, p) => acc + (p.elevation || 0), 0) / totalPlayers
  );
  const totalAnswered  = players.reduce((acc, p) => acc + (p.answered || 0), 0);
  const totalMastered  = players.reduce((acc, p) => acc + (p.mastered || 0), 0);

  const statItems = [
    { label: 'Students', value: totalPlayers, color: 'var(--text)' },
    { label: 'Summited', value: summited, color: 'var(--gold)', icon: 'mountain' },
    { label: 'Avg Elevation', value: `${avgElevation}%`, color: 'var(--pine-light)' },
    { label: 'Questions Answered', value: totalAnswered, color: 'var(--text-mid)' },
  ];

  // Sorted by elevation descending for leaderboard
  const sorted = [...players].sort((a, b) => (b.elevation || 0) - (a.elevation || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Aggregate stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 10,
      }}>
        {statItems.map((s) => (
          <div key={s.label} style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '12px 10px',
            textAlign: 'center',
          }}>
            <div style={{
              fontSize: 22,
              fontWeight: 800,
              color: s.color,
              fontFamily: 'Nunito, sans-serif',
              lineHeight: 1,
              marginBottom: 4,
            }}>
              {s.icon && <Icon name={s.icon} size={20} color={s.color} style={{ marginRight: 4 }} />}
              {s.value}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Mini leaderboard */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        overflow: 'hidden',
      }}>
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          display: 'flex',
          justifyContent: 'space-between',
        }}>
          <span>Student</span>
          <span>Elevation</span>
        </div>
        <div style={{ maxHeight: 220, overflowY: 'auto' }}>
          {sorted.map((p, i) => {
            const elev = p.elevation || 0;
            const isSummited = p.summited || elev >= 100;
            return (
              <motion.div
                key={p.id || p.name}
                layoutId={`ls-player-${p.id || p.name}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 16px',
                  borderBottom: '1px solid var(--border)',
                  background: isSummited ? 'rgba(245,166,35,0.06)' : 'transparent',
                }}
              >
                {/* Rank */}
                <span style={{
                  width: 20,
                  fontSize: 12,
                  color: i < 3 ? 'var(--gold)' : 'var(--text-muted)',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </span>

                {/* Name */}
                <span style={{
                  flex: 1,
                  fontSize: 13,
                  fontWeight: 600,
                  color: isSummited ? 'var(--gold)' : 'var(--text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}>
                  {isSummited && <Icon name="mountain" size={13} color="var(--gold)" />}{p.name}
                </span>

                {/* Elevation bar */}
                <div style={{ width: 80, position: 'relative' }}>
                  <div style={{
                    height: 6,
                    background: 'var(--bg-elevated)',
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <motion.div
                      animate={{ width: `${Math.min(100, elev)}%` }}
                      transition={{ type: 'spring', stiffness: 60, damping: 18 }}
                      style={{
                        height: '100%',
                        background: isSummited
                          ? 'var(--gold)'
                          : elev > 75
                          ? 'var(--pine-light)'
                          : 'var(--sky)',
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>

                {/* % label */}
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: isSummited ? 'var(--gold)' : 'var(--text-mid)',
                  width: 32,
                  textAlign: 'right',
                  flexShrink: 0,
                }}>
                  {Math.min(100, elev)}%
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
