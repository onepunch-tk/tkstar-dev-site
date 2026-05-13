# Phase 0: Discovery (All Modes, All Branch Types)

> **Goal**: Reach Ambiguity Count = 0 about user intent **before** any plan,
> branch, or task work begins. The default assumption is that the agent does
> NOT understand the user — only after the interview proves otherwise does the
> pipeline advance to Phase 1.
>
> **Skip conditions**: **NONE.** Every branch type (`feature/*`, `fix/*`,
> `chore/*`, `docs/*`) and every change scope passes through Phase 0.
> Triviality is not consent.

| Step | Action |
|------|--------|
| 0.1 | **Invoke the `Skill` tool with skill name `interview-protocol`** to load the interview protocol into the current conversation. The skill is registered as `user-invocable: false` but remains tool-invocable by the main agent — it appears in the available-skills system reminder. The `Skill` tool MUST be called; reading this reference file is not a substitute. All Phase 0 rules (12 Core Rules including no-skip, ambiguity-zero + coverage-confirmed, Korean templates, one-at-a-time default, tension-following, hedge detection, lens-coverage minimum, codebase-verification mandate, complexity-tiered minimum count, false-pass guard, output gate) live inside that skill and are NOT inlined here. |
| 0.2 | **Use harness vocabulary correctly** when phrasing questions (e.g., **Phase 0**, **roadmap-generator sub-agent**, **Pipeline State**, **ABAC**) — never invent synonyms. The vocabulary is implicit in this skill and the surrounding references; consult them when uncertain. |
| 0.3 | **Enumerate ambiguities via the Lenses Pool** (not aloud — internal scratch). Pick 3–4 lenses from at least 3 categories (Strategic / Systemic / Devil's Advocate). Domain-recommended starting combos and the full lens catalog live in the `interview-protocol` skill's "Enumeration: Lenses Pool" section. At least one Negative space or Laddering question is mandatory (Rule #9 hidden-assumption probe). |
| 0.4 | **Interview loop** (per `interview-protocol` skill): default to **1 `AskUserQuestion` per call**; batch (up to 4) only when same-lens-cluster AND no recent tension. Apply each answer; if a hedge token (`아마`, `보통`, `case by case`, etc.) or contradiction surfaces, drop the planned next batch and follow the tension thread (Rule #7/#8). For engineering tasks, attempt Read/Glob/Grep before asking the user any question the codebase can answer (Rule #10). Loop until the exit gate clears: ambiguity list empty + lens-coverage minimum met (Rule #9) + complexity-tiered question count met (Rule #11) + user "없음" answer to coverage check (Rule #2) + false-pass guard clears (Rule #12). **No round limit.** |
| 0.5 | **Write the Korean intent summary + coverage attestation** to the active plan file (path provided by Plan Mode system reminder, typically `/Users/tkstart/.claude/plans/<slug>.md`). Format defined in `interview-protocol` skill's "Output format" section — the attestation block records active lens categories, cumulative question count, codebase verification count, and the user's coverage answer. |
| 0.6 | **Pipeline State → `discovery`**: set `pipeline-state.json` `current_phase` to `"discovery"` (the ABAC hook still hard-blocks source code edits — discovery shares the same "no source edits" semantics as plan). Other fields stay at their Phase-0-entry defaults (`plan_approved: false`, etc.). |
| 0.7 | **User confirmation gate**: present the intent summary to the user with a single closing question — "이 의도 요약대로 진행해도 될까요? 수정할 부분이 있다면 알려주세요." Only after the user explicitly confirms (e.g., "맞아요", "진행해", or specific edits applied) does Phase 1 begin. |

## Output Gate (must be on disk before Phase 1)

The plan file at the end of Phase 0 contains:

```markdown
## 사용자 의도 요약 (Phase 0 출력)

목표: <한 문장>
사용자 의도: <한 문장 — 사용자가 답변에서 강조한 핵심>
결정된 제약: <쉼표로 나열 — framework, library, 데이터 출처 등>
명시적 보류: <사용자가 "지금은 안 함"이라고 한 항목 — 없으면 "없음">
```

This block is the contract Phase 1 reads from. If the plan file is missing or
this block is absent, Phase 1 must refuse to start and call back to Phase 0.

## All branch types follow the full pipeline

`feature/*` · `fix/*` · `chore/*` · `docs/*` — every branch type completes
Phase 0 → 1 → 2 → 3 → 4 in full. There is no branch-prefix shortcut. A
chore that edits a hook or a docs PR that rewrites the PRD has the same
intent-capture and review surface as a feature implementation. The
"non-behavior" character of `.sh` / `.md` / `.json` / `.yaml` / `.yml`
files is handled at the TDD-exemption layer (see
[`phase-1-plan.md` §"TDD Exemption — Setup & Data Files"](phase-1-plan.md)),
not at the phase-skip layer.

Rationale: PRD, ROADMAP, and harness-pipeline updates routinely arrive on
`chore/*` or `docs/*` branches; treating them as low-stakes (plan skip,
floor=2 interview) was the failure mode this rule eliminates.

## Anti-patterns

- ❌ Skipping Phase 0 because "the user already explained it in their message."
  The user's message is the *input* to enumeration, not its conclusion.
- ❌ Writing the intent summary without a real `AskUserQuestion` round.
  Empty interviews are worse than no protocol — they bake unverified
  assumptions into the plan as if confirmed.
- ❌ Advancing to Phase 1 before user confirms the summary.
- ❌ Asking follow-up questions only in plain text without `AskUserQuestion`.
  The structured tool gives the user multiple-choice + custom-text and emits
  proper telemetry.
- ❌ Treating Step 0.1's "Invoke the `Skill` tool" instruction as a passive
  reading hint. The main agent MUST call the `Skill` tool with skill name
  `interview-protocol` — without it, the protocol's rules (Lenses Pool, hedge
  detection, false-pass guard, etc.) are not loaded into the current context
  and the interview reverts to ad-hoc questioning.

## Cross-references

- Skill: `.claude/skills/interview-protocol/SKILL.md`
- Framework detection: `.claude/skills/framework-detection/SKILL.md`
- Phase 1: `phase-1-plan.md` (entered only after Phase 0 confirmation gate)
