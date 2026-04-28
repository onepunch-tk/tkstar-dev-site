# Task 019 — F018 SEO Meta + Sitemap + Robots + JSON-LD (차등 인덱싱)

| Field | Value |
|-------|-------|
| **Task ID** | T019 |
| **Phase** | Phase 5 — SEO / OG / Indexing |
| **Layer** | Application(`build-sitemap.service`) + Resource Route + Presentation(meta export) |
| **Branch** | `feature/issue-N-seo-sitemap-jsonld` |
| **Depends on** | T008, T010, T011, T012, T013, T014a, T014b, T015, T018 |
| **Blocks** | T020 |
| **PRD Features** | **F018** (SEO 메타 + Sitemap) |
| **PRD AC** | — (정합성 검증, schema.org 표준) |
| **예상 작업 시간** | 1.5d |
| **Status** | Not Started |

## Goal
페이지별 `meta` export (title/description/canonical/og/twitter) + JSON-LD + `/sitemap.xml` + `/robots.txt`을 가동하고, **차등 인덱싱** 정책(App Terms/Privacy `noindex,follow`, 404 `noindex,nofollow`)을 적용한다.

## Context
- **Why**: 검색엔진 가시성의 정본. F018은 모든 페이지 cross-cutting concern이라 페이지별 meta export를 한꺼번에 추가하는 것이 효율적.
- **Phase 진입/완료 연결**: 모든 페이지 task(T010~T015) + OG(T018) Done 후 시작. T019 Done 후 T020 검색엔진 등록.
- **관련 PRD 섹션**: PRD `F018` Feature, `Menu Structure — 크롤러/검색엔진 인덱싱`, App Terms/Privacy SEO 정책, Not Found Fallback SEO 정책
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/application/seo/services/`, `app/presentation/routes/{sitemap[.xml].tsx, robots[.txt].tsx}`, `app/presentation/lib/jsonld.ts`, 모든 페이지 routes의 `meta` export

## Scope

### In Scope
- `build-sitemap.service.ts` — index 가능 페이지(Home/About/Projects/Project Detail/Blog/Blog Detail/Contact/Legal Index)만 포함. App Terms/Privacy + 404 + OG resource route 제외
- `/sitemap.xml`, `/robots.txt` resource route loader 본체
- 11개 페이지의 `meta` export 추가 (title/description/canonical/og:*/twitter:*)
- `app/presentation/lib/jsonld.ts` — schema.org 빌더 (Person, BlogPosting, CreativeWork, BreadcrumbList)
- 차등 인덱싱:
  - App Terms/Privacy meta `<meta name="robots" content="noindex, follow">` + canonical 유지
  - 404 splat meta `<meta name="robots" content="noindex, nofollow">`
- DI Container에 `buildSitemap` 등록

### Out of Scope
- Google/Naver site verification meta (T020)
- Cloudflare Web Analytics (T020)
- Bing Webmaster Tools (가정 A011, MVP 후)

## Acceptance Criteria
- [ ] `/sitemap.xml`이 well-formed XML 응답 + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` + `<url><loc>...</loc>...</url>` 항목들
- [ ] sitemap에 포함되는 페이지: Home / About / Projects 목록 / Project Detail (모든 slug) / Blog 목록 / Blog Detail (모든 slug) / Contact / Legal Index
- [ ] sitemap에 **포함되지 않는** 페이지: App Terms / App Privacy / 404 (splat) / OG resource route / RSS / Sitemap / Robots 자체
- [ ] `/robots.txt` 응답: `User-agent: *\nAllow: /\nSitemap: https://tkstar.dev/sitemap.xml`
- [ ] 모든 페이지에 `meta` export(title/description/canonical/og:title/og:description/og:image/og:url/og:type/twitter:card) 정의
- [ ] OG `og:image`는 T018의 `/og/{projects|blog}/:slug.png` URL 또는 정적 fallback
- [ ] JSON-LD: Home/About → `Person`, Blog Detail → `BlogPosting`, Project Detail → `CreativeWork`(또는 `SoftwareSourceCode`), 모든 페이지 → `BreadcrumbList`
- [ ] App Terms/Privacy meta `noindex, follow` + canonical 유지, sitemap.xml 미포함
- [ ] 404 splat meta `noindex, nofollow` + 404 응답 코드 + sitemap.xml 미포함

## Implementation Plan (TDD Cycle)

### Red

#### Application
- `app/application/seo/services/__tests__/build-sitemap.service.test.ts`
  - mock `listProjects`/`listPosts`/`listApps` → sitemap entries 생성
  - 정적 라우트(`/about`, `/projects`, `/blog`, `/contact`, `/legal`) + 동적 slugs 모두 포함
  - App Terms/Privacy + 404 + OG/RSS/Sitemap/Robots 자체 미포함
  - well-formed XML 검증

#### Resource Route
- `app/presentation/routes/__tests__/sitemap.test.ts`
  - `/sitemap.xml` loader → `Content-Type: application/xml`
