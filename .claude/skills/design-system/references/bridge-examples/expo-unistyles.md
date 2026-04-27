# Bridge Example — Expo + React Native + Unistyles v3

Generates three TypeScript files under the project's Presentation theme directory (resolved via `docs/PROJECT-STRUCTURE.md`):

```ts
// src/presentation/theme/tokens.ts
export const tokens = {
  color: {
    primary: '#d96a3d',
    surface: '#f6f1e7',
    ink: '#1c1c1c',
  },
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
} as const
```

```ts
// src/presentation/theme/theme.ts
import { tokens } from './tokens'
export const lightTheme = { ...tokens, name: 'light' } as const
export const darkTheme = {
  ...tokens,
  color: { ...tokens.color, surface: '#1a1816', ink: '#ede6d3' },
  name: 'dark',
} as const
```

```ts
// src/presentation/theme/unistyles.config.ts
import { StyleSheet } from 'react-native-unistyles'
import { lightTheme, darkTheme } from './theme'

StyleSheet.configure({
  themes: { light: lightTheme, dark: darkTheme },
  settings: { initialTheme: 'light' },
})
```

Consumption in components uses `StyleSheet.create((theme, rt) => ...)` from `react-native-unistyles`; see `design-system` SKILL.md §3.1 for the component rules.
