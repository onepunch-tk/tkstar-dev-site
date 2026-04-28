# Task 001 — 프로젝트 스캐폴딩 + Bun + TypeScript + Biome 셋업

| Field | Value |
|-------|-------|
| **Task ID** | T001 |
| **Phase** | Phase 0 — Setup & Toolchain |
| **Layer** | 전 layer (인프라성) |
| **Branch** | `chore/scaffold-bun-rr7-biome` |
| **Depends on** | none |
| **Blocks** | T002, T003 |
| **PRD Features** | — (toolchain) |
| **PRD AC** | — |
| **예상 작업 시간** | 0.5d |
| **Status** | Not Started |

## Goal
빈 git 저장소에 Bun + TypeScript + Biome 기반의 빈 프로젝트 셸을 깔아, 이후 모든 phase의 진입 조건인 `bun --version` / `bun run typecheck` / `bun run lint` / `bun run format`을 무오류 통과시킨다.

## Context
- **Why**: 모든 후속 task는 이 셸 위에서 동작한다. CLAUDE.md `Tech Stack`에 명시된 bun + TypeScript + Biome 조합을 가장 먼저 가동시켜 toolchain 일관성을 확보한다.
- **Phase 진입/완료 연결**: Phase 0의 첫 task. 이 task가 Done이 되어야 T002/T003이 시작 가능.
- **관련 PRD 섹션**: PRD `Tech Stack — Build / Dev / Quality`, `Package Management`
- **관련 PROJECT-STRUCTURE 디렉토리**: 루트(`package.json`, `tsconfig.json`, `biome.json`, `.gitignore`)

## Scope

### In Scope
- `package.json` — 핵심 의존성 + scripts (`typecheck`, `lint`, `format`, `test` placeholder) 정의
- `tsconfig.json` / `tsconfig.app.json` — strict 모드 + path alias `~/*` → `./app/*`
- `biome.json` — Biome 2.4.13 lint + format 룰
- `.gitignore` 보강 — `.velite/`, `.react-router/`, `node_modules/`, `dist/`, `.wrangler/`
- `bun.lock` 생성

### Out of Scope
- React Router / Vite / Cloudflare Workers 설정 (T003)
- CA 4-layer 디렉토리 생성 (T002)
- 도메인 스키마 / 라우트 / 콘텐츠 (Phase 1+ task)

## Acceptance Criteria
- [ ] `bun --version`이 1.x 출력
- [ ] `bun install` 후 `bun.lock` 생성됨
- [ ] `bun run typecheck` 무오류 통과 (빈 프로젝트라도 tsc가 path alias 인식)
- [ ] `bun run lint`가 Biome 룰로 동작 (`No files to check.`도 OK)
- [ ] `bun run format`이 Biome formatter 호출
- [ ] `.gitignore`에 5개 항목(`.velite/`, `.react-router/`, `node_modules/`, `dist/`, `.wrangler/`) 모두 존재

## Implementation Plan (TDD Cycle)
**N/A — chore branch policy.** `chore/*` 브랜치는 CLAUDE.md 정책상 Plan/TDD phase가 면제되며, PR 리뷰가 안전망. 단, 위 AC는 모두 명령어 수준에서 검증 가능해야 한다.

## Files to Create / Modify

### Config
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/package.json` | 의존성 매니페스트 + scripts. dependencies: `react@19.2.4`, `react-dom@19.2.4`, `react-router@7.14.0`. devDependencies: `typescript@5.9.3`, `@biomejs/biome@2.4.13` |
| `/Users/tkstart/Desktop/project/tkstar-dev/tsconfig.json` | TS 진입점 — `extends` / `references` 분리 (`tsconfig.app.json` + `tsconfig.node.json`로 분기 가능) |
| `/Users/tkstart/Desktop/project/tkstar-dev/tsconfig.app.json` | 앱 코드용 — `strict: true`, `paths: { "~/*": ["./app/*"] }`, `moduleResolution: "bundler"` |
| `/Users/tkstart/Desktop/project/tkstar-dev/biome.json` | Biome lint + format 설정. `formatter.indentStyle = "tab"`(또는 프로젝트 합의), `linter.rules.recommended = true` |
| `/Users/tkstart/Desktop/project/tkstar-dev/.gitignore` | 기존 항목에 `.velite/`, `.react-router/`, `node_modules/`, `dist/`, `.wrangler/` 추가 |

### Generated (도구가 생성)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/bun.lock` | bun이 자동 생성 |

## Verification Steps

### 자동
- `bun --version` → `1.x.x` 출력
- `bun install` → `bun.lock` 생성, `node_modules/` 채워짐
- `bun run typecheck` → exit code 0
- `bun run lint` → exit code 0
- `bun run format` → exit code 0

### 수동
- 없음 (toolchain 검증)

### 측정
- 없음

## Dependencies
- **Depends on**: none
- **Blocks**: T002 (CA 4-layer는 path alias가 필요), T003 (Vite/RR7은 tsconfig + bun scripts 위에서 동작)

## Risks & Mitigations
- **Risk**: bun + Biome + TypeScript 5.9 조합의 path alias 인식 차이.
  - **Mitigation**: T001 PR에서 빈 `app/index.ts`를 임시 추가하여 `import "~/index"` 가짜 경로로 path alias 동작을 1회 검증한 뒤 제거.

## References
- CLAUDE.md `Tech Stack` (bun / TypeScript / Biome)
- CLAUDE.md `Git Integration` — `chore/*` 브랜치 정책
- ROADMAP.md `Phase 0` Task 001
- [Biome v2 docs](https://biomejs.dev/) — config schema
- [TypeScript 5.9 path mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
