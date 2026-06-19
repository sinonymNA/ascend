'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { RUBRICS } from '../lib/rubrics.js';
import {
  Vignette, ParticleField, OrnateCard, SectionTitle, ShineTitle,
  GlossButton, useParallax, goldText, GOLD,
} from '../components/write/fx.jsx';
import { parseSaqPrompt } from '../lib/saqPrompt.js';
import { GW } from '../lib/guidedWalkTheme.js';

// ── Summit Write — student home: cinematic basecamp ──────────────────────────

const TRAILS = [
  { type: 'SAQ', name: 'SAQ Trail', sub: 'Entry level', color: '#52B788', peak: '#2D6A4F' },
  { type: 'LEQ', name: 'LEQ Ridge', sub: 'Intermediate', color: '#F5A623', peak: '#8B6914' },
  { type: 'DBQ', name: 'DBQ Summit', sub: 'Expert', color: '#E85D4A', peak: '#8B2A1A' },
];

const BADGE_ICONS = {
  trail_blazer: '🥾', context_climber: '🧗', sourcing_scout: '🔍',
  complexity_king: '👑', revision_ranger: '🔄', summit_writer: '🏔',
  saq_mastery: '📜', leq_mastery: '⚖️', dbq_mastery: '🗂️',
};

// ── Cinematic layered mountain vista with mouse parallax ─────────────────────
function MountainScene({ height = 320 }) {
  const par = useParallax();
  // each layer translates by a different multiple of the mouse offset
  const layer = (depth) => ({ x: par.x * depth, y: par.y * depth * 0.4 });

  return (
    <svg viewBox="0 0 800 300" preserveAspectRatio="xMidYMax slice"
      style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id="wh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A1226" />
          <stop offset="45%" stopColor="#1A2940" />
          <stop offset="80%" stopColor="#2E3A4A" />
          <stop offset="100%" stopColor="#4A3D32" />
        </linearGradient>
        <linearGradient id="wh-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3A4A66" />
          <stop offset="100%" stopColor="#2A3650" />
        </linearGradient>
        <linearGradient id="wh-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E4258" />
          <stop offset="100%" stopColor="#1E2C3E" />
        </linearGradient>
        <linearGradient id="wh-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22354A" />
          <stop offset="100%" stopColor="#0F1A28" />
        </linearGradient>
        <radialGradient id="wh-moonglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFF2D8" stopOpacity="0.9" />
          <stop offset="28%" stopColor="#F5D9A0" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wh-aurora1" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#52B788" stopOpacity="0" />
          <stop offset="45%" stopColor="#52B788" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#7BD4F0" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="wh-aurora2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#7BD4F0" stopOpacity="0" />
          <stop offset="55%" stopColor="#9B8CFF" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#52B788" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="wh-fire" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#FFB54A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#E8853A" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="800" height="300" fill="url(#wh-sky)" />

      {/* stars */}
      {[[60, 28], [140, 52], [250, 22], [330, 64], [470, 30], [540, 70], [700, 26], [760, 58], [410, 46], [200, 80]].map(([x, y], i) => (
        <motion.circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.4 : 0.9} fill="#F0EDE6"
          animate={{ opacity: [0.2, 0.9, 0.2] }}
          transition={{ duration: 2.5 + (i % 5), repeat: Infinity, delay: i * 0.45 }} />
      ))}

      {/* shooting star */}
      <motion.line x1="0" y1="0" x2="34" y2="14" stroke="#FFF2D8" strokeWidth="1.4" strokeLinecap="round"
        initial={{ x: 120, y: 20, opacity: 0 }}
        animate={{ x: [120, 380], y: [20, 90], opacity: [0, 0.9, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, repeatDelay: 11, ease: 'easeOut' }} />

      {/* aurora ribbons */}
      <motion.path d="M-20 60 C160 20 300 95 480 50 C620 18 720 70 820 40 L820 -10 L-20 -10 Z"
        fill="url(#wh-aurora1)" style={{ mixBlendMode: 'screen' }}
        animate={{ opacity: [0.35, 0.6, 0.3, 0.55, 0.35], y: [0, 8, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.path d="M-20 95 C200 55 360 120 560 78 C690 52 760 95 820 72 L820 10 L-20 10 Z"
        fill="url(#wh-aurora2)" style={{ mixBlendMode: 'screen' }}
        animate={{ opacity: [0.25, 0.45, 0.2, 0.4, 0.25], y: [0, -7, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 2 }} />

      {/* moon + god rays */}
      <motion.g animate={layer(-6)} transition={{ type: 'spring', stiffness: 40, damping: 20 }}>
        <circle cx="610" cy="62" r="74" fill="url(#wh-moonglow)" />
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '610px', originY: '62px' }}>
          {[0, 45, 90, 135].map((deg) => (
            <rect key={deg} x="606" y="-30" width="8" height="184" fill="#FFF2D8" opacity="0.04"
              transform={`rotate(${deg} 610 62)`} />
          ))}
        </motion.g>
        <circle cx="610" cy="62" r="19" fill="#F5EFDF" />
        <circle cx="617" cy="57" r="16" fill="#16223A" opacity="0.5" />
      </motion.g>

      {/* drifting clouds */}
      <motion.g animate={{ x: [0, 56, 0] }} transition={{ duration: 64, repeat: Infinity, ease: 'linear' }} opacity="0.15">
        <ellipse cx="180" cy="84" rx="95" ry="14" fill="#F0EDE6" />
        <ellipse cx="245" cy="73" rx="60" ry="10" fill="#F0EDE6" />
      </motion.g>
      <motion.g animate={{ x: [0, -72, 0] }} transition={{ duration: 84, repeat: Infinity, ease: 'linear' }} opacity="0.1">
        <ellipse cx="540" cy="120" rx="115" ry="12" fill="#F0EDE6" />
      </motion.g>

      {/* far range */}
      <motion.g animate={layer(-10)} transition={{ type: 'spring', stiffness: 40, damping: 20 }}>
        <path d="M0 205 L70 150 L130 188 L210 122 L290 182 L370 138 L450 195 L540 130 L640 192 L720 152 L800 195 L800 300 L0 300 Z"
          fill="url(#wh-far)" opacity="0.6" />
        <path d="M194 134 L210 122 L228 136 L216 141 L204 138 Z" fill="#E8E4DC" opacity="0.5" />
        <path d="M524 142 L540 130 L558 144 L546 148 L532 146 Z" fill="#E8E4DC" opacity="0.5" />
      </motion.g>

      {/* mid range */}
      <motion.g animate={layer(-18)} transition={{ type: 'spring', stiffness: 40, damping: 20 }}>
        <path d="M0 248 L90 168 L160 218 L260 142 L340 212 L430 156 L520 226 L620 158 L710 216 L800 178 L800 300 L0 300 Z"
          fill="url(#wh-mid)" />
        <path d="M242 156 L260 142 L280 158 L268 164 L252 160 Z" fill="#E8E4DC" opacity="0.78" />
        <path d="M602 172 L620 158 L640 174 L628 180 L612 176 Z" fill="#E8E4DC" opacity="0.78" />
        {/* spindrift off the summit */}
        <motion.g animate={{ x: [0, 16, 0], opacity: [0.35, 0.12, 0.35] }} transition={{ duration: 7, repeat: Infinity }}>
          <ellipse cx="288" cy="150" rx="24" ry="3.5" fill="#E8E4DC" />
        </motion.g>
        {/* rolling fog bank */}
        <motion.ellipse cx="400" cy="232" rx="240" ry="16" fill="#AAB8C8" opacity="0.1"
          animate={{ cx: [340, 470, 340] }} transition={{ duration: 38, repeat: Infinity, ease: 'easeInOut' }} />
      </motion.g>

      {/* near ridge */}
      <motion.g animate={layer(-30)} transition={{ type: 'spring', stiffness: 40, damping: 20 }}>
        <path d="M0 300 L0 262 L60 238 L140 266 L230 234 L330 268 L430 240 L540 270 L650 240 L740 268 L800 250 L800 300 Z"
          fill="url(#wh-near)" />
        {[[70, 248], [95, 252], [255, 248], [280, 252], [460, 250], [486, 254], [672, 250], [700, 254]].map(([x, y], i) => (
          <g key={i} opacity="0.9">
            <path d={`M${x} ${y} C${x - 3} ${y - 9} ${x - 6} ${y - 13} ${x} ${y - 22} C${x + 6} ${y - 13} ${x + 3} ${y - 9} ${x} ${y} Z`} fill="#142519" />
            <path d={`M${x} ${y - 7} C${x - 2.4} ${y - 13} ${x - 4.4} ${y - 16} ${x} ${y - 23} C${x + 4.4} ${y - 16} ${x + 2.4} ${y - 13} ${x} ${y - 7} Z`} fill="#1C3526" />
            <rect x={x - 1} y={y} width="2" height="5" fill="#241A0C" />
          </g>
        ))}

        {/* campfire at basecamp */}
        <g transform="translate(150 262)">
          <motion.circle cx="0" cy="-4" r="26" fill="url(#wh-fire)"
            animate={{ opacity: [0.7, 1, 0.6, 0.95, 0.7], scale: [1, 1.12, 0.96, 1.08, 1] }}
            transition={{ duration: 2.8, repeat: Infinity }} />
          <path d="M-7 0 L7 -3 M-6 -3 L7 1" stroke="#3D2A14" strokeWidth="3" strokeLinecap="round" />
          <motion.path d="M0 -2 C-4 -7 -3 -12 0 -16 C3 -12 4 -7 0 -2 Z" fill="#FFB54A"
            animate={{ scaleY: [1, 1.25, 0.9, 1.15, 1], scaleX: [1, 0.9, 1.1, 0.95, 1] }}
            transition={{ duration: 1.1, repeat: Infinity }} style={{ transformBox: 'fill-box', originX: 0.5, originY: 1 }} />
          <motion.path d="M0 -4 C-2 -7 -1.6 -10 0 -12.5 C1.6 -10 2 -7 0 -4 Z" fill="#FFE9B8"
            animate={{ scaleY: [1, 1.35, 0.85, 1.2, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }} style={{ transformBox: 'fill-box', originX: 0.5, originY: 1 }} />
          {[0, 1, 2].map((i) => (
            <motion.circle key={i} cx={0} cy={-14} r={1.2} fill="#FFB54A"
              animate={{ cy: [-14, -38], cx: [0, (i - 1) * 9], opacity: [0.9, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7 }} />
          ))}
        </g>

        {/* winding trail with lanterns */}
        <path d="M170 292 C250 280 230 264 300 252 C360 242 340 218 380 202 C410 190 398 174 422 162"
          fill="none" stroke="#C8A96E" strokeWidth="2.5" strokeDasharray="1 9" strokeLinecap="round" opacity="0.85" />
        <motion.circle cx="300" cy="252" r="3" fill={GOLD}
          animate={{ opacity: [0.9, 0.4, 0.9] }} transition={{ duration: 2.4, repeat: Infinity }} />
        <motion.circle cx="380" cy="202" r="3" fill={GOLD}
          animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3.1, repeat: Infinity }} />

        {/* climber */}
        <motion.g animate={{ y: [0, -2.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          <g transform="translate(422 162)">
            <ellipse cx="1" cy="9" rx="7" ry="2" fill="#000" opacity="0.3" />
            <rect x="-7.5" y="-13" width="6" height="9" rx="2" fill="#8B4513" />
            <path d="M-3 -4 C-4 -10 4 -10 3 -4 L2.6 2 L-2.6 2 Z" fill="#E85D4A" />
            <circle cx="0" cy="-13" r="4" fill="#E8B88A" />
            <path d="M-4 -14.5 C-4 -19 4 -19 4 -14.5 L4 -13.5 L-4 -13.5 Z" fill="#2D6A4F" />
            <circle cx="0" cy="-19" r="1.6" fill={GOLD} />
            <path d="M-2 2 L-3 8 M2 2 L3.4 7.4" stroke="#3D2E10" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M5 -7 L8 6" stroke="#C8A96E" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </motion.g>
      </motion.g>

      {/* falling snow */}
      {[80, 220, 410, 560, 690, 760].map((x, i) => (
        <motion.circle key={i} cx={x} cy={-6} r={1.4} fill="#E8E4DC" opacity="0.6"
          animate={{ cy: 310, cx: [x, x + 18, x - 6, x + 10] }}
          transition={{ duration: 9 + i * 1.8, repeat: Infinity, ease: 'linear', delay: i * 1.4 }} />
      ))}
    </svg>
  );
}

// ── Level crest emblem ────────────────────────────────────────────────────────
function LevelCrest({ level }) {
  return (
    <div style={{
      width: 64, height: 64, position: 'relative', flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <motion.svg viewBox="0 0 64 64" width="64" height="64" style={{ position: 'absolute', inset: 0 }}
        animate={{ rotate: 360 }} transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}>
        <polygon points="32,2 38,12 50,8 48,21 61,24 52,32 61,40 48,43 50,56 38,52 32,62 26,52 14,56 16,43 3,40 12,32 3,24 16,21 14,8 26,12"
          fill="none" stroke={GOLD} strokeWidth="1.4" opacity="0.7" />
      </motion.svg>
      <div style={{
        width: 46, height: 46, borderRadius: '50%',
        background: `radial-gradient(circle at 34% 30%, #DCA63E, #8B6914 75%)`,
        border: '2px solid rgba(255,233,184,0.6)',
        boxShadow: `0 0 22px ${GOLD}45, inset 0 2px 5px rgba(255,255,255,0.35)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 19, fontWeight: 900, color: '#1C1208' }}>{level}</span>
      </div>
    </div>
  );
}

// ── Rope XP bar ───────────────────────────────────────────────────────────────
function RopeXPBar({ xp, level, nextLevelXp, thresholds }) {
  const prevThreshold = thresholds?.[level - 1] ?? 0;
  const span = Math.max(1, (nextLevelXp ?? prevThreshold + 300) - prevThreshold);
  const pct = Math.min(100, Math.round(((xp - prevThreshold) / span) * 100));
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <LevelCrest level={level} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 7 }}>
          <span style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.08em', ...goldText }}>LEVEL {level} HISTORIAN</span>
          <span style={{ color: 'rgba(240,237,230,0.45)' }}>{xp.toLocaleString()} / {(nextLevelXp ?? '∞').toLocaleString?.() || nextLevelXp} XP</span>
        </div>
        <div style={{ position: 'relative', height: 16 }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 8,
            background: 'rgba(0,0,0,0.45)', overflow: 'hidden',
            border: '1px solid rgba(245,166,35,0.25)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6)',
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                height: '100%', borderRadius: 8, position: 'relative',
                background: 'repeating-linear-gradient(115deg, #B8862B 0px, #DCA63E 5px, #8B6914 10px, #C8963A 15px)',
                boxShadow: '0 0 16px rgba(245,166,35,0.5)',
              }}>
              <motion.div
                animate={{ x: ['-100%', '320%'] }}
                transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
                style={{
                  position: 'absolute', top: 0, bottom: 0, width: '34%',
                  background: 'linear-gradient(105deg, transparent, rgba(255,255,255,0.4), transparent)',
                }} />
            </motion.div>
          </div>
          <motion.div
            initial={{ left: 0 }} animate={{ left: `${pct}%` }} transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ position: 'absolute', top: -4, marginLeft: -10, fontSize: 16, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.7))' }}>
            🪝
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ── Campsite skill node ───────────────────────────────────────────────────────
function Campsite({ skillKey, value, label, color, onDrill }) {
  const state = value >= 80 ? 'established' : value >= 40 ? 'active' : 'cold';
  const icon = state === 'established' ? '🏕️' : state === 'active' ? '⛺' : '🌑';
  const borderColor = state === 'established' ? color + '70' : state === 'cold' ? 'rgba(232,93,74,0.5)' : 'rgba(240,237,230,0.14)';
  return (
    <motion.button
      onClick={() => onDrill(skillKey)}
      whileHover={{ y: -4, boxShadow: `0 10px 26px rgba(0,0,0,0.5), 0 0 20px ${state === 'cold' ? '#E85D4A' : color}35` }}
      whileTap={{ scale: 0.95 }}
      title={`${label}: ${value}% — click to practice`}
      style={{
        background: state === 'established'
          ? `linear-gradient(165deg, ${color}1E, rgba(18,28,40,0.9))`
          : 'linear-gradient(165deg, rgba(36,53,72,0.7), rgba(18,28,40,0.9))',
        border: `1px solid ${borderColor}`,
        borderRadius: 12, padding: '12px 8px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        minWidth: 88, flex: 1,
        boxShadow: state === 'established' ? `0 0 18px ${color}28, inset 0 1px 0 rgba(255,255,255,0.06)` : 'inset 0 1px 0 rgba(255,255,255,0.04)',
      }}
    >
      <motion.span
        animate={state === 'established' ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ fontSize: 22, filter: state === 'cold' ? 'grayscale(0.8) brightness(0.7)' : `drop-shadow(0 0 8px ${color}60)` }}
      >
        {icon}
      </motion.span>
      <span style={{ fontSize: 9.5, fontWeight: 800, color: 'rgba(240,237,230,0.75)', textAlign: 'center', lineHeight: 1.25, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
        {label}
      </span>
      <span style={{ fontSize: 11, fontWeight: 900, fontFamily: 'Cinzel, serif', color: state === 'cold' ? '#E85D4A' : color }}>{value}%</span>
    </motion.button>
  );
}

// ── Practice drill modal ──────────────────────────────────────────────────────
function DrillModal({ criterion, onClose, onAward }) {
  const [drill, setDrill] = useState(null);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.post('/api/write/drill/generate', { criterion, essayType: 'DBQ' })
      .then(setDrill).catch(() => setDrill({ prompt: 'Could not load drill — try again.', criterion }));
  }, [criterion]);

  async function submit() {
    if (busy || !answer.trim()) return;
    setBusy(true);
    try {
      const r = await api.post('/api/write/drill/grade', { criterion, drillPrompt: drill?.prompt, answer });
      setResult(r);
      onAward?.(r.award);
    } catch (e) {
      setResult({ result: { earned: false, feedback: e.message } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(4,6,10,0.88)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 22, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 540, width: '100%' }}>
        <OrnateCard glow style={{ padding: '28px 26px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 800, marginBottom: 6, ...goldText }}>
            ⛺ CAMPSITE DRILL — {criterion.replace(/_/g, ' ').toUpperCase()}
          </div>
          {!drill ? (
            <div style={{ color: 'rgba(240,237,230,0.4)', fontSize: 13, padding: '20px 0' }}>Stoking the fire…</div>
          ) : result ? (
            <div>
              <motion.div initial={{ scale: 2.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 14, stiffness: 240 }}
                style={{ fontSize: 38, textAlign: 'center', margin: '14px 0 8px' }}>
                {result.result?.earned ? '🔥' : '🪵'}
              </motion.div>
              <div style={{
                fontFamily: 'Cinzel, serif', textAlign: 'center', fontSize: 17, fontWeight: 800,
                color: result.result?.earned ? '#52B788' : '#E85D4A', marginBottom: 8,
                textShadow: `0 0 18px ${result.result?.earned ? '#52B78860' : '#E85D4A60'}`,
              }}>
                {result.result?.earned ? 'POINT EARNED' : 'NOT YET'}
              </div>
              <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.75)', lineHeight: 1.6 }}>{result.result?.feedback}</p>
              {result.award?.xpGain > 0 && (
                <div style={{ textAlign: 'center', fontWeight: 900, fontSize: 15, margin: '8px 0', fontFamily: 'Cinzel, serif', ...goldText }}>
                  +{result.award.xpGain} XP
                </div>
              )}
              <GlossButton onClick={onClose} style={{ width: '100%', marginTop: 12 }}>Back to the trail</GlossButton>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 13.5, color: 'rgba(240,237,230,0.85)', lineHeight: 1.65, margin: '8px 0 14px' }}>
                {drill.prompt}
              </p>
              <textarea
                value={answer} onChange={(e) => setAnswer(e.target.value)}
                rows={4} placeholder="Write your answer here…"
                style={{
                  width: '100%', boxSizing: 'border-box', borderRadius: 10, padding: '12px 14px',
                  background: '#F5E6C8', color: '#1A0F08', border: '1px solid rgba(0,0,0,0.2)',
                  fontFamily: 'Nunito, sans-serif', fontSize: 14, lineHeight: 1.7, resize: 'vertical',
                }}
              />
              <GlossButton onClick={submit} disabled={busy || !answer.trim()} accent="#52B788" dark="#06130C"
                style={{ width: '100%', marginTop: 12 }}>
                {busy ? 'Grading…' : 'Submit drill'}
              </GlossButton>
            </div>
          )}
        </OrnateCard>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WriteHome() {
  const { navigate, user } = useApp();
  const [assignments, setAssignments] = useState([]);
  const [progress, setProgress] = useState(null);
  const [meta, setMeta] = useState({});
  const [loading, setLoading] = useState(true);
  const [drill, setDrill] = useState(null);

  const load = () => Promise.all([
    api.get('/api/write/assignments').catch(() => ({ assignments: [] })),
    api.get('/api/write/progress').catch(() => null),
  ]).then(([a, p]) => {
    setAssignments(a.assignments || []);
    if (p) { setProgress(p.progress); setMeta(p); }
  }).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const displayName = user?.name || 'Historian';
  const xp = progress?.xp || 0;
  const level = progress?.level || 1;
  const streak = progress?.streak_days || 0;
  const skills = progress?.skills || {};
  const badges = Array.isArray(progress?.badges) ? progress.badges : [];

  const pending = assignments.filter((a) => !a.latest_submission);
  const submitted = assignments.filter((a) => a.latest_submission);

  // Trail elevation: XP earned per essay type (approximated from submissions)
  const trailFeet = (type) => {
    const subs = submitted.filter((a) => a.type === type);
    return subs.reduce((s, a) => s + ((a.latest_submission?.ai_score || 0) * 30), 0);
  };

  const SKILL_LABELS = {
    contextualization: 'Context', thesis: 'Thesis', evidence_documents: 'Doc Evidence',
    evidence_beyond: 'Outside Evidence', evidence: 'Evidence', reasoning: 'Reasoning',
    complexity: 'Complexity', part_a: 'Part A', part_b: 'Part B', part_c: 'Part C',
  };

  return (
    <div style={{
      minHeight: '100vh', fontFamily: 'Nunito, sans-serif',
      background: 'radial-gradient(ellipse at 50% -10%, #1A2940 0%, #0F1720 55%, #0A1018 100%)',
      position: 'relative',
    }}>
      <ParticleField count={10} type="dust" color="#C8D8E8" zIndex={1} />
      <Vignette strength={0.6} />

      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'linear-gradient(180deg, rgba(10,16,24,0.95), rgba(15,23,32,0.88))', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(245,166,35,0.18)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(240,237,230,0.5)', fontSize: 13, fontWeight: 700, padding: '4px 8px',
        }}>← Games</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 800, letterSpacing: '0.12em', ...goldText }}>
          🏔 SUMMIT WRITE
        </span>
        {streak > 0 ? (
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{
              fontSize: 13, fontWeight: 900, color: '#FFB54A',
              background: 'rgba(232,93,74,0.14)', border: '1px solid rgba(232,93,74,0.4)',
              borderRadius: 20, padding: '4px 12px',
              boxShadow: '0 0 14px rgba(232,93,74,0.3)',
            }}>
            🔥 {streak}
          </motion.div>
        ) : <div style={{ width: 40 }} />}
      </nav>

      {/* Hero: mountain vista */}
      <div style={{ position: 'relative' }}>
        <MountainScene height={Math.min(360, Math.max(260, typeof window !== 'undefined' ? window.innerHeight * 0.38 : 320))} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center',
          padding: '0 24px 22px', pointerEvents: 'none', textAlign: 'center',
          background: 'linear-gradient(180deg, transparent 35%, rgba(15,23,32,0.45) 80%, #0F1720 100%)',
        }}>
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
            <ShineTitle>SUMMIT WRITE</ShineTitle>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            style={{
              fontSize: 12.5, color: 'rgba(240,237,230,0.75)', fontWeight: 700, marginTop: 6,
              letterSpacing: '0.32em', textTransform: 'uppercase', textShadow: '0 2px 8px rgba(0,0,0,0.8)',
            }}>
            Write · Climb · Master
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 0.8 }}
            style={{ fontSize: 13, color: 'rgba(240,237,230,0.55)', fontWeight: 600, marginTop: 10, textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {displayName}.
          </motion.div>
        </div>
      </div>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 90px', position: 'relative', zIndex: 3 }}>
        {/* XP rope */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <OrnateCard glow style={{ padding: '18px 20px', marginBottom: 22 }}>
            <RopeXPBar xp={xp} level={level} nextLevelXp={meta.nextLevelXp} thresholds={meta.thresholds} />
          </OrnateCard>
        </motion.div>

        {/* Writing Courses entry point */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
          <OrnateCard
            role="button" tabIndex={0}
            onClick={() => navigate('write_courses')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('write_courses'); }}
            style={{ padding: '16px 18px', marginBottom: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, flexShrink: 0, borderRadius: 10,
              background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.35), rgba(10,16,24,0.85) 78%)',
              border: '1px solid rgba(245,166,35,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🎓</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>Writing Courses</div>
              <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.5)', fontWeight: 600 }}>
                The Craft of Three · The Art of Argument · Reading the Room
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>→</div>
          </OrnateCard>
        </motion.div>

        {/* Speed Round entry point */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.07 }}>
          <OrnateCard
            role="button" tabIndex={0}
            onClick={() => navigate('speed_round')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('speed_round'); }}
            style={{ padding: '16px 18px', marginBottom: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, flexShrink: 0, borderRadius: 10,
              background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.35), rgba(10,16,24,0.85) 78%)',
              border: '1px solid rgba(245,166,35,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>⚡</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>Speed Round</div>
              <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.5)', fontWeight: 600 }}>
                Describe or Explain? · Quick warm-up, global leaderboard
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>→</div>
          </OrnateCard>
        </motion.div>

        {/* Thesis Throwdown entry point */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.075 }}>
          <OrnateCard
            role="button" tabIndex={0}
            onClick={() => navigate('throwdown_play')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('throwdown_play'); }}
            style={{ padding: '16px 18px', marginBottom: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, flexShrink: 0, borderRadius: 10,
              background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.35), rgba(10,16,24,0.85) 78%)',
              border: '1px solid rgba(245,166,35,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>⚔️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>Thesis Throwdown</div>
              <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.5)', fontWeight: 600 }}>
                Join your teacher's live round with a room code
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>→</div>
          </OrnateCard>
        </motion.div>

        {/* The Tribunal entry point */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.078 }}>
          <OrnateCard
            role="button" tabIndex={0}
            onClick={() => navigate('tribunal_play')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('tribunal_play'); }}
            style={{ padding: '16px 18px', marginBottom: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, flexShrink: 0, borderRadius: 10,
              background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.35), rgba(10,16,24,0.85) 78%)',
              border: '1px solid rgba(245,166,35,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>⚖️</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>The Tribunal</div>
              <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.5)', fontWeight: 600 }}>
                Judge anonymous responses against the AP rubric, row by row
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>→</div>
          </OrnateCard>
        </motion.div>

        {/* The Relay entry point */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.082 }}>
          <OrnateCard
            role="button" tabIndex={0}
            onClick={() => navigate('relay_play')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('relay_play'); }}
            style={{ padding: '16px 18px', marginBottom: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, flexShrink: 0, borderRadius: 10,
              background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.35), rgba(10,16,24,0.85) 78%)',
              border: '1px solid rgba(245,166,35,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🏃</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>The Relay</div>
              <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.5)', fontWeight: 600 }}>
                Team up — write the thesis, evidence, or context in turn
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>→</div>
          </OrnateCard>
        </motion.div>

        {/* Evidence Auction entry point */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.085 }}>
          <OrnateCard
            role="button" tabIndex={0}
            onClick={() => navigate('auction_play')}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('auction_play'); }}
            style={{ padding: '16px 18px', marginBottom: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 46, height: 46, flexShrink: 0, borderRadius: 10,
              background: 'radial-gradient(circle at 35% 30%, rgba(245,166,35,0.35), rgba(10,16,24,0.85) 78%)',
              border: '1px solid rgba(245,166,35,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
            }}>🪙</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>Evidence Auction</div>
              <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.5)', fontWeight: 600 }}>
                Bid coins on evidence cards, then justify the ones you win
              </div>
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#F5A623' }}>→</div>
          </OrnateCard>
        </motion.div>

        {/* Pending assignments — quest board */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <SectionTitle>ACTIVE QUESTS</SectionTitle>
          {loading ? (
            <div style={{ color: 'rgba(240,237,230,0.35)', fontSize: 13, padding: '14px 0' }}>Loading…</div>
          ) : pending.length === 0 ? (
            <OrnateCard style={{ padding: '24px', textAlign: 'center' }}>
              <span style={{ color: 'rgba(240,237,230,0.45)', fontSize: 13 }}>
                No pending assignments. {submitted.length > 0 ? 'All caught up — review your climbs below or run a campsite drill.' : 'Ask your teacher for the class join code, or wait for an assignment.'}
              </span>
            </OrnateCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pending.map((a, idx) => {
                const trail = TRAILS.find((t) => t.type === a.type) || TRAILS[0];
                const due = a.due_date ? new Date(a.due_date) : null;
                const overdue = due && due < new Date();
                const guidedWalkAvailable =
                  (a.type === 'SAQ' && a.guided_walk_enabled !== false && !!parseSaqPrompt(a.prompt)) ||
                  (a.type === 'LEQ' && a.guided_walk_enabled !== false) ||
                  (a.type === 'DBQ' && a.guided_walk_enabled !== false);
                const guidedWalkScreen = a.type === 'LEQ' ? 'guided_walk_leq' : a.type === 'DBQ' ? 'guided_walk_dbq' : 'guided_walk_saq';
                return (
                  <motion.div key={a.id}
                    role="button" tabIndex={0}
                    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + idx * 0.07 }}
                    whileHover={{ x: 6, boxShadow: `0 0 26px ${trail.color}30, 0 14px 34px rgba(0,0,0,0.5)` }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => navigate('writing_room', { assignmentId: a.id })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') navigate('writing_room', { assignmentId: a.id }); }}
                    style={{
                      background: `linear-gradient(120deg, ${trail.color}14 0%, rgba(30,45,64,0.92) 28%, rgba(22,33,48,0.95) 100%)`,
                      border: `1px solid ${trail.color}40`,
                      borderLeft: `4px solid ${trail.color}`,
                      borderRadius: 12, padding: '15px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 10px 26px rgba(0,0,0,0.4)',
                      position: 'relative', overflow: 'hidden',
                    }}>
                    <div style={{
                      width: 46, height: 46, flexShrink: 0, borderRadius: 10,
                      background: `radial-gradient(circle at 35% 30%, ${trail.color}45, rgba(10,16,24,0.85) 78%)`,
                      border: `1px solid ${trail.color}70`,
                      boxShadow: `0 0 16px ${trail.color}30, inset 0 1px 0 rgba(255,255,255,0.15)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 900, color: trail.color,
                      textShadow: `0 0 10px ${trail.color}80`,
                    }}>{a.type}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14.5, fontWeight: 800, color: '#F0EDE6', marginBottom: 3 }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.45)', fontWeight: 600 }}>
                        {a.class_name || 'Open assignment'}
                        {due && <span style={{ color: overdue ? '#E85D4A' : 'rgba(240,237,230,0.45)' }}> · due {due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                        {a.type === 'DBQ' && a.doc_count > 0 && ` · ${a.doc_count} documents`}
                      </div>
                    </div>
                    {guidedWalkAvailable && (
                      <motion.button
                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
                        onClick={(e) => { e.stopPropagation(); navigate(guidedWalkScreen, { assignmentId: a.id }); }}
                        style={{
                          flexShrink: 0, border: `1px solid ${GW.amber}80`, background: `${GW.amber}22`,
                          color: GW.gold, borderRadius: 999, padding: '7px 14px', cursor: 'pointer',
                          fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, letterSpacing: '0.06em',
                          textTransform: 'uppercase', whiteSpace: 'nowrap',
                        }}>
                        🦉 Guided Walk
                      </motion.button>
                    )}
                    <motion.span
                      animate={{ x: [0, 4, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                      style={{ color: trail.color, fontSize: 18, flexShrink: 0, textShadow: `0 0 12px ${trail.color}` }}>➤</motion.span>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Trails */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ marginTop: 30 }}>
          <SectionTitle>YOUR TRAILS</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {TRAILS.map((t) => {
              const feet = trailFeet(t.type);
              return (
                <motion.div key={t.type}
                  whileHover={{ y: -4, boxShadow: `0 0 26px ${t.color}30, 0 14px 30px rgba(0,0,0,0.5)` }}
                  style={{
                    background: `linear-gradient(170deg, ${t.peak}30, rgba(22,33,48,0.95) 70%)`,
                    border: `1px solid ${t.color}38`, borderRadius: 14,
                    padding: '14px 12px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 24px rgba(0,0,0,0.4)',
                  }}>
                  <svg viewBox="0 0 100 38" style={{ width: '100%', height: 36, marginBottom: 4 }}>
                    <path d="M0 38 L26 14 L38 24 L52 6 L68 22 L82 12 L100 38 Z" fill={t.peak} opacity="0.85" />
                    <path d="M48 11 L52 6 L57 12 L52 14 Z" fill="#E8E4DC" opacity="0.85" />
                    <motion.circle cx="52" cy="6" r="2" fill={t.color}
                      animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.2, repeat: Infinity }} />
                  </svg>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 800, color: t.color, textShadow: `0 0 12px ${t.color}50` }}>{t.name}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(240,237,230,0.4)', fontWeight: 700, marginBottom: 4, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t.sub}</div>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 900, color: '#F0EDE6' }}>{feet.toLocaleString()}<span style={{ fontSize: 10, color: 'rgba(240,237,230,0.4)', fontFamily: 'Nunito, sans-serif' }}> ft</span></div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Campsites (skills) */}
        {Object.keys(skills).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={{ marginTop: 30 }}>
            <SectionTitle>CAMPSITES</SectionTitle>
            <p style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.4)', margin: '-6px 0 12px', textAlign: 'center' }}>
              Cold campsites need attention — click one to run a practice drill.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {Object.entries(skills).map(([k, v]) => (
                <Campsite key={k} skillKey={k} value={Math.round(v)} label={SKILL_LABELS[k] || k}
                  color="#52B788" onDrill={(c) => setDrill(c)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ marginTop: 30 }}>
            <SectionTitle>MEDALLIONS</SectionTitle>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
              {badges.map((b, i) => (
                <motion.div key={b} title={b.replace(/_/g, ' ')}
                  initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3 + i * 0.1, type: 'spring', damping: 12 }}
                  whileHover={{ scale: 1.15, rotate: 6 }}
                  style={{
                    width: 64, height: 64, borderRadius: '50%', position: 'relative',
                    background: 'radial-gradient(circle at 35% 30%, #FFE9B8, #DCA63E 40%, #8B6914 80%)',
                    border: '2px solid rgba(255,233,184,0.7)',
                    boxShadow: `0 6px 18px ${GOLD}35, 0 0 24px ${GOLD}25, inset 0 2px 5px rgba(255,255,255,0.4), inset 0 -3px 6px rgba(80,50,5,0.5)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
                  }}>
                  <div style={{ position: 'absolute', inset: 5, borderRadius: '50%', border: '1px solid rgba(110,75,12,0.5)' }} />
                  {BADGE_ICONS[b] || '⭐'}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent results */}
        {submitted.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} style={{ marginTop: 30 }}>
            <SectionTitle>RECENT CLIMBS</SectionTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {submitted.slice(0, 6).map((a) => {
                const s = a.latest_submission;
                const pct = s.max_score ? (s.ai_score / s.max_score) : 0;
                const color = pct >= 0.8 ? GOLD : pct >= 0.5 ? '#52B788' : '#E85D4A';
                return (
                  <motion.button key={a.id} onClick={() => navigate('write_results', { submissionId: s.id })}
                    whileHover={{ x: 5, boxShadow: `0 0 20px ${color}25, 0 12px 28px rgba(0,0,0,0.5)` }}
                    style={{
                      background: 'linear-gradient(165deg, rgba(36,53,72,0.85), rgba(22,33,48,0.95))',
                      border: '1px solid rgba(240,237,230,0.1)',
                      borderRadius: 12, padding: '13px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 22px rgba(0,0,0,0.35)',
                    }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: '#F0EDE6' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontWeight: 600 }}>
                        Attempt {s.attempt_number} · {new Date(s.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 800, color, flexShrink: 0,
                      textShadow: `0 0 14px ${color}50`,
                    }}>
                      {s.teacher_score ?? s.ai_score}/{s.max_score}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {drill && <DrillModal criterion={drill} onClose={() => { setDrill(null); load(); }} />}
      </AnimatePresence>
    </div>
  );
}
