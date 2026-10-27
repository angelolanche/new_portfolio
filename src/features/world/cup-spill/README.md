# Cup and water animation

Start with `GlassSpill.tsx`: it advances the shared simulation, updates the cup pose, then updates each water effect. The scene mounts it inside the moving table in `../room/AnimatedTable.tsx`. That parent applies the table jolt to every object together.

The physics from the owner export, `cup-spill-settings (2).json` (2026-10-21), remains in `spillSettings.ts`. The owner requested simpler water graphics and removal of detached visual droplets on 2026-10-27. The tuning GUI stays removed. Manual pause and Replay have been removed.

## Where to edit

| File                   | Responsibility                                                                 |
| ---------------------- | ------------------------------------------------------------------------------ |
| `spillSettings.ts`     | Timing, bump, bounce, slosh, water flow and water appearance                   |
| `spillMotion.ts`       | Cup tipping and table vibration; precomputed gravity-driven rotation           |
| `GlassSpill.tsx`       | Scene assembly, glass shape/material, animation lifecycle and resource cleanup |
| `WaterMaterial.tsx`    | Shared water color, transparency, refraction and roughness                     |
| `cupWaterVolume.ts`    | Inner cup dimensions and conversion between water volume and surface height    |
| `CupWaterGeometry.ts`  | Closed liquid mesh clipped against the water surface                           |
| `tableWater.ts`        | Water leaving the cup, flowing across the table and becoming droplets          |
| `waterGrid.ts`         | Table simulation grid dimensions, spacing and cell coordinates                 |
| `tabletopWaterMesh.ts` | Visible puddle surface; dry cells and obstacles are excluded                   |
| `pouringWaterMesh.ts`  | Stream connecting the cup opening to the table                                 |
| `edgeCascadeMesh.ts`   | Thin water sheet spilling over the table edge                                  |
| `dropletMotion.ts`     | Droplet data and gravity-driven trajectories                                   |
| `spillVisibility.ts`   | Conservative per-effect bounds for skipping invisible mesh updates             |

## Common edits

- Change `timing.impactAfterStart` to move the table bump earlier or later relative to the start of camera motion. `actionDuration` is the 10-second spill window after the bump; the camera follows its separate 11.4-second approach before entering the TV world.
- Change `motion.joltDistance` for the table shake; `initialAngularVelocity` and `secondAngularImpulse` control the cup's two reactions. Motion is sampled across the action window. If the cup does not reach contact, it keeps its sampled rocking motion instead of jumping to a tipped pose.
- Change `water.initialSurfaceHeight` for the initial fill. Keep it inside the cup's inner height. Change `outletArea` for how quickly water pours out.
- Edit `appearance` in `spillSettings.ts` for water color, opacity, transmission and roughness, plus glass opacity and roughness. `WaterMaterial.tsx` has additional material details. `ior` controls refraction, while `roughness` softens highlights. Vertex alpha hides thin/dry parts of the puddle and cascade.
- Cup position and table radius remain in `../room/sceneLayout.ts`. Use `cup.heightScale` and `cup.radiusScale` in `spillSettings.ts` to scale the glass, internal water and tipping calculation together. Large changes can exceed the table or camera framing; review those manually. Table-object obstacle bounds are in the `TableWaterSimulation` constructor.

Distances use meters, time uses seconds, angles use radians, volumes use cubic meters, and discharge rates use cubic meters per second. Positions for the spill are local to the table group; the cup's internal mesh uses cup-local coordinates. Reload after changing settings, because motion samples and initial water volume are computed when modules load.

## How it works

The reference-driven release has two phases: a brief outward splash around tipping, followed by a more cohesive main flow. `waterRelease.ts` shares the transient impulse between discharge, trajectories and meshes. Detached tips are no longer rendered.

The simulation advances in fixed 1/120-second steps. Rendering reads the simulation state without advancing a separate clock. The simulation advances only forward; no restart state or backwards-seek reset remains. The elapsed time comes from the existing opening controls, including reduced-motion handling.

The liquid inside the cup is clipped by a gravity-oriented plane: it does not rotate like a solid cylinder. On the table, each grid cell stores a shallow water depth. Neighboring cells exchange volume, with transfers limited to the water available. Solid obstacles block these exchanges. Escaping volume produces droplets with gravity-driven trajectories.

Three.js buffer geometries store vertex positions directly. Visible effects update those positions and recompute normals for lighting. `spillVisibility.ts` bounds each effect from the current simulation before mesh rebuilding, with a 5 cm margin and the real camera/table transform. It includes maximum sheet flight/ripples and current stream/cup motion. Physics continues while invisible. Reentering the view rebuilds current geometry, including at unchanged animation time. Owned geometries are disposed on unmount to release GPU memory.

This remains an approximate real-time effect, not a full 3D fluid solver. The edge sheet follows conserved rim emissions, not extra simulated water. Its width and length follow measured rim flow; deterministic folds and tears break the sheet into rivulets as flow diminishes. The puddle and thin flow use a transparent standard material with the room's baked reflection; cup liquid retains physical refraction. `OpeningCanvas` sets the transmission target to 75% linear resolution without reducing canvas DPR. Camera framing and the physics grid/step are unchanged.

## Verification

Run `npm run typecheck`, `npm run lint`, `npm test -- --maxWorkers=1`, and `npm run build` from the project root. Tests cover cup motion/contact, water conservation, dry obstacles, gravity, cadence independence, liquid geometry and the extracted renderers. Review the animation in the browser after visual edits; numeric tests do not establish visual quality or mobile performance.
