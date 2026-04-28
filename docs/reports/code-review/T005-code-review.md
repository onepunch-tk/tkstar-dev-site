# T005 Unified Code Review Report — 디자인 토큰 + 다크모드 chrome shell

**Branch**: `feature/issue-19-theme-tokens`
**Base**: `origin/development`
**HEAD**: `f62d470 ✨ feat(T005): theme tokens + chrome shell + SSR blocking (green)`
**Status**: Pending
**Generated**: 2026-04-28 (UTC)
**Reviewed Files**: 10 files (assets 제외)

---

**AI Agent Instructions**:
1. Resolve P0 / P1 issues before merge. P2는 deferable.
2. Issue를 수정한 즉시 Fix Checklist의 체크박스를 업데이트한다.
3. 모든 P0 / P1가 해결되면 Status를 "Complete"로 변경한다.

---

## Executive Summary

T005는 (1) Tailwind v4 `@theme` 토큰, (2) `[data-theme]` 셀렉터 기반 다크모드, (3) SSR blocking inline 스크립트로 FOUC 방지, (4) Topbar / Footer / ChromeLayout chrome shell, (5) `useTheme` + `ThemeToggle` 훅/컴포넌트 도입. TDD 사이클(Red → Green)이 명확히 분리되어 있고 코드는 전반적으로 단순하고 읽기 좋다.

치명 결함은 없으며 **P0 블로커 0건**. 다만 두 건의 **High** 이슈(`useTheme` 인스턴스 간 상태 비동기, `<html lang="en">` 한국어 only 정책 위반)와 세 건의 **Medium** (미사용 `isSystem` 노출, localStorage 부트 스크립트의 미검증 값 DOM 할당, `matchMedia change` 미구독) 그리고 다섯 건의 **Low** 개선 제안이 있다.

| Domain | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| Code Quality | 0 | 1 | 2 | 3 |
| Security | 0 | 0 | 1 | 0 |
| Performance | 0 | 0 | 0 | 1 |
| Accessibility | 0 | 1 | 0 | 1 |
| **Total** | **0** | **2** | **3** | **5** |

**Overall Grade**: B+ (small repo, surgical scope, clean style — 두 P1만 정리하면 A-).

---

## Architecture & Clean Architecture Compliance

| Layer | Status | Notes |
|-------|--------|-------|
| Domain | n/a | T005 변경 없음 |
| Application | n/a | T005 변경 없음 |
| Infrastructure | n/a | T005 변경 없음 |
| Presentation | OK | `useTheme`(hook) + `ThemeToggle` / `Topbar` / `Footer` / `ChromeLayout` 모두 Presentation 내부. 외부 의존성 직접 import 없음. |

**Dependency direction**: 내부→외부 위반 없음. `app/root.tsx` → `presentation/layouts/*` 정상.

**SOLID Compliance**: 단일 책임 잘 지켜짐. `ChromeLayout`은 순수 wrapper, `Topbar`는 nav, `Footer`는 footer로 분리. `useTheme`은 persistence + read 책임 한 파일에 묶여 있는데 정도 적절(과도 분리 아님).

---

## Critical Issues (P0)

> Bugs, security vulnerabilities, production blockers — must fix before merge

없음.

---

## Major Improvements (P1 — High)

> Important issues affecting maintainability, security, accessibility — should fix before merge

### #1 — `useTheme` 다중 소비자 간 React state 비동기

- **Domain**: Quality
- **File**: `app/presentation/hooks/useTheme.ts` L19-34
- **Category**: Side-effect awareness / React state model
- **Confidence**: High (95%)
- **Problem**: `useTheme`는 매 호출마다 자체 `useState`를 만든다. 향후 `Topbar`나 `Footer`에서 추가로 `useTheme`을 호출하면, 한 컴포넌트가 `setTheme("light")`를 불러도 다른 인스턴스의 `state.theme`은 갱신되지 않는다(`document.documentElement.dataset.theme`은 동기화되지만 React 렌더 트리는 stale). 현재는 `ThemeToggle` 하나만 호출 중이라 잠재적이지만, F010(Topbar에서 isDark에 따른 렌더 분기) 이후 즉시 발현된다.
- **Impact**: 다중 소비자 추가 시 UI 부분 갱신(아이콘/색/배지가 일부만 갱신). 디버깅 난도 높음.
- **Solution**: (a) `ThemeProvider` Context를 `app/root.tsx`에 mount 하여 단일 소스 보장 — RR7 SSR과 잘 맞고 코드도 단순(권장). (b) `useSyncExternalStore`로 외부 store + custom event(`theme-change`) 구독.

