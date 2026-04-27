#!/bin/bash
# config.sh — harness configuration loader for hook scripts.
#
# Usage from a hook:
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/config.sh"
#   branches=$(config_get_array '.protectedBranches')
#
# All helpers return safe defaults when .claude/config.json is absent, so hooks
# work out-of-the-box on any TypeScript project without a config file.
# `jq` is a hard dependency already assumed by every hook.

set -uo pipefail

CONFIG_FILE="${CLAUDE_PROJECT_DIR:-$PWD}/.claude/config.json"

# config_get <jq-path> <default>
#   Prints the scalar value at <jq-path> in config.json, or <default> if missing/null/empty.
config_get() {
  local path="$1"
  local default="${2:-}"
  if [[ -f "$CONFIG_FILE" ]]; then
    local val
    val=$(jq -r "$path // empty" "$CONFIG_FILE" 2>/dev/null || echo "")
    if [[ -n "$val" && "$val" != "null" ]]; then
      printf '%s\n' "$val"
      return 0
    fi
  fi
  printf '%s\n' "$default"
}

# config_get_array <jq-path>
#   Prints the array elements at <jq-path>, one per line. Empty output if missing.
config_get_array() {
  local path="$1"
  if [[ -f "$CONFIG_FILE" ]]; then
    jq -r "$path[]?" "$CONFIG_FILE" 2>/dev/null || true
  fi
}

# config_matches_pattern <array-jq-path> <value>
#   Returns 0 if <value> matches any glob pattern in the array, else 1.
config_matches_pattern() {
  local array_path="$1"
  local value="$2"
  local pattern
  while IFS= read -r pattern; do
    [[ -z "$pattern" ]] && continue
    # shellcheck disable=SC2053
    if [[ "$value" == $pattern ]]; then
      return 0
    fi
  done < <(config_get_array "$array_path")
  return 1
}

# detect_package_manager
#   Echoes the detected package manager: bun, pnpm, yarn, or npm.
#   Honors explicit config override; otherwise probes lockfiles in priority order.
detect_package_manager() {
  local explicit
  explicit=$(config_get '.packageManager' 'auto')
  if [[ "$explicit" != "auto" && -n "$explicit" ]]; then
    printf '%s\n' "$explicit"
    return 0
  fi
  local dir="${CLAUDE_PROJECT_DIR:-$PWD}"
  if [[ -f "$dir/bun.lock" || -f "$dir/bun.lockb" ]]; then
    printf 'bun\n'
    return 0
  fi
  if [[ -f "$dir/pnpm-lock.yaml" ]]; then
    printf 'pnpm\n'
    return 0
  fi
  if [[ -f "$dir/yarn.lock" ]]; then
    printf 'yarn\n'
    return 0
  fi
  if [[ -f "$dir/package-lock.json" ]]; then
    printf 'npm\n'
    return 0
  fi
  printf 'npm\n'
}

# config_report_dir <kind>
#   Kind is one of: codeReview, designReview, failures.
#   Returns the configured path or a sensible default.
config_report_dir() {
  local kind="$1"
  local default=""
  case "$kind" in
    codeReview)    default="docs/reports/code-review" ;;
    designReview)  default="docs/reports/design-review" ;;
    failures)      default="docs/reports/failures" ;;
    *)             default="docs/reports/$kind" ;;
  esac
  config_get ".reportDirs.$kind" "$default"
}

# config_is_protected_branch <branch-name>
#   Returns 0 if the branch is in protectedBranches, else 1.
#   The built-in default list applies ONLY when protectedBranches is absent
#   from config.json — once a user declares their own list, that list is
#   authoritative, even if it is a strict subset of the defaults.
config_is_protected_branch() {
  local branch="$1"
  local p
  local found_any=0
  while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    found_any=1
    if [[ "$branch" == "$p" ]]; then
      return 0
    fi
  done < <(config_get_array '.protectedBranches')

  # Only fall back to defaults when no protectedBranches array was configured.
  if [[ "$found_any" -eq 0 ]]; then
    case "$branch" in
      main|development) return 0 ;;
    esac
  fi
  return 1
}

export -f config_get config_get_array config_matches_pattern detect_package_manager config_report_dir config_is_protected_branch
