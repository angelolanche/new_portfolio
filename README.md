# Between Frames

English-language interactive portfolio built with Vite, React, strict TypeScript, Three.js and React Three Fiber. The approved room, water animation, color dither and TV static universe are implemented. Full portfolio navigation, project URLs, camera restoration and complete HTML content remain future work.

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

Run `npm run dev` to view the opening. The table trembles about 2.2 seconds after the camera starts. At 14.5 seconds, the TV fills the viewport and its scene takes over, followed by a six-second glide into the static universe. ANGELOAOSOL is visible in 3D before entry; its 5x-speed flick cycles through black, red and blue with equal 0.38-second phases. The background has no visible walls or seams. Mouse/trackpad look smoothly returns after entry. Pause/Play, Replay, and reduced-motion behavior remain available; full touch navigation remains unimplemented. The owner approved this state on 2026-10-26; creative details are maintained in BETWEEN_FRAMES_CONTEXT.md.

## Where to edit

- [Architecture and source map](docs/architecture.md): start here to find the relevant component without reading the whole scene.
- [Creative context](BETWEEN_FRAMES_CONTEXT.md): approved composition, camera, water, dither and TV behavior.
- [Cup and water guide](src/features/world/cup-spill/README.md): simulation, meshes, materials and settings.
- [Product requirements](docs/product-requirements.md): future navigation, content and HTML fallback requirements.
- [Agent guide](AGENTS.md), [efficient workflow](docs/token-efficiency.md) and [handoff template](docs/templates/handoff.md).
- [Historical setup and blockout notes](docs/history/setup-and-blockout.md): superseded iterations and historical checks.

## Review and verification

The maintenance/performance revision keeps the approved geometry, materials, resolution, camera timings and presets. It separates the HTML shell from the deferred 3D bundle, avoids rendering the covered room after TV entry, reuses camera calculations, preserves indexed static geometry and tightens hidden-particle filtering. No dependencies were added.

Verification on 2026-10-26: `npm.cmd run --silent validate:ai` passed all 95 tests, lint, strict TypeScript and Vite build. Initial JavaScript changed from 1,256.15 kB to 223.77 kB, with 1,034.63 kB deferred to the 3D chunk (minified, before gzip). Total JavaScript is essentially unchanged; Vite still warns about the large 3D chunk. A structural comparison of the extracted scene JSX preserved every original element, attribute and child expression.

Automated verification does not establish graphical equivalence or device performance. Visual review, touch testing and FPS/loading measurements on real devices remain pending: Computer Use could not reliably identify the Chrome URL and ended browser access during this session. See [architecture](docs/architecture.md#performance-contract) for the invariants and remaining limits.
