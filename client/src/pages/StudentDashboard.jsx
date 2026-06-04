import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import ScorePrediction from '../components/score/ScorePrediction.jsx';
import AchievementToast from '../components/common/AchievementToast.jsx';
import SoundService from '../lib/sound.js';
import WalletPill from '../components/economy/WalletPill.jsx';
import Icon from '../components/ui/Icon.jsx';

const SAT_SETS = {
  sat_math: { id: '00000000-0000-0000-0000-000000000010', title: 'SAT Math', emoji: 'ruler' },
  sat_rw:   { id: '00000000-0000-0000-0000-000000000011', title: 'SAT Reading & Writing', emoji: 'edit' },
};

const ACT_SETS = {
  act_math:    { id: '00000000-0000-0000-0000-000000000020', title: 'ACT Math', emoji: 'ruler' },
  act_english: { id: '00000000-0000-0000-0000-000000000021', title: 'ACT English', emoji: 'edit' },
  act_reading: { id: '00000000-0000-0000-0000-000000000022', title: 'ACT Reading', emoji: 'book' },
  act_science: { id: '00000000-0000-0000-0000-000000000023', title: 'ACT Science', emoji: 'science' },
};

const CLIMBER_COLORS = [
  '#F5A623', '#52B788', '#4A90D9', '#E85D4A',
  '#A78BFA', '#F472B6', '#34D399', '#FBBF24',
  '#60A5FA', '#FB923C', '#C084FC', '#F0EDE6',
];

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
      marginBottom: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: '#F5A623' }}>
            Level {level}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{xp.toLocaleString()} XP</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {xpInLevel}/500 → Lv.{level + 1}
        </span>
      </div>
      <div style={{ position: 'relative', height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.3, duration: 0.7, ease: 'easeOut' }}
          style={{ height: '100%', background: 'linear-gradient(90deg, #2D6A4F, #F5A623)', borderRadius: '4px' }}
        />
        {/* Shimmer */}
        <div className="shimmer-bar" style={{ position: 'absolute', inset: 0, borderRadius: '4px' }} />
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
      padding: '14px 20px',
      marginBottom: '20px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>Weekly Goal</span>
        <span style={{ fontSize: '12px', color: pct >= 100 ? '#F5A623' : 'var(--text-muted)', fontWeight: 700 }}>
          {weeklyCount}/{WEEKLY_GOAL} questions
        </span>
      </div>
      <div style={{ height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
          style={{ height: '100%', background: pct >= 100 ? '#F5A623' : 'linear-gradient(90deg, #2D6A4F, #52B788)', borderRadius: '3px' }}
        />
      </div>
      {pct >= 100 && (
        <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#F5A623', fontWeight: 700 }}>Weekly goal reached!</p>
      )}
    </div>
  );
}

