// Summit Write — "Evidence Auction" realtime socket handlers.
// Room flow: lobby -> bidding (90s sealed-bid on 12 cards) -> auction
// resolves -> justify (90s, explain won cards) -> grading -> results.

const jwt = require('jsonwebtoken');
const db = require('../services/db');
const engine = require('../services/auctionEngine');
const { evaluateEvidenceConnection } = require('../services/write-grader');
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

function teamSummaries(session) {
  return Array.from(session.teams.values()).map((t) => ({ id: t.id, members: t.members, coins: t.coins }));
}

function auctionResolvedPayload(session) {
  const results = [];
  for (const team of session.teams.values()) {
    for (const idx of team.wonCards) {
      results.push({ cardIndex: idx, winnerTeamId: team.id, amount: team.bids?.[idx] || 0 });
    }
  }
  return {
    won: results,
    teams: Array.from(session.teams.values()).map((t) => ({ id: t.id, coins: t.coins, wonCards: t.wonCards })),
  };
}

function justifyProgress(session) {
  const teams = Array.from(session.teams.values());
  const completed = teams.filter((t) => t.wonCards.every((idx) => (t.justifications[idx] || '').length > 0)).length;
  return { completedTeams: completed, totalTeams: teams.length };
}

function findStudentId(session, socketId) {
  for (const [sid, player] of session.players.entries()) {
    if (player.socketId === socketId) return sid;
  }
  return null;
}

module.exports = function (io) {
  io.on('connection', (socket) => {
    const { teacherToken } = socket.handshake.auth || {};

    // ── TEACHER ────────────────────────────────────────────────────────────────

    socket.on('ea:host_join', async ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });

      const userId = await getUserIdFromToken(teacherToken);
      if (!userId || userId !== session.teacherId) {
        return socket.emit('ea:error', { message: 'Unauthorized' });
      }

      session.teacherSocketId = socket.id;
      socket.join(roomCode);
      socket.emit('ea:lobby_update', { players: lobbyPlayers(session), status: session.status, thesis: session.thesis });
    });

    socket.on('ea:start_auction', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('ea:error', { message: 'Unauthorized' });
      if (session.status !== 'lobby') return;
      if (session.players.size < 2) return socket.emit('ea:error', { message: 'Need at least 2 students to form a team' });

      engine.assignTeams(roomCode);
      engine.startBidding(roomCode);

      io.to(roomCode).emit('ea:teams_assigned', { teams: teamSummaries(session) });
      io.to(roomCode).emit('ea:phase_bidding', {
        thesis: session.thesis, cards: session.cards, endsAt: session.stageEndsAt, startingCoins: engine.STARTING_COINS,
      });

      if (session.timer) clearTimeout(session.timer);
      session.timer = setTimeout(() => advanceToJustify(io, roomCode), engine.BIDDING_MS);
    });

    socket.on('ea:skip_stage', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('ea:error', { message: 'Unauthorized' });

      if (session.status === 'bidding') advanceToJustify(io, roomCode);
      else if (session.status === 'justify') advanceToGrading(io, roomCode);
    });

    socket.on('ea:end_game', ({ roomCode }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });
      if (socket.id !== session.teacherSocketId) return socket.emit('ea:error', { message: 'Unauthorized' });

      io.to(roomCode).emit('ea:ended', { roomCode });
      engine.removeSession(roomCode);
    });

    // ── STUDENT ────────────────────────────────────────────────────────────────

    socket.on('ea:join', ({ roomCode, name, studentId }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });

      const resolvedId = studentId || socket.id;
      const resolvedName = (name || 'Student').slice(0, 30);

      let player;
      try {
        player = engine.addPlayer(roomCode, resolvedId, resolvedName, socket.id);
      } catch (err) {
        return socket.emit('ea:error', { message: err.message });
      }

      socket.join(roomCode);

      socket.emit('ea:lobby_update', { roomCode, status: session.status, players: lobbyPlayers(session), thesis: session.thesis });

      if (session.status !== 'lobby' && player.teamId) {
        const team = engine.getTeamForStudent(session, resolvedId);
        if (session.status === 'results') {
          socket.emit('ea:phase_results', engine.getResults(session));
        } else if (session.status === 'justify') {
          socket.emit('ea:phase_justify', {
            endsAt: session.stageEndsAt, thesis: session.thesis, cards: session.cards,
            wonCards: team?.wonCards || [], justifications: team?.justifications || {},
          });
        } else {
          socket.emit('ea:phase_bidding', {
            thesis: session.thesis, cards: session.cards, endsAt: session.stageEndsAt, startingCoins: engine.STARTING_COINS, coins: team?.coins,
          });
        }
      }

      socket.to(roomCode).emit('ea:player_joined', { id: resolvedId, name: resolvedName });
    });

    socket.on('ea:submit_bid', ({ roomCode, bids }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });
      if (session.status !== 'bidding') return socket.emit('ea:error', { message: 'Bidding is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('ea:error', { message: 'Player not in session' });

      try {
        engine.submitBid(roomCode, studentId, bids);
      } catch (err) {
        return socket.emit('ea:error', { message: err.message });
      }

      socket.emit('ea:submit_ack', { stage: 'bidding' });
      const bidCount = Array.from(session.teams.values()).filter((t) => t.bidsSubmittedAt).length;
      io.to(roomCode).emit('ea:submission_update', { submittedCount: bidCount, totalTeams: session.teams.size });

      if (engine.allTeamsBid(session)) advanceToJustify(io, roomCode);
    });

    socket.on('ea:submit_justification', ({ roomCode, cardIndex, text }) => {
      const session = engine.getSession(roomCode);
      if (!session) return socket.emit('ea:error', { message: 'Room not found' });
      if (session.status !== 'justify') return socket.emit('ea:error', { message: 'Justification stage is not active' });

      const studentId = findStudentId(session, socket.id);
      if (!studentId) return socket.emit('ea:error', { message: 'Player not in session' });

      try {
        engine.submitJustification(roomCode, studentId, cardIndex, text);
      } catch (err) {
        return socket.emit('ea:error', { message: err.message });
      }

      socket.emit('ea:submit_ack', { stage: 'justify', cardIndex });
      io.to(roomCode).emit('ea:justify_progress', justifyProgress(session));

      if (engine.allCardsJustified(session)) advanceToGrading(io, roomCode);
    });
  });
};

