#!/bin/bash
set -euo pipefail

# PreToolUse Hook: Subagent file ownership check (ReBAC)
# matcher: Edit|Write
#
# Scope (verified 2026-04-09 via debug-stdin-capture):
#   - Agents spawned via subagent_type: agent_id/agent_type present → ownership check works
#   - Team teammates via TeamCreate: PreToolUse stdin has NO agent_id/agent_type
#     → Cannot identify at PreToolUse level → rebac-teammate-idle.sh handles post-hoc
#
# ownership.json format (teammate_name as key):
# {
#   "mode": "team",
#   "teammates": {
#     "hero-builder": { "files": ["src/..."] },
#     "service-builder": { "files": ["src/..."] }
#   },
#   "shared": ["src/presentation/routes.ts"]
# }
# (Current branch lives in pipeline-state.json — single source of truth.)

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
AGENT_ID=$(echo "$INPUT" | jq -r '.agent_id // empty')

[[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]] && exit 0
[[ -z "$FILE_PATH" ]] && exit 0

# Team teammates have no agent_id in PreToolUse (verified)
# → This hook only works for agents spawned via subagent_type
[[ -z "$AGENT_ID" ]] && exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
OWNERSHIP_FILE="$PROJECT_DIR/.claude/ownership.json"

[[ ! -f "$OWNERSHIP_FILE" ]] && exit 0

MODE=$(jq -r '.mode // "none"' "$OWNERSHIP_FILE" 2>/dev/null || echo "none")
[[ "$MODE" != "team" ]] && exit 0

# Look up teammate by agent_id (subagent_type agents only)
IS_TEAMMATE=$(jq -r --arg aid "$AGENT_ID" '.teammates | has($aid)' "$OWNERSHIP_FILE" 2>/dev/null || echo "false")
[[ "$IS_TEAMMATE" != "true" ]] && exit 0

REL="${FILE_PATH#$PROJECT_DIR/}"

OWNED=false
while IFS= read -r owned_file; do
  [[ -z "$owned_file" ]] && continue
  if [[ "$REL" == "$owned_file" || "$FILE_PATH" == "$owned_file" ]]; then
    OWNED=true
    break
  fi
done < <(jq -r --arg aid "$AGENT_ID" '.teammates[$aid].files // [] | .[]' "$OWNERSHIP_FILE" 2>/dev/null)

if [[ "$OWNED" == "false" ]]; then
  TEAMMATE_NAME="$AGENT_ID"

  # Check if it's a shared file
  IS_SHARED=false
  while IFS= read -r shared_file; do
    [[ -z "$shared_file" ]] && continue
    if [[ "$REL" == "$shared_file" || "$FILE_PATH" == "$shared_file" ]]; then
      IS_SHARED=true
      break
    fi
  done < <(jq -r '.shared // [] | .[]' "$OWNERSHIP_FILE" 2>/dev/null)

  if [[ "$IS_SHARED" == "true" ]]; then
    echo "ReBAC Blocked [$TEAMMATE_NAME]: '$REL' is a shared file." >&2
    echo "  Message the lead for approval before modifying." >&2
  else
    echo "ReBAC Blocked [$TEAMMATE_NAME]: No ownership of '$REL'." >&2
    echo "  Only files assigned to this teammate can be modified." >&2
  fi
  exit 2
fi

exit 0
