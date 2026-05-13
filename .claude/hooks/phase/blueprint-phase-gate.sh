#!/bin/bash
# blueprint-phase-gate.sh — PreToolUse hook for /blueprint orchestration.
# Enforces the per-mode phase sequence defined in
# .claude/skills/blueprint/SKILL.md by gating two surfaces:
#
#   1. Bash:  blocks renderer-script runs (generate_prd.py /
#             generate_project_structure.py / generate_roadmap.py) that fire
#             outside their expected gen-phase.
#   2. Bash + Write/Edit: blocks writes to
#             .claude/runtime/blueprint-state.json that advance current_phase
#             outside the mode's allowed sequence (only +1 step forward or
#             rewind-to-*-gen on validation-fail are permitted).
#
# Activation: only when .claude/runtime/blueprint-state.json exists; absent →
# silent exit 0 (skill is dormant).
#
# Escape: BLUEPRINT_BYPASS=1 (one-shot emergency only). Mirrors the
# HARNESS_BYPASS pattern used by abac-phase-policy.sh.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/harness-debug.sh
source "$SCRIPT_DIR/../lib/harness-debug.sh" 2>/dev/null || harness_debug() { :; }

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [[ "${BLUEPRINT_BYPASS:-0}" == "1" ]]; then
  harness_debug bp "BLUEPRINT_BYPASS=1"
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_FILE="$PROJECT_DIR/.claude/runtime/blueprint-state.json"
if [[ ! -f "$STATE_FILE" ]]; then
  harness_debug bp "no state file"
  exit 0
fi

PHASE=$(jq -r '.current_phase // "intent"' "$STATE_FILE" 2>/dev/null || echo intent)
MODE=$(jq -r '.mode // ""' "$STATE_FILE" 2>/dev/null || echo "")

# Return the allowed phase sequence (space-separated, index = step) for the
# given mode. Empty echo signals an unknown mode.
allowed_sequence_for_mode() {
  case "$1" in
    bootstrap)         echo "intent prd-gen prd-validate ps-gen roadmap-gen roadmap-validate complete" ;;
    prd)               echo "intent prd-gen prd-validate complete" ;;
    project-structure) echo "intent ps-gen complete" ;;
    roadmap)           echo "intent roadmap-gen roadmap-validate complete" ;;
    *)                 echo "" ;;
  esac
}

emit_block() {
  echo "Blueprint Phase Gate 차단: $1" >&2
  echo "  현재 phase: $PHASE (mode=$MODE)" >&2
  echo "  해결: 순서대로 직전 phase를 완료한 뒤 재시도하세요. 일회 우회는 BLUEPRINT_BYPASS=1." >&2
  exit 2
}

idx_of() {
  local target="$1" seq="$2" i=0 p
  for p in $seq; do
    if [[ "$p" == "$target" ]]; then echo "$i"; return; fi
    i=$((i+1))
  done
  echo "-1"
}

# Validate a proposed phase transition against the current mode's sequence.
# Allowed: same phase (idempotent), +1 step forward, or rewind to any *-gen.
validate_transition() {
  local new_phase="$1"
  local seq
  seq=$(allowed_sequence_for_mode "$MODE")
  [[ -z "$seq" ]] && emit_block "알 수 없는 mode: '$MODE' (state 파일 손상 가능)"

  local cur_idx new_idx diff
  cur_idx=$(idx_of "$PHASE" "$seq")
  new_idx=$(idx_of "$new_phase" "$seq")
  (( new_idx < 0 )) && emit_block "phase '$new_phase' 은 mode '$MODE' 에서 허용되지 않습니다."

  diff=$((new_idx - cur_idx))
  if (( diff == 0 || diff == 1 )); then
    return 0
  fi
  if (( diff < 0 )) && [[ "$new_phase" == *-gen ]]; then
    return 0
  fi
  emit_block "phase jump 금지: $PHASE → $new_phase (1단계 전진 또는 *-gen rewind만 허용)"
}

