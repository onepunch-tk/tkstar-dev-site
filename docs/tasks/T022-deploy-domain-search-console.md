# T022 — chore: Cloudflare Workers 첫 배포 + tkstar.dev 도메인 연결 + Email Routing + Search Console 인증

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T021](T021-qa-lighthouse-axe.md), [T043](T043-mdx-renderer-workers-v8-eval-fix.md)
> **후행**: none

---

## 목적

검증 통과한 빌드를 Cloudflare Workers production env 에 처음으로 배포하고, `tkstar.dev` 커스텀 도메인을 연결한다. Email Routing 으로 `contact@tkstar.dev` → 본인 inbox, Search Console (Google + Naver) 소유권 인증을 완료한다.

## PRD Feature ID 매핑

- F008
- F019

## 입력·출력 계약

**입력**: T021 통과한 빌드 + tkstar.dev 도메인 (DNS Cloudflare 위임). **출력**: production worker 배포 + custom domain bind + Email Routing rule + Google Search Console 도메인 속성 인증 + Naver Search Advisor 인증 + sitemap 제출. **검증**: `https://tkstar.dev` 200, `https://www.tkstar.dev` 301 → apex, `contact@tkstar.dev` 메일 수신, Search Console 색인 요청 제출.

## 시퀀스

```
1. wrangler.toml `[env.production]` 확인 — vars / kv_namespaces / Asset Binding 모두 production 값
2. secrets — `bunx wrangler secret put TURNSTILE_SECRET --env production` 등 4종 (TURNSTILE_SECRET / RESEND_API_KEY / CONTACT_TO_EMAIL / CF_ANALYTICS_TOKEN — public 식별자는 vars)
3. `bunx wrangler deploy --env production` — 첫 배포
4. Cloudflare dashboard — Workers Routes 에 `tkstar.dev/*` + `www.tkstar.dev/*` 등록
5. DNS — Cloudflare DNS 에 apex A/AAAA proxied + www CNAME proxied (workers.dev 미사용)
6. workers/app.ts 의 host normalize (apex 301) — Launch Gate 정책과 무관 항상 동작 확인
7. Email Routing — `contact@tkstar.dev` → 본인 inbox 수신 rule 등록 + verification
8. Google Search Console — 도메인 속성 추가 + DNS TXT 인증 + sitemap.xml 제출
9. Naver Search Advisor — 사이트 등록 + 메타 인증 확인 + sitemap 제출
10. Launch Gate ON — wrangler.toml `[env.production.vars] SITE_LAUNCHED='true'` 변경 → redeploy → Search Console 'URL 검사' 색인 요청
```

## 엣지 케이스 + 구현

## Implementation Notes

- 첫 배포 직후 Launch Gate 는 `'false'` 유지 — robots.txt 가 전체 disallow, meta `noindex`. 색인 요청 전에 모든 페이지 production 실측 끝낸 후 Launch Gate ON.
- Cloudflare Workers Free 플랜은 100k req/day 한도 — 1인 사이트엔 충분. 본 task 시점에 Paid 플랜 (Workers Paid $5/mo) 으로 사전 전환 — CLAUDE.md 의 'Workers Paid plan' 사실 일치.
- Email Routing 은 Cloudflare 무료. SPF/DMARC 자동 세팅.
- DNS Cloudflare 위임이 안 되어 있으면 본 task 진입 불가 — pre-condition.
- www → apex 301 은 workers/app.ts 의 host normalize (Launch Gate 와 독립) 가 처리.
- Search Console 도메인 속성은 DNS TXT 인증 — 'URL 접두어 속성' 보다 모든 protocol/subdomain 커버.
- CLAUDE.md 의 Launch 절차 4단계 (vars 변경 → typecheck → deploy → 색인 요청) 와 정확히 일치.
- Resend 의 발신 도메인 인증 (DKIM/SPF/Return-Path) 도 본 task 에서 함께 — `noreply@tkstar.dev` 송신용.

## Change History from previous body

- A005 (Web Analytics 토큰) 실제 활성화.
- chore branch PR: `chore/deploy-domain-search-console`.
- MVP launch 시점 task.

## DoD

- [x] `bunx wrangler deploy --env production` 성공
- [x] https://tkstar.dev 200 응답 (production)
- [x] https://www.tkstar.dev 301 → apex
- [x] production secrets 4종 등록 (wrangler secret put)
- [x] Email Routing 으로 contact@tkstar.dev 수신 검증
- [x] Resend 발신 도메인 DKIM/SPF/Return-Path 인증
- [x] Google Search Console 도메인 속성 인증 + sitemap 제출
- [x] Naver Search Advisor 인증 + sitemap 제출
- [x] Launch Gate ON 후 색인 요청 제출 (4 페이지: Home/About/Projects/Blog)
- [x] Cloudflare Web Analytics dashboard 에 production traffic 수신

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-02 | T022 머지 — production 첫 배포 + 도메인 + Email Routing + Search Console (branch `chore/deploy-domain-search-console`) | TaekyungHa |
