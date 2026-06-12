'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW, DECODE_COLORS } from '../lib/guidedWalkTheme.js';
import Clio from '../components/write/Clio.jsx';
import { HighlightedText, TopBar, PreviewBanner, GwButton, PhaseShell } from '../components/write/gwShared.jsx';

// ── Guided Walk — LEQ "The Long Game" ─────────────────────────────────────────
// A full-screen, one-thing-at-a-time tutor walk through writing an LEQ response,
// narrated by Clio. Phases: opener → orientation → decode → thesis →
// contextualization → evidence_1 → evidence_2 → complexity → reveal → rubric
// (server may report 'complete' once graded — treated like rubric).

const PHASES = ['opener', 'orientation', 'decode', 'thesis', 'contextualization', 'evidence_1', 'evidence_2', 'complexity', 'reveal', 'rubric'];
const DECODE_ORDER = ['timePeriod', 'geographicScope', 'skill', 'topic'];
const DECODE_LABELS = {
  timePeriod: 'Time Period',
  geographicScope: 'Geographic Scope',
  skill: 'Skill / Task Verb',
  topic: 'Topic',
};

const HISTORICAL_SKILL_LABELS = {
  causation: 'Causation',
  comparison: 'Comparison',
  ccot: 'Continuity and Change Over Time',
};
const HISTORICAL_SKILL_BLURBS = {
  causation: 'Causation asks: what caused this development — and what did it, in turn, cause?',
  comparison: 'Comparison asks: how are these things similar or different — and why does that difference matter?',
  ccot: 'Continuity and Change Over Time asks: what changed across this period, what stayed the same, and why?',
};

const EVIDENCE_LABELS = { evidence_1: 'First Piece of Evidence', evidence_2: 'Second Piece of Evidence' };

function emptyThesis() { return { claim: '', reasoning: '', attempts: 0, locked: false }; }
function emptyLoopStage() { return { locked: false, finalText: '', history: [] }; }
function emptyEvidenceStage() { return { step: 'evidence', evidenceText: '', analysisText: '', locked: false, history: [] }; }
function emptyComplexityStage() { return { pathway: null, locked: false, finalText: '', history: [] }; }

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
          The Long Game
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 6vw, 46px)', color: GW.ink, margin: '0 0 16px', fontWeight: 800 }}>
          {title}
        </h1>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 15, maxWidth: 460, margin: '0 auto 36px' }}>
          One argument. Four moves. Full credit. We'll build this essay piece by piece, together.
        </p>
        <GwButton onClick={onBegin}>Begin</GwButton>
      </motion.div>
    </PhaseShell>
  );
}

// ── Phase 1: Orientation — the essay as a building ────────────────────────────
const LEQ_BLOCKS = [
  { key: 'complexity', label: 'Roof — Complexity', sub: 'One extra layer of nuance', color: GW.rose },
  { key: 'reasoning', label: 'Top Floor — Historical Reasoning', sub: 'Connecting evidence to your argument', color: GW.blue },
  { key: 'evidence2', label: 'Second Floor — Evidence #2', sub: 'A second specific example', color: GW.sage },
  { key: 'evidence1', label: 'First Floor — Evidence #1', sub: 'A specific example, named', color: GW.sage },
  { key: 'thesis', label: 'Ground Floor — Thesis', sub: 'Your claim, with reasoning', color: GW.amber },
  { key: 'contextualization', label: 'Foundation — Contextualization', sub: 'The broader story this fits into', color: GW.charcoal },
];

