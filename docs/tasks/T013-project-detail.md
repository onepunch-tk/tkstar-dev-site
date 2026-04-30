# Task 013 — Project Detail Page (F005 + sticky sidebar + on-this-page TOC)

| Field | Value |
|-------|-------|
| **Task ID** | T013 |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation + Application(`getProjectDetail`) |
| **Branch** | `feature/issue-46-project-detail` |
| **Depends on** | T005, T007, T008, T009 |
| **Blocks** | T018 (OG) |
| **PRD Features** | **F005** (Project Case Study) |
| **PRD AC** | — (UI 표시 위주, OG는 Phase 5 F011) |
| **예상 작업 시간** | 1.5d |
| **Status** | Completed |
| **Issue** | #46 |

## Goal
Project Detail 페이지를 Case Study 구조(문제 → 접근 → 결과)로 완성하고, 데스크탑 880px+에서 sticky sidebar(meta + on-this-page TOC)를 가동시킨다. `← prev` / `의뢰하기 →` (primary) / `next →` 3분할 푸터 포함. velite 후처리로 TOC를 frontmatter에 자동 주입하여 가정 A002 완료.

## Context
- **Why**: B2C 청중의 신뢰성 검증 핵심 페이지. sticky sidebar TOC는 긴 본문에서 섹션 점프를 가능하게 하고, "의뢰하기 →" CTA는 모든 콘텐츠 페이지의 최종 수렴점.
- **Phase 진입/완료 연결**: T007에 rehype-slug 적용 완료 후 시작. T013 Done이면 T018(OG)이 Project Detail의 frontmatter를 사용 가능.
- **관련 PRD 섹션**: PRD `Page-by-Page — Project Detail Page`, `F005`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/projects.$slug.tsx`, `app/presentation/components/project/`

## Scope

### In Scope
- `projects.$slug.tsx` loader: `getProjectDetail(slug)` 호출 → `{project, prev, next}` 반환, 미존재 slug throw → splat fallback
- 본문 problem / approach / results 섹션 렌더 (MDX body)
- `<ProjectMetaSidebar />` — year / role / stack pills (sticky 880px+)
- `<OnThisPageToc />` — h2 헤딩 자동 추출 anchor
- velite 후처리 — `velite.config.ts`의 `transform` hook에서 본문 h2 헤딩을 `toc` frontmatter 필드로 주입 (가정 A002 2단계 완료)
- `<ProjectFooterNav />` — 3분할 (`← prev` / `의뢰하기 →` primary / `next →`)
- 모바일 < 880px에서는 sidebar inline

### Out of Scope
- Satori OG (T018)
- 페이지별 meta export (T019)

### Cross-references
- **A013** — About → Project Detail 직접 link는 본 task에서 별도 작업 불필요. About 경력 timeline의 solo entry가 `/projects/:slug` 또는 `/projects?type=solo`로 link하므로 본 task의 라우팅 contract만 정합성 유지하면 됨

## Acceptance Criteria
- [ ] `/projects/:slug` 진입 시 본문 problem/approach/results 섹션 렌더
- [ ] 데스크탑 880px+에서 sticky sidebar(`.two-col`)에 meta(year/role/stack pills) + TOC가 노출
- [ ] 모바일 < 880px에서는 sidebar inline (sticky 미적용)
- [ ] TOC 클릭 시 해당 h2로 스크롤 (`#${slug}` anchor)
- [ ] 하단 3분할 푸터 — prev/next는 collection의 인접 항목, 가운데 [의뢰하기 →]는 `/contact`로 primary CTA
- [ ] 미존재 slug 접속 시 splat 라우트로 fallback (404 응답)
- [ ] 가정 A002 완료 — `toc` 필드가 frontmatter에 자동 주입됨

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/routes/__tests__/projects.$slug.test.tsx`
  - mock container `getProjectDetail("foo")` → `{project, prev, next}` 반환
  - 본문 + meta sidebar + TOC + footer nav 렌더
  - `getProjectDetail("missing")` throw → ErrorBoundary 또는 splat 처리
- `app/presentation/components/project/__tests__/OnThisPageToc.test.tsx`
  - props `toc: [{slug, text}]` → `<a href="#${slug}">{text}</a>` 리스트 렌더
- `app/presentation/components/project/__tests__/ProjectFooterNav.test.tsx`
  - prev null → `<span>` (link 없음), next null → 동일
  - "의뢰하기 →" 항상 노출, `/contact` 링크
- velite 후처리 검증:
  - `test/integration/velite-toc-extraction.test.ts` (선택) — `bunx velite build` 후 `.velite/projects.json`의 첫 항목에 `toc: [{slug, text}]` 배열 존재

### Green
- `velite.config.ts`의 project 컬렉션에 `transform` 추가:
  ```ts
  transform: async (data) => {
    const tocItems = extractH2(data.body); // markdown ast 파싱 또는 rendered html parse
    return { ...data, toc: tocItems };
  }
  ```
  - `extractH2`는 mdast 또는 hast 통해 h2 노드 추출 → `{slug, text}` 배열 (rehype-slug가 이미 id를 부착했으므로 동일 slug 사용)
- `projects.$slug.tsx` — loader + 컴포넌트
- `ProjectMetaSidebar`, `OnThisPageToc`, `ProjectFooterNav`

### Refactor
- TOC 추출 로직을 `velite/transforms/extract-toc.ts`로 분리하여 Post에서도 재사용 가능 (T014b 활용)

## Files to Create / Modify

### Velite (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/velite.config.ts` | project 컬렉션에 `transform` 추가하여 `toc` 필드 주입. post 컬렉션도 동일 transform 재사용 (T014b) |
| `/Users/tkstart/Desktop/project/tkstar-dev/velite/transforms/extract-toc.ts` | h2 추출 helper |

