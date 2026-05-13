# Git PR

Create PR + merge + cleanup. **GitHub Mode only** — requires `Remote Platform: GitHub` in CLAUDE.md.

## Language Rule

> **PR title and body MUST be written in the user's language** (detected from conversation context).
> Template section headers (Summary, Changes, etc.) remain in English for consistency.

## Agent Role (intelligence)

1. Compose PR title: Conventional Commits format **in user's language**
   - e.g., `✨ feat: 로그인 기능 구현 (#42)` (Korean user)
   - e.g., `✨ feat: implement login (#42)` (English user)
2. Fill in the template below (**content in user's language**, headers in English)
3. Retrieve issue number: from `pipeline-state.json` `issue_number` or branch name

## PR Body Template (MUST follow)

```markdown
## Summary
{1-line change summary}

## Changes
| File | Description |
|------|-------------|
| `file1.ts` | {what changed} |
| `file2.ts` | {what changed} |

## Test Results
- Total: {N} tests, {N} passed
- Coverage: {if available}

## Review
- Issues found: {N}, Issues fixed: {N}

---
Related: #{issue_number}
```

## Execution (delegate to scripts — two stages)

The PR flow is **split** so the merge is always gated on an explicit user confirmation. Stage 1 only opens the PR; the agent then asks the user via `AskUserQuestion`, and only on approval invokes Stage 2 with `HARNESS_SKIP_MERGE_CONFIRM=1`.

```bash
# Stage 1 — push + open PR (--base development is pinned automatically).
# pre-pr-base-guard denies any direct gh pr create not targeting development;
# this wrapper is the only sanctioned path.
.claude/hooks/pr/git-pr-create.sh \
  --title "<emoji> <type>: <description in user's language>" \
  --body "<body following template above>" \
  --issue <issue_number>

# Stage 2 — squash-merge + cleanup. pre-merge-ask denies the wrapper without
# the env prefix; only set the prefix after a confirmed user "머지 진행" answer.
HARNESS_SKIP_MERGE_CONFIRM=1 .claude/hooks/pr/git-pr-merge.sh \
  --pr <pr_number> --issue <issue_number>
```

Stage 2 handles automatically: squash-merge, branch deletion, issue close, integration checkout, pull, runtime state reset (`pipeline-state.json` / `hook-state.json` / `ownership.json`).

## Base Branch Freshness Policy

Before PR creation, `git-pr-create.sh` performs a non-blocking base freshness check:

```bash
git fetch origin development
git merge-base HEAD origin/development
```

- If feature branch merge-base is behind `origin/development`, the script **warns** (not blocks).
- Recommendation: rebase onto latest `origin/development` before PR:
  ```bash
  git fetch origin && git rebase origin/development
  ```
- Hard enforcement (abort on stale base) happens only at **Phase 1 entry** of harness-pipeline; PR time is warning-only to avoid blocking when the agent is mid-workflow.

## Cautions

- Uncommitted changes must be committed first
- Cannot run from main/development branch
- On conflict, script returns error — guide user to resolve manually
- Base freshness warnings do not block — rebase recommended but not enforced here
