// Summit Write — AP essay grading engine.
// All Anthropic calls live server-side. When ANTHROPIC_API_KEY is missing the
// module falls back to a deterministic heuristic grader so the product still works.

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-6';
const hasKey = !!process.env.ANTHROPIC_API_KEY;
const client = hasKey ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const RUBRICS = {
  DBQ: {
    maxScore: 7,
    criteria: {
      contextualization: { points: 1, label: 'Contextualization' },
      thesis: { points: 1, label: 'Thesis' },
      evidence_documents: { points: 3, label: 'Evidence from Documents' },
      evidence_beyond: { points: 1, label: 'Evidence Beyond Documents' },
      complexity: { points: 1, label: 'Complexity' },
    },
  },
  LEQ: {
    maxScore: 6,
    criteria: {
      contextualization: { points: 1, label: 'Contextualization' },
      thesis: { points: 1, label: 'Thesis' },
      evidence: { points: 2, label: 'Evidence' },
      reasoning: { points: 1, label: 'Historical Reasoning' },
      complexity: { points: 1, label: 'Complexity' },
    },
  },
  SAQ: {
    maxScore: 3,
    criteria: {
      part_a: { points: 1, label: 'Part A' },
      part_b: { points: 1, label: 'Part B' },
      part_c: { points: 1, label: 'Part C' },
    },
  },
};

const GRADER_SYSTEM = `You are an AP World History exam grader trained on the College Board's 2025 AP World History: Modern rubric. Grade essays with precision, consistency, and genuine pedagogical care.

This course covers world history from c. 1200 CE to the present, organized into Units 1-9 (the Global Tapestry, Networks of Exchange, Land-Based Empires, Transoceanic Connections, Revolutions, Consequences of Industrialization, Global Conflict, Cold War & Decolonization, Globalization). Apply the historical thinking skills the College Board emphasizes: contextualization (situating an argument in broader developments before/during/after the period), comparison, causation, and continuity and change over time (CCOT). Evaluate evidence for specificity (named individuals, states, empires, treaties, events, movements, and approximate dates) rather than generic statements. For DBQ responses, apply HAPP analysis (Historical context, Audience, Purpose, Point of view) when checking whether a student has explained a document's sourcing — a student does not need the exact word "HAPP," but must connect a document's origin or perspective to their argument, not just summarize its content.

For each essay, return ONLY valid JSON in this exact structure:

{
  "score": <integer, total points earned>,
  "maxScore": <integer, total points possible>,
  "breakdown": {
    "<criterion>": {
      "earned": <boolean>,
      "points": <integer points earned for this criterion>,
      "maxPoints": <integer points possible for this criterion>,
      "feedback": "<specific, actionable feedback — 2-3 sentences>"
    }
  },
  "annotations": [
    {
      "text": "<excerpt from essay, verbatim, max 25 words>",
      "status": "success" | "warning" | "error",
      "category": "<rubric criterion key>",
      "comment": "<brief explanation>"
    }
  ],
  "overallFeedback": "<2-3 sentence coaching note. Specific. Kind. Actionable.>",
  "strengthSummary": "<one sentence on what the student did best>",
  "growthTarget": "<one sentence on the single most important thing to improve>"
}

DBQ rubric criteria keys: contextualization (1pt), thesis (1pt), evidence_documents (up to 3pts), evidence_beyond (1pt), complexity (1pt)
LEQ rubric criteria keys: contextualization (1pt), thesis (1pt), evidence (up to 2pts), reasoning (1pt), complexity (1pt)
SAQ rubric criteria keys: part_a (1pt), part_b (1pt), part_c (1pt)

Be exact. Do not inflate scores. If a criterion is not clearly earned, mark it not earned. Students grow more from honest grading than from generous grading.

Common scoring pitfalls to watch for: (1) a thesis that merely restates the prompt without a defensible line of reasoning does not earn the thesis point; (2) contextualization must describe a broader historical situation/process relevant to the prompt — a single date or term is not enough; (3) for DBQ evidence_documents, the first point requires accurate use of content from at least three documents, the second requires using documents as evidence to support an argument (not just listing them), and the third (sourcing/HAPP) requires explanation of point of view, purpose, historical situation, or audience for at least three documents tied to the argument; (4) complexity is not earned by a single transition phrase — it requires sustained nuance (e.g., explaining exceptions, corroborating with an additional perspective, or explaining both continuity and change) integrated into the argument as a whole.`;

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch (_) { return null; }
}

// Validate a single criterion object against its rubric definition.
function validateCriterion(def, c) {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.points !== 'number' || c.points < 0 || c.points > def.points) return false;
  if (typeof c.maxPoints !== 'number' || c.maxPoints !== def.points) return false;
  if (typeof c.earned !== 'boolean') return false;
  if (typeof c.feedback !== 'string' || !c.feedback.trim()) return false;
  return true;
}

// Validate that parsed.breakdown has a well-formed entry for every rubric criterion.
function validateBreakdown(essayType, parsed) {
  const rubric = RUBRICS[essayType] || RUBRICS.LEQ;
  const breakdown = parsed?.breakdown;
  if (!breakdown || typeof breakdown !== 'object') return false;
  for (const [key, def] of Object.entries(rubric.criteria)) {
    if (!validateCriterion(def, breakdown[key])) return false;
  }
  return true;
}

// Recompute score/maxScore from the (validated) breakdown so totals can never drift.
function normalizeScore(essayType, parsed) {
  const rubric = RUBRICS[essayType] || RUBRICS.LEQ;
  parsed.score = Object.values(parsed.breakdown).reduce((sum, c) => sum + (c.points || 0), 0);
  parsed.maxScore = rubric.maxScore;
  return parsed;
}

// ── Heuristic fallback grader (no API key) ────────────────────────────────────
// Deliberately conservative: checks structural signals only and says so.

function heuristicGrade(essayType, essayText, documents = []) {
  const rubric = RUBRICS[essayType] || RUBRICS.LEQ;
  const text = (essayText || '').trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 40).length;

  const signals = {
    hasThesisLanguage: /\b(argue|because|although|while|however|most significant|therefore|thus)\b/i.test(text),
    hasContextLanguage: /\b(during|by the \d|in the (early|late|mid)|prior to|following the|in \d{3,4}|century|era|period)\b/i.test(text),
    docMentions: (lower.match(/\b(document|doc\.?)\s*\d/g) || []).length,
    hasSourcing: /\b(point of view|purpose|audience|historical situation|perspective|bias|intended)\b/i.test(text),
    hasComplexity: /\b(on the other hand|conversely|both .{1,40}and|continuity and change|cause and effect|nuanc|however,)\b/i.test(text),
    hasSpecificEvidence: /\b(treaty|revolution|empire|dynasty|trade|war of|act of|\d{4})\b/i.test(text),
  };

  const breakdown = {};
  let score = 0;

  for (const [key, def] of Object.entries(rubric.criteria)) {
    let earned = false;
    let pts = 0;
    let feedback = '';

    if (essayType === 'SAQ') {
      // SAQ: a/b/c — look for labeled parts or enough distinct paragraphs
      const partIdx = { part_a: 0, part_b: 1, part_c: 2 }[key];
      const labeled = new RegExp(`\\b(${['a','b','c'][partIdx]})[).]`, 'i').test(text);
      earned = words > 40 * (partIdx + 1) || (labeled && words > 30);
      pts = earned ? 1 : 0;
      feedback = earned
        ? 'A response for this part appears present. (Offline structural check — AI grading unavailable.)'
        : 'This part appears missing or too brief. Address each lettered part directly and specifically.';
    } else if (key === 'thesis') {
      earned = signals.hasThesisLanguage && words > 80;
      pts = earned ? 1 : 0;
      feedback = earned
        ? 'Argumentative language detected near a claim. Make sure the thesis takes a defensible position, not a restatement.'
        : 'No clear line of reasoning detected. State a defensible claim that answers the prompt in your opening paragraph.';
    } else if (key === 'contextualization') {
      earned = signals.hasContextLanguage && paragraphs >= 2;
      pts = earned ? 1 : 0;
      feedback = earned
        ? 'Time-period framing detected. Make sure it connects broader events to your argument, not just a date drop.'
        : 'No broader historical context detected. Open by situating the prompt in events before or during the period.';
    } else if (key === 'evidence_documents') {
      const d = signals.docMentions;
      pts = d >= 6 && signals.hasSourcing ? 3 : d >= 6 ? 2 : d >= 3 ? 1 : 0;
      earned = pts > 0;
      feedback = `Detected references to ~${d} documents. 3+ docs = 1pt, 6+ used in argument = 2pts, sourcing (HAPP) on 3+ = 3pts.`;
    } else if (key === 'evidence_beyond') {
      earned = signals.hasSpecificEvidence && documents.length > 0;
      pts = earned ? 1 : 0;
      feedback = earned
        ? 'Specific historical references detected beyond the documents. Verify they are outside the provided sources.'
        : 'Bring in at least one specific piece of evidence not found in the documents.';
    } else if (key === 'evidence') {
      pts = signals.hasSpecificEvidence ? (words > 350 ? 2 : 1) : 0;
      earned = pts > 0;
      feedback = earned
        ? 'Specific evidence detected. Make sure each example is tied back to your argument.'
        : 'Add at least two specific, relevant historical examples.';
    } else if (key === 'reasoning') {
      earned = signals.hasThesisLanguage && paragraphs >= 3;
      pts = earned ? 1 : 0;
      feedback = earned
        ? 'Structured argumentation detected across paragraphs.'
        : 'Organize body paragraphs around comparison, causation, or continuity/change.';
    } else if (key === 'complexity') {
      earned = signals.hasComplexity && words > 400;
      pts = earned ? 1 : 0;
      feedback = earned
        ? 'Nuance language detected. Complexity must run through the essay, not appear in one sentence.'
        : 'Demonstrate complexity: address counterarguments, or explain both continuity AND change.';
    }

    breakdown[key] = { earned, points: pts, maxPoints: def.points, feedback };
    score += pts;
  }

  return {
    score,
    maxScore: rubric.maxScore,
    breakdown,
    annotations: [],
    overallFeedback:
      'Graded by offline structural analysis (AI grading is not configured on this server). The score reflects detected structure, not historical accuracy — treat it as a floor, and ask your teacher for a full read.',
    strengthSummary: words > 300 ? 'You produced a substantial, multi-paragraph response.' : 'You made a start — now build it out.',
    growthTarget: 'Enable AI grading for line-level feedback, or review the rubric sidebar before revising.',
    grader: 'heuristic',
  };
}

