import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Biome config ──────────────────────────────────────────────────────────────
const BIOMES = [
  { min: 0,  max: 25,  name: 'Base Camp',        sky1: '#0F1720', sky2: '#1A2E20', midColor: '#1A4A28', fgColor: '#2D6A4F', snowColor: null,    accentColor: '#C8851A' },
  { min: 25, max: 50,  name: 'Trail',             sky1: '#0F1A28', sky2: '#1E3A55', midColor: '#2D5A45', fgColor: '#3D7A55', snowColor: null,    accentColor: '#F5A623' },
  { min: 50, max: 75,  name: 'Alpine',            sky1: '#0D1A2E', sky2: '#1A2E4A', midColor: '#2D4A5A', fgColor: '#4A6070', snowColor: '#8A9FB0', accentColor: '#A0B4C4' },
  { min: 75, max: 90,  name: 'Summit Approach',   sky1: '#08101C', sky2: '#1A2440', midColor: '#4A5568', fgColor: '#6A7A8A', snowColor: '#C8D8E0', accentColor: '#E8F4F8' },
  { min: 90, max: 100, name: 'Peak',              sky1: '#05080F', sky2: '#0F1530', midColor: '#6A7A8A', fgColor: '#8A9FB0', snowColor: '#E8F4F8', accentColor: '#F5A623' },
];

function getBiome(elevation) {
  return BIOMES.find((b) => elevation >= b.min && elevation <= b.max) || BIOMES[0];
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h >= 5 && h < 11)  return 'morning';
  if (h >= 11 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
}

const SKY_GRADIENTS = {
  morning:   ['#E8923C', '#C4653C', '#7A3A5C', '#2D1A40'],
  afternoon: ['#1A4A8A', '#2D6BB0', '#3D8AC8', '#5AA8D8'],
  evening:   ['#C84A2A', '#8A2A5A', '#4A1A5A', '#1A0A2A'],
  night:     ['#030508', '#080D18', '#0F1720', '#162030'],
};

// ─── Star generator (stable seed) ────────────────────────────────────────────
function genStars(n = 60) {
  const stars = [];
  let seed = 42;
  const rand = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
  for (let i = 0; i < n; i++) {
    stars.push({ x: rand() * 100, y: rand() * 55, r: rand() * 1.2 + 0.4, op: rand() * 0.5 + 0.3 });
  }
  return stars;
}
const STARS = genStars(60);

// ─── Particle burst ───────────────────────────────────────────────────────────
function Particles({ trigger, streak, x = 50, y = 55 }) {
  const [particles, setParticles] = useState([]);
  const color = streak >= 10 ? '#FF4500' : streak >= 5 ? '#FF7043' : '#F5A623';

  useEffect(() => {
    if (!trigger) return;
    const pts = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      angle: (i / 10) * Math.PI * 2 + Math.random() * 0.5,
      speed: 18 + Math.random() * 22,
      life: 0.9 + Math.random() * 0.4,
    }));
    setParticles(pts);
    const t = setTimeout(() => setParticles([]), 1400);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {particles.map((p) => (
        <motion.circle
          key={p.id}
          r={3}
          fill={color}
          initial={{ cx: `${x}%`, cy: `${y}%`, opacity: 1, scale: 1 }}
          animate={{
            cx: `${x + Math.cos(p.angle) * p.speed}%`,
            cy: `${y + Math.sin(p.angle) * p.speed * 0.6}%`,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: p.life, ease: 'easeOut' }}
        />
      ))}
    </svg>
  );
}

