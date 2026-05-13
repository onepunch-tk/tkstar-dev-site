# T004 — feature: 라우트 스켈레톤 13개 + chrome / chrome-free 레이아웃

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T002](T002-ca-4layer-skeleton.md), [T003](T003-vite-rr7-workers-tailwind-pipeline.md)
> **후행**: [T010](T010-home-page.md), [T011](T011-about-page.md), [T012](T012-projects-list-page.md), [T013](T013-project-detail-page.md), [T014](T014-blog-list-rss.md), [T015](T015-legal-routes.md)

---

## 목적

PRD 의 모든 페이지·resource route 에 해당하는 빈 라우트 파일을 만들고, ChromeLayout / ChromeFreeLayout 두 레이아웃을 도입한다. 각 URL 을 직접 입력 시 placeholder 응답이 와야 하며, App Terms/Privacy 는 chrome-free, splat 라우트는 Not Found Fallback placeholder.

## PRD Feature ID 매핑

- F014
- F018
- F019
- F004

## 입력·출력 계약

**입력**: T003 의 빈 _index.tsx + flatRoutes. **출력**: `app/presentation/routes/` 안 13개 라우트 파일 + 2개 resource route 추가 + 2개 OG resource route + splat `$.tsx` + `app/presentation/layouts/{ChromeLayout.tsx, ChromeFreeLayout.tsx}`. **검증**: `wrangler dev` 에서 각 URL 직접 입력 시 placeholder 페이지 렌더, App Terms/Privacy 에 Topbar/Footer 미노출, splat 라우트는 터미널 메시지 placeholder.

## 시퀀스

```
1. 콘텐츠 라우트 — `_index.tsx` (Home) / `about.tsx` / `projects._index.tsx` / `projects.$slug.tsx` / `blog._index.tsx` / `blog.$slug.tsx` / `contact.tsx` 생성
2. Legal 라우트 — `legal._index.tsx` / `legal.$app.terms.tsx` / `legal.$app.privacy.tsx` (chrome-free)
3. Resource 라우트 — `rss[.xml].tsx` / `sitemap[.xml].tsx` / `robots[.txt].tsx`
4. OG Resource 라우트 — `og.projects.$slug[.png].tsx` / `og.blog.$slug[.png].tsx`
5. Splat 라우트 — `$.tsx` (Not Found Fallback placeholder)
6. Layout — `ChromeLayout.tsx` (Topbar/Footer 포함) + `ChromeFreeLayout.tsx` (Topbar/Footer 미렌더)
7. 각 라우트가 적절한 layout 을 마운트하도록 wiring + wrangler dev 검증
```

## 엣지 케이스 + 구현

## Implementation Notes

- splat 라우트 (`$.tsx`) 채택은 A004 (Not Found Fallback 전략) 해소 — ErrorBoundary 가 아닌 splat 으로 결정. 이유: F018/F019 차등 인덱싱 정책 (`noindex,nofollow`) 을 splat 에서 meta export 로 명시적 제어 용이.
- ChromeFree 적용 대상: `legal.$app.terms.tsx`, `legal.$app.privacy.tsx`. Legal Index (`legal._index.tsx`) 자체는 chrome 유지.
- OG resource route 는 placeholder loader 만 — 실제 PNG 생성은 T018 에서.
- React Router v7 flatRoutes 의 `[.xml]` / `[.png]` 의 대괄호 escape 는 파일명에 직접 포함되어야 함 (resource route 컨벤션).
- 빈 layout 도 본 task 단계에선 children 렌더만.

## Change History from previous body

- A004 (Not Found Fallback 전략) 해소.
- T010~T015 의 페이지 task 들이 본 task 의 라우트 자리에 콘텐츠를 채움.
- feature branch PR: `feature/issue-N-route-skeleton`.

## DoD

- [x] 콘텐츠 라우트 7개 (`_index`, `about`, `projects._index`, `projects.$slug`, `blog._index`, `blog.$slug`, `contact`) 모두 placeholder 응답
- [x] Legal 라우트 3개 (`legal._index`, `legal.$app.terms`, `legal.$app.privacy`) 생성
- [x] Resource 라우트 3개 (`rss[.xml]`, `sitemap[.xml]`, `robots[.txt]`) placeholder
- [x] OG resource 라우트 2개 (`og.projects.$slug[.png]`, `og.blog.$slug[.png]`) placeholder
- [x] Splat `$.tsx` 라우트 Not Found Fallback placeholder
- [x] ChromeLayout + ChromeFreeLayout 2개 레이아웃 마운트 동작
- [x] App Terms/Privacy 에 Topbar/Footer 미노출 확인
- [x] A004 (splat vs ErrorBoundary) 해소 — splat 채택 기록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | T004 머지 — 라우트 스켈레톤 13+ 라우트 + 2 layout (branch `feature/issue-N-route-skeleton`) | TaekyungHa |
