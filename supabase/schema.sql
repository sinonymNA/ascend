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

-- Migration for existing databases:
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;
-- CREATE TABLE IF NOT EXISTS waitlist (...);
-- CREATE TABLE IF NOT EXISTS user_subject_progress (...);
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS diagnostic_done BOOLEAN DEFAULT FALSE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS predicted_sat INTEGER;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS predicted_act INTEGER;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS login_streak INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_date DATE;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_shield_count INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_xp INTEGER DEFAULT 0;
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_xp_reset_at DATE DEFAULT CURRENT_DATE;
-- CREATE TABLE IF NOT EXISTS user_question_mastery (...);
-- CREATE TABLE IF NOT EXISTS user_achievements (...);
-- CREATE TABLE IF NOT EXISTS friendships (...);

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
