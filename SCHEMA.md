# SCHEMA.md — Sero data contract (FROZEN)

This is the **contract**. Later sessions **read** this file; they do not
re-invent it. The canonical DDL lives in
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) — this
document explains the *why* and must be kept in sync with it.

**Backend:** Supabase (Postgres + Auth + Realtime), free tier.
**Identity:** `users.handle` == today's quiz slug (`toSlug(name, apellido)`).
**Design goal:** model **traces-in-worlds** and **attribution** from day one, so
the future world-page, feed, and k-factor dashboard need **no migration**.

---

## The world is the unifying unit

Every signal, reaction, obsession, and event carries a `world` tag
(`worlds.id`). Worlds map to the current 8 quiz categories (`musica`,
`peliculas`, `series`, `anime`, `libros`, `videojuegos`, `deportes`, `otro`),
seeded in `worlds`. To add a world, insert a row — never hardcode the set
elsewhere. This is what lets a world be aggregated later (the world-page).

## Two kinds of taste signal

| | `taste` | `obsesiones` |
|---|---|---|
| When | set once, at quiz time | living, added/edited any time |
| Shape | per-world records (swipe result) | one specific item + link |
| Mutable | no | yes (`updated_at`) |
| Purpose | identity baseline, matching | the active propagation signals |

`taste` preserves the existing quiz shape verbatim per world in `records`:
swipe worlds → `TasteRecord[]`, `deportes` → `{relation,typed}`, `otro` →
`string`. The matching engine reconstructs `QuizSchema.taste` from these rows
([`lib/db/export.ts`](lib/db/export.ts)) — `extractTaste` reads only
`payload.taste`, so nothing else is needed.

## Attribution is mandatory (this computes k)

A propagation chain is:

```
signal ─► reach ─► curious ─► consume ─► broadcast ─► (new) curious ─► …
```

Every **broadcast-signal** and every **curious-reaction** traces to the
originator who caused it, so chains can be reconstructed:

- `signals.origin_signal_id` — the immediate parent signal a broadcast derives
  from. Walk it upward (recursive CTE) to reach the root.
- `signals.origin_reaction_id` — the **curious** reaction that led the user to
  broadcast. Closes the loop `curious → consume → broadcast`.
- `reactions.target_signal_id` — the feed signal a reaction targets (immediate
  parent in the chain).
- `*.origin_handle` — denormalized originator handle, for fast attribution
  display without a join.

**`curious` vs `love_too` is the crux:**
- `curious` = **propagation** (a *new* adoption caused by someone). **Counts
  toward k.**
- `love_too` = **convergence** (you *already* shared this taste). **Never counts.**

They are mutually exclusive per `(actor, target)` — enforced by the partial
unique index `reactions_one_stance_uq`. You cannot be newly-curious *and*
already-love the same item. `save` (bookmark) is an orthogonal axis
(`reactions_one_save_uq`) and may coexist with a stance; it never affects k.

**k** for a user = the `curious` reactions their signals generate (count
`reactions` where `reaction_type='curious'` along their signal subtree),
optionally weighted by `consume_confirms.state='yes'` for the *consumed* rate.
The FKs above make both the first-order count and the full recursive subtree
computable in SQL.

---

## Tables

- **worlds** — reference unit; seeded with the 8 categories. Publicly readable.
- **users** — `handle` (unique, == slug), profile (`name`, `apellido`, `ciudad`,
  `edad`, `whatsapp`), `email` + `auth_user_id` (nullable; linked when the user
  logs in via Google/magic-link), `referred_by` (logical ref → `handle`),
  `worlds` (selected), `logistics` (jsonb: rol/plus_one/disponibilidad/dieta),
  `created_at`.
- **taste** — one row per `(user, world)`; `records` jsonb (existing shape).
- **obsesiones** — `{user, world, category, item_text, link, created_at,
  updated_at}`; living, mutable.
- **signals** — `{user, world, item_text, link, kind:'obsesion'|'broadcast',
  obsesion_id, origin_handle, origin_signal_id, origin_reaction_id, created_at}`.
- **reactions** — `{actor, target_type:'signal'|'obsesion'|'taste', target_ref,
  target_signal_id, world, reaction_type:'curious'|'love_too'|'save',
  origin_handle, origin_signal_id, created_at}`.
- **consume_confirms** — `{reaction (the curious one), state:'yes'|'not_yet',
  confirmed_at}`; one per reaction.
- **friend_edges** — `{from_handle, to_handle, mutual_friend, common_count,
  created_at}`; handle-based, matches the engine and the friend-confirm step.
- **notifications** — `{recipient, actor, type, target_ref, world, seen,
  created_at}`.
- **events** — instrumentation log `{event_name, handle, source_ref, world,
  props jsonb, created_at}`; append-only, written only via
  [`logEvent`](lib/logEvent.ts).

## RLS

RLS is **enabled on every table**. This session performs all writes with the
**service-role key** server-side ([`lib/supabase/admin.ts`](lib/supabase/admin.ts)),
which bypasses RLS — so there are **no anon policies yet** (anon/authenticated
clients can't read or write directly). `worlds` is the exception (public read).
Later sessions add granular policies as the logged-in feed and public identity
page are built.

## DDL

The authoritative DDL is in
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql). Apply
it once in the Supabase SQL editor (or `supabase db push`). Do not edit the
shipped migration after data exists — add a new `000N_*.sql` migration instead.
