// XP rules
const XP_RULES = {
  correct_first_try: 100,
  correct_second_try: 75,
  correct_third_try: 50,
  mastery_bonus: 50,
  streak_3: 25,
  streak_5: 50,
  streak_10: 100,
  summit_bonus: 200,
};

/**
 * Calculate XP earned for a correct answer.
 * @param {number} attemptNumber - 1-indexed attempt number for this question
 * @param {number} streak - current correct-answer streak before this answer
 * @param {boolean} isMastery - whether this answer completes mastery of the question
 * @returns {number} xp earned
 */
function calculateXP(attemptNumber, streak, isMastery) {
  let xp = 0;

  if (attemptNumber === 1) {
    xp += XP_RULES.correct_first_try;
  } else if (attemptNumber === 2) {
    xp += XP_RULES.correct_second_try;
  } else {
    xp += XP_RULES.correct_third_try;
  }

  if (isMastery) {
    xp += XP_RULES.mastery_bonus;
  }

  // streak bonuses apply after this correct answer (streak will be streak+1)
  const newStreak = streak + 1;
  if (newStreak >= 10 && newStreak % 10 === 0) {
    xp += XP_RULES.streak_10;
  } else if (newStreak >= 5 && newStreak % 5 === 0) {
    xp += XP_RULES.streak_5;
  } else if (newStreak >= 3 && newStreak % 3 === 0) {
    xp += XP_RULES.streak_3;
  }

  return xp;
}

/**
 * Get the next question for a player.
 * @param {Array} allQuestions - all questions in the set
 * @param {Array} queue - array of { question, dueAtIndex } sorted by dueAtIndex
 * @param {Array} masteredIds - array of mastered question IDs
 * @param {Object} wrongCounts - { questionId: count }
 * @param {number} answeredCount - total questions answered so far (used as current index)
 * @returns {Object|null} next question to show, or null if all mastered
 */
function getNextQuestion(allQuestions, queue, masteredIds, wrongCounts, answeredCount) {
  const masteredSet = new Set(masteredIds);
  const currentIndex = answeredCount;

  // First: check if any queued (spaced repetition) questions are due
  const dueItems = queue
    .filter((item) => !masteredSet.has(item.question.id) && item.dueAtIndex <= currentIndex)
    .sort((a, b) => a.dueAtIndex - b.dueAtIndex);

  if (dueItems.length > 0) {
    return dueItems[0].question;
  }

  // Next: find unmastered questions not currently in the queue
  const queuedIds = new Set(queue.map((item) => item.question.id));
  const notStarted = allQuestions.filter(
    (q) => !masteredSet.has(q.id) && !queuedIds.has(q.id)
  );

  if (notStarted.length > 0) {
    return notStarted[0];
  }

  // All questions either mastered or waiting in queue — return soonest queued
  const pendingItems = queue
    .filter((item) => !masteredSet.has(item.question.id))
    .sort((a, b) => a.dueAtIndex - b.dueAtIndex);

  if (pendingItems.length > 0) {
    return pendingItems[0].question;
  }

  return null;
}

/**
 * Calculate elevation percentage based on mastery progress.
 * @param {number} masteredCount
 * @param {number} totalCount
 * @returns {number} 0-100
 */
function calculateElevation(masteredCount, totalCount) {
  if (totalCount === 0) return 0;
  return Math.round((masteredCount / totalCount) * 100);
}

module.exports = { XP_RULES, calculateXP, getNextQuestion, calculateElevation };
