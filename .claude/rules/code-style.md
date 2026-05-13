---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.rs"
---

# Code Style

## Function Definitions
- **Utility/Handler functions**: Arrow syntax → `export const fn = () => { ... }`
- **React Components**: Named export → `export default function Component() { ... }`

## Type Safety
- **NO `any`**: Use `unknown` + type guards (Zod, `is` keyword)
- **Generics**: Always use `extends` constraints → `<T extends Record<string, unknown>>`

## Type Abstractions
- **NO `type X = Primitive`** (string / number / boolean / Date) without added constraint. Such aliases are dead indirection — use the primitive directly.
- **Acceptable alternatives** when a named type truly carries semantics:
  - Brand: `type Email = string & { readonly __brand: 'Email' }`
  - Template literal: `type Hex = \`#${string}\``
  - String literal union: `type Role = 'admin' | 'user'`
  - Discriminator used across multiple entities

## Single-Use Extraction Rules

> **Why this section exists**: Extracting a `const`, helper function, or JSX
> wrapper that is only referenced once moves the reader's eye twice (declaration
> → use site) instead of once. It also creates a phantom abstraction — future
> refactors must navigate it, future searches surface it, future renames touch
> it. Magic literals at the call site are simpler unless the symbol carries
> domain meaning or is genuinely shared.

### Applies to

- `const` / `let` declarations (any type — string, number, object literal, className)
- helper functions defined alongside their single caller
- JSX wrapper components (a `<View>`/`<div>` extracted into a named component to be referenced once)

### Does NOT apply to

- **Type aliases** — governed by the "Type Abstractions" section above and `code-reviewer.md` §4.4 "Useless type abstraction". A named type can carry signature/contract value even at one use site.
- **Domain constants with semantic meaning** — `const MAX_RETRIES = 3`, `const SESSION_COOKIE_NAME = 'sid'`. The name *is* the value's documentation; inlining loses meaning.
- **Regex patterns / i18n keys / env-var keys** — naming establishes searchability and prevents typo drift.
- **Long string literals split for readability** (≥ 80 chars on one line that has no other natural wrap) — keep extracted but write a `// inline at next refactor` comment if the string is genuinely single-use.

### Inline-required threshold

A symbol must be **inlined** (or moved closer to its consumer if it lives elsewhere) when **both** conditions hold:

1. **Same-file usage count ≤ 2** (declaration line itself does not count). Use:
   ```bash
   rg -w '\bSYMBOL\b' <file> | wc -l
   ```
2. **Cross-file import count ≤ 1** when the symbol is `export`ed. Use:
   ```bash
   rg -l "import.*\b<SYMBOL>\b" src/
   ```
   If the only importer is one file, the symbol is effectively private to that consumer — move it inline (or co-locate it in the consumer file).

### Examples

❌ **Anti-pattern (single-use const for a className string)**:

```tsx
const COVER_HATCH_CLASS =
  "bg-bg-elev bg-[image:repeating-linear-gradient(45deg,...)]";

export default function Card({ project }: Props) {
  return (
    <Link to={`/projects/${project.slug}`}>
      <div className={`flex h-full w-full ... ${COVER_HATCH_CLASS}`}>
        cover · 16:9
      </div>
    </Link>
  );
}
```
The `COVER_HATCH_CLASS` constant appears twice in the file (declaration + 1 use). Inline it.

✅ **Fix**:

```tsx
export default function Card({ project }: Props) {
  return (
    <Link to={`/projects/${project.slug}`}>
      <div className="flex h-full w-full ... bg-bg-elev bg-[image:repeating-linear-gradient(45deg,...)]">
        cover · 16:9
      </div>
    </Link>
  );
}
```

❌ **Anti-pattern (single-use JSX wrapper)**:

```tsx
function CardCover() {
  return <div className="aspect-video w-full ..." />;
}

export default function Card() {
  return (
    <Link>
      <CardCover />
      <h2>...</h2>
    </Link>
  );
}
```
`CardCover` is used once. Inline the JSX.

✅ **Fix**:

```tsx
export default function Card() {
  return (
    <Link>
      <div className="aspect-video w-full ..." />
      <h2>...</h2>
    </Link>
  );
}
```

❌ **Anti-pattern (exported helper used by one importer)**:

```ts
// utils/format-username.ts
export function formatUsername(name: string): string {
  return name.trim().toLowerCase();
}
```
If only one file imports `formatUsername`, move it into that file (or inline at the call site if used once there too).

✅ **Domain constant — keep extracted (do NOT flag)**:

```ts
const MAX_RETRIES = 3;          // domain meaning — name documents the value

for (let i = 0; i < MAX_RETRIES; i++) { ... }
```
Even at one call site, the named constant carries semantics that the literal `3` does not.

### Detection workflow (for code-reviewer)

