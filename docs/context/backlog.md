# Backlog

Consolidated list of items that have been **explicitly deferred from a shipped feature**, with the reasoning and the history entry where the punt was made.

This is not the full v2 roadmap — that lives in [`project-overview.md`](./project-overview.md) (§ Phased Roadmap). This doc bridges tactical deferrals: things we decided NOT to do inside a shipped PR, that someone should later remember to pick up.

When something here gets picked up:
1. Move the relevant requirements into a feature spec (`docs/context/features/<slug>-spec.md`).
2. Delete the entry from this list.

Last updated: {{YYYY-MM-DD}} (initial — empty)

---

## How to add an entry

Each entry uses this template:

```markdown
### {{Short title}}
- **What**: [Concrete description of the deferred work — paths, behaviors, contracts.]
- **Why deferred**: [The reason it didn't ship with the parent feature — usually "scope," "needs separate review pass," "depends on infrastructure we don't have yet," etc.]
- **Noted in**: [Which history entry — date + feature name.]
- **Pairs with**: [Optional — other backlog items it should ship alongside.]
```

Group entries under one of these category headings (add new categories sparingly):

- `## Performance & infra`
- `## Mutations`
- `## Auth & tenancy`
- `## UI labels & polish`
- `## Sidebar polish` *(rename or remove if not applicable to your project)*
- `## [Primary surface] polish` *(e.g., `## Contacts surface`, `## Editor surface`)*
- `## Data pipelines & integrations`
- `## Product surfaces (v2+)`
- `## Observability`

---

<!-- Categories below — delete the ones you don't need yet. Add entries under the relevant section. -->

## Performance & infra

<!-- e.g. caching pass, query batching, request deduplication -->

## Mutations

<!-- e.g. specific actions a feature surfaced UI for but didn't wire -->

## Auth & tenancy

<!-- e.g. multi-tenant middleware, login flow, role checks -->

## UI labels & polish

<!-- e.g. "X vs Y" label decisions, small visual tweaks -->

## Data pipelines & integrations

<!-- e.g. webhook handlers, ETL jobs, cross-system syncs -->

## Product surfaces (v2+)

<!-- e.g. surfaces explicitly planned for v2, listed as the bridge from this doc to the roadmap -->

## Observability

<!-- e.g. error reporting setup, backup formalization, schema evolution discipline -->
