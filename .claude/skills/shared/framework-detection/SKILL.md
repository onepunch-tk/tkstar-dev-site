---
name: framework-detection
description: Canonical rules for detecting the frontend/backend framework of a project (React Router, Next.js, Expo+RN, NestJS, Remix, Vite+React). Reference-only skill preloaded by other skills/subagents via the skills frontmatter field.
when_to_use: When any skill or agent needs to determine which framework a project uses, including initial analysis, path resolution, dependency verification, and template selection.
user-invocable: false
disable-model-invocation: true
---

# Framework Detection

Single source of truth for framework detection. Any skill or agent that previously inlined framework checks (prd, project-structure, design-system, tdd, code-reviewer, ux-design-lead) must defer here.

## Detection order

Inspect the target directory in this order. Stop at the first match.

### 1. Config-file signals

| File present at the target directory | Framework |
|---|---|
| `react-router.config.ts` or `react-router.config.js` | React Router (v7 framework mode) |
| `next.config.{ts,js,mjs,cjs}` | Next.js |
| `remix.config.{ts,js}` | Remix (legacy) |
| `app.config.{ts,js}` or `app.json` containing an `expo` key, AND `expo` in `dependencies` | Expo + React Native |
| `nest-cli.json` | NestJS |
| `vite.config.{ts,js,mjs}` without Next.js/React Router config AND `react` in dependencies | Vite + React |

### 2. package.json dependency signals (fallback when no config file is unambiguous)

Examine `dependencies` plus `devDependencies`:

| Dependency key | Framework |
|---|---|
| `expo` or `react-native` | Expo + React Native |
| `next` | Next.js |
| `react-router` or any `@react-router/*` package | React Router |
| `@nestjs/core` | NestJS |
| `@remix-run/react` | Remix (legacy) |
| `react` only (no framework-level deps above) | Vite + React (assume) |

### 3. Unknown

If none of the above match, return `unknown`. Do not guess. Ask the user to describe the project's framework, or inspect a nearby `README.md` / `docs/PROJECT-STRUCTURE.md` for hints.

## Package manager detection

Independent of framework, detect the package manager via lockfile in the target directory:

| Lockfile | Package manager |
|---|---|
| `bun.lockb` or `bun.lock` | `bun` |
| `pnpm-lock.yaml` | `pnpm` |
| `yarn.lock` | `yarn` |
| `package-lock.json` | `npm` |

If multiple lockfiles exist, the project is inconsistent — prefer `bun` > `pnpm` > `yarn` > `npm` but raise the drift to the user for resolution.

## Monorepo awareness

Before locating the target directory, check for monorepo signals. See the `monorepo-detection` skill for the exact rules. In a monorepo, framework detection runs **inside the relevant app/package directory**, not at repo root.

## Output contract

Consumers expect this result shape:

```ts
type FrameworkDetectionResult = {
  framework:
    | 'react-router'
    | 'nextjs'
    | 'remix'
    | 'expo'
    | 'nestjs'
    | 'vite-react'
    | 'unknown';
  packageManager: 'bun' | 'pnpm' | 'yarn' | 'npm';
  targetDir: string; // absolute path of the directory where detection ran
  monorepo: boolean;
};
```

## Change control

Updating this skill updates detection for every consumer. When adding a new framework, also add to:
- `prd/SKILL.md` platform table
- `project-structure/SKILL.md` template table
- `design-system/SKILL.md` bridge matrix
- `.claude/config.json` sourceExtensions / testFilePatterns if the framework introduces new file types.
