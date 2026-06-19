'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { Vignette, ParticleField, OrnateCard, SectionTitle, goldText } from '../components/write/fx.jsx';

// ── Student Portfolio (screen "write_portfolio") ─────────────────────────────
// A scrollable timeline of a student's writing history: growth lines per essay
// type, a rubric-skill heatmap, auto-generated milestones, and expandable
// per-essay cards. Reused (read-only, via a studentId prop) for the teacher's
// per-student view from the class dashboard.

const C = {
  bg: '#0F1720', card: '#1E2D40', elevated: '#243548',
  text: '#F0EDE6', mid: '#A8B8C8', muted: '#6B7E8F',
  gold: '#F5A623', pine: '#52B788', pineDark: '#2D6A4F', sunset: '#E85D4A',
  border: 'rgba(240,237,230,0.08)',
};

const TYPE_COLOR = { SAQ: C.pine, LEQ: C.gold, DBQ: C.sunset };

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function heatColor(rate) {
  // 0 → sunset (red), 0.5 → gold, 1 → pine (green)
  if (rate >= 0.66) return C.pine;
  if (rate >= 0.33) return C.gold;
  return C.sunset;
}

function Nav({ onBack, title }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'linear-gradient(180deg, rgba(10,16,24,0.95), rgba(15,23,32,0.88))', backdropFilter: 'blur(14px)',
      borderBottom: `1px solid ${C.border}`,
    }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, fontWeight: 700,
      }}>← Back</button>
      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(11px, 3.2vw, 15px)', fontWeight: 800, letterSpacing: '0.12em', textAlign: 'center', ...goldText }}>
        {title}
      </span>
      <div style={{ width: 50 }} />
    </nav>
  );
}

// ── Lightweight SVG growth-line chart ────────────────────────────────────────
function GrowthLine({ type, points }) {
  const W = 100, H = 36, PAD = 4;
  const pct = points.map((p) => p.score / p.maxScore);
  const coords = pct.map((v, i) => {
    const x = points.length === 1 ? W / 2 : PAD + (i / (points.length - 1)) * (W - PAD * 2);
    const y = H - PAD - v * (H - PAD * 2);
    return [x, y];
  });
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const color = TYPE_COLOR[type];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12.5, fontWeight: 800, color: C.text }}>{type}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>
          {points[points.length - 1].score}/{points[points.length - 1].maxScore} latest
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 64, overflow: 'visible' }} preserveAspectRatio="none">
        <line x1={0} y1={H - PAD} x2={W} y2={H - PAD} stroke={C.border} strokeWidth={0.5} />
        {coords.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth={1.6} />}
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.8} fill={color} />
        ))}
      </svg>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
        {points.length} attempt{points.length > 1 ? 's' : ''} — {points[0].score}/{points[0].maxScore} → {points[points.length - 1].score}/{points[points.length - 1].maxScore}
      </div>
    </div>
  );
}

function MilestoneStrip({ milestones }) {
  if (!milestones.length) return null;
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6 }}>
      {milestones.map((m) => (
        <div key={m.key} style={{
          flexShrink: 0, minWidth: 160, background: `${C.gold}10`, border: `1px solid ${C.gold}40`,
          borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ fontSize: 22 }}>{m.icon}</div>
          <div style={{ fontSize: 12.5, fontWeight: 800, color: C.text, lineHeight: 1.3 }}>{m.label}</div>
          <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{fmtDate(m.date)}</div>
        </div>
      ))}
    </div>
  );
}

