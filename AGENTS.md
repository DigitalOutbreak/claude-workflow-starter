# {{Project Name}}

> One-line product description. Replace with what this project actually is.

## For AI agents working in this codebase

This project follows a structured-context convention. **Read these five files in order before doing any work** — they're the standing brief that every contributor (human or agent) starts from:

| File | Purpose |
|---|---|
| [`docs/context/thesis.md`](./docs/context/thesis.md) | Why this product exists — strategy, beliefs, what we explicitly reject |
| [`docs/context/project-overview.md`](./docs/context/project-overview.md) | What we're building this quarter — scope, stack, surfaces, decisions log |
| [`docs/context/coding-standards.md`](./docs/context/coding-standards.md) | Coding style and rules |
| [`docs/context/ai-interaction.md`](./docs/context/ai-interaction.md) | How AI agents should communicate and collaborate in this project |
| [`docs/context/current-feature.md`](./docs/context/current-feature.md) | The feature being worked on right now, plus the History of everything that's shipped |

## On-demand reference

- [`docs/specs/project-spec.md`](./docs/specs/project-spec.md) — deeper authoritative spec (schema, contracts, env keys). Read when implementation needs to ground in the source of truth.
- [`docs/context/features/*.md`](./docs/context/features/) — per-feature specs, one per shipped or in-flight feature.
- [`docs/context/backlog.md`](./docs/context/backlog.md) — items explicitly deferred from shipped features, indexed by category.

## Workflow

Every feature ships through this loop:

1. **Document** the feature in a spec file under `docs/context/features/<slug>-spec.md`
2. **Branch** from main: `feature/<slug>`
3. **Implement** against the spec; gates (build, typecheck, lint) must stay clean
4. **Test** in the actual app/dev environment, not just unit tests
5. **Iterate** if the eyeball check reveals issues — no commits yet
6. **Commit** with a conventional message; never auto-commit without explicit human approval
7. **Merge** to main with `--no-ff` so the feature shows in history
8. **Delete** the local feature branch after merge
9. **Reset** `current-feature.md` (clear Status/Goals/Notes, move entry to History) and update `backlog.md` with anything deferred
10. **Push** to origin

Status in `current-feature.md` always reflects reality:
- `Not Started` when freshly loaded
- `In Progress` when a feature branch exists
- Moved to `History` only when merged

## Tool-specific notes

If you're working in **Claude Code**, this project also has:

- A `CLAUDE.md` at the root that uses `@`-import syntax to auto-load the five context docs every session.
- A `/feature` slash command (`spec` / `load` / `start` / `review` / `explain` / `complete`) that automates the workflow above.
- A `/cleanup` slash command for periodic housekeeping scans.
- A `code-scanner` agent for parallelizable code-quality reviews.

If you're working in **another agent** (Cursor, Cline, Aider, Continue, etc.):

- The `@`-import syntax in `CLAUDE.md` is Claude Code-specific. **Read the five context docs manually** at the start of each session.
- Slash commands and agents are Claude Code-specific. The workflow itself (steps 1–10 above) is tool-agnostic — follow it manually.
- The `.claude/` directory contains Claude Code config; you can ignore it.

## Don't

- Don't add features beyond what the current spec describes.
- Don't refactor unrelated code.
- Don't auto-commit. Always ask for human approval before staging.
- Don't bypass the build/typecheck/lint gates. If they fail, fix the root cause.
- Don't delete files without confirming.
- Don't put AI attribution (e.g. "Co-Authored-By: <agent>") in commit messages unless explicitly asked.