### #2 — `<html lang="en">` 한국어 only 정책 위반

- **Domain**: Accessibility / SEO
- **File**: `app/root.tsx` L22
- **Category**: i18n / a11y
- **Confidence**: High (99%)
- **Problem**: CLAUDE.md "Project Overview" 명시: **한국어 only (i18n 없음)**. 그러나 `<html lang="en">`. 스크린리더가 영어 발음 규칙으로 한국어 본문을 읽고, Google이 영어 콘텐츠로 인덱싱할 위험.
- **Impact**: 스크린리더 사용자 접근성 저하, Korean SERP 노출 저하.
- **Solution**: `<html lang="ko">`로 교체. `entry.server.tsx`(streaming SSR)에서 동일 attribute가 별도로 들어가는지 확인 필요.

---

## Medium (P2)

### #3 — 미사용 `isSystem` 노출 (Simplicity First 위반)

- **Domain**: Quality
- **File**: `app/presentation/hooks/useTheme.ts` L19-23, L33
- **Category**: Dead surface area / Simplicity First
- **Confidence**: High (90%)
- **Problem**: `isSystem`은 hook의 반환에 노출되어 있으나 어떤 호출처에서도 소비되지 않는다(`ThemeToggle`은 `theme`/`setTheme`만 사용). CLAUDE.md "Simplicity First — speculative abstractions 금지" 위반에 가깝다.
- **Suggestion**: (a) 현재 사용처가 없으면 hook 반환 타입에서 제거하고, 추후 system-toggle 기능에서 필요할 때 추가, 또는 (b) Topbar에서 `isSystem`일 때 별도 표시할 계획이 명확하면 본 PR 내 호출처 추가. 현재는 (a)가 본 task scope에 부합. 단, useTheme 테스트가 isSystem을 검증하므로 제거 시 테스트도 함께 정리.

### #4 — 부트 스크립트의 localStorage 값 화이트리스트 미검증

- **Domain**: Security (defense in depth)
- **File**: `app/root.tsx` L18 (themeScript)
- **Category**: Input validation
- **Confidence**: Medium (75%)
- **Problem**: 부트 스크립트는 `localStorage.getItem('proto-theme')`의 값을 검증 없이 `document.documentElement.dataset.theme = s`로 할당한다. 사용자 환경에서 외부 코드(브라우저 확장, 콘솔 조작)가 `localStorage`에 임의 문자열(예: `"hacker"`)을 넣어도 그대로 attribute가 된다. **DOM API(`dataset`)를 통한 할당이라 XSS는 불가**하지만, CSS 셀렉터 `[data-theme="dark"]`/`[data-theme="light"]`만 정의되어 있어 잘못된 값은 의도치 않은 "토큰 미적용 상태"(즉 fallback 값)로 노출된다.
- **Suggestion**: 부트 스크립트도 `useTheme.ts`의 `readInitial`과 동일한 화이트리스트 가드를 적용한다. 예: `var t=(s==='dark'||s==='light')?s:(matchMedia(...).matches?'dark':'light');` — 한 줄 추가로 일관성과 견고성 모두 확보.

### #5 — `matchMedia change` 이벤트 미구독

- **Domain**: Quality
- **File**: `app/presentation/hooks/useTheme.ts` L7-17
- **Category**: Edge case / Side-effect awareness
- **Confidence**: High (90%)
- **Problem**: `readInitial`은 `localStorage`에 `"dark" / "light"` 외 값이 들어 있을 때 system 선호로 fallback 한다(올바름). 그러나 `isSystem` 모드일 때 사용자가 OS 다크/라이트 설정을 바꾸면 `useTheme`은 반응하지 않는다(`matchMedia.addEventListener('change')` 미구독). 현재는 isSystem 분기 자체가 소비되지 않으니 noop이지만, 노출된 API가 있으면 추후 `setTheme`이 호출되지 않는 한 stale 상태가 유지된다는 함정이 생긴다.
- **Suggestion**: 이슈 #3과 함께 처리. `isSystem` 노출을 제거하거나, 유지한다면 `useEffect`에서 `matchMedia.addEventListener('change', handler)` 구독을 추가하여 시스템 변경 시 자동 갱신. 본 task scope에선 #3로 단순화 권장.

