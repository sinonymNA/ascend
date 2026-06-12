'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW, DECODE_COLORS } from '../lib/guidedWalkTheme.js';
import Clio from '../components/write/Clio.jsx';
import { HighlightedText, TopBar, PreviewBanner, GwButton, PhaseShell } from '../components/write/gwShared.jsx';

// ── Guided Walk — SAQ "The Art of Three" ──────────────────────────────────────
// A full-screen, one-thing-at-a-time tutor walk through writing an SAQ response,
// narrated by Clio. Phases: opener → orientation → decode → socratic_A/B/C →
// reveal → rubric (server may report 'complete' once graded — treated like rubric).

const PARTS = ['A', 'B', 'C'];
const PHASES = ['opener', 'orientation', 'decode', 'socratic_A', 'socratic_B', 'socratic_C', 'reveal', 'rubric'];
const DECODE_ORDER = ['timePeriod', 'geographicScope', 'skill', 'topic'];
const DECODE_LABELS = {
  timePeriod: 'Time Period',
  geographicScope: 'Geographic Scope',
  skill: 'Skill / Task Verb',
  topic: 'Topic',
};

const VERB_PLAIN = {
  describe: 'Give specific details about what something was like.',
  explain: 'Give the reasons, causes, or process behind something.',
  identify: 'Name a specific, correct example.',
  compare: 'Discuss similarities and/or differences.',
  analyze: 'Break something down to show how its parts relate.',
  evaluate: 'Make a supported judgment about extent or significance.',
  develop: 'Build an argument supported by evidence.',
};

function detectVerb(text) {
  const m = (text || '').match(/\b(describe|explain|identify|compare|analyze|evaluate|develop)\b/i);
  return m ? m[0].toLowerCase() : 'explain';
}

function emptyPart() {
  return { locked: false, finalText: '', history: [] };
}

// ── Phase Entry ─────────────────────────────────────────────────────────────
function OpenerPhase({ title, onBegin, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        style={{ textAlign: 'center', marginTop: '12vh' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.3em', color: GW.amber, marginBottom: 14, textTransform: 'uppercase' }}>
          The Art of Three
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 6vw, 46px)', color: GW.ink, margin: '0 0 16px', fontWeight: 800 }}>
          {title}
        </h1>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 15, maxWidth: 440, margin: '0 auto 36px' }}>
          Three small questions. One careful answer to each. Let's walk through it together.
        </p>
        <GwButton onClick={onBegin}>Begin</GwButton>
      </motion.div>
    </PhaseShell>
  );
}

