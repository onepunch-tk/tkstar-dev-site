# T028 — chore: Post seed migration — velite → D1 데이터 이관 + velite collection 폐기

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T026](T026-post-d1-repository.md), [T027](T027-mdx-runtime-compiler-kv-cache.md)
> **후행**: [T032](T032-admin-posts-list.md)

---

## 목적

T025/T026 으로 D1 schema + Repository 가 완성된 상태에서, 기존 `content/posts/*.mdx` (velite collection) 의 실제 데이터를 D1 `posts` 테이블로 이관하고 velite posts collection 을 삭제한다. 본 task 머지 시점부터 Blog read path 의 SoT 는 D1 단일.

## PRD Feature ID 매핑

- F021
- F006
- F007
- F017

## 입력·출력 계약

**입력**: 기존 `content/posts/*.mdx` velite collection + D1 posts 테이블 (T025/T026 완성). **출력**: `scripts/seed-posts.ts` (frontmatter + body_mdx → D1 INSERT) + 실행본 + velite.config.ts 의 posts collection 제거 + `content/posts/` 디렉토리 삭제 + `.velite/posts.json` 의존성 제거. **검증**: `bun run seed:posts:local` / `:preview` / `:production` 실행 후 D1 `SELECT count(*) FROM posts` = velite 시절 카운트, Blog list/detail SSR 응답이 velite 의존 없이 200, 빌드 산출물에 `.velite/posts.json` 미포함.

## 시퀀스

```
1. scripts/seed-posts.ts — velite raw read (또는 `content/posts/*.mdx` 직접 frontmatter parse) → posts 테이블 INSERT (id UUIDv7, slug, body_mdx, tags JSON, status 'published', published_at, created_at, updated_at)
2. seed 멱등성 — slug UNIQUE constraint 활용, ON CONFLICT DO UPDATE (upsert) 채택
3. MEMORY.md 의 `wrangler d1 OAuth 회귀 워크어라운드` (`--command="$(cat seed.sql)"`) 적용 여부 확인 (wrangler 버전 4.85~4.87 시 필수)
4. package.json scripts — `seed:posts:local` / `:preview` / `:production` 3종
5. velite.config.ts — posts collection 정의 삭제
6. container.ts / Application services — velite-post.repository import 0건 확인 (T026 에서 이미 swap 완료, 본 task 는 코드 제거)
7. content/posts/ 디렉토리 삭제 + `.velite/posts.json` lifecycle 영향 점검
8. Vitest — Blog list/detail 통합 테스트가 velite fixture 없이 D1 fixture 만으로 Green
```

## 엣지 케이스 + 구현

## Implementation Notes

- 본 task 가 머지되어야 Blog read path 가 단일 SoT 로 정리됨 — T026 만 머지된 상태에선 velite + D1 이중 코드가 잔존.
- seed 멱등성: upsert 채택. seed 스크립트는 CI 가 아닌 1회 수동 실행 + 운영 중엔 admin (T032+) 이 직접 작성.
- velite posts collection 제거 시 `.velite/posts.json` 도 더 이상 빌드되지 않음 — vitest/typecheck 의 stale 참조 점검.
- legacy markdown body 가 MDX 문법 위반 시 seed 실패 → 콘텐츠 측 정리 필요. seed log 에 slug 별 결과 표시.
- production 시드는 한 번만 — 이후 admin 으로 직접 작성.
- `wrangler d1 execute --remote --file=` OAuth 회귀 (MEMORY.md) — wrangler 버전 확인 후 `--command="$(cat ...)"` 우회 적용 여부 결정.
- 본 task 머지 후 T032 (Admin Posts List) 가 D1 의 실제 데이터를 표시 가능.

## Change History from previous body

- chore branch PR: `chore/post-seed-migration`.
- T026 (Repository swap) + T027 (런타임 컴파일) 머지 후 진입.

## DoD

- [x] scripts/seed-posts.ts 작성 + 멱등 upsert
- [x] package.json 의 seed:posts:{local,preview,production} 3 scripts
- [x] `bun run seed:posts:local` 실행 후 D1 posts count = 기존 velite count
- [x] velite.config.ts 의 posts collection 제거
- [x] content/posts/ 디렉토리 삭제
- [x] velite-post.repository import 0건 (grep 검증)
- [x] Blog list/detail SSR 응답 200 (velite 의존 없음)
- [x] Vitest 통합 테스트 D1 fixture only Green
- [x] production seed 1회 실행 + 색인 페이지 일치 확인

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-13 | Post seed migration — scripts/seed-posts.ts (Drizzle .onConflictDoUpdate inline) + package.json seed:posts:{local,preview,production} + 기존 migrate-posts-to-d1 자산 제거 | TaekyungHa |
