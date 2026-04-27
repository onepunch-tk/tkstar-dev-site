# tkstar-dev

React Router 7 (Framework mode, SSR) + Cloudflare Workers.

## Stack

- **Runtime**: Cloudflare Workers (`wrangler`)
- **Framework**: React Router 7 (`@react-router/dev` 7.14.0, `ssr: true`)
- **Build**: Vite 8 + Tailwind v4
- **Lang/Tooling**: TypeScript, Biome, Bun
- **Tests**: Vitest 4 + @testing-library/react + jsdom

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | RR dev server (HMR) |
| `bun run build` | Production build (`build/client`, `build/server`) |
| `bun run typecheck` | RR typegen + `tsc` |
| `bun run lint` / `bun run format` / `bun run check` | Biome |
| `bun run test` / `bun run test:watch` | Vitest |
| `bun run cf:typegen` | Generate `worker-configuration.d.ts` from `wrangler.toml` |

## Deploy

CI: `.github/workflows/deploy-cloudflare-workers.yml` deploys via Wrangler.
Worker entry: `workers/app.ts` (referenced by `wrangler.toml`, **TODO: create**).
