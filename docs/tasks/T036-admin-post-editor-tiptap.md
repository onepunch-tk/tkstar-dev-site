# T036 — feature: Admin Post Editor — Tiptap WYSIWYG + MDX serialize + draft/publish + autosave

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T025](T025-post-d1-schema-migration.md), [T032](T032-admin-posts-list.md), [T035](T035-admin-media-library.md)
> **후행**: [T040](T040-build-search-index-service.md)

---

## 목적

Phase 7.3 의 핵심 — admin 이 모바일/외부에서 본문을 작성·편집·발행할 수 있는 WYSIWYG 에디터. Tiptap (client-only) + MDX serialize (Tiptap doc → MDX text) + 이미지 삽입 (MediaPickerModal 호출) + draft / publish 토글 + autosave (debounce 3s). T027 의 런타임 컴파일러가 본 task 의 본문을 SSR 렌더.

## PRD Feature ID 매핑

- F020
- F021
- F022

## 입력·출력 계약

**입력**: GET `/admin/posts/$id/edit` + POST/PATCH 액션. **출력**: `app/presentation/routes/admin.posts.$id.edit.tsx` + `app/presentation/routes/admin.posts.new.tsx` + `TiptapEditor.tsx` (client) + `app/application/admin-content/services/{save-post.ts, publish-post.ts}` + `app/infrastructure/mdx/tiptap-to-mdx.ts` + autosave hook + `__tests__/`. **검증**: 신규/편집 흐름, draft save, publish 토글 (published_at 세팅), autosave 3s debounce, 이미지 삽입 흐름, MDX serialize 라운드트립 (load → edit → save → reload 동일 결과).

## 시퀀스

```
1. TiptapEditor.tsx (client only) — StarterKit + Image (custom node) + CodeBlockShiki + Link + Heading id (auto slug)
2. Application — `save-post.ts` (input: postId? + tiptap JSON + frontmatter, output: { id, slug, body_mdx, updated_at })
3. Application — `publish-post.ts` (input: id, output: { published_at })
4. Infrastructure — `tiptap-to-mdx.ts` (Tiptap doc → MDX serialize, prosemirror-markdown 변형 또는 자체 visitor)
5. admin.posts.$id.edit.tsx — loader (post fetch by id, body_mdx → tiptap doc 역직렬화), action (save / publish / delete)
6. admin.posts.new.tsx — 빈 에디터, save 시 INSERT
7. autosave hook — `useDebouncedEffect(state, 3000, save)` + 'Saved' 토스트
8. 이미지 삽입 — Tiptap Image extension 의 toolbar 버튼 → MediaPickerModal (T035) onSelect → image node 삽입 with url/alt
9. draft/publish 토글 UI — published_at NULL ↔ now()
10. Vitest — save round-trip (Tiptap → MDX → Tiptap 동일), publish 시 published_at 세팅, autosave debounce, image insert
```

## 엣지 케이스 + 구현

## Implementation Notes

- Tiptap 은 client only — SSR safe wrapper 또는 dynamic import. admin 페이지라 SSR 의 첫 paint 가 짧아도 OK.
- MDX serialize: 모든 Tiptap 노드 → MDX 라운드트립 보장이 핵심. 미지원 노드 (예: 표) 는 본 task 에선 제외 (Heading / Paragraph / List / Code / Image / Link 만).
- CodeBlockShiki — T007 의 shiki highlighting 과 별도 (에디터 내부의 미리보기용). 저장 시엔 일반 ```lang 코드블록 으로 serialize.
- frontmatter 입력 폼 — 별도 form (title, slug, tags, cover, excerpt) + tiptap 본문 분리.
- slug autogen — title → slugify (한국어는 transliteration 또는 timestamp fallback).
- autosave 는 dirty 상태일 때만 — 'Saved' 토스트로 사용자에게 알림.
- publish 시 KV mdx cache (T027) invalidation — `updated_at` 변경으로 자동.
- search-index 재생성 트리거는 T040 에서 — 본 task 의 save 후 hook.
- 권한: T030 JWT 가드 통과한 admin 만 — action 진입 시 재확인.
- 모바일 UX — toolbar collapse, virtual keyboard 영향 고려.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-post-editor-tiptap`.
- F020 (Admin Editor) 의 최대 task — 모든 작성 흐름이 본 task 위에서 동작.

## DoD

- [ ] /admin/posts/new 빈 에디터 + frontmatter 폼
- [ ] /admin/posts/$id/edit 의 기존 post 로드 + Tiptap 역직렬화
- [ ] save action draft 저장 + 200 + updated_at 갱신
- [ ] publish 토글 시 published_at 세팅
- [ ] autosave 3s debounce + 'Saved' 토스트
- [ ] 이미지 삽입 → MediaPickerModal → Tiptap image node 삽입
- [ ] MDX serialize 라운드트립 검증 (load → edit → save → reload 동일)
- [ ] T027 의 SSR 렌더가 본 task 가 저장한 body_mdx 를 정상 컴파일
- [ ] Vitest 5 케이스 (save / publish / autosave / image insert / round-trip) Green
- [ ] JWT 가드 미통과 시 403

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
