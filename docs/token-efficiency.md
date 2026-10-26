# Efficient work with Codex

Reference this guide when planning work or adjusting the workflow; it is not required reading for every task.

## Write bounded requests

State the outcome, likely files, constraints, and acceptance checks. For a bug include a reproduction. Give enough detail to avoid retries; overly short prompts can cost more overall.

```text
Goal: Fix camera restoration when returning from a project.
Starting point: Current repository state and AGENTS.md.
Likely area: src/app and src/features/world.
Constraints: Preserve the approved camera path and styling.
Done when: Returning restores the previous transform; add a regression test.
Verification: npm run --silent validate:ai.
Complete this scope and report the result concisely.
```

## Manage context

- Use one chat per coherent feature or investigation. Start fresh at completed milestones or major topic changes; restarting after every small step repeats discovery.
- Prefer a short handoff over importing a long conversation. Forks retain history and should not be treated as fresh context.
- Keep durable truth in focused repository documents. Replace obsolete decisions at their source; preserve history separately when valuable.
- Treat current code, configuration, and verification as evidence. Historical test counts and chat claims are not current validation.
- Read relevant sections only. Search headings in large references, then read surrounding chronology when decisions conflict.
- Attach relevant screenshots, pages, and references, including enough surrounding information to interpret them correctly.
- Saying "ignore earlier messages" clarifies priority but does not itself remove those messages from context.

## Keep instructions and communication small

AGENTS.md holds cross-cutting rules and routes to references. Put historical results, examples, detailed explanations, and rare workflows in documents read on demand. Avoid duplicating requirements or creating many tiny documents that always need to be read together.

Keep updates and final results concise. Explain decisions, risks, failures, and unfamiliar concepts. Routine work can proceed without a separate planning turn or approval after every internal step. Preserve consequential approval boundaries.

Token estimates are optional approximations, not measured usage or guaranteed account savings. Ask for account usage only when needed; account-wide changes can include other chats. Context size, caching, output tokens, and subscription allowance are different measures.

## Inspect and verify efficiently

- Search likely paths first. Broaden as evidence requires. Avoid generated dependencies, builds, logs, and archives during routine exploration.
- Review diffs first for change reviews, then inspect surrounding code needed to assess behavior. Avoid repeated unchanged file reads and full directory/dependency inventories.
- During iteration run affected checks. Before handing off relevant code changes run all required validation; never reduce regression protection to save tokens.
- Use `npm run --silent validate:ai` for tests, lint, typecheck, and build. It stops at the first failure; fix it and rerun to cover remaining checks.
- Individual compact commands: `npm run --silent test:ai`, `npm run --silent lint:ai`, `npm run --silent typecheck:ai`, and `npm run --silent build:ai`.
- `build:ai` runs Vite only. `validate:ai` and standard `build` include TypeScript validation.
- Forward arguments with an extra separator: `npm run --silent test:ai -- -- src/features/world/cameraPath.test.ts`.
- Full emitted stdout/stderr is retained in `.logs/<check>.log`, overwriting that check's previous log. Passing-test console output suppressed by Vitest is not emitted and therefore is not in the log. Failures print at most 120 trailing lines and 16,000 characters; inspect relevant earlier log sections if needed.
- Use standard commands for watch mode or complete live output. Paste the command, relevant error, reproduction, and recent change instead of whole logs.
- Build further output filters only for concrete recurring needs, such as browser-test failures or bundle reports. Extra infrastructure has its own maintenance and context cost.

## Handoff and long features

Use [the handoff template](templates/handoff.md). Keep current state, decisions, evidence, remaining work, and relevant paths; omit the investigation transcript.

For a feature spanning chats, optionally maintain ignored `work/current-task.md` using the template. Update it at meaningful milestones and remove it after completion. Use a tracked issue or document when others need the handoff. No empty task file is required for completed work.

Keep related implementation, tests, and documentation together. Separate unrelated objectives into separate chats. Parallel agents may improve speed while increasing aggregate token consumption; use them for a justified need.

Compaction can reduce context while retaining useful state; exact behavior depends on the product. These practices reduce unnecessary work and context, without implying a fixed saving on subscription limits. See [OpenAI's compaction documentation](https://developers.openai.com/api/docs/guides/compaction).
