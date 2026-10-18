# Interactive Portfolio

An English-language portfolio built with Vite, React, strict TypeScript, Three.js, and React Three Fiber. The approved Between Frames opening room blockout is implemented. The approved Between Frames visual direction is documented in [BETWEEN_FRAMES_CONTEXT.md](BETWEEN_FRAMES_CONTEXT.md); water animation, the droplet universe and portfolio navigation remain future steps.

## Development

Use Node.js 24 LTS and npm. Dependencies are installed and `package-lock.json` is present. Run `npm ci` for a reproducible installation, then `npm run dev` to start development.

The manifest currently uses `latest` tags; the lockfile records the resolved versions. Keep `package-lock.json` versioned alongside the manifest. Dependency version policy is a separate review decision; this documentation update does not change dependencies.

### Verification status (2026-10-17)

Verified with Node.js 24.17.0 and npm 11.13.0:

- Manifest dependency specifications match the lockfile; `npm ls --depth=0` reports a valid installed dependency tree.
- `npm ci --dry-run --ignore-scripts --offline --no-audit --no-fund` passes. This validates the installation plan without reinstalling dependencies; a clean installation was not performed.
- Linting, strict TypeScript checking, the existing automated test (1 test), and the production build pass.
- Repository-wide formatting still fails in `eslint.config.js`, `index.html`, `src/app/App.test.tsx`, and `tsconfig.json`. These existing issues are left for review because this step only updates setup documentation.
- The owner reports that the app runs. Browser/WebGL verification was not performed in this step.

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the development server                              |
| `npm run format`       | Format source and documentation with Prettier             |
| `npm run format:check` | Verify formatting without edits                           |
| `npm run lint`         | Run ESLint, TypeScript lint rules, and React Hooks checks |
| `npm run typecheck`    | Check TypeScript without emitting files                   |
| `npm test`             | Run automated tests once                                  |
| `npm run test:watch`   | Run tests in watch mode                                   |
| `npm run build`        | Check TypeScript and build to `dist/`                     |
| `npm run preview`      | Serve the production build locally                        |

Vitest and React Testing Library test observable HTML behavior in jsdom. This environment does not verify WebGL rendering, touch navigation, or camera feel. Browser verification and appropriate navigation tests will be added as those features are implemented.

Application setup lives in `src/app/`. Feature and content directories will be created when needed. See [AGENTS.md](AGENTS.md) for collaboration, product, and verification requirements.

## Opening blockout (2026-10-18)

Composition reference: `references/between-frames-composition.png`. Primitive room with cropped sofa/child's socks, CRT/antenna, tall wooden cabinet, VHS/tapes, rug, pictures, lamp, side window/curtains, plant, round table, rotary phone and glass. Camera and room measurements live in `src/features/world/`.

Current opening lasts 5 seconds. Initial camera position/direction are preserved; the final view tilts less downward and smoothly widens from 42° to 50° to retain the complete TV. Glass sits farther inside the tabletop: the future spill crosses the table and only a small amount falls toward the floor. No falling glass, flowing water or droplet universe is implemented. Pause/Play, Replay and reduced-motion pause remain available.

22 tests pass, protecting full TV/antenna framing, moderate final pitch, approved opening, reference layout, tabletop spill route in 21 samples across three aspect ratios, duration, continuity, final hold and HTML development status. Prior direct-fall/table-edge assertions were updated for the owner's changed narrative. Strict TypeScript, lint and build pass; the existing bundle-size warning remains. Visual review remains pending because the integrated browser could not reach the local server. Review at http://127.0.0.1:5173/.

Full portfolio fallback content, navigation and camera restoration remain future steps. No dependencies or images were generated in this blockout stage.

Phone-table detail revision: blank spiral notepad, pen and small warm lamp added beside/behind the phone. Approved camera, glass and room layout are unchanged; owner may revisit glass placement later.

Armchair placement tests additionally protect orientation toward the TV, passage to the phone table and unobstructed TV sightlines through the camera move. Armchair repositioned; camera and table remain unchanged.

Phone table diameter reduced from 2.10 m to 1.96 m. Added a foreground wooden chair with an open woven-cane back facing the table. Regression checks cover table separation and clear sightlines to the glass and TV; camera and glass placement remain unchanged.

Current table diameter: 1.64 m. Woven chair moved right and tucked about 10 cm beneath the tabletop, facing its center. Props and future spill envelope adjusted to the smaller surface. Chair test now protects the requested tuck and backrest clearance rather than a fully detached seat; camera remains unchanged.

TV furniture is now a nearly ceiling-height wooden wall unit with side shelves and porcelain ornaments. TV/camera positions are unchanged; VHS moved into a lower niche and the side lamp sits beside the unit. A regression test checks that structural panels do not block TV/antenna sightlines.

Current camera revision: previous final pose/lens is the new start. Over 5 seconds the camera moves toward the TV, descends and levels its view, ending with the glass large on the right (about half the landscape frame height). Portrait retains a wider view to preserve the TV. New trajectory tests replace old general-view framing assertions while retaining TV/antenna and occlusion checks, initial spill envelope, duration, continuity and final hold. No room objects changed; visual review remains pending.

Room compacted to 6.70 × 8.60 m (about 26% less floor area). Sofa moved 1.05 m toward the TV; wall-unit/right-wall gap reduced to about 0.94 m. Furniture and plants repositioned to fit. Initial camera pose is unchanged; final view turns farther left while keeping the glass on the right. Regression coverage includes room dimensions and furniture clearances.

Sofa moved back 20 cm. Added a closed wooden entry door on the left wall, partially visible in the landscape opening and naturally leaving frame on approach. Camera unchanged; door framing has a regression test.

Entry door moved 45 cm farther from the window and enlarged by 20% in width / 15% in height. Only its edge enters the opening frame; the rest of the approved scene is unchanged. Door regression checks cover scale, spacing and peripheral framing.

Left-wall revision: door moved farther behind the sofa toward the opening frame edge; window reduced 15% in width / 10% in height and moved 40 cm toward the back. Sill plant follows the window. Camera and other objects remain unchanged; framing/spacing regression checks pass.

## Version control

Git was initialized on 2026-10-18 for the approved opening blockout checkpoint. Source, local references, documentation and package-lock.json are included. node_modules, dist, coverage and temporary outputs/work folders are ignored. The current 22 tests, TypeScript, lint and production build passed during this stage. Repository-wide formatting still reports pre-existing issues in eslint.config.js, index.html, src/app/App.test.tsx and tsconfig.json. This checkpoint is local; no remote publishing is configured by this step.

The initial history is grouped by deliverable: validated Vite/React foundation, approved room/camera blockout with regression tests, then documentation and reference assets. Individual visual iterations were not versioned while they were made and are not presented as recovered historical snapshots. The foundation was verified independently (1 test, lint, TypeScript and build); the complete blockout passed all 22 tests and the same checks.
