import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Icon from '../components/ui/Icon.jsx';
import { connectSocket, disconnectSocket } from '../lib/socket.js';

// ─── Decorative SVGs ──────────────────────────────────────────────────────────

function CornerMountain() {
  return (
    <svg
      width="260"
      height="170"
      viewBox="0 0 260 170"
      fill="none"
      style={{ position: 'fixed', bottom: 0, left: 0, opacity: 0.06, pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      <polygon points="130,12 250,160 10,160" fill="#52B788" />
      <polygon points="130,12 165,62 95,62" fill="#E8F4F8" />
      <polygon points="0,160 55,115 100,135 130,122 160,135 210,112 260,160" fill="#1A2E20" />
    </svg>
  );
}

function LobbyMountainBg() {
  return (
    <svg
      width="100%"
      height="200"
      viewBox="0 0 800 200"
      preserveAspectRatio="xMidYMax meet"
      fill="none"
      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, opacity: 0.07, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <polygon points="400,10 700,190 100,190" fill="#52B788" />
      <polygon points="400,10 460,80 340,80" fill="#E8F4F8" />
      <polygon points="0,190 100,140 200,160 300,130 400,145 500,128 600,155 700,138 800,190" fill="#1A2E20" />
    </svg>
  );
}

// ─── Difficulty distribution bar ─────────────────────────────────────────────

function DifficultyBar({ distribution = {} }) {
  const easy = distribution.easy || 0;
  const medium = distribution.medium || 0;
  const hard = distribution.hard || 0;
  const total = easy + medium + hard || 1;

  return (
    <div
      title={`Easy: ${easy} · Medium: ${medium} · Hard: ${hard}`}
      style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', height: '6px', gap: '1px' }}
    >
      <div style={{ flex: easy / total, background: '#52B788', minWidth: easy ? '4px' : 0 }} />
      <div style={{ flex: medium / total, background: '#F5A623', minWidth: medium ? '4px' : 0 }} />
      <div style={{ flex: hard / total, background: '#E85D4A', minWidth: hard ? '4px' : 0 }} />
    </div>
  );
}

// ─── Subject badge ────────────────────────────────────────────────────────────

const SUBJECT_COLORS = {
  'AP World History': { bg: 'rgba(45,106,79,0.25)', text: '#52B788' },
  APUSH: { bg: 'rgba(45,107,138,0.25)', text: '#5BB8D4' },
  'AP Gov': { bg: 'rgba(107,78,138,0.25)', text: '#A57DD8' },
  'AP Human Geo': { bg: 'rgba(138,107,45,0.25)', text: '#D4A55B' },
  Other: { bg: 'rgba(74,85,104,0.25)', text: '#9BB0C4' },
};

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

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  const steps = ['Select Set', 'Select Class', 'Lobby'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '36px' }}>
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        return (
          <React.Fragment key={label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: done ? '#52B788' : active ? 'var(--gold)' : 'var(--bg-elevated)',
                  border: done || active ? 'none' : '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: done || active ? '#0F1720' : 'var(--text-muted)',
                  fontFamily: 'Nunito, sans-serif',
                  flexShrink: 0,
                  transition: 'background 0.2s',
                }}
              >
                {done ? <Icon name="check" size={14} color="#0F1720" /> : stepNum}
              </div>
              <span
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '13px',
                  fontWeight: active ? 800 : 600,
                  color: active ? 'var(--text)' : done ? 'var(--pine-light)' : 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '1px',
                  background: done ? '#52B788' : 'var(--border)',
                  margin: '0 10px',
                  transition: 'background 0.2s',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ─── Question Set Card ────────────────────────────────────────────────────────

function SetCard({ set, selected, onSelect, locked }) {
  return (
    <motion.div
      onClick={locked ? undefined : () => onSelect(set)}
      whileHover={locked ? {} : { y: -2 }}
      whileTap={locked ? {} : { scale: 0.98 }}
      transition={{ duration: 0.15 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: '14px',
        padding: '16px 18px',
        cursor: locked ? 'default' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        boxShadow: selected ? '0 0 20px rgba(245,166,35,0.2)' : 'none',
        opacity: locked ? 0.65 : 1,
        position: 'relative',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {locked && (
        <div
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'rgba(245,166,35,0.15)',
            border: '1px solid var(--border-gold)',
            borderRadius: '8px',
            padding: '3px 8px',
          }}
        >
          <Icon name="lock" size={11} color="var(--gold)" />
          <span
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '10px',
              color: 'var(--gold)',
              fontWeight: 700,
              letterSpacing: '0.06em',
            }}
          >
            PRO
          </span>
        </div>
      )}

      <div style={{ paddingRight: locked ? '64px' : 0 }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--text)', marginBottom: '6px' }}>
          {set.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <SubjectBadge subject={set.subject} />
          {set.unit && (
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Unit {set.unit}
            </span>
          )}
          <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {set.question_count || set.questions?.length || 0} questions
          </span>
        </div>
      </div>

      <DifficultyBar distribution={set.difficulty_distribution} />
    </motion.div>
  );
}

