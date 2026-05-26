---
name: site-init
description: Bootstrap a marketing site project — installs slim context docs (site brief, brand, pages, content backlog, coding standards, AI interaction), optionally scaffolds Astro / Next.js / SvelteKit, runs a short interview (~5 min), and for existing sites reads the repo to pre-fill the page inventory. Use for agency sites, brand sites, landing pages, content sites. Optional argument is the target directory. Supports Claude Code, Codex, and any AI agent that loads agent skills.
argument-hint: [target-dir]
---

# Site Init

> Marketing-site sibling to `/workflow-init`. Same machinery, slimmer file set. Skip this and use `/workflow-init` if you're building a product app with a database, auth, and a feature lifecycle.

End-to-end bootstrap for marketing / agency / brand sites. Eight stages:

```
0  Idempotency check       (skip stages already done if re-run)
1  Pre-flight              (new vs existing → framework if new → CMS pick)
2  Scaffold                (only for new sites — Astro / Next.js / SvelteKit)
3  Install template files  (drop CLAUDE.md / AGENTS.md / GEMINI.md / docs/context/)
4  Interview               (brand voice, audience, offer, conversion goal — ~5 min)
5  MCP decision            (SEO-focused MCPs — do NOT install yet; restart wipes context)
6  Inventory pages         (for existing sites — read the repo and pre-fill pages.md)
7  Fill templates          (write all answers into the installed docs)
8  Hand off                (MCP install commands + next-steps — safe to restart here)
```

**🚨 Critical ordering rule:** MCP installs require an agent restart, which wipes context. Stage 5 picks MCPs but never installs them. Install commands surface at Stage 8 — *after* Stage 7 has written every answer to disk.

> **Marketing sites don't get a `/feature` lifecycle.** Page work happens on `edit/`, `add/`, `design/`, `fix/`, `chore/` branches. The interview reflects that — no roadmap stage, no "first feature" recommendation.

Don't dump templates and walk away. The template files have `{{Placeholders}}` and bracketed `[Replace with...]` prompts. The interview surfaces the answers; you write them in.

## Stage 0 — Idempotency check

Before anything else, check if `/site-init` has run before in this target. Look for either of:

- `docs/context/site-brief.md` exists and has content beyond the empty placeholder comments
- `docs/context/pages.md` exists and has content beyond the empty template

If yes, ask:

> "This site already has the workflow files. Do you want to:
> - **Resume** — keep existing context, just check what's set up
> - **Refresh skill files only** — re-install `.claude/skills/` if they've moved
> - **Re-inventory pages** — re-read the repo and update `pages.md` only
> - **Start fresh** — wipe and re-run the full interview (destructive)
> - **Abort** — leave things alone"

Default to "Resume." Only run the full interview if explicitly asked.

If no prior install detected, proceed.

## Stage 1 — Pre-flight

Decide working location:

1. If the user provided a target directory, resolve it. Otherwise use the current working directory.

Ask three sub-questions in sequence.

### 1.1 New site or existing?

Two options:

- **Scaffold a new site** — agent runs a `create-*` command in Stage 2
- **Add workflow to existing site** — skip scaffolding (e.g. WoD, an existing agency site)

If "existing," skip Stages 1.2 and 1.3 and jump to Stage 3. Stage 6 (inventory pages) becomes the high-value step for existing sites.

### 1.2 Which framework? *(only if new)*

Three options:

| Option | What runs |
|---|---|
| **Astro** *(recommended)* | `npm create astro@latest` (minimal, TS, no example). Add `astro add tailwind` after. For React UI islands, add `astro add react` and recommend `shadcn-astro`. |
| **Next.js** | `create-next-app@latest` with TS + Tailwind + App Router. Recommend `shadcn@latest init` for components. |
| **SvelteKit** | `npx sv create` (minimal, TS) + `npx sv add tailwindcss`. |

Recommend Astro by default — marketing sites benefit most from islands architecture and zero-JS-by-default.

