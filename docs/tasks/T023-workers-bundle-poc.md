# Task 023 — Workers 번들 사이즈 PoC + 의존성 합산 측정

| Field | Value |
|-------|-------|
| **Task ID** | T023 |
| **Phase** | Phase 7.1 — Read Path First (CMS 인프라 진입 게이트) |
| **Layer** | Infrastructure (build-time 측정) + 운영 |
| **Branch** | `chore/issue-88-cms-bundle-poc` |
| **Issue** | #88 |
| **Depends on** | T022 |
| **Blocks** | T024 (D1/Drizzle), T027 (MDX runtime compiler), T030 (jose), T033/T034 (R2 client), T035 (Tiptap 한국어 IME PoC) |
| **PRD Features** | F020, F021, F022, F023 (전제 — 측정 대상) |
| **PRD AC** | 없음 (사실 측정) |
| **예상 작업 시간** | 1d |
| **Status** | In Progress |
| **산출물 (예정)** | `docs/reports/cms-bundle-poc-2026-05-06.md` |

## Goal

Phase 7 (CMS 인프라 — D1/Drizzle + R2 + Cloudflare Access + Tiptap admin) 진입에 필요한 의존성들이 Cloudflare Workers Free 플랜의 **3 MiB gzip 한계** 안에 들어오는지 사실 측정한다. 본 PR 은 **측정 + 권고안만** 산출 — PoC 코드는 머지하지 않고 commit 전체 `git revert` 한다. 후속 task (T024 / T027 / T030 / T033·T034 / T035) 는 본 보고서를 입력으로 stack 을 최종 결정한다.

## Context

- **Why**: Phase 7 의 의존성 합산 (D1/Drizzle + MDX runtime compiler + shiki + jose + R2 client + Tiptap) 이 Workers Free 3 MiB gzip 한계를 초과하면 (a) 후보 좁힘 / (b) shiki 빌드타임화 / (c) Workers Paid 전환 중 하나를 선제적으로 결정해야 한다. 근거 없이 stack 을 정하면 Phase 7.1 후반에 번들 한계 hit 시 T024~T034 전체 재작업 위험.
- **Phase 0 (Discovery) 의도 요약** (본 PR 에서 사용자와 합의된 내용):
  - **목표**: Phase 7 진입 전에 의존성 합산을 사실 측정 + 권고안 도출.
  - **사용자 의도**: 본인 1명 admin 이 모바일/외부에서 Post 직접 작성할 의향. D1 = Cloudflare 의 edge SQLite (Supabase PG 모델 X) 라는 사실 확인 후 Drizzle SQLite dialect 채택 합의.
  - **결정된 제약**: 본 PR 은 측정 + 권고안까지만. stack 최종 결정 X.
  - **명시적 보류**: T024 (D1/Drizzle 설치), T027 (MDX runtime compiler 구현), T030 (jose 도입), T033/T034 (R2 client 채택), T035 (Tiptap 한국어 IME PoC) 의 실제 코드 머지는 본 task 범위 밖.
- **Phase 진입/완료 연결**: T022 (production 배포) Done 후. T023 Done 이 Phase 7.1 후속 task 전체 (T024~T028) 의 진입 조건.
- **관련 PRD 섹션**: PRD `F020~F023`, `Tech Stack — CMS 인프라`
- **관련 PROJECT-STRUCTURE 디렉토리**: 측정 인프라는 `scripts/poc-bundle/**` (PoC 한정, 본 PR 머지 후 revert), 보고서는 `docs/reports/`

## Scope

### In Scope

- **Baseline 측정**: 현재 Phase 6 production 번들 (`dist/_worker.js/index.js` + `build/client/assets/*.js`) raw + gzip
- **Workers SSR 번들 후보 (9 단독 측정 + 권장 stack 1 합산)**:
  - MDX compiler: `marked`, `micromark`, `@mdx-js/mdx`
  - Syntax highlight: `shiki` (theme: `github-dark` 단일)
  - JWT: `jose`
  - R2 client: `aws4fetch`, R2 binding-only (Workers `MEDIA_BUCKET.put/get` only — no install), `@aws-sdk/client-s3` (with `nodejs_compat`)
  - ORM: `drizzle-orm` + `drizzle-orm/d1`
