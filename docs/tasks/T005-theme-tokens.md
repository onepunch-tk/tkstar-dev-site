# Task 005 — 디자인 토큰 이식 + Tailwind v4 `@theme` + `[data-theme]` dark variant + 다크모드 (F010)

| Field | Value |
|-------|-------|
| **Task ID** | T005 |
| **Phase** | Phase 1 — Foundation |
| **Layer** | Presentation (`components/chrome`, `hooks`, `app.css`) |
| **Branch** | `feature/issue-19-theme-tokens` |
| **Depends on** | T003 |
| **Blocks** | T010, T011, T012, T013, T014a, T014b, T015 |
| **PRD Features** | **F010** (다크모드 토글) |
| **PRD AC** | — (UI 표시 위주, Page-by-Page Key Features로 검증) |
| **예상 작업 시간** | 1d |
| **Status** | ✅ Done |

## Goal
디자인 정본의 oklch/JetBrains Mono 토큰을 Tailwind v4 `@theme` 블록으로 이식하고, `[data-theme]` HTML 속성 셀렉터 + `@variant dark` 커스텀 변형으로 다크/라이트 모드를 SSR-safe하게 구현한다. Topbar/Footer/ThemeToggle 골격까지 포함하여 후속 페이지 task가 chrome 본체를 신경쓰지 않도록 한다.

## Context
- **Why**: F010은 "전 페이지 공통" Support 기능. 토글 클릭 → `[data-theme]` 속성 변경 → CSS 변수 즉시 반영 → localStorage `proto-theme` 저장 → 새로고침 시 강제 모드 복원. SSR 환경에서 첫 렌더 깜빡임(FOIT/FOUC)을 막기 위해 root에 blocking script가 필수.
- **Phase 진입/완료 연결**: T003(Tailwind v4 가동) 완료 후 시작. T005가 Done이면 T010~T015 페이지 task가 Topbar/Footer/Theme 컴포넌트를 즉시 import 가능.
- **관련 PRD 섹션**: PRD `F010` Feature, `Tech Stack — Styling & UI`, `Tech Stack — Typography`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/app.css`, `app/presentation/components/chrome/`, `app/presentation/hooks/`, `app/root.tsx`, `public/fonts/`

## Scope

### In Scope
- `app/app.css`에 `@theme { --color-*, --font-* }` 토큰 이식 (`docs/design-system/styles.css`의 oklch 토큰을 Tailwind v4 native syntax로 변환)
- `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))` 커스텀 변형 정의
- `useTheme` hook — system 추종 + localStorage `proto-theme` 강제 전환
- Topbar / Footer / ThemeToggle 컴포넌트 골격 (placeholder 콘텐츠 + 토글 동작)
- `app/root.tsx`에 SSR-safe blocking script로 첫 렌더 깜빡임 방지
- JetBrains Mono self-host (`public/fonts/JetBrainsMono-{Regular,Medium,Bold}.woff2` + `@font-face`)

### Out of Scope
- Cloudflare Web Analytics 스니펫 (T020)
- 검색 트리거 버튼의 실제 Command Palette 연결 (T016)
- 페이지별 콘텐츠 (T010~T015)
- Satori OG용 `JetBrainsMono-Regular.ttf` (T018)

## Acceptance Criteria
- [x] 시스템 dark 설정 → 첫 진입 시 dark 테마 자동 적용 (FOUC 없음, 부트 스크립트가 `<head>` 동기 inline)
- [x] 토글 클릭 → `<html>`의 `data-theme` 속성이 `dark` ↔ `light` 토글 + 색상 즉시 전환
- [x] localStorage `proto-theme = "dark" | "light"` 저장됨 (화이트리스트 가드 적용)
- [x] 새로고침 시 localStorage 값으로 강제 모드 복원
- [x] Topbar에 `tkstar.dev` 브랜드(`.dev` accent 적용) + 현재 경로(`$ /…`) + 검색 트리거 disabled placeholder(플랫폼별 ⌘K/Ctrl+K) + ThemeToggle 노출
- [x] Footer에 © + GitHub(실 URL) / X / RSS / Contact 링크 노출 (Legal 링크는 T015에서 조건부 추가)
- [x] JetBrains Mono가 모든 본문/UI에 적용 (Regular preload + Medium/Bold @font-face)

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/hooks/__tests__/useTheme.test.ts`
  - **Case 1 — System 추종**: `matchMedia('(prefers-color-scheme: dark)')` mock으로 `matches: true` → hook이 `"dark"` 반환
  - **Case 2 — 강제 전환**: `setTheme("light")` 호출 시 localStorage `proto-theme = "light"` 저장 + `document.documentElement.dataset.theme === "light"`
  - **Case 3 — Persist**: 마운트 시 localStorage `proto-theme = "dark"`이 있으면 시스템 설정 무시하고 `"dark"` 적용
- `app/presentation/components/chrome/__tests__/ThemeToggle.test.tsx`
  - 클릭 시 `useTheme().setTheme`이 정확한 인자로 호출 (mock)

### Green
- `app/presentation/hooks/useTheme.ts` — useState + useEffect로 system + localStorage 추종
- `app/presentation/components/chrome/ThemeToggle.tsx` — 클릭 핸들러
- `app/presentation/components/chrome/Topbar.tsx`, `Footer.tsx` — 시각 골격
- `app/app.css` — `@theme { --color-bg, --color-fg, --color-accent, --font-mono, ... }`, `@variant dark`, `@font-face` for JetBrains Mono
- `app/root.tsx`에 SSR blocking script (`<script>` 태그를 `<head>` 가장 위에 dangerouslySetInnerHTML로 inject — localStorage 읽고 `data-theme` 속성 부착)