// ── Full grade ────────────────────────────────────────────────────────────────

async function gradeEssay({ essayType, prompt, essayText, documents = [], attemptNumber = 1 }) {
  if (!hasKey) return heuristicGrade(essayType, essayText, documents);

  const docBlock = documents.length
    ? `\n\nDOCUMENTS PROVIDED TO STUDENT:\n${documents
        .map((d) => `Document ${d.doc_number}: ${d.title || ''} (${d.source || 'unknown source'}, ${d.year || 'n.d.'})\n${d.body || '[image-based document]'}`)
        .join('\n\n')}`
    : '';

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: GRADER_SYSTEM,
      messages: [{
        role: 'user',
        content: `Essay type: ${essayType}\nAttempt number: ${attemptNumber}\n\nPROMPT:\n${prompt}${docBlock}\n\nSTUDENT ESSAY:\n${essayText}`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.score !== 'number' || !validateBreakdown(essayType, parsed)) {
      console.error('write-grader.gradeEssay: malformed AI response, falling back to heuristic', {
        essayType, hasParsed: !!parsed, hasBreakdown: !!parsed?.breakdown,
      });
      return heuristicGrade(essayType, essayText, documents);
    }
    normalizeScore(essayType, parsed);
    parsed.grader = 'claude';
    return parsed;
  } catch (err) {
    console.error(`write-grader.gradeEssay error (essayType=${essayType}):`, err.message);
    return heuristicGrade(essayType, essayText, documents);
  }
}

// ── Pre-submission check (fast, cheap) ───────────────────────────────────────

async function precheck({ essayType, prompt, essayText }) {
  if (!hasKey) {
    const g = heuristicGrade(essayType, essayText, []);
    return Object.entries(g.breakdown).map(([k, v]) => ({
      criterion: k,
      status: v.earned ? 'ok' : 'missing',
      note: v.feedback.split('.')[0] + '.',
    }));
  }
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 600,
      system: 'You are a fast AP essay pre-check scanner. Return ONLY a JSON array.',
      messages: [{
        role: 'user',
        content: `Scan this ${essayType} draft against the AP rubric. For each rubric criterion return {"criterion": "<key>", "status": "ok"|"warn"|"missing", "note": "<one short sentence>"}.\nUse criterion keys: ${Object.keys((RUBRICS[essayType] || RUBRICS.LEQ).criteria).join(', ')}.\n\nPROMPT: ${prompt}\n\nDRAFT:\n${essayText}`,
      }],
    });
    const match = response.content[0].text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('precheck: no JSON array found in response');
    let arr;
    try {
      arr = JSON.parse(match[0]);
    } catch (parseErr) {
      throw new Error(`precheck: JSON.parse failed — ${parseErr.message}`);
    }
    if (!Array.isArray(arr)) throw new Error('precheck: response is not an array');

    const validKeys = new Set(Object.keys((RUBRICS[essayType] || RUBRICS.LEQ).criteria));
    const validStatuses = new Set(['ok', 'warn', 'missing']);
    const filtered = arr.filter((item) =>
      item && typeof item === 'object' &&
      validKeys.has(item.criterion) &&
      validStatuses.has(item.status) &&
      typeof item.note === 'string'
    );
    if (!filtered.length) throw new Error('precheck: no valid criterion entries in response');
    return filtered;
  } catch (err) {
    console.error(`write-grader.precheck error (essayType=${essayType}):`, err.message);
    const g = heuristicGrade(essayType, essayText, []);
    return Object.entries(g.breakdown).map(([k, v]) => ({
      criterion: k,
      status: v.earned ? 'ok' : 'missing',
      note: v.feedback.split('.')[0] + '.',
    }));
  }
}

// ── AI assignment prompt generator (teacher) ─────────────────────────────────

async function generateAssignmentPrompt({ description, type }) {
  if (!hasKey) {
    return {
      prompt: `${type} prompt (edit me): ${description}`,
      context: 'AI prompt generation is not configured on this server. Write or paste your own background context here.',
      rubricNotes: Object.entries((RUBRICS[type] || RUBRICS.LEQ).criteria).map(([k, v]) => `${v.label}: ${v.points}pt`),
    };
  }
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1500,
      system: 'You are an expert AP World History teacher who writes College Board exam-style prompts. Return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Write an AP World History ${type} assignment from this teacher description:\n"${description}"\n\nReturn JSON: {"prompt": "<full AP exam-style prompt${type === 'SAQ' ? ' with lettered parts a) b) c)' : ''}>", "context": "<1 paragraph of background context for students>", "rubricNotes": ["<what earns each rubric point on THIS prompt, one string per criterion>"]}`,
      }],
    });
    return extractJson(response.content[0].text) || { prompt: description, context: '', rubricNotes: [] };
  } catch (err) {
    console.error('write-grader.generateAssignmentPrompt error:', err.message);
    return { prompt: description, context: '', rubricNotes: [] };
  }
}

// ── Revision: re-grade one criterion ─────────────────────────────────────────

async function regradeCriterion({ essayType, prompt, originalEssay, criterion, revisedPassage, previousFeedback }) {
  const rubric = RUBRICS[essayType] || RUBRICS.LEQ;
  const def = rubric.criteria[criterion];
  if (!def) return null;

  if (!hasKey) {
    const improved = (revisedPassage || '').trim().length > 60;
    return {
      earned: improved,
      points: improved ? def.points : 0,
      maxPoints: def.points,
      feedback: improved
        ? 'Your revision is substantially developed. (Offline check — AI grading unavailable; teacher review recommended.)'
        : 'The revision is too brief to earn this point. Expand it with specifics.',
    };
  }
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: GRADER_SYSTEM,
      messages: [{
        role: 'user',
        content: `A student is revising ONE criterion of their ${essayType}: "${criterion}" (worth ${def.points}pt).\n\nPROMPT: ${prompt}\n\nORIGINAL ESSAY (for context):\n${originalEssay}\n\nYOUR PREVIOUS FEEDBACK ON THIS CRITERION:\n${previousFeedback || 'n/a'}\n\nREVISED PASSAGE:\n${revisedPassage}\n\nReturn ONLY JSON: {"earned": <bool>, "points": <int>, "maxPoints": ${def.points}, "feedback": "<2 sentences on the revision>"}`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!validateCriterion(def, parsed)) {
      console.error(`write-grader.regradeCriterion: malformed AI response (essayType=${essayType}, criterion=${criterion})`);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error(`write-grader.regradeCriterion error (essayType=${essayType}, criterion=${criterion}):`, err.message);
    return null;
  }
}

// ── Practice drill (gamification) ─────────────────────────────────────────────

async function generateDrill({ criterion, essayType }) {
  if (!hasKey) {
    return {
      prompt: `Practice: write 2-3 sentences of ${criterion.replace(/_/g, ' ')} for this prompt — "Evaluate the most significant cause of the First World War."`,
      criterion,
    };
  }
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: 'You are an AP World History coach. Return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Generate one targeted micro-drill for the AP ${essayType} skill "${criterion}". Return JSON: {"prompt": "<a short writing task of 2-3 sentences the student must produce, with a specific historical prompt to respond to>", "criterion": "${criterion}"}`,
      }],
    });
    return extractJson(response.content[0].text) || { prompt: 'Write a 2-sentence contextualization for a prompt of your choice.', criterion };
  } catch (err) {
    return { prompt: 'Write a 2-sentence contextualization for a prompt of your choice.', criterion };
  }
}

