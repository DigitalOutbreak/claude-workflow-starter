# Pages

> Every public URL on this site, what it's for, and what it should do. Keep this honest — if a page exists in the repo but not here, either it's untracked or it shouldn't exist.

## Status legend

- 🟢 **Live** — published, considered current
- 🟡 **Draft** — exists in repo, not yet published or behind a noindex
- 🟠 **Needs rewrite** — live but flagged for revision
- 🔴 **Broken** — live but has known issues (404 links, layout bugs, outdated info)
- ⚪ **Planned** — in `content-backlog.md`, not yet started

> For deeper SEO work (target keywords per page, schema, meta), run the `/seo` skills. This file is the inventory; the SEO skills work *from* it.

---

## Core pages

| URL | Page type | Purpose | Primary CTA | Target keyword | Status |
|---|---|---|---|---|---|
| `/` | Homepage | [What it does in one phrase] | [e.g. "Book discovery call"] | [keyword] | 🟢 |
| `/about` | About | [...] | [...] | [keyword] | 🟢 |
| `/contact` | Contact | [...] | [Form submit] | [keyword] | 🟢 |
| `/pricing` | Pricing | [...] | [Book call] | [keyword] | 🟡 |

## Services / offers

| URL | Page type | Purpose | Primary CTA | Target keyword | Status |
|---|---|---|---|---|---|
| `/services` | Services hub | [...] | [...] | [keyword] | 🟢 |
| `/services/[slug]` | Service detail | [...] | [...] | [keyword per slug] | 🟢 |

## Case studies / proof

| URL | Page type | Purpose | Primary CTA | Target keyword | Status |
|---|---|---|---|---|---|
| `/work` | Case study index | [...] | [...] | [keyword] | 🟢 |
| `/work/[slug]` | Case study detail | [...] | [...] | [keyword per slug] | 🟢 |

## Content / journal

| URL | Page type | Purpose | Primary CTA | Target keyword | Status |
|---|---|---|---|---|---|
| `/blog` | Post index | [...] | [Subscribe] | [keyword] | 🟡 |
| `/blog/[slug]` | Post detail | [...] | [Next post] | [keyword per post] | 🟡 |

## Programmatic / SEO-only

> Pages built from data sources or for capturing long-tail search. Often noindex'd until they're ready. See `/seo-programmatic` skill for the strategy.

| URL | Page type | Purpose | Primary CTA | Target keyword | Status |
|---|---|---|---|---|---|
| `/locations/[city]` | Local landing | [...] | [...] | [city + service] | 🟡 |
| `/compare/[a]-vs-[b]` | Comparison | [...] | [...] | [a vs b] | ⚪ |

## Utility / legal

| URL | Page type | Purpose | Status |
|---|---|---|---|
| `/privacy` | Legal | [...] | 🟢 |
| `/terms` | Legal | [...] | 🟢 |
| `/sitemap.xml` | Sitemap | [...] | 🟢 |
| `/robots.txt` | Crawler hint | [...] | 🟢 |
| `/404` | Error | [...] | 🟢 |

---

## Conventions

- **One H1 per page.** Sub-sections use H2 / H3.
- **Meta title:** `<page-specific>` then `· <Site Name>` — keep under 60 chars total.
- **Meta description:** 140–160 chars, leads with the value, ends with the CTA verb.
- **OG image:** every page has one. Default falls back to `/og/default.png`.
- **Canonical:** set on every page, even when it points to itself.
- **Hreflang:** [if multi-region, link the strategy doc; else delete this row]
