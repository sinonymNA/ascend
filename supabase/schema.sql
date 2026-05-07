-- ASCEND core schema
-- PostgreSQL / Supabase

create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  subscription_status text not null default 'free' check (subscription_status in ('free', 'active', 'canceled', 'past_due')),
  created_at timestamptz not null default now()
);

create table if not exists student_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  display_name text not null,
  avatar_skin text not null default 'scholar',
  path_style text not null default 'stone',
  badge_frame text not null default 'simple',
  active_title text not null default 'The Focused',
  player_level int not null default 1 check (player_level between 1 and 50),
  total_xp int not null default 0,
  total_coins int not null default 0,
  coin_balance int not null default 0,
  current_streak int not null default 0,
  longest_streak int not null default 0,
  think_aloud_count int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists exams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  theme text,
  category text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists zones (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid not null references exams(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  theme_region text,
  boss_name text not null,
  boss_description text,
  sort_order int not null,
  unique (exam_id, slug),
  unique (exam_id, sort_order)
);

create table if not exists levels (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete cascade,
  level_number int not null check (level_number between 1 and 5),
  skill_tag text not null,
  skill_description text,
  base_difficulty int not null check (base_difficulty between 1 and 5),
  question_count int not null default 10 check (question_count between 5 and 30),
  unique (zone_id, level_number)
);

create table if not exists journeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  exam_id uuid not null references exams(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned', 'paused')),
  exam_date date,
  daily_minutes_goal int not null default 30 check (daily_minutes_goal between 5 and 240),
  map_config jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  zone_id uuid not null references zones(id) on delete cascade,
  level_id uuid references levels(id) on delete set null,
  skill_tag text not null,
  difficulty int not null check (difficulty between 1 and 5),
  question_text text not null,
  answer_choices jsonb not null,
  correct_answer text not null,
  explanation text not null,
  think_aloud_guidance text,
  source text not null default 'seed',
  times_seen int not null default 0,
  times_correct int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists journey_progress (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references journeys(id) on delete cascade,
  zone_id uuid not null references zones(id) on delete cascade,
  level_id uuid references levels(id) on delete cascade,
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'in_progress', 'completed', 'failed')),
  score numeric,
  xp_earned int not null default 0,
  completed_at timestamptz,
  unique (journey_id, zone_id, level_id)
);

create table if not exists boss_attempts (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references journeys(id) on delete cascade,
  zone_id uuid not null references zones(id) on delete cascade,
  attempt_number int not null check (attempt_number >= 1),
  score numeric,
  questions_used jsonb not null default '[]'::jsonb,
  lives_remaining int not null default 3 check (lives_remaining between 0 and 3),
  passed boolean not null,
  time_taken_seconds int,
  completed_at timestamptz not null default now(),
  unique (journey_id, zone_id, attempt_number)
);

create table if not exists question_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  journey_id uuid not null references journeys(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  selected_answer text,
  correct boolean not null,
  time_taken_seconds int,
  think_aloud_used boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists think_aloud_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  transcript text not null,
  ai_feedback text not null,
  thought_clarity_score numeric,
  created_at timestamptz not null default now()
);

create table if not exists review_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  question_id uuid not null references questions(id) on delete cascade,
  next_review_at timestamptz not null,
  interval_days int not null default 1,
  ease_factor numeric not null default 2.5,
  times_reviewed int not null default 0,
  unique (user_id, question_id)
);

create table if not exists economy_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  event_type text not null,
  xp_amount int not null default 0,
  coin_amount int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists cosmetics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('avatar_skin', 'path_style', 'badge_frame', 'map_theme', 'title')),
  coin_cost int not null check (coin_cost >= 0),
  unlock_condition text,
  description text
);

create table if not exists owned_cosmetics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  cosmetic_id uuid not null references cosmetics(id) on delete cascade,
  purchased_at timestamptz not null default now(),
  unique (user_id, cosmetic_id)
);

create index if not exists idx_questions_zone_level on questions(zone_id, level_id);
create index if not exists idx_review_queue_due on review_queue(user_id, next_review_at);
create index if not exists idx_question_responses_user_created on question_responses(user_id, created_at desc);
create index if not exists idx_journey_progress_lookup on journey_progress(journey_id, zone_id, status);
