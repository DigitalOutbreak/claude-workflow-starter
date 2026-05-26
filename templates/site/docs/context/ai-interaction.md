# AI Interaction Guidelines

## Communication

- Be concise and direct.
- Explain non-obvious decisions briefly.
- Ask before brand-voice changes, visual direction shifts, or large refactors.
- Don't invent pages, services, or claims that aren't in `site-brief.md` or `pages.md`.
- Never delete files without clarification.

## Workflow

Marketing sites don't use a feature spec lifecycle. Work happens through short, branch-scoped cycles:

1. **Pick the right branch prefix** based on the change:
   - `edit/<slug>` — copy or design tweaks on an existing page
   - `add/<slug>` — new page, post, or case study
   - `design/<slug>` — larger visual changes (homepage redesign, new components)
   - `fix/<slug>` — bug fixes (broken links, layout glitches)
   - `chore/<slug>` — tooling, deps, build config
2. **Update the inventory.** If you're adding or removing a page, update `pages.md` *in the same branch*. The inventory and the codebase should never disagree.
3. **Implement.** Match brand voice (`brand.md`) and coding standards (`coding-standards.md`).
4. **Test in the browser.** Marketing sites are visual — typecheck and build alone don't prove the page looks right.
5. **Run `npm run build`** and fix errors.
6. **Eyeball pass.** Hero, CTAs, image rendering, mobile breakpoint, footer.
7. **Commit only after build passes and the page looks right.** Ask before committing.
8. **Merge to main.** Delete the branch after merge.

> If the change touches **content** (new post, case study, page copy), the eyeball pass also covers: reading the copy out loud — does it sound like `brand.md`?

## Branching

We use a new short-lived branch for every change. Examples:

- `edit/homepage-hero-rewrite`
- `add/case-study-acme-rebrand`
- `design/services-page-grid`
- `fix/broken-pricing-anchor`
- `chore/upgrade-tailwind`

Ask to delete the branch once merged.

## Commits

- Ask before committing — don't auto-commit.
- Conventional prefixes (`edit:`, `add:`, `fix:`, `chore:`, `design:`).
- Keep commits focused: one page or one concern per commit.
- Never put "Generated with Claude" / "Generated with Gemini" / etc. in commit messages.

## Brand voice — load-bearing

Copy on this site **matches `brand.md`**, not generic agency-speak. Before writing or rewriting any page copy:

1. Read `brand.md` — voice, tone for the surface you're working on, words to use and avoid.
2. Read the page-type tone column in `brand.md` (homepage tone ≠ case-study tone ≠ pricing tone).
3. Write a draft.
4. Cut every sentence that could appear on any other agency's site.

If a copy decision feels close to the brand-voice edge, surface the call rather than picking silently.

## When stuck

- If something isn't working after 2-3 attempts, stop and explain.
- Don't keep trying random fixes.
- Ask for clarification if intent is unclear — especially for design or brand-voice calls.

## Code & content changes

- Make minimal changes to accomplish the task.
- Don't refactor unrelated code or rewrite unrelated copy.
- Don't add "nice to have" sections, features, or pages.
- Preserve existing patterns in the codebase.
- If you spot something broken outside scope (typo elsewhere, dead link in footer), note it for a separate `fix/` branch — don't fold it into the current change.

## SEO & marketing skills

This project pairs well with the SEO skills (`/seo-audit`, `/seo-content`, `/seo-schema`, `/seo-sitemap`, etc.). They read `pages.md` and `site-brief.md` for context. Run them on demand — they're not part of every change.

## Code review

Review AI-generated changes for:

- **Brand voice drift** — does the copy still sound like us?
- **Accessibility** — focus states, alt text, heading order, keyboard reachability.
- **Performance** — image sizes, JS shipped, third-party scripts.
- **SEO basics** — H1 count, meta title/description, canonical, OG image.
- **Mobile** — every visual change gets a mobile breakpoint pass.
