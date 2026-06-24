-- ════════════════════════════════════════════════════════════════════
-- SERO — initial schema (Supabase / Postgres).
-- Mirrors SCHEMA.md (the frozen contract). Run once in the Supabase SQL
-- editor, or via `supabase db push` if using the CLI.
-- ════════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;  -- gen_random_uuid()

-- updated_at trigger helper
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end; $$ language plpgsql;

-- ── worlds ── the unifying unit. Every signal/reaction/obsession/event
--    carries a `world` so a world can be aggregated later. Seeded with the
--    current 8; add rows, never hardcode the set elsewhere.
create table worlds (
  id         text primary key,          -- 'musica','peliculas',…,'otro'
  label      text not null,
  emoji      text,
  sort_order int  not null default 0
);
insert into worlds (id,label,emoji,sort_order) values
  ('musica','música','🎵',1), ('peliculas','películas','🎬',2),
  ('series','series','📺',3), ('anime','anime/manga','🀄',4),
  ('libros','libros','📚',5), ('videojuegos','videojuegos','🕹️',6),
  ('deportes','deportes','🏆',7), ('otro','otro','❤️',8);

-- ── users ── identity + auth linkage. `handle` == today's slug.
create table users (
  id            uuid primary key default gen_random_uuid(),
  handle        text unique not null,            -- derived from name, collision-counted
  name          text not null,
  apellido      text,
  ciudad        text,
  edad          text,
  whatsapp      text,
  email         text,                            -- from Google OAuth (verified); nullable
  auth_user_id  uuid unique references auth.users(id) on delete set null, -- linked on login
  referred_by   text,                            -- logical ref → users.handle (soft, indexed)
  worlds        text[] not null default '{}',    -- selected worlds (existing `worlds`)
  logistics     jsonb  not null default '{}',    -- {rol,plus_one,disponibilidad,dieta,dieta_note}
  created_at    timestamptz not null default now()
);
create index users_referred_by_idx on users (referred_by);
create index users_email_idx        on users (email);

-- ── taste ── set-once quiz output, ONE row per (user, world). Preserves the
--    existing per-world shape verbatim in `records`:
--      swipe worlds → TasteRecord[]   deportes → {relation,typed}   otro → string
create table taste (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  world      text not null references worlds(id),
  records    jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, world)
);
create index taste_world_idx on taste (world);

