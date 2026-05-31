import React from 'react';
import { motion } from 'framer-motion';

// ─── Prediction formula ───────────────────────────────────────────────────────
// Takes array of { difficulty, mastered } question records for each section
function predictSATSection(masteredByDiff) {
  const easy   = masteredByDiff[1] || 0;
  const medium = masteredByDiff[2] || 0;
  const hard   = masteredByDiff[3] || 0;
  return Math.min(800, Math.max(200, Math.round(350 + easy * 3 + medium * 5 + hard * 9)));
}

function predictACTSection(masteredByDiff) {
  const easy   = masteredByDiff[1] || 0;
  const medium = masteredByDiff[2] || 0;
  const hard   = masteredByDiff[3] || 0;
  return Math.min(36, Math.max(1, Math.round(12 + easy * 0.08 + medium * 0.12 + hard * 0.18)));
}

// ─── Score gauge SVG ──────────────────────────────────────────────────────────
function Gauge({ score, min, max, label, color = '#F5A623' }) {
  const pct = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const R = 38, cx = 50, cy = 52;
  const startAngle = -200, endAngle = 20; // degrees, arc goes left to right
  const totalDeg = endAngle - startAngle;

  function polarToXY(deg) {
    const rad = (deg * Math.PI) / 180;
    return [cx + R * Math.cos(rad), cy + R * Math.sin(rad)];
  }

  const [sx, sy] = polarToXY(startAngle);
  const [ex, ey] = polarToXY(endAngle);
  const arcPct = startAngle + totalDeg * pct;
  const [px, py] = polarToXY(arcPct);

  const bgPath = `M ${sx} ${sy} A ${R} ${R} 0 1 1 ${ex} ${ey}`;
  const fgPath = pct < 0.01 ? '' : `M ${sx} ${sy} A ${R} ${R} 0 ${pct > 0.5 ? 1 : 0} 1 ${px} ${py}`;

  return (
    <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
      <svg viewBox="0 0 100 65" style={{ width: '100%', maxWidth: '140px' }}>
        <path d={bgPath} fill="none" stroke="rgba(240,237,230,0.08)" strokeWidth="7" strokeLinecap="round" />
        {fgPath && (
          <motion.path
            d={fgPath}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}
        {/* Needle dot */}
        <motion.circle
          cx={px} cy={py} r="4"
          fill={color}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
        />
        {/* Score */}
        <text x="50" y="46" textAnchor="middle" fill="var(--text)"
          fontSize="15" fontWeight="800" fontFamily="Cinzel, serif">
          {score}
        </text>
        <text x="50" y="58" textAnchor="middle" fill="var(--text-muted)"
          fontSize="5.5" fontFamily="Nunito, sans-serif" fontWeight="700">
          {label}
        </text>
      </svg>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScorePrediction({ progress = [], onImprove }) {
  // Compute mastery by difficulty per set from progress data
  // progress items: { set_subject, mastered_count, questions_total, ... }
  // We use simple heuristics since we don't have per-difficulty breakdowns here:
  // assume easy:medium:hard = 2:2:1 ratio for the mastered count
  function estimateByDiff(masteredCount, questionsTotal) {
    if (!questionsTotal) return { 1: 0, 2: 0, 3: 0 };
    const ratio = Math.min(1, masteredCount / questionsTotal);
    // Each set has ~40% easy, 40% medium, 20% hard
    return {
      1: Math.round(masteredCount * 0.4),
      2: Math.round(masteredCount * 0.4),
      3: Math.round(masteredCount * 0.2),
    };
  }

  const satMath = progress.find((p) => p.set_subject === 'sat_math');
  const satRW   = progress.find((p) => p.set_subject === 'sat_rw');
  const actMath = progress.find((p) => p.set_subject === 'act_math');
  const actEng  = progress.find((p) => p.set_subject === 'act_english');
  const actRead = progress.find((p) => p.set_subject === 'act_reading');
  const actSci  = progress.find((p) => p.set_subject === 'act_science');

  const hasSATData = satMath || satRW;
  const hasACTData = actMath || actEng || actRead || actSci;

  const satMathScore = predictSATSection(estimateByDiff(satMath?.mastered_count || 0, 200));
  const satRWScore   = predictSATSection(estimateByDiff(satRW?.mastered_count || 0, 200));
  const satTotal     = satMathScore + satRWScore;

  const actSections  = [actMath, actEng, actRead, actSci].map((p) =>
    predictACTSection(estimateByDiff(p?.mastered_count || 0, p ? p.questions_total || 150 : 150))
  );
  const actComposite = Math.round(actSections.reduce((a, b) => a + b, 0) / 4);

  if (!hasSATData && !hasACTData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-gold)',
        borderRadius: '20px',
        padding: '20px 24px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{
          fontFamily: 'Cinzel, serif',
          fontSize: '11px',
          fontWeight: 700,
          color: 'var(--gold)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}>
          Score Prediction
        </div>
        {onImprove && (
          <button onClick={onImprove} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700,
            fontFamily: 'Nunito, sans-serif', padding: '2px 6px',
          }}>
            Improve →
          </button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '8px' }}>
        {hasSATData && (
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Gauge score={satTotal} min={400} max={1600} label="SAT TOTAL" color="#F5A623" />
          </div>
        )}
        {hasACTData && (
          <div style={{ textAlign: 'center', flex: 1 }}>
            <Gauge score={actComposite} min={1} max={36} label="ACT COMPOSITE" color="#52B788" />
          </div>
        )}
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginTop: '8px',
      }}>
        Based on your mastery progress · Updates as you climb
      </div>
    </motion.div>
  );
}
