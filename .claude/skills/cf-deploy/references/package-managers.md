# Package managers — setup actions and install commands

The generator picks a setup-* action and install command per package manager.
This file documents the full matrix and the rationale.

## Detection precedence

1. `.claude/config.json` → `packageManager` (if set and not `"auto"`)
2. Lockfile probe in this priority: `bun.lock`/`bun.lockb` → `pnpm-lock.yaml` → `yarn.lock` → `package-lock.json`
3. Fallback: `npm`

The harness `detect_package_manager` in `.claude/hooks/lib/config.sh`
implements this — the skill reuses it instead of duplicating logic. If the
detector returns the wrong value, fix the input (delete the stale lockfile,
or pin via `.claude/config.json`), don't override at the workflow level.

## Setup action matrix (verified against current GitHub Actions ecosystem)

| Manager | Setup action | Why this version |
|---------|--------------|------------------|
| bun | `oven-sh/setup-bun@v2` | v2.2.0 runs on Node 24. Node 20 actions are forced off on **2026-06-02**, so v1 is end-of-life on that date. |
| pnpm | `pnpm/action-setup@v4` + `actions/setup-node@v4` | pnpm requires a separate Node setup. `cache: pnpm` enables built-in cache. |
| yarn | `actions/setup-node@v4` | `cache: yarn` covers both classic and berry. |
| npm | `actions/setup-node@v4` | `cache: npm` is the documented option. |

**Bun version pinning**: the generator emits `bun-version: latest`. To pin
to an exact version, edit the line directly — `setup-bun@v2` also reads the
`packageManager` field in `package.json` if `bun-version` is omitted, but
explicit `latest` makes the intent obvious in the workflow file.

## Install command matrix

CI must verify the lockfile, not resolve fresh. Each manager has a different
flag for that:

| Manager | Install command | Notes |
|---------|----------------|-------|
| bun | `bun install --frozen-lockfile` | Errors if `bun.lockb` would change |
| pnpm | `pnpm install --frozen-lockfile` | Errors if `pnpm-lock.yaml` would change |
| yarn | `yarn install --frozen-lockfile` | Yarn classic; for berry use `yarn install --immutable` |
| npm | `npm ci` | npm's frozen-equivalent. Faster than `npm install --no-package-lock` |

## Run command matrix

The generator uses one prefix throughout the workflow so steps stay
consistent:

| Manager | Run script via |
|---------|---------------|
| bun | `bun run <script>` |
| pnpm | `pnpm run <script>` |
| yarn | `yarn <script>` (yarn auto-recognizes script names; `yarn run <script>` also works) |
| npm | `npm run <script>` |

## Monorepo handling

When a sub-package owns the deploy (e.g. `apps/web`):

```bash
.claude/skills/cf-deploy/scripts/generate-workflow.sh --cwd apps/web
```

The generator then:

1. Probes `apps/web/package.json` for scripts (not the root)
2. Emits `defaults.run.working-directory: apps/web` so every step respects it
3. Passes `workingDirectory: apps/web` to wrangler-action explicitly (the
   action's own pwd defaults don't always match `defaults.run`)

Caveats:

- Lockfile location: still detected at `--cwd`, but the workflow runs the
  install from that directory. If you have a hoisted root lockfile (pnpm
  workspaces, bun workspaces), the detector probes the **root** for the
  manager but the install happens in `apps/web` — usually fine because the
  CLI walks up to find the lockfile. Verify by running `--dry-run` first.
- The `.github/workflows/*.yml` file always lives at the repo root,
  regardless of `--cwd`. GitHub Actions only reads workflows from
  `$REPO/.github/workflows`.

## When to override the detected manager

Almost never. Cases that justify it:

- Migration in progress (lockfiles for two managers coexist temporarily)
  → set `.claude/config.json` `packageManager` until the old lockfile is
  deleted
- A sub-package uses a different manager than the root → use `--cwd` and
  the detector will probe the sub-package independently

If you're tempted to hand-edit the rendered YAML to swap managers, you're
about to introduce drift between local and CI. Fix the source of truth
instead.
