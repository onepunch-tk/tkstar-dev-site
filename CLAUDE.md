# tkstarDev — 1인 기업 개인 브랜드 사이트

## Project Overview
- **Service Name**: tkstarDev (`tkstar.dev`)
- **Goal**: 1인 기업(개발자)의 개인 브랜드 웹사이트로, 사이트 자체가 이력서 역할을 하며 B2B(기업/HR) 채용 제안과 B2C(프리랜서 플랫폼) 의뢰 모두를 단일 도메인에서 수렴. 주 네비게이션은 검색 중심(Cmd+K Command Palette)이며, 청중 분기는 별도 CTA가 아닌 콘텐츠 라우팅(About → B2B / Projects → B2C)으로 자연 수렴.
- **Target Users**:
  - **B2B**: 기업 채용/HR 담당자, B2B 프리랜서 PM (이력·기술 깊이·신뢰성 검토)
  - **B2C**: 크몽 등 프리랜서 플랫폼 유입 클라이언트 (결과물·후기·문제 해결 능력 검토)
- **Scope Note**: 한국어 only (i18n 없음). 결제/가격 페이지 없음 (메일 문의로 대체).
  - **콘텐츠 파이프라인 (이중 모델)**: Project 와 AppLegalDoc 은 `velite + MDX` 로 빌드 타임 정적 생성을 유지한다. Post 는 향후 D1 (SQLite) 에 원본 markdown 으로 저장되며 SSR runtime 에 컴파일·KV 캐시된다 — admin (본인 1명) 이 모바일/외부에서 글을 작성하기 위함. **본 시점에는 미구현**, 도입 task 분해는 ROADMAP `Phase: CMS 인프라` 참조.
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
> **Module Depth (Ousterhout)**: Prefer **deep modules** — simple interface, lots of functionality behind it — over shallow modules that surface complexity through their interface. AI defaults to shallow (small modules + complex interfaces); resist that default. Apply the *deletion test*: if removing a module concentrates complexity, it was earning its keep; if it just moves complexity around, it was a pass-through. For deepening opportunities and refactor workflows, invoke the `improve-codebase-architecture` skill.

## Harness Vocabulary

> Shared vocabulary for harness/pipeline machinery. When asking a question, writing a plan, naming a task, or describing a fix, **use exactly these terms**. Do not invent synonyms ("the discovery step" → say **Phase 0**; "the planning agent" → say **development-planner sub-agent**).
>
> **Domain Ubiquitous Language** (per-project business vocabulary — entities, technical verbs) lives in [`docs/glossary.md`](docs/glossary.md), auto-imported via the `@docs/glossary.md` line at the bottom of this file.

### Harness meta (12)

| Term | Meaning |
|------|---------|
| **Phase** | One of `discovery / plan / tdd / review / validate / complete` in `pipeline-state.json.current_phase`. Phase order is enforced by hooks. |
| **Pipeline** | The harness-pipeline skill end-to-end (Phase 0 → 4). Loaded by `/harness-pipeline`. |
| **Plan File** | The markdown file at `~/.claude/plans/<slug>.md` written during Plan Mode. The contract Phase 1 hands off to Phase 2. |
| **Mode (Sequential / Team)** | Execution shape decided in Phase 1 Step 4. Sequential = main agent runs all phases; Team = lead spawns teammates via `TeamCreate`. |
| **Task** | A `TaskCreate`-registered unit of pipeline work. Tasks describe concrete actions, not pipeline labels. |
| **Roadmap** | `docs/ROADMAP.md` — the source of truth for phase order, owned by `development-planner`. |
| **Issue** | A GitHub Issue created by `git-issue.sh` in GitHub Mode. Branches reference it as `feature/issue-{N}-{slug}`. |
| **Branch** | A git branch following `commit-prefix-rules.md`: `feature/* / fix/* / docs/* / chore/*`. PRs always target `development`. |
| **Skill** | A `.claude/skills/<name>/SKILL.md` module loaded into agent context (auto via `skills:` frontmatter or on-demand via Skill tool). |
| **Sub-Agent** | A specialized agent under `.claude/agents/**/*.md`, spawned by the Agent tool with `subagent_type:`. Foreground-only when listed in harness-pipeline SKILL.md. |
| **Hook** | A shell script under `.claude/hooks/` wired in `settings.json`, run by the harness runtime (not by the agent) on lifecycle events. |
| **ABAC** | Attribute-Based Access Control. The `abac-phase-policy.sh` hook hard-blocks `Edit/Write` on source files unless `pipeline-state.plan_approved == true`. |

### Pipeline State (4)

| Term | Meaning |
|------|---------|
| **Pipeline State** | `.claude/runtime/pipeline-state.json` — the single source of truth for current phase, mode, branch, plan/task gates. Hook-owned fields are off-limits to agents. |
| **Ownership (ReBAC)** | `.claude/runtime/ownership.json` (Team Mode only) — per-teammate file allowlist. Violations are detected post-hoc by the TeammateIdle hook. |
| **Doc Sync Gate** | The `docs-sync-gate.sh` hook that blocks PRs when ROADMAP/task checkbox state drifts from task body Status fields. |
| **Coverage Gate** | The `coverageThreshold` enforced by `jest.config.js` and verified by Phase 4 validation. |

