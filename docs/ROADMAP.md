# tkstarDev Development Roadmap

> 1인 기업(개발자) 개인 브랜드 사이트 `tkstar.dev`를 React Router v7 Framework + Cloudflare Workers SSR + Clean Architecture 4-layer로 빌드하기 위한 단계별 구현 계획. 본 로드맵은 PRD(F001~F019)와 PROJECT-STRUCTURE(CA 4-layer + velite + Workers Asset Binding)를 task 단위로 분해한 정본이며, **Structure-First → Inside-Out (Domain → Application → Infrastructure → Presentation) → TDD-First** 순서를 따른다.

## Overview

tkstarDev는 다음 핵심 가치를 단일 도메인에서 달성한다:

- **사이트 자체가 이력서**: B2B(채용/HR)와 B2C(프리랜서 의뢰) 양쪽 청중을 콘텐츠 라우팅(About / Projects)으로 자연 수렴
- **검색 우선 네비게이션**: Cmd+K Command Palette (F016)가 주 네비게이션 패러다임
- **DB 없는 정적 콘텐츠 파이프라인**: velite + MDX + Zod 빌드 타임 ETL로 Repository 패턴 유지
- **Edge SSR + 동적 OG**: Cloudflare Workers + Satori standalone + Asset Binding으로 슬러그별 OG 1200×630 이미지 생성
- **운영 비용 0원 지향**: Cloudflare Workers / Email Routing / Web Analytics / Turnstile + Resend 무료 티어

## Development Workflow

1. **Task Planning**
   - 기존 코드베이스를 학습하고 현재 상태를 파악한다
   - `ROADMAP.md`를 갱신하여 새 task를 포함시킨다
   - 우선순위가 높은 task를 마지막 완료 task 다음에 삽입한다

2. **Task Creation**
   - `/tasks` 디렉토리에 새 task 파일을 생성한다 (`XXX-description.md`)
   - 직전 완료 task(예: `011`, `010`)를 참고 자료로 사용한다
   - 신규 task는 모든 체크박스가 비어 있고 Change History도 비어 있다

3. **Task Implementation**
   - task 파일의 사양을 따른다
   - **Inside-Out TDD**: Domain `__tests__` → Application `__tests__` → Infrastructure `__tests__` → Presentation `__tests__` 순서로 Red → Green → Refactor
   - 각 step 진행 후 task 파일의 progress를 갱신한다

4. **Task Completion & Roadmap Update**
   - `/tasks/XXX-*.md`의 체크박스를 `[x]`로 갱신하고 Change History에 기록한다
   - 본 ROADMAP.md의 해당 task에 ✅를 표기하고 `**Must** Read:` 링크를 추가한다
   - PR 생성: `feature/issue-N-{slug}` 또는 `chore/{slug}` / `docs/{slug}` 브랜치 → squash merge → `git checkout development && git pull --ff-only`

## Branch & PR 정책 요약

| 변경 유형 | 브랜치 prefix | Plan/TDD phase 필수 |
|----------|---------------|---------------------|
| 기능 구현 (F001~F019) | `feature/issue-N-*` | ✅ Phase 1 Plan + Phase 2 TDD 필수 |
| 버그 수정 | `fix/issue-N-*` | ✅ Phase 1 Plan + Phase 2 TDD 필수 |
| 문서 변경 | `docs/*` | ❌ 생략 (PR 리뷰가 안전망) |
| 설정/하니스/잡일 | `chore/*` | ❌ 생략 (PR 리뷰가 안전망) |

> **PR-only**: `development`, `main` 브랜치에 직접 push 금지. ROADMAP.md 체크박스 업데이트조차 PR 경유.

---

## Phase 0: Setup & Toolchain

> **목표**: 빈 React Router v7 + Cloudflare Workers + Clean Architecture 4-layer 프로젝트 골격을 만들고, 빌드/테스트/린트 파이프라인을 가동시킨다. 이후 모든 phase는 이 골격 위에서 진행된다.
>
> **진입 조건**: PRD/PROJECT-STRUCTURE 정본 확정 (현재 시점)
> **완료 조건 (DoD)**: `bun run typecheck`, `bun run lint`, `bun run test`, `bun run dev`(또는 `bun run start`), `bunx wrangler dev`가 모두 무오류 통과. `app/{domain,application,infrastructure,presentation}/` 4-layer 디렉토리가 placeholder index와 함께 존재.

- [x] **Task 001: 프로젝트 스캐폴딩 + Bun + TypeScript + Biome 셋업** ✅
  - **Must** Read: [tasks/T001-scaffold-bun-rr7-biome.md](tasks/T001-scaffold-bun-rr7-biome.md)
  - blockedBy: none
  - blocks: Task 002, Task 003
  - Layer: 전 layer (인프라성)
  - 관련 Feature: 없음 (toolchain)
  - 관련 AC: 없음
  - 검증: `bun --version`, `bun run typecheck`, `bun run lint`, `bun run format` 통과
  - 산출물:
    - `package.json` (bun, react 19.2.4, react-router 7.14.0, typescript 5.9.3, biome 2.4.13)
    - `tsconfig.json` / `tsconfig.app.json` (path alias `~/*` → `./app/*` 등)
    - `biome.json`
    - `.gitignore` 보강 (`.velite/`, `.react-router/`, `node_modules/`, `dist/`, `.wrangler/`)
  - PR 1개 / 브랜치: `chore/scaffold-bun-rr7-biome`

- [x] **Task 002: Clean Architecture 4-layer 디렉토리 골격 + path alias** ✅
  - **Must** Read: [tasks/T002-ca-4layer-skeleton.md](tasks/T002-ca-4layer-skeleton.md)
  - blockedBy: Task 001
  - blocks: Task 004, Task 006, Task 007, Task 008, Task 009
  - Layer: 전 layer (구조)
  - 관련 Feature: 없음 (구조)
  - 관련 AC: 없음
  - 검증: `app/{domain,application,infrastructure,presentation}/` 디렉토리 존재 + 각 layer에 `index.ts` placeholder + 의존성 방향(Domain ← Application ← Infrastructure / Presentation ← Application) Lint 또는 README로 문서화
  - 산출물:
    - `app/domain/{project,post,legal,contact,theme}/` 빈 모듈
    - `app/application/{content,contact,search,og,feed,seo}/{ports,services}/` 빈 모듈
    - `app/infrastructure/{config,content,email,captcha,og,search,analytics}/` 빈 모듈
    - `app/presentation/{components,hooks,lib,layouts,routes}/` 빈 모듈
    - `test/{fixtures,utils}/` 빈 디렉토리
  - PR 1개 / 브랜치: `chore/ca-4layer-skeleton`

