# T012 — feature: Projects List Page (F004 ls-style 그리드 + 필터)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T005](T005-theme-tokens.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md)
> **후행**: [T013](T013-project-detail-page.md)

---

## 목적

Projects 목록 라우트를 ls-style 그리드 (`Name`/`Type`/`Status`/`Stack`/`Period` 열) 로 채우고, `?tag=` 쿼리 파라미터로 태그 필터를 지원한다. velite project collection → listProjects() service → ProjectCard 렌더.

## PRD Feature ID 매핑

- F004
- F018

## 입력·출력 계약

**입력**: T009 container 의 `listProjects({ tag? })`. **출력**: `app/presentation/routes/projects._index.tsx` loader + `ProjectsListGrid.tsx` + `TagFilter.tsx` + page meta. **검증**: RTL 의 grid 행수 = 데이터 수, `?tag=react` 입력 시 필터링 + 빈 결과 시 'No projects' empty state, meta title `Projects | tkstar.dev`.

## 시퀀스

```
1. projects._index.tsx loader — `searchParams.get('tag')` 추출 → `listProjects({ tag })` 호출
2. ProjectsListGrid.tsx — ls-style 5 열 (Name / Type / Status / Stack / Period) 헤더 + 행 렌더
3. ProjectCard 행 — Name 링크 (`/projects/$slug`), Status badge, Stack chips
4. TagFilter.tsx — 전체 태그 union 리스트 + 활성 태그 시각적 표시 + 클릭 시 `?tag=` 쿼리 변경
5. empty state — 필터 결과 0건 시 'No projects matching `<tag>`' + 필터 해제 링크
6. RTL 테스트 — 필터 적용/해제 + empty state + 링크 href 정확성
```

## 엣지 케이스 + 구현

## Implementation Notes

- ls-style 그리드는 모바일에선 카드형 stack 으로 fallback — Tailwind `md:grid md:grid-cols-5` + `grid grid-cols-1` 분기.
- `?tag=foo&tag=bar` 다중 태그는 본 task 범위 외 (단일 태그 only). 향후 확장 시 union/intersection 정책 결정 필요.
- TagFilter 의 태그 union 은 listProjects 가 반환한 collection 에서 flatMap. 본 task 에서 별도 endpoint 없이 client 측 derive.
- 'Period' 컬럼 표기: `start_date - end_date` (현재 진행 중이면 `start_date - 현재`).
- meta export 의 description 은 태그 적용 시 동적 — `Projects tagged: <tag>` 등.
- empty state 의 '필터 해제' 링크 는 `/projects` 로 직접 이동 (history replace 가 아닌 push).

## Change History from previous body

- feature branch PR: `feature/issue-N-projects-list-page`.
- T013 (project detail) 가 본 task 의 ProjectCard 링크 대상.

## DoD

- [x] loader 가 `?tag` 쿼리를 listProjects 에 전달
- [x] ls-style 5 열 헤더 + 행 렌더 (desktop)
- [x] 모바일 stack fallback 동작
- [x] TagFilter 클릭 시 URL 변경 + 필터 적용
- [x] 필터 결과 0건 시 empty state 렌더 + 해제 링크
- [x] ProjectCard 의 Name 링크가 `/projects/$slug` 정확
- [x] page meta title/description 정의

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T012 머지 — Projects list F004 + tag 필터 (branch `feature/issue-N-projects-list-page`) | TaekyungHa |
