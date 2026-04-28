# tkstarDev — 1인 기업 개인 브랜드 사이트

## Project Overview
- **Service Name**: tkstarDev (`tkstar.dev`)
- **Goal**: 1인 기업(개발자)의 개인 브랜드 웹사이트로, 사이트 자체가 이력서 역할을 하며 B2B(기업/HR) 채용 제안과 B2C(프리랜서 플랫폼) 의뢰 모두를 단일 도메인에서 수렴. 주 네비게이션은 검색 중심(Cmd+K Command Palette)이며, 청중 분기는 별도 CTA가 아닌 콘텐츠 라우팅(About → B2B / Projects → B2C)으로 자연 수렴.
- **Target Users**:
  - **B2B**: 기업 채용/HR 담당자, B2B 프리랜서 PM (이력·기술 깊이·신뢰성 검토)
  - **B2C**: 크몽 등 프리랜서 플랫폼 유입 클라이언트 (결과물·후기·문제 해결 능력 검토)
- **Scope Note**: 콘텐츠 100% static (DB 없음). 한국어 only (i18n 없음). 결제/가격 페이지 없음 (메일 문의로 대체). 모든 콘텐츠는 velite + MDX로 빌드 타임 정적 생성.
- **My Role**: PM

## Core Principles
> **Clean Architecture**: All projects use 4-layer CA (Domain → Application → Infrastructure → Presentation). Inner layers MUST NOT depend on outer layers.
> **TDD-First**: All implementations must be preceded by writing tests first. Follow Inside-Out order (Domain → Presentation).
> **Side Effect Awareness**: All code modifications (except tests) must be written with careful consideration of potential side effects.
> **Context Engineering**: Context is a finite resource. The essence of the harness is to design each phase so that only the context strictly required is loaded and retained. Removing context once it has served its purpose is the default.
> **Think Before Coding**: State assumptions explicitly. If uncertain, stop and ask. When multiple interpretations exist, present options before deciding. If a simpler alternative exists, push back. Domain applications: prd-validator (alternatives/[ASSUMPTION]), development-planner (Ambiguity Resolution), harness-pipeline (plan_approved enforcement).
> **Simplicity First**: Minimum code that solves the problem. No speculative abstractions, configurability, or error handling for impossible scenarios. Ask: "Would a senior engineer call this over-complicated?" Domain applications: code-style.md (type aliases/memoization), code-reviewer.md (quality checklist).
> **Surgical Changes**: Do not improve, reformat, or refactor adjacent code outside the requested scope. Match existing style. Only clean orphans (imports/vars/fns) created by your own changes. Pre-existing dead code: mention, do not delete. Domain applications: starter-cleaner.md, ca-rules.
> **Goal-Driven Execution**: Transform tasks into verifiable success criteria. Reject weak criteria like "make it work" — request clarification. Multi-step tasks: state a brief plan with per-step verification. Domain applications: tdd/SKILL.md (Red/Green/Refactor), harness-pipeline phase gates.

## Tech Stack

### Frontend Framework
- **React Router 7.14.0** (Framework mode, SSR) — 정적 콘텐츠도 SEO/OG 미리보기를 위해 SSR 사용
- **React 19.2.4 / React DOM 19.2.4**
- **TypeScript 5.9.3**

### Styling & UI
- **TailwindCSS 4.2.2** (`@tailwindcss/vite` 4.2.2) — 디자인 토큰은 `docs/design-system/styles.css`를 `@theme { --color-*, --font-* }`로 이식
- **다크모드**: `[data-theme='dark|light']` HTML 속성 셀렉터 전략 (Tailwind 클래스 전략 X). `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))`
- **Color**: `oklch()` / `color-mix(in oklab, ...)` native 사용
- **Animation**: CSS-only (`@keyframes` + `transition: 120ms ease`). Motion 라이브러리 MVP 보류

### Typography
- **JetBrains Mono** — primary mono 폰트 (전 페이지 본문/UI/코드)
- **Self-host**: `/public/fonts/JetBrainsMono-*.woff2` + `@font-face` (Workers SSR FOIT 방지)

### Content Pipeline
- **velite** — MDX 컬렉션 빌더 (Project / Post / AppLegalDoc)
- **MDX** — 콘텐츠 작성 포맷
- **shiki** — 코드블록 syntax highlight
- **Satori** — 빌드/SSR 동적 OG 이미지 생성 (1200×630)
- **Zod 4.3.6** — Domain schema 검증 (Project / Post / AppLegalDoc / ContactSubmission) + velite frontmatter 검증 (단일 정본을 양쪽이 공유)
- **rehype-slug** — on-this-page TOC 헤딩 anchor

### Search Index (F016 Cmd+K)
- velite collection JSON을 클라이언트 번들 import → in-memory 토큰 검색 (별도 라이브러리 없이 includes/score)

### SEO & Indexing
- **sitemap.xml / robots.txt** — RR7 resource route로 동적 생성
- **JSON-LD** — schema.org (Person / BlogPosting / CreativeWork / BreadcrumbList)
- **Meta Tags** — RR7 `meta` export (per-page title/description/canonical/OG/Twitter Card)
- **Search Engine Verification** — `GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION` env로 root layout 조건부 렌더
- **Indexing Policy** — App Terms/Privacy: `noindex, follow` / 404 splat: `noindex, nofollow`

