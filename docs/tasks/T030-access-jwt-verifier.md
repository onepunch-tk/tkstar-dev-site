# T030 — feature: Workers Access JWT 검증 미들웨어 — fail-closed + JWKS 캐시

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T029](T029-cloudflare-access-zero-trust-setup.md)
> **후행**: [T031](T031-admin-layout-shell.md), [T032](T032-admin-posts-list.md), [T034](T034-admin-media-upload-api.md), [T036](T036-admin-post-editor-tiptap.md)

---

## 목적

T029 의 Cloudflare Access 를 신뢰 베이스로, Workers 측에서 `/admin/*` 로 들어오는 모든 요청의 `cf-access-jwt-assertion` 또는 `CF_Authorization` 쿠키 JWT 를 검증한다. JWKS lazy fetch + KV 캐시 + RS256 signature 검증 + iss/aud/exp 클레임 검증 + 실패 시 fail-closed (403).

## PRD Feature ID 매핑

- F023

## 입력·출력 계약

**입력**: T029 의 ACCESS_AUD + team 도메인. **출력**: `app/application/auth/services/verify-access-jwt.ts` + `app/infrastructure/auth/{jwks-cache.ts, jwt-verifier.ts}` + workers/app.ts 의 `/admin/*` path 가드 + KV namespace `JWKS_CACHE_KV` + container wiring + `__tests__/` + `app/presentation/routes/admin.tsx` 의 loader 진입 가드. **검증**: 유효 JWT → 200 + `request.context.admin = { sub, email }`, 잘못된 signature → 403, 만료 JWT → 403, JWT 없음 → 403, JWKS 캐시 hit ratio 측정.

## 시퀀스

```
1. Application — `verify-access-jwt.ts` (port: JwksFetcher + JwtVerifier)
2. Infrastructure — `jwks-cache.ts` (KV TTL 6h, key `jwks:<team-domain>`)
3. Infrastructure — `jwt-verifier.ts` (RS256 signature 검증 via WebCrypto SubtleCrypto, iss = `https://<team>.cloudflareaccess.com`, aud = ACCESS_AUD, exp 검증)
4. wrangler.toml — `[[kv_namespaces]] binding = JWKS_CACHE_KV`
5. workers/app.ts — fetch handler 초입에 `/admin/*` 분기, JWT 검증 실패 시 403 fail-closed (loader 미진입)
6. container.ts — verifyAccessJwt service wiring + admin context (`{ sub, email }`) 주입
7. T031 의 admin.tsx loader 가 `context.admin` 사용 — 본 task 에서 타입 정의 SoT
8. Vitest — 정상 JWT / wrong signature / expired / missing / wrong aud / wrong iss 6 케이스 Green
9. Miniflare KV fixture 로 JWKS 캐시 hit 검증
```

## 엣지 케이스 + 구현

## Implementation Notes

- fail-closed 원칙: JWKS fetch 실패, 캐시 miss + 네트워크 오류, 클레임 missing 모든 경우 403. fail-open (skip verification) 절대 금지.
- JWKS endpoint: `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` — 공개 JSON Web Key Set.
- KV TTL 6h 채택 — Cloudflare 권장. 키 rotation 빈도 고려.
- iss / aud / exp 외에 nbf (not before) 도 검증 — clock skew 30s 허용.
- RS256 검증: WebCrypto SubtleCrypto `importKey({kty:'RSA', alg:'RS256'})` + `verify('RSASSA-PKCS1-v1_5', ...)`.
- email claim 추출 — IdP 가 제공하는 `email` 또는 `identity_nonce` 활용.
- workers/app.ts 의 가드는 React Router request handler 호출 전에 위치 — loader/action 진입 자체 차단.
- JWT 두 채널 (header + cookie) — header 우선, 없으면 cookie 파싱.
- T032 의 Admin Posts API 가 본 task 의 `context.admin` 의존.
- F023 의 'Cloudflare Workers 가 모든 admin 요청에서 JWT 를 검증' AC 가 본 task 의 책임.

## Change History from previous body

- feature branch PR: `feature/issue-N-access-jwt-verifier`.
- Phase 7.2 의 핵심 보안 task.

## DoD

- [ ] verify-access-jwt.ts service + ports 2개
- [ ] Infrastructure jwks-cache.ts + jwt-verifier.ts 구현
- [ ] wrangler.toml JWKS_CACHE_KV namespace 등록
- [ ] workers/app.ts 의 /admin/* path 가드 (loader 진입 전)
- [ ] 유효 JWT → 200 + context.admin 주입
- [ ] 잘못된 signature / 만료 / missing / wrong aud / wrong iss 5 케이스 → 403
- [ ] JWKS KV 캐시 hit 검증
- [ ] Vitest 6 케이스 Green
- [ ] fail-closed 원칙 — fail-open 분기 0건 (코드 리뷰 확인)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
