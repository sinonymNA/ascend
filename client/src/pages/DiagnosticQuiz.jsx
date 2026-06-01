import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import SoundService from '../lib/sound.js';
import Icon from '../components/ui/Icon.jsx';

const TIMER_SECONDS = 30;

// 20 hardcoded diagnostic questions (mix of SAT/ACT, difficulty 1-3)
const DIAGNOSTIC = [
  { id: 'd1',  subject: 'SAT Math',    difficulty: 1, question: 'What is the value of x if 2x + 4 = 14?', options: { A: '3', B: '5', C: '7', D: '9' }, correct: 'B', explanation: '2x = 10, so x = 5.' },
  { id: 'd2',  subject: 'SAT R&W',     difficulty: 1, question: 'Which word best completes the sentence: "The scientist\'s discovery was _______, reshaping decades of established theory."', options: { A: 'trivial', B: 'mundane', C: 'revolutionary', D: 'predictable' }, correct: 'C', explanation: 'Revolutionary means causing major change — fitting for a discovery that reshapes theory.' },
  { id: 'd3',  subject: 'ACT Math',    difficulty: 1, question: 'A rectangle has length 12 and width 7. What is its area?', options: { A: '38', B: '76', C: '84', D: '96' }, correct: 'C', explanation: 'Area = 12 × 7 = 84.' },
  { id: 'd4',  subject: 'ACT English', difficulty: 1, question: 'Select the version with correct punctuation: "The team practiced hard; they won the championship."', options: { A: 'The team practiced hard, they won the championship.', B: 'The team practiced hard; they won the championship.', C: 'The team practiced hard: they won the championship.', D: 'The team practiced hard. They won, the championship.' }, correct: 'B', explanation: 'A semicolon correctly joins two related independent clauses.' },
  { id: 'd5',  subject: 'ACT Reading', difficulty: 1, question: 'A passage states that coral bleaching increases when ocean temperatures rise. What can be inferred?', options: { A: 'Coral bleaching causes ocean temperatures to rise.', B: 'Higher ocean temperatures stress corals and may cause bleaching.', C: 'Bleaching only occurs in shallow waters.', D: 'Coral reefs are unaffected by temperature changes.' }, correct: 'B', explanation: 'The passage establishes that rising temperatures cause bleaching — a direct causal relationship.' },
  { id: 'd6',  subject: 'SAT Math',    difficulty: 2, question: 'If f(x) = 3x² − 5, what is f(−2)?', options: { A: '−17', B: '7', C: '17', D: '−7' }, correct: 'B', explanation: 'f(−2) = 3(4) − 5 = 12 − 5 = 7.' },
  { id: 'd7',  subject: 'SAT R&W',     difficulty: 2, question: 'The author uses the phrase "tectonic shift" to describe changes in consumer behavior. This is an example of:', options: { A: 'Simile', B: 'Metaphor', C: 'Personification', D: 'Hyperbole' }, correct: 'B', explanation: 'A metaphor equates two things directly without "like" or "as."' },
  { id: 'd8',  subject: 'ACT Math',    difficulty: 2, question: 'What is the slope of the line passing through (2, 5) and (6, 13)?', options: { A: '1', B: '1.5', C: '2', D: '2.5' }, correct: 'C', explanation: 'Slope = (13−5)/(6−2) = 8/4 = 2.' },
  { id: 'd9',  subject: 'ACT Science', difficulty: 2, question: 'A graph shows that as pH decreases from 7 to 4, enzyme activity drops from 80% to 15%. What conclusion is best supported?', options: { A: 'Enzyme activity increases in acidic conditions.', B: 'The enzyme functions optimally near neutral pH.', C: 'pH has no effect on enzyme activity.', D: 'The enzyme is most active at pH 4.' }, correct: 'B', explanation: 'Activity peaks near pH 7 (neutral) and drops as pH decreases (becomes more acidic).' },
  { id: 'd10', subject: 'ACT English', difficulty: 2, question: 'Which choice best combines the two sentences? "She studied for six hours. She still felt unprepared."', options: { A: 'She studied for six hours, she still felt unprepared.', B: 'She studied for six hours, and she still felt unprepared.', C: 'She studied for six hours; and she still felt unprepared.', D: 'Despite studying for six hours, she still felt unprepared.' }, correct: 'D', explanation: 'Option D is the most concise and uses a subordinate clause to show the contrast effectively.' },
  { id: 'd11', subject: 'SAT Math',    difficulty: 2, question: 'A store sells a jacket originally priced at $80 at a 25% discount. What is the sale price?', options: { A: '$55', B: '$60', C: '$65', D: '$70' }, correct: 'B', explanation: '25% of $80 = $20. Sale price = $80 − $20 = $60.' },
  { id: 'd12', subject: 'SAT R&W',     difficulty: 2, question: 'As used in the passage, "nascent" most nearly means:', options: { A: 'Fully developed', B: 'Just beginning', C: 'Rapidly declining', D: 'Well-established' }, correct: 'B', explanation: '"Nascent" means just coming into existence or beginning to develop.' },
  { id: 'd13', subject: 'ACT Math',    difficulty: 3, question: 'If sin θ = 3/5 and θ is in the first quadrant, what is cos θ?', options: { A: '3/5', B: '4/5', C: '4/3', D: '5/4' }, correct: 'B', explanation: 'Using the Pythagorean identity: cos²θ = 1 − sin²θ = 1 − 9/25 = 16/25, so cos θ = 4/5.' },
  { id: 'd14', subject: 'SAT Math',    difficulty: 3, question: 'The system of equations y = 2x − 1 and y = −x + 5 has a solution at:', options: { A: '(1, 4)', B: '(2, 3)', C: '(3, 2)', D: '(4, 1)' }, correct: 'B', explanation: 'Set 2x−1 = −x+5: 3x = 6, x = 2, y = 3. Check: 2(2)−1 = 3.' },
  { id: 'd15', subject: 'ACT Reading', difficulty: 3, question: 'A passage argues that "innovation thrives in environments that tolerate failure." Which evidence most directly supports this?', options: { A: 'Successful companies have large research budgets.', B: 'Companies that penalize failure heavily saw a 40% drop in patent filings.', C: 'Many innovations were discovered accidentally.', D: 'Tolerating failure is a recent management philosophy.' }, correct: 'B', explanation: 'Option B directly shows that penalizing failure reduces innovation output (patents), supporting the causal claim.' },
  { id: 'd16', subject: 'ACT Science', difficulty: 3, question: 'Two scientists disagree about whether increased CO₂ causes ocean acidification. Scientist 1 cites pH drops in controlled experiments; Scientist 2 argues natural variation explains the data. Which additional data would most help resolve the disagreement?', options: { A: 'Ocean temperature data from the same locations', B: 'Long-term pH records from isolated ocean regions with stable CO₂', C: 'CO₂ emission data from nearby factories', D: 'pH measurements from freshwater lakes' }, correct: 'B', explanation: 'Measuring pH in regions with stable (controlled) CO₂ would isolate whether CO₂ — not natural variation — drives pH changes.' },
  { id: 'd17', subject: 'SAT R&W',     difficulty: 3, question: 'The author ends the essay with a question rather than a statement. This choice primarily suggests:', options: { A: 'The author lacks a clear position', B: 'The issue remains open, inviting further action', C: 'The question has an obvious implied answer', D: 'The essay is incomplete' }, correct: 'B', explanation: 'Ending with a genuine question signals the topic is unresolved and calls the reader to further inquiry or action.' },
  { id: 'd18', subject: 'SAT Math',    difficulty: 3, question: 'The population of a city doubles every 15 years. If the population is 50,000 in 2020, what will it be in 2050?', options: { A: '100,000', B: '150,000', C: '200,000', D: '400,000' }, correct: 'D', explanation: '2050 − 2020 = 30 years = 2 doubling periods. 50,000 × 2² = 50,000 × 4 = 200,000. Wait — that\'s C. Actually: 50,000 × 4 = 200,000. But 30 years = 2 doublings: 50k→100k→200k. Answer is C. (Corrected: select C.)' },
  { id: 'd19', subject: 'ACT English', difficulty: 3, question: 'Which version avoids the dangling modifier? "Walking through the park, ___."', options: { A: 'the flowers were beautiful.', B: 'I noticed the flowers were beautiful.', C: 'beautiful flowers could be seen.', D: 'it was a beautiful day for flowers.' }, correct: 'B', explanation: '"Walking through the park" implies a person is walking; the subject must be "I."' },
  { id: 'd20', subject: 'ACT Math',    difficulty: 3, question: 'What is the area of a circle with diameter 10?', options: { A: '10π', B: '25π', C: '50π', D: '100π' }, correct: 'B', explanation: 'r = 5, Area = πr² = 25π.' },
];

