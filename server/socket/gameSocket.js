const gameEngine = require('../services/gameEngine');

// Interval handles per game code for classmates:positions broadcasts
const positionIntervals = new Map();

module.exports = function (io) {
  io.on('connection', (socket) => {
    const { teacherToken, studentId, studentName } = socket.handshake.auth;

    // ─── TEACHER EVENTS ────────────────────────────────────────────────────────

    socket.on('teacher:start_game', ({ gameCode }) => {
      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      if (!teacherToken) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      session.status = 'active';
      socket.join(gameCode);
      io.to(gameCode).emit('game:started', {
        gameCode,
        questionCount: session.questions.length,
        status: 'active',
      });

      // Start broadcasting classmates positions every 3 seconds
      if (!positionIntervals.has(gameCode)) {
        const interval = setInterval(() => {
          const snap = gameEngine.getClassSnapshot(gameCode);
          io.to(gameCode).emit('classmates:positions', snap);
        }, 3000);
        positionIntervals.set(gameCode, interval);
      }
    });

    socket.on('teacher:pause_game', ({ gameCode }) => {
      if (!teacherToken) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'paused';
      io.to(gameCode).emit('game:paused', { gameCode });
    });

    socket.on('teacher:resume_game', ({ gameCode }) => {
      if (!teacherToken) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'active';
      io.to(gameCode).emit('game:resumed', { gameCode });
    });

    socket.on('teacher:end_game', ({ gameCode }) => {
      if (!teacherToken) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'ended';

      const results = gameEngine.getClassSnapshot(gameCode);
      const fullResults = Array.from(session.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        xp: p.xp,
        elevation: p.elevation,
        masteredCount: p.masteredIds.length,
        totalCount: session.questions.length,
        streak: p.streakBest,
        summited: p.summited,
      }));

      io.to(gameCode).emit('game:ended', {
        gameCode,
        results: fullResults,
      });

      // Clean up position interval
      if (positionIntervals.has(gameCode)) {
        clearInterval(positionIntervals.get(gameCode));
        positionIntervals.delete(gameCode);
      }
    });

    socket.on('teacher:review_question', ({ gameCode, questionId }) => {
      if (!teacherToken) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Session not found' });
        return;
      }

      session.status = 'paused';

      const question = session.questions.find((q) => q.id === questionId);
      if (!question) {
        socket.emit('error', { message: 'Question not found' });
        return;
      }

      io.to(gameCode).emit('question:review', {
        gameCode,
        question,
      });
    });

    // ─── STUDENT EVENTS ────────────────────────────────────────────────────────

    socket.on('student:join', ({ gameCode, name, studentId: sid }) => {
      const resolvedStudentId = sid || socket.id;
      const resolvedName = name || `Student ${resolvedStudentId.slice(0, 6)}`;

      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      let playerState;
      try {
        playerState = gameEngine.addPlayer(gameCode, resolvedStudentId, resolvedName, socket.id);
      } catch (err) {
        socket.emit('error', { message: err.message });
        return;
      }

      socket.join(gameCode);

      // Send current player list to the joining student
      const allPlayers = Array.from(session.players.values()).map((p) => ({
        id: p.id,
        name: p.name,
        elevation: p.elevation,
        summited: p.summited,
      }));

      socket.emit('game:lobby', {
        gameCode,
        status: session.status,
        players: allPlayers,
        questionCount: session.questions.length,
      });

      // If game is already active, send first question
      if (session.status === 'active') {
        const nextQ = gameEngine.getNextQuestion(session, playerState);
        if (nextQ) {
          socket.emit('question:next', {
            question: sanitizeQuestion(nextQ, 0),
          });
        }
      }

      // Notify teacher
      socket.to(gameCode).emit('student:joined', {
        id: resolvedStudentId,
        name: resolvedName,
        elevation: 0,
        summited: false,
      });
    });

    socket.on('student:answer', ({ gameCode, questionId, selected, timeTakenMs }) => {
      const session = gameEngine.getSession(gameCode);
      if (!session) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      if (session.status === 'paused') {
        socket.emit('error', { message: 'Game is paused' });
        return;
      }

      // Find the student's ID from socket
      let studentIdentity = null;
      for (const [sid, player] of session.players.entries()) {
        if (player.socketId === socket.id) {
          studentIdentity = sid;
          break;
        }
      }

      if (!studentIdentity) {
        socket.emit('error', { message: 'Player not in session' });
        return;
      }

      let result;
      try {
        result = gameEngine.processAnswer(gameCode, studentIdentity, questionId, selected);
      } catch (err) {
        socket.emit('error', { message: err.message });
        return;
      }

      socket.emit('answer:result', {
        correct: result.correct,
        explanation: result.explanation,
        hint: result.hint,
        xpGained: result.xpGained,
        totalXp: result.totalXp,
        elevation: result.elevation,
        streak: result.streak,
        mastered: result.mastered,
        summited: result.summited,
        masteredCount: result.masteredCount,
        totalCount: result.totalCount,
        nextQuestion: result.nextQuestion,
      });

      // Notify teacher
      socket.to(gameCode).emit('student:answered', {
        studentId: studentIdentity,
        questionId,
        correct: result.correct,
        elevation: result.elevation,
        xp: result.totalXp,
        summited: result.summited,
      });

      // If summited, broadcast to room
      if (result.summited) {
        io.to(gameCode).emit('student:summited', {
          studentId: studentIdentity,
          name: session.players.get(studentIdentity)?.name,
        });
      }
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────────────────

    socket.on('disconnect', () => {
      // Mark player socket as null (keep state for potential reconnect)
      for (const [gameCode, session] of Object.entries ? [] : []) {
        // no-op: sessions are in a Map, handled by reconnect logic in addPlayer
      }
    });
  });
};

/**
 * Strip sensitive fields from question before sending to student.
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
