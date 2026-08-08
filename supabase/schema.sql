-- supabase/schema.sql
-- SNIPEZ schema for Supabase (Postgres) with Row Level Security (RLS)
-- Run this file in your Supabase SQL editor.

-- Enable extensions commonly required
create extension if not exists "uuid-ossp";

-- PROFILES
create table if not exists profiles (
  id uuid primary key default auth.uid(),
  email text,
  username text,
  display_name text,
  avatar_url text,
  study_streak integer default 0,
  last_study_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- DECKS
create table if not exists decks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean default false,
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- FLASHCARDS (spaced repetition fields included)
create table if not exists flashcards (
  id uuid primary key default uuid_generate_v4(),
  deck_id uuid references decks(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  front text not null,
  back text not null,
  difficulty integer default 3, -- 1-5
  efactor numeric default 2.5, -- SM-2 ease factor
  interval integer default 0, -- days
  repetitions integer default 0,
  last_reviewed_at timestamp with time zone,
  next_review_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- NOTES
create table if not exists notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  summary_text text, -- concise bullet summary
  extracted_text text, -- raw OCR/extracted text
  visual_svg_url text, -- interactive SVG or HTML diagram stored in Supabase Storage
  storage_path text, -- raw uploaded file path (if any)
  tags text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- QUIZ SESSIONS + RESPONSES
create table if not exists quiz_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  subject text,
  exam_board text,
  started_at timestamp with time zone default now(),
  completed_at timestamp with time zone,
  score numeric,
  total_questions integer,
  metadata jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists quiz_responses (
  id uuid primary key default uuid_generate_v4(),
  quiz_session_id uuid references quiz_sessions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  question_text text,
  expected_answer text,
  user_answer text,
  ai_score numeric, -- percentage or points
  hints_used integer default 0,
  feedback jsonb default '{}'::jsonb, -- AI explanation, corrections
  created_at timestamp with time zone default now()
);

-- File storage metadata (optional)
create table if not exists uploads (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete cascade,
  bucket text,
  path text,
  url text,
  content_type text,
  size bigint,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) policies
-- Note: Supabase's "auth" schema provides auth.uid() for authenticated user id

-- Profiles RLS
alter table profiles enable row level security;

-- Allow user to select their own profile
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

-- Allow insert where id equals auth.uid()
create policy "profiles_insert_own" on profiles
  for insert with check (id = auth.uid());

-- Allow update/delete only for the owner
create policy "profiles_modify_own" on profiles
  for update, delete using (id = auth.uid()) with check (id = auth.uid());

-- Decks RLS
alter table decks enable row level security;

create policy "decks_select_owner_or_public" on decks
  for select using (is_public or user_id = auth.uid());

create policy "decks_insert_owner" on decks
  for insert with check (user_id = auth.uid());

create policy "decks_modify_owner" on decks
  for update, delete using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Flashcards RLS
alter table flashcards enable row level security;

create policy "flashcards_select_owner" on flashcards
  for select using (user_id = auth.uid());

create policy "flashcards_insert_owner" on flashcards
  for insert with check (user_id = auth.uid());

create policy "flashcards_modify_owner" on flashcards
  for update, delete using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Notes RLS
alter table notes enable row level security;

create policy "notes_select_owner" on notes
  for select using (user_id = auth.uid());

create policy "notes_insert_owner" on notes
  for insert with check (user_id = auth.uid());

create policy "notes_modify_owner" on notes
  for update, delete using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Quiz Sessions & Responses RLS
alter table quiz_sessions enable row level security;
create policy "quiz_sessions_select_owner" on quiz_sessions
  for select using (user_id = auth.uid());
create policy "quiz_sessions_insert_owner" on quiz_sessions
  for insert with check (user_id = auth.uid());
create policy "quiz_sessions_modify_owner" on quiz_sessions
  for update, delete using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table quiz_responses enable row level security;
create policy "quiz_responses_select_owner" on quiz_responses
  for select using (user_id = auth.uid());
create policy "quiz_responses_insert_owner" on quiz_responses
  for insert with check (user_id = auth.uid());
create policy "quiz_responses_modify_owner" on quiz_responses
  for update, delete using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Uploads RLS
alter table uploads enable row level security;
create policy "uploads_select_owner" on uploads for select using (user_id = auth.uid());
create policy "uploads_insert_owner" on uploads for insert with check (user_id = auth.uid());
create policy "uploads_modify_owner" on uploads for update, delete using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Indexes for performance
create index if not exists idx_flashcards_next_review_at on flashcards (next_review_at);
create index if not exists idx_quiz_sessions_user on quiz_sessions (user_id);
create index if not exists idx_notes_user on notes (user_id);

-- Example: default data or helper functions can be added below if desired.