function SkillHeatmap({ skills }) {
  if (!skills.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
      {skills.map((s) => {
        const color = heatColor(s.earnedRate);
        return (
          <div key={s.key} style={{
            background: `${color}14`, border: `1px solid ${color}55`, borderRadius: 10, padding: '10px 12px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{s.label}</div>
            <div style={{ fontSize: 16, fontWeight: 900, color }}>{Math.round(s.earnedRate * 100)}%</div>
            <div style={{ fontSize: 10.5, color: C.muted, fontWeight: 600 }}>{s.attempts} attempt{s.attempts > 1 ? 's' : ''}</div>
          </div>
        );
      })}
    </div>
  );
}

function PortfolioCard({ entry, expanded, onToggle }) {
  const color = TYPE_COLOR[entry.type] || C.gold;
  return (
    <OrnateCard style={{ padding: 0, overflow: 'hidden' }}>
      <div
        role="button" tabIndex={0}
        onClick={onToggle}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onToggle(); }}
        style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 40, height: 40, flexShrink: 0, borderRadius: 9, background: `${color}1c`,
          border: `1px solid ${color}55`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 12.5, color,
        }}>{entry.type}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text, marginBottom: 2 }}>{entry.title}</div>
          <div style={{ fontSize: 11.5, color: C.muted, fontWeight: 600 }}>
            {fmtDate(entry.date)} · {entry.mode === 'guided' ? 'Guided Walk' : 'Independent'}
            {entry.attemptNumber > 1 ? ` · attempt ${entry.attemptNumber}` : ''}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 17, color }}>{entry.score}/{entry.maxScore}</div>
        </div>
      </div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', borderTop: `1px solid ${C.border}` }}>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {entry.breakdown && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {Object.entries(entry.breakdown).map(([key, b]) => (
                    <div key={key} style={{
                      display: 'flex', justifyContent: 'space-between', gap: 10,
                      fontSize: 12.5, color: C.mid, padding: '4px 0',
                    }}>
                      <span>{b.earned ? '✓' : '✗'} {key.replace(/_/g, ' ')}</span>
                      <span style={{ fontWeight: 800, color: b.earned ? C.pine : C.sunset }}>{b.points}/{b.maxPoints}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{
                background: C.elevated, borderRadius: 10, padding: '12px 14px', fontSize: 12.5,
                color: C.mid, lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: 260, overflowY: 'auto',
              }}>
                {entry.essayText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </OrnateCard>
  );
}

export default function Portfolio({ studentId } = {}) {
  const { navigate, screenParams } = useApp();
  const sid = studentId || screenParams?.studentId || null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const path = sid ? `/api/write/portfolio/${sid}` : '/api/write/portfolio';
    api.get(path)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sid]);

  const reversedEntries = useMemo(() => (data?.entries ? [...data.entries].reverse() : []), [data]);

  const onBack = () => navigate(sid ? 'write_teacher' : 'write_home');

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: 'Nunito, sans-serif' }}>
      <Vignette />
      <ParticleField count={10} color={C.gold} type="dust" />
      <Nav onBack={onBack} title={data?.student ? `${data.student.name || data.student.username}'s Portfolio` : '📜 PORTFOLIO'} />

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '24px 20px 100px', position: 'relative', zIndex: 3 }}>
        {loading && <div style={{ textAlign: 'center', color: C.muted, padding: '10vh 0' }}>Loading portfolio…</div>}
        {error && <div style={{ textAlign: 'center', color: C.sunset, fontWeight: 700, padding: 20 }}>{error}</div>}

        {data && data.totalEssays === 0 && (
          <div style={{ textAlign: 'center', padding: '10vh 20px', color: C.muted }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>📜</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>No essays yet — once you submit one, it'll show up here.</div>
          </div>
        )}

        {data && data.totalEssays > 0 && (
          <>
            {data.milestones.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 26 }}>
                <SectionTitle>MILESTONES</SectionTitle>
                <MilestoneStrip milestones={data.milestones} />
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} style={{ marginBottom: 26 }}>
              <SectionTitle>GROWTH TIMELINE</SectionTitle>
              <OrnateCard style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 18 }}>
                {['SAQ', 'LEQ', 'DBQ'].map((type) => (
                  data.growthTimeline[type]?.length > 0 && <GrowthLine key={type} type={type} points={data.growthTimeline[type]} />
                ))}
                {['SAQ', 'LEQ', 'DBQ'].every((t) => !data.growthTimeline[t]?.length) && (
                  <div style={{ color: C.muted, fontSize: 13 }}>Not enough data yet.</div>
                )}
              </OrnateCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} style={{ marginBottom: 26 }}>
              <SectionTitle>SKILL HEATMAP</SectionTitle>
              <SkillHeatmap skills={data.skillHeatmap} />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
              <SectionTitle>ESSAY HISTORY</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {reversedEntries.map((entry) => (
                  <PortfolioCard
                    key={entry.id}
                    entry={entry}
                    expanded={expandedId === entry.id}
                    onToggle={() => setExpandedId((cur) => (cur === entry.id ? null : entry.id))}
                  />
                ))}
              </div>
            </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
