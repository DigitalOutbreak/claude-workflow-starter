#!/usr/bin/env bash
# setup.sh — install the /workflow-init global skill, pointing at THIS starter's location.
#
# Run once per machine after cloning the starter. Idempotent — safe to re-run after moving
# the starter to a new path (it'll re-patch the skill).
#
# Usage:
#   bash ./bin/setup.sh
#
# What it does:
#   1. Detects this starter's absolute path (resolves symlinks).
#   2. Substitutes that path into the skill template's {{STARTER_DIR}} placeholder.
#   3. Writes the patched skill to ~/.claude/skills/workflow-init/skill.md.
#   4. Confirms the global skill is installed.

set -euo pipefail

# Resolve this starter's absolute path, following symlinks.
SCRIPT_PATH="$(perl -MCwd -e 'print Cwd::abs_path shift' "${BASH_SOURCE[0]}")"
STARTER_DIR="$(cd "$(dirname "$SCRIPT_PATH")/.." && pwd)"

SKILL_SRC="$STARTER_DIR/skill/workflow-init/skill.md"
SKILL_DEST_DIR="$HOME/.claude/skills/workflow-init"
SKILL_DEST="$SKILL_DEST_DIR/skill.md"

# Sanity checks.
if [[ ! -f "$SKILL_SRC" ]]; then
  echo "error: skill source not found at $SKILL_SRC" >&2
  echo "       are you running setup.sh from inside the starter directory?" >&2
  exit 1
fi

if [[ ! -f "$STARTER_DIR/bin/init.sh" ]]; then
  echo "error: bin/init.sh missing — this doesn't look like the claude-workflow starter" >&2
  echo "       starter dir resolved as: $STARTER_DIR" >&2
  exit 1
fi

echo "starter:      $STARTER_DIR"
echo "skill source: $SKILL_SRC"
echo "skill dest:   $SKILL_DEST"
echo ""

# Patch + install.
mkdir -p "$SKILL_DEST_DIR"

# Use a delimiter unlikely to appear in the path. The STARTER_DIR shouldn't contain '|' chars.
sed "s|{{STARTER_DIR}}|$STARTER_DIR|g" "$SKILL_SRC" > "$SKILL_DEST"

# Confirm the substitution worked (no leftover placeholders).
if grep -q "{{STARTER_DIR}}" "$SKILL_DEST"; then
  echo "error: substitution failed — {{STARTER_DIR}} still present in $SKILL_DEST" >&2
  exit 2
fi

echo "Installed /workflow-init skill."
echo ""
echo "Try it from any Claude Code session:"
echo "  /workflow-init           # install starter into current dir"
echo "  /workflow-init ./my-app  # install starter into ./my-app"
echo ""
echo "If you move this starter to a different path later, re-run:"
echo "  bash <new-path>/bin/setup.sh"
