import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import SoundService from '../lib/sound.js';

const TABS = [
  { key: 'weekly',   label: '🌎 Weekly Global' },
  { key: 'friends',  label: '👥 Friends' },
  { key: 'subject',  label: '📚 By Subject' },
];

const SUBJECT_OPTIONS = [
  { id: '00000000-0000-0000-0000-000000000010', label: 'SAT Math' },
  { id: '00000000-0000-0000-0000-000000000011', label: 'SAT Reading & Writing' },
  { id: '00000000-0000-0000-0000-000000000020', label: 'ACT Math' },
  { id: '00000000-0000-0000-0000-000000000021', label: 'ACT English' },
  { id: '00000000-0000-0000-0000-000000000022', label: 'ACT Reading' },
  { id: '00000000-0000-0000-0000-000000000023', label: 'ACT Science' },
];

const MEDAL = { 0: '🥇', 1: '🥈', 2: '🥉' };

function RankRow({ rank, entry, isYou, stat, statLabel }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: Math.min(rank * 0.04, 0.5) }}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px',
        background: isYou ? 'rgba(245,166,35,0.08)' : 'transparent',
        border: isYou ? '1px solid var(--border-gold)' : '1px solid transparent',
        borderRadius: '12px',
        marginBottom: '4px',
      }}
    >
      {/* Rank */}
      <div style={{ width: '28px', textAlign: 'center', flexShrink: 0 }}>
        {rank < 3 ? (
          <span style={{ fontSize: '20px' }}>{MEDAL[rank]}</span>
        ) : (
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>#{rank + 1}</span>
        )}
      </div>

      {/* Avatar dot */}
      <div style={{
        width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
        background: entry.climber_color || '#F5A623',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', fontWeight: 800, color: '#0F1720',
        border: isYou ? '2px solid var(--gold)' : 'none',
      }}>
        {(entry.username || entry.name || '?')[0].toUpperCase()}
      </div>

      {/* Name + level */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: isYou ? 'var(--gold)' : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.username || entry.name} {isYou && '(you)'}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          Level {entry.level}
        </div>
      </div>

      {/* Stat */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: '15px', fontWeight: 800, color: isYou ? 'var(--gold)' : 'var(--text)' }}>
          {stat}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{statLabel}</div>
      </div>
    </motion.div>
  );
}

export default function Leaderboard() {
  const { navigate, user } = useApp();
  const [tab, setTab] = useState('weekly');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECT_OPTIONS[0].id);
  const [board, setBoard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [selfEntry, setSelfEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState('');
  const [addingFriend, setAddingFriend] = useState(false);
  const [friendMsg, setFriendMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    let url;
    if (tab === 'weekly')   url = '/api/leaderboard/weekly';
    if (tab === 'friends')  url = '/api/leaderboard/weekly/friends';
    if (tab === 'subject')  url = `/api/leaderboard/subject/${selectedSubject}`;

    api.get(url)
      .then((data) => {
        setBoard(data.board || []);
        setUserRank(data.userRank || null);
        setSelfEntry(data.self || null);
      })
      .catch(() => setBoard([]))
      .finally(() => setLoading(false));
  }, [tab, selectedSubject]);

  const addFriend = async () => {
    if (!friendUsername.trim()) return;
    setAddingFriend(true);
    setFriendMsg('');
    try {
      const data = await api.post(`/api/friends/${friendUsername.trim()}`);
      setFriendMsg(`✓ Added ${data.friend.username}!`);
      SoundService.play('achievement');
      setFriendUsername('');
    } catch (e) {
      setFriendMsg(e.message || 'User not found');
    } finally {
      setAddingFriend(false);
    }
  };

  const statFor = (entry) => {
    if (tab === 'subject') return { val: entry.mastered_count || 0, label: 'mastered' };
    return { val: entry.weekly_xp || 0, label: 'XP this week' };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Nunito, sans-serif', padding: '0 0 40px' }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '16px 20px', background: 'rgba(15,23,32,0.9)',
        backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          fontSize: '14px', fontWeight: 700, cursor: 'pointer',
          fontFamily: 'Nunito, sans-serif',
        }}>← Back</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', flex: 1 }}>
          Leaderboard
        </span>
      </div>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: tab === t.key ? 'var(--gold)' : 'var(--bg-elevated)',
                color: tab === t.key ? '#0F1720' : 'var(--text-muted)',
                border: 'none', borderRadius: '20px',
                padding: '8px 16px', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
                fontFamily: 'Nunito, sans-serif',
                transition: 'background 0.18s, color 0.18s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Subject selector */}
        {tab === 'subject' && (
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', marginBottom: '16px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: '12px', color: 'var(--text)', fontSize: '14px',
              fontFamily: 'Nunito, sans-serif', cursor: 'pointer',
            }}
          >
            {SUBJECT_OPTIONS.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        )}

        {/* Add friend (friends tab) */}
        {tab === 'friends' && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              value={friendUsername}
              onChange={(e) => setFriendUsername(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addFriend()}
              placeholder="Add friend by username…"
              style={{
                flex: 1, padding: '10px 14px', background: 'var(--bg-elevated)',
                border: '1px solid var(--border)', borderRadius: '12px',
                color: 'var(--text)', fontSize: '14px', fontFamily: 'Nunito, sans-serif',
              }}
            />
            <button
              onClick={addFriend}
              disabled={addingFriend}
              style={{
                background: 'var(--gold)', color: '#0F1720',
                border: 'none', borderRadius: '12px', padding: '10px 18px',
                fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
              }}
            >
              Add
            </button>
          </div>
        )}
        {friendMsg && (
          <div style={{ fontSize: '13px', fontWeight: 700, color: friendMsg.startsWith('✓') ? '#52B788' : '#E85D4A', marginBottom: '12px' }}>
            {friendMsg}
          </div>
        )}

        {/* Board */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: 600 }}>
            Loading…
          </div>
        ) : board.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {tab === 'friends' ? 'No friends yet — add one above!' : 'No data yet. Start climbing!'}
          </div>
        ) : (
          <div>
            {board.map((entry, i) => {
              const isYou = entry.id === user?.id;
              const s = statFor(entry);
              return <RankRow key={entry.id} rank={i} entry={entry} isYou={isYou} stat={s.val} statLabel={s.label} />;
            })}

            {/* Sticky "you are #N" if not in top 50 */}
            {userRank && userRank > 50 && selfEntry && (
              <div style={{ position: 'sticky', bottom: '8px', marginTop: '16px' }}>
                <RankRow rank={userRank - 1} entry={selfEntry} isYou stat={statFor(selfEntry).val} statLabel={statFor(selfEntry).label} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
