#!/bin/bash
set -euo pipefail

# docs-sync-gate — PreToolUse Bash hook
# Blocks `gh pr create` / `.claude/hooks/git-pr.sh` on a feature/* branch when
# downstream docs derived from ROADMAP are out of sync. Five OR-gated conditions:
#   1. ROADMAP.md not updated on the branch.
#   2. Config files changed (package.json / tsconfig*.json / biome.json(c) /
#      bun.lockb) without a corresponding CLAUDE.md update.
#   3. doc-structure-linter reports HIGH- or MED-severity drift (when the tool exists).
#   4. ROADMAP `[x]` marks ↔ docs/tasks/TNNN-*.md `**Status**` field drift
#      (Phase 4 Step 14b enforcement — inline bash, no external dependencies).
#   5. ROADMAP `[x]` marks ↔ task file body `- [ ]` checkbox drift
#      (Phase 4 Step 14b (3) enforcement — Acceptance Criteria / step boxes
#      must all be `[x]` once the task is marked done in ROADMAP).
#
# Scope: feature/* branches only. fix/docs/chore/refactor/test are exempt
# (they're not supposed to complete ROADMAP tasks).
#
# Activation: current_phase == "validate" or "complete". Outside those phases
# this gate is a no-op so ad-hoc PRs aren't blocked.
#
# Overrides (last-resort, prefix on the command line):
#   DOCS_LINTER_SKIP=1  skip the HIGH/MED drift check (kept for backward compat)
#   DOCS_GATE_SKIP=1    skip the CLAUDE.md check

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Detect PR creation intent (gh or the project's split create script). Be
# permissive about quoting/flags — match on the canonical verbs only.
if ! echo "$COMMAND" | grep -qE '(^|[^a-zA-Z0-9])(gh[[:space:]]+pr[[:space:]]+create|\.claude/hooks/git-pr-create\.sh)([[:space:]]|$)'; then
    exit 0
fi

# Pipeline state gate — only enforce during validate/complete
STATE_FILE="$PROJECT_DIR/.claude/pipeline-state.json"
[[ ! -f "$STATE_FILE" ]] && exit 0

PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE")
case "$PHASE" in
    "validate"|"complete") ;;
    *) exit 0 ;;
esac

# Branch gate — only feature/*
CURRENT_BRANCH=$(cd "$PROJECT_DIR" && git branch --show-current 2>/dev/null || echo "")
if [[ ! "$CURRENT_BRANCH" =~ ^feature/ ]]; then
    exit 0
fi

# Diff vs development — does ROADMAP.md appear in the branch's changed files?
cd "$PROJECT_DIR"
git fetch origin development --quiet 2>/dev/null || true

BASE_REF="origin/development"
git rev-parse --verify "$BASE_REF" >/dev/null 2>&1 || BASE_REF="development"

BRANCH_CHANGES=$(git diff --name-only "$BASE_REF"...HEAD 2>/dev/null || true)

