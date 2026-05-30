# MuscleMap — Project Overview

## Vision
A clear, visual tool that shows **which muscles (and muscle heads) each exercise
trains** — primary, secondary, stabilizer — lets you **browse exercises by muscle
group**, and **generates balanced, non-redundant workout programs** that rotate
progressively over time.

## Purpose & audience (in priority order)
1. **PFA** — *projet de fin d'année* (end-of-year academic project). Primary deliverable.
2. **Personal training tool** for the author (an experienced lifter).
3. **Commercial evolution** — the author's brother, a professional coach, joins as an
   **admin/coach** who posts **his own** demonstration videos (original content =
   no copyright risk + a real content moat), with **paying subscribers** later.
   Must eventually run on **iOS and Android**.

## Evolutive scope (build T0 now; T1/T2 bolt on without rewrites)
| Tier | Purpose | Adds | Media | Backend |
|------|---------|------|-------|---------|
| **T0** (now) | PFA + personal | Muscle map, exercise browser, muscle-targeting detail, program generator v1 | Bundled illustrations (zero copyright, offline) | None (static JSON) |
| **T1** | Coach content | Auth + admin/coach role; coach uploads own videos tagged per muscle/exercise | Coach's own videos (replace bundled illustrations) | Supabase |
| **T2** | Commercial | Accounts, subscriptions, tracking, personalization, native iOS/Android via Capacitor | + premium gated content | Supabase + payments |

## Key decisions log
- **Platform:** Responsive **PWA** now (installable on iPhone) → **Capacitor** wrappers
  for App Store / Play Store later. One codebase. (Beats native-now and Flutter for this case.)
- **Stack:** React + TypeScript + Vite + Tailwind v4 + vite-plugin-pwa. Deploy on Vercel.
- **Future-proofing:** all data access behind a repository interface so static JSON → Supabase is a drop-in.
- **Data seed:** `yuhonas/free-exercise-db`, re-modeled into our own muscle-head taxonomy (M1).
- **Media (T0):** bundled illustrations; architecture lets coach videos replace them in T1.
- **Deployment growth:** Vercel → Vercel+Supabase → Docker/ACR/AKS at scale (see ARCHITECTURE.md).

See `ARCHITECTURE.md`, `DATA_MODEL.md`, `ROADMAP.md`, and `PROGRESS.md` for detail.
`AGENT_HANDOFF.md` is the read-first entry point for any new session.