async function gradeDrill({ criterion, drillPrompt, answer }) {
  if (!hasKey) {
    const ok = (answer || '').trim().split(/\s+/).length >= 20;
    return { earned: ok, feedback: ok ? 'Substantial attempt recorded. (Offline check.)' : 'Too brief — aim for 2-3 full sentences with specifics.' };
  }
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: 'You are an honest AP World History grader. Return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Drill skill: ${criterion}\nDrill task: ${drillPrompt}\nStudent answer: ${answer}\n\nWould this earn the "${criterion}" point on the AP rubric? Return JSON: {"earned": <bool>, "feedback": "<2 sentences>"}`,
      }],
    });
    return extractJson(response.content[0].text) || { earned: false, feedback: 'Could not grade — try again.' };
  } catch (err) {
    return { earned: false, feedback: 'Grading temporarily unavailable — try again.' };
  }
}

// ── Guided Walk: Phase 2 "Prompt Decode" — highlightable elements + comprehension check ──

const REGION_KEYWORDS = [
  'Indian Ocean', 'Atlantic World', 'Atlantic', 'Pacific', 'Mediterranean',
  'trans-Saharan', 'Trans-Saharan', 'Silk Roads', 'Silk Road',
  'East Asia', 'Southeast Asia', 'South Asia', 'Central Asia', 'West Africa', 'East Africa', 'North Africa',
  'Sub-Saharan Africa', 'Latin America', 'the Americas', 'Western Europe', 'Eastern Europe', 'the Caribbean',
  'China', 'Japan', 'India', 'Africa', 'Asia', 'Europe', 'the Middle East', 'Ottoman', 'Ming', 'Qing',
];

const SKILL_VERBS = ['Describe', 'Explain', 'Identify', 'Compare', 'Analyze', 'Evaluate', 'Develop'];

const VERB_DEFINITIONS = {
  describe: 'Give specific details about what something was like — no need to explain why it happened or what it led to.',
  explain: 'Give the reasons, causes, or process behind something — show how or why it happened or mattered.',
  identify: 'Name a specific, correct example.',
  compare: 'Discuss similarities and/or differences between two or more things.',
  analyze: 'Break something down to show how its parts work or relate to each other.',
  evaluate: 'Make a supported judgment about the extent, significance, or success of something.',
  develop: 'Build an argument supported by evidence.',
};

function findFirst(text, candidates) {
  for (const c of candidates) {
    if (text.includes(c)) return c;
  }
  return null;
}

function heuristicDecodeElements(context, title, partAText) {
  const combined = `${context || ''}\n\n${partAText || ''}`;
  const dateMatch = combined.match(/\b(1[0-9]\d{2}|20\d{2})\s*(?:–|—|-|to|and)\s*(1[0-9]\d{2}|20\d{2})\b/);
  const timePeriod = dateMatch ? dateMatch[0] : null;
  const geographicScope = findFirst(combined, REGION_KEYWORDS);
  const verbMatch = (partAText || '').match(new RegExp(`\\b(${SKILL_VERBS.join('|')})\\b`, 'i'));
  const skill = verbMatch ? verbMatch[0] : null;
  let topic = (title || '').replace(/^(SAQ|LEQ|DBQ)\s*:\s*/i, '').replace(/,?\s*\d{3,4}\s*(–|—|-).*$/, '').trim();
  if (topic && !combined.includes(topic)) {
    const firstClause = topic.split(',')[0].trim();
    topic = combined.includes(firstClause) ? firstClause : topic;
  }
  return { timePeriod, geographicScope, skill, topic: topic || null };
}

function heuristicDecodeMCQ(elements) {
  const verb = (elements.skill || 'explain').toLowerCase();
  const correctDef = VERB_DEFINITIONS[verb] || VERB_DEFINITIONS.explain;
  const distractors = Object.entries(VERB_DEFINITIONS)
    .filter(([k]) => k !== verb)
    .map(([, v]) => v)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const choices = [{ text: correctDef, correct: true }, ...distractors.map((d) => ({ text: d, correct: false }))]
    .sort(() => Math.random() - 0.5);
  return {
    question: `This prompt asks you to "${elements.skill || 'respond to'}" something. What does that mean you need to do?`,
    choices,
    explanation: `The word "${elements.skill || 'the task verb'}" tells you what kind of thinking this response needs — figuring that out is the first step, before you start writing.`,
  };
}

async function generateDecodeBundle({ context, title, partAText }) {
  const heuristicElements = heuristicDecodeElements(context, title, partAText);
  const heuristicMcq = heuristicDecodeMCQ(heuristicElements);
  if (!hasKey) return { elements: heuristicElements, mcq: heuristicMcq };

  const combined = `${context || ''}\n\n${partAText || ''}`;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: 'You help students decode AP World History prompts. Return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Title: ${title}\n\nText to decode (historical context plus the first task of an SAQ):\n"""\n${combined}\n"""\n\nReturn JSON with these EXACT fields. Each of timePeriod, geographicScope, skill, and topic MUST be a short substring copied VERBATIM (character-for-character) from the text above — do not paraphrase:\n{\n  "timePeriod": "<verbatim substring naming the date range>",\n  "geographicScope": "<verbatim substring naming the region(s)>",\n  "skill": "<verbatim substring — the historical thinking VERB the task uses, e.g. Describe/Explain/Compare>",\n  "topic": "<verbatim substring — the subject/theme>",\n  "mcq": {\n    "question": "<one sentence asking what the task verb requires the student to do>",\n    "choices": [ {"text": "<plain-English description of a task type>", "correct": true|false}, ... exactly 4 choices, exactly one correct ],\n    "explanation": "<one sentence tying the correct choice back to the verb>"\n  }\n}`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed) throw new Error('no JSON in response');
    const elements = {
      timePeriod: typeof parsed.timePeriod === 'string' && combined.includes(parsed.timePeriod) ? parsed.timePeriod : heuristicElements.timePeriod,
      geographicScope: typeof parsed.geographicScope === 'string' && combined.includes(parsed.geographicScope) ? parsed.geographicScope : heuristicElements.geographicScope,
      skill: typeof parsed.skill === 'string' && combined.includes(parsed.skill) ? parsed.skill : heuristicElements.skill,
      topic: typeof parsed.topic === 'string' && combined.includes(parsed.topic) ? parsed.topic : heuristicElements.topic,
    };
    const mcq = parsed.mcq && Array.isArray(parsed.mcq.choices) && parsed.mcq.choices.length >= 2 &&
      parsed.mcq.choices.filter((c) => c && c.correct).length === 1 &&
      typeof parsed.mcq.question === 'string'
      ? parsed.mcq
      : heuristicMcq;
    return { elements, mcq };
  } catch (err) {
    console.error('write-grader.generateDecodeBundle error:', err.message);
    return { elements: heuristicElements, mcq: heuristicMcq };
  }
}

// ── LEQ Guided Walk "The Long Game": Phase 2 decode adds a historical-skill layer ──

const HISTORICAL_SKILL_DEFINITIONS = {
  causation: 'Identify the causes and/or effects of a historical development, and explain the relationship between them.',
  comparison: 'Identify similarities and/or differences between two or more historical developments, and explain their significance.',
  ccot: 'Identify what changed and what stayed the same across a time period, and explain why.',
};

const HISTORICAL_SKILL_LABELS = {
  causation: 'Causation',
  comparison: 'Comparison',
  ccot: 'Continuity and Change Over Time',
};

function detectLeqHistoricalSkill(promptText) {
  const text = (promptText || '').toLowerCase();
  if (/\b(compare|comparison|similarit|differ)/.test(text)) return 'comparison';
  if (/\b(continuity and change|change over time|developed over time|extent to which.*(changed|remained|continuity))/.test(text)) return 'ccot';
  return 'causation';
}

