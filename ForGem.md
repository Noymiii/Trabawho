# ForGem.md — Trabawho Execution Log

## Execution History

---

### Supabase Migration: Initial Schema & Auth Trigger
**Date:** 2026-05-15
**File:** `supabase/migrations/001_initial_schema.sql`
**Source Models:** `backend/src/models/index.js` (Sequelize/MySQL → Supabase/PostgreSQL)

#### Summary
Converted all six Sequelize models (integer PKs, MySQL ENUMs, JSON) into a production-ready Supabase PostgreSQL migration. All tables use UUID primary keys, explicit Postgres ENUM types, and JSONB for the skills column. The `profiles` table references `auth.users` and is auto-populated via a trigger on new user sign-up. Row Level Security (RLS) is intentionally not configured in this phase.

---

### Phase 1.2: Frontend Auth Integration
**Date:** 2026-05-15
**Dependency Added:** `@supabase/supabase-js` (installed via npm)

#### Summary
Ripped out the legacy Express/JWT authentication layer and replaced it natively with the Supabase client SDK. A singleton client was created; the AuthContext was rewritten to use Supabase session management; and both auth pages were updated to call Supabase auth methods directly.

#### Change Log
| File | Action | Notes |
|------|--------|-------|
| `frontend/src/lib/supabase-client.ts` | **Created** | Singleton `createClient()` using `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` |
| `frontend/src/contexts/AuthContext.tsx` | **Rewritten** | Uses `getSession()` on mount + `onAuthStateChange()` listener; fetches `public.profiles`; exposes `session`, `user`, `profile`, `token` (access_token alias for SocketContext compatibility) |
| `frontend/src/pages/Login.tsx` | **Rewritten** | Calls `supabase.auth.signInWithPassword()` via context; redirects to `/dashboard` on success |
| `frontend/src/pages/Register.tsx` | **Rewritten** | Calls `supabase.auth.signUp()` via context with `options.data: { full_name, role }` so `handle_new_user` trigger populates `public.profiles` |

---

### Phase 1.5: Row Level Security Configured
**Date:** 2026-05-15
**File:** `supabase/migrations/002_rls_policies.sql`

#### Summary
Enabled Row Level Security on all six public tables and created granular policies using `auth.uid()`. All policies are scoped to the `authenticated` role. No anonymous access is permitted on any table.

#### Policies Applied
| Table | Action | Condition |
|-------|--------|-----------|
| `profiles` | SELECT | `true` (any authenticated user) |
| `profiles` | UPDATE | `auth.uid() = id` |
| `worker_profiles` | SELECT | `true` (any authenticated user) |
| `worker_profiles` | INSERT | `auth.uid() = user_id` |
| `worker_profiles` | UPDATE | `auth.uid() = user_id` |
| `worker_profiles` | DELETE | `auth.uid() = user_id` |
| `jobs` | SELECT | `true` (any authenticated user) |
| `jobs` | INSERT | `auth.uid() = customer_id` |
| `jobs` | UPDATE | `auth.uid() = customer_id` |
| `jobs` | DELETE | `auth.uid() = customer_id` |
| `swipes` | SELECT | `auth.uid() = swiper_id` |
| `swipes` | INSERT | `auth.uid() = swiper_id` |
| `swipes` | UPDATE | `auth.uid() = swiper_id` |
| `matches` | SELECT | `auth.uid() = worker_id OR customer_id` |
| `matches` | UPDATE | `auth.uid() = worker_id OR customer_id` |
| `messages` | SELECT | `auth.uid() = sender_id OR receiver_id` |
| `messages` | INSERT | `auth.uid() = sender_id OR receiver_id` |

---

## Object Manifest

### ENUMs
| Type Name            | Values                                      |
|----------------------|---------------------------------------------|
| `user_role`          | `customer`, `worker`, `admin`               |
| `worker_availability`| `available`, `busy`, `offline`              |
| `job_status`         | `open`, `matched`, `completed`, `cancelled` |
| `swipe_direction`    | `left`, `right`                             |
| `match_status`       | `matched`, `completed`, `cancelled`         |

### Tables
| Table             | Primary Key                          | Notable Constraints                          |
|-------------------|--------------------------------------|----------------------------------------------|
| `profiles`        | `id UUID` → `REFERENCES auth.users`  | `ON DELETE CASCADE`                          |
| `worker_profiles` | `id UUID`                            | `UNIQUE (user_id)` — one profile per user    |
| `jobs`            | `id UUID`                            | FK: `customer_id → profiles`                 |
| `swipes`          | `id UUID`                            | FK: `swiper_id → profiles`; `target_id UUID` |
| `matches`         | `id UUID`                            | `UNIQUE (worker_id, job_id)`                 |
| `messages`        | `id UUID`                            | FK: `sender_id`, `receiver_id`, `match_id`   |

### Functions & Triggers
| Object                  | Type     | Description                                                                 |
|-------------------------|----------|-----------------------------------------------------------------------------|
| `public.handle_new_user`| FUNCTION | Inserts a row into `public.profiles` from `auth.users` metadata on sign-up |
| `on_auth_user_created`  | TRIGGER  | `AFTER INSERT ON auth.users` — fires `handle_new_user()` per row           |

---

## Notes
- **RLS:** Fully configured in `002_rls_policies.sql`. All tables are locked to `authenticated` role with `auth.uid()`-scoped policies.
- **Email/Password columns** are intentionally absent from `profiles` — Supabase Auth owns those.
- `target_id` in `swipes` is `UUID` (no FK) to support polymorphic targets (`worker` or `job`).
- `hourly_rate` from the legacy Sequelize `WorkerProfile` model was not included per the spec; add via a future migration if needed.
