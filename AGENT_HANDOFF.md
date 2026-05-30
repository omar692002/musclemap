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
**M0 and M1 are COMPLETE.** M0 baseline is committed; M1 (data foundation) is committed.
Build green (`npm run build`), tests pass (`npm run test` — 11 Vitest tests), lint clean.
873 exercises import + normalise through `repositoryFactory.ts` behind the repository interfaces.
Next is **M2 — Exercise browser** (list/search/filter + detail page). See PROGRESS.md -> "Next".

To run the test suite: `npm run test` (Vitest, added in M1).

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
- Confirm starting **M2**, and the first cut of the browser UX (group-first vs search-first).
- Whether to author head-level taxonomy + stabilizers now or keep deferring.