### 1.3 CMS pick *(only if new)*

Three options:

- **MDX in repo** *(recommended for new sites)* — content lives in the codebase, version-controlled
- **Headless CMS** — Sanity, Contentful, Notion, Storyblok, etc.
- **Decide later** — start with MDX, swap if needed

If the user picks a headless CMS, capture which one — it informs MCP recommendations in Stage 5.

## Stage 2 — Scaffold *(only for new sites)*

Run the create-* command for the picked framework with sensible defaults. Confirm before running.

After scaffold:

- Astro: optionally `astro add tailwind` and `astro add react` based on Stage 1.2 add-ons
- Next.js: optionally run `npx shadcn@latest init`
- SvelteKit: optionally `npx sv add tailwindcss`

Then proceed to Stage 3.

## Stage 3 — Install template files

Run the CLI's `init-site` subcommand to drop the workflow files into the target:

```sh
npx @digitaloutbreak/workflow init-site <target>
```

This copies:

- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` (root briefs)
- `docs/context/site-brief.md`
- `docs/context/brand.md`
- `docs/context/pages.md`
- `docs/context/content-backlog.md`
- `docs/context/coding-standards.md`
- `docs/context/ai-interaction.md`
- `.claude/skills/cleanup/`

The CLI refuses to overwrite existing files of the same name — surfaces conflicts to the user so they can resolve manually.

## Stage 4 — Interview

Short interview (~5 minutes). Five rounds. Use structured-question prompts where the agent supports them (Claude Code: `AskUserQuestion`); otherwise prose with clear option lists.

### Round 1 — Identity

Ask:

1. **Site name** (one short string — what to put in the `{{Site Name}}` placeholder)
2. **One-line description** ("[Site Name] — [what it is] for [who]")
3. **Production URL** (if it exists; "not yet" is a valid answer for new sites)

### Round 2 — Audience & offer

Ask:

4. **Who's the audience?** Title, company size, the moment they're in when they land.
5. **What do you sell?** List the offers. Don't accept "everything" — push for the top 1-3.
6. **What's the primary conversion event?** Booked call? Form submit? Newsletter signup? Email reply? Buy now? Pick ONE.

After capturing answers, ask a follow-up elaboration round:

> "Anything I missed about the audience or the offer that should shape how the site sounds?"

Capture freeform text — it feeds `brand.md` and `site-brief.md`.

### Round 3 — Brand voice

Ask:

7. **Three adjectives that describe the voice.** Push back if they pick generic ones ("professional, innovative, friendly" — recommend more specific). Good answers sound like "direct, blunt, founder-led" or "warm, observant, quietly confident."
8. **Three words or phrases this site will NEVER use.** These go in `brand.md`'s "Words we avoid" section. Common candidates: "solutions," "world-class," "synergy," "we're passionate about."

If the user struggles, offer the example list from `brand.md` and ask them to pick which they hate.

### Round 4 — Visual direction

Ask:

9. **Refs / inspiration** — Pinterest board, links to sites they want to feel like, or "no refs yet, recommend something."
10. **Palette starting point** — one of: "I have brand colors already" / "Use a neutral palette to start" / "Bold and saturated" / "Show me options."

### Round 5 — Stack confirm

For new sites: confirm the framework + CMS picks from Stage 1.

For existing sites: ask which framework / CMS the site is on so `coding-standards.md` can be edited to match.

## Stage 5 — MCP decision

Pick MCPs based on stack + scope. **Do not install yet** — surface install commands at Stage 8.

Recommended MCPs for marketing sites:

| MCP | Purpose | Trigger |
|---|---|---|
| `context7` | Up-to-date framework docs | Always |
| `playwright` | Browser-driven visual testing | Always |
| `firecrawl` | Crawl live sites for SEO and competitor analysis | If the user does ongoing SEO work |
| `dataforseo` | Keyword volume, SERP data, backlinks | If SEO is a priority |
| `sanity` / `contentful` / `storyblok` MCP | CMS read/write | If a headless CMS was picked |
| `vercel` / `cloudflare` MCP | Deploy ops | If hosting on Vercel or Cloudflare Pages |

Capture which MCPs the user wants. Write the install commands into `site-brief.md` under a "MCPs" section so they survive the restart.

## Stage 6 — Inventory pages (existing sites)

**Skip this stage for new sites — there's nothing to inventory yet.**

For existing sites, this is the highest-leverage stage. The agent reads the repo (no network) to pre-fill `pages.md` so the user doesn't have to type out every URL.

Process:

1. Look for the framework's route directory:
   - Astro: `src/pages/**/*.{astro,md,mdx}` and `src/content/**/*.{md,mdx}`
   - Next.js App Router: `app/**/page.{tsx,ts,jsx,js,mdx,md}`
   - Next.js Pages Router: `pages/**/*.{tsx,ts,jsx,js,mdx,md}` excluding `_app`, `_document`, `_error`, `api/`
   - SvelteKit: `src/routes/**/+page.{svelte,md,mdx}`
2. For each route, extract:
   - **URL** (derive from filename)
   - **Page type** (homepage, service, case study, blog post, etc. — infer from path)
   - **Status** (assume 🟢 Live; the user can downgrade later)
   - **H1 / title** if visible in the file (use as a hint for "Purpose")
3. Group by type (core, services, case studies, blog, programmatic, utility).
4. Write to `pages.md`, replacing the empty template tables.

Surface what was found:

> "Found 14 routes. Pre-filled `pages.md` with URL, page type, and status. **Primary CTA**, **target keyword**, and **purpose** columns are empty — fill those in when you next touch each page, or run `/seo-audit` to suggest them."

Don't try to infer target keywords or CTAs from the code — those are intent, not artifacts.

## Stage 7 — Fill templates

Write all interview answers into the installed templates:

- **`CLAUDE.md` / `AGENTS.md` / `GEMINI.md`** — replace `{{Site Name}}` and the one-line description.
- **`site-brief.md`** — fill *What this site is*, *Who it's for*, *What it sells*, *What success looks like*, *Stack*, *Key links*. Leave *Out of scope* with a starter row for the user to extend.
- **`brand.md`** — fill *Voice* adjectives, *Words we avoid*, *Visual direction palette/typography rows*. Leave the *Headline patterns* and per-surface *Tone* table with placeholder rows the user fills in over time.
- **`pages.md`** — for new sites, leave the template; for existing sites, populated by Stage 6.
- **`coding-standards.md`** — adjust framework section (Astro vs Next vs SvelteKit) and CMS section.
- **`ai-interaction.md`** — leave as-is unless interview revealed custom workflow rules.
- **`content-backlog.md`** — leave empty for new sites; for existing sites, ask "anything you wanted to add or rewrite that I should put in the backlog?" and capture 0-3 items.

## Stage 8 — Hand off

Print the MCP install commands captured in Stage 5. Tell the user a restart is now safe because everything is on disk.

Then surface the next steps:

```
Next steps:

  1. Restart your agent so the MCPs activate (if you installed any).
  2. Open `docs/context/site-brief.md` and fill the *Out of scope* section.
  3. Open `docs/context/brand.md` and add 2-3 example sentences to each tone row.
  4. (Existing sites) Open `docs/context/pages.md` and fill primary CTAs and target keywords.
  5. (New sites) Use the SEO skills to plan content: `/seo-plan` or `/seo-cluster`.
  6. Start your first change on a branch: `edit/<slug>`, `add/<slug>`, or `design/<slug>`.
```

For agency clients or recurring work, mention:

> "Consider running `/seo-audit` on the live site once it's deployed — it works *from* `pages.md` and produces a baseline report you can refer back to."

That's it. The interview is short by design — marketing sites don't need a thesis or a feature roadmap.