- **Admin client bundle 후보 (Tiptap, 2 stack)**:
  - Tiptap v2: `@tiptap/core@^2`, `@tiptap/react@^2`, `@tiptap/starter-kit@^2`, markdown serializer (`tiptap-markdown` 또는 `prosemirror-markdown`)
  - Tiptap v3: `@tiptap/core@^3`, `@tiptap/react@^3`, `@tiptap/starter-kit@^3`, markdown serializer
- **출력 단위**: raw + gzip 두 단위 모두 + baseline 대비 Δ (증분) 표기
- **권장 stack 합산**: 단독 측정 결과를 토대로 1 개 stack 후보를 선정해 합산 측정 + Cloudflare Free 3 MiB gzip 한계 대비 PASS/FAIL 판정
- **권고안**: PASS 시 권장 stack 그대로 / FAIL 시 (a) `aws4fetch` + R2 binding-only / (b) shiki 빌드타임화 / (c) Workers Paid trade-off 중 권고
- **보고서 작성**: `docs/reports/cms-bundle-poc-2026-05-06.md`
- **PoC 코드 revert**: 측정 후 PoC commit 전체 `git revert` — working tree 에 흔적 0
- **ROADMAP 갱신**: T023 [ ] → [x] + 보고서 링크 + 진행 현황 요약

### Out of Scope

- T024 의 D1/Drizzle 실제 설치 + schema 정의 (별도 task)
- T027 의 MDX runtime compiler 구현 + KV cache (별도 task)
- T030 의 jose 기반 Access JWT 검증 코드 (별도 task)
- T033 의 R2 client 최종 채택 + T034 의 uploadMedia use-case 구현 (별도 task)
- T035 의 Tiptap 한국어 IME 동작 PoC (별도 task — 번들 사이즈는 본 task, IME 동작은 T035)
- 본 PR 에서 stack 최종 결정 — 본 PR 은 사실 측정 + 권고안까지만

## Acceptance Criteria

- [ ] 보고서가 baseline + 9 Workers SSR 후보 + 2 admin client stack + 권장 stack 합산 전부 표 형식으로 기록
- [ ] raw + gzip 두 단위 + baseline 대비 Δ 모두 기록
- [ ] Cloudflare Free 3 MiB gzip 한계 대비 PASS / FAIL 판정 명시
- [ ] PASS 시 권장 stack 명시 / FAIL 시 권고안 (a) `aws4fetch` + R2 binding-only / (b) shiki 빌드타임화 / (c) Workers Paid 중 1개 명시
- [ ] working tree 에 PoC 흔적 0 — `git diff origin/development -- package.json scripts/` 가 빈 결과
- [ ] ROADMAP T023 라인 [ ] → [x] + 보고서 링크 추가 → `docs-sync-gate.sh` 통과
- [ ] `bun run typecheck` exit 0
- [ ] `bun run lint` exit 0

## Implementation Plan

**N/A — chore branch policy.** 본 PR 은 측정 task 이며 production 코드 변경 없음 (PoC commit 은 전체 revert). TDD Red/Green 미적용.

## 작업 단계

> 단일 브랜치 `chore/issue-88-cms-bundle-poc` + PoC commit 전체 `git revert` 패턴.

- [x] **T1**: 본 task 파일 작성 (`development-planner` sub-agent 산출물 — 본 파일 자체)
- [ ] **T2**: Baseline 측정
  - `bun run build` 실행 → `dist/_worker.js/index.js` + `build/client/assets/*.js` raw + gzip 측정
  - 측정 스크립트: `scripts/poc-bundle/measure.mjs` (Node `zlib.gzipSync` + `fs.statSync`)
