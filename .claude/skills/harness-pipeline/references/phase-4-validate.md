# Phase 4: Validate & Finalize

> **Pipeline State → `validate`**: Update before Phase 4 starts:
> ```bash
> cat > .claude/pipeline-state.json << EOF
> {
>   "current_phase": "validate",
>   "mode": "$(jq -r .mode .claude/pipeline-state.json)",
>   "branch": "$(git branch --show-current)",
>   "github_mode": $(jq -r .github_mode .claude/pipeline-state.json),
>   "issue_number": $(jq -r .issue_number .claude/pipeline-state.json),
>   "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
> }
> EOF
> ```

## Sequential Mode

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 12 | Run `e2e-tester` sub-agent | `Agent(subagent_type="e2e-tester")` |
| 13 | Fix bugs discovered in E2E (skip if all pass) | — (main agent) |
| 14 | **Doc Sync (strict order, each blocks the next)** — see Doc Sync Protocol below | `Agent(subagent_type="development-planner" \| "project-structure-analyzer" \| "prd-generator")` |
| 15 | Commit docs updates as a single `📝 docs: sync` commit | — (main agent) |
| 15a | **Create PR** — agent composes title/body and invokes `git-pr-create.sh`. Script pushes the branch and opens the PR, then exits with the PR URL. Do NOT call any merge script yet. | — (main agent) |
| 15b | **User confirmation** — agent calls `AskUserQuestion` with the prompt "PR #N을 development 브랜치에 머지할까요?" and options "머지 진행" / "PR 수정 필요" / "머지 보류" | — (main agent) |
| 15c | Branch on the answer: "머지 진행" → proceed to 16. "PR 수정 필요" → revise via `gh pr edit` and loop back to 15b. "머지 보류" → pause the pipeline; user resumes later. | — (main agent) |
| 16 | **Merge to development** — see GitHub/Local Mode below | — (main agent) |
| 17 | **Pipeline State → `complete`**: `git-pr-merge.sh` resets state automatically; Local Mode resets manually | — |

### Doc Sync Protocol (Step 14) — STRICT ORDER

> **Invariant**: ROADMAP is the source of truth. Downstream docs are derivatives.
> Execute substeps sequentially; each depends on the previous being accurate.
> The `docs-sync-gate.sh` PreToolUse hook will block `gh pr create` / `git-pr-create.sh` if
> Step 14a is missing from the branch commits on a `feature/*` branch.

| Substep | Target | Trigger | Action |
|---------|--------|---------|--------|
| **14a** | `docs/ROADMAP.md` | Always | Run `development-planner` — mark completed tasks, add `**Must** Read:` link to the current task. |
| **14b** | `tasks/XXX-*.md` | Always (when ROADMAP `[x]` checked in 14a) | (1) Update `**Status**` field to `✅ Done` (required), (2) Replace the `feature/issue-N-…` placeholder in the Branch field with the actual Issue number, (3) Only when the task file is touched on the branch: check step boxes and append a Change History row. **Enforcement**: `docs-sync-gate.sh` Condition 4 invokes `.claude/tools/check-task-status-sync.mjs` to detect ROADMAP `[x]` ↔ task `Status` drift and blocks PR creation on mismatch. |
| **14c** | `docs/PROJECT-STRUCTURE.md` | Always | 1. Run `bash .claude/tools/doc-structure-linter.sh --human`. 2. Review the NEW / GHOST / OK categories and their severity tags. 3. Route each item: (a) task-completion drift → `project-structure-analyzer` to reflect; (b) intentional future work → add to Target structure; (c) orphan → delete on disk or document as "reference-only". 4. Include the updates in the docs commit. |
| **14d** | `CLAUDE.md` | `package.json` / `tsconfig*` / `biome.json(c)` changes on branch | Review for config / dependency drift (commands table, tech-stack entries, tooling sections). |

> Skip 14b/14d whose trigger did not fire. Do NOT skip 14a or 14c.

> **Rationale for order**: ROADMAP defines what "done" means; the linter catches PROJECT-STRUCTURE drift from reality; CLAUDE.md pins the commands / stack contract that agents rely on. Project-specific derived artifacts (e.g. E2E flow files, design-system references, PRD) are owned by their respective feature tasks — they're not cross-cutting checkpoints.

### Step 15a–16: Split PR Flow

Read `github_mode` from `pipeline-state.json` to determine merge method.

#### GitHub Mode (`github_mode: true`)

The PR workflow is deliberately split into **create**, **user confirmation**, and **merge** so that no PR reaches `development` without explicit user sign-off. The `pre-merge-ask.sh` PreToolUse hook enforces the same gate via `permissionDecision: "ask"` as a second defense layer.

Step 15a — create only:

