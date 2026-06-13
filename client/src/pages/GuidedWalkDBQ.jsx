'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW } from '../lib/guidedWalkTheme.js';
import Clio from '../components/write/Clio.jsx';
import { TopBar, PreviewBanner, GwButton, PhaseShell } from '../components/write/gwShared.jsx';

// ── Guided Walk — DBQ "Reading the Room" ──────────────────────────────────────
// A full-screen, one-thing-at-a-time tutor walk through writing a DBQ response,
// narrated by Clio. Phases: opener → documents → thesis → contextualization →
// evidence_1 → evidence_2 → evidence_3 → evidence_beyond → complexity → reveal →
// rubric (server may report 'complete' once graded — treated like rubric).

const PHASES = ['opener', 'documents', 'thesis', 'contextualization', 'evidence_1', 'evidence_2', 'evidence_3', 'evidence_beyond', 'complexity', 'reveal', 'rubric'];
const EVIDENCE_STAGES = ['evidence_1', 'evidence_2', 'evidence_3'];
const HAPP_ORDER = ['context', 'audience', 'purpose', 'pov'];
const EVIDENCE_LABELS = {
  evidence_1: 'First Document',
  evidence_2: 'Second Document',
  evidence_3: 'Third Document',
};

function emptyThesis() { return { claim: '', reasoning: '', attempts: 0, locked: false }; }
function emptyLoopStage() { return { locked: false, finalText: '', history: [] }; }
function emptyEvidenceStage() { return { docNumber: null, step: 'evidence', evidenceText: '', sourcingText: '', locked: false, history: [] }; }
function emptyComplexityStage() { return { pathway: null, locked: false, finalText: '', history: [] }; }
function emptyDocumentsStage() { return { triage: {}, happFull: null, happAbbrev: {}, locked: false }; }

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
          Reading the Room
        </div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(28px, 6vw, 46px)', color: GW.ink, margin: '0 0 16px', fontWeight: 800 }}>
          {title}
        </h1>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 15, maxWidth: 460, margin: '0 auto 36px' }}>
          Seven sources. One argument. Everything you need is already here.
        </p>
        <GwButton onClick={onBegin}>Begin</GwButton>
      </motion.div>
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

