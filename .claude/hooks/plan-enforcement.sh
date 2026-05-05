#!/bin/bash
# plan-enforcement.sh — UserPromptSubmit hook.
# Detects implementation intent in user prompts and injects a reminder to
# invoke the harness-pipeline skill before source-code edits begin. This is
# the "prompt" layer of the plan-enforcement triple defense; abac-phase-policy
# provides the hard block on actual Edit/Write tool calls.
#
# chore/* and docs/* branches bypass this reminder — by convention those
# branches carry non-behavioral changes (harness tooling, docs, chores)
# and do not need a plan/TDD cycle. PR review remains the safety net.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/harness-debug.sh
source "$SCRIPT_DIR/lib/harness-debug.sh"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

INPUT=$(cat)
PROMPT=$(echo "$INPUT" | jq -r '.user_prompt // empty')
if [[ -z "$PROMPT" ]]; then
  harness_debug plan-enforcement "empty user_prompt"
  exit 0
fi

# Skip on branches whose convention is explicitly "no plan cycle needed".
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
CURRENT_BRANCH=$(cd "$PROJECT_DIR" 2>/dev/null && git branch --show-current 2>/dev/null || echo "")
case "$CURRENT_BRANCH" in
  chore/*|docs/*)
    harness_debug plan-enforcement "branch=$CURRENT_BRANCH (chore/docs path, no plan required)"
    exit 0
    ;;
esac

# Keywords signal implementation intent. Pulled from config, with built-in
# defaults so bare TypeScript projects still trigger the reminder.
KEYWORDS=()
while IFS= read -r kw; do
  [[ -z "$kw" ]] && continue
  KEYWORDS+=("$kw")
done < <(config_get_array '.implementationIntentKeywords')
if [[ ${#KEYWORDS[@]} -eq 0 ]]; then
  KEYWORDS=(구현 추가 만들어 개발 작성해 implement add build create write develop)
fi

MATCHED=false
for kw in "${KEYWORDS[@]}"; do
  if printf '%s' "$PROMPT" | grep -qi -- "$kw"; then
    MATCHED=true
    break
  fi
done

if [[ "$MATCHED" == "false" ]]; then
  harness_debug plan-enforcement "no implementation intent keyword matched"
  exit 0
fi

# Only nudge when the pipeline is idle. Active runs already have their own gating.
STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
PHASE="none"
if [[ -f "$STATE_FILE" ]]; then
  PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE" 2>/dev/null || echo "none")
fi

case "$PHASE" in
  none|complete)
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext: "REMINDER: Implementation intent detected in the user message. Before editing any source file, invoke the harness-pipeline skill and complete Phase 1 (Plan) with ExitPlanMode approval. The abac-phase-policy hook will hard-block source-code edits until pipeline-state.json reports plan_approved=true. (If the user is working on a chore/* or docs/* branch for non-behavioral changes, this reminder is already suppressed — PR review is the safety net there.)"
      }
    }'
    ;;
  *)
    harness_debug plan-enforcement "phase=$PHASE (reminder only on idle)"
    ;;
esac

exit 0
