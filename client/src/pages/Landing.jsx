import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

function HeroMountain() {
  return (
    <svg width="300" height="200" viewBox="0 0 300 200" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0F1720" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="140" rx="150" ry="70" fill="url(#skyGlow)" />
      <polygon points="0,160 80,90 130,120 180,70 240,110 300,80 300,200 0,200" fill="#1A2E20" />
      <polygon points="150,18 270,175 30,175" fill="#2D6A4F" />
      <polygon points="150,18 200,100 100,100" fill="#3D5A40" />
      <polygon points="150,18 165,60 150,65" fill="#4A6850" />
      <polygon points="150,18 138,58 152,62" fill="#567A5A" />
      <polygon points="150,18 178,72 122,72" fill="#E8F4F8" />
      <polygon points="150,18 162,52 140,55" fill="#ffffff" />
      <polygon points="122,72 130,68 138,80" fill="#D4EBF0" />
      <polygon points="178,72 168,68 160,80" fill="#D4EBF0" />
      <polygon points="0,175 60,130 120,155 150,140 180,155 240,128 300,175 300,200 0,200" fill="#1E2D18" />
      {[30, 55, 250, 275].map((x, i) => (
        <polygon key={i} points={`${x},175 ${x + 6},160 ${x + 12},175`} fill="#162214" />
      ))}
    </svg>
  );
}

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

export default function Landing() {
  const { navigate } = useApp();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | duplicate | error
  const [count, setCount] = useState(null);

  useEffect(() => {
    api.get('/api/waitlist/count')
      .then(d => setCount(d.count))
      .catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setStatus('loading');
    try {
      const data = await api.post('/api/waitlist', { email: trimmed, source: 'landing' });
      setCount(data.count);
      setStatus('success');
      setTimeout(() => navigate('auth', { email: trimmed, role: 'student' }), 1800);
    } catch (err) {
      if (err.message === 'already_on_list' || err.status === 409) {
        setStatus('duplicate');
        setTimeout(() => navigate('auth', { email: trimmed, role: 'student' }), 1800);
      } else {
        setStatus('error');
      }
    }
  }

  const showForm = status === 'idle' || status === 'loading' || status === 'error';

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
      <motion.nav
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 32px',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: 'rgba(15,23,32,0.88)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
        <button
          onClick={() => navigate('auth', { role: 'student' })}
          className="btn-ghost"
          style={{ padding: '9px 22px', fontSize: '14px' }}
        >
          Sign In
        </button>
      </motion.nav>

      {/* Hero */}
      <motion.section
        variants={stagger}
        initial="hidden"
        animate="visible"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '72px 24px 64px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '8%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(45,106,79,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div variants={fadeUp}>
          <HeroMountain />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(32px, 7vw, 56px)',
            fontWeight: 700,
            color: 'var(--text)',
            letterSpacing: '0.04em',
            margin: '28px 0 16px',
            lineHeight: 1.15,
            maxWidth: '680px',
          }}
        >
          The test prep app that<br />
          <span style={{
            background: 'linear-gradient(135deg, #F5A623 30%, #C8851A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            actually works.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '18px',
            color: 'var(--text-muted)',
            maxWidth: '480px',
            lineHeight: 1.6,
            margin: '0 0 36px',
            fontWeight: 600,
          }}
        >
          Summit is coming. Be the first to climb.
        </motion.p>

        {/* Count badge */}
        {count !== null && count > 0 && (
          <motion.p
            variants={fadeUp}
            style={{
              fontFamily: 'Nunito, sans-serif',
              fontSize: '14px',
              color: 'var(--text-muted)',
              marginBottom: '20px',
              fontWeight: 600,
            }}
          >
            Join <span style={{ color: '#F5A623', fontWeight: 800 }}>{count.toLocaleString()}</span> students already on the waitlist
          </motion.p>
        )}

        {/* Email form */}
        <motion.div variants={fadeUp} style={{ width: '100%', maxWidth: '440px' }}>
          {showForm ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    flex: 1,
                    minWidth: '200px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    padding: '13px 16px',
                    color: 'var(--text)',
                    fontFamily: 'Nunito, sans-serif',
                    fontSize: '15px',
                    outline: 'none',
                  }}
                />
                <motion.button
                  type="submit"
                  className="btn-primary"
                  disabled={status === 'loading'}
                  style={{
                    padding: '13px 24px',
                    fontSize: '15px',
                    whiteSpace: 'nowrap',
                    opacity: status === 'loading' ? 0.7 : 1,
                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  }}
                  whileHover={status !== 'loading' ? { scale: 1.03, boxShadow: '0 8px 28px rgba(245,166,35,0.35)' } : {}}
                  whileTap={status !== 'loading' ? { scale: 0.97 } : {}}
                >
                  {status === 'loading' ? 'Joining…' : 'Join the Waitlist'}
                </motion.button>
              </div>

              {status === 'error' && (
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: '#E05252', margin: 0, fontWeight: 600 }}>
                  Something went wrong — please try again.
                </p>
              )}

              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                Free to start. No credit card needed.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid rgba(245,166,35,0.3)',
                borderRadius: '14px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '10px' }}>🏔️</div>
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--text)',
                margin: '0 0 6px',
              }}>
                {status === 'duplicate' ? 'Already on the list!' : "You're on the waitlist!"}
              </p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                Taking you to your account…
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '20px',
      }}>
        <a
          href="https://www.tiktok.com/@summitprep"
          target="_blank"
          rel="noopener noreferrer"
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
