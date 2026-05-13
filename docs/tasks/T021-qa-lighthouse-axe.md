# T021 — chore: 전체 플로우 QA + Lighthouse + Axe 접근성 점검 + 커버리지 게이트

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T010](T010-home-page.md), [T011](T011-about-page.md), [T012](T012-projects-list-page.md), [T013](T013-project-detail-page.md), [T014](T014-blog-list-rss.md), [T015](T015-legal-routes.md), [T016](T016-command-palette.md), [T017](T017-contact-form-turnstile-resend.md), [T018](T018-satori-og-images.md), [T019](T019-seo-sitemap-robots-jsonld.md), [T020](T020-search-engine-registration-analytics.md), [T041](T041-blog-detail-page.md)
> **후행**: [T022](T022-deploy-domain-search-console.md), [T043](T043-mdx-renderer-workers-v8-eval-fix.md)

---

## 목적

MVP 배포 직전, 모든 페이지·라우트·폼·OG·SEO 경로를 수동/자동으로 검증한다. Lighthouse 4 카테고리 (Performance / Accessibility / Best Practices / SEO) 모두 90 이상, Axe critical/serious 0건, Vitest coverage threshold 통과를 게이트로 한다.

## PRD Feature ID 매핑

- F001
- F002
- F003
- F004
- F005
- F006
- F008
- F010
- F011
- F012
- F014
- F016
- F017
- F018

## 입력·출력 계약

**입력**: 모든 P3~P5 페이지·resource route 완성본. **출력**: `docs/qa/` 하위 Lighthouse 리포트 (Home/About/Project Detail/Blog Detail) + Axe 리포트 + Vitest coverage 리포트 + 발견 이슈는 별도 issue 로 분리. **검증**: Lighthouse 4 카테고리 ≥ 90, Axe critical/serious 0, coverage threshold (lines 80 / branches 75 / functions 80 / statements 80) 통과.

## 시퀀스

```
1. 전체 페이지 수동 클릭스루 — Home → About (Cmd+P print 확인) → Projects → Project Detail → Blog → Blog Detail → Contact (form submit 시 Turnstile + Resend 무인쇄 검증) → Legal
2. Cmd+K palette — 빈 입력 / 한글 IME / 키보드 nav / 다양한 검색어 시나리오
3. 다크모드 토글 — 시스템 추종 / 강제 라이트 / 강제 다크 + 새로고침 persist + FOIT 없음
4. Lighthouse — `bunx lighthouse https://<preview-url>/...` 4페이지 (Home/About/Project Detail/Blog Detail) 각각 desktop + mobile
5. Axe — `@axe-core/playwright` 또는 dev tools 확장으로 4페이지 critical/serious 0건
6. Vitest — `bun run test:coverage` threshold 통과 + 미커버 모듈 식별
7. OG endpoint 수동 호출 — `/og/projects/<slug>.png`, `/og/blog/<slug>.png` 둘 다 PNG 200
8. 발견 이슈는 별도 GitHub issue 분리 — 본 task 는 게이트 통과까지만 책임
```

## 엣지 케이스 + 구현

## Implementation Notes

- Lighthouse 90 미만 항목은 별도 issue 분리 후 본 task 통과 가능 — 단 SEO/Accessibility 는 90 이상 필수 (PRD §F018 정렬).
- Axe critical/serious 0건 강제 — moderate/minor 는 issue 분리 허용.
- coverage threshold 는 T003 의 설정 그대로 — lines 80 / branches 75 / functions 80 / statements 80.
- 본 task 의 산출물 (Lighthouse / Axe 리포트) 은 `docs/qa/<date>/` 에 저장 — git ignore 안 함, 추적 보존.
- preview-url 은 `bunx wrangler deploy --env preview` 산출물 또는 dev tunnel.
- iOS Safari + Android Chrome 모바일 실기기 점검은 옵션 — 본 task 는 desktop + Chrome devtools mobile 에뮬레이션까지 의무.
- F003 (PDF 인쇄) 은 Cmd+P 수동 시 1-3쪽 깔끔 출력 확인.
- 발견된 결함 중 critical 한 것은 별도 fix/* task 로 분리하여 머지 후 본 task 재실행.

## Change History from previous body

- chore branch PR: `chore/qa-lighthouse-axe`.
- T022 (배포) 진입 전 마지막 게이트.

## DoD

- [x] Home/About/Project Detail/Blog Detail 4페이지 Lighthouse desktop ≥ 90 (4 카테고리)
- [x] Home/About/Project Detail/Blog Detail 4페이지 Lighthouse mobile ≥ 90 (4 카테고리)
- [x] Axe critical/serious 0건 (4페이지)
- [x] Vitest coverage threshold 통과 (lines 80 / branches 75 / functions 80 / statements 80)
- [x] 전체 페이지 수동 클릭스루 무결함
- [x] Cmd+K palette 한글 IME + 키보드 nav 무결함
- [x] 다크모드 토글 3 상태 + FOIT 없음
- [x] Contact form 정상/실패/rate-limit 3 경로 검증
- [x] OG endpoint 2종 PNG 200
- [x] 발견 이슈 분리 (별도 GitHub issue)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-01 | T021 머지 — QA + Lighthouse + Axe + coverage 게이트 통과 (branch `chore/qa-lighthouse-axe`) | TaekyungHa |
