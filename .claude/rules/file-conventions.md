---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# File Naming & Creation Conventions

## File Naming Convention (React Router Framework — only applies to React Router projects) [CRITICAL]

> **Scope**: The `*.client.ts(x)` / `*.server.ts(x)` split is a React Router Framework convention. It does NOT apply to Expo, React Native, NestJS, or Next.js App Router projects (Next.js has its own `"use client"` directive and RSC file conventions). Skip this section on non-React-Router projects.

- `*.client.ts` / `*.client.tsx` → **Client-side ONLY** (browser execution)
- `*.server.ts` / `*.server.tsx` → **Server-side ONLY** (SSR execution)

**CRITICAL WARNING**:
Files with `.client.ts` suffix are EXCLUDED from server bundles.
If you name a server-side utility `something.client.ts`, it will be bundled as `void 0` and cause runtime errors like `X is not a function`.

**Correct naming**:
- `notion-client.ts` — Hyphen, not dot before "client"
- `notion.service.ts` — Different suffix
- `notion.client.ts` — Treated as client-only, causes SSR errors

## File Creation Rules (CA Layer Mapping)
| Pattern | CA Layer | Rule |
|---------|----------|------|
| `*.entity.ts` | Domain | Entity classes (no external deps) |
| `*.vo.ts` | Domain | Value Objects (immutable, no external deps) |
| `*.schema.ts` (under `**/domain/**`) | Domain | Zod validation schemas |
| `*.schema.ts` (under `**/infrastructure/database/schema/**`) | Infrastructure | Drizzle ORM table definitions |
| `*.service.ts` | Application | Business logic services |
| `**/*.port.ts` | Application | Interface definitions (Port) |
| `*.mapper.ts` | Application | Entity ↔ DTO conversion |
| `*.repository.ts` | Infrastructure | Repository implementations |
| `*.client.ts(x)` | — | **CLIENT-SIDE ONLY** — excluded from SSR bundle |
| `*.server.ts(x)` | — | **SERVER-SIDE ONLY** — not available in browser |
| `*.d.ts` | — | Type declarations only |
| `**/types.ts` | — | Type definitions only |
| `**/index.ts` | — | Barrel files (re-exports) |
