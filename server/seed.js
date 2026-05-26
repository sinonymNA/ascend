/**
 * Seed script: loads AP World Unit 1 questions from the client data file
 * and inserts them into Supabase.
 *
 * Usage: node server/seed.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_KEY env vars
 */

require('dotenv').config();
const path = require('path');

// The questions file is an ES module — use a dynamic import wrapper
async function main() {
  const supabase = require('./services/supabase');

  // Load questions via dynamic import (ES module from client/src/data)
  const dataPath = path.resolve(__dirname, '../client/src/data/apWorldUnit1Questions.js');

  let SET_ID, questions;
  try {
    // Attempt native dynamic import
    const mod = await import(`file://${dataPath}`);
    SET_ID = mod.SET_ID;
    questions = mod.questions;
  } catch (e) {
    console.error('Could not import questions file:', e.message);
    console.error('Make sure client/src/data/apWorldUnit1Questions.js exists.');
    process.exit(1);
  }

  console.log(`Seeding ${questions.length} questions for set ${SET_ID}...`);

  // Upsert the question set (idempotent)
  const { error: setError } = await supabase
    .from('question_sets')
    .upsert({
      id: SET_ID,
      title: 'AP World History Modern — Unit 1: The Global Tapestry',
      subject: 'ap_world_history_modern',
      unit: 'unit_1',
      is_summit_library: true,
      is_public: true,
      question_count: questions.length,
    });
  if (setError) console.error('Set upsert error:', setError.message);

  // Insert questions in batches of 10
  const rows = questions.map((q, i) => ({
    id: q.id && q.id.length > 10 ? q.id : undefined, // use provided uuid if looks valid
    set_id: SET_ID,
    stimulus: q.stimulus || null,
    stimulus_type: q.stimulus_type || null,
    question: q.question,
    option_a: q.options.A,
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    correct: q.correct,
    explanation: q.explanation,
    difficulty: q.difficulty,
    historical_thinking: q.historical_thinking || [],
    tags: q.tags || [],
    order_index: i + 1,
  }));

  for (let i = 0; i < rows.length; i += 10) {
    const batch = rows.slice(i, i + 10);
    const { error } = await supabase.from('questions').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${i / 10 + 1} error:`, error.message);
    } else {
      console.log(`Inserted batch ${i / 10 + 1} (${batch.length} questions)`);
    }
  }

  console.log('Seed complete.');
  process.exit(0);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
