CREATE TABLE users (
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

-- Migration for existing databases (run once if upgrading from earlier schema):
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

CREATE TABLE classes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID REFERENCES users(id),
  name            TEXT NOT NULL,
  subject         TEXT,
  class_code      TEXT UNIQUE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE class_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id        UUID REFERENCES classes(id),
  student_id      UUID REFERENCES users(id),
  joined_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(class_id, student_id)
);

CREATE TABLE question_sets (
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

CREATE TABLE questions (
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

CREATE TABLE game_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id  UUID REFERENCES users(id),
  class_id    UUID REFERENCES classes(id),
  set_id      UUID REFERENCES question_sets(id),
  game_code   TEXT UNIQUE NOT NULL,
  status      TEXT DEFAULT 'lobby',
  mode        TEXT DEFAULT 'live',
  started_at  TIMESTAMPTZ,
  ended_at    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE session_progress (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          UUID REFERENCES game_sessions(id),
  student_id          UUID REFERENCES users(id),
  questions_answered  INTEGER DEFAULT 0,
  questions_mastered  INTEGER DEFAULT 0,
  questions_total     INTEGER DEFAULT 0,
  elevation_percent   NUMERIC DEFAULT 0,
  summited            BOOLEAN DEFAULT FALSE,
  summited_at         TIMESTAMPTZ,
  xp_earned           INTEGER DEFAULT 0,
  streak_current      INTEGER DEFAULT 0,
  streak_best         INTEGER DEFAULT 0,
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID REFERENCES game_sessions(id),
  student_id      UUID REFERENCES users(id),
  question_id     UUID REFERENCES questions(id),
  selected        TEXT,
  correct         BOOLEAN,
  attempt_number  INTEGER DEFAULT 1,
  time_taken_ms   INTEGER,
  mastered        BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE climber_customizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    UUID REFERENCES users(id) UNIQUE,
  silhouette    TEXT DEFAULT 'default',
  color         TEXT DEFAULT '#F5A623',
  trail_effect  TEXT DEFAULT 'none',
  flag_design   TEXT DEFAULT 'default',
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE assignments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID REFERENCES game_sessions(id),
  class_id    UUID REFERENCES classes(id),
  due_date    TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE waitlist (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  source     TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_subject_progress (
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

-- ─── Elevation: new tables ────────────────────────────────────────────────────

CREATE TABLE user_question_mastery (
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
CREATE INDEX ON user_question_mastery(user_id, set_id);
CREATE INDEX ON user_question_mastery(user_id, next_review_at);

CREATE TABLE user_achievements (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement  TEXT NOT NULL,
  earned_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement)
);

CREATE TABLE friendships (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  friend_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ─── Economy: currency, packs, inventory, quests, leagues, season, boosts ──────
-- NOTE: These are also defined in server/services/initDb.js (CREATE TABLE IF NOT
-- EXISTS run on every boot) which is the runtime source of truth. Keep mirrored.
ALTER TABLE user_subject_progress ADD COLUMN IF NOT EXISTS coins_awarded INTEGER DEFAULT 0;

CREATE TABLE user_wallets (
  user_id      UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  coins        BIGINT DEFAULT 0,
  gems         INTEGER DEFAULT 0,
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE currency_ledger (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  coins_delta BIGINT DEFAULT 0,
  gems_delta  INTEGER DEFAULT 0,
  reason      TEXT NOT NULL,
  ref_id      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE item_definitions (
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

CREATE TABLE user_inventory (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id      TEXT REFERENCES item_definitions(id),
  quantity     INTEGER DEFAULT 1,
  equipped     BOOLEAN DEFAULT FALSE,
  acquired_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

CREATE TABLE daily_quest_defs (
  id           TEXT PRIMARY KEY,
  description  TEXT NOT NULL,
  metric       TEXT NOT NULL,
  target       INTEGER NOT NULL,
  filter_value TEXT,
  reward_coins INTEGER DEFAULT 0,
  reward_gems  INTEGER DEFAULT 0,
  weight       INTEGER DEFAULT 1
);

CREATE TABLE user_daily_quests (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  quest_id     TEXT REFERENCES daily_quest_defs(id),
  quest_date   DATE NOT NULL,
  progress     INTEGER DEFAULT 0,
  target       INTEGER NOT NULL,
  claimed      BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, quest_id, quest_date)
);

CREATE TABLE leagues (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier         TEXT NOT NULL,
  week_start   DATE NOT NULL,
  cohort_index INTEGER DEFAULT 0,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tier, week_start, cohort_index)
);

CREATE TABLE league_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id    UUID REFERENCES leagues(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  weekly_xp    INTEGER DEFAULT 0,
  final_rank   INTEGER,
  result       TEXT,
  UNIQUE(league_id, user_id)
);

CREATE TABLE season_defs (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  starts_at    DATE NOT NULL,
  ends_at      DATE NOT NULL,
  active       BOOLEAN DEFAULT FALSE
);

CREATE TABLE season_tiers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id    TEXT REFERENCES season_defs(id) ON DELETE CASCADE,
  tier_index   INTEGER NOT NULL,
  xp_required  INTEGER NOT NULL,
  reward_coins INTEGER DEFAULT 0,
  reward_gems  INTEGER DEFAULT 0,
  reward_item  TEXT,
  UNIQUE(season_id, tier_index)
);

CREATE TABLE user_season_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
  season_id     TEXT REFERENCES season_defs(id) ON DELETE CASCADE,
  season_xp     INTEGER DEFAULT 0,
  claimed_tiers INTEGER[] DEFAULT '{}',
  UNIQUE(user_id, season_id)
);

CREATE TABLE boost_activations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id      TEXT REFERENCES item_definitions(id),
  category     TEXT NOT NULL,
  activated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at   TIMESTAMPTZ,
  consumed     BOOLEAN DEFAULT FALSE
);

-- ─── Migration script (run this against existing databases to apply new columns/tables) ───
-- Copy lines below into your Railway/Supabase SQL console to upgrade an existing DB:
--
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS diagnostic_done BOOLEAN DEFAULT FALSE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS predicted_sat INTEGER;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS predicted_act INTEGER;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_shield_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_xp_reset_at DATE DEFAULT CURRENT_DATE;
--
-- CREATE TABLE IF NOT EXISTS user_question_mastery (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
--   set_id UUID REFERENCES question_sets(id),
--   mastered BOOLEAN DEFAULT FALSE,
--   wrong_count INTEGER DEFAULT 0,
--   correct_count INTEGER DEFAULT 0,
--   next_review_at TIMESTAMPTZ DEFAULT NOW(),
--   last_seen_at TIMESTAMPTZ,
--   UNIQUE(user_id, question_id)
-- );
-- CREATE INDEX IF NOT EXISTS uqm_user_set ON user_question_mastery(user_id, set_id);
-- CREATE INDEX IF NOT EXISTS uqm_due ON user_question_mastery(user_id, next_review_at);
--
-- CREATE TABLE IF NOT EXISTS user_achievements (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   achievement TEXT NOT NULL,
--   earned_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(user_id, achievement)
-- );
--
-- CREATE TABLE IF NOT EXISTS friendships (
--   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--   user_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   friend_id UUID REFERENCES users(id) ON DELETE CASCADE,
--   created_at TIMESTAMPTZ DEFAULT NOW(),
--   UNIQUE(user_id, friend_id)
-- );

-- Seed the AP World Unit 1 question set
INSERT INTO question_sets
  (id, title, subject, unit, is_summit_library, is_public, question_count)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'AP World History Modern — Unit 1: The Global Tapestry',
   'ap_world_history_modern', 'unit_1', true, true, 50)
ON CONFLICT (id) DO NOTHING;

-- Seed SAT/ACT question sets
INSERT INTO question_sets (id, title, subject, is_summit_library, is_public, question_count) VALUES
  ('00000000-0000-0000-0000-000000000010', 'SAT Math',               'sat_math',     true, true, 200),
  ('00000000-0000-0000-0000-000000000011', 'SAT Reading & Writing',  'sat_rw',        true, true, 200),
  ('00000000-0000-0000-0000-000000000020', 'ACT Math',               'act_math',      true, true, 200),
  ('00000000-0000-0000-0000-000000000021', 'ACT English',            'act_english',   true, true, 150),
  ('00000000-0000-0000-0000-000000000022', 'ACT Reading',            'act_reading',   true, true, 150),
  ('00000000-0000-0000-0000-000000000023', 'ACT Science',            'act_science',   true, true, 150)
ON CONFLICT (id) DO NOTHING;
