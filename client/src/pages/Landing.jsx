import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';

// ─── Decorative SVGs ──────────────────────────────────────────────────────────

function CornerMountain() {
  return (
    <svg
      width="180"
      height="120"
      viewBox="0 0 180 120"
      fill="none"
      style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.07, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <polygon points="90,10 170,110 10,110" fill="#52B788" />
      <polygon points="90,10 115,50 65,50" fill="#E8F4F8" />
    </svg>
  );
}

function HeroMountain() {
  return (
    <svg
      width="300"
      height="200"
      viewBox="0 0 300 200"
      fill="none"
      aria-hidden="true"
    >
      {/* Sky glow */}
      <defs>
        <radialGradient id="skyGlow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0F1720" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="140" rx="150" ry="70" fill="url(#skyGlow)" />

      {/* Far background ridge */}
      <polygon points="0,160 80,90 130,120 180,70 240,110 300,80 300,200 0,200" fill="#1A2E20" />

      {/* Main mountain body */}
      <polygon points="150,18 270,175 30,175" fill="#2D6A4F" />

      {/* Rocky mid section */}
      <polygon points="150,18 200,100 100,100" fill="#3D5A40" />

      {/* Rock face highlights */}
      <polygon points="150,18 165,60 150,65" fill="#4A6850" />
      <polygon points="150,18 138,58 152,62" fill="#567A5A" />

      {/* Snow cap */}
      <polygon points="150,18 178,72 122,72" fill="#E8F4F8" />
      <polygon points="150,18 162,52 140,55" fill="#ffffff" />

      {/* Snow edges */}
      <polygon points="122,72 130,68 138,80" fill="#D4EBF0" />
      <polygon points="178,72 168,68 160,80" fill="#D4EBF0" />

      {/* Foreground foothills */}
      <polygon points="0,175 60,130 120,155 150,140 180,155 240,128 300,175 300,200 0,200" fill="#1E2D18" />

      {/* Tree silhouettes on foothills */}
      {[30, 55, 250, 275].map((x, i) => (
        <polygon key={i} points={`${x},175 ${x + 6},160 ${x + 12},175`} fill="#162214" />
      ))}
    </svg>
  );
}

function GoldCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="rgba(245,166,35,0.15)" />
      <path d="M5 10.5L8.5 14L15 7" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.13 } },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({ vs, claim, delay }) {
  return (
    <motion.div
      variants={fadeUp}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <GoldCheck />
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '12px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}>
          vs {vs}
        </span>
      </div>
      <p style={{
        fontFamily: 'Nunito, sans-serif',
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--text)',
        margin: 0,
        lineHeight: 1.4,
      }}>
        {claim}
      </p>
    </motion.div>
  );
}

// ─── Landing page ─────────────────────────────────────────────────────────────

export default function Landing() {
  const { navigate } = useApp();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Nunito, sans-serif',
      overflowX: 'hidden',
    }}>

      {/* ── Top Nav ── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
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
          background: 'rgba(15,23,32,0.85)',
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
          onClick={() => navigate('auth', { role: 'teacher' })}
          className="btn-ghost"
          style={{ padding: '9px 22px', fontSize: '14px' }}
        >
          Sign In
        </button>
      </motion.nav>

      {/* ── Hero ── */}
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
          padding: '80px 24px 60px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Subtle radial glow */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, rgba(45,106,79,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <motion.div variants={fadeUp}>
          <HeroMountain />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(42px, 8vw, 64px)',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F5A623 30%, #C8851A 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.12em',
            margin: '24px 0 16px',
            lineHeight: 1,
          }}
        >
          SUMMIT
        </motion.h1>

        <motion.p
          variants={fadeUp}
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: 'clamp(16px, 2.5vw, 20px)',
            color: 'var(--text-mid)',
            maxWidth: '560px',
            lineHeight: 1.6,
            margin: '0 0 36px',
            fontWeight: 600,
          }}
        >
          Mastery-based classroom games that make students want to answer one more question.
        </motion.p>

        <motion.div
          variants={fadeUp}
          style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <motion.button
            className="btn-primary"
            style={{ fontSize: '16px', padding: '14px 32px' }}
            onClick={() => navigate('auth', { role: 'teacher' })}
            whileHover={{ scale: 1.04, boxShadow: '0 8px 32px rgba(245,166,35,0.4)' }}
            whileTap={{ scale: 0.97 }}
          >
            I'm a Teacher →
          </motion.button>
          <motion.button
            className="btn-secondary"
            style={{ fontSize: '16px', padding: '14px 32px' }}
            onClick={() => navigate('auth', { role: 'student' })}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Student Login
          </motion.button>
          <motion.button
            className="btn-ghost"
            style={{ fontSize: '16px', padding: '14px 32px' }}
            onClick={() => navigate('student_join')}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
          >
            Join a Game
          </motion.button>
        </motion.div>
      </motion.section>

      {/* ── Feature Comparison ── */}
      <motion.section
        variants={stagger}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '60px 24px',
          width: '100%',
        }}
      >
        <motion.h2
          variants={fadeUp}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--text-muted)',
            textAlign: 'center',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: '32px',
          }}
        >
          Why Summit?
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          <FeatureCard vs="Kahoot" claim="Rewards mastery, not speed" />
          <FeatureCard vs="Blooket" claim="The learning IS the game" />
          <FeatureCard vs="Quizizz" claim="Mastery is the philosophy, not a feature" />
        </div>
      </motion.section>

      {/* ── Social Proof ── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '32px 24px 60px',
        }}
      >
        <p style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '16px',
          color: 'var(--text-muted)',
          fontStyle: 'italic',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '20px' }}>🏔️</span>
          Built by a real AP teacher for real AP classrooms.
        </p>
      </motion.section>

      {/* ── Footer ── */}
      <footer style={{
        background: 'rgba(10,16,26,0.6)',
        borderTop: '1px solid var(--border)',
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <span style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '13px',
          color: 'var(--text-muted)',
        }}>
          Summit © 2025
        </span>
      </footer>
    </div>
  );
}
