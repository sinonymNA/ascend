import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import Modal from '../components/ui/Modal.jsx';
import Icon from '../components/ui/Icon.jsx';

const THINKING_SKILLS = [
  { value: 'causation',            label: 'Causation' },
  { value: 'continuity_and_change', label: 'Continuity & Change' },
  { value: 'comparison',           label: 'Comparison' },
  { value: 'contextualization',    label: 'Contextualization' },
  { value: 'argumentation',        label: 'Argumentation' },
  { value: 'periodization',        label: 'Periodization' },
];

const STIMULUS_TYPES = ['None', 'Text', 'Image Description', 'Map Description', 'Chart'];

const DIFFICULTY_OPTS = [
  { value: 1, label: 'Base Camp', color: '#52B788' },
  { value: 2, label: 'Alpine',    color: '#F5A623' },
  { value: 3, label: 'Summit',    color: '#E85D4A' },
];

const EMPTY_QUESTION = {
  stimulus: '',
  stimulus_type: 'None',
  question: '',
  options: { A: '', B: '', C: '', D: '' },
  correct: 'A',
  explanation: '',
  difficulty: 1,
  tags: '',
  historical_thinking: [],
};

function generateId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function isValid(q) {
  return q.question.trim().length > 0 &&
    q.options.A.trim().length > 0 && q.options.B.trim().length > 0 &&
    q.options.C.trim().length > 0 && q.options.D.trim().length > 0;
}

function Spinner() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.85, repeat: Infinity, ease: 'linear' }}
      style={{ width: 18, height: 18, border: '2.5px solid rgba(15,23,32,0.25)', borderTopColor: '#0F1720', borderRadius: '50%', display: 'inline-block' }}
    />
  );
}

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

