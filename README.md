# Claude Workflow Starter

A drop-in workflow scaffold for Claude Code projects. Includes the `CLAUDE.md` anchor, five auto-imported context docs, the `/feature` lifecycle skill (spec → load → start → complete), the `/cleanup` housekeeping skill, the `code-scanner` agent, and an `AGENTS.md` for non-Claude-Code agents (Cursor, Cline, Aider, Continue, etc.).

Snapshot of the workflow running in [DigitalOutbreak/digitaloutbreak-os](https://github.com/DigitalOutbreak/digitaloutbreak-os).

## Install (one command)

From inside any new project directory:

```sh
npx @digitaloutbreak/workflow-init
```

Or target an explicit path:

```sh
npx @digitaloutbreak/workflow-init ./my-new-app
```

That's it. No clone, no PATH setup, no folder structure assumptions. `npx` handles caching; the installer refuses to overwrite if any target files already exist.

> Until the package is published to npm, you can still run it straight from GitHub:
> ```sh
> npx github:DigitalOutbreak/claude-workflow-starter
> ```

## Use the slash command (optional)

Install once per machine to add `/workflow-init` to every Claude Code session:

```sh
npx @digitaloutbreak/workflow-init --install-skill
```

Then from any Claude Code session, in any project directory:

```
/workflow-init                  # install starter into current dir
/workflow-init ./my-new-app     # or specify a path
```

The slash command is a thin wrapper that calls the same `npx … init` command. Skip the install step if you'd rather always type the full npx command — the functionality is identical.

## What gets installed

```
CLAUDE.md                            ← root brief, with @-imports (Claude Code)
AGENTS.md                            ← universal pointer for any AI agent
GEMINI.md                            ← Gemini Code Assist brief
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

The starter's own `README.md`, `README.html`, `LICENSE`, `bin/`, `skill/`, and `package.json` are NOT installed — they describe the starter, not whatever project you're starting.

## What to fill in after install

Three files determine whether the AI context is useful or generic. Spend an hour on these and the rest compounds:

| File | What to write |
|---|---|
| `CLAUDE.md` | Replace `{{Project Name}}` and the project layout. Keep the `@`-imports and commands list. |
| `docs/context/thesis.md` | Your strategic memo — why you're building this, the bet, the moat, the failure modes. |
| `docs/context/project-overview.md` | The polished summary auto-loaded every session — scope, stack, surfaces, decisions log. |
| `docs/specs/project-spec.md` | Deeper authoritative spec — schema, contracts, env keys. Read on demand only. |

The template files have `{{Placeholders}}` and bracketed `[Replace with...]` prompts plus scaffolding for the sections we've found load-bearing.

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

## Per-agent root files

Three root-level briefs ship together — pick whichever your agent reads:

| File | For | Notes |
|---|---|---|
| `CLAUDE.md` | Claude Code | Uses `@`-import syntax to auto-load the five context docs every session. References the `/feature` and `/cleanup` slash commands and the `code-scanner` agent. |
| `AGENTS.md` | Cursor, Cline, Aider, Continue, etc. | Universal pointer — no tool-specific syntax. Tells the agent to read the five context docs manually. |
| `GEMINI.md` | Gemini Code Assist and other Gemini-based agents | Same content as AGENTS.md, addressed to Gemini specifically. |

The starter installs all three so collaborators can use whatever tool they prefer. All three point at the same five context docs in `docs/context/`.

## CLI reference

```
npx @digitaloutbreak/workflow-init [target]   Install starter into target (default: cwd)
npx @digitaloutbreak/workflow-init --install-skill         Install the /workflow-init global skill
npx @digitaloutbreak/workflow-init --help          Show usage
```

## Don't have npx?

Two fallback paths:

1. **Clone the repo and run the bash scripts directly:**
   ```sh
   git clone https://github.com/DigitalOutbreak/claude-workflow-starter.git ~/Developer/_starters/claude-workflow
   bash ~/Developer/_starters/claude-workflow/bin/init.sh ./my-app
   ```
2. **Install Node.js first** (https://nodejs.org/) — `npx` is bundled with every Node install ≥ 5.2.

## Customizing the starter

If you improve the workflow in a real project, copy the change back:

```sh
# Example: improved /feature complete
gh repo clone DigitalOutbreak/claude-workflow-starter
cp ~/projects/my-app/.claude/skills/feature/actions/complete.md \
   claude-workflow-starter/.claude/skills/feature/actions/complete.md
cd claude-workflow-starter && git commit -am "improve /feature complete" && git push
```

Bump the version in `package.json` and `npm publish` to roll out to everyone.

## What's NOT in this starter

| Missing | Why |
|---|---|
| Framework / `package.json` (for the target project) | Bring your own stack. The starter is workflow scaffold, not a Next.js template. |
| `.env*` files | Per-project secrets. |
| Schema / migrations / seed | Domain-specific. |
| UI components / shadcn primitives | Install per project. |
| `docs/handoffs/` | Project-specific by definition. |

## Visual how-to

[`README.html`](./README.html) has the visual version of this doc — color-coded file types, a stepper for the feature lifecycle, and the file inventory tree. Open locally after cloning:

```sh
open ./README.html
```

## License

MIT — see [LICENSE](./LICENSE).
