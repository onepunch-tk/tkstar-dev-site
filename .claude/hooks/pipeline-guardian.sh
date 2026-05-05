#!/bin/bash
set -euo pipefail

# Pipeline Guardian — Stop hook
# Monitors workflow compliance and reminds about doc updates at phase completion.
# Detects: TDD violations, review skipping, doc update needs.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

# Failures directory only — review report enforcement moved to phase-gate.sh
# (state-flag based: review_unresolved_count / design_review_unresolved_count).
FAILURES_DIR="$PROJECT_DIR/$(config_report_dir failures)"

INPUT=$(cat)

# ─── Anti-loop: stop_hook_active prevents infinite re-fires ───
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
[[ "$STOP_HOOK_ACTIVE" == "true" ]] && exit 0

# ─── Pipeline state check ───
STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
[[ ! -f "$STATE_FILE" ]] && exit 0

PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE")
[[ "$PHASE" == "none" ]] && exit 0

MODE=$(jq -r '.mode // "none"' "$STATE_FILE")
BRANCH=$(jq -r '.branch // ""' "$STATE_FILE")

# ─── Hook state (dedup + cooldown tracking) ───
HOOK_STATE="$PROJECT_DIR/.claude/runtime/hook-state.json"
if [[ ! -f "$HOOK_STATE" ]]; then
    echo '{"last_reminded_phase":"","workflow_warnings_sent":{},"cooldown_until":"","failure_recovery":{}}' > "$HOOK_STATE"
fi

# ─── Failure Recovery Guard (before cooldown — must not be bypassed) ───
if [[ "$PHASE" == "tdd" ]]; then
    PHASE_START=$(jq -r '.updated_at // ""' "$STATE_FILE")
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
                # Max retries reached — allow stop
                exit 0
            fi

            # Increment retry counter
            NEXT=$((RETRY_COUNT + 1))
            NOW=$(date -u "+%Y-%m-%dT%H:%M:%SZ")
            jq --arg s "$SESSION_ID" --argjson n "$NEXT" --arg t "$NOW" \
                '.failure_recovery[$s] = { retry_count: $n, last_at: $t }' \
                "$HOOK_STATE" > "${HOOK_STATE}.tmp" && mv "${HOOK_STATE}.tmp" "$HOOK_STATE"

            # Build context message
            if [[ $NEXT -eq $MAX_RETRIES ]]; then
                CTX="[FAILURE RECOVERY] Green phase incomplete — last retry ($NEXT/$MAX_RETRIES).\nRed commits: $RED_COUNT, Green commits: $GREEN_COUNT ($(($RED_COUNT - $GREEN_COUNT)) feature(s) missing Green).\nThis is your FINAL attempt. If tests cannot pass:\n1. Write failure report to ${FAILURES_DIR#$PROJECT_DIR/}/\n2. Include: failing tests, attempted approaches, blocking issues\n3. Then stop."
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
fi

# Cooldown check (30s window)
COOLDOWN=$(jq -r '.cooldown_until // ""' "$HOOK_STATE")
if [[ -n "$COOLDOWN" ]]; then
    COOLDOWN_TS=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$COOLDOWN" "+%s" 2>/dev/null || echo 0)
    NOW_TS=$(date "+%s")
    if [[ $NOW_TS -lt $COOLDOWN_TS ]]; then
        exit 0
    fi
fi

REMINDERS=()

# ─── Concern A: Workflow Enforcement ───

