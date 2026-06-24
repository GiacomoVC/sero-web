# BUILD_STATE.md — Sero web, cross-session memory

Every session **reads and updates** this file. It's the shared memory across
otherwise-blind sessions. Pair it with [`SCHEMA.md`](SCHEMA.md) (the frozen data
contract).

---

## Where we are

Sero is becoming an **identity-propagation app**, not just a quiz. The quiz
(taste swipe, 6 worlds, typed favorites) and the friend-confirmation step are
built and working — **their logic/UX are frozen** unless a session is explicitly
about them.

## Session 1 — foundation (DONE)

**Backend: Supabase free tier** (Postgres + Auth + Realtime). Chosen over
Firebase because the roadmap (feed, reactions, attribution chains, k-factor) is
inherently relational; chains are recursive joins → Postgres. One platform
covers SQL + auth + realtime at $0.

**Auth: provisioned, not yet wired into UI.** Google OAuth primary + email
magic-link fallback (both native to Supabase). The **quiz stays anonymous** —
users are created server-side at submit time. On future login we *claim* the
existing `users` row by verified email/handle (`users.auth_user_id`). Helpers
live in [`lib/auth.ts`](lib/auth.ts) (skeleton; no login surface yet).

**Schema: [`SCHEMA.md`](SCHEMA.md)** + DDL
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Models
traces-in-worlds + full attribution from day one (no future migration needed for
world-page / k). Tables: `worlds, users, taste, obsesiones, signals, reactions,
consume_confirms, friend_edges, notifications, events`. RLS on everywhere;
writes go via the service-role key for now.

**Migrated off Google Sheets (data-layer only — zero quiz/friend UX change):**
- [`app/api/submit/route.ts`](app/api/submit/route.ts) → writes `users`+`taste`
  to Supabase, fixes friend-match finding, returns the same `{slug, matches}`.
- [`app/api/confirm-friend/route.ts`](app/api/confirm-friend/route.ts) → inserts
  `friend_edges`.
- [`app/api/plans/route.ts`](app/api/plans/route.ts) → builds `ExportData` from
  Supabase via [`lib/db/export.ts`](lib/db/export.ts). **Matching engine
  (`lib/matching/*`) untouched.**

**Instrumentation skeleton:** `events` table + [`lib/logEvent.ts`](lib/logEvent.ts)
— the single `logEvent(name, {handle, source_ref, world, ...props})` helper all
later sessions call. Already used at quiz-submit and friend-confirm. **No
dashboards, no broad surface wiring yet.** ⚠️ Pass extra fields **flat** (e.g.
`logEvent('x', { handle, match_count: 3 })`) — they're collected into the
`events.props` column automatically. Do NOT wrap them in a `props:` key (causes
double-nesting `props.props`).

**Status: Supabase connected + verified live (2026-06-23).** Project ref
`ipmjyfjtleycwryysfur` (region `sa-east-1`). Smoke-tested end-to-end: quiz
submit writes `users`+`taste`, `referred_by` set, live friend-match finding
returns shared-world matches, `logEvent` writes `events`. Test data cleaned;
DB empty, `worlds` seed (8) intact. `.env.local` holds the keys locally
(gitignored). **For prod: set the same 4 vars in Vercel** — the
`NEXT_PUBLIC_*` ones are inlined at build, so they must exist before the build
runs.

**Data-layer helpers:** [`lib/db/users.ts`](lib/db/users.ts) (create user +
collision-counted handle), [`lib/db/matches.ts`](lib/db/matches.ts),
[`lib/db/friends.ts`](lib/db/friends.ts), [`lib/db/export.ts`](lib/db/export.ts).
Supabase clients: [`lib/supabase/admin.ts`](lib/supabase/admin.ts) (service
role, server-only), [`lib/supabase/server.ts`](lib/supabase/server.ts) (SSR),
[`lib/supabase/client.ts`](lib/supabase/client.ts) (browser).

**Legacy:** `apps-script/Code.gs` kept as deprecated reference/backup; not called
at runtime. One-time data import:
[`scripts/migrate-to-supabase.mjs`](scripts/migrate-to-supabase.mjs).

**Note:** brand color tokens follow the **codebase**
([`tailwind.config.ts`](tailwind.config.ts): coral `#FF6B5E`, plum `#5B2D82`,
cream `#FAF8F5`, ink `#18181B`, sand `#E8E3DC`), which differ from the values in
the original brief. Don't restyle.

---

## Session 2 — obsessions-first capture (DONE)

Added an **obsesiones** step to the quiz, **right after `personal` (Lo básico)
and before `worlds`** — current/shareable signals are now secured before the
long swipe, so they survive mid-quiz abandonment. Quiz logic/UX were otherwise
left frozen.

**World-mapping decision — Option A (map to seeded worlds, keep the label in
`category`).** The dropdown is broader than the 8 worlds (adds **gastronomía**
+ **viajes**). Since `obsesiones.world` is a `NOT NULL` FK → `worlds(id)` and
the seed has no `gastronomia`/`viajes` rows, those (and `otro`) persist under
**`world='otro'`** with the human label kept in **`obsesiones.category`**. The
other 7 map 1:1 (música→`musica`, películas→`peliculas`, …). **No new
migration** → the FK is always satisfied and submit can never 502 on an
unapplied migration. The category→world map is the single source
[`lib/worlds.ts`](lib/worlds.ts) `OBSESION_CATEGORIES` / `worldForCategory()`
("never hardcode the set elsewhere"). If a later session wants gastronomía/
viajes as first-class worlds (own world-page), add `worlds` rows via a new
`000N_*.sql` **and** flip their `world` in `OBSESION_CATEGORIES` — then
backfill existing rows from `category`.

