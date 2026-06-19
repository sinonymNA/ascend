'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket } from '../lib/socket.js';
import { useApp } from '../App.jsx';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';
import Clio from '../components/write/Clio.jsx';

// ── Evidence Auction — Student view (screen "auction_play") ─────────────────
// Join via room code → assigned to a team → sealed-bid on 12 evidence cards
// with a shared 100-coin budget → justify the cards your team won → see AI
// scores and final coin totals.

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
      }}>Evidence Auction</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function JoinPhase({ onJoin, loading, error }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '14vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🪙</div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 6vw, 38px)', color: GW.ink, margin: '0 0 12px', fontWeight: 800 }}>
        Evidence Auction
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

function LobbyPhase({ thesis, players }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '12vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🕯️</div>
      <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: GW.ink, fontWeight: 800, marginBottom: 10 }}>
        Waiting for the teacher to start…
      </h2>
      {thesis && (
        <div style={{
          background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12,
          padding: '16px 18px', marginBottom: 18, textAlign: 'left',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{thesis.topic}</div>
          <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif' }}>{thesis.text}</div>
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

function BiddingPhase({ thesis, cards, endsAt, coins, submitted, submissionUpdate, onSubmit }) {
  const [bids, setBids] = useState({});
  const remaining = useCountdown(endsAt);
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;

  const total = Object.values(bids).reduce((s, v) => s + (Number(v) || 0), 0);
  const over = total > coins;

  useEffect(() => {
    if (remaining === 0 && !submittedRef.current) onSubmit(bids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining]);

  const setBid = (idx, val) => {
    const amt = Math.max(0, Math.round(Number(val) || 0));
    setBids((prev) => ({ ...prev, [idx]: amt }));
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '4vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Sealed-Bid Auction</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: remaining <= 15 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>

      <div style={{
        background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12, padding: '14px 16px',
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>Thesis — {thesis?.topic}</div>
        <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif' }}>{thesis?.text}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
        <span style={{ fontSize: 12.5, color: GW.inkSoft, fontWeight: 700 }}>Bid on cards you think best support the thesis</span>
        <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 15, color: over ? GW.rose : GW.ink }}>{total} / {coins} 🪙</span>
      </div>

      {submitted ? (
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>✅</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.ink }}>Bids sealed!</div>
          <div style={{ color: GW.inkSoft, fontSize: 12.5, marginTop: 6 }}>
            Waiting for other teams… {submissionUpdate ? `(${submissionUpdate.submittedCount}/${submissionUpdate.totalTeams})` : ''}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {cards.map((c) => (
              <div key={c.index} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: GW.parchment, border: `1px solid ${GW.amber}25`, borderRadius: 10, padding: '10px 12px',
              }}>
                <div style={{ flex: 1, color: GW.ink, fontSize: 12.5, lineHeight: 1.5, fontFamily: 'Georgia, serif' }}>{c.text}</div>
                <input
                  type="number" min="0" step="5" value={bids[c.index] || ''}
                  onChange={(e) => setBid(c.index, e.target.value)}
                  placeholder="0"
                  style={{
                    width: 60, boxSizing: 'border-box', textAlign: 'center', padding: '8px 6px',
                    borderRadius: 8, border: `1px solid ${GW.amber}40`, background: GW.parchmentDark,
                    color: GW.ink, fontWeight: 800, fontSize: 13, outline: 'none', flexShrink: 0,
                  }}
                />
              </div>
            ))}
          </div>
          {over && <div style={{ color: GW.rose, fontWeight: 700, fontSize: 12.5, textAlign: 'center' }}>Total bids can't exceed your {coins}-coin budget.</div>}
          <GwButton onClick={() => onSubmit(bids)} disabled={over || total === 0}>Seal Bids</GwButton>
        </>
      )}
    </div>
  );
}

function JustifyPhase({ thesis, cards, endsAt, wonCards, justifications, justifiedSet, justifyProgress, onSubmit }) {
  const [drafts, setDrafts] = useState({});
  const remaining = useCountdown(endsAt);

  if (wonCards.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '18vh 20px 100px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🫙</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 16, color: GW.ink }}>Your team won no cards this round.</div>
        <div style={{ color: GW.inkSoft, fontSize: 12.5, marginTop: 6 }}>Waiting for grading to begin…</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '4vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Justify Your Evidence</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: remaining <= 15 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>
      <div style={{ color: GW.inkSoft, fontSize: 12.5, fontStyle: 'italic' }}>For each card your team bought, explain — specifically — how it supports the thesis: "{thesis?.text}"</div>

      {wonCards.map((idx) => {
        const card = cards.find((c) => c.index === idx);
        const done = justifiedSet.has(idx) || !!justifications[idx];
        return (
          <div key={idx} style={{
            background: GW.parchmentDark, border: `1px solid ${done ? GW.sage : GW.amber}40`, borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ color: GW.ink, fontSize: 13, lineHeight: 1.5, fontFamily: 'Georgia, serif', marginBottom: 10 }}>{card?.text}</div>
            {done ? (
              <div style={{ color: GW.sage, fontWeight: 700, fontSize: 12.5 }}>✅ Justification submitted</div>
            ) : (
              <>
                <textarea
                  value={drafts[idx] || ''}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [idx]: e.target.value }))}
                  rows={3}
                  placeholder="How does this evidence support the thesis? Be specific."
                  style={{
                    width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '10px 12px',
                    borderRadius: 10, border: `1px solid ${GW.amber}30`, background: GW.parchment,
                    color: GW.ink, fontSize: 13, fontFamily: 'Georgia, serif', lineHeight: 1.5, outline: 'none', marginBottom: 8,
                  }}
                />
                <GwButton onClick={() => onSubmit(idx, drafts[idx] || '')} disabled={!(drafts[idx] || '').trim()}>Submit</GwButton>
              </>
            )}
          </div>
        );
      })}

      {justifyProgress && (
        <div style={{ textAlign: 'center', color: GW.inkSoft, fontSize: 12, fontWeight: 700 }}>
          {justifyProgress.completedTeams}/{justifyProgress.totalTeams} teams finished
        </div>
      )}
    </div>
  );
}

