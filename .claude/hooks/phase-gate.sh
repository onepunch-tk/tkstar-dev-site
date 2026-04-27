#!/bin/bash
set -euo pipefail

# PreToolUse Hook: Phase gate
# matcher: Bash | Edit | Write
#
# Two gates:
#   Gate 1 — HARD BLOCK on pipeline-state.json write that transitions
#            current_phase to "validate" while the branch has an open
#            review report (unchecked items OR Status ≠ Complete).
#            Triggers on Bash, Write, and Edit — any path that can
#            mutate pipeline-state.json must be gated. (Historical bug:
#            Write-tool writes bypassed the Bash-only matcher.)
#   Gate 2 — NON-BLOCKING reminder on `git commit` during the review
#            phase when a branch-scoped review report still has unchecked
#            items and the current commit isn't updating that report.
#            Bash-only; Gate 2 inspects staged files, which are only
#            meaningful for git-commit invocations.
#
# Report selection uses `git diff --name-only ORIGIN_BASE...HEAD` rather
# than `find | sort | tail -1` — alphabetical "latest" was unreliable and
# allowed workarounds like a `zz-` filename prefix. Branch-diff scoping
# makes the gate match the reports this PR actually produced.

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

# Resolve report directories from config (with sensible defaults).
CODE_REVIEW_DIR="$PROJECT_DIR/$(config_report_dir codeReview)"
DESIGN_REVIEW_DIR="$PROJECT_DIR/$(config_report_dir designReview)"

# ─── Helpers ───

# Resolve the comparison base for `git diff`. Prefer origin/development;
# fall back to local development if the remote ref isn't available
# (e.g. during offline work); give up silently otherwise.
resolve_base_ref() {
    (
        cd "$PROJECT_DIR" || return 1
        if git rev-parse --verify origin/development >/dev/null 2>&1; then
            echo "origin/development"
        elif git rev-parse --verify development >/dev/null 2>&1; then
            echo "development"
        else
            return 1
        fi
    )
}

# Emit paths (relative to PROJECT_DIR) of reports this branch added or
# modified, newline-separated. Empty if the branch didn't touch the dir.
branch_scoped_reports() {
    local report_dir="$1"
    local base
    base=$(resolve_base_ref) || { echo ""; return 0; }
    local rel_dir="${report_dir#"$PROJECT_DIR"/}"
    (
        cd "$PROJECT_DIR" &&
        git diff --name-only "$base"...HEAD -- "$rel_dir/*.md" 2>/dev/null
    ) | grep -v '^$' || true
}

# Emit issues found in a report file, one per line. Empty output means clean.
report_issues() {
    local file="$1"
    local unchecked
    unchecked=$(grep -c '^- \[ \]' "$file" 2>/dev/null || true)
    unchecked=$(echo "$unchecked" | tr -cd '0-9')
    [[ -z "$unchecked" ]] && unchecked=0
    if (( unchecked > 0 )); then
        echo "$unchecked unchecked item(s)"
    fi
    local status_line
    status_line=$(grep -m1 '^\*\*Status\*\*:' "$file" 2>/dev/null || echo "")
    if [[ -z "$status_line" ]] || ! echo "$status_line" | grep -qi "complete"; then
        echo "Status not Complete"
    fi
}

# ─── Transition detection (tool-dispatched) ───
#
# Returns 0 if the current tool call is a pipeline-state.json write that
# transitions current_phase → "validate", 1 otherwise.
# Supports Bash (tool_input.command), Write (file_path + content), and
# Edit (file_path + new_string).

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

# ─── Gate 1: review → validate transition ───

