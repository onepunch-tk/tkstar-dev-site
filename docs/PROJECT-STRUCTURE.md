# tkstarDev Project Structure

> 생성일: 2026-05-13 · 문서 버전: 2.0.0 · Generator: project-structure-generator

## 개요 (Overview)

tkstarDev는 1인 개발자 개인 브랜드 웹사이트로, 사이트 자체가 이력서 역할을 하며 B2B(기업/HR) 채용 제안과 B2C(프리랜서 의뢰)를 단일 도메인(`tkstar.dev`)에서 수렴시킨다. 정적 콘텐츠 사이트임에도 불구하고 **Clean Architecture 4-layer 분리**를 엄격히 적용한다 — Resend / Turnstile / Satori / velite / D1 / KV 등 다수의 Infrastructure 외부 의존성을 격리하고, Contact Form / Command Palette 검색 / OG 이미지 생성 / Post body 컴파일·캐싱 등 비자명한 Application 유스케이스를 테스트 가능하게 만들기 위함.

- **Architecture**: Clean Architecture (4-layer 단방향 의존: Presentation → Application → Domain, Infrastructure 는 Application Port 의 구현)
- **Framework**: React Router 7 Framework mode (SSR)
- **Runtime**: Cloudflare Workers (wrangler, `@cloudflare/vite-plugin`)
- **Platform Adapter**: `workers/app.ts` 단일 진입점 — DI Composition Root 호출 + RR7 request handler 조립
- **콘텐츠 정본 분기**: Project / Legal 은 `content/**/*.mdx` → velite ETL, Post 는 D1 (edge SQLite) — body markdown 은 unified 파이프라인으로 hast 컴파일 후 KV 캐싱

## 저장소 구성 (Repository Layout)

- 형태: `single`
- 모노레포 도구: `N/A`
- 서브패키지 수: 1

## 디렉토리 구조 (Directory Structure)

_프레임워크: **react-router**_

### Directory Tree

