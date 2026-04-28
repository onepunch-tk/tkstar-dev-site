# Task 015 — Legal Index + App Terms + App Privacy (F014, chrome-free)

| Field | Value |
|-------|-------|
| **Task ID** | T015 |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation |
| **Branch** | `feature/issue-N-legal-pages` |
| **Depends on** | T005, T007, T008, T009 |
| **Blocks** | — |
| **PRD Features** | **F014** (앱 약관 라우팅) |
| **PRD AC** | — (Page-by-Page Key Features 검증, F018 차등 인덱싱은 Phase 5) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
Legal Index(`/legal`)에 등록된 앱 카드를 표시하고, `/legal/:app/terms` / `/legal/:app/privacy`를 chrome-free 레이아웃(Topbar/Footer 미노출, max-width 680px)으로 렌더한다. Footer Legal 링크는 앱 1개 이상일 때만 노출.

## Context
- **Why**: 앱 출시 시 약관 URL이 필요. 앱 내부 WebView에서 호출되므로 chrome-free sober 모드 필수. MVP에서는 1개 seed(`moai`)만 가동, 앱 출시 시 점진적 추가.
- **Phase 진입/완료 연결**: T005/T007/T008/T009 Done 후. 다른 Phase 3 task와 병렬 가능.
- **관련 PRD 섹션**: PRD `Page-by-Page — Legal Index / App Terms / App Privacy`, `F014`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/{legal._index, legal.$app.terms, legal.$app.privacy}.tsx`, `app/presentation/components/legal/`, `app/presentation/components/chrome/Footer.tsx`(수정)

## Scope

### In Scope
- `legal._index.tsx` loader: `listApps()` → 앱 카드 목록
- `legal.$app.terms.tsx` / `legal.$app.privacy.tsx` loader: `findAppDoc(app, "terms"|"privacy")` → MDX 본문 (chrome-free)
- `<AppCard />` — 앱명 / slug / [terms.mdx] / [privacy.mdx] 링크
- `<LegalDocLayout />` — chrome-free 컨테이너 wrapper (T004의 `<ChromeFreeLayout />` 위에 sober 토큰 적용)
- `<Footer />` 수정 — `appCount > 0`이면 Legal 링크 노출, 0이면 미노출

### Out of Scope
- F018 차등 인덱싱 meta `noindex, follow` (T019)
- 페이지별 meta export (T019)
- chrome-free 레이아웃 자체 (T004에서 만든 `<ChromeFreeLayout />` 재사용)

## Acceptance Criteria
- [ ] `/legal` 인덱스에 등록된 앱 카드(`<AppCard />`) 갯수 = `listApps()` 결과 길이 (seed: 1개 `moai`)
- [ ] `/legal/moai/terms`와 `/legal/moai/privacy`가 chrome-free 레이아웃으로 렌더 (Topbar/Footer 미노출, max-width 680px)
- [ ] Footer가 일반 페이지에서 — `appCount === 0`이면 Legal 링크 미렌더, `appCount > 0`이면 노출
- [ ] DOM 구조 snapshot/className assertion으로 chrome-free 본문 영역 보장 (Issue #1 보강)

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/routes/__tests__/legal._index.test.tsx` (Issue #1 보강)
  - mock container `listApps()` → `["moai"]` 반환
  - `<AppCard />` 1개 렌더 + `[terms.mdx]` `[privacy.mdx]` 링크
- `app/presentation/routes/__tests__/legal.$app.terms.test.tsx`
  - mock container `findAppDoc("moai", "terms")` 호출
  - chrome-free 본문 렌더 (Topbar/Footer 미렌더)
- `app/presentation/components/chrome/__tests__/Footer.test.tsx`
  - `appCount: 0` props → Legal 링크 미렌더 (`queryByRole('link', { name: /legal/i })` null)
  - `appCount: 1` → Legal 링크 노출
- `app/presentation/layouts/__tests__/ChromeFreeLayout.test.tsx` (T004 보강)
  - `max-width: 680px` className 적용 검증

### Green
- 3개 라우트 본체
- `<AppCard />`, `<LegalDocLayout />`
- `<Footer />` 수정 — `appCount` props 또는 loader data로부터 분기

### Refactor
- Footer의 `appCount`를 root loader에서 한 번 계산하여 `useRouteLoaderData`로 전파 (per-page loader 호출 비용 절감)

## Files to Create / Modify

### Presentation — Routes
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal._index.tsx` | 앱 목록 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal.$app.terms.tsx` | chrome-free terms |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal.$app.privacy.tsx` | chrome-free privacy |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/legal._index.test.tsx` | RTL |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/legal.$app.terms.test.tsx` | RTL |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/legal/AppCard.tsx` | 앱 카드 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/legal/LegalDocLayout.tsx` | sober mode wrapper |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/chrome/Footer.tsx` (수정) | `appCount > 0`일 때 Legal 링크 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/chrome/__tests__/Footer.test.tsx` | Legal 링크 조건부 |

### Root (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/root.tsx` | root loader에 `listApps().length` 호출 추가 → `useRouteLoaderData("root")`에서 `appCount` 사용 |

## Verification Steps

### 자동
- `bun run test` — 4 테스트 셋 모두 Green (Issue #1 보강)
- `bun run typecheck` 통과

### 수동
- `wrangler dev`에서 `/legal/moai/terms` / `/legal/moai/privacy` 직접 접속 → chrome-free 시각 확인 (Topbar/Footer 미노출)
- 일반 페이지에서 Footer Legal 링크 노출 확인
- seed 콘텐츠를 0개로 만들어 `appCount === 0` 케이스 시각 확인 (선택)

### 측정
- 없음

## Dependencies
- **Depends on**: T005 (Theme/Chrome), T007 (legal seed MDX), T008 (`listApps`/`findAppDoc`), T009 (DI)
- **Blocks**: 없음

## Risks & Mitigations
- **Risk**: chrome-free 레이아웃의 max-width가 모바일에서 의도와 어긋남.
  - **Mitigation**: `max-width: 680px` + `padding: 1rem`로 viewport < 680px도 자연스럽게 fit.

## References
- PRD `Page-by-Page — Legal Index / App Terms / App Privacy`, `F014`
- ROADMAP.md `Phase 3` Task 015 (Issue #1 검증 보강 반영)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
