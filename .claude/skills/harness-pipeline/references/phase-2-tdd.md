# Phase 2: TDD (after user approval)

> **Pipeline State → `tdd`**: Update `pipeline-state.json` — set `current_phase: "tdd"`, carry forward `mode`/`branch`/`plan_approved`/`github_mode`/`issue_number`/`ui_involved`. Canonical template lives in [SKILL.md §Pipeline State Management](../SKILL.md#pipeline-state-management). The ABAC source-code block is lifted automatically once `current_phase` ≠ `plan`/`discovery`.

> **Note**: Git branch setup (Steps 5a-5b) was already completed in Phase 1. All work below happens on the feature branch.

> **Failure Recovery**: The pipeline-guardian Stop hook automatically guards Green phase completion.
> If you attempt to stop before committing a `✨ feat:` commit, the hook will block and provide retry context.
> Retries: `FAILURE_RECOVERY_MAX_RETRIES` env (default: 20). Tracked per-session for Team Mode safety.

## Sequential Mode (1-5 files)

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 8 | Run `unit-test-writer` sub-agent → **verify tests FAIL** (Red Phase). **NEVER analyze patterns or write test code yourself — always delegate to the `unit-test-writer` subagent.** | `Agent(subagent_type="unit-test-writer")` |
| 9 | Implement code to pass tests → run the project's test command (see CLAUDE.md Commands) → **verify ALL pass** (Green Phase) | — (main agent) |

### Design Application (Conditional — after Green phase)

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 9-ui | **Design Application** (if `ui_involved`): Read `ui_involved` from `pipeline-state.json`. If `true`, spawn `ux-design-lead` sub-agent with prompt: "Apply design system to the implemented Presentation layer components on this branch. Bootstrap design system if `docs/design-system/` doesn't exist. Apply design tokens, responsive behavior, accessibility, and interaction states to all new/modified Presentation layer files. Do NOT change component behavior or break existing tests." | `Agent(subagent_type="ux-design-lead")` |
| 9-ui-v | **Verify**: Run project test command — all existing tests must still pass after design application. If tests fail, the design changes broke behavior — fix or revert. | — (main agent) |
| 9-ui-c | **Commit**: `🎨 style: apply design system to {component names}` | — (main agent) |

> Skip Steps 9-ui through 9-ui-c entirely if `ui_involved` is `false`.

**CA Implementation Order (Inside-Out)**: When implementing in Step 9, follow the layer order Domain → Application → Infrastructure → Presentation. Layer responsibilities, dependency direction, and TDD-exemption rules live in a single shared source — see [`ca-rules`](../../ca-rules/SKILL.md).

### Library Documentation Lookup (Step 9)

When implementing with external library APIs, verify correctness via context7 MCP:

**Lookup** (`resolve-library-id` → `query-docs`):
- First use of an external library API in this implementation session
- Version-sensitive features (check `package.json` for installed version)
- Test failure suggesting wrong API usage (e.g., "X is not a function", deprecated warnings)

**Skip**:
- Language built-ins (TypeScript, Node.js core modules)
- Already verified libraries in current session
- Internal project modules, type-only imports

**Auto-verify (no human wait needed)**:
- After Step 8: If tests pass immediately → review test logic, likely not testing correctly
- After Step 9: If any test fails → fix implementation before proceeding

## Team Mode (6+ files)

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 8 | Spawn teammates with detailed prompts (see Spawn Template below) | `TeamCreate` |
| 8a | **Ownership registration**: Run `cat ~/.claude/teams/{team-name}/config.json` → verify `members[].agentId` and `members[].name` mapping | — |
| 8b | **Write `.claude/runtime/ownership.json`**: Record each teammate's name → `{files}` mapping (see Pipeline State Management in SKILL.md) | — |
| 9 | Use **Delegate Mode** (Shift+Tab) — do NOT implement yourself | — |
| 10 | Monitor teammate progress, unblock as needed | — |
| 10-ui | **Design Application** (if `ui_involved`): After all teammates complete, spawn `ux-design-lead` sub-agent to apply design system across all new Presentation layer files. Same rules as Sequential Step 9-ui — do NOT break existing tests. | `Agent(subagent_type="ux-design-lead")` |
| 10-ui-v | **Verify**: Run project test command — all tests must pass after design application. | — (lead) |
| 10-ui-c | **Commit**: `🎨 style: apply design system` | — (lead) |

> Skip Steps 10-ui through 10-ui-c entirely if `ui_involved` is `false`.

> All teammates work on the **same feature branch**.
> Each teammate internally spawns `unit-test-writer` for Red phase.

### Spawn Template

> **IMPORTANT**: When composing the spawn prompt for each teammate, you MUST include the full content
> of the Teammate Protocol section from `references/team-protocol.md` verbatim in the teammate's prompt.

```
Create an agent team with N teammates:
1. "{name}" — {Include full Teammate Protocol section}. Own files: {file-list}. Task: {task-description}.
2. "{name}" — {Include full Teammate Protocol section}. Own files: {file-list}. Task: {task-description}.
Use Opus for all teammates. Require plan approval.
```

**Commit**: Per [workflow-commits.md](../../git/references/workflow-commits.md) — Red/Green phase
