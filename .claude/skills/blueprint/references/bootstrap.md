# Bootstrap mode — full chain

Sequence: `prd-gen → prd-validate → ps-gen → roadmap-gen → roadmap-validate → complete`

> Every step uses the **same** Pass 1 → AskUserQuestion → Pass 2 cycle from
> `interview-protocol` Mode B. The main agent owns the `AskUserQuestion`
> loop; subagents only enumerate and execute.

## Step 1 — prd-gen

- `Agent(prd-generator)` with prompt:
  - Seed idea: `<args_seed>` (or "사용자가 시드를 제공하지 않음" if null).
  - No `## INTERVIEW ANSWERS` block → triggers Pass 1.
- Pump returned `pending_questions` through `AskUserQuestion` (default 1 per call; respect hedge-detection per `interview-protocol`).
- Re-spawn `prd-generator` with `## INTERVIEW ANSWERS` + `## COVERAGE ATTESTATION` blocks → Pass 2 writes `docs/.harness/prd-input.json` and runs `generate_prd.py`.
- **Advance**: `prd-gen → prd-validate`.

## Step 2 — prd-validate

- `Agent(prd-validator)`. Pass 1 may return `pending_questions` for `[UNCERTAIN]` items.
- Pump questions if any → Pass 2 returns the validation report.
- Apply the **Universal validator decision rule** from SKILL.md (severity ≥ warning → user prompt with 수정/무시/종료; info-only → auto-advance). On `수정`, the re-spawned `prd-generator` receives the issue list in a `## VALIDATION ISSUES` block.
- **Advance** (on 무시 / no issues): `prd-validate → ps-gen`.

## Step 3 — ps-gen

- `Agent(project-structure-generator)` with seed = `args_seed`. Standard Pass 1/2.
- Pass 2 writes `docs/.harness/project-structure-input.json` and runs `generate_project_structure.py`.
- No validator exists for PROJECT-STRUCTURE.
- **Advance**: `ps-gen → roadmap-gen`.

## Step 4 — roadmap-gen

- `Agent(roadmap-generator)` with seed = `args_seed`. Standard Pass 1/2.
- Pass 2 writes `docs/.harness/roadmap-input.json` and runs `generate_roadmap.py` (produces `docs/ROADMAP.md` + `docs/tasks/T###-*.md`).
- **Advance**: `roadmap-gen → roadmap-validate`.

## Step 5 — roadmap-validate

- `Agent(roadmap-validator)`. Standard Pass 1/2.
- Same issue-decision flow as Step 2; `수정` rewinds to `roadmap-gen`.
- **Advance** (on 무시 / no issues): `roadmap-validate → complete`.

---

## Rewind semantics

`수정` writes `current_phase` back to the `*-gen` phase of the same doc. The
phase-gate hook permits backward writes only to `*-gen` (validators cannot
be rewound to). After rewind, the generator re-runs Pass 1/2 with the
issue list as additional context.

## Issue-report format (한글 — 사용자에게 출력)

```
<Doc> validator 이슈 N건:
  - <issue 1>
  - <issue 2>
  ...
선택: 수정 / 무시 / 종료
```
