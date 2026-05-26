# workflow-init

A drop-in workflow scaffold for AI-assisted coding. Works with any agent that loads the [open agent skills](https://www.skills.sh) standard — Claude Code, Codex, Cursor, Gemini, Copilot, Cline, Windsurf, and ~12 more.

Ships with a `/workflow-init` slash command, plus the root-level `AGENTS.md` (and tool-specific `CLAUDE.md` / `GEMINI.md`) pointing every agent at five context docs, a `/feature` lifecycle skill (spec → load → start → complete), a `/cleanup` housekeeping skill, and a `code-scanner` agent.

Snapshot of the workflow running in [DigitalOutbreak/digitaloutbreak-os](https://github.com/DigitalOutbreak/digitaloutbreak-os).

## Two-step setup, one for life

```sh
# 1. Install GLOBALLY — shows you a picker of every agent you have installed
npx skills add DigitalOutbreak/workflow -g

# 2. From any project dir, in your agent:
/workflow-init
```

The first command uses the open [agent skills](https://www.skills.sh) ecosystem CLI:

- `-g` forces a **global** install. Without it the CLI auto-detects scope — if you happen to be standing in a git repo, it'd install project-local.
- The CLI then shows you a picker of every detected agent on your machine (Claude Code, Codex, Cursor, Gemini, Copilot, Windsurf, OpenCode, and ~10 more) so you can tick the ones you actually want. Press the spacebar to toggle, Enter to confirm.

The second is what you'll actually use every time you start a project.

### Skip the picker (install for all detected agents at once)

Add `-y` if you want one-shot install without picking:

```sh
npx skills add DigitalOutbreak/workflow -g -y
```

### Install project-local instead of global

Omit `-g` to install into the current project's `.agents/skills/` (skills are then checked into version control with the project):

```sh
npx skills add DigitalOutbreak/workflow
```

> Prefer our own CLI? Backwards-compat fallback:
> ```sh
> npx @digitaloutbreak/workflow        # interactive: pick from Claude / Codex / Gemini
> npx @digitaloutbreak/workflow --all  # install for Claude + Codex + Gemini, no prompts
> ```
> Same end result but smaller agent set — only Claude Code, Codex, and Gemini (vs ~15+ via `npx skills add`). `npx skills add` is preferred.

### What `/workflow-init` does

Ten-stage guided bootstrap (~5-15 min depending on how much you elaborate):

1. **Idempotency check** — detects prior runs in the target dir and offers Resume / Refresh / Start fresh / Abort
2. **Pre-flight** — asks the project type (Web / Backend-API / Mobile-Desktop / Other). For Web, optionally scaffolds with Next.js / Astro / SvelteKit / TanStack Start + shadcn opt-in. Non-Web project types skip the scaffolder (you bring your own `cargo init` / `flutter create` / etc.)
3. **Install workflow files** — drops CLAUDE.md + AGENTS.md + GEMINI.md + `docs/context/` + `.claude/skills/` + `.claude/agents/code-scanner.md` into the project
4. **Discovery interview** — identity / stack / strategy / surfaces, with elaboration loops after every prose question so you can think out loud or jump straight to "move on"
5. **MCP decision** — recommends MCPs based on your stack + an explicit "will you call external services?" question. Records install commands in `project-overview.md` but does NOT install yet (would force a context-wiping restart mid-flow)
6. **Roadmap proposal** — drafts a `Now` / `Next` / `Later` roadmap based on stack + strategy, iterates with you before saving. Skipped for existing projects
7. **Fill templates** — replaces `{{Placeholders}}` in all installed docs with your actual answers
8. **Recommend first feature** — picks the smallest thing from the roadmap's `Now` phase and offers to `/feature spec` it immediately
9. **Hand off** — MCP install commands appear here (safe to restart now; the interview is all on disk). Plus next-steps for `/feature` lifecycle

### Where the slash command lives, per agent

- `~/.claude/skills/workflow-init/skill.md` — Claude Code (markdown + YAML frontmatter)
- `~/.agents/skills/workflow-init/SKILL.md` — Codex CLI / IDE / app (markdown + YAML frontmatter)
- `~/.gemini/commands/workflow-init.toml` — Gemini CLI (TOML)

The CLI generates each tool's expected format from the same source skill (markdown for Claude/Codex, TOML for Gemini), so the content stays in sync.

| Tool | Invoke with |
|---|---|
| **Claude Code** | `/workflow-init` |
| **Codex** | `$workflow-init` (or pick from the `/skills` picker) |
| **Gemini CLI** | `/workflow-init` |

The `/workflow-init` flow is the full experience: it optionally scaffolds a fresh framework (Next.js / Astro / SvelteKit / TanStack Start, with or without shadcn), drops in the workflow files, runs a guided discovery interview (with back-and-forth elaboration loops), fills the templates with your actual answers, and recommends a first feature to ship.

### Other agents (Cursor, Cline, Aider, Continue, etc.)

`npx skills add DigitalOutbreak/workflow -g` already covers ~15 agents — the picker lists every one detected on your machine, including Cursor, Cline, Aider, Continue, Windsurf, OpenCode, and more. Tick the ones you want.

For agents that don't expose a slash-command mechanism yet, the install still drops `CLAUDE.md` + `AGENTS.md` + `GEMINI.md` + the five context docs + `.claude/` into the project. Your agent reads its respective root file (`AGENTS.md` for Cursor/Cline/Aider/Continue, `GEMINI.md` for Gemini Code Assist, `CLAUDE.md` for Claude Code) and follows it to `docs/context/`.

You won't get the auto-interview / template-fill / first-feature pitch in those tools — that's driven by the slash-command skill. You'll edit the templates manually (or ask your agent to walk you through them).

### Target a specific path

`npx skills add` installs relative to your current working directory (project-local) or your home (`-g`). To install into a specific path, `cd` there first:

```sh
cd ./my-new-app
npx skills add DigitalOutbreak/workflow
```

> The legacy CLI (below) accepts a path argument directly: `npx @digitaloutbreak/workflow ./my-new-app`.

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

The starter installs all three root files (CLAUDE.md / AGENTS.md / GEMINI.md) so collaborators on the same project can use whatever agent they prefer. All three point at the same five context docs in `docs/context/`.

## Legacy CLI reference

The preferred install path is `npx skills add DigitalOutbreak/workflow -g` (see [Two-step setup](#two-step-setup-one-for-life) above). The legacy CLI below predates that ecosystem and is kept for backwards compatibility — it only supports Claude Code, Codex, and Gemini (vs ~15+ via `npx skills add`).

```
npx @digitaloutbreak/workflow                       Interactive — install slash command for chosen agents
npx @digitaloutbreak/workflow --all                 Install for Claude + Codex + Gemini, no prompts
npx @digitaloutbreak/workflow --claude              Just Claude Code
npx @digitaloutbreak/workflow --claude --gemini     Install for specific agents
npx @digitaloutbreak/workflow --codex               Add Codex later, leave others
npx @digitaloutbreak/workflow ./my-new-app          Target a specific path
npx @digitaloutbreak/workflow init [target]         (advanced) Drop workflow files directly into target
npx @digitaloutbreak/workflow --help                Show usage

# Pre-publish fallback (still works)
npx github:DigitalOutbreak/workflow                 Run straight from GitHub

# Backwards-compat alias
npx @digitaloutbreak/workflow --install-skill       Same as bare invocation
```

## Don't have npx?

Two fallback paths:

1. **Clone the repo and run the bash scripts directly:**
   ```sh
   git clone https://github.com/DigitalOutbreak/workflow.git ~/Developer/_starters/claude-workflow
   bash ~/Developer/_starters/claude-workflow/bin/init.sh ./my-app
   ```
2. **Install Node.js first** (https://nodejs.org/) — `npx` is bundled with every Node install ≥ 5.2.

## Customizing the starter

If you improve the workflow in a real project, copy the change back:

```sh
# Example: improved /feature complete
gh repo clone DigitalOutbreak/workflow
cp ~/projects/my-app/.claude/skills/feature/actions/complete.md \
   workflow-init/.claude/skills/feature/actions/complete.md
cd workflow-init && git commit -am "improve /feature complete" && git push
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
