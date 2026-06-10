'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { RUBRICS } from '../lib/rubrics.js';

// ── The Writing Room — warm, cozy, candlelit essay editor ─────────────────────

const WR = {
  bg: '#1C1208', surface: '#241A0C', parchment: '#F5E6C8', ink: '#1A0F08',
  ember: '#E8853A', emberSoft: '#3D1F0A', cream: '#ECD9B0', oak: '#4A2E12',
  success: '#2D6A4F', warning: '#B8860B', error: '#8B1A1A',
};

// ── Ambient audio (WebAudio noise — no audio files needed) ───────────────────
function useAmbient() {
  const [mode, setMode] = useState(() => localStorage.getItem('wr_ambient') || 'off');
  const ctxRef = useRef(null);
  const nodesRef = useRef([]);

  const stop = useCallback(() => {
    nodesRef.current.forEach((n) => { try { n.stop ? n.stop() : n.disconnect(); } catch (_) {} });
    nodesRef.current = [];
  }, []);

  const start = useCallback((m) => {
    stop();
    if (m === 'off') return;
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = ctxRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    // white-noise buffer
    const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    if (m === 'fire') {
      filter.type = 'lowpass'; filter.frequency.value = 320;
      gain.gain.value = 0.05;
      // crackle: slow random gain wobble
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = 'sine'; lfo.frequency.value = 7; lfoGain.gain.value = 0.025;
      lfo.connect(lfoGain); lfoGain.connect(gain.gain); lfo.start();
      nodesRef.current.push(lfo);
    } else if (m === 'rain') {
      filter.type = 'bandpass'; filter.frequency.value = 1400; filter.Q.value = 0.4;
      gain.gain.value = 0.045;
    } else { // library — very soft brown noise feel
      filter.type = 'lowpass'; filter.frequency.value = 160;
      gain.gain.value = 0.03;
    }

    src.connect(filter); filter.connect(gain); gain.connect(ctx.destination);
    src.start();
    nodesRef.current.push(src, filter, gain);
  }, [stop]);

  const cycle = useCallback(() => {
    const order = ['off', 'fire', 'rain', 'library'];
    const next = order[(order.indexOf(mode) + 1) % order.length];
    setMode(next);
    localStorage.setItem('wr_ambient', next);
    start(next);
  }, [mode, start]);

  useEffect(() => () => stop(), [stop]);

  return { mode, cycle };
}

