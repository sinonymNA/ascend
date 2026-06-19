'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import { connectSocket, disconnectSocket } from '../lib/socket.js';
import { GW } from '../lib/guidedWalkTheme.js';
import { GwButton } from '../components/write/gwShared.jsx';
import Clio from '../components/write/Clio.jsx';

// ── The Relay — Student view (screen "relay_play") ──────────────────────────
// Join via room code → assigned to a team of 3 with a role (Claim, Evidence,
// or Context) → hand off one LEQ paragraph across three timed stages → see
// the compiled paragraph graded as a team.

const ROLE_LABEL = { claim: 'Claim (Thesis)', evidence: 'Evidence + Reasoning', context: 'Contextualization' };
const STAGE_LABEL = { claim: 'Claim (Thesis)', evidence: 'Evidence + Reasoning', context: 'Contextualization', grading: 'Grading…' };
const ROLE_PROMPT_TEXT = {
  claim: 'Write ONLY a defensible thesis that responds to the prompt and previews your line of reasoning. Don\'t add evidence yet.',
  evidence: 'Your teammate\'s thesis is shown below. Write the evidence and historical reasoning that supports it — be specific (names, dates, events).',
  context: 'The full paragraph so far is shown below. Write ONLY the contextualization — describe the broader historical situation surrounding this argument.',
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
      }}>The Relay</div>
      <div style={{ width: 60 }} />
    </div>
  );
}

function JoinPhase({ onJoin, loading, error }) {
  const [code, setCode] = useState('');
  return (
    <div style={{ maxWidth: 420, margin: '0 auto', padding: '14vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🏃</div>
      <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(26px, 6vw, 38px)', color: GW.ink, margin: '0 0 12px', fontWeight: 800 }}>
        The Relay
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

function StagePhase({ stage, role, prompt, endsAt, teammates, claimText, evidenceText, contextText, submitted, submissionUpdate, onSubmit }) {
  const [text, setText] = useState('');
  const remaining = useCountdown(endsAt);
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;
  const isActive = role === stage;

  useEffect(() => {
    if (isActive && remaining === 0 && !submittedRef.current) onSubmit(text);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining, isActive]);

  const priorParagraph = [
    stage === 'evidence' ? claimText : null,
    stage === 'context' ? claimText : null,
    stage === 'context' ? evidenceText : null,
  ].filter(Boolean).join(' ');

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '5vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: GW.amber, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{STAGE_LABEL[stage]}</div>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, fontSize: 22, color: remaining <= 15 ? GW.rose : GW.amber }}>{formatTime(remaining)}</div>
      </div>

      <div style={{
        background: GW.parchmentDark, border: `1px solid ${GW.amber}30`, borderRadius: 12,
        padding: '14px 16px',
      }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 11, color: GW.amber, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>{prompt?.topic}</div>
        <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif' }}>{prompt?.text}</div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {teammates?.map((m) => (
          <span key={m.id} style={{
            background: m.role === stage ? `${GW.sage}25` : `${GW.amber}10`,
            border: `1px solid ${m.role === stage ? GW.sage : GW.amber}40`,
            borderRadius: 8, padding: '4px 10px', fontSize: 11.5, fontWeight: 700,
            color: m.role === stage ? GW.sage : GW.inkSoft,
          }}>{m.name} · {ROLE_LABEL[m.role]}</span>
        ))}
      </div>

      {priorParagraph && (
        <div style={{
          background: `${GW.amber}0a`, border: `1px dashed ${GW.amber}40`, borderRadius: 12,
          padding: '12px 16px', color: GW.ink, fontSize: 13, lineHeight: 1.55, fontFamily: 'Georgia, serif',
        }}>{priorParagraph}</div>
      )}

      {isActive ? (
        submitted ? (
          <div style={{ textAlign: 'center', padding: '24px 20px' }}>
            <div style={{ fontSize: 30, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.ink }}>Submitted!</div>
            <div style={{ color: GW.inkSoft, fontSize: 12.5, marginTop: 6 }}>
              Waiting for other teams… {submissionUpdate ? `(${submissionUpdate.submittedCount}/${submissionUpdate.totalTeams})` : ''}
            </div>
          </div>
        ) : (
          <>
            <div style={{ color: GW.inkSoft, fontSize: 12.5, fontStyle: 'italic' }}>{ROLE_PROMPT_TEXT[stage]}</div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={stage === 'evidence' ? 6 : 4}
              style={{
                width: '100%', boxSizing: 'border-box', resize: 'vertical', padding: '14px 16px',
                borderRadius: 12, border: `1px solid ${GW.amber}30`, background: GW.parchment,
                color: GW.ink, fontSize: 14, fontFamily: 'Georgia, serif', lineHeight: 1.55, outline: 'none',
              }}
            />
            <GwButton onClick={() => onSubmit(text)} disabled={!text.trim()}>Submit</GwButton>
          </>
        )
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 20px' }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>⏳</div>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.ink }}>
            Waiting on your teammate's {ROLE_LABEL[stage]}…
          </div>
          <div style={{ color: GW.inkSoft, fontSize: 12.5, marginTop: 6 }}>You're up next if you haven't gone yet.</div>
        </div>
      )}
    </div>
  );
}

function GradingPhase() {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '20vh 20px 100px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>🧮</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 16, color: GW.ink }}>Grading the compiled paragraphs…</div>
    </div>
  );
}

