---
name: workflow-init
description: Bootstrap a new Claude Code project with a guided discovery interview — installs the starter, fills in the strategy/overview/spec templates from the user's answers, then recommends a first feature to ship. Optional argument is the target directory; defaults to the current working directory.
argument-hint: [target-dir]
---

# Workflow Init

End-to-end project bootstrap. In one flow:

1. **Pre-flight** — ask which scaffolder (Next.js + shadcn / Next.js only / Astro / none).
2. **Scaffold** (optional) — run the chosen `create-*` command, then `shadcn init` if applicable. Otherwise skip.
3. **Install** the starter files via `npx @digitaloutbreak/workflow-init` (CLAUDE.md, AGENTS.md, GEMINI.md, the five context docs, the spec, skills, agents).
4. **Interview + fill** — ask the user a handful of targeted questions with elaboration loops, then write the answers into the template files so the project starts with real context, not placeholders.
5. **Recommend a first feature** and optionally `/feature spec` it.

Don't just dump templates and walk away. Most of the template files (thesis, overview, spec, CLAUDE.md) have `{{Placeholders}}` and `[Replace with...]` prompts — those need real content to be useful, and the user has the answers in their head right now. The interview surfaces them.

## Stage 1 — Pre-flight

Decide the working location:

1. If `$ARGUMENTS` is provided → it's the **parent** directory (where the new project lives or will live).
2. If `$ARGUMENTS` is empty → use the current working directory as the parent.

Ask in three small steps — keeps each question under AskUserQuestion's 4-option limit and reaches every framework × shadcn combo.

### Step 1a — New project or existing? (AskUserQuestion, 2 options)

| Option | What runs |
|---|---|
| **Scaffold a new project** | Continue to Step 1b → 1c → Stage 2a |
| **Use existing project** | Skip scaffolding; install workflow files in the current dir (jump to Stage 2b) |

Frame: "How do you want to start?"

### Step 1b — Framework (AskUserQuestion, 4 options)

Only ask if Step 1a was "Scaffold a new project."

| Option | What runs (high-level) |
|---|---|
| **Next.js** *(recommended)* | `create-next-app` — TS + Tailwind + App Router + Turbopack |
| **Astro** | `npm create astro` (minimal, strictest TS) + `astro add tailwind` |
| **SvelteKit** | `npx sv create` (minimal, TS) + `sv add tailwindcss` |
| **TanStack Start** | `npx create-tsrouter-app` with Start + Tailwind add-ons |

Frame: "Which framework?" — recommend Next.js as the default for new React UI projects.

### Step 1c — Add shadcn? (AskUserQuestion, 2 options)

Only ask after a framework is chosen.

| Option | What runs |
|---|---|
| **Yes** | After the framework scaffolds, run `shadcn init` (or `shadcn-svelte init` for SvelteKit). For Astro, also add `react` integration first. |
| **No** | Skip shadcn — bring your own UI lib |

Frame contextually based on the chosen framework:
- **Next.js / TanStack Start**: "Add shadcn for UI components? (Recommended — most React + Tailwind projects use it.)"
- **Astro**: "Add shadcn for React UI islands? (Optional — useful for interactive components on a content site.)"
- **SvelteKit**: "Add shadcn-svelte for UI components? (Community port of shadcn for Svelte.)"

### Branch summary

After all three steps, the combinations are:

| Choice | Path |
|---|---|
| Existing project | → Stage 2b directly |
| Next.js (± shadcn) | → Stage 2a (Next.js scaffold ± shadcn) → Stage 2b |
| Astro (± shadcn) | → Stage 2a (Astro scaffold + tailwind ± react + shadcn) → Stage 2b |
| SvelteKit (± shadcn-svelte) | → Stage 2a (SvelteKit scaffold + tailwind ± shadcn-svelte) → Stage 2b |
| TanStack Start (± shadcn) | → Stage 2a (TanStack Start scaffold ± shadcn) → Stage 2b |

## Stage 2a — Scaffold

Only run this if the user picked a scaffolding option (not "existing project").

### 1. Project name

Ask in prose: "What should we name the project? (lowercase, hyphens — this becomes the directory name and the `name` field in `package.json`)."

Invoke the elaboration loop if the user wants to brainstorm names. Once settled, paraphrase: "So the project name is `<name>` — directory will be `<parent>/<name>`. Sound good?"

