# Task 008 — Application Ports + Content Repositories (Infrastructure 구현)

| Field | Value |
|-------|-------|
| **Task ID** | T008 |
| **Phase** | Phase 2 — Content Pipeline |
| **Layer** | Application (`ports/services/`) + Infrastructure (`content/`) |
| **Branch** | `feature/issue-29-content-ports-repos` |
| **Depends on** | T002, T006, T007 |
| **Blocks** | T009, T010, T011, T012, T013, T014a, T014b, T015, T016, T017 |
| **PRD Features** | F004, F005, F006, F007, F014, F017 |
| **PRD AC** | — (read-side 정확성은 unit test로 충분) |
| **예상 작업 시간** | 2d |
| **Status** | ✅ Done |

## Goal
Application Layer에 3개 Repository Port + 6개 Service(유스케이스)를 정의하고, Infrastructure Layer에 velite read-side adapter 3개 + mapper를 구현한다. 이 task가 Done이면 페이지 task가 호출할 모든 read-side 유스케이스가 가동된다.

## Context
- **Why**: PRD의 페이지 task(T010~T015)는 `getFeaturedProject`, `listProjects`, `getProjectDetail(prev/next)`, `listPosts`, `getPostDetail`, `getRecentPosts(3)` 6개 유스케이스를 직접 호출한다. CA 원칙상 페이지(Presentation)는 Repository를 직접 import하지 않고 유스케이스 service를 통해서만 데이터에 접근.
- **Phase 진입/완료 연결**: T007에서 `.velite/{projects,posts,legal}.json`이 정상 생성되면 즉시 시작. T008 Done 후 T009(DI container)가 Service 인스턴스를 등록할 수 있다.
- **관련 PRD 섹션**: PRD `Page-by-Page` (Home Featured/Recent — F017, Projects 목록 F004, Project Detail F005 prev/next, Blog 목록 F006, Blog Detail F007, Legal Index F014)
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/application/content/{ports,services}/`, `app/infrastructure/content/`

## Scope

### In Scope
- 3개 Repository Port (`project`, `post`, `legal`) — interface only
- 6개 Service (`list-projects`, `get-project-detail`(prev/next 포함), `get-featured-project`, `list-posts`, `get-post-detail`, `get-recent-posts`)
- 추가 service `get-related-posts` (Blog Detail에서 prev/next에 사용)
- 3개 velite Repository 구현 (Infrastructure)
- 3개 mapper (velite raw output → Domain Entity)
- 모든 모듈의 `__tests__/` colocated

### Out of Scope
- DI Container wiring (T009)
- 페이지에서 service 호출 (T010~T015)
- Search index 빌드 service (T016이 별도 service에서 처리)
- RSS feed service (T014a)
- Sitemap service (T019)

## Acceptance Criteria
- [x] `ProjectRepository.findAll()` / `findBySlug(slug)` / `findFeatured()` / `findRelated(slug) → {prev, next}` / `findByTag(tag)` 인터페이스가 정의됨
- [x] `PostRepository.findAll()` / `findBySlug(slug)` / `findRecent(n)` / `findByTag(tag)` / `findRelated(slug) → {prev, next}` 정의
- [x] `LegalRepository.findAppDoc(app_slug, doc_type)` / `listApps()` 정의
- [x] 6개 Service 구현이 mock Repository로 단위 테스트 통과
- [x] velite Repository 구현이 fixture `.velite/*.json`을 매핑하여 Domain Entity 배열 반환
- [x] `findRelated(slug)`는 발행일/date 기준 정렬 기준으로 인접 항목을 반환 (첫 항목의 prev = null, 마지막 항목의 next = null)
- [x] `bun run test` 모든 `__tests__/` Green (PR #29 머지 시점 / T009에서도 94 passed 유지)

## Implementation Plan (TDD Cycle)

### Red
모든 service는 mock Repository를 주입하여 케이스별 검증 (Inside-Out 순서로 Application service → Infrastructure repo):

#### Application Services
- `app/application/content/services/__tests__/list-projects.service.test.ts`
  - mock repo가 3개 project 반환 → service가 그대로 반환
  - `tag` 인자 → `findByTag(tag)` 호출 분기
- `app/application/content/services/__tests__/get-project-detail.service.test.ts`
  - 정상 slug → `findBySlug` + `findRelated` 모두 호출 + `{project, prev, next}` 반환
  - 미존재 slug → `findBySlug`가 null 반환 시 `ProjectNotFoundError` throw
- `app/application/content/services/__tests__/get-featured-project.service.test.ts`
  - 다수 featured 중 첫 항목만 반환
  - featured 없음 → null 반환
- `app/application/content/services/__tests__/list-posts.service.test.ts`
  - 발행일 역순 정렬 검증
- `app/application/content/services/__tests__/get-post-detail.service.test.ts`
  - prev/next 포함, 미존재 시 throw
- `app/application/content/services/__tests__/get-recent-posts.service.test.ts`
  - n=3 인자 → mock repo `findRecent(3)` 호출

#### Infrastructure Repositories
- `app/infrastructure/content/__tests__/velite-project.repository.test.ts`
  - fixture `.velite/projects.json` (test/fixtures/) → `findAll()` 정상 매핑
  - `findFeatured()` 우선순위 검증
  - `findRelated("foo")` → 인접 항목 `{prev, next}` 반환
- `app/infrastructure/content/__tests__/velite-post.repository.test.ts`
  - 발행일 역순 정렬
- `app/infrastructure/content/__tests__/velite-legal.repository.test.ts`
  - `findAppDoc("moai", "terms")` 정상 매핑
  - `listApps()` 중복 제거된 app slug 배열 반환

### Green
- 6개 service 구현 (각 함수형 또는 클래스, port 의존성 주입 받음)
- 3개 Repository 구현 (`#content/*` path alias로 `.velite/*.json` import → mapper로 Domain Entity 변환)
- 3개 mapper

### Refactor
- service 공통 패턴(`assertExists` 등) 추출
- mapper 공통 helper(`toIsoDate`, `toMetrics`) 추출

## Files to Create / Modify

### Application — Ports
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/ports/project-repository.port.ts` | `interface ProjectRepository { findAll, findBySlug, findFeatured, findRelated, findByTag }` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/ports/post-repository.port.ts` | `findAll, findBySlug, findRecent, findByTag, findRelated` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/ports/legal-repository.port.ts` | `findAppDoc, listApps` |

### Application — Services
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/list-projects.service.ts` | `(repo, opts?: {tag}) => Project[]` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/get-project-detail.service.ts` | `(repo, slug) => {project, prev, next}` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/get-featured-project.service.ts` | `(repo) => Project \| null` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/list-posts.service.ts` | `(repo, opts?: {tag}) => Post[]` (발행일 역순) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/get-post-detail.service.ts` | `(repo, slug) => {post, prev, next}` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/get-recent-posts.service.ts` | `(repo, n) => Post[]` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/services/__tests__/*.test.ts` | 6 service tests (Red 케이스 위) |

### Infrastructure — Content Repositories
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/velite-project.repository.ts` | implements `ProjectRepository` — `.velite/projects.json` import + mapper |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/velite-post.repository.ts` | implements `PostRepository` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/velite-legal.repository.ts` | implements `LegalRepository` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/mappers/project.mapper.ts` | velite raw → `Project` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/mappers/post.mapper.ts` | velite raw → `Post` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/mappers/legal.mapper.ts` | velite raw → `AppLegalDoc` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/__tests__/velite-project.repository.test.ts` | fixture-based tests |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/__tests__/velite-post.repository.test.ts` | fixture-based tests |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/__tests__/velite-legal.repository.test.ts` | fixture-based tests |

### Test Fixtures
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/test/fixtures/velite-projects.fixture.ts` | mock `.velite/projects.json` 형태 데이터 (3 projects, 1 featured) |
| `/Users/tkstart/Desktop/project/tkstar-dev/test/fixtures/velite-posts.fixture.ts` | mock posts (4개, 발행일 다양) |
| `/Users/tkstart/Desktop/project/tkstar-dev/test/fixtures/velite-legal.fixture.ts` | mock legal (moai terms + privacy) |

## Verification Steps

### 자동
- `bun run test` → 모든 service + repository 테스트 Green
- `bun run typecheck` → port와 구현체 사이 type contract 일치
- `bun run lint` 통과

### 수동
- 없음

### 측정
- 없음

## Dependencies
- **Depends on**: T002 (디렉토리), T006 (Domain entity 타입), T007 (`.velite/*.json` 산출물)
- **Blocks**: T009 (DI container가 service들을 register), T010~T015 (페이지 loader가 service 호출), T016 (search-index service가 ProjectRepository/PostRepository 활용 가능), T017 (DI 통로 공유)

## Risks & Mitigations
- **Risk**: `.velite/*.json` 직접 import는 dev/build 모두에서 typegen이 필요. velite는 자체 type 생성 기능 제공.
  - **Mitigation**: velite의 `dts: true` 옵션으로 `.velite/types.d.ts` 자동 생성 + `tsconfig`에 include. mapper에서 velite type → Domain entity로 변환하여 외부 격리.
- **Risk**: `findRelated`의 정렬 기준이 Project(date YYYY-MM)와 Post(ISO date)가 다름 → 통합 unit test가 필요.
  - **Mitigation**: Repository 구현 단계에서 date 파싱을 일관되게 처리 (Project의 YYYY-MM은 `${date}-01` 보강).

## References
- PRD `Page-by-Page` Home/Projects/Project Detail/Blog/Blog Detail/Legal Index Key Features
- PROJECT-STRUCTURE.md `app/application/` (line 137~) + `app/infrastructure/content/` (line 213~)
- ROADMAP.md `Phase 2` Task 008

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
