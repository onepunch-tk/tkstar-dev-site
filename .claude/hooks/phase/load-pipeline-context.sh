#!/bin/bash
# load-pipeline-context.sh — SessionStart hook.
# Injects a human-readable summary of pipeline-state.json into Claude's
# session context so the model knows the current phase, branch, and issue
# without re-reading CLAUDE.md. Emits minimal output when the pipeline is
# idle to avoid noise at every session start.

set -euo pipefail

STATE_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/runtime/pipeline-state.json"
[[ ! -f "$STATE_FILE" ]] && exit 0

PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE" 2>/dev/null || echo "none")
BRANCH=$(jq -r '.branch // "unknown"' "$STATE_FILE" 2>/dev/null || echo "unknown")
PLAN_APPROVED=$(jq -r '.plan_approved // false' "$STATE_FILE" 2>/dev/null || echo "false")
MODE=$(jq -r '.mode // "none"' "$STATE_FILE" 2>/dev/null || echo "none")
ISSUE=$(jq -r '.issue_number // "none"' "$STATE_FILE" 2>/dev/null || echo "none")
UI_INVOLVED=$(jq -r '.ui_involved // false' "$STATE_FILE" 2>/dev/null || echo "false")

if [[ "$PHASE" == "none" || "$PHASE" == "complete" ]]; then
  CTX="Pipeline Context: idle (current_phase=$PHASE, branch=$BRANCH). Invoke /harness-pipeline to start a new task."
else
  CTX="Pipeline Context: active run in progress.
- current_phase: $PHASE
- mode: $MODE
- branch: $BRANCH
- plan_approved: $PLAN_APPROVED
- issue_number: $ISSUE
- ui_involved: $UI_INVOLVED

Resume work at the appropriate phase reference under .claude/skills/harness-pipeline/references/."
fi

jq -n --arg ctx "$CTX" '{
  hookSpecificOutput: {
    hookEventName: "SessionStart",
    additionalContext: $ctx
  }
}'

exit 0
