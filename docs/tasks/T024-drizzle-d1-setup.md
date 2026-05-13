# T024 — feature: Drizzle ORM + D1 binding + schema 모듈 + migration 환경 셋업

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T023](T023-cms-bundling-poc.md)
> **후행**: [T025](T025-post-d1-schema-migration.md), [T038](T038-project-meta-d1-split.md)

---

## 목적

Phase 7.x 의 데이터 백본인 Cloudflare D1 + Drizzle ORM 을 도입하고, 마이그레이션 파이프라인을 가동시킨다. 본 task 자체엔 테이블이 1개도 정의되어 있지 않아도 무방 — D1 binding + drizzle.config.ts + migration script + dev/preview/production 3-env 가 동작하면 통과.

## PRD Feature ID 매핑

- F021

## 입력·출력 계약

**입력**: T023 의 nodejs_compat + Drizzle 호환성 확인본. **출력**: `wrangler.toml [[d1_databases]] binding=DB database_name=tkstar-dev` + `drizzle.config.ts` + `app/infrastructure/db/{client.ts, schema.ts}` + `migrations/` 디렉토리 + bun scripts (`db:generate`, `db:migrate:local`, `db:migrate:preview`, `db:migrate:production`). **검증**: `bun run db:migrate:local` 성공, drizzle-kit generate 가 빈 마이그레이션 파일 생성 (테이블 없음), Workers fetch handler 에서 `env.DB` binding 접근 가능.

## 시퀀스

```
1. Cloudflare dashboard 또는 wrangler 로 D1 database 3개 생성 — `tkstar-dev-local`, `tkstar-dev-preview`, `tkstar-dev-production` (또는 단일 DB + env 분기)
2. wrangler.toml 의 dev / preview / production 각각 `[[d1_databases]] binding=DB database_id=...` 등록
3. drizzle.config.ts — `dialect: 'sqlite'`, `driver: 'd1-http'` (production) 또는 `better-sqlite' (local)`, schema path `app/infrastructure/db/schema.ts`
4. app/infrastructure/db/client.ts — `drizzle(env.DB, { schema })` factory + container 에 주입 준비 (실제 wiring 은 T025 에서)
5. app/infrastructure/db/schema.ts — 빈 placeholder export (테이블은 T025/T038 에서 추가)
6. package.json scripts — `db:generate` / `db:migrate:local` / `db:migrate:preview` / `db:migrate:production` 4종
7. migrations/ 디렉토리 생성 (drizzle-kit 자동 관리)
8. bun run db:migrate:local 실행 → 빈 마이그레이션 적용 확인
9. MEMORY.md 의 wrangler d1 OAuth 회귀 워크어라운드 (`--command=$(cat)`) 검토 — 본 task 단계에선 미해당 (테이블 없음)
```

## 엣지 케이스 + 구현

## Implementation Notes

- D1 dev/preview/production 분리 전략: 단일 DB + env vars 분기 vs 3개 분리 DB. 1인 사이트 + 데이터 양 적음 → 3개 분리 채택 (실수로 dev 가 production 덮어쓰기 방지).
- drizzle-kit 의 `--driver d1-http` 는 Cloudflare API 키 필요 — secret 으로 관리, CI 에서만 production migration 실행.
- local migration 은 `wrangler d1 migrations apply --local` 또는 drizzle-kit `push:sqlite` — wrangler 권장.
- MEMORY.md 의 `wrangler d1 --remote --file=` OAuth 회귀 (4.85 확인 / 4.88 changelog 패치) — 본 task 시점의 wrangler 버전 확인 후 `--command="$(cat seed.sql)"` 우회 필요 여부 판단.
- D1 binding 명은 `DB` (default) — 본 task 외부에서 `env.DB.prepare(...)` 직접 접근 가능.
- schema.ts 의 빈 export — 테이블은 T025 (posts) / T038 (project_meta) 에서 추가됨.
- container 의 PostRepository 주입은 T025 에서. 본 task 는 client factory 만.
- migration 파일은 git tracked — drizzle-kit 자동 생성 후 PR 에 포함.

## Change History from previous body

- F021 (D1 Post Storage) 인프라 셋업 완료.
- feature branch PR: `feature/issue-N-drizzle-d1-setup`.

## DoD

- [x] wrangler.toml dev/preview/production 각 env 의 D1 binding 등록
- [x] drizzle.config.ts 작성 + schema path 정의
- [x] app/infrastructure/db/{client,schema}.ts 작성 (빈 schema OK)
- [x] package.json 의 db:generate / db:migrate:{local,preview,production} 4 scripts
- [x] `bun run db:migrate:local` 성공
- [x] Workers fetch handler 에서 env.DB 접근 가능 (typecheck Green)
- [x] wrangler d1 OAuth 회귀 워크어라운드 (필요 시) 적용 확인

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-04 | T024 머지 — Drizzle + D1 셋업 + 3-env 분리 (branch `feature/issue-N-drizzle-d1-setup`) | TaekyungHa |
