# Agent Handoff â€” read this first

This is the entry point for any new session/agent continuing **MuscleMap**.
Read this, then `PROGRESS.md` (current state) and `ROADMAP.md` (what's next).

## ⭐ ACTIVE PROGRAM: PFA Evolution Sprint (started 2026-06-20)
The project is now in a **12-milestone evolution sprint** (ROADMAP → "PFA Evolution Sprint",
EM1–EM12) to become a production-ready fitness platform on a **real backend**. Work
**one milestone at a time**; each must leave the app stable.

- **Backend = Spring Boot 3** (full), in a monorepo **`/backend`** Maven module, deployed on
  **Render**, extensible to Docker/ACR/AKS. **This supersedes the older Supabase plan** still
  referenced lower in this file and in ARCHITECTURE.md's "T1" notes — treat those as historical.
- **EM1 (Backend Foundation) is DONE** (2026-06-20). Spring Boot 3 + PostgreSQL + Flyway
  (7 tables) + layered Controller→Service→Repository + roles (USER/COACH/ADMIN) + Docker +
  Swagger. See `backend/README.md`.
- **EM2 (Authentication & Security) is DONE** (2026-06-20). Stateless **JWT** (HS256) + **BCrypt**
  + **RBAC**; `SecurityConfig` locked down; `com.musclemap.auth` package; endpoints
  `/api/v1/auth/{register,login,google,me}` (logout is client-side — stateless tokens).
  **Google sign-in preserved**: `/auth/google` verifies the Google ID token and maps it to the
  same `User`/`Role` model; the frontend exchanges the GIS credential for a platform JWT when
  `VITE_API_BASE_URL` is set, else falls back to local decode (static deploy unaffected).
  Flyway **V2** adds `users.avatar_url` + `auth_provider`. Verified end-to-end on dockerized
  Postgres: register 201, `/auth/me` 401→200, wrong password 401, validation 400, duplicate 400,
  `/auth/google` 503 until configured, public routes still 200; `mvn test` green (11), `npm run
  build` green. New env for prod: `MUSCLEMAP_JWT_SECRET` (≥32 bytes), `MUSCLEMAP_GOOGLE_CLIENT_ID`.
- **EM3 (Premium Onboarding) is DONE** (2026-06-20). A mobile-first onboarding wizard
  (`features/onboarding/**`) collects age/gender/height/weight/level/experience/goal/frequency/
  equipment/injuries and persists them to `user_profiles` via `GET|PUT /api/v1/profile`
  (`com.musclemap.user.ProfileController` + `UserProfileService`, gated by the `AuthenticatedUser`
  principal; `onboardingCompleted` derived server-side). Frontend degrades to localStorage on the
  static deploy (no backend) — same pattern as EM2. New `ProfileContext` (`needsOnboarding`),
  `/onboarding` route, Home prompt + UserMenu "Edit profile", full EN/FR/AR i18n. Verified
  end-to-end on dockerized Postgres (401 unauth, empty→completed, equipment JSON round-trip, 400 on
  bad enum/range); `mvn test` 16 green, `npm run build`/`lint`/`test` (71) green. No Flyway
  migration (columns existed since V1).
- **EM4 (Personalized Dashboard) is DONE** (2026-06-20). Frontend-only — consumes the EM3 profile,
  no backend change. For a signed-in **onboarded** user `HomePage` renders `features/dashboard/
  Dashboard.tsx` (goal-aware recommended workout via `config/recommendation.config.ts`, streak +
  this-week stat cards, Mon→Sun activity strip, profile summary with Edit-profile link, recent
  workouts, quick actions); signed-out / not-onboarded users keep the original launcher
  (`SessionLanding`). Streak/activity/recent have **no data source until EM6** — `dashboardData.ts`
  returns `EMPTY_ACTIVITY` (honest empty states); `getWorkoutActivity()` is the one seam EM6 swaps.
  16 new EN/FR/AR i18n keys; `npm run build`/`lint`/`test` (**74**, +3 recommendation) green.
- **EM5 (Smart Generator V2) is DONE** (2026-06-20). Frontend-only, pure generator — no
  backend change. The four splits already existed (Full Body / Upper-Lower / PPL / BodyPart =
  "Bro"), so EM5 adds **recovery logic + progressive overload + profile-awareness**.
  `generateProgram` lays the split over a **Mon→Sun calendar** (`WEEKLY_LAYOUTS`) so sessions
  are spaced and the gaps are **rest days** (`DayFocus.Rest`, `WorkoutDay.isRest`); a per-group
  **recovery readout** (`GroupRecovery`, Optimal ≥48h / Overlap) is computed from the layout.
  Each lift carries a goal+mechanic **`OverloadCue`**, and `WorkoutProgram.progression` is a
  **4-week mesocycle** (`config/progression.config.ts`, goal → `ProgressionStrategy`).
  `config/generatorProfile.ts` pre-fills split/days/goal/equipment from the EM3 profile
  ("Tuned to your profile" chip). New enums `Weekday`/`RecoveryStatus`/`ProgressionStrategy`/
  `ProgressionStep`/`OverloadCue`; new EN/FR/AR i18n maps; `mvn` untouched; `npm run test`
  **79** green, `build`/`lint` green.
- **EM6 (Workout Tracking) is DONE** (2026-06-20). A **full runner** (`features/workouts/
  WorkoutRunner.tsx`, reached from a "Start workout" CTA on `SessionPage`) gives a live timer,
  per-exercise check-off + editable reps/weight, and a **Finish** that persists the session
  (sets/reps/weight/duration) and returns home. Backend `com.musclemap.workout`:
  `WorkoutController` (`POST|GET|GET{id}|DELETE /api/v1/workouts`) + `WorkoutSessionService(+Impl)`
  (current-user-scoped, ownership-checked → 404, status defaults `COMPLETED`); DTOs in
  `workout/dto`. Frontend `workoutApi.ts` mirrors `profileApi` (backend when `VITE_API_BASE_URL`
  + token, else `StorageKey.WorkoutLogs` localStorage). The EM4 `getWorkoutActivity()` seam now
  derives from real logs via pure `computeActivity(logs, now)` (streak / weekly strip / recent),
  surfaced through a new `useWorkoutActivity()` hook. **No Flyway migration** (V1 columns).
  `mvn test` **22** green, `npm run test` **86** green, `build`/`lint` green.
- **NEXT = EM7 (Progress Analytics):** bodyweight evolution, frequency, PRs, volume; cards +
  charts + weekly summaries — built on the EM6 session history.

### Run the backend (verify health)
```powershell
cd C:\Users\User\Desktop\cours2emeIng\musclemap\backend
docker compose up -d db        # Postgres on host port 5433
mvn spring-boot:run            # dev profile; http://localhost:8080/swagger-ui.html
mvn test                       # fast unit tests, no DB needed
```

## What this project is (1 paragraph)
A mobile-first **PWA** (React + TS + Vite + Tailwind v4) that visualises which muscles/heads
each exercise trains (primary/secondary/stabilizer), lets you browse by muscle group, and
generates **balanced, non-redundant** workout programs. It's a **PFA** (end-of-year academic
project) + the author's personal tool, designed to evolve into a **commercial coach-content
platform** (author's brother, a pro coach, uploads his own videos as admin -> no copyright +
a moat; later paying subscribers; iOS/Android via Capacitor).

