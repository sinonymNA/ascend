import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';

export default function MapRevealPage() {
  const { diagnosticResults, navigate, zones, character } = useGame();
  const fired = useRef(false);

  useEffect(() => {
    if (!fired.current) {
      fired.current = true;
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors: ['#FFB830', '#E8445A', '#2ECC71', '#5B9CF6'],
        });
      }, 600);
    }
  }, []);

  const score = diagnosticResults?.score ?? 0;
  const total = diagnosticResults?.total ?? 10;
  const pct = Math.round((score / total) * 100);

  const tierLabel = pct >= 80 ? 'Expert' : pct >= 60 ? 'Advanced' : pct >= 40 ? 'Intermediate' : 'Beginner';
  const tierColor = pct >= 80 ? 'var(--gold)' : pct >= 60 ? 'var(--green)' : pct >= 40 ? 'var(--blue-light)' : 'var(--coral)';

  return (
    <div className="page-container">
      <StarField />
      <div className="content-max" style={{ paddingTop: 24 }}>
        {/* Score reveal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ textAlign: 'center', marginBottom: 32 }}
        >
          <div style={{ fontSize: 64, marginBottom: 8 }}>🗺️</div>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 26, fontWeight: 700, marginBottom: 6 }}>
            Your Map Awaits, {character?.name}!
          </h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 20 }}>
            Diagnostic complete · {score}/{total} correct
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            background: tierColor + '22', border: `1px solid ${tierColor}44`,
            borderRadius: 20, padding: '8px 20px', marginBottom: 24,
          }}>
            <span style={{ fontSize: 18 }}>
              {pct >= 80 ? '👑' : pct >= 60 ? '⭐' : pct >= 40 ? '📚' : '🌱'}
            </span>
            <span style={{ fontSize: 16, fontWeight: 800, color: tierColor }}>
              {tierLabel} Tier
            </span>
          </div>
        </motion.div>

        {/* Zone breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ marginBottom: 28 }}
        >
          <p style={{ fontSize: 13, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>
            Zone Knowledge
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {zones.map((zone, i) => {
              const zoneData = diagnosticResults?.byZone?.[zone.id];
              const zonePct = zoneData && zoneData.total > 0
                ? Math.round((zoneData.correct / zoneData.total) * 100)
                : 0;
              const strong = (diagnosticResults?.strongZones || []).includes(zone.id);
              const weak = (diagnosticResults?.weakZones || []).includes(zone.id);

              return (
                <motion.div
                  key={zone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    background: 'var(--card)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '12px 16px',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{zone.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                      {zone.name}
                    </div>
                    <div style={{
                      height: 6, background: 'var(--bg-mid)',
                      borderRadius: 3, overflow: 'hidden',
                    }}>
                      <motion.div
                        style={{
                          height: '100%', borderRadius: 3,
                          background: strong ? 'var(--green)' : weak ? 'var(--coral)' : 'var(--blue-light)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${zonePct}%` }}
                        transition={{ delay: 0.6 + i * 0.08, duration: 0.5 }}
                      />
                    </div>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700,
                    color: strong ? 'var(--green)' : weak ? 'var(--coral)' : 'var(--text-dim)',
                  }}>
                    {strong ? '✓ Strong' : weak ? '⚠ Focus' : '—'}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          className="btn-coral"
          style={{ width: '100%', fontSize: 17 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={() => navigate('adventure_map')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Enter the Map →
        </motion.button>
      </div>
    </div>
  );
}
