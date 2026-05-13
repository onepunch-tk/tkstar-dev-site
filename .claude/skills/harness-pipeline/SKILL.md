---
name: harness-pipeline
description: |
  Unified development pipeline for all implementation tasks.
  Clean Architecture is the default — file placement follows CA layer templates.
  Auto-detects execution mode (Sequential or Team) based on task scope.
  Covers single-file fixes through cross-cutting multi-agent parallel work.
  Do NOT use for research, documentation-only, or planning-only tasks.
---

# Harness Pipeline

> **🚫 CRITICAL — PLAN APPROVAL CANNOT BE BYPASSED**
>
> When invoked, this pipeline MUST run Phase 1 (Plan) and receive `ExitPlanMode`
> approval from the user BEFORE any source-code edit. The `abac-phase-policy`
> hook hard-blocks `Edit`/`Write` on source files until `pipeline-state.json`
> records `plan_approved: true`. Do NOT attempt to set `plan_approved: true`
> without actually presenting a plan to the user via `ExitPlanMode`. Do NOT
> skip the harness-pipeline skill just because a task seems small.
>
> When merging a PR to the integration branch at Phase 4, the flow MUST split
> into two scripts — `git-pr-create.sh` then a user-confirmed `git-pr-merge.sh`.
> Auto-merging without explicit user sign-off is forbidden.

Unified development pipeline. Follow these steps **sequentially**. Each step MUST complete before proceeding.

**Architecture**: Clean Architecture (4-layer) is the default for all projects. Dependency rules, layer responsibilities, and TDD scope per layer live in the shared reference skill — see [`.claude/skills/ca-rules/SKILL.md`](../ca-rules/SKILL.md).

**Framework & monorepo detection**: Delegated to shared reference skills — see [`.claude/skills/framework-detection/SKILL.md`](../framework-detection/SKILL.md) and [`.claude/skills/monorepo-detection/SKILL.md`](../monorepo-detection/SKILL.md).

---

## Mode Detection (Auto-Detect)

After Phase 1 planning, auto-detect execution mode based on task scope. The user can override explicitly ("use sequential mode" / "use team mode").

| Criteria | Mode | Description |
|----------|------|-------------|
| 1-5 files, 1-2 features | **Sequential** | Main agent handles all phases directly |
| 6+ files, 3+ features | **Team** | Lead + teammate agents via TeamCreate |

---

## Pipeline State Management

The harness enforces Access Control via two state files.

### `.claude/runtime/pipeline-state.json`

Updated at each Phase transition. The ABAC hook reads this to block source code modifications during plan phase.

**Format:**
```json
{
  "current_phase": "plan",
  "mode": "sequential",
  "branch": "feature/xxx",
  "plan_approved": false,
  "github_mode": true,
  "issue_number": null,
  "ui_involved": false,
  "updated_at": "2026-04-08T10:00:00Z"
}
```

- **`github_mode`**: `true` if `Remote Platform: GitHub` is set in CLAUDE.md, `false` otherwise. Determines whether Issue/PR operations are available.
- **`issue_number`**: GitHub Issue number (GitHub Mode only). Set during Phase 1 Issue creation. Used for PR `Closes #N` linking.
- **`ui_involved`**: `true` if the plan's file list includes Presentation layer files or task description contains UI keywords. Set during Phase 1 Step 4-ui. Read by Phase 2 and Phase 3 to conditionally invoke `ux-design-lead`.

**Phase order:** `none` → `discovery` → `plan` → `tdd` → `review` → `validate` → `complete`

> **`discovery` phase**: set when Phase 0 (interview) starts. Shares the
> ABAC semantics of `plan` — source code edits remain hard-blocked. Cleared
> only when Phase 0's user-confirmation gate passes and the agent advances
> to `plan`.

> **`plan_approved`**: Flipped to `true` automatically by the `post-plan-approval.sh` PostToolUse:ExitPlanMode hook once the user approves a plan via `ExitPlanMode`. The `pipeline-guardian` hook still blocks the plan→tdd transition while `plan_approved` is `false`.
>
> **Do NOT attempt to manually write `plan_approved: true` from the agent.** A system-level safety filter blocks that pattern to prevent agents from skipping plan mode. The hook is the only sanctioned path — it runs in the Claude Code runtime, not the agent context, and cannot fire without a real `ExitPlanMode` approval event.

**Update command (run at each Phase transition — `plan_approved` is excluded, its hook owns it):**
```bash
cat > .claude/runtime/pipeline-state.json << EOF
{
  "current_phase": "PHASE",
  "mode": "MODE",
  "branch": "$(git branch --show-current)",
  "plan_approved": PLAN_APPROVED,
  "github_mode": GITHUB_MODE,
  "issue_number": ISSUE_NUMBER,
  "ui_involved": UI_INVOLVED,
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```
*For phase transitions other than plan approval, `PLAN_APPROVED` should carry forward the current value (read with `jq -r '.plan_approved' .claude/runtime/pipeline-state.json`).*

### `.claude/runtime/ownership.json` (Team Mode only)