// ── Candle glow ───────────────────────────────────────────────────────────────
function CandleGlow() {
  return (
    <>
      <motion.div
        animate={{ opacity: [0.35, 0.5, 0.32, 0.45, 0.35] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', left: -160, top: '20%', width: 460, height: 560,
          background: `radial-gradient(ellipse, ${WR.ember}30 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />
      <motion.div
        animate={{ opacity: [0.18, 0.3, 0.16, 0.26, 0.18] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        style={{
          position: 'fixed', right: -120, bottom: '5%', width: 340, height: 420,
          background: `radial-gradient(ellipse, ${WR.ember}22 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />
    </>
  );
}

// ── Document panel (oak, slides from right; bottom drawer on mobile) ─────────
function DocsPanel({ documents, open, onClose, isMobile }) {
  const [activeDoc, setActiveDoc] = useState(0);
  const doc = documents[activeDoc];

  const panelStyle = isMobile
    ? { position: 'fixed', left: 0, right: 0, bottom: 0, height: '72vh', borderRadius: '18px 18px 0 0', zIndex: 300 }
    : { position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(440px, 92vw)', zIndex: 300 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,6,2,0.6)', zIndex: 290 }} />
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              ...panelStyle,
              background: `linear-gradient(170deg, ${WR.oak}, #38220C)`,
              borderLeft: isMobile ? 'none' : `1px solid ${WR.ember}40`,
              borderTop: isMobile ? `1px solid ${WR.ember}40` : 'none',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.6)',
            }}>
            {/* header + tabs */}
            <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: WR.cream }}>
                  📜 Documents
                </span>
                <button onClick={onClose} style={{
                  background: 'rgba(0,0,0,0.25)', border: 'none', borderRadius: 8, cursor: 'pointer',
                  color: WR.cream, fontSize: 13, fontWeight: 800, padding: '5px 12px',
                }}>✕</button>
              </div>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 10 }}>
                {documents.map((d, i) => (
                  <button key={d.id || i} onClick={() => setActiveDoc(i)} style={{
                    background: i === activeDoc ? WR.parchment : 'rgba(245,230,200,0.12)',
                    color: i === activeDoc ? WR.ink : WR.cream,
                    border: 'none', borderRadius: '8px 8px 0 0', cursor: 'pointer',
                    padding: '7px 14px', fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap',
                    fontFamily: 'Nunito, sans-serif',
                  }}>Doc {d.doc_number}</button>
                ))}
              </div>
            </div>
            {/* document body on parchment */}
            <div style={{
              flex: 1, overflowY: 'auto', margin: '0 14px 14px',
              background: WR.parchment, borderRadius: 10, padding: '20px 22px',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.18)',
            }}>
              {doc ? (
                <>
                  <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: WR.ink, marginBottom: 4 }}>
                    Document {doc.doc_number}{doc.title ? ` — ${doc.title}` : ''}
                  </div>
                  {(doc.source || doc.year) && (
                    <div style={{ fontSize: 12, fontStyle: 'italic', color: '#5A4326', marginBottom: 12 }}>
                      {doc.source}{doc.year ? `, ${doc.year}` : ''}
                    </div>
                  )}
                  {doc.image_url && (
                    <img src={doc.image_url} alt={doc.title || `Document ${doc.doc_number}`}
                      style={{ width: '100%', borderRadius: 8, marginBottom: 12, border: '1px solid rgba(26,15,8,0.2)' }} />
                  )}
                  {doc.body && (
                    <p style={{ fontSize: 14.5, lineHeight: 1.8, color: WR.ink, whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'Georgia, serif' }}>
                      {doc.body}
                    </p>
                  )}
                </>
              ) : (
                <div style={{ color: '#5A4326', fontSize: 13 }}>No documents.</div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Rubric sidebar ────────────────────────────────────────────────────────────
function RubricPanel({ type, open, onClose, prechecks, onPrecheck, checking, isMobile }) {
  const rubric = RUBRICS[type] || RUBRICS.LEQ;
  const checkFor = (key) => prechecks?.find((c) => c.criterion === key);

  const panelStyle = isMobile
    ? { position: 'fixed', left: 0, right: 0, bottom: 0, height: '72vh', borderRadius: '18px 18px 0 0', zIndex: 300 }
    : { position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(380px, 92vw)', zIndex: 300 };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,6,2,0.6)', zIndex: 290 }} />
          <motion.div
            initial={isMobile ? { y: '100%' } : { x: '100%' }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: '100%' } : { x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              ...panelStyle,
              background: `linear-gradient(170deg, #EFE0BE, #E2CFA4)`,
              display: 'flex', flexDirection: 'column',
              boxShadow: '-12px 0 40px rgba(0,0,0,0.6)',
            }}>
            <div style={{ padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: 14, fontWeight: 700, color: WR.ink }}>
                {type} Rubric · {rubric.maxScore} points
              </span>
              <button onClick={onClose} style={{
                background: 'rgba(26,15,8,0.1)', border: 'none', borderRadius: 8, cursor: 'pointer',
                color: WR.ink, fontSize: 13, fontWeight: 800, padding: '5px 12px',
              }}>✕</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 18px 16px' }}>
              {Object.entries(rubric.criteria).map(([key, c]) => {
                const chk = checkFor(key);
                const statusIcon = !chk ? '○' : chk.status === 'ok' ? '✓' : chk.status === 'warn' ? '⚠' : '✗';
                const statusColor = !chk ? '#8A6E42' : chk.status === 'ok' ? WR.success : chk.status === 'warn' ? WR.warning : WR.error;
                return (
                  <div key={key} style={{
                    borderBottom: '1px solid rgba(26,15,8,0.12)', padding: '12px 0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ color: statusColor, fontWeight: 900, fontSize: 14, width: 16 }}>{statusIcon}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 800, color: WR.ink, flex: 1 }}>{c.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#7A5A2E' }}>{c.points}pt</span>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: '#5A4326', margin: '0 0 0 24px' }}>{c.description}</p>
                    {chk?.note && (
                      <p style={{ fontSize: 11.5, fontStyle: 'italic', color: statusColor, margin: '4px 0 0 24px' }}>{chk.note}</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ padding: '12px 18px 18px' }}>
              <button onClick={onPrecheck} disabled={checking} style={{
                width: '100%', padding: '12px', borderRadius: 10, border: 'none',
                cursor: checking ? 'wait' : 'pointer',
                background: `linear-gradient(135deg, ${WR.oak}, #6B4218)`, color: WR.cream,
                fontWeight: 800, fontSize: 13.5, fontFamily: 'Nunito, sans-serif',
              }}>
                {checking ? 'Scanning…' : '🔎 Pre-check my draft'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Pre-submission checklist modal ───────────────────────────────────────────
function PrecheckModal({ checks, onSubmit, onBack, submitting }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(10,6,2,0.8)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}>
      <motion.div initial={{ scale: 0.92, y: 18 }} animate={{ scale: 1, y: 0 }}
        style={{
          background: WR.parchment, borderRadius: 16, padding: '28px 26px',
          maxWidth: 460, width: '100%', boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: WR.ink, marginBottom: 14 }}>
          Before you submit…
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {checks.map((c, i) => {
            const icon = c.status === 'ok' ? '✓' : c.status === 'warn' ? '⚠' : '✗';
            const color = c.status === 'ok' ? WR.success : c.status === 'warn' ? WR.warning : WR.error;
            return (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color, fontWeight: 900, fontSize: 15, width: 16, flexShrink: 0 }}>{icon}</span>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 800, color: WR.ink, textTransform: 'capitalize' }}>
                    {c.criterion.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontSize: 12.5, color: '#5A4326' }}> — {c.note}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onBack} disabled={submitting} style={{
            flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer',
            background: 'rgba(26,15,8,0.08)', border: '1px solid rgba(26,15,8,0.2)',
            color: WR.ink, fontWeight: 800, fontSize: 13.5,
          }}>Go back and revise</button>
          <button onClick={onSubmit} disabled={submitting} style={{
            flex: 1, padding: '12px', borderRadius: 10, border: 'none',
            cursor: submitting ? 'wait' : 'pointer',
            background: `linear-gradient(135deg, ${WR.success}, #3D8A66)`, color: '#fff',
            fontWeight: 800, fontSize: 13.5,
          }}>{submitting ? 'Grading…' : 'Submit anyway →'}</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WritingRoom() {
  const { navigate, screenParams } = useApp();
  const { assignmentId } = screenParams;

  const [assignment, setAssignment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [essay, setEssay] = useState('');
  const [loading, setLoading] = useState(true);
  const [savedAt, setSavedAt] = useState(null);
  const [docsOpen, setDocsOpen] = useState(false);
  const [rubricOpen, setRubricOpen] = useState(false);
  const [prechecks, setPrechecks] = useState(null);
  const [checking, setChecking] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { mode: ambient, cycle: cycleAmbient } = useAmbient();

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 760;
  const saveTimer = useRef(null);
  const essayRef = useRef('');

  useEffect(() => {
    if (!assignmentId) { navigate('write_home'); return; }
    api.get(`/api/write/assignments/${assignmentId}`)
      .then((data) => {
        setAssignment(data.assignment);
        setDocuments(data.documents || []);
        const draft = data.draft?.essay_text || localStorage.getItem(`wr_draft_${assignmentId}`) || '';
        setEssay(draft);
        essayRef.current = draft;
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  // autosave every 3s when dirty
  const onChange = (val) => {
    setEssay(val);
    essayRef.current = val;
    localStorage.setItem(`wr_draft_${assignmentId}`, val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.put(`/api/write/drafts/${assignmentId}`, { essayText: essayRef.current })
        .then(() => setSavedAt(Date.now()))
        .catch(() => {});
    }, 3000);
  };

  async function runPrecheck(openModal = false) {
    if (checking || essay.trim().length < 20) return;
    setChecking(true);
    try {
      const { checks } = await api.post('/api/write/precheck', { assignmentId, essayText: essay });
      setPrechecks(checks);
      if (openModal) setShowChecklist(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }

  async function submit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const result = await api.post('/api/write/grade', { assignmentId, essayText: essay });
      localStorage.removeItem(`wr_draft_${assignmentId}`);
      navigate('write_results', { submissionId: result.submissionId, justGraded: true, award: result.award });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
      setShowChecklist(false);
    }
  }

  const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
  const ambientIcon = { off: '○', fire: '🔥', rain: '🌧️', library: '📚' }[ambient];

  if (loading) return (
    <div style={{ minHeight: '100vh', background: WR.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: WR.cream, fontFamily: 'Nunito, sans-serif', fontSize: 14 }}>
      Lighting the candles…
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: WR.bg, fontFamily: 'Nunito, sans-serif', position: 'relative' }}>
      <CandleGlow />

      {/* header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '12px 16px',
        background: 'rgba(28,18,8,0.94)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${WR.ember}22`,
      }}>
        <button onClick={() => navigate('write_home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(236,217,176,0.55)', fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>← Back</button>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 13.5, fontWeight: 700, color: WR.cream,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {assignment?.title}
        </span>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button onClick={() => setRubricOpen(true)} style={{
            background: `${WR.ember}14`, border: `1px solid ${WR.ember}35`, borderRadius: 8,
            color: WR.ember, fontSize: 12, fontWeight: 800, padding: '6px 10px', cursor: 'pointer',
          }}>Rubric</button>
          {documents.length > 0 && (
            <button onClick={() => setDocsOpen(true)} style={{
              background: `${WR.ember}14`, border: `1px solid ${WR.ember}35`, borderRadius: 8,
              color: WR.ember, fontSize: 12, fontWeight: 800, padding: '6px 10px', cursor: 'pointer',
            }}>📄 Docs</button>
          )}
        </div>
      </header>

      {/* parchment workspace */}
      <main style={{ maxWidth: 760, margin: '0 auto', padding: '26px 16px 130px', position: 'relative', zIndex: 2 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(178deg, ${WR.parchment}, #EEDCB6)`,
            borderRadius: 6,
            padding: 'clamp(24px, 5vw, 44px)',
            boxShadow: '0 24px 70px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.5)',
            position: 'relative',
          }}>
          {/* paper grain */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 6, pointerEvents: 'none', opacity: 0.5,
            background: 'repeating-linear-gradient(2deg, transparent, transparent 3px, rgba(120,90,40,0.025) 3px, rgba(120,90,40,0.025) 5px), radial-gradient(ellipse at 20% 10%, rgba(140,100,40,0.05), transparent 60%)',
          }} />

          {/* prompt */}
          <div style={{ position: 'relative', marginBottom: 8 }}>
            <div style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.2em', color: '#8A6E42',
              textTransform: 'uppercase', marginBottom: 8,
            }}>
              {assignment?.type} · {RUBRICS[assignment?.type]?.maxScore ?? '—'} points
            </div>
            <p style={{
              fontFamily: 'Georgia, serif', fontSize: 15.5, fontWeight: 700, lineHeight: 1.65,
              color: WR.ink, margin: 0,
            }}>
              {assignment?.prompt}
            </p>
            {assignment?.context && (
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#5A4326', fontStyle: 'italic', margin: '10px 0 0' }}>
                {assignment.context}
              </p>
            )}
          </div>

          <div style={{ height: 1, background: 'rgba(26,15,8,0.18)', margin: '18px 0' }} />

          {/* essay area */}
          <textarea
            value={essay}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Dip your quill and begin…"
            spellCheck
            style={{
              width: '100%', minHeight: 500, boxSizing: 'border-box',
              background: 'transparent', border: 'none', outline: 'none', resize: 'vertical',
              fontFamily: 'Nunito, sans-serif', fontSize: 18, lineHeight: 1.85, color: WR.ink,
              position: 'relative',
            }}
          />
        </motion.div>

        {error && (
          <div style={{
            marginTop: 14, background: `${WR.error}20`, border: `1px solid ${WR.error}60`,
            borderRadius: 10, padding: '10px 14px', color: '#E8A39A', fontSize: 13, fontWeight: 600,
          }}>{error}</div>
        )}
      </main>

      {/* bottom bar */}
      <footer style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        padding: '12px 18px',
        background: 'rgba(28,18,8,0.96)', backdropFilter: 'blur(12px)',
        borderTop: `1px solid ${WR.ember}22`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'rgba(236,217,176,0.5)', fontWeight: 700 }}>
          <span>{words} words</span>
          {savedAt && <span style={{ color: WR.success }}>Saved ✓</span>}
          <button onClick={cycleAmbient} title="Ambient sound" style={{
            background: 'none', border: `1px solid ${WR.ember}30`, borderRadius: 8,
            fontSize: 14, padding: '4px 9px', cursor: 'pointer', color: WR.cream,
          }}>{ambientIcon}</button>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={() => runPrecheck(true)}
          disabled={checking || submitting || words < 10}
          style={{
            background: `linear-gradient(135deg, #9A5318, ${WR.ember})`,
            border: 'none', borderRadius: 12, padding: '13px 26px',
            color: '#FFF6E8', fontWeight: 800, fontSize: 14, fontFamily: 'Nunito, sans-serif',
            cursor: words < 10 ? 'not-allowed' : 'pointer',
            opacity: words < 10 ? 0.5 : 1,
            boxShadow: `0 6px 24px ${WR.ember}40`,
          }}>
          {checking ? 'Scanning…' : 'Submit for Grading →'}
        </motion.button>
      </footer>

      <DocsPanel documents={documents} open={docsOpen} onClose={() => setDocsOpen(false)} isMobile={isMobile} />
      <RubricPanel type={assignment?.type} open={rubricOpen} onClose={() => setRubricOpen(false)}
        prechecks={prechecks} onPrecheck={() => runPrecheck(false)} checking={checking} isMobile={isMobile} />

      <AnimatePresence>
        {showChecklist && prechecks && (
          <PrecheckModal checks={prechecks} submitting={submitting}
            onSubmit={submit} onBack={() => setShowChecklist(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
