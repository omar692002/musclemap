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
- **Theme:** ✅ done — light "solar" theme shipped in the post-MVP polish pass (see bottom of file).
- **Videos:** ✅ seeded — a curated `EXERCISE_VIDEO_IDS` map (`data/static/exerciseVideos.ts`) now
  attaches real **DeltaBolic** form-guide YouTube Shorts to ~16 exercises (bench/DB press, lateral
  raises, rear-delt flies, pulldowns, pushdowns, dips, curls, face pull). The `ExerciseNormalizer`
  prepends a YouTube media item (with a still thumbnail) so the video shows first on the detail page
  and the card gets a ▶ badge. Adding a row = adding a video (no UI change). Full coverage / coach
  uploads remain a T1 data task. A test guards every key against a real exercise id + YouTube-id shape.

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

### Realistic anatomy model (integrated)
The procedural mannequin is now the *fallback*; the default 3D body is a **real segmented
muscular-system model** (`public/models/muscles.glb`, ~6.6 MB, BodyParts3D / Z-Anatomy, CC BY-SA).
- **Loader** (`three/AnatomyModel.tsx`): `useGLTF`, clones the scene, tags each mesh with the
  muscle id it belongs to, gives it its own material (recoloured by role/hover/selection), and
  auto-fits (centre + scale). Same `highlight`/`selected`/`onSelect` contract as everything else.
- **Mapping** (`three/anatomyMuscleMap.ts`): ordered keyword rules matched against each mesh's
  **ancestor chain** (own name + parent group names), so the model's compartment groups
  (e.g. "Anterior compartment of forearm.g") map a whole region in one rule. 15 tests cover the
  representative cases + assert every taxonomy muscle has a rule. Unmatched tissue (fasciae,
  hand/foot intrinsics) stays neutral. This table is the curation seam — refine on review.
- **Robust loading**: `ProceduralBody` shows instantly as the `<Suspense>` fallback while the
  model streams in, and a `ModelErrorBoundary` falls back to it if the asset fails. Lights +
  `OrbitControls` live in `Muscle3DView`, shared by both bodies.
- **PWA**: the `.glb` is excluded from precache (`vite.config.ts` workbox `globIgnores`) and
  runtime-cached CacheFirst on first view, so install stays light but the model works offline after.
- **CC BY-SA attribution** shown under the model (`AnatomyModelConfig.attribution`).

### Head-level granularity (complete)
The 3D model is split into **muscle heads** (front/side/rear delt, the 3 triceps heads, biceps
2 heads, upper/mid/lower chest & traps, gastrocnemius vs soleus, the quad & hamstring heads — 23
heads across 8 muscles). Other muscles stay whole.
- **Taxonomy:** `MuscleHeadId` enum + `data/static/taxonomy/muscleHeads.ts` (head → parent muscle +
  name, `HEADS_BY_MUSCLE`, `isHeadedMuscle`).
- **Mesh → head:** `three/anatomyHeadMap.ts` resolves the model's part names ("Clavicular part of
  deltoid" → anterior delt). `AnatomyModel` tags each mesh with a `RegionRef` (head or whole
  muscle); hover/click operate on that region (so hovering isolates just the front delt, etc.).
- **Per-head exercises (curation layer):** `headAttribution.ts` infers which head(s) an exercise
  trains from its name (lateral raise → side delt, incline press → upper chest, seated calf raise →
  soleus…), since the source data is group-level. Heuristic rules per muscle with a full-set
  fallback; quads/hams map to all heads (not name-distinguishable). Memoised per exercise. This is
  the documented seam to refine with hand-labelling.
- **Wiring:** clicking a head → browser filtered by `?head=` (`BrowserParam.head`,
  `browserPathForHead`, `exerciseInvolvesHead`), shown as a clearable chip; the 3D hover tooltip
  shows the head name + its exercise count. 2D map stays muscle-level. Tests (31 new) cover the
  head mesh-map (all 23 heads), the attribution rules, and head coverage.

### 3D open items (not blockers)
- **Mobile GPU perf** on a device + optional model compression (26 MB → ~5 MB via Draco/meshopt).
- Head exercise attribution is heuristic (name-based) — refine toward hand-curation over time; this
  is the project's value-add and a strong PFA talking point (rule-based vs the generic dataset).
- The head framing/scale fix (model was scaled a hair taller than the frame, clipping head/feet):
  `AnatomyModelConfig.targetHeight` 2.8 + camera pulled to z=4.7.
