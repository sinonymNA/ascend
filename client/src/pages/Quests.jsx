import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import SoundService from '../lib/sound.js';
import WalletPill from '../components/economy/WalletPill.jsx';
import Icon from '../components/ui/Icon.jsx';

function QuestCard({ quest, onClaim, claiming }) {
  const pct = Math.min(100, Math.round((quest.progress / quest.target) * 100));
  const complete = quest.progress >= quest.target;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-elevated)', border: `1px solid ${complete && !quest.claimed ? 'var(--border-gold)' : 'var(--border)'}`,
        borderRadius: '16px', padding: '18px 20px', marginBottom: '12px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text)' }}>{quest.description}</span>
        <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
          {Math.min(quest.progress, quest.target)}/{quest.target}
        </span>
      </div>
      <div style={{ height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden', marginBottom: '12px', border: '1px solid var(--border)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }}
          style={{ height: '100%', background: complete ? '#52B788' : 'linear-gradient(90deg, #2D6A4F, #F5A623)', borderRadius: '4px' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          {quest.reward_coins > 0 && <><Icon name="coins" size={14} color="#F5A623" fill="rgba(245,166,35,0.25)" /> {quest.reward_coins}</>}
          {quest.reward_coins > 0 && quest.reward_gems > 0 && '  '}
          {quest.reward_gems > 0 && <><Icon name="gems" size={14} color="#60A5FA" fill="rgba(96,165,250,0.25)" /> {quest.reward_gems}</>}
        </span>
        {quest.claimed ? (
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#52B788', display: 'flex', alignItems: 'center', gap: '5px' }}><Icon name="check" size={14} color="#52B788" /> Claimed</span>
        ) : (
          <button
            onClick={() => onClaim(quest.quest_id)}
            disabled={!complete || claiming}
            className="btn-primary"
            style={{ padding: '7px 18px', fontSize: '13px', opacity: complete ? 1 : 0.4, cursor: complete ? 'pointer' : 'not-allowed' }}
          >
            {complete ? 'Claim' : 'In progress'}
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function Quests() {
  const { navigate, setWallet } = useApp();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const load = () => api.get('/api/quests/today').then((d) => { setQuests(d.quests || []); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const claim = async (questId) => {
    setClaiming(true);
    SoundService.play('quest-complete');
    try {
      const resp = await api.post('/api/quests/claim', { quest_id: questId });
      setWallet(resp.wallet);
      load();
    } catch (_) {} finally { setClaiming(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Nunito, sans-serif', paddingBottom: '40px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
        background: 'rgba(15,23,32,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>← Back</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', flex: 1 }}>Daily Quests</span>
        <WalletPill />
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '20px' }}>
          Complete quests to earn coins and gems. Resets daily.
        </p>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '40px' }}>Loading…</div>
        ) : (
          quests.map((q) => <QuestCard key={q.quest_id} quest={q} onClaim={claim} claiming={claiming} />)
        )}
      </div>
    </div>
  );
}
