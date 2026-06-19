// Summit Write — "The Relay" realtime socket handlers.
// Room flow: lobby -> teams assigned -> claim (90s) -> evidence (2min) ->
// context (90s) -> grading -> results. Each team hands off one paragraph;
// only the player holding the active role for a stage may submit.

const jwt = require('jsonwebtoken');
const db = require('../services/db');
const engine = require('../services/relayEngine');
const { gradeEssay } = require('../services/write-grader');
const { awardProgress } = require('../services/sw-progress');

async function getUserIdFromToken(token) {
  if (!token) return null;
  const secrets = [process.env.CLERK_SECRET_KEY, process.env.JWT_SECRET].filter(Boolean);
  let payload = null;
  for (const secret of secrets) {
    try { payload = jwt.verify(token, secret); break; } catch (_) { /* try next secret */ }
  }
  if (!payload) return null;
  const clerkId = payload.sub || payload.id;
  if (!clerkId) return null;
  try {
    const { rows } = await db.query('SELECT id FROM users WHERE clerk_id=$1 LIMIT 1', [clerkId]);
    return rows[0]?.id || null;
  } catch (_) {
    return null;
  }
}

function lobbyPlayers(session) {
  return Array.from(session.players.values()).map((p) => ({ id: p.id, name: p.name }));
}

function sendYourRole(io, session, player) {
  if (!player?.socketId) return;
  const team = engine.getTeamForStudent(session, player.id);
  if (!team) return;
  const role = engine.getRoleForStudent(session, player.id);
  io.to(player.socketId).emit('rl:your_role', {
    teamId: team.id,
    role,
    teammates: team.members,
    claimText: team.claimText,
    evidenceText: team.evidenceText,
    contextText: team.contextText,
  });
}

function broadcastYourRoles(io, session) {
  for (const player of session.players.values()) sendYourRole(io, session, player);
}

module.exports = function (io) {
  io.on('connection', (socket) => {
    const { teacherToken } = socket.handshake.auth || {};

    // ── TEACHER ────────────────────────────────────────────────────────────────

    socket.on('rl:host_join', async ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });

      const userId = await getUserIdFromToken(teacherToken);
      if (!userId || userId !== session.teacherId) {
        return socket.emit('rl:error', { message: 'Unauthorized' });
      }

      session.teacherSocketId = socket.id;
      socket.join(roomCode);
      socket.emit('rl:lobby_update', { players: lobbyPlayers(session), status: session.status, prompt: session.prompt });
    });

    socket.on('rl:start_relay', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('rl:error', { message: 'Unauthorized' });
      if (session.status !== 'lobby') return;
      if (session.players.size < 2) return socket.emit('rl:error', { message: 'Need at least 2 students to form a team' });

      engine.assignTeams(roomCode);
      engine.startClaim(roomCode);

      io.to(roomCode).emit('rl:teams_assigned', {
        teams: Array.from(session.teams.values()).map((t) => ({ id: t.id, members: t.members })),
      });
      io.to(roomCode).emit('rl:phase_claim', { prompt: session.prompt, endsAt: session.stageEndsAt });
      broadcastYourRoles(io, session);

      if (session.timer) clearTimeout(session.timer);
      session.timer = setTimeout(() => advanceToEvidence(io, roomCode), engine.CLAIM_MS);
    });

    socket.on('rl:skip_stage', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('rl:error', { message: 'Unauthorized' });

      if (session.status === 'claim') advanceToEvidence(io, roomCode);
      else if (session.status === 'evidence') advanceToContext(io, roomCode);
      else if (session.status === 'context') advanceToGrading(io, roomCode);
    });

    socket.on('rl:end_game', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('rl:error', { message: 'Unauthorized' });

      io.to(roomCode).emit('rl:ended', { roomCode });
      engine.removeSession(roomCode);
    });

    // ── STUDENT ────────────────────────────────────────────────────────────────

    socket.on('rl:join', ({ roomCode, name, studentId }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });

      const resolvedId = studentId || socket.id;
      const resolvedName = (name || 'Student').slice(0, 30);

      let player;
      try {
        player = engine.addPlayer(roomCode, resolvedId, resolvedName, socket.id);
      } catch (err) {
        return socket.emit('rl:error', { message: err.message });
      }

      socket.join(roomCode);

      const payload = { roomCode, status: session.status, players: lobbyPlayers(session), prompt: session.prompt };
      socket.emit('rl:lobby_update', payload);

      if (session.status !== 'lobby' && player.teamId) {
        sendYourRole(io, session, player);
        if (session.status === 'results') {
          socket.emit('rl:phase_results', engine.getResults(session));
        } else {
          socket.emit(`rl:phase_${session.status}`, { endsAt: session.stageEndsAt, prompt: session.prompt });
        }
      }

      socket.to(roomCode).emit('rl:player_joined', { id: resolvedId, name: resolvedName });
    });

    socket.on('rl:submit_claim', ({ roomCode, text }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });
      if (session.status !== 'claim') return socket.emit('rl:error', { message: 'Claim stage is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('rl:error', { message: 'Player not in session' });
      if (engine.getRoleForStudent(session, studentId) !== 'claim') return socket.emit('rl:error', { message: 'You are not the Claim writer for your team' });

      try {
        engine.submitClaim(roomCode, studentId, text);
      } catch (err) {
        return socket.emit('rl:error', { message: err.message });
      }

      socket.emit('rl:submit_ack', { stage: 'claim' });
      const submittedCount = Array.from(session.teams.values()).filter((t) => t.claimSubmittedAt).length;
      io.to(roomCode).emit('rl:submission_update', { submittedCount, totalTeams: session.teams.size });

      if (engine.allTeamsSubmitted(session, 'claimSubmittedAt')) advanceToEvidence(io, roomCode);
    });

    socket.on('rl:submit_evidence', ({ roomCode, text }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });
      if (session.status !== 'evidence') return socket.emit('rl:error', { message: 'Evidence stage is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('rl:error', { message: 'Player not in session' });
      if (engine.getRoleForStudent(session, studentId) !== 'evidence') return socket.emit('rl:error', { message: 'You are not the Evidence writer for your team' });

      try {
        engine.submitEvidence(roomCode, studentId, text);
      } catch (err) {
        return socket.emit('rl:error', { message: err.message });
      }

      socket.emit('rl:submit_ack', { stage: 'evidence' });
      const submittedCount = Array.from(session.teams.values()).filter((t) => t.evidenceSubmittedAt).length;
      io.to(roomCode).emit('rl:submission_update', { submittedCount, totalTeams: session.teams.size });

      if (engine.allTeamsSubmitted(session, 'evidenceSubmittedAt')) advanceToContext(io, roomCode);
    });

    socket.on('rl:submit_context', ({ roomCode, text }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('rl:error', { message: 'Room not found' });
      if (session.status !== 'context') return socket.emit('rl:error', { message: 'Context stage is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('rl:error', { message: 'Player not in session' });
      if (engine.getRoleForStudent(session, studentId) !== 'context') return socket.emit('rl:error', { message: 'You are not the Context writer for your team' });

      try {
        engine.submitContext(roomCode, studentId, text);
      } catch (err) {
        return socket.emit('rl:error', { message: err.message });
      }

      socket.emit('rl:submit_ack', { stage: 'context' });
      const submittedCount = Array.from(session.teams.values()).filter((t) => t.contextSubmittedAt).length;
      io.to(roomCode).emit('rl:submission_update', { submittedCount, totalTeams: session.teams.size });

      if (engine.allTeamsSubmitted(session, 'contextSubmittedAt')) advanceToGrading(io, roomCode);
    });
  });
};

