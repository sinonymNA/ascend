'use strict';
const db = require('./db');

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

-- Indexes
CREATE INDEX IF NOT EXISTS uqm_user_set ON user_question_mastery(user_id, set_id);
CREATE INDEX IF NOT EXISTS uqm_due      ON user_question_mastery(user_id, next_review_at);
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

async function initDb() {
  try {
    await db.query(SCHEMA);
    await db.query(QUESTION_SETS);
    console.log('✓ Database schema ready');
  } catch (err) {
    console.error('✗ Database init error:', err.message);
    // Don't crash the server — it may still work if tables already exist
  }
}

module.exports = initDb;
