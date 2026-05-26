---
name: workflow-init
description: Bootstrap a new project with a guided discovery interview — installs the starter, scaffolds the framework, suggests MCPs based on stack, proposes a roadmap, fills in the strategy/overview/spec templates from the user's answers, then recommends a first feature to ship. Optional argument is the target directory; defaults to the current working directory. Supports Claude Code, Codex, and any AI agent that loads agent skills.
argument-hint: [target-dir]
---

# Workflow Init

> **Cross-agent note**: where this skill says "use a structured-question prompt," use whatever mechanism your agent offers. In Claude Code that's `AskUserQuestion`. In Codex / other agents, it's natural-language prose with clear option lists. Same end behavior — the agent presents 2-4 choices, the user picks one.

End-to-end project bootstrap. Ten stages, executed sequentially:

```
0  Idempotency check       (skip stages already done if re-run)
1  Pre-flight              (project type → target dir → scaffold/existing → framework → shadcn)
2  Scaffold                (only for new Web projects — run create-* commands)
3  Install workflow files  (drop CLAUDE.md / AGENTS.md / GEMINI.md / docs/ / .claude/)
4  Discovery interview     (identity → stack → strategy → surfaces, with elaboration)
5  MCP suggestion          (recommend MCPs based on stack — skipped for simple projects)
6  Roadmap proposal        (draft + iterate + save — skipped for existing projects)
7  Fill templates          (edit all template files with user's answers)
8  Recommend first feature (pick from roadmap's "Now" milestone)
9  Hand off                (next-steps message)
```

> **The workflow is project-agnostic.** Web app, backend service, mobile, CLI tool, library — the docs (thesis, overview, roadmap, feature specs) work for any codebase. Only **Stage 2 (scaffold)** is web-specific because that's the only category with reliable, tested scaffolders. Non-web projects skip Stage 2 and get the docs installed in their existing/empty directory; the user runs whatever init their stack needs (e.g. `cargo init`, `python -m venv`, `flutter create`) themselves.

Don't dump templates and walk away. The template files (thesis, overview, spec, CLAUDE.md, roadmap) have `{{Placeholders}}` and `[Replace with...]` prompts — those need real content to be useful, and the user has the answers in their head right now. The interview surfaces them.

## Stage 0 — Idempotency check

Before anything else, check if `/workflow-init` has run before in this target. Look for either of:

- `docs/context/current-feature.md` exists and has content beyond the empty placeholder comments
- `docs/context/roadmap.md` exists and has content beyond the empty template

If yes, ask the user:

> "This project already has workflow files. Do you want to:
> - **Resume** — keep existing context, just check what's set up
> - **Refresh skill files only** — re-install `.claude/skills/` if they've moved
> - **Start fresh** — wipe and re-run the full interview (destructive)
> - **Abort** — leave things alone"

Default to "Resume." Only run the full interview if the user explicitly asks for "Start fresh." This protects against accidental re-runs trashing their populated docs.

If no prior install detected, proceed normally.

## Stage 1 — Pre-flight

Decide the working location:

1. If the user provided a target directory after the command name → that's the **parent** directory (where the new project lives or will live). Resolve relative paths against the user's current working directory.
2. If no target was provided → use the current working directory as the parent.

Ask the user 4 sub-questions in sequence (each is a separate structured-question prompt because options differ).

### 1.1 What kind of project?

Four options:

| Option | Examples |
|---|---|
| **Web app or site** *(recommended for most)* | Dashboard, marketing site, docs site, web app, e-commerce |
| **Backend / API / service** | REST API, GraphQL service, worker, daemon, microservice |
| **Mobile or desktop app** | iOS / Android / React Native / Expo / Flutter / Tauri / Electron |
| **Other** | CLI tool, library/package, data/ML project, custom stack |

This decides whether Stage 2 (scaffold) runs:

