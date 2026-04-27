#!/bin/bash
# pre-merge-ask.sh — PreToolUse hook on Bash commands.
#
# Gates three invocation classes that would otherwise bypass the harness
# merge-confirmation + state-reset flow:
#
#   1. `.claude/hooks/git-pr-merge.sh` without HARNESS_SKIP_MERGE_CONFIRM=1
#      → deny, instruct the agent to run AskUserQuestion first.
#   2. Raw `gh pr merge …`
#      → deny, redirect to the wrapper script (which runs the squash merge,
#      closes the linked issue, syncs local branches, resets harness state).
#   3. Raw `git push …` targeting a protected branch (main, development, …)
#      OR pushing all/mirror refs (which implicitly include protected ones)
#      → deny. PR-only workflow per CLAUDE.md.
#
# Using `permissionDecision: "deny"` (not "ask") because deny outranks the
# global `Bash(*)` permission in the standard allow/deny precedence, so this
# gate cannot be bypassed by a broad allow-list. The permissionDecisionReason
# goes to Claude (per the hooks spec: deny reasons are shown to Claude, ask
# reasons are shown to the user), making it the right place to instruct the
# agent on the required confirmation flow.
#
# Wrapper bypass env var: HARNESS_SKIP_MERGE_CONFIRM=1 (strict — only the
# literal string "1" bypasses; any other value denies). The agent MUST only
# set it after the user answered "머지 진행" via AskUserQuestion — not
# unilaterally. This bypass applies ONLY to class 1 (wrapper invocation);
# classes 2 and 3 are never bypassable from here.
#
# Known limitations (documented for maintainers — NOT bugs to file):
#   - The classifier inspects only the *first* command in the input string.
#     Chained forms hide subsequent commands: `echo hi && git push origin main`,
#     `( git push origin main )`, `bash -c "gh pr merge 1"`, `xargs gh pr merge`.
#     These are not reachable without a full shell lexer. A future hardening
#     could add a second-pass regex scan for `\bgh pr merge\b` /
#     `\bgit push .*(main|development)\b` anywhere in the string, at the cost
#     of false positives from quoted bodies.
#   - `git push` with ambient upstream config (`git push` alone) pushes the
#     currently-checked-out branch. This hook allows it because it has no
#     visibility into the current branch without a fork; `git-pr-merge.sh` is
#     the correct path for pushing protected branches and is enforced by
#     convention + CLAUDE.md rather than by this hook.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/config.sh
source "$SCRIPT_DIR/lib/config.sh"

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[[ -z "$CMD" ]] && exit 0

# Parse the command's leading tokens. Consume any leading env-var assignments
# (`KEY=VAL`) and any git global options (`-C <dir>`, `-c key=val`, `--git-dir=…`,
# `--work-tree=…`, `--namespace=…`, `--exec-path=…`, etc.) before classifying.
# Mentions inside quoted argument bodies are ignored because they come after
# argv[0..2] in the stream.
#
# Output (tab-separated so push_args with spaces round-trips intact):
#   CLASS     — one of: wrapper | raw_gh_pr_merge | raw_git_push | other
#   BYPASS    — 1 if HARNESS_SKIP_MERGE_CONFIRM=1 appears in the env-var prefix
#   PUSH_FLAG — 1 if `--all` or `--mirror` appears in push argv (deny without ref check)
#   PUSH_ARGS — remaining argv tokens after `git push` (space-joined for ref scan)
CLASSIFY=$(printf '%s' "$CMD" | awk '
  BEGIN {
    class = "other"
    bypass = 0
    push_flag_all = 0
    push_args = ""
    cmd = ""
    OFS = "\t"
  }
  { cmd = (cmd == "" ? $0 : cmd " " $0) }
  END {
    n = split(cmd, words, /[[:space:]]+/)

    # Skip leading env assignments; first non-assignment word is argv[0].
    argc = 0
    for (i = 1; i <= n; i++) {
      w = words[i]
      if (w == "") continue
      if (argc == 0 && w ~ /^[A-Za-z_][A-Za-z0-9_]*=/) {
        if (w == "HARNESS_SKIP_MERGE_CONFIRM=1") bypass = 1
        continue
      }
      argc++
      argv[argc] = w
    }

    if (argc == 0) {
      print class, bypass, push_flag_all, push_args
      exit 0
    }

    a0 = argv[1]

    if (a0 ~ /(^|\/)git-pr-merge\.sh$/) {
      class = "wrapper"
    } else if (a0 == "gh" && argc >= 3 && argv[2] == "pr" && argv[3] == "merge") {
      class = "raw_gh_pr_merge"
    } else if (a0 == "git") {
      # Consume git global options: single-letter opts that take a value
      # (`-C dir`, `-c key=val`) and `--git-dir=…`-style long opts. The value
      # can be attached (`-Cdir`) or separate (`-C dir`).
      k = 2
      while (k <= argc) {
        t = argv[k]
        if (t == "-C" || t == "-c") {
          # Value in next token unless already attached.
          k += 2
          continue
        }
        if (t ~ /^-C./ || t ~ /^-c./) {
          k += 1
          continue
        }
        if (t ~ /^--(git-dir|work-tree|namespace|exec-path|list-cmds|glob-pathspecs|no-glob-pathspecs|literal-pathspecs|icase-pathspecs|bare|no-replace-objects|no-optional-locks|config-env)(=|$)/) {
          # Long option with optional value. If value is in next token
          # (no `=`), consume it too. We do not need to distinguish boolean
          # from value-taking here — being permissive over-consumes at worst,
          # but all of these sit before the subcommand so nothing is lost.
          if (t ~ /=/) k += 1
          else k += 2
          continue
        }
        if (t == "--paginate" || t == "--no-pager" || t == "--no-replace-objects") {
          k += 1
          continue
        }
        break
      }
      subcmd = (k <= argc) ? argv[k] : ""

      if (subcmd == "push") {
        class = "raw_git_push"
        for (i = k + 1; i <= argc; i++) {
          t = argv[i]
          if (t == "--all" || t == "--mirror") push_flag_all = 1
          if (i > k + 1) push_args = push_args " "
          push_args = push_args t
        }
      }
    }

    print class, bypass, push_flag_all, push_args
  }
')

# Tab-delimited so PUSH_ARGS (which can contain spaces) round-trips intact.
IFS=$'\t' read -r CLASS BYPASS PUSH_FLAG_ALL PUSH_ARGS <<<"$CLASSIFY"

# ---- Class: wrapper (existing behavior) ----
if [[ "$CLASS" == "wrapper" ]]; then
  # Command-line bypass or process-level env var (e.g. CI export). Strict
  # literal "1" — not "true" / "yes" / "TRUE" — to keep the confirmation
  # surface unambiguous.
  [[ "$BYPASS" == "1" ]] && exit 0
  [[ "${HARNESS_SKIP_MERGE_CONFIRM:-0}" == "1" ]] && exit 0

  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Merge to the integration branch is blocked by default (deny outranks Bash allow-list). Required flow: (1) invoke AskUserQuestion in Korean — question \"PR #<N>을 development 브랜치에 머지할까요?\", options \"머지 진행\" / \"PR 수정 필요\" / \"머지 보류\"; (2) ONLY if the user picked \"머지 진행\", retry this command prefixed with HARNESS_SKIP_MERGE_CONFIRM=1 (strict — only the literal string `1` bypasses), e.g. `HARNESS_SKIP_MERGE_CONFIRM=1 .claude/hooks/git-pr-merge.sh --pr <N>`. Do NOT set this variable without an explicit user answer — it exists so a human confirmation is always recorded in the transcript."
    }
  }'
  exit 0
