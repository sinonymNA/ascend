import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

// ─── Decorative SVG ───────────────────────────────────────────────────────────

function CornerMountain() {
  return (
    <svg
      width="200"
      height="130"
      viewBox="0 0 200 130"
      fill="none"
      style={{ position: 'fixed', bottom: 0, right: 0, opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      <polygon points="100,10 190,120 10,120" fill="#52B788" />
      <polygon points="100,10 128,52 72,52" fill="#E8F4F8" />
      <polygon points="0,120 50,88 90,105 100,98 110,105 155,86 200,120" fill="#1A2E20" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SUBJECTS = ['All', 'AP World History', 'APUSH', 'AP Gov', 'AP Human Geo'];

const SUBJECT_COLORS = {
  'AP World History': { bg: 'rgba(45,106,79,0.25)', text: '#52B788' },
  APUSH: { bg: 'rgba(45,107,138,0.25)', text: '#5BB8D4' },
  'AP Gov': { bg: 'rgba(107,78,138,0.25)', text: '#A57DD8' },
  'AP Human Geo': { bg: 'rgba(138,107,45,0.25)', text: '#D4A55B' },
  Other: { bg: 'rgba(74,85,104,0.25)', text: '#9BB0C4' },
};

const DIFF_COLORS = { easy: '#52B788', medium: '#F5A623', hard: '#E85D4A' };

// ─── Mock library data ────────────────────────────────────────────────────────

const MOCK_SUMMIT_SETS = [
  {
    id: 'sum-1', title: 'Unit 1: The Global Tapestry', subject: 'AP World History',
    unit: 1, question_count: 20, is_summit_library: true,
    difficulty_distribution: { easy: 6, medium: 10, hard: 4 },
    questions: [
      { id: 'q1', question_text: 'Which empire most directly influenced the spread of Buddhism along trade routes before 1200 CE?', stimulus: 'The Silk Roads connected civilizations from China to the Mediterranean…', difficulty: 'medium', tags: ['trade', 'Buddhism'] },
      { id: 'q2', question_text: 'Confucian social hierarchy primarily emphasized which of the following values?', stimulus: null, difficulty: 'easy', tags: ['Confucianism', 'society'] },
      { id: 'q3', question_text: 'The Abbasid Caliphate differed from the Umayyad Caliphate primarily in its…', stimulus: 'The Abbasid revolution of 750 CE brought significant changes to Islamic governance…', difficulty: 'hard', tags: ['Islam', 'empires'] },
    ],
  },
  {
    id: 'sum-2', title: 'Unit 2: Networks of Exchange', subject: 'AP World History',
    unit: 2, question_count: 22, is_summit_library: true,
    difficulty_distribution: { easy: 5, medium: 12, hard: 5 },
    questions: [],
  },
  {
    id: 'sum-3', title: 'Unit 3: Land-Based Empires', subject: 'AP World History',
    unit: 3, question_count: 18, is_summit_library: true,
    difficulty_distribution: { easy: 4, medium: 9, hard: 5 },
    questions: [],
  },
  {
    id: 'sum-4', title: 'Unit 4: Maritime Empires', subject: 'AP World History',
    unit: 4, question_count: 24, is_summit_library: true,
    difficulty_distribution: { easy: 6, medium: 12, hard: 6 },
    questions: [],
  },
  {
    id: 'sum-5', title: 'Unit 1: Colonial Foundations', subject: 'APUSH',
    unit: 1, question_count: 18, is_summit_library: true,
    difficulty_distribution: { easy: 7, medium: 8, hard: 3 },
    questions: [],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SubjectBadge({ subject }) {
  const c = SUBJECT_COLORS[subject] || SUBJECT_COLORS.Other;
  return (
    <span
      style={{
        display: 'inline-block',
        background: c.bg,
        color: c.text,
        fontSize: '11px',
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: '20px',
        letterSpacing: '0.02em',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      {subject || 'Other'}
    </span>
  );
}

function DifficultyDots({ distribution = {} }) {
  const { easy = 0, medium = 0, hard = 0 } = distribution;
  const total = easy + medium + hard;
  const dots = [
    ...Array(Math.min(easy, 4)).fill('easy'),
    ...Array(Math.min(medium, 4)).fill('medium'),
    ...Array(Math.min(hard, 4)).fill('hard'),
  ].slice(0, 8);

  return (
    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }} title={`Easy: ${easy} · Medium: ${medium} · Hard: ${hard}`}>
      {dots.map((d, i) => (
        <div
          key={i}
          style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: DIFF_COLORS[d],
            opacity: 0.85,
          }}
        />
      ))}
      {total > 8 && (
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: 'var(--text-muted)', marginLeft: '2px' }}>
          +{total - 8}
        </span>
      )}
    </div>
  );
}

// ─── Pro Upgrade Modal ────────────────────────────────────────────────────────

function ProUpgradeModal({ onClose }) {
  const { token } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/payments/create-checkout', { plan: 'pro_monthly' });
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      setError(err.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdrop}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,16,26,0.78)',
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
        initial={{ opacity: 0, y: 28, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border-gold)',
          borderRadius: '22px',
          padding: '36px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 40px rgba(245,166,35,0.1)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏔️</div>
        <h2
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.06em',
            margin: '0 0 10px',
          }}
        >
          Unlock Summit Pro
        </h2>
        <p
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '15px',
            color: 'var(--text-mid)',
            margin: '0 0 24px',
            lineHeight: 1.6,
          }}
        >
          Access all units, AI-powered question generation, and priority support.
        </p>

        <div
          style={{
            background: 'rgba(245,166,35,0.08)',
            border: '1px solid var(--border-gold)',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '36px',
              fontWeight: 700,
              color: 'var(--gold)',
            }}
          >
            $12
            <span style={{ fontSize: '16px', color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif', fontWeight: 600 }}>
              /month
            </span>
          </div>
          <ul
            style={{
              listStyle: 'none',
              padding: 0,
              margin: '14px 0 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            {['All AP World History units', 'APUSH, AP Gov, AP Human Geo', 'AI question generation', 'Priority support'].map((item) => (
              <li
                key={item}
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="7" fill="rgba(82,183,136,0.2)" />
                  <path d="M3.5 7.5L5.5 9.5L10.5 4.5" stroke="#52B788" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '13px',
              color: 'var(--sunset, #E85D4A)',
              margin: '0 0 14px',
              padding: '10px',
              background: 'rgba(232,93,74,0.1)',
              borderRadius: '8px',
            }}
          >
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Not Now
          </button>
          <button
            className="btn-primary"
            onClick={handleCheckout}
            disabled={loading || !token}
            style={{ flex: 2 }}
          >
            {loading ? 'Redirecting…' : !token ? 'Sign In First' : 'Upgrade to Pro →'}
          </button>
        </div>

        {!token && (
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', marginTop: '12px' }}>
            You need to sign in before subscribing.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Set Detail View ──────────────────────────────────────────────────────────

function SetDetailView({ set, onClose, onUse }) {
  const difficultyLabel = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
  const difficultyStyle = {
    easy: { background: 'rgba(82,183,136,0.15)', color: '#52B788' },
    medium: { background: 'rgba(245,166,35,0.15)', color: '#F5A623' },
    hard: { background: 'rgba(232,93,74,0.15)', color: '#E85D4A' },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10,16,26,0.78)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '24px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '22px',
          padding: '32px',
          width: '100%',
          maxWidth: '640px',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
          <div>
            <h2
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--text)',
                margin: '0 0 8px',
              }}
            >
              {set.title}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <SubjectBadge subject={set.subject} />
              {set.unit && (
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Unit {set.unit}
                </span>
              )}
              <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                {set.question_count || set.questions?.length || 0} questions
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '20px', padding: '4px', lineHeight: 1, flexShrink: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Questions list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(set.questions || []).length === 0 ? (
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
              Question details not available.
            </p>
          ) : (
            set.questions.map((q, i) => (
              <div
                key={q.id || i}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--text)', margin: 0, lineHeight: 1.5 }}>
                    {i + 1}. {q.question_text || q.stem || '—'}
                  </p>
                  {q.difficulty && (
                    <span
                      style={{
                        fontFamily: 'Nunito, sans-serif',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '3px 9px',
                        borderRadius: '10px',
                        flexShrink: 0,
                        ...((difficultyStyle[q.difficulty]) || difficultyStyle.medium),
                      }}
                    >
                      {difficultyLabel[q.difficulty] || q.difficulty}
                    </span>
                  )}
                </div>
                {q.stimulus && (
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{q.stimulus.slice(0, 140)}…"
                  </p>
                )}
                {q.tags && q.tags.length > 0 && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {q.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: 'Nunito, sans-serif',
                          fontSize: '10px',
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          background: 'var(--bg-elevated)',
                          padding: '2px 8px',
                          borderRadius: '8px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Use button */}
        <div style={{ paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn-primary"
            onClick={() => onUse(set)}
            style={{ width: '100%', fontSize: '15px', padding: '14px' }}
          >
            Use This Set →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Set Card ─────────────────────────────────────────────────────────────────

function SetCard({ set, isLocked, onOpen, onProClick, isMySet, onEdit, onPlay }) {
  return (
    <motion.div
      whileHover={isLocked ? {} : { y: -3, borderColor: 'rgba(245,166,35,0.35)', boxShadow: '0 4px 20px rgba(245,166,35,0.12)' }}
      whileTap={isLocked ? {} : { scale: 0.98 }}
      transition={{ duration: 0.16 }}
      onClick={isLocked ? onProClick : onOpen}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '14px',
        padding: '18px',
        cursor: isLocked ? 'pointer' : 'pointer',
        opacity: isLocked ? 0.7 : 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        position: 'relative',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Lock / free badge */}
      {isLocked && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(245,166,35,0.15)',
            border: '1px solid var(--border-gold)',
            borderRadius: '8px',
            padding: '3px 8px',
          }}
        >
          <span style={{ fontSize: '10px' }}>🔒</span>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: '10px', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.06em' }}>
            PRO
          </span>
        </div>
      )}
      {!isLocked && set.unit === 1 && set.is_summit_library && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(82,183,136,0.15)',
            border: '1px solid rgba(82,183,136,0.3)',
            borderRadius: '8px',
            padding: '3px 8px',
          }}
        >
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '10px', color: '#52B788', fontWeight: 800 }}>FREE</span>
        </div>
      )}

      <div style={{ paddingRight: isLocked ? '60px' : '50px' }}>
        <h4 style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--text)', margin: '0 0 8px', lineHeight: 1.3 }}>
          {set.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <SubjectBadge subject={set.subject} />
          {set.unit && (
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Unit {set.unit}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {set.question_count || set.questions?.length || 0} questions
        </span>
        <DifficultyDots distribution={set.difficulty_distribution} />
      </div>

      {/* My set action buttons */}
      {isMySet && (
        <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
          <button
            className="btn-secondary"
            onClick={(e) => { e.stopPropagation(); onEdit && onEdit(set); }}
            style={{ flex: 1, padding: '7px 0', fontSize: '12px' }}
          >
            Edit
          </button>
          <button
            className="btn-primary"
            onClick={(e) => { e.stopPropagation(); onPlay && onPlay(set); }}
            style={{ flex: 1, padding: '7px 0', fontSize: '12px' }}
          >
            Play
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── New Set Card ─────────────────────────────────────────────────────────────

function NewSetCard({ onClick }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -3, borderColor: 'rgba(245,166,35,0.4)', boxShadow: '0 4px 20px rgba(245,166,35,0.12)' }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: 'transparent',
        border: '2px dashed var(--border)',
        borderRadius: '14px',
        padding: '18px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        minHeight: '130px',
        transition: 'border-color 0.15s',
      }}
    >
      <span style={{ fontSize: '28px', opacity: 0.5 }}>➕</span>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
        New Set
      </span>
    </motion.div>
  );
}

// ─── Library ──────────────────────────────────────────────────────────────────

export default function Library() {
  const { navigate, user, token } = useApp();
  const isPro = user?.subscription === 'pro';

  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [summitSets, setSummitSets] = useState([]);
  const [mySets, setMySets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProModal, setShowProModal] = useState(false);
  const [detailSet, setDetailSet] = useState(null);

  // Load sets
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/api/question-sets?library=true').catch(() => MOCK_SUMMIT_SETS),
      token ? api.get('/api/question-sets?mine=true').catch(() => []) : Promise.resolve([]),
    ]).then(([lib, mine]) => {
      if (!cancelled) {
        setSummitSets(Array.isArray(lib) ? lib : MOCK_SUMMIT_SETS);
        setMySets(Array.isArray(mine) ? mine : []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [token]);

  const filterFn = useCallback(
    (set) => {
      const matchSubject = subjectFilter === 'All' || set.subject === subjectFilter;
      if (!matchSubject) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return set.title?.toLowerCase().includes(q) || set.subject?.toLowerCase().includes(q);
    },
    [search, subjectFilter]
  );

  const filteredSummit = summitSets.filter(filterFn);
  const filteredMine = mySets.filter(filterFn);

  const handleUseSet = (set) => {
    navigate('host_game', { preselectedSet: set });
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
        <button
          onClick={() => navigate('teacher_dashboard')}
          style={{
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Cinzel, serif',
            fontSize: '20px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F5A623, #C8851A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.08em',
            padding: 0,
          }}
        >
          SUMMIT
        </button>
        <button
          className="btn-ghost"
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => navigate('teacher_dashboard')}
        >
          ← Dashboard
        </button>
      </nav>

      {/* ── Pro Banner ── */}
      <AnimatePresence>
        {!isPro && token && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: 'rgba(245,166,35,0.1)',
              borderBottom: '1px solid var(--border-gold)',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--gold)' }}>
              🏔️ Upgrade to Summit Pro — Unlock all units, AI generation, and more.{' '}
              <strong>$12/month.</strong>
            </span>
            <button
              className="btn-primary"
              style={{ padding: '6px 16px', fontSize: '13px' }}
              onClick={() => setShowProModal(true)}
            >
              Upgrade Now
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '28px' }}
        >
          <h1
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: 'clamp(22px, 4vw, 30px)',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.08em',
              margin: '0 0 20px',
            }}
          >
            Question Library
          </h1>

          {/* Search + filter row */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: '1 1 260px', minWidth: 0 }}>
              <input
                className="input-field"
                type="text"
                placeholder="Search sets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '16px',
                  pointerEvents: 'none',
                  opacity: 0.5,
                }}
              >
                🔍
              </span>
            </div>

            {/* Subject filter chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSubjectFilter(s)}
                  style={{
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '6px 14px',
                    borderRadius: '20px',
                    border: `1px solid ${subjectFilter === s ? 'var(--gold)' : 'var(--border)'}`,
                    background: subjectFilter === s ? 'rgba(245,166,35,0.12)' : 'transparent',
                    color: subjectFilter === s ? 'var(--gold)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)', fontFamily: 'Nunito, sans-serif', fontSize: '15px' }}>
            Loading question sets…
          </div>
        )}

        {!loading && (
          <>
            {/* Summit Library section */}
            <section style={{ marginBottom: '48px' }}>
              <h2
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--text)',
                  margin: '0 0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                🏔️ Summit Library
              </h2>

              {filteredSummit.length === 0 ? (
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
                  No sets match your filters.
                </p>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '14px',
                  }}
                >
                  {filteredSummit.map((set) => {
                    const isLocked = set.unit > 1 && !isPro;
                    return (
                      <SetCard
                        key={set.id}
                        set={set}
                        isLocked={isLocked}
                        onOpen={() => setDetailSet(set)}
                        onProClick={() => setShowProModal(true)}
                        isMySet={false}
                      />
                    );
                  })}
                </motion.div>
              )}
            </section>

            {/* My Sets section */}
            <section>
              <h2
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--text)',
                  margin: '0 0 16px',
                }}
              >
                My Sets
              </h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '14px',
                }}
              >
                {/* Always-first new set card */}
                <NewSetCard onClick={() => navigate('question_builder')} />

                {filteredMine.map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    isLocked={false}
                    onOpen={() => setDetailSet(set)}
                    isMySet
                    onEdit={() => navigate('question_builder', { editSetId: set.id })}
                    onPlay={() => navigate('host_game', { preselectedSet: set })}
                  />
                ))}

                {!token && (
                  <div
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '18px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      minHeight: '130px',
                      textAlign: 'center',
                    }}
                  >
                    <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                      Sign in to see your sets
                    </p>
                    <button className="btn-primary" onClick={() => navigate('landing')} style={{ fontSize: '13px', padding: '8px 18px' }}>
                      Sign In
                    </button>
                  </div>
                )}
              </motion.div>
            </section>
          </>
        )}
      </main>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showProModal && <ProUpgradeModal onClose={() => setShowProModal(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {detailSet && (
          <SetDetailView
            set={detailSet}
            onClose={() => setDetailSet(null)}
            onUse={(set) => {
              setDetailSet(null);
              handleUseSet(set);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