## Tech Stack

> 라이브러리 1줄 = 버전 + 핵심 제약. war-story / 역사적 맥락은 task spec / `docs/PROJECT-STRUCTURE.md` 참조.

### Frontend / Styling / Typography
- React Router 7.14.0 (Framework mode, SSR) / React 19.2.4 / TypeScript 5.9.3
- TailwindCSS 4.2.2 (`@tailwindcss/vite`) — 토큰은 `docs/design-system/styles.css` → `@theme`
- 다크모드: `[data-theme='dark|light']` 셀렉터 전략 (Tailwind class 전략 X). Color: `oklch()` / `color-mix(in oklab,…)`. Animation: CSS-only
- Pretendard `v1.3.9` (한/영 통합 sans-serif). woff2 self-host + Satori OG 용 ttf 2종 commit

### Content Pipeline
- velite 0.3.1 — MDX frontmatter + TOC 추출 (Project / Post / AppLegalDoc). 본문 컴파일 X (T021.5 부터 `@mdx-js/rollup` 으로 분리). schema는 velite 자체 `s` 헬퍼 (Zod 3 internal) — Domain Zod 4 충돌 회피
- MDX 본문 — `@mdx-js/rollup` + `remark-frontmatter` 가 빌드 타임 ESM 컴파일. 라우트는 `import.meta.glob({ eager: true })` lookup. Workers `new Function` 차단 회피
- (T027) unified 11 + remark-parse + remark-gfm + remark-rehype — D1 `posts.raw_markdown` SSR runtime 컴파일 (markdown → hast Root). XSS escape는 `remark-rehype` default `allowDangerousHtml: false`. hast → React Element 마운트는 T028 `MdxRenderer.tsx`
- shiki 4.0.2 + @shikijs/rehype 4.0.2 (devDep) — 빌드 타임 syntax highlight, theme `github-dark`
- rehype-slug 6.0.0 + github-slugger 2.0.0 (devDep) — 한국어 anchor + TOC id 1:1 매칭
- Satori 0.26 standalone + @resvg/resvg-wasm 2.6 + yoga.wasm — `/og/{projects,blog}/:slug.png` SSR. wasm은 `compiled-wasm` 모듈 (Workers dynamic wasm 차단 우회). 폰트는 `env.ASSETS.fetch` 1회 + factory 캐시
- velite lifecycle (`pre{dev,build,start,test}`) → `bun run velite:build` (= `velite build && patch-velite-types.mjs`). typegen patch는 velite 0.3.1 의 Zod 3 internal type 누출 (TS4082) 회피, upstream fix 시 제거
- Path alias `#content` → `./.velite` (`tsconfig.cloudflare.json`)

### Search / SEO
- Cmd+K (F016): velite collection JSON 클라이언트 번들 → in-memory 토큰 검색 (라이브러리 X)
- sitemap.xml / robots.txt: RR7 resource route. JSON-LD: schema.org (Person/BlogPosting/CreativeWork/BreadcrumbList). Meta: RR7 `meta` export
- env: `GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION`. Indexing: App Terms/Privacy `noindex,follow`, 404 `noindex,nofollow`

### Forms / Email
- React Email 1.0.12 + `@react-email/render` 2.0.8 — Contact 자동응답 템플릿
- Resend HTTP API (SDK X). secret: `RESEND_API_KEY`
- Cloudflare Turnstile — public `TURNSTILE_SITE_KEY` + secret `TURNSTILE_SECRET` (dev는 always-pass test key)
- Rate Limit: `RATE_LIMIT_KV` (env별 namespace), key `contact:{ip}:{yyyy-mm-dd-hh}`, max=5/TTL=3600s. (TOCTOU + fixed-window → 후속 CF Rate Limiting binding 교체 예정)
- Local secrets: `.dev.vars` (gitignored), `.dev.vars.example` 참조

### Hosting / Edge
- Cloudflare Workers (SSR) — `wrangler 4.85.0` + `@cloudflare/vite-plugin 1.33.2`. **Workers Paid plan** ($5/mo + 종량) — 한도 Paid 기준:
  - Bundle: **10 MiB gzip** / 64 MiB uncompressed
  - CPU: 기본 30s, `[limits] cpu_ms` 5min 확장 가능
  - Requests: 10M/월 포함, 초과 $0.30/M
- Cloudflare Email Routing (`hello@tkstar.dev` → Gmail) / Web Analytics (cookieless) / Domain: `tkstar.dev`
- **Secrets vs 공개 식별자**:
  - ✅ git OK (식별자, API token 없이는 접근 불가): KV `id`/`preview_id`, D1 `database_id`, R2 bucket name, Worker route, `TURNSTILE_SITE_KEY`
  - ❌ 격리 (인증 토큰): CF API token, `RESEND_API_KEY`, `TURNSTILE_SECRET`, OAuth secret, JWT key → `wrangler secret` / `.dev.vars`

