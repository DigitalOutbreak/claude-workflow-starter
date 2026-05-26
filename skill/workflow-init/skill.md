---
name: workflow-init
description: Bootstrap a new project with the Claude workflow starter (CLAUDE.md, @-imports, /feature lifecycle, /cleanup, code-scanner agent). Optional argument is the target directory; defaults to the current working directory.
argument-hint: [target-dir]
---

# Workflow Init

Drops the `claude-workflow` starter at `{{STARTER_DIR}}` into a target directory by running its `bin/init.sh` script.

## Task

Run the init script. Decide the target like this:

1. **If `$ARGUMENTS` is provided** → use it as the target path (relative paths resolved against the user's current working directory).
2. **If `$ARGUMENTS` is empty** → use the current working directory.

Then check:

- If the target doesn't exist, ask the user before creating it (`mkdir -p`) — the script itself doesn't create the target.
- If the target is empty, the script will install cleanly. Proceed.
- If the target has files, the script will detect conflicts and abort — that's the safety net, don't bypass it.

Execute:

```bash
bash {{STARTER_DIR}}/bin/init.sh "$TARGET"
```

Report what got created from the script's output, then quote its next-steps message back to the user.

## What the starter installs

The script writes these files (and refuses to overwrite if any already exist):

```
CLAUDE.md
AGENTS.md                         (universal pointer for non-Claude-Code agents)
docs/context/thesis.md            (TEMPLATE — fill in)
docs/context/project-overview.md  (TEMPLATE — fill in)
docs/context/coding-standards.md  (STARTER — edit if stack differs)
docs/context/ai-interaction.md    (copy as-is)
docs/context/current-feature.md   (empty working file)
docs/context/backlog.md           (empty index)
docs/specs/project-spec.md        (TEMPLATE — fill in)
docs/context/features/            (empty dir for per-feature specs)
.claude/agents/code-scanner.md
.claude/skills/feature/           (the /feature lifecycle)
.claude/skills/cleanup/           (the /cleanup housekeeping scan)
```

The starter's own `README.md`, `README.html`, `LICENSE`, `bin/`, and `skill/` are intentionally NOT installed — they describe the starter, not whatever project you're starting.

## Conflict handling

The script lists every conflict and exits non-zero if any file would be overwritten. Quote the conflict list back to the user and let them decide whether to remove/rename or pick a different target. There is no `--force` flag by design — accidental clobbering of an existing `CLAUDE.md` or `current-feature.md` would lose real work.

## Starter not found?

If `{{STARTER_DIR}}/bin/init.sh` doesn't exist, the starter has been moved or removed. Tell the user the expected path and recommend they re-run `bin/setup.sh` from the starter's actual location to repoint this skill.

## After install

The script ends with its own numbered next-steps list. Surface it to the user verbatim — those four steps (edit CLAUDE.md, fill in thesis, fill in overview, sketch the spec) are the actual onboarding path.

Don't proactively edit those files in this session unless the user asks — the starter intentionally hands them off as templates so the user can write them in their own voice.
