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

**Architecture**: Clean Architecture (4-layer) is the default for all projects. Dependency rules, layer responsibilities, and TDD scope per layer live in the shared reference skill — see [`.claude/skills/shared/ca-rules/SKILL.md`](../shared/ca-rules/SKILL.md).

**Framework & monorepo detection**: Delegated to shared reference skills — see [`.claude/skills/shared/framework-detection/SKILL.md`](../shared/framework-detection/SKILL.md) and [`.claude/skills/shared/monorepo-detection/SKILL.md`](../shared/monorepo-detection/SKILL.md).

---

## Mode Detection (Auto-Detect)

After Phase 1 planning, auto-detect execution mode based on task scope:

| Criteria | Mode | Description |
|----------|------|-------------|
| 1-5 files, 1-2 features | **Sequential** | Main agent handles all phases directly |
| 6+ files, 3+ features | **Team** | Lead + teammate agents via TeamCreate |

```
Mode Detection Algorithm:
1. Count files to be modified from plan
2. Count distinct features/components
3. IF files <= 5 AND features <= 2:
     → Sequential Mode
   ELSE:
     → Team Mode (Lead + Teammates)
```

**User Override**: User can explicitly request mode: "use sequential mode" or "use team mode"

### Branch-type carve-out: `chore/*` and `docs/*`

`chore/*` and `docs/*` branches **skip Phase 1 (Plan) and Phase 2 (TDD)
entirely**. By convention these branches carry non-behavioral changes
(harness tooling, documentation, ROADMAP/task tweaks, chores) where a
Red/Green cycle has no honest Red state to assert — the work is editing
spec, not changing runtime behavior.

> **Phase 0 is NOT carved out.** The `chore/*` / `docs/*` carve-out applies
> only to Phase 1 (Plan) and Phase 2 (TDD). Phase 0 (Discovery) runs on
> every branch type — misreading user intent on a chore ("just bump the
> dep" vs. "bump the dep AND migrate the API surface") is exactly the
> failure mode Phase 0 exists to prevent.

What remains in force:

- **PR-only workflow**: every change still goes through `chore/{slug}`
  branch → PR → squash merge (CLAUDE.md §Git Integration).
- **PR review**: the only safety net on this path; keep the PR
  description explicit about what changed and why.
- **Runtime safeguards still apply**: `abac-phase-policy.sh` already
  permits `.claude/**`, `docs/**`, and `**/*.md` edits without
  `plan_approved`; `plan-enforcement.sh` detects these branch prefixes
  and suppresses its reminder.

`feature/*` and `fix/*` branches still follow the full 5-phase pipeline
— the carve-out is for non-behavioral tooling/doc work only.

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
  "tasks_created": false,
  "github_mode": true,
  "issue_number": null,
  "ui_involved": false,
  "updated_at": "2026-04-08T10:00:00Z"
}
```

- **`github_mode`**: `true` if `Remote Platform: GitHub` is set in CLAUDE.md, `false` otherwise. Determines whether Issue/PR operations are available.
- **`issue_number`**: GitHub Issue number (GitHub Mode only). Set during Phase 1 Issue creation. Used for PR `Closes #N` linking.
- **`ui_involved`**: `true` if the plan's file list includes Presentation layer files or task description contains UI keywords. Set during Phase 1 Step 4-ui. Read by Phase 2 and Phase 3 to conditionally invoke `ux-design-lead`.
- **`tasks_created`**: `false` after plan approval; flipped to `true` by the `post-task-created.sh` PostToolUse:TaskCreate hook on the first TaskCreate call in plan phase. The same hook delivers the plan→tdd `/compact` advisory verbatim via `additionalContext` (mirrored to stderr as a fallback) exactly once on that first flip — the `false → true` transition is the natural idempotency gate.

**Phase order:** `none` → `discovery` → `plan` → `tdd` → `review` → `validate` → `complete`

> **`discovery` phase**: set when Phase 0 (interview) starts. Shares the
> ABAC semantics of `plan` — source code edits remain hard-blocked. Cleared
> only when Phase 0's user-confirmation gate passes and the agent advances
> to `plan`.

> **`plan_approved`**: Flipped to `true` automatically by the `post-plan-approval.sh` PostToolUse hook immediately after `ExitPlanMode` approval. The `pipeline-guardian` hook blocks plan→tdd transition if this is `false`.
>
> **Do NOT attempt to manually write `plan_approved: true` from the agent.** A system-level safety filter blocks that pattern to prevent agents from skipping plan mode. The hook is the only sanctioned path — it runs in the Claude Code runtime, not the agent context, and cannot fire without a real `ExitPlanMode` approval event.
>
> **`tasks_created`**: Same hook-owned discipline. The agent does NOT write `tasks_created` directly — `post-plan-approval.sh` resets it to `false` on every approval, and `post-task-created.sh` flips it to `true` after the first `TaskCreate` call (idempotent on subsequent calls). The same flip delivers the `/compact` advisory verbatim via `additionalContext` (mirrored to stderr as a fallback) — there is no separate Stop hook for it.

**Update command (run at each Phase transition — `plan_approved` and `tasks_created` are excluded, the hooks own them):**
```bash
cat > .claude/runtime/pipeline-state.json << EOF
{
  "current_phase": "PHASE",
  "mode": "MODE",
  "branch": "$(git branch --show-current)",
  "plan_approved": PLAN_APPROVED,
  "tasks_created": TASKS_CREATED,
  "github_mode": GITHUB_MODE,
  "issue_number": ISSUE_NUMBER,
  "ui_involved": UI_INVOLVED,
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
```
*For phase transitions other than plan approval, both `PLAN_APPROVED` and `TASKS_CREATED` should carry forward the current values (read with `jq -r '.plan_approved' .claude/runtime/pipeline-state.json` and `jq -r '.tasks_created' .claude/runtime/pipeline-state.json`).*

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

