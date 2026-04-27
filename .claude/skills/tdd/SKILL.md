---
name: tdd
description: "TDD (Test-Driven Development) rules and patterns. Use when: (1) Writing unit tests, (2) Determining test targets, (3) Following TDD cycle. Supports Expo, React Native, React Router, NestJS using Vitest/Jest."
---

# TDD Skill

TDD rules and patterns for Node/TypeScript/React projects.

---

## Test Target Rules

### Priority Order (IMPORTANT)

**Exclusions are evaluated FIRST, then Must Test patterns apply.**

```
1. Check Exclusion patterns → If matched, SKIP
2. Check Must Test patterns → If matched, WRITE TEST
3. If neither matched → SKIP (not a test target)
```

### Must Test

| Pattern | CA Layer | Description |
|---------|----------|-------------|
| `*.entity.ts` | Domain | Entity classes |
| `*.vo.ts` | Domain | Value Objects |
| `*.schema.ts` | Domain | Zod validation schemas |
| `*.service.ts` | Application | Service functions |
| `*.command.ts`, `*.query.ts` | Application | CQRS handlers |
| `*.mapper.ts` | Application | Entity ↔ DTO mappers |
| `*.helper.ts`, `*.util.ts` | Shared | Helper/utility functions |
| `*.tsx` (components) | Presentation | React components (**except** paths matching exclusions) |
| `loader`, `action` | Presentation | Route loaders/actions |
| `use*.ts` | Presentation | Custom hooks |

### Exclude from Testing (Evaluated First)

| Pattern | Reason |
|---------|--------|
| `**/components/ui/**` | shadcn/ui auto-generated (takes priority over `*.tsx`) |
| `*.d.ts` | Type declarations only |
| `**/types.ts`, `**/types/**` | Type definitions only |
| `**/*.port.ts` | Interface definitions only |
| `**/index.ts` | Barrel files (re-exports) |
| `*.config.ts` | Configuration files |
| `**/constants.ts`, `**/const.ts` | Static values only |
| `**/*.css`, `**/*.scss` | Style files |

---

## Naming Convention

**Pattern** (default, override via `docs/PROJECT-STRUCTURE.md` if the project uses a different convention): Co-located `__tests__/` directory within each CA layer module. Place the test file next to the source it tests, inside a `__tests__/` subdirectory, and add `.test` before the extension. The `.claude/config.json` `testFilePatterns` entry reflects this convention for hooks; adjust both the config and PROJECT-STRUCTURE if a project uses a flat `tests/` tree instead.

Source → Test path mapping:

| Source Path | Test Path |
|-------------|-----------|
| `{root}/{domain-layer}/entities/user.entity.ts` | `{root}/{domain-layer}/entities/__tests__/user.entity.test.ts` |
| `{root}/{domain-layer}/schemas/email.schema.ts` | `{root}/{domain-layer}/schemas/__tests__/email.schema.test.ts` |
| `{root}/{app-layer}/services/auth.service.ts` | `{root}/{app-layer}/services/__tests__/auth.service.test.ts` |
| `{root}/{presentation-layer}/components/Button.tsx` | `{root}/{presentation-layer}/components/__tests__/Button.test.tsx` |

> `{root}`, `{domain-layer}`, `{app-layer}`, `{presentation-layer}` are actual paths from `docs/PROJECT-STRUCTURE.md`.

**Why co-located `__tests__/`**:
- Expo Router requires it — standalone `.test.ts` in `app/` causes bundler errors
- NestJS aligns — `nest generate` co-locates specs next to source
- Vitest/Jest agnostic — `**/__tests__/**/*.test.{ts,tsx}` glob covers all frameworks
- CA compliance — tests live in the layer they verify, dependency violations are structurally visible

---

## TDD Cycle

### Red → Green → Refactor

1. **Red** - Write a failing test
2. **Green** - Write minimal code to pass
3. **Refactor** - Improve code (keep tests passing)

---

## TDD Priority Order (Inside-Out by CA Layer)

CA layer responsibilities, mock rules, and the TDD exemption list are defined in the shared reference — see [`shared/ca-rules`](../shared/ca-rules/SKILL.md). Summary for convenience: write tests in Domain → Application → Infrastructure → Presentation order, Domain tests use **no mocks**, Application mocks only ports, Infrastructure prefers integration tests, and Presentation tests behavior (not DOM details).

