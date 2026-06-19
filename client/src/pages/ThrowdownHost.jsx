'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { connectSocket, disconnectSocket } from '../lib/socket.js';
import { Vignette, goldText } from '../components/write/fx.jsx';

// ── Thesis Throwdown — Teacher host view (screen "throwdown_host") ──────────

const C = {
  bg: '#0F1720', card: '#1E2D40', elevated: '#243548',
  text: '#F0EDE6', mid: '#A8B8C8', muted: '#6B7E8F',
  gold: '#F5A623', pine: '#52B788', pineDark: '#2D6A4F', sunset: '#E85D4A',
  border: 'rgba(240,237,230,0.08)',
};

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

function Nav({ onBack, label }) {
  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px',
      background: 'linear-gradient(180deg, rgba(10,16,24,0.95), rgba(15,23,32,0.88))', backdropFilter: 'blur(14px)',
      borderBottom: '1px solid rgba(245,166,35,0.18)',
    }}>
      <button onClick={onBack} style={{
        background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, fontWeight: 700,
      }}>← {label}</button>
      <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(11px, 3.2vw, 15px)', fontWeight: 800, letterSpacing: '0.12em', textAlign: 'center', ...goldText }}>
        ⚔ THESIS THROWDOWN
      </span>
      <div style={{ width: 70 }} />
    </nav>
  );
}

const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20 };
const bigBtn = {
  width: '100%', padding: '16px', borderRadius: 12, cursor: 'pointer',
  background: `linear-gradient(180deg, #FFD75E 0%, ${C.gold} 45%, #C8851A 100%)`,
  border: '1px solid rgba(255,233,184,0.55)', color: '#1C1208',
  fontWeight: 900, fontSize: 14.5, letterSpacing: '0.05em', textTransform: 'uppercase',
  boxShadow: `0 6px 22px ${C.gold}40, inset 0 1px 0 rgba(255,255,255,0.5)`,
};
const ghostBtn = {
  width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
  background: 'transparent', border: `1.5px solid ${C.mid}50`, color: C.mid,
  fontWeight: 800, fontSize: 13, letterSpacing: '0.04em',
};

