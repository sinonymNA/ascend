'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';
import Clio from '../components/write/Clio.jsx';

// ── Blind Peer Grade (screen "peer_grade") ───────────────────────────────────
// Individual, async: student grades an anonymized classmate's already-AI-graded
// essay against a simplified rubric (point granted or not + one-sentence
// justification per criterion), then sees the AI's real score for comparison.

const ACCURACY_COPY = {
  full: { label: 'Spot on!', color: GW.sage, detail: 'Your total was within 1 point of the AI grader.' },
  partial: { label: 'Close', color: GW.amber, detail: 'Your total was off by 2 points from the AI grader.' },
  none: { label: 'Off the mark', color: GW.rose, detail: 'Your total differed from the AI grader by 3+ points.' },
};

function Header({ onBack }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 10,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px', background: `${GW.parchment}E8`, backdropFilter: 'blur(6px)',
      borderBottom: `1px solid ${GW.amber}30`,
    }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: GW.ink, fontSize: 13, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
        opacity: 0.7, padding: '6px 10px',
      }}>← Back</button>
      <div style={{
        fontFamily: 'Cinzel, serif', fontWeight: 800, letterSpacing: '0.18em',
        fontSize: 13, color: GW.amber, textTransform: 'uppercase',
      }}>Blind Peer Grade</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function LoadingPhase() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20vh 20px', textAlign: 'center', color: GW.inkSoft, fontFamily: 'Nunito, sans-serif' }}>
      Finding an essay to grade…
    </div>
  );
}

function NoneAvailablePhase({ onBack }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '14vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>👁️</div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(22px, 5vw, 30px)', color: GW.ink, margin: '0 0 12px', fontWeight: 800 }}>
        Nothing to grade right now
      </h1>
      <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14.5, lineHeight: 1.6, margin: '0 auto 28px' }}>
        There's no graded classmate essay available for you to review yet. Check back after more essays have been submitted.
      </p>
      <GwButton onClick={onBack}>Back</GwButton>
    </div>
  );
}

function GradingPhase({ submission, scores, onToggle, onNote, onSubmit, submitting, error }) {
  const criteria = Object.entries(submission.criteria || {});
  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '6vh 20px 120px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
          {submission.essayType} · {submission.assignmentTitle}
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 13.5, lineHeight: 1.5 }}>
          {submission.prompt}
        </div>
      </div>

      <div style={{
        background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 14,
        padding: '20px 18px', fontSize: 15, color: GW.ink, lineHeight: 1.7, whiteSpace: 'pre-wrap',
        fontFamily: 'Georgia, serif', maxHeight: 420, overflowY: 'auto',
      }}>
        {submission.essayText}
      </div>

      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 12, color: GW.amber, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
        Score it like the rubric
      </div>

      {criteria.map(([key, def]) => {
        const entry = scores[key] || { granted: false, note: '' };
        return (
          <div key={key} style={{
            background: '#fff', border: `1.5px solid ${entry.granted ? GW.sage : GW.ink + '20'}`,
            borderRadius: 12, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800, color: GW.ink, fontSize: 14.5 }}>
                {def.label} <span style={{ color: GW.inkSoft, fontWeight: 600 }}>({def.points} pt{def.points > 1 ? 's' : ''})</span>
              </div>
              <button
                onClick={() => onToggle(key)}
                style={{
                  border: 'none', borderRadius: 20, padding: '7px 16px', cursor: 'pointer',
                  fontWeight: 800, fontSize: 12.5, letterSpacing: '0.03em',
                  background: entry.granted ? GW.sage : `${GW.ink}10`,
                  color: entry.granted ? '#fff' : GW.inkSoft,
                }}
              >
                {entry.granted ? '✓ Granted' : 'Not granted'}
              </button>
            </div>
            <input
              type="text"
              placeholder="One-sentence justification…"
              value={entry.note}
              onChange={(e) => onNote(key, e.target.value)}
              style={{
                border: `1px solid ${GW.ink}20`, borderRadius: 8, padding: '8px 10px',
                fontSize: 13, fontFamily: 'Nunito, sans-serif', color: GW.ink, background: GW.parchment,
              }}
            />
          </div>
        );
      })}

      {error && <div style={{ color: GW.rose, fontWeight: 700, fontSize: 13.5, textAlign: 'center' }}>{error}</div>}

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <GwButton onClick={onSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Peer Grade'}</GwButton>
      </div>
    </div>
  );
}

