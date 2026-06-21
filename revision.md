# MuscleMap — Revision Cheat-Sheet

A quick map of the app: frontend pages, what's static vs backend-wired, and the
backend domain models. (Snapshot after EM12 — sprint complete.)

> **EM12 (Product Polish):** the UI now has a real **dark mode**. Colour runs through
> semantic tokens (`bg-surface`/`text-ink`/`border-line`…) defined for light (`:root`)
> and dark (`.dark`) in `src/index.css` and exposed via `@theme inline`; the top-bar
> **appearance toggle** (Sun/Moon/Monitor) cycles light → dark → system (persisted,
> applied before first paint). Shared `EmptyState`/`ErrorState` (`components/StateMessage`),
> a global focus ring + `prefers-reduced-motion` guard round out the polish.

---

## Frontend pages (routes in `src/config/routes.ts` / `src/App.tsx`)

| Route | Page | Data source |
|-------|------|-------------|
| `/` | `HomePage` → `Dashboard` (onboarded) or session launcher | **Backend** (profile + workouts) for the dashboard; static session cards |
| `/session/:id` | `SessionPage` | **Static** plan (dataset + pure generator); "Start workout" → backend |
| `/exercises` | `ExerciseBrowserPage` | **Backend** catalogue API (EM13), bundled DB fallback |
| `/exercise/:id` | `ExerciseDetailPage` | **Backend** catalogue API (EM13), bundled DB fallback |
| `/map` | `MuscleMapPage` (3D anatomy) | **Backend** muscle taxonomy (EM13) + **static** `.glb` model/heads |
| `/program` | `ProgramGeneratorPage` | **Pure** client generator; **config from backend** (EM13, dual-path), prefilled from profile if signed in |
| `/progress` | `AnalyticsPage` | **Backend** (workouts + bodyweight), localStorage fallback |
| `/intel` | `MuscleIntelPage` | **Frontend-pure**, computed from backend workout logs + static taxonomy |
| `/admin` | `AdminPage` | **Backend only** (no fallback) |
| `/coach` | `CoachStudioPage` | **Backend only** (COACH/ADMIN) |
| `/content` | `ContentLibraryPage` | **Backend only** (published coach content) |
| `/subscription` | `SubscriptionPage` | **Backend** (dual-path: localStorage mock if no backend) |
| `/onboarding` | `OnboardingPage` | **Backend** (profile), localStorage fallback |

**Catalogue migrated to the backend (EM13).** The 873-exercise catalogue (incl.
the curated video mapping) and the muscle taxonomy now live in the database
(`exercises`/`muscles` + child tables, Flyway `V5`), seeded idempotently on
startup from `backend/.../resources/catalog/*.json` by `CatalogBootstrap` and
served read-only at `GET /api/v1/catalog/**`. The frontend consumes them through
the **same** `IExerciseRepository`/`IMuscleRepository` interfaces — now
`ApiExerciseRepository`/`ApiMuscleRepository` (in `src/data/api/`) when
`VITE_API_BASE_URL` is set, with the bundled `Static*` repositories as a
transparent **fallback** (dual-path), so the offline / GitHub-Pages deploy keeps
working with no backend. **Still static:** the 3D `.glb` model + head→mesh
mapping (inherently tied to the asset) and the muscle *heads* taxonomy used by it.

---

## Frontend API clients (`features/**/*Api.ts`)

Behaviour depends on `VITE_API_BASE_URL` (+ a stored JWT):

- **Dual-path** (backend when wired, else localStorage so the static GH-Pages
  deploy still works): `profileApi`, `workoutApi`, `bodyweightApi`, `subscriptionApi`.
- **Catalogue** (`catalogApi`, EM13): public `GET /catalog/**`, memoised one-shot
  fetch; falls back to the bundled dataset (not localStorage) when absent/offline.
- **Generator config** (`generatorConfigApi`, EM13): public `GET /generator/config`,
  memoised; the generator runs on it via `useGeneratorConfig`, falling back to the
  bundled `BUNDLED_GENERATOR_CONFIG`. The *algorithm* stays client-side; only its
  tuning is server-owned. A parity test keeps the served JSON == the bundled config.
- **Backend-only** (shared server state, nothing meaningful to fake locally):
  `adminApi`, `coachApi` (coach studio + content library).
