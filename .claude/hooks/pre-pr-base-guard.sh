#!/bin/bash
# pre-pr-base-guard.sh — PreToolUse hook on Bash commands.
#
# Blocks `gh pr create` when the PR base is not the integration branch
# (`development`). Reason: `gh pr create` defaults to the GitHub repo's
# default branch (typically `main`) when `--base` is omitted, and a single
# misclick can land work on the production branch instead of the integration
# branch — which is exactly how PR #22 leaked T006 onto `main` only,
# bypassing `development` entirely.
#
# This hook is a complement to `git-pr-create.sh`, which already pins
# `--base $(config integrationBranch)`. The wrapper covers the harness path;
# this hook closes the raw-command escape route (agent or human typing
# `gh pr create` directly).
#
# Decision logic (first match wins):
#
#   1. Command is not `gh pr create` → exit 0 (out of scope).
#   2. Env-var bypass `HARNESS_PR_BASE_MAIN_OK=1` is present at the start of
#      the command line → exit 0 (release flow). `git-release.sh` opts in by
#      prefixing its `gh pr create` call.
#   3. `--base <integrationBranch>` (default `development`) is explicitly
#      present in the argv → exit 0.
#   4. Anything else (no `--base`, or `--base main`, etc.) → deny with
#      instructions to either pass `--base development` or use the wrapper.
#
# Argv parsing is intentionally narrow: the hook reads argv tokens left to
# right, accepts both `--base <branch>` and `--base=<branch>` forms, and
# bails out with class "other" if the command is anything other than
# `gh pr create`. Quoted bodies (e.g. `--body "..."`) are skipped because we
# only look at flag names, not values, except for `--base` itself.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[[ -z "$CMD" ]] && exit 0

INTEGRATION_BRANCH=$(config_get '.integrationBranch' 'development')

# Tab-separated awk output:
#   CLASS         — "gh_pr_create" | "other"
#   BYPASS        — 1 if HARNESS_PR_BASE_MAIN_OK=1 prefix is present
#   BASE_VALUE    — value of --base if found (empty otherwise)
#   BASE_PRESENT  — 1 if --base appeared (even with empty/odd value)
CLASSIFY=$(printf '%s' "$CMD" | awk -v ib="$INTEGRATION_BRANCH" '
  BEGIN {
    class = "other"
    bypass = 0
    base_value = ""
    base_present = 0
    OFS = "\t"
  }
  {
    n = split($0, words, /[[:space:]]+/)

    # Strip leading env-var assignments and detect the bypass.
    argc = 0
    for (i = 1; i <= n; i++) {
      w = words[i]
      if (w == "") continue
      if (argc == 0 && w ~ /^[A-Za-z_][A-Za-z0-9_]*=/) {
        if (w == "HARNESS_PR_BASE_MAIN_OK=1") bypass = 1
        continue
      }
      argc++
      argv[argc] = w
    }

    # Need at least `gh pr create` (3 tokens).
    if (argc < 3) {
      print class, bypass, base_value, base_present
      exit 0
    }
    if (argv[1] != "gh" || argv[2] != "pr" || argv[3] != "create") {
      print class, bypass, base_value, base_present
      exit 0
    }
    class = "gh_pr_create"

    # Scan for --base / --base=<value>. First match wins.
    for (i = 4; i <= argc; i++) {
      t = argv[i]
      if (t == "--base") {
        base_present = 1
        if (i + 1 <= argc) base_value = argv[i + 1]
        break
      }
      if (t ~ /^--base=/) {
        base_present = 1
        sub(/^--base=/, "", t)
        base_value = t
        break
      }
    }

    print class, bypass, base_value, base_present
  }
')

IFS=$'\t' read -r CLASS BYPASS BASE_VALUE BASE_PRESENT <<<"$CLASSIFY"

# Out of scope.
[[ "$CLASS" != "gh_pr_create" ]] && exit 0

# Env-var bypass — release flow (`git-release.sh`) opts in this way.
[[ "$BYPASS" == "1" ]] && exit 0

# Strip surrounding quotes that might leak through awk word splitting.
BASE_VALUE="${BASE_VALUE#\"}"; BASE_VALUE="${BASE_VALUE%\"}"
BASE_VALUE="${BASE_VALUE#\'}"; BASE_VALUE="${BASE_VALUE%\'}"

if [[ "$BASE_PRESENT" == "1" && "$BASE_VALUE" == "$INTEGRATION_BRANCH" ]]; then
  exit 0
fi

# Build context-dependent reason message.
if [[ "$BASE_PRESENT" == "0" ]]; then
  REASON_DETAIL="Command is missing \`--base\`. \`gh pr create\` falls back to the GitHub default branch (often \`main\`), which is exactly how PR #22 leaked T006 onto \`main\` only."
else
  REASON_DETAIL="Command targets \`--base ${BASE_VALUE}\`. Only \`--base ${INTEGRATION_BRANCH}\` is allowed by default."
fi

REASON="PR base must be the integration branch \`${INTEGRATION_BRANCH}\` (CLAUDE.md §Git Integration). ${REASON_DETAIL} Required flow: (1) preferred — call the wrapper \`.claude/hooks/git-pr-create.sh --title ... --body ... [--issue N]\`, which pins \`--base ${INTEGRATION_BRANCH}\` for you; (2) if you must invoke \`gh pr create\` directly, pass \`--base ${INTEGRATION_BRANCH}\` explicitly. Release flow (development → main) is the only legitimate exception and is handled by \`.claude/hooks/git-release.sh\`, which opts in via the \`HARNESS_PR_BASE_MAIN_OK=1\` env prefix — do NOT set this variable manually for routine work; it exists so release tooling has a sanctioned escape hatch."

jq -n --arg reason "$REASON" '{
  hookSpecificOutput: {
    hookEventName: "PreToolUse",
    permissionDecision: "deny",
    permissionDecisionReason: $reason
  }
}'
exit 0
