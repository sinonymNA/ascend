import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { loadQuestionSet, shuffle } from '../lib/loadQuestions.js';
import QuestionCard from '../components/game/QuestionCard.jsx';
import SoundService from '../lib/sound.js';
import Icon from '../components/ui/Icon.jsx';

const DURATION = 60; // seconds

export default function BlitzGame() {
  const { navigate, screenParams, setWallet } = useApp();
  const { setId, setTitle } = screenParams || {};

  const [pool, setPool] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [phase, setPhase] = useState('loading'); // loading | playing | done
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(0);
  const startRef = useRef(Date.now());
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!setId) { navigate('student_dashboard'); return; }
    loadQuestionSet(setId).then((qs) => {
      if (!qs.length) { navigate('student_dashboard'); return; }
      setPool(shuffle(qs));
      setPhase('playing');
      startRef.current = Date.now();
    }).catch(() => navigate('student_dashboard'));
  }, [setId, navigate]);

  const finish = useCallback(async (finalCorrect) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('done');
    SoundService.play('summit');
    try {
      const resp = await api.post('/api/minigame/blitz/finish', {
        setId, correctCount: finalCorrect, durationMs: Date.now() - startRef.current,
      });
      if (resp.wallet) setWallet(resp.wallet);
    } catch (_) {}
  }, [setId, setWallet]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { finish(correctCount); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, correctCount, finish]);

  const handleAnswer = (letter) => {
    if (selected) return;
    setSelected(letter);
    const q = pool[idx];
    const correct = letter === q.correct;
    setAnswered((a) => a + 1);
    if (correct) { setCorrectCount((c) => c + 1); SoundService.play('correct'); }
    else SoundService.play('wrong');
    setTimeout(() => {
      setSelected(null);
      setIdx((i) => (i + 1) % pool.length);
    }, 400);
  };

  const q = pool[idx];
  const pct = (timeLeft / DURATION) * 100;
  const barColor = pct > 50 ? '#52B788' : pct > 20 ? '#F5A623' : '#E85D4A';

  if (phase === 'loading') {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' }}>Loading Blitz…</div>;
  }

  if (phase === 'done') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}><Icon name="boost" size={64} color="#F5A623" /></motion.div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '28px', color: 'var(--gold)', margin: '12px 0' }}>Blitz Complete!</h1>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text)' }}>{correctCount} correct of {answered}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '6px', marginBottom: '24px' }}>Coins added to your wallet <Icon name="coins" size={14} color="#F5A623" fill="rgba(245,166,35,0.25)" /></div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => { finishedRef.current = false; setIdx(0); setCorrectCount(0); setAnswered(0); setTimeLeft(DURATION); startRef.current = Date.now(); setPhase('playing'); }} style={{ padding: '12px 24px' }}>Again</button>
          <button className="btn-ghost" onClick={() => navigate('student_dashboard')} style={{ padding: '12px 24px' }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'Nunito, sans-serif', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>← Quit</button>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Cinzel, serif', fontWeight: 700, color: 'var(--gold)' }}><Icon name="boost" size={16} color="var(--gold)" /> Blitz · {setTitle}</span>
        <span style={{ fontSize: '16px', fontWeight: 800, color: barColor }}>{timeLeft}s</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: 800, color: '#52B788' }}><Icon name="check" size={14} color="#52B788" /> {correctCount}</span>
      </div>
      {/* Timer bar */}
      <div style={{ height: '6px', background: 'var(--bg-elevated)' }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ ease: 'linear', duration: 1 }} style={{ height: '100%', background: barColor }} />
      </div>

      {/* Question */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', maxWidth: '640px', width: '100%', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          <QuestionCard key={idx} question={q} onAnswer={handleAnswer} selected={selected} disabled={!!selected} />
        </AnimatePresence>
      </div>
    </div>
  );
}