```tree
tkstar-dev/
├── app/                                  # 핵심 애플리케이션 (CA 4-layer)
│   ├── domain/                           # innermost — 외부 의존 0 (zod 만 허용)
│   │   ├── _shared/
│   │   │   └── zod-helpers.ts
│   │   ├── contact/
│   │   │   ├── __tests__/
│   │   │   ├── contact-submission.schema.ts
│   │   │   ├── contact-submission.vo.ts
│   │   │   └── contact.errors.ts
│   │   ├── legal/
│   │   │   ├── __tests__/
│   │   │   ├── app-legal-doc.entity.ts
│   │   │   └── app-legal-doc.schema.ts
│   │   ├── post/
│   │   │   ├── __tests__/
│   │   │   ├── post.entity.ts
│   │   │   ├── post.errors.ts
│   │   │   └── post.schema.ts
│   │   ├── project/
│   │   │   ├── __tests__/
│   │   │   ├── project.entity.ts
│   │   │   ├── project.errors.ts
│   │   │   └── project.schema.ts
│   │   └── theme/
│   │       └── theme-preference.vo.ts
│   │
│   ├── application/                      # use case + port — Infrastructure 미import
│   │   ├── contact/
│   │   │   ├── ports/
│   │   │   │   ├── captcha-verifier.port.ts
│   │   │   │   ├── email-sender.port.ts
│   │   │   │   └── rate-limiter.port.ts
│   │   │   ├── services/
│   │   │   │   ├── __tests__/
│   │   │   │   └── submit-contact-form.service.ts
│   │   │   ├── templates/                # React Email (Resend)
│   │   │   │   └── AutoReplyEmail.tsx
│   │   │   └── errors.ts
│   │   ├── content/
│   │   │   ├── ports/
│   │   │   │   ├── legal-repository.port.ts
│   │   │   │   ├── markdown-compiler.port.ts
│   │   │   │   ├── post-body-cache.port.ts
│   │   │   │   ├── post-repository.port.ts
│   │   │   │   └── project-repository.port.ts
│   │   │   └── services/
│   │   │       ├── _shared/
│   │   │       │   └── assert-exists.ts
│   │   │       ├── __tests__/
│   │   │       ├── compile-post-body.service.ts
│   │   │       ├── get-featured-project.service.ts
│   │   │       ├── get-post-detail.service.ts
│   │   │       ├── get-project-detail.service.ts
│   │   │       ├── get-recent-posts.service.ts
│   │   │       ├── list-posts.service.ts
│   │   │       └── list-projects.service.ts
│   │   ├── feed/
│   │   │   └── services/
│   │   │       ├── __tests__/
│   │   │       └── build-rss-feed.service.ts
│   │   ├── og/
│   │   │   ├── ports/
│   │   │   │   └── og-image-renderer.port.ts
│   │   │   └── services/
│   │   │       ├── __tests__/
│   │   │       ├── render-post-og.service.ts
│   │   │       └── render-project-og.service.ts
│   │   ├── search/
│   │   │   ├── lib/                      # 토큰 매칭 유틸 (build-time + runtime 양쪽 사용)
│   │   │   │   ├── __tests__/
│   │   │   │   └── token-search.ts
│   │   │   └── services/
│   │   │       ├── __tests__/
│   │   │       └── build-search-index.service.ts
│   │   └── seo/
│   │       ├── __tests__/
│   │       ├── services/
│   │       │   ├── __tests__/
│   │       │   └── build-sitemap.service.ts
│   │       └── launch-gate.ts            # SITE_LAUNCHED / SITE_ORIGIN env helper
│   │
│   ├── infrastructure/                   # 외부 시스템 어댑터 — Application Port 구현
│   │   ├── analytics/
│   │   │   ├── __tests__/
│   │   │   └── cloudflare-web-analytics.ts
│   │   ├── cache/                        # KV body cache (T027)
│   │   │   ├── __tests__/
│   │   │   └── kv-post-body-cache.ts
│   │   ├── captcha/
│   │   │   ├── __tests__/
│   │   │   └── turnstile-verifier.ts
│   │   ├── config/                       # DI Composition Root
│   │   │   ├── __tests__/
│   │   │   └── container.ts
│   │   ├── content/                      # velite read-side + markdown compiler
│   │   │   ├── __tests__/
│   │   │   ├── _shared/
│   │   │   │   ├── find-adjacent.ts
│   │   │   │   └── sort-by-date-desc.ts
│   │   │   ├── mappers/
│   │   │   │   ├── legal.mapper.ts
│   │   │   │   └── project.mapper.ts
│   │   │   ├── markdown-compiler.ts
│   │   │   ├── velite-legal.repository.ts
│   │   │   └── velite-project.repository.ts
│   │   ├── db/                           # Cloudflare D1 + Drizzle
│   │   │   ├── __tests__/
│   │   │   │   ├── _helpers/             # better-sqlite3 in-memory + migrations
│   │   │   │   │   └── in-memory-d1.ts
│   │   │   │   ├── d1-post.repository.test.ts
│   │   │   │   └── posts.schema.test.ts
│   │   │   ├── mappers/
│   │   │   │   ├── extract-toc.ts
│   │   │   │   └── post-row.mapper.ts
│   │   │   ├── schema/
│   │   │   │   └── posts.ts              # Drizzle sqliteTable
│   │   │   └── d1-post.repository.ts
│   │   ├── email/
│   │   │   ├── __tests__/
│   │   │   └── resend-email-sender.ts
│   │   ├── og/                           # Satori standalone
│   │   │   ├── __tests__/
│   │   │   ├── templates/
│   │   │   │   └── og-template.tsx
│   │   │   └── satori-og-renderer.ts
│   │   ├── ratelimit/                    # Workers KV IP rate-limiter
│   │   │   ├── __tests__/
│   │   │   └── kv-rate-limiter.ts
│   │   └── search/
│   │
│   ├── presentation/                     # outermost — UI / Routes / Providers
│   │   ├── components/
│   │   │   ├── about/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── AboutHeader.tsx
│   │   │   │   ├── AwardsCard.tsx
│   │   │   │   ├── CareerTimeline.tsx
│   │   │   │   ├── EducationCard.tsx
│   │   │   │   └── StackCards.tsx
│   │   │   ├── chrome/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   └── Topbar.tsx
│   │   │   ├── contact/
│   │   │   │   ├── ContactForm.tsx
│   │   │   │   ├── MailtoFallback.tsx
│   │   │   │   ├── SuccessScreen.tsx
│   │   │   │   └── TurnstileWidget.tsx
│   │   │   ├── content/
│   │   │   │   └── mdx-modules.ts        # @mdx-js/rollup glob 모듈 맵
│   │   │   ├── home/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── FeaturedProjectCard.tsx
│   │   │   │   ├── HeroWhoami.tsx
│   │   │   │   └── RecentPostsList.tsx
│   │   │   ├── legal/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── AppCard.tsx
│   │   │   │   └── LegalDocLayout.tsx
│   │   │   ├── palette/
│   │   │   │   ├── __tests__/
│   │   │   │   └── CommandPalette.tsx
│   │   │   ├── post/
│   │   │   │   ├── __tests__/
│   │   │   │   ├── PostFooterNav.tsx
│   │   │   │   ├── PostRow.tsx
│   │   │   │   └── ShareTools.tsx
│   │   │   └── project/
│   │   │       ├── __tests__/
│   │   │       ├── OnThisPageToc.tsx
│   │   │       ├── ProjectFooterNav.tsx
│   │   │       ├── ProjectMetaSidebar.tsx
│   │   │       ├── ProjectRow.tsx
│   │   │       └── TagFilterChips.tsx
│   │   ├── hooks/
│   │   │   ├── __tests__/
│   │   │   ├── useCommandPalette.ts
│   │   │   ├── useKbdHint.ts
│   │   │   └── useTheme.ts
│   │   ├── layouts/
│   │   │   ├── __tests__/
│   │   │   ├── ChromeFreeLayout.tsx
│   │   │   └── ChromeLayout.tsx
│   │   ├── lib/                          # Presentation 유틸 (format / jsonld / meta / recent-visits / print)
│   │   │   ├── __tests__/
│   │   │   ├── about-data.ts
│   │   │   ├── chrome-links.ts
│   │   │   ├── format-relative-time.ts
│   │   │   ├── format.ts
│   │   │   ├── jsonld.ts
│   │   │   ├── meta.ts
│   │   │   ├── png-response.ts
│   │   │   ├── print.ts
│   │   │   └── recent-visits.ts
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx
│   │   └── routes/                       # RR7 file-based — flat dot convention
│   │       ├── __tests__/                # *.test.tsx (route) + *.meta.test.ts (meta export)
│   │       ├── _index.tsx                # /
│   │       ├── $.tsx                     # splat — Not Found
│   │       ├── about.tsx
│   │       ├── blog._index.tsx
│   │       ├── blog.$slug.tsx
│   │       ├── contact.tsx
│   │       ├── legal._index.tsx
│   │       ├── legal.$app.privacy.tsx
│   │       ├── legal.$app.terms.tsx
│   │       ├── og.blog.$slug[.png].tsx   # resource route (PNG)
│   │       ├── og.projects.$slug[.png].tsx
│   │       ├── projects._index.tsx
│   │       ├── projects.$slug.tsx
│   │       ├── robots[.txt].tsx          # resource route (TXT)
│   │       ├── rss[.xml].tsx             # resource route (XML)
│   │       └── sitemap[.xml].tsx         # resource route (XML)
│   │
│   ├── __tests__/                        # 환경 sanity + root.test + 공용 velite fixtures
│   │   ├── fixtures/
│   │   │   ├── velite-legal.fixture.ts
│   │   │   ├── velite-posts.fixture.ts
│   │   │   └── velite-projects.fixture.ts
│   │   ├── root.test.tsx
│   │   └── sanity.test.ts
│   ├── README.md
│   ├── app.css                           # Tailwind v4 진입점 + @theme 토큰
│   ├── entry.server.tsx                  # SSR 엔트리
│   ├── env.d.ts
│   ├── root.tsx                          # ThemeProvider / CommandPalette mount + meta
│   └── routes.ts                         # flatRoutes({ rootDirectory: "presentation/routes" })
│
├── workers/                              # Cloudflare Workers SSR 진입점 (Platform Adapter)
│   ├── __tests__/
│   └── app.ts                            # fetch handler + host 301 + RR7 request handler
│
├── velite/                               # velite custom transforms (extract-toc 등)
│   └── transforms/
│       ├── __tests__/
│       └── extract-toc.ts
│
├── content/                              # velite MDX 정본 (projects/, legal/apps/)
│   ├── projects/
│   │   └── example-project.mdx
│   └── legal/
│       └── apps/
│           └── moai/
│               ├── privacy.mdx
│               └── terms.mdx
│
├── migrations/                           # Drizzle migration journal
│   ├── meta/
│   │   ├── _journal.json
│   │   └── 0000_snapshot.json
│   └── 0000_futuristic_human_cannonball.sql
│
├── scripts/                              # 빌드/마이그레이션 보조 스크립트
│   ├── __tests__/
│   │   └── migrate-posts-to-d1.test.ts
│   ├── seeds/
│   │   └── posts-initial.sql
│   ├── build-og-fallback.mjs             # OG fallback PNG 빌드 → public/og/fallback.png
│   ├── migrate-posts-to-d1.ts            # content/posts/*.mdx → D1 단방향 이관
│   └── patch-velite-types.mjs            # velite generated d.ts 후처리
│
├── public/                               # Workers Assets binding (binding=ASSETS, dir=./public)
│   ├── fonts/                            # Pretendard self-host (woff2 + ttf for Satori)
│   │   ├── Pretendard-Bold.ttf
│   │   ├── Pretendard-Bold.woff2
│   │   ├── Pretendard-LICENSE.txt
│   │   ├── Pretendard-Medium.woff2
│   │   ├── Pretendard-Regular.ttf
│   │   └── Pretendard-Regular.woff2
│   ├── og/
│   │   └── fallback.png                  # 빌드된 OG fallback
│   └── favicon.ico
│
├── test/                                 # 레이어 간 공유 fixture / util (단위 테스트는 각 layer __tests__ 에 colocate)
│   ├── fixtures/
│   └── utils/
│
├── docs/                                 # 정본 문서 + 디자인 정본
│   ├── PRD.md
│   ├── PROJECT-STRUCTURE.md              # (본 문서)
│   ├── ROADMAP.md
│   ├── glossary.md
│   ├── design-system/                    # 디자인 정본 (production 번들 제외 — app/ 외부)
│   │   ├── components/                   # 컴포넌트 와이어프레임 (.jsx)
│   │   ├── proto/                        # 페이지 와이어프레임 (.jsx)
│   │   ├── design-canvas.jsx
│   │   ├── prototype.css
│   │   ├── prototype.html
│   │   ├── styles.css
│   │   ├── terminal.css
│   │   └── tweaks-panel.jsx
│   ├── reports/                          # 검증/리뷰 산출물
│   │   ├── code-review/
│   │   ├── design-review/
│   │   └── failures/
│   └── tasks/                            # T001~ 단위 작업서
│
├── biome.json                            # Lint & Format
├── drizzle.config.ts                     # Drizzle Kit (migration 생성기)
├── package.json
├── react-router.config.ts                # RR7 config (ssr: true)
├── tsconfig.cloudflare.json              # workers + app + .react-router/types
├── tsconfig.json                         # solution file (references)
├── tsconfig.node.json                    # vite.config / vitest.config
├── velite.config.ts                      # velite collections + complete() hook → search-index
├── vite.config.ts                        # Vite + Cloudflare plugin + Tailwind v4
├── vitest.config.ts                      # jsdom env + coverage thresholds
├── vitest.setup.ts                       # @testing-library/jest-dom matchers
└── wrangler.toml                         # Workers 배포 + bindings (ASSETS / RATE_LIMIT_KV / POST_BODY_CACHE_KV / DB)
```

