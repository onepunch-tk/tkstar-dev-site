# T018 — feature: Satori OG Images (F011) — Project/Blog 슬러그별 1200×630

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T013](T013-project-detail-page.md), [T041](T041-blog-detail-page.md)
> **후행**: [T019](T019-seo-sitemap-robots-jsonld.md)

---

## 목적

Project / Blog 슬러그별 동적 OG 이미지 (1200×630 PNG) 를 Satori standalone 런타임으로 생성하고, Cloudflare Workers Asset Binding 으로 폰트를 로드한다. KV 캐시로 hit ratio 확보, SSR meta 의 og:image 가 실제 endpoint 를 가리키게 한다.

## PRD Feature ID 매핑

- F011
- F018

## 입력·출력 계약

**입력**: GET `/og/projects/$slug.png` or `/og/blog/$slug.png`. **출력**: `app/presentation/routes/og.projects.$slug[.png].tsx` + `og.blog.$slug[.png].tsx` resource route + `app/application/og/services/render-og.ts` + `app/infrastructure/og/satori.renderer.ts`. **검증**: HEAD/GET 응답 200 + Content-Type `image/png` + PNG magic bytes + 첫 응답 < 1s, KV cache hit 두 번째 응답 < 100ms.

## 시퀀스

```
1. Satori standalone + resvg-js (또는 satori-html) wasm 도입 — Workers runtime 호환 확인
2. Asset Binding — `public/fonts/JetBrainsMono-Bold.woff2` 를 Workers 에서 fetch (T003 의 ASSETS binding 활용)
3. Application — `render-og.ts` (ports: OgRenderer + KvCache)
4. Infrastructure — `satori.renderer.ts` (1200×630 layout: 로고 + title + tags + brand bar)
5. og.projects.$slug[.png].tsx + og.blog.$slug[.png].tsx loader — cache key `og:projects:<slug>:<updated_at>` lookup → miss 시 render + cache put (TTL 7d)
6. Project/Blog meta export 갱신 — og:image absolute URL 정확
7. RTL/Vitest — PNG magic bytes, Content-Type, cache hit ratio (mock KV)
```

## 엣지 케이스 + 구현

## Implementation Notes

- Satori 의 fontWeight 400/700 두 weight 만 로드 — 폰트 다운로드 비용 최소화.
- 캐시 key 에 `updated_at` 포함 → 콘텐츠 수정 시 자동 invalidation.
- KV TTL 7d + stale-while-revalidate 안 함 (1인 사이트 트래픽 낮음).
- 미존재 slug → 404 응답 (생성 안 함).
- og:image 절대 URL: `https://tkstar.dev/og/projects/<slug>.png` — Twitter/LinkedIn 크롤러가 follow 가능해야.
- twitter:card = summary_large_image 도 함께 (T019 와 분담 — 본 task 는 endpoint 만, twitter:card meta 는 T019).
- Asset Binding fetch: `await env.ASSETS.fetch(new Request('http://placeholder/fonts/JetBrainsMono-Bold.woff2'))` 패턴.
- 폰트 fetch 결과 ArrayBuffer 캐시 (Workers V8 isolate scope) — cold start 1회만.
- 빌드 산출물 `public/og/static/*.png` (T018) 또는 동적 — 본 task 는 동적 채택.
- F011 + F018 (og:image) 동시 진행.

## Change History from previous body

- A010 (OG renderer 라이브러리 선정) 해소 — Satori + resvg-js.
- feature branch PR: `feature/issue-N-satori-og-images`.

## DoD

- [x] /og/projects/$slug.png 응답 200 + Content-Type image/png
- [x] /og/blog/$slug.png 응답 200 + Content-Type image/png
- [x] PNG magic bytes 검증 (`\x89PNG`)
- [x] 1200×630 dimension 확인
- [x] KV cache hit 두 번째 응답 < 100ms
- [x] 미존재 slug → 404
- [x] Project/Blog meta og:image absolute URL 정확
- [x] Asset Binding 으로 폰트 fetch 동작

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T018 머지 — Satori OG F011 + A010 해소 (branch `feature/issue-N-satori-og-images`) | TaekyungHa |
