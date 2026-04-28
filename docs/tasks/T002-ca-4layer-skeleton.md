# Task 002 — Clean Architecture 4-layer 디렉토리 골격 + path alias

| Field | Value |
|-------|-------|
| **Task ID** | T002 |
| **Phase** | Phase 0 — Setup & Toolchain |
| **Layer** | 전 layer (구조) |
| **Branch** | `chore/ca-4layer-skeleton` |
| **Depends on** | T001 |
| **Blocks** | T004, T006, T007, T008, T009 |
| **PRD Features** | — (구조) |
| **PRD AC** | — |
| **예상 작업 시간** | 0.5d |
| **Status** | Not Started |

## Goal
PROJECT-STRUCTURE.md에 명시된 Clean Architecture 4-layer(`app/{domain,application,infrastructure,presentation}/`) 디렉토리 골격을 빈 placeholder와 함께 생성하고, path alias가 모든 layer에 정상 동작하도록 한다.

## Context
- **Why**: 후속 task가 새 모듈을 추가할 때마다 위치를 고민하지 않도록 구조를 미리 확정. Domain ← Application ← Infrastructure / Presentation ← Application의 의존성 방향을 README 또는 ESLint(Biome) 규칙으로 문서화.
- **Phase 진입/완료 연결**: T001 완료 후 즉시 시작. T002 완료 시 Phase 1의 Domain 스키마(T006), Phase 2의 ports/repos(T008)가 적절한 디렉토리에 들어갈 수 있다.
- **관련 PRD 섹션**: 없음 (구조)
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/domain/{project,post,legal,contact,theme}/`, `app/application/{content,contact,search,og,feed,seo}/{ports,services}/`, `app/infrastructure/{config,content,email,captcha,og,search,analytics}/`, `app/presentation/{components,hooks,lib,layouts,routes}/`, `test/{fixtures,utils}/`

## Scope

### In Scope
- 4-layer 최상위 디렉토리 생성 + 각 도메인 sub-디렉토리 생성
- 각 디렉토리에 `index.ts` placeholder (`export {};`) 또는 `.gitkeep` 파일 생성 (git이 빈 디렉토리를 추적하지 않으므로)
- `tsconfig.app.json`에 4-layer path alias 보강 (`~/domain/*`, `~/application/*`, `~/infrastructure/*`, `~/presentation/*`)
- `app/README.md`에 의존성 방향 명시 (Domain ← Application ← Infrastructure / Presentation ← Application)

### Out of Scope
- 실제 구현(`*.entity.ts`, `*.service.ts` 등) — 후속 task
- 라우트 파일(`app/presentation/routes/*.tsx`) — T004
- `velite.config.ts` / `vite.config.ts` — T003/T007

## Acceptance Criteria
- [ ] `app/domain/{project,post,legal,contact,theme}/` 디렉토리가 모두 존재 (각각 `.gitkeep` 또는 `index.ts`)
- [ ] `app/application/{content,contact,search,og,feed,seo}/{ports,services}/` 디렉토리가 모두 존재
- [ ] `app/infrastructure/{config,content,email,captcha,og,search,analytics}/` 디렉토리가 모두 존재
- [ ] `app/presentation/{components,hooks,lib,layouts,routes}/` 디렉토리가 모두 존재
- [ ] `test/{fixtures,utils}/` 디렉토리가 존재
- [ ] `bun run typecheck`가 path alias `~/domain/*` 등을 모두 인식
- [ ] `app/README.md`에 의존성 방향이 1줄 이상으로 문서화

## Implementation Plan (TDD Cycle)
**N/A — chore branch policy.** 디렉토리 구조 자체는 테스트 대상이 아님. `bun run typecheck` 통과로 path alias 정합성을 검증.

## Files to Create / Modify

### Domain (5 sub-domains)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/project/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/post/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/legal/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/contact/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/theme/.gitkeep` | placeholder |

### Application (6 sub-domains × 2 sub-dirs)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/content/{ports,services}/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/contact/{ports,services}/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/search/services/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/og/{ports,services}/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/feed/services/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/seo/services/.gitkeep` | placeholder |

### Infrastructure (7 modules)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/content/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/email/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/captcha/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/og/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/search/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/analytics/.gitkeep` | placeholder |

### Presentation
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/layouts/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/.gitkeep` | placeholder (T004에서 채움) |

### Test Utils
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/test/fixtures/.gitkeep` | placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/test/utils/.gitkeep` | placeholder |

### Config (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/tsconfig.app.json` | `paths`에 `~/domain/*`, `~/application/*`, `~/infrastructure/*`, `~/presentation/*`, `#content/*` 추가 |

### Docs
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/README.md` | 의존성 방향 문서화 (`Domain ← Application ← Infrastructure / Presentation ← Application`) — 4-layer rule 한 페이지 요약 |

## Verification Steps

### 자동
- `bun run typecheck` → exit code 0
- `find app -type d`로 4-layer 구조 확인
- 임시 테스트 파일(`/tmp/import-test.ts`)에서 `import "~/domain/project"` / `import "~/infrastructure/config"` 등 4종 path alias가 컴파일러에 의해 resolution됨

### 수동
- 없음

### 측정
- 없음

## Dependencies
- **Depends on**: T001 (path alias가 동작해야 함)
- **Blocks**: T004 (라우트 디렉토리 사용), T006 (Domain 디렉토리 사용), T007 (Infrastructure content 디렉토리 사용), T008 (Application/Infrastructure 디렉토리 사용), T009 (Infrastructure config 사용)

## Risks & Mitigations
- **Risk**: `.gitkeep` 대신 `index.ts` 생성 시 빈 export로 인한 lint 경고 발생 가능.
  - **Mitigation**: `.gitkeep`을 채택. Biome `linter.includes`에서 `.gitkeep` 제외.

## References
- PROJECT-STRUCTURE.md `app/ Directory (Core Application)` (line 91~)
- PROJECT-STRUCTURE.md `Dependency Direction Rules` (line 511~)
- ROADMAP.md `Phase 0` Task 002

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
