# T020 — feature: 검색엔진 등록 (F019) + Cloudflare Web Analytics (F013)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T019](T019-seo-sitemap-robots-jsonld.md)
> **후행**: [T022](T022-deploy-domain-search-console.md)

---

## 목적

Google Search Console + Naver Search Advisor 소유권 인증 메타/파일을 도입하고, Cloudflare Web Analytics 비콘을 root layout 에 임베드한다. 검색엔진 색인 요청은 T022 (배포 후) 수행.

## PRD Feature ID 매핑

- F013
- F019

## 입력·출력 계약

**입력**: T019 의 sitemap.xml + robots.txt + Launch Gate 분기. **출력**: `public/google<hash>.html` (Search Console 파일 인증) + Naver `<meta name='naver-site-verification' content='<hash>'>` (root layout) + Cloudflare Web Analytics 비콘 (`<script src='https://static.cloudflareinsights.com/...' data-cf-beacon=...>`) + `.env`/wrangler secrets 정의. **검증**: `/google<hash>.html` 200 응답, root layout 의 naver meta + cloudflareinsights script 렌더, Launch Gate ON 후 Search Console 인증 통과 (수동).

## 시퀀스

```
1. Google Search Console — '도메인 속성' 대신 'URL 접두어 속성' 채택 시 파일 인증 / 도메인 속성 채택 시 DNS TXT (T022 에서 처리)
2. Naver Search Advisor — `<meta name='naver-site-verification' content='<hash>'>` 를 `app/root.tsx` 의 `<head>` 에 조건부 (production env) 렌더
3. Cloudflare Web Analytics — beacon token 발급 후 `data-cf-beacon='{"token":"<token>"}'` script 임베드
4. wrangler.toml — `[vars]` 에 public 식별자 `NAVER_VERIFICATION_HASH` / `CF_ANALYTICS_TOKEN` 등록 (또는 hardcode — 식별자는 public)
5. Launch Gate 검사 — `SITE_LAUNCHED='false'` 시 검색엔진 인증 메타도 생략 (인덱싱 자체가 차단되어 무의미)
6. DNT (Do Not Track) 대응 — Cloudflare Web Analytics 는 쿠키리스라 본 task 에선 추가 처리 불필요
7. RTL — root meta naver-site-verification 렌더 + cloudflareinsights script tag 존재
```

## 엣지 케이스 + 구현

## Implementation Notes

- Cloudflare Web Analytics 는 자사 도메인 + Workers 사용 시 자동 등록 가능 — 본 task 의 manual script 임베드는 보강용.
- Naver Search Advisor 의 meta 는 `https://searchadvisor.naver.com/` 콘솔에서 sitemap 제출 시 함께 등록.
- 'URL 접두어 속성' vs '도메인 속성' — T022 에서 DNS 설정 시 최종 결정. 본 task 는 두 방법 모두 지원하도록 파일 + 메타 양쪽 준비.
- Launch Gate ON 전엔 검색엔진 인증 요청 자체 안 함 — 본 task 는 코드/메타만 준비.
- A005 (Cloudflare Web Analytics) 의 토큰 발급 절차 사실 기록 — CLAUDE.md 의 secret 원칙 (commit 금지) 일치.
- Naver/Google verification hash 는 public (HTML 에 노출됨) — secret 아님, wrangler `[vars]` 또는 hardcode 둘 다 가능.
- F013 (Analytics) + F019 (검색엔진 등록) 동시 구현.

## Change History from previous body

- A005 (Web Analytics 토큰 발급 절차) 사실 기록.
- feature branch PR: `feature/issue-N-search-engine-registration-analytics`.
- T022 (배포 후) 가 본 task 의 인증을 실제 활성화.

## DoD

- [x] Naver naver-site-verification meta 가 production env 에서 root layout 에 렌더
- [x] Google 파일 인증용 `public/google<hash>.html` 200 응답
- [x] Cloudflare Web Analytics beacon script 임베드
- [x] Launch Gate OFF 시 인증 메타 생략 분기
- [x] wrangler.toml `[vars]` 에 NAVER_VERIFICATION_HASH + CF_ANALYTICS_TOKEN 등록 (public 식별자)
- [x] RTL — root meta + analytics script 렌더 확인
- [x] A005 토큰 발급 절차 사실 기록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T020 머지 — F013 Analytics + F019 검색엔진 등록 메타 + Launch Gate 일치 (branch `feature/issue-N-search-engine-registration-analytics`) | TaekyungHa |