function AIModal({ show, onClose, onAdd, onAddMany, isPro }) {
  const [tab,       setTab]       = useState('generate');
  const [topic,     setTopic]     = useState('');
  const [difficulty, setDifficulty] = useState(2);
  const [text,      setText]      = useState('');
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [extractedList, setExtractedList] = useState([]);
  const [selected,  setSelected]  = useState([]);
  const [error,     setError]     = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  async function handleGenerate() {
    if (!isPro) { setShowPaywall(true); return; }
    if (!topic.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const q = await api.post('/api/ai/generate', { topic, difficulty });
      setResult(q);
    } catch (e) {
      setError(e.message || 'Generation failed');
    } finally { setLoading(false); }
  }

  async function handleExtract() {
    if (!isPro) { setShowPaywall(true); return; }
    if (!text.trim()) return;
    setLoading(true); setError(''); setExtractedList([]); setSelected([]);
    try {
      const list = await api.post('/api/ai/extract', { text });
      const qs = Array.isArray(list) ? list : (list?.questions || []);
      setExtractedList(qs);
      setSelected(qs.map((_, i) => i));
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
    <>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '82vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
            >
              {/* Header */}
              <div style={{ padding: '20px 24px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="sparkles" size={18} color="var(--gold)" /> AI Assist</span>
                <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center' }}><Icon name="xCircle" size={20} /></button>
              </div>

              {!isPro && (
                <div style={{ margin: '0 24px 12px', padding: '10px 14px', background: 'rgba(245,166,35,0.1)', border: '1px solid var(--border-gold)', borderRadius: 10 }}>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}><Icon name="lock" size={13} color="var(--gold)" /> Pro Feature — AI generation requires Summit Pro.</p>
                </div>
              )}

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', borderTop: '1px solid var(--border)' }}>
                <button style={tabStyle('generate')} onClick={() => setTab('generate')}>Generate from Topic</button>
                <button style={tabStyle('extract')} onClick={() => setTab('extract')}>Extract from Text</button>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
                {tab === 'generate' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Topic</label>
                      <input value={topic} onChange={e => setTopic(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
                        placeholder="e.g. Mongol conquest of China, Mansa Musa's pilgrimage..."
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 14, boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, color: 'var(--text-mid)', fontWeight: 700, display: 'block', marginBottom: 6 }}>Difficulty</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {DIFFICULTY_OPTS.map(d => (
                          <DifficultyButton key={d.value} level={d.value} label={d.label} active={difficulty === d.value} onClick={setDifficulty} />
                        ))}
                      </div>
                    </div>
                    <button onClick={handleGenerate} disabled={loading || !topic.trim()} className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {loading ? <><Spinner /> Generating…</> : 'Generate Question →'}
                    </button>
                    {error && <p style={{ color: 'var(--sunset)', fontSize: 13, margin: 0 }}>{error}</p>}
                    {result && (
                      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: 10, padding: 16 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>{result.question}</p>
                        {['A', 'B', 'C', 'D'].map(opt => (
                          <p key={opt} style={{ fontSize: 13, color: opt === result.correct ? 'var(--pine-light)' : 'var(--text-mid)', margin: '4px 0', display: 'flex', alignItems: 'center', gap: 4 }}>
                            {opt === result.correct && <Icon name="check" size={13} color="var(--pine-light)" />}{opt}. {result.options?.[opt]}
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
                      <textarea value={text} onChange={e => setText(e.target.value)} rows={6}
                        placeholder="Paste a primary source, textbook excerpt, or notes..."
                        style={{ width: '100%', padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }} />
                    </div>
                    <button onClick={handleExtract} disabled={loading || !text.trim()} className="btn-primary"
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      {loading ? <><Spinner /> Extracting…</> : 'Extract Questions →'}
                    </button>
                    {error && <p style={{ color: 'var(--sunset)', fontSize: 13, margin: 0 }}>{error}</p>}
                    {extractedList.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p style={{ fontSize: 13, color: 'var(--text-mid)', margin: 0, fontWeight: 600 }}>{extractedList.length} questions found:</p>
                          <button onClick={() => setSelected(selected.length === extractedList.length ? [] : extractedList.map((_,i)=>i))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>
                            {selected.length === extractedList.length ? 'Deselect all' : 'Select all'}
                          </button>
                        </div>
                        {extractedList.map((q, i) => (
                          <div key={i}
                            style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--bg-card)', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', border: `1px solid ${selected.includes(i) ? 'rgba(82,183,136,0.4)' : 'var(--border)'}`, transition: 'all 0.15s' }}
                            onClick={() => setSelected(s => s.includes(i) ? s.filter(x => x !== i) : [...s, i])}>
                            <span style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${selected.includes(i) ? 'var(--pine-light)' : 'var(--border)'}`, background: selected.includes(i) ? 'var(--pine-light)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#0F1720', flexShrink: 0, marginTop: 1 }}>
                              {selected.includes(i) ? <Icon name="check" size={11} color="#0F1720" /> : ''}
                            </span>
                            <span style={{ fontSize: 13, color: 'var(--text)' }}>{q.question?.length > 80 ? q.question.slice(0, 78) + '…' : q.question}</span>
                          </div>
                        ))}
                        <button className="btn-primary"
                          onClick={() => { onAddMany(selected.map(i => extractedList[i])); onClose(); }}
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
        )}
      </AnimatePresence>

      {/* Paywall modal */}
      {showPaywall && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', padding: 24 }}
          onClick={() => setShowPaywall(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 20, padding: 32, maxWidth: 380, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}><Icon name="lock" size={40} color="var(--gold)" /></div>
            <div>
              <h2 className="cinzel" style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold)', margin: '0 0 8px' }}>Pro Feature</h2>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                AI question generation requires Summit Pro. Upgrade to unlock unlimited AI-powered question creation.
              </p>
            </div>
            <button onClick={() => setShowPaywall(false)} className="btn-primary" style={{ width: '100%' }}>View Pro Plans</button>
            <button onClick={() => setShowPaywall(false)} className="btn-ghost" style={{ width: '100%', fontSize: 13 }}>Maybe later</button>
          </div>
        </div>
      )}
    </>
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

  const [activeSetId, setActiveSetId] = useState(null);
  const [setTitle,    setSetTitle]    = useState('Untitled Set');
  const [setSubject,  setSetSubject]  = useState('');
  const [setUnit,     setSetUnit]     = useState('');
  const [questionList, setQuestionList] = useState([]);
  const [activeQIdx,  setActiveQIdx]  = useState(null);
  const [editingQ,    setEditingQ]    = useState(null);
  const [showAI,      setShowAI]      = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [editTitle,   setEditTitle]   = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (editTitle) titleRef.current?.focus();
  }, [editTitle]);

  function selectQuestion(i) {
    setActiveQIdx(i);
    const q = questionList[i];
    setEditingQ({ ...q, tags: Array.isArray(q.tags) ? q.tags.join(', ') : (q.tags || '') });
  }

  function addBlankQuestion(prefill) {
    const newQ = { ...EMPTY_QUESTION, ...prefill, _id: generateId(), options: { A: '', B: '', C: '', D: '', ...(prefill?.options || {}) }, historical_thinking: prefill?.historical_thinking || [] };
    setQuestionList(prev => {
      const next = [...prev, newQ];
      setTimeout(() => { setActiveQIdx(next.length - 1); setEditingQ({ ...newQ, tags: Array.isArray(newQ.tags) ? newQ.tags.join(', ') : (newQ.tags || '') }); }, 0);
      return next;
    });
  }

  function addManyFromAI(qs) {
    const mapped = qs.map(q => ({ ...EMPTY_QUESTION, ...q, _id: generateId(), options: q.options || { A: '', B: '', C: '', D: '' }, historical_thinking: q.historical_thinking || [] }));
    setQuestionList(prev => {
      const next = [...prev, ...mapped];
      const lastIdx = next.length - 1;
      setTimeout(() => { setActiveQIdx(lastIdx); setEditingQ({ ...mapped[mapped.length - 1], tags: '' }); }, 0);
      return next;
    });
  }

  function saveEditingQuestion() {
    if (activeQIdx === null || !editingQ) return;
    const saved = { ...editingQ };
    setQuestionList(prev => { const next = [...prev]; next[activeQIdx] = saved; return next; });
  }

  function deleteQuestion(i) {
    setQuestionList(prev => prev.filter((_, idx) => idx !== i));
    if (activeQIdx === i) { setActiveQIdx(null); setEditingQ(null); }
    else if (activeQIdx > i) setActiveQIdx(a => a - 1);
  }

  async function saveSet() {
    setSaving(true); setSaveError('');
    try {
      const qs = questionList.map(q => ({ ...q, tags: Array.isArray(q.tags) ? q.tags : (q.tags || '').split(',').map(t => t.trim()).filter(Boolean) }));
      const payload = { title: setTitle || 'Untitled', subject: setSubject, unit: setUnit, questions: qs };
      if (activeSetId) {
        await api.put(`/api/questions/sets/${activeSetId}`, payload);
      } else {
        const res = await api.post('/api/questions/sets', payload);
        if (res?.id) setActiveSetId(res.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      setSaveError(e.message || 'Save failed');
    } finally { setSaving(false); }
  }

  const DIFF_COLORS = { 1: '#52B788', 2: '#F5A623', 3: '#E85D4A' };

  return (
    <div style={{ minHeight: '100vh', height: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', fontFamily: 'Nunito, sans-serif', overflow: 'hidden' }}>
      {/* ── Top bar ────────────────────────────────────────────────────────────── */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', height: 56, borderBottom: '1px solid var(--border)', background: 'rgba(15,23,32,0.92)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', flexShrink: 0, gap: 12 }}>
        <button onClick={() => navigate('teacher_dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', transition: 'color 0.15s', flexShrink: 0, fontFamily: 'Nunito, sans-serif' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
          ← Dashboard
        </button>

        {/* Editable title */}
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          {editTitle ? (
            <input ref={titleRef} value={setTitle} onChange={e => setSetTitle(e.target.value)}
              onBlur={() => setEditTitle(false)} onKeyDown={e => { if (e.key === 'Enter') setEditTitle(false); }}
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-gold)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, padding: '5px 14px', outline: 'none', textAlign: 'center', width: '100%', maxWidth: 380 }} />
          ) : (
            <button onClick={() => setEditTitle(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 8, transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,237,230,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span className="cinzel" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', letterSpacing: '0.04em' }}>{setTitle || 'Untitled'}</span>
              <Icon name="edit" size={12} color="var(--text-muted)" />
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <AnimatePresence>
            {saved && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ fontSize: 13, color: '#52B788', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}><Icon name="check" size={13} color="#52B788" /> Saved</motion.span>}
          </AnimatePresence>
          <motion.button onClick={saveSet} disabled={saving} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary" style={{ padding: '8px 20px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            {saving ? <><Spinner /> Saving…</> : 'Save Set'}
          </motion.button>
        </div>
      </nav>

      {/* Error bar */}
      <AnimatePresence>
        {saveError && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            style={{ overflow: 'hidden', background: 'rgba(232,93,74,0.1)', borderBottom: '1px solid rgba(232,93,74,0.3)', flexShrink: 0 }}>
            <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--sunset)', fontWeight: 600 }}>{saveError}</span>
              <button onClick={() => setSaveError('')} style={{ background: 'none', border: 'none', color: 'var(--sunset)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center' }}><Icon name="xCircle" size={14} color="var(--sunset)" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Two-panel body ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '40% 60%', minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT: metadata + list */}
        <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Metadata */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Subject</div>
                <input value={setSubject} onChange={e => setSetSubject(e.target.value)} placeholder="AP World History"
                  style={{ width: '100%', background: 'var(--bg-mid)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 13, padding: '8px 12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>Unit</div>
                <input value={setUnit} onChange={e => setSetUnit(e.target.value)} placeholder="Unit 1"
                  style={{ width: '100%', background: 'var(--bg-mid)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'Nunito, sans-serif', fontSize: 13, padding: '8px 12px', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>

          {/* List header */}
          <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Questions
              <span style={{ background: 'var(--bg-elevated)', borderRadius: 20, padding: '1px 8px', fontSize: 11, color: 'var(--text-muted)', fontWeight: 700 }}>{questionList.length}</span>
            </span>
            <button onClick={() => setShowAI(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(245,166,35,0.08)', border: '1px solid rgba(245,166,35,0.25)', borderRadius: 8, padding: '5px 10px', color: 'var(--gold)', fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Nunito, sans-serif' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,166,35,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(245,166,35,0.08)'}>
              <Icon name="sparkles" size={12} color="var(--gold)" /> AI Generate
            </button>
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <AnimatePresence initial={false}>
              {questionList.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14, fontWeight: 600, lineHeight: 1.7 }}>
                  No questions yet.<br />Add one below or use <Icon name="sparkles" size={12} /> AI.
                </div>
              ) : questionList.map((q, i) => {
                const isActive  = activeQIdx === i;
                const valid     = isValid(q);
                const shortText = q.question?.trim() ? (q.question.length > 65 ? q.question.slice(0, 63) + '…' : q.question) : '(no question text)';
                return (
                  <motion.div key={q._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.18 }}
                    onClick={() => selectQuestion(i)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', background: isActive ? 'rgba(245,166,35,0.07)' : 'transparent', borderLeft: `3px solid ${isActive ? 'var(--gold)' : 'transparent'}`, borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s', minHeight: 46 }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(240,237,230,0.035)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: DIFF_COLORS[q.difficulty] || '#6B7E8F', flexShrink: 0, opacity: valid ? 1 : 0.35 }} />
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, width: 18, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: valid ? 'var(--text-mid)' : 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{shortText}</span>
                    {!valid && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--sunset)', background: 'rgba(232,93,74,0.1)', borderRadius: 6, padding: '2px 7px', flexShrink: 0 }}>draft</span>}
                    <button onClick={e => { e.stopPropagation(); deleteQuestion(i); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 14, padding: '2px 4px', borderRadius: 4, flexShrink: 0, opacity: 0.55, transition: 'color 0.12s, opacity 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--sunset)'; e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.opacity = '0.55'; }}><Icon name="xCircle" size={14} /></button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Add button */}
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <button onClick={() => addBlankQuestion()} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 14 }}>
              <span style={{ fontSize: 18, lineHeight: 1, marginTop: -1 }}>+</span> Add Question
            </button>
          </div>
        </div>

        {/* RIGHT: Editor */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {editingQ && (
            <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Editing Question {activeQIdx !== null ? activeQIdx + 1 : ''} of {questionList.length}</span>
              {!isValid(editingQ) && <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--sunset)', background: 'rgba(232,93,74,0.1)', borderRadius: 8, padding: '3px 10px' }}>Missing required fields</span>}
            </div>
          )}

          {editingQ ? (
            <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
              <motion.div key={activeQIdx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
                <QuestionEditor q={editingQ} onChange={setEditingQ} onSave={saveEditingQuestion} />
              </motion.div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>
              <Icon name="edit" size={40} style={{ opacity: 0.35 }} />
              <p style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.6, margin: 0 }}>Select a question from the list<br />or click "+ Add Question" to begin.</p>
              <button onClick={() => addBlankQuestion()} className="btn-primary">+ Add First Question</button>
            </div>
          )}
        </div>
      </div>

      <AIModal show={showAI} onClose={() => setShowAI(false)} onAdd={q => addBlankQuestion(q)} onAddMany={addManyFromAI} isPro={isPro} />
    </div>
  );
}
