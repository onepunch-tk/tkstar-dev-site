# T041 — feature: Blog Detail Page (F007) — D1 데이터 + MDX 런타임 + Related/PrevNext

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T007](T007-velite-content-pipeline.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md), [T014](T014-blog-list-rss.md)
> **후행**: [T019](T019-seo-sitemap-robots-jsonld.md), [T021](T021-qa-lighthouse-axe.md)

---

## 목적

Blog 상세 라우트 (`/blog/$slug`) 를 채운다 — D1 의 post 본문을 MdxRenderer (또는 T027 의 런타임 컴파일러) 로 렌더, 발행일/태그/cover/excerpt 헤더, Related 2-3개, prev/next 인접 포스트 네비게이션. F007 의 모든 AC 충족.

## PRD Feature ID 매핑

- F007
- F018

## 입력·출력 계약

**입력**: T009 container 의 `getPostDetail({ slug })` → `{ post, prev, next, related }`. **출력**: `app/presentation/routes/blog.$slug.tsx` loader + `BlogPostArticle.tsx` + `RelatedPosts.tsx` + `PrevNextNav.tsx` 재사용 (T013) + meta + 404. **검증**: RTL — body 렌더, related 카드, prev/next null safe, slug 미존재 404, MDX heading anchor 동작, og:image 절대 URL 정확.

## 시퀀스

```
1. blog.$slug.tsx loader — `params.slug` 로 getPostDetail 호출, draft 제외, 미존재 → 404
2. BlogPostArticle.tsx — title / published date / tags / cover (선택) / body MdxRenderer + 본문 내 heading anchor
3. RelatedPosts.tsx — 동일 tag 점수 상위 2-3개
4. PrevNextNav.tsx 재사용 — published_at DESC 순으로 prev/next 결정, 첫/마지막 null safe
5. page meta — title `<Post Title> | Blog | tkstar.dev`, og:image `/og/blog/$slug.png` (T018 endpoint)
6. JSON-LD Article — headline / datePublished / dateModified / author / image (T019 에서 통합)
7. RTL — 본문 + related + prev/next + 404 + meta og:image
```

## 엣지 케이스 + 구현

## Implementation Notes

- 본 task 는 ROADMAP order 상 P3 (Phase 3) 에 속함 — 다만 P7.1 의 T026 이후 데이터 소스가 D1 으로 바뀜. 본 task 자체는 service port (`getPostDetail`) 의존이므로 변경 없음.
- 기존 docs/tasks/T014b 와 동일한 책임 — Blog Detail 페이지 분리.
- post 의 `cover` 가 null 이면 헤더에 cover 비표시 — null safe.
- draft post 는 미존재 취급 (404) — admin preview 는 별도 라우트 (`/admin/posts/<id>/preview`) 로 T032 에서.
- MdxRenderer 의 한글 typography — Tailwind `prose prose-neutral` + 한국어 행간 보정 (line-height 1.8).
- Related 점수 0건 시 RelatedPosts 섹션 비표시.
- prev/next 정렬 기준은 `published_at DESC` (Project 의 sort 와 다름).
- F018 (sitemap / JSON-LD) 는 T019 에서 본 task 의 slug 들을 수집.
- T021 QA 단계에서 본 task 의 Lighthouse Accessibility 검증.

## Change History from previous body

- feature branch PR: `feature/issue-N-blog-detail-page` (구 docs/tasks/T014b).
- T014 (Blog list) 와 T013 (Project detail) 의 페어 task.

## DoD

- [x] /blog/$slug 직접 접근 시 본문 SSR 렌더
- [x] draft post 는 404 응답
- [x] MdxRenderer 로 body 렌더 + heading anchor 동작
- [x] RelatedPosts 2-3개 + 0건 시 비표시
- [x] PrevNextNav null safe (첫/마지막)
- [x] meta og:image absolute `/og/blog/$slug.png`
- [x] title / date / tags / cover 헤더 정확
- [x] RTL 5 케이스 (본문/related/prev-next/404/meta) Green

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T041 머지 — Blog detail F007 (branch `feature/issue-N-blog-detail-page`, 구 docs/tasks/T014b) | TaekyungHa |
