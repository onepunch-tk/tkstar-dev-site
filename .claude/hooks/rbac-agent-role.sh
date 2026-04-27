#!/bin/bash
set -euo pipefail

# PreToolUse Hook: Role-based Write/Edit permission restriction (RBAC)
# matcher: Edit|Write
#
# Reads agent_type from hook stdin and checks allowed paths per role.
# Main agent (no agent_type) has no restrictions.

INPUT=$(cat)
AGENT_TYPE=$(echo "$INPUT" | jq -r '.agent_type // empty')
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# Main agent (no agent_type) — no restrictions
[[ -z "$AGENT_TYPE" ]] && exit 0

# Tools other than Edit/Write — no restrictions
[[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]] && exit 0

# No file path — pass through
[[ -z "$FILE_PATH" ]] && exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
REL="${FILE_PATH#$PROJECT_DIR/}"

# Role-based allowed path checker
# return 0 = allowed, return 1 = blocked
file_allowed() {
  local rel="$1"
  local role="$2"

  case "$role" in

    "code-reviewer")
      # Reports directory + own memory only
      [[ "$rel" == docs/reports/* ]] && return 0
      [[ "$rel" == .claude/agent-memory/code-reviewer/* ]] && return 0
      return 1
      ;;

    "unit-test-writer")
      # Test files + own memory only
      [[ "$rel" == *__tests__/* ]] && return 0
      [[ "$rel" == *.test.ts ]] && return 0
      [[ "$rel" == *.test.tsx ]] && return 0
      [[ "$rel" == *.spec.ts ]] && return 0
      [[ "$rel" == *.spec.tsx ]] && return 0
      [[ "$rel" == .claude/agent-memory/unit-test-writer/* ]] && return 0
      return 1
      ;;

    "development-planner")
      # docs/ + tasks/ + own memory
      [[ "$rel" == docs/* ]] && return 0
      [[ "$rel" == tasks/* ]] && return 0
      [[ "$rel" == .claude/agent-memory/development-planner/* ]] && return 0
      return 1
      ;;

    "prd-generator")
      [[ "$rel" == docs/* ]] && return 0
      [[ "$rel" == .claude/agent-memory/prd-generator/* ]] && return 0
      return 1
      ;;

    "prd-validator")
      [[ "$rel" == docs/* ]] && return 0
      [[ "$rel" == .claude/agent-memory/prd-validator/* ]] && return 0
      return 1
      ;;

    "roadmap-validator")
      [[ "$rel" == docs/* ]] && return 0
      [[ "$rel" == .claude/agent-memory/roadmap-validator/* ]] && return 0
      return 1
      ;;

    "project-structure-analyzer")
      [[ "$rel" == docs/* ]] && return 0
      [[ "$rel" == .claude/agent-memory/project-structure-analyzer/* ]] && return 0
      return 1
      ;;

    "e2e-tester")
      # Reports + E2E test files + own memory
      [[ "$rel" == docs/reports/* ]] && return 0
      [[ "$rel" == e2e/* ]] && return 0
      [[ "$rel" == tests/* ]] && return 0
      [[ "$rel" == cypress/* ]] && return 0
      [[ "$rel" == playwright/* ]] && return 0
      [[ "$rel" == *__tests__/* ]] && return 0
      [[ "$rel" == *.test.ts ]] && return 0
      [[ "$rel" == *.test.tsx ]] && return 0
      [[ "$rel" == *.spec.ts ]] && return 0
      [[ "$rel" == *.spec.tsx ]] && return 0
      [[ "$rel" == .claude/agent-memory/e2e-tester/* ]] && return 0
      return 1
      ;;

    "starter-cleaner")
      # Full project cleanup access (required by purpose)
      return 0
      ;;

    "task-executor")
      # ReBAC (ownership.json) manages file ownership — no RBAC restrictions
      return 0
      ;;

    *)
      # Unknown role — allow (permissive default)
      return 0
      ;;
  esac
}

if ! file_allowed "$REL" "$AGENT_TYPE"; then
  echo "RBAC Blocked [$AGENT_TYPE]: No write permission for '$REL'" >&2
  echo "  Allowed paths: Only designated directories for agent '$AGENT_TYPE'." >&2
  exit 2
fi

exit 0
