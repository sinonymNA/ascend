import api from './api.js';

export function normalizeQuestions(rawQuestions) {
  return rawQuestions.map((q) => ({
    id: q.id,
    question: q.question,
    options: q.options || { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
    correct: q.correct,
    explanation: q.explanation,
    stimulus: q.stimulus || null,
    difficulty: q.difficulty || 1,
    tags: q.tags || [],
  }));
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function loadQuestionSet(setId) {
  const data = await api.get(`/api/questions/sets/${setId}`);
  const raw = data.set?.questions || [];
  return normalizeQuestions(raw);
}
