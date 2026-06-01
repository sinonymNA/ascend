import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { loadQuestionSet, shuffle } from '../lib/loadQuestions.js';
import QuestionCard from '../components/game/QuestionCard.jsx';
import SoundService from '../lib/sound.js';
import Icon from '../components/ui/Icon.jsx';

const GAUNTLET = 10;       // questions
const PASS_RATIO = 0.8;    // 80% to win

export default function BossClimb() {
  const { navigate, screenParams, setWallet } = useApp();
  const { setId, setTitle } = screenParams || {};

  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | playing | done
  const [won, setWon] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!setId) { navigate('student_dashboard'); return; }
    loadQuestionSet(setId).then((qs) => {
      if (!qs.length) { navigate('student_dashboard'); return; }
      // Prefer harder questions
      const hard = qs.filter((q) => q.difficulty >= 2);
      const chosen = shuffle(hard.length >= GAUNTLET ? hard : qs).slice(0, GAUNTLET);
      setPool(chosen);
      setPhase('playing');
    }).catch(() => navigate('student_dashboard'));
  }, [setId, navigate]);

  const finish = useCallback(async (finalCorrect) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const didWin = finalCorrect >= Math.ceil(GAUNTLET * PASS_RATIO);
    setWon(didWin);
    setPhase('done');
    SoundService.play(didWin ? 'summit' : 'wrong');
    try {
      const resp = await api.post('/api/minigame/boss/finish', { setId, won: didWin, correctCount: finalCorrect });
      if (resp.wallet) setWallet(resp.wallet);
      if (didWin && resp.pack) {
        setTimeout(() => navigate('pack_open', { results: resp.pack, packType: 'boss' }), 1800);
      }
    } catch (_) {}
  }, [setId, setWallet, navigate]);

  const handleAnswer = (letter) => {
    if (selected) return;
    setSelected(letter);
    const q = pool[idx];
    const correct = letter === q.correct;
    const newCorrect = correctCount + (correct ? 1 : 0);
    if (correct) { setCorrectCount(newCorrect); SoundService.play('correct'); }
    else SoundService.play('wrong');
    setResult({ correct, explanation: q.explanation });
    setTimeout(() => {
      setSelected(null);
      setResult(null);
      if (idx + 1 >= pool.length) finish(newCorrect);
      else setIdx((i) => i + 1);
    }, 1600);
  };

  const q = pool[idx];

  if (phase === 'loading') {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' }}>Summoning the Boss…</div>;
  }

  if (phase === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>{won ? <Icon name="crown" size={64} color="var(--gold)" /> : <Icon name="boss" size={64} color="var(--sunset)" />}</motion.div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', color: won ? 'var(--gold)' : 'var(--sunset)', margin: '12px 0' }}>
          {won ? 'Boss Defeated!' : 'The Boss Prevails'}
        </h1>
        <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>{correctCount} / {GAUNTLET} correct</div>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '6px', marginBottom: '24px' }}>
          {won ? 'Opening your guaranteed rare pack…' : `Score ${Math.ceil(GAUNTLET * PASS_RATIO)}+ to earn a rare pack.`}
        </div>
        {!won && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn-primary" onClick={() => { finishedRef.current = false; setIdx(0); setCorrectCount(0); setPhase('playing'); }} style={{ padding: '12px 24px' }}>Retry</button>
            <button className="btn-ghost" onClick={() => navigate('student_dashboard')} style={{ padding: '12px 24px' }}>Leave</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', height: '100dvh', background: 'linear-gradient(180deg, #1a0f1a, var(--bg))', display: 'flex', flexDirection: 'column', fontFamily: 'Nunito, sans-serif', overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>← Flee</button>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Cinzel, serif', fontWeight: 700, color: '#E85D4A' }}><Icon name="boss" size={16} color="#E85D4A" /> Boss Climb · {setTitle}</span>
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-muted)' }}>{idx + 1}/{GAUNTLET}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: 800, color: '#52B788' }}><Icon name="check" size={14} color="#52B788" /> {correctCount}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', maxWidth: '640px', width: '100%', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <QuestionCard key={idx} question={q} onAnswer={handleAnswer} selected={selected} disabled={!!selected} />
        </AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            marginTop: '16px', padding: '14px 16px', borderRadius: '12px',
            background: result.correct ? 'rgba(82,183,136,0.1)' : 'rgba(232,93,74,0.1)',
            border: `1px solid ${result.correct ? 'rgba(82,183,136,0.3)' : 'rgba(232,93,74,0.3)'}`,
            fontSize: '14px', color: 'var(--text-mid)', lineHeight: 1.6, fontWeight: 600,
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', verticalAlign: 'middle' }}>
              {result.correct
                ? <><Icon name="check" size={14} color="#52B788" /> Correct!</>
                : <><Icon name="xCircle" size={14} color="#E85D4A" /> Incorrect.</>}
            </span> {result.explanation}
          </motion.div>
        )}
      </div>
    </div>
  );
}
