# Agent Handoff — read this first

This is the entry point for any new session/agent continuing **MuscleMap**.
Read this, then `PROGRESS.md` (current state) and `ROADMAP.md` (what's next).

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
  `tsconfig.app.json` specifically so TS `enum`s compile — do not re-enable it.)
- **OOP + SOLID**, dependency inversion (UI -> repository *interfaces*, never concretes).
- **No hardcoded strings** — centralise in `config/`, enums, or const maps.
- **No workarounds/hacks** — fix root causes.
- **Clean code**, immutable domain entities (`readonly`).
- **Keep docs current** and **trace your actions** (use the task list).
- Work **iteratively, one milestone at a time** — don't binge-build. Confirm scope, then execute.

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
**Production-polish pass DONE + DEPLOYED (2026-06).** Live at https://omar692002.github.io/musclemap/
(GitHub Pages, `.github/workflows/deploy.yml`, BASE_PATH-aware build + SPA 404 fallback).
The light theme is now a real design system in `src/index.css` (Inter font, zinc neutrals,
ember orange accent — the old slate-remap hack is GONE; components use standard palettes).
Icons are `lucide-react`. Exercise demos are **animated two-frame loops** (`ExerciseImage`,
CSS `demo-frame` keyframes) built from the dataset's start/end photos. See PROGRESS.md →
"Production polish + deployment".

**M0–M4 are COMPLETE** (the Tier-0 MVP), plus a **post-M2 fixes** pass and the 3D/head-level work.
Build green (`npm run build`), tests pass (`npm run test` — 73 Vitest), lint clean (`npm run lint`).
- M4: program generator at `/program` (`features/program-generator/`) — pick split/days/equipment
  → balanced, non-repeating week + weekly effective-sets-per-group readout. Pure generator in
  `programGenerator.ts`; splits in `config/program.config.ts`.
- Post-M2: filters persist via URL query params (`useSearchParams`, `BrowserParam` in
  `config/routes.ts`); media model is video-ready (`Exercise.media: ExerciseMedia[]`,
  `ExerciseMediaGallery` renders image/file-video/YouTube). Videos not yet populated (manual
  curation, T1).
- M3: interactive muscle map at `/map` (`features/muscle-map/`) — hand-built front/back SVG
  (`BodyDiagram` over `geometry/`), muscle→exercises (click → browser `?muscle=` filter) and
  exercise→highlighted-muscles (read-only `MuscleMapBoard` on the detail page). Geometry/colours
  in `config/muscleMap.config.ts`. Muscle-level only (no heads yet).
- M3+ **3D model**: a rotatable three.js / react-three-fiber muscle view
  (`features/muscle-map/three/`), default on `/map` with a 2D/3D toggle. Lazy-loaded (own chunk).
  The default body is a **real segmented anatomy model** (`public/models/muscles.glb`, BodyParts3D /
  Z-Anatomy, CC BY-SA) loaded via `AnatomyModel.tsx`; meshes map to our taxonomy through
  `anatomyMuscleMap.ts` (ancestor-chain keyword rules). The procedural mannequin is the
  Suspense/error fallback. PWA runtime-caches the `.glb` (not precached). Promoted to a
  **PFA must-have**.
- **Head-level** (M3+): the 3D model is split into 23 muscle heads (`MuscleHeadId`,
  `data/static/taxonomy/muscleHeads.ts`; mesh→head in `three/anatomyHeadMap.ts`). Clicking a head
  filters the browser by `?head=` via `headAttribution.ts` — a heuristic name-based engine that
  infers which head an exercise trains (the curation seam; source data is only group-level). 2D map
  stays muscle-level. **Open:** commercial-licence model swap (CC BY-SA copyleft), mobile-perf +
  optional model compression, refine head attribution toward hand-labelling.
- **MVP (M0–M4) complete + a post-MVP polish pass** (see PROGRESS.md → "Post-MVP polish pass"):
  exercise-detail 3D is now **head-level**; the generator gained a **training-goal** selector
  (sets/rep-ranges) + a **Regenerate** seed; and the **light "solar" theme** shipped. 72 tests.
- **Light "solar" theme is DONE.** Implemented centrally by remapping the slate/sky scales in
  `src/index.css` `@theme` (warm light surfaces, solar-orange accent) + an amber→orange app gradient
  + warmed `muscleMap.config.ts` palettes. To restyle, edit only those two places.
- **i18n (EN/FR/AR + RTL) is DONE.** Custom layer in `src/config/i18n/` (`en/fr/ar.ts` packs);
  `labels.ts` re-exports the active pack under the same names, so components are unchanged and
  switching language (floating 🌐 `LanguageSwitcher`) persists + reloads. `<html lang/dir>` is set in
  `main.tsx`. Add a new string by extending `UiStrings`/`Translation` (TS forces all 3 languages).
  **Exercise names/instructions stay English** (dataset is English-only; per-exercise translation is
  a T1 data task).
- **Program splits:** added a **body-part split** (`SplitType.BodyPart`) + a per-day **warm-up**
  checklist; day focuses are now a `DayFocus` enum and `WorkoutDay = { index, focus, exercises }`.
- **UX redesign (workout-first):** the app is now a mobile-style shell — sticky `TopBar` + `BottomNav`
  tabs (Home / Exercises / Body / Plan). **Home (`/`)** is a session launcher (`features/workouts/`):
  tappable cards for Chest+Triceps, Back+Biceps, Shoulders+Core, Legs, Cardio → **`/session/:id`**
  (warm-up + exercises, Regenerate). Browser moved to `/exercises`. Sessions in
  `config/sessions.config.ts`; `sessionPlan.ts` reuses exported generator internals
  (`candidatesByGroup`/`pickExercises`/`schemeFor`/`compoundFirstSeeded`).
- Remaining candidates: 26 MB model compression, deeper generator (accessories/progression),
  fuller Arabic RTL polish, refine head attribution, or post-MVP tiers (P1, T1).
- M1: 873 exercises import + normalise through `repositoryFactory.ts` behind the repo interfaces.
- M2: routed UI (`react-router-dom`) — exercise browser (search + group/equipment filters + paging)
  at `/`, detail page at `/exercise/:id`. UI depends on repository *interfaces* via
  `context/RepositoryContext.ts`; `main.tsx` is the composition root that injects the concrete repos.
The MVP (M0–M4) + a post-MVP polish pass are done. See PROGRESS.md for the latest state.

To see it: `npm run dev`, open the printed URL. To run tests: `npm run test`.

## Decisions taken autonomously in M1 (flagged for your review)
- **Muscle-level taxonomy, not head-level (yet).** The source is group-level; head-level detail
  and stabilizer involvements are deferred to a hand-curation pass (the project's value-add).
  -> If you want head-level authored now, say so and it becomes the next sub-task.
- **Added `Adductors` + `Abductors` to the `MuscleGroup` enum.** The dataset distinguishes hip
  ab/adductors and there was no anatomically-correct existing group. Easy to fold/rename if you'd
  rather bucket them elsewhere.
- **Exercise images are NOT bundled** — served from the free-exercise-db jsDelivr CDN
  (`DataSourceConfig.exerciseImageBaseUrl`). The dataset JSON *is* bundled (~1 MB) -> build prints a
  chunk-size warning; lazy-loading is an easy later optimization.

## Pending decisions for the user
- Confirm starting **M4** (program generator) and its first cut (split presets, days, equipment).
- Whether to author head-level taxonomy + stabilizers now or keep deferring (affects map detail).
- The light "solar" theme pass — when to do it (currently deferred as cosmetic).
