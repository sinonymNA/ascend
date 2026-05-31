import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api.js';
import SoundService from '../../lib/sound.js';

const BOOST_META = {
  fifty:         { icon: '✂️', label: '50/50' },
  xp2x:          { icon: '⚡', label: '2× XP' },
  timefreeze:    { icon: '⏱️', label: 'Freeze' },
  streak_shield: { icon: '🛡️', label: 'Shield' },
};

/**
 * In-session boost activation bar.
 * Props:
 *   onFifty       — () => void   called when a 50/50 is activated
 *   onActivate    — (category) => void  generic notify
 */
export default function BoostBar({ onFifty, onActivate }) {
  const [boosts, setBoosts] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    api.get('/api/economy/inventory').then((d) => setBoosts(d.boosts || [])).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  const activate = async (b) => {
    if (busy || b.quantity <= 0) return;
    setBusy(true);
    SoundService.play('boost');
    try {
      await api.post('/api/economy/boost/activate', { item_id: b.item_id });
      if (b.category === 'fifty') onFifty?.();
      onActivate?.(b.category);
      load();
    } catch (_) {} finally { setBusy(false); }
  };

  const usable = boosts.filter((b) => b.quantity > 0);
  if (!usable.length) return null;

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', padding: '0 0 4px' }}>
      {usable.map((b) => {
        const meta = BOOST_META[b.category] || { icon: '⭐', label: b.category };
        return (
          <motion.button
            key={b.item_id}
            onClick={() => activate(b)}
            whileTap={{ scale: 0.92 }}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)',
              borderRadius: '14px', padding: '5px 10px', cursor: 'pointer',
              fontFamily: 'Nunito, sans-serif', fontSize: '12px', fontWeight: 700, color: 'var(--text)',
            }}
          >
            <span>{meta.icon}</span>
            <span>{meta.label}</span>
            <span style={{ color: 'var(--text-muted)' }}>×{b.quantity}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
