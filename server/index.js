require('dotenv').config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const classRoutes = require('./routes/classes');
const questionRoutes = require('./routes/questions');
const sessionRoutes = require('./routes/sessions');
const paymentRoutes = require('./routes/payments');
const waitlistRoutes    = require('./routes/waitlist');
const progressRoutes    = require('./routes/progress');
const masteryRoutes     = require('./routes/mastery');
const leaderboardRoutes = require('./routes/leaderboard');
const friendsRoutes     = require('./routes/friends');
const economyRoutes     = require('./routes/economy');
const packsRoutes       = require('./routes/packs');
const questsRoutes      = require('./routes/quests');
const leaguesRoutes     = require('./routes/leagues');
const seasonRoutes      = require('./routes/season');
const minigameRoutes    = require('./routes/minigame');
const devRoutes         = require('./routes/dev');
const edumissionsRoutes = require('./routes/edumissions');
const summitwriteRoutes = require('./routes/summitwrite');
const writeCoursesRoutes = require('./routes/write-courses');
const writeGamesRoutes   = require('./routes/write-games');
const initGameSocket    = require('./socket/gameSocket');
const initThrowdownSocket = require('./socket/throwdownSocket');
const initTribunalSocket = require('./socket/tribunalSocket');
const initDb            = require('./services/initDb');

const app = express();
const server = http.createServer(app);

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        return cb(null, true);
      }
      // also allow Railway subdomains
      if (/\.railway\.app$/.test(origin) || /\.up\.railway\.app$/.test(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Body parsers ───────────────────────────────────────────────────────────────
// Raw body needed for Stripe webhooks — mount BEFORE express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '8mb' }));

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/api/users', authRoutes); // reuse auth router for /api/users/me/customization
app.use('/api/classes', classRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/waitlist',     waitlistRoutes);
app.use('/api/progress',    progressRoutes);
app.use('/api/mastery',     masteryRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/friends',     friendsRoutes);
app.use('/api/economy',     economyRoutes);
app.use('/api/packs',       packsRoutes);
app.use('/api/quests',      questsRoutes);
app.use('/api/leagues',     leaguesRoutes);
app.use('/api/season',      seasonRoutes);
app.use('/api/minigame',    minigameRoutes);
app.use('/api/dev',         devRoutes);
app.use('/api/edumissions', edumissionsRoutes);
app.use('/api/write/courses', writeCoursesRoutes);
app.use('/api/write/games',   writeGamesRoutes);
app.use('/api/write',       summitwriteRoutes);

// ── Serve client build ────────────────────────────────────────────────────────
// Always serve if dist exists (Railway doesn't set NODE_ENV=production by default)
const clientDist = path.join(__dirname, '..', 'client', 'dist');
const fs = require('fs');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  app.get('/', (_req, res) => res.json({ ok: true, message: 'Summit API — client not built' }));
}

// ── Global error handler ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Socket.io ──────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.some((o) => origin.startsWith(o))) {
        return cb(null, true);
      }
      if (/\.railway\.app$/.test(origin) || /\.up\.railway\.app$/.test(origin)) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

initGameSocket(io);
initThrowdownSocket(io);
initTribunalSocket(io);

// ── Start ──────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

async function start() {
  // Init DB schema + seed question sets (safe to run on every boot — all idempotent)
  await initDb();

  // Seed questions if DB is fresh
  try {
    const db = require('./services/db');
    const { rows } = await db.query('SELECT COUNT(*) AS cnt FROM questions');
    if (parseInt(rows[0].cnt, 10) === 0) {
      console.log('🌱 Empty questions table — seeding question banks...');
      const { execSync } = require('child_process');
      execSync('node ' + path.join(__dirname, 'scripts/seed-questions.js'), {
        stdio: 'inherit',
        env: process.env,
      });
    } else {
      console.log(`✓ Questions table has ${rows[0].cnt} questions`);
    }
  } catch (e) {
    console.warn('Seed check skipped:', e.message);
  }

  server.listen(PORT, () => {
    console.log(`Summit server listening on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
}

start();

module.exports = { app, server };
