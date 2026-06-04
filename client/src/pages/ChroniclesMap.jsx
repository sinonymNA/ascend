'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Icon from '../components/ui/Icon.jsx';
import WalletPill from '../components/economy/WalletPill.jsx';

// ── Chronicles of the Keep — World Map ────────────────────────────────────────

const DISTRICT_STYLE = {
  1: { color: '#C8A96E', bg: '#1a1208', emoji: '📜', label: 'Punctuation' },
  2: { color: '#C0392B', bg: '#1a0808', emoji: '⚔️', label: 'Grammar' },
  3: { color: '#4A90D9', bg: '#080e1a', emoji: '🌀', label: 'Sentence Structure' },
  4: { color: '#52B788', bg: '#081208', emoji: '🗺️', label: 'Rhetoric' },
  5: { color: '#A78BFA', bg: '#0e081a', emoji: '✨', label: 'Style' },
};

function ChapterNode({ chapter, completed, locked, isCurrent, onSelect }) {
  const isBoss = chapter.is_boss_chapter;
  return (
    <motion.button
      whileHover={locked ? {} : { scale: 1.08 }}
      whileTap={locked ? {} : { scale: 0.95 }}
      onClick={() => !locked && onSelect(chapter)}
      style={{
        background: locked
          ? 'rgba(255,255,255,0.04)'
          : completed
            ? 'rgba(82,183,136,0.15)'
            : isCurrent
              ? 'rgba(200,169,110,0.2)'
              : 'rgba(255,255,255,0.07)',
        border: locked
          ? '1px solid rgba(255,255,255,0.1)'
          : completed
            ? '1px solid rgba(82,183,136,0.5)'
            : isCurrent
              ? '1px solid rgba(200,169,110,0.6)'
              : isBoss
                ? '1px solid rgba(192,57,43,0.5)'
                : '1px solid rgba(255,255,255,0.15)',
        borderRadius: isBoss ? '12px' : '50%',
        width: isBoss ? '44px' : '38px',
        height: isBoss ? '44px' : '38px',
        cursor: locked ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        transition: 'all 0.2s',
        boxShadow: isCurrent ? '0 0 16px rgba(200,169,110,0.4)' : 'none',
      }}
      title={locked ? 'Requires subscription' : chapter.title}
    >
      {locked ? (
        <Icon name="lock" size={14} color="rgba(255,255,255,0.3)" />
      ) : completed ? (
        <span style={{ fontSize: '16px' }}>✓</span>
      ) : isBoss ? (
        <span style={{ fontSize: '18px' }}>💀</span>
      ) : (
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'rgba(255,255,255,0.8)' }}>
          {chapter.chapter_number}
        </span>
      )}

      {/* Pulse ring for current chapter */}
      {isCurrent && (
        <motion.div
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{
            position: 'absolute', inset: '-4px',
            borderRadius: isBoss ? '16px' : '50%',
            border: '2px solid rgba(200,169,110,0.6)',
            pointerEvents: 'none',
          }}
        />
      )}
    </motion.button>
  );
}

