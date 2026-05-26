# Roadmap

What's coming, in roughly what order. Living document — items move through phases as they ship.

> **`/workflow-init`** drafts this file on initial setup based on your stack and product description. Re-order, add, or remove milestones any time. **Bug fixes go on `fix/<slug>` branches — NOT in this roadmap.**

## Reasoning

<!-- 2-3 sentences explaining why the milestones are ordered this way. Filled in
during `/workflow-init`. Examples of reasoning to capture:
  - "Schema decisions are hard to undo; pixels are easy — so data layer + types
    come before any UI polish."
  - "Read patterns inform write patterns; mutations bundle deferred until reads
    work end-to-end."
  - "Internal/seeded data before real webhooks — buy yourself feedback time
    before committing to scale."
-->

## Now (parallel tracks — start in any order)

<!-- 1-3 milestones currently in progress. Each is a multi-week / multi-feature
chunk. Items here have a roadmap link in their feature specs. -->

- **<Milestone>** — 1-sentence description.

## Next (1-2 milestones away)

<!-- Milestones that start as soon as "Now" items wrap. Should be 2-4 items. -->

- **<Milestone>** — what + why. Trigger to start: "when X happens."

## Later (3+ milestones away)

<!-- Milestones planned but not actively prepped for. Order may shift. -->

- **<Milestone>** — what + why.

## Shipped

<!-- Milestones that completed. Add the date and link to the feature specs that
made it real. Living history, accumulated as `/feature complete` runs. -->

- **<Milestone>** (YYYY-MM-DD) — features: [spec-1] · [spec-2]

## Recurring cadence

<!-- Things to do on a schedule, not as one-off milestones. -->

- Run audit pass (UI critique + accessibility) every 2 milestones.
- Run refactor scanner every 3 milestones.
- Bugfixes go on `fix/<slug>` branches — NOT in this roadmap.

## Relationship to other docs

- **[thesis.md](./thesis.md)** — why this product exists. Roadmap milestones should ladder back to the thesis.
- **[project-overview.md](./project-overview.md)** — current scope. Updates as roadmap milestones move to Shipped.
- **[features/*-spec.md](./features/)** — each roadmap milestone decomposes into 3-10 feature specs. Specs link back to their roadmap milestone in their References section.
- **[backlog.md](./backlog.md)** — tactical deferrals from shipped specs. Smaller than roadmap items. When a backlog item gets picked up, it becomes a feature spec under whatever roadmap milestone it fits.
