#!/bin/bash
set -euo pipefail

# PreToolUse Hook: Phase gate
# matcher: Bash | Edit | Write
#
# HARD BLOCK on pipeline-state.json write that transitions current_phase
# to "validate" while review issues remain unresolved.
#
# Gate condition (review → validate):
#   - review_unresolved_count > 0 → BLOCK
#   - ui_involved=true AND design_review_unresolved_count > 0 → BLOCK
#
# Both counters are integers maintained by the main agent in
# pipeline-state.json: set to N after the reviewer sub-agent reports N
# issues, decremented as each issue is fixed. The previous file-grep
# approach (scanning report markdown for `- [ ]`) was replaced by this
# state-flag check — see the Part 2 review-flow lightening change for
# rationale (commit ceremony + branch-diff scoping eliminated).
#
# Triggers on Bash, Write, and Edit — any path that can mutate
# pipeline-state.json must be gated.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')
[[ -z "$TOOL_NAME" ]] && exit 0

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_FILE="$PROJECT_DIR/.claude/pipeline-state.json"
[[ ! -f "$STATE_FILE" ]] && exit 0

CURRENT_PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE" 2>/dev/null || echo "none")

# ─── Transition detection (tool-dispatched) ───
#
# Returns 0 if the current tool call is a pipeline-state.json write that
# transitions current_phase → "validate", 1 otherwise.

is_validate_transition_write() {
    [[ "$CURRENT_PHASE" == "review" ]] || return 1

    case "$TOOL_NAME" in
        Bash)
            local command
            command=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
            [[ -z "$command" ]] && return 1
            echo "$command" | grep -q 'pipeline-state\.json' || return 1
            echo "$command" | grep -qE '"current_phase"[[:space:]]*:[[:space:]]*"validate"' || return 1
            return 0
            ;;
        Write)
            local file_path content
            file_path=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
            [[ "$file_path" == *"/pipeline-state.json" ]] || return 1
            content=$(echo "$INPUT" | jq -r '.tool_input.content // empty')
            [[ -z "$content" ]] && return 1
            echo "$content" | grep -qE '"current_phase"[[:space:]]*:[[:space:]]*"validate"' || return 1
            return 0
            ;;
        Edit)
            local file_path new_string
            file_path=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
            [[ "$file_path" == *"/pipeline-state.json" ]] || return 1
            new_string=$(echo "$INPUT" | jq -r '.tool_input.new_string // empty')
            [[ -z "$new_string" ]] && return 1
            echo "$new_string" | grep -qE '"current_phase"[[:space:]]*:[[:space:]]*"validate"' || return 1
            return 0
            ;;
        *)
            return 1
            ;;
    esac
}

# ─── Gate: review → validate transition ───

if is_validate_transition_write; then
    REVIEW_COUNT=$(jq -r '.review_unresolved_count // 0' "$STATE_FILE" 2>/dev/null || echo 0)
    DESIGN_COUNT=$(jq -r '.design_review_unresolved_count // 0' "$STATE_FILE" 2>/dev/null || echo 0)
    UI_INVOLVED=$(jq -r '.ui_involved // false' "$STATE_FILE" 2>/dev/null || echo "false")

    # Sanitize to integers (defensive against null/non-numeric).
    REVIEW_COUNT=$(echo "$REVIEW_COUNT" | tr -cd '0-9')
    DESIGN_COUNT=$(echo "$DESIGN_COUNT" | tr -cd '0-9')
    [[ -z "$REVIEW_COUNT" ]] && REVIEW_COUNT=0
    [[ -z "$DESIGN_COUNT" ]] && DESIGN_COUNT=0

    FAIL=0

    if (( REVIEW_COUNT > 0 )); then
        echo "Phase Gate BLOCKED [review → validate]: code-review has $REVIEW_COUNT unresolved issue(s)." >&2
        echo "  Fix all reported issues, then decrement review_unresolved_count to 0:" >&2
        echo "    jq '.review_unresolved_count = 0' .claude/pipeline-state.json > /tmp/_s && mv /tmp/_s .claude/pipeline-state.json" >&2
        FAIL=1
    fi

    if [[ "$UI_INVOLVED" == "true" ]] && (( DESIGN_COUNT > 0 )); then
        echo "Phase Gate BLOCKED [review → validate]: design-review has $DESIGN_COUNT unresolved issue(s)." >&2
        echo "  Fix all reported issues, then decrement design_review_unresolved_count to 0." >&2
        FAIL=1
    fi

    (( FAIL == 1 )) && exit 2
fi

exit 0
