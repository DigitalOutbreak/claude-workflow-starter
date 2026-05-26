# Spec Action

Authors a new feature or fix spec at `docs/context/features/<slug>-spec.md` (or `docs/context/fixes/<slug>-spec.md`) via a short discovery interview, in the exact shape the existing specs in `docs/context/features/` use. Does NOT touch `current-feature.md` — that's `load`'s job. After saving, point the user at `/feature load <slug>-spec`.

## Steps

0. **Read roadmap and backlog silently** (no output to user yet).
   - Read `docs/context/roadmap.md` if it exists. Note the milestones in `Now` / `Next` / `Later`.
   - Read `docs/context/backlog.md` if it exists. Note categories + items.
   - These are reference material for step 4 below. Don't mention them yet.

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
   4. **References — code & design.** Ask both parts in one question; if the user only answers one, prompt for the other before moving on:
      - **Code & docs** — "Which existing files, specs, components, or external docs should the implementer read or build on?"
      - **Design** — "Got any visual references? Screenshots, Figma URLs, Linear tickets, Notion pages, Loom videos — anything that shows what this should look or feel like. If you have screenshots to drop in, I'll create `docs/context/screenshots/<slug>/` so they live next to the spec."

      → `## References` (code/docs as flat bullets) + `### Design references` subheading (Figma/Linear/Notion URLs + screenshot folder path, if any)
   5. **Notes / gotchas.** "Anything else: constraints, performance targets, footguns to avoid, patterns to preserve, env or migration considerations?" → merged into `## Notes`

   If the user's first reply already hands you most of this (e.g. they pasted a long description), skip the questions they've already answered — only ask for what's actually missing.

   **After Q1 (overview), match against roadmap + backlog from step 0:**

   - **Roadmap match** — if the feature description aligns with a milestone in `roadmap.md` (any phase), surface it: "This looks like part of *<milestone name>* from your roadmap. Link it as `Part of: <milestone>` in the spec?" → user picks yes/no.
   - **Backlog match** — if the feature description aligns with a specific deferred item in `backlog.md`, surface it: "This looks like the *<item name>* backlog item. Promote it to a spec? (I'll remove it from backlog.md when this feature completes.)" → user picks yes/no.
   - **No match** — don't pester. Just continue.
   - **Confidence threshold** — only suggest a link if you're reasonably sure it matches. If multiple roadmap items partially match, ask which one (or "neither").
   - **No roadmap match for new feature** — if the user describes work that's NOT on the roadmap and `Now` has space, gently ask: "This isn't on the current roadmap. Should it be? Which phase fits — Now, Next, or Later?" The agent doesn't auto-add to roadmap; the user decides.

   If a roadmap/backlog link was confirmed, include it in the spec's References section under a `### Roadmap` or `### Backlog` heading.

   **If the user said yes to screenshots in Q4**, create the directory before drafting the spec so the path in `### Design references` actually exists:

   ```bash
   mkdir -p docs/context/screenshots/<slug>
   ```

   The user can drop files in any time after — they don't have to be present when the spec is written. The directory's existence is the cue.

   **If the user pasted Figma / Linear / Notion URLs**, list them as bare URLs in the spec's `### Design references` section. The agent may, at `/feature start` time, use the Figma MCP (if installed) to pull design context from those URLs — but the spec just captures the link, no MCP calls during spec authoring.

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

   - <code & docs bullets from Q4 part 1>

   ### Design references
   <only include this subheading if the user provided design refs in Q4 part 2>
   - Screenshots: `docs/context/screenshots/<slug>/` (drop files here)
   - Figma: https://figma.com/file/...
   - Linear: https://linear.app/...
   - Notion: https://notion.so/...
   - Loom: https://loom.com/share/...

   ### Roadmap
   <only include this subheading if the user confirmed a roadmap link in step 3>
   - Part of: [<milestone name>](../roadmap.md)

   ### Backlog
   <only include this subheading if the user confirmed a backlog promotion in step 3>
   - Promoted from: <backlog item name> (entry from <date>)

   ## Notes

   - <non-goal bullets from Q3, prefixed with **Out of scope:** where helpful>
   - <gotcha bullets from Q5>
   ```

   **Critical:** the `### Roadmap` and `### Backlog` subheadings live INSIDE `## References` and are what `/feature complete` greps for when deciding whether to update roadmap.md or remove a backlog item. If you flatten them into the top-level References bullets, the post-ship automation will silently fail to find them.

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
     <if screenshots dir was created>
     Screenshots: docs/context/screenshots/<slug>/ (drop files here when ready)
     </if>
     Next:  /feature load <slug>-spec
     ```
   - **Revise** → ask which section to change, regenerate just that section, then re-show + re-prompt.
   - **Discard** → say so and stop. Do not write the file. If a screenshots directory was created and is still empty, remove it on discard so we don't leave orphan dirs.

7. **Do NOT touch `current-feature.md`.** No status change, no goals update, no branch creation. The spec file stands alone until the user runs `/feature load <slug>-spec`.

## Guardrails

- If the resolved spec path already exists, do not overwrite silently. Show the existing content and ask: **Overwrite** / **New slug** / **Cancel**.
- Never invent references the user didn't supply. If a section is thin, leave it thin — the user can flesh it out on revise.
- This action is read-mostly; the only filesystem writes are:
  - The final spec file
  - `mkdir -p docs/context/fixes/` if it's a fix and the dir is missing
  - `mkdir -p docs/context/screenshots/<slug>/` if the user confirmed design refs in Q4 (removed on Discard if still empty)
