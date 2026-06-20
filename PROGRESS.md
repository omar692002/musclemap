# Progress Log

## EM10 — Coach Platform (complete, 2026-06-20)
**State:** The two halves of one feature, both on the existing `coach_videos` table
(created in V1, never used until now). **Authoring side** — backend package
`com.musclemap.coach` exposes `/api/v1/coach/videos` (already `hasAnyRole("COACH","ADMIN")`
in `SecurityConfig`): `POST` creates an **unpublished draft**, `GET` returns the coach's
**own** library (drafts + published), `PUT/{id}` edits, `PATCH/{id}/publish` toggles
visibility, `DELETE/{id}` removes. `CoachService`/`CoachServiceImpl` resolve the owning
coach from the verified principal and enforce ownership on every read/mutate — a mismatch
is a **404**, never leaking another coach's ids (same pattern as `WorkoutSessionServiceImpl`).
Publishing is deliberately a separate step from saving, so editing a draft never silently
publishes it. DTOs `CoachVideoRequest` (no `published` field), `CoachVideoResponse`
(carries `coachId`/`coachName` to credit the author), `PublishRequest`.

**Consumer side** — `ContentController` exposes `GET /api/v1/content/videos`, returning
every **published** item to any signed-in user. It lives under `/content/**` (not
`/coach/**`), so no coach role is required to browse. Premium items are returned here and
flagged `premium`, but the actual premium **access gate is deferred to EM11**.

**Schema.** Flyway **V4** adds `coach_videos.content_type`
(`TECHNIQUE`/`EDUCATION`/`PROGRAM`, default `TECHNIQUE`, VARCHAR + CHECK) → new
`CoachContentType` enum on the entity. This covers the milestone's "uploads videos /
creates programs / publishes educational content" without a second table. Bumped app
version 0.3.0→0.4.0 / milestone to "EM10 - Coach Platform".

**Frontend.** `features/coach/coachApi.ts` is backend-only (no localStorage fallback —
coach content is shared server state, exactly like `adminApi.ts`); `isCoachBackendReady()`
gates the UI, which shows an honest "needs backend" notice on the static deploy.
`features/coach/CoachStudioPage.tsx` (`/coach`) is the studio: a create/edit form
(type/title/description/video+thumbnail URLs/exercise/muscle/premium/duration), per-item
publish toggle, and delete-with-confirm; COACH/ADMIN only (others redirected home).
`features/content/ContentLibraryPage.tsx` (`/content`) is the public library: published
content as cards (thumbnail, type/premium badges, coach credit, watch link). New
`CoachContentType` enum + `CoachVideo`/`CoachVideoDraft` models. User-menu entries —
"Coach studio" for COACH/ADMIN, "Coach content" for any signed-in user when a backend is
wired; the 6-tab bottom nav is untouched. 44 EN/FR/AR `ui` keys + a `coachContentType` map.

**Quality.** `mvn test` **44** green (+8 `CoachServiceImplTest`: create-as-draft, default
content type, owner-scoped 404 on update/delete, publish toggle, listPublished). `npm test`
**102** green, `npm run build`/`lint` green. Verified **end-to-end on dockerized Postgres**:
Flyway V4 applied (history row 4 + `content_type` column present); draft created
unpublished → absent from `/content` → published → appears in `/content` with coach credit;
a plain USER gets **403** on `/coach/videos` but **200** on `/content/videos`; blank title
→ **400**.

**Next action:** EM11 — Subscription Architecture (FREE/PREMIUM entities, feature gates,
premium guards; no Stripe yet). The `subscriptions` table is seeded since EM1 and EM10's
content already carries a `premium` flag waiting to be gated.

## EM9 — Admin Platform (complete, 2026-06-20)
**State:** A real, RBAC-gated **admin platform**. New backend package
`com.musclemap.admin` exposes `/api/v1/admin/**` (already `hasRole("ADMIN")` in
`SecurityConfig`): `GET /admin/metrics` (platform-health snapshot), `GET /admin/users`
(full roster, newest first), `PATCH /admin/users/{id}/role` and
`PATCH /admin/users/{id}/status` (enable/disable). `AdminService`/`AdminServiceImpl`
aggregate counts across the user/profile/program/session/coach-video repositories and
mutate the managed `User` entity; both mutating paths take the **acting admin's id** and
refuse a **self-lockout** (an admin can't drop their own ADMIN role or disable their own
account — guarded server-side *and* in the UI). DTOs `AdminMetricsResponse`,
`AdminUserResponse` (no password hash ever), `UpdateRoleRequest`, `UpdateUserStatusRequest`.

**First-admin bootstrap.** `AdminBootstrap` (an `ApplicationRunner`) elevates any user in
`musclemap.admin.bootstrap-emails` to ADMIN on startup (idempotent; defaults to the owner
`omarmnif123@gmail.com` via `MUSCLEMAP_ADMIN_EMAILS`), so the platform always has a way in
without hand-editing the DB. Added `MuscleMapProperties.Admin` + the `musclemap.admin` yml
block; bumped app version 0.2.0→0.3.0 / milestone to "EM9 - Admin Platform".

