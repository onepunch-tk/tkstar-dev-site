# T010 — feature: Home Page (F001 Hero + F017 Featured/Recent)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T005](T005-theme-tokens.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md)
> **후행**: [T016](T016-command-palette.md)

---

## 목적

Home 라우트의 placeholder 를 실 콘텐츠로 채운다 — Hero (whoami + 3-버튼 클러스터), Featured Project 큰 카드 1개, Recent Posts 3개 행, '모두 보기 →' 링크. Featured 미존재 시 fallback (해당 섹션 미렌더) 처리.

## PRD Feature ID 매핑

- F001
- F017

## 입력·출력 계약

**입력**: T009 container 의 `getFeaturedProject` + `getRecentPosts(3)` services. **출력**: `app/presentation/routes/_index.tsx` loader + components (`HeroWhoami` / `FeaturedProjectCard` / `RecentPostsList`). **검증**: RTL Hero/Featured/Recent 3 섹션 + ARIA role + 3개 PostRow + Featured fallback + DOM 구조 snapshot.

## 시퀀스

```
1. _index.tsx loader — container 에서 getFeaturedProject + getRecentPosts(3) 호출
2. HeroWhoami.tsx — whoami 프롬프트 + 'ship solo. ship fast.' 카피 + 3-버튼 클러스터 (검색해서 이동 / /about / /projects)
3. FeaturedProjectCard.tsx — Featured Project 큰 카드 (cover + title + summary + tags)
4. RecentPostsList.tsx — `<PostRow>` 3개 + '모두 보기 →' 링크
5. Featured 미존재 시 fallback — 해당 섹션 미렌더 (다른 섹션은 정상)
6. RTL 테스트 — loader 호출 검증 + 3 섹션 렌더 + ARIA role + Featured fallback
```

## 엣지 케이스 + 구현

## Implementation Notes

- Featured 0건 / Recent 0건 → 해당 섹션만 미렌더. Hero 는 항상 표시.
- 3-버튼 클러스터의 [검색해서 이동] 은 본 task 시점엔 anchor placeholder — T016 (Cmd+K) 마운트 후 palette 트리거.
- RecentPostsList 는 정확히 3개 — getRecentPosts(3) 시그니처 강제. 발행된 post 가 2건이면 2개 행만.
- DOM 구조 assertion: Hero → Featured → Recent 순서를 명시적 selector 로 검증 (snapshot 대신).
- loader 가 container mock 으로 단위 테스트 가능 — vitest setup 의 `vi.mock` 활용.
- F001 (Hero) + F017 (Featured/Recent) 동시 구현 — 두 feature 가 같은 라우트에 위치.

## Change History from previous body

- Page-by-Page Key Features 로 검증 (AC 별도 없음).
- feature branch PR: `feature/issue-N-home-page`.
- T016 (Cmd+K) 가 본 task 의 [검색해서 이동] 버튼 wiring 을 완성.

## DoD

- [x] _index.tsx loader 가 getFeaturedProject + getRecentPosts(3) 호출 (mock container)
- [x] HeroWhoami 렌더 + 3-버튼 클러스터 ARIA role 검증
- [x] RecentPostsList 가 정확히 3개의 PostRow 렌더 (RTL getAllByRole)
- [x] Featured 미존재 시 fallback (섹션 미렌더) 처리
- [x] Hero → Featured → Recent 3 섹션 순서 DOM assertion
- [x] F001 + F017 동시 구현 검증

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T010 머지 — Home page F001 + F017 + RTL 보강 (branch `feature/issue-N-home-page`) | TaekyungHa |
