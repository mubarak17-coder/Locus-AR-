-- ============================================================
-- Locus AR — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Trackers table
create table if not exists trackers (
  id          bigint primary key generated always as identity,
  name        text        not null,
  icon        text        not null default '🏷️',
  status      text        not null default 'online' check (status in ('online', 'offline')),
  last_seen   text        not null default 'Just now',
  battery     int         not null default 100 check (battery >= 0 and battery <= 100),
  location    text        not null default 'Unknown',
  owner       text        not null default 'Me',
  created_at  timestamptz not null default now()
);

-- Family members table
create table if not exists family_members (
  id          bigint primary key generated always as identity,
  name        text        not null,
  role        text        not null default 'Member' check (role in ('Admin', 'Member')),
  avatar      text        not null,
  color       text        not null default 'bg-locus-500',
  email       text        not null,
  created_at  timestamptz not null default now()
);

-- Notifications table
create table if not exists notifications (
  id          bigint primary key generated always as identity,
  type        text        not null check (type in ('offline', 'battery', 'found', 'family', 'online')),
  icon        text        not null,
  title       text        not null,
  body        text        not null,
  time        text        not null default 'Just now',
  read        boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- ── Seed: Trackers ──────────────────────────────────────────
insert into trackers (name, icon, status, last_seen, battery, location, owner) values
  ('Keys',       '🔑', 'online',  '2 min ago',   85, 'Living Room', 'Yerassyl'),
  ('Wallet',     '👛', 'online',  '5 min ago',   72, 'Bedroom',     'Yerassyl'),
  ('Headphones', '🎧', 'online',  '1 min ago',   94, 'Desk',        'Yerassyl'),
  ('Backpack',   '🎒', 'offline', '2 hours ago', 12, 'Unknown',     'Aisha'),
  ('Laptop Bag', '💼', 'online',  'Just now',    61, 'Office',      'Yerassyl'),
  ('Car Keys',   '🚗', 'offline', '1 day ago',    8, 'Unknown',     'Aisha');

-- ── Seed: Family members ────────────────────────────────────
insert into family_members (name, role, avatar, color, email) values
  ('Yerassyl', 'Admin',  'Y', 'bg-locus-500',   'yerassyl@locus.ar'),
  ('Aisha',    'Member', 'A', 'bg-pink-400',    'aisha@locus.ar'),
  ('Daniyar',  'Member', 'D', 'bg-emerald-500', 'daniyar@locus.ar'),
  ('Zarina',   'Member', 'Z', 'bg-amber-400',   'zarina@locus.ar');

-- ── Seed: Notifications ─────────────────────────────────────
insert into notifications (type, icon, title, body, time, read) values
  ('offline', '📡', 'Car Keys went offline',      'Last seen 1 day ago · Unknown location',  '1d ago',  false),
  ('battery', '🔋', 'Backpack battery critical',  'Battery at 12% — charge soon',            '2h ago',  false),
  ('battery', '🔋', 'Car Keys battery critical',  'Battery at 8% — charge soon',             '1d ago',  false),
  ('found',   '✅', 'Wallet found',               'Located in Bedroom · 5 min ago',          '5m ago',  true),
  ('family',  '👤', 'Aisha joined the family',    'New member added to your Locus AR group', '2d ago',  true),
  ('online',  '📶', 'Headphones back online',     'Located at Desk',                         '30m ago', true),
  ('found',   '✅', 'Keys found',                 'Located in Living Room · 2 min ago',      '2m ago',  true),
  ('family',  '👤', 'Daniyar added a tracker',    'Laptop Bag is now being tracked',         '3d ago',  true);

-- ── RLS (Row Level Security) — disable for now, enable later ─
alter table trackers       disable row level security;
alter table family_members disable row level security;
alter table notifications  disable row level security;
