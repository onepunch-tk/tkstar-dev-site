---
name: monorepo-detection
description: Canonical rules for detecting monorepo/workspace structure (Turborepo, pnpm workspaces, npm/yarn/bun workspaces) and locating the target app or package directory. Reference-only skill preloaded by other skills/subagents.
when_to_use: When any skill or agent needs to determine whether a project is a monorepo and, if so, pick the correct sub-package directory for further operations.
user-invocable: false
disable-model-invocation: true
---

# Monorepo Detection

Single source of truth for monorepo detection. Any skill or agent that previously inlined monorepo checks (prd, design-system, code-reviewer) must defer here.

## Detection order

Inspect the repository root (the directory containing `.git/`) in this order:

| Signal | Monorepo tool |
|---|---|
| `turbo.json` present at root | Turborepo |
| `pnpm-workspace.yaml` present at root | pnpm workspaces |
| Root `package.json` contains a `workspaces` array or object | npm / yarn / bun workspaces |
| `nx.json` present at root | Nx |
| `lerna.json` present at root | Lerna |

If none match, the project is a single-package repo. Return `monorepo: false` and set `targetDir` to the repo root.

## Locating the target sub-package

When a monorepo is detected and the task scope implies a specific app or package, pick the target directory by the work context:

| Work context | How to pick |
|---|---|
| Web / frontend work | Find the directory containing `react-router.config.ts`, `next.config.*`, or `vite.config.*` |
| Mobile work | Find the directory containing Expo config (`app.config.ts` / `app.config.js` / `app.json` with an `expo` key) AND `expo` in its `package.json` dependencies |
| Backend / API work | Find the directory containing `nest-cli.json` or an equivalent backend framework config |
| Shared package (types, utils, etc.) | The directory under `packages/` most commonly referenced by app directories |

If multiple directories match the same work context (e.g., two Expo apps), do not guess — ask the user.

Fall back to the repo root only for shared tooling (root `package.json` scripts, CI config).

## Output contract

```ts
type MonorepoDetectionResult = {
  monorepo: boolean;
  tool: 'turbo' | 'pnpm-workspaces' | 'workspaces' | 'nx' | 'lerna' | null;
  repoRoot: string; // absolute path containing .git/
  targetDir: string; // absolute path of the sub-package chosen, or equal to repoRoot when not a monorepo
};
```

## Coordination with framework-detection

`framework-detection` must run **inside** `targetDir`, not at `repoRoot`. Running it at the wrong level gives wrong results for monorepos (e.g., root `package.json` may list only devDeps).
