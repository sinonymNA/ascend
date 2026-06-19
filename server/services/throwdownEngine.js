// Summit Write — "Thesis Throwdown" in-memory game session engine.
// Mirrors the lightweight in-memory session pattern used by gameEngine.js,
// but scoped to a single round: write a thesis, vote on 4 anonymous theses,
// then reveal AI rankings.

const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const WRITING_MS = 3 * 60 * 1000; // 3 minutes
const VOTING_MS = 30 * 1000; // 30 seconds

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
    status: 'lobby', // lobby | writing | voting | results | ended
    players: new Map(), // studentId -> { id, name, socketId, thesis, submittedAt, votedFor }
    votingSet: [], // [{ key, studentId, text }]
    writingEndsAt: null,
    votingEndsAt: null,
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

  const player = { id: studentId, name, socketId, thesis: null, submittedAt: null, votedFor: null };
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

function submitThesis(code, studentId, text) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const player = session.players.get(studentId);
  if (!player) throw new Error('Player not found');
  player.thesis = (text || '').slice(0, 600).trim();
  player.submittedAt = Date.now();
  return player;
}

function allSubmitted(session) {
  if (session.players.size === 0) return false;
  return Array.from(session.players.values()).every((p) => p.submittedAt);
}

function startVoting(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');

  const submitted = Array.from(session.players.values()).filter((p) => p.thesis);
  const shuffled = [...submitted].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, Math.min(4, shuffled.length));
  const keys = ['A', 'B', 'C', 'D'];
  session.votingSet = chosen.map((p, i) => ({ key: keys[i], studentId: p.id, text: p.thesis || '(no answer submitted)' }));
  session.status = 'voting';
  session.votingEndsAt = Date.now() + VOTING_MS;
  return session;
}

function castVote(code, voterId, choiceKey) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  if (!session.votingSet.find((o) => o.key === choiceKey)) throw new Error('Invalid choice');
  const player = session.players.get(voterId);
  if (!player) throw new Error('Player not found');
  player.votedFor = choiceKey;
  return session;
}

function getVoteTally(session) {
  const tally = {};
  for (const o of session.votingSet) tally[o.key] = 0;
  for (const p of session.players.values()) {
    if (p.votedFor && tally[p.votedFor] !== undefined) tally[p.votedFor] += 1;
  }
  return tally;
}

function allVoted(session) {
  const eligible = Array.from(session.players.values());
  if (eligible.length === 0) return false;
  return eligible.every((p) => p.votedFor);
}

module.exports = {
  createSession,
  getSession,
  removeSession,
  addPlayer,
  startWriting,
  submitThesis,
  allSubmitted,
  startVoting,
  castVote,
  getVoteTally,
  allVoted,
  generateRoomCode,
  WRITING_MS,
  VOTING_MS,
};