- [x] ✅ **Task 003: Vite + React Router v7 Framework + Cloudflare Workers + Tailwind v4 빌드 파이프라인** (2026-04-28, PR #14)
  - **Must** Read: [tasks/T003-vite-rr7-workers-tailwind-pipeline.md](tasks/T003-vite-rr7-workers-tailwind-pipeline.md)
  - blockedBy: Task 001
  - blocks: Task 004, Task 005, Task 016
  - Layer: Platform Adapter (workers/) + Presentation 진입점
  - 관련 Feature: 없음 (toolchain)
  - 관련 AC: 없음
  - 검증: `bun run dev` Vite dev server 부팅 / `bunx wrangler dev` Workers dev 부팅 / 빈 root 페이지가 SSR로 응답 / `bun run test:coverage`가 빈 상태에서도 Vitest coverage 리포트 생성 + threshold 설정 통과
  - 산출물:
    - `vite.config.ts` (`@cloudflare/vite-plugin 1.33.2`, `@tailwindcss/vite 4.2.2`, `@vitejs/plugin-react 6.0.1`)
    - `react-router.config.ts` (`ssr: true`)
    - `wrangler.toml` (`name = "tkstar-dev"`, `main = "workers/app.ts"`, `compatibility_date = "2026-04-01"`, `[assets] binding="ASSETS" directory="./public"`)
    - `workers/app.ts` (fetch handler → React Router request handler 스텁)
    - `app/{root.tsx, routes.ts, entry.server.tsx, entry.client.tsx, app.css, env.d.ts}` 최소 동작본
    - `app/routes.ts`: `flatRoutes({ rootDirectory: "presentation/routes" })`
    - `app/presentation/routes/_index.tsx` (빈 placeholder)
    - `vitest.config.ts` — `test.coverage.thresholds = { lines: 80, branches: 75, functions: 80, statements: 80 }` (1인 정적 사이트 기준; Phase 6 진입 시 T021에서 동일 수치로 재확인). 제외 경로: `**/*.config.*`, `**/__tests__/**`, `**/*.d.ts`, `workers/app.ts`(SSR entry), `app/entry.{server,client}.tsx`
  - PR 1개 / 브랜치: `chore/vite-rr7-workers-tailwind-pipeline`

---

## Phase 1: Foundation — Routing Skeleton + Domain Schemas + Theme

> **목표**: PRD에 정의된 모든 라우트의 빈 모듈을 만들고, Domain layer의 콘텐츠 스키마(Project/Post/AppLegalDoc/ContactSubmission/ThemePreference)를 Zod로 확정한다. F010 다크모드(`[data-theme]`) 전략을 root layout에 심는다.
>
> **진입 조건**: Phase 0 완료
> **완료 조건 (DoD)**: 모든 PRD 페이지에 해당하는 빈 라우트 파일이 존재하여 `wrangler dev`로 직접 URL 입력 시 404가 아닌 placeholder 응답. Domain `__tests__/` 안 Zod 스키마 테스트가 모두 Green. `[data-theme]` 토글이 시스템/localStorage 추종으로 동작.

- [x] **Task 004: 라우트 스켈레톤 13개 + chrome / chrome-free 레이아웃**
  - **Must** Read: [tasks/T004-route-skeleton.md](tasks/T004-route-skeleton.md)
  - blockedBy: Task 002, Task 003
  - blocks: Task 010, Task 011, Task 012, Task 013, Task 014, Task 015
  - Layer: Presentation (routes + layouts)
  - 관련 Feature: F014(chrome-free), F018/F019(root layout meta 자리), F004 splat fallback 위치
  - 관련 AC: AC-F016-1/2 단축키 스코프(향후), AC-F018 sitemap 자리(향후)
  - 검증: 각 URL을 직접 입력 시 placeholder 페이지가 렌더, App Terms/Privacy는 Topbar/Footer가 노출되지 않음, splat 라우트는 터미널 메시지 placeholder
  - 산출물 (`app/presentation/routes/`):
    - `_index.tsx` (Home), `about.tsx`, `projects._index.tsx`, `projects.$slug.tsx`
    - `blog._index.tsx`, `blog.$slug.tsx`, `contact.tsx`
    - `legal._index.tsx`, `legal.$app.terms.tsx`, `legal.$app.privacy.tsx`
    - `rss[.xml].tsx`, `sitemap[.xml].tsx`, `robots[.txt].tsx`
    - `og.projects.$slug[.png].tsx`, `og.blog.$slug[.png].tsx`
    - `$.tsx` (splat → Not Found Fallback placeholder)
  - 레이아웃: `app/presentation/layouts/{ChromeLayout.tsx, ChromeFreeLayout.tsx}`
  - 검증 가정 A004 해소 (splat 라우트 채택 — F018/F019의 차등 인덱싱 정책 지원)
  - PR 1개 / 브랜치: `feature/issue-N-route-skeleton`

- [x] **Task 005: 디자인 토큰 이식 + Tailwind v4 `@theme` + `[data-theme]` dark variant + 다크모드 (F010)** ✅ 2026-04-28 (Issue #19, branch `feature/issue-19-theme-tokens`)
  - **Must** Read: [tasks/T005-theme-tokens.md](tasks/T005-theme-tokens.md)
  - blockedBy: Task 003
  - blocks: Task 010, Task 011, Task 012, Task 013, Task 014, Task 015
  - Layer: Presentation (components/chrome, hooks, app.css)
  - 관련 Feature: **F010** (다크모드 토글)
  - 관련 AC: 없음 (UI 표시 위주, Page-by-Page Key Features로 검증)
  - 검증: 시스템 dark/light 추종 확인, 토글 클릭 시 `[data-theme]` 속성 전환, localStorage `proto-theme` 저장, 새로고침 시 강제 모드 복원, FOIT 없이 첫 렌더부터 정확한 테마
  - 산출물:
    - `app/app.css` — `@theme { --color-*, --font-* }` 토큰 (`docs/design-system/styles.css`의 oklch 토큰 이식), `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))`
    - `app/presentation/hooks/useTheme.ts` — system 추종 + localStorage `proto-theme` 강제 전환
    - `app/presentation/components/chrome/{Topbar.tsx, Footer.tsx, ThemeToggle.tsx}` 골격
    - `app/root.tsx` — `<html data-theme={...}>` SSR-safe blocking script로 첫 렌더 깜빡임 방지
    - `public/fonts/JetBrainsMono-{Regular,Medium,Bold}.woff2` self-host + `@font-face`
  - TDD: `useTheme.test.ts` (system 추종 / 강제 전환 / localStorage persist) — `__tests__/`
  - PR 1개 / 브랜치: `feature/issue-N-theme-tokens`

- [x] **Task 006: Domain Schemas — Project / Post / AppLegalDoc / ContactSubmission / ThemePreference**
  - **Must** Read: [tasks/T006-domain-schemas.md](tasks/T006-domain-schemas.md)
  - blockedBy: Task 002
  - blocks: Task 007, Task 008, Task 009
  - Layer: **Domain** (innermost)
  - 관련 Feature: F002(About 데이터), F004(Project), F005(Project Detail), F006/F007(Post), F008(Contact), F010(Theme), F014(AppLegalDoc), F017(featured/recent)
  - 관련 AC: AC-F008-2/3 (이메일/메시지 검증 규칙은 ContactSubmission schema에 정의)
  - 검증: Domain `__tests__/` 안 Zod 스키마 테스트 (정상값 통과 / 이상값 reject) 100% Green
  - 산출물:
    - `app/domain/project/{project.entity.ts, project.schema.ts, project.errors.ts}` + `__tests__/project.schema.test.ts`
    - `app/domain/post/{post.entity.ts, post.schema.ts}` + `__tests__/post.schema.test.ts`
    - `app/domain/legal/{app-legal-doc.entity.ts, app-legal-doc.schema.ts}` + `__tests__/`
    - `app/domain/contact/{contact-submission.vo.ts, contact-submission.schema.ts, contact.errors.ts}` + `__tests__/contact-submission.schema.test.ts`
    - `app/domain/theme/theme-preference.vo.ts`
  - 가정 해소: A001(About 자격증 카드는 frontmatter optional 필드로 미리 자리만), A003(AppLegalDoc 표준 메타: `version`, `effective_date`)
  - PR 1개 / 브랜치: `feature/issue-N-domain-schemas`

---

## Phase 2: Content Pipeline — velite + MDX + shiki + Repository 어댑터

> **목표**: velite로 `content/{projects,posts,legal/apps}/**/*.mdx`를 빌드하여 `.velite/` JSON으로 출력하고, Infrastructure layer의 Repository 어댑터로 Domain Entity에 매핑한다. Application layer의 콘텐츠 유스케이스(list/detail/featured/recent/related)를 TDD로 구현한다.
>
> **진입 조건**: Phase 1 완료 (Domain schema 확정)
> **완료 조건 (DoD)**: `bunx velite build` 성공 → `.velite/{projects,posts,legal}.json` 생성 → Infrastructure Repository가 Domain Entity 배열 반환 → Application service `__tests__/` 모두 Green. seed 콘텐츠 (프로젝트 1개, 포스트 1개, legal/apps/moai 1쌍) 작성.

- [x] ✅ **Task 007: velite 설치 + 컬렉션 정의 + seed 콘텐츠 + shiki 코드블록**
  - **Must** Read: [tasks/T007-velite-content-pipeline.md](tasks/T007-velite-content-pipeline.md)
  - blockedBy: Task 006
  - blocks: Task 008
  - Layer: Infrastructure (build-time ETL) + content/
  - 관련 Feature: F004, F005, F006, F007, F014 (콘텐츠 정본)
  - 관련 AC: 없음 (빌드 산출물 검증은 정상 build로 충분)
  - 검증: `bunx velite build` 성공, `.velite/projects.json` `.velite/posts.json` `.velite/legal.json` 생성, frontmatter Zod 위반 콘텐츠 추가 시 build 실패 ("Expected array, received string" 검증 완료)
  - 산출물:
    - `velite.config.ts` — D1: Domain Zod 4 ↔ velite Zod 3 internal 충돌 회피를 위해 `s` 헬퍼로 schema shape 미러링 (스키마 중복 OK, T008 mapper에서 drift 재검증)
    - rehype 플러그인: `rehype-slug` (헤딩 anchor — A002 해소 1단계), `@shikijs/rehype` (theme: github-dark, MVP 단일)
    - `content/projects/example-project.mdx` (seed)
    - `content/posts/2026-04-shipping-solo.mdx` (seed)
    - `content/legal/apps/moai/{terms.mdx, privacy.mdx}` (seed, placeholder 본문 + frontmatter)
    - `app/presentation/components/content/MdxRenderer.tsx` (D2: 자체 `evaluateMdxBody` 12 LOC, mdx-bundler 회피)
    - `package.json` lifecycle scripts (`predev`/`prebuild`/`prestart`/`pretest`) — stale `.velite/` 회귀 차단
    - `tsconfig.cloudflare.json` `#content` / `#content/*` path alias
    - `wrangler.toml` 운영 노트 — `new Function` SSR / 향후 CSP unsafe-eval 영향 cross-link
  - 가정 해소: A006(velite/shiki 설치), A002 1단계(rehype-slug), A007(검색 인덱스는 별도 라이브러리 미사용 — Task 016에서 확정)
  - 후속 follow-up (deferred from review): Medium #3 `project.schema.ts` date 약한 검증 (T006 owner), Medium #4 legal seed placeholder 본문, Low #5 tsconfig include velite.config.ts (별도 `tsconfig.node.json` 필요), Low #7 shiki rehype `as any` 좁히기
  - PR 1개 / 브랜치: `feature/issue-27-velite-content-pipeline` / Issue #27

- [x] **Task 008: Application Ports + Content Repositories (Infrastructure 구현)**
  - **Must** Read: [tasks/T008-content-ports-repos.md](tasks/T008-content-ports-repos.md)
  - blockedBy: Task 002, Task 006, Task 007
  - blocks: Task 009, Task 010, Task 011, Task 012, Task 013, Task 014, Task 015, Task 016, Task 017
  - Layer: Application (ports/services) + Infrastructure (velite repos)
  - 관련 Feature: F004, F005, F006, F007, F014, F017
  - 관련 AC: 없음 (read-side 정확성 → unit test로 충분)
  - 검증: Application `__tests__/` 안 mock-repository 기반 service 테스트 + Infrastructure `__tests__/` 안 `.velite` fixture 기반 repository 테스트 모두 Green
  - 산출물:
    - **Ports** (`app/application/content/ports/`):
      - `project-repository.port.ts` — `findAll, findBySlug, findFeatured, findRelated(slug) → {prev,next}, findByTag(tag)`
      - `post-repository.port.ts` — `findAll, findBySlug, findRecent(n), findByTag(tag), findRelated(slug)`
      - `legal-repository.port.ts` — `findAppDoc(app_slug, doc_type), listApps()`
    - **Services** (`app/application/content/services/`):
      - `list-projects.service.ts` (+ tag filter)
      - `get-project-detail.service.ts` (prev/next 포함)
      - `get-featured-project.service.ts` (F017)
      - `list-posts.service.ts`
      - `get-post-detail.service.ts`
      - `get-recent-posts.service.ts` (F017)
    - **Infrastructure 어댑터** (`app/infrastructure/content/`):
      - `velite-project.repository.ts`, `velite-post.repository.ts`, `velite-legal.repository.ts`
      - `mappers/{project,post,legal}.mapper.ts` (velite raw → Domain Entity)
    - 각 모듈에 `__tests__/` colocated
  - 진행 메모: 4-cycle TDD (Project → Post → Legal → Refactor). velite 0.3.1 typegen이 Zod 3 internal 타입을 노출시켜 TS4082 폭발 → `scripts/patch-velite-types.mjs`로 `.velite/index.d.ts` clean override (velite:build에 chained). vitest `resolve.tsconfigPaths` 활성화로 `~` alias 동작. 공통 헬퍼 3개(`assertExists`, `sortByDateDesc`, `findAdjacent`) 추출. code-reviewer Medium fix: cache `Object.freeze` + defensive copy(`[...cache]`).
  - PR 1개 / 브랜치: `feature/issue-29-content-ports-repos` / Issue #29

- [x] **Task 009: DI Container (Composition Root) + workers/app.ts wiring + AppLoadContext**
  - **Must** Read: [tasks/T009-di-container.md](tasks/T009-di-container.md)
  - blockedBy: Task 008
  - blocks: Task 010, Task 011, Task 012, Task 013, Task 014, Task 015, Task 016, Task 017
  - Layer: Infrastructure (config) + Platform Adapter (workers/)
  - 관련 Feature: 전반 (모든 유스케이스 주입 통로)
  - 관련 AC: 없음 (유스케이스 주입 정확성 → Phase 3 라우트 테스트로 간접 검증)
  - 검증: `app/infrastructure/config/__tests__/container.test.ts` — 6개 service 위임 + ProjectNotFoundError 전파 확인. `bun run test` 94 passed / typecheck / lint Green.
  - 산출물:
    - `app/infrastructure/config/container.ts` — `type Container = {...}` + `buildContainer(env): Container` (수제 Plain object)
    - `workers/app.ts` — `requestHandler(request, { cloudflare, container: buildContainer(env) })`
    - `app/env.d.ts` — `interface AppLoadContext { cloudflare; container }` (SSOT)
  - 가정 해소: D2 확인 (수제 DI 채택)
  - 진행 메모: task spec의 `getLoadContext`는 Vite 플러그인 패턴이고 본 프로젝트는 Workers `fetch` 핸들러 패턴이라 두 번째 인자 객체에 직접 주입. AppLoadContext SSOT를 `app/env.d.ts`로 이전 (workers/app.ts inline declare 제거). Velite repo는 task spec 약식 표기(`new ...Repository()`)와 달리 singleton const라 직접 import. `_env` prefix는 T017(Resend/Turnstile/KV) 도입 시 활성화 예정.
  - PR 1개 / 브랜치: `feature/issue-31-di-container` / Issue #31

---

## Phase 3: Core Pages UI — Home / About / Projects / Blog / Legal (실 데이터 연결)

> **목표**: Phase 1의 빈 라우트에 Phase 2의 콘텐츠 유스케이스를 연결하여 실제 페이지를 완성한다. F003 PDF 인쇄 스타일, F017 Featured/Recent까지 포함.
>
> **진입 조건**: Phase 2 완료 (Repository + DI 가동)
> **완료 조건 (DoD)**: `wrangler dev`로 7개 콘텐츠 페이지(Home/About/Projects/Project Detail/Blog/Blog Detail/Legal Index)가 seed 데이터로 정상 렌더. Project Detail/Blog Detail 데스크탑 880px+ sticky sidebar 동작. About `[⎙ PDF]` 버튼 → `window.print()` AC-F003-1/2/3 통과.

- [x] **Task 010: Home Page (F001 Hero + F017 Featured/Recent)** ✅
  - **Must** Read: [tasks/T010-home-page.md](tasks/T010-home-page.md)
  - blockedBy: Task 005, Task 008, Task 009
  - blocks: Task 016
  - Layer: Presentation (route + components)
  - 관련 Feature: **F001**, **F017**
  - 관련 AC: 없음 (Page-by-Page Key Features로 검증)
  - 검증:
    - **자동 (RTL + Vitest)**: Home loader가 `getFeaturedProject` + `getRecentPosts(3)` 유스케이스를 호출 (mock container) / `<HeroWhoami />` 렌더 + 3-버튼 클러스터 ARIA role 검증 / `<RecentPostsList />` 컴포넌트가 정확히 3개의 `<PostRow>`를 렌더 (RTL `getAllByRole('article').toHaveLength(3)`) / Featured 미존재 시 fallback (해당 섹션 미렌더) 처리 검증 / DOM 구조 snapshot (또는 명시적 selector 기반 assertion)으로 Hero / Featured / Recent 3 섹션 순서 보장
    - **수동**: `wrangler dev`에서 [검색해서 이동] 버튼 클릭 시 Command Palette 트리거 (Task 016 마운트 후 통합 동작), [/about] [/projects] 빠른 링크 동작
  - 산출물:
    - `app/presentation/routes/_index.tsx` — loader: `getFeaturedProject` + `getRecentPosts(3)`
    - `app/presentation/components/home/{HeroWhoami.tsx, FeaturedProjectCard.tsx, RecentPostsList.tsx}`
  - PR 1개 / 브랜치: `feature/issue-N-home-page`

- [x] **Task 011: About Page + F003 PDF 인쇄 스타일**
  - **Must** Read: [tasks/T011-about-page-print.md](tasks/T011-about-page-print.md)
  - blockedBy: Task 005, Task 008, Task 009
  - Layer: Presentation
  - 관련 Feature: **F002**, **F003**
  - 관련 AC: **AC-F003-1**, **AC-F003-2**, **AC-F003-3**
  - 검증:
    - Vitest + jsdom: `[⎙ PDF]` 버튼 클릭 시 `window.print` mock 호출 (1회)
    - 시각 검증 (수동): Chrome 인쇄 미리보기에서 Topbar/Footer/검색트리거/토글 숨김, 색상 유지, h2가 페이지 하단 고립 안됨
    - Snapshot 테스트: `@media print` CSS 적용된 HTML 스냅샷 비교
  - 산출물:
    - `app/presentation/routes/about.tsx`
    - `app/presentation/components/about/{AboutHeader.tsx, StackCards.tsx, CareerTimeline.tsx, EducationCard.tsx, AwardsCard.tsx}`
    - `app/presentation/lib/print.ts` — `triggerPrint()` 래퍼 (테스트 가능)
    - `app/app.css`에 `@media print { ... }` 블록 (Topbar/Footer/검색트리거/토글 `display: none`, `@page { size: A4; margin: 0 }`, `print-color-adjust: exact`, `break-after: avoid` for h2)
  - 가정 해소: A001 (자격증 데이터는 frontmatter optional 필드로 자리만, Phase 3 외에서 콘텐츠 추가 가능)
  - PR 1개 / 브랜치: `feature/issue-N-about-page-print`

- [ ] **Task 012: Projects Page (F004 ls-style 행 리스트 + 태그 필터)**
  - **Must** Read: [tasks/T012-projects-list.md](tasks/T012-projects-list.md)
  - blockedBy: Task 005, Task 008, Task 009
  - Layer: Presentation
  - 관련 Feature: **F004**
  - 관련 AC: 없음 (UI 표시 위주)
  - 검증:
    - **자동 (RTL + Vitest)**: Projects loader가 `listProjects(tag?)` 유스케이스를 URLSearchParam(`?tag=xxx`)에서 추출한 인자로 호출 (mock container) / `<ProjectRow />` 행 구조 렌더 — `slug/ + title + date(YYYY-MM)` / `summary` / `stack pills` 각 노드가 RTL queries(`getByText`)로 검색 가능 / `<TagFilterChips />` 칩 클릭 시 `useSearchParams`가 `?tag=<tag>`로 변경됨 (RTL `userEvent.click` + `memoryRouter`) / 행 클릭 시 `/projects/:slug`로 네비게이션 (RTL `userEvent.click` + history mock) / DOM 구조 snapshot 또는 명시적 selector assertion으로 ls-style 행 레이아웃 보장 (카드 그리드가 아님을 `display: grid-template-columns`가 아닌 flat row 구조로 확인)
    - **수동**: 태그 필터 적용 결과가 시각적으로 정렬되는지 확인
  - 산출물:
    - `app/presentation/routes/projects._index.tsx` — loader: `listProjects()`
    - `app/presentation/components/project/{ProjectRow.tsx, TagFilterChips.tsx}`
    - `app/presentation/lib/format.ts` — `formatYearMonth(date)` (Domain VO 또는 lib?  — 읽기 전용 포맷이므로 Presentation lib 채택)
  - PR 1개 / 브랜치: `feature/issue-N-projects-list`

- [ ] **Task 013: Project Detail Page (F005 + sticky sidebar + on-this-page TOC)**
  - **Must** Read: [tasks/T013-project-detail.md](tasks/T013-project-detail.md)
  - blockedBy: Task 005, Task 007 (rehype-slug), Task 008, Task 009
  - blocks: Task 018 (OG)
  - Layer: Presentation + Application(`getProjectDetail`)
  - 관련 Feature: **F005**
  - 관련 AC: 없음 (UI 표시 위주, OG는 Phase 5 F011)
  - 검증: 본문 problem/approach/results 섹션 렌더, 데스크탑 880px+에서 sticky sidebar(meta + TOC) 표시, 모바일에서는 sidebar inline, `← prev` / `의뢰하기 →` / `next →` 3분할 푸터, prev/next는 collection 인접 항목
  - 산출물:
    - `app/presentation/routes/projects.$slug.tsx` — loader: `getProjectDetail(slug)` (404 시 throw → splat 처리)
    - `app/presentation/components/project/{ProjectMetaSidebar.tsx, OnThisPageToc.tsx, ProjectFooterNav.tsx}`
    - velite afterBuild 또는 빌드 후 처리: 본문 h2 헤딩 추출 → frontmatter `toc` 필드로 주입 (A002 해소 2단계 — velite 후처리 채택)
  - 가정 해소: A002 완료
  - PR 1개 / 브랜치: `feature/issue-N-project-detail`

- [ ] **Task 014a: Blog Page (F006) — 목록 + 태그 필터 + RSS Resource Route (F012)**
  - **Must** Read: [tasks/T014a-blog-list-rss.md](tasks/T014a-blog-list-rss.md)
  - blockedBy: Task 005, Task 007, Task 008, Task 009
  - blocks: Task 014b, Task 018 (OG)
  - Layer: Presentation + Application(`build-rss-feed.service.ts`) + Resource Route
  - 관련 Feature: **F006**, **F012**
  - 관련 AC: 없음 (UI 표시 + RSS XML well-formed 검증)
  - 검증:
    - **자동 (RTL + Vitest)**: Blog loader가 `listPosts(tag?)`를 호출 / 발행일 역순으로 `<PostRow>` 정렬 (RTL `getAllByRole` 순서 비교) / 태그 칩 클릭 시 `?tag=<tag>` URLSearchParam 변경 / RSS service unit test가 RSS 2.0 well-formed XML 생성 (`<title>`, `<link>`, `<description>`, `<item>` 포함, `xml-validator` 또는 정규식 검증) / `/rss.xml` 통합: `Content-Type: application/xml`, item 수 = collection 수
    - **수동**: 태그 필터 + 정렬 시각 확인
  - 산출물:
    - `app/presentation/routes/{blog._index.tsx, rss[.xml].tsx}`
    - `app/presentation/components/post/PostRow.tsx`
    - `app/application/feed/services/build-rss-feed.service.ts` + `__tests__/`
  - PR 1개 / 브랜치: `feature/issue-N-blog-list-rss`

- [ ] **Task 014b: Blog Detail Page (F007) — 본문 + sticky sidebar + share**
  - **Must** Read: [tasks/T014b-blog-detail.md](tasks/T014b-blog-detail.md)
  - blockedBy: Task 014a
  - blocks: Task 018 (OG)
  - Layer: Presentation
  - 관련 Feature: **F007**
  - 관련 AC: 없음 (UI 표시 위주)
  - 검증:
    - **자동 (RTL + Vitest)**: Blog Detail loader가 `getPostDetail(slug)` 호출 + 미존재 slug 시 throw → splat 처리 / MDX 본문 + shiki 코드블록 렌더 / `<ShareTools />` copy link 버튼 클릭 시 `navigator.clipboard.writeText` mock 호출 (RTL `userEvent`) / X 공유 링크 `https://x.com/intent/post?...` 형식 검증 / 데스크탑 880px+에서 sticky sidebar(`<OnThisPageToc>`) 노출 / 하단 3분할 (`← prev` / `[모든 글]` / `next →`) 렌더 + prev/next는 collection 인접 항목
    - **수동**: 모바일에서 sidebar inline 표시 확인
  - 산출물:
    - `app/presentation/routes/blog.$slug.tsx`
    - `app/presentation/components/post/ShareTools.tsx`
  - PR 1개 / 브랜치: `feature/issue-N-blog-detail`

- [ ] **Task 015: Legal Index + App Terms + App Privacy (F014, chrome-free)**
  - **Must** Read: [tasks/T015-legal-pages.md](tasks/T015-legal-pages.md)
  - blockedBy: Task 005, Task 007, Task 008, Task 009
  - Layer: Presentation
  - 관련 Feature: **F014**
  - 관련 AC: 없음 (Page-by-Page Key Features + F018 차등 인덱싱은 Phase 5)
  - 검증:
    - **자동 (RTL + Vitest)**: Legal Index loader가 `listApps()` 호출 / 등록된 앱 카드(`<AppCard />`) 갯수 = `listApps()` 결과 길이 / `appCount === 0`이면 `<Footer />`의 Legal 링크가 미렌더 (RTL `queryByRole('link', { name: /legal/i })`로 null 검증) / `appCount > 0`이면 Legal 링크 노출 / `<ChromeFreeLayout />` 마운트 시 `<Topbar />` / `<Footer />`가 미렌더 + 컨테이너 `max-width: 680px` 스타일 적용 (RTL + computed style 또는 className assertion) / App Terms/Privacy 라우트가 `<ChromeFreeLayout />`을 사용하는지 layout id assertion / DOM 구조 snapshot으로 chrome-free 본문 영역 보장
    - **수동**: `wrangler dev`에서 `/legal/moai/terms` / `/legal/moai/privacy`를 직접 접속하여 chrome-free 시각 확인
  - 산출물:
    - `app/presentation/routes/{legal._index.tsx, legal.$app.terms.tsx, legal.$app.privacy.tsx}`
    - `app/presentation/components/legal/{AppCard.tsx, LegalDocLayout.tsx}`
    - `app/presentation/components/chrome/Footer.tsx` — `appCount > 0`일 때 Legal 링크 조건부
  - PR 1개 / 브랜치: `feature/issue-N-legal-pages`

---

## Phase 4: Forms / Email — Contact Form + Turnstile + Resend (F008 + F009)

> **목표**: Contact 페이지의 폼 검증, Turnstile 클라이언트 위젯 + 서버 검증, Resend 발신 + React Email 자동응답까지 완성한다. F008/F009의 모든 AC를 TDD로 구현.
>
> **진입 조건**: Phase 3 완료 (DI 가동, 라우트 동작 확인)
> **완료 조건 (DoD)**: AC-F008-1/2/3/4, AC-F009-1/2/3 모두 자동 테스트 통과. 실제 hello@tkstar.dev → 본인 메일 + 제출자 자동응답이 staging에서 발송 확인.

- [ ] **Task 016: F016 Cmd+K Command Palette (글로벌 검색 네비)**
  - **Must** Read: [tasks/T016-command-palette.md](tasks/T016-command-palette.md)
  - blockedBy: Task 003, Task 008, Task 009, Task 010 (Home에서 트리거)
  - Layer: Application(`build-search-index.service.ts`) + Presentation(palette UI/hook)
  - 관련 Feature: **F016**
  - 관련 AC: **AC-F016-1**, **AC-F016-2**, **AC-F016-3**, **AC-F016-4**, **AC-F016-5**
  - 검증:
    - `useCommandPalette.test.ts`: 단축키 토글 → AC-F016-1/2 (cross-platform 분기 명시)
      - **macOS (⌘K)**: RTL `userEvent.keyboard('{Meta>}k{/Meta}')` → palette open. `event.metaKey === true` 분기를 hook 내부에서 검증
      - **Windows·Linux (Ctrl+K)**: RTL `userEvent.keyboard('{Control>}k{/Control}')` → palette open. `event.ctrlKey === true` 분기
      - **공통 (`/`)**: RTL `userEvent.keyboard('/')` → palette open (입력 포커스 외)
      - **포커스 가드**: `<input>` / `<textarea>` / `[contenteditable]`에 포커스가 있으면 위 3개 모두 palette를 열지 않고 기본 입력 동작 유지 (AC-F016-2)
    - 토큰 기반 다중 키워드 필터 ("rou nav" → "rou"+"nav" 모두 포함만) → AC-F016-3
    - 키보드 네비 (↑↓/↵/Esc) + 마우스 호버 인덱스 동기화 → AC-F016-4
    - `public/search-index.json` size ≤ gzip 100KB + body 미포함 + lazy fetch 1회 → AC-F016-5
  - 산출물:
    - `app/application/search/services/build-search-index.service.ts` — velite afterBuild 훅 또는 별도 스크립트가 `.velite/{projects,posts}.json`에서 `{slug, title, summary, tags}`만 추출 + 정적 라우트 머지 → `public/search-index.json`
    - `app/presentation/hooks/useCommandPalette.ts` — 단축키 + 토큰 검색 + 키보드 네비
    - `app/presentation/components/palette/CommandPalette.tsx` — 모달 + 그룹 헤더(pages/projects/posts) + lazy fetch
    - `app/root.tsx` — `<CommandPalette />` 마운트
  - 가정 해소: A007 (단순 includes/score 검색 채택, 데이터 규모 100+ 도달 시 재검토)
  - PR 1개 / 브랜치: `feature/issue-N-command-palette`

- [ ] **Task 017: Contact Form + Turnstile + Resend + 자동응답 메일 (F008 + F009)**
  - **Must** Read: [tasks/T017-contact-form-email.md](tasks/T017-contact-form-email.md)
  - blockedBy: Task 002, Task 006 (ContactSubmission schema), Task 008/009 (DI), Task 017-pre (PROJECT-STRUCTURE 갱신 — docs PR)
  - Layer: Application(submit-contact-form.service) + Infrastructure(Resend, Turnstile, React Email, Workers KV rate-limit) + Presentation(Form, Turnstile widget)
  - 관련 Feature: **F008**, **F009**
  - 관련 AC: **AC-F008-1**, **AC-F008-2**, **AC-F008-3**, **AC-F008-4**, **AC-F009-1**, **AC-F009-2**, **AC-F009-3**
  - 사전 단계 (PR 본 작업 전 1회):
    - `bunx wrangler kv namespace create RATE_LIMIT_KV` 실행 (production용) → 반환 `id` 기록
    - `bunx wrangler kv namespace create RATE_LIMIT_KV --preview` (preview/dev용) → 반환 `preview_id` 기록
    - `wrangler.toml`에 `[[kv_namespaces]] binding = "RATE_LIMIT_KV"`, `id = "..."`, `preview_id = "..."` 블록 등록
    - `app/env.d.ts`의 `interface AppLoadContext`(또는 `Env`)에 `RATE_LIMIT_KV: KVNamespace` 추가
  - 검증:
    - `submit-contact-form.service.test.ts` — mock email-sender + captcha-verifier + rate-limiter로 모든 AC 분기
    - `contact-submission.schema.test.ts` — RFC 5322 위반 / 메시지 10자 미만 / 5000자 초과 reject (AC-F008-2/3)
    - `turnstile-verifier.test.ts` — `https://challenges.cloudflare.com/turnstile/v0/siteverify` mock, success: false → 400 (AC-F009-2)
    - `resend-email-sender.test.ts` — Resend 5xx → throw → action에서 fallback 응답 (AC-F008-4)
    - `kv-rate-limiter.test.ts` (`AC-F009-3`): KV mock(`miniflare`/`@cloudflare/workers-types` 호환), 동일 IP 1시간 5회 OK + 6번째 429
    - Action 통합 테스트: 폼 제출 → mailto fallback 응답 (AC-F008-4: prefill body 포함)
  - 산출물:
    - **Application**:
      - `app/application/contact/ports/{email-sender.port.ts, captcha-verifier.port.ts, rate-limiter.port.ts}`
      - `app/application/contact/services/submit-contact-form.service.ts`
    - **Infrastructure**:
      - `app/infrastructure/email/resend-email-sender.ts` (env.RESEND_API_KEY)
      - `app/infrastructure/email/templates/AutoReplyEmail.tsx` (React Email)
      - `app/infrastructure/captcha/turnstile-verifier.ts` (env.TURNSTILE_SECRET)
      - `app/infrastructure/ratelimit/kv-rate-limiter.ts` (Workers KV 기반, `env.RATE_LIMIT_KV` 주입) — **PROJECT-STRUCTURE.md 미등록 모듈** (Task 017-pre로 사전 등록)
    - **Presentation**:
      - `app/presentation/routes/contact.tsx` (loader + action)
      - `app/presentation/components/contact/{ContactForm.tsx, TurnstileWidget.tsx, SuccessScreen.tsx, MailtoFallback.tsx}`
      - `app/presentation/hooks/useTurnstile.ts`
    - **wrangler.toml**: secrets `RESEND_API_KEY` / `TURNSTILE_SECRET`, vars `CONTACT_TO_EMAIL`, KV namespace `RATE_LIMIT_KV` (`id` + `preview_id`)
  - 가정 해소: A009 완료 (React Email/Resend/Turnstile 도입 + env 추가)
  - PR 1개 / 브랜치: `feature/issue-N-contact-form-email`

- [ ] **Task 017-pre: PROJECT-STRUCTURE.md 갱신 — `app/infrastructure/ratelimit/` 모듈 등록 (docs)**
  - **Must** Read: [tasks/T017-pre-update-project-structure-ratelimit.md](tasks/T017-pre-update-project-structure-ratelimit.md)
  - blockedBy: none (Task 017보다 선행)
  - blocks: Task 017
  - Layer: docs (구조 정합성)
  - 관련 Feature: F009 (rate-limit 보강)
  - 관련 AC: 없음
  - 검증: `docs/PROJECT-STRUCTURE.md`의 `app/infrastructure/` 트리에 `ratelimit/` 항목 추가 + Cross-cutting Concerns Mapping 표에 rate-limit 행 추가
  - 산출물:
    - `docs/PROJECT-STRUCTURE.md` — `app/infrastructure/` 트리(line 213~238 부근)에 `├── ratelimit/` + `│   ├── kv-rate-limiter.ts` + `│   └── __tests__/` 항목, Cross-cutting Concerns Mapping(line 549~560 부근) 표에 `Contact rate-limit (F009 보강) | Application Port + Infrastructure 구현 | application/contact/ports/rate-limiter.port.ts + infrastructure/ratelimit/kv-rate-limiter.ts` 행
  - PR 1개 / 브랜치: `docs/update-project-structure-ratelimit`

---

## Phase 5: SEO / OG / Indexing — Satori OG + Sitemap + Robots + JSON-LD + 검색엔진 등록

> **목표**: F011 동적 OG 이미지(Project/Blog), F018 SEO 메타 + sitemap/robots + JSON-LD, F019 Google/Naver 검색엔진 등록을 완성한다. 차등 인덱싱 정책(App Terms/Privacy `noindex,follow`, 404 `noindex,nofollow`)을 적용.
>
> **진입 조건**: Phase 4 완료 (모든 페이지가 콘텐츠로 가동)
> **완료 조건 (DoD)**: AC-F011-1/2/3 통과. `/sitemap.xml`, `/robots.txt`가 well-formed. 페이지별 meta export(title/description/canonical/OG/Twitter) + JSON-LD 정합. Google Search Console / Naver Search Advisor 도메인 인증 완료 (배포 단계).

- [ ] **Task 018: F011 Satori 동적 OG 이미지 (Project + Blog) — Workers Asset Binding**
  - **Must** Read: [tasks/T018-satori-og.md](tasks/T018-satori-og.md)
  - blockedBy: Task 013, Task 014a, Task 014b
  - Layer: Application(`render-*-og.service`, port) + Infrastructure(Satori standalone + Asset Binding) + Resource Route
  - 관련 Feature: **F011**
  - 관련 AC: **AC-F011-1**, **AC-F011-2**, **AC-F011-3**
  - 검증:
    - `render-project-og.service.test.ts` / `render-post-og.service.test.ts` — frontmatter → PNG bytes (mock renderer)
    - `satori-og-renderer.test.ts` — env.ASSETS mock으로 ttf/yoga.wasm 로드, fallback PNG 경로
    - 통합: `/og/projects/:slug.png` 응답 1200×630 PNG + `Cache-Control: public, max-age=31536000, immutable` (AC-F011-1)
    - 미존재 slug → fallback PNG (AC-F011-2)
    - 폰트 누락 시 정적 fallback + Workers logs 에러 (AC-F011-3)
  - 산출물:
    - `app/application/og/ports/og-image-renderer.port.ts`
    - `app/application/og/services/{render-project-og.service.ts, render-post-og.service.ts}`
    - `app/infrastructure/og/satori-og-renderer.ts` — `satori/standalone` + `env.ASSETS.fetch("https://x.local/fonts/JetBrainsMono-Regular.ttf")` + `env.ASSETS.fetch("https://x.local/wasm/yoga.wasm")`
    - `public/fonts/JetBrainsMono-Regular.ttf`, `public/wasm/yoga.wasm`
    - `app/presentation/routes/{og.projects.$slug[.png].tsx, og.blog.$slug[.png].tsx}` — loader만 export
    - 정적 fallback PNG asset
  - 가정 해소: A005 (env.ASSETS Fetcher 채택)
  - PR 1개 / 브랜치: `feature/issue-N-satori-og`

- [ ] **Task 019: F018 SEO Meta + Sitemap + Robots + JSON-LD (차등 인덱싱)**
  - **Must** Read: [tasks/T019-seo-sitemap-jsonld.md](tasks/T019-seo-sitemap-jsonld.md)
  - blockedBy: Task 008, Task 010~Task 013, Task 014a, Task 014b, Task 015 (페이지별 meta 추가), Task 018 (OG URL)
  - Layer: Application(`build-sitemap.service`) + Resource Route + Presentation(meta export)
  - 관련 Feature: **F018**
  - 관련 AC: 없음 (정합성 검증 — sitemap 포함 페이지 / robots 정책 / JSON-LD schema.org 표준)
  - 검증:
    - `build-sitemap.service.test.ts` — index 가능 페이지(Home/About/Projects/Project Detail/Blog/Blog Detail/Contact/Legal Index)만 포함, App Terms/Privacy + 404 + OG resource route 제외
    - `/robots.txt` 응답: `User-agent: *`, `Allow: /`, `Sitemap: https://tkstar.dev/sitemap.xml`
    - 페이지별 meta export 통합 테스트: title/description/canonical/og:*/twitter:*
    - JSON-LD 통합 테스트:
      - Home/About → `Person`
      - Blog Detail → `BlogPosting`
      - Project Detail → `CreativeWork` (또는 `SoftwareSourceCode`)
      - 모든 페이지 → `BreadcrumbList`
    - 차등 인덱싱: App Terms/Privacy meta `noindex, follow` + canonical 유지, 404(splat) meta `noindex, nofollow`
  - 산출물:
    - `app/application/seo/services/build-sitemap.service.ts` + `__tests__/`
    - `app/presentation/routes/{sitemap[.xml].tsx, robots[.txt].tsx}` — loader만 export
    - 페이지별 `meta` export 추가 (`_index.tsx`, `about.tsx`, `projects._index.tsx`, `projects.$slug.tsx`, `blog._index.tsx`, `blog.$slug.tsx`, `contact.tsx`, `legal._index.tsx`, `legal.$app.terms.tsx`, `legal.$app.privacy.tsx`, `$.tsx`)
    - `app/presentation/lib/jsonld.ts` — schema.org 빌더 헬퍼 (Person/BlogPosting/CreativeWork/BreadcrumbList)
  - PR 1개 / 브랜치: `feature/issue-N-seo-sitemap-jsonld`

- [ ] **Task 020: F019 검색엔진 등록 (Google + Naver) + Cloudflare Web Analytics (F013)**
  - **Must** Read: [tasks/T020-search-engine-verification.md](tasks/T020-search-engine-verification.md)
  - blockedBy: Task 019
  - Layer: Presentation(root layout) + Infrastructure(analytics 스니펫)
  - 관련 Feature: **F019**, **F013**
  - 관련 AC: 없음 (배포 후 `site:tkstar.dev` 인덱싱 확인)
  - 검증: `wrangler dev`에서 `GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION` env 설정 시 root `<head>`에 `<meta name="google-site-verification" ...>` / `<meta name="naver-site-verification" ...>` 조건부 렌더. Cloudflare Web Analytics 스니펫 삽입 (쿠키 없음).
  - 산출물:
    - `app/root.tsx` — env 기반 조건부 verification meta + Cloudflare Web Analytics `<script>` 스니펫
    - `app/infrastructure/analytics/cloudflare-web-analytics.ts` — 스니펫 헬퍼
    - `wrangler.toml` — `GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`, `CLOUDFLARE_ANALYTICS_TOKEN` (vars)
  - 가정 해소: A008 (wrangler vars로 토큰 주입), A011은 잔존 (Bing은 MVP 후)
  - PR 1개 / 브랜치: `feature/issue-N-search-engine-verification`

---

## Phase 6: Polish & Deploy — QA + 배포 + 도메인 연결

> **목표**: 전체 플로우 QA, Lighthouse / Axe 접근성 점검, Cloudflare Workers 첫 배포 + `tkstar.dev` 도메인 연결 + Email Routing 설정 + Search Console 인증 완료.
>
> **진입 조건**: Phase 5 완료 (모든 F001~F019 자동 테스트 Green)
> **완료 조건 (DoD)**: 프로덕션 도메인 `https://tkstar.dev` 접속 시 모든 페이지 정상, OG 미리보기가 SNS에서 정상 노출, Contact Form이 실제 메일 발송, Search Console에서 sitemap 제출 및 indexing 확인.

- [ ] **Task 021: 통합 QA + Lighthouse + Axe 접근성 점검 + 모든 PRD AC 통과 매트릭스**
  - **Must** Read: [tasks/T021-qa-pass-mvp.md](tasks/T021-qa-pass-mvp.md)
  - blockedBy: Task 020
  - Layer: 전 layer (회귀 테스트)
  - 관련 Feature: F001~F019 전체
  - 관련 AC: AC-F003-1/2/3, AC-F008-1/2/3/4, AC-F009-1/2/3, AC-F011-1/2/3, AC-F016-1/2/3/4/5
  - 검증:
    - `bun run test:coverage` 전체 100% Green + threshold 통과
    - Lighthouse: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 100
    - Axe: 위반 0건
    - 키보드 only 네비게이션 (Cmd+K → palette → 결과 진입 → Esc) 수동 검증
    - 다크/라이트 모드 시각 회귀 (스냅샷 또는 수동)
  - 산출물:
    - `docs/reports/qa-{date}.md` (수동 결과 기록 — 정본은 ROADMAP 체크박스)
    - 발견된 결함은 `fix/issue-N-*` PR로 분리 처리
  - PR 1개 / 브랜치: `chore/qa-pass-mvp`

- [ ] **Task 022: Cloudflare Workers 배포 + 도메인 연결 + Email Routing + 검색엔진 인증 완료**
  - **Must** Read: [tasks/T022-deploy-production.md](tasks/T022-deploy-production.md)
  - blockedBy: Task 021
  - Layer: 운영
  - 관련 Feature: F019 (인증 완료), 운영 (도메인/이메일)
  - 관련 AC: 없음 (운영 검증)
  - 검증:
    - `bunx wrangler deploy` 성공 → workers.dev 우선 동작
    - `tkstar.dev` 도메인 등록 + Cloudflare DNS 연결 + Workers Custom Domain 매핑
    - Cloudflare Email Routing: `hello@tkstar.dev` → 개인 Gmail forward 동작 확인 (실제 메일 송수신)
    - Resend domain verification 완료 (DKIM/SPF DNS record 설정)
    - `wrangler secret put RESEND_API_KEY` / `TURNSTILE_SECRET` / vars `GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION` 주입
    - Google Search Console 도메인 소유권 인증 + `https://tkstar.dev/sitemap.xml` 제출
    - Naver Search Advisor `naver-site-verification` meta 검증 + sitemap 제출
    - 배포 후 `site:tkstar.dev` 검색으로 indexing 확인 (수일 ~ 수주 소요)
  - 가정 해소: A010 (도메인 등록 채널 결정 시 기록), A008 완료 (실제 토큰 주입)
  - 잔존 가정: A011(Bing 등록 보류), A012(Motion 라이브러리 보류)
  - PR 1개 / 브랜치: `chore/deploy-production`

---

## PRD Feature → Task Coverage Matrix

> 모든 PRD Feature가 최소 1개 task에 매핑됨을 검증한다.

| Feature ID | Feature 이름 | 1차 구현 Task | 보조/연계 Task |
|------------|--------------|---------------|-----------------|
| F001 | Hero (whoami + 검색 + 빠른 링크) | Task 010 | Task 016 (검색 트리거 연결) |
| F002 | About (사이트 자체 이력서) | Task 011 | Task 006 (스키마) |
| F003 | PDF 저장 (CSS print) | Task 011 | — |
| F004 | Projects 목록 (ls-style) | Task 012 | Task 006/008 (스키마/repo) |
| F005 | Project Case Study | Task 013 | Task 006/008 (스키마/repo), Task 007 (rehype-slug) |
| F006 | Blog 목록 | Task 014a | Task 006/008 |
| F007 | Blog 상세 | Task 014b | Task 006/008, Task 007 (shiki) |
| F008 | Contact Form | Task 017 | Task 006 (ContactSubmission schema) |
| F009 | Contact 스팸 방지 (Turnstile) | Task 017 | — |
| F010 | 다크모드 토글 (`[data-theme]`) | Task 005 | Task 004 (chrome layout) |
| F011 | SSR + 동적 OG 이미지 (Satori) | Task 018 | Task 003 (SSR), Task 013/014a/014b (페이지별 OG meta는 Task 019) |
| F012 | RSS 피드 | Task 014a | — |
| F013 | 분석 (Cloudflare Web Analytics) | Task 020 | — |
| F014 | 앱 약관 라우팅 (스켈레톤) | Task 015 | Task 004 (chrome-free layout), Task 006 (AppLegalDoc), Task 007 (seed) |
| F016 | Cmd+K Command Palette | Task 016 | Task 004 (라우트 인덱스), Task 008 (slug 인덱스) |
| F017 | Home Featured + Recent Posts | Task 010 | Task 008 (`getFeatured`/`getRecent`) |
| F018 | SEO 메타데이터 & Sitemap | Task 019 | Task 010~Task 015 (페이지별 meta export), Task 018 (OG URL) |
| F019 | 검색엔진 등록 (Google + Naver) | Task 020 | Task 022 (배포 후 인증 완료) |

> **F015**(청중 분기 기억) 및 청중 분기 split CTA는 PRD에서 Removed — task 미할당.
> 모든 Core/Support Feature가 최소 1개 task에 매핑되며, F018 차등 인덱싱은 Task 019에서 페이지별 meta export로 분산 적용.

---

## Assumption Resolution Gate Matrix

> PRD `Assumptions Register`(A001~A012)의 해소 게이트와 본 ROADMAP의 phase가 일치하는지 검증한다.

| ID | 가정 내용 | PRD 명시 게이트 | ROADMAP 해소 Task | Phase |
|----|-----------|------------------|--------------------|-------|
| A001 | About 자격증 데이터 카드 | F002 구현 PR | Task 011 (frontmatter optional 필드로 자리 확보 + 011 PR에서 데이터 모델 확정) | Phase 3 |
| A002 | on-this-page TOC 자동 추출 (rehype-toc 또는 velite 후처리) | F005 구현 PR | Task 007 (rehype-slug 1단계) + Task 013 (velite 후처리로 TOC 추출 — 채택) | Phase 2 + 3 |
| A003 | 약관/처리방침 표준 메타 (version/effective_date 등) | F014 구현 PR | Task 006 (스키마 확정 — `version`, `effective_date` 채택) | Phase 1 |
| A004 | Not Found Fallback (splat `*` vs ErrorBoundary) | F018/F019 구현 시 | Task 004 (splat 라우트 채택) | Phase 1 |
| A005 | Satori 폰트 binary fetch 경로 | F011 구현 PR | Task 018 (Workers Asset Binding `env.ASSETS` 채택) | Phase 5 |
| A006 | velite/shiki/Satori/Zod 미설치 | velite 도입 PR (Phase 2) | Task 007 (velite + shiki 설치) + Task 018 (Satori 설치) | Phase 2 + 5 |
| A007 | 검색 라이브러리 vs 단순 includes/score | F016 구현 PR | Task 016 (단순 토큰 검색 채택, 100+ 도달 시 재검토) | Phase 4 |
| A008 | 검색엔진 verification 토큰 주입 | F019 구현 PR | Task 020 (wrangler vars 사용) + Task 022 (배포 후 실제 토큰) | Phase 5 + 6 |
| A009 | React Email/Resend/Turnstile 미설치 + env 필요 | F008/F009 구현 PR | Task 017 | Phase 4 |
| A010 | 도메인 등록 채널 (CF Registrar / Porkbun) | 배포 PR 직전 | Task 022 (배포 단계에서 결정 후 기록) | Phase 6 |
| A011 | Bing Webmaster Tools (MVP 후) | MVP 완료 후 | **MVP 범위 외** (Phase 6 이후 운영 task) | Post-MVP |
| A012 | Motion 라이브러리 도입 보류 | MVP 완료 후 | **MVP 범위 외** (사용자 피드백 수집 후) | Post-MVP |

> **운용 규칙**: 각 phase 완료 시점에 본 표를 점검하여 해당 phase가 게이트인 항목이 모두 [FACT]로 전환됐는지 확인하고 PRD 본문을 업데이트한다. A011/A012는 MVP 범위 외이므로 본 ROADMAP의 22 task 완료 후 별도 issue로 트래킹한다.

---

## Dependency Graph (요약)

```
Phase 0: Task 001 → Task 002 → (Task 003 || Task 002)
                     ↓             ↓
Phase 1: Task 006 (Domain)    Task 004 (Routes) + Task 005 (Theme/Tokens)
                ↓                                    ↓
Phase 2: Task 007 (velite) → Task 008 (Ports + Repos) → Task 009 (DI + workers wiring)
                                                              ↓
Phase 3:        Task 010 (Home) || Task 011 (About) || Task 012 (Projects)
                || Task 013 (Project Detail) || Task 014a (Blog List + RSS) → Task 014b (Blog Detail) || Task 015 (Legal)
                                                              ↓
Phase 4: Task 016 (Cmd+K — Task 010 후) + Task 017-pre (docs) → Task 017 (Contact Form)
                                                              ↓
Phase 5: Task 018 (Satori OG) → Task 019 (SEO/Sitemap/JSON-LD) → Task 020 (검색엔진/Analytics)
                                                              ↓
Phase 6: Task 021 (QA) → Task 022 (Deploy)
```

> **병렬 가능 task** (`||` 표시): Phase 3의 Task 010, 011, 012, 013, 014a, 015는 콘텐츠 페이지 단위로 병렬 PR 가능 (T014b는 T014a 이후). Phase 1의 Task 004(Routes)와 Task 005(Theme/Tokens)는 의존성이 분리되어 병렬 가능. Phase 2 이후의 task는 순차. T017-pre(docs)는 T017보다 선행되어야 하나 다른 Phase 4 작업과는 무관.

---

## 진행 현황 요약

- [x] Phase 0: Setup & Toolchain (Task 001~003) ✅ 완료 (2026-04-28)
- [ ] Phase 1: Foundation — Routing Skeleton + Domain Schemas + Theme (Task 004~006)
- [ ] Phase 2: Content Pipeline — velite + MDX + shiki + Repository (Task 007~009)
- [ ] Phase 3: Core Pages UI (Task 010~013, 014a, 014b, 015)
- [ ] Phase 4: Forms / Email — Command Palette + Contact (Task 016, 017-pre, 017)
- [ ] Phase 5: SEO / OG / Indexing (Task 018~020)
- [ ] Phase 6: Polish & Deploy (Task 021~022)

**총 24개 task (T014 분리 + T017-pre 추가) / 6개 phase / 100% PRD Feature(F001~F019, F015 제외) coverage / 100% Assumption(A001~A012) 해소 게이트 매핑.**

> **검증 리포트(2026-04-28) 반영 이력**:
> - Issue #1 (High): T010/T012/T015 자동 테스트(RTL + DOM assertion) 항목 보강
> - Issue #2 (Medium): T008 `blockedBy`에 Task 002 명시 추가
> - Issue #3 (Medium): T017-pre 신규 추가 — `app/infrastructure/ratelimit/` 모듈을 PROJECT-STRUCTURE.md에 사전 등록
> - Issue #4 (Medium): T014 → T014a(Blog List + RSS) / T014b(Blog Detail) 분리
> - Issue #5 (Medium): T017 사전 단계로 `wrangler kv namespace create RATE_LIMIT_KV` + wrangler.toml binding 등록 명시
> - Issue #6 (Low): T003 산출물에 vitest coverage threshold 구체 수치(`lines:80, branches:75, functions:80, statements:80`) 명시
> - Issue #7 (Low): T016 cross-platform 단축키 검증(macOS ⌘K / Windows·Linux Ctrl+K / `/`) 분기 명시
