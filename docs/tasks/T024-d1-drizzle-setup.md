# Task 024 — Cloudflare D1 + Drizzle ORM 셋업 + posts schema migration

| Field | Value |
|-------|-------|
| **Task ID** | T024 |
| **Phase** | Phase 7.1 — Read Path First (CMS 인프라 — D1 데이터 정본 구축의 첫 스키마 PR) |
| **Layer** | Infrastructure (db) + 운영 (wrangler binding) |
| **Branch** | `feature/issue-90-d1-drizzle-setup` |
| **Issue** | #90 |
| **Depends on** | T023 |
| **Blocks** | T025 (D1PostRepository), T026 (MDX → D1 마이그레이션), T038 (ProjectMeta cover 분리) |
| **PRD Features** | F021 (D1 Post Storage — 스키마/binding 정합) |
| **PRD AC** | 없음 (스키마/binding 정합 검증 — F021 의 AC-F021-1~5 는 T025~T026 에서 통과) |
| **예상 작업 시간** | 1d |
| **Status** | ✅ Done (`--remote` 적용은 머지 후 사용자 수동 — PR 본문 Manual verification 참조) |

## Goal

Phase 7.1 (CMS 인프라 — Read Path First) 의 D1 데이터 정본 구축 첫 PR. **본 task 는 schema 와 binding 의 토대만** 놓는다 — Cloudflare D1 (production + preview 2개) 를 생성·바인딩하고, Drizzle ORM 을 설치한 뒤 PRD F021 Data Model 과 1:1 매핑되는 `posts` 테이블 schema + 마이그레이션 파일을 산출한다. 데이터 INSERT 와 Repository 구현은 본 PR 범위 밖 (T026, T025 에서 처리).

## Context

- **Why**: F021 (D1 Post Storage) 의 데이터 정본을 D1 으로 옮기기 전에 스키마와 binding 이 먼저 안정 상태여야 후속 task (T025 의 `D1PostRepository`, T026 의 일회성 마이그레이션 스크립트) 가 의존할 정합 기준이 생긴다. 본 PR 은 SQL 한 줄도 INSERT 하지 않고, schema 정의 + 마이그레이션 SQL 산출 + binding 등록 + 로컬 적용 검증까지만 다룬다.
- **Phase 0 (Discovery) 의도 요약** (본 PR 에서 사용자와 합의된 내용 — `AskUserQuestion` 4회 결과):
  - **목표**: D1 + Drizzle 의 토대 PR. schema 와 binding 만 정합 — 데이터 / Repository / velite Post 폐기는 후속.
  - **사용자 의도**: T023 측정 결과(Drizzle 0.45.2 의 worker SSR bundle gzip Δ +30.96 KiB / Cloudflare Free 한계 안) 위에서 즉시 다음 단계로 진입. preview 환경은 default + staging + miniflare 가 공유하는 단일 D1, production 은 별도 — **production + preview 2개**.
  - **결정된 제약**: `drizzle-orm@0.45.2` pin (T023 측정 근거 일치). `--remote` 적용은 PR 머지 직후 사용자 수동 (T026 seed 이전에 production 스키마 준비 완료). 본 task 파일은 `development-planner` sub-agent 산출 (T023 패턴 유지).
  - **명시적 보류**: Post INSERT / 기존 MDX → D1 이관 (T026), `D1PostRepository` (T025), velite `posts` collection 폐기 (T025), `--remote` production migration apply (사용자 수동, 본 PR 머지 후).
