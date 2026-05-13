# T014 — feature: Blog List Page (F006) + RSS Feed (F012)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T005](T005-theme-tokens.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md)
> **후행**: [T041](T041-blog-detail-page.md)

---

## 목적

Blog 목록 라우트를 채우고, 동시에 `/rss.xml` resource route 를 활성화한다. 발행된 post 만 노출 (`draft: false`), 날짜 DESC 정렬, 태그 필터 (`?tag=`), Atom 1.0 또는 RSS 2.0 피드 생성.

## PRD Feature ID 매핑

- F006
- F012
- F018

## 입력·출력 계약

**입력**: T009 container 의 `listPosts({ tag?, draft: false })`. **출력**: `app/presentation/routes/blog._index.tsx` + `app/presentation/routes/rss[.xml].tsx` resource loader + `BlogPostList.tsx`. **검증**: RTL 의 post row 수 = 발행된 post 수, `?tag=` 필터 동작, `/rss.xml` 응답 Content-Type `application/xml` + RSS/Atom 스키마 valid.

## 시퀀스

```
1. blog._index.tsx loader — `searchParams.get('tag')` + `listPosts({ tag, draft: false })`
2. BlogPostList.tsx — date / title / excerpt / tags row 렌더
3. TagFilter 재사용 (T012 의 컴포넌트)
4. rss[.xml].tsx loader — listPosts(draft:false) → XML 직렬화 (RSS 2.0 채택)
5. RSS items — title / link (absolute URL) / description (excerpt) / pubDate (RFC 822) / guid
6. Content-Type `application/xml; charset=utf-8` 명시 + `<?xml version="1.0" encoding="utf-8"?>` 헤더
7. RTL/Vitest — post row 수 + 필터 + RSS XML 스키마 valid (xml2js parse 후 구조 검증)
```

## 엣지 케이스 + 구현

## Implementation Notes

- RSS vs Atom — RSS 2.0 채택 (정보원 호환성 우선, 모든 reader 지원).
- `pubDate` 는 RFC 822 (`Mon, 06 Sep 2010 ...`) — date-fns `format(d, 'EEE, dd MMM yyyy HH:mm:ss xx')` 또는 toUTCString().
- absolute URL 생성 — `request.url` 의 origin 또는 `env.SITE_ORIGIN` 기준. 1인 사이트라 `https://tkstar.dev` hardcode 도 OK.
- 발행 안 된 post (`draft: true`) 는 list 와 RSS 양쪽 모두 제외 — listPosts service 의 default 동작.
- 페이지네이션은 본 task 범위 외 — post 개수 적은 상태에서 full list 노출.
- meta description 은 'tkstar.dev 의 글 모음' 등 정적.
- F018 (sitemap 의 blog index 등록) 은 T019 에서.

## Change History from previous body

- feature branch PR: `feature/issue-N-blog-list-rss`.
- T041 (blog detail) 가 본 task 의 row 링크 대상.

## DoD

- [x] BlogPostList 가 발행된 post 만 DESC 정렬 렌더
- [x] TagFilter 동작 + empty state
- [x] `/rss.xml` 응답 Content-Type `application/xml`
- [x] RSS 2.0 스키마 valid (xml2js parse 후 channel/item 구조 확인)
- [x] pubDate RFC 822 포맷
- [x] draft 포스트는 list 와 RSS 양쪽 제외

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-29 | T014 머지 — Blog list F006 + RSS F012 (branch `feature/issue-N-blog-list-rss`) | TaekyungHa |
