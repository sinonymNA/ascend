import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import SoundService from '../lib/sound.js';

// ─── Decorative SVG ───────────────────────────────────────────────────────────

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
      <polygon points="0,110 45,78 80,95 90,88 100,95 138,75 180,110" fill="#1A2E20" />
    </svg>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, id }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      onClick={() => onChange(!checked)}
      style={{
        position: 'relative',
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        background: checked ? 'var(--gold)' : 'var(--bg-elevated)',
        border: `2px solid ${checked ? 'var(--gold)' : 'var(--border)'}`,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: checked ? '#0F1720' : 'var(--text-muted)',
          transition: 'left 0.18s ease, background 0.2s',
        }}
      />
    </button>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '18px',
        padding: '28px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <h2
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '17px',
            fontWeight: 800,
            color: 'var(--text)',
            margin: 0,
          }}
        >
          {title}
        </h2>
      </div>
      {children}
    </motion.div>
  );
}

// ─── Form field helper ────────────────────────────────────────────────────────

function Field({ label, htmlFor, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label
        htmlFor={htmlFor}
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </label>
      {children}
      {hint && (
        <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
          {hint}
        </p>
      )}
    </div>
  );
}

// ─── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({ onClose, onConfirm, loading }) {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'DELETE';

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
        background: 'rgba(10,16,26,0.8)',
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
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.22 }}
        style={{
          background: 'var(--bg-elevated)',
          border: '1px solid rgba(232,93,74,0.3)',
          borderRadius: '20px',
          padding: '32px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <h2
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '20px',
            fontWeight: 800,
            color: 'var(--sunset, #E85D4A)',
            margin: '0 0 12px',
          }}
        >
          Delete Account
        </h2>
        <p
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '14px',
            color: 'var(--text-mid)',
            margin: '0 0 20px',
            lineHeight: 1.6,
          }}
        >
          This action is <strong style={{ color: 'var(--text)' }}>permanent and irreversible</strong>. All your classes, question sets, and data will be deleted.
        </p>
        <p
          style={{
            fontFamily: 'Nunito, sans-serif',
            fontSize: '13px',
            color: 'var(--text-muted)',
            margin: '0 0 10px',
            fontWeight: 700,
          }}
        >
          Type <span style={{ color: 'var(--sunset, #E85D4A)', letterSpacing: '0.05em' }}>DELETE</span> to confirm:
        </p>
        <input
          className="input-field"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="DELETE"
          style={{ marginBottom: '20px' }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </button>
          <button
            className="btn-danger"
            onClick={onConfirm}
            disabled={!canDelete || loading}
            style={{ flex: 1 }}
          >
            {loading ? 'Deleting…' : 'Delete Account'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Save indicator ───────────────────────────────────────────────────────────

function SaveStatus({ status }) {
  if (!status) return null;
  const isError = status.startsWith('Error');
  return (
    <AnimatePresence>
      <motion.span
        key={status}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0 }}
        style={{
          fontFamily: 'Nunito, sans-serif',
          fontSize: '13px',
          fontWeight: 700,
          color: isError ? 'var(--sunset, #E85D4A)' : 'var(--pine-light)',
        }}
      >
        {isError ? '✗ ' : '✓ '}{status}
      </motion.span>
    </AnimatePresence>
  );
}

// ─── Settings page ────────────────────────────────────────────────────────────

