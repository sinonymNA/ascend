import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import ClassCard from '../components/teacher/ClassCard.jsx';
import Icon from '../components/ui/Icon.jsx';
import api from '../lib/api.js';

// ─── Decorative SVGs ──────────────────────────────────────────────────────────

function CornerMountain() {
  return (
    <svg
      width="220"
      height="150"
      viewBox="0 0 220 150"
      fill="none"
      style={{ position: 'fixed', bottom: 0, right: 0, opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      <polygon points="110,10 210,140 10,140" fill="#52B788" />
      <polygon points="110,10 140,55 80,55" fill="#E8F4F8" />
      <polygon points="0,140 50,100 100,120 110,112 120,120 170,98 220,140" fill="#1A2E20" />
    </svg>
  );
}

function EmptyMountainIllustration() {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" fill="none" aria-hidden="true">
      <polygon points="60,8 110,72 10,72" fill="#2D6A4F" opacity="0.4" />
      <polygon points="60,8 78,36 42,36" fill="#E8F4F8" opacity="0.5" />
      <polygon points="0,72 25,52 50,62 60,56 70,62 95,50 120,72" fill="#1A3D2E" opacity="0.4" />
    </svg>
  );
}

// ─── Avatar initial display ───────────────────────────────────────────────────

function UserAvatar({ name = '' }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Cinzel, serif',
        fontSize: '13px',
        fontWeight: 700,
        color: '#E8F4F8',
        flexShrink: 0,
        border: '2px solid var(--border-gold)',
      }}
    >
      {initials || '?'}
    </div>
  );
}

// ─── Quick Action Card ────────────────────────────────────────────────────────

function QuickActionCard({ icon, label, description, onClick, primary }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3, boxShadow: primary ? '0 8px 32px rgba(245,166,35,0.3)' : '0 4px 20px rgba(0,0,0,0.4)' }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18 }}
      style={{
        background: primary ? 'linear-gradient(135deg, #F5A623, #C8851A)' : 'var(--bg-card)',
        border: primary ? 'none' : '1px solid var(--border)',
        borderRadius: '16px',
        padding: '20px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        textAlign: 'left',
        flex: '1 1 180px',
        minWidth: 0,
      }}
    >
      <Icon name={icon} size={28} color={primary ? '#0F1720' : 'var(--gold)'} />
      <span
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '15px',
          fontWeight: 800,
          color: primary ? '#0F1720' : 'var(--text)',
          lineHeight: 1.2,
        }}
      >
        {label}
      </span>
      {description && (
        <span
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            color: primary ? 'rgba(15,23,32,0.65)' : 'var(--text-muted)',
            lineHeight: 1.4,
          }}
        >
          {description}
        </span>
      )}
    </motion.button>
  );
}

// ─── New Class Modal ──────────────────────────────────────────────────────────

const SUBJECTS = ['AP World History', 'APUSH', 'AP Gov', 'AP Human Geo', 'Other'];