### Forms & Email
- **React Email** — Contact 자동응답 메일 템플릿
- **Resend** — Contact form 발신 (`hello@tkstar.dev` → 본인 메일 + 제출자 자동응답). env: `RESEND_API_KEY`
- **Cloudflare Turnstile** — 스팸 방지. env: `TURNSTILE_SECRET`
- **Rate Limit** — Workers KV 기반 (`RATE_LIMIT_KV` binding)

### Hosting / Edge
- **Cloudflare Workers (SSR)** — `wrangler 4.85.0` + `@cloudflare/vite-plugin 1.33.2`
- **Cloudflare Email Routing** — `hello@tkstar.dev` → 개인 Gmail forward
- **Cloudflare Web Analytics** — 쿠키 없는 분석 스니펫
- **Domain**: `tkstar.dev`

### Build / Dev / Quality
- **Vite 8.0.3** + `@vitejs/plugin-react 6.0.1`
- **Vitest 4.1.5** + `jsdom 29.1.0` + `@testing-library/react 16.3.2` + `@testing-library/jest-dom 6.9.1` + `@testing-library/dom 10.4.1`
- **Biome 2.4.13** — Lint & Format
- **isbot 5.1.36** — SSR 봇 분기

### Package Management
- **bun** (`bun.lock`)

## Critical Documents
- Project Structure [docs/PROJECT-STRUCTURE.md](docs/PROJECT-STRUCTURE.md): **MANDATORY** - Reference before ANY task
- Development RoadMap [docs/ROADMAP.md](docs/ROADMAP.md): **MANDATORY** - Defines "in what order" to build (implementation phases)

## Git Integration
- **Remote Platform**: GitHub
- **PR-only workflow (MANDATORY, no exceptions)**: Direct commits / pushes to `development` and `main` are **forbidden**. Every change MUST go through feature branch → PR → squash merge. This rule applies to **all** of the following:
  - Code changes (feature, fix, refactor, test)
  - Documentation edits (README, ROADMAP, task files, this CLAUDE.md included)
  - Configuration changes (`.claude/`, `biome.json`, `tsconfig.json`, etc.)
  - Trivial changes like `pipeline-state.json` reset, one-line typo fixes, ROADMAP checkbox updates — no exception
- **Branch naming** (follow [commit-prefix-rules.md](.claude/skills/git/references/commit-prefix-rules.md)):
  - With a GitHub Issue: `{type}/issue-{N}-{slug}` (e.g., `feature/issue-9-route-navigation-skeleton`)
  - Without an Issue (doc/chore): `{type}/{slug}` (e.g., `docs/enforce-pr-workflow`, `chore/reset-pipeline-state`)
- **Trivial doc-only changes**: GitHub Issue may be skipped (open a PR only). All other changes must create an Issue first.
- **Plan phase on `chore/*` and `docs/*` branches**: the harness-pipeline's Phase 1 (Plan) and Phase 2 (TDD) are **not required** for these branch types. They carry non-behavioral changes (harness tooling, documentation, chores) that do not warrant a full Red/Green cycle. `plan-enforcement.sh` detects the branch prefix and suppresses its reminder; `abac-phase-policy.sh` already permits `.claude/**` / `docs/**` / `**/*.md` edits without `plan_approved`. PR review remains the safety net on these paths. `feature/*` and `fix/*` still follow the full 5-phase pipeline.
- **Merge method**: `gh pr merge <N> --squash --delete-branch`. After merge, sync locally with `git checkout development && git pull --ff-only`.
- **Self-check before a direct push**: "Is this really an exception?" — the answer is always "No". There are no exceptions.

## Workflow
> Before starting any implementation task, load the `harness-pipeline` skill.

## Commands

### Test & Quality
| Command | Description |
|---------|-------------|
| `bun run test` | Run all unit tests once |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report (threshold enforced via `coverageThreshold` in jest.config.js) |
| `bun run typecheck` | TypeScript type checking (`babel.config.js` / `metro.config.js` excluded via `tsconfig.json`) |
| `bun run lint` | Biome lint & format check |
| `bun run format` | Biome auto-format |

**Presentation test notes**: Vitest + jsdom + `@testing-library/react`. `vitest.setup.ts`는 `@testing-library/jest-dom/vitest`를 import하여 `toBeInTheDocument`/`toHaveClass` 등 matcher를 등록한다. 이 matcher 타입이 `app/**/*.test.tsx`에서 인식되려면 `tsconfig.cloudflare.json`의 `include`에 `vitest.setup.ts`가 포함되어 있어야 한다 (T004에서 추가).

> 참고: 위 단락의 이전 버전(Jest + React Native + `react-test-renderer`)은 Expo 스타터 잔재로 본 RR7 프로젝트와 무관 — 추후 정리 예정.

### Build & Native
| Command | Description |
|---------|-------------|
| `bun run start` | Start Metro bundler (Expo DevTools) |
| `bun run ios` | Build + install + launch on iOS simulator (internally: `expo run:ios`) |
| `bun run android` | Build + install + launch on Android emulator (internally: `expo run:android`) |
| `bunx expo prebuild --clean` | Regenerate `ios/` and `android/` native projects from scratch. **Required after**: adding/removing a library with native code, modifying `app.json`/`app.config.ts` plugins, or changing `package.json` dependencies that include native linking |

**Recommended workflow after dependency install or config change**:

```bash
bunx expo prebuild --clean   # regenerate native projects
bun run ios                  # verify iOS build
bun run android              # verify Android build
```