'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import { connectSocket, disconnectSocket } from '../lib/socket.js';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';
import Clio from '../components/write/Clio.jsx';

// ── The Tribunal — Student view (screen "tribunal_play") ────────────────────
// Join via room code → answer an SAQ (parts a/b/c) → vote yes/no, row by row,
// on whether 3 anonymous responses earn each rubric point → see AI verdicts.

function formatTime(seconds) {
  if (seconds == null) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function useCountdown(endsAt) {
  const [remaining, setRemaining] = useState(null);
  useEffect(() => {
    if (!endsAt) { setRemaining(null); return; }
    const tick = () => setRemaining(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsAt]);
  return remaining;
}

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
      }}>The Tribunal</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function JoinPhase({ onJoin, loading, error }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '14vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚖️</div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 6vw, 38px)', color: GW.ink, margin: '0 0 12px', fontWeight: 800 }}>
        The Tribunal
      </h1>
      <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: GW.inkSoft, fontSize: 14.5, lineHeight: 1.6, margin: '0 auto 24px' }}>
        Enter the room code your teacher displayed to join the round.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5))}
        onKeyDown={(e) => { if (e.key === 'Enter' && code.length >= 4) onJoin(code); }}
        placeholder="ROOM CODE"
        style={{
          width: '100%', boxSizing: 'border-box', textAlign: 'center', letterSpacing: '0.3em',
          fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 24, padding: '16px 14px',
          borderRadius: 12, border: `2px solid ${GW.amber}50`, background: GW.parchmentDark,
          color: GW.ink, marginBottom: 16, outline: 'none', textTransform: 'uppercase',
        }}
      />
      {error && <div style={{ color: GW.rose, fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{error}</div>}
      <GwButton onClick={() => onJoin(code)} disabled={loading || code.length < 4}>
        {loading ? 'Joining…' : 'Join Room'}
      </GwButton>
    </div>
  );
}

function LobbyPhase({ prompt, players }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '12vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🕯️</div>
      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, fontWeight: 800, marginBottom: 10 }}>
        Waiting for the teacher to start…
      </h2>
      {prompt && (
        <div style={{
          background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12,
          padding: '16px 18px', marginBottom: 18, textAlign: 'left',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{prompt.topic}</div>
          <div style={{ color: GW.inkSoft, fontSize: 12.5, fontStyle: 'italic', marginBottom: 8 }}>{prompt.stimulus}</div>
          <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}>{prompt.text}</div>
        </div>
      )}
      <div style={{ fontSize: 12.5, color: GW.inkSoft, fontWeight: 700, marginBottom: 10 }}>{players.length} player{players.length === 1 ? '' : 's'} joined</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
        {players.map((p) => (
          <span key={p.id} style={{ background: `${GW.sage}1a`, border: `1px solid ${GW.sage}45`, borderRadius: 8, padding: '5px 12px', color: GW.ink, fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
        ))}
      </div>
    </div>
  );
}

function WritingPhase({ prompt, endsAt, submitted, onSubmit }) {
  const [text, setText] = useState('');
  const remaining = useCountdown(endsAt);
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;

  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) {
      onSubmit(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Answer All Three Parts</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: remaining <= 30 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>

      <div style={{
        background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12,
        padding: '14px 16px',
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{prompt?.topic}</div>
        <div style={{ color: GW.inkSoft, fontSize: 12.5, fontStyle: 'italic', marginBottom: 8 }}>{prompt?.stimulus}</div>
        <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}>{prompt?.text}</div>
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink }}>Answer submitted!</div>
          <div style={{ color: GW.inkSoft, fontSize: 13, marginTop: 6 }}>Waiting for the rest of the class…</div>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your answers to a), b), and c) — label each part clearly…"
            rows={10}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '14px 16px',
              borderRadius: 12, border: `1px solid ${GW.amber}30`, background: GW.parchment,
              color: GW.ink, fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.55, outline: 'none',
            }}
          />
          <GwButton onClick={() => onSubmit(text)} disabled={!text.trim()}>Submit Answer</GwButton>
        </>
      )}
    </div>
  );
}

