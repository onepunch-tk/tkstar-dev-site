# Task 014b — Blog Detail Page (F007) — 본문 + sticky sidebar + share

| Field | Value |
|-------|-------|
| **Task ID** | T014b |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation |
| **Branch** | `feature/issue-N-blog-detail` |
| **Depends on** | T014a |
| **Blocks** | T018 |
| **PRD Features** | **F007** (Blog 상세) |
| **PRD AC** | — (UI 표시 위주) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
`/blog/:slug` 상세 페이지를 MDX 본문 + shiki 코드블록 + 데스크탑 880px+ sticky sidebar(TOC + share)로 구현하고, 하단 3분할 네비(`← prev` / `[모든 글]` / `next →`)을 가동시킨다.

## Context
- **Why**: 글 단위 SEO 진입점. 외부 검색에서 직접 도달하는 첫 페이지로 자주 동작. share 도구는 X 공유 + copy link로 셀프 promotion 가능.
- **Phase 진입/완료 연결**: T014a Done 후. T014b Done이면 T018 OG가 Blog frontmatter 사용 가능.
- **관련 PRD 섹션**: PRD `Page-by-Page — Blog Detail Page`, `F007`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/blog.$slug.tsx`, `app/presentation/components/post/ShareTools.tsx`

## Scope

### In Scope
- `blog.$slug.tsx` loader: `getPostDetail(slug)` 호출 → `{post, prev, next}`, 미존재 throw → splat fallback
- MDX 본문 + shiki 코드블록 (T007에서 가동)
- T013의 `<OnThisPageToc />` 재사용 (post에도 `toc` 필드 transform — T013에서 추가됨)
- `<ShareTools />` — copy link 버튼 (`navigator.clipboard.writeText`) + X 공유 링크 (`https://x.com/intent/post?text=...&url=...`)
- 하단 3분할 (`← prev` / `[모든 글] → /blog` / `next →`)
- 데스크탑 880px+에서 sticky sidebar(TOC + share)

### Out of Scope
- Satori OG (T018)
- 페이지별 meta export (T019)

## Acceptance Criteria
- [ ] `/blog/:slug` 진입 시 본문 + shiki 코드블록 렌더
- [ ] 데스크탑 880px+에서 sticky sidebar(TOC + share) 노출
- [ ] copy link 버튼 클릭 시 `navigator.clipboard.writeText` 호출 + 시각 피드백 ("복사됨" toast 또는 inline)
- [ ] X 공유 링크가 `https://x.com/intent/post?text=<title>&url=<canonical>` 형식
- [ ] 하단 3분할 (`← prev` / `[모든 글]` / `next →`) — prev/next는 collection 인접 항목, 미존재 시 `<span>`
- [ ] 미존재 slug 접속 시 splat fallback

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/routes/__tests__/blog.$slug.test.tsx`
  - mock container `getPostDetail("foo")` → `{post, prev, next}` 정상 케이스
  - 미존재 slug → throw → ErrorBoundary
  - 본문 + sidebar + footer 3 섹션 모두 렌더
- `app/presentation/components/post/__tests__/ShareTools.test.tsx`
  - copy link 클릭 → `navigator.clipboard.writeText` mock이 정확한 URL로 호출
  - X 공유 링크의 `href` 값 검증 (`startsWith("https://x.com/intent/post?")` + `text` + `url` 쿼리 포함)

### Green
- `blog.$slug.tsx` — loader + 컴포넌트
- `<ShareTools />` — copy link + X 공유
- `<OnThisPageToc />` 재사용 (post용)
- `<PostFooterNav />` (또는 generic `<DetailFooterNav />`로 ProjectFooterNav와 통합)

### Refactor
- `<DetailFooterNav />` 통합 컴포넌트 (project/post 공통) — props로 prev/next/center variant
- `<OnThisPageToc />`를 component-level로 추출

## Files to Create / Modify

### Presentation — Route
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/blog.$slug.tsx` | loader + UI |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/blog.$slug.test.tsx` | RTL |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/post/ShareTools.tsx` | copy link + X 공유 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/post/__tests__/ShareTools.test.tsx` | RTL + clipboard mock |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/post/PostFooterNav.tsx` (or shared `<DetailFooterNav />`) | 3분할 footer |

## Verification Steps

### 자동
- `bun run test` — `blog.$slug` + `ShareTools` 모두 Green
- `bun run typecheck` 통과

### 수동
- `wrangler dev` `/blog/2026-04-shipping-solo` → 본문 + 코드블록 + sticky sidebar 시각 확인
- copy link 클릭 → 클립보드에 URL 복사
- X 공유 링크 클릭 → X 새 창 + prefill text/url
- 모바일에서 sidebar inline

### 측정
- 없음

## Dependencies
- **Depends on**: T014a (PostRow / RSS / blog list)
- **Blocks**: T018 (OG)

## Risks & Mitigations
- **Risk**: `navigator.clipboard.writeText`가 Safari에서 user gesture 외 호출 시 reject.
  - **Mitigation**: 반드시 click handler 안에서 호출.
- **Risk**: shiki 출력이 Cloudflare Workers SSR에서 dehydrate-rehydrate 사이클에 mismatch 위험.
  - **Mitigation**: shiki는 빌드 타임 산출물이므로 SSR에서도 동일 HTML 문자열 → mismatch 없음.

## References
- PRD `Page-by-Page — Blog Detail Page`, `F007`
- ROADMAP.md `Phase 3` Task 014b (검증 리포트 Issue #4 분할)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
