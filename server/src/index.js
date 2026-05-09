const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { seedQuestions } = require('./seed');
const { runDiagnostic, scoreLevelSession, runBossFight, weeklyInsights } = require('./engines');

const app = express();
app.use(express.json());
app.use(require('cors')());

const JWT_SECRET = process.env.JWT_SECRET || 'ascend-dev-secret-change-in-prod';

// ── In-memory user store (persists until server restart) ──────────────────────
// Maps username → { id, username, passwordHash, gameState }
const memUsers = new Map();
let userIdCounter = 1;

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const auth = req.header('authorization') || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Legacy shim — old routes used clerkAuth which trusted the raw token as userId
function clerkAuth(req, res, next) {
  const auth = req.header('authorization') || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
  } catch {
    req.user = { id: token || 'demo-user', userId: token || 'demo-user' };
  }
  next();
}

// ── Auth endpoints ─────────────────────────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  if (username.length < 3) return res.status(400).json({ error: 'username must be at least 3 characters' });
  if (password.length < 6) return res.status(400).json({ error: 'password must be at least 6 characters' });
  if (memUsers.has(username.toLowerCase())) return res.status(409).json({ error: 'username already taken' });

  const passwordHash = await bcrypt.hash(password, 10);
  const userId = `u${userIdCounter++}`;
  memUsers.set(username.toLowerCase(), { id: userId, username, passwordHash, gameState: null });

  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, userId, username });
});

app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const user = memUsers.get(username.toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid username or password' });

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return res.status(401).json({ error: 'Invalid username or password' });

  const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ token, userId: user.id, username: user.username, gameState: user.gameState });
});

app.get('/auth/me', requireAuth, (req, res) => {
  const user = [...memUsers.values()].find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ userId: user.id, username: user.username, gameState: user.gameState });
});

app.put('/progress', requireAuth, (req, res) => {
  const user = [...memUsers.values()].find(u => u.id === req.user.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  user.gameState = req.body.gameState || null;
  res.json({ ok: true });
});

// ── Game endpoints ─────────────────────────────────────────────────────────────
const questions = seedQuestions();

app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/diagnostic', clerkAuth, (req, res) => res.json(runDiagnostic(req.body.responses || [], questions)));
app.post('/level', clerkAuth, (req, res) => res.json(scoreLevelSession(req.body, questions)));
app.post('/boss', clerkAuth, (req, res) => res.json(runBossFight(req.body, questions)));
app.get('/insights/:userId', clerkAuth, (req, res) => res.json(weeklyInsights(req.params.userId)));
app.get('/store', clerkAuth, (_req, res) => res.json({ items: [{ id: 'skin_1', name: 'Chrononaut', coins: 800 }] }));
app.post('/stripe/checkout', clerkAuth, (_req, res) => res.json({ checkoutUrl: 'https://checkout.stripe.com/pay/demo' }));

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Ascend server on :${PORT}`));
}

module.exports = { app, clerkAuth };