# ── Condition 1: ROADMAP.md update present? ──
if ! echo "$BRANCH_CHANGES" | grep -q '^docs/ROADMAP\.md$'; then
    REASON=$(cat <<'MSG'
[DOC-SYNC GATE] Blocked: feature/* branch in validate/complete phase has no docs/ROADMAP.md change.

The Doc Sync Protocol (Phase 4, Step 14a) requires ROADMAP.md to be updated
FIRST so downstream docs derived from ROADMAP have an accurate source of truth.

Do this, then retry the PR:
  1. Run development-planner subagent to mark completed tasks in docs/ROADMAP.md
     and add the `**Must** Read:` link to the current task file.
  2. Commit the change (emoji prefix: 📝 docs).
  3. Re-run the PR command.

Exempt cases (should not have triggered this gate — check your branch type):
  - fix/* / docs/* / chore/* / refactor/* / test/* branches
  - Work that does not complete a ROADMAP task

Override: if this PR genuinely should not touch ROADMAP, rename the branch to
chore/* or run the PR from outside the validate/complete phase.
MSG
)
    jq -n --arg reason "$REASON" '{
        decision: "block",
        reason: $reason
    }'
    exit 0
fi

# ── Condition 2: CLAUDE.md update when config files changed? ──
# Phase 4 Step 14d: if package.json / tsconfig*.json / biome.json(c) / bun.lockb
# appear in the branch diff, CLAUDE.md must also be updated on the branch.
# Rationale: those files change the commands / tech-stack / tooling contract
# that agents rely on; without CLAUDE.md sync, downstream sessions use stale
# instructions.
# Build an alternation regex from the configured list of docs-sync-triggering files.
# Patterns in config are treated as literals except for the wildcard `*`, which
# becomes `[^/]*` for a single path segment.
CONFIG_REGEX=$(config_get_array '.configFilesRequireDocsSync' \
  | sed -e 's/[][\\.^$+?(){}|]/\\&/g' -e 's/\*/[^\/]*/g' \
  | paste -sd'|' -)

if [[ -z "$CONFIG_REGEX" ]]; then
    CONFIG_REGEX='package\.json|tsconfig[^/]*\.json|biome\.jsonc?|bun\.lockb'
fi

CONFIG_CHANGED=$(echo "$BRANCH_CHANGES" | grep -E "^(${CONFIG_REGEX})$" || true)
if [[ -n "$CONFIG_CHANGED" ]] && ! echo "$BRANCH_CHANGES" | grep -q '^CLAUDE\.md$'; then
    GATE_SKIP=0
    if echo "$COMMAND" | grep -qE '(^|[[:space:]])DOCS_GATE_SKIP=1([[:space:]]|$)'; then
        GATE_SKIP=1
    fi
    if (( GATE_SKIP == 0 )); then
        REASON=$(cat <<MSG
[DOC-SYNC GATE] Blocked: config files changed but CLAUDE.md not updated on this branch.

Changed config files:
$(echo "$CONFIG_CHANGED" | sed 's/^/  - /')

Phase 4 Step 14d of the Doc Sync Protocol requires CLAUDE.md review when any
of these are modified. Update the Commands table, Tech Stack entries, or
tooling sections as appropriate, commit, then re-run the PR command.

Override (last resort): prefix the PR command with DOCS_GATE_SKIP=1, e.g.
  DOCS_GATE_SKIP=1 gh pr create ...
Only use this when the config change genuinely does not affect CLAUDE.md.
MSG
)
        jq -n --arg reason "$REASON" '{ decision: "block", reason: $reason }'
        exit 0
    fi
fi

# ── Condition 3: PROJECT-STRUCTURE drift at HIGH or MED severity? ──
# Delegates to the portable doc-structure-linter. Exit-code contract:
#   0 = no HIGH+MED drift (pass); 1 = HIGH or MED drift (block);
#   2+ = linter error (skip).
# Tool missing → skip silently (keeps gate backward compatible with checkouts
# predating the linter). LOW drift (renames, moves within an enumerated area)
# is not blocking — too noisy for a hard gate.
LINTER="$PROJECT_DIR/.claude/tools/doc-structure-linter.sh"
if [[ -x "$LINTER" ]]; then
    set +e
    "$LINTER" --fail-on=med >/dev/null 2>&1
    LINT_EC=$?
    set -e
    # Allow override via command-line env prefix: `DOCS_LINTER_SKIP=1 gh pr create ...`.
    # PreToolUse hooks don't inherit the tool's env, so parse from the command string.
    SKIP=0
    if echo "$COMMAND" | grep -qE '(^|[[:space:]])DOCS_LINTER_SKIP=1([[:space:]]|$)'; then
        SKIP=1
    fi
    if (( LINT_EC == 1 )) && (( SKIP == 0 )); then
        HUMAN_OUT=$("$LINTER" --human 2>&1 || true)
        REASON=$(cat <<MSG
[DOC-SYNC GATE] Blocked: doc-structure-linter reports HIGH or MED drift between PROJECT-STRUCTURE.md and the filesystem.

Resolve before creating the PR:
  1. Review the drift report below.
  2. For each HIGH / MED item — either reflect it in docs/PROJECT-STRUCTURE.md
     (run project-structure-analyzer for guided edits) or revert the source
     change if unintended.
  3. Re-run the PR command.

--- linter --human ---
$HUMAN_OUT
----------------------

Override (last resort): prefix the PR command with DOCS_LINTER_SKIP=1, e.g.
  DOCS_LINTER_SKIP=1 gh pr create ...
Only use this when the drift is already tracked in a follow-up issue.
MSG
)
        jq -n --arg reason "$REASON" '{ decision: "block", reason: $reason }'
        exit 0
    fi
    # LINT_EC >= 2 is a linter error (missing STRUCTURE_FILE, awk failure, …).
    # Treat as silent skip — consistent with the "tool missing" fallback.
fi

# ── Condition 4: ROADMAP [x] ↔ task file Status drift (Step 14b enforcement) ──
# Catches the recurring failure mode: ROADMAP gets `[x]` checked but the
# corresponding `docs/tasks/TNNN-*.md` keeps `**Status** | Not Started`.
# Inline implementation (bash + grep/awk) so the hook stays self-contained.
# Paths are env-overridable for projects with non-default docs layout:
#   HARNESS_ROADMAP_PATH (default: docs/ROADMAP.md)
#   HARNESS_TASKS_DIR    (default: docs/tasks)
ROADMAP_FILE="$PROJECT_DIR/${HARNESS_ROADMAP_PATH:-docs/ROADMAP.md}"
TASKS_DIR_PATH="$PROJECT_DIR/${HARNESS_TASKS_DIR:-docs/tasks}"
if [[ -f "$ROADMAP_FILE" && -d "$TASKS_DIR_PATH" ]]; then
    DRIFT_LINES=""
    # Extract task IDs from ROADMAP lines like: `- [x] **Task 008: ...`
    while IFS= read -r task_id; do
        [[ -z "$task_id" ]] && continue
        # Find matching task file: docs/tasks/T<NNN>[a-z]?-*.md
        task_file=$(find "$TASKS_DIR_PATH" -maxdepth 1 -name "${task_id}-*.md" -print -quit 2>/dev/null)
        if [[ -z "$task_file" ]]; then
            DRIFT_LINES+="  $task_id: ROADMAP=[x] 이지만 task 파일이 없음"$'\n'
            continue
        fi
        # Extract Status field value: `| **Status** | <value> |`
        status_raw=$(grep -E '^\|[[:space:]]*\*\*Status\*\*[[:space:]]*\|' "$task_file" \
            | head -1 \
            | sed -E 's/^\|[[:space:]]*\*\*Status\*\*[[:space:]]*\|[[:space:]]*//; s/[[:space:]]*\|.*$//')
        [[ -z "$status_raw" ]] && continue
        # Strip parens (e.g. "✅ Done (2026-04-28, PR #14)" → "✅ Done")
        status_clean=$(echo "$status_raw" | sed -E 's/\([^)]*\)//g' | sed -E 's/^[[:space:]]+|[[:space:]]+$//g')
        # Match Done / Completed / ✅ Done (case-insensitive)
        if ! echo "$status_clean" | grep -iqE '(^✅[[:space:]]*Done$|^Done$|^Completed$)'; then
            DRIFT_LINES+="  $task_id ($(basename "$task_file")): ROADMAP=[x] 이지만 Status=\"$status_raw\" → ✅ Done 으로 동기화 필요"$'\n'
        fi
    done < <(grep -oE '^- \[x\][[:space:]]+\*\*Task[[:space:]]+[0-9]{3}[a-z]?:' "$ROADMAP_FILE" \
        | sed -E 's/^- \[x\][[:space:]]+\*\*Task[[:space:]]+([0-9]{3}[a-z]?):.*/T\1/')

    if [[ -n "$DRIFT_LINES" ]]; then
        SYNC_SKIP=0
        if echo "$COMMAND" | grep -qE '(^|[[:space:]])DOCS_SYNC_SKIP=1([[:space:]]|$)'; then
            SYNC_SKIP=1
        fi
        if (( SYNC_SKIP == 0 )); then
            REASON=$(cat <<MSG
[DOC-SYNC GATE] Blocked: ROADMAP \`[x]\` 체크와 task 파일 \`**Status**\` 필드가 불일치합니다.

$DRIFT_LINES
Phase 4 Step 14b에 따라 ROADMAP에 \`[x]\`로 마킹된 task는 task 파일의
\`**Status**\` 필드도 \`✅ Done\` (또는 \`Done\` / \`Completed\`)으로 동기화되어야 합니다.

해결:
  1. 위 drift 목록의 task 파일을 열어 \`**Status**\` 필드를 갱신.
  2. \`📝 docs: sync\` 커밋에 포함.
  3. PR 명령 재시도.

Override (last resort): prefix the PR command with DOCS_SYNC_SKIP=1.
MSG
)
            jq -n --arg reason "$REASON" '{ decision: "block", reason: $reason }'
            exit 0
        fi
    fi
fi

# ── Condition 5: ROADMAP [x] ↔ task file body `- [ ]` checkbox drift ──
# Catches the Step 14b (3) failure mode: ROADMAP marks a task `[x]` and the
# `**Status**` field gets updated, but Acceptance Criteria / step box `- [ ]`
# checkboxes inside the task file body are left unchecked. Status alone is not
# sufficient evidence of completion — the body checklist is the AC contract.
#
# Same path/env conventions as Condition 4 (HARNESS_ROADMAP_PATH / HARNESS_TASKS_DIR).
if [[ -f "$ROADMAP_FILE" && -d "$TASKS_DIR_PATH" ]]; then
    BOX_DRIFT=""
    while IFS= read -r task_id; do
        [[ -z "$task_id" ]] && continue
        task_file=$(find "$TASKS_DIR_PATH" -maxdepth 1 -name "${task_id}-*.md" -print -quit 2>/dev/null)
        [[ -z "$task_file" ]] && continue
        # Count unchecked checkboxes anywhere in the body (no anchor restriction).
        # Pattern matches `- [ ]` and `* [ ]` at start of a list item.
        unchecked=$(grep -cE '^[[:space:]]*[-*][[:space:]]+\[[[:space:]]\][[:space:]]' "$task_file" || true)
        if [[ "$unchecked" -gt 0 ]]; then
            BOX_DRIFT+="  $task_id ($(basename "$task_file")): ROADMAP=[x] 이지만 task 파일 body에 미체크된 \`- [ ]\` ${unchecked}건 잔존"$'\n'
        fi
    done < <(grep -oE '^- \[x\][[:space:]]+\*\*Task[[:space:]]+[0-9]{3}[a-z]?:' "$ROADMAP_FILE" \
        | sed -E 's/^- \[x\][[:space:]]+\*\*Task[[:space:]]+([0-9]{3}[a-z]?):.*/T\1/')

    if [[ -n "$BOX_DRIFT" ]]; then
        BOX_SKIP=0
        if echo "$COMMAND" | grep -qE '(^|[[:space:]])DOCS_SYNC_SKIP=1([[:space:]]|$)'; then
            BOX_SKIP=1
        fi
        if (( BOX_SKIP == 0 )); then
            REASON=$(cat <<MSG
[DOC-SYNC GATE] Blocked: ROADMAP \`[x]\` task의 task 파일 body에 미체크된 \`- [ ]\` 항목이 남아있습니다.

$BOX_DRIFT
Phase 4 Step 14b (3)에 따라 ROADMAP에 \`[x]\`로 마킹된 task의
Acceptance Criteria / Implementation Plan 등 body 체크리스트는
모두 \`- [x]\`로 동기화되어야 합니다 (\`**Status**\` 필드만으로는 불충분).

해결:
  1. 위 task 파일을 열어 달성된 \`- [ ]\`를 \`- [x]\`로 갱신.
     (실제로 미달성된 항목은 task 범위에서 제외하거나 후속 task로 분리.)
  2. \`📝 docs: sync\` 커밋에 포함.
  3. PR 명령 재시도.

Override (last resort): prefix the PR command with DOCS_SYNC_SKIP=1.
정당한 미달성 항목이 있어 의도적으로 \`- [ ]\`로 남기는 경우에만 사용.
MSG
)
            jq -n --arg reason "$REASON" '{ decision: "block", reason: $reason }'
            exit 0
        fi
    fi
fi

exit 0
