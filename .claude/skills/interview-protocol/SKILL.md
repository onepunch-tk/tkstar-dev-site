---
name: interview-protocol
description: |
  Discovery / Ambiguity-Resolution interview protocol for the harness pipeline and
  any sub-agent that performs requirements gathering, planning, design, or review
  decisions. Loaded at Phase 0 of harness-pipeline and preloaded into 5 interview-
  enabled sub-agents (prd-generator, prd-validator, roadmap-generator,
  code-reviewer, ux-design-lead) via their `skills:` frontmatter.

  Core mandate: **Do NOT proceed on inference.** Interview the user relentlessly
  about every aspect of their intent — until ambiguity is exhausted AND the user
  explicitly confirms coverage. The interview itself is owned by the main agent;
  sub-agents enumerate ambiguities and return them for the main agent to ask.
user-invocable: false
---

# Interview Protocol

## Core Rules

1. **No skip conditions.** Every task — including 1-line typo fixes, ROADMAP
   checkbox flips, and chore branches — passes through this protocol. Triviality
   is not a license to assume; even small changes can carry a wrong intent.
2. **Ambiguity Count = 0 AND Coverage Confirmed** is the only valid exit gate.
   The agent enumerates every assumption it would otherwise make, frames each
   as a question, asks until none remain, AND THEN explicitly asks the user
   whether any unexplored dimension exists. Only an explicit "없음" answer
   permits exit.
3. **No round limit.** Loop is bounded only by the ambiguity list and coverage
   gate, not by an iteration counter.