function JudgingPhase({ round, endsAt, voted, voteTally, reveal, onVote }) {
  const remaining = useCountdown(endsAt);
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '5vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: GW.inkSoft }}>Row {round.index + 1} of {round.total}</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 20, color: remaining <= 8 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>

      <div style={{ textAlign: 'center', fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 18, color: GW.amber }}>{round.criterionLabel}</div>

      <div style={{
        background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12,
        padding: '14px 16px',
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Response {round.responseKey}</div>
        <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif', whiteSpace: 'pre-line' }}>{round.responseText}</div>
      </div>

      <div style={{ textAlign: 'center', fontWeight: 800, color: GW.ink, fontSize: 13.5 }}>
        Does Response {round.responseKey} earn this point?
      </div>

      {!reveal ? (
        <div style={{ display: 'flex', gap: 12 }}>
          <motion.button whileTap={{ scale: 0.97 }} disabled={voted !== null} onClick={() => onVote(true)} style={{
            flex: 1, padding: '16px', borderRadius: 12, cursor: voted !== null ? 'default' : 'pointer',
            border: `2px solid ${GW.sage}60`, background: voted === true ? `${GW.sage}2a` : GW.parchmentDark,
            color: GW.sage, fontWeight: 900, fontSize: 15, opacity: voted !== null && voted !== true ? 0.5 : 1,
          }}>✓ Yes</motion.button>
          <motion.button whileTap={{ scale: 0.97 }} disabled={voted !== null} onClick={() => onVote(false)} style={{
            flex: 1, padding: '16px', borderRadius: 12, cursor: voted !== null ? 'default' : 'pointer',
            border: `2px solid ${GW.rose}60`, background: voted === false ? `${GW.rose}2a` : GW.parchmentDark,
            color: GW.rose, fontWeight: 900, fontSize: 15, opacity: voted !== null && voted !== false ? 0.5 : 1,
          }}>✗ No</motion.button>
        </div>
      ) : (
        <div style={{
          background: `${reveal.aiEarned ? GW.sage : GW.rose}1a`, border: `1px solid ${reveal.aiEarned ? GW.sage : GW.rose}50`,
          borderRadius: 12, padding: '14px 16px', textAlign: 'center',
        }}>
          <div style={{ fontWeight: 900, fontSize: 14, color: reveal.aiEarned ? GW.sage : GW.rose, marginBottom: 6 }}>
            AI verdict: {reveal.aiEarned ? '✓ Point earned' : '✗ Point not earned'}
          </div>
          <div style={{ color: GW.inkSoft, fontSize: 12.5, fontStyle: 'italic', marginBottom: 8 }}>{reveal.aiFeedback}</div>
          <div style={{ fontWeight: 800, fontSize: 13, color: voted === reveal.aiEarned ? GW.sage : GW.muted }}>
            {voted === reveal.aiEarned ? '🎯 Your vote matched! +5 XP' : 'Your vote didn\'t match this round.'}
          </div>
        </div>
      )}

      {voted !== null && !reveal && (
        <div style={{ textAlign: 'center', color: GW.inkSoft, fontSize: 12.5, fontWeight: 700 }}>
          {voteTally.yes || 0} Yes · {voteTally.no || 0} No — waiting for the rest of the class…
        </div>
      )}
    </div>
  );
}

function ResultsPhase({ results, award, onBack }) {
  if (!results) return null;
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: GW.amber, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Tribunal Complete
        </div>
        {award?.xpGain > 0 && (
          <div style={{ fontSize: 15, fontWeight: 800, color: GW.sage, marginTop: 6 }}>🔨 Top judge of the round! +{award.xpGain} XP</div>
        )}
      </div>

      <div style={{ background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: GW.ink, marginBottom: 8 }}>Response scores</div>
        {results.responseScores.map((r) => (
          <div key={r.key} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: GW.amber }}>{r.key}</span>
            <span style={{ color: GW.ink, fontWeight: 700 }}>{r.score} / {r.maxScore}</span>
          </div>
        ))}
      </div>

      <div style={{ background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12, padding: '14px 16px' }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: GW.ink, marginBottom: 8 }}>Top judges</div>
        {results.leaderboard.slice(0, 8).map((p, i) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
            <span style={{ color: GW.ink, fontWeight: 700 }}>#{i + 1} {p.name}</span>
            <span style={{ color: GW.inkSoft, fontSize: 12.5 }}>{p.matches} / {p.roundsVoted} matched</span>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <GwButton onClick={onBack}>Back</GwButton>
      </div>
    </div>
  );
}

