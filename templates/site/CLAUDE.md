# {{Site Name}}

> One-line description. Replace with what this site actually is. Example: *"Digital Outbreak — agency site selling brand identity, web design, and SEO retainers to founders of $1M–$10M businesses."*

## Context

These files are auto-imported into every session — they always load with this CLAUDE.md:

@docs/context/site-brief.md
@docs/context/brand.md
@docs/context/pages.md
@docs/context/coding-standards.md
@docs/context/ai-interaction.md

What each one is for:

| File | Purpose |
|---|---|
| `site-brief.md` | What this site is, who it's for, what it sells, how success is measured |
| `brand.md` | Voice, tone, words we use/avoid, visual direction |
| `pages.md` | Page inventory — URL, purpose, primary CTA, target keyword, status |
| `coding-standards.md` | Coding style and rules |
| `ai-interaction.md` | How AI works on this site — branch conventions, edit etiquette, commit rules |

Content backlog (planned pages / posts / case studies) lives in [`docs/context/content-backlog.md`](./docs/context/content-backlog.md). Read on demand when planning new content.

## Commands

> Replace with your site's actual commands.

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — lint
- `npm run format` — formatter

## Project layout

> Replace with your site's actual layout. Common shapes below.

```
{{site-root}}/
  src/
    pages/        Route files (Astro: .astro/.md/.mdx · Next: page.tsx)
    components/   Shared UI
    content/      Content collections (blog posts, case studies, MDX)
    layouts/      Page layouts / templates
  public/         Static assets (favicons, OG images, downloads)
  docs/
    context/      ← read these first (see table above)
```