---

## Low Priority (P2 — Low)

### #6 — biome-ignore 주석의 의도 부정확

- **Domain**: Quality (documentation)
- **File**: `app/root.tsx` L27 (biome-ignore 주석)
- **Confidence**: High (90%)
- **Problem**: 주석은 "FOIT 방지를 위한 동기 inline 부트 스크립트"라고 적혀 있으나, 실제로 폰트는 `font-display: swap`(FOUT)을 쓰고 있다. 부트 스크립트가 막는 것은 **theme FOUC**(다크/라이트 깜빡임)이지 FOIT가 아니다.
- **Suggestion**: `// biome-ignore lint/security/noDangerouslySetInnerHtml: theme FOUC 방지를 위한 동기 inline 부트 스크립트` 정도로 정확화. 코드 동작에는 영향 없음.

### #7 — 폰트 preload 누락 (LCP 영향)

- **Domain**: Performance
- **File**: `app/root.tsx` `<head>`
- **Confidence**: Medium (70%)
- **Problem**: `JetBrainsMono-*.woff2` 3종 모두 `font-display: swap`이지만 `<link rel="preload" as="font" type="font/woff2" crossorigin>`이 없다. `@font-face`의 `src: url(...)`은 첫 텍스트 페인트 시점에야 다운로드 시작되므로 FOUT 깜빡임이 길어진다.
- **Suggestion**: `app/root.tsx`의 `<head>`에 Regular(가장 자주 쓰이는 weight) 1종 preload 추가:
  `<link rel="preload" href="/fonts/JetBrainsMono-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />`
  Edge SSR + Workers 환경에서 LCP에 직접 영향.

### #8 — `#` placeholder 링크가 SPA navigation 트리거

- **Domain**: Quality
- **File**: `app/presentation/lib/chrome-links.ts` L17-18
- **Confidence**: Medium (75%)
- **Problem**: TODO 주석은 명확하나, `{ label: "X", href: "#" }` / `{ label: "RSS", href: "#" }`는 react-router `<Link to="#">`로 렌더링되어 클릭 시 `/#`로 라우팅된다(SPA navigation 발생, 의도치 않은 history 항목 생성).
- **Suggestion**: 단기: `external: true`로 임시 표시(외부 링크 분기로 빠지면 `<a href="#">`가 되어 적어도 SPA navigation은 막힘) **또는** `disabled` 플래그를 추가하여 `<span>`으로 렌더. 둘 다 본 PR scope 외라면 그대로 두되, T015에서 반드시 처리.

### #9 — `aria-pressed` boolean 단순화 가능

- **Domain**: Accessibility
- **File**: `app/presentation/components/chrome/ThemeToggle.tsx` L10
- **Confidence**: Medium (75%)
- **Problem**: `aria-pressed={isDark ? "true" : "false"}` — React/JSX는 boolean을 받으면 자동으로 `"true"`/`"false"` 문자열로 변환한다. 굳이 문자열 분기를 두는 것은 잡음.
- **Suggestion**: `aria-pressed={isDark}` 한 줄로 단순화. 동작 동일. 테스트 어서션도 `toHaveAttribute("aria-pressed", "true")` 그대로 통과.

### #10 — `new Date().getFullYear()` 매 렌더 호출

- **Domain**: Quality
- **File**: `app/presentation/components/chrome/Footer.tsx` L5, L9
- **Confidence**: Low (65%)
- **Problem**: `new Date().getFullYear()`이 매 렌더마다 호출된다. RR7 SSR + 클라이언트 렌더 시 timezone에 따라 연도가 달라지면 hydration mismatch가 잠재적으로 가능(연말 자정 직전 한국과 UTC 차이).
- **Suggestion**: 모듈 상수로 끌어올리기 `const CURRENT_YEAR = new Date().getFullYear();` (Workers SSR과 client는 모두 UTC 기준이므로 위험 매우 낮음 — 선택적).

---