export default function ThrowdownHost() {
  const { navigate, token } = useApp();
  const [phase, setPhase] = useState('setup'); // setup | lobby | writing | voting | results
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [players, setPlayers] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [votingOptions, setVotingOptions] = useState([]);
  const [voteTally, setVoteTally] = useState({});
  const [results, setResults] = useState(null);
  const [writingEndsAt, setWritingEndsAt] = useState(null);
  const [votingEndsAt, setVotingEndsAt] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const writingRemaining = useCountdown(writingEndsAt);
  const votingRemaining = useCountdown(votingEndsAt);

  useEffect(() => {
    api.get('/api/write/games/thesis-throwdown/prompts').then((d) => setPrompts(d.prompts || [])).catch(() => {});
  }, []);

  useEffect(() => () => disconnectSocket(), []);

  const launch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/write/games/thesis-throwdown/create', { promptId: selectedPromptId });
      setRoomCode(res.roomCode);
      setPrompt(res.prompt);

      const socket = connectSocket(token);
      socketRef.current = socket;
      socket.emit('tt:host_join', { roomCode: res.roomCode });

      socket.on('tt:lobby_update', (data) => setPlayers(data.players || []));
      socket.on('tt:player_joined', (p) => {
        setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
      });
      socket.on('tt:phase_writing', (data) => {
        setPhase('writing');
        setWritingEndsAt(data.endsAt);
        setSubmittedCount(0);
      });
      socket.on('tt:submission_update', (data) => setSubmittedCount(data.submittedCount || 0));
      socket.on('tt:phase_voting', (data) => {
        setPhase('voting');
        setVotingOptions(data.options || []);
        setVotingEndsAt(data.endsAt);
        setVoteTally({});
      });
      socket.on('tt:vote_update', (data) => setVoteTally(data.tally || {}));
      socket.on('tt:phase_results', (data) => {
        setPhase('results');
        setResults(data);
      });
      socket.on('tt:error', (data) => setError(data.message));

      setPhase('lobby');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPromptId, token]);

  const startWriting = () => socketRef.current?.emit('tt:start_writing', { roomCode });
  const startVoting = () => socketRef.current?.emit('tt:start_voting', { roomCode });
  const endGame = () => {
    socketRef.current?.emit('tt:end_game', { roomCode });
    navigate('write_teacher');
  };

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 50% -10%, #1A2940 0%, ${C.bg} 55%, #0A1018 100%)`, fontFamily: 'Nunito, sans-serif', position: 'relative' }}>
      <Vignette strength={0.45} />
      <Nav onBack={() => navigate('write_teacher')} label="Dashboard" />

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '22px 16px 80px', position: 'relative', zIndex: 3 }}>
        {error && (
          <div style={{ color: C.sunset, fontWeight: 700, fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</div>
        )}

        {phase === 'setup' && (
          <div>
            <p style={{ color: C.mid, fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
              Pick a prompt — students join with a room code, write a thesis in 3 minutes,
              then vote on 4 anonymous submissions before AI reveals rubric scores.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <button onClick={() => setSelectedPromptId(null)} style={{
                ...card, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${selectedPromptId === null ? C.gold + '70' : C.border}`,
                background: selectedPromptId === null ? `${C.gold}14` : C.card,
              }}>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 13.5 }}>🎲 Random Prompt</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Let Summit pick a topic for the class.</div>
              </button>
              {prompts.map((p) => (
                <button key={p.id} onClick={() => setSelectedPromptId(p.id)} style={{
                  ...card, textAlign: 'left', cursor: 'pointer',
                  border: `1px solid ${selectedPromptId === p.id ? C.gold + '70' : C.border}`,
                  background: selectedPromptId === p.id ? `${C.gold}14` : C.card,
                }}>
                  <div style={{ fontWeight: 800, color: C.gold, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{p.topic}</div>
                  <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.5 }}>{p.text}</div>
                </button>
              ))}
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} disabled={loading} onClick={launch}
              style={{ ...bigBtn, opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Launching…' : 'Launch Room'}
            </motion.button>
          </div>
        )}

        {phase === 'lobby' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.2em', color: C.muted, textTransform: 'uppercase', marginBottom: 8 }}>Room Code</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 48, fontWeight: 900, letterSpacing: '0.15em', ...goldText }}>{roomCode}</div>
              <div style={{ color: C.mid, fontSize: 12.5, marginTop: 8 }}>Students join Speed Round → Multiplayer with this code.</div>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 800, color: C.gold, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{prompt?.topic}</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{prompt?.text}</div>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 13, marginBottom: 10 }}>Players ({players.length})</div>
              {players.length === 0 ? (
                <div style={{ color: C.muted, fontSize: 12.5 }}>Waiting for students to join…</div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {players.map((p) => (
                    <span key={p.id} style={{ background: `${C.pine}1a`, border: `1px solid ${C.pine}45`, borderRadius: 8, padding: '5px 12px', color: C.pine, fontSize: 12.5, fontWeight: 700 }}>{p.name}</span>
                  ))}
                </div>
              )}
            </div>
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={startWriting} disabled={players.length === 0} style={{ ...bigBtn, opacity: players.length === 0 ? 0.5 : 1 }}>
              Start Writing (3 min)
            </motion.button>
          </div>
        )}

        {phase === 'writing' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 800, color: C.gold, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{prompt?.topic}</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{prompt?.text}</div>
            </div>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: writingRemaining <= 30 ? C.sunset : C.gold }}>
                {formatTime(writingRemaining)}
              </div>
              <div style={{ color: C.mid, fontSize: 13, marginTop: 8 }}>{submittedCount} / {players.length} submitted</div>
            </div>
            <button onClick={startVoting} style={ghostBtn}>Skip to Voting →</button>
          </div>
        )}

        {phase === 'voting' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 13, marginBottom: 4 }}>Class is voting…</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 900, color: votingRemaining <= 10 ? C.sunset : C.gold }}>
                {formatTime(votingRemaining)}
              </div>
            </div>
            {votingOptions.map((o) => (
              <div key={o.key} style={{ ...card }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: C.gold, fontSize: 14 }}>{o.key}</span>
                  <span style={{ color: C.mid, fontSize: 12.5, fontWeight: 800 }}>{voteTally[o.key] || 0} votes</span>
                </div>
                <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.55 }}>{o.text}</div>
              </div>
            ))}
          </div>
        )}

        {phase === 'results' && results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Round Complete</div>
            </div>
            {results.rankings.map((r, i) => (
              <div key={r.key} style={{
                ...card,
                border: `1px solid ${r.key === results.winnerKey ? C.pine + '70' : C.border}`,
                background: r.key === results.winnerKey ? `${C.pine}14` : C.card,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: C.gold, fontSize: 14 }}>
                    #{i + 1} · {r.key} {r.key === results.winnerKey ? '🏆' : ''}
                  </span>
                  <span style={{ color: C.mid, fontSize: 12.5, fontWeight: 800 }}>{r.votes} votes · {r.earned ? '✓ Thesis pt' : '✗ Thesis pt'}</span>
                </div>
                <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.55, marginBottom: 8 }}>{r.text}</div>
                <div style={{ color: C.mid, fontSize: 12.5, fontStyle: 'italic' }}>{r.feedback}</div>
              </div>
            ))}
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={endGame} style={bigBtn}>
              End Game
            </motion.button>
          </div>
        )}
      </main>
    </div>
  );
}
