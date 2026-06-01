import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import SoundService from '../lib/sound.js';
import WalletPill from '../components/economy/WalletPill.jsx';
import Icon from '../components/ui/Icon.jsx';

export default function SeasonPass() {
  const { navigate, setWallet } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const load = () => api.get('/api/season/track').then((d) => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const claim = async (tierIndex) => {
    setClaiming(true);
    SoundService.play('quest-complete');
    try {
      const resp = await api.post('/api/season/claim', { tier_index: tierIndex });
      setWallet(resp.wallet);
      load();
    } catch (_) {} finally { setClaiming(false); }
  };

  const seasonXp = data?.seasonXp || 0;
  const claimed = data?.claimed || [];
  const tiers = data?.tiers || [];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Nunito, sans-serif', paddingBottom: '40px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
        background: 'rgba(15,23,32,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>← Back</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', flex: 1 }}>Season Pass</span>
        <WalletPill />
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '40px' }}>Loading…</div>
        ) : (
          <>
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '18px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{data?.season?.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{seasonXp.toLocaleString()} season XP earned</div>
            </div>

            <div style={{ position: 'relative' }}>
              {tiers.map((t, i) => {
                const reached = seasonXp >= t.xp_required;
                const isClaimed = claimed.includes(t.tier_index);
                return (
                  <div key={t.tier_index} style={{ display: 'flex', gap: '14px', marginBottom: '4px' }}>
                    {/* Track line + node */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '32px' }}>
                      <div style={{ width: '2px', flex: 1, background: i === 0 ? 'transparent' : (reached ? 'var(--gold)' : 'var(--border)') }} />
                      <div style={{
                        width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                        background: reached ? 'var(--gold)' : 'var(--bg-elevated)',
                        border: `2px solid ${reached ? 'var(--gold)' : 'var(--border)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: 800, color: reached ? '#0F1720' : 'var(--text-muted)',
                      }}>{t.tier_index}</div>
                      <div style={{ width: '2px', flex: 1, background: i === tiers.length - 1 ? 'transparent' : (seasonXp >= (tiers[i + 1]?.xp_required || Infinity) ? 'var(--gold)' : 'var(--border)') }} />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}
                      style={{
                        flex: 1, margin: '6px 0', background: 'var(--bg-elevated)',
                        border: `1px solid ${reached && !isClaimed ? 'var(--border-gold)' : 'var(--border)'}`,
                        borderRadius: '12px', padding: '12px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        opacity: reached ? 1 : 0.6,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                          {t.reward_item && <><Icon name="gift" size={14} color="#A78BFA" /> {t.reward_item.replace(/_/g, ' ')}</>}
                          {t.reward_coins > 0 && <><Icon name="coins" size={14} color="#F5A623" fill="rgba(245,166,35,0.25)" /> {t.reward_coins}</>}
                          {t.reward_gems > 0 && <><Icon name="gems" size={14} color="#60A5FA" fill="rgba(96,165,250,0.25)" /> {t.reward_gems}</>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.xp_required.toLocaleString()} XP</div>
                      </div>
                      {isClaimed ? (
                        <Icon name="check" size={14} color="#52B788" />
                      ) : reached ? (
                        <button onClick={() => claim(t.tier_index)} disabled={claiming} className="btn-primary" style={{ padding: '6px 14px', fontSize: '12px' }}>Claim</button>
                      ) : (
                        <Icon name="lock" size={13} color="var(--text-muted)" />
                      )}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
