'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GW } from '../../lib/guidedWalkTheme.js';
import { GwButton } from './gwShared.jsx';

// ── Writing Courses — shared visual explainers & activity runners ────────────
// Content-driven: every lesson supplies a `visual` config and `activity`/
// `exitCheck` configs (see server/services/course-content.js). These
// components render whatever `type` they're given.

const cardStyle = {
  background: `${GW.parchmentDark}`,
  border: `1px solid ${GW.amber}30`,
  borderRadius: 12,
  padding: '14px 16px',
};

function Label({ children, color = GW.amber }) {
  return (
    <div style={{
      fontFamily: 'Cinzel, serif', fontWeight: 800, letterSpacing: '0.12em',
      fontSize: 11, color, textTransform: 'uppercase', marginBottom: 6,
    }}>{children}</div>
  );
}

// ── Visual explainers ─────────────────────────────────────────────────────────

function TwoColumnVisual({ visual }) {
  const cols = [visual.left, visual.right];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {cols.map((col, i) => (
        <div key={i} style={{ ...cardStyle, borderColor: i === 0 ? `${GW.blue}40` : `${GW.amber}40` }}>
          <div style={{ fontSize: 26, marginBottom: 6 }}>{col.icon}</div>
          <Label color={i === 0 ? GW.blue : GW.amber}>{col.label}</Label>
          <div style={{ fontSize: 13, color: GW.ink, opacity: 0.8, marginBottom: 10 }}>{col.tagline}</div>
          <div style={{ fontSize: 13, color: GW.ink, fontStyle: 'italic', lineHeight: 1.5 }}>"{col.example}"</div>
        </div>
      ))}
    </div>
  );
}

function ClaimDissectionVisual({ visual }) {
  const { example, parts } = visual;
  // Render the example text with each labeled span underlined in its color.
  const segments = [];
  const matches = [];
  for (const part of parts) {
    const idx = example.indexOf(part.span);
    if (idx === -1) continue;
    matches.push({ ...part, start: idx, end: idx + part.span.length });
  }
  matches.sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const m of matches) {
    if (m.start > cursor) segments.push({ text: example.slice(cursor, m.start) });
    segments.push({ text: example.slice(m.start, m.end), color: m.color });
    cursor = m.end;
  }
  if (cursor < example.length) segments.push({ text: example.slice(cursor) });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ ...cardStyle, fontSize: 14.5, lineHeight: 1.7, fontStyle: 'italic' }}>
        {segments.map((seg, i) => seg.color ? (
          <span key={i} style={{ borderBottom: `3px solid ${seg.color}`, color: GW.ink, fontWeight: 700 }}>{seg.text}</span>
        ) : <span key={i}>{seg.text}</span>)}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {parts.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: GW.ink,
            background: `${p.color}22`, border: `1px solid ${p.color}55`, borderRadius: 8, padding: '4px 10px',
          }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: p.color, display: 'inline-block' }} />
            {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompareVisual({ visual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...cardStyle, borderColor: `${GW.rose}40` }}>
        <Label color={GW.rose}>{visual.weakLabel || 'Weak'}</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, fontStyle: 'italic', lineHeight: 1.5 }}>"{visual.weak}"</div>
      </div>
      <div style={{ ...cardStyle, borderColor: `${GW.sage}40` }}>
        <Label color={GW.sage}>{visual.strongLabel || 'Strong'}</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, fontStyle: 'italic', lineHeight: 1.5 }}>"{visual.strong}"</div>
      </div>
    </div>
  );
}

function BridgeVisual({ visual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: 12, width: '100%' }}>
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', borderColor: `${GW.amber}40` }}>
          <Label>{visual.claimTower || 'Claim'}</Label>
        </div>
        <div style={{ ...cardStyle, flex: 1, textAlign: 'center', borderColor: `${GW.blue}40` }}>
          <Label color={GW.blue}>{visual.evidenceTower || 'Evidence'}</Label>
        </div>
      </div>
      <div style={{ width: '70%', height: 3, background: `${GW.sage}80`, borderRadius: 2 }} />
      <div style={{ fontSize: 13, color: GW.inkSoft, textAlign: 'center', lineHeight: 1.5 }}>{visual.explainer}</div>
    </div>
  );
}

function ThesisTemplateVisual({ visual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...cardStyle, textAlign: 'center', fontSize: 15, fontWeight: 800, color: GW.amber, fontFamily: 'Cinzel, serif' }}>
        {visual.template}
      </div>
      <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{visual.tip}</div>
    </div>
  );
}

