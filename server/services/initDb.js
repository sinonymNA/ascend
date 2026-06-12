'use strict';
const db = require('./db');
const { ITEMS, QUESTS, SEASON } = require('./catalog');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id        TEXT UNIQUE NOT NULL,
  username        TEXT UNIQUE,
  password_hash   TEXT,
  email           TEXT,
  name            TEXT,
  role            TEXT NOT NULL,
  subscription          TEXT DEFAULT 'free',
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  xp              INTEGER DEFAULT 0,
  level           INTEGER DEFAULT 1,
  diagnostic_done       BOOLEAN DEFAULT FALSE,
  predicted_sat         INTEGER,
  predicted_act         INTEGER,
  login_streak          INTEGER DEFAULT 0,
  last_login_date       DATE,
  streak_shield_count   INTEGER DEFAULT 0,
  weekly_xp             INTEGER DEFAULT 0,
  weekly_xp_reset_at    DATE DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID REFERENCES users(id),
  name            TEXT NOT NULL,
  subject         TEXT,
  class_code      TEXT UNIQUE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS class_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        UUID REFERENCES classes(id),
  student_id      UUID REFERENCES users(id),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE IF NOT EXISTS question_sets (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id          UUID REFERENCES users(id),
  title               TEXT NOT NULL,
  subject             TEXT NOT NULL,
  unit                TEXT,
  description         TEXT,
  is_public           BOOLEAN DEFAULT FALSE,
  is_summit_library   BOOLEAN DEFAULT FALSE,
  question_count      INTEGER DEFAULT 0,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id              UUID REFERENCES question_sets(id),
  stimulus            TEXT,
  stimulus_type       TEXT,
  question            TEXT NOT NULL,
  option_a            TEXT NOT NULL,
  option_b            TEXT NOT NULL,
  option_c            TEXT NOT NULL,
  option_d            TEXT NOT NULL,
  correct             TEXT NOT NULL,
  explanation         TEXT,
  difficulty          INTEGER DEFAULT 1,
  historical_thinking TEXT[],
  tags                TEXT[],
  order_index         INTEGER,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS game_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES users(id),
  set_id      UUID REFERENCES question_sets(id),
  join_code   TEXT UNIQUE NOT NULL,
  status      TEXT DEFAULT 'lobby',
  current_q   INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_players (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES game_sessions(id),
  student_id  UUID REFERENCES users(id),
  name        TEXT,
  score       INTEGER DEFAULT 0,
  joined_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS session_answers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES game_sessions(id),
  player_id   UUID REFERENCES session_players(id),
  question_id UUID REFERENCES questions(id),
  answer      TEXT,
  correct     BOOLEAN,
  time_ms     INTEGER,
  answered_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS climber_customizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES users(id) UNIQUE,
  silhouette    TEXT DEFAULT 'default',
  color         TEXT DEFAULT '#F5A623',
  trail_effect  TEXT DEFAULT 'none',
  flag_design   TEXT DEFAULT 'default',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES game_sessions(id),
  class_id    UUID REFERENCES classes(id),
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  source     TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_subject_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  set_id            UUID REFERENCES question_sets(id),
  mastered_count    INTEGER DEFAULT 0,
  questions_total   INTEGER DEFAULT 0,
  xp_earned         INTEGER DEFAULT 0,
  streak_best       INTEGER DEFAULT 0,
  sessions_count    INTEGER DEFAULT 0,
  last_practiced_at TIMESTAMPTZ,
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, set_id)
);

CREATE TABLE IF NOT EXISTS user_question_mastery (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  question_id     UUID REFERENCES questions(id) ON DELETE CASCADE,
  set_id          UUID REFERENCES question_sets(id),
  mastered        BOOLEAN DEFAULT FALSE,
  wrong_count     INTEGER DEFAULT 0,
  correct_count   INTEGER DEFAULT 0,
  next_review_at  TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ,
  UNIQUE(user_id, question_id)
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement  TEXT NOT NULL,
  earned_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement)
);

CREATE TABLE IF NOT EXISTS friendships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ── Economy: wallet + ledger ──
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins        BIGINT DEFAULT 0,
  gems         INTEGER DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS currency_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  coins_delta BIGINT DEFAULT 0,
  gems_delta  INTEGER DEFAULT 0,
  reason      TEXT NOT NULL,
  ref_id      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Items + inventory ──
