# Task 017 — Contact Form + Turnstile + Resend + 자동응답 메일 (F008 + F009)

| Field | Value |
|-------|-------|
| **Task ID** | T017 |
| **Phase** | Phase 4 — Forms / Email |
| **Layer** | Application(`submit-contact-form.service`) + Infrastructure(Resend, Turnstile, React Email, Workers KV rate-limit) + Presentation(Form, Turnstile widget) |
| **Branch** | `feature/issue-66-contact-form-email` |
| **Depends on** | T002, T006, T008, T009, T017-pre |
| **Blocks** | — |
| **PRD Features** | **F008** (Contact Form), **F009** (Turnstile) |
| **PRD AC** | **AC-F008-1**, **AC-F008-2**, **AC-F008-3**, **AC-F008-4**, **AC-F009-1**, **AC-F009-2**, **AC-F009-3** |
| **예상 작업 시간** | 2.5d |
| **Status** | Completed (2026-05-04, PR pending) |

## Goal
Contact 페이지의 폼 검증 + Cloudflare Turnstile 클라이언트 위젯 + 서버 검증 + Resend 발신 + React Email 자동응답을 모두 가동시킨다. F008/F009의 7개 AC를 모두 자동 테스트로 통과 (rate-limit 포함). 가정 A009 해소.

## Context
- **Why**: B2B 채용 / B2C 의뢰 모든 분기의 수렴점. 메일 only 채널이라 스팸 방지 + rate-limit이 필수. Resend 무료 티어 + Turnstile + Workers KV 조합으로 운영 비용 0원 유지.
- **Phase 진입/완료 연결**: T006 (ContactSubmission schema) + T008/T009 (DI) + T017-pre (PROJECT-STRUCTURE 등록) Done 후. T017 Done 후 Phase 5(SEO/OG) 진입.
- **관련 PRD 섹션**: PRD `Page-by-Page — Contact Page`, `F008`, `F009`, AC-F008-1~4, AC-F009-1~3, `Tech Stack — Forms & Email`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/application/contact/{ports,services}/`, `app/infrastructure/{email,captcha,ratelimit}/`, `app/presentation/{routes/contact.tsx, components/contact/, hooks/useTurnstile.ts}`

## Scope

### In Scope
- **사전 단계 (PR 본 작업 전 1회)**:
  - `bunx wrangler kv namespace create RATE_LIMIT_KV` (production용) → 반환 `id` 기록
  - `bunx wrangler kv namespace create RATE_LIMIT_KV --preview` (preview/dev용) → 반환 `preview_id` 기록
  - `wrangler.toml`에 `[[kv_namespaces]] binding = "RATE_LIMIT_KV"`, `id`, `preview_id` 등록
  - `app/env.d.ts`의 `Env`(또는 `AppLoadContext`)에 `RATE_LIMIT_KV: KVNamespace` 추가
- **Application**: 3개 port + 1개 service
- **Infrastructure**: Resend 어댑터 + React Email 템플릿 + Turnstile 어댑터 + KV rate-limiter
- **Presentation**: Contact route(loader + action) + 4개 컴포넌트 + 1개 hook
- 환경변수 시크릿 등록: `RESEND_API_KEY`, `TURNSTILE_SECRET`, `CONTACT_TO_EMAIL`(var)
- `Container`에 `submitContactForm` service 등록 (T009 container 확장)

### Out of Scope
- Resend domain verification(DNS) — T022
- Cloudflare Email Routing 설정 — T022
- Turnstile site key 발급 — 배포 단계 (T022) (dev에는 test key 사용)

## Acceptance Criteria (PRD AC 인용 — 7개)
- [x] **AC-F008-1**: 사용자가 `/contact`에서 이름·이메일·메시지(10자 이상)·의뢰 유형을 채우고 Turnstile 통과 → `submit` 클릭 → Resend API가 1회 호출되어 hello@tkstar.dev → 본인 메일 발신 + 제출자 자동응답 메일 + 성공 화면
- [x] **AC-F008-2**: 이메일 RFC 5322 위반 (`foo@`, `foo.com`) → `submit` 클릭 → 클라이언트에서 차단 + 인라인 에러 + 네트워크 요청 미발생
- [x] **AC-F008-3**: 메시지 길이 10자 미만 또는 5000자 초과 → `submit` → 인라인 에러 + 폼 상태 유지
- [x] **AC-F008-4**: Resend API가 5xx 또는 네트워크 오류 → 응답 수신 → 에러 토스트 + `mailto:hello@tkstar.dev?subject=...&body=...` 폴백 (폼 입력값 prefill)
- [x] **AC-F009-1**: Contact 폼 마운트 → Turnstile 위젯 렌더 → `cf-turnstile-response` 토큰이 폼 상태에 바인딩 + 토큰 비어있으면 submit 버튼 비활성화
- [x] **AC-F009-2**: 클라이언트가 위조 토큰 함께 submit → 서버가 `https://challenges.cloudflare.com/turnstile/v0/siteverify` 검증 → `success: false` → 400 응답 + Resend 호출 일어나지 않음
- [x] **AC-F009-3**: 동일 IP가 1시간 내 5회 이상 submit → 6번째 submit → 서버 429 응답 + "잠시 후 다시 시도해주세요" (알려진 한계: TOCTOU race + fixed-window 경계 부스트 — 후속 task 에서 Cloudflare Rate Limiting binding 으로 교체)

