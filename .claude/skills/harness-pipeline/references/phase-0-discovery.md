# Phase 0: Discovery (All Modes, All Branch Types)

> **Goal**: Reach Ambiguity Count = 0 about user intent **before** any plan,
> branch, or task work begins. The default assumption is that the agent does
> NOT understand the user — only after the interview proves otherwise does the
> pipeline advance to Phase 1.
>
> **Skip conditions**: **NONE.** Even chore/* and docs/* branches and 1-line
> typo fixes pass through Phase 0. Triviality is not consent. (Chore/docs still
> retain their Phase 1/2 carve-out — Phase 0 applies regardless.)

| Step | Action |
|------|--------|
| 0.1 | **Load `interview-protocol` skill.** All Phase 0 rules (no-skip, ambiguity-zero, Korean, no round limit, output gate) live there. |
| 0.2 | **Read `CLAUDE.md` §Harness Vocabulary.** Use harness/pipeline vocabulary correctly when phrasing questions (e.g., **Phase 0**, **development-planner sub-agent**) — never invent synonyms. |
| 0.3 | **Read `docs/glossary.md`** — the project's domain Ubiquitous Language. Use the registered Korean / English pairs verbatim when phrasing questions about domain entities or technical verbs. If the file does not yet exist (very first run), proceed without it; `prd-generator` will seed it. |
| 0.4 | **Enumerate ambiguities** about the user's task description (not aloud — internal scratch). Cover: target framework / data sources / auth / success criteria / UI library / users & roles / error handling / scope boundary / multi-interpretable wording. |
| 0.5 | **Interview loop** (per `interview-protocol` skill): batch `AskUserQuestion` calls (1–4 questions per batch, grouped by topic), apply answers to scratch, re-enumerate. Loop until the ambiguity list is empty. **No round limit.** |
| 0.6 | **Write the Korean intent summary** to the active plan file (path provided by Plan Mode system reminder, typically `/Users/tkstart/.claude/plans/<slug>.md`). Format defined in `interview-protocol` skill's "Output format" section. |
| 0.7 | **Pipeline State → `discovery`**: set `pipeline-state.json` `current_phase` to `"discovery"` (the ABAC hook still hard-blocks source code edits — discovery shares the same "no source edits" semantics as plan). Other fields stay at their Phase-0-entry defaults (`plan_approved: false`, `tasks_created: false`). |
| 0.8 | **User confirmation gate**: present the intent summary to the user with a single closing question — "이 의도 요약대로 진행해도 될까요? 수정할 부분이 있다면 알려주세요." Only after the user explicitly confirms (e.g., "맞아요", "진행해", or specific edits applied) does Phase 1 begin. |

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

## Branch-type behavior

| Branch type | Phase 0 | Phase 1 (Plan) | Phase 2 (TDD) | Phase 3 (Review) | Phase 4 (Validate) |
|-------------|---------|----------------|----------------|-------------------|---------------------|
| `feature/*` | ✅ required | ✅ required | ✅ required | ✅ required | ✅ required |
| `fix/*`     | ✅ required | ✅ required | ✅ required | ✅ required | ✅ required |
| `chore/*`   | ✅ required | ⛔ carved out | ⛔ carved out | ✅ required | ✅ required |
| `docs/*`    | ✅ required | ⛔ carved out | ⛔ carved out | ✅ required | ✅ required |

> Phase 0 is **never** carved out. The Phase 1/2 carve-out for chore/docs
> reflects that those branches carry no behavior change — but they still
> require user-intent confirmation, because misreading intent on a chore
> ("just bump the dep" vs. "bump the dep AND migrate the API surface") is
> precisely the failure mode this Phase exists to prevent.

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

## Cross-references

- Skill: `.claude/skills/interview-protocol/SKILL.md`
- Domain glossary: `docs/glossary.md` (Ubiquitous Language SoT — auto-imported into CLAUDE.md context)
- Framework detection: `.claude/skills/shared/framework-detection/SKILL.md`
- Phase 1: `phase-1-plan.md` (entered only after Phase 0 confirmation gate)
