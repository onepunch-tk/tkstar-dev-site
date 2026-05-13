# T025 — Domain Post entity D1 재정의 + D1PostRepository (Infrastructure)

> **Status**: Completed
> **Issue**: #92
> **PR**: TBD (브랜치: `feature/issue-92-d1-post-repository`)
> **Phase**: 7.1 — CMS 인프라 / Read Path First
> **Depends on**: T024 (#91 — D1 schema + binding 토대)
> **Blocks**: T026 (MDX → D1 seed), T027 (runtime MDX compiler + KV cache), T028 (Blog routes D1 wiring)

## Goal

T024 가 깐 D1 schema (`posts` 10 컬럼) 위에 Post Read Path 를 D1 으로 전환한다.
- Domain `Post` entity 를 D1 schema 와 1:1 정합으로 재정의 (snake_case ↔ camelCase 매핑)
- `raw_markdown` 본문은 entity 외부의 별도 메서드 (`findBodyBySlug`) 로 분리해 list 호출 시 본문 fetch 비용을 제거 (메타데이터 only entity)
- velite Post collection 정본 폐기 — 본문 정본은 D1 으로 단방향 이관

## Field Mapping

| D1 (snake_case) | Domain TS (camelCase) | Type | 비고 |
|---|---|---|---|
| `slug` | `slug` | `string` | unique |
| `title` | `title` | `string` |  |
| `summary` | `summary` | `string \| null` |  |
| `raw_markdown` | (entity 제외) | `string` | `findBodyBySlug` 만 fetch |
| `tags` | `tags` | `string[]` | DB JSON string → mapper에서 `JSON.parse` |
| `date_published` | `datePublished` | `string \| null` | ISO 8601 (draft 시점 null 허용) |
| `status` | `status` | `'draft' \| 'published'` | enum |
| `created_at` | `createdAt` | `number` | unix epoch |
| `updated_at` | `updatedAt` | `number` | unix epoch |

## Architectural Decisions (Phase 0 인터뷰 7회 합의)

1. **Field naming**: D1 = snake_case 유지 / TS Domain · mapper · DTO = camelCase. Mapper (`post-row.mapper.ts`) 가 변환 책임.
2. **메타데이터 only entity**: `Post` 는 본문 (`rawMarkdown`) 을 포함하지 않는다. 본문 + TOC 는 `findBodyBySlug(slug, options?)` 가 별도 반환. List 화면에서 본문 fetch 비용 0.
3. **Status filter**: 모든 read 메서드에 `options?: { status?: 'draft' | 'published' | 'all' }` 파라미터. Default `'published'`. `'all'` 은 admin 전용.
4. **Factory pattern**: `createD1PostRepository(db: SQLiteDb): PostRepository` — production `drizzle(env.DB)` (D1) / test `drizzle(better-sqlite3 in-memory)` 둘 다 동일 인터페이스.
5. **velite Post 폐기**: `velite.config.ts` 의 `posts` collection 제거, `velite-post.repository.ts` / `mappers/post.mapper.ts` 삭제, `complete` hook 의 `buildSearchIndex` 호출에 `posts: []` 안전 처리 (T026 seed 전까지 transient state).
6. **UX 변경**: `read` (예상 독서 시간) 필드 폐기, 자리에 `formatRelativeTime(updatedAt)` 영문 표기 (`5d ago` 등). 단일 필드 기반 항상 표시.
7. **D1 test infra**: `better-sqlite3` (devDep) + `drizzle-orm/better-sqlite3` in-memory + `migrations/` 디렉토리 직접 적용.
8. **findRelated default**: `status='published'` 만 prev/next 후보.

## Implementation

### Domain
- `app/domain/post/post.schema.ts` — `slug, title, summary, datePublished, tags, status, createdAt, updatedAt` (camelCase, status enum, datePublished/summary nullable, createdAt/updatedAt unix epoch number)
- `app/domain/post/post.entity.ts` — `z.infer` 그대로 (변경 없음)

### Application
- `app/application/content/ports/post-repository.port.ts`
  - 모든 read 메서드 `options?: { status?: PostStatusFilter }` 파라미터 추가
  - 신규 `findBodyBySlug(slug, options?): Promise<{ body: string; toc: TocEntry[] } | null>`
- `services/get-post-detail.service.ts` — `findBySlug + findBodyBySlug + findRelated` 를 `Promise.all` 로 병렬 fetch, `{ post, body, toc, prev, next }` 반환
- `services/build-rss-feed.service.ts` / `seo/services/build-sitemap.service.ts` / `og/services/render-post-og.service.ts` — `lede→summary`, `date→datePublished`, fallback (`createdAt → ISO`) 처리

### Infrastructure
- `app/infrastructure/db/d1-post.repository.ts` — Drizzle generic `BaseSQLiteDatabase` factory. status 조건은 모든 메서드 공통 helper 로 처리.
- `app/infrastructure/db/mappers/post-row.mapper.ts` — D1 row → `Post` (snake → camel + `JSON.parse(tags)`)
- `app/infrastructure/db/mappers/extract-toc.ts` — markdown `## heading` → `[{slug, text}]` (github-slugger 사용, `velite/transforms/extract-toc.ts` 에서 이전)
- `app/infrastructure/db/__tests__/_helpers/in-memory-d1.ts` — `createInMemoryD1()` (`better-sqlite3` + `drizzle-orm/better-sqlite3` + `migrations/` 적용)
- 삭제: `velite-post.repository.ts`, `mappers/post.mapper.ts`, 관련 테스트 4 파일
- `infrastructure/config/container.ts` — `createD1PostRepository(drizzle(env.DB))` 로 교체. `getPostDetail` Container 시그니처에 `body / toc` 추가.

### Presentation (UI)
- `lib/format-relative-time.ts` (신규) — `formatRelativeTime(ts, now?): string` 영문 (`just now / Nm ago / Nh ago / Nd ago / Nw ago / Nmo ago / Ny ago`)
- `components/post/PostRow.tsx`, `components/home/RecentPostsList.tsx` — `lede→summary`, `formatDate(date)→formatDate(datePublished)`, `{read} min` → `formatRelativeTime(updatedAt)`
- `routes/blog.$slug.tsx` — `post.summary`, `loaderData.toc` (entity 외부 분리)
- `lib/jsonld.ts` — `description: post.summary`, `datePublished: post.datePublished` (fallback 포함)

### Build / Config
- `velite.config.ts` — `posts` collection 제거, `complete` hook 에 `posts: []` 안전 처리
- `package.json` — `+ better-sqlite3` (devDep), `+ @types/better-sqlite3` (devDep)
- `app/__tests__/fixtures/velite-posts.fixture.ts` — D1 Post entity (camelCase) 형태로 재정의

## Verification

- [x] `bun run typecheck` exit 0
- [x] `bun run lint` exit 0
- [x] `bun run test` exit 0 (502/502 pass)
- [x] D1 in-memory repository test 18/18 pass
- [x] formatRelativeTime util 8/8 pass
- [x] Post schema test 11/11 pass

## Transient State (T026 seed 전까지)

- production /blog 는 **빈 상태** — D1 의 `posts` 테이블이 비어있다.
- T024 의 `--remote` migration 사용자 수동 적용 + T026 의 MDX → D1 seed 가 완료되어야 production /blog 콘텐츠 복원.
- preview/staging 은 동일하게 빈 상태. dev (`miniflare local D1`) 는 `bunx wrangler d1 execute tkstar-dev-db-preview --local --command="INSERT ..."` 로 수동 INSERT 후 검증 가능.

## Out of Scope

- 기존 MDX → D1 데이터 INSERT (T026)
- MDX runtime 컴파일러 + KV cache (T027)
- Blog 라우트 D1 통합 검증 + RSS·sitemap·search published-only 강화 (T028)
- `--remote` production migration apply (T024 머지 후 사용자 수동, T026 시작 전 완료)

## References

- ROADMAP: `docs/ROADMAP.md` Phase 7.1 Task 025
- PRD: F021 D1 Post Storage (AC-F021-3/4/5)
- Glossary: `docs/glossary.md` — Post, PostStatus
- Plan file: `~/.claude/plans/quiet-petting-galaxy.md`
