---
name: design-system
description: "Bridges design tokens from docs/design-system/ to the project's native theme format and enforces component styling rules. Loaded by ux-design-lead in BOOTSTRAP / APPLY / REVIEW / MODIFY modes."
when_to_use: "When designing, applying, or reviewing UI. Covers Expo+RN (Unistyles / NativeWind / plain StyleSheet), Next.js / React Router / Vite+React (Tailwind v4 / CSS Modules). Invoke `/design-system update` to refresh web-setup.md and mobile-setup.md to the installed library versions."
allowed-tools: Read, Write, Glob, Grep, Bash, WebFetch, WebSearch, mcp__context7__resolve-library-id, mcp__context7__query-docs
argument-hint: "[update]"
---

# Design System Skill

Procedures and references for analyzing a project's design source (`docs/design-system/`) and bridging it to the project's native theme format.

Core principles:
- **`docs/design-system/` is a read-only input directory.** Its structure varies per project, so do not assume a fixed layout — read every file that exists, recursively.
- **Bridge straight to the project's native format** (TypeScript const, Tailwind `@theme`, CSS vars, etc.). No intermediate token-schema conversion step.
- **Cross-verify every library with Context7 MCP + WebSearch before installing.**

---

## 1. Design System Bootstrap Procedure

The order the ux-design-lead agent invokes. This mirrors the agent's Pre-Work but provides more granular steps.

### 1.1 Gather context — `docs/PROJECT-STRUCTURE.md` + full `docs/design-system/` analysis

1. **Read `docs/PROJECT-STRUCTURE.md` first.** This decides the correct paths for bridge files and reusable components. If placement is ambiguous, ask the user — never guess.
2. Read `docs/ROADMAP.md` and `docs/PRD.md` (if present) for implementation phase, scope, and business context. **Not design authority**: `docs/design-system/` is the design SoT, and the agent's design judgment drives it. If ROADMAP/PRD UI/UX sections contradict the bundle (wrong component list, missing states, outdated phase order, stale screen flow), **flag the drift in the output and propose concrete sync edits to ROADMAP/PRD** — do not silently follow them over the bundle.
3. Read `docs/design-system/**/*` recursively. **Do not assume a fixed subdirectory layout** — different projects structure bundles differently (handoff bundles, prototype directories, markdown specs, exported token files, chat transcripts, image drops, etc.). Read whatever is present; do not check for specific filenames.
4. Classify files by content, not by name:
   - Markdown / text (`.md`, `.txt`) → handoff instructions, user intent, design rationale, spec
   - Markup / styles (`.html`, `.css`, `.scss`) → prototype structure, CSS vars, layout
   - Scripts / components (`.js`, `.jsx`, `.ts`, `.tsx`) → reference implementations
   - Data (`.json`, `.yaml`) → existing tokens / config
   - Images (`.png`, `.jpg`, `.svg`, `.webp`) → read them visually
5. Extract: design language, color palette, typography, spacing, radius, shadow, layout patterns, screen flow, animation/interaction cues, aesthetic direction (handdrawn / flat / minimalist, etc.).
6. If anything is ambiguous (wireframe vs. final, whether to keep a custom font/color all the way to production, etc.), ask the user.

### 1.2 Detect project nature & package manager

- `package.json` → framework (Expo+RN / Next.js / React Router / React+Vite) + existing styling libs
- Monorepo signals (`turbo.json` / `pnpm-workspace.yaml` / root `workspaces`) → move into the relevant app/package directory
- Lockfile → package manager:
  - `bun.lock` → **bun**
  - `pnpm-lock.yaml` → **pnpm**
  - `yarn.lock` → **yarn**
  - `package-lock.json` → **npm**

### 1.3 Library gap analysis (proactive install policy)

From the bundle analysis and Design Principles, identify which areas the current stack lacks. Candidates live in §4 Library Recommendations Matrix.

**Pre-install verification:**
1. Use Context7 MCP (`resolve-library-id` → `query-docs`) to check the target version's API / config / peer deps.
2. Use WebSearch to check recent migration notes / breaking changes / known issues / compatibility.
3. Cross-verify both sources. On disagreement, ask the user.