function OrientationPhase({ onNext, reduceMotion }) {
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
          6 POINTS TOTAL
        </motion.div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {LEQ_BLOCKS.map((b, i) => {
          const delay = (LEQ_BLOCKS.length - 1 - i) * 0.13;
          return (
            <motion.div key={b.key}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + delay, ease: 'easeInOut' }}
              style={{
                background: GW.parchmentDark, border: `1px solid ${b.color}50`, borderLeft: `5px solid ${b.color}`,
                borderRadius: 10, padding: '13px 18px', display: 'flex', flexDirection: 'column', gap: 3,
              }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
                <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink }}>{b.label}</span>
                <span style={{
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                  color: GW.amber, background: GW.amberSoft, borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap',
                }}>1 pt</span>
              </div>
              <div style={{ fontSize: 13, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>{b.sub}</div>
            </motion.div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center', marginTop: 12 }}>
        <GwButton onClick={onNext}>I'm ready to see the prompt</GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Phase 2: Prompt Decode ─────────────────────────────────────────────────
function SkillDiagram({ skill }) {
  const boxStyle = {
    minWidth: 84, padding: '10px 16px', borderRadius: 10, textAlign: 'center',
    fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: GW.ink,
    background: GW.amberSoft, border: `1px solid ${GW.amber}50`,
  };
  const arrowStyle = { fontSize: 22, color: GW.amber, fontWeight: 800 };
  if (skill === 'comparison') {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
        <div style={boxStyle}>A</div>
        <span style={arrowStyle}>⇄</span>
        <div style={boxStyle}>B</div>
      </div>
    );
  }
  if (skill === 'ccot') {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
        <div style={boxStyle}>Then</div>
        <span style={arrowStyle}>···</span>
        <div style={boxStyle}>Now</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'center', padding: '12px 0' }}>
      <div style={boxStyle}>Cause</div>
      <span style={arrowStyle}>→</span>
      <div style={boxStyle}>Effect</div>
    </div>
  );
}

function DecodePhase({ assignment, decode, onComplete, onClioLine, reduceMotion }) {
  const [step, setStep] = useState(0);
  const [showSkill, setShowSkill] = useState(false);
  const [showMcq, setShowMcq] = useState(false);
  const [mcqAnswer, setMcqAnswer] = useState(null);

  const elements = decode?.elements || {};
  const revealed = DECODE_ORDER.slice(0, step);
  const combinedText = `${assignment.context || ''}\n\n${assignment.prompt || ''}`;

  useEffect(() => {
    if (step === 0 || !decode) return;
    const key = DECODE_ORDER[step - 1];
    const val = elements[key];
    const lines = {
      timePeriod: `This is our time period${val ? `: "${val}"` : ''}. Everything we write should fit inside this window.`,
      geographicScope: `Here's our geography${val ? `: "${val}"` : ''}. Let's keep our examples rooted here.`,
      skill: `And here's our task verb${val ? `: "${val}"` : ''}. This word tells us exactly what kind of argument the prompt wants.`,
      topic: `Finally, our topic${val ? `: "${val}"` : ''}. Everything else hangs off this thread.`,
    };
    onClioLine?.(lines[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, decode]);

  useEffect(() => {
    if (!showSkill || !decode) return;
    const label = HISTORICAL_SKILL_LABELS[decode.historicalSkill] || HISTORICAL_SKILL_LABELS.causation;
    onClioLine?.(`One more thing — this essay is built around ${label}. That's the lens for your whole argument.`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSkill, decode]);

  if (!decode) {
    return (
      <PhaseShell reduceMotion={reduceMotion}>
        <div style={{ textAlign: 'center', padding: '20vh 0', color: GW.inkSoft, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
          Clio is reading the prompt closely…
        </div>
      </PhaseShell>
    );
  }

  if (!showSkill && !showMcq) {
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
            <GwButton onClick={() => setShowSkill(true)}>What kind of thinking does this need?</GwButton>
          )}
        </div>
      </PhaseShell>
    );
  }

  if (showSkill && !showMcq) {
    const skill = decode.historicalSkill || 'causation';
    return (
      <PhaseShell reduceMotion={reduceMotion}>
        <div style={{ background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14, padding: '22px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 4 }}>
            <span style={{
              fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.amber,
              textTransform: 'uppercase', letterSpacing: '0.12em',
            }}>{HISTORICAL_SKILL_LABELS[skill] || HISTORICAL_SKILL_LABELS.causation}</span>
          </div>
          <SkillDiagram skill={skill} />
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, textAlign: 'center', margin: '8px 0 0' }}>
            {HISTORICAL_SKILL_BLURBS[skill] || HISTORICAL_SKILL_BLURBS.causation}
          </p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <GwButton onClick={() => setShowMcq(true)}>Quick check</GwButton>
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
                : "Not quite — let's think again about what this kind of essay is asking us to do. Try another choice."}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div style={{ textAlign: 'center' }}>
        <GwButton onClick={onComplete} disabled={!answeredCorrect}>On to the thesis</GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Shared chat bubbles for Socratic loops ────────────────────────────────────
function SocraticBubbles({ history, busy, locked, input, setInput, onSend, reduceMotion, placeholder }) {
  return (
    <>
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
      {!locked && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            placeholder={placeholder || "Write your response to Clio's question…"}
            disabled={busy}
            style={{
              width: '100%', minHeight: 90, boxSizing: 'border-box', resize: 'vertical',
              borderRadius: 10, border: `1.5px solid ${GW.ink}25`, background: GW.parchment,
              padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14.5, color: GW.ink,
            }} />
          <div style={{ textAlign: 'right' }}>
            <GwButton disabled={busy || !input.trim()} onClick={() => { onSend(input); setInput(''); }}>
              Send to Clio
            </GwButton>
          </div>
        </div>
      )}
    </>
  );
}

function LockedFooter({ message, onContinue, reduceMotion }) {
  return (
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
        {message}
      </div>
      <GwButton onClick={onContinue}>Continue</GwButton>
    </motion.div>
  );
}

// ── Phase 3: Thesis Builder ────────────────────────────────────────────────
function ThesisPhase({ prompt, partState, thesisEval, busy, onSubmit, onContinue, reduceMotion }) {
  const [claim, setClaim] = useState(partState?.claim || '');
  const [reasoning, setReasoning] = useState(partState?.reasoning || '');
  const locked = partState?.locked;
  const attempts = partState?.attempts || 0;

  if (locked) {
    return (
      <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: 0 }}>Your Thesis</h2>
        </div>
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            background: GW.parchmentDark, border: `2px solid ${GW.amber}50`, borderRadius: 14,
            padding: '24px 26px', fontFamily: 'Georgia, serif', fontSize: 15.5, lineHeight: 1.85, color: GW.ink,
            boxShadow: `0 14px 36px rgba(0,0,0,0.12), 0 0 0 6px ${GW.amberSoft}`,
          }}>
          {partState.claim} {partState.reasoning}
        </motion.div>
        <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 13.5 }}>
          This thesis is locked — it's your foundation for everything else you write.
        </div>
        <div style={{ textAlign: 'center' }}>
          <GwButton onClick={onContinue}>Build the foundation</GwButton>
        </div>
      </PhaseShell>
    );
  }

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: '0 0 6px' }}>Build Your Thesis</h2>
        <div style={{ fontSize: 12.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif', fontWeight: 700, letterSpacing: '0.04em' }}>
          Attempt {Math.min(attempts + 1, 3)} of 3
        </div>
      </div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0, textAlign: 'center', fontStyle: 'italic' }}>
        {prompt}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: GW.ink }}>
          Your Claim — what's your position?
        </label>
        <textarea value={claim} onChange={(e) => setClaim(e.target.value)} disabled={busy}
          placeholder="Take a stance on the prompt — something a historian could reasonably disagree with."
          style={{
            width: '100%', minHeight: 70, boxSizing: 'border-box', resize: 'vertical',
            borderRadius: 10, border: `1.5px solid ${thesisEval && !thesisEval.claimOk ? `${GW.rose}80` : `${GW.ink}25`}`,
            background: GW.parchment, padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14.5, color: GW.ink,
          }} />
        {thesisEval && (
          <div style={{
            fontSize: 13, fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: thesisEval.claimOk ? GW.sage : GW.rose,
          }}>{thesisEval.claimFeedback}</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 13, color: GW.ink }}>
          Your Reasoning — why is that true?
        </label>
        <textarea value={reasoning} onChange={(e) => setReasoning(e.target.value)} disabled={busy}
          placeholder="Name the driving factor or mechanism that makes your claim true."
          style={{
            width: '100%', minHeight: 70, boxSizing: 'border-box', resize: 'vertical',
            borderRadius: 10, border: `1.5px solid ${thesisEval && !thesisEval.reasoningOk ? `${GW.rose}80` : `${GW.ink}25`}`,
            background: GW.parchment, padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14.5, color: GW.ink,
          }} />
        {thesisEval && (
          <div style={{
            fontSize: 13, fontFamily: 'Georgia, serif', fontStyle: 'italic',
            color: thesisEval.reasoningOk ? GW.sage : GW.rose,
          }}>{thesisEval.reasoningFeedback}</div>
        )}
      </div>
      {thesisEval?.clio_response && (
        <div style={{
          background: GW.amberSoft, border: `1px solid ${GW.amber}30`, borderRadius: 12, padding: '12px 16px',
          fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 14, color: GW.ink,
        }}>{thesisEval.clio_response}</div>
      )}
      <div style={{ textAlign: 'center' }}>
        <GwButton disabled={busy || !claim.trim() || !reasoning.trim()} onClick={() => onSubmit(claim, reasoning)}>
          {busy ? 'Clio is reading…' : 'Check my thesis'}
        </GwButton>
      </div>
    </PhaseShell>
  );
}

