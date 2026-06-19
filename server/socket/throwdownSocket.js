// Summit Write — "Thesis Throwdown" realtime socket handlers.
// Room flow: lobby -> writing (3 min) -> voting (30 sec, 4 anon theses) -> results.

const jwt = require('jsonwebtoken');
const db = require('../services/db');
const engine = require('../services/throwdownEngine');
const { scoreTheses } = require('../services/throwdown-grader');
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

module.exports = function (io) {
  io.on('connection', (socket) => {
    const { teacherToken } = socket.handshake.auth || {};

    // ── TEACHER ────────────────────────────────────────────────────────────────

    socket.on('tt:host_join', async ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });

      const userId = await getUserIdFromToken(teacherToken);
      if (!userId || userId !== session.teacherId) {
        return socket.emit('tt:error', { message: 'Unauthorized' });
      }

      session.teacherSocketId = socket.id;
      socket.join(roomCode);
      socket.emit('tt:lobby_update', { players: lobbyPlayers(session), status: session.status, prompt: session.prompt });
    });

    socket.on('tt:start_writing', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('tt:error', { message: 'Unauthorized' });
      if (session.status !== 'lobby') return;

      engine.startWriting(roomCode);
      io.to(roomCode).emit('tt:phase_writing', { prompt: session.prompt, endsAt: session.writingEndsAt });

      if (session.timer) clearTimeout(session.timer);
      session.timer = setTimeout(() => advanceToVoting(io, roomCode), engine.WRITING_MS);
    });

    socket.on('tt:start_voting', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('tt:error', { message: 'Unauthorized' });
      if (session.status !== 'writing') return;

      advanceToVoting(io, roomCode);
    });

    socket.on('tt:end_game', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('tt:error', { message: 'Unauthorized' });

      io.to(roomCode).emit('tt:ended', { roomCode });
      engine.removeSession(roomCode);
    });

    // ── STUDENT ────────────────────────────────────────────────────────────────

    socket.on('tt:join', ({ roomCode, name, studentId }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });

      const resolvedId = studentId || socket.id;
      const resolvedName = (name || 'Student').slice(0, 30);

      let player;
      try {
        player = engine.addPlayer(roomCode, resolvedId, resolvedName, socket.id);
      } catch (err) {
        return socket.emit('tt:error', { message: err.message });
      }

      socket.join(roomCode);

      const payload = { roomCode, status: session.status, players: lobbyPlayers(session), prompt: session.prompt };
      if (session.status === 'writing') payload.writingEndsAt = session.writingEndsAt;
      if (session.status === 'voting') {
        payload.votingEndsAt = session.votingEndsAt;
        payload.options = session.votingSet.map((o) => ({ key: o.key, text: o.text }));
        payload.alreadySubmitted = !!player.thesis;
        payload.alreadyVoted = player.votedFor;
      }
      socket.emit('tt:lobby_update', payload);

      socket.to(roomCode).emit('tt:player_joined', { id: resolvedId, name: resolvedName });
    });

    socket.on('tt:submit_thesis', ({ roomCode, text }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });
      if (session.status !== 'writing') return socket.emit('tt:error', { message: 'Writing phase is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('tt:error', { message: 'Player not in session' });

      try {
        engine.submitThesis(roomCode, studentId, text);
      } catch (err) {
        return socket.emit('tt:error', { message: err.message });
      }

      socket.emit('tt:submit_ack');
      const submittedCount = Array.from(session.players.values()).filter((p) => p.submittedAt).length;
      io.to(roomCode).emit('tt:submission_update', { submittedCount, total: session.players.size });

      if (engine.allSubmitted(session)) advanceToVoting(io, roomCode);
    });

    socket.on('tt:vote', ({ roomCode, choice }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tt:error', { message: 'Room not found' });
      if (session.status !== 'voting') return socket.emit('tt:error', { message: 'Voting phase is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('tt:error', { message: 'Player not in session' });

      try {
        engine.castVote(roomCode, studentId, choice);
      } catch (err) {
        return socket.emit('tt:error', { message: err.message });
      }

      socket.emit('tt:vote_ack', { choice });
      io.to(roomCode).emit('tt:vote_update', { tally: engine.getVoteTally(session) });

      if (engine.allVoted(session)) advanceToResults(io, roomCode);
    });
  });
};

function findStudentId(session, socketId) {
  for (const [sid, player] of session.players.entries()) {
    if (player.socketId === socketId) return sid;
  }
  return null;
}

function advanceToVoting(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'writing') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }

  engine.startVoting(roomCode);

  if (session.votingSet.length === 0) {
    // Nobody submitted a thesis — skip straight to (empty) results.
    return advanceToResults(io, roomCode);
  }

  io.to(roomCode).emit('tt:phase_voting', {
    options: session.votingSet.map((o) => ({ key: o.key, text: o.text })),
    endsAt: session.votingEndsAt,
  });

  session.timer = setTimeout(() => advanceToResults(io, roomCode), engine.VOTING_MS);
}

async function advanceToResults(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status === 'results' || session.status === 'ended') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }
  session.status = 'results';

  const tally = engine.getVoteTally(session);
  let scores = [];
  if (session.votingSet.length > 0) {
    scores = await scoreTheses(session.prompt.text, session.votingSet.map((o) => o.text));
  }

  const rankings = session.votingSet.map((o, i) => ({
    key: o.key,
    text: o.text,
    votes: tally[o.key] || 0,
    earned: scores[i]?.earned ?? false,
    feedback: scores[i]?.feedback ?? '',
    studentId: o.studentId,
  })).sort((a, b) => (b.earned - a.earned) || (b.votes - a.votes));

  const winner = rankings.find((r) => r.earned) || rankings[0] || null;

  // Award XP + badge to the round winner (if any thesis earned the point).
  if (winner?.earned && winner.studentId) {
    try {
      const award = await awardProgress(winner.studentId, { xpGain: 20, newBadges: ['thesis_champion'] });
      const winnerPlayer = session.players.get(winner.studentId);
      if (winnerPlayer?.socketId) {
        io.to(winnerPlayer.socketId).emit('tt:you_won', { award });
      }
    } catch (err) {
      console.error('throwdownSocket.advanceToResults award error:', err.message);
    }
  }

  io.to(roomCode).emit('tt:phase_results', {
    rankings: rankings.map(({ studentId, ...rest }) => rest),
    voteTally: tally,
    winnerKey: winner?.earned ? winner.key : null,
  });
}
