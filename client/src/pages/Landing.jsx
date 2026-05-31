import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

// ─── Animated mountain hero ───────────────────────────────────────────────────

function HeroMountain({ progress = 0.4 }) {
  // time-of-day sky: evening for landing page drama
  const skyTop = '#1A0A2E';
  const skyBot = '#0F1720';
  const starPositions = [];
  let seed = 99;
  function lcg() { seed = (seed * 1664525 + 1013904223) & 0xFFFFFFFF; return (seed >>> 0) / 0xFFFFFFFF; }
  for (let i = 0; i < 50; i++) starPositions.push({ x: lcg() * 100, y: lcg() * 40, r: lcg() * 0.8 + 0.3, d: lcg() * 3 + 1.5 });

  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="lSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyBot} />
        </linearGradient>
        <linearGradient id="lGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#C8851A" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="lGlow" cx="50%" cy="30%" r="30%">
          <stop offset="0%" stopColor="#F5A623" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F5A623" stopOpacity="0" />
        </radialGradient>
        <filter id="lBlur">
          <feGaussianBlur stdDeviation="0.4" />
        </filter>
      </defs>

      {/* Sky */}
      <rect width="100" height="60" fill="url(#lSky)" />

      {/* Stars */}
      {starPositions.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r}
          fill="white" opacity="0.7"
          style={{ animation: `twinkle ${s.d}s ease-in-out infinite`, animationDelay: `${i * 0.15}s` }}
        />
      ))}

      {/* Summit glow */}
      <ellipse cx="50" cy="22" rx="18" ry="10" fill="url(#lGlow)" filter="url(#lBlur)" />

      {/* Distant peaks */}
      <polygon points="10,45 25,28 40,45" fill="#1A2840" opacity="0.5" />
      <polygon points="60,45 80,24 100,45" fill="#1A2840" opacity="0.5" />

      {/* Main mountain */}
      <polygon points="50,8 78,52 22,52" fill="#1E3A28" />
      <polygon points="50,8 63,30 37,30" fill="#2D5A3F" />

      {/* Snow cap */}
      <polygon points="50,8 58,22 42,22" fill="#E8F4F8" opacity="0.92" />
      <polygon points="50,8 54,16 47,17" fill="#ffffff" />

      {/* Gold trail up the mountain */}
      <motion.path
        d={`M 50 ${52 - (progress * 44)} Q 53 ${52 - (progress * 44) + 8} 56 52`}
        fill="none"
        stroke="#F5A623"
        strokeWidth="0.8"
        strokeLinecap="round"
        strokeDasharray="1.5 1.5"
        opacity="0.6"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeOut', delay: 0.8 }}
      />

      {/* Gold summit halo */}
      <motion.circle cx="50" cy="8" r="3" fill="#F5A623" opacity="0.15"
        animate={{ r: [3, 5, 3], opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Prayer flags at summit */}
      {[0,1,2,3,4].map((i) => (
        <rect key={i} x={47.5 + i * 1.2} y={7.5} width={0.9} height={0.6}
          fill={['#F5A623','#52B788','#E85D4A','#4A90D9','#A78BFA'][i]}
          opacity="0.85"
        />
      ))}

      {/* Climber silhouette */}
      <motion.g
        animate={{ y: [0, -0.4, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ellipse cx="50" cy="28" rx="1" ry="1.4" fill="#F5A623" />
        <circle cx="50" cy="26.2" r="0.7" fill="#F5A623" />
      </motion.g>

      {/* Foreground hills */}
      <polygon points="0,52 20,44 45,52 55,48 80,52 100,46 100,60 0,60" fill="#0D1A12" />

      {/* Purple/pink horizon glow */}
      <rect x="0" y="46" width="100" height="2" fill="url(#lGold)" />
    </svg>
  );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({ icon, title, desc, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, borderColor: 'rgba(245,166,35,0.4)' }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '28px 24px',
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ fontSize: '32px', marginBottom: '14px' }}>{icon}</div>
      <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: 'var(--text)', margin: '0 0 8px', letterSpacing: '0.04em' }}>
        {title}
      </h3>
      <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
        {desc}
      </p>
    </motion.div>
  );
}

