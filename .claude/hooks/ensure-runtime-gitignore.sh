#!/bin/bash
# ensure-runtime-gitignore.sh — SessionStart hook.
# Idempotent guard that keeps Claude Code runtime state files out of VCS.
# Auto-appends missing entries to .gitignore under a managed section, and
# warns (but does NOT remove) when runtime files are already tracked — any
# destructive git operations are left to the user.
#
# Required entries come from .claude/config.json (.runtimeGitignoreEntries).
# A built-in default list covers projects without a custom config.

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
GITIGNORE="$PROJECT_DIR/.gitignore"
SECTION_MARKER="# Claude Code runtime state (auto-managed — do not edit)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

# Load required entries from config, falling back to built-in defaults.
REQUIRED_ENTRIES=()
while IFS= read -r entry; do
  [[ -z "$entry" ]] && continue
  REQUIRED_ENTRIES+=("$entry")
done < <(config_get_array '.runtimeGitignoreEntries')

if [[ ${#REQUIRED_ENTRIES[@]} -eq 0 ]]; then
  REQUIRED_ENTRIES=(
    ".claude/hook-state.json"
    ".claude/pipeline-state.json"
    ".claude/ownership.json"
    ".claude/agent-memory/"
    "coverage/"
  )
fi

# Not a git repo — nothing to do.
[[ ! -d "$PROJECT_DIR/.git" ]] && exit 0

# Ensure .gitignore exists.
[[ ! -f "$GITIGNORE" ]] && touch "$GITIGNORE"

# Compute missing entries by exact-line match.
MISSING=()
for entry in "${REQUIRED_ENTRIES[@]}"; do
  if ! grep -Fxq "$entry" "$GITIGNORE"; then
    MISSING+=("$entry")
  fi
done

# Append missing entries under the managed section (create the section if absent).
if [[ ${#MISSING[@]} -gt 0 ]]; then
  if ! grep -Fxq "$SECTION_MARKER" "$GITIGNORE"; then
    {
      printf '\n%s\n' "$SECTION_MARKER"
      printf '%s\n' "${MISSING[@]}"
    } >> "$GITIGNORE"
  else
    # Section already exists — append the new entries at EOF.
    printf '%s\n' "${MISSING[@]}" >> "$GITIGNORE"
  fi
  echo "✓ .gitignore auto-heal: added ${#MISSING[@]} missing runtime entries (${MISSING[*]})" >&2
fi

# Warn if any required entry is still tracked by git (non-destructive).
cd "$PROJECT_DIR"
for entry in "${REQUIRED_ENTRIES[@]}"; do
  PATTERN="${entry%/}"
  TRACKED=$(git ls-files --error-unmatch "$PATTERN" 2>/dev/null || true)
  if [[ -n "$TRACKED" ]]; then
    echo "⚠️  $entry is gitignored but still tracked." >&2
    echo "    Run:  git rm --cached -r $PATTERN" >&2
    echo "    Then commit the removal via PR per CLAUDE.md rules." >&2
  fi
done

exit 0
