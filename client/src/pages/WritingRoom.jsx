'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { RUBRICS } from '../lib/rubrics.js';
import { Vignette, ParticleField } from '../components/write/fx.jsx';

// Parse SAQ prompt into structured parts (A, B, C) and optional context section
function parseSaqPrompt(prompt) {
  if (!prompt?.includes('**Part A') && !prompt?.includes('**Part B')) return null;

  const parts = {};
  // Split by "---" separators, then parse each section
  const sections = prompt.split('\n---\n');

  for (const section of sections) {
    const match = section.match(/\*\*Part\s+([A-C])\s*[—-]\s*([^\*]+)\*\*\s*\n\n([\s\S]*)/);
    if (match) {
      const letter = match[1];
      const title = match[2].trim();
      const text = match[3].trim();
      parts[letter] = { title, text };
    }
  }

  // Extract context section
  const contextMatch = prompt.match(/## Historical Context\s*\n\n?([\s\S]+?)$/);
  const context = contextMatch ? contextMatch[1].trim() : null;

  // If we parsed all 3 parts, return structured data
  if (parts.A && parts.B && parts.C) {
    return { parts, context };
  }
  return null;
}

// ── The Writing Room — warm, cozy, candlelit essay editor ─────────────────────

const WR = {
  bg: '#1C1208', surface: '#241A0C', parchment: '#F5E6C8', ink: '#1A0F08',
  ember: '#E8853A', emberSoft: '#3D1F0A', cream: '#ECD9B0', oak: '#4A2E12',
  success: '#2D6A4F', warning: '#B8860B', error: '#8B1A1A',
};

// SAQ answer box component
function SaqPartBox({ letter, title, text, answerText, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontFamily: 'Cinzel, serif',
        fontSize: 14,
        fontWeight: 700,
        color: WR.ink,
        marginBottom: 8,
      }}>
        <span style={{ color: '#8A6E42' }}>Part {letter}</span> — {title}
      </div>
      <p style={{
        fontSize: 13.5,
        lineHeight: 1.7,
        color: WR.ink,
        margin: '0 0 12px',
        fontFamily: 'Georgia, serif',
      }}>
        {text}
      </p>
      <textarea
        value={answerText}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`Your response for Part ${letter}…`}
        spellCheck
        style={{
          width: '100%',
          minHeight: 120,
          boxSizing: 'border-box',
          background: 'rgba(255, 255, 255, 0.4)',
          border: `1px solid ${WR.ink}22`,
          borderRadius: 4,
          padding: 12,
          fontFamily: 'Nunito, sans-serif',
          fontSize: 16,
          lineHeight: 1.7,
          color: WR.ink,
          resize: 'vertical',
        }}
      />
      <div style={{ height: 1, background: 'rgba(26,15,8,0.12)', margin: '16px 0' }} />
    </div>
  );
}

// SAQ prompt renderer with separated parts
function SaqPromptRenderer({ saqStructure, answers, onAnswerChange }) {
  const [contextExpanded, setContextExpanded] = useState(false);

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(140,100,40,0.5))' }} />
        <div style={{
          fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#8A6E42',
          textTransform: 'uppercase', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap',
        }}>
          ✦ SAQ · 3 points ✦
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(140,100,40,0.5), transparent)' }} />
      </div>

      {/* Parts */}
      {['A', 'B', 'C'].map((letter) => (
        <SaqPartBox
          key={letter}
          letter={letter}
          title={saqStructure.parts[letter].title}
          text={saqStructure.parts[letter].text}
          answerText={answers[letter] || ''}
          onChange={(val) => onAnswerChange(letter, val)}
        />
      ))}

      {/* Context section (expandable) */}
      {saqStructure.context && (
        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => setContextExpanded(!contextExpanded)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, fontWeight: 800, color: WR.ember,
              padding: '6px 0', display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {contextExpanded ? '▼' : '▶'} Historical Context
          </button>
          {contextExpanded && (
            <div style={{
              fontSize: 13, lineHeight: 1.7, color: '#5A4326', fontStyle: 'italic',
              margin: '10px 0 0', padding: '12px 14px',
              background: 'rgba(232,133,58,0.06)', borderLeft: `2px solid ${WR.ember}40`,
            }}>
              {saqStructure.context}
            </div>
          )}
        </div>
      )}
    </>
  );
}

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

