// Summit Write — "The Relay" in-memory game session engine.
// Lobby -> teams assigned -> claim (90s) -> evidence (120s) -> context (90s)
// -> grading -> results. Each team of 3 hands off a single LEQ paragraph:
// Role 1 writes the thesis, Role 2 sees it and writes evidence + reasoning,
// Role 3 sees the full paragraph and writes the contextualization.

const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const CLAIM_MS = 90 * 1000;
const EVIDENCE_MS = 2 * 60 * 1000;
const CONTEXT_MS = 90 * 1000;

const STOPWORDS = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'to', 'is', 'was', 'were', 'are', 'be', 'this', 'that', 'with', 'for', 'as', 'by', 'it', 'at', 'from']);

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
    status: 'lobby', // lobby | claim | evidence | context | grading | results
    players: new Map(), // studentId -> { id, name, socketId, teamId }
    teams: new Map(), // teamId -> { id, members:[{id,name,role}], claimText, evidenceText, contextText, ... }
    stageEndsAt: null,
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

  const player = { id: studentId, name, socketId, teamId: null };
  session.players.set(studentId, player);
  return player;
}

function getTeamForStudent(session, studentId) {
  const player = session.players.get(studentId);
  if (!player?.teamId) return null;
  return session.teams.get(player.teamId) || null;
}

function getRoleForStudent(session, studentId) {
  const team = getTeamForStudent(session, studentId);
  if (!team) return null;
  return team.members.find((m) => m.id === studentId)?.role || null;
}

function assignTeams(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');

  const players = Array.from(session.players.values());
  const shuffled = [...players].sort(() => Math.random() - 0.5);
  session.teams = new Map();

  const groups = [];
  for (let i = 0; i < shuffled.length; i += 3) groups.push(shuffled.slice(i, i + 3));
  // Fold a short leftover group (1-2 players) into the previous team.
  if (groups.length > 1 && groups[groups.length - 1].length < 3) {
    const leftover = groups.pop();
    groups[groups.length - 1].push(...leftover);
  }

  const roleNames = ['claim', 'evidence', 'context'];
  groups.forEach((group, i) => {
    const teamId = `team-${i + 1}`;
    const members = group.map((p, idx) => {
      const role = roleNames[Math.min(idx, 2)];
      p.teamId = teamId;
      return { id: p.id, name: p.name, role };
    });
    session.teams.set(teamId, {
      id: teamId,
      members,
      claimText: null,
      evidenceText: null,
      contextText: null,
      claimSubmittedAt: null,
      evidenceSubmittedAt: null,
      contextSubmittedAt: null,
      score: null,
      maxScore: null,
      breakdown: null,
      cohesionBonus: 0,
      totalScore: null,
    });
  });

  return session.teams;
}

function startClaim(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.status = 'claim';
  session.stageEndsAt = Date.now() + CLAIM_MS;
  return session;
}

function submitClaim(code, studentId, text) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const team = getTeamForStudent(session, studentId);
  if (!team) throw new Error('You are not on a team');
  team.claimText = (text || '').slice(0, 400).trim();
  team.claimSubmittedAt = Date.now();
  return team;
}

function startEvidence(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.status = 'evidence';
  session.stageEndsAt = Date.now() + EVIDENCE_MS;
  return session;
}

function submitEvidence(code, studentId, text) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const team = getTeamForStudent(session, studentId);
  if (!team) throw new Error('You are not on a team');
  team.evidenceText = (text || '').slice(0, 800).trim();
  team.evidenceSubmittedAt = Date.now();
  return team;
}

function startContext(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.status = 'context';
  session.stageEndsAt = Date.now() + CONTEXT_MS;
  return session;
}

function submitContext(code, studentId, text) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const team = getTeamForStudent(session, studentId);
  if (!team) throw new Error('You are not on a team');
  team.contextText = (text || '').slice(0, 400).trim();
  team.contextSubmittedAt = Date.now();
  return team;
}

function allTeamsSubmitted(session, field) {
  if (session.teams.size === 0) return false;
  return Array.from(session.teams.values()).every((t) => t[field]);
}

function compileParagraph(team) {
  return [team.claimText, team.evidenceText, team.contextText].filter(Boolean).join(' ').trim();
}

function significantWords(text) {
  return new Set(
    (text || '').toLowerCase().match(/[a-z]{4,}/g)?.filter((w) => !STOPWORDS.has(w)) || []
  );
}

// Heuristic cohesion bonus (0-2): rewards a paragraph whose hand-off segments
// actually share subject matter, rather than three disconnected sentences.
function computeCohesionBonus(team) {
  const claimWords = significantWords(team.claimText);
  const evidenceWords = significantWords(team.evidenceText);
  const contextWords = significantWords(team.contextText);

  const overlap = (a, b) => {
    let count = 0;
    for (const w of a) if (b.has(w)) count += 1;
    return count;
  };

  const claimEvidenceOverlap = overlap(claimWords, evidenceWords) >= 2;
  const priorWords = new Set([...claimWords, ...evidenceWords]);
  const contextOverlap = overlap(priorWords, contextWords) >= 1;

  if (claimEvidenceOverlap && contextOverlap) return 2;
  if (claimEvidenceOverlap || contextOverlap) return 1;
  return 0;
}

function getResults(session) {
  const teams = Array.from(session.teams.values()).map((t) => ({
    id: t.id,
    members: t.members,
    claimText: t.claimText,
    evidenceText: t.evidenceText,
    contextText: t.contextText,
    score: t.score,
    maxScore: t.maxScore,
    breakdown: t.breakdown,
    cohesionBonus: t.cohesionBonus,
    totalScore: t.totalScore,
  })).sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0));
  return { teams };
}

module.exports = {
  createSession,
  getSession,
  removeSession,
  addPlayer,
  getTeamForStudent,
  getRoleForStudent,
  assignTeams,
  startClaim,
  submitClaim,
  startEvidence,
  submitEvidence,
  startContext,
  submitContext,
  allTeamsSubmitted,
  compileParagraph,
  computeCohesionBonus,
  getResults,
  generateRoomCode,
  CLAIM_MS,
  EVIDENCE_MS,
  CONTEXT_MS,
};
