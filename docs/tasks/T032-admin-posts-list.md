# T032 — feature: Admin Posts List — /admin/posts + draft 포함 전체 목록 + 필터 + bulk action

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T028](T028-post-seed-migration.md), [T030](T030-access-jwt-verifier.md), [T031](T031-admin-layout-shell.md)
> **후행**: [T036](T036-admin-post-editor-tiptap.md)

---

## 목적

`/admin/posts` 라우트를 채워 본인이 발행 + draft 양쪽 모두 볼 수 있게 한다. status 필터 (all / published / draft), 검색 (title/slug like), 정렬 (updated_at DESC default), bulk delete / publish 액션. AdminPostRepository port 를 신설하여 draft 포함 read 분리.

## PRD Feature ID 매핑

- F020
- F021

## 입력·출력 계약

**입력**: T030 의 context.admin + D1 posts 테이블. **출력**: `app/presentation/routes/admin.posts._index.tsx` loader + action + `AdminPostsList.tsx` + `app/application/admin-content/ports/admin-post-repository.port.ts` + `app/infrastructure/db/admin-post.repository.ts` + container wiring + `__tests__/`. **검증**: draft 포함 전체 post 표시, status filter, search, bulk publish/delete 작동 (action POST), CSRF 보호 (origin 검증), pagination (page size 25).

## 시퀀스

```
1. Application — `admin-post-repository.port.ts` (findAllIncludingDraft({ status?, q?, sort?, page?, pageSize? }), updateStatus(id, status), deleteMany(ids[]))
2. Infrastructure — `admin-post.repository.ts` (Drizzle 구현, draft 포함, LIKE 검색)
3. container.ts — adminPostRepo 추가, admin-only context 에서만 접근 가능하도록 wiring
4. admin.posts._index.tsx loader — searchParams (`status` / `q` / `sort` / `page`) → findAllIncludingDraft
5. admin.posts._index.tsx action — bulk publish (status='published', published_at=now), bulk delete (DELETE)
6. AdminPostsList.tsx — table (체크박스 / slug / title / status badge / tags / updated_at / 액션 버튼), 페이지네이션 컨트롤
7. CSRF — action 진입 시 `request.headers.get('origin')` 검증 (same-origin only)
8. RTL/Vitest — filter / search / pagination / bulk publish action / bulk delete action / origin spoofing 차단
```

## 엣지 케이스 + 구현

## Implementation Notes

- AdminPostRepository 와 PostRepository 분리: read path (외부 노출) 는 published 만, admin 은 draft 포함. 두 port 분리로 권한 경계 명확.
- bulk publish 시 `published_at` 이 null 이었으면 `now()`, 이미 published 였으면 변경 안 함.
- bulk delete 는 hard delete — 1인 사이트라 soft delete 도입 안 함. 실수 복구는 git history 또는 D1 백업.
- CSRF: Cloudflare Access cookie 가 있으면 CSRF 가능성 있음 — origin 검증 + action method POST only.
- pagination — offset/limit. 25/페이지.
- search 는 title LIKE %q% OR slug LIKE %q% (case insensitive).
- updated_at DESC default — admin 의 작업 흐름 친화.
- action 의 redirect 는 POST-redirect-GET 패턴.
- T036 (admin post editor) 가 본 task 의 row 클릭 시 진입.
- F020 의 Admin UI AC 가 본 task 에서 첫 실데이터 화면.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-posts-list`.

## DoD

- [ ] admin-post-repository.port + impl + container wiring
- [ ] /admin/posts 가 draft 포함 전체 post 표시
- [ ] status 필터 (all/published/draft) 동작
- [ ] search (title/slug LIKE) 동작
- [ ] pagination (25/page) 동작
- [ ] bulk publish action 동작 (체크박스 + 버튼)
- [ ] bulk delete action 동작 + 확인 dialog
- [ ] CSRF — wrong origin 시 403
- [ ] RTL/Vitest 6 케이스 Green

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