function heuristicLeqSkillMcq(historicalSkill) {
  const skill = HISTORICAL_SKILL_DEFINITIONS[historicalSkill] ? historicalSkill : 'causation';
  const correct = HISTORICAL_SKILL_DEFINITIONS[skill];
  const distractors = Object.entries(HISTORICAL_SKILL_DEFINITIONS)
    .filter(([k]) => k !== skill)
    .map(([, v]) => v);
  const choices = [{ text: correct, correct: true }, ...distractors.map((d) => ({ text: d, correct: false }))]
    .sort(() => Math.random() - 0.5);
  const label = HISTORICAL_SKILL_LABELS[skill];
  return {
    question: `This prompt is built around ${label}. What does that mean you need to do?`,
    choices,
    explanation: `Recognizing that this is a ${label} prompt tells you what your thesis, evidence, and complexity all need to focus on.`,
  };
}

async function generateLeqDecodeBundle({ context, title, promptText }) {
  const heuristicElements = heuristicDecodeElements(context, title, promptText);
  const detectedSkill = detectLeqHistoricalSkill(promptText);
  const heuristicMcq = heuristicLeqSkillMcq(detectedSkill);
  if (!hasKey) return { elements: heuristicElements, mcq: heuristicMcq, historicalSkill: detectedSkill };

  const combined = `${context || ''}\n\n${promptText || ''}`;
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: 'You help students decode AP World History LEQ prompts. Return ONLY valid JSON.',
      messages: [{
        role: 'user',
        content: `Title: ${title}\n\nText to decode (historical context plus the LEQ prompt):\n"""\n${combined}\n"""\n\nReturn JSON with these EXACT fields. timePeriod, geographicScope, skill, and topic MUST be short substrings copied VERBATIM (character-for-character) from the text above — do not paraphrase:\n{\n  "timePeriod": "<verbatim substring naming the date range>",\n  "geographicScope": "<verbatim substring naming the region(s)>",\n  "skill": "<verbatim substring — the task verb, e.g. Evaluate/Explain/Compare>",\n  "topic": "<verbatim substring — the subject/theme>",\n  "historicalSkill": "causation" | "comparison" | "ccot",\n  "mcq": {\n    "question": "<one sentence asking what the historical reasoning skill (causation/comparison/continuity and change over time) requires the student to do for THIS prompt>",\n    "choices": [ {"text": "<plain-English description of a historical reasoning skill>", "correct": true|false}, ... exactly 4 choices, exactly one correct ],\n    "explanation": "<one sentence tying the correct choice back to the prompt>"\n  }\n}`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed) throw new Error('no JSON in response');
    const elements = {
      timePeriod: typeof parsed.timePeriod === 'string' && combined.includes(parsed.timePeriod) ? parsed.timePeriod : heuristicElements.timePeriod,
      geographicScope: typeof parsed.geographicScope === 'string' && combined.includes(parsed.geographicScope) ? parsed.geographicScope : heuristicElements.geographicScope,
      skill: typeof parsed.skill === 'string' && combined.includes(parsed.skill) ? parsed.skill : heuristicElements.skill,
      topic: typeof parsed.topic === 'string' && combined.includes(parsed.topic) ? parsed.topic : heuristicElements.topic,
    };
    const historicalSkill = HISTORICAL_SKILL_DEFINITIONS[parsed.historicalSkill] ? parsed.historicalSkill : detectedSkill;
    const mcq = parsed.mcq && Array.isArray(parsed.mcq.choices) && parsed.mcq.choices.length >= 2 &&
      parsed.mcq.choices.filter((c) => c && c.correct).length === 1 &&
      typeof parsed.mcq.question === 'string'
      ? parsed.mcq
      : heuristicLeqSkillMcq(historicalSkill);
    return { elements, mcq, historicalSkill };
  } catch (err) {
    console.error('write-grader.generateLeqDecodeBundle error:', err.message);
    return { elements: heuristicElements, mcq: heuristicMcq, historicalSkill: detectedSkill };
  }
}

// ── Guided Walk: Phase 3 "Socratic Writing Loop" — Clio's questions + evaluation ─────

const CLIO_QUESTION_SYSTEM = `You are Clio, a warm and encouraging AP World History writing tutor who teaches through questions, never by giving answers. You are helping a student write one part of an SAQ (Short Answer Question).

Rules:
- Ask EXACTLY ONE question.
- Keep it to 40 words or fewer.
- Never state or imply the answer, and never name the specific historical example the student should use.
- Calibrate to the student's level: level 1 students need concrete, narrowing questions (e.g. "Can you name ONE specific empire or trade route from this period?"); level 2 students can handle a "why" or "how" question; level 3 students can handle an open prompt that asks them to connect evidence to reasoning.
- If the student has weak skills listed, gently nudge toward that skill (e.g. if "specificity" is weak, ask for a name, date, or place).
- Use warm, "we" framing ("Let's think about...", "What if we...").
- Return ONLY valid JSON: {"question": "<your single question>"}`;

const CLIO_EVAL_SYSTEM = `You are Clio, a warm AP World History writing tutor, evaluating a student's response to ONE part of an SAQ against the AP rubric. The part earns 1 point if the response is historically accurate AND specific enough to directly address the task.

Classify the response as one of:
- "thin": too short, vague, or generic — no specific historical content.
- "evidence_without_reasoning": includes a specific historical reference but does not yet connect it to what the prompt is asking.
- "strong": specific AND directly addresses the task — earns the point.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence, specific to what they wrote>",
  "clio_response": "<Clio's warm, in-character reply, 40 words or fewer. If not advancing, end with exactly ONE follow-up question. If advancing, celebrate something specific from their response.>",
  "advance": <boolean — true only if meets_rubric is true, or the student has clearly tried their best after multiple attempts>
}`;

function heuristicClioQuestion(partLabel, partText, studentLevel, history) {
  const verbMatch = (partText || '').match(/\b(describe|explain|identify|compare|analyze|evaluate|develop)\b/i);
  const verb = verbMatch ? verbMatch[0].toLowerCase() : 'explain';
  const bank = {
    describe: [
      "Let's start small — what's one specific detail from this period that fits here? A name, place, or date works.",
      "Picture the scene this question is asking about. What's one concrete detail you'd point to?",
    ],
    explain: [
      "Let's think about why. What's one specific cause or example you could connect to this?",
      "What's a specific historical example that helps explain this — and how does it connect?",
    ],
    identify: ["What's one specific example — a person, place, treaty, or event — that fits here?"],
    compare: ["Let's find a contrast. What's one thing that was different (or similar) here, with a specific example?"],
  };
  const options = bank[verb] || bank.explain;
  const followUps = [
    "Good start — can we add one more specific detail, like a name, date, or place?",
    "Let's build on that. How does that example connect back to what the prompt is asking?",
  ];
  const pool = history && history.length > 0 ? followUps : options;
  return { question: pool[Math.floor(Math.random() * pool.length)] };
}

function heuristicClioEvaluation(partText, studentText, history) {
  const text = (studentText || '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasSpecific = /\b(\d{3,4}|century|empire|dynasty|trade|treaty|war|revolution|company|state|kingdom|society|movement|reform)\b/i.test(text);
  const attempts = (history || []).filter((h) => h.role === 'student').length + 1;

  if (words < 8) {
    return {
      meets_rubric: false,
      rubric_feedback: 'This response is too brief to address the task yet.',
      clio_response: "We're off to a start! Can we add a bit more — what specific detail comes to mind?",
      advance: attempts >= 4,
    };
  }
  if (!hasSpecific && attempts < 4) {
    return {
      meets_rubric: false,
      rubric_feedback: 'This response is on the right track but needs a specific historical example — a name, date, place, or event.',
      clio_response: "We're close! Can you name one specific person, place, or event to anchor this?",
      advance: false,
    };
  }
  return {
    meets_rubric: hasSpecific || attempts >= 4,
    rubric_feedback: hasSpecific
      ? 'This response includes specific historical evidence that addresses the task.'
      : 'This response addresses the task, though more specific evidence would strengthen it.',
    clio_response: hasSpecific
      ? "That's exactly the kind of specific detail the rubric is looking for. Nicely done!"
      : "Thanks for sticking with it — let's lock this in and keep moving.",
    advance: true,
  };
}

async function generateClioQuestion({ assignmentTitle, partLabel, partText, studentLevel = 1, weakSkills = [], history = [] }) {
  if (!hasKey) return heuristicClioQuestion(partLabel, partText, studentLevel, history);
  try {
    const historyBlock = (history || [])
      .map((h) => `${h.role === 'clio' ? 'Clio' : 'Student'}: ${h.text}`)
      .join('\n');
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: CLIO_QUESTION_SYSTEM,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nSAQ Part ${partLabel} task: ${partText}\nStudent level: ${studentLevel} (1=needs heavy scaffolding, 3=ready for independence)\nStudent's weak skills: ${weakSkills.join(', ') || 'none recorded'}\n\nConversation so far:\n${historyBlock || '(nothing yet — this is the opening question)'}\n\nAsk your next question.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.question !== 'string' || !parsed.question.trim()) {
      throw new Error('malformed response');
    }
    return { question: parsed.question.trim() };
  } catch (err) {
    console.error(`write-grader.generateClioQuestion error (part=${partLabel}):`, err.message);
    return heuristicClioQuestion(partLabel, partText, studentLevel, history);
  }
}

