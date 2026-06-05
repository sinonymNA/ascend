'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Icon from '../components/ui/Icon.jsx';
import WalletPill from '../components/economy/WalletPill.jsx';

// ── Per-district terrain themes ───────────────────────────────────────────────

const TERRAIN = {
  1: {
    accent: '#C9922A',
    dim: '#7A4A10',
    terrainBg: 'linear-gradient(170deg, rgba(90,18,18,0.28) 0%, rgba(6,4,3,0.96) 70%)',
    ambientPos: '20% 30%',
    terrainLabel: 'Ruined City',
    icon: '🏚',
    pathGlow: 'rgba(201,146,42,0.55)',
  },
  2: {
    accent: '#4A90D9',
    dim: '#1A4A80',
    terrainBg: 'linear-gradient(170deg, rgba(12,30,90,0.28) 0%, rgba(4,5,10,0.96) 70%)',
    ambientPos: '80% 30%',
    terrainLabel: 'Grand Guildhall',
    icon: '🏛',
    pathGlow: 'rgba(74,144,217,0.5)',
  },
  3: {
    accent: '#52B788',
    dim: '#1A5A38',
    terrainBg: 'linear-gradient(170deg, rgba(12,70,28,0.28) 0%, rgba(4,8,5,0.96) 70%)',
    ambientPos: '25% 50%',
    terrainLabel: 'Murk Marshes',
    icon: '🌿',
    pathGlow: 'rgba(82,183,136,0.5)',
  },
  4: {
    accent: '#A78BFA',
    dim: '#4A2A90',
    terrainBg: 'linear-gradient(170deg, rgba(38,18,80,0.28) 0%, rgba(5,4,9,0.96) 70%)',
    ambientPos: '75% 25%',
    terrainLabel: 'Ancient Ruins',
    icon: '🗿',
    pathGlow: 'rgba(167,139,250,0.5)',
  },
  5: {
    accent: '#F5A623',
    dim: '#7A4A08',
    terrainBg: 'linear-gradient(170deg, rgba(80,50,12,0.3) 0%, rgba(8,6,4,0.96) 65%)',
    ambientPos: '50% 10%',
    terrainLabel: 'High Citadel',
    icon: '⛰',
    pathGlow: 'rgba(245,166,35,0.55)',
  },
};

// ── Chapter map pin ───────────────────────────────────────────────────────────

