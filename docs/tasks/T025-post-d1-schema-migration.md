# T025 — feature: Post D1 스키마 + 첫 마이그레이션 + Domain entity 재정렬

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T024](T024-drizzle-d1-setup.md)
> **후행**: [T026](T026-post-d1-repository.md), [T027](T027-mdx-runtime-compiler-kv-cache.md), [T028](T028-post-seed-migration.md), [T030](T030-access-jwt-verifier.md), [T032](T032-admin-posts-list.md), [T036](T036-admin-post-editor-tiptap.md)

---

## 목적

Phase 7.1 의 핵심 — Blog Post 를 velite collection 에서 D1 테이블로 옮긴다. Drizzle schema 정의 + 첫 migration + Domain Post entity 재정렬 (slug / title / excerpt / body_mdx / tags / status / cover / published_at / updated_at / id 등) + post.schema.ts 의 Zod 갱신.

## PRD Feature ID 매핑

- F021
- F007

## 입력·출력 계약

**입력**: T024 의 Drizzle/D1 셋업 + T006 의 기존 Post entity. **출력**: `app/infrastructure/db/schema.ts` 의 `posts` 테이블 + `migrations/<timestamp>_init_posts.sql` + 갱신된 `app/domain/post/{post.entity.ts, post.schema.ts}` + `__tests__/` 갱신. **검증**: `bun run db:migrate:local` 성공 + posts 테이블 생성 확인, Domain `__tests__/` Green, 기존 velite post collection 은 시드 변환 전까지 read 호환.

## 시퀀스

```
1. schema.ts — `posts` 테이블 정의 (id PK, slug UNIQUE, title, excerpt, body_mdx TEXT, tags JSON, status ENUM 'draft'|'published', cover TEXT NULL, cover_alt TEXT NULL, published_at INTEGER NULL, created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL)
2. `bun run db:generate` → `migrations/<timestamp>_init_posts.sql` 생성
3. `bun run db:migrate:local` 적용 + sqlite shell 로 테이블 조회 검증
4. Domain — `post.entity.ts` 의 필드 재정렬 (cover/cover_alt 추가, status enum 도입)
5. post.schema.ts — Zod 갱신 (status enum, optional cover/cover_alt, ISO date)
6. `__tests__/post.schema.test.ts` 갱신 — status enum, optional cover 케이스 추가
7. 기존 velite posts collection 은 본 task 단계에선 유지 (T026 에서 read path 전환)
```

## 엣지 케이스 + 구현

## Implementation Notes

- status enum 채택 ('draft'|'published') — SQLite 는 enum 미지원, Drizzle `text({ enum: [...] })` 로 표현.
- timestamp 컬럼은 SQLite `INTEGER` (epoch ms) + Drizzle `integer({ mode: 'timestamp_ms' })`.
- tags 는 JSON 컬럼 (`text({ mode: 'json' })`) — D1 의 SQLite JSON1 extension 활용.
- `published_at NULL` ↔ status 'draft' 일관성은 application service 가 보장 (DB constraint 가 아닌).
- `id` 는 UUIDv7 (timestamp ordered) — 본 task 에선 application 측 생성, DB autogen 안 함.
- 기존 velite post collection 은 본 task 단계에선 read path 유지 — T026 (Repository) 와 T028 (seed migration) 까지 병존.
- 후속 T027 (MDX 런타임 컴파일) 의 input 이 본 task 의 `body_mdx` 컬럼.
- F007 (Blog 상세) 의 데이터 소스가 본 task 부터 D1 으로 전환 — T041 의 detail 페이지가 의존.

## Change History from previous body

- velite post → D1 전환의 schema 정점.
- feature branch PR: `feature/issue-N-post-d1-schema-migration`.

## DoD

- [x] schema.ts 의 posts 테이블 정의 (10+ 컬럼)
- [x] migrations/<timestamp>_init_posts.sql 생성
- [x] `bun run db:migrate:local` 적용 성공
- [x] sqlite shell 또는 D1 query 로 posts 테이블 schema 확인
- [x] Domain Post entity 의 status enum + cover/cover_alt 필드 반영
- [x] post.schema.ts Zod 갱신 + `__tests__/` Green
- [x] 기존 velite collection 병존 동작 (read path 미전환)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-05 | T025 머지 — Post D1 schema + init migration + Domain 재정렬 (branch `feature/issue-N-post-d1-schema-migration`) | TaekyungHa |
