# React Router Framework — Structure Reference

> This document is a **reference guide** used by
> `project-structure-generator` when filling the JSON input for a React
> Router Framework v7+ project. The actual PROJECT-STRUCTURE.md body is
> rendered by the Python script from a single unified template — this
> file is **not** a placeholder template to be filled directly.

---

## Framework identification

- **Framework value**: `react-router`
- **Detection**: `react-router.config.ts` (or `.js`) present, or
  `dependencies` includes `react-router` / `@react-router/*`
- **Variants**: none

---

## Standard directory tree (skeleton)

```tree
.
├── app/
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   │   └── config/                 # DI composition root
│   ├── presentation/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── routes/
│   │   └── lib/
│   ├── root.tsx                    # Root component + providers
│   ├── routes.ts                   # Route definitions
│   ├── entry.server.tsx            # SSR entry
│   ├── app.css
│   └── env.d.ts
├── adapters/                       # Platform adapters (optional)
│   ├── cloudflare/
│   ├── express/
│   └── shared/
├── server/                         # Node server entry (optional)
├── workers/                        # Cloudflare Workers entry (optional)
├── public/
└── test/                           # Shared fixtures / helpers (unit tests co-located)
```

> Real projects may omit some directories (e.g. no `workers/`). Write the
> JSON `directory_tree` from what actually exists on disk.

---

## CA layer mapping (JSON `layers[]`)

| Layer | Standard path | `role_ko` (Korean output) | `contains_ko` (Korean output) |
|---|---|---|---|
| Domain | `app/domain/` | 비즈니스 규칙과 엔티티 정의 (외부 의존 0) | 엔티티, 값 객체, Zod 스키마, 도메인 오류 |
| Application | `app/application/` | Use case 와 외부 시스템 인터페이스(port) 정의 | Service, Port, Mapper, DTO |
| Infrastructure | `app/infrastructure/` | 외부 시스템 통합 및 구현 | DI 컨테이너, ORM/DB 구현, 외부 API 클라이언트 |
| Presentation | `app/presentation/` | UI, 라우팅, HTTP 표면 | 컴포넌트, 훅, 라우트, 미들웨어 |

> The `role_ko` / `contains_ko` columns above are **example values** for
> the Korean output body. Use them as a baseline and adjust to the actual
> project context.

---

## Path alias conventions

Default pattern (`tsconfig.app.json` or `tsconfig.json`):

| Alias | Resolves to |
|---|---|
| `~/*` | `./app/*` |

Collect every alias declared in `tsconfig*.json` into `path_aliases[]`.

---

## Framework-specific extras candidates

These are candidate entries for `framework_extras[]`. Include only the
conventions actually adopted by the project.

### Route file naming

- `_layout.tsx` — layout wrapper
- `_index.tsx` — index route
- `$param.tsx` — dynamic segment
- `route.tsx` — folder-level route component

### `*.client.ts(x)` / `*.server.ts(x)` split

- `*.client.ts(x)` — client-only (excluded from SSR bundle)
- `*.server.ts(x)` — server-only (excluded from client bundle)
- Mis-naming causes SSR runtime errors (`X is not a function`)

### app/ root files

- `root.tsx` — provider / ThemeProvider mount point
- `routes.ts` — route tree declaration
- `entry.server.tsx` — SSR customization

### Platform adapters

- `adapters/cloudflare/`, `adapters/express/`, `adapters/fastify/` — per-
  deployment adapter. Lives outside the CA layers.
- `adapters/shared/` — context, env consolidation

---

## File location summary candidates

| Task (Korean output) | Location |
|---|---|
| 새 페이지 추가 | `app/presentation/routes/` |
| UI 컴포넌트 추가 | `app/presentation/components/` |
| 비즈니스 로직 추가 | `app/application/{도메인}/` |
| DB 스키마 추가 | `app/infrastructure/persistence/schema/` |
| 외부 API 통합 추가 | `app/infrastructure/external/` |
| 엔티티/타입 정의 | `app/domain/{도메인}/` |
| 단위 테스트 | 소스와 동일 위치의 `__tests__/` |
| 정적 자산 | `public/` |

---

## Scope discipline (do NOT include)

The PROJECT-STRUCTURE.md body must not include the following (Python
`[REJECT]`):

- Entity / domain model definitions (PRD §7 area)
- Feature descriptions, business logic, user flows (PRD §3·§4)
- TypeScript code examples / implementation snippets
- Library recommendations, NFR figures (PRD `tech_stack` / `nfr`)

Move any such content into PRD or task files.