// ── Phase 1: Orientation ───────────────────────────────────────────────────
function OrientationPhase({ saqStructure, onNext, reduceMotion }) {
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 18px',
            borderRadius: 999, background: GW.amberSoft, border: `1px solid ${GW.amber}50`,
            fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: GW.amber, letterSpacing: '0.08em',
          }}>
          3 POINTS · 1 PER PART
        </motion.div>
      </div>
      {PARTS.map((p, i) => {
        const part = saqStructure.parts[p];
        const verb = detectVerb(part.text);
        return (
          <motion.div key={p}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 + i * 0.12, ease: 'easeInOut' }}
            style={{
              background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14,
              padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 6,
            }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 17, color: GW.ink }}>Part {p}</span>
              <span style={{
                fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
                color: GW.rose, background: GW.roseSoft, borderRadius: 6, padding: '2px 8px',
              }}>{verb}</span>
            </div>
            <div style={{ fontSize: 13.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>
              {VERB_PLAIN[verb] || VERB_PLAIN.explain}
            </div>
          </motion.div>
        );
      })}
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <GwButton onClick={onNext}>I'm ready to see the prompt</GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Phase 2: Prompt Decode ─────────────────────────────────────────────────
function DecodePhase({ assignment, saqStructure, decode, onComplete, onClioLine, reduceMotion }) {
  const [step, setStep] = useState(0);
  const [showMcq, setShowMcq] = useState(false);
  const [mcqAnswer, setMcqAnswer] = useState(null);

  const elements = decode?.elements || {};
  const revealed = DECODE_ORDER.slice(0, step);
  const combinedText = `${assignment.context || ''}\n\n${saqStructure.parts.A.text}`;

  useEffect(() => {
    if (step === 0 || !decode) return;
    const key = DECODE_ORDER[step - 1];
    const val = elements[key];
    const lines = {
      timePeriod: `This is our time period${val ? `: "${val}"` : ''}. Everything we write should fit inside this window.`,
      geographicScope: `Here's our geography${val ? `: "${val}"` : ''}. Let's keep our examples rooted here.`,
      skill: `And here's our task verb${val ? `: "${val}"` : ''}. This word tells us exactly what kind of thinking the prompt wants.`,
      topic: `Finally, our topic${val ? `: "${val}"` : ''}. Everything else hangs off this thread.`,
    };
    onClioLine?.(lines[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, decode]);

  if (!decode) {
    return (
      <PhaseShell reduceMotion={reduceMotion}>
        <div style={{ textAlign: 'center', padding: '20vh 0', color: GW.inkSoft, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Clio is reading the prompt closely…
        </div>
      </PhaseShell>
    );
  }

  if (!showMcq) {
    return (
      <PhaseShell maxWidth={720} reduceMotion={reduceMotion}>
        <div style={{
          background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14,
          padding: '22px 24px', fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.8, color: GW.ink, whiteSpace: 'pre-wrap',
        }}>
          <HighlightedText text={combinedText} elements={elements} revealed={revealed} />
        </div>
        {step > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {revealed.map((key) => (
              <span key={key} style={{
                fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: GW.ink, background: `${DECODE_COLORS[key]}40`, borderRadius: 999, padding: '4px 12px',
              }}>{DECODE_LABELS[key]}</span>
            ))}
          </div>
        )}
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          {step < DECODE_ORDER.length ? (
            <GwButton onClick={() => setStep(step + 1)}>
              {step === 0 ? 'Show me the time period' : 'Next'}
            </GwButton>
          ) : (
            <GwButton onClick={() => setShowMcq(true)}>Quick check</GwButton>
          )}
        </div>
      </PhaseShell>
    );
  }

  const mcq = decode.mcq;
  const answeredCorrect = mcqAnswer !== null && mcq.choices[mcqAnswer]?.correct;
  return (
    <PhaseShell reduceMotion={reduceMotion}>
      <div style={{ background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14, padding: '22px 24px' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink, marginBottom: 16 }}>
          {mcq.question}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mcq.choices.map((c, i) => {
            const isSelected = mcqAnswer === i;
            return (
              <motion.button key={i}
                whileHover={!answeredCorrect ? { scale: 1.01 } : {}}
                onClick={() => { if (!answeredCorrect) setMcqAnswer(i); }}
                style={{
                  textAlign: 'left', padding: '12px 16px', borderRadius: 10, cursor: answeredCorrect ? 'default' : 'pointer',
                  fontFamily: 'Nunito, sans-serif', fontSize: 14, color: GW.ink,
                  border: `1.5px solid ${isSelected ? (c.correct ? GW.sage : GW.rose) : `${GW.ink}25`}`,
                  background: isSelected ? (c.correct ? GW.sageSoft : GW.roseSoft) : GW.parchment,
                }}>{c.text}</motion.button>
            );
          })}
        </div>
        <AnimatePresence>
          {mcqAnswer !== null && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: 14, fontSize: 13.5, fontStyle: 'italic', color: GW.inkSoft, fontFamily: 'Georgia, serif' }}>
              {answeredCorrect
                ? mcq.explanation
                : "Not quite — let's think again about what that task verb is asking us to do. Try another choice."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ textAlign: 'center' }}>
        <GwButton onClick={onComplete} disabled={!answeredCorrect}>On to the writing</GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Phase 3: Socratic Writing Loop ────────────────────────────────────────────
function SocraticPhase({ part, saqStructure, partState, busy, onAsk, onAnswer, onContinue, reduceMotion }) {
  const [input, setInput] = useState('');
  const text = saqStructure.parts[part].text;
  const title = saqStructure.parts[part].title;
  const verb = detectVerb(text);
  const history = partState?.history || [];
  const locked = partState?.locked;

  useEffect(() => {
    if (history.length === 0 && !busy) onAsk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{
          background: GW.parchmentDark, border: `2px solid ${GW.rose}50`, borderRadius: 16, padding: '22px 24px',
          boxShadow: `0 0 0 6px ${GW.roseSoft}`,
        }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink }}>Part {part}</span>
          <span style={{
            fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: GW.rose, background: GW.roseSoft, borderRadius: 6, padding: '2px 8px',
          }}>{verb}</span>
          <span style={{ fontSize: 12.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>{title}</span>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.7, color: GW.ink, margin: 0 }}>{text}</p>
      </motion.div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {history.map((h, i) => (
          <motion.div key={i}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{
              alignSelf: h.role === 'clio' ? 'flex-start' : 'flex-end',
              maxWidth: '85%',
              background: h.role === 'clio' ? GW.amberSoft : GW.blueSoft,
              border: `1px solid ${h.role === 'clio' ? GW.amber : GW.blue}40`,
              borderRadius: 12, padding: '10px 14px',
              fontFamily: h.role === 'clio' ? 'Georgia, serif' : 'Nunito, sans-serif',
              fontStyle: h.role === 'clio' ? 'italic' : 'normal',
              fontSize: 14, color: GW.ink,
            }}>{h.text}</motion.div>
        ))}
        {busy && (
          <div style={{ alignSelf: 'flex-start', fontSize: 13, fontStyle: 'italic', color: GW.inkSoft, fontFamily: 'Georgia, serif' }}>
            Clio is thinking…
          </div>
        )}
      </div>

      {!locked ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder="Write your response to Clio's question…"
            disabled={busy}
            style={{
              width: '100%', minHeight: 90, boxSizing: 'border-box', resize: 'vertical',
              borderRadius: 10, border: `1.5px solid ${GW.ink}25`, background: GW.parchment,
              padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14.5, color: GW.ink,
            }} />
          <div style={{ textAlign: 'right' }}>
            <GwButton disabled={busy || !input.trim()} onClick={() => { onAnswer(input); setInput(''); }}>
              Send to Clio
            </GwButton>
          </div>
        </div>
      ) : (
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: GW.sageSoft, border: `2px solid ${GW.sage}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: GW.sage,
          }}>✓</div>
          <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14 }}>
            Part {part} is locked in.
          </div>
          <GwButton onClick={onContinue}>Continue</GwButton>
        </motion.div>
      )}
    </PhaseShell>
  );
}

// ── Phase 4: Reveal ────────────────────────────────────────────────────────
function RevealPhase({ partResponses, onContinue, compiling, previewMode, reduceMotion }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: 0 }}>Here is what you wrote</h2>
      </div>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: revealed ? 1 : 0, y: revealed || reduceMotion ? 0 : 14 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14,
          padding: '24px 26px', fontFamily: 'Georgia, serif', fontSize: 15, lineHeight: 1.85, color: GW.ink,
          boxShadow: '0 14px 36px rgba(0,0,0,0.12)',
        }}>
        {PARTS.map((p) => (
          <p key={p} style={{ margin: '0 0 14px' }}>
            <strong>{p.toLowerCase()})</strong> {partResponses[p]?.finalText}
          </p>
        ))}
      </motion.div>
      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <GwButton onClick={onContinue} disabled={compiling || previewMode}>
          {previewMode ? 'Grading is disabled in preview' : compiling ? 'Grading…' : 'See how it scores'}
        </GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Phase 5: Rubric Reveal ─────────────────────────────────────────────────
function FlipCard({ label, criterion, delay, reduceMotion }) {
  const [flipped, setFlipped] = useState(reduceMotion);
  useEffect(() => {
    if (reduceMotion) return;
    const t = setTimeout(() => setFlipped(true), delay);
    return () => clearTimeout(t);
  }, [delay, reduceMotion]);

  const earned = criterion?.earned;
  return (
    <div style={{ perspective: 800 }}>
      <motion.div
        animate={{ rotateY: flipped ? 0 : 180 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          transformStyle: 'preserve-3d', minHeight: 110, borderRadius: 14,
          border: `1px solid ${GW.amber}30`, background: GW.parchmentDark, padding: '16px 18px',
        }}>
        <div style={{ backfaceVisibility: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 900,
              background: earned ? GW.sageSoft : GW.roseSoft,
              color: earned ? GW.sage : GW.rose,
              border: `1.5px solid ${earned ? GW.sage : GW.rose}`,
            }}>{earned ? '✓' : '✗'}</span>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink }}>{label}</span>
          </div>
          <div style={{ fontSize: 13.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif', lineHeight: 1.5 }}>
            {criterion?.feedback}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function RubricPhase({ grading, award, reflection, onReflectionChange, onSaveReflection, onFinish, previewMode, reduceMotion }) {
  const labels = { part_a: 'Part A', part_b: 'Part B', part_c: 'Part C' };
  const breakdown = grading?.breakdown || {};
  const score = grading?.score ?? 0;
  const maxScore = grading?.maxScore ?? 3;

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: 13, letterSpacing: '0.2em', color: GW.amber, textTransform: 'uppercase', marginBottom: 8 }}>
          Your Score
        </div>
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 56, color: GW.ink }}>
          {score} / {maxScore}
        </motion.div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
        {PARTS.map((p, i) => (
          <FlipCard key={p} label={labels[`part_${p.toLowerCase()}`]} criterion={breakdown[`part_${p.toLowerCase()}`]}
            delay={300 + i * 250} reduceMotion={reduceMotion} />
        ))}
      </div>

      <div style={{ background: GW.amberSoft, border: `1px solid ${GW.amber}30`, borderRadius: 12, padding: '14px 18px' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: GW.amber, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
          Overall Feedback
        </div>
        <div style={{ fontSize: 14, color: GW.ink, fontFamily: 'Nunito, sans-serif', lineHeight: 1.6 }}>
          {grading?.overallFeedback}
        </div>
      </div>

      {!previewMode && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: GW.ink, marginBottom: 8, fontFamily: 'Nunito, sans-serif' }}>
            Optional reflection (not graded) — what's one thing you'll try next time?
          </div>
          <textarea value={reflection} onChange={(e) => onReflectionChange(e.target.value)}
            onBlur={onSaveReflection}
            placeholder="A sentence or two is plenty…"
            style={{
              width: '100%', minHeight: 70, boxSizing: 'border-box', resize: 'vertical',
              borderRadius: 10, border: `1.5px solid ${GW.ink}25`, background: GW.parchmentDark,
              padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14, color: GW.ink,
            }} />
        </div>
      )}

      {award && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4, ease: 'easeInOut' }}
          style={{ textAlign: 'center', background: GW.sageSoft, border: `1px solid ${GW.sage}40`, borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink, marginBottom: 4 }}>
            +{award.xpGain} XP
          </div>
          {award.newBadges?.length > 0 && (
            <div style={{ fontSize: 13, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>
              New badge: {award.newBadges.join(', ')}
            </div>
          )}
        </motion.div>
      )}

      <div style={{ textAlign: 'center' }}>
        <GwButton onClick={onFinish}>Done</GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function GuidedWalkSAQ() {
  const { navigate, screenParams } = useApp();
  const { assignmentId, previewMode } = screenParams || {};
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('opener');
  const [partResponses, setPartResponses] = useState({ A: emptyPart(), B: emptyPart(), C: emptyPart() });
  const [decode, setDecode] = useState(null);
  const [clio, setClio] = useState({ text: '', state: 'idle' });
  const [busy, setBusy] = useState(false);
  const [grading, setGrading] = useState(null);
  const [award, setAward] = useState(null);
  const [reflection, setReflection] = useState('');
  const [compiling, setCompiling] = useState(false);

  // Load assignment + session
  useEffect(() => {
    if (!assignmentId) { navigate('write_home'); return; }
    (async () => {
      try {
        const res = await api.get(`/api/write/guided-walk/${assignmentId}`);
        setData(res);
        const session = res.session;
        setPhase(session.phase || 'opener');
        setPartResponses({
          A: session.part_responses?.A || emptyPart(),
          B: session.part_responses?.B || emptyPart(),
          C: session.part_responses?.C || emptyPart(),
        });
        if (session.decode_data) setDecode(session.decode_data);
        if (session.reflection) setReflection(session.reflection);
        if (session.rubric_result) setGrading(session.rubric_result);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentId]);

  // Autosave every 30s (skipped entirely in preview mode)
  useEffect(() => {
    if (previewMode || !data) return;
    const interval = setInterval(() => {
      api.patch(`/api/write/guided-walk/${assignmentId}`, { phase, partResponses, reflection }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [previewMode, data, assignmentId, phase, partResponses, reflection]);

  // Clio's opening lines for the framing phases
  useEffect(() => {
    if (!data) return;
    if (phase === 'opener') {
      setClio({ text: `We're going to write an SAQ together — "${data.assignment.title}". I'll be right here the whole way.`, state: 'idle' });
    } else if (phase === 'orientation') {
      setClio({ text: "An SAQ is worth 3 points — one for each part. We'll take them one at a time, so there's no rush.", state: 'idle' });
    }
  }, [phase, data]);

  // Fetch the Phase 2 decode bundle once we arrive there
  useEffect(() => {
    if (phase !== 'decode' || decode || !data) return;
    (async () => {
      try {
        const res = await api.post(`/api/write/guided-walk/${assignmentId}/decode`, {});
        setDecode(res.decode);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [phase, decode, data, assignmentId]);

  const persistPhase = useCallback((nextPhase) => {
    setPhase(nextPhase);
    if (!previewMode) {
      api.patch(`/api/write/guided-walk/${assignmentId}`, { phase: nextPhase }).catch(() => {});
    }
  }, [assignmentId, previewMode]);

  const onBegin = () => persistPhase('orientation');
  const onOrientationNext = () => persistPhase('decode');
  const onDecodeComplete = () => {
    setClio({ text: "Now let's take Part A — one piece at a time. I'll ask the questions; you bring the history.", state: 'idle' });
    persistPhase('socratic_A');
  };

  const askClio = useCallback(async (part) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk/${assignmentId}/ask`, { part });
      setPartResponses((prev) => ({ ...prev, [part]: { ...prev[part], history: res.history } }));
      const last = res.history[res.history.length - 1];
      if (last) setClio({ text: last.text, state: 'speaking' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const answerClio = useCallback(async (part, text) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk/${assignmentId}/answer`, { part, text });
      setPartResponses((prev) => ({
        ...prev,
        [part]: { ...prev[part], history: res.history, locked: res.locked, finalText: res.finalText },
      }));
      setClio({ text: res.clio_response, state: res.advance ? 'celebrating' : 'speaking' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const continuePart = useCallback((part) => {
    const order = { A: 'socratic_B', B: 'socratic_C', C: 'reveal' };
    const next = order[part];
    if (next === 'reveal') {
      setClio({ text: 'You wrote this. Every word. Let’s see it all together.', state: 'idle' });
    } else {
      setClio({ text: `On to Part ${next.slice(-1)}.`, state: 'idle' });
    }
    persistPhase(next);
  }, [persistPhase]);

  const onCompile = useCallback(async () => {
    setCompiling(true);
    try {
      const res = await api.post(`/api/write/guided-walk/${assignmentId}/compile`, {});
      setGrading(res.grading);
      setAward(res.award);
      setClio({ text: "Let's see how it scores against the rubric — point by point.", state: 'celebrating' });
      persistPhase('rubric');
    } catch (e) {
      setError(e.message);
    } finally {
      setCompiling(false);
    }
  }, [assignmentId, persistPhase]);

  const onSaveReflection = useCallback(() => {
    if (previewMode) return;
    api.post(`/api/write/guided-walk/${assignmentId}/reflection`, { text: reflection }).catch(() => {});
  }, [assignmentId, reflection, previewMode]);

  const onFinish = () => navigate(previewMode ? 'write_teacher' : 'write_home');
  const onBack = () => navigate(previewMode ? 'write_teacher' : 'write_home');

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: GW.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft }}>Loading the walk…</div>
      </div>
    );
  }
  if (error || !data) {
    return (
      <div style={{ minHeight: '100vh', background: GW.parchment, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ color: GW.rose, fontFamily: 'Nunito, sans-serif', fontWeight: 700, padding: '0 20px', textAlign: 'center' }}>
          {error || 'Could not load this assignment.'}
        </div>
        <GwButton onClick={onBack}>Back</GwButton>
      </div>
    );
  }

  const { assignment, saqStructure } = data;
  const currentPart = phase.startsWith('socratic_') ? phase.slice(-1) : null;

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      {previewMode && <PreviewBanner />}
      <TopBar title="The Art of Three" phases={PHASES} phase={phase} onBack={onBack} completePhase="rubric" />
      <AnimatePresence mode="wait">
        {phase === 'opener' && (
          <OpenerPhase key="opener" title={assignment.title} onBegin={onBegin} reduceMotion={reduceMotion} />
        )}
        {phase === 'orientation' && (
          <OrientationPhase key="orientation" saqStructure={saqStructure} onNext={onOrientationNext} reduceMotion={reduceMotion} />
        )}
        {phase === 'decode' && (
          <DecodePhase key="decode" assignment={assignment} saqStructure={saqStructure} decode={decode}
            onComplete={onDecodeComplete} onClioLine={(text) => setClio({ text, state: 'speaking' })} reduceMotion={reduceMotion} />
        )}
        {currentPart && (
          <SocraticPhase key={phase} part={currentPart} saqStructure={saqStructure}
            partState={partResponses[currentPart]} busy={busy}
            onAsk={() => askClio(currentPart)}
            onAnswer={(text) => answerClio(currentPart, text)}
            onContinue={() => continuePart(currentPart)}
            reduceMotion={reduceMotion} />
        )}
        {phase === 'reveal' && (
          <RevealPhase key="reveal" partResponses={partResponses} onContinue={onCompile} compiling={compiling}
            previewMode={previewMode} reduceMotion={reduceMotion} />
        )}
        {(phase === 'rubric' || phase === 'complete') && (
          <RubricPhase key="rubric" grading={grading} award={award} reflection={reflection}
            onReflectionChange={setReflection} onSaveReflection={onSaveReflection} onFinish={onFinish}
            previewMode={previewMode} reduceMotion={reduceMotion} />
        )}
      </AnimatePresence>
      <Clio text={clio.text} state={clio.state} />
    </div>
  );
}
