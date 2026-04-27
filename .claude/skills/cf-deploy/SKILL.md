---
name: cf-deploy
description: |
  Generate a production-ready GitHub Actions workflow that deploys a project
  to Cloudflare Workers via the official cloudflare/wrangler-action.
  Auto-detects the package manager (bun/pnpm/yarn/npm), reads the project's
  package.json scripts to assemble the right quality gates (lint/typecheck/test)
  and build step, parameterizes branches from .claude/config.json, and writes
  the rendered YAML to .github/workflows/deploy-cloudflare-workers.yml.
  Use whenever the user asks to "set up Cloudflare Workers deployment",
  "add a Cloudflare deploy workflow", "create a wrangler GitHub Action",
  "deploy this project to Workers from GitHub", or any phrasing about a
  CI/CD pipeline targeting Cloudflare Workers — even when they don't say
  the word "skill". Do not use this skill for Cloudflare Pages, Vercel,
  Netlify, or other platforms.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Cloudflare Workers Deploy

Generate a `.github/workflows/deploy-cloudflare-workers.yml` that mirrors the
project's local quality gates and deploys to Cloudflare Workers using
`cloudflare/wrangler-action@v3`.

The skill is **detection-driven**: it never asks the user which package
manager to use, because lockfiles and `.claude/config.json` already answer that
question. Manual configuration only enters when the project is missing
something the workflow needs (e.g. no `wrangler.toml`).

---

## When to invoke

- User asks for Cloudflare Workers deployment automation
- User shares a wrangler config and wants CI/CD around it
- User says "deploy on push to main/development", "wrangler GitHub Action",
  "Workers CI", and similar
- Project has a `wrangler.toml`/`wrangler.jsonc`/`wrangler.json` but no
  `.github/workflows/*.yml` referencing `cloudflare/wrangler-action`

**Do not invoke** for: Cloudflare Pages, R2-only deploys, Vercel/Netlify,
local-only `wrangler dev`, or "explain wrangler" (documentation requests).

---

## Execution flow

Follow these steps **in order**. The token-heavy parts (project probing,
YAML rendering) run as scripts so the conversation stays focused on
decisions, not templating.

### Step 1 — Detect project layout

Run the detector to gather every fact the renderer needs in one shot:

```bash
.claude/skills/cf-deploy/scripts/detect-project.sh
```

If the project deploys from a sub-package (monorepo), pass `--cwd
apps/web` (or the appropriate path). The detector:

- Reuses the harness's `detect_package_manager` (`.claude/hooks/lib/config.sh`)
  so manual `packageManager` overrides in `.claude/config.json` are honored
- Probes `package.json` scripts for `lint`, `typecheck`, `test`, `build`
- Reads `productionBranch` / `integrationBranch` from `.claude/config.json`
  (defaults: `main` / `development`)
- Detects React Router framework dependency (relevant for the `_redirects`
  cleanup step — see references/cloudflare-workers.md)
- Detects whether `wrangler.toml`/`wrangler.jsonc`/`wrangler.json` exists

The detector emits one JSON object — read it and confirm the values look
right before generating. If any field is wrong (e.g. wrong package manager
because of a stray lockfile), fix the cause (delete the stale lockfile, or
set `packageManager` in `.claude/config.json`) rather than overriding the
output by hand.

### Step 2 — Confirm prerequisites with the user

The workflow will fail at runtime without these. Ask the user to confirm or
set them up before generating:

1. **GitHub Secrets** at `Settings → Secrets and variables → Actions`:
   - `CLOUDFLARE_API_TOKEN` — Workers-scoped token (Cloudflare Dashboard →
     My Profile → API Tokens → Create Token → "Edit Cloudflare Workers"
     template)
   - `CLOUDFLARE_ACCOUNT_ID` — Cloudflare Dashboard → Workers & Pages →
     right sidebar
2. **`wrangler.toml`** with `[env.staging]` and `[env.production]` sections
   defined. Worker names will be `{name}-{env}` after deploy. See
   [references/cloudflare-workers.md](references/cloudflare-workers.md) for
   the minimal schema.
3. **Worker secrets** for each environment (set via `wrangler secret put
   <NAME> --env <env>` or in the Cloudflare Dashboard) — these are NOT in
   GitHub Secrets, they live in Cloudflare. See
   [references/cloudflare-workers.md](references/cloudflare-workers.md).

