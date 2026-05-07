function runDiagnostic(responses, questions) {
  const byZone = new Map();
  for (const q of questions) byZone.set(q.zone, { attempted: 0, correct: 0, difficultyScore: 0, diffTotal: 0 });
  for (const r of responses) {
    const row = byZone.get(r.zone); if (!row) continue;
    row.attempted += 1; row.diffTotal += r.difficulty || 1;
    if (r.correct) { row.correct += 1; row.difficultyScore += r.difficulty || 1; }
  }
  const zones = [...byZone.entries()].map(([zone, v]) => {
    const acc = v.attempted ? v.correct / v.attempted : 0;
    const diff = v.diffTotal ? v.difficultyScore / v.diffTotal : 0;
    const mastery = 0.55 * acc + 0.30 * diff + 0.15 * 0.7;
    return { zone, mastery: Number(mastery.toFixed(2)) };
  }).sort((a,b)=>b.mastery-a.mastery);
  return { zones, unlockOrder: zones.map(z=>z.zone) };
}

function scoreLevelSession({ responses = [] }) {
  const correct = responses.filter(r => r.correct).length;
  const xp = correct * 10;
  const coins = correct * 2;
  return { correct, total: responses.length, xp, coins, reviewInjectionRate: 0.2 };
}

function runBossFight({ responses = [] }) {
  const correct = responses.filter(r => r.correct).length;
  const won = responses.length > 0 && correct / responses.length >= 0.7;
  return { won, correct, total: responses.length, rewards: won ? { xp: 250, title: 'Zone Conqueror' } : { xp: 50 } };
}

function weeklyInsights(userId) {
  return { userId, streakDays: 5, studyMinutes: 132, recommendation: 'Focus on Zone 5 and practice causation prompts.' };
}

module.exports = { runDiagnostic, scoreLevelSession, runBossFight, weeklyInsights };
