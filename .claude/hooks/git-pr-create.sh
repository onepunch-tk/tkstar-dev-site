#!/bin/bash
# git-pr-create.sh — creation stage of the split PR flow.
# Pushes the current feature branch and opens a PR via gh CLI, then exits
# with the PR URL on stdout. Merging is a separate step handled by
# git-pr-merge.sh after explicit user confirmation.
#
# Usage:
#   .claude/hooks/git-pr-create.sh --title "<title>" --body "<body>" [--issue <N>]
#
# On success the final two lines printed to stdout are:
#   PR created: #<N>
#   URL: <pr-url>

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

TITLE=""
BODY=""
ISSUE_NUMBER=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --title) TITLE="$2"; shift 2 ;;
    --body)  BODY="$2";  shift 2 ;;
    --issue) ISSUE_NUMBER="$2"; shift 2 ;;
    --print-resolved-project-dir)
      # Debug/test short-circuit: print the resolved PROJECT_DIR and exit
      # before any git/gh side effect. Used by project-dir-fallback.test.sh
      # to lock in the CLAUDE_PROJECT_DIR fallback behavior.
      printf '%s\n' "$PROJECT_DIR"; exit 0 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$TITLE" ]]; then
  echo "--title is required" >&2
  exit 1
fi

cd "$PROJECT_DIR"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh CLI is not installed." >&2
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "gh authentication required. Run: gh auth login" >&2
  exit 1
fi

CURRENT_BRANCH=$(git branch --show-current)
if config_is_protected_branch "$CURRENT_BRANCH"; then
  echo "Cannot create PR from protected branch: $CURRENT_BRANCH" >&2
  exit 1
fi

BASE_BRANCH=$(config_get '.integrationBranch' 'development')

# Auto-commit any .claude/ hook/agent artifacts so they accompany the PR.
if [[ -n "$(git status --porcelain -- .claude/)" ]]; then
  git add .claude/
  git commit -m "🔧 chore: auto-commit .claude/ hook and agent artifacts" --no-verify >/dev/null 2>&1 || true
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Uncommitted changes detected. Commit before creating a PR." >&2
  git status --short >&2
  exit 1
fi

# Append issue relation to body. Use "Related:" rather than "Closes:" because
# GitHub auto-close only applies to PRs targeting the default branch.
if [[ -n "$ISSUE_NUMBER" ]]; then
  if [[ -n "$BODY" ]]; then
    BODY="$BODY

---
Related: #$ISSUE_NUMBER"
  else
    BODY="Related: #$ISSUE_NUMBER"
  fi
fi

echo "Creating PR: $CURRENT_BRANCH -> $BASE_BRANCH"

# Base-freshness warning (non-blocking).
git fetch origin "$BASE_BRANCH" --quiet 2>/dev/null || true
MERGE_BASE=$(git merge-base HEAD "origin/$BASE_BRANCH" 2>/dev/null || echo "")
REMOTE_HEAD=$(git rev-parse "origin/$BASE_BRANCH" 2>/dev/null || echo "")
if [[ -n "$MERGE_BASE" && -n "$REMOTE_HEAD" && "$MERGE_BASE" != "$REMOTE_HEAD" ]]; then
  BEHIND=$(git rev-list --count "$MERGE_BASE..$REMOTE_HEAD" 2>/dev/null || echo 0)
  echo "Warning: feature branch is $BEHIND commit(s) behind origin/$BASE_BRANCH. Rebase is recommended."
fi

if ! git push origin "$CURRENT_BRANCH" 2>&1; then
  echo "git push failed." >&2
  exit 1
fi

PR_CMD=(gh pr create --base "$BASE_BRANCH" --title "$TITLE")
if [[ -n "$BODY" ]]; then
  PR_CMD+=(--body "$BODY")
fi

PR_URL=$("${PR_CMD[@]}" 2>&1) || {
  echo "gh pr create failed: $PR_URL" >&2
  exit 1
}

PR_NUMBER=$(echo "$PR_URL" | grep -oE '[0-9]+$' || true)

echo ""
echo "PR created: #$PR_NUMBER"
echo "URL: $PR_URL"
echo ""
echo "Next step: confirm with the user, then run:"
if [[ -n "$ISSUE_NUMBER" ]]; then
  echo "  .claude/hooks/git-pr-merge.sh --pr $PR_NUMBER --issue $ISSUE_NUMBER"
else
  echo "  .claude/hooks/git-pr-merge.sh --pr $PR_NUMBER"
fi
