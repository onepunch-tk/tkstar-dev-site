# tkstarDev PRD

## Core Information

**Purpose**: 1인 기업(개발자)의 개인 브랜드 웹사이트로, 사이트 자체가 이력서 역할을 하며 B2B(기업/HR) 채용 제안과 B2C(프리랜서 플랫폼) 의뢰 모두를 단일 도메인(tkstar.dev)에서 수렴시킨다. 주 네비게이션은 **검색 중심(Cmd+K Command Palette)**이며, 청중 분기는 별도 분기 CTA가 아닌 **콘텐츠 라우팅(About는 B2B 친화 / Projects·Case Study는 B2C 친화)**으로 자연스럽게 수행된다.
**Users**: ① B2B 청중 — 기업 채용/HR 담당자, B2B 프리랜서 프로젝트 매니저 (이력·기술 깊이·신뢰성 검토). ② B2C 청중 — 크몽 등 프리랜서 플랫폼에서 유입된 클라이언트 (결과물·후기·문제 해결 능력 검토).
**Scope Note**: **콘텐츠 분리 정책** — Post 는 Cloudflare D1 (SQLite, edge-native) 에 저장하고 Admin Editor (F020/F021) 로 외부 작성·발행. Project / AppLegalDoc 은 velite + MDX 정적 파이프라인 유지 (Project 의 cover 이미지 메타만 D1 이관, F022). 한국어 only(i18n 없음). 결제·가격 페이지 없음(메일 문의로 대체). `/admin/*` 은 Cloudflare Access 로 보호되는 본인 1명 전용 (F023). 디자인 정본은 `docs/design-system/prototype.html` + `docs/design-system/proto/*` (React 18 + babel-standalone 데모) — 구현 시 React Router v7 ESM 모듈로 포팅 필요. **본 PRD 의 F020~F023 은 향후 CMS 인프라 도입을 위한 계획 정본으로, 현 시점에는 미구현 (ROADMAP 별도 Phase 참조)**.

## User Journey

```
1. 진입 (Landing Page, 홈)
   ├─ Hero: whoami 프롬프트 + "ship solo. ship fast." 카피 + 핵심 요약
   │   ├─ [검색해서 이동] → Cmd+K Command Palette 오픈 (F016)
   │   ├─ [/about] 빠른 링크 → About Page
   │   └─ [/projects] 빠른 링크 → Projects Page
   │
   ├─ Featured Project 섹션 → 클릭 시 Project Detail
   └─ Recent Posts 3행 + "모두 보기" → Blog Page / Blog Detail

2. 글로벌 네비게이션 (전 페이지 공통)
   ├─ Cmd+K / Ctrl+K / `/` 단축키 (입력 포커스 외) → Command Palette 오픈
   │   ├─ routes (/about, /projects, /blog, /contact, /legal) 인덱스
   │   ├─ projects 슬러그 인덱스
   │   ├─ posts 슬러그 인덱스
   │   ├─ ↑↓ 네비, ↵ 진입, Esc 닫기, 토큰 기반 다중 키워드 필터
   │   └─ 그룹 헤더(pages / projects / posts)
   ├─ Topbar: 브랜드(tkstar.dev) / 현재 경로(~/about) / 검색 트리거 / 테마 토글
   └─ Footer: © + GitHub / X / RSS / Contact / (앱 등록 시) Legal Index

3. 청중별 자연 수렴 동선
   ├─ B2B 청중 → About Page 본문 검토 → "PDF로 저장하기" → window.print() → Contact
   └─ B2C 청중 → Projects (ls-style 행 리스트) → Project Detail Case Study → "의뢰하기" CTA → Contact

4. Contact 페이지 (의뢰/제안 접수)
   ├─ 폼 입력: 이름, 회사(선택), 이메일, 의뢰 유형(B2B/B2C/기타), 메시지
   ├─ 클라이언트 검증(이름·이메일 정규식·메시지 10자) + Cloudflare Turnstile
   │   ↓
   │   [검증 성공] → Resend 발신 (hello@tkstar.dev → 본인 메일)
   │       ↓ 자동응답 메일 발송 (제출자에게)
   │       ↓ 성공 화면 ("자동응답 메일이 {email}으로 발송되었습니다. 평균 회신 24시간 이내.")
   │   [검증 실패/필드 오류] → 인라인 에러 표시, 폼 유지
   │
   └─ 발신 실패 (Resend 오류) → 에러 토스트 + "직접 메일 보내기" 링크 (mailto)

5. 보조 동선
   ├─ Blog → 글 목록 → 글 상세 (RSS 피드 구독, sticky sidebar TOC + 공유)
   ├─ Project Detail (sticky sidebar: meta + on-this-page TOC) → prev/next + 의뢰하기
   ├─ Blog Detail (sticky sidebar: TOC + share) → prev/next + 모든 글
   ├─ Legal Index (`/legal`) → 출시 앱 카드 → 앱별 Terms/Privacy
   └─ App Terms/Privacy → chrome-free webview 모드(Topbar/Footer 미노출, max-width 680px)

6. Not Found Fallback
   └─ 미존재 경로 → 터미널 메타포 메시지(`cd: no such route: <path>`) + Home 복귀 링크

7. 외부 노출
   ├─ 검색엔진/SNS 공유 시 SSR + Satori OG 이미지(1200×630)로 미리보기 자동 생성
   ├─ Google Search Console / Naver Search Advisor에 sitemap.xml 제출 (F019)
   ├─ /sitemap.xml — index 가능 페이지만 (Home, About, Projects, Project Detail, Blog, Blog Detail, Contact, Legal Index)
   ├─ /robots.txt — User-agent: *, Allow: /, Sitemap 위치 명시
   └─ JSON-LD 구조화 데이터로 Rich Result 노출 (Person / BlogPosting / CreativeWork / BreadcrumbList)
```

## Feature Specifications

### 1. Core Features