**Frontend.** Role is now plumbed end-to-end: new `UserRole` enum, optional `role` on
`AuthUser`, mapped from the backend `AuthResponse` in `authApi.ts` and persisted/restored in
`AuthContext`. The **client-side-only Google fallback stays role-less** → never treated as
admin (admin features closed by default; owner's Google sign-in preserved, role comes from
the backend JWT exchange). New `features/admin/`: `adminApi.ts` (backend-only client, no
localStorage fallback — nothing local to administer; `isAdminBackendReady()` gates it) and
`AdminPage.tsx` (`/admin` route) — a platform-metrics grid + a user list with a role
`<select>` and an enable/disable toggle (own-account controls locked, "You" badge). Reached
via an **Admin** entry in the user menu shown only when `role === ADMIN` (deliberately *not*
a 7th bottom-nav tab — keeps the workout-first nav uncluttered). Honest states: redirect
home for non-admins, an "admin needs the backend" notice on the static deploy, load-error +
retry, and per-row busy locking.

**i18n:** 28 new EN/FR/AR `ui` keys + a `userRole` enum label map (`USER_ROLE_LABELS`); TS
keeps all three packs exhaustive. **Tests:** backend `mvn test` **36** green (+8
`AdminServiceImplTest`: metrics aggregation, roster mapping without secrets, role change,
self-demotion guard, self-admin re-assert allowed, missing-user 404, disable another, and
self-disable guard). `npm test` **102** green, `build`/`lint` green. The admin frontend is
UI/network code (no new pure engine to unit-test).

**Files:** backend `admin/{AdminController,AdminService,AdminServiceImpl,AdminBootstrap}`,
`admin/dto/{AdminMetricsResponse,AdminUserResponse,UpdateRoleRequest,UpdateUserStatusRequest}`,
`config/MuscleMapProperties` (+`Admin`), `resources/application.yml`, repo count methods
(`UserRepository`,`WorkoutSessionRepository`,`CoachVideoRepository`); frontend
`domain/enums/UserRole.ts`, `domain/models/AuthUser.ts`, `features/auth/{authApi,AuthContext,UserMenu}`,
`features/admin/{adminApi.ts,AdminPage.tsx}`, `config/{routes,labels}.ts`,
`config/i18n/{types,en,fr,ar}.ts`, `App.tsx`.

**Next action:** EM10 — Coach Platform (coach uploads videos, creates programs, publishes
educational/premium content).

## EM8 — Advanced Muscle Intelligence (complete, 2026-06-20)
**State:** A new **Intel** tab (6th bottom-nav tab, `Gauge`) → `features/muscle-intel/
MuscleIntelPage.tsx` turns the EM6 workout history into per-muscle-group intelligence:
for each major group a card shows **weekly effective sets** against its evidence-based
**MEV/MAV/MRV** landmark bar (the fatigue/volume read), a **recovery-readiness** bar +
% recovered with last-trained recency, a **role breakdown** (primary/secondary/
stabilizer effective sets), and a single **recovery recommendation**. Two summary tiles
roll up *ready-to-train* and *over-trained* counts. Honest empty state until the first
tracked session; the screen is frontend-only (no backend change — like EM4/EM5).

**The engine is pure & tested.** `features/muscle-intel/muscleIntel.ts` exposes
`computeMuscleIntel(logs, exerciseIndex, muscleIndex, now)` → `MuscleIntelSummary`
(injectable `now`). It folds **completed** exercises in **completed** sessions onto
muscle groups via each involvement's role `contribution` (Primary 1.0 / Secondary 0.5 /
Stabilizer 0.25 — same weighting as the generator's volume readout; the dataset has no
stabilizers yet so that role reads 0 until curation, but the engine already handles it).
Per group it derives: **weekly effective sets** over a rolling 7-day window →
`TrainingStatus` vs landmarks (`Untrained`/`Undertrained`/`Optimal`/`Overtrained`);
**recovery** from hours-since-last-stimulus scaled by that session's load against a
modelled per-group recovery window → `recoveryPct` + `MuscleReadiness`
(`Ready`/`Recovering`/`Fatigued`); and a `RecoveryAdvice` recommendation from
(status × readiness). Tunables (landmarks, recovery hours, window, thresholds,
displayed groups) live in `config/muscleIntel.config.ts` — MEV/MAV/MRV cited to
Renaissance Periodization (good PFA material).

**New enums:** `TrainingStatus`, `MuscleReadiness`, `RecoveryAdvice`. **i18n:** 18 new
EN/FR/AR `ui` keys + 3 new enum label maps (`trainingStatus`/`muscleReadiness`/
`recoveryAdvice`); TS keeps all three packs exhaustive. **Tests:** `npm test` **102**
green (+9 `muscleIntel.test.ts`: empty defaults, ignore not-completed, role-weighted
distribution, landmark classification, 7-day window drop-but-keep-recovery, load-scaled
recovery bands, most-recent-session recovery driver, advice mapping, whole-body counts).
`npm run build` (tsc+vite+PWA) + `npm run lint` green. `mvn` untouched (no backend change).