### 2. Run the scaffolder

Pick the command set based on the user's Stage 1 choice.

**For Next.js (with or without shadcn):**

```bash
cd "$PARENT" && npx create-next-app@latest <name> \
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

If they picked **Next.js + shadcn**, follow up with:

```bash
cd "$PARENT/<name>" && npx shadcn@latest init --yes --base-color zinc
```

Zinc is a neutral default. If the user has a strong preference (slate / stone / gray / neutral / red / etc.), ask which they prefer before running shadcn.

**For Astro:**

```bash
cd "$PARENT" && npm create astro@latest <name> -- \
  --template minimal \
  --typescript strictest \
  --install \
  --no-git \
  --yes

cd "$PARENT/<name>" && npx astro add tailwind --yes
```

(Astro doesn't ship ESLint as a default convention — `astro check` is the type checker and Prettier handles formatting. If the user wants ESLint, they can `npm i -D eslint` later. Tailwind is added explicitly because no Astro template includes it by default.)

If they picked **Astro + shadcn**, follow up with the React integration *first* (shadcn requires React in Astro):

```bash
cd "$PARENT/<name>" && npx astro add react --yes
cd "$PARENT/<name>" && npx shadcn@latest init --yes --base-color zinc
```

**For SvelteKit:**

```bash
cd "$PARENT" && npx sv create <name> \
  --template minimal \
  --types ts \
  --add-ons eslint,prettier,tailwindcss \
  --install npm \
  --no-git
```

(Adds the SvelteKit-recommended defaults: ESLint, Prettier, Tailwind. The `sv create` CLI handles all three as add-ons in one shot — no separate `sv add` step needed.)

If they picked **SvelteKit + shadcn-svelte**, follow up:

```bash
cd "$PARENT/<name>" && npx shadcn-svelte@latest init --base-color zinc
```

(Note: `shadcn-svelte` is the community Svelte port of shadcn, not the official `shadcn` CLI — different package.)

**For TanStack Start:**

```bash
cd "$PARENT" && npx create-tsrouter-app@latest <name> \
  --add-ons start,tailwind,eslint,prettier \
  --package-manager npm
