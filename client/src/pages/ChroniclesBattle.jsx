'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Icon from '../components/ui/Icon.jsx';

// ── Chronicles of the Keep — Battle Screen ────────────────────────────────────

// Phase state machine
const PHASES = {
  LOADING: 'loading',
  INTRO: 'intro',           // opening_narrative (typewriter)
  TEACHING: 'teaching',     // teaching_lore + examples
  PRE_NARRATIVE: 'pre',     // encounter pre_narrative
  QUESTION: 'question',     // question + 4 options
  RESULT: 'result',         // success/failure narrative + explanation
  CHAPTER_DONE: 'chap_done',
  DISTRICT_DONE: 'dist_done',
  GAME_DONE: 'game_done',
  SUMMARY: 'summary',       // incomplete chapter recap
};

// Difficulty colors
const DIFF_COLOR = { 1: '#52B788', 2: '#F5A623', 3: '#C0392B' };
const DIFF_LABEL = { 1: 'Guided', 2: 'Standard', 3: 'Mastery' };

// ── Typewriter component ──────────────────────────────────────────────────────
function Typewriter({ text, speed = 28, onDone, className, style }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idxRef = useRef(0);
  const doneRef = useRef(false);

  useEffect(() => {
    idxRef.current = 0;
    doneRef.current = false;
    setDisplayed('');
    setDone(false);
    const tick = () => {
      if (doneRef.current) return;
      if (idxRef.current >= text.length) {
        setDone(true);
        onDone?.();
        return;
      }
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      setTimeout(tick, speed);
    };
    const t = setTimeout(tick, speed);
    return () => { doneRef.current = true; clearTimeout(t); };
  }, [text]);

  const skipAll = () => {
    if (done) return;
    doneRef.current = true;
    setDisplayed(text);
    setDone(true);
    onDone?.();
  };

  return (
    <div onClick={skipAll} style={{ cursor: done ? 'default' : 'pointer', ...style }} className={className}>
      {displayed}
      {!done && <span style={{ opacity: Math.random() > 0.5 ? 1 : 0, transition: 'opacity 0.1s' }}>▋</span>}
    </div>
  );
}

// ── XP Float animation ────────────────────────────────────────────────────────
function XPFloat({ xp, runes }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: [0, 1, 1, 0], y: -60 }}
      transition={{ duration: 1.8 }}
      style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none', zIndex: 50,
        textAlign: 'center',
      }}
    >
      {xp > 0 && (
        <div style={{ fontSize: '18px', fontWeight: 800, color: '#F5A623', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          +{xp} XP
        </div>
      )}
      {runes > 0 && (
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#A78BFA', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          +{runes} runes
        </div>
      )}
    </motion.div>
  );
}

// ── Answer option button ──────────────────────────────────────────────────────
function OptionButton({ letter, text, state, onSelect, disabled }) {
  const colors = {
    default: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)', text: 'rgba(255,255,255,0.85)' },
    selected: { bg: 'rgba(200,169,110,0.15)', border: 'rgba(200,169,110,0.6)', text: '#C8A96E' },
    correct: { bg: 'rgba(82,183,136,0.2)', border: '#52B788', text: '#52B788' },
    wrong: { bg: 'rgba(192,57,43,0.2)', border: '#C0392B', text: '#C0392B' },
    dim: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.3)' },
  };
  const c = colors[state] || colors.default;

  return (
    <motion.button
      whileHover={disabled ? {} : { x: 4, background: 'rgba(200,169,110,0.1)' }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={() => !disabled && onSelect(letter)}
      style={{
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: '10px', padding: '12px 16px',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'flex-start', gap: '12px',
        textAlign: 'left', width: '100%',
        transition: 'all 0.2s',
      }}
    >
      <span style={{
        fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: '14px',
        color: c.border, flexShrink: 0, width: '20px', paddingTop: '1px',
      }}>
        {letter}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 600, color: c.text, lineHeight: '1.5' }}>
        {text}
      </span>
      {state === 'correct' && <Icon name="checkCircle" size={18} color="#52B788" style={{ marginLeft: 'auto', flexShrink: 0, marginTop: '1px' }} />}
      {state === 'wrong' && <Icon name="xCircle" size={18} color="#C0392B" style={{ marginLeft: 'auto', flexShrink: 0, marginTop: '1px' }} />}
    </motion.button>
  );
}