### Refactor
- `useTheme` hook의 SSR/client 분기를 `typeof window !== "undefined"`로 깨끗하게 분리
- Topbar/Footer의 link 데이터를 상수로 추출 (`app/presentation/lib/chrome-links.ts`)

## Files to Create / Modify

### Presentation — Hooks
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/useTheme.ts` | system + localStorage `proto-theme` 추종 / `setTheme(value: "dark" | "light")` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/__tests__/useTheme.test.ts` | Red 3 cases |

### Presentation — Chrome Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/chrome/Topbar.tsx` | 브랜드 / 현재 경로 / 검색트리거 placeholder / ThemeToggle |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/chrome/Footer.tsx` | © / GitHub / X / RSS / Contact (Legal은 T015에서) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/chrome/ThemeToggle.tsx` | 클릭 시 `useTheme.setTheme` 호출 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/chrome/__tests__/ThemeToggle.test.tsx` | RTL 클릭 핸들러 검증 |

### Presentation — Lib (refactor)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/chrome-links.ts` | `TOPBAR_LINKS`, `FOOTER_LINKS` 상수 |

### CSS (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/app.css` | `@theme { --color-bg, --color-fg, --color-muted, --color-accent, --font-mono }` + `@variant dark`(`&:where([data-theme='dark'], [data-theme='dark'] *)`) + `@font-face` for JetBrains Mono Regular/Medium/Bold |

### Root (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/root.tsx` | `<head>`에 SSR blocking script 추가 (localStorage `proto-theme` 읽고 `document.documentElement.dataset.theme` 부착). `<ChromeLayout>` slot에 `<Topbar />`, `<Footer />` 본체 채움 |

### Public Assets
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/public/fonts/JetBrainsMono-Regular.woff2` | self-host |
| `/Users/tkstart/Desktop/project/tkstar-dev/public/fonts/JetBrainsMono-Medium.woff2` | self-host |
| `/Users/tkstart/Desktop/project/tkstar-dev/public/fonts/JetBrainsMono-Bold.woff2` | self-host |

## Verification Steps

### 자동
- `bun run test` — `useTheme.test.ts` 3 cases pass + `ThemeToggle.test.tsx` 1 case pass
- `bun run typecheck` 통과
- `bun run lint` 통과

### 수동
- DevTools에서 `prefers-color-scheme` toggle (Rendering panel) → 첫 진입 시 자동 추종 (FOIT 없음 확인 — Network throttling Slow 3G로 검증)
- 토글 클릭 → 색상 즉시 전환 + `<html data-theme="...">` 속성 변경 (DevTools Elements 탭)
- DevTools Application → localStorage `proto-theme` 값 확인
- 새로고침 → localStorage 값 유지 + 강제 모드 복원
- Network 탭에서 `JetBrainsMono-Regular.woff2` fetch 확인

### 측정
- LCP에 영향 가는 FOIT 부재 확인 (Lighthouse Performance Phase 6에서 정식 측정, 여기서는 시각 확인 수준)

## Dependencies
- **Depends on**: T003 (Tailwind v4 가동)
- **Blocks**: T010~T015 (모든 페이지가 Topbar/Footer/ThemeToggle 사용)

## Risks & Mitigations
- **Risk**: SSR blocking script가 잘못 inject되어 첫 렌더 깜빡임 발생.
  - **Mitigation**: blocking script는 반드시 `<head>` 가장 위에 inline으로 inject. `dangerouslySetInnerHTML`을 사용하되 escape 처리 + script가 동기 실행되도록 `<script>` 태그(async/defer 금지).
- **Risk**: Tailwind v4 `@variant`의 `:where()` selector가 일부 모던 브라우저에서 specificity 문제.
  - **Mitigation**: `:where` specificity 0 활용 + 디자인 정본의 `[data-theme='dark'] *` 패턴을 그대로 채택 (이미 디자인 정본에서 검증).
- **Risk**: JetBrains Mono woff2 라이선스 누락.
  - **Mitigation**: SIL OFL 1.1 라이선스 명시 (필요 시 `public/fonts/OFL.txt` 동봉).

## References
- PRD `F010 다크모드 토글`, `Tech Stack — Styling & UI`, `Tech Stack — Typography`
- PROJECT-STRUCTURE.md `Cross-cutting Concerns Mapping` F010 행 (line 553)
- PROJECT-STRUCTURE.md `app/ Root Files` `app.css` (line 352)
- ROADMAP.md `Phase 1` Task 005
- `docs/design-system/styles.css` — oklch 토큰 정본
- [Tailwind v4 `@theme`](https://tailwindcss.com/docs/theme), [`@variant`](https://tailwindcss.com/docs/functions-and-directives#variant-directive)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-04-28 | T005 완료 — useTheme(ThemeProvider Context) / Topbar / Footer / ThemeToggle / app.css `@theme` + `@custom-variant dark` / SSR blocking script / JetBrains Mono self-host. Code+Design review P0/P1 수정(focus-visible, skip-link, brand `.dev` accent, lang="ko", aria-label 동적, ⌘K disabled+platform, motion-reduce, NavLink underline+aria-current, layout 토큰 promote, 부트 화이트리스트, font preload). Branch `feature/issue-19-theme-tokens`. Issue #19. | TaekyungHa |
