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

## M2 — Exercise browser (complete)
**State:** A working, routed UI over the M1 data. Build green, `npm run test` (11) + `npm run lint`
clean. Run `npm run dev` and open the printed URL.

Done:
- **Routing** (`react-router-dom` v7): `/` browser, `/exercise/:id` detail, `*` -> redirect.
  Routes centralised in `config/routes.ts` (`exerciseDetailPath` builder — no hardcoded URLs).
- **DI in the UI**: `context/RepositoryContext.ts` exposes the repository *interfaces*; the
  composition root (`main.tsx`) injects the concrete static instances. Components never import
  the factory — the static -> Supabase swap stays a one-file change.
- **Browser page** (`features/exercise-browser/`): name search + muscle-group + equipment filters
  (`useExerciseFilters`, derived via `useMemo`), responsive card grid, "Load more" paging
  (`UiConfig.browserPageSize = 60`), live result count.
- **Detail page**: image(s), meta badges (category/level/equipment/mechanic/force), muscles worked
  grouped by role (Primary/Secondary), numbered instructions.
- **Shared UI**: `components/Badge.tsx` (tone variants); `config/labels.ts` centralises every
  enum -> display label + static copy (`UiText`) — no hardcoded display strings.

### Known M2 follow-ups (not blockers)
- **SPA deep-link fallback for production**: a static host must rewrite unknown paths to
  `index.html` (else refreshing `/exercise/:id` 404s). Vite dev/preview already handle it; add a
  Vercel rewrite when we deploy.
- Bundle still ~1 MB (the dataset) — same note as M1.

## Post-M2 fixes (complete)
Two user-requested fixes after the M2 review. Build green, lint clean, 11 tests pass.
- **Filters persist on back-navigation.** Search/group/equipment now live in the URL query
  string (`/?q=press&group=CHEST`) via `useSearchParams`, not local state — they survive the back
  button and the view is shareable/bookmarkable. Param keys centralised in `config/routes.ts`
  (`BrowserParam`); invalid values are ignored. Root-cause fix, not a sessionStorage band-aid.
- **Media model made video-ready.** `Exercise.images: string[]` → `Exercise.media: ExerciseMedia[]`
  (`{ kind: Image|Video, source: File|YouTube, url, thumbnailUrl? }`). New `ExerciseMediaGallery`
  renders images, file videos, or YouTube embeds by switching on kind/source. The static dataset
  still yields image-only media today; real videos (curated YouTube mapping, or T1 coach uploads)
  now drop in as a pure **data change**, zero UI rewrite. `MediaConfig` holds the embed base URL.

### Still open (cosmetic / deferred)
- **Theme:** user wants a modern **light "solar"** theme (currently dark slate). Cosmetic pass,
  deferred — copy/colours are already centralised so it's low-risk later.
- **Videos are not populated yet:** the model is ready but no exercise carries a video. Filling
  them is manual curation (no auto exercise→video map) — planned for the coach-content tier (T1).

## M3 — Interactive muscle map (complete)
**State:** A clickable front+back body map, reused as a read-only highlight on the detail page.
Build green, lint clean, `npm run test` now 14 (added geometry-integrity tests). Reachable from
the browser header ("Muscle map →") at `/map`.

Done:
- **Hand-built SVG figures** (`features/muscle-map/geometry/`): a stylised body drawn from typed
  primitives (`BodyShape` = ellipse | rect | poly) with a `mirrorShape` helper, so left/right
  muscles are authored once and mirrored. `bodyGeometry.ts` maps every `MuscleId` to region(s) on
  a `BodyView` (Front/Back); a test asserts the map covers the whole taxonomy. No external art /
  licensing — we own it, and it's easy to restyle for the planned light theme.
- **`BodyDiagram`** renders silhouette + regions; colours regions by an optional `highlight`
  (muscleId→role) and fires `onSelect` when interactive (keyboard-accessible: role/button, tab,
  Enter/Space). Geometry + palette live in `config/muscleMap.config.ts` (no hardcoded numbers/
  colours) — `ROLE_FILL` gives the primary/secondary heat colours.
- **`MuscleMapBoard`** composes Front+Back + a `MuscleMapLegend`; reused in two places:
  - **Map page** (`/map`): interactive; each region tooltip shows the muscle + its exercise count;
    tapping navigates to the browser pre-filtered to that muscle.
  - **Exercise detail**: read-only, highlighting that exercise's muscles by role (the
    "exercise → highlighted muscles" half).
- **Muscle-level browser filter**: new `muscle` URL param (`BrowserParam.muscle`,
  `browserPathForMuscle`) filters by exact muscle id; shown as a clearable chip on the browser.
- `BodyView` enum added to the domain vocabulary; `BODY_VIEW_LABELS` in `config/labels.ts`.

### Known M3 follow-ups (not blockers)
- **Muscle-level granularity only** (no heads yet) — deliberate; head-level is a later curation
  pass. The figures are stylised/diagrammatic, sized for clarity over anatomical precision.
- Theme still dark; the light "solar" pass will mostly touch `muscleMap.config.ts` colours.

## M3+ — Rotatable 3D muscle model (prototype, complete)
**State:** A working 3D muscle model on `/map`, toggleable with the 2D view (3D is the default).
Promoted to a **PFA must-have** at the user's request. Build green, lint clean, 15 tests pass.
The 3D code is **code-split into its own lazy chunk** (`Muscle3DView`, ~240 kB gzip) — fetched
only when the 3D view is shown, so the initial load is unchanged.

Done:
- **Stack:** `three` + `@react-three/fiber` (v9, React 19) + `@react-three/drei` (OrbitControls,
  `useCursor`). All under `features/muscle-map/three/`.
- **`geometry3d.ts`**: the 3D cousin of `bodyGeometry` — a stylised mannequin + every muscle
  placed as typed primitives (sphere/capsule/box) in a Y-up space, front muscles at +Z and back
  at −Z so rotation reveals them. `mirrorShape`-style `pair()` keeps left/right authored once.
  A test asserts the 3D model also covers the full taxonomy.
- **`Body3DScene`**: lights + mannequin + clickable muscle groups (hover highlight, `onSelect`,
  pointer cursor) + orbit controls. Same `highlight`/`selected`/`onSelect` contract as the 2D
  `BodyDiagram`, so it's a drop-in alternate view. Palette in `MuscleMapConfig.model3d`.
- **`Muscle3DView`** (default export, lazy-loaded): wraps the `<Canvas>`, shows the hovered
  muscle's name + exercise count beneath. `MuscleMapPage` has a **2D / 3D toggle**; both views
  navigate a tapped muscle to the pre-filtered browser.

### 3D follow-ups / open decision
- **Realistic model is the next step.** The current mesh is a *procedural prototype* (proves
  rotate + click + highlight + mobile perf). The "exact anatomical place" look needs a **segmented
  anatomy GLTF**, which is an **asset + licensing** decision (free CC-BY-SA models like Z-Anatomy/
  BodyParts3D are fine for the PFA but copyleft for the commercial tier; a licensed/paid model is
  the commercial path). It swaps in behind the same `Body3DScene` contract — code, not rewrite.
- Mobile GPU perf on a real device still to be spot-checked; lazy-load already in place.

## Next: M4 — Program generator v1
Pick split/days/equipment → a balanced, non-redundant routine + weekly volume-per-muscle readout.
`contribution` weights on involvements (M1) and the muscle map (M3) feed the volume math/coverage.
