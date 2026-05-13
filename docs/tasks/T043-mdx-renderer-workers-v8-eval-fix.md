# T043 — fix: MdxRenderer Workers V8 eval fix — `@mdx-js/rollup` + `import.meta.glob` 패턴

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `fix/`
> **선행**: [T007](T007-velite-content-pipeline.md), [T013](T013-project-detail-page.md), [T015](T015-legal-routes.md), [T021](T021-qa-lighthouse-axe.md), [T041](T041-blog-detail-page.md)
> **후행**: [T022](T022-deploy-domain-search-console.md)

---

## 목적

T007 의 자체 `evaluateMdxBody` (12 LOC, `new Function` 기반) 가 Cloudflare Workers V8 isolate 에서 일부 MDX 콘텐츠에 대해 `EvalError: Code generation from strings disallowed` 또는 `SyntaxError` 로 실패하는 회귀를 해소한다. 빌드 타임 컴파일 (`@mdx-js/rollup`) + `import.meta.glob` 정적 import 패턴으로 대체.

## PRD Feature ID 매핑

- F005
- F007
- F014

## 입력·출력 계약

**입력**: T007 의 `MdxRenderer.tsx` + 모든 velite-backed MDX 콘텐츠 (project / legal). **출력**: `vite.config.ts` 의 `@mdx-js/rollup` plugin 추가 + `app/presentation/components/MdxRenderer.tsx` 의 `evaluateMdxBody` 제거 → `import.meta.glob('/content/**/*.mdx', { eager: true })` 기반 컴포넌트 lookup, frontmatter 는 velite 가 계속 처리. **검증**: project / legal MDX 페이지 Workers production env 200 + body 렌더, V8 eval 에러 0건, bundle size 영향 측정.

## 시퀀스

```
1. vite.config.ts — `@mdx-js/rollup` plugin + rehype/remark 옵션 (rehype-slug + shiki) 등록
2. MdxRenderer.tsx — `import.meta.glob('/content/**/*.mdx', { eager: true, import: 'default' })` 로 컴포넌트 map 구성
3. 기존 `evaluateMdxBody` 12 LOC 제거 + `new Function` 호출 삭제
4. velite config — body 컴파일 부분 비활성화 (frontmatter 만 검증), 본문은 vite 가 처리
5. T013 (Project detail) / T015 (Legal) / T041 (Blog detail) 의 MdxRenderer 호출 시그니처 일치
6. Workers production env preview 배포 → 모든 MDX 페이지 수동 클릭스루
7. Vitest — MdxRenderer 가 컴포넌트 lookup 으로 동작 (mock import.meta.glob)
8. bundle size before/after 측정 — `@mdx-js/rollup` 추가가 cold start 에 미치는 영향
```

## 엣지 케이스 + 구현

## Implementation Notes

- 근본 원인: Cloudflare Workers 의 V8 isolate 는 기본적으로 `eval` / `new Function` 차단 — nodejs_compat 도 이 정책 해소 안 함. T007 시점엔 dev 환경 (vite ssr) 에서만 동작, production worker 에선 실패.
- 해결 패턴: 빌드 타임에 모든 MDX 를 JS 모듈로 컴파일 (`@mdx-js/rollup`) + `import.meta.glob` 으로 정적 import → 런타임 eval 0회.
- T027 (Post body 런타임 컴파일) 와 충돌 안 함 — Post 는 D1 의 동적 body, 런타임 compile 후 `new Function` 사용. 그러나 Post 역시 동일 V8 정책 영향 → T027 도 후속에서 `wasm-mdx` 또는 sandboxed runtime 으로 재대체 검토. 본 task 는 정적 콘텐츠 (project/legal) 만.
- import.meta.glob 의 키는 절대 경로 — 슬러그 매칭 헬퍼로 `/content/projects/<slug>.mdx` → `<slug>` 추출.
- frontmatter 는 velite 가 빌드 타임에 추출 → Domain entity 매핑은 변경 없음. 본 task 는 본문 컴파일 경로만 교체.
- Post 의 D1 body 는 런타임 동적이라 본 task 의 import.meta.glob 패턴 적용 불가 — Phase 7.x 의 별도 후속.
- 본 task 는 fix branch — Issue 발급 후 PR.
- T021 QA 의 production preview 환경에서 발견된 회귀를 해결 → T022 production 배포 전 필수.
- T007 의 follow-up Low #7 (shiki rehype `as any`) 도 본 task 에서 함께 정리.

## Change History from previous body

- 구 docs/tasks/T021.5 통합.
- fix branch PR: `fix/issue-N-mdx-renderer-workers-v8-eval-fix`.
- T022 production 배포 전 필수 게이트.

## DoD

- [x] vite.config.ts 에 @mdx-js/rollup plugin 등록
- [x] MdxRenderer 의 `new Function` / `evaluateMdxBody` 12 LOC 제거
- [x] import.meta.glob 기반 컴포넌트 lookup 동작
- [x] Workers production preview 에서 project / legal / blog MDX 페이지 200
- [x] V8 eval 에러 0건 (Workers tail logs 확인)
- [x] MDX heading anchor (rehype-slug) 정상 동작
- [x] shiki 코드블록 정상 highlight
- [x] bundle size 영향 측정 + cold start 50ms 미만 증가
- [x] T007 follow-up Low #7 (`as any`) 함께 정리

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-05-01 | T043 머지 — MdxRenderer Workers V8 eval fix + import.meta.glob 전환 (branch `fix/issue-N-mdx-renderer-workers-v8-eval-fix`, 구 docs/tasks/T021.5 통합) | TaekyungHa |
