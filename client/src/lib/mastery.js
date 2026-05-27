/**
 * Client-side mastery helpers — mirrors server logic for optimistic UI.
 */

export const XP_RULES = {
  correct_first_try:  100,
  correct_second_try:  75,
  correct_third_try:   50,
  mastery_bonus:       50,
  streak_3:            25,
  streak_5:            50,
  streak_10:          100,
  summit_bonus:       200,
};

/**
 * Calculate XP earned for a single correct answer.
 * @param {number} attemptNumber  1-based attempt count for this question
 * @param {number} streak         current correct-answer streak (after this answer)
 * @param {boolean} isMastery     true if this answer completes mastery for the question
 * @returns {number} total XP earned
 */
export function calculateXP(attemptNumber, streak, isMastery) {
  let xp = 0;

  // Base XP by attempt
  if (attemptNumber === 1)      xp += XP_RULES.correct_first_try;
  else if (attemptNumber === 2) xp += XP_RULES.correct_second_try;
  else                          xp += XP_RULES.correct_third_try;

  // Mastery bonus
  if (isMastery) xp += XP_RULES.mastery_bonus;

  // Streak bonuses (mutually exclusive, highest applicable)
  if (streak >= 10)     xp += XP_RULES.streak_10;
  else if (streak >= 5) xp += XP_RULES.streak_5;
  else if (streak >= 3) xp += XP_RULES.streak_3;

  return xp;
}

/**
 * Calculate elevation percentage (0–100) based on mastery progress.
 * @param {number} masteredCount  number of questions mastered
 * @param {number} totalCount     total questions in the set
 * @returns {number} elevation 0–100
 */
export function calculateElevation(masteredCount, totalCount) {
  if (!totalCount || totalCount <= 0) return 0;
  const ratio = masteredCount / totalCount;
  // Use a slight curve so early progress feels real and the summit is earned
  const elevation = Math.min(100, Math.round(ratio * 100));
  return elevation;
}

/**
 * Determine the mountain zone name for a given elevation.
 * @param {number} elevation 0–100
 * @returns {string} zone label
 */
export function getZoneName(elevation) {
  if (elevation >= 90) return 'Summit';
  if (elevation >= 75) return 'Summit Approach';
  if (elevation >= 50) return 'Alpine';
  if (elevation >= 25) return 'Trail';
  return 'Base Camp';
}

/**
 * Zone color accent for UI highlights.
 */
export function getZoneColor(elevation) {
  if (elevation >= 90) return '#E8F4F8'; // snow
  if (elevation >= 75) return '#A8B8C8'; // grey
  if (elevation >= 50) return '#4A5568'; // rock
  if (elevation >= 25) return '#2D6A4F'; // pine
  return '#1A3D2E';                       // pine-soft
}

/**
 * Streak bonus label shown in the UI.
 */
export function getStreakLabel(streak) {
  if (streak >= 10) return 'Unstoppable!';
  if (streak >= 5)  return 'Blazing!';
  if (streak >= 3)  return 'On Fire!';
  return null;
}

/**
 * Get the next question for a player using spaced repetition.
 * Mirrors the server-side logic in server/services/mastery.js.
 */
export function getNextQuestion(allQuestions, queue, masteredIds, wrongCounts, answeredCount) {
  const masteredSet = new Set(masteredIds);
  const currentIndex = answeredCount;

  // Due queued questions first
  const dueItems = queue
    .filter((item) => !masteredSet.has(item.question.id) && item.dueAtIndex <= currentIndex)
    .sort((a, b) => a.dueAtIndex - b.dueAtIndex);
  if (dueItems.length > 0) return dueItems[0].question;

  // Unmastered questions not yet queued
  const queuedIds = new Set(queue.map((item) => item.question.id));
  const notStarted = allQuestions.filter((q) => !masteredSet.has(q.id) && !queuedIds.has(q.id));
  if (notStarted.length > 0) return notStarted[0];

  // All mastered or waiting — return soonest due
  const pending = queue
    .filter((item) => !masteredSet.has(item.question.id))
    .sort((a, b) => a.dueAtIndex - b.dueAtIndex);
  if (pending.length > 0) return pending[0].question;

  return null;
}
