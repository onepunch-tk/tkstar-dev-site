# Project Structure Guide

## Overview

**tkstarDev**는 1인 기업(개발자)의 개인 브랜드 웹사이트로, 사이트 자체가 이력서 역할을 하며 B2B(기업/HR) 채용 제안과 B2C(프리랜서 의뢰)를 단일 도메인(`tkstar.dev`)에서 수렴시킨다. **콘텐츠 100% static (DB 없음)**, **한국어 only**, **Cmd+K 검색 중심 네비게이션**을 핵심 패러다임으로 한다.

본 프로젝트는 정적 콘텐츠 사이트임에도 불구하고 **Clean Architecture 4-layer 분리**를 엄격히 적용한다. 이는 (1) Resend / Turnstile / Satori / velite 등 다수의 Infrastructure 외부 의존성을 격리하고, (2) Contact Form / Command Palette 검색 / OG 이미지 생성 등 비자명한 Application 유스케이스를 테스트 가능하게 만들기 위함이다.

**Architecture Pattern**: Clean Architecture (4-layer separation)
**Framework**: React Router 7.14 Framework mode (SSR)
**Runtime**: Cloudflare Workers (`wrangler 4.85.0`, `@cloudflare/vite-plugin 1.33.2`)
**Key Characteristics**:
- Platform-agnostic core (`app/`)는 Cloudflare Workers SSR에 1차 타깃, Express/Fastify 어댑터 추가 가능
- 의존성 흐름은 단방향: **Presentation → Application → Domain**
- **Infrastructure는 Application의 Port를 구현**하는 형태로 DI 컨테이너에서 조립됨
- 콘텐츠는 **velite + MDX**로 빌드 타임에 정적 컬렉션으로 변환되어 Infrastructure read-side adapter 역할

---

## Doc Status Convention (Current vs Target)

본 문서는 **MVP 완료 청사진**을 함께 기록한다. 각 트리 블록의 의미는 다음과 같다:

- **현재 상태(Current reality)**: "Top-Level Directory Structure" 트리는 **현재 disk에 실재하는 디렉토리/파일**만 반영. doc-structure-linter는 이 트리를 NEW 검사 기준으로 사용한다.
- **목표 상태(Target structure)**: 각 CA layer 절(`app/domain/`, `app/application/` ...) 및 `app/presentation/routes/`, `content/` 절의 트리 블록은 코드 펜스 직전에 **"Target structure"** 라벨을 붙여 forward-looking blueprint임을 명시한다. linter는 라벨이 붙은 블록을 GHOST 검사에서 제외하므로, 후속 task로 채워질 파일들은 미리 적어두어도 drift로 잡히지 않는다.
- **새 task 추가 시**: 목표 트리에 항목이 추가되면 후속 task가 해당 파일을 생성한다. task 진행 상황은 `docs/ROADMAP.md` + `docs/tasks/`가 트래킹한다.
- **MVP 단계에서 아직 디렉토리 자체가 생성되지 않은 영역(`content/`, `.velite/` 등)**은 현재 트리에서 의도적으로 빠져 있고 각 절의 Target structure에서만 등장한다 — disk 미존재 상태가 GHOST로 잡히지 않게 하기 위함.

---

## Top-Level Directory Structure

> 본 트리는 **현재 disk 실재 상태**(Current reality)이다. 후속 task가 추가하는 파일/디렉토리는 각 layer 절의 "Target structure" 트리 참고.

```
tkstar-dev/
├── app/                              # 핵심 애플리케이션 (Clean Architecture 4-layer)
│   ├── domain/                       # 비즈니스 엔티티 + 스키마 + 에러 (Target tree 참조)
│   ├── application/                  # 유스케이스 + Port 정의 (Target tree 참조)
│   ├── infrastructure/               # 외부 시스템 어댑터 + DI (Target tree 참조)
│   ├── presentation/                 # UI 컴포넌트 + 훅 + 라이브러리 + 라우트 모듈
│   │   ├── components/               # UI 컴포넌트 (Target tree 참조)
│   │   ├── hooks/                    # React 훅 (useTheme, useKbdHint 등)
│   │   ├── layouts/                  # ChromeLayout / ChromeFreeLayout
│   │   ├── lib/                      # Presentation 유틸 (chrome-links 등)
│   │   ├── providers/                # React Context Provider (ThemeProvider) — T005 산출물
│   │   └── routes/                   # React Router v7 라우트 모듈 (Target tree 참조)
│   ├── __tests__/                    # 환경 sanity 테스트 (jsdom 동작 확인)
│   ├── README.md                     # 레이어 간 의존 규칙 요약
│   ├── root.tsx                      # 루트 컴포넌트 (ThemeProvider, CommandPalette mount)
│   ├── routes.ts                     # flatRoutes({ rootDirectory: "presentation/routes" })
│   ├── entry.server.tsx              # SSR 엔트리
│   ├── entry.client.tsx              # 하이드레이션 엔트리
│   ├── app.css                       # Tailwind v4 진입점 + @theme 토큰
│   └── env.d.ts                      # 클라이언트 환경변수 타입
│
├── workers/                          # Cloudflare Workers SSR 엔트리
│   └── app.ts                        # fetch handler → React Router request handler
│
├── public/                           # 정적 자산 (빌드 없이 서빙)
│   ├── fonts/                        # JetBrainsMono *.woff2 self-host
│   │   ├── JetBrainsMono-Regular.woff2
│   │   ├── JetBrainsMono-Medium.woff2
│   │   ├── JetBrainsMono-Bold.woff2
│   │   └── OFL.txt                   # SIL Open Font License
│   └── favicon.ico
│
├── docs/                             # 문서
│   ├── .gitkeep                      # docs/ 디렉토리 placeholder
│   ├── PRD.md                        # 제품 요구사항 정본
│   ├── ROADMAP.md                    # 구현 단계 정의
│   ├── PROJECT-STRUCTURE.md          # (본 문서)
│   ├── tasks/                        # T001~T022 단위 작업서 (PR-ready)
│   ├── reports/                      # 검증/리뷰 산출물 (prd-validation, code-review 등 — 하위 구조는 docs/ 절 참조)
│   └── design-system/                # 디자인 정본 (production 번들 제외)
│       ├── prototype.html            # React 18 + babel-standalone 데모
│       ├── prototype.css             # 데모 스타일
│       ├── styles.css                # 디자인 토큰 (oklch, color-mix)
│       ├── terminal.css              # 터미널 chrome 스타일
│       ├── design-canvas.jsx         # Figma-ish 디자인 캔버스 래퍼
│       ├── tweaks-panel.jsx          # Tweaks 패널 정본
│       ├── components/               # 컴포넌트 와이어프레임 정본 (.jsx)
│       └── proto/                    # 페이지 와이어프레임 정본 (.jsx)
│           ├── data.jsx
│           ├── shell.jsx
│           ├── pages-1.jsx
│           ├── pages-2.jsx
│           └── legal.jsx
│
├── test/                             # 레이어 간 공유 테스트 유틸
│   ├── fixtures/                     # 공용 픽스처 (mock projects/posts)
│   └── utils/                        # 테스트 헬퍼 (renderWithRouter 등)
│
├── .claude/                          # AI agent / harness 설정
├── velite.config.ts                  # velite 컬렉션 + Zod frontmatter 스키마 (T007에서 추가 예정)
├── react-router.config.ts            # React Router v7 설정 (ssr: true 등)
├── vite.config.ts                    # Vite + @cloudflare/vite-plugin + @tailwindcss/vite
├── wrangler.toml                     # Cloudflare Workers 배포 설정
├── biome.json                        # Lint & Format
├── vitest.config.ts                  # 테스트 설정 (jsdom env)
├── tsconfig.json / tsconfig.app.json # TS 설정 + path alias
├── package.json
└── bun.lock
```

