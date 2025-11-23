create table public.categories (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  name text not null,
  color text null,
  created_at timestamp with time zone null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_categories_user_id on public.categories using btree (user_id) TABLESPACE pg_default;

create table public.profiles (
  id uuid not null,
  display_name text null,
  avatar_url text null,
  timezone text null,
  default_timer_preset_minutes integer null,
  created_at timestamp with time zone null default now(),
  username text null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint username_format_check check ((username ~ '^[A-Za-z0-9_]{3,30}$'::text))
) TABLESPACE pg_default;

create unique INDEX IF not exists profiles_username_unique on public.profiles using btree (lower(username)) TABLESPACE pg_default;

create table public.todo_links (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  todo_id uuid not null,
  label text not null,
  url text not null,
  type text null default 'website'::text,
  created_at timestamp with time zone null default now(),
  constraint todo_links_pkey primary key (id),
  constraint todo_links_todo_id_fkey foreign KEY (todo_id) references todos (id) on delete CASCADE,
  constraint todo_links_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint todo_links_type_check check (
    (
      type = any (
        array['website'::text, 'youtube'::text, 'other'::text]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_todo_links_todo_id on public.todo_links using btree (todo_id) TABLESPACE pg_default;

create index IF not exists idx_todo_links_user_id on public.todo_links using btree (user_id) TABLESPACE pg_default;


create table public.todos (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  category_id uuid null,
  title text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  start_time timestamp with time zone null,
  due_time timestamp with time zone null,
  scheduled_date date null,
  completed_at timestamp with time zone null,
  status text not null default 'pending'::text,
  timing_result text null default 'not_completed'::text,
  timer_preset_minutes integer null,
  timer_custom_seconds integer null,
  timer_sound text null default 'default'::text,
  priority text null,
  constraint todos_pkey primary key (id),
  constraint todos_category_id_fkey foreign KEY (category_id) references categories (id) on delete set null,
  constraint todos_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint todos_priority_check check (
    (
      (
        priority = any (array['low'::text, 'medium'::text, 'high'::text])
      )
      or (priority is null)
    )
  ),
  constraint todos_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'in_progress'::text,
          'completed'::text
        ]
      )
    )
  ),
  constraint todos_timing_result_check check (
    (
      timing_result = any (
        array[
          'early'::text,
          'on_time'::text,
          'late'::text,
          'not_completed'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_todos_user_id on public.todos using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_todos_scheduled_date on public.todos using btree (scheduled_date) TABLESPACE pg_default;

create index IF not exists idx_todos_status_due_time on public.todos using btree (status, due_time) TABLESPACE pg_default;