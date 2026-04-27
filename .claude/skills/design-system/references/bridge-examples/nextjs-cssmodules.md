# Bridge Example — Next.js + CSS Modules

Tokens are declared as CSS variables under `:root` in a module file; consuming components import CSS Modules that reference the same variables.

```css
/* src/styles/tokens.module.css */
:root {
  --color-primary: #d96a3d;
  --color-surface: #f6f1e7;
  --spacing-md: 16px;
}
```

Each component's own `Component.module.css` references these variables via `var(--color-primary)` etc. Use `composes:` for cross-component reuse — never inline `style={{ ... }}` with hex or px. See SKILL.md §3.4 for the full web styling rules.