- **Web** → continue to 1.2 (we have tested scaffolders for Next.js / Astro / SvelteKit / TanStack Start).
- **Backend / Mobile / Desktop / Other** → SKIP Stages 1.2, 1.3, 1.4, and Stage 2 entirely. The workflow installs the docs into the parent directory; the user runs whatever init their stack needs themselves (e.g. `cargo init`, `python -m venv`, `flutter create`, `npx create-hono`). Continue with Stage 1.2-as-existing-project below — i.e. go directly to Stage 3.

> **Why no backend/mobile scaffolders?** Those ecosystems have many equally valid tools and the "right" choice varies by team. Rather than pick one and be wrong half the time, we let the user run their stack's idiomatic init command separately. The workflow's value (docs + skills + agents) applies regardless.

### 1.2 New project or existing? *(only if Web in 1.1)*

Two options:

- **Scaffold a new project** — agent runs a `create-*` command in Stage 2
- **Use existing project** — agent skips scaffolding entirely

If "Use existing project" → jump straight to Stage 3 (install workflow files). Skip 1.3, 1.4, and Stage 2 entirely.

### 1.3 Which framework? *(only if scaffolding a new Web project)*

Four options:

| Option | What runs (high-level) |
|---|---|
| **Next.js** *(recommended)* | With shadcn → `shadcn@latest init --template next` (single-command scaffold). Without → `create-next-app` (TS + Tailwind + App Router + Turbopack) |
| **Astro** | With shadcn → `shadcn@latest init --template astro` (scaffolds + React + Tailwind + shadcn in one). Without → `npm create astro` + `astro add tailwind` |
| **SvelteKit** | `sv create` (minimal, TS) + `sv add tailwindcss`. shadcn opt-in uses `shadcn-svelte` (community Svelte port) |
| **TanStack Start** | With shadcn → `shadcn@latest init --template start`. Without → `create-tsrouter-app` with Start + Tailwind + ESLint + Prettier add-ons |

Frame: "Which framework?" — recommend Next.js as the default for new React UI projects.

### 1.4 Add shadcn? *(only if a framework was picked)*

Two options. Contextual framing per framework:

- **Next.js / TanStack Start**: "Add shadcn for UI components? (Recommended — most React + Tailwind projects use it.)"
- **Astro**: "Add shadcn for React UI islands? (Optional — useful for interactive components on a content site.)"
- **SvelteKit**: "Add shadcn-svelte for UI components? (Community port of shadcn for Svelte.)"

### Branch summary

| 1.1 type | 1.2 new/existing | Path |
|---|---|---|
| Backend / Mobile / Desktop / Other | (skipped) | → Stage 3 (docs only) |
| Web | Existing project | → Stage 3 (docs only) |
| Web | New + Next.js (± shadcn) | → Stage 2 → Stage 3 |
| Web | New + Astro (± shadcn) | → Stage 2 → Stage 3 |
| Web | New + SvelteKit (± shadcn-svelte) | → Stage 2 → Stage 3 |
| Web | New + TanStack Start (± shadcn) | → Stage 2 → Stage 3 |

## Stage 2 — Scaffold

Only run this if a framework was picked in Stage 1.

> **Critical: keep `-y` in every `npx -y <command>`.** Without it, npx asks "Ok to proceed? (y)" before downloading the package the first time, and an agent session **cannot auto-respond** to that prompt — the user would have to manually type `y` in the shell. Each command below has `-y` in the right position; do not drop it. The `--yes` later in the command (for `create-next-app`, `shadcn`, etc.) is a different flag — that one accepts the framework's defaults. Both are needed.

### 2.1 Project name

Ask in prose: "What should we name the project? (lowercase, hyphens — this becomes the directory name and the `name` field in `package.json`)."

Invoke the elaboration loop if the user wants to brainstorm names. Once settled, paraphrase: "So the project name is `<name>` — directory will be `<parent>/<name>`. Sound good?"

### 2.2 Run the scaffolder

Pick the command set based on the user's Stage 1 choices.

