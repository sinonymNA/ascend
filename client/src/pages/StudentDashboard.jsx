'use client';
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import WalletPill from '../components/economy/WalletPill.jsx';

// ── NES Cartridge data ────────────────────────────────────────────────────────

const CARTRIDGES = [
  {
    id: 'act-english',
    name: 'ACT English',
    gameName: 'Chronicles of the Keep',
    tagline: 'Grammar · Punctuation · Rhetoric',
    icon: '⚔️',
    subject: 'ACT',
    bodyColor: '#3B1D07',
    labelGradient: 'linear-gradient(155deg, #281408 0%, #462610 55%, #351C09 100%)',
    accent: '#C8A96E',
    live: true,
    slug: 'chronicles-of-the-keep',
  },
  {
    id: 'act-math',
    name: 'ACT Math',
    gameName: 'Chronicles of Calculus',
    tagline: 'Algebra · Geometry · Trigonometry',
    icon: '📐',
    subject: 'ACT',
    bodyColor: '#071630',
    labelGradient: 'linear-gradient(155deg, #06102A 0%, #0B1E40 55%, #081428 100%)',
    accent: '#4A90D9',
    live: false,
  },
  {
    id: 'sat',
    name: 'SAT',
    gameName: "The Scholar's Codex",
    tagline: 'Reading · Writing · Math',
    icon: '📜',
    subject: 'SAT',
    bodyColor: '#082408',
    labelGradient: 'linear-gradient(155deg, #061A06 0%, #0B2C0B 55%, #092009 100%)',
    accent: '#52B788',
    live: false,
  },
  {
    id: 'ap-world',
    name: 'AP World History',
    gameName: 'Summit Write',
    tagline: 'Write · Climb · Master',
    icon: '🌍',
    subject: 'AP',
    bodyColor: '#150726',
    labelGradient: 'linear-gradient(155deg, #100520 0%, #1A0A30 55%, #140826 100%)',
    accent: '#A78BFA',
    live: true,
    module: 'write',
  },
  {
    id: 'ap-chemistry',
    name: 'AP Chemistry',
    gameName: "The Alchemist's Guild",
    tagline: 'Reactions · Bonding · Equilibrium',
    icon: '⚗️',
    subject: 'AP',
    bodyColor: '#250808',
    labelGradient: 'linear-gradient(155deg, #1A0606 0%, #2E0B0B 55%, #220808 100%)',
    accent: '#E05A4A',
    live: false,
  },
];

// ── Vine SVG decorations ──────────────────────────────────────────────────────