```bash
# 1. Enumerate const/var declarations in changed file
rg '^(export\s+)?(const|let)\s+([A-Z_a-z][A-Za-z0-9_]*)' <file>

# 2. For each candidate symbol SYMBOL:
USES=$(rg -w "\b${SYMBOL}\b" <file> | wc -l)        # decl + uses
[ "$USES" -le 2 ] && echo "in-file suspicion: $SYMBOL (uses=$USES)"

# 3. If exported, check cross-file importers:
rg "^export\b.*\b${SYMBOL}\b" <file> >/dev/null && {
  IMPORTERS=$(rg -l "import.*\b${SYMBOL}\b" src/ | wc -l)
  [ "$IMPORTERS" -le 1 ] && echo "cross-file suspicion: $SYMBOL (importers=$IMPORTERS)"
}

# Flag MINOR if BOTH suspicions hit AND the symbol is not in the "Does NOT apply to" list above.
```

Same workflow applies to function declarations (`^(export\s+)?function\s+`) and JSX wrapper components (single-use named components in the same file as their consumer).

## React 19 (applies when the file is `.tsx`)
- **Trust the React Compiler.** `useCallback` and `useMemo` are unnecessary in the common case — the compiler memoizes for you.
- Reach for `useCallback` / `useMemo` **only** when a profiler shows a measurable render cost that justifies it.
- Prioritize readability over premature optimization. A wrapping hook that is never load-bearing is noise, not performance.

---

## Rust (applies when the file is `.rs`)

> **References** (consult upstream docs when an edge case is not covered): Rust API Guidelines + RFC 430 (naming), Clippy lint catalogue (correctness/style/complexity/perf/pedantic groups), `thiserror` and `anyhow` conventions, Tauri 2 security model (capabilities / permissions / scopes). CA layer mapping for Rust lives in `ca-rules/SKILL.md` (Rust file patterns section) and `file-conventions.md` — this file governs **language style**, not file placement.

### Naming (RFC 430 / Rust API Guidelines)

| Construct | Casing | Example |
|---|---|---|
| Modules, functions, methods, locals, variables, fields | `snake_case` | `fn create_user`, `let user_id` |
| Types, traits, enums, type parameters | `UpperCamelCase` | `struct UserId`, `trait UserRepository`, `enum DomainError` |
| Const, static | `SCREAMING_SNAKE_CASE` | `const MAX_RETRIES: u32 = 3` |
| Lifetimes | short `'a`, `'b`, or descriptive `'src` | `fn parse<'src>(input: &'src str)` |

- Acronyms count as one word: `Uuid` (not `UUID`), `Stdin` (not `StdIn`), `is_xid_start` (snake-cased acronyms stay lower).
- Project convention: prefer `PI_2` over `PI2` for clarity between the constant base and its variant suffix (the Rust API Guidelines call out single-letter word handling in passing for `snake_case`; the same spirit applies here).
- **No `get_` prefix for getters** unless there is a single, obvious thing to retrieve and naming would be ambiguous without it. Prefer `fn name(&self) -> &str` over `fn get_name(&self) -> &str`.
- Crate names do **not** use `-rs` / `-rust` prefix or suffix.
- Cargo feature flags: `abc`, not `use-abc` / `with-abc`.

### Error Handling

> **Rule of thumb** (library / application split): library code defines its own error enums with `thiserror`; application code (binaries, `#[tauri::command]` handlers, integration tests) may use `anyhow` for convenience. **Library boundaries do not leak `anyhow::Error`.**

- All fallible functions return `Result<T, E>`. Never panic for recoverable conditions.
- Use the `?` operator for propagation; reserve `match` for branching on specific variants.
- **No `unwrap()` / `expect()` outside tests** (and even there, prefer `?` when feasible). Hot-path `unwrap()` is a `code-reviewer` defect.
- Domain layer error type — single enum with `#[derive(thiserror::Error, Debug)]`, one variant per failure mode, `#[from]` for transparent wraps:

  ```rust
  #[derive(thiserror::Error, Debug)]
  pub enum UserError {
      #[error("user not found: {0}")]
      NotFound(UserId),
      #[error("invalid email format")]
      InvalidEmail,
      #[error(transparent)]
      Repository(#[from] RepositoryError),
  }
  ```
- Application layer use cases return the Domain error type or a composed enum; **do not** swallow context — wrap with `.map_err(...)` when crossing a boundary.
- `#[tauri::command]` Presentation handlers return `Result<T, String>` (Tauri serializes `String` errors to the frontend). Convert internal errors at the boundary: `internal_err.to_string()`.

### Type Abstractions

- **Newtype pattern** is the Rust analogue of TypeScript's brand types. Prefer it over raw primitives for identifiers, units, and validated strings:

  ```rust
  // ✅ Newtype — carries semantics, type-checked separately from String
  pub struct UserId(pub String);

  // ❌ Type alias — does not prevent mixing with other String values
  pub type UserId = String;
  ```
