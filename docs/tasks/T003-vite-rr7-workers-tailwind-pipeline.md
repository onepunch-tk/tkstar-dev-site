# Task 003 — Vite + React Router v7 Framework + Cloudflare Workers + Tailwind v4 빌드 파이프라인

| Field | Value |
|-------|-------|
| **Task ID** | T003 |
| **Phase** | Phase 0 — Setup & Toolchain |
| **Layer** | Platform Adapter (`workers/`) + Presentation 진입점 (`app/root.tsx`, `app/entry.*.tsx`) |
| **Branch** | `chore/issue-13-vite-rr7-workers-tailwind-pipeline` |
| **Depends on** | T001 |
| **Blocks** | T004, T005, T016 |
| **PRD Features** | — (toolchain) |
| **PRD AC** | — |
| **예상 작업 시간** | 1d |
| **Status** | ✅ Done (2026-04-28, PR #14) |

## Goal
Vite 8 + React Router v7 Framework mode + Cloudflare Workers + Tailwind v4 + Vitest를 모두 묶은 빌드/개발 파이프라인을 가동시켜, `bun run dev`/`bunx wrangler dev`로 빈 root 페이지가 SSR 응답하도록 한다. Vitest coverage threshold도 이 단계에서 확정한다.

## Context
- **Why**: 모든 후속 페이지·기능이 이 파이프라인 위에서 동작. SSR + Edge Runtime + Tailwind v4 native(`oklch`, `@theme`, `@variant dark`) + Vitest 테스트 환경을 한꺼번에 가동해야 후속 PR이 자기 콘텐츠에만 집중 가능.
- **Phase 진입/완료 연결**: T002 directory + T003 pipeline이 모두 Done이어야 Phase 1(T004 Routes / T005 Theme / T006 Domain)이 시작 가능.
- **관련 PRD 섹션**: PRD `Tech Stack — Frontend Framework`, `Styling & UI`, `Hosting / Edge`, `Build / Dev / Quality`
- **관련 PROJECT-STRUCTURE 디렉토리**: 루트(`vite.config.ts`, `react-router.config.ts`, `wrangler.toml`, `vitest.config.ts`), `workers/app.ts`, `app/{root.tsx, routes.ts, entry.server.tsx, entry.client.tsx, app.css, env.d.ts}`, `app/presentation/routes/_index.tsx`(빈 placeholder)

## Scope

### In Scope
- `vite.config.ts` — `@cloudflare/vite-plugin 1.33.2`, `@tailwindcss/vite 4.2.2`, `@vitejs/plugin-react 6.0.1`
- `react-router.config.ts` — `ssr: true`
- `wrangler.toml` — `name`, `main`, `compatibility_date = "2026-04-01"`, `[assets] binding = "ASSETS" directory = "./public"`
- `workers/app.ts` — fetch handler 스텁 (React Router request handler 호출 + `getLoadContext` placeholder)
- `app/root.tsx` / `app/entry.server.tsx` / `app/entry.client.tsx` — RR7 진입점 최소 동작본 (`isbot` 분기 + `renderToReadableStream`)
- `app/routes.ts` — `flatRoutes({ rootDirectory: "presentation/routes" })`
- `app/presentation/routes/_index.tsx` — 빈 placeholder
- `app/app.css` — Tailwind v4 진입점 (`@import "tailwindcss"` + 빈 `@theme {}`)
- `app/env.d.ts` — 클라이언트 환경변수 타입 + RR7 typegen reference
- `vitest.config.ts` — jsdom env + coverage threshold (`lines: 80`, `branches: 75`, `functions: 80`, `statements: 80`) + 제외 경로

### Out of Scope
- 디자인 토큰 / 다크모드 (T005)
- 라우트 13개 (T004)
- Domain 스키마 (T006)
- velite (T007)

## Acceptance Criteria
- [x] `bun run dev` Vite dev server가 부팅되고 `/`에 접속 시 빈 placeholder가 렌더
- [x] `bunx wrangler dev`가 Workers dev 서버를 띄우고 `curl http://localhost:8787`이 SSR HTML 응답
- [x] `bun run typecheck` 통과 (RR7 typegen `.react-router/types/*` 생성)
- [x] `bun run lint` 통과
- [x] `bun run test`가 sanity 테스트에서 0 exit
- [x] `bun run test:coverage` 실행 시 coverage threshold 설정값 (lines 80 / branches 75 / functions 80 / statements 80)이 `vitest.config.ts`에 명시되어 있고, 리포트 생성

## Implementation Plan (TDD Cycle)
**N/A — chore branch policy.** 빌드 파이프라인 자체는 TDD 대상 아님. 단, Vitest는 이 단계에서 가동시켜 두어야 후속 task가 Red phase부터 진행 가능.

다만 가동 검증을 위해 1개 sanity test를 추가:
- `app/__tests__/sanity.test.ts` — `expect(1 + 1).toBe(2)`로 Vitest jsdom 환경 기동 자체 검증

## Files to Create / Modify

### Build / Bundler Config
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/vite.config.ts` | Vite + RR7 + Cloudflare + Tailwind v4 + React 플러그인 조합 |
| `/Users/tkstart/Desktop/project/tkstar-dev/react-router.config.ts` | `ssr: true` (정적 콘텐츠도 SEO/OG 위해 SSR) |
| `/Users/tkstart/Desktop/project/tkstar-dev/wrangler.toml` | `name = "tkstar-dev"`, `main = "workers/app.ts"`, `compatibility_date = "2026-04-01"`, `[assets] binding = "ASSETS" directory = "./public"` |
| `/Users/tkstart/Desktop/project/tkstar-dev/vitest.config.ts` | jsdom env, `setupFiles`(`@testing-library/jest-dom` 자동 매처), coverage `provider = "v8"` + thresholds (`lines: 80, branches: 75, functions: 80, statements: 80`), 제외 경로 (`**/*.config.*`, `**/__tests__/**`, `**/*.d.ts`, `workers/app.ts`, `app/entry.{server,client}.tsx`) |

### Workers Entry
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/workers/app.ts` | `export default { fetch: createRequestHandler({ build, getLoadContext: () => ({ container: null }) }) }` 스텁. T009에서 container 채움 |

### App Entry
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/root.tsx` | `<html><head><Meta /><Links /></head><body><Outlet /><Scripts /></body></html>` 최소형 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/entry.server.tsx` | `isbot(request.headers.get("user-agent"))` 분기 + `renderToReadableStream` (Workers 친화) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/entry.client.tsx` | `hydrateRoot(document, <HydratedRouter />)` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/routes.ts` | `flatRoutes({ rootDirectory: "presentation/routes" }) satisfies RouteConfig` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/app.css` | `@import "tailwindcss";` + 빈 `@theme {}` (T005에서 토큰 채움) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/env.d.ts` | `/// <reference types="vite/client" />` + `/// <reference types="../.react-router/types/+register" />` |

### Presentation Routes (placeholder)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/_index.tsx` | 빈 placeholder — `export default function Index() { return <h1>tkstar.dev — coming soon</h1>; }` |

### Sanity Test
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/__tests__/sanity.test.ts` | Vitest jsdom 환경 기동 검증용 1줄 테스트 |

### package.json scripts (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/package.json` | scripts에 `dev: "react-router dev"`, `build: "react-router build"`, `start: "wrangler dev"`, `typecheck: "tsc -b"`, `lint: "biome check ."`, `format: "biome format --write ."`, `test: "vitest run"`, `test:watch: "vitest"`, `test:coverage: "vitest run --coverage"` 추가 |

## Verification Steps

### 자동
- `bun install` 완료 → `node_modules/{vite, react-router, @cloudflare/vite-plugin, @tailwindcss/vite, vitest, jsdom, @testing-library/react}` 모두 존재
- `bun run typecheck` 통과 (typegen 디렉토리 `.react-router/types/` 생성)
- `bun run test` → sanity test 1개 pass
- `bun run test:coverage` → 리포트 생성 + threshold 조건 충족

### 수동
- `bun run dev` → 브라우저에서 `http://localhost:5173/` 접속 시 placeholder 렌더
- `bunx wrangler dev` → `http://localhost:8787/` 접속 시 SSR HTML 반환 (HTML 소스에 placeholder 텍스트 포함)

### 측정
- 없음 (성능 측정은 T021)

## Dependencies
- **Depends on**: T001
- **Blocks**: T004 (라우트 13개 추가), T005 (Tailwind v4 토큰 / `@theme`), T016 (Cmd+K palette는 root.tsx 마운트)

## Risks & Mitigations
- **Risk**: `@cloudflare/vite-plugin 1.33.2`와 RR7 7.14.0 + Tailwind v4의 plugin 순서가 잘못될 경우 빌드 실패.
  - **Mitigation**: vite.config.ts plugin 배열 순서를 `[react(), reactRouter(), cloudflare(), tailwind()]` 순으로 시작 → 실패 시 한 단계씩 swap. 공식 RR7 + Cloudflare 템플릿(`create-react-router --template remix-run/react-router-templates/cloudflare`)을 참조해 모범 순서 확정.
- **Risk**: Workers의 `compatibility_date`가 너무 오래되면 `URL.canParse` 등 일부 API 미지원.
  - **Mitigation**: `2026-04-01`로 충분히 최신 설정.

## References
- PRD `Tech Stack — Frontend Framework / Styling & UI / Hosting`
- PROJECT-STRUCTURE.md `workers/ Directory (Cloudflare Workers Entry)` (line 357~)
- PROJECT-STRUCTURE.md `D1. 라우트 디렉토리` (line 568~)
- ROADMAP.md `Phase 0` Task 003
- [React Router v7 Cloudflare Workers Guide](https://reactrouter.com/start/framework/deploying)
- [Tailwind v4 `@theme` 블록](https://tailwindcss.com/docs/theme)
- [Cloudflare Vite Plugin](https://developers.cloudflare.com/workers/vite-plugin/)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-04-28 | T003 완료 (PR #14, Issue #13). T001/T002 위에 delta 작업: `@vitest/coverage-v8@4.1.5` + `@react-router/fs-routes@7.14.0` 추가, `vitest.config.ts` v8 coverage threshold, `wrangler.toml [assets]` 바인딩, `app/routes.ts` flatRoutes 전환, `_index.tsx` placeholder, `__tests__/sanity.test.ts`, `package.json start/test:coverage` scripts. AC 6/6 충족. | TaekyungHa |
