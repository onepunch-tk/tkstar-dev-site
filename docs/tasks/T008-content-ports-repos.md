# T008 — feature: Application Ports + Content Repositories (Infrastructure 구현)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T002](T002-ca-4layer-skeleton.md), [T006](T006-domain-schemas.md), [T007](T007-velite-content-pipeline.md)
> **후행**: [T009](T009-di-container.md), [T010](T010-home-page.md), [T011](T011-about-page.md), [T012](T012-projects-list-page.md), [T013](T013-project-detail-page.md), [T014](T014-blog-list-rss.md), [T015](T015-legal-routes.md), [T016](T016-command-palette.md), [T017](T017-contact-form-turnstile-resend.md)

---

## 목적

Application layer 의 read-side 콘텐츠 유스케이스 (list/detail/featured/recent/related) 를 ports + services 로 정의하고, Infrastructure layer 의 velite repository 어댑터로 Domain Entity 에 매핑한다. 모든 페이지 task 가 의존하는 read-side contract 의 SoT.

## PRD Feature ID 매핑

- F004
- F005
- F006
- F007
- F014
- F017

## 입력·출력 계약

**입력**: T006 Domain entity + T007 velite `.velite/*.json`. **출력**: `app/application/content/ports/{project,post,legal}-repository.port.ts` + services 6종 + Infrastructure `velite-{project,post,legal}.repository.ts` + mappers + colocated `__tests__/`. **검증**: Application `__tests__/` (mock repo) + Infrastructure `__tests__/` (.velite fixture) 모두 Green.

## 시퀀스

```
1. Ports — `project-repository.port.ts` (findAll, findBySlug, findFeatured, findRelated, findByTag), `post-repository.port.ts` (findAll, findBySlug, findRecent(n), findByTag, findRelated), `legal-repository.port.ts` (findAppDoc, listApps)
2. Services — list-projects / get-project-detail (prev/next) / get-featured-project (F017) / list-posts / get-post-detail / get-recent-posts (F017)
3. Infrastructure — velite-{project,post,legal}.repository.ts + mappers (velite raw → Domain Entity)
4. TS4082 회피 — `scripts/patch-velite-types.mjs` 로 `.velite/index.d.ts` clean override + velite:build chained
5. vitest `resolve.tsconfigPaths` 활성화로 `~` alias 동작
6. 공통 헬퍼 3개 추출 — assertExists / sortByDateDesc / findAdjacent
7. code-reviewer Medium fix — cache `Object.freeze` + defensive copy `[...cache]`
```

## 엣지 케이스 + 구현

## Implementation Notes

- velite 0.3.1 typegen 이 Zod 3 internal 타입을 노출시켜 TS4082 폭발 → `scripts/patch-velite-types.mjs` 로 `.velite/index.d.ts` clean override 후 velite:build 에 chained.
- 4-cycle TDD: Project → Post → Legal → Refactor.
- 공통 헬퍼 3개 (assertExists / sortByDateDesc / findAdjacent) 는 services 사이 중복 제거용.
- `Object.freeze(cache)` + defensive copy `[...cache]` — code-reviewer Medium fix, cache mutation 방지.
- findRelated 의 prev/next 는 collection 정렬 후 인접 인덱스 — 마지막/첫 항목 wrap-around 안 함 (null 반환).
- findFeatured: project frontmatter `featured: true` 첫 항목.
- findRecent(n): post `date_published` DESC 정렬 후 상위 n.

## Change History from previous body

- Issue #29, PR `feature/issue-29-content-ports-repos`.
- T010~T017 모든 페이지·검색 task 가 본 task 의 services 에 의존.

## DoD

- [x] ports 3개 (project/post/legal repository) 정의
- [x] services 6개 (list-projects / get-project-detail / get-featured-project / list-posts / get-post-detail / get-recent-posts) 정의 + `__tests__/`
- [x] Infrastructure velite-{project,post,legal}.repository.ts 구현
- [x] mappers 3개 (project/post/legal) 작성 + drift 검증 테스트
- [x] Application `__tests__/` (mock repo) Green
- [x] Infrastructure `__tests__/` (.velite fixture) Green
- [x] scripts/patch-velite-types.mjs 로 TS4082 회피
- [x] 공통 헬퍼 3개 (assertExists / sortByDateDesc / findAdjacent) 추출
- [x] cache Object.freeze + defensive copy 적용 (code-reviewer Medium fix)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T008 머지 — Application ports + velite repos + 4-cycle TDD (Issue #29, branch `feature/issue-29-content-ports-repos`) | TaekyungHa |