- A bare `type Alias = u32` adds nothing and is a `code-reviewer` MINOR finding — same rule as the TypeScript "No `type X = Primitive`" rule above.
- Enums over boolean parameters when more than two states are foreseeable. `enum SortOrder { Asc, Desc }` is clearer than `fn sort(asc: bool)`.
- Iterator-returning methods follow Rust API Guidelines: `iter()` borrows, `iter_mut()` mut-borrows, `into_iter()` consumes. Custom iterator types are named after their producer (`fn lines() -> Lines`, `fn chars() -> Chars`).

### Ownership & Borrowing

- **Parameters**: prefer `&str` over `String`, `&[T]` over `Vec<T>`, `&Path` over `PathBuf` — accept the widest input the function can operate on without owning.
- **Returns**: return owned types (`String`, `Vec<T>`) when the value is produced inside the function. Return borrows only when tied to an input lifetime.
- Avoid gratuitous `.clone()` — every clone is a code smell unless the cost is provably trivial (`Arc::clone`) or the borrow checker truly requires it. `code-reviewer` flags clone-heavy code paths.
- Use `Cow<'_, T>` when a function sometimes needs ownership and sometimes can borrow.
- Async functions that hold a `&` across an `.await` must consider `Send` / `Sync` bounds — Tauri's runtime expects `Send + Sync + 'static` futures on `#[tauri::command]`.

### `unsafe`

- Every `unsafe { ... }` block **must** be preceded by a `// SAFETY: ...` comment that justifies why the invariants the compiler can no longer check are upheld.
- Prefer the smallest possible `unsafe` block — wrap only the offending expression, not an entire function body.
- Avoid `unsafe impl` unless the trait's safety contract is fully understood; document the contract in a doc comment on the impl.
- FFI boundaries (`extern "C"`, `*const T`, `*mut T`) are inherently `unsafe` — every call site needs a SAFETY note covering null/alignment/aliasing assumptions.

### Clippy

- Treat `clippy::correctness` as **deny** (build failure). Per the Clippy book: correctness lints fire only on outright bugs or non-functional code.
- `clippy::style`, `clippy::complexity`, `clippy::perf` as **warn** — fix in normal flow.
- `clippy::pedantic` is opt-in; allow specific lints with `#[allow(clippy::...)]` and a justification comment.
- `code-reviewer` Phase 4 (Quality) cross-references clippy categories — never silence a lint without a reason in the file.

### Tauri 2 — IPC, Capabilities, State

- **`#[tauri::command]` functions live in the Presentation layer** (`src-tauri/src/presentation/commands/*.rs` per `ca-rules` §"Rust file patterns"). They are controllers — they invoke Application use cases, never call Infrastructure directly.
- Each command's signature is the IPC contract — types must be `serde::Serialize` / `Deserialize` and validated at entry. Reject unexpected fields; do not execute commands based on untrusted input (Tauri capabilities / permissions model — see `ca-rules` §Rust file patterns and the Tauri 2 security docs).
- **Capability files** (`src-tauri/capabilities/*.json|*.toml`) follow the **least-privilege** principle: define one capability per window/surface, reference by identifier from `tauri.conf.json`, never grant a capability "just in case".
- Global state via `tauri::State<T>` — register in `lib.rs` with `.manage(...)`. Domain entities never depend on `tauri::State`; only Presentation does.
- IPC errors: return `Result<T, String>`; map internal `thiserror` errors to a string at the boundary so the frontend receives a stable message format.

### Async

- Tokio is the runtime Tauri uses; `#[tauri::command]` may be `async fn`.
- Never block in async code: `std::fs` / `std::thread::sleep` inside an async function blocks the executor. Use `tokio::fs` / `tokio::time::sleep` instead.
- `Send + Sync` audit: any state held across `.await` must be `Send`; state shared between `#[tauri::command]` invocations must be `Send + Sync + 'static`.

### Supply Chain

- `cargo audit` (RustSec database) is the canonical advisory scanner — run in CI on every PR and on local pre-merge.
- `cargo-deny` extends `cargo audit` with license, source, and banned-crate policies. Adopt when the policy needs to express more than "no vulns".
- The `code-reviewer` Phase 2 (Dependency Audit) executes `cargo audit` for Rust workspaces analogously to `bun audit` / `npm audit` for JS.

### Doc Comments

- Public items in libraries get a `///` doc comment (Rust API Guidelines C-EXAMPLE). Korean prose is acceptable when the project's convention allows it (see `tdd/SKILL.md` Output Language Rules).
- Module-level `//!` docs explain the module's role within its CA layer.
- Examples in doc comments are run as doctests by `cargo test` — keep them compilable.