Install with the detected package manager (bun / pnpm / yarn / npm).

### 1.4 Bridge format determination

Determine bridge output files from the environment × styling-lib combination. See §2 Bridge Format Matrix.

- If bridge files already exist, compare values and sync on drift.
- Otherwise create them from scratch. Paths come from PROJECT-STRUCTURE.md.

### 1.5 Token extraction & bridge

Pull token values directly from the bundle's source files:
- **CSS vars** (`:root { --color-primary: #d96a3d; ... }`) → key-value mapping.
- **Tailwind classes** (e.g., `bg-[#d96a3d]`, `bg-primary`) → aggregate the frequently used classes into a common set of values.
- **Inline styles / props** (`style={{ color: '#d96a3d' }}`) → literal values.
- **Exported tokens (JSON / YAML)** → map the existing key paths.

Write the extracted values into the environment's native format bridge files. No intermediate schema conversion.

If sync is required, summarize the drift in your output.

### 1.6 (Optional) Record autonomous bootstrap decisions

- If there is no bundle and you autonomously bootstrapped defaults, record the rationale (aesthetic direction, token choices, font/color decisions) in your final output report and as top-of-file comments in the generated bridge files.
- If a bundle exists, do not create new files in `docs/design-system/` — the bundle itself is the spec. Treat that directory as read-only.

### 1.7 Report

Final output:
- Analysis summary (which bundle files you referenced)
- Installed libraries and versions, with Context7/WebSearch verification notes
- Bridge files created or modified, with the PROJECT-STRUCTURE.md rule that justified each path
- Decisions made (aesthetic direction, handling of custom fonts/colors, etc.)

---

## 2. Bridge Format Matrix

Bridge output files and formats by environment × styling lib.

| Environment | Styling lib | Bridge files | Format |
|---|---|---|---|
| Expo+RN | Unistyles v3 | `src/presentation/theme/tokens.ts`, `theme.ts`, `unistyles.config.ts` | TypeScript const + `StyleSheet.configure` |
| Expo+RN | NativeWind v4 | `global.css` + `nativewind-env.d.ts` | Tailwind `@theme` CSS vars |
| Expo+RN | StyleSheet only | `src/presentation/theme/tokens.ts` + `useTheme` hook | TypeScript const |
| Next.js | Tailwind v4 | `app/globals.css` | Tailwind `@theme` CSS vars |
| Next.js | CSS Modules | `src/styles/tokens.module.css` + `:root` vars | CSS vars |
| React Router / Vite | Tailwind v4 | `app/app.css` or `src/app.css` | Tailwind `@theme` CSS vars |
| React (Vite) | Tailwind v4 | `src/app.css` or `src/index.css` | Tailwind `@theme` CSS vars |

> **The paths above are examples. Actual paths follow the project's `docs/PROJECT-STRUCTURE.md`.** If they disagree, PROJECT-STRUCTURE.md wins.

### Concrete bridge examples

Per-stack examples live in `references/bridge-examples/` so the main SKILL.md stays focused on rules:

- Expo + React Native + Unistyles v3 → [references/bridge-examples/expo-unistyles.md](references/bridge-examples/expo-unistyles.md)
- Expo + React Native + NativeWind v4 → [references/bridge-examples/expo-nativewind.md](references/bridge-examples/expo-nativewind.md)
- Next.js / React Router / Vite + React with Tailwind v4 → [references/bridge-examples/web-tailwind.md](references/bridge-examples/web-tailwind.md)
- Next.js with CSS Modules → [references/bridge-examples/nextjs-cssmodules.md](references/bridge-examples/nextjs-cssmodules.md)

---

## 3. Component Styling Rules

How components consume bridge tokens, across every supported stack. **Applies in BOOTSTRAP / APPLY / REVIEW / MODIFY modes** — the ux-design-lead agent enforces these when writing or reviewing component styles. The agent detects the stack in Pre-Work Step 3 and applies the matching subsection; §3.0 is universal and applies to every stack.

### 3.0 Universal principle (all stacks)

Stable styles MUST NOT be allocated per render. This is the same bug in every stack; only the fix differs.

**Forbidden patterns** — each allocates a new reference on every render, breaks prop equality / React Compiler / `React.memo`, and bypasses native update engines (Unistyles C++, StyleX resolver, etc.):

