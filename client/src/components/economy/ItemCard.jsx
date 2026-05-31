import React from 'react';
import { motion } from 'framer-motion';

export const RARITY_COLORS = {
  common:    { border: '#6B7E8F', glow: 'rgba(107,126,143,0.3)',  label: 'Common' },
  rare:      { border: '#4A90D9', glow: 'rgba(74,144,217,0.4)',   label: 'Rare' },
  epic:      { border: '#A78BFA', glow: 'rgba(167,139,250,0.45)', label: 'Epic' },
  legendary: { border: '#F5A623', glow: 'rgba(245,166,35,0.5)',   label: 'Legendary' },
};

const CATEGORY_ICON = {
  color: '🎨', trail: '✨', flag: '🚩', skin: '🧗', badge: '🎖️', banner: '🎌', theme: '🏔️',
  xp2x: '⚡', fifty: '✂️', timefreeze: '⏱️', streak_shield: '🛡️',
};

export default function ItemCard({ item, equipped, owned, quantity, onClick, compact }) {
  const r = RARITY_COLORS[item.rarity] || RARITY_COLORS.common;
  const swatch = item.payload?.color;

  return (
    <motion.button
      onClick={onClick}
      whileHover={onClick ? { y: -3 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      style={{
        position: 'relative',
        background: 'var(--bg-elevated)',
        border: `2px solid ${r.border}`,
        borderRadius: '14px',
        padding: compact ? '12px 10px' : '16px 12px',
        boxShadow: `0 0 16px ${r.glow}`,
        cursor: onClick ? 'pointer' : 'default',
        textAlign: 'center',
        fontFamily: 'Nunito, sans-serif',
        opacity: owned === false ? 0.55 : 1,
      }}
    >
      {equipped && (
        <span style={{ position: 'absolute', top: '6px', right: '6px', fontSize: '10px', fontWeight: 800, color: '#0F1720', background: '#52B788', borderRadius: '8px', padding: '1px 6px' }}>
          ON
        </span>
      )}
      {quantity > 1 && (
        <span style={{ position: 'absolute', top: '6px', left: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--text)', background: 'var(--bg)', borderRadius: '8px', padding: '1px 6px' }}>
          ×{quantity}
        </span>
      )}
      <div style={{
        width: compact ? '34px' : '44px', height: compact ? '34px' : '44px', borderRadius: '50%',
        margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: swatch || 'var(--bg)', fontSize: compact ? '18px' : '22px',
        border: swatch ? '2px solid rgba(255,255,255,0.2)' : '1px solid var(--border)',
      }}>
        {swatch ? '' : (CATEGORY_ICON[item.category] || '🎁')}
      </div>
      <div style={{ fontSize: compact ? '12px' : '13px', fontWeight: 800, color: 'var(--text)', marginBottom: '2px', lineHeight: 1.2 }}>
        {item.name}
      </div>
      <div style={{ fontSize: '10px', fontWeight: 800, color: r.border, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {r.label}
      </div>
    </motion.button>
  );
}