### CA Layer 매핑 (Layer Map)

| Layer | 경로 | 역할 | 포함 항목 |
| --- | --- | --- | --- |
| Domain | `app/domain/` | 비즈니스 엔티티 / 값객체 / Zod 스키마 / 도메인 오류 정의 — 외부 의존 0 (zod 만 허용, React/velite/Resend/D1 등 import 금지) | Project · Post · AppLegalDoc 엔티티, ContactSubmission · ThemePreference VO, frontmatter 검증 스키마(velite 와 공유), 도메인 오류 클래스, `_shared/zod-helpers.ts` |
| Application | `app/application/` | 유스케이스(Service) 오케스트레이션 + 외부 시스템 인터페이스(Port) 정의 — Domain 만 import 허용, Infrastructure import 금지 | content(list/get/featured/recent) · contact(submit-form) · feed(rss) · og(render) · search(build-index + token-search lib) · seo(sitemap + launch-gate) — 각 도메인의 `*.service.ts` / `*.port.ts` / 도메인 보조 lib · templates |
| Infrastructure | `app/infrastructure/` | Application Port 의 구체 구현 — DI Composition Root + 외부 시스템 어댑터. Presentation import 금지, Application/Domain 만 import | config(수제 DI container) · content(velite repos + markdown-compiler + mappers) · db(D1 + Drizzle schema/repos/mappers) · cache(KV body) · email(Resend) · captcha(Turnstile) · og(Satori + ASSETS binding) · ratelimit(KV) · analytics(CF Web Analytics) · search(빌드 산출물 위치) |
| Presentation | `app/presentation/`, `app/root.tsx`, `app/routes.ts`, `app/entry.server.tsx`, `app/app.css` | UI / 훅 / Provider / Layout / Routes — Application 유스케이스만 import (Infrastructure 직접 import 금지, loader/action 에서 `context.container` 로 주입받음) | components(about/chrome/contact/content/home/legal/palette/post/project) · hooks(useTheme/useKbdHint/useCommandPalette) · layouts(Chrome / ChromeFree) · lib(format/jsonld/meta/print/recent-visits/png-response 등) · providers(ThemeProvider) · routes(평면 도트 + resource routes) |

