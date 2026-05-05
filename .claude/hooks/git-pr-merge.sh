#!/bin/bash
# git-pr-merge.sh — merge stage of the split PR flow.
# Merges an already-created PR into the integration branch, cleans up the
# local feature branch, and resets harness state files. This script MUST
# only be invoked after explicit user confirmation. The pre-merge-ask.sh
# PreToolUse hook enforces that confirmation as a second defense layer.
#
# Usage:
#   .claude/hooks/git-pr-merge.sh --pr <N> [--issue <M>]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

PR_NUMBER=""
ISSUE_NUMBER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --pr)    PR_NUMBER="$2"; shift 2 ;;
    --issue) ISSUE_NUMBER="$2"; shift 2 ;;
    --print-resolved-project-dir)
      # Debug/test short-circuit: print the resolved PROJECT_DIR and exit
      # before any git/gh side effect. Used by project-dir-fallback.test.sh
      # to lock in the CLAUDE_PROJECT_DIR fallback behavior.
      printf '%s\n' "$PROJECT_DIR"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$PR_NUMBER" ]]; then
  echo "--pr is required" >&2
  exit 1
fi

cd "$PROJECT_DIR"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is not installed." >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "gh authentication required." >&2
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
BASE_BRANCH=$(config_get '.integrationBranch' 'development')

echo "Merging PR #$PR_NUMBER into $BASE_BRANCH (squash)..."

# Squash merge keeps development history clean: one commit per PR.
if ! gh pr merge "$PR_NUMBER" --squash --delete-branch 2>&1; then
  echo "gh pr merge failed. Check the PR for conflicts or required reviews." >&2
  exit 1
fi

echo "Merge complete."

# Close the linked issue explicitly (auto-close only works from the default branch).
if [[ -n "$ISSUE_NUMBER" ]]; then
  if gh issue close "$ISSUE_NUMBER" >/dev/null 2>&1; then
    echo "Closed issue #$ISSUE_NUMBER."
  else
    echo "Warning: failed to close issue #$ISSUE_NUMBER (may require manual close)."
  fi
fi

# Switch to the integration branch and pull.
git checkout "$BASE_BRANCH" >/dev/null 2>&1 || true
git pull origin "$BASE_BRANCH" >/dev/null 2>&1 || true

# Delete the local feature branch (remote was deleted by --delete-branch).
if [[ -n "$CURRENT_BRANCH" ]] && ! config_is_protected_branch "$CURRENT_BRANCH"; then
  git branch -d "$CURRENT_BRANCH" >/dev/null 2>&1 || true
fi

# Reset harness state files so the next task starts cleanly.
STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
if [[ -f "$STATE_FILE" ]]; then
  PREV_GITHUB_MODE=$(jq -r '.github_mode // false' "$STATE_FILE")
  jq -n --argjson gm "$PREV_GITHUB_MODE" --arg branch "$BASE_BRANCH" --arg now "$(date -u +%Y-%m-%dT%H:%M:%SZ)" '{
    current_phase: "none",
    mode: "none",
    branch: $branch,
    plan_approved: false,
    tasks_created: false,
    github_mode: $gm,
    issue_number: null,
    ui_involved: false,
    review_unresolved_count: 0,
    design_review_unresolved_count: 0,
    updated_at: $now
  }' > "$STATE_FILE"
  echo "pipeline-state.json reset."
fi

HOOK_STATE="$PROJECT_DIR/.claude/runtime/hook-state.json"
if [[ -f "$HOOK_STATE" ]]; then
  echo '{"last_reminded_phase":"","workflow_warnings_sent":{},"cooldown_until":"","failure_recovery":{}}' > "$HOOK_STATE"
  echo "hook-state.json reset."
fi

OWNERSHIP="$PROJECT_DIR/.claude/runtime/ownership.json"
if [[ -f "$OWNERSHIP" ]]; then
  jq -n '{
    mode: "none",
    teammates: {},
    shared: []
  }' > "$OWNERSHIP"
  echo "ownership.json reset."
fi

# Commit and push the state reset to the integration branch.
if [[ -n "$(git status --porcelain -- .claude/)" ]]; then
  git add .claude/
  git commit -m "🔧 chore: reset harness state after merge" --no-verify >/dev/null 2>&1 || true
  git push origin "$BASE_BRANCH" >/dev/null 2>&1 || true
fi

echo ""
echo "PR #$PR_NUMBER merged. Current branch: $BASE_BRANCH."
