#!/usr/bin/env bash
# init.sh — copy this starter into the current directory (or a specified target).
#
# Usage:
#   bash ~/Developer/_starters/claude-workflow/bin/init.sh           # → into current dir
#   bash ~/Developer/_starters/claude-workflow/bin/init.sh ./myapp   # → into ./myapp
#
# Refuses to overwrite if any target file already exists.

set -euo pipefail

STARTER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-.}"

if [[ ! -d "$TARGET" ]]; then
  echo "error: target '$TARGET' does not exist" >&2
  exit 1
fi

TARGET="$(cd "$TARGET" && pwd)"

echo "starter:  $STARTER_DIR"
echo "target:   $TARGET"
echo ""

# Files we'd copy. Built once so the same list drives both the conflict check and the actual copy.
FILES=(
  "CLAUDE.md"
  "AGENTS.md"
  "GEMINI.md"
  "docs/context/thesis.md"
  "docs/context/project-overview.md"
  "docs/context/coding-standards.md"
  "docs/context/ai-interaction.md"
  "docs/context/current-feature.md"
  "docs/context/backlog.md"
  "docs/specs/project-spec.md"
  ".claude/agents/code-scanner.md"
)

DIRS=(
  ".claude/skills/feature"
  ".claude/skills/cleanup"
)

# Conflict check
conflicts=()
for f in "${FILES[@]}"; do
  [[ -e "$TARGET/$f" ]] && conflicts+=("$f")
done
for d in "${DIRS[@]}"; do
  [[ -e "$TARGET/$d" ]] && conflicts+=("$d/")
done

if (( ${#conflicts[@]} > 0 )); then
  echo "error: target already has these — refusing to overwrite:" >&2
  for c in "${conflicts[@]}"; do
    echo "  - $c" >&2
  done
  echo ""
  echo "Remove or rename them first, or copy into a fresh directory." >&2
  exit 2
fi

# Copy
for f in "${FILES[@]}"; do
  mkdir -p "$TARGET/$(dirname "$f")"
  cp "$STARTER_DIR/$f" "$TARGET/$f"
  echo "  + $f"
done
for d in "${DIRS[@]}"; do
  mkdir -p "$TARGET/$(dirname "$d")"
  cp -r "$STARTER_DIR/$d" "$TARGET/$d"
  echo "  + $d/"
done

# Empty placeholder dirs
mkdir -p "$TARGET/docs/context/features"
echo "  + docs/context/features/ (empty — per-feature specs land here)"

echo ""
echo "Done. Next:"
echo "  1. Edit CLAUDE.md — replace {{Project Name}} and the project layout."
echo "  2. Fill in docs/context/thesis.md — your strategic memo."
echo "  3. Fill in docs/context/project-overview.md — what you're building."
echo "  4. Adjust docs/context/coding-standards.md if your stack differs from Next 16 + TS + Tailwind v4."
echo "  5. Sketch docs/specs/project-spec.md when implementation needs deeper detail."
echo "  6. Start a Claude session — CLAUDE.md and the @-imports load automatically."
