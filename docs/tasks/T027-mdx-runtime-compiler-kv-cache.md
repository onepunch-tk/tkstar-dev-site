# T027 — MDX runtime compiler + KV cache (post body)

> **Status**: ✅ Done
> **Issue**: #96
> **PR**: TBD (브랜치: `feature/issue-96-mdx-runtime-compiler-kv-cache`)
> **Phase**: 7.1 — CMS 인프라 / Read Path First
> **Depends on**: T024 (#91 — D1 schema), T025 (#93 — D1PostRepository), T026 (#95 — MDX → D1 마이그레이션)
> **Blocks**: T028 (Blog routes D1 wiring + MdxRenderer 마운트)

## Goal

T024–T026 으로 D1 `posts.raw_markdown` 정본 전환이 완료됐지만, raw markdown 을 사용자에게 렌더하려면 SSR 시점에 markdown → React 변환 + 결과 캐싱이 필요하다. T021.5 의 빌드타임 `@mdx-js/rollup` 은 Project / AppLegalDoc 만 다루므로 D1 Post 본문에는 적용되지 않는다.

T027 은 다음의 "증명권" 레이어만 도입한다:
- **Application port** `PostBodyCache { get, set }`
- **Application service** `compilePostBody(cache, compile, { slug, rawMarkdown })` + 내부 `computeBodyHash`
- **Infrastructure adapter** `createKvPostBodyCache(kv)` (Cloudflare KV)
- **Infrastructure compiler** `compileMarkdownToHast` (unified + remark-parse + remark-gfm + remark-rehype)
- **Workers binding** `POST_BODY_CACHE_KV` 등록 (3 env, placeholder ID — 머지 후 사용자 수동 교체)

> 라우트 로더에서 service 호출 + `MdxRenderer` 마운트 + RSS/sitemap published-only 필터는 T028 별도 PR.

## Decisions (Phase 0 Confirmed)

1. **Renderer 선택 — `react-markdown` + `remark-gfm`**
   - T023 PoC winner 였던 `marked` 는 결과 HTML 을 `dangerouslySetInnerHTML` 로 주입해야 하므로 XSS 우려.
   - `react-markdown` 은 hast → React.createElement 직접 변환 + `urlTransform` 으로 `javascript:` 등 dangerous protocol 자동 차단 → 구조적 XSS 차단.
   - 본 PR 은 service / compiler 까지만 — react-markdown 은 T028 의 `MdxRenderer.tsx` 에서 hast → React Element 로 마운트.

2. **KV cache key — `post:{slug}:body:v{16-char SHA-256 hex}`**
   - `crypto.subtle.digest("SHA-256", utf8(rawMarkdown))` → hex → `slice(0, 16)`
   - 자연 invalidation: `raw_markdown` 변경 → hash 변경 → 새 key. KV TTL 무제한, 옛 키는 KV LRU 가 정리.
   - 충돌 확률 2^-64 — 본인 1명 admin 의 수십~수백 글 규모에서 사실상 0.

3. **Runtime syntax highlight 생략**
   - shiki 런타임 import 는 +1.64 MiB gzip 으로 Workers Free 3 MiB 한계의 절반 즉시 점유 (T023). plain `<pre><code className="language-{lang}">` 만 출력하고, 추후 client-side highlight 도입 시 className 재사용.

4. **Cache 페이로드 — hast Root JSON**
   - React Element 는 직렬화 불가 → mdast → hast 까지만 변환 후 JSON.stringify 로 KV 저장.
   - T028 의 `MdxRenderer.tsx` 가 `hast-util-to-jsx-runtime` 으로 hast → React Element 변환 (react-markdown v10 가 내부적으로 사용).

5. **이미지** — absolute URL 그대로 (R2 도입은 T034)

6. **DI wiring 보류** — `app/infrastructure/config/container.ts` 에는 본 PR 에서 추가하지 않음. 라우트 로더에서 실제 호출되는 시점은 T028 — 미리 wiring 하면 dead-code path 가 생김.

## 산출물

- `app/application/content/ports/post-body-cache.port.ts` — `PostBodyCache` interface + `CachedHast` type alias
- `app/application/content/services/compile-post-body.service.ts` — `computeBodyHash` + `compilePostBody` orchestration
- `app/application/content/services/__tests__/compile-post-body.service.test.ts` — 10 tests (hash 5건 + orchestration 5건)
- `app/infrastructure/content/markdown-compiler.ts` — `compileMarkdownToHast` (unified pipeline)
- `app/infrastructure/content/__tests__/markdown-compiler.test.ts` — 6 tests (heading / paragraph / GFM tasklist / GFM strikethrough / raw HTML escape / fenced code className)
- `app/infrastructure/cache/kv-post-body-cache.ts` — `createKvPostBodyCache` factory
- `app/infrastructure/cache/__tests__/kv-post-body-cache.test.ts` — 6 tests (set/get round-trip / miss / slug 격리 / hash 격리 / key 패턴 / JSON.stringify value)
- `wrangler.toml` — `[[kv_namespaces]] POST_BODY_CACHE_KV` 3 env 추가 (placeholder ID)
- `package.json` — `+ unified ^11`, `+ remark-parse ^11`, `+ remark-gfm ^4`, `+ remark-rehype ^11`
- `docs/PROJECT-STRUCTURE.md` — `app/infrastructure/cache/` 디렉토리 항목 신규
- `docs/ROADMAP.md` — T027 체크박스 [x] sync + PR 번호

## Verification

| 검증 단계 | 결과 |
|---|---|
| `bunx vitest run app/application/content/services/__tests__/compile-post-body.service.test.ts` | 10/10 ✅ |
| `bunx vitest run app/infrastructure/content/__tests__/markdown-compiler.test.ts` | 6/6 ✅ |
| `bunx vitest run app/infrastructure/cache/__tests__/kv-post-body-cache.test.ts` | 8/8 ✅ (Phase 3 review M1 advisory: malformed cached value → null fallthrough +2 tests) |
| `bun run typecheck` | exit 0 ✅ |
| Bundle gzip Δ (T023 baseline 1522.48 KiB 대비) | **−22.67 KiB** ✅ (현재 1499.81 KiB · Workers Free 3 MiB 한계의 48.8%) |
| `bun run lint` | (Phase 4 시점 measure 예정) |

## Remote Apply (사용자 수동, PR 머지 후)

```bash
# 1) production / staging / preview KV namespace 발급
bunx wrangler kv namespace create POST_BODY_CACHE_KV --env production
bunx wrangler kv namespace create POST_BODY_CACHE_KV --env staging
bunx wrangler kv namespace create POST_BODY_CACHE_KV --preview

# 2) 반환된 ID 로 wrangler.toml 의 PLACEHOLDER_* 교체:
#    - PLACEHOLDER_PREVIEW_KV_ID    → preview namespace ID (default 의 id + preview_id 둘 다 동일)
#    - PLACEHOLDER_STAGING_KV_ID    → staging namespace ID
#    - PLACEHOLDER_PRODUCTION_KV_ID → production namespace ID

# 3) `chore: T027 KV namespace ID commit` 1건 PR 추가
```

## Out of Scope (T028 / 별도 task 영역)

- `MdxRenderer.tsx` Presentation component — T028
- `loader` 에서 `compilePostBody` 호출 + Blog Detail 렌더 — T028
- `findBodyBySlug` PostRepository 메서드 (raw_markdown 별도 fetch) — T028 wiring 시 결정
- `app/infrastructure/config/container.ts` DI wiring — T028
- shiki / client-side highlight — 별도 task
- 이미지 R2 호스팅 — T033 / T034