// ── Progress bar (chapter encounters) ────────────────────────────────────────
function ChapterProgress({ done, total, color = '#C8A96E' }) {
  const pct = total ? (done / total) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: '3px' }}
        />
      </div>
      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, flexShrink: 0 }}>
        {done}/{total}
      </span>
    </div>
  );
}

// ── Main Battle Screen ────────────────────────────────────────────────────────
export default function ChroniclesBattle() {
  const { navigate, screenParams, setWallet } = useApp();
  const { chapterId, gameId } = screenParams;

  const [phase, setPhase] = useState(PHASES.LOADING);
  const [chapter, setChapter] = useState(null);
  const [encounters, setEncounters] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedIds, setCompletedIds] = useState(new Set());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showXPFloat, setShowXPFloat] = useState(false);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [totalRunesEarned, setTotalRunesEarned] = useState(0);
  const [completionData, setCompletionData] = useState(null);
  const [introDone, setIntroDone] = useState(false);
  const [teachingDone, setTeachingDone] = useState(false);
  const [showPassage, setShowPassage] = useState(false);

  // Load chapter
  useEffect(() => {
    if (!chapterId) { navigate('summit_home'); return; }
    api.get(`/api/edumissions/chapters/${chapterId}`)
      .then((data) => {
        setChapter(data.chapter);
        setEncounters(data.encounters || []);
        const ids = new Set(
          (data.encounters || []).filter((e) => e.completed).map((e) => e.id)
        );
        setCompletedIds(ids);

        if (data.chapter_complete) {
          setPhase(PHASES.CHAPTER_DONE);
        } else {
          const startIdx = data.next_encounter_index || 0;
          setCurrentIdx(startIdx);
          // Show intro only if just starting (first encounter incomplete)
          if (startIdx === 0 && data.chapter?.opening_narrative) {
            setPhase(PHASES.INTRO);
          } else if (data.chapter?.teaching_lore && startIdx === 0) {
            setPhase(PHASES.TEACHING);
          } else {
            setPhase(PHASES.PRE_NARRATIVE);
          }
        }
      })
      .catch((e) => {
        if (e.status === 403) {
          // Paywall — navigate back to map
          navigate('chronicles_map', { gameId });
        } else {
          console.error(e);
          navigate('chronicles_map', { gameId });
        }
      });
  }, [chapterId]);

  const currentEncounter = encounters[currentIdx];

  // Advance to next encounter or finish
  const advanceAfterResult = useCallback(() => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= encounters.length) {
      // All encounters shown — check if chapter is done
      const allDone = encounters.every((e) => completedIds.has(e.id));
      if (allDone || completionData?.chapter_complete) {
        if (completionData?.game_complete) setPhase(PHASES.GAME_DONE);
        else if (completionData?.district_complete) setPhase(PHASES.DISTRICT_DONE);
        else setPhase(PHASES.CHAPTER_DONE);
      } else {
        setPhase(PHASES.SUMMARY);
      }
    } else {
      setCurrentIdx(nextIdx);
      setSelectedAnswer(null);
      setLastResult(null);
      setPhase(PHASES.PRE_NARRATIVE);
    }
  }, [currentIdx, encounters, completedIds, completionData]);

  async function submitAnswer(answer) {
    if (submitting || !currentEncounter) return;
    setSubmitting(true);
    setSelectedAnswer(answer);
    try {
      const result = await api.post(
        `/api/edumissions/encounters/${currentEncounter.id}/attempt`,
        { selected_answer: answer }
      );
      setLastResult(result);
      if (result.correct && !result.already_completed) {
        const newIds = new Set([...completedIds, currentEncounter.id]);
        setCompletedIds(newIds);
        setTotalXPEarned((x) => x + (result.xp_earned || 0));
        setTotalRunesEarned((r) => r + (result.runes_earned || 0));
        setShowXPFloat(true);
        setTimeout(() => setShowXPFloat(false), 2000);
        if (result.wallet) setWallet({ coins: result.wallet.coins, gems: result.wallet.gems });
      }
      if (result.chapter_complete || result.district_complete || result.game_complete) {
        setCompletionData(result);
      }
      setPhase(PHASES.RESULT);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  function renderPhase() {
    switch (phase) {
      case PHASES.LOADING:
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ color: '#C8A96E', fontFamily: 'Cinzel, serif', fontSize: '16px' }}>
              Entering the Keep…
            </div>
          </div>
        );

      case PHASES.INTRO:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '36px', marginBottom: '24px' }}>📜</div>
            <div style={{
              maxWidth: '600px',
              fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.8',
              color: 'rgba(255,255,255,0.8)',
              fontStyle: 'italic',
            }}>
              <Typewriter
                text={chapter?.opening_narrative || ''}
                speed={22}
                onDone={() => setIntroDone(true)}
              />
            </div>
            {introDone && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  if (chapter?.teaching_lore) setPhase(PHASES.TEACHING);
                  else setPhase(PHASES.PRE_NARRATIVE);
                }}
                style={{
                  marginTop: '32px',
                  background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                  border: 'none', color: '#1a1208',
                  borderRadius: '12px', padding: '12px 28px',
                  fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                  fontFamily: 'Cinzel, serif', letterSpacing: '0.04em',
                }}
              >
                Enter the Keep →
              </motion.button>
            )}
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
              {!introDone && 'Tap to skip'}
            </div>
          </motion.div>
        );

      case PHASES.TEACHING:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ flex: 1, padding: '20px', maxWidth: '640px', width: '100%', margin: '0 auto' }}
          >
            <div style={{
              background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.04))',
              border: '1px solid rgba(200,169,110,0.3)',
              borderRadius: '14px', padding: '24px',
              marginBottom: '20px',
            }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: '#C8A96E', fontWeight: 700, marginBottom: '12px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                📖 The Keeper's Teaching
              </div>
              <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {chapter?.teaching_lore}
              </p>
              {chapter?.example_correct && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#52B788', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
                    ✓ Correct Form
                  </div>
                  <div style={{
                    background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.3)',
                    borderRadius: '8px', padding: '10px 14px',
                    fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic',
                  }}>
                    {chapter.example_correct}
                  </div>
                </div>
              )}
              {chapter?.example_wrong && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#C0392B', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
                    ✗ Common Error
                  </div>
                  <div style={{
                    background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
                    borderRadius: '8px', padding: '10px 14px',
                    fontSize: '14px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic',
                    textDecoration: 'line-through', textDecorationColor: 'rgba(192,57,43,0.5)',
                  }}>
                    {chapter.example_wrong}
                  </div>
                </div>
              )}
              {chapter?.example_explanation && (
                <div style={{ marginTop: '12px', fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
                  {chapter.example_explanation}
                </div>
              )}
            </div>

            <button
              onClick={() => setPhase(PHASES.PRE_NARRATIVE)}
              style={{
                width: '100%', background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                border: 'none', color: '#1a1208', borderRadius: '12px', padding: '14px',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                fontFamily: 'Cinzel, serif', letterSpacing: '0.04em',
              }}
            >
              I'm Ready — Begin Battle →
            </button>
          </motion.div>
        );

      case PHASES.PRE_NARRATIVE: {
        if (!currentEncounter) {
          advanceAfterResult();
          return null;
        }
        return (
          <motion.div
            key={`pre-${currentEncounter.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              style={{ fontSize: '40px', marginBottom: '20px' }}
            >
              {currentEncounter.enemy_type === 'warden' ? '💀' :
               currentEncounter.enemy_type === 'elite' ? '⚔️' : '👺'}
            </motion.div>
            <div style={{
              fontFamily: 'Cinzel, serif', fontSize: '17px', fontWeight: 700,
              color: '#C0392B', marginBottom: '12px',
            }}>
              {currentEncounter.enemy_name}
            </div>
            <div style={{
              maxWidth: '520px', fontFamily: 'Georgia, serif',
              fontSize: '15px', lineHeight: '1.8', color: 'rgba(255,255,255,0.75)',
              fontStyle: 'italic',
            }}>
              {currentEncounter.pre_narrative}
            </div>
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setPhase(PHASES.QUESTION)}
              style={{
                marginTop: '28px',
                background: 'rgba(192,57,43,0.2)', border: '1px solid rgba(192,57,43,0.5)',
                color: '#C0392B', borderRadius: '12px', padding: '12px 28px',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                fontFamily: 'Cinzel, serif',
              }}
            >
              Face the Challenge ⚔️
            </motion.button>
          </motion.div>
        );
      }

      case PHASES.QUESTION: {
        if (!currentEncounter) { advanceAfterResult(); return null; }
        const alreadyDone = completedIds.has(currentEncounter.id);
        return (
          <motion.div
            key={`q-${currentEncounter.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ flex: 1, padding: '16px', maxWidth: '640px', width: '100%', margin: '0 auto' }}
          >
            {/* Already completed badge */}
            {alreadyDone && (
              <div style={{
                background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.3)',
                borderRadius: '8px', padding: '6px 14px', marginBottom: '12px',
                fontSize: '12px', color: '#52B788', fontWeight: 700, textAlign: 'center',
              }}>
                ✓ Already completed — practicing for mastery
              </div>
            )}

            {/* Difficulty + skill tag */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{
                background: `${DIFF_COLOR[currentEncounter.difficulty] || '#C8A96E'}22`,
                border: `1px solid ${DIFF_COLOR[currentEncounter.difficulty] || '#C8A96E'}55`,
                color: DIFF_COLOR[currentEncounter.difficulty] || '#C8A96E',
                borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700,
              }}>
                {DIFF_LABEL[currentEncounter.difficulty] || 'Standard'}
              </span>
              {currentEncounter.concept_tag && (
                <span style={{
                  background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.25)',
                  color: 'rgba(200,169,110,0.8)',
                  borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700,
                }}>
                  {currentEncounter.concept_tag}
                </span>
              )}
            </div>

            {/* Passage (if any) */}
            {currentEncounter.passage && (
              <div style={{
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '10px', padding: '14px 16px', marginBottom: '14px',
              }}>
                <button
                  onClick={() => setShowPassage((s) => !s)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(200,169,110,0.8)', fontSize: '12px', fontWeight: 700,
                    padding: 0, marginBottom: showPassage ? '8px' : 0,
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}
                >
                  <Icon name="doc" size={13} /> {showPassage ? 'Hide' : 'Show'} passage
                </button>
                {showPassage && (
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.65', fontStyle: 'italic' }}>
                    {currentEncounter.passage}
                  </div>
                )}
              </div>
            )}

            {/* Question */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(200,169,110,0.08), rgba(200,169,110,0.04))',
              border: '1px solid rgba(200,169,110,0.25)',
              borderRadius: '12px', padding: '18px 20px', marginBottom: '16px',
            }}>
              <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'rgba(255,255,255,0.92)', lineHeight: '1.6' }}>
                {currentEncounter.question_stem}
              </p>
            </div>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['A', 'B', 'C', 'D'].map((letter) => {
                const text = currentEncounter[`option_${letter.toLowerCase()}`];
                const state = submitting && selectedAnswer === letter ? 'selected' : 'default';
                return (
                  <OptionButton
                    key={letter}
                    letter={letter}
                    text={text}
                    state={state}
                    onSelect={submitAnswer}
                    disabled={submitting}
                  />
                );
              })}
            </div>

            {submitting && (
              <div style={{ textAlign: 'center', marginTop: '16px', color: 'rgba(200,169,110,0.6)', fontSize: '13px' }}>
                The Keep judges your answer…
              </div>
            )}
          </motion.div>
        );
      }

      case PHASES.RESULT: {
        if (!currentEncounter || !lastResult) return null;
        const correct = lastResult.correct;
        const accentColor = correct ? '#52B788' : '#C0392B';
        return (
          <motion.div
            key={`result-${currentEncounter.id}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, padding: '16px', maxWidth: '640px', width: '100%', margin: '0 auto', position: 'relative' }}
          >
            {/* XP Float */}
            {showXPFloat && (
              <XPFloat xp={lastResult.xp_earned} runes={lastResult.runes_earned} />
            )}

            {/* Result header */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                textAlign: 'center', marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>
                {correct ? '✨' : '💢'}
              </div>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, color: accentColor,
              }}>
                {correct ? 'Spell Broken!' : 'The Error Resists!'}
              </div>
              {correct && !lastResult.already_completed && (
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '6px' }}>
                  +{lastResult.xp_earned} XP {lastResult.runes_earned > 0 ? `· +${lastResult.runes_earned} runes` : ''}
                </div>
              )}
            </motion.div>

            {/* Narrative */}
            <div style={{
              background: `${accentColor}12`, border: `1px solid ${accentColor}30`,
              borderRadius: '12px', padding: '18px 20px', marginBottom: '14px',
              fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.75',
              color: 'rgba(255,255,255,0.8)', fontStyle: 'italic',
            }}>
              {lastResult.narrative}
            </div>

            {/* Answer reveal */}
            <div style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', padding: '14px 16px', marginBottom: '14px',
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const isCorrect = letter === currentEncounter.correct_answer;
                  const isSelected = letter === lastResult.selected_answer;
                  let state = 'dim';
                  if (isCorrect) state = 'correct';
                  else if (isSelected && !isCorrect) state = 'wrong';
                  return (
                    <div key={letter} style={{
                      width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                      background: isCorrect ? 'rgba(82,183,136,0.25)' : isSelected ? 'rgba(192,57,43,0.25)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isCorrect ? '#52B788' : isSelected ? '#C0392B' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 800,
                      color: isCorrect ? '#52B788' : isSelected ? '#C0392B' : 'rgba(255,255,255,0.3)',
                    }}>
                      {letter}
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                <span style={{ color: '#52B788', fontWeight: 700 }}>Correct: </span>
                {currentEncounter[`option_${currentEncounter.correct_answer.toLowerCase()}`]}
              </div>
            </div>

            {/* Explanation */}
            <div style={{
              background: 'rgba(200,169,110,0.07)', border: '1px solid rgba(200,169,110,0.2)',
              borderRadius: '10px', padding: '14px 16px', marginBottom: '20px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#C8A96E', letterSpacing: '0.08em', marginBottom: '6px', textTransform: 'uppercase' }}>
                📖 The Rule
              </div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.65' }}>
                {lastResult.explanation}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {!correct && (
                <button
                  onClick={() => { setSelectedAnswer(null); setLastResult(null); setPhase(PHASES.QUESTION); }}
                  style={{
                    flex: 1, background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.4)',
                    color: '#C0392B', borderRadius: '10px', padding: '13px',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
                  }}
                >
                  Try Again
                </button>
              )}
              <button
                onClick={advanceAfterResult}
                style={{
                  flex: 2, background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                  border: 'none', color: '#1a1208', borderRadius: '10px', padding: '13px',
                  fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
                }}
              >
                {currentIdx >= encounters.length - 1 ? 'Complete Chapter →' : 'Next Encounter →'}
              </button>
            </div>
          </motion.div>
        );
      }

      case PHASES.CHAPTER_DONE: {
        const narrative = completionData?.completion_narrative || chapter?.closing_narrative;
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              style={{ fontSize: '56px', marginBottom: '16px' }}
            >
              {chapter?.is_boss_chapter ? '🏆' : '⭐'}
            </motion.div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: '#C8A96E', marginBottom: '12px' }}>
              {chapter?.is_boss_chapter ? 'Warden Defeated!' : 'Chapter Complete!'}
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: 'rgba(200,169,110,0.7)', marginBottom: '20px' }}>
              {chapter?.title}
            </div>
            {narrative && (
              <div style={{
                maxWidth: '540px', fontFamily: 'Georgia, serif', fontSize: '15px',
                lineHeight: '1.8', color: 'rgba(255,255,255,0.75)', fontStyle: 'italic',
                marginBottom: '28px',
              }}>
                {narrative}
              </div>
            )}
            {(totalXPEarned > 0 || totalRunesEarned > 0) && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'flex', gap: '16px', marginBottom: '28px',
                  background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)',
                  borderRadius: '12px', padding: '14px 24px',
                }}
              >
                {totalXPEarned > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#F5A623', fontWeight: 700 }}>
                      +{totalXPEarned}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>XP</div>
                  </div>
                )}
                {totalRunesEarned > 0 && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', color: '#A78BFA', fontWeight: 700 }}>
                      +{totalRunesEarned}
                    </div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Runes</div>
                  </div>
                )}
              </motion.div>
            )}
            <button
              onClick={() => navigate('chronicles_map', { gameId })}
              style={{
                background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                border: 'none', color: '#1a1208', borderRadius: '12px', padding: '14px 32px',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
              }}
            >
              Return to Map →
            </button>
          </motion.div>
        );
      }

      case PHASES.DISTRICT_DONE:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150, delay: 0.3 }}
              style={{ fontSize: '64px', marginBottom: '16px' }}
            >
              🔰
            </motion.div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', fontWeight: 700, color: '#C8A96E', marginBottom: '8px' }}>
              Warden Seal Earned!
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px', lineHeight: '1.6' }}>
              You have purified this district of the Keep.<br />
              The Warden's seal is yours.
            </div>
            <button
              onClick={() => navigate('chronicles_map', { gameId })}
              style={{
                background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                border: 'none', color: '#1a1208', borderRadius: '12px', padding: '14px 32px',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
              }}
            >
              Return to Map →
            </button>
          </motion.div>
        );

      case PHASES.GAME_DONE:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0], scale: [1, 1.1, 1.1, 1.1, 1] }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{ fontSize: '72px', marginBottom: '16px' }}
            >
              👑
            </motion.div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', fontWeight: 700, color: '#C8A96E', marginBottom: '8px' }}>
              The Keep is Restored!
            </div>
            <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', maxWidth: '500px', marginBottom: '16px' }}>
              You have defeated all five Wardens and purified every district.
              The Chronicles of the Keep are complete.
            </div>
            <div style={{
              background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.3)',
              borderRadius: '12px', padding: '12px 24px', marginBottom: '28px',
              fontSize: '14px', color: '#C8A96E', fontWeight: 700,
            }}>
              +25 💎 Gems awarded!
            </div>
            <button
              onClick={() => navigate('chronicles_map', { gameId })}
              style={{
                background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                border: 'none', color: '#1a1208', borderRadius: '12px', padding: '14px 32px',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
              }}
            >
              View the Chronicles →
            </button>
          </motion.div>
        );

      case PHASES.SUMMARY:
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>⚔️</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#C8A96E', marginBottom: '8px' }}>
              Chapter In Progress
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '24px' }}>
              Complete the remaining encounters to<br />earn the full chapter reward.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => navigate('chronicles_map', { gameId })}
                style={{
                  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '12px 20px',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                Back to Map
              </button>
              <button
                onClick={() => { setCurrentIdx(0); setPhase(PHASES.PRE_NARRATIVE); }}
                style={{
                  background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
                  border: 'none', color: '#1a1208', borderRadius: '10px', padding: '12px 20px',
                  fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                }}
              >
                Try Again
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  }

  const doneCount = completedIds.size;
  const totalEnc = encounters.length;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #0d0a06 0%, #121212 100%)',
      fontFamily: 'Nunito, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px',
        background: 'rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(200,169,110,0.15)',
        display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
      }}>
        <button
          onClick={() => navigate('chronicles_map', { gameId })}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(200,169,110,0.6)', fontSize: '12px', fontWeight: 700,
            padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '5px',
          }}
        >
          ← Map
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {chapter && (
            <>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 700,
                color: '#C8A96E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                Ch.{chapter.chapter_number} · {chapter.title}
              </div>
              <div style={{ marginTop: '4px' }}>
                <ChapterProgress done={doneCount} total={totalEnc} />
              </div>
            </>
          )}
        </div>
        {chapter && (
          <div style={{
            background: 'rgba(200,169,110,0.1)', border: '1px solid rgba(200,169,110,0.25)',
            borderRadius: '8px', padding: '4px 10px', flexShrink: 0,
            fontSize: '12px', color: '#C8A96E', fontWeight: 700,
          }}>
            {chapter.concept}
          </div>
        )}
      </div>

      {/* Phase content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={phase + currentIdx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
        >
          {renderPhase()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
