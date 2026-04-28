# Task 018 — F011 Satori 동적 OG 이미지 (Project + Blog) — Workers Asset Binding

| Field | Value |
|-------|-------|
| **Task ID** | T018 |
| **Phase** | Phase 5 — SEO / OG / Indexing |
| **Layer** | Application(`render-*-og.service`, port) + Infrastructure(Satori standalone + Asset Binding) + Resource Route |
| **Branch** | `feature/issue-N-satori-og` |
| **Depends on** | T013, T014a, T014b |
| **Blocks** | T019 |
| **PRD Features** | **F011** (SSR + 동적 OG 이미지) |
| **PRD AC** | **AC-F011-1**, **AC-F011-2**, **AC-F011-3** |
| **예상 작업 시간** | 1.5d |
| **Status** | Not Started |

## Goal
Satori standalone + Workers Asset Binding으로 `/og/projects/:slug.png` / `/og/blog/:slug.png` 리소스 라우트를 가동하여 슬러그별 1200×630 PNG OG 이미지를 SSR 시점 또는 첫 요청 시 생성한다. 미존재 slug는 fallback PNG, 폰트/yoga.wasm 누락 시 graceful degradation. 가정 A005 해소.

## Context
- **Why**: SNS 공유 / 검색엔진 미리보기에서 OG 이미지는 클릭률에 큰 영향. Project/Blog 슬러그별 동적 생성으로 운영 부담 0 + 자동 일관성.
- **Phase 진입/완료 연결**: T013 Project Detail + T014a/T014b Blog Detail이 Done이어야 frontmatter 사용 가능. T018 Done 후 T019 SEO meta가 `og:image` URL을 등록.
- **관련 PRD 섹션**: PRD `F011`, AC-F011-1~3, `Tech Stack — Content Pipeline / Typography`
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/application/og/{ports,services}/`, `app/infrastructure/og/`, `app/presentation/routes/og.*[.png].tsx`, `public/{fonts,wasm}/`

## Scope

### In Scope
- `og-image-renderer.port.ts` — `render(template, data): Promise<Uint8Array>` 인터페이스
- `render-project-og.service.ts` / `render-post-og.service.ts` — frontmatter → Satori 호출
- `satori-og-renderer.ts` — Satori standalone 어댑터, `env.ASSETS.fetch(...)` 로 ttf + yoga.wasm 로드
- 2개 resource route (`og.projects.$slug[.png].tsx`, `og.blog.$slug[.png].tsx`) — loader만 export
- `public/fonts/JetBrainsMono-Regular.ttf` (woff2 외 ttf 별도, Satori 미지원 woff2)
- `public/wasm/yoga.wasm` (Satori standalone 초기화)
- 정적 fallback PNG (`public/og/fallback.png` 또는 in-memory 생성)
- DI Container에 `renderProjectOg` / `renderBlogOg` 등록

### Out of Scope
- 페이지별 `og:image` meta export (T019)
- 디자인 토큰 사용한 OG 템플릿의 다크/라이트 분기 (단일 템플릿으로 시작)

## Acceptance Criteria (PRD AC 인용)
- [ ] **AC-F011-1**: `/og/projects/:slug.png` 또는 `/og/blog/:slug.png` 요청 → Satori가 frontmatter(title/date/tags)로 PNG 생성 → 1200×630 PNG + `Content-Type: image/png` + `Cache-Control: public, max-age=31536000, immutable`
- [ ] **AC-F011-2**: 미존재 slug 요청 → loader 핸들러 → 404가 아니라 default fallback PNG(브랜드 로고 + "tkstar.dev")
- [ ] **AC-F011-3**: Satori 렌더링 실패(폰트 binary 누락 등) → 정적 fallback PNG + Workers logs 에러 기록

## Implementation Plan (TDD Cycle)

### Red

#### Application
- `app/application/og/services/__tests__/render-project-og.service.test.ts`
  - mock `OgImageRenderer.render` → `{title, date, tags}`로 호출 검증
  - 정상 → PNG bytes 반환
- `app/application/og/services/__tests__/render-post-og.service.test.ts`
  - 동일 패턴

#### Infrastructure
- `app/infrastructure/og/__tests__/satori-og-renderer.test.ts`
  - `env.ASSETS.fetch` mock — ttf/yoga.wasm 로드 시 정상 동작
  - `satori` mock으로 PNG bytes 반환 검증
  - 폰트 누락 시 fallback PNG 경로 + 에러 로그
  - **AC-F011-1 size**: 출력 PNG의 magic header(`\x89PNG`) + IHDR width/height = 1200×630

#### Resource Route
- `app/presentation/routes/__tests__/og.projects.$slug.test.ts`
  - loader 호출 → `Response` Content-Type / Cache-Control 헤더 검증 (AC-F011-1)
  - 미존재 slug → fallback PNG (AC-F011-2)
  - renderer throw → fallback PNG + console.error 검증 (AC-F011-3)

### Green
- 1 port + 2 services (Application)
- 1 어댑터 (`satori-og-renderer.ts`)
- 2 resource route loader
- DI Container 확장
- public assets 추가

### Refactor
- OG 템플릿 JSX를 별도 모듈(`app/infrastructure/og/templates/{project,post}.tsx`)로 분리
- ttf/wasm 로드를 module-level cache로 1회만

## Files to Create / Modify

### Application — Port
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/og/ports/og-image-renderer.port.ts` | `render(template, data): Promise<Uint8Array>` |

