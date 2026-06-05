import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Icon from '../components/ui/Icon.jsx';

// ── Chronicles of the Keep — Battle Screen ────────────────────────────────────

const PHASES = {
  LOADING: 'loading',
  INTRO: 'intro',
  TEACHING: 'teaching',
  PRE_NARRATIVE: 'pre',
  QUESTION: 'question',
  RESULT: 'result',
  CHAPTER_DONE: 'chap_done',
  DISTRICT_DONE: 'dist_done',
  GAME_DONE: 'game_done',
  SUMMARY: 'summary',
};

const DIFF_COLOR = { 1: '#52B788', 2: '#F5A623', 3: '#C0392B' };
const DIFF_LABEL = { 1: 'Guided', 2: 'Standard', 3: 'Mastery' };

// ── Typewriter ────────────────────────────────────────────────────────────────
function Typewriter({ text, speed = 22, onDone, style }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const activeRef = useRef(true);
  const idxRef = useRef(0);

  useEffect(() => {
    activeRef.current = true;
    idxRef.current = 0;
    setDisplayed('');
    setDone(false);
    function tick() {
      if (!activeRef.current) return;
      if (idxRef.current >= text.length) { setDone(true); onDone?.(); return; }
      idxRef.current++;
      setDisplayed(text.slice(0, idxRef.current));
      setTimeout(tick, speed);
    }
    const t = setTimeout(tick, speed);
    return () => { activeRef.current = false; clearTimeout(t); };
  }, [text]);

  const skipAll = () => {
    if (done) return;
    activeRef.current = false;
    setDisplayed(text);
    setDone(true);
    onDone?.();
  };

  return (
    <div onClick={skipAll} style={{ cursor: done ? 'default' : 'pointer', ...style }}>
      {displayed}
      {!done && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ color: '#C8A96E' }}>▋</motion.span>
      )}
    </div>
  );
}

// ── XP Float ─────────────────────────────────────────────────────────────────
function XPFloat({ xp, runes, color = '#F5A623' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.8 }}
      animate={{ opacity: [0, 1, 1, 0], y: -80, scale: [0.8, 1.1, 1, 0.9] }}
      transition={{ duration: 2.2 }}
      style={{
        position: 'absolute', top: '30%', left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none', zIndex: 50, textAlign: 'center',
      }}
    >
      {xp > 0 && (
        <div style={{
          fontSize: '24px', fontWeight: 900,
          color,
          textShadow: `0 0 20px ${color}80, 0 2px 8px rgba(0,0,0,0.9)`,
          fontFamily: 'Cinzel, serif',
        }}>
          +{xp} XP
        </div>
      )}
      {runes > 0 && (
        <div style={{ fontSize: '15px', fontWeight: 700, color: '#A78BFA', textShadow: '0 2px 8px rgba(0,0,0,0.8)', marginTop: '4px' }}>
          +{runes} runes
        </div>
      )}
    </motion.div>
  );
}

