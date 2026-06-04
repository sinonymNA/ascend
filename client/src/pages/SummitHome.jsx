'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Icon from '../components/ui/Icon.jsx';
import WalletPill from '../components/economy/WalletPill.jsx';

// ── The Shelf — EduMissions game selector ─────────────────────────────────────

const GAME_META = {
  'chronicles-of-the-keep': {
    subtitle: 'ACT English',
    tagline: 'Master grammar, punctuation & rhetoric by battling the forces of bad writing',
    accent: '#C8A96E',
    accentDark: '#8B6914',
    bgGradient: 'linear-gradient(135deg, #1a1208 0%, #2a1f0a 50%, #1a1208 100%)',
    districts: ['The Comma Fortress', 'The Grammar Citadel', 'The Modifier Maze', 'The Rhetoric Realm', 'The Style Summit'],
    districtColors: ['#8B6914', '#C0392B', '#1A5276', '#117A65', '#6C3483'],
  },
};

const COMING_SOON = [
  { id: 'chronicles-of-calculus', title: 'Chronicles of Calculus', subject: 'ACT Math', icon: 'ruler', color: '#1A5276' },
  { id: 'the-reading-realm', title: 'The Reading Realm', subject: 'ACT Reading', icon: 'book', color: '#117A65' },
];

function ProgressRing({ pct = 0, size = 48, color = '#C8A96E' }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={5}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

function GameCard({ game, meta, playerProgress, onPlay }) {
  const chapsDone = playerProgress?.chapters_done || 0;
  const total = game.total_chapters || 22;
  const pct = Math.round((chapsDone / total) * 100);
  const started = chapsDone > 0;
  const complete = playerProgress?.completed_at;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 24px 60px rgba(0,0,0,0.7), 0 0 30px ${meta.accent}30` }}
      whileTap={{ scale: 0.98 }}
      onClick={onPlay}
      style={{
        background: meta.bgGradient,
        border: `1px solid ${meta.accent}40`,
        borderRadius: '16px',
        padding: '28px',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Parchment texture overlay */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '16px', pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px)',
      }} />

      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative' }}>
        {/* Cartridge art */}
        <div style={{
          width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0,
          background: `linear-gradient(135deg, ${meta.accentDark}, ${meta.accent})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 20px ${meta.accentDark}80`,
          border: `2px solid ${meta.accent}60`,
        }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>⚔</span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: 700,
              color: meta.accent, letterSpacing: '0.04em',
            }}>
              {game.title}
            </span>
            {complete && (
              <span style={{
                background: 'rgba(82,183,136,0.2)', border: '1px solid #52B788',
                color: '#52B788', borderRadius: '8px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
              }}>COMPLETE</span>
            )}
          </div>
          <div style={{ fontSize: '12px', color: meta.accent, opacity: 0.7, fontWeight: 600, marginBottom: '8px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            {game.subject}
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.5', maxWidth: '520px' }}>
            {meta.tagline}
          </p>
        </div>

        {/* Progress ring */}
        <div style={{ position: 'relative', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <ProgressRing pct={pct} color={meta.accent} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-56%)', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: meta.accent }}>{pct}%</div>
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, textAlign: 'center' }}>
            {chapsDone}/{total}
          </div>
        </div>
      </div>

      {/* District pills */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '20px', flexWrap: 'wrap', position: 'relative' }}>
        {meta.districts.map((d, i) => (
          <div key={i} style={{
            background: `${meta.districtColors[i]}22`,
            border: `1px solid ${meta.districtColors[i]}55`,
            borderRadius: '20px', padding: '3px 10px',
            fontSize: '11px', color: `${meta.districtColors[i]}cc`, fontWeight: 600,
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{
        marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative',
      }}>
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
          {game.estimated_hours}h · {game.total_encounters} encounters · {game.free_chapters} free
        </div>
        <motion.div
          whileHover={{ x: 4 }}
          style={{
            background: `linear-gradient(135deg, ${meta.accentDark}, ${meta.accent})`,
            borderRadius: '10px', padding: '8px 20px',
            fontSize: '13px', fontWeight: 800, color: '#1a1208',
            letterSpacing: '0.04em',
            boxShadow: `0 4px 12px ${meta.accentDark}80`,
          }}
        >
          {started ? (complete ? 'Play Again' : 'Continue') : 'Begin Adventure'} →
        </motion.div>
      </div>
    </motion.div>
  );
}

function ComingSoonCard({ game }) {
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      padding: '24px 28px',
      opacity: 0.55,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '12px', right: '12px',
        background: 'rgba(255,255,255,0.08)', borderRadius: '8px',
        padding: '3px 10px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700,
        letterSpacing: '0.08em',
      }}>COMING SOON</div>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '10px',
          background: `${game.color}22`, border: `1px solid ${game.color}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name={game.icon} size={24} color={game.color} />
        </div>
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', marginBottom: '3px' }}>
            {game.title}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {game.subject}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SummitHome() {
  const { navigate } = useApp();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/edumissions/games')
      .then((data) => setGames(data.games || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Build progress map
  const progByGameId = {};
  // (games already include player progress from API)

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'Nunito, sans-serif',
    }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('student_dashboard')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px 8px', fontSize: '13px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            ← Back
          </button>
          <div style={{
            width: '1px', height: '20px', background: 'var(--border)',
          }} />
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: '17px', fontWeight: 700,
            color: '#C8A96E', letterSpacing: '0.06em',
          }}>
            ⚔ EduMissions
          </span>
        </div>
        <WalletPill onClick={() => navigate('shop')} />
      </nav>

      <main style={{ maxWidth: '820px', margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '32px', textAlign: 'center' }}
        >
          <h1 style={{
            fontFamily: 'Cinzel, serif', fontSize: '28px', fontWeight: 700,
            color: '#C8A96E', margin: '0 0 8px', letterSpacing: '0.06em',
          }}>
            The Shelf
          </h1>
          <p style={{ margin: 0, fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Story-driven games that make test prep legendary
          </p>
        </motion.div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            Loading adventures…
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Available games */}
            {games.map((game, i) => {
              const meta = GAME_META[game.slug] || GAME_META['chronicles-of-the-keep'];
              return (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.35 }}
                >
                  <GameCard
                    game={game}
                    meta={meta}
                    playerProgress={game.player}
                    onPlay={() => {
                      const prog = game.player;
                      if (!prog || prog.chapters_done === 0) {
                        navigate('chronicles_prologue', { gameId: game.id, slug: game.slug, prologue: game.prologue });
                      } else {
                        navigate('chronicles_map', { gameId: game.id, slug: game.slug });
                      }
                    }}
                  />
                </motion.div>
              );
            })}

            {/* Coming soon */}
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                More adventures coming
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {COMING_SOON.map((g) => <ComingSoonCard key={g.id} game={g} />)}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
