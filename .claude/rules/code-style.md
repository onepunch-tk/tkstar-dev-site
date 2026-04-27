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

## React 19 (applies when the file is `.tsx`)
- **Trust the React Compiler.** `useCallback` and `useMemo` are unnecessary in the common case — the compiler memoizes for you.
- Reach for `useCallback` / `useMemo` **only** when a profiler shows a measurable render cost that justifies it.
- Prioritize readability over premature optimization. A wrapping hook that is never load-bearing is noise, not performance.