## Advisory (Low Confidence, <70%)

> 인간 리뷰어 판단용, 강제 수정 아님.

### A1 — Tailwind v4 opacity modifier on hex CSS variable

- **File**: `app/presentation/components/chrome/Topbar.tsx` L8 (`bg-bg/80`)
- **Confidence**: 65%
- **Observation**: `bg-bg/80`은 `--color-bg`(hex `#0d0f12`)에 opacity modifier `/80`을 적용. Tailwind v4는 hex/rgb 값을 `color-mix(in oklab, ...)`로 처리하지만, CSS 변수가 hex 그대로일 때 일부 빌드에서 modifier 인식이 들쭉날쭉하다는 보고가 있다.
- **Suggested investigation**: 빌드 후 dev server에서 Topbar 반투명 + backdrop-blur가 의도대로 보이는지 시각 확인. 실패 시 `--color-bg`를 `oklch(...)`로 표현하거나 임시로 `bg-[color:color-mix(in_oklab,var(--color-bg)_80%,transparent)]` 사용.

### A2 — Test edge coverage

- **File**: `app/presentation/hooks/__tests__/useTheme.test.ts`
- **Confidence**: 60%
- **Observation**: localStorage에 `"xyz"` 같은 잘못된 값이 들어 있는 케이스, SSR 분기(`typeof window === "undefined"`) 케이스가 미커버. 본 task의 unit-test-writer 목표는 plan 내 contract만 빨갛게 만드는 것이라 의도된 scope일 수 있음.
- **Suggested investigation**: T005 plan을 확인해 위 두 케이스가 plan에 포함되어 있었다면 추가, 아니면 현 구성 유지. 사용자 컨텍스트에 따르면 "plan과 일치하는지만 검증"이므로 추가 불필요할 가능성이 높다.

### A3 — Co-located icon components

- **File**: `app/presentation/components/chrome/ThemeToggle.tsx` L19-50
- **Confidence**: 50%
- **Observation**: `SunIcon` / `MoonIcon`을 같은 파일에 둔 것은 본 PR scope에 부합. 추후 같은 아이콘이 다른 곳에서 쓰이면 `presentation/components/icons/`로 추출. 지금은 surgical 변경 원칙상 그대로 둘 것.

---

## Dependency Vulnerabilities

> Results from `bun audit`

```
$ bun audit
No vulnerabilities found
```

| Package | Current | Patched | CVE | Severity | Impact |
|---------|---------|---------|-----|----------|--------|

없음.

---

## OWASP Compliance Checklist

