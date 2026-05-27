import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

const SUBJECT_LABELS = {
  ap_world_history_modern: 'AP World History',
  apush: 'APUSH',
  ap_gov: 'AP Gov',
  ap_human_geo: 'AP Human Geo',
  history: 'History',
  other: 'Other',
};

function subjectLabel(s) {
  return SUBJECT_LABELS[s] || s || 'General';
}

function StatCard({ value, label }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px 24px',
        flex: '1 1 140px',
        minWidth: 0,
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--gold)',
          lineHeight: 1,
          marginBottom: '6px',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SetCard({ set, onPractice }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          alignSelf: 'flex-start',
          background: 'rgba(245,166,35,0.1)',
          border: '1px solid rgba(245,166,35,0.25)',
          borderRadius: '20px',
          padding: '3px 10px',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--gold)',
          letterSpacing: '0.04em',
        }}
      >
        {subjectLabel(set.subject)}
      </div>

      <p
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '15px',
          fontWeight: 800,
          color: 'var(--text)',
          margin: 0,
          lineHeight: 1.35,
        }}
      >
        {set.title}
      </p>

      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
        {set.question_count || 0} questions
      </p>

      <motion.button
        className="btn-primary"
        style={{ fontSize: '13px', padding: '9px 18px', alignSelf: 'flex-start', marginTop: '4px' }}
        onClick={() => onPractice(set)}
        whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(245,166,35,0.35)' }}
        whileTap={{ scale: 0.97 }}
      >
        Practice →
      </motion.button>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const { navigate, user, setToken, setUser } = useApp();
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.name || user?.username || 'Student';

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api.get('/api/questions/sets')
      .then((data) => {
        if (!cancelled) {
          setSets(Array.isArray(data) ? data : data.sets || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 401) {
            setToken(null);
            setUser(null);
            navigate('landing');
          } else {
            setError(err.message || 'Failed to load question sets');
            setLoading(false);
          }
        }
      });
    return () => { cancelled = true; };
  }, [navigate, setToken, setUser]);

  const handleSignOut = useCallback(() => {
    setToken(null);
    setUser(null);
    navigate('landing');
  }, [navigate, setToken, setUser]);

  const handlePractice = useCallback((set) => {
    navigate('solo_game', { setId: set.id, setTitle: set.title });
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Nunito, sans-serif',
        overflowX: 'hidden',
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(15,23,32,0.85)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 20,
        }}
      >
        <span
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '20px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F5A623, #C8851A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.08em',
          }}
        >
          SUMMIT
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-mid)' }}>
            {displayName}
          </span>
          <button className="btn-ghost" style={{ padding: '8px 18px', fontSize: '13px' }} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      </nav>

      {/* Main */}
      <main
        style={{
          flex: 1,
          maxWidth: '860px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px 60px',
        }}
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '32px' }}
        >
          <h1
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 6px',
            }}
          >
            {greeting}, {displayName} 👋
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
            Ready to climb?
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
          style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}
        >
          <StatCard value={user?.xp ?? 0} label="XP Earned" />
          <StatCard value={user?.level ?? 1} label="Level" />
          <StatCard value="—" label="Sets Completed" />
        </motion.div>

        {/* Quick actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14, duration: 0.3 }}
          style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '44px' }}
        >
          <motion.button
            className="btn-primary"
            style={{ fontSize: '15px', padding: '13px 28px' }}
            onClick={() => navigate('student_join')}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 28px rgba(245,166,35,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            🏔️ Join a Live Game
          </motion.button>
        </motion.div>

        {/* Practice section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <h2
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 20px',
            }}
          >
            Practice Solo
          </h2>

          {loading && (
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Loading question sets…</p>
          )}

          {!loading && error && (
            <div
              style={{
                padding: '16px 20px',
                background: 'rgba(232,93,74,0.1)',
                border: '1px solid rgba(232,93,74,0.2)',
                borderRadius: '12px',
                color: 'var(--sunset, #E85D4A)',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {!loading && !error && sets.length === 0 && (
            <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>No question sets available yet.</p>
          )}

          {!loading && !error && sets.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '16px',
              }}
            >
              {sets.map((set) => (
                <SetCard key={set.id} set={set} onPractice={handlePractice} />
              ))}
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