// ─── MountainWorld ────────────────────────────────────────────────────────────
export default function MountainWorld({
  elevation = 0,
  streak = 0,
  correctTrigger = 0, // increment to fire particles
  climberColor = '#F5A623',
}) {
  const biome = useMemo(() => getBiome(elevation), [elevation]);
  const tod = useMemo(() => getTimeOfDay(), []);
  const skyColors = SKY_GRADIENTS[tod];
  const showStars = tod === 'night' || tod === 'evening';

  // Climber Y position (0% = top of mountain peak, 100% = base)
  // Maps elevation 0→100 to SVG y 78% → 28%
  const climberY = useMemo(() => 78 - (elevation / 100) * 50, [elevation]);

  // Trail path: from base to current position
  const trailPath = useMemo(() => {
    const baseY = 78;
    const peakY = 28;
    const curY = baseY - (elevation / 100) * 50;
    // Ridge line goes left→center→right, climber on centerline
    return `M 50 ${baseY} Q 50 ${(baseY + curY) / 2} 50 ${curY}`;
  }, [elevation]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        style={{ width: '100%', height: '100%', display: 'block' }}
      >
        <defs>
          <linearGradient id="mw-sky" x1="0" y1="0" x2="0" y2="1">
            {skyColors.map((c, i) => (
              <stop key={i} offset={`${(i / (skyColors.length - 1)) * 100}%`} stopColor={c} />
            ))}
          </linearGradient>
          <linearGradient id="mw-mountain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={biome.snowColor || biome.midColor} />
            <stop offset="40%"  stopColor={biome.midColor} />
            <stop offset="100%" stopColor={biome.fgColor} />
          </linearGradient>
          <filter id="mw-glow">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="mw-trail" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%"   stopColor={climberColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={climberColor} stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="100" height="100" fill="url(#mw-sky)" />

        {/* Stars (night/evening only) */}
        {showStars && STARS.map((s, i) => (
          <motion.circle
            key={i}
            cx={s.x} cy={s.y} r={s.r}
            fill="white"
            initial={{ opacity: s.op }}
            animate={{ opacity: [s.op, s.op * 0.4, s.op] }}
            transition={{ duration: 2 + s.r, repeat: Infinity, delay: i * 0.08 }}
          />
        ))}

        {/* Distant peaks (parallax layer) */}
        <g opacity="0.35">
          <polygon points="10,65 30,38 50,65" fill={biome.midColor} />
          <polygon points="55,65 75,40 95,65" fill={biome.midColor} />
        </g>

        {/* Main mountain body */}
        <motion.polygon
          points="50,22 8,82 92,82"
          fill="url(#mw-mountain)"
          animate={{ points: '50,22 8,82 92,82' }}
        />

        {/* Snow cap (appears in Alpine+) */}
        {biome.snowColor && (
          <motion.polygon
            points="50,22 38,44 62,44"
            fill={biome.snowColor}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            transition={{ duration: 0.6 }}
          />
        )}

        {/* Forest silhouettes (Base Camp only) */}
        {elevation < 30 && (
          <g opacity="0.7">
            {[18, 26, 72, 80].map((x, i) => (
              <g key={i}>
                <polygon points={`${x},78 ${x - 3},85 ${x + 3},85`} fill="#1A4A28" />
                <polygon points={`${x},74 ${x - 4},82 ${x + 4},82`} fill="#2D6A4F" />
              </g>
            ))}
          </g>
        )}

        {/* Wildflowers (Trail zone) */}
        {elevation >= 20 && elevation < 55 && (
          <g opacity="0.8">
            {[22, 35, 65, 78].map((x, i) => (
              <circle key={i} cx={x} cy={80} r={1.2} fill={i % 2 === 0 ? '#F5A623' : '#E8F4F8'} />
            ))}
          </g>
        )}

        {/* Mist wisps (Alpine zone) */}
        {elevation >= 45 && elevation < 80 && (
          <motion.g opacity="0.18"
            animate={{ opacity: [0.1, 0.22, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <ellipse cx="30" cy="55" rx="18" ry="5" fill="white" />
            <ellipse cx="70" cy="60" rx="14" ry="4" fill="white" />
          </motion.g>
        )}

        {/* Wind particles (Summit Approach) */}
        {elevation >= 72 && (
          <motion.g>
            {[0, 1, 2].map((i) => (
              <motion.line
                key={i}
                stroke="white" strokeWidth="0.4" opacity="0.35"
                x1={30 + i * 15} y1={35 + i * 5}
                x2={45 + i * 15} y2={35 + i * 5}
                animate={{ x1: [30 + i * 15, 50 + i * 15], opacity: [0.35, 0] }}
                transition={{ duration: 1.2 + i * 0.3, repeat: Infinity, delay: i * 0.4 }}
              />
            ))}
          </motion.g>
        )}

        {/* Gold summit light (Peak zone) */}
        {elevation >= 88 && (
          <motion.circle
            cx="50" cy="22" r="8"
            fill="#F5A623"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}

        {/* Summit prayer flags */}
        {elevation >= 90 && (
          <g>
            <line x1="48" y1="22" x2="52" y2="22" stroke="var(--gold)" strokeWidth="0.6" />
            {['#E85D4A', '#F5A623', '#52B788', '#E8F4F8', '#5AA8D8'].map((c, i) => (
              <motion.rect key={i}
                x={39 + i * 5} y={20} width={4} height={2.5}
                fill={c} rx="0.3"
                animate={{ y: [20, 19.5, 20] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12 }}
              />
            ))}
          </g>
        )}

        {/* Trail glow */}
        {elevation > 0 && (
          <motion.path
            d={trailPath}
            stroke="url(#mw-trail)"
            strokeWidth={elevation > 50 ? 1.2 : 0.8}
            fill="none"
            filter="url(#mw-glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}

        {/* Climber */}
        <motion.g
          animate={{ y: [0, -0.8, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.g
            animate={{ cx: 50, cy: climberY }}
            transition={{ type: 'spring', stiffness: 60, damping: 18 }}
          >
            {/* Body */}
            <motion.ellipse
              cx="50" cy={climberY}
              rx="2.5" ry="3.5"
              fill={climberColor}
              animate={{ cx: 50, cy: climberY }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            />
            {/* Head */}
            <motion.circle
              cx="50" cy={climberY - 4.5}
              r="2"
              fill={climberColor}
              animate={{ cx: 50, cy: climberY - 4.5 }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            />
            {/* Backpack */}
            <motion.rect
              x="51.8" y={climberY - 3}
              width="1.8" height="2.8"
              rx="0.5" fill="#2D4A5A"
              animate={{ x: 51.8, y: climberY - 3 }}
              transition={{ type: 'spring', stiffness: 60, damping: 18 }}
            />
            {/* Gold glow on climber */}
            <motion.circle
              cx="50" cy={climberY - 1.5}
              r="4.5"
              fill={climberColor}
              opacity="0.12"
              animate={{ cx: 50, cy: climberY - 1.5, r: [4.5, 5.5, 4.5], opacity: [0.12, 0.2, 0.12] }}
              transition={{ type: 'spring', stiffness: 60, damping: 18, r: { duration: 1.5, repeat: Infinity }, opacity: { duration: 1.5, repeat: Infinity } }}
            />
          </motion.g>
        </motion.g>

        {/* Zone label */}
        <text
          x="50" y="95"
          textAnchor="middle"
          fill="rgba(240,237,230,0.45)"
          fontSize="3.5"
          fontFamily="Cinzel, serif"
          letterSpacing="0.5"
          fontWeight="600"
        >
          {biome.name.toUpperCase()} · {elevation}%
        </text>
      </svg>

      {/* Particle layer */}
      <Particles trigger={correctTrigger} streak={streak} x={50} y={climberY} />
    </div>
  );
}