### Task 추가 AC (Issue #5 보강)
- [x] `wrangler.toml`에 `[[kv_namespaces]]` 블록이 `binding = "RATE_LIMIT_KV"`, `id`, `preview_id` 모두 포함 (default + staging + production 환경별 분리)
- [x] `Env` 타입에 `RATE_LIMIT_KV: KVNamespace` 등록 (wrangler types 자동 생성)

## Implementation Plan (TDD Cycle)

### Red — Inside-Out 순서 (Domain → Application → Infrastructure → Presentation)

#### Domain (T006에서 이미 작성)
- `contact-submission.schema.test.ts` — AC-F008-2/3 검증 (T006에서 Green)

#### Application
- `app/application/contact/services/__tests__/submit-contact-form.service.test.ts`
  - mock `emailSender`, `captchaVerifier`, `rateLimiter` 주입
  - **AC-F008-1 happy path**: 모든 mock OK → emailSender.send 1회 호출 + autoReply 1회 호출 + 성공 반환
  - **AC-F009-2**: captchaVerifier.verify → false → throw `InvalidCaptchaError` → emailSender 미호출
  - **AC-F009-3**: rateLimiter.check → false → throw `RateLimitExceededError` → captchaVerifier 미호출
  - **AC-F008-4**: emailSender.send → 5xx throw → service가 그대로 throw → action에서 fallback

#### Infrastructure
- `app/infrastructure/email/__tests__/resend-email-sender.test.ts`
  - `fetch` mock — Resend API 200 → success
  - 5xx → throw
- `app/infrastructure/captcha/__tests__/turnstile-verifier.test.ts`
  - `fetch` mock — `siteverify` 200 + `success: true` → return true
  - 200 + `success: false` → return false
