# Bridge Example — Expo + React Native + NativeWind v4

Single CSS file imports the Tailwind layers plus NativeWind theme and declares the `@theme` tokens:

```css
/* global.css */
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "tailwindcss/utilities.css";
@import "nativewind/theme";

@theme {
  --color-primary: #d96a3d;
  --color-surface: #f6f1e7;
  --color-ink: #1c1c1c;
  --spacing-sm: 8px;
  --radius-md: 8px;
}
```

A `nativewind-env.d.ts` file at the project root ambient-imports the Tailwind types for TSX. Consumption uses className utilities only — see SKILL.md §3.3 for the NativeWind-specific component rules.
