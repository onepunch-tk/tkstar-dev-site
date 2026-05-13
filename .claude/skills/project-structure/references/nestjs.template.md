# NestJS — Structure Reference

> This document is a **reference guide** used by
> `project-structure-generator` when filling the JSON input for a NestJS
> project.

---

## Framework identification

- **Framework value**: `nestjs`
- **Detection**: `nest-cli.json` present, or `dependencies` includes
  `@nestjs/core`

### Variants (user confirmation required)

| Variant | Structure | Recommended for |
|---|---|---|
| **layer-first** | `src/{domain,application,infrastructure,presentation}/` at the top level | CA purity first, large projects, multiple bounded contexts |
| **module-first** | `src/modules/{feature}/{domain,application,infrastructure}/` | NestJS CLI usage, feature cohesion, small/medium projects |

> Variant can be inferred from the presence of `src/modules/<name>/`, but
> the detection result is **always** confirmed by the user (Pass 1
> `pending_questions`). Record `"layer-first"` or `"module-first"` in the
> JSON `framework_variant`.

---

## Standard directory tree — layer-first (skeleton)

```tree
.
├── src/
│   ├── domain/
│   │   ├── {bounded-context}/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── repository.interface.ts
│   │   │   └── errors/
│   │   └── shared/
│   ├── application/
│   │   ├── commands/
│   │   ├── queries/
│   │   ├── services/
│   │   ├── dtos/
│   │   ├── mappers/
│   │   └── ports/
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── repositories/
│   │   │   └── entities/           # TypeORM / Drizzle etc.
│   │   ├── external/
│   │   ├── config/
│   │   ├── auth/
│   │   └── messaging/
│   ├── presentation/
│   │   ├── controllers/
│   │   ├── resolvers/              # GraphQL (optional)
│   │   ├── gateways/               # WebSocket (optional)
│   │   ├── guards/
│   │   ├── interceptors/
│   │   ├── pipes/
│   │   ├── filters/
│   │   ├── decorators/
│   │   └── middleware/
│   ├── modules/                    # Module registration hub
│   │   ├── app.module.ts
│   │   └── {feature}.module.ts
│   └── main.ts                     # Bootstrap
├── test/                           # E2E / integration
└── dist/                           # Build artifact
```

## Standard directory tree — module-first (skeleton)

```tree
.
├── src/
│   ├── modules/
│   │   └── {feature}/
│   │       ├── domain/
│   │       ├── application/
│   │       ├── infrastructure/
│   │       ├── presentation/
│   │       └── {feature}.module.ts
│   ├── shared/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── main.ts
└── test/
```

---

## CA layer mapping (JSON `layers[]`)

| Layer | Standard path (layer-first) | Standard path (module-first) | `role_ko` (Korean output) | `contains_ko` (Korean output) |
|---|---|---|---|---|
| Domain | `src/domain/` | `src/modules/*/domain/`, `src/shared/domain/` | 순수 비즈니스 규칙 (NestJS 의존 0) | 엔티티, 값 객체, 리포지토리 인터페이스, 도메인 오류 |
| Application | `src/application/` | `src/modules/*/application/` | Use case, 외부 시스템 port. `@Injectable()` 만 허용 | Command, Query, Service, Port, DTO, Mapper |
| Infrastructure | `src/infrastructure/` | `src/modules/*/infrastructure/` | 외부 시스템 통합 (NestJS 전체 기능 허용) | Repository 구현, 외부 API, Auth, 메시지 큐 |
| Presentation | `src/presentation/` | `src/modules/*/presentation/` | HTTP / WebSocket / GraphQL 표면 | Controller, Resolver, Gateway, Guard, Filter, Pipe |

---

## Path alias conventions

Default pattern (`tsconfig.json`):

| Alias | Resolves to |
|---|---|
| `~/*` | `./src/*` |
| `@domain/*` | `./src/domain/*` |
| `@app/*` | `./src/application/*` |
| `@infra/*` | `./src/infrastructure/*` |

---

## Framework-specific extras candidates

### Decorator usage rules per layer

| Layer | `@nestjs/*` decorators | Notes |
|---|---|---|
| Domain | forbidden | pure TypeScript |
| Application | only `@Injectable()` | pragmatic compromise for DI |
| Infrastructure | full access | `@InjectRepository` etc. free |
| Presentation | full access | `@Controller`, `@Get`, `@UseGuards` etc. |

### Module registration

- `src/modules/{feature}.module.ts` wires the layers together
- Controllers (presentation) + providers (application + infrastructure) +
  DI token mappings
- Repository interface is defined in domain, the infrastructure
  implementation is wired via `useClass`

### Role of main.ts

- Bootstrap only (global pipes, filters, Swagger, listen)
- No business logic — TDD-exempt

---

## File location summary candidates

| Task (Korean output) | Location (layer-first) | Location (module-first) |
|---|---|---|
| REST endpoint 추가 | `src/presentation/controllers/` | `src/modules/<f>/presentation/` |
| GraphQL resolver | `src/presentation/resolvers/` | `src/modules/<f>/presentation/` |
| 비즈니스 로직 | `src/application/commands/` or `queries/` | `src/modules/<f>/application/` |
| DB repository | `src/infrastructure/persistence/repositories/` | `src/modules/<f>/infrastructure/` |
| DB schema | `src/infrastructure/persistence/entities/` or `schema/` | same |
| 외부 API 통합 | `src/infrastructure/external/` | `src/modules/<f>/infrastructure/` |
| 도메인 엔티티 | `src/domain/{context}/entities/` | `src/modules/<f>/domain/entities/` |
| Repository interface | `src/domain/{context}/repository.interface.ts` | `src/modules/<f>/domain/` |
| Guard / Interceptor / Pipe | `src/presentation/{guards,interceptors,pipes}/` | `src/modules/<f>/presentation/` |
| E2E 테스트 | `test/` | `test/` |
| 단위 테스트 | 소스 옆 `*.spec.ts` | 소스 옆 `*.spec.ts` |

---

## Scope discipline (do NOT include)

- Entity / domain model definitions (PRD §7 area)
- Service / command / repository implementation snippets
- Module registration code examples
- `main.ts` bootstrap code
- Authentication / authorization policy descriptions (PRD security area)
- API endpoint specs (PRD `endpoint_specs` area)