fi

# ---- Class: raw gh pr merge (never bypassable from here) ----
if [[ "$CLASS" == "raw_gh_pr_merge" ]]; then
  jq -n '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: "Raw `gh pr merge` bypasses the harness post-merge flow: the linked GitHub issue is not explicitly closed (auto-close only fires on the default branch), and pipeline-state.json / hook-state.json / ownership.json are not reset — stale state (plan_approved=true, previous branch/issue) then leaks into the next task and misleads the ABAC and pipeline-guardian hooks. Use the wrapper instead: `.claude/hooks/git-pr-merge.sh --pr <N> [--issue <M>]` (after AskUserQuestion confirmation, prefix with HARNESS_SKIP_MERGE_CONFIRM=1). The wrapper performs the squash merge, closes the issue, syncs local branches, deletes the feature branch, and resets all state files in one atomic step."
    }
  }'
  exit 0
fi

# ---- Class: raw git push ----
if [[ "$CLASS" == "raw_git_push" ]]; then
  blocked=0

  # Case A: --all or --mirror pushes every matching local ref, which will
  # include any locally-existing protected branch. Deny unconditionally.
  if [[ "$PUSH_FLAG_ALL" == "1" ]]; then
    blocked=1
  else
    # Case B: inspect refspec tokens for a protected destination. Accepts:
    #   <branch>            — plain name
    #   <src>:<dst>         — dst is what matters
    #   HEAD:<dst>          — same
    #   refs/heads/<branch> — stripped
    #   <remote>/<branch>   — rare but stripped via last-segment
    # Remote name itself (origin, upstream, …) is skipped via the flag check
    # and the config_is_protected_branch lookup (origin won't match).
    for tok in $PUSH_ARGS; do
      [[ "$tok" == -* ]] && continue
      dst="${tok##*:}"
      dst="${dst#refs/heads/}"
      dst="${dst##*/}"
      if config_is_protected_branch "$dst"; then
        blocked=1
        break
      fi
    done
  fi

  if [[ "$blocked" == "1" ]]; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Direct `git push` to a protected branch (main / development) bypasses the PR-only workflow declared in CLAUDE.md. `--all` / `--mirror` are also denied because they implicitly push every matching local ref including protected branches. Integration branches receive commits only via squash-merged PRs. If you need to push harness-state changes after a merge, use `.claude/hooks/git-pr-merge.sh` — it handles the reset commit + push itself. To open a PR instead, push this work to a feature branch and run `.claude/hooks/git-pr-create.sh`."
      }
    }'
    exit 0
  fi
fi

exit 0
