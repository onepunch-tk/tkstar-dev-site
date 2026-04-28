# Task 022 — Cloudflare Workers 배포 + 도메인 연결 + Email Routing + 검색엔진 인증 완료

| Field | Value |
|-------|-------|
| **Task ID** | T022 |
| **Phase** | Phase 6 — Polish & Deploy |
| **Layer** | 운영 |
| **Branch** | `chore/deploy-production` |
| **Depends on** | T021 |
| **Blocks** | none |
| **PRD Features** | F019 (인증 완료), 운영 (도메인/이메일) |
| **PRD AC** | — (운영 검증) |
| **예상 작업 시간** | 1d (DNS 전파 대기 시간 별도) |
| **Status** | Not Started |

## Goal
`bunx wrangler deploy`로 Cloudflare Workers에 첫 배포하고, `tkstar.dev` 도메인 연결 + Cloudflare Email Routing + Resend domain verification + Google/Naver Search Console 인증을 모두 완료한다. 가정 A010(도메인 등록 채널) 결정 + A008(실제 토큰 주입) 완료.

## Context
- **Why**: 사이트의 사용자 노출 시작점. 모든 Phase 1~5의 산출물이 production URL에서 동작해야 PRD 목표(B2B/B2C 수렴)를 달성.
- **Phase 진입/완료 연결**: T021 QA 통과 후. T022 Done 후 실제 트래픽 수집(Cloudflare Web Analytics) 및 SEO 인덱싱 시작.
- **관련 PRD 섹션**: PRD `Tech Stack — Hosting / Edge / Email Routing`, `F019`, A008/A010
- **관련 PROJECT-STRUCTURE 디렉토리**: `wrangler.toml`, Cloudflare Dashboard 설정 (코드 변경 외)

## Scope

### In Scope
- `bunx wrangler deploy` 첫 배포 → `tkstar-dev.workers.dev` 우선 동작 확인
- 도메인 등록 채널 결정 (Cloudflare Registrar 또는 Porkbun → CF transfer) — A010 결정 시 기록
- `tkstar.dev` 도메인 등록 + Cloudflare DNS 연결 + Workers Custom Domain 매핑
- Cloudflare Email Routing 설정: `hello@tkstar.dev` → 개인 Gmail forward
- Resend domain verification — DKIM/SPF DNS record 추가 + Resend dashboard에서 verified 상태 확인
- Production secrets 주입: `bunx wrangler secret put RESEND_API_KEY` / `TURNSTILE_SECRET`
- Production vars 갱신: `wrangler.toml`에 실제 `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`, `CLOUDFLARE_ANALYTICS_TOKEN` 값 (또는 dashboard vars)
- KV namespace `RATE_LIMIT_KV` production id를 `wrangler.toml`에 확정 (T017에서 생성된 id 사용)
- Google Search Console 도메인 소유권 인증 + `https://tkstar.dev/sitemap.xml` 제출
- Naver Search Advisor `naver-site-verification` meta 검증 + sitemap 제출
- 배포 후 `site:tkstar.dev` 검색으로 indexing 확인 (수일 ~ 수주 소요)

### Out of Scope
- Bing Webmaster Tools (가정 A011, MVP 후)
- Motion 라이브러리 도입 (A012, MVP 후)

## Acceptance Criteria
- [ ] `bunx wrangler deploy` 성공 → `tkstar-dev.workers.dev` 첫 응답 정상
- [ ] `tkstar.dev` 도메인 DNS가 Cloudflare를 가리키며 Workers Custom Domain 매핑 완료
- [ ] `https://tkstar.dev` 접속 시 Home 정상 응답 (HTTPS, OG 미리보기 정상)
- [ ] `hello@tkstar.dev` → 개인 Gmail로 forward 정상 (실제 메일 1통 송수신 검증)
- [ ] Resend domain verification status: `verified`
- [ ] Production Contact Form 제출 → Resend 발신 + 자동응답 메일 정상 (실제 1회 검증)
- [ ] Google Search Console 도메인 소유권 인증 통과 + sitemap 제출 완료
- [ ] Naver Search Advisor 인증 통과 + sitemap 제출 완료
- [ ] (배포 후 수일~수주) `site:tkstar.dev` Google 검색에 최소 1개 페이지 indexing 확인

## Implementation Plan (TDD Cycle)
**N/A — chore branch policy.** 운영 task. 코드 변경은 wrangler.toml의 production 값 갱신 정도.

## Files to Create / Modify

### Config (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/wrangler.toml` | `[[kv_namespaces]]`의 `id`를 production id로 확정 / `[vars]`의 verification 토큰 값 확정 (또는 dashboard vars로 이관) / `routes` 또는 `custom_domains` 블록에 `tkstar.dev` 매핑 추가 |

### Reports
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/docs/reports/deploy-2026-MM-DD.md` | 배포 결과 + DNS 설정 + Email Routing 검증 + Resend domain verification + Search Console 인증 결과 |

## Verification Steps

### 자동
- `bunx wrangler deploy` exit 0
- production URL `curl -I https://tkstar.dev` → 200 응답 + `Content-Type: text/html`
- `curl https://tkstar.dev/sitemap.xml` → well-formed XML
- `curl https://tkstar.dev/og/projects/example-project.png` → 1200×630 PNG (size 검증)

### 수동
- 브라우저에서 `https://tkstar.dev` 접속 → 모든 페이지 정상
- Twitter/Facebook OG validator로 production URL 검증
- 실제 hello@tkstar.dev로 메일 1통 발송 → 개인 Gmail 수신
- Contact Form에서 실제 메일 1통 발송 → 본인 메일 + 자동응답 수신
- Google Search Console 대시보드에서 sitemap "성공" 상태 확인
- Naver Search Advisor 대시보드에서 sitemap "처리 완료" 상태 확인

### 측정
- production URL Lighthouse 점수 (T021 staging 측정 + production warm state 비교)

## Dependencies
- **Depends on**: T021 (QA 통과)
- **Blocks**: 없음 (Post-MVP는 별도 issue)

## Risks & Mitigations
- **Risk**: DNS 전파에 24~48h 소요 → 검색엔진 인증이 즉시 안됨.
  - **Mitigation**: 배포 D-1에 도메인 등록 + DNS 설정 선행, D-day에 인증 시도.
- **Risk**: Resend domain verification에서 DKIM/SPF DNS record 누락.
  - **Mitigation**: Resend dashboard 안내에 따라 5개 DNS record 추가 + verification 재시도.
- **Risk**: Cloudflare Workers의 production secrets 누출 위험.
  - **Mitigation**: `wrangler secret put`만 사용 (`wrangler.toml`에 secret 직접 기록 금지). git history에서 토큰 흔적 감사.

## References
- PRD `Tech Stack — Hosting / Edge / Email Routing`, `F019`
- ROADMAP.md `Phase 6` Task 022, 가정 A008 완료, A010 결정
- [Cloudflare Workers Custom Domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare Email Routing](https://developers.cloudflare.com/email-routing/)
- [Resend domain verification](https://resend.com/docs/dashboard/domains/introduction)
- [Google Search Console](https://search.google.com/search-console), [Naver Search Advisor](https://searchadvisor.naver.com/)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