function findStudentId(session, socketId) {
  for (const [sid, player] of session.players.entries()) {
    if (player.socketId === socketId) return sid;
  }
  return null;
}

function advanceToEvidence(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'claim') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }

  engine.startEvidence(roomCode);
  io.to(roomCode).emit('rl:phase_evidence', { endsAt: session.stageEndsAt });
  broadcastYourRoles(io, session);

  session.timer = setTimeout(() => advanceToContext(io, roomCode), engine.EVIDENCE_MS);
}

function advanceToContext(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'evidence') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }

  engine.startContext(roomCode);
  io.to(roomCode).emit('rl:phase_context', { endsAt: session.stageEndsAt });
  broadcastYourRoles(io, session);

  session.timer = setTimeout(() => advanceToGrading(io, roomCode), engine.CONTEXT_MS);
}

async function advanceToGrading(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'context') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }
  session.status = 'grading';
  io.to(roomCode).emit('rl:phase_grading', {});

  await Promise.all(Array.from(session.teams.values()).map(async (team) => {
    const paragraph = engine.compileParagraph(team);
    const cohesionBonus = engine.computeCohesionBonus(team);
    team.cohesionBonus = cohesionBonus;
    if (!paragraph) {
      team.score = 0; team.maxScore = 6; team.breakdown = {}; team.totalScore = 0;
      return;
    }
    try {
      const result = await gradeEssay({ essayType: 'LEQ', prompt: session.prompt.text, essayText: paragraph });
      team.score = result.score;
      team.maxScore = result.maxScore;
      team.breakdown = result.breakdown;
      team.totalScore = result.score + cohesionBonus;
    } catch (err) {
      console.error(`relaySocket.advanceToGrading error (team=${team.id}):`, err.message);
      team.score = 0; team.maxScore = 6; team.breakdown = {}; team.totalScore = cohesionBonus;
    }
  }));

  session.status = 'results';
  const results = engine.getResults(session);

  const topScore = Math.max(...results.teams.map((t) => t.totalScore ?? 0), 0);
  for (const team of results.teams) {
    if (team.totalScore == null) continue;
    const isTop = topScore > 0 && team.totalScore === topScore;
    for (const member of team.members) {
      try {
        const xpGain = Math.max(5, Math.round((team.totalScore || 0) * 4));
        const award = await awardProgress(member.id, isTop ? { xpGain, newBadges: ['relay_captain'] } : { xpGain });
        const player = session.players.get(member.id);
        if (player?.socketId) io.to(player.socketId).emit('rl:your_award', { award, isTop });
      } catch (err) {
        console.error('relaySocket.advanceToGrading award error:', err.message);
      }
    }
  }

  io.to(roomCode).emit('rl:phase_results', results);
}