function DistrictCard({
  district, chapters, completedChapterIds, currentChapterId,
  isUnlocked, isComplete, nextChapterId, onSelectChapter,
}) {
  const [expanded, setExpanded] = useState(isUnlocked && !isComplete);
  const style = DISTRICT_STYLE[district.order_index] || DISTRICT_STYLE[1];
  const doneCount = chapters.filter((c) => completedChapterIds.has(c.id)).length;

  return (
    <div style={{
      background: `linear-gradient(135deg, ${style.bg} 0%, rgba(20,20,25,0.95) 100%)`,
      border: `1px solid ${isUnlocked ? `${style.color}40` : 'rgba(255,255,255,0.08)'}`,
      borderRadius: '14px',
      overflow: 'hidden',
      opacity: isUnlocked ? 1 : 0.55,
    }}>
      {/* District header */}
      <button
        onClick={() => isUnlocked && setExpanded((e) => !e)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: isUnlocked ? 'pointer' : 'default',
          padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
        }}
      >
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          background: `${style.color}20`, border: `1px solid ${style.color}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        }}>
          {style.emoji}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700,
            color: style.color, marginBottom: '3px',
          }}>
            District {district.order_index}: {district.name}
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
            {style.label} · {doneCount}/{chapters.length} chapters
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {isComplete && (
            <div style={{
              background: 'rgba(82,183,136,0.15)', border: '1px solid rgba(82,183,136,0.4)',
              borderRadius: '8px', padding: '3px 10px',
              fontSize: '11px', color: '#52B788', fontWeight: 700,
            }}>
              SEALED ✓
            </div>
          )}
          {!isUnlocked && (
            <Icon name="lock" size={16} color="rgba(255,255,255,0.3)" />
          )}
          {isUnlocked && (
            <motion.div animate={{ rotate: expanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
              <Icon name="chevron" size={18} color={style.color} />
            </motion.div>
          )}
        </div>
      </button>

      {/* Chapter progress bar */}
      {isUnlocked && (
        <div style={{ padding: '0 20px 0', marginBottom: expanded ? 0 : '12px' }}>
          <div style={{ height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${chapters.length ? (doneCount / chapters.length) * 100 : 0}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${style.color}80, ${style.color})`, borderRadius: '2px' }}
            />
          </div>
        </div>
      )}

      {/* Chapters expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '12px 20px 20px' }}>
              {/* Chapter lore */}
              {district.lore && (
                <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.55', fontStyle: 'italic' }}>
                  "{district.lore}"
                </p>
              )}

              {/* Chapter nodes */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
                {chapters.map((ch, i) => {
                  const done = completedChapterIds.has(ch.id);
                  const locked = ch.locked;
                  const isCurrent = ch.id === nextChapterId;
                  return (
                    <React.Fragment key={ch.id}>
                      <ChapterNode
                        chapter={ch}
                        completed={done}
                        locked={locked}
                        isCurrent={isCurrent}
                        onSelect={(c) => onSelectChapter(c, district)}
                      />
                      {i < chapters.length - 1 && (
                        <div style={{
                          width: '16px', height: '2px',
                          background: done ? `${style.color}60` : 'rgba(255,255,255,0.1)',
                          borderRadius: '1px',
                        }} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Chapter legend */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '14px', flexWrap: 'wrap' }}>
                {chapters.map((ch) => {
                  const done = completedChapterIds.has(ch.id);
                  const locked = ch.locked;
                  const isCurrent = ch.id === nextChapterId;
                  if (!isCurrent && done) return null;
                  return (
                    <div key={ch.id} style={{
                      fontSize: '11px', color: locked ? 'rgba(255,255,255,0.25)' : isCurrent ? style.color : 'rgba(255,255,255,0.5)',
                      fontWeight: 600,
                    }}>
                      {ch.is_boss_chapter ? '💀' : ch.chapter_number} {ch.title}
                      {isCurrent && !done && <span style={{ color: style.color }}> ← next</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Paywall upsell modal
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
    if (!gameId) { navigate('summit_home'); return; }
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' }}>
      Loading the map…
    </div>
  );
  if (error) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C0392B', fontFamily: 'Nunito, sans-serif' }}>
      Error: {error}
    </div>
  );

  const completedChapterIds = new Set(progress?.chapters_completed || []);
  const completedDistrictIds = new Set(progress?.districts_completed || []);

  // Find first incomplete non-locked chapter as "current"
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
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Nunito, sans-serif' }}>
      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 24px',
        background: 'var(--bg-elevated)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate('summit_home')} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: '4px 8px', fontSize: '13px', fontWeight: 600,
          }}>
            ← Shelf
          </button>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700,
            color: '#C8A96E', letterSpacing: '0.04em',
          }}>
            ⚔ {game?.title || 'Chronicles of the Keep'}
          </span>
        </div>
        <WalletPill onClick={() => navigate('shop')} />
      </nav>

      <main style={{ maxWidth: '700px', margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Overall progress bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #1a1208, #2a1f0a)',
            border: '1px solid rgba(200,169,110,0.3)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: '#C8A96E', fontWeight: 700 }}>
                Your Journey
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                {doneCount} of {totalChapters} chapters completed
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', color: '#C8A96E', fontWeight: 700 }}>{pct}%</div>
              {progress?.total_xp_earned > 0 && (
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                  {progress.total_xp_earned.toLocaleString()} XP earned
                </div>
              )}
            </div>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '3px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              style={{ height: '100%', background: 'linear-gradient(90deg, #8B6914, #C8A96E)', borderRadius: '3px' }}
            />
          </div>
        </motion.div>

        {/* Prologue link */}
        <div style={{ textAlign: 'center', marginBottom: '16px', marginTop: '-4px' }}>
          <button
            onClick={() => navigate('chronicles_prologue', { gameId, slug, prologue: game?.prologue })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '12px', color: 'rgba(200,169,110,0.6)', fontWeight: 600,
              letterSpacing: '0.04em', textDecoration: 'underline', textDecorationColor: 'rgba(200,169,110,0.3)',
            }}
          >
            📜 Re-read the Prologue
          </button>
        </div>

        {/* Districts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {districts.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.3 }}
            >
              <DistrictCard
                district={d}
                chapters={d.chapters || []}
                completedChapterIds={completedChapterIds}
                currentChapterId={progress?.current_chapter_id}
                isUnlocked={d.unlocked !== false}
                isComplete={completedDistrictIds.has(d.id)}
                nextChapterId={nextChapterId}
                onSelectChapter={handleSelectChapter}
              />
            </motion.div>
          ))}
        </div>

        {/* Game complete banner */}
        {progress?.completed_at && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              marginTop: '20px',
              background: 'linear-gradient(135deg, rgba(82,183,136,0.1), rgba(82,183,136,0.2))',
              border: '1px solid rgba(82,183,136,0.5)',
              borderRadius: '14px', padding: '20px 24px', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '17px', color: '#52B788', fontWeight: 700 }}>
              Chronicles Complete!
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '6px' }}>
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
