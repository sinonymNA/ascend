import { motion } from 'framer-motion';
import { COSMETICS } from '../context/GameContext.jsx';

const CLASS_COLORS = {
  warrior: { primary: '#E8445A', secondary: '#c0392b', emoji: '⚔️' },
  scholar: { primary: '#5B9CF6', secondary: '#2980b9', emoji: '📚' },
  rogue:   { primary: '#7B4FE9', secondary: '#6c3483', emoji: '🗡️' },
};

const SIZE_CONFIG = {
  sm: { body: 44, hat: 22, outer: 80, name: 12, badge: 14, weapon: 18, auraBlur: 8 },
  md: { body: 64, hat: 30, outer: 110, name: 14, badge: 16, weapon: 22, auraBlur: 12 },
  lg: { body: 88, hat: 40, outer: 150, name: 18, badge: 20, weapon: 28, auraBlur: 18 },
};

const AURA_GLOWS = {
  aura_gold:    '0 0 20px 6px rgba(255,184,48,0.7), 0 0 40px 12px rgba(255,184,48,0.3)',
  aura_crimson: '0 0 20px 6px rgba(232,68,90,0.7), 0 0 40px 12px rgba(232,68,90,0.3)',
};

export default function CharacterCard({ character, equippedCosmetics = {}, size = 'md', animate: doAnimate = false }) {
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const cls = character?.class || 'scholar';
  const clsInfo = CLASS_COLORS[cls] || CLASS_COLORS.scholar;

  const hat    = equippedCosmetics.hat    ? COSMETICS.find(c => c.id === equippedCosmetics.hat)    : null;
  const weapon = equippedCosmetics.weapon ? COSMETICS.find(c => c.id === equippedCosmetics.weapon) : null;
  const cape   = equippedCosmetics.cape   ? COSMETICS.find(c => c.id === equippedCosmetics.cape)   : null;
  const badge  = equippedCosmetics.badge  ? COSMETICS.find(c => c.id === equippedCosmetics.badge)  : null;
  const aura   = equippedCosmetics.aura   ? equippedCosmetics.aura : null;

  const bobVariants = doAnimate ? {
    animate: { y: [0, -6, 0], transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } },
  } : {};

  const outerStyle = {
    position: 'relative',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  };

  const bodyWrapStyle = {
    position: 'relative',
    width: cfg.outer,
    height: cfg.outer,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const bodyCircleStyle = {
    width: cfg.body,
    height: cfg.body,
    borderRadius: '50%',
    background: `radial-gradient(circle at 35% 35%, ${clsInfo.primary}, ${clsInfo.secondary})`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: cfg.body * 0.45,
    boxShadow: aura ? AURA_GLOWS[aura] : `0 4px 14px ${clsInfo.primary}55`,
    transition: 'box-shadow 0.4s ease',
    position: 'relative',
    zIndex: 2,
  };

  return (
    <div style={outerStyle}>
      <motion.div style={bodyWrapStyle} {...(doAnimate ? { animate: bobVariants.animate } : {})}>
        {/* Hat — top-center */}
        {hat && (
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            fontSize: cfg.hat, zIndex: 5, lineHeight: 1, userSelect: 'none',
          }}>
            {hat.emoji}
          </div>
        )}

        {/* Cape — behind body */}
        {cape && (
          <div style={{
            position: 'absolute', bottom: cfg.outer * 0.08, left: '50%',
            transform: 'translateX(-50%)',
            fontSize: cfg.body * 0.55, zIndex: 1, lineHeight: 1, userSelect: 'none',
            opacity: 0.85,
          }}>
            {cape.emoji}
          </div>
        )}

        {/* Body */}
        <div style={bodyCircleStyle}>
          {clsInfo.emoji}
        </div>

        {/* Weapon — bottom-left */}
        {weapon && (
          <div style={{
            position: 'absolute', bottom: cfg.outer * 0.12, left: cfg.outer * 0.06,
            fontSize: cfg.weapon, zIndex: 4, transform: 'rotate(-20deg)', userSelect: 'none',
          }}>
            {weapon.emoji}
          </div>
        )}
      </motion.div>

      {/* Name + level */}
      {character?.name && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: cfg.name, fontWeight: 700, color: 'var(--text)' }}>
            {character.name}
          </div>
        </div>
      )}

      {/* Badge row */}
      {badge && (
        <div style={{ fontSize: cfg.badge, lineHeight: 1 }}>{badge.emoji}</div>
      )}
    </div>
  );
}