-- ── obsesiones ── LIVING signals: timestamped, mutable, specific item + link.
--    Distinct from set-once taste.
create table obsesiones (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  world      text not null references worlds(id),
  category   text,                  -- optional layer-1 context
  item_text  text not null,
  link       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index obsesiones_user_idx  on obsesiones (user_id);
create index obsesiones_world_idx on obsesiones (world);
create trigger obsesiones_set_updated before update on obsesiones
  for each row execute function set_updated_at();

-- ── signals ── a user POSTING a specific item in a world (the feed unit).
--    kind='obsesion'  → derived from one of their obsessions
--    kind='broadcast' → re-posting something they adopted; ATTRIBUTION is
--    mandatory: origin_handle + origin_signal_id + origin_reaction_id let
--    chains be reconstructed (signal→curious→consume→broadcast→curious…).
create table signals (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references users(id) on delete cascade,
  world              text not null references worlds(id),
  item_text          text not null,
  link               text,
  kind               text not null check (kind in ('obsesion','broadcast')),
  obsesion_id        uuid references obsesiones(id) on delete set null,
  origin_handle      text,                                            -- who influenced this broadcast
  origin_signal_id   uuid references signals(id) on delete set null,  -- immediate parent
  origin_reaction_id uuid,                                            -- curious reaction that led here (FK below)
  created_at         timestamptz not null default now()
);
create index signals_user_idx         on signals (user_id);
create index signals_world_idx        on signals (world);
create index signals_origin_sig_idx   on signals (origin_signal_id);
create index signals_origin_handle_idx on signals (origin_handle);

-- ── reactions ── curious = PROPAGATION (new adoption, counts toward k).
--    love_too = CONVERGENCE (already-shared taste, NEVER counts). save = bookmark.
create table reactions (
  id               uuid primary key default gen_random_uuid(),
  actor_id         uuid not null references users(id) on delete cascade,
  target_type      text not null check (target_type in ('signal','obsesion','taste')),
  target_ref       uuid not null,                                     -- id of the targeted entity
  target_signal_id uuid references signals(id) on delete set null,    -- feed item reacted to
  world            text not null references worlds(id),
  reaction_type    text not null check (reaction_type in ('curious','love_too','save')),
  origin_handle    text,                                              -- originator (curious attribution)
  origin_signal_id uuid references signals(id) on delete set null,
  created_at       timestamptz not null default now()
);
create index reactions_target_idx  on reactions (target_type, target_ref);
create index reactions_actor_idx   on reactions (actor_id);
create index reactions_curious_idx on reactions (reaction_type) where reaction_type='curious';

-- stance is mutually exclusive: at most ONE of curious|love_too per (actor,
-- target). You cannot be newly-curious AND already-love the same item. This is
-- what keeps k honest.
create unique index reactions_one_stance_uq
  on reactions (actor_id, target_type, target_ref)
  where reaction_type in ('curious','love_too');

-- save is an orthogonal bookmark axis: at most one save per (actor, target),
-- allowed to coexist with a stance.
create unique index reactions_one_save_uq
  on reactions (actor_id, target_type, target_ref)
  where reaction_type = 'save';

-- close the loop: a broadcast's originating curious reaction
alter table signals add constraint signals_origin_reaction_fk
  foreign key (origin_reaction_id) references reactions(id) on delete set null;

-- ── consume_confirms ── the consumption metric: did a curious reaction turn
--    into real consumption? One per curious reaction.
create table consume_confirms (
  id           uuid primary key default gen_random_uuid(),
  reaction_id  uuid not null unique references reactions(id) on delete cascade,
  state        text not null check (state in ('yes','not_yet')),
  confirmed_at timestamptz not null default now()
);

-- ── friend_edges ── confirmed connections from the friend-confirm step.
--    Handle-based to match existing slug semantics + the matching engine.
create table friend_edges (
  id            uuid primary key default gen_random_uuid(),
  from_handle   text not null,
  to_handle     text not null,
  mutual_friend text,
  common_count  int not null default 0,
  created_at    timestamptz not null default now(),
  unique (from_handle, to_handle)
);
create index friend_edges_from_idx on friend_edges (from_handle);
create index friend_edges_to_idx   on friend_edges (to_handle);

-- ── notifications ── influence events surfaced to a recipient.
create table notifications (
  id           uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references users(id) on delete cascade,
  actor_id     uuid references users(id) on delete set null,
  type         text not null,            -- 'curious'|'consume'|'broadcast'|'reach'|…
  target_ref   uuid,
  world        text references worlds(id),
  seen         boolean not null default false,
  created_at   timestamptz not null default now()
);
create index notifications_recipient_idx on notifications (recipient_id, seen);

-- ── events ── instrumentation log. Append-only. Written ONLY via logEvent().
create table events (
  id         bigint generated always as identity primary key,
  event_name text not null,
  handle     text,
  source_ref text,
  world      text references worlds(id),
  props      jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index events_name_idx   on events (event_name);
create index events_handle_idx on events (handle);

-- ── RLS ── enabled everywhere; this session writes via the service-role key
--    (server-side), which bypasses RLS. No anon policies yet — later sessions
--    add granular read/write policies for the logged-in feed. `worlds` stays
--    publicly readable (static reference data).
alter table users            enable row level security;
alter table taste            enable row level security;
alter table obsesiones       enable row level security;
alter table signals          enable row level security;
alter table reactions        enable row level security;
alter table consume_confirms enable row level security;
alter table friend_edges     enable row level security;
alter table notifications    enable row level security;
alter table events           enable row level security;
alter table worlds           enable row level security;
create policy worlds_read on worlds for select using (true);
