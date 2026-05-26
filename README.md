# workflow-init

A drop-in workflow scaffold for AI-assisted coding. Works with any agent that loads the [open agent skills](https://www.skills.sh) standard — Claude Code, Codex, Cursor, Gemini, Copilot, Cline, Windsurf, and ~12 more.

Ships with a `/workflow-init` slash command, plus the root-level `AGENTS.md` (and tool-specific `CLAUDE.md` / `GEMINI.md`) pointing every agent at five context docs, a `/feature` lifecycle skill (spec → load → start → complete), a `/cleanup` housekeeping skill, and a `code-scanner` agent.

Snapshot of the workflow running in [DigitalOutbreak/digitaloutbreak-os](https://github.com/DigitalOutbreak/digitaloutbreak-os).

## Two-step setup, one for life

```sh
# 1. Install GLOBALLY — adds /workflow-init to every agent on your machine
npx skills add DigitalOutbreak/claude-workflow-starter -g -y

# 2. From any project dir, in your agent:
/workflow-init
```

The first command uses the open [agent skills](https://www.skills.sh) ecosystem CLI. With `-g` (global) it installs at the user level for every supported agent — Claude Code, Codex, Cursor, Gemini, Copilot, Cline, Windsurf, OpenCode, and ~12 others. With `-y` it skips confirmation prompts. The second is what you'll actually use every time you start a project.

### Install only `/workflow-init`, not the bundled skills

The repo ships three skills total: `workflow-init` (the bootstrap command), `feature` (lifecycle workflow), and `cleanup` (housekeeping). By default `-g -y` installs all three. If you only want `/workflow-init`:

```sh
npx skills add DigitalOutbreak/claude-workflow-starter -g -y -s workflow-init
```

### Install project-local instead of global

Omit `-g` to install into the current project's `.agents/skills/` (so the skills are checked into version control with the project):

```sh
npx skills add DigitalOutbreak/claude-workflow-starter -y
```

> Prefer our own CLI? Backwards-compat fallback:
> ```sh
> npx @digitaloutbreak/workflow-init        # interactive: pick from Claude/Codex/Gemini
> npx @digitaloutbreak/workflow-init --all  # all three, no prompts
> ```
> Same end result but smaller agent set (3 vs ~15+). `npx skills add` is preferred.

### What `/workflow-init` does

- Optional Next.js / Astro / SvelteKit / TanStack Start scaffold (with shadcn opt-in)
- Drops CLAUDE.md + AGENTS.md + GEMINI.md + `docs/context/` + `.claude/` into the project
- Discovery interview with elaboration loops (identity / stack / strategy / surfaces)
- Fills the templates with your actual answers
- Recommends a first feature and offers to `/feature spec` it

### Non-interactive install

```sh
npx @digitaloutbreak/workflow-init --all                       # all three agents
npx @digitaloutbreak/workflow-init --claude                    # just Claude Code
npx @digitaloutbreak/workflow-init --claude --gemini           # specific combo
npx @digitaloutbreak/workflow-init --codex                     # add Codex later, leave others
```

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

### Other agents (Cursor, Cline, Aider, Gemini, etc.)

Each agent's slash-command mechanism uses a different folder/format. Confirmed support so far is Claude Code + Codex (above). For other tools, the raw CLI works in any terminal:

```sh
npx @digitaloutbreak/workflow-init
```

That drops `CLAUDE.md` + `AGENTS.md` + `GEMINI.md` + the five context docs + `.claude/` into the target directory. Your agent then reads its respective root file (`AGENTS.md` for Cursor/Cline/Aider, `GEMINI.md` for Gemini Code Assist, `CLAUDE.md` for Claude Code) and follows it to `docs/context/`.

You won't get the auto-interview / template-fill / first-feature pitch in those tools — that's driven by the slash-command skill. You'll edit the templates manually (or ask your agent to walk you through them).

*More tool integrations are planned* — Cursor (`~/.cursor/commands/`), GitHub Copilot (`.github/prompts/`), and Gemini CLI as their formats are verified.

### Target a specific path

```sh
npx @digitaloutbreak/workflow-init ./my-new-app
```

> Until the package was published, you could run it straight from GitHub. That still works as a fallback:
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
npx @digitaloutbreak/workflow-init                       Interactive — install slash command for chosen agents
npx @digitaloutbreak/workflow-init --all                 Install for all three agents, no prompts
npx @digitaloutbreak/workflow-init --claude --gemini     Install for specific agents
npx @digitaloutbreak/workflow-init init [target]         (advanced) Drop workflow files directly into target
npx @digitaloutbreak/workflow-init --help                Show usage

# Backwards compat
npx @digitaloutbreak/workflow-init --install-skill       Same as bare invocation (kept as alias)
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