// ── Document card (used in triage, HAPP, and evidence phases) ────────────────
function DocumentCard({ doc, compact }) {
  return (
    <div style={{ background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12, padding: '16px 18px' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.ink, marginBottom: 4 }}>
        Document {doc.doc_number} — {doc.title}
      </div>
      <div style={{ fontSize: 12.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif', marginBottom: compact ? 0 : 8, fontStyle: 'italic' }}>
        {doc.source}{doc.year ? `, ${doc.year}` : ''}
      </div>
      {!compact && (
        <div style={{
          fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.7, color: GW.ink, whiteSpace: 'pre-wrap',
          maxHeight: 240, overflowY: 'auto', paddingRight: 4,
        }}>
          {doc.body}
        </div>
      )}
    </div>
  );
}

// ── Phase 1: Documents — Triage + HAPP Deep Dive ──────────────────────────────
function pillStyle(active, color) {
  return {
    flex: 1, textAlign: 'center', padding: '8px 12px', borderRadius: 999, cursor: 'pointer',
    fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 12.5,
    border: `1.5px solid ${active ? color : `${GW.ink}25`}`,
    background: active ? `${color}30` : 'transparent', color: GW.ink,
  };
}

function TriageStep({ documents, initialTriage, busy, onContinue, reduceMotion }) {
  const [choices, setChoices] = useState(initialTriage || {});
  const allChosen = documents.every((d) => choices[d.doc_number]);

  return (
    <PhaseShell maxWidth={760} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: '0 0 6px' }}>Document Triage</h2>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14, margin: 0 }}>
          There's no wrong pile right now. Sort each document by what it might support or complicate.
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
        {documents.map((doc) => {
          const choice = choices[doc.doc_number];
          return (
            <div key={doc.doc_number} style={{
              background: GW.parchmentDark, borderRadius: 12, padding: '14px 16px', display: 'flex',
              flexDirection: 'column', gap: 8,
              border: `1.5px solid ${choice === 'supports' ? `${GW.sage}80` : choice === 'complicates' ? `${GW.rose}80` : `${GW.ink}20`}`,
            }}>
              <DocumentCard doc={doc} compact />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setChoices((p) => ({ ...p, [doc.doc_number]: 'supports' }))} style={pillStyle(choice === 'supports', GW.sage)}>
                  Supports
                </button>
                <button onClick={() => setChoices((p) => ({ ...p, [doc.doc_number]: 'complicates' }))} style={pillStyle(choice === 'complicates', GW.rose)}>
                  Complicates
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center' }}>
        <GwButton disabled={!allChosen || busy} onClick={() => onContinue(choices)}>
          Now let's read one of these carefully
        </GwButton>
      </div>
    </PhaseShell>
  );
}

function HappFullStep({ document, happDimensions, responses, busy, onSubmit, reduceMotion }) {
  const dim = HAPP_ORDER.find((d) => !responses?.[d]) || HAPP_ORDER[0];
  const [text, setText] = useState('');
  useEffect(() => { setText(''); }, [dim]);
  const info = happDimensions?.[dim] || {};
  const stepIndex = HAPP_ORDER.indexOf(dim) + 1;

  return (
    <PhaseShell maxWidth={760} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: '0 0 6px' }}>Reading Document {document.doc_number} as a Historian</h2>
        <div style={{ fontSize: 12.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif', fontWeight: 700, letterSpacing: '0.04em' }}>
          HAPP — Step {stepIndex} of {HAPP_ORDER.length}
        </div>
      </div>
      <DocumentCard doc={document} />
      <motion.div
        key={dim}
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{
          background: GW.amberSoft, border: `2px solid ${GW.amber}50`, borderRadius: 16, padding: '20px 22px',
        }}>
        <div style={{
          fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
          color: GW.amber, marginBottom: 8,
        }}>{info.label}</div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0 }}>
          {info.prompt}
        </p>
      </motion.div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={busy}
        placeholder="Write your answer here…"
        style={{
          width: '100%', minHeight: 80, boxSizing: 'border-box', resize: 'vertical',
          borderRadius: 10, border: `1.5px solid ${GW.ink}25`, background: GW.parchment,
          padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14.5, color: GW.ink,
        }} />
      <div style={{ textAlign: 'center' }}>
        <GwButton disabled={busy || !text.trim()} onClick={() => onSubmit(dim, text)}>
          {busy ? 'Clio is reading…' : 'Send to Clio'}
        </GwButton>
      </div>
    </PhaseShell>
  );
}

function HappAbbrevStep({ document, busy, onSubmit, reduceMotion }) {
  const [text, setText] = useState('');
  return (
    <PhaseShell maxWidth={720} reduceMotion={reduceMotion}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: '0 0 6px' }}>Quick HAPP: Document {document.doc_number}</h2>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14, margin: 0 }}>
          Same idea, faster — you've got this.
        </p>
      </div>
      <DocumentCard doc={document} />
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, textAlign: 'center', margin: 0 }}>
        In a sentence or two — who created this, when, and why? How might that shape what it says?
      </p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} disabled={busy}
        placeholder="Write your answer here…"
        style={{
          width: '100%', minHeight: 70, boxSizing: 'border-box', resize: 'vertical',
          borderRadius: 10, border: `1.5px solid ${GW.ink}25`, background: GW.parchment,
          padding: 12, fontFamily: 'Nunito, sans-serif', fontSize: 14.5, color: GW.ink,
        }} />
      <div style={{ textAlign: 'center' }}>
        <GwButton disabled={busy || !text.trim()} onClick={() => onSubmit(text)}>
          {busy ? 'Clio is reading…' : 'Send to Clio'}
        </GwButton>
      </div>
    </PhaseShell>
  );
}

