#!/usr/bin/env node
// workflow-init — Node CLI for @digitaloutbreak/workflow
//
// Usage:
//   npx @digitaloutbreak/workflow                  Install starter into current dir
//   npx @digitaloutbreak/workflow ./my-app         Install into ./my-app
//   npx @digitaloutbreak/workflow --install-skill  Install /workflow-init global slash command
//   npx @digitaloutbreak/workflow --help
//
// No external deps — uses Node's built-in fs/path/os only.

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

const PKG_ROOT = path.resolve(__dirname, "..");

// Install presets — each describes what gets dropped into a target project.
// "product" is the original /workflow-init payload (full feature lifecycle).
// "site"    is the slimmer /site-init payload for marketing sites.
//
// Source paths are resolved relative to `srcRoot`. Destination paths are the
// same string (minus the srcRoot prefix) inside the user's target directory.
const PRESETS = {
  product: {
    srcRoot: PKG_ROOT,
    files: [
      "CLAUDE.md",
      "AGENTS.md",
      "GEMINI.md",
      "docs/context/thesis.md",
      "docs/context/project-overview.md",
      "docs/context/coding-standards.md",
      "docs/context/ai-interaction.md",
      "docs/context/current-feature.md",
      "docs/context/backlog.md",
      "docs/context/roadmap.md",
      "docs/specs/project-spec.md",
      ".claude/agents/code-scanner.md",
    ],
    dirs: [".claude/skills/feature", ".claude/skills/cleanup"],
    emptyDirs: ["docs/context/features", "docs/context/designs"],
  },
  site: {
    srcRoot: path.join(PKG_ROOT, "templates", "site"),
    files: [
      "CLAUDE.md",
      "AGENTS.md",
      "GEMINI.md",
      "docs/context/site-brief.md",
      "docs/context/brand.md",
      "docs/context/pages.md",
      "docs/context/content-backlog.md",
      "docs/context/coding-standards.md",
      "docs/context/ai-interaction.md",
    ],
    dirs: [".claude/skills/cleanup"],
    emptyDirs: [],
  },
};

// ────────────────────────────────────────────────────────────────────── helpers

function exists(p) {
  try {
    fs.accessSync(p);
    return true;
  } catch {
    return false;
  }
}

function copyFile(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcChild = path.join(src, entry.name);
    const destChild = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcChild, destChild);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcChild, destChild);
    }
  }
}

function color(code, text) {
  if (!process.stdout.isTTY) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}
const green = (t) => color("32", t);
const red = (t) => color("31", t);
const dim = (t) => color("2", t);
const bold = (t) => color("1", t);

// ────────────────────────────────────────────────────────────────────── init

function cmdInit(targetArg, presetName = "product") {
  const preset = PRESETS[presetName];
  if (!preset) {
    console.error(red(`error: unknown preset '${presetName}'`));
    process.exit(1);
  }

  const target = path.resolve(process.cwd(), targetArg || ".");

  if (!exists(target)) {
    console.error(red(`error: target '${target}' does not exist.`));
    console.error("       Create it first, or pass an existing path.");
    process.exit(1);
  }

  if (!fs.statSync(target).isDirectory()) {
    console.error(red(`error: target '${target}' is not a directory.`));
    process.exit(1);
  }

  console.log(`${dim("preset: ")} ${presetName}`);
  console.log(`${dim("source: ")} ${preset.srcRoot}`);
  console.log(`${dim("target: ")} ${target}`);
  console.log("");

  // Conflict check.
  const conflicts = [];
  for (const f of preset.files) {
    if (exists(path.join(target, f))) conflicts.push(f);
  }
  for (const d of preset.dirs) {
    if (exists(path.join(target, d))) conflicts.push(d + "/");
  }
  if (conflicts.length > 0) {
    console.error(
      red("error: target already has these — refusing to overwrite:")
    );
    for (const c of conflicts) console.error(`  - ${c}`);
    console.error("");
    console.error(
      "Remove or rename them first, or pick a fresh target directory."
    );
    process.exit(2);
  }

  // Copy files.
  for (const f of preset.files) {
    const src = path.join(preset.srcRoot, f);
    const dest = path.join(target, f);
    if (!exists(src)) {
      console.error(red(`error: missing source ${f} in package`));
      process.exit(3);
    }
    copyFile(src, dest);
    console.log(`  ${green("+")} ${f}`);
  }
  for (const d of preset.dirs) {
    const src = path.join(preset.srcRoot, d);
    const dest = path.join(target, d);
    copyDir(src, dest);
    console.log(`  ${green("+")} ${d}/`);
  }
  for (const d of preset.emptyDirs) {
    fs.mkdirSync(path.join(target, d), { recursive: true });
    console.log(`  ${green("+")} ${d}/ ${dim("(empty)")}`);
  }

  console.log("");
  console.log(bold("Done. Next:"));
  if (presetName === "site") {
    console.log("  Recommended — open your agent in this directory and run /site-init.");
    console.log("  It runs a short interview (~5 min) and fills the templates with your real context.");
    console.log("");
    console.log(`  ${dim("Or, to fill templates by hand:")}`);
    console.log(`  ${dim("  • Edit CLAUDE.md / docs/context/site-brief.md / docs/context/brand.md / etc.")}`);
    console.log(`  ${dim("  • Replace {{Site Name}} and the placeholder content with yours.")}`);
  } else {
    console.log("  Recommended — open your agent in this directory and run /workflow-init.");
    console.log("  It runs a guided interview and fills the templates with your real context.");
    console.log("");
    console.log(`  ${dim("Or, to fill templates by hand:")}`);
    console.log(`  ${dim("  • Edit CLAUDE.md / docs/context/thesis.md / docs/context/project-overview.md / etc.")}`);
    console.log(`  ${dim("  • Replace {{Project Name}} and the placeholder content with yours.")}`);
  }
}