function ResultsPhase({ results, award, onBack }) {
  if (!results) return null;
  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '6vh 20px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', marginBottom: 4 }}>
        <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 13, color: GW.amber, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 6 }}>
          Relay Complete
        </div>
        {award?.xpGain > 0 && (
          <div style={{ fontSize: 15, fontWeight: 800, color: GW.sage, marginTop: 6 }}>
            {award.isTop ? `🏃 Top team! +${award.xpGain} XP` : `+${award.xpGain} XP`}
          </div>
        )}
      </div>

      {results.teams.map((t, i) => (
        <div key={t.id} style={{
          background: i === 0 ? `${GW.sage}1a` : GW.parchmentDark,
          border: `1px solid ${i === 0 ? GW.sage : GW.amber}40`,
          borderRadius: 10, padding: '12px 16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontFamily: 'Cinzel, serif', fontWeight: 900, color: GW.amber, fontSize: 13 }}>
              #{i + 1} · {t.id} {i === 0 ? '🏆' : ''}
            </span>
            <span style={{ color: GW.inkSoft, fontSize: 12, fontWeight: 800 }}>{t.totalScore} pts ({t.score}/{t.maxScore} + {t.cohesionBonus} cohesion)</span>
          </div>
          <div style={{ color: GW.ink, fontSize: 13.5, lineHeight: 1.55, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
            {[t.claimText, t.evidenceText, t.contextText].filter(Boolean).join(' ')}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {t.members.map((m) => (
              <span key={m.id} style={{ color: GW.inkSoft, fontSize: 11.5 }}>{m.name} ({ROLE_LABEL[m.role]})</span>
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

export default function RelayPlay() {
  const { navigate, user, token } = useApp();
  const [phase, setPhase] = useState('join'); // join | lobby | claim | evidence | context | grading | results
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [prompt, setPrompt] = useState(null);
  const [players, setPlayers] = useState([]);
  const [role, setRole] = useState(null);
  const [teammates, setTeammates] = useState([]);
  const [claimText, setClaimText] = useState(null);
  const [evidenceText, setEvidenceText] = useState(null);
  const [contextText, setContextText] = useState(null);
  const [stageEndsAt, setStageEndsAt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submissionUpdate, setSubmissionUpdate] = useState(null);
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

    socket.on('rl:lobby_update', (data) => {
      setLoading(false);
      setRoomCode(code);
      setPrompt(data.prompt || null);
      setPlayers(data.players || []);
      if (data.status === 'lobby') setPhase('lobby');
    });

    socket.on('rl:player_joined', (p) => {
      setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
    });

    socket.on('rl:your_role', (data) => {
      setRole(data.role);
      setTeammates(data.teammates || []);
      setClaimText(data.claimText);
      setEvidenceText(data.evidenceText);
      setContextText(data.contextText);
    });

    const enterStage = (stage, endsAt) => {
      setStageEndsAt(endsAt);
      setSubmitted(false);
      setSubmissionUpdate(null);
      setPhase(stage);
    };
    socket.on('rl:phase_claim', (data) => { setPrompt((prev) => data.prompt || prev); enterStage('claim', data.endsAt); });
    socket.on('rl:phase_evidence', (data) => enterStage('evidence', data.endsAt));
    socket.on('rl:phase_context', (data) => enterStage('context', data.endsAt));
    socket.on('rl:phase_grading', () => setPhase('grading'));

    socket.on('rl:submit_ack', () => setSubmitted(true));
    socket.on('rl:submission_update', (data) => setSubmissionUpdate(data));

    socket.on('rl:phase_results', (data) => {
      setResults(data);
      setPhase('results');
    });

    socket.on('rl:your_award', (data) => setAward(data.award ? { ...data.award, isTop: data.isTop } : null));

    socket.on('rl:ended', () => setError('The teacher ended the game.'));

    socket.on('rl:error', (data) => {
      setLoading(false);
      setError(data.message);
    });

    socket.emit('rl:join', { roomCode: code, name: user?.name || 'Student', studentId: user?.id });
  }, [token, user]);

  const onSubmitStage = useCallback((text) => {
    const event = phase === 'claim' ? 'rl:submit_claim' : phase === 'evidence' ? 'rl:submit_evidence' : 'rl:submit_context';
    socketRef.current?.emit(event, { roomCode, text });
  }, [roomCode, phase]);

  return (
    <div style={{ minHeight: '100vh', background: GW.parchment }}>
      <Header onBack={onBack} />
      {error && phase === 'join' && (
        <div style={{ textAlign: 'center', color: GW.rose, fontWeight: 700, padding: 20 }}>{error}</div>
      )}
      {phase === 'join' && <JoinPhase onJoin={onJoin} loading={loading} error={error} />}
      {phase === 'lobby' && <LobbyPhase prompt={prompt} players={players} />}
      {(phase === 'claim' || phase === 'evidence' || phase === 'context') && (
        <StagePhase
          stage={phase} role={role} prompt={prompt} endsAt={stageEndsAt}
          teammates={teammates} claimText={claimText} evidenceText={evidenceText} contextText={contextText}
          submitted={submitted} submissionUpdate={submissionUpdate} onSubmit={onSubmitStage}
        />
      )}
      {phase === 'grading' && <GradingPhase />}
      {phase === 'results' && <ResultsPhase results={results} award={award} onBack={onBack} />}
      <Clio
        text={
          phase === 'join' ? "Enter your teacher's room code to join the round." :
          phase === 'claim' ? 'Make a defensible claim — your teammates build on it.' :
          phase === 'evidence' ? 'Specificity wins: named people, places, dates.' :
          phase === 'context' ? 'Zoom out — what broader process surrounds this argument?' :
          phase === 'results' ? (award?.isTop ? 'Your team set the standard this round!' : 'Compare your paragraph to the top team\'s — what made theirs cohesive?') :
          ''
        }
        state={phase === 'results' && award?.isTop ? 'celebrating' : 'idle'}
      />
    </div>
  );
}