// ─── Preview Panel ────────────────────────────────────────────────────────────

function PreviewPanel({ set }) {
  const questions = set?.questions?.slice(0, 3) || [];
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-gold)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <h4
        style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '13px',
          color: 'var(--gold)',
          letterSpacing: '0.08em',
          margin: 0,
        }}
      >
        PREVIEW — {set.title}
      </h4>
      {questions.length === 0 ? (
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
          No questions to preview.
        </p>
      ) : (
        questions.map((q, i) => (
          <div
            key={q.id || i}
            style={{
              borderBottom: i < questions.length - 1 ? '1px solid var(--border)' : 'none',
              paddingBottom: i < questions.length - 1 ? '12px' : 0,
            }}
          >
            <p
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text)',
                margin: '0 0 4px',
                lineHeight: 1.5,
              }}
            >
              {i + 1}. {q.question_text || q.stem || '—'}
            </p>
            {q.stimulus && (
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', margin: 0, fontStyle: 'italic' }}>
                {q.stimulus.slice(0, 100)}…
              </p>
            )}
          </div>
        ))
      )}
      {set.questions?.length > 3 && (
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          + {set.questions.length - 3} more questions
        </p>
      )}
    </motion.div>
  );
}

// ─── Student avatar chip ──────────────────────────────────────────────────────

function StudentChip({ name }) {
  const initial = name?.[0]?.toUpperCase() || '?';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '30px',
        padding: '6px 14px 6px 8px',
      }}
    >
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Cinzel, serif',
          fontSize: '12px',
          fontWeight: 700,
          color: '#E8F4F8',
          flexShrink: 0,
        }}
      >
        {initial}
      </div>
      <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
        {name}
      </span>
    </motion.div>
  );
}

// ─── Mock library sets for when API isn't available ───────────────────────────

const MOCK_SUMMIT_SETS = [
  {
    id: 'sum-1', title: 'Unit 1: The Global Tapestry', subject: 'AP World History',
    unit: 1, question_count: 20, is_summit_library: true,
    difficulty_distribution: { easy: 6, medium: 10, hard: 4 }, questions: [],
  },
  {
    id: 'sum-2', title: 'Unit 2: Networks of Exchange', subject: 'AP World History',
    unit: 2, question_count: 22, is_summit_library: true,
    difficulty_distribution: { easy: 5, medium: 12, hard: 5 }, questions: [],
  },
  {
    id: 'sum-3', title: 'Unit 3: Land-Based Empires', subject: 'AP World History',
    unit: 3, question_count: 18, is_summit_library: true,
    difficulty_distribution: { easy: 4, medium: 9, hard: 5 }, questions: [],
  },
];

// ─── Step 1: Select Question Set ──────────────────────────────────────────────