CREATE TABLE IF NOT EXISTS item_definitions (
  id           TEXT PRIMARY KEY,
  kind         TEXT NOT NULL,
  category     TEXT NOT NULL,
  name         TEXT NOT NULL,
  rarity       TEXT NOT NULL,
  payload      JSONB DEFAULT '{}',
  coin_value   INTEGER DEFAULT 0,
  in_packs     BOOLEAN DEFAULT TRUE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id      TEXT REFERENCES item_definitions(id),
  quantity     INTEGER DEFAULT 1,
  equipped     BOOLEAN DEFAULT FALSE,
  acquired_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- ── Daily quests ──
CREATE TABLE IF NOT EXISTS daily_quest_defs (
  id           TEXT PRIMARY KEY,
  description  TEXT NOT NULL,
  metric       TEXT NOT NULL,
  target       INTEGER NOT NULL,
  filter_value TEXT,
  reward_coins INTEGER DEFAULT 0,
  reward_gems  INTEGER DEFAULT 0,
  weight       INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_daily_quests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id     TEXT REFERENCES daily_quest_defs(id),
  quest_date   DATE NOT NULL,
  progress     INTEGER DEFAULT 0,
  target       INTEGER NOT NULL,
  claimed      BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, quest_id, quest_date)
);

-- ── Leagues ──
CREATE TABLE IF NOT EXISTS leagues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier         TEXT NOT NULL,
  week_start   DATE NOT NULL,
  cohort_index INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier, week_start, cohort_index)
);

CREATE TABLE IF NOT EXISTS league_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id    UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  weekly_xp    INTEGER DEFAULT 0,
  final_rank   INTEGER,
  result       TEXT,
  UNIQUE(league_id, user_id)
);

-- ── Season pass ──
CREATE TABLE IF NOT EXISTS season_defs (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  starts_at    DATE NOT NULL,
  ends_at      DATE NOT NULL,
  active       BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS season_tiers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    TEXT REFERENCES season_defs(id) ON DELETE CASCADE,
  tier_index   INTEGER NOT NULL,
  xp_required  INTEGER NOT NULL,
  reward_coins INTEGER DEFAULT 0,
  reward_gems  INTEGER DEFAULT 0,
  reward_item  TEXT,
  UNIQUE(season_id, tier_index)
);

CREATE TABLE IF NOT EXISTS user_season_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  season_id     TEXT REFERENCES season_defs(id) ON DELETE CASCADE,
  season_xp     INTEGER DEFAULT 0,
  claimed_tiers INTEGER[] DEFAULT '{}',
  UNIQUE(user_id, season_id)
);

-- ── Boost activations ──
CREATE TABLE IF NOT EXISTS boost_activations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id      TEXT REFERENCES item_definitions(id),
  category     TEXT NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  consumed     BOOLEAN DEFAULT FALSE
);

-- Idempotent coin grants
ALTER TABLE user_subject_progress ADD COLUMN IF NOT EXISTS coins_awarded INTEGER DEFAULT 0;

-- ── EduMissions RPG tables ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS em_games (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL,
  subtitle          TEXT NOT NULL,
  tagline           TEXT,
  subject           TEXT NOT NULL,
  status            TEXT DEFAULT 'available',
  box_art_config    JSONB DEFAULT '{}',
  color_scheme      JSONB DEFAULT '{}',
  total_chapters    INTEGER DEFAULT 0,
  total_encounters  INTEGER DEFAULT 0,
  estimated_hours   INTEGER,
  free_chapters     INTEGER DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- EduMissions narrative columns
ALTER TABLE em_games ADD COLUMN IF NOT EXISTS prologue TEXT;
ALTER TABLE em_games ADD COLUMN IF NOT EXISTS epilogue TEXT;

CREATE TABLE IF NOT EXISTS em_districts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id           UUID REFERENCES em_games(id) ON DELETE CASCADE,
  slug              TEXT NOT NULL,
  name              TEXT NOT NULL,
  subtitle          TEXT,
  lore              TEXT,
  aesthetic         TEXT,
  color_primary     TEXT,
  color_secondary   TEXT,
  order_index       INTEGER NOT NULL,
  chapter_count     INTEGER DEFAULT 0,
  unlock_requires   UUID REFERENCES em_districts(id),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, order_index)
);

