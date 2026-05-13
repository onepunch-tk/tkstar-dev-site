#!/bin/bash
# PostToolUse hook — matcher: ExitPlanMode
#
# Automatically flips `plan_approved` to `true` in `.claude/runtime/pipeline-state.json`
# immediately after the user approves a plan via `ExitPlanMode`.
#
# Why this hook exists:
#   The agent-side safety filter blocks direct Edit/Write of `plan_approved`
#   to prevent agents from skipping plan mode and self-gating. That protection
#   is intentional — but it leaves no legitimate path to flip the gate after
#   a real approval. This hook closes that gap: it runs from the Claude Code
#   runtime (not agent context), and cannot be triggered without an actual
#   `ExitPlanMode` invocation followed by user approval.
#
# Safety posture:
#   - Agent cannot forge a PostToolUse event for a tool it did not call.
#   - If the user denies/cancels ExitPlanMode, the tool call returns with
#     an error field — we detect that and skip the flip.
#   - Idempotent: re-running on an already-approved state is a no-op.

set -uo pipefail

INPUT=$(cat)

# Require tool_response (tool call completed). Absent on aborts.
jq -e '.tool_response // empty' >/dev/null 2>&1 <<< "$INPUT" || exit 0

# Skip if the tool reported an error (user denied / cancelled the plan).
if jq -e '.tool_response.error // empty' >/dev/null 2>&1 <<< "$INPUT"; then
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
[[ -f "$STATE_FILE" ]] || exit 0

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

# Flip plan_approved. If the state is still "none" (user invoked
# ExitPlanMode outside the normal phase-1 flow), nudge current_phase to
# "plan" so downstream gates see a coherent state; otherwise leave it.
jq '
  .plan_approved = true
  | .current_phase = (if .current_phase == "none" then "plan" else .current_phase end)
  | .updated_at = (now | todateiso8601)
' "$STATE_FILE" > "$TMP" || exit 0

mv "$TMP" "$STATE_FILE"

# Surface confirmation in the agent's additional context so it knows to proceed
# without attempting a manual flip.
jq -n '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: "Plan approved — pipeline-state.json.plan_approved flipped to true automatically. Do NOT attempt to manually set plan_approved.\n\nNEXT STEPS (per harness-pipeline/phase-1-plan.md Step 5zz):\n  1. Execute Steps 5a → 5a-clean → 5a-sync → 5b: sync development with origin and create the feature branch.\n  2. Execute the Task Creation section: call TaskCreate to register ALL upfront pipeline tasks for the entire workflow (Phase 2 TDD red/green cycles, Phase 3 review, Phase 4 validate + PR), derived from the approved plan. Tasks must describe concrete actions, NOT pipeline flow labels.\n  3. After issuing the TaskCreate calls, proceed to Phase 2."
  }
}'

exit 0
