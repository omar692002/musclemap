# Architecture & Conventions

## Backend (added EM1, 2026-06-20) — `/backend`
A **Spring Boot 3 + PostgreSQL** backend lives in the monorepo `/backend` Maven module
(full details in `backend/README.md`). It replaces the earlier *Supabase* plan referenced
in the "Deployment evolution" section below (kept as history).
- **Layered Clean Architecture:** Controller → Service (interface + impl) → Spring Data
  Repository, package-by-feature under `com.musclemap` (`user`, `workout`, `coach`,
  `subscription`, `meta`, `common`, `config`).
- **Flyway owns the schema** (`hibernate.ddl-auto=none`); enum columns are `VARCHAR` +
  `CHECK` mirrored by Java enums. UUID PKs + audit timestamps via `BaseEntity`.
- **Security (EM2):** stateless **JWT** (HS256, jjwt) + **BCrypt** + **RBAC**. `SecurityConfig`
  is locked down (was permissive in M1): `JwtAuthenticationFilter` authenticates bearer tokens,
  `DaoAuthenticationProvider` backs email/password login, public routes are `/auth/{register,
  login,google}` + meta + health + Swagger, `/coach/**` and `/admin/**` are role-gated, all else
  `authenticated()`. 401/403 render the uniform `ApiError`. `com.musclemap.auth` package holds
  the flow (`AuthController/Service`, `JwtService`, `GoogleTokenVerifier`, `AppUserDetails*`).
  Config via `@ConfigurationProperties` (`musclemap.security.jwt.*`, `musclemap.oauth.google.*`).
- **Google sign-in (kept):** the existing frontend Google Identity flow is preserved.
  `/auth/google` verifies the Google ID token server-side and maps it onto the same `User`/`Role`
  model (provider `GOOGLE`, no local password). Google is **additive**, not a replacement for
  email/password.
- **Deploy:** multi-stage Docker image → **Render** (frontend stays on GitHub Pages),
  portable to ACR/AKS unchanged. `dev`/`prod` profiles; prod secrets come from env
  (`MUSCLEMAP_JWT_SECRET`, `MUSCLEMAP_GOOGLE_CLIENT_ID`).
- **Frontend ↔ backend (EM2):** first real API integration. When `VITE_API_BASE_URL` is set, the
  Google credential is exchanged at `/auth/google` for a platform JWT (stored as
  `StorageKey.AuthToken`); when unset it falls back to local ID-token decoding, so the static
  GH-Pages build keeps working with no backend. A future `ApiExerciseRepository` plugs into the
  existing frontend repository/interface seam with zero UI change.

## Stack (frontend)
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
