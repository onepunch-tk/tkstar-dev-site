# T009 — feature: DI Container (Composition Root) + workers/app.ts wiring + AppLoadContext

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T008](T008-content-ports-repos.md)
> **후행**: [T010](T010-home-page.md), [T011](T011-about-page.md), [T012](T012-projects-list-page.md), [T013](T013-project-detail-page.md), [T014](T014-blog-list-rss.md), [T015](T015-legal-routes.md), [T016](T016-command-palette.md), [T017](T017-contact-form-turnstile-resend.md)

---

## 목적

Composition Root 를 Infrastructure config 에 두고, 모든 services 를 plain object 로 묶은 `Container` 를 `buildContainer(env)` 로 생성한다. workers/app.ts 의 fetch handler 두 번째 인자에 주입하여 React Router loader/action 에서 `context.container.*` 로 접근 가능하게 한다.

## PRD Feature ID 매핑

_해당 없음_

## 입력·출력 계약

**입력**: T008 의 services + repositories. **출력**: `app/infrastructure/config/container.ts` + workers/app.ts 의 두 번째 인자 wiring + `app/env.d.ts` 의 `AppLoadContext` SSOT. **검증**: `container.test.ts` 6 service 위임 + ProjectNotFoundError 전파 + `bun run test` 94 passed / typecheck / lint Green.

## 시퀀스

```
1. container.ts — `type Container = {...}` + `buildContainer(env): Container` (수제 plain object, IoC 라이브러리 미사용)
2. workers/app.ts — `requestHandler(request, { cloudflare, container: buildContainer(env) })`
3. app/env.d.ts — `interface AppLoadContext { cloudflare; container }` SSOT (inline declare 제거)
4. Velite repo singleton 직접 import (task spec 약식 표기 정정)
5. container.test.ts — 6 service 위임 + 에러 전파 검증
6. 94 unit test + typecheck + lint 모두 Green 확인
```

## 엣지 케이스 + 구현

## Implementation Notes

- 수제 DI 채택 (D2 fact) — IoC 라이브러리 (tsyringe / inversify) 미도입. 1인 프로젝트의 단순성 우선.
- React Router v7 Workers 패턴: `getLoadContext` (Vite plugin 패턴) 가 아닌 fetch handler 두 번째 인자에 직접 객체 주입.
- AppLoadContext SSOT 를 `app/env.d.ts` 로 이전 — workers/app.ts 의 inline declare 제거.
- Velite repo 는 task spec 의 약식 표기 `new ...Repository()` 와 달리 singleton const 라 직접 import.
- `_env` prefix 는 T017 (Resend/Turnstile/KV) 도입 시 활성화.
- 6 service: listProjects / getProjectDetail / getFeaturedProject / listPosts / getPostDetail / getRecentPosts.

## Change History from previous body

- D2 (DI 라이브러리 vs 수제) — 수제 채택 결정.
- Issue #31, PR `feature/issue-31-di-container`.
- T010~T017 모든 라우트 loader/action 이 본 task 의 container 에 의존.

## DoD

- [x] `app/infrastructure/config/container.ts` 의 `Container` 타입 + `buildContainer(env)` 정의
- [x] workers/app.ts 가 fetch handler 두 번째 인자에 `{ cloudflare, container }` 주입
- [x] `app/env.d.ts` 의 `AppLoadContext` SSOT (inline declare 제거)
- [x] container.test.ts — 6 service 위임 + ProjectNotFoundError 전파 검증 Green
- [x] `bun run test` 94 passed
- [x] `bun run typecheck` Green
- [x] `bun run lint` Green
- [x] D2 (수제 DI 채택) 사실 기록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T009 머지 — DI container + workers wiring + AppLoadContext SSOT (Issue #31, branch `feature/issue-31-di-container`) | TaekyungHa |
