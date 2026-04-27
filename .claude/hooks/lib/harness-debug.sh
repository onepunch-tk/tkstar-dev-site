#!/bin/bash
# harness-debug.sh — opt-in hook observability via HARNESS_DEBUG=1.
#
# Hooks silently exit 0 in many early paths (phase mismatch, dedup already
# fired, missing state, wrong tool). Without logging, investigating "why
# didn't the hook fire?" requires manual grep across scripts.
#
# HARNESS_DEBUG=1 makes each early exit self-identify to stderr.
# No-op when unset (zero cost in normal operation).
#
# Usage:
#   source "$(dirname "${BASH_SOURCE[0]}")/lib/harness-debug.sh"
#   [[ condition ]] || { harness_debug hook-name "why we bailed"; exit 0; }

# harness_debug <hook_name> <reason>
harness_debug() {
  [[ "${HARNESS_DEBUG:-}" == "1" ]] || return 0
  echo "[$1] skip: $2" >&2
}

export -f harness_debug