case "$PHASE" in
    "tdd")
        # Plan approval check: block tdd if plan was not approved
        PLAN_APPROVED=$(jq -r '.plan_approved // false' "$STATE_FILE")
        WARNED_PLAN=$(jq -r '.workflow_warnings_sent.tdd_no_plan // ""' "$HOOK_STATE")
        if [[ "$PLAN_APPROVED" != "true" && -z "$WARNED_PLAN" ]]; then
            REMINDERS+=("[WORKFLOW] PLAN NOT APPROVED: You are in TDD phase but plan_approved is false in pipeline-state.json. You MUST complete Phase 1 (Plan) with ExitPlanMode approval and set plan_approved to true before proceeding. Go back and complete the plan approval step.")
        fi

        # TDD-first: implementation files changed without test files?
        # Scope: commits made since phase start + uncommitted -w (whitespace-ignored) changes.
        # Rationale: biome/prettier auto-format touches tracked files without semantic changes;
        # those MUST NOT trigger TDD violation. `-w` flag excludes whitespace-only diffs.
        WARNED=$(jq -r '.workflow_warnings_sent.tdd_no_tests // ""' "$HOOK_STATE")
        if [[ -z "$WARNED" ]]; then
            # Files committed since phase entry (semantic commits from this TDD phase)
            PHASE_COMMITTED=""
            if [[ -n "${PHASE_START:-}" ]]; then
                PHASE_COMMITTED=$(cd "$PROJECT_DIR" && git log --format="" --name-only --after="$PHASE_START" 2>/dev/null | grep -v '^$' | sort -u || true)
            fi
            # Uncommitted semantic changes (whitespace-only diffs excluded via -w)
            UNCOMMITTED=$(cd "$PROJECT_DIR" && git diff --name-only -w HEAD 2>/dev/null || true)
            ALL_CHANGED=$(printf "%s\n%s" "$PHASE_COMMITTED" "$UNCOMMITTED" | sort -u | grep -v '^$' || true)

            TEST_FILES=$(echo "$ALL_CHANGED" | grep -E '\.(test|spec)\.(ts|tsx|js|jsx)$' || true)
            IMPL_FILES=$(echo "$ALL_CHANGED" | grep -E '\.(ts|tsx|js|jsx)$' | grep -vE '\.(test|spec)\.' | grep -vE '(\.d\.ts|types\.ts|index\.ts)$' || true)
            if [[ -n "$IMPL_FILES" && -z "$TEST_FILES" ]]; then
                REMINDERS+=("[WORKFLOW] TDD VIOLATION: Implementation files modified but no test files found. Write tests FIRST (Red phase) before implementation (Green phase). Modified impl files: $(echo "$IMPL_FILES" | head -5 | tr '\n' ', ')")
            fi
        fi
        ;;

    "review")
        # Review completeness enforcement is owned by phase-gate.sh (state-flag
        # based). No Stop-hook nag during review phase.
        :
        ;;

    "validate"|"complete")
        # GitHub Mode: Issue/PR enforcement
        GITHUB_MODE=$(jq -r '.github_mode // false' "$STATE_FILE")
        ISSUE_NUMBER=$(jq -r '.issue_number // null' "$STATE_FILE")
        if [[ "$GITHUB_MODE" == "true" ]]; then
            WARNED_ISSUE=$(jq -r '.workflow_warnings_sent.validate_no_issue // ""' "$HOOK_STATE")
            if [[ ("$ISSUE_NUMBER" == "null" || -z "$ISSUE_NUMBER") && -z "$WARNED_ISSUE" ]]; then
                REMINDERS+=("[WORKFLOW] ISSUE MISSING: GitHub Mode is active but no Issue was created. Verify Issue creation in Phase 1. pipeline-state.json issue_number is empty.")
            fi

            # Check if PR was created (only on complete phase)
            if [[ "$PHASE" == "complete" ]]; then
                WARNED_PR=$(jq -r '.workflow_warnings_sent.validate_no_pr // ""' "$HOOK_STATE")
                if [[ -z "$WARNED_PR" ]]; then
                    CURRENT_BR=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "")
                    # If still on feature branch, PR hasn't been created yet
                    if echo "$CURRENT_BR" | grep -qE '^(feature|fix|docs|refactor|test|chore)/'; then
                        REMINDERS+=("[WORKFLOW] PR NOT CREATED: Transitioned to complete without creating a PR in GitHub Mode. Use .claude/hooks/git-pr.sh to create and merge a PR.")
                    fi
                fi
            fi
        fi

        # Doc-sync enforcement is handled by docs-sync-gate.sh (PreToolUse on
        # gh pr create / git-pr.sh). That gate blocks PR creation when
        # ROADMAP.md / CLAUDE.md / PROJECT-STRUCTURE.md are out of sync — at the
        # correct time, *before* the merge happens. Re-emitting the same
        # reminder here (post-merge, on Stop) was noise: the PR is already
        # closed, the agent has no actionable step, and the guardian's "block"
        # decision just delayed the natural end of the turn.
        ;;
esac

# ─── Output ───

if [[ ${#REMINDERS[@]} -gt 0 ]]; then
    # Set cooldown (30 seconds from now)
    COOLDOWN_UNTIL=$(date -u -v+30S "+%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -d "+30 seconds" "+%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")
    NOW=$(date -u "+%Y-%m-%dT%H:%M:%SZ")

    # Update hook-state.json with tracking
    UPDATED_STATE=$(jq \
        --arg phase "$PHASE" \
        --arg cooldown "$COOLDOWN_UNTIL" \
        --arg now "$NOW" \
        '
        .last_reminded_phase = $phase |
        .cooldown_until = $cooldown |
        if $phase == "tdd" then .workflow_warnings_sent.tdd_no_tests = $now | .workflow_warnings_sent.tdd_no_plan = $now
        elif ($phase == "validate" or $phase == "complete") then .workflow_warnings_sent.validate_no_issue = $now | .workflow_warnings_sent.validate_no_pr = $now
        else . end
        ' "$HOOK_STATE")
    echo "$UPDATED_STATE" > "$HOOK_STATE"

    # Build combined context
    CONTEXT=""
    for r in "${REMINDERS[@]}"; do
        CONTEXT+="$r\n\n"
    done

    # Output JSON — decision:block prevents Claude from stopping
    jq -n --arg ctx "$CONTEXT" '{
        decision: "block",
        reason: ("Pipeline guardian detected pending actions\n\n" + $ctx)
    }'
    exit 0
fi

exit 0
