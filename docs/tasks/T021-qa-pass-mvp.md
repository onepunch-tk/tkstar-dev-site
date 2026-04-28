# Task 021 — 통합 QA + Lighthouse + Axe 접근성 점검 + 모든 PRD AC 통과 매트릭스

| Field | Value |
|-------|-------|
| **Task ID** | T021 |
| **Phase** | Phase 6 — Polish & Deploy |
| **Layer** | 전 layer (회귀 테스트) |
| **Branch** | `chore/qa-pass-mvp` |
| **Depends on** | T020 |
| **Blocks** | T022 |
| **PRD Features** | F001~F019 전체 |
| **PRD AC** | AC-F003-1/2/3, AC-F008-1/2/3/4, AC-F009-1/2/3, AC-F011-1/2/3, AC-F016-1/2/3/4/5 — **18개 AC 전수** |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
배포 직전 통합 QA 단계. 모든 자동 테스트가 Green이고 coverage threshold(T003에서 정의한 lines 80 / branches 75 / functions 80 / statements 80)를 통과하며, Lighthouse(Perf ≥ 90, A11y ≥ 95, Best Practices ≥ 95, SEO ≥ 100), Axe 위반 0건이 보장됨을 확인한다. 18개 PRD AC 전체를 매트릭스로 회귀.

## Context
- **Why**: Phase 1~5에서 task 단위 AC는 모두 통과했지만 배포 전 회귀 매트릭스가 1회 더 필요. Lighthouse/Axe는 task 단위로 검증 불가능한 cross-cutting 품질 지표.
- **Phase 진입/완료 연결**: T020 Done 후. T021 Done이 T022 배포의 진입 조건.
- **관련 PRD 섹션**: PRD `Acceptance Criteria` 18개 AC 전체
- **관련 PROJECT-STRUCTURE 디렉토리**: `docs/reports/qa-{date}.md`(수동 결과 기록)

## Scope

### In Scope
- `bun run test:coverage` 실행 + threshold 통과 확인 (수치는 T003 vitest.config.ts에 정의)
- Lighthouse 4 카테고리 점수 측정 (production preview build에서)
- Axe 자동 스캔 (예: `@axe-core/cli` 또는 Chrome DevTools Lighthouse 통합)
- 18개 AC 전수 회귀 매트릭스 — 각 AC를 자동 테스트 ID와 매핑하여 통과 표 작성
- 키보드만 네비게이션 (Cmd+K → palette → 결과 진입 → Esc) 수동 검증
- 다크/라이트 모드 시각 회귀 (스냅샷 또는 수동 비교)
- 발견된 결함은 별도 `fix/issue-N-*` PR로 분리

### Out of Scope
- 실제 production 배포 (T022)
- 도메인 연결 (T022)
- Cloudflare Email Routing (T022)

## Acceptance Criteria
- [ ] `bun run test:coverage` 100% Green + threshold 통과 (lines ≥ 80%, branches ≥ 75%, functions ≥ 80%, statements ≥ 80%)
- [ ] Lighthouse Performance ≥ 90
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Lighthouse Best Practices ≥ 95
- [ ] Lighthouse SEO ≥ 100
- [ ] Axe-core 위반 0건 (모든 페이지)
- [ ] 18개 AC 전수 회귀 매트릭스 PASS (`docs/reports/qa-{date}.md`)
- [ ] 키보드 only 네비게이션 정상 (Cmd+K → palette → 결과 ↑↓ → ↵ → Esc)
- [ ] 다크/라이트 모드 시각 회귀 통과

## Implementation Plan (TDD Cycle)
**N/A — chore branch policy.** QA 자체는 회귀 테스트 단계이며 새 코드를 거의 추가하지 않음. 발견된 결함은 별도 `fix/*` PR.

## Files to Create / Modify

### Reports
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/reports/qa-2026-MM-DD.md` | QA 실행 결과 + 18개 AC 매트릭스 + Lighthouse 점수 + Axe 결과 |

### CI Hook (선택)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/.github/workflows/ci.yml` (선택, 별도 task로 분리해도 됨) | `bun run test:coverage` + Lighthouse CI / Axe CI 자동 실행 |

## Verification Steps

### 자동
- `bun run test:coverage` exit 0 + threshold 통과
- Lighthouse CLI(`bunx lighthouse https://localhost:8787 --quiet --output json`) 결과 4 카테고리 점수
- `bunx @axe-core/cli` 또는 Pa11y로 모든 페이지 스캔

### 수동
- Chrome DevTools Lighthouse 탭에서 production preview(`bun run build && bunx wrangler pages dev` 또는 staging URL)에 대해 4 카테고리 측정
- 키보드만 네비게이션 1 round
- 다크 모드 → 라이트 모드 전환 시각 회귀

### 측정
- Lighthouse 4 카테고리 점수
- coverage % (lines/branches/functions/statements)
- Axe 위반 수

## Dependencies
- **Depends on**: T020 (모든 페이지 + SEO + analytics 가동)
- **Blocks**: T022 (배포)

## Risks & Mitigations
- **Risk**: coverage threshold가 task별 분기를 놓치거나 mock 비중이 높아 실제 동작 검증이 약할 수 있음.
  - **Mitigation**: T021에서 발견되면 `fix/*` PR로 보강. threshold 수치 자체는 T003에서 합의된 1인 정적 사이트 기준.
- **Risk**: Lighthouse Performance ≥ 90이 cold start에서 깨질 수 있음.
  - **Mitigation**: Cloudflare Workers의 cold start는 매우 짧음(~5ms). 측정은 warm state에서 3회 평균.

## References
- PRD `Acceptance Criteria` 18개 AC 전체
- ROADMAP.md `Phase 6` Task 021 (Issue #6 coverage threshold 수치는 T003에서 정의)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
