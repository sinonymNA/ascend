// Summit Write — AP essay grading engine.
// All Anthropic calls live server-side. When ANTHROPIC_API_KEY is missing the
// module falls back to a deterministic heuristic grader so the product still works.

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-20250514';
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

Be exact. Do not inflate scores. If a criterion is not clearly earned, mark it not earned. Students grow more from honest grading than from generous grading.`;

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch (_) { return null; }
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
    if (!parsed || typeof parsed.score !== 'number') return heuristicGrade(essayType, essayText, documents);
    parsed.grader = 'claude';
    return parsed;
  } catch (err) {
    console.error('write-grader.gradeEssay error:', err.message);
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
    return match ? JSON.parse(match[0]) : [];
  } catch (err) {
    console.error('write-grader.precheck error:', err.message);
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
    return extractJson(response.content[0].text);
  } catch (err) {
    console.error('write-grader.regradeCriterion error:', err.message);
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

module.exports = { RUBRICS, gradeEssay, precheck, generateAssignmentPrompt, regradeCriterion, generateDrill, gradeDrill, hasKey };
