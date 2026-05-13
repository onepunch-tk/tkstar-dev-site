# Expo Router + React Native — Structure Reference

> This document is a **reference guide** used by
> `project-structure-generator` when filling the JSON input for an Expo
> Router project.

---

## Framework identification

- **Framework value**: `expo`
- **Detection**: `app.config.ts/js` or `app.json` containing an `expo`
  key, AND `expo` in `dependencies`
- **Variants**: none

### Expo config file priority

| Priority | File | Notes |
|---|---|---|
| 1 | `app.config.ts` | Dynamic config; `process.env` access, conditional logic |
| 2 | `app.config.js` | Same dynamic capability without TS toolchain |
| 3 | `app.json` | Static config; default for `create-expo-app` |

> When both `app.config.*` and `app.json` exist, the dynamic variant wins
> and the static file is ignored. Record only the file actually used.

---

## Standard directory tree (skeleton)

```tree
.
├── src/
│   ├── app/                        # Expo Router routes ONLY
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (tabs)/                 # Route group (no URL segment)
│   │   │   └── _layout.tsx
│   │   ├── [id].tsx                # Dynamic segment
│   │   └── +not-found.tsx
│   ├── domain/
│   ├── application/
│   ├── infrastructure/
│   │   ├── storage/                # AsyncStorage / SecureStore / MMKV
│   │   ├── api/
│   │   ├── native/                 # Expo SDK integrations
│   │   └── external/
│   └── presentation/               # Reusable UI only (no screens, no nav)
│       ├── components/
│       │   ├── ui/
│       │   └── forms/
│       ├── hooks/
│       └── providers/
└── assets/
    ├── images/
    ├── fonts/
    └── animations/
```

> **CRITICAL**: `src/app/` is reserved for Expo Router routes. Screen
> components and navigation logic live there. `src/presentation/` is for
> reusable UI ONLY — not screens. The coexistence of a routing dir and a
> generic presentation dir at the same level is what makes Expo Router
> distinctive.

---

## CA layer mapping (JSON `layers[]`)

| Layer | Standard path | `role_ko` (Korean output) | `contains_ko` (Korean output) |
|---|---|---|---|
| Domain | `src/domain/` | 비즈니스 규칙과 엔티티 정의 (외부 의존 0, 웹과 100% 공유 가능) | 엔티티, 값 객체, Zod 스키마, 도메인 오류 |
| Application | `src/application/` | Use case 와 외부 시스템 인터페이스 정의 (웹과 95% 공유) | Service, Port |
| Infrastructure | `src/infrastructure/` | 외부 시스템 + 네이티브 통합 | 로컬 스토리지, API 클라이언트, Expo SDK 어댑터 |
| Presentation | `src/presentation/` | 재사용 UI (화면/라우팅 제외) | UI 컴포넌트, 폼 컴포넌트, 훅, Provider |

> `src/app/` sits outside the CA layers — record it in `directory_tree`
> but do NOT include its path in `layers[].paths`.

---

## Path alias conventions

Default pattern (`tsconfig.json`):

| Alias | Resolves to |
|---|---|
| `~/*` | `./src/*` |
| `@/*` | `./src/*` (project-dependent) |

---

## Framework-specific extras candidates

### Expo Router route naming

- `_layout.tsx` — Stack / Tabs / Drawer navigation wrapper
- `index.tsx` — index route
- `[id].tsx` — dynamic segment
- `(group)/` — route group (no URL segment)
- `_sitemap.tsx` — generated sitemap
- `+not-found.tsx` — 404 page

### Platform-specific file suffixes

| Suffix | Platform | Notes |
|---|---|---|
| `*.tsx` | all | default |
| `*.ios.tsx` | iOS only | |
| `*.android.tsx` | Android only | |
| `*.native.tsx` | iOS + Android (excludes web) | |
| `*.web.tsx` | Expo Web | |

Resolution order: `.ios` / `.android` → `.native` → `.tsx`

### Test file location caveat

- Place unit tests in a sibling `__tests__/` directory.
- **Do NOT put `*.test.ts` files directly under `src/app/`** — Expo Router
  treats them as routes.

---

## File location summary candidates

| Task (Korean output) | Location |
|---|---|
| 새 화면/페이지 | `src/app/` (라우트 파일) |
| 재사용 UI 컴포넌트 | `src/presentation/components/ui/` |
| 폼 컴포넌트 | `src/presentation/components/forms/` |
| 비즈니스 로직 | `src/application/{도메인}/` |
| 로컬 스토리지 | `src/infrastructure/storage/` |
| API 클라이언트 | `src/infrastructure/api/` |
| 네이티브 기능 (카메라, 위치) | `src/infrastructure/native/` |
| 엔티티/타입 정의 | `src/domain/{도메인}/` |
| 단위 테스트 | 소스 옆 `__tests__/` (단 `src/app/` 직접 X) |
| 정적 자산 | `assets/` |

---

## Scope discipline (do NOT include)

- State management recommendation tables (Zustand vs Redux etc.) — that
  belongs in PRD `tech_stack`
- DI implementation code examples
- Component implementation snippets
- Domain entity definitions / data models
- Per-screen user flows / business rules
