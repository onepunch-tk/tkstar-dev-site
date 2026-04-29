---
paths:
  - "**/*.ts"
  - "**/*.tsx"
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
