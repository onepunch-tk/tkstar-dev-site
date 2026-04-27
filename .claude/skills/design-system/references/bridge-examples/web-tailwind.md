# Bridge Example — Next.js / React Router / Vite + React with Tailwind v4

One CSS file per app imports Tailwind and declares tokens under `@theme`. The exact file name depends on the framework:

- Next.js App Router → `app/globals.css`
- React Router v7 → `app/app.css`
- Vite + React → `src/app.css` or `src/index.css`

```css
/* app/globals.css (or app.css / src/app.css — resolve via docs/PROJECT-STRUCTURE.md) */
@import "tailwindcss";

@theme {
  --color-primary: #d96a3d;
  --color-surface: #f6f1e7;
  --color-ink: #1c1c1c;
  --font-display: "Caveat", system-ui, sans-serif;
}
```

Consumption uses Tailwind utilities (e.g. `bg-primary`, `text-ink`). For recipe-style conditional styling prefer `cva` / `clsx` declared at module scope — see SKILL.md §3.4 for the web-specific component rules.