export default function TribunalPlay() {
  const { navigate, user, token } = useApp();
  const [phase, setPhase] = useState('join');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [players, setPlayers] = useState([]);
  const [writingEndsAt, setWritingEndsAt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [round, setRound] = useState(null);
  const [voted, setVoted] = useState(null);
  const [voteTally, setVoteTally] = useState({ yes: 0, no: 0 });
  const [reveal, setReveal] = useState(null);
  const [results, setResults] = useState(null);
  const [award, setAward] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => () => disconnectSocket(), []);

  const onBack = () => {
    disconnectSocket();
    navigate('write_home');
  };

  const onJoin = useCallback((code) => {
    if (!code || code.length < 4) return;
    setLoading(true);
    setError(null);

    const socket = connectSocket(token);
    socketRef.current = socket;

    socket.on('tb:lobby_update', (data) => {
      setLoading(false);
      setRoomCode(code);
      setPrompt(data.prompt || null);
      setPlayers(data.players || []);
      if (data.status === 'writing') {
        setWritingEndsAt(data.writingEndsAt);
        setSubmitted(!!data.alreadySubmitted);
        setPhase('writing');
      } else if (data.status === 'judging') {
        setRound(data.round || null);
        setVoted(null);
        setReveal(null);
        setPhase('judging');
      } else {
        setPhase('lobby');
      }
    });

    socket.on('tb:player_joined', (p) => {
      setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
    });

    socket.on('tb:phase_writing', (data) => {
      setPrompt((prev) => data.prompt || prev);
      setWritingEndsAt(data.endsAt);
      setSubmitted(false);
      setPhase('writing');
    });

    socket.on('tb:submit_ack', () => setSubmitted(true));

    socket.on('tb:phase_judging', (data) => {
      setRound(data);
      setVoted(null);
      setVoteTally({ yes: 0, no: 0 });
      setReveal(null);
      setPhase('judging');
    });

    socket.on('tb:vote_ack', (data) => setVoted(data.vote));
    socket.on('tb:vote_update', (data) => setVoteTally(data.tally || { yes: 0, no: 0 }));
    socket.on('tb:round_reveal', (data) => setReveal(data));

    socket.on('tb:phase_results', (data) => {
      setResults(data);
      setPhase('results');
    });

    socket.on('tb:you_won', (data) => setAward(data.award));

    socket.on('tb:ended', () => {
      setError('The teacher ended the game.');
    });

    socket.on('tb:error', (data) => {
      setLoading(false);
      setError(data.message);
    });

    socket.emit('tb:join', { roomCode: code, name: user?.name || 'Student', studentId: user?.id });
  }, [token, user]);

  const onSubmitAnswer = useCallback((text) => {
    socketRef.current?.emit('tb:submit_answer', { roomCode, text });
  }, [roomCode]);

  const onVote = useCallback((vote) => {
    socketRef.current?.emit('tb:vote_round', { roomCode, vote });
  }, [roomCode]);

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <Header onBack={onBack} />
      {error && phase === 'join' && (
        <div style={{ textAlign: 'center', color: GW.rose, fontWeight: 700, padding: 20 }}>{error}</div>
      )}
      {phase === 'join' && <JoinPhase onJoin={onJoin} loading={loading} error={error} />}
      {phase === 'lobby' && <LobbyPhase prompt={prompt} players={players} />}
      {phase === 'writing' && <WritingPhase prompt={prompt} endsAt={writingEndsAt} submitted={submitted} onSubmit={onSubmitAnswer} />}
      {phase === 'judging' && round && <JudgingPhase round={round} endsAt={round.endsAt} voted={voted} voteTally={voteTally} reveal={reveal} onVote={onVote} />}
      {phase === 'results' && <ResultsPhase results={results} award={award} onBack={onBack} />}
      <Clio
        text={
          phase === 'join' ? "Enter your teacher's room code to join the round." :
          phase === 'writing' ? 'Answer all three parts — be specific with names, dates, and places.' :
          phase === 'judging' ? 'Read closely: does this response truly earn the point, or just gesture at it?' :
          phase === 'results' ? (award?.xpGain > 0 ? 'Your rubric instincts are sharp!' : 'Compare your calls to the AI verdicts — that\'s how rubric literacy builds.') :
          ''
        }
        state={phase === 'results' && award?.xpGain > 0 ? 'celebrating' : 'idle'}
      />
    </div>
  );
}
