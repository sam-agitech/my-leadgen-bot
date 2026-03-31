-- Vercel Postgres schema for tracking + mini admin

create table if not exists conversations (
  id text primary key,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  landing_url text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  user_agent text,
  status text not null default 'active'
);

create table if not exists messages (
  id bigserial primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('user', 'assistant')),
  step text,
  content_text text not null
);

create index if not exists messages_conversation_id_created_at_idx
  on messages(conversation_id, created_at);

create table if not exists step_events (
  id bigserial primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  from_step text,
  to_step text,
  reason text
);

create index if not exists step_events_conversation_id_created_at_idx
  on step_events(conversation_id, created_at);

create table if not exists leads (
  id bigserial primary key,
  conversation_id text not null unique references conversations(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  website text,
  client_problem text,
  scope text,
  modules text,
  email text,
  status text not null default 'new'
);

