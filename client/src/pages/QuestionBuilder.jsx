import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';

const THINKING_SKILLS = [
  { value: 'causation', label: 'Causation' },
  { value: 'continuity_and_change', label: 'Continuity & Change' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'contextualization', label: 'Contextualization' },
  { value: 'argumentation', label: 'Argumentation' },
  { value: 'periodization', label: 'Periodization' },
];

const STIMULUS_TYPES = ['text', 'image_description', 'map_description', 'chart'];

const EMPTY_QUESTION = {
  stimulus: '',
  stimulus_type: null,
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  correct: 'A',
  explanation: '',
  difficulty: 1,
  tags: '',
  historical_thinking: [],
};

function DifficultyButton({ level, label, active, onClick }) {
  const colors = { 1: '#52B788', 2: '#F5A623', 3: '#E85D4A' };
  return (
    <button
      onClick={() => onClick(level)}
      style={{
        flex: 1, padding: '8px 4px', borderRadius: 8, border: `2px solid ${active ? colors[level] : 'var(--border)'}`,
        background: active ? colors[level] + '22' : 'transparent', color: active ? colors[level] : 'var(--text-muted)',
        cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, transition: 'all 0.15s',
      }}
    >
      {level} — {label}
    </button>
  );
}

function AIModal({ show, onClose, onAdd, isPro }) {
  const [tab, setTab] = useState('generate');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [extractedList, setExtractedList] = useState([]);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const q = await api.post('/api/ai/generate', { topic, difficulty, subject: 'ap_world_history_modern' });
      setResult(q);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally { setLoading(false); }
  }

  async function handleExtract() {
    if (!text.trim()) return;
    setLoading(true); setError(''); setExtractedList([]); setSelected([]);
    try {
      const list = await api.post('/api/ai/extract', { text, subject: 'ap_world_history_modern' });
      setExtractedList(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Extraction failed');
    } finally { setLoading(false); }
  }

  if (!show) return null;

  const tabStyle = (t) => ({
    flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', fontWeight: 700,
    fontSize: 14, borderBottom: tab === t ? '2px solid var(--gold)' : '2px solid transparent',
    background: 'transparent', color: tab === t ? 'var(--gold)' : 'var(--text-muted)', transition: 'all 0.15s',
  });

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{ padding: '20px 24px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)' }}>✨ AI Assist</span>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20 }}>×</button>
          </div>

          {!isPro && (
            <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--border-gold)', borderRadius: 10 }}>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--gold)' }}>🔒 AI generation requires Summit Pro ($12/month). <button onClick={() => api.post('/api/payments/create-checkout', {}).then(d => window.location.href = d.url)} style={{ background: 'none', border: 'none', color: 'var(--gold)', fontWeight: 800, cursor: 'pointer', textDecoration: 'underline' }}>Upgrade →</button></p>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            <button style={tabStyle('generate')} onClick={() => setTab('generate')}>Generate from Topic</button>
            <button style={tabStyle('extract')} onClick={() => setTab('extract')}>Extract from Text</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            {tab === 'generate' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Topic</label>
                  <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g. Mongol conquest of China, Mansa Musa's pilgrimage..."
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 14, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Difficulty</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[1, 2, 3].map(d => <DifficultyButton key={d} level={d} label={['Base Camp', 'Alpine', 'Summit'][d - 1]} active={difficulty === d} onClick={setDifficulty} />)}
                  </div>
                </div>
                <button onClick={handleGenerate} disabled={!isPro || loading || !topic.trim()} className="btn-primary"
                  style={{ opacity: (!isPro || !topic.trim()) ? 0.5 : 1 }}>
                  {loading ? '⏳ Generating...' : 'Generate Question →'}
                </button>
                {error && <p style={{ color: 'var(--sunset)', fontSize: 13, margin: 0 }}>{error}</p>}
                {result && (
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: 10, padding: 16 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{result.question}</p>
                    {['A', 'B', 'C', 'D'].map(opt => (
                      <p key={opt} style={{ fontSize: 13, color: opt === result.correct ? 'var(--pine-light)' : 'var(--text-mid)', margin: '4px 0' }}>
                        {opt === result.correct ? '✓ ' : ''}{opt}. {result.options?.[opt]}
                      </p>
                    ))}
                    <button className="btn-primary" style={{ marginTop: 12, width: '100%' }} onClick={() => { onAdd(result); onClose(); }}>
                      Add to Set →
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Paste text, notes, or a reading passage</label>
                  <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste a primary source, textbook excerpt, or notes..."
                    style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
                </div>
                <button onClick={handleExtract} disabled={!isPro || loading || !text.trim()} className="btn-primary"
                  style={{ opacity: (!isPro || !text.trim()) ? 0.5 : 1 }}>
                  {loading ? '⏳ Extracting...' : 'Extract Questions →'}
                </button>
                {error && <p style={{ color: 'var(--sunset)', fontSize: 13, margin: 0 }}>{error}</p>}
                {extractedList.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <p style={{ fontSize: 13, color: 'var(--text-mid)', margin: 0 }}>{extractedList.length} questions extracted. Select which to add:</p>
                    {extractedList.map((q, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--bg-card)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', border: `1px solid ${selected.includes(i) ? 'var(--border-gold)' : 'var(--border)'}` }}
                        onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}>
                        <input type="checkbox" checked={selected.includes(i)} onChange={() => {}} style={{ marginTop: 2, accentColor: 'var(--gold)' }} />
                        <span style={{ fontSize: 13, color: 'var(--text)' }}>{q.question}</span>
                      </div>
                    ))}
                    <button className="btn-primary" onClick={() => { selected.forEach(i => onAdd(extractedList[i])); onClose(); }}
                      disabled={selected.length === 0} style={{ opacity: selected.length === 0 ? 0.5 : 1 }}>
                      Add {selected.length} Question{selected.length !== 1 ? 's' : ''} →
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function QuestionEditor({ q, onChange, onSave }) {
  const field = (key, val) => onChange({ ...q, [key]: val });
  const option = (opt, val) => onChange({ ...q, options: { ...q.options, [opt]: val } });
  const toggleSkill = (s) => onChange({ ...q, historical_thinking: q.historical_thinking.includes(s) ? q.historical_thinking.filter(x => x !== s) : [...q.historical_thinking, s] });

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 14, boxSizing: 'border-box',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Stimulus */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Stimulus (optional)</label>
        <textarea value={q.stimulus} onChange={e => field('stimulus', e.target.value)} rows={3}
          placeholder="Paste a primary source, quote, or description..."
          style={{ ...inputStyle, resize: 'vertical' }} />
        <select value={q.stimulus_type || ''} onChange={e => field('stimulus_type', e.target.value || null)}
          style={{ ...inputStyle, marginTop: 6 }}>
          <option value="">No stimulus type</option>
          {STIMULUS_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {/* Question */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Question *</label>
        <textarea value={q.question} onChange={e => field('question', e.target.value)} rows={3}
          placeholder="Write your multiple choice question..."
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {/* Options */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Answer Options *</label>
        {['A', 'B', 'C', 'D'].map(opt => (
          <div key={opt} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ width: 28, height: 28, borderRadius: 6, background: q.correct === opt ? 'rgba(82,183,136,0.2)' : 'var(--bg-elevated)', border: `1.5px solid ${q.correct === opt ? '#52B788' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: q.correct === opt ? '#52B788' : 'var(--text-muted)', flexShrink: 0 }}>{opt}</span>
            <input value={q.options[opt]} onChange={e => option(opt, e.target.value)} placeholder={`Option ${opt}`}
              style={{ ...inputStyle, flex: 1 }} />
          </div>
        ))}
      </div>

      {/* Correct */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Correct Answer *</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {['A', 'B', 'C', 'D'].map(opt => (
            <button key={opt} onClick={() => field('correct', opt)}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${q.correct === opt ? '#52B788' : 'var(--border)'}`, background: q.correct === opt ? 'rgba(82,183,136,0.15)' : 'transparent', color: q.correct === opt ? '#52B788' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 800 }}>
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Explanation */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Explanation *</label>
        <textarea value={q.explanation} onChange={e => field('explanation', e.target.value)} rows={3}
          placeholder="Explain why the correct answer is right AND why the most tempting wrong answer is wrong. 2-3 sentences."
          style={{ ...inputStyle, resize: 'vertical' }} />
      </div>

      {/* Difficulty */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Difficulty</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[1, 2, 3].map(d => <DifficultyButton key={d} level={d} label={['Base Camp', 'Alpine', 'Summit'][d - 1]} active={q.difficulty === d} onClick={v => field('difficulty', v)} />)}
        </div>
      </div>

      {/* Historical thinking */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 8 }}>Historical Thinking Skills</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {THINKING_SKILLS.map(s => (
            <button key={s.value} onClick={() => toggleSkill(s.value)}
              style={{ padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${q.historical_thinking.includes(s.value) ? 'var(--gold)' : 'var(--border)'}`, background: q.historical_thinking.includes(s.value) ? 'rgba(245,166,35,0.12)' : 'transparent', color: q.historical_thinking.includes(s.value) ? 'var(--gold)' : 'var(--text-muted)', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Tags (comma-separated)</label>
        <input value={q.tags} onChange={e => field('tags', e.target.value)} placeholder="mongols, trade, china, yuan_dynasty"
          style={inputStyle} />
      </div>

      <button className="btn-primary" onClick={onSave} style={{ marginTop: 4 }}>Save Question</button>
    </div>
  );
}

export default function QuestionBuilder() {
  const { navigate, user } = useApp();
  const isPro = user?.subscription === 'pro';

  const [sets, setSets] = useState([]);
  const [activeSetId, setActiveSetId] = useState(null);
  const [setTitle, setSetTitle] = useState('Untitled Set');
  const [setSubject, setSetSubject] = useState('ap_world_history_modern');
  const [questionList, setQuestionList] = useState([]);
  const [activeQIdx, setActiveQIdx] = useState(null);
  const [editingQ, setEditingQ] = useState(null);
  const [showAI, setShowAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/api/questions/sets').then(data => setSets(data?.sets || [])).catch(() => {});
  }, []);

  function selectQuestion(i) {
    setActiveQIdx(i);
    setEditingQ({ ...questionList[i], tags: (questionList[i].tags || []).join(', ') });
  }

  function addBlankQuestion() {
    const newQ = { ...EMPTY_QUESTION, options: { A: '', B: '', C: '', D: '' }, historical_thinking: [] };
    const newList = [...questionList, newQ];
    setQuestionList(newList);
    setActiveQIdx(newList.length - 1);
    setEditingQ({ ...newQ, tags: '' });
  }

  function saveEditingQuestion() {
    if (activeQIdx === null) return;
    const saved = { ...editingQ, tags: editingQ.tags.split(',').map(t => t.trim()).filter(Boolean) };
    const newList = [...questionList];
    newList[activeQIdx] = saved;
    setQuestionList(newList);
  }

  function deleteQuestion(i) {
    const newList = questionList.filter((_, idx) => idx !== i);
    setQuestionList(newList);
    if (activeQIdx === i) { setActiveQIdx(null); setEditingQ(null); }
    else if (activeQIdx > i) setActiveQIdx(activeQIdx - 1);
  }

  function addFromAI(q) {
    const newQ = { stimulus: q.stimulus || '', stimulus_type: q.stimulus_type || null, question: q.question || '', options: q.options || { A: '', B: '', C: '', D: '' }, correct: q.correct || 'A', explanation: q.explanation || '', difficulty: q.difficulty || 2, tags: (q.tags || []).join(', '), historical_thinking: q.historical_thinking || [] };
    const newList = [...questionList, newQ];
    setQuestionList(newList);
    setActiveQIdx(newList.length - 1);
    setEditingQ(newQ);
  }

  async function saveSet() {
    setSaving(true);
    try {
      const qs = questionList.map(q => ({ ...q, tags: Array.isArray(q.tags) ? q.tags : q.tags.split(',').map(t => t.trim()).filter(Boolean) }));
      if (activeSetId) {
        await api.put(`/api/questions/sets/${activeSetId}`, { title: setTitle, subject: setSubject, questions: qs });
      } else {
        const res = await api.post('/api/questions/sets', { title: setTitle, subject: setSubject, questions: qs });
        setActiveSetId(res.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert('Save failed: ' + e.message);
    } finally { setSaving(false); }
  }

  const DIFF_COLORS = { 1: '#52B788', 2: '#F5A623', 3: '#E85D4A' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'Nunito, sans-serif' }}>
      {/* Nav */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 28px', borderBottom: '1px solid var(--border)', background: 'rgba(15,23,32,0.9)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <button onClick={() => navigate('teacher_dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #F5A623, #C8851A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', padding: 0 }}>SUMMIT</button>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <AnimatePresence>{saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 13, color: '#52B788', fontWeight: 700 }}>✓ Saved</motion.span>}</AnimatePresence>
          <button onClick={saveSet} disabled={saving} className="btn-primary" style={{ padding: '8px 20px', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving…' : 'Save Set'}</button>
          <button onClick={() => navigate('teacher_dashboard')} className="btn-ghost" style={{ padding: '8px 14px', fontSize: 13 }}>← Dashboard</button>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* LEFT: set meta + question list */}
        <div style={{ width: 340, minWidth: 280, borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <div style={{ padding: 20, borderBottom: '1px solid var(--border)' }}>
            <input value={setTitle} onChange={e => setSetTitle(e.target.value)}
              style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontFamily: 'Cinzel, serif', fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8, boxSizing: 'border-box' }} />
            <select value={setSubject} onChange={e => setSetSubject(e.target.value)}
              style={{ width: '100%', padding: '7px 10px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-mid)', fontFamily: 'Nunito, sans-serif', fontSize: 13, boxSizing: 'border-box' }}>
              <option value="ap_world_history_modern">AP World History Modern</option>
              <option value="apush">APUSH</option>
              <option value="ap_gov">AP Government</option>
              <option value="ap_human_geo">AP Human Geography</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
            {questionList.map((q, i) => (
              <div key={i} onClick={() => selectQuestion(i)}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, marginBottom: 4, cursor: 'pointer', background: activeQIdx === i ? 'rgba(245,166,35,0.08)' : 'transparent', border: activeQIdx === i ? '1px solid var(--border-gold)' : '1px solid transparent', transition: 'all 0.15s' }}>
                <span style={{ width: 16, height: 16, borderRadius: '50%', background: DIFF_COLORS[q.difficulty] || '#6B7E8F', flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: 'var(--text-mid)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.question || '(empty question)'}</span>
                <button onClick={e => { e.stopPropagation(); deleteQuestion(i); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16, padding: '0 2px', flexShrink: 0 }}>×</button>
              </div>
            ))}
          </div>

          <div style={{ padding: 12, display: 'flex', gap: 8, borderTop: '1px solid var(--border)' }}>
            <button onClick={addBlankQuestion} className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>+ Add Question</button>
            <button onClick={() => setShowAI(true)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-gold)', background: 'rgba(245,166,35,0.08)', color: 'var(--gold)', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✨ AI</button>
          </div>
        </div>

        {/* RIGHT: question editor */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          {editingQ ? (
            <motion.div key={activeQIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 24, color: 'var(--text-mid)' }}>Question {activeQIdx + 1} of {questionList.length}</h2>
              <QuestionEditor q={editingQ} onChange={setEditingQ} onSave={saveEditingQuestion} />
            </motion.div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, color: 'var(--text-muted)', textAlign: 'center' }}>
              <span style={{ fontSize: 48 }}>📝</span>
              <p style={{ fontWeight: 700, fontSize: 16 }}>Select a question to edit<br />or add a new one to get started.</p>
              <button onClick={addBlankQuestion} className="btn-primary">+ Add First Question</button>
            </div>
          )}
        </div>
      </div>

      <AIModal show={showAI} onClose={() => setShowAI(false)} onAdd={addFromAI} isPro={isPro} />
    </div>
  );
}
