---
name: site-init
description: Bootstrap a marketing site project — installs slim context docs (site brief, brand, pages, content backlog, coding standards, AI interaction), optionally scaffolds Astro / Next.js / SvelteKit, runs a short interview (~5 min), and for existing sites reads the repo to pre-fill the page inventory. Use for agency sites, brand sites, landing pages, content sites. Optional argument is the target directory. Supports Claude Code, Codex, and any AI agent that loads agent skills.
argument-hint: [target-dir]
---

# Site Init

> Marketing-site sibling to `/workflow-init`. Same machinery, slimmer file set. Skip this and use `/workflow-init` if you're building a product app with a database, auth, and a feature lifecycle.

## Prompt style — when to use a picker vs prose

This skill mixes two prompt styles. Pick the right one for each question or the UX gets ugly.

- **Picker (e.g. `AskUserQuestion`)** — use ONLY when the answer is one of a small, fixed set of options the agent can enumerate honestly. Examples: "new site or existing?", "Astro / Next.js / SvelteKit?", "MDX or headless CMS?". **Every option must be a real, mutually-exclusive choice** — never pad to hit a minimum with placeholders.
- **Free-text prose** — use for any answer the user has to invent: project names, audience descriptions, brand voice adjectives, banned words, URLs, refs. **Never** wrap these in a picker with canned defaults like "marketing-site / site / www" — those options are noise. Ask in plain prose and let the user type.

Cross-agent note: in Claude Code, the picker is `AskUserQuestion`; in Codex / other agents, it's prose with a clear option list. The free-text style is the same everywhere — a plain question with no canned answers.

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

### 1.0 Detect CWD shape — DO NOT skip this

Before asking the user anything, inspect the current working directory and classify it. **Do not enumerate sibling project directories as bootstrap candidates** — those are unrelated projects, not options.

Run a directory listing (`ls -A` or equivalent) and decide:

| CWD shape | How to tell | Default behavior |
|---|---|---|
| **Project root** | CWD itself contains `package.json`, `astro.config.*`, `next.config.*`, `svelte.config.*`, `src/`, `app/`, `pages/`, etc. | Assume **existing site** in CWD. Skip the "new vs existing" question — go straight to confirming "Add workflow files to this existing site at `<cwd>`?" |
| **Workspace / parent dir** | CWD contains multiple subdirectories that themselves look like projects (each with their own `package.json`, framework configs, or `.git`), AND CWD has no framework config of its own. Examples: `~/Developer/projects/`, `~/Developer/_starters/`, anything that looks like a folder full of unrelated projects. | Assume **new site, scaffold here as a subdir**. Ask only for the new project's folder name — **plain prose prompt, free-text input, NO picker, NO canned defaults** like "marketing-site / site / www". The user invents the name. Example prompt: *"What's the folder name for the new site? (will be created under `<cwd>`)"* DO NOT list the sibling project dirs as options to bootstrap into. |
| **Empty or sparse dir** | CWD is empty, or contains only dotfiles / a single placeholder. | Assume **new site, scaffold in place** (no subdir). |
| **User passed a target arg** | `$ARGUMENTS` is non-empty | Resolve the arg as the parent dir. Apply the same classification to it. |

> **Critical:** never present sibling project directories (`splashdev/`, `local-content-clipper/`, etc.) as install candidates. They are not related to this site. The only valid options are "this dir," "a new subdir of this dir," or "a path the user types in."

### 1.1 New site or existing? *(skip if 1.0 was decisive)*

Only ask this if the CWD classification in 1.0 was ambiguous. Otherwise apply the default and surface it once for confirmation:

> "Detected `<cwd>` as a [project root / workspace / empty dir]. Defaulting to [add to existing / scaffold new subdir / scaffold in place]. Continue? *(Y/n, or type a different target path)*"

If the user pushes back, give them two options:

- **Scaffold a new site** — agent runs a `create-*` command in Stage 2 (you'll be asked for a project name)
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

Short interview (~5 minutes). Five rounds.

**Prompt style for this stage: free-text prose for almost every question** — site names, descriptions, audience, offer, brand-voice adjectives, banned words are all invention answers, not multiple-choice. Use a picker ONLY where the answer is genuinely one of a small fixed set (the conversion-event question and the palette-starting-point question below). Re-read the *"Prompt style"* section at the top of this file if unsure.

### Round 1 — Identity *(free-text prose)*

Ask each as a plain prose question:

1. **Site name** — one short string. What goes in the `{{Site Name}}` placeholder. *(Free text. No picker.)*
2. **One-line description** — "[Site Name] — [what it is] for [who]". *(Free text.)*
3. **Production URL** — if it exists; "not yet" is a valid answer for new sites. *(Free text.)*

### Round 2 — Audience & offer *(mostly free-text)*

Ask:

4. **Who's the audience?** Title, company size, the moment they're in when they land. *(Free text.)*
5. **What do you sell?** List the offers. Don't accept "everything" — push for the top 1-3. *(Free text.)*
6. **What's the primary conversion event?** *(Picker is OK here — it's a small fixed set.)* Options: Booked call · Form submit · Newsletter signup · Email reply · Purchase · Other (free text). Pick ONE.

After capturing answers, ask a follow-up elaboration round as plain prose:

> "Anything I missed about the audience or the offer that should shape how the site sounds?"

Capture freeform text — it feeds `brand.md` and `site-brief.md`.

### Round 3 — Brand voice *(free-text prose)*

Ask:

7. **Three adjectives that describe the voice.** *(Free text — the user types three words.)* Push back if they pick generic ones ("professional, innovative, friendly" — recommend more specific). Good answers sound like "direct, blunt, founder-led" or "warm, observant, quietly confident."
8. **Three words or phrases this site will NEVER use.** *(Free text.)* These go in `brand.md`'s "Words we avoid" section. Common candidates: "solutions," "world-class," "synergy," "we're passionate about."

If the user struggles, offer the example list from `brand.md` and ask them to pick which they hate.

### Round 4 — Visual direction

Ask:

9. **Refs / inspiration** *(free text)* — Pinterest board, links to sites they want to feel like, or "no refs yet, recommend something."
10. **Palette starting point** *(picker is OK — fixed set)* — one of: "I have brand colors already" / "Use a neutral palette to start" / "Bold and saturated" / "Show me options."

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