## Where things live
- Code: `C:\Users\User\Desktop\cours2emeIng\musclemap` (git initialised; **not yet committed**).
- Docs: `PROJECT.md` (vision/scope/decisions), `ARCHITECTURE.md` (stack/structure/rules/deployment),
  `DATA_MODEL.md` (taxonomy/entities), `ROADMAP.md` (milestones), `PROGRESS.md` (live status).

## Non-negotiable working rules (from the user)
- **Enums, not magic strings/numbers.** (`erasableSyntaxOnly` is set to `false` in
  `tsconfig.app.json` specifically so TS `enum`s compile â€” do not re-enable it.)
- **OOP + SOLID**, dependency inversion (UI -> repository *interfaces*, never concretes).
- **No hardcoded strings** â€” centralise in `config/`, enums, or const maps.
- **No workarounds/hacks** â€” fix root causes.
- **Clean code**, immutable domain entities (`readonly`).
- **Keep docs current** and **trace your actions** (use the task list).
- Work **iteratively, one milestone at a time** â€” don't binge-build. Confirm scope, then execute.

## Architecture seam to respect
`domain/repositories/IExerciseRepository` is the swap point: `StaticExerciseRepository`
(bundled JSON, now) -> a Supabase implementation (T1) behind the SAME interface, zero UI change.
Hosting grows Vercel -> Vercel+Supabase -> Docker/ACR/AKS without an app rewrite (see ARCHITECTURE.md).