- [ ] **T3**: PoC measurement infrastructure 추가
  - `scripts/poc-bundle/measure.mjs` — raw + gzip 측정 헬퍼 (입력: 파일 경로 / 출력: `{ raw, gzip }` bytes)
  - `scripts/poc-bundle/wrangler.poc.toml` — 측정 전용 빈 Worker 설정 (`compatibility_flags = ["nodejs_compat"]`, 기존 wrangler.toml 와 분리)
  - `scripts/poc-bundle/entries/*.ts` — 후보별 단독 import entry (예: `entries/marked.ts`, `entries/micromark.ts`, `entries/mdx-js-mdx.ts`, `entries/shiki.ts`, `entries/jose.ts`, `entries/aws4fetch.ts`, `entries/aws-sdk-s3.ts`, `entries/drizzle-d1.ts`, `entries/r2-binding-only.ts`)
  - `package.json` — 측정 대상 임시 deps 추가 (T7 에서 전체 revert)
- [ ] **T4**: Workers SSR 9 후보 측정 실행
  - 각 entry 별로 `bunx wrangler deploy --dry-run --outdir dist-poc/<entry>` 실행
  - `scripts/poc-bundle/measure.mjs` 로 raw + gzip 측정
  - 결과를 보고서 표에 기록
- [ ] **T5**: Admin client bundle 측정
  - `app/presentation/routes/_admin.poc.tsx` — Tiptap editor 임시 라우트 (T7 에서 revert)
  - Tiptap v2 install → `bun run build` → admin chunk size 측정 → uninstall
  - Tiptap v3 install → `bun run build` → admin chunk size 측정 → uninstall
  - markdown serializer (`tiptap-markdown` vs `prosemirror-markdown`) 도 각각 측정
- [ ] **T6**: 보고서 작성 — `docs/reports/cms-bundle-poc-2026-05-06.md`
  - Baseline / 9 Workers 후보 / 2 admin stack / 권장 stack 합산 표
  - raw + gzip + Δ 전 단위
  - PASS/FAIL 판정 + 권고안
  - 후속 task (T024 / T027 / T030 / T033·T034 / T035) 입력 요약
- [ ] **T7**: PoC commit 전체 `git revert`
  - `package.json` / `bun.lock` / `scripts/poc-bundle/**` / `app/presentation/routes/_admin.poc.tsx` 전부 origin/development 상태 복원
  - `git diff origin/development -- package.json scripts/` 가 빈 결과인지 확인
- [ ] **T8**: ROADMAP 갱신
  - T023 라인 [ ] → [x]
  - 보고서 링크 추가
  - Phase 7.1 진행 현황 요약 1~2줄
- [ ] **T9**: `code-reviewer` Phase 3 (자동 리뷰)
- [ ] **T10**: `bun run typecheck` + `bun run lint` 통과 → PR 생성 → squash merge

## Files to Create / Modify

### Reports (PR 머지 대상)

| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/tasks/T023-workers-bundle-poc.md` | 본 task 파일 (T1 산출물) |
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/reports/cms-bundle-poc-2026-05-06.md` | Baseline + 9 Workers 후보 + 2 admin stack + 권장 stack 합산 표 + PASS/FAIL + 권고안 |
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/ROADMAP.md` | T023 라인 [ ] → [x] + 보고서 링크 + Phase 7.1 진행 현황 요약 |

### PoC infrastructure (T7 에서 전체 revert — 머지 대상 X)

| Path | Note |
|------|------|
| `scripts/poc-bundle/measure.mjs` | T7 revert |
| `scripts/poc-bundle/wrangler.poc.toml` | T7 revert |
| `scripts/poc-bundle/entries/*.ts` | T7 revert (9 entry 파일) |
| `app/presentation/routes/_admin.poc.tsx` | T7 revert |
| `package.json` / `bun.lock` | 임시 deps 추가 → T7 전체 revert |

## Verification Steps

### 자동

- `bun run typecheck` exit 0
- `bun run lint` exit 0
- `git diff origin/development -- package.json scripts/` 빈 결과 (PoC 흔적 0)
- `docs-sync-gate.sh` hook 통과 (ROADMAP T023 [x] + 보고서 링크 정합)

### 수동

- 보고서 표가 baseline + 9 Workers 후보 + 2 admin stack + 권장 stack 합산 전부 포함하는지 사람 눈 검토
- raw + gzip + Δ 단위가 표에 모두 기재되어 있는지 확인
- PASS/FAIL 판정 + 권고안이 명시되어 있는지 확인
- 후속 task (T024 / T027 / T030 / T033·T034 / T035) 가 본 보고서를 입력으로 stack 을 결정할 수 있을 만큼 사실이 충분한지 확인

### 측정 (보고서 본문)

- Baseline (Phase 6 production 번들) raw + gzip
- 9 Workers SSR 후보 단독 measurement (각 entry 별 raw + gzip + Δ vs baseline)
- 2 admin client stack measurement (Tiptap v2 / v3 + markdown serializer 각각)
- 권장 stack 합산 (단독 측정 합과 actual import 합산의 차이도 함께 기록 — tree shaking / shared dep 영향)
- Cloudflare Free 3 MiB gzip 한계 대비 PASS / FAIL

## Dependencies

- **Depends on**: T022 (production 배포 완료 → 정상 동작하는 baseline 번들 확보)
- **Blocks**: T024, T027, T030, T033, T034, T035 — 본 보고서가 stack 결정 입력

## Risks & Mitigations

- **Risk**: `bunx wrangler deploy --dry-run` 의 산출물 사이즈가 실제 production 번들과 차이 날 수 있음 (minify / tree shaking 옵션 차이).
  - **Mitigation**: `wrangler.poc.toml` 의 build 옵션을 production `wrangler.toml` 와 동일하게 설정. baseline 도 동일 옵션으로 측정.
- **Risk**: PoC deps install 후 실수로 머지 → `package.json` 오염.
  - **Mitigation**: T7 의 `git revert` 후 `git diff origin/development -- package.json scripts/` 가 빈 결과인지 PR 생성 직전 자동 확인. 검증 자동화에 포함.
- **Risk**: Tiptap v2/v3 markdown serializer 후보 (`tiptap-markdown` vs `prosemirror-markdown`) 의 동작 차이가 번들 사이즈만으로 결정되면 한국어 IME 회귀 가능.
  - **Mitigation**: 본 task 는 사이즈만 측정. IME 동작 검증은 T035 에서 별도 PoC. 보고서에 "T035 의 IME PoC 결과와 종합해서 최종 채택" 명시.
- **Risk**: 측정 시점의 후보 라이브러리 버전이 T024~T035 실행 시점과 달라질 수 있음.
  - **Mitigation**: 보고서에 측정 시점 버전 ((`marked@x.y.z` 등) 모두 기록. 후속 task 진입 시점에 차이가 크면 재측정 명시.

## References

- GitHub Issue: #88
- ROADMAP: `Phase 7.1 — Read Path First` Task 023
- PRD: F020 (admin Post Editor), F021 (D1 Post 이관), F022 (R2 미디어 업로드), F023 (Cloudflare Access JWT)
- Cloudflare Workers Limits: https://developers.cloudflare.com/workers/platform/limits/#worker-size
- `bunx wrangler deploy --dry-run` docs: https://developers.cloudflare.com/workers/wrangler/commands/#deploy
- 후속 task: [T024](T024-d1-drizzle-setup.md), [T027](T027-mdx-runtime-compiler-kv-cache.md), [T030](T030-cloudflare-access-jwt.md), [T033](T033-r2-client-decision.md), [T034](T034-upload-media.md), [T035](T035-tiptap-korean-ime-poc.md)

## Change History

| Date | Changes | Author |
|------|---------|--------|
| 2026-05-06 | Task 파일 신규 작성 (T1 — Phase 0/1 합의 결과 반영, Phase 7.1 진입 게이트 task) | Claude (development-planner sub-agent, T023) |
