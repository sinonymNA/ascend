// Summit Write — "The Tribunal" realtime socket handlers.
// Room flow: lobby -> writing (one SAQ, all 3 parts) -> judging (row-by-row
// yes/no rubric votes on 3 anonymous responses) -> results.

const jwt = require('jsonwebtoken');
const db = require('../services/db');
const engine = require('../services/tribunalEngine');
const { gradeEssay, RUBRICS } = require('../services/write-grader');
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

function criterionLabel(key) {
  return RUBRICS.SAQ.criteria[key]?.label || key;
}

function promptText(prompt) {
  return `STIMULUS: ${prompt.stimulus}\n\n${prompt.text}`;
}

function roundPayload(session) {
  const round = engine.getCurrentRound(session);
  if (!round) return null;
  return {
    ...round,
    criterionLabel: criterionLabel(round.criterionKey),
    endsAt: session.roundEndsAt,
  };
}

module.exports = function (io) {
  io.on('connection', (socket) => {
    const { teacherToken } = socket.handshake.auth || {};

    // ── TEACHER ────────────────────────────────────────────────────────────────

    socket.on('tb:host_join', async ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });

      const userId = await getUserIdFromToken(teacherToken);
      if (!userId || userId !== session.teacherId) {
        return socket.emit('tb:error', { message: 'Unauthorized' });
      }

      session.teacherSocketId = socket.id;
      socket.join(roomCode);
      socket.emit('tb:lobby_update', { players: lobbyPlayers(session), status: session.status, prompt: session.prompt });
    });

    socket.on('tb:start_writing', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('tb:error', { message: 'Unauthorized' });
      if (session.status !== 'lobby') return;

      engine.startWriting(roomCode);
      io.to(roomCode).emit('tb:phase_writing', { prompt: session.prompt, endsAt: session.writingEndsAt });

      if (session.timer) clearTimeout(session.timer);
      session.timer = setTimeout(() => advanceToJudging(io, roomCode), engine.WRITING_MS);
    });

    socket.on('tb:start_judging', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('tb:error', { message: 'Unauthorized' });
      if (session.status !== 'writing') return;

      advanceToJudging(io, roomCode);
    });

    socket.on('tb:end_game', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('tb:error', { message: 'Unauthorized' });

      io.to(roomCode).emit('tb:ended', { roomCode });
      engine.removeSession(roomCode);
    });

    // ── STUDENT ────────────────────────────────────────────────────────────────

    socket.on('tb:join', ({ roomCode, name, studentId }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });

      const resolvedId = studentId || socket.id;
      const resolvedName = (name || 'Student').slice(0, 30);

      let player;
      try {
        player = engine.addPlayer(roomCode, resolvedId, resolvedName, socket.id);
      } catch (err) {
        return socket.emit('tb:error', { message: err.message });
      }

      socket.join(roomCode);

      const payload = { roomCode, status: session.status, players: lobbyPlayers(session), prompt: session.prompt };
      if (session.status === 'writing') {
        payload.writingEndsAt = session.writingEndsAt;
        payload.alreadySubmitted = !!player.submittedAt;
      }
      if (session.status === 'judging') {
        payload.round = roundPayload(session);
      }
      socket.emit('tb:lobby_update', payload);

      socket.to(roomCode).emit('tb:player_joined', { id: resolvedId, name: resolvedName });
    });

    socket.on('tb:submit_answer', ({ roomCode, text }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });
      if (session.status !== 'writing') return socket.emit('tb:error', { message: 'Writing phase is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('tb:error', { message: 'Player not in session' });

      try {
        engine.submitAnswer(roomCode, studentId, text);
      } catch (err) {
        return socket.emit('tb:error', { message: err.message });
      }

      socket.emit('tb:submit_ack');
      const submittedCount = Array.from(session.players.values()).filter((p) => p.submittedAt).length;
      io.to(roomCode).emit('tb:submission_update', { submittedCount, total: session.players.size });

      if (engine.allSubmitted(session)) advanceToJudging(io, roomCode);
    });

    socket.on('tb:vote_round', ({ roomCode, vote }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('tb:error', { message: 'Room not found' });
      if (session.status !== 'judging') return socket.emit('tb:error', { message: 'Judging phase is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('tb:error', { message: 'Player not in session' });

      try {
        engine.castJudgeVote(roomCode, studentId, !!vote);
      } catch (err) {
        return socket.emit('tb:error', { message: err.message });
      }

      socket.emit('tb:vote_ack', { vote: !!vote });
      io.to(roomCode).emit('tb:vote_update', { tally: engine.getRoundTally(session) });

      if (engine.allVotedRound(session)) resolveAndAdvance(io, roomCode);
    });
  });
};

function findStudentId(session, socketId) {
  for (const [sid, player] of session.players.entries()) {
    if (player.socketId === socketId) return sid;
  }
  return null;
}

async function advanceToJudging(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'writing') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }

  const picked = engine.pickResponses(session);
  if (picked.length === 0) {
    io.to(roomCode).emit('tb:phase_results', { responseScores: [], leaderboard: [] });
    session.status = 'results';
    return;
  }

  const graded = await Promise.all(picked.map(async (r) => {
    const result = await gradeEssay({ essayType: engine.ESSAY_TYPE, prompt: promptText(session.prompt), essayText: r.text });
    return { ...r, breakdown: result.breakdown, score: result.score, maxScore: result.maxScore };
  }));

  engine.startJudging(roomCode, graded);
  io.to(roomCode).emit('tb:phase_judging', roundPayload(session));
  session.timer = setTimeout(() => resolveAndAdvance(io, roomCode), engine.JUDGING_MS);
}

async function resolveAndAdvance(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'judging') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }

  const reveal = engine.resolveRound(session);
  if (!reveal) return;

  io.to(roomCode).emit('tb:round_reveal', {
    criterionKey: reveal.criterionKey,
    criterionLabel: criterionLabel(reveal.criterionKey),
    responseKey: reveal.responseKey,
    responseText: reveal.responseText,
    aiEarned: reveal.aiEarned,
    aiFeedback: reveal.aiFeedback,
    tally: reveal.tally,
    index: reveal.index,
    total: reveal.total,
  });

  for (const studentId of reveal.matchedVoters) {
    try {
      await awardProgress(studentId, { xpGain: 5 });
    } catch (err) {
      console.error('tribunalSocket.resolveAndAdvance award error:', err.message);
    }
  }

  const next = engine.advanceRound(session);
  if (next) {
    io.to(roomCode).emit('tb:phase_judging', roundPayload(session));
    session.timer = setTimeout(() => resolveAndAdvance(io, roomCode), engine.JUDGING_MS);
  } else {
    await finalizeResults(io, roomCode);
  }
}

async function finalizeResults(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session) return;

  const results = engine.getResults(session);
  const top = results.leaderboard[0];
  if (top && top.matches > 0) {
    try {
      const award = await awardProgress(top.id, { xpGain: 25, newBadges: ['tribunal_judge'] });
      const topPlayer = session.players.get(top.id);
      if (topPlayer?.socketId) io.to(topPlayer.socketId).emit('tb:you_won', { award });
    } catch (err) {
      console.error('tribunalSocket.finalizeResults award error:', err.message);
    }
  }

  io.to(roomCode).emit('tb:phase_results', results);
}
