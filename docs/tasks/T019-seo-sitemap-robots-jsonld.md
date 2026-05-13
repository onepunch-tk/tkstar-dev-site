# T019 — feature: SEO Meta + Sitemap + Robots + JSON-LD (F018)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T010](T010-home-page.md), [T011](T011-about-page.md), [T012](T012-projects-list-page.md), [T013](T013-project-detail-page.md), [T014](T014-blog-list-rss.md), [T015](T015-legal-routes.md), [T018](T018-satori-og-images.md), [T041](T041-blog-detail-page.md)
> **후행**: [T020](T020-search-engine-registration-analytics.md)

---

## 목적

전체 페이지의 SEO 메타 (title/description/canonical/og:*/twitter:*) 표준화 + `/sitemap.xml` + `/robots.txt` 활성화 + JSON-LD (Person / WebSite / BreadcrumbList / Article / SoftwareApplication) 임베드. F018 의 모든 AC 충족.

## PRD Feature ID 매핑

- F018

## 입력·출력 계약

**입력**: 모든 페이지 라우트. **출력**: `app/application/seo/services/build-meta.ts` + 페이지별 `meta` export 갱신 + `sitemap[.xml].tsx` loader + `robots[.txt].tsx` loader + JSON-LD `<script type=application/ld+json>` 임베드. **검증**: 모든 페이지 meta title/description/canonical/og/twitter 4종 세트, `/sitemap.xml` 응답 Content-Type `application/xml` + XML Sitemap 0.9 schema valid, `/robots.txt` 응답 Content-Type `text/plain`, 각 페이지 JSON-LD schema valid.

## 시퀀스

```
1. Application — `build-meta.ts` (title/description/canonical/og/twitter/jsonld 통합 빌더)
2. 각 페이지 (T010~T015, T041) 의 meta export 를 buildMeta 호출로 통일
3. sitemap[.xml].tsx loader — Home/About/Projects/Blog/legal 등 모든 indexable URL 수집 → XML Sitemap 0.9
4. robots[.txt].tsx loader — `User-agent: * \nAllow: / \nDisallow: /admin/ \nSitemap: https://tkstar.dev/sitemap.xml` (Launch Gate 미운영 시 disallow all)
5. JSON-LD — Home (Person + WebSite + WebSite Search Action), About (Person), Project (SoftwareApplication + BreadcrumbList), Post (Article + BreadcrumbList)
6. canonical 자동 — `request.url` 기반 절대 URL + query strip
7. twitter:card = summary_large_image, twitter:site = @<handle>
8. RTL/Vitest — sitemap XML schema, robots Content-Type, JSON-LD JSON parse + schema.org validator (오프라인 schema fixture)
```

## 엣지 케이스 + 구현

## Implementation Notes

- legal 페이지는 sitemap 등록 안 함 (T015 의 noindex 정책 일치).
- canonical 은 query string 제거 — Projects 의 `?tag=` filter 페이지도 base canonical `/projects` 만 표시.
- og:locale = ko_KR (전체 페이지 한국어).
- og:image fallback (Home/About 등 slug 없는 페이지) — `/og/static/default.png` 빌드 산출물 또는 정적 자산.
- JSON-LD Person — name / url / sameAs (GitHub, LinkedIn) / jobTitle.
- Article schema — headline / datePublished / dateModified / author (Person) / image (og:image).
- SoftwareApplication — name / applicationCategory / operatingSystem / softwareVersion (project frontmatter).
- robots.txt 는 Launch Gate (`SITE_LAUNCHED='false'`) 시 전체 disallow — CLAUDE.md 의 Launch Gate 정책 일치.
- `/sitemap.xml` 도 Launch Gate 시 빈 `<urlset/>` — 본 task 에서 이 분기 처리.
- twitter:creator handle 은 본인 X 계정.

## Change History from previous body

- F018 (모든 SEO AC) 충족.
- Launch Gate 정책 통합.
- feature branch PR: `feature/issue-N-seo-sitemap-robots-jsonld`.

## DoD

- [x] 모든 페이지 meta title/description/canonical 정의
- [x] 모든 페이지 og:title/og:description/og:image/og:type 정의
- [x] twitter:card=summary_large_image + twitter:site/creator 정의
- [x] /sitemap.xml XML Sitemap 0.9 schema valid
- [x] /robots.txt Content-Type text/plain + Launch Gate 분기 처리
- [x] Home/Project/Post JSON-LD schema.org 통과 (오프라인 validator)
- [x] legal 페이지 sitemap 등록 제외
- [x] canonical 의 query string strip

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T019 머지 — F018 SEO + sitemap + robots + JSON-LD + Launch Gate 통합 (branch `feature/issue-N-seo-sitemap-robots-jsonld`) | TaekyungHa |
