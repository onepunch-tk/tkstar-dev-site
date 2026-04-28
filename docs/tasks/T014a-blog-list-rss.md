# Task 014a — Blog Page (F006) — 목록 + 태그 필터 + RSS Resource Route (F012)

| Field | Value |
|-------|-------|
| **Task ID** | T014a |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation + Application(`build-rss-feed.service`) + Resource Route |
| **Branch** | `feature/issue-N-blog-list-rss` |
| **Depends on** | T005, T007, T008, T009 |
| **Blocks** | T014b, T018 |
| **PRD Features** | **F006** (Blog 목록), **F012** (RSS) |
| **PRD AC** | — (UI 표시 + RSS XML well-formed) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
`/blog` 목록 페이지를 발행일 역순 + 태그 필터 + 행 형태로 구현하고, `/rss.xml` 리소스 라우트가 RSS 2.0 well-formed XML을 반환하게 한다. T014b(Blog Detail)의 사전 단계.

## Context
- **Why**: Blog는 월 1편 작성으로 전문성 노출 + SEO 자산 누적. RSS는 구독자 채널 확보. T014가 Blog+Detail+RSS 묶음으로 너무 컸으므로 검증 리포트 Issue #4에 따라 T014a/T014b로 분할.
- **Phase 진입/완료 연결**: T007 + T008 + T009 Done 후. T014a Done이면 T014b Blog Detail이 시작 가능.
- **관련 PRD 섹션**: PRD `Page-by-Page — Blog Page`, `F006`, `F012`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/{blog._index.tsx, rss[.xml].tsx}`, `app/presentation/components/post/PostRow.tsx`, `app/application/feed/services/build-rss-feed.service.ts`

## Scope

### In Scope
- `blog._index.tsx` loader: `?tag` 파싱 → `listPosts({ tag })`, 발행일 역순
- `<PostRow />` — 제목/date/lede/tags/read 표시
- `<TagFilterChips />` — Project와 동일 패턴 (T012 컴포넌트 재사용 또는 generic 도입)
- `build-rss-feed.service.ts` — 모든 post를 RSS 2.0 XML 문자열로 변환
- `rss[.xml].tsx` resource route — `Content-Type: application/xml` 응답

### Out of Scope
- Blog Detail (T014b)
- 페이지별 meta export (T019)

## Acceptance Criteria
- [ ] `/blog` 진입 시 모든 post가 발행일 역순으로 행 형태로 렌더
- [ ] 각 행에 제목, date, lede, tags, read 표시
- [ ] 태그 칩 클릭 시 URL `?tag=<tag>` 변경 + 필터링 결과
- [ ] `/rss.xml` 응답이 RSS 2.0 well-formed XML, `<rss version="2.0">`, `<channel>`, `<title>`, `<link>`, `<description>`, `<item>{title,link,description,pubDate,guid}` 포함
- [ ] item 수 = 모든 post 수
- [ ] `Content-Type: application/xml` 헤더

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/routes/__tests__/blog._index.test.tsx` (Issue #1 보강)
  - mock container `listPosts({ tag })` 호출 + 발행일 역순 정렬 검증 (`getAllByRole('article')` 순서 = mock 결과 순서)
  - 태그 칩 클릭 → `?tag=` URLSearchParam
- `app/presentation/components/post/__tests__/PostRow.test.tsx`
  - 제목/date/lede/tags/read 5 필드 모두 RTL `getByText`
- `app/application/feed/services/__tests__/build-rss-feed.service.test.ts`
  - mock posts 3개 → RSS 2.0 well-formed XML 반환
  - `<title>`, `<link>`, `<description>`, `<item>` 갯수 = 3
  - `pubDate`가 RFC 822 형식 ISO date 변환
- `app/presentation/routes/__tests__/rss.test.ts`
  - loader 호출 → `Response`의 `Content-Type === "application/xml"`, body가 `<?xml version="1.0"`로 시작

### Green
- `blog._index.tsx` + `<PostRow />`
- `build-rss-feed.service.ts` — 순수 함수, posts 배열 → XML 문자열 (template literal 또는 `xml-js`)
- `rss[.xml].tsx` loader — `context.container.buildRssFeed()` 호출 → `Response(xml, { headers })`
- DI Container에 `buildRssFeed` service 등록 (T009 container 확장)

### Refactor
- `<TagFilterChips />`를 T012의 컴포넌트 재사용 (이미 generic이라면 import만)
- RSS XML escape를 utility 함수로 분리 (`escapeXml(text)`)

## Files to Create / Modify

### Application — Service
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/feed/services/build-rss-feed.service.ts` | posts → RSS 2.0 XML |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/feed/services/__tests__/build-rss-feed.service.test.ts` | unit |

### Presentation — Routes
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/blog._index.tsx` | loader + UI |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/rss[.xml].tsx` | resource route — XML response |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/blog._index.test.tsx` | RTL (Issue #1) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/rss.test.ts` | response unit |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/post/PostRow.tsx` | 행 (제목/date/lede/tags/read) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/post/__tests__/PostRow.test.tsx` | RTL |

### Infrastructure — Config (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/container.ts` | `buildRssFeed: () => Promise<string>` 추가 |

## Verification Steps

### 자동
- `bun run test` — 4 테스트 셋 (`blog._index`, `PostRow`, `build-rss-feed.service`, `rss`) 모두 Green
- RSS XML이 well-formed임을 정규식 또는 `fast-xml-parser`로 파싱 검증

### 수동
- `wrangler dev` `/blog` → 행 리스트 시각 확인
- `/rss.xml`을 RSS 리더(예: NetNewsWire)에 등록 → 정상 구독 확인 (선택)
- 브라우저에서 `/rss.xml` 직접 열기 → XML 트리 표시

### 측정
- 없음

## Dependencies
- **Depends on**: T005, T007 (`.velite/posts.json`), T008 (`listPosts`), T009 (DI)
- **Blocks**: T014b (Blog Detail), T018 (OG가 Blog frontmatter 사용)

## Risks & Mitigations
- **Risk**: RSS XML 안의 본문 또는 lede에 `<`, `&` 등 escape 누락.
  - **Mitigation**: `escapeXml(text)` 유틸로 모든 사용자 입력 escape.
- **Risk**: `pubDate`의 timezone 처리.
  - **Mitigation**: ISO date → RFC 822 변환 시 UTC로 통일.

## References
- PRD `Page-by-Page — Blog Page`, `F006`, `F012`
- ROADMAP.md `Phase 3` Task 014a (검증 리포트 Issue #4 분할)
- [RSS 2.0 spec](https://www.rssboard.org/rss-specification)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
