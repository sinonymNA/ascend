import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { loadQuestionSet, shuffle } from '../lib/loadQuestions.js';
import QuestionCard from '../components/game/QuestionCard.jsx';
import BlockGrid from '../components/minigame/BlockGrid.jsx';
import SoundService from '../lib/sound.js';
import Icon from '../components/ui/Icon.jsx';

const SIZE = 8;

// Polyomino shapes (normalized: min row/col = 0)
const SHAPES = [
  [{ r: 0, c: 0 }],                                              // single
  [{ r: 0, c: 0 }, { r: 0, c: 1 }],                               // domino h
  [{ r: 0, c: 0 }, { r: 1, c: 0 }],                               // domino v
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 0, c: 2 }],               // line3 h
  [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 2, c: 0 }],               // line3 v
  [{ r: 0, c: 0 }, { r: 1, c: 0 }, { r: 1, c: 1 }],               // L tromino
  [{ r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }],               // J tromino
  [{ r: 0, c: 0 }, { r: 0, c: 1 }, { r: 1, c: 0 }, { r: 1, c: 1 }], // square
];
const COLORS = ['#F5A623', '#52B788', '#4A90D9', '#A78BFA', '#E85D4A', '#FBBF24'];

let pieceSeq = 0;
function randomPiece() {
  const cells = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return { id: ++pieceSeq, cells, color };
}

function emptyGrid() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

