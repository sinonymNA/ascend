import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';

const CLASSES = [
  {
    id: 'scholar',
    name: 'The Scholar',
    emoji: '📚',
    description: '+25 XP bonus on difficult questions',
    color: '#5B9CF6',
  },
  {
    id: 'warrior',
    name: 'The Warrior',
    emoji: '⚔️',
    description: 'Streak bonuses doubled, immune to boss damage on first wrong answer',
    color: '#E8445A',
  },
  {
    id: 'rogue',
    name: 'The Rogue',
    emoji: '🗡️',
    description: '+15 bonus coins on correct answers',
    color: '#7B4FE9',
  },
];

export default function CharacterCreatePage() {
  const { setCharacter, startDiagnostic, navigate } = useGame();
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState(null);
  const [step, setStep] = useState(0); // 0 = class, 1 = name

  const handleClassSelect = (cls) => {
    setSelectedClass(cls);
    setStep(1);
  };

  const handleStart = () => {
    if (!name.trim() || !selectedClass) return;
    setCharacter({ name: name.trim(), class: selectedClass.id, emoji: selectedClass.emoji });
    startDiagnostic();
  };

  return (
    <div className="page-container">
      <StarField />
      <div className="content-max" style={{ paddingTop: 20 }}>
        <button className="btn-outline" onClick={() => navigate('exam_select')} style={{ marginBottom: 24 }}>
          ← Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Create Your Hero
          </h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 28, fontSize: 15 }}>
            Choose your class and name your adventurer.
          </p>

          {/* Step 0: Class Selection */}
          {step === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              <p style={{ fontSize: 13, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 4 }}>
                Choose Your Class
              </p>
              {CLASSES.map((cls, i) => (
                <motion.button
                  key={cls.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleClassSelect(cls)}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'var(--card)',
                    border: `2px solid ${cls.color}44`,
                    borderRadius: 20, padding: '18px 20px',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = cls.color; e.currentTarget.style.transform = 'translateX(4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = cls.color + '44'; e.currentTarget.style.transform = 'translateX(0)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: cls.color + '22', border: `1px solid ${cls.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26,
                    }}>
                      {cls.emoji}
                    </div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>
                        {cls.name}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-mid)' }}>
                        {cls.description}
                      </div>
                    </div>
                    <div style={{ marginLeft: 'auto', color: cls.color, fontSize: 18 }}>→</div>
                  </div>
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Step 1: Name */}
          {step === 1 && selectedClass && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Selected class recap */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: selectedClass.color + '11',
                border: `1px solid ${selectedClass.color}44`,
                borderRadius: 16, padding: '14px 16px',
              }}>
                <span style={{ fontSize: 28 }}>{selectedClass.emoji}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: selectedClass.color }}>
                    {selectedClass.name}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)' }}>
                    {selectedClass.description}
                  </div>
                </div>
                <button
                  onClick={() => setStep(0)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', fontSize: 13 }}
                >
                  Change
                </button>
              </div>

              {/* Name input */}
              <div>
                <label style={{ fontSize: 13, color: 'var(--text-mid)', marginBottom: 8, display: 'block', fontWeight: 700 }}>
                  Your Hero's Name
                </label>
                <input
                  className="input-dark"
                  placeholder="Enter your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={20}
                  onKeyDown={e => e.key === 'Enter' && name.trim() && handleStart()}
                  autoFocus
                />
              </div>

              <motion.button
                className="btn-coral"
                style={{ width: '100%', opacity: name.trim() ? 1 : 0.5 }}
                onClick={handleStart}
                disabled={!name.trim()}
                whileHover={{ scale: name.trim() ? 1.02 : 1 }}
                whileTap={{ scale: name.trim() ? 0.98 : 1 }}
              >
                Begin Diagnostic Quest →
              </motion.button>
              <p style={{ fontSize: 12, color: 'var(--text-dim)', textAlign: 'center' }}>
                10 quick questions to map your knowledge
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
