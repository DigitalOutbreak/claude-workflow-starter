# Personal dev context — @digitaloutbreak/workflow (the scaffold itself)

> **For Joey's local dev only.** This file does not ship to npm (excluded via `.npmignore`).
> It loads alongside `CLAUDE.md` and overrides the template placeholders with real context
> for the workflow scaffold project.
>
> The shipped `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, and `docs/context/*.md` are *templates*
> that users fill in via `/workflow-init`. This file gives you the filled-in version for
> *this* project so you can work on the scaffold itself with proper agent context.

---

## What this project actually is

**`@digitaloutbreak/workflow`** is an opinionated, cross-agent scaffold for AI coding workflows.
It installs into any project to give Claude Code, Codex, Cursor, Gemini CLI (and ~12 more) a
shared `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` brief, five tiered context docs in
`docs/context/`, two skills (`/workflow-init`, `/site-init`), a `/feature` lifecycle skill, a
`/cleanup` skill, and a `code-scanner` agent.

**Install paths** (which the package supports today):

1. `npx skills add DigitalOutbreak/workflow -g` — preferred. Uses the open `skills.sh`
   ecosystem, installs to `~/.claude/skills/` and `~/.agents/skills/` (covers ~15 agents).
2. `npx @digitaloutbreak/workflow` — legacy CLI in `bin/cli.js`. Claude / Codex / Gemini only.
3. `bash bin/init.sh ./target` — bare-bones script fallback when no npx.

## Repo layout (as it sits today)

```
claude-workflow/
├── bin/                          # CLI — SHIPS to npm
│   ├── cli.js                    # legacy `npx @digitaloutbreak/workflow` installer
│   └── init.sh                   # bash fallback installer
├── skills/                       # SHIPS to npm (the two slash commands)
│   ├── workflow-init/SKILL.md    # `/workflow-init` — product-app bootstrap
│   └── site-init/SKILL.md        # `/site-init` — marketing-site bootstrap
├── .claude/                      # SHIPS to npm (Claude-native versions of skills + agent)
│   ├── agents/code-scanner.md    # the on-demand review agent
│   └── skills/
│       ├── cleanup/skill.md      # `/cleanup` housekeeping
│       └── feature/
│           ├── skill.md          # `/feature` lifecycle entry
│           └── actions/          # six actions: spec, load, start, review, explain, complete
├── docs/                         # SHIPS to npm — TEMPLATES (placeholders for /workflow-init)
│   ├── context/                  # the five auto-imported docs (templates)
│   │   ├── thesis.md             # {{Project Name}} strategic memo
│   │   ├── project-overview.md   # {{Project Name}} architecture summary
│   │   ├── coding-standards.md   # Next.js + Tailwind v4 starter defaults
│   │   ├── ai-interaction.md     # literal — copy-as-is rules
│   │   ├── current-feature.md    # literal — empty working state
│   │   ├── backlog.md            # literal — empty deferred items
│   │   ├── roadmap.md            # template Now/Next/Later
│   │   └── designs/.gitkeep      # placeholder for /design outputs
│   └── specs/project-spec.md     # template authoritative spec
├── templates/                    # NOT shipped — site-init source templates
│   └── site/                     # Astro/Next/SvelteKit site templates
├── site/                         # NOT shipped — marketing site (Astro)
│   └── src/pages/blog/           # /blog with three posts
├── CLAUDE.md                     # SHIPS to npm — root brief (template)
├── AGENTS.md                     # SHIPS to npm — universal pointer
├── GEMINI.md                     # SHIPS to npm — Gemini brief (same content)
├── README.md                     # SHIPS to npm — install + reference docs
├── LICENSE                       # SHIPS to npm — MIT
├── package.json                  # SHIPS to npm
├── CLAUDE.local.md               # THIS FILE — local dev only, npmignored
└── .npmignore                    # exclusion list for npm publish
```

## What ships vs what doesn't (the lock)

`package.json` `files` field controls what `npm publish` bundles:

```json
"files": ["bin/", "skills/", "CLAUDE.md", "AGENTS.md", "GEMINI.md", "LICENSE", "docs/", ".claude/"]
```

Plus `.npmignore` excludes specific files from those directories:

```
**/settings.local.json    # local Claude permissions — never ship
README.html               # bulky duplicate of README.md
.impeccable*              # design-skill outputs
site/blog-preview*.html   # local preview renders
CLAUDE.local.md           # this file
```

Run `npm pack --dry-run` before any publish to verify the tarball is clean.

## Common dev tasks

**Test the CLI locally without publishing:**
```sh
node bin/cli.js --help
node bin/cli.js init-site /tmp/test-site-init
```

**Test a skill end-to-end:**
```sh
cd /tmp && mkdir test-workflow && cd test-workflow
npx skills add DigitalOutbreak/workflow -g
# then in Claude Code: /workflow-init
```

**Ship a patch:**
```sh
# 1. Bump version in package.json
# 2. Commit version bump
# 3. git push origin main
# 4. npm publish
# Then verify: npm view @digitaloutbreak/workflow version
```

**Run the marketing site locally:**
```sh
cd site && npm run dev
```

## Things to watch for (gotchas)

1. **Anything in `docs/` ships.** If you edit `docs/context/current-feature.md` with real project info while testing `/feature`, that info ships to npm users. The /feature skill writes to that path. Either: (a) don't use /feature on this project, (b) reset the file before publish, or (c) add specific paths to `.npmignore`.

2. **`.claude/settings.local.json` regenerates.** Claude Code recreates this file when you grant new bash permissions during a session. It's in `.gitignore` and `.npmignore` — leave it alone, but be aware it exists locally even though it's invisible to git/npm.

3. **The legacy TOML install path.** `bin/cli.js` no longer writes `~/.gemini/commands/*.toml` (commit d7606fb fixed this on May 27). But users who installed before that still have stale TOML files that *conflict* with the new skill install in Gemini CLI v0.43+. The README still says they're "harmless but inert" — that's wrong, should be updated to "delete to resolve conflicts."

4. **Cross-agent agent (subagent) parity is incomplete.** `/feature` and `/cleanup` skills work in ~15 agents. The `code-scanner` agent is Claude Code only — Codex has its own TOML-based subagent format but the scaffold doesn't dual-install it yet.

5. **Site is separate from scaffold.** Never bundle site changes with scaffold version bumps. `site/` isn't in `package.json` files; Vercel auto-deploys from `main` push.

## Current state of open work

**Shipped (live as of 0.15.9):**
- ✓ Junk cleanup — removed `settings.local.json`, `README.html`, `test.md` from tarball
- ✓ `.npmignore` defense layer
- ✓ Gemini TOML fix (commit d7606fb)
- ✓ Site-init improvements (CWD decision, free-text prose, sibling filter)
- ✓ /blog with three posts (rebuttal, constructor, /feature explainer)

**Open / parked (research mode):**
- README's "harmless but inert" claim about TOML files — wrong, should warn
- CLI auto-cleanup of legacy `~/.gemini/commands/*.toml` on install — closes the loop for pre-d7606fb users
- Optional: path-scoped rules support (`.claude/rules/` with YAML `paths:`) for monorepo users
- Optional: `@AGENTS.md` import pattern in CLAUDE.md to reduce duplication across root briefs
- Optional: dual-install `code-scanner` as a Codex TOML agent for cross-agent parity

## Architectural decisions worth remembering

- **`@-imports` over `.claude/rules/`** for the scaffold's root brief — chosen for cross-agent compat. Rules are Claude-only.
- **Tiered context** (auto / on-demand / executed) — the load strategy, named in the blog. Don't conflate with token caps.
- **Skills + context docs are a pair** — the skill is what makes the markdown *living state* (writes to current-feature.md, backlog.md). Without skills, docs are static notes.
- **Reincarnation** — sessions are ephemeral, on-disk state persists. `/clear` is a feature, not a problem. Named in the blog.

## Voice / writing notes

- Linear-style design language. Dark canvas, single lavender accent, no gradients, no border-left stripes (impeccable absolute-bans).
- Blog tone: direct declaratives, short sentences, no throat-clearing. Cut "this is what" / "there's a subtler point" / "the natural pushback."
- Keep buzzwords *only* when they earn their place: reincarnation, living doc, lifecycle, state surface, constructor.
- Anti-references: SaaS marketing register, AI-slop landing pages, prompt-injection blog content (e.g., the OpenClaw genre).