function VineLeft() {
  return (
    <motion.svg
      width="115" height="500" viewBox="0 0 115 500" fill="none"
      style={{ position: 'absolute', left: -14, top: 0, pointerEvents: 'none', zIndex: 1 }}
      initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 1.8 }}
    >
      <motion.g
        animate={{ rotate: [-0.7, 0.7, -0.7] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '15px 490px' }}
      >
        <path d="M15 490 C18 458 34 440 22 408 C10 376 4 352 20 318 C36 284 58 270 42 234 C26 198 11 178 28 144 C45 110 68 100 52 66 C36 32 18 18 26 -8"
          stroke="#2D5C1E" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M22 408 C50 392 72 372 78 349" stroke="#2D5C1E" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M42 234 C68 218 88 198 92 174" stroke="#2D5C1E" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M28 144 C4 130 -6 110 2 90" stroke="#2D5C1E" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M78 349 C94 334 100 316 86 306 C72 296 64 308 74 315" stroke="#2D5C1E" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M92 174 C108 160 114 142 100 134" stroke="#2D5C1E" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M26 -8 C42 -22 58 -20 50 -8" stroke="#2D5C1E" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="80" cy="357" rx="30" ry="14" fill="#3A7828" fillOpacity="0.92" transform="rotate(-44 80 357)" />
        <ellipse cx="50" cy="334" rx="22" ry="10" fill="#4A9235" fillOpacity="0.82" transform="rotate(22 50 334)" />
        <ellipse cx="94" cy="182" rx="28" ry="13" fill="#3A7828" fillOpacity="0.92" transform="rotate(37 94 182)" />
        <ellipse cx="58" cy="160" rx="21" ry="9.5" fill="#4A9235" fillOpacity="0.78" transform="rotate(-18 58 160)" />
        <ellipse cx="2" cy="98" rx="26" ry="12" fill="#3A7828" fillOpacity="0.88" transform="rotate(-28 2 98)" />
        <ellipse cx="22" cy="76" rx="19" ry="8.5" fill="#5AAC40" fillOpacity="0.72" transform="rotate(32 22 76)" />
        <ellipse cx="15" cy="432" rx="22" ry="10" fill="#3A7828" fillOpacity="0.82" transform="rotate(38 15 432)" />
        <ellipse cx="54" cy="66" rx="18" ry="8" fill="#4A9235" fillOpacity="0.75" transform="rotate(-12 54 66)" />
        <circle cx="84" cy="346" r="5" fill="#C8A96E" fillOpacity="0.78" />
        <circle cx="98" cy="134" r="4.5" fill="#C8A96E" fillOpacity="0.68" />
        <circle cx="26" cy="-8" r="6" fill="#C8A96E" fillOpacity="0.72" />
        <circle cx="74" cy="315" r="3.5" fill="#8BC35A" fillOpacity="0.68" />
        <circle cx="100" cy="142" r="3.5" fill="#8BC35A" fillOpacity="0.65" />
        <circle cx="2" cy="90" r="3" fill="#C8A96E" fillOpacity="0.58" />
      </motion.g>
    </motion.svg>
  );
}

function VineRight() {
  return (
    <motion.svg
      width="115" height="500" viewBox="0 0 115 500" fill="none"
      style={{ position: 'absolute', right: -14, top: 0, pointerEvents: 'none', zIndex: 1 }}
      initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 1.8, delay: 0.4 }}
    >
      <motion.g
        animate={{ rotate: [0.7, -0.7, 0.7] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '100px 490px' }}
      >
        <path d="M100 490 C97 458 81 440 93 408 C105 376 111 352 95 318 C79 284 57 270 73 234 C89 198 104 178 87 144 C70 110 47 100 63 66 C79 32 97 18 89 -8"
          stroke="#2D5C1E" strokeWidth="3.8" strokeLinecap="round" />
        <path d="M93 408 C65 392 43 372 37 349" stroke="#2D5C1E" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M73 234 C47 218 27 198 23 174" stroke="#2D5C1E" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M87 144 C111 130 121 110 113 90" stroke="#2D5C1E" strokeWidth="2.1" strokeLinecap="round" />
        <path d="M37 349 C21 334 15 316 29 306 C43 296 51 308 41 315" stroke="#2D5C1E" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M23 174 C7 160 1 142 15 134" stroke="#2D5C1E" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M89 -8 C73 -22 57 -20 65 -8" stroke="#2D5C1E" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="35" cy="357" rx="30" ry="14" fill="#3A7828" fillOpacity="0.92" transform="rotate(44 35 357)" />
        <ellipse cx="65" cy="334" rx="22" ry="10" fill="#4A9235" fillOpacity="0.82" transform="rotate(-22 65 334)" />
        <ellipse cx="21" cy="182" rx="28" ry="13" fill="#3A7828" fillOpacity="0.92" transform="rotate(-37 21 182)" />
        <ellipse cx="57" cy="160" rx="21" ry="9.5" fill="#4A9235" fillOpacity="0.78" transform="rotate(18 57 160)" />
        <ellipse cx="113" cy="98" rx="26" ry="12" fill="#3A7828" fillOpacity="0.88" transform="rotate(28 113 98)" />
        <ellipse cx="93" cy="76" rx="19" ry="8.5" fill="#5AAC40" fillOpacity="0.72" transform="rotate(-32 93 76)" />
        <ellipse cx="100" cy="432" rx="22" ry="10" fill="#3A7828" fillOpacity="0.82" transform="rotate(-38 100 432)" />
        <ellipse cx="61" cy="66" rx="18" ry="8" fill="#4A9235" fillOpacity="0.75" transform="rotate(12 61 66)" />
        <circle cx="31" cy="346" r="5" fill="#C8A96E" fillOpacity="0.78" />
        <circle cx="17" cy="134" r="4.5" fill="#C8A96E" fillOpacity="0.68" />
        <circle cx="89" cy="-8" r="6" fill="#C8A96E" fillOpacity="0.72" />
        <circle cx="41" cy="315" r="3.5" fill="#8BC35A" fillOpacity="0.68" />
        <circle cx="15" cy="142" r="3.5" fill="#8BC35A" fillOpacity="0.65" />
        <circle cx="113" cy="90" r="3" fill="#C8A96E" fillOpacity="0.58" />
      </motion.g>
    </motion.svg>
  );
}