- **Auth** (`authApi`): exchanges Google credential for a platform JWT when a
  backend exists; otherwise decodes the Google ID token client-side (role-less).

---

## Backend domain models (`@Entity` — Flyway-managed; user data has UUID PKs, the catalogue uses natural string PKs)

| Entity | Table | Holds | Written via |
|--------|-------|-------|-------------|
| `User` | `users` | identity, role (USER/COACH/ADMIN), auth provider, enabled | auth, admin |
| `UserProfile` | `user_profiles` | onboarding (age/gender/metrics/goal/frequency/equipment/injuries), `onboardingCompleted` | `/profile` |
| `GeneratedProgram` | `generated_programs` | a saved generated routine (split/days/goal + JSON payload) | *seam exists; programs are generated client-side for now* |
| `WorkoutSession` | `workout_sessions` | a tracked workout (status, timing, duration) | `/workouts` |
| `WorkoutExercise` | `workout_exercises` | per-exercise sets/reps/weight/rpe/completed within a session | `/workouts` |
| `BodyweightEntry` | `bodyweight_entries` | weigh-in per day (upsert by date) | `/bodyweight` |
| `CoachVideo` | `coach_videos` | coach content (type, urls, premium, published) | `/coach/videos` |
| `Subscription` | `subscriptions` | plan (FREE/PREMIUM), status, period, external ref | `/subscription` |
| `Muscle` / `MuscleHead` | `muscles` / `muscle_heads` | taxonomy (kebab string ids) | seeded (EM13) |
| `Exercise` (+ `exercise_{instructions,muscles,media}`) | `exercises` (+ child) | catalogue: enums, involvements, media | seeded (EM13) |

> Enum-like columns are stored as `VARCHAR + CHECK` kept in lock-step with Java
> enums (`Role`, `Gender`, `FitnessLevel`, `TrainingGoal`, `SplitType`,
> `SessionStatus`, `CoachContentType`, `SubscriptionPlan`, `SubscriptionStatus`).

---

## Backend endpoints (controllers, base `/api/v1`)

| Path | Controller | Access |
|------|------------|--------|
| `/auth/{register,login,google,me}` | `AuthController` | public (except `/me`) |
| `/profile` (GET, PUT) | `ProfileController` | authenticated, own profile |
| `/workouts` (CRUD) | `WorkoutController` | authenticated, owner-scoped |
| `/bodyweight` (POST/GET/DELETE) | `BodyweightController` | authenticated, owner-scoped |
| `/subscription` (+`/upgrade`,`/cancel`) | `SubscriptionController` | authenticated, own plan |
| `/coach/videos` (CRUD + publish) | `CoachController` | COACH or ADMIN, owner-scoped |
| `/content/videos` (GET, `/{id}`) | `ContentController` | any signed-in user; premium-gated (402) |
| `/admin/**` | `AdminController` | ADMIN |
| `/catalog/{exercises,muscles}` (+`/{id}`) | `CatalogController` | public (GET, reference data) |
| `/generator/config` | `GeneratorController` | public (GET, reference data) |
| `/meta` | `MetaController` | public |

Layering everywhere: **Controller → Service → Repository**, uniform `ApiError`
envelope, stateless JWT auth. Full interactive reference: **Swagger UI** at
`/swagger-ui.html` when the backend runs.

---

## Demo walkthrough (page by page, as you'd narrate it live)