function DocumentsPhase({ documents, partState, happDimensions, happFullDoc, happAbbrevDocs, busy, onTriageContinue, onHapp, onContinue, reduceMotion }) {
  const triage = partState?.triage || {};
  const triageDone = documents.every((d) => triage[d.doc_number]);

  if (!triageDone) {
    return <TriageStep documents={documents} initialTriage={triage} busy={busy} onContinue={onTriageContinue} reduceMotion={reduceMotion} />;
  }

  const happFull = partState?.happFull;
  if (!happFull?.locked) {
    const doc = documents.find((d) => d.doc_number === happFullDoc);
    return (
      <HappFullStep document={doc} happDimensions={happDimensions} responses={happFull?.responses}
        busy={busy} onSubmit={(dim, text) => onHapp(happFullDoc, dim, text)} reduceMotion={reduceMotion} />
    );
  }

  const happAbbrev = partState?.happAbbrev || {};
  const nextAbbrev = (happAbbrevDocs || []).find((n) => !happAbbrev[n]?.locked);
  if (nextAbbrev) {
    const doc = documents.find((d) => d.doc_number === nextAbbrev);
    return (
      <HappAbbrevStep document={doc} busy={busy}
        onSubmit={(text) => onHapp(nextAbbrev, 'context', text)} reduceMotion={reduceMotion} />
    );
  }

  return (
    <PhaseShell maxWidth={680} reduceMotion={reduceMotion}>
      <LockedFooter message="You've read the room. Time to build your argument." onContinue={onContinue} reduceMotion={reduceMotion} />
    </PhaseShell>
  );
}

// ── Phase 2: Thesis Builder ────────────────────────────────────────────────
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
          <GwButton onClick={onContinue}>Set the scene</GwButton>
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

// ── Phase 3: Contextualization Socratic loop ──────────────────────────────────
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
          Describe a broader historical development or process connected to this topic, then connect it to your own argument.
        </p>
      </motion.div>
      <SocraticBubbles history={history} busy={busy} locked={locked} input={input} setInput={setInput}
        onSend={onAnswer} reduceMotion={reduceMotion} />
      {locked && <LockedFooter message="Contextualization is locked in." onContinue={onContinue} reduceMotion={reduceMotion} />}
    </PhaseShell>
  );
}

// ── Phase 4: Document Evidence + Sourcing Socratic loop (evidence_1/2/3) ──────
function EvidencePhase({ slotKey, partState, documents, usedDocNumbers, busy, onChooseDoc, onAsk, onAnswer, onContinue, reduceMotion }) {
  const [input, setInput] = useState('');
  const history = partState?.history || [];
  const locked = partState?.locked;
  const step = partState?.step || 'evidence';
  const docNumber = partState?.docNumber;

  useEffect(() => {
    if (docNumber && history.length === 0 && !busy && !locked) onAsk();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docNumber, step]);

  if (!docNumber) {
    const available = documents.filter((d) => !usedDocNumbers.includes(d.doc_number));
    return (
      <PhaseShell maxWidth={720} reduceMotion={reduceMotion}>
        <div style={{ textAlign: 'center', marginBottom: 4 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, margin: '0 0 6px' }}>{EVIDENCE_LABELS[slotKey]}</h2>
          <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14, margin: 0 }}>
            Choose a document to anchor this part of your argument.
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {available.map((doc) => (
            <motion.button key={doc.doc_number}
              whileHover={!busy ? { scale: 1.01 } : {}}
              whileTap={!busy ? { scale: 0.99 } : {}}
              disabled={busy}
              onClick={() => onChooseDoc(doc.doc_number)}
              style={{
                textAlign: 'left', padding: '14px 18px', borderRadius: 12, cursor: busy ? 'not-allowed' : 'pointer',
                border: `1.5px solid ${GW.sage}40`, background: GW.parchmentDark,
              }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.ink, marginBottom: 2 }}>
                Document {doc.doc_number} — {doc.title}
              </div>
              <div style={{ fontSize: 12.5, color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>
                {doc.source}{doc.year ? `, ${doc.year}` : ''}
              </div>
            </motion.button>
          ))}
        </div>
      </PhaseShell>
    );
  }

  const document = documents.find((d) => d.doc_number === docNumber);
  const stepLabel = step === 'sourcing' ? 'Sourcing (HAPP)' : 'Summarize & connect';

  return (
    <PhaseShell maxWidth={760} reduceMotion={reduceMotion}>
      {document && <DocumentCard doc={document} />}
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
        {step === 'sourcing' && partState.evidenceText && (
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 13.5, fontStyle: 'italic', color: GW.inkSoft, marginBottom: 4 }}>
            Your summary: "{partState.evidenceText}"
          </div>
        )}
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0 }}>
          {step === 'sourcing'
            ? "Now think about HAPP for this document — how does who made it, when, and why shape how you'd use it as evidence?"
            : 'Summarize what this document says in your own words, then explain how it supports your thesis.'}
        </p>
      </motion.div>
      <SocraticBubbles history={history} busy={busy} locked={locked} input={input} setInput={setInput}
        onSend={onAnswer} reduceMotion={reduceMotion} />
      {locked && <LockedFooter message={`${EVIDENCE_LABELS[slotKey]} is locked in.`} onContinue={onContinue} reduceMotion={reduceMotion} />}
    </PhaseShell>
  );
}

