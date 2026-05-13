# T029 — chore: Cloudflare Access (Zero Trust) GitHub OAuth + admin allowlist 셋업

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T022](T022-deploy-domain-search-console.md)
> **후행**: [T030](T030-access-jwt-verifier.md)

---

## 목적

Phase 7.2 의 첫 task — Cloudflare Zero Trust (Free 플랜) 에 team 을 생성하고, GitHub OAuth identity provider 등록 + `/admin/*` 경로에 Access Application + 본인 GitHub 계정 단일 allowlist 정책을 등록한다. Workers 측 JWT 검증 (T030) 은 다음 task, 본 task 는 Cloudflare 측 정책만.

## PRD Feature ID 매핑

- F023

## 입력·출력 계약

**입력**: T022 production 도메인 + Cloudflare 계정 + 본인 GitHub 계정. **출력**: Zero Trust team 생성 + GitHub OAuth IdP 등록 + Access Application (path `/admin/*`) + policy (이메일 또는 GitHub login = 본인) + AUD claim 식별자 발급 + `docs/notes/cloudflare-access-setup.md` (재현 절차 + AUD 식별자 기록). **검증**: `/admin` 직접 접근 시 Cloudflare Access 로그인 화면 → GitHub OAuth → 본인 계정 통과 시 빈 admin 페이지 (T031 placeholder), 비본인 계정 reject.

## 시퀀스

```
1. Cloudflare dashboard → Zero Trust → team 생성 (Free 플랜)
2. Authentication → Login methods → GitHub OAuth IdP 등록 (Client ID / Secret 발급은 GitHub Settings → OAuth Apps)
3. Access → Applications → Self-hosted application 생성, hostname `tkstar.dev`, path `/admin/*`
4. Policy — Action=Allow, Selector=Emails(본인 이메일) OR GitHub login = `TaekyungHa`
5. Application 의 AUD (Audience) claim 식별자 복사 → wrangler.toml `[vars] ACCESS_AUD` 등록 (public 식별자)
6. Cookie 도메인 / session duration 24h / Cloudflare Access JWT 발행 도메인 (`<team>.cloudflareaccess.com`) 확인
7. 임시 `app/presentation/routes/admin.tsx` placeholder 라우트 생성 (T031 에서 정식)
8. 수동 검증 — 본인 계정 / 비본인 계정 / 미인증 3 케이스
9. docs/notes/cloudflare-access-setup.md — 재현 가능한 단계 + AUD / Team 도메인 / IdP slug 기록
```

## 엣지 케이스 + 구현

## Implementation Notes

- Cloudflare Zero Trust Free 플랜: 50 user 무료 — 본인 1명이라 충분.
- GitHub OAuth App 의 Authorization callback URL: `https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`.
- AUD claim 식별자는 Workers JWT 검증 (T030) 의 필수 input — public 식별자라 vars 로 등록 가능.
- 본 task 는 인프라 설정 task — 코드 변경은 placeholder 라우트 1개 + wrangler.toml + docs.
- Cloudflare Access 의 JWT 는 `cf-access-jwt-assertion` header + `CF_Authorization` cookie 양쪽으로 전달됨 — T030 에서 둘 다 처리.
- 본 task 의 Access Application 정책은 `/admin/*` path matcher — Workers 의 라우트 분기와 일치.
- Cookie domain — apex `tkstar.dev` 로 설정 (subdomain 미사용).
- session duration 24h — 본인용이라 길게.
- F023 의 모든 AC 가 본 task + T030 으로 분담 — 본 task 는 Cloudflare 측, T030 은 Workers 측.

## Change History from previous body

- chore branch PR: `chore/cloudflare-access-zero-trust-setup`.
- Phase 7.2 의 진입 task.

## DoD

- [ ] Zero Trust team 생성
- [ ] GitHub OAuth IdP 등록 + GitHub OAuth App callback URL 설정
- [ ] Access Application path=/admin/* + policy=본인 단일 등록
- [ ] AUD 식별자 발급 + wrangler.toml [vars] ACCESS_AUD 등록
- [ ] 임시 /admin placeholder 라우트 생성 (T031 에서 정식)
- [ ] 본인 계정 로그인 통과 → /admin 200
- [ ] 비본인 계정 reject
- [ ] 미인증 접근 시 Cloudflare Access 로그인 화면
- [ ] docs/notes/cloudflare-access-setup.md 작성 (재현 절차)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