**Files:** `domain/enums/{TrainingStatus,MuscleReadiness,RecoveryAdvice}.ts`,
`config/muscleIntel.config.ts`, `features/muscle-intel/{muscleIntel.ts,MuscleIntelPage.tsx,
__tests__/muscleIntel.test.ts}`, `config/routes.ts`, `App.tsx`, `components/BottomNav.tsx`
(5→6 tabs), `config/labels.ts`, `config/i18n/{types,en,fr,ar}.ts`.

**Next action:** EM9 — Admin Platform (manage users/exercises/programs/muscle groups/
coach content; dashboard metrics).

## EM7 — Progress Analytics (complete, 2026-06-20)
**State:** A new **Progress** tab (5th in the bottom nav, `TrendingUp`) surfaces a
full analytics screen built on the EM6 session history: a **this-week summary**
(volume + sessions, with a % delta vs last week), **overview** stat tiles (total
workouts / volume / sets), **weekly volume** and **workouts-per-week** bar charts
(last 8 weeks), a **personal-records** list (best estimated 1RM per exercise), and
a **bodyweight-evolution** line chart you can log new weigh-ins into. All charts
are hand-rolled inline SVG — **no charting dependency** added. The workout-derived
sections show an honest empty state until the first session is tracked; bodyweight
logging is always available.

**Analytics are pure & tested.** `features/analytics/analytics.ts` exposes a pure
`computeAnalytics(logs, now)` → `AnalyticsSummary` (injectable `now`): tonnage =
Σ sets×reps×weight over **completed** exercises in **completed** sessions; sets the
same; weeks rolled into the last `WEEKS_WINDOW` (8) Monday-anchored buckets,
zero-filled for gaps; PRs = best **Epley** 1RM (`w×(1+reps/30)`) per exercise,
weighted sets only, capped at `PR_LIMIT` (6), strongest first. `charts.tsx` holds
presentational `BarChart`/`LineChart` (fixed `viewBox`, `w-full h-auto`, ember
accent). `AnalyticsPage.tsx` seeds from the local cache then refreshes from the
backend (same dual-path hook pattern as the EM6 dashboard).

**Bodyweight tracking is full-stack** (new data source; the only backend change).
Flyway **V3** adds `bodyweight_entries` (one row per user per **day** via a
`UNIQUE (user_id, recorded_on)` constraint). Backend `com.musclemap.bodyweight`:
`BodyweightController` (`POST|GET|DELETE /api/v1/bodyweight`) + `BodyweightService(+Impl)`
— **upsert by day** (a same-day log replaces the value, never stacks points),
current-user scoped, ownership→404; DTOs `dto/Bodyweight{Request,Response}`
(`@NotNull @DecimalMin(1.0) @DecimalMax(999.99)` weight, `recordedOn` defaults to
server today). Frontend `features/analytics/bodyweightApi.ts` mirrors `workoutApi`
(backend when `VITE_API_BASE_URL` + token, else `StorageKey.BodyweightLogs`
localStorage, upsert-by-day both paths); `domain/models/BodyweightEntry.ts`.
Sign-out clears the cache (`clearLocalBodyweight` in `AuthContext`).

**i18n:** 25 new EN/FR/AR `ui` keys (nav + analytics + bodyweight logger). **Tests:**
`mvn test` **28** green (+6 `BodyweightServiceImplTest`: upsert-create, upsert-update-
same-day, recordedOn-defaults-today, missing-user, ownership 404, delete-missing);
`npm test` **93** green (+7 `analytics.test.ts`: empty/zero-filled window, ignore-not-
completed, tonnage/sets over completed only, this-vs-last-week bucketing, window-drop
keeps totals, best-1RM PR, bodyweight-only excluded); `build` + `lint` green.
**Verified end-to-end** on dockerized Postgres: Flyway V3 applied (`success=t`),
401 unauth, 201 create (date→today), same-day **upsert** (same id, value replaced,
list stays length 1), negative weight → 400.

**Files:** backend `db/migration/V3__bodyweight_entries.sql`, `bodyweight/BodyweightEntry.java`,
`bodyweight/BodyweightEntryRepository.java`, `bodyweight/BodyweightService(+Impl).java`,
`bodyweight/BodyweightController.java`, `bodyweight/dto/Bodyweight{Request,Response}.java`,
`test/.../bodyweight/BodyweightServiceImplTest.java`. Frontend `domain/models/BodyweightEntry.ts`,
`domain/enums/StorageKey.ts`, `features/analytics/{analytics.ts,charts.tsx,bodyweightApi.ts,
AnalyticsPage.tsx,__tests__/analytics.test.ts}`, `App.tsx`, `components/BottomNav.tsx`,
`config/routes.ts`, `features/dashboard/Dashboard.tsx`, `features/auth/AuthContext.tsx`,
`config/i18n/{types,en,fr,ar}.ts`.

**Next action:** EM8 — Advanced Muscle Intelligence (primary/secondary/stabilizer
detail, fatigue analysis under/over-trained, recovery recommendations).

## EM6 — Workout Tracking (complete, 2026-06-20)
**State:** A signed-in user can now **start, run, finish and save** a workout, and the
EM4 dashboard's streak / weekly-activity / recent sections light up from that real
history. Sessions persist to `workout_sessions` / `workout_exercises` (per-exercise
sets/reps/weight/`completed` + session `duration`), degrading to localStorage on the
static (no-backend) deploy — same pattern as EM2/EM3. **No Flyway migration** (the
columns were seeded in V1; aggregate set/rep/weight matches the schema).