// ── Phase 4: Contextualization Socratic loop ──────────────────────────────────
function ContextualizationPhase({ partState, busy, onAsk, onAnswer, onContinue, reduceMotion }) {
  const [input, setInput] = useState('');
  const history = partState?.history || [];
  const locked = partState?.locked;

  useEffect(() => {
    if (history.length === 0 && !busy && !locked) onAsk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{
          background: GW.parchmentDark, border: `2px solid ${GW.amber}50`, borderRadius: 16, padding: '22px 24px',
          boxShadow: `0 0 0 6px ${GW.amberSoft}`,
        }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink }}>Contextualization</span>
          <span style={{
            fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: GW.amber, background: GW.amberSoft, borderRadius: 6, padding: '2px 8px',
          }}>1 pt</span>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0 }}>
          Describe a broader historical development or process connected to your topic, then connect it to your own argument.
        </p>
      </motion.div>
      <SocraticBubbles history={history} busy={busy} locked={locked} input={input} setInput={setInput}
        onSend={onAnswer} reduceMotion={reduceMotion} />
      {locked && <LockedFooter message="Contextualization is locked in." onContinue={onContinue} reduceMotion={reduceMotion} />}
    </PhaseShell>
  );
}

// ── Phase 5: Evidence + Analysis Socratic loop (used for evidence_1 / evidence_2) ──
function EvidencePhase({ slotKey, partState, busy, onAsk, onAnswer, onContinue, reduceMotion }) {
  const [input, setInput] = useState('');
  const history = partState?.history || [];
  const locked = partState?.locked;
  const step = partState?.step || 'evidence';

  useEffect(() => {
    if (history.length === 0 && !busy && !locked) onAsk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stepLabel = step === 'analysis' ? 'Connect it to your thesis' : 'Find specific evidence';

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <motion.div
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{
          background: GW.parchmentDark, border: `2px solid ${GW.sage}50`, borderRadius: 16, padding: '22px 24px',
          boxShadow: `0 0 0 6px ${GW.sageSoft}`,
        }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink }}>{EVIDENCE_LABELS[slotKey]}</span>
          <span style={{
            fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: GW.sage, background: GW.sageSoft, borderRadius: 6, padding: '2px 8px',
          }}>{stepLabel}</span>
        </div>
        {step === 'analysis' && partState.evidenceText && (
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 13.5, fontStyle: 'italic', color: GW.inkSoft, marginBottom: 4 }}>
            Your evidence: "{partState.evidenceText}"
          </div>
        )}
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0 }}>
          {step === 'analysis'
            ? 'Now let’s connect that evidence to your thesis — how does it support your argument?'
            : 'Name one specific piece of evidence — a person, place, treaty, or event a historian could verify.'}
        </p>
      </motion.div>
      <SocraticBubbles history={history} busy={busy} locked={locked} input={input} setInput={setInput}
        onSend={onAnswer} reduceMotion={reduceMotion} />
      {locked && <LockedFooter message={`${EVIDENCE_LABELS[slotKey]} is locked in.`} onContinue={onContinue} reduceMotion={reduceMotion} />}
    </PhaseShell>
  );
}