> `content/`, `.velite/` 디렉토리는 T007(velite 콘텐츠 파이프라인)에서 처음 생성되며, 그 시점까지는 disk에 존재하지 않는다. 구조는 아래 [`content/ and .velite/`](#content-and-velite-content-source--build-output) 절의 Target structure 트리를 참조한다.

**Key directories**:
- `app/` — 핵심 애플리케이션 (4-layer CA)
- `app/presentation/routes/` — React Router v7 라우트 모듈 (Presentation 레이어 내부에 위치, `flatRoutes({ rootDirectory: "presentation/routes" })`로 file convention 자동 추론)
- `app/presentation/providers/` — React Context Provider (Theme 등 글로벌 상태). `app/root.tsx`에서 mount.
- `workers/` — Cloudflare Workers SSR 엔트리 (Platform Adapter)
- `content/` — velite MDX 소스 (콘텐츠 정본 — T007에서 처음 생성, 현재 disk 미존재)
- `.velite/` — velite 빌드 산출물 (T007 이후 빌드 시 자동 생성, gitignore)
- `public/fonts/` — JetBrains Mono self-host (Edge SSR + FOIT 방지)
- `public/wasm/` — yoga.wasm (Satori standalone build용 — T018 산출물)
- `public/search-index.json` — 빌드 타임 검색 인덱스 산출물 (F016 — T016 산출물)
- `docs/tasks/` — T001~T022 단위 작업서 (PR-ready, ROADMAP 진행 상황 추적)
- `docs/reports/` — 검증/리뷰 산출물 (prd-validation, roadmap-validation, code-review, design-review, failures)
- `docs/design-system/` — 디자인 정본 (production 번들 **제외**, 디자인 서브에이전트 참고용)
- `test/` — 레이어 간 공유 테스트 유틸 (단위 테스트는 각 레이어 `__tests__/`에 colocate)

---

## app/ Directory (Core Application)

Clean Architecture 4-layer 구조를 따른다. 안쪽 레이어(Domain)는 어떤 외부 의존성도 가지지 않으며, 바깥 레이어(Presentation)는 안쪽 레이어만 import 한다.

### app/domain/

**Role**: 비즈니스 엔티티 정의 — 외부 의존성 없음 (React, velite, Resend 등 어떤 라이브러리도 import 금지)

**CA Layer**: Domain (innermost)

**Contains**:
- **Entity** (`*.entity.ts`) — 콘텐츠 도메인 모델 (Project, Post, AppLegalDoc)
- **Value Object** (`*.vo.ts`) — 불변 값 객체 (ContactSubmission, ThemePreference)
- **Types** — 도메인 관련 TypeScript 타입 (Slug, InquiryType, Tag 등)
- **Schemas** (`*.schema.ts`) — Zod 검증 스키마 (frontmatter 검증 규칙은 여기서 정의 → velite/Application 양쪽이 재사용)
- **Errors** — 도메인 전용 에러 클래스 (`ProjectNotFoundError`, `InvalidContactSubmissionError`)

**Dependency Rule**: **No imports from outer layers**. `zod`만 허용 (스키마 정의 도구이며 런타임 의존성 없음).

**Target structure** (T006~ 산출물 — 현재는 layer skeleton만 존재):
```
app/domain/
├── project/
│   ├── project.entity.ts             # Entity (slug, title, summary, date, tags, stack, metrics, featured, cover, body)
│   ├── project.schema.ts             # Zod frontmatter 스키마
│   ├── project.errors.ts
│   └── __tests__/
│       └── project.schema.test.ts
├── post/
│   ├── post.entity.ts                # Entity (slug, title, lede, date, tags, read, body)
│   ├── post.schema.ts
│   └── __tests__/
├── legal/
│   ├── app-legal-doc.entity.ts       # Entity (app_slug, doc_type, version, effective_date, body)
│   └── app-legal-doc.schema.ts
├── contact/
│   ├── contact-submission.vo.ts      # Value Object (name, company?, email, inquiry_type, message)
│   ├── contact-submission.schema.ts  # 이름·이메일 정규식·메시지 10자
│   └── contact.errors.ts
└── theme/
    └── theme-preference.vo.ts        # "dark" | "light"
```

---

### app/application/

**Role**: 유스케이스 (비즈니스 로직 오케스트레이션) + 외부 시스템 인터페이스 정의

**CA Layer**: Application

**Contains**:
- **Service** (`*.service.ts`) — 유스케이스 / 비즈니스 로직 서비스 구현 (Domain 엔티티 사용 + Port 호출)
- **Port** (`*.port.ts`) — 외부 시스템 인터페이스 (Infrastructure가 구현)
- **Mapper** (`*.mapper.ts`) — Entity ↔ DTO 변환 (필요 시)

**Port와 Service 관계**:
- `*.port.ts` — 인터페이스 정의 ("무엇을 할 수 있는가")
- `*.service.ts` — 유스케이스 / 비즈니스 로직 구현 ("어떻게 하는가") — file-conventions.md에 따라 유스케이스도 `*.service.ts`로 통일

**Dependency Rule**: Domain만 import 허용. Infrastructure는 import 금지 (Port만 정의하고 구현체는 DI로 주입받음).

**Target structure** (T008~T020에 걸쳐 점진적으로 채워짐):
```
app/application/
├── content/
│   ├── ports/
│   │   ├── project-repository.port.ts  # findAll, findBySlug, findFeatured, findRelated(prev/next)
│   │   ├── post-repository.port.ts     # findAll, findBySlug, findRecent(n)
│   │   └── legal-repository.port.ts    # findAppDoc(app_slug, doc_type), listApps
│   └── services/
│       ├── list-projects.service.ts
│       ├── get-project-detail.service.ts    # prev/next 포함
│       ├── get-featured-project.service.ts  # Home Featured (F017)
│       ├── list-posts.service.ts
│       ├── get-post-detail.service.ts
│       ├── get-recent-posts.service.ts      # Home Recent 3개 (F017)
│       └── __tests__/
├── contact/
│   ├── ports/
│   │   ├── email-sender.port.ts        # send(to, template, data)
│   │   └── captcha-verifier.port.ts    # verify(token) → boolean
│   └── services/
│       ├── submit-contact-form.service.ts # F008 + F009
│       └── __tests__/
├── search/
│   └── services/
│       └── build-search-index.service.ts  # F016 — routes/projects/posts 토큰 인덱스
├── og/
│   ├── ports/
│   │   └── og-image-renderer.port.ts   # render(template, data) → PNG bytes
│   └── services/
│       ├── render-project-og.service.ts # F011
│       └── render-post-og.service.ts
├── feed/
│   └── services/
│       └── build-rss-feed.service.ts    # F012
└── seo/
    └── services/
        └── build-sitemap.service.ts     # F018
```

---

### app/infrastructure/

**Role**: 외부 시스템 통합 (Application의 Port 구현체)

**CA Layer**: Infrastructure

**Contains**:
- **config/** — DI 컨테이너 (Composition Root) — Workers 부팅 시 모든 의존성 조립. **수제 Plain object/Map 방식** (의존성 그래프 작아 라이브러리 도입 미사용)
- **content/** — velite read-side 어댑터 (`.velite/` 산출물을 Domain 엔티티로 매핑) — `*.repository.ts` 구현체
- **email/** — Resend + React Email 통합
- **captcha/** — Cloudflare Turnstile 서버 검증
- **og/** — Satori standalone + Workers Asset Binding으로 폰트/yoga.wasm 로드
- **analytics/** — Cloudflare Web Analytics 스니펫 주입 헬퍼
- **search/** — 빌드 타임 검색 인덱스 빌더 산출 위치 (F016 산출물은 Application 서비스가 생성, `public/search-index.json` 출력)

**Dependency Rule**: Application의 Port를 구현하기 위해 Application/Domain을 import. Presentation은 import 금지.

**Target structure** (T009~ 산출물):
```
app/infrastructure/
├── config/
│   ├── container.ts                  # 수제 DI: type Container = {...}; buildContainer(env): Container
│   └── __tests__/
├── content/
│   ├── velite-project.repository.ts  # implements project-repository.port — `.velite/projects` 매핑
│   ├── velite-post.repository.ts
│   ├── velite-legal.repository.ts
│   ├── mappers/                      # velite raw output → Domain Entity (`*.mapper.ts`)
│   └── __tests__/
├── email/
│   ├── resend-email-sender.ts        # implements email-sender.port (env.RESEND_API_KEY)
│   ├── templates/                    # React Email 템플릿 (자동응답 메일)
│   └── __tests__/
├── captcha/
│   ├── turnstile-verifier.ts         # implements captcha-verifier.port (env.TURNSTILE_SECRET)
│   └── __tests__/
├── og/
│   ├── satori-og-renderer.ts         # implements og-image-renderer.port — env.ASSETS.fetch()로 ttf/yoga.wasm 로드
│   └── __tests__/
├── search/
│   └── __tests__/                    # build-search-index.service.ts (Application)에서 호출되는 빌드 산출물 검증
└── analytics/
    └── cloudflare-web-analytics.ts
```

**velite Content Pipeline 노트**: velite는 빌드 타임에 `content/**/*.mdx`를 파싱하여 Zod 검증을 거친 JSON으로 `.velite/` 디렉토리에 출력한다. Infrastructure 레이어의 `velite-project.repository.ts` 등은 이 정적 산출물을 import하여 Domain 엔티티로 매핑하는 read-side 어댑터로 동작한다. 즉 velite는 "DB 없이도 Repository 패턴을 유지"하기 위한 빌드 타임 ETL이며, **DB가 없다는 점이 CA를 약화시키지 않는다**.

**Search Index 빌드 노트 (F016)**: velite afterBuild 훅 또는 별도 빌드 스크립트(`build-search-index.service.ts`)에서 `.velite/projects.json` + `posts.json`의 `{slug, title, summary, tags}`만 추출하여 `public/search-index.json`으로 출력한다. 본문(body)은 제외하여 인덱스 크기를 최소화하고, 클라이언트는 lazy fetch + CDN 캐싱으로 로드한다. 정적 라우트 목록(`/about`, `/projects`, ... )은 빌드 타임에 하드코딩 머지.

---

### app/presentation/

**Role**: UI, 훅, Presentation 전용 라이브러리 (라우트는 별도 `app/routes/` 또는 `app/presentation/routes/`)

**CA Layer**: Presentation (outermost)

**Contains**:
- **components/** — UI 컴포넌트 (Topbar, Footer, CommandPalette, ProjectRow, PostRow, CodeBlock, OnThisPageToc, ContactForm, ThemeToggle 등) — React 컴포넌트는 PascalCase 파일명을 유지 (file-conventions.md는 PascalCase 컴포넌트를 별도로 제한하지 않음)
- **hooks/** — 커스텀 React 훅 (`useTheme`, `useKbdHint`, `useCommandPalette`, `useTurnstile`)
- **lib/** — Presentation 유틸 (`format`, `print` 트리거, `chrome-links` 상수)
- **layouts/** — chrome / chrome-free (Topbar/Footer 노출 vs `.legal` 컨테이너) 레이아웃
- **providers/** — React Context Provider (`ThemeProvider` 등 — `app/root.tsx`에서 mount)

**Dependency Rule**: Application 유스케이스만 import 허용. Infrastructure 직접 import 금지 (loader/action에서 DI 컨테이너로 유스케이스를 받아 호출).

**Target structure** (현재 일부 파일만 존재, 나머지는 후속 task로 채워짐):
```
app/presentation/
├── components/
│   ├── chrome/
│   │   ├── Topbar.tsx                # 브랜드 / 경로 / 검색트리거 / 테마토글
│   │   ├── Footer.tsx                # GitHub / X / RSS / Contact / Legal Index
│   │   ├── ThemeToggle.tsx           # F010 — [data-theme] 속성 셀렉터 전략
│   │   └── __tests__/                # ThemeToggle.test.tsx 등 colocated 테스트
│   ├── palette/
│   │   └── CommandPalette.tsx        # F016 — Cmd+K / Ctrl+K / `/`
│   ├── project/
│   │   ├── ProjectRow.tsx            # ls-style 행 (slug/ + title + date / summary / stack pills)
│   │   ├── ProjectMetaSidebar.tsx    # year / role / stack pills
│   │   └── OnThisPageToc.tsx
│   ├── post/
│   │   ├── PostRow.tsx
│   │   └── ShareTools.tsx            # copy link / X 공유
│   ├── content/
│   │   ├── MdxRenderer.tsx           # velite body → React (shiki 코드블록)
│   │   └── CodeBlock.tsx
│   ├── contact/
│   │   ├── ContactForm.tsx           # F008
│   │   └── TurnstileWidget.tsx       # F009
│   └── notfound/
│       └── TerminalNotFound.tsx      # `cd: no such route: <path>`
├── hooks/
│   ├── useTheme.ts                   # ThemeContext consumer (Provider는 providers/ThemeProvider)
│   ├── useKbdHint.ts                 # 플랫폼별 ⌘K / Ctrl+K hint 문자열 (T005)
│   ├── useCommandPalette.ts          # 단축키 + 토큰 검색
│   ├── useTurnstile.ts
│   └── __tests__/                    # useTheme.test.ts 등 colocated 테스트
├── lib/
│   ├── format.ts                     # date YYYY-MM 등
│   ├── print.ts                      # F003 — window.print()
│   └── chrome-links.ts               # TOPBAR_LINKS / FOOTER_LINKS 상수 (T005)
├── providers/
│   └── ThemeProvider.tsx             # localStorage `proto-theme` + system 추종 (T005)
└── layouts/
    ├── ChromeLayout.tsx              # Topbar + Footer slot (대부분의 페이지)
    ├── ChromeFreeLayout.tsx          # `.legal-container` (App Terms/Privacy)
    └── __tests__/
        ├── ChromeLayout.test.tsx
        └── ChromeFreeLayout.test.tsx
```

**T005 디자인 토큰 + 다크모드 구현 노트**:
- `ThemeProvider`(providers/)가 `localStorage["proto-theme"]` 우선, 미설정 시 `prefers-color-scheme` 미디어 쿼리 추종. SSR 시 `theme="dark"` 기본값.
- `useTheme` 훅(hooks/)은 ThemeContext를 consume하는 thin wrapper — Provider는 `app/root.tsx`에서 한 번만 mount.
- `useKbdHint`는 `navigator.userAgent`로 mac/non-mac 판별하여 `⌘K` / `Ctrl+K` 라벨을 반환. SSR 단계에서는 mac으로 가정하여 hydration 폭 변동을 최소화.
- `chrome-links.ts`는 Topbar / Footer 네비게이션 링크 상수를 한 곳에 모아 컴포넌트에서 import.

---

### app/presentation/routes/ (React Router v7 Routes — Presentation 내부)

**Role**: 페이지 / 리소스 라우트 진입점. loader / action에서 DI 컨테이너로부터 유스케이스를 받아 호출하고 Presentation 컴포넌트에 데이터를 전달.

**CA Layer**: Presentation 내부 (CA 가시성 확보를 위해 `app/routes/` 대신 `app/presentation/routes/`에 배치)

**Dependency Rule**: Application 유스케이스 + Presentation 컴포넌트만 import. Domain 엔티티 타입은 사용 가능하나 Infrastructure 직접 import 금지.

**typegen 정합성**: `app/routes.ts`에서 `flatRoutes({ rootDirectory: "presentation/routes" })`로 등록. 라우트 모듈 파일이 `appDirectory`(=`app/`) 내부에 있으므로 `.react-router/types/` 자동 생성이 정상 동작 ([React Router Type Safety](https://reactrouter.com/explanation/type-safety)). 모듈을 `app/` 외부로 옮기면 typegen이 깨지므로 금지.

```ts
// app/routes.ts
import { flatRoutes } from "@react-router/fs-routes";
import type { RouteConfig } from "@react-router/dev/routes";
export default flatRoutes({ rootDirectory: "presentation/routes" }) satisfies RouteConfig;
```

**Route file conventions (React Router v7 file-based, rootDirectory=presentation/routes)**:

> **명명 컨벤션**: `@react-router/fs-routes`의 `flatRoutes`는 **평면 도트 컨벤션만** 라우트로 인식한다 (`projects.$slug.tsx` → `/projects/:slug`). 서브폴더(`projects/$slug.tsx`)는 typegen에서 누락되어 라우팅이 동작하지 않으므로 사용하지 않는다 — T004(2026-04-28) 검증으로 확인. 폴더 그룹화가 필요하면 RR7 공식 컨벤션인 폴더 안의 `route.tsx` 형태(`projects.$slug/route.tsx`)를 사용해야 하나, 본 프로젝트는 시각적 노이즈 최소화를 위해 평면 도트 파일 형태를 표준으로 한다. ([React Router File Route Conventions](https://reactrouter.com/how-to/file-route-conventions))

**Target structure** (T004 라우트 스켈레톤 — 17개 라우트 모듈은 이미 disk에 존재, loader/action은 후속 task에서 채워짐):
```
app/presentation/routes/
├── _index.tsx                        # Home (`/`) — Hero whoami + Featured + Recent Posts
├── about.tsx                         # `/about` — 이력서 + PDF 인쇄 듀얼 레이아웃
├── contact.tsx                       # `/contact` — Form + Resend + Turnstile
├── projects._index.tsx               # `/projects` — ls-style 행 리스트 + 태그 필터
├── projects.$slug.tsx                # `/projects/:slug` — Case Study + sticky sidebar
├── blog._index.tsx                   # `/blog` — 발행일 역순 + 태그 필터
├── blog.$slug.tsx                    # `/blog/:slug` — sticky sidebar (TOC + share)
├── legal._index.tsx                  # `/legal` — 출시 앱 목록 (chrome 노출)
├── legal.$app.terms.tsx              # `/legal/:app/terms` — chrome-free
├── legal.$app.privacy.tsx            # `/legal/:app/privacy` — chrome-free
├── og.projects.$slug[.png].tsx       # `/og/projects/:slug.png` — Satori PNG resource route
├── og.blog.$slug[.png].tsx           # `/og/blog/:slug.png` — Satori PNG resource route
├── rss[.xml].tsx                     # `/rss.xml` — RSS 2.0 XML resource route
├── sitemap[.xml].tsx                 # `/sitemap.xml` — F018 sitemap resource route
├── robots[.txt].tsx                  # `/robots.txt` — F018 robots resource route
└── $.tsx                             # splat — Not Found Fallback (터미널 메타포)
```

**Migration rule (라우트 추가 시)**:
1. 새 라우트는 평면 도트 컨벤션으로 추가 (`projects.tags.$tag.tsx` 등). 서브폴더는 사용하지 않는다.
2. 동일 prefix를 공유하는 라우트가 충분히 많아져 평면 파일이 시각적 노이즈가 되면 RR7 공식 폴더-그룹 컨벤션(`route.tsx` 컨벤션)으로 마이그레이션을 검토한다.

**loader / action 패턴**:
- `loader({ context })`에서 `context.container.get('listProjects')` 등으로 유스케이스를 꺼내 실행
- `action({ context, request })`에서 `context.container.get('submitContactForm')` 호출 (Contact)
- 리소스 라우트(`rss[.xml]`, `og/*[.png]`)는 컴포넌트 export 없이 `loader`만 export하여 Response를 직접 반환

---

### app/ Root Files

| File | Role | When to modify |
|------|------|----------------|
| `root.tsx` | React Router 루트 컴포넌트, `[data-theme]` 부착, `<ThemeProvider>` / `<CommandPalette/>` 마운트, Cloudflare Web Analytics 스니펫 | 글로벌 Provider / 전역 컴포넌트 추가 시 |
| `routes.ts` | `flatRoutes({ rootDirectory: "presentation/routes" })` — file convention 자동 추론 | 라우트 디렉토리 변경 시 |
| `entry.server.tsx` | SSR 엔트리. `isbot`로 봇 분기, `renderToReadableStream` 사용 (Workers 친화) | SSR 커스터마이징 시 |
| `entry.client.tsx` | 하이드레이션 엔트리 | 거의 수정 없음 |
| `app.css` | Tailwind v4 진입점. `@theme { --color-*, --font-* }` 토큰 + `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))` 커스텀 변형 | 디자인 토큰 추가/변경 시 |
| `env.d.ts` | 클라이언트 환경변수 타입 (`import.meta.env`) | 클라이언트 환경변수 추가 시 |
| `README.md` | layer 의존 규칙 / path alias / 테스트 colocation 요약 (개발자용 onboarding) | layer 의존 규칙 변경 시 |
| `__tests__/sanity.test.ts` | jsdom + vitest 동작 sanity 검증 (T003 산출물) | 거의 수정 없음 |

---

## workers/ Directory (Cloudflare Workers Entry)

**Role**: Cloudflare Workers 런타임 엔트리포인트. `fetch(request, env, ctx)` 핸들러에서 (1) DI 컨테이너를 환경변수(`env.RESEND_API_KEY`, `env.TURNSTILE_SECRET` 등)로 조립, (2) React Router v7 request handler를 생성, (3) `context`에 컨테이너를 주입하여 호출.

**CA Layer**: Platform Adapter (Composition Root의 호출 지점)

**Structure**:
```
workers/
└── app.ts                            # default export { fetch }
```

**의존성 흐름**:
```
workers/app.ts
  └─ Infrastructure/config/container.ts (수제 DI 조립)
      └─ buildContainer(env) → { listProjects, submitContactForm, ... }
      └─ Infrastructure/* (Resend, Turnstile, Velite Repos, Satori) 인스턴스화
          └─ satori-og-renderer는 env.ASSETS Fetcher 주입받아 ttf/yoga.wasm 로드
  └─ React Router request handler 생성
      └─ getLoadContext: () => ({ container })
  └─ Presentation routes의 loader/action이 context.container 사용
```

**환경변수 / 바인딩** (`wrangler.toml`):
- `RESEND_API_KEY` (secret) — Resend 발신
- `TURNSTILE_SECRET` (secret) — Cloudflare Turnstile 서버 검증
- `CONTACT_TO_EMAIL` (var) — 본인 수신 메일
- `GOOGLE_SITE_VERIFICATION` (var, optional) — F019 Google Search Console 인증
- `NAVER_SITE_VERIFICATION` (var, optional) — F019 Naver Search Advisor 인증
- `ASSETS` (assets binding, `directory = "./public"`) — F011 Satori 폰트/yoga.wasm 로드용 ([Cloudflare Static Assets Binding](https://developers.cloudflare.com/workers/static-assets/binding/))

```toml
# wrangler.toml 발췌
name = "tkstar-dev"
main = "workers/app.ts"
compatibility_date = "2026-04-01"

[assets]
binding = "ASSETS"
directory = "./public"

[vars]
CONTACT_TO_EMAIL = "..."
```

---

## content/ and .velite/ (Content Source + Build Output)

**Role**: 콘텐츠 정본(`content/`)과 velite 빌드 산출물(`.velite/`).

**CA Layer 매핑**: **Infrastructure read-side adapter의 입력 / 출력**
- `content/` → 빌드 타임 입력 (개발자가 작성하는 MDX 정본)
- `.velite/` → 런타임 입력 (Domain 엔티티로 매핑되어 Repository가 반환)

**현재 상태 노트**: 본 디렉토리들은 **T007(velite 콘텐츠 파이프라인)** 단계에서 처음 생성된다. 그 이전까지는 disk에 존재하지 않으며, 위의 Top-Level Directory Structure에서도 의도적으로 빠져 있다.

**Architectural Rationale**: DB가 없는 정적 사이트에서도 **Repository 패턴을 깨뜨리지 않기 위해** velite를 빌드 타임 ETL로 사용한다. velite의 Zod frontmatter 검증은 Domain 스키마와 동일한 정의를 공유(`app/domain/*/*.schema.ts`)하여 컴파일 타임에 콘텐츠 무결성을 보장한다.

**Target structure** (T007~ 산출물):
```
content/
├── projects/
│   ├── proto-toolkit.mdx             # frontmatter + body
│   └── ...
├── posts/
│   ├── 2026-04-shipping-solo.mdx
│   └── ...
└── legal/
    └── apps/
        └── moai/
            ├── terms.mdx
            └── privacy.mdx

.velite/                              # gitignore — 빌드 시 자동 생성
├── projects.json
├── posts.json
└── legal.json
```

---

## public/ Directory

**Role**: 빌드 없이 직접 서빙되는 정적 자산.

**CA Layer**: 없음 (Workers의 static asset 바인딩으로 서빙)

**Contains**:
- `fonts/JetBrainsMono-{Regular,Medium,Bold}.woff2` — 본문/UI 웹폰트 self-host (FOIT/FOUT 방지) — T005 산출물
- `fonts/OFL.txt` — JetBrains Mono의 SIL Open Font License 사본
- `fonts/JetBrainsMono-Regular.ttf` — Satori OG 렌더링용 (woff2는 Satori 미지원 → ttf 별도, T018 산출물)
- `wasm/yoga.wasm` — `satori/standalone` 초기화용 ([Satori standalone build for Cloudflare Workers](https://github.com/vercel/satori), T018 산출물)
- `search-index.json` — F016 빌드 타임 검색 인덱스 산출물 (클라이언트 lazy fetch, T016 산출물)
- `favicon.ico` — 브라우저 탭/북마크 아이콘 (RSS / sitemap / robots는 `/rss.xml`, `/sitemap.xml`, `/robots.txt` 동적 resource route로 처리)

**Asset Binding 사용 패턴**: `wrangler.toml`의 `[assets]` 블록(`binding = "ASSETS"`, `directory = "./public"`)으로 노출되며, Worker 코드에서 `env.ASSETS.fetch("https://x.local/fonts/JetBrainsMono-Regular.ttf").then(r => r.arrayBuffer())`로 ArrayBuffer 획득. URL hostname은 무관(pathname만 매칭)이며 외부 RTT가 없는 내부 fetch라 빠름.

---

## docs/ Directory (Documentation + Design Source)

**Role**: 문서 + **디자인 정본 보관소** + **task 진행 트래킹**.

**Contains**:
- `PRD.md`, `ROADMAP.md`, `PROJECT-STRUCTURE.md` (본 문서) — 프로젝트 정본
- `tasks/` — T001~T022 단위 작업서 (PR-ready). `README.md`에 phase별 진행 현황 인덱스, 각 task 파일은 11개 표준 섹션 (Header / Goal / Context / Scope / AC / Implementation Plan / Files / Verification / Dependencies / Risks / References) 포함
- `reports/` — 검증/리뷰 산출물
  - `code-review/` — code-reviewer 서브에이전트 산출물 (`TXXX-code-review.md`)
  - `design-review/` — ux-design-lead 서브에이전트 산출물
  - `failures/` — 실패한 시도 / 회고 기록
  - 루트에는 `prd-validation-YYYY-MM-DD.md`, `roadmap-validation-YYYY-MM-DD.md` 등 1회성 검증 리포트
- `design-system/` — **디자인 정본 (production 번들 제외)**

**design-system/ 처리 규칙 (중요)**:
- `prototype.html` + `prototype.css` + `terminal.css` + `*.jsx` 파일들(`design-canvas`, `tweaks-panel`, `proto/*`, `components/*`)은 **React 18 + babel-standalone IIFE 환경** 가정. `window.X` 글로벌 패턴 사용
- production 빌드에 그대로 import 불가 — **React Router v7 ESM + React 19 컴포넌트로 포팅 필요** (`app/presentation/components/`로 이식)
- 위치상 `app/` 외부이므로 `app/`에서 자연스럽게 import 그래프 외부에 있음 → 추가 차단 도구 불필요
- 디자인 서브에이전트(`ux-design-lead`)가 **참고 정본**으로 사용. 코드 산출물의 import 대상이 아님
- `components/` 서브폴더는 컴포넌트 단위 와이어프레임(`Topbar`, `Footer`, `CommandPalette` 등)을 보관하는 placeholder

---

## test/ Directory (Shared Test Utilities)

**Role**: 레이어 간 공유 테스트 픽스처 / 헬퍼.

**Contains**:
- `fixtures/` — mock projects/posts/legal 데이터, 공용 Zod 픽스처
- `utils/` — `renderWithRouter`, `createMockContainer` 등 헬퍼

**중요**: 단위 테스트 파일은 각 CA 레이어 내부의 `__tests__/` 디렉토리에 **co-locate**한다 (예: `app/domain/project/__tests__/project.schema.test.ts`, `app/presentation/components/chrome/__tests__/ThemeToggle.test.tsx`). `test/`는 **레이어 간 공유 유틸 전용**.

---

## CA Skeleton Placeholders (`.gitkeep` files)

T002에서 Clean Architecture 4-layer 디렉토리를 미리 생성할 때, 각 빈 디렉토리를 git으로 트래킹하기 위해 `.gitkeep` placeholder 파일을 둔다. 후속 task에서 실제 파일이 추가되면 같은 위치의 `.gitkeep`은 그대로 두거나 (관습상) 첫 실 파일 추가 PR에서 제거한다.

**Target structure** (placeholder 파일 — 후속 task가 같은 위치에 실 파일을 추가):
```
app/
├── domain/
│   ├── project/.gitkeep
│   ├── post/.gitkeep
│   ├── legal/.gitkeep
│   ├── contact/.gitkeep
│   └── theme/.gitkeep
├── application/
│   ├── content/
│   │   ├── ports/.gitkeep
│   │   └── services/.gitkeep
│   ├── contact/
│   │   ├── ports/.gitkeep
│   │   └── services/.gitkeep
│   ├── search/services/.gitkeep
│   ├── og/
│   │   ├── ports/.gitkeep
│   │   └── services/.gitkeep
│   ├── feed/services/.gitkeep
│   └── seo/services/.gitkeep
├── infrastructure/
│   ├── config/.gitkeep
│   ├── content/.gitkeep
│   ├── email/.gitkeep
│   ├── captcha/.gitkeep
│   ├── og/.gitkeep
│   ├── search/.gitkeep
│   └── analytics/.gitkeep
└── presentation/
    ├── components/.gitkeep
    ├── hooks/.gitkeep
    ├── layouts/.gitkeep
    ├── lib/.gitkeep
    └── routes/.gitkeep
```

---

## Path Aliases

```typescript
// tsconfig.app.json (예상)
{
  "compilerOptions": {
    "paths": {
      "~/*": ["./app/*"],
      "~/domain/*": ["./app/domain/*"],
      "~/application/*": ["./app/application/*"],
      "~/infrastructure/*": ["./app/infrastructure/*"],
      "~/presentation/*": ["./app/presentation/*"],
      "#content/*": ["./.velite/*"]
    }
  }
}
```

**Usage example**:
```typescript
// app/presentation/routes/projects.$slug.tsx
import type { Project } from "~/domain/project/project.entity";
import { ProjectMetaSidebar } from "~/presentation/components/project/ProjectMetaSidebar";
// loader에서 context.container.get("getProjectDetail") 호출
```

---

## Dependency Direction Rules (Summary)

```
Presentation (routes/, presentation/)
    ↓ may import
Application (application/)
    ↓ may import
Domain (domain/)
    ↑ implemented by
Infrastructure (infrastructure/)  ← workers/app.ts (Composition Root) wires everything
```

**금지 사항**:
- Domain → Application/Infrastructure/Presentation import **금지**
- Application → Infrastructure import **금지** (Port만 정의)
- Presentation → Infrastructure 직접 import **금지** (loader/action에서 context로 유스케이스 받음)
- `app/**` → `docs/design-system/**` import **금지** (위치상 자연 격리, 디자인 서브에이전트 참고용)

---

## File Location Summary by Task

| Task | Location |
|------|----------|
| 새 페이지 추가 | `app/presentation/routes/` (file convention 준수) |
| UI 컴포넌트 추가 | `app/presentation/components/` (PascalCase 컴포넌트 파일명 유지) |
| 글로벌 Context Provider 추가 | `app/presentation/providers/` (`app/root.tsx`에서 mount) |
| 비즈니스 로직(유스케이스) 추가 | `app/application/{domain}/services/*.service.ts` |
| 외부 시스템 인터페이스 정의 | `app/application/{domain}/ports/*.port.ts` |
| 외부 시스템 구현 (Resend/Turnstile/Satori) | `app/infrastructure/{email\|captcha\|og}/` (Repository 구현은 `*.repository.ts`) |
| 콘텐츠 모델/스키마 정의 | `app/domain/{project\|post\|legal\|contact}/` (`*.entity.ts`, `*.vo.ts`, `*.schema.ts`) |
| MDX 콘텐츠 작성 | `content/{projects\|posts\|legal/apps}/` |
| 정적 자산 추가 | `public/` |
| 테스트 작성 | 각 레이어의 `__tests__/` (단위) / `test/` (공유 유틸) |
| Cloudflare Workers 환경변수 추가 | `wrangler.toml` + `app/infrastructure/config/container.ts` |
| 디자인 토큰 변경 | `app/app.css` (`@theme` 블록) — `docs/design-system/styles.css`에서 이식 |
| 새 task 작업서 작성 | `docs/tasks/TXXX-<slug>.md` (11개 표준 섹션) + `docs/tasks/README.md` 인덱스 갱신 |
| 검증/리뷰 산출물 보관 | `docs/reports/{code-review\|design-review\|failures}/` |

---

## Cross-cutting Concerns Mapping

| Concern | Layer | Module |
|---------|-------|--------|
| F010 다크모드 (`[data-theme]` + `proto-theme` localStorage) | Presentation | `presentation/providers/ThemeProvider.tsx` + `presentation/hooks/useTheme.ts` + `root.tsx` |
| F011 Satori OG 이미지 | Application Port + Infrastructure 구현 (Asset Binding) + Resource Route | `application/og/` + `infrastructure/og/satori-og-renderer.ts` (env.ASSETS Fetcher 주입) + `presentation/routes/og/*[.png].tsx` |
| F012 RSS | Application 유스케이스 + Resource Route | `application/feed/services/build-rss-feed.service.ts` + `presentation/routes/rss[.xml].tsx` |
| F013 Cloudflare Web Analytics | Presentation 스니펫 | `root.tsx` |
| F016 Cmd+K Command Palette | Application 빌드 서비스 + Presentation(UI) | `application/search/services/build-search-index.service.ts` (→ `public/search-index.json`) + `presentation/components/palette/CommandPalette.tsx` (lazy fetch) |
| F018 SEO sitemap/robots/JSON-LD | Application + Resource Route + Presentation meta | `application/seo/services/build-sitemap.service.ts` + `presentation/routes/{sitemap,robots}[.*].tsx` + 페이지별 `meta` export |
| F019 검색엔진 인증 | Presentation 환경변수 조건부 렌더 | `root.tsx`의 `<head>` (`GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION` env) |
| Contact (F008/F009) | Application 유스케이스 + Infrastructure 어댑터 2종 | `application/contact/services/submit-contact-form.service.ts` + `infrastructure/email/resend-email-sender.ts` + `infrastructure/captcha/turnstile-verifier.ts` |

---

## Architectural Decisions (Resolved)

본 절은 초안에 포함되어 있던 [ASSUMPTION]을 교차 검증(context7 + WebSearch)으로 확정한 결정 사항이다.

### D1. 라우트 디렉토리: `app/presentation/routes/` (CA Presentation 내부)
- `app/routes.ts`에서 `flatRoutes({ rootDirectory: "presentation/routes" })`로 등록 — file convention 자동 추론 + CA 가시성 둘 다 확보
- 라우트 모듈은 반드시 `appDirectory`(=`app/`) 내부에 위치 — typegen 정상 동작 조건 ([Issue #12993](https://github.com/remix-run/react-router/issues/12993))
- **그룹화 규칙**: 동일 prefix를 공유하는 라우트가 2개 이상이면 동명 디렉토리로 묶고, 내부에서 `_index.tsx` / `$slug.tsx` 등 file convention을 그대로 사용한다. 단일 라우트는 평면 파일로 유지 (시각 노이즈 최소화)
- **근거**: [React Router File Route Conventions](https://reactrouter.com/how-to/file-route-conventions), [Type Safety](https://reactrouter.com/explanation/type-safety)

### D2. DI 컨테이너: 수제 Plain object/Map
- `app/infrastructure/config/container.ts`의 `buildContainer(env): Container` 함수 한 개로 모든 의존성 조립
- 의존성 그래프 깊이가 ~10개 수준 → `awilix` / `tsyringe` 등 라이브러리 ROI 낮음
- `reflect-metadata` polyfill 불필요 (Workers 친화)

### D3. F016 검색 인덱스: 빌드 타임 정적 산출물
- `build-search-index.service.ts`(velite afterBuild 훅 또는 별도 스크립트)가 `.velite/*` → `public/search-index.json` 출력
- 클라이언트는 lazy fetch + CDN 캐싱으로 로드. body 제외(`{slug, title, summary, tags}`만)하여 인덱스 크기 최소화
- 콘텐츠 100+ 도달 시 FlexSearch/Fuse 도입 검토 (현재는 단순 토큰 매칭)

### D4. design-system 격리: 위치 기반 자연 격리
- `docs/design-system/`은 `app/` 외부 → import 그래프에 자연스럽게 포함되지 않음
- 추가 차단 도구(Lint 규칙 등) 불필요. 디자인 서브에이전트의 참고 정본으로만 사용

### D5. Satori 폰트/WASM 바인딩: Cloudflare Workers Asset Binding
- `wrangler.toml`의 `[assets]` 블록(`binding = "ASSETS"`, `directory = "./public"`) 사용
- Worker 내부에서 `env.ASSETS.fetch("https://x.local/fonts/JetBrainsMono-Regular.ttf").then(r => r.arrayBuffer())`로 폰트 ArrayBuffer 획득
- `satori/standalone` + `env.ASSETS.fetch(".../wasm/yoga.wasm")`로 yoga.wasm 수동 로드 — Workers WASM 동적 로딩 제약 우회
- **근거**: [Cloudflare Static Assets Binding](https://developers.cloudflare.com/workers/static-assets/binding/), [Satori Standalone Build](https://github.com/vercel/satori), [6 Pitfalls of Dynamic OG on Workers](https://dev.to/devoresyah/6-pitfalls-of-dynamic-og-image-generation-on-cloudflare-workers-satori-resvg-wasm-1kle)
