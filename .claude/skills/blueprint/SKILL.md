---
name: blueprint
description: |
  Orchestrate creation/update of PRD, PROJECT-STRUCTURE, and ROADMAP via a guided
  4-mode flow (Bootstrap / PRD / PROJECT-STRUCTURE / ROADMAP). Wraps the five
  doc subagents with phase-state enforcement so steps cannot be skipped. Use when
  the user invokes `/blueprint`, asks to "PRD/ROADMAP을 만들자", or wants to
  initialize/refresh project documentation.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - AskUserQuestion
skills: interview-protocol
---

# /blueprint

Orchestrator only. The five doc subagents already implement the
`interview-protocol` 2-pass contract; this skill owns **ordering, branch,
state, validation gate, and final PR** — nothing else.

> Do NOT inline PRD/ROADMAP/PS authoring logic here. Always dispatch via the
> Agent tool to the corresponding subagent. Each subagent runs Pass 1 →
> returns `pending_questions` → main agent pumps `AskUserQuestion` one at a
> time → re-spawns with `## INTERVIEW ANSWERS` for Pass 2.

---

## Phase 1 — Intent

1. **Args capture**: if invoked as `/blueprint <prompt>`, store the raw prompt as `args_seed`. Otherwise `args_seed = null`.
2. **Resume check**: if `.claude/runtime/blueprint-state.json` exists and `current_phase != "complete"`:
   - Ask the user: resume from `<current_phase>` or start over?
   - **Resume** → mode is **locked to `state.mode`** (skip step 3). Jump to step 4 with the existing state.
   - **Start over** → delete the state file first, then continue to step 3.
3. **Mode select** (only when no resume) — single `AskUserQuestion`:
   - header: `Mode`
   - question: `어떤 문서를 작업할까요?`
   - options: `Bootstrap (전체 생성)` · `PRD 생성 및 업데이트` · `PROJECT-STRUCTURE 생성 및 업데이트` · `ROADMAP 생성 및 업데이트`
4. **Dependency precheck** — `roadmap` mode only: `[ -f docs/PRD.md ]`. If missing, ask `ROADMAP은 PRD가 필요해요. PRD부터 만들까요?` → branch to `bootstrap` or abort.
5. **Branch** (only when no resume): `git checkout -b docs/blueprint-{mode}`. Skip `git-issue.sh` (docs-only exception per CLAUDE.md).
6. **State init** (only when no resume): write `.claude/runtime/blueprint-state.json` per the schema below with `current_phase = "intent"`, then advance to the first execution phase (`prd-gen` / `ps-gen` / `roadmap-gen`).

---

## Phase 2..N — Execute

Dispatch by mode:

| mode | reference |
|------|-----------|
| `bootstrap` | [references/bootstrap.md](references/bootstrap.md) |
| `prd` / `project-structure` / `roadmap` | [references/individual.md](references/individual.md) |

**Universal rules** (apply to every subagent call):
- Run **one** Pass 1 → AskUserQuestion loop → **one** Pass 2 per subagent. Do not start the next subagent before the current one's Pass 2 returns.
- After Pass 2 returns, write `current_phase` to the next value in the mode's sequence. The phase-gate hook enforces single-step forward (or `*-gen` rewind on validation-fail).
- On validator findings with **severity `warning` or higher** (i.e., not pure `info`), report the issue list to the user with choices `수정 / 무시 / 종료`:
  - `수정` → rewind state to the corresponding `*-gen` phase, re-spawn the generator with the issue list appended to the prompt.
  - `무시` → advance.
  - `종료` → stop, leave state at the validator phase.
- If the validator returns only `info` findings (or none), advance automatically without prompting.

---

## State

`.claude/runtime/blueprint-state.json`:

```json
{
  "mode": "bootstrap|prd|project-structure|roadmap",
  "current_phase": "intent|prd-gen|prd-validate|ps-gen|roadmap-gen|roadmap-validate|complete",
  "branch": "docs/blueprint-{mode}",
  "args_seed": "<string|null>",
  "started_at": "<ISO8601>",
  "updated_at": "<ISO8601>"
}
```

### Allowed sequences

| mode | sequence |
|------|----------|
| `bootstrap` | intent → prd-gen → prd-validate → ps-gen → roadmap-gen → roadmap-validate → complete |
| `prd` | intent → prd-gen → prd-validate → complete |
| `project-structure` | intent → ps-gen → complete |
| `roadmap` | intent → roadmap-gen → roadmap-validate → complete |

Enforcement: [`.claude/hooks/phase/blueprint-phase-gate.sh`](../../hooks/phase/blueprint-phase-gate.sh) blocks
(a) renderer scripts run outside their expected gen-phase, (b) phase writes that skip a step or jump to a phase outside the mode's sequence, and (c) Bash/Edit mutations of `blueprint-state.json`. **Always use the `Write` tool** with the full state JSON to advance phases; `Edit` and `sed`/`jq -i`/`> file` mutations are denied. Escape: `BLUEPRINT_BYPASS=1` (one-shot only).

---

## Subagent dispatch

| Phase | Agent | seed |
|-------|-------|------|
| `prd-gen` | `prd-generator` | `args_seed` |
| `prd-validate` | `prd-validator` | — |
| `ps-gen` | `project-structure-generator` | `args_seed` |
| `roadmap-gen` | `roadmap-generator` | `args_seed` |
| `roadmap-validate` | `roadmap-validator` | — |

`args_seed` is routed only to the **generator** of the mode the user picked (or every generator in `bootstrap`). Validators do not receive it.

---

## Phase Final — Wrap up

1. `current_phase = "complete"` (state file retained).
2. Stage + commit:
   ```bash
   git add docs/ .claude/runtime/blueprint-state.json
   git commit -m "📝 docs: blueprint <mode> run"
   ```
3. PR:
   ```bash
   .claude/hooks/pr/git-pr-create.sh --title "<title>" --body "<body>"
   ```
4. User confirmation → merge: `.claude/hooks/pr/git-pr-merge.sh`.

---

## User-facing examples (한글)

Phase 1 진입 시:
```
어떤 문서를 작업할까요?
  1) Bootstrap (전체 생성)
  2) PRD 생성 및 업데이트
  3) PROJECT-STRUCTURE 생성 및 업데이트
  4) ROADMAP 생성 및 업데이트
```

Resume 안내:
```
이전에 prd-validate 단계까지 진행했어요. 이어서 진행할까요, 새로 시작할까요?
```

Validation 이슈 보고:
```
PRD validator 이슈 3건:
  - F003: 인증 흐름 모호
  - §7: 외래키 누락
  - §11: KPI 측정 방법 미명시
선택: 수정 / 무시 / 종료
```

Hook 차단 메시지 (참고용 — 정상 흐름에서는 나오지 않음):
```
Blueprint Phase Gate 차단: 이 renderer는 'prd-gen' phase에서만 실행 가능합니다.
  현재 phase: ps-gen (mode=bootstrap)
```

---

## Out of scope

- `roadmap-generator`의 Mark mode (별도 워크플로).
- blueprint 자체의 unit test (TDD-exempt: skill/hook/config).
- Validation 이슈를 자동으로 generator에 되돌리는 무인 루프 (사용자 결정 필수).
