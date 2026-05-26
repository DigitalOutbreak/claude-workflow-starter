# {{Site Name}}

> One-line description. Replace with what this site actually is.

## For Gemini agents working in this codebase

This is a **marketing site**, not a product app. The shape is pages + copy + design + SEO. **Read these five files before doing any work** — they're the standing brief that every contributor (human or agent) starts from:

| File | Purpose |
|---|---|
| [`docs/context/site-brief.md`](./docs/context/site-brief.md) | What the site is, who it's for, what it sells, how success is measured |
| [`docs/context/brand.md`](./docs/context/brand.md) | Voice, tone, words we use/avoid, visual direction |
| [`docs/context/pages.md`](./docs/context/pages.md) | Page inventory with URL, purpose, primary CTA, target keyword, status |
| [`docs/context/coding-standards.md`](./docs/context/coding-standards.md) | Coding style and rules |
| [`docs/context/ai-interaction.md`](./docs/context/ai-interaction.md) | How AI agents should communicate and collaborate in this project |

## On-demand reference

- [`docs/context/content-backlog.md`](./docs/context/content-backlog.md) — planned pages, posts, case studies. Read when adding new content.

## Workflow

Marketing sites don't use a feature spec lifecycle. Work happens on short-lived branches:

| Branch | For |
|---|---|
| `edit/<slug>` | Copy or design tweaks on an existing page |
| `add/<slug>` | New page, post, or case study |
| `design/<slug>` | Larger visual changes (homepage redesign, new components) |
| `fix/<slug>` | Bug fixes (broken links, layout glitches) |
| `chore/<slug>` | Tooling, deps, build config |

For anything bigger than a one-line tweak, update `pages.md` so the inventory stays honest. Commits use conventional messages (`edit:`, `add:`, `fix:`, etc.). Never auto-commit without explicit approval.

## Tool-specific notes

If you're working in **Gemini Code Assist** or another Gemini-based agent:

- Read all five context docs at session start. This project doesn't rely on any Gemini-specific auto-import mechanism — explicit reading is the contract.
- The `.claude/` directory contains Claude Code config; you can ignore it.
- Slash commands like `/cleanup` are Claude Code-specific. The workflow itself is tool-agnostic — follow it manually.

If you're working in a non-Gemini agent (Claude Code, Cursor, Cline, Aider, Continue, etc.):

- See [`AGENTS.md`](./AGENTS.md) for the universal pointer or [`CLAUDE.md`](./CLAUDE.md) for the Claude Code-specific version with `@`-imports.

## Don't

- Don't change brand voice or visual direction without confirmation — copy and design tone are load-bearing.
- Don't add pages that aren't tracked in `pages.md` — keeps the inventory honest.
- Don't auto-commit. Always ask for human approval before staging.
- Don't bypass the build/typecheck/lint gates. If they fail, fix the root cause.
- Don't delete files without confirming.
- Don't put AI attribution (e.g. "Generated with Gemini") in commit messages unless explicitly asked.