function GradingPhase() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 16, color: GW.ink }}>Scoring your evidence connections…</div>
    </div>
  );
}

function ResultsPhase({ results, award, onBack }) {
  if (!results) return null;
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: GW.amber, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Auction Complete
        </div>
        {award?.xpGain > 0 && (
          <div style={{ fontSize: 15, fontWeight: 800, color: GW.sage, marginTop: 6 }}>
            {award.isTop ? `🪙 Most coins! +${award.xpGain} XP` : `+${award.xpGain} XP`}
          </div>
        )}
      </div>

      {results.teams.map((t, i) => (
        <div key={t.id} style={{
          background: i === 0 ? `${GW.sage}1a` : GW.parchmentDark,
          border: `1px solid ${i === 0 ? GW.sage : GW.amber}40`,
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: GW.amber, fontSize: 13 }}>
              #{i + 1} · {t.id} {i === 0 ? '🏆' : ''}
            </span>
            <span style={{ color: GW.inkSoft, fontSize: 12, fontWeight: 800 }}>{t.finalCoins} 🪙 ({t.coins} left + {t.coinsEarned} earned)</span>
          </div>
          {t.wonCards.map((idx) => {
            const card = results.cards.find((c) => c.index === idx);
            const score = t.scores[idx];
            return (
              <div key={idx} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${GW.amber}15` }}>
                <div style={{ color: GW.ink, fontSize: 12, lineHeight: 1.4, fontFamily: 'Georgia, serif', marginBottom: 4 }}>{card?.text}</div>
                <div style={{ color: GW.inkSoft, fontSize: 11.5, fontStyle: 'italic', marginBottom: 4 }}>"{t.justifications[idx]}"</div>
                {score && (
                  <div style={{ color: score.score >= 2 ? GW.sage : GW.rose, fontSize: 11.5, fontWeight: 700 }}>
                    {score.score}/3 — {score.feedback}
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {t.members.map((m) => (
              <span key={m.id} style={{ color: GW.inkSoft, fontSize: 11.5 }}>{m.name}</span>
            ))}
          </div>
        </div>
      ))}

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <GwButton onClick={onBack}>Back</GwButton>
      </div>
    </div>
  );
}

export default function AuctionPlay() {
  const { navigate, user, token } = useApp();
  const [phase, setPhase] = useState('join'); // join | lobby | bidding | justify | grading | results
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [thesis, setThesis] = useState(null);
  const [players, setPlayers] = useState([]);
  const [cards, setCards] = useState([]);
  const [coins, setCoins] = useState(100);
  const [myTeamId, setMyTeamId] = useState(null);
  const [stageEndsAt, setStageEndsAt] = useState(null);
  const [bidSubmitted, setBidSubmitted] = useState(false);
  const [submissionUpdate, setSubmissionUpdate] = useState(null);
  const [wonCards, setWonCards] = useState([]);
  const [justifications, setJustifications] = useState({});
  const [justifiedSet, setJustifiedSet] = useState(new Set());
  const [justifyProgress, setJustifyProgress] = useState(null);
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

    socket.on('ea:lobby_update', (data) => {
      setLoading(false);
      setRoomCode(code);
      setThesis(data.thesis || null);
      setPlayers(data.players || []);
      if (data.status === 'lobby') setPhase('lobby');
    });

    socket.on('ea:player_joined', (p) => {
      setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
    });

    socket.on('ea:teams_assigned', (data) => {
      const mine = (data.teams || []).find((t) => t.members.some((m) => m.id === user?.id));
      setMyTeamId(mine?.id || null);
      setCoins(mine?.coins ?? 100);
    });

    socket.on('ea:phase_bidding', (data) => {
      setThesis((prev) => data.thesis || prev);
      setCards(data.cards || []);
      setStageEndsAt(data.endsAt);
      if (typeof data.coins === 'number') setCoins(data.coins);
      else if (data.startingCoins) setCoins(data.startingCoins);
      setBidSubmitted(false);
      setSubmissionUpdate(null);
      setPhase('bidding');
    });

    socket.on('ea:phase_justify', (data) => {
      setThesis((prev) => data.thesis || prev);
      setCards((prev) => (data.cards && data.cards.length ? data.cards : prev));
      setStageEndsAt(data.endsAt);
      if (data.wonCards) setWonCards(data.wonCards);
      if (data.justifications) setJustifications(data.justifications);
      setJustifyProgress(null);
      setPhase('justify');
    });

    socket.on('ea:justify_progress', (data) => setJustifyProgress(data));

    socket.on('ea:submit_ack', (data) => {
      if (data.stage === 'bidding') setBidSubmitted(true);
      if (data.stage === 'justify' && typeof data.cardIndex === 'number') {
        setJustifiedSet((prev) => new Set([...prev, data.cardIndex]));
      }
    });

    socket.on('ea:submission_update', (data) => setSubmissionUpdate(data));

    socket.on('ea:phase_grading', () => setPhase('grading'));

    socket.on('ea:phase_results', (data) => {
      setResults(data);
      setPhase('results');
    });

    socket.on('ea:your_award', (data) => setAward(data.award ? { ...data.award, isTop: data.isTop } : null));

    socket.on('ea:ended', () => setError('The teacher ended the game.'));

    socket.on('ea:error', (data) => {
      setLoading(false);
      setError(data.message);
    });

    socket.emit('ea:join', { roomCode: code, name: user?.name || 'Student', studentId: user?.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user]);

  // Track which cards my own team won, resolved against the latest myTeamId.
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handler = (data) => {
      const mine = (data.teams || []).find((t) => t.id === myTeamId);
      if (mine) {
        setWonCards(mine.wonCards || []);
        setCoins(mine.coins ?? 0);
      }
    };
    socket.on('ea:auction_resolved', handler);
    return () => socket.off('ea:auction_resolved', handler);
  }, [myTeamId]);

  const onSubmitBid = useCallback((bids) => {
    socketRef.current?.emit('ea:submit_bid', { roomCode, bids });
  }, [roomCode]);

  const onSubmitJustification = useCallback((cardIndex, text) => {
    setJustifications((prev) => ({ ...prev, [cardIndex]: text }));
    socketRef.current?.emit('ea:submit_justification', { roomCode, cardIndex, text });
  }, [roomCode]);

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <Header onBack={onBack} />
      {error && phase === 'join' && (
        <div style={{ textAlign: 'center', color: GW.rose, fontWeight: 700, padding: 20 }}>{error}</div>
      )}
      {phase === 'join' && <JoinPhase onJoin={onJoin} loading={loading} error={error} />}
      {phase === 'lobby' && <LobbyPhase thesis={thesis} players={players} />}
      {phase === 'bidding' && (
        <BiddingPhase
          thesis={thesis} cards={cards} endsAt={stageEndsAt} coins={coins}
          submitted={bidSubmitted} submissionUpdate={submissionUpdate} onSubmit={onSubmitBid}
        />
      )}
      {phase === 'justify' && (
        <JustifyPhase
          thesis={thesis} cards={cards} endsAt={stageEndsAt} wonCards={wonCards}
          justifications={justifications} justifiedSet={justifiedSet} justifyProgress={justifyProgress}
          onSubmit={onSubmitJustification}
        />
      )}
      {phase === 'grading' && <GradingPhase />}
      {phase === 'results' && <ResultsPhase results={results} award={award} onBack={onBack} />}
      <Clio
        text={
          phase === 'join' ? "Enter your teacher's room code to join the round." :
          phase === 'bidding' ? "Don't just bid on the longest cards — read for specificity and relevance." :
          phase === 'justify' ? 'Name the connection: who, what, when, and why it proves your thesis.' :
          phase === 'results' ? (award?.isTop ? 'Your team spent its coins wisely!' : 'Compare your justifications to the top team\'s — what made theirs more specific?') :
          ''
        }
        state={phase === 'results' && award?.isTop ? 'celebrating' : 'idle'}
      />
    </div>
  );
}
