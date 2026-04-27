#!/bin/bash
# typecheck.sh — PostToolUse hook on Edit|Write tools.
# Runs the project's typecheck script for TypeScript edits. During the TDD
# phase, test-file-only errors are tolerated (Red Phase expects imports of
# not-yet-created modules). Package manager and test patterns come from
# lib/config.sh so the hook stays project-agnostic.

set -uo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[[ -z "$FILE_PATH" ]] && exit 0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

# Only TypeScript edits trigger typecheck.
case "$FILE_PATH" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac

# Walk up from the edited file to the nearest package.json (monorepo-aware).
SEARCH_DIR=$(dirname "$FILE_PATH")
PROJECT_ROOT=""
while [[ "$SEARCH_DIR" != "/" ]]; do
  if [[ -f "$SEARCH_DIR/package.json" ]]; then
    PROJECT_ROOT="$SEARCH_DIR"
    break
  fi
  SEARCH_DIR=$(dirname "$SEARCH_DIR")
done
[[ -z "$PROJECT_ROOT" ]] && exit 0

cd "$PROJECT_ROOT"

PKG_MANAGER=$(detect_package_manager)
case "$PKG_MANAGER" in
  bun)  PKG_CMD="bun run" ;;
  pnpm) PKG_CMD="pnpm run" ;;
  yarn) PKG_CMD="yarn" ;;
  npm)  PKG_CMD="npm run" ;;
  *)    PKG_CMD="npm run" ;;
esac

STATE_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/pipeline-state.json"
PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE" 2>/dev/null || echo "none")

# Build the regex used to classify errors as "test-only" using configured
# test file patterns. Convert globs to a simple regex alternation.
TEST_REGEX=$(config_get_array '.testFilePatterns' \
  | sed -e 's/[][\\.^$*+?(){}|]/\\&/g' -e 's/\\\*\\\*/.*/g' -e 's/\\\*/[^\/]*/g' \
  | paste -sd'|' -)

if [[ -z "$TEST_REGEX" ]]; then
  # Fallback regex if config failed.
  TEST_REGEX='\.(test|spec)\.(ts|tsx|js|jsx)'
fi

# Record tool execution duration (v2.1.118+ provides duration_ms in PostToolUse
# input). Append-only JSONL — file is gitignored, low IO cost. Failure to
# append must not block the hook. Logged regardless of typecheck outcome so
# slow type-graph regressions surface in the metrics file.
log_duration() {
  local DURATION_MS
  DURATION_MS=$(jq -r '.duration_ms // empty' <<<"$INPUT")
  [[ -z "$DURATION_MS" ]] && return 0
  local METRICS="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/hook-metrics.jsonl"
  jq -n -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg hook typecheck \
        --argjson dur "$DURATION_MS" --arg fp "$FILE_PATH" --arg ph "$PHASE" \
    '{ts:$ts, hook:$hook, duration_ms:$dur, file_path:$fp, phase:$ph}' \
    >> "$METRICS" 2>/dev/null || true
}

if [[ "$PHASE" == "tdd" ]]; then
  TSC_OUTPUT=$($PKG_CMD typecheck 2>&1) || true
  NON_TEST_ERRORS=$(printf '%s' "$TSC_OUTPUT" | grep 'error TS' | grep -vE "$TEST_REGEX" || true)
  log_duration
  if [[ -n "$NON_TEST_ERRORS" ]]; then
    echo "$TSC_OUTPUT" >&2
    echo "TypeCheck failed for: $FILE_PATH (source errors during TDD)" >&2
    exit 2
  fi
  exit 0
fi

if ! $PKG_CMD typecheck 2>&1; then
  log_duration
  echo "TypeCheck failed for: $FILE_PATH" >&2
  exit 2
fi

log_duration
exit 0
