# Agent Guide

Build the English-language Between Frames portfolio using Vite, React, strict TypeScript, Three.js, React Three Fiber, and npm. Keep package-lock.json consistent with dependencies.

## Work and communication

- Hard limit: no work stage may exceed 10 minutes of wall-clock time. Track elapsed time from the start, including investigation, tools, implementation and verification. Keep scope small enough to finish within that limit; do not reset the clock by silently splitting one request into more stages. Prioritize token efficiency and demonstrated benefit over exhaustive exploration. Avoid optional experiments and repeated measurements. If the limit approaches, stop expanding scope, preserve a safe and reviewable state, and report completed work, verification actually performed and remaining limitations. Never claim completion or passing checks without evidence. Continuing beyond the limit requires explicit user authorization; do not continue automatically.
- Complete the requested scope autonomously in meaningful steps. Pause for unresolved product decisions, major architecture changes, significant dependencies, paid services, publishing, or destructive actions unless already authorized.
- Preserve existing user changes. Inspect Git status before editing; keep changes scoped and avoid unrelated refactoring or empty scaffolding.
- Keep progress and final reports concise: outcome, meaningful decisions, verification, and limitations. Explain unfamiliar Three.js concepts when useful. Token estimates and account-usage reports are optional, only on request.
- Use current files as evidence. Search likely paths first, read relevant sections, and broaden when needed. Avoid full dependency/generated-file inventories, repeated unchanged reads, and dumping logs.
- For routine work, implement directly without a separate planning or approval turn. Preserve all verification and regression protection.

## Read on demand

- Product or navigation behavior: [product requirements](docs/product-requirements.md).
- Structure or conventions: [architecture](docs/architecture.md).
- Read `Opening.tsx` only for HTML composition, dialogs or project/About URLs. For input, start in `opening/useOpeningControls.ts` (keyboard/wheel) or `opening/useOpeningPointer.ts` (mouse/touch). Read only the relevant `opening/tests/Opening.<behavior>.test.tsx`; see the architecture source map before opening large scene/test files.
- Visual or scene work: relevant sections of [creative context](BETWEEN_FRAMES_CONTEXT.md). Search headings first; preserve the consolidated approved state unless the user requests a change.
- Setup and historical results: [README](README.md).
- Workflow optimization: [best practices](docs/token-efficiency.md); cross-chat continuation: [handoff template](docs/templates/handoff.md).

Do not load every reference by default. Update decisions in place in the authoritative document instead of appending repeated revision histories; retain superseded decisions only when they prevent likely regressions. Save text as UTF-8. Never invent personal information, project claims, or contact details.

## Verification

- Test important behavior and bug fixes through observable outcomes. Protect smooth navigation, camera restoration, shareable project URLs, and HTML fallback. Do not weaken tests to make changes pass.
- During iteration use affected checks; before handing off relevant code changes run `npm run --silent validate:ai` (tests, lint, typecheck, Vite build; stops on first failure). Report failures and unperformed checks accurately.
- Individual compact checks: `npm run --silent test:ai`, `lint:ai`, `typecheck:ai`, `build:ai`. The last runs Vite only. Logs overwrite `.logs/<check>.log`; inspect specific sections only when needed. Forward arguments with `-- -- <arguments>`.
- For navigation changes manually verify desktop, touch, and restoration where supported. Review visual work manually; automated tests do not replace visual review.
- Standard developer commands remain available: `npm ci`, `npm run dev`, `npm run preview`, `npm test`, `npm run test:watch`, `npm run lint`, `npm run typecheck`, `npm run build` (includes typecheck), `npm run format`, `npm run format:check`. Format only changed files unless a broader formatting task is requested.

Keep this guide short. Put detailed workflows, examples, and history in references read on demand.