```bash
ISSUE_NUMBER=$(jq -r '.issue_number // empty' .claude/pipeline-state.json)

# Agent composes PR title/body, then invokes the CREATE script. The script
# pushes the branch and opens the PR, then prints the PR URL and exits.
# It does NOT merge.
.claude/hooks/git-pr-create.sh \
  --title "<emoji> <type>: <description>" \
  --body "## Summary
<change summary>

## Changes
<changed file list>

## Test Results
<test results>" \
  --issue "$ISSUE_NUMBER"
```

Step 15b — user confirmation via `AskUserQuestion`:

```text
question: "PR #N을 development 브랜치에 머지할까요?"
options:
  - "머지 진행"
  - "PR 수정 필요"
  - "머지 보류"
```

Step 15c — branch on the answer:

- "머지 진행" → run Step 16.
- "PR 수정 필요" → update the PR via `gh pr edit` and loop back to 15b after the edit lands on origin.
- "머지 보류" → pause the pipeline. The next session resumes from 15b without re-running 15a.

Step 16 — merge only, invoked only after the user chose "머지 진행". The merge command **must** be prefixed with `HARNESS_SKIP_MERGE_CONFIRM=1` because the `pre-merge-ask.sh` PreToolUse hook denies un-prefixed invocations by default (the deny outranks the global `Bash(*)` allow-list, so it is the real gate). Only set this env var after a confirmed user answer:

```bash
PR_NUMBER=<from Step 15a output>

HARNESS_SKIP_MERGE_CONFIRM=1 .claude/hooks/git-pr-merge.sh --pr "$PR_NUMBER" --issue "$ISSUE_NUMBER"
```

The merge script calls `gh pr merge --squash --delete-branch`, closes the linked issue, checks out `development`, pulls, deletes the local feature branch, and resets `pipeline-state.json` / `hook-state.json` / `ownership.json`.

> If the agent runs the command without the prefix, `pre-merge-ask` returns `permissionDecision: "deny"` with a reason describing the required Korean `AskUserQuestion` flow. Do NOT set the env var unilaterally — its presence in the transcript is the audit trail for the user's explicit confirmation.

#### Local Mode (`github_mode: false`)

Local mode mirrors the split: require explicit user confirmation via `AskUserQuestion` before touching `development`.

Step 15a (Local) — pause and ask:

```text
question: "로컬 development 브랜치에 병합할까요?"
options:
  - "머지 진행"
  - "커밋 수정 필요"
  - "머지 보류"
```

Only when the user selects "머지 진행" do the commands below run. On "커밋 수정 필요" the agent updates the feature branch and re-asks; on "머지 보류" the pipeline pauses.

Step 16 (Local) — merge commands (run only after confirmation):

```bash
FEATURE_BRANCH=$(git branch --show-current)

# Checkout and update development
git checkout development
git pull origin development 2>/dev/null || true

# Merge with merge commit
git merge --no-ff "$FEATURE_BRANCH" -m "🔀 merge: $FEATURE_BRANCH → development

- <change summary>"

# Push development
git push origin development

# Delete feature branch
git branch -d "$FEATURE_BRANCH"

# Reset pipeline state (Local Mode must do this manually — GitHub Mode is handled by git-pr-merge.sh)
cat > .claude/pipeline-state.json << EOF
{
  "current_phase": "none",
  "mode": "none",
  "branch": "development",
  "plan_approved": false,
  "github_mode": false,
  "issue_number": null,
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
echo '{"last_reminded_phase":"","doc_reminders_sent":{},"workflow_warnings_sent":{},"cooldown_until":""}' > .claude/hook-state.json
```

## Team Mode

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 15 | Fix integration issues found in Phase 3 | — (lead) |
| 16 | **Doc Sync (strict order)** — same protocol as Sequential Step 14 (substeps 16a–16d) | `Agent(...)` |
| 17 | Commit docs updates as a single `📝 docs: sync` commit | — (lead) |
| 18 | **Merge to development** — same GitHub/Local Mode logic as Sequential Step 16 | — (lead) |
| 19 | **Cleanup**: Reset `ownership.json`, `pipeline-state.json`, `hook-state.json` to defaults (Team session ended) | — |

> Team Mode substeps 16a–16d mirror Sequential Step 14's Doc Sync Protocol above.

**Commit**: Per [workflow-commits.md](../../git/references/workflow-commits.md) — E2E fix phase (if needed)

## Context Tip (End of Phase 4 — task complete)

PR title/body is derivable from `git log`/`git diff`, ROADMAP/task
updates are file-based, and the merge is performed by
`.claude/hooks/git-pr-merge.sh`. No automatic advisory fires at this
boundary; the `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE` env (set in
`.claude/settings.json`, when present) handles overflow.

After the PR is merged and the state is reset, running `/clear` is the
right call before starting an unrelated new task — task outcomes are
persisted in the merged PR, the closed GitHub Issue, and the
ROADMAP/task-file updates. See SKILL.md `## Context Management` for the
persistence rule.