- Inline JSX literal: `<View style={{ padding: 16 }} />`, `<div style={{ padding: 16 }}>`
- **Named style variable declared inside a component body**:
  ```tsx
  // FORBIDDEN — type annotation does NOT change allocation cost
  export default function Foo() {
    const labelStyle: TextStyle = { color: theme.colors.onSurface }
    return <Text style={labelStyle} />
  }
  ```
  This is the inline literal hidden behind a variable name. Same bug whether typed as `ViewStyle` / `TextStyle` / `ImageStyle` / `CSSProperties`.
- Style objects built inside `.map()` / render callbacks — use the stack's `variants` / className-composition mechanism.
- Style definition call (`StyleSheet.create` / `stylex.create` / `cva(...)`) inside a component body, `useMemo`, or `useCallback` — `useMemo` is not a fix, lift to module scope.

**Allowed exception — runtime-computed values only** (cannot be known at module load time):
- Reanimated `useAnimatedStyle` / Framer Motion `animate` shared values
- Gesture-driven offsets (Pan/Fling handlers)
- `onLayout` / `measure` dimensions
- Per-item dynamic props in list renderers — pass only the dynamic prop; stable props stay at module scope.

**Conditional styling** — use the stack's variant mechanism (Unistyles `variants`, `cva`, Tailwind class recipes, CSS Modules `composes`), never conditional object merging in render.

**Cross-component sharing** — do NOT export a shared stylesheet/object for import by multiple components. Extract the reusable surface as a variant-driven component and consume via props.

**Token access** — values come from the bridge (`tokens` import, theme closure arg, `@theme` CSS vars). No hardcoded hex / rgb / px / font-family / font-size outside bridge files.

### 3.1 Expo+RN (Unistyles v3 / StyleSheet)

Applies §3.0 universal principle. Stack-specific details below.

Unistyles v3 re-exports `StyleSheet.create` from `react-native-unistyles` with theme + runtime closures:

```tsx
import { StyleSheet } from 'react-native-unistyles'

export function Card({ children }: Props) {
  return <View style={styles.container}>{children}</View>
}

const styles = StyleSheet.create((theme, rt) => ({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.color.surface,
    borderRadius: theme.radius.md,
    paddingTop: rt.insets.top,
  },
}))
```

- **Location** — same component file, module top-level, below the component function. Do not split into a sibling `.styles.ts` unless `docs/PROJECT-STRUCTURE.md` explicitly mandates it; Unistyles closures already bind to theme + runtime, so a separate file adds navigation cost without perf win.
- **Conditional styling via Unistyles `variants`**:

  ```tsx
  export default function Pill({ selected, label }: Props) {
    return (
      <Pressable style={styles.pill(selected)}>
        <Text style={styles.pillText(selected)}>{label}</Text>
      </Pressable>
    )
  }

  const styles = StyleSheet.create((theme) => ({
    pill: {
      height: theme.control.height.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      variants: {
        selected: {
          true: { backgroundColor: theme.colors.primaryContainer },
          false: { backgroundColor: theme.colors.surfaceContainer },
        },
      },
    },
    pillText: {
      fontSize: theme.typography.fontSize.sm,
      fontFamily: theme.typography.fontFamily.body,
      fontWeight: theme.typography.fontWeight.medium,
      variants: {
        selected: {
          true: { color: theme.colors.onPrimaryContainer },
          false: { color: theme.colors.onSurfaceVariant },
        },
      },
    },
  }))
  ```

- **Cross-component sharing** — extract a `variants`-driven reusable component. Do NOT import a shared `StyleSheet` across components; Unistyles optimizes per-instance and shared imports lose that path.
- **Token access** — theme closure (`(theme, rt) => ...`) or the bridge `tokens` import. Never string-key lookups.

### 3.2 Vanilla React Native (no Unistyles)

Same rule — `StyleSheet.create` at module top-level, token imports only, no inline objects except for runtime-computed values.

### 3.3 NativeWind v4 (Expo+RN)

- **className utilities only** — the `@theme` CSS vars are the token source; no inline `style={{}}` with hex/px values.
- **Dynamic values**: use `style` prop with shared values only when className can't express the runtime computation.