// Fix question d18's answer (corrected above)
DIAGNOSTIC[17].correct = 'C';
DIAGNOSTIC[17].explanation = '2050 − 2020 = 30 years = 2 doubling periods. 50,000 × 2² = 200,000.';
DIAGNOSTIC[17].options.C = '200,000';
DIAGNOSTIC[17].options.D = '400,000';

export default function DiagnosticQuiz() {
  const { navigate, setUser, user } = useApp();
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [phase, setPhase] = useState('question'); // question | result | done
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const q = DIAGNOSTIC[idx];

  // Timer countdown
  useEffect(() => {
    if (phase !== 'question') return;
    setTimeLeft(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          handleAnswer(null); // time expired
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, phase]);

  const handleAnswer = useCallback((letter) => {
    if (selected || phase !== 'question') return;
    clearInterval(timerRef.current);

    const correct = letter && letter === q.correct;
    SoundService.play(correct ? 'correct' : 'wrong');

    setSelected(letter || 'timeout');
    setResult({ correct, letter, explanation: q.explanation });
    setAnswers((prev) => [...prev, { id: q.id, correct, subject: q.subject, difficulty: q.difficulty }]);
    setPhase('result');
  }, [selected, phase, q]);

  const next = useCallback(() => {
    const nextIdx = idx + 1;
    if (nextIdx >= DIAGNOSTIC.length) {
      // Done — save diagnostic_done flag and go to dashboard
      api.post('/auth/diagnostic-done', {}).catch(() => {});
      setUser((u) => u ? { ...u, diagnostic_done: true } : u);
      navigate('student_dashboard');
      return;
    }
    setIdx(nextIdx);
    setSelected(null);
    setResult(null);
    setPhase('question');
  }, [idx, navigate, setUser]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timeLeft <= 10 ? '#E85D4A' : timeLeft <= 20 ? '#F5A623' : '#52B788';

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'Nunito, sans-serif', padding: '24px 16px',
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: '520px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '13px', color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.1em' }}>
            DIAGNOSTIC · {idx + 1} / {DIAGNOSTIC.length}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 800, color: timerColor }}>
            {timeLeft}s
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
          <motion.div
            style={{ height: '100%', background: 'var(--gold)', borderRadius: '4px', originX: 0 }}
            animate={{ width: `${((idx) / DIAGNOSTIC.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Timer bar */}
        <div style={{ height: '3px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginTop: '4px' }}>
          <motion.div
            style={{ height: '100%', background: timerColor, borderRadius: '4px', transformOrigin: 'left' }}
            animate={{ width: `${timerPct}%` }}
            transition={{ duration: 0.9, ease: 'linear' }}
          />
        </div>
      </div>

      {/* Question card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.22 }}
          style={{ width: '100%', maxWidth: '520px' }}
        >
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '3px 10px' }}>
                {q.subject}
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: q.difficulty === 1 ? '#52B788' : q.difficulty === 2 ? '#F5A623' : '#E85D4A', background: 'var(--bg-elevated)', borderRadius: '8px', padding: '3px 10px' }}>
                {q.difficulty === 1 ? 'Base Camp' : q.difficulty === 2 ? 'Alpine' : 'Summit'}
              </span>
            </div>

            <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text)', lineHeight: 1.6, marginBottom: '20px' }}>
              {q.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {['A', 'B', 'C', 'D'].map((letter) => {
                let bg = 'var(--bg-elevated)';
                let border = 'var(--border)';
                let color = 'var(--text)';
                if (selected) {
                  if (letter === q.correct) { bg = 'rgba(82,183,136,0.15)'; border = '#52B788'; color = '#52B788'; }
                  else if (letter === selected && letter !== q.correct) { bg = 'rgba(232,93,74,0.15)'; border = '#E85D4A'; color = '#E85D4A'; }
                }
                return (
                  <motion.button
                    key={letter}
                    onClick={() => handleAnswer(letter)}
                    disabled={!!selected}
                    whileHover={!selected ? { scale: 1.02 } : {}}
                    whileTap={!selected ? { scale: 0.98 } : {}}
                    style={{
                      background: bg, border: `1.5px solid ${border}`,
                      borderRadius: '12px', padding: '12px 16px',
                      display: 'flex', alignItems: 'flex-start', gap: '12px',
                      cursor: selected ? 'default' : 'pointer',
                      textAlign: 'left', color, fontFamily: 'Nunito, sans-serif',
                      fontSize: '14px', fontWeight: 600, lineHeight: 1.5,
                      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                    }}
                  >
                    <span style={{ fontWeight: 800, flexShrink: 0 }}>{letter}.</span>
                    {q.options[letter]}
                  </motion.button>
                );
              })}
            </div>

            {/* Result + explanation */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginTop: '16px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '15px', fontWeight: 800, color: result.correct ? '#52B788' : '#E85D4A', marginBottom: '8px' }}>
                    {result.correct
                      ? <><Icon name="check" size={15} color="#52B788" /> Correct!</>
                      : <><Icon name="xCircle" size={15} color="#E85D4A" /> Not quite</>}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-mid)', lineHeight: 1.6, background: 'var(--bg-elevated)', borderRadius: '10px', padding: '10px 14px' }}>
                    {result.explanation}
                  </div>
                  <motion.button
                    onClick={next}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      marginTop: '14px', width: '100%',
                      background: 'var(--gold)', color: '#0F1720',
                      border: 'none', borderRadius: '12px',
                      padding: '13px', fontSize: '14px', fontWeight: 800,
                      cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    {idx + 1 >= DIAGNOSTIC.length ? 'See My Score →' : 'Next Question →'}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Skip */}
      {!selected && (
        <button onClick={() => { navigate('student_dashboard'); }} style={{
          marginTop: '20px', background: 'none', border: 'none',
          color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
        }}>
          Skip diagnostic — go straight to dashboard
        </button>
      )}
    </div>
  );
}
