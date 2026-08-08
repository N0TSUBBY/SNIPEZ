-- supabase/schema.sql

-- SNIPEZ database schema
-- Run this in your Supabase SQL editor to create tables and RLS policies.

-- Enable uuid extension
create extension if not exists "pgcrypto";

-- USERS / PROFILES
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text,
  avatar_url text,
  bio text,
  study_streak int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- UPLOADS (images/files stored in Supabase Storage, metadata here)
create table if not exists uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  bucket text not null,
  path text not null,
  url text,
  content_type text,
  size bigint,
  created_at timestamptz default now()
);

-- DECKS & FLASHCARDS (spaced repetition)
create table if not exists decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid references decks(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  front text not null,
  back text not null,
  difficulty smallint default 3, -- 1 easy - 5 hard
  last_reviewed_at timestamptz,
  next_review_at timestamptz,
  ease_factor numeric(3,2) default 2.50,
  interval int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- NOTES (AI summaries / extracted text / svg assets)
create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  summary text,
  extracted_text text,
  svg_url text,
  attachments jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- QUIZ SESSIONS & RESPONSES
create table if not exists quiz_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text,
  started_at timestamptz default now(),
  finished_at timestamptz,
  score numeric,
  created_at timestamptz default now()
);

create table if not exists quiz_responses (
  id uuid primary key default gen_random_uuid(),
  quiz_session_id uuid references quiz_sessions(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  question text,
  expected_answer text,
  student_answer text,
  score numeric,
  max_score numeric default 5,
  feedback text,
  hints_used jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_flashcards_next_review on flashcards(next_review_at);
create index if not exists idx_notes_user on notes(user_id);
create index if not exists idx_decks_user on decks(user_id);

-- Row Level Security (RLS)

-- Enable RLS on tables that contain user data
alter table profiles enable row level security;
alter table uploads enable row level security;
alter table decks enable row level security;
alter table flashcards enable row level security;
alter table notes enable row level security;
alter table quiz_sessions enable row level security;
alter table quiz_responses enable row level security;

-- PROFILES RLS
create policy "profiles_select_own" on profiles
  for select using (auth.role() = 'anon' or id = auth.uid());

create policy "profiles_insert" on profiles
  for insert with check (true);

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_delete_own" on profiles
  for delete using (id = auth.uid());

-- UPLOADS RLS
create policy "uploads_select_owner" on uploads
  for select using (user_id = auth.uid());

create policy "uploads_insert_owner" on uploads
  for insert with check (user_id = auth.uid());

create policy "uploads_update_owner" on uploads
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "uploads_delete_owner" on uploads
  for delete using (user_id = auth.uid());

-- DECKS RLS
create policy "decks_select_owner_or_public" on decks
  for select using (is_public or user_id = auth.uid());

create policy "decks_insert_owner" on decks
  for insert with check (user_id = auth.uid());

create policy "decks_update_owner" on decks
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "decks_delete_owner" on decks
  for delete using (user_id = auth.uid());

-- FLASHCARDS RLS
create policy "flashcards_select_owner" on flashcards
  for select using (user_id = auth.uid());

create policy "flashcards_insert_owner" on flashcards
  for insert with check (user_id = auth.uid());

create policy "flashcards_update_owner" on flashcards
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "flashcards_delete_owner" on flashcards
  for delete using (user_id = auth.uid());

-- NOTES RLS
create policy "notes_select_owner" on notes
  for select using (user_id = auth.uid());

create policy "notes_insert_owner" on notes
  for insert with check (user_id = auth.uid());

create policy "notes_update_owner" on notes
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notes_delete_owner" on notes
  for delete using (user_id = auth.uid());

-- QUIZ SESSIONS & RESPONSES RLS
create policy "quiz_sessions_select_owner" on quiz_sessions
  for select using (user_id = auth.uid());

create policy "quiz_sessions_insert_owner" on quiz_sessions
  for insert with check (user_id = auth.uid());

create policy "quiz_sessions_update_owner" on quiz_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "quiz_sessions_delete_owner" on quiz_sessions
  for delete using (user_id = auth.uid());

create policy "quiz_responses_select_owner" on quiz_responses
  for select using (user_id = auth.uid());

create policy "quiz_responses_insert_owner" on quiz_responses
  for insert with check (user_id = auth.uid());

create policy "quiz_responses_update_owner" on quiz_responses
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "quiz_responses_delete_owner" on quiz_responses
  for delete using (user_id = auth.uid());

-- Done

