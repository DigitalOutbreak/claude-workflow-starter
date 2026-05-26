# {{Project Name}}

> One-line product description. Replace with what this project actually is. Example: *"Internal agency console — unified inbox for client form submissions and chatbot conversations, with an AI assistant grounded in each workspace's data."*

## Context

These files are auto-imported into every session — they always load with this CLAUDE.md:

@docs/context/thesis.md
@docs/context/project-overview.md
@docs/context/coding-standards.md
@docs/context/ai-interaction.md
@docs/context/current-feature.md

What each one is for:

| File | Purpose |
|---|---|
| `thesis.md` | Why this product exists — beliefs, vision, what we explicitly reject |
| `project-overview.md` | Everything in our spec — what we're building and why |
| `coding-standards.md` | Coding style and rules |
| `ai-interaction.md` | How AI interacts and communicates in this project |
| `current-feature.md` | The feature being worked on right now |

The **authoritative spec** (deeper detail, source of truth) lives in [`docs/specs/`](./docs/specs/). Not auto-imported — read on demand. `project-overview.md` is the polished summary derived from `project-spec.md`.

## Commands

> Replace with your project's actual commands.

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run format` — Prettier on `**/*.{ts,tsx}`

## Project layout

> Replace with your project's actual layout.

```
{{project-root}}/
  app/                Next.js App Router (routes, layouts, server actions)
  components/         shadcn/ui + project components
  hooks/              React hooks
  lib/                shared utilities, db, auth clients
  public/             static assets
  docs/
    context/          ← read these first (see table above)
    specs/            ← authoritative specs (project-spec.md + siblings)
```
