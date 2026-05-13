# T031 — feature: Admin Layout shell — /admin 라우트 + 사이드바 + 빈 dashboard

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T030](T030-access-jwt-verifier.md)
> **후행**: [T032](T032-admin-posts-list.md), [T035](T035-admin-media-library.md), [T036](T036-admin-post-editor-tiptap.md)

---

## 목적

T030 의 JWT 검증 통과 후 도달하는 `/admin` 라우트 + AdminLayout (사이드바 + 본문 영역) shell 을 구현한다. Posts / Media / Settings 메뉴 placeholder, 본인 이메일 표시, 로그아웃 링크 (`/cdn-cgi/access/logout`). 본 task 의 dashboard 자체는 빈 카드 — 실데이터 위젯은 후속 task 들.

## PRD Feature ID 매핑

- F020
- F023

## 입력·출력 계약

**입력**: T030 의 `context.admin = { sub, email }`. **출력**: `app/presentation/routes/admin.tsx` (layout route) + `app/presentation/routes/admin._index.tsx` (dashboard) + `AdminLayout.tsx` + `AdminSidebar.tsx` + `AdminTopbar.tsx` + 빈 dashboard 카드. **검증**: 인증 통과 후 `/admin` 200 + 사이드바 + 본인 이메일 + 메뉴 4개 (Dashboard / Posts / Media / Settings), 로그아웃 링크 클릭 시 Cloudflare logout URL 이동, ChromeFreeLayout 미사용 (admin 자체 chrome 사용).

## 시퀀스

```
1. admin.tsx layout route — loader 에서 `context.admin` 추출 → children 에 prop 전달
2. AdminLayout.tsx — 좌측 사이드바 (240px) + 본문 영역, 다크모드 토큰 적용 (T005 와 호환)
3. AdminSidebar.tsx — 메뉴 4개 (Dashboard / Posts / Media / Settings), 활성 항목 highlight
4. AdminTopbar.tsx — 본인 이메일 + 로그아웃 링크 `/cdn-cgi/access/logout`
5. admin._index.tsx — 빈 dashboard (총 post 수 / 발행/draft 분포 카드는 후속)
6. Posts / Media / Settings placeholder 라우트 (`admin.posts._index.tsx` 등) — T032 에서 본격 구현
7. RTL — 사이드바 메뉴 4개 렌더, 활성 highlight, 로그아웃 href 정확, 본인 이메일 표시
8. F010 다크모드 토글이 admin 영역에서도 동작 (전역 상태 일치)
```

## 엣지 케이스 + 구현

## Implementation Notes

- admin layout 은 ChromeLayout / ChromeFreeLayout 과 다른 별도 레이아웃 — `/admin/*` 만 마운트.
- 로그아웃: `/cdn-cgi/access/logout` GET 후 Cloudflare Access cookie 무효화 → redirect to `/`.
- 사이드바 메뉴 활성 매칭: `useLocation()` 의 pathname startsWith.
- 본인 이메일은 context.admin.email — JWT claim 에서 추출 (T030 의 SoT).
- F023 의 'admin UI 가 본인 1명에게만 노출' AC 가 본 task 에서 가시화 (사이드바 노출 자체가 검증).
- 빈 dashboard 의 카드는 후속 task (T032: 총 post 수, T037: 미디어 용량 등) 가 채움.
- RTL 테스트 시 `context.admin` mock 필요 — vitest setup 또는 fixture helper.
- Admin 영역도 다크모드 토큰 그대로 — 별도 토큰 시스템 도입 안 함.

## Change History from previous body

- feature branch PR: `feature/issue-N-admin-layout-shell`.

## DoD

- [ ] /admin 인증 통과 후 200
- [ ] AdminLayout 사이드바 (240px) + 본문 영역 렌더
- [ ] AdminSidebar 메뉴 4개 (Dashboard/Posts/Media/Settings)
- [ ] 활성 메뉴 highlight 동작
- [ ] AdminTopbar 에 본인 이메일 표시
- [ ] 로그아웃 링크 href = /cdn-cgi/access/logout
- [ ] 다크모드 토글이 admin 영역에서도 동작
- [ ] RTL 5 케이스 Green

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
