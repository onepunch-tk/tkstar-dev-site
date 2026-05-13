# T016 — feature: Cmd+K Command Palette (F016)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T003](T003-vite-rr7-workers-tailwind-pipeline.md), [T008](T008-content-ports-repos.md), [T010](T010-home-page.md)
> **후행**: none

---

## 목적

검색 우선 네비게이션 — Cmd+K (macOS) / Ctrl+K (Win/Linux) 단축키 + Topbar 검색 버튼으로 트리거되는 모달 palette 를 구현한다. 빌드 타임 생성된 `/search-index.json` 을 fetch + client-side filter (단순 includes + 점수) 로 즉시 결과 렌더.

## PRD Feature ID 매핑

- F001
- F016

## 입력·출력 계약

**입력**: 빌드 타임 생성된 `/search-index.json` (Project/Post entry — title, slug, type, tags, summary). **출력**: `CommandPalette.tsx` + `useCommandPalette.ts` hook + global key listener + `scripts/build-search-index.ts` + `public/search-index.json` 빌드 산출물. **검증**: RTL 키보드 단축키 + 입력 시 필터링 + Enter 시 navigate + Esc 시 닫힘 + 외부 영역 클릭 시 닫힘.

## 시퀀스

```
1. scripts/build-search-index.ts — velite collections + posts 를 합쳐 `public/search-index.json` 생성 (title/slug/type/tags/summary)
2. `prebuild` lifecycle 에 build-search-index 체이닝 (velite build 이후)
3. useCommandPalette.ts — global keydown listener (Cmd+K / Ctrl+K) + open/close state
4. CommandPalette.tsx — 모달 dialog (role=dialog aria-modal=true), input + 결과 리스트, 화살표 키 navigation + Enter 로 link follow
5. Topbar 의 검색 버튼 (T005 의 placeholder) wiring — onClick 으로 palette open
6. Hero 의 [검색해서 이동] 버튼 (T010) wiring
7. client-side filter — 단순 `includes()` + 점수 (title match > tag > summary)
8. RTL — Cmd+K 트리거 / 입력 / 키보드 nav / Enter navigate / Esc 닫힘
```

## 엣지 케이스 + 구현

## Implementation Notes

- A007 해소 — 검색 인덱스 라이브러리 미도입 (fuse.js / lunr 등). 단순 includes + 점수로 충분 (1인 사이트의 콘텐츠 규모 < 100건).
- 단축키: macOS `Cmd+K`, Win/Linux `Ctrl+K`. SSR-safe (window 체크 후 attach).
- 입력 토큰화 안 함 — 공백 split 후 AND 매칭. 한글 IME composition 중에는 keyEvent.isComposing 체크.
- 결과 리스트 max 8개 표시 + '더 보기' 시 검색 페이지로 이동 (검색 페이지 미구현 시 fallback 없음 — 본 task 에선 8개 제한만).
- ARIA — `role=combobox` 입력 + `role=listbox` 결과 + `aria-activedescendant` 로 키보드 nav.
- 모달 trap focus 는 react-focus-lock 또는 자체 구현. body scroll lock 도 함께.
- search-index.json 은 정적 fetch (CDN 캐시) — Phase 7.x 의 admin save 시 재생성 트리거는 T040 에서.
- F001 의 3-버튼 클러스터 [검색해서 이동] 이 본 task 에서 실제 동작.

## Change History from previous body

- A007 (검색 인덱스 라이브러리) 해소 — 단순 includes 채택.
- feature branch PR: `feature/issue-N-command-palette`.
- T040 (buildSearchIndex use case 분리) 가 본 task 의 scripts/build-search-index.ts 를 Application service 로 리팩토링.

## DoD

- [x] Cmd+K (macOS) / Ctrl+K (Win/Linux) 단축키 트리거
- [x] Topbar 검색 버튼 + Hero [검색해서 이동] 클릭 트리거
- [x] 입력 시 client-side filter 즉시 반영
- [x] 화살표 키 nav + Enter navigate + Esc 닫힘
- [x] 외부 영역 클릭 시 닫힘
- [x] ARIA role=dialog + aria-modal + role=combobox + role=listbox
- [x] /search-index.json 빌드 산출물 생성 + prebuild lifecycle 체이닝
- [x] 한글 IME composition 중 단축키/Enter 무시

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-30 | T016 머지 — Cmd+K palette F016 + A007 해소 (branch `feature/issue-N-command-palette`) | TaekyungHa |