function advanceToJustify(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'bidding') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }

  engine.resolveAuction(roomCode);
  io.to(roomCode).emit('ea:auction_resolved', auctionResolvedPayload(session));

  engine.startJustify(roomCode);
  io.to(roomCode).emit('ea:phase_justify', { endsAt: session.stageEndsAt, thesis: session.thesis, cards: session.cards });

  // A team with zero won cards has nothing to justify — if every team is in
  // that state, skip straight to grading instead of waiting on the timer.
  if (engine.allCardsJustified(session)) {
    advanceToGrading(io, roomCode);
    return;
  }

  session.timer = setTimeout(() => advanceToGrading(io, roomCode), engine.JUSTIFY_MS);
}

async function advanceToGrading(io, roomCode) {
  const session = engine.getSession(roomCode);
  if (!session || session.status !== 'justify') return;
  if (session.timer) { clearTimeout(session.timer); session.timer = null; }
  session.status = 'grading';
  io.to(roomCode).emit('ea:phase_grading', {});

  await Promise.all(Array.from(session.teams.values()).flatMap((team) =>
    team.wonCards.map(async (cardIndex) => {
      const card = session.cards[cardIndex];
      const justification = team.justifications[cardIndex] || '';
      try {
        const result = await evaluateEvidenceConnection({ thesis: session.thesis.text, evidenceText: card.text, justification });
        engine.applyScore(team, cardIndex, result);
      } catch (err) {
        console.error(`auctionSocket.advanceToGrading error (team=${team.id}, card=${cardIndex}):`, err.message);
        engine.applyScore(team, cardIndex, { score: 0, specific: false, relevant: false, feedback: 'Could not be scored.' });
      }
    })
  ));

  engine.finalizeCoins(session);
  session.status = 'results';
  const results = engine.getResults(session);

  const topCoins = Math.max(...results.teams.map((t) => t.finalCoins ?? 0), 0);
  for (const team of results.teams) {
    if (team.finalCoins == null) continue;
    const isTop = topCoins > 0 && team.finalCoins === topCoins;
    for (const member of team.members) {
      try {
        const xpGain = Math.max(5, Math.round(team.finalCoins / 5));
        const award = await awardProgress(member.id, isTop ? { xpGain, newBadges: ['auction_baron'] } : { xpGain });
        const player = session.players.get(member.id);
        if (player?.socketId) io.to(player.socketId).emit('ea:your_award', { award, isTop });
      } catch (err) {
        console.error('auctionSocket.advanceToGrading award error:', err.message);
      }
    }
  }

  io.to(roomCode).emit('ea:phase_results', results);
}
