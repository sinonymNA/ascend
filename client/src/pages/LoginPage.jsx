import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';

export default function LoginPage() {
  const { loginUser, navigate, SERVER_URL } = useGame();
  const [tab, setTab] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (tab === 'register' && password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const endpoint = tab === 'register' ? '/auth/register' : '/auth/login';
      const res = await fetch(`${SERVER_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      loginUser({ authToken: data.token, userId: data.userId, username: data.username, gameState: data.gameState || null });
    } catch {
      setError('Cannot reach server. Progress will be saved locally.');
      // Allow play without server — create a local guest session
      loginUser({ authToken: `local_${Date.now()}`, userId: `guest_${Date.now()}`, username: username.trim() || 'Hero', gameState: null });
    } finally {
      setLoading(false);
    }
  }

  function playAsGuest() {
    loginUser({ authToken: `guest_${Date.now()}`, userId: `guest_${Date.now()}`, username: 'Hero', gameState: null });
  }

  return (
    <div className="page-container" style={{ justifyContent: 'center' }}>
      <StarField />
      <div className="content-max" style={{ maxWidth: 400 }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 56, marginBottom: 8 }}>⚔️</div>
            <h1 style={{
              fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 900,
              background: 'linear-gradient(135deg, #FFB830, #FF9500)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              marginBottom: 4,
            }}>
              ASCEND
            </h1>
            <p style={{ color: 'var(--text-dim)', fontSize: 14 }}>AP World History · Conquer the Ages</p>
          </div>

          {/* Tab toggle */}
          <div style={{ display: 'flex', background: 'var(--card)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {['login', 'register'].map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontSize: 14, fontWeight: 700, transition: 'all 0.2s',
                  background: tab === t ? 'var(--gold)' : 'transparent',
                  color: tab === t ? '#1a1a2e' : 'var(--text-dim)',
                }}
              >
                {t === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              minLength={3}
              style={{
                padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--card)', color: 'var(--text)', fontSize: 15,
                outline: 'none',
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
                background: 'var(--card)', color: 'var(--text)', fontSize: 15,
                outline: 'none',
              }}
            />
            {tab === 'register' && (
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
                style={{
                  padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border)',
                  background: 'var(--card)', color: 'var(--text)', fontSize: 15,
                  outline: 'none',
                }}
              />
            )}

            {error && (
              <p style={{ color: '#E8445A', fontSize: 13, textAlign: 'center', margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              style={{ width: '100%', fontSize: 15, marginTop: 4 }}
            >
              {loading ? '...' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <button
            onClick={playAsGuest}
            style={{
              width: '100%', marginTop: 12, padding: '12px 0', borderRadius: 12,
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-dim)', fontSize: 14, cursor: 'pointer',
            }}
          >
            Play as Guest (no save)
          </button>
        </motion.div>
      </div>
    </div>
  );
}
