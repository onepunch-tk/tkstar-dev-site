# T033 — chore: R2 bucket 셋업 + media 메타 D1 테이블 + binding

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T023](T023-cms-bundling-poc.md), [T024](T024-drizzle-d1-setup.md)
> **후행**: [T034](T034-admin-media-upload-api.md), [T038](T038-project-meta-d1-split.md)

---

## 목적

Phase 7.3 의 미디어 백본 — Cloudflare R2 bucket (`tkstar-media`) 을 생성하고, Workers 에 binding 한다. 동시에 D1 `media` 테이블 (id / key / filename / mime / size / uploaded_at / alt) 을 추가하여 R2 객체 메타를 추적한다. 본 task 는 인프라만 — upload UI / endpoint 는 T034.

## PRD Feature ID 매핑

- F022

## 입력·출력 계약

**입력**: T023 PoC 통과 + T024 D1 셋업. **출력**: R2 bucket 생성 + wrangler.toml `[[r2_buckets]] binding = R2_MEDIA bucket_name = tkstar-media` + D1 `media` 테이블 + migration + custom domain (`media.tkstar.dev`) 또는 worker route 라우팅 결정 + `docs/notes/r2-setup.md`. **검증**: `bun run db:migrate:local` 의 media 테이블 생성, `env.R2_MEDIA.list({ limit: 1 })` 동작, 수동 업로드한 객체가 custom domain 으로 GET 200.

## 시퀀스

```
1. Cloudflare dashboard 에서 R2 bucket `tkstar-media` 생성 (dev/preview/production 분리 또는 prefix 분리 — 1인 사이트는 단일 bucket + prefix 채택 권장)
2. wrangler.toml — `[[r2_buckets]] binding = R2_MEDIA bucket_name = tkstar-media`
3. schema.ts — `media` 테이블 (id TEXT PK, key TEXT UNIQUE, filename TEXT, mime TEXT, size INTEGER, alt TEXT NULL, uploaded_at INTEGER)
4. `bun run db:generate` + `bun run db:migrate:local`
5. media 노출 경로 결정 — custom domain `media.tkstar.dev` (Cloudflare R2 → Settings → Custom Domain) vs Worker route `/media/*` 프록시. 본 task 는 custom domain 채택 (CDN 직접 + signed URL 미사용).
6. DNS — media.tkstar.dev CNAME → R2 endpoint, proxied
7. 수동 업로드 테스트 — `bunx wrangler r2 object put tkstar-media/test.png --file=...` → GET https://media.tkstar.dev/test.png 200
8. docs/notes/r2-setup.md — 재현 절차 + custom domain 설정 + CORS 정책
```

## 엣지 케이스 + 구현

## Implementation Notes

- bucket 분리 vs prefix 분리: 1인 사이트 + 무료 한도 (10GB) 충분 → 단일 bucket + prefix `posts/`, `projects/cover/` 등.
- custom domain 채택 — Signed URL 안 씀. 모든 객체 public (콘텐츠가 본인 발행물이라 공개 가능).
- CORS — 본인 도메인 only `Access-Control-Allow-Origin: https://tkstar.dev`. T034 upload 가 same-origin 이라 사실상 필요 없으나 future-proof.
- media 테이블의 `key` = R2 object key (예: `posts/2026-05/foo.png`).
- migration 파일은 git tracked.
- T034 (upload endpoint) 가 본 task 의 binding + 테이블에 의존.
- T038 (Project cover) 의 cover_url 도 media.tkstar.dev 가 호스트.
- A011 (R2 노출 경로) 해소 — custom domain.

## Change History from previous body

- chore branch PR: `chore/r2-bucket-setup`.
- Phase 7.3 의 진입 task.

## DoD

- [ ] R2 bucket tkstar-media 생성
- [ ] wrangler.toml R2_MEDIA binding 등록
- [ ] D1 media 테이블 + migration 적용
- [ ] custom domain media.tkstar.dev 설정 (DNS + R2 binding)
- [ ] 수동 업로드 + GET 200 검증
- [ ] CORS 정책 (Allow-Origin 본인 도메인)
- [ ] docs/notes/r2-setup.md 작성
- [ ] A011 R2 노출 경로 결정 사실 기록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