function SubjectCard({ subject, meta, progress, onClimb, index }) {
  const mastered = progress?.mastered_count || 0;
  const total = progress?.questions_total || 0;
  const streakBest = progress?.streak_best || 0;
  const lastDate = relativeDate(progress?.last_practiced_at);
  const pct = total > 0 ? Math.min(100, Math.round((mastered / total) * 100)) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(245,166,35,0.15)' }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        cursor: 'default',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Icon name={meta.emoji} size={28} color="#F5A623" />
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--text)', margin: '0 0 2px' }}>
            {meta.title}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
            {lastDate ? `Last: ${lastDate}` : 'Not started yet'}
          </p>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
            {mastered}{total > 0 ? `/${total}` : ''} mastered
          </span>
          {streakBest > 0 && (
            <span style={{ fontSize: '12px', color: '#F5A623', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}><Icon name="streak" size={12} color="#F5A623" /> {streakBest}</span>
          )}
        </div>
        <div style={{ position: 'relative', height: '6px', background: 'var(--bg)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: 0.3 + index * 0.07, duration: 0.6, ease: 'easeOut' }}
            style={{ height: '100%', background: pct > 0 ? 'linear-gradient(90deg, #2D6A4F, #F5A623)' : 'transparent', borderRadius: '3px' }}
          />
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

function LeaderboardTeaser({ navigate }) {
  const [topBoard, setTopBoard] = useState([]);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    api.get('/api/leaderboard/weekly')
      .then((data) => {
        setTopBoard((data.board || []).slice(0, 3));
        setUserRank(data.userRank || null);
      })
      .catch(() => {});
  }, []);

  if (!topBoard.length) return null;

  const MEDAL = [
    { name: 'medal', color: '#F5A623' },
    { name: 'medal', color: '#C0C7D0' },
    { name: 'medal', color: '#CD7F32' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>Weekly Leaderboard</span>
        <button
          onClick={() => navigate('leaderboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#F5A623', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}
        >
          View All →
        </button>
      </div>
      {topBoard.map((entry, i) => (
        <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: i < topBoard.length - 1 ? '1px solid var(--border)' : 'none' }}>
          <span style={{ width: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={MEDAL[i].name} size={16} color={MEDAL[i].color} fill={`${MEDAL[i].color}40`} /></span>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: entry.climber_color || '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#0F1720', flexShrink: 0 }}>
            {(entry.username || '?')[0].toUpperCase()}
          </div>
          <span style={{ flex: 1, fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{entry.username}</span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#F5A623' }}>{entry.weekly_xp} XP</span>
        </div>
      ))}
      {userRank && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>
          Your rank: #{userRank} this week
        </div>
      )}
    </motion.div>
  );
}

function ClimberCustomization({ user, onColorChange }) {
  const [open, setOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#F5A623');
  const [saving, setSaving] = useState(false);
  const level = user?.level || 1;

  useEffect(() => {
    api.get('/api/users/me/customization').catch(() => null).then((data) => {
      if (data?.color) setSelectedColor(data.color);
    });
  }, []);

  const handleColorSelect = async (color, unlockLevel) => {
    if (level < unlockLevel) return;
    setSelectedColor(color);
    setSaving(true);
    try {
      await api.patch('/api/users/me/customization', { color });
      onColorChange(color);
    } catch (_) {}
    setSaving(false);
  };

  const COLORS_WITH_LEVELS = [
    { color: '#F5A623', level: 1 },
    { color: '#52B788', level: 1 },
    { color: '#4A90D9', level: 1 },
    { color: '#E85D4A', level: 2 },
    { color: '#A78BFA', level: 3 },
    { color: '#F472B6', level: 3 },
    { color: '#34D399', level: 5 },
    { color: '#FBBF24', level: 5 },
    { color: '#60A5FA', level: 7 },
    { color: '#FB923C', level: 7 },
    { color: '#C084FC', level: 10 },
    { color: '#F0EDE6', level: 10 },
  ];

  return (
    <div style={{ marginBottom: '20px' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '14px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '12px',
          fontFamily: 'Nunito, sans-serif',
        }}
      >
        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: selectedColor, border: '2px solid rgba(255,255,255,0.2)', flexShrink: 0 }} />
        <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)', flex: 1, textAlign: 'left' }}>Climber Color</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{open ? '▲' : '▼'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderTop: 'none', borderBottomLeftRadius: '14px', borderBottomRightRadius: '14px',
              padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {COLORS_WITH_LEVELS.map(({ color, level: reqLevel }) => {
                  const locked = level < reqLevel;
                  const active = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color, reqLevel)}
                      title={locked ? `Unlock at Level ${reqLevel}` : color}
                      style={{
                        position: 'relative',
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: locked ? 'var(--bg)' : color,
                        border: active ? '3px solid #F5A623' : '2px solid rgba(255,255,255,0.1)',
                        cursor: locked ? 'not-allowed' : 'pointer',
                        opacity: locked ? 0.45 : 1,
                        transition: 'transform 0.15s, border-color 0.15s',
                      }}
                    >
                      {locked && (
                        <span style={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 800,
                          fontFamily: 'Nunito, sans-serif',
                        }}>
                          {reqLevel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {saving && (
                <p style={{ margin: '10px 0 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Saving…</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Streak toast — shown once per new day login
function StreakToast({ streak, onDone }) {
  useEffect(() => {
    SoundService.play('daily-login');
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.92 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'fixed', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)',
        borderRadius: '16px', padding: '16px 28px', zIndex: 9000,
        display: 'flex', alignItems: 'center', gap: '14px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        minWidth: '260px',
      }}
    >
      <Icon name="streak" size={32} color="#F5A623" />
      <div>
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: '#F5A623' }}>
          Day {streak} Streak!
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>
          Keep the momentum going
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { navigate, user, setToken, setUser } = useApp();
  const [tab, setTab] = useState('sat');
  const [progress, setProgress] = useState({});
  const [progressList, setProgressList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyCount, setWeeklyCount] = useState(0);
  const [showStreakToast, setShowStreakToast] = useState(false);
  const [pendingAchievements, setPendingAchievements] = useState([]);
  const [climberColor, setClimberColor] = useState('#F5A623');
  const streakCheckedRef = useRef(false);

  const displayName = user?.name || user?.username || 'Student';
  const loginStreak = user?.login_streak || 0;

  useEffect(() => {
    setWeeklyCount(parseInt(localStorage.getItem(getWeekKey()) || '0', 10));
  }, []);

  // Check for new day streak toast from screenParams (set by App.jsx after auth/me)
  useEffect(() => {
    if (streakCheckedRef.current) return;
    streakCheckedRef.current = true;
    const streakUpdate = window.__summitStreakUpdate;
    if (streakUpdate?.isNewDay && (user?.login_streak || 0) > 0) {
      setShowStreakToast(true);
      window.__summitStreakUpdate = null;
    }
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    api.get('/api/progress/solo')
      .then((data) => {
        if (cancelled) return;
        const list = data.progress || [];
        setProgressList(list);
        const map = {};
        list.forEach((row) => { map[row.set_id] = row; });
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
    SoundService.play('click');
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
        padding: '14px 24px',
        borderBottom: '1px solid var(--border)',
        background: 'rgba(15,23,32,0.9)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 20,
        gap: '12px',
      }}>
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '18px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #F5A623, #C8851A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.08em',
          flexShrink: 0,
        }}>SUMMIT</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {/* Streak flame */}
          {loginStreak > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              style={{
                background: 'rgba(245,166,35,0.12)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: '20px',
                padding: '4px 10px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#F5A623',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Icon name="streak" size={14} color="#F5A623" /> {loginStreak}
            </motion.div>
          )}

          {/* Wallet */}
          <WalletPill onClick={() => { SoundService.play('click'); navigate('shop'); }} />

          {/* Quests */}
          <button onClick={() => navigate('quests')} title="Daily Quests"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px 6px', lineHeight: 1, display: 'flex', alignItems: 'center' }}>
            <Icon name="clipboard" size={18} />
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => navigate('leaderboard')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: '4px 6px', lineHeight: 1, display: 'flex', alignItems: 'center',
            }}
            title="Leaderboard"
          >
            <Icon name="trophy" size={18} />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              SoundService.play('click');
              navigate('settings');
            }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
              padding: '4px 6px', lineHeight: 1, display: 'flex', alignItems: 'center',
            }}
            title="Settings"
          >
            <Icon name="settings" size={18} />
          </button>

          <div style={{
            background: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.25)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '13px',
            fontWeight: 700,
            color: '#F5A623',
            flexShrink: 0,
          }}>
            Lv.{user?.level || 1} · {displayName}
          </div>

          <button
            className="btn-ghost"
            style={{ padding: '7px 14px', fontSize: '13px', flexShrink: 0 }}
            onClick={handleSignOut}
          >
            Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: '860px', width: '100%', margin: '0 auto', padding: '28px 20px 60px' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <XPBar xp={user?.xp || 0} level={user?.level || 1} />
          <WeeklyGoal weeklyCount={weeklyCount} />

          {/* Score Prediction */}
          {!loading && progressList.length > 0 && (
            <ScorePrediction
              progress={progressList.map((p) => ({
                set_subject: Object.entries({
                  '00000000-0000-0000-0000-000000000010': 'sat_math',
                  '00000000-0000-0000-0000-000000000011': 'sat_rw',
                  '00000000-0000-0000-0000-000000000020': 'act_math',
                  '00000000-0000-0000-0000-000000000021': 'act_english',
                  '00000000-0000-0000-0000-000000000022': 'act_reading',
                  '00000000-0000-0000-0000-000000000023': 'act_science',
                }).find(([id]) => id === p.set_id)?.[1] || p.set_id,
                mastered_count: p.mastered_count || 0,
                questions_total: p.questions_total || 200,
              }))}
              onImprove={() => {
                SoundService.play('click');
                // find weakest subject and jump to it
                const weakest = progressList.reduce((a, b) =>
                  (a.mastered_count / (a.questions_total || 1)) < (b.mastered_count / (b.questions_total || 1)) ? a : b
                , progressList[0]);
                if (weakest) {
                  const allSets = { ...SAT_SETS, ...ACT_SETS };
                  const entry = Object.entries(allSets).find(([, m]) => m.id === weakest.set_id);
                  if (entry) navigate('solo_game', { setId: entry[1].id, setTitle: entry[1].title, subject: entry[0] });
                }
              }}
            />
          )}
        </motion.div>

        {/* Leaderboard teaser */}
        <LeaderboardTeaser navigate={navigate} />

        {/* Test tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', background: 'var(--bg-elevated)', borderRadius: '12px', padding: '4px', border: '1px solid var(--border)', width: 'fit-content' }}>
          {[{ key: 'sat', label: 'SAT' }, { key: 'act', label: 'ACT' }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{
                padding: '8px 28px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                fontSize: '14px', fontWeight: 700,
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {Object.entries(currentSets).map(([subject, meta], i) => (
              <SubjectCard
                key={subject}
                subject={subject}
                meta={meta}
                progress={progress[meta.id]}
                onClimb={handleClimb}
                index={i}
              />
            ))}
          </div>
        )}

        {/* EduMissions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          style={{ marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '0.04em' }}>
              ⚔ EduMissions
            </h3>
            <button onClick={() => navigate('summit_home')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#C8A96E', fontWeight: 700, fontFamily: 'Nunito, sans-serif' }}>
              All games →
            </button>
          </div>
          <motion.button
            whileHover={{ y: -3, boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(200,169,110,0.2)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('summit_home')}
            style={{
              width: '100%', background: 'linear-gradient(135deg, #1a1208, #2a1f0a)',
              border: '1px solid rgba(200,169,110,0.3)',
              borderRadius: '14px', padding: '18px 20px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left',
              fontFamily: 'Nunito, sans-serif',
            }}
          >
            <div style={{
              width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
              background: 'linear-gradient(135deg, #8B6914, #C8A96E)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '24px', boxShadow: '0 6px 16px rgba(139,105,20,0.5)',
            }}>⚔</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: '#C8A96E', marginBottom: '4px' }}>
                Chronicles of the Keep
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
                Story-driven ACT English · 22 chapters · 445 encounters
              </div>
            </div>
            <div style={{ fontSize: '18px', color: 'rgba(200,169,110,0.5)', flexShrink: 0 }}>→</div>
          </motion.button>
        </motion.div>

        {/* Game Modes */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '15px', fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '0.04em' }}>
              Game Modes
            </h3>
            <button onClick={() => navigate('season')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#F5A623', fontWeight: 700, fontFamily: 'Nunito, sans-serif', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Icon name="ticket" size={14} color="#F5A623" /> Season Pass →
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            {[
              { key: 'blitz_game', emoji: 'boost', name: 'Blitz', desc: '60s coin rush', color: '#FBBF24' },
              { key: 'boss_game', emoji: 'boss', name: 'Boss Climb', desc: 'Win a rare pack', color: '#E85D4A' },
              { key: 'block_blast', emoji: 'puzzle', name: 'Block Blast', desc: 'Puzzle + quiz', color: '#A78BFA' },
            ].map((m, i) => {
              const firstSet = Object.values(currentSets)[0];
              return (
                <motion.button
                  key={m.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { SoundService.play('click'); navigate(m.key, { setId: firstSet.id, setTitle: firstSet.title }); }}
                  style={{
                    background: 'var(--bg-elevated)', border: `1px solid ${m.color}55`,
                    borderRadius: '16px', padding: '18px 14px', cursor: 'pointer',
                    textAlign: 'center', fontFamily: 'Nunito, sans-serif',
                    boxShadow: `0 0 18px ${m.color}22`,
                  }}
                >
                  <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'center' }}><Icon name={m.emoji} size={32} color={m.color} /></div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>{m.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{m.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Climber customization */}
        <ClimberCustomization user={user} onColorChange={setClimberColor} />

        {/* League + Bottom actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <button className="btn-ghost" style={{ fontSize: '14px', padding: '11px 24px', borderColor: 'var(--border-gold)', color: '#F5A623', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={() => navigate('leagues')}>
            <Icon name="medal" size={16} color="#F5A623" fill="rgba(245,166,35,0.25)" /> View League
          </button>
        </div>

        {/* Bottom actions */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            className="btn-ghost"
            style={{ fontSize: '14px', padding: '11px 24px' }}
            onClick={() => navigate('student_join')}
          >
            Join a Live Game
          </button>
          {!user?.diagnostic_done && (
            <button
              className="btn-ghost"
              style={{ fontSize: '14px', padding: '11px 24px', borderColor: 'var(--border-gold)', color: '#F5A623' }}
              onClick={() => navigate('diagnostic')}
            >
              Take Diagnostic Quiz →
            </button>
          )}
        </div>
      </main>

      {/* Achievement toasts */}
      <AnimatePresence>
        {pendingAchievements.length > 0 && (
          <AchievementToast
            achievement={pendingAchievements[0]}
            onDone={() => setPendingAchievements((prev) => prev.slice(1))}
          />
        )}
      </AnimatePresence>

      {/* Streak toast */}
      <AnimatePresence>
        {showStreakToast && (
          <StreakToast streak={loginStreak} onDone={() => setShowStreakToast(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
