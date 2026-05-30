# Progress Log

## M0 — Project setup (complete)
**State:** A deployable PWA skeleton with the future-proofing baked in. Production build is green
(`npm run build` -> tsc + vite + PWA service worker all pass).

Done:
- `git init` in `musclemap/`; Vite scaffold's `.gitignore` in place. (Not committed yet — see below.)
- Vite + React 19 + TypeScript scaffolded.
- Tailwind CSS v4 wired via `@tailwindcss/vite`; `src/index.css` is the Tailwind entry.
- PWA enabled (`vite-plugin-pwa`, autoUpdate) — manifest reads from `src/config/app.config.ts`; `public/icon.svg` brand icon.
- **Enabled TS enums:** Vite's template ships `erasableSyntaxOnly: true`, which forbids `enum` (TS1294).
  Set it to `false` in `tsconfig.app.json` (intentional — the project mandates enums). Build verified after.
- SOLID structure created: `config/`, `domain/{enums,models,repositories}`, `data/static/`.
  - Enums: `MuscleRole`, `MuscleGroup`, `StorageKey`.
  - Entities: `Muscle`, `Exercise`, `MuscleInvolvement` (immutable).
  - Seam: `IExerciseRepository` + `StaticExerciseRepository` stub (empty until M1).
- App shell (`App.tsx`) renders branding from `AppConfig` (no hardcoded strings).
- Default cruft removed (`App.css`).
- Continuity docs: PROJECT, ARCHITECTURE, DATA_MODEL, ROADMAP, PROGRESS, AGENT_HANDOFF.
- Deployment evolution documented (Vercel -> +Supabase -> Docker/ACR/AKS); see ARCHITECTURE.md.

## How to run (on your computer)
```powershell
cd C:\Users\User\Desktop\cours2emeIng\musclemap
npm run dev            # starts the dev server (default http://localhost:5173)
```
Open the printed URL in a browser.

## How to view on your iPhone (same Wi-Fi)
```powershell
npm run dev -- --host  # exposes the server on your local network
```
Then on the iPhone open `http://<your-computer-LAN-IP>:5173`.
In Safari: Share -> **Add to Home Screen** to install it as an app.
(Find your IP with `ipconfig` -> IPv4 Address.)

## How to deploy the hello-world to Vercel (optional, free)
1. Create a free account at vercel.com.
2. Easiest: push this folder to a GitHub repo, then "Import Project" in Vercel
   (it auto-detects Vite: build `npm run build`, output `dist`).
3. Or use the CLI: `npm i -g vercel`, then `vercel` from this folder.

## Known small TODOs (not blockers)
- **Git baseline not committed** — say the word and the M0 baseline gets its first commit.
- **PWA icons:** currently one SVG icon. For perfect iOS install polish, add PNG
  `apple-touch-icon` (180x180) + 192/512 PNGs. Cosmetic; deferred.

## Next: M1 — Data foundation
1. Pull `yuhonas/free-exercise-db` data.
2. Author the muscle + muscle-head taxonomy (`Muscle` records, ids, groups).
3. Write a normaliser: their schema -> our `Exercise`/`MuscleInvolvement` (+ role mapping).
4. Populate `StaticExerciseRepository` and add a tiny test that `getAll()` returns data.