4. **Korean for user-facing prompts.** All `AskUserQuestion` text and the
   intent-summary output are in Korean (the user's working language). Code
   identifiers, tool names, file paths, and internal scratch notes stay in
   English.
5. **One question at a time by default.** `AskUserQuestion` accepts 1–4
   questions per call. Default to **1**. Batch only when 2–4 questions belong
   to the same lens cluster AND no prior answer hinted at tension.
6. **Output gate.** Before exiting Phase 0 / before sub-agent returns control,
   write a Korean intent summary (format below) to:
   - Phase 0 (main): the plan file referenced in plan mode
     (`/Users/tkstart/.claude/plans/<slug>.md`)
   - Sub-agent: included in the tool-result returned to the parent agent
   The summary must include: 목표 / 사용자 의도 / 결정된 제약 / 명시적 보류 /
   coverage attestation.
7. **Tension-following overrides batch order.** When an answer reveals
   contradiction, hidden assumption, fear, or implicit constraint, drop the
   planned next batch and follow that thread. Categories and lens order are
   scaffolding, not a contract.
8. **Hedge detection.** Korean hedge tokens in user answers
   (`아마`, `보통`, `대부분`, `case by case`, `별로`, `꼭 필요한 건 아닌데`,
   `잘 모르겠는데`, `대충`, `적당히`) are themselves new ambiguities. The next
   question MUST probe the hedge — never let a hedged answer terminate a
   thread.
9. **Lens coverage minimum.** Before the coverage check is offered, the
   interview must have activated lenses from at least **3 of 3 lens
   categories** (Strategic / Systemic / Devil's Advocate) AND used at least
   **1 hidden-assumption probe** (Negative space or Laddering). If either
   condition is unmet, generate questions to fill the gap before offering
   coverage check.
10. **Codebase verification mandate.** For engineering tasks (any task that
    will modify code), before asking the user a question that the codebase
    can answer, the agent MUST attempt Read/Glob/Grep first. Track
    verification calls; **0 calls** on an engineering task blocks exit.
11. **Complexity-tiered minimum question count.** When the wave appears
    exhausted (no new ambiguities surfacing, all lenses activated), the
    minimum total questions asked must meet the task-complexity floor before
    the coverage check is offered. If below floor, run a forced reflection
    round on the weakest lens cluster:

    | Task complexity | Minimum questions | Detected from |
    |-----------------|-------------------|---------------|
    | bug fix | **10** | branch prefix `fix/*` |
    | feature | **10** | branch prefix `feature/*` |
    | architecture / cross-cutting refactor | **15** | plan touches ≥6 files OR ≥3 layers |

    `chore/*` and `docs/*` branches inherit the feature/fix floor of **10**
    — high-impact documents (PRD, ROADMAP, harness pipeline configs)
    routinely arrive on these branches and deserve the same intent-capture
    depth. There is no branch-prefix shortcut.

12. **Coverage-check false-pass guard.** Even if the user answers "없음" to
    the coverage question, the exit is blocked if any of the following hold:
    - Active lenses < 3 categories (Rule #9)
    - Cumulative question count < complexity floor (Rule #11)
    - Codebase verification count = 0 on an engineering task (Rule #10)

    On a blocked exit, surface the specific missing condition to the user in
    Korean and ask one targeted follow-up — do not auto-fill.

## Where this skill runs — main agent vs sub-agent

`AskUserQuestion` is a **main-session-only** tool. Sub-agents spawned via the
Agent tool cannot reach it regardless of foreground/background. The protocol
therefore runs in two distinct modes.

### Mode A — Main agent (interactive)

The orchestrator (typically harness-pipeline Phase 0) runs the interview
**inline**: enumerate via the Lenses Pool → `AskUserQuestion` (default 1 per
call) → apply answer → check for tension/hedge → re-enumerate → loop until
the exit gate (Rule #2 + #9 + #11 + #12) → write Korean intent summary.

### Mode B — Sub-agent (2-pass)

A sub-agent loaded via the Agent tool **cannot** ask the user directly.
Instead it follows a 2-pass invocation contract owned jointly with its
caller (the main agent or another sub-agent that has access to a main
session through escalation).

```
PASS 1 — Sub-agent enumerates (read-only, no Write/Edit, no defaults)
  → applies Lenses Pool, returns structured `pending_questions` block

MAIN AGENT — Runs Mode A loop on the user's behalf
  → collects answers + any new ambiguities surfaced via tension-follow

PASS 2 — Sub-agent re-invoked with answers in prompt
  → skips enumeration, performs the actual side-effect work
```

Pass detection is prompt-signaled: **no `## INTERVIEW ANSWERS` block → Pass 1; block present → Pass 2.**

## Enumeration: Lenses Pool

The enumeration step does not flatten the task into a single checklist. It
applies analytical **lenses** — each lens is a stable way to surface what
would otherwise stay invisible. Pick **3–4 lenses** appropriate for the task
domain, drawing from at least 3 categories. Each lens has a stable question
template; adapt the wording to the user's actual context.

### Strategic lenses

| Lens | What it surfaces | Question template (Korean — show user) |
|------|------------------|----------------------------------------|
| **Negative space** | What the user did *not* mention | "X를 언급 안 하셨는데 — 의식적으로 뺀 건가요, 아직 안 정한 건가요?" |
| **Stakeholders** | Other parties affected | "이 결정이 또 누구에게 영향을 주나요? 그 사람들도 같은 의도인가요?" |
| **Rejected alternatives** | Options considered and dropped | "Y는 검토하셨다가 뺐어요? 왜 뺐어요?" |
| **Opportunity cost** | What is *not* being done | "이걸 하는 동안 무엇이 미뤄지나요?" |
| **Confidence level** | Fact vs. assumption vs. hope | "이건 검증된 fact예요, 아니면 느낌이에요?" |

### Systemic lenses

| Lens | What it surfaces | Question template (Korean — show user) |
|------|------------------|----------------------------------------|
| **Dependencies** | Single points of failure | "X가 안 되면 또 뭐가 같이 깨지나요?" |
| **Cascade effects** | Second-order consequences | "이게 B로 이어지면 — B는 또 뭐로 이어져요?" |
| **Time horizon** | Short-term win vs. long-term cost | "3개월 후에도 이 결정이 유효한가요?" |
| **Feedback loops** | Cycles without a brake | "이 cycle을 무엇이 멈추나요?" |

### Devil's Advocate lenses

| Lens | What it surfaces | Question template (Korean — show user) |
|------|------------------|----------------------------------------|
| **Pre-mortem** | Most likely failure cause | "6개월 후 이 결정이 실패했어요. 가장 가능성 높은 이유는?" |
| **Inversion** | Recipe to guarantee failure | "이걸 *확실히 망하게* 하려면 어떻게 만드시겠어요?" |
| **Kill criterion** | When to stop | "어떤 결과가 나오면 '안 되겠다, 그만' 하실 거예요?" |
| **Minimum version** | Scope creep / overengineering | "80% 문제를 푸는 minimum은 뭐예요?" |
| **Laddering** | Root cause behind surface desire | "X를 원하시는데 — 왜요? 그 뒤엔 뭐가 있어요?" |

### Domain-recommended lens combos

| Domain | Recommended starting lenses |
|--------|----------------------------|
| Web / mobile / backend / api feature | Stakeholders, Minimum version, Kill criterion, Confidence level |
| Architecture / cross-cutting | Dependencies, Cascade effects, Time horizon, Minimum version |
| Refactor | Opportunity cost, Rejected alternatives, Confidence level, Pre-mortem |
| Bug fix | Confidence level, Pre-mortem, Cascade effects |
| chore / harness tooling | Negative space, Rejected alternatives, Minimum version |

These are starting points. Switch lenses mid-interview when an answer reveals
that a different lens would surface more.

## Engineering moves

These moves are specific to engineering tasks. They run *alongside* the
Lenses Pool — not in place of it.

### Glossary challenge

When the user uses a term that conflicts with existing language in
`docs/PROJECT-STRUCTURE.md`, `docs/PRD.md`, `CLAUDE.md`, or in-code domain
files (e.g., `**/*.types.ts`, `**/types.ts`, `**/domain/**`), call it out
immediately:

> "기존 정의는 [정의 X]인데 지금 말씀은 [정의 Y]로 들립니다 — 어느 쪽이세요?"

Do not silently reconcile.

### Sharpen fuzzy language

When the user uses vague or overloaded terms (e.g., "user", "account",
"profile", "data", "config", "system"), propose a precise canonical term:

> "'account'라고 하셨는데 — Customer 말씀이세요, User 말씀이세요? 이 코드베이스에서는 다른 entity예요."

### Cross-reference with code

When the user states how something works, verify against the code via
Read/Glob/Grep. If a contradiction exists, surface it:

> "코드에서는 [실제 동작 X]인데 방금 [동작 Y]라고 하셨어요 — 어느 쪽이 맞나요?"

This satisfies Rule #10's verification mandate when applied.

## Tension-following protocol

Tension is the signal that an answer has opened a deeper thread than the planned questions cover. **Detect → drop → follow.**

**Detect** — any hedge token from Rule #8 (`아마` / `보통` / `case by case` / `별로` / `잘 모르겠는데` / `대충` / `적당히`), a contradiction with an earlier answer, or a long pause / topic deflection. Each hides a different gap (uncertainty smoothed, edge cases unconsidered, decision deferred, real preference avoided, genuine unknown, hidden constraint, implicit assumption shift) — interpret accordingly.

**Drop** — abandon any planned next batch. Those questions were built against the *old* task understanding.

**Follow** — generate the next question *from the tension itself*, not the lens plan. Examples:

- "대부분 admin이 처리해요" → "admin이 *아닌* 사용자가 처리하는 case는 어떤 거예요? 그 case도 이 PR 범위인가요?"
- "Y는 안 쓰는데 사실 잘 모르겠어요" → codebase verify first ("Y의 import 사용처를 찾아봤는데 [발견 사항] — 이게 맞나요?"), then re-ask.
- "지금 만드는 게 맞을 것 같긴 한데..." → Laddering: "*맞을 것 같다*가 걸려요. 지금 안 만들면 어떻게 되는데요?"

After the tension thread is exhausted (no further hedges, contradiction resolved, or user says "이건 더 이상 다룰 필요 없음"), return to the lens plan — but re-enumerate first, since the tension may have invalidated other planned questions.

## Coverage check protocol

The final exit gate before the intent summary — the user's explicit attestation that no dimension was left unexplored. Not a formality.

### Question template (Korean — show user)

```
question: "지금까지 다룬 내용 외에, 이 task에서 다루지 않은 차원이 있나요?
          예: 권한/role / 에러 처리 / 성능 / 마이그레이션 / 모니터링 /
              테스트 범위 / 리버트 전략 / 의존성 변경 등"
options:
  - "없음 — 이대로 마무리"
  - "있음 — 추가로 다뤄야 할 것 있음"
  - "이미 다룬 것 중 더 깊이 보고 싶은 것 있음"
```

### Branching

- **"없음 — 이대로 마무리"** + Rule #12 false-pass guard passes → exit.
- **"없음"** + guard fails → block exit, surface the failing condition to
  the user in Korean, ask one targeted follow-up.
- **"있음"** → user names the dimension, run another Wave on that thread,
  re-offer coverage check.
- **"더 깊이"** → user names which earlier thread, run targeted follow-up
  questions on that thread, re-offer coverage check.

### False-pass guard wording (Korean — show user)

When Rule #12 blocks an attempted "없음" exit:

```
"방금 '없음'으로 답해주셨는데, 다음 조건이 미충족이에요:
 - [active_lens_categories < 3 → '아직 [Strategic/Systemic/Devil's Advocate] 중 \"X\" 카테고리에서 질문이 없었어요']
 - [question_count < floor → '현재 질문 수가 N개인데, 이 task complexity에서는 최소 M개 권장이에요']
 - [codebase_verify == 0 → '코드를 한 번도 직접 확인 안 했어요. 사용자한테만 물어봤어요']
 한 가지만 더 다루고 마무리할까요?"
```

This is a soft block — the user can override by explicitly saying "그래도
끝내자" — but the agent must record the override in the intent summary's
명시적 보류 line.

## Mode A — Main agent interview loop (pseudocode)

```
lenses = pick_lenses(task_domain, n=3..4, ensure_categories=3)
verify_calls = question_count = 0
active_lens_categories = set()
threads_open = [main_thread]

while True:
    next_q = generate_question(lenses, current_ambiguities(),
                               require_assumption_probe=not has_run_assumption_probe())

    if next_q.is_codebase_answerable() and is_engineering_task():  # Rule #10
        answer = read_or_grep_or_glob(next_q)
        verify_calls += 1
        present_finding_for_confirmation(answer)
        continue

    batch = [next_q]
    if can_cluster_with_next(next_q) and no_recent_tension():       # Rule #5
        batch += peek_cluster_neighbors(max_total=4)

    answers = AskUserQuestion(batch)
    question_count += len(batch)
    active_lens_categories.add(next_q.lens.category)

    for a in answers:
        apply(a)
        if has_hedge_token(a) or contradicts_prior(a):              # Rule #7, #8
            drop_remaining(batch)
            threads_open.append(thread_from_tension(a))
            break

    ambiguities = re_enumerate(task, applied_answers)

    if not ambiguities and threads_open == [main_thread]:           # Exit gate
        if not gate_passes(active_lens_categories, question_count, verify_calls):
            generate_question_to_fill_gap()                         # Rule #9/#11
            continue
        coverage = AskUserQuestion(coverage_check_template())
        if coverage == "없음 — 이대로 마무리":
            if not false_pass_guard_ok(active_lens_categories, question_count, verify_calls):
                surface_blocking_condition_in_korean()              # Rule #12
                continue
            break
        elif coverage == "있음":
            ambiguities = enumerate_user_named_dimension()
        else:
            ambiguities = deepen_named_thread()

write_intent_summary(language="ko")  # includes coverage attestation
```

## Mode B — Sub-agent Pass 1 output format

Return this structured block in the tool-result; the main agent parses it to drive Mode A. `lens` and `assumption_probe` are optional — sub-agents that omit them still work, but Rule #9's lens-coverage check then falls to the main agent.

```yaml
pending_questions:
  - id: Q1
    topic: "<short topic label>"
    lens: "strategic/negative-space"            # OPTIONAL — category/lens-name
    assumption_probe: true                       # OPTIONAL — true if Negative space or Laddering
    question_ko: "<full question in Korean, ends with ?>"
    options:
      - "<concise option 1>"
      - "<concise option 2>"
      - "<concise option 3>"
      - "<concise option 4 — optional, max 4>"
    multiSelect: false                           # true if non-exclusive choices
    why_ambiguous: "<one sentence in Korean>"
    blocking: true                               # true if Pass 2 cannot proceed without this answer
partial_findings: |
  <whatever read-only analysis the sub-agent already completed,
   including any codebase verifications already performed>
intent_summary_so_far: |
  목표: ...
  사용자 의도: <best understanding before interview>
  결정된 제약: <items the prompt or files already locked down>
  명시적 보류: <items the sub-agent is deliberately not asking — usually empty in Pass 1>
```

The main agent should pump these through `AskUserQuestion` one at a time
(default per Rule #5), grouped by lens cluster only when no tension has been
surfaced. If a later answer makes an earlier question moot (e.g., "no admin
panel" → questions about admin RBAC drop), prune before re-asking.

## Mode B — Sub-agent Pass 2 input format

When the main agent re-invokes the sub-agent with answers, the prompt should
include a clearly delimited section:

```markdown
## INTERVIEW ANSWERS

- Q1 (<topic>): <chosen option> [+ free-text notes if any]
- Q2 (<topic>): <chosen option>
- ...

## COVERAGE ATTESTATION

- Active lens categories: <Strategic, Systemic, Devil's Advocate>
- Cumulative question count: <N>
- Codebase verifications: <K>
- User coverage answer: "없음 — 이대로 마무리"
- Override (if any): <description, or "none">
```

The sub-agent reads these blocks, applies the answers to its internal plan,
and proceeds with the side-effect work it was originally asked to do
(writing files, calling scripts, returning a report).

## Output format — intent summary (Korean, 1 paragraph + attestation)

Identical for Mode A and Mode B Pass 2:

```
## 사용자 의도 요약 (Phase 0 출력)

목표: <한 문장>
사용자 의도: <한 문장 — 사용자가 답변에서 강조한 핵심>
결정된 제약: <쉼표로 나열 — framework, library, 데이터 출처 등>
명시적 보류: <사용자가 "지금은 안 함"이라고 한 항목 — 없으면 "없음">

## Coverage attestation
- 활성화된 lens 카테고리: <Strategic / Systemic / Devil's Advocate 중 어느 것>
- 누적 질문 수: <N>
- Codebase 직접 확인 횟수: <K>
- 사용자 coverage 응답: "없음 — 이대로 마무리"
- Override 사유: <있으면 한 줄, 없으면 "없음">
```

## Anti-patterns

- ❌ "It already looks clear enough, just proceed without asking" (silent inference).
- ❌ "The user might get annoyed, so cut down the questions" (question shame).
- ❌ Dumping 4 questions in a single screen by default — Rule #5 says default to 1, batch only when same-cluster AND no recent tension.
- ❌ Substituting defaults or "reasonable inferences" for missing answers — that is guessing, not intent capture.
- ❌ A sub-agent attempting to call `AskUserQuestion` (no-op or error — always defer to the main agent).
- ❌ A sub-agent proceeding to side-effect work in Pass 1 without answers — STOP and return `pending_questions`.
- ❌ The main agent ignoring a sub-agent's `pending_questions` and filling them in with inferences before re-invoking Pass 2.
- ❌ Staying in one lens category — Rule #9 requires 3 categories activated before exit.
- ❌ Hearing a hedge token (`아마`, `보통`, `case by case`) and moving to the next planned question instead of probing the hedge — violates Rule #7/#8.
- ❌ Asking the user a question that Read/Glob/Grep would have answered — violates Rule #10.
- ❌ Skipping the coverage check and writing the intent summary directly — violates Rule #2.
- ❌ Auto-passing the coverage check on a "없음" answer when Rule #12's guards have not all cleared.

