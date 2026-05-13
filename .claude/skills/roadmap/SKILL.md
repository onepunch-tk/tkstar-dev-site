---
name: roadmap
description: ROADMAP + tasks generation rules. Single template enforced by Python; one input JSON renders ROADMAP.md and every docs/tasks/T###-*.md.
user-invocable: false
---

# ROADMAP Generation — Unified Template (Python-Backed)

ROADMAP.md and every `docs/tasks/T###-{slug}.md` are rendered by a deterministic
Python script from a single structured input JSON. The agent's job is to
**interview the user**, write a complete `docs/.harness/roadmap-input.json`, and
invoke the script. The script does all markdown formatting, dependency-graph
rendering, validation, and PRD F-ID cross-checking.

## Mandatory Workflow

1. **Pre-flight (Python)**
   ```bash
   python3 --version
   ```
   If `python3` is unavailable, **STOP** and report the blocker verbatim.

2. **Read PRD** — `docs/PRD.md` is the source of feature IDs.
   `roadmap-input.json` references `prd_feature_ids` per task; the script
   parses PRD.md headings (`#### F001 — name`) and rejects unknown IDs.

3. **Interview** — `interview-protocol` discipline: ambiguity = 0 before
   writing. The main agent owns `AskUserQuestion`; the sub-agent enumerates
   ambiguities (Pass 1) and applies answers (Pass 2).

4. **Write input file**
   ```
   Write tool → docs/.harness/roadmap-input.json
   ```
   Use the Write tool (not Bash heredoc) so JSON formatting stays clean.

5. **Render**
   ```bash
   python3 .claude/skills/roadmap/scripts/generate_roadmap.py \
     --input docs/.harness/roadmap-input.json \
     --roadmap docs/ROADMAP.md \
     --tasks-dir docs/tasks
   ```

6. **Handle `[REJECT]`** — script exits non-zero with a single
   `[REJECT] <reason>` line on stderr. Read the reason, fix the JSON, re-run.
   Maximum 2 retry attempts; then surface the issue to the user.

> **Output is fixed**: `docs/ROADMAP.md` and `docs/tasks/T###-{slug}.md` per
> task. Files whose content actually changes are backed up to
> `<name>.bak.<timestamp>` before overwriting; identical re-renders are no-op.

## Update vs Mark-Complete

Two distinct flows. Pick by intent.

| Intent | Flow | Script |
|--------|------|--------|
| Add/remove tasks, change phases, edit any field | Edit JSON → re-render | `generate_roadmap.py` |
| Mark a task done (Phase 4 doc-sync) | Markdown surgery only | `mark_complete.py` |

`mark_complete.py` flips `## DoD` checkboxes in the task file, appends a
`## Change History` row, and switches the ROADMAP entry from `- [ ]` to
`- [x] ... ✅`. It does **not** read the JSON — single-task completion never
requires re-rendering everything.

```bash
python3 .claude/skills/roadmap/scripts/mark_complete.py \
  --task T013 \
  --change "Phase 2 (T013) 머지" \
  --author "TaekyungHa" \
  --roadmap docs/ROADMAP.md \
  --tasks-dir docs/tasks
```

## JSON Input Schema + Validation Rules

Authoritative source: `scripts/generate_roadmap.py` dataclasses. Field-by-field outline and the full `[REJECT]` trigger list live in [`references/input-schema.md`](references/input-schema.md). Top-level keys: `meta` / `overview` / `phases[]` / `tasks[]` / `prd_feature_coverage[]` / `dependency_graph_render`.

## Output Templates

Rendered by the script — never written by hand. See [`references/output-templates.md`](references/output-templates.md) for the ROADMAP and per-task layouts.

## Writing Guidelines

1. **Body language is Korean** for all narrative fields (`purpose`,
   `io_contract`, `edge_cases_impl`, etc.). Section headings and JSON keys
   stay English/ASCII.
2. **No pre-baked code**. Do NOT include function signatures, type bodies,
   or implementation snippets in the task file. The task file describes
   *contract* and *behavior* — the implementation is written during Phase 2/3
   of `harness-pipeline`.
3. **`edge_cases_impl` is the longest section**. List every gotcha you
   already see: error classes, fallback policies, page-size caps, role
   gates, locale fallbacks, RLS rules, sync semantics. If something is
   genuinely unclear, move it to `open_questions[]` instead of guessing.
4. **`sequence` is plain text**, 3-10 numbered lines. It describes
   request/response or control flow at a level a human can read aloud,
   not pseudocode in TS syntax.
5. **`dod[]` is the AC contract**. The Phase 4 doc-sync gate
   (`docs-sync-gate.sh` Condition 3) blocks PR creation if a ROADMAP-marked
   task still has unchecked `- [ ]` items in its body — DoD is the only
   `[ ]`-checklist the body should contain.
6. **`open_questions[]`** carries `[NEEDS USER]` markers for ambiguities
   that require user confirmation. The Phase 2 entry block of
   `harness-pipeline` rejects any task that still contains a `[NEEDS USER]`
   marker. Store the question text WITHOUT a `[NEEDS USER]` prefix — the
   renderer auto-prepends `[NEEDS USER]` when `needs_user: true`. Adding the
   prefix manually produces a duplicated `[NEEDS USER] [NEEDS USER]` marker.
7. **PRD §-reference is mandatory whenever a task touches a PRD-defined
   entity or policy**. PRD is the source-of-truth (CLAUDE.md Critical
   Documents). When a task introduces, queries, mutates, or persists any
   entity from PRD §7 (data model) — e.g., `User`, `Place`, `Itinerary`,
   `DayItem`, `AiUsageLedger`, `ConsentLog`, `ShareLink`, `Subscription`,
   `Translation`, `LocalTip`, `PushToken` — the task MUST cite the
   corresponding `PRD §7.x` subsection in `io_contract` or
   `edge_cases_impl`. The same rule applies when a task encodes a policy
   defined in another PRD section (e.g., quota numbers from §4.4, sync
   semantics from §11, privacy from §10, edge cases from §13). Bare entity
   names without §-citations cause schema drift over time and break the
   PRD-as-SoT contract.

## Cross-Section Consistency (enforced by Python)

- `phase.task_ids[]` ↔ `tasks[].phase_id`
- DAG cycle detection on `blocked_by` ∪ `blocks`
- PRD feature ID resolution against `docs/PRD.md`
- `prd_feature_coverage[].task_ids[]` resolution against `tasks[].id`
- `Completed` task ⇒ all DoD checked AND change_history populated