**Sign-in (top bar).** Before anything else, the avatar in the corner is the
auth entry point. Signing in uses **Google Identity Services**; when a backend is
configured the Google credential is exchanged at `POST /api/v1/auth/google` for
our own platform JWT (which carries the user's role), and that token is what every
other API call sends as a `Bearer`. With no backend it falls back to decoding the
Google token in the browser, so the static deploy still "signs you in" — just
without a server-issued role.

**Home (`/`).** This page has two faces. For a brand-new or signed-out visitor
it's a **static** session launcher (tappable workout cards defined in config).
Once you're signed in and onboarded it becomes a personalized **dashboard**: it
calls `GET /api/v1/profile` for your goal/level and `GET /api/v1/workouts` for
your history, then derives your streak, this-week count, weekly-activity strip and
recent workouts on the client. So the layout is ours, but the numbers are live
from the API (with a localStorage cache so it paints instantly).

**Onboarding (`/onboarding`).** A mobile-first wizard that collects age, gender,
body metrics, level, goal, weekly frequency, equipment and injuries. On finish it
sends `PUT /api/v1/profile`; the server decides `onboardingCompleted` itself rather
than trusting the client. The same screen doubles as "edit profile". No backend?
It saves to localStorage so the flow never dead-ends.

**Exercises (`/exercises`).** Fully **static** — this is the 873-exercise
free-exercise-db catalogue bundled into the app. Search, muscle-group and equipment
filters all run in-memory over the local dataset (filters live in the URL so they
survive back-navigation). No API call at all; it's served through a repository
interface so it *could* become an API later with zero UI change.

**Exercise detail (`/exercise/:id`).** Also **static**: the animated
start/end-frame demo, the metadata badges, the numbered instructions, and a
read-only 3D body highlighting the muscles that exercise trains — all from the
bundled dataset and taxonomy.

**Muscle map (`/map`).** **Static** as well. A rotatable 3D anatomy model
(`muscles.glb`, lazy-loaded) whose meshes are mapped to our muscle taxonomy;
tapping a muscle jumps to the browser pre-filtered to it. Pure client-side
three.js — no backend.

**Plan / generator (`/program`).** A **pure client-side** algorithm: you pick
split, days and equipment and it builds a balanced, non-redundant week with a
weekly volume readout, recovery spacing and a 4-week progression plan. The only
backend touch is convenience — if you're signed in it reads your profile to
pre-fill the form ("Tuned to your profile"). The generation itself never leaves
the browser — but since EM13 its **tuning** (splits, goal schemes, weekly layouts,
progression) is fetched from `GET /api/v1/generator/config` (dual-path), so the
rules are server-owned while the algorithm stays client-side; offline it uses the
bundled config.

**Progress (`/progress`).** This is **backend-driven analytics**. It reads
`GET /api/v1/workouts` to compute volume, sets, weekly bar charts and personal
records (best estimated 1RM), and `GET /api/v1/bodyweight` for the bodyweight
trend; logging a weigh-in posts to `POST /api/v1/bodyweight` (upsert per day). All
charts are hand-rolled SVG — no charting library. Falls back to the local cache
offline.

**Intel (`/intel`).** A hybrid: the *engine* is **frontend-pure**, but it's fed by
**backend** data. It takes your `GET /api/v1/workouts` history and folds it onto
muscle groups (using the static taxonomy) to show weekly effective sets vs
evidence-based MEV/MAV/MRV landmarks, recovery readiness, and a recommendation per
group. No dedicated API — it reuses the workout data.

**Premium (`/subscription`).** Shows your current plan and a FREE-vs-PREMIUM
comparison. It reads `GET /api/v1/subscription` and the upgrade/cancel buttons hit
`POST /api/v1/subscription/upgrade` and `/cancel`. This is **mock billing** — no
Stripe — but the entitlement it grants is real and enforced server-side. Works
dual-path: with no backend it simulates the plan in localStorage so you can still
demo the flow.

**Coach content (`/content`).** **Backend-only.** Calls `GET /api/v1/content/videos`
to list everything coaches have published. This is where the subscription gate
shows its teeth: **premium items you're not entitled to come back locked with their
video URL stripped by the server** — the card shows a lock overlay and an "Unlock
with Premium" button instead of a play link. Trying to open one directly hits the
402 guard on `GET /content/videos/{id}`.

**Coach studio (`/coach`).** **Backend-only, COACH/ADMIN only.** The authoring side:
`GET /api/v1/coach/videos` lists the coach's *own* library (drafts + published),
and create/edit/publish/delete map to `POST`/`PUT`/`PATCH …/publish`/`DELETE`. Every
call is owner-scoped server-side — a coach can only ever see and touch their own
content. Publishing is a deliberate separate step from saving.

**Admin (`/admin`).** **Backend-only, ADMIN only.** A platform dashboard from
`GET /api/v1/admin/metrics` (user/profile/program/session/content counts) plus a
user table from `GET /api/v1/admin/users`, where role and enabled-status changes
post to `PATCH /api/v1/admin/users/{id}/role|status`. The server refuses to let an
admin lock themselves out.