- **Commercial licence**: CC BY-SA is copyleft — swap to a commercial-friendly / coach-owned model
  before any paid release. The mapping is model-agnostic, so it's a file swap. (See
  `public/models/README.md`.)
- Mapping refinements: a few small muscles (serratus, tibialis, rotator-cuff subtleties) are
  approximations or left neutral; tighten as the map is reviewed.

## M4 — Program generator v1 (complete)
**State:** A working generator at `/program` (linked from the browser header). Build green, lint
clean, 67 tests (4 new). Pick a split + days/week + equipment → a balanced week + volume readout.

Done:
- **Domain:** `SplitType` enum; `WorkoutProgram` / `WorkoutDay` / `ProgramExercise` models.
- **Config:** `program.config.ts` — split day-templates (Push/Pull/Legs, Upper/Lower, Full body as
  `MuscleGroup` sets), sets-per-exercise, exercises-per-group, day options. `SPLIT_LABELS` in
  `config/labels.ts`. No hardcoded strings in the UI.
- **Generator** (`programGenerator.ts`, pure + deterministic): cycles the split's day templates to
  the chosen day count; per target group picks compound-first exercises that fit the equipment,
  **not repeating any exercise across the week**; then sums **effective weekly sets per muscle
  group** (sets × each involvement's `contribution`) for the readout. Tested (day count, no repeats,
  equipment filter, volume math).
- **UI** (`features/program-generator/`): `ProgramControls` (split/days selects + equipment toggle
  chips, "All" = unrestricted), `ProgramDayCard` (exercises link to detail + set counts),
  `VolumeReadout` (per-group effective-sets bars). Live-updates via `useMemo` as options change.
- **Routing:** `/program` route; browser header now has both "Muscle map →" and "Program →".

### Known M4 follow-ups (not blockers)
- 1 exercise per group/day (config) → thin full-body days; could scale per group / add accessory
  slots, rep ranges, warmups, progression.
- Selection is deterministic (compound-first, alphabetical) — add a "regenerate"/shuffle for variety.
- Volume targets vs evidence-based landmarks (highlight under/over-served groups) — a P3 analytic.

## MVP (M0–M4) complete
The Tier-0 MVP is functionally done: data → browser → muscle map (2D + head-split 3D) → program
generator. Next candidates: model compression, or post-MVP tiers (P1 depth, T1 Supabase + coach
content). See ROADMAP.

## Post-MVP polish pass (complete)
Three follow-ups done together. Build green, lint clean, **72 tests** (5 new). Each committed
separately.
- **Exercise-detail 3D is head-level.** `highlightHeadsFromExercise` keys headed muscles by the
  specific head an exercise emphasises (via `headAttribution`), so e.g. a lateral raise lights only
  the side delt on the detail-page 3D model. `AnatomyModel` resolves a role by `region.key` (head)
  first, falling back to the whole-muscle id — so the muscle-level map still lights the whole muscle.
  The 2D board/toggle stays whole-muscle. (`highlight.test.ts`, 3 cases.)
- **Deeper generator.** New `TrainingGoal` (Strength/Hypertrophy/Endurance) drives per-exercise
  **sets + rep ranges** via `GOAL_SCHEMES` (compound vs isolation); `ProgramExercise` carries `reps`,
  day cards show "N × range". A variety **seed** keeps generation deterministic per inputs, and a
  **Regenerate** button bumps it to rotate picks (compound-first kept, FNV-1a seeded tiebreak).
  (`programGenerator.test.ts` updated + extended, 6 cases.)
- **Light "solar" theme.** Done centrally: the slate/sky scales the UI already uses are remapped to
  warm light tones in `src/index.css` `@theme` (surfaces light/white, text warm near-black, accent =
  solar orange) — so no per-component re-tagging. App shell wears an amber→orange gradient;
  `color-scheme: light`; PWA `theme_color`/`background_color` + `<meta theme-color>` now `#fff7ed`;
  3D-model + 2D-board palettes warmed in `muscleMap.config.ts`; `Badge` violet/emerald tints use
  dark text for contrast. To restyle further, edit only `index.css` `@theme` + that config.

### Still open (not blockers)
- Model compression (26 MB → ~5 MB Draco/meshopt) for mobile.
- Generator: accessory slots, multi-exercise groups, progression across weeks.
- Refine head attribution toward hand-labelling; commercial-licence model swap (CC BY-SA copyleft).