**For Next.js + shadcn (use shadcn's unified scaffolder — one command):**

```bash
cd "$PARENT" && npx -y shadcn@latest init --template next --name <name> --yes
```

This is the modern path. shadcn scaffolds Next.js + installs shadcn in one step. Different (and slightly better) result than `create-next-app` followed by `shadcn init` — fewer post-hoc config tweaks, shadcn's preferred defaults baked in.

**For Next.js without shadcn (Tailwind only, no UI lib):**

```bash
cd "$PARENT" && npx -y create-next-app@latest <name> \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --import-alias '@/*' \
  --use-npm \
  --yes
```

(All Next.js framework defaults included: TypeScript, Tailwind v4, ESLint, App Router, Turbopack, `@/*` import alias.)

**For Astro + shadcn (use shadcn's unified scaffolder — one command):**

```bash
cd "$PARENT" && npx -y shadcn@latest init --template astro --name <name> --yes
```

shadcn scaffolds Astro + adds React + Tailwind + initializes shadcn in one step.

**For Astro without shadcn (content site, no React UI needed):**

```bash
cd "$PARENT" && npm create astro@latest <name> -- \
  --template minimal \
  --typescript strictest \
  --install \
  --no-git \
  --yes

cd "$PARENT/<name>" && npx -y astro add tailwind --yes
```

(Astro doesn't ship ESLint as a default convention — `astro check` is the type checker and Prettier handles formatting. Tailwind is added explicitly because no Astro template includes it by default.)

**For SvelteKit:**

```bash
cd "$PARENT" && npx -y sv create <name> \
  --template minimal \
  --types ts \
  --add-ons eslint,prettier,tailwindcss \
  --install npm \
  --no-git
```

(Adds the SvelteKit-recommended defaults: ESLint, Prettier, Tailwind. The `sv create` CLI handles all three as add-ons in one shot — no separate `sv add` step needed.)

If they picked **SvelteKit + shadcn-svelte**, follow up:

```bash
cd "$PARENT/<name>" && npx -y shadcn-svelte@latest init --base-color zinc
```

(Note: `shadcn-svelte` is the community Svelte port of shadcn, not the official `shadcn` CLI — different package.)

**For TanStack Start + shadcn (use shadcn's unified scaffolder — one command):**

```bash
cd "$PARENT" && npx -y shadcn@latest init --template start --name <name> --yes
```

shadcn scaffolds TanStack Start + initializes shadcn in one step.

**For TanStack Start without shadcn:**

```bash
cd "$PARENT" && npx -y create-tsrouter-app@latest <name> \
  --add-ons start,tailwind,eslint,prettier \
  --package-manager npm
```

(Includes TanStack's recommended add-ons: Start SSR + Tailwind + ESLint + Prettier.)

CLI flag names occasionally shift between versions across all four scaffolders. If a flag is rejected, drop the offending flag and re-run rather than tweaking endlessly — the defaults are reasonable.

### 2.3 Clear scaffolder-generated agent files

Some scaffolders (notably `create-next-app` ≥ v15) now generate their own `AGENTS.md` as part of the recommended defaults. **We always want our version** — that's the whole point of the workflow starter, and the scaffolder's version doesn't reference the `docs/context/*` structure.

Before Stage 3, scrub any agent files the scaffolder may have dropped:

```bash
cd "$PARENT/<name>" && rm -f AGENTS.md CLAUDE.md GEMINI.md
```

Don't ask the user about this — it's a structural fix, not a preference.

### 2.4 Set the target

The workflow target is now `$PARENT/<name>`. Set `$TARGET` to that absolute path for Stage 3.

### What if scaffolding fails?

If any command errors (network blip, flag mismatch in a newer version of the scaffolder, etc.), stop the flow. Report the error verbatim. Offer:

- **Retry** (most failures are transient)
- **Drop the failing step** (e.g., scaffold succeeded but shadcn init failed → continue with workflow install in the partly-scaffolded project)
- **Skip scaffolding entirely** and continue with workflow install only in the parent dir
- **Abort**

Don't silently continue past a failed scaffold.

## Stage 3 — Install workflow files

Sanity checks:
- If target doesn't exist, ask the user before creating it (`mkdir -p`).
- If target is empty (or just scaffolded), the CLI installs cleanly — proceed.
- If target has files unrelated to scaffolding, the CLI will detect conflicts and abort — surface that, don't bypass.

Run the install:

```bash
npx -y @digitaloutbreak/workflow init "$TARGET"
```

Quote the CLI's file list and next-steps output back to the user. Then tell them: **"Files are in. Let me ask you a few questions so we can fill them with real content instead of placeholders."**

## Stage 4 — Discovery interview

Use structured-question prompts for bounded choices, plain prose for open-ended ones. Run in rounds so the user isn't overwhelmed by a 10-question form.

### Elaboration loops — the universal rule for prose rounds

After the user's first answer to ANY prose question, do not race to the next question. Ask:

> "Want to dig into that more, refine it, or are you good to move on?"

Three modes:

1. **"Move on"** → record answer verbatim, advance.
2. **"Let me think out loud"** → engage. Follow-ups, mirror back, propose tighter phrasings, point out tensions.
3. **"Help me figure it out"** → recommend. Offer 2-3 framings from what's already known, ask which lands.

When you finally capture the answer, **paraphrase back in one sentence** and confirm. "So you'd say: <X>. Sound right?" If they tweak, accept and move on.

### Round 1 — Identity (required, may iterate)

Ask in prose, one question at a time:
- "What's the project's name?" *(skip if already captured in Stage 2.1)*
- "One sentence — what does it do?"
- "Who's the primary user? (you / a team / a customer / the public)"

For each: ask → first answer → elaboration loop. The one-sentence description is the most worth iterating on.

### Round 2 — Tech stack (structured-question prompt)

**The exact questions depend on the project type from Stage 1.1.** Pick the matching block.

#### If project type = Web

If Stage 2 scaffolded a project, **skip the framework question** — you already know. Just ask the rest.

Otherwise ask 4 sub-questions in one prompt:

1. **Framework** — Next.js 16 *(default — scaffolded)* / Astro / SvelteKit / TanStack Start
2. **Database** — I'll add it later *(default)* / Postgres via Neon *(recommended)* / SQLite / None
3. **ORM** — I'll add it later *(default)* / Drizzle *(recommended)* / Prisma / None
4. **Auth** — I'll add it later *(default)* / Better Auth *(recommended)* / Clerk / None

#### If project type = Backend / API / service

Ask 4 sub-questions in one prompt:

1. **Runtime / language** — Node *(TypeScript)* / Bun *(TypeScript)* / Python / Go / Rust / Other
2. **Server framework** — I'll add it later *(default)* / Hono / Express / NestJS / FastAPI / Other
3. **Database** — I'll add it later *(default)* / Postgres / SQLite / MongoDB / None
4. **Auth** — I'll add it later *(default)* / JWT-only / Better Auth / Clerk / Auth0 / None

#### If project type = Mobile or desktop

Ask 3 sub-questions in one prompt:

1. **Platform** — Expo / React Native CLI / Flutter / Tauri / Electron / Native (iOS/Android) / Other
2. **Local storage** — I'll add it later *(default)* / SQLite / Realm / AsyncStorage/Hive / None
3. **Auth** — I'll add it later *(default)* / Better Auth / Clerk / Firebase Auth / Native sign-in only / None

#### If project type = Other (CLI, library, ML/data, custom)

Ask 2 sub-questions in one prompt:

1. **Language / runtime** — Node *(TypeScript)* / Bun / Python / Go / Rust / Other
2. **Purpose** — CLI tool / Library or SDK / ML or data project / Other

Skip Database, ORM, Auth — these usually don't apply. If they do for a niche case, the user can mention it in the freeform Strategy round.

---

Semantic distinction (applies to all blocks):
- **"I'll add it later"** = wants one, just hasn't decided. Docs stay generic.
- **"None"** = doesn't need this layer at all.

**Skip ORM** if Database = None.

### Round 3 — Strategy (open-ended, expect iteration)

Longest round. Ask in prose, one at a time, elaboration loop after each:

- **"Why does this need to exist? In one or two sentences — the bet you're making."**
- **"What's your unfair advantage here?"**
- **"What's the smallest thing that proves the bet?"**

### Round 4 — Surfaces or entry points (structured-question prompt + elaboration if needed)

The framing depends on project type from Stage 1.1:

- **Web or Mobile/Desktop** — ask about *surfaces* (screens, pages, views). Based on the description, suggest 2-4 plausible v1 surfaces. Multi-select with "let me describe in my own words" fallback.
- **Backend / API / service** — ask about *endpoints or capabilities* instead. "What are the 2-4 most important endpoints or capabilities for v1? (e.g. `POST /users`, webhook receiver, background job, etc.)"
- **CLI tool** — ask about *commands*. "What are the 2-4 most important commands for v1?"
- **Library / SDK** — ask about *public API surface*. "What are the 2-4 most important functions/classes the library will expose in v1?"
- **ML or data project** — ask about *pipelines or notebooks*. "What are the 2-4 most important pipelines, notebooks, or analyses for v1?"

If pushed back, drop into elaboration. Whichever framing you use, capture 2-4 items — those drive the roadmap proposal and the first-feature recommendation.

## Stage 5 — MCP suggestion

> **Skip this stage entirely if the project is "simple"** — defined as ALL of:
> - Database = None
> - Auth = None
> - User answered "no" to: "Will you call any external services from code? (Stripe, OpenAI, GHL, deploys, etc.)"
>
> Examples that skip: portfolio sites, static content pages, pure CLI utilities with no external calls, libraries with no external integrations. MCPs don't help much when there's no data layer or external behavior to talk to.

For non-simple projects, based on Round 2 stack picks, propose MCPs that make agent work meaningfully faster on this stack. Explain MCP concept first if the user looks unfamiliar:

> **What's MCP?** Model Context Protocol — lets me talk to external tools (your database, docs sites, your browser) directly instead of you copy-pasting things. Plugins for the agent. Quick install per MCP, big quality-of-life win.

Then suggest based on stack:

| Stack pick | MCP to suggest | What it unlocks |
|---|---|---|
| Postgres via Neon | `neon` MCP | Inspect schema, run queries, manage branches |
| Postgres self-hosted | `postgres` MCP | Generic Postgres queries + inspection |
| Supabase | `supabase` MCP | DB + auth + storage |
| Any project with library docs needs | `context7` MCP | Up-to-date docs for any library |
| Web project with UI surfaces (1.1 = Web AND Round 4 ≠ empty) | `playwright` MCP | Drive browser, screenshots, E2E |
| User mentions Figma | Figma MCP | Pull design files, Code Connect |
| Vercel deployments | `vercel` MCP | Deploys, logs, env vars |
| Stripe billing | `stripe` MCP | Subscriptions, test webhooks |

Limit to 2-3 most relevant MCPs. Don't dump a 10-item list — that's noise.

For each suggested MCP, provide the install command for the user's specific agent:

```bash
# Claude Code
claude mcp add neon --scope user -- npx -y mcp-remote@latest https://mcp.neon.tech/sse

# Codex (and others) — different install conventions
# Agent figures out the right install command for the current tool
```

The user runs the commands themselves (agents can't install MCPs autonomously — install requires agent restart in most cases). After install, ask: "Did the install succeed? Want me to verify by trying to use the MCP?"

Record which MCPs were installed in `docs/context/project-overview.md` under a new § Agent capabilities section (added during Stage 7 template fill).

## Stage 6 — Roadmap proposal

> **Skip this stage if "Use existing project" was picked in Stage 1.1.** For existing projects, the agent doesn't know what's already built — proposing a roadmap that says "Build app shell" when one exists is wrong. Instead, briefly inspect the codebase and either skip the roadmap or propose a roadmap that picks up from current state.

For new projects, generate a roadmap proposal based on:
- Product description (Round 1)
- Stack picks (Round 2)
- Strategy answers (Round 3)
- v1 surfaces (Round 4)
- Senior-engineering ordering principles (below)

### Senior-engineering ordering principles to apply

| Idiom | What it means |
|---|---|
| **Irreversible decisions before reversible ones** | Schema, RLS, auth model, tenant boundary first. Visual polish last. |
| **Shell + types + data layer are parallel tracks in "Now"** | They have no dependencies on each other. Build the type contract first (Item, etc.), then shell and data layer can proceed in parallel. |
| **Read before write** | Viewing surfaces before mutation surfaces. Mutations add audit, invalidation, error paths — defer until reads are nailed. |
| **One vertical end-to-end before horizontal scaling** | First surface should be complete (UI + data + behavior) before starting a second. Proves the pattern. |
| **Internal/manual before automated/public** | Seeded data before live webhooks. Internal demo before public launch. |
| **Hardcoded before parameterized** | "Three before abstraction" — easier to extract pattern after seeing it 3x. |
| **Critical path first** | What's the smallest thing that proves the bet? Ship that. |

### Propose the roadmap as a DRAFT

Critical framing — the agent must present the roadmap as a draft that the user reviews and edits, NOT a verdict:

> "Here's my **proposed** roadmap — let's adjust before saving. What feels wrong or out of order?"

Then iterate. Don't write `roadmap.md` until the user explicitly approves. Accept edits like:
- "Swap milestones 2 and 3"
- "Drop the auth phase, I'll do that later"
- "Add a 'mobile-responsive' phase before launch"

When the user says "looks good" or equivalent, save to `docs/context/roadmap.md` using the template structure (see template file for the shape).

### Proposed roadmap template the agent fills in

```markdown
# Roadmap

What's coming, in roughly what order. Living document — items move through phases as they ship.

## Reasoning
2-3 sentences explaining the chosen sequence and why this order makes sense for THIS project.
The agent fills this in based on which idioms applied.

## Now (parallel tracks — start in any order)
- **Types + sample data** — define the core types (Item, etc.) and a small mock dataset conforming to them. The contract every other layer depends on.
- **App shell** — layout, theme, nav, mock surfaces rendering from sample data.
- **Data layer foundation** — schema designed to produce the contract types. [Skip if Database = None]
- **Agent capabilities (MCPs)** — install MCPs that match your stack. [Skip if simple project]

## Next (1-2 milestones away)
- **<First surface> (live data)** — swap mock import for live query.
- **<Second surface>** — extending the pattern.

## Later (3+ milestones away)
- **Mutations bundle** — turn read-only into write-capable: add/edit/delete/etc.
- **<Other surfaces>**
- **Auth & authorization** — Better Auth setup, sessions, login flow. [If Auth ≠ None]
- **Production polish** — SEO, OG images, analytics, error monitoring, accessibility audit.

## Shipped
(none yet — pre-launch)

## Recurring cadence
- Run audit pass (UI critique + accessibility) every 2 milestones.
- Run refactor scanner every 3 milestones.
- Bugfixes go on `fix/<slug>` branches, NOT in this roadmap.
```

## Stage 7 — Fill the templates

Now edit the freshly-installed files with the user's answers. **Edit in place — don't ask permission for each edit.** The user opted into this by running the skill.

Files to update, in priority order:

### `CLAUDE.md`
- Replace `{{Project Name}}` with the real name (multiple occurrences).
- Replace the one-line description with the user's tight version.
- Update the project layout if it's clearly different from the Next.js default.
- Leave the commands list alone unless the user specified a non-npm runtime.

### `docs/context/thesis.md`
- Replace `{{Project Name}}`, `{{Your Name}}`, `{{role}}`, `{{org}}` (ask if not obvious from context).
- Section 01 — fill thesis with user's "why" + "bet" answer.
- Section 04 — fill Laboratory with unfair-advantage answer.
- Section 05 — fill First Useful Product with v1-shippable answer.
- Section 12 — fill "This week's only job" from the first feature recommendation (Stage 8).

### `docs/context/project-overview.md`
- Top — product description, "Built for", v1 scope from user's answers.
- Tech stack table — update Framework, Database, ORM, Auth from Round 2.
- **§ Agent capabilities** (NEW SECTION) — add a subsection listing the MCPs installed from Stage 5. Format:
  ```markdown
  ## 🤖 Agent capabilities

  MCPs installed to enable agent-driven workflows:

  | MCP | Purpose |
  |---|---|
  | `neon` | DB introspection + query running |
  | `context7` | Up-to-date library docs |
  | `playwright` | Browser-driven testing |
  ```
- "What we're building → v1 surfaces" — populate from Round 4.
- "Definition of done for v1" — derive 3-5 concrete behaviors.

### `docs/context/roadmap.md`
- The roadmap drafted and approved in Stage 6 — write that content here. Don't re-edit; the user already approved it.

### `docs/context/coding-standards.md`
- If user picked defaults the file documents (Next.js + TS + Tailwind v4 + Drizzle), leave untouched.
- If "I'll add it later" for any of Database / ORM / Auth — strip specifics, replace with TBD note: "Database: TBD — pick when ready, then update this section."
- If specific different choice, replace relevant sections (Drizzle → Prisma section, etc.).
- Update opening starter-note to reflect actual chosen stack.

### `docs/specs/project-spec.md`
- Replace `{{Project Name}}` references.
- Section 2 (Data layer) — note the database choice but leave schema decisions as TODO.
- Section 3 (Auth) — note the provider, leave specifics TODO.

### `docs/context/current-feature.md`
- Leave Status/Goals/Notes empty (placeholder comments stay).
- Append a **History** entry: "**[today's date] — Project bootstrap.** Initialized via `/workflow-init`. Stack: {framework} + {database} + {orm} + {auth}. v1 surfaces: {list}. First feature target: {feature name} (see Stage 8). MCPs installed: {list}."

### `AGENTS.md` and `GEMINI.md`
- Replace `{{Project Name}}` with the real name.
- Replace the one-line description.
- Everything else stays.

## Stage 8 — Recommend a first feature

Pick the smallest thing that proves the product's core promise from the roadmap's "Now" milestones. Typically the first feature for "Types + sample data" if the project needs data, or the first content page for a static site.

For the proposed first feature:
- Pitch in 2-3 sentences. Say *why* it's the right first slice (proves which assumption, defers which complexity).
- Invoke the elaboration loop — user might counter-propose, ask for alternatives, or reject the framing.
- When settled, paraphrase: "So feature #1 is: <X>. The bet it tests: <Y>. What you're punting: <Z>."

Then ask:

> "Want me to `/feature spec` this now, or hold off?"

If yes, invoke `/feature spec`. If no, leave the recommendation as part of the history entry in `current-feature.md` and stop.

## Stage 9 — Hand off

End with a clear next-steps message:

```
You're set up.

• docs/context/ has 5 docs filled with your real context. Edit as you learn more.
• docs/context/roadmap.md has the proposed roadmap. Re-order, add, or remove as priorities shift.
• docs/context/screenshots/ is empty — drop visual references for features in subfolders matching the feature slug.
• Run `/feature spec` when you're ready to start the first feature.
• Run `/feature load <slug>` to load a spec.
• Run `/feature start` to cut the branch and start implementing.

Bug fixes go on `fix/<slug>` branches — NOT in the roadmap, NOT in current-feature.md history.

The full workflow is documented in docs/context/ai-interaction.md.
```

## Conflict handling

If the CLI exits non-zero with a conflict list during Stage 3, do not run the interview — the install didn't happen. Quote the conflict list back to the user and let them decide:
- Remove/rename the conflicting files, then re-run `/workflow-init`
- Or pick a fresh target directory

## If the user just wants the bare install

If the user explicitly says "skip the interview" or "just install the files," run Stage 3 only. Don't pester — they know what they want.

## If `npx` isn't available

Fall back to `npx github:DigitalOutbreak/workflow` (works via the GitHub form even on machines that haven't been logged into npm). If neither npx form works, suggest installing Node.js (https://nodejs.org/).