if is_validate_transition_write; then
    FAIL=0
    UI_INVOLVED=$(jq -r '.ui_involved // false' "$STATE_FILE" 2>/dev/null || echo "false")

    for REPORT_DIR in "$CODE_REVIEW_DIR" "$DESIGN_REVIEW_DIR"; do
        TYPE_LABEL="${REPORT_DIR##*/}"

        # Design review only applies when ui_involved.
        if [[ "$TYPE_LABEL" == "design-review" && "$UI_INVOLVED" != "true" ]]; then
            continue
        fi

        if [[ ! -d "$REPORT_DIR" ]]; then
            echo "Phase Gate BLOCKED [review → validate]: ${TYPE_LABEL} report directory not found." >&2
            echo "  Expected: $REPORT_DIR" >&2
            echo "  Run the ${TYPE_LABEL} subagent before proceeding." >&2
            FAIL=1
            continue
        fi

        REPORTS=$(branch_scoped_reports "$REPORT_DIR")

        if [[ -z "$REPORTS" ]]; then
            # No branch-scoped report. For code-review this is still a problem
            # only if NO report exists globally (review phase produced nothing);
            # otherwise the branch legitimately didn't touch reviews.
            if [[ "$TYPE_LABEL" == "code-review" ]]; then
                ANY=$(find "$REPORT_DIR" -name '*.md' -type f 2>/dev/null | head -1)
                if [[ -z "$ANY" ]]; then
                    echo "Phase Gate BLOCKED [review → validate]: no ${TYPE_LABEL} report found." >&2
                    echo "  Run the ${TYPE_LABEL} subagent and commit the report on this branch." >&2
                    FAIL=1
                fi
            fi
            continue
        fi

        while IFS= read -r RPT; do
            [[ -z "$RPT" ]] && continue
            FULL="$PROJECT_DIR/$RPT"
            [[ ! -f "$FULL" ]] && continue  # deleted on branch
            ISSUES=$(report_issues "$FULL")
            if [[ -n "$ISSUES" ]]; then
                echo "Phase Gate BLOCKED [review → validate]: ${TYPE_LABEL} report is not closed." >&2
                echo "  Report: $RPT" >&2
                while IFS= read -r I; do
                    [[ -n "$I" ]] && echo "    - $I" >&2
                done <<< "$ISSUES"
                echo "  Fix items (- [ ] → - [x]); update **Status**: Pending → Complete." >&2
                FAIL=1
            fi
        done <<< "$REPORTS"
    done

    (( FAIL == 1 )) && exit 2
    exit 0
fi

# ─── Gate 2: git commit during review phase (Bash only, non-blocking reminder) ───
#
# Bash-scoped because Gate 2 reads the staging area via `git diff --cached`,
# which is only meaningful at the moment of a `git commit` shell invocation.
# Write/Edit tool calls cannot produce a commit.

[[ "$TOOL_NAME" != "Bash" ]] && exit 0

COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[[ -z "$COMMAND" ]] && exit 0

is_review_commit() {
    [[ "$CURRENT_PHASE" == "review" ]] || return 1
    echo "$COMMAND" | grep -qE '(^|[[:space:]])git[[:space:]]+commit([[:space:]]|$)' || return 1
    return 0
}

if is_review_commit; then
    STAGED=$(cd "$PROJECT_DIR" && git diff --name-only --cached 2>/dev/null || true)
    UI_INVOLVED=$(jq -r '.ui_involved // false' "$STATE_FILE" 2>/dev/null || echo "false")

    REMINDERS=()
    for REPORT_DIR in "$CODE_REVIEW_DIR" "$DESIGN_REVIEW_DIR"; do
        TYPE_LABEL="${REPORT_DIR##*/}"
        if [[ "$TYPE_LABEL" == "design-review" && "$UI_INVOLVED" != "true" ]]; then
            continue
        fi
        [[ -d "$REPORT_DIR" ]] || continue

        REPORTS=$(branch_scoped_reports "$REPORT_DIR")
        [[ -z "$REPORTS" ]] && continue

        while IFS= read -r RPT; do
            [[ -z "$RPT" ]] && continue
            # Skip if the report itself is being committed — user is updating it.
            if echo "$STAGED" | grep -qxF "$RPT"; then
                continue
            fi
            FULL="$PROJECT_DIR/$RPT"
            [[ ! -f "$FULL" ]] && continue
            UNCHECKED=$(grep -c '^- \[ \]' "$FULL" 2>/dev/null || true)
            UNCHECKED=$(echo "$UNCHECKED" | tr -cd '0-9')
            [[ -z "$UNCHECKED" ]] && UNCHECKED=0
            if (( UNCHECKED > 0 )); then
                REMINDERS+=("${TYPE_LABEL} report '$RPT' has $UNCHECKED unchecked item(s).")
            fi
        done <<< "$REPORTS"
    done

    if (( ${#REMINDERS[@]} > 0 )); then
        CTX="📋 Review-report reminder (commit in review phase):"
        for R in "${REMINDERS[@]}"; do
            CTX+=$'\n  - '"$R"
        done
        CTX+=$'\n\nIf this commit resolves review issues, also tick the relevant `- [ ]` → `- [x]` and update **Status** to Complete in the same (or a follow-up) commit. Gate 1 (review → validate) will hard-block otherwise.'
        jq -n --arg ctx "$CTX" '{
            hookSpecificOutput: {
                hookEventName: "PreToolUse",
                additionalContext: $ctx
            }
        }'
        # Non-blocking: exit 0 lets the commit proceed.
    fi
fi

exit 0
