# Architecture and conventions

Use Vite, React, strict TypeScript, Three.js, React Three Fiber, and Node.js tooling. Use npm and maintain package-lock.json with dependency changes. Store content locally; a backend, CMS, remote storage, and additional languages are future decisions. GSAP, shaders, and GLSL are options when justified, not required additions.

Organize by feature and create directories only when needed:

```text
src/app/                 App setup, routing, global styles
src/features/world/      3D scene, camera, navigation
src/features/projects/   Project presentation and detail pages
src/features/about/      About presentation
src/features/contact/    Contact presentation
src/components/          Shared HTML components
src/content/             Typed shared content
src/assets/              Imported assets
public/                  Directly served assets
```

Share content between the 3D experience and HTML fallback. Keep content separate from presentation and define its shape with TypeScript types. Use PascalCase for React components and camelCase for functions and variables. Keep modules focused; add abstractions when actual needs justify them. Follow existing patterns and use the configured Prettier and ESLint tools.

## World source map

Read the module for the requested behavior first. `Opening.tsx` is the HTML entry point, not the scene implementation. World filenames below are relative to `src/features/world/`.

| Area                                           | Start here                                             | Related modules when needed                                                        |
| ---------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Loading, playback buttons, pointer input       | `Opening.tsx`                                          | `opening/SceneBoundary.tsx`                                                        |
| Canvas configuration and rendering composition | `opening/OpeningCanvas.tsx`                            | `ColorDither.tsx`, `TelevisionStatic.tsx`                                          |
| Camera trajectory and lens                     | `cameraPath.ts`                                        | `opening/CameraMove.tsx`, `cameraLook.ts`                                          |
| Scene assembly                                 | `room/Room.tsx`                                        | The focused room components below                                                  |
| Walls, ceiling, door/window openings           | `room/RoomShell.tsx`, `room/RoomOpenings.tsx`          | `sceneLayout.ts`                                                                   |
| Sofa, armchair, woven chair                    | `room/Seating.tsx`                                     | `Upholstery.tsx`, `DrapedJacket.tsx`                                               |
| Television cabinet and shelf objects           | `room/TelevisionCabinet.tsx`, `room/WallUnitUpper.tsx` | `ShelfKeepsakes.tsx`, `TelevisionHardware.tsx`                                     |
| Moving table, phone, notebook, lamp            | `room/AnimatedTable.tsx`                               | `TabletopDetails.tsx`, `RoomFinishDetails.tsx`                                     |
| Fixture animation and room lighting            | `room/CeilingFixture.tsx`, `room/RoomLighting.tsx`     | `fixtureMotion.ts`, `fixtureLight.ts`, `FixtureDetails.tsx`                        |
| Rug, room decorations and side table           | `room/RoomDetails.tsx`                                 | `LivedInDetails.tsx`, `RoomBotanicalDetails.tsx`                                   |
| Shared surfaces and geometry                   | `RoomSurfaces.tsx`, `FinishedBox.tsx`                  | `finishedGeometry.ts`, `StaticRoom.tsx`, `staticRoomBatch.ts`                      |
| Exterior sky, porch, planet and rings          | `WindowSpace.tsx`, `FantasySpace.tsx`                  | `EntryPorch.tsx`, `exteriorLayout.ts`, `exteriorVisibility.ts`, `ringParticles.ts` |
| Dither settings / shader                       | `ditherSettings.ts` / `shaders/colorDitherShader.ts`   | `ColorDither.tsx` manages the passes                                               |
| CRT signal and TV world                        | `TelevisionStatic.tsx`                                 | `televisionSnow.ts`, `televisionWorld.ts`                                          |
| Cup and water                                  | `cup-spill/README.md`                                  | Focused simulation and mesh modules                                                |

Keep measurements in `sceneLayout.ts` and presets in their existing settings modules. Avoid duplicating values in documentation. Keep tests beside behavior; do not reorganize every file merely to create matching directories.

## Performance contract

- The HTML entry loads independently of `opening/OpeningCanvas.tsx`. Lazy loading makes the shell available sooner; it does not eliminate the cost of downloading, constructing or compiling the 3D scene.
- `CameraMove` runs at frame priority -1, then room animations update, then `ColorDither` renders at priority 1, then `TelevisionStatic` composes the CRT at priority 2. At 14.5 seconds, the TV renderer owns the viewport and room post-processing is skipped. Replay restores the room render path.
- The room remains mounted for Replay. Its materials receive a stable context value and its memoized composition does not rebuild on playback button changes. Geometry and shader quality are unchanged.
- Camera curve constants are computed per viewport aspect. Cached poses still restore the base orientation every frame before pointer damping, including while paused and inside the TV.
- Room-only animation work stops when covered by the TV. Water uses the same fixed-step deterministic simulation and resets through a backwards seek on Replay.
- Static batching collects compatible meshes before allocating clones, preserves indexed geometry and excludes hidden subtrees. Animated furniture, water, glass and lights stay outside the static batch. Cleanup restores sources and disposes merged geometry.
- Ring filtering projects two conservative camera volumes through expanded apertures. Any trajectory/layout change must rerun `ringParticles.test.ts`; preserve its independent ray checks across landscape, portrait and extreme aspect ratios. Do not reduce particle counts to hide a failing culling test.
- Preserve pixel ratio, segment counts, procedural textures, shadows, reflections, water materials, dither, signal cadence and all approved timings. The continuous render loop remains necessary for the live TV signal and damped pointer look; Pause freezes animation time while allowing look interaction.

Regression checks cover camera continuity/framing, Replay, paused look, render handoff, geometry bounds/cleanup, exterior visibility and deterministic water. Real-device FPS, cold/warm loading time, GPU memory and visual equivalence require browser/device measurements; bundle size alone is not a loading-time measurement. Full touch navigation, shareable project URLs, restoration from project pages and complete HTML portfolio fallback remain product work, not implemented by this refactor.

Test isolation stays enabled. Pure geometry/simulation tests use Node; React UI tests explicitly select jsdom with `@vitest-environment jsdom`. Four concurrent workers avoid competing DOM environments starving physics tests; timeouts and assertions are unchanged. See the [Vitest environment guide](https://vitest.dev/guide/environment.html) and [R3F performance guidance](https://r3f.docs.pmnd.rs/advanced/scaling-performance) for the underlying APIs.
