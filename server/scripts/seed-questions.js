// node server/scripts/seed-questions.js
require('dotenv').config();
const db = require('../services/db');

const dataFiles = [
  '../data/sat_math',
  '../data/sat_rw',
  '../data/act_math',
  '../data/act_english',
  '../data/act_reading',
  '../data/act_science',
];

async function seed() {
  const sets = [];
  for (const f of dataFiles) {
    try {
      sets.push(require(f));
    } catch (e) {
      console.warn(`Skipping ${f}: ${e.message}`);
    }
  }

  if (!sets.length) {
    console.error('No data files found. Run question bank generation first.');
    process.exit(1);
  }

  for (const { setId, questions } of sets) {
    if (!Array.isArray(questions) || !questions.length) {
      console.warn(`Skipping set ${setId}: no questions`);
      continue;
    }

    let inserted = 0;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const result = await db.query(
        `INSERT INTO questions
           (set_id, question, option_a, option_b, option_c, option_d,
            correct, explanation, difficulty, tags, order_index)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT DO NOTHING`,
        [
          setId,
          q.question,
          q.options?.A || q.option_a,
          q.options?.B || q.option_b,
          q.options?.C || q.option_c,
          q.options?.D || q.option_d,
          q.correct,
          q.explanation || null,
          q.difficulty || 1,
          q.tags || [],
          i + 1,
        ]
      );
      if (result.rowCount > 0) inserted++;
    }

    await db.query(
      'UPDATE question_sets SET question_count = $1 WHERE id = $2',
      [questions.length, setId]
    );

    console.log(`Set ${setId}: ${inserted} inserted (${questions.length} total)`);
  }

  console.log('Seeding complete.');
  process.exit(0);
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