// ── Answer Option ─────────────────────────────────────────────────────────────
function OptionButton({ letter, text, state, onSelect, disabled }) {
  const styles = {
    default: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.14)', text: 'rgba(255,255,255,0.85)', letterBg: 'rgba(255,255,255,0.08)' },
    selected: { bg: 'rgba(200,169,110,0.12)', border: 'rgba(200,169,110,0.55)', text: '#C8A96E', letterBg: 'rgba(200,169,110,0.2)' },
    correct: { bg: 'rgba(82,183,136,0.18)', border: '#52B788', text: '#52B788', letterBg: 'rgba(82,183,136,0.25)' },
    wrong: { bg: 'rgba(192,57,43,0.18)', border: '#C0392B', text: '#e07070', letterBg: 'rgba(192,57,43,0.25)' },
    dim: { bg: 'rgba(255,255,255,0.02)', border: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.28)', letterBg: 'rgba(255,255,255,0.04)' },
  };
  const s = styles[state] || styles.default;

  return (
    <motion.button
      whileHover={disabled ? {} : { x: 5 }}
      whileTap={disabled ? {} : { scale: 0.985 }}
      onClick={() => !disabled && onSelect(letter)}
      style={{
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: '12px', padding: '13px 16px',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex', alignItems: 'flex-start', gap: '14px',
        textAlign: 'left', width: '100%',
        transition: 'background 0.18s, border-color 0.18s',
      }}
    >
      <div style={{
        width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
        background: s.letterBg, border: `1px solid ${s.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: '13px', color: s.border,
      }}>
        {letter}
      </div>
      <span style={{ fontSize: '14px', fontWeight: 600, color: s.text, lineHeight: '1.55', paddingTop: '4px', flex: 1 }}>
        {text}
      </span>
      {state === 'correct' && <Icon name="checkCircle" size={18} color="#52B788" style={{ marginLeft: 'auto', flexShrink: 0, marginTop: '5px' }} />}
      {state === 'wrong' && <Icon name="xCircle" size={18} color="#C0392B" style={{ marginLeft: 'auto', flexShrink: 0, marginTop: '5px' }} />}
    </motion.button>
  );
}

// ── Enemy HP Bar ──────────────────────────────────────────────────────────────
function EnemyHPBar({ done, total, districtSecondary, shake, isBoss }) {
  const pct = total ? (done / total) * 100 : 0;
  const remaining = total - done;
  const hpColor = remaining <= 3 ? '#F5A623' : isBoss ? '#C0392B' : (districtSecondary || '#C8A96E');

  return (
    <motion.div
      animate={shake ? { x: [0, -5, 5, -4, 4, -2, 2, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      style={{ flex: 1 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ⚔ HP
        </span>
        <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>
          {remaining}/{total}
        </span>
      </div>
      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div
          animate={{ width: `${100 - pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${hpColor}60, ${hpColor})`,
            borderRadius: '3px',
            boxShadow: `0 0 8px ${hpColor}60`,
          }}
        />
      </div>
    </motion.div>
  );
}

// ── Epilogue Typewriter sequence ──────────────────────────────────────────────
function EpilogueSequence({ text, districtSecondary, onFinish }) {
  const scenes = useMemo(() => text.split('\n\n').filter(Boolean), [text]);
  const [currentScene, setCurrentScene] = useState(0);
  const [showButton, setShowButton] = useState(false);
  const isLast = currentScene === scenes.length - 1;
  const currentText = scenes[currentScene] || '';

  const { displayed, done, skip } = useTypewriterSimple(currentText, 18);

  useEffect(() => {
    if (isLast && done) {
      const t = setTimeout(() => setShowButton(true), 800);
      return () => clearTimeout(t);
    }
  }, [isLast, done]);

  useEffect(() => {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 }, colors: ['#C8A96E', '#FFFFFF', '#F5A623', '#52B788'] });
      setTimeout(() => confetti({ particleCount: 100, angle: 60, spread: 70, origin: { x: 0, y: 0.6 }, colors: ['#C8A96E', '#FFFFFF'] }), 400);
      setTimeout(() => confetti({ particleCount: 100, angle: 120, spread: 70, origin: { x: 1, y: 0.6 }, colors: ['#C8A96E', districtSecondary || '#F5A623'] }), 800);
    }).catch(() => {});
  }, []);

  function handleTap() {
    if (!done) { skip(); return; }
    if (!isLast) setCurrentScene((s) => s + 1);
  }

  return (
    <div
      onClick={handleTap}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at 50% 40%, rgba(60,40,5,0.99) 0%, rgba(6,4,2,1) 70%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', cursor: isLast && showButton ? 'default' : 'pointer',
        userSelect: 'none',
      }}
    >
      <div style={{ maxWidth: '560px', width: '100%', textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScene}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontFamily: 'Georgia, serif', fontSize: '16px', lineHeight: '1.9',
              color: 'rgba(235,225,210,0.88)', whiteSpace: 'pre-wrap',
            }}
          >
            {displayed}
            {!done && <motion.span animate={{ opacity: [1, 0] }} transition={{ duration: 0.6, repeat: Infinity }} style={{ color: '#C8A96E' }}>▋</motion.span>}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showButton && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={(e) => { e.stopPropagation(); onFinish(); }}
              style={{
                marginTop: '40px',
                background: 'linear-gradient(135deg, #6B4F0A, #C8A96E)',
                border: 'none', color: '#1a0f04', borderRadius: '14px',
                padding: '14px 36px', fontSize: '16px', fontWeight: 800,
                cursor: 'pointer', fontFamily: 'Cinzel, serif', letterSpacing: '0.06em',
              }}
            >
              Return to the Keep →
            </motion.button>
          )}
        </AnimatePresence>

        {done && !isLast && (
          <div style={{ marginTop: '24px', fontSize: '12px', color: 'rgba(200,169,110,0.35)', fontFamily: 'Nunito, sans-serif' }}>
            tap to continue
          </div>
        )}
      </div>
    </div>
  );
}

// Simple typewriter hook used by EpilogueSequence
function useTypewriterSimple(text, speed = 18) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const activeRef = useRef(true);
  const idxRef = useRef(0);

  useEffect(() => {
    activeRef.current = true; idxRef.current = 0; setDisplayed(''); setDone(false);
    function tick() {
      if (!activeRef.current) return;
      if (idxRef.current >= text.length) { setDone(true); return; }
      idxRef.current++; setDisplayed(text.slice(0, idxRef.current));
      setTimeout(tick, speed);
    }
    const t = setTimeout(tick, speed);
    return () => { activeRef.current = false; clearTimeout(t); };
  }, [text]);

  const skip = () => { if (done) return; activeRef.current = false; setDisplayed(text); setDone(true); };
  return { displayed, done, skip };
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ChroniclesBattle() {
  const { navigate, screenParams, setWallet } = useApp();
  const {
    chapterId, gameId,
    districtColor = '#2a1208',
    districtSecondary = '#C8A96E',
    districtName = '',
  } = screenParams;

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
  const [showPassage, setShowPassage] = useState(false);
  const [hpShake, setHpShake] = useState(false);
  const [enemyFlash, setEnemyFlash] = useState(null); // 'hit' | 'miss'
  const [showEpilogue, setShowEpilogue] = useState(false);
  const [epilogueText, setEpilogueText] = useState('');

  const ambientBg = `radial-gradient(ellipse at 50% 0%, ${districtColor}50 0%, #060402 55%)`;

  useEffect(() => {
    if (!chapterId) { navigate('student_dashboard'); return; }
    api.get(`/api/edumissions/chapters/${chapterId}`)
      .then((data) => {
        setChapter(data.chapter);
        setEncounters(data.encounters || []);
        const ids = new Set((data.encounters || []).filter((e) => e.completed).map((e) => e.id));
        setCompletedIds(ids);
        if (data.chapter_complete) {
          setPhase(PHASES.CHAPTER_DONE);
        } else {
          const startIdx = data.next_encounter_index || 0;
          setCurrentIdx(startIdx);
          if (startIdx === 0 && data.chapter?.opening_narrative) setPhase(PHASES.INTRO);
          else if (startIdx === 0 && data.chapter?.teaching_lore) setPhase(PHASES.TEACHING);
          else setPhase(PHASES.PRE_NARRATIVE);
        }
      })
      .catch((e) => {
        if (e.status === 403) navigate('chronicles_map', { gameId });
        else { console.error(e); navigate('chronicles_map', { gameId }); }
      });
  }, [chapterId]);

  const currentEncounter = encounters[currentIdx];

  const advanceAfterResult = useCallback(() => {
    const nextIdx = currentIdx + 1;
    if (nextIdx >= encounters.length) {
      const allDone = encounters.every((e) => completedIds.has(e.id));
      if (allDone || completionData?.chapter_complete) {
        if (completionData?.game_complete) {
          // Show epilogue if we have it, otherwise game_done phase
          if (epilogueText) setShowEpilogue(true);
          else setPhase(PHASES.GAME_DONE);
        } else if (completionData?.district_complete) {
          setPhase(PHASES.DISTRICT_DONE);
        } else {
          setPhase(PHASES.CHAPTER_DONE);
        }
      } else {
        setPhase(PHASES.SUMMARY);
      }
    } else {
      setCurrentIdx(nextIdx);
      setSelectedAnswer(null);
      setLastResult(null);
      setPhase(PHASES.PRE_NARRATIVE);
    }
  }, [currentIdx, encounters, completedIds, completionData, epilogueText]);

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
        setEnemyFlash('hit');
        setTimeout(() => { setShowXPFloat(false); setEnemyFlash(null); }, 2200);
        if (result.wallet) setWallet({ coins: result.wallet.coins, gems: result.wallet.gems });
      } else if (!result.correct) {
        setHpShake(true);
        setEnemyFlash('miss');
        setTimeout(() => { setHpShake(false); setEnemyFlash(null); }, 600);
      }
      if (result.chapter_complete || result.district_complete || result.game_complete) {
        setCompletionData(result);
        // If game complete, try to get epilogue
        if (result.game_complete && gameId) {
          api.get(`/api/edumissions/games/${gameId}`)
            .then((d) => { if (d.game?.epilogue) setEpilogueText(d.game.epilogue); })
            .catch(() => {});
        }
      }
      setPhase(PHASES.RESULT);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  function fireBossConfetti() {
    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({ particleCount: 160, spread: 85, origin: { y: 0.6 }, colors: ['#C8A96E', '#FFFFFF', districtSecondary, '#F5A623'] });
      setTimeout(() => confetti({ particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.65 }, colors: ['#C8A96E', '#FFFFFF'] }), 350);
      setTimeout(() => confetti({ particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.65 }, colors: ['#C8A96E', districtSecondary] }), 700);
    }).catch(() => {});
  }

  const doneCount = completedIds.size;
  const totalEnc = encounters.length;
  const isBossChapter = chapter?.is_boss_chapter || false;

  // ── Phase renderers ──────────────────────────────────────────────────────────

  function renderLoading() {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.8, repeat: Infinity }}>
          <span style={{ fontSize: '36px' }}>⚔️</span>
        </motion.div>
        <div style={{ color: '#C8A96E', fontFamily: 'Cinzel, serif', fontSize: '15px', opacity: 0.7 }}>
          Entering the Keep…
        </div>
      </div>
    );
  }

  function renderIntro() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px', textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18 }}
          style={{ fontSize: '44px', marginBottom: '28px' }}
        >
          📜
        </motion.div>
        <div style={{
          maxWidth: '560px', fontFamily: 'Georgia, serif', fontSize: '15px',
          lineHeight: '1.9', color: 'rgba(235,225,210,0.85)', fontStyle: 'italic',
          whiteSpace: 'pre-wrap', textAlign: 'left',
        }}>
          <Typewriter
            text={chapter?.opening_narrative || ''}
            speed={20}
            onDone={() => setIntroDone(true)}
          />
        </div>
        <AnimatePresence>
          {introDone && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (chapter?.teaching_lore) setPhase(PHASES.TEACHING);
                else setPhase(PHASES.PRE_NARRATIVE);
              }}
              style={{
                marginTop: '36px',
                background: `linear-gradient(135deg, ${districtColor}, ${districtSecondary})`,
                border: 'none', color: '#0e0a04', borderRadius: '12px', padding: '13px 30px',
                fontSize: '15px', fontWeight: 800, cursor: 'pointer',
                fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
                boxShadow: `0 6px 24px ${districtColor}80`,
              }}
            >
              Study the Laws →
            </motion.button>
          )}
        </AnimatePresence>
        {!introDone && (
          <div style={{ marginTop: '16px', fontSize: '11px', color: 'rgba(200,169,110,0.3)', fontFamily: 'Nunito, sans-serif' }}>
            tap to skip
          </div>
        )}
      </motion.div>
    );
  }

  function renderTeaching() {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ flex: 1, padding: '16px', maxWidth: '660px', width: '100%', margin: '0 auto', overflowY: 'auto' }}
      >
        <div style={{
          background: `linear-gradient(135deg, ${districtColor}18, ${districtColor}08)`,
          border: `1px solid ${districtSecondary}35`,
          borderRadius: '16px', padding: '24px 22px', marginBottom: '16px',
        }}>
          <div style={{
            fontFamily: 'Cinzel, serif', fontSize: '11px', fontWeight: 800,
            color: districtSecondary, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '14px',
          }}>
            📖 The Keeper's Teaching — {chapter?.concept?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </div>
          <p style={{
            margin: '0 0 14px', fontSize: '14px', color: 'rgba(235,225,210,0.85)',
            lineHeight: '1.75', whiteSpace: 'pre-line', fontFamily: 'Georgia, serif',
          }}>
            {chapter?.teaching_lore}
          </p>
          {chapter?.example_correct && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#52B788', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                ✓ Correct Form
              </div>
              <div style={{
                background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.3)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '14px', color: 'rgba(235,225,210,0.85)', fontStyle: 'italic', fontFamily: 'Georgia, serif',
              }}>
                {chapter.example_correct}
              </div>
            </div>
          )}
          {chapter?.example_wrong && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, color: '#C0392B', letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>
                ✗ Common Error
              </div>
              <div style={{
                background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.3)',
                borderRadius: '8px', padding: '10px 14px',
                fontSize: '14px', color: 'rgba(200,150,150,0.7)', fontStyle: 'italic', fontFamily: 'Georgia, serif',
                textDecoration: 'line-through', textDecorationColor: 'rgba(192,57,43,0.5)',
              }}>
                {chapter.example_wrong}
              </div>
            </div>
          )}
          {chapter?.example_explanation && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', fontFamily: 'Nunito, sans-serif' }}>
              {chapter.example_explanation}
            </div>
          )}
        </div>
        <button
          onClick={() => setPhase(PHASES.PRE_NARRATIVE)}
          style={{
            width: '100%',
            background: `linear-gradient(135deg, ${districtColor}, ${districtSecondary})`,
            border: 'none', color: '#0e0a04', borderRadius: '12px', padding: '15px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
            boxShadow: `0 6px 24px ${districtColor}60`,
          }}
        >
          I'm Ready — Enter the Battle →
        </button>
      </motion.div>
    );
  }

  function renderPreNarrative() {
    if (!currentEncounter) { advanceAfterResult(); return null; }
    const isWarden = currentEncounter.enemy_type === 'warden';
    const isElite = currentEncounter.enemy_type === 'elite';
    const enemyEmoji = isWarden ? '💀' : isElite ? '⚔️' : '👺';
    const roleLabel = isWarden ? 'District Warden' : isElite ? 'Elite Guard' : 'Punctuation Imp';
    const borderColor = isWarden ? '#C0392B' : isElite ? districtSecondary : 'rgba(255,255,255,0.15)';
    const bgColor = isWarden ? 'rgba(192,57,43,0.08)' : isElite ? `${districtColor}20` : 'rgba(255,255,255,0.04)';

    return (
      <motion.div
        key={`pre-${currentEncounter.id}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px', textAlign: 'center' }}
      >
        {/* Enemy card */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 18 }}
          style={{
            background: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '20px', padding: '28px 32px',
            maxWidth: '440px', width: '100%',
            marginBottom: '28px',
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1], filter: ['brightness(1)', 'brightness(1.15)', 'brightness(1)'] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            style={{ fontSize: '52px', marginBottom: '14px', display: 'block' }}
          >
            {enemyEmoji}
          </motion.div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: borderColor, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '6px', opacity: 0.8 }}>
            {roleLabel}
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, color: '#C8A96E', marginBottom: '16px' }}>
            {currentEncounter.enemy_name}
          </div>
          <div style={{ height: '1px', background: `${borderColor}40`, marginBottom: '16px' }} />
          <div style={{
            fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.8',
            color: 'rgba(235,225,210,0.78)', fontStyle: 'italic',
          }}>
            {currentEncounter.pre_narrative}
          </div>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setPhase(PHASES.QUESTION)}
          style={{
            background: `rgba(${isWarden ? '192,57,43' : '200,169,110'},0.15)`,
            border: `1px solid ${isWarden ? 'rgba(192,57,43,0.6)' : `${districtSecondary}80`}`,
            color: isWarden ? '#e07070' : districtSecondary,
            borderRadius: '12px', padding: '13px 32px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            fontFamily: 'Cinzel, serif', letterSpacing: '0.04em',
          }}
        >
          Face the Challenge ⚔️
        </motion.button>
      </motion.div>
    );
  }

  function renderQuestion() {
    if (!currentEncounter) { advanceAfterResult(); return null; }
    const alreadyDone = completedIds.has(currentEncounter.id);

    return (
      <motion.div
        key={`q-${currentEncounter.id}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ flex: 1, padding: '14px', maxWidth: '660px', width: '100%', margin: '0 auto', overflowY: 'auto' }}
      >
        {alreadyDone && (
          <div style={{
            background: 'rgba(82,183,136,0.08)', border: '1px solid rgba(82,183,136,0.25)',
            borderRadius: '8px', padding: '6px 14px', marginBottom: '10px',
            fontSize: '12px', color: '#52B788', fontWeight: 700, textAlign: 'center',
          }}>
            ✓ Completed — reviewing for mastery
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span style={{
            background: `${DIFF_COLOR[currentEncounter.difficulty] || '#C8A96E'}20`,
            border: `1px solid ${DIFF_COLOR[currentEncounter.difficulty] || '#C8A96E'}50`,
            color: DIFF_COLOR[currentEncounter.difficulty] || '#C8A96E',
            borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700,
          }}>
            {DIFF_LABEL[currentEncounter.difficulty] || 'Standard'}
          </span>
          {currentEncounter.concept_tag && (
            <span style={{
              background: `${districtSecondary}15`,
              border: `1px solid ${districtSecondary}35`,
              color: `${districtSecondary}cc`,
              borderRadius: '6px', padding: '3px 10px', fontSize: '11px', fontWeight: 700,
            }}>
              {currentEncounter.concept_tag.replace(/_/g, ' ')}
            </span>
          )}
        </div>

        {/* Passage */}
        {currentEncounter.passage && (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '10px', padding: '12px 16px', marginBottom: '12px',
          }}>
            <button
              onClick={() => setShowPassage((s) => !s)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: `${districtSecondary}aa`, fontSize: '12px', fontWeight: 700,
                padding: 0, display: 'flex', alignItems: 'center', gap: '6px',
                marginBottom: showPassage ? '10px' : 0, fontFamily: 'Nunito, sans-serif',
              }}
            >
              <Icon name="doc" size={13} /> {showPassage ? 'Hide' : 'Show'} passage
            </button>
            <AnimatePresence>
              {showPassage && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(235,225,210,0.78)', lineHeight: '1.7', fontStyle: 'italic', fontFamily: 'Georgia, serif', paddingTop: '4px' }}>
                    {currentEncounter.passage}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Question */}
        <div style={{
          background: `linear-gradient(135deg, ${districtColor}20, ${districtColor}08)`,
          border: `1px solid ${districtSecondary}30`,
          borderRadius: '12px', padding: '18px 20px', marginBottom: '14px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: `linear-gradient(90deg, transparent, ${districtSecondary}60, transparent)`,
          }} />
          <p style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'rgba(240,235,225,0.95)', lineHeight: '1.6', fontFamily: 'Nunito, sans-serif' }}>
            {currentEncounter.question_stem}
          </p>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['A', 'B', 'C', 'D'].map((letter) => {
            const text = currentEncounter[`option_${letter.toLowerCase()}`];
            const isSelected = submitting && selectedAnswer === letter;
            return (
              <OptionButton
                key={letter}
                letter={letter}
                text={text}
                state={isSelected ? 'selected' : 'default'}
                onSelect={submitAnswer}
                disabled={submitting}
              />
            );
          })}
        </div>

        {submitting && (
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ textAlign: 'center', marginTop: '14px', color: `${districtSecondary}80`, fontSize: '12px', fontFamily: 'Nunito, sans-serif' }}
          >
            The Keep judges your answer…
          </motion.div>
        )}
      </motion.div>
    );
  }

  function renderResult() {
    if (!currentEncounter || !lastResult) return null;
    const correct = lastResult.correct;
    const accentColor = correct ? '#52B788' : '#C0392B';

    return (
      <motion.div
        key={`result-${currentEncounter.id}`}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ flex: 1, padding: '14px', maxWidth: '660px', width: '100%', margin: '0 auto', position: 'relative', overflowY: 'auto' }}
      >
        {showXPFloat && <XPFloat xp={lastResult.xp_earned} runes={lastResult.runes_earned} color={districtSecondary} />}

        {/* Result header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 20 }}
          style={{ textAlign: 'center', marginBottom: '20px', paddingTop: '8px' }}
        >
          <motion.div
            animate={correct ? { scale: [1, 1.15, 1] } : { x: [0, -8, 8, -6, 6, 0] }}
            transition={{ duration: 0.5 }}
            style={{ fontSize: '44px', marginBottom: '8px', display: 'block' }}
          >
            {correct ? '✨' : '💢'}
          </motion.div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, color: accentColor }}>
            {correct ? 'Spell Broken!' : 'The Error Resists!'}
          </div>
          {correct && !lastResult.already_completed && (lastResult.xp_earned > 0 || lastResult.runes_earned > 0) && (
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', marginTop: '6px' }}>
              +{lastResult.xp_earned} XP
              {lastResult.runes_earned > 0 && ` · +${lastResult.runes_earned} runes`}
            </div>
          )}
        </motion.div>

        {/* Narrative */}
        <div style={{
          background: `${accentColor}10`, border: `1px solid ${accentColor}28`,
          borderRadius: '12px', padding: '16px 20px', marginBottom: '12px',
          fontFamily: 'Georgia, serif', fontSize: '14px', lineHeight: '1.8',
          color: 'rgba(235,225,210,0.82)', fontStyle: 'italic',
        }}>
          {lastResult.narrative}
        </div>

        {/* Answer reveal */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '12px',
        }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            {['A', 'B', 'C', 'D'].map((letter) => {
              const isCorrect = letter === currentEncounter.correct_answer;
              const isSelected = letter === lastResult.selected_answer;
              return (
                <div key={letter} style={{
                  width: '34px', height: '34px', borderRadius: '8px',
                  background: isCorrect ? 'rgba(82,183,136,0.25)' : isSelected ? 'rgba(192,57,43,0.25)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isCorrect ? '#52B788' : isSelected ? '#C0392B' : 'rgba(255,255,255,0.08)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Cinzel, serif', fontSize: '13px', fontWeight: 800,
                  color: isCorrect ? '#52B788' : isSelected ? '#C0392B' : 'rgba(255,255,255,0.25)',
                }}>
                  {letter}
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.55', fontFamily: 'Nunito, sans-serif' }}>
            <span style={{ color: '#52B788', fontWeight: 700 }}>Correct: </span>
            {currentEncounter[`option_${currentEncounter.correct_answer.toLowerCase()}`]}
          </div>
        </div>

        {/* Explanation */}
        <div style={{
          background: `${districtSecondary}0c`, border: `1px solid ${districtSecondary}25`,
          borderRadius: '10px', padding: '14px 16px', marginBottom: '18px',
        }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: districtSecondary, letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase', fontFamily: 'Nunito, sans-serif' }}>
            📖 The Rule
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(235,225,210,0.78)', lineHeight: '1.65', fontFamily: 'Nunito, sans-serif' }}>
            {lastResult.explanation}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {!correct && (
            <button
              onClick={() => { setSelectedAnswer(null); setLastResult(null); setPhase(PHASES.QUESTION); }}
              style={{
                flex: 1, background: 'rgba(192,57,43,0.12)', border: '1px solid rgba(192,57,43,0.35)',
                color: '#e07070', borderRadius: '10px', padding: '13px',
                fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
              }}
            >
              Try Again
            </button>
          )}
          <button
            onClick={advanceAfterResult}
            style={{
              flex: 2,
              background: `linear-gradient(135deg, ${districtColor}, ${districtSecondary})`,
              border: 'none', color: '#0e0a04', borderRadius: '10px', padding: '13px',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
              boxShadow: `0 4px 16px ${districtColor}60`,
            }}
          >
            {currentIdx >= encounters.length - 1 ? 'Complete →' : 'Next →'}
          </button>
        </div>
      </motion.div>
    );
  }

  function renderChapterDone() {
    const narrative = completionData?.completion_narrative || chapter?.closing_narrative;
    const isBoss = chapter?.is_boss_chapter;

    useEffect(() => {
      if (isBoss) fireBossConfetti();
    }, []);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px 24px', textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: isBoss ? -180 : 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 180, damping: 15, delay: 0.1 }}
          style={{ fontSize: isBoss ? '64px' : '52px', marginBottom: '16px' }}
        >
          {isBoss ? '🏆' : '⭐'}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: isBoss ? '24px' : '20px', fontWeight: 700, color: '#C8A96E', marginBottom: '8px' }}>
            {isBoss ? 'Warden Defeated!' : 'Chapter Complete!'}
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: `${districtSecondary}aa`, marginBottom: '20px' }}>
            {chapter?.title}
          </div>
        </motion.div>

        {narrative && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{
              maxWidth: '520px', fontFamily: 'Georgia, serif', fontSize: '14px',
              lineHeight: '1.9', color: 'rgba(235,225,210,0.8)', fontStyle: 'italic',
              marginBottom: '28px', whiteSpace: 'pre-line', textAlign: 'left',
            }}
          >
            {narrative}
          </motion.div>
        )}

        {(totalXPEarned > 0 || totalRunesEarned > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              display: 'flex', gap: '24px', marginBottom: '28px',
              background: `${districtColor}20`, border: `1px solid ${districtSecondary}35`,
              borderRadius: '14px', padding: '16px 28px',
            }}
          >
            {totalXPEarned > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', color: '#F5A623', fontWeight: 700 }}>+{totalXPEarned}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>XP</div>
              </div>
            )}
            {totalRunesEarned > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', color: '#A78BFA', fontWeight: 700 }}>+{totalRunesEarned}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px' }}>Runes</div>
              </div>
            )}
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('chronicles_map', { gameId })}
          style={{
            background: `linear-gradient(135deg, ${districtColor}, ${districtSecondary})`,
            border: 'none', color: '#0e0a04', borderRadius: '12px', padding: '14px 32px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
            boxShadow: `0 8px 24px ${districtColor}60`,
          }}
        >
          Return to Map →
        </motion.button>
      </motion.div>
    );
  }

  function renderDistrictDone() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -200 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.2 }}
          style={{ fontSize: '70px', marginBottom: '18px' }}
        >
          🔰
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '24px', fontWeight: 700, color: '#C8A96E', marginBottom: '8px' }}>
            Warden Seal Earned!
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '14px', color: `${districtSecondary}aa`, marginBottom: '16px' }}>
            {districtName}
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', maxWidth: '380px', margin: '0 auto 28px' }}>
            You have purified this district. The Warden's corruption is broken.
            One seal added to your collection.
          </p>
          <button
            onClick={() => navigate('chronicles_map', { gameId })}
            style={{
              background: `linear-gradient(135deg, ${districtColor}, ${districtSecondary})`,
              border: 'none', color: '#0e0a04', borderRadius: '12px', padding: '14px 32px',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
            }}
          >
            Return to Map →
          </button>
        </motion.div>
      </motion.div>
    );
  }

  function renderGameDone() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', textAlign: 'center' }}
      >
        <motion.div
          animate={{ rotate: [0, 12, -12, 12, 0], scale: [1, 1.12, 1.12, 1.12, 1] }}
          transition={{ duration: 0.9, delay: 0.3 }}
          style={{ fontSize: '72px', marginBottom: '18px' }}
        >
          👑
        </motion.div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', fontWeight: 700, color: '#C8A96E', marginBottom: '8px' }}>
          The Keep is Restored!
        </div>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', maxWidth: '480px', margin: '0 auto 16px' }}>
          All five Wardens have been defeated. The Chronicles of the Keep are complete.
        </p>
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
            background: 'linear-gradient(135deg, #6B4F0A, #C8A96E)',
            border: 'none', color: '#1a0f04', borderRadius: '12px', padding: '14px 32px',
            fontSize: '15px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
          }}
        >
          View the Chronicles →
        </button>
      </motion.div>
    );
  }

  function renderSummary() {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '28px', textAlign: 'center' }}
      >
        <div style={{ fontSize: '44px', marginBottom: '16px' }}>⚔️</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#C8A96E', marginBottom: '8px' }}>
          Chapter In Progress
        </div>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.6', marginBottom: '24px' }}>
          Complete the remaining encounters to earn the full chapter reward.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('chronicles_map', { gameId })}
            style={{
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.14)',
              color: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '12px 20px',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
            }}
          >
            Back to Map
          </button>
          <button
            onClick={() => { setCurrentIdx(0); setPhase(PHASES.PRE_NARRATIVE); }}
            style={{
              background: `linear-gradient(135deg, ${districtColor}, ${districtSecondary})`,
              border: 'none', color: '#0e0a04', borderRadius: '10px', padding: '12px 20px',
              fontSize: '14px', fontWeight: 800, cursor: 'pointer', fontFamily: 'Cinzel, serif',
            }}
          >
            Try Again
          </button>
        </div>
      </motion.div>
    );
  }

  function renderPhase() {
    switch (phase) {
      case PHASES.LOADING: return renderLoading();
      case PHASES.INTRO: return renderIntro();
      case PHASES.TEACHING: return renderTeaching();
      case PHASES.PRE_NARRATIVE: return renderPreNarrative();
      case PHASES.QUESTION: return renderQuestion();
      case PHASES.RESULT: return renderResult();
      case PHASES.CHAPTER_DONE: return renderChapterDone();
      case PHASES.DISTRICT_DONE: return renderDistrictDone();
      case PHASES.GAME_DONE: return renderGameDone();
      case PHASES.SUMMARY: return renderSummary();
      default: return null;
    }
  }

  // Enemy flash color overlay
  const enemyFlashOverlay = enemyFlash
    ? enemyFlash === 'hit'
      ? 'rgba(82,183,136,0.08)'
      : 'rgba(192,57,43,0.1)'
    : null;

  return (
    <>
      {showEpilogue && (
        <EpilogueSequence
          text={epilogueText}
          districtSecondary={districtSecondary}
          onFinish={() => { setShowEpilogue(false); navigate('chronicles_map', { gameId }); }}
        />
      )}

      <motion.div
        style={{
          minHeight: '100vh',
          background: ambientBg,
          fontFamily: 'Nunito, sans-serif',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
          transition: 'background 0.8s',
        }}
      >
        {/* Enemy flash overlay */}
        <AnimatePresence>
          {enemyFlashOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: enemyFlashOverlay,
                pointerEvents: 'none', zIndex: 200,
              }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.55)',
          borderBottom: `1px solid ${districtSecondary}25`,
          display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
          backdropFilter: 'blur(4px)',
        }}>
          <button
            onClick={() => navigate('chronicles_map', { gameId })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: `${districtSecondary}80`, fontSize: '12px', fontWeight: 700,
              padding: '4px 8px', fontFamily: 'Nunito, sans-serif',
              flexShrink: 0,
            }}
          >
            ← Map
          </button>

          {chapter && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Cinzel, serif', fontSize: '12px', fontWeight: 700,
                color: districtSecondary, whiteSpace: 'nowrap', overflow: 'hidden',
                textOverflow: 'ellipsis', marginBottom: '6px',
              }}>
                {isBossChapter && <span style={{ marginRight: '6px' }}>💀</span>}
                Ch.{chapter.chapter_number} · {chapter.title}
              </div>
              <EnemyHPBar
                done={doneCount}
                total={totalEnc}
                districtSecondary={districtSecondary}
                shake={hpShake}
                isBoss={isBossChapter}
              />
            </div>
          )}

          {chapter && (
            <div style={{
              background: `${districtColor}30`,
              border: `1px solid ${districtSecondary}25`,
              borderRadius: '8px', padding: '4px 10px', flexShrink: 0,
              fontSize: '11px', color: `${districtSecondary}cc`, fontWeight: 700, fontFamily: 'Nunito, sans-serif',
              whiteSpace: 'nowrap',
            }}>
              {chapter.concept?.replace(/_/g, ' ')}
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
            transition={{ duration: 0.22 }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          >
            {renderPhase()}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </>
  );
}
