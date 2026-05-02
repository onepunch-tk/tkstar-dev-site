#!/bin/bash
set -euo pipefail

# TeammateIdle Hook: Ownership violation check before teammate goes idle (ReBAC)
# matcher: (empty — TeammateIdle event)
#
# Checks uncommitted changes when a teammate transitions to idle.
# Blocks (exit 2) if changes are found in files not owned by the teammate.
# Shared file changes produce a warning but are allowed.

INPUT=$(cat)

# TeammateIdle stdin has teammate_name (NOT agent_id) — verified
TEAMMATE_NAME=$(echo "$INPUT" | jq -r '.teammate_name // empty')
[[ -z "$TEAMMATE_NAME" ]] && exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
OWNERSHIP_FILE="$PROJECT_DIR/.claude/runtime/ownership.json"

[[ ! -f "$OWNERSHIP_FILE" ]] && exit 0

MODE=$(jq -r '.mode // "none"' "$OWNERSHIP_FILE" 2>/dev/null || echo "none")
[[ "$MODE" != "team" ]] && exit 0

# Check if teammate_name is registered in ownership.json
IS_REGISTERED=$(jq -r --arg name "$TEAMMATE_NAME" '.teammates | has($name)' "$OWNERSHIP_FILE" 2>/dev/null || echo "false")
[[ "$IS_REGISTERED" != "true" ]] && exit 0

# List uncommitted changed files against HEAD
cd "$PROJECT_DIR"
CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null || true)

[[ -z "$CHANGED_FILES" ]] && exit 0

# Owned files list (lookup by teammate_name key)
OWNED_FILES=$(jq -r --arg name "$TEAMMATE_NAME" '.teammates[$name].files // [] | .[]' "$OWNERSHIP_FILE" 2>/dev/null || true)
# Shared files list
SHARED_FILES=$(jq -r '.shared // [] | .[]' "$OWNERSHIP_FILE" 2>/dev/null || true)

VIOLATIONS=()
SHARED_WARNINGS=()

while IFS= read -r changed; do
  [[ -z "$changed" ]] && continue

  # Check if file is owned
  OWNED=false
  while IFS= read -r owned; do
    [[ -z "$owned" ]] && continue
    [[ "$changed" == "$owned" ]] && { OWNED=true; break; }
  done <<< "$OWNED_FILES"

  if [[ "$OWNED" == "false" ]]; then
    # Check if file is shared
    IS_SHARED=false
    while IFS= read -r shared; do
      [[ -z "$shared" ]] && continue
      [[ "$changed" == "$shared" ]] && { IS_SHARED=true; break; }
    done <<< "$SHARED_FILES"

    if [[ "$IS_SHARED" == "true" ]]; then
      SHARED_WARNINGS+=("$changed")
    else
      VIOLATIONS+=("$changed")
    fi
  fi
done <<< "$CHANGED_FILES"

# Shared file warning (non-blocking)
if [[ ${#SHARED_WARNINGS[@]} -gt 0 ]]; then
  echo "ReBAC Warning [$TEAMMATE_NAME]: Shared file changes detected (lead approval required)" >&2
  for w in "${SHARED_WARNINGS[@]}"; do
    echo "  ⚠  $w" >&2
  done
fi

# Ownership violation — blocked
if [[ ${#VIOLATIONS[@]} -gt 0 ]]; then
  echo "ReBAC Blocked [$TEAMMATE_NAME]: Uncommitted changes in unowned files" >&2
  for v in "${VIOLATIONS[@]}"; do
    echo "  ✗  $v" >&2
  done
  echo "" >&2
  echo "  Resolution:" >&2
  echo "    1. Revert changes to those files (git checkout -- <file>)" >&2
  echo "    2. Or request ownership transfer from the lead" >&2
  exit 2
fi

exit 0