// ────────────────────────────────────────────────────────────────────── install-skill

// Parse the YAML frontmatter from a markdown file with `--- ... ---` at the top.
// Returns { frontmatter: { ...fields }, body: string }. Permissive — only handles
// the fields we use (name, description, argument-hint), single-line string values.
function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^(\w[\w-]*):\s*(.+)$/);
    if (kv) {
      const [, key, value] = kv;
      // Strip surrounding quotes if any
      frontmatter[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { frontmatter, body: match[2] };
}

// Note: previous versions of this CLI also generated a Gemini-specific TOML
// file at ~/.gemini/commands/<name>.toml. Modern Gemini CLI (v0.43+) reads
// the open agent-skills standard at ~/.agents/skills/<name>/SKILL.md instead,
// so we emit the same markdown format for both Codex and Gemini and let the
// agent-skills standard handle discovery. The TOML path is no longer written.
//
// `parseFrontmatter` is kept available for any future per-agent transforms.

// Ask a series of Y/n questions on stdin. Returns an array of booleans matching
// the input order. Uses one readline interface across all questions — separate
// interfaces per question break when stdin is piped (closing one interface
// consumes the rest of stdin).
async function askMany(prompts) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  function question(text) {
    return new Promise((resolve) => rl.question(text, resolve));
  }

  const answers = [];
  for (const p of prompts) {
    const hint = p.defaultYes ? "[Y/n]" : "[y/N]";
    const raw = await question(`${p.text} ${hint} `);
    const a = String(raw).trim().toLowerCase();
    let result;
    if (a === "") result = p.defaultYes;
    else if (a === "y" || a === "yes") result = true;
    else if (a === "n" || a === "no") result = false;
    else result = p.defaultYes;
    answers.push(result);
  }

  rl.close();
  return answers;
}

// Skills the CLI knows how to install. Each is a slash command users invoke
// in their agent. We install BOTH skills for every selected agent — they're
// siblings, not alternatives.
const SKILLS = [
  { name: "workflow-init", srcPath: ["skills", "workflow-init", "SKILL.md"] },
  { name: "site-init", srcPath: ["skills", "site-init", "SKILL.md"] },
];

// Build the per-agent install targets for a single skill. Returned in the
// order used by the interactive picker (Claude, Codex, Gemini).
function getTargetsForSkill(skillName, skillContent) {
  return [
    {
      key: "claude",
      tool: "Claude Code",
      flag: "--claude",
      dest: path.join(
        os.homedir(),
        ".claude",
        "skills",
        skillName,
        "skill.md"
      ),
      content: skillContent,
    },
    {
      key: "codex",
      tool: "Codex (CLI / IDE / app)",
      flag: "--codex",
      dest: path.join(
        os.homedir(),
        ".agents",
        "skills",
        skillName,
        "SKILL.md"
      ),
      content: skillContent,
    },
    {
      key: "gemini",
      tool: "Gemini CLI",
      flag: "--gemini",
      // Gemini CLI v0.43+ reads from the open agent-skills standard, the same
      // path Codex uses. Both flags now resolve to the same destination — the
      // dual-write is deduped at install time so the same file isn't touched
      // twice in one run.
      dest: path.join(
        os.homedir(),
        ".agents",
        "skills",
        skillName,
        "SKILL.md"
      ),
      content: skillContent,
    },
    {
      key: "antigravity",
      tool: "Antigravity (Google)",
      flag: "--antigravity",
      // Antigravity reads GLOBAL skills from ~/.gemini/config/skills/ — a
      // different path from Gemini CLI / Codex (~/.agents/skills/). Without an
      // explicit write here the skill is invisible to Antigravity. It also
      // auto-discovers skills by context rather than slash-invocation.
      dest: path.join(
        os.homedir(),
        ".gemini",
        "config",
        "skills",
        skillName,
        "SKILL.md"
      ),
      content: skillContent,
    },
  ];
}

