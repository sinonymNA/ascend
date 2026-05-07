const express = require('express');
const { seedQuestions } = require('./seed');
const { runDiagnostic, scoreLevelSession, runBossFight, weeklyInsights } = require('./engines');

const app = express();
app.use(express.json());

function clerkAuth(req, res, next) {
  const auth = req.header('authorization') || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  req.user = { id: auth.slice(7) || 'demo-user' };
  next();
}

const questions = seedQuestions();

app.get('/health', (_req, res) => res.json({ ok: true }));
app.post('/diagnostic', clerkAuth, (req, res) => res.json(runDiagnostic(req.body.responses || [], questions)));
app.post('/level', clerkAuth, (req, res) => res.json(scoreLevelSession(req.body, questions)));
app.post('/boss', clerkAuth, (req, res) => res.json(runBossFight(req.body, questions)));
app.get('/insights/:userId', clerkAuth, (req, res) => res.json(weeklyInsights(req.params.userId)));
app.get('/store', clerkAuth, (_req, res) => res.json({ items:[{id:'skin_1',name:'Chrononaut',coins:800}] }));
app.post('/stripe/checkout', clerkAuth, (_req, res) => res.json({ checkoutUrl: 'https://checkout.stripe.com/pay/demo' }));

if (require.main === module) {
  app.listen(3000, () => console.log('Ascend server on :3000'));
}

module.exports = { app, clerkAuth };
