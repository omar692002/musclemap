# Data Model

## Muscle taxonomy (target — fully populated in M1)
A four-level hierarchy:
```
Region  ->  Muscle group        ->  Muscle             ->  Muscle head
(Upper)     (Shoulders)             (Deltoid)               {anterior, lateral, posterior}
```
- **MuscleGroup** (enum) is the stable, UI-facing browsing grouping (`src/domain/enums/MuscleGroup.ts`).
- **Muscle** (entity) carries an optional `head` for head-level granularity
  (e.g. the 3 deltoid heads, biceps/triceps heads). Populated in M1.

## Entities (current — M1)
- **Muscle** — `{ id: MuscleId, name, group: MuscleGroup, head? }`
- **MuscleInvolvement** — `{ muscleId, role: MuscleRole, contribution? }`
  - `role` is a `MuscleRole` = `Primary | Secondary | Stabilizer`.
  - `contribution` (0..1) feeds weekly-volume math; defaulted by role in M1
    (`ROLE_DEFAULT_CONTRIBUTION`: Primary 1, Secondary 0.5, Stabilizer 0.25).
- **Exercise** — `{ id, name, muscles, category, level, equipment?, mechanic?, force?, instructions, images }`
  - `category`/`level` always present; `equipment`/`mechanic`/`force` optional (null in source).
  - `images` are resolved absolute CDN URLs (not bundled).

## Enums (M1)
- `MuscleRole` — Primary / Secondary / Stabilizer.
- `MuscleId` — 17 muscle ids (the authored taxonomy keys).
- `MuscleGroup` — Chest, Back, Shoulders, Biceps, Triceps, Forearms, Core,
  Quadriceps, Hamstrings, Glutes, Calves, Neck, **Adductors, Abductors**.
- `Equipment`, `ExerciseMechanic`, `ExerciseForce`, `ExerciseCategory`, `ExerciseLevel`
  — canonical exercise-attribute vocabularies.
- `StorageKey` — namespaced client-persistence keys.

## Source mapping (`data/static/`)
Source vocabulary types live in `source/sourceSchema.ts` (`RawExercise` + string unions).
`mapping/sourceMuscleMap.ts` holds the translation tables (the *only* place raw strings are
interpreted): `SOURCE_MUSCLE_TO_ID` + `SOURCE_*_TO_ENUM`. The taxonomy integrity test asserts
every source muscle resolves to a real `Muscle`.

## Source muscle -> taxonomy (17)
`chest`->pectoralis-major · `lats`->latissimus-dorsi · `traps`->trapezius ·
`middle back`->rhomboids · `lower back`->erector-spinae · `shoulders`->deltoid ·
`biceps`->biceps-brachii · `triceps`->triceps-brachii · `forearms`->forearms ·
`abdominals`->rectus-abdominis · `quadriceps`->quadriceps · `hamstrings`->hamstrings ·
`glutes`->gluteus · `calves`->calves · `neck`->neck · `abductors`->hip-abductors ·
`adductors`->hip-adductors.

## Done in M1
- Imported **`yuhonas/free-exercise-db`** (873 exercises, bundled JSON).
- Normalised into our entities via `ExerciseNormalizer`; loaded through `StaticExerciseRepository`
  (and `StaticMuscleRepository`) behind their interfaces — later mirror into Supabase unchanged.

## Deferred to a later curation pass (our value-add)
- **Head-level** detail (deltoid/triceps/biceps heads, etc.) — source is group-level.
- **Stabilizer** involvements — not present in source; not fabricated.