### CMS 인프라 (Phase 7.1 진행)
> 도입 일정/task: [docs/ROADMAP.md](docs/ROADMAP.md) `Phase: CMS 인프라`. 명세: [docs/PRD.md](docs/PRD.md) F020~F023.

- Cloudflare D1 (SQLite) — Post raw markdown / 메타 / Project 커버 메타. binding `DB`. production `tkstar-dev-db` / preview `tkstar-dev-db-preview` (default+staging+miniflare 공유)
- Drizzle ORM 0.45.2 + drizzle-kit 0.31.10 (devDep). schema=`./app/infrastructure/db/schema/*`, out=`./migrations`
- (T027) `POST_BODY_CACHE_KV` — Post body 컴파일 결과 hast JSON 캐시. key=`post:{slug}:body:v{16-char hash}`, 무제한 TTL + content-hash invalidation
- Cloudflare R2 (T033 도입). 클라이언트 후보: (1) R2 Workers binding (의존성 0) > (2) `aws4fetch` (~2.5KB) > (3) `@aws-sdk/client-s3` (multipart 필요시만)
- Cloudflare Access (Zero Trust) — `/admin/*` 보호 (1명 allowlist). `Cf-Access-Authenticated-User-Email` 헤더 검증 (자체 세션 X)
- Tiptap (or Lexical) WYSIWYG — admin editor, 순수 markdown 직렬화

### Build / Dev / Quality
- Vite 8.0.3 + `@vitejs/plugin-react 6.0.1`
- Vitest 4.1.5 + jsdom 29.1.0 + `@testing-library/{react 16.3.2, jest-dom 6.9.1, dom 10.4.1}`. setup: `vitest.setup.ts` (`tsconfig.cloudflare.json` include 필수)
- better-sqlite3 12.9.0 (devDep) — D1 Repository unit test in-memory SQLite. helper: `app/infrastructure/db/__tests__/_helpers/in-memory-d1.ts`
- Biome 2.4.13 (lint+format) / isbot 5.1.36 (SSR 봇 분기) / bun (`bun.lock`)

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
- **PR base = `development` (mandatory)**: every PR opened from a `feature/*` / `fix/*` / `docs/*` / `chore/*` branch MUST target `--base development`. The repo's GitHub default branch is `main` (production), and `gh pr create` without `--base` silently falls back to it — that is exactly how PR #22 (T006) leaked onto `main` and never reached `development`. Two-layer enforcement:
  1. **Wrapper (preferred)**: `.claude/hooks/git-pr-create.sh` pins `--base $(config integrationBranch)` automatically. Always use it.
  2. **Hook gate (defense-in-depth)**: `.claude/hooks/pre-pr-base-guard.sh` (PreToolUse:Bash) denies any direct `gh pr create` whose `--base` is missing or not equal to `development`.
  - **Release flow exception**: `development → main` (production sync) is the only legitimate non-`development` base. It is performed by `.claude/hooks/git-release.sh`, which prefixes its `gh pr create` call with `HARNESS_PR_BASE_MAIN_OK=1` to opt in. Do NOT set this env var manually for routine work; it exists so release tooling has a sanctioned escape hatch.
- **Self-check before a direct push**: "Is this really an exception?" — the answer is always "No". There are no exceptions.

## Workflow
> Before starting any implementation task, load the `harness-pipeline` skill.

## Launch Gate

`wrangler.toml [vars] SITE_LAUNCHED` (default `"false"`) 가 `"false"` 동안:
- 모든 페이지 `<meta name="robots" content="noindex,nofollow">`
- `/robots.txt` → `User-agent: *\nDisallow: /`
- `/sitemap.xml` → 빈 `<urlset/>`

`workers/app.ts` 는 항상 `tkstar.dev` 도메인의 비-`https://tkstar.dev` 변형 (www / http) 을 https apex 로 301 영구 리다이렉트 — launch 상태와 무관.

Launch 절차:
1. `wrangler.toml [env.production.vars] SITE_LAUNCHED = "true"` 로 변경
2. `bun run typecheck` — wrangler types 가 literal 을 재narrow (helper 가 `LaunchEnv: string` 으로 받고 있어 코드는 안 깨지지만, 새 literal 반영)
3. `bunx wrangler deploy --env production`
4. Search Console "URL 검사" → 색인 요청

## Commands

### Test & Quality
| Command | Description |
|---------|-------------|
| `bun run test` | Run all unit tests once. `pretest` lifecycle가 먼저 `velite build`를 호출해 `.velite/` 산출물을 보장 |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage report (threshold: lines 80, branches 75, functions 80, statements 80 — `vitest.setup.ts`) |
| `bun run typecheck` | TypeScript type checking (wrangler types + react-router typegen + `tsc -b`) |
| `bun run lint` | Biome lint & format check |
| `bun run format` | Biome auto-format |
| `bun run velite:build` | Build velite collections (`content/**/*.mdx` → `.velite/{projects,posts,legal}.json`). 일반적으로 `pre*` lifecycle hook이 자동 호출하므로 직접 실행할 일 드묾 |

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

@docs/glossary.md