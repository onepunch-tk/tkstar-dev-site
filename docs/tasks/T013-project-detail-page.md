# T013 — feature: Project Detail Page (F005 Case Study + Related + prev/next)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T007](T007-velite-content-pipeline.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md), [T012](T012-projects-list-page.md)
> **후행**: none

---

## 목적

Project Case Study 라우트를 채운다 — TL;DR / Problem / Approach / Decisions / Trade-offs / Result / Stack / Links 섹션 + Related Projects 2-4개 + prev/next 인접 프로젝트 네비게이션. velite project body → MdxRenderer 로 렌더.

## PRD Feature ID 매핑

- F005
- F018

## 입력·출력 계약

**입력**: T009 container 의 `getProjectDetail({ slug })` → `{ project, prev, next, related }`. **출력**: `app/presentation/routes/projects.$slug.tsx` loader + `ProjectCaseStudy.tsx` + `RelatedProjects.tsx` + `PrevNextNav.tsx` + meta + 404 처리. **검증**: RTL 본문 + Related 카드 + prev/next 링크 정확, slug 미존재 시 404 응답, MDX body 의 heading id (rehype-slug) anchor 동작.

## 시퀀스

```
1. projects.$slug.tsx loader — `params.slug` 로 getProjectDetail 호출, `ProjectNotFoundError` catch → `throw new Response(null, { status: 404 })`
2. ProjectCaseStudy.tsx — TL;DR / Problem / Approach / Decisions / Trade-offs / Result / Stack / Links 섹션 + MdxRenderer 로 body 렌더
3. RelatedProjects.tsx — getProjectDetail 가 반환한 related 2-4개 카드
4. PrevNextNav.tsx — prev/next 인접 프로젝트 링크 (null safe — 첫/마지막 항목은 비표시)
5. page meta — title `<Project Title> | Projects | tkstar.dev` + og image `/og/projects/$slug.png` placeholder (T018 에서 실제 생성)
6. RTL 테스트 — body 렌더 + related 카드수 + prev/next null safe + 404 응답
```

## 엣지 케이스 + 구현

## Implementation Notes

- prev/next 의 wrap-around 안 함 — 첫 항목은 prev=null, 마지막은 next=null. 컴포넌트에서 null 체크 후 비표시.
- Related 산정 로직: `findRelated` service 가 동일 tag 교집합 수로 점수 매김 → 상위 2-4개. 점수 0건이면 빈 배열.
- 404 처리: React Router v7 의 `throw new Response(null, { status: 404 })` + 라우트 ErrorBoundary 또는 T004 splat 으로 위임. 본 task 는 throw 만.
- MDX body 의 heading anchor 는 T007 의 rehype-slug 가 이미 처리 — 본 task 는 link prefix `#` 만 추가 (A002 1단계).
- og:image meta 는 placeholder URL `/og/projects/$slug.png` 만 — 실제 PNG endpoint 는 T018 에서.
- structured data (JSON-LD) 는 T019 에서.

## Change History from previous body

- feature branch PR: `feature/issue-N-project-detail-page`.
- A002 1단계 (rehype-slug heading anchor) 의 소비자.

## DoD

- [x] loader 가 getProjectDetail 호출 + 미존재 slug 404 응답
- [x] Case Study 8 섹션 (TL;DR ~ Links) 모두 렌더
- [x] MdxRenderer 로 body 렌더 + heading anchor 동작
- [x] RelatedProjects 2-4개 카드 렌더 + 0건 시 비표시
- [x] PrevNextNav null safe (첫/마지막 항목)
- [x] meta og:image placeholder `/og/projects/$slug.png` 정의

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T013 머지 — Project detail F005 + Related + prev/next (branch `feature/issue-N-project-detail-page`) | TaekyungHa |