### Path Aliases

| Alias | 해석 |
| --- | --- |
| `~/*` | `./app/*` |
| `~/domain/*` | `./app/domain/*` |
| `~/application/*` | `./app/application/*` |
| `~/infrastructure/*` | `./app/infrastructure/*` |
| `~/presentation/*` | `./app/presentation/*` |
| `#content` | `./.velite` |
| `#content/*` | `./.velite/*` |

### Framework Conventions

#### Route 파일 네이밍 — 평면 도트 컨벤션 (서브폴더 금지)

`@react-router/fs-routes` 의 `flatRoutes` 는 **평면 도트 컨벤션**만 라우트로 인식한다 — `projects.$slug.tsx` → `/projects/:slug`. 서브폴더(`projects/$slug.tsx`) 형태는 typegen 에서 누락되어 라우팅이 동작하지 않으므로 사용하지 않는다.

폴더 그룹화가 필요하면 RR7 공식 컨벤션인 폴더 내 `route.tsx` 형태(`projects.$slug/route.tsx`)를 사용해야 하나, 본 프로젝트는 시각 노이즈 최소화를 위해 평면 도트 파일 형태를 표준으로 한다.

리소스 라우트는 확장자 escape 표기 — `rss[.xml].tsx` → `/rss.xml`, `sitemap[.xml].tsx` → `/sitemap.xml`, `robots[.txt].tsx` → `/robots.txt`, `og.projects.$slug[.png].tsx` → `/og/projects/:slug.png`. 컴포넌트 export 없이 `loader` 만 정의해 Response 를 직접 반환.

