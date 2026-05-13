# T026 — feature: PostRepository D1 어댑터 + Application service 전환

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T025](T025-post-d1-schema-migration.md)
> **후행**: [T027](T027-mdx-runtime-compiler-kv-cache.md), [T028](T028-post-seed-migration.md)

---

## 목적

T025 의 D1 schema 위에 PostRepository 의 D1 어댑터를 작성하고, 기존 velite repository 를 교체한다. Application services (listPosts / getPostDetail / getRecentPosts) 는 port 만 의존하므로 변경 없음 — DI container 에서 어댑터 swap.

## PRD Feature ID 매핑

- F021
- F006
- F007
- F017

## 입력·출력 계약

**입력**: T025 의 posts 테이블 + T008 의 PostRepository port. **출력**: `app/infrastructure/db/post.repository.ts` (D1 Drizzle 구현) + `container.ts` 에서 velite → D1 어댑터 swap + `__tests__/post.repository.integration.test.ts` (Miniflare D1). **검증**: 통합 테스트 Green (findAll / findBySlug / findRecent / findByTag / findRelated 5 메서드), 기존 services `__tests__/` (mock repo) 도 여전히 Green.

## 시퀀스

```
1. app/infrastructure/db/post.repository.ts — Drizzle query 로 PostRepository port 구현
2. findAll({ tag?, status='published', draft?: false }) — status filter + tag JSON contains
3. findBySlug(slug) — slug = ? AND status = 'published' (admin 은 별도 port 분리는 T032 에서)
4. findRecent(n) — published_at DESC LIMIT n
5. findByTag(tag) — tags JSON1 contains
6. findRelated(slug) — 동일 tag 교집합 수 점수, 자기 자신 제외
7. container.ts — velite-post.repository 대신 d1-post.repository 주입
8. `__tests__/post.repository.integration.test.ts` — Miniflare D1 fixture + seed → 5 메서드 검증
9. 기존 services `__tests__/` (mock repo) 변화 없음 확인
10. T014 (Blog list) / T041 (Blog detail) 의 SSR 응답이 D1 데이터로 동작하는지 dev 환경에서 수동 확인
```

## 엣지 케이스 + 구현

## Implementation Notes

- Drizzle 의 JSON contains 쿼리: SQLite JSON1 의 `json_each` 활용 또는 LIKE 로 fallback. D1 의 JSON1 사용 가능성 확인 — 1인 사이트라 LIKE fallback 도 허용.
- findBySlug 가 draft 도 반환할지 — 본 task 는 published 만. admin preview 는 별도 port (`AdminPostRepository`) 로 T032 에서 분리.
- findRelated 의 점수 알고리즘 — T008 의 velite 구현과 동일 (tag 교집합 수). N+1 회피를 위해 단일 query 로 처리.
- Miniflare D1 fixture — `vitest-pool-workers` 또는 `wrangler` 의 local SQLite + drizzle migrations apply.
- T028 (seed migration) 이 완료될 때까지 D1 에 실제 데이터는 없을 수 있음 — 본 task 의 통합 테스트는 자체 seed fixture 사용.
- velite posts collection 코드는 T028 까지 제거 보류 — read path 검증 후 일괄 제거.
- F006 / F007 / F017 데이터 소스가 본 task 부터 D1.

## Change History from previous body

- feature branch PR: `feature/issue-N-post-d1-repository`.
- T027 (MDX 런타임) 가 본 task 의 `findBySlug` 결과 `body_mdx` 를 컴파일.

## DoD

- [x] post.repository.ts 의 5 메서드 (findAll / findBySlug / findRecent / findByTag / findRelated) 구현
- [x] container.ts 에서 velite → D1 어댑터 swap
- [x] Miniflare D1 통합 테스트 5 메서드 Green
- [x] 기존 services `__tests__/` (mock repo) 여전히 Green
- [x] dev 환경 수동 검증 — Blog list/detail 이 D1 데이터로 응답
- [x] findBySlug 가 published 만 반환 (draft 제외)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-06 | T026 머지 — D1 PostRepository + container swap + 통합 테스트 (branch `feature/issue-N-post-d1-repository`) | TaekyungHa |