| Category | Status | Notes |
|----------|--------|-------|
| A01 - Broken Access Control | n/a | T005 인증/인가 변경 없음 |
| A02 - Cryptographic Failures | n/a | 비밀값 미도입 |
| A03 - Injection | OK | `dangerouslySetInnerHTML` 정적 문자열, 사용자 입력 미주입. localStorage 값은 DOM API(`dataset`)로 할당되어 HTML 인젝션 불가. |
| A04 - Insecure Design | OK | rate-limit/auth 영역 변경 없음 |
| A05 - Security Misconfiguration | OK | CSP/CORS 영역 변경 없음 |
| A06 - Vulnerable Components | OK | `bun audit` clean |
| A07 - Auth Failures | n/a | |
| A08 - Data Integrity | Note | 부트 스크립트가 localStorage 값을 화이트리스트 검증 없이 사용(이슈 #4) — 보안 영향 없으나 견고성 향상 권장 |
| A09 - Logging Failures | n/a | |
| A10 - SSRF | n/a | |

---

## Performance Metrics

### Response Time
- SSR blocking inline script(150 byte 이하)는 무시할 수준의 cost. 다만 폰트 preload 부재(이슈 #7)로 LCP가 약간 늘어날 가능성.

### Memory Usage
- 우려 없음. Hook은 단순 `useState`만 사용, 누수 패턴 없음.

### Algorithm Complexity
- 모두 O(1) / O(n) (n=링크 4~5개). 이슈 없음.

### I/O Efficiency
- localStorage read 1회(부트 스크립트) + 1회(`readInitial` lazy init) = 2회. 동일 키 동일 값. 둘 다 O(1)이지만 통합 가능(아주 미세). 본 PR scope에선 무시.

### Bundle Size
- 신규 dep 0개. `useTheme` <1KB, `ThemeToggle` <1KB. 우려 없음.

---

## Positive Aspects

- TDD Red → Green 사이클이 4개 commit으로 명확히 분리되어 있다.
- `useTheme`이 `typeof window === "undefined"` 가드로 SSR-safe(server에서도 무사 호출).
- `useState(readInitial)` lazy init 사용 — 매 렌더 재실행 회피.
- `dangerouslySetInnerHTML`에 정적 string + try/catch fallback. XSS surface 없음. biome-ignore 주석으로 의도 문서화.
- Tailwind v4 `@custom-variant dark` 셀렉터 전략이 PRD 결정과 정확히 일치.
- Footer 외부 링크 `target="_blank" rel="noopener noreferrer"` 정확히 적용.
- `ChromeLayout` / `ChromeFreeLayout` 분리가 surgical하고 root에서 path 패턴으로만 분기 — 단순.
- 코드 스타일 규칙 준수: 유틸/hook은 arrow(`export const useTheme = ...`), React 컴포넌트는 `export default function ...`, `any` 미사용, useCallback/useMemo 미사용(React 19 컴파일러 신뢰).
- 테스트가 RTL `renderHook` + `act` + matchMedia mock으로 깔끔. ChromeLayout 테스트가 `compareDocumentPosition`으로 렌더 순서까지 검증한 것은 좋은 디테일.

---

## Fix Checklist

**Required**: 각 이슈 수정 직후 체크박스를 갱신한다.

### Critical Issues (P0)
없음.

### High Issues (P1)
- [ ] #1 [High/Quality] `app/presentation/hooks/useTheme.ts` L19-34 — 다중 소비자 간 state 비동기. ThemeProvider/Context 또는 `useSyncExternalStore` 도입.
- [ ] #2 [High/Accessibility] `app/root.tsx` L22 — `<html lang="en">` → `<html lang="ko">` (한국어 only 정책).

### Medium Issues (P2)
- [ ] #3 [Medium/Quality] `app/presentation/hooks/useTheme.ts` L19-23, L33 — 미사용 `isSystem` 노출 제거 (Simplicity First).
- [ ] #4 [Medium/Security] `app/root.tsx` L18 — 부트 스크립트의 localStorage 값 화이트리스트 검증 추가.
- [ ] #5 [Medium/Quality] `app/presentation/hooks/useTheme.ts` L7-17 — `matchMedia change` 미구독 (이슈 #3과 묶어 처리하면 자동 해결).

### Low Issues (P2)
- [ ] #6 [Low/Quality] `app/root.tsx` L27 — biome-ignore 주석을 "theme FOUC 방지"로 정확화.
- [ ] #7 [Low/Performance] `app/root.tsx` `<head>` — `<link rel="preload" as="font" ...>` Regular weight 1종 추가.
- [ ] #8 [Low/Quality] `app/presentation/lib/chrome-links.ts` L17-18 — `#` placeholder 링크의 SPA navigation 발생 방지(`external: true` 또는 disabled span).
- [ ] #9 [Low/Accessibility] `app/presentation/components/chrome/ThemeToggle.tsx` L10 — `aria-pressed={isDark}` 단순화.
- [ ] #10 [Low/Quality] `app/presentation/components/chrome/Footer.tsx` L5, L9 — `new Date().getFullYear()`을 모듈 상수로 끌어올리기(선택적).

---

## Notes

- P0 0건 / P1 2건 / P2 3건 + Low 5건 + Advisory 3건. **P1 두 건만 수정하면 본 PR은 squash merge 가능 상태**.
- P1 #1(`useTheme` 다중 소비자)은 현재는 잠재적이지만 다음 PR(F010 Topbar isDark 분기, Cmd+K 검색 등)에서 즉시 발현되므로 본 PR에서 처리 권장. ThemeProvider Context 도입이 가장 단순 — root.tsx에서 한 번 mount, hook은 useContext로 전환.
- P1 #2(`lang="en"`)는 한 글자 변경. 즉시 처리.
- P2는 별도 chore PR로 묶어도 무방하나, #4(보안 견고성)와 #7(LCP)은 함께 처리 권장.

---

*Generated by unified code-reviewer agent — T005*