| Phase | Reference | Key Actions |
|-------|-----------|-------------|
| **0. Discovery** | [references/phase-0-discovery.md](references/phase-0-discovery.md) | Load `interview-protocol` skill → enumerate ambiguities → AskUserQuestion loop until ambiguity = 0 → write Korean intent summary → user confirmation gate |
| **1. Plan** | [references/phase-1-plan.md](references/phase-1-plan.md) | Load docs, gh check, create Issue (GitHub Mode), create plan, detect mode, create branch + tasks |
| **2. TDD** | [references/phase-2-tdd.md](references/phase-2-tdd.md) | Red (unit-test-writer) → Green (implement) → Design apply (ux-design-lead, if UI) → commit |
| **3. Review** | [references/phase-3-review.md](references/phase-3-review.md) | code-reviewer + design-reviewer (ux-design-lead, if UI) → fix issues → commit |
| **4. Validate** | [references/phase-4-validate.md](references/phase-4-validate.md) | E2E test → docs update → PR create + merge (GitHub) or direct merge (Local) → cleanup |

> **Foreground-only sub-agents**: When spawning `prd-generator`,
> `prd-validator`, `development-planner`, `code-reviewer`,
> `ux-design-lead`, or `project-structure-analyzer`, **NEVER** set
> `run_in_background: true`. These agents load the `interview-protocol`
> skill and call `AskUserQuestion` (the latter on glossary missing-entry
> detection), which fails silently in background sub-agents — the
> result is unreviewed assumptions baked into the output.

**Team Protocol**: [references/team-protocol.md](references/team-protocol.md) — teammate execution steps, file ownership, communication, merge strategy

---

## Failure Recovery (Enforced by pipeline-guardian Stop Hook)

The pipeline-guardian Stop hook automatically guards TDD Green Phase completion.

**Detection**: Red phase commit (`✅ test:`) exists + Green phase commit (`✨ feat:`) missing → stop blocked
**Retries**: `FAILURE_RECOVERY_MAX_RETRIES` env variable (default: 20) — configurable in `.claude/settings.json`
**Reporting**: On final retry, agent is instructed to write failure report to `.claude/runtime/failures/` (gitignored runtime artifact)
**Reset**: Retry counters auto-reset on phase transition (tdd → review)

### Sequential Mode
Agent stop blocked while Green phase incomplete. Up to 20 retries with increasing context about what to fix. On success (✨ feat: commit detected), stop is immediately allowed regardless of retry count.

### Team Mode
Each teammate's retries tracked independently per session. When max retries reached, teammate stops → TeammateIdle hook notifies lead. Failure report written to `.claude/runtime/failures/{teammate-name}-{timestamp}.md`.

---

## Context Management

Operationalizes the **Context Engineering** principle (CLAUDE.md) for
pipeline execution. The principle is declared once in CLAUDE.md; this
section provides only pipeline-specific HOW — it never re-states the principle.

### Auto-compact handles overflow; one explicit advisory only at plan→tdd

`CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=75` (set in `.claude/settings.json` env)
automatically compacts the main conversation when it crosses 75% of the
window. Mid-pipeline context overflow is handled by that mechanism — the
harness does not emit per-phase `/clear` advisories.

The single exception is the **plan → tdd** boundary, which gets an
explicit `/compact` advisory (not `/clear`). Reason: tradeoff discussions
and user clarifications during plan mode often live only in the
conversation, and the plan file does not always capture 100%. `/compact`
preserves recent context with a focus prompt; `/clear` would discard it.

The advisory is emitted by `post-task-created.sh` (PostToolUse:TaskCreate)
on the first `TaskCreate` call after plan approval — i.e. AFTER the
upfront pipeline tasks exist, so the user retains full pipeline visibility
through the focus prompt. The natural `tasks_created==false → true`
transition is the idempotency gate (subsequent calls early-exit). Both
`/compact` and `/clear` stay user-initiated slash commands — agents cannot
invoke them programmatically.

### tdd→review, review→validate, validate→complete

No automatic advisory. Reviewer subagents run in their own context, and
validate phase work is file-based (E2E flow files, docs sync edits, PR
description from git log/diff, merge via `git-pr-merge.sh`). If the main
conversation grows large, auto-compact engages at 75%. If you prefer a
clean break between phases, run `/clear` manually — it is always
available.

### Persistence rule (always applies)

`/clear` and `/compact` both evict conversation context. Anything verbal
that never made it to a commit / TODO / task file / Issue is lost. Before
running either, ensure the following are recorded on disk:

- Skipped tests / deferred edge cases → `TODO` comment + task file
- Non-obvious Red→Green decisions → commit body (Why paragraph)
- Review or validate hand-off notes → task file or new Issue
- Ad-hoc user directives (scope trims, style preferences) → task file

Principle: **"A verbal-only agreement does not exist."**

### Hook observability — `HARNESS_DEBUG=1`

Hooks silently `exit 0` on many early paths (wrong tool, phase mismatch,
missing state file). That is correct behavior in production, but it makes
"why didn't this hook fire?" hard to investigate.

Set `HARNESS_DEBUG=1` in the invoking shell (or prefix a one-off command)
to turn every early exit into a single `[hook] skip: <reason>` line on
stderr. No-op when unset — zero cost in normal operation.

Example:

```
HARNESS_DEBUG=1 .claude/hooks/post-task-created.sh <<<'{}'
# [post-task-created] skip: pipeline-state.json missing
```

Wired today: `abac-phase-policy.sh`, `post-task-created.sh`. Other hooks
can opt in by sourcing `lib/harness-debug.sh` and adding
`harness_debug <tag> <reason>` before each early exit.

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
