# Task 004 — 라우트 스켈레톤 13개 + chrome / chrome-free 레이아웃

| Field | Value |
|-------|-------|
| **Task ID** | T004 |
| **Phase** | Phase 1 — Foundation |
| **Layer** | Presentation (`routes/` + `layouts/`) |
| **Branch** | `feature/issue-N-route-skeleton` |
| **Depends on** | T002, T003 |
| **Blocks** | T010, T011, T012, T013, T014a, T014b, T015 |
| **PRD Features** | F014 (chrome-free), F018/F019 (root layout meta 자리), Not Found Fallback (splat) |
| **PRD AC** | — (라우트 placeholder 단계) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
PRD의 모든 라우트 13개에 빈 placeholder 모듈을 깔고, chrome / chrome-free 두 레이아웃을 도입하여 후속 페이지 task가 콘텐츠에만 집중할 수 있게 한다. splat(`$.tsx`) 라우트로 Not Found Fallback의 위치를 확정 (가정 A004 해소).

## Context
- **Why**: 페이지 task(T010~T015)는 모두 빈 라우트 파일을 받아서 콘텐츠를 채워 넣는 형식이어야 PR 단위가 작아진다. 또한 chrome-free 레이아웃은 F014(앱 약관)와 일반 페이지의 시각적 격리를 layout 컴포넌트 수준에서 미리 분리해야 후속 PR에서 chrome on/off 토글이 깨끗.
- **Phase 진입/완료 연결**: T003(Vite/RR7 파이프라인)이 완료되어 typegen이 동작하면 즉시 시작. T004 완료 후 T010~T015 페이지 task들이 병렬로 시작 가능.
- **관련 PRD 섹션**: `Menu Structure`, `Page-by-Page Detailed Features` 11개 페이지, `Not Found Fallback`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/`, `app/presentation/layouts/`

## Scope

### In Scope
- 13개 라우트 placeholder 파일 생성 (각 파일은 빈 컴포넌트 + `meta` placeholder export만)
- 5개 resource route placeholder (`rss[.xml].tsx`, `sitemap[.xml].tsx`, `robots[.txt].tsx`, `og.projects.$slug[.png].tsx`, `og.blog.$slug[.png].tsx`) — loader 본체는 후속 task가 채움, 현재는 빈 200 응답
- splat 라우트 `$.tsx` — 터미널 메타포 `cd: no such route: <path>` placeholder
- `<ChromeLayout />` / `<ChromeFreeLayout />` 컴포넌트 골격
- `app/root.tsx`에 layout 분기 placeholder (URL `/legal/[app]/(terms|privacy)`이면 `<ChromeFreeLayout />`, 그 외 `<ChromeLayout />`)

### Out of Scope
- Topbar/Footer/ThemeToggle 본체 (T005)
- 페이지별 콘텐츠/loader 본체 (T010~T015)
- 페이지별 meta export (T019)
- Resource route 실제 응답 (RSS는 T014a, OG는 T018, Sitemap/Robots는 T019)

## Acceptance Criteria
- [ ] `wrangler dev`에서 다음 13개 URL 직접 입력 시 모두 placeholder 응답 (404 아님): `/`, `/about`, `/projects`, `/projects/foo`, `/blog`, `/blog/foo`, `/contact`, `/legal`, `/legal/moai/terms`, `/legal/moai/privacy`, `/rss.xml`, `/sitemap.xml`, `/robots.txt`
- [ ] 2개 OG resource route URL (`/og/projects/foo.png`, `/og/blog/foo.png`)이 200 응답 (placeholder)
- [ ] 미존재 경로(`/random-not-exist`) 접속 시 splat이 동작하여 터미널 메타포 placeholder 렌더 (404 페이지가 아님)
- [ ] `/legal/moai/terms`, `/legal/moai/privacy`만 chrome-free 레이아웃(임시 div로 래핑된) 사용. 나머지는 chrome 레이아웃 (Topbar/Footer placeholder slot 노출)
- [ ] `bun run typecheck` 통과 (RR7 typegen `.react-router/types/`가 모든 라우트 모듈에 대해 생성)
- [ ] `bun run lint` 통과

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/layouts/__tests__/ChromeFreeLayout.test.tsx`
  - `expect(<ChromeFreeLayout><p>body</p></ChromeFreeLayout>` rendered DOM): `<header>`, `<footer>` 미렌더 / 자식 `<p>body</p>`만 렌더 / 컨테이너 `max-width` style 또는 className 적용
- `app/presentation/layouts/__tests__/ChromeLayout.test.tsx`
  - `<ChromeLayout>` 자식 콘텐츠가 Topbar slot과 Footer slot 사이에 렌더 (현재는 placeholder div)

