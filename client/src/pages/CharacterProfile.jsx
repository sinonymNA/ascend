'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import WalletPill from '../components/economy/WalletPill.jsx';

// ── Level formula: 1000 XP per level, logarithmic scale ──────────────────────
function xpToLevel(xp) {
  if (!xp || xp <= 0) return { level: 1, current: 0, next: 1000, pct: 0 };
  const level = Math.floor(Math.log2(xp / 500 + 1)) + 1;
  const xpAtLevel = (Math.pow(2, level - 1) - 1) * 500;
  const xpAtNext = (Math.pow(2, level) - 1) * 500;
  const pct = Math.round(((xp - xpAtLevel) / (xpAtNext - xpAtLevel)) * 100);
  return { level, current: xp - xpAtLevel, next: xpAtNext - xpAtLevel, pct: Math.min(pct, 99) };
}

const RARITY_CONFIG = {
  legendary: { color: '#F5A623', label: 'LEGENDARY', glow: '#F5A62340' },
  epic: { color: '#A78BFA', label: 'EPIC', glow: '#A78BFA30' },
  rare: { color: '#4A90D9', label: 'RARE', glow: '#4A90D925' },
  common: { color: 'rgba(255,255,255,0.5)', label: 'COMMON', glow: 'rgba(255,255,255,0.05)' },
};

const TYPE_LABEL = {
  avatar_frame: 'Frame',
  title: 'Title',
  emoji_avatar: 'Avatar',
  background: 'Background',
  trail: 'Trail',
  badge: 'Badge',
};

// ── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ icon, label, value, accent = '#C8A96E' }) {
  return (
    <div style={{
      background: `${accent}0D`,
      border: `1px solid ${accent}25`,
      borderRadius: 10, padding: '10px 14px',
      textAlign: 'center', flex: 1, minWidth: 80,
    }}>
      <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: accent }}>{value}</div>
      <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600, marginTop: 2, letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}

// ── Cosmetic item card ────────────────────────────────────────────────────────
function CosmeticCard({ item, onEquip, onUnequip }) {
  const rc = RARITY_CONFIG[item.rarity] || RARITY_CONFIG.common;
  const isEquipped = item.equipped;
  const typeLabel = TYPE_LABEL[item.item_type] || item.item_type;

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: `0 8px 24px ${rc.glow}` }}
      whileTap={{ scale: 0.96 }}
      style={{
        background: isEquipped ? `${rc.color}12` : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isEquipped ? rc.color + '50' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12, padding: '12px 10px',
        textAlign: 'center', cursor: 'pointer',
        position: 'relative', overflow: 'hidden',
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onClick={() => isEquipped ? onUnequip(item) : onEquip(item)}
    >
      {/* Equipped badge */}
      {isEquipped && (
        <div style={{
          position: 'absolute', top: 5, right: 5,
          background: rc.color, borderRadius: 4,
          padding: '1px 5px', fontSize: 7.5, fontWeight: 900,
          color: '#060402', letterSpacing: '0.1em',
        }}>
          ON
        </div>
      )}

      {/* Item display */}
      <div style={{ fontSize: 28, marginBottom: 6, filter: `drop-shadow(0 2px 8px ${rc.glow})` }}>
        {item.item_type === 'emoji_avatar' ? item.value :
          item.item_type === 'title' ? '🏷' :
          item.item_type === 'avatar_frame' ? '🖼' :
          item.item_type === 'background' ? '🎨' :
          item.item_type === 'trail' ? '✨' : '⭐'}
      </div>

      {/* Name */}
      <div style={{
        fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.8)',
        lineHeight: 1.3, marginBottom: 4,
      }}>
        {item.name}
      </div>

      {/* Type + rarity */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)',
          background: 'rgba(255,255,255,0.06)', borderRadius: 4, padding: '1px 5px',
          letterSpacing: '0.06em',
        }}>
          {typeLabel.toUpperCase()}
        </span>
        <span style={{
          fontSize: 8, fontWeight: 800, color: rc.color,
          background: `${rc.color}14`, borderRadius: 4, padding: '1px 5px',
          letterSpacing: '0.06em',
        }}>
          {rc.label}
        </span>
      </div>

      {item.item_type === 'title' && (
        <div style={{ fontSize: 9, color: rc.color + 'aa', marginTop: 4, fontStyle: 'italic' }}>
          "{item.value}"
        </div>
      )}
    </motion.div>
  );
}

// ── Empty inventory placeholder ───────────────────────────────────────────────
function EmptyInventory({ onShop }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ textAlign: 'center', padding: '40px 20px' }}
    >
      <div style={{ fontSize: 40, marginBottom: 12 }}>🎁</div>
      <div style={{ fontFamily: 'Cinzel, serif', fontSize: 15, color: 'rgba(200,169,110,0.7)', marginBottom: 6 }}>
        No Cosmetics Yet
      </div>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 20, lineHeight: 1.6, maxWidth: 260, margin: '0 auto 20px' }}>
        Open packs to earn avatar frames, titles, trails, and legendary gear.
      </p>
      <button
        onClick={onShop}
        style={{
          background: 'linear-gradient(135deg, #6B4914, #C8A96E)',
          border: 'none', borderRadius: 10, padding: '10px 24px',
          fontSize: 13, fontWeight: 800, color: '#1a1208', cursor: 'pointer',
          letterSpacing: '0.04em',
        }}
      >
        Open Packs ✦
      </button>
    </motion.div>
  );
}

