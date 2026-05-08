import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext.jsx';
import StarField from '../components/StarField.jsx';

const EXAMS = [
  {
    id: 'ap_world_history',
    name: 'AP World History',
    subtitle: 'Modern & Ancient',
    description: '250 questions across 5 zones from Ancient Empires to Globalization',
    emoji: '🌍',
    color: '#FFB830',
    available: true,
  },
  {
    id: 'ap_us_history',
    name: 'AP US History',
    subtitle: 'Coming Soon',
    description: 'From colonial America through the modern era',
    emoji: '🦅',
    color: '#5B9CF6',
    available: false,
  },
  {
    id: 'ap_euro',
    name: 'AP European History',
    subtitle: 'Coming Soon',
    description: 'Renaissance through present day',
    emoji: '🏰',
    color: '#7B4FE9',
    available: false,
  },
];

export default function ExamSelectPage() {
  const { setExamType, navigate } = useGame();

  const handleSelect = (examId) => {
    setExamType(examId);
    navigate('character_create');
  };

  return (
    <div className="page-container">
      <StarField />
      <div className="content-max" style={{ paddingTop: 20 }}>
        {/* Back */}
        <button className="btn-outline" onClick={() => navigate('landing')} style={{ marginBottom: 24 }}>
          ← Back
        </button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>
            Choose Your Exam
          </h2>
          <p style={{ color: 'var(--text-mid)', marginBottom: 28, fontSize: 15 }}>
            Select which AP exam you are preparing for.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {EXAMS.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <button
                  onClick={() => exam.available && handleSelect(exam.id)}
                  disabled={!exam.available}
                  style={{
                    width: '100%', textAlign: 'left',
                    background: 'var(--card)',
                    border: `2px solid ${exam.available ? exam.color + '44' : 'var(--border)'}`,
                    borderRadius: 20, padding: 20,
                    cursor: exam.available ? 'pointer' : 'default',
                    opacity: exam.available ? 1 : 0.5,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (exam.available) e.currentTarget.style.borderColor = exam.color; }}
                  onMouseLeave={e => { if (exam.available) e.currentTarget.style.borderColor = exam.color + '44'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 16,
                      background: exam.color + '22', border: `1px solid ${exam.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28, flexShrink: 0,
                    }}>
                      {exam.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)' }}>
                          {exam.name}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px',
                          borderRadius: 10, background: exam.available ? exam.color + '22' : 'var(--bg-mid)',
                          color: exam.available ? exam.color : 'var(--text-dim)',
                          border: `1px solid ${exam.available ? exam.color + '44' : 'var(--border)'}`,
                        }}>
                          {exam.subtitle}
                        </span>
                      </div>
                      <p style={{ fontSize: 14, color: 'var(--text-mid)', margin: 0, lineHeight: 1.5 }}>
                        {exam.description}
                      </p>
                    </div>
                    {exam.available && (
                      <div style={{ color: exam.color, fontSize: 20, alignSelf: 'center' }}>→</div>
                    )}
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
