# T035 — feature: Admin Media Library — /admin/media 그리드 + 검색 + alt 편집 + 삭제

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T031](T031-admin-layout-shell.md), [T034](T034-admin-media-upload-api.md)
> **후행**: [T036](T036-admin-post-editor-tiptap.md)

---

## 목적

admin 이 업로드한 미디어 자산을 한 화면에서 보고 관리할 수 있는 라이브러리 UI 를 구현한다. 그리드 뷰 (썸네일) + 필터 (mime) + 검색 (filename / alt) + alt 편집 inline + 삭제 (R2 + D1 cascade). Tiptap (T036) 에서 'image insert' 시 본 라이브러리 모달 호출.

## PRD Feature ID 매핑

- F022
- F020

## 입력·출력 계약

**입력**: T034 의 upload endpoint + 미디어 메타 D1. **출력**: `app/presentation/routes/admin.media._index.tsx` loader + action + `MediaGrid.tsx` + `MediaCard.tsx` + `MediaPickerModal.tsx` (T036 에서 재사용) + `__tests__/`. **검증**: 그리드 24/page, mime filter, filename/alt search, inline alt 편집 PATCH, 삭제 시 R2 + D1 cascade, 모달 mode (선택 → onSelect 콜백).

## 시퀀스

```
1. admin.media._index.tsx loader — mediaRepo.findAll({ mime?, q?, page }), 24/page pagination
2. action — PATCH (alt 편집) / DELETE (R2 + D1)
3. MediaGrid.tsx — 6 cols (desktop) / 3 cols (tablet) / 2 cols (mobile)
4. MediaCard.tsx — 썸네일 + filename + size + mime badge + alt inline edit + 액션 (copy URL / delete)
5. MediaPickerModal.tsx — 동일 그리드 + onSelect prop, T036 에서 호출
6. 삭제 처리 — R2 delete 성공 후 D1 delete (cleanup 순서 본 task 에선 best-effort)
7. Vitest — list / filter / search / alt edit / delete / picker onSelect 6 케이스
```

## 엣지 케이스 + 구현

## Implementation Notes

- 썸네일은 원본 그대로 (작은 이미지 가정) — Cloudflare Images 변환 미도입.
- copy URL 액션 — clipboard API `navigator.clipboard.writeText(url)`.
- 삭제 confirmation dialog 필수.
- R2 delete 실패 + D1 delete 성공 시 orphan 객체 가능 — 1인 사이트 허용. 주기적 cleanup script (별도 task) 향후 필요 시.
- MediaPickerModal 의 onSelect 는 `{ id, url, alt }` 반환 — Tiptap image extension 의 attrs 와 매핑.
- mime filter — image / video 두 그룹만 (전체 mime 노출 안 함).
- pagination 24/page (그리드 4행 × 6열).
- 본 task 의 컴포넌트는 admin 영역 — 다크모드 토큰 그대로 적용.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-media-library`.
- T036 의 image picker 의존성.

## DoD

- [ ] /admin/media 그리드 렌더 (24/page)
- [ ] mime filter (image/video) 동작
- [ ] filename/alt search 동작
- [ ] alt inline 편집 PATCH 200
- [ ] 삭제 시 R2 + D1 cascade
- [ ] MediaPickerModal onSelect prop 동작 (T036 호출 대비)
- [ ] copy URL clipboard 동작
- [ ] Vitest 6 케이스 Green

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
