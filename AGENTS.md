# Agent Guide

## Purpose

Build an English-language portfolio presenting its owner as a software engineer focused on interaction, art, and software development. The primary goal is to help secure a new job by demonstrating creativity and engineering skills to prospective employers. Freelance clients are a secondary audience.

## Collaboration and Approval

- Work in small, meaningful steps. Briefly report what changed, why, how it was verified, and any limitations. Stop for the owner's review before starting the next step.
- Support the owner's implementation and learning. Explain meaningful decisions and unfamiliar Three.js concepts briefly; basic JavaScript and React code does not need explanation.
- Handle routine implementation choices independently within the approved step.
- Obtain approval before major architecture changes, significant dependencies, paid services, publishing, or changing agreed product behavior.
- Do not treat an unresolved decision as permission to invent a requirement.

## Context and Scope Efficiency

- Use targeted file and text searches; inspect only files relevant to the current step. Broaden searches when the evidence requires it.
- Keep changes focused on the approved step. Avoid unrelated refactoring, speculative abstractions, and empty scaffolding.
- Avoid repeating explanations or rereading unchanged material. Briefly explain new decisions and retain established context.
- Preserve all required checks and regression protection. Efficiency must not reduce verification; report checks that could not be performed.

## Agreed Stack

- Vite, React, TypeScript, Three.js, and React Three Fiber.
- npm for package management; commit and maintain its lockfile.
- Node.js for development tooling. A backend is not currently required.
- Enable strict TypeScript checking.
- Store content in local repository files initially.
- Additional languages, remote file storage, hosting, and any CMS are future decisions.

## Product Requirements

- The main experience is a navigable 3D space containing Projects, About, and Contact destinations.
- Mouse interaction rotates the camera. Clicking a destination smoothly moves the camera toward it.
- Support touch-based 3D navigation on phones and tablets.
- Provide a direct navigation menu. Menu selections smoothly move the camera to the corresponding destination, preserving continuity rather than cutting abruptly.
- Opening a project transitions to a 2D detail page with its own shareable URL, such as `/projects/project-name`.
- Returning from a project restores the previous 3D camera position.
- If the 3D experience cannot load, offer a minimal HTML fallback containing projects, about information, and contact details. Reuse the same content and project pages.
- Contact displays contact information and professional links; no message form is required.
- All public-facing content is in English for the initial version.

## Visual Direction

The approved direction is Between Frames: surreal nostalgia, analog sci-fi, and spatial anti-design. Before visual or scene work, read [BETWEEN_FRAMES_CONTEXT.md](BETWEEN_FRAMES_CONTEXT.md) for the opening sequence, materials, project presentation, approved decisions, and open questions. Keep that file as the single creative context source. Preserve the existing stack and product requirements; GSAP, shaders, and GLSL are options when needed, not required additions. Do not generate new reference images or reopen approved decisions unnecessarily. Local references are in references/; the owner-provided composition image is references/between-frames-composition.png. The preferred storyboard has not been verified as a local asset. Do not invent personal information, project claims, or contact details.

## Proposed Source Structure

Create directories as needed rather than adding empty scaffolding:

```text
src/
  app/                 # App setup, routing, and global styles
  features/
    world/             # 3D scene, camera controls, and navigation
    projects/          # Project presentation and 2D detail pages
    about/             # About presentation
    contact/           # Contact presentation
  components/          # Shared HTML UI components
  content/             # Typed local project and personal content
  assets/              # Assets imported by application code
public/                # Directly served files, including suitable 3D assets
```

Organizing by feature keeps scene behavior together and allows project pages to evolve independently. Shared content supports both the 3D experience and HTML fallback.

## Code Conventions

- Use PascalCase for React components and camelCase for functions and variables.
- Keep components and modules focused on clear responsibilities.
- Keep content separate from presentation and use TypeScript types to define its shape.
- Introduce reusable abstractions when actual needs justify them.
- Use automated formatting and linting. Select their tools during setup and record the actual commands below.
- Follow existing project patterns as the codebase develops.

## Verification and Regression Protection

- Require automated tests for important behavior and bug fixes. Test observable behavior rather than duplicating implementation details.
- Protect agreed navigation, camera restoration, shareable project URLs, and fallback access with appropriate tests as these features are implemented.
- Do not weaken or delete tests merely to make a change pass. Obtain approval before changing an agreed behavior, then update the corresponding tests.
- For relevant code changes, run TypeScript checks, linting, the affected automated tests, and a production build before requesting review.
- When navigation behavior changes, manually verify desktop navigation, touch navigation, and camera restoration where supported by the available environment.
- Review visual quality and navigation feel manually. Automated tests do not replace this review.
- Report checks that failed or could not be performed; do not claim unperformed checks passed.

## Development Commands

Dependencies are installed and `package-lock.json` is present. Lockfile consistency was verified on 2026-10-17. Linting, strict TypeScript checking, all 22 automated tests, and the production build passed on 2026-10-18. Repository-wide formatting still reports existing code/configuration issues; see README for details. Formatting uses Prettier; linting uses ESLint with TypeScript and React Hooks rules; automated tests use Vitest and React Testing Library in jsdom.

- Installation: `npm ci` using `package-lock.json`. Keep the lockfile alongside the manifest in version control.
- Development: `npm run dev`; production preview: `npm run preview`.
- Formatting: `npm run format`; verification: `npm run format:check`.
- Linting: `npm run lint`; strict TypeScript checking: `npm run typecheck`.
- Automated tests: `npm test`; watch mode: `npm run test:watch`.
- Production build: `npm run build` (includes TypeScript checking).

See README for setup instructions, verification results, and remaining review items. Git was initialized on 2026-10-18 to preserve the approved opening blockout. Keep the manifest and lockfile versioned together; generated build/dependency files and temporary outputs/work folders are ignored.

## Maintaining This Guide

Update this file when approved decisions or working commands change. Keep it concise and accurate. Use the README for human-facing setup and project documentation, and a design guide for detailed visual rules.
