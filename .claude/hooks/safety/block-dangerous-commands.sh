#!/bin/bash
set -euo pipefail

# PreToolUse Hook: Block dangerous commands
# matcher: Bash

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')

# No command — pass through
[[ -z "$COMMAND" ]] && exit 0

# Dangerous pattern list
DANGEROUS_PATTERNS=(
    "rm -rf /[[:space:]]*$"
    "rm -rf / "
    "rm -rf ~"
    "rm -rf \."
    "sudo "
    "chmod 777"
    "> /dev/(sd|hd|disk|zero|random)"
    "dd if="
    ":\(\){:|:&};:"
    "mkfs\."
    "curl.*\|.*sh"
    "wget.*\|.*sh"
    "reset --hard"
    "push --force"
    "push -f"
    "push origin \+"
    "clean -fd"
)

for pattern in "${DANGEROUS_PATTERNS[@]}"; do
    if echo "$COMMAND" | grep -qE "$pattern"; then
        echo "Blocked: Command contains dangerous pattern '$pattern'" >&2
        echo "Command: $COMMAND" >&2
        exit 2
    fi
done

exit 0
