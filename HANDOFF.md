# Handoff — `@digitaloutbreak/workflow`

> Last updated: 2026-05-27 · current shipped version: **0.15.8**
>
> **Read this first** if you're picking up workflow-tool work in a fresh session. The conversation that produced versions 0.15.0 → 0.15.8 happened in a different working directory (the OS project that uses the workflow), so this file captures everything a new session needs to continue.

---

## What this repo is

The npm package `@digitaloutbreak/workflow` — a drop-in workflow scaffold for AI-assisted coding. Ships:

- `/workflow-init` global slash command (lives in `skills/workflow-init/SKILL.md`)
- `/feature` lifecycle skill (project-local, bundled in `.claude/skills/feature/`)
- `/cleanup` housekeeping skill (project-local, bundled in `.claude/skills/cleanup/`)
- `code-scanner` agent (project-local, bundled in `.claude/agents/`)
- Root files: `CLAUDE.md` / `AGENTS.md` / `GEMINI.md`
- Context docs: `docs/context/{thesis,project-overview,coding-standards,ai-interaction,current-feature,roadmap,backlog}.md`
- Spec template: `docs/specs/project-spec.md`
- Empty placeholder dirs: `docs/context/features/`, `docs/context/designs/`

Two install paths:
- **Preferred**: `npx skills add DigitalOutbreak/workflow -g` (open-skills ecosystem CLI, ~15 agents)
- **Legacy**: `npx @digitaloutbreak/workflow` (our own CLI in `bin/cli.js`, only Claude/Codex/Gemini)

Both teach the agent the `/workflow-init` slash command. From a project dir, the user then runs `/workflow-init` for guided setup.

---

## Recent shipped work (v0.15.x)

| Ver | What |
|---|---|
| 0.15.0 | Initial roadmap.md + designs/ (was screenshots/) + MCPs in project-overview |
| 0.15.1 | Project type question (Web/Backend/Mobile-Desktop/Other) + 4 audit fixes |
| 0.15.2 | **CRITICAL** — MCP install reordered to Stage 9 so agent restart no longer wipes interview context |
| 0.15.3 | Design references added to `/feature spec` interview |
| 0.15.4 | Renamed `screenshots/` → `designs/`, scoped design refs to actual visual tools |
| 0.15.5 | Shadcn flag set to pre-answer all prompts |
| 0.15.6 | Simplified to `--preset b0` alone (single complete config bundle) |
| 0.15.7 | Stage reference fixes, dead conditional removed, missing external-services question added, README wording |
| 0.15.8 | Template-file drift fixes — bundled `roadmap.md` / `project-overview.md` / `backlog.md` / `code-scanner.md` now match SKILL.md guidance |

---

## Open audit items (v0.15.9 work, declined to ship in last session)

All from the last audit pass. User said "no its fine" — leave for now, ship when ready.

### 🔴 Real bugs in feature action files (`.claude/skills/feature/actions/`)

1. **`load.md` line 4** — references `context/features/{name}.md` (missing `docs/` prefix). Real paths are `docs/context/features/<slug>-spec.md`. Spec won't load.
2. **`load.md`** — brittle "single word, no spaces" heuristic for file vs inline description. Better: try-load-as-file first, fall back to inline.
3. **`test.md`** — hardcodes Vitest + `npm test` + "server actions". Wrong for non-Web projects (which v0.15.1 added support for).
4. **`explain.md` line 4** — `git diff main` assumes `main` is base branch. Breaks on `master`, custom defaults, initial commits.
5. **`start.md`** — derives branch name from H1 instead of using the spec filename. Fragile round-trip.

### 🟡 Drift

6. **`complete.md`** — doesn't clean up empty `designs/<slug>/` dirs left behind by `/feature spec`.
7. Action files (`start.md`, `review.md`, `explain.md`, `test.md`) don't reference `### Design references` — spec captures them but lifecycle ignores them.
8. **`load.md`** — doesn't validate spec file exists; silently falls through to "inline description".
9. **`test.md`** — "Use your best judgement" is wishy-washy. Need a concrete criterion.

### 🟡 Bigger work (deferred to v0.16+)

- **`coding-standards.md`** is entirely Web/Next.js + TS + Tailwind + Drizzle specific. The starter note says `/workflow-init` rewrites it based on stack picks, but the structure itself is Web-shaped. For Backend/Mobile/Other, the whole file is wrong — not just sections.
- **`docs/specs/project-spec.md`** — same problem. Mermaid diagram + layer table assume App Router web app.

