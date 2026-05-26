---
name: workflow-init
description: Bootstrap a new project with the Claude workflow starter (CLAUDE.md, AGENTS.md, @-imports, /feature lifecycle, /cleanup, code-scanner agent). Optional argument is the target directory; defaults to the current working directory.
argument-hint: [target-dir]
---

# Workflow Init

Installs the [`@digitaloutbreak/claude-workflow`](https://github.com/DigitalOutbreak/claude-workflow-starter) starter into a target directory by invoking its `npx` command.

## Task

Run the installer. Decide the target like this:

1. **If `$ARGUMENTS` is provided** → use it as the target path (relative paths resolved against the user's current working directory).
2. **If `$ARGUMENTS` is empty** → use the current working directory (`.`).

Then check:

- If the target doesn't exist, ask the user before creating it (`mkdir -p`) — the CLI doesn't create the target itself.
- If the target is empty, the CLI will install cleanly. Proceed.
- If the target has files, the CLI will detect conflicts and abort with a list — that's the safety net, don't bypass it.

Execute one of these (pick based on whether the package is published yet):

```bash
# Once published to npm:
npx @digitaloutbreak/claude-workflow init "$TARGET"

# Until published — run directly from GitHub:
npx github:DigitalOutbreak/claude-workflow-starter init "$TARGET"
```

Quote the CLI's output back to the user — it lists each file added and ends with a numbered next-steps list (edit CLAUDE.md, fill in thesis.md, fill in project-overview.md, etc.).

## What the starter installs

```
CLAUDE.md                            (root brief w/ @-imports — Claude Code)
AGENTS.md                            (universal pointer — Cursor, Cline, Aider, etc.)
docs/context/thesis.md               TEMPLATE — fill in
docs/context/project-overview.md     TEMPLATE — fill in
docs/context/coding-standards.md     STARTER — edit if stack differs
docs/context/ai-interaction.md       (copy as-is)
docs/context/current-feature.md      (empty working file)
docs/context/backlog.md              (empty index)
docs/specs/project-spec.md           TEMPLATE — fill in
docs/context/features/               (empty — per-feature specs land here)
.claude/agents/code-scanner.md
.claude/skills/feature/              (/feature lifecycle)
.claude/skills/cleanup/              (/cleanup housekeeping)
```

## Conflict handling

The CLI exits non-zero with a list of every file it would overwrite. Quote the list to the user and let them decide whether to remove/rename or pick a different target. There is no `--force` flag by design — accidental clobbering of an existing `CLAUDE.md` or `current-feature.md` would lose real work.

## After install

Don't proactively edit the template files (`thesis.md`, `project-overview.md`, `project-spec.md`, `CLAUDE.md`) in this session unless the user asks — the starter intentionally hands them off as templates so the user can write them in their own voice.

Surface the CLI's next-steps list verbatim. Those steps (edit CLAUDE.md, fill in thesis, fill in overview, sketch the spec) are the actual onboarding path.

## If npx isn't available

If the user's environment doesn't have `npx` (very rare — comes with Node.js ≥5.2):

- Suggest they install Node.js first: https://nodejs.org/
- Or fall back to direct invocation if they've cloned the starter manually:
  ```bash
  bash <starter-path>/bin/init.sh "$TARGET"
  ```