**Files touched:**
- [`lib/types.ts`](lib/types.ts) — `QuizSchema.obsesiones?: {world, category?,
  item_text, link?}[]`.
- [`lib/worlds.ts`](lib/worlds.ts) — `OBSESION_CATEGORIES` (10 cats + emoji +
  world) and `worldForCategory()`.
- [`components/quiz/Quiz.tsx`](components/quiz/Quiz.tsx) — new
  `{kind:'obsesiones'}` phase + `ObsesionesStep`; `next`/`back`/`canAdvance`
  wiring; **macro-progress base shifted `2→3`** (personal·obsesiones·worlds);
  obsesiones built into the `submit()` payload (empty rows pruned).
  `STORAGE_KEY` bumped **`sero_quiz_v5 → v6`** (resets any stale pre-obsesiones
  draft instead of half-initializing).
- [`lib/db/users.ts`](lib/db/users.ts) — `createUserFromQuiz` inserts one
  `obsesiones` row per filled obsession **after** user+taste (this is the
  `/api/submit` persistence path). **Best-effort**: on insert error it logs and
  continues (never throws — user+taste already exist; a throw would 502 a
  successful signup). Fires `logEvent('obsesion_created', {handle, world})` per
  saved row.

**Advance gate:** obsesiones requires **≥1 filled row** (`item_text` non-empty)
to continue — encourage 3, allow blanks, but secure at least one. **Title** is
lowercased to match the other headlines; subtitle kept verbatim.

**NOT done this session (deferred):** `signals(kind='obsesion')` are **not**
written yet — this is capture-only. When the feed session lands, derive a
`signal` per obsession (`obsesion_id` FK already exists) so obsessions appear in
the feed. The "Public identity page" / feed / reactions remain as below.

**Verified (2026-06-23):** real `POST /api/submit` end-to-end against live
Supabase — wrote 2 `taste` + 3 `obsesiones` rows (blank row skipped; gastronomía
& viajes → `world='otro'`, category preserved; link stored), plus 3
`obsesion_created` + 1 `quiz_submitted` events. Test row deleted (cascade);
`tsc --noEmit` clean.

## Setup checklist (do once, outside the codebase)

1. **Create a Supabase project** (free tier). Note the project pauses after 7
   days of inactivity — un-pause in the dashboard.
2. **Run the schema:** Supabase → SQL Editor → paste
   `supabase/migrations/0001_init.sql` → Run.
3. **Env vars** (`.env.local` locally, Vercel project settings in prod) — see
   `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `WEBHOOK_SECRET`, (`NEXT_PUBLIC_SITE_URL`).
4. **Auth providers** (for later sessions; safe to do now):
   - Supabase → Authentication → Providers → **Google**: enable, paste a Google
     Cloud OAuth client ID/secret. In Google Cloud Console create an OAuth
     client (Web), authorized redirect URI =
     `https://<project>.supabase.co/auth/v1/callback`.
   - **Email** (magic-link) is on by default. Built-in SMTP is rate-limited
     (~few/hour) — fine while Google is primary; add custom SMTP before scaling
     magic-link.
   - Add your site URL + `/auth/callback` to Supabase → Authentication → URL
     Configuration (redirect allow-list).
5. **Migrate existing data (optional, once):**
   `node --env-file=.env.local scripts/migrate-to-supabase.mjs`

---

## Next sessions (checklist — keep this updated)

- [x] **Quiz reorder** — obsessions-first capture. **DONE (Session 2)** — writes
      `obsesiones`. ⚠️ `signals(kind='obsesion')` still TODO (feed session).
- [ ] **Public identity page** — replace/extend `app/[slug]/page.tsx` to render a
      user's worlds + taste + obsessions. Reads from `users`/`taste`/`obsesiones`
      (add public-read RLS or read server-side via service role). Use the
      Frontend Design plugin here.
- [ ] **Logged-in feed + reactions + consume-confirm** — wire `lib/auth.ts` into
      a login surface; build the feed from `signals`; write `reactions`
      (`curious`/`love_too`/`save`) and `consume_confirms`. Enforce the
      curious/love_too distinction (the schema already does).
- [ ] **Influence notifications + instrumentation** — write `notifications` on
      curious/consume/broadcast; call `logEvent` at every surface (reach, react,
      consume, broadcast, open).
- [ ] **k-factor dashboard** — recursive CTE over `signals.origin_signal_id` /
      `reactions.target_signal_id`; count `curious` only, weight by
      `consume_confirms.state='yes'`. Admin-gated like `/admin/plans`.

## Conventions

- Identity key everywhere is `handle` (== slug). `referred_by`/`friend_edges`
  are handle-based to match the matching engine.
- All `events` writes go through `logEvent` — never insert into `events`
  directly.
- Server-side privileged writes use `createAdminClient()`; user-scoped reads use
  the SSR/browser clients once RLS policies exist.
- Add new migrations as `supabase/migrations/000N_*.sql`; never edit a shipped
  migration after data exists.