참고: [React Router File Route Conventions](https://reactrouter.com/how-to/file-route-conventions).

#### *.client.ts(x) / *.server.ts(x) 파일 split (Critical)

RR7 Framework 모드는 파일명 suffix 로 번들 분리를 처리한다:

- `*.client.ts` / `*.client.tsx` → **클라이언트 전용** (SSR 번들에서 제외)
- `*.server.ts` / `*.server.tsx` → **서버 전용** (클라이언트 번들에서 제외)

네이밍 실수 사례 — 서버 유틸을 `notion.client.ts` 로 잘못 이름 지으면 SSR 번들에서 `void 0` 으로 치환되어 `X is not a function` 런타임 오류 발생. 하이픈 또는 다른 suffix 사용: `notion-client.ts`, `notion.service.ts`.

본 프로젝트는 현 시점 disk 상에 `*.client.ts(x)` / `*.server.ts(x)` 파일이 존재하지 않으며, SSR/CSR 경계는 `workers/app.ts` (서버) ↔ React 컴포넌트(양쪽) 구조로 단순화 — 향후 IO 가 강결합된 모듈을 분리할 때 본 규칙을 적용한다.

#### app/ root 파일 역할표

| File | Role | 수정 트리거 |
| --- | --- | --- |
| `root.tsx` | RR7 루트 컴포넌트 — `[data-theme]` 부착, `ThemeProvider` / `CommandPalette` mount, CF Web Analytics 스니펫, launch 조건부 `noindex` meta | 글로벌 Provider / 전역 컴포넌트 / meta 추가 |
| `routes.ts` | `flatRoutes({ rootDirectory: "presentation/routes" })` — file convention 자동 추론 | 라우트 디렉토리 변경 시 |
| `entry.server.tsx` | SSR 엔트리 — `isbot` 분기 + `renderToReadableStream` (Workers 친화) | SSR 커스터마이징 시 |
| `app.css` | Tailwind v4 진입점 — `@theme { --color-*, --font-* }` + `@variant dark` 커스텀 변형 | 디자인 토큰 변경 |
| `env.d.ts` | 클라이언트 환경변수 타입 (`import.meta.env`) | 클라이언트 환경변수 추가 |
| `README.md` | layer 의존 규칙 / path alias / 테스트 colocation 요약 (개발자 onboarding) | layer 의존 규칙 변경 |

참고: 본 프로젝트는 `entry.client.tsx` 를 두지 않는다 — RR7 v7 기본 hydration 으로 충분.

#### tsconfig 분할 — solution + cloudflare + node

TS Project References 로 3분할:

- `tsconfig.json` — solution file. `files: []`, `references: [tsconfig.node.json, tsconfig.cloudflare.json]`. `bun run typecheck` (tsc -b) 진입점.
- `tsconfig.cloudflare.json` — Workers + app/. `include`: `.react-router/types/**`, `app/**`, `workers/**`, `worker-configuration.d.ts`, `vitest.setup.ts`. DOM lib + `paths` alias (`~/*` · `#content/*` 등) 정의.
- `tsconfig.node.json` — 빌드 도구만. `include`: `vite.config.ts`, `vitest.config.ts`, `vitest.setup.ts`. Node lib.

T004 비고 — `vitest.setup.ts` 가 `@testing-library/jest-dom/vitest` matcher 를 등록하므로 `app/**/*.test.tsx` 에서 `toBeInTheDocument` 등이 타입 인식되려면 `tsconfig.cloudflare.json` 의 `include` 에 `vitest.setup.ts` 가 포함돼야 한다.

#### Cloudflare Workers 바인딩 키

`wrangler.toml` 정의 (key 이름과 위치만 — 실제 secret 값은 별도 관리):

| Binding | 종류 | 용도 | 사용 위치 |
| --- | --- | --- | --- |
| `ASSETS` | static assets | `public/` 디렉토리 노출 (폰트 / OG fallback / favicon) — Worker 에서 `env.ASSETS.fetch(...)` 로 ArrayBuffer 획득 | `infrastructure/og/satori-og-renderer.ts` (ttf 로드) |
| `RATE_LIMIT_KV` | KV namespace | Contact form IP rate-limit 카운터 — 키 패턴 `contact:{ip}:{yyyy-mm-dd-hh}` | `infrastructure/ratelimit/kv-rate-limiter.ts` |
| `POST_BODY_CACHE_KV` | KV namespace | 컴파일된 Post body(hast JSON) 캐시 — 키 `post:{slug}:body:v{16-char-hash}`, 자연 invalidation by content-hash | `infrastructure/cache/kv-post-body-cache.ts` |
| `DB` | D1 database | Post 정본 — Drizzle ORM 으로 액세스 | `infrastructure/db/d1-post.repository.ts` |

Secret(`RESEND_API_KEY` / `TURNSTILE_SECRET` 등)은 `wrangler secret put` 으로 주입 — `wrangler.toml` 에 평문 기록 금지.

#### velite + .velite/ 파이프라인 위치

velite 는 **빌드 타임 ETL** 로 동작 — `content/**/*.mdx` 를 파싱 + Zod 검증 + JSON 직렬화하여 `.velite/` 산출.

- 정본 입력: `content/projects/*.mdx` · `content/legal/apps/<app_slug>/{terms,privacy}.mdx`
- 빌드 산출물: `.velite/projects.json` · `.velite/legal.json` (gitignore — 빌드 시 자동 생성)
- 커스텀 transform: `velite/transforms/extract-toc.ts` — `## heading` 추출
- `complete()` 훅 — `app/application/search/services/build-search-index.service.ts` 호출하여 `public/search-index.json` 산출 (Cmd+K Palette lazy fetch 대상)
- Domain 스키마(`app/domain/*/*.schema.ts`) 와 velite collection schema 가 **동일한 Zod 정의를 공유** — 빌드 타임에 콘텐츠 무결성을 보장
- Post 는 정본 분기 — D1(`migrations/*.sql` + `scripts/migrate-posts-to-d1.ts`)이 정본, velite collection 에서 제외

경로 alias `#content` / `#content/*` → `./.velite` / `./.velite/*` 로 노출 — Repository 가 type-safe 하게 import.

#### Launch Gate 모듈 위치

Pre-launch SEO 차단 (#99) 은 3개 위치에 분산 구현:

- **Application helper**: `app/application/seo/launch-gate.ts` — `isLaunched(env)` / `getSiteOrigin(env)` 노출. `SITE_LAUNCHED` env (`wrangler.toml [vars]`) literal 을 string 으로 받아 narrow.
- **Platform 분기**: `workers/app.ts` — `tkstar.dev` 도메인의 비-`https://tkstar.dev` 변형(www / http) 을 `301` 영구 리다이렉트. launch 상태와 무관하게 항상 동작.
- **Presentation 조건부 렌더**: `app/root.tsx` — launch=`false` 동안 모든 페이지에 `<meta name="robots" content="noindex,nofollow">` 추가.
- **Resource route 분기**: `app/presentation/routes/robots[.txt].tsx` → `User-agent: *` + `Disallow: /`, `app/presentation/routes/sitemap[.xml].tsx` → 빈 `<urlset/>`.

Launch 절차 — `wrangler.toml [env.production.vars] SITE_LAUNCHED = "true"` → `bun run typecheck` → `bunx wrangler deploy --env production` → Search Console 색인 요청.

## File Location Summary

| 작업 | 위치 |
| --- | --- |
| 새 페이지 라우트 추가 | `app/presentation/routes/<path>.tsx (평면 도트 컨벤션)` |
| 리소스 라우트(XML/TXT/PNG) 추가 | `app/presentation/routes/<path>[.<ext>].tsx — loader 만 export` |
| UI 컴포넌트 추가 | `app/presentation/components/<domain>/<Component>.tsx` |
| 글로벌 Context Provider 추가 | `app/presentation/providers/<Name>Provider.tsx — app/root.tsx 에서 mount` |
| 비즈니스 로직(유스케이스) 추가 | `app/application/<domain>/services/<verb-noun>.service.ts` |
| 외부 시스템 인터페이스 정의 | `app/application/<domain>/ports/<name>.port.ts` |
| 외부 시스템 구현체 추가 | `app/infrastructure/<bucket>/<name>.ts (Repository 는 *.repository.ts)` |
| Drizzle 스키마 추가 | `app/infrastructure/db/schema/<table>.ts + drizzle-kit generate → migrations/` |
| 도메인 엔티티/VO/스키마 정의 | `app/domain/<domain>/{*.entity.ts, *.vo.ts, *.schema.ts, *.errors.ts}` |
| MDX 콘텐츠 작성 | `content/{projects/, legal/apps/<app_slug>/} — Post 는 D1 (scripts/migrate-posts-to-d1.ts)` |
| Resend 이메일 템플릿 추가 | `app/application/contact/templates/<Name>Email.tsx` |
| Satori OG 템플릿 수정 | `app/infrastructure/og/templates/og-template.tsx` |
| 정적 자산 추가 | `public/ (ASSETS binding 으로 자동 노출)` |
| Workers 환경변수/바인딩 추가 | `wrangler.toml + app/infrastructure/config/container.ts (env 주입 흐름)` |
| 디자인 토큰 변경 | `app/app.css (@theme 블록) — docs/design-system/styles.css 에서 이식` |
| 단위 테스트 작성 | `각 소스 옆 __tests__/ (colocate). 공유 fixture/util 만 test/ 또는 app/__tests__/fixtures/` |
| velite 커스텀 transform 추가 | `velite/transforms/<name>.ts + velite.config.ts schema 에 연결` |
| DB 마이그레이션 스크립트 작성 | `scripts/ + migrations/ (Drizzle Kit 산출물)` |
| task 작업서 작성 | `docs/tasks/T<NNN>-<slug>.md (11개 표준 섹션)` |
| 검증/리뷰 산출물 보관 | `docs/reports/{code-review, design-review, failures}/` |
