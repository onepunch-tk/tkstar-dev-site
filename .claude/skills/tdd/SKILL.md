---
name: tdd
description: "TDD (Test-Driven Development) rules and patterns. Use when: (1) Writing unit tests, (2) Determining test targets, (3) Following TDD cycle. Supports Expo, React Native, React Router, NestJS using Vitest/Jest, and Tauri 2 / Rust using cargo test + mockall + tauri::test::MockRuntime + rstest."
user-invocable: false
---

# TDD Skill

TDD rules and patterns for Node/TypeScript/React projects, or Rust/Tauri projects. Language dispatch is driven by file path: `src-tauri/**/*.rs` → Rust path, `src/**/*.{ts,tsx,js,jsx}` → JS path (hybrid Tauri projects always contain both).

---

## Test Target Rules

### Priority Order (IMPORTANT)

**Exclusions are evaluated FIRST, then Must Test patterns apply.**

```
1. Check Exclusion patterns → If matched, SKIP
2. Check Must Test patterns → If matched, WRITE TEST
3. If neither matched → SKIP (not a test target)
```

### Must Test (TypeScript / React / NestJS)

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

### Must Test (Rust / Tauri — file patterns from `ca-rules` §Rust file patterns)

| Pattern | CA Layer | Description |
|---------|----------|-------------|
| `*_entity.rs` | Domain | Entity structs / impls |
| `*_vo.rs` | Domain | Value Objects |
| `errors.rs` | Domain | Domain error enums with `thiserror` |
| `*_use_case.rs` | Application | Use case orchestration |
| `*_mapper.rs`, `*_dto.rs` | Application | Entity ↔ DTO mappers |
| `*_repository.rs`, `*_client.rs`, `*_adapter.rs` | Infrastructure | Integration tests preferred |
| `commands/*.rs` | Presentation | `#[tauri::command]` handlers (test via `tauri::test::MockRuntime`) |

### Exclude (Rust / Tauri — TDD-exempt per `ca-rules` and `phase-1-plan`)

| Pattern | Reason |
|---------|--------|
| `src-tauri/src/main.rs` | Desktop entry — calls `lib::run()` only |
| `src-tauri/src/lib.rs` | Mobile entry + `invoke_handler` registration + `manage()` only |
| `src-tauri/src/build.rs` | Build script (no runtime logic) |
| `src-tauri/Cargo.toml`, `Cargo.lock` | Dependency declarations |
| `src-tauri/tauri.conf.json` | Configuration data |
| `src-tauri/capabilities/*.{json,toml}` | Permission declarations |
| `*_port.rs` | Trait definitions only (mocked via `mockall` in consumers) |

> **Deep module exemption**: When a file matches a Must Test pattern but
> is an *internal part* of a deep module (one that already has tests at
> its external interface — typically the `*.usecase.ts` or top-level
> façade), individual file-pattern tests for the internals are **not
> required**. The interface is the test surface — duplicate tests on
> internals tend to break on refactor and add no extra coverage. See
> `improve-codebase-architecture` skill §"Testing strategy: replace,
> don't layer" for the full rule. Default remains: when a file stands
> on its own (one file = one module), the table above applies.

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

**Why co-located `__tests__/`**: Expo Router rejects standalone `.test.ts` in `app/` (bundler errors); NestJS scaffolding already co-locates specs; the `**/__tests__/**/*.test.{ts,tsx}` glob is framework-agnostic; CA layer placement makes dependency violations structurally visible.

### Rust naming convention (Tauri / `src-tauri/**/*.rs`)

Rust does **not** use the `__tests__/` directory convention. Cargo recognises two test locations natively, and idiomatic Rust uses both:

