# Complete Action

1. Stage all changes and commit with a descriptive message
2. Switch to main and merge the feature branch (no push yet)
3. Delete the local feature branch
4. Reset current-feature.md:
   - Change H1 back to `# Current Feature`
   - Clear Goals and Notes sections (keep placeholder comments)
   - Add feature summary to the END of History
5. Update `docs/context/backlog.md` (REQUIRED — do not skip):
   - **Read the feature spec's `Out of scope` / `Notes` sections** and any "deferred" / "out of scope" callouts you wrote inside the new history entry. For each one, decide whether it's worth tracking:
     - **Add to backlog** if it's a tactical follow-up someone should remember (a feature toggle to flip later, a small infra improvement, a UI rename, a sub-feature explicitly punted to a later phase). Use the existing backlog entry template: **What** / **Why deferred** / **Noted in** (cite the new history entry by date + name).
     - **Skip backlog** if it's already covered in `roadmap.md` or `project-overview.md`'s v2 roadmap (those live in their own homes), or if it's truly trivial/won't-do.
   - **Remove from backlog** any entries this feature actually shipped. Don't let stale items linger.
   - **If the spec was promoted from a backlog item** (referenced in its `## References > ### Backlog` section), REMOVE that backlog item — it's now shipped.
   - Choose the right category section (Performance & infra · Mutations · Sidebar polish · UI labels · Contacts surface · Auth & tenancy · Data pipelines · Product surfaces v2+ · Observability — add a new section only if nothing fits).
   - Update the "Last updated:" line at the top of `backlog.md`.

6. Update `docs/context/roadmap.md` (if it exists and the spec references a roadmap milestone):
   - **Read the feature spec's `## References > ### Roadmap` section.** If the section doesn't exist or has no `Part of:` link, **skip this step entirely** — don't touch roadmap.md.
   - **Extract the milestone name** from the `Part of:` line. Example: `Part of: [Phase 1 — Inbox MVP](../roadmap.md)` → milestone name is `Phase 1 — Inbox MVP`.
   - **Count remaining feature specs targeting that milestone.** Run this from the project root:
     ```bash
     grep -l "Part of:.*<milestone-name>" docs/context/features/*-spec.md \
       | grep -v "<current-spec-slug>" \
       | wc -l
     ```
     (Quote the milestone name if it contains spaces or special chars. The `grep -v` excludes the spec just completed.)
   - **Find current phase** of the milestone in roadmap.md (`## Now`, `## Next`, `## Later`).
   - **Decide the next state from the count:**
     - **Count > 0 AND milestone is in "Now"** → More specs left, leave the milestone where it is. No change to roadmap.md.
     - **Count > 0 AND milestone is in "Next"** → First feature of a "Next" milestone shipped. Ask: "This was the first feature of *<milestone>*. Mark it as moved from Next → Now in the roadmap?"
     - **Count = 0** → This was the last spec for the milestone. Ask: "This completes *<milestone>*. Move it to `Shipped` with today's date?"
       - If yes, also ask: "Promote the top milestone from Next → Now to fill the gap?"
   - **Edit roadmap.md** based on the user's confirmation. When moving to Shipped, format the entry:
     ```markdown
     ## Shipped
     - **2026-05-27** — <milestone name> ([spec1](features/spec1-spec.md), [spec2](features/spec2-spec.md))
     ```

7. Commit the reset + backlog + roadmap updates in a single commit: `chore: reset current-feature.md + update backlog + roadmap after completing [feature]`
8. Push main to origin ONCE (single push with all changes)
9. If feature branch was previously pushed, delete it from origin

## Why step 5 is required

Before this hard-wiring, deferred items lived only in the prose of each history entry — discoverable but scattered, and easy to forget when planning the next slice. The backlog is the single source of truth for "what's pending"; it stays accurate only if every `/feature complete` updates it.

If the feature deferred nothing AND resolved nothing from backlog, still update the "Last updated:" date so it's clear the doc was reviewed.
