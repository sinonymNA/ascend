// Summit Write — "Thesis Throwdown" AI scorer.
// Scores a single thesis statement against the AP Thesis/Claim rubric point:
// a defensible claim that establishes a line of reasoning (not a restatement
// of the prompt, not a list with no argument).

const Anthropic = require('@anthropic-ai/sdk');

const MODEL = 'claude-sonnet-4-6';
const hasKey = !!process.env.ANTHROPIC_API_KEY;
const client = hasKey ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;

const SCORER_SYSTEM = `You are an AP World History: Modern exam grader, focused only on the Thesis/Claim rubric point. A thesis earns the point if it responds to all parts of the prompt with a historically defensible claim that establishes a line of reasoning (it previews the "because" — the factors or reasoning the essay will use), rather than simply restating the prompt or listing topics with no argument.

Score each submitted thesis 0 or 1 on this point, and give one short, specific sentence of feedback (max ~20 words) explaining the score. Respond with ONLY a JSON array, one object per thesis, in the same order given, each shaped exactly like:
{"earned": true|false, "feedback": "<one short sentence>"}`;

function extractJsonArray(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch (_) { return null; }
}

function heuristicScore(promptText, thesisText) {
  const text = (thesisText || '').trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  const hasReasoningLanguage = /\b(because|due to|as a result of|since|driven by|caused by|led to)\b/i.test(text);
  const tooShort = words < 8;
  const restatesPrompt = promptText && text.length > 10 &&
    text.toLowerCase().replace(/[^a-z\s]/g, '').includes(
      promptText.toLowerCase().replace(/^evaluate the extent to which |^compare /, '').replace(/[^a-z\s]/g, '').split(' ').slice(0, 4).join(' ')
    );

  const earned = !tooShort && hasReasoningLanguage && !restatesPrompt;
  const feedback = earned
    ? 'Makes a defensible claim and previews a line of reasoning.'
    : tooShort
      ? 'Too short to establish a line of reasoning — add more.'
      : !hasReasoningLanguage
        ? 'Add reasoning language (e.g., "because...") to preview your argument.'
        : 'Reads as a restatement of the prompt rather than a claim.';

  return { earned, feedback };
}

// Score an array of theses for the same prompt in one batch.
async function scoreTheses(promptText, theses) {
  if (!hasKey) return theses.map((t) => heuristicScore(promptText, t));

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 800,
      system: SCORER_SYSTEM,
      messages: [{
        role: 'user',
        content: `PROMPT:\n${promptText}\n\nTHESES TO SCORE:\n${theses.map((t, i) => `${i + 1}. ${t || '(no answer submitted)'}`).join('\n')}`,
      }],
    });
    const arr = extractJsonArray(response.content[0].text);
    if (!Array.isArray(arr) || arr.length !== theses.length) {
      throw new Error('throwdown-grader: malformed or mismatched-length response');
    }
    const valid = arr.every((o) => o && typeof o === 'object' && typeof o.earned === 'boolean' && typeof o.feedback === 'string');
    if (!valid) throw new Error('throwdown-grader: invalid item shape in response');
    return arr.map((o) => ({ earned: o.earned, feedback: o.feedback }));
  } catch (err) {
    console.error('throwdown-grader.scoreTheses error:', err.message);
    return theses.map((t) => heuristicScore(promptText, t));
  }
}

module.exports = { scoreTheses, hasKey };
