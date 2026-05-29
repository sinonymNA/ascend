import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

const SAT_SETS = {
  sat_math: { id: '00000000-0000-0000-0000-000000000010', title: 'SAT Math', emoji: '📐' },
  sat_rw:   { id: '00000000-0000-0000-0000-000000000011', title: 'SAT Reading & Writing', emoji: '📝' },
};

const ACT_SETS = {
  act_math:    { id: '00000000-0000-0000-0000-000000000020', title: 'ACT Math', emoji: '📐' },
  act_english: { id: '00000000-0000-0000-0000-000000000021', title: 'ACT English', emoji: '✏️' },
  act_reading: { id: '00000000-0000-0000-0000-000000000022', title: 'ACT Reading', emoji: '📖' },
  act_science: { id: '00000000-0000-0000-0000-000000000023', title: 'ACT Science', emoji: '🔬' },
};

const WEEKLY_GOAL = 50;

function getWeekKey() {
  const d = new Date();
  const day = d.getDay() || 7;
  const monday = new Date(d);
  monday.setDate(d.getDate() - day + 1);
  return `summit_weekly_${monday.getFullYear()}-${monday.getMonth()}-${monday.getDate()}`;
}

function relativeDate(dateStr) {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function XPBar({ xp = 0, level = 1 }) {
  const xpInLevel = xp % 500;
  const pct = Math.round((xpInLevel / 500) * 100);
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: '#F5A623' }}>
            Level {level}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{xp} XP</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {xpInLevel}/500 → Lv.{level + 1}
        </span>
      </div>
      <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #2D6A4F, #F5A623)', borderRadius: '4px' }}
        />
      </div>
    </div>
  );
}

function WeeklyGoal({ weeklyCount }) {
  const pct = Math.min(100, Math.round((weeklyCount / WEEKLY_GOAL) * 100));
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '28px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>🎯 Weekly Goal</span>
        <span style={{ fontSize: '13px', color: pct >= 100 ? '#F5A623' : 'var(--text-muted)', fontWeight: 700 }}>
          {weeklyCount}/{WEEKLY_GOAL} questions
        </span>
      </div>
      <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: pct >= 100 ? '#F5A623' : 'linear-gradient(90deg, #2D6A4F, #52B788)', borderRadius: '4px' }}
        />
      </div>
      {pct >= 100 && (
        <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#F5A623', fontWeight: 700 }}>✨ Weekly goal reached!</p>
      )}
    </div>
  );
}

function SubjectCard({ subject, meta, progress, onClimb }) {
  const mastered = progress?.mastered_count || 0;
  const total = progress?.questions_total || 0;
  const streakBest = progress?.streak_best || 0;
  const lastDate = relativeDate(progress?.last_practiced_at);
  const pct = total > 0 ? Math.min(100, Math.round((mastered / total) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <span style={{ fontSize: '28px', flexShrink: 0 }}>{meta.emoji}</span>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--text)', margin: '0 0 2px' }}>
            {meta.title}
          </p>
          {lastDate ? (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
              Last practiced: {lastDate}
            </p>
          ) : (
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
              Not started yet
            </p>
          )}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
            {mastered}{total > 0 ? `/${total}` : ''} mastered
          </span>
          {streakBest > 0 && (
            <span style={{ fontSize: '12px', color: '#F5A623', fontWeight: 700 }}>🔥 {streakBest} streak</span>
          )}
        </div>
        <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <div style={{
            height: '100%',
            width: `${pct}%`,
            background: pct > 0 ? 'linear-gradient(90deg, #2D6A4F, #F5A623)' : 'transparent',
            borderRadius: '3px',
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      <motion.button
        className="btn-primary"
        style={{ fontSize: '13px', padding: '10px 18px', alignSelf: 'flex-start' }}
        onClick={() => onClimb(subject, meta)}
        whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(245,166,35,0.35)' }}
        whileTap={{ scale: 0.97 }}
      >
        Continue Climbing →
      </motion.button>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { navigate, user, setToken, setUser } = useApp();
  const [tab, setTab] = useState('sat');
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [weeklyCount, setWeeklyCount] = useState(0);

  const displayName = user?.name || user?.username || 'Student';

  useEffect(() => {
    setWeeklyCount(parseInt(localStorage.getItem(getWeekKey()) || '0', 10));
  }, []);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/progress/solo')
      .then((data) => {
        if (cancelled) return;
        const map = {};
        (data.progress || []).forEach((row) => { map[row.set_id] = row; });
        setProgress(map);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 401) { setToken(null); setUser(null); navigate('landing'); }
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [navigate, setToken, setUser]);

  const handleSignOut = useCallback(() => {
    setToken(null); setUser(null); navigate('landing');
  }, [navigate, setToken, setUser]);

  const handleClimb = useCallback((subject, meta) => {
    navigate('solo_game', { setId: meta.id, setTitle: meta.title, subject });
  }, [navigate]);

  const currentSets = tab === 'sat' ? SAT_SETS : ACT_SETS;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Nunito, sans-serif',
      overflowX: 'hidden',
    }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15,23,32,0.88)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '20px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #F5A623, #C8851A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.08em',
        }}>SUMMIT</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.25)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#F5A623',
          }}>
            Lv.{user?.level || 1} · {displayName}
          </div>
          <button className="btn-ghost" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '860px', width: '100%', margin: '0 auto', padding: '36px 24px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <XPBar xp={user?.xp || 0} level={user?.level || 1} />
          <WeeklyGoal weeklyCount={weeklyCount} />
        </motion.div>

        {/* Test tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', background: 'var(--bg-elevated)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border)', width: 'fit-content' }}>
          {[{ key: 'sat', label: 'SAT' }, { key: 'act', label: 'ACT' }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 28px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                fontWeight: 700,
                transition: 'background 0.18s, color 0.18s',
                background: tab === key ? '#F5A623' : 'transparent',
                color: tab === key ? '#0F1720' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Subject cards */}
        {loading ? (
          <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading progress…</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' }}>
            {Object.entries(currentSets).map(([subject, meta]) => (
              <SubjectCard
                key={subject}
                subject={subject}
                meta={meta}
                progress={progress[meta.id]}
                onClimb={handleClimb}
              />
            ))}
          </div>
        )}

        {/* Join live game */}
        <div style={{ textAlign: 'center' }}>
          <button
            className="btn-ghost"
            style={{ fontSize: '14px', padding: '11px 24px' }}
            onClick={() => navigate('student_join')}
          >
            🏔️ Join a Live Game
          </button>
        </div>
      </main>
    </div>
  );
}
