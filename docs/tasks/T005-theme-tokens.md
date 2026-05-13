# T005 — feature: 디자인 토큰 이식 + Tailwind v4 `@theme` + `[data-theme]` dark variant + 다크모드 (F010)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T003](T003-vite-rr7-workers-tailwind-pipeline.md)
> **후행**: [T010](T010-home-page.md), [T011](T011-about-page.md), [T012](T012-projects-list-page.md), [T013](T013-project-detail-page.md), [T014](T014-blog-list-rss.md), [T015](T015-legal-routes.md)

---

## 목적

design 정본의 oklch 토큰을 Tailwind v4 `@theme` block 으로 이식하고, `[data-theme]` 속성 기반 dark variant 와 시스템 추종 + localStorage `proto-theme` 강제 전환 hook 을 구현한다. SSR-safe blocking script 로 첫 렌더부터 정확한 테마가 보이도록 한다 (FOIT 없음).

## PRD Feature ID 매핑

- F010

## 입력·출력 계약

**입력**: T003 의 `app/app.css` 빈 셸 + `app/root.tsx`. **출력**: `app/app.css` 의 `@theme` block (oklch 토큰 + JetBrainsMono font), `useTheme.ts` hook, `Topbar/Footer/ThemeToggle` chrome 컴포넌트, `app/root.tsx` 의 `<html data-theme>` blocking script, `public/fonts/JetBrainsMono-{Regular,Medium,Bold}.woff2` self-host. **검증**: system dark/light 추종, 토글 클릭 시 속성 전환 + localStorage persist, 새로고침 시 강제 모드 복원, FOIT 없음.

## 시퀀스

```
1. design-system/styles.css 의 oklch 토큰을 `app/app.css` 의 `@theme { --color-*, --font-* }` 로 이식
2. Tailwind v4 dark variant 추가 — `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))`
3. useTheme.ts hook — `prefers-color-scheme` 추종 + localStorage `proto-theme` 강제 전환 + setTheme API
4. chrome 컴포넌트 — Topbar.tsx / Footer.tsx / ThemeToggle.tsx 골격
5. app/root.tsx — `<html data-theme={...}>` SSR-safe blocking script (first paint 깜빡임 방지)
6. JetBrainsMono-{Regular,Medium,Bold}.woff2 를 `public/fonts/` 에 self-host + `@font-face` 등록
7. useTheme.test.ts — system 추종 / 강제 전환 / localStorage persist 케이스 3종 Green
```

## 엣지 케이스 + 구현

## Implementation Notes

- FOIT 회피는 root layout 의 `<head>` 안에서 동기 `<script>` 로 `data-theme` 을 미리 세팅하는 패턴 채택. React hydration 전에 실행되어 SSR HTML 과 일치.
- localStorage key 는 `proto-theme` — 'prototype-era' 잔재명이지만 호환성 위해 유지.
- `prefers-color-scheme: dark` 미디어 쿼리 변경 시 hook 이 강제 모드가 아니면 즉시 반영. 강제 모드 (사용자가 토글로 설정) 면 무시.
- Topbar/Footer/ThemeToggle 은 본 task 에선 골격만 — 실제 검색 트리거는 T016, Footer Legal 링크는 T015.
- `__tests__/` colocated 위치: `app/presentation/hooks/__tests__/useTheme.test.ts`.

## Change History from previous body

- F010 (다크모드 토글) 1차 구현 완료.
- Issue #19, branch `feature/issue-19-theme-tokens`.
- T010~T015 모든 페이지 task 가 본 task 의 토큰·dark variant·chrome 컴포넌트에 의존.

## DoD

- [x] `app/app.css` 의 `@theme` block 에 oklch 토큰 이식 완료
- [x] Tailwind v4 dark variant `@variant dark (&:where([data-theme='dark']...))` 정의
- [x] useTheme hook 의 system 추종 동작 (auto 모드)
- [x] 토글 클릭 시 `[data-theme]` 속성 전환 + localStorage `proto-theme` 저장
- [x] 새로고침 시 강제 모드 복원
- [x] FOIT 없이 첫 렌더부터 정확한 테마 (SSR-safe blocking script)
- [x] useTheme.test.ts 3 케이스 Green
- [x] JetBrainsMono 3 weight self-host + `@font-face` 등록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | T005 머지 — theme tokens + F010 다크모드 (Issue #19, branch `feature/issue-19-theme-tokens`) | TaekyungHa |