### Application — Services
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/og/services/render-project-og.service.ts` | project frontmatter → renderer.render |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/og/services/render-post-og.service.ts` | post frontmatter → renderer.render |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/og/services/__tests__/*.test.ts` | unit |

### Infrastructure
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/og/satori-og-renderer.ts` | satori/standalone + env.ASSETS.fetch |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/og/templates/project.tsx` | OG 템플릿 JSX |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/og/templates/post.tsx` | OG 템플릿 JSX |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/og/__tests__/satori-og-renderer.test.ts` | unit |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/infrastructure/config/container.ts` (수정) | `renderProjectOg`, `renderBlogOg` 추가 |

### Presentation — Resource Routes
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/og.projects.$slug[.png].tsx` | loader → 1200×630 PNG |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/og.blog.$slug[.png].tsx` | loader → 1200×630 PNG |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/og.projects.$slug.test.ts` | unit |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/og.blog.$slug.test.ts` | unit |

### Public Assets
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/public/fonts/JetBrainsMono-Regular.ttf` | Satori 입력 폰트 |
| `/Users/tkstart/Desktop/project/tkstar-dev/public/wasm/yoga.wasm` | Satori standalone yoga binding |
| `/Users/tkstart/Desktop/project/tkstar-dev/public/og/fallback.png` | 정적 fallback (1200×630, 브랜드 로고 + "tkstar.dev") |

### Dependencies
- `bun add satori @resvg/resvg-wasm` 또는 satori standalone 빌드 변형 검토. **권장**: `satori/standalone` + 별도 `@resvg/resvg-wasm`(또는 `pngjs`)로 PNG 인코딩.

## Verification Steps

### 자동
- `bun run test` — 4개 테스트 셋(project og service, post og service, satori-og-renderer, og resource routes) 모두 Green
- AC-F011-1/2/3 매핑 명시
- PNG magic header + IHDR width/height assertion

### 수동
- `wrangler dev`에서 `/og/projects/example-project.png` 직접 접속 → 1200×630 PNG 다운로드 → 시각 확인
- `/og/projects/missing-slug.png` → fallback PNG 응답
- 폰트 파일을 임시로 삭제 후 요청 → fallback 응답 + Workers logs 에러
- Twitter/Facebook OG validator로 production URL 검증 (T022 배포 후)

### 측정
- PNG 파일 size — 30~60KB 범위 (1200×630 PNG 기본)
- Cold start 시 Satori 초기화 비용 — Workers logs로 측정 (Phase 6 Lighthouse에서 정식)

## Dependencies
- **Depends on**: T013 (Project Detail frontmatter), T014a (Blog list + posts available), T014b (Blog Detail frontmatter)
- **Blocks**: T019 (SEO meta가 OG URL 등록)

## Risks & Mitigations
- **Risk**: Workers의 cpu time limit (10ms~50ms) 안에 Satori 렌더링이 끝나지 않을 수 있음.
  - **Mitigation**: 첫 요청 시 ttf/yoga.wasm 로드 비용이 큼 → module-level cache. AC-F011-1의 `Cache-Control: immutable`로 CDN 영구 캐시 유도.
- **Risk**: woff2가 Satori 미지원이라 ttf 별도 보관 필요.
  - **Mitigation**: PROJECT-STRUCTURE.md에 명시. T005에서 woff2 self-host와 별개로 `JetBrainsMono-Regular.ttf` 추가.
- **Risk**: yoga.wasm 동적 로드가 Workers WASM 정책에 막힘.
  - **Mitigation**: PROJECT-STRUCTURE.md D5 결정 — `env.ASSETS.fetch(".../wasm/yoga.wasm")`로 우회.

## References
- PRD `F011`, AC-F011-1~3, `Tech Stack — Content Pipeline / Typography`
- PROJECT-STRUCTURE.md `D5. Satori 폰트/WASM 바인딩` (line 587~)
- ROADMAP.md `Phase 5` Task 018, 가정 A005 해소
- [Satori](https://github.com/vercel/satori), [Cloudflare Static Assets Binding](https://developers.cloudflare.com/workers/static-assets/binding/)
- [6 Pitfalls of Dynamic OG on Workers](https://dev.to/devoresyah/6-pitfalls-of-dynamic-og-image-generation-on-cloudflare-workers-satori-resvg-wasm-1kle)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
