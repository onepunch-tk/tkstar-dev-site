# tkstarDev Development Roadmap

> 1인 기업(개발자) 개인 브랜드 사이트 `tkstar.dev`를 React Router v7 Framework + Cloudflare Workers SSR + Clean Architecture 4-layer로 빌드하기 위한 단계별 구현 계획. 본 로드맵은 PRD(F001~F019)와 PROJECT-STRUCTURE(CA 4-layer + velite + Workers Asset Binding)를 task 단위로 분해한 정본이며, **Structure-First → Inside-Out (Domain → Application → Infrastructure → Presentation) → TDD-First** 순서를 따른다.

## Overview

tkstarDev는 다음 핵심 가치를 단일 도메인에서 달성한다:

- **사이트 자체가 이력서**: B2B(채용/HR)와 B2C(프리랜서 의뢰) 양쪽 청중을 콘텐츠 라우팅(About / Projects)으로 자연 수렴
- **검색 우선 네비게이션**: Cmd+K Command Palette (F016)가 주 네비게이션 패러다임
- **이중 콘텐츠 파이프라인**: Project / AppLegalDoc 은 velite + MDX (빌드 타임 정적 ETL, Zod frontmatter 검증), Post 는 Cloudflare D1 + Drizzle ORM (런타임 SSR + KV cache). admin (본인 1명, Cloudflare Access) 이 모바일/외부에서 Post 작성 — Phase 7 에서 도입.
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
  - **후속 확장 (PR #42 merge 이후 결정)**: A013 — 경력 timeline 회사 + solo 프로젝트 통합. `CareerEntry`를 `type: "company" | "solo"` discriminated union으로 확장. solo entry는 velite project frontmatter (`about_career_role` / `about_career_period`) 끌어오기. 본 task는 Completed 상태 유지하고 후속 운영 PR로 처리 (실 데이터 입력 시점)
  - PR 1개 / 브랜치: `feature/issue-N-about-page-print`

- [x] **Task 012: Projects Page (F004 ls-style 행 리스트 + 태그 필터)** ✅
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

- [x] **Task 013: Project Detail Page (F005 + sticky sidebar + on-this-page TOC)**
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

- [x] **Task 014a: Blog Page (F006) — 목록 + 태그 필터 + RSS Resource Route (F012)** — 완료 (2026-04-30, PR #48)
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

- [x] **Task 014b: Blog Detail Page (F007) — 본문 + sticky sidebar + share**
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

- [x] **Task 015: Legal Index + App Terms + App Privacy (F014, chrome-free)** — Issue #55, PR TBD, 완료 2026-05-02
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

## Phase 7: CMS 인프라 — D1 + Drizzle + R2 + Cloudflare Access (Admin)

> **목표**: 본인 1명 admin 이 모바일/외부에서 Post 를 작성할 수 있도록 CMS 인프라(F020~F023)를 도입한다. Post 만 Cloudflare D1 (Drizzle ORM) 로 이관하고, Project / AppLegalDoc 은 velite + MDX 그대로 유지. R2 미디어 업로드는 Workers proxy 로 Cloudflare Access (GitHub OAuth) 게이트 하 처리. **Read path 먼저 → Auth + Admin 2차** 순서로 단계별 사용자 가치 확인 후 진행.
>
> **진입 조건**: Phase 6 완료 (MVP 배포 + 도메인 연결 + Search Console 인증 완료)
> **완료 조건 (DoD)**: AC-F020-1~5, AC-F021-1~5, AC-F022-1~4, AC-F023-1~5 모두 자동 테스트 Green. 프로덕션에서 본인이 GitHub OAuth 로그인 → `/admin/posts/new` 접근 → Tiptap 에디터로 Post 작성 + 이미지 업로드 + Save/Publish → 익명 방문자가 `/blog/{slug}` 진입 시 D1 + KV cache 로 SSR 렌더 + search-index.json 갱신 확인. Workers 번들 사이즈가 Cloudflare Free 3MiB 한계 이내 (또는 PoC 결과에 따라 paid plan 결정 사실 기록).
>
> **MVP 분리 가이드**: Phase 7.1 종료 시점에서 사용자 가치(Post D1 이관 완료)가 확보되므로, 7.2 ~ 7.4 진행 여부·시점은 7.1 회고 후 결정 가능. Phase 7.4 의 search index 재생성 트리거는 Admin 가동 후에 의미가 있으므로 7.3 종료 후로 묶는다.

### Phase 7.1: Read Path First — 번들 PoC + D1/Drizzle + 마이그레이션 + 런타임 컴파일러

> **목표**: 익명 방문자의 read path (Blog List / Blog Detail) 가 D1 + KV cache 로 동작하도록 전환한다. Auth/Admin UI 는 본 phase 에 없음 — 기존 운영자가 직접 D1 INSERT 하거나 마이그레이션 스크립트로만 내용 갱신.
>
> **진입 조건**: Phase 6 완료
> **완료 조건 (DoD)**: 기존 `content/posts/*.mdx` 가 D1 `posts` 테이블로 일회성 이관 완료. `/blog` 와 `/blog/{slug}` 가 D1 SELECT + raw_markdown runtime compile + KV cache 로 SSR 렌더. RSS / sitemap / search index 모두 D1 published 항목만 반영. Workers 번들 사이즈 PoC 결과 사실 기록.

- [ ] **Task 023: Workers 번들 사이즈 PoC + 의존성 합산 측정** - Priority
  - **Must** Read: [tasks/T023-workers-bundle-poc.md](tasks/T023-workers-bundle-poc.md)
  - blockedBy: Task 022
  - blocks: Task 024, Task 027, Task 030, Task 035
  - Layer: Infrastructure (build-time 측정) + 운영
  - 관련 Feature: F020, F021, F022, F023 (전제)
  - 관련 AC: 없음 (사실 측정)
  - 검증:
    - 임시 PoC 브랜치에서 [Tiptap (v2 또는 v3 + markdown serializer 후보) + MDX-like compiler 후보(`marked` / `micromark` / `@mdx-js/mdx` — `nodejs_compat` 는 wrangler.toml 에 이미 활성) + shiki 단일 theme(`github-dark`) + `jose` (JWT 검증) + R2 client 후보 (`aws4fetch` / R2 binding-only / `@aws-sdk/client-s3`)] 합산 import만으로 빈 Worker 빌드 → `bunx wrangler deploy --dry-run --outdir dist`로 산출물 측정. **`@aws-sdk/client-s3` 도 측정 대상에 포함** (nodejs_compat 으로 import 가능, 실측 ~500KB 가산 영향 확인 목적)
    - 합산이 Cloudflare Free 3 MiB 이내 → 기본 stack 확정 / 초과 시 (a) `aws4fetch` + R2 binding-only / (b) shiki 제거(syntax highlight 빌드 타임만) / (c) Workers Paid 플랜 ($5/월) 중 결정
    - 측정 보고서를 PR 본문 + `docs/reports/cms-bundle-poc-{date}.md` 에 기록 (각 의존성별 byte 분해)
  - 산출물:
    - `docs/reports/cms-bundle-poc-{date}.md` (측정 결과 + stack 결정)
    - 본 task 자체는 코드 머지 X — 측정 후 PoC 브랜치 폐기, 결과 문서만 머지
    - 결정된 후보를 후속 task (T024, T027, T030, T035) 의 산출물에 명시
  - 가정 해소: Issue #2 (Workers 번들 사이즈 한계 vs CMS 의존성 합산), A014 일부 (Tiptap 메이저 버전 후보 좁힘), A015 일부 (MDX runtime compiler 후보 좁힘), Issue #1 부분 (R2 SDK 1차 후보 좁힘 — 최종 결정은 T033)
  - PR 1개 / 브랜치: `chore/cms-bundle-poc`

- [ ] **Task 024: Cloudflare D1 + Drizzle ORM 셋업 + posts schema migration**
  - **Must** Read: [tasks/T024-d1-drizzle-setup.md](tasks/T024-d1-drizzle-setup.md)
  - blockedBy: Task 023
  - blocks: Task 025, Task 026, Task 038
  - Layer: Infrastructure (db) + 운영(wrangler binding)
  - 관련 Feature: F021
  - 관련 AC: 없음 (스키마/binding 정합 검증)
  - 사전 단계 (PR 본 작업 전 1회):
    - `bunx wrangler d1 create tkstar-dev-db` (production) → 반환 `database_id` 기록
    - `bunx wrangler d1 create tkstar-dev-db-preview` (preview) → `preview_database_id` 기록
    - `wrangler.toml` 에 `[[d1_databases]] binding = "DB"`, `database_name = "tkstar-dev-db"`, `database_id = "..."`, `preview_database_id = "..."` 등록
  - 검증:
    - `drizzle.config.ts` 가 D1 dialect 로 동작, `bunx drizzle-kit generate` 가 SQL 마이그레이션 파일 생성
    - `bunx wrangler d1 migrations apply tkstar-dev-db --local` 로컬 적용 성공 + `--remote` 도 적용 성공
    - `posts` 테이블의 컬럼이 PRD F021 Data Model 과 1:1 매칭 (`id` PK, `slug` UNIQUE, `title`, `summary`, `raw_markdown`, `tags` JSON, `date_published`, `status` enum check, `created_at`, `updated_at`)
    - `app/env.d.ts` 의 `interface AppLoadContext` (또는 `Env`) 에 `DB: D1Database` 추가
  - 산출물:
    - `package.json` — `drizzle-orm@0.44.x` (Issue #4: A021 결정 결과 따름), `drizzle-kit@0.x` (devDependency)
    - `drizzle.config.ts` (D1 dialect)
    - `app/infrastructure/db/schema/posts.ts` — Drizzle schema (`pgTable` 가 아닌 `sqliteTable`)
    - `migrations/0001_create_posts.sql` (drizzle-kit 생성 산출물)
    - `wrangler.toml` `[[d1_databases]]` binding `DB`
    - `app/env.d.ts` `DB: D1Database` 추가
  - 가정 해소: A021 (Drizzle 버전 pin — 0.44.x stable 채택 또는 v1.0 stable 출시 시 갱신, Issue #4)
  - PR 1개 / 브랜치: `feature/issue-N-d1-drizzle-setup`

- [ ] **Task 025: Domain Post entity D1 재정의 + D1PostRepository (Infrastructure)**
  - **Must** Read: [tasks/T025-d1-post-repository.md](tasks/T025-d1-post-repository.md)
  - blockedBy: Task 024
  - blocks: Task 026, Task 027, Task 028
  - Layer: Domain (Post entity 재정의) + Infrastructure (D1PostRepository)
  - 관련 Feature: F021
  - 관련 AC: AC-F021-3, AC-F021-4 (status 필터링), AC-F021-5 (updated_at 기반 캐시 키)
  - 검증:
    - Domain `__tests__/post.schema.test.ts` 갱신 — `status: 'draft' | 'published'`, `raw_markdown: string`, `tags: string[]` (JSON parse 후) 검증
    - Infrastructure `__tests__/d1-post.repository.test.ts` — `miniflare` 또는 `@cloudflare/workers-types` 기반 D1 mock 으로 `findAll(status?)`, `findBySlug(slug, status?)`, `findRecent(n, status?)` (default `status='published'`), `findByTag(tag, status?)` 검증
    - velite Post 컬렉션은 **본 task 에서 비활성화** (`velite.config.ts`의 `posts` collection 제거 또는 주석 처리). `content/posts/*.mdx` 파일 자체는 T026 마이그레이션 후 삭제 예정.
    - Application port (`post-repository.port.ts`) 시그니처 갱신 — `status` 파라미터 추가 (default `published`)
  - 산출물:
    - `app/domain/post/{post.entity.ts, post.schema.ts}` — `raw_markdown` / `status` 필드 추가, `body` MDX 필드 제거
    - `app/application/content/ports/post-repository.port.ts` — `findAll(status?: 'draft' | 'published' | 'all')` 등 시그니처 갱신
    - `app/infrastructure/db/d1-post.repository.ts` — Drizzle 기반 구현 (`db.select().from(posts).where(...)`)
    - `app/infrastructure/db/mappers/post-row.mapper.ts` — D1 row → Domain Post Entity (`tags` JSON parse, `status` enum 검증)
    - `app/infrastructure/content/velite-post.repository.ts` — **삭제** (velite Post collection 폐기)
    - `velite.config.ts` — `posts` collection 제거
    - `app/infrastructure/config/container.ts` — `D1PostRepository` 주입으로 교체
  - 가정 해소: 없음 (T024 의 schema 위에 1:1 매핑)
  - PR 1개 / 브랜치: `feature/issue-N-d1-post-repository`

- [ ] **Task 026: 기존 MDX → D1 일회성 마이그레이션 스크립트**
  - **Must** Read: [tasks/T026-mdx-to-d1-migration.md](tasks/T026-mdx-to-d1-migration.md)
  - blockedBy: Task 024, Task 025
  - blocks: Task 028
  - Layer: Infrastructure (one-shot script) + 운영
  - 관련 Feature: F021
  - 관련 AC: AC-F021-1
  - 검증:
    - `scripts/migrate-posts-to-d1.ts` — `content/posts/*.mdx` 를 frontmatter 파싱(`gray-matter`) → `raw_markdown` 추출 → `INSERT INTO posts (slug, title, summary, raw_markdown, tags, date_published, status='published', created_at=now, updated_at=now)`
    - slug 중복 INSERT 시 fail-fast (transaction abort + 명시적 에러)
    - dry-run 모드 (`--dry-run`) 지원 — 실제 INSERT 없이 변환 결과만 stdout 출력
    - **Local D1 적용**: `bunx wrangler d1 execute tkstar-dev-db --local --file=migrations/0002_seed_posts.sql` 또는 스크립트 직접 실행
    - **Remote D1 적용**: 마이그레이션 후 `content/posts/` 디렉토리 삭제 (PR 별 파일 정리), velite collection 도 T025 에서 제거됨
  - 산출물:
    - `scripts/migrate-posts-to-d1.ts` (Bun 실행, `--dry-run` 플래그)
    - `scripts/__tests__/migrate-posts-to-d1.test.ts` (gray-matter 파싱 + INSERT 쿼리 빌드 단위 테스트)
    - `content/posts/` 삭제 (마이그레이션 완료 후 별도 commit)
    - `docs/reports/post-migration-{date}.md` — 이관 결과 (이관 건수, 실패 건수, 롤백 절차)
  - PR 1개 / 브랜치: `chore/migrate-posts-to-d1`

- [ ] **Task 027: MDX runtime compiler 결정 + 구현 + KV cache (post body)**
  - **Must** Read: [tasks/T027-mdx-runtime-compiler-kv-cache.md](tasks/T027-mdx-runtime-compiler-kv-cache.md)
  - blockedBy: Task 023, Task 025
  - blocks: Task 028
  - Layer: Application (`compile-post-body.service.ts`) + Infrastructure (compiler + KV cache adapter)
  - 관련 Feature: F021
  - 관련 AC: AC-F021-2, AC-F021-5
  - 사전 단계 (PR 본 작업 전 1회):
    - `bunx wrangler kv namespace create POST_BODY_CACHE_KV` (production) → `id` 기록
    - `bunx wrangler kv namespace create POST_BODY_CACHE_KV --preview` → `preview_id` 기록
    - `wrangler.toml` `[[kv_namespaces]] binding = "POST_BODY_CACHE_KV"` 등록
    - `app/env.d.ts` `POST_BODY_CACHE_KV: KVNamespace` 추가
  - 검증:
    - T023 PoC 결과로 결정된 컴파일러 (예: `marked` + `react-markdown` / `micromark` + 커스텀 / `@mdx-js/mdx` + `nodejs_compat`) 채택 사실 본 task 산출물에 기록
    - `compile-post-body.service.ts` 단위 테스트 — `raw_markdown` 입력 → React Element 또는 직렬화 가능한 AST 출력
    - shiki 단일 theme (`github-dark`) 코드블록 highlight 가 런타임에 적용됨 (T023 에서 빌드 타임 only 결정 시 본 항목 제외 — 사실 PR 본문에 기록)
    - KV cache adapter — key `post:{slug}:body:v{updated_at-hash}` 로 PUT/GET, `hash` 알고리즘은 `crypto.subtle.digest('SHA-256', ...)` 의 hex 앞 16 char (A016 해소: SHA-256 truncate 채택)
    - 첫 SSR 요청은 cache miss → compile + KV PUT, 두 번째 요청은 cache hit (KV GET)
    - `updated_at` 변경 시 hash 가 자동으로 바뀌어 이전 캐시 항목은 hit 안 됨 (자연 invalidation)
  - 산출물:
    - `app/application/content/services/compile-post-body.service.ts` + `__tests__/`
    - `app/application/content/ports/post-body-cache.port.ts`
    - `app/infrastructure/cache/kv-post-body-cache.ts` + `__tests__/` (env.POST_BODY_CACHE_KV)
    - `app/infrastructure/content/markdown-compiler.ts` (T023 결정 컴파일러 wrapper)
    - `wrangler.toml` `[[kv_namespaces]] binding = "POST_BODY_CACHE_KV"` (id + preview_id)
    - `app/env.d.ts` `POST_BODY_CACHE_KV: KVNamespace`
    - `app/infrastructure/config/container.ts` — `compilePostBody` 의존성 주입
  - 가정 해소: A015 (Runtime MDX compiler 채택 — T023 결정 사실 기록), A016 (KV cache key hash 알고리즘 — SHA-256 truncate 16 char 채택)
  - PR 1개 / 브랜치: `feature/issue-N-mdx-runtime-compiler`

- [ ] **Task 028: Blog List/Detail 라우트 D1 전환 + RSS/sitemap/search 인덱스 published-only 필터**
  - **Must** Read: [tasks/T028-blog-routes-d1-switch.md](tasks/T028-blog-routes-d1-switch.md)
  - blockedBy: Task 026, Task 027
  - blocks: Task 040
  - Layer: Application (services 갱신) + Presentation (loader 갱신)
  - 관련 Feature: F021, F006, F007, F012, F018, F016
  - 관련 AC: AC-F021-2, AC-F021-3, AC-F021-4
  - 검증:
    - `list-posts.service.ts` / `get-post-detail.service.ts` / `get-recent-posts.service.ts` / `build-rss-feed.service.ts` / `build-sitemap.service.ts` (post 부분) 모두 default `status='published'` 필터 적용
    - Blog List/Detail loader 통합 테스트 — D1 mock + KV cache mock 으로 SSR 렌더 검증
    - `status='draft'` slug 직접 진입 → splat → 404 (AC-F021-3)
    - RSS/sitemap/search index 모두 draft 미포함 (AC-F021-4) — RSS XML / sitemap XML / search-index.json fixture 비교
    - Blog Detail loader 가 KV cache hit/miss 양 경로 모두 정상 응답 (AC-F021-2 후속)
    - `velite.config.ts` 에서 `posts` collection 완전 제거 확인, `.velite/posts.json` 미생성
  - 산출물:
    - `app/application/content/services/{list-posts.service.ts, get-post-detail.service.ts, get-recent-posts.service.ts}` — D1 repo 호출 + status 필터 + body compile/cache wiring
    - `app/application/feed/services/build-rss-feed.service.ts` — D1 published-only
    - `app/application/seo/services/build-sitemap.service.ts` — Post 부분 D1 published-only
    - `app/application/search/services/build-search-index.service.ts` — Post 부분 D1 published-only (단, 본격적 buildSearchIndex 분리는 T039)
    - `app/presentation/routes/{blog._index.tsx, blog.$slug.tsx, rss[.xml].tsx, sitemap[.xml].tsx}` — 컨테이너에서 D1 backed service 사용
    - `app/presentation/components/post/MdxRenderer.tsx` 또는 동등 컴포넌트가 compile 결과 렌더
  - 가정 해소: 없음 (Read path 완성)
  - PR 1개 / 브랜치: `feature/issue-N-blog-routes-d1-switch`

### Phase 7.2: Auth + Admin Foundation — Cloudflare Access + JWT 검증 + Admin shell

> **목표**: Cloudflare Access (Zero Trust, Free 플랜, GitHub OAuth, 본인 1명 allowlist) 로 `/admin/*` 게이트를 세우고, Workers 측에서 fail-closed JWT 검증을 한다. Admin Layout shell + Posts List 까지만 — 에디터/미디어 업로드는 Phase 7.3 에서.
>
> **진입 조건**: Phase 7.1 완료
> **완료 조건 (DoD)**: AC-F023-1~5 모두 자동 테스트 Green. 본인이 GitHub OAuth 로그인 후 `/admin/posts` 접근 → AdminLayout 렌더 + D1 posts 목록 표시. 미인증/위조 토큰 직접 호출은 401. JWT 공개키 1시간 캐시 동작.

- [ ] **Task 029: Cloudflare Access 팀 도메인 발급 + GitHub OAuth IdP + path application 등록 (운영)**
  - **Must** Read: [tasks/T029-cloudflare-access-setup.md](tasks/T029-cloudflare-access-setup.md)
  - blockedBy: Task 022 (운영용 도메인 필요)
  - blocks: Task 030
  - Layer: 운영 (Cloudflare Zero Trust dashboard)
  - 관련 Feature: F023
  - 관련 AC: 없음 (운영 검증)
  - 검증:
    - Cloudflare Zero Trust Free 플랜 활성화 → `<team>.cloudflareaccess.com` 발급
    - GitHub OAuth App 생성 (`Authorization callback URL = https://<team>.cloudflareaccess.com/cdn-cgi/access/callback`) → Client ID/Secret 을 Cloudflare Access IdP 에 등록
    - `/admin/*` path application 추가 + Policy: Action `Allow`, Include `Emails: 86tkstar@gmail.com`
    - 익명 브라우저로 `/admin/posts` 접근 → Cloudflare Access 가 GitHub OAuth 로그인 페이지로 리다이렉트 확인
    - 본인 GitHub 로그인 → `/admin/posts` 도달 (이 시점엔 아직 404 — 라우트는 T031 에서 생성)
    - `<team>` subdomain 을 `wrangler.toml` vars (`CLOUDFLARE_ACCESS_TEAM`) 에 기록
  - 산출물:
    - `docs/reports/cloudflare-access-setup-{date}.md` — 팀 도메인, GitHub OAuth App 정보, Access Policy 스크린샷
    - `wrangler.toml` `[vars] CLOUDFLARE_ACCESS_TEAM = "<team>"`
    - `wrangler.toml` `[vars] CLOUDFLARE_ACCESS_AUD = "<application audience tag>"` (path application 의 AUD claim)
  - 가정 해소: A019 (Cloudflare Access 팀 도메인 — Free 플랜 50 seats 1명 사용 채택)
  - PR 1개 / 브랜치: `chore/cloudflare-access-setup`

- [ ] **Task 030: Workers access-guard 미들웨어 (Cf-Access-Jwt-Assertion JWT 검증, jose) + 공개키 1시간 캐시**
  - **Must** Read: [tasks/T030-workers-access-guard.md](tasks/T030-workers-access-guard.md)
  - blockedBy: Task 023, Task 029
  - blocks: Task 031, Task 034
  - Layer: Infrastructure (auth) + Platform Adapter (workers/)
  - 관련 Feature: F023
  - 관련 AC: AC-F023-2, AC-F023-3, AC-F023-4, AC-F023-5
  - 검증:
    - `access-guard.test.ts`:
      - 정상 JWT (서명 검증 + AUD claim + iss claim 통과) + `Cf-Access-Authenticated-User-Email` 일치 → AccessIdentity 반환 (AC-F023-2)
      - 위조/누락 JWT → 401 (AC-F023-3)
      - 헤더 자체 누락 (Cloudflare Access 우회 시도 또는 설정 누락) → fail-closed 401 (AC-F023-4)
      - 공개키 fetch 후 1시간 동안 in-memory cache hit (AC-F023-5) — `Date.now()` mock 으로 검증
      - allowlist email 불일치 → 401
    - `jose` (JWT 검증 라이브러리) 도입 — T023 PoC 합산에 포함됨
    - 미들웨어가 `workers/app.ts` 의 `/admin/*` path matcher 에서 호출됨 (T031 에서 wiring)
  - 산출물:
    - `app/infrastructure/auth/access-guard.ts` — `verifyAccessJwt(request, env): Promise<AccessIdentity>` (실패 시 throw `AccessUnauthorizedError`)
    - `app/infrastructure/auth/jwks-cache.ts` — `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 의 JWKS 1시간 in-memory cache
    - `app/domain/auth/access-identity.vo.ts` (`email`, `jwt`)
    - `app/domain/auth/auth.errors.ts` (`AccessUnauthorizedError`)
    - `package.json` — `jose@5.x` 추가
    - `app/infrastructure/auth/__tests__/access-guard.test.ts` — JWT 시그니처 mock + AUD/iss 검증
  - 가정 해소: 없음 (Issue #2 PoC 결과 확인 후 jose 채택 사실만 기록)
  - PR 1개 / 브랜치: `feature/issue-N-workers-access-guard`

- [ ] **Task 031: /admin/* route shell + AdminLayout + Topbar/Footer/palette 제외**
  - **Must** Read: [tasks/T031-admin-route-shell.md](tasks/T031-admin-route-shell.md)
  - blockedBy: Task 030
  - blocks: Task 032, Task 036, Task 037
  - Layer: Presentation (routes + layouts) + Platform Adapter (workers/app.ts middleware wiring)
  - 관련 Feature: F023, F020 (UI 진입점), F022 (Media nav 진입점)
  - 관련 AC: AC-F023-1 (라우트 진입점)
  - 검증:
    - `app/presentation/routes/admin.posts._index.tsx`, `admin.posts.new.tsx`, `admin.posts.$slug.edit.tsx`, `admin.media.tsx` placeholder 라우트 존재 (AdminLayout 마운트 + "구현 예정" 본문)
    - `AdminLayout` 이 `ChromeLayout`/`ChromeFreeLayout` 과 분리 — 좌측 nav (Posts / Media) + 상단 로그인 이메일 표시 + Topbar/Footer/Command Palette 마운트 X
    - F016 search-index 빌드에서 `/admin/*` 경로 제외 (T028 산출물에 본 task 와 함께 보강)
    - `/sitemap.xml`, `/rss.xml` 에서도 `/admin/*` 제외 (T028 산출물에 본 task 와 함께 보강)
    - `workers/app.ts` 가 path 가 `/admin/*` 일 때 `verifyAccessJwt` 호출 → 통과 시 `AppLoadContext.accessIdentity` 주입, 실패 시 401 응답
    - `app/env.d.ts` `interface AppLoadContext` 에 `accessIdentity?: AccessIdentity` 추가
    - root layout 에서 `<meta name='robots' content='noindex, nofollow'>` 가 `/admin/*` 에 적용 (또는 admin route 별 meta export)
  - 산출물:
    - `app/presentation/layouts/AdminLayout.tsx`
    - `app/presentation/components/admin/{AdminNav.tsx, AdminUserBadge.tsx}`
    - `app/presentation/routes/{admin.posts._index.tsx, admin.posts.new.tsx, admin.posts.$slug.edit.tsx, admin.media.tsx}` placeholder
    - `workers/app.ts` — `/admin/*` 경로 분기 + `verifyAccessJwt` 호출 + `AppLoadContext.accessIdentity` 주입
    - `app/env.d.ts` `accessIdentity?: AccessIdentity`
    - F016 / sitemap / RSS 빌더 측 `/admin/*` exclusion 검증 테스트
  - PR 1개 / 브랜치: `feature/issue-N-admin-route-shell`

- [ ] **Task 032: Admin Posts List 라우트 (D1 SELECT + status 필터 + 신규/편집 진입점)**
  - **Must** Read: [tasks/T032-admin-posts-list.md](tasks/T032-admin-posts-list.md)
  - blockedBy: Task 031
  - blocks: Task 036
  - Layer: Application (`list-admin-posts.service.ts`) + Presentation
  - 관련 Feature: F020, F021
  - 관련 AC: 없음 (Page-by-Page Admin Posts List Key Features 로 검증)
  - 검증:
    - `list-admin-posts.service.test.ts` — D1PostRepository 의 `findAll(status?='all')` 호출 (status='all' 은 draft+published 모두 포함)
    - Admin Posts List loader 통합 테스트 — RTL + container mock 으로 status 필터 칩(draft/published/전체) 동작, `[+ New Post]` 버튼 → `/admin/posts/new` 네비게이션, 행 클릭 → `/admin/posts/{slug}/edit`, 삭제 버튼 → 확인 모달 → D1 DELETE
    - 인증되지 않은 요청은 T031 의 access-guard 가 차단하므로 본 task 는 인증 통과 가정
  - 산출물:
    - `app/application/content/services/list-admin-posts.service.ts` + `__tests__/`
    - `app/application/content/services/delete-post.service.ts` + `__tests__/` (hard delete, F021 Out of Scope: 버전 히스토리)
    - `app/presentation/routes/admin.posts._index.tsx` (loader + action)
    - `app/presentation/components/admin/{PostsTable.tsx, StatusFilterChips.tsx, DeleteConfirmModal.tsx}`
    - `app/infrastructure/db/d1-post.repository.ts` — `delete(slug)` 메서드 추가 + 테스트
  - PR 1개 / 브랜치: `feature/issue-N-admin-posts-list`

### Phase 7.3: Admin Editor + Media — R2 + Tiptap + Upload + Editor

> **목표**: 본인이 모바일/외부에서 Post 본문을 작성·편집·발행할 수 있도록 Tiptap WYSIWYG 에디터 + R2 미디어 업로드를 완성한다.
>
> **진입 조건**: Phase 7.2 완료 (Auth + Admin shell + Posts List 동작)
> **완료 조건 (DoD)**: AC-F020-1~5, AC-F022-1~4 모두 Green. 본인이 `/admin/posts/new` 에서 Tiptap 에디터로 Post 작성 + 이미지 업로드 + Save (draft) + Publish (published) → 익명 방문자 `/blog/{slug}` 접근 시 정상 노출.

- [ ] **Task 033: R2 SDK 결정 + R2 bucket 생성 + binding 등록**
  - **Must** Read: [tasks/T033-r2-bucket-binding.md](tasks/T033-r2-bucket-binding.md)
  - blockedBy: Task 023
  - blocks: Task 034, Task 037, Task 038
  - Layer: Infrastructure (storage) + 운영
  - 관련 Feature: F022
  - 관련 AC: 없음 (binding/SDK 동작 검증)
  - 사전 단계 (PR 본 작업 전 1회):
    - `bunx wrangler r2 bucket create tkstar-dev-media` (production)
    - `bunx wrangler r2 bucket create tkstar-dev-media-preview` (preview)
    - `wrangler.toml` `[[r2_buckets]] binding = "MEDIA_BUCKET"`, `bucket_name = "tkstar-dev-media"`, `preview_bucket_name = "tkstar-dev-media-preview"` 등록
    - R2 public read 방식 결정 (A017): R2 public bucket URL 직접 노출 vs Workers 라우트 proxy 서빙. 본 task 에서 결정·기록
  - 검증:
    - T023 PoC 결과로 R2 SDK 결정 — (a) R2 Workers binding 직접 호출 (`MEDIA_BUCKET.put/get/delete/list`, ~0KB, 의존성 0) 또는 (b) `aws4fetch` (~2.5KB) 또는 (c) `@aws-sdk/client-s3` (~500KB). **`@aws-sdk/client-s3` 는 `wrangler.toml` 의 `compatibility_flags = ["nodejs_compat"]` 활성으로 `node:fs`/`node:stream` import-time 에러는 polyfill 로 해결** — 비호환은 아님. 단 (i) 번들 ~500KB + cold start 비용, (ii) 일부 기능(multipart upload, streaming response)은 nodejs_compat 부분 구현이라 사용 시점 검증 필요. 따라서 1순위는 (a) R2 binding (R2 전용이라 S3 API 추상화 불필요), 2순위는 (b) `aws4fetch` (다른 S3 호환 서비스로 이식 시), 3순위는 (c) `@aws-sdk/client-s3` (multi-part / streaming 등 sdk 만의 기능이 진짜 필요할 때). 결정 후 PR 본문 + 본 task 산출물에 사실 기록
    - `app/infrastructure/storage/r2-media-client.ts` — 결정 SDK 로 `put(key, body, contentType)` / `get(key)` / `delete(key)` / `list(prefix)` 추상화
    - `app/env.d.ts` `MEDIA_BUCKET: R2Bucket` 추가
    - 단위 테스트 — `miniflare` R2Bucket mock 으로 PUT/GET/DELETE/LIST 동작 검증
    - public read URL 응답 fixture 검증
  - 산출물:
    - `app/infrastructure/storage/r2-media-client.ts` + `__tests__/`
    - `wrangler.toml` `[[r2_buckets]]` MEDIA_BUCKET binding
    - `app/env.d.ts` `MEDIA_BUCKET: R2Bucket`
    - (R2 public bucket 채택 시) `wrangler.toml` 또는 Cloudflare dashboard 에서 public access 활성화 + `R2_PUBLIC_BASE_URL` env 등록
    - (Workers proxy 채택 시) `app/presentation/routes/media.$.tsx` resource route 추가
  - 가정 해소: Issue #1 (R2 SDK 최종 결정), A017 (R2 public read 방식 결정)
  - PR 1개 / 브랜치: `feature/issue-N-r2-bucket-binding`

- [ ] **Task 034: Workers proxy upload `POST /admin/api/upload` (R2 PUT + nanoid 키)**
  - **Must** Read: [tasks/T034-admin-upload-proxy.md](tasks/T034-admin-upload-proxy.md)
  - blockedBy: Task 030, Task 033
  - blocks: Task 036, Task 037
  - Layer: Application (`upload-media.service.ts`) + Infrastructure (R2 + nanoid) + Resource Route
  - 관련 Feature: F022, F023
  - 관련 AC: AC-F022-1, AC-F022-2
  - 검증:
    - `upload-media.service.test.ts` — multipart/form-data 파싱 → 파일 검증 (max size, mime type allowlist) → R2 PUT 호출 → `{ url, key }` 반환
    - 키 형식: `media/{yyyy}/{mm}/{nanoid}.{ext}` — `nanoid` 는 21자 url-safe (PRD AC-F022-1 명시)
    - 통합 테스트: `POST /admin/api/upload` 가 access-guard 통과 후만 동작, 미인증 직접 호출 시 401 (AC-F022-2)
    - 응답 JSON: `Content-Type: application/json`, `{ url: "https://...", key: "media/..." }`
    - `mime type` 화이트리스트 — `image/png`, `image/jpeg`, `image/webp`, `image/gif`, `image/svg+xml` (admin 전용이라 SVG 도 허용)
    - file size 한계 — 5 MiB (admin 본인 1명 — 임의 결정, 본 task 에서 사실 기록)
  - 산출물:
    - `app/application/contact` 와 동등한 위치에 `app/application/admin/services/upload-media.service.ts` + ports (`media-storage.port.ts`)
    - `app/presentation/routes/admin.api.upload.tsx` — action only (multipart 파싱 → service 호출 → JSON 응답)
    - `package.json` — `nanoid@5.x` 추가
    - `app/infrastructure/storage/r2-media-storage.ts` (T033 의 `r2-media-client.ts` wrapper, port 구현)
    - `app/infrastructure/config/container.ts` — `uploadMedia` 의존성 주입
  - 가정 해소: 없음
  - PR 1개 / 브랜치: `feature/issue-N-admin-upload-proxy`

- [ ] **Task 035: Tiptap 메이저 버전 결정 + 한국어 IME PoC (iOS Safari) + markdown serializer 채택**
  - **Must** Read: [tasks/T035-tiptap-korean-ime-poc.md](tasks/T035-tiptap-korean-ime-poc.md)
  - blockedBy: Task 023
  - blocks: Task 036
  - Layer: Presentation (PoC 페이지) + 의사결정
  - 관련 Feature: F020
  - 관련 AC: 없음 (PoC 사실 측정)
  - 검증:
    - 임시 PoC 라우트 (`/admin/__tiptap-poc`) 또는 별도 Storybook 같은 sandbox 에서 후보 조합 측정
    - 후보 (A014 좁힘):
      - (1) Tiptap v3 + `@tiptap/markdown` (공식 v3 전용, 활발 유지)
      - (2) Tiptap v2 + `tiptap-markdown` (커뮤니티, v2 호환, 메인테이너 비활성)
      - (3) Tiptap v3 + 자체 markdown serializer (custom)
    - 검증 항목:
      - **iOS Safari 한국어 IME**: 한글 조합 중 (자음·모음 분리 입력) commit 시점에 글자 깨짐/중복 입력 발생 여부
      - **macOS Chrome 한국어 IME**: 동일
      - **markdown round-trip**: bold/italic/link/code/image 마크업 → markdown serialize → 다시 deserialize 시 동일 마크업 (AC-F020-1, AC-F020-4)
      - **번들 사이즈**: T023 PoC 합산에 포함된 가정값과 비교
    - 결정 후보 + 측정 결과를 `docs/reports/tiptap-ime-poc-{date}.md` 에 기록
  - 산출물:
    - `docs/reports/tiptap-ime-poc-{date}.md`
    - 본 task 자체는 코드 머지 X — PoC 결과 문서만 머지, 채택 후보가 T036 의 산출물 의존성에 명시
  - 가정 해소: A014 (Tiptap markdown serializer 채택 — 본 PoC 결과 사실 기록)
  - PR 1개 / 브랜치: `chore/tiptap-ime-poc`

- [ ] **Task 036: Admin Post Editor (Tiptap + frontmatter 폼 + Save/Publish + 우측 preview)**
  - **Must** Read: [tasks/T036-admin-post-editor.md](tasks/T036-admin-post-editor.md)
  - blockedBy: Task 027 (preview 컴파일러 공유), Task 032 (라우트 진입점), Task 034 (이미지 업로드), Task 035 (Tiptap 채택)
  - blocks: Task 040
  - Layer: Application (`save-post.service.ts`, `publish-post.service.ts`) + Presentation (editor)
  - 관련 Feature: F020, F021, F022
  - 관련 AC: AC-F020-1, AC-F020-2, AC-F020-3, AC-F020-4
  - 검증:
    - `save-post.service.test.ts` — D1 INSERT/UPDATE with `status='draft'`, `updated_at=now`
    - `publish-post.service.test.ts` — D1 UPDATE with `status='published'`, `date_published=입력값 또는 now`, `updated_at=now`, KV cache 키 `post:{slug}:body:v*` 무효화 (T027 의 cache port `invalidate(slug)` 호출), search index 재생성 트리거 (T040 에서 wiring)
    - Editor RTL 테스트 — Tiptap toolbar [bold] 클릭 → `**...**` markdown 직렬화 검증 (AC-F020-1)
    - 이미지 toolbar 버튼 → file picker → `POST /admin/api/upload` (T034) → 응답 URL 을 `![filename](url)` 로 본문 삽입 (AC-F020-2)
    - 우측 preview — T027 의 `compilePostBody` 와 동일한 컴파일러로 렌더 (AC-F020-4 round-trip 일관성)
    - frontmatter 폼: title (required), summary (required), tags (chip input), date_published (date picker, optional for draft)
  - 산출물:
    - `app/application/content/services/{save-post.service.ts, publish-post.service.ts}` + `__tests__/`
    - `app/application/content/ports/post-body-cache.port.ts` — `invalidate(slug): Promise<void>` 추가 (T027 port 확장)
    - `app/infrastructure/cache/kv-post-body-cache.ts` — `invalidate` 구현 (KV list with prefix + delete batch)
    - `app/presentation/routes/{admin.posts.new.tsx, admin.posts.$slug.edit.tsx}` (loader + action)
    - `app/presentation/components/admin/editor/{TiptapEditor.tsx, EditorToolbar.tsx, FrontmatterForm.tsx, PreviewPane.tsx, ImageUploadButton.tsx}`
    - `package.json` — Tiptap (T035 결정 버전) + markdown serializer (T035 결정 후보)
  - 가정 해소: 없음 (T027/T034/T035 결정 결과 위에 동작)
  - PR 1개 / 브랜치: `feature/issue-N-admin-post-editor`

- [ ] **Task 037: Admin Media Library (R2 list + Copy URL + Delete)**
  - **Must** Read: [tasks/T037-admin-media-library.md](tasks/T037-admin-media-library.md)
  - blockedBy: Task 031, Task 033
  - Layer: Application (`list-media.service.ts`, `delete-media.service.ts`) + Presentation
  - 관련 Feature: F022
  - 관련 AC: AC-F022-4
  - 검증:
    - `list-media.service.test.ts` — R2 `list({ prefix: 'media/' })` mock → MediaAsset[] 반환 (`key` / `url` / `size` / `uploaded`)
    - `delete-media.service.test.ts` — R2 DELETE 호출 + 호출 카운트 검증, 자동 참조 추적/교체 X (AC-F022-4)
    - Admin Media Library loader RTL 테스트 — 그리드 렌더 + `[Copy URL]` 클릭 시 `navigator.clipboard.writeText` mock 호출 + `[Delete]` 클릭 시 확인 모달 + DELETE 호출
  - 산출물:
    - `app/application/admin/services/{list-media.service.ts, delete-media.service.ts}` + `__tests__/`
    - `app/presentation/routes/admin.media.tsx` (loader + action)
    - `app/presentation/components/admin/media/{MediaGrid.tsx, MediaItemCard.tsx, MediaDeleteModal.tsx}`
    - `app/infrastructure/storage/r2-media-storage.ts` — `list(prefix)` / `delete(key)` 메서드 보강
  - 가정 해소: 없음
  - PR 1개 / 브랜치: `feature/issue-N-admin-media-library`

### Phase 7.4: Project Meta + Search Index — D1 분리 + buildSearchIndex use case 분리

> **목표**: Project 의 cover 메타만 D1 `project_meta` 로 분리하여 admin 에서 갱신 가능하게 한다. F016 search-index.json 재생성을 application service 로 분리하여 admin save/publish 시 트리거.
>
> **진입 조건**: Phase 7.3 완료 (admin 가동)
> **완료 조건 (DoD)**: AC-F022-3 통과. Project Detail / Home Featured 가 D1 project_meta.cover_image_url 사용. admin Post save/publish 시 search-index.json 재생성 — F016 palette 가 갱신 즉시 반영.

- [ ] **Task 038: project_meta D1 schema + cover 메타 D1 이관 + Project Detail/Home Featured 전환**
  - **Must** Read: [tasks/T038-project-meta-d1.md](tasks/T038-project-meta-d1.md)
  - blockedBy: Task 024, Task 033
  - blocks: Task 040
  - Layer: Domain (ProjectMeta vo) + Infrastructure (D1ProjectMetaRepository) + Application (`get-project-detail.service.ts`, `get-featured-project.service.ts` 갱신) + Presentation (Project Detail / Home Featured cover)
  - 관련 Feature: F022
  - 관련 AC: AC-F022-3
  - 검증:
    - `migrations/0003_create_project_meta.sql` — `slug` PK + `cover_image_url` nullable + `cover_alt` nullable + `updated_at`
    - velite Project schema 의 `cover` / `cover_alt` 필드 제거 (또는 deprecation 표시 + 무시) → A018 결정 사실 기록
    - `D1ProjectMetaRepository.findBySlug(slug)` + `upsert(slug, cover_image_url, cover_alt)` 단위 테스트
    - `get-project-detail.service.ts` 가 velite Project + D1 ProjectMeta 를 머지하여 반환 — Project Detail 의 cover 이미지가 D1 source 사용
    - `get-featured-project.service.ts` 동일하게 cover 머지
    - 기존 velite Project frontmatter 의 cover 값을 D1 으로 일회성 이관하는 짧은 스크립트 (`scripts/migrate-project-cover-to-d1.ts`)
    - Admin Posts List 와 동등 위치에 신규 Admin Project Meta List/Edit 라우트는 본 task 의 Out of Scope (PRD F022 Page-by-Page 의 Admin Media Library 안에 cover 갱신 UX 가 포함되지 않으므로 추후 운영 task 로 분리 — 본 task 는 read path 정합성만 확보)
  - 산출물:
    - `app/domain/project/project-meta.vo.ts` + schema
    - `app/application/content/ports/project-meta-repository.port.ts`
    - `app/infrastructure/db/schema/project-meta.ts` (Drizzle)
    - `app/infrastructure/db/d1-project-meta.repository.ts` + `__tests__/`
    - `app/application/content/services/{get-project-detail.service.ts, get-featured-project.service.ts}` 갱신 (velite + D1 머지)
    - `migrations/0003_create_project_meta.sql`
    - `scripts/migrate-project-cover-to-d1.ts` (`--dry-run` 지원)
    - `app/infrastructure/config/container.ts` — `D1ProjectMetaRepository` 주입
    - `velite.config.ts` — Project schema 의 `cover` / `cover_alt` 필드 제거 또는 deprecation
  - 가정 해소: A018 (project_meta 컬럼 — `slug` PK + `cover_image_url` + `cover_alt` 만 채택, `featured` 는 velite frontmatter 유지로 결정 사실 기록)
  - PR 1개 / 브랜치: `feature/issue-N-project-meta-d1`

- [ ] **Task 039: buildSearchIndex use case 분리 (application service, owner) — Issue #3 해소**
  - **Must** Read: [tasks/T039-build-search-index-service.md](tasks/T039-build-search-index-service.md)
  - blockedBy: Task 028
  - blocks: Task 040
  - Layer: Application (`build-search-index.service.ts`) + Infrastructure (R2 또는 KV 산출물 storage)
  - 관련 Feature: F016, F020, F021
  - 관련 AC: 없음 (use case 분리 검증)
  - 검증:
    - `build-search-index.service.test.ts` — velite project collection + D1 published Post + 정적 라우트 머지 → JSON 직렬화 → output port (`search-index-storage.port.ts`) 의 `write(json: string)` 호출
    - 산출물 저장 위치 결정 (A020): R2 (현 정적 자산 패턴) vs KV (저지연 read). 결정 후 본 task 산출물에 사실 기록
    - 결정에 따라 `R2SearchIndexStorage` 또는 `KvSearchIndexStorage` 어댑터 구현
    - 기존 T016 의 `build-search-index.service.ts`(Phase 4) 가 빌드 타임 ETL 인 반면, 본 task 는 런타임/admin 트리거 가능한 service 로 재정의 — 두 호출 경로 모두에서 일관 동작 확인
    - 인덱스 JSON 의 항목별 본문 미포함 (gzip 100KB 이하) — F016 AC-F016-5 회귀 방지 테스트
    - `/admin/*` 경로는 인덱스에서 제외 (T031 정책 회귀 방지)
  - 산출물:
    - `app/application/search/services/build-search-index.service.ts` (T016 산출물 갱신, owner 변경 명시)
    - `app/application/search/ports/search-index-storage.port.ts`
    - `app/infrastructure/storage/{r2-search-index-storage.ts, kv-search-index-storage.ts}` 중 결정한 1개 + `__tests__/`
    - `app/infrastructure/config/container.ts` — `buildSearchIndex` 의존성 주입
    - `docs/reports/search-index-storage-decision-{date}.md` (A020 결정 기록)
  - 가정 해소: A020 (search-index.json 저장 위치 — R2 vs KV 결정), Issue #3 (buildSearchIndex use case owner — application service 분리 완료)
  - PR 1개 / 브랜치: `feature/issue-N-build-search-index-service`

- [ ] **Task 040: Admin Save/Publish → buildSearchIndex 자동 호출 + KV cache 무효화 통합**
  - **Must** Read: [tasks/T040-admin-save-publish-search-trigger.md](tasks/T040-admin-save-publish-search-trigger.md)
  - blockedBy: Task 028, Task 036, Task 038, Task 039
  - blocks: none
  - Layer: Application (save/publish service 갱신) + 통합 검증
  - 관련 Feature: F016, F020, F021
  - 관련 AC: AC-F020-3 (search-index.json 재생성 + KV cache 무효화)
  - 검증:
    - `publish-post.service.test.ts` (T036) 갱신 — `buildSearchIndex` (T039) + `postBodyCache.invalidate(slug)` (T027) 가 모두 호출됨을 검증 (mock spy)
    - `save-post.service.test.ts` (T036) — draft save 시에도 search-index 재생성 호출 (palette 에서 draft 도 노출되지는 않으나 published-only 정책이 search index 측에 있으므로 호출 자체는 idempotent)
    - 통합 테스트: admin 이 publish → 익명 사용자가 즉시 `/blog/{slug}` 진입 시 D1 SELECT + KV cache miss → compile + KV PUT → 정상 응답 / Command Palette 가 새 항목 표시
    - 실패 격리: search-index 재생성이 5xx 등으로 실패해도 D1 publish 자체는 성공 (eventual consistency, retry는 admin 이 수동 트리거 — Out of Scope: 자동 retry queue)
    - 본 task 는 신규 코드보다 wiring 통합 검증 위주
  - 산출물:
    - `app/application/content/services/{save-post.service.ts, publish-post.service.ts}` 갱신 — buildSearchIndex + cache invalidate wiring
    - 통합 테스트 `app/application/content/services/__tests__/publish-post.integration.test.ts`
    - `docs/reports/cms-phase7-completion-{date}.md` — Phase 7 전체 완료 보고 (AC-F020/F021/F022/F023 매트릭스 + 잔존 가정 정리)
  - 가정 해소: 없음 (T036/T039 wiring 완성)
  - PR 1개 / 브랜치: `feature/issue-N-admin-save-publish-search-trigger`

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
| F020 | Admin Editor (Tiptap WYSIWYG) | Task 036 | Task 023 (PoC), Task 027 (preview compiler 공유), Task 032 (진입점), Task 034 (이미지 업로드), Task 035 (Tiptap PoC), Task 040 (search index trigger) |
| F021 | D1 Post Storage | Task 025 | Task 023 (PoC), Task 024 (D1 셋업), Task 026 (마이그레이션), Task 027 (runtime compile + KV cache), Task 028 (read path 전환) |
| F022 | R2 Media | Task 033 | Task 023 (PoC), Task 034 (upload proxy), Task 037 (media library), Task 038 (project_meta cover) |
| F023 | Cloudflare Access (Zero Trust) | Task 030 | Task 029 (운영 셋업), Task 031 (admin shell wiring), Task 034 (upload proxy 보호) |

> **F015**(청중 분기 기억) 및 청중 분기 split CTA는 PRD에서 Removed — task 미할당.
> 모든 Core/Support Feature(F001~F023, F015 제외)가 최소 1개 task에 매핑되며, F018 차등 인덱싱은 Task 019에서 페이지별 meta export로 분산 적용. F020~F023은 Phase 7 (CMS 인프라) 에서 sub-phase 4개 (Read Path / Auth Foundation / Editor+Media / Project Meta+Search Index) 로 분해 — Phase 7.1 Read path 만으로도 사용자 가치 (Post D1 이관) 확보 가능.

---

## Assumption Resolution Gate Matrix

> PRD `Assumptions Register`(A001~A021)의 해소 게이트와 본 ROADMAP의 phase가 일치하는지 검증한다.

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
| A013 | About Page Career — solo 프로젝트 통합 timeline | T012 이후 또는 T011 follow-up | T011 follow-up (실 데이터 입력 시점) | Phase 3 (Post-PR) |
| A014 | F020 Tiptap markdown serializer (v2 vs v3 후보) | F020 구현 PR | Task 023 (후보 좁힘) + Task 035 (한국어 IME PoC 후 최종 결정) | Phase 7.1 + 7.3 |
| A015 | F021 Runtime MDX compiler 채택 | F021 구현 PR | Task 023 (후보 좁힘) + Task 027 (KV cache 통합 시 최종 결정) | Phase 7.1 |
| A016 | F021 KV cache key hash 알고리즘 | F021 구현 PR | Task 027 (SHA-256 truncate 16 char 채택) | Phase 7.1 |
| A017 | F022 R2 public read 방식 (public bucket vs Workers proxy) | F022 구현 PR | Task 033 (R2 bucket 생성 시 결정 후 기록) | Phase 7.3 |
| A018 | F022 project_meta 컬럼 (cover_image_url 외 featured 등) | F022 구현 PR | Task 038 (`slug` PK + `cover_image_url` + `cover_alt` 만 채택, `featured` 는 velite frontmatter 유지) | Phase 7.4 |
| A019 | F023 Cloudflare Access 팀 도메인 (Free 플랜 충분성) | F023 구현 PR | Task 029 (Free 50 seats 1명 사용 채택 + 팀 subdomain 발급) | Phase 7.2 |
| A020 | F020 search-index.json 저장 위치 (R2 vs KV) | F020 구현 PR | Task 039 (`build-search-index.service` 산출물 storage 결정) | Phase 7.4 |
| A021 | Drizzle ORM 버전 pin (0.44.x stable vs v1.0 stable 출시) | F021 구현 PR | Task 024 (D1 셋업 시 0.44.x stable 채택, v1.0 stable 출시 시 갱신) | Phase 7.1 |

> **운용 규칙**: 각 phase 완료 시점에 본 표를 점검하여 해당 phase가 게이트인 항목이 모두 [FACT]로 전환됐는지 확인하고 PRD 본문을 업데이트한다. A011/A012는 MVP 범위 외이므로 본 ROADMAP의 Phase 6 종료 후 Phase 7 시작 전 별도 issue로 트래킹한다. A014~A021은 Phase 7 진입 후 sub-phase 별로 단계적 해소.

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
                                                              ↓
Phase 7.1 (Read Path):
  Task 023 (Bundle PoC) → Task 024 (D1+Drizzle) → Task 025 (Domain+D1Repo)
                                                  ↓
                            Task 026 (MDX→D1 Migration)
                            Task 027 (Runtime Compiler+KV) — blockedBy: Task 023, Task 025
                                                  ↓
                            Task 028 (Blog Routes D1 Switch) — blockedBy: Task 026, Task 027
                                                  ↓
Phase 7.2 (Auth+Admin Foundation):
  Task 029 (CF Access Setup, blockedBy: Task 022)
       ↓
  Task 030 (Workers Access Guard, blockedBy: Task 023, Task 029)
       ↓
  Task 031 (Admin Route Shell)
       ↓
  Task 032 (Admin Posts List)
                                                  ↓
Phase 7.3 (Editor+Media):
  Task 033 (R2 Bucket+SDK, blockedBy: Task 023)
       ↓
  Task 034 (Upload Proxy, blockedBy: Task 030, Task 033)
  Task 035 (Tiptap IME PoC, blockedBy: Task 023) — 병렬 가능
       ↓
  Task 036 (Admin Post Editor, blockedBy: Task 027, Task 032, Task 034, Task 035)
  Task 037 (Admin Media Library, blockedBy: Task 031, Task 033) — 병렬 가능
                                                  ↓
Phase 7.4 (Project Meta+Search Index):
  Task 038 (project_meta D1, blockedBy: Task 024, Task 033)
  Task 039 (buildSearchIndex Service, blockedBy: Task 028) — 병렬 가능
       ↓
  Task 040 (Save/Publish Search Trigger, blockedBy: Task 028, Task 036, Task 038, Task 039)
```

> **병렬 가능 task** (`||` 또는 텍스트 명시): Phase 3의 Task 010, 011, 012, 013, 014a, 015는 콘텐츠 페이지 단위로 병렬 PR 가능 (T014b는 T014a 이후). Phase 1의 Task 004(Routes)와 Task 005(Theme/Tokens)는 의존성이 분리되어 병렬 가능. Phase 2 이후의 task는 대체로 순차. T017-pre(docs)는 T017보다 선행. Phase 7.3 의 Task 035 (Tiptap PoC) 는 Task 034 (Upload Proxy) 와 병렬, Task 036/037 도 병렬 가능. Phase 7.4 의 Task 038/039 는 병렬.

> **Phase 7 진행 게이트 권장**: Phase 7.1 종료 시 사용자 가치(Post D1 read path) 확보되므로, 7.2~7.4 진행 여부·시점을 회고 후 결정 가능. 단, 7.3 (Editor) 가 admin 의 핵심 가치이므로 7.2 → 7.3 은 묶어서 진행 권장.

---

## 진행 현황 요약

- [x] Phase 0: Setup & Toolchain (Task 001~003) ✅ 완료 (2026-04-28)
- [ ] Phase 1: Foundation — Routing Skeleton + Domain Schemas + Theme (Task 004~006)
- [ ] Phase 2: Content Pipeline — velite + MDX + shiki + Repository (Task 007~009)
- [ ] Phase 3: Core Pages UI (Task 010~013, 014a, 014b, 015)
- [ ] Phase 4: Forms / Email — Command Palette + Contact (Task 016, 017-pre, 017)
- [ ] Phase 5: SEO / OG / Indexing (Task 018~020)
- [ ] Phase 6: Polish & Deploy (Task 021~022)
- [ ] Phase 7: CMS 인프라 — D1 + Drizzle + R2 + Cloudflare Access (Task 023~040)
  - Phase 7.1 Read Path First (Task 023~028, 6 tasks)
  - Phase 7.2 Auth + Admin Foundation (Task 029~032, 4 tasks)
  - Phase 7.3 Admin Editor + Media (Task 033~037, 5 tasks)
  - Phase 7.4 Project Meta + Search Index (Task 038~040, 3 tasks)

**총 42개 task (T014 분리 + T017-pre + Phase 7 신규 18개) / 7개 phase / 100% PRD Feature(F001~F023, F015 제외) coverage / 100% Assumption(A001~A021) 해소 게이트 매핑.**

> **검증 리포트(2026-04-28) 반영 이력**:
> - Issue #1 (High): T010/T012/T015 자동 테스트(RTL + DOM assertion) 항목 보강
> - Issue #2 (Medium): T008 `blockedBy`에 Task 002 명시 추가
> - Issue #3 (Medium): T017-pre 신규 추가 — `app/infrastructure/ratelimit/` 모듈을 PROJECT-STRUCTURE.md에 사전 등록
> - Issue #4 (Medium): T014 → T014a(Blog List + RSS) / T014b(Blog Detail) 분리
> - Issue #5 (Medium): T017 사전 단계로 `wrangler kv namespace create RATE_LIMIT_KV` + wrangler.toml binding 등록 명시
> - Issue #6 (Low): T003 산출물에 vitest coverage threshold 구체 수치(`lines:80, branches:75, functions:80, statements:80`) 명시
> - Issue #7 (Low): T016 cross-platform 단축키 검증(macOS ⌘K / Windows·Linux Ctrl+K / `/`) 분기 명시
>
> **Phase 7 신설 이력 (2026-05-02, prd-validator hand-off 반영)**:
> - Phase 7.1 Read Path 우선 분리 (사용자 가치 조기 확보 — Post D1 이관만으로 admin 없이도 운영 변화 가능)
> - Issue #1 (R2 SDK 결정): T033 에서 T023 PoC 결과 기반 최종 결정 (R2 binding-only / aws4fetch / @aws-sdk/client-s3 중). **정정 (2026-05-03)**: `wrangler.toml` 의 `compatibility_flags = ["nodejs_compat"]` 활성으로 `@aws-sdk/client-s3` 의 `node:fs`/`node:stream` import-time 에러는 polyfill 로 해결 — Workers 비호환 risk 표현은 약화. 실제 trade-off 는 **번들 ~500KB + cold start + 일부 기능(multipart/streaming) 의 nodejs_compat 부분 구현** 한정.
> - Issue #2 (Workers 번들 사이즈): T023 가 Phase 7 첫 task — Tiptap + MDX compiler + shiki + jose + R2 client 합산 측정 필수
> - Issue #3 (`buildSearchIndex` owner): T039 에서 application service 로 분리, T040 에서 admin save/publish wiring
> - A014 (Tiptap v2/v3 결정): T023 후보 좁힘 + T035 한국어 IME PoC (iOS Safari) 후 최종 결정
> - A015 (MDX runtime compiler): T023 후보 좁힘 + T027 KV cache 통합 시 최종 결정
> - A019 (Cloudflare Access 팀 도메인): T029 에서 Free 50 seats 1명 사용 채택 + 팀 subdomain 발급
> - A021 (Drizzle 버전 pin) 신규: T024 에서 0.44.x stable 채택 (Issue #4 — prd-validator Suggestion #2)