async function evaluateClioResponse({ assignmentTitle, partLabel, partText, studentLevel = 1, studentText, history = [] }) {
  if (!hasKey) return heuristicClioEvaluation(partText, studentText, history);
  try {
    const historyBlock = (history || [])
      .map((h) => `${h.role === 'clio' ? 'Clio' : 'Student'}: ${h.text}`)
      .join('\n');
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: CLIO_EVAL_SYSTEM,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nSAQ Part ${partLabel} task: ${partText}\nStudent level: ${studentLevel}\n\nConversation so far:\n${historyBlock}\n\nStudent's latest response:\n${studentText}\n\nEvaluate this response.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.meets_rubric !== 'boolean' || typeof parsed.clio_response !== 'string'
      || typeof parsed.rubric_feedback !== 'string' || typeof parsed.advance !== 'boolean') {
      throw new Error('malformed response');
    }
    return parsed;
  } catch (err) {
    console.error(`write-grader.evaluateClioResponse error (part=${partLabel}):`, err.message);
    return heuristicClioEvaluation(partText, studentText, history);
  }
}

// ── Guided Walk: LEQ "The Long Game" ───────────────────────────────────────────

const LEQ_COMPLEXITY_PATHWAYS = {
  corroboration: { label: 'Corroboration', blurb: 'Your argument connects to another time period or region.' },
  qualification: { label: 'Qualification', blurb: 'Your argument has a limit or exception worth naming.' },
  tension: { label: 'Tension', blurb: "There's a counterargument or contradiction in the historical record." },
  scale_shift: { label: 'Scale Shift', blurb: 'Zoom in or out — how does this look at the local vs. global level?' },
};

// ── Phase 3: Thesis Builder ─────────────────────────────────────────────────

const LEQ_THESIS_SYSTEM = `You are Clio, a warm AP World History writing tutor helping a student build the thesis for an LEQ (Long Essay Question). A strong thesis has two parts: a CLAIM (a defensible, arguable position that responds to the prompt) and REASONING (the "because" — why the claim is true, naming the driving factor or mechanism).

Evaluate the student's claim and reasoning:
- The claim must take a position on the prompt that a reasonable historian could disagree with — not a restatement of the prompt, not a simple fact, not just a topic.
- The reasoning must explain WHY the claim is true — it cannot just restate the claim or say something like "because it was important."
- Both must be specific enough to guide the rest of the essay.

Return ONLY valid JSON:
{
  "claimOk": <boolean>,
  "reasoningOk": <boolean>,
  "claimFeedback": "<1-2 sentences, specific to what they wrote>",
  "reasoningFeedback": "<1-2 sentences, specific to what they wrote>",
  "clio_response": "<Clio's warm, in-character reply, 40 words or fewer>",
  "approved": <boolean — true only if both claimOk and reasoningOk>
}`;

function heuristicEvaluateLeqThesis(claim, reasoning, attemptNumber) {
  const c = (claim || '').trim();
  const r = (reasoning || '').trim();
  const claimWords = c.split(/\s+/).filter(Boolean).length;
  const reasoningWords = r.split(/\s+/).filter(Boolean).length;
  const claimOk = claimWords >= 6 && !/^(the|this)\s+(prompt|question)\s+(asks|is about)/i.test(c);
  const reasoningOk = reasoningWords >= 5 && !/^(it (was|is) important|because it (was|is) important)/i.test(r);
  const approved = (claimOk && reasoningOk) || attemptNumber >= 3;
  return {
    claimOk, reasoningOk,
    claimFeedback: claimOk
      ? 'Your claim takes a position — good. Make sure it directly responds to the prompt.'
      : 'Your claim needs to take a clear position someone could disagree with, not just describe or restate the topic.',
    reasoningFeedback: reasoningOk
      ? 'Your reasoning gives a "why" — good. Make sure it names a specific driving factor.'
      : 'Your reasoning needs to explain WHY your claim is true — name the mechanism or factor that drives it, not just "because it was important."',
    clio_response: approved
      ? "That's your thesis. Everything else you write tonight has one job — support that claim."
      : "We're getting closer — let's sharpen this a bit more. (Offline check — AI grading unavailable.)",
    approved,
  };
}

async function evaluateLeqThesis({ assignmentTitle, prompt, claim, reasoning, attemptNumber = 1 }) {
  if (!hasKey) return heuristicEvaluateLeqThesis(claim, reasoning, attemptNumber);
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: LEQ_THESIS_SYSTEM,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nPROMPT: ${prompt}\nAttempt number: ${attemptNumber} of 3\n\nStudent's CLAIM: ${claim}\nStudent's REASONING: ${reasoning}\n\nEvaluate this thesis.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.approved !== 'boolean' || typeof parsed.clio_response !== 'string'
      || typeof parsed.claimFeedback !== 'string' || typeof parsed.reasoningFeedback !== 'string'
      || typeof parsed.claimOk !== 'boolean' || typeof parsed.reasoningOk !== 'boolean') {
      throw new Error('malformed response');
    }
    if (attemptNumber >= 3) parsed.approved = true;
    return parsed;
  } catch (err) {
    console.error('write-grader.evaluateLeqThesis error:', err.message);
    return heuristicEvaluateLeqThesis(claim, reasoning, attemptNumber);
  }
}

// ── Phases 4-6: Contextualization / Evidence+Analysis / Complexity Socratic loops ──

const LEQ_CONTEXT_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student is building the CONTEXTUALIZATION for their LEQ — NOT background information, but a description of a broader historical development or process relevant to the prompt, AND a connection from that broader context to their own argument.

Ask EXACTLY ONE question, 40 words or fewer. Build on the conversation so far:
- If this is the first question, ask what was happening in the world before or around their topic that connects to their argument.
- If the student has described a broader context but not yet connected it to their thesis, ask how that context shapes or sets up their specific argument.
- Never state or imply the answer, and never name the specific historical example.
- Use warm, "we" framing.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const LEQ_CONTEXT_EVAL_SYSTEM = `You are Clio, a warm AP World History writing tutor, evaluating a student's CONTEXTUALIZATION for an LEQ against the AP rubric. The contextualization point is earned if the response BOTH (a) describes a broader historical event, development, or process relevant to the prompt — not just a date or single term — AND (b) connects that broader context to the student's specific argument/thesis.

Classify the response as one of:
- "thin": too brief or generic, no real historical content.
- "context_only": describes a broader context but does not connect it to the argument — this is the single most common LEQ mistake.
- "strong": describes broader context AND connects it to the argument — earns the point.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence, specific to what they wrote>",
  "clio_response": "<Clio's warm, in-character reply, 40 words or fewer. If not advancing, end with exactly ONE follow-up question. If advancing, celebrate something specific from their response.>",
  "advance": <boolean — true only if meets_rubric is true, or the student has clearly tried their best after multiple attempts>
}`;

const LEQ_EVIDENCE_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student is naming ONE PIECE OF SPECIFIC EVIDENCE to support their LEQ thesis.

Ask EXACTLY ONE question, 40 words or fewer, asking the student for one specific piece of evidence — a name, place, date, treaty, event, or development a historian could verify — that is relevant to their thesis. Never name the example yourself. If the student already gave evidence that was too vague (a general trend, not a verifiable specific), gently push for more specificity.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const LEQ_EVIDENCE_EVAL_SYSTEM = `You are Clio, evaluating whether a student's response names SPECIFIC EVIDENCE relevant to their LEQ thesis. Specific means a historian could verify it — a named person, place, polity, treaty, event, or approximate date. A general trend ("trade increased") is NOT specific evidence.

Classify the response as one of:
- "thin": no real historical content.
- "vague": a general trend or category, not a verifiable specific.
- "strong": names something specific AND plausibly relevant to the thesis — earns this step.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence>",
  "clio_response": "<Clio's warm reply, 40 words or fewer. If not advancing, push for a specific name/date/place with exactly ONE follow-up question. If advancing, acknowledge the evidence specifically.>",
  "advance": <boolean — true only if meets_rubric is true (vague evidence does not meet the rubric), or the student has tried their best after multiple attempts>
}`;

