'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../App.jsx';
import api from '../lib/api.js';
import { RUBRICS, calculateUnitGrade } from '../lib/rubrics.js';
import { Vignette, goldText } from '../components/write/fx.jsx';
import { parseSaqPrompt } from '../lib/saqPrompt.js';

// ── Summit Write — teacher workspace: builder · inbox · gradebook ─────────────

const C = {
  bg: '#0F1720', card: '#1E2D40', elevated: '#243548',
  text: '#F0EDE6', mid: '#A8B8C8', muted: '#6B7E8F',
  gold: '#F5A623', pine: '#52B788', pineDark: '#2D6A4F', sunset: '#E85D4A',
  border: 'rgba(240,237,230,0.08)',
};

const input = {
  width: '100%', boxSizing: 'border-box', background: 'rgba(240,237,230,0.05)',
  border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 14px',
  color: C.text, fontSize: 14, fontFamily: 'Nunito, sans-serif', outline: 'none',
};
const label = { fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', color: C.muted, textTransform: 'uppercase', display: 'block', marginBottom: 6 };

const pillBtn = (color) => ({
  background: `${color}14`, border: `1px solid ${color}45`, borderRadius: 8,
  color, fontSize: 11.5, fontWeight: 800, padding: '6px 12px', cursor: 'pointer', flexShrink: 0,
});

// ── Document card editor (with drag-drop image upload → data URL) ────────────
function DocEditor({ doc, index, onChange, onRemove }) {
  const fileRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function readImage(file) {
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 2.5 * 1024 * 1024) { alert('Image too large — keep under 2.5 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => onChange({ ...doc, image_url: reader.result });
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 13, fontWeight: 700, color: C.gold }}>Document {index + 1}</span>
        <button onClick={onRemove} style={{ background: 'none', border: 'none', color: C.sunset, fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>Remove</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10, marginBottom: 10 }}>
        <input style={input} placeholder="Title" value={doc.title || ''} onChange={(e) => onChange({ ...doc, title: e.target.value })} />
        <input style={input} placeholder="Year" type="number" value={doc.year || ''} onChange={(e) => onChange({ ...doc, year: e.target.value })} />
      </div>
      <input style={{ ...input, marginBottom: 10 }} placeholder='Source ("Letter from Kaiser Wilhelm II, 1914")'
        value={doc.source || ''} onChange={(e) => onChange({ ...doc, source: e.target.value })} />
      <textarea style={{ ...input, marginBottom: 10, resize: 'vertical' }} rows={3} placeholder="Document text"
        value={doc.body || ''} onChange={(e) => onChange({ ...doc, body: e.target.value })} />

      {/* image upload */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); readImage(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${dragOver ? C.gold : C.border}`,
          borderRadius: 10, padding: doc.image_url ? 8 : '18px 14px',
          textAlign: 'center', cursor: 'pointer', marginBottom: 10,
          background: dragOver ? `${C.gold}0A` : 'transparent', transition: 'all 0.2s',
        }}>
        {doc.image_url ? (
          <img src={doc.image_url} alt="document" style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 6 }} />
        ) : (
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 700 }}>🖼 Drag an image here or click to upload</span>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => readImage(e.target.files[0])} />
      </div>

      <input style={input} placeholder="HAPP notes (private — context/audience/purpose/POV hints, never shown to students)"
        value={doc.happ_hint || ''} onChange={(e) => onChange({ ...doc, happ_hint: e.target.value })} />
    </div>
  );
}

// ── Assignment builder ────────────────────────────────────────────────────────
function Builder({ classes, onDone }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: '', type: 'DBQ', classId: '', dueDate: '', isUnitTest: false, dbqWeight: 0.6,
    prompt: '', context: '', description: '',
  });
  const [docs, setDocs] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [rubricNotes, setRubricNotes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function generate() {
    if (!form.description.trim() || generating) return;
    setGenerating(true);
    setError(null);
    try {
      const r = await api.post('/api/write/generate-prompt', { description: form.description, type: form.type });
      setForm((f) => ({ ...f, prompt: r.prompt || '', context: r.context || '' }));
      setRubricNotes(r.rubricNotes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  }

  async function publish(asDraft = false) {
    if (saving) return;
    if (!form.title.trim() || !form.prompt.trim()) { setError('Title and prompt are required'); return; }
    if (form.type === 'DBQ' && !asDraft && docs.length < 4) { setError('A DBQ needs at least 4 documents'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.post('/api/write/assignments', {
        title: form.title, type: form.type, prompt: form.prompt, context: form.context,
        classId: form.classId || null, dueDate: form.dueDate || null,
        isUnitTest: form.isUnitTest, dbqWeight: form.dbqWeight,
        published: !asDraft, documents: docs,
      });
      onDone();
    } catch (e) {
      setError(e.message);
      setSaving(false);
    }
  }

  const steps = form.type === 'DBQ' ? ['Setup', 'Prompt', 'Documents', 'Publish'] : ['Setup', 'Prompt', 'Publish'];
  const stepName = steps[step - 1];

  return (
    <div>
      {/* step indicator */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i + 1)} style={{
            flex: 1, padding: '8px 4px', borderRadius: 8, cursor: 'pointer',
            background: step === i + 1 ? `${C.gold}16` : 'transparent',
            border: `1px solid ${step === i + 1 ? C.gold + '50' : C.border}`,
            color: step === i + 1 ? C.gold : C.muted,
            fontSize: 11.5, fontWeight: 800, fontFamily: 'Nunito, sans-serif',
          }}>{i + 1}. {s}</button>
        ))}
      </div>

      {stepName === 'Setup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <span style={label}>Assignment title</span>
            <input style={input} placeholder="DBQ — Causes of the First World War" value={form.title} onChange={(e) => set('title', e.target.value)} />
          </div>
          <div>
            <span style={label}>Type</span>
            <div style={{ display: 'flex', gap: 8 }}>
              {['SAQ', 'LEQ', 'DBQ'].map((t) => (
                <button key={t} onClick={() => set('type', t)} style={{
                  flex: 1, padding: '10px', borderRadius: 10, cursor: 'pointer',
                  background: form.type === t ? `${C.pine}18` : 'rgba(240,237,230,0.04)',
                  border: `1px solid ${form.type === t ? C.pine : C.border}`,
                  color: form.type === t ? C.pine : C.mid, fontWeight: 800, fontSize: 13,
                }}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <span style={label}>Class</span>
              <select style={input} value={form.classId} onChange={(e) => set('classId', e.target.value)}>
                <option value="">All my students</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <span style={label}>Due date</span>
              <input style={input} type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
            </div>
          </div>
          <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isUnitTest} onChange={(e) => set('isUnitTest', e.target.checked)} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Count toward unit grade</span>
            </label>
            {form.isUnitTest && (
              <div style={{ marginTop: 12 }}>
                <span style={{ ...label, marginBottom: 8 }}>Essay weight: {Math.round(form.dbqWeight * 100)}% · MCQ weight: {Math.round((1 - form.dbqWeight) * 100)}%</span>
                <input type="range" min="0.1" max="0.9" step="0.05" value={form.dbqWeight}
                  onChange={(e) => set('dbqWeight', parseFloat(e.target.value))} style={{ width: '100%' }} />
                <div style={{ fontSize: 11.5, color: C.muted, marginTop: 6 }}>
                  Unit grade = essay% × {form.dbqWeight.toFixed(2)} + MCQ% × {(1 - form.dbqWeight).toFixed(2)}
                </div>
              </div>
            )}
          </div>
          <button onClick={() => setStep(2)} style={{
            padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, #8B6914, ${C.gold})`, color: '#1C1208', fontWeight: 800, fontSize: 14,
          }}>Next: write the prompt →</button>
        </div>
      )}

      {stepName === 'Prompt' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: C.elevated, borderRadius: 12, padding: '16px' }}>
            <span style={label}>Describe your assignment in plain language</span>
            <textarea style={{ ...input, resize: 'vertical' }} rows={3}
              placeholder="DBQ on causes of WWI using 7 documents. Students should argue which factor was most significant."
              value={form.description} onChange={(e) => set('description', e.target.value)} />
            <button onClick={generate} disabled={generating || !form.description.trim()} style={{
              marginTop: 10, padding: '11px 20px', borderRadius: 10, border: 'none',
              cursor: generating ? 'wait' : 'pointer', opacity: !form.description.trim() ? 0.5 : 1,
              background: `linear-gradient(135deg, ${C.pineDark}, ${C.pine})`, color: '#fff', fontWeight: 800, fontSize: 13,
            }}>{generating ? 'Generating…' : '✨ Generate Prompt with AI →'}</button>
          </div>
          <div>
            <span style={label}>Prompt (shown to students — edit freely)</span>
            <textarea style={{ ...input, resize: 'vertical' }} rows={4} value={form.prompt} onChange={(e) => set('prompt', e.target.value)} />
          </div>
          <div>
            <span style={label}>Background context (optional)</span>
            <textarea style={{ ...input, resize: 'vertical' }} rows={3} value={form.context} onChange={(e) => set('context', e.target.value)} />
          </div>
          {rubricNotes.length > 0 && (
            <div style={{ background: `${C.pine}0C`, border: `1px solid ${C.pine}30`, borderRadius: 12, padding: '14px 16px' }}>
              <span style={{ ...label, color: C.pine }}>What earns points on this prompt</span>
              {rubricNotes.map((n, i) => (
                <div key={i} style={{ fontSize: 12.5, color: C.text, lineHeight: 1.6, marginTop: 4 }}>• {n}</div>
              ))}
            </div>
          )}
          <button onClick={() => setStep(step + 1)} style={{
            padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, #8B6914, ${C.gold})`, color: '#1C1208', fontWeight: 800, fontSize: 14,
          }}>Next →</button>
        </div>
      )}

      {stepName === 'Documents' && (
        <div>
          <p style={{ fontSize: 12.5, color: C.muted, margin: '0 0 14px', lineHeight: 1.6 }}>
            A DBQ needs 4–7 documents. Add text, images, or both.
          </p>
          {docs.map((d, i) => (
            <DocEditor key={i} doc={d} index={i}
              onChange={(nd) => setDocs(docs.map((x, j) => j === i ? nd : x))}
              onRemove={() => setDocs(docs.filter((_, j) => j !== i))} />
          ))}
          {docs.length < 7 && (
            <button onClick={() => setDocs([...docs, {}])} style={{
              width: '100%', padding: '14px', borderRadius: 12, cursor: 'pointer',
              background: 'transparent', border: `2px dashed ${C.border}`,
              color: C.mid, fontWeight: 800, fontSize: 13, marginBottom: 14,
            }}>+ Add Document ({docs.length}/7)</button>
          )}
          <button onClick={() => setStep(4)} style={{
            width: '100%', padding: '13px', borderRadius: 10, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, #8B6914, ${C.gold})`, color: '#1C1208', fontWeight: 800, fontSize: 14,
          }}>Next: review →</button>
        </div>
      )}

      {stepName === 'Publish' && (
        <div>
          {/* student-eye preview */}
          <div style={{ background: '#F5E6C8', borderRadius: 10, padding: '22px 24px', marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', color: '#8A6E42', textTransform: 'uppercase', marginBottom: 8 }}>
              Student preview · {form.type} · {RUBRICS[form.type]?.maxScore} points
            </div>
            <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: '#1A0F08', marginBottom: 8 }}>{form.title || 'Untitled'}</div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 14, lineHeight: 1.7, color: '#1A0F08', margin: 0 }}>{form.prompt || '(no prompt yet)'}</p>
            {form.context && <p style={{ fontSize: 12.5, fontStyle: 'italic', color: '#5A4326', lineHeight: 1.65, margin: '10px 0 0' }}>{form.context}</p>}
            {form.type === 'DBQ' && (
              <div style={{ fontSize: 12, color: '#5A4326', fontWeight: 700, marginTop: 12 }}>📜 {docs.length} documents attached</div>
            )}
          </div>
          {/* rubric summary */}
          <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
            <span style={label}>Points available</span>
            {Object.entries(RUBRICS[form.type]?.criteria || {}).map(([k, c]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: C.text, padding: '3px 0' }}>
                <span>{c.label}</span><span style={{ color: C.gold, fontWeight: 800 }}>{c.points}pt</span>
              </div>
            ))}
          </div>
          {error && <div style={{ color: C.sunset, fontSize: 13, fontWeight: 700, marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => publish(true)} disabled={saving} style={{
              flex: 1, padding: '13px', borderRadius: 10, cursor: 'pointer',
              background: 'rgba(240,237,230,0.06)', border: `1px solid ${C.border}`,
              color: C.mid, fontWeight: 800, fontSize: 13.5,
            }}>Save draft</button>
            <button onClick={() => publish(false)} disabled={saving} style={{
              flex: 2, padding: '13px', borderRadius: 10, border: 'none', cursor: saving ? 'wait' : 'pointer',
              background: `linear-gradient(135deg, ${C.pineDark}, ${C.pine})`, color: '#fff', fontWeight: 800, fontSize: 14,
            }}>{saving ? 'Publishing…' : '🚀 Publish to class'}</button>
          </div>
        </div>
      )}
      {error && stepName !== 'Publish' && <div style={{ color: C.sunset, fontSize: 13, fontWeight: 700, marginTop: 12 }}>{error}</div>}
    </div>
  );
}

