import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../../App.jsx';
import Icon from '../ui/Icon.jsx';

export default function WalletPill({ onClick }) {
  const { wallet } = useApp();
  const coins = wallet?.coins || 0;
  const gems = wallet?.gems || 0;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
        borderRadius: '20px', padding: '4px 12px', cursor: onClick ? 'pointer' : 'default',
        fontFamily: 'Nunito, sans-serif',
      }}
    >
      <motion.span key={coins} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 800, color: '#F5A623' }}>
        <Icon name="coins" size={14} fill="rgba(245,166,35,0.25)" /> {coins.toLocaleString()}
      </motion.span>
      <span style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
      <motion.span key={gems} initial={{ scale: 1.3 }} animate={{ scale: 1 }}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 800, color: '#60A5FA' }}>
        <Icon name="gems" size={14} fill="rgba(96,165,250,0.25)" /> {gems.toLocaleString()}
      </motion.span>
    </button>
  );
}
