import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import SoundService from '../lib/sound.js';
import WalletPill from '../components/economy/WalletPill.jsx';
import ItemCard from '../components/economy/ItemCard.jsx';
import Icon from '../components/ui/Icon.jsx';

const TABS = [
  { key: 'packs', icon: 'gift', label: 'Packs' },
  { key: 'inventory', icon: 'backpack', label: 'Collection' },
  { key: 'boosts', icon: 'boost', label: 'Boosts' },
];

const PACK_META = {
  standard: { name: 'Standard Pack', icon: 'box', desc: '3 items · mostly cosmetics', color: '#6B7E8F' },
  premium:  { name: 'Premium Pack', icon: 'gift', desc: '5 items · better odds', color: '#A78BFA' },
};

function PackCard({ pack, onOpen, opening, wallet }) {
  const meta = PACK_META[pack.type] || { name: pack.type, icon: 'box', desc: '', color: '#6B7E8F' };
  const canAfford = pack.currency === 'coins' ? wallet.coins >= pack.cost : wallet.gems >= pack.cost;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{
        background: 'var(--bg-elevated)', border: `2px solid ${meta.color}`,
        borderRadius: '18px', padding: '24px', textAlign: 'center',
        boxShadow: `0 0 24px ${meta.color}33`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        <Icon name={meta.icon} size={52} color={meta.color} fill={`${meta.color}33`} />
      </div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: '17px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>{meta.name}</div>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '16px' }}>{meta.desc}</div>
      <motion.button
        onClick={() => onOpen(pack.type)}
        disabled={opening || !canAfford}
        whileHover={canAfford ? { scale: 1.04 } : {}}
        whileTap={canAfford ? { scale: 0.97 } : {}}
        className="btn-primary"
        style={{
          width: '100%', padding: '12px', fontSize: '15px',
          opacity: (!canAfford || opening) ? 0.5 : 1,
          cursor: (!canAfford || opening) ? 'not-allowed' : 'pointer',
          background: pack.currency === 'gems' ? '#60A5FA' : undefined,
        }}
      >
        {opening ? 'Opening…' : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            Open · {pack.cost}
            <Icon
              name={pack.currency === 'gems' ? 'gems' : 'coins'}
              size={15}
              color={pack.currency === 'gems' ? '#60A5FA' : '#F5A623'}
              fill={pack.currency === 'gems' ? 'rgba(96,165,250,0.25)' : 'rgba(245,166,35,0.25)'}
            />
          </span>
        )}
      </motion.button>
      {!canAfford && (
        <div style={{ fontSize: '11px', color: 'var(--sunset)', fontWeight: 700, marginTop: '8px' }}>
          Not enough {pack.currency === 'gems' ? 'gems' : 'coins'}
        </div>
      )}
    </motion.div>
  );
}

export default function Shop() {
  const { navigate, wallet, setWallet } = useApp();
  const [tab, setTab] = useState('packs');
  const [packs, setPacks] = useState([]);
  const [inventory, setInventory] = useState({ cosmetics: [], boosts: [] });
  const [opening, setOpening] = useState(false);

  const loadInventory = useCallback(() => {
    api.get('/api/economy/inventory').then(setInventory).catch(() => {});
  }, []);

  useEffect(() => {
    api.get('/api/packs/types').then((d) => setPacks(d.packs || [])).catch(() => {});
    loadInventory();
    api.get('/api/economy/wallet').then(setWallet).catch(() => {});
  }, [loadInventory, setWallet]);

  const openPack = async (type) => {
    setOpening(true);
    SoundService.play('click');
    try {
      const resp = await api.post('/api/packs/open', { type });
      setWallet(resp.wallet);
      navigate('pack_open', { results: resp.results, packType: type });
    } catch (e) {
      alert(e.message || 'Failed to open pack');
    } finally {
      setOpening(false);
    }
  };

  const equip = async (item) => {
    SoundService.play('click');
    try {
      await api.post('/api/economy/equip', { item_id: item.item_id, equipped: !item.equipped });
      loadInventory();
    } catch (_) {}
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Nunito, sans-serif', paddingBottom: '40px' }}>
      {/* Nav */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px',
        background: 'rgba(15,23,32,0.9)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <button onClick={() => navigate('student_dashboard')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>← Back</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: '16px', fontWeight: 700, color: 'var(--gold)', flex: 1 }}>Shop</span>
        <WalletPill />
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '20px 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, background: tab === t.key ? 'var(--gold)' : 'var(--bg-elevated)',
              color: tab === t.key ? '#0F1720' : 'var(--text-muted)', border: 'none',
              borderRadius: '20px', padding: '10px', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}><Icon name={t.icon} size={16} /> {t.label}</button>
          ))}
        </div>

        {tab === 'packs' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {packs.map((p) => <PackCard key={p.type} pack={p} onOpen={openPack} opening={opening} wallet={wallet} />)}
          </div>
        )}

        {tab === 'inventory' && (
          inventory.cosmetics.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '40px' }}>
              No cosmetics yet — open a pack to start your collection!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {inventory.cosmetics.map((c) => (
                <ItemCard key={c.item_id} item={c} equipped={c.equipped} owned compact onClick={() => equip(c)} />
              ))}
            </div>
          )
        )}

        {tab === 'boosts' && (
          inventory.boosts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, padding: '40px' }}>
              No boosts yet — find them in packs! Activate them during a climb.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
              {inventory.boosts.map((b) => (
                <ItemCard key={b.item_id} item={b} quantity={b.quantity} owned compact />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
