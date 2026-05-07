# T026 — 기존 MDX → D1 일회성 마이그레이션 스크립트

> **Status**: ✅ Done
> **Issue**: #94
> **PR**: TBD (브랜치: `chore/issue-94-migrate-posts-to-d1`)
> **Phase**: 7.1 — CMS 인프라 / Read Path First
> **Depends on**: T024 (#91 — D1 schema + binding), T025 (#93 — D1PostRepository)
> **Blocks**: T028 (Blog routes D1 wiring)

## Goal

T025 가 velite Post collection 을 폐기하고 D1 `posts` 테이블 정본 전환을 완료했지만, 기존 `content/posts/2026-04-shipping-solo.mdx` 1건의 데이터가 D1 으로 옮겨지지 않아 production /blog 가 빈 상태 (T025 *Transient State* 명시). T026 은 그 데이터 갭을 메우는 일회성 SQL seed 생성기 + 단위 테스트 + 1회 실행 산출물 (`scripts/seeds/posts-initial.sql`) 을 commit 하고, `content/posts/` 디렉토리를 같은 PR 에서 정리한다.

## Decisions (Phase 0 Confirmed)

1. **실행 형태**: SQL seed emit + 사용자 수동 `wrangler d1 execute --file=` 적용 (자동 INSERT X — production `--remote` 는 PR 머지 후 사용자 수동)
2. **Seed 위치**: `scripts/seeds/posts-initial.sql` — drizzle `migrations/` 와 분리. T028 머지 + production /blog UI 검증 완료 시 별도 PR 로 제거 예정 (본 PR 범위 外)
3. **Frontmatter 매핑**: `slug→slug`, `title→title`, `lede→summary`, `tags→tags(JSON.stringify)`, `date→date_published`, `read→폐기`, `status='published'` 고정, `created_at=updated_at=Date.now()/1000`. 필수 필드 (`slug`/`title`/`tags`/`date`) 누락 시 fail-fast (즉시 throw)
4. **gray-matter**: devDep
5. **단일 PR**: 스크립트 + 테스트 + seed.sql commit + `content/posts/` 삭제 + ROADMAP 체크박스 sync

## 산출물

- `scripts/migrate-posts-to-d1.ts` — gray-matter 파싱 → INSERT SQL 빌드. CLI flags: `--out=<path>` / `--dry-run` / `--source=<dir>`
- `scripts/__tests__/migrate-posts-to-d1.test.ts` — 16 테스트 (parseMdxFile 8 + buildInsertSql 8)
- `scripts/seeds/posts-initial.sql` — 1행 INSERT (1회 실행 산출). T028 검증 후 제거 예정
- `package.json` — `+ gray-matter@^4.0.3` (devDependency)
- `vitest.config.ts` — `include` glob에 `scripts/**` 추가, coverage exclude 에 `scripts/**` 추가
- `content/posts/` 삭제 (`2026-04-shipping-solo.mdx` 포함)
- `docs/ROADMAP.md` T026 체크박스 [x] sync

## Verification

| 검증 단계 | 결과 |
|---|---|
| `bun run test scripts/__tests__/migrate-posts-to-d1.test.ts` | 16/16 ✅ |
| `bun run test` (전체) | 518/518 ✅ |
| `bun run typecheck` | exit 0 ✅ |
| `bun run lint` | exit 0 ✅ |
| `bun run scripts/migrate-posts-to-d1.ts --out=scripts/seeds/posts-initial.sql` | 1행 ✅ |
| `bunx wrangler d1 execute tkstar-dev-db-preview --local --file=scripts/seeds/posts-initial.sql` | success ✅ |
| `SELECT slug, title, status FROM posts` (local) | 1행 (`2026-04-shipping-solo` / 1인 기업으로 출발하기 / published) ✅ |

## Remote Apply (사용자 수동, PR 머지 후)

```bash
bunx wrangler d1 execute tkstar-dev-db --remote --file=scripts/seeds/posts-initial.sql
bunx wrangler d1 execute tkstar-dev-db --remote --command="SELECT slug, title, status FROM posts"
```

## Out of Scope

- Workers runtime 마이그레이션 자동 실행 (스크립트는 build/CI 시점만)
- production `--remote` 자동 적용 (사용자 수동, 위 커맨드 명시)
- T028 (Blog routes D1 wiring) — read path UI 통합은 별도 task
- seed 파일 제거 PR — T028 머지 + production /blog UI 검증 완료 후 별도 PR
- `docs/reports/post-migration-{date}.md` — 1건 마이그레이션이라 PR 본문 요약으로 대체 (Phase 0 confirmed)