### 🟢 Carry-over chores

- No `CHANGELOG.md`. Easy add — start fresh at next bump.
- `README.html` still stale (~1000 lines, ignored by `files:` so doesn't ship to npm). Delete was blocked by auto-mode classifier last time; user can delete manually.
- `npm test` is fake (`node bin/cli.js --help`). Should run a real smoke test.
- `--all` flag doesn't warn if Gemini isn't installed — creates files into `~/.gemini/commands/` that go nowhere.
- Exit codes (1/2/3) in `bin/cli.js` aren't documented.
- No `--version` flag.
- `buildGeminiTOML` throws on `'''` in body — edge case, should escape rather than throw.

---

## How to ship a release

Pattern from every v0.15.x release:

```bash
# 1. Make edits
# 2. Bump version in package.json
# 3. Smoke test
SMOKE_DIR="/tmp/wf-smoke-$$" && mkdir -p "$SMOKE_DIR" && \
  node bin/cli.js init "$SMOKE_DIR" && \
  find "$SMOKE_DIR" -type f | wc -l && \
  rm -rf "$SMOKE_DIR"
# Should print 21 files installed.

# 4. Sync local skill (so the running user picks up the change immediately)
cp -f skills/workflow-init/SKILL.md ~/.agents/skills/workflow-init/SKILL.md
cp -f skills/workflow-init/SKILL.md ~/.claude/skills/workflow-init/skill.md

# 5. Commit + push + publish
git add -u
git commit -m "vX.Y.Z: <short summary>"
git push origin main
npm publish
```

If `npm publish` complains about auth, see the `.npmrc` cleanup notes below.

---

## Critical invariants (don't break these)

1. **MCPs are NEVER installed before Stage 9.** v0.15.2 fixed a critical bug where Stage 5 installed MCPs and prompted restart, which wiped the discovery interview context before Stage 7 could persist it to disk. Stage 5 is now DECISION only; Stage 9 surfaces install commands.
2. **The workflow is project-agnostic.** Only Stage 2 (scaffold) is Web-specific. Backend / Mobile / Desktop / Other skip Stage 2 and just get docs installed.
3. **`--preset b0` alone is enough for shadcn.** Don't add `--base radix` or `--no-monorepo` — those are redundant with the preset and create surface area for the CLI to reject if flags shift.
4. **Linear / Notion → main `## References`, NOT `### Design references`.** Design references are visual-only (Figma, Sketch, Stitch, Penpot, Excalidraw, Loom, screenshots).
5. **10 flat stages (0-9).** No nested 1a/1b/2a notation.

---

## User-instruction rules to preserve (memory-backed)

These are in the user's auto-memory and apply across sessions:

- **Never add "Generated with Claude" or `Co-Authored-By: Claude` to commit messages.** Verbatim from the user.
- **Don't auto-commit** without explicit permission.
- **Don't push to remote** unless explicitly asked. (Exception: the `/feature complete` skill's documented flow pushes after merge.)

---

## Environment notes

- **npm token state**: `~/.npmrc` was malformed earlier in the session (4 lines, 3 garbage from token pastes). User cleaned it up manually. If `npm publish` fails on auth, see the audit-trail of the conversation around v0.15.6 for the diagnosis.
- **Local skill sync**: every release we copy `skills/workflow-init/SKILL.md` to `~/.agents/skills/workflow-init/SKILL.md` AND `~/.claude/skills/workflow-init/skill.md` so the user's own `/workflow-init` invocation picks up the new content immediately.
- **README.html**: 1033 lines, stale, not in npm tarball (`files:` array excludes it). User considered deletion but the classifier blocked it in a prior session. Leave it or have the user `rm` it themselves.

---

## How to pick up

1. Open Claude Code (or your agent) in this directory: `/Users/joeyalvarado/Developer/_starters/claude-workflow/`.
2. Read this HANDOFF.md plus the most recent `git log -p` if you want commit-level detail.
3. If you want to keep auditing/refining, the next natural slice is v0.15.9 (🔴 items 1-5 above). About 30-45 min of work.
4. If you want to start bigger v0.16 work, the open question is making `coding-standards.md` and `docs/specs/project-spec.md` project-type-aware (the starter note papers over a structural Web bias).

This file isn't in `files:` so it won't ship to npm. Safe to commit or leave untracked — your call.
