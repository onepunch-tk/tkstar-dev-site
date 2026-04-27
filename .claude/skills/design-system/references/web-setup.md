# Web Library Setup — Tailwind CSS v4 + shadcn/ui

Configuration procedures for web projects. Verify all APIs via Context7 MCP before applying.

---

## Tailwind CSS v4

**Architecture change in v4**: No `tailwind.config.ts`. Configuration is CSS-first via `@theme` directive.

### Token-to-Theme Mapping

Map the bundle's extracted token values (from CSS vars / Tailwind classes / exported token files / inline styles in `docs/design-system/`) to Tailwind v4 `@theme` variables in the global CSS file:

```css
/* app.css or globals.css */
@import "tailwindcss";

@theme {
  /* Colors — each generates bg-*, text-*, border-* utilities */
  --color-primary: #007AFF;
  --color-on-primary: #FFFFFF;
  --color-secondary: #5856D6;
  --color-background: #FFFFFF;
  --color-surface: #F2F2F7;
  --color-error: #FF3B30;
  --color-success: #34C759;
  --color-warning: #FF9500;

  /* Typography */
  --font-primary: "Inter", system-ui, sans-serif;

  /* Spacing — sets the base unit for spacing scale */
  --spacing: 4px;

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
}
```

### Extend vs Override

**Extend (default):** Adding variables inside `@theme` adds to defaults — your values coexist with built-in ones.

**Override a namespace** (remove defaults in a category):

```css
@theme {
  --color-*: initial;   /* Clear ALL default colors */
  --color-primary: #007AFF;
  --color-secondary: #5856D6;
  /* Only your colors exist now */
}
```

**Override everything:**

```css
@theme {
  --*: initial;          /* Full clean slate */
  --spacing: 4px;
  --font-primary: Inter, sans-serif;
  --color-primary: #007AFF;
}
```

### CSS Custom Properties

All `@theme` variables are emitted as standard CSS custom properties on `:root`, accessible via `var()` anywhere.

---

## shadcn/ui

### components.json

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Key fields:
- `style` — Component style preset (`"default"`, `"radix-nova"`, etc.)
- `tailwind.config` — Empty string for Tailwind v4 (CSS-based config)
- `tailwind.css` — Path to global CSS file
- `tailwind.cssVariables` — `true` to use CSS variables for theming (recommended)
- `aliases` — Import path aliases matching `tsconfig.json` paths

### CSS Variables Theming (Tailwind v4 + shadcn)

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --radius-sm: calc(var(--radius) * 0.6);
  --radius-md: calc(var(--radius) * 0.8);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) * 1.4);
}

:root {
  --radius: 0.625rem;
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --secondary: oklch(0.269 0 0);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground; }
}
```

### Dark Mode

- `.dark` class on a parent element activates dark mode
- `@custom-variant dark (&:is(.dark *))` wires into Tailwind v4 variant system
- Libraries like `next-themes` toggle the `.dark` class on `<html>`

### Semantic Token List (shadcn)

30 tokens total: `background`, `foreground`, `card`, `card-foreground`, `popover`, `popover-foreground`, `primary`, `primary-foreground`, `secondary`, `secondary-foreground`, `muted`, `muted-foreground`, `accent`, `accent-foreground`, `destructive`, `border`, `input`, `ring`, `chart-1`–`chart-5`, `sidebar` (8 sidebar-specific tokens), `radius`.

---

## Token Integration Checklist

Before finishing web library setup, verify:

- [ ] `@theme` variables match the bundle's extracted token values
- [ ] Color values use consistent format (hex, oklch, or rgb — pick one)
- [ ] Both `:root` and `.dark` variants defined for all semantic colors
- [ ] `components.json` paths match project's actual file structure
- [ ] No hardcoded values in component files — all reference CSS variables