Written by lead after TeamCreate. The ReBAC hook checks per-teammate file ownership.

**Format (teammate_name as key — verified):**
```json
{
  "mode": "team",
  "branch": "feature/xxx",
  "created_at": "2026-04-08T10:00:00Z",
  "teammates": {
    "hero-builder":   { "files": ["src/presentation/components/HeroSection.tsx"] },
    "service-builder": { "files": ["src/presentation/components/ServiceSection.tsx"] }
  },
  "shared": ["src/presentation/routes.ts", "src/presentation/routes/index.ts"]
}
```

> **ReBAC scope (verified 2026-04-09)**: Team teammate PreToolUse stdin does NOT contain `agent_id`/`agent_type`.
> PreToolUse ReBAC blocking only works for **agents spawned via subagent_type**.
> Team teammate ownership violations are **detected post-hoc by the TeammateIdle hook**.

**When to write:** Immediately after TeamCreate. Use the same `name` parameter specified when spawning teammates.

**Cleanup:** Reset `ownership.json` to defaults after Phase 4 completion (do NOT delete).

---

## Phase Execution

Each phase has detailed steps in its reference file. **Read the reference for the current phase before starting.**

> **Phase 0 entry point**: when `/harness-pipeline` is first invoked, the main
> agent MUST call the `Skill` tool with skill name `interview-protocol` before
> issuing any `AskUserQuestion`. Reading `references/phase-0-discovery.md` is
> not a substitute — the 12 Core Rules that govern the entire discovery loop
> (Lenses Pool, hedge detection, false-pass guard, etc.) live inside the
> skill itself. Skipping this invocation degrades Phase 0 to ad-hoc
> questioning and breaks Rule #2 (Ambiguity Count = 0 + coverage confirmed).

| Phase | Reference | Key Actions |
|-------|-----------|-------------|
| **0. Discovery** | [references/phase-0-discovery.md](references/phase-0-discovery.md) | Invoke `Skill(interview-protocol)` first → enumerate ambiguities → AskUserQuestion loop until ambiguity = 0 → write Korean intent summary → user confirmation gate |
| **1. Plan** | [references/phase-1-plan.md](references/phase-1-plan.md) | Load docs, gh check, create Issue (GitHub Mode), create plan, detect mode, create branch + tasks |
| **2. TDD** | [references/phase-2-tdd.md](references/phase-2-tdd.md) | Red (unit-test-writer) → Green (implement) → Design apply (ux-design-lead, if UI) → commit |
| **3. Review** | [references/phase-3-review.md](references/phase-3-review.md) | code-reviewer + design-reviewer (ux-design-lead, if UI) → fix issues → commit |
| **4. Validate** | [references/phase-4-validate.md](references/phase-4-validate.md) | E2E test → docs update → PR create + merge (GitHub) or direct merge (Local) → cleanup |

**Team Protocol**: [references/team-protocol.md](references/team-protocol.md) — teammate execution steps, file ownership, communication, merge strategy

---

## Failure Recovery (Enforced by pipeline-guardian Stop Hook)

The pipeline-guardian Stop hook automatically guards TDD Green Phase completion.

**Detection**: Red phase commit (`✅ test:`) exists + Green phase commit (`✨ feat:`) missing → stop blocked
**Retries**: `FAILURE_RECOVERY_MAX_RETRIES` env variable (default: 20) — configurable in `.claude/settings.json`
**Reporting**: On final retry, agent is instructed to report the failure (failing tests / attempted approaches / blocking issues) to the main agent in its final assistant message — no file is written.
**Reset**: Retry counters auto-reset on phase transition (tdd → review)

### Sequential Mode
Agent stop blocked while Green phase incomplete. Up to 20 retries with increasing context about what to fix. On success (✨ feat: commit detected), stop is immediately allowed regardless of retry count.

### Team Mode
Each teammate's retries tracked independently per session. When max retries reached, teammate stops → TeammateIdle hook notifies lead. The teammate reports the failure summary directly to the lead via its final tool-result message — no file persistence.

---

## Hook Observability — `HARNESS_DEBUG=1`

Hooks silently `exit 0` on many early paths (wrong tool, phase mismatch, missing state file). Set `HARNESS_DEBUG=1` to turn every early exit into a `[hook] skip: <reason>` stderr line — useful when diagnosing "why didn't this hook fire?". No-op when unset.

Wired today: `abac-phase-policy.sh`. Other hooks opt in by sourcing `lib/harness-debug.sh` and calling `harness_debug <tag> <reason>` before each early exit.

---

## Mode Comparison

| Aspect | Sequential | Team |
|--------|------------|------|
| Context usage | All in main | Per teammate |
| Parallelization | None | Full parallel |
| Recovery | Manual | Autonomous + lead |

| Scenario | Recommended Mode |
|----------|------------------|
| Quick bug fix (1-2 files) | Sequential |
| New component (3-5 files) | Sequential |
| Feature with multiple components (6+) | Team |
| Cross-cutting refactor (10+ files) | Team |
| Exploration / research | Sequential (no workers) |