## Verify the project is healthy
```powershell
cd C:\Users\User\Desktop\cours2emeIng\musclemap
npm install          # if node_modules missing
npm run build        # must be green (tsc + vite + PWA)
npm run dev          # local; add `-- --host` to view on iPhone over Wi-Fi
```

## Current status
**Round 4 (2026-06-11) DONE + DEPLOYED.** 3D is the ONLY muscle visualisation now -
all 2D SVG displays were removed at the user request (BodyDiagram, MuscleMapBoard,
geometry/bodyGeometry + test, BodyView enum, view2d/3d + bodyView i18n keys are GONE;
any mention of a 2D/3D toggle further down is historical). Auth has explicit labeled
buttons: GIS standard Sign-in-with-Google pill when signed out; avatar + round logout
icon button (+ labeled sign-out in the profile dropdown) when signed in. LanguageSwitcher
shows the language code closed. Video coverage is COMPLETE: 873/873 exercises, 799 distinct embeddable videos (see PROGRESS.md round 5; tooling in scripts/)
(scripts/match-shorts.mjs proposes title-to-exercise matches from scripts/shorts-list.txt;
all entries hand-reviewed). NOTE: .env.local must be saved WITHOUT a UTF-8 BOM or Vite
silently drops the first env key (auth disables itself locally). Tests 71/71, lint + build green.

**Production-polish pass DONE + DEPLOYED (2026-06).** Live at https://omar692002.github.io/musclemap/
(GitHub Pages, `.github/workflows/deploy.yml`, BASE_PATH-aware build + SPA 404 fallback).
The light theme is now a real design system in `src/index.css` (Inter font, zinc neutrals,
ember orange accent â€” the old slate-remap hack is GONE; components use standard palettes).
Icons are `lucide-react`. Exercise demos are **animated two-frame loops** (`ExerciseImage`,
CSS `demo-frame` keyframes) built from the dataset's start/end photos. See PROGRESS.md â†’
"Production polish + deployment".

**M0â€“M4 are COMPLETE** (the Tier-0 MVP), plus a **post-M2 fixes** pass and the 3D/head-level work.
Build green (`npm run build`), tests pass (`npm run test` â€” 73 Vitest), lint clean (`npm run lint`).
- M4: program generator at `/program` (`features/program-generator/`) â€” pick split/days/equipment
  â†’ balanced, non-repeating week + weekly effective-sets-per-group readout. Pure generator in
  `programGenerator.ts`; splits in `config/program.config.ts`.
- Post-M2: filters persist via URL query params (`useSearchParams`, `BrowserParam` in
  `config/routes.ts`); media model is video-ready (`Exercise.media: ExerciseMedia[]`,
  `ExerciseMediaGallery` renders image/file-video/YouTube). Videos not yet populated (manual
  curation, T1).
- M3: interactive muscle map at `/map` (`features/muscle-map/`) â€” hand-built front/back SVG
  (`BodyDiagram` over `geometry/`), muscleâ†’exercises (click â†’ browser `?muscle=` filter) and
  exerciseâ†’highlighted-muscles (read-only `MuscleMapBoard` on the detail page). Geometry/colours
  in `config/muscleMap.config.ts`. Muscle-level only (no heads yet).
- M3+ **3D model**: a rotatable three.js / react-three-fiber muscle view
  (`features/muscle-map/three/`), default on `/map` with a 2D/3D toggle. Lazy-loaded (own chunk).
  The default body is a **real segmented anatomy model** (`public/models/muscles.glb`, BodyParts3D /
  Z-Anatomy, CC BY-SA) loaded via `AnatomyModel.tsx`; meshes map to our taxonomy through
  `anatomyMuscleMap.ts` (ancestor-chain keyword rules). The procedural mannequin is the
  Suspense/error fallback. PWA runtime-caches the `.glb` (not precached). Promoted to a
  **PFA must-have**.