CREATE TABLE IF NOT EXISTS em_chapters (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id           UUID REFERENCES em_districts(id) ON DELETE CASCADE,
  game_id               UUID REFERENCES em_games(id) ON DELETE CASCADE,
  chapter_number        INTEGER NOT NULL,
  title                 TEXT NOT NULL,
  concept               TEXT NOT NULL,
  opening_narrative     TEXT,
  teaching_lore         TEXT,
  example_correct       TEXT,
  example_wrong         TEXT,
  example_explanation   TEXT,
  closing_narrative     TEXT,
  is_boss_chapter       BOOLEAN DEFAULT FALSE,
  boss_intro_narrative  TEXT,
  boss_victory_narrative TEXT,
  order_index           INTEGER NOT NULL,
  xp_reward             INTEGER DEFAULT 100,
  rune_reward           INTEGER DEFAULT 1,
  encounter_count       INTEGER DEFAULT 0,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(game_id, chapter_number)
);

CREATE TABLE IF NOT EXISTS em_encounters (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id        UUID REFERENCES em_chapters(id) ON DELETE CASCADE,
  game_id           UUID REFERENCES em_games(id) ON DELETE CASCADE,
  encounter_number  INTEGER NOT NULL,
  type              TEXT DEFAULT 'standard',
  difficulty        INTEGER DEFAULT 1,
  pre_narrative     TEXT NOT NULL,
  success_narrative TEXT NOT NULL,
  failure_narrative TEXT NOT NULL,
  enemy_name        TEXT NOT NULL,
  enemy_type        TEXT,
  passage           TEXT,
  passage_highlight TEXT,
  question_stem     TEXT NOT NULL,
  option_a          TEXT NOT NULL,
  option_b          TEXT NOT NULL,
  option_c          TEXT NOT NULL,
  option_d          TEXT NOT NULL,
  correct_answer    TEXT NOT NULL,
  explanation       TEXT NOT NULL,
  xp_reward         INTEGER DEFAULT 50,
  rune_reward       INTEGER DEFAULT 0,
  concept_tag       TEXT,
  difficulty_tag    TEXT,
  act_skill_area    TEXT,
  order_index       INTEGER NOT NULL,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(chapter_id, encounter_number)
);

CREATE TABLE IF NOT EXISTS em_player_progress (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id               UUID REFERENCES em_games(id) ON DELETE CASCADE,
  current_chapter_id    UUID REFERENCES em_chapters(id),
  current_district_id   UUID REFERENCES em_districts(id),
  chapters_completed    UUID[] DEFAULT '{}',
  districts_completed   UUID[] DEFAULT '{}',
  encounters_completed  UUID[] DEFAULT '{}',
  total_xp_earned       INTEGER DEFAULT 0,
  total_runes_earned    INTEGER DEFAULT 0,
  wardens_defeated      UUID[] DEFAULT '{}',
  started_at            TIMESTAMPTZ DEFAULT NOW(),
  last_played           TIMESTAMPTZ DEFAULT NOW(),
  completed_at          TIMESTAMPTZ,
  UNIQUE(user_id, game_id)
);

