# tkstarDev Task Index

> 본 디렉토리는 [`docs/ROADMAP.md`](../ROADMAP.md)의 각 task를 PR-ready한 단위 작업서로 풀어둔 정본이다. 모든 task는 **Clean Architecture 4-layer + TDD-First + Inside-Out**을 준수하며, PR 1개 단위로 끝나도록 분량 조정되어 있다.
>
> - **Status 범례**: `Not Started` (기본) / `In Progress` (PR open) / `In Review` (review-ready) / `Done` (squash merge 완료)
> - **TDD Cycle 면제**: `chore/*` / `docs/*` 브랜치에서는 Plan/TDD phase가 생략된다 (CLAUDE.md `chore/* docs/* 분류` 정책).

## Phase 별 진행 현황

| Phase | 범위 | Task 수 | 상태 |
|-------|------|---------|------|
| Phase 0 — Setup & Toolchain | T001 ~ T003 | 3 | ⬜ Not Started |
| Phase 1 — Foundation | T004 ~ T006 | 3 | ⬜ Not Started |
| Phase 2 — Content Pipeline | T007 ~ T009 | 3 | ⬜ Not Started |
| Phase 3 — Core Pages UI | T010 ~ T013, T014a, T014b, T015 | 7 | ⬜ Not Started |
| Phase 4 — Forms / Email | T016, T017-pre, T017 | 3 | ⬜ Not Started |
| Phase 5 — SEO / OG / Indexing | T018 ~ T020 | 3 | ⬜ Not Started |
| Phase 6 — Polish & Deploy | T021 ~ T022 | 2 | ⬜ Not Started |

**총 24개 task** (T014 분리 + T017-pre 신규)

## Task ID → 파일명 → 상태

### Phase 0 — Setup & Toolchain

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T001 | 프로젝트 스캐폴딩 + Bun + TypeScript + Biome 셋업 | [T001-scaffold-bun-rr7-biome.md](./T001-scaffold-bun-rr7-biome.md) | `chore/scaffold-bun-rr7-biome` | Not Started |
| T002 | Clean Architecture 4-layer 디렉토리 골격 + path alias | [T002-ca-4layer-skeleton.md](./T002-ca-4layer-skeleton.md) | `chore/ca-4layer-skeleton` | Not Started |
| T003 | Vite + RR7 Framework + Cloudflare Workers + Tailwind v4 빌드 파이프라인 | [T003-vite-rr7-workers-tailwind-pipeline.md](./T003-vite-rr7-workers-tailwind-pipeline.md) | `chore/vite-rr7-workers-tailwind-pipeline` | Not Started |

### Phase 1 — Foundation

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T004 | 라우트 스켈레톤 13개 + chrome / chrome-free 레이아웃 | [T004-route-skeleton.md](./T004-route-skeleton.md) | `feature/issue-N-route-skeleton` | Not Started |
| T005 | 디자인 토큰 이식 + Tailwind v4 `@theme` + `[data-theme]` + 다크모드 (F010) | [T005-theme-tokens.md](./T005-theme-tokens.md) | `feature/issue-N-theme-tokens` | Not Started |
| T006 | Domain Schemas — Project / Post / AppLegalDoc / ContactSubmission / ThemePreference | [T006-domain-schemas.md](./T006-domain-schemas.md) | `feature/issue-N-domain-schemas` | Not Started |

### Phase 2 — Content Pipeline

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T007 | velite 설치 + 컬렉션 정의 + seed 콘텐츠 + shiki 코드블록 | [T007-velite-content-pipeline.md](./T007-velite-content-pipeline.md) | `feature/issue-N-velite-content-pipeline` | Not Started |
| T008 | Application Ports + Content Repositories | [T008-content-ports-repos.md](./T008-content-ports-repos.md) | `feature/issue-N-content-ports-repos` | Not Started |
| T009 | DI Container (Composition Root) + workers/app.ts wiring | [T009-di-container.md](./T009-di-container.md) | `feature/issue-N-di-container` | Not Started |