- **Head-level** (M3+): the 3D model is split into 23 muscle heads (`MuscleHeadId`,
  `data/static/taxonomy/muscleHeads.ts`; meshâ†’head in `three/anatomyHeadMap.ts`). Clicking a head
  filters the browser by `?head=` via `headAttribution.ts` â€” a heuristic name-based engine that
  infers which head an exercise trains (the curation seam; source data is only group-level). 2D map
  stays muscle-level. **Open:** commercial-licence model swap (CC BY-SA copyleft), mobile-perf +
  optional model compression, refine head attribution toward hand-labelling.
- **MVP (M0â€“M4) complete + a post-MVP polish pass** (see PROGRESS.md â†’ "Post-MVP polish pass"):
  exercise-detail 3D is now **head-level**; the generator gained a **training-goal** selector
  (sets/rep-ranges) + a **Regenerate** seed; and the **light "solar" theme** shipped. 72 tests.
- **Light "solar" theme is DONE.** Implemented centrally by remapping the slate/sky scales in
  `src/index.css` `@theme` (warm light surfaces, solar-orange accent) + an amberâ†’orange app gradient
  + warmed `muscleMap.config.ts` palettes. To restyle, edit only those two places.
- **i18n (EN/FR/AR + RTL) is DONE.** Custom layer in `src/config/i18n/` (`en/fr/ar.ts` packs);
  `labels.ts` re-exports the active pack under the same names, so components are unchanged and
  switching language (floating ðŸŒ `LanguageSwitcher`) persists + reloads. `<html lang/dir>` is set in
  `main.tsx`. Add a new string by extending `UiStrings`/`Translation` (TS forces all 3 languages).
  **Exercise names/instructions stay English** (dataset is English-only; per-exercise translation is
  a T1 data task).
- **Program splits:** added a **body-part split** (`SplitType.BodyPart`) + a per-day **warm-up**
  checklist; day focuses are now a `DayFocus` enum and `WorkoutDay = { index, focus, exercises }`.
- **UX redesign (workout-first):** the app is now a mobile-style shell â€” sticky `TopBar` + `BottomNav`
  tabs (Home / Exercises / Body / Plan). **Home (`/`)** is a session launcher (`features/workouts/`):
  tappable cards for Chest+Triceps, Back+Biceps, Shoulders+Core, Legs, Cardio â†’ **`/session/:id`**
  (warm-up + exercises, Regenerate). Browser moved to `/exercises`. Sessions in
  `config/sessions.config.ts`; `sessionPlan.ts` reuses exported generator internals
  (`candidatesByGroup`/`pickExercises`/`schemeFor`/`compoundFirstSeeded`).
- Remaining candidates: 26 MB model compression, deeper generator (accessories/progression),
  fuller Arabic RTL polish, refine head attribution, or post-MVP tiers (P1, T1).
- M1: 873 exercises import + normalise through `repositoryFactory.ts` behind the repo interfaces.
- M2: routed UI (`react-router-dom`) â€” exercise browser (search + group/equipment filters + paging)
  at `/`, detail page at `/exercise/:id`. UI depends on repository *interfaces* via
  `context/RepositoryContext.ts`; `main.tsx` is the composition root that injects the concrete repos.
The MVP (M0â€“M4) + a post-MVP polish pass are done. See PROGRESS.md for the latest state.

To see it: `npm run dev`, open the printed URL. To run tests: `npm run test`.

## Decisions taken autonomously in M1 (flagged for your review)
- **Muscle-level taxonomy, not head-level (yet).** The source is group-level; head-level detail
  and stabilizer involvements are deferred to a hand-curation pass (the project's value-add).
  -> If you want head-level authored now, say so and it becomes the next sub-task.
- **Added `Adductors` + `Abductors` to the `MuscleGroup` enum.** The dataset distinguishes hip
  ab/adductors and there was no anatomically-correct existing group. Easy to fold/rename if you'd
  rather bucket them elsewhere.
- **Exercise images are NOT bundled** â€” served from the free-exercise-db jsDelivr CDN
  (`DataSourceConfig.exerciseImageBaseUrl`). The dataset JSON *is* bundled (~1 MB) -> build prints a
  chunk-size warning; lazy-loading is an easy later optimization.

## Pending decisions for the user
- Confirm starting **M4** (program generator) and its first cut (split presets, days, equipment).
- Whether to author head-level taxonomy + stabilizers now or keep deferring (affects map detail).
- The light "solar" theme pass â€” when to do it (currently deferred as cosmetic).
