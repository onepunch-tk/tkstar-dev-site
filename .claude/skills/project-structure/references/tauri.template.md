# Tauri 2 — Structure Reference

> This document is a **reference guide** used by
> `project-structure-generator` when filling the JSON input for a Tauri 2
> (Rust + Frontend hybrid) project.

---

## Framework identification

- **Framework value**: `tauri`
- **Detection**:
  - `src-tauri/` directory present
  - `src-tauri/Cargo.toml` + `src-tauri/tauri.conf.json`
  - `package.json` `dependencies` or `devDependencies` includes
    `@tauri-apps/api`
- **Variants (user confirmation required)**:
  - `rust-only` — Rust backend only, no frontend (rare but possible)
  - `react+rust` — frontend under `src/` is React-based (Vite, React
    Router, etc. — run a secondary framework detection on `src/`)
  - `vue+rust`, `svelte+rust` etc. — record the frontend framework name
    in the variant string
  - `mobile-enabled` — `src-tauri/gen/apple/` or `gen/android/` present
    (Tauri 2 mobile target). Append as a supplementary variant marker

---

## Standard directory tree — single-package (skeleton)

```tree
.
├── src/                            # Frontend (React / Vue / Svelte etc.)
│   └── ...                         # depends on the frontend framework
├── src-tauri/                      # Rust backend
│   ├── src/
│   │   ├── domain/                 # Pure Rust (no tauri::*, no serde_derive)
│   │   ├── application/            # Use case, port (trait), DTO
│   │   ├── infrastructure/         # Repository impls, DB / HTTP, OS APIs
│   │   ├── presentation/
│   │   │   ├── commands/           # IPC command function groups (Tauri command attribute)
│   │   │   └── state.rs            # tauri::State<T> global state
│   │   ├── lib.rs                  # Mobile entry + invoke_handler registration
│   │   └── main.rs                 # Desktop entry, calls lib::run() only
│   ├── capabilities/               # IPC capability files
│   ├── icons/
│   ├── gen/                        # ⚠️ cargo-mobile2 generated (linter excludes)
│   │   ├── apple/                  # iOS Xcode project
│   │   └── android/                # Android Gradle project
│   ├── tauri.conf.json
│   └── Cargo.toml
└── package.json
```

> In a monorepo, the layout may instead be `apps/desktop/src-tauri/` +
> `apps/desktop/src/`, or the frontend may live in a separate sub-package
> like `apps/web/`. Record what actually exists in `directory_tree`.

---

## CA layer mapping (JSON `layers[]`)

> A Tauri project's CA layers refer to the **Rust backend
> (`src-tauri/src/`)**. The frontend (`src/`) has its own CA mapping from
> the frontend framework. In a monorepo where the frontend lives in a
> separate sub-package, that sub-package is registered with its own
> `framework` value (`react-router` / `expo` etc.).

| Layer | Standard path | `role_ko` (Korean output) | `contains_ko` (Korean output) |
|---|---|---|---|
| Domain | `src-tauri/src/domain/` | 순수 Rust 비즈니스 규칙 (`tauri::*`, `serde_derive` 의존 금지) | 엔티티 struct, 값 객체, 도메인 오류 enum, repository trait |
| Application | `src-tauri/src/application/` | Use case 와 외부 시스템 port (trait) 정의 | UseCase struct, Port trait, DTO, Mapper |
| Infrastructure | `src-tauri/src/infrastructure/` | DB / HTTP / OS API 구현 | Repository 구현, HTTP/DB client, OS adapter |
| Presentation | `src-tauri/src/presentation/` | IPC controller (`#[tauri::command]`), 전역 상태 | Command 함수 그룹, `tauri::State<T>` 정의 |

### IPC command layer

Functions marked with the `#[tauri::command]` attribute live in the
**Presentation** layer. Their responsibilities:

- input/output DTO ↔ JSON serialization (handled by the macro)
- capability-based permission enforcement
- invoke an application use case and map the result

Domain logic must NOT live inside a command body — extract it into a use
case.

### lib.rs / main.rs

- `src-tauri/src/lib.rs` — mobile entry point
  (`#[cfg_attr(mobile, tauri::mobile_entry_point)]`), registers
  `invoke_handler`, injects global state via `manage()`. Bootstrap only →
  TDD-exempt.
- `src-tauri/src/main.rs` — desktop entry. Only calls `lib::run()`.
  Bootstrap only → TDD-exempt.

---

## Path alias conventions

### Rust (Cargo workspace)
Rust has no path-alias mechanism on its own. The `src-tauri/Cargo.toml`
`[workspace]` or `[dependencies]` defines the dependency graph. **Do NOT
include Rust dependencies in `path_aliases[]`** — only frontend
`tsconfig` aliases (if any) go there.

### Frontend (TypeScript)
Follow the aliases defined by the frontend framework's `tsconfig`. Common
pattern:

| Alias | Resolves to |
|---|---|
| `~/*` | `./src/*` |

---

## Framework-specific extras candidates

### Tauri directory roles

| Directory | Role | Notes |
|---|---|---|
| `src-tauri/capabilities/` | IPC capability permission files | always present; central to the security model |
| `src-tauri/icons/` | App icons | output of `tauri icon` |
| `src-tauri/gen/apple/` | iOS Xcode project | cargo-mobile2 generated; **linter excludes** |
| `src-tauri/gen/android/` | Android Gradle project | cargo-mobile2 generated; **linter excludes** |
| `src-tauri/tauri.conf.json` | Tauri main configuration | bundleId, devUrl, distDir etc. |

### IPC security models

- Brownfield (default) — prioritizes compatibility with existing web
  frontend projects
- Isolation — place a separate isolation script under `dist-isolation/`
- Capability files give fine-grained capability-based access control

### Multi-target builds

- Desktop: `tauri build` (macOS / Windows / Linux)
- Mobile: `tauri ios build`, `tauri android build` (Tauri 2+,
  cargo-mobile2 required)
- `lib.rs` is the mobile binary entry point (`main.rs` is desktop only)

---

## File location summary candidates

| Task (Korean output) | Location |
|---|---|
| 새 IPC command | `src-tauri/src/presentation/commands/{group}.rs` |
| Use case 추가 | `src-tauri/src/application/{도메인}/` |
| Repository 구현 | `src-tauri/src/infrastructure/{도메인}/` |
| Repository trait (port) | `src-tauri/src/domain/{도메인}/` |
| 도메인 엔티티/VO | `src-tauri/src/domain/{도메인}/` |
| OS / 파일시스템 어댑터 | `src-tauri/src/infrastructure/platform/` |
| 전역 상태 (DI) | `src-tauri/src/presentation/state.rs` |
| 권한 capability | `src-tauri/capabilities/<name>.json` |
| 아이콘 추가 | `src-tauri/icons/` |
| Frontend 변경 | `src/` (해당 frontend framework 규칙 적용) |
| Rust 단위 테스트 | 모듈 내 `#[cfg(test)] mod tests` 또는 `tests/` (integration) |
| Frontend 단위 테스트 | frontend framework 규칙에 따름 |

---

## Scope discipline (do NOT include)

- `#[tauri::command]` function bodies, use case Rust code, Cargo.toml
  dependency lists — code / dependencies belong elsewhere
- Domain entity / data model definitions (PRD §7 area)
- IPC API specs (request/response params, error codes etc.) — PRD
  `endpoint_specs` area
- Tauri / Rust version recommendations (PRD `tech_stack` area)
- Mobile / desktop build command guides
