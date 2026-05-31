import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useApp } from '../App.jsx';
import SoundService from '../lib/sound.js';
import ItemCard from '../components/economy/ItemCard.jsx';

export default function PackOpening() {
  const { navigate, screenParams } = useApp();
  const results = screenParams?.results || [];
  const [revealed, setRevealed] = useState(0);

  useEffect(() => {
    SoundService.play('pack-open');
  }, []);

  useEffect(() => {
    if (revealed >= results.length) return;
    const item = results[revealed];
    const t = setTimeout(() => {
      if (item) {
        if (item.rarity === 'legendary') {
          SoundService.play('pack-legendary');
          confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 }, colors: ['#F5A623', '#FFFFFF', '#C8851A'] });
        } else if (item.rarity === 'epic' || item.rarity === 'rare') {
          SoundService.play('pack-rare');
        } else {
          SoundService.play('coin');
        }
      }
      setRevealed((r) => r + 1);
    }, revealed === 0 ? 400 : 550);
    return () => clearTimeout(t);
  }, [revealed, results]);

  const allRevealed = revealed >= results.length;

  return (
    <div
      onClick={() => allRevealed && navigate('shop')}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'radial-gradient(ellipse at center, rgba(40,30,60,0.96), rgba(15,23,32,0.98))',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px', fontFamily: 'Nunito, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        style={{ fontFamily: 'Cinzel, serif', fontSize: '22px', fontWeight: 700, color: 'var(--gold)', marginBottom: '28px', letterSpacing: '0.05em' }}
      >
        Pack Opened!
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center', maxWidth: '520px' }}>
        <AnimatePresence>
          {results.slice(0, revealed).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              style={{ position: 'relative' }}
            >
              <ItemCard item={item} owned />
              {item.coinRefund > 0 && (
                <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap', fontSize: '11px', fontWeight: 800, color: '#F5A623', background: 'var(--bg)', borderRadius: '8px', padding: '2px 8px', border: '1px solid var(--border-gold)' }}>
                  dup · +{item.coinRefund} 🪙
                </div>
              )}
              {item.isNew && item.coinRefund === 0 && (
                <div style={{ position: 'absolute', top: '-8px', left: '50%', transform: 'translateX(-50%)', fontSize: '10px', fontWeight: 800, color: '#0F1720', background: '#52B788', borderRadius: '8px', padding: '1px 8px' }}>
                  NEW
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {allRevealed && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
        >
          <button className="btn-primary" onClick={(e) => { e.stopPropagation(); navigate('shop'); }} style={{ padding: '12px 32px', fontSize: '15px' }}>
            Continue →
          </button>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Tap anywhere to close</span>
        </motion.div>
      )}
    </div>
  );
}
