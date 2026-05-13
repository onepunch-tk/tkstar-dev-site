# T007 — feature: velite 설치 + 컬렉션 정의 + seed 콘텐츠 + shiki 코드블록

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T006](T006-domain-schemas.md)
> **후행**: [T008](T008-content-ports-repos.md)

---

## 목적

velite 를 도입하여 `content/{projects,posts,legal/apps}/**/*.mdx` 를 빌드 타임에 `.velite/{projects,posts,legal}.json` 으로 출력한다. rehype-slug + shiki 코드블록 + seed 콘텐츠 (project 1개 / post 1개 / legal 1쌍) 를 함께 도입해 후속 task 들이 즉시 콘텐츠 렌더링 검증 가능하게 한다.

## PRD Feature ID 매핑

- F004
- F005
- F006
- F007
- F014

## 입력·출력 계약

**입력**: T006 의 Domain schema. **출력**: `velite.config.ts` + rehype 플러그인 등록 + 3 collection (projects/posts/legal) + seed 콘텐츠 + `MdxRenderer.tsx` + lifecycle scripts. **검증**: `bunx velite build` 성공, `.velite/{projects,posts,legal}.json` 생성, frontmatter Zod 위반 콘텐츠 추가 시 build 실패.

## 시퀀스

```
1. velite 설치 + `velite.config.ts` 작성 — D1 (Domain Zod 4 ↔ velite Zod 3 internal 충돌) 회피를 위해 `s` 헬퍼로 schema shape mirroring
2. rehype 플러그인 등록 — `rehype-slug` (헤딩 anchor, A002 1단계) + `@shikijs/rehype` (theme: `github-dark` 단일)
3. seed 콘텐츠 — `content/projects/example-project.mdx`, `content/posts/2026-04-shipping-solo.mdx`, `content/legal/apps/moai/{terms,privacy}.mdx`
4. MdxRenderer.tsx — 자체 `evaluateMdxBody` 12 LOC (mdx-bundler 회피)
5. package.json lifecycle — `predev` / `prebuild` / `prestart` / `pretest` 가 velite build 자동 호출 (stale `.velite/` 회귀 차단)
6. tsconfig.cloudflare.json 에 `#content` / `#content/*` path alias
7. wrangler.toml 운영 노트 — `new Function` SSR / CSP unsafe-eval 영향 cross-link
```

## 엣지 케이스 + 구현

## Implementation Notes

- velite 의 Zod 3 internal 과 프로젝트 Zod 4 의 internal 타입 충돌은 schema mirroring 으로 회피. drift 검증은 T008 mapper 에서.
- shiki theme 은 MVP 단일 `github-dark` — 라이트 모드 별도 처리 안 함 (코드블록은 항상 dark 배경 유지).
- `predev`/`prebuild`/`prestart`/`pretest` lifecycle 은 stale `.velite/` JSON 으로 인한 silent fail 차단.
- MdxRenderer.tsx 의 12 LOC `evaluateMdxBody` 는 mdx-bundler 의 `new Function(...)` 의존 회피용. T043 (MdxRenderer Workers V8 eval fix) 에서 `@mdx-js/rollup` + `import.meta.glob` 로 다시 대체됨.
- seed legal 본문은 placeholder — T015 시점에 정식 본문으로 갱신.
- 후속 follow-up (deferred from review): Medium #3 `project.schema.ts` date 약한 검증, Medium #4 legal seed placeholder 본문, Low #5 tsconfig include velite.config.ts, Low #7 shiki rehype `as any` 좁히기.

## Change History from previous body

- A002 1단계 (rehype-slug) 해소.
- A006 (velite/shiki 설치) 해소.
- A007 (검색 인덱스 라이브러리 — 단순 includes/score 채택) 1차 사실 기록.
- PR: feature/issue-27, Issue #27.

## DoD

- [x] `bunx velite build` 성공 + `.velite/projects.json`, `.velite/posts.json`, `.velite/legal.json` 생성
- [x] frontmatter Zod 위반 콘텐츠 추가 시 build 실패 확인
- [x] rehype-slug 가 헤딩 anchor id 생성
- [x] shiki `github-dark` 코드블록 highlight 동작
- [x] seed 콘텐츠 3종 (project + post + legal 쌍) 작성
- [x] MdxRenderer.tsx `evaluateMdxBody` 12 LOC 동작 (mdx-bundler 회피)
- [x] predev/prebuild/prestart/pretest lifecycle 이 velite build 자동 호출
- [x] tsconfig.cloudflare.json 에 #content path alias 등록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T007 머지 — velite + shiki + seed 콘텐츠 + A002·A006·A007 1차 해소 (PR #27 후속, branch `feature/issue-27-velite-content-pipeline`) | TaekyungHa |