// ─── Stat chip ────────────────────────────────────────────────────────────────

function StatChip({ value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: '#F5A623' }}>
        {value}
      </div>
      <div style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 700 }}>
        {label}
      </div>
    </div>
  );
}

// ─── Landing ──────────────────────────────────────────────────────────────────

export default function Landing() {
  const { navigate } = useApp();
  const [count, setCount] = useState(null);
  const [email, setEmail] = useState('');
  const [joinStatus, setJoinStatus] = useState('idle');

  useEffect(() => {
    api.get('/api/waitlist/count').then((d) => setCount(d.count)).catch(() => {});
  }, []);

  async function handleWaitlist(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setJoinStatus('loading');
    try {
      await api.post('/api/waitlist', { email: trimmed, source: 'landing' });
    } catch (_) {}
    navigate('auth', { email: trimmed, role: 'student', mode: 'register' });
  }

  const FEATURES = [
    {
      icon: '🧠',
      title: 'Spaced Repetition',
      desc: 'Our SM-2 algorithm resurfaces questions right before you\'d forget them — maximizing retention across every study session.',
    },
    {
      icon: '📈',
      title: 'Score Prediction',
      desc: 'See your projected SAT & ACT score update in real time as you master more questions. Watch the gauge climb.',
    },
    {
      icon: '🏔️',
      title: 'Gamified Climbing',
      desc: 'Earn XP, level up, unlock climber customizations, and race friends on the weekly leaderboard. Studying feels like a game.',
    },
    {
      icon: '🔥',
      title: 'Streak System',
      desc: 'Daily login streaks, streak shields, and achievement badges keep you motivated and coming back every day.',
    },
    {
      icon: '🎯',
      title: '1,050 Questions',
      desc: 'Expert-curated SAT Math, SAT R&W, and all four ACT sections. Difficulty-calibrated and tagged by topic.',
    },
    {
      icon: '⚡',
      title: 'Instant Feedback',
      desc: 'Know exactly why you got each answer right or wrong. Explanations for every question, every time.',
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      fontFamily: 'Nunito, sans-serif',
      overflowX: 'hidden',
    }}>

      {/* ── Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 32px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(15,23,32,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        <span style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '22px',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #F5A623, #C8851A)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '0.08em',
        }}>
          SUMMIT
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => navigate('auth', { mode: 'login' })}
            className="btn-ghost"
            style={{ padding: '8px 18px', fontSize: '14px' }}
          >
            Sign In
          </button>
          <motion.button
            onClick={() => navigate('auth', { mode: 'register' })}
            className="btn-primary"
            style={{ padding: '8px 18px', fontSize: '14px' }}
            whileHover={{ scale: 1.04, boxShadow: '0 6px 20px rgba(245,166,35,0.35)' }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started Free
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '0',
        minHeight: '90vh',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 32px',
      }}>
        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ maxWidth: '540px' }}
        >
          {count !== null && count > 10 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'rgba(245,166,35,0.1)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: '999px',
                padding: '5px 14px',
                marginBottom: '24px',
                fontSize: '13px',
                fontWeight: 700,
                color: '#F5A623',
              }}
            >
              🏔️ {count.toLocaleString()}+ students climbing
            </motion.div>
          )}

          <h1 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '0.02em',
            margin: '0 0 20px',
            lineHeight: 1.12,
          }}>
            Master the SAT & ACT.<br />
            <span style={{
              background: 'linear-gradient(135deg, #F5A623 0%, #C8851A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Reach the Summit.
            </span>
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--text-muted)',
            lineHeight: 1.65,
            margin: '0 0 36px',
            fontWeight: 600,
            maxWidth: '440px',
          }}>
            1,050 expert questions. Spaced repetition that actually works.
            A live score prediction that climbs with your mastery.
          </p>

          {/* Primary CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
            <motion.button
              onClick={() => navigate('auth', { mode: 'register' })}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '17px', borderRadius: '14px' }}
              whileHover={{ scale: 1.03, boxShadow: '0 10px 36px rgba(245,166,35,0.4)' }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Create Free Account →
            </motion.button>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center', margin: 0 }}>
              Free to start · No credit card needed ·{' '}
              <button
                onClick={() => navigate('auth', { mode: 'login' })}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#F5A623', fontWeight: 700, fontFamily: 'Nunito, sans-serif', fontSize: '13px', padding: 0, textDecoration: 'underline' }}
              >
                Already have an account?
              </button>
            </p>

            {/* Secondary: waitlist form for email capture */}
            <form onSubmit={handleWaitlist} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="email"
                placeholder="Or enter email to get early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  padding: '11px 14px',
                  color: 'var(--text)',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                disabled={joinStatus === 'loading'}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '10px',
                  padding: '11px 16px',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#F5A623',
                  whiteSpace: 'nowrap',
                }}
              >
                {joinStatus === 'loading' ? '…' : 'Join →'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Mountain visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{
            height: 'clamp(280px, 40vw, 460px)',
            borderRadius: '24px',
            overflow: 'hidden',
            border: '1px solid var(--border)',
            position: 'relative',
            background: '#0D1318',
          }}
        >
          <HeroMountain progress={0.55} />

          {/* Floating stat chips over mountain */}
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'rgba(15,23,32,0.85)', backdropFilter: 'blur(8px)',
              border: '1px solid var(--border-gold)', borderRadius: '12px',
              padding: '10px 16px', textAlign: 'center',
            }}
          >
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: '20px', fontWeight: 700, color: '#F5A623' }}>1,240</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Est. SAT Score</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.85 }}
            style={{
              position: 'absolute', bottom: '16px', left: '16px',
              background: 'rgba(15,23,32,0.85)', backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)', borderRadius: '12px',
              padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '10px',
            }}
          >
            <span style={{ fontSize: '20px' }}>🔥</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>14-Day Streak</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Keep climbing!</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Stats bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '32px 32px',
        }}
      >
        <div style={{
          maxWidth: '800px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-around',
          gap: '24px', flexWrap: 'wrap',
        }}>
          <StatChip value="1,050+" label="Practice Questions" />
          <StatChip value="6" label="Subjects Covered" />
          <StatChip value="SAT & ACT" label="Tests Supported" />
          <StatChip value="Free" label="To Get Started" />
        </div>
      </motion.div>

      {/* ── Features ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 32px' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{ textAlign: 'center', marginBottom: '52px' }}
        >
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            color: 'var(--text)',
            margin: '0 0 14px',
            letterSpacing: '0.04em',
          }}>
            Why Summit Works
          </h2>
          <p style={{
            fontSize: '17px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            maxWidth: '500px',
            margin: '0 auto',
            lineHeight: 1.6,
          }}>
            Built on the science of learning — not just a question bank.
          </p>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.07} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          textAlign: 'center',
          padding: '80px 32px',
          background: 'var(--bg-elevated)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{
          maxWidth: '520px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}>
          <div style={{ fontSize: '52px' }}>🏔️</div>
          <h2 style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            color: 'var(--text)',
            margin: 0,
            letterSpacing: '0.04em',
            lineHeight: 1.2,
          }}>
            Ready to start climbing?
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            fontWeight: 600,
            margin: 0,
            lineHeight: 1.6,
          }}>
            Create your free account in 30 seconds. No credit card, no commitment.
          </p>
          <motion.button
            onClick={() => navigate('auth', { mode: 'register' })}
            className="btn-primary"
            style={{ padding: '16px 40px', fontSize: '17px', borderRadius: '14px' }}
            whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(245,166,35,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            Create Free Account →
          </motion.button>
          <button
            onClick={() => navigate('auth', { mode: 'login' })}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontSize: '14px',
              color: 'var(--text-muted)', fontWeight: 700,
            }}
          >
            Already have an account? Sign In
          </button>
        </div>
      </motion.section>

      {/* ── Footer ── */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap',
      }}>
        <span style={{
          fontFamily: 'Cinzel, serif', fontSize: '14px', fontWeight: 700,
          background: 'linear-gradient(135deg, #F5A623, #C8851A)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          SUMMIT
        </span>
        <a
          href="https://www.tiktok.com/@summitprep"
          target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none' }}
        >
          @summitprep
        </a>
        <span style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
          © 2026 Summit
        </span>
      </footer>
    </div>
  );
}
