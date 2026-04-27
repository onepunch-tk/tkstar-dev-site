# ClaudeCode & React Router Framework Starterkit

## Project Overview
- **Service Name**: [your service name]
- **Goal**: [Problem to solve and value to provide]
- **Target Users**: [Primary user target]
- **My Role**: [Your persona — e.g., CTO, CEO, Product Manager, Tech Lead. Determines how the agent addresses you during plan consultation. Leave blank to skip consultation step]

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
- **Package Manager**: bun
- **Language**: TypeScript
- **Lint & Formatter**: biome

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

**Presentation test notes**: the `app` project in `jest.config.js` uses `setupFilesAfterEnv` (not `setupFiles`) so `@testing-library/react-native` matchers load after Jest globals. `react-test-renderer` is pinned to an exact version matching `react` (RTL peer-dep guard) — upgrade both together via `bun up react react-test-renderer`.

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