export default function BlockBlast() {
  const { navigate, screenParams, setWallet } = useApp();
  const { setId, setTitle } = screenParams || {};

  const [pool, setPool] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);

  const [grid, setGrid] = useState(emptyGrid);
  const [tray, setTray] = useState([]);
  const [selPiece, setSelPiece] = useState(null);   // index in tray
  const [preview, setPreview] = useState([]);
  const [previewOk, setPreviewOk] = useState(true);
  const [clearing, setClearing] = useState(new Set());

  const [score, setScore] = useState(0);
  const [linesTotal, setLinesTotal] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState('loading'); // loading | question | place | over
  const finishedRef = useRef(false);

  useEffect(() => {
    if (!setId) { navigate('student_dashboard'); return; }
    loadQuestionSet(setId).then((qs) => {
      if (!qs.length) { navigate('student_dashboard'); return; }
      setPool(shuffle(qs));
      setPhase('question');
    }).catch(() => navigate('student_dashboard'));
  }, [setId, navigate]);

  // ── Placement helpers ──
  const canPlace = useCallback((cells, r, c, g = grid) => {
    for (const cell of cells) {
      const rr = r + cell.r, cc = c + cell.c;
      if (rr < 0 || cc < 0 || rr >= SIZE || cc >= SIZE) return false;
      if (g[rr][cc]) return false;
    }
    return true;
  }, [grid]);

  const anyPlacement = useCallback((cells, g) => {
    for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
      if (canPlace(cells, r, c, g)) return true;
    }
    return false;
  }, [canPlace]);

  const finish = useCallback(async () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setPhase('over');
    SoundService.play('summit');
    try {
      const resp = await api.post('/api/minigame/blockblast/finish', {
        setId, linesCleared: linesTotal, correctCount, score,
      });
      if (resp.wallet) setWallet(resp.wallet);
    } catch (_) {}
  }, [setId, linesTotal, correctCount, score, setWallet]);

  // ── Answer handling ──
  const handleAnswer = (letter) => {
    if (selected) return;
    setSelected(letter);
    const q = pool[qIdx];
    const correct = letter === q.correct;
    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setCorrectCount((c) => c + 1);
      SoundService.play('correct');
      // earn 1-3 pieces
      let n = 1;
      if (newStreak >= 3) n++;
      if (Math.random() < 0.4) n++;
      const earned = Array.from({ length: n }, randomPiece);
      setAnswerResult({ correct: true, earned: n });
      setTimeout(() => {
        setTray(earned);
        setSelPiece(0);
        setSelected(null);
        setAnswerResult(null);
        setPhase('place');
      }, 900);
    } else {
      setStreak(0);
      SoundService.play('wrong');
      setAnswerResult({ correct: false, explanation: q.explanation });
      setTimeout(() => {
        setSelected(null);
        setAnswerResult(null);
        setQIdx((i) => (i + 1) % pool.length);
      }, 1800);
    }
  };

  // ── Place a piece ──
  const attemptPlace = (r, c) => {
    if (selPiece === null || !tray[selPiece]) return;
    const piece = tray[selPiece];
    if (!canPlace(piece.cells, r, c)) { SoundService.play('wrong'); return; }

    const g = grid.map((row) => row.slice());
    for (const cell of piece.cells) g[r + cell.r][c + cell.c] = piece.color;

    // Detect full rows/cols
    const fullRows = [];
    const fullCols = [];
    for (let i = 0; i < SIZE; i++) {
      if (g[i].every((x) => x)) fullRows.push(i);
      if (g.every((row) => row[i])) fullCols.push(i);
    }
    const lines = fullRows.length + fullCols.length;

    const newTray = tray.filter((_, i) => i !== selPiece);

    if (lines > 0) {
      SoundService.play('line-clear');
      const clearKeys = new Set();
      fullRows.forEach((rr) => { for (let cc = 0; cc < SIZE; cc++) clearKeys.add(`${rr},${cc}`); });
      fullCols.forEach((cc) => { for (let rr = 0; rr < SIZE; rr++) clearKeys.add(`${rr},${cc}`); });
      setGrid(g);
      setClearing(clearKeys);
      const combo = lines >= 3 ? 2 : lines === 2 ? 1.5 : 1;
      const gained = Math.round(lines * 50 * combo);
      setScore((s) => s + gained);
      setLinesTotal((l) => l + lines);
      setTimeout(() => {
        const g2 = g.map((row) => row.slice());
        clearKeys.forEach((k) => { const [rr, cc] = k.split(',').map(Number); g2[rr][cc] = null; });
        setGrid(g2);
        setClearing(new Set());
        afterPlace(newTray, g2);
      }, 360);
    } else {
      setGrid(g);
      afterPlace(newTray, g);
    }
  };

  const afterPlace = (newTray, g) => {
    setPreview([]);
    if (newTray.length === 0) {
      setTray([]);
      setSelPiece(null);
      setQIdx((i) => (i + 1) % pool.length);
      setPhase('question');
      return;
    }
    setTray(newTray);
    setSelPiece(0);
    // Game over if no remaining tray piece can be placed anywhere
    const stuck = newTray.every((p) => !anyPlacement(p.cells, g));
    if (stuck) finish();
  };

  const hoverCell = (r, c) => {
    if (selPiece === null || !tray[selPiece]) return;
    const piece = tray[selPiece];
    const cells = piece.cells.map((cell) => ({ r: r + cell.r, c: c + cell.c }));
    setPreview(cells);
    setPreviewOk(canPlace(piece.cells, r, c));
  };

  const q = pool[qIdx];

  if (phase === 'loading') {
    return <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif' }}>Loading Block Blast…</div>;
  }

  if (phase === 'over') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Nunito, sans-serif', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}><Icon name="puzzle" size={64} color="var(--gold)" /></motion.div>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', color: 'var(--gold)', margin: '12px 0' }}>Block Blast Over</h1>
        <div style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text)' }}>Score {score} · {linesTotal} lines</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '6px', marginBottom: '24px' }}>
          {correctCount} questions answered · coins added <Icon name="coins" size={14} color="#F5A623" fill="rgba(245,166,35,0.25)" />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => {
            finishedRef.current = false;
            setGrid(emptyGrid()); setTray([]); setSelPiece(null); setPreview([]);
            setScore(0); setLinesTotal(0); setCorrectCount(0); setStreak(0); setQIdx(0); setPhase('question');
          }} style={{ padding: '12px 24px' }}>Play Again</button>
          <button className="btn-ghost" onClick={() => navigate('student_dashboard')} style={{ padding: '12px 24px' }}>Done</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'Nunito, sans-serif', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: '13px' }}>← Quit</button>
        <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Cinzel, serif', fontWeight: 700, color: 'var(--gold)', fontSize: '15px' }}><Icon name="puzzle" size={15} color="var(--gold)" /> Block Blast</span>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>Score {score}</span>
        {phase === 'place' && tray.length > 0 && (
          <button onClick={finish} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: '14px', padding: '5px 12px', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Cash Out</button>
        )}
      </div>

      {/* Grid (always visible) */}
      <div style={{ padding: '4px 16px 12px' }}>
        <BlockGrid
          grid={grid} size={SIZE} preview={preview} previewOk={previewOk}
          previewColor={tray[selPiece]?.color || '#F5A623'} clearing={clearing}
          onCellEnter={phase === 'place' ? hoverCell : undefined}
          onCellClick={phase === 'place' ? attemptPlace : undefined}
        />
      </div>

      {/* Bottom panel: tray (place phase) or question */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px', maxWidth: '560px', width: '100%', margin: '0 auto' }}>
        {phase === 'place' ? (
          <div>
            <div style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '12px' }}>
              Tap a piece, then tap the grid to place it
            </div>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              {tray.map((piece, i) => (
                <TrayPiece key={piece.id} piece={piece} selected={selPiece === i} onClick={() => setSelPiece(i)} />
              ))}
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <div key={qIdx}>
              <QuestionCard question={q} onAnswer={handleAnswer} selected={selected} disabled={!!selected} />
              {answerResult && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                  marginTop: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '5px', fontSize: '14px', fontWeight: 700,
                  color: answerResult.correct ? '#52B788' : '#E85D4A',
                }}>
                  {answerResult.correct
                    ? <><Icon name="check" size={14} color="#52B788" /> +{answerResult.earned} block{answerResult.earned > 1 ? 's' : ''}!</>
                    : <><Icon name="xCircle" size={14} color="#E85D4A" /> {answerResult.explanation || 'Try the next one.'}</>}
                </motion.div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

// Small SVG preview of a tray piece
function TrayPiece({ piece, selected, onClick }) {
  const maxR = Math.max(...piece.cells.map((c) => c.r)) + 1;
  const maxC = Math.max(...piece.cells.map((c) => c.c)) + 1;
  const dim = Math.max(maxR, maxC);
  const CELL = 100 / dim;
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      style={{
        background: selected ? 'rgba(245,166,35,0.12)' : 'var(--bg-elevated)',
        border: `2px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: '12px', padding: '10px', cursor: 'pointer', width: '76px', height: '76px',
      }}
    >
      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
        {piece.cells.map((cell, i) => (
          <rect key={i} x={cell.c * CELL + 3} y={cell.r * CELL + 3} width={CELL - 6} height={CELL - 6} rx="2" fill={piece.color} />
        ))}
      </svg>
    </motion.button>
  );
}
