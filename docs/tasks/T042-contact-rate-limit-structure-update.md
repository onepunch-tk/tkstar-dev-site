# T042 — docs: PROJECT-STRUCTURE 갱신 — Contact rate-limit + KV binding 문서화 (T017 후속)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `docs/`
> **선행**: [T017](T017-contact-form-turnstile-resend.md)
> **후행**: [T021](T021-qa-lighthouse-axe.md)

---

## 목적

T017 (Contact Form + Turnstile + Resend + KV rate-limit) 머지 후, `docs/PROJECT-STRUCTURE.md` 가 KV 바인딩 / rate-limiter 모듈 / Turnstile verifier 위치를 반영하지 못한 채로 남아 후속 task 의 layer 배치 판단이 흐려진 문제를 해소한다. 코드 변경 없음 — 문서만 갱신.

## PRD Feature ID 매핑

- F008
- F009

## 입력·출력 계약

**입력**: T017 머지본 + 현행 `docs/PROJECT-STRUCTURE.md`. **출력**: `docs/PROJECT-STRUCTURE.md` 갱신본 — `app/infrastructure/{captcha/turnstile.verifier.ts, kv/rate-limiter.ts, email/resend.client.ts}` 명시, wrangler.toml 의 `RATE_LIMIT_KV` 바인딩 정의, container 의 submitContact wiring 다이어그램. **검증**: docs lint (markdown link check), PR review 에서 layer 배치/바인딩 명세 일관성.

## 시퀀스

```
1. PROJECT-STRUCTURE.md 의 Infrastructure section 에 captcha/kv/email 3 모듈 추가
2. wrangler.toml 바인딩 표에 RATE_LIMIT_KV (KV) + TURNSTILE_SECRET / RESEND_API_KEY / CONTACT_TO_EMAIL (secret) 명시
3. container 다이어그램 갱신 — submitContact service 의 ports 3개 (TurnstileVerifier / EmailSender / RateLimiter) 시각화
4. rate-limit 정책 (IP 당 5분 5회, cf-connecting-ip 신뢰) 문서화
5. Contact 흐름 sequence — request → action → submitContact → (verifyTurnstile → rateLimit → sendEmail) → redirect
6. 기존 docs/tasks/T017-pre 의 내용 통합 — 본 task 가 정식 task ID 부여
7. markdown link check + spell check
```

## 엣지 케이스 + 구현

## Implementation Notes

- 본 task 는 코드 0 byte 변경 — 순수 docs.
- branch_type=docs 라 chore 와 별도 — CLAUDE.md 의 doc-only 정책상 Issue 면제, PR 만.
- 기존 docs/tasks/T017-pre 의 정보 (KV binding / rate-limiter / Turnstile verifier 위치) 를 정식 task ID (T042) 로 옮긴 케이스 — interstitial task.
- PROJECT-STRUCTURE.md 는 PRD/ROADMAP 과 함께 MANDATORY 문서 — 코드와 drift 방지가 본 task 의 핵심.
- T021 QA 진입 전 본 task 머지 필수 — 리뷰어가 layer 배치 판단 시 PROJECT-STRUCTURE 를 SoT 로 사용.
- 다이어그램은 mermaid sequence — repo의 다른 mermaid block 과 스타일 일치.
- F008 / F009 cover 는 이미 T017 의 task 본문에 있으므로 본 task 의 prd_feature_ids 는 참조만.

## Change History from previous body

- docs branch PR: `docs/contact-rate-limit-structure-update`.
- 구 docs/tasks/T017-pre 통합.

## DoD

- [x] PROJECT-STRUCTURE.md Infrastructure section 에 captcha/kv/email 3 모듈 추가
- [x] wrangler 바인딩 표 갱신 (RATE_LIMIT_KV + 3 secrets)
- [x] container 다이어그램에 submitContact + 3 ports 시각화
- [x] Contact 흐름 sequence 다이어그램 추가
- [x] rate-limit 정책 (5분 5회 / cf-connecting-ip) 명시
- [x] markdown link check Green
- [x] 구 docs/tasks/T017-pre 내용 통합 + 폐기

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T042 머지 — PROJECT-STRUCTURE Contact rate-limit/KV 문서화 (branch `docs/contact-rate-limit-structure-update`, 구 docs/tasks/T017-pre 통합) | TaekyungHa |
