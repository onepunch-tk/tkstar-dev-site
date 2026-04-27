#!/bin/bash
# biome-format.sh — PostToolUse hook on Edit|Write tools.
# Auto-formats edited files via Biome when the project has a Biome config.
# Extensions and config filenames are loaded from lib/config.sh so non-Biome
# projects (ESLint/Prettier) silently no-op without code changes here.

set -uo pipefail

INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[[ -z "$FILE_PATH" ]] && exit 0

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"

# Resolve biome config filenames (with fallback for bare projects).
BIOME_CONFIGS=()
while IFS= read -r cfg; do
  [[ -z "$cfg" ]] && continue
  BIOME_CONFIGS+=("$cfg")
done < <(config_get_array '.biomeConfigs')
if [[ ${#BIOME_CONFIGS[@]} -eq 0 ]]; then
  BIOME_CONFIGS=(biome.json biome.jsonc)
fi

# Walk up from the edited file to the nearest biome config directory. This is
# monorepo-aware: Turborepo / pnpm-workspaces layouts often keep biome.json
# inside each app or package (apps/web/biome.json) rather than the repo root.
# Fall back to PROJECT_DIR's biome config if no nearer one exists.
SEARCH_DIR=$(dirname "$FILE_PATH")
CONFIG_DIR=""
while [[ -n "$SEARCH_DIR" && "$SEARCH_DIR" != "/" ]]; do
  for cfg in "${BIOME_CONFIGS[@]}"; do
    if [[ -f "$SEARCH_DIR/$cfg" ]]; then
      CONFIG_DIR="$SEARCH_DIR"
      break 2
    fi
  done
  SEARCH_DIR=$(dirname "$SEARCH_DIR")
done

# Final fallback: explicit PROJECT_DIR scan (handles odd layouts where the
# walk-up terminated above the project root).
if [[ -z "$CONFIG_DIR" ]]; then
  for cfg in "${BIOME_CONFIGS[@]}"; do
    if [[ -f "$PROJECT_DIR/$cfg" ]]; then
      CONFIG_DIR="$PROJECT_DIR"
      break
    fi
  done
fi

# No biome config anywhere → silent no-op. Projects using ESLint + Prettier or
# no formatter fall through here cleanly.
[[ -z "$CONFIG_DIR" ]] && exit 0

# Resolve biome-supported extensions (with fallback).
BIOME_EXTS=()
while IFS= read -r e; do
  [[ -z "$e" ]] && continue
  BIOME_EXTS+=("$e")
done < <(config_get_array '.biomeExtensions')
if [[ ${#BIOME_EXTS[@]} -eq 0 ]]; then
  BIOME_EXTS=(.js .jsx .ts .tsx .json .css .graphql .gql)
fi

EXT=".${FILE_PATH##*.}"
SUPPORTED=false
for e in "${BIOME_EXTS[@]}"; do
  if [[ "$EXT" == "$e" ]]; then
    SUPPORTED=true
    break
  fi
done
[[ "$SUPPORTED" == "false" ]] && exit 0

# Use the detected package manager's runner (bunx / pnpm dlx / etc.) to run
# biome. Execute from CONFIG_DIR so biome picks up the nearest biome.json.
PKG_MANAGER=$(detect_package_manager)
case "$PKG_MANAGER" in
  bun)  RUNNER="bunx" ;;
  pnpm) RUNNER="pnpm dlx" ;;
  yarn) RUNNER="yarn dlx" ;;
  npm)  RUNNER="npx" ;;
  *)    RUNNER="npx" ;;
esac

(cd "$CONFIG_DIR" && $RUNNER biome format --write "$FILE_PATH" 2>/dev/null) || true

# Record tool execution duration (v2.1.118+ provides duration_ms in PostToolUse
# input). Append-only JSONL — file is gitignored, low IO cost. Failure to
# append must not block the hook.
DURATION_MS=$(jq -r '.duration_ms // empty' <<<"$INPUT")
if [[ -n "$DURATION_MS" ]]; then
  METRICS="$PROJECT_DIR/.claude/hook-metrics.jsonl"
  jq -n -c --arg ts "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg hook biome-format \
        --argjson dur "$DURATION_MS" --arg fp "$FILE_PATH" \
    '{ts:$ts, hook:$hook, duration_ms:$dur, file_path:$fp}' \
    >> "$METRICS" 2>/dev/null || true
fi

exit 0
