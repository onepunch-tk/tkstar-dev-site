#!/bin/bash
set -euo pipefail

# Pipeline Guardian — Stop hook
# TDD-phase only. Two responsibilities:
#   1. Failure Recovery — Red commits without matching Green → re-block stop
#      with a context message until MAX_RETRIES is reached.
#   2. TDD-first violation — implementation files committed/changed without
#      any test files in the same TDD window → single cooldown-gated reminder.
#
# Other phase compliance is owned elsewhere — do NOT re-implement here:
#   - PLAN approval enforcement → abac-phase-policy.sh (PreToolUse hard-block)
#   - review → validate transition → phase-gate.sh (state-flag check)
#   - PR / Issue / doc-sync → docs-sync-gate.sh (PreToolUse on gh pr create)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
# shellcheck source=../lib/config.sh
source "$SCRIPT_DIR/../lib/config.sh"

INPUT=$(cat)

# ─── Anti-loop ───
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
[[ "$STOP_HOOK_ACTIVE" == "true" ]] && exit 0

STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
[[ ! -f "$STATE_FILE" ]] && exit 0

PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE")
[[ "$PHASE" != "tdd" ]] && exit 0

HOOK_STATE="$PROJECT_DIR/.claude/runtime/hook-state.json"
if [[ ! -f "$HOOK_STATE" ]]; then
    echo '{"workflow_warnings_sent":{},"cooldown_until":"","failure_recovery":{}}' > "$HOOK_STATE"
fi

PHASE_START=$(jq -r '.updated_at // ""' "$STATE_FILE")

# ─── Failure Recovery Guard (must run before cooldown) ───
if [[ -n "$PHASE_START" ]]; then
    RED_COUNT=$(cd "$PROJECT_DIR" && git log --format="%s" --after="$PHASE_START" 2>/dev/null | grep -c "^✅ test:" || true)
    GREEN_COUNT=$(cd "$PROJECT_DIR" && git log --format="%s" --after="$PHASE_START" 2>/dev/null | grep -c "^✨ feat:" || true)

    if [[ $RED_COUNT -gt 0 && $RED_COUNT -gt $GREEN_COUNT ]]; then
        SESSION_ID=$(echo "$INPUT" | jq -r '.session_id // "default"')
        RETRY_COUNT=$(jq -r --arg s "$SESSION_ID" '.failure_recovery[$s].retry_count // 0' "$HOOK_STATE" 2>/dev/null | head -1 || echo 0)
        RETRY_COUNT=$(echo "$RETRY_COUNT" | tr -cd '0-9')
        [[ -z "$RETRY_COUNT" ]] && RETRY_COUNT=0
        MAX_RETRIES=${FAILURE_RECOVERY_MAX_RETRIES:-20}

        if [[ $RETRY_COUNT -ge $MAX_RETRIES ]]; then
            exit 0
        fi

        NEXT=$((RETRY_COUNT + 1))
        NOW=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
        jq --arg s "$SESSION_ID" --argjson n "$NEXT" --arg t "$NOW" \
            '.failure_recovery[$s] = { retry_count: $n, last_at: $t }' \
            "$HOOK_STATE" > "${HOOK_STATE}.tmp" && mv "${HOOK_STATE}.tmp" "$HOOK_STATE"

        if [[ $NEXT -eq $MAX_RETRIES ]]; then
            CTX="[FAILURE RECOVERY] Green phase incomplete — last retry ($NEXT/$MAX_RETRIES).\nRed commits: $RED_COUNT, Green commits: $GREEN_COUNT ($(($RED_COUNT - $GREEN_COUNT)) feature(s) missing Green).\nThis is your FINAL attempt. If tests cannot pass:\n1. Report failure to the main agent in your final assistant message.\n2. Include: failing tests, attempted approaches, blocking issues.\n3. Then stop."
        else
            CTX="[FAILURE RECOVERY] Green phase incomplete — retry $NEXT/$MAX_RETRIES.\nRed commits: $RED_COUNT, Green commits: $GREEN_COUNT ($(($RED_COUNT - $GREEN_COUNT)) feature(s) missing Green).\nContinue implementing. Follow CA Inside-Out order. Run tests after changes."
        fi

        jq -n --arg ctx "$CTX" '{
            decision: "block",
            reason: ("Failure Recovery: Green phase incomplete\n\n" + $ctx)
        }'
        exit 0
    fi
fi

# ─── Cooldown for TDD-violation reminder ───
COOLDOWN=$(jq -r '.cooldown_until // ""' "$HOOK_STATE")
if [[ -n "$COOLDOWN" ]]; then
    COOLDOWN_TS=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$COOLDOWN" "+%s" 2>/dev/null || echo 0)
    NOW_TS=$(date "+%s")
    if [[ $NOW_TS -lt $COOLDOWN_TS ]]; then
        exit 0
    fi
fi

# ─── TDD-first violation: impl files changed without test files ───
WARNED=$(jq -r '.workflow_warnings_sent.tdd_no_tests // ""' "$HOOK_STATE")
[[ -n "$WARNED" ]] && exit 0

PHASE_COMMITTED=""
if [[ -n "$PHASE_START" ]]; then
    PHASE_COMMITTED=$(cd "$PROJECT_DIR" && git log --format="" --name-only --after="$PHASE_START" 2>/dev/null | grep -v '^$' | sort -u || true)
fi
UNCOMMITTED=$(cd "$PROJECT_DIR" && git diff --name-only -w HEAD 2>/dev/null || true)
ALL_CHANGED=$(printf "%s\n%s" "$PHASE_COMMITTED" "$UNCOMMITTED" | sort -u | grep -v '^$' || true)

TEST_FILES=$(echo "$ALL_CHANGED" | grep -E '\.(test|spec)\.(ts|tsx|js|jsx)$' || true)
IMPL_FILES=$(echo "$ALL_CHANGED" | grep -E '\.(ts|tsx|js|jsx)$' | grep -vE '\.(test|spec)\.' | grep -vE '(\.d\.ts|types\.ts|index\.ts)$' || true)

if [[ -n "$IMPL_FILES" && -z "$TEST_FILES" ]]; then
    REMINDER="[WORKFLOW] TDD VIOLATION: Implementation files modified but no test files found. Write tests FIRST (Red phase) before implementation (Green phase). Modified impl files: $(echo "$IMPL_FILES" | head -5 | tr '\n' ', ')"

    COOLDOWN_UNTIL=$(date -u -v+30S "+%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "+30 seconds" "+%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")
    NOW=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
    UPDATED_STATE=$(jq --arg cooldown "$COOLDOWN_UNTIL" --arg now "$NOW" \
        '.cooldown_until = $cooldown | .workflow_warnings_sent.tdd_no_tests = $now' \
        "$HOOK_STATE")
    echo "$UPDATED_STATE" > "$HOOK_STATE"

    jq -n --arg r "$REMINDER" '{
        decision: "block",
        reason: ("Pipeline guardian detected pending actions\n\n" + $r + "\n")
    }'
    exit 0
fi

exit 0
