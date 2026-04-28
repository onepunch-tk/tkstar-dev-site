# Task 009 — DI Container (Composition Root) + workers/app.ts wiring + getLoadContext

| Field | Value |
|-------|-------|
| **Task ID** | T009 |
| **Phase** | Phase 2 — Content Pipeline |
| **Layer** | Infrastructure (`config/`) + Platform Adapter (`workers/`) |
| **Branch** | `feature/issue-N-di-container` |
| **Depends on** | T008 |
| **Blocks** | T010, T011, T012, T013, T014a, T014b, T015, T016, T017 |
| **PRD Features** | 전반 (모든 유스케이스 주입 통로) |
| **PRD AC** | — |
| **예상 작업 시간** | 0.5d |
| **Status** | Not Started |

## Goal
PROJECT-STRUCTURE D2 결정에 따라 수제 Plain object DI Container를 `app/infrastructure/config/container.ts`에 구현하고, `workers/app.ts`의 `getLoadContext`로 페이지 loader/action에서 유스케이스를 꺼내 쓸 수 있게 한다.

## Context
- **Why**: Application service들이 Repository를 직접 import하지 않고 Port에 의존하므로, 어디선가 둘을 묶어주는 Composition Root가 필요. 의존성 그래프가 작아 (~10개) 라이브러리(`awilix`, `tsyringe`)는 ROI 낮음 → 수제 채택.
- **Phase 진입/완료 연결**: T008 Done 후 즉시. T009가 Done이면 Phase 3 페이지 task에서 `context.container.getProjectDetail(slug)` 식으로 호출 가능.
- **관련 PRD 섹션**: PRD `Tech Stack — Hosting / Edge`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/infrastructure/config/`, `workers/app.ts`, `app/env.d.ts`

## Scope

### In Scope
- `Container` type 정의 — 모든 유스케이스 service의 함수형 시그니처를 한 객체로 묶음
- `buildContainer(env: Env): Container` — env 인자로 Repository 인스턴스 생성 + service 인스턴스 조립
- `workers/app.ts`의 `getLoadContext: () => ({ container: buildContainer(env) })` 연결
- `app/env.d.ts`에 `interface AppLoadContext { container: Container }` 추가 (RR7 typegen이 loader/action `context` 타입을 자동 추론)

### Out of Scope
- Resend / Turnstile / KV rate-limiter 등록 (T017에서 Container에 추가)
- OG renderer 등록 (T018에서 Container에 추가)
- Search index service 등록 (T016)
- RSS / Sitemap service 등록 (T014a / T019)

## Acceptance Criteria
- [ ] `Container` type이 6개 read-side service(listProjects, getProjectDetail, getFeaturedProject, listPosts, getPostDetail, getRecentPosts)를 모두 포함
- [ ] `buildContainer(env)` 호출 시 모든 service가 정상 인스턴스화됨 (mock env로 단위 테스트)
- [ ] `workers/app.ts`가 RR7 request handler에 `getLoadContext: () => ({ container: buildContainer(env) })` 전달
- [ ] `AppLoadContext` 타입이 RR7 loader/action의 `context` 인자 타입에 자동 적용
- [ ] `wrangler dev`에서 임시 `_index` loader가 `context.container.getFeaturedProject()` 호출 시 정상 동작 (smoke test)
- [ ] `bun run test` Container 테스트 Green

## Implementation Plan (TDD Cycle)

### Red
- `app/infrastructure/config/__tests__/container.test.ts`
  - `buildContainer({})` 호출 시 반환 객체에 6개 service property 존재 (typeof === "function")
  - 각 service 호출 시 fixture 데이터를 반환 (Repository는 실제 velite repo 인스턴스가 아닌 fixture-backed 변형으로 테스트 — env 분기로 fixture/실제 선택)

### Green
- `app/infrastructure/config/container.ts`:
  ```ts
  export type Container = {
    listProjects: (opts?: { tag?: string }) => Promise<Project[]>;
    getProjectDetail: (slug: string) => Promise<{ project: Project; prev: Project | null; next: Project | null }>;
    getFeaturedProject: () => Promise<Project | null>;
    listPosts: (opts?: { tag?: string }) => Promise<Post[]>;
    getPostDetail: (slug: string) => Promise<{ post: Post; prev: Post | null; next: Post | null }>;
    getRecentPosts: (n: number) => Promise<Post[]>;
    // T017에서 submitContactForm 추가, T018에서 renderProjectOg 등 추가
  };

  export function buildContainer(env: Env): Container {
    const projectRepo = new VeliteProjectRepository();
    const postRepo = new VelitePostRepository();
    const legalRepo = new VeliteLegalRepository();
    return {
      listProjects: (opts) => listProjectsService(projectRepo, opts),
      getProjectDetail: (slug) => getProjectDetailService(projectRepo, slug),
      // ...
    };
  }
  ```
- `workers/app.ts` 수정 (T003에서 만든 스텁 위에)
- `app/env.d.ts`에 `AppLoadContext` 추가

### Refactor
- service들을 화살표 함수가 아닌 명시적 binding (`(opts) => listProjectsService(projectRepo, opts)`)으로 캡처 누수 방지
- `Container` 타입을 service shapes에서 자동 derive할지(`type Container = {...}`) 명시 list로 둘지는 명시 list 채택 (의존성 그래프 가독성 우선)

## Files to Create / Modify

### Infrastructure — Config
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/container.ts` | `Container` type + `buildContainer(env)` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/__tests__/container.test.ts` | type-level + runtime 검증 |

### Workers Entry (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/workers/app.ts` | `createRequestHandler({ build, getLoadContext: (c) => ({ container: buildContainer(c.cloudflare.env) }) })`로 wiring |

### Env Types (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/env.d.ts` | `declare module "react-router" { interface AppLoadContext { container: Container } }` 추가 |

## Verification Steps

### 자동
- `bun run test` Container 테스트 Green
- `bun run typecheck` 통과 — RR7 loader 시그니처에서 `context.container`가 Container 타입으로 인식
- `bun run lint` 통과

### 수동
- `wrangler dev`에서 임시 `_index` loader에 `console.log(await context.container.getFeaturedProject())` 삽입 → seed project 출력 확인 (검증 후 삭제)

### 측정
- 없음

## Dependencies
- **Depends on**: T008 (service + Repository 구현)
- **Blocks**: T010~T015 (페이지 loader가 `context.container` 호출), T016/T017 (각각 search/contact service를 Container에 추가)

## Risks & Mitigations
- **Risk**: RR7의 `AppLoadContext` 타입 보강 위치(`app/env.d.ts` vs `app/types/`)가 잘못되면 typegen이 인식하지 않음.
  - **Mitigation**: PROJECT-STRUCTURE.md `app/env.d.ts`에 명시. 검증은 `bun run typecheck`로.
- **Risk**: `buildContainer`가 매 request마다 호출되면 Repository 인스턴스 재생성으로 메모리 압박.
  - **Mitigation**: velite Repository는 stateless이며 `.velite/*.json`을 module scope에서 1회 import만 하므로 재생성 비용 무시 가능. 추후 stateful resource(KV, Resend client) 추가 시 module-level singleton으로 캐싱 검토.

## References
- PROJECT-STRUCTURE.md `D2. DI 컨테이너` (line 573~)
- PROJECT-STRUCTURE.md `workers/ Directory` (line 357~)
- ROADMAP.md `Phase 2` Task 009, 가정 D2 확정

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
