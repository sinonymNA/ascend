// Summit Write — Writing Courses grading engine (Phase 2, Part 3).
// Scores lesson activities and exit checks. Heuristic-first (deterministic,
// always available); when ANTHROPIC_API_KEY is set, free-text responses get
// richer Clio feedback on top of the heuristic score via a small JSON contract,
// falling back to the heuristic result on any parse/API error.

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-6';
const hasKey = !!process.env.ANTHROPIC_API_KEY;
const client = hasKey ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const hasConnective = /\b(because|this shows|this means|therefore|as a result|which|so that|in order to|demonstrates|supports|connects|since|allowed|enabled|caused|led to|resulted in)\b/i;
const hasSpecific = /\b(\d{3,4}|century|empire|dynasty|trade|treaty|war|revolution|company|state|kingdom|society|movement|reform)\b/i;
const hasHapp = /\b(audience|purpose|perspective|point of view|bias|wrote this|intended|background|position|propaganda|persuade|context|written by|reader)\b/i;

function wordCount(t) {
  return (t || '').trim().split(/\s+/).filter(Boolean).length;
}

function significantWords(s) {
  return new Set((s || '').toLowerCase().match(/\b[a-z]{4,}\b/g) || []);
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON object found in model output');
  return JSON.parse(match[0]);
}

// ── Choice-based activities (sort / rate / mcq) ───────────────────────────────

function choiceFeedback(score) {
  if (score === 100) return 'Perfect — you got every one.';
  if (score >= 70) return "Solid — you're seeing the pattern.";
  return 'A few of these need a closer look.';
}

function evaluateChoiceSet(items, answers, correctKey) {
  const list = items || [];
  let correctCount = 0;
  const detail = list.map((item) => {
    const expected = item[correctKey];
    const given = answers ? answers[item.id] : undefined;
    const ok = given === expected;
    if (ok) correctCount++;
    return { id: item.id, correct: ok };
  });
  const total = list.length;
  const score = total ? Math.round((correctCount / total) * 100) : 0;
  return { score, correctCount, total, detail };
}

// ── Sharpen (vague → specific, with a "tool") ─────────────────────────────────

function evaluateSharpen(config, response) {
  const { tool, text } = response || {};
  const t = (text || '').trim();
  const words = wordCount(t);
  const toolOk = (config.correctTools || []).includes(tool);
  const notes = [];
  let score = 0;

  if (words < 5) {
    notes.push('Write a full sentence, not just a word or two.');
  } else {
    if (hasSpecific.test(t) || /\b\d{3,4}\b/.test(t)) {
      score += 50;
    } else {
      notes.push('Add something concrete — a name, date, place, or number.');
    }
    if (toolOk) {
      score += 50;
    } else {
      const suggestion = (config.tools || []).find((x) => (config.correctTools || []).includes(x.key));
      notes.push(suggestion ? `Try a tool like "${suggestion.label}" for this one.` : 'Try a different specificity tool.');
    }
  }

  const feedback = notes.length ? notes.join(' ') : 'Sharp and specific — a historian could verify this.';
  return { score, passed: score >= (config.passScore ?? 70), feedback };
}

// ── Bridge (claim + evidence → reasoning sentence) ────────────────────────────

function evaluateBridge(config, response) {
  const text = (typeof response === 'string' ? response : response?.text || '').trim();
  const words = wordCount(text);
  const claimWords = significantWords(config.claim);
  const evidenceWords = significantWords(config.evidence);
  const textWords = significantWords(text);
  const overlapsClaim = [...claimWords].some((w) => textWords.has(w));
  const overlapsEvidence = [...evidenceWords].some((w) => textWords.has(w));
  const notes = [];
  let score = 0;

  if (words < 8) {
    notes.push('Write a full sentence connecting the evidence to the claim.');
  } else {
    if (hasConnective.test(text)) score += 30;
    else notes.push('Use a connective like "because," "which," or "this shows" to link the two.');
    if (overlapsEvidence) score += 35;
    else notes.push('Reference the specific evidence you were given.');
    if (overlapsClaim) score += 35;
    else notes.push('Tie it back to the claim — what does the evidence prove about it?');
  }

  const feedback = notes.length ? notes.join(' ') : 'That bridge holds — it connects the evidence to the claim with reasoning.';
  return { score, passed: score >= (config.passScore ?? 70), feedback };
}

