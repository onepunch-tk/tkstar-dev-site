# Phase 3: Review

> **Pipeline State → `review`**: Update before Phase 3 starts:
> ```bash
> cat > .claude/pipeline-state.json << EOF
> {
>   "current_phase": "review",
>   "mode": "$(jq -r .mode .claude/pipeline-state.json)",
>   "branch": "$(git branch --show-current)",
>   "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
> }
> EOF
> ```

**Pre-step**: Ensure report directory exists: `mkdir -p docs/reports/code-review`

## Sequential Mode

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 10 | Run `code-reviewer` sub-agent (unified: quality + security + performance) | `Agent(subagent_type="code-reviewer")` |
| 10-ui | **Design Review** (if `ui_involved`): Read `ui_involved` from `pipeline-state.json`. If `true`, ensure report directory exists (`mkdir -p docs/reports/design-review`), then spawn `ux-design-lead` sub-agent for design review. Agent runs 8-point design review checklist against all changed Presentation layer files. Produces report at `docs/reports/design-review/{commit_hash}_{YYYYMMDD}.md`. | `Agent(subagent_type="ux-design-lead")` |
| 11 | Read reports in `/docs/reports/code-review/` **and** `/docs/reports/design-review/` (if exists) → fix ALL issues, then **update both reports** (see Report Update Protocol below) | — (main agent) |

## Team Mode

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 11 | Run the project's test command to verify integration | — (lead) |
| 12 | Run `code-reviewer` sub-agent on all changed files | `Agent(subagent_type="code-reviewer")` |
| 12-ui | **Design Review** (if `ui_involved`): Same as Sequential Step 10-ui — ensure `mkdir -p docs/reports/design-review`, spawn `ux-design-lead` for design review of all changed Presentation layer files. | `Agent(subagent_type="ux-design-lead")` |
| 13 | Run `e2e-tester` sub-agent to validate user flows | `Agent(subagent_type="e2e-tester")` |
| 14 | Read reports in `/docs/reports/code-review/` **and** `/docs/reports/design-review/` (if exists) → fix ALL issues, then **update both reports** (see Report Update Protocol below) | — (lead) |

> **Why lead calls directly**: Lead is the integration reviewer across multiple teammates' work. Direct invocation gives better control over the review scope.

## Report Update Protocol

After fixing each issue in the code-review report, you **MUST** update the report file:

1. **Check off each resolved issue**: Change `- [ ]` to `- [x]` for the fixed item
2. **After ALL issues are resolved**: Change the report header `**Status**: Pending` to `**Status**: Complete`
3. **The `pipeline-guardian` hook will BLOCK Phase 4 entry** if:
   - Any `- [ ]` unchecked items remain in the report
   - Report `Status` is not `Complete`

> **Design Review Report**: If `ui_involved` is `true`, the design-review report in `/docs/reports/design-review/` follows the same protocol. The `pipeline-guardian` hook blocks Phase 4 if **either** code-review or design-review report has unchecked items or incomplete status.

**Example**:
```markdown
# Before fix
**Status**: Pending
- [ ] #1 [Critical] Remove vitest import

# After fix
**Status**: Complete
- [x] #1 [Critical] Remove vitest import
```

**Commit**: Per [workflow-commits.md](../../git/references/workflow-commits.md) — Review phase

## Context Tip (End of Phase 3)

Review reports are persisted as files; Phase 4 work (E2E + doc-sync) is
file-based. No automatic advisory fires at this boundary;
`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` handles overflow. Before continuing,
verify the persistence rule in SKILL.md `## Context Management` —
follow-up items out of this PR's scope must be captured in a task file or
a new Issue, and E2E focus areas must be recorded.
