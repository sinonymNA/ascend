'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import { connectSocket, disconnectSocket } from '../lib/socket.js';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';
import Clio from '../components/write/Clio.jsx';

// ── Thesis Throwdown — Student view (screen "throwdown_play") ───────────────
// Join via room code → write a thesis in 3 minutes → vote on 4 anonymous
// theses → see AI rankings and (if you won) Grammar Rune-style XP/badge.

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
      }}>Thesis Throwdown</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function JoinPhase({ onJoin, loading, error }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '14vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚔️</div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 6vw, 38px)', color: GW.ink, margin: '0 0 12px', fontWeight: 800 }}>
        Thesis Throwdown
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
          <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif' }}>{prompt.text}</div>
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
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Write Your Thesis</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: remaining <= 30 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>

      <div style={{
        background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12,
        padding: '14px 16px',
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{prompt?.topic}</div>
        <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif' }}>{prompt?.text}</div>
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '30px 20px' }}>
          <div style={{ fontSize: 34, marginBottom: 10 }}>✅</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 15, color: GW.ink }}>Thesis submitted!</div>
          <div style={{ color: GW.inkSoft, fontSize: 13, marginTop: 6 }}>Waiting for the rest of the class…</div>
        </div>
      ) : (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a defensible thesis that responds to the prompt and previews your line of reasoning…"
            rows={6}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '14px 16px',
              borderRadius: 12, border: `1px solid ${GW.amber}30`, background: GW.parchment,
              color: GW.ink, fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.55, outline: 'none',
            }}
          />
          <GwButton onClick={() => onSubmit(text)} disabled={!text.trim()}>Submit Thesis</GwButton>
        </>
      )}
    </div>
  );
}