// ── Submission detail modal (teacher) ─────────────────────────────────────────
function SubmissionDetail({ id, onClose, onSaved }) {
  const [data, setData] = useState(null);
  const [score, setScore] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/api/write/submissions/${id}`).then((d) => {
      setData(d);
      setScore(d.submission.teacher_score ?? '');
      setNote(d.submission.teacher_note ?? '');
    }).catch(() => {});
  }, [id]);

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/api/write/submissions/${id}`, {
        teacherScore: score === '' ? null : parseInt(score, 10),
        teacherNote: note || null,
      });
      onSaved();
      onClose();
    } catch (_) {
      setSaving(false);
    }
  }

  const sub = data?.submission;
  const g = sub?.grading_json || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(6,8,12,0.85)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
      <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
          width: '100%', maxWidth: 760, maxHeight: '90vh', overflowY: 'auto', padding: '24px 24px',
        }}>
        {!sub ? <div style={{ color: C.muted, fontSize: 13 }}>Loading…</div> : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
              <div>
                <div style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: C.gold }}>{sub.student_name}</div>
                <div style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                  {sub.assignment_title} · Attempt {sub.attempt_number} · AI: {sub.ai_score}/{sub.max_score}
                </div>
              </div>
              <button onClick={onClose} style={{
                background: 'rgba(240,237,230,0.07)', border: 'none', borderRadius: 8, cursor: 'pointer',
                color: C.mid, fontSize: 13, fontWeight: 800, padding: '5px 12px',
              }}>✕</button>
            </div>

            {/* breakdown chips */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {Object.entries(g.breakdown || {}).map(([k, b]) => (
                <span key={k} title={b.feedback} style={{
                  fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 8,
                  background: b.earned ? `${C.pine}16` : `${C.sunset}14`,
                  border: `1px solid ${b.earned ? C.pine + '45' : C.sunset + '40'}`,
                  color: b.earned ? C.pine : C.sunset,
                }}>{b.earned ? '✓' : '✗'} {k.replace(/_/g, ' ')} {b.points}/{b.maxPoints}</span>
              ))}
            </div>

            {/* essay */}
            <div style={{
              background: '#F5E6C8', borderRadius: 8, padding: '18px 20px', marginBottom: 16,
              fontSize: 14, lineHeight: 1.8, color: '#1A0F08', whiteSpace: 'pre-wrap', maxHeight: 320, overflowY: 'auto',
            }}>{sub.essay_text}</div>

            {/* override */}
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, marginBottom: 14 }}>
              <div>
                <span style={label}>Override score</span>
                <input style={input} type="number" min="0" max={sub.max_score} placeholder={`AI: ${sub.ai_score}`}
                  value={score} onChange={(e) => setScore(e.target.value)} />
              </div>
              <div>
                <span style={label}>Note to student</span>
                <input style={input} placeholder="Optional feedback shown on their results screen"
                  value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
            <button onClick={save} disabled={saving} style={{
              width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: `linear-gradient(135deg, #8B6914, ${C.gold})`, color: '#1C1208', fontWeight: 800, fontSize: 14,
            }}>{saving ? 'Saving…' : 'Save'}</button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── Edit assignment modal (teacher) ───────────────────────────────────────────
