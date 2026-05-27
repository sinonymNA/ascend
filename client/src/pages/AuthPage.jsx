import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

export default function AuthPage() {
  const { screenParams, navigate, setToken, setUser } = useApp();

  const [mode, setMode] = useState('login');
  const [role, setRole] = useState(screenParams.role || 'student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
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
      } else {
        navigate('student_dashboard');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '11px 14px',
    color: 'var(--text)',
    fontFamily: 'Nunito, sans-serif',
    fontSize: '15px',
    outline: 'none',
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '28px',
        }}>
          <span style={{
            fontFamily: 'Cinzel, serif',
            fontSize: '28px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #F5A623, #C8851A)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.1em',
          }}>
            SUMMIT
          </span>
        </div>

        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: '20px',
          padding: '32px',
        }}>
          <div style={{
            display: 'flex',
            marginBottom: '28px',
            background: 'var(--bg)',
            borderRadius: '10px',
            padding: '4px',
          }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                style={{
                  flex: 1,
                  padding: '9px',
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '14px',
                  fontWeight: 700,
                  transition: 'background 0.18s, color 0.18s',
                  background: mode === m ? 'var(--bg-elevated)' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--text-muted)',
                }}
              >
                {m === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <span style={labelStyle}>I am a</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['teacher', 'student'].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        style={{
                          flex: 1,
                          padding: '9px',
                          borderRadius: '999px',
                          border: '1px solid var(--border-gold)',
                          cursor: 'pointer',
                          fontFamily: 'Nunito, sans-serif',
                          fontSize: '14px',
                          fontWeight: 700,
                          transition: 'background 0.18s, color 0.18s',
                          background: role === r ? 'var(--gold)' : 'transparent',
                          color: role === r ? '#0F1720' : 'var(--text)',
                        }}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </div>
              </>
            )}

            <div>
              <label style={labelStyle}>Username</label>
              <input
                style={inputStyle}
                type="text"
                placeholder={mode === 'register' ? 'Username' : 'Username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
              {mode === 'register' && (
                <span style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '12px',
                  color: 'var(--text-muted)',
                  marginTop: '4px',
                  display: 'block',
                }}>
                  letters, numbers, underscores
                </span>
              )}
            </div>

            <div>
              <label style={labelStyle}>Password</label>
              <input
                style={inputStyle}
                type="password"
                placeholder={mode === 'register' ? 'Password (min 6 chars)' : 'Password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                required
              />
            </div>

            {mode === 'register' && (
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            )}

            {error && (
              <p style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: '#E05252',
                margin: 0,
                fontWeight: 600,
              }}>
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                fontSize: '15px',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
              whileHover={loading ? {} : { scale: 1.02 }}
              whileTap={loading ? {} : { scale: 0.98 }}
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </motion.button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              onClick={() => navigate('landing')}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '14px',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
              }}
            >
              Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
