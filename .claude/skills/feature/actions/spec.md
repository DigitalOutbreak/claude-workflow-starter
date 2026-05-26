# Spec Action

Authors a new feature or fix spec at `docs/context/features/<slug>-spec.md` (or `docs/context/fixes/<slug>-spec.md`) via a short discovery interview, in the exact shape the existing specs in `docs/context/features/` use. Does NOT touch `current-feature.md` — that's `load`'s job. After saving, point the user at `/feature load <slug>-spec`.

## Steps

1. **Parse $ARGUMENTS** (text after `spec`):
   - If it looks like a short slug or topic phrase (`dashboard-phase-4`, `inbox mutations`, `webhook hmac`), use it to seed the topic for the interview.
   - If it starts with `fix:` or `feature:`, take that as the kind and the rest as the topic.
   - If empty, ask conversationally: "What's the spec about — give me the gist in a sentence."

2. **Classify (only if not already implied by $ARGUMENTS).** Ask via `AskUserQuestion`: feature vs fix. This decides the target directory:
   - `feature` → `docs/context/features/`
   - `fix` → `docs/context/fixes/` (create with `mkdir -p` if missing)

3. **Discovery interview.** Ask these in plain chat — one prompt at a time, freeform answers, **NOT** `AskUserQuestion` (the inputs are open-ended). Keep each question to one or two sentences. Wait for each answer before asking the next. The user may answer `skip` or `nothing` for any question — drop that section from the draft.

   1. **Overview.** "In one short paragraph: what are we building/fixing, and why does it matter now?" → `## Overview`
   2. **Requirements.** "What must be true when this ships? Bullets are fine — include file paths, library/driver choices, behavior, and any hard constraints." → `## Requirements`
   3. **Out of scope / non-goals.** "What are we explicitly NOT doing in this slice? (Anything deferred, anything tempting that we're consciously skipping.)" → folded into `## Notes` as scope-cutout bullets
   4. **References.** "Which existing files, specs, components, screenshots, or external docs should the implementer read or build on?" → `## References`
   5. **Notes / gotchas.** "Anything else: constraints, performance targets, footguns to avoid, patterns to preserve, env or migration considerations?" → merged into `## Notes`

   If the user's first reply already hands you most of this (e.g. they pasted a long description), skip the questions they've already answered — only ask for what's actually missing.

4. **Pick the title and slug.**
   - Title: short, title-case, no trailing "Spec" (e.g. `Inbox: Real Data`, `Workspace Switcher Wiring`, `Fix Duplicate Contact Race`).
   - Slug: lower-kebab of the title, then suffixed with `-spec.md` (e.g. `inbox-real-data-spec.md`). The slug is what `/feature load` will be called with later.

5. **Draft the spec** in this exact shape — matches existing specs like `database-spec.md` and `inbox-real-data-spec.md`:

   ```markdown
   # <Title> Spec

   ## Overview

   <prose from Q1>

   ## Requirements

   - <bullets from Q2>

   ## References

   - <bullets from Q4>

   ## Notes

   - <non-goal bullets from Q3, prefixed with **Out of scope:** where helpful>
   - <gotcha bullets from Q5>
   ```

   Style rules (match the existing specs):
   - Inline-link other specs with relative paths: `` [`database-spec.md`](./database-spec.md) ``.
   - Bare paths for code references (`lib/db/queries/inbox.ts`, `components/inbox/inbox-row.tsx`), no backticks-only — wrap in backticks.
   - Screenshots: full path from repo root (`docs/context/screenshots/...`).
   - External URLs: bare `https://...`.
   - Bold the lead clause of a Notes bullet when it's a directive: `**Active workspace is hardcoded to WoD for this phase.**`
   - Sections that ended up empty (user said `skip`) are omitted entirely — do **not** leave bare headings.

6. **Show the draft inline in chat**, then `AskUserQuestion`: **Save** / **Revise** / **Discard**.
   - **Save** → `Write` the file to the resolved path. Print:
     ```
     Saved: docs/context/<features|fixes>/<slug>-spec.md
     Next:  /feature load <slug>-spec
     ```
   - **Revise** → ask which section to change, regenerate just that section, then re-show + re-prompt.
   - **Discard** → say so and stop. Do not write the file.

7. **Do NOT touch `current-feature.md`.** No status change, no goals update, no branch creation. The spec file stands alone until the user runs `/feature load <slug>-spec`.

## Guardrails

- If the resolved spec path already exists, do not overwrite silently. Show the existing content and ask: **Overwrite** / **New slug** / **Cancel**.
- Never invent references the user didn't supply. If a section is thin, leave it thin — the user can flesh it out on revise.
- This action is read-mostly; the only filesystem write is the final spec file (and `mkdir -p docs/context/fixes/` if it's a fix and the dir is missing).
