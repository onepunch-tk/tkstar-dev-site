# T015 — feature: Legal Routes (F014 App Terms/Privacy + Legal Index)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T004](T004-route-skeleton.md), [T006](T006-domain-schemas.md), [T007](T007-velite-content-pipeline.md), [T008](T008-content-ports-repos.md)
> **후행**: none

---

## 목적

앱별 약관/개인정보처리방침 라우팅 (`/legal/$app/terms`, `/legal/$app/privacy`) 을 활성화한다. velite legal collection → AppLegalDoc Entity → ChromeFreeLayout 으로 렌더. Legal Index (`/legal`) 는 앱 목록 + 각 앱의 terms/privacy 링크.

## PRD Feature ID 매핑

- F014
- F018

## 입력·출력 계약

**입력**: T008 container 의 `findAppDoc({ app, kind })` + `listApps()`. **출력**: `legal._index.tsx` + `legal.$app.terms.tsx` + `legal.$app.privacy.tsx` + `meta` export + ChromeFreeLayout 활성. **검증**: `/legal/moai/terms` 직접 접근 시 chrome 미노출, 미존재 app 404, version + effective_date 표시.

## 시퀀스

```
1. legal._index.tsx — listApps() 호출 → 앱 카드 + 각 앱의 terms/privacy 링크 2개
2. legal.$app.terms.tsx + legal.$app.privacy.tsx loader — `findAppDoc({ app: params.app, kind })`
3. AppLegalDoc 렌더 — title + version badge + effective_date + MdxRenderer body
4. ChromeFreeLayout 적용 — Topbar/Footer 미렌더 (T004 의 layout 활용)
5. 미존재 app 또는 kind → 404 응답
6. meta export — title `<App> Terms | tkstar.dev` + `noindex,follow` (legal 페이지는 인덱싱 제외 결정)
7. RTL — chrome 미노출 + version/date 표시 + 404 응답
```

## 엣지 케이스 + 구현

## Implementation Notes

- legal 페이지 robots: `noindex,follow` — 검색엔진 크롤은 허용 안 함 (PRD §F014 의 '앱 약관은 앱 스토어 메타와 동기화' 정책).
- legal._index 자체는 chrome 유지 (ChromeLayout) — 약관 본문 페이지만 ChromeFreeLayout.
- AppLegalDoc 의 `version` (semver) 과 `effective_date` (ISO date) 는 T006 의 표준 메타 (A003 해소).
- 본 task 시점의 seed legal 본문 (T007 의 placeholder) 을 정식 본문으로 갱신.
- 다국어 지원은 본 task 범위 외 — 한국어 only.
- 앱 식별자 `$app` 은 슬러그 (예: `moai`) — 한글/대문자 disallow (frontmatter schema 에서 강제).
- F018 (sitemap 의 legal 페이지 등록 정책) 은 T019 에서 — legal 은 noindex 라 sitemap 등록 안 함.

## Change History from previous body

- feature branch PR: `feature/issue-N-legal-routes`.
- A003 (Legal 표준 메타) 소비.

## DoD

- [x] /legal/$app/terms + /legal/$app/privacy 라우트 동작
- [x] ChromeFreeLayout 적용으로 Topbar/Footer 미노출
- [x] version + effective_date badge 표시
- [x] /legal 인덱스가 앱 목록 + 링크 2개씩 렌더
- [x] 미존재 app/kind 404 응답
- [x] meta robots `noindex,follow`

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T015 머지 — Legal F014 + ChromeFreeLayout + 표준 메타 (branch `feature/issue-N-legal-routes`) | TaekyungHa |