const LEQ_ANALYSIS_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student has just named a piece of evidence for their LEQ; now they must CONNECT it to their thesis.

Ask EXACTLY ONE question, 40 words or fewer, asking the student to explain HOW the evidence they just gave supports their thesis claim. Reference their evidence and thesis in your question where helpful. Never state the connection yourself.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const LEQ_ANALYSIS_EVAL_SYSTEM = `You are Clio, evaluating whether a student's ANALYSIS connects their evidence to their LEQ thesis. It earns credit if the response references the evidence AND explains how it supports the thesis's line of reasoning — not just restating the evidence or the thesis alone.

Classify the response as one of:
- "thin": too brief, no real connection.
- "evidence_only": restates or describes the evidence without linking it to the thesis.
- "strong": explicitly links the evidence to the thesis's line of reasoning — earns this step.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence>",
  "clio_response": "<Clio's warm reply, 40 words or fewer. If not advancing, ask exactly ONE follow-up question pushing toward the connection. If advancing, affirm the connection specifically.>",
  "advance": <boolean — true only if meets_rubric is true, or the student has tried their best after multiple attempts>
}`;

const LEQ_COMPLEXITY_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student is working on the COMPLEXITY point for their LEQ — the hardest point, earned through sustained nuance integrated into the argument as a whole (not a single transition phrase).

The student has chosen a complexity pathway (named in the user message, with a description of what it asks for). Ask EXACTLY ONE question, 40 words or fewer, that helps the student develop THIS pathway in connection to their specific thesis and evidence:
- If this is the first question for this pathway, introduce the pathway's core move (e.g. for corroboration, ask about a connection to another time/region; for qualification, ask about a limit or exception; for tension, ask about a counterargument; for scale shift, ask about a different level of analysis).
- If the student has already answered once, ask a follow-up that pushes them to tie this new dimension explicitly back to their thesis.

Never state the answer yourself. Use warm, "we" framing.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const LEQ_COMPLEXITY_EVAL_SYSTEM = `You are Clio, evaluating a student's COMPLEXITY response for an LEQ. The complexity point requires sustained nuance integrated into the argument — not a single transition phrase. The student is working through a specific complexity pathway (named in the user message).

Decide whether the conversation so far demonstrates complexity: does it add a genuine additional dimension appropriate to the chosen pathway (another time period/region for corroboration; a limit/exception for qualification; a counterargument/tension for tension; a different scale of analysis for scale shift) AND tie it back to the thesis?

Classify the response as one of:
- "thin": no real additional dimension yet.
- "developing": an additional dimension is named but not yet tied to the thesis.
- "strong": an additional dimension is clearly tied to the thesis — earns the point.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence>",
  "clio_response": "<Clio's warm reply, 40 words or fewer. If not advancing, ask exactly ONE follow-up question. If advancing, celebrate specifically.>",
  "advance": <boolean — true only if meets_rubric is true and the student has addressed both the pathway's core move and its connection to the thesis, or the student has tried their best after multiple attempts>
}`;

const LEQ_STAGE_SYSTEMS = {
  contextualization: { question: LEQ_CONTEXT_QUESTION_SYSTEM, eval: LEQ_CONTEXT_EVAL_SYSTEM },
  evidence: { question: LEQ_EVIDENCE_QUESTION_SYSTEM, eval: LEQ_EVIDENCE_EVAL_SYSTEM },
  analysis: { question: LEQ_ANALYSIS_QUESTION_SYSTEM, eval: LEQ_ANALYSIS_EVAL_SYSTEM },
  complexity: { question: LEQ_COMPLEXITY_QUESTION_SYSTEM, eval: LEQ_COMPLEXITY_EVAL_SYSTEM },
};

function heuristicLeqStageQuestion(stage, history) {
  const banks = {
    contextualization: [
      "What was happening in the world before or around your topic that connects to your argument?",
      "How does that broader context shape or set up the specific argument you're making?",
    ],
    evidence: [
      "What's one specific piece of evidence — a name, place, date, or event — that supports your thesis?",
      "Can we get more specific? Name a particular person, place, treaty, or event.",
    ],
    analysis: [
      "How does the evidence you just gave support your thesis? Walk me through the connection.",
      "Let's tie it back to your claim — why does that evidence matter for your argument?",
    ],
    complexity: [
      "Let's build out this pathway — what's the additional dimension you're adding to your argument?",
      "Now connect that back to your thesis — how does it strengthen or complicate your overall argument?",
    ],
  };
  const pool = banks[stage] || banks.contextualization;
  const idx = Math.min((history || []).filter((h) => h.role === 'student').length, pool.length - 1);
  return { question: pool[idx] };
}

function heuristicLeqStageEvaluation(stage, studentText, history) {
  const text = (studentText || '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const attempts = (history || []).filter((h) => h.role === 'student').length + 1;
  const hasSpecific = /\b(\d{3,4}|century|empire|dynasty|trade|treaty|war|revolution|company|state|kingdom|society|movement|reform)\b/i.test(text);
  const hasConnective = /\b(because|this shows|this means|therefore|as a result|which|so that|in order to|demonstrates|supports|connects|since)\b/i.test(text);

  if (words < 6) {
    return {
      meets_rubric: false,
      rubric_feedback: 'This response is too brief to evaluate yet.',
      clio_response: "Let's add a bit more — can you say more about that?",
      advance: attempts >= 4,
    };
  }

  let strong;
  if (stage === 'evidence') strong = hasSpecific;
  else if (stage === 'analysis' || stage === 'complexity') strong = hasConnective && words > 12;
  else strong = hasConnective && words > 15; // contextualization

  return {
    meets_rubric: strong || attempts >= 4,
    rubric_feedback: strong
      ? 'This response meets the rubric standard for this step. (Offline check — AI grading unavailable.)'
      : 'This response is on the right track but needs more — be more specific or connect it more explicitly to your argument.',
    clio_response: strong
      ? "That's exactly what this step needed. Nicely done!"
      : attempts >= 4
        ? "Thanks for sticking with it — let's lock this in and keep moving."
        : "We're close — can you make this more specific, or tie it more directly to your argument?",
    advance: strong || attempts >= 4,
  };
}

function leqThesisBlock(thesis) {
  return `\nStudent's thesis — claim: ${thesis?.claim || 'n/a'}; reasoning: ${thesis?.reasoning || 'n/a'}`;
}

async function generateLeqStageQuestion({ stage, assignmentTitle, prompt, thesis, stageContext = '', pathway, studentLevel = 1, history = [] }) {
  if (!hasKey) return heuristicLeqStageQuestion(stage, history);
  try {
    const systems = LEQ_STAGE_SYSTEMS[stage] || LEQ_STAGE_SYSTEMS.contextualization;
    const historyBlock = (history || []).map((h) => `${h.role === 'clio' ? 'Clio' : 'Student'}: ${h.text}`).join('\n');
    const pathwayBlock = pathway && LEQ_COMPLEXITY_PATHWAYS[pathway]
      ? `\nComplexity pathway: ${LEQ_COMPLEXITY_PATHWAYS[pathway].label} — ${LEQ_COMPLEXITY_PATHWAYS[pathway].blurb}`
      : '';
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: systems.question,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nPROMPT: ${prompt}${leqThesisBlock(thesis)}${stageContext}${pathwayBlock}\nStudent level: ${studentLevel} (1=needs heavy scaffolding, 3=ready for independence)\n\nConversation so far:\n${historyBlock || '(nothing yet — this is the opening question)'}\n\nAsk your next question.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.question !== 'string' || !parsed.question.trim()) throw new Error('malformed response');
    return { question: parsed.question.trim() };
  } catch (err) {
    console.error(`write-grader.generateLeqStageQuestion error (stage=${stage}):`, err.message);
    return heuristicLeqStageQuestion(stage, history);
  }
}

