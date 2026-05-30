# Architecture & Conventions

## Stack
- **React 19 + TypeScript**, bundled with **Vite**.
- **Tailwind CSS v4** (via `@tailwindcss/vite`) — mobile-first styling.
- **vite-plugin-pwa** — installable, offline-capable PWA.
- **Hosting:** Vercel (free, push-to-deploy).
- **Future:** Capacitor (native shells), Supabase (auth/db/storage) — not yet installed.

## Layered structure (Clean Architecture / SOLID)
```
src/
  config/        App-wide constants (single source of truth, no scattered strings)
  domain/        Pure business core — no framework/UI imports
    enums/         MuscleRole, MuscleGroup, StorageKey, ...
    models/        Exercise, Muscle, MuscleInvolvement (immutable entities)
    repositories/  Interfaces (IExerciseRepository, ...) — Dependency Inversion seam
  data/          Concrete data sources implementing domain interfaces
    static/        StaticExerciseRepository (bundled JSON; M1 fills it)
                   -> Supabase implementation added in T1 behind the same interface
  features/      UI feature modules (browser, muscle-map, generator) — added M2+
  components/    Shared presentational components — added M2+
  App.tsx        Application shell
  main.tsx       Entry point
```

**Dependency rule:** `features`/`components` -> `domain` interfaces only. UI never imports a
concrete repository directly; implementations are injected. This is what makes the
static-JSON -> Supabase swap a zero-UI-change operation.

## Code-quality rules (mandatory — apply to every file)
- **Enums, not magic strings/numbers** (`MuscleRole`, `MuscleGroup`, `StorageKey`, ...).
  - Note: `tsconfig.app.json` has `erasableSyntaxOnly: false` so TS `enum`s compile. Do not re-enable it.
- **No hardcoded strings** — labels/keys/constants centralised (`config/`, enums, const maps).
- **OOP + SOLID** — interfaces & dependency inversion, single responsibility, small units.
- **No workarounds/hacks** — solve the root cause.
- **Clean code** — clear names, typed, immutable domain entities (`readonly`).
- **Docs stay current** — update the `*.md` files and `PROGRESS.md` each milestone.

## Conventions
- Domain entities are `readonly` / immutable.
- Repositories are async (`Promise`-returning) so remote sources fit the same contract.
- Type-only imports use `import type`.

## Deployment evolution (kept deliberately simple early, scales later)
The repository/interface seam means the *app* doesn't change as hosting grows up.
- **T0 (now):** static build (`npm run build` -> `dist/`) on **Vercel** (free, push-to-deploy).
  No containers needed — a PWA is just static files.
- **T1 (coach content):** **Supabase** hosts auth/DB/storage (managed). Frontend stays on Vercel.
- **T2 (commercial / scale):** containerize for portability and a cloud-agnostic path:
  - **Docker** image for any backend/API service we add (multi-stage build).
  - **Azure Container Registry (ACR)** stores images; **Azure Kubernetes Service (AKS)** runs them
    when we need horizontal scaling, multiple services (API, media processing, payment webhooks),
    and zero-downtime deploys.
  - Adopt Docker/K8s/AKS only when scale or multi-service complexity justifies it — managed
    (Vercel + Supabase) is cheaper and faster until then. The architecture supports either
    without an app rewrite.
- Native apps: **Capacitor** wraps the same web build into iOS/Android bundles for the stores.
