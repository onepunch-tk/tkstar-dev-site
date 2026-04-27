# Cloudflare Workers — wrangler-action and environment strategy

Sources cross-checked at skill creation time:
- [`cloudflare/wrangler-action` README](https://github.com/cloudflare/wrangler-action/blob/main/README.md)
- [Workers CI/CD: GitHub Actions](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/)
- [Wrangler environments](https://developers.cloudflare.com/workers/wrangler/environments/)

## wrangler-action@v3 inputs (verified)

| Input | Required | Purpose |
|-------|----------|---------|
| `apiToken` | yes | Cloudflare API token (Workers-scoped). Pass via `${{ secrets.CLOUDFLARE_API_TOKEN }}` — never commit. |
| `accountId` | recommended | Cloudflare account ID. Pass via `${{ secrets.CLOUDFLARE_ACCOUNT_ID }}`. |
| `command` | yes for deploy | The wrangler command to run. For multi-env: `deploy --env ${{ env.DEPLOY_ENV }}`. |
| `packageManager` | optional | One of `npm`, `yarn`, `pnpm`, `bun`. The action auto-detects from the lockfile, but pinning is safer in CI. |
| `workingDirectory` | optional | Sub-package path for monorepos. The generator sets this when `--cwd` is passed. |
| `wranglerVersion` | optional | npm-version-style pin (e.g. `"4"`, `"^4.0.0"`). Omit to use the project's installed `wrangler` from `package.json`. |
| `secrets` | optional | Newline-separated env var names. The action then runs `wrangler secret put <NAME>` for each, reading the value from `env`. |
| `vars` | optional | Newline-separated env var names exposed as plain (non-secret) `[vars]` to the worker at deploy. |
| `environment` | optional | Sets `--env` for the secrets/vars upload steps. Mostly redundant when `command` already includes `--env`. |
| `preCommands` / `postCommands` | optional | Multiline shell to run before/after the main command. |

### Required `permissions` block

```yaml
permissions:
  contents: read
  deployments: write
```

`deployments: write` is required because wrangler-action publishes a GitHub
deployment record per run.

## Multi-environment strategy

`wrangler.toml` defines per-env overrides under `[env.<name>]`:

```toml
name = "my-worker"
main = "src/index.ts"
compatibility_date = "2025-11-01"

[vars]
ENVIRONMENT = "dev"

[env.staging]
[env.staging.vars]
ENVIRONMENT = "staging"

[env.production]
[env.production.vars]
ENVIRONMENT = "production"
```

After `wrangler deploy --env staging`, the worker appears in the dashboard
as `my-worker-staging`. Production: `my-worker-production`.

## Starter `wrangler.toml`

Copy this to the project root when `wrangler_config_kind == "none"`. It
covers the common Workers SSR + assets + (optional) bindings setup. Replace
`my-worker`, the `main` entry path, and the placeholder IDs after running
the `wrangler kv namespace create` / `wrangler d1 create` commands shown
inline.

```toml
name = "my-worker"
main = "./workers/app.ts"
compatibility_date = "2025-04-04"
compatibility_flags = ["nodejs_compat"]

# Workers Observability (logs, metrics, traces in the Cloudflare Dashboard).
# Free up to a fairly generous quota; turn off if you have a custom pipeline.
[observability]
enabled = true

# Per-environment overrides. Keep them empty when no env-specific binding
# differs — the [env.X] header alone is what makes `--env X` valid. Bindings
# (vars, kv, d1) DO NOT inherit from the top level; redeclare under each env
# block if they should apply there.
[env.production]

[env.staging]

# Source maps uploaded with the worker so stack traces in the Dashboard show
# original TS line numbers. Slight build-size cost; recommended for staging
# at minimum.
upload_source_maps = true

# Static assets (SPA shell, images, fonts). The binding name `ASSETS` is the
# convention React Router 7 / Hono / starter templates use; rename only if
# your handler imports a different binding.
[assets]
directory = "./public/"
binding = "ASSETS"

# ============================================
# Cloudflare Bindings (uncomment as needed)
# ============================================

# KV Namespace
# 1. Run: bunx wrangler kv namespace create INVOICE_CACHE
# 2. Copy the ID from output and replace PLACEHOLDER below
# 3. For preview: bunx wrangler kv namespace create INVOICE_CACHE --preview
# [[kv_namespaces]]
# binding = "INVOICE_CACHE"
# id = "PLACEHOLDER_RUN_WRANGLER_KV_CREATE"
# preview_id = "PLACEHOLDER_RUN_WRANGLER_KV_CREATE_PREVIEW"

# D1 Database
# bunx wrangler d1 create <NAME>, then paste database_id below
# [[d1_databases]]
# binding = "DB"
# database_name = "<DATABASE_NAME>"
# database_id = "<DATABASE_ID>"
```

Replace `bunx` with `pnpm dlx` / `npx` per the project's package manager.
After every `[[kv_namespaces]]` or `[[d1_databases]]` change, regenerate
the Bindings interface so TypeScript sees the new binding:

```bash
<pm> run cf:typegen      # = wrangler types
```

`cf:typegen` writes `worker-configuration.d.ts` at the project root. Add
it to `.gitignore` (it is regenerated per checkout) and to CI before
typecheck — the generated workflow already does this when the script is
present in `package.json`.

**Important inheritance rule**: top-level `vars`, `kv_namespaces`, `d1_databases`,
etc. do NOT inherit into `[env.*]`. You must repeat them under each env block
if they should apply. Verify in the Cloudflare Dashboard after first deploy.

## Secrets, vars, and `wrangler secret put`

There are three places "environment variables" can live, and they behave
differently:

| Where | Visibility | How to set | When to use |
|-------|------------|------------|-------------|
| `wrangler.toml` `[env.X.vars]` | Public, in the binary | Edit the toml, redeploy | Non-secret config (`ENVIRONMENT`, `BASE_URL`) |
| Cloudflare Worker secrets | Encrypted at rest, decrypted at runtime | `wrangler secret put NAME --env X` (interactive) OR Cloudflare Dashboard OR wrangler-action `secrets:` input | Anything sensitive: `DATABASE_URL`, OAuth client secrets, API keys |
| GitHub Actions secrets | Encrypted, only visible to workflow | Repo Settings → Secrets and variables → Actions | Cloudflare API token + account ID + anything you forward to `wrangler-action`'s `secrets:` input |

`VITE_*` and other build-time env vars are **inlined at build**, so they
should be set in GitHub Actions secrets and passed via the `Build` step's
`env:` block — not Cloudflare's runtime secrets.

## React Router 7 gotcha — `_redirects`

React Router 7 framework mode emits a `_redirects` file during `build`,
intended for Cloudflare Pages static-routing semantics. On Workers (SSR),
this file:

1. Is unnecessary — the worker handles all routing
2. Causes an infinite redirect loop if served

The generator detects React Router via `dependencies` / `devDependencies`
in `package.json` and adds:

```yaml
- name: Remove _redirects (Workers SSR doesn't need it)
  run: |
    find build public -name "_redirects" -type f -delete 2>/dev/null || true
```

Note `-type f -delete` (not `-tyiles` or other corruptions in some
example YAMLs floating around).

## API token scope

Use the **"Edit Cloudflare Workers"** template (Dashboard → My Profile →
API Tokens → Create Token). Required permissions:

- Account → Workers Scripts → Edit
- Account → Account Settings → Read
- Zone → Workers Routes → Edit (only if your worker uses custom domains)

Never use a global API key; never grant zone:Read on all zones unless
necessary.
