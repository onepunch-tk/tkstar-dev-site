# Task 017-pre — PROJECT-STRUCTURE.md 갱신: `app/infrastructure/ratelimit/` 모듈 등록 (docs)

| Field | Value |
|-------|-------|
| **Task ID** | T017-pre |
| **Phase** | Phase 4 — Forms / Email |
| **Layer** | docs (구조 정합성) |
| **Branch** | `docs/update-project-structure-ratelimit` |
| **Depends on** | none (T017보다 선행) |
| **Blocks** | T017 |
| **PRD Features** | F009 (rate-limit 보강) |
| **PRD AC** | — |
| **예상 작업 시간** | 0.25d |
| **Status** | Completed (2026-05-04) |

## Goal
T017이 신규 도입할 `app/infrastructure/ratelimit/kv-rate-limiter.ts` 모듈을 PROJECT-STRUCTURE.md에 사전 등록하여 (a) 구조 정합성을 유지하고 (b) T017 PR이 코드 변경에만 집중할 수 있도록 한다 (검증 리포트 Issue #3 해소).

## Context
- **Why**: 검증 리포트 Issue #3 — PRD 검증 리포트에서 contact rate-limit 추가 요구가 ROADMAP T017에 반영되었으나 PROJECT-STRUCTURE.md 갱신이 누락. 이를 docs 전용 PR로 분리하면 T017 PR이 깨끗하고, 구조 정본 1개를 유지.
- **Phase 진입/완료 연결**: Phase 4 진입 직후, T017 시작 전. 다른 task와 의존성 무관.
- **관련 PRD 섹션**: PRD `F009 Contact 스팸 방지` + AC-F009-3 (rate-limit)
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/infrastructure/` 트리 + Cross-cutting Concerns Mapping

## Scope

### In Scope
- `docs/PROJECT-STRUCTURE.md`의 `app/infrastructure/` 트리(현재 line 213~238)에 `ratelimit/` 항목 추가
- Cross-cutting Concerns Mapping(현재 line 549~560)에 `Contact rate-limit (F009 보강)` 행 추가
- (선택) `Architectural Decisions (Resolved)` 절에 `D6. Workers KV 기반 rate-limit` 추가 — 결정 근거 명시 (KV가 Workers 친화 + free tier 충분)

### Out of Scope
- 실제 `kv-rate-limiter.ts` 코드 — T017
- `wrangler.toml` KV namespace 등록 — T017 (사전 단계)
- Application port 정의 — T017

## Acceptance Criteria
- [x] `docs/PROJECT-STRUCTURE.md`의 `app/infrastructure/` 트리에 `├── ratelimit/` + `│   ├── kv-rate-limiter.ts` + `│   └── __tests__/` 항목이 추가됨
- [x] Cross-cutting Concerns Mapping 표에 `Contact rate-limit (F009 보강) | Application Port + Infrastructure 구현 | application/contact/ports/rate-limiter.port.ts + infrastructure/ratelimit/kv-rate-limiter.ts` 행이 추가됨
- [x] `Architectural Decisions (Resolved)` 절에 `D6. Contact rate-limit: Workers KV 기반 IP 카운터` 추가 (선택 항목 포함)
- [x] `docs/` 외 파일은 변경되지 않음 (surgical change)
- [ ] PR 생성 시 squash merge 후 `development` 브랜치에 정합성 반영

## Implementation Plan (TDD Cycle)
**N/A — docs branch policy.** docs 변경은 PR 리뷰가 안전망이며 Plan/TDD phase 면제.

## Files to Create / Modify

### Docs
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/PROJECT-STRUCTURE.md` | (a) `app/infrastructure/` 트리에 `ratelimit/` 항목 추가, (b) Cross-cutting Concerns Mapping 표에 rate-limit 행 추가, (c) `Architectural Decisions (Resolved)` 절에 D6 추가 (선택) |

## Verification Steps

### 자동
- 없음

### 수동
- 변경된 PROJECT-STRUCTURE.md 마크다운 정상 렌더 확인
- 후속 T017 작업자가 ratelimit/ 위치를 의심없이 파악할 수 있는지 검토

### 측정
- 없음

## Dependencies
- **Depends on**: none
- **Blocks**: T017 (T017은 사전 등록된 ratelimit/ 모듈에 코드를 채움)

## Risks & Mitigations
- **Risk**: docs 변경이 후속 T017 PR과 충돌.
  - **Mitigation**: T017-pre를 먼저 squash merge한 뒤 T017이 development를 rebase. 1~2일 내 처리하면 충돌 거의 없음.

## References
- 검증 리포트 `docs/reports/roadmap-validation-2026-04-28.md` Issue #3
- PRD `F009 Contact 스팸 방지`, AC-F009-3
- PROJECT-STRUCTURE.md 현재 `app/infrastructure/` 트리 (line 213~) + Cross-cutting Concerns Mapping (line 549~)
- ROADMAP.md `Phase 4` Task 017-pre (신규)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-05-04 | PROJECT-STRUCTURE.md 갱신 — ratelimit/ 트리 + Cross-cutting Mapping 행 + D6 (Workers KV 기반 rate-limit Decision) 추가. ROADMAP 체크박스 [x] 표기 | TaekyungHa |
