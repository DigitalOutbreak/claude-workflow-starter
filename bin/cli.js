#!/usr/bin/env node
// workflow-init — Node CLI for @digitaloutbreak/workflow-init
//
// Usage:
//   npx @digitaloutbreak/workflow-init                  Install starter into current dir
//   npx @digitaloutbreak/workflow-init ./my-app         Install into ./my-app
//   npx @digitaloutbreak/workflow-init --install-skill  Install /workflow-init global slash command
//   npx @digitaloutbreak/workflow-init --help
//
// No external deps — uses Node's built-in fs/path/os only.

"use strict";

const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");

const PKG_ROOT = path.resolve(__dirname, "..");

// Files we copy verbatim into the target project.
const FILES = [
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  "docs/context/thesis.md",
  "docs/context/project-overview.md",
  "docs/context/coding-standards.md",
  "docs/context/ai-interaction.md",
  "docs/context/current-feature.md",
  "docs/context/backlog.md",
  "docs/specs/project-spec.md",
  ".claude/agents/code-scanner.md",
];

// Directories we copy recursively.
const DIRS = [".claude/skills/feature", ".claude/skills/cleanup"];

// Empty placeholder dirs to create.
const EMPTY_DIRS = ["docs/context/features"];

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

function cmdInit(targetArg) {
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

  console.log(`${dim("starter:")} ${PKG_ROOT}`);
  console.log(`${dim("target: ")} ${target}`);
  console.log("");

  // Conflict check.
  const conflicts = [];
  for (const f of FILES) {
    if (exists(path.join(target, f))) conflicts.push(f);
  }
  for (const d of DIRS) {
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
  for (const f of FILES) {
    const src = path.join(PKG_ROOT, f);
    const dest = path.join(target, f);
    if (!exists(src)) {
      console.error(red(`error: missing source ${f} in package`));
      process.exit(3);
    }
    copyFile(src, dest);
    console.log(`  ${green("+")} ${f}`);
  }
  for (const d of DIRS) {
    const src = path.join(PKG_ROOT, d);
    const dest = path.join(target, d);
    copyDir(src, dest);
    console.log(`  ${green("+")} ${d}/`);
  }
  for (const d of EMPTY_DIRS) {
    fs.mkdirSync(path.join(target, d), { recursive: true });
    console.log(`  ${green("+")} ${d}/ ${dim("(empty)")}`);
  }

  console.log("");
  console.log(bold("Done. Next:"));
  console.log("  1. Edit CLAUDE.md — replace {{Project Name}} and the project layout.");
  console.log("  2. Fill in docs/context/thesis.md — your strategic memo.");
  console.log("  3. Fill in docs/context/project-overview.md — what you're building.");
  console.log("  4. Adjust docs/context/coding-standards.md if your stack differs.");
  console.log("  5. Sketch docs/specs/project-spec.md when implementation needs deeper detail.");
  console.log("  6. Start a Claude session — CLAUDE.md and the @-imports load automatically.");
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

// Generate a Gemini CLI TOML command file from a parsed skill.
// TOML format: https://github.com/google-gemini/gemini-cli/blob/main/docs/cli/custom-commands.md
// Uses literal multi-line strings (''') so backslashes in bash commands stay literal.
function buildGeminiTOML(skillMd) {
  const { frontmatter, body } = parseFrontmatter(skillMd);
  const description = frontmatter.description || "Workflow init";

  // Description goes in a basic string — escape " and \.
  const descEscaped = description.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  // Body goes in a multi-line literal string ('''). The skill content
  // shouldn't contain ''' — verify just in case.
  if (body.includes("'''")) {
    throw new Error(
      "skill body contains ''' — cannot safely emit as TOML literal string"
    );
  }

  return `description = "${descEscaped}"

prompt = '''
${body.trim()}
'''
`;
}

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

// All known agent install targets. Order is the prompt order in interactive mode.
function getTargets(skillContent) {
  return [
    {
      key: "claude",
      tool: "Claude Code",
      flag: "--claude",
      dest: path.join(
        os.homedir(),
        ".claude",
        "skills",
        "workflow-init",
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
        "workflow-init",
        "SKILL.md"
      ),
      content: skillContent,
    },
    {
      key: "gemini",
      tool: "Gemini CLI",
      flag: "--gemini",
      dest: path.join(
        os.homedir(),
        ".gemini",
        "commands",
        "workflow-init.toml"
      ),
      content: buildGeminiTOML(skillContent),
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
  const skillSrc = path.join(PKG_ROOT, "skills", "workflow-init", "SKILL.md");
  if (!exists(skillSrc)) {
    console.error(red(`error: skill source not found at ${skillSrc}`));
    process.exit(1);
  }

  const skillContent = fs.readFileSync(skillSrc, "utf8");
  const allTargets = getTargets(skillContent);

  const flags = new Set(args);
  const hasAll = flags.has("--all");
  const explicitKeys = allTargets.filter((t) => flags.has(t.flag)).map((t) => t.key);

  // Decide which targets to install.
  let selectedKeys;
  if (hasAll) {
    selectedKeys = allTargets.map((t) => t.key);
  } else if (explicitKeys.length > 0) {
    selectedKeys = explicitKeys;
  } else {
    // Interactive mode — needs a TTY. If stdin isn't a TTY (piped input, CI, etc.),
    // bail with a clear message rather than hanging on readline.
    if (!process.stdin.isTTY) {
      console.error(red("error: interactive mode requires a TTY."));
      console.error("");
      console.error("Use one of:");
      console.error(`  ${green("--all")}              install for all agents`);
      console.error(`  ${green("--claude")}           install for Claude Code`);
      console.error(`  ${green("--codex")}            install for Codex`);
      console.error(`  ${green("--gemini")}           install for Gemini CLI`);
      console.error("");
      console.error("Flags are combinable, e.g. `--claude --gemini`.");
      process.exit(1);
    }

    // Ask Y/n per agent using a single shared readline.
    // Show current status (not installed / up-to-date / will update) per target,
    // and default the prompt accordingly — "already up-to-date" defaults to No.
    console.log("Pick which agents to install the /workflow-init skill for.");
    console.log(dim("(Press Enter to accept the default, type 'n' to skip.)"));
    console.log("");

    const prompts = allTargets.map((t) => {
      const status = describeState(t);
      // Default Yes for "not installed" or "will update". Default No for "up-to-date".
      const defaultYes = status.action !== "unchanged";
      return {
        text: `  Install for ${t.tool}? ${dim(`(${status.label})`)}`,
        defaultYes,
      };
    });

    const answers = await askMany(prompts);
    selectedKeys = allTargets
      .filter((_, i) => answers[i])
      .map((t) => t.key);
    console.log("");
    if (selectedKeys.length === 0) {
      console.log(dim("No agents selected. Nothing to install."));
      return;
    }
  }

  const selected = allTargets.filter((t) => selectedKeys.includes(t.key));

  console.log(`${dim("source:")} ${skillSrc}`);
  console.log("");

  // Count per outcome so the summary line is honest about what actually happened.
  let counts = { new: 0, updated: 0, unchanged: 0 };

  for (const target of selected) {
    const state = describeState(target);
    counts[state.action]++;

    if (state.action === "unchanged") {
      // Don't touch the file — it's identical. Skip the write to avoid
      // bumping mtime unnecessarily.
      console.log(`  ${dim("·")} ${target.tool} ${dim("(already up-to-date)")}`);
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
  // Summary line reflects what actually happened.
  const parts = [];
  if (counts.new > 0) parts.push(`${counts.new} installed`);
  if (counts.updated > 0) parts.push(`${counts.updated} updated`);
  if (counts.unchanged > 0) parts.push(`${counts.unchanged} already up-to-date`);
  console.log(green(`/workflow-init skill: ${parts.join(", ")}.`));
  console.log("");

  // Print the invocations only for what was actually installed.
  const invocations = {
    claude: "Claude Code:  /workflow-init",
    codex: "Codex:        $workflow-init  (or via /skills picker)",
    gemini: "Gemini CLI:   /workflow-init",
  };
  console.log("Try it from your agent:");
  for (const key of selectedKeys) {
    console.log(`  ${invocations[key]}`);
  }
  console.log("");
  console.log(
    dim(
      "The slash command itself calls `npx @digitaloutbreak/workflow-init init <target>`"
    )
  );
  console.log(
    dim(
      "under the hood — no absolute paths to maintain, no re-install needed if you move things."
    )
  );
  console.log("");
  console.log(
    dim(
      "To add another agent later, re-run with just that flag (e.g. `npx @digitaloutbreak/workflow-init --gemini`)."
    )
  );
}

// ────────────────────────────────────────────────────────────────────── help

function cmdHelp() {
  const help = `
${bold("@digitaloutbreak/workflow-init")} — drop-in workflow scaffold for AI-assisted coding

${bold("Two-step setup, one for life:")}

  ${green("1.")} Run once: ${green("npx @digitaloutbreak/workflow-init")}
     ${dim("Teaches your agent the /workflow-init slash command.")}

  ${green("2.")} From any project dir, in your agent: ${green("/workflow-init")}
     ${dim("Runs the full bootstrap — interview, scaffold, install, fill, first feature.")}

${bold("Usage:")}
  npx @digitaloutbreak/workflow-init                       Interactive — install slash command for chosen agents
  npx @digitaloutbreak/workflow-init ${green("--all")}                 Install for all three agents, no prompts
  npx @digitaloutbreak/workflow-init ${green("--claude")} ${green("--gemini")}      Install for specific agents
  npx @digitaloutbreak/workflow-init ${green("init")} ${dim("[target]")}          ${dim("(advanced)")} Drop workflow files directly into target
  npx @digitaloutbreak/workflow-init ${green("--help")}                Show this message

${bold("Agent flags:")}
  ${green("--claude")}     →  ~/.claude/skills/workflow-init/skill.md
  ${green("--codex")}      →  ~/.agents/skills/workflow-init/SKILL.md
  ${green("--gemini")}     →  ~/.gemini/commands/workflow-init.toml
  ${green("--all")}        →  all three

${bold("Then from any agent session, /workflow-init runs:")}
  • Optional Next.js / Astro / SvelteKit / TanStack Start scaffold (with shadcn opt-in)
  • Drops CLAUDE.md + AGENTS.md + GEMINI.md + docs/context/ + .claude/ into the project
  • Discovery interview with elaboration loops (identity / stack / strategy / surfaces)
  • Fills the templates with your actual answers
  • Recommends a first feature and offers to /feature spec it

${bold("Add another agent later:")}
  npx @digitaloutbreak/workflow-init --codex     ${dim("# adds Codex, leaves others alone")}

${bold("Direct file install — no agent involvement:")}
  npx @digitaloutbreak/workflow-init init ./my-app

  ${dim("This is what the slash command calls internally. Useful if your terminal")}
  ${dim("doesn't have one of the supported agents and you want the docs anyway.")}

${bold("Repo:")} https://github.com/DigitalOutbreak/workflow-init
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
]);

async function main() {
  const args = process.argv.slice(2);
  const first = args[0];

  // Help variants
  if (first === "--help" || first === "-h" || first === "help") {
    cmdHelp();
    return;
  }

  // Explicit init subcommand: install files into a target project.
  // This is the path the slash command itself calls under the hood.
  if (first === "init") {
    cmdInit(args[1]);
    return;
  }

  // Skill-install flow — triggered if any agent flag is present,
  // OR if no args at all (new default UX).
  const isSkillFlag = (a) => SKILL_FLAGS.has(a);
  const skillFlags = args.filter(isSkillFlag);
  const nonFlagArgs = args.filter((a) => !a.startsWith("-") && a !== "init");

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
    console.error(`Run ${green("npx @digitaloutbreak/workflow-init --help")} for usage.`);
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