**Backend** (`com.musclemap.workout`): `WorkoutController` exposes `POST /api/v1/workouts`
(201, persist a tracked session), `GET /workouts` (list, newest first), `GET /workouts/{id}`,
`DELETE /workouts/{id}` — all on the **current** user via `@AuthenticationPrincipal
AuthenticatedUser`, behind `anyRequest().authenticated()` (no `SecurityConfig` change).
`WorkoutSessionService(+Impl)` builds a `WorkoutSession` with its `WorkoutExercise` children
(positions from list order when omitted; `status` defaults to `COMPLETED`), and enforces
**ownership** on read/delete — another user's id surfaces as **404**, never leaking existence.
DTOs `dto/Workout{Session,Exercise}{Request,Response}` (bean-validated: `@NotBlank`
exerciseRef, `@PositiveOrZero` numerics, weight ≤ 9999.99, rpe 0–10, `@NotEmpty` exercises).

**Frontend.** New `domain/models/WorkoutLog.ts` + `domain/enums/SessionStatus.ts` (mirrors the
backend enum). `features/workouts/workoutApi.ts` mirrors `profileApi`: backend round-trip
(`POST|GET /workouts`) when `VITE_API_BASE_URL` + a token are present, else a localStorage
cache (`StorageKey.WorkoutLogs`); every backend read refreshes the cache so the dashboard's
**synchronous** read stays warm. **Full runner** `WorkoutRunner.tsx` (reached from a new
"Start workout" CTA on `SessionPage`): a live session **timer**, per-exercise **check-off** +
editable **reps/weight** inputs, and a **Finish** that saves sets/reps/weight/duration then
returns home. `dashboardData.ts` is rewritten — the EM4 `getWorkoutActivity()` seam now derives
from real logs via a pure, testable `computeActivity(logs, now)` (weekly Mon→Sun strip, this-week
count, **streak** = consecutive trained days ending today/yesterday, 5 most-recent); a new
`useWorkoutActivity()` hook seeds from the local cache then refreshes from the backend, and
`Dashboard` consumes it. Sign-out clears the local logs (`clearLocalWorkouts` in `AuthContext`).

**i18n:** 4 new EN/FR/AR `ui` keys (`finishWorkout`/`cancelWorkout`/`savingWorkout`/`doneLabel`);
`startWorkout`/`repsWord`/`weightWord` reused. **Tests:** `mvn test` **22** green (+6
`WorkoutSessionServiceImplTest`: persist+ordering, status default, missing-user, ownership 404,
delete-missing); `npm run test` **86** green (+7 `dashboardData.test.ts`: empty baseline,
ignore-not-completed, today strip+count+streak, multi-day streak, gap reset, streak-from-yesterday,
recent-limit-5). `npm run build` + `lint` green.

**Files:** backend `workout/WorkoutController.java`, `workout/WorkoutSessionService(+Impl).java`,
`workout/dto/Workout{Session,Exercise}{Request,Response}.java`,
`test/.../WorkoutSessionServiceImplTest.java`. Frontend `domain/models/WorkoutLog.ts`,
`domain/enums/{SessionStatus,StorageKey}.ts`, `features/workouts/{workoutApi.ts,WorkoutRunner.tsx,
SessionPage.tsx}`, `features/dashboard/{dashboardData.ts,Dashboard.tsx,__tests__/dashboardData.test.ts}`,
`features/auth/AuthContext.tsx`, `config/i18n/{types,en,fr,ar}.ts`.

**Next action:** EM7 — Progress Analytics (bodyweight evolution, frequency, PRs, volume;
cards + charts + weekly summaries) — built on the EM6 session history.

## EM5 — Smart Generator V2 (complete, 2026-06-20)
**State:** The program generator (`/program`) is now recovery-aware, profile-tuned,
and ships progressive-overload guidance. **Frontend-only & pure** — the generator
stays client TS (like V1/EM4); no backend change. The four splits already existed
(Full Body / Upper-Lower / PPL / BodyPart = the "Bro" split), so the milestone's new
value is **recovery logic + progressive overload + profile-awareness**.

**Recovery logic.** `generateProgram` no longer just cycles `params.days` templates;
it lays them over a **Mon→Sun calendar** via `WEEKLY_LAYOUTS` (config, keyed by
day-count) so sessions are spaced (e.g. 3 days → Mon/Wed/Fri) and the gaps become
**rest days** (`DayFocus.Rest`, `WorkoutDay.isRest`, empty exercises). A per-group
**recovery readout** (`GroupRecovery` → `RecoveryReadout.tsx`) reports sessions/week
and the smallest calendar gap, flagged **Optimal (≥48h)** or **Overlap** (back-to-back),
via `computeRecovery` + `minCyclicGap` (7-day wrap) and `RecoveryConfig.optimalGapDays`.

**Progressive overload.** Goal → `ProgressionStrategy` (Strength=LinearLoad,
Hypertrophy=DoubleProgression, Endurance=RepsAndDensity) in `config/progression.config.ts`.
Each prescribed lift gets a mechanic-aware **`OverloadCue`** (`WorkoutExerciseRow`
renders it under sets×reps, present only on generated programs so quick sessions are
unchanged). `WorkoutProgram.progression` is a **4-week mesocycle** (`ProgressionWeek[]`,
3 progressive weeks + deload) → `ProgressionPlanCard.tsx`.

