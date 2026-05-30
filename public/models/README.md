# 3D models

## muscles.glb
Realistic muscular-system model used by the interactive 3D muscle map
(`features/muscle-map/three/AnatomyModel.tsx`).

- **Source:** BodyParts3D (The Database Center for Life Science) / Z-Anatomy.
- **Licence:** Creative Commons **CC BY-SA** — attribution + share-alike.
  Attribution is shown in-app under the 3D view (`AnatomyModelConfig.attribution`).
- **Note for the commercial tier:** CC BY-SA is copyleft. Before any paid release,
  replace this with a model under a commercial-friendly licence (or the coach's own
  assets). The mesh → muscle mapping (`anatomyMuscleMap.ts`) is model-agnostic and can
  be re-pointed at the replacement.

The file is **not precached** by the service worker (it is large); it is runtime-cached
on first view (see `vite.config.ts` → workbox `runtimeCaching`).
