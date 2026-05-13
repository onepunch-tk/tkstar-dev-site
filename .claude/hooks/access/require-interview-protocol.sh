#!/bin/bash
# require-interview-protocol.sh — PreToolUse hook on AskUserQuestion.
#
# Blocks AskUserQuestion calls inside the harness-pipeline context unless the
# interview-protocol skill has been loaded in the same session.
#
# Why: harness-pipeline/SKILL.md Phase 0 Discovery mandates
#   "Load interview-protocol skill → enumerate ambiguities →
#    AskUserQuestion loop until ambiguity = 0".
# When the rule lives only in skill prose, agents skip the load step and run
# short ad-hoc interviews (Rule #11 floor, Rule #9 lens coverage, Rule #2
# coverage check all violated). This hook enforces the load via PreToolUse
# deny so the protocol is structurally unbypassable.
#
# Detection: greps the session transcript JSONL for skill-launch markers.
#   harness-pipeline activation (any of):
#     "Launching skill: harness-pipeline"
#     "<command-name>/harness-pipeline"
#     "<command-name>harness-pipeline"
#   interview-protocol load:
#     "Launching skill: interview-protocol"
#
# Outcomes:
#   tool_name != AskUserQuestion        → exit 0  (not our concern)
#   HARNESS_BYPASS=1                    → exit 0  (escape hatch)
#   transcript_path missing/unreadable  → exit 0  (cannot verify, allow)
#   no harness-pipeline marker          → exit 0  (other context)
#   interview-protocol marker present   → exit 0  (already loaded, idempotent)
#   else                                → exit 2  + Korean stderr block

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/harness-debug.sh
source "$SCRIPT_DIR/../lib/harness-debug.sh"

INPUT=$(cat)
TOOL_NAME=$(echo "$INPUT" | jq -r '.tool_name // empty')

if [[ "$TOOL_NAME" != "AskUserQuestion" ]]; then
  harness_debug require-interview-protocol "tool=$TOOL_NAME (not AskUserQuestion)"
  exit 0
fi

if [[ "${HARNESS_BYPASS:-0}" == "1" ]]; then
  harness_debug require-interview-protocol "HARNESS_BYPASS=1"
  exit 0
fi

TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // empty')
if [[ -z "$TRANSCRIPT_PATH" || ! -f "$TRANSCRIPT_PATH" ]]; then
  harness_debug require-interview-protocol "transcript_path missing or unreadable"
  exit 0
fi

if ! grep -q -F \
     -e "Launching skill: harness-pipeline" \
     -e "<command-name>/harness-pipeline" \
     -e "<command-name>harness-pipeline" \
     "$TRANSCRIPT_PATH"; then
  harness_debug require-interview-protocol "harness-pipeline not active in transcript"
  exit 0
fi

if grep -q -F "Launching skill: interview-protocol" "$TRANSCRIPT_PATH"; then
  harness_debug require-interview-protocol "interview-protocol already loaded"
  exit 0
fi

cat >&2 <<'EOF'
인터뷰 프로토콜 미로드: harness-pipeline 컨텍스트에서 AskUserQuestion 을
호출하기 전에 반드시 Skill(interview-protocol) 을 먼저 호출해야 합니다.
  근거: harness-pipeline/SKILL.md Phase 0 Discovery — "Load interview-protocol skill"
  해결: 이번 turn 에서 Skill tool 로 interview-protocol 을 호출한 뒤 다시 시도하세요.
  일회 우회: HARNESS_BYPASS=1 환경변수 (정상 작업에는 사용 금지)
EOF
exit 2