### 3.4 Web (Tailwind v4 / CSS Modules / shadcn)

- **Prefer utility classes or CSS Module classes** over `style={{}}`. Inline styles bypass `@theme` tokens and cost the same reconciliation penalty as on native.
- **Runtime-only exception**: computed transforms, measured sizes, animation-driven values.

### 3.5 Review checklist

When running REVIEW mode's **Visual Consistency** and **Component Composition** criteria, flag:

**Universal (any stack — §3.0):**
- [ ] Inline `style={{ ... }}` literal in JSX (unless it wraps a runtime-computed value).
- [ ] Named style variable declared inside a component body (`const x: TextStyle | ViewStyle | ImageStyle | CSSProperties = {...}`) — same allocation bug as inline, must lift to module scope.
- [ ] Style definition call (`StyleSheet.create` / `cva(...)` / `stylex.create`) inside a component body, `useMemo`, or `useCallback`.
- [ ] Style objects built inside `.map()` / render callbacks instead of using the stack's variants / class-composition mechanism.
- [ ] Shared stylesheet / recipe imported across 2+ components instead of extracted as a variant-driven component.
- [ ] Hardcoded hex / rgb / px / font-family / font-size outside bridge files.

**Stack-specific:**
- [ ] (Expo+RN + Unistyles) Theme value pulled via a string key instead of the typed theme closure argument.
- [ ] (Expo+RN + Unistyles) Conditional style solved by object merging instead of `variants(...)` call syntax.
- [ ] (NativeWind) `style={{}}` used where className could express the value (tokens bypassed).
- [ ] (Web + Tailwind) Utility classes built via string concatenation in render instead of a `cva` / `clsx` recipe at module scope.
- [ ] (CSS Modules) Shared style imported across components instead of `composes` or a variant-driven component.

**Bundle / roadmap drift:**
- [ ] UI/UX drift between `docs/ROADMAP.md` / `docs/PRD.md` and `docs/design-system/` (wrong component list, missing visual states, outdated phase order, stale screen flow) — file as a drift section in the review report with concrete sync edits the user can approve.

---

## 4. Library Recommendations Matrix

For design areas that are hard to implement by hand (animation, charts, icons, fonts, etc.), **proactively install a verified library**. **Never hand-draw SVG and never implement animation loops from scratch.**

| Gap area | Expo+RN | Next.js | React Router / Vite | React (Vite) |
|---|---|---|---|---|
| **Animation** | `react-native-reanimated` v4 (+ `react-native-gesture-handler`) | `framer-motion`, `motion`, `gsap` | `framer-motion` | `framer-motion` |
| **Charts / graphs** | `@shopify/react-native-skia`, `victory-native`, `react-native-svg-charts` | `recharts`, `visx`, `nivo`, `@nivo/*` | `recharts`, `visx` | `recharts`, `visx` |
| **Heatmap (calendar)** | Custom Skia, `react-native-calendar-heatmap` | `react-calendar-heatmap`, `@uiw/react-heat-map` | same | same |
| **Icons** | `@expo/vector-icons`, `lucide-react-native`, `phosphor-react-native` | `lucide-react`, `react-icons`, `heroicons`, `phosphor-react` | same | same |
| **Fonts (custom)** | `expo-font` + `@expo-google-fonts/*` | `next/font/google`, `next/font/local` | `@fontsource/*` | `@fontsource/*` |
| **Haptics / feedback** | `expo-haptics` | — | — | — |
| **Gesture** | `react-native-gesture-handler` | `@use-gesture/react` | same | same |
| **Skeleton / loading** | `react-native-skeleton-placeholder`, Reanimated-based | `react-loading-skeleton` | same | same |
| **Toast / notification** | `react-native-toast-message`, `burnt` | `sonner`, `react-hot-toast` | same | same |
| **Bottom sheet / modal** | `@gorhom/bottom-sheet`, React Native Modal | `vaul`, `react-modal`, shadcn Dialog | same | same |
| **Theme system** | `react-native-unistyles` v3, `nativewind` v4, StyleSheet | `tailwindcss` v4, CSS Modules | same | same |