| Test type | Location | Convention |
|---|---|---|
| Unit test | Inline at the bottom of the source file, inside `#[cfg(test)] mod tests { ... }` | Cargo compiles only when `cargo test` runs; zero runtime cost in release builds |
| Integration test | Separate file under `src-tauri/tests/<feature>.rs` | Cargo auto-discovers — one binary per file. Used for cross-module / external-API tests |
| Doc test | Inside `///` comment with ```` ```rust ```` fence on a public item | Run by `cargo test` automatically; keeps examples honest |

> Source → test mapping for Rust:
>
> | Source path | Test placement |
> |---|---|
> | `src-tauri/src/domain/user_entity.rs` | Same file, append `#[cfg(test)] mod tests { ... }` |
> | `src-tauri/src/application/create_user_use_case.rs` | Same file, append `#[cfg(test)] mod tests { ... }` with `mockall` mocks of port traits |
> | `src-tauri/src/infrastructure/user_repository.rs` | Inline `#[cfg(test)] mod tests` for unit, `src-tauri/tests/user_repository_integration.rs` for integration |
> | `src-tauri/src/presentation/commands/user.rs` | Inline `#[cfg(test)] mod tests` using `tauri::test::MockRuntime` and `mock_builder()` to invoke commands |

**Why this layout**: Cargo understands both locations natively (no `[[test]]` config); inline `#[cfg(test)]` keeps unit tests next to the code and can test `pub(crate)` items; `tests/` integration files run as separate binaries and see only the public API.

---

## TDD Cycle

### Red → Green → Refactor

1. **Red** - Write a failing test
2. **Green** - Write minimal code to pass
3. **Refactor** - Improve code (keep tests passing)

---

## TDD Priority Order (Inside-Out by CA Layer)

CA layer responsibilities, mock rules, and the TDD exemption list are defined in the shared reference — see [`ca-rules`](../ca-rules/SKILL.md). Summary for convenience: write tests in Domain → Application → Infrastructure → Presentation order, Domain tests use **no mocks**, Application mocks only ports, Infrastructure prefers integration tests, and Presentation tests behavior (not DOM details).

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

Resolution order: (1) `package.json` scripts + project's CLAUDE.md Commands table; (2) `vitest.config.*` / `jest.config.*` presence; (3) framework default per [`framework-detection`](../framework-detection/SKILL.md). The project's actual runner always wins.

Typical defaults (informational):

| Framework | Common test runner | Notes |
|-----------|--------------------|-------|
| Expo / React Native | Jest | Most Expo setups ship Jest by default; Vitest is possible with extra config but uncommon. |
| React Router v7 / Vite + React | Vitest or Jest | Vitest is popular; Jest remains valid for teams who prefer it. |
| NestJS | Jest | The official scaffolding default. |
| Next.js | Jest or Vitest | Depends on the project's setup. |
| **Tauri 2 / Rust** (`src-tauri/**/*.rs`) | **`cargo test`** + `mockall` + `tauri::test::MockRuntime` + `rstest` | Built-in Cargo runner is the universal baseline. `mockall` is the consensus mocking choice (broad feature coverage, stable, no unsafe). `tauri::test::MockRuntime` ships with Tauri 2 (enable the `test` feature in `[dev-dependencies]`) for testing `#[tauri::command]` handlers. `rstest` (≥ 0.26) provides parameterized cases and fixtures — Rust analogue of `test.each` / `describe.each`. Optional: `cargo-nextest` for ~3× faster CI; `insta` for snapshots; `proptest` for property-based tests. |

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

### ESM Import Rules (TS / JS)

Use static `import` (never `require()`); relative paths from the test file to the source.

### Rust Import / Module Rules

- Inline `#[cfg(test)] mod tests` accesses the parent module via `use super::*;` — no path arithmetic needed.
- Integration tests under `src-tauri/tests/` import the crate by its name (set in `Cargo.toml` `[package].name`): `use my_app_lib::application::create_user_use_case;`.
- **Mockall consumers**: place `#[cfg_attr(test, mockall::automock)]` on the port trait definition so the `Mock<Trait>` type is generated only in test builds. Import in tests: `use super::MockUserRepository;`.
- **Tauri command tests**: import `tauri::test::{mock_builder, MockRuntime}` and `tauri::Manager`. Build a mock app via `mock_builder().invoke_handler(...).build(context)?`, then drive commands through `app.handle()`.

