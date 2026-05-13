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
source "$SCRIPT_DIR/../lib/config.sh"

# TypeScript edits → typecheck via package manager.
# Rust edits → cargo check via the nearest Cargo.toml.
# Anything else → no-op.
LANG=""
case "$FILE_PATH" in
  *.ts|*.tsx) LANG="ts" ;;
  *.rs)       LANG="rs" ;;
  *) exit 0 ;;
esac

if [[ "$LANG" == "rs" ]]; then
  # Walk up to the nearest Cargo.toml. If none, silently exit (file is not part of a Cargo workspace).
  if ! CARGO_DIR=$(detect_rust_project "$FILE_PATH"); then
    exit 0
  fi
  STATE_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/runtime/pipeline-state.json"
  PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE" 2>/dev/null || echo "none")

  cd "$CARGO_DIR"

  # Record duration analogously to the TS path. Failure to log must not block.
  log_rs_duration() {
    local DURATION_MS
    DURATION_MS=$(jq -r '.duration_ms // empty' <<<"$INPUT")
    [[ -z "$DURATION_MS" ]] && return 0
    local METRICS="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/hook-metrics.jsonl"
    jq -n -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg hook typecheck-rs \
          --argjson dur "$DURATION_MS" --arg fp "$FILE_PATH" --arg ph "$PHASE" \
      '{ts:$ts, hook:$hook, duration_ms:$dur, file_path:$fp, phase:$ph}' \
      >> "$METRICS" 2>/dev/null || true
  }

  if ! command -v cargo >/dev/null 2>&1; then
    # Cargo not installed — silently skip so non-Rust developers are not blocked.
    log_rs_duration
    exit 0
  fi

  if [[ "$PHASE" == "tdd" ]]; then
    # Red Phase tolerance: check ONLY the library / binary code (without `--tests`).
    # The `#[cfg(test)] mod tests` block is gated out by cfg when `--tests` is
    # absent, so Red-Phase test imports of not-yet-implemented items don't
    # trigger an error. If the source itself fails to compile, that's a real
    # error and we exit 2.
    CARGO_OUTPUT=$(cargo check --message-format short 2>&1)
    CARGO_EXIT=$?
    log_rs_duration
    if [[ "$CARGO_EXIT" -ne 0 ]]; then
      echo "$CARGO_OUTPUT" >&2
      echo "cargo check failed for: $FILE_PATH (source errors during TDD)" >&2
      exit 2
    fi
    exit 0
  fi

  # Non-TDD phase: full check including tests.
  CARGO_OUTPUT=$(cargo check --tests --message-format short 2>&1)
  CARGO_EXIT=$?
  log_rs_duration
  if [[ "$CARGO_EXIT" -ne 0 ]]; then
    echo "$CARGO_OUTPUT" >&2
    echo "cargo check failed for: $FILE_PATH" >&2
    exit 2
  fi
  exit 0
fi

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

STATE_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/runtime/pipeline-state.json"
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