// Compare what's currently installed at a target with what we'd write.
// Returns { action, label } where action is "new" | "updated" | "unchanged".
function describeState(target) {
  if (!exists(target.dest)) {
    return { action: "new", label: "not installed" };
  }
  let current;
  try {
    current = fs.readFileSync(target.dest, "utf8");
  } catch {
    return { action: "updated", label: "exists, will replace" };
  }
  if (current === target.content) {
    return { action: "unchanged", label: "already up-to-date" };
  }
  return { action: "updated", label: "outdated — will update" };
}

async function cmdInstallSkill(args) {
  // Load all known skills' source content up front.
  const loadedSkills = [];
  for (const skill of SKILLS) {
    const skillSrc = path.join(PKG_ROOT, ...skill.srcPath);
    if (!exists(skillSrc)) {
      console.error(red(`error: skill source not found at ${skillSrc}`));
      process.exit(1);
    }
    loadedSkills.push({
      name: skill.name,
      src: skillSrc,
      content: fs.readFileSync(skillSrc, "utf8"),
    });
  }

  // The per-agent flag list — same across all skills (since destinations only
  // differ by skill name, not agent set).
  const AGENTS = [
    { key: "claude", tool: "Claude Code", flag: "--claude" },
    { key: "codex", tool: "Codex (CLI / IDE / app)", flag: "--codex" },
    { key: "gemini", tool: "Gemini CLI", flag: "--gemini" },
    { key: "antigravity", tool: "Antigravity (Google)", flag: "--antigravity" },
  ];

  const flags = new Set(args);
  const hasAll = flags.has("--all");
  const explicitKeys = AGENTS.filter((a) => flags.has(a.flag)).map((a) => a.key);

  // Decide which agents to install for. Both skills install per selected agent.
  let selectedKeys;
  if (hasAll) {
    selectedKeys = AGENTS.map((a) => a.key);
  } else if (explicitKeys.length > 0) {
    selectedKeys = explicitKeys;
  } else {
    // Interactive mode — needs a TTY.
    if (!process.stdin.isTTY) {
      console.error(red("error: interactive mode requires a TTY."));
      console.error("");
      console.error("Use one of:");
      console.error(`  ${green("--all")}              install for all agents`);
      console.error(`  ${green("--claude")}           install for Claude Code`);
      console.error(`  ${green("--codex")}            install for Codex`);
      console.error(`  ${green("--gemini")}           install for Gemini CLI`);
      console.error(`  ${green("--antigravity")}      install for Antigravity (Google)`);
      console.error("");
      console.error("Flags are combinable, e.g. `--claude --gemini`.");
      process.exit(1);
    }

    // Show status per agent — aggregate across skills. If either skill is
    // missing or outdated for an agent, default to Yes; otherwise default No.
    console.log(
      `Pick which agents to install the workflow skills for ${dim(
        `(${SKILLS.map((s) => "/" + s.name).join(", ")})`
      )}.`
    );
    console.log(dim("(Press Enter to accept the default, type 'n' to skip.)"));
    console.log("");

    const prompts = AGENTS.map((agent) => {
      // Compute combined status across skills for this agent.
      const states = loadedSkills.map((skill) => {
        const target = getTargetsForSkill(skill.name, skill.content).find(
          (t) => t.key === agent.key
        );
        return describeState(target);
      });
      const anyMissingOrOutdated = states.some(
        (s) => s.action !== "unchanged"
      );
      const label = anyMissingOrOutdated
        ? states
            .map((s, i) => `${loadedSkills[i].name}: ${s.label}`)
            .join(" · ")
        : "all up-to-date";
      return {
        text: `  Install for ${agent.tool}? ${dim(`(${label})`)}`,
        defaultYes: anyMissingOrOutdated,
      };
    });

    const answers = await askMany(prompts);
    selectedKeys = AGENTS.filter((_, i) => answers[i]).map((a) => a.key);
    console.log("");
    if (selectedKeys.length === 0) {
      console.log(dim("No agents selected. Nothing to install."));
      return;
    }
  }

  console.log("");

  // Per-skill counts so the summary tells the truth.
  const perSkillCounts = {};

  for (const skill of loadedSkills) {
    perSkillCounts[skill.name] = { new: 0, updated: 0, unchanged: 0 };

    console.log(bold(`/${skill.name}`));
    console.log(`  ${dim("source:")} ${skill.src}`);

    const targets = getTargetsForSkill(skill.name, skill.content).filter((t) =>
      selectedKeys.includes(t.key)
    );

    // Dedupe by destination path — Codex and Gemini both write to
    // ~/.agents/skills/, so if the user picked both, the second write would
    // be a no-op AND would print a misleading "already up-to-date" line.
    // Merge the tool labels instead.
    const byDest = new Map();
    for (const t of targets) {
      const existing = byDest.get(t.dest);
      if (existing) {
        existing.tool = `${existing.tool} / ${t.tool}`;
      } else {
        byDest.set(t.dest, { ...t });
      }
    }
    const dedupedTargets = Array.from(byDest.values());

    for (const target of dedupedTargets) {
      const state = describeState(target);
      perSkillCounts[skill.name][state.action]++;

      if (state.action === "unchanged") {
        console.log(
          `  ${dim("·")} ${target.tool} ${dim("(already up-to-date)")}`
        );
      } else {
        fs.mkdirSync(path.dirname(target.dest), { recursive: true });
        fs.writeFileSync(target.dest, target.content);
        const marker = state.action === "new" ? green("+") : green("↻");
        const note = state.action === "new" ? "" : dim(" (updated)");
        console.log(`  ${marker} ${target.tool}${note}`);
      }
      console.log(`    ${dim(target.dest)}`);
    }
    console.log("");
  }

  // Summary line per skill.
  for (const skill of loadedSkills) {
    const counts = perSkillCounts[skill.name];
    const parts = [];
    if (counts.new > 0) parts.push(`${counts.new} installed`);
    if (counts.updated > 0) parts.push(`${counts.updated} updated`);
    if (counts.unchanged > 0)
      parts.push(`${counts.unchanged} already up-to-date`);
    console.log(green(`/${skill.name} skill: ${parts.join(", ")}.`));
  }
  console.log("");

  // Per-agent invocations — show both skills.
  const invocations = {
    claude: (s) => `Claude Code:  /${s}`,
    codex: (s) => `Codex:        $${s}  (or via /skills picker)`,
    gemini: (s) => `Gemini CLI:   /${s}`,
    antigravity: (s) => `Antigravity:  describe the task, or name the ${s} skill (no slash command)`,
  };
  console.log("Try them from your agent:");
  for (const key of selectedKeys) {
    for (const skill of loadedSkills) {
      console.log(`  ${invocations[key](skill.name)}`);
    }
  }
  console.log("");
  console.log(
    dim(
      "Each slash command calls `npx @digitaloutbreak/workflow init <target>`"
    )
  );
  console.log(
    dim(
      "(or `init-site <target>`) under the hood — no absolute paths to maintain."
    )
  );
  console.log("");
  console.log(
    dim(
      "To add another agent later, re-run with just that flag (e.g. `npx @digitaloutbreak/workflow --gemini`)."
    )
  );
}

