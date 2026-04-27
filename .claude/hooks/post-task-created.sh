#!/bin/bash
# PostToolUse hook — matcher: TaskCreate
#
# Two responsibilities, both keyed off the first TaskCreate call inside
# Phase 1 (plan):
#
#   1. Flip pipeline-state.json `tasks_created` from false to true.
#   2. Emit the plan→tdd /compact advisory to stderr (verbatim, copy-pasteable
#      one-liner) AND emit an additionalContext directive that instructs the
#      agent to relay the advisory to the user and wait for a reply before
#      entering Phase 2.
#
# The natural `tasks_created==false → true` transition is the idempotency
# gate — every subsequent TaskCreate call hits the early-exit and emits
# nothing.
#
# Idempotency:
#   First call in plan phase with plan_approved=true && tasks_created=false
#     -> flip to true, emit advisory + additionalContext.
#   Subsequent calls (already true, or wrong phase, or plan not approved,
#   or TaskCreate failed)
#     -> no-op, exit 0.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/harness-debug.sh
source "$SCRIPT_DIR/lib/harness-debug.sh"

INPUT=$(cat)

# Skip if the tool reported an error (TaskCreate failed — don't flip the gate
# on a phantom task).
if jq -e '.tool_response.error // empty' >/dev/null 2>&1 <<< "$INPUT"; then
  harness_debug post-task-created "tool_response.error present"
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_FILE="$PROJECT_DIR/.claude/pipeline-state.json"
if [[ ! -f "$STATE_FILE" ]]; then
  harness_debug post-task-created "pipeline-state.json missing"
  exit 0
fi

CURRENT_PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE")
PLAN_APPROVED=$(jq -r '.plan_approved // false' "$STATE_FILE")
TASKS_CREATED=$(jq -r '.tasks_created // false' "$STATE_FILE")

# Only the plan→tdd boundary cares about this gate. TaskCreate calls in other
# phases (mid-pipeline task additions during TDD/review/validate) are
# intentional and must not retrigger the advisory.
if [[ "$CURRENT_PHASE" != "plan" ]]; then
  harness_debug post-task-created "current_phase=$CURRENT_PHASE (want plan)"
  exit 0
fi
if [[ "$PLAN_APPROVED" != "true" ]]; then
  harness_debug post-task-created "plan_approved=$PLAN_APPROVED"
  exit 0
fi
if [[ "$TASKS_CREATED" == "true" ]]; then
  harness_debug post-task-created "tasks_created already true"
  exit 0
fi

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

jq '
  .tasks_created = true
  | .updated_at = (now | todateiso8601)
' "$STATE_FILE" > "$TMP" || exit 0

mv "$TMP" "$STATE_FILE"

# Single source of truth for the advisory body. Captured into a variable so
# both the stderr fallback path and the additionalContext (model-visible) path
# can emit byte-identical content without drift.
#
# Why both paths: per Claude Code hook docs, PostToolUse stderr on exit 0 goes
# to the debug log/terminal only — it does NOT reach the model context. Only
# `hookSpecificOutput.additionalContext` is injected into the conversation.
# stderr is preserved as a fallback for terminal-watching users and in case
# Claude Code's policy changes in a future version.
ADVISORY_BODY=$(cat <<'ADVISORY'

─────────────────────────────────────────────────────────────
  PHASE BOUNDARY (plan → tdd) — 진행 전 확인 필요
─────────────────────────────────────────────────────────────

Plan 이 승인되었고, 파이프라인 task 가 모두 생성되었습니다.
에이전트는 Phase 2(TDD) 진입 전에 멈추며, 당신의 응답을
기다립니다. 아래 3가지 중 하나로 답해주세요:

  ① /compact 실행 (권장) — 아래 한 줄을 복사해 붙여넣으세요:

/compact Focus on the approved plan file (path printed earlier), GitHub Issue body if any, architectural decisions and stakeholder consultation outcomes, feature branch name, task IDs, and `pipeline-state.json` current_phase/mode/ui_involved flags. Drop Phase 1 reconnaissance (file exploration, pattern searches), rejected alternative approaches, and verbose tool outputs that have already been synthesized into the plan file.

  ② compact 건너뛰고 바로 진행 — "skip compact" 또는 "바로 진행"
  ③ 플랜 수정/추가 지시 — 새 지시사항을 그대로 입력

/clear 가 아닌 /compact 를 권장하는 이유: plan 파일에 100% 옮겨지지
않은 tradeoff 논의와 clarification 이 대화에만 남아있을 수 있습니다.
(근거: harness-pipeline/SKILL.md §Context Management)
─────────────────────────────────────────────────────────────
ADVISORY
)

# Mirror to stderr — terminal/debug-log fallback path.
printf '%s\n' "$ADVISORY_BODY" >&2

# Primary path: embed advisory verbatim into additionalContext so the model
# can relay it byte-for-byte instead of paraphrasing.
jq -n --arg body "$ADVISORY_BODY" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: (
      "First TaskCreate after plan approval detected — pipeline-state.tasks_created flipped to true automatically.\n\n"
      + "Below is the plan→tdd advisory. Your next response MUST relay this advisory verbatim to the user (copy the block between the BEGIN/END markers, NOT including the markers themselves), then STOP — do NOT advance pipeline-state.current_phase to \"tdd\", do NOT spawn sub-agents, do NOT begin Phase 2 work. Wait for the user reply.\n\n"
      + "=== BEGIN ADVISORY (verbatim — copy this to your reply) ===\n"
      + $body
      + "\n=== END ADVISORY ===\n\n"
      + "Acceptable user replies: (a) user runs /compact themselves, (b) user explicitly says skip compact / 바로 진행, (c) user gives new direction. Bypassing this flow (e.g., transitioning to tdd before the user replies) is a direct violation of the harness pipeline."
    )
  }
}'

exit 0