### Green
- `app/presentation/layouts/ChromeFreeLayout.tsx` — `<div className="legal-container">{children}</div>` (max-width 680px)
- `app/presentation/layouts/ChromeLayout.tsx` — `<><header data-testid="topbar-slot" />{children}<footer data-testid="footer-slot" /></>` (T005에서 Topbar/Footer 본체 채움)
- 13개 라우트 placeholder + 5개 resource route placeholder + 1개 splat
- `app/root.tsx`에서 URL 패턴 매칭으로 layout 분기 (또는 React Router pathless layout route 사용)

### Refactor
- placeholder 컴포넌트들에 동일한 명명 규칙(`Page` suffix 또는 default export) 통일
- `app/presentation/layouts/index.ts`로 barrel export

## Files to Create / Modify

### Presentation — Routes (13 page routes)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/_index.tsx` | Home placeholder (T003에서 만든 것 위에 보강) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/about.tsx` | About placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/projects._index.tsx` | Projects 목록 placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/projects.$slug.tsx` | Project Detail placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/blog._index.tsx` | Blog 목록 placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/blog.$slug.tsx` | Blog Detail placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/contact.tsx` | Contact placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal._index.tsx` | Legal Index placeholder |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal.$app.terms.tsx` | App Terms placeholder (chrome-free) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/legal.$app.privacy.tsx` | App Privacy placeholder (chrome-free) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/$.tsx` | splat — Not Found Fallback (`cd: no such route: <path>`) |

### Presentation — Resource Routes (5 routes)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/rss[.xml].tsx` | placeholder loader: 빈 RSS XML stub (T014a에서 본체) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/sitemap[.xml].tsx` | placeholder loader: 빈 sitemap stub (T019에서 본체) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/robots[.txt].tsx` | placeholder loader: `User-agent: *\nAllow: /` 최소형 (T019에서 본체) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/og.projects.$slug[.png].tsx` | placeholder loader: 200 빈 PNG (T018에서 본체) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/og.blog.$slug[.png].tsx` | placeholder loader: 200 빈 PNG (T018에서 본체) |

### Presentation — Layouts
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/layouts/ChromeLayout.tsx` | Topbar slot + children + Footer slot |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/layouts/ChromeFreeLayout.tsx` | `.legal` 컨테이너 (max-width 680px), Topbar/Footer 미렌더 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/layouts/__tests__/ChromeLayout.test.tsx` | RTL: Topbar/Footer slot + children 순서 검증 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/layouts/__tests__/ChromeFreeLayout.test.tsx` | RTL: Topbar/Footer 미렌더, max-width 680px 적용 |

### Root (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/root.tsx` | `useMatches()` 또는 `useLocation()`으로 URL이 `/legal/:app/(terms|privacy)`이면 `<ChromeFreeLayout>`, 아니면 `<ChromeLayout>`으로 `<Outlet />` 감싸기 |

## Verification Steps

### 자동
- `bun run test`에서 ChromeLayout/ChromeFreeLayout 테스트 2개 통과
- `bun run typecheck` → 13개 라우트 + 5개 resource route + 1개 splat = 19개 라우트 모듈에 대해 typegen 정상

### 수동
- `bunx wrangler dev` 후 13개 페이지 URL 접속 → placeholder 응답
- 미존재 경로(`/foobar`) 접속 → splat 터미널 메시지 placeholder
- `/legal/moai/terms` 접속 → Topbar/Footer 미노출 + max-width 680px 컨테이너만 (시각 확인)
- `/about` 접속 → Topbar slot + Footer slot 노출 (T005 이후 본체 채워짐)

### 측정
- 없음

## Dependencies
- **Depends on**: T002 (디렉토리 골격), T003 (Vite/RR7 파이프라인)
- **Blocks**: T010 (Home 콘텐츠), T011 (About 콘텐츠), T012 (Projects 목록), T013 (Project Detail), T014a (Blog List), T014b (Blog Detail), T015 (Legal 페이지들)

## Risks & Mitigations
- **Risk**: RR7 file convention의 `legal.$app.terms.tsx` 파싱이 `:app` 동적 segment를 정확히 인식하지 않을 가능성.
  - **Mitigation**: 공식 [File Route Conventions](https://reactrouter.com/how-to/file-route-conventions)의 `$param` 규칙 검증 + dev-only smoke test로 `/legal/moai/terms` 매칭 확인.
- **Risk**: Resource route(`rss[.xml].tsx`)에서 escape 문법이 typegen에 영향.
  - **Mitigation**: PROJECT-STRUCTURE.md `Route file conventions` 표(line 318~334)와 동일 명명 사용.

## References
- PRD `Menu Structure`, `Page-by-Page Detailed Features` 11개 페이지, `Not Found Fallback`
- PROJECT-STRUCTURE.md `app/presentation/routes/` (line 299~334)
- PROJECT-STRUCTURE.md `D1. 라우트 디렉토리` 결정 (line 568~)
- ROADMAP.md `Phase 1` Task 004, 가정 A004 해소
- [React Router v7 File Route Conventions](https://reactrouter.com/how-to/file-route-conventions)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
