# Pinned action versions — what and why

All versions reflect cross-validated state at skill creation. When upgrading,
update this file in the same PR so the rationale stays current.

## `actions/checkout@v4`

- **Latest available**: v6.0.1 (Nov 2025)
- **Why we pin v4**: broadest compatibility — works on every supported runner
  including older self-hosted Node 20 runners. v4 is still actively maintained
  for security fixes.
- **When to bump to v6**: after 2026-06-02 (Node 20 actions are forced off
  the platform), if you control all your runners and they're on Node 24+.
  v6 also moves git credentials from `.git/config` into `$RUNNER_TEMP` for
  better isolation.
- **Source**: https://github.com/actions/checkout/releases

## `oven-sh/setup-bun@v2`

- **Latest available**: v2.2.0 (Mar 2026)
- **Why v2**: v2.2.0 runs on Node 24, which is required after the
  **2026-06-02** Node 20 deprecation deadline. v1 will stop working on
  that date.
- **`bun-version: latest`**: the generator emits this. The action also
  reads `packageManager` / `engines.bun` in `package.json` if `bun-version`
  is omitted, but explicit `latest` documents intent in the workflow.
- **Source**: https://github.com/oven-sh/setup-bun

## `cloudflare/wrangler-action@v3`

- **Why v3**: current stable major. v2 is unmaintained.
- **`v` prefix is mandatory**: bare `@3.x.x` no longer resolves — the action
  rejects pre-v3 syntax. Use `@v3`, `@v3.x`, or `@v3.x.x`.
- **`packageManager` input**: explicitly set by the generator to match the
  detector's output. The action would auto-detect via lockfile, but a stray
  lockfile (e.g. dependabot adds `package-lock.json` to a bun project)
  would silently switch managers. Explicit > implicit here.
- **Source**: https://github.com/cloudflare/wrangler-action

## `pnpm/action-setup@v4`

- Used only when `packageManager == pnpm`. Combined with
  `actions/setup-node@v4 cache: pnpm` for built-in dependency caching.
- **Source**: https://github.com/pnpm/action-setup

## `actions/setup-node@v4`

- Used for pnpm/yarn/npm projects (not bun — bun has its own runtime).
- `node-version: lts/*` resolves to the current Node LTS at workflow run
  time. If you need a specific version (e.g. for a native dependency),
  pin it directly: `node-version: '20.18.0'`.
- **Source**: https://github.com/actions/setup-node

## Upgrade discipline

When a major version is released for any of these:

1. Read the changelog in full — don't skim
2. Test on a non-production branch first via `workflow_dispatch`
3. Update this file and the generator script in the **same PR**
4. Regenerate any existing deploy workflows in the project after merge

Never bump silently — pinning these versions is one of the cheapest forms
of supply-chain hygiene.
