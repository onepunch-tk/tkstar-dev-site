# T039 — feature: Admin Projects — /admin/projects + cover/featured/featured_order 편집 UI

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T031](T031-admin-layout-shell.md), [T035](T035-admin-media-library.md), [T038](T038-project-meta-d1-split.md)
> **후행**: [T040](T040-build-search-index-service.md)

---

## 목적

T038 의 project_meta 를 편집하는 admin UI — `/admin/projects` 가 velite project 전체 목록을 표시하고 각 slug 의 cover (MediaPickerModal 호출), cover_alt, featured 토글, featured_order drag-sort 를 편집할 수 있다. project 본문은 여전히 git+velite 로만 관리 — 본 task 는 meta overlay 만.

## PRD Feature ID 매핑

- F004
- F005
- F017
- F020

## 입력·출력 계약

**입력**: T038 의 project_meta + T035 MediaPickerModal. **출력**: `app/presentation/routes/admin.projects._index.tsx` loader + action + `AdminProjectsList.tsx` + `ProjectMetaEditor.tsx` (slug별 inline) + `__tests__/`. **검증**: 목록 표시, cover 편집 (MediaPicker → upsert), featured 토글, featured_order drag, 변경 시 200 + updated_at 갱신, /projects + Home Featured 즉시 반영.

## 시퀀스

```
1. admin.projects._index.tsx loader — velite project collection 전체 + project_meta join
2. action — PATCH (slug, fields) → ProjectMetaRepository.upsert
3. AdminProjectsList.tsx — table (slug / title (velite) / cover thumbnail / cover_alt / featured switch / featured_order input)
4. ProjectMetaEditor.tsx — inline 편집 (cover 버튼 → MediaPickerModal, cover_alt input, featured toggle)
5. drag-sort — featured 항목만 dnd, featured_order 갱신
6. RTL/Vitest — cover 편집, featured 토글, drag-sort 순서 변경, MediaPicker 호출
7. /projects 와 Home Featured 페이지가 즉시 반영되는지 dev 환경 수동 검증
```

## 엣지 케이스 + 구현

## Implementation Notes

- 본 task 는 D1 overlay 만 — velite frontmatter (title/summary/body) 편집 불가. admin 이 본문을 바꾸려면 여전히 git commit.
- cover URL 은 media.tkstar.dev 호스트만 허용 (외부 이미지 disallow).
- featured 토글 OFF 시 featured_order NULL 로 reset.
- drag-sort 는 featured=true 항목만 — featured=false 는 정렬 불가.
- cover 변경 시 OG 캐시 (T018) 의 `updated_at` 기반 자동 invalidation.
- A012 (Project meta D1 분리 UI) 해소.
- F017 의 Featured 선정이 본 task 로 admin 이 직접 통제.
- search-index 재생성 (T040) 은 본 task 의 save 후 hook.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-projects-meta-ui`.
- A012 해소.

## DoD

- [ ] /admin/projects velite project 전체 목록 표시
- [ ] cover 편집 (MediaPickerModal 호출) + upsert
- [ ] cover_alt inline 편집 + 저장
- [ ] featured 토글 + featured_order drag-sort
- [ ] 변경 시 200 + updated_at 갱신
- [ ] /projects + Home Featured 즉시 반영
- [ ] 외부 cover URL disallow (media.tkstar.dev only)
- [ ] Vitest 4 케이스 Green
- [ ] A012 (Project meta D1 분리 UI) 해소 기록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
