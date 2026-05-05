---
name: interview-protocol
description: |
  Discovery / Ambiguity-Resolution interview protocol for the harness pipeline and
  any sub-agent that performs requirements gathering, planning, design, or review
  decisions. Loaded at Phase 0 of harness-pipeline and preloaded into 6 interview-
  enabled sub-agents — 5 for full Phase-0 interviews (prd-generator, prd-validator,
  development-planner, code-reviewer, ux-design-lead) and project-structure-analyzer
  for glossary missing-entry confirmation only — via their `skills:` frontmatter.

  Core mandate: **Do NOT proceed on inference.** Interview the user relentlessly
  about every aspect of their intent — 100 questions if that's what it takes —
  until you reach a shared understanding (*Ambiguity Count = 0*).
---

# Interview Protocol

> **Why this skill exists**
>
> The harness has historically allowed agents to "fill in the blanks" with
> reasonable-sounding inferences when user intent was unclear. This produced
> downstream rework, wasted PR cycles, and over-engineered code that solved
> problems the user never asked about. This skill enforces the inverse default:
> **silence is not consent — questions are.**

## Core Rules

1. **No skip conditions.** Every task — including 1-line typo fixes, ROADMAP
   checkbox flips, and chore branches — passes through this protocol. Triviality
   is not a license to assume; even small changes can carry a wrong intent.
2. **Ambiguity Count = 0** is the only valid exit gate. The agent enumerates
   every assumption it would otherwise make, frames each as a question, and
   keeps asking until none remain.
3. **No round limit.** The historical "one round only" pattern in
   `phase-1-plan.md` Step 3a is **deprecated**. Loop is bounded only by the
   ambiguity list, not by an iteration counter.
4. **Korean for questions** (the user's working language). Code identifiers,
   tool names, and file paths stay in English.
5. **Ask one focused batch at a time.** `AskUserQuestion` accepts 1–4 questions
   per call. Group related decisions; do not dump 30 questions in one screen.
6. **Output gate.** Before exiting Phase 0 / before sub-agent returns control,
   write a 1-paragraph **Korean intent summary** to:
   - Phase 0 (main): the plan file referenced in plan mode (`/Users/tkstart/.claude/plans/<slug>.md`)
   - Sub-agent: included in the tool-result returned to the parent agent
   The summary must include: 목표 / 사용자 의도 / 결정된 제약 / 명시적으로 보류된 항목.

## How to enumerate ambiguities

Before asking, list — for the agent's own reasoning, not the user — every
decision that the task implicitly requires:

- 어떤 framework / package / library version?
- 어떤 데이터 출처 / 인증 방식 / 저장 위치?
- 성공 기준은 무엇인가? (test 통과? 수동 검증? 사용자 demo?)
- 어떤 UI 라이브러리 / 디자인 시스템?
- 누가 사용자인가? 어떤 권한 / 역할?
- 에러 케이스 / edge case 는 어떻게 다루나?
- 이 task 는 큰 그림의 어느 단계인가?
- 사용자가 명시한 표현 중 다의적으로 해석 가능한 단어가 있는가?

Anything you cannot answer from CLAUDE.md, ROADMAP, plan file, or the user's
current message is an ambiguity — turn it into a question.

## Interview loop

```
ambiguities = enumerate_ambiguities(task)
while ambiguities:
    batch = take_first(ambiguities, n=1..4, group_by=topic)
    answers = AskUserQuestion(batch)        # Korean
    apply(answers)                           # update plan / sub-agent context
    ambiguities = re_enumerate(task, applied_answers)
write_intent_summary(language="ko")
```

## Background mode is incompatible with this skill

`AskUserQuestion` **fails silently** in background sub-agents (background spawn
≈ `run_in_background: true` on the Agent tool). The sub-agent then "continues"
without the answer, defeating the purpose of this protocol.

Two consequences:

1. **Main agent rule**: when spawning a sub-agent that loads this skill
   (prd-generator, prd-validator, development-planner, code-reviewer,
   ux-design-lead), **always foreground**. Do NOT pass `run_in_background: true`.
2. **Sub-agent rule**: if you somehow detect you are running in background
   (`AskUserQuestion` raised an error), do NOT silently continue. Stop, write a
   `pending_questions: [...]` block in your tool-result, and let the main agent
   surface the questions to the user.

If the work is genuinely independent and must run in background, do NOT load
this skill into that sub-agent — the main agent retains responsibility for the
interview.

## Sub-agent escalation pattern

When loaded into a sub-agent:

- **Foreground**: call `AskUserQuestion` directly. Same loop as Phase 0.
- **Background fallback**: return a tool-result containing
  ```
  pending_questions:
    - { topic: "...", question_ko: "...", options: ["A","B","C"], why_ambiguous: "..." }
  partial_findings: ...   # whatever you completed before hitting ambiguity
  ```
  The main agent will run the interview and may re-spawn the sub-agent with the
  answers in the prompt.

## Output format — intent summary (Korean, 1 paragraph)

```
## 사용자 의도 요약 (Phase 0 출력)

목표: <한 문장>
사용자 의도: <한 문장 — 사용자가 답변에서 강조한 핵심>
결정된 제약: <쉼표로 나열 — framework, library, 데이터 출처 등>
명시적 보류: <사용자가 "지금은 안 함"이라고 한 항목 — 없으면 "없음">
```

Sub-agent 들도 동일 포맷으로 자기 영역의 intent 를 1문단 기록한 뒤 종료.

## Anti-patterns (do NOT do)

- ❌ "이미 충분히 명확해 보이니 질문 없이 진행"
- ❌ "사용자가 짜증 낼 것 같으니 질문 줄임"
- ❌ "한 번에 모든 질문을 30개 다 던짐" (UI 가독성 0, 배치로 나눠야 함)
- ❌ "기본값 / 합리적 추론으로 대체" — 그건 추론이지 의도 파악이 아님
- ❌ Sub-agent 가 background 에서 `AskUserQuestion` 호출 시도 → silent fail

## Anchor — referenced from

- `.claude/skills/harness-pipeline/SKILL.md` Phase Execution table (Phase 0)
- `.claude/skills/harness-pipeline/references/phase-0-discovery.md`
- 6 sub-agent definitions:
  - `.claude/agents/docs/prd-generator.md`
  - `.claude/agents/docs/prd-validator.md`
  - `.claude/agents/docs/development-planner.md`
  - `.claude/agents/dev/code-reviewer.md`
  - `.claude/agents/docs/ux-design-lead.md`
  - `.claude/agents/docs/project-structure-analyzer.md` (glossary missing-entry confirmation)
