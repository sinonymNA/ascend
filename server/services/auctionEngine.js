// Summit Write — "Evidence Auction" in-memory game session engine.
// Lobby -> bidding (sealed-bid on 12 evidence cards) -> justify (explain why
// won cards support the thesis) -> grading -> results. Teams start with 100
// coins, spend them bidding, and earn coins back for strong AI-scored
// evidence-to-thesis connections.

const ROOM_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const BIDDING_MS = 90 * 1000;
const JUSTIFY_MS = 90 * 1000;
const STARTING_COINS = 100;
const CARD_COUNT = 12;
const COINS_FOR_SCORE = [0, 5, 15, 30]; // indexed by AI score 0-3

const sessions = new Map();

function generateRoomCode() {
  let code = '';
  for (let i = 0; i < 5; i++) code += ROOM_CHARS[Math.floor(Math.random() * ROOM_CHARS.length)];
  return code;
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function createSession(teacherId, promptEntry) {
  let code;
  do { code = generateRoomCode(); } while (sessions.has(code));

  const cards = shuffle(promptEntry.cards).slice(0, CARD_COUNT).map((text, index) => ({ index, text }));

  const session = {
    code,
    teacherId,
    teacherSocketId: null,
    thesis: { id: promptEntry.id, topic: promptEntry.topic, text: promptEntry.thesis },
    cards,
    status: 'lobby', // lobby | bidding | justify | grading | results
    players: new Map(), // studentId -> { id, name, socketId, teamId }
    teams: new Map(), // teamId -> team state
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

// Round-robin into ~3-person teams (2-4 depending on class size).
function assignTeams(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');

  const players = shuffle(Array.from(session.players.values()));
  const teamCount = Math.max(1, Math.round(players.length / 3));
  session.teams = new Map();

  const groups = Array.from({ length: teamCount }, () => []);
  players.forEach((p, i) => groups[i % teamCount].push(p));

  groups.forEach((group, i) => {
    const teamId = `team-${i + 1}`;
    const members = group.map((p) => {
      p.teamId = teamId;
      return { id: p.id, name: p.name };
    });
    session.teams.set(teamId, {
      id: teamId,
      members,
      coins: STARTING_COINS,
      bids: null, // cardIndex -> amount (sealed until resolved)
      bidsSubmittedAt: null,
      wonCards: [], // card indices
      justifications: {}, // cardIndex -> text
      scores: {}, // cardIndex -> { score, specific, relevant, feedback }
      coinsEarned: 0,
      finalCoins: null,
    });
  });

  return session.teams;
}

function startBidding(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.status = 'bidding';
  session.stageEndsAt = Date.now() + BIDDING_MS;
  return session;
}

function submitBid(code, studentId, bids) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const team = getTeamForStudent(session, studentId);
  if (!team) throw new Error('You are not on a team');

  const cleaned = {};
  let total = 0;
  for (const [key, amount] of Object.entries(bids || {})) {
    const idx = parseInt(key, 10);
    const amt = Math.max(0, Math.round(Number(amount) || 0));
    if (idx < 0 || idx >= session.cards.length || amt <= 0) continue;
    cleaned[idx] = amt;
    total += amt;
  }
  if (total > team.coins) throw new Error(`Total bids (${total}) exceed your team's ${team.coins} coins`);

  team.bids = cleaned;
  team.bidsSubmittedAt = Date.now();
  return team;
}

function allTeamsBid(session) {
  if (session.teams.size === 0) return false;
  return Array.from(session.teams.values()).every((t) => t.bidsSubmittedAt);
}

// First-price sealed-bid resolution: highest bidder per card wins and pays
// their own bid; ties broken randomly. Unbid cards go unclaimed.
function resolveAuction(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');

  for (const card of session.cards) {
    let topAmount = 0;
    let candidates = [];
    for (const team of session.teams.values()) {
      const amt = team.bids?.[card.index] || 0;
      if (amt > topAmount) { topAmount = amt; candidates = [team]; }
      else if (amt === topAmount && amt > 0) candidates.push(team);
    }
    if (topAmount <= 0 || candidates.length === 0) continue;
    const winner = candidates[Math.floor(Math.random() * candidates.length)];
    winner.coins -= topAmount;
    winner.wonCards.push(card.index);
  }

  return session.teams;
}

function startJustify(code) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  session.status = 'justify';
  session.stageEndsAt = Date.now() + JUSTIFY_MS;
  return session;
}

function submitJustification(code, studentId, cardIndex, text) {
  const session = sessions.get(code);
  if (!session) throw new Error('Session not found');
  const team = getTeamForStudent(session, studentId);
  if (!team) throw new Error('You are not on a team');
  if (!team.wonCards.includes(cardIndex)) throw new Error('Your team did not win that card');

  team.justifications[cardIndex] = (text || '').slice(0, 300).trim();
  return team;
}

function allCardsJustified(session) {
  if (session.teams.size === 0) return false;
  return Array.from(session.teams.values()).every(
    (t) => t.wonCards.every((idx) => (t.justifications[idx] || '').length > 0)
  );
}

function applyScore(team, cardIndex, result) {
  team.scores[cardIndex] = result;
  team.coinsEarned += COINS_FOR_SCORE[result.score] || 0;
}

function finalizeCoins(session) {
  for (const team of session.teams.values()) {
    team.finalCoins = team.coins + team.coinsEarned;
  }
}

function getResults(session) {
  const teams = Array.from(session.teams.values()).map((t) => ({
    id: t.id,
    members: t.members,
    coins: t.coins,
    wonCards: t.wonCards,
    justifications: t.justifications,
    scores: t.scores,
    coinsEarned: t.coinsEarned,
    finalCoins: t.finalCoins,
  })).sort((a, b) => (b.finalCoins ?? 0) - (a.finalCoins ?? 0));
  return { teams, cards: session.cards, thesis: session.thesis };
}

module.exports = {
  createSession,
  getSession,
  removeSession,
  addPlayer,
  getTeamForStudent,
  assignTeams,
  startBidding,
  submitBid,
  allTeamsBid,
  resolveAuction,
  startJustify,
  submitJustification,
  allCardsJustified,
  applyScore,
  finalizeCoins,
  getResults,
  generateRoomCode,
  BIDDING_MS,
  JUSTIFY_MS,
  STARTING_COINS,
  CARD_COUNT,
};