- `app/infrastructure/ratelimit/__tests__/kv-rate-limiter.test.ts` (Issue #5)
  - KV mock(`miniflare` 또는 in-memory map) — 5회 OK + 6번째 false
  - TTL 1시간 (`expirationTtl: 3600`) 검증

#### Presentation
- `app/presentation/routes/__tests__/contact.test.tsx`
  - **AC-F008-2 client**: 잘못된 이메일 입력 → submit 클릭 → action 호출되지 않음 (network mock count = 0)
  - **AC-F008-3 client**: 메시지 9자 또는 5001자 → submit → action 미호출 + 인라인 에러
  - **AC-F009-1**: Turnstile mock 토큰 비어있음 → submit 버튼 disabled
  - **AC-F008-4 fallback**: action mock이 5xx 응답 → mailto 링크 노출 + prefill body 검증
  - 통합: 전체 flow happy path

### Green
- 3 ports + 1 service (Application)
- 4 어댑터 (email, captcha, ratelimit, react-email template)
- contact route + 4 컴포넌트 + useTurnstile hook
- DI Container에 `submitContactForm` 추가

### Refactor
- error 변환 로직(`InvalidCaptchaError → 400`, `RateLimitExceededError → 429`)을 `app/application/contact/error-mapper.ts`로 추출
- React Email 템플릿의 본문 텍스트를 상수 module로 분리

## Files to Create / Modify

### Pre-step (사전 작업)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/wrangler.toml` | `[[kv_namespaces]] binding = "RATE_LIMIT_KV", id, preview_id` 등록 / `[vars] CONTACT_TO_EMAIL = "..."` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/env.d.ts` | `Env`에 `RATE_LIMIT_KV: KVNamespace` + `RESEND_API_KEY: string` + `TURNSTILE_SECRET: string` + `CONTACT_TO_EMAIL: string` |

### Application — Ports
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/contact/ports/email-sender.port.ts` | `interface EmailSender { send(to, subject, html, text?): Promise<void> }` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/contact/ports/captcha-verifier.port.ts` | `verify(token, ip): Promise<boolean>` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/contact/ports/rate-limiter.port.ts` | `check(key, max, windowSec): Promise<boolean>` |

### Application — Service
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/contact/services/submit-contact-form.service.ts` | rate-limit → captcha → email → autoReply 순차 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/contact/services/__tests__/submit-contact-form.service.test.ts` | 4 분기 |

### Infrastructure
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/email/resend-email-sender.ts` | implements EmailSender, Resend HTTP API |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/email/templates/AutoReplyEmail.tsx` | React Email 템플릿 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/email/__tests__/resend-email-sender.test.ts` | fetch mock |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/captcha/turnstile-verifier.ts` | implements CaptchaVerifier, siteverify HTTP API |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/captcha/__tests__/turnstile-verifier.test.ts` | fetch mock |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/ratelimit/kv-rate-limiter.ts` | implements RateLimiter, Workers KV `RATE_LIMIT_KV` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/ratelimit/__tests__/kv-rate-limiter.test.ts` | KV mock |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/container.ts` (수정) | `submitContactForm` 추가 |

### Presentation
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/contact.tsx` | loader (Turnstile site key) + action (submit) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/contact.test.tsx` | 통합 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/contact/ContactForm.tsx` | 폼 UI + 클라이언트 검증 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/contact/TurnstileWidget.tsx` | Turnstile 위젯 마운트 + 토큰 콜백 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/contact/SuccessScreen.tsx` | 성공 화면 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/contact/MailtoFallback.tsx` | AC-F008-4 폴백 링크 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/useTurnstile.ts` | 위젯 라이프사이클 |

## Verification Steps

### 자동
- `bun run test` — 모든 layer의 테스트가 7개 AC를 매핑하여 Green
- AC ID가 test 이름에 명시 (e.g. `it("AC-F008-1 — happy path", ...)`)
- `bun run test:coverage` threshold 통과

### 수동
- `wrangler dev --local` (Turnstile test key + KV local)에서 폼 제출 happy path 시각 확인
- 의도적으로 Turnstile token 비활성 → submit 버튼 disabled 확인
- 잘못된 이메일 → 인라인 에러
- Resend가 dev key로 정상 발신되는지 (또는 mock으로 대체)
- KV mock으로 rate-limit 5회 + 6번째 429 시각 확인

### 측정
- 없음

## Dependencies
- **Depends on**: T002 (디렉토리), T006 (ContactSubmission schema), T008 (DI 컨벤션), T009 (DI Container), T017-pre (PROJECT-STRUCTURE 등록)
- **Blocks**: 없음

## Risks & Mitigations
- **Risk**: Workers KV의 `eventually consistent` 특성으로 rate-limit이 잠시 빠질 수 있음.
  - **Mitigation**: KV가 한 region 안에서는 strongly consistent. AC-F009-3은 동일 IP 기준이므로 1 region 안에서 검증 → 충분.
- **Risk**: Turnstile site key가 wrangler.toml에 노출되면 안됨 (secret).
  - **Mitigation**: `TURNSTILE_SECRET`은 `wrangler secret put`으로 등록. site key는 vars 가능 (공개 가능).
- **Risk**: Resend가 React Email 템플릿을 HTML+plain text 둘 다 지원해야 함.
  - **Mitigation**: React Email의 `render()` 출력 + `convertHtmlToText` 옵션 사용.

## References
- PRD `Page-by-Page — Contact Page`, `F008`, `F009`, AC-F008-1~4, AC-F009-1~3
- PROJECT-STRUCTURE.md `Cross-cutting Concerns Mapping` (Contact 관련 행)
- ROADMAP.md `Phase 4` Task 017 (Issue #3/#5 보강 반영)
- T017-pre task file (PROJECT-STRUCTURE 등록 사전 작업)
- [Resend HTTP API](https://resend.com/docs/api-reference/emails/send-email)
- [Cloudflare Turnstile siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Workers KV namespace](https://developers.cloudflare.com/kv/api/)
- [React Email](https://react.email/)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-05-04 | KV namespace 4개 (default/preview/staging/production) 생성 + wrangler.toml 환경별 분리. Application(submit-contact-form.service + 3 ports + 3 errors + AutoReplyEmail React Email 템플릿) + Infrastructure(Resend HTTP API / Turnstile siteverify / KV rate-limiter — `contact:{ip}:{yyyy-mm-dd-hh}` TTL 3600s) + Presentation(loader + action 분기 + ContactForm/TurnstileWidget/SuccessScreen/MailtoFallback). Phase 3 review 반영: H2 (CF-Connecting-IP only), M2 (auto-reply swallow), M3 (parallel render), C-1~C-4 (디자인 토큰 + a11y + 다크모드). 315/315 테스트 통과. Polish 5건 + H1(KV race) 별도 task. | TaekyungHa |
