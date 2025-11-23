-- ==========================================
-- 1) Optional: profiles (user settings)
-- ==========================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text,
  default_timer_preset_minutes integer,
  created_at timestamptz default now()
);

-- ==========================================
-- 2) categories – todo groups per user
-- ==========================================
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text, -- optional: you can store a hex here like '#ff68a6'
  created_at timestamptz default now()
);

create index if not exists idx_categories_user_id
  on categories (user_id);

-- ==========================================
-- 3) todos – core tasks
-- ==========================================
create table if not exists todos (
  id uuid primary key default gen_random_uuid(),

  -- ownership
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,

  -- content
  title text not null,
  description text,

  -- time tracking
  created_at timestamptz default now(),
  start_time timestamptz,
  due_time timestamptz,
  scheduled_date date,        -- used for calendar view (Jira-style)
  completed_at timestamptz,

  -- status & timing
  status text not null default 'pending'
    check (status in ('pending', 'in_progress', 'completed')),

  timing_result text default 'not_completed'
    check (timing_result in ('early', 'on_time', 'late', 'not_completed')),

  -- timer info
  timer_preset_minutes integer,   -- e.g. 25 for pomodoro
  timer_custom_seconds integer,   -- optional custom duration
  timer_sound text default 'default', -- e.g. 'default', 'chill', 'bell'

  -- optional priority
  priority text
    check (priority in ('low', 'medium', 'high') or priority is null)
);

create index if not exists idx_todos_user_id
  on todos (user_id);

create index if not exists idx_todos_scheduled_date
  on todos (scheduled_date);

create index if not exists idx_todos_status_due_time
  on todos (status, due_time);

-- ==========================================
-- 4) todo_links – multiple links per todo
-- ==========================================
create table if not exists todo_links (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null references auth.users(id) on delete cascade,
  todo_id uuid not null references todos(id) on delete cascade,

  label text not null,   -- text shown in UI (e.g. "Watch video")
  url text not null,
  type text default 'website'
    check (type in ('website', 'youtube', 'other')),

  created_at timestamptz default now()
);

create index if not exists idx_todo_links_todo_id
  on todo_links (todo_id);

create index if not exists idx_todo_links_user_id
  on todo_links (user_id);

-- ==========================================
-- 5) Enable Row Level Security (RLS)
-- ==========================================
alter table profiles    enable row level security;
alter table categories  enable row level security;
alter table todos       enable row level security;
alter table todo_links  enable row level security;

-- ==========================================
-- 6) RLS Policies – user can only manage own data
-- ==========================================

-- profiles
create policy "Users can manage their own profile"
  on profiles
  for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- categories
create policy "Users can manage their own categories"
  on categories
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- todos
create policy "Users can manage their own todos"
  on todos
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- todo_links
create policy "Users can manage their own todo links"
  on todo_links
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);


-- ==========================================
-- Username support for authentication
-- ==========================================

-- 1) Add username and email columns to profiles
alter table profiles
add column if not exists username text;

alter table profiles
add column if not exists email text;

-- 2) Enforce username rules
alter table profiles
drop constraint if exists username_format_check;

alter table profiles
add constraint username_format_check
check (username is null or username ~ '^[A-Za-z0-9_]{3,30}$');

-- 3) Make usernames unique (case-insensitive)
create unique index if not exists profiles_username_unique
on profiles (lower(username));

-- 4) Create index on email for faster lookups
create index if not exists idx_profiles_email
on profiles (email);
