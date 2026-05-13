#!/bin/bash
set -euo pipefail

# docs-sync-gate — PreToolUse Bash hook
# Blocks `gh pr create` / `.claude/hooks/git-pr.sh` on a feature/* branch when
# downstream docs derived from ROADMAP are out of sync. Three OR-gated conditions:
#   1. ROADMAP.md not updated on the branch.
#   2. doc-structure-linter reports HIGH- or MED-severity drift (when the tool exists).
#   3. ROADMAP `[x]` marks ↔ task file body `- [ ]` checkbox drift
#      (Phase 4 Step 14b enforcement — DoD checkbox is the AC contract; if any
#      `- [ ]` remains in the body of a task whose ROADMAP entry is `[x]`, the
#      gate blocks. Status-field check was removed when task files dropped the
#      `**Status**` field — ROADMAP is the single source of truth.)
#
# Scope: feature/* branches only. fix/docs/chore/refactor/test are exempt
# (they're not supposed to complete ROADMAP tasks).
#
# Activation: current_phase == "validate" or "complete". Outside those phases
# this gate is a no-op so ad-hoc PRs aren't blocked.
#
# Overrides (last-resort, prefix on the command line):
#   DOCS_LINTER_SKIP=1  skip the HIGH/MED drift check (kept for backward compat)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/../lib/config.sh"

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# Detect PR creation intent (gh or the project's split create script). Be
# permissive about quoting/flags — match on the canonical verbs only.
if ! echo "$COMMAND" | grep -qE '(^|[^a-zA-Z0-9])(gh[[:space:]]+pr[[:space:]]+create|\.claude/hooks/git-pr-create\.sh)([[:space:]]|$)'; then
    exit 0
fi

# Pipeline state gate — only enforce during validate/complete
STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
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
  1. Run roadmap-generator subagent in MARK COMPLETE mode (it invokes
     `python3 .claude/skills/roadmap/scripts/mark_complete.py --task T### …`)
     to flip the ROADMAP entry from `- [ ]` to `- [x] … ✅` and update the
     task file DoD + Change History sections.
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

# ── Condition 2: PROJECT-STRUCTURE drift at HIGH or MED severity? ──
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
     (run project-structure-generator for guided edits) or revert the source
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

# ── Condition 3: ROADMAP [x] ↔ task file body `- [ ]` checkbox drift ──
# Catches the Phase 4 Step 14b failure mode: ROADMAP marks a task `[x]` but
# DoD `- [ ]` checkboxes inside the task file body are left unchecked.
# DoD is the AC contract — `mark_complete.py` flips both in one shot, so any
# drift here means someone hand-edited the markdown outside the JSON SoT.
#
# ROADMAP entry pattern: `- [x] **T### — <branch_type>: <title>** …`
# Task filename pattern: `T###-<slug>.md`
#
# Paths are env-overridable for projects with non-default docs layout:
#   HARNESS_ROADMAP_PATH (default: docs/ROADMAP.md)
#   HARNESS_TASKS_DIR    (default: docs/tasks)
ROADMAP_FILE="$PROJECT_DIR/${HARNESS_ROADMAP_PATH:-docs/ROADMAP.md}"
TASKS_DIR_PATH="$PROJECT_DIR/${HARNESS_TASKS_DIR:-docs/tasks}"
if [[ -f "$ROADMAP_FILE" && -d "$TASKS_DIR_PATH" ]]; then
    BOX_DRIFT=""
    while IFS= read -r task_id; do
        [[ -z "$task_id" ]] && continue
        task_file=$(find "$TASKS_DIR_PATH" -maxdepth 1 -name "${task_id}-*.md" -print -quit 2>/dev/null)
        if [[ -z "$task_file" ]]; then
            BOX_DRIFT+="  $task_id: ROADMAP=[x] but no matching ${task_id}-*.md found in $TASKS_DIR_PATH"$'\n'
            continue
        fi
        # Count unchecked checkboxes anywhere in the body (no anchor restriction).
        # Pattern matches `- [ ]` and `* [ ]` at start of a list item.
        unchecked=$(grep -cE '^[[:space:]]*[-*][[:space:]]+\[[[:space:]]\][[:space:]]' "$task_file" || true)
        if [[ "$unchecked" -gt 0 ]]; then
            BOX_DRIFT+="  $task_id ($(basename "$task_file")): ROADMAP=[x] but ${unchecked} unchecked \`- [ ]\` item(s) remain in task file body"$'\n'
        fi
    done < <(grep -oE '^- \[x\][[:space:]]+\*\*T[0-9]{3} —' "$ROADMAP_FILE" \
        | sed -E 's/^- \[x\][[:space:]]+\*\*(T[0-9]{3}) —.*/\1/')

    if [[ -n "$BOX_DRIFT" ]]; then
        BOX_SKIP=0
        if echo "$COMMAND" | grep -qE '(^|[[:space:]])DOCS_SYNC_SKIP=1([[:space:]]|$)'; then
            BOX_SKIP=1
        fi
        if (( BOX_SKIP == 0 )); then
            REASON=$(cat <<MSG
[DOC-SYNC GATE] Blocked: ROADMAP \`[x]\` task has unchecked \`- [ ]\` items remaining in task file body.

$BOX_DRIFT
Phase 4 Step 14b requires that for any task marked \`[x]\` in ROADMAP, all
body checklists (DoD items) must be synced to \`- [x]\`. The DoD list is the
AC contract.

Resolve:
  1. Re-run the roadmap-generator subagent in MARK COMPLETE mode for the task,
     OR invoke directly (single line):
       python3 .claude/skills/roadmap/scripts/mark_complete.py --task T### --change "<summary>" --author "<name>" --roadmap docs/ROADMAP.md --tasks-dir docs/tasks
  2. If an item is genuinely not met, edit roadmap-input.json to remove it
     from the task \`dod[]\` (or split to a follow-up task) and re-render
     via generate_roadmap.py, then re-run mark_complete.py.
  3. Include the change in a \`📝 docs: sync\` commit.
  4. Retry the PR command.

Override (last resort): prefix the PR command with DOCS_SYNC_SKIP=1.
Use only when there is a justified, deliberately deferred unchecked item.
MSG
)
            jq -n --arg reason "$REASON" '{ decision: "block", reason: $reason }'
            exit 0
        fi
    fi
fi

exit 0
