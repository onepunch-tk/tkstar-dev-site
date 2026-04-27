#!/bin/bash
set -euo pipefail

# git-issue.sh — GitHub Issue creation utility
# Agent composes title/body, this script handles the rest
#
# Usage:
#   .claude/hooks/git-issue.sh --title "✨ implement login" --body "## Description\n..." [--label "enhancement"]
#
# Output (stdout, last line):
#   ISSUE_NUMBER=42

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

# ─── Parse arguments ───
TITLE=""
BODY=""
LABEL=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --title) TITLE="$2"; shift 2 ;;
        --body) BODY="$2"; shift 2 ;;
        --label) LABEL="$2"; shift 2 ;;
        *) echo "❌ Unknown option: $1" >&2; exit 1 ;;
    esac
done

if [[ -z "$TITLE" ]]; then
    echo "❌ --title is required" >&2
    exit 1
fi

# ─── Prerequisites ───
if ! command -v gh &>/dev/null; then
    echo "❌ gh CLI is not installed. Install with: brew install gh" >&2
    exit 1
fi

if ! gh auth status &>/dev/null 2>&1; then
    echo "❌ gh authentication required. Run: ! gh auth login" >&2
    exit 1
fi

if ! gh repo view --json name &>/dev/null 2>&1; then
    echo "❌ GitHub repo not connected. Run: git remote add origin <url>" >&2
    exit 1
fi

# ─── Check for duplicate issues ───
if gh issue list --state open --search "$TITLE" --limit 1 --json number 2>/dev/null | grep -q '"number"'; then
    EXISTING=$(gh issue list --state open --search "$TITLE" --limit 1 --json number,title --jq '.[0] | "#\(.number) \(.title)"')
    echo "⚠️ Similar open issue exists: $EXISTING" >&2
fi

# ─── Create issue ───
CMD=(gh issue create --title "$TITLE")

if [[ -n "$BODY" ]]; then
    CMD+=(--body "$BODY")
fi

if [[ -n "$LABEL" ]]; then
    # Verify label exists in repo
    if gh label list --json name --jq '.[].name' 2>/dev/null | grep -qx "$LABEL"; then
        CMD+=(--label "$LABEL")
    fi
fi

ISSUE_URL=$("${CMD[@]}" 2>&1)

if [[ $? -ne 0 ]]; then
    echo "❌ Issue creation failed: $ISSUE_URL" >&2
    exit 1
fi

# ─── Parse issue number ───
ISSUE_NUMBER=$(echo "$ISSUE_URL" | grep -oE '[0-9]+$')

if [[ -z "$ISSUE_NUMBER" ]]; then
    echo "❌ Failed to parse issue number from: $ISSUE_URL" >&2
    exit 1
fi

# ─── Output ───
echo "═══════════════════════════════════════"
echo "📋 GitHub Issue Created"
echo "═══════════════════════════════════════"
echo ""
echo "  Issue:  #$ISSUE_NUMBER"
echo "  Title:  $TITLE"
[[ -n "$LABEL" ]] && echo "  Label:  $LABEL"
echo "  URL:    $ISSUE_URL"
echo ""
echo "───────────────────────────────────────"

# Machine-readable output (agent parses this)
echo "ISSUE_NUMBER=$ISSUE_NUMBER"