// ── Phase 6: Complexity pathway picker + Socratic loop ────────────────────────
function ComplexityPhase({ partState, complexityPathways, busy, onChoosePathway, onAsk, onAnswer, onContinue, reduceMotion }) {
  const [input, setInput] = useState('');
  const history = partState?.history || [];
  const locked = partState?.locked;
  const pathway = partState?.pathway;

  useEffect(() => {
    if (pathway && history.length === 0 && !busy && !locked) onAsk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathway]);

  if (!pathway) {
    return (
      <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: '0 0 6px' }}>Choose Your Complexity Pathway</h2>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14, margin: 0 }}>
            The complexity point comes from sustained nuance — pick the move that fits your argument best.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(complexityPathways || {}).map(([key, p]) => (
            <motion.button key={key}
              whileHover={!busy ? { scale: 1.01 } : {}}
              whileTap={!busy ? { scale: 0.99 } : {}}
              disabled={busy}
              onClick={() => onChoosePathway(key)}
              style={{
                textAlign: 'left', padding: '16px 20px', borderRadius: 12, cursor: busy ? 'not-allowed' : 'pointer',
                border: `1.5px solid ${GW.rose}40`, background: GW.parchmentDark,
              }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.inkSoft }}>{p.blurb}</div>
            </motion.button>
          ))}
        </div>
      </PhaseShell>
    );
  }

  const pathwayInfo = complexityPathways?.[pathway];
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
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink }}>Complexity</span>
          <span style={{
            fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: GW.rose, background: GW.roseSoft, borderRadius: 6, padding: '2px 8px',
          }}>{pathwayInfo?.label || pathway}</span>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0 }}>
          {pathwayInfo?.blurb}
        </p>
      </motion.div>
      <SocraticBubbles history={history} busy={busy} locked={locked} input={input} setInput={setInput}
        onSend={onAnswer} reduceMotion={reduceMotion} />
      {locked && <LockedFooter message="Complexity is locked in." onContinue={onContinue} reduceMotion={reduceMotion} />}
    </PhaseShell>
  );
}