// ── Phase 5: Evidence Beyond the Documents ────────────────────────────────────
function EvidenceBeyondPhase({ partState, busy, onAsk, onAnswer, onContinue, reduceMotion }) {
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
          background: GW.parchmentDark, border: `2px solid ${GW.blue}50`, borderRadius: 16, padding: '22px 24px',
          boxShadow: `0 0 0 6px ${GW.blueSoft}`,
        }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 18, color: GW.ink }}>Evidence Beyond the Documents</span>
          <span style={{
            fontSize: 11.5, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em',
            color: GW.blue, background: GW.blueSoft, borderRadius: 6, padding: '2px 8px',
          }}>1 pt</span>
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 14.5, lineHeight: 1.7, color: GW.ink, margin: 0 }}>
          Now give Clio something you know that isn't in any of the seven documents — a specific event, person, treaty, or development that supports your argument.
        </p>
      </motion.div>
      <SocraticBubbles history={history} busy={busy} locked={locked} input={input} setInput={setInput}
        onSend={onAnswer} reduceMotion={reduceMotion} />
      {locked && <LockedFooter message="Outside evidence is locked in." onContinue={onContinue} reduceMotion={reduceMotion} />}
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
            You already have seven sources — complexity often comes from noticing what's NOT in the documents, or connecting this period to what came before or after.
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
  const docParagraphs = EVIDENCE_STAGES.map((s) => {
    const ev = partResponses[s] || emptyEvidenceStage();
    return `(Document ${ev.docNumber}) ${ev.evidenceText || ''} ${ev.sourcingText || ''}`.trim();
  });
  const paragraphs = [
    partResponses.contextualization?.finalText,
    `${thesis.claim} ${thesis.reasoning}`.trim(),
    ...docParagraphs,
    partResponses.evidence_beyond?.finalText,
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

const DBQ_CRITERIA_ORDER = ['contextualization', 'thesis', 'evidence_documents', 'evidence_beyond', 'complexity'];
const DBQ_CRITERIA_LABELS = {
  contextualization: 'Contextualization',
  thesis: 'Thesis',
  evidence_documents: 'Evidence from Documents',
  evidence_beyond: 'Evidence Beyond the Documents',
  complexity: 'Complexity',
};

function RubricPhase({ grading, award, reflection, onReflectionChange, onSaveReflection, onFinish, previewMode, reduceMotion }) {
  const breakdown = grading?.breakdown || {};
  const score = grading?.score ?? 0;
  const maxScore = grading?.maxScore ?? 7;

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
        {DBQ_CRITERIA_ORDER.map((key, i) => (
          <FlipCard key={key} label={DBQ_CRITERIA_LABELS[key]} criterion={breakdown[key]}
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
export default function GuidedWalkDBQ() {
  const { navigate, screenParams } = useApp();
  const { assignmentId, previewMode } = screenParams || {};
  const reduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [phase, setPhase] = useState('opener');
  const [partResponses, setPartResponses] = useState({
    documents: emptyDocumentsStage(),
    thesis: emptyThesis(),
    contextualization: emptyLoopStage(),
    evidence_1: emptyEvidenceStage(),
    evidence_2: emptyEvidenceStage(),
    evidence_3: emptyEvidenceStage(),
    evidence_beyond: emptyLoopStage(),
    complexity: emptyComplexityStage(),
  });
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
        const res = await api.get(`/api/write/guided-walk-dbq/${assignmentId}`);
        setData(res);
        const session = res.session;
        setPhase(session.phase || 'opener');
        const pr = session.part_responses || {};
        setPartResponses({
          documents: pr.documents || emptyDocumentsStage(),
          thesis: pr.thesis || emptyThesis(),
          contextualization: pr.contextualization || emptyLoopStage(),
          evidence_1: pr.evidence_1 || emptyEvidenceStage(),
          evidence_2: pr.evidence_2 || emptyEvidenceStage(),
          evidence_3: pr.evidence_3 || emptyEvidenceStage(),
          evidence_beyond: pr.evidence_beyond || emptyLoopStage(),
          complexity: pr.complexity || emptyComplexityStage(),
        });
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
      api.patch(`/api/write/guided-walk-dbq/${assignmentId}`, { phase, partResponses, reflection }).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [previewMode, data, assignmentId, phase, partResponses, reflection]);

  // Clio's opening lines for the framing phases
  useEffect(() => {
    if (!data) return;
    if (phase === 'opener') {
      setClio({ text: `We're going to write a DBQ together — "${data.assignment.title}". Seven documents, one argument — I'll be right here.`, state: 'idle' });
    } else if (phase === 'documents') {
      setClio({ text: "There's no wrong pile right now. You're just noticing what you have.", state: 'idle' });
    } else if (phase === 'thesis') {
      setClio({ text: "Let's build your thesis — your claim, and the reasoning behind it. You'll have up to three tries to get it right.", state: 'idle' });
    }
  }, [phase, data]);

  const persistPhase = useCallback((nextPhase) => {
    setPhase(nextPhase);
    if (!previewMode) {
      api.patch(`/api/write/guided-walk-dbq/${assignmentId}`, { phase: nextPhase }).catch(() => {});
    }
  }, [assignmentId, previewMode]);

  const onBegin = () => persistPhase('documents');

  const submitTriage = useCallback(async (choices) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk-dbq/${assignmentId}/triage`, { triage: choices });
      setPartResponses((prev) => ({ ...prev, documents: { ...prev.documents, triage: res.triage } }));
      setClio({ text: "Now let's read one of these carefully.", state: 'idle' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const submitHapp = useCallback(async (docNumber, dimension, text) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk-dbq/${assignmentId}/happ`, { docNumber, dimension, text });
      setPartResponses((prev) => ({ ...prev, documents: res.documents }));
      setClio({ text: res.feedback, state: 'speaking' });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }, [assignmentId]);

  const onDocumentsContinue = () => {
    setClio({ text: "Now let's build your thesis — your claim, and the reasoning behind it.", state: 'idle' });
    persistPhase('thesis');
  };

  const submitThesis = useCallback(async (claim, reasoning) => {
    setBusy(true);
    try {
      const res = await api.post(`/api/write/guided-walk-dbq/${assignmentId}/thesis`, { claim, reasoning });
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
    setClio({ text: "Now let's set the scene. What's the broader story this topic fits into?", state: 'idle' });
    persistPhase('contextualization');
  };

  const askClio = useCallback(async (stage, docNumber) => {
    setBusy(true);
    try {
      const body = docNumber ? { stage, docNumber } : { stage };
      const res = await api.post(`/api/write/guided-walk-dbq/${assignmentId}/ask`, body);
      setPartResponses((prev) => ({
        ...prev,
        [stage]: { ...prev[stage], history: res.history, step: res.step || prev[stage].step, docNumber: res.docNumber ?? prev[stage].docNumber },
      }));
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
      const res = await api.post(`/api/write/guided-walk-dbq/${assignmentId}/answer`, { stage, text });
      setPartResponses((prev) => ({
        ...prev,
        [stage]: {
          ...prev[stage],
          history: res.history,
          locked: res.locked,
          step: res.step,
          docNumber: res.docNumber ?? prev[stage].docNumber,
          evidenceText: res.evidenceText,
          sourcingText: res.sourcingText,
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
      await api.post(`/api/write/guided-walk-dbq/${assignmentId}/complexity-pathway`, { pathway });
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
      evidence_2: 'evidence_3',
      evidence_3: 'evidence_beyond',
      evidence_beyond: 'complexity',
      complexity: 'reveal',
    };
    const next = order[stage];
    const lines = {
      evidence_1: 'Good — now let\'s bring a second document into your argument.',
      evidence_2: 'One more document to go.',
      evidence_3: "Now something from outside the documents — what do you already know that isn't here?",
      evidence_beyond: "Now for the hardest point — complexity. Let's choose a pathway.",
      complexity: 'You wrote this. Every word. Let’s see it all together.',
    };
    if (lines[next]) setClio({ text: lines[next], state: 'idle' });
    persistPhase(next);
  }, [persistPhase]);

  const onCompile = useCallback(async () => {
    setCompiling(true);
    try {
      const res = await api.post(`/api/write/guided-walk-dbq/${assignmentId}/compile`, {});
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
    api.post(`/api/write/guided-walk-dbq/${assignmentId}/reflection`, { text: reflection }).catch(() => {});
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

  const { assignment, documents, complexityPathways, happDimensions, happFullDoc, happAbbrevDocs } = data;

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      {previewMode && <PreviewBanner />}
      <TopBar title="Reading the Room" phases={PHASES} phase={phase} onBack={onBack} completePhase="rubric" />
      <AnimatePresence mode="wait">
        {phase === 'opener' && (
          <OpenerPhase key="opener" title={assignment.title} onBegin={onBegin} reduceMotion={reduceMotion} />
        )}
        {phase === 'documents' && (
          <DocumentsPhase key="documents" documents={documents} partState={partResponses.documents}
            happDimensions={happDimensions} happFullDoc={happFullDoc} happAbbrevDocs={happAbbrevDocs}
            busy={busy} onTriageContinue={submitTriage} onHapp={submitHapp} onContinue={onDocumentsContinue}
            reduceMotion={reduceMotion} />
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
        {EVIDENCE_STAGES.includes(phase) && (
          <EvidencePhase key={phase} slotKey={phase} partState={partResponses[phase]} documents={documents}
            usedDocNumbers={EVIDENCE_STAGES.filter((s) => s !== phase).map((s) => partResponses[s]?.docNumber).filter(Boolean)}
            busy={busy}
            onChooseDoc={(docNumber) => askClio(phase, docNumber)}
            onAsk={() => askClio(phase)}
            onAnswer={(text) => answerClio(phase, text)}
            onContinue={() => continueStage(phase)}
            reduceMotion={reduceMotion} />
        )}
        {phase === 'evidence_beyond' && (
          <EvidenceBeyondPhase key="evidence_beyond" partState={partResponses.evidence_beyond} busy={busy}
            onAsk={() => askClio('evidence_beyond')}
            onAnswer={(text) => answerClio('evidence_beyond', text)}
            onContinue={() => continueStage('evidence_beyond')}
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
