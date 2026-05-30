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

## M1 — Data foundation (complete)
**State:** The static data layer is populated and wired end-to-end. Build is green
(`npm run build`), `npm run test` passes (11 tests, Vitest), `npm run lint` clean.
The app shell shows a live "873 exercises loaded" badge — proof the pipeline works.

Done:
- **Imported** `yuhonas/free-exercise-db` (873 exercises) -> `src/data/static/source/exercises.json`.
- **Authored the muscle taxonomy** (`data/static/taxonomy/muscles.ts`): 17 muscles, each with a
  `MuscleId` (new enum) and a `MuscleGroup`. Granularity is **muscle-level** for M1 (head-level is a
  deliberate later pass — see "Pending decisions").
- **New domain enums** (no magic strings): `MuscleId`, `Equipment`, `ExerciseMechanic`,
  `ExerciseForce`, `ExerciseCategory`, `ExerciseLevel`. Added `Adductors` + `Abductors` to
  `MuscleGroup` (the source distinguishes hip ab/adductors; no correct existing home).
- **Enriched `Exercise`** with `category`, `level`, `equipment?`, `mechanic?`, `force?`,
  `instructions`, `images` (resolved CDN URLs).
- **Mapping layer** (`data/static/mapping/sourceMuscleMap.ts`): source vocabulary -> our
  enums/taxonomy, the single place raw strings are interpreted. `ROLE_DEFAULT_CONTRIBUTION`
  gives Primary/Secondary/Stabilizer default volume weights.
- **`ExerciseNormalizer`**: raw record -> immutable `Exercise`; derives primary/secondary
  involvements; resolves images against `DataSourceConfig.exerciseImageBaseUrl` (jsDelivr CDN —
  images are *not* bundled). Stabilizers intentionally not fabricated (source has none).
- **Repositories wired**: `StaticExerciseRepository` (now with `findByMuscleGroup` via a
  muscleId->group index), new `StaticMuscleRepository` + `IMuscleRepository`. Composition root:
  `data/static/repositoryFactory.ts` exports `exerciseRepository` / `muscleRepository`.
- **Tests** (Vitest, added as devDep; `npm run test`): normaliser mapping, taxonomy integrity
  (every source muscle resolves to a real muscle), repository `getAll/getById/findByMuscleGroup`.

### Known M1 follow-ups (not blockers)
- **Bundle size:** the dataset is imported into the JS bundle (~1 MB). Fine for now (PWA-cached);
  lazy-load or pre-build a slimmer JSON if it grows. Build prints the >500 kB chunk warning.
- **Head-level taxonomy & stabilizers:** muscle-level only for now; per-exercise head detail and
  stabilizer involvements are a hand-curation pass (our value-add).

## Next: M2 — Exercise browser
List/search/filter by muscle group & equipment; detail page (primary/secondary + media).
The repositories and enriched entities it needs are now in place behind their interfaces.