// ── Phase 7: Reveal ────────────────────────────────────────────────────────
function RevealPhase({ partResponses, onContinue, compiling, previewMode, reduceMotion }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 500);
    return () => clearTimeout(t);
  }, []);

  const thesis = partResponses.thesis || emptyThesis();
  const ev1 = partResponses.evidence_1 || emptyEvidenceStage();
  const ev2 = partResponses.evidence_2 || emptyEvidenceStage();
  const paragraphs = [
    partResponses.contextualization?.finalText,
    `${thesis.claim} ${thesis.reasoning}`.trim(),
    `${ev1.evidenceText} ${ev1.analysisText}`.trim(),
    `${ev2.evidenceText} ${ev2.analysisText}`.trim(),
    partResponses.complexity?.finalText,
  ];

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: 0 }}>Here is your essay</h2>
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
        {paragraphs.map((p, i) => (
          <p key={i} style={{ margin: '0 0 14px' }}>{p}</p>
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

// ── Phase 8: Rubric Reveal ─────────────────────────────────────────────────
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
            {criterion?.maxPoints > 1 && (
              <span style={{ fontSize: 11.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>
                {criterion?.points ?? 0}/{criterion?.maxPoints}
              </span>
            )}
          </div>
          <div style={{ fontSize: 13.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif', lineHeight: 1.5 }}>
            {criterion?.feedback}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

const LEQ_CRITERIA_ORDER = ['contextualization', 'thesis', 'evidence', 'reasoning', 'complexity'];
const LEQ_CRITERIA_LABELS = {
  contextualization: 'Contextualization', thesis: 'Thesis', evidence: 'Evidence',
  reasoning: 'Historical Reasoning', complexity: 'Complexity',
};

function RubricPhase({ grading, award, reflection, onReflectionChange, onSaveReflection, onFinish, previewMode, reduceMotion }) {
  const breakdown = grading?.breakdown || {};
  const score = grading?.score ?? 0;
  const maxScore = grading?.maxScore ?? 6;

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
        {LEQ_CRITERIA_ORDER.map((key, i) => (
          <FlipCard key={key} label={LEQ_CRITERIA_LABELS[key]} criterion={breakdown[key]}
            delay={300 + i * 220} reduceMotion={reduceMotion} />
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
export default function GuidedWalkLEQ() {
  const { navigate, screenParams } = useApp();
  const { assignmentId, previewMode } = screenParams || {};
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('opener');
  const [partResponses, setPartResponses] = useState({
    thesis: emptyThesis(),
    contextualization: emptyLoopStage(),
    evidence_1: emptyEvidenceStage(),
    evidence_2: emptyEvidenceStage(),
    complexity: emptyComplexityStage(),
  });
  const [decode, setDecode] = useState(null);
  const [thesisEval, setThesisEval] = useState(null);
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
        const res = await api.get(`/api/write/guided-walk-leq/${assignmentId}`);
        setData(res);
        const session = res.session;
        setPhase(session.phase || 'opener');
        const pr = session.part_responses || {};
        setPartResponses({
          thesis: pr.thesis || emptyThesis(),
          contextualization: pr.contextualization || emptyLoopStage(),
          evidence_1: pr.evidence_1 || emptyEvidenceStage(),
          evidence_2: pr.evidence_2 || emptyEvidenceStage(),
          complexity: pr.complexity || emptyComplexityStage(),
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
      api.patch(`/api/write/guided-walk-leq/${assignmentId}`, { phase, partResponses, reflection }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [previewMode, data, assignmentId, phase, partResponses, reflection]);

  // Clio's opening lines for the framing phases
  useEffect(() => {
    if (!data) return;
    if (phase === 'opener') {
      setClio({ text: `We're going to write an LEQ together — "${data.assignment.title}". I'll be right here the whole way.`, state: 'idle' });
    } else if (phase === 'orientation') {
      setClio({ text: "An LEQ is worth 6 points. We'll build it like a building — foundation first, then the rest, one piece at a time.", state: 'idle' });
    } else if (phase === 'thesis') {
      setClio({ text: "Let's start with your thesis — your claim, and the reasoning behind it. You'll have up to three tries to get it right.", state: 'idle' });
    }
  }, [phase, data]);

  // Fetch the Phase 2 decode bundle once we arrive there
  useEffect(() => {
    if (phase !== 'decode' || decode || !data) return;
    (async () => {
      try {
        const res = await api.post(`/api/write/guided-walk-leq/${assignmentId}/decode`, {});
        setDecode(res.decode);
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [phase, decode, data, assignmentId]);

  const persistPhase = useCallback((nextPhase) => {
    setPhase(nextPhase);
    if (!previewMode) {
      api.patch(`/api/write/guided-walk-leq/${assignmentId}`, { phase: nextPhase }).catch(() => {});
    }
  }, [assignmentId, previewMode]);

  const onBegin = () => persistPhase('orientation');
  const onOrientationNext = () => persistPhase('decode');
  const onDecodeComplete = () => {
    setClio({ text: "Now let's build your thesis — one careful claim, with reasoning behind it.", state: 'idle' });
    persistPhase('thesis');
  };

  const submitThesis = useCallback(async (claim, reasoning) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk-leq/${assignmentId}/thesis`, { claim, reasoning });
      setThesisEval(res);
      setPartResponses((prev) => ({ ...prev, thesis: { claim, reasoning, attempts: res.attempts, locked: res.locked } }));
      setClio({ text: res.clio_response, state: res.locked ? 'celebrating' : 'speaking' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const onThesisContinue = () => {
    setClio({ text: "Now let's set the scene. What's the broader story your topic fits into?", state: 'idle' });
    persistPhase('contextualization');
  };

  const askClio = useCallback(async (stage) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk-leq/${assignmentId}/ask`, { stage });
      setPartResponses((prev) => ({ ...prev, [stage]: { ...prev[stage], history: res.history, step: res.step || prev[stage].step } }));
      const last = res.history[res.history.length - 1];
      if (last) setClio({ text: last.text, state: 'speaking' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const answerClio = useCallback(async (stage, text) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk-leq/${assignmentId}/answer`, { stage, text });
      setPartResponses((prev) => ({
        ...prev,
        [stage]: {
          ...prev[stage],
          history: res.history,
          locked: res.locked,
          step: res.step,
          evidenceText: res.evidenceText,
          analysisText: res.analysisText,
          finalText: res.finalText,
        },
      }));
      setClio({ text: res.clio_response, state: res.advance ? 'celebrating' : 'speaking' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const choosePathway = useCallback(async (pathway) => {
    setBusy(true);
    try {
      await api.post(`/api/write/guided-walk-leq/${assignmentId}/complexity-pathway`, { pathway });
      setPartResponses((prev) => ({ ...prev, complexity: { pathway, locked: false, finalText: '', history: [] } }));
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const continueStage = useCallback((stage) => {
    const order = {
      contextualization: 'evidence_1',
      evidence_1: 'evidence_2',
      evidence_2: 'complexity',
      complexity: 'reveal',
    };
    const next = order[stage];
    const lines = {
      evidence_1: "Great — let's find a second piece of evidence to round out your argument.",
      evidence_2: "Now for the hardest point — complexity. Let's choose a pathway.",
      complexity: 'You wrote this. Every word. Let’s see it all together.',
    };
    if (lines[next]) setClio({ text: lines[next], state: 'idle' });
    persistPhase(next);
  }, [persistPhase]);

  const onCompile = useCallback(async () => {
    setCompiling(true);
    try {
      const res = await api.post(`/api/write/guided-walk-leq/${assignmentId}/compile`, {});
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
    api.post(`/api/write/guided-walk-leq/${assignmentId}/reflection`, { text: reflection }).catch(() => {});
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

  const { assignment, complexityPathways } = data;

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      {previewMode && <PreviewBanner />}
      <TopBar title="The Long Game" phases={PHASES} phase={phase} onBack={onBack} completePhase="rubric" />
      <AnimatePresence mode="wait">
        {phase === 'opener' && (
          <OpenerPhase key="opener" title={assignment.title} onBegin={onBegin} reduceMotion={reduceMotion} />
        )}
        {phase === 'orientation' && (
          <OrientationPhase key="orientation" onNext={onOrientationNext} reduceMotion={reduceMotion} />
        )}
        {phase === 'decode' && (
          <DecodePhase key="decode" assignment={assignment} decode={decode}
            onComplete={onDecodeComplete} onClioLine={(text) => setClio({ text, state: 'speaking' })} reduceMotion={reduceMotion} />
        )}
        {phase === 'thesis' && (
          <ThesisPhase key="thesis" prompt={assignment.prompt} partState={partResponses.thesis} thesisEval={thesisEval}
            busy={busy} onSubmit={submitThesis} onContinue={onThesisContinue} reduceMotion={reduceMotion} />
        )}
        {phase === 'contextualization' && (
          <ContextualizationPhase key="contextualization" partState={partResponses.contextualization} busy={busy}
            onAsk={() => askClio('contextualization')}
            onAnswer={(text) => answerClio('contextualization', text)}
            onContinue={() => continueStage('contextualization')}
            reduceMotion={reduceMotion} />
        )}
        {(phase === 'evidence_1' || phase === 'evidence_2') && (
          <EvidencePhase key={phase} slotKey={phase} partState={partResponses[phase]} busy={busy}
            onAsk={() => askClio(phase)}
            onAnswer={(text) => answerClio(phase, text)}
            onContinue={() => continueStage(phase)}
            reduceMotion={reduceMotion} />
        )}
        {phase === 'complexity' && (
          <ComplexityPhase key="complexity" partState={partResponses.complexity} complexityPathways={complexityPathways}
            busy={busy} onChoosePathway={choosePathway}
            onAsk={() => askClio('complexity')}
            onAnswer={(text) => answerClio('complexity', text)}
            onContinue={() => continueStage('complexity')}
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
