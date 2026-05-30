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
**M0 (project setup) is COMPLETE and the build is green.** Next is **M1 — Data foundation**:
import `yuhonas/free-exercise-db`, author the muscle + muscle-head taxonomy, write a normaliser
into our entities, and populate `StaticExerciseRepository` (+ a small test). See PROGRESS.md -> "Next".

## Pending decisions for the user
- First **git commit** of the M0 baseline (not done yet — awaiting OK).
- Confirm starting M1 (and whether to author head-level taxonomy now or after a group-level pass).
