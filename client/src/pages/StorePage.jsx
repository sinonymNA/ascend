import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import TopBar from '../components/TopBar.jsx';

export default function StorePage() {
  const { cosmetics, coins, ownedCosmetics, equippedCosmetics, buyCosmetic, equipCosmetic, unequipCosmetic, navigate } = useGame();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <TopBar title="Store" onBack={() => navigate('adventure_map')} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 16px 40px' }}>
        <div style={{ width: '100%', maxWidth: 680 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                fontSize: 22, fontFamily: 'Cinzel, serif', fontWeight: 700,
              }}>
                Cosmetics
              </div>
              <div style={{
                background: 'var(--gold-soft)', border: '1px solid rgba(255,184,48,0.3)',
                borderRadius: 12, padding: '4px 12px',
                fontSize: 14, fontWeight: 800, color: 'var(--gold)',
              }}>
                🪙 {coins.toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {cosmetics.map((item, i) => {
                const owned = ownedCosmetics.includes(item.id);
                const equipped = equippedCosmetics.includes(item.id);
                const canAfford = coins >= item.price;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      background: equipped ? 'rgba(255,184,48,0.1)' : 'var(--card)',
                      border: `2px solid ${equipped ? 'var(--gold)' : owned ? 'var(--green)' : 'var(--border)'}`,
                      borderRadius: 18, padding: 16,
                      display: 'flex', flexDirection: 'column', gap: 10,
                    }}
                  >
                    <div style={{ fontSize: 36, textAlign: 'center' }}>{item.emoji}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginBottom: 2 }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                        {item.description}
                      </div>
                    </div>

                    {equipped && (
                      <button
                        className="btn-outline"
                        style={{ width: '100%', fontSize: 12, padding: '8px 12px' }}
                        onClick={() => unequipCosmetic(item.id)}
                      >
                        Unequip
                      </button>
                    )}
                    {owned && !equipped && (
                      <button
                        className="btn-outline"
                        style={{ width: '100%', fontSize: 12, padding: '8px 12px', borderColor: 'var(--green)', color: 'var(--green)' }}
                        onClick={() => equipCosmetic(item.id)}
                      >
                        Equip
                      </button>
                    )}
                    {!owned && (
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
