# Project Structure Guide

## Overview

{OVERVIEW_CONTENT}

**Architecture Pattern**: Clean Architecture (4-layer separation)
**Framework**: React Router Framework v7+
**Key Characteristics**:
- Platform-agnostic core (app/) reusable across Cloudflare Workers, Express, Fastify
- Strict dependency flow: Presentation → Application → Domain
- Infrastructure isolated via Dependency Injection

---

## Top-Level Directory Structure

```
{TOP_LEVEL_TREE}
```

**Key directories**:
- `app/` - Core application (Clean Architecture layers)
- `adapters/` - Platform-specific adapters (Cloudflare, Express, Fastify)
- `server/` - Node.js server entry point
- `workers/` - Cloudflare Workers entry point
- `public/` - Static assets
- `test/` - Shared test utilities (fixtures, helpers)
- `docs/` - Documentation
- `.claude/` - AI agent configuration

---

## app/ Directory (Core Application)

Follows Clean Architecture 4-layer structure.

### app/domain/

**Role**: Business rules and entity definitions (no external dependencies)

**Contains**:
- Entity - Core business objects
- Types - Domain-related TypeScript types
- Schemas - Zod validation schemas
- Errors - Domain-specific error classes

**When to use**:
- Adding new business concepts (e.g., orders, products, payments)
- When API request/response validation schemas are needed
- Defining custom business errors

**Structure**:
```
{DOMAIN_STRUCTURE}
```

**Example entities/schemas**:
{DOMAIN_EXAMPLES}

---

### app/application/

**Role**: Business logic and use case implementation

**Contains**:
- Service - Business logic implementation
- Port - External system interface definitions

**When to use**:
- Adding new business logic (sign-up, payment processing, etc.)
- When communication with external systems (email, payment gateway) is needed

**Structure**:
```
{APPLICATION_STRUCTURE}
```

**Port and Service relationship**:
- `*.port.ts` - Interface definition (what can be done)
- `*.service.ts` - Business logic (how to do it)

**Example services**:
{APPLICATION_EXAMPLES}

---

### app/infrastructure/

**Role**: External system integration and implementations

**Contains**:
- **config/**: DI container (Composition Root)
- **persistence/**: Database-related (ORM, schemas, repository implementations)
- **external/**: External service integrations (Auth, Email, etc.)

**When to use**:
- Adding database tables/schemas → `persistence/schema/`
- Creating new repository implementations → `persistence/`
- Adding external API integrations (payment, notifications) → `external/`
- Registering new services to DI container → `config/container.ts`

**Structure**:
```
{INFRASTRUCTURE_STRUCTURE}
```

**Example integrations**:
{INFRASTRUCTURE_EXAMPLES}

---

### app/presentation/

**Role**: UI, routing, user interface related

**Contains**:
- **components/**: UI components
- **hooks/**: Custom React hooks
- **routes/**: Pages and API routes (React Router v7)
- **lib/**: Utilities and middleware

**When to use**:
- Adding new pages → `routes/`
- Creating UI components → `components/`
- When custom hooks are needed → `hooks/`
- Adding route middleware → `lib/middleware/`

**Structure**:
```
{PRESENTATION_STRUCTURE}
```

**Route file conventions (React Router v7)**:
- `_layout.tsx` - Layout wrapper
- `_index.tsx` - Index route
- `$param.tsx` - Dynamic segment
- `route.tsx` - Route component

**Example routes**:
{PRESENTATION_EXAMPLES}

---

### app/ Root Files

| File | Role | When to modify |
|------|------|----------------|
| `root.tsx` | React Router root component, Theme Provider | When adding global Providers |
| `routes.ts` | Route definitions | When adding new pages/layouts |
| `entry.server.tsx` | Server rendering entry point | When customizing SSR |
| `app.css` | Global styles (Tailwind) | When adding global CSS variables |
| `env.d.ts` | Client environment variable types (Vite `import.meta.env`) | When adding client-side environment variables |

---

## adapters/ Directory (Platform Adapters)

**Role**: Connect the application to various runtime environments

```
{ADAPTERS_STRUCTURE}
```

**When to use**:
- When supporting a new deployment platform
- When adding platform-specific middleware
- When modifying environment variable handling

**shared/ directory**:
- `context.ts` - Platform-common context types
- `env.ts` - Unified environment variable handling
- `react-router.d.ts` - React Router type extensions

---

## Other Key Directories

### server/

**Role**: Node.js server entry point

**When to use**: When changing Express/Fastify server settings

---

### workers/

**Role**: Cloudflare Workers entry point

**When to use**: When changing Cloudflare Workers settings

---

### public/

**Role**: Static asset storage (served directly without build)

**Contains**: Images, fonts, favicon, etc.

---

### test/ (Shared Test Utilities)

**Role**: Shared test fixtures, helpers, and mock data builders

**Contains**: `fixtures/`, `utils/`

**Note**: Unit test files are **co-located** with source code using `__tests__/` subdirectories within each CA layer (e.g., `app/domain/entities/__tests__/user.entity.test.ts`). This `test/` directory is only for shared utilities across layers.

---

## Path Aliases

```typescript
// Defined in tsconfig.app.json
{PATH_ALIASES}
```

**Usage example**:
```typescript
{PATH_ALIAS_EXAMPLES}
```

---

## File Location Summary by Task

| Task | Location |
|------|----------|
| Add new page | `app/presentation/routes/` |
| Add UI component | `app/presentation/components/` |
| Add business logic | `app/application/{domain}/` |
| Add DB schema | `app/infrastructure/persistence/schema/` |
| Add external API integration | `app/infrastructure/external/` |
| Define types/entities | `app/domain/{domain}/` |
| Write test files | Co-located `__tests__/` directories (e.g., `app/{layer}/components/__tests__/`) |
| Add static files | `public/` |
