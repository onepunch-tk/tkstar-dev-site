# T002 — chore: Clean Architecture 4-layer 디렉토리 골격 + path alias

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T001](T001-scaffold-bun-rr7-biome.md)
> **후행**: [T004](T004-route-skeleton.md), [T006](T006-domain-schemas.md), [T007](T007-velite-content-pipeline.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md)

---

## 목적

Clean Architecture 4-layer (Domain / Application / Infrastructure / Presentation) 의 빈 디렉토리 골격과 placeholder index 를 만들고, 의존성 방향(Domain ← Application ← Infrastructure / Presentation ← Application) 을 README 또는 Lint 로 문서화한다. 이후 모든 task 는 이 골격 안의 명확한 layer 에 배치된다.

## PRD Feature ID 매핑

_해당 없음_

## 입력·출력 계약

**입력**: T001 의 빈 프로젝트 셸. **출력**: `app/{domain,application,infrastructure,presentation}/` 4-layer 디렉토리 + 각 layer placeholder index + `test/{fixtures,utils}/` + 의존성 방향 README. **검증**: 디렉토리 존재 확인 + `bun run typecheck` 여전히 무오류.

## 시퀀스

```
1. `app/domain/{project,post,legal,contact,theme}/` 5개 빈 모듈 생성 + placeholder index.ts
2. `app/application/{content,contact,search,og,feed,seo}/{ports,services}/` 빈 모듈
3. `app/infrastructure/{config,content,email,captcha,og,search,analytics}/` 빈 모듈
4. `app/presentation/{components,hooks,lib,layouts,routes}/` 빈 모듈
5. `test/{fixtures,utils}/` 빈 디렉토리
6. README 또는 ARCHITECTURE.md 에 의존성 방향 문서화 — Domain ← Application ← Infrastructure / Presentation ← Application
7. `bun run typecheck` 통과 확인 후 PR open
```

## 엣지 케이스 + 구현

## Implementation Notes

- 의존성 방향 위반 방지를 자동화하지 않음 (Lint rule 도입은 향후 별도 task) — 본 task 는 placeholder index + README 로 문서화만.
- 각 layer 의 index.ts 는 빈 export `{}` placeholder — 빈 파일은 typecheck 에러 가능성 있으므로 명시.
- `test/` 는 colocated `__tests__/` 와 별도 — fixtures/utils 만 공용으로 위치.
- 본 task 는 T001 의 path alias `~/*` → `./app/*` 에 의존.

## Change History from previous body

- chore branch (no Issue) PR: `chore/ca-4layer-skeleton`.
- T004 (라우트 스켈레톤) / T006 (Domain schema) / T007 (velite) / T008 (ports+repos) / T009 (DI) 가 모두 이 골격 안에 배치되므로 본 task 가 P0 의 마지막 구조 task.

## DoD

- [x] `app/{domain,application,infrastructure,presentation}/` 4개 디렉토리 모두 존재
- [x] 각 layer 에 placeholder `index.ts` 생성
- [x] `app/domain/` 하위에 `{project,post,legal,contact,theme}/` 5개 모듈
- [x] `app/application/` 하위에 `{content,contact,search,og,feed,seo}/{ports,services}/` 모듈
- [x] `app/infrastructure/` 하위에 `{config,content,email,captcha,og,search,analytics}/` 모듈
- [x] `app/presentation/` 하위에 `{components,hooks,lib,layouts,routes}/` 모듈
- [x] `test/{fixtures,utils}/` 빈 디렉토리 존재
- [x] 의존성 방향이 README 또는 lint 로 문서화됨
- [x] `bun run typecheck` 무오류 통과

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | T002 초기 머지 — CA 4-layer 골격 (branch `chore/ca-4layer-skeleton`) | TaekyungHa |