async function evaluateLeqStageResponse({ stage, assignmentTitle, prompt, thesis, stageContext = '', pathway, studentLevel = 1, studentText, history = [] }) {
  if (!hasKey) return heuristicLeqStageEvaluation(stage, studentText, history);
  try {
    const systems = LEQ_STAGE_SYSTEMS[stage] || LEQ_STAGE_SYSTEMS.contextualization;
    const historyBlock = (history || []).map((h) => `${h.role === 'clio' ? 'Clio' : 'Student'}: ${h.text}`).join('\n');
    const pathwayBlock = pathway && LEQ_COMPLEXITY_PATHWAYS[pathway]
      ? `\nComplexity pathway: ${LEQ_COMPLEXITY_PATHWAYS[pathway].label} — ${LEQ_COMPLEXITY_PATHWAYS[pathway].blurb}`
      : '';
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systems.eval,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nPROMPT: ${prompt}${leqThesisBlock(thesis)}${stageContext}${pathwayBlock}\nStudent level: ${studentLevel}\n\nConversation so far:\n${historyBlock}\n\nStudent's latest response:\n${studentText}\n\nEvaluate this response.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.meets_rubric !== 'boolean' || typeof parsed.clio_response !== 'string'
      || typeof parsed.rubric_feedback !== 'string' || typeof parsed.advance !== 'boolean') {
      throw new Error('malformed response');
    }
    return parsed;
  } catch (err) {
    console.error(`write-grader.evaluateLeqStageResponse error (stage=${stage}):`, err.message);
    return heuristicLeqStageEvaluation(stage, studentText, history);
  }
}

// ── Guided Walk: DBQ "Reading the Room" ─────────────────────────────────────────

const HAPP_DIMENSIONS = {
  context: {
    label: 'Historical Context',
    prompt: "What was happening in the world when this was written? That context shapes what the author says and doesn't say.",
  },
  audience: {
    label: 'Audience',
    prompt: "Who is this written FOR? An audience shapes a message — what might this author leave out, exaggerate, or frame carefully because of who's reading?",
  },
  purpose: {
    label: 'Purpose',
    prompt: 'Why was this created? A propaganda poster and a private letter are both documents — but they work very differently as evidence.',
  },
  pov: {
    label: 'Point of View',
    prompt: "What does this person's background, position, or identity tell you about why they see it this way?",
  },
};

function heuristicHappFeedback(dimension, studentText) {
  const words = (studentText || '').trim().split(/\s+/).filter(Boolean).length;
  if (words < 4) {
    return { feedback: 'Try to say a bit more — even a short sentence helps you remember this when you write.' };
  }
  const bank = {
    context: 'Good — keep that broader moment in mind as you decide how to use this document.',
    audience: "Nice — thinking about who's reading helps you spot what the author chose to include or leave out.",
    purpose: 'That’s the idea — the form a document takes shapes what it can tell you as evidence.',
    pov: "Good thinking — the author's position is often the key to using a document well.",
  };
  return { feedback: bank[dimension] || 'Good — hold onto that observation for when you write about this document.' };
}

