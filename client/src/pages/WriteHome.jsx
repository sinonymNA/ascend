'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { RUBRICS } from '../lib/rubrics.js';

// ── Summit Write — student home: trails, assignments, skills ─────────────────

const TRAILS = [
  { type: 'SAQ', name: 'SAQ Trail', sub: 'Entry level', color: '#52B788', peak: '#2D6A4F' },
  { type: 'LEQ', name: 'LEQ Ridge', sub: 'Intermediate', color: '#F5A623', peak: '#8B6914' },
  { type: 'DBQ', name: 'DBQ Summit', sub: 'Expert', color: '#E85D4A', peak: '#8B2A1A' },
];

const BADGE_ICONS = {
  trail_blazer: '🥾', context_climber: '🧗', sourcing_scout: '🔍',
  complexity_king: '👑', revision_ranger: '🔄', summit_writer: '🏔',
};

// ── Painterly layered mountain illustration ──────────────────────────────────
function MountainScene({ height = 190 }) {
  return (
    <svg viewBox="0 0 800 240" preserveAspectRatio="xMidYMax slice"
      style={{ width: '100%', height, display: 'block' }}>
      <defs>
        <linearGradient id="wh-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1A2940" />
          <stop offset="60%" stopColor="#243044" />
          <stop offset="100%" stopColor="#3D3A38" />
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
          <stop offset="100%" stopColor="#121E2C" />
        </linearGradient>
        <linearGradient id="wh-glow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect width="800" height="240" fill="url(#wh-sky)" />

      {/* moon glow */}
      <circle cx="610" cy="48" r="40" fill="url(#wh-glow)" opacity="0.7" />
      <circle cx="610" cy="48" r="16" fill="#F0EDE6" opacity="0.85" />
      <circle cx="616" cy="44" r="14" fill="#243044" opacity="0.55" />

      {/* drifting clouds */}
      <motion.g animate={{ x: [0, 50, 0] }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} opacity="0.16">
        <ellipse cx="180" cy="60" rx="90" ry="14" fill="#F0EDE6" />
        <ellipse cx="240" cy="50" rx="60" ry="10" fill="#F0EDE6" />
      </motion.g>
      <motion.g animate={{ x: [0, -70, 0] }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} opacity="0.1">
        <ellipse cx="520" cy="92" rx="110" ry="12" fill="#F0EDE6" />
      </motion.g>

      {/* far range — soft, hazy */}
      <path d="M0 160 L70 110 L130 145 L210 88 L290 140 L370 100 L450 150 L540 95 L640 148 L720 112 L800 150 L800 240 L0 240 Z"
        fill="url(#wh-far)" opacity="0.6" />
      {/* snow caps far */}
      <path d="M196 98 L210 88 L226 100 L216 104 L206 100 Z" fill="#E8E4DC" opacity="0.5" />
      <path d="M526 105 L540 95 L556 107 L546 110 L534 108 Z" fill="#E8E4DC" opacity="0.5" />

      {/* mid range */}
      <path d="M0 196 L90 130 L160 172 L260 112 L340 168 L430 124 L520 178 L620 126 L710 170 L800 140 L800 240 L0 240 Z"
        fill="url(#wh-mid)" />
      <path d="M244 124 L260 112 L278 126 L266 131 L254 128 Z" fill="#E8E4DC" opacity="0.75" />
      <path d="M604 138 L620 126 L638 140 L626 145 L612 142 Z" fill="#E8E4DC" opacity="0.75" />

      {/* snow drifting off mid peak */}
      <motion.g animate={{ x: [0, 14, 0], opacity: [0.35, 0.15, 0.35] }} transition={{ duration: 7, repeat: Infinity }}>
        <ellipse cx="285" cy="120" rx="22" ry="3" fill="#E8E4DC" />
      </motion.g>

      {/* near ridge with pines */}
      <path d="M0 240 L0 208 L60 186 L140 212 L230 184 L330 214 L430 188 L540 216 L650 190 L740 214 L800 198 L800 240 Z"
        fill="url(#wh-near)" />
      {/* pine clusters — hand-drawn feel via overlapping triangles with curve */}
      {[
        [70, 196], [95, 200], [255, 196], [280, 200], [460, 198], [486, 202], [672, 200], [700, 204],
      ].map(([x, y], i) => (
        <g key={i} opacity="0.9">
          <path d={`M${x} ${y} C${x - 3} ${y - 8} ${x - 6} ${y - 12} ${x} ${y - 20} C${x + 6} ${y - 12} ${x + 3} ${y - 8} ${x} ${y} Z`} fill="#16281E" />
          <path d={`M${x} ${y - 6} C${x - 2.4} ${y - 12} ${x - 4.4} ${y - 15} ${x} ${y - 21} C${x + 4.4} ${y - 15} ${x + 2.4} ${y - 12} ${x} ${y - 6} Z`} fill="#1E3828" />
          <rect x={x - 1} y={y} width="2" height="5" fill="#241A0C" />
        </g>
      ))}

      {/* winding trail — hand-drawn dashed path up the mid peak */}
      <path d="M120 232 C200 222 180 210 250 200 C310 192 290 170 330 156 C360 146 348 132 372 122"
        fill="none" stroke="#C8A96E" strokeWidth="2.5" strokeDasharray="1 9" strokeLinecap="round" opacity="0.85" />
      {/* trail lantern flickers */}
      <motion.circle cx="250" cy="200" r="3" fill="#F5A623"
        animate={{ opacity: [0.9, 0.4, 0.9] }} transition={{ duration: 2.4, repeat: Infinity }} />
      <motion.circle cx="330" cy="156" r="3" fill="#F5A623"
        animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3.1, repeat: Infinity }} />

      {/* illustrated climber character at trail end */}
      <motion.g animate={{ y: [0, -2.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <g transform="translate(372 122)">
          {/* pack */}
          <rect x="-7.5" y="-13" width="6" height="9" rx="2" fill="#8B4513" />
          {/* body */}
          <path d="M-3 -4 C-4 -10 4 -10 3 -4 L2.6 2 L-2.6 2 Z" fill="#E85D4A" />
          {/* head */}
          <circle cx="0" cy="-13" r="4" fill="#E8B88A" />
          {/* beanie */}
          <path d="M-4 -14.5 C-4 -19 4 -19 4 -14.5 L4 -13.5 L-4 -13.5 Z" fill="#2D6A4F" />
          <circle cx="0" cy="-19" r="1.6" fill="#F5A623" />
          {/* legs */}
          <path d="M-2 2 L-3 8 M2 2 L3.4 7.4" stroke="#3D2E10" strokeWidth="2.4" strokeLinecap="round" />
          {/* hiking pole */}
          <path d="M5 -7 L8 6" stroke="#C8A96E" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </motion.g>

      {/* falling snow */}
      {[80, 220, 410, 560, 690, 760].map((x, i) => (
        <motion.circle key={i} cx={x} cy={-6} r={1.4} fill="#E8E4DC" opacity="0.6"
          animate={{ cy: 250, cx: [x, x + 18, x - 6, x + 10] }}
          transition={{ duration: 9 + i * 1.8, repeat: Infinity, ease: 'linear', delay: i * 1.4 }} />
      ))}
    </svg>
  );
}

// ── Rope XP bar ───────────────────────────────────────────────────────────────
function RopeXPBar({ xp, level, nextLevelXp, thresholds }) {
  const prevThreshold = thresholds?.[level - 1] ?? 0;
  const span = Math.max(1, (nextLevelXp ?? prevThreshold + 300) - prevThreshold);
  const pct = Math.min(100, Math.round(((xp - prevThreshold) / span) * 100));
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, marginBottom: 6 }}>
        <span style={{ color: '#F5A623' }}>Level {level} Historian</span>
        <span style={{ color: 'rgba(240,237,230,0.45)' }}>{xp.toLocaleString()} / {(nextLevelXp ?? '∞').toLocaleString?.() || nextLevelXp} XP</span>
      </div>
      <div style={{ position: 'relative', height: 14 }}>
        {/* rope texture: repeating diagonal weave */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 7,
          background: 'rgba(240,237,230,0.07)',
          overflow: 'hidden',
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: 7,
              background: 'repeating-linear-gradient(115deg, #B8862B 0px, #DCA63E 5px, #8B6914 10px, #C8963A 15px)',
              boxShadow: '0 0 12px rgba(245,166,35,0.35)',
            }}
          />
        </div>
        {/* carabiner at progress tip */}
        <motion.div
          initial={{ left: 0 }} animate={{ left: `${pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
          style={{ position: 'absolute', top: -4, marginLeft: -10, fontSize: 15 }}>
          🪝
        </motion.div>
      </div>
    </div>
  );
}

// ── Campsite skill node ───────────────────────────────────────────────────────
function Campsite({ skillKey, value, label, color, onDrill }) {
  const state = value >= 80 ? 'established' : value >= 40 ? 'active' : 'cold';
  const icon = state === 'established' ? '🏕️' : state === 'active' ? '⛺' : '🌑';
  return (
    <motion.button
      onClick={() => onDrill(skillKey)}
      whileHover={{ y: -3 }} whileTap={{ scale: 0.95 }}
      title={`${label}: ${value}% — click to practice`}
      style={{
        background: state === 'established' ? `${color}14` : 'rgba(240,237,230,0.04)',
        border: `1px solid ${state === 'established' ? color + '55' : state === 'cold' ? 'rgba(232,93,74,0.4)' : 'rgba(240,237,230,0.12)'}`,
        borderRadius: 12, padding: '10px 8px', cursor: 'pointer',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
        minWidth: 86, flex: 1,
        boxShadow: state === 'established' ? `0 0 14px ${color}25` : 'none',
      }}
    >
      <motion.span
        animate={state === 'established' ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 2.5, repeat: Infinity }}
        style={{ fontSize: 20, filter: state === 'cold' ? 'grayscale(0.8) brightness(0.7)' : 'none' }}
      >
        {icon}
      </motion.span>
      <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(240,237,230,0.7)', textAlign: 'center', lineHeight: 1.25 }}>
        {label}
      </span>
      <span style={{ fontSize: 10, fontWeight: 800, color: state === 'cold' ? '#E85D4A' : color }}>{value}%</span>
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
        position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(6,8,12,0.85)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
      <motion.div initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #1E2D40, #162030)',
          border: '1px solid rgba(245,166,35,0.3)', borderRadius: 18,
          padding: '28px 26px', maxWidth: 520, width: '100%',
        }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, color: '#F5A623', fontWeight: 700, marginBottom: 6 }}>
          ⛺ Campsite Drill — {criterion.replace(/_/g, ' ')}
        </div>
        {!drill ? (
          <div style={{ color: 'rgba(240,237,230,0.4)', fontSize: 13, padding: '20px 0' }}>Stoking the fire…</div>
        ) : result ? (
          <div>
            <div style={{
              fontSize: 26, textAlign: 'center', margin: '12px 0 8px',
            }}>{result.result?.earned ? '🔥' : '🪵'}</div>
            <div style={{
              fontFamily: 'Cinzel, serif', textAlign: 'center', fontSize: 15, fontWeight: 700,
              color: result.result?.earned ? '#52B788' : '#E85D4A', marginBottom: 8,
            }}>
              {result.result?.earned ? 'Point earned!' : 'Not yet'}
            </div>
            <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.75)', lineHeight: 1.6 }}>{result.result?.feedback}</p>
            {result.award?.xpGain > 0 && (
              <div style={{ textAlign: 'center', color: '#F5A623', fontWeight: 800, fontSize: 13, margin: '8px 0' }}>
                +{result.award.xpGain} XP
              </div>
            )}
            <button onClick={onClose} style={{
              width: '100%', marginTop: 10, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #8B6914, #F5A623)', color: '#1C1208', fontWeight: 800, fontSize: 14,
            }}>Back to the trail</button>
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
            <button onClick={submit} disabled={busy || !answer.trim()} style={{
              width: '100%', marginTop: 12, padding: '11px', borderRadius: 10, border: 'none',
              cursor: busy ? 'wait' : 'pointer', opacity: !answer.trim() ? 0.5 : 1,
              background: 'linear-gradient(135deg, #2D6A4F, #52B788)', color: '#fff', fontWeight: 800, fontSize: 14,
            }}>{busy ? 'Grading…' : 'Submit drill'}</button>
          </div>
        )}
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
      background: '#0F1720',
    }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(15,23,32,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(240,237,230,0.08)',
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(240,237,230,0.5)', fontSize: 13, fontWeight: 700, padding: '4px 8px',
        }}>← Games</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: '#F5A623', letterSpacing: '0.06em' }}>
          🏔 Summit Write
        </span>
        {streak > 0 ? (
          <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 1.8, repeat: Infinity }}
            style={{ fontSize: 13, fontWeight: 800, color: '#E85D4A' }}>
            🔥 {streak}
          </motion.div>
        ) : <div style={{ width: 40 }} />}
      </nav>

      {/* Hero: mountain scene */}
      <div style={{ position: 'relative' }}>
        <MountainScene height={200} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          padding: '0 24px 14px', pointerEvents: 'none',
          background: 'linear-gradient(180deg, transparent 40%, rgba(15,23,32,0.55) 85%, #0F1720 100%)',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(18px, 4.5vw, 26px)', fontWeight: 700, color: '#F0EDE6', textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}>
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {displayName}.
          </div>
          <div style={{ fontSize: 12.5, color: 'rgba(240,237,230,0.6)', fontWeight: 600, marginTop: 2 }}>
            Write. Climb. Master.
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '18px 16px 80px' }}>
        {/* XP rope */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: '#1E2D40', border: '1px solid rgba(240,237,230,0.08)',
            borderRadius: 14, padding: '16px 18px', marginBottom: 16,
          }}>
          <RopeXPBar xp={xp} level={level} nextLevelXp={meta.nextLevelXp} thresholds={meta.thresholds} />
        </motion.div>

        {/* Pending assignments */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#F5A623', letterSpacing: '0.14em', margin: '0 0 10px', fontWeight: 700 }}>
            PENDING ASSIGNMENTS
          </h2>
          {loading ? (
            <div style={{ color: 'rgba(240,237,230,0.35)', fontSize: 13, padding: '14px 0' }}>Loading…</div>
          ) : pending.length === 0 ? (
            <div style={{
              background: '#1E2D40', borderRadius: 14, padding: '22px', textAlign: 'center',
              border: '1px solid rgba(240,237,230,0.06)',
              color: 'rgba(240,237,230,0.4)', fontSize: 13,
            }}>
              No pending assignments. {submitted.length > 0 ? 'All caught up — review your results below or run a campsite drill.' : 'Ask your teacher for the class join code, or wait for an assignment.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pending.map((a) => {
                const trail = TRAILS.find((t) => t.type === a.type) || TRAILS[0];
                const due = a.due_date ? new Date(a.due_date) : null;
                const overdue = due && due < new Date();
                return (
                  <motion.button key={a.id}
                    whileHover={{ x: 4 }} whileTap={{ scale: 0.99 }}
                    onClick={() => navigate('writing_room', { assignmentId: a.id })}
                    style={{
                      background: '#1E2D40', border: `1px solid ${trail.color}30`,
                      borderLeft: `4px solid ${trail.color}`,
                      borderRadius: 12, padding: '14px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                    }}>
                    <div style={{
                      fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 700, color: trail.color,
                      background: `${trail.color}14`, border: `1px solid ${trail.color}40`,
                      borderRadius: 8, padding: '6px 10px', flexShrink: 0,
                    }}>{a.type}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#F0EDE6', marginBottom: 2 }}>{a.title}</div>
                      <div style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.45)', fontWeight: 600 }}>
                        {a.class_name || 'Open assignment'}
                        {due && <span style={{ color: overdue ? '#E85D4A' : 'rgba(240,237,230,0.45)' }}> · due {due.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                        {a.type === 'DBQ' && a.doc_count > 0 && ` · ${a.doc_count} documents`}
                      </div>
                    </div>
                    <span style={{ color: trail.color, fontSize: 18, flexShrink: 0 }}>✍️</span>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Trails */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#F5A623', letterSpacing: '0.14em', margin: '0 0 10px', fontWeight: 700 }}>
            YOUR TRAILS
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {TRAILS.map((t) => {
              const feet = trailFeet(t.type);
              return (
                <div key={t.type} style={{
                  background: `linear-gradient(170deg, ${t.peak}22, #1E2D40 70%)`,
                  border: `1px solid ${t.color}28`, borderRadius: 14,
                  padding: '14px 12px', textAlign: 'center', position: 'relative', overflow: 'hidden',
                }}>
                  {/* mini peak silhouette */}
                  <svg viewBox="0 0 100 38" style={{ width: '100%', height: 34, marginBottom: 4 }}>
                    <path d="M0 38 L26 14 L38 24 L52 6 L68 22 L82 12 L100 38 Z" fill={t.peak} opacity="0.8" />
                    <path d="M48 11 L52 6 L57 12 L52 14 Z" fill="#E8E4DC" opacity="0.8" />
                  </svg>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 12, fontWeight: 700, color: t.color }}>{t.name}</div>
                  <div style={{ fontSize: 9.5, color: 'rgba(240,237,230,0.4)', fontWeight: 600, marginBottom: 4 }}>{t.sub}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#F0EDE6' }}>{feet.toLocaleString()}<span style={{ fontSize: 10, color: 'rgba(240,237,230,0.4)' }}> ft</span></div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Campsites (skills) */}
        {Object.keys(skills).length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#F5A623', letterSpacing: '0.14em', margin: '0 0 4px', fontWeight: 700 }}>
              CAMPSITES
            </h2>
            <p style={{ fontSize: 11.5, color: 'rgba(240,237,230,0.4)', margin: '0 0 10px' }}>
              Cold campsites need attention — click one to run a practice drill.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {Object.entries(skills).map(([k, v]) => (
                <Campsite key={k} skillKey={k} value={Math.round(v)} label={SKILL_LABELS[k] || k}
                  color="#52B788" onDrill={(c) => setDrill(c)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }} style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#F5A623', letterSpacing: '0.14em', margin: '0 0 10px', fontWeight: 700 }}>
              MEDALLIONS
            </h2>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {badges.map((b) => (
                <div key={b} title={b.replace(/_/g, ' ')} style={{
                  width: 58, height: 58, borderRadius: '50%',
                  background: 'radial-gradient(circle at 35% 30%, #DCA63E, #8B6914 70%)',
                  border: '2px solid rgba(245,166,35,0.55)',
                  boxShadow: '0 4px 14px rgba(245,166,35,0.25), inset 0 2px 4px rgba(255,255,255,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                }}>
                  {BADGE_ICONS[b] || '⭐'}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Recent results */}
        {submitted.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }} style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: '#F5A623', letterSpacing: '0.14em', margin: '0 0 10px', fontWeight: 700 }}>
              RECENT CLIMBS
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {submitted.slice(0, 6).map((a) => {
                const s = a.latest_submission;
                const pct = s.max_score ? (s.ai_score / s.max_score) : 0;
                const color = pct >= 0.8 ? '#F5A623' : pct >= 0.5 ? '#52B788' : '#E85D4A';
                return (
                  <button key={a.id} onClick={() => navigate('write_results', { submissionId: s.id })}
                    style={{
                      background: '#1E2D40', border: '1px solid rgba(240,237,230,0.07)',
                      borderRadius: 12, padding: '12px 16px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', width: '100%',
                    }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#F0EDE6' }}>{a.title}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,237,230,0.4)', fontWeight: 600 }}>
                        Attempt {s.attempt_number} · {new Date(s.submitted_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: 17, fontWeight: 700, color, flexShrink: 0 }}>
                      {s.teacher_score ?? s.ai_score}/{s.max_score}
                    </div>
                  </button>
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