function Step1SelectSet({ selectedSet, onSelect, onNext }) {
  const { user } = useApp();
  const isPro = user?.subscription === 'pro';

  const [search, setSearch] = useState('');
  const [summitSets, setSummitSets] = useState([]);
  const [mySets, setMySets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      api.get('/api/question-sets?library=true').catch(() => MOCK_SUMMIT_SETS),
      api.get('/api/question-sets?mine=true').catch(() => []),
    ]).then(([lib, mine]) => {
      if (!cancelled) {
        setSummitSets(Array.isArray(lib) ? lib : MOCK_SUMMIT_SETS);
        setMySets(Array.isArray(mine) ? mine : []);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const filterFn = (set) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      set.title?.toLowerCase().includes(q) ||
      set.subject?.toLowerCase().includes(q)
    );
  };

  const filteredSummit = summitSets.filter(filterFn);
  const filteredMine = mySets.filter(filterFn);

  return (
    <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      {/* Left: sets list */}
      <div style={{ flex: '1 1 400px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Search */}
        <input
          className="input-field"
          type="text"
          placeholder="Search sets by title or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && (
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
            Loading question sets…
          </p>
        )}

        {!loading && (
          <>
            {/* Summit Library */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Icon name="mountain" size={16} color="var(--gold)" /> Summit Library
                </h3>
                <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--pine-light)', fontWeight: 700, background: 'rgba(82,183,136,0.15)', padding: '2px 8px', borderRadius: '10px' }}>
                  Unit 1 FREE
                </span>
              </div>
              {filteredSummit.length === 0 ? (
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>No sets match your search.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredSummit.map((set) => {
                    const locked = set.unit > 1 && !isPro;
                    return (
                      <SetCard
                        key={set.id}
                        set={set}
                        selected={selectedSet?.id === set.id}
                        onSelect={onSelect}
                        locked={locked}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* My Sets */}
            <div>
              <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: '0 0 12px' }}>
                My Sets
              </h3>
              {filteredMine.length === 0 ? (
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {mySets.length === 0 ? "You haven't created any sets yet." : 'No sets match your search.'}
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {filteredMine.map((set) => (
                    <SetCard
                      key={set.id}
                      set={set}
                      selected={selectedSet?.id === set.id}
                      onSelect={onSelect}
                      locked={false}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Right: preview + next */}
      <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence mode="wait">
          {selectedSet && <PreviewPanel key={selectedSet.id} set={selectedSet} />}
        </AnimatePresence>

        <button
          className="btn-primary"
          disabled={!selectedSet}
          onClick={onNext}
          style={{ width: '100%', fontSize: '15px', padding: '14px' }}
        >
          Next: Select Class →
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Select Class ─────────────────────────────────────────────────────

function Step2SelectClass({ selectedClassId, onSelect, onBack, onNext }) {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get('/api/classes')
      .then((data) => {
        if (!cancelled) {
          setClasses(Array.isArray(data) ? data : data.classes || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const RadioCard = ({ id, label, sub, selected, onPick }) => (
    <motion.div
      onClick={() => onPick(id)}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
        borderRadius: '12px',
        padding: '14px 18px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: selected ? '0 0 16px rgba(245,166,35,0.18)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      <div
        style={{
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          border: `2px solid ${selected ? 'var(--gold)' : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'border-color 0.15s',
        }}
      >
        {selected && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--gold)' }} />}
      </div>
      <div>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--text)' }}>{label}</div>
        {sub && <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{sub}</div>}
      </div>
    </motion.div>
  );

  return (
    <div style={{ maxWidth: '540px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        <RadioCard
          id="open"
          label="Open Join (no class required)"
          sub="Any student with the code can join"
          selected={selectedClassId === 'open'}
          onPick={onSelect}
        />

        {loading && (
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0' }}>
            Loading your classes…
          </p>
        )}

        {!loading &&
          classes.map((cls) => (
            <RadioCard
              key={cls.id}
              id={cls.id}
              label={cls.name}
              sub={`${cls.subject} · ${cls.class_members?.count ?? 0} students`}
              selected={selectedClassId === cls.id}
              onPick={onSelect}
            />
          ))}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-secondary" onClick={onBack} style={{ flex: 1 }}>
          ← Back
        </button>
        <button
          className="btn-primary"
          disabled={!selectedClassId}
          onClick={onNext}
          style={{ flex: 2, fontSize: '15px' }}
        >
          Next: Launch Lobby →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Lobby ────────────────────────────────────────────────────────────

function Step3Lobby({ selectedSet, selectedClassId, onBack }) {
  const { navigate, token, setGameState } = useApp();
  const [gameCode, setGameCode] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef(null);

  // Create session and connect socket
  useEffect(() => {
    let cancelled = false;

    api
      .post('/api/sessions', {
        question_set_id: selectedSet?.id,
        class_id: selectedClassId === 'open' ? null : selectedClassId,
      })
      .then((session) => {
        if (cancelled) return;
        const code = session.game_code || session.code || session.gameCode;
        setGameCode(code);
        setLoading(false);

        // Connect socket
        const socket = connectSocket(token);
        socketRef.current = socket;

        socket.emit('teacher:join_room', { sessionId: session.id, gameCode: code });

        socket.on('student:joined', (data) => {
          if (!cancelled) {
            setStudents((prev) => {
              const exists = prev.some((s) => s.id === (data.student?.id || data.id));
              if (exists) return prev;
              return [...prev, data.student || { id: data.id, name: data.name }];
            });
          }
        });

        socket.on('student:left', (data) => {
          if (!cancelled) {
            setStudents((prev) => prev.filter((s) => s.id !== (data.student?.id || data.id)));
          }
        });

        setGameState({ sessionId: session.id, gameCode: code, selectedSet });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to create session');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off('student:joined');
        socketRef.current.off('student:left');
      }
    };
  }, []);

  const handleStart = () => {
    if (socketRef.current) {
      socketRef.current.emit('teacher:start_game');
    }
    navigate('teacher_live');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '60px 0' }}>
        <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '15px', color: 'var(--text-muted)' }}>
          Setting up your game…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px 24px', background: 'rgba(232,93,74,0.1)', border: '1px solid rgba(232,93,74,0.2)', borderRadius: '12px', color: 'var(--sunset, #E85D4A)', fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 600 }}>
        {error}
        <button className="btn-secondary" onClick={onBack} style={{ marginTop: '12px', display: 'block' }}>
          ← Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden' }}>
      <LobbyMountainBg />

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left: game code */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', padding: '20px 0' }}>
          <p
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Join at{' '}
            <span style={{ color: 'var(--pine-light)' }}>SUMMIT.APP</span>
          </p>

          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, type: 'spring', bounce: 0.3 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '2px solid var(--border-gold)',
              borderRadius: '20px',
              padding: '32px 48px',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(245,166,35,0.15)',
            }}
          >
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: 'clamp(36px, 8vw, 56px)',
                fontWeight: 700,
                color: 'var(--gold)',
                letterSpacing: '0.2em',
                display: 'block',
                lineHeight: 1,
              }}
            >
              {gameCode || '···'}
            </span>
          </motion.div>

          {/* QR placeholder */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '24px 32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Icon name="phone" size={36} color="var(--text-muted)" />
            <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
              QR Code
            </span>
          </div>

          <motion.button
            className="btn-primary animate-pulse-gold"
            onClick={handleStart}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{ fontSize: '16px', padding: '14px 40px', marginTop: '8px' }}
          >
            Start Climb →
          </motion.button>
        </div>

        {/* Right: student list */}
        <div style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontFamily: 'Nunito, sans-serif', fontSize: '16px', fontWeight: 800, color: 'var(--text)', margin: 0 }}>
              Students Ready
            </h3>
            <span
              style={{
                fontFamily: 'Cinzel, serif',
                fontSize: '20px',
                fontWeight: 700,
                color: students.length > 0 ? 'var(--gold)' : 'var(--text-muted)',
              }}
            >
              {students.length}
            </span>
          </div>

          {students.length === 0 ? (
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
              Waiting for students to join…
            </p>
          ) : (
            <motion.div
              style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
              initial="hidden"
              animate="visible"
            >
              <AnimatePresence>
                {students.map((s) => (
                  <StudentChip key={s.id} name={s.name || s.username || 'Student'} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── HostGame (3-step wizard) ─────────────────────────────────────────────────

export default function HostGame() {
  const { navigate, screenParams } = useApp();
  const [step, setStep] = useState(1);
  const [selectedSet, setSelectedSet] = useState(screenParams?.preselectedSet || null);
  const [selectedClassId, setSelectedClassId] = useState(
    screenParams?.classId || null
  );

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
            background: 'none',
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

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px 60px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.08em',
            marginBottom: '32px',
          }}
        >
          Host a Live Game
        </h1>

        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step1SelectSet
                selectedSet={selectedSet}
                onSelect={setSelectedSet}
                onNext={() => setStep(2)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step2SelectClass
                selectedClassId={selectedClassId}
                onSelect={setSelectedClassId}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Step3Lobby
                selectedSet={selectedSet}
                selectedClassId={selectedClassId}
                onBack={() => setStep(2)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