- `app/presentation/routes/__tests__/robots.test.ts`
  - `/robots.txt` loader → `Content-Type: text/plain` + 정확한 본문

#### Meta Export (페이지별)
- `app/presentation/routes/__tests__/{about,projects.$slug,blog.$slug,contact,legal._index,legal.$app.terms,legal.$app.privacy,$}.meta.test.ts`
  - 각 페이지 `meta` export 호출 → expected title/description/canonical/og/twitter 출력
  - App Terms/Privacy: `robots = "noindex, follow"`
  - splat: `robots = "noindex, nofollow"`

#### JSON-LD
- `app/presentation/lib/__tests__/jsonld.test.ts`
  - `buildPersonLd({...})` → schema.org Person 객체
  - `buildBlogPostingLd({...})` → BlogPosting
  - `buildCreativeWorkLd({...})` → CreativeWork
  - `buildBreadcrumbListLd([...])` → BreadcrumbList

### Green
- `build-sitemap.service.ts`
- `sitemap[.xml].tsx`, `robots[.txt].tsx` resource route 본체
- 11개 페이지에 `meta` export 추가
- `app/presentation/lib/jsonld.ts` 헬퍼
- 페이지에서 JSON-LD `<script type="application/ld+json">` 삽입

### Refactor
- `meta` export 공통 패턴(`buildMeta({title, description, ogImage, ...})`)을 `app/presentation/lib/meta.ts`로 추출
- 페이지별 canonical URL 빌더 (`getCanonicalUrl(path)`)

## Files to Create / Modify

### Application — Service
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/seo/services/build-sitemap.service.ts` | sitemap entries → XML |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/seo/services/__tests__/build-sitemap.service.test.ts` | unit |

### Presentation — Resource Routes (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/sitemap[.xml].tsx` | placeholder → 본체 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/robots[.txt].tsx` | placeholder → 본체 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/sitemap.test.ts` | unit |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/robots.test.ts` | unit |

### Presentation — meta export (페이지별 11개)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/_index.tsx` | `export const meta` 추가 (Home) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/about.tsx` | meta + JSON-LD Person |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/projects._index.tsx` | meta |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/projects.$slug.tsx` | meta + JSON-LD CreativeWork + BreadcrumbList |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/blog._index.tsx` | meta |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/blog.$slug.tsx` | meta + JSON-LD BlogPosting + BreadcrumbList |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/contact.tsx` | meta |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal._index.tsx` | meta |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal.$app.terms.tsx` | meta `noindex, follow` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal.$app.privacy.tsx` | meta `noindex, follow` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/$.tsx` | meta `noindex, nofollow` + 404 status |

### Presentation — Lib
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/jsonld.ts` | schema.org 빌더 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/meta.ts` | `buildMeta` helper |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/__tests__/jsonld.test.ts` | unit |

### Infrastructure — Config (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/container.ts` | `buildSitemap` 추가 |

## Verification Steps

### 자동
- `bun run test` — 모든 unit 테스트 Green
- 11개 페이지 meta export 테스트 명시적 통과
- App Terms/Privacy의 `noindex, follow` 명시적 검증
- 404 splat의 `noindex, nofollow` 명시적 검증
- sitemap.xml의 포함/제외 페이지 검증

### 수동
- `wrangler dev`에서 `/sitemap.xml`, `/robots.txt` 직접 접속 → well-formed
- 각 페이지의 view-source에서 `<title>`, `<meta>`, `<link rel="canonical">`, `<script type="application/ld+json">` 노출 확인
- [Google Rich Results Test](https://search.google.com/test/rich-results)로 JSON-LD 정합성 검증 (production URL — T022)
- App Terms 페이지에서 `<meta name="robots" content="noindex, follow">` 노출

### 측정
- 없음

## Dependencies
- **Depends on**: T008 (`listProjects`/`listPosts`/`listApps`), T010~T013 + T014a + T014b + T015 (페이지별 meta export 추가), T018 (OG URL을 `og:image` 값으로 사용)
- **Blocks**: T020 (Google/Naver verification meta가 root.tsx에 추가됨)

## Risks & Mitigations
- **Risk**: 페이지별 meta export가 11개로 많아 누락 위험.
  - **Mitigation**: `buildMeta` helper로 공통 패턴 추출 → 페이지별 차이만 props로. PR 체크리스트에 11개 명시.
- **Risk**: JSON-LD가 잘못되면 Search Console에서 warning.
  - **Mitigation**: schema.org 표준 그대로 채택 + Rich Results Test 검증.

## References
- PRD `F018`, App Terms/Privacy SEO 정책, Not Found Fallback SEO 정책
- ROADMAP.md `Phase 5` Task 019
- [Sitemap protocol](https://www.sitemaps.org/protocol.html)
- [schema.org Person/BlogPosting/CreativeWork/BreadcrumbList](https://schema.org/)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