// ── Candle glow + animated candle flames ─────────────────────────────────────
function Candle({ side }) {
  const pos = side === 'left' ? { left: 18 } : { right: 18 };
  return (
    <div aria-hidden style={{ position: 'fixed', bottom: 86, ...pos, zIndex: 2, pointerEvents: 'none', opacity: 0.92 }}>
      <svg width="44" height="92" viewBox="0 0 44 92">
        <defs>
          <radialGradient id={`wr-flameglow-${side}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#FFB54A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#FFB54A" stopOpacity="0" />
          </radialGradient>
        </defs>
        <motion.circle cx="22" cy="18" r="17"
          fill={`url(#wr-flameglow-${side})`}
          animate={{ opacity: [0.6, 1, 0.55, 0.9, 0.6], r: [15, 18, 14, 17, 15] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: side === 'left' ? 0 : 0.9 }} />
        <motion.path d="M22 10 C18.5 16 19.5 21 22 25 C24.5 21 25.5 16 22 10 Z" fill="#FFB54A"
          animate={{ scaleY: [1, 1.25, 0.88, 1.15, 1], scaleX: [1, 0.88, 1.1, 0.94, 1], rotate: [0, 2.5, -2, 1.5, 0] }}
          transition={{ duration: 1.3, repeat: Infinity, delay: side === 'left' ? 0 : 0.5 }}
          style={{ transformBox: 'fill-box', originX: 0.5, originY: 1 }} />
        <motion.path d="M22 16 C20.6 19 21 21.5 22 23.6 C23 21.5 23.4 19 22 16 Z" fill="#FFF2D8"
          animate={{ scaleY: [1, 1.4, 0.85, 1.2, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ transformBox: 'fill-box', originX: 0.5, originY: 1 }} />
        <rect x="20.8" y="24" width="2.4" height="5" fill="#3D2A14" rx="1" />
        <path d="M15 29 Q15 27 17 27 L27 27 Q29 27 29 29 L30 78 Q30 82 26 82 L18 82 Q14 82 14 78 Z" fill="#E8D5A8" />
        <path d="M15 29 Q15 27 17 27 L20 27 L21 82 L18 82 Q14 82 14 78 Z" fill="#F2E4BE" opacity="0.7" />
        <ellipse cx="22" cy="84" rx="16" ry="4" fill="#2A1A0A" />
        <ellipse cx="22" cy="83" rx="16" ry="4" fill="#3D2A14" />
      </svg>
    </div>
  );
}

function CandleGlow() {
  return (
    <>
      <motion.div
        animate={{ opacity: [0.4, 0.58, 0.36, 0.52, 0.4] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', left: -160, top: '16%', width: 520, height: 640,
          background: `radial-gradient(ellipse, ${WR.ember}38 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />
      <motion.div
        animate={{ opacity: [0.2, 0.34, 0.18, 0.3, 0.2] }}
        transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        style={{
          position: 'fixed', right: -120, bottom: '2%', width: 400, height: 480,
          background: `radial-gradient(ellipse, ${WR.ember}2C 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />
      {/* warm pool over the desk */}
      <motion.div
        animate={{ opacity: [0.14, 0.22, 0.12, 0.2, 0.14] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 1.6 }}
        style={{
          position: 'fixed', left: '50%', top: '30%', width: 700, height: 500, marginLeft: -350,
          background: `radial-gradient(ellipse, #FFB54A22 0%, transparent 60%)`,
          pointerEvents: 'none', zIndex: 1,
        }}
      />
      {typeof window !== 'undefined' && window.innerWidth >= 900 && (
        <>
          <Candle side="left" />
          <Candle side="right" />
        </>
      )}
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
  const { assignmentId, previewMode } = screenParams;

  const [assignment, setAssignment] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [essay, setEssay] = useState('');
  const [saqAnswers, setSaqAnswers] = useState({ A: '', B: '', C: '' });
  const [saqStructure, setSaqStructure] = useState(null);
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

        // Check if this is a structured SAQ
        const parsed = parseSaqPrompt(data.assignment.prompt);
        setSaqStructure(parsed);

        const draft = data.draft?.essay_text || localStorage.getItem(`wr_draft_${assignmentId}`) || '';

        if (parsed && draft) {
          // Parse draft as a|b|c format and restore answers
          const parts = draft.split('\n\n');
          const ans = { A: '', B: '', C: '' };
          for (const part of parts) {
            const match = part.match(/^[a-c]\)\s*(.*)$/is);
            if (match) {
              ans[match[0][0].toUpperCase()] = match[1];
            }
          }
          setSaqAnswers(ans);
        } else {
          setEssay(draft);
          essayRef.current = draft;
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assignmentId]);

  // autosave every 3s when dirty (skipped in teacher preview mode)
  const onChange = (val) => {
    setEssay(val);
    essayRef.current = val;
    if (previewMode) return;
    localStorage.setItem(`wr_draft_${assignmentId}`, val);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.put(`/api/write/drafts/${assignmentId}`, { essayText: essayRef.current })
        .then(() => setSavedAt(Date.now()))
        .catch(() => {});
    }, 3000);
  };

  // SAQ answer change handler
  const onSaqAnswerChange = (letter, val) => {
    const updated = { ...saqAnswers, [letter]: val };
    setSaqAnswers(updated);

    if (previewMode) return;

    // Combine answers for storage: "a) ...\n\nb) ...\n\nc) ..."
    const combined = `a) ${updated.A}\n\nb) ${updated.B}\n\nc) ${updated.C}`;
    essayRef.current = combined;
    localStorage.setItem(`wr_draft_${assignmentId}`, combined);

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      api.put(`/api/write/drafts/${assignmentId}`, { essayText: essayRef.current })
        .then(() => setSavedAt(Date.now()))
        .catch(() => {});
    }, 3000);
  };

  async function runPrecheck(openModal = false) {
    const text = saqStructure ? essayRef.current : essay;
    if (checking || text.trim().length < 20) return;
    setChecking(true);
    try {
      const { checks } = await api.post('/api/write/precheck', { assignmentId, essayText: text });
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
      const essayText = saqStructure ? essayRef.current : essay;
      const result = await api.post('/api/write/grade', { assignmentId, essayText });
      localStorage.removeItem(`wr_draft_${assignmentId}`);
      navigate('write_results', { submissionId: result.submissionId, justGraded: true, award: result.award });
    } catch (e) {
      setError(e.message);
      setSubmitting(false);
      setShowChecklist(false);
    }
  }

  const textForWordCount = saqStructure ? essayRef.current : essay;
  const words = textForWordCount.trim() ? textForWordCount.trim().split(/\s+/).length : 0;
  const ambientIcon = { off: '○', fire: '🔥', rain: '🌧️', library: '📚' }[ambient];

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: `radial-gradient(ellipse at 50% 110%, #2E1C0C 0%, ${WR.bg} 55%, #120B04 100%)`,
      display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'center', justifyContent: 'center',
      color: WR.cream, fontFamily: 'Cinzel, serif', fontSize: 15, letterSpacing: '0.12em',
    }}>
      <motion.div
        animate={{ opacity: [0.4, 1, 0.4], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ fontSize: 34, filter: 'drop-shadow(0 0 18px #FFB54A)' }}>🕯️</motion.div>
      Lighting the candles…
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh',
      background: `radial-gradient(ellipse at 50% 115%, #2E1C0C 0%, ${WR.bg} 50%, #120B04 100%)`,
      fontFamily: 'Nunito, sans-serif', position: 'relative',
    }}>
      <CandleGlow />
      <ParticleField count={9} color="#FFB54A" type="ember" zIndex={1} />
      <Vignette strength={0.7} />

      {/* header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        padding: '12px 16px',
        background: 'rgba(28,18,8,0.94)', backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${WR.ember}22`,
      }}>
        <button onClick={() => navigate(previewMode ? 'write_teacher' : 'write_home')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(236,217,176,0.55)', fontSize: 13, fontWeight: 700, flexShrink: 0,
        }}>← Back</button>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: 13.5, fontWeight: 700, color: WR.cream,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {previewMode ? '👁 Preview · ' : ''}{assignment?.title}
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
          initial={{ opacity: 0, y: 26, rotateX: 6 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(178deg, ${WR.parchment}, #EEDCB6)`,
            borderRadius: 6,
            padding: 'clamp(24px, 5vw, 44px)',
            boxShadow: `0 34px 90px rgba(0,0,0,0.65), 0 0 60px ${WR.ember}18, inset 0 1px 0 rgba(255,255,255,0.5), inset 0 0 80px rgba(140,100,40,0.12)`,
            position: 'relative',
            border: '1px solid rgba(140,100,40,0.3)',
          }}>
          {/* paper grain */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 6, pointerEvents: 'none', opacity: 0.5,
            background: 'repeating-linear-gradient(2deg, transparent, transparent 3px, rgba(120,90,40,0.025) 3px, rgba(120,90,40,0.025) 5px), radial-gradient(ellipse at 20% 10%, rgba(140,100,40,0.05), transparent 60%), radial-gradient(ellipse at 85% 95%, rgba(140,100,40,0.06), transparent 50%)',
          }} />
          {/* burnt/aged edges */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 6, pointerEvents: 'none',
            boxShadow: 'inset 0 0 26px rgba(90,60,20,0.25)',
          }} />
          {/* inner gilt rule frame */}
          <div style={{
            position: 'absolute', inset: 10, borderRadius: 4, pointerEvents: 'none',
            border: '1px solid rgba(140,100,40,0.28)',
          }} />
          {/* wax seal */}
          <div aria-hidden style={{
            position: 'absolute', top: -16, right: 26, width: 52, height: 52, borderRadius: '50%',
            background: 'radial-gradient(circle at 36% 30%, #C0432E, #7A1E10 70%)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.25), inset 0 -3px 6px rgba(40,5,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(60,10,4,0.6)', zIndex: 3,
          }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 900, color: '#E8B88A', opacity: 0.85 }}>S</span>
          </div>

          {/* prompt or SAQ renderer */}
          <div style={{ position: 'relative', marginBottom: saqStructure ? 0 : 8 }}>
            {saqStructure ? (
              <SaqPromptRenderer
                saqStructure={saqStructure}
                answers={saqAnswers}
                onAnswerChange={onSaqAnswerChange}
              />
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(140,100,40,0.5))' }} />
                  <div style={{
                    fontSize: 10, fontWeight: 800, letterSpacing: '0.22em', color: '#8A6E42',
                    textTransform: 'uppercase', fontFamily: 'Cinzel, serif', whiteSpace: 'nowrap',
                  }}>
                    ✦ {assignment?.type} · {RUBRICS[assignment?.type]?.maxScore ?? '—'} points ✦
                  </div>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(140,100,40,0.5), transparent)' }} />
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
              </>
            )}
          </div>
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
        {previewMode ? (
          <span style={{
            fontFamily: 'Cinzel, serif', fontSize: 11.5, fontWeight: 800, letterSpacing: '0.14em',
            color: WR.ember, textTransform: 'uppercase',
          }}>👁 Teacher preview — submissions disabled</span>
        ) : (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            animate={words >= 10 ? { boxShadow: [`0 6px 24px ${WR.ember}40`, `0 6px 34px ${WR.ember}75`, `0 6px 24px ${WR.ember}40`] } : {}}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => runPrecheck(true)}
            disabled={checking || submitting || words < 10}
            style={{
              background: `linear-gradient(180deg, #FFA04E 0%, ${WR.ember} 50%, #B05A1A 100%)`,
              border: '1px solid rgba(255,210,150,0.5)', borderRadius: 12, padding: '13px 28px',
              color: '#2A1404', fontWeight: 900, fontSize: 14, fontFamily: 'Nunito, sans-serif',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              cursor: words < 10 ? 'not-allowed' : 'pointer',
              opacity: words < 10 ? 0.5 : 1,
              boxShadow: `0 6px 24px ${WR.ember}40, inset 0 1px 0 rgba(255,255,255,0.45)`,
            }}>
            {checking ? 'Scanning…' : '🔥 Submit for Grading'}
          </motion.button>
        )}
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