function EditAssignmentModal({ assignment, onClose, onSaved }) {
  const [title, setTitle] = useState(assignment.title || '');
  const [prompt, setPrompt] = useState(assignment.prompt || '');
  const [context, setContext] = useState(assignment.context || '');
  const [dueDate, setDueDate] = useState(assignment.due_date ? assignment.due_date.slice(0, 10) : '');
  const [isUnitTest, setIsUnitTest] = useState(!!assignment.is_unit_test);
  const [dbqWeight, setDbqWeight] = useState(assignment.dbq_weight != null ? parseFloat(assignment.dbq_weight) : 0.6);
  const [guidedWalkEnabled, setGuidedWalkEnabled] = useState(assignment.guided_walk_enabled !== false);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await api.patch(`/api/write/assignments/${assignment.id}`, {
        title, prompt, context, dueDate: dueDate || null, isUnitTest, dbqWeight, guidedWalkEnabled,
      });
      onSaved();
      onClose();
    } catch (_) {
      setSaving(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(6,8,12,0.85)', backdropFilter: 'blur(5px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
      <motion.div initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.card, border: `1px solid ${C.border}`, borderRadius: 18,
          width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', padding: '24px 24px',
          display: 'flex', flexDirection: 'column', gap: 14,
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: 'Cinzel, serif', fontSize: 16, fontWeight: 700, color: C.gold }}>Edit Assignment</span>
          <button onClick={onClose} style={{
            background: 'rgba(240,237,230,0.07)', border: 'none', borderRadius: 8, cursor: 'pointer',
            color: C.mid, fontSize: 13, fontWeight: 800, padding: '5px 12px',
          }}>✕</button>
        </div>

        <div>
          <span style={label}>Title</span>
          <input style={input} value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <span style={label}>Prompt (shown to students)</span>
          <textarea style={{ ...input, resize: 'vertical' }} rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        </div>
        <div>
          <span style={label}>Background context (optional)</span>
          <textarea style={{ ...input, resize: 'vertical' }} rows={3} value={context} onChange={(e) => setContext(e.target.value)} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <span style={label}>Due date</span>
            <input style={input} type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
        <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={isUnitTest} onChange={(e) => setIsUnitTest(e.target.checked)} />
            <span style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>Count toward unit grade</span>
          </label>
          {isUnitTest && (
            <div style={{ marginTop: 12 }}>
              <span style={{ ...label, marginBottom: 8 }}>Essay weight: {Math.round(dbqWeight * 100)}% · MCQ weight: {Math.round((1 - dbqWeight) * 100)}%</span>
              <input type="range" min="0.1" max="0.9" step="0.05" value={dbqWeight}
                onChange={(e) => setDbqWeight(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
          )}
        </div>
        {assignment.type === 'SAQ' && (
          <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={guidedWalkEnabled} onChange={(e) => setGuidedWalkEnabled(e.target.checked)} />
              <span style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>🦉 Enable Guided Walk ("The Art of Three")</span>
            </label>
            <div style={{ fontSize: 12, color: C.mid, marginTop: 6, marginLeft: 28 }}>
              Lets students work through this SAQ step-by-step with Clio. Requires the Part A / B / C prompt format.
            </div>
          </div>
        )}
        <button onClick={save} disabled={saving || !title.trim() || !prompt.trim()} style={{
          width: '100%', padding: '12px', borderRadius: 10, border: 'none', cursor: 'pointer',
          background: `linear-gradient(135deg, #8B6914, ${C.gold})`, color: '#1C1208', fontWeight: 800, fontSize: 14,
          opacity: saving || !title.trim() || !prompt.trim() ? 0.6 : 1,
        }}>{saving ? 'Saving…' : 'Save changes'}</button>
      </motion.div>
    </motion.div>
  );
}

// ── Gradebook tab ─────────────────────────────────────────────────────────────
function Gradebook({ assignments }) {
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [mcqEdit, setMcqEdit] = useState({});

  const gradableAssignments = assignments.slice().sort((a, b) => (b.is_unit_test ? 1 : 0) - (a.is_unit_test ? 1 : 0));

  function load(id) {
    setSelected(id);
    setData(null);
    setAnalytics(null);
    if (!id) return;
    api.get(`/api/write/gradebook/${id}`).then(setData).catch(() => {});
    api.get(`/api/write/analytics/${id}`).then(setAnalytics).catch(() => {});
  }

  async function saveMcq(studentId) {
    const val = parseFloat(mcqEdit[studentId]);
    if (isNaN(val)) return;
    await api.post('/api/write/mcq', { assignmentId: selected, studentId, score: val });
    load(selected);
  }

  function exportCsv() {
    if (!data) return;
    const a = data.assignment;
    const rows = [['Student', 'Essay Score', 'Essay %', 'MCQ %', a.is_unit_test ? 'Unit Grade' : 'Grade']];
    for (const s of data.students) {
      rows.push([
        s.student_name,
        s.essay_score ?? '',
        s.essay_pct ?? '',
        s.mcq_score ?? '',
        a.is_unit_test ? (s.unit_grade ?? '') : (s.essay_pct ?? ''),
      ]);
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${a.title.replace(/[^a-z0-9]/gi, '_')}_grades.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const gradeColor = (g) => g == null ? C.muted : g >= 90 ? C.pine : g >= 70 ? '#E8A53A' : C.sunset;

  return (
    <div>
      <select style={{ ...input, marginBottom: 16 }} value={selected} onChange={(e) => load(e.target.value)}>
        <option value="">Select an assignment…</option>
        {gradableAssignments.map((a) => <option key={a.id} value={a.id}>{a.title} ({a.type}{a.is_unit_test ? ' · unit test' : ''})</option>)}
      </select>

      {data && (
        <>
          {/* reteach flags */}
          {analytics?.flags?.length > 0 && (
            <div style={{ background: `${C.sunset}0E`, border: `1px solid ${C.sunset}35`, borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <span style={{ ...label, color: C.sunset }}>🚩 Reteach flags</span>
              {analytics.flags.map((f, i) => (
                <div key={i} style={{ fontSize: 13, color: C.text, lineHeight: 1.6, marginTop: 4 }}>• {f.message}</div>
              ))}
            </div>
          )}

          {/* rubric heatmap */}
          {analytics?.heatmap?.length > 0 && (
            <div style={{ background: C.elevated, borderRadius: 12, padding: '14px 16px', marginBottom: 14, overflowX: 'auto' }}>
              <span style={label}>Rubric heatmap</span>
              <table style={{ borderCollapse: 'collapse', fontSize: 11, width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', color: C.muted, padding: '4px 8px 4px 0', fontWeight: 800 }}>Student</th>
                    {analytics.criteria.map((c) => (
                      <th key={c} style={{ color: C.muted, padding: '4px 4px', fontWeight: 800, fontSize: 9.5, textTransform: 'capitalize' }}>
                        {c.replace(/_/g, ' ').slice(0, 10)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analytics.heatmap.map((row, i) => (
                    <tr key={i}>
                      <td style={{ color: C.text, fontWeight: 700, padding: '3px 8px 3px 0', whiteSpace: 'nowrap' }}>{row.student_name}</td>
                      {row.cells.map((cell, j) => (
                        <td key={j} style={{ padding: 3, textAlign: 'center' }}>
                          <div style={{
                            width: 22, height: 16, borderRadius: 4, margin: '0 auto',
                            background: cell.earned ? C.pineDark : `${C.sunset}70`,
                          }} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* grade table */}
          <div style={{ background: C.elevated, borderRadius: 12, overflow: 'hidden', marginBottom: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ textAlign: 'left', padding: '10px 14px', color: C.muted, fontWeight: 800, fontSize: 11 }}>STUDENT</th>
                  <th style={{ padding: '10px 8px', color: C.muted, fontWeight: 800, fontSize: 11 }}>ESSAY</th>
                  {data.assignment.is_unit_test && <th style={{ padding: '10px 8px', color: C.muted, fontWeight: 800, fontSize: 11 }}>MCQ %</th>}
                  <th style={{ padding: '10px 14px', color: C.muted, fontWeight: 800, fontSize: 11 }}>{data.assignment.is_unit_test ? 'UNIT' : '%'}</th>
                </tr>
              </thead>
              <tbody>
                {data.students.map((s) => (
                  <tr key={s.student_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '10px 14px', color: C.text, fontWeight: 700 }}>{s.student_name}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'center', color: C.text }}>
                      {s.essay_score != null ? `${s.essay_score}/${s.best_submission?.max_score}` : '—'}
                    </td>
                    {data.assignment.is_unit_test && (
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <input
                          style={{ ...input, width: 64, padding: '6px 8px', textAlign: 'center', fontSize: 12 }}
                          type="number" min="0" max="100"
                          placeholder={s.mcq_score != null ? String(s.mcq_score) : '—'}
                          value={mcqEdit[s.student_id] ?? ''}
                          onChange={(e) => setMcqEdit({ ...mcqEdit, [s.student_id]: e.target.value })}
                          onBlur={() => saveMcq(s.student_id)}
                          onKeyDown={(e) => e.key === 'Enter' && saveMcq(s.student_id)}
                        />
                      </td>
                    )}
                    <td style={{
                      padding: '10px 14px', textAlign: 'center', fontWeight: 800,
                      color: gradeColor(data.assignment.is_unit_test ? s.unit_grade : s.essay_pct),
                    }}>
                      {data.assignment.is_unit_test ? (s.unit_grade ?? '—') : (s.essay_pct != null ? `${s.essay_pct}%` : '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={exportCsv} style={{
            padding: '11px 20px', borderRadius: 10, border: `1px solid ${C.gold}45`, cursor: 'pointer',
            background: `${C.gold}10`, color: C.gold, fontWeight: 800, fontSize: 13,
          }}>⬇ Export Gradebook CSV</button>
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function WriteTeacher() {
  const { navigate } = useApp();
  const [tab, setTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [classes, setClasses] = useState([]);
  const [building, setBuilding] = useState(false);
  const [detail, setDetail] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const load = () => {
    api.get('/api/write/assignments').then((d) => setAssignments(d.assignments || [])).catch(() => {});
    api.get('/api/write/inbox').then((d) => setInbox(d.submissions || [])).catch(() => {});
    api.get('/api/classes').then((d) => setClasses(d.classes || [])).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const TABS = [
    { key: 'assignments', label: '📝 Assignments' },
    { key: 'inbox', label: `📥 Inbox${inbox.length ? ` (${inbox.length})` : ''}` },
    { key: 'gradebook', label: '📊 Gradebook' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% -10%, #1A2940 0%, #0F1720 55%, #0A1018 100%)',
      fontFamily: 'Nunito, sans-serif', position: 'relative',
    }}>
      <Vignette strength={0.45} />
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px',
        background: 'linear-gradient(180deg, rgba(10,16,24,0.95), rgba(15,23,32,0.88))', backdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(245,166,35,0.18)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}>
        <button onClick={() => navigate('teacher_dashboard')} style={{
          background: 'none', border: 'none', cursor: 'pointer', color: C.muted, fontSize: 13, fontWeight: 700,
        }}>← Dashboard</button>
        <span style={{ fontFamily: 'Cinzel, serif', fontSize: 'clamp(11px, 3.2vw, 15px)', fontWeight: 800, letterSpacing: '0.12em', textAlign: 'center', ...goldText }}>
          🏔 SUMMIT WRITE · EXPEDITION COMMAND
        </span>
        <div style={{ width: 70 }} />
      </nav>

      <main style={{ maxWidth: 760, margin: '0 auto', padding: '22px 16px 80px', position: 'relative', zIndex: 3 }}>
        {/* tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
          {TABS.map((t) => (
            <motion.button key={t.key} onClick={() => { setTab(t.key); setBuilding(false); }}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
              style={{
                flex: 1, padding: '12px 8px', borderRadius: 10, cursor: 'pointer',
                background: tab === t.key
                  ? `linear-gradient(165deg, ${C.gold}22, rgba(22,33,48,0.9))`
                  : 'linear-gradient(165deg, rgba(36,53,72,0.5), rgba(22,33,48,0.7))',
                border: `1px solid ${tab === t.key ? C.gold + '60' : C.border}`,
                color: tab === t.key ? C.gold : C.muted, fontWeight: 800, fontSize: 12.5,
                boxShadow: tab === t.key
                  ? `0 0 18px ${C.gold}25, inset 0 1px 0 rgba(255,255,255,0.08)`
                  : 'inset 0 1px 0 rgba(255,255,255,0.04)',
                textShadow: tab === t.key ? `0 0 12px ${C.gold}50` : 'none',
              }}>{t.label}</motion.button>
          ))}
        </div>

        {tab === 'assignments' && (
          building ? (
            <div>
              <button onClick={() => setBuilding(false)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: C.muted,
                fontSize: 13, fontWeight: 700, marginBottom: 14, padding: 0,
              }}>← Cancel</button>
              <Builder classes={classes} onDone={() => { setBuilding(false); load(); }} />
            </div>
          ) : (
            <div>
              <motion.button onClick={() => setBuilding(true)}
                whileHover={{ scale: 1.015, boxShadow: `0 0 30px ${C.gold}50, 0 10px 26px rgba(0,0,0,0.5)` }}
                whileTap={{ scale: 0.985 }}
                style={{
                  width: '100%', padding: '16px', borderRadius: 12, cursor: 'pointer',
                  background: `linear-gradient(180deg, #FFD75E 0%, ${C.gold} 45%, #C8851A 100%)`,
                  border: '1px solid rgba(255,233,184,0.55)', color: '#1C1208',
                  fontWeight: 900, fontSize: 14.5, marginBottom: 18, letterSpacing: '0.05em', textTransform: 'uppercase',
                  boxShadow: `0 6px 22px ${C.gold}40, inset 0 1px 0 rgba(255,255,255,0.5)`,
                }}>⚒ Forge New Assignment</motion.button>
              <button onClick={() => navigate('throwdown_host')} style={{
                width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
                background: 'transparent', border: `1.5px solid ${C.gold}50`, color: C.gold,
                fontWeight: 800, fontSize: 13, marginBottom: 10, letterSpacing: '0.04em',
              }}>⚔ Launch Thesis Throwdown</button>
              <button onClick={() => navigate('tribunal_host')} style={{
                width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
                background: 'transparent', border: `1.5px solid ${C.gold}50`, color: C.gold,
                fontWeight: 800, fontSize: 13, marginBottom: 10, letterSpacing: '0.04em',
              }}>⚖ Launch The Tribunal</button>
              <button onClick={() => navigate('relay_host')} style={{
                width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
                background: 'transparent', border: `1.5px solid ${C.gold}50`, color: C.gold,
                fontWeight: 800, fontSize: 13, marginBottom: 10, letterSpacing: '0.04em',
              }}>🏃 Launch The Relay</button>
              <button onClick={() => navigate('auction_host')} style={{
                width: '100%', padding: '13px', borderRadius: 12, cursor: 'pointer',
                background: 'transparent', border: `1.5px solid ${C.gold}50`, color: C.gold,
                fontWeight: 800, fontSize: 13, marginBottom: 18, letterSpacing: '0.04em',
              }}>🪙 Launch Evidence Auction</button>
              {assignments.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted, fontSize: 13 }}>
                  No assignments yet. Create your first one — it takes about 2 minutes.
                </div>
              ) : assignments.map((a) => (
                <div key={a.id} style={{
                  background: 'linear-gradient(165deg, rgba(36,53,72,0.85), rgba(22,33,48,0.95))',
                  border: `1px solid ${C.border}`, borderRadius: 12,
                  padding: '14px 16px', marginBottom: 10,
                  display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 22px rgba(0,0,0,0.35)',
                }}>
                  <span style={{
                    fontFamily: 'Cinzel, serif', fontSize: 11.5, fontWeight: 800, color: C.gold,
                    background: `radial-gradient(circle at 35% 30%, ${C.gold}30, rgba(10,16,24,0.85) 80%)`,
                    border: `1px solid ${C.gold}55`,
                    borderRadius: 8, padding: '6px 10px', flexShrink: 0,
                    textShadow: `0 0 10px ${C.gold}70`,
                    boxShadow: `0 0 12px ${C.gold}20`,
                  }}>{a.type}</span>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>{a.title}</div>
                    <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
                      {a.class_name || 'All students'} · {a.submission_count} submissions
                      {a.is_unit_test && ' · unit test'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end', marginLeft: 'auto' }}>
                    {!a.published ? (
                      <button onClick={async () => { await api.patch(`/api/write/assignments/${a.id}`, { published: true }); load(); }}
                        style={pillBtn(C.pine)}>Publish</button>
                    ) : (
                      <>
                        <span style={{ fontSize: 11, color: C.pine, fontWeight: 800, flexShrink: 0 }}>● Live</span>
                        <button onClick={async () => { await api.patch(`/api/write/assignments/${a.id}`, { published: false }); load(); }}
                          style={pillBtn(C.muted)}>Unpublish</button>
                      </>
                    )}
                    <button onClick={() => setEditing(a)} style={pillBtn(C.gold)}>Edit</button>
                    <button onClick={() => navigate('writing_room', { assignmentId: a.id, previewMode: true })}
                      style={pillBtn(C.mid)}>Preview</button>
                    {a.type === 'SAQ' && a.guided_walk_enabled !== false && !!parseSaqPrompt(a.prompt) && (
                      <button onClick={() => navigate('guided_walk_saq', { assignmentId: a.id, previewMode: true })}
                        style={pillBtn(C.gold)}>🦉 Walk Preview</button>
                    )}
                    {a.submission_count === 0 && (
                      confirmDelete === a.id ? (
                        <>
                          <button onClick={async () => { await api.delete(`/api/write/assignments/${a.id}`); setConfirmDelete(null); load(); }}
                            style={pillBtn(C.sunset)}>Confirm?</button>
                          <button onClick={() => setConfirmDelete(null)} style={pillBtn(C.muted)}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDelete(a.id)} style={pillBtn(C.sunset)}>Delete</button>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {tab === 'inbox' && (
          inbox.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: C.muted, fontSize: 13 }}>
              No submissions yet. They'll appear here the moment a student submits.
            </div>
          ) : (
            <div style={{ background: C.card, borderRadius: 12, overflow: 'hidden' }}>
              {inbox.map((s, i) => {
                const pct = s.max_score ? (s.teacher_score ?? s.ai_score) / s.max_score : 0;
                const color = pct >= 0.8 ? C.gold : pct >= 0.5 ? C.pine : C.sunset;
                return (
                  <button key={s.id} onClick={() => setDetail(s.id)} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                    padding: '13px 16px',
                    borderBottom: i < inbox.length - 1 ? `1px solid ${C.border}` : 'none',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>{s.student_name}</div>
                      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
                        {s.assignment_title} · {s.assignment_type} · attempt {s.attempt_number} · {new Date(s.submitted_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    </div>
                    {s.teacher_score != null && <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>overridden</span>}
                    <span style={{ fontFamily: 'Cinzel, serif', fontSize: 15, fontWeight: 700, color, flexShrink: 0 }}>
                      {s.teacher_score ?? s.ai_score}/{s.max_score}
                    </span>
                  </button>
                );
              })}
            </div>
          )
        )}

        {tab === 'gradebook' && <Gradebook assignments={assignments} />}
      </main>

      <AnimatePresence>
        {detail && <SubmissionDetail id={detail} onClose={() => setDetail(null)} onSaved={load} />}
        {editing && <EditAssignmentModal assignment={editing} onClose={() => setEditing(null)} onSaved={load} />}
      </AnimatePresence>
    </div>
  );
}
