## Core Principles
> **Clean Architecture**: All projects use 4-layer CA (Domain → Application → Infrastructure → Presentation). Inner layers MUST NOT depend on outer layers.
> **TDD-First**: All implementations must be preceded by writing tests first. Follow Inside-Out order (Domain → Presentation).
> **Side Effect Awareness**: All code modifications (except tests) must be written with careful consideration of potential side effects.
> **Context Engineering**: Context is a finite resource. The essence of the harness is to design each phase so that only the context strictly required is loaded and retained. Removing context once it has served its purpose is the default.
> **Think Before Coding**: State assumptions explicitly. If uncertain, stop and ask. When multiple interpretations exist, present options before deciding. If a simpler alternative exists, push back. Domain applications: prd-validator (alternatives/[ASSUMPTION]), roadmap-generator (Ambiguity Resolution), harness-pipeline (plan_approved enforcement).
> **Simplicity First**: Minimum code that solves the problem. No speculative abstractions, configurability, or error handling for impossible scenarios. Ask: "Would a senior engineer call this over-complicated?" Domain applications: code-style.md (type aliases/memoization), code-reviewer.md (quality checklist).
> **Surgical Changes**: Do not improve, reformat, or refactor adjacent code outside the requested scope. Match existing style. Only clean orphans (imports/vars/fns) created by your own changes. Pre-existing dead code: mention, do not delete. Domain applications: ca-rules.
> **Goal-Driven Execution**: Transform tasks into verifiable success criteria. Reject weak criteria like "make it work" — request clarification. Multi-step tasks: state a brief plan with per-step verification. Domain applications: tdd/SKILL.md (Red/Green/Refactor), harness-pipeline phase gates.
> **Module Depth (Ousterhout)**: Prefer **deep modules** — simple interface, lots of functionality behind it — over shallow modules that surface complexity through their interface. AI defaults to shallow (small modules + complex interfaces); resist that default. Apply the *deletion test*: if removing a module concentrates complexity, it was earning its keep; if it just moves complexity around, it was a pass-through. For deepening opportunities and refactor workflows, invoke the `improve-codebase-architecture` skill.

## Critical Documents
- Product Requirements [docs/PRD.md](docs/PRD.md): **MANDATORY** - Defines "what" to build (features, data model, policies, edge cases). Source-of-truth for all entity definitions, F-IDs, and behavioral contracts. Every task that touches an entity or policy MUST cite the PRD §-reference.
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
- **Pipeline coverage**: every branch type — `feature/*` · `fix/*` · `chore/*` · `docs/*` — runs the full 5-phase harness pipeline (Phase 0 Discovery → 1 Plan → 2 TDD → 3 Review → 4 Validate). There is no branch-prefix shortcut. The "non-behavior" character of `.sh` / `.md` / `.json` / `.yaml` / `.yml` files is absorbed at the TDD-exemption layer (see `phase-1-plan.md` §"TDD Exemption — Setup & Data Files"), not by skipping phases.
- **Merge method**: `gh pr merge <N> --squash --delete-branch`. After merge, sync locally with `git checkout development && git pull --ff-only`.
- **PR base = `development` (mandatory)**: every PR opened from a `feature/*` / `fix/*` / `docs/*` / `chore/*` branch MUST target `--base development`. The repo's GitHub default branch is `main` (production), and `gh pr create` without `--base` silently falls back to it — that is exactly how PR #22 (T006) leaked onto `main` and never reached `development`. Two-layer enforcement:
  1. **Wrapper (preferred)**: `.claude/hooks/pr/git-pr-create.sh` pins `--base $(config integrationBranch)` automatically. Always use it.
  2. **Hook gate (defense-in-depth)**: `.claude/hooks/pr/pre-pr-base-guard.sh` (PreToolUse:Bash) denies any direct `gh pr create` whose `--base` is missing or not equal to `development`.
  - **Release flow exception**: `development → main` (production sync) is the only legitimate non-`development` base. It is performed by `.claude/hooks/pr/git-release.sh`, which prefixes its `gh pr create` call with `HARNESS_PR_BASE_MAIN_OK=1` to opt in. Do NOT set this env var manually for routine work; it exists so release tooling has a sanctioned escape hatch.
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