# Roadmap

## MVP (Tier 0) milestones
| # | Milestone | Deliverable | Status |
|---|-----------|-------------|--------|
| **M0** | Project setup | Vite+React+TS+Tailwind+PWA scaffold, git, SOLID structure, data-layer seam, docs, green build | done |
| **M1** | Data foundation | Import & normalise free-exercise-db -> our entities; muscle taxonomy; populate `StaticExerciseRepository` (+ tests) | done |
| **M2** | Exercise browser | List/search/filter by muscle group & equipment; detail page (primary/secondary/stabilizer + media) | next |
| **M3** | Interactive muscle map | Clickable front/back SVG (head-granular); muscle -> exercises; exercise -> highlighted muscles | todo |
| **M4** | Program generator v1 | Pick split/days/equipment -> balanced, non-redundant routine + weekly volume-per-muscle readout | todo |

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