function NewClassModal({ onClose, onCreated }) {
  const { token } = useApp();
  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('AP World History');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!className.trim()) return;
    setLoading(true);
    setError('');
    try {
      const newClass = await api.post('/api/classes', {
        name: className.trim(),
        subject,
      });
      onCreated(newClass);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  // Close on backdrop click
  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,16,26,0.75)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '18px',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.06em',
              margin: 0,
            }}
          >
            New Class
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
              padding: '4px',
            }}
            aria-label="Close"
          >
            <Icon name="xCircle" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label
              htmlFor="class-name"
              style={{
                display: 'block',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '8px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Class Name
            </label>
            <input
              id="class-name"
              className="input-field"
              type="text"
              placeholder="e.g. Period 3 AP World"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div>
            <label
              htmlFor="subject"
              style={{
                display: 'block',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                marginBottom: '8px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              Subject
            </label>
            <select
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              style={{
                background: 'var(--bg-mid, #162030)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                color: 'var(--text)',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '15px',
                padding: '12px 16px',
                width: '100%',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                WebkitAppearance: 'none',
              }}
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                color: 'var(--sunset, #E85D4A)',
                margin: 0,
                padding: '10px 14px',
                background: 'rgba(232,93,74,0.1)',
                borderRadius: '8px',
                border: '1px solid rgba(232,93,74,0.2)',
              }}
            >
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !className.trim()}
              style={{ flex: 1 }}
            >
              {loading ? 'Creating…' : 'Create Class'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Mock data for demo mode ──────────────────────────────────────────────────

const MOCK_CLASSES = [
  {
    id: 'demo-1',
    name: 'Period 2 AP World History',
    subject: 'AP World History',
    class_members: { count: 28 },
    last_activity: new Date(Date.now() - 86400000).toISOString(),
    class_code: 'APW2X',
  },
  {
    id: 'demo-2',
    name: 'Period 4 APUSH',
    subject: 'APUSH',
    class_members: { count: 31 },
    last_activity: new Date(Date.now() - 3 * 86400000).toISOString(),
    class_code: 'PUSH4K',
  },
];

// ─── Fade-up animation variant ────────────────────────────────────────────────

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// ─── TeacherDashboard ─────────────────────────────────────────────────────────

export default function TeacherDashboard() {
  const { navigate, token, user, setUser, setToken } = useApp();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showNewClass, setShowNewClass] = useState(false);
  const isDemoMode = !token;

  // Resolve greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const displayName = user?.name || user?.email?.split('@')[0] || 'Teacher';

  // Load classes on mount
  useEffect(() => {
    if (isDemoMode) {
      setClasses(MOCK_CLASSES);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    api
      .get('/api/classes')
      .then((data) => {
        if (!cancelled) {
          setClasses(Array.isArray(data) ? data : data.classes || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          if (err.status === 401) {
            navigate('landing');
          } else {
            setError(err.message || 'Failed to load classes');
          }
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token, isDemoMode, navigate]);

  const handleSignOut = useCallback(() => {
    setToken(null);
    setUser(null);
    navigate('landing');
  }, [navigate, setToken, setUser]);

  const handleClassCreated = (newClass) => {
    setClasses((prev) => [newClass, ...prev]);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Nunito, sans-serif',
        position: 'relative',
        overflowX: 'hidden',
      }}
    >
      <CornerMountain />

      {/* ── Demo Banner ── */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            style={{
              background: 'rgba(245,166,35,0.12)',
              borderBottom: '1px solid var(--border-gold)',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Icon name="eye" size={14} color="var(--gold)" /> Demo Mode — Sign in to save your progress
            </span>
            <button
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '13px' }}
              onClick={() => navigate('landing')}
            >
              Sign In
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Nav ── */}
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
          {!isDemoMode && (
            <>
              <UserAvatar name={displayName} />
              <span
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--text-mid)',
                }}
              >
                {displayName}
              </span>
              <button
                className="btn-ghost"
                style={{ padding: '8px 18px', fontSize: '13px' }}
                onClick={handleSignOut}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main
        style={{
          flex: 1,
          maxWidth: '960px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '36px' }}
        >
          <h1
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: 'clamp(24px, 4vw, 32px)',
              fontWeight: 800,
              color: 'var(--text)',
              margin: '0 0 6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {greeting}, {displayName} <Icon name="wave" size={28} color="var(--gold)" />
          </h1>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '15px',
              color: 'var(--text-muted)',
              margin: 0,
              fontWeight: 600,
            }}
          >
            What would you like to do today?
          </p>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          style={{ marginBottom: '48px' }}
        >
          <motion.div
            variants={fadeUp}
            style={{
              display: 'flex',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <QuickActionCard
              icon="mountain"
              label="Host a Live Game"
              description="Launch a session with your class"
              onClick={() => navigate('host_game')}
              primary
            />
            <QuickActionCard
              icon="book"
              label="Question Library"
              description="Browse Summit & your sets"
              onClick={() => navigate('library')}
            />
            <QuickActionCard
              icon="plus"
              label="Create Question Set"
              description="Build custom question sets"
              onClick={() => navigate('question_builder')}
            />
          </motion.div>
        </motion.div>

        {/* Classes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <h2
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text)',
                margin: 0,
              }}
            >
              My Classes
            </h2>
            <button
              className="btn-secondary"
              style={{ padding: '9px 20px', fontSize: '14px' }}
              onClick={() => setShowNewClass(true)}
            >
              + New Class
            </button>
          </div>

          {/* Loading */}
          {loading && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '60px 0',
                color: 'var(--text-muted)',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Loading classes…
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div
              style={{
                padding: '20px 24px',
                background: 'rgba(232,93,74,0.1)',
                border: '1px solid rgba(232,93,74,0.2)',
                borderRadius: '12px',
                color: 'var(--sunset, #E85D4A)',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && classes.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '64px 24px',
                border: '1px dashed var(--border)',
                borderRadius: '20px',
                textAlign: 'center',
              }}
            >
              <EmptyMountainIllustration />
              <p
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  margin: 0,
                  maxWidth: '300px',
                  lineHeight: 1.6,
                }}
              >
                No classes yet. Create your first class to get started.
              </p>
              <button
                className="btn-primary"
                style={{ fontSize: '14px', padding: '10px 24px' }}
                onClick={() => setShowNewClass(true)}
              >
                + Create First Class
              </button>
            </motion.div>
          )}

          {/* Class grid */}
          {!loading && !error && classes.length > 0 && (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '16px',
              }}
            >
              {classes.map((cls) => (
                <motion.div key={cls.id} variants={fadeUp}>
                  <ClassCard
                    name={cls.name}
                    subject={cls.subject}
                    studentCount={cls.class_members?.count ?? cls.student_count ?? 0}
                    lastActivity={cls.last_activity}
                    classCode={cls.class_code}
                    onClick={() =>
                      navigate('host_game', { classId: cls.id, className: cls.name })
                    }
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      {/* ── New Class Modal ── */}
      <AnimatePresence>
        {showNewClass && (
          <NewClassModal
            onClose={() => setShowNewClass(false)}
            onCreated={handleClassCreated}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
