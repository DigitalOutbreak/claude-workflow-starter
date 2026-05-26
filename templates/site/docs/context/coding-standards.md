# Coding Standards

> **Starter note:** these conventions assume a typical marketing-site stack (Astro or Next.js + Tailwind + MDX). The `/site-init` flow rewrites sections based on your actual picks; if you ran the CLI bare, edit the sections that don't match. The stack-agnostic sections (naming, code quality, accessibility) stay regardless.

## Framework

- **Static-first.** Default to static generation; only render at request time when the content actually needs it (preview mode, geo-aware content, personalization).
- **Server components / server-rendered pages by default.** Add client-side JS only where interactivity demands it (mobile menu, forms, animations).
- **Routes mirror URLs.** Filename = URL segment. No clever indirection.

## TypeScript

- Strict mode on.
- No `any` — use `unknown` or proper types.
- Type page data (frontmatter, content collection schemas, form payloads). Untyped MDX frontmatter is a frequent source of "why is this undefined."

## Content

- **MDX for content with embedded components.** Plain MD for pure prose.
- **Frontmatter is the contract** — title, description, OG image, canonical, hreflang, publish date, author. Validate it with a schema (Astro content collections, Zod for Next).
- **Images are local-first.** Drop them in `public/` (or `src/content/<collection>/images/` if your framework supports it). Hot-link only for assets you don't control (CDN you trust, partner logos).

## Styling

- Tailwind for all styling. No inline `style={}` except for dynamic values that can't be classnames.
- Use design tokens from `brand.md` — palette and type scale go in CSS variables, not magic numbers in classNames.
- Dark mode: opt-in, not the default, unless `brand.md` says otherwise.
- shadcn/ui components are welcome for interactive primitives; trim what you don't use.

## Images & media

- **Use the framework's image component** (Astro `<Image>`, Next `<Image>`, etc.) — never raw `<img>` for above-the-fold images.
- **AVIF / WebP first**, JPEG fallback. Lossy is fine for photos, lossless for logos / line art.
- **OG images:** every page has one, 1200×630, under 1MB. Generate dynamically if it scales; hand-roll for the homepage and key landings.
- **CLS prevention:** every image gets explicit `width`/`height` or aspect-ratio.
- **Alt text:** describes the image's role on the page, not just its contents. Decorative images get `alt=""`.

## SEO basics (the boring ones)

- One H1 per page.
- Meta title under 60 chars; meta description 140–160.
- Canonical URL on every page.
- robots.txt and sitemap.xml deploy with the build.
- Internal links use relative paths, not absolute URLs.
- Schema.org JSON-LD on pages that earn it (Organization, Article, BreadcrumbList, FAQPage). See `/seo-schema` for what to add where.

## Performance

- **Above-the-fold images:** `loading="eager"` and preloaded.
- **Below-the-fold:** `loading="lazy"`.
- **Fonts:** self-hosted, `display: swap`, preloaded for the family used in the hero.
- **JavaScript:** ship as little as possible. If a feature can be CSS + HTML, do that.
- **Third-party scripts** (analytics, chat, A/B tools): load after first interaction or after `requestIdleCallback`.
- Target: LCP < 2.5s, INP < 200ms, CLS < 0.1 on a mid-tier mobile.

## Accessibility

- Headings in order. No skipping levels for visual styling.
- All interactive elements reachable by keyboard.
- Visible focus styles — never `outline: none` without a replacement.
- Color contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text.
- Form fields have labels (visible or `aria-label`), not just placeholders.

## File organization

> Adjust to your framework. Common shapes:

```
src/
  pages/          Route files
  components/     Reusable UI
  layouts/        Page templates
  content/        MDX / MD content collections
  styles/         Global CSS, tokens
  lib/            Utilities
public/           Static assets, favicons, OG images, downloads
```

## Naming

- Components: PascalCase (`HeroSection.astro` / `HeroSection.tsx`).
- Files: match component name, or kebab-case for non-component files.
- Pages: kebab-case URLs.
- CSS classes: only Tailwind unless you have a deliberate reason.

## Code quality

- No commented-out code.
- No unused imports or variables.
- Keep components under ~150 lines. If it's bigger, it probably wants to split.
- Don't write comments that re-explain the JSX — the markup is the explanation.