If `wrangler_config_kind == "none"` in the detector output, **stop and ask
the user** whether they want a starter `wrangler.toml`. Generating a deploy
workflow with no wrangler config would fail on the first run. The starter
template lives in
[references/cloudflare-workers.md](references/cloudflare-workers.md#starter-wranglertoml)
— copy it to the project root, replace placeholder IDs, then continue.

### Step 2.5 — Auto-install missing prereqs

If the detector reports `has_wrangler_dep == false` or `has_cf_typegen ==
false`, run the install-prereqs script. **Do not** print install commands
to the user and ask them to run it themselves — the skill resolves it
directly using the detected package manager:

```bash
.claude/skills/cf-deploy/scripts/install-prereqs.sh
```

What the script does (idempotent — safe to re-run):

1. **`has_wrangler_dep == false`** → installs `wrangler` as a devDependency
   via the detected package manager (`bun add -d wrangler` / `pnpm add -D
   wrangler` / `yarn add -D wrangler` / `npm install -D wrangler`).
2. **`has_cf_typegen == false`** → patches `package.json` via `jq` to add
   `"cf:typegen": "wrangler types"` to `scripts`.
3. Both already present → no-op.

After it finishes, the next `detect-project.sh` run will report both as
`true`, and the generator will emit the `Generate Cloudflare types` step
before `Typecheck`.

For monorepos, pass `--cwd apps/web` so install runs inside the right
package directory. Use `--dry-run` first if you want to see the commands
without executing them.

### Step 3 — Render and write the workflow

```bash
.claude/skills/cf-deploy/scripts/generate-workflow.sh
```

Optional flags:

| Flag | Purpose |
|------|---------|
| `--cwd apps/web` | Sub-package working directory (monorepo). Sets `defaults.run.working-directory` and passes `workingDirectory` to wrangler-action |
| `--output <path>` | Override output path (default: `.github/workflows/deploy-cloudflare-workers.yml` at repo root) |
| `--dry-run` | Print the rendered YAML to stdout without writing |

Always run `--dry-run` first if the user wants to review before commit.

### Step 4 — Verify

After writing, do these three checks:

1. **YAML syntax** — `bunx yaml-lint .github/workflows/deploy-cloudflare-workers.yml`
   or open in an editor with YAML LSP
2. **Branch alignment** — confirm `on.push.branches` matches the project's
   protected branches (the script reads `.claude/config.json`, but a stale
   config drifts silently)
3. **Quality gates present** — every script the detector reported as
   present (`lint`, `typecheck`, `test`, `build`) should appear as a step.
   If a step is missing, the script in `package.json` was probably removed
   between detect and write — re-run detect and regenerate.

### Step 5 — Commit per harness PR-only policy

This change creates a CI configuration file, which falls under
`.github/workflows/**` — not docs, not chore. Treat as `chore/*` per the
project's branch-type carve-out (the workflow file isn't behavioral source
code), but a PR is still mandatory:

```
chore/add-cloudflare-deploy-workflow → PR → squash merge
```

Do NOT push directly to `development` or `main` — see CLAUDE.md
§Git Integration.

---

## Reference documents

Load only the reference relevant to the question at hand. Do not preload all
references — that defeats the progressive-disclosure design.

| Reference | Read when |
|-----------|-----------|
| [references/cloudflare-workers.md](references/cloudflare-workers.md) | wrangler-action params, multi-env strategy, secrets vs. vars distinction, `wrangler.toml` schema, React Router `_redirects` gotcha |
| [references/package-managers.md](references/package-managers.md) | Choosing setup-* action, install command flags, lockfile-frozen requirement, monorepo handling |
| [references/harness-integration.md](references/harness-integration.md) | Which local hooks have CI parallels, why we don't run hooks themselves in CI, branch policy alignment |
| [references/action-versions.md](references/action-versions.md) | Pinned versions and the rationale (Node 20 deprecation 2026-06-02, etc.) |

---

## Decisions baked into the generator

These choices come from the cross-validation phase. Override only with a
documented reason — the rationale lives in [references/](references/).

- **`actions/checkout@v4`** — broadest compatibility, still maintained.
  Bump to `@v6` only if the runner pins Node 24+ and you don't need to
  support older self-hosted runners.
- **`oven-sh/setup-bun@v2`** — required for Node 24 runtime (forced
  2026-06-02). v1 is end-of-life on that date.
- **`cloudflare/wrangler-action@v3`** — the `v` prefix is mandatory; bare
  `@3.x.x` no longer resolves.
- **`packageManager` passed explicitly to wrangler-action** — the action
  re-detects via lockfile by default, but explicit pinning prevents drift
  when a bot adds a stray `package-lock.json`.
- **`--frozen-lockfile` (or `npm ci`)** — CI must verify the lockfile, not
  resolve fresh. The detector picks the right flag per package manager.
- **No `Co-Authored-By` in commits** — cc-ecosystem convention; the
  workflow itself doesn't commit anything, but the PR creating it must
  follow this rule.

---

## Common edits after generation

If the user later asks for a tweak, prefer **regenerating** over hand-editing
unless the change is one of:

- **Pinning a specific Bun version** instead of `latest` — change the
  `bun-version` line directly.
- **Adding a `preCommands` / `postCommands` step** to wrangler-action — add
  it directly. These are user-specific and not worth modeling in the
  detector.
- **Renaming the workflow file** — just `mv` it; the content is portable.

For anything else (added test step, new branch, sub-package move),
regenerate via `generate-workflow.sh` so the file stays consistent with
project state.