---

## AAA Pattern

All tests follow AAA (Arrange-Act-Assert) pattern:

| Phase | Role | Example |
|-------|------|---------|
| **Arrange** | Prepare test data and environment | Mocking, input creation |
| **Act** | Execute test target | Function call, event trigger |
| **Assert** | Verify results | expect statements |

---

## Framework Test Environment

Use the project's actual test runner — do not assume one. Resolution order:

1. Read `package.json` scripts (`test`, `test:watch`, etc.) and the project's `CLAUDE.md` Commands table to see what the project runs.
2. Check for a config file: `vitest.config.*` → Vitest, `jest.config.*` → Jest.
3. Run framework detection via [`shared/framework-detection`](../shared/framework-detection/SKILL.md) and use the framework's typical default only when no project-level signal is available.

Typical defaults (informational, not prescriptive):

| Framework | Common test runner | Notes |
|-----------|--------------------|-------|
| Expo / React Native | Jest | Most Expo setups ship Jest by default; Vitest is possible with extra config but uncommon. |
| React Router v7 / Vite + React | Vitest or Jest | Vitest is popular; Jest remains valid for teams who prefer it. |
| NestJS | Jest | The official scaffolding default. |
| Next.js | Jest or Vitest | Depends on the project's setup. |

If the project's actual runner disagrees with this table, the project wins. Update `CLAUDE.md` to record the choice so future sessions see it.

### Vitest + React Testing Library Setup

When using **Vitest** with `@testing-library/react`, automatic cleanup between tests does NOT work by default. To prevent DOM accumulation across tests, add cleanup to `vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

> If `vitest.setup.ts` already includes this cleanup, individual test files do NOT need their own `afterEach(cleanup)`.

### ESM Import Rules

All modern projects use ESM (`"type": "module"` in `package.json`). When writing tests:
- **Always use static `import`** — never `require()`
- Use relative paths from the test file to the source: `import Component from "../../../app/presentation/components/Component"`

### Red Phase: Missing Source Files Are Expected

During Red Phase, the source file being tested **does not exist yet**. This is normal and expected in TDD.

- **DO** use static `import` even though the file doesn't exist — vitest resolves imports at runtime, not compile time
- **DO NOT** use `require()` to "work around" missing modules — this breaks in ESM and defeats the purpose of Red Phase
- **DO NOT** treat TypeScript/LSP import errors as problems to solve — they are expected diagnostics that disappear after Green Phase
- The test should **fail at runtime** because the module is missing, confirming the Red Phase is correct

---

## Test Utility Structure

Shared test utilities live at the project root level (not inside CA layers):

| Path | Purpose |
|------|---------|
| `test/fixtures/` | Mock data builders |
| `test/utils/` | Test helper functions |

**Rules**:
1. No inline helpers in test files - use shared locations
2. Check existing utilities before creating new ones
3. Support `overrides` parameter for customization

---

## Code Examples

Based on detected framework, read the corresponding reference file (paths relative to `.claude/skills/tdd/`):

| Framework | Reference File |
|-----------|----------------|
| React Router v7 | [references/react-router.example.md](./references/react-router.example.md) |
| React Component | [references/react-component.example.md](./references/react-component.example.md) |
| Zod Schema | [references/zod-schema.example.md](./references/zod-schema.example.md) |
| NestJS | [references/nestjs.example.md](./references/nestjs.example.md) |
| Expo/React Native | [references/expo-react-native.example.md](./references/expo-react-native.example.md) |

> **Note**: Reference examples use English test descriptions for universal accessibility. When writing actual tests, follow the Output Language Rules below.

---

## Output Language Rules

See [commit-prefix-rules.md](../git/references/commit-prefix-rules.md) for project-wide language conventions.

| Item | Language |
|------|----------|
| Test descriptions (`it`, `describe`) | Korean |
| Variable/function names | English |
| Code comments | Korean |

---

## Quality Checklist

Before completing tests:

- [ ] Test file follows naming convention
- [ ] All tests have Korean descriptions
- [ ] AAA pattern followed
- [ ] Mocks initialized in `beforeEach`
- [ ] No `any` type in test code
- [ ] Shared helpers in `test/fixtures/` or `test/utils/`
- [ ] Domain layer tests have zero mocks
- [ ] Test order follows CA Inside-Out priority (Domain first)
- [ ] All tests pass
