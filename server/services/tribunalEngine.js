// Summit Write — "The Tribunal" in-memory game session engine.
// Lobby -> writing (everyone answers the same SAQ) -> judging (the class votes,
// row by row on the rubric, on 3 anonymous selected responses) -> results.
// Mirrors the session-map pattern used by throwdownEngine.js / gameEngine.js.

const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const WRITING_MS = 4 * 60 * 1000; // 4 minutes to answer all 3 SAQ parts
const JUDGING_MS = 25 * 1000; // 25 seconds to vote per rubric row

const ESSAY_TYPE = 'SAQ';
const CRITERIA_KEYS = ['part_a', 'part_b', 'part_c'];
const RESPONSE_KEYS = ['A', 'B', 'C'];

// Map of roomCode -> session
const sessions = new Map();

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) code += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  return code;
}

function createSession(teacherId, prompt) {
  let code;
  do { code = generateRoomCode(); } while (sessions.has(code));

  const session = {
    code,
    teacherId,
    teacherSocketId: null,
    prompt,
    status: 'lobby', // lobby | writing | judging | results | ended
    players: new Map(), // studentId -> { id, name, socketId, answer, submittedAt, accuracy, voted }
    responses: [], // [{ key, studentId, text, breakdown, score, maxScore }]
    queue: [], // [{ criterionKey, criterionLabel, responseKey }]
    roundIndex: -1,
    roundVotes: new Map(), // studentId -> boolean (this round's yes/no vote)
    roundEndsAt: null,
    writingEndsAt: null,
    timer: null,
    createdAt: Date.now(),
  };
  sessions.set(code, session);
  return session;
}

function getSession(code) {
  return sessions.get(code) || null;
}

function removeSession(code) {
  const session = sessions.get(code);
  if (session?.timer) clearTimeout(session.timer);
  sessions.delete(code);
}

function addPlayer(code, studentId, name, socketId) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');

  if (session.players.has(studentId)) {
    const p = session.players.get(studentId);
    p.socketId = socketId;
    if (name) p.name = name;
    return p;
  }

  const player = { id: studentId, name, socketId, answer: null, submittedAt: null, matches: 0, roundsVoted: 0 };
  session.players.set(studentId, player);
  return player;
}

function startWriting(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.status = 'writing';
  session.writingEndsAt = Date.now() + WRITING_MS;
  return session;
}

function submitAnswer(code, studentId, text) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const player = session.players.get(studentId);
  if (!player) throw new Error('Player not found');
  player.answer = (text || '').slice(0, 1500).trim();
  player.submittedAt = Date.now();
  return player;
}

function allSubmitted(session) {
  if (session.players.size === 0) return false;
  return Array.from(session.players.values()).every((p) => p.submittedAt);
}

function pickResponses(session) {
  const submitted = Array.from(session.players.values()).filter((p) => p.answer);
  const shuffled = [...submitted].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, Math.min(3, shuffled.length));
  return chosen.map((p, i) => ({ key: RESPONSE_KEYS[i], studentId: p.id, text: p.answer || '(no answer submitted)' }));
}

// graded: [{ key, studentId, text, breakdown, score, maxScore }] — already AI-graded by caller
function startJudging(code, graded) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.responses = graded;
  session.queue = [];
  for (const criterionKey of CRITERIA_KEYS) {
    for (const r of graded) {
      session.queue.push({ criterionKey, responseKey: r.key });
    }
  }
  session.status = 'judging';
  session.roundIndex = -1;
  return advanceRound(session);
}

function getCurrentRound(session) {
  if (session.roundIndex < 0 || session.roundIndex >= session.queue.length) return null;
  const item = session.queue[session.roundIndex];
  const response = session.responses.find((r) => r.key === item.responseKey);
  return { ...item, responseText: response?.text || '', index: session.roundIndex, total: session.queue.length };
}

function advanceRound(session) {
  session.roundIndex += 1;
  session.roundVotes = new Map();
  if (session.roundIndex >= session.queue.length) {
    session.status = 'results';
    session.roundEndsAt = null;
    return null;
  }
  session.roundEndsAt = Date.now() + JUDGING_MS;
  return getCurrentRound(session);
}

function castJudgeVote(code, voterId, vote) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  if (typeof vote !== 'boolean') throw new Error('Vote must be boolean');
  if (!session.players.has(voterId)) throw new Error('Player not found');
  session.roundVotes.set(voterId, vote);
  return session;
}

function allVotedRound(session) {
  if (session.players.size === 0) return false;
  return Array.from(session.players.keys()).every((id) => session.roundVotes.has(id));
}

function getRoundTally(session) {
  let yes = 0, no = 0;
  for (const v of session.roundVotes.values()) { if (v) yes += 1; else no += 1; }
  return { yes, no };
}

// Resolves the current round: compares votes to the AI verdict, updates per-student
// accuracy counters, and returns a reveal payload.
function resolveRound(session) {
  const round = getCurrentRound(session);
  if (!round) return null;
  const response = session.responses.find((r) => r.key === round.responseKey);
  const crit = response?.breakdown?.[round.criterionKey];
  const aiEarned = !!crit?.earned;
  const matchedVoters = [];
  for (const [studentId, vote] of session.roundVotes.entries()) {
    const player = session.players.get(studentId);
    if (!player) continue;
    player.roundsVoted += 1;
    if (vote === aiEarned) {
      player.matches += 1;
      matchedVoters.push(studentId);
    }
  }
  const tally = getRoundTally(session);
  return {
    ...round,
    aiEarned,
    aiFeedback: crit?.feedback || '',
    tally,
    matchedVoters,
  };
}

function getResults(session) {
  const responseScores = session.responses.map((r) => ({
    key: r.key,
    studentId: r.studentId,
    score: r.score,
    maxScore: r.maxScore,
  }));
  const leaderboard = Array.from(session.players.values())
    .map((p) => ({ id: p.id, name: p.name, matches: p.matches, roundsVoted: p.roundsVoted }))
    .sort((a, b) => b.matches - a.matches);
  return { responseScores, leaderboard };
}

module.exports = {
  ESSAY_TYPE,
  CRITERIA_KEYS,
  createSession,
  getSession,
  removeSession,
  addPlayer,
  startWriting,
  submitAnswer,
  allSubmitted,
  pickResponses,
  startJudging,
  getCurrentRound,
  advanceRound,
  castJudgeVote,
  allVotedRound,
  getRoundTally,
  resolveRound,
  getResults,
  generateRoomCode,
  WRITING_MS,
  JUDGING_MS,
};
