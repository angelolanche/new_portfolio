# Between Frames

English-language interactive portfolio built with Vite, React, strict TypeScript, Three.js and React Three Fiber. The approved room, water animation, color dither, signal universe, navigation, project/About URLs, camera restoration and HTML content access are implemented.

The exterior uses a local NASA/JPL-Caltech black-hole video on a distant curved backdrop, with photographic color outside the room's dither treatment. Scene suspension during dialogs and reduced motion are supported; media sources and credits are in [CREDITS.md](public/media/exterior/CREDITS.md).

Current scope is closed as of 2026-10-27. No implementation tasks or files are awaiting changes. Preserve the implemented state; product references and verification limits below do not constitute an active backlog. Further changes start from a new request.

## Development

Use Node.js and npm. Install with `npm ci`, then run `npm run dev`. On Windows PowerShell with script execution disabled, use `npm.cmd` instead of `npm`.

| Command                                      | Purpose                                                               |
| -------------------------------------------- | --------------------------------------------------------------------- |
| `npm run dev`                                | Local development server                                              |
| `npm run --silent validate:ai`               | Tests, lint, strict TypeScript and production build; stops on failure |
| `npm run --silent test:ai -- -- <test-path>` | Focused regression checks                                             |
| `npm run build` / `npm run preview`          | Production build / local preview                                      |
| `npx prettier --write <changed-files>`       | Format only edited files                                              |

Compact checks overwrite `.logs/<check>.log`. Standard scripts and watch mode remain in `package.json`. Keep `package-lock.json` consistent with any dependency changes.

## Current experience

Run `npm run dev` to view the opening. At 11.4 seconds, the signal universe takes over the viewport, followed by a 2.2-second entry glide. The title uses the supplied video reference. Desktop wheel and keyboard controls navigate between works; mouse inspection and keyboard free flight remain available. On phones, circular buttons guide travel while touch dragging looks around the room and signal, easing back to center when released. Work index and About provide HTML access, and project URLs support browser back/forward with navigation-state restoration. The scene runs automatically without pause/replay shortcuts; reduced-motion visitors start inside the signal. Creative details are maintained in BETWEEN_FRAMES_CONTEXT.md; the current source map is in docs/architecture.md.

## Where to edit

- [Architecture and source map](docs/architecture.md): start here to find the relevant component without reading the whole scene.
- [Creative context](BETWEEN_FRAMES_CONTEXT.md): approved composition, camera, water, dither and TV behavior.
- [Cup and water guide](src/features/world/cup-spill/README.md): simulation, meshes, materials and settings.
- [Product requirements](docs/product-requirements.md): product direction and behavior reference.
- [Agent guide](AGENTS.md), [efficient workflow](docs/token-efficiency.md) and [handoff template](docs/templates/handoff.md).
- [Historical setup and blockout notes](docs/history/setup-and-blockout.md): superseded iterations and historical checks.

## Review and verification

The maintenance/performance revision keeps the approved geometry, materials, resolution, camera timings and presets. It separates the HTML shell from the deferred 3D bundle, avoids rendering the covered room after TV entry, reuses camera calculations, preserves indexed static geometry and tightens hidden-particle filtering. No dependencies were added.

Latest automated verification after the source reorganization: `npm.cmd run --silent validate:ai` passed all 183 tests across 37 suites, lint, strict TypeScript and Vite build. The signal universe lives in `src/features/world/signal-world/`; Opening input and regression suites are separated by responsibility. No dependencies were added.

Automated verification does not establish graphical equivalence or device performance. The latest reorganization was not manually reviewed in a browser; real-device touch, FPS and loading measurements are not established. These are verification limits, not open tasks. See [architecture](docs/architecture.md#performance-contract) for the invariants.
