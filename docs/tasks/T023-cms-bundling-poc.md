# T023 — chore: CMS 번들링 PoC — `nodejs_compat` + 종속성 호환성 검증

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T022](T022-deploy-domain-search-console.md)
> **후행**: [T024](T024-drizzle-d1-setup.md), [T025](T025-post-d1-schema-migration.md), [T026](T026-post-d1-repository.md), [T027](T027-mdx-runtime-compiler-kv-cache.md), [T033](T033-r2-bucket-setup.md)

---

## 목적

Phase 7.x CMS 인프라 도입 전, Workers runtime 에서 D1 (Drizzle) + R2 + Tiptap (admin) + MDX 런타임 컴파일 (`@mdx-js/mdx`) 등 신규 의존성이 함께 번들·실행 가능한지 PoC 한다. `nodejs_compat` flag 활성, AsyncLocalStorage 충돌 점검, bundle size 측정, cold start 영향 평가까지가 단일 책임.

## PRD Feature ID 매핑

- F020
- F021
- F022

## 입력·출력 계약

**입력**: T022 production 배포본 + Drizzle / Tiptap / @mdx-js/mdx PoC 모듈. **출력**: wrangler.toml `compatibility_flags = ['nodejs_compat']` + `compatibility_date` 갱신 + PoC report (`docs/notes/cms-bundling-poc.md`) 포함 bundle size before/after, cold start ms, 호환성 결론. **검증**: PoC worker 배포 200, bundle size < Workers 한도 (1MB compressed), cold start < 50ms 증가.

## 시퀀스

```
1. wrangler.toml — `compatibility_date = '2026-04-15'` (또는 nodejs_compat 안정 날짜), `compatibility_flags = ['nodejs_compat']`
2. 임시 PoC 라우트 `/__poc/db.ts` — drizzle-orm + drizzle-orm/d1 import + dummy select
3. 임시 PoC 라우트 `/__poc/mdx.ts` — `@mdx-js/mdx` compile + evaluate 1회 실행
4. 임시 PoC 라우트 `/__poc/tiptap.ts` — Tiptap core (서버측은 schema 만) import
5. 임시 PoC 라우트 `/__poc/r2.ts` — `env.R2_MEDIA.list({ limit: 1 })`
6. `bunx wrangler deploy --env preview` 로 PoC 배포 + bundle size 계측
7. cold start 측정 — preview URL 의 첫 요청 latency (5회 평균)
8. 결과 → `docs/notes/cms-bundling-poc.md` 작성 (Go/No-Go 결론 포함)
9. PoC 라우트 4개는 본 task 머지 직전 제거 — 임시 코드 영속화 금지
```

## 엣지 케이스 + 구현

## Implementation Notes

- nodejs_compat 활성으로 `process`, `Buffer` 일부 사용 가능 — 단 'partial' compat 이라 모든 Node API 동작 보장 안 됨. Drizzle/Tiptap/MDX 셋이 실제 사용하는 API 만 검증.
- Cloudflare Workers bundle 한도는 Paid 플랜 기준 압축 후 10MB / 비압축 100MB. 본 task 의 budget 은 압축 1MB (cold start 보수적 목표).
- AsyncLocalStorage 는 nodejs_compat 에서 부분 지원 — Drizzle 내부 트랜잭션 핸들링 시 문제 가능. select 만 검증하면 충분.
- Tiptap 서버측은 schema (`@tiptap/core`, `@tiptap/starter-kit`) 만 사용 — 에디터 UI 는 client-only. 본 task 는 import 가능성만.
- MDX 런타임 컴파일: `compile(source, { jsx: true, format: 'mdx' })` 의 evaluate 가 V8 isolate 에서 동작하는지 확인. T043 의 V8 eval fix 와 별개 (T027 의 post body 컴파일이 진짜 소비자).
- bundle size before/after diff 측정 — `wrangler deploy --dry-run --outdir=dist` 의 `bundle.js.gz` 크기.
- PoC 코드는 본 task 머지 직전 git rm — `docs/notes/cms-bundling-poc.md` 만 영속화.
- Go/No-Go 결론: '모든 의존성이 호환' → Phase 7.1 본격 시작. '일부 부적합' → 대안 (예: Cloudflare D1 Drizzle 대체 또는 자체 SQL) 결정 후 ROADMAP 갱신.

## Change History from previous body

- chore branch PR: `chore/cms-bundling-poc`.
- Phase 7.x 의 첫 task — 인프라 의존성 검증 게이트.
- D2 (수제 DI) 결정과는 별개 — 본 task 는 외부 라이브러리 호환성 게이트.

## DoD

- [x] wrangler.toml 에 `nodejs_compat` flag + 갱신된 compatibility_date
- [x] PoC 라우트 4종 preview 배포 200 응답
- [x] bundle size 압축 후 < 1MB (목표) / < 10MB (한도)
- [x] cold start 5회 평균 < 50ms 증가 (T022 baseline 대비)
- [x] Drizzle d1 select 동작 (dummy 테이블)
- [x] @mdx-js/mdx compile + evaluate 1회 실행 성공
- [x] Tiptap core schema import 성공
- [x] R2 list({ limit:1 }) 동작
- [x] docs/notes/cms-bundling-poc.md 작성 + Go/No-Go 결론
- [x] PoC 라우트 4개 머지 직전 제거

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-03 | T023 머지 — nodejs_compat + Drizzle/Tiptap/MDX/R2 PoC + Go 결론 (branch `chore/cms-bundling-poc`) | TaekyungHa |