export default function Settings() {
  const { navigate, user, setUser, token, setToken } = useApp();

  // If not authenticated, redirect
  useEffect(() => {
    if (!token) navigate('landing');
  }, [token, navigate]);

  // 1. Profile state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileStatus, setProfileStatus] = useState('');

  // 2. Subscription state
  const [subLoading, setSubLoading] = useState(false);
  const isPro = user?.subscription === 'pro';

  // 3. Notification prefs
  const [notifAssignment, setNotifAssignment] = useState(
    user?.notifications?.assignment_complete ?? true
  );
  const [notifWeekly, setNotifWeekly] = useState(
    user?.notifications?.weekly_summary ?? false
  );
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifStatus, setNotifStatus] = useState('');

  // 4. Sound
  const [soundMuted, setSoundMuted] = useState(SoundService.muted);

  // 5. Danger zone
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync from context user when it updates
  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setNotifAssignment(user.notifications?.assignment_complete ?? true);
      setNotifWeekly(user.notifications?.weekly_summary ?? false);
    }
  }, [user]);

  // ── Profile save ──────────────────────────────────────────────────────────

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    setProfileSaving(true);
    setProfileStatus('');
    try {
      const updated = await api.patch('/api/users/me', { name: profileName.trim() });
      setUser((prev) => ({ ...prev, ...updated, name: profileName.trim() }));
      setProfileStatus('Saved');
    } catch (err) {
      setProfileStatus(`Error: ${err.message || 'Failed to save'}`);
    } finally {
      setProfileSaving(false);
      setTimeout(() => setProfileStatus(''), 3000);
    }
  };

  // ── Subscription actions ──────────────────────────────────────────────────

  const handleUpgrade = async () => {
    setSubLoading(true);
    try {
      const res = await api.post('/api/payments/create-checkout', { plan: 'pro_monthly' });
      if (res.url) window.location.href = res.url;
    } catch (err) {
      alert(err.message || 'Failed to start checkout');
    } finally {
      setSubLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setSubLoading(true);
    try {
      const res = await api.post('/api/payments/portal');
      if (res.url) window.location.href = res.url;
    } catch (err) {
      alert(err.message || 'Failed to open portal');
    } finally {
      setSubLoading(false);
    }
  };

  // ── Notification save ──────────────────────────────────────────────────────

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setNotifSaving(true);
    setNotifStatus('');
    try {
      await api.patch('/api/users/me/notifications', {
        assignment_complete: notifAssignment,
        weekly_summary: notifWeekly,
      });
      setUser((prev) => ({
        ...prev,
        notifications: { assignment_complete: notifAssignment, weekly_summary: notifWeekly },
      }));
      setNotifStatus('Saved');
    } catch (err) {
      setNotifStatus(`Error: ${err.message || 'Failed to save'}`);
    } finally {
      setNotifSaving(false);
      setTimeout(() => setNotifStatus(''), 3000);
    }
  };

  // ── Delete account ─────────────────────────────────────────────────────────

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/api/users/me');
      setToken(null);
      setUser(null);
      navigate('landing');
    } catch (err) {
      alert(err.message || 'Failed to delete account');
      setDeleteLoading(false);
    }
  };

  // ── Avatar ─────────────────────────────────────────────────────────────────

  const displayName = profileName || user?.email?.split('@')[0] || 'T';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (!token) return null;

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
          onClick={() => navigate(user?.role === 'student' ? 'student_dashboard' : 'teacher_dashboard')}
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
          onClick={() => navigate(user?.role === 'student' ? 'student_dashboard' : 'teacher_dashboard')}
        >
          ← Dashboard
        </button>
      </nav>

      {/* ── Main ── */}
      <main
        style={{
          flex: 1,
          maxWidth: '680px',
          width: '100%',
          margin: '0 auto',
          padding: '40px 24px 60px',
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 'clamp(22px, 4vw, 28px)',
            fontWeight: 700,
            color: 'var(--gold)',
            letterSpacing: '0.08em',
            margin: 0,
          }}
        >
          Settings
        </motion.h1>

        {/* ── 1. Profile ── */}
        <SectionCard title="Profile" icon="👤">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'Cinzel, serif',
                fontSize: '18px',
                fontWeight: 700,
                color: '#E8F4F8',
                border: '2px solid var(--border-gold)',
                flexShrink: 0,
              }}
            >
              {initials}
            </div>
            <div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '15px', fontWeight: 800, color: 'var(--text)', margin: '0 0 2px' }}>
                {displayName}
              </p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                {user?.email || '—'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Display Name" htmlFor="profile-name">
              <input
                id="profile-name"
                className="input-field"
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="Your name"
                required
              />
            </Field>

            <Field
              label="Email"
              htmlFor="profile-email"
              hint="Email is managed through your sign-in provider and cannot be changed here."
            >
              <input
                id="profile-email"
                className="input-field"
                type="email"
                value={user?.email || ''}
                readOnly
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={profileSaving || !profileName.trim()}
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                {profileSaving ? 'Saving…' : 'Save Profile'}
              </button>
              <SaveStatus status={profileStatus} />
            </div>
          </form>
        </SectionCard>

        {/* ── 2. Subscription ── */}
        <SectionCard title="Subscription" icon="🏔️">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '12px' }}>
                Current Plan
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontFamily: 'Cinzel, serif',
                    fontSize: '20px',
                    fontWeight: 700,
                    color: isPro ? 'var(--gold)' : 'var(--text-mid)',
                  }}
                >
                  {isPro ? 'Pro' : 'Free'}
                </span>
                {isPro && (
                  <span
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#0F1720',
                      background: 'var(--gold)',
                      padding: '2px 8px',
                      borderRadius: '8px',
                    }}
                  >
                    ACTIVE
                  </span>
                )}
              </div>
            </div>

            {isPro ? (
              <button
                className="btn-secondary"
                onClick={handleManageSubscription}
                disabled={subLoading}
                style={{ fontSize: '14px', padding: '10px 22px' }}
              >
                {subLoading ? 'Opening…' : 'Manage Subscription →'}
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={handleUpgrade}
                disabled={subLoading}
                style={{ fontSize: '14px', padding: '10px 22px' }}
              >
                {subLoading ? 'Loading…' : '🏔️ Upgrade to Pro — $12/mo'}
              </button>
            )}
          </div>

          {!isPro && (
            <div
              style={{
                background: 'rgba(245,166,35,0.06)',
                border: '1px solid var(--border-gold)',
                borderRadius: '12px',
                padding: '14px 18px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Nunito, sans-serif',
                  fontSize: '13px',
                  color: 'var(--text-mid)',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                Free plan includes Unit 1 of AP World History. Upgrade to unlock all units, subjects, and AI-powered question generation.
              </p>
            </div>
          )}
        </SectionCard>

        {/* ── 3. Notifications ── */}
        <SectionCard title="Notification Preferences" icon="🔔">
          <form onSubmit={handleSaveNotifications} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Toggle row */}
            {[
              {
                id: 'notif-assignment',
                label: 'Student Assignment Completion',
                description: 'Email you when students complete assigned question sets',
                checked: notifAssignment,
                onChange: setNotifAssignment,
              },
              {
                id: 'notif-weekly',
                label: 'Weekly Class Summary',
                description: 'Receive a weekly report of class mastery progress',
                checked: notifWeekly,
                onChange: setNotifWeekly,
              },
            ].map(({ id, label, description, checked, onChange }) => (
              <div
                key={id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: '16px',
                  paddingBottom: '16px',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={id}
                    style={{
                      fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--text)',
                      display: 'block',
                      marginBottom: '4px',
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </label>
                  <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {description}
                  </p>
                </div>
                <Toggle id={id} checked={checked} onChange={onChange} />
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button
                type="submit"
                className="btn-primary"
                disabled={notifSaving}
                style={{ padding: '10px 24px', fontSize: '14px' }}
              >
                {notifSaving ? 'Saving…' : 'Save Preferences'}
              </button>
              <SaveStatus status={notifStatus} />
            </div>
          </form>
        </SectionCard>

        {/* ── 3b. Sound & Streak ── */}
        <SectionCard title="Sound & Progress" icon="🔊">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                Sound Effects
              </p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                {soundMuted ? 'Sounds are off' : 'Sounds are on'}
              </p>
            </div>
            <Toggle
              id="sound-toggle"
              checked={!soundMuted}
              onChange={(val) => {
                const muted = !val;
                setSoundMuted(muted);
                SoundService.setMuted(muted);
                if (!muted) SoundService.play('click');
              }}
            />
          </div>

          {/* Streak info */}
          <div style={{
            background: 'rgba(245,166,35,0.06)',
            border: '1px solid var(--border-gold)',
            borderRadius: '12px',
            padding: '14px 18px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 800, color: '#F5A623', margin: '0 0 2px' }}>
                  🔥 {user?.login_streak || 0}-Day Streak
                </p>
                <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                  {user?.streak_shield_count || 0} streak shield{(user?.streak_shield_count || 0) !== 1 ? 's' : ''} available
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px' }}>🛡️</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  ×{user?.streak_shield_count || 0}
                </div>
              </div>
            </div>
            <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '11px', color: 'var(--text-muted)', margin: '10px 0 0', lineHeight: 1.5 }}>
              Shields protect your streak if you miss a day. Earn 1 shield every 7-day streak milestone.
            </p>
          </div>
        </SectionCard>

        {/* ── 4. Danger Zone ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            background: 'rgba(232,93,74,0.06)',
            border: '1px solid rgba(232,93,74,0.25)',
            borderRadius: '18px',
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <h2
              style={{
                fontFamily: 'Nunito, sans-serif',
                fontSize: '17px',
                fontWeight: 800,
                color: 'var(--sunset, #E85D4A)',
                margin: 0,
              }}
            >
              Danger Zone
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '14px', fontWeight: 800, color: 'var(--text)', margin: '0 0 4px' }}>
                Delete Account
              </p>
              <p style={{ fontFamily: 'Nunito, sans-serif', fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <button
              className="btn-danger"
              onClick={() => setShowDeleteModal(true)}
              style={{ fontSize: '14px', padding: '10px 20px', flexShrink: 0 }}
            >
              Delete Account
            </button>
          </div>
        </motion.div>
      </main>

      {/* ── Delete Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteModal && (
          <DeleteConfirmModal
            onClose={() => setShowDeleteModal(false)}
            onConfirm={handleDeleteAccount}
            loading={deleteLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
