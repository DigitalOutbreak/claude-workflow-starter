# Claude Workflow Starter

A drop-in workflow scaffold for Claude Code projects. Includes the CLAUDE.md anchor, five auto-imported context docs, the `/feature` lifecycle skill (spec → load → start → complete), the `/cleanup` housekeeping skill, the `code-scanner` agent, and an `AGENTS.md` for non-Claude-Code agents (Cursor, Cline, Aider, etc.).

Snapshot of the workflow running in [DigitalOutbreak/digitaloutbreak-os](https://github.com/DigitalOutbreak/digitaloutbreak-os).

## Install

```sh
# 1. Clone the starter wherever you keep templates
git clone https://github.com/DigitalOutbreak/claude-workflow-starter.git ~/Developer/_starters/claude-workflow

# 2. Install the /workflow-init global skill (self-configuring — detects where you cloned)
bash ~/Developer/_starters/claude-workflow/bin/setup.sh
```

That's it. From any Claude Code session anywhere, you can now run:

```
/workflow-init                  # install starter into current directory
/workflow-init ./my-new-app     # install into a specific path
```

If you ever move the starter, just re-run `setup.sh` from its new location — the skill re-points itself.

## What gets installed in a new project

The `/workflow-init` skill (or `bin/init.sh` directly) writes these files into your target project:

```
CLAUDE.md                            ← root brief, with @-imports
AGENTS.md                            ← universal pointer for any AI agent
docs/
├── context/                         ← auto-imported every session
│   ├── thesis.md                    [TEMPLATE — fill in]
│   ├── project-overview.md          [TEMPLATE — fill in]
│   ├── coding-standards.md          [STARTER — Next/TS/Tailwind v4 defaults]
│   ├── ai-interaction.md            [LITERAL — copy as-is]
│   ├── current-feature.md           [LITERAL — empty working file]
│   ├── backlog.md                   [LITERAL — empty index w/ categories]
│   └── features/                    ← per-feature specs land here
└── specs/
    └── project-spec.md              [TEMPLATE — source-of-truth spec]
.claude/
├── agents/
│   └── code-scanner.md
└── skills/
    ├── feature/                     ← /feature  spec → complete lifecycle
    └── cleanup/                     ← /cleanup  housekeeping scan
```

The starter's own `README.md`, `README.html`, `LICENSE`, `bin/`, and `skill/` are NOT installed — they describe the starter, not whatever project you're starting.

## What to fill in after install

Three files determine whether the AI context is useful or generic. Spend an hour on these and the rest compounds:

| File | What to write |
|---|---|
| `CLAUDE.md` | Replace `{{Project Name}}` and the project layout. Keep `@`-imports and commands. |
| `docs/context/thesis.md` | Your strategic memo — why you're building this, the bet, the moat, failure modes. |
| `docs/context/project-overview.md` | The polished summary auto-loaded every session — scope, stack, surfaces, decisions log. |
| `docs/specs/project-spec.md` | The deeper authoritative spec — schema, contracts, env keys. Read on demand only. |

The starter files have `{{Placeholders}}` and bracketed `[Replace with...]` prompts inside, plus scaffolding for the sections we've found load-bearing.

## How the workflow works

Three layers of context, loaded by need:

| Layer | Where | When loaded |
|---|---|---|
| **Auto-imported** | `docs/context/*.md` (5 files) | Every session, via `@`-imports in `CLAUDE.md` |
| **Read on demand** | `docs/specs/`, `docs/context/features/`, `docs/context/backlog.md` | When the task makes them relevant |
| **Executed** | `.claude/skills/`, `.claude/agents/` | When invoked (slash commands, Agent tool) |

Features ship through a fixed 7-step loop:

```
/feature spec   →   /feature load   →   /feature start   →   (implement + verify)
                                                                      ↓
                History entry  ←  /feature complete  ←  (gates clean + eyeball passed)
```

Each command has its own action file in `.claude/skills/feature/actions/`. Read [`docs/context/ai-interaction.md`](./docs/context/ai-interaction.md) (after install) for the full workflow rules.

## AGENTS.md — for non-Claude-Code users

`AGENTS.md` is a sibling to `CLAUDE.md` that points any AI agent (Cursor, Cline, Aider, Continue, etc.) at the same five context docs. It explicitly notes which parts of the workflow are Claude Code-specific (the `@`-imports, slash commands, agents) and which are tool-agnostic (the docs themselves, the workflow philosophy).

The starter installs both — your collaborators can use whatever tool they prefer.

## Customizing the starter

If you improve the workflow in a real project, copy the change back:

```sh
# Example: improved /feature complete
cp ~/projects/my-app/.claude/skills/feature/actions/complete.md \
   ~/Developer/_starters/claude-workflow/.claude/skills/feature/actions/complete.md

# Then commit + push to share with everyone using the starter
cd ~/Developer/_starters/claude-workflow
git add . && git commit -m "improve /feature complete" && git push
```

The starter is a single-file-tree snapshot — there's no framework or build step. Edit what you need.

## What's NOT in this starter

| Missing | Why |
|---|---|
| Framework / `package.json` | Bring your own stack. The starter is workflow scaffold, not a Next.js template. |
| `.env*` files | Per-project secrets. |
| Schema / migrations / seed | Domain-specific. |
| UI components / shadcn primitives | Install per project. |
| `docs/handoffs/` | Project-specific by definition. |

## Visual how-to

There's an HTML version of this README with screenshots and a stepper at [`README.html`](./README.html). Open it locally:

```sh
open ~/Developer/_starters/claude-workflow/README.html
```

## License

MIT — see [LICENSE](./LICENSE).
