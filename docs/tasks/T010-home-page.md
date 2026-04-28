# Task 010 — Home Page (F001 Hero + F017 Featured/Recent)

| Field | Value |
|-------|-------|
| **Task ID** | T010 |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation (route + components) |
| **Branch** | `feature/issue-N-home-page` |
| **Depends on** | T005, T008, T009 |
| **Blocks** | T016 |
| **PRD Features** | **F001** (Hero), **F017** (Featured + Recent Posts) |
| **PRD AC** | — (Page-by-Page Key Features 검증) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
Home(`/`) 페이지에 PRD `F001 Hero (whoami + 검색 + 빠른 링크)` + `F017 Featured Project + Recent Posts 3개`를 렌더한다. 검색 트리거 버튼은 Task 016의 Cmd+K Command Palette를 트리거할 placeholder hook을 미리 연결한다.

## Context
- **Why**: 사이트의 첫 진입점. B2B/B2C 두 청중을 콘텐츠 라우팅(About / Projects)으로 자연 수렴시키는 패러다임의 시작점. F017 Featured/Recent는 Home의 정보 밀도와 SEO 진입점.
- **Phase 진입/완료 연결**: T005(Theme/Chrome) + T008(read-side service) + T009(DI) 모두 Done이어야 시작 가능. T010 Done이면 T016이 Home의 검색 트리거를 Cmd+K palette로 본격 연결.
- **관련 PRD 섹션**: PRD `Page-by-Page — Home Page`, `F001`, `F017`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/_index.tsx`, `app/presentation/components/home/`

## Scope

### In Scope
- `_index.tsx` loader가 `context.container.getFeaturedProject()` + `context.container.getRecentPosts(3)` 호출
- Hero(`<HeroWhoami />`) — `whoami` 프롬프트 + "ship solo. ship fast." 카피 + 3-버튼 클러스터 ([검색해서 이동], [/about], [/projects])
- `<FeaturedProjectCard />` — featured project 카드 (없으면 미렌더)
- `<RecentPostsList />` — 정확히 3개 PostRow + "모두 보기 →" 링크
- 검색 트리거 버튼은 `useCommandPalette` hook의 `open()`을 호출 (T016에서 본체 채워짐, T010에서는 hook signature placeholder)

### Out of Scope
- Cmd+K palette UI 본체 (T016)
- About 페이지 콘텐츠 (T011)
- Project Detail / Blog Detail (T013, T014b)
- 페이지별 meta export(F018) — T019

## Acceptance Criteria
- [ ] `/` 진입 시 Hero / Featured / Recent 3 섹션이 순서대로 렌더
- [ ] Hero의 [/about] 클릭 시 `/about`으로 네비게이션
- [ ] Hero의 [/projects] 클릭 시 `/projects`로 네비게이션
- [ ] [검색해서 이동] 클릭 시 `useCommandPalette().open()` 호출 (T016 마운트 후 palette 오픈)
- [ ] Featured Project가 존재할 때 `<FeaturedProjectCard />` 렌더, 없을 때 미렌더 (전체 섹션 conditional)
- [ ] `<RecentPostsList />`가 정확히 3개 `<PostRow>`를 렌더 + "모두 보기 →" 링크
- [ ] DOM 구조 snapshot/selector assertion으로 위 3 섹션 순서 보장

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/routes/__tests__/_index.test.tsx`
  - mock container: `getFeaturedProject` resolves project / `getRecentPosts(3)` resolves 3 posts
  - loader 호출 시 두 service 모두 호출됨 (`expect(mock).toHaveBeenCalledWith(...)`)
  - RTL 렌더 후 `getByRole('heading', { name: /whoami/i })` / `getByText(/ship solo/i)` / 3-버튼 클러스터 ARIA role / Featured 카드 1개 + PostRow 3개 검증
  - **Featured 미존재 케이스**: `getFeaturedProject` resolves null → Featured 섹션 미렌더 (`queryByTestId("featured-section")` null)
- `app/presentation/components/home/__tests__/HeroWhoami.test.tsx`
  - 3-버튼 클러스터 렌더 + ARIA role
- `app/presentation/components/home/__tests__/RecentPostsList.test.tsx`
  - props로 3 posts 전달 → `getAllByRole('article').toHaveLength(3)` + "모두 보기 →" link

### Green
- `app/presentation/routes/_index.tsx` — loader + 컴포넌트 조합
- `app/presentation/components/home/HeroWhoami.tsx`
- `app/presentation/components/home/FeaturedProjectCard.tsx`
- `app/presentation/components/home/RecentPostsList.tsx`
- `app/presentation/hooks/useCommandPalette.ts` placeholder (T016에서 본체)

### Refactor
- HeroWhoami의 카피를 상수로 추출
- 검색 트리거 버튼을 chrome Topbar의 트리거와 일관된 컴포넌트로 묶을 수 있는지 검토 (T005에서 placeholder 둠)

## Files to Create / Modify

### Presentation — Route (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/_index.tsx` | placeholder 위에 loader + 컴포넌트 채움 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/_index.test.tsx` | RTL + mock container |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/home/HeroWhoami.tsx` | whoami + 카피 + 3-버튼 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/home/FeaturedProjectCard.tsx` | Project 큰 카드 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/home/RecentPostsList.tsx` | 3개 PostRow + "모두 보기 →" |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/home/__tests__/HeroWhoami.test.tsx` | RTL |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/home/__tests__/RecentPostsList.test.tsx` | RTL |

### Presentation — Hook (placeholder)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/useCommandPalette.ts` | placeholder — `{ open: () => void }` 시그니처만 (T016에서 본체) |

## Verification Steps

### 자동
- `bun run test` — `_index.test.tsx`, `HeroWhoami.test.tsx`, `RecentPostsList.test.tsx` 모두 Green (Issue #1 보강)
- loader가 `getFeaturedProject` + `getRecentPosts(3)` 모두 호출 (mock container assertion)
- DOM 구조 snapshot 또는 명시적 selector assertion으로 Hero / Featured / Recent 3 섹션 순서 보장
- `bun run typecheck` 통과

### 수동
- `wrangler dev`에서 `/` 접속 → 3 섹션 렌더 시각 확인
- [/about] / [/projects] 클릭 → 네비게이션
- 다크/라이트 모드 시각 회귀

### 측정
- 없음 (Phase 6 Lighthouse)

## Dependencies
- **Depends on**: T005 (Theme/Chrome), T008 (`getFeaturedProject`/`getRecentPosts`), T009 (DI)
- **Blocks**: T016 (Cmd+K가 Home의 트리거에 연결)

## Risks & Mitigations
- **Risk**: Featured project가 0개일 때 빈 섹션이 어색하게 남음.
  - **Mitigation**: Featured 미존재 시 전체 `<section>` 자체를 conditional render로 제거. AC에 명시.
- **Risk**: T016이 아직 없으므로 [검색해서 이동] 버튼이 동작 검증 어려움.
  - **Mitigation**: `useCommandPalette` hook signature만 T010에서 placeholder로 만들고, T016에서 본체 채우면 자동 통합.

## References
- PRD `Page-by-Page — Home Page`, `F001`, `F017`
- PROJECT-STRUCTURE.md `Cross-cutting Concerns Mapping`
- ROADMAP.md `Phase 3` Task 010 (Issue #1 검증 보강 반영)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