| ID | Feature Name | Description | Priority | Related Pages |
|----|--------------|-------------|----------|---------------|
| **F001** | Hero (whoami + 검색 + 빠른 링크) | `whoami` 프롬프트 + "ship solo. ship fast." 카피 + 3-버튼 클러스터([검색해서 이동], [/about], [/projects]). 청중 분기는 별도 CTA가 아닌 콘텐츠 라우팅으로 자연 수렴 | Core (랜딩 진입점) | Home Page |
| **F002** | About (사이트 자체 이력서) | 이력·기술스택·경력·학력·수상 표시. 화면용 + 인쇄용 듀얼 레이아웃. **경력 timeline은 회사 재직 + solo 프로젝트 통합 (시간 역순)** — `type: "company" \| "solo"` 분기로 시각 마커/링크 차별. solo entry는 `/projects/:slug` 또는 `/projects?type=solo`로 link 가능 [ASSUMPTION: A013] | Core (B2B 청중 주요 검토 자료) | About Page |
| **F003** | PDF 저장 (CSS print) | About 페이지 "⎙ PDF" 버튼 → `window.print()` 호출. `@media print` 전용 스타일로 Topbar/Footer/검색트리거/토글 숨김, 색상 단순화 | Core (이력서 다운로드 대체) | About Page |
| **F004** | Projects 목록 (ls-style 행 리스트) | `slug/ + title + date / summary / stack pills` 행 구조 + 태그 필터 칩. 카드 그리드 아님. velite + MDX 컬렉션, frontmatter Zod 검증 | Core (포트폴리오 진열) | Projects Page |
| **F005** | Project Case Study | 프로젝트 상세 페이지. 문제 정의 → 접근 → 결과(수치/스크린샷) 구조. shiki 코드블록. 데스크탑 880px+에서 sticky sidebar(meta: year/role/stack pills + on-this-page TOC). 하단 prev/next 프로젝트 + 가운데 "의뢰하기 →" primary CTA | Core (B2C 청중 신뢰성 검증) | Project Detail Page |
| **F006** | Blog 목록 | 발행일 역순 정렬, 태그 필터. 월 1편 작성 운영 | Core (전문성 노출, SEO 자산) | Blog Page |
| **F007** | Blog 상세 | MDX 본문, shiki 코드블록, Satori OG, 데스크탑 880px+에서 sticky sidebar(on-this-page TOC + 공유 도구: copy link / X 공유). 하단 prev/next + 가운데 "모든 글" 버튼 | Core (글 단위 SEO 진입점) | Blog Detail Page |
| **F008** | Contact Form | 이름/회사(선택)/이메일/의뢰 유형(B2B·B2C·기타)/메시지 입력. Resend로 hello@tkstar.dev → 본인 메일 발신, 제출자에게 React Email 템플릿 자동응답 | Core (모든 분기의 수렴점) | Contact Page |
| **F009** | Contact 스팸 방지 | Cloudflare Turnstile 위젯으로 폼 제출 검증 (Workers 친화 선택) | Core (메일 only 채널 보호) | Contact Page |
| **F016** | Cmd+K Command Palette (글로벌 검색 네비) | 모든 routes(/about, /projects, /blog, /contact, /legal) + projects 슬러그 + posts 슬러그를 인덱싱한 클라이언트 사이드 검색. ⌘K(macOS) / Ctrl+K(Windows·Linux) / `/` 단축키로 오픈(입력 포커스 중엔 무시). 토큰 기반 다중 키워드 필터, ↑↓ 네비, ↵ 진입, Esc 닫기, 그룹 헤더(pages/projects/posts). **사이트의 주 네비게이션 패러다임**. `/admin/*` 경로는 인덱스에서 제외 | Core (주 네비게이션) | All Pages (root layout 마운트) |
| **F020** | Admin Editor (Tiptap WYSIWYG, markdown only) | `/admin/posts` 목록 + `/admin/posts/new` · `/admin/posts/{slug}/edit` 라우트. 좌측 Tiptap 에디터 (markdown serialize 보장, 커스텀 JSX 컴포넌트 X — round-trip 안정), 우측 SSR-style preview, 상단 toolbar (bold/italic/link/code/image). 이미지 toolbar 버튼 → R2 업로드 (F022) → 본문에 `![alt](R2 URL)` 자동 삽입. Status: `draft` / `published`. `[Save]` 와 `[Publish]` 버튼 (수동, auto-save 없음). Save/Publish 시 `search-index.json` 재생성 (F016 인덱스 갱신). **Out of Scope**: draft auto-save, scheduled publish | Core (모바일/외부 글 작성) | Admin Posts List, Admin Post Editor |
| **F021** | D1 Post Storage | Post 만 Cloudflare D1 (SQLite) 로 이관 — Project / AppLegalDoc 은 velite + MDX 유지. Drizzle ORM + drizzle-kit migration. 컬럼: `id` / `slug` / `title` / `summary` / `raw_markdown` / `tags` (JSON) / `date_published` / `status` (`draft` / `published`) / `created_at` / `updated_at`. **Read path**: SSR 런타임에서 `raw_markdown` → MDX-like compile (런타임 컴파일러) + Workers KV cache (key: `post:{slug}:body:v{updated_at-hash}`). 일회성 migration 스크립트로 기존 `content/posts/*.mdx` → D1 INSERT 후 원본 파일 정리. **Out of Scope**: post 버전 히스토리 / 롤백 | Core (Post CMS 데이터 정본) | Blog List, Blog Detail, Admin Posts List, Admin Post Editor |
| **F022** | R2 Media | Cloudflare R2. **R2 클라이언트 후보** (ROADMAP T023 PoC 후 T033 에서 최종 결정): (a) **R2 Workers binding 직접 호출** 1순위 (`MEDIA_BUCKET.put/get/delete/list`, 의존성 0) / (b) `aws4fetch` 2순위 (~2.5KB, 다른 S3 호환 서비스 이식 시) / (c) `@aws-sdk/client-s3` 3순위 (~500KB — `wrangler.toml` 의 `compatibility_flags = ["nodejs_compat"]` 활성으로 import 가능, 단 multipart/streaming 등 sdk 만의 기능이 진짜 필요할 때만). **업로드 경로**: Workers proxy `POST /admin/api/upload` (Cloudflare Access 보호 하 — F023). **파일 키**: `media/{yyyy}/{mm}/{nanoid}.{ext}`. **Public read**: R2 public bucket URL 또는 Workers 라우트로 서빙. **Project 메타 일부 D1 이관**: `cover_image_url` / `cover_alt` 만 D1 으로 분리 (Project 본문 MDX 는 그대로 유지). Admin Media Library 에서 업로드된 자산 목록·삭제 가능. **Out of Scope**: Cloudflare Images (자동 WebP/AVIF 변환) — MVP 는 R2 단순 제공 | Core (이미지 업로드 채널) | Admin Media Library, Project Detail, Admin Post Editor |
| **F023** | Cloudflare Access (Zero Trust) | `/admin/*` path application 단위 보호. **Identity provider**: GitHub OAuth (Cloudflare Zero Trust Free 플랜, 본인 1명 email allowlist). Workers 코드는 `Cf-Access-Authenticated-User-Email` 헤더 + `Cf-Access-Jwt-Assertion` JWT 만 검증, **자체 세션·쿠키·비밀번호 코드 없음**. JWT 공개키는 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 에서 fetch 후 캐시. 미인증 요청은 Cloudflare Access 가 가로채 GitHub OAuth 로 리다이렉트 — Workers 까지 도달하지 않음. **Out of Scope**: multi-user collaboration / 권한 분리 | Core (Admin 게이트, 외부 노출 차단) | Admin Layout (모든 /admin/* 라우트의 게이트) |

### 2. Required Support Features

| ID | Feature Name | Description | Priority | Related Pages |
|----|--------------|-------------|----------|---------------|
| **F010** | 다크모드 토글 | 시스템 `prefers-color-scheme` 기본 추종, 헤더 토글로 강제 전환. 선택은 localStorage(`proto-theme`) 저장. **`[data-theme='dark|light']` HTML 속성 셀렉터 전략** (Tailwind v4 클래스 전략 X) | Support (디자인 톤 — 다크 기본) | All Pages |
| **F011** | SSR + 동적 OG 이미지 | React Router v7 Framework mode SSR. 블로그/프로젝트 슬러그별 Satori로 OG 이미지(1200×630 통일) 빌드/요청 시 생성 | Support (검색엔진·SNS 공유 미리보기) | Blog Detail Page, Project Detail Page |
| **F012** | RSS 피드 | 블로그 글 RSS 2.0 XML 자동 생성 (`/rss.xml` 엔드포인트) | Support (구독자 채널 확보) | Blog Page |
| **F013** | 분석 (쿠키 없음) | Cloudflare Web Analytics 스니펫 삽입. 쿠키·개인정보 수집 없음 | Support (트래픽 가시성, 운영용) | All Pages |
| **F014** | 앱 약관 라우팅 (스켈레톤) | 출시 앱별 이용약관/개인정보처리방침 페이지 + `/legal` 인덱스(앱 목록 허브). velite collection으로 `legal/apps/[slug]/terms.mdx`, `privacy.mdx` 관리. **앱 내부 WebView 친화 chrome-free 모드** (Topbar/Footer 미노출, max-width 680px, 본문/TOC 중심). MVP에서는 라우팅 + 빈 템플릿만 준비 | Support (앱 출시 시 점진적 채움) | Legal Index Page, App Terms Page, App Privacy Page |
| **F017** | Home Featured + Recent Posts | Hero 아래 `## featured` (Project 데이터 모델의 `featured: true` 항목, 큰 카드 1개) + `## recent posts` (최근 3개 행 + "모두 보기 →") | Support (Home 정보 밀도, SEO 진입점) | Home Page |
| **F018** | SEO 메타데이터 & Sitemap | 페이지별 `<title>`, `<meta name="description">`, canonical URL. Open Graph(og:title/description/image/url/type) + Twitter Card(summary_large_image). React Router v7 `meta` export로 페이지별 정의. `/sitemap.xml` resource route — 정적 routes + projects/posts 슬러그 + Legal Index만 포함 (개별 App Terms/Privacy 및 404는 제외). `/robots.txt` resource route — User-agent: *, Allow: /, Sitemap 위치 명시. JSON-LD 구조화 데이터: Person(Home/About), BlogPosting(Blog Detail), CreativeWork/SoftwareSourceCode(Project Detail), BreadcrumbList. **차등 인덱싱 정책**: App Terms/App Privacy는 `noindex, follow` (앱 심사 시 URL 접근은 허용), Not Found Fallback은 `noindex, nofollow`. | Support (검색엔진 가시성) | All Pages (root layout meta + 페이지별 meta export) |
| **F019** | 검색엔진 등록 (Google + Naver) | Google Search Console 도메인 소유권 인증 + sitemap.xml 제출. Naver Search Advisor `naver-site-verification` 메타 태그 + sitemap 제출 (한국어 사이트 필수). Bing Webmaster Tools는 후순위 [ASSUMPTION: MVP 후 등록]. 인증 메타 태그는 환경변수(`GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`)로 관리, root layout에서 조건부 렌더. 검증: 배포 후 `site:tkstar.dev` 검색으로 indexing 확인. | Support (검색엔진 등록) | All Pages (root layout) |

### 3. Deferred / Removed Features

- **(Removed)** ~~F001 청중 분기 split CTA~~ — design 정본의 검색 우선 컨셉 채택으로 폐기. F001은 "Hero whoami + 검색 + 빠른 링크"로 재정의됨.
- **(Removed)** ~~F015 청중 분기 기억 (localStorage `audience`)~~ — F001 폐기에 따라 동시 폐기. 단, `proto-theme` localStorage는 F010이 그대로 사용.
- 뉴스레터 구독 / 이메일 마케팅
- 블로그 댓글 시스템 (Giscus 등)
- i18n (영문/일문 등 추가 언어)
- 가격표 / 결제 페이지
- `/uses`, `/now` 페이지 (운영 부담 대비 가치 낮아 제외)
- 별도 PDF 이력서 트리 (CSS print로 충분)
- ~~DB 기반 콘텐츠 관리~~ — **(Updated)** Post 만 Cloudflare D1 로 부분 이관 (F021). Project / AppLegalDoc 은 여전히 static MDX 유지.
- ~~인증/회원가입/로그인~~ — **(Updated)** 일반 방문자 인증은 여전히 없음. 본인 1명 admin 인증만 Cloudflare Access (F023) 위임 — Workers 자체 세션/쿠키/비밀번호 코드 없음.
- Draft auto-save (주기 자동 저장) — F020 명시적 보류
- Scheduled publish (예약 발행) — F020 명시적 보류
- Post 버전 히스토리 / 롤백 — F021 명시적 보류
- Cloudflare Images (자동 WebP/AVIF 변환) — F022 명시적 보류 (MVP 는 R2 단순 제공)
- Multi-user collaboration / 권한 분리 — F023 명시적 보류 (본인 1명 전용)
- Motion 라이브러리 도입 — design 정본은 절제된 CSS-only motion(`@keyframes blink/fade` + 120ms hover transition)만 사용. **MVP에서는 CSS-only로 충분, Motion 라이브러리 도입 보류** [ASSUMPTION: 추후 인터랙션 보강 시 재검토]

## Menu Structure

```
🌐 tkstarDev Navigation

📌 Header / Topbar (전 페이지 공통, chrome-free 모드 제외)
├── 🏷  Brand: tkstar.dev → Home
├── 🛣  현재 경로 표시 (브레드크럼 형태, ~ + path)
├── 🔍 Search Trigger (⌘K) → F016 (Command Palette)
└── 🌓 Theme Toggle → F010 (다크모드)

🔗 Footer (전 페이지 공통, chrome-free 모드 제외)
├── © 2026 tkstar.dev · solo
├── 🐙 GitHub 링크 (외부)
├── 𝕏  X 링크 (외부)
├── 📡 RSS Feed (`/rss.xml`) → F012
├── ✉️ Contact 빠른 링크 → Contact Page
├── ⚖️ Legal Index (앱 1개 이상 등록 시 노출) → Legal Index Page (F014)
└── 📊 (비가시) Analytics 스니펫 → F013

🧭 글로벌 네비게이션 (전 페이지 공통)
└── ⌨️ Cmd+K / Ctrl+K / `/` → Command Palette (F016)
    ├── pages: /, /about, /projects, /blog, /contact, /legal
    ├── projects: 모든 프로젝트 슬러그
    └── posts: 모든 블로그 슬러그

🧭 콘텐츠 내부 진입
├── Home → Featured Project 카드 / Recent Posts 행 → 각 상세
├── Projects Page → ls-style 행 클릭 → Project Detail Page → F005
├── Blog Page → 글 카드 클릭 → Blog Detail Page → F007, F011
└── Legal Index → 앱 카드 → App Terms / App Privacy (chrome-free)

🚧 Not Found Fallback
└── 미존재 경로 → 터미널 메시지 + Home 복귀 링크

🤖 크롤러 / 검색엔진 인덱싱 (사용자 비가시)
├── 📋 /sitemap.xml — index 가능 페이지만 (F018)
├── 🚫 /robots.txt — User-agent: *, Allow: /, Sitemap 위치 (F018)
└── 🏷️ root layout `<head>` — Google/Naver site verification (F019)

🪟 chrome-free Layout (App Terms / App Privacy)
└── Topbar/Footer 미노출, `.legal` 컨테이너만 (max-width 680px, sober mode)

🔒 Admin (Cloudflare Access 보호 — F023, 본인 1명 전용)
└── 일반 방문자 비노출. Topbar/Footer/Command Palette 인덱스 모두 제외
    ├── /admin/posts          → Admin Posts List (F020, F021)
    ├── /admin/posts/new      → Admin Post Editor — 신규 (F020, F021, F022)
    ├── /admin/posts/{slug}/edit → Admin Post Editor — 편집 (F020, F021, F022)
    ├── /admin/media          → Admin Media Library (F022)
    └── /admin/api/upload     → R2 업로드 proxy (F022, F023)  // (UI 없음, internal endpoint)
```

## Page-by-Page Detailed Features

### Home Page

> **Implemented Features:** `F001`, `F017`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** Brand 클릭 → Home

| Item | Content |
|------|---------|
| **Role** | 사이트의 첫 진입점. whoami 자기소개 + 검색 진입 + Featured Project + Recent Posts로 두 청중을 모두 자연스럽게 수렴 |
| **Entry Path** | 외부 검색 결과 / SNS 공유 / 직접 입력 / 헤더 브랜드 클릭 |
| **User Actions** | Hero 카피 확인 → [검색해서 이동] 클릭(또는 ⌘K) → palette 오픈 / [/about] 또는 [/projects] 빠른 링크 / Featured Project 카드 클릭 / Recent Posts 행 클릭 / "모두 보기 →" 클릭 / 다크모드 토글 |
| **Key Features** | • Hero: `whoami` 프롬프트 + "ship solo. ship fast." 카피 + 핵심 요약 (역할, 한 줄 소개)<br>• 3-버튼 클러스터: [검색해서 이동] → palette / [/about] / [/projects]<br>• Featured Project 섹션 — Project 모델 `featured: true` 항목, 큰 카드 1개 (F017)<br>• Recent Posts 섹션 — 최근 3개 행 + "모두 보기 →" → Blog Page (F017) |
| **Next Navigation** | palette / About / Projects / Project Detail / Blog / Blog Detail |

### About Page

> **Implemented Features:** `F002`, `F003`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** palette / Home 빠른 링크 / Footer

| Item | Content |
|------|---------|
| **Role** | 사이트 자체가 이력서. 이력·기술스택·경력·학력·수상을 한 페이지에 정리하여 B2B 청중의 검토를 즉시 만족 |
| **Entry Path** | palette `/about` / Home 빠른 링크 / Footer Contact 인근 / 외부 검색 결과 |
| **User Actions** | 본문 스크롤로 섹션별 검토. 인쇄 시 "⎙ PDF" 버튼 클릭 → 시스템 인쇄 다이얼로그에서 PDF 저장 |
| **Key Features** | • 헤더: 이름 + 한 줄 포지셔닝 + 이메일 + [⎙ PDF] 버튼<br>• 기술스택 카드 3개 (frontend / edge·backend / quality) — 카테고리별 그룹<br>• 경력 (역순) — **회사 재직 + solo 프로젝트 통합 timeline**. `type: "company" \| "solo"` discriminated union으로 분기. solo entry는 `/projects/:slug` link 가능 (frontmatter 끌어오기) [ASSUMPTION: A013]<br>• 학력 / 수상 카드 2개 [ASSUMPTION: 자격증 데이터 추가 시 별도 카드 — A001]<br>• `@media print` 스타일: Topbar/Footer/검색트리거/토글/PDF 버튼 숨김, 색상 단순화 (F003) |
| **Next Navigation** | palette / Projects / Blog / Contact |

### Projects Page

> **Implemented Features:** `F004`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** palette / Home 빠른 링크

| Item | Content |
|------|---------|
| **Role** | 프로젝트 포트폴리오 진열. B2C 청중에게 "이 사람이 내 문제를 해결할 수 있는가"의 1차 답변 |
| **Entry Path** | palette `/projects` / Home 빠른 링크 / Home Featured Project 카드 / About 페이지 내부 링크 |
| **User Actions** | 태그 칩으로 필터링 → ls-style 행 훑기 → 관심 프로젝트 행 클릭 |
| **Key Features** | • **ls-style 행 리스트** (카드 그리드 아님)<br>  - 행 구조: `slug/ + title + date(YYYY-MM)` / `summary` / `stack pills`<br>• 태그 필터 칩 (상단)<br>• velite + MDX collection (frontmatter Zod 검증)<br>• 행 클릭 → Project Detail Page 이동 |
| **Next Navigation** | Project Detail Page / Contact Page |

### Project Detail Page

> **Implemented Features:** `F005`, `F011`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** Projects Page → 행 클릭 / Home Featured

| Item | Content |
|------|---------|
| **Role** | Case Study. 한 프로젝트를 "문제 → 접근 → 결과(수치/스크린샷)" 구조로 깊이 있게 보여주어 신뢰성 입증 |
| **Entry Path** | Projects Page에서 행 클릭 / Home Featured 카드 / 외부 검색·SNS 공유 (Satori OG) |
| **User Actions** | 본문 스크롤로 문제·접근·결과 순차 검토 → sticky sidebar에서 섹션 점프 → 코드블록·스크린샷 확인 → 하단 [의뢰하기 →] CTA 또는 prev/next로 이동 |
| **Key Features** | • frontmatter: title / summary / date(YYYY-MM) / stack / tags / metrics / featured / cover<br>• 본문(MDX): 문제(problem) → 접근(approach) → 결과(metrics + 코드/스크린샷)<br>• shiki 코드블록 highlight<br>• Satori 동적 OG 1200×630 (F011)<br>• **데스크탑 880px+ sticky sidebar (`.two-col`)**<br>  - meta 박스: year / role / stack pills<br>  - on-this-page TOC: problem / approach / results 앵커 [ASSUMPTION: MDX 헤딩 자동 추출, rehype-toc 또는 velite 후처리]<br>• 하단 3분할: `← prev` / **`의뢰하기 →` primary** / `next →` |
| **Next Navigation** | prev/next 프로젝트 / Projects Page / Contact Page |

### Blog Page

> **Implemented Features:** `F006`, `F012`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** palette / Home Recent Posts "모두 보기"

| Item | Content |
|------|---------|
| **Role** | 글 목록 진열. 월 1편 작성으로 전문성 노출 + SEO 자산 누적 |
| **Entry Path** | palette `/blog` / Home Recent Posts → "모두 보기" / 외부 검색 결과 / RSS 리더의 백링크 |
| **User Actions** | 발행일 역순 목록 훑기 → 태그 필터 → 글 카드/제목 클릭 → RSS 구독 링크 사용 |
| **Key Features** | • 발행일 역순 정렬<br>• 태그 필터<br>• 글 행: 제목, 발행일(date), 한 줄 요약(lede), 태그, 읽는 시간(read)<br>• RSS 피드 링크 (`/rss.xml`) (F012) |
| **Next Navigation** | 글 카드 클릭 → Blog Detail Page |

### Blog Detail Page

> **Implemented Features:** `F007`, `F011`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** Blog Page → 글 카드 클릭 / Home Recent Posts

| Item | Content |
|------|---------|
| **Role** | 글 단위 SEO 진입점. 외부 검색에서 직접 도달하는 첫 페이지로 자주 동작 |
| **Entry Path** | Blog Page에서 카드 클릭 / Home Recent Posts / 외부 검색 / SNS 공유(Satori OG) / RSS 리더 |
| **User Actions** | 본문 읽기 → sticky sidebar TOC로 섹션 점프 → 코드블록 복사 → 사이드바 share(copy link / X) → 하단 prev/next 또는 "모든 글" |
| **Key Features** | • frontmatter: title / lede / date / tags / read<br>• MDX 본문 + shiki 코드블록 highlight<br>• Satori 동적 OG 1200×630 (F011)<br>• **데스크탑 880px+ sticky sidebar (`.two-col`)**<br>  - on-this-page TOC: h2 헤딩 자동 추출 앵커<br>  - share 도구: [copy link] / [share on X]<br>• 하단 3분할: `← prev` / **[모든 글] → /blog** / `next →` |
| **Next Navigation** | prev/next 글 / Blog Page / Contact Page |

### Contact Page

> **Implemented Features:** `F008`, `F009`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** palette / Footer / About·Project Detail의 의뢰 CTA

| Item | Content |
|------|---------|
| **Role** | B2B 채용 제안과 B2C 의뢰 모두를 메일 채널로 수렴. 가격은 노출하지 않고 메시지로 협의 시작 |
| **Entry Path** | palette `/contact` / Footer Contact 링크 / About 본문 / Project Detail의 "의뢰하기" CTA |
| **User Actions** | 폼 작성: 이름, 회사(선택), 이메일, 의뢰 유형(B2B/B2C/기타) 라디오, 메시지 → Turnstile 검증 → 제출 |
| **Key Features** | • 입력 필드: 이름, 회사(선택), 이메일, 의뢰 유형 라디오, 메시지<br>• 클라이언트 검증: 이름·이메일 정규식·메시지 10자 이상<br>• Cloudflare Turnstile 위젯 (F009)<br>• 제출 → Resend로 hello@tkstar.dev → 본인 메일 발신 (F008)<br>• 제출자에게 React Email 템플릿 자동응답 메일<br>• 성공 화면 카피: "자동응답 메일이 {email}으로 발송되었습니다. 평균 회신 24시간 이내."<br>• 발신 실패 시 mailto 폴백 링크 |
| **Next Navigation** | 성공 → Contact 성공 상태 화면 / 실패 → 폼 유지 + 에러 표시 |

### Legal Index Page

> **Implemented Features:** `F014`, `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** Footer — Legal (앱 1개 이상 등록 시 노출)

| Item | Content |
|------|---------|
| **Role** | 출시 앱 목록 허브. 각 앱의 Terms/Privacy 링크를 카드 형태로 진열 |
| **Entry Path** | Footer Legal 링크 (앱 등록 후) / palette `/legal` / 외부 앱 내부 링크의 폴백 |
| **User Actions** | 앱 카드 훑기 → 원하는 앱의 Terms 또는 Privacy 클릭 |
| **Key Features** | • velite collection 인덱스 — `legal/apps/[slug]/terms.mdx`, `privacy.mdx` 자동 수집<br>• 앱 카드: 앱명 / slug / [terms.mdx] / [privacy.mdx] 링크<br>• MVP에서는 데이터 0개 또는 1개(`moai`) 시연용. 앱 출시 시 점진적 채움<br>• 일반 chrome (Topbar/Footer 노출) |
| **Next Navigation** | 앱 카드 클릭 → App Terms Page 또는 App Privacy Page (chrome-free) |

### App Terms Page

> **Implemented Features:** `F014`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** Legal Index → 앱 카드 / 출시 앱 내부 링크

| Item | Content |
|------|---------|
| **Role** | 출시 앱별 이용약관 페이지. 앱 내부 WebView에서 호출되므로 chrome-free sober 모드 |
| **Entry Path** | 출시 앱 내부 "이용약관" 링크 (WebView) / Legal Index Page |
| **User Actions** | 약관 본문 읽기 (스크롤). 외부 링크 클릭으로 앱·스토어로 복귀 |
| **Key Features** | • velite collection: `legal/apps/[slug]/terms.mdx`<br>• MDX 본문 렌더링 + 발효일 메타 [ASSUMPTION: 약관 표준 메타]<br>• **chrome-free 레이아웃** — Topbar/Footer 미노출, `.legal` 컨테이너 (max-width 680px, sober mode, TOC, 표 스타일)<br>• MVP: 빈 템플릿 + 라우팅만 준비 (F014)<br>• **SEO 정책**: `<meta name='robots' content='noindex, follow'>` (앱 심사 시 URL 접근 허용 + 검색엔진 인덱싱 차단). canonical은 유지하여 검토자 URL 공유 시 정본 경로 보장. sitemap.xml에서 제외 |
| **Next Navigation** | 같은 앱의 Privacy 페이지 / 외부 앱·스토어 |

### App Privacy Page

> **Implemented Features:** `F014`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** Legal Index → 앱 카드 / 출시 앱 내부 링크

| Item | Content |
|------|---------|
| **Role** | 출시 앱별 개인정보처리방침 페이지. 앱 내부 WebView에서 호출되므로 chrome-free sober 모드 |
| **Entry Path** | 출시 앱 내부 "개인정보처리방침" 링크 (WebView) / Legal Index Page |
| **User Actions** | 처리방침 본문 읽기. 외부 링크로 복귀 |
| **Key Features** | • velite collection: `legal/apps/[slug]/privacy.mdx`<br>• MDX 본문 렌더링 + 시행일·문의 채널(hello@tkstar.dev) 메타 [ASSUMPTION: 표준 메타]<br>• **chrome-free 레이아웃** — Topbar/Footer 미노출, `.legal` 컨테이너 (max-width 680px, sober mode)<br>• MVP: 빈 템플릿 + 라우팅만 준비 (F014)<br>• **SEO 정책**: `<meta name='robots' content='noindex, follow'>` (앱 심사 시 URL 접근 허용 + 검색엔진 인덱싱 차단). canonical은 유지하여 검토자 URL 공유 시 정본 경로 보장. sitemap.xml에서 제외 |
| **Next Navigation** | 같은 앱의 Terms 페이지 / 외부 앱·스토어 |

### Not Found Fallback

> **Implemented Features:** `F016`, `F010`, `F013`, `F018`, `F019` | **Menu Location:** 미존재 경로 진입 시

| Item | Content |
|------|---------|
| **Role** | 미존재 경로의 폴백. 터미널 메타포로 디자인 톤 일관성 유지 |
| **Entry Path** | 잘못된 URL 직접 입력 / 깨진 링크 클릭 |
| **User Actions** | 메시지 확인 → "← /home" 링크 클릭 또는 ⌘K로 검색 |
| **Key Features** | • 터미널 메시지: `cd: no such route: <path>`<br>• "← /home" 복귀 링크<br>• [ASSUMPTION: React Router v7 splat(`*`) 라우트 또는 ErrorBoundary로 구현]<br>• **SEO 정책**: `<meta name='robots' content='noindex, nofollow'>` + 404 응답 코드. splat 라우트가 어떤 path든 받기 때문에 명시적 차단 필수. sitemap.xml에서 제외 |
| **Next Navigation** | Home / Command Palette |

### Admin Layout (`/admin/*` 게이트)

> **Implemented Features:** `F023` | **Menu Location:** 본인 1명 전용, 일반 노출 X (palette/topbar/footer 모두 제외)

| Item | Content |
|------|---------|
| **Role** | 모든 `/admin/*` 라우트의 인증 게이트 + 공통 레이아웃. Cloudflare Access 가 미인증 요청을 가로채 GitHub OAuth 로 리다이렉트 → 인증 후 Workers 도달 |
| **Entry Path** | 본인이 직접 URL 입력 (예: `tkstar.dev/admin/posts`) → Cloudflare Access 게이트 → GitHub 로그인 → Admin 화면 |
| **User Actions** | 좌측 nav 로 Posts List / Media Library 이동, 상단에 로그인 이메일 표시 |
| **Key Features** | • Cloudflare Access path application 으로 `/admin/*` 보호 (F023)<br>• Workers 코드는 `Cf-Access-Authenticated-User-Email` 헤더 + `Cf-Access-Jwt-Assertion` JWT 만 검증, 자체 세션 코드 없음<br>• JWT 공개키는 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` fetch 후 캐시<br>• 일반 ChromeLayout (Topbar/Footer) 과 분리된 별도 admin shell — 좌측 nav (Posts / Media), 상단 로그인 이메일 표시<br>• **SEO 정책**: 모든 `/admin/*` 페이지 `<meta name='robots' content='noindex, nofollow'>`, sitemap.xml 제외, F016 palette 인덱스 제외 |
| **Next Navigation** | Admin Posts List / Admin Media Library |

### Admin Posts List (`/admin/posts`)

> **Implemented Features:** `F020`, `F021`, `F023` | **Menu Location:** Admin Layout 좌측 nav

| Item | Content |
|------|---------|
| **Role** | D1 에 저장된 모든 Post (draft + published) 목록. 신규 작성 진입점 + 기존 글 편집 진입점 |
| **Entry Path** | Admin Layout 좌측 nav `/admin/posts` / 직접 URL 입력 (Cloudflare Access 통과 후) |
| **User Actions** | 목록 훑기 → status 필터 (draft / published / 전체) → `[+ New Post]` 클릭 → `/admin/posts/new` / 행 클릭 → `/admin/posts/{slug}/edit` |
| **Key Features** | • D1 `posts` 테이블 SELECT — `slug` / `title` / `status` / `date_published` / `updated_at` 컬럼 (F021)<br>• status 필터 칩 (draft / published / 전체)<br>• `[+ New Post]` primary 버튼 → Admin Post Editor 신규 모드<br>• 행 클릭 → Admin Post Editor 편집 모드 (slug 라우트 파라미터)<br>• 삭제 버튼 (확인 모달, soft delete 아닌 hard delete — F021 Out of Scope: 버전 히스토리)<br>• 인증 실패 시 도달 불가 (F023 가로챔) |
| **Next Navigation** | Admin Post Editor (신규/편집) / Admin Layout 다른 nav |

### Admin Post Editor (`/admin/posts/new`, `/admin/posts/{slug}/edit`)

> **Implemented Features:** `F020`, `F021`, `F022`, `F023` | **Menu Location:** Admin Posts List `[+ New Post]` 또는 행 클릭

| Item | Content |
|------|---------|
| **Role** | Tiptap WYSIWYG markdown 에디터로 Post 작성·편집. Save (draft 저장) / Publish (status=published) 분리. 모바일/외부에서 글 작성 가능하도록 함 |
| **Entry Path** | Admin Posts List `[+ New Post]` (`/admin/posts/new`) / 기존 글 행 클릭 (`/admin/posts/{slug}/edit`) |
| **User Actions** | frontmatter 메타 (title / summary / tags / date_published) 입력 → Tiptap 본문 작성 → toolbar (bold/italic/link/code/image) 사용 → 이미지 버튼 → R2 업로드 → `[Save]` (draft) 또는 `[Publish]` (published) 클릭 |
| **Key Features** | • frontmatter 폼: title / summary / tags (chip input) / date_published (date picker)<br>• 좌측 Tiptap 에디터 — markdown serialize 보장 (커스텀 JSX 컴포넌트 X, round-trip 안정 — F020)<br>• 상단 toolbar: bold / italic / link / inline code / image 업로드<br>• 우측 SSR-style preview — 입력한 markdown 을 본 사이트 Blog Detail 과 동일한 스타일로 렌더<br>• 이미지 toolbar 버튼 → file picker → `POST /admin/api/upload` (F022, F023) → R2 업로드 응답으로 받은 URL 을 본문에 `![alt](URL)` 자동 삽입<br>• `[Save]` 버튼 — D1 INSERT/UPDATE with `status='draft'` (F021)<br>• `[Publish]` 버튼 — D1 INSERT/UPDATE with `status='published'` + `date_published` 확정<br>• Save/Publish 성공 시 `search-index.json` 재생성 (F016 인덱스 갱신, R2 또는 KV 에 직렬화)<br>• Save/Publish 후 KV cache 무효화 (`post:{slug}:body:v*`)<br>• **Out of Scope (F020 명시)**: draft auto-save, scheduled publish |
| **Next Navigation** | Save 성공 → 같은 편집 화면 유지 (toast) / Publish 성공 → Admin Posts List 복귀 / 실패 → 인라인 에러 + 폼 유지 |

### Admin Media Library (`/admin/media`)

> **Implemented Features:** `F022`, `F023` | **Menu Location:** Admin Layout 좌측 nav

| Item | Content |
|------|---------|
| **Role** | R2 에 업로드된 모든 미디어 자산 목록. Project cover / Post 본문 이미지의 재사용 + 삭제 |
| **Entry Path** | Admin Layout 좌측 nav `/admin/media` / Admin Post Editor 의 "라이브러리에서 선택" (옵션) |
| **User Actions** | 그리드로 자산 훑기 → 파일 클릭 → 미리보기 + URL 복사 / 삭제 버튼 → 확인 후 R2 DELETE |
| **Key Features** | • R2 list objects (prefix `media/`) — `key` / `size` / `uploaded` 표시 (F022)<br>• 그리드 썸네일 + 파일 메타 (key, 업로드 일시, 크기)<br>• `[Copy URL]` — 본문 삽입용 public URL 복사<br>• `[Delete]` — R2 DELETE + 확인 모달 (참조 추적 없음, 사용자 책임)<br>• **Out of Scope**: Cloudflare Images 변환, 검색/태그, 사용처 추적 |
| **Next Navigation** | Admin Post Editor (URL 복사 후 복귀) / Admin Layout 다른 nav |

## Acceptance Criteria

> 핵심 9개 Feature(F003, F008, F009, F011, F016, F020, F021, F022, F023)에 대해 Given-When-Then 형식의 검증 가능 기준. TDD-First 원칙에 따라 각 항목은 테스트로 자동화 가능해야 한다. F020~F023 은 외부 노출 위험·데이터 정본 변경·인증 게이트 등 잘못되면 영향이 큰 영역이라 모두 AC 작성. 그 외 Feature(F001/F002/F004-F007/F010/F012-F019)는 콘텐츠/SEO/UI 표시 위주로, 별도 AC 없이 Page-by-Page Key Features의 bullet을 검증 기준으로 사용한다.

### F003 — PDF 저장 (CSS print)

- **AC-F003-1**: Given About 페이지에서 사용자가 `[⎙ PDF]` 버튼을 클릭한다 / When `window.print()` 다이얼로그가 열린다 / Then `@page { size: A4; margin: 0 }` 적용 + Topbar/Footer/검색트리거/토글이 시각적으로 숨겨진다(`display: none`).
- **AC-F003-2**: Given 본문에 OKLCH 색상이 포함된 섹션이 존재한다 / When 인쇄 미리보기를 본다 / Then `print-color-adjust: exact`가 적용되어 화면과 동일한 색이 유지된다(또는 sRGB로 자동 변환되어도 가독성 손상이 없다).
- **AC-F003-3**: Given 인쇄 미리보기가 열린 상태 / When 페이지 경계에 도달한다 / Then 섹션 헤딩(`h2`)이 페이지 하단에 고립되지 않는다(`break-after: avoid` 또는 `page-break-inside: avoid`).

### F008 — Contact Form

- **AC-F008-1**: Given 사용자가 `/contact`에서 이름·이메일·메시지(10자 이상)·의뢰 유형을 채우고 Turnstile을 통과한다 / When `submit` 클릭 / Then Resend API가 1회 호출되어 hello@tkstar.dev → 본인 메일이 발신되고, 제출자에게 자동응답 메일이 발송되며, 성공 화면이 표시된다.
- **AC-F008-2**: Given 이메일 필드가 RFC 5322 위반 형식("foo@", "foo.com" 등) / When `submit` 클릭 / Then 클라이언트 측에서 차단되어 인라인 에러 메시지가 표시되고 네트워크 요청이 발생하지 않는다.
- **AC-F008-3**: Given 메시지 길이가 10자 미만이거나 5000자를 초과한다 / When `submit` 클릭 / Then 인라인 에러 + 폼 상태 유지(입력값 손실 없음).
- **AC-F008-4**: Given Resend API가 5xx 또는 네트워크 오류로 실패한다 / When 응답 수신 / Then 에러 토스트 + `mailto:hello@tkstar.dev?subject=...&body=...` 폴백 링크가 노출된다(폼 입력값을 mailto body에 prefill).

### F009 — Contact 스팸 방지 (Turnstile)

- **AC-F009-1**: Given Contact 폼이 마운트된다 / When Turnstile 위젯이 렌더된다 / Then `cf-turnstile-response` 토큰이 폼 상태에 바인딩되고, 토큰이 비어있으면 submit 버튼이 비활성화된다.
- **AC-F009-2**: Given 클라이언트가 위조한 토큰을 함께 submit / When 서버가 `https://challenges.cloudflare.com/turnstile/v0/siteverify`에 검증 요청 / Then `success: false`를 받아 400 응답 + Resend 호출이 일어나지 않는다.
- **AC-F009-3**: Given 동일 IP가 1시간 내 5회 이상 submit한다 / When 6번째 submit / Then 서버가 429 응답 + "잠시 후 다시 시도해주세요" 메시지(Workers KV 또는 DO 기반 rate-limit).

### F011 — SSR + 동적 OG 이미지

- **AC-F011-1**: Given `/blog/[slug]` 또는 `/projects/[slug]`의 OG 이미지 URL을 요청한다 / When Satori가 frontmatter(title/date/tags)로 PNG를 생성 / Then 1200×630 PNG + `Content-Type: image/png` + `Cache-Control: public, max-age=31536000, immutable` 응답.
- **AC-F011-2**: Given 존재하지 않는 slug에 대한 OG 요청 / When 리소스 라우트 핸들러 실행 / Then 404가 아니라 default fallback PNG(브랜드 로고 + "tkstar.dev")를 반환한다.
- **AC-F011-3**: Given Satori 렌더링이 실패한다(폰트 binary 누락 등) / When 응답 생성 / Then 정적 fallback PNG로 graceful degradation + Workers logs에 에러 기록.

### F016 — Cmd+K Command Palette

- **AC-F016-1**: Given 페이지에 입력 포커스가 없다 / When 사용자가 ⌘K(macOS) 또는 Ctrl+K(Win/Linux) 또는 `/`를 입력 / Then palette가 열리고 검색 input에 자동 포커스된다.
- **AC-F016-2**: Given input/textarea/contenteditable에 포커스가 있다 / When 위 단축키 입력 / Then palette가 열리지 않고 기본 입력 동작이 유지된다.
- **AC-F016-3**: Given palette가 열린 상태 + 검색어 "rou nav" 입력 / When 토큰 기반 필터 실행 / Then "rou"와 "nav"를 모두 포함하는 항목만 그룹 헤더(pages/projects/posts) 별로 표시된다.
- **AC-F016-4**: Given 결과 리스트 / When ↓ ↑로 네비 + ↵로 진입 + Esc로 닫기 / Then 키보드만으로 모든 동작이 수행되고, 마우스 호버로 선택 인덱스가 동기화된다.
- **AC-F016-5**: Given 사이트가 처음 로드된다 / When 검색 인덱스 fetch / Then 인덱스 JSON은 gzip 100KB 이하 + 본문(body)을 포함하지 않으며 세션당 1회만 fetch된다.

### F020 — Admin Editor (Tiptap WYSIWYG, markdown only)

- **AC-F020-1**: Given Admin Post Editor 신규 모드(`/admin/posts/new`) / When Tiptap toolbar 의 [bold] 클릭 → 텍스트 입력 → `[Save]` 클릭 / Then D1 `posts` 테이블에 `status='draft'` 레코드가 INSERT 되고, `raw_markdown` 필드는 `**...**` 형태의 순수 markdown 으로 직렬화된다(커스텀 JSX 컴포넌트 또는 HTML 미포함).
- **AC-F020-2**: Given Admin Post Editor 에서 toolbar 의 image 버튼 클릭 → 파일 선택 / When 파일이 `POST /admin/api/upload` 로 전송되어 R2 업로드 성공(F022) / Then 본문 커서 위치에 `![{fileName}]({R2 public URL})` 마크다운이 자동 삽입되고, 우측 preview 에 즉시 이미지가 렌더된다.
- **AC-F020-3**: Given draft 상태의 기존 Post 편집 화면 / When `[Publish]` 클릭 / Then D1 UPDATE 로 `status='published'` + `date_published` (입력값 또는 now) + `updated_at=now` 가 반영되고, 동일 트랜잭션 외부에서 `search-index.json` 이 R2/KV 에 재생성되며, KV cache 키 `post:{slug}:body:v*` 가 무효화된다.
- **AC-F020-4**: Given 좌측 markdown 입력 / When 우측 preview 가 렌더 / Then preview 는 본 사이트 Blog Detail (F007) 과 **동일한 컴파일러·스타일** 로 렌더되어 round-trip 일관성을 보장한다(에디터에서 본 모습 = 실제 발행 모습).
- **AC-F020-5**: Given 인증되지 않은 사용자가 `/admin/posts/new` 직접 접근 시도 / When 요청이 Cloudflare Access 게이트 통과 전 / Then Workers 코드는 실행되지 않고(F023) GitHub OAuth 로그인 화면으로 리다이렉트된다.

### F021 — D1 Post Storage

- **AC-F021-1**: Given Drizzle 마이그레이션 적용 후의 빈 D1 / When 마이그레이션 스크립트가 기존 `content/posts/*.mdx` 를 읽어 INSERT / Then 모든 기존 Post 가 `status='published'` + `date_published` (frontmatter 기준) + `raw_markdown` (frontmatter 제외 본문) 으로 이관되며, slug 중복 INSERT 시 fail-fast (마이그레이션 스크립트 abort).
- **AC-F021-2**: Given D1 에 `slug='hello-world'`, `status='published'` 레코드 / When 방문자가 `/blog/hello-world` 진입 / Then SSR 핸들러가 `raw_markdown` 을 런타임 컴파일하여 MDX-like AST 로 렌더하고, KV cache (`post:hello-world:body:v{updated_at-hash}`) 에 컴파일 결과 저장 — 다음 요청은 캐시 hit.
- **AC-F021-3**: Given D1 에 `status='draft'` 레코드 / When 익명 방문자가 해당 slug 로 `/blog/{slug}` 진입 / Then 404 (Not Found Fallback) 응답. draft 는 Admin Layout 경로 (`/admin/posts/{slug}/edit`) 로만 접근 가능하다.
- **AC-F021-4**: Given listPosts 호출 (Blog Page F006 로더) / When D1 SELECT 실행 / Then `WHERE status='published' ORDER BY date_published DESC` 결과만 반환되며 draft 는 Blog 목록·RSS·sitemap·search index 모두에서 제외된다.
- **AC-F021-5**: Given Post UPDATE 가 일어난다 / When `updated_at` 변경 / Then KV 캐시 키의 버전 해시가 자동으로 바뀌어(`v{new-hash}`) 이전 캐시 항목은 다음 SSR 요청에서 hit 되지 않는다(자연 invalidation, TTL 의존 X).

### F022 — R2 Media

- **AC-F022-1**: Given Admin Post Editor 에서 image 업로드 트리거 / When `POST /admin/api/upload` 가 multipart/form-data 로 파일 전송 / Then Workers 가 `media/{yyyy}/{mm}/{nanoid}.{ext}` 키로 R2 PUT 후 `{ url, key }` JSON 응답하며, `nanoid` 는 21자 url-safe (slug 충돌 방지).
- **AC-F022-2**: Given Cloudflare Access 미인증 요청 / When `POST /admin/api/upload` 호출 / Then Cloudflare Access 게이트에서 차단되어 Workers 도달 X (F023). 헤더 위조로 Workers 직접 호출되더라도 `Cf-Access-Jwt-Assertion` JWT 검증 실패 → 401.
- **AC-F022-3**: Given Project frontmatter 의 `cover` 필드가 D1 `project_meta.cover_image_url` 로 이관된 상태 / When Project Detail (F005) 또는 Home Featured (F017) 가 cover 표시 / Then D1 SELECT 한 URL 을 사용하며, MDX frontmatter 의 cover 필드는 더 이상 읽히지 않는다(이중 정본 방지).
- **AC-F022-4**: Given Admin Media Library 에서 자산 `[Delete]` 클릭 → 확인 / When R2 DELETE 실행 / Then R2 에서 객체가 사라지고 목록에서 제거되지만, 본문에서 해당 URL 을 참조하는 Post/Project 가 있더라도 자동 추적·교체는 일어나지 않는다(사용자 책임 — 명시적 Out of Scope).

### F023 — Cloudflare Access (Zero Trust)

- **AC-F023-1**: Given `/admin/*` path application 이 Cloudflare Access 에 등록되고 GitHub OAuth IdP + 본인 email allowlist 가 설정된 상태 / When 익명 사용자가 `/admin/posts` 접근 / Then Cloudflare Access 가 가로채 GitHub OAuth 로그인 페이지로 리다이렉트, Workers 코드는 호출되지 않는다.
- **AC-F023-2**: Given 본인이 GitHub OAuth 로그인 성공 / When `/admin/posts` 재요청 / Then 요청 헤더에 `Cf-Access-Authenticated-User-Email: 86tkstar@gmail.com` + `Cf-Access-Jwt-Assertion: <JWT>` 가 포함되어 Workers 도달, Workers 가 JWT 서명을 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 의 공개키로 검증하여 통과시킨다.
- **AC-F023-3**: Given 위조된 `Cf-Access-Authenticated-User-Email` 헤더 + 누락/위조된 JWT 로 직접 Workers 호출 시도 / When Workers 의 access-guard 미들웨어 실행 / Then JWT 검증 실패 → 401 응답, D1/R2 작업 모두 차단.
- **AC-F023-4**: Given Cloudflare Access 가 설정 누락(또는 일시 장애)로 헤더가 비어있는 상태 / When `/admin/*` 요청 도달 / Then Workers 는 fail-closed — 요청을 거부 (500 또는 401), 본인 1명 인증이 보장되지 않으면 절대 admin 동작 수행 X.
- **AC-F023-5**: Given JWT 공개키 fetch 가 매 요청 발생하면 latency·요금 증가 / When Workers 가 첫 admin 요청 처리 / Then 공개키를 in-memory 또는 Workers Cache API 로 1시간 단위 캐시하여 후속 요청은 fetch 생략한다.

---

## Assumptions Register

> PRD 곳곳에 분산된 `[ASSUMPTION]` 태그를 한 곳에 모아 **해소 게이트**(어느 ROADMAP 단계까지 구체화되어야 하는지)와 함께 관리한다. 게이트 통과 시 해당 가정을 PRD 본문에서 [FACT]로 갱신하거나 제거한다.

| ID | 위치 | 가정 내용 | 해소 게이트 | 해소 시점 |
|----|------|-----------|-------------|-----------|
| A001 | About Page Key Features | 자격증 데이터 추가 시 별도 카드 | F002 구현 PR | About 데이터 모델 확정 시 |
| A002 | Project Detail Key Features | on-this-page TOC는 rehype-toc 또는 velite 후처리로 자동 추출 | F005 구현 PR | velite 도입 PR(Phase 2) |
| A003 | App Terms / App Privacy | 약관/처리방침 표준 메타(version/effective_date 외) | F014 구현 PR | 첫 앱(`moai`) 등록 시 |
| A004 | Not Found Fallback | React Router v7 splat(`*`) 또는 ErrorBoundary 구현 방식 | F018/F019 구현 시 | Phase 1(라우팅 스켈레톤) |
| A005 | Tech Stack — JetBrains Mono | Satori OG에서 폰트 binary fetch 경로 | F011 구현 PR | Satori 도입 시 |
| A006 | Tech Stack — Content Pipeline | velite / shiki / Satori / Zod 미설치 → 작업 시 `bun add -D ...` | velite 도입 PR(Phase 2) | Phase 2 시작 시 일괄 |
| A007 | Tech Stack — Search Index | 별도 검색 라이브러리 없이 includes/score 단순 검색 | F016 구현 PR | 데이터 규모 증가 시 재검토 |
| A008 | Tech Stack — SEO | 검색엔진 verification 토큰은 wrangler secrets put으로 주입 | F019 구현 PR | 배포 후 토큰 발급 시 |
| A009 | Tech Stack — Email | React Email / Resend / Turnstile 미설치 + 환경변수 필요 | F008/F009 구현 PR | Phase 3 Contact 작업 시 |
| A010 | Tech Stack — Hosting | 도메인 등록 채널(CF Registrar / Porkbun) 미정 | 배포 PR 직전 | DNS 작업 시점 |
| A011 | F019 — Bing | Bing Webmaster Tools는 MVP 후 등록 | MVP 완료 후 | 운영 안정화 후 |
| A012 | Deferred — Motion | Motion 라이브러리는 추후 인터랙션 보강 시 재검토 | MVP 완료 후 | 사용자 피드백 수집 후 |
| A013 | About Page Career — solo 통합 | 경력 timeline에 회사 재직 + solo 프로젝트를 통합. solo entry는 velite project frontmatter의 신규 필드(예: `about_career_role`, `about_career_period`) 끌어오기. `CareerEntry` 타입은 `type: "company" \| "solo"` discriminated union | 후속 운영 PR (T012 이후 또는 T011 follow-up) | 회사 경력 1건 이상 + solo 프로젝트 데이터 입력 시점 |
| A014 | F020 — Tiptap markdown serializer | Tiptap 의 markdown serialize 는 공식 starter-kit 만으로는 부족. 후보: ① 공식 `@tiptap/markdown` (Tiptap v3 전용, 활발히 유지) ② `tiptap-markdown` (커뮤니티, v2 호환, 메인테이너가 v3 후 신규 PR 처리 X — fork 권장) ③ 자체 serializer. **Tiptap 메이저 버전 (v2 vs v3) 결정과 묶임** — 어느 조합 채택할지 미정 | F020 구현 PR | CMS Phase 시작 시 |
| A015 | F021 — Runtime MDX compiler | D1 의 `raw_markdown` → SSR 런타임 컴파일에 `mdx-bundler` / `next-mdx-remote` 류 또는 자체 마크다운→React 컴파일러 채택 미정. shiki 코드블록 highlight 도 런타임 적용 가능 여부 검증 필요 | F021 구현 PR | CMS Phase Read path 작업 시 |
| A016 | F021 — KV cache key 해싱 알고리즘 | `post:{slug}:body:v{updated_at-hash}` 의 `hash` 알고리즘 (sha256 truncate / xxhash 등) 미정 | F021 구현 PR | KV cache 도입 시 |
| A017 | F022 — R2 public read 방식 | R2 public bucket URL 직접 노출 vs Workers 라우트로 proxy 서빙 둘 중 선택 미정. 비용·캐시·헤더 제어 트레이드오프 검토 필요 | F022 구현 PR | R2 bucket 생성 시 |
| A018 | F022 — Project meta 분리 schema | `project_meta` 테이블의 정확한 컬럼 (`slug` PK + `cover_image_url` + `cover_alt` 만? `featured` 도 옮길지?) 미정. velite frontmatter ↔ D1 동기화 책임 위치 미정 | F022 구현 PR (Project 메타 이관 task) | 첫 Project 메타 D1 이관 시 |
| A019 | F023 — Cloudflare Access 팀 도메인 | `<team>.cloudflareaccess.com` 의 team subdomain 미발급. Free 플랜으로 충분한지 검증 필요 | F023 구현 PR | Cloudflare Zero Trust 활성화 시 |
| A020 | F020 — search-index.json 저장 위치 | Save/Publish 트리거 인덱스 재생성 산출물의 저장 위치 — R2 (현 정적 자산 패턴과 일치) vs KV (저지연 read 우선) 미정 | F020 구현 PR | search-index.json 재빌드 task |
| A021 | F021 — Drizzle ORM 버전 pin | Drizzle ORM 의 메이저 버전 결정 미정. 현재 `0.44.x` 가 stable 이며 `v1.0` 출시 예정. D1 dialect (sqliteTable) 호환·typegen 안정성·drizzle-kit 호환을 함께 검증 필요. (development-planner hand-off Issue #4) | F021 구현 PR | Phase 7.1 D1 셋업 시점 (T024) |

> **운용 규칙**: 새 `[ASSUMPTION]` 태그를 PRD 본문에 추가할 때는 반드시 본 표에 ID와 해소 게이트를 함께 등록한다. ROADMAP의 각 phase 종료 시점에 본 표를 점검하여 해당 phase가 게이트인 항목이 모두 [FACT]로 전환됐는지 확인한다.

---

## Data Model

> **콘텐츠 분리 정책**: Project / AppLegalDoc 은 **velite + MDX 정적 컬렉션 스키마**(frontmatter Zod 검증, 빌드 타임 정적 JSON 번들). Post 는 **Cloudflare D1 SQLite 테이블**(F021, Drizzle ORM). Project 의 cover 메타만 D1 의 `project_meta` 테이블로 분리(F022). 명명은 design 정본(`docs/design-system/proto/data.jsx`) + 본 PRD 의 글로서리 표(`docs/glossary.md`) 와 1:1 매핑된다.

### Project (프로젝트 Case Study 콘텐츠 — velite + MDX 유지)

| 필드 | 타입 | 비고 |
|------|------|------|
| `slug` | string | URL 경로용 고유 식별자 |
| `title` | string | 프로젝트명 |
| `summary` (alias `lede`) | string | 한 줄 요약 |
| `date` | string (YYYY-MM 또는 ISO) | 프로젝트 시기 (design은 `YYYY-MM` 사용) |
| `tags` | string[] | 분류 태그 |
| `stack` | string[] | 사용 기술 (사이드바 stack pills + 행 리스트의 stack pills) |
| `metrics` | [string, string][] | 결과 지표 키-값 쌍 (예: `["MAU", "12k"]`) |
| `featured` | boolean (optional) | Home Featured 섹션 노출 여부 (`true`인 첫 항목 사용) |
| `cover` | string (optional) | **D1 store (F022 이후)** — `project_meta.cover_image_url` 로 이관. 이관 후 frontmatter 의 cover 필드는 deprecation, MDX 본문 자체는 그대로 유지 |
| `cover_alt` | string (optional) | **D1 store (F022 이후)** — `project_meta.cover_alt`. 신규 필드로 D1 에서만 관리 |
| `body` | MDX | 본문 — 내부에 problem / approach / results 섹션을 작성. frontmatter 필드 아님 |

### Post (블로그 글 콘텐츠 — Cloudflare D1 backed, F021)

> **저장소**: Cloudflare D1 (SQLite, edge-native), Drizzle ORM 으로 액세스. velite 컬렉션에서 제거되어 일회성 마이그레이션 스크립트로 기존 `content/posts/*.mdx` → D1 INSERT.

| 필드 | 타입 | 비고 |
|------|------|------|
| `id` | integer (PK, autoincrement) | D1 내부 식별자 |
| `slug` | string (UNIQUE) | URL 경로용 |
| `title` | string | 글 제목 |
| `summary` (alias `lede`) | string | 한 줄 요약 |
| `raw_markdown` | text | 본문 markdown 원본 (frontmatter 제외). SSR 런타임 컴파일 + KV cache (`post:{slug}:body:v{updated_at-hash}`) 로 렌더 |
| `tags` | text (JSON array) | 분류 태그 — `JSON.stringify(string[])` 으로 직렬화 |
| `date_published` | string (ISO) | 발행일 (draft 단계에선 nullable) |
| `status` | enum: `'draft' \| 'published'` | F020 Save 는 `draft`, Publish 는 `published`. 익명 사용자는 `published` 만 노출 |
| `created_at` | string (ISO) | INSERT 시각 |
| `updated_at` | string (ISO) | UPDATE 시각 (KV cache 키 해시 입력) |

### ProjectMeta (Project 의 D1 backed 메타 — F022)

> **저장소**: Cloudflare D1, Drizzle ORM. velite Project 의 `cover` 필드 분리 산출물. velite Project 본문 MDX 자체는 그대로 유지.

| 필드 | 타입 | 비고 |
|------|------|------|
| `slug` | string (PK) | velite Project 의 `slug` 와 1:1 매핑 |
| `cover_image_url` | string (nullable) | R2 public URL (`media/{yyyy}/{mm}/{nanoid}.{ext}`) 또는 외부 URL |
| `cover_alt` | string (nullable) | 접근성용 alt 텍스트 |
| `updated_at` | string (ISO) | UPDATE 시각 |

### MediaAsset (R2 업로드 자산 메타 — F022)

> **저장소**: R2 자체가 정본. 별도 D1 테이블 없이 R2 list objects API 로 조회 (`Admin Media Library` 가 직접 R2 query). 본 항목은 응답 형태 정의용 인메모리 모델.

| 필드 | 타입 | 비고 |
|------|------|------|
| `key` | string | R2 object key (`media/{yyyy}/{mm}/{nanoid}.{ext}`) |
| `url` | string | public read URL (R2 public bucket 또는 Workers proxy 라우트) |
| `size` | number (bytes) | R2 metadata |
| `uploaded` | string (ISO) | R2 metadata |

### AccessIdentity (Cloudflare Access 인증 컨텍스트 — F023)

> **저장소**: 영속 저장 X. 매 요청마다 Cloudflare Access 헤더에서 추출하는 인메모리 값. Workers 자체 세션·쿠키 코드 없음.

- `email`: string — `Cf-Access-Authenticated-User-Email` 헤더 값. 본인 1명 allowlist 와 비교
- `jwt`: string — `Cf-Access-Jwt-Assertion` 헤더 값. `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 의 공개키로 서명 검증

### AppLegalDoc (앱별 약관/개인정보처리방침 콘텐츠)

| 필드 | 타입 | 비고 |
|------|------|------|
| `app_slug` | string | 앱 식별자 (`moai` 등) |
| `doc_type` | `"terms" \| "privacy"` | 문서 유형 |
| `version` | string | 버전 표기 |
| `effective_date` | string (ISO) | 발효일 (terms) / 시행일 (privacy) |
| `body` | MDX | 본문 |

### ContactSubmission (Contact Form 1회성 인메모리 페이로드, 영속 저장 없음)

- `name`, `company`(optional), `email`, `inquiry_type`("B2B" | "B2C" | "etc"), `message`, `turnstile_token`

### ThemePreference (브라우저 localStorage 키 — F010 전용)

- key: `proto-theme`, value: `"dark" | "light"` (시스템 추종이 기본, 강제 전환 시에만 저장)

## Tech Stack (Latest Versions)

### Frontend Framework

- **React Router 7.14.0 (Framework mode, SSR)** — 정적 콘텐츠도 SEO/OG 미리보기를 위해 SSR 사용
- **TypeScript 5.9.3** — 타입 안정성
- **React 19.2.4 / React DOM 19.2.4** — UI 라이브러리

### Styling & UI

- **TailwindCSS 4.2.2** (`@tailwindcss/vite` 4.2.2)
  - 디자인 토큰은 design 정본(`docs/design-system/styles.css` `:root`)을 Tailwind v4 `@theme { --color-*, --font-* }` 블록으로 이식
  - **다크모드: `[data-theme='dark|light']` HTML 속성 셀렉터 전략** (Tailwind v4 클래스 전략 X). `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))` 커스텀 변형 정의
  - 색상 함수: `oklch()` / `color-mix(in oklab, ...)` native 사용 (모던 브라우저만 타깃)
  - `backdrop-filter: blur(...)` 사용 (Topbar / Palette backdrop)
- **CSS-only 애니메이션** — `@keyframes blink/fade` + `transition: all 120ms ease`. Motion 라이브러리는 MVP 보류 (Deferred 참고)

### Typography

- **JetBrains Mono** — primary mono 폰트 (전 페이지 본문/UI/코드)
- **Self-host 권장** — `/public/fonts/JetBrainsMono-*.woff2` + CSS `@font-face`로 자가 호스팅 (Cloudflare Workers + SSR 환경에서 CDN race condition / FOIT/FOUT 방지)
- design 정본의 `Gaegu` / `Caveat` 임포트는 **drop** (와이어프레임 단계에서만 사용)
- Satori OG 이미지 렌더링 시 `JetBrainsMono-Regular.ttf` binary asset을 fetch/import 형태로 전달 [ASSUMPTION: assets fetch 경로는 구현 단계에서 결정]

### Content Pipeline

- **velite 0.3.1** — MDX 컬렉션 빌더 (**F021 이후 Project / AppLegalDoc 만**, Post 는 D1 으로 분리)
- **MDX** — 콘텐츠 작성 포맷 (Project / AppLegalDoc). Post 는 raw markdown 으로 D1 에 저장 후 SSR 런타임 컴파일
- **shiki 4.0.2 + @shikijs/rehype 4.0.2** — 빌드 타임 코드블록 highlight (Project / AppLegalDoc). Post 는 동일 highlighter 를 런타임에 호출 (F021 컴파일러 결정과 연동)
- **Satori** — 빌드 타임/SSR 동적 OG 이미지 생성 (1200×630 표준)
- **Zod 4.3.6** — frontmatter 스키마 검증 (velite collection)
- **rehype-slug 6.0.0** + **github-slugger 2.0.0** — on-this-page TOC 의 anchor id 1:1 매칭 (한국어 anchor 지원)

### Search Index (F016)

- **`public/search-index.json`** — `{slug, title, summary, tags}` 만 포함하는 클라이언트 사이드 토큰 검색 인덱스. **두 가지 트리거로 빌드**:
  1. **빌드 타임** (Project / AppLegalDoc) — velite collection 후처리로 생성
  2. **런타임** (Post) — Admin Editor (F020) 의 Save / Publish 시 D1 의 published Post 와 머지하여 R2 또는 KV 에 재생성 [ASSUMPTION: A020 — 저장 위치 미정]
- 별도 검색 라이브러리 없이 단순 includes/score (데이터 규모 작음). `/admin/*` 경로는 인덱스 제외

### SEO & Indexing

- **sitemap.xml / robots.txt** — React Router v7 resource route로 동적 생성 (별도 라이브러리 불필요). `BuildSitemap.service`가 velite collection을 읽어 index 가능 페이지만 출력
- **JSON-LD Structured Data** — `<script type="application/ld+json">` 직접 삽입. schema.org 표준 (Person, BlogPosting, CreativeWork/SoftwareSourceCode, BreadcrumbList)
- **Meta Tags (per-page)** — React Router v7 `meta` export로 페이지별 `<title>`, `description`, `canonical`, OG, Twitter Card 정의
- **Search Engine Verification** — `GOOGLE_SITE_VERIFICATION` / `NAVER_SITE_VERIFICATION` 환경변수로 root layout `<head>` 조건부 렌더 [ASSUMPTION: 배포 후 Search Console / Naver Search Advisor에서 토큰 발급 → wrangler secrets put으로 주입]
- **Indexing Policy** — App Terms/App Privacy는 `noindex, follow` (앱 심사용 URL 접근 허용, 검색엔진 분산 방지), Not Found Fallback은 `noindex, nofollow`. canonical은 모든 페이지 유지

### Forms & Email

- **React Email** — Contact 자동응답 메일 템플릿 [ASSUMPTION: 미설치]
- **Resend** — Contact form 발신 (hello@tkstar.dev → 본인 메일, 제출자 자동응답 메일). 월 3,000건 무료 [ASSUMPTION: 미설치, 환경변수 `RESEND_API_KEY` 필요]
- **Cloudflare Turnstile** — Contact form 스팸 방지. Workers 친화 [ASSUMPTION: 클라이언트 위젯 + 서버 검증, 환경변수 `TURNSTILE_SECRET` 필요]

### CMS — Editor (F020)

- **Tiptap** — `/admin/posts/{new,edit}` 의 좌측 WYSIWYG 에디터. **markdown serialize 전제**(커스텀 JSX 컴포넌트 X — round-trip 안정) [ASSUMPTION: A014 — 미설치. Tiptap 메이저 버전 (v2 vs v3) + 마크다운 직렬화 라이브러리 (공식 `@tiptap/markdown` 또는 커뮤니티 `tiptap-markdown`) 조합 미정]
- **Tiptap toolbar** — bold / italic / link / inline code / image 5개. image 클릭 시 file picker → `POST /admin/api/upload` → 응답 URL 을 `![alt](URL)` 로 본문 삽입
- **Runtime markdown → React 컴파일러** — Blog Detail (F007) 과 동일한 컴파일러로 SSR 렌더 [ASSUMPTION: A015 — `mdx-bundler` / `next-mdx-remote` 또는 자체 컴파일러 미정. shiki 런타임 highlight 호환성 검증 필요]

### CMS — Storage (F021)

- **Cloudflare D1** — Post 정본 SQLite 데이터베이스 (edge-native). Workers binding `DB` [ASSUMPTION: 미바인딩, `wrangler.toml` 에 `[[d1_databases]]` 추가 필요]
- **Drizzle ORM** + **drizzle-kit** — D1 호환 ORM + migration 도구 [ASSUMPTION: 미설치, `bun add drizzle-orm` / `bun add -D drizzle-kit` 필요]
- **Workers KV** — D1 raw_markdown 의 컴파일 결과 캐시. Workers binding `POSTS_CACHE_KV`. cache 키 패턴 `post:{slug}:body:v{updated_at-hash}` [ASSUMPTION: A016 — 해싱 알고리즘 (sha256 truncate / xxhash 등) 미정]
- **One-shot migration script** — `scripts/migrate-posts-to-d1.ts` (가칭). 기존 `content/posts/*.mdx` frontmatter + 본문을 파싱해 D1 INSERT. slug 충돌 시 fail-fast [ASSUMPTION: 마이그레이션 PR 단계에서 작성]

### CMS — Media (F022)

- **Cloudflare R2** — 미디어 객체 저장소. Workers binding `MEDIA_BUCKET` [ASSUMPTION: 미바인딩, `wrangler.toml` 에 `[[r2_buckets]]` 추가 필요]
- **R2 클라이언트** — 후보 3개 (ROADMAP T023 PoC 후 T033 결정): (a) **R2 Workers binding** 1순위 (`MEDIA_BUCKET.put/get/delete/list`, 의존성 0, R2 전용) / (b) `aws4fetch` 2순위 (~2.5KB, 다른 S3 호환 서비스 이식 시) / (c) `@aws-sdk/client-s3` 3순위 (~500KB — `wrangler.toml` 에 이미 활성된 `compatibility_flags = ["nodejs_compat"]` 로 `node:fs`/`node:stream` import-time 에러 polyfill 처리 → 동작 가능. 단 multipart upload / streaming response 등 sdk 고유 기능이 진짜 필요할 때만 채택) [ASSUMPTION: A017 → 미설치, T033 결정 후 1개만 `bun add`]
- **`nanoid`** — 파일 키의 url-safe 21자 식별자 (`media/{yyyy}/{mm}/{nanoid}.{ext}`). slug 충돌·예측 공격 방지 [ASSUMPTION: 미설치, `bun add nanoid` 필요]
- **R2 public read** — public bucket URL 직접 노출 vs Workers proxy 라우트 — 트레이드오프 미정 [ASSUMPTION: A017 — 결정 시점 = R2 bucket 생성 PR]

### CMS — Auth (F023)

- **Cloudflare Access (Zero Trust)** — `/admin/*` path application 단위 보호. **Free 플랜 본인 1명 email allowlist** [ASSUMPTION: A019 — 팀 도메인 미발급, Free 플랜 적용 가능 여부 검증 필요]
- **Identity provider**: GitHub OAuth — Cloudflare Zero Trust 콘솔에서 IdP 연결
- **JWT verifier (Workers 측)** — `Cf-Access-Jwt-Assertion` 헤더 검증용 (예: `jose` 라이브러리). 공개키 fetch 후 Workers Cache API 로 1시간 캐시 [ASSUMPTION: 라이브러리 선택 미정, `bun add jose` 후보]
- **자체 세션·쿠키·비밀번호 코드 없음** — Cloudflare Access 가 단일 인증 게이트. 헤더 부재 시 fail-closed (401)

### Hosting / Edge / Email Routing

- **Cloudflare Workers (SSR)** — `wrangler 4.85.0`, `@cloudflare/vite-plugin 1.33.2`로 배포
- **Cloudflare Email Routing** — 수신: `hello@tkstar.dev` → 개인 Gmail forward (무료)
- **Cloudflare Web Analytics** — 쿠키 없는 분석 스니펫
- **도메인** — `tkstar.dev` (Cloudflare Registrar 또는 Porkbun → CF transfer) [ASSUMPTION: 등록 채널은 사용자가 결정]

### Build / Dev / Quality

- **Vite 8.0.3** — 번들러
- **@vitejs/plugin-react 6.0.1** — React 플러그인
- **Vitest 4.1.5** + **jsdom 29.1.0** + **@testing-library/react 16.3.2** + **@testing-library/jest-dom 6.9.1** + **@testing-library/dom 10.4.1** — 테스트 (TDD-First, Clean Architecture 4-layer 적용)
- **Biome 2.4.13** — Lint & Format
- **isbot 5.1.36** — 봇 판별 (SSR 분기)

### Package Management

- **bun** — 의존성 관리 (`bun.lock` 사용)

### Implementation Notes (design ↔ production 갭)

- design 정본(`prototype.html` + `proto/*.jsx`)은 **React 18 + babel-standalone IIFE 환경** 가정으로 작성됨 (`window.X` 글로벌 패턴). production 빌드에 그대로 import 불가 — **React Router v7 ESM 모듈 + React 19 컴포넌트로 포팅 필요**.
- design `design-canvas.jsx`(31KB) / `tweaks-panel.jsx`(18KB)는 **디자이너 작업용 운영 도구**(Figma-ish 캔버스 + 라이브 트윅 패널, omelette 호스트 의존). **사용자 노출 X, production 번들에 포함하지 않음**.
- design `components/*.jsx`(home V1/V2/V3, terminal 등)는 **와이어프레임 변형 모음**. 정본은 `proto/*` 쪽이며 그 외 변형은 폐기 또는 참조 자료.
- design `terminal.css` + `components/terminal.jsx`(`TermWindow` chrome)는 **폐기됨** — 정본의 `prototype.css`(`.topbar` / `.foot`)로 대체.

---

## Consistency Validation (Web)

### Step 1: Feature Specs → Page Connection
- F001 → Home / F002, F003 → About / F004 → Projects / F005 → Project Detail / F006 → Blog / F007 → Blog Detail / F008, F009 → Contact / F010 → All Pages / F011 → Project Detail, Blog Detail / F012 → Blog (RSS) / F013 → All Pages / F014 → Legal Index, App Terms, App Privacy / F016 → All Pages (root layout, /admin/* 제외) / F017 → Home / F018 → All Pages (차등 인덱싱 정책 — App Terms/Privacy noindex,follow / 404 noindex,nofollow / /admin/* noindex,nofollow) / F019 → All Pages (root layout)
- **F020** → Admin Posts List, Admin Post Editor / **F021** → Blog List, Blog Detail, Admin Posts List, Admin Post Editor / **F022** → Admin Media Library, Project Detail, Admin Post Editor / **F023** → Admin Layout (모든 /admin/* 라우트의 게이트). 모두 매핑됨.

### Step 2: Menu Structure → Page Connection
- Header(Brand→Home, 검색트리거→F016, 토글→F010), Footer(GitHub/X/RSS/Contact/Legal Index), Cmd+K palette(F016), 콘텐츠 내부(Project Detail / Blog Detail / Legal Index / App Terms / App Privacy / Not Found Fallback) 모두 Page-by-Page에 정의됨.
- **🔒 Admin 블록** (Cloudflare Access 보호) → Admin Layout / Admin Posts List / Admin Post Editor / Admin Media Library. `/admin/api/upload` 는 UI 없는 internal endpoint 로 F022 Key Features 안에 흡수 — 별도 페이지 항목 X (정합성 유지).

### Step 3: Page-by-Page → Back-reference
- 모든 페이지의 Implemented Features는 Feature Specifications에 정의됨. 일반 페이지는 palette(F016) 또는 콘텐츠 내부 링크로 도달 가능. App Terms/Privacy는 chrome-free + Legal Index/앱 내부 링크 경유.
- **Admin 페이지 4종**(Layout / Posts List / Post Editor / Media Library) 은 palette·topbar·footer 모두 비노출. 본인 1명이 직접 URL 입력 → Cloudflare Access (F023) 통과 후 Admin Layout 좌측 nav 로만 도달.

### Step 4: Missing & Orphan
- Feature Specs에만 있고 페이지에 없는 항목: 없음.
- 페이지에만 있고 Feature Specs에 없는 항목: 없음.
- 메뉴에만 있고 페이지가 없는 항목: 없음 (`/admin/api/upload` 는 internal endpoint 로 F022 안에 흡수).
- F018, F019는 root layout 마운트 패턴(F016과 동일)으로 모든 페이지에 매핑됨 — Missing/Orphan 없음.
- F018의 차등 인덱싱 정책은 페이지 Key Features에 명시되어 있어 정합성 유지 (`/admin/*` noindex,nofollow 추가).
- **F020 Save/Publish 의 search-index.json 재생성** 은 F016 Search Index 정의와 cross-reference 됨 — Tech Stack `Search Index (F016)` 섹션의 "런타임 트리거" 항목으로 명시.
- **F022 Project 메타 D1 이관** 은 Data Model 의 Project 표 cover/cover_alt 행 + 신규 ProjectMeta 테이블 + Project Detail (F005) Key Features 에서 cross-reference 됨.

### Step 5–6 (Medium ONLY)
- Small scale. 일반 사용자 인증은 여전히 없음. 본인 1명 admin 인증만 Cloudflare Access (F023) 위임 — Workers 자체 권한 매트릭스 없음 → Medium-only 섹션 해당 없음.
