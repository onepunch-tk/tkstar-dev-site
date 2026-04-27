#!/bin/bash
set -euo pipefail

# gh-auth-check.sh — PreToolUse hook for Bash
# Automatically checks gh auth status when gh commands are executed.
# Blocks gh commands if GitHub Mode is not configured.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$SCRIPT_DIR/../.." && pwd)}"

INPUT=$(cat)

# Extract command from Bash tool input
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // ""')

# Ignore if not a gh command
if ! echo "$COMMAND" | grep -qE '(^|\s|/)gh\s'; then
    exit 0
fi

# Skip for utility scripts (they have their own auth checks)
if echo "$COMMAND" | grep -qE 'git-(issue|pr|release)\.sh'; then
    exit 0
fi

# ─── GitHub Mode check ───
CLAUDE_MD="$PROJECT_DIR/CLAUDE.md"
if [[ -f "$CLAUDE_MD" ]]; then
    REMOTE_PLATFORM=$(grep -i 'Remote Platform' "$CLAUDE_MD" 2>/dev/null | grep -oi 'github' | tr '[:upper:]' '[:lower:]' || echo "")
    if [[ "$REMOTE_PLATFORM" != "github" ]]; then
        jq -n '{
            decision: "block",
            reason: "GitHub Mode is not configured. Add Remote Platform: GitHub to CLAUDE.md, or use git commands instead of gh."
        }'
        exit 0
    fi
fi

# ─── gh installation check ───
if ! command -v gh &>/dev/null; then
    jq -n '{
        decision: "block",
        reason: "gh CLI is not installed. Install with: brew install gh"
    }'
    exit 0
fi

# ─── gh auth check ───
if ! gh auth status &>/dev/null 2>&1; then
    jq -n '{
        decision: "block",
        reason: "gh authentication expired or not configured. Ask user to run: ! gh auth login"
    }'
    exit 0
fi

exit 0
