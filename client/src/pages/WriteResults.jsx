'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { RUBRICS } from '../lib/rubrics.js';

// ── Summit Write — grading results, annotations, revision ────────────────────

const C = {
  bg: '#0F1720', card: '#1E2D40', elevated: '#243548',
  text: '#F0EDE6', mid: '#A8B8C8', muted: '#6B7E8F',
  gold: '#F5A623', pine: '#52B788', pineDark: '#2D6A4F', sunset: '#E85D4A',
};

function scoreColor(pct) {
  return pct >= 0.8 ? C.gold : pct >= 0.5 ? C.pine : C.sunset;
}

// ── Animated count-up score ───────────────────────────────────────────────────
function ScoreReveal({ score, max }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i++;
      setShown(Math.min(i, score));
      if (i >= score) clearInterval(t);
    }, 280);
    return () => clearInterval(t);
  }, [score]);
  const color = scoreColor(max ? score / max : 0);
  return (
    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(40px, 11vw, 64px)', fontWeight: 700, color, textShadow: `0 0 36px ${color}50` }}>
      {shown}<span style={{ fontSize: '0.5em', color: C.muted }}>/{max}</span>
    </span>
  );
}

// ── Annotated essay rendering ─────────────────────────────────────────────────
function AnnotatedEssay({ essayText, annotations, onSelect }) {
  const segments = useMemo(() => {
    if (!annotations?.length) return [{ text: essayText }];
    // Build non-overlapping highlight segments by locating each annotation excerpt
    const marks = [];
    for (const a of annotations) {
      if (!a.text) continue;
      const idx = essayText.indexOf(a.text);
      if (idx >= 0) marks.push({ start: idx, end: idx + a.text.length, ann: a });
    }
    marks.sort((x, y) => x.start - y.start);
    const out = [];
    let pos = 0;
    for (const m of marks) {
      if (m.start < pos) continue; // skip overlaps
      if (m.start > pos) out.push({ text: essayText.slice(pos, m.start) });
      out.push({ text: essayText.slice(m.start, m.end), ann: m.ann });
      pos = m.end;
    }
    if (pos < essayText.length) out.push({ text: essayText.slice(pos) });
    return out;
  }, [essayText, annotations]);

  const underline = { success: C.pine, warning: '#E8A53A', error: C.sunset };

  return (
    <div style={{
      background: '#F5E6C8', borderRadius: 8, padding: 'clamp(20px, 4vw, 36px)',
      fontFamily: 'Nunito, sans-serif', fontSize: 16, lineHeight: 1.85, color: '#1A0F08',
      whiteSpace: 'pre-wrap',
    }}>
      {segments.map((s, i) => s.ann ? (
        <span key={i} onClick={() => onSelect(s.ann)} style={{
          borderBottom: `2.5px solid ${underline[s.ann.status] || C.mid}`,
          background: `${(underline[s.ann.status] || C.mid)}18`,
          cursor: 'pointer', borderRadius: 2,
        }}>{s.text}</span>
      ) : (
        <span key={i}>{s.text}</span>
      ))}
    </div>
  );
}