// ────────────────────────────────────────────────────────────────────── help

function cmdHelp() {
  const help = `
${bold("@digitaloutbreak/workflow")} — drop-in workflow scaffold for AI-assisted coding

${bold("Two slash commands ship together:")}
  ${green("/workflow-init")}  — full product/app bootstrap (thesis, spec, feature lifecycle)
  ${green("/site-init")}      — slim marketing-site bootstrap (brand, pages, content backlog)

${bold("Two ways to install:")}

  ${green("Recommended")} — via the open-skills ecosystem CLI:
    ${green("npx skills add DigitalOutbreak/workflow -g")}
    ${dim("Installs both skills into Claude / Codex / Gemini in one shot.")}
    ${dim("Re-run anytime to refresh against the latest release.")}

  ${dim("Or via this CLI directly (legacy / fallback):")}
    ${dim("npx @digitaloutbreak/workflow             # interactive picker")}
    ${dim("npx @digitaloutbreak/workflow --all       # install for all 4 agents")}

${bold("Then from any project dir, in your agent:")}
  ${green("/workflow-init")}  for product apps with a database, auth, feature lifecycle
  ${green("/site-init")}      for marketing/agency/brand/landing sites

${bold("/workflow-init project types:")}
  • Web app or site — Next.js / Astro / SvelteKit / TanStack Start scaffolders
  • Backend / API / service — docs install only, you bring the scaffolder
  • Mobile / desktop — docs install only, you bring the scaffolder
  • Other (CLI, library, ML/data) — docs install only

${bold("/site-init project types:")}
  • New marketing site — Astro / Next.js / SvelteKit scaffold + slim docs
  • Existing marketing site (WoD, agency sites, etc.) — drop docs, auto-inventory pages

${bold("Usage:")}
  npx @digitaloutbreak/workflow                       Interactive — install slash commands for chosen agents
  npx @digitaloutbreak/workflow ${green("--all")}                 Install for all four agents, no prompts
  npx @digitaloutbreak/workflow ${green("--claude")} ${green("--gemini")}      Install for specific agents
  npx @digitaloutbreak/workflow ${green("init")} ${dim("[target]")}          ${dim("(advanced)")} Drop product-workflow files into target
  npx @digitaloutbreak/workflow ${green("init-site")} ${dim("[target]")}     ${dim("(advanced)")} Drop marketing-site files into target
  npx @digitaloutbreak/workflow ${green("--help")}                Show this message

${bold("Agent flags:")}
  ${green("--claude")}        →  ~/.claude/skills/{workflow-init,site-init}/skill.md
  ${green("--codex")}         →  ~/.agents/skills/{workflow-init,site-init}/SKILL.md
  ${green("--gemini")}        →  ~/.agents/skills/{workflow-init,site-init}/SKILL.md  ${dim("(same path as --codex — Gemini CLI v0.43+ reads the open agent-skills standard)")}
  ${green("--antigravity")}   →  ~/.gemini/config/skills/{workflow-init,site-init}/SKILL.md  ${dim("(Antigravity's global skills path — discovered by context, not slash)")}
  ${green("--all")}           →  all four

${bold("Direct file install — no agent involvement:")}
  npx @digitaloutbreak/workflow init ./my-app        ${dim("# product workflow")}
  npx @digitaloutbreak/workflow init-site ./my-site  ${dim("# marketing site workflow")}

  ${dim("These are what the slash commands call internally.")}

${bold("Repo:")} https://github.com/DigitalOutbreak/workflow
`;
  console.log(help);
}

