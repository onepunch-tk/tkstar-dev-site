#!/bin/bash
# abac-phase-policy.sh — PreToolUse hook on Edit|Write tools.
# ABAC guard that blocks source-code edits outside an approved pipeline run.
#
#   current_phase == "none" (or pipeline-state.json missing)
#     → pipeline is idle. Block any source-extension file; allow docs, tests,
#       and anything matched by allowedDuringPlanPatterns.
#   current_phase == "plan"
#     → same restriction as idle.
#   current_phase == "tdd" && plan_approved != true
#     → same restriction as idle.
#   current_phase == "tdd" && plan_approved == true
#     → allow all edits.
#   current_phase in ("review", "validate", "complete")
#     → allow all edits.
#
# Escape hatch: `HARNESS_BYPASS=1` skips every check. Use only for one-shot
# emergency edits; do not enable it for regular work.
#
# Patterns and extensions are loaded from .claude/config.json via lib/config.sh
# so the harness stays portable across TypeScript projects.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/harness-debug.sh
source "$SCRIPT_DIR/lib/harness-debug.sh"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "Write" ]]; then
  harness_debug abac "tool=$TOOL_NAME (not Edit/Write)"
  exit 0
fi
if [[ -z "$FILE_PATH" ]]; then
  harness_debug abac "no file_path in tool input"
  exit 0
fi

if [[ "${HARNESS_BYPASS:-0}" == "1" ]]; then
  harness_debug abac "HARNESS_BYPASS=1"
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_FILE="$PROJECT_DIR/.claude/pipeline-state.json"

PHASE="none"
PLAN_APPROVED="false"
if [[ -f "$STATE_FILE" ]]; then
  PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE" 2>/dev/null || echo "none")
  PLAN_APPROVED=$(jq -r '.plan_approved // false' "$STATE_FILE" 2>/dev/null || echo "false")
fi

# Phases that never restrict edits.
case "$PHASE" in
  review|validate|complete)
    harness_debug abac "phase=$PHASE (edits always allowed)"
    exit 0
    ;;
  tdd)
    if [[ "$PLAN_APPROVED" == "true" ]]; then
      harness_debug abac "phase=tdd with plan_approved=true"
      exit 0
    fi
    ;;
esac

REL="${FILE_PATH#$PROJECT_DIR/}"

# Load allowlist patterns from config; fall back to sensible defaults when
# config.json is absent so the harness works on a bare TypeScript project
# without any setup.
ALLOWED_PATTERNS=()
while IFS= read -r p; do
  [[ -z "$p" ]] && continue
  ALLOWED_PATTERNS+=("$p")
done < <(config_get_array '.allowedDuringPlanPatterns')
if [[ ${#ALLOWED_PATTERNS[@]} -eq 0 ]]; then
  ALLOWED_PATTERNS=(
    "docs/**" "tasks/**" ".claude/**"
    "**/*.md" "**/*.json" "**/*.yaml" "**/*.yml" "**/*.toml"
    ".env*" ".gitignore" ".gitattributes"
  )
fi

TEST_PATTERNS=()
while IFS= read -r p; do
  [[ -z "$p" ]] && continue
  TEST_PATTERNS+=("$p")
done < <(config_get_array '.testFilePatterns')
if [[ ${#TEST_PATTERNS[@]} -eq 0 ]]; then
  TEST_PATTERNS=(
    "**/__tests__/**" "**/*.test.ts" "**/*.test.tsx" "**/*.test.js" "**/*.test.jsx"
    "**/*.spec.ts" "**/*.spec.tsx" "**/*.spec.js" "**/*.spec.jsx"
  )
fi

SOURCE_EXTS=()
while IFS= read -r e; do
  [[ -z "$e" ]] && continue
  SOURCE_EXTS+=("$e")
done < <(config_get_array '.sourceExtensions')
if [[ ${#SOURCE_EXTS[@]} -eq 0 ]]; then
  SOURCE_EXTS=(.ts .tsx .js .jsx .mjs .cjs)
fi

# True when the file matches either the allow-list patterns or test patterns.
is_allowed_path() {
  local rel="$1" pattern
  for pattern in "${ALLOWED_PATTERNS[@]}"; do
    # shellcheck disable=SC2053
    [[ "$rel" == $pattern ]] && return 0
  done
  for pattern in "${TEST_PATTERNS[@]}"; do
    # shellcheck disable=SC2053
    [[ "$rel" == $pattern ]] && return 0
  done
  return 1
}

# True when the file extension is on the source-code extension list.
is_source_file() {
  local rel="$1"
  local ext=".${rel##*.}"
  local candidate
  for candidate in "${SOURCE_EXTS[@]}"; do
    if [[ "$ext" == "$candidate" ]]; then
      return 0
    fi
  done
  return 1
}

# Emit a user-facing block message (Korean, surfaced in the user's terminal)
# and exit 2 to stop the tool call.
emit_block() {
  local reason="$1"
  echo "ABAC 차단: $reason" >&2
  echo "  파일: $REL" >&2
  echo "  상태: current_phase=$PHASE, plan_approved=$PLAN_APPROVED" >&2
  echo "  해결: /harness-pipeline 스킬을 먼저 실행하거나, 일회 우회가 필요하면 HARNESS_BYPASS=1 환경변수를 설정하세요." >&2
  exit 2
}

case "$PHASE" in
  none)
    if is_allowed_path "$REL"; then
      exit 0
    fi
    if is_source_file "$REL"; then
      emit_block "파이프라인이 대기 상태입니다. 소스 파일 편집 전 /harness-pipeline 을 실행하세요."
    fi
    ;;
  plan)
    if is_allowed_path "$REL"; then
      exit 0
    fi
    if is_source_file "$REL"; then
      emit_block "Plan 단계에서는 소스 파일 편집이 금지됩니다."
    fi
    ;;
  tdd)
    # Reach here only when plan_approved != true (early return guarded above).
    if is_allowed_path "$REL"; then
      exit 0
    fi
    if is_source_file "$REL"; then
      emit_block "TDD 단계 편집은 Plan 승인이 필요합니다. ExitPlanMode 후 plan_approved=true 로 업데이트하세요."
    fi
    ;;
esac

exit 0