// ── Coaching panel ────────────────────────────────────────────────────────────
function CoachPanel({ annotation, onClose, onRevise }) {
  const statusLabel = { success: 'Strong passage', warning: 'Needs improvement', error: 'Problem area' };
  const statusColor = { success: C.pine, warning: '#E8A53A', error: C.sunset };
  return (
    <AnimatePresence>
      {annotation && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(6,8,12,0.6)', zIndex: 290 }} />
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(420px, 94vw)', zIndex: 300,
              background: `linear-gradient(170deg, ${C.elevated}, ${C.card})`,
              borderLeft: `1px solid ${statusColor[annotation.status]}40`,
              padding: '22px 22px', overflowY: 'auto',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.6)',
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: statusColor[annotation.status] }}>
                {statusLabel[annotation.status] || 'Note'}
              </span>
              <button onClick={onClose} style={{
                background: 'rgba(240,237,230,0.07)', border: 'none', borderRadius: 8, cursor: 'pointer',
                color: C.mid, fontSize: 13, fontWeight: 800, padding: '5px 12px',
              }}>✕</button>
            </div>
            <div style={{
              background: '#F5E6C8', borderRadius: 8, padding: '14px 16px', marginBottom: 16,
              fontSize: 13.5, lineHeight: 1.7, color: '#1A0F08', fontStyle: 'italic',
            }}>
              "{annotation.text}"
            </div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', color: C.muted, textTransform: 'uppercase', marginBottom: 6 }}>
              {String(annotation.category || '').replace(/_/g, ' ')}
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: C.text, margin: '0 0 20px' }}>
              {annotation.comment}
            </p>
            {annotation.status !== 'success' && annotation.category && (
              <button onClick={() => onRevise(annotation.category)} style={{
                width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
                background: `linear-gradient(135deg, ${C.pineDark}, ${C.pine})`, color: '#fff',
                fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif',
              }}>✍️ Revise this section</button>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Revision micro-editor ─────────────────────────────────────────────────────
function RevisionModal({ criterion, feedback, submissionId, onClose, onImproved }) {
  const [revision, setRevision] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit() {
    if (busy || revision.trim().length < 10) return;
    setBusy(true);
    try {
      const r = await api.post('/api/write/revise', { submissionId, criterion, revisedPassage: revision });
      setResult(r);
      if (r.improved) onImproved(r);
    } catch (e) {
      setResult({ result: { feedback: e.message }, improved: false });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(6,8,12,0.85)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18,
      }}>
      <motion.div initial={{ scale: 0.92, y: 18 }} animate={{ scale: 1, y: 0 }}
        style={{
          background: C.card, border: `1px solid ${C.gold}30`, borderRadius: 18,
          padding: '26px 24px', maxWidth: 620, width: '100%', maxHeight: '88vh', overflowY: 'auto',
        }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 6, textTransform: 'capitalize' }}>
          🔄 Revise — {criterion.replace(/_/g, ' ')}
        </div>
        {feedback && (
          <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.65, margin: '0 0 14px' }}>
            <strong style={{ color: C.text }}>Grader's note:</strong> {feedback}
          </p>
        )}
        {result ? (
          <div>
            <div style={{ fontSize: 28, textAlign: 'center', margin: '10px 0 6px' }}>
              {result.improved ? '🎉' : '🪨'}
            </div>
            <div style={{
              fontFamily: 'Cinzel, serif', textAlign: 'center', fontSize: 16, fontWeight: 700,
              color: result.improved ? C.pine : C.sunset, marginBottom: 8,
            }}>
              {result.improved ? `Point earned! New score: ${result.newScore}` : 'Not yet — keep climbing'}
            </div>
            <p style={{ fontSize: 13.5, color: C.text, lineHeight: 1.65 }}>{result.result?.feedback}</p>
            <button onClick={onClose} style={{
              width: '100%', marginTop: 12, padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, #8B6914, ${C.gold})`, color: '#1C1208', fontWeight: 800, fontSize: 14,
            }}>Back to results</button>
          </div>
        ) : (
          <>
            <textarea
              value={revision} onChange={(e) => setRevision(e.target.value)}
              rows={7} placeholder="Write your improved passage here. It will be graded against this one criterion only."
              style={{
                width: '100%', boxSizing: 'border-box', borderRadius: 10, padding: '14px 16px',
                background: '#F5E6C8', color: '#1A0F08', border: 'none',
                fontFamily: 'Nunito, sans-serif', fontSize: 15, lineHeight: 1.75, resize: 'vertical',
              }}
            />
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button onClick={onClose} style={{
                flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
                background: 'rgba(240,237,230,0.06)', border: '1px solid rgba(240,237,230,0.14)',
                color: C.mid, fontWeight: 800, fontSize: 13.5,
              }}>Cancel</button>
              <button onClick={submit} disabled={busy || revision.trim().length < 10} style={{
                flex: 2, padding: '12px', borderRadius: 10, border: 'none',
                cursor: busy ? 'wait' : 'pointer', opacity: revision.trim().length < 10 ? 0.5 : 1,
                background: `linear-gradient(135deg, ${C.pineDark}, ${C.pine})`, color: '#fff',
                fontWeight: 800, fontSize: 13.5,
              }}>{busy ? 'Re-grading…' : 'Submit revision →'}</button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WriteResults() {
  const { navigate, screenParams } = useApp();
  const { submissionId, justGraded, award } = screenParams;

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [revising, setRevising] = useState(null);

  const load = () => api.get(`/api/write/submissions/${submissionId}`)
    .then((d) => setSubmission(d.submission))
    .catch(() => {})
    .finally(() => setLoading(false));

  useEffect(() => {
    if (!submissionId) { navigate('write_home'); return; }
    load();
  }, [submissionId]);

  // celebrate good scores
  useEffect(() => {
    if (!justGraded || !submission) return;
    const g = submission.grading_json;
    if (g && g.maxScore && g.score / g.maxScore >= 0.7) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 75, origin: { y: 0.5 }, colors: ['#F5A623', '#52B788', '#F0EDE6'] });
      }).catch(() => {});
    }
  }, [justGraded, submission?.id]);

  if (loading || !submission) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.muted, fontFamily: 'Nunito, sans-serif', fontSize: 14 }}>
      {loading ? 'Reading your essay…' : 'Submission not found.'}
    </div>
  );

  const g = submission.grading_json || {};
  const score = submission.teacher_score ?? g.score ?? 0;
  const max = g.maxScore || submission.max_score || 7;
  const rubric = RUBRICS[submission.assignment_type] || RUBRICS.LEQ;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(15,23,32,0.92)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(240,237,230,0.08)',
      }}>
        <button onClick={() => navigate('write_home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: C.muted, fontSize: 13, fontWeight: 700,
        }}>← Summit Write</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13.5, fontWeight: 700, color: C.gold }}>
          {submission.assignment_title}
        </span>
        <div style={{ width: 60 }} />
      </nav>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '26px 16px 80px' }}>
        {/* Score card */}
        <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }}
          style={{
            background: `linear-gradient(160deg, ${C.elevated}, ${C.card})`,
            border: '1px solid rgba(240,237,230,0.1)', borderRadius: 18,
            padding: '34px 24px 26px', textAlign: 'center', marginBottom: 18,
          }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>
            {submission.assignment_type} · Attempt {submission.attempt_number}
          </div>
          <ScoreReveal score={score} max={max} />
          {award?.xpGain > 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
              style={{ color: C.gold, fontWeight: 800, fontSize: 14, marginTop: 6 }}>
              +{award.xpGain} XP {award.streak > 1 ? ` · 🔥 ${award.streak}-day streak` : ''}
            </motion.div>
          )}
          {g.overallFeedback && (
            <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.7, maxWidth: 480, margin: '14px auto 0' }}>
              {g.overallFeedback}
            </p>
          )}
          {submission.teacher_note && (
            <p style={{ fontSize: 13.5, color: C.gold, lineHeight: 1.65, maxWidth: 480, margin: '10px auto 0', fontStyle: 'italic' }}>
              Teacher: "{submission.teacher_note}"
            </p>
          )}
        </motion.div>

        {/* Strength + growth */}
        {(g.strengthSummary || g.growthTarget) && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10, marginBottom: 18 }}>
            {g.strengthSummary && (
              <div style={{ background: `${C.pine}10`, border: `1px solid ${C.pine}35`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', color: C.pine, marginBottom: 5 }}>💪 STRENGTH</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{g.strengthSummary}</div>
              </div>
            )}
            {g.growthTarget && (
              <div style={{ background: `${C.gold}0E`, border: `1px solid ${C.gold}35`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: '0.14em', color: C.gold, marginBottom: 5 }}>🎯 NEXT TARGET</div>
                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.6 }}>{g.growthTarget}</div>
              </div>
            )}
          </div>
        )}

        {/* Breakdown */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: C.card, border: '1px solid rgba(240,237,230,0.08)', borderRadius: 14, overflow: 'hidden', marginBottom: 22 }}>
          {Object.entries(g.breakdown || {}).map(([key, b], i, arr) => {
            const def = rubric.criteria[key];
            const open = expanded === key;
            return (
              <div key={key} style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(240,237,230,0.06)' : 'none' }}>
                <button onClick={() => setExpanded(open ? null : key)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '14px 18px', textAlign: 'left',
                }}>
                  <span style={{
                    fontSize: 16, fontWeight: 900, width: 22, flexShrink: 0,
                    color: b.earned ? C.pine : C.sunset,
                  }}>{b.earned ? '✓' : '✗'}</span>
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 800, color: C.text }}>
                    {def?.label || key.replace(/_/g, ' ')}
                    {b.revised && <span style={{ color: C.gold, fontSize: 11, marginLeft: 8 }}>↻ revised</span>}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 800, color: b.earned ? C.pine : C.muted }}>
                    {b.points}/{b.maxPoints ?? def?.points ?? 1}
                  </span>
                  <motion.span animate={{ rotate: open ? 90 : 0 }} style={{ color: C.muted, fontSize: 12 }}>▸</motion.span>
                </button>
                <AnimatePresence>
                  {open && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: 'hidden' }}>
                      <div style={{ padding: '0 18px 16px 52px' }}>
                        <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.7, margin: '0 0 10px' }}>{b.feedback}</p>
                        {!b.earned && (
                          <button onClick={() => setRevising({ criterion: key, feedback: b.feedback })} style={{
                            background: `${C.pine}14`, border: `1px solid ${C.pine}40`, borderRadius: 8,
                            color: C.pine, fontSize: 12, fontWeight: 800, padding: '7px 14px', cursor: 'pointer',
                          }}>✍️ Revise for this point</button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>

        {/* Annotated essay */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 13, color: C.gold, letterSpacing: '0.14em', margin: '0 0 6px', fontWeight: 700 }}>
            YOUR ESSAY{g.annotations?.length ? ' — TAP A HIGHLIGHT FOR COACHING' : ''}
          </h2>
          {g.annotations?.length > 0 && (
            <div style={{ display: 'flex', gap: 14, fontSize: 11, fontWeight: 700, color: C.muted, marginBottom: 10 }}>
              <span><span style={{ color: C.pine }}>—</span> strong</span>
              <span><span style={{ color: '#E8A53A' }}>—</span> improve</span>
              <span><span style={{ color: C.sunset }}>—</span> problem</span>
            </div>
          )}
          <AnnotatedEssay essayText={submission.essay_text} annotations={g.annotations} onSelect={setSelectedAnn} />
        </motion.div>
      </main>

      <CoachPanel annotation={selectedAnn} onClose={() => setSelectedAnn(null)}
        onRevise={(criterion) => {
          setSelectedAnn(null);
          setRevising({ criterion, feedback: g.breakdown?.[criterion]?.feedback });
        }} />

      <AnimatePresence>
        {revising && (
          <RevisionModal
            criterion={revising.criterion}
            feedback={revising.feedback}
            submissionId={submissionId}
            onClose={() => setRevising(null)}
            onImproved={() => load()}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