// ────────────────────────────────────────────────────────────────────── main

const SKILL_FLAGS = new Set([
  "--install-skill",
  "install-skill",
  "install",
  "--all",
  "--claude",
  "--codex",
  "--gemini",
  "--antigravity",
]);

async function main() {
  const args = process.argv.slice(2);
  const first = args[0];

  // Help variants
  if (first === "--help" || first === "-h" || first === "help") {
    cmdHelp();
    return;
  }

  // Explicit init subcommands: install files into a target project.
  // These are the paths the slash commands themselves call under the hood.
  if (first === "init") {
    cmdInit(args[1], "product");
    return;
  }
  if (first === "init-site") {
    cmdInit(args[1], "site");
    return;
  }

  // Skill-install flow — triggered if any agent flag is present,
  // OR if no args at all (new default UX).
  const isSkillFlag = (a) => SKILL_FLAGS.has(a);
  const skillFlags = args.filter(isSkillFlag);
  const nonFlagArgs = args.filter(
    (a) => !a.startsWith("-") && a !== "init" && a !== "init-site"
  );

  if (args.length === 0 || skillFlags.length > 0) {
    // Pure skill-install mode. Strip the legacy --install-skill prefix
    // if present so the remaining flags drive agent selection.
    const flagsForInstall = args.filter(
      (a) => a !== "--install-skill" && a !== "install-skill" && a !== "install"
    );
    await cmdInstallSkill(flagsForInstall);
    return;
  }

  // Reject unknown flags
  if (first && first.startsWith("-")) {
    console.error(red(`unknown flag: ${first}`));
    console.error(`Run ${green("npx @digitaloutbreak/workflow --help")} for usage.`);
    process.exit(1);
  }

  // Anything else with a positional arg → treat as a target path for init.
  // This is the escape hatch for non-agent users (and what the skill calls).
  if (nonFlagArgs.length > 0) {
    cmdInit(nonFlagArgs[0]);
    return;
  }

  // Shouldn't reach here, but fallback to interactive skill install.
  await cmdInstallSkill([]);
}

main().catch((err) => {
  console.error(red(err.message || String(err)));
  process.exit(1);
});
