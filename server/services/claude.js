const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = 'You are an expert AP teacher. Return only valid JSON.';
const MODEL = 'claude-sonnet-4-20250514';

/**
 * Generate a single multiple-choice question.
 * @param {string} topic
 * @param {string} difficulty - 'easy'|'medium'|'hard'
 * @param {string} subject
 * @returns {Object|null} question object or null on error
 */
async function generateQuestion(topic, difficulty, subject) {
  try {
    const prompt = `Generate a single multiple-choice question for a ${subject} class on the topic: "${topic}". Difficulty: ${difficulty}.

Return JSON in this exact format:
{
  "question": "The question text",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correct_index": 0,
  "explanation": "Why the correct answer is correct",
  "hint": "A helpful hint without giving away the answer",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "subject": "${subject}"
}`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text.trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('claude.generateQuestion error:', err.message);
    return null;
  }
}

/**
 * Extract multiple questions from a block of text (e.g. a worksheet).
 * @param {string} text - raw text containing questions
 * @param {string} subject
 * @returns {Array|null} array of question objects or null on error
 */
async function extractQuestionsFromText(text, subject) {
  try {
    const prompt = `Extract all multiple-choice questions from the following ${subject} text. For each question, produce a structured object.

TEXT:
${text}

Return a JSON array in this exact format:
[
  {
    "question": "The question text",
    "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
    "correct_index": 0,
    "explanation": "Why the correct answer is correct",
    "hint": "A helpful hint",
    "topic": "Inferred topic",
    "difficulty": "easy|medium|hard",
    "subject": "${subject}"
  }
]

If no multiple-choice questions are found, return an empty array [].`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('claude.extractQuestionsFromText error:', err.message);
    return null;
  }
}

/**
 * Generate insights from a completed game session.
 * @param {Object} sessionData - { questions, playerResults, className }
 * @returns {Object|null} insights object or null on error
 */
async function generateClassInsights(sessionData) {
  try {
    const prompt = `Analyze the following classroom game session data and provide actionable teaching insights.

SESSION DATA:
${JSON.stringify(sessionData, null, 2)}

Return JSON in this exact format:
{
  "summary": "One sentence summary of overall performance",
  "strengths": ["Topic students did well on", "..."],
  "struggles": ["Topic students struggled with", "..."],
  "recommendations": ["Specific teaching recommendation", "..."],
  "reteach": ["Question or topic to reteach", "..."]
}`;

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = response.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('claude.generateClassInsights error:', err.message);
    return null;
  }
}

module.exports = { generateQuestion, extractQuestionsFromText, generateClassInsights };