// ── NES Cartridge card ────────────────────────────────────────────────────────

function NESCartridge({ cart, gameData, playerProgress, onClick, animDelay = 0 }) {
  const isLocked = !cart.live;
  const chapsDone = playerProgress?.chapters_done || 0;
  const totalChaps = gameData?.total_chapters || 22;
  const pct = isLocked ? 0 : Math.round((chapsDone / totalChaps) * 100);
  const started = !isLocked && chapsDone > 0;

  return (
    <motion.div
      onClick={!isLocked ? onClick : undefined}
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animDelay, duration: 0.45, ease: 'easeOut' }}
      whileHover={!isLocked ? { y: -18, transition: { duration: 0.22 } } : { opacity: 0.8 }}
      whileTap={!isLocked ? { y: -6, scale: 0.97 } : {}}
      style={{
        cursor: isLocked ? 'default' : 'pointer',
        width: '100%',
        userSelect: 'none',
        filter: isLocked ? 'saturate(0.28) brightness(0.55)' : 'none',
      }}
    >
      {/* Outer plastic shell */}
      <div style={{
        background: cart.bodyColor,
        borderRadius: '14px 14px 5px 5px',
        padding: '7px 7px 0',
        boxShadow: isLocked
          ? '0 6px 18px rgba(0,0,0,0.7)'
          : `0 18px 50px ${cart.accent}30, 0 6px 16px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.07)`,
        border: `1px solid ${isLocked ? 'rgba(255,255,255,0.05)' : `${cart.accent}22`}`,
        position: 'relative',
      }}>
        {/* Top indent notch */}
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 52, height: 7,
          background: `linear-gradient(180deg, rgba(0,0,0,0.6), ${cart.bodyColor})`,
          borderRadius: '0 0 10px 10px',
        }} />
        {/* Side ridges */}
        <div style={{ position: 'absolute', left: 3, top: 16, bottom: 8, width: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', right: 3, top: 16, bottom: 8, width: 3, background: 'rgba(255,255,255,0.04)', borderRadius: 2 }} />

        {/* Label */}
        <div style={{
          background: cart.labelGradient,
          borderRadius: '8px 8px 0 0',
          padding: '13px 11px 14px',
          minHeight: 200,
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.04)',
          borderBottom: 'none',
        }}>
          {/* Scanlines */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '8px 8px 0 0',
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.012) 3px, rgba(255,255,255,0.012) 4px)',
          }} />

          {/* Publisher strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: 7.5, fontWeight: 900, letterSpacing: '0.22em', color: cart.accent, opacity: 0.75, fontFamily: 'Nunito, sans-serif', textTransform: 'uppercase' }}>ASCEND</span>
            <span style={{ fontSize: 7.5, fontWeight: 900, letterSpacing: '0.15em', color: cart.accent, opacity: 0.65, fontFamily: 'Nunito, sans-serif', textTransform: 'uppercase' }}>{cart.subject}</span>
          </div>

          {/* Title */}
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13.5, fontWeight: 700, color: cart.accent, lineHeight: 1.2, marginBottom: 3 }}>
            {cart.name}
          </div>

          {/* Rule */}
          <div style={{ height: 1, background: `linear-gradient(90deg, ${cart.accent}00, ${cart.accent}40, ${cart.accent}00)`, marginBottom: 7 }} />

          {/* Game name */}
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 10, color: `${cart.accent}88`, lineHeight: 1.4, marginBottom: 8, fontStyle: 'italic' }}>
            {cart.gameName}
          </div>

          {/* Center icon */}
          <div style={{ textAlign: 'center', margin: '10px 0 10px', fontSize: 42, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.7))' }}>
            {cart.icon}
          </div>

          {/* Tagline */}
          <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 9, color: `${cart.accent}65`, lineHeight: 1.5, textAlign: 'center', letterSpacing: '0.03em' }}>
            {cart.tagline}
          </div>

          {/* Progress */}
          {!isLocked && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 8.5, color: `${cart.accent}72`, fontWeight: 700, fontFamily: 'Nunito, sans-serif', marginBottom: 3 }}>
                <span>{started ? `${chapsDone} / ${totalChaps} ch` : 'New Game'}</span>
                <span>{pct}%</span>
              </div>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: animDelay + 0.6, duration: 0.9, ease: 'easeOut' }}
                  style={{ height: '100%', background: `linear-gradient(90deg, ${cart.accent}65, ${cart.accent})`, borderRadius: 2 }}
                />
              </div>
            </div>
          )}

          {/* Coming soon overlay */}
          {isLocked && (
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '8px 8px 0 0',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end',
              paddingBottom: 12, background: 'rgba(0,0,0,0.45)',
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.75)', borderRadius: 6, padding: '4px 10px',
                fontSize: 8.5, color: 'rgba(255,255,255,0.5)', fontWeight: 800,
                letterSpacing: '0.14em', fontFamily: 'Nunito, sans-serif',
              }}>
                COMING SOON
              </div>
            </div>
          )}
        </div>

        {/* Connector section */}
        <div style={{
          height: 30,
          background: `linear-gradient(180deg, ${cart.bodyColor} 0%, #030202 100%)`,
          position: 'relative', overflow: 'hidden', borderRadius: '0 0 3px 3px',
        }}>
          <div style={{
            position: 'absolute', bottom: 0, left: '8%', right: '8%', height: 10,
            backgroundImage: 'repeating-linear-gradient(90deg, rgba(200,169,110,0.12) 0px, rgba(200,169,110,0.12) 5px, transparent 5px, transparent 9px)',
          }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Quick-action pill ─────────────────────────────────────────────────────────

function QuickPill({ icon, label, value, accent = '#C8A96E', onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: `0 8px 24px ${accent}22` }}
      whileTap={{ scale: 0.96 }}
      style={{
        background: `${accent}0E`,
        border: `1px solid ${accent}28`,
        borderRadius: 12, padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 8,
        cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
        flex: 1, minWidth: 0,
      }}
    >
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ textAlign: 'left', minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: accent, letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{label}</div>
        {value && <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 1 }}>{value}</div>}
      </div>
    </motion.button>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function StudentDashboard() {
  const { navigate, user } = useApp();
  const [games, setGames] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/api/edumissions/games').catch(() => ({ games: [] })),
      api.get('/api/progress/streak').catch(() => null),
    ]).then(([gData, sData]) => {
      setGames(gData.games || []);
      if (sData) setStreak(sData.streak || sData.current_streak || 0);
    }).finally(() => setLoading(false));
  }, []);

  const gamesBySlug = {};
  for (const g of games) gamesBySlug[g.slug] = g;

  function handleCartridgeClick(cart) {
    if (cart.module === 'write') {
      navigate('write_home');
      return;
    }
    const gameData = gamesBySlug[cart.slug];
    if (!gameData) return;
    const prog = gameData.player;
    if (!prog || prog.chapters_done === 0) {
      navigate('chronicles_prologue', { gameId: gameData.id, slug: gameData.slug, prologue: gameData.prologue });
    } else {
      navigate('chronicles_map', { gameId: gameData.id, slug: gameData.slug });
    }
  }

  const displayName = user?.name || user?.email?.split('@')[0] || 'Scholar';

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Nunito, sans-serif',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(30,14,4,0.97) 0%, rgba(6,5,4,1) 55%)',
      overflowX: 'hidden',
    }}>
      {/* Stone texture */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.005) 2px, rgba(255,255,255,0.005) 3px)',
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(8,6,4,0.9)',
        backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(200,169,110,0.12)',
      }}>
        <motion.button
          onClick={() => navigate('character_profile')}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            background: 'rgba(200,169,110,0.1)',
            border: '1px solid rgba(200,169,110,0.28)',
            borderRadius: 12, padding: '8px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 20 }}>🧙</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#C8A96E', letterSpacing: '0.04em' }}>{displayName}</div>
            <div style={{ fontSize: 9.5, color: 'rgba(200,169,110,0.55)', fontWeight: 600 }}>Character & Gear</div>
          </div>
        </motion.button>

        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: '#C8A96E', letterSpacing: '0.08em', opacity: 0.9 }}>
          ⚔ ASCEND
        </span>

        <WalletPill onClick={() => navigate('shop')} />
      </nav>

      {/* ── Hero heading ── */}
      <div style={{ position: 'relative', paddingTop: 44, paddingBottom: 16, textAlign: 'center', zIndex: 2 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.1 }}>
          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: 10.5, fontWeight: 700,
            letterSpacing: '0.35em', color: 'rgba(200,169,110,0.5)',
            textTransform: 'uppercase', marginBottom: 10,
          }}>
            EduMissions
          </div>
          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(22px, 5.5vw, 34px)',
            fontWeight: 700, color: '#C8A96E', margin: '0 0 10px',
            letterSpacing: '0.06em',
            textShadow: '0 0 40px rgba(200,169,110,0.35)',
          }}>
            Choose Your Quest
          </h1>
          <p style={{ margin: 0, fontSize: 13.5, color: 'rgba(255,255,255,0.38)', fontWeight: 600, letterSpacing: '0.02em' }}>
            Select a cartridge to begin your adventure
          </p>
        </motion.div>
      </div>

      {/* ── Cartridge grid with flanking vines ── */}
      <div style={{
        maxWidth: 860, margin: '0 auto',
        padding: '20px 48px 28px',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 115, pointerEvents: 'none' }}>
          <VineLeft />
        </div>
        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 115, pointerEvents: 'none' }}>
          <VineRight />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(200,169,110,0.45)', fontSize: 14, fontWeight: 600 }}>
            Loading cartridges…
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: '24px 18px',
            justifyItems: 'center',
          }}>
            {CARTRIDGES.map((cart, i) => {
              const gameData = gamesBySlug[cart.slug];
              return (
                <NESCartridge
                  key={cart.id}
                  cart={cart}
                  gameData={gameData}
                  playerProgress={gameData?.player}
                  onClick={() => handleCartridgeClick(cart)}
                  animDelay={i * 0.08}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick-access bar ── */}
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '4px 20px 52px', zIndex: 2, position: 'relative' }}>
        <div style={{ height: 1, margin: '0 0 18px', background: 'linear-gradient(90deg, transparent, rgba(200,169,110,0.18), transparent)' }} />
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {streak > 0 && (
            <QuickPill icon="🔥" label={`${streak}-Day Streak`} value="Keep it going" accent="#F5A623" onClick={() => {}} />
          )}
          <QuickPill icon="📜" label="Quests" value="Daily challenges" accent="#A78BFA" onClick={() => navigate('quests')} />
          <QuickPill icon="🏆" label="Leagues" value="Weekly ranking" accent="#4A90D9" onClick={() => navigate('leagues')} />
          <QuickPill icon="🎁" label="Open Packs" value="Spend your coins" accent="#52B788" onClick={() => navigate('shop')} />
        </div>
      </div>
    </div>
  );
}
