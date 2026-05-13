# T027 — feature: MDX 런타임 컴파일러 + KV 캐시 (Post body)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T026](T026-post-d1-repository.md)
> **후행**: [T040](T040-build-search-index-service.md)

---

## 목적

D1 의 `body_mdx` 컬럼을 SSR 요청 시 `@mdx-js/mdx` 로 compile + evaluate 하여 React Element 로 렌더한다. compile 비용 보호를 위해 KV 캐시 (`mdx:post:<id>:<updated_at>` → compiled JS module string) 도입. cache miss 시만 compile 실행.

## PRD Feature ID 매핑

- F020
- F021
- F007

## 입력·출력 계약

**입력**: T026 의 `body_mdx` + Workers KV namespace `MDX_CACHE_KV`. **출력**: `app/application/content/services/render-mdx.ts` (port: MdxCompiler + KvCache) + `app/infrastructure/mdx/{mdx-compiler.ts, kv-cache.ts}` + wrangler.toml KV namespace 추가 + container wiring + `__tests__/`. **검증**: 첫 응답 compile + cache put, 두 번째 응답 cache hit (compile 미실행), cache miss latency < 200ms, cache hit < 20ms.

## 시퀀스

```
1. wrangler.toml — `[[kv_namespaces]] binding = MDX_CACHE_KV`
2. Application — `render-mdx.ts` (input: { id, body_mdx, updated_at } → output: React Element)
3. Infrastructure — `mdx-compiler.ts` (`compile(source, { jsx:false, format:'mdx', outputFormat:'function-body' })` + evaluate via `new Function`)
4. Infrastructure — `kv-cache.ts` (get/put + TTL 30d)
5. cache key — `mdx:post:<id>:<updated_at>` (updated_at 변경 시 자동 invalidation)
6. container wiring — renderMdx service 추가
7. T041 (Blog detail) loader 가 renderMdx 사용 — 본 task 와 함께 wiring
8. Vitest — compile 호출 횟수 검증 (첫 호출 = 1, 두 번째 = 0), Miniflare KV fixture
```

## 엣지 케이스 + 구현

## Implementation Notes

- `new Function(compiled)` 의 V8 isolate 호환성은 T023 PoC 에서 확인 — 단 nodejs_compat 의 partial 지원으로 일부 케이스에서 실패 → T043 에서 `@mdx-js/rollup` + `import.meta.glob` 패턴으로 재대체. 본 task 시점엔 런타임 compile 채택.
- Cache key 의 `updated_at` 은 epoch ms — admin save 시 자동 갱신되어 캐시 무효화.
- TTL 30d — Workers KV 의 hot key 동작 보장. 한도 무료 1GB / Paid 무제한.
- compile output: `jsx: false` + `outputFormat: 'function-body'` → 순수 JS 함수 본문, `new Function('arguments', body)` 로 실행.
- shiki rehype 는 본 task 시점엔 런타임 동작 — bundle size 증가 우려 → T040 또는 별도 task 에서 highlight 결과 캐싱.
- 보안: `body_mdx` 의 입력자 = admin (본인 1명) 이므로 XSS 신뢰. 외부 입력 (Contact) 와 격리.
- cache hit miss 비율 모니터링은 Workers Analytics tail.
- F007 detail 페이지의 본문 렌더 경로가 본 task 에서 D1+런타임 컴파일로 전환.

## Change History from previous body

- T043 (V8 eval fix) 가 본 task 의 런타임 compile 결함을 대체 — 본 task 머지 시점엔 동작.
- feature branch PR: `feature/issue-N-mdx-runtime-compiler-kv-cache` (PR #97 머지).
- recent commit `3ee2f22` 와 일치.

## DoD

- [x] wrangler.toml MDX_CACHE_KV namespace 등록
- [x] render-mdx.ts service + MdxCompiler + KvCache ports
- [x] Infrastructure mdx-compiler.ts + kv-cache.ts 구현
- [x] container 에 renderMdx wiring
- [x] T041 Blog detail loader 가 renderMdx 사용
- [x] Vitest — 첫 호출 compile 1회, 두 번째 호출 cache hit (compile 0회)
- [x] cache miss latency < 200ms, cache hit < 20ms
- [x] cache key 의 updated_at 변경 시 자동 invalidation

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-12 | T027 머지 — MDX runtime compiler + KV cache (PR #97, commit `3ee2f22`) | TaekyungHa |