### Domain (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/project/project.schema.ts` | `toc: z.array(z.object({slug, text})).optional()` 필드 추가 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/post/post.schema.ts` | 동일 (T014b 사용) |

### Presentation — Route
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/projects.$slug.tsx` | loader + UI |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/projects.$slug.test.tsx` | RTL |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/ProjectMetaSidebar.tsx` | sticky meta box |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/OnThisPageToc.tsx` | TOC anchor list |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/ProjectFooterNav.tsx` | prev/next/의뢰하기 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/__tests__/OnThisPageToc.test.tsx` | RTL |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/project/__tests__/ProjectFooterNav.test.tsx` | RTL |

## Verification Steps

### 자동
- `bun run test` — projects.$slug / OnThisPageToc / ProjectFooterNav 모두 Green
- velite build 후 `.velite/projects.json`에 `toc` 필드 존재 확인 (선택 integration test)
- `bun run typecheck` 통과

### 수동
- `wrangler dev` `/projects/example-project` → 본문 + sticky sidebar 시각 확인
- 데스크탑 ≥880px에서 스크롤 시 sidebar fixed
- 모바일 viewport에서 sidebar inline
- TOC 항목 클릭 → 해당 h2로 스크롤
- prev/next 링크 검증

### 측정
- 없음

## Dependencies
- **Depends on**: T005 (Theme), T007 (rehype-slug for h2 anchors), T008 (`getProjectDetail`), T009 (DI)
- **Blocks**: T018 (OG가 Project Detail frontmatter 사용)

## Risks & Mitigations
- **Risk**: velite transform에서 mdast 파싱 비용이 큼.
  - **Mitigation**: 빌드 타임 1회만 수행되므로 런타임 영향 없음. 콘텐츠 100+ 시 캐싱 검토.
- **Risk**: sticky sidebar가 짧은 본문에서 의도와 다르게 노출.
  - **Mitigation**: `top: 88px` + `overflow-y: auto` + `max-height: calc(100vh - 100px)` 적용.

## References
- PRD `Page-by-Page — Project Detail Page`, `F005`
- ROADMAP.md `Phase 3` Task 013, 가정 A002 완료

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-04-30 | A013 cross-ref 추가 — About 경력 timeline solo entry가 `/projects/:slug` link 진입점이 됨. 본 task 라우팅 contract만 정합성 유지. | TaekyungHa |