### Red Phase: Missing Source Files Are Expected

During Red Phase, the source file being tested **does not exist yet**. This is normal and expected in TDD.

- **TypeScript path**: use static `import` even though the file doesn't exist — vitest resolves imports at runtime, not compile time. Do **not** use `require()` (breaks ESM, defeats Red Phase). TypeScript/LSP import errors are expected diagnostics that disappear after Green Phase.
- **Rust path**: Cargo **does** check imports at compile time. Red Phase in Rust therefore looks slightly different — the failing test compiles against a **stub** of the target item: either an empty `pub fn` with `unimplemented!()` body, or an empty `pub struct` declaration with no impl. Run `cargo test` — the stub compiles, the test fails on the assertion. Replace the stub with the real implementation during Green Phase.
- In both languages the test must **fail meaningfully** at the assertion (not at the import / compile stage) for Red Phase to be valid.

---

## Test Utility Structure

Shared utilities live at the project root (not inside CA layers): `test/fixtures/` (mock data builders) and `test/utils/` (test helpers). No inline helpers in test files — check existing utilities first; support an `overrides` parameter for customization.

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
| Tauri 2 / Rust | [references/tauri-rust.example.md](./references/tauri-rust.example.md) |

> **Note**: Reference examples use English test descriptions for universal accessibility. When writing actual tests, follow the Output Language Rules below.

---

## Output Language Rules

See [commit-prefix-rules.md](../git/references/commit-prefix-rules.md) for project-wide language conventions.

| Item | Language |
|------|----------|
| Test descriptions (`it`, `describe`) | Korean |
| Variable/function names | English |
| Code comments | Korean |

**Rust addendum** (`#[test]` functions do not have a description string — the function name *is* the description):

| Item | Language |
|------|----------|
| `#[test]` function name | English `snake_case` (e.g. `fn creates_user_when_email_is_valid()`) |
| `///` doc comment above each test | Korean (이메일이 유효할 때 사용자가 생성된다) |
| `// ...` inline comments | Korean |
| Variable / binding names | English `snake_case` |

Rationale: Rust allows non-ASCII identifiers, but the ecosystem (cargo output, IDE jump-to-test, CI logs) is built around ASCII names. Keeping the function name English preserves tool ergonomics; the doc comment carries the Korean explanation that `it("...")` would otherwise hold.

---

## Quality Checklist

Before completing tests:

**Common (TS + Rust)**:
- [ ] Test file / placement follows the naming convention for the language (TS co-located `__tests__/`, Rust inline `#[cfg(test)] mod tests` or `src-tauri/tests/`)
- [ ] AAA pattern followed
- [ ] Domain layer tests have zero mocks
- [ ] Test order follows CA Inside-Out priority (Domain first)
- [ ] All tests pass (`bun run test` for TS, `cargo test` for Rust)

**TypeScript / JavaScript**:
- [ ] All tests have Korean descriptions
- [ ] Mocks initialized in `beforeEach`
- [ ] No `any` type in test code
- [ ] Shared helpers in `test/fixtures/` or `test/utils/`

**Rust / Tauri**:
- [ ] `#[test]` function names are English `snake_case`; `///` doc comment above each test is Korean
- [ ] `mockall::automock` (or hand-rolled mocks) used for port traits in Application layer tests
- [ ] `#[tauri::command]` handlers tested via `tauri::test::mock_builder()` + `MockRuntime`, not by calling the function directly
- [ ] No `unwrap()` / `expect()` in non-test code (tests may use them for terseness)
- [ ] Rust shared helpers in `src-tauri/tests/common/mod.rs` (per Cargo convention) or `tests/fixtures/`