```

(Includes TanStack's recommended add-ons: Start SSR + Tailwind + ESLint + Prettier.)

If they picked **TanStack Start + shadcn**:

```bash
cd "$PARENT/<name>" && npx shadcn@latest init --yes --base-color zinc
```

(TanStack Start is React under the hood, so the official shadcn CLI works directly.)

CLI flag names occasionally shift between versions across all four scaffolders. If a flag is rejected, drop the offending flag and re-run rather than tweaking endlessly — the defaults are reasonable.

Surface the output as each command runs. Wait for completion.

If the user wants different framework defaults (eslint, pnpm, alternative template, etc.), ask once and adjust. Don't paste a long config interview at them — keep defaults sensible, only ask if they push back.

### 3. Clear scaffolder-generated agent files (AGENTS.md / CLAUDE.md / GEMINI.md)

Some scaffolders (notably `create-next-app` ≥ v15) now generate their own `AGENTS.md` as part of the recommended defaults. **We always want our version** — that's the whole point of the workflow starter, and the scaffolder's version doesn't reference the `docs/context/*` structure.

Before Stage 2b, scrub any agent files the scaffolder may have dropped:

```bash
cd "$PARENT/<name>" && rm -f AGENTS.md CLAUDE.md GEMINI.md
```

Don't ask the user about this — it's a structural fix, not a preference. The workflow-init CLI then installs the canonical versions in Stage 2b.

### 4. Set the target

The workflow target is now `$PARENT/<name>`. Set `$TARGET` to that absolute path for Stage 2b.

### What if scaffolding fails?

If any command errors (network blip, flag mismatch in a newer version of the scaffolder, etc.), stop the flow. Report the error verbatim. Offer:

- **Retry** (most failures are transient)
- **Drop the failing step** (e.g., scaffold succeeded but shadcn init failed → continue with workflow install in the partly-scaffolded project)
- **Skip scaffolding entirely** and continue with workflow install only in the parent dir
- **Abort**

Don't silently continue past a failed scaffold.

## Stage 2b — Install the workflow files

Sanity checks:
- If target doesn't exist, ask the user before creating it.
- If target is empty (or just scaffolded), the CLI installs cleanly — proceed.
- If target has files unrelated to scaffolding, the CLI will detect conflicts and abort — surface that, don't bypass.

Run the install:

```bash
npx @digitaloutbreak/workflow-init "$TARGET"
```

Quote the CLI's file list and next-steps output back to the user. Then tell them: **"Files are in. Let me ask you a few questions so we can fill them with real content instead of placeholders."**

## Stage 3 — Discovery interview

Use `AskUserQuestion` for structured choices, plain prose for open-ended ones. Run in rounds so the user isn't overwhelmed by a 10-question form. **One AskUserQuestion call per round** so the user can adjust mid-stream.

### Elaboration loops — the universal rule for prose rounds

Planning even a simple product is a back-and-forth. After the user's first answer to ANY prose question (Round 1, Round 3, or any future prose round), do not race to the next question. Ask:

> "Want to dig into that more, refine it, or are you good to move on?"

Then **listen**. The user has three modes here:

1. **"Move on"** (explicit or implicit "yes/next/that's it") → record their answer verbatim, move to the next question.
2. **"Let me think out loud"** → engage. Ask follow-ups, mirror back what you heard, propose tighter phrasings if they're circling, point out tensions ("you said X but also Y — which one's load-bearing?"). Stay in this mode until they say move on.
3. **"Help me figure it out"** → make a recommendation. Pull from what they've already told you about the product, the primary user, the unfair advantage. Offer 2-3 framings and ask which lands. If they reject all, ask what's wrong with each — that reveals what they actually want.

When you finally capture the answer, **paraphrase back in one sentence** and confirm before recording it. "So you'd say: <X>. Sound right?" If they tweak, accept the tweak and move on.

Don't gate the elaboration loop behind AskUserQuestion — it's natural prose. AskUserQuestion is for clearly bounded choices (stack, surfaces). Strategy/identity/recommendations are conversation, not multiple choice.

### Round 1 — Identity (required, may iterate)

Ask in prose, one question at a time (not all at once):
- "What's the project's name?" *(skip if already captured in Stage 2a)*
- "One sentence — what does it do?"
- "Who's the primary user? (you / a team / a customer / the public)"

For each: ask → get the first answer → invoke the elaboration loop. The one-sentence description is the most worth iterating on — if they give you a paragraph, work with them to compress it. Tight description compounds across every doc the starter writes.

### Round 2 — Tech stack (AskUserQuestion)

If Stage 2a scaffolded a project, **skip the framework question** — you already know it's Next.js, Astro, SvelteKit, or TanStack Start. Just ask the rest.

Otherwise ask via AskUserQuestion (one question per layer, so the user can adjust). Group them as 4 separate questions in a single AskUserQuestion call. Each question maxes out at 4 options (the AskUserQuestion limit); anything else surfaces via the auto-added "Other" choice.

**For Framework, the default is real — `create-next-app` runs in Stage 2a.** For the other three, default to "I'll add it later" since the skill records the choice but doesn't actually install the DB/ORM/Auth. Users who want the starter's recommended stack (Drizzle + Better Auth + Postgres Neon) can pick it explicitly in one click; the "recommended" hint is visible on each.

1. **Framework** — Next.js 16 *(default — scaffolded)* / Astro / SvelteKit / TanStack Start
2. **Database** — I'll add it later *(default)* / Postgres via Neon *(recommended)* / SQLite / None
3. **ORM** — I'll add it later *(default)* / Drizzle *(recommended)* / Prisma / None
4. **Auth** — I'll add it later *(default)* / Better Auth *(recommended)* / Clerk / None

The semantic distinction for the last three questions:
- **"I'll add it later"** = "I want one, just haven't decided / not setting it up right now." The starter docs stay generic; the user picks specifics in a future feature spec.
- **"None"** = "I don't need this layer at all." E.g., a static content site doesn't need a DB → also doesn't need an ORM → likely doesn't need auth either.

**Skip the ORM question entirely** if the user picked "None" for Database — there's nothing to ORM against. In that case, ask just Framework + Database + Auth (3 questions). If they picked "I'll add it later" for Database, still ask the ORM question — they might know which ORM they want even before the DB is picked.

**ORM/Database pairings worth noting** (in case the user wants Claude to comment):
- Postgres + Drizzle — what `coding-standards.md` documents; lightweight, edge-friendly
- Postgres + Prisma — more opinionated, larger client, popular for teams
- SQLite + Drizzle — works great for local-first / edge apps
- SQLite + Prisma — fine but heavier than Drizzle here
- None — covered for static sites / pure frontends / Astro content sites

Mark the defaults that match what the starter's `coding-standards.md` already documents — if they pick those, you skip the standards rewrite. (No elaboration loop needed here — these are discrete picks. If the user wants to talk through tradeoffs, they will, and you respond in prose.)

### Round 3 — Strategy (open-ended, expect iteration)

This round will be the longest. Strategy is where the product gets sharpened, and the elaboration loop is the whole point. Ask in prose, ONE QUESTION AT A TIME, with the elaboration loop after each:

- **"Why does this need to exist? In one or two sentences — the bet you're making."**
  → Then loop. Push for specificity. "The bet" should be a falsifiable belief, not a vague aspiration. If they say "people need better X," ask "*which* people, and what's the evidence they're underserved?"

- **"What's your unfair advantage here?"**
  → Then loop. Probe: first customer, deep expertise, access to data, time to experiment, an internal use case you're already living. If they don't have one, that's important to surface — the thesis template's "Laboratory" section will read differently.

- **"What's the smallest thing that proves the bet?"**
  → Then loop. This is the v1 shippable. If they describe a feature-rich app, narrow them down. "If you could only ship ONE screen / surface / endpoint and it would have to prove the bet, what would it be?" The thesis memo's "Daily Brief" pattern is the model — ugly, useful, shippable in a week.

A thin thesis is still OK — you've offered the iteration; if they don't want it, move on. The point is to *make the depth available*, not to force it.

### Round 4 — Surfaces (AskUserQuestion + elaboration if needed)

Based on the description, suggest 2-4 plausible v1 surfaces and ask the user to confirm/edit. Examples:
- For an inbox/triage product: Inbox · Contacts · Settings · Ask
- For a content tool: Editor · Library · Settings
- For a dashboard: Dashboard · Reports · Settings
- For a developer tool: CLI / Studio · Logs · Settings

Phrase as: "I'd suggest these surfaces for v1 — adjust as needed." Use multiSelect with proposed surfaces + "let me describe them in my own words" fallback. If they pick the fallback or push back on the proposed set, drop into the elaboration loop and work out the right list together.

## Stage 4 — Fill the templates

Now edit the freshly-installed files with the user's answers. **Edit in place — don't ask permission for each edit.** The user already opted into this by running the skill.

Files to update, in priority order:

### `CLAUDE.md`
- Replace `{{Project Name}}` with the real name (multiple occurrences).
- Replace the one-line description with the user's tight version.
- Update the project layout if it's clearly different from the Next.js default.
- Leave the commands list alone unless the user specified a non-npm runtime.

### `docs/context/thesis.md`
- Replace `{{Project Name}}`, `{{Your Name}}`, `{{role}}`, `{{org}}` (ask if not obvious from context).
- Section 01 — fill the thesis sentence with the user's "why" + "bet" answer.
- Section 04 — fill The Laboratory with the user's unfair advantage answer.
- Section 05 — fill First Useful Product with the v1 shippable answer.
- Leave sections 02 (moat table), 06-10 (positioning, big players, architecture, technical, roadmap) as scaffolding for the user to fill in later — they're harder to answer cold.
- Section 11 (failure modes) — keep the generic list, add 1-2 project-specific failure modes if obvious.
- Section 12 — fill "This week's only job" with a one-liner derived from the first feature recommendation (Stage 4).

### `docs/context/project-overview.md`
- Top — Product description, "Built for", v1 scope, productize trigger from the user's answers.
- Tech stack table — update Framework, Database, Auth based on Round 2 answers.
- "What we're building → v1 surfaces" — populate the table with the surfaces from Round 4.
- "Definition of done for v1" — derive 3-5 concrete behaviors from the v1 shippable answer.
- Leave the diagrams as-is; they'll be edited as the project takes shape.

### `docs/context/coding-standards.md`
- If the user picked the defaults the file documents (Next.js + TS + Tailwind v4 + Drizzle), leave it untouched.
- If they picked **"I'll add it later"** for any of Database / ORM / Auth — strip the specifics from those sections and replace with a TBD note: "Database: TBD — pick when ready, then update this section." Same shape for ORM, Auth. This keeps the file honest about what's actually decided.
- If they picked a different specific choice, replace the relevant sections:
  - **TypeScript** — stays (universal)
  - **React** — adapt to Svelte / Astro components if not React-based
  - **Next.js** — adapt to chosen framework (Astro / SvelteKit / TanStack Start)
  - **Tailwind v4** — stays (it's in every scaffold path)
  - **Database/ORM** — replace Drizzle paragraph with the chosen ORM's conventions (Prisma migrations vs Drizzle `drizzle-kit`, etc.)
- Update the opening starter-note to reflect the actual chosen stack (e.g., `Next.js + TS + Tailwind v4 + TBD database`).

### `docs/specs/project-spec.md`
- Replace `{{Project Name}}` references.
- Section 2 (Data layer) — note the database choice but leave schema decisions as TODO.
- Section 3 (Auth) — note the provider, leave specifics TODO.
- This file is the source of truth; it's OK to leave most of it as scaffolding. The user fills it in as decisions are made.

### `docs/context/current-feature.md`
- Leave the working file's Status/Goals/Notes empty (placeholder comments stay).
- Append a **History** entry at the bottom: "**[today's date] — Project bootstrap.** Initialized via `/workflow-init`. Stack: {framework} + {database} + {auth}. v1 surfaces: {list}. First feature target: {feature name} (see Stage 4)."

### `AGENTS.md`
- Replace `{{Project Name}}` with the real name.
- Replace the one-line description.
- Everything else stays.

### `GEMINI.md`
- Replace `{{Project Name}}` with the real name.
- Replace the one-line description.
- Everything else stays. (Same content as AGENTS.md, addressed to Gemini-based agents.)

## Stage 5 — Recommend a first feature

Now propose what to ship first. Pick the smallest thing that proves the product's core promise — the "Daily Brief" pattern from the source thesis is the right shape:

> The smallest version of the most valuable thing, ugly is fine, shippable in a week.

Look at the user's answers and synthesize. Examples:

| If the project is... | First feature might be... |
|---|---|
| An inbox/triage product | A read-only inbox feed with mock data — no dedup, no mutations |
| A content/editor tool | A single editable document with autosave — no library, no auth |
| A dashboard product | One KPI card pulling from one data source — no filters, no auth |
| A scheduling product | A single weekly view rendering hardcoded events — no inputs |
| A CLI tool | One subcommand with a happy-path implementation — no flags, no config |

Pitch the recommendation in 2-3 sentences. Say *why* it's the right first slice (proves which assumption, defers which complexity). Then ask:

> "Does that feel right, or want to talk through it / try a different cut?"

Invoke the elaboration loop here too — first features are worth refining. The user might:
- **Accept** → move on to the next prompt below.
- **Counter-propose** → engage. "You're thinking X instead? Walk me through why — what's the assumption that's worth testing first?" Iterate until you both agree.
- **Ask for alternatives** → offer 2-3 honest options with the tradeoff for each ("this proves X but punts Y; this proves Y but you need Z first"). Let them pick.
- **Reject the framing** → that's useful signal. Maybe you misread the product. Go back to Round 3 if needed.

When the first feature is settled, paraphrase it back ("So feature #1 is: <X>. The bet it tests: <Y>. What you're punting: <Z>.") and ask:

> "Want me to `/feature spec` this now, or hold off?"

If they say yes, invoke `/feature spec` with a concise brief built from the recommendation. If they say no, just leave the recommendation as part of the history entry in `current-feature.md` and stop.

## Stage 6 — Hand off

End with a clear next-steps message:

```
You're set up.

The five context docs are filled in — open and edit as you learn more.
Run `/feature spec` whenever you're ready to start the first feature.
Run `/feature load <slug>` to load a spec.
Run `/feature start` to cut the branch and start implementing.

The full workflow is documented in docs/context/ai-interaction.md.
```

## Conflict handling

If the CLI exits non-zero with a conflict list, do not run the interview — the install didn't happen. Quote the conflict list back to the user and let them decide:
- Remove/rename the conflicting files, then re-run `/workflow-init`
- Or pick a fresh target directory

## If the user just wants the bare install

If the user explicitly says "skip the interview" or "just install the files," do Stage 1 and stop. Don't pester them — they know what they want.

## If `npx` isn't available

Fall back to `npx github:DigitalOutbreak/claude-workflow-starter` (works via the GitHub form even on machines that haven't been logged into npm). If neither npx form works, suggest they install Node.js (https://nodejs.org/).
