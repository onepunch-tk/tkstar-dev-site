---
name: ca-rules
description: Clean Architecture 4-layer dependency rules, TDD-exempt layer list, and test policy per layer. Reference-only skill preloaded by harness-pipeline, tdd, code-reviewer, and other architecture-aware consumers.
when_to_use: When any skill or agent needs to validate layer boundaries, place new files into the correct layer, decide whether a file requires a test, or review cross-layer imports.
user-invocable: false
disable-model-invocation: true
---

# Clean Architecture Rules

Single source of truth for Clean Architecture (CA) conventions across the harness. Any skill or agent that previously restated the dependency rule (harness-pipeline/SKILL.md, phase-1-plan, phase-2-tdd, code-reviewer) must defer here.

## Dependency direction (hard rule)

```
Domain  ←  Application  ←  Infrastructure
                         ←  Presentation
```

Inner layers MUST NOT import from outer layers. Concretely:

- `domain/**` imports nothing outside `domain/`.
- `application/**` imports only from `domain/` and itself.
- `infrastructure/**` imports from `domain/` and `application/`; never from `presentation/`.
- `presentation/**` imports from `application/` and `domain/` (via interfaces); never from `infrastructure/` directly — use dependency injection or a composition root.

Violations are review-blocking defects (code-reviewer flags as High severity).

## Layer responsibilities

| Layer | Purpose | Typical file names |
|---|---|---|
| Domain | Entities, value objects, invariants, domain errors | `*.entity.ts`, `*.vo.ts`, `*.schema.ts` (Zod), `*.error.ts` |
| Application | Use cases, orchestration, ports | `*.usecase.ts`, `*.service.ts`, `*.port.ts`, `*.mapper.ts` |
| Infrastructure | DB, HTTP clients, external SDK adapters | `*.repository.ts`, `*.client.ts`, `*.adapter.ts` |
| Presentation | UI components, routes, controllers | `*.tsx`, `*.controller.ts`, `*.route.ts` |

Exact paths depend on the project — always resolve via `docs/PROJECT-STRUCTURE.md`. The patterns above are defaults.

## TDD scope per layer

| Layer | TDD required | Notes |
|---|---|---|
| Domain | Yes, always | No mocks. Pure unit tests against real entities/values |
| Application | Yes | Mock ports only; never mock entities |
| Infrastructure | Integration tests preferred | Contract tests for ports; hit real DB/HTTP when practical |
| Presentation (components) | Yes, via React Testing Library or equivalent | Avoid deep DOM assertions; test behavior |
| Presentation (routes/controllers) | Yes | End-to-end request→response test |

## TDD exemption list (no corresponding `*.test.*` required)

These file categories are setup/data rather than behavior. Exempting them keeps the test suite honest.

- Design token / theme source: `tokens.ts`, `theme.ts`, `unistyles.config.ts`, `tailwind.config.*`
- Barrel files: `index.ts` (re-exports only)
- Type-only declarations: `*.d.ts`, `types.ts` with no runtime code
- Drizzle schemas (under `infrastructure/database/schema/**`): no logic, just table declarations
- Zustand store factory when the store is pure state wiring with no business rules
- Styling files: `*.css`, `*.scss`, `*.module.css`
- Generated code (OpenAPI, Prisma, Drizzle migrations)
- App entry points with only bootstrap code (`main.tsx`, `_layout.tsx` when only `useFonts` + providers)

When in doubt, default to "test required". Exempting a file because it is hard to test is a smell.

## Directory layout contract

The canonical root structure assumed by this skill:

```
src/
├── domain/
├── application/
├── infrastructure/
└── presentation/
```

Actual paths are defined by `docs/PROJECT-STRUCTURE.md`. This skill provides rules, not paths — consumers must read that doc for the project-specific map.