function VotingPhase({ options, endsAt, votedChoice, voteTally, onVote }) {
  const remaining = useCountdown(endsAt);
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Which thesis is most defensible?</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: remaining <= 10 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>

      {options.map((o) => {
        const isVoted = votedChoice === o.key;
        return (
          <motion.button key={o.key} whileTap={{ scale: 0.98 }} disabled={!!votedChoice} onClick={() => onVote(o.key)}
            style={{
              textAlign: 'left', padding: '16px 18px', borderRadius: 12, cursor: votedChoice ? 'default' : 'pointer',
              border: `2px solid ${isVoted ? GW.sage : GW.amber}50`,
              background: isVoted ? `${GW.sage}1a` : GW.parchmentDark,
              opacity: votedChoice && !isVoted ? 0.55 : 1,
            }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: GW.amber, fontSize: 14 }}>{o.key}</span>
              {votedChoice && <span style={{ color: GW.inkSoft, fontSize: 12, fontWeight: 800 }}>{voteTally[o.key] || 0} votes</span>}
            </div>
            <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif' }}>{o.text}</div>
          </motion.button>
        );
      })}
      {votedChoice && (
        <div style={{ textAlign: 'center', color: GW.inkSoft, fontSize: 13, fontWeight: 700, marginTop: 4 }}>
          Vote recorded — waiting for the rest of the class…
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
          Round Complete
        </div>
        {award?.xpGain > 0 && (
          <div style={{ fontSize: 15, fontWeight: 800, color: GW.sage, marginTop: 6 }}>🏆 You won the round! +{award.xpGain} XP</div>
        )}
      </div>

      {results.rankings.map((r, i) => (
        <div key={r.key} style={{
          background: r.key === results.winnerKey ? `${GW.sage}1a` : GW.parchmentDark,
          border: `1px solid ${r.key === results.winnerKey ? GW.sage : GW.amber}40`,
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: GW.amber, fontSize: 13 }}>
              #{i + 1} · {r.key} {r.key === results.winnerKey ? '🏆' : ''}
            </span>
            <span style={{ color: GW.inkSoft, fontSize: 12, fontWeight: 800 }}>{r.votes} votes · {r.earned ? '✓ Thesis pt' : '✗ Thesis pt'}</span>
          </div>
          <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif', marginBottom: 6 }}>{r.text}</div>
          <div style={{ color: GW.inkSoft, fontSize: 12.5, fontStyle: 'italic' }}>{r.feedback}</div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <GwButton onClick={onBack}>Back</GwButton>
      </div>
    </div>
  );
}

export default function ThrowdownPlay() {
  const { navigate, user, token } = useApp();
  const [phase, setPhase] = useState('join');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [players, setPlayers] = useState([]);
  const [writingEndsAt, setWritingEndsAt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [votingOptions, setVotingOptions] = useState([]);
  const [votingEndsAt, setVotingEndsAt] = useState(null);
  const [votedChoice, setVotedChoice] = useState(null);
  const [voteTally, setVoteTally] = useState({});
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

    socket.on('tt:lobby_update', (data) => {
      setLoading(false);
      setRoomCode(code);
      setPrompt(data.prompt || null);
      setPlayers(data.players || []);
      if (data.status === 'writing') {
        setWritingEndsAt(data.writingEndsAt);
        setPhase('writing');
      } else if (data.status === 'voting') {
        setVotingOptions(data.options || []);
        setVotingEndsAt(data.votingEndsAt);
        setVotedChoice(data.alreadyVoted || null);
        setPhase('voting');
      } else {
        setPhase('lobby');
      }
    });

    socket.on('tt:player_joined', (p) => {
      setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
    });

    socket.on('tt:phase_writing', (data) => {
      setPrompt(data.prompt || prompt);
      setWritingEndsAt(data.endsAt);
      setSubmitted(false);
      setPhase('writing');
    });

    socket.on('tt:submit_ack', () => setSubmitted(true));

    socket.on('tt:phase_voting', (data) => {
      setVotingOptions(data.options || []);
      setVotingEndsAt(data.endsAt);
      setVotedChoice(null);
      setVoteTally({});
      setPhase('voting');
    });

    socket.on('tt:vote_ack', (data) => setVotedChoice(data.choice));
    socket.on('tt:vote_update', (data) => setVoteTally(data.tally || {}));

    socket.on('tt:phase_results', (data) => {
      setResults(data);
      setPhase('results');
    });

    socket.on('tt:you_won', (data) => setAward(data.award));

    socket.on('tt:ended', () => {
      setError('The teacher ended the game.');
    });

    socket.on('tt:error', (data) => {
      setLoading(false);
      setError(data.message);
    });

    socket.emit('tt:join', { roomCode: code, name: user?.name || 'Student', studentId: user?.id });
  }, [token, user, prompt]);

  const onSubmitThesis = useCallback((text) => {
    socketRef.current?.emit('tt:submit_thesis', { roomCode, text });
  }, [roomCode]);

  const onVote = useCallback((choice) => {
    socketRef.current?.emit('tt:vote', { roomCode, choice });
  }, [roomCode]);

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <Header onBack={onBack} />
      {error && phase === 'join' && (
        <div style={{ textAlign: 'center', color: GW.rose, fontWeight: 700, padding: 20 }}>{error}</div>
      )}
      {phase === 'join' && <JoinPhase onJoin={onJoin} loading={loading} error={error} />}
      {phase === 'lobby' && <LobbyPhase prompt={prompt} players={players} />}
      {phase === 'writing' && <WritingPhase prompt={prompt} endsAt={writingEndsAt} submitted={submitted} onSubmit={onSubmitThesis} />}
      {phase === 'voting' && <VotingPhase options={votingOptions} endsAt={votingEndsAt} votedChoice={votedChoice} voteTally={voteTally} onVote={onVote} />}
      {phase === 'results' && <ResultsPhase results={results} award={award} onBack={onBack} />}
      <Clio
        text={
          phase === 'join' ? "Enter your teacher's room code to join the round." :
          phase === 'writing' ? 'Make a claim, then preview the "because" — that\'s your line of reasoning.' :
          phase === 'voting' ? 'Look for a thesis that takes a side and previews its reasoning.' :
          phase === 'results' ? (award?.xpGain > 0 ? 'Your thesis set the standard this round!' : 'Compare your instincts to the AI call — that\'s how rubric literacy builds.') :
          ''
        }
        state={phase === 'results' && award?.xpGain > 0 ? 'celebrating' : 'idle'}
      />
    </div>
  );
}