- **Phase 진입/완료 연결**: T023 (Workers 번들 PoC) Done 후. T024 Done 이 T025 (D1PostRepository) / T026 (MDX → D1 마이그레이션) / T038 (ProjectMeta cover 분리) 의 진입 조건.
- **관련 PRD 섹션**: PRD `F021` 본문 + `Tech Stack — CMS 인프라` (D1 + Drizzle 항목)
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/infrastructure/db/**` (본 task 에서 신규 생성), `wrangler.toml` (D1 binding 추가), `drizzle.config.ts` (root 신규), `migrations/**` (root 신규)

## Scope

### In Scope

- **사전 단계 (PR 본 작업 전 1회 — 사용자가 수동 실행)**:
  - `bunx wrangler d1 create tkstar-dev-db` (production) → 반환 `database_id` 기록
  - `bunx wrangler d1 create tkstar-dev-db-preview` (preview — default / staging / miniflare 공유) → 반환 `preview_database_id` 기록
  - 두 ID 를 `wrangler.toml` 에 적용 (in-PR commit)
- **Drizzle dependencies 설치**:
  - `drizzle-orm@0.45.2` (production dep — T023 측정 근거 버전 pin)
  - `drizzle-kit` (devDep — 최신 stable, schema → SQL 마이그레이션 생성용)
- **`drizzle.config.ts`** (repo root):
  - `dialect: "sqlite"` (D1 = edge SQLite)
  - `schema: "./app/infrastructure/db/schema/*"` (glob — 향후 R2 metadata 등 schema 파일 추가 대비)
  - `out: "./migrations"`
  - `driver: "d1-http"` 미사용 (로컬 wrangler 가 SQL 적용만 담당, drizzle-kit 은 SQL 산출만 담당)
- **`app/infrastructure/db/schema/posts.ts`** — Drizzle `sqliteTable` (PRD F021 Data Model 1:1 매핑):
  - `id` integer PK autoincrement
  - `slug` text UNIQUE NOT NULL
  - `title` text NOT NULL
  - `summary` text NULL
  - `raw_markdown` text NOT NULL
  - `tags` text NOT NULL (JSON 직렬화 문자열 — SQLite 는 JSON 컬럼이 없어 text 로 저장 후 application 레이어에서 parse — T025 mapper 에서 처리)
  - `date_published` text NULL (ISO 8601 — Drizzle `text` + 애플리케이션 레이어 검증)
  - `status` text NOT NULL DEFAULT `'draft'` (`'draft' | 'published'` 만 허용 — Drizzle `text({ enum: [...] })`)
  - `created_at` integer NOT NULL (unix epoch seconds — `mode: 'number'`)
  - `updated_at` integer NOT NULL (unix epoch seconds — `mode: 'number'`)
- **`app/infrastructure/db/__tests__/posts.schema.test.ts`** (TDD Red → Green):
  - schema 의 컬럼명 / 타입 / 제약(notNull / unique / default) 이 PRD F021 과 1:1 매칭
  - `status` 의 enum 값이 정확히 `['draft', 'published']`
  - `id` 가 PK + autoincrement
  - `slug` 가 UNIQUE
- **`migrations/0000_*.sql`** + **`migrations/meta/_journal.json`** (drizzle-kit generate 산출물):
  - `bunx drizzle-kit generate` 1회 실행 결과를 commit
  - SQL 본문이 schema 와 정합 (`CREATE TABLE posts` + UNIQUE INDEX + CHECK constraint for status enum)
- **`wrangler.toml`** D1 binding 등록:
  - root `[[d1_databases]]` (default — preview DB 사용): `binding = "DB"`, `database_name = "tkstar-dev-db-preview"`, `database_id = "..."`
  - `[[env.production.d1_databases]]`: `binding = "DB"`, `database_name = "tkstar-dev-db"`, `database_id = "..."`
  - `[env.staging]` 은 default 의 preview DB 를 그대로 공유 (Phase 0 합의 — preview = default + staging + miniflare)
- **로컬 마이그레이션 적용 검증**:
  - `bunx wrangler d1 migrations apply tkstar-dev-db --local` 성공
  - `bunx wrangler d1 execute tkstar-dev-db --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"` → 1 row
- **`docs/PROJECT-STRUCTURE.md`** 갱신:
  - `app/infrastructure/db/` 디렉토리를 Target structure 트리에 추가 (`schema/` 하위)
  - "Infrastructure CA layer Contains" 표에 `db/` 항목 한 줄 추가 (역할: Drizzle ORM + D1 schema 정본)
- **ROADMAP 갱신**:
  - T024 [ ] → [x]
  - 본 task 파일 링크 + 산출물 SQL 마이그레이션 파일 링크
  - A021 (Drizzle 버전 pin) 가정 해소 표시

### Out of Scope

- **데이터 INSERT / 기존 MDX → D1 이관** → **T026** (별도 PR — 일회성 마이그레이션 스크립트)
- **`D1PostRepository` 구현** (Drizzle 기반 read/write 어댑터) → **T025**
- **velite Post collection 폐기** (`velite.config.ts` 의 `posts` 제거 + `app/infrastructure/content/velite-post.repository.ts` 삭제) → **T025**
- **`--remote` production migration 적용** → **사용자 수동, PR 머지 직후** (검증 명령은 본 task 파일의 "Verification — 수동" 섹션에 명시)
- **R2 / Project Meta / Cloudflare Access 관련 schema** → 각각 T034 / T038 / T030 (D1 schema 가 늘어나면 본 task 가 깐 `schema/*` glob 위에 동일 패턴으로 추가)
- **Cloudflare Free 의 D1 row 한계 / 비용 검토** → Phase 7 후반 운영 task

## Acceptance Criteria

- [x] `package.json` 에 `drizzle-orm` 이 정확히 `0.45.2` 로 pin (semver caret/tilde 없음)
- [x] `package.json` 에 `drizzle-kit` 이 devDependency 로 추가
- [x] `drizzle.config.ts` 가 repo root 에 존재하며 `dialect: "sqlite"`, `schema: "./app/infrastructure/db/schema/*"`, `out: "./migrations"` 설정
- [x] `app/infrastructure/db/schema/posts.ts` 의 컬럼이 PRD F021 Data Model 과 1:1 매칭 (10 컬럼)
- [x] `status` 컬럼이 `text({ enum: ['draft', 'published'] })` + `default('draft')` + `notNull()`
- [x] `slug` 컬럼이 `unique()` + `notNull()`
- [x] `bunx drizzle-kit generate` 가 idempotent (재실행 시 새 마이그레이션 파일이 생성되지 않고 "no changes" 출력)
- [x] `migrations/0000_*.sql` + `migrations/meta/_journal.json` 이 commit 에 포함
- [x] `wrangler.toml` 에 root `[[d1_databases]]` (preview) + `[[env.production.d1_databases]]` 두 entry 가 모두 등록
- [x] `bunx wrangler d1 migrations apply tkstar-dev-db --local` exit 0 → `posts` 테이블이 로컬 SQLite 에 생성
- [x] `app/infrastructure/db/__tests__/posts.schema.test.ts` 의 모든 케이스 통과 (TDD Green)
- [x] `bun run typecheck` exit 0 (postinstall lifecycle 의 `wrangler types` 가 `Cloudflare.Env.DB: D1Database` 자동 갱신 — `app/env.d.ts` 수동 편집 불필요, A021 fact 정정)
- [x] `bun run lint` exit 0
- [x] `bun run test` exit 0 (`posts.schema.test.ts` 포함 전체 통과)
- [x] `docs/PROJECT-STRUCTURE.md` 에 `app/infrastructure/db/` 디렉토리 신규 등록
- [x] ROADMAP T024 라인 [ ] → [x] + 본 task 링크 + 산출물 마이그레이션 파일 링크 → `docs-sync-gate.sh` 통과

## Implementation Plan (TDD Cycle)

본 PR 은 schema 정의가 핵심이라 TDD Red → Green 사이클을 적용한다. 마이그레이션 SQL 은 drizzle-kit 산출물이므로 별도 테스트 없이 명령 출력 검증으로 갈음한다.

- **Red**: `app/infrastructure/db/__tests__/posts.schema.test.ts` 작성 (schema import → 컬럼 / 타입 / 제약 단언) — 이 시점에 `schema/posts.ts` 는 미존재, 테스트 fail
- **Green**: `schema/posts.ts` 작성 → 테스트 pass
- **Refactor**: 컬럼 정의 한 줄로 정렬 / Drizzle helper (`text`, `integer`, `sqliteTable`) import 정리

## 작업 단계

> 단일 브랜치 `feature/issue-90-d1-drizzle-setup` + 단일 PR.

- [x] **T1**: 본 task 파일 작성 (`development-planner` sub-agent 산출물 — 본 파일 자체)
- [x] **T2**: 사전 단계 — 사용자 수동 실행 `bunx wrangler d1 create tkstar-dev-db` + `bunx wrangler d1 create tkstar-dev-db-preview` → 반환된 `database_id` 두 개를 PR 본문에 기록 + `wrangler.toml` 에 적용 (production: `601604ed-cbd0-4678-b481-f834a9d68f0f` / preview: `fb8d15ba-3d83-4dab-a8b8-d701a6f9c4c0`)
- [x] **T3**: `drizzle-orm@0.45.2` + `drizzle-kit@0.31.10` (devDep) 설치 → `bun.lock` 갱신
- [x] **T4**: `drizzle.config.ts` (repo root) 작성 — `dialect: "sqlite"`, `schema: "./app/infrastructure/db/schema/*"`, `out: "./migrations"`
- [x] **T5**: TDD Red — `app/infrastructure/db/__tests__/posts.schema.test.ts` 작성 (13 테스트 — schema import + 10 컬럼 / enum / unique / pk 단언) → import 미해결로 fail
- [x] **T6**: TDD Green — `app/infrastructure/db/schema/posts.ts` 작성 (Drizzle `sqliteTable` + PRD F021 Data Model 1:1 매핑) → 13/13 pass
- [x] **T7**: `bunx drizzle-kit generate` 실행 → `migrations/0000_futuristic_human_cannonball.sql` + `migrations/meta/_journal.json` + `0000_snapshot.json` 산출 → 재실행 시 "No schema changes" 확인 (idempotent)
- [x] **T8**: `wrangler.toml` 에 D1 binding 3개 등록 — root `[[d1_databases]]` (preview) + `[[env.staging.d1_databases]]` (preview 공유) + `[[env.production.d1_databases]]` (production) → `bunx wrangler types` 가 `Cloudflare.Env.DB: D1Database` 를 3개 env interface 모두에 자동 생성 확인
- [x] **T9**: 로컬 적용 검증 — `bunx wrangler d1 migrations apply tkstar-dev-db-preview --local` 1 migration applied → `SELECT name FROM sqlite_master WHERE type='table' AND name='posts'` 1 row 확인
- [x] **T10**: `docs/PROJECT-STRUCTURE.md` 갱신 — `app/infrastructure/db/` 신규 등록 (Contains 표 + Target structure 트리 + 페이지 끝 디렉토리 트리 3 군데)
- [x] **T11**: ROADMAP T024 라인 [ ] → [x] + 산출물 정확한 버전/파일 갱신 + A021 [FACT] 전환
- [x] **T12**: `bun run typecheck` + `bun run lint` + `bun run test` 통과 → PR #91 생성 → 사용자 승인 → squash merge → **머지 후 사용자 수동** `bunx wrangler d1 migrations apply tkstar-dev-db --env production --remote`

## Files to Create / Modify

### Source / Schema (PR 머지 대상)

| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/db/schema/posts.ts` | 신규 — Drizzle `sqliteTable('posts', { ... })` (PRD F021 Data Model 1:1) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/db/__tests__/posts.schema.test.ts` | 신규 — schema 컬럼 / enum / unique / pk 단언 |
| `/Users/tkstart/Desktop/project/tkstar-dev/drizzle.config.ts` | 신규 — D1 dialect=sqlite, schema glob, out=`./migrations` |
| `/Users/tkstart/Desktop/project/tkstar-dev/migrations/0000_*.sql` | 신규 — drizzle-kit generate 산출물 (`CREATE TABLE posts` + UNIQUE INDEX) |
| `/Users/tkstart/Desktop/project/tkstar-dev/migrations/meta/_journal.json` | 신규 — drizzle-kit 메타 |

### Config (수정)

| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/wrangler.toml` | root `[[d1_databases]]` (preview DB — default/staging/miniflare 공유) + `[[env.production.d1_databases]]` (production DB) 추가 |
| `/Users/tkstart/Desktop/project/tkstar-dev/package.json` | `drizzle-orm@0.45.2` (deps) + `drizzle-kit@latest` (devDeps) 추가 |
| `/Users/tkstart/Desktop/project/tkstar-dev/bun.lock` | 의존성 lock 자동 갱신 |

### Docs (수정)

| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/tasks/T024-d1-drizzle-setup.md` | 본 task 파일 (T1 산출물 — 본 파일 자체) |
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/PROJECT-STRUCTURE.md` | `app/infrastructure/db/` 디렉토리 Target structure 트리 + Contains 표 한 줄 추가 |
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/ROADMAP.md` | T024 라인 [ ] → [x] + 본 task 링크 + 산출물 마이그레이션 파일 링크 + A021 가정 해소 표시 |

### A021 가정 해소 (CLAUDE.md fact 정정)

ROADMAP 원문에는 "`app/env.d.ts` 의 `interface AppLoadContext` (또는 `Env`) 에 `DB: D1Database` 추가" 라고 적혀 있으나, 본 프로젝트는 `package.json` 의 `postinstall: wrangler types` lifecycle 가 `wrangler.toml` 변경 시 `worker-configuration.d.ts` 의 `Cloudflare.Env` 를 자동 갱신한다. 따라서 `[[d1_databases]]` 가 추가되면 `Cloudflare.Env.DB: D1Database` 가 자동 등장 — **`app/env.d.ts` 수동 편집 불필요**. 본 task 에서 fact 정정.

## Verification Steps

### 자동

- `bun run typecheck` exit 0 (`pretypecheck` lifecycle 가 velite 빌드 + wrangler types 갱신을 자동 호출)
- `bun run lint` exit 0
- `bun run test` exit 0 (`posts.schema.test.ts` 포함)
- `bunx drizzle-kit generate` 재실행 → "no changes" (idempotent)
- `bunx wrangler d1 migrations apply tkstar-dev-db --local` exit 0
- `bunx wrangler d1 execute tkstar-dev-db --local --command="SELECT name FROM sqlite_master WHERE type='table' AND name='posts'"` → 1 row 반환
- `bunx wrangler d1 execute tkstar-dev-db --local --command="PRAGMA table_info(posts)"` → 10 컬럼 + 정확한 타입/제약 출력
- `docs-sync-gate.sh` hook 통과 (ROADMAP T024 [x] + 본 task 링크 정합)

### 수동 (PR 본문에 명시 — 머지 후 사용자 실행)

- `bunx wrangler d1 migrations apply tkstar-dev-db --remote` 실행 → production D1 에 `posts` 테이블 생성
- `bunx wrangler d1 execute tkstar-dev-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"` → `posts` 1 row 확인
- `bunx wrangler d1 execute tkstar-dev-db --remote --command="PRAGMA table_info(posts)"` → 10 컬럼 + 정확한 타입/제약 출력
- production migration 적용 결과를 `docs/reports/d1-migration-2026-MM-DD.md` 에 1 줄로 기록 (선택, T026 의 INSERT seed 결과와 함께 기록 가능)

### 측정

- T023 보고서의 권장 stack 합산 (`docs/reports/cms-bundle-poc-2026-05-06.md` 의 "T3 Drizzle (D1)" 섹션) 과 본 PR 머지 후 worker SSR bundle 사이즈 차이가 ±5% 이내인지 확인 — 차이가 크면 schema/migrations import 경로 점검 (`app/infrastructure/db/schema/posts.ts` 가 worker entry 에 transitive import 되지 않아야 함 — Repository 가 등장하기 전까지는 schema 만 정의되어도 SSR 번들에 들어가면 안 됨, T025 에서 본격 import 시작)

## Dependencies

- **Depends on**: T023 (Workers 번들 PoC — Drizzle 0.45.2 worker 측 PASS 측정 완료)
- **Blocks**: T025 (D1PostRepository — 본 task 의 schema 위에 read/write 어댑터 구현), T026 (MDX → D1 일회성 마이그레이션 — 본 task 의 schema 위에 INSERT), T038 (ProjectMeta cover 분리 — 본 task 가 깐 `schema/*` glob 위에 `project_meta` schema 추가)

## Risks & Mitigations

- **Risk**: drizzle-kit 의 default behavior 가 SQLite CHECK constraint 으로 enum 을 표현하지 않을 수 있음 — `status` 가 단순 text 컬럼으로만 떨어지면 `INSERT INTO posts (status) VALUES ('foo')` 가 통과해 PRD F021 정합이 깨짐.
  - **Mitigation**: `migrations/0000_*.sql` 산출물을 사람 눈으로 검토하여 `CHECK (status IN ('draft', 'published'))` 가 포함되어 있는지 확인. 없다면 `migrations/0001_add_status_check.sql` 를 수동으로 한 줄 추가 (`ALTER TABLE posts ADD CHECK (status IN ('draft', 'published'))`) 또는 schema 측에서 `text({ enum: [...] })` 가 CHECK 을 자동 생성하도록 drizzle-kit 옵션 점검.
- **Risk**: T023 측정 시점의 `drizzle-orm@0.45.2` 와 본 task 실행 시점 (5/6) 의 stable channel 이 0.46+ 로 올라갔다면 측정 근거가 흔들림.
  - **Mitigation**: 본 task 는 0.45.2 pin 유지. 측정 근거 일치가 우선 — upgrade 결정은 T026/T025 머지 후 별도 task 로 분리.
- **Risk**: `wrangler.toml` 의 D1 binding 추가 후 default env (preview) 와 production env 의 schema 가 의도치 않게 분기 — staging 이 default 의 preview DB 를 공유한다는 합의가 깨질 수 있음.
  - **Mitigation** (정정): Cloudflare Workers named environment 는 bindings 와 vars 를 **상속하지 않는다** (공식 docs: "Bindings and vars need to be declared per environment and are not inherited"). 따라서 `[[env.staging.d1_databases]]` 를 **명시적으로 등록** + `database_id` 를 root preview DB 와 **동일하게 지정** (preview 공유). 잘못 등록하면 staging 이 production DB 에 붙거나 binding undefined 가 되므로 PR review 시 두 entry 의 `database_id` 가 정확히 같은 preview UUID (`fb8d15ba-...`) 인지 확인.
- **Risk**: `--remote` migration 을 사용자 수동으로 미루는 방식이 운영 절차에서 누락될 수 있음 — 머지 후 production 이 schema 미적용 상태로 남으면 T026 (INSERT seed) 가 fail-fast.
  - **Mitigation**: PR 본문에 머지 후 수동 명령 (`bunx wrangler d1 migrations apply tkstar-dev-db --remote`) 을 체크리스트로 명시. 머지 직후 사용자에게 알림 (Discord). T026 시작 전 T024 task 파일의 "수동 검증" 섹션이 모두 [x] 인지 확인.

## References

- GitHub Issue: #90
- ROADMAP: `Phase 7.1 — Read Path First` Task 024
- PRD: `F021` (D1 Post Storage), `Tech Stack — CMS 인프라` (D1 + Drizzle 항목)
- T023 보고서: [docs/reports/cms-bundle-poc-2026-05-06.md](../reports/cms-bundle-poc-2026-05-06.md) — "T3 Drizzle (D1)" 섹션 (drizzle-orm@0.45.2 worker SSR gzip Δ +30.96 KiB / Cloudflare Free 한계 안 PASS)
- CLAUDE.md typegen 패턴: `package.json` 의 `postinstall: wrangler types` + `pretypecheck: bun run velite:build` lifecycle (A021 fact 정정 근거)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Drizzle ORM SQLite / D1 Guide](https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1)
- [Drizzle Kit Migrations](https://orm.drizzle.team/docs/kit-overview)
- [Wrangler D1 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- 후속 task: [T025](T025-d1-post-repository.md), [T026](T026-mdx-to-d1-migration.md), [T038](T038-project-meta-cover.md)

## Change History

| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
