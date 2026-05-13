# T017 — feature: Contact Form (F008) + Turnstile (F009) + Resend + KV rate-limit

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T006](T006-domain-schemas.md), [T009](T009-di-container.md)
> **후행**: [T042](T042-contact-rate-limit-structure-update.md)

---

## 목적

방문자 → 본인 이메일 contact 채널을 완성한다. ContactSubmission 검증 (Domain) + Cloudflare Turnstile 검증 (Application) + Resend 이메일 발송 (Infrastructure) + KV rate-limit (IP 당 5분 5회). 성공 시 thank-you 페이지, 실패 시 inline 에러.

## PRD Feature ID 매핑

- F008
- F009

## 입력·출력 계약

**입력**: POST `/contact` action — `{ name, email, message, 'cf-turnstile-response' }`. **출력**: `app/presentation/routes/contact.tsx` action + `app/application/contact/services/submit-contact.ts` + `app/infrastructure/{email/resend.client.ts, captcha/turnstile.verifier.ts, kv/rate-limiter.ts}` + container wiring 확장. **검증**: 정상 입력 → Resend mock send 호출 + 303 redirect to `/contact/thanks`, Turnstile 실패 → 400, rate-limit 초과 → 429, validation 실패 → 422 + field errors.

## 시퀀스

```
1. Application — `submit-contact.ts` (ports: TurnstileVerifier + EmailSender + RateLimiter)
2. Infrastructure — `turnstile.verifier.ts` (siteverify API call), `resend.client.ts` (Resend SDK), `kv/rate-limiter.ts` (KV namespace `RATE_LIMIT_KV` + 5min/5req)
3. wrangler.toml — `[[kv_namespaces]] binding = RATE_LIMIT_KV` + secrets `TURNSTILE_SECRET` / `RESEND_API_KEY` / `CONTACT_TO_EMAIL`
4. container.ts 확장 — submitContact service 추가
5. contact.tsx form — name/email/message + Turnstile widget (사이트 키 env)
6. contact.tsx action — body parse → validate → submitContact 호출 → 성공 시 redirect, 실패 시 fieldErrors
7. contact/thanks.tsx — 정적 감사 페이지
8. RTL/Vitest — validation 실패 422, Turnstile 실패 400, rate-limit 초과 429, 성공 303 + Resend mock 호출
```

## 엣지 케이스 + 구현

## Implementation Notes

- rate-limit 키: `rl:contact:<ip>` (IP 는 `request.headers.get('cf-connecting-ip')`). 5분 TTL, count 5 초과 시 429.
- Turnstile siteverify body: `secret`, `response`, `remoteip` — application/x-www-form-urlencoded.
- Resend send: `from = noreply@tkstar.dev`, `to = CONTACT_TO_EMAIL`, `reply_to = <visitor email>`. Subject `[contact] <name>`.
- ContactSubmission validation (T006): name 2..80, email RFC 5322, message 10..5000.
- IP spoof 방지: `cf-connecting-ip` 만 신뢰, `x-forwarded-for` 무시.
- thank-you 페이지는 same-origin redirect (303 See Other) — POST 재제출 방지.
- Turnstile sitekey 는 env `VITE_TURNSTILE_SITEKEY` (public) + secret 은 `TURNSTILE_SECRET`.
- Resend free tier 한도 (월 3000 통) 는 1인 사이트 contact 트래픽으론 충분.
- 본 task 의 Email Routing 연결 (수신 측 본인 이메일) 은 T022 에서.

## Change History from previous body

- F008 + F009 동시 구현.
- feature branch PR: `feature/issue-N-contact-form-turnstile-resend`.
- T042 (Turnstile dev fallback / hardening) 가 후속.

## DoD

- [x] 정상 입력 → submitContact 호출 + 303 redirect to /contact/thanks
- [x] validation 실패 시 422 + fieldErrors inline 표시
- [x] Turnstile 실패 시 400
- [x] rate-limit 초과 (IP 5분 5회) 시 429
- [x] Resend SDK mock 으로 send 호출 검증
- [x] wrangler.toml KV namespace + 3 secrets 등록
- [x] container.ts 에 submitContact service wiring

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T017 머지 — Contact F008 + Turnstile F009 + Resend + KV rate-limit (branch `feature/issue-N-contact-form-turnstile-resend`) | TaekyungHa |