**Profile-awareness.** `config/generatorProfile.ts` `prefillFromProfile()` maps the EM3
`UserProfile` → split/days/goal/equipment (`ProfileGoal`→`TrainingGoal`, weeklyFrequency→
days clamped to `dayOptions`, split by frequency). `ProgramGeneratorPage` applies it once
when an onboarded profile loads (ref-guarded) and shows a **"Tuned to your profile"** chip
that clears when the user edits a control. Falls back to `DEFAULT_PREFILL` signed-out /
on the static deploy.

**New enums:** `Weekday`, `RecoveryStatus`, `ProgressionStrategy`, `ProgressionStep`,
`OverloadCue`; `DayFocus.Rest`. **i18n:** new `weekday`/`recoveryStatus`/`progressionStep`/
`overloadCue` maps + 8 `ui` keys across EN/FR/AR (TS enforces all three). **Tests:**
`programGenerator.test.ts` rewritten for the 7-day shape + new coverage (rest-day
insertion, overload tagging, recovery Optimal vs Overlap, 4-week plan per goal) — **79**
green (was 74). `npm run build` + `lint` green.

## EM4 — Personalized Dashboard (complete, 2026-06-20)
**State:** The static session launcher on Home is replaced, for a signed-in
**onboarded** user, by a profile-driven dashboard. Signed-out / not-yet-onboarded
users still get the original session launcher (now `SessionLanding` inside
`HomePage`) plus the EM3 onboarding nudge, so nothing regresses.

**Frontend** (`features/dashboard/**` — EM4 is frontend-only; it consumes the
EM3 profile and needs no backend change). `Dashboard.tsx` renders, top to bottom:
a **goal-aware recommended workout** (`config/recommendation.config.ts`:
`recommendedSessionFor` surfaces the cardio session for `LOSE_FAT` /
`IMPROVE_ENDURANCE`, otherwise the strength-day rotation `suggestedSessionFor`;
falls back to the rotation when no profile/goal), **streak** + **this-week** stat
cards (this-week shows `count / weeklyFrequency` from the profile), a **weekly
activity** strip (Mon→Sun, today ringed, completed days filled), a **profile
summary** (goal, level/experience chips, age·height·weight, **Edit profile** →
`/onboarding`), **recent workouts**, and **quick actions** (build / browse /
muscle map). `HomePage` branches on `user && profile.onboardingCompleted`; the
shared `QuickTile` moved into `Dashboard.tsx` (re-exported, used by both paths).

**Honest data caveat:** real session history is **EM6 (Workout Tracking)**. Until
then there is no source of truth for streak / weekly-activity / recent-workouts,
so `dashboardData.ts` returns `EMPTY_ACTIVITY` and the UI shows motivating empty
states. `getWorkoutActivity()` is the single seam EM6 swaps for a real read — the
`WorkoutActivity` / `RecentWorkout` shapes the UI consumes are already defined.

**i18n:** 16 new `UiStrings` keys (recommended/profile/streak/activity/recent/
quick-actions + `ageWord`/`heightWord`/`weightWord`/`yearsUnit`/`levelWord`/
`experienceWord`) across EN/FR/AR; weekday initials + recent dates come from
`Intl.DateTimeFormat(getActiveLanguage())`, so the strip is localized + RTL-safe.

**Verified:** `npm run build` (tsc+vite+PWA) green, `npm run lint` clean,
`npm run test` **74** green (+3 `config/__tests__/recommendation.test.ts`).

**Files:** `features/dashboard/{Dashboard.tsx,dashboardData.ts}`,
`config/recommendation.config.ts`, `config/__tests__/recommendation.test.ts`,
`features/workouts/HomePage.tsx`, `config/i18n/{types,en,fr,ar}.ts`.