// ── Free-response (thesis / contextualization / complexity / sourcing) ───────

function evaluateThesis(config, response) {
  const claim = (response?.claim || '').trim();
  const reasoning = (response?.reasoning || '').trim();
  const notes = [];
  let score = 0;

  if (wordCount(claim) >= 6) score += 50;
  else notes.push('Your claim needs to be a full sentence that takes a position someone could disagree with.');

  if (wordCount(reasoning) >= 5 && (hasConnective.test(reasoning) || hasSpecific.test(reasoning))) score += 50;
  else notes.push('Your reasoning should explain WHY — name a mechanism or use a word like "because" or "which led to."');

  const feedback = notes.length ? notes.join(' ') : 'That\'s a defensible thesis — a claim plus reasoning that explains why.';
  return { score, passed: score >= (config.passScore ?? 70), feedback };
}

function evaluateContextualization(config, response) {
  const text = (response?.text || '').trim();
  const words = wordCount(text);
  const notes = [];
  let score = 0;

  if (words < 15) {
    notes.push('Say more about the broader context before your topic — aim for a few sentences.');
  } else {
    if (hasSpecific.test(text)) score += 40;
    else notes.push('Name a specific development, empire, treaty, or date for the broader context.');
    if (hasConnective.test(text)) score += 60;
    else notes.push('Connect that context to your argument with a word like "this shaped," "as a result," or "which led to."');
  }

  const feedback = notes.length ? notes.join(' ') : 'That context is specific AND connected to your argument — exactly what contextualization needs.';
  return { score, passed: score >= (config.passScore ?? 70), feedback };
}

function evaluateComplexity(config, response) {
  const text = (response?.text || '').trim();
  const words = wordCount(text);
  const notes = [];
  let score = 0;

  if (words < 12) {
    notes.push('Develop your complexity statement further — name the pathway you picked and explain it.');
  } else {
    if (hasSpecific.test(text)) score += 40;
    else notes.push('Ground this in something specific — a place, period, or event.');
    if (hasConnective.test(text)) score += 60;
    else notes.push('Connect this back to your thesis — show how it adds nuance, not just a new fact.');
  }

  const feedback = notes.length ? notes.join(' ') : 'That adds real nuance — it\'s connected to the thesis, not just a tacked-on fact.';
  return { score, passed: score >= (config.passScore ?? 70), feedback };
}

function evaluateSourcing(config, response) {
  const text = (response?.text || '').trim();
  const words = wordCount(text);
  const notes = [];
  let score = 0;

  if (words < 10) {
    notes.push('Write a full sentence or two about this author\'s position.');
  } else {
    if (hasHapp.test(text)) score += 50;
    else notes.push('Reference the author\'s position, audience, or purpose.');
    if (hasConnective.test(text)) score += 50;
    else notes.push('Explain WHY that affects what they say — connect it with "because" or "which means."');
  }

  const feedback = notes.length ? notes.join(' ') : 'That sourcing explains WHY the author\'s position matters, not just THAT it does.';
  return { score, passed: score >= (config.passScore ?? 70), feedback };
}

function evaluateFreeresponse(config, response) {
  switch (config.subtype) {
    case 'thesis': return evaluateThesis(config, response);
    case 'contextualization': return evaluateContextualization(config, response);
    case 'complexity': return evaluateComplexity(config, response);
    case 'sourcing': return evaluateSourcing(config, response);
    default: return evaluateContextualization(config, response);
  }
}

// ── AI assist: enrich free-text feedback when a key is available ─────────────