Rules:
- **Never hand-draw icon SVGs** — pick from a well-known icon pack.
- **Prefer libraries already installed** in the project.
- When multiple candidates fit, prefer the one that aligns naturally with the existing architecture (e.g., if `nativewind` is in use, prefer NativeWind-friendly helpers).
- **Cross-verify every install with Context7 + WebSearch** first.
- For complex areas (charts, Skia drawing, gestures), review official examples and migration notes before applying.

---

## 5. Library Setup Procedure

### 5.1 Detect platform

Look at `package.json` dependencies for platform signals:
- Web: `tailwindcss`, `@shadcn/ui`, `react-router`, `next`
- Mobile: `expo`, `react-native`, `nativewind`, `react-native-unistyles`
- Both: web and mobile signals are present together

### 5.2 Detect workspace structure

- **Monorepo**: `turbo.json` / `pnpm-workspace.yaml` / root `package.json` `workspaces` → move into the relevant app/package directory.
- **Single project**: work at the project root.

### 5.3 Load the platform-specific reference

- **Web**: follow `references/web-setup.md`.
- **Mobile**: follow `references/mobile-setup.md`.
- Both: run the web setup in the web app directory and the mobile setup in the mobile app directory.

### 5.4 Token extraction

Extract token values directly from the source files in `docs/design-system/` and record them in the environment-native format from §2:

- **From CSS vars**: `:root { --color-primary: #d96a3d; ... }` → key-value mapping.
- **From Tailwind classes**: aggregate `bg-*`, `text-*`, `p-*`, etc. in use and derive common values.
- **From inline styles**: `style={{ color: '#d96a3d' }}` → literal values.
- **From existing JSON tokens**: map the existing structure directly into the bridge format.

Write the extracted values as TypeScript const / Tailwind `@theme` / CSS vars. No intermediate schema conversion.

### 5.5 Library management

- Read `package.json` and **prefer existing libraries**.
- If a required library is missing, install it with the detected package manager.
- **Cross-verify with Context7 MCP + WebSearch before install.** On disagreement, confirm with the user.
- After install, update the required config files (e.g., `metro.config.js`, `tailwind.config.ts`, `babel.config.js`).

---

## `/design-system update` — Refresh Setup References

When invoked with the `update` argument, this skill refreshes `references/web-setup.md` and `references/mobile-setup.md` to match the project's currently installed library versions.

### Procedure

#### 1. Detect Workspace
- Check for `turbo.json`, `pnpm-workspace.yaml`, or root `package.json` with `workspaces` field
- **Monorepo**: Scan all app/package directories for `package.json` files
- **Single project**: Read root `package.json`

#### 2. Identify UI/UX Libraries and Versions
Scan `package.json` `dependencies` and `devDependencies` for:

| Library | Package Name |
|---------|-------------|
| Tailwind CSS | `tailwindcss` |
| shadcn/ui | `@shadcn/ui` or check `components.json` |
| NativeWind | `nativewind` |
| Unistyles | `react-native-unistyles` |
| Reanimated | `react-native-reanimated` |
| Expo | `expo` |

Record the **exact version** of each found library.

#### 3. Learn Latest Documentation
For each detected library:
1. Use **Context7 MCP** (`resolve-library-id` → `query-docs`) to fetch version-specific documentation
2. Use **WebSearch** to find official migration guides or breaking changes for the installed version
3. Focus on: configuration API, setup requirements, breaking changes from previous versions

#### 4. Update Reference Files
Based on learned documentation:
- **`references/web-setup.md`**: Update Tailwind CSS config syntax, shadcn/ui setup, CSS variables pattern to match installed versions
- **`references/mobile-setup.md`**: Update NativeWind Metro config, Unistyles API, Reanimated Babel plugin to match installed versions

For each update:
- Preserve the file structure (sections, headings, checklist)
- Replace code examples with version-accurate API usage
- Add version notes where behavior differs from the default reference (e.g., "NativeWind v5 uses...")
- Note any deprecated APIs that should be avoided

#### 5. Report Changes
After updating, report:
- Which libraries were found and their versions
- What changed in each reference file
- Any libraries NOT found (skip those sections, do not remove them)