function ChapterPin({ chapter, done, isCurrent, locked, isBoss, terrain, onClick }) {
  const pinSize = isBoss ? 62 : 52;

  return (
    <motion.button
      onClick={!locked ? onClick : undefined}
      whileHover={!locked ? { scale: 1.12 } : {}}
      whileTap={!locked ? { scale: 0.92 } : {}}
      style={{
        background: 'none', border: 'none', padding: 0,
        cursor: locked ? 'default' : 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
        width: 120,
      }}
    >
      {/* Pulse rings for current chapter */}
      <div style={{ position: 'relative', width: pinSize, height: pinSize }}>
        {isCurrent && (
          <>
            <motion.div
              animate={{ scale: [1, 1.9], opacity: [0.55, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
              style={{
                position: 'absolute', inset: -4,
                borderRadius: isBoss ? '16px' : '50%',
                border: `2px solid ${terrain.accent}`,
                pointerEvents: 'none',
              }}
            />
            <motion.div
              animate={{ scale: [1, 2.6], opacity: [0.25, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
              style={{
                position: 'absolute', inset: -4,
                borderRadius: isBoss ? '16px' : '50%',
                border: `2px solid ${terrain.accent}`,
                pointerEvents: 'none',
              }}
            />
          </>
        )}

        {/* Pin body */}
        <div style={{
          width: '100%', height: '100%',
          borderRadius: isBoss ? '14px' : '50%',
          background: done
            ? `linear-gradient(135deg, ${terrain.dim}, ${terrain.accent})`
            : isCurrent
              ? `linear-gradient(135deg, ${terrain.dim}AA, ${terrain.accent}AA)`
              : locked
                ? 'rgba(255,255,255,0.04)'
                : isBoss
                  ? 'rgba(192,57,43,0.08)'
                  : 'rgba(255,255,255,0.07)',
          border: `2px solid ${
            done ? terrain.accent :
            isCurrent ? `${terrain.accent}90` :
            locked ? 'rgba(255,255,255,0.08)' :
            isBoss ? 'rgba(192,57,43,0.45)' :
            'rgba(255,255,255,0.14)'
          }`,
          boxShadow: done
            ? `0 0 18px ${terrain.pathGlow}, 0 2px 8px rgba(0,0,0,0.6)`
            : isCurrent
              ? `0 0 28px ${terrain.pathGlow}, 0 0 60px ${terrain.accent}22`
              : 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isBoss ? 26 : 20,
          fontWeight: 800,
          fontFamily: 'Cinzel, serif',
          color: done ? '#fff' : locked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
          transition: 'all 0.25s',
          position: 'relative',
        }}>
          {locked ? (
            <Icon name="lock" size={18} color="rgba(255,255,255,0.22)" />
          ) : done ? (
            <span style={{ color: '#fff', fontSize: isBoss ? 26 : 20 }}>✓</span>
          ) : isBoss ? (
            '💀'
          ) : (
            chapter.chapter_number
          )}
        </div>
      </div>

      {/* Label */}
      <div style={{
        fontSize: 10, fontWeight: 700,
        color: done
          ? terrain.accent
          : isCurrent
            ? `${terrain.accent}DD`
            : locked
              ? 'rgba(255,255,255,0.18)'
              : 'rgba(255,255,255,0.42)',
        textAlign: 'center',
        lineHeight: 1.35,
        maxWidth: 112,
        fontFamily: 'Nunito, sans-serif',
      }}>
        {isBoss && !locked ? '⚔ ' : ''}{chapter.title}
        {isCurrent && (
          <span style={{
            display: 'block', marginTop: 2,
            color: terrain.accent, fontSize: 9, fontStyle: 'italic',
          }}>
            ← enter
          </span>
        )}
      </div>
    </motion.button>
  );
}

// ── Winding chapter path within a district ────────────────────────────────────

function DistrictPath({ chapters, completedChapterIds, nextChapterId, terrain, onSelectChapter }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Vertical road down the center */}
      <div style={{
        position: 'absolute',
        left: '50%', top: 0, bottom: 0,
        width: 2,
        background: `linear-gradient(180deg, ${terrain.accent}45 0%, ${terrain.accent}18 100%)`,
        transform: 'translateX(-50%)',
        borderRadius: 1,
      }} />

      {chapters.map((ch, i) => {
        const done = completedChapterIds.has(ch.id);
        const prevDone = i > 0 && completedChapterIds.has(chapters[i - 1].id);
        const isCurrent = ch.id === nextChapterId;
        const locked = ch.locked;
        const isBoss = ch.is_boss_chapter;
        const isLeft = i % 2 === 0;
        const connectorColor = done || prevDone
          ? `${terrain.accent}55`
          : 'rgba(255,255,255,0.07)';

        return (
          <div key={ch.id} style={{
            display: 'flex', alignItems: 'center',
            minHeight: 112,
            width: '100%',
          }}>
            {isLeft ? (
              <>
                {/* Chapter on the left */}
                <div style={{ width: 'calc(50% - 14px)', display: 'flex', justifyContent: 'flex-end', paddingRight: 6 }}>
                  <ChapterPin
                    chapter={ch}
                    done={done}
                    isCurrent={isCurrent}
                    locked={locked}
                    isBoss={isBoss}
                    terrain={terrain}
                    onClick={() => onSelectChapter(ch)}
                  />
                </div>
                {/* Horizontal connector to road */}
                <div style={{
                  width: 28, height: 2,
                  background: connectorColor,
                  borderRadius: 1, flexShrink: 0,
                }} />
                {/* Right half spacer */}
                <div style={{ flex: 1 }} />
              </>
            ) : (
              <>
                {/* Left half spacer */}
                <div style={{ flex: 1 }} />
                {/* Horizontal connector from road */}
                <div style={{
                  width: 28, height: 2,
                  background: connectorColor,
                  borderRadius: 1, flexShrink: 0,
                }} />
                {/* Chapter on the right */}
                <div style={{ width: 'calc(50% - 14px)', display: 'flex', justifyContent: 'flex-start', paddingLeft: 6 }}>
                  <ChapterPin
                    chapter={ch}
                    done={done}
                    isCurrent={isCurrent}
                    locked={locked}
                    isBoss={isBoss}
                    terrain={terrain}
                    onClick={() => onSelectChapter(ch)}
                  />
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── District map zone ─────────────────────────────────────────────────────────

function DistrictMapZone({ district, chapters, completedChapterIds, nextChapterId, isUnlocked, isComplete, onSelectChapter, animDelay }) {
  const order = district.order_index;
  const terrain = TERRAIN[order] || TERRAIN[1];
  const doneCount = chapters.filter((c) => completedChapterIds.has(c.id)).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.4 }}
      style={{
        position: 'relative',
        background: terrain.terrainBg,
        borderRadius: 18,
        overflow: 'hidden',
        border: `1px solid ${isUnlocked ? `${terrain.accent}20` : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {/* Ambient corner glow */}
      <div style={{
        position: 'absolute',
        top: -50, left: terrain.ambientPos.startsWith('2') || terrain.ambientPos.startsWith('1') ? -30 : undefined,
        right: terrain.ambientPos.startsWith('7') || terrain.ambientPos.startsWith('8') ? -30 : undefined,
        width: 220, height: 220, pointerEvents: 'none',
        background: `radial-gradient(circle, ${terrain.accent}0F 0%, transparent 70%)`,
      }} />

      {/* Fog of war for locked districts */}
      {!isUnlocked && (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'rgba(4,3,2,0.82)',
          backdropFilter: 'blur(5px)',
          zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <div style={{ fontSize: 30, opacity: 0.4 }}>🌫</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 14, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.06em' }}>
            {district.name}
          </div>
          <div style={{
            fontSize: 9.5, color: 'rgba(255,255,255,0.22)', fontWeight: 700,
            letterSpacing: '0.14em', textTransform: 'uppercase',
          }}>
            Complete District {order - 1} to reveal
          </div>
        </div>
      )}

      {/* District header */}
      <div style={{ padding: '22px 22px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9.5, fontWeight: 800, letterSpacing: '0.22em',
              color: terrain.accent, opacity: 0.65,
              textTransform: 'uppercase', marginBottom: 5,
              fontFamily: 'Nunito, sans-serif',
            }}>
              District {order} · {terrain.terrainLabel}
            </div>
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700,
              color: terrain.accent, lineHeight: 1.15, letterSpacing: '0.04em',
            }}>
              {district.name}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 6 }}>
            {isComplete ? (
              <div style={{
                background: `${terrain.accent}15`,
                border: `1px solid ${terrain.accent}45`,
                borderRadius: 8, padding: '4px 10px',
                fontSize: 9.5, color: terrain.accent, fontWeight: 800,
                letterSpacing: '0.1em',
              }}>
                ✓ SEALED
              </div>
            ) : isUnlocked ? (
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: 13,
                color: terrain.accent, fontWeight: 700, opacity: 0.75,
              }}>
                {doneCount}/{chapters.length}
              </div>
            ) : null}

            <div style={{ fontSize: 22 }}>{terrain.icon}</div>
          </div>
        </div>

        {/* District lore */}
        {district.lore && isUnlocked && (
          <p style={{
            fontFamily: 'Georgia, serif',
            fontSize: 11.5, fontStyle: 'italic',
            color: 'rgba(255,255,255,0.35)',
            lineHeight: 1.65, margin: '12px 0 0',
          }}>
            "{district.lore}"
          </p>
        )}

        {/* District progress bar */}
        {isUnlocked && chapters.length > 0 && (
          <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 1, overflow: 'hidden', marginTop: 14 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(doneCount / chapters.length) * 100}%` }}
              transition={{ delay: animDelay + 0.2, duration: 0.9, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${terrain.dim}, ${terrain.accent})`,
                borderRadius: 1,
                boxShadow: `0 0 6px ${terrain.pathGlow}`,
              }}
            />
          </div>
        )}
      </div>

      {/* Chapter map path */}
      <div style={{ padding: '6px 22px 28px' }}>
        <DistrictPath
          chapters={chapters}
          completedChapterIds={completedChapterIds}
          nextChapterId={nextChapterId}
          terrain={terrain}
          onSelectChapter={onSelectChapter}
        />
      </div>
    </motion.div>
  );
}

// ── Between-district path connector ──────────────────────────────────────────

function PathConnector({ fromAccent, toAccent, done }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      height: 36, position: 'relative',
    }}>
      <div style={{
        width: 2, height: 36,
        background: done
          ? `linear-gradient(180deg, ${fromAccent}55, ${toAccent}55)`
          : 'rgba(255,255,255,0.07)',
        borderRadius: 1,
      }} />
      <div style={{
        position: 'absolute', width: 18, height: 18,
        background: 'rgba(8,6,4,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, color: 'rgba(255,255,255,0.25)',
      }}>
        ↓
      </div>
    </div>
  );
}

// ── Paywall modal ─────────────────────────────────────────────────────────────

function PaywallModal({ chapter, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #1a1208, #2a1f0a)',
          border: '1px solid rgba(200,169,110,0.5)',
          borderRadius: '20px',
          padding: '36px 32px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', color: '#C8A96E', margin: '0 0 12px' }}>
          Premium Chapter
        </h2>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.6', margin: '0 0 24px' }}>
          <strong style={{ color: '#C8A96E' }}>{chapter.title}</strong> is part of Summit Premium.
          Chapter 1 of each game is always free. Upgrade to unlock all 22 chapters and 445 encounters.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.7)', borderRadius: '10px',
              padding: '10px 20px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Not now
          </button>
          <button
            style={{
              background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
              border: 'none', color: '#1a1208',
              borderRadius: '10px', padding: '10px 24px',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer',
            }}
          >
            Upgrade to Premium ✦
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ChroniclesMap() {
  const { navigate, screenParams } = useApp();
  const { gameId, slug } = screenParams;

  const [game, setGame] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paywallChapter, setPaywallChapter] = useState(null);

  useEffect(() => {
    if (!gameId) { navigate('student_dashboard'); return; }
    api.get(`/api/edumissions/games/${gameId}`)
      .then((data) => {
        setGame(data.game);
        setDistricts(data.districts || []);
        setProgress(data.progress);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [gameId]);

  function handleSelectChapter(chapter, district) {
    if (chapter.locked) {
      setPaywallChapter(chapter);
      return;
    }
    navigate('chronicles_battle', {
      chapterId: chapter.id,
      gameId,
      districtColor: district?.color_primary,
      districtSecondary: district?.color_secondary,
      districtName: district?.name,
    });
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(200,169,110,0.5)', fontFamily: 'Nunito, sans-serif', fontSize: 14 }}>
      Charting the map…
    </div>
  );
  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0392B', fontFamily: 'Nunito, sans-serif' }}>
      Error: {error}
    </div>
  );

  const completedChapterIds = new Set(progress?.chapters_completed || []);
  const completedDistrictIds = new Set(progress?.districts_completed || []);

  let nextChapterId = null;
  for (const d of districts) {
    for (const ch of (d.chapters || [])) {
      if (!completedChapterIds.has(ch.id) && !ch.locked) {
        nextChapterId = ch.id;
        break;
      }
    }
    if (nextChapterId) break;
  }

  const totalChapters = districts.reduce((s, d) => s + (d.chapters?.length || 0), 0);
  const doneCount = completedChapterIds.size;
  const pct = totalChapters ? Math.round((doneCount / totalChapters) * 100) : 0;

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Nunito, sans-serif',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(18,10,4,0.98) 0%, rgba(5,4,3,1) 55%)',
    }}>
      {/* ── Sticky navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(6,5,3,0.9)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(200,169,110,0.1)',
      }}>
        <button
          onClick={() => navigate('student_dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.45)', padding: '4px 8px',
            fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ← Games
        </button>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700,
          color: '#C8A96E', letterSpacing: '0.06em',
        }}>
          ⚔ {game?.title || 'Chronicles of the Keep'}
        </span>
        <WalletPill onClick={() => navigate('shop')} />
      </nav>

      {/* ── Journey progress strip ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          maxWidth: 700, margin: '0 auto',
          padding: '16px 20px 0',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(28,18,6,0.9), rgba(20,12,4,0.85))',
          border: '1px solid rgba(200,169,110,0.18)',
          borderRadius: 14,
          padding: '14px 18px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, color: '#C8A96E', fontWeight: 700, letterSpacing: '0.04em' }}>
                Your Journey
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.38)', marginTop: 2, fontWeight: 600 }}>
                {doneCount} of {totalChapters} chapters explored
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#C8A96E', fontWeight: 700, lineHeight: 1 }}>
                {pct}%
              </div>
              {(progress?.total_xp_earned || 0) > 0 && (
                <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.3)', fontWeight: 600, marginTop: 2 }}>
                  {progress.total_xp_earned.toLocaleString()} XP
                </div>
              )}
            </div>
          </div>

          {/* Overall progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.3, duration: 0.9, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #6B4A10, #C8A96E)',
                borderRadius: 2,
                boxShadow: '0 0 8px rgba(200,169,110,0.4)',
              }}
            />
          </div>

          {/* Prologue link */}
          <div style={{ marginTop: 10, textAlign: 'right' }}>
            <button
              onClick={() => navigate('chronicles_prologue', { gameId, slug, prologue: game?.prologue })}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, color: 'rgba(200,169,110,0.45)', fontWeight: 600,
                fontFamily: 'Nunito, sans-serif',
                textDecoration: 'underline',
                textDecorationColor: 'rgba(200,169,110,0.2)',
              }}
            >
              📜 Re-read the Prologue
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Map: districts ── */}
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '16px 12px 80px' }}>
        {districts.map((d, i) => {
          const terrain = TERRAIN[d.order_index] || TERRAIN[1];
          const prevDistrict = i > 0 ? districts[i - 1] : null;
          const prevTerrain = prevDistrict ? (TERRAIN[prevDistrict.order_index] || TERRAIN[1]) : null;

          return (
            <React.Fragment key={d.id}>
              {i > 0 && (
                <PathConnector
                  fromAccent={prevTerrain?.accent || '#C8A96E'}
                  toAccent={terrain.accent}
                  done={completedDistrictIds.has(prevDistrict.id)}
                />
              )}
              <DistrictMapZone
                district={d}
                chapters={d.chapters || []}
                completedChapterIds={completedChapterIds}
                nextChapterId={nextChapterId}
                isUnlocked={d.unlocked !== false}
                isComplete={completedDistrictIds.has(d.id)}
                onSelectChapter={(ch) => handleSelectChapter(ch, d)}
                animDelay={i * 0.1}
              />
            </React.Fragment>
          );
        })}

        {/* Game complete banner */}
        {progress?.completed_at && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: 16,
              background: 'linear-gradient(135deg, rgba(82,183,136,0.12), rgba(82,183,136,0.2))',
              border: '1px solid rgba(82,183,136,0.45)',
              borderRadius: 16, padding: '24px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 17, color: '#52B788', fontWeight: 700 }}>
              Chronicles Complete!
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 6 }}>
              You have defeated all five Wardens and restored the Keep.
            </div>
          </motion.div>
        )}
      </main>

      {/* Paywall modal */}
      <AnimatePresence>
        {paywallChapter && (
          <PaywallModal chapter={paywallChapter} onClose={() => setPaywallChapter(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