### Phase 3 — Core Pages UI

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T010 | Home Page (F001 Hero + F017 Featured/Recent) | [T010-home-page.md](./T010-home-page.md) | `feature/issue-N-home-page` | Not Started |
| T011 | About Page + F003 PDF 인쇄 스타일 | [T011-about-page-print.md](./T011-about-page-print.md) | `feature/issue-N-about-page-print` | Not Started |
| T012 | Projects Page (F004 ls-style 행 리스트 + 태그 필터) | [T012-projects-list.md](./T012-projects-list.md) | `feature/issue-N-projects-list` | Not Started |
| T013 | Project Detail Page (F005 + sticky sidebar + on-this-page TOC) | [T013-project-detail.md](./T013-project-detail.md) | `feature/issue-N-project-detail` | Not Started |
| T014a | Blog Page (F006) — 목록 + 태그 필터 + RSS Resource Route (F012) | [T014a-blog-list-rss.md](./T014a-blog-list-rss.md) | `feature/issue-N-blog-list-rss` | Not Started |
| T014b | Blog Detail Page (F007) — 본문 + sticky sidebar + share | [T014b-blog-detail.md](./T014b-blog-detail.md) | `feature/issue-N-blog-detail` | Not Started |
| T015 | Legal Index + App Terms + App Privacy (F014, chrome-free) | [T015-legal-pages.md](./T015-legal-pages.md) | `feature/issue-N-legal-pages` | Not Started |

### Phase 4 — Forms / Email

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T016 | F016 Cmd+K Command Palette (글로벌 검색 네비) | [T016-command-palette.md](./T016-command-palette.md) | `feature/issue-N-command-palette` | Not Started |
| T017-pre | PROJECT-STRUCTURE.md 갱신 — `app/infrastructure/ratelimit/` 모듈 등록 | [T017-pre-update-project-structure-ratelimit.md](./T017-pre-update-project-structure-ratelimit.md) | `docs/update-project-structure-ratelimit` | Not Started |
| T017 | Contact Form + Turnstile + Resend + 자동응답 메일 (F008 + F009) | [T017-contact-form-email.md](./T017-contact-form-email.md) | `feature/issue-N-contact-form-email` | Not Started |

### Phase 5 — SEO / OG / Indexing

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T018 | F011 Satori 동적 OG 이미지 (Project + Blog) — Workers Asset Binding | [T018-satori-og.md](./T018-satori-og.md) | `feature/issue-N-satori-og` | Not Started |
| T019 | F018 SEO Meta + Sitemap + Robots + JSON-LD (차등 인덱싱) | [T019-seo-sitemap-jsonld.md](./T019-seo-sitemap-jsonld.md) | `feature/issue-N-seo-sitemap-jsonld` | Not Started |
| T020 | F019 검색엔진 등록 (Google + Naver) + Cloudflare Web Analytics (F013) | [T020-search-engine-verification.md](./T020-search-engine-verification.md) | `feature/issue-N-search-engine-verification` | Not Started |

### Phase 6 — Polish & Deploy

| Task ID | Title | File | Branch | Status |
|---------|-------|------|--------|--------|
| T021 | 통합 QA + Lighthouse + Axe 접근성 점검 + 모든 PRD AC 통과 매트릭스 | [T021-qa-pass-mvp.md](./T021-qa-pass-mvp.md) | `chore/qa-pass-mvp` | Not Started |
| T022 | Cloudflare Workers 배포 + 도메인 연결 + Email Routing + 검색엔진 인증 완료 | [T022-deploy-production.md](./T022-deploy-production.md) | `chore/deploy-production` | Not Started |

---

## 작성 규칙

각 task 파일은 다음 11개 섹션을 모두 포함한다:

1. **Header** — Task ID, Title, Phase, Layer, Branch, 의존성, PRD Feature/AC, 예상 작업 시간, Status
2. **Goal** — 1~2줄
3. **Context** — Why / Phase 진입·완료 조건 / PRD 섹션 / PROJECT-STRUCTURE 디렉토리
4. **Scope** — In Scope / Out of Scope
5. **Acceptance Criteria** — Given-When-Then (PRD AC 보유 task는 PRD AC 인용 + task 단위 추가 AC)
6. **Implementation Plan (TDD Cycle)** — Red → Green → Refactor (chore/docs는 `N/A`)
7. **Files to Create / Modify** — 절대경로 + 1줄 책임 (Layer 그룹핑)
8. **Verification Steps** — 자동 / 수동 / 측정
9. **Dependencies** — Depends on / Blocks
10. **Risks & Mitigations** (선택)
11. **References** — PRD / PROJECT-STRUCTURE / design-system / 외부 docs

## 진행 흐름

```
T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 →
  ┌── T010 ┐
  ├── T011 ┤
  ├── T012 ├── T016 → T017-pre → T017 → T018 → T019 → T020 → T021 → T022
  ├── T013 ┤
  ├── T014a → T014b
  └── T015 ┘
```
