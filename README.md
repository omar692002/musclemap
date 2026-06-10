# MuscleMap 💪

A mobile-first fitness PWA that shows **exactly which muscles every exercise trains** —
down to the individual muscle head on a rotatable 3D anatomy model — and generates
**balanced, non-redundant workout programs**.

**Live demo:** https://omar692002.github.io/musclemap/

## Features

- **Workout-first home** — one-tap quick sessions (Chest & Triceps, Back & Biceps,
  Shoulders & Core, Legs, Cardio) with warm-up checklist and seeded "Shuffle".
- **873-exercise catalog** — search + muscle-group / equipment filters, animated
  two-frame demos (start → end position) on every card, curated video form guides.
- **Interactive body map** — rotatable 3D anatomy model (BodyParts3D / Z-Anatomy,
  CC BY-SA) split into 23 muscle heads; tap a head to see the exercises that train it.
  2D SVG fallback included.
- **Program generator** — split (Full body / Upper-Lower / PPL / Body-part),
  days per week, training goal (strength / hypertrophy / endurance) and available
  equipment → a balanced week with effective-set volume per muscle group.
- **i18n** — English, French, Arabic (full RTL).
- **PWA** — installable, offline-capable (the 3D model is runtime-cached).

## Stack

React 19 · TypeScript (strict, OOP/SOLID, repository interfaces) · Vite · Tailwind CSS v4
· react-three-fiber · vite-plugin-pwa. Exercise data: [free-exercise-db](https://github.com/yuhonas/free-exercise-db).

## Develop

```powershell
npm install
npm run dev      # local dev server
npm run test     # vitest (75 tests)
npm run lint     # eslint
npm run build    # tsc + vite + PWA
```

## Deploy

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds with
`BASE_PATH=/musclemap/` and publishes `dist/` to GitHub Pages (SPA fallback via `404.html`).
