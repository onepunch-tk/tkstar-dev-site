---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.rs"
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

## File Creation Rules — Tauri Rust (CA Layer Mapping)

> **Scope**: applies only to Rust files under `src-tauri/src/**`. Follow
> the Rust convention: snake_case + `.rs` extension.

| Pattern | CA Layer | Rule |
|---------|----------|------|
| `**/src-tauri/src/domain/**/*_entity.rs` | Domain | Pure Rust struct; no dependency on `tauri::*` or `serde_derive` |
| `**/src-tauri/src/domain/**/*_vo.rs` | Domain | Value objects (immutable) |
| `**/src-tauri/src/domain/**/errors.rs` | Domain | Domain error enum (thiserror etc. allowed; no `tauri::*`) |
| `**/src-tauri/src/application/**/*_use_case.rs` | Application | Use case implementation |
| `**/src-tauri/src/application/**/*_port.rs` | Application | `trait` definitions (interface / repository contract) |
| `**/src-tauri/src/application/**/*_dto.rs` | Application | DTO struct |
| `**/src-tauri/src/infrastructure/**/*_repository.rs` | Infrastructure | Implementation of domain ports (DB, HTTP, file system) |
| `**/src-tauri/src/infrastructure/**/*_client.rs` | Infrastructure | External API clients |
| `**/src-tauri/src/infrastructure/**/*_adapter.rs` | Infrastructure | OS / native adapters |
| `**/src-tauri/src/presentation/commands/*.rs` | Presentation | `#[tauri::command]` function groups (IPC controllers) |
| `**/src-tauri/src/presentation/state.rs` | Presentation | Globally managed state via `tauri::State<T>` |
| `**/src-tauri/src/lib.rs` | — | Mobile entry + `invoke_handler` registration + `manage()` (bootstrap only) |
| `**/src-tauri/src/main.rs` | — | Desktop entry, only calls `lib::run()` (bootstrap only) |
