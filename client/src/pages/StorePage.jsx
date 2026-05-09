import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import TopBar from '../components/TopBar.jsx';
import CharacterCard from '../components/CharacterCard.jsx';

const TYPE_LABELS = { hat: 'Hats', weapon: 'Weapons', cape: 'Capes', badge: 'Badges', aura: 'Auras' };

export default function StorePage() {
  const { character, cosmetics, coins, ownedCosmetics, equippedCosmetics, buyCosmetic, equipCosmetic, unequipCosmetic, navigate } = useGame();
  const [hoverPreview, setHoverPreview] = useState(null);
  const [activeType, setActiveType] = useState('all');

  const types = ['all', 'hat', 'weapon', 'cape', 'badge', 'aura'];

  const previewCosmetics = hoverPreview
    ? { ...equippedCosmetics, [hoverPreview.type]: hoverPreview.id }
    : equippedCosmetics;

  const filtered = activeType === 'all' ? cosmetics : cosmetics.filter(c => c.type === activeType);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Store" onBack={() => navigate('adventure_map')} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

            {/* Character preview + coin balance */}
            <div style={{
              background: 'var(--card)', border: '1px solid var(--border)',
              borderRadius: 20, padding: 20, marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 20,
            }}>
              <CharacterCard character={character} equippedCosmetics={previewCosmetics} size="md" animate />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 6 }}>
                  {hoverPreview ? `Previewing: ${cosmetics.find(c => c.id === hoverPreview.id)?.name}` : 'Your character'}
                </div>
                <div style={{
                  background: 'var(--gold-soft)', border: '1px solid rgba(255,184,48,0.3)',
                  borderRadius: 10, padding: '6px 14px', display: 'inline-block',
                  fontSize: 15, fontWeight: 800, color: 'var(--gold)',
                }}>
                  🪙 {coins.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Type filter */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 16 }}>
              {types.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', transition: 'all 0.2s',
                    background: activeType === t ? 'var(--gold)' : 'var(--card)',
                    color: activeType === t ? '#1a1a2e' : 'var(--text-dim)',
                    flexShrink: 0,
                  }}
                >
                  {t === 'all' ? 'All' : TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {filtered.map((item, i) => {
                const owned = ownedCosmetics.includes(item.id);
                const equipped = equippedCosmetics[item.type] === item.id;
                const canAfford = coins >= item.price;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onMouseEnter={() => owned && setHoverPreview({ id: item.id, type: item.type })}
                    onMouseLeave={() => setHoverPreview(null)}
                    style={{
                      background: equipped ? 'rgba(255,184,48,0.1)' : 'var(--card)',
                      border: `2px solid ${equipped ? 'var(--gold)' : owned ? 'var(--green)' : 'var(--border)'}`,
                      borderRadius: 18, padding: 16,
                      display: 'flex', flexDirection: 'column', gap: 10,
                      cursor: owned ? 'pointer' : 'default',
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <div style={{ fontSize: 36, textAlign: 'center' }}>{item.emoji}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.4, marginBottom: 2 }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'capitalize' }}>
                        {TYPE_LABELS[item.type] || item.type}
                      </div>
                    </div>

                    {equipped ? (
                      <button
                        className="btn-outline"
                        style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
                        onClick={() => unequipCosmetic(item.id)}
                      >
                        Unequip
                      </button>
                    ) : owned ? (
                      <button
                        className="btn-outline"
                        style={{ width: '100%', fontSize: 12, padding: '8px 12px', borderColor: 'var(--green)', color: 'var(--green)' }}
                        onClick={() => equipCosmetic(item.id)}
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        className={canAfford ? 'btn-gold' : 'btn-outline'}
                        style={{ width: '100%', fontSize: 12, padding: '8px 12px', opacity: canAfford ? 1 : 0.5 }}
                        onClick={() => canAfford && buyCosmetic(item.id)}
                        disabled={!canAfford}
                      >
                        🪙 {item.price}
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
