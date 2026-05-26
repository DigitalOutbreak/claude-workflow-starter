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

function cmdInstallSkill() {
  const skillSrc = path.join(PKG_ROOT, "skill", "workflow-init", "skill.md");
  if (!exists(skillSrc)) {
    console.error(red(`error: skill source not found at ${skillSrc}`));
    process.exit(1);
  }

  const skillContent = fs.readFileSync(skillSrc, "utf8");

  // Each tool has a different global location, filename, and format.
  // Same source content; we transform for Gemini and copy verbatim for Claude/Codex.
  const targets = [
    {
      tool: "Claude Code",
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
      tool: "Codex (CLI / IDE / app)",
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
      tool: "Gemini CLI",
      dest: path.join(
        os.homedir(),
        ".gemini",
        "commands",
        "workflow-init.toml"
      ),
      content: buildGeminiTOML(skillContent),
    },
  ];

  console.log(`${dim("source:")} ${skillSrc}`);
  console.log("");

  for (const target of targets) {
    fs.mkdirSync(path.dirname(target.dest), { recursive: true });
    fs.writeFileSync(target.dest, target.content);
    console.log(`  ${green("+")} ${target.tool}`);
    console.log(`    ${dim(target.dest)}`);
  }

  console.log("");
  console.log(green("Installed /workflow-init global skill."));
  console.log("");
  console.log("Try it from any supported agent:");
  console.log("  Claude Code:  /workflow-init");
  console.log("  Codex:        $workflow-init  (or via /skills picker)");
  console.log("  Gemini CLI:   /workflow-init");
  console.log("");
  console.log(
    dim("The skill delegates to `npx @digitaloutbreak/workflow-init` —")
  );
  console.log(
    dim(
      "no absolute paths to maintain, no need to re-run install when you move things."
    )
  );
}

// ────────────────────────────────────────────────────────────────────── help

function cmdHelp() {
  const help = `
${bold("@digitaloutbreak/workflow-init")} — drop-in workflow scaffold for Claude Code projects

${bold("Usage:")}
  npx @digitaloutbreak/workflow-init ${dim("[target]")}        Install starter into target (default: cwd)
  npx @digitaloutbreak/workflow-init ${green("--install-skill")}    Install the /workflow-init global slash command
  npx @digitaloutbreak/workflow-init ${green("--help")}             Show this message

${bold("Examples:")}
  ${dim("# From a fresh project directory")}
  npx @digitaloutbreak/workflow-init

  ${dim("# Targeting a specific path")}
  npx @digitaloutbreak/workflow-init ./my-app

  ${dim("# Install the global slash command (one-time, per machine)")}
  npx @digitaloutbreak/workflow-init --install-skill

  ${dim("# Then from any Claude Code session:")}
  /workflow-init
  /workflow-init ./my-app

${bold("What gets installed:")}
  CLAUDE.md, AGENTS.md, docs/context/* (5 docs), docs/specs/project-spec.md,
  .claude/agents/code-scanner.md, .claude/skills/feature/, .claude/skills/cleanup/

The default command refuses to overwrite existing files — safe to run anywhere.

${bold("Repo:")} https://github.com/DigitalOutbreak/claude-workflow-starter
`;
  console.log(help);
}

// ────────────────────────────────────────────────────────────────────── main

function main() {
  const args = process.argv.slice(2);
  const first = args[0];

  // Help variants
  if (first === "--help" || first === "-h" || first === "help") {
    cmdHelp();
    return;
  }

  // Install-skill flag
  if (first === "--install-skill" || first === "install-skill" || first === "install") {
    cmdInstallSkill();
    return;
  }

  // Reject unknown flags
  if (first && first.startsWith("-")) {
    console.error(red(`unknown flag: ${first}`));
    console.error(`Run ${green("npx @digitaloutbreak/workflow-init --help")} for usage.`);
    process.exit(1);
  }

  // Default action: init. Optional first arg is the target path.
  // Also accept "init" as an explicit subcommand for backwards compat.
  if (first === "init") {
    cmdInit(args[1]);
  } else {
    cmdInit(first);
  }
}

main();
