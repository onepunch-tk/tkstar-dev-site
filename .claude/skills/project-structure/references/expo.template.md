# Project Structure Guide (Expo Router + Clean Architecture)

## Overview

{OVERVIEW_CONTENT}

**Architecture Pattern**: Clean Architecture (domain/application/infrastructure/presentation separation)
**Framework**: Expo Router (File-based routing)
**Key Characteristics**:
- **CRITICAL**: Routes (`src/app/`) exist at the SAME LEVEL as CA layers, NOT inside presentation/
- Domain/Application layers 95%+ shareable with web (React Router Framework)
- Platform-specific code isolated via `*.ios.ts` / `*.android.ts` suffixes
- Native features via Expo SDK (camera, location, notifications, etc.)

## Expo App Config File Priority

Expo supports three config file formats. When reading/writing, follow this priority:

| Priority | File | When to use |
|----------|------|-------------|
| 1 | `app.config.ts` | Dynamic config with TypeScript. Access to `process.env`, conditional logic — **preferred for env-based projects** (dev/staging/prod, API keys via dotenv) |
| 2 | `app.config.js` | Dynamic config in JS. Same capabilities as .ts without TS toolchain |
| 3 | `app.json` | Static config. Simplest, no env access. Default for `create-expo-app` blank template |

**Writing plugins/configs**:
- `app.config.ts/js` → modify via TS/JS AST-level edit (export default/function returning the config object)
- `app.json` → simple JSON edit

**Migration note**: If a project starts with `app.json` and later requires env variables, rename to `app.config.ts` and convert JSON to a TS export. Do NOT have both `app.json` and `app.config.ts` simultaneously — Expo reads `app.config.*` first and ignores `app.json` when the dynamic variant exists (can cause confusion).

---

## Top-Level Directory Structure

```
{TOP_LEVEL_TREE}
```

**Key directories**:
- `src/app/` - **Expo Router routes** (REQUIRED, route-only. `_layout.tsx` for navigation, route groups, dynamic routes)
- `src/domain/` - Business rules, entities, schemas (100% shareable with web)
- `src/application/` - Services, ports (95% shareable with web)
- `src/infrastructure/` - Storage (AsyncStorage/SecureStore/MMKV), API clients, native integrations, external services
- `src/presentation/` - **ONLY reusable UI**: components/ui, components/forms, hooks, providers — **NO screens, NO navigation**
- `assets/` - Images, fonts, animations

---

## src/app/ Directory (Expo Router Routes)

**⚠️ CRITICAL**: This directory is for **routes ONLY**, NOT general presentation code.

**Role**: File-based routing (Expo Router)

**File conventions**:
- `_layout.tsx` - Layout wrapper (Stack, Tabs, Drawer navigation)
- `index.tsx` - Index route
- `[id].tsx` - Dynamic segment
- `(group)/` - Route group (no URL segment)
- `_sitemap.tsx` - Sitemap generation
- `+not-found.tsx` - 404 page

**Example structure**:
```
{APP_ROUTES_STRUCTURE}
```

**When to use**:
- Adding new screens/pages → Create route files here
- Changing navigation structure → Modify `_layout.tsx`
- Adding tab navigation → Use `(tabs)/_layout.tsx`

**Example routes**:
{APP_ROUTES_EXAMPLES}

---

## src/domain/

**Role**: Business rules and entity definitions (100% framework-agnostic, shareable with web)

**Contains**:
- Entity - Core business objects
- Types - Domain-related TypeScript types
- Schemas - Zod validation schemas
- Errors - Domain-specific error classes

**⚠️ Restrictions**:
- NO React/React Native imports
- NO Expo SDK imports
- Pure TypeScript only

**Structure**:
```
{DOMAIN_STRUCTURE}
```

**When to use**:
- Adding new business concepts (e.g., orders, products, payments)
- When API request/response validation schemas are needed
- Defining custom business errors

**Example entities/schemas**:
{DOMAIN_EXAMPLES}

---

## src/application/

**Role**: Business logic and use case implementation (95% shareable with web)

**Contains**:
- Service - Business logic implementation
- Port - External system interface definitions

**When to use**:
- Adding new business logic (sign-up, payment processing, etc.)
- When communication with external systems (email, payment gateway) is needed

**Structure**:
```
{APPLICATION_STRUCTURE}
```

**Port and Service relationship**:
- `*.port.ts` - Interface definition (what can be done)
- `*.service.ts` - Business logic (how to do it)

**Example services**:
{APPLICATION_EXAMPLES}

---

## src/infrastructure/

**Role**: External system integration and platform-specific implementations

