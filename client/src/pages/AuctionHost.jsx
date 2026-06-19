'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { connectSocket, disconnectSocket } from '../lib/socket.js';
import { Vignette, goldText } from '../components/write/fx.jsx';

// ── Evidence Auction — Teacher host view (screen "auction_host") ────────────

const C = {
  bg: '#0F1720', card: '#1E2D40', elevated: '#243548',
  text: '#F0EDE6', mid: '#A8B8C8', muted: '#6B7E8F',
  gold: '#F5A623', pine: '#52B788', pineDark: '#2D6A4F', sunset: '#E85D4A',
  border: 'rgba(240,237,230,0.08)',
};

const SCORE_LABEL = ['No connection', 'Vague', 'Relevant', 'Specific & precise'];

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
        🪙 EVIDENCE AUCTION
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

export default function AuctionHost() {
  const { navigate, token } = useApp();
  const [phase, setPhase] = useState('setup'); // setup | lobby | bidding | justify | grading | results
  const [prompts, setPrompts] = useState([]);
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  const [roomCode, setRoomCode] = useState(null);
  const [thesis, setThesis] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [submittedCount, setSubmittedCount] = useState(0);
  const [totalTeams, setTotalTeams] = useState(0);
  const [stageEndsAt, setStageEndsAt] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);

  const remaining = useCountdown(stageEndsAt);

  useEffect(() => {
    api.get('/api/write/games/auction/prompts').then((d) => setPrompts(d.prompts || [])).catch(() => {});
  }, []);

  useEffect(() => () => disconnectSocket(), []);

  const launch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/write/games/auction/create', { promptId: selectedPromptId });
      setRoomCode(res.roomCode);
      setThesis(res.thesis);

      const socket = connectSocket(token);
      socketRef.current = socket;
      socket.emit('ea:host_join', { roomCode: res.roomCode });

      socket.on('ea:lobby_update', (data) => setPlayers(data.players || []));
      socket.on('ea:player_joined', (p) => {
        setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
      });
      socket.on('ea:teams_assigned', (data) => setTeams(data.teams || []));
      socket.on('ea:phase_bidding', (data) => {
        setPhase('bidding');
        setStageEndsAt(data.endsAt);
        setSubmittedCount(0);
      });
      socket.on('ea:submission_update', (data) => {
        setSubmittedCount(data.submittedCount || 0);
        setTotalTeams(data.totalTeams || 0);
      });
      socket.on('ea:auction_resolved', (data) => {
        setTeams((prev) => prev.map((t) => {
          const updated = (data.teams || []).find((x) => x.id === t.id);
          return updated ? { ...t, coins: updated.coins, wonCards: updated.wonCards } : t;
        }));
      });
      socket.on('ea:phase_justify', (data) => {
        setPhase('justify');
        setStageEndsAt(data.endsAt);
        setSubmittedCount(0);
      });
      socket.on('ea:justify_progress', (data) => {
        setSubmittedCount(data.completedTeams || 0);
        setTotalTeams(data.totalTeams || 0);
      });
      socket.on('ea:phase_grading', () => setPhase('grading'));
      socket.on('ea:phase_results', (data) => {
        setPhase('results');
        setResults(data);
      });
      socket.on('ea:error', (data) => setError(data.message));

      setPhase('lobby');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selectedPromptId, token]);

  const startAuction = () => socketRef.current?.emit('ea:start_auction', { roomCode });
  const skipStage = () => socketRef.current?.emit('ea:skip_stage', { roomCode });
  const endGame = () => {
    socketRef.current?.emit('ea:end_game', { roomCode });
    navigate('write_teacher');
  };

  return (
    <div style={{ minHeight: '100vh', background: `radial-gradient(ellipse at 50% -10%, #1A2940 0%, ${C.bg} 55%, #0A1018 100%)`, fontFamily: 'Nunito, sans-serif', position: 'relative' }}>
      <Vignette strength={0.45} />
      <Nav onBack={() => navigate('write_teacher')} label="Dashboard" />

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '22px 16px 80px', position: 'relative', zIndex: 3 }}>
        {error && (
          <div style={{ color: C.sunset, fontWeight: 700, fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</div>
        )}

        {phase === 'setup' && (
          <div>
            <p style={{ color: C.mid, fontSize: 13.5, lineHeight: 1.6, marginBottom: 18 }}>
              Pick a thesis — students are randomly split into teams of 3. Each team
              gets 100 coins and submits one sealed bid covering all 12 evidence
              cards at once. Highest bidder wins each card and pays their bid;
              teams then justify how their won cards support the thesis, and earn
              coins back based on AI-scored specificity and relevance.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
              <button onClick={() => setSelectedPromptId(null)} style={{
                ...card, textAlign: 'left', cursor: 'pointer',
                border: `1px solid ${selectedPromptId === null ? C.gold + '70' : C.border}`,
                background: selectedPromptId === null ? `${C.gold}14` : C.card,
              }}>
                <div style={{ fontWeight: 800, color: C.text, fontSize: 13.5 }}>🎲 Random Thesis</div>
                <div style={{ color: C.muted, fontSize: 12, marginTop: 4 }}>Let Summit pick a topic for the class.</div>
              </button>
              {prompts.map((p) => (
                <button key={p.id} onClick={() => setSelectedPromptId(p.id)} style={{
                  ...card, textAlign: 'left', cursor: 'pointer',
                  border: `1px solid ${selectedPromptId === p.id ? C.gold + '70' : C.border}`,
                  background: selectedPromptId === p.id ? `${C.gold}14` : C.card,
                }}>
                  <div style={{ fontWeight: 800, color: C.gold, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{p.topic}</div>
                  <div style={{ color: C.text, fontSize: 13.5, lineHeight: 1.5 }}>{p.thesis}</div>
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
              <div style={{ color: C.mid, fontSize: 12.5, marginTop: 8 }}>Students join Evidence Auction with this code.</div>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 800, color: C.gold, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{thesis?.topic}</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{thesis?.text}</div>
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
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={startAuction} disabled={players.length < 2} style={{ ...bigBtn, opacity: players.length < 2 ? 0.5 : 1 }}>
              Assign Teams &amp; Start
            </motion.button>
          </div>
        )}

        {(phase === 'bidding' || phase === 'justify') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 800, color: C.gold, fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>{thesis?.topic}</div>
              <div style={{ color: C.text, fontSize: 14, lineHeight: 1.6 }}>{thesis?.text}</div>
            </div>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: C.muted, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 6 }}>
                {phase === 'bidding' ? 'Sealed Bidding' : 'Justify Won Cards'}
              </div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: 40, fontWeight: 900, color: remaining <= 15 ? C.sunset : C.gold }}>
                {formatTime(remaining)}
              </div>
              <div style={{ color: C.mid, fontSize: 13, marginTop: 8 }}>{submittedCount} / {totalTeams || teams.length} teams {phase === 'bidding' ? 'submitted' : 'finished'}</div>
            </div>
            <div style={{ ...card }}>
              <div style={{ fontWeight: 800, color: C.text, fontSize: 13, marginBottom: 10 }}>Teams ({teams.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {teams.map((t) => (
                  <div key={t.id} style={{ background: C.elevated, borderRadius: 8, padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {t.members.map((m) => (
                        <span key={m.id} style={{ color: C.mid, fontSize: 12, fontWeight: 700 }}>{m.name}</span>
                      ))}
                    </div>
                    <span style={{ color: C.gold, fontSize: 12.5, fontWeight: 800 }}>🪙 {t.coins}{t.wonCards ? ` · ${t.wonCards.length} cards won` : ''}</span>
                  </div>
                ))}
              </div>
            </div>
            <button onClick={skipStage} style={ghostBtn}>Skip Stage →</button>
          </div>
        )}

        {phase === 'grading' && (
          <div style={{ ...card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 16, color: C.gold }}>Scoring evidence justifications…</div>
          </div>
        )}

        {phase === 'results' && results && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ ...card, textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: C.gold, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Auction Complete</div>
            </div>
            {results.teams.map((t, i) => (
              <div key={t.id} style={{ ...card, border: `1px solid ${i === 0 ? C.pine + '70' : C.border}`, background: i === 0 ? `${C.pine}14` : C.card }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: C.gold, fontSize: 14 }}>
                    #{i + 1} · {t.id} {i === 0 ? '🏆' : ''}
                  </span>
                  <span style={{ color: C.mid, fontSize: 12.5, fontWeight: 800 }}>🪙 {t.finalCoins} ({t.coins} left + {t.coinsEarned} earned)</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                  {t.members.map((m) => (
                    <span key={m.id} style={{ color: C.muted, fontSize: 11.5 }}>{m.name}</span>
                  ))}
                </div>
                {t.wonCards.length === 0 ? (
                  <div style={{ color: C.muted, fontSize: 12.5 }}>Won no cards.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {t.wonCards.map((idx) => {
                      const cardData = results.cards.find((c) => c.index === idx);
                      const score = t.scores?.[idx];
                      return (
                        <div key={idx} style={{ background: C.elevated, borderRadius: 8, padding: 10 }}>
                          <div style={{ color: C.text, fontSize: 12.5, lineHeight: 1.5, marginBottom: 6 }}>{cardData?.text}</div>
                          <div style={{ color: C.mid, fontSize: 12, lineHeight: 1.5, fontStyle: 'italic', marginBottom: 6 }}>"{t.justifications?.[idx]}"</div>
                          {score && (
                            <div style={{ color: score.score >= 2 ? C.pine : C.sunset, fontSize: 11.5, fontWeight: 800 }}>
                              {score.score}/3 — {SCORE_LABEL[score.score]}: {score.feedback}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
