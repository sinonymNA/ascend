import { useGame } from '../context/GameContext.jsx';
import XPBar from './XPBar.jsx';
import CoinCounter from './CoinCounter.jsx';

export default function TopBar({ title, onBack }) {
  const { navigate } = useGame();

  return (
    <div style={{
      width: '100%', display: 'flex', flexDirection: 'column', gap: 10,
      padding: '12px 16px',
      background: 'rgba(22,32,56,0.8)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {onBack ? (
          <button
            className="btn-outline"
            style={{ padding: '6px 14px', fontSize: 13 }}
            onClick={onBack}
          >
            ← Back
          </button>
        ) : (
          <div style={{ width: 80 }} />
        )}
        {title && (
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)' }}>
            {title}
          </span>
        )}
        <CoinCounter />
      </div>
      <XPBar compact />
    </div>
  );
}