async function evaluateHappResponse({ assignmentTitle, document, dimension, studentText }) {
  if (!hasKey) return heuristicHappFeedback(dimension, studentText);
  try {
    const dim = HAPP_DIMENSIONS[dimension] || HAPP_DIMENSIONS.context;
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 150,
      system: `You are Clio, a warm AP World History writing tutor. The student is practicing HAPP (Historical context, Audience, Purpose, Point of view) analysis on a DBQ document, focusing on ${dim.label}. Give ONE warm sentence (25 words or fewer) of feedback that affirms or gently extends their thinking and connects it to how they might use this document as evidence. Return ONLY valid JSON: {"feedback": "<your sentence>"}`,
      messages: [{
        role: 'user',
        content: `Document: "${document?.title || ''}" (${document?.source || 'unknown source'}, ${document?.year || 'n.d.'})\n${dim.label} prompt: ${dim.prompt}\n\nStudent's response: ${studentText}`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.feedback !== 'string' || !parsed.feedback.trim()) throw new Error('malformed response');
    return { feedback: parsed.feedback.trim() };
  } catch (err) {
    console.error(`write-grader.evaluateHappResponse error (dimension=${dimension}):`, err.message);
    return heuristicHappFeedback(dimension, studentText);
  }
}

// ── Phase 4: document-anchored Socratic loop (evidence / sourcing / outside evidence) ──

const DBQ_EVIDENCE_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student is using ONE DOCUMENT as evidence for their DBQ thesis.

Ask EXACTLY ONE question, 40 words or fewer, asking the student to summarize what the document says in their own words AND explain how it supports their thesis. Reference the document by its title where helpful. Never summarize the document yourself, and never state the connection to the thesis.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const DBQ_EVIDENCE_EVAL_SYSTEM = `You are Clio, evaluating whether a student's response uses ONE DOCUMENT as evidence for their DBQ thesis.

Classify the response as one of:
- "thin": too brief, no real content.
- "description_only": describes or quotes the document without connecting it to the thesis.
- "strong": accurately summarizes the document's content/argument AND explains how it supports the thesis — earns this step.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence>",
  "clio_response": "<Clio's warm reply, 40 words or fewer. If not advancing, ask exactly ONE follow-up question. If advancing, affirm the connection specifically.>",
  "advance": <boolean — true only if meets_rubric is true, or the student has tried their best after multiple attempts>
}`;

const DBQ_SOURCING_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student has just used a document as evidence; now they are working on SOURCING (HAPP) for that same document — explaining how the document's point of view, purpose, historical situation, or audience strengthens or complicates its use as evidence for their thesis.

Ask EXACTLY ONE question, 40 words or fewer. Point the student toward ONE HAPP element (whichever seems most relevant to this document) without naming the answer yourself. Use warm, "we" framing.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const DBQ_SOURCING_EVAL_SYSTEM = `You are Clio, evaluating a student's SOURCING (HAPP) analysis of a document used as DBQ evidence.

Classify the response as one of:
- "thin": no real sourcing content.
- "description_only": identifies a HAPP element (e.g. "this is a speech" or "the author is a king") but does not connect it to the argument.
- "strong": identifies a HAPP element (point of view, purpose, historical situation, or audience) AND explains how it strengthens, limits, or complicates the document's use as evidence for the thesis — earns this step.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence>",
  "clio_response": "<Clio's warm reply, 40 words or fewer. If not advancing, ask exactly ONE follow-up question pushing toward the connection. If advancing, affirm the sourcing point specifically.>",
  "advance": <boolean — true only if meets_rubric is true, or the student has tried their best after multiple attempts>
}`;

const DBQ_OUTSIDE_EVIDENCE_QUESTION_SYSTEM = `You are Clio, a warm AP World History writing tutor. The student is naming ONE PIECE OF OUTSIDE EVIDENCE for their DBQ — something specific and verifiable that is NOT found in any of the provided documents — to support their thesis.

Ask EXACTLY ONE question, 40 words or fewer, asking for a specific name, place, date, treaty, event, or development (not found in the documents) relevant to their thesis. If the student already gave something too vague, or that appears to restate one of the documents, gently redirect. Never name the example yourself.

Return ONLY valid JSON: {"question": "<your single question>"}`;

const DBQ_OUTSIDE_EVIDENCE_EVAL_SYSTEM = `You are Clio, evaluating whether a student's response names a piece of OUTSIDE EVIDENCE for their DBQ — specific, verifiable, AND not one of the provided documents.

Classify the response as one of:
- "thin": no real historical content.
- "vague": a general trend, not a verifiable specific, OR appears to restate one of the provided documents rather than outside knowledge.
- "strong": names something specific, plausibly relevant to the thesis, and distinct from the documents — earns this step.

Return ONLY valid JSON:
{
  "meets_rubric": <boolean>,
  "rubric_feedback": "<one sentence>",
  "clio_response": "<Clio's warm reply, 40 words or fewer. If not advancing, push for a specific, document-independent example with exactly ONE follow-up question. If advancing, acknowledge the evidence specifically.>",
  "advance": <boolean — true only if meets_rubric is true, or the student has tried their best after multiple attempts>
}`;

const DBQ_STAGE_SYSTEMS = {
  evidence: { question: DBQ_EVIDENCE_QUESTION_SYSTEM, eval: DBQ_EVIDENCE_EVAL_SYSTEM },
  sourcing: { question: DBQ_SOURCING_QUESTION_SYSTEM, eval: DBQ_SOURCING_EVAL_SYSTEM },
  outside_evidence: { question: DBQ_OUTSIDE_EVIDENCE_QUESTION_SYSTEM, eval: DBQ_OUTSIDE_EVIDENCE_EVAL_SYSTEM },
};

function dbqDocumentBlock(document) {
  if (!document) return '';
  return `\nDocument ${document.doc_number} — "${document.title}" (${document.source || 'unknown source'}, ${document.year || 'n.d.'}):\n${document.body || '[image-based document]'}`;
}

function heuristicDbqStageQuestion(stage, history, document) {
  const title = document?.title || 'this document';
  const banks = {
    evidence: [
      `Summarize what "${title}" says in your own words, then explain how it supports your thesis.`,
      "Can we connect that summary more directly to your thesis — what's the link?",
    ],
    sourcing: [
      `Think about who created "${title}" and why. How does that shape how you use it as evidence?`,
      'Can we tie that sourcing point more directly back to your argument?',
    ],
    outside_evidence: [
      "Now give me something you know that isn't in these documents — a specific event, person, or development that supports your argument.",
      'Can we make that more specific — a name, date, place, or event a historian could verify?',
    ],
  };
  const pool = banks[stage] || banks.evidence;
  const idx = Math.min((history || []).filter((h) => h.role === 'student').length, pool.length - 1);
  return { question: pool[idx] };
}

function heuristicDbqStageEvaluation(stage, studentText, history) {
  const text = (studentText || '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const attempts = (history || []).filter((h) => h.role === 'student').length + 1;
  const hasSpecific = /\b(\d{3,4}|century|empire|dynasty|trade|treaty|war|revolution|company|state|kingdom|society|movement|reform)\b/i.test(text);
  const hasConnective = /\b(because|this shows|this means|therefore|as a result|which|so that|in order to|demonstrates|supports|connects|since)\b/i.test(text);
  const hasHapp = /\b(audience|purpose|perspective|point of view|bias|wrote this|intended|background|position|propaganda|persuade|context|written by|reader)\b/i.test(text);

  if (words < 6) {
    return {
      meets_rubric: false,
      rubric_feedback: 'This response is too brief to evaluate yet.',
      clio_response: "Let's add a bit more — can you say more about that?",
      advance: attempts >= 4,
    };
  }

  let strong;
  if (stage === 'evidence') strong = hasConnective && words > 15;
  else if (stage === 'sourcing') strong = hasHapp && hasConnective && words > 10;
  else strong = hasSpecific && words >= 6; // outside_evidence

  return {
    meets_rubric: strong || attempts >= 4,
    rubric_feedback: strong
      ? 'This response meets the rubric standard for this step. (Offline check — AI grading unavailable.)'
      : 'This response is on the right track but needs more — be more specific or connect it more explicitly to your argument.',
    clio_response: strong
      ? "That's exactly what this step needed. Nicely done!"
      : attempts >= 4
        ? "Thanks for sticking with it — let's lock this in and keep moving."
        : "We're close — can you make this more specific, or tie it more directly to your argument?",
    advance: strong || attempts >= 4,
  };
}

async function generateDbqStageQuestion({ stage, assignmentTitle, prompt, thesis, document, stageContext = '', studentLevel = 1, history = [] }) {
  if (!hasKey) return heuristicDbqStageQuestion(stage, history, document);
  try {
    const systems = DBQ_STAGE_SYSTEMS[stage];
    if (!systems) throw new Error(`unknown DBQ stage: ${stage}`);
    const historyBlock = (history || []).map((h) => `${h.role === 'clio' ? 'Clio' : 'Student'}: ${h.text}`).join('\n');
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: systems.question,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nPROMPT: ${prompt}${leqThesisBlock(thesis)}${dbqDocumentBlock(document)}${stageContext}\nStudent level: ${studentLevel} (1=needs heavy scaffolding, 3=ready for independence)\n\nConversation so far:\n${historyBlock || '(nothing yet — this is the opening question)'}\n\nAsk your next question.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.question !== 'string' || !parsed.question.trim()) throw new Error('malformed response');
    return { question: parsed.question.trim() };
  } catch (err) {
    console.error(`write-grader.generateDbqStageQuestion error (stage=${stage}):`, err.message);
    return heuristicDbqStageQuestion(stage, history, document);
  }
}

async function evaluateDbqStageResponse({ stage, assignmentTitle, prompt, thesis, document, stageContext = '', studentLevel = 1, studentText, history = [] }) {
  if (!hasKey) return heuristicDbqStageEvaluation(stage, studentText, history);
  try {
    const systems = DBQ_STAGE_SYSTEMS[stage];
    if (!systems) throw new Error(`unknown DBQ stage: ${stage}`);
    const historyBlock = (history || []).map((h) => `${h.role === 'clio' ? 'Clio' : 'Student'}: ${h.text}`).join('\n');
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      system: systems.eval,
      messages: [{
        role: 'user',
        content: `Assignment: ${assignmentTitle}\nPROMPT: ${prompt}${leqThesisBlock(thesis)}${dbqDocumentBlock(document)}${stageContext}\nStudent level: ${studentLevel}\n\nConversation so far:\n${historyBlock}\n\nStudent's latest response:\n${studentText}\n\nEvaluate this response.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.meets_rubric !== 'boolean' || typeof parsed.clio_response !== 'string'
      || typeof parsed.rubric_feedback !== 'string' || typeof parsed.advance !== 'boolean') {
      throw new Error('malformed response');
    }
    return parsed;
  } catch (err) {
    console.error(`write-grader.evaluateDbqStageResponse error (stage=${stage}):`, err.message);
    return heuristicDbqStageEvaluation(stage, studentText, history);
  }
}

// ── Evidence Auction — score an evidence-to-thesis connection ──────────────────

const EVIDENCE_AUCTION_SYSTEM = `You are an AP World History writing coach evaluating whether a piece of historical evidence, as justified by a student team, actually supports a given thesis. Score the connection on a 0-3 scale:
0 = the evidence is irrelevant to the thesis, or no real justification is given.
1 = the evidence is topically related but the justification is vague or generic (e.g. "this shows change happened") without specifics.
2 = the evidence is relevant and the justification makes a real connection to the thesis, but lacks full specificity or precision.
3 = the evidence is specific (named people, places, events, or dates) AND the justification clearly and precisely explains how it supports the thesis's line of reasoning.
Return ONLY JSON: {"score": 0, "specific": false, "relevant": false, "feedback": "one sentence, addressed to the team"}`;

function heuristicEvidenceConnection(evidenceText, justification) {
  const text = (justification || '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 4) {
    return { score: 0, specific: false, relevant: false, feedback: 'No real justification given — explain how this evidence supports the thesis.' };
  }
  const hasSpecific = /\b(\d{3,4}|century|empire|dynasty|treaty|revolution|company|king|queen|emperor|war|movement|reform|kingdom|colony|trade)\b/i.test(`${evidenceText} ${text}`);
  const hasConnective = /\b(because|this shows|this means|therefore|as a result|demonstrates|supports|connects|since|which (proves|shows))\b/i.test(text);

  let score;
  if (hasSpecific && hasConnective && words > 12) score = 3;
  else if (hasConnective && words > 8) score = 2;
  else if (words >= 4) score = 1;
  else score = 0;

  return {
    score,
    specific: hasSpecific,
    relevant: hasConnective || score > 0,
    feedback: score >= 2
      ? 'Solid connection to the thesis. (Offline check — AI grading unavailable.)'
      : 'This connection needs to be more specific and explicit about why the evidence matters for the thesis.',
  };
}

async function evaluateEvidenceConnection({ thesis, evidenceText, justification }) {
  if (!hasKey) return heuristicEvidenceConnection(evidenceText, justification);
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 200,
      system: EVIDENCE_AUCTION_SYSTEM,
      messages: [{
        role: 'user',
        content: `Thesis: ${thesis}\nEvidence card: ${evidenceText}\nTeam's justification: ${justification || '(nothing submitted)'}\n\nScore this evidence-thesis connection.`,
      }],
    });
    const parsed = extractJson(response.content[0].text);
    if (!parsed || typeof parsed.score !== 'number' || ![0, 1, 2, 3].includes(parsed.score) || typeof parsed.feedback !== 'string') {
      throw new Error('malformed response');
    }
    return { score: parsed.score, specific: !!parsed.specific, relevant: !!parsed.relevant, feedback: parsed.feedback };
  } catch (err) {
    console.error('write-grader.evaluateEvidenceConnection error:', err.message);
    return heuristicEvidenceConnection(evidenceText, justification);
  }
}

module.exports = {
  RUBRICS, gradeEssay, precheck, generateAssignmentPrompt, regradeCriterion, generateDrill, gradeDrill, hasKey,
  generateDecodeBundle, generateClioQuestion, evaluateClioResponse,
  LEQ_COMPLEXITY_PATHWAYS, generateLeqDecodeBundle, evaluateLeqThesis,
  generateLeqStageQuestion, evaluateLeqStageResponse,
  HAPP_DIMENSIONS, evaluateHappResponse, generateDbqStageQuestion, evaluateDbqStageResponse,
  evaluateEvidenceConnection,
};