**Next action:** EM5 — Smart Generator V2 (splits Full Body / Upper-Lower / PPL /
Bro, recovery logic, progressive-overload recommendations), or EM6 — Workout
Tracking (which also lights up this dashboard's streak/activity/recent sections).

## EM3 — Premium Onboarding (complete, 2026-06-20)
**State:** A signed-in user can complete a mobile-first onboarding wizard that
collects their profile (age/gender/height/weight/level/experience/goal/frequency/
equipment/injuries) and persists it to the `user_profiles` table (which already
existed from EM1). The flow is **gated behind auth** and degrades gracefully to
localStorage on the static (no-backend) deploy.

**Backend** (`com.musclemap.user`): new `Equipment` enum (mirrors the frontend
vocab); `ProfileRequest`/`ProfileResponse` DTOs (`dto/**`) with bean validation
(age 10–120, height 50–260, weight 20–400, frequency 1–7, enum-typed gender/
level/goal/equipment); `UserProfileService(+Impl)` does a get/**upsert** keyed on
the user, serializing the equipment list to a JSON array in
`available_equipment` (plain text per the schema) and **deriving**
`onboardingCompleted` server-side from whether the core fields are present (never
trusted from the client). `ProfileController` exposes `GET /api/v1/profile`
(returns an empty/not-onboarded view when no row exists) and `PUT /api/v1/profile`,
both acting on the **current** user via the `@AuthenticationPrincipal
AuthenticatedUser` (a user can only read/write their own profile). The whole
controller sits behind `anyRequest().authenticated()` — no `SecurityConfig`
change needed. Added a `HttpMessageNotReadableException → 400` handler so a bad
enum / malformed body returns the uniform `ApiError` (not a 500). **No Flyway
migration** — the `user_profiles` columns were seeded in V1.

**Frontend** (`features/onboarding/**`): new domain enums (`Gender`,
`FitnessLevel`, `ProfileGoal`, `TrainingExperience` — `ProfileGoal` is distinct
from the generator's `TrainingGoal`) + `UserProfile` model (`emptyProfile()`).
`profileApi.ts` mirrors the EM2 auth-client pattern: when a backend + bearer
token are present it round-trips `GET|PUT /profile`; otherwise (static deploy) it
reads/writes a localStorage cache (`StorageKey.UserProfile`), so onboarding never
dead-ends. `ProfileContext` loads the profile on sign-in (cleared on sign-out)
and exposes `needsOnboarding`. `OnboardingPage` is a 9-step wizard
(`config/onboarding.config.ts` holds the step order + option vocabularies +
numeric bounds in lockstep with the backend); shared inputs in
`OnboardingFields.tsx` (single/multi option grids + clamped number field). The
page gates on auth + profile-readiness then mounts an inner `OnboardingWizard`
seeded from the loaded profile (so the same flow doubles as **edit profile**, no
seeding effect). A dismiss-on-complete `OnboardingPrompt` banner nudges from
Home; the `UserMenu` dropdown gained an **Edit profile** link. New `/onboarding`
route; `ProfileProvider` wraps `App` under `AuthProvider`. Full i18n (EN/FR/AR):
new onboarding UI strings + `gender`/`fitnessLevel`/`profileGoal`/`experience`
label maps (TS `Record` keeps all three packs exhaustive).

**Verified end-to-end** (dockerized Postgres, dev profile): register → token;
`GET /profile` 401 without token, 200 + `onboardingCompleted=false` with token;
`PUT /profile` (full body) → `onboardingCompleted=true`, equipment
`["BARBELL","DUMBBELL"]` round-trips; `GET /profile` re-read persists age/freq/
experience; `gender="ALIEN"` → 400; `age=5` → 400. `mvn test` green (**16**:
+5 `UserProfileServiceImplTest`). Frontend `npm run build` (tsc+vite+PWA) green,
`npm run lint` clean, `npm run test` 71 green.

**Files:** backend `user/Equipment.java`, `user/UserProfileService.java`,
`user/UserProfileServiceImpl.java`, `user/ProfileController.java`,
`user/dto/Profile{Request,Response}.java`, `common/web/GlobalExceptionHandler`
(+unreadable handler), `test/.../UserProfileServiceImplTest.java`. Frontend
`domain/enums/{Gender,FitnessLevel,ProfileGoal,TrainingExperience}.ts`,
`domain/models/UserProfile.ts`, `domain/enums/StorageKey.ts` (+UserProfile),
`features/onboarding/{profileApi,ProfileContext,OnboardingPage,OnboardingFields,
OnboardingPrompt}.tsx`, `config/onboarding.config.ts`, `config/routes.ts`,
`config/labels.ts`, `config/i18n/{types,en,fr,ar}.ts`, `App.tsx`, `main.tsx`,
`features/auth/{AuthContext,UserMenu}.tsx`, `features/workouts/HomePage.tsx`.

**Next action:** EM4 — Personalized Dashboard (replace the static Home with a
profile-driven dashboard: welcome, profile summary, goal, recommended workout,
weekly activity, streak, recent workouts, quick actions — building on this
profile + the `needsOnboarding` signal).

## EM2 — Authentication & Security (complete, 2026-06-20)
**State:** The M1 foundation now has real authentication and authorization. The
deliberately-permissive `SecurityConfig` is locked down: **stateless JWT** (HS256 via jjwt),
**BCrypt** password login, and **RBAC** (USER/COACH/ADMIN). **Existing Google sign-in is
preserved** and now maps onto the same identity model.

**Endpoints** (`com.musclemap.auth`): `POST /api/v1/auth/register` (201 + token),
`POST /auth/login`, `POST /auth/google`, `GET /auth/me` (bearer-protected). Logout is
client-side by design — JWTs are stateless, so the client simply discards its token.

**Security wiring:**
- `JwtService` issues/verifies HS256 tokens (subject = user id; `email`/`role`/`name` claims);
  signing secret from `musclemap.security.jwt.secret` — **fails fast** if < 32 bytes (prod must
  set `MUSCLEMAP_JWT_SECRET`; dev has a local default).
- `JwtAuthenticationFilter` authenticates `Authorization: Bearer` requests into an
  `AuthenticatedUser` principal (no per-request DB hit). `DaoAuthenticationProvider` +
  `AppUserDetailsService` back email/password login.
- `SecurityConfig`: stateless; public = `/auth/{register,login,google}` + `/meta` + health +
  Swagger; `/admin/**` = ADMIN, `/coach/**` = COACH|ADMIN; everything else authenticated.
  401/403 render the uniform `ApiError` (`JwtAuthenticationEntryPoint` / `RestAccessDeniedHandler`);
  `GlobalExceptionHandler` maps bad credentials → 401, unconfigured Google → 503.

**Google sign-in kept (owner requirement):** `GoogleTokenVerifier` validates the Google ID token
server-side (signature/issuer/audience/expiry) and `UserService.findOrCreateOAuthUser(...)`
provisions/links the user (provider `GOOGLE`, no password, email pre-verified). Frontend: when
`VITE_API_BASE_URL` is set, `authApi.loginWithGoogle` exchanges the GIS credential at
`/auth/google` for a platform JWT (stored as `StorageKey.AuthToken`); otherwise it **falls back**
to the previous client-side ID-token decode, so the static GH-Pages build keeps working with no
backend (zero-risk to the live app).

**Schema:** Flyway **V2** (`V2__auth_provider.sql`) adds `users.avatar_url` and
`users.auth_provider` (`LOCAL`/`GOOGLE`, CHECK-constrained); `password_hash` stays nullable.

**Verified end-to-end** (dockerized Postgres, dev profile): register → 201 + JWT; `/auth/me`
401 without token, 200 with; login wrong password → 401, correct → 200; invalid body → 400 with
field details; duplicate email → 400; `/auth/google` → 503 (client id unconfigured locally);
`/meta`, `/v3/api-docs`, Swagger UI → 200; Flyway applied **V2**. `mvn test` green (11 tests:
+`JwtServiceTest`, +OAuth cases in `UserServiceImplTest`). `npm run build` green (tsc + vite + PWA).

**Files:** backend `auth/**` (controller, service+impl, `JwtService`, `JwtAuthenticationFilter`,
`AppUserDetails(+Service)`, `GoogleTokenVerifier`, entry-point/denied handlers, `dto/**`),
`user/AuthProvider.java` + `User`/`UserService(+Impl)` additions, `SecurityConfig` lockdown,
`OpenApiConfig` bearer scheme, `MuscleMapProperties` (jwt+oauth), `application{,-dev,-prod}.yml`,
`db/migration/V2__auth_provider.sql`, deps `jjwt` + `google-api-client` in `pom.xml`. Frontend
`features/auth/authApi.ts` (new), `googleIdentity.ts`/`AuthContext.tsx`/`auth.config.ts`/
`StorageKey.ts` updates.

**Next action:** EM3 — Premium Onboarding (persist `user_profiles`, gated behind auth).

## EM1 — Backend Foundation (complete, 2026-06-20)
**State:** A real Spring Boot 3 backend exists in `/backend`, boots against PostgreSQL,
applies its Flyway schema, and serves a versioned REST API + Swagger. Verified
end-to-end: `mvn test` green (5 unit tests), app boots on the dockerized Postgres,
Flyway created all 7 tables + history, `GET /api/v1/meta` and `/actuator/health` return 200,
`/v3/api-docs` (Swagger) returns 200.

This is the first milestone of the **PFA Evolution Sprint** (see ROADMAP → "PFA Evolution
Sprint"). Backend stack confirmed with the owner: **Spring Boot 3** (not the older
Supabase plan), monorepo `/backend`, deploy on **Render**, extensible to Docker/ACR/AKS.

**Architecture (Clean / SOLID, Controller → Service → Repository):**
- Package-by-feature under `com.musclemap`: `user`, `workout`, `coach`, `subscription`,
  `meta`, plus `common` (BaseEntity, ApiError, GlobalExceptionHandler, ResourceNotFoundException)
  and `config` (SecurityConfig, OpenApiConfig, MuscleMapProperties).
- **Flyway is the single source of truth** for the schema; `hibernate.ddl-auto=none`
  (Hibernate never alters the DB). Enum columns are `VARCHAR` + `CHECK` kept in lockstep
  with Java enums (`Role`, `Gender`, `FitnessLevel`, `TrainingGoal`, `SplitType`,
  `SessionStatus`, `SubscriptionPlan`, `SubscriptionStatus`).
- UUID PKs + audit timestamps via `BaseEntity`. No magic strings: API base path, CORS
  origins and app metadata bound through `MuscleMapProperties` (`@ConfigurationProperties`).

**Schema (`V1__init_schema.sql`):** `users`, `user_profiles`, `generated_programs`,
`workout_sessions`, `workout_exercises`, `coach_videos`, `subscriptions` — UUID PKs, FKs
with sensible cascade rules, indexes, and CHECK constraints for all enum columns.

**Roles:** USER / COACH / ADMIN (`com.musclemap.user.Role`), persisted on `users.role`.
Enforcement (Spring Security RBAC + JWT) is **EM2** — M1's `SecurityConfig` is deliberately
permissive/stateless so the foundation is browsable, but the `BCryptPasswordEncoder` bean and
`UserService.register(...)` (hashes passwords, normalizes email, rejects duplicates) are
already in place for EM2.

**Cross-cutting:** `GlobalExceptionHandler` (@RestControllerAdvice) → uniform `ApiError`
envelope; bean validation starter wired; Actuator health probes for Render; springdoc
Swagger UI at `/swagger-ui.html`.

**Containerization / deploy:** multi-stage `backend/Dockerfile` (Maven build → slim JRE,
non-root). `backend/docker-compose.yml` runs Postgres on host **5433** (avoids clashing
with a locally-installed Postgres on 5432) and, with `--profile full`, the API too.
`dev`/`prod` Spring profiles; prod reads all DB creds + CORS origins from env (no secrets in
git). Render steps documented in `backend/README.md`.

**Files added:** entire `backend/` module — `pom.xml`, `Dockerfile`, `.dockerignore`,
`.gitignore`, `docker-compose.yml`, `README.md`, `src/main/resources/{application.yml,
application-dev.yml,application-prod.yml,db/migration/V1__init_schema.sql}`,
`src/main/java/com/musclemap/**` (application, config, common, user, workout, coach,
subscription, meta), `src/test/java/.../UserServiceImplTest.java`.

**Risks / notes:**
- Local JDK is 18; the project targets Java 17 bytecode (`maven.compiler.release=17`) and
  the Docker build uses Temurin 17 — consistent everywhere.
- `workout_exercises` tracks set/rep/weight at the exercise level (aggregate). If EM6 needs
  per-set rows, add a `workout_sets` table via a new Flyway migration (don't edit V1).
- Frontend is NOT yet wired to the backend (still 100% static). EM2 introduces the first
  real API integration (auth). The repository/interface seam on the frontend is where a
  future `ApiExerciseRepository` would plug in.

**Next action:** EM2 — Authentication & Security (JWT, RBAC, lock down `SecurityConfig`,
`/auth/register|login|logout`, frontend auth client + protected routes).

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

## Round 4: 3D-only, explicit auth buttons, 260 videos (2026-06-11)
**State:** deployed. 3D is now the only muscle visualisation; auth has labeled
sign-in / sign-out buttons; 260 exercises have curated form-guide videos.

- **Removed all 2D displays.** Deleted `BodyDiagram`, `MuscleMapBoard`,
  `geometry/bodyGeometry` (+ its test), `BodyView` enum, `bodyView` labels and
  the `view2dLabel`/`view3dLabel` i18n keys. `MuscleMapPage` and
  `ExerciseDetailPage` render the head-split 3D model directly (Skeleton as the
  Suspense fallback); `muscleMap.config.ts` keeps only the `model3d` palette.
- **Explicit login/logout buttons.** The GIS button is now the labeled
  `type:'standard'` pill ("Sign in with Google", localised by GIS). Signed-in
  shows avatar + a round logout icon button; the profile dropdown keeps a
  labeled sign-out. `LanguageSwitcher` compacted (shows the language code
  closed, full names in the dropdown) so everything fits a 390 px top bar.
- **Fixed `.env.local` BOM bug:** the PowerShell-written file had a UTF-8 BOM,
  which corrupted the first dotenv key — locally auth was silently disabled
  (CI was unaffected: it injects the repo variable). Rewritten BOM-less.
- **Video coverage 160 → 260 exercises** (192 distinct shorts). New dev tool
  `scripts/match-shorts.mjs` scores harvested titles (EN + FR vocabulary)
  against unmapped exercise names → `scripts/match-suggestions.txt`; every
  added row was hand-reviewed (same-movement matches only; false positives
  like "Muscle Up" ≠ push-up rejected). Existing test validates all keys/ids.
- Tests 71/71 (4 removed with the 2D geometry), lint + tsc green.

## Round 5: 100% video coverage - 873/873 exercises (2026-06-11)
**State:** deployed. Every exercise in the catalog now has a curated, embeddable
YouTube form-guide video (799 distinct videos); the two-frame demo remains the
alternative tab.

How it was done (all dev tooling lives in scripts/):
- `harvest-channel.mjs` - generalised channel harvester (shorts AND /videos
  tabs): Bodybuilding.com (2663), ScottHermanFitness (1869), MuscleWiki (75).
- `match-videos.mjs` - multi-source title matcher (exact normalized-name
  stage + fuzzy stage, FR+EN vocab). Channels alone covered only ~150 of the
  613 then-unmapped, because BB.com's classic exercise-database uploads are
  unlisted (site-embedded only) and invisible on the channel page.
- `search-videos.mjs` - the breakthrough: one YouTube search per unmapped
  exercise (608 searches, resumable JSONL), top-10 results scored against the
  exercise name. Full-coverage matches auto-accepted after a manual scan of
  all 543 (15 rejected: e.g. Crucifix->stretch video, Body-Up->generic
  workout); 31 of 41 weaker ones accepted by hand. Search surfaces the
  unlisted official BB.com guides ("... Exercise Videos & Guides
  Bodybuilding com" titles), which are ideal exact matches.
- `search-stragglers.mjs` - 23 final exercises re-searched with hand-written
  queries (e.g. Car Drivers -> "Plate Driver Rotation"); all picked by hand.
- `check-embeddable.mjs` - all 799 distinct ids verified embeddable via
  YouTube oEmbed (0 failures), so no dead iframes in the app.
- Tests updated: normalizer/repository fixtures assumed a no-video exercise;
  now assert video-first media (id format) + CDN images. 71/71 green.