## UX redesign — workout-first, app-like shell (complete)
User feedback: the app felt like an exercise *database*, not a gym app — "as a user I want to open
it and easily train Chest+Triceps, Back+Biceps, Shoulders+Abs, Legs, Cardio." Restructured the whole
experience around that. Build green, lint clean, 73 tests.
- **Mobile app shell** (`App.tsx`): a sticky **TopBar** (brand + language) and a sticky **BottomNav**
  tab bar (Home / Exercises / Body / Plan, `NavLink` active states) wrap the routed screens — the
  app now navigates like a native mobile app, not via in-page header links.
- **Workout-first Home** (`features/workouts/HomePage`): the landing screen (`/`) is now a session
  launcher — big tappable **SessionCard**s for **Chest & Triceps, Back & Biceps, Shoulders & Core,
  Legs, and Cardio** (each with an icon + accent), plus "Build your own week" → `/program` and
  "Browse all" → `/exercises`. Sessions are config (`config/sessions.config.ts`); cardio is the
  `ExerciseCategory.Cardio` set.
- **Session screen** (`/session/:id`, `SessionPage`): tap a card → warm-up + a ready exercise list
  (2 per muscle group, sets×reps from the goal; cardio = 4 moves × duration), with **Regenerate** for
  variety and a back button. Reuses the generator's internals: `programGenerator` now exports
  `candidatesByGroup` / `pickExercises` / `schemeFor` / `compoundFirstSeeded`, consumed by
  `features/workouts/sessionPlan.ts`.
- **Routing reshaped** (`config/routes.ts`): `/` = Home, browser moved to `/exercises`, new
  `/session/:id`; `sessionPath()` added; muscle/head map links still target the browser. Page headers
  slimmed (no redundant brand/nav/back); detail "Back" now `navigate(-1)`.
- **Shared components**: `BottomNav`, `TopBar`, `WarmupBlock`, `WorkoutExerciseRow` (the row renders
  `N × reps`, or just the value for single-set/cardio). `ProgramDayCard` refactored onto them.
- **Still open:** richer Home (greeting by time, last/next session memory, streaks); a true
  "start workout" runner (per-set checkmarks, rest timer); fuller Arabic RTL polish.

## Splits + warm-up + i18n pass (complete)
Three more user requests. Build green, lint clean, **73 tests** (1 new). One commit.
- **Body-part ("bro") split.** New `SplitType.BodyPart` → Chest+Triceps, Back+Biceps, Legs,
  Shoulders+Core (cycled to the chosen day count). Day focuses are now a `DayFocus` enum (a
  translation key), and `WorkoutDay` carries `{ index, focus }` instead of pre-baked label strings,
  so the card renders translated "Day N · <focus>".
- **Warm-up / cardio per session.** A standard checklist (`WARMUP_STEPS`: treadmill/cardio, dynamic
  mobility, ramp-up sets) renders atop each non-empty day in `ProgramDayCard`. It's presentation
  (config-driven, translatable) — the domain/generator stay unchanged.
- **Full i18n — English / French / Arabic, with RTL.** Custom lightweight layer under
  `src/config/i18n/` (`types.ts` + `en/fr/ar.ts` packs + `index.ts`). `Language` enum;
  `getActiveLanguage()` (localStorage → browser → English); `setActiveLanguage()` persists + reloads;
  `applyDocumentLanguage()` sets `<html lang/dir>` (Arabic = `rtl`) at startup in `main.tsx`. A
  floating `LanguageSwitcher` (🌐, in `App`) changes it. `labels.ts` now just re-exports the active
  pack under the **same names**, so no component import changed. TS `Record<Enum,string>` makes a
  missing translation a **compile error**. **Scope:** UI chrome + all enum labels (muscle groups,
  equipment, splits, goals, roles, levels, …) are translated; **exercise names/instructions stay
  English** (the source dataset is English-only — a per-exercise translation table is a T1 data task).
  RTL is functional (logical `ps-*` used on the warm-up list); a fuller RTL polish pass is a follow-up.

## Production polish + deployment (2026-06-10)
**State:** full visual redesign to a production-quality light theme; deployed to GitHub Pages.

