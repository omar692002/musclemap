# MuscleMap — Pages & Data Sources

Quick reference for every route in the app: what it shows, where data comes from, and what's still client-side only.

**Legend**
- `BACKEND` — authenticated fetch to the Spring API (`VITE_API_BASE_URL`)
- `STATIC` — bundled data (config files, JSON, taxonomy)
- `LOCALSTORAGE` — browser storage (used as offline cache or fallback when no backend)
- `CONTEXT` — value provided by a React context (itself backed by one of the above)
- `MOCK` — no real backend; client-side simulation only

---

## Public routes (no login required)

### `/login`
**Auth page — sign in or register**

What you see: email/password form, Google OAuth button, toggle between login and register.

| Data | Source |
|------|--------|
| Submit credentials | `BACKEND` — `POST /auth/login` or `POST /auth/register` |
| Google sign-in | `BACKEND` — `POST /auth/google` (verifies Google token server-side) |
| JWT token after login | `LOCALSTORAGE` — stored under `AuthToken` key |
| Logged-in user object | `LOCALSTORAGE` — cached under `AuthUser` key |

---

### `/exercises`
**Exercise browser — search & filter the full catalog**

What you see: grid of exercises, search bar, filters for muscle group / equipment / level.

| Data | Source |
|------|--------|
| Exercise list | `BACKEND` — `GET /catalog/exercises` (public endpoint, no auth needed) |
| Muscle taxonomy (filter chips) | `STATIC` — `data/static/taxonomy/muscles.ts` |
| Active filters | URL query params (`?group=`, `?muscle=`, `?equipment=`) |

---

### `/exercise/:id`
**Exercise detail — full info on one exercise**

What you see: exercise name, instructions, muscles worked with a 3D anatomical highlight, video embed, equipment tag.

| Data | Source |
|------|--------|
| Exercise data | `BACKEND` — `GET /catalog/exercises/:id` (public) |
| Muscle involvement | `BACKEND` — returned in the exercise response |
| Video embed | `STATIC` — YouTube video ID looked up from `data/static/exerciseVideos.ts` |
| 3D muscle model | `STATIC` — `public/models/muscles.glb` (loaded with three.js) |
| Exercise images | `STATIC` — CDN URL built from exercise name (`cdn.jsdelivr.net/gh/yuhonas/free-exercise-db`) |

---

### `/map`
**3D Muscle Map — tap a region to browse exercises by muscle**

What you see: interactive 3D body model; clicking a muscle filters the exercise browser.

| Data | Source |
|------|--------|
| 3D model | `STATIC` — `public/models/muscles.glb` |
| Muscle metadata | `STATIC` — `data/static/taxonomy/muscles.ts` |
| Navigation on click | Builds URL → redirects to `/exercises?muscle=...` |

---

## Authenticated routes (login required)

### `/` — Home / Dashboard
**Session launcher and activity summary**

What you see (guest): session cards (Chest & Triceps, Back & Biceps, Shoulders & Core, Legs, Cardio) with a suggested one highlighted based on the day of the week.
What you see (logged-in, onboarded): same session cards + a dashboard strip showing recent workouts and a prompt to log bodyweight.

| Data | Source |
|------|--------|
| Session card list | `STATIC` — `config/sessions.config.ts` (HOME_SESSIONS array) |
| Day-of-week suggestion | `STATIC` — deterministic rotation in sessions config |
| Session suggestion based on profile | `STATIC` — `config/recommendation.config.ts` (uses ProfileContext) |
| User identity / role | `CONTEXT` — AuthContext (backed by `LOCALSTORAGE`) |
| Onboarding status | `CONTEXT` — ProfileContext (backed by `BACKEND /profile` or `LOCALSTORAGE`) |
| Recent workouts summary | `BACKEND` — `GET /workouts` → cached to `LOCALSTORAGE` (WorkoutLogs key) |

---

### `/session/:id`
**Workout session runner** — e.g. `/session/BACK_BICEPS`, `/session/cardio`

What you see: warmup block, list of exercises for the day's focus, a "Start Workout" button. While running: timer, reps/weight input per exercise, finish button.

| Data | Source |
|------|--------|
| Session definition (which muscles/focus) | `STATIC` — `config/sessions.config.ts` |
| Exercise list for the session | `BACKEND` — filtered from catalog via ExerciseRepository; falls back to bundled JSON |
| "Regenerate" shuffle | `STATIC` — deterministic seed rotation, no API call |
| Saving completed workout | `BACKEND` — `POST /workouts` ; falls back to `LOCALSTORAGE` (WorkoutLogs) |

---

### `/program`
**Program Generator — build a weekly training plan**

What you see: form to pick split type (Push/Pull/Legs, Upper/Lower, Full Body…), training goal, frequency, equipment; generates a weekly schedule with exercise assignments and progression cues.

| Data | Source |
|------|--------|
| Split/goal/frequency options | `STATIC` — `config/program.config.ts` |
| Default form values pre-filled | `CONTEXT` — ProfileContext (age, goal, equipment, frequency) |
| Exercise selection per day | `BACKEND` — catalog via ExerciseRepository (filtered + ranked) |
| Progression rules | `STATIC` — `config/progression.config.ts` (sets/reps schemes by goal) |
| Generated plan | Client-side computation — not persisted anywhere yet |

---

### `/progress`
**Progress Analytics — workout history and bodyweight chart**

What you see: workout frequency chart, volume over time, personal records per exercise, bodyweight evolution chart, inline log-weight form.

