---
name: workflow-init
description: Bootstrap a new Claude Code project with a guided discovery interview — installs the starter, fills in the strategy/overview/spec templates from the user's answers, then recommends a first feature to ship. Optional argument is the target directory; defaults to the current working directory.
argument-hint: [target-dir]
---

# Workflow Init

Two-stage initialization:

1. **Install** the starter files via `npx @digitaloutbreak/workflow-init` (templates, skills, agents).
2. **Interview + fill** — ask the user a handful of targeted questions, then write the answers into the template files so the project starts with real context, not placeholders.

Don't just dump templates and walk away. Most of the template files (thesis, overview, spec, CLAUDE.md) have `{{Placeholders}}` and `[Replace with...]` prompts — those need real content to be useful, and the user has the answers in their head right now. The interview surfaces them.

## Stage 1 — Install the files

Decide the target directory:

1. If `$ARGUMENTS` is provided → use it as the target path (relative paths resolved against the user's current working directory).
2. If `$ARGUMENTS` is empty → use the current working directory (`.`).

Sanity checks (same as before):
- If target doesn't exist, ask the user before creating it.
- If target is empty, the CLI installs cleanly — proceed.
- If target has files, the CLI will detect conflicts and abort — surface that, don't bypass.

Run the install:

```bash
npx @digitaloutbreak/workflow-init "$TARGET"
```

Quote the CLI's file list and next-steps output back to the user. Then tell them: **"Files are in. Let me ask you a few questions so we can fill them with real content instead of placeholders."**

## Stage 2 — Discovery interview

Use `AskUserQuestion` for structured choices, plain prose for open-ended ones. Run in rounds so the user isn't overwhelmed by a 10-question form. **One AskUserQuestion call per round** so the user can adjust mid-stream.

### Round 1 — Identity (required)

Before any AskUserQuestion, ask in prose:
- "What's the project's name?"
- "One sentence — what does it do?"
- "Who's the primary user? (you / a team / a customer / the public)"

Capture the answers verbatim. The one-sentence description is load-bearing — push back gently if they give you a paragraph and ask for the tightest version.

### Round 2 — Tech stack (AskUserQuestion)

Ask three multi-choice questions in a single AskUserQuestion call:

1. **Framework** — Next.js 16 (default) / SvelteKit / Astro / Other
2. **Database** — Postgres via Neon (default) / Postgres self-hosted / SQLite / None / Other
3. **Auth** — Better Auth (default) / Clerk / Auth0 / NextAuth / None yet / Other

Mark the defaults that match what the starter's `coding-standards.md` already documents — if they pick those, you skip the standards rewrite.

### Round 3 — Strategy (open-ended)

Ask in prose, briefly:
- "Why does this need to exist? In one or two sentences — the bet you're making."
- "What's your unfair advantage here? A first customer, deep expertise, access to data nobody else has, something you'll learn by doing it?"
- "What's the smallest thing that proves the bet? The v1 shippable."

If the user gives short or vague answers, prompt once for a more specific version — but don't grind. A thin thesis is OK; they'll sharpen it later.

### Round 4 — Surfaces (AskUserQuestion)

Based on the description, suggest 2-4 plausible v1 surfaces and ask the user to confirm/edit. Examples:
- For an inbox/triage product: Inbox · Contacts · Settings · Ask
- For a content tool: Editor · Library · Settings
- For a dashboard: Dashboard · Reports · Settings
- For a developer tool: CLI / Studio · Logs · Settings

Phrase as: "I'd suggest these surfaces for v1 — adjust as needed." Single-select isn't right here; use multiSelect with proposed surfaces + "let me describe them in my own words" fallback.

## Stage 3 — Fill the templates

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
- If the user picked Next.js + TS + Tailwind v4 (defaults), leave it untouched.
- If they picked something different, replace the relevant sections (TypeScript stays; React → adapt; Next.js → adapt to chosen framework; Tailwind v4 → adapt; Database → adapt).
- Update the opening starter-note to reflect the actual chosen stack.

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

## Stage 4 — Recommend a first feature

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

> "Want me to `/feature spec` this as your first feature now, or hold off?"

If they say yes, invoke `/feature spec` with a concise brief built from the recommendation. If they say no, just leave the recommendation as part of the history entry in `current-feature.md` and stop.

## Stage 5 — Hand off

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