function describeFreeTextTask(activityType, config, response) {
  switch (activityType) {
    case 'sharpen':
      return `Activity: sharpen a vague statement.\nVague statement: "${config.vague}"\nStudent's chosen tool: ${response?.tool || '(none)'}\nStudent's rewrite: "${response?.text || ''}"`;
    case 'bridge':
      return `Activity: write a bridge/reasoning sentence connecting evidence to a claim.\nClaim: "${config.claim}"\nEvidence: "${config.evidence}"\nStudent's bridge sentence: "${(typeof response === 'string' ? response : response?.text) || ''}"`;
    case 'freeresponse':
      if (config.subtype === 'thesis') {
        return `Activity: write a thesis (claim + reasoning) for the prompt: "${config.prompt}"\nStudent's claim: "${response?.claim || ''}"\nStudent's reasoning ("because..."): "${response?.reasoning || ''}"`;
      }
      if (config.subtype === 'sourcing') {
        return `Activity: write a sourcing (HAPP) analysis for this document.\nDocument: "${config.document?.title}" — ${config.document?.source}\nExcerpt: "${config.document?.body || ''}"\nStudent's sourcing analysis: "${response?.text || ''}"`;
      }
      return `Activity: ${config.subtype || 'free response'} for the prompt: "${config.prompt}"\nStudent's response: "${response?.text || ''}"`;
    default:
      return `Student's response: "${JSON.stringify(response)}"`;
  }
}

async function aiAssessFreeText({ lessonTitle, activityType, config, response, heuristic }) {
  if (!hasKey) return null;
  const task = describeFreeTextTask(activityType, config, response);
  const system = `You are Clio, a warm but precise AP World History writing coach inside Summit Write's "Writing Courses." A student just completed a short practice activity in the lesson "${lessonTitle}". Score their response 0-100 against the skill being practiced, and give 1-2 sentences of specific, kind, actionable feedback in Clio's voice. A heuristic scorer suggested ${heuristic.score}/100 with this note: "${heuristic.feedback}" — use that as a sanity check, but make your own judgment. Return ONLY valid JSON: {"score": <integer 0-100>, "feedback": "<1-2 sentences>"}`;

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 300,
      system,
      messages: [{ role: 'user', content: task }],
    });
    const text = msg.content?.[0]?.text || '';
    const parsed = extractJson(text);
    if (typeof parsed.score !== 'number' || typeof parsed.feedback !== 'string') return null;
    const score = Math.max(0, Math.min(100, Math.round(parsed.score)));
    return { score, feedback: parsed.feedback };
  } catch (e) {
    console.error('course-grader AI assist error:', e.message, '| activityType:', activityType, '| lesson:', lessonTitle);
    return null;
  }
}

// ── Top-level dispatcher ───────────────────────────────────────────────────────

async function evaluateActivity({ activityType, config, response, lessonTitle }) {
  let result;

  switch (activityType) {
    case 'sort':
    case 'rate': {
      const { score, detail } = evaluateChoiceSet(config.items, response, 'correct');
      result = { score, passed: score >= (config.passScore ?? 70), feedback: choiceFeedback(score), detail };
      break;
    }
    case 'mcq': {
      const { score, detail } = evaluateChoiceSet(config.questions, response, 'correctIndex');
      result = { score, passed: score >= (config.passScore ?? 70), feedback: choiceFeedback(score), detail };
      break;
    }
    case 'sharpen':
      result = evaluateSharpen(config, response);
      break;
    case 'bridge':
      result = evaluateBridge(config, response);
      break;
    case 'freeresponse':
      result = evaluateFreeresponse(config, response);
      break;
    default:
      result = { score: 0, passed: false, feedback: 'Unsupported activity type.' };
  }

  if (hasKey && ['sharpen', 'bridge', 'freeresponse'].includes(activityType)) {
    const ai = await aiAssessFreeText({ lessonTitle, activityType, config, response, heuristic: result });
    if (ai) {
      result = { ...result, score: ai.score, feedback: ai.feedback, passed: ai.score >= (config.passScore ?? 70) };
    }
  }

  return result;
}

module.exports = { evaluateActivity, hasKey };