CREATE TABLE IF NOT EXISTS em_encounter_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  encounter_id    UUID REFERENCES em_encounters(id) ON DELETE CASCADE,
  selected_answer TEXT NOT NULL,
  correct         BOOLEAN NOT NULL,
  attempt_number  INTEGER DEFAULT 1,
  time_taken_ms   INTEGER,
  xp_earned       INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS em_player_inventory (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  total_runes      INTEGER DEFAULT 0,
  warden_seals     JSONB DEFAULT '[]',
  cosmetics_owned  JSONB DEFAULT '[]',
  active_cosmetics JSONB DEFAULT '{}',
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS em_cosmetics (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  type             TEXT NOT NULL,
  description      TEXT,
  rune_cost        INTEGER DEFAULT 0,
  game_id          UUID REFERENCES em_games(id),
  rarity           TEXT DEFAULT 'common',
  visual_config    JSONB DEFAULT '{}',
  unlock_condition TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- EduMissions indexes
CREATE INDEX IF NOT EXISTS em_enc_chapter ON em_encounters(chapter_id, order_index);
CREATE INDEX IF NOT EXISTS em_prog_user   ON em_player_progress(user_id);
CREATE INDEX IF NOT EXISTS em_attempts_user ON em_encounter_attempts(user_id, encounter_id);

-- ── Summit Write (AP essay writing & grading) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS sw_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id      UUID REFERENCES classes(id),
  teacher_id    UUID REFERENCES users(id),
  title         TEXT NOT NULL,
  type          TEXT CHECK (type IN ('SAQ','LEQ','DBQ')) NOT NULL,
  prompt        TEXT NOT NULL,
  context       TEXT,
  due_date      TIMESTAMPTZ,
  is_unit_test  BOOLEAN DEFAULT false,
  dbq_weight    DECIMAL DEFAULT 0.6,
  published     BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sw_assignments ADD COLUMN IF NOT EXISTS guided_walk_enabled BOOLEAN DEFAULT true;

CREATE TABLE IF NOT EXISTS sw_documents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES sw_assignments(id) ON DELETE CASCADE,
  doc_number    INTEGER NOT NULL,
  title         TEXT,
  body          TEXT,
  image_url     TEXT,
  source        TEXT,
  year          INTEGER,
  happ_hint     TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sw_submissions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id  UUID REFERENCES sw_assignments(id),
  student_id     UUID REFERENCES users(id),
  essay_text     TEXT NOT NULL,
  attempt_number INTEGER DEFAULT 1,
  ai_score       INTEGER,
  max_score      INTEGER,
  teacher_score  INTEGER,
  teacher_note   TEXT,
  grading_json   JSONB,
  submitted_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sw_drafts (
  user_id       UUID REFERENCES users(id),
  assignment_id UUID REFERENCES sw_assignments(id) ON DELETE CASCADE,
  essay_text    TEXT DEFAULT '',
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS sw_mcq_scores (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID REFERENCES sw_assignments(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES users(id),
  score         DECIMAL NOT NULL,
  entered_by    UUID REFERENCES users(id),
  entered_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (assignment_id, student_id)
);

CREATE TABLE IF NOT EXISTS sw_student_progress (
  student_id           UUID PRIMARY KEY REFERENCES users(id),
  xp                   INTEGER DEFAULT 0,
  level                INTEGER DEFAULT 1,
  streak_days          INTEGER DEFAULT 0,
  last_submission_date DATE,
  skills               JSONB DEFAULT '{}',
  badges               JSONB DEFAULT '[]',
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- Adaptive scaffolding profile for the Guided Walk system
CREATE TABLE IF NOT EXISTS sw_writing_profiles (
  student_id             UUID PRIMARY KEY REFERENCES users(id),
  saq_level              INTEGER DEFAULT 1,
  leq_level              INTEGER DEFAULT 1,
  dbq_level              INTEGER DEFAULT 1,
  weak_skills            TEXT[] DEFAULT '{}',
  strong_skills          TEXT[] DEFAULT '{}',
  guided_walks_completed INTEGER DEFAULT 0,
  last_rubric_scores     JSONB DEFAULT '{}',
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

-- Guided Walk session state (one in-progress/completed walk per student per assignment)
CREATE TABLE IF NOT EXISTS sw_guided_walk_sessions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     UUID REFERENCES users(id),
  assignment_id  UUID REFERENCES sw_assignments(id) ON DELETE CASCADE,
  phase          TEXT DEFAULT 'opener',
  decode_data    JSONB,
  part_responses JSONB DEFAULT '{}',
  reflection     TEXT,
  rubric_result  JSONB,
  completed_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  updated_at     TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, assignment_id)
);

CREATE INDEX IF NOT EXISTS sw_sub_assignment ON sw_submissions(assignment_id, submitted_at);
CREATE INDEX IF NOT EXISTS sw_sub_student    ON sw_submissions(student_id, submitted_at);
CREATE INDEX IF NOT EXISTS sw_docs_assign    ON sw_documents(assignment_id, doc_number);
CREATE INDEX IF NOT EXISTS sw_gw_student     ON sw_guided_walk_sessions(student_id, assignment_id);

-- Indexes
CREATE INDEX IF NOT EXISTS uqm_user_set ON user_question_mastery(user_id, set_id);
CREATE INDEX IF NOT EXISTS uqm_due      ON user_question_mastery(user_id, next_review_at);
CREATE INDEX IF NOT EXISTS ledger_user  ON currency_ledger(user_id, created_at);
CREATE INDEX IF NOT EXISTS inv_user     ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS udq_user_date ON user_daily_quests(user_id, quest_date);
CREATE INDEX IF NOT EXISTS lm_user      ON league_members(user_id);
CREATE INDEX IF NOT EXISTS boost_user_active ON boost_activations(user_id, consumed);
`;

const QUESTION_SETS = `
INSERT INTO question_sets (id, title, subject, is_summit_library, is_public, question_count) VALUES
  ('00000000-0000-0000-0000-000000000010', 'SAT Math',               'sat_math',    true, true, 200),
  ('00000000-0000-0000-0000-000000000011', 'SAT Reading & Writing',  'sat_rw',      true, true, 200),
  ('00000000-0000-0000-0000-000000000020', 'ACT Math',               'act_math',    true, true, 200),
  ('00000000-0000-0000-0000-000000000021', 'ACT English',            'act_english', true, true, 150),
  ('00000000-0000-0000-0000-000000000022', 'ACT Reading',            'act_reading', true, true, 150),
  ('00000000-0000-0000-0000-000000000023', 'ACT Science',            'act_science', true, true, 150)
ON CONFLICT (id) DO NOTHING;
`;

async function seedCatalogs() {
  // Item definitions
  for (const it of ITEMS) {
    await db.query(
      `INSERT INTO item_definitions (id, kind, category, name, rarity, payload, coin_value, in_packs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         kind=$2, category=$3, name=$4, rarity=$5, payload=$6, coin_value=$7, in_packs=$8`,
      [it.id, it.kind, it.category, it.name, it.rarity, JSON.stringify(it.payload || {}), it.coin_value, it.in_packs !== false]
    );
  }

  // Daily quest defs
  for (const q of QUESTS) {
    await db.query(
      `INSERT INTO daily_quest_defs (id, description, metric, target, filter_value, reward_coins, reward_gems, weight)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO UPDATE SET
         description=$2, metric=$3, target=$4, filter_value=$5, reward_coins=$6, reward_gems=$7, weight=$8`,
      [q.id, q.description, q.metric, q.target, q.filter_value || null, q.reward_coins || 0, q.reward_gems || 0, q.weight || 1]
    );
  }

  // Season + tiers
  await db.query(
    `INSERT INTO season_defs (id, name, starts_at, ends_at, active)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (id) DO UPDATE SET name=$2, starts_at=$3, ends_at=$4, active=$5`,
    [SEASON.id, SEASON.name, SEASON.starts_at, SEASON.ends_at, SEASON.active]
  );
  for (const t of SEASON.tiers) {
    await db.query(
      `INSERT INTO season_tiers (season_id, tier_index, xp_required, reward_coins, reward_gems, reward_item)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (season_id, tier_index) DO UPDATE SET
         xp_required=$3, reward_coins=$4, reward_gems=$5, reward_item=$6`,
      [SEASON.id, t.tier_index, t.xp_required, t.reward_coins || 0, t.reward_gems || 0, t.reward_item || null]
    );
  }
}

async function initDb() {
  try {
    await db.query(SCHEMA);
    await db.query(QUESTION_SETS);
    await seedCatalogs();
    await seedEduMissions();
    await seedSummitWriteContent();
    console.log('✓ Database schema ready');
  } catch (err) {
    console.error('✗ Database init error:', err.message);
    // Don't crash the server — it may still work if tables already exist
  }
}

async function seedEduMissions() {
  try {
    const { seedChronicles } = require('./chronicles-seed');
    await seedChronicles(db);
    console.log('✓ EduMissions Chronicles seeded');
  } catch (err) {
    console.warn('EduMissions seed skipped:', err.message);
  }
}

async function seedSummitWriteContent() {
  try {
    const { seedSummitWrite } = require('./summitwrite-seed');
    await seedSummitWrite(db);
    console.log('✓ Summit Write sample assignments seeded');
  } catch (err) {
    console.warn('Summit Write seed skipped:', err.message);
  }
}

module.exports = initDb;
