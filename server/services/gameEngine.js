const { v4: uuidv4 } = require('uuid');
const { calculateXP, getNextQuestion, calculateElevation } = require('./mastery');

// Map of gameCode -> session state
const sessions = new Map();

/**
 * Create a new game session.
 * @param {string} gameCode
 * @param {string} teacherId
 * @param {Array} questions - array of question objects
 * @returns {Object} session
 */
function createSession(gameCode, teacherId, questions) {
  const session = {
    id: uuidv4(),
    code: gameCode,
    teacherId,
    classId: null,
    setId: null,
    status: 'lobby',
    questions,
    players: new Map(),
    createdAt: new Date(),
  };
  sessions.set(gameCode, session);
  return session;
}

/**
 * Add or update a player in the session.
 * @param {string} gameCode
 * @param {string} studentId
 * @param {string} name
 * @param {string} socketId
 * @returns {Object} playerState
 */
function addPlayer(gameCode, studentId, name, socketId) {
  const session = sessions.get(gameCode);
  if (!session) throw new Error(`Session not found: ${gameCode}`);

  // If player already exists (reconnect), update socket
  if (session.players.has(studentId)) {
    const player = session.players.get(studentId);
    player.socketId = socketId;
    return player;
  }

  const playerState = {
    id: studentId,
    name,
    socketId,
    masteredIds: [],
    wrongCounts: {},
    queue: [],
    answeredCount: 0,
    elevation: 0,
    xp: 0,
    streak: 0,
    streakBest: 0,
    summited: false,
  };

  session.players.set(studentId, playerState);
  return playerState;
}

/**
 * Get the next question for a player from the session.
 * @param {Object} session
 * @param {Object} player
 * @returns {Object|null}
 */
function getNextQuestionForPlayer(session, player) {
  return getNextQuestion(
    session.questions,
    player.queue,
    player.masteredIds,
    player.wrongCounts,
    player.answeredCount
  );
}

/**
 * Process a student's answer.
 * @param {string} gameCode
 * @param {string} studentId
 * @param {string} questionId
 * @param {number} selected - index of selected option
 * @returns {Object} result
 */
function processAnswer(gameCode, studentId, questionId, selected) {
  const session = sessions.get(gameCode);
  if (!session) throw new Error(`Session not found: ${gameCode}`);

  const player = session.players.get(studentId);
  if (!player) throw new Error(`Player not found: ${studentId}`);

  const question = session.questions.find((q) => q.id === questionId);
  if (!question) throw new Error(`Question not found: ${questionId}`);

  const correct = selected === question.correct_index;
  player.answeredCount += 1;

  // Track wrong count
  if (!player.wrongCounts[questionId]) {
    player.wrongCounts[questionId] = 0;
  }

  let xpGained = 0;
  let mastered = false;
  let showHint = false;
  let showExplanation = false;

  if (correct) {
    player.streak += 1;
    if (player.streak > player.streakBest) {
      player.streakBest = player.streak;
    }

    const wrongCount = player.wrongCounts[questionId];
    const attemptNumber = wrongCount + 1;

    // Mastery: answered correctly after 0 or 1 wrong answers within this queue cycle
    // Consider mastered if answered correctly and wrong count < 3
    if (wrongCount < 3 || !player.masteredIds.includes(questionId)) {
      mastered = true;
      if (!player.masteredIds.includes(questionId)) {
        player.masteredIds.push(questionId);
      }
    }

    xpGained = calculateXP(attemptNumber, player.streak - 1, mastered);
    player.xp += xpGained;

    // Remove from queue if it was there
    player.queue = player.queue.filter((item) => item.question.id !== questionId);

    // Check summit (all mastered)
    const totalQuestions = session.questions.length;
    if (player.masteredIds.length >= totalQuestions && !player.summited) {
      player.summited = true;
      xpGained += 200; // summit_bonus
      player.xp += 200;
    }
  } else {
    player.streak = 0;
    player.wrongCounts[questionId] = (player.wrongCounts[questionId] || 0) + 1;
    const wrongCount = player.wrongCounts[questionId];

    // Remove existing queue entry if any
    player.queue = player.queue.filter((item) => item.question.id !== questionId);

    if (wrongCount === 1) {
      // Wrong once: re-queue after 3 questions
      player.queue.push({ question, dueAtIndex: player.answeredCount + 3 });
    } else if (wrongCount === 2) {
      // Wrong twice: re-queue after 2 questions, hint unlocked
      player.queue.push({ question, dueAtIndex: player.answeredCount + 2 });
      showHint = true;
    } else {
      // Wrong 3+: re-queue after 1 question, show full explanation immediately
      player.queue.push({ question, dueAtIndex: player.answeredCount + 1 });
      showExplanation = true;
    }
  }

  // Recalculate elevation
  player.elevation = calculateElevation(player.masteredIds.length, session.questions.length);

  // Get next question
  const nextQuestion = getNextQuestionForPlayer(session, player);

  const result = {
    correct,
    explanation: correct || showExplanation ? question.explanation : null,
    hint: showHint ? question.hint : null,
    xpGained,
    elevation: player.elevation,
    streak: player.streak,
    mastered,
    nextQuestion: nextQuestion
      ? sanitizeQuestion(nextQuestion, player.wrongCounts[nextQuestion.id] || 0)
      : null,
    summited: player.summited,
    totalXp: player.xp,
    masteredCount: player.masteredIds.length,
    totalCount: session.questions.length,
  };

  return result;
}

/**
 * Strip correct_index from question before sending to student.
 * Also attach hint/explanation based on wrong count.
 */
function sanitizeQuestion(question, wrongCount) {
  const q = {
    id: question.id,
    question: question.question,
    options: question.options,
    topic: question.topic,
    difficulty: question.difficulty,
    subject: question.subject,
  };

  if (wrongCount >= 2) {
    q.hint = question.hint;
  }

  return q;
}

/**
 * Get a session by game code.
 */
function getSession(gameCode) {
  return sessions.get(gameCode) || null;
}

/**
 * Remove a session from memory.
 */
function removeSession(gameCode) {
  sessions.delete(gameCode);
}

/**
 * Get a snapshot of all players' positions for a class.
 * @param {string} gameCode
 * @returns {Array} array of { id, name, elevation, summited, xp, streak }
 */
function getClassSnapshot(gameCode) {
  const session = sessions.get(gameCode);
  if (!session) return [];

  return Array.from(session.players.values()).map((p) => ({
    id: p.id,
    name: p.name,
    elevation: p.elevation,
    summited: p.summited,
    xp: p.xp,
    streak: p.streak,
  }));
}

module.exports = {
  createSession,
  addPlayer,
  processAnswer,
  getNextQuestion: getNextQuestionForPlayer,
  getSession,
  removeSession,
  getClassSnapshot,
};
