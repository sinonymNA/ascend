import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import Mountain from '../components/mountain/Mountain.jsx';
import Icon from '../components/ui/Icon.jsx';

// ─── Medal colors ─────────────────────────────────────────────────────────────
const MEDAL = {
  0: { bg: 'rgba(245,166,35,0.18)', border: 'rgba(245,166,35,0.6)', color: '#F5A623', label: <Icon name="medal" size={18} color="#F5A623" fill="#F5A623" /> },
  1: { bg: 'rgba(168,184,200,0.18)', border: 'rgba(168,184,200,0.5)', color: '#A8B8C8', label: <Icon name="medal" size={18} color="#C0C7D0" fill="#C0C7D0" /> },
  2: { bg: 'rgba(180,120,80,0.18)',  border: 'rgba(180,120,80,0.5)',  color: '#B47850', label: <Icon name="medal" size={18} color="#CD7F32" fill="#CD7F32" /> },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadCSV(players) {
  const header = 'Name,Mastered,XP,Elevation %';
  const rows = players.map(
    (p) => `"${p.name}",${p.mastered || 0},${p.xp || 0},${Math.round(p.elevation || 0)}`
  );
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `summit-results-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function ElevationMini({ pct, color = 'var(--pine-light)' }) {
  return (
    <div style={{ width: '80px', height: '6px', background: 'var(--bg-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct || 0)}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ height: '100%', background: color, borderRadius: '3px' }}
      />
    </div>
  );
}

// ─── TEACHER RESULTS ──────────────────────────────────────────────────────────

function TeacherResults({ gameState, navigate }) {
  const players   = useMemo(() => gameState?.players || [], [gameState]);
  const questions = useMemo(() => gameState?.questions || [], [gameState]);
  const insights  = gameState?.insights;

  // Sort: summited first (by mastered desc), then by elevation desc
  const sorted = useMemo(() => {
    return [...players].sort((a, b) => {
      const aSummited = a.summited || (a.elevation || 0) >= 100;
      const bSummited = b.summited || (b.elevation || 0) >= 100;
      if (aSummited && !bSummited) return -1;
      if (!aSummited && bSummited)  return 1;
      // Both summited or neither: sort by mastered desc then XP desc
      const mDiff = (b.mastered || 0) - (a.mastered || 0);
      if (mDiff !== 0) return mDiff;
      return (b.xp || 0) - (a.xp || 0);
    });
  }, [players]);

  const summited  = sorted.filter((p) => p.summited || (p.elevation || 0) >= 100);
  const climbers  = sorted.filter((p) => !(p.summited || (p.elevation || 0) >= 100));

  // Mountain players
  const mountainPlayers = players.map((p) => ({
    id:        p.id || p.name,
    name:      p.name,
    elevation: p.elevation || 0,
    summited:  p.summited || (p.elevation || 0) >= 100,
    color:     p.summited || (p.elevation || 0) >= 100 ? '#F5A623' : '#52B788',
  }));

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: 'Nunito, sans-serif',
        padding: '0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Hero header ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(15,23,32,1) 0%, rgba(30,45,64,0.8) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 32px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle radial glow */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 0%, rgba(45,106,79,0.18) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="cinzel"
          style={{
            fontSize: 'clamp(24px, 5vw, 42px)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F5A623, #C8851A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            marginBottom: '6px',
          }}
        >
          The Climb is Complete
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600 }}
        >
          {players.length} climber{players.length !== 1 ? 's' : ''} · {questions.length} question{questions.length !== 1 ? 's' : ''}
        </motion.p>
      </div>

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 45%) 1fr',
          gap: '0',
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          padding: '0',
          alignItems: 'start',
        }}
      >
        {/* Mountain column */}
        <div
          style={{
            padding: '24px',
            borderRight: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            maxHeight: '100vh',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Final Positions
              </span>
            </div>
            <Mountain
              players={mountainPlayers}
              highlightId={null}
              showLabels
              interactive
            />
          </div>
        </div>

        {/* Results column */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Summited section */}
          {summited.length > 0 && (
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{ fontSize: '20px', display: 'inline-flex', alignItems: 'center' }}><Icon name="mountain" size={20} color="#F5A623" /></span>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--gold)', margin: 0 }}>
                  Summited — {summited.length} student{summited.length !== 1 ? 's' : ''}
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {summited.map((p, i) => (
                  <LeaderboardRow key={p.id || p.name} player={p} rank={i} totalQ={questions.length} medal={MEDAL[i]} />
                ))}
              </div>
            </section>
          )}

          {/* Climbers section */}
          {climbers.length > 0 && (
            <section>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                Still Climbing
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {climbers.map((p, i) => (
                  <LeaderboardRow key={p.id || p.name} player={p} rank={summited.length + i} totalQ={questions.length} />
                ))}
              </div>
            </section>
          )}

          {/* Insights */}
          {insights && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon name="chart" size={16} /> Class Insights
              </h3>
              {insights.struggled && (
                <InsightRow icon={<Icon name="warning" size={13} color="#E85D4A" />} label="Your class struggled most with:" value={insights.struggled} color="var(--sunset)" />
              )}
              {insights.mastered && (
                <InsightRow icon={<Icon name="check" size={13} color="#52B788" />} label="Your class mastered:" value={insights.mastered} color="var(--pine-light)" />
              )}
              {insights.suggestedReview?.length > 0 && (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px' }}>
                    Suggested Review
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {insights.suggestedReview.map((q, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: '13px',
                          color: 'var(--text-mid)',
                          fontWeight: 600,
                          padding: '6px 10px',
                          background: 'rgba(240,237,230,0.03)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      >
                        {i + 1}. {q.text?.length > 80 ? q.text.slice(0, 78) + '…' : q.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.section>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => downloadCSV(players)}
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              ↓ Export CSV
            </button>
            <button
              onClick={() => navigate('host_game')}
              className="btn-primary"
            >
              Play Again
            </button>
            <button
              onClick={() => navigate('teacher_dashboard')}
              className="btn-ghost"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InsightRow({ icon, label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {icon} {label}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 700, color }}>{value}</span>
    </div>
  );
}

function LeaderboardRow({ player, rank, totalQ, medal }) {
  const elevation = Math.round(player.elevation || 0);
  const mastered  = player.mastered  || 0;
  const xp        = player.xp        || 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.04, duration: 0.24 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 14px',
        background: medal ? medal.bg : 'var(--bg-card)',
        border: `1px solid ${medal ? medal.border : 'var(--border)'}`,
        borderRadius: '12px',
      }}
    >
      {/* Rank */}
      <div
        style={{
          width: '28px',
          flexShrink: 0,
          textAlign: 'center',
          fontSize: medal ? '18px' : '14px',
          fontWeight: 700,
          color: medal ? medal.color : 'var(--text-muted)',
        }}
      >
        {medal ? medal.label : rank + 1}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: medal ? medal.color : 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {player.name}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {mastered}/{totalQ || '?'} mastered
        </div>
      </div>

      {/* XP */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px' }}>
          <Icon name="boost" size={13} color="#F5A623" /> {xp}
        </div>
        <ElevationMini pct={elevation} color={medal ? medal.color : 'var(--pine-light)'} />
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
          {elevation}%
        </div>
      </div>
    </motion.div>
  );
}

// ─── STUDENT RESULTS ──────────────────────────────────────────────────────────

function StudentResults({ gameState, user, navigate }) {
  const [expandHistory, setExpandHistory] = useState(false);

  const playerName     = gameState?.playerName || user?.name || 'You';
  const finalElevation = gameState?.finalElevation ?? gameState?.elevation ?? 0;
  const finalXP        = gameState?.finalXP       ?? gameState?.xp ?? 0;
  const bestStreak     = gameState?.bestStreak     || 0;
  const masteredCount  = gameState?.masteredCount  || 0;
  const totalQuestions = gameState?.totalQuestions || gameState?.questions?.length || 0;
  const levelXP        = gameState?.levelXP        || 0;
  const xpToNextLevel  = gameState?.xpToNextLevel  || 500;
  const questionHistory = gameState?.questionHistory || [];

  const mountainPlayers = [
    {
      id:        'player',
      name:      playerName,
      elevation: finalElevation,
      summited:  finalElevation >= 100,
      color:     '#F5A623',
    },
  ];

  const stats = [
    {
      label: 'Questions Mastered',
      value: `${masteredCount} / ${totalQuestions || '?'}`,
      icon:  <Icon name="mountain" size={22} color="var(--pine-light)" />,
      color: 'var(--pine-light)',
    },
    {
      label: 'XP Earned',
      value: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{finalXP} <Icon name="boost" size={20} color="#F5A623" /></span>),
      icon:  <Icon name="boost" size={22} color="var(--gold)" />,
      color: 'var(--gold)',
    },
    {
      label: 'Best Streak',
      value: (<span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>{bestStreak} <Icon name="streak" size={20} color="#FF7043" /></span>),
      icon:  <Icon name="streak" size={22} color="#FF7043" />,
      color: '#FF7043',
    },
    {
      label: 'Level Progress',
      value: `+${levelXP} XP`,
      icon:  <Icon name="trending" size={22} color="var(--text-mid)" />,
      color: 'var(--text-mid)',
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: 'Nunito, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 0 40px',
      }}
    >
      {/* Hero */}
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, var(--bg) 0%, rgba(30,45,64,0.6) 100%)',
          borderBottom: '1px solid var(--border)',
          padding: '40px 24px 32px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 30%, rgba(245,166,35,0.08) 0%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ fontSize: '48px', marginBottom: '12px' }}
        >
          {finalElevation >= 100
            ? <Icon name="trophy" size={48} color="#F5A623" fill="#F5A623" />
            : <Icon name="mountain" size={48} color="#52B788" />}
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="cinzel"
          style={{
            fontSize: 'clamp(22px, 5vw, 34px)',
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: '6px',
            letterSpacing: '0.06em',
          }}
        >
          {finalElevation >= 100 ? 'Summit Reached!' : 'Your Climb'}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}
        >
          {playerName} · {Math.round(finalElevation)}% elevation
        </motion.p>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Personal mountain */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            overflow: 'hidden',
            height: '220px',
          }}
        >
          <Mountain
            players={mountainPlayers}
            highlightId="player"
            showLabels
            interactive={false}
          />
        </div>

        {/* 2×2 stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.07 }}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <div style={{ fontSize: '22px', fontWeight: 800, color: s.color, lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {s.label}
              </div>
              {s.label === 'Level Progress' && xpToNextLevel > 0 && (
                <div
                  style={{
                    marginTop: '6px',
                    height: '4px',
                    background: 'var(--bg-elevated)',
                    borderRadius: '2px',
                    overflow: 'hidden',
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, (levelXP / xpToNextLevel) * 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.7 }}
                    style={{ height: '100%', background: 'var(--text-mid)', borderRadius: '2px' }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Question history */}
        {questionHistory.length > 0 && (
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setExpandHistory((v) => !v)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                borderBottom: expandHistory ? '1px solid var(--border)' : 'none',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>
                Your Climb — {questionHistory.length} question{questionHistory.length !== 1 ? 's' : ''}
              </span>
              <motion.span
                animate={{ rotate: expandHistory ? 180 : 0 }}
                style={{ color: 'var(--text-muted)', fontSize: '14px' }}
              >
                ▼
              </motion.span>
            </button>

            <AnimatePresence>
              {expandHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ overflow: 'hidden' }}
                >
                  {questionHistory.map((q, i) => (
                    <QuestionHistoryRow key={q.id || i} q={q} index={i} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={() => navigate('student_join')}
          className="btn-secondary"
          style={{ width: '100%' }}
        >
          Back to Join
        </button>
      </div>
    </div>
  );
}

function QuestionHistoryRow({ q, index }) {
  const statusColor =
    q.mastered    ? 'var(--pine-light)' :
    q.gotRight    ? '#F5A623' :
    'var(--sunset)';

  const statusIcon =
    q.mastered    ? <Icon name="check" size={16} color={statusColor} /> :
    q.gotRight    ? <Icon name="checkCircle" size={16} color={statusColor} /> :
    <Icon name="xCircle" size={16} color={statusColor} />;

  const truncatedText = q.text
    ? q.text.length > 70 ? q.text.slice(0, 68) + '…' : q.text
    : `Question ${index + 1}`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <span style={{ fontSize: '16px', flexShrink: 0, lineHeight: 1.4 }}>{statusIcon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 3px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--text-mid)',
            lineHeight: 1.45,
          }}
        >
          {truncatedText}
        </p>
        {q.correctAnswer && (
          <p style={{ margin: 0, fontSize: '12px', color: statusColor, fontWeight: 700 }}>
            Correct: {q.correctAnswer}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Results (router) ─────────────────────────────────────────────────────────

export default function Results() {
  const { user, gameState, navigate } = useApp();
  const isTeacher = user?.role === 'teacher';

  if (!gameState) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
          flexDirection: 'column',
          gap: '16px',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        <div style={{ fontSize: '36px', display: 'flex' }}><Icon name="mountain" size={36} color="#52B788" /></div>
        <p style={{ color: 'var(--text-muted)', fontSize: '16px', fontWeight: 600 }}>
          No game data available.
        </p>
        <button
          onClick={() => navigate('landing')}
          className="btn-secondary"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (isTeacher) {
    return <TeacherResults gameState={gameState} navigate={navigate} />;
  }

  return <StudentResults gameState={gameState} user={user} navigate={navigate} />;
}
