#!/bin/bash
set -euo pipefail

# PreToolUse Hook: Block modifications to protected files
# matcher: Edit|Write

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path — pass through
[[ -z "$FILE_PATH" ]] && exit 0

# Extract filename from path
FILENAME=$(basename "$FILE_PATH")

# Protected file patterns (substring match against full path)
PROTECTED_PATH_PATTERNS=(
    "package-lock.json"
    "bun.lock"
    "yarn.lock"
    "pnpm-lock.yaml"
    ".git/"
    "credentials.json"
    "secrets."
)

# Protected filenames (exact basename match)
PROTECTED_FILENAMES=(
    ".env"
    ".env.local"
    ".env.production"
    ".env.development"
)

for pattern in "${PROTECTED_PATH_PATTERNS[@]}"; do
    if [[ "$FILE_PATH" == *"$pattern"* ]]; then
        echo "Blocked: '$FILE_PATH' is a protected file (matches '$pattern')" >&2
        exit 2
    fi
done

for name in "${PROTECTED_FILENAMES[@]}"; do
    if [[ "$FILENAME" == "$name" ]]; then
        echo "Blocked: '$FILE_PATH' is a protected file (matches '$name')" >&2
        exit 2
    fi
done

exit 0