# Extract `.current_phase` from a JSON blob via jq. Empty if absent or malformed.
extract_phase_from_json() {
  local blob="$1"
  echo "$blob" | jq -r '.current_phase // empty' 2>/dev/null || true
}

# True when the bash command actually *executes* one of the renderer scripts,
# i.e. it starts with a recognized interpreter and references the script.
# Mere mentions (`cat generate_prd.py`, `grep foo generate_prd.py`, doc strings)
# do NOT match.
is_renderer_invocation() {
  local cmd="$1" script="$2"
  echo "$cmd" | grep -qE "^[[:space:]]*(python[23]?|uv[[:space:]]+run|bun([[:space:]]+run)?|node|\./)" || return 1
  echo "$cmd" | grep -qE "(^|[[:space:]/])${script}([[:space:]]|$)"
}

# True when the bash command appears to *mutate* the state file (write, in-place
# edit, move-onto, tee). Read-only inspection (cat, jq -r, grep, head/tail) is
# allowed. Always-block writes via Bash and force them through Write/Edit so the
# Write/Edit branch's strict JSON validation runs.
is_state_mutation() {
  local cmd="$1"
  echo "$cmd" | grep -q 'blueprint-state\.json' || return 1
  echo "$cmd" | grep -qE '(>>?[[:space:]]*[^|]*blueprint-state\.json|sed[[:space:]]+-i|jq[[:space:]]+[^|]*-i\b|tee[[:space:]]+[^|]*blueprint-state\.json|mv[[:space:]]+[^|]+[[:space:]]+[^|]*blueprint-state\.json|cp[[:space:]]+[^|]+[[:space:]]+[^|]*blueprint-state\.json)'
}

case "$TOOL_NAME" in
  Bash)
    COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
    [[ -z "$COMMAND" ]] && exit 0

    # 1. Renderer-script gate (execution only — viewing/reading is unrestricted).
    EXPECTED=""
    if is_renderer_invocation "$COMMAND" 'generate_prd\.py';               then EXPECTED="prd-gen"
    elif is_renderer_invocation "$COMMAND" 'generate_project_structure\.py'; then EXPECTED="ps-gen"
    elif is_renderer_invocation "$COMMAND" 'generate_roadmap\.py';           then EXPECTED="roadmap-gen"
    fi
    if [[ -n "$EXPECTED" && "$PHASE" != "$EXPECTED" ]]; then
      emit_block "이 renderer는 '$EXPECTED' phase에서만 실행 가능합니다."
    fi

    # 2. Block state mutations from Bash — route them through Write so the
    # Write branch can parse the full post-tool JSON. This closes the
    # regex-evasion bypass surface for partial mutations (`sed -i s/.../`,
    # `jq -i '.current_phase = ...'`, `> file` truncation, etc.).
    if is_state_mutation "$COMMAND"; then
      emit_block "state 파일 직접 수정 금지: Bash 대신 Write 툴로 blueprint-state.json 을 업데이트하세요."
    fi
    ;;
  Write)
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    [[ "$FILE_PATH" != *"/blueprint-state.json" ]] && exit 0

    NEW_CONTENT=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
    NEW_PHASE=$(extract_phase_from_json "$NEW_CONTENT")
    [[ -n "$NEW_PHASE" ]] && validate_transition "$NEW_PHASE"
    ;;
  Edit)
    # Edit on blueprint-state.json is forbidden — partial replacements break
    # the hook's ability to validate the full post-edit JSON. The state file is
    # tiny and machine-generated; always rewrite it with Write.
    FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
    [[ "$FILE_PATH" != *"/blueprint-state.json" ]] && exit 0
    emit_block "blueprint-state.json 은 Edit 사용 금지 — Write 툴로 전체 내용을 덮어쓰세요."
    ;;
  *)
    exit 0
    ;;
esac

exit 0