Done:
- **Design system rebuilt** (`src/index.css`): removed the slate/sky scale-remap hack; real
  tokens — Inter Variable font (@fontsource), zinc neutrals + ember orange/red accent,
  `demo-frame` + `fade-up` keyframes, `no-scrollbar` utility. Components now use standard
  Tailwind palettes directly.
- **Icons:** emoji → `lucide-react` everywhere (nav, cards, buttons, brand mark).
- **App shell:** white blurred TopBar with gradient brand mark; BottomNav with pill active
  states + safe-area inset; per-route `fade-up` entrance.
- **Home:** localized date header, gradient session banner cards (config: gradient + icon in
  `sessions.config.ts`), quick tiles.
- **Session:** gradient banner header, interactive warm-up checklist (check-off state),
  exercise rows with animated thumbnails, Shuffle pill.
- **Animated exercise demos:** new `ExerciseImage` flips the dataset's start/end photos on a
  CSS steps() loop (GIF-style, zero JS timers, desynced per card) — used on browser cards,
  workout rows and the detail hero (pausable). `ExerciseMediaGallery` now renders Demo +
  Video-guide cards.
- **Detail/Browser/Plan/Map:** skeleton loading states, segmented controls, numbered
  instruction steps, restyled filters/chips/volume bars; 3D palette neutralised
  (`muscleMap.config.ts`).
- **i18n:** +3 strings (demoLabel, videoGuideLabel, playPauseDemo) in EN/FR/AR; `regenerate`
  is now "Shuffle"/"Mélanger"/"تبديل التمارين".
- **Deployment:** GitHub Pages via `.github/workflows/deploy.yml` (BASE_PATH-aware build,
  SPA 404 fallback, PWA scope). `vite.config.ts` takes `base` from `BASE_PATH`; router uses
  `import.meta.env.BASE_URL`; model URL is base-aware. Live at
  https://omar692002.github.io/musclemap/
- `scripts/screenshot.mjs`: mobile-viewport visual smoke (playwright-core + Edge, dev-only).
- Build green, 75 tests pass, lint clean.

## Round 2: videos at scale, calmer palette, Google sign-in (2026-06-10)
- **Video map 16 → 70 entries** (`exerciseVideos.ts`): scraped the real DeltaBolic shorts
  listing (id + title pairs) and hand-matched ~35 new videos to catalog ids (chest/shoulder/
  back/arm/leg machines, cables, smith, hip thrust, abduction…). All ids validated by the
  existing curation tests. PFA/academic embedding; licensed/coach uploads later (T1).
- **Colour discipline on Home:** one ember-gradient hero = "Today's workout"
  (`suggestedSessionFor(date)` — fixed weekly rotation), all other sessions are white cards
  with small tinted icon chips (`WorkoutSession.chip`); session banners all use
  `SESSION_HERO_GRADIENT`. Per-session rainbow gradients removed.
- **Auth (Google Identity Services, client-side):** `features/auth/` — `AuthProvider`
  (+localStorage persistence, `StorageKey.AuthUser`), `googleIdentity.ts` (GIS script loader,
  ID-token decode), `UserMenu` in the TopBar (GIS icon button → avatar + profile card +
  sign-out), personalised Home greeting. Configured via `VITE_GOOGLE_CLIENT_ID`
  (`auth.config.ts`); all auth UI hidden when unset. CI passes the repo *variable*
  `VITE_GOOGLE_CLIENT_ID` (see deploy.yml). i18n +4 strings (todaysPick, allSessions,
  signIn, signOut).

## Round 3: full video coverage push + video-first detail (2026-06-10)
- **Harvest tooling:** scripts/harvest-shorts.mjs scroll-harvests the entire DeltaBolic shorts
  tab via headless Edge (911 shorts -> scripts/shorts-list.txt as "videoId | title").
- **Bug found & fixed:** the earlier regex scrape paired each videoId with the NEXT video's
  title (off-by-one), so most round-2 additions pointed at wrong videos. The map was rebuilt
  from the DOM harvest (authoritative pairs): exerciseVideos.ts now has ~160 exercise entries
  covering chest/back/shoulder/arm/leg/core/forearm movements, machines, cables, Smith,
  bodyweight. Spot-verified live (Barbell_Squat -> "The PERFECT Barbell Squat").
- **Video-first detail:** ExerciseMediaGallery shows the curated video as the primary view
  with a "Video guide | Demo" segmented toggle (animated two-frame demo kept as the
  alternative); demo-only exercises render the animation directly.