function ResultsPhase({ result, onGradeAnother, onBack }) {
  if (!result) return null;
  const { peerTotal, aiTotal, accuracy, xpGain, award, aiBreakdown, maxScore } = result;
  const copy = ACCURACY_COPY[accuracy] || ACCURACY_COPY.none;

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: copy.color, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          {copy.label}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, margin: '14px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 30, color: GW.ink }}>{peerTotal}</div>
            <div style={{ fontSize: 11.5, color: GW.inkSoft, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Your score</div>
          </div>
          <div style={{ fontSize: 24, color: GW.inkSoft, alignSelf: 'center' }}>vs</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 30, color: GW.amber }}>{aiTotal}</div>
            <div style={{ fontSize: 11.5, color: GW.inkSoft, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>AI score</div>
          </div>
        </div>
        <div style={{ fontSize: 13.5, color: GW.inkSoft, fontWeight: 600 }}>{copy.detail} (out of {maxScore})</div>
        {xpGain > 0 && (
          <div style={{ fontSize: 14, fontWeight: 800, color: GW.amber, marginTop: 8 }}>+{xpGain} XP</div>
        )}
        {award?.newBadges?.length > 0 && (
          <div style={{ fontSize: 13, fontWeight: 800, color: GW.sage, marginTop: 4 }}>🏅 New badge: Rubric Eye</div>
        )}
      </div>

      {aiBreakdown && (
        <div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 12, color: GW.amber, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
            The AI's actual breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(aiBreakdown).map(([key, b]) => (
              <div key={key} style={{
                background: b.earned ? GW.sageSoft : GW.roseSoft,
                border: `1px solid ${(b.earned ? GW.sage : GW.rose)}40`, borderRadius: 10, padding: '10px 14px',
                fontSize: 13, color: GW.ink, lineHeight: 1.5,
              }}>
                <div style={{ fontWeight: 800, marginBottom: 3 }}>
                  {b.earned ? '✓' : '✗'} {key.replace(/_/g, ' ')} — {b.points}/{b.maxPoints}
                </div>
                <div style={{ color: GW.inkSoft }}>{b.feedback}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 8 }}>
        <GwButton onClick={onGradeAnother}>Grade Another</GwButton>
        <GwButton variant="secondary" onClick={onBack}>Back</GwButton>
      </div>
    </div>
  );
}

export default function PeerGrade() {
  const { navigate } = useApp();
  const [phase, setPhase] = useState('loading'); // loading | none_available | grading | submitted
  const [submission, setSubmission] = useState(null);
  const [scores, setScores] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onBack = () => navigate('write_home');

  const fetchNext = useCallback(async () => {
    setPhase('loading');
    setError(null);
    setResult(null);
    try {
      const res = await api.post('/api/write/games/peer-grade/start', {});
      if (!res.submission) {
        setPhase('none_available');
        return;
      }
      setSubmission(res.submission);
      const initial = {};
      for (const key of Object.keys(res.submission.criteria || {})) {
        initial[key] = { granted: false, note: '' };
      }
      setScores(initial);
      setPhase('grading');
    } catch (e) {
      setError(e.message);
      setPhase('none_available');
    }
  }, []);

  useEffect(() => { fetchNext(); }, [fetchNext]);

  const onToggle = useCallback((key) => {
    setScores((prev) => ({ ...prev, [key]: { ...prev[key], granted: !prev[key]?.granted } }));
  }, []);

  const onNote = useCallback((key, note) => {
    setScores((prev) => ({ ...prev, [key]: { ...prev[key], note } }));
  }, []);

  const onSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/api/write/games/peer-grade/${submission.id}/submit`, { scores });
      setResult(res);
      setPhase('submitted');
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  }, [submission, scores]);

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <Header onBack={onBack} />
      <AnimatePresence mode="wait">
        <motion.div key={phase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {phase === 'loading' && <LoadingPhase />}
          {phase === 'none_available' && <NoneAvailablePhase onBack={onBack} />}
          {phase === 'grading' && submission && (
            <GradingPhase
              submission={submission}
              scores={scores}
              onToggle={onToggle}
              onNote={onNote}
              onSubmit={onSubmit}
              submitting={submitting}
              error={error}
            />
          )}
          {phase === 'submitted' && <ResultsPhase result={result} onGradeAnother={fetchNext} onBack={onBack} />}
        </motion.div>
      </AnimatePresence>
      <Clio
        text={
          phase === 'grading' ? "Read closely — would you grant this point if you were the AP reader?" :
          phase === 'submitted' ? (result?.accuracy === 'full' ? "Your eye for the rubric is sharp." : "Compare your calls to the AI's reasoning below.") :
          ''
        }
        state={phase === 'submitted' && result?.accuracy === 'full' ? 'celebrating' : 'idle'}
      />
    </div>
  );
}
