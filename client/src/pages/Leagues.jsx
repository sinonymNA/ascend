import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import WalletPill from '../components/economy/WalletPill.jsx';

const TIER_META = {
  bronze:   { name: 'Bronze',   color: '#CD7F32', emoji: '🥉' },
  silver:   { name: 'Silver',   color: '#C0C0C0', emoji: '🥈' },
  gold:     { name: 'Gold',     color: '#F5A623', emoji: '🥇' },
  sapphire: { name: 'Sapphire', color: '#4A90D9', emoji: '💠' },
  ruby:     { name: 'Ruby',     color: '#E85D4A', emoji: '🔴' },
  diamond:  { name: 'Diamond',  color: '#A78BFA', emoji: '💎' },
};

export default function Leagues() {
  const { navigate, user } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/leagues/me').then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const tier = TIER_META[data?.tier] || TIER_META.bronze;
  const members = data?.members || [];
  const promoteCount = data?.promoteCount || 7;
  const relegateCount = data?.relegateCount || 7;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Nunito, sans-serif', paddingBottom: '40px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
        background: 'rgba(15,23,32,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>← Back</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', flex: 1 }}>League</span>
        <WalletPill />
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '40px' }}>Loading…</div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '52px' }}>{tier.emoji}</div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: tier.color }}>{tier.name} League</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                Top {promoteCount} promote · Bottom {relegateCount} relegate · Resets Monday
              </div>
            </div>

            {members.map((m, i) => {
              const isYou = m.id === user?.id;
              const promoteZone = i < promoteCount;
              const relegateZone = i >= members.length - relegateCount && members.length > promoteCount;
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px',
                    marginBottom: '4px', borderRadius: '12px',
                    background: isYou ? 'rgba(245,166,35,0.1)' : 'transparent',
                    border: isYou ? '1px solid var(--border-gold)' : '1px solid transparent',
                    borderLeft: promoteZone ? '3px solid #52B788' : relegateZone ? '3px solid #E85D4A' : '3px solid transparent',
                  }}
                >
                  <span style={{ width: '24px', textAlign: 'center', fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: m.climber_color || '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: '#0F1720' }}>
                    {(m.username || '?')[0].toUpperCase()}
                  </div>
                  <span style={{ flex: 1, fontSize: '14px', fontWeight: 800, color: isYou ? 'var(--gold)' : 'var(--text)' }}>
                    {m.username} {isYou && '(you)'}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: tier.color }}>{m.weekly_xp} XP</span>
                </motion.div>
              );
            })}

            {members.length <= 1 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '20px', fontSize: '13px' }}>
                You're first in your cohort — earn weekly XP to climb the ranks. More players will join as they play.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
