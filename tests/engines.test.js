const test = require('node:test');
const assert = require('node:assert/strict');
const { runDiagnostic, scoreLevelSession, runBossFight } = require('../server/src/engines');
const { seedQuestions } = require('../server/src/seed');

test('diagnostic returns unlock order', () => {
  const out = runDiagnostic([{ zone: 'Zone 1', difficulty: 3, correct: true }], seedQuestions());
  assert.ok(Array.isArray(out.unlockOrder));
});

test('level scoring gives xp and coins', () => {
  const out = scoreLevelSession({ responses: [{correct:true}, {correct:false}] });
  assert.equal(out.xp, 10);
  assert.equal(out.coins, 2);
});

test('boss fight win threshold works', () => {
  const out = runBossFight({ responses: [{correct:true},{correct:true},{correct:false}] });
  assert.equal(out.won, false);
});
