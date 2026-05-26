import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';

function CornerMountain() {
  return (
    <svg
      width="180"
      height="120"
      viewBox="0 0 180 120"
      fill="none"
      style={{ position: 'fixed', bottom: 0, right: 0, opacity: 0.05, pointerEvents: 'none', zIndex: 0 }}
      aria-hidden="true"
    >
      <polygon points="90,10 170,110 10,110" fill="#52B788" />
      <polygon points="90,10 115,50 65,50" fill="#E8F4F8" />
    </svg>
  );
}

export default function QuestionBuilder() {
  const { navigate } = useApp();

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
        <button className="btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={() => navigate('teacher_dashboard')}>
          ← Dashboard
        </button>
      </nav>

      <main
        style={{
          flex: 1,
          maxWidth: '800px',
          width: '100%',
          margin: '0 auto',
          padding: '60px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <span style={{ fontSize: '56px' }}>✏️</span>
          <h1
            style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.08em',
              margin: '16px 0 10px',
            }}
          >
            Question Builder
          </h1>
          <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '16px', color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
            Coming soon — build custom question sets with AI assistance.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