| Data | Source |
|------|--------|
| Workout history | `BACKEND` — `GET /workouts` ; cached to `LOCALSTORAGE` (WorkoutLogs) |
| Bodyweight history | `BACKEND` — `GET /bodyweight` ; cached to `LOCALSTORAGE` (BodyweightLogs) |
| Log new weight | `BACKEND` — `POST /bodyweight` ; falls back to `LOCALSTORAGE` |
| Chart rendering | Client-side (static chart library) |

---

### `/intel`
**Muscle Intelligence — fatigue & volume tracking per muscle group**

What you see: per-muscle-group cards showing sets done this week vs evidence-based MEV/MAV/MRV thresholds, recovery readiness indicator.

| Data | Source |
|------|--------|
| Workout logs (to compute weekly sets) | `BACKEND` — `GET /workouts` ; cached to `LOCALSTORAGE` |
| MEV/MAV/MRV thresholds | `STATIC` — `config/muscleIntel.config.ts` |
| Recovery hours per group | `STATIC` — same config file |
| Exercise-to-muscle mapping | `BACKEND` — catalog via ExerciseRepository |

---

### `/onboarding`
**Onboarding Wizard — multi-step profile setup**

What you see: step-by-step form collecting age, gender, height, weight, fitness level, training experience, goal, weekly frequency, available equipment, injury limitations.

| Data | Source |
|------|--------|
| Current profile (to pre-fill) | `BACKEND` — `GET /profile` ; cached to `LOCALSTORAGE` (UserProfile) |
| Save progress per step | `BACKEND` — `PUT /profile` ; falls back to `LOCALSTORAGE` |
| Step sequence & skip rules | `STATIC` — `config/onboarding.config.ts` |
| Validation bounds (age/height/weight) | `STATIC` — same config |
| Dismiss wizard permanently | `BACKEND` — `POST /profile/skip` ; falls back to `LOCALSTORAGE` (OnboardingSkipped) |

---

### `/profile`
**Profile Editor — edit onboarding answers as a single form**

What you see: all onboarding fields on one page (same data as the wizard, no steps).

| Data | Source |
|------|--------|
| Load profile | `BACKEND` — `GET /profile` ; cached to `LOCALSTORAGE` |
| Save changes | `BACKEND` — `PUT /profile` ; falls back to `LOCALSTORAGE` |

---

### `/content`
**Content Library — coach-published videos**

What you see: grid of educational videos published by coaches; premium-locked entries blurred for FREE users.

| Data | Source |
|------|--------|
| Published videos | `BACKEND` — `GET /catalog/content` (public endpoint) |
| Premium gate (blur/lock) | `CONTEXT` — SubscriptionContext (see `/subscription`) |

---

### `/subscription`
**Subscription & Premium**

What you see: current plan badge (FREE / PREMIUM), feature comparison table, upgrade/cancel button.

| Data | Source |
|------|--------|
| Current plan | `MOCK` + `LOCALSTORAGE` — `subscriptionApi.ts` simulates billing client-side; no real payment |
| Upgrade/cancel | `MOCK` — writes a fake expiry timestamp to `LOCALSTORAGE` (Subscription key) |
| Feature list | `STATIC` — hardcoded in the component |

> **Note:** The backend has a real `Subscription` entity and enforces premium content server-side, but the frontend upgrade flow is a mock. This is a known placeholder pending Stripe integration.

---

## Role-gated routes

### `/coach`
**Coach Studio — author & publish educational videos**

What you see: list of your own videos (drafts + published), create/edit/delete/publish controls.

| Data | Source |
|------|--------|
| My videos | `BACKEND` — `GET /coach/videos` (COACH or ADMIN role required) |
| Create video | `BACKEND` — `POST /coach/videos` |
| Edit / delete / publish | `BACKEND` — `PUT /coach/videos/:id`, `DELETE /coach/videos/:id`, `POST /coach/videos/:id/publish` |

---

### `/admin`
**Admin Panel — platform metrics and user management**

What you see: platform stats (total users, active subscriptions), user table with role assignment and enable/disable controls.

| Data | Source |
|------|--------|
| Platform metrics | `BACKEND` — `GET /admin/metrics` (ADMIN role required) |
| User list | `BACKEND` — `GET /admin/users` |
| Change role | `BACKEND` — `PATCH /admin/users/:id/role` |
| Enable / disable user | `BACKEND` — `PATCH /admin/users/:id/status` |

---

## Overall Summary

| Page | Backend | Static | LocalStorage | Mock |
|------|---------|--------|--------------|------|
| `/login` | Auth endpoints | — | Token cache | — |
| `/exercises` | Catalog (public) | Taxonomy filters | — | — |
| `/exercise/:id` | Catalog (public) | Video IDs, 3D model | — | — |
| `/map` | — | 3D model, taxonomy | — | — |
| `/` Home | Workouts (cache) | Session cards, schedule | Workout cache | — |
| `/session/:id` | Catalog + save workout | Session config | Workout fallback | — |
| `/program` | Catalog (exercises) | Splits, progression rules | — | — |
| `/progress` | Workouts + Bodyweight | — | Both caches | — |
| `/intel` | Workouts + Catalog | MEV/MAV/MRV thresholds | Workout cache | — |
| `/onboarding` | Profile R/W | Step config, bounds | Profile fallback | — |
| `/profile` | Profile R/W | — | Profile fallback | — |
| `/content` | Content (public) | — | — | Premium gate |
| `/subscription` | — | Feature list | Plan state | Full billing flow |
| `/coach` | Coach CRUD | — | — | — |
| `/admin` | Admin endpoints | — | — | — |