function FlipCardVisual({ visual }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <motion.div
        onClick={() => setFlipped((f) => !f)}
        whileTap={{ scale: 0.98 }}
        style={{ ...cardStyle, cursor: 'pointer', minHeight: 90, borderColor: flipped ? `${GW.sage}50` : `${GW.rose}50` }}>
        <Label color={flipped ? GW.sage : GW.rose}>{flipped ? (visual.backLabel || 'Revised') : (visual.frontLabel || 'Original')}</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.6, fontStyle: 'italic' }}>"{flipped ? visual.back : visual.front}"</div>
      </motion.div>
      <div style={{ fontSize: 12, color: GW.inkSoft, textAlign: 'center' }}>Tap the card to flip</div>
      {flipped && visual.corrected && (
        <div style={{ ...cardStyle, borderColor: `${GW.amber}40` }}>
          <Label>Stronger version</Label>
          <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.6, fontStyle: 'italic' }}>"{visual.corrected}"</div>
        </div>
      )}
    </div>
  );
}

function PeelVisual({ visual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {visual.steps.map((s, i) => (
        <div key={s.key} style={{ ...cardStyle, display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            background: GW.amber, color: GW.parchment, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontFamily: 'Cinzel, serif', fontSize: 14,
          }}>{i + 1}</div>
          <div>
            <div style={{ fontWeight: 800, color: GW.ink, fontSize: 13.5 }}>{s.label}</div>
            <div style={{ fontSize: 12.5, color: GW.inkSoft }}>{s.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PathwayCardsVisual({ visual }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
      {visual.pathways.map((p) => (
        <div key={p.key} style={{ ...cardStyle, borderColor: `${GW.sage}40` }}>
          <Label color={GW.sage}>{p.label}</Label>
          <div style={{ fontSize: 12.5, color: GW.ink, marginBottom: 6 }}>{p.desc}</div>
          <div style={{ fontSize: 12, color: GW.inkSoft, fontStyle: 'italic' }}>"{p.example}"</div>
        </div>
      ))}
    </div>
  );
}

function HappLabelsVisual({ visual }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ ...cardStyle }}>
        <Label>{visual.document.title}</Label>
        <div style={{ fontSize: 13, color: GW.inkSoft, fontStyle: 'italic' }}>{visual.document.source}</div>
      </div>
      {visual.labels.map((l) => (
        <div key={l.key} style={{ ...cardStyle, display: 'flex', gap: 10, alignItems: 'flex-start', borderColor: `${GW.amber}40` }}>
          <div style={{ flex: '0 0 auto', minWidth: 80, fontWeight: 800, fontSize: 12, color: GW.amber, fontFamily: 'Cinzel, serif', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{l.label}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, color: GW.ink, fontWeight: 700, marginBottom: 2 }}>"{l.text}"</div>
            <div style={{ fontSize: 12, color: GW.inkSoft }}>{l.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExplainerTextVisual({ visual }) {
  return (
    <div style={{ ...cardStyle, fontSize: 13.5, color: GW.ink, lineHeight: 1.6 }}>{visual.explainer}</div>
  );
}

export function VisualExplainer({ visual }) {
  if (!visual) return null;
  switch (visual.type) {
    case 'twoColumn': return <TwoColumnVisual visual={visual} />;
    case 'claimDissection': return <ClaimDissectionVisual visual={visual} />;
    case 'compare': return <CompareVisual visual={visual} />;
    case 'bridge': return <BridgeVisual visual={visual} />;
    case 'thesisTemplate': return <ThesisTemplateVisual visual={visual} />;
    case 'flipCard': return <FlipCardVisual visual={visual} />;
    case 'peel': return <PeelVisual visual={visual} />;
    case 'pathwayCards': return <PathwayCardsVisual visual={visual} />;
    case 'happLabels': return <HappLabelsVisual visual={visual} />;
    case 'groupingMap':
    case 'doorDiagram':
      return <ExplainerTextVisual visual={visual} />;
    default: return null;
  }
}

// ── Activity components ────────────────────────────────────────────────────────

function pillStyle(active, color) {
  return {
    border: `1.5px solid ${active ? color : `${GW.ink}25`}`,
    background: active ? `${color}22` : 'transparent',
    color: active ? GW.ink : GW.inkSoft,
    borderRadius: 8, padding: '6px 12px', fontSize: 12.5, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'Nunito, sans-serif',
  };
}

function SortActivity({ activity, value, onChange, detail }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
      {activity.items.map((item) => {
        const d = detail?.find((x) => x.id === item.id);
        return (
          <div key={item.id} style={{
            ...cardStyle,
            borderColor: d ? (d.correct ? `${GW.sage}60` : `${GW.rose}60`) : `${GW.amber}25`,
          }}>
            <div style={{ fontSize: 13.5, color: GW.ink, marginBottom: 8, lineHeight: 1.5 }}>{item.text}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {activity.categories.map((cat) => (
                <button key={cat.key} disabled={!!detail}
                  onClick={() => onChange({ ...value, [item.id]: cat.key })}
                  style={pillStyle(value[item.id] === cat.key, cat.color)}>
                  {cat.label}
                </button>
              ))}
              {d && <span style={{ fontSize: 13, marginLeft: 4 }}>{d.correct ? '✅' : '❌'}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function McqActivity({ activity, value, onChange, detail }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
      {activity.questions.map((q) => {
        const d = detail?.find((x) => x.id === q.id);
        return (
          <div key={q.id} style={{
            ...cardStyle,
            borderColor: d ? (d.correct ? `${GW.sage}60` : `${GW.rose}60`) : `${GW.amber}25`,
          }}>
            <div style={{ fontSize: 13.5, color: GW.ink, marginBottom: 8, lineHeight: 1.5 }}>{q.text}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {q.options.map((opt, i) => (
                <button key={i} disabled={!!detail}
                  onClick={() => onChange({ ...value, [q.id]: i })}
                  style={{ ...pillStyle(value[q.id] === i, GW.amber), textAlign: 'left' }}>
                  {opt}
                </button>
              ))}
            </div>
            {d && <div style={{ fontSize: 13, marginTop: 6 }}>{d.correct ? '✅ Correct' : '❌ Not quite'}</div>}
          </div>
        );
      })}
    </div>
  );
}

function SharpenActivity({ activity, value, onChange, locked }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
      <div style={{ ...cardStyle, borderColor: `${GW.rose}40` }}>
        <Label color={GW.rose}>Too general</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, fontStyle: 'italic' }}>"{activity.vague}"</div>
      </div>
      <div>
        <Label>Pick a sharpening tool</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {activity.tools.map((tool) => (
            <button key={tool.key} disabled={locked}
              onClick={() => onChange({ ...value, tool: tool.key })}
              style={pillStyle(value.tool === tool.key, GW.amber)}>
              {tool.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <Label>Your sharpened version</Label>
        <textarea
          value={value.text || ''} disabled={locked}
          onChange={(e) => onChange({ ...value, text: e.target.value })}
          placeholder="Rewrite the statement so it's specific and verifiable..."
          rows={3}
          style={{
            width: '100%', borderRadius: 10, border: `1.5px solid ${GW.amber}40`, padding: 10,
            fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.ink, background: GW.parchment, resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
}

function BridgeActivity({ activity, value, onChange, locked }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
      <div style={{ ...cardStyle, borderColor: `${GW.amber}40` }}>
        <Label>Claim</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.5 }}>{activity.claim}</div>
      </div>
      <div style={{ ...cardStyle, borderColor: `${GW.blue}40` }}>
        <Label color={GW.blue}>Evidence</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.5 }}>{activity.evidence}</div>
      </div>
      <div>
        <Label color={GW.sage}>Your bridge sentence</Label>
        <textarea
          value={value.text || ''} disabled={locked}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Connect the evidence to the claim..."
          rows={3}
          style={{
            width: '100%', borderRadius: 10, border: `1.5px solid ${GW.sage}40`, padding: 10,
            fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.ink, background: GW.parchment, resize: 'vertical',
          }}
        />
      </div>
    </div>
  );
}

function FreeresponseActivity({ activity, value, onChange, locked }) {
  if (activity.subtype === 'thesis') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
        <div style={{ ...cardStyle, borderColor: `${GW.amber}40` }}>
          <Label>Prompt</Label>
          <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.5 }}>{activity.prompt}</div>
        </div>
        <div>
          <Label>Claim</Label>
          <textarea value={value.claim || ''} disabled={locked} onChange={(e) => onChange({ ...value, claim: e.target.value })}
            placeholder="State your claim — a position someone could disagree with..." rows={2}
            style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${GW.amber}40`, padding: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.ink, background: GW.parchment, resize: 'vertical' }} />
        </div>
        <div>
          <Label color={GW.sage}>...because</Label>
          <textarea value={value.reasoning || ''} disabled={locked} onChange={(e) => onChange({ ...value, reasoning: e.target.value })}
            placeholder="Explain WHY — the reasoning behind your claim..." rows={2}
            style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${GW.sage}40`, padding: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.ink, background: GW.parchment, resize: 'vertical' }} />
        </div>
      </div>
    );
  }

  if (activity.subtype === 'sourcing' && activity.document) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
        <div style={{ ...cardStyle, borderColor: `${GW.amber}40` }}>
          <Label>{activity.document.title}</Label>
          <div style={{ fontSize: 12.5, color: GW.inkSoft, fontStyle: 'italic', marginBottom: 6 }}>{activity.document.source}</div>
          <div style={{ fontSize: 13, color: GW.ink, lineHeight: 1.55 }}>{activity.document.body}</div>
        </div>
        <div>
          <Label color={GW.sage}>Your sourcing analysis</Label>
          <textarea value={value.text || ''} disabled={locked} onChange={(e) => onChange({ text: e.target.value })}
            placeholder="Why might this author's position affect what they say?" rows={4}
            style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${GW.sage}40`, padding: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.ink, background: GW.parchment, resize: 'vertical' }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {activity.instructions && <div style={{ fontSize: 13, color: GW.inkSoft, lineHeight: 1.5 }}>{activity.instructions}</div>}
      <div style={{ ...cardStyle, borderColor: `${GW.amber}40` }}>
        <Label>Prompt</Label>
        <div style={{ fontSize: 13.5, color: GW.ink, lineHeight: 1.5 }}>{activity.prompt}</div>
      </div>
      <div>
        <Label color={GW.sage}>Your response</Label>
        <textarea value={value.text || ''} disabled={locked} onChange={(e) => onChange({ text: e.target.value })}
          placeholder="Write your response..." rows={5}
          style={{ width: '100%', borderRadius: 10, border: `1.5px solid ${GW.sage}40`, padding: 10, fontFamily: 'Nunito, sans-serif', fontSize: 13.5, color: GW.ink, background: GW.parchment, resize: 'vertical' }} />
      </div>
    </div>
  );
}

// ── Submission readiness checks ────────────────────────────────────────────────

function wordCount(t) {
  return (t || '').trim().split(/\s+/).filter(Boolean).length;
}

function isReady(activity, value) {
  switch (activity.type) {
    case 'sort':
    case 'rate':
      return activity.items.every((item) => !!value[item.id]);
    case 'mcq':
      return activity.questions.every((q) => value[q.id] !== undefined);
    case 'sharpen':
      return !!value.tool && wordCount(value.text) >= 4;
    case 'bridge':
      return wordCount(value.text) >= 6;
    case 'freeresponse':
      if (activity.subtype === 'thesis') return wordCount(value.claim) >= 4 && wordCount(value.reasoning) >= 3;
      return wordCount(value.text) >= 6;
    default:
      return false;
  }
}

function emptyValue(activity) {
  if (activity.type === 'sort' || activity.type === 'rate' || activity.type === 'mcq') return {};
  if (activity.type === 'sharpen') return { tool: null, text: '' };
  if (activity.type === 'freeresponse' && activity.subtype === 'thesis') return { claim: '', reasoning: '' };
  return { text: '' };
}

// ── Activity runner — renders the right component + submit + result ────────────

export function ActivityRunner({ activity, onSubmit, onResult, busy, label, submitLabel = 'Check My Work' }) {
  const [value, setValue] = useState(() => emptyValue(activity));
  const [result, setResult] = useState(null);

  const handleSubmit = async () => {
    const r = await onSubmit(value);
    setResult(r);
    onResult?.(r);
  };

  const locked = !!result;
  const ready = isReady(activity, value);

  let body;
  switch (activity.type) {
    case 'sort':
    case 'rate':
      body = <SortActivity activity={activity} value={value} onChange={setValue} detail={result?.detail} />;
      break;
    case 'mcq':
      body = <McqActivity activity={activity} value={value} onChange={setValue} detail={result?.detail} />;
      break;
    case 'sharpen':
      body = <SharpenActivity activity={activity} value={value} onChange={setValue} locked={locked} />;
      break;
    case 'bridge':
      body = <BridgeActivity activity={activity} value={value} onChange={setValue} locked={locked} />;
      break;
    case 'freeresponse':
      body = <FreeresponseActivity activity={activity} value={value} onChange={setValue} locked={locked} />;
      break;
    default:
      body = null;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {label && <Label>{label}</Label>}
      {body}
      {!result && (
        <GwButton onClick={handleSubmit} disabled={!ready || busy}>{submitLabel}</GwButton>
      )}
      {result && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          style={{
            ...cardStyle,
            borderColor: result.score >= (activity.passScore ?? 70) ? `${GW.sage}60` : `${GW.rose}60`,
            background: result.score >= (activity.passScore ?? 70) ? GW.sageSoft : GW.roseSoft,
          }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontWeight: 800, fontSize: 14, color: GW.ink, marginBottom: 4 }}>
            {result.score}/100
          </div>
          <div style={{ fontSize: 13, color: GW.ink, lineHeight: 1.5 }}>{result.feedback}</div>
        </motion.div>
      )}
    </div>
  );
}
