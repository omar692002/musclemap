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

## Entities (current)
- **Muscle** — `{ id, name, group: MuscleGroup, head? }`
- **MuscleInvolvement** — `{ muscleId, role: MuscleRole, contribution? }`
  - `role` is a `MuscleRole` = `Primary | Secondary | Stabilizer`.
  - `contribution` (0..1) feeds weekly-volume math in the program generator.
- **Exercise** — `{ id, name, muscles: MuscleInvolvement[] }`
  - Will gain `equipment`, `mechanic`, `media`, `instructions` in M1.

## Enums
- `MuscleRole` — Primary / Secondary / Stabilizer.
- `MuscleGroup` — Chest, Back, Shoulders, Biceps, Triceps, Forearms, Core,
  Quadriceps, Hamstrings, Glutes, Calves, Neck.
- `StorageKey` — namespaced client-persistence keys.

## Data source plan (M1)
- Import **`yuhonas/free-exercise-db`** (name, primary/secondary muscles, equipment,
  mechanic, instructions, images).
- **Normalise** into our entities; map their muscle names -> our `Muscle` ids and
  `MuscleGroup`; assign `MuscleRole` (their primary/secondary -> ours, infer stabilizers).
- Author the **head-level** detail (their data is group-level) — our value-add.
- Load via `StaticExerciseRepository`; later mirror into Supabase behind the same interface.
