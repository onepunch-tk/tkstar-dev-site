# Phase 3: Review

> **Pipeline State → `review`**: Update `pipeline-state.json` — set `current_phase: "review"`, initialize `review_unresolved_count: 0` and `design_review_unresolved_count: 0`, carry forward other fields. Canonical template lives in [SKILL.md §Pipeline State Management](../SKILL.md#pipeline-state-management).

## Sequential Mode

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 10 | Run `code-reviewer` sub-agent (unified: quality + security + performance). The sub-agent returns a tool-result summary containing `issue_count` and `findings` — no file is written. | `Agent(subagent_type="code-reviewer")` |
| 10-ui | **Design Review** (if `ui_involved`): Read `ui_involved` from `pipeline-state.json`. If `true`, spawn `ux-design-lead` sub-agent for design review. Returns a tool-result summary with `issue_count` and `findings` — no file. | `Agent(subagent_type="ux-design-lead")` |
| 11 | Set the unresolved counters from sub-agent summaries (see Report Update Protocol), fix ALL issues, decrementing each counter as you go. | — (main agent) |

## Team Mode

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 11 | Run the project's test command to verify integration | — (lead) |
| 12 | Run `code-reviewer` sub-agent on all changed files | `Agent(subagent_type="code-reviewer")` |
| 12-ui | **Design Review** (if `ui_involved`): Same as Sequential Step 10-ui. | `Agent(subagent_type="ux-design-lead")` |
| 13 | Run `e2e-tester` sub-agent to validate user flows | `Agent(subagent_type="e2e-tester")` |
| 14 | Set the unresolved counters from sub-agent summaries, fix ALL issues, decrementing each counter as you go. | — (lead) |

> **Why lead calls directly**: Lead is the integration reviewer across multiple teammates' work. Direct invocation gives better control over the review scope.

## Report Update Protocol

The main agent uses **state flag counters** in `pipeline-state.json` as the gate signal. The integer counters are persisted on disk so progress survives across turns and sub-agent boundaries; `phase-gate.sh` reads only the counters.

### 1. Initialize counter from sub-agent summary

After `code-reviewer` (or `ux-design-lead`) returns, parse `issue_count` from its tool-result summary and write it to state:

```bash
# Code review
ISSUE_COUNT=<from sub-agent summary>
jq --argjson n "$ISSUE_COUNT" '.review_unresolved_count = $n | .updated_at = (now | todateiso8601)' \
   .claude/runtime/pipeline-state.json > /tmp/_state && mv /tmp/_state .claude/runtime/pipeline-state.json

# Design review (only if ui_involved)
DESIGN_ISSUE_COUNT=<from sub-agent summary>
jq --argjson n "$DESIGN_ISSUE_COUNT" '.design_review_unresolved_count = $n | .updated_at = (now | todateiso8601)' \
   .claude/runtime/pipeline-state.json > /tmp/_state && mv /tmp/_state .claude/runtime/pipeline-state.json
```

### 2. Decrement after each fix

After each issue is resolved (and committed if it was a code change):

```bash
jq '.review_unresolved_count = (.review_unresolved_count - 1) | .updated_at = (now | todateiso8601)' \
   .claude/runtime/pipeline-state.json > /tmp/_state && mv /tmp/_state .claude/runtime/pipeline-state.json
```

(Use `.design_review_unresolved_count` for design issues.) The counter itself is the only checklist — the file persists on disk, so progress survives.

### 3. Phase 4 transition

When both counters are 0, the `phase-gate.sh` hook allows the `review → validate` transition. If you attempt the transition with a counter > 0:

```
Phase Gate BLOCKED [review → validate]: code-review has N unresolved issue(s).
```

This is the **only** enforcement point — no more file scanning, no more "MANDATORY commit the report" ceremony, no more Gate 2 commit reminders.

## Context Tip (End of Phase 3)

The state-flag counters (`review_unresolved_count`, `design_review_unresolved_count`) in `pipeline-state.json` are the source of truth for Phase 4 readiness. Before continuing, follow-up items out of this PR's scope must be captured in a task file or a new Issue, and E2E focus areas must be recorded.
