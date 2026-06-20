# Roadmap

## PFA Evolution Sprint (12 milestones) — current program of work
Transform the MVP PWA into a production-ready fitness platform (Hevy/Strong/Fitbod
class) on a **real Spring Boot 3 + PostgreSQL** backend, while preserving MuscleMap's
muscle-visualization moat. **Rule: one milestone at a time; each leaves the app stable.**

Backend stack decision (2026-06-20, confirmed with owner): **Spring Boot 3** (full),
in a monorepo **`/backend`** module, deployed on **Render** (frontend stays on GitHub
Pages), extensible to Docker/ACR/AKS with no app rewrite. This supersedes the earlier
Supabase plan in the older docs.

| # | Evolution Milestone | Deliverable | Status |
|---|---------------------|-------------|--------|
| **EM1** | Backend Foundation | Spring Boot 3 `/backend`, layered (controller→service→repo), JPA, Flyway schema (users, user_profiles, generated_programs, workout_sessions, workout_exercises, coach_videos, subscriptions), role taxonomy, Docker, OpenAPI | **done (2026-06-20)** |
| **EM2** | Authentication & Security | Registration/login/logout, JWT, BCrypt, RBAC (USER/COACH/ADMIN), route+API protection, validation, error handling, **Google sign-in preserved** (ID-token exchange → platform JWT) | **done (2026-06-20)** |
| **EM3** | Premium Onboarding | Collect age/gender/height/weight/level/experience/goal/frequency/equipment/injuries → persist to `user_profiles`; mobile-first flow | pending |
| **EM4** | Personalized Dashboard | Replace static home: welcome, profile summary, goal, recommended workout, weekly activity, streak, recent workouts, quick actions | pending |
| **EM5** | Smart Generator V2 | Splits (Full Body / Upper-Lower / PPL / Bro), recovery logic, progressive-overload recommendations | pending |
| **EM6** | Workout Tracking | Start/complete/save/review; persist sets/reps/weight/duration to `workout_sessions`/`workout_exercises` | pending |
| **EM7** | Progress Analytics | Bodyweight evolution, frequency, PRs, volume; cards + charts + weekly summaries | pending |
| **EM8** | Advanced Muscle Intelligence | Primary/secondary/stabilizer detail, fatigue analysis (under/over-trained), recovery recommendations | pending |
| **EM9** | Admin Platform | Manage users/exercises/programs/muscle groups/coach content; dashboard metrics | pending |
| **EM10** | Coach Platform | Coach uploads videos, creates programs, publishes educational/premium content | pending |
| **EM11** | Subscription Architecture | FREE/PREMIUM entities, feature gates, premium guards (no Stripe yet) | pending (table seeded EM1) |
| **EM12** | Product Polish | Animations, skeletons, empty/error states, a11y, responsiveness, dark mode, visual consistency | pending |

## MVP (Tier 0) milestones — shipped (history)
| # | Milestone | Deliverable | Status |
|---|-----------|-------------|--------|
| **M0** | Project setup | Vite+React+TS+Tailwind+PWA scaffold, git, SOLID structure, data-layer seam, docs, green build | done |
| **M1** | Data foundation | Import & normalise free-exercise-db -> our entities; muscle taxonomy; populate `StaticExerciseRepository` (+ tests) | done |
| **M2** | Exercise browser | List/search/filter by muscle group & equipment; detail page (primary/secondary + media) | done |
| **M3** | Interactive muscle map | Clickable front/back SVG (muscle-level); muscle -> exercises; exercise -> highlighted muscles | done |
| **M4** | Program generator v1 | Pick split/days/equipment -> balanced, non-redundant routine + weekly volume-per-muscle readout | done |

## Evolution (post-MVP)
- **P1 Depth:** richer media, exercise variations, full head granularity.
- **P2 Progression:** periodization, progressive overload, workout rotation.
- **P3 Tracking:** workout logging, volume/balance analytics, coverage heatmap.
- **T1 Coach content:** Supabase auth + admin/coach role + coach video uploads.
- **T2 Commercial:** subscriptions, native iOS/Android via Capacitor, personalization.
- **DevOps (T2 / scale):** Dockerize backend services; push images to **ACR**; deploy on **AKS**
  with CI/CD. Adopt only when multi-service scale justifies it (managed Vercel+Supabase until then).
  See ARCHITECTURE.md -> "Deployment evolution".

## Academic strengthening (for the PFA report)
- Formalise the generator as a constraint-satisfaction/optimization problem; compare algorithms.
- Cite evidence-based weekly volume landmarks (literature review).
- Small UX evaluation with testers.
- Stretch: pose estimation (MediaPipe/TF.js) for rep/form feedback.
