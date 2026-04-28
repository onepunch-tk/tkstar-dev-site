# Task 020 — F019 검색엔진 등록 (Google + Naver) + Cloudflare Web Analytics (F013)

| Field | Value |
|-------|-------|
| **Task ID** | T020 |
| **Phase** | Phase 5 — SEO / OG / Indexing |
| **Layer** | Presentation(root layout) + Infrastructure(analytics 스니펫) |
| **Branch** | `feature/issue-N-search-engine-verification` |
| **Depends on** | T019 |
| **Blocks** | T021 |
| **PRD Features** | **F019** (검색엔진 등록), **F013** (Cloudflare Web Analytics) |
| **PRD AC** | — (배포 후 `site:tkstar.dev` 인덱싱 확인) |
| **예상 작업 시간** | 0.5d |
| **Status** | Not Started |

## Goal
환경변수(`GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`)가 설정되어 있으면 root layout `<head>`에 verification meta 태그를 조건부 렌더하고, Cloudflare Web Analytics 스니펫을 삽입한다 (쿠키 없음).

## Context
- **Why**: 한국어 사이트는 Naver 등록이 사실상 필수. Google은 글로벌. Bing은 가정 A011로 MVP 후. Web Analytics는 트래픽 가시성 확보 (운영 판단용).
- **Phase 진입/완료 연결**: T019 SEO meta가 갖춰진 후 시작. T020 Done 후 Phase 6 QA(T021).
- **관련 PRD 섹션**: PRD `F019`, `F013`, `Tech Stack — SEO & Indexing`, A008 가정 (verification 토큰 wrangler vars)
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/root.tsx`, `app/infrastructure/analytics/cloudflare-web-analytics.ts`, `wrangler.toml` vars

## Scope

### In Scope
- root layout에서 `env.GOOGLE_SITE_VERIFICATION` / `env.NAVER_SITE_VERIFICATION` env가 truthy일 때 `<meta>` 태그 조건부 렌더
- Cloudflare Web Analytics `<script>` 스니펫 (env `CLOUDFLARE_ANALYTICS_TOKEN`)
- `app/infrastructure/analytics/cloudflare-web-analytics.ts` — 스니펫 헬퍼 (서버사이드 token 주입)
- `wrangler.toml`에 `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`, `CLOUDFLARE_ANALYTICS_TOKEN` (vars) 등록 (현재는 placeholder, T022에서 실제 값 주입)

### Out of Scope
- 실제 Search Console / Naver Search Advisor 도메인 등록 — T022 (배포 후)
- Bing Webmaster Tools — A011 가정, MVP 후
- DNS / 도메인 등록 — T022

## Acceptance Criteria
- [ ] `wrangler dev`에서 `GOOGLE_SITE_VERIFICATION = "abc123"` 설정 시 root `<head>`에 `<meta name="google-site-verification" content="abc123">` 렌더
- [ ] env 미설정 시 verification meta 미렌더
- [ ] `NAVER_SITE_VERIFICATION = "xyz789"` 설정 시 `<meta name="naver-site-verification" content="xyz789">` 렌더
- [ ] `CLOUDFLARE_ANALYTICS_TOKEN = "token123"` 설정 시 root `<body>` 끝에 Cloudflare Web Analytics `<script>` 스니펫 삽입
- [ ] Web Analytics가 쿠키를 설정하지 않음 (DevTools Application → Cookies 검증)
- [ ] 가정 A008 — wrangler vars로 토큰 주입 패턴 확정. A011/A012는 MVP 후로 잔존.

## Implementation Plan (TDD Cycle)

### Red
- `app/root.test.tsx` (또는 `app/__tests__/root.test.tsx`)
  - `env.GOOGLE_SITE_VERIFICATION = "abc"`인 mock context → `<meta name="google-site-verification" content="abc">` 렌더
  - `env.NAVER_SITE_VERIFICATION = "xyz"` → `<meta name="naver-site-verification">`
  - env 모두 미설정 → verification meta 미렌더
- `app/infrastructure/analytics/__tests__/cloudflare-web-analytics.test.ts`
  - token 인자로 호출 → 정확한 스니펫 문자열 반환
  - token undefined → 빈 문자열 또는 null 반환

### Green
- `app/root.tsx` 수정 — env에서 verification 값 읽고 conditional `<meta>` 렌더
- `app/infrastructure/analytics/cloudflare-web-analytics.ts` — `getAnalyticsSnippet(token): string`
- `wrangler.toml`에 vars 추가 (placeholder)

### Refactor
- root에서 verification + analytics 처리를 `<RootMetaHead env={env} />` 컴포넌트로 추출

## Files to Create / Modify

### Root (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/root.tsx` | env 기반 verification meta + Cloudflare Web Analytics 스니펫 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/__tests__/root.test.tsx` | RTL + env mock |

### Infrastructure
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/analytics/cloudflare-web-analytics.ts` | 스니펫 헬퍼 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/analytics/__tests__/cloudflare-web-analytics.test.ts` | unit |

### Config (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/wrangler.toml` | `[vars]`에 `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`, `CLOUDFLARE_ANALYTICS_TOKEN` 추가 (placeholder, T022에서 실제 값) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/env.d.ts` | `Env`에 위 3개 추가 |

## Verification Steps

### 자동
- `bun run test` — root + analytics 테스트 Green
- env 분기 케이스 (set / unset) 모두 통과

### 수동
- `wrangler dev`에서 vars placeholder 값으로 verification meta + Web Analytics 스니펫이 view-source에 노출 확인
- DevTools → Application → Cookies가 비어있음 (Web Analytics는 쿠키 없음)

### 측정
- 없음 (실제 Search Console 등록은 T022)

## Dependencies
- **Depends on**: T019 (SEO 정합성 확보 후)
- **Blocks**: T021 (Phase 6 QA 진입)

## Risks & Mitigations
- **Risk**: Cloudflare Web Analytics 스니펫이 SSR/CSR 양쪽에서 동작 시 hydration mismatch.
  - **Mitigation**: 스니펫은 SSR 출력만 — `<script defer src="...">` 형태로 `<body>` 끝에 1회 삽입, 클라이언트 hydration이 SSR HTML을 그대로 사용 → mismatch 없음.

## References
- PRD `F019`, `F013`, A008 가정
- ROADMAP.md `Phase 5` Task 020, 가정 A008 해소(wrangler vars 패턴)
- [Cloudflare Web Analytics docs](https://developers.cloudflare.com/web-analytics/)
- [Google Search Console verification](https://support.google.com/webmasters/answer/9008080)
- [Naver Search Advisor](https://searchadvisor.naver.com/)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
