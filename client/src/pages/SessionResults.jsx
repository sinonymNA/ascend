import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';

const SUBJECT_LABELS = {
  sat_math: 'SAT Math',
  sat_rw: 'SAT Reading & Writing',
  act_math: 'ACT Math',
  act_english: 'ACT English',
  act_reading: 'ACT Reading',
  act_science: 'ACT Science',
};

function MiniMountain() {
  return (
    <svg width="120" height="80" viewBox="0 0 300 200" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id="sglow" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#0F1720" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="140" rx="150" ry="70" fill="url(#sglow)" />
      <polygon points="0,160 80,90 130,120 180,70 240,110 300,80 300,200 0,200" fill="#1A2E20" />
      <polygon points="150,18 270,175 30,175" fill="#2D6A4F" />
      <polygon points="150,18 200,100 100,100" fill="#3D5A40" />
      <polygon points="150,18 178,72 122,72" fill="#E8F4F8" />
      <polygon points="150,18 162,52 140,55" fill="#ffffff" />
      <polygon points="0,175 60,130 120,155 150,140 180,155 240,128 300,175 300,200 0,200" fill="#1E2D18" />
    </svg>
  );
}

export default function SessionResults() {
  const { navigate, screenParams, user } = useApp();
  const {
    setTitle = 'Practice Session',
    masteredCount = 0,
    questionsTotal = 0,
    xpEarned = 0,
    streakBest = 0,
    subject,
    setId,
  } = screenParams || {};

  const canvasRef = useRef(null);
  const [shareReady, setShareReady] = useState(false);

  const subjectLabel = SUBJECT_LABELS[subject] || setTitle;
  const pct = questionsTotal > 0 ? Math.min(100, Math.round((masteredCount / questionsTotal) * 100)) : 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas(canvas);
    setShareReady(true);
  }, []);

  function drawCanvas(canvas) {
    const W = 1080, H = 1080;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0F1720';
    ctx.fillRect(0, 0, W, H);

    const bgGrad = ctx.createRadialGradient(W / 2, H * 0.4, 0, W / 2, H * 0.4, 600);
    bgGrad.addColorStop(0, 'rgba(45,106,79,0.14)');
    bgGrad.addColorStop(1, 'rgba(15,23,32,0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    const topBar = ctx.createLinearGradient(0, 0, W, 0);
    topBar.addColorStop(0, 'rgba(245,166,35,0)');
    topBar.addColorStop(0.5, 'rgba(245,166,35,0.8)');
    topBar.addColorStop(1, 'rgba(245,166,35,0)');
    ctx.fillStyle = topBar;
    ctx.fillRect(0, 0, W, 5);

    ctx.textAlign = 'center';
    ctx.font = 'bold 80px Georgia, serif';
    ctx.fillStyle = '#F5A623';
    ctx.fillText('SUMMIT', W / 2, 115);

    ctx.font = '200px serif';
    ctx.fillText('🏔️', W / 2, 370);

    ctx.font = 'bold 68px Arial, sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`${masteredCount} questions mastered`, W / 2, 510);

    ctx.font = '42px Arial, sans-serif';
    ctx.fillStyle = '#8A9BB0';
    ctx.fillText(subjectLabel, W / 2, 578);

    ctx.strokeStyle = 'rgba(245,166,35,0.22)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(W / 2 - 200, 620);
    ctx.lineTo(W / 2 + 200, 620);
    ctx.stroke();

    const stats = [
      { label: 'XP Earned', value: `${xpEarned}` },
      { label: 'Best Streak', value: `${streakBest}×` },
      { label: 'Level', value: String(user?.level || 1) },
    ];
    stats.forEach((s, i) => {
      const x = W / 2 + (i - 1) * 300;
      ctx.font = 'bold 60px Arial, sans-serif';
      ctx.fillStyle = '#F5A623';
      ctx.fillText(s.value, x, 730);
      ctx.font = '32px Arial, sans-serif';
      ctx.fillStyle = '#8A9BB0';
      ctx.fillText(s.label, x, 778);
    });

    ctx.font = 'bold 36px Arial, sans-serif';
    ctx.fillStyle = '#8A9BB0';
    ctx.fillText('Try it free → getsummit.app', W / 2, 930);

    const botBar = ctx.createLinearGradient(0, 0, W, 0);
    botBar.addColorStop(0, 'rgba(245,166,35,0)');
    botBar.addColorStop(0.5, 'rgba(245,166,35,0.6)');
    botBar.addColorStop(1, 'rgba(245,166,35,0)');
    ctx.fillStyle = botBar;
    ctx.fillRect(0, H - 5, W, 5);
  }

  async function handleShare() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      const file = new File([blob], 'summit-score.png', { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Summit Study',
            text: `I just mastered ${masteredCount} ${subjectLabel} questions on Summit! 🏔️`,
          });
          return;
        } catch (e) {
          if (e.name === 'AbortError') return;
        }
      }
      handleDownload();
    }, 'image/png');
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = 'summit-score.png';
    a.click();
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 24px',
      fontFamily: 'Nunito, sans-serif',
      textAlign: 'center',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '480px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <MiniMountain />
        </div>

        <h1 style={{
          fontFamily: 'Cinzel, serif',
          fontSize: 'clamp(22px, 5vw, 30px)',
          fontWeight: 700,
          color: '#F5A623',
          margin: '0 0 6px',
          letterSpacing: '0.04em',
        }}>
          Session Complete! 🏔️
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: '0 0 28px', fontWeight: 600 }}>
          {subjectLabel}
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
          {[
            { value: masteredCount, label: 'Mastered' },
            { value: `+${xpEarned}`, label: 'XP Earned' },
            { value: `${streakBest}×`, label: 'Best Streak' },
          ].map(({ value, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.3 }}
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '16px 20px',
                minWidth: '110px',
              }}
            >
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '26px', fontWeight: 700, color: '#F5A623', lineHeight: 1, marginBottom: '4px' }}>
                {value}
              </div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Progress bar */}
        {questionsTotal > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>Mastery Progress</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>{pct}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #2D6A4F, #F5A623)', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {setId && (
            <motion.button
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '16px' }}
              onClick={() => navigate('solo_game', { setId, setTitle, subject })}
              whileHover={{ scale: 1.03, boxShadow: '0 8px 28px rgba(245,166,35,0.35)' }}
              whileTap={{ scale: 0.97 }}
            >
              Climb Again →
            </motion.button>
          )}
          <motion.button
            className="btn-ghost"
            style={{ width: '100%', padding: '13px', fontSize: '15px' }}
            onClick={() => navigate('student_dashboard')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            All Subjects
          </motion.button>
        </div>

        {/* Share */}
        {shareReady && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <motion.button
              onClick={handleShare}
              style={{
                background: 'rgba(245,166,35,0.08)',
                border: '1px solid rgba(245,166,35,0.25)',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: '#F5A623',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              📤 Share Score
            </motion.button>
            <motion.button
              onClick={handleDownload}
              style={{
                background: 'none',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontFamily: 'Nunito, sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              ⬇️ Download
            </motion.button>
          </div>
        )}
      </motion.div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
