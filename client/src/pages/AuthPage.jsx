import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

function MountainMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <polygon points="20,4 36,36 4,36" fill="#2D6A4F" />
      <polygon points="20,4 27,20 13,20" fill="#3D7A50" />
      <polygon points="20,4 24,14 16,15" fill="#E8F4F8" />
    </svg>
  );
}

export default function AuthPage() {
  const { screenParams, navigate, setToken, setUser } = useApp();

  const initialMode = screenParams?.mode === 'register' || screenParams?.email ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(screenParams?.role || 'student');
  const [username, setUsername] = useState(
    screenParams?.email
      ? screenParams.email.split('@')[0].replace(/[^a-z0-9_]/gi, '').toLowerCase()
      : ''
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!username.trim()) { setError('Username is required.'); return; }
      if (!/^[a-z0-9_]+$/.test(username.trim())) { setError('Username: letters, numbers, underscores only.'); return; }
      if (username.trim().length < 3) { setError('Username must be at least 3 characters.'); return; }
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    }

    setLoading(true);
    try {
      let data;
      if (mode === 'register') {
        data = await api.post('/auth/register', {
          username: username.trim().toLowerCase(),
          password,
          role,
          name: name.trim() || username.trim(),
          email: screenParams?.email || undefined,
        });
      } else {
        data = await api.post('/auth/login', {
          username: username.trim().toLowerCase(),
          password,
        });
      }
      setToken(data.token);
      setUser(data.user);
      if (data.user.role === 'teacher') {
        navigate('teacher_dashboard');
      } else if (mode === 'register' && !data.user.diagnostic_done) {
        navigate('diagnostic');
      } else {
        navigate('student_dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const switchMode = (m) => { setMode(m); setError(''); setPassword(''); setConfirmPassword(''); };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '12px 14px',
    color: 'var(--text)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    marginBottom: '6px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top nav */}
      <div style={{
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid var(--border)',
      }}>
        <button
          onClick={() => navigate('landing')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: 700,
            background: 'linear-gradient(135deg, #F5A623, #C8851A)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            letterSpacing: '0.08em', padding: 0,
          }}
        >
          SUMMIT
        </button>
      </div>

      {/* Main */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Mode tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-elevated)',
            borderRadius: '14px',
            padding: '4px',
            border: '1px solid var(--border)',
            marginBottom: '28px',
          }}>
            {[
              { key: 'register', label: 'Create Account' },
              { key: 'login', label: 'Sign In' },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => switchMode(m.key)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  fontWeight: 800,
                  transition: 'background 0.18s, color 0.18s',
                  background: mode === m.key ? '#F5A623' : 'transparent',
                  color: mode === m.key ? '#0F1720' : 'var(--text-muted)',
                }}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Card */}
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '32px',
            }}
          >
            <h2 style={{
              fontFamily: 'Cinzel, serif',
              fontSize: '20px',
              fontWeight: 700,
              color: '#F5A623',
              margin: '0 0 24px',
              letterSpacing: '0.04em',
            }}>
              {mode === 'register' ? 'Start Climbing' : 'Welcome Back'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Role picker — register only */}
              {mode === 'register' && (
                <div>
                  <span style={labelStyle}>I am a</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['student', 'teacher'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          flex: 1, padding: '9px', borderRadius: '10px',
                          border: `1px solid ${role === r ? '#F5A623' : 'var(--border)'}`,
                          cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                          fontSize: '14px', fontWeight: 700,
                          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                          background: role === r ? 'rgba(245,166,35,0.12)' : 'transparent',
                          color: role === r ? '#F5A623' : 'var(--text-muted)',
                        }}
                      >
                        {r === 'student' ? '🧗 Student' : '📚 Teacher'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Name — register only */}
              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Your name (optional)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              )}

              {/* Username */}
              <div>
                <label style={labelStyle}>Username</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder={mode === 'register' ? 'Choose a username' : 'Your username'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-z0-9_]/gi, '').toLowerCase())}
                  autoComplete="username"
                  required
                  autoFocus={!screenParams?.email}
                />
                {mode === 'register' && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginTop: '4px' }}>
                    Letters, numbers, underscores — at least 3 characters
                  </span>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={labelStyle}>Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  required
                />
              </div>

              {/* Confirm password — register only */}
              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <input
                    style={inputStyle}
                    type="password"
                    placeholder="Same password again"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    required
                  />
                </div>
              )}

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      background: 'rgba(232,93,74,0.1)',
                      border: '1px solid rgba(232,93,74,0.3)',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px',
                      color: '#E85D4A',
                      fontWeight: 700,
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: '100%', padding: '14px', fontSize: '16px',
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  borderRadius: '12px',
                }}
                whileHover={!loading ? { scale: 1.02, boxShadow: '0 8px 28px rgba(245,166,35,0.35)' } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading
                  ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                  : (mode === 'login' ? 'Sign In →' : 'Create Account →')}
              </motion.button>
            </form>
          </motion.div>

          {/* Switch mode link */}
          <p style={{ textAlign: 'center', marginTop: '20px', fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>
            {mode === 'register' ? 'Already have an account? ' : "Don't have an account? "}
            <button
              onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontSize: '14px', color: '#F5A623', fontWeight: 800, padding: 0, textDecoration: 'underline' }}
            >
              {mode === 'register' ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