**Contains**:
- **storage/**: AsyncStorage, SecureStore, MMKV adapters
- **api/**: HTTP clients (axios, fetch wrappers)
- **native/**: Expo SDK integrations (camera, location, notifications)
- **external/**: Third-party services (Firebase, Analytics, etc.)
- **config/**: DI container (optional, lightweight)

**When to use**:
- Adding local storage → `storage/`
- Creating API clients → `api/`
- Adding native features → `native/` (using Expo SDK)
- Adding external API integrations (payment, notifications) → `external/`

**Structure**:
```
{INFRASTRUCTURE_STRUCTURE}
```

**Example integrations**:
{INFRASTRUCTURE_EXAMPLES}

**Platform-specific implementations**:
```
infrastructure/
├── storage/
│   ├── token-storage.ts         # Interface
│   ├── token-storage.ios.ts     # iOS (SecureStore)
│   └── token-storage.android.ts # Android (EncryptedSharedPreferences wrapper)
```

---

## src/presentation/

**⚠️ CRITICAL**: This directory is for **REUSABLE UI ONLY**, NOT screens or navigation.

**Role**: Reusable UI components, hooks, providers

**Contains**:
- **components/ui/**: Base UI components (Button, Input, etc.)
- **components/forms/**: Form components (FormField, FormSelect, etc.)
- **hooks/**: Custom React hooks
- **providers/**: Context providers (Theme, Auth, etc.)

**When to use**:
- Creating reusable UI components → `components/ui/`
- Creating form components → `components/forms/`
- When custom hooks are needed → `hooks/`
- Adding global providers → `providers/`

**Structure**:
```
{PRESENTATION_STRUCTURE}
```

**Example components**:
{PRESENTATION_EXAMPLES}

**⚠️ DO NOT**:
- Add screen components here (use `src/app/` routes instead)
- Add navigation logic here (use `src/app/_layout.tsx`)

---

## assets/ Directory

**Role**: Static assets (images, fonts, animations)

**Contains**:
- `images/` - PNG, JPEG, SVG
- `fonts/` - Custom fonts
- `animations/` - Lottie JSON files

**When to use**:
- Adding images → `assets/images/`
- Adding custom fonts → `assets/fonts/` + register in `app.json`
- Adding animations → `assets/animations/`

---

## Platform-Specific Conventions

### File Suffix Strategy

```
component.tsx           # Shared (default)
component.ios.tsx       # iOS-specific
component.android.tsx   # Android-specific
component.native.tsx    # Both iOS & Android (NOT web)
component.web.tsx       # Web-specific (if using Expo Web)
```

**Resolution order**:
1. `.ios.tsx` or `.android.tsx` (platform-specific)
2. `.native.tsx` (native platforms)
3. `.tsx` (fallback)

**Example**:
```typescript
// button.tsx (shared)
export const Button = () => <Pressable>...</Pressable>;

// button.ios.tsx (iOS-specific haptic feedback)
import * as Haptics from 'expo-haptics';
export const Button = () => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };
  return <Pressable onPress={handlePress}>...</Pressable>;
};
```

---

## Path Aliases

```typescript
// Defined in tsconfig.json
{PATH_ALIASES}
```

**Usage example**:
```typescript
{PATH_ALIAS_EXAMPLES}
```

---

## Dependency Injection Approach

**Recommendation**: Use lightweight DI for mobile apps (avoid heavy libraries like InversifyJS for bundle size)

**Option 1: Simple Service Locator**
```typescript
// src/infrastructure/config/container.ts
export const container = {
  authService: new AuthService(),
  userService: new UserService(),
};

// Usage in components
import { container } from '~/infrastructure/config/container';
const user = await container.authService.login();
```

**Option 2: React Context**
```typescript
// src/presentation/providers/services-provider.tsx
const ServicesContext = createContext({
  authService: new AuthService(),
});

export const useServices = () => useContext(ServicesContext);

// Usage
const { authService } = useServices();
```

---

## State Management Recommendations

| Solution | Use When | Bundle Impact |
|----------|----------|---------------|
| React Context + useReducer | Simple global state (theme, auth) | Minimal |
| Zustand | Medium complexity, atomic state slices | ~3KB |
| Redux Toolkit | Complex state, time-travel debugging needed | ~20KB |
| TanStack Query | Server state management (API caching) | ~15KB |

**Recommendation**: Start with Context, add Zustand if needed.

---

## File Location Summary by Task

| Task | Location |
|------|----------|
| Add new screen/page | `src/app/` (route file) |
| Add reusable UI component | `src/presentation/components/ui/` |
| Add business logic | `src/application/{domain}/` |
| Add local storage | `src/infrastructure/storage/` |
| Add API client | `src/infrastructure/api/` |
| Add native feature (camera, location) | `src/infrastructure/native/` |
| Define types/entities | `src/domain/{domain}/` |
| Write test files | Co-located `__tests__/` directories (e.g., `src/{layer}/components/__tests__/`). **Do NOT place `.test.ts` files directly in `app/`** — Expo Router treats them as routes. |
| Add static assets | `assets/` |

---

## Key Differences from React Router Framework

| Aspect | Expo Router | React Router Framework |
|--------|-------------|------------------------|
| Route location | `src/app/` (top-level) | `app/presentation/routes/` (inside CA layer) |
| Navigation API | `expo-router` (`useRouter`, `Link`) | `react-router` (`useNavigate`, `Link`) |
| Layout system | `_layout.tsx` file-based | Layout routes in `routes.ts` |
| Platform handling | `*.ios.tsx` / `*.android.tsx` suffixes | Single web platform |
| Native features | Expo SDK (camera, notifications, etc.) | Web APIs only |
