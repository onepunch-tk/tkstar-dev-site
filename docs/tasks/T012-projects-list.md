# Task 012 — Projects Page (F004 ls-style 행 리스트 + 태그 필터)

| Field | Value |
|-------|-------|
| **Task ID** | T012 |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation |
| **Branch** | `feature/issue-N-projects-list` |
| **Depends on** | T005, T008, T009 |
| **Blocks** | — |
| **PRD Features** | **F004** (Projects 목록) |
| **PRD AC** | — (UI 표시 위주, Issue #1 보강으로 자동 테스트 추가) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
`/projects` 목록 페이지를 ls-style 행 리스트(카드 그리드 X)로 구현하고, 태그 칩 필터를 URLSearchParam(`?tag=xxx`)에 동기화한다. 행 클릭 시 `/projects/:slug`로 네비게이션.

## Context
- **Why**: B2C 청중에게 "이 사람이 내 문제를 해결할 수 있는가"의 1차 답변. 디자인 정본의 ls-style 행 리스트는 카드 그리드보다 정보 밀도가 높고 터미널 메타포와 일관됨.
- **Phase 진입/완료 연결**: T005/T008/T009 Done 후. 다른 task와 병렬 가능.
- **관련 PRD 섹션**: PRD `Page-by-Page — Projects Page`, `F004`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/projects._index.tsx`, `app/presentation/components/project/`, `app/presentation/lib/format.ts`

## Scope

### In Scope
- `projects._index.tsx` loader: URL `?tag` 파싱 → `context.container.listProjects({ tag })`
- `<ProjectRow />` — ls-style 행 (`slug/ + title + date(YYYY-MM)` / `summary` / `stack pills`)
- `<TagFilterChips />` — 모든 unique 태그 추출 + 클릭 시 URL 갱신 (`useSearchParams`)
- `formatYearMonth(date)` 유틸
- 행 클릭 시 `<Link to={"/projects/" + slug}>`로 네비게이션
- **A013 연계**: solo 프로젝트는 velite frontmatter에 `about_career_role` / `about_career_period` 신규 optional 필드 추가 가능 (About 경력 timeline에서 끌어옴). `/projects` 페이지 자체에는 해당 필드를 노출하지 않으나 frontmatter Zod schema 확장은 본 task 범위에 포함 가능

### Out of Scope
- Project Detail (T013)
- 페이지별 meta export (T019)

## Acceptance Criteria
- [ ] `/projects` 진입 시 모든 project가 행 리스트로 렌더 (카드 그리드 아님)
- [ ] 각 행에 `slug/`, `title`, `date(YYYY-MM)`, `summary`, `stack pills`가 모두 표시
- [ ] 태그 칩 클릭 시 URL이 `?tag=<tag>`로 변경 + loader가 해당 태그로 필터링된 결과 반환
- [ ] 행 클릭 시 `/projects/:slug`로 네비게이션
- [ ] DOM 구조 snapshot 또는 명시적 selector assertion으로 ls-style 행 레이아웃이 grid가 아닌 flat row 구조임을 보장 (Issue #1 보강)

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/routes/__tests__/projects._index.test.tsx` (Issue #1 보강)
  - mock container `listProjects({ tag })`로 호출되는지 (URL `?tag=foo` 인 경우 tag="foo" 전달)
  - 결과 리스트가 `<ProjectRow>` 갯수와 일치
- `app/presentation/components/project/__tests__/ProjectRow.test.tsx`
  - `slug/`, `title`, `date(YYYY-MM)`, `summary`, `stack pills` 모두 RTL `getByText`로 검색 가능
  - 행 컨테이너에 `<Link to="/projects/${slug}">`가 존재
- `app/presentation/components/project/__tests__/TagFilterChips.test.tsx`
  - props로 4 태그 → 4 칩 렌더
  - 칩 클릭 시 `useSearchParams` setter가 `{ tag: clickedTag }`로 호출됨 (memoryRouter + RTL `userEvent.click`)
- `app/presentation/lib/__tests__/format.test.ts`
  - `formatYearMonth("2026-04")` → `"2026-04"` 또는 `"2026.04"` 등 디자인 정본 포맷
  - ISO date → YYYY-MM 변환 검증

### Green
- `app/presentation/routes/projects._index.tsx` — loader + 컴포넌트 조합
- `app/presentation/components/project/ProjectRow.tsx`
- `app/presentation/components/project/TagFilterChips.tsx`
- `app/presentation/lib/format.ts` — `formatYearMonth`

### Refactor
- ls-style 행 레이아웃을 Tailwind utility로 명시적 className (`flex items-baseline gap-`)으로 정리

## Files to Create / Modify

### Presentation — Route
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/projects._index.tsx` | loader + UI |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/projects._index.test.tsx` | RTL + URLSearchParam |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/ProjectRow.tsx` | ls-style 행 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/TagFilterChips.tsx` | 태그 칩 + URLSearchParam |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/__tests__/ProjectRow.test.tsx` | RTL |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/__tests__/TagFilterChips.test.tsx` | RTL + memoryRouter |

### Presentation — Lib
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/format.ts` | `formatYearMonth(date)` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/__tests__/format.test.ts` | unit |

## Verification Steps

### 자동
- `bun run test` — projects._index / ProjectRow / TagFilterChips / format 테스트 모두 Green (Issue #1 보강)
- DOM 구조 snapshot 또는 selector assertion으로 행 레이아웃 보장

### 수동
- `wrangler dev`에서 `/projects` 접속 → 행 리스트 시각 확인
- 태그 칩 클릭 → URL 변경 + 결과 필터링
- 행 클릭 → Project Detail로 네비게이션

### 측정
- 없음

## Dependencies
- **Depends on**: T005 (Theme/Chrome), T008 (`listProjects`), T009 (DI)
- **Blocks**: 없음

## Risks & Mitigations
- **Risk**: 태그 필터 후 결과 0개일 때 빈 화면.
  - **Mitigation**: empty state placeholder ("해당 태그의 프로젝트가 없어요") 추가.

## References
- PRD `Page-by-Page — Projects Page`, `F004`
- ROADMAP.md `Phase 3` Task 012 (Issue #1 검증 보강 반영)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-04-30 | A013 cross-ref 추가 — About 경력 timeline solo entry가 velite project frontmatter (`about_career_role` / `about_career_period`)를 끌어올 수 있음. T012 진행 시 frontmatter Zod schema 확장 가능. | TaekyungHa |