// ── Equipped slots display ────────────────────────────────────────────────────
function EquippedSlots({ cosmetics }) {
  const equipped = (cosmetics || []).filter((c) => c.equipped);
  const avatar = equipped.find((c) => c.item_type === 'emoji_avatar');
  const title = equipped.find((c) => c.item_type === 'title');
  const frame = equipped.find((c) => c.item_type === 'avatar_frame');

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
      {[
        { slot: 'avatar', label: 'Avatar', value: avatar?.value || '🧙', color: avatar ? '#F5A623' : 'rgba(255,255,255,0.2)' },
        { slot: 'frame', label: 'Frame', value: frame?.name || 'Default', color: frame ? '#A78BFA' : 'rgba(255,255,255,0.2)' },
        { slot: 'title', label: 'Title', value: title?.value || 'Scholar', color: title ? '#C8A96E' : 'rgba(255,255,255,0.2)' },
      ].map(({ slot, label, value, color }) => (
        <div key={slot} style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${color}30`,
          borderRadius: 10, padding: '8px 14px', textAlign: 'center',
          minWidth: 80,
        }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>
            {label}
          </div>
          <div style={{ fontSize: slot === 'avatar' ? 24 : 12, color, fontWeight: slot === 'avatar' ? 400 : 700, lineHeight: 1.3 }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main CharacterProfile ─────────────────────────────────────────────────────

export default function CharacterProfile() {
  const { navigate, user } = useApp();
  const [inventory, setInventory] = useState({ cosmetics: [], boosts: [] });
  const [progress, setProgress] = useState(null);
  const [tab, setTab] = useState('cosmetics');
  const [loading, setLoading] = useState(true);
  const [equipping, setEquipping] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/economy/inventory').catch(() => ({ cosmetics: [], boosts: [] })),
      api.get('/api/progress/solo').catch(() => null),
    ]).then(([inv, prog]) => {
      setInventory(inv);
      setProgress(prog);
    }).finally(() => setLoading(false));
  }, []);

  const handleEquip = useCallback(async (item) => {
    if (equipping) return;
    setEquipping(item.id);
    try {
      await api.post('/api/economy/equip', { itemId: item.id, equip: !item.equipped });
      setInventory((prev) => ({
        ...prev,
        cosmetics: prev.cosmetics.map((c) =>
          c.item_type === item.item_type
            ? { ...c, equipped: c.id === item.id ? !item.equipped : false }
            : c
        ),
      }));
    } catch (e) {
      console.error('Equip failed:', e);
    } finally {
      setEquipping(null);
    }
  }, [equipping]);

  // Compute total XP from progress data
  const totalXP = progress
    ? Object.values(progress).reduce((s, sub) => s + (sub?.total_xp || 0), 0)
    : 0;
  const { level, current, next, pct: xpPct } = xpToLevel(totalXP);

  const displayName = user?.name || user?.email?.split('@')[0] || 'Scholar';
  const cosmetics = inventory.cosmetics || [];
  const equippedAvatar = cosmetics.find((c) => c.item_type === 'emoji_avatar' && c.equipped);
  const equippedTitle = cosmetics.find((c) => c.item_type === 'title' && c.equipped);

  const filteredCosmetics = tab === 'cosmetics' ? cosmetics : inventory.boosts || [];

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Nunito, sans-serif',
      background: 'radial-gradient(ellipse at 50% 0%, rgba(20,10,30,0.98) 0%, rgba(5,4,8,1) 60%)',
    }}>
      {/* ── Nav ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'rgba(6,5,10,0.9)', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(167,139,250,0.12)',
      }}>
        <button
          onClick={() => navigate('student_dashboard')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
          }}
        >
          ← Back
        </button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.06em' }}>
          ✦ Character
        </span>
        <WalletPill onClick={() => navigate('shop')} />
      </nav>

      <main style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 80px' }}>

        {/* ── Character hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            background: 'linear-gradient(135deg, rgba(30,15,50,0.95), rgba(20,10,35,0.9))',
            border: '1px solid rgba(167,139,250,0.25)',
            borderRadius: 20, padding: '32px 24px 28px',
            textAlign: 'center', marginBottom: 20,
            boxShadow: '0 20px 60px rgba(167,139,250,0.08)',
          }}
        >
          {/* Avatar */}
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 90, height: 90, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05))',
              border: '2px solid rgba(167,139,250,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              fontSize: 44,
              boxShadow: '0 0 30px rgba(167,139,250,0.2)',
            }}
          >
            {equippedAvatar?.value || '🧙'}
          </motion.div>

          {/* Name + title */}
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: 20, fontWeight: 700, color: '#A78BFA', marginBottom: 4 }}>
            {displayName}
          </div>
          {equippedTitle && (
            <div style={{ fontSize: 12, color: '#C8A96E', fontStyle: 'italic', marginBottom: 4 }}>
              "{equippedTitle.value}"
            </div>
          )}
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em' }}>
            LEVEL {level} SCHOLAR
          </div>

          {/* XP bar */}
          <div style={{ margin: '20px 0 0' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              fontSize: 10.5, color: 'rgba(255,255,255,0.4)', fontWeight: 700, marginBottom: 6,
            }}>
              <span>{current.toLocaleString()} XP</span>
              <span>{next.toLocaleString()} XP to Level {level + 1}</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 3, overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpPct}%` }}
                transition={{ delay: 0.4, duration: 0.9, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(90deg, #6B3FA0, #A78BFA)',
                  borderRadius: 3,
                  boxShadow: '0 0 8px rgba(167,139,250,0.4)',
                }}
              />
            </div>
          </div>

          {/* Equipped slots */}
          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', marginBottom: 10, textTransform: 'uppercase' }}>
              Equipped
            </div>
            <EquippedSlots cosmetics={cosmetics} />
          </div>
        </motion.div>

        {/* ── Stats row ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}
        >
          <StatPill icon="⚡" label="Total XP" value={totalXP > 0 ? totalXP.toLocaleString() : '—'} accent="#F5A623" />
          <StatPill icon="🎒" label="Cosmetics" value={cosmetics.length} accent="#A78BFA" />
          <StatPill icon="🧪" label="Boosts" value={(inventory.boosts || []).reduce((s, b) => s + (b.quantity || 0), 0)} accent="#52B788" />
        </motion.div>

        {/* ── Inventory section ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, overflow: 'hidden',
          }}>
            {/* Tab bar */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {[
                { key: 'cosmetics', label: '🎨 Collection', count: cosmetics.length },
                { key: 'boosts', label: '🧪 Boosts', count: (inventory.boosts || []).length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  style={{
                    flex: 1, padding: '14px 12px',
                    background: tab === key ? 'rgba(167,139,250,0.1)' : 'none',
                    border: 'none', cursor: 'pointer',
                    borderBottom: tab === key ? '2px solid #A78BFA' : '2px solid transparent',
                    color: tab === key ? '#A78BFA' : 'rgba(255,255,255,0.4)',
                    fontSize: 12, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
                    letterSpacing: '0.04em', transition: 'all 0.2s',
                  }}
                >
                  {label}
                  <span style={{
                    marginLeft: 6, fontSize: 10,
                    background: tab === key ? 'rgba(167,139,250,0.2)' : 'rgba(255,255,255,0.07)',
                    borderRadius: 8, padding: '1px 6px',
                    color: tab === key ? '#A78BFA' : 'rgba(255,255,255,0.3)',
                  }}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div style={{ padding: '16px' }}>
              <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                    Loading inventory…
                  </motion.div>
                ) : tab === 'cosmetics' ? (
                  <motion.div key="cosmetics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {cosmetics.length === 0 ? (
                      <EmptyInventory onShop={() => navigate('shop')} />
                    ) : (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                        gap: 10,
                      }}>
                        {cosmetics.map((item) => (
                          <CosmeticCard
                            key={item.id}
                            item={item}
                            onEquip={handleEquip}
                            onUnequip={handleEquip}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="boosts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {(inventory.boosts || []).length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                        No boosts yet. Open packs or visit the shop.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {(inventory.boosts || []).map((boost) => (
                          <div key={boost.id} style={{
                            background: 'rgba(82,183,136,0.08)',
                            border: '1px solid rgba(82,183,136,0.2)',
                            borderRadius: 10, padding: '12px 16px',
                            display: 'flex', alignItems: 'center', gap: 14,
                          }}>
                            <span style={{ fontSize: 24 }}>🧪</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.8)', marginBottom: 2 }}>{boost.name}</div>
                              {boost.description && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>{boost.description}</div>}
                            </div>
                            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: '#52B788' }}>
                              ×{boost.quantity}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Action buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}
        >
          <motion.button
            onClick={() => navigate('shop')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '14px 20px',
              background: 'linear-gradient(135deg, #6B3FA0, #A78BFA)',
              border: 'none', borderRadius: 12,
              fontSize: 13, fontWeight: 800, color: '#fff',
              cursor: 'pointer', letterSpacing: '0.04em',
              boxShadow: '0 4px 20px rgba(167,139,250,0.3)',
            }}
          >
            🎁 Open Packs
          </motion.button>
          <motion.button
            onClick={() => navigate('shop')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              flex: 1, padding: '14px 20px',
              background: 'rgba(200,169,110,0.1)',
              border: '1px solid rgba(200,169,110,0.35)',
              borderRadius: 12,
              fontSize: 13, fontWeight: 800, color: '#C8A96E',
              cursor: 'pointer', letterSpacing: '0.04em',
            }}
          >
            🛍 Visit Store
          </motion.button>
        </motion.div>

        {/* ── Settings link ── */}
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button
            onClick={() => navigate('settings')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 600,
              textDecoration: 'underline', fontFamily: 'Nunito, sans-serif',
            }}
          >
            Account Settings
          </button>
        </div>
      </main>
    </div>
  );
}
