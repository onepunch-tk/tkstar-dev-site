# tkstarDev PRD

> **생성일**: 2026-05-13 | **플랫폼**: Web | **문서 버전**: 2.0 | **작성자**: prd-generator

---

## 1. 프로젝트 개요 (Project Overview)

### 1.1 목적 (Purpose)
1인 기업(개발자)의 개인 브랜드 웹사이트로, 사이트 자체가 이력서 역할을 하며 B2B(기업/HR) 채용 제안과 B2C(프리랜서 플랫폼) 의뢰 모두를 단일 도메인(tkstar.dev)에서 수렴시킨다. 주 네비게이션은 검색 중심(Cmd+K Command Palette)이며, 청중 분기는 별도 분기 CTA가 아닌 콘텐츠 라우팅(About은 B2B 친화 / Projects·Case Study는 B2C 친화)으로 자연스럽게 수행된다.

### 1.2 배경 및 동기 (Background & Motivation)
콘텐츠 분리 정책 — Post는 Cloudflare D1(SQLite, edge-native)에 저장하고 Admin Editor(F020/F021)로 외부 작성·발행한다. Project / AppLegalDoc은 velite + MDX 정적 파이프라인을 유지하고, Project의 cover 이미지 메타만 D1으로 이관(F022)한다. 한국어 only(i18n 없음), 결제·가격 페이지 없음(메일 문의로 대체), `/admin/*`는 Cloudflare Access로 보호되는 본인 1명 전용(F023). 디자인 정본은 `docs/design-system/prototype.html` + `docs/design-system/proto/*` (React 18 + babel-standalone 데모) — 구현 시 React Router v7 ESM 모듈로 포팅한다. 본 PRD는 14-section 표준 템플릿으로 재구성된 v2.0이며, 정보 손실 없이 기존 PRD(v1)을 모두 흡수한다.

### 1.3 대상 사용자 (Target Users)
| 페르소나 | 설명 | 사용 맥락 |
| --- | --- | --- |
| B2B 청중 | 기업 채용/HR 담당자, B2B 프리랜서 프로젝트 매니저 | 이력·기술 깊이·신뢰성 검토. About 페이지 중심 동선. PDF 저장으로 오프라인 검토 + Contact 폼으로 제안. |
| B2C 청중 | 크몽 등 프리랜서 플랫폼에서 유입된 클라이언트 | 결과물·후기·문제 해결 능력 검토. Projects 목록 + Project Detail Case Study 중심 동선. '의뢰하기' CTA로 Contact 수렴. |
| Admin(본인 1명) | 사이트 운영자 (1인). Cloudflare Access GitHub OAuth로 인증 | 모바일/외부에서 Tiptap WYSIWYG 에디터로 Post 작성·발행. R2 Media Library로 자산 관리. 본인 1명 email allowlist. |
| Bot(검색엔진/RSS/소셜 unfurl) | Google·Naver 크롤러, RSS reader, SNS 미리보기 fetch 봇 | 차등 인덱싱 정책(404 noindex,nofollow / App Terms·Privacy noindex,follow / 일반 index,follow), sitemap·robots·canonical, JSON-LD 구조화 데이터, Satori OG 이미지 대상. |

### 1.4 핵심 제약 (Key Constraints)
- 한국어 only — i18n(영문/일문 등) 미포함
- 결제·가격 페이지 없음 — 메일(Contact Form)로 문의 수렴
- 도메인: tkstar.dev (Cloudflare Registrar 등록 완료)
- Hosting: Cloudflare Workers(SSR) + R2(미디어) + D1(Post) + KV(컴파일 캐시) + Workers Paid plan
- 디자인 정본은 `docs/design-system/prototype.html` + `docs/design-system/proto/*` — 구현 시 React Router v7 ESM + React 19로 포팅 필수
- Tailwind v4 — 다크모드는 `[data-theme='dark|light']` HTML 속성 셀렉터 전략(클래스 전략 X)
- 색상: oklch() / color-mix(in oklab, ...) native (모던 브라우저 타깃)
- 타이포: JetBrains Mono self-host (`/public/fonts/JetBrainsMono-*.woff2`)
- TDD-First (Vitest + jsdom + Testing Library), Clean Architecture 4-layer 준수
- Launch Gate — `wrangler.toml [vars] SITE_LAUNCHED='false'` 동안 모든 페이지 noindex,nofollow + robots.txt Disallow / + sitemap.xml empty urlset
- Host canonical 301 — `https://tkstar.dev` apex로 강제, www/http 변형 영구 리다이렉트(Launch 상태와 무관)

### 1.5 작업 범위 외 (Out of Scope)
- 뉴스레터 구독 / 이메일 마케팅
- 블로그 댓글 시스템 (Giscus 등)
- i18n (영문/일문 등 추가 언어)
- 가격표 / 결제 페이지
- `/uses`, `/now` 페이지 — 운영 부담 대비 가치 낮음
- 별도 PDF 이력서 트리 — CSS print(F003)로 대체
- 일반 방문자 인증/회원가입/로그인 — 본인 1명 admin 인증만 Cloudflare Access(F023) 위임
- Workers 자체 세션·쿠키·비밀번호 코드 — Cloudflare Access가 단일 인증 게이트
- Draft auto-save / Scheduled publish — F020 명시적 보류
- Post 버전 히스토리 / 롤백 — F021 명시적 보류
- Cloudflare Images 자동 WebP/AVIF 변환 — F022 명시적 보류(R2 단순 제공)
- Multi-user collaboration / 권한 분리 — F023 명시적 보류(본인 1명 전용)
- Motion 라이브러리 — CSS-only @keyframes/transition로 충분(추후 인터랙션 보강 시 재검토)
- DB 기반 일반 콘텐츠 관리 — Project / AppLegalDoc은 velite + MDX 정적 유지(Post만 D1)
- design `design-canvas.jsx` / `tweaks-panel.jsx` / `components/*.jsx` 와이어프레임 변형 — production 번들 미포함

---

## 2. 사용자 역할 및 권한 (User Roles & Permissions)

### 2.1 역할 정의 (Role Definitions)
| 역할 | 설명 | 핵심 권한 |
| --- | --- | --- |
| anonymous | 일반 방문자. 인증 없음. 모든 public 페이지(Home/About/Projects/Project Detail/Blog/Blog Detail/Contact/Legal/App Terms/App Privacy) 접근 가능. 청중 구분(B2B/B2C)은 콘텐츠 라우팅 메타데이터일 뿐 인증 role 아님 | 공개 콘텐츠 열람, Cmd+K 검색, RSS 구독, Contact Form 제출(Turnstile 검증) |
| admin | 사이트 운영자 본인 1명. Cloudflare Access GitHub OAuth + email allowlist. `/admin/*` 경로 전용. Workers는 `Cf-Access-Authenticated-User-Email` + `Cf-Access-Jwt-Assertion` JWT만 검증, 자체 세션 코드 없음 | Post CRUD(D1), R2 Media 업로드/삭제, search-index.json 재생성, KV cache 무효화 |
| bot | 검색엔진 크롤러, RSS reader, 소셜 unfurl(SNS 미리보기) 봇. `isbot`로 판별 | sitemap.xml / robots.txt / canonical / Open Graph / Twitter Card / JSON-LD / Satori OG 이미지 접근. 차등 인덱싱 정책 대상 |

### 2.2 권한 매트릭스 (Permission Matrix)
| 역할 | Public Content | Cmd+K Search | Contact Form | Admin Posts (D1) | Admin Media (R2) | Sitemap/Robots/OG |
| --- | --- | --- | --- | --- | --- | --- |
| anonymous | Read | Read | Submit(Turnstile) | — | — | Read |
| admin | Read | Read | Submit(Turnstile) | Create/Read/Update/Delete + Publish | Upload/List/Delete | Read |
| bot | Read(차등 인덱싱) | — | — | — | — | Read |

---

## 3. 사용자 여정 (User Journeys)

### 3.1 anonymous — B2B 의사결정자 동선 — Home → About → Projects → Project Detail → Contact
1. 외부 검색/SNS/직접 입력으로 Home 진입. Hero(`whoami` + 'ship solo. ship fast.' + 3-버튼 클러스터) 확인
2. 헤더 브랜드 또는 빠른 링크로 `/about` 이동. 이력·기술스택·경력(회사+solo 통합 timeline)·학력·수상 검토
3. `[⎙ PDF]` 버튼 클릭 → `window.print()` 다이얼로그 → PDF 저장(오프라인 검토)
4. Cmd+K 또는 빠른 링크로 `/projects` 진입. ls-style 행 리스트에서 태그 필터 후 관심 프로젝트 클릭
5. Project Detail Case Study(문제 → 접근 → 결과) 검토. sticky sidebar(meta + on-this-page TOC)로 섹션 점프
6. 하단 가운데 `[의뢰하기 →]` primary CTA 또는 footer Contact 링크로 `/contact` 진입
7. Contact 폼 작성(이름·이메일·의뢰 유형 B2B·메시지) → Turnstile 통과 → submit → 성공 화면(자동응답 메일 발송 안내)

### 3.2 anonymous — B2C 청중 동선 — Home → Blog list → Blog Detail → RSS subscribe(또는 share)
1. 외부 검색 결과 또는 RSS 리더 백링크로 Home 또는 Blog Detail 직접 진입
2. Home에서 Recent Posts 행 클릭 또는 '모두 보기 →' → `/blog` 진입
3. 발행일 역순 목록에서 태그 필터 → 관심 글 카드 클릭 → `/blog/[slug]`
4. 본문 읽기 → sticky sidebar TOC로 섹션 점프 → 코드블록 복사
5. sidebar share 도구([copy link] / [share on X])로 공유 또는 footer `/rss.xml` 링크로 RSS 구독
6. 하단 prev/next로 다음 글 또는 `[모든 글] → /blog` 복귀

### 3.3 anonymous — Contact 제출 — 폼 작성 → Turnstile → submit → 자동응답 메일
1. `/contact` 진입(palette / Footer / About 본문 / Project Detail의 '의뢰하기 →' CTA)
2. 입력 필드 채우기: 이름, 회사(선택), 이메일, 의뢰 유형(B2B/B2C/기타) 라디오, 메시지(10자 이상)
3. 클라이언트 검증(이름·이메일 정규식·메시지 길이) — 위반 시 인라인 에러 + 폼 유지
4. Cloudflare Turnstile 위젯 통과 → `cf-turnstile-response` 토큰 폼 상태 바인딩
5. submit → 서버가 Turnstile siteverify + Resend로 hello@tkstar.dev → 본인 메일 발신
6. 제출자에게 React Email 템플릿 자동응답 메일 발송
7. 성공 화면: '자동응답 메일이 {email}으로 발송되었습니다. 평균 회신 24시간 이내.'

### 3.4 anonymous — 404 Fallback — 미존재 URL → splat → 터미널 메시지
1. 잘못된 URL 직접 입력 또는 깨진 링크 클릭으로 미존재 경로 진입
2. React Router v7 splat(`*`) 라우트 매칭 → 404 응답 코드 + `<meta name='robots' content='noindex,nofollow'>`
3. 터미널 메타포 메시지 표시: `cd: no such route: <path>`
4. 사용자가 `← /home` 복귀 링크 클릭 또는 ⌘K로 Command Palette 오픈하여 검색

### 3.5 admin — Post 작성/발행 — Cloudflare Access → Tiptap → Save Draft → Publish
1. 본인이 `tkstar.dev/admin/posts` 직접 URL 입력
2. Cloudflare Access 게이트가 가로채 GitHub OAuth 로그인 페이지로 리다이렉트(Workers 도달 X)
3. GitHub OAuth 로그인 성공 → 요청에 `Cf-Access-Authenticated-User-Email` + `Cf-Access-Jwt-Assertion` JWT 포함되어 Workers 도달
4. Workers의 access-guard 미들웨어가 JWT 공개키(`https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 캐시)로 서명 검증 통과
5. Admin Posts List 화면에서 status 필터(draft/published/전체) → `[+ New Post]` 또는 기존 글 행 클릭
6. Admin Post Editor 진입 — frontmatter 폼(title/summary/tags/date_published) + 좌측 Tiptap 에디터 + 우측 SSR-style preview
7. Tiptap toolbar(bold/italic/link/code/image) 사용. image 버튼 → file picker → `POST /admin/api/upload` → R2 업로드 → 본문 `![alt](URL)` 자동 삽입
8. `[Save]` 클릭 → D1 INSERT/UPDATE with `status='draft'` → 토스트 + 편집 화면 유지
9. `[Publish]` 클릭 → D1 UPDATE with `status='published'` + `date_published` 확정 → `search-index.json` 재생성 + KV cache key `post:{slug}:body:v*` 무효화 → Admin Posts List 복귀

### 3.6 admin — Media 업로드 — `/admin/media` → R2 upload → URL copy → editor 삽입
1. Admin Layout 좌측 nav `/admin/media` 클릭 (Cloudflare Access 통과 상태)
2. Admin Media Library — R2 list objects(prefix `media/`) 그리드 표시(key/size/uploaded)
3. 파일 업로드 또는 기존 자산 클릭 → 미리보기 + `[Copy URL]` / `[Delete]` 버튼
4. `[Copy URL]` → public URL을 클립보드 복사 (다른 탭의 Admin Post Editor에 붙여넣기)
5. 또는 `[Delete]` → 확인 모달 → R2 DELETE (참조 추적 없음, 사용자 책임)

---

## 4. 기능 명세 (Feature Specifications)

### 4.1 기능 목록 (Feature Overview)
| ID | 기능명 | 설명 | 우선순위 | Surface | 상태 |
| --- | --- | --- | --- | --- | --- |
| F001 | Hero (whoami + 검색 + 빠른 링크) | `whoami` 프롬프트 + 'ship solo. ship fast.' 카피 + 3-버튼 클러스터([검색해서 이동], [/about], [/projects]). 청중 분기는 별도 CTA가 아닌 콘텐츠 라우팅으로 자연 수렴. Home Page 랜딩 진입점. | Core | Home Page | Done |
| F002 | About (사이트 자체 이력서) | 이력·기술스택·경력·학력·수상 표시. 화면용 + 인쇄용 듀얼 레이아웃. 경력 timeline은 회사 재직 + solo 프로젝트 통합(시간 역순), `type: 'company' \| 'solo'` discriminated union 분기로 시각 마커/링크 차별. solo entry는 `/projects/:slug`로 link 가능. | Core | About Page | Done |
| F003 | PDF 저장 (CSS print) | About 페이지 [⎙ PDF] 버튼 → `window.print()` 호출. `@media print` 전용 스타일로 Topbar/Footer/검색트리거/토글 숨김, 색상 단순화. About 페이지 한정. | Core | About Page | Done |
| F004 | Projects 목록 (ls-style 행 리스트) | `slug/ + title + date / summary / stack pills` 행 구조 + 태그 필터 칩. 카드 그리드 아님. velite + MDX 컬렉션, frontmatter Zod 검증. | Core | Projects Page | Done |
| F005 | Project Case Study | 프로젝트 상세 페이지. 문제 정의 → 접근 → 결과(수치/스크린샷) 구조. shiki 코드블록. 데스크탑 880px+에서 sticky sidebar(meta: year/role/stack pills + on-this-page TOC). 하단 prev/next 프로젝트 + 가운데 '의뢰하기 →' primary CTA. | Core | Project Detail Page | Done |
| F006 | Blog 목록 | 발행일 역순 정렬, 태그 필터. 월 1편 작성 운영. 발행된 Post만 노출(draft 제외). | Core | Blog Page | Done |
| F007 | Blog 상세 | MDX 본문, shiki 코드블록, Satori OG, 데스크탑 880px+에서 sticky sidebar(on-this-page TOC + 공유 도구: copy link / X 공유). 하단 prev/next + 가운데 '모든 글' 버튼. Post는 D1 raw_markdown을 런타임 컴파일 + KV cache로 렌더. | Core | Blog Detail Page | Done |
| F008 | Contact Form | 이름/회사(선택)/이메일/의뢰 유형(B2B·B2C·기타)/메시지 입력. Resend로 hello@tkstar.dev → 본인 메일 발신, 제출자에게 React Email 템플릿 자동응답. | Core | Contact Page | Done |
| F009 | Contact 스팸 방지 | Cloudflare Turnstile 위젯으로 폼 제출 검증(Workers 친화). 서버 측 siteverify + 동일 IP 5회/시간 rate-limit. | Core | Contact Page | Done |
| F010 | 다크모드 토글 | 시스템 `prefers-color-scheme` 기본 추종, 헤더 토글로 강제 전환. 선택은 localStorage(`proto-theme`) 저장. `[data-theme='dark\|light']` HTML 속성 셀렉터 전략(Tailwind v4 클래스 전략 X). | Support | All Pages | Done |
| F011 | SSR + 동적 OG 이미지 | React Router v7 Framework mode SSR. 블로그/프로젝트 슬러그별 Satori로 OG 이미지(1200×630 통일) 빌드/요청 시 생성. | Support | Blog Detail Page, Project Detail Page | Done |
| F012 | RSS 피드 | 블로그 글 RSS 2.0 XML 자동 생성(`/rss.xml` 엔드포인트). 발행된 Post만 포함. | Support | Blog Page | Done |
| F013 | 분석 (쿠키 없음) | Cloudflare Web Analytics 스니펫 삽입. 쿠키·개인정보 수집 없음. | Support | All Pages | Done |
| F014 | 앱 약관 라우팅 (스켈레톤) | 출시 앱별 이용약관/개인정보처리방침 페이지 + `/legal` 인덱스(앱 목록 허브). velite collection으로 `legal/apps/[slug]/terms.mdx`, `privacy.mdx` 관리. 앱 내부 WebView 친화 chrome-free 모드(Topbar/Footer 미노출, max-width 680px, 본문/TOC 중심). MVP에서는 라우팅 + 빈 템플릿만. | Support | Legal Index Page, App Terms Page, App Privacy Page | Done |
| F015 | (Removed) Audience Split CTA | 초기 PRD의 B2B/B2C 청중 자동 분기 CTA 및 audience localStorage 기억(F015). 제거됨 — 현 F001 Hero 통합 CTA + 콘텐츠 라우팅이 대체. F-ID 번호 보존을 위한 placeholder 항목(features 배열 15번째). status=Deferred로 별도 deferred_features 표에도 기재됨. | Deferred | (removed) | Done |
| F016 | Cmd+K Command Palette (글로벌 검색 네비) | 모든 routes(/about, /projects, /blog, /contact, /legal) + projects 슬러그 + posts 슬러그를 인덱싱한 클라이언트 사이드 검색. ⌘K(macOS) / Ctrl+K(Windows·Linux) / `/` 단축키로 오픈(입력 포커스 중엔 무시). 토큰 기반 다중 키워드 필터, ↑↓ 네비, ↵ 진입, Esc 닫기, 그룹 헤더(pages/projects/posts). 사이트의 주 네비게이션 패러다임. `/admin/*` 경로는 인덱스에서 제외. | Core | All Pages (root layout 마운트) | Done |
| F017 | Home Featured + Recent Posts | Hero 아래 `## featured`(Project 데이터 모델의 `featured: true` 항목, 큰 카드 1개) + `## recent posts`(최근 3개 행 + '모두 보기 →'). | Support | Home Page | Done |
| F018 | SEO 메타데이터 & Sitemap | 페이지별 `<title>`, `<meta name='description'>`, canonical URL. Open Graph(og:title/description/image/url/type) + Twitter Card(summary_large_image). React Router v7 `meta` export로 페이지별 정의. `/sitemap.xml` resource route — 정적 routes + projects/posts 슬러그 + Legal Index만 포함(개별 App Terms/Privacy 및 404는 제외). `/robots.txt` resource route. JSON-LD 구조화 데이터(Person/BlogPosting/CreativeWork/SoftwareSourceCode/BreadcrumbList). 차등 인덱싱 정책. | Support | All Pages (root layout meta + 페이지별 meta export) | Done |
| F019 | 검색엔진 등록 (Google + Naver) | Google Search Console 도메인 소유권 인증 + sitemap.xml 제출. Naver Search Advisor `naver-site-verification` 메타 태그 + sitemap 제출(한국어 사이트 필수). Bing Webmaster Tools는 MVP 후 등록. 인증 메타 태그는 환경변수(`GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`)로 관리, root layout에서 조건부 렌더. | Support | All Pages (root layout) | Done |
| F020 | Admin Editor (Tiptap WYSIWYG, markdown only) | `/admin/posts` 목록 + `/admin/posts/new` · `/admin/posts/{slug}/edit` 라우트. 좌측 Tiptap 에디터(markdown serialize 보장, 커스텀 JSX 컴포넌트 X — round-trip 안정), 우측 SSR-style preview, 상단 toolbar(bold/italic/link/code/image). 이미지 toolbar 버튼 → R2 업로드 → 본문에 `![alt](R2 URL)` 자동 삽입. Status: `draft` / `published`. `[Save]`와 `[Publish]` 버튼(수동, auto-save 없음). Save/Publish 시 `search-index.json` 재생성(F016 인덱스 갱신). | Core | Admin Posts List, Admin Post Editor | Draft |
| F021 | D1 Post Storage | Post만 Cloudflare D1(SQLite)로 이관 — Project / AppLegalDoc은 velite + MDX 유지. Drizzle ORM + drizzle-kit migration. 컬럼: id/slug/title/summary/raw_markdown/tags(JSON)/date_published/status/created_at/updated_at. Read path: SSR 런타임에서 raw_markdown → MDX-like compile + Workers KV cache(key: `post:{slug}:body:v{updated_at-hash}`, SHA-256 truncate 16 char). 일회성 migration 스크립트로 기존 `content/posts/*.mdx` → D1 INSERT. | Core | Blog List, Blog Detail, Admin Posts List, Admin Post Editor | InProgress |
| F022 | R2 Media | Cloudflare R2. R2 클라이언트 후보(미결정): (a) R2 Workers binding 직접 호출(`MEDIA_BUCKET.put/get/delete/list`, 의존성 0) — 1순위 / (b) `aws4fetch`(~2.5KB) — 2순위 / (c) `@aws-sdk/client-s3`(~500KB, nodejs_compat 활성) — 3순위. 업로드 경로: Workers proxy `POST /admin/api/upload`(Cloudflare Access 보호). 파일 키: `media/{yyyy}/{mm}/{nanoid}.{ext}`. Public read: R2 public bucket URL 또는 Workers 라우트(미결정). Project 메타 일부 D1 이관: `cover_image_url`/`cover_alt`. Admin Media Library에서 자산 목록·삭제. | Core | Admin Media Library, Project Detail, Admin Post Editor | Draft |
| F023 | Cloudflare Access Admin Gate | `/admin/*` path application 단위 보호. Identity provider: GitHub OAuth(Cloudflare Zero Trust Free 플랜, 본인 1명 email allowlist). Workers 코드는 `Cf-Access-Authenticated-User-Email` 헤더 + `Cf-Access-Jwt-Assertion` JWT만 검증, 자체 세션·쿠키·비밀번호 코드 없음. JWT 공개키는 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`에서 fetch 후 캐시. 미인증 요청은 Cloudflare Access가 가로채 GitHub OAuth로 리다이렉트 — Workers까지 도달하지 않음. | Core | Admin Layout (모든 /admin/* 라우트의 게이트) | Draft |

### 4.2 기능 상세 (Feature Details)

#### F001 — Hero (whoami + 검색 + 빠른 링크)
- **설명**: `whoami` 프롬프트 + 'ship solo. ship fast.' 카피 + 3-버튼 클러스터([검색해서 이동], [/about], [/projects]). 청중 분기는 별도 CTA가 아닌 콘텐츠 라우팅으로 자연 수렴. Home Page 랜딩 진입점.
- **User Story**: 방문자로서, 나는 Home 진입 시 즉시 사이트 정체성과 주요 진입 경로(검색·About·Projects)를 인지하고 싶다, 왜냐하면 청중에 따라 다음 행동을 자연스럽게 선택해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 Home(`/`)에 진입했다 WHEN Hero 영역이 렌더된다 THEN `whoami` 프롬프트 + 'ship solo. ship fast.' 카피 + 핵심 요약(역할/한 줄 소개) + 3-버튼 클러스터([검색해서 이동], [/about], [/projects])가 한 화면에 표시된다
  - **happy**: GIVEN Hero가 표시된 상태 WHEN 사용자가 [검색해서 이동] 버튼을 클릭한다 THEN F016 Command Palette가 오픈되고 검색 input에 자동 포커스된다
  - **edge**: GIVEN 모바일 viewport(<880px) WHEN Hero가 렌더된다 THEN 3-버튼 클러스터는 세로 스택으로 재배치되어 가독성·터치 영역을 유지한다
- **Edge Cases**: 모바일 viewport 세로 스택, 키보드 사용자 — Tab 순서로 3-버튼 도달 가능
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 청중 분기 split CTA(removed), audience localStorage 기억(removed F015)

#### F002 — About (사이트 자체 이력서)
- **설명**: 이력·기술스택·경력·학력·수상 표시. 화면용 + 인쇄용 듀얼 레이아웃. 경력 timeline은 회사 재직 + solo 프로젝트 통합(시간 역순), `type: 'company' | 'solo'` discriminated union 분기로 시각 마커/링크 차별. solo entry는 `/projects/:slug`로 link 가능.
- **User Story**: B2B 청중으로서, 나는 한 페이지에서 이력·기술 깊이·경력 흐름을 빠르게 파악하고 싶다, 왜냐하면 별도 이력서 PDF를 받지 않고도 검토를 즉시 시작해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 `/about`에 진입했다 WHEN 페이지가 렌더된다 THEN 헤더(이름/한 줄 포지셔닝/이메일/[⎙ PDF] 버튼) + 기술스택 카드 3개(frontend/edge·backend/quality) + 경력 통합 timeline(시간 역순) + 학력 + 수상 카드가 표시된다
  - **happy**: GIVEN 경력 timeline에 `type: 'solo'` entry가 존재한다 WHEN 사용자가 solo entry의 링크를 클릭한다 THEN `/projects/:slug` 또는 `/projects?type=solo`로 이동하여 해당 Project Detail이 열린다
  - **edge**: GIVEN 경력 데이터가 회사 0건 + solo 1건 이상인 상태 WHEN timeline이 렌더된다 THEN solo 마커만 표시되고 빈 회사 섹션은 노출되지 않는다
- **Edge Cases**: 회사 0건 / solo 1건 이상, 자격증 데이터 추가 시 별도 카드(현 미적용)
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 별도 이력서 PDF 트리(F003로 충분)

#### F003 — PDF 저장 (CSS print)
- **설명**: About 페이지 [⎙ PDF] 버튼 → `window.print()` 호출. `@media print` 전용 스타일로 Topbar/Footer/검색트리거/토글 숨김, 색상 단순화. About 페이지 한정.
- **User Story**: B2B 청중으로서, 나는 About 페이지를 그대로 PDF로 저장하고 싶다, 왜냐하면 별도 이력서 다운로드 없이 오프라인·메일 첨부 검토를 해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN About 페이지에서 사용자가 [⎙ PDF] 버튼을 클릭한다 WHEN `window.print()` 다이얼로그가 열린다 THEN `@page { size: A4; margin: 0 }` 적용 + Topbar/Footer/검색트리거/토글이 시각적으로 숨겨진다(`display: none`)
  - **edge**: GIVEN 본문에 OKLCH 색상이 포함된 섹션이 존재한다 WHEN 인쇄 미리보기를 본다 THEN `print-color-adjust: exact`가 적용되어 화면과 동일한 색이 유지된다(또는 sRGB로 자동 변환되어도 가독성 손상이 없다)
  - **edge**: GIVEN 인쇄 미리보기가 열린 상태 WHEN 페이지 경계에 도달한다 THEN 섹션 헤딩(h2)이 페이지 하단에 고립되지 않는다(`break-after: avoid` 또는 `page-break-inside: avoid`)
- **Edge Cases**: OKLCH 색상 → print-color-adjust: exact, h2 페이지 경계 고립 방지
- **Dependencies**: F002
- **Out-of-scope (이 기능 한정)**: 별도 PDF 이력서 생성 파이프라인

#### F004 — Projects 목록 (ls-style 행 리스트)
- **설명**: `slug/ + title + date / summary / stack pills` 행 구조 + 태그 필터 칩. 카드 그리드 아님. velite + MDX 컬렉션, frontmatter Zod 검증.
- **User Story**: B2C 청중으로서, 나는 모든 프로젝트를 한 화면에서 훑고 태그로 필터링하고 싶다, 왜냐하면 카드 그리드보다 ls-style 행 리스트가 정보 밀도가 높고 빠른 스캔이 가능하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 `/projects`에 진입했다 WHEN velite 빌드 산출물에서 프로젝트 컬렉션이 로드된다 THEN ls-style 행 리스트(slug/ + title + date(YYYY-MM) / summary / stack pills)가 발행일 역순으로 표시되고 상단에 태그 필터 칩이 노출된다
  - **happy**: GIVEN 사용자가 태그 칩을 클릭한다 WHEN 필터가 적용된다 THEN 해당 태그를 포함한 프로젝트 행만 표시된다
  - **edge**: GIVEN velite frontmatter Zod 검증 실패(필수 필드 누락) WHEN 빌드 단계에서 감지된다 THEN 빌드가 실패하여 잘못된 콘텐츠가 production에 노출되지 않는다(fail-fast)
- **Edge Cases**: frontmatter Zod 검증 실패 시 빌드 fail-fast, 프로젝트 0건 — 빈 상태 메시지
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 카드 그리드 레이아웃

#### F005 — Project Case Study
- **설명**: 프로젝트 상세 페이지. 문제 정의 → 접근 → 결과(수치/스크린샷) 구조. shiki 코드블록. 데스크탑 880px+에서 sticky sidebar(meta: year/role/stack pills + on-this-page TOC). 하단 prev/next 프로젝트 + 가운데 '의뢰하기 →' primary CTA.
- **User Story**: B2C 청중으로서, 나는 한 프로젝트의 문제·접근·결과를 깊이 있게 보고 싶다, 왜냐하면 'ship 능력'을 검증한 뒤 의뢰 결정을 해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 `/projects/[slug]`에 진입했다 WHEN velite 산출물의 frontmatter + MDX 본문이 SSR로 렌더된다 THEN 본문(problem/approach/results) + shiki 코드블록 highlight + Satori OG 메타 + 하단 3분할(`← prev` / `[의뢰하기 →]` primary / `next →`)이 표시된다
  - **happy**: GIVEN 데스크탑 viewport(880px+) WHEN 페이지가 렌더된다 THEN sticky sidebar(`.two-col`)가 meta 박스(year/role/stack pills) + on-this-page TOC(rehype-toc 자동 추출)로 표시되고 스크롤 시 sticky 유지된다
  - **edge**: GIVEN 모바일 viewport(<880px) WHEN 페이지가 렌더된다 THEN sticky sidebar가 본문 위 또는 하단으로 collapse되어 본문 가독성을 우선한다
- **Edge Cases**: 모바일 sidebar collapse, MDX 헤딩이 없는 본문 — TOC 빈 상태
- **Dependencies**: F004
- **Out-of-scope (이 기능 한정)**: _없음_

#### F006 — Blog 목록
- **설명**: 발행일 역순 정렬, 태그 필터. 월 1편 작성 운영. 발행된 Post만 노출(draft 제외).
- **User Story**: 방문자로서, 나는 발행된 블로그 글을 발행일 역순으로 훑고 태그로 필터링하고 싶다, 왜냐하면 관심 주제의 글을 빠르게 찾기 위해서이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 `/blog`에 진입했다 WHEN Blog Page 로더가 실행된다 THEN 글 행(제목/발행일/한 줄 요약/태그/읽는 시간)이 발행일 역순으로 표시되고 상단에 태그 필터 + RSS 피드 링크(`/rss.xml`)가 노출된다
  - **edge**: GIVEN D1 또는 velite에 발행된 Post가 0건 WHEN 페이지가 렌더된다 THEN 빈 상태 메시지가 표시되고 RSS 링크는 유지된다
- **Edge Cases**: 발행된 글 0건 — 빈 상태, draft 글은 목록에서 제외(F021 AC-4)
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 댓글 시스템, 구독 모달

#### F007 — Blog 상세
- **설명**: MDX 본문, shiki 코드블록, Satori OG, 데스크탑 880px+에서 sticky sidebar(on-this-page TOC + 공유 도구: copy link / X 공유). 하단 prev/next + 가운데 '모든 글' 버튼. Post는 D1 raw_markdown을 런타임 컴파일 + KV cache로 렌더.
- **User Story**: 방문자로서, 나는 한 블로그 글을 깊이 읽고 섹션별 점프·코드 복사·공유를 자연스럽게 하고 싶다, 왜냐하면 글 단위 SEO 진입점이자 학습 자료로 활용해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 `/blog/[slug]`에 진입했다 WHEN SSR 핸들러가 D1 또는 velite 본문을 컴파일하여 렌더한다 THEN MDX 본문 + shiki 코드블록 highlight + Satori OG 메타 + 하단 3분할(`← prev` / `[모든 글] → /blog` / `next →`)이 표시된다
  - **happy**: GIVEN 데스크탑 viewport(880px+) WHEN 페이지가 렌더된다 THEN sticky sidebar가 on-this-page TOC(h2 헤딩 자동 추출) + share 도구([copy link]/[share on X])로 표시된다
  - **edge**: GIVEN 존재하지 않는 slug 또는 status='draft' 글 WHEN 익명 방문자가 진입한다 THEN 404 Fallback이 반환된다(F021 AC-3)
- **Edge Cases**: draft 글 익명 접근 → 404, TOC 추출 가능한 h2 없음 — sidebar TOC 영역 비표시 또는 빈 상태
- **Dependencies**: F006, F021, F011
- **Out-of-scope (이 기능 한정)**: 댓글 시스템

#### F008 — Contact Form
- **설명**: 이름/회사(선택)/이메일/의뢰 유형(B2B·B2C·기타)/메시지 입력. Resend로 hello@tkstar.dev → 본인 메일 발신, 제출자에게 React Email 템플릿 자동응답.
- **User Story**: 방문자로서, 나는 회원가입 없이 즉시 의뢰/제안을 보내고 자동응답을 받고 싶다, 왜냐하면 가벼운 시작 + 평균 회신 24시간이라는 명시적 SLA가 필요하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 사용자가 `/contact`에서 이름·이메일·메시지(10자 이상)·의뢰 유형을 채우고 Turnstile을 통과한다 WHEN `submit` 클릭 THEN Resend API가 1회 호출되어 hello@tkstar.dev → 본인 메일이 발신되고, 제출자에게 자동응답 메일이 발송되며, 성공 화면이 표시된다
  - **error**: GIVEN 이메일 필드가 RFC 5322 위반 형식(`foo@`, `foo.com` 등) WHEN `submit` 클릭 THEN 클라이언트 측에서 차단되어 인라인 에러 메시지가 표시되고 네트워크 요청이 발생하지 않는다
  - **edge**: GIVEN 메시지 길이가 10자 미만이거나 5000자를 초과한다 WHEN `submit` 클릭 THEN 인라인 에러 + 폼 상태 유지(입력값 손실 없음)
  - **error**: GIVEN Resend API가 5xx 또는 네트워크 오류로 실패한다 WHEN 응답 수신 THEN 에러 토스트 + `mailto:hello@tkstar.dev?subject=...&body=...` 폴백 링크가 노출된다(폼 입력값을 mailto body에 prefill)
- **Edge Cases**: 메시지 < 10자 또는 > 5000자, Resend 5xx → mailto 폴백
- **Dependencies**: F009
- **Out-of-scope (이 기능 한정)**: 회원가입/로그인 후 폼 제출, 가격 표시

#### F009 — Contact 스팸 방지
- **설명**: Cloudflare Turnstile 위젯으로 폼 제출 검증(Workers 친화). 서버 측 siteverify + 동일 IP 5회/시간 rate-limit.
- **User Story**: 운영자로서, 나는 Contact 폼을 통한 자동화 스팸을 차단하고 싶다, 왜냐하면 메일 채널이 노이즈로 막히지 않아야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN Contact 폼이 마운트된다 WHEN Turnstile 위젯이 렌더된다 THEN `cf-turnstile-response` 토큰이 폼 상태에 바인딩되고, 토큰이 비어있으면 submit 버튼이 비활성화된다
  - **error**: GIVEN 클라이언트가 위조한 토큰을 함께 submit WHEN 서버가 `https://challenges.cloudflare.com/turnstile/v0/siteverify`에 검증 요청 THEN `success: false`를 받아 400 응답 + Resend 호출이 일어나지 않는다
  - **error**: GIVEN 동일 IP가 1시간 내 5회 이상 submit한다 WHEN 6번째 submit THEN 서버가 429 응답 + '잠시 후 다시 시도해주세요' 메시지(Workers KV 또는 DO 기반 rate-limit)
- **Edge Cases**: 위조 토큰 → 400, 동일 IP 5회/시간 → 429
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: reCAPTCHA / hCaptcha 대체재

#### F010 — 다크모드 토글
- **설명**: 시스템 `prefers-color-scheme` 기본 추종, 헤더 토글로 강제 전환. 선택은 localStorage(`proto-theme`) 저장. `[data-theme='dark|light']` HTML 속성 셀렉터 전략(Tailwind v4 클래스 전략 X).
- **User Story**: 방문자로서, 나는 다크 또는 라이트 모드를 선택하고 그 선택이 기억되기를 원한다, 왜냐하면 시간대·환경에 따라 가독성을 직접 제어하고 싶기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 최초 방문자(localStorage `proto-theme` 미설정) WHEN 페이지 로드 THEN `prefers-color-scheme` 시스템 설정을 따라 `[data-theme]`이 dark 또는 light로 설정된다
  - **happy**: GIVEN 사용자가 헤더 토글을 클릭한다 WHEN 토글 핸들러 실행 THEN `[data-theme]`이 즉시 반전되고 `localStorage['proto-theme']`에 저장된다 — 다음 방문에서도 유지
  - **edge**: GIVEN localStorage 접근이 차단된 환경(개인정보 보호 모드 등) WHEN 토글 클릭 THEN 예외 없이 동작하고 세션 내 메모리 상태만 변경된다(다음 방문에는 시스템 설정 추종)
- **Edge Cases**: localStorage 차단 환경 — 메모리 상태 fallback
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 커스텀 컬러 팔레트, auto 모드 외 3-state 토글

#### F011 — SSR + 동적 OG 이미지
- **설명**: React Router v7 Framework mode SSR. 블로그/프로젝트 슬러그별 Satori로 OG 이미지(1200×630 통일) 빌드/요청 시 생성.
- **User Story**: 방문자로서, 나는 SNS 또는 검색 결과에서 페이지 미리보기가 정확하고 매력적이기를 원한다, 왜냐하면 클릭 전 판단 자료가 OG 이미지이기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN `/blog/[slug]` 또는 `/projects/[slug]`의 OG 이미지 URL을 요청한다 WHEN Satori가 frontmatter(title/date/tags)로 PNG를 생성 THEN 1200×630 PNG + `Content-Type: image/png` + `Cache-Control: public, max-age=31536000, immutable` 응답
  - **edge**: GIVEN 존재하지 않는 slug에 대한 OG 요청 WHEN 리소스 라우트 핸들러 실행 THEN 404가 아니라 default fallback PNG(브랜드 로고 + 'tkstar.dev')를 반환한다
  - **error**: GIVEN Satori 렌더링이 실패한다(폰트 binary 누락 등) WHEN 응답 생성 THEN 정적 fallback PNG로 graceful degradation + Workers logs에 에러 기록
- **Edge Cases**: 존재하지 않는 slug → fallback PNG, Satori 실패 → 정적 fallback + 로그
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: WebP/AVIF OG 변환, 사용자 커스텀 OG 템플릿

#### F012 — RSS 피드
- **설명**: 블로그 글 RSS 2.0 XML 자동 생성(`/rss.xml` 엔드포인트). 발행된 Post만 포함.
- **User Story**: 구독자로서, 나는 RSS 리더로 새 글을 추적하고 싶다, 왜냐하면 사이트 방문 없이도 발행 알림을 받기 위해서이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자/봇이 `/rss.xml`을 요청한다 WHEN resource route 핸들러 실행 THEN RSS 2.0 XML이 발행일 역순으로 발행된 Post 메타(title/link/description/pubDate)를 포함하여 `Content-Type: application/xml`로 응답된다
  - **edge**: GIVEN 발행된 Post가 0건 WHEN 요청 도달 THEN 빈 RSS XML(channel 메타만 포함)이 정상 응답된다 — 200
- **Edge Cases**: 발행된 글 0건 — 빈 RSS
- **Dependencies**: F006
- **Out-of-scope (이 기능 한정)**: Atom 1.0 포맷, Per-tag 별도 피드

#### F013 — 분석 (쿠키 없음)
- **설명**: Cloudflare Web Analytics 스니펫 삽입. 쿠키·개인정보 수집 없음.
- **User Story**: 운영자로서, 나는 트래픽 가시성을 확보하되 방문자 프라이버시를 침해하지 않고 싶다, 왜냐하면 쿠키 없이도 운영에 충분한 운영 메트릭을 얻을 수 있기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 모든 페이지의 root layout이 렌더된다 WHEN Cloudflare Web Analytics 스니펫이 삽입된다 THEN 쿠키·localStorage 사용 없이 페이지뷰가 Cloudflare 대시보드에 집계된다
  - **edge**: GIVEN Bot 요청(`isbot` true) WHEN 스니펫이 평가된다 THEN Cloudflare Web Analytics 자체적으로 봇 트래픽이 필터링되어 사람 트래픽만 집계된다
- **Edge Cases**: Bot 트래픽 자동 필터
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: GA4 / Plausible 등 대체재, 이벤트 기반 funnel 분석

#### F014 — 앱 약관 라우팅 (스켈레톤)
- **설명**: 출시 앱별 이용약관/개인정보처리방침 페이지 + `/legal` 인덱스(앱 목록 허브). velite collection으로 `legal/apps/[slug]/terms.mdx`, `privacy.mdx` 관리. 앱 내부 WebView 친화 chrome-free 모드(Topbar/Footer 미노출, max-width 680px, 본문/TOC 중심). MVP에서는 라우팅 + 빈 템플릿만.
- **User Story**: 앱 출시 운영자로서, 나는 앱 심사용 약관/처리방침 URL을 즉시 제공하고 싶다, 왜냐하면 앱 등록 시점에 정본 URL이 필수이기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN velite collection에 `legal/apps/[slug]/terms.mdx` + `privacy.mdx`가 존재한다 WHEN 방문자가 `/legal`에 진입한다 THEN Legal Index가 앱 카드(앱명/slug/[terms]/[privacy] 링크)를 표시하고, 카드 클릭 시 App Terms 또는 App Privacy chrome-free 페이지로 이동한다
  - **edge**: GIVEN 등록된 앱이 0건 WHEN Footer Legal 링크 평가 THEN Footer에서 Legal Index 링크가 노출되지 않는다(앱 1개 이상 시에만 노출)
  - **edge**: GIVEN App Terms 또는 App Privacy 페이지가 검색엔진 크롤러에 의해 요청된다 WHEN 응답 생성 THEN `<meta name='robots' content='noindex,follow'>`가 적용되어 검색 인덱싱은 차단되지만 canonical/내부 링크 traversal은 허용된다 + sitemap.xml에서도 제외된다
- **Edge Cases**: 앱 0건 — Footer Legal 링크 비노출, App Terms/Privacy 차등 인덱싱(noindex,follow)
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 앱 약관 자동 generator, 약관 변경 알림

#### F015 — (Removed) Audience Split CTA
- **설명**: 초기 PRD의 B2B/B2C 청중 자동 분기 CTA 및 audience localStorage 기억(F015). 제거됨 — 현 F001 Hero 통합 CTA + 콘텐츠 라우팅이 대체. F-ID 번호 보존을 위한 placeholder 항목(features 배열 15번째). status=Deferred로 별도 deferred_features 표에도 기재됨.
- **User Story**: (placeholder) 청중으로서, 나는 별도 분기 CTA로 자동 라우팅되기를 원했지만, 제거됨 — 현 F001 통합 CTA가 충분하다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 본 항목은 폐기된 placeholder이다 WHEN PRD가 렌더된다 THEN F015 자리가 보존되어 후속 F016+ 번호가 변경되지 않는다(history preservation)
- **Edge Cases**: _없음_
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: audience 자동 라우팅 재도입 — 현 컨셉(통합 CTA + 콘텐츠 라우팅) 유지

#### F016 — Cmd+K Command Palette (글로벌 검색 네비)
- **설명**: 모든 routes(/about, /projects, /blog, /contact, /legal) + projects 슬러그 + posts 슬러그를 인덱싱한 클라이언트 사이드 검색. ⌘K(macOS) / Ctrl+K(Windows·Linux) / `/` 단축키로 오픈(입력 포커스 중엔 무시). 토큰 기반 다중 키워드 필터, ↑↓ 네비, ↵ 진입, Esc 닫기, 그룹 헤더(pages/projects/posts). 사이트의 주 네비게이션 패러다임. `/admin/*` 경로는 인덱스에서 제외.
- **User Story**: 방문자로서, 나는 키보드만으로 사이트 어디로든 즉시 이동하고 싶다, 왜냐하면 메뉴 클릭보다 ⌘K 검색이 압도적으로 빠르기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 페이지에 입력 포커스가 없다 WHEN 사용자가 ⌘K(macOS) 또는 Ctrl+K(Win/Linux) 또는 `/`를 입력 THEN palette가 열리고 검색 input에 자동 포커스된다
  - **edge**: GIVEN input/textarea/contenteditable에 포커스가 있다 WHEN 위 단축키 입력 THEN palette가 열리지 않고 기본 입력 동작이 유지된다
  - **happy**: GIVEN palette가 열린 상태 + 검색어 'rou nav' 입력 WHEN 토큰 기반 필터 실행 THEN 'rou'와 'nav'를 모두 포함하는 항목만 그룹 헤더(pages/projects/posts) 별로 표시된다
  - **happy**: GIVEN 결과 리스트 WHEN ↓ ↑로 네비 + ↵로 진입 + Esc로 닫기 THEN 키보드만으로 모든 동작이 수행되고, 마우스 호버로 선택 인덱스가 동기화된다
  - **edge**: GIVEN 사이트가 처음 로드된다 WHEN 검색 인덱스 fetch THEN 인덱스 JSON은 gzip 100KB 이하 + 본문(body)을 포함하지 않으며 세션당 1회만 fetch된다
- **Edge Cases**: 입력 포커스 시 shortcut 무시, 검색 인덱스 gzip ≤ 100KB / 세션당 1회 fetch, `/admin/*` 인덱스 제외
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: 검색 결과 미리보기 스니펫, 백엔드 풀텍스트 검색

#### F017 — Home Featured + Recent Posts
- **설명**: Hero 아래 `## featured`(Project 데이터 모델의 `featured: true` 항목, 큰 카드 1개) + `## recent posts`(최근 3개 행 + '모두 보기 →').
- **User Story**: 방문자로서, 나는 Home에서 즉시 대표 작업물과 최신 글을 확인하고 싶다, 왜냐하면 추가 클릭 없이도 사이트의 정보 밀도를 파악하기 위해서이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN velite Project 컬렉션에 `featured: true` 항목이 존재 WHEN Home 렌더 THEN Hero 아래 `## featured` 큰 카드 1개가 표시되고 클릭 시 해당 Project Detail로 이동한다
  - **happy**: GIVEN 발행된 Post가 3개 이상 WHEN Home 렌더 THEN `## recent posts` 최근 3개 행 + '모두 보기 →' 링크(`/blog`)가 표시된다
  - **edge**: GIVEN `featured: true` Project이 0건 또는 발행된 Post가 0건 WHEN Home 렌더 THEN 해당 섹션이 비표시되며 다른 섹션의 레이아웃은 깨지지 않는다
- **Edge Cases**: featured Project 0건 → 섹션 비표시, 발행된 Post 0건 → recent posts 섹션 비표시
- **Dependencies**: F001
- **Out-of-scope (이 기능 한정)**: _없음_

#### F018 — SEO 메타데이터 & Sitemap
- **설명**: 페이지별 `<title>`, `<meta name='description'>`, canonical URL. Open Graph(og:title/description/image/url/type) + Twitter Card(summary_large_image). React Router v7 `meta` export로 페이지별 정의. `/sitemap.xml` resource route — 정적 routes + projects/posts 슬러그 + Legal Index만 포함(개별 App Terms/Privacy 및 404는 제외). `/robots.txt` resource route. JSON-LD 구조화 데이터(Person/BlogPosting/CreativeWork/SoftwareSourceCode/BreadcrumbList). 차등 인덱싱 정책.
- **User Story**: 사이트 운영자로서, 나는 검색엔진에 정확한 메타·sitemap·구조화 데이터를 제공하고 싶다, 왜냐하면 검색 노출 + 봇이 인덱싱해야 할 페이지를 정밀하게 제어해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN 방문자가 임의 페이지에 진입했다 WHEN SSR HTML이 생성된다 THEN `<title>`, `<meta name='description'>`, canonical URL, Open Graph, Twitter Card가 페이지별 `meta` export로 출력되고, root layout `<head>`에 JSON-LD가 삽입된다
  - **happy**: GIVEN 검색엔진 크롤러 WHEN `/sitemap.xml` 또는 `/robots.txt`를 요청한다 THEN sitemap.xml은 index 가능 페이지(Home/About/Projects/Project Detail/Blog/Blog Detail/Contact/Legal Index)만 포함하고, robots.txt는 User-agent: */Allow: //Sitemap 위치를 명시한다(Launch Gate OFF 시는 sitemap empty + robots Disallow)
  - **edge**: GIVEN App Terms / App Privacy 페이지 WHEN 크롤러가 진입 THEN `<meta name='robots' content='noindex,follow'>` + sitemap.xml 제외 (canonical 유지로 검토자 URL 공유는 가능)
  - **edge**: GIVEN Not Found Fallback(splat) WHEN 크롤러가 진입 THEN `<meta name='robots' content='noindex,nofollow'>` + 404 응답 + sitemap.xml 제외
  - **edge**: GIVEN `/admin/*` 경로 WHEN 크롤러 또는 외부 접근 THEN `<meta name='robots' content='noindex,nofollow'>` + Cmd+K palette 인덱스 제외 + sitemap.xml 제외
- **Edge Cases**: Launch Gate OFF → sitemap empty + robots Disallow, App Terms/Privacy → noindex,follow, 404 → noindex,nofollow, /admin/* → noindex,nofollow
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: _없음_

#### F019 — 검색엔진 등록 (Google + Naver)
- **설명**: Google Search Console 도메인 소유권 인증 + sitemap.xml 제출. Naver Search Advisor `naver-site-verification` 메타 태그 + sitemap 제출(한국어 사이트 필수). Bing Webmaster Tools는 MVP 후 등록. 인증 메타 태그는 환경변수(`GOOGLE_SITE_VERIFICATION`, `NAVER_SITE_VERIFICATION`)로 관리, root layout에서 조건부 렌더.
- **User Story**: 사이트 운영자로서, 나는 Google·Naver에 사이트를 등록하고 sitemap을 제출하고 싶다, 왜냐하면 자연 검색 트래픽이 유일한 외부 유입 채널 중 하나이기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN `GOOGLE_SITE_VERIFICATION` 또는 `NAVER_SITE_VERIFICATION` 환경변수가 설정된 상태 WHEN root layout이 렌더된다 THEN `<meta name='google-site-verification' content='...'>` 또는 `<meta name='naver-site-verification' content='...'>`가 조건부 출력된다
  - **edge**: GIVEN 환경변수가 미설정 WHEN root layout 렌더 THEN 해당 메타 태그가 출력되지 않고 사이트는 정상 동작한다(검증 단계 분리)
- **Edge Cases**: 환경변수 미설정 → 조건부 렌더 생략
- **Dependencies**: F018
- **Out-of-scope (이 기능 한정)**: Bing Webmaster Tools (MVP 후)

#### F020 — Admin Editor (Tiptap WYSIWYG, markdown only)
- **설명**: `/admin/posts` 목록 + `/admin/posts/new` · `/admin/posts/{slug}/edit` 라우트. 좌측 Tiptap 에디터(markdown serialize 보장, 커스텀 JSX 컴포넌트 X — round-trip 안정), 우측 SSR-style preview, 상단 toolbar(bold/italic/link/code/image). 이미지 toolbar 버튼 → R2 업로드 → 본문에 `![alt](R2 URL)` 자동 삽입. Status: `draft` / `published`. `[Save]`와 `[Publish]` 버튼(수동, auto-save 없음). Save/Publish 시 `search-index.json` 재생성(F016 인덱스 갱신).
- **User Story**: Admin으로서, 나는 모바일/외부에서도 Tiptap WYSIWYG으로 글을 작성·발행하고 싶다, 왜냐하면 VS Code 없이도 D1 정본을 안전하게 갱신해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN Admin Post Editor 신규 모드(`/admin/posts/new`) WHEN Tiptap toolbar의 [bold] 클릭 → 텍스트 입력 → [Save] 클릭 THEN D1 `posts` 테이블에 `status='draft'` 레코드가 INSERT 되고, `raw_markdown` 필드는 `**...**` 형태의 순수 markdown으로 직렬화된다(커스텀 JSX 컴포넌트 또는 HTML 미포함)
  - **happy**: GIVEN Admin Post Editor에서 toolbar의 image 버튼 클릭 → 파일 선택 WHEN 파일이 `POST /admin/api/upload`로 전송되어 R2 업로드 성공(F022) THEN 본문 커서 위치에 `![{fileName}]({R2 public URL})` 마크다운이 자동 삽입되고, 우측 preview에 즉시 이미지가 렌더된다
  - **happy**: GIVEN draft 상태의 기존 Post 편집 화면 WHEN [Publish] 클릭 THEN D1 UPDATE로 `status='published'` + `date_published`(입력값 또는 now) + `updated_at=now`가 반영되고, 동일 트랜잭션 외부에서 `search-index.json`이 R2/KV에 재생성되며, KV cache 키 `post:{slug}:body:v*`가 무효화된다
  - **edge**: GIVEN 좌측 markdown 입력 WHEN 우측 preview가 렌더 THEN preview는 본 사이트 Blog Detail(F007)과 동일한 컴파일러·스타일로 렌더되어 round-trip 일관성을 보장한다(에디터에서 본 모습 = 실제 발행 모습)
  - **error**: GIVEN 인증되지 않은 사용자가 `/admin/posts/new` 직접 접근 시도 WHEN 요청이 Cloudflare Access 게이트 통과 전 THEN Workers 코드는 실행되지 않고(F023) GitHub OAuth 로그인 화면으로 리다이렉트된다
- **Edge Cases**: 커스텀 JSX 컴포넌트 사용 시도 — markdown serialize 보장 위반 방지, image 업로드 실패 시 본문 삽입 X
- **Dependencies**: F021, F022, F023
- **Out-of-scope (이 기능 한정)**: Draft auto-save, Scheduled publish

#### F021 — D1 Post Storage
- **설명**: Post만 Cloudflare D1(SQLite)로 이관 — Project / AppLegalDoc은 velite + MDX 유지. Drizzle ORM + drizzle-kit migration. 컬럼: id/slug/title/summary/raw_markdown/tags(JSON)/date_published/status/created_at/updated_at. Read path: SSR 런타임에서 raw_markdown → MDX-like compile + Workers KV cache(key: `post:{slug}:body:v{updated_at-hash}`, SHA-256 truncate 16 char). 일회성 migration 스크립트로 기존 `content/posts/*.mdx` → D1 INSERT.
- **User Story**: Admin으로서, 나는 Post 정본을 edge-native D1에 두어 외부 작성·발행·롤백을 정합성 있게 관리하고 싶다, 왜냐하면 정적 MDX는 모바일 외부 작성이 불가하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN Drizzle 마이그레이션 적용 후의 빈 D1 WHEN 마이그레이션 스크립트가 기존 `content/posts/*.mdx`를 읽어 INSERT THEN 모든 기존 Post가 `status='published'` + `date_published`(frontmatter 기준) + `raw_markdown`(frontmatter 제외 본문)으로 이관되며, slug 중복 INSERT 시 fail-fast(마이그레이션 스크립트 abort)
  - **happy**: GIVEN D1에 `slug='hello-world'`, `status='published'` 레코드 WHEN 방문자가 `/blog/hello-world` 진입 THEN SSR 핸들러가 `raw_markdown`을 런타임 컴파일하여 MDX-like AST로 렌더하고, KV cache(`post:hello-world:body:v{updated_at-hash}`)에 컴파일 결과 저장 — 다음 요청은 캐시 hit
  - **error**: GIVEN D1에 `status='draft'` 레코드 WHEN 익명 방문자가 해당 slug로 `/blog/{slug}` 진입 THEN 404(Not Found Fallback) 응답. draft는 Admin Layout 경로(`/admin/posts/{slug}/edit`)로만 접근 가능
  - **happy**: GIVEN listPosts 호출(Blog Page F006 로더) WHEN D1 SELECT 실행 THEN `WHERE status='published' ORDER BY date_published DESC` 결과만 반환되며 draft는 Blog 목록·RSS·sitemap·search index 모두에서 제외
  - **edge**: GIVEN Post UPDATE가 일어난다 WHEN `updated_at` 변경 THEN KV 캐시 키의 버전 해시(SHA-256 truncate 16 char)가 자동으로 바뀌어 이전 캐시 항목은 다음 SSR 요청에서 hit 되지 않는다(자연 invalidation, TTL 의존 X)
- **Edge Cases**: slug 중복 마이그레이션 → fail-fast, draft 익명 접근 → 404, updated_at 변경 → KV 키 해시 자연 invalidation
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: Post 버전 히스토리 / 롤백

#### F022 — R2 Media
- **설명**: Cloudflare R2. R2 클라이언트 후보(미결정): (a) R2 Workers binding 직접 호출(`MEDIA_BUCKET.put/get/delete/list`, 의존성 0) — 1순위 / (b) `aws4fetch`(~2.5KB) — 2순위 / (c) `@aws-sdk/client-s3`(~500KB, nodejs_compat 활성) — 3순위. 업로드 경로: Workers proxy `POST /admin/api/upload`(Cloudflare Access 보호). 파일 키: `media/{yyyy}/{mm}/{nanoid}.{ext}`. Public read: R2 public bucket URL 또는 Workers 라우트(미결정). Project 메타 일부 D1 이관: `cover_image_url`/`cover_alt`. Admin Media Library에서 자산 목록·삭제.
- **User Story**: Admin으로서, 나는 이미지를 R2에 업로드하고 본문에 URL을 자동 삽입하고 싶다, 왜냐하면 외부 호스팅 없이 정본·과금 단일 채널로 미디어를 관리해야 하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN Admin Post Editor에서 image 업로드 트리거 WHEN `POST /admin/api/upload`가 multipart/form-data로 파일 전송 THEN Workers가 `media/{yyyy}/{mm}/{nanoid}.{ext}` 키로 R2 PUT 후 `{ url, key }` JSON 응답하며, `nanoid`는 21자 url-safe(slug 충돌 방지)
  - **error**: GIVEN Cloudflare Access 미인증 요청 WHEN `POST /admin/api/upload` 호출 THEN Cloudflare Access 게이트에서 차단되어 Workers 도달 X(F023). 헤더 위조로 Workers 직접 호출되더라도 `Cf-Access-Jwt-Assertion` JWT 검증 실패 → 401
  - **happy**: GIVEN Project frontmatter의 `cover` 필드가 D1 `project_meta.cover_image_url`로 이관된 상태 WHEN Project Detail(F005) 또는 Home Featured(F017)가 cover 표시 THEN D1 SELECT한 URL을 사용하며, MDX frontmatter의 cover 필드는 더 이상 읽히지 않는다(이중 정본 방지)
  - **edge**: GIVEN Admin Media Library에서 자산 [Delete] 클릭 → 확인 WHEN R2 DELETE 실행 THEN R2에서 객체가 사라지고 목록에서 제거되지만, 본문에서 해당 URL을 참조하는 Post/Project가 있더라도 자동 추적·교체는 일어나지 않는다(사용자 책임 — 명시적 Out of Scope)
- **Edge Cases**: 삭제 시 참조 추적 없음 — 사용자 책임, R2 클라이언트 선택 미결정(OQ-MEDIA-CLIENT)
- **Dependencies**: F023
- **Out-of-scope (이 기능 한정)**: Cloudflare Images 자동 WebP/AVIF 변환, 참조 추적/교체

#### F023 — Cloudflare Access Admin Gate
- **설명**: `/admin/*` path application 단위 보호. Identity provider: GitHub OAuth(Cloudflare Zero Trust Free 플랜, 본인 1명 email allowlist). Workers 코드는 `Cf-Access-Authenticated-User-Email` 헤더 + `Cf-Access-Jwt-Assertion` JWT만 검증, 자체 세션·쿠키·비밀번호 코드 없음. JWT 공개키는 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`에서 fetch 후 캐시. 미인증 요청은 Cloudflare Access가 가로채 GitHub OAuth로 리다이렉트 — Workers까지 도달하지 않음.
- **User Story**: Admin으로서, 나는 자체 인증 코드 없이 `/admin/*`를 보호하고 싶다, 왜냐하면 본인 1명 전용 게이트에는 Cloudflare Access GitHub OAuth가 가장 단순하고 안전하기 때문이다.
- **Acceptance Criteria**:
  - **happy**: GIVEN `/admin/*` path application이 Cloudflare Access에 등록되고 GitHub OAuth IdP + 본인 email allowlist가 설정된 상태 WHEN 익명 사용자가 `/admin/posts` 접근 THEN Cloudflare Access가 가로채 GitHub OAuth 로그인 페이지로 리다이렉트, Workers 코드는 호출되지 않는다
  - **happy**: GIVEN 본인이 GitHub OAuth 로그인 성공 WHEN `/admin/posts` 재요청 THEN 요청 헤더에 `Cf-Access-Authenticated-User-Email: 86tkstar@gmail.com` + `Cf-Access-Jwt-Assertion: <JWT>`가 포함되어 Workers 도달, Workers가 JWT 서명을 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs`의 공개키로 검증하여 통과시킨다
  - **error**: GIVEN 위조된 `Cf-Access-Authenticated-User-Email` 헤더 + 누락/위조된 JWT로 직접 Workers 호출 시도 WHEN Workers의 access-guard 미들웨어 실행 THEN JWT 검증 실패 → 401 응답, D1/R2 작업 모두 차단
  - **error**: GIVEN Cloudflare Access가 설정 누락(또는 일시 장애)로 헤더가 비어있는 상태 WHEN `/admin/*` 요청 도달 THEN Workers는 fail-closed — 요청을 거부(500 또는 401), 본인 1명 인증이 보장되지 않으면 절대 admin 동작 수행 X
  - **edge**: GIVEN JWT 공개키 fetch가 매 요청 발생하면 latency·요금 증가 WHEN Workers가 첫 admin 요청 처리 THEN 공개키를 in-memory 또는 Workers Cache API로 1시간 단위 캐시하여 후속 요청은 fetch 생략
- **Edge Cases**: 헤더 비어있음 → fail-closed, JWT 공개키 1시간 캐시
- **Dependencies**: _없음_
- **Out-of-scope (이 기능 한정)**: Multi-user collaboration, 권한 분리

### 4.3 보류 기능 (Deferred Features)
| 기능명 | 보류 사유 | 검토 시점 |
| --- | --- | --- |
| (Removed) F001 청중 분기 split CTA | design 정본의 검색 우선 컨셉 채택으로 폐기. F001은 'Hero whoami + 검색 + 빠른 링크'로 재정의됨 | 재도입 검토 없음 — 통합 CTA + 콘텐츠 라우팅 유지 |
| (Removed) F015 청중 분기 기억 (audience localStorage) | F001 폐기에 따라 동시 폐기. `proto-theme` localStorage는 F010이 그대로 사용 | 재도입 검토 없음 |
| 뉴스레터 구독 / 이메일 마케팅 | 1인 운영 부담 + Resend Contact Form으로 채널 충분 | 운영 안정화 후 재검토 |
| 블로그 댓글 시스템 (Giscus 등) | 스팸 관리 부담 + 메일 채널 우선 | 재도입 검토 없음(현 MVP 기준) |
| i18n (영문/일문 등 추가 언어) | 한국어 only 운영. 콘텐츠 분량 대비 번역 비용 과다 | 해외 의뢰 비중 증가 시 |
| 가격표 / 결제 페이지 | 메일 문의로 가격 협의 시작 — 가격 노출 안 함 | 재도입 검토 없음 |
| `/uses`, `/now` 페이지 | 운영 부담 대비 가치 낮음 | 재도입 검토 없음 |
| 별도 PDF 이력서 트리 | F003 CSS print로 충분 | 재도입 검토 없음 |
| DB 기반 일반 콘텐츠 관리 (Project/Legal 포함) | Post만 D1 이관(F021). Project/AppLegalDoc은 velite + MDX 정적 유지(작성 빈도·복잡도 차이) | 재도입 검토 없음 |
| 일반 방문자 인증/회원가입/로그인 | 본인 1명 admin 인증만 Cloudflare Access(F023) 위임. 일반 방문자 인증 없음 | 재도입 검토 없음 |
| Draft auto-save (주기 자동 저장) | F020 명시적 보류 — 수동 [Save]/[Publish]만 지원 | 사용자 피드백 수집 후 |
| Scheduled publish (예약 발행) | F020 명시적 보류 | 사용자 피드백 수집 후 |
| Post 버전 히스토리 / 롤백 | F021 명시적 보류 — hard delete만 지원 | 사용자 피드백 수집 후 |
| Cloudflare Images (자동 WebP/AVIF 변환) | F022 명시적 보류 — MVP는 R2 단순 제공 | 이미지 트래픽 비용 임계 도달 시 |
| Multi-user collaboration / 권한 분리 | F023 명시적 보류 — 본인 1명 전용 | 재도입 검토 없음 |
| Motion 라이브러리 도입 | design 정본은 절제된 CSS-only motion(@keyframes blink/fade + 120ms hover transition). MVP에서는 CSS-only로 충분 | 추후 인터랙션 보강 시 재검토 |

---

## 5. 정보 구조 (Surface Map / Information Architecture)

### 5.1 Web Surfaces
```
tkstar.dev
├── /                       (Home — F001/F017)
├── /about                  (About — F002/F003)
├── /projects               (Projects 목록 — F004)
│   └── /projects/:slug     (Project Detail — F005/F011)
├── /blog                   (Blog 목록 — F006)
│   └── /blog/:slug         (Blog Detail — F007/F011/F021)
├── /contact                (Contact Form — F008/F009)
├── /legal                  (Legal Index — F014, 앱 1개 이상 시 노출)
│   └── /legal/apps/:slug/  (App Terms/Privacy chrome-free — F014)
│       ├── terms
│       └── privacy
├── /admin/*                (Cloudflare Access 보호 — F023, 본인 전용)
│   ├── /admin/posts        (Posts List — F020/F021)
│   ├── /admin/posts/new    (Post Editor 신규 — F020/F021/F022)
│   ├── /admin/posts/:slug/edit (Post Editor 편집 — F020/F021/F022)
│   ├── /admin/media        (Media Library — F022)
│   └── /admin/api/upload   (R2 Upload Proxy — F022/F023, internal endpoint)
├── /rss.xml                (RSS Feed Resource — F012)
├── /sitemap.xml            (Sitemap Resource — F018, Launch Gate 적용)
├── /robots.txt             (Robots Resource — F018, Launch Gate 적용)
├── /og/:slug.png           (Satori OG Image Generator — F011)
└── *  (splat)              (404 Not Found Fallback — noindex,nofollow)

Global:
├── Topbar (Brand/Path/Search Trigger/Theme Toggle — F010/F016)
├── Footer (©/GitHub/X/RSS/Contact/Legal Index — F012/F014)
├── Cmd+K Command Palette (root layout mount — F016)
└── Analytics + SEO meta + JSON-LD (root layout — F013/F018/F019)
```

### 5.2 Mobile Surfaces
_해당 없음_

### 5.3 Backend Surfaces (Endpoint Groups)
_해당 없음_

---

## 6. Surface 상세 (Surface Details)

### 6.1 Home Page
> **구현 기능**: F001, F017, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 사이트의 첫 진입점. whoami 자기소개 + 검색 진입 + Featured Project + Recent Posts로 두 청중을 모두 자연스럽게 수렴 |
| 진입 경로 (Entry Path) | 외부 검색 결과 / SNS 공유 / 직접 입력 / 헤더 브랜드 클릭 |
| 사용자 행동 (User Actions) | Hero 카피 확인 → [검색해서 이동] 클릭(또는 ⌘K) → palette 오픈 / [/about] 또는 [/projects] 빠른 링크 / Featured Project 카드 클릭 / Recent Posts 행 클릭 / '모두 보기 →' 클릭 / 다크모드 토글 |
| 핵심 요소 (Key Elements) | Hero(`whoami` 프롬프트 + 'ship solo. ship fast.' 카피 + 핵심 요약) / 3-버튼 클러스터 / `## featured` 큰 카드 1개 / `## recent posts` 최근 3개 행 + '모두 보기 →' |
| 표시 데이터 (Data Displayed) | velite Project 컬렉션에서 `featured: true` 첫 항목 + D1/velite의 발행된 Post 최근 3건(date_published DESC) |
| 다음 이동 (Next Navigation) | Command Palette / About / Projects / Project Detail / Blog / Blog Detail |
| 빈 상태 (Empty State) | `featured: true` Project 0건 또는 발행된 Post 0건 → 해당 섹션 비표시, 다른 섹션은 정상 렌더 |
| 에러 상태 (Error State) | Featured/Recent 데이터 fetch 실패 → 섹션 비표시 + Workers logs 기록, Hero·Topbar·Footer는 정상 동작 |
| 접근 제어 (Access Control) | 공개 — 모든 role 접근 가능 |

### 6.2 About Page
> **구현 기능**: F002, F003, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 사이트 자체가 이력서. 이력·기술스택·경력·학력·수상을 한 페이지에 정리하여 B2B 청중의 검토를 즉시 만족 |
| 진입 경로 (Entry Path) | palette `/about` / Home 빠른 링크 / Footer Contact 인근 / 외부 검색 결과 |
| 사용자 행동 (User Actions) | 본문 스크롤로 섹션별 검토. 인쇄 시 '⎙ PDF' 버튼 클릭 → 시스템 인쇄 다이얼로그에서 PDF 저장 |
| 핵심 요소 (Key Elements) | 헤더(이름 + 한 줄 포지셔닝 + 이메일 + [⎙ PDF]) / 기술스택 카드 3개(frontend/edge·backend/quality) / 경력 통합 timeline(역순, type='company'\|'solo' 분기) / 학력 / 수상 카드 / `@media print` 스타일 분기(F003) |
| 표시 데이터 (Data Displayed) | 정적 이력 데이터(코드/콘텐츠 모듈) + velite Project frontmatter의 solo 경력 정보 끌어오기 |
| 다음 이동 (Next Navigation) | Command Palette / Projects / Blog / Contact |
| 빈 상태 (Empty State) | 회사 경력 0건 + solo 1건 이상 → solo 마커만 표시, 빈 회사 섹션 비노출 |
| 에러 상태 (Error State) | PDF 인쇄 다이얼로그 호출 실패 → 브라우저 기본 동작 + 토스트 안내 |
| 접근 제어 (Access Control) | 공개 — 모든 role 접근 가능 |

### 6.3 Projects Page
> **구현 기능**: F004, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 프로젝트 포트폴리오 진열. B2C 청중에게 '이 사람이 내 문제를 해결할 수 있는가'의 1차 답변 |
| 진입 경로 (Entry Path) | palette `/projects` / Home 빠른 링크 / Home Featured Project 카드 / About 페이지 내부 링크 |
| 사용자 행동 (User Actions) | 태그 칩으로 필터링 → ls-style 행 훑기 → 관심 프로젝트 행 클릭 |
| 핵심 요소 (Key Elements) | ls-style 행 리스트(slug/ + title + date(YYYY-MM) / summary / stack pills) / 상단 태그 필터 칩 / velite + MDX collection(frontmatter Zod 검증) |
| 표시 데이터 (Data Displayed) | velite Project 컬렉션(frontmatter Zod 검증 통과한 모든 항목, 발행일 역순) |
| 다음 이동 (Next Navigation) | Project Detail Page / Contact Page |
| 빈 상태 (Empty State) | 프로젝트 0건 또는 필터 결과 0건 → '결과가 없습니다' 메시지 + 태그 필터 초기화 버튼 |
| 에러 상태 (Error State) | velite collection 로드 실패 → SSR 500 + Workers logs 기록(빌드 단계 fail-fast로 production에서는 발생 X) |
| 접근 제어 (Access Control) | 공개 — 모든 role 접근 가능 |

### 6.4 Project Detail Page
> **구현 기능**: F005, F011, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | Case Study. 한 프로젝트를 '문제 → 접근 → 결과(수치/스크린샷)' 구조로 깊이 있게 보여주어 신뢰성 입증 |
| 진입 경로 (Entry Path) | Projects Page에서 행 클릭 / Home Featured 카드 / 외부 검색·SNS 공유(Satori OG) |
| 사용자 행동 (User Actions) | 본문 스크롤로 문제·접근·결과 순차 검토 → sticky sidebar에서 섹션 점프 → 코드블록·스크린샷 확인 → 하단 [의뢰하기 →] CTA 또는 prev/next로 이동 |
| 핵심 요소 (Key Elements) | frontmatter(title/summary/date/stack/tags/metrics/featured/cover) / 본문 MDX(problem/approach/results) / shiki 코드블록 highlight / Satori 동적 OG 1200×630 / 데스크탑 880px+ sticky sidebar(`.two-col`: meta + on-this-page TOC) / 하단 3분할(`← prev` / `[의뢰하기 →]` primary / `next →`) |
| 표시 데이터 (Data Displayed) | velite Project 컬렉션의 단일 항목(slug match) + D1 `project_meta.cover_image_url/cover_alt`(F022 이후) |
| 다음 이동 (Next Navigation) | prev/next 프로젝트 / Projects Page / Contact Page |
| 빈 상태 (Empty State) | MDX 본문에 추출 가능한 h2 헤딩 없음 → sidebar TOC 영역 비표시 |
| 에러 상태 (Error State) | 존재하지 않는 slug → 404 Fallback. Satori OG 실패 → 정적 fallback PNG |
| 접근 제어 (Access Control) | 공개 — 모든 role 접근 가능 |

### 6.5 Blog Page
> **구현 기능**: F006, F012, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 글 목록 진열. 월 1편 작성으로 전문성 노출 + SEO 자산 누적 |
| 진입 경로 (Entry Path) | palette `/blog` / Home Recent Posts → '모두 보기' / 외부 검색 결과 / RSS 리더의 백링크 |
| 사용자 행동 (User Actions) | 발행일 역순 목록 훑기 → 태그 필터 → 글 카드/제목 클릭 → RSS 구독 링크 사용 |
| 핵심 요소 (Key Elements) | 발행일 역순 정렬 / 태그 필터 / 글 행(제목/발행일/한 줄 요약/태그/읽는 시간) / RSS 피드 링크(`/rss.xml`) |
| 표시 데이터 (Data Displayed) | D1 (`status='published' ORDER BY date_published DESC`) + 마이그레이션 전 velite Post 컬렉션 |
| 다음 이동 (Next Navigation) | 글 카드 클릭 → Blog Detail Page |
| 빈 상태 (Empty State) | 발행된 Post 0건 → '아직 발행된 글이 없습니다' 메시지 + RSS 링크 유지 |
| 에러 상태 (Error State) | D1 SELECT 실패 → SSR 500 + Workers logs 기록 + 캐시된 이전 응답이 있으면 stale serve |
| 접근 제어 (Access Control) | 공개 — 모든 role 접근 가능 |

### 6.6 Blog Detail Page
> **구현 기능**: F007, F011, F021, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 글 단위 SEO 진입점. 외부 검색에서 직접 도달하는 첫 페이지로 자주 동작 |
| 진입 경로 (Entry Path) | Blog Page에서 카드 클릭 / Home Recent Posts / 외부 검색 / SNS 공유(Satori OG) / RSS 리더 |
| 사용자 행동 (User Actions) | 본문 읽기 → sticky sidebar TOC로 섹션 점프 → 코드블록 복사 → 사이드바 share(copy link / X) → 하단 prev/next 또는 '모든 글' |
| 핵심 요소 (Key Elements) | frontmatter(title/lede/date/tags/read) / MDX 본문 + shiki 코드블록 highlight / Satori 동적 OG 1200×630 / 데스크탑 880px+ sticky sidebar(`.two-col`: on-this-page TOC + share 도구[copy link]/[share on X]) / 하단 3분할(`← prev` / `[모든 글] → /blog` / `next →`) |
| 표시 데이터 (Data Displayed) | D1 `posts` 테이블 단일 행(slug match, status='published') — `raw_markdown` 런타임 컴파일 + KV cache(`post:{slug}:body:v{updated_at-hash}`) |
| 다음 이동 (Next Navigation) | prev/next 글 / Blog Page / Contact Page |
| 빈 상태 (Empty State) | MDX 본문에 추출 가능한 h2 헤딩 없음 → TOC 비표시. share 도구는 유지 |
| 에러 상태 (Error State) | 존재하지 않는 slug 또는 status='draft' → 404 Fallback. Satori OG 실패 → 정적 fallback PNG. 런타임 컴파일 실패 → 500 + Workers logs |
| 접근 제어 (Access Control) | 공개 — draft 글은 익명 접근 시 404. admin은 `/admin/posts/{slug}/edit` 경로로만 접근 |

### 6.7 Contact Page
> **구현 기능**: F008, F009, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | B2B 채용 제안과 B2C 의뢰 모두를 메일 채널로 수렴. 가격은 노출하지 않고 메시지로 협의 시작 |
| 진입 경로 (Entry Path) | palette `/contact` / Footer Contact 링크 / About 본문 / Project Detail의 '의뢰하기' CTA |
| 사용자 행동 (User Actions) | 폼 작성: 이름, 회사(선택), 이메일, 의뢰 유형(B2B/B2C/기타) 라디오, 메시지 → Turnstile 검증 → 제출 |
| 핵심 요소 (Key Elements) | 입력 필드(이름/회사 선택/이메일/의뢰 유형 라디오/메시지) / 클라이언트 검증(이름·이메일 정규식·메시지 10자 이상) / Cloudflare Turnstile 위젯 / Resend 발신 / React Email 자동응답 / 성공 화면 카피 / 실패 시 mailto 폴백 |
| 표시 데이터 (Data Displayed) | 성공: '자동응답 메일이 {email}으로 발송되었습니다. 평균 회신 24시간 이내.' / 실패: 인라인 에러 + 폼 입력값 유지 |
| 다음 이동 (Next Navigation) | 성공 → Contact 성공 상태 화면 / 실패 → 폼 유지 + 에러 표시 |
| 빈 상태 (Empty State) | 최초 폼 — 모든 필드 빈 상태, submit 버튼은 Turnstile 토큰 미수신으로 비활성화 |
| 에러 상태 (Error State) | 검증 실패 → 인라인 에러 / Turnstile 위조 → 400 / 동일 IP 5회/시간 초과 → 429 / Resend 5xx → 에러 토스트 + mailto:hello@tkstar.dev?subject=...&body=... 폴백(폼 값 prefill) |
| 접근 제어 (Access Control) | 공개 — 모든 role이 제출 가능(Turnstile 검증으로 봇 차단) |

### 6.8 Legal Index Page
> **구현 기능**: F014, F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 출시 앱 목록 허브. 각 앱의 Terms/Privacy 링크를 카드 형태로 진열 |
| 진입 경로 (Entry Path) | Footer Legal 링크(앱 등록 후) / palette `/legal` / 외부 앱 내부 링크의 폴백 |
| 사용자 행동 (User Actions) | 앱 카드 훑기 → 원하는 앱의 Terms 또는 Privacy 클릭 |
| 핵심 요소 (Key Elements) | velite collection 인덱스(`legal/apps/[slug]/terms.mdx`, `privacy.mdx` 자동 수집) / 앱 카드(앱명/slug/[terms]/[privacy] 링크) / 일반 chrome(Topbar/Footer 노출) |
| 표시 데이터 (Data Displayed) | velite `legal` 컬렉션 — 등록된 모든 app_slug |
| 다음 이동 (Next Navigation) | 앱 카드 클릭 → App Terms Page 또는 App Privacy Page(chrome-free) |
| 빈 상태 (Empty State) | 등록된 앱 0건 → Footer Legal 링크 자체 비노출. 직접 URL 입력 시에는 '등록된 앱이 없습니다' 메시지 |
| 에러 상태 (Error State) | velite collection 로드 실패 → SSR 500(빌드 단계 fail-fast로 production에서는 발생 X) |
| 접근 제어 (Access Control) | 공개 — 모든 role 접근 가능 |

### 6.9 App Terms Page
> **구현 기능**: F014, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 출시 앱별 이용약관 페이지. 앱 내부 WebView에서 호출되므로 chrome-free sober 모드 |
| 진입 경로 (Entry Path) | 출시 앱 내부 '이용약관' 링크(WebView) / Legal Index Page |
| 사용자 행동 (User Actions) | 약관 본문 읽기(스크롤). 외부 링크 클릭으로 앱·스토어로 복귀 |
| 핵심 요소 (Key Elements) | velite collection `legal/apps/[slug]/terms.mdx` / MDX 본문 + 발효일 메타 / chrome-free 레이아웃(Topbar/Footer 미노출, `.legal` 컨테이너 max-width 680px, sober mode, TOC, 표 스타일) |
| 표시 데이터 (Data Displayed) | velite `legal` 컬렉션의 단일 항목(app_slug + doc_type='terms') |
| 다음 이동 (Next Navigation) | 같은 앱의 Privacy 페이지 / 외부 앱·스토어 |
| 빈 상태 (Empty State) | MVP: 빈 템플릿 + 라우팅만 — '약관이 곧 게재됩니다' 메시지 |
| 에러 상태 (Error State) | 존재하지 않는 app_slug → 404 Fallback |
| 접근 제어 (Access Control) | 공개 — 차등 인덱싱(`noindex,follow` + sitemap.xml 제외, canonical 유지) |

### 6.10 App Privacy Page
> **구현 기능**: F014, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 출시 앱별 개인정보처리방침 페이지. 앱 내부 WebView에서 호출되므로 chrome-free sober 모드 |
| 진입 경로 (Entry Path) | 출시 앱 내부 '개인정보처리방침' 링크(WebView) / Legal Index Page |
| 사용자 행동 (User Actions) | 처리방침 본문 읽기. 외부 링크로 복귀 |
| 핵심 요소 (Key Elements) | velite collection `legal/apps/[slug]/privacy.mdx` / MDX 본문 + 시행일·문의 채널(hello@tkstar.dev) 메타 / chrome-free 레이아웃 |
| 표시 데이터 (Data Displayed) | velite `legal` 컬렉션의 단일 항목(app_slug + doc_type='privacy') |
| 다음 이동 (Next Navigation) | 같은 앱의 Terms 페이지 / 외부 앱·스토어 |
| 빈 상태 (Empty State) | MVP: 빈 템플릿 + 라우팅만 |
| 에러 상태 (Error State) | 존재하지 않는 app_slug → 404 Fallback |
| 접근 제어 (Access Control) | 공개 — 차등 인덱싱(`noindex,follow` + sitemap.xml 제외, canonical 유지) |

### 6.11 Not Found Fallback
> **구현 기능**: F016, F010, F013, F018, F019 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 미존재 경로의 폴백. 터미널 메타포로 디자인 톤 일관성 유지 |
| 진입 경로 (Entry Path) | 잘못된 URL 직접 입력 / 깨진 링크 클릭 / status='draft' 글 익명 접근 |
| 사용자 행동 (User Actions) | 메시지 확인 → '← /home' 링크 클릭 또는 ⌘K로 검색 |
| 핵심 요소 (Key Elements) | 터미널 메시지(`cd: no such route: <path>`) / '← /home' 복귀 링크 / React Router v7 splat(`*`) 라우트 또는 ErrorBoundary 구현 |
| 표시 데이터 (Data Displayed) | 요청 path만 표시(서버 사이드 그대로 echo) |
| 다음 이동 (Next Navigation) | Home / Command Palette |
| 빈 상태 (Empty State) | —(404 자체가 일종의 빈 상태) |
| 에러 상태 (Error State) | ErrorBoundary 자체가 실패 시 React Router 기본 ErrorElement로 fallback |
| 접근 제어 (Access Control) | 공개 — 차등 인덱싱(`noindex,nofollow` + 404 응답 + sitemap.xml 제외) |

### 6.12 Admin Layout
> **구현 기능**: F023 | **접근 권한**: admin | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | 모든 `/admin/*` 라우트의 인증 게이트 + 공통 레이아웃. Cloudflare Access가 미인증 요청을 가로채 GitHub OAuth로 리다이렉트 → 인증 후 Workers 도달 |
| 진입 경로 (Entry Path) | 본인이 직접 URL 입력(예: `tkstar.dev/admin/posts`) → Cloudflare Access 게이트 → GitHub 로그인 → Admin 화면 |
| 사용자 행동 (User Actions) | 좌측 nav로 Posts List / Media Library 이동, 상단에 로그인 이메일 표시 |
| 핵심 요소 (Key Elements) | Cloudflare Access path application으로 `/admin/*` 보호 / Workers는 `Cf-Access-Authenticated-User-Email` + `Cf-Access-Jwt-Assertion` JWT만 검증 / JWT 공개키 fetch 후 Workers Cache API 1시간 캐시 / 별도 admin shell(좌측 nav, 상단 로그인 이메일) / 일반 ChromeLayout(Topbar/Footer)과 분리 |
| 표시 데이터 (Data Displayed) | AccessIdentity(`Cf-Access-Authenticated-User-Email` 헤더 값) |
| 다음 이동 (Next Navigation) | Admin Posts List / Admin Media Library |
| 빈 상태 (Empty State) | —(게이트 자체는 빈 상태 없음, 인증 후 자동으로 Posts List 또는 요청 경로로 이동) |
| 에러 상태 (Error State) | 헤더 비어있음 → fail-closed(500 또는 401). JWT 검증 실패 → 401. JWT 공개키 fetch 실패 → 캐시된 키 사용, 캐시 미스 시 fail-closed |
| 접근 제어 (Access Control) | Cloudflare Access GitHub OAuth + 본인 1명 email allowlist. `<meta name='robots' content='noindex,nofollow'>` + sitemap.xml 제외 + Cmd+K palette 인덱스 제외 |

### 6.13 Admin Posts List
> **구현 기능**: F020, F021, F023 | **접근 권한**: admin | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | D1에 저장된 모든 Post(draft + published) 목록. 신규 작성 진입점 + 기존 글 편집 진입점 |
| 진입 경로 (Entry Path) | Admin Layout 좌측 nav `/admin/posts` / 직접 URL 입력(Cloudflare Access 통과 후) |
| 사용자 행동 (User Actions) | 목록 훑기 → status 필터(draft/published/전체) → `[+ New Post]` 클릭 → `/admin/posts/new` / 행 클릭 → `/admin/posts/{slug}/edit` |
| 핵심 요소 (Key Elements) | D1 `posts` 테이블 SELECT(slug/title/status/date_published/updated_at) / status 필터 칩 / `[+ New Post]` primary 버튼 / 행 클릭 편집 진입 / 삭제 버튼(확인 모달, hard delete) |
| 표시 데이터 (Data Displayed) | D1 posts (draft + published, status·date_published·updated_at 정렬 가능) |
| 다음 이동 (Next Navigation) | Admin Post Editor(신규/편집) / Admin Layout 다른 nav |
| 빈 상태 (Empty State) | Post 0건 → '아직 작성된 글이 없습니다. [+ New Post]로 시작하세요' 메시지 |
| 에러 상태 (Error State) | D1 SELECT 실패 → 인라인 에러 + 재시도 버튼 + Workers logs 기록 |
| 접근 제어 (Access Control) | admin 전용 — Cloudflare Access 게이트 통과 필수. noindex,nofollow |

### 6.14 Admin Post Editor
> **구현 기능**: F020, F021, F022, F023 | **접근 권한**: admin | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | Tiptap WYSIWYG markdown 에디터로 Post 작성·편집. Save(draft 저장) / Publish(status=published) 분리. 모바일/외부에서 글 작성 가능하도록 함 |
| 진입 경로 (Entry Path) | Admin Posts List `[+ New Post]`(`/admin/posts/new`) / 기존 글 행 클릭(`/admin/posts/{slug}/edit`) |
| 사용자 행동 (User Actions) | frontmatter 메타(title/summary/tags/date_published) 입력 → Tiptap 본문 작성 → toolbar(bold/italic/link/code/image) 사용 → 이미지 버튼 → R2 업로드 → `[Save]`(draft) 또는 `[Publish]`(published) 클릭 |
| 핵심 요소 (Key Elements) | frontmatter 폼(title/summary/tags chip input/date_published date picker) / 좌측 Tiptap 에디터(markdown serialize 보장, 커스텀 JSX 컴포넌트 X) / 상단 toolbar(bold/italic/link/inline code/image) / 우측 SSR-style preview(Blog Detail F007과 동일 컴파일러·스타일) / 이미지 버튼 → file picker → `POST /admin/api/upload` → R2 → 본문 `![alt](URL)` 자동 삽입 / [Save] D1 INSERT/UPDATE status='draft' / [Publish] D1 UPDATE status='published'+date_published+updated_at / Publish 후 search-index.json 재생성 + KV cache `post:{slug}:body:v*` 무효화 |
| 표시 데이터 (Data Displayed) | 기존 글 편집 시: D1 단일 행 + 본문 raw_markdown. 신규: 빈 폼 |
| 다음 이동 (Next Navigation) | Save 성공 → 같은 편집 화면 유지(toast) / Publish 성공 → Admin Posts List 복귀 / 실패 → 인라인 에러 + 폼 유지 |
| 빈 상태 (Empty State) | 신규 모드 — frontmatter 폼 빈 상태, 본문 placeholder('내용을 입력하세요') |
| 에러 상태 (Error State) | D1 INSERT/UPDATE 실패 → 인라인 에러 + 폼 입력값 유지. R2 업로드 실패 → 토스트 + 본문 삽입 X. search-index 재생성 실패 → Publish는 성공으로 처리하되 백그라운드 재시도 큐 + Workers logs(F020 명시적 보류 부분 제외) |
| 접근 제어 (Access Control) | admin 전용 — Cloudflare Access 게이트 통과 필수. noindex,nofollow |

### 6.15 Admin Media Library
> **구현 기능**: F022, F023 | **접근 권한**: admin | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | R2에 업로드된 모든 미디어 자산 목록. Project cover / Post 본문 이미지의 재사용 + 삭제 |
| 진입 경로 (Entry Path) | Admin Layout 좌측 nav `/admin/media` / Admin Post Editor의 '라이브러리에서 선택'(옵션) |
| 사용자 행동 (User Actions) | 그리드로 자산 훑기 → 파일 클릭 → 미리보기 + URL 복사 / 삭제 버튼 → 확인 후 R2 DELETE |
| 핵심 요소 (Key Elements) | R2 list objects(prefix `media/`) / 그리드 썸네일 + 파일 메타(key/업로드 일시/크기) / `[Copy URL]` 본문 삽입용 public URL 복사 / `[Delete]` R2 DELETE + 확인 모달(참조 추적 없음, 사용자 책임) |
| 표시 데이터 (Data Displayed) | R2 list objects 결과 — MediaAsset(key/url/size/uploaded) |
| 다음 이동 (Next Navigation) | Admin Post Editor(URL 복사 후 복귀) / Admin Layout 다른 nav |
| 빈 상태 (Empty State) | 자산 0건 → '업로드된 미디어가 없습니다. Post Editor의 image 버튼으로 업로드하세요' 메시지 |
| 에러 상태 (Error State) | R2 list 실패 → 인라인 에러 + 재시도. R2 DELETE 실패 → 토스트 + 목록 갱신 X |
| 접근 제어 (Access Control) | admin 전용 — Cloudflare Access 게이트 통과 필수. noindex,nofollow |

### 6.16 RSS Feed Resource
> **구현 기능**: F012 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | `/rss.xml` resource route — 발행된 Post의 RSS 2.0 XML 피드 응답 |
| 진입 경로 (Entry Path) | 외부 RSS 리더의 fetch / Footer RSS 링크 / palette indirect |
| 사용자 행동 (User Actions) | —(machine consumption) |
| 핵심 요소 (Key Elements) | RSS 2.0 XML structure(channel 메타 + item per post) / `Content-Type: application/xml` |
| 표시 데이터 (Data Displayed) | D1 또는 velite의 status='published' Post 메타(title/link/description/pubDate) |
| 다음 이동 (Next Navigation) | — |
| 빈 상태 (Empty State) | 발행된 Post 0건 → 빈 RSS XML(channel 메타만), 200 응답 |
| 에러 상태 (Error State) | D1 SELECT 실패 → 5xx + Workers logs. Launch Gate OFF 영향은 받지 않음(피드 자체는 정상 응답) |
| 접근 제어 (Access Control) | 공개 — Cache-Control: public, s-maxage=3600 (Workers Cache API) |

### 6.17 OG Image Generator
> **구현 기능**: F011 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | `/og/[slug].png` resource route — Satori로 1200×630 PNG OG 이미지 생성 |
| 진입 경로 (Entry Path) | Blog Detail / Project Detail의 `<meta property='og:image'>` 자동 fetch / SNS unfurl 봇 |
| 사용자 행동 (User Actions) | —(machine consumption) |
| 핵심 요소 (Key Elements) | Satori SVG 빌드 → resvg-wasm PNG 변환 / 1200×630 통일 / JetBrains Mono self-host 폰트 binary / `Cache-Control: public, max-age=31536000, immutable` |
| 표시 데이터 (Data Displayed) | frontmatter(title/date/tags) 기반 동적 PNG |
| 다음 이동 (Next Navigation) | — |
| 빈 상태 (Empty State) | 존재하지 않는 slug → default fallback PNG(브랜드 로고 + 'tkstar.dev') |
| 에러 상태 (Error State) | Satori 렌더링 실패(폰트 binary 누락 등) → 정적 fallback PNG + Workers logs 기록 |
| 접근 제어 (Access Control) | 공개 |

### 6.18 Upload Proxy
> **구현 기능**: F022, F023 | **접근 권한**: admin | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | `POST /admin/api/upload` internal endpoint — multipart/form-data를 받아 R2 PUT, `{url, key}` JSON 응답. Admin Post Editor의 이미지 toolbar 버튼 전용 |
| 진입 경로 (Entry Path) | Admin Post Editor 이미지 toolbar 버튼 → file picker → fetch(`POST /admin/api/upload`) |
| 사용자 행동 (User Actions) | —(programmatic from Editor) |
| 핵심 요소 (Key Elements) | multipart/form-data 파싱 / 파일 키 `media/{yyyy}/{mm}/{nanoid}.{ext}` (nanoid 21자) / R2 PUT(R2 클라이언트 후보 중 채택 — OQ-MEDIA-CLIENT) / `{url, key}` JSON 응답 / Cloudflare Access 게이트 보호(F023) |
| 표시 데이터 (Data Displayed) | 응답 JSON: `{ url, key }` |
| 다음 이동 (Next Navigation) | — |
| 빈 상태 (Empty State) | — |
| 에러 상태 (Error State) | Cloudflare Access 미통과 → Workers 도달 X. JWT 검증 실패 → 401. 파일 크기 초과 또는 비허용 MIME → 400 + 메시지. R2 PUT 실패 → 500 + Workers logs + 재시도 가능 응답 |
| 접근 제어 (Access Control) | admin 전용 — Cloudflare Access path application 보호 + Workers access-guard 미들웨어. noindex,nofollow(메타 무관, UI 없음) |

### 6.19 Sitemap / Robots Resource
> **구현 기능**: F018 | **접근 권한**: anonymous, admin, bot | **플랫폼**: Web

| 항목 | 내용 |
| --- | --- |
| 역할 (Purpose) | `/sitemap.xml` + `/robots.txt` resource routes — 검색엔진 크롤러에게 인덱싱 가능 페이지 + 정책 제공. Launch Gate 적용 |
| 진입 경로 (Entry Path) | 검색엔진 크롤러 fetch / 사용자 직접 입력(검증용) |
| 사용자 행동 (User Actions) | — |
| 핵심 요소 (Key Elements) | sitemap.xml(정적 routes + projects/posts/Legal Index slug, App Terms/Privacy/404/admin 제외) / robots.txt(User-agent: */Allow: //Sitemap 위치) / Launch Gate OFF 시 sitemap empty urlset + robots Disallow: / 강제 |
| 표시 데이터 (Data Displayed) | velite Project collection + D1 published Posts + Legal Index slug |
| 다음 이동 (Next Navigation) | — |
| 빈 상태 (Empty State) | Launch Gate OFF → empty sitemap + Disallow robots |
| 에러 상태 (Error State) | velite/D1 fetch 실패 → 5xx + Workers logs. fallback으로 정적 routes만이라도 응답하는 옵션은 미구현(F018 향후 보강) |
| 접근 제어 (Access Control) | 공개 — Cache-Control: public, s-maxage=300 |

---

## 7. 데이터 모델 (Data Model)

### 7.1 엔티티 정의 (Entity Definitions)

#### Project (velite + MDX 정적 컬렉션)
_프로젝트 Case Study 콘텐츠. velite collection으로 정적 빌드. cover 메타는 F022 이후 D1 ProjectMeta로 이관_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| slug | string | UNIQUE, URL-safe | URL 경로용 고유 식별자 |
| title | string | required | 프로젝트명 |
| summary (alias lede) | string | required | 한 줄 요약 |
| date | string | YYYY-MM 또는 ISO | 프로젝트 시기(design은 YYYY-MM 사용) |
| tags | string[] | optional | 분류 태그 |
| stack | string[] | required | 사용 기술(사이드바 stack pills + 행 리스트의 stack pills) |
| metrics | [string, string][] | optional | 결과 지표 키-값 쌍(예: ['MAU', '12k']) |
| featured | boolean | optional, default false | Home Featured 섹션 노출 여부(true인 첫 항목 사용) |
| cover | string (deprecated post-F022) | optional, D1 store after F022 | F022 이후 project_meta.cover_image_url로 이관, frontmatter는 deprecation |
| cover_alt | string (D1 only) | F022 신규 필드 | D1에서만 관리, 접근성용 alt |
| body | MDX | required | 본문(problem/approach/results 섹션). frontmatter 아님 |

#### Post (Cloudflare D1, F021)
_블로그 글 콘텐츠. velite에서 제거되어 D1으로 이관. Drizzle ORM 액세스. 일회성 마이그레이션 스크립트로 기존 `content/posts/*.mdx` → D1 INSERT_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| id | integer | PK, autoincrement | D1 내부 식별자 |
| slug | string | UNIQUE | URL 경로용 |
| title | string | required | 글 제목 |
| summary (alias lede) | string | required | 한 줄 요약 |
| raw_markdown | text | required | 본문 markdown 원본(frontmatter 제외). SSR 런타임 컴파일 + KV cache로 렌더 |
| tags | text (JSON array) | JSON.stringify(string[]) | 분류 태그 |
| date_published | string (ISO) | nullable (draft 단계) | 발행일 |
| status | enum 'draft' \| 'published' | required, default 'draft' | F020 Save는 draft, Publish는 published. 익명 사용자는 published만 노출 |
| created_at | string (ISO) | required, default now | INSERT 시각 |
| updated_at | string (ISO) | required, on update | UPDATE 시각(KV cache 키 해시 입력) |

#### ProjectMeta (Cloudflare D1, F022)
_Project의 D1 backed 메타. velite Project의 cover 필드 분리 산출물. velite Project 본문 MDX는 그대로 유지_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| slug | string | PK | velite Project의 slug와 1:1 매핑 |
| cover_image_url | string | nullable | R2 public URL(`media/{yyyy}/{mm}/{nanoid}.{ext}`) 또는 외부 URL |
| cover_alt | string | nullable | 접근성용 alt 텍스트 |
| updated_at | string (ISO) | required, on update | UPDATE 시각 |

#### MediaAsset (Cloudflare R2 + 인메모리 응답 모델, F022)
_R2 자체가 정본. 별도 D1 테이블 없이 R2 list objects API로 조회(Admin Media Library가 직접 R2 query). 본 항목은 응답 형태 정의용_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| key | string | R2 object key | `media/{yyyy}/{mm}/{nanoid}.{ext}` 패턴 |
| url | string | required | public read URL(R2 public bucket 또는 Workers proxy 라우트 — OQ-MEDIA-CLIENT 결정에 따름) |
| size | number (bytes) | R2 metadata | 파일 크기 |
| uploaded | string (ISO) | R2 metadata | 업로드 시각 |

#### AccessIdentity (Cloudflare Access 헤더, F023, 인메모리)
_영속 저장 X. 매 요청마다 Cloudflare Access 헤더에서 추출. Workers 자체 세션·쿠키 코드 없음_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| email | string | 본인 1명 allowlist 비교 | `Cf-Access-Authenticated-User-Email` 헤더 값 |
| jwt | string | JWT signature verified | `Cf-Access-Jwt-Assertion` 헤더 값 — Cloudflare Access certs 공개키로 서명 검증 |

#### AppLegalDoc (velite + MDX 정적 컬렉션)
_앱별 약관/개인정보처리방침 콘텐츠. velite `legal` 컬렉션_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| app_slug | string | required | 앱 식별자(예: 'moai') |
| doc_type | 'terms' \| 'privacy' | required | 문서 유형 |
| version | string | optional | 버전 표기 |
| effective_date | string (ISO) | required | 발효일(terms) / 시행일(privacy) |
| body | MDX | required | 본문 |

#### ContactSubmission (인메모리 페이로드, F008/F009)
_Contact Form 1회성 인메모리 페이로드, 영속 저장 없음. Resend 발신 후 폐기_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| name | string | required | 제출자 이름 |
| company | string | optional | 회사명 |
| email | string | RFC 5322 valid | 제출자 이메일(자동응답 수신처) |
| inquiry_type | 'B2B' \| 'B2C' \| 'etc' | required | 의뢰 유형 라디오 |
| message | string | 10 ≤ length ≤ 5000 | 메시지 본문 |
| turnstile_token | string | required, server siteverify | Cloudflare Turnstile 검증 토큰 |

#### ThemePreference (브라우저 localStorage, F010)
_다크모드 선택 — localStorage 키 `proto-theme` 전용. 시스템 추종이 기본, 강제 전환 시에만 저장_

| 필드 | 타입 | 제약 | 설명 |
| --- | --- | --- | --- |
| key | string literal 'proto-theme' | localStorage key | 고정 키 이름 |
| value | 'dark' \| 'light' | optional (unset = system 추종) | 사용자 강제 선택 값 |

### 7.2 엔티티 관계 (Entity Relationships)
- Project (velite) :: 1—0..1 :: ProjectMeta (D1) — slug 기준 1:1 매핑, F022 이후 cover 메타만 D1으로 분리
- Post (D1) :: N—0..M :: MediaAsset (R2) — raw_markdown 본문에서 `![alt](R2 URL)` 마크다운으로 참조(외래 키 없음, 자동 추적 X)
- Project (velite) :: 1—0..1 :: MediaAsset (R2) — ProjectMeta.cover_image_url이 MediaAsset URL을 참조
- AppLegalDoc :: 1 app_slug — N docs (terms + privacy) — app_slug 기준 그룹화
- AccessIdentity :: 매 요청 마다 별도 생성, 영속 저장 X — 본인 1명 allowlist와 비교
- ContactSubmission → 외부 Resend(이메일 발신) + 본인 메일 발신 후 즉시 폐기, 영속 저장 X

### 7.3 데이터 저장 전략 (Data Storage Strategy)
- **서버**: Cloudflare D1(SQLite, edge-native) — Post 정본 + ProjectMeta. Cloudflare R2 — MediaAsset 정본(R2가 직접 정본, 별도 메타 테이블 없음). velite 정적 빌드(JSON 번들) — Project / AppLegalDoc. 마이그레이션 스크립트로 일회성 `content/posts/*.mdx` → D1 INSERT 완료
- **클라이언트**: localStorage `proto-theme`(F010 다크모드 선택만). 일반 콘텐츠는 SSR로 서빙, 클라이언트 영속 저장 없음. ContactSubmission은 인메모리 폼 상태만
- **캐시**: Workers KV(Post `raw_markdown` 컴파일 결과, 키 `post:{slug}:body:v{updated_at-hash}`, SHA-256 truncate 16 char로 자연 invalidation, TTL 의존 X). Workers Cache API(Cloudflare Access JWT 공개키 1시간 캐시, OG 이미지 immutable max-age=1년, sitemap/robots s-maxage=300, RSS s-maxage=3600)

---

## 8. Backend 명세 (Backend Specifics)

_이 프로젝트는 Backend를 포함하지 않습니다._

---

## 9. Mobile 명세 (Mobile Specifics)

_이 프로젝트는 Mobile을 포함하지 않습니다._

---

## 10. 보안 및 인가 (Security & Authorization)

### 10.1 인증 (Authentication)
- **방식**: Cloudflare Access(Zero Trust) path application 보호 — `/admin/*` 전용. Workers 자체 세션·쿠키·비밀번호 코드 없음. 일반 방문자는 인증 없음
- **제공자**: Cloudflare Zero Trust Free 플랜 + GitHub OAuth IdP. 본인 1명 email allowlist(86tkstar@gmail.com)
- **토큰 라이프사이클**: Cloudflare Access가 발급한 `Cf-Access-Jwt-Assertion` JWT는 매 요청 헤더로 전달. Workers는 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 공개키로 서명 검증. 공개키는 Workers Cache API로 1시간 단위 캐시(latency·요금 최적화). JWT 만료/갱신은 Cloudflare Access가 담당, Workers는 검증만

### 10.2 인가 (Authorization / RBAC)
| 적용 지점 | 방법 |
| --- | --- |
| Cloudflare Edge(`/admin/*` path application) | Cloudflare Access 게이트 — 미인증 요청은 GitHub OAuth로 리다이렉트되어 Workers까지 도달하지 않음 |
| Workers access-guard 미들웨어(`/admin/*` 처리 전 단계) | 헤더 직접 위조 방지 — `Cf-Access-Authenticated-User-Email` 존재 + `Cf-Access-Jwt-Assertion` JWT 서명 검증 + email allowlist 매칭. 실패 시 401, 헤더 부재 시 fail-closed(500 또는 401) |
| Workers Contact handler(`/contact` POST) | Turnstile siteverify(`https://challenges.cloudflare.com/turnstile/v0/siteverify`) + rate-limit(동일 IP 5회/시간, Workers KV 또는 DO 기반) — 실패 시 400/429 |
| Workers Blog Detail handler(`/blog/{slug}`) | D1 SELECT 시 `WHERE status='published'` 필터. status='draft' 또는 존재하지 않는 slug는 익명 접근 시 404 Fallback |
| Workers RSS/Sitemap/Search-index 생성기 | draft Post는 RSS·sitemap·search index 모두에서 제외(F021 AC-4) |

### 10.3 데이터 접근 범위 (Data Access Scoping)
| 역할 | 범위 |
| --- | --- |
| anonymous | public 콘텐츠만 — velite Project/AppLegalDoc, D1 Post(status='published'), R2 public read URL(MediaAsset). draft Post / `/admin/*` / Admin API 모두 차단(404 또는 Cloudflare Access 게이트) |
| admin | anonymous 범위 + `/admin/*` 전체(Admin Posts List/Editor/Media Library/Upload Proxy) + D1 posts CRUD(draft 포함) + R2 PUT/DELETE/List. 본인 1명 email allowlist로만 게이트 통과 |
| bot | 차등 인덱싱 — 일반 페이지 `index,follow`, App Terms/Privacy `noindex,follow`, 404 Fallback `noindex,nofollow`, `/admin/*` `noindex,nofollow` + sitemap.xml 제외. Launch Gate OFF 동안은 모든 페이지 `noindex,nofollow` + robots.txt Disallow + empty sitemap |

---

## 11. 비기능 요구사항 (Non-Functional Requirements)

> 모든 항목은 **기술적 contract**입니다. KPI/DAU/전환율 등 비즈니스 성과 약속은 포함되지 않습니다.

### 11.1 성능 (Performance)
- OG 이미지 응답: `Cache-Control: public, max-age=31536000, immutable` — 한 번 생성 후 1년간 edge 캐시
- Blog Detail 렌더: D1 raw_markdown 런타임 컴파일 결과를 Workers KV에 캐시(`post:{slug}:body:v{updated_at-hash}`, SHA-256 truncate 16 char). updated_at 변경 시 키 해시 자연 invalidation, TTL 의존 없음
- Cloudflare Access JWT 공개키: Workers Cache API로 1시간 캐시 — 후속 요청은 fetch 생략(latency·요금 절감)
- Sitemap/Robots: `Cache-Control: public, s-maxage=300` (edge 캐시 5분)
- RSS Feed: `Cache-Control: public, s-maxage=3600` (edge 캐시 1시간)
- Cmd+K 검색 인덱스: gzip ≤ 100KB + body 미포함 + 세션당 1회 fetch(F016 AC-5)
- Contact 폼 rate-limit: 동일 IP 1시간 내 5회 초과 시 429(F009 AC-3)
- Contact 메시지 길이: 10 ≤ length ≤ 5000(F008 AC-3)
- Tailwind v4 + oklch/color-mix native + JetBrains Mono self-host(`/public/fonts/JetBrainsMono-*.woff2`)로 FOIT/FOUT 방지

### 11.2 신뢰성 (Reliability)
- Resend API 5xx/네트워크 오류 시 mailto:hello@tkstar.dev 폴백 링크 + 폼 입력값 prefill(F008 AC-4)
- Satori OG 렌더링 실패 시 정적 fallback PNG로 graceful degradation + Workers logs 기록(F011 AC-3)
- Cloudflare Access 헤더 부재 시 Workers fail-closed — 500 또는 401, 본인 1명 인증 보장 없이는 admin 동작 수행 X(F023 AC-4)
- Drizzle 마이그레이션 시 slug 중복 INSERT 발견 → 스크립트 abort(fail-fast, F021 AC-1)
- velite frontmatter Zod 검증 실패 → 빌드 fail-fast, 잘못된 콘텐츠 production 노출 차단
- Launch Gate OFF 동안 sitemap empty + robots Disallow + 모든 페이지 noindex,nofollow — 사전 인덱싱 차단
- Host canonical 301 — tkstar.dev apex 외 변형(www, http)은 영구 리다이렉트(Launch 상태 무관)

### 11.3 접근성 (Accessibility)
- JetBrains Mono self-host — 폰트 binary local 로드로 FOIT/FOUT 최소화, 본문/UI/코드 단일 폰트
- Cmd+K Command Palette — 키보드만으로 모든 동작 가능(↓↑로 네비, ↵로 진입, Esc로 닫기, F016 AC-4)
- 다크모드 토글 — 시스템 `prefers-color-scheme` 추종 기본 + 명시적 토글로 강제 전환
- OKLCH 색상 → `print-color-adjust: exact`로 인쇄 시 가독성 유지(F003 AC-2)
- 이미지 alt — R2 업로드 시 파일명 기반 alt 자동, ProjectMeta.cover_alt 별도 관리
- FocusRing — Tailwind v4 기본 + 커스텀 outline으로 키보드 사용자 가시성 확보

### 11.4 국제화 (Internationalization)
- 한국어 only(MVP). 영문/일문 등 다국어 미지원
- rehype-slug + github-slugger로 한국어 anchor id 1:1 매칭(on-this-page TOC)
- JetBrains Mono — 라틴 문자 위주, 한국어는 fallback fontstack(시스템 한국어 monospace)

### 11.5 관측성 (Observability)
- Cloudflare Web Analytics — 쿠키 없는 페이지뷰 집계(F013)
- Workers logs — Satori 렌더링 실패, Resend 발신 실패, D1 INSERT/UPDATE 실패, R2 PUT/DELETE 실패, Cloudflare Access JWT 검증 실패, search-index 재생성 실패 모두 기록
- Cmd+K palette 검색 인덱스 fetch 카운트 — 세션당 1회 제약 검증용(F016 AC-5)
- Contact 폼 rate-limit 카운트 — Workers KV 또는 DO 기반 동일 IP 카운터(F009 AC-3)
- Launch Gate 상태(`SITE_LAUNCHED` env literal) — wrangler types로 컴파일 시점 narrow + 런타임 helper로 string 수용

---

## 12. 기술 스택 (Tech Stack)

> 모든 버전은 `package.json`에서 추출. monorepo는 sub-package 우선.

### 12.1 Web
- **React Router 7.14.0** — Framework mode SSR — 정적 콘텐츠도 SEO/OG 미리보기를 위해 SSR 사용
- **React 19.2.4** — UI 라이브러리(React DOM 동일 버전)
- **TypeScript 5.9.3** — 타입 안정성
- **@tailwindcss/vite 4.2.2** — Tailwind v4 — `[data-theme='dark|light']` 속성 셀렉터 전략, oklch/color-mix native
- **@mdx-js/rollup 3.1.1** — MDX 컴파일 — velite + Vite 파이프라인
- **velite 0.3.1** — MDX 컬렉션 빌더 — Project / AppLegalDoc(F021 이후 Post 제외)
- **shiki 4.0.2** — 빌드 타임 코드블록 highlight(Project/AppLegalDoc) + Post 런타임 highlight
- **@shikijs/rehype 4.0.2** — rehype 플러그인으로 shiki 연결
- **satori 0.26.0** — 동적 OG 이미지 SVG 빌드(1200×630)
- **@resvg/resvg-wasm 2.6.2** — Satori SVG → PNG 변환(WASM 기반, Workers 호환)
- **rehype-slug 6.0.0** — on-this-page TOC anchor id 자동 부여
- **github-slugger 2.0.0** — 한국어 anchor 1:1 매칭(rehype-slug 알고리즘과 동일)
- **unified 11.0.5** — remark/rehype 파이프라인 코어
- **remark-parse 11.0.0** — Post raw_markdown 런타임 파싱
- **remark-frontmatter 5.0.0** — frontmatter 파싱(마이그레이션 스크립트)
- **remark-gfm 4.0.1** — GFM(테이블/스트라이크/태스크리스트) 지원
- **remark-rehype 11.1.2** — markdown AST → hast 변환(런타임 컴파일)
- **zod 4.3.6** — velite frontmatter Zod 검증
- **isbot 5.1.36** — Bot 판별(SSR 분기, Analytics 보조)
- **drizzle-orm 0.45.2** — D1 ORM — Post / ProjectMeta CRUD
- **@react-email/components 1.0.12** — Contact 자동응답 메일 템플릿
- **@react-email/render 2.0.8** — React Email 템플릿 → HTML 문자열 렌더

### 12.2 Mobile
_해당 없음_

### 12.3 Backend
_해당 없음_

### 12.4 공통 의존성 (Shared Dependencies)
- **vite 8.0.3** — 번들러
- **@vitejs/plugin-react 6.0.1** — React 플러그인
- **vitest 4.1.5** — 테스트 러너(TDD-First)
- **@vitest/coverage-v8 4.1.5** — 테스트 커버리지(lines 80/branches 75/functions 80/statements 80)
- **@testing-library/react 16.3.2** — React 컴포넌트 테스트
- **@testing-library/jest-dom 6.9.1** — DOM matcher(toBeInTheDocument 등)
- **@testing-library/dom 10.4.1** — DOM testing 기반
- **jsdom 29.1.0** — Vitest용 jsdom 환경
- **@biomejs/biome 2.4.13** — Lint & Format
- **wrangler 4.85.0** — Cloudflare Workers 배포 CLI
- **@cloudflare/vite-plugin 1.33.2** — Vite ↔ Workers 통합
- **@react-router/dev 7.14.0** — React Router 개발 도구 + typegen
- **@react-router/fs-routes 7.14.0** — 파일 시스템 라우팅
- **drizzle-kit 0.31.10** — Drizzle migration CLI
- **better-sqlite3 12.9.0** — 로컬 D1 dev sqlite driver
- **@types/better-sqlite3 7.6.13** — better-sqlite3 타입
- **gray-matter 4.0.3** — frontmatter 추출(마이그레이션 스크립트)
- **@types/mdx 2.0.13** — MDX 타입
- **@types/node 22** — Node 타입(빌드 도구 환경)
- **@types/react 19.2.14** — React 타입
- **@types/react-dom 19.2.3** — React DOM 타입
- **tailwindcss 4.2.2** — Tailwind v4 코어

### 12.5 패키지 매니저 (Package Manager)
- **bun 1.x**

---

## 13. 가정 및 미결 질문 (Assumptions & Open Questions)

### 13.1 가정 (Assumptions)
- [FACT] rehype-toc — 채택, T013/T014b의 on-this-page TOC 구현 완료(이전 A002)
- [FACT] velite 0.3.1 — 설치 + T007 콘텐츠 파이프라인 가동 완료(이전 A006)
- [FACT] Resend / Turnstile env(`RESEND_API_KEY`, `TURNSTILE_SECRET`) — T017/T022에서 wrangler secret 주입 완료(이전 A009)
- [FACT] Cloudflare Registrar — 도메인 등록 완료(이전 A010)
- [FACT] Cloudflare Access — T022 production secrets + T029 운영 계획 확정(T029 작업 자체는 미진행이지만 의사결정은 확정, 이전 A019)
- [FACT] drizzle-orm 0.45.2 — T024로 머지됨(이전 A021)
- [FACT] MDX runtime compiler — T027에서 unified(remark-parse + remark-gfm + remark-rehype) 기반 자체 컴파일러 채택, KV cache 결합(이전 A015)
- [FACT] KV cache key 해싱 — T027 SHA-256 truncate 16 char 채택(이전 A016)
- [ASSUMPTION] About Page 자격증 카드 — 자격증 데이터 추가 시 별도 카드 추가(현 미적용)
- [ASSUMPTION] About Page Career — solo 통합 timeline에서 velite project frontmatter의 신규 필드(예: `about_career_role`, `about_career_period`) 끌어오기. `CareerEntry`는 `type: 'company'|'solo'` discriminated union
- [ASSUMPTION] AppLegalDoc 표준 메타 — version/effective_date 외 표준 메타는 첫 앱(`moai`) 등록 시 확정
- [ASSUMPTION] JetBrains Mono Satori OG — 폰트 binary는 fetch/import 형태로 Satori에 전달(현 production 동작 중)
- [ASSUMPTION] 검색 라이브러리 — 별도 lib 없이 includes/score 단순 검색. 데이터 규모 증가 시 재검토
- [ASSUMPTION] React Email/Resend 환경변수 — `RESEND_API_KEY` 외에 `from`/`reply-to` 도메인 검증 메타(domain DKIM) 모니터링 필요
- [ASSUMPTION] design ↔ production 갭 — design 정본(`prototype.html` + `proto/*.jsx`)은 React 18 + babel-standalone IIFE 환경. production은 RR7 ESM + React 19로 포팅(현 완료)
- [ASSUMPTION] design 운영 도구 제외 — `design-canvas.jsx`/`tweaks-panel.jsx`/`components/*.jsx` 와이어프레임 변형은 production 번들에 미포함
- [ASSUMPTION] design `terminal.css` + `terminal.jsx`(TermWindow chrome) — 폐기, 정본 `prototype.css`(`.topbar`/`.foot`)로 대체 완료

### 13.2 미결 질문 (Open Questions)
| ID | 질문 | 차단 영향 | 결정 기한 |
| --- | --- | --- | --- |
| OQ-TIPTAP-VER | Tiptap 메이저 버전(v2 vs v3) + markdown serializer 조합 — 공식 @tiptap/markdown(v3 전용) / 커뮤니티 tiptap-markdown(v2 호환) / 자체 serializer 중 선택. 한국어 IME 안정성 PoC 필요(이전 A011/A012/A014) | T036 Tiptap Editor 구현 시작 전 차단 | T035 PoC 직전 |
| OQ-MEDIA-CLIENT | R2 클라이언트 선택 — (a) R2 Workers binding 직접 호출 1순위 / (b) aws4fetch 2순위 / (c) @aws-sdk/client-s3 3순위. T023 PoC 결과 반영 필요(이전 A013) | T033 R2 bucket + 클라이언트 도입 착수 전 차단 | T033 시작 전 |
| OQ-MEDIA-PUBLIC | R2 public read 방식 — public bucket URL 직접 노출 vs Workers 라우트 proxy 서빙. 비용·캐시·헤더 제어 트레이드오프(이전 A017 변형) | T033 R2 bucket 생성 시 결정 필요 | T033 진행 중 |
| OQ-RR7-SPLAT | RR7 splat(`*`) 404 처리 — splat 라우트 vs ErrorBoundary 중 어느 패턴이 noindex,nofollow + 404 응답 + 터미널 메시지를 안정적으로 처리하는지 검증(이전 A017 일부) | T028 splat 라우트 작업 시 검증 | T028 진행 중 |
| OQ-PROJECTMETA | project_meta D1 도입 시점/스키마 — `slug` PK + `cover_image_url` + `cover_alt` 외에 `featured`도 D1으로 옮길지? velite frontmatter ↔ D1 동기화 책임 위치(이전 A018) | T038 Project 메타 D1 이관 작업 전 차단 | T038 시작 전 |
| OQ-SEARCH-IDX-STORE | search-index.json 저장 위치 — R2(현 정적 자산 패턴 일치) vs KV(저지연 read 우선). F020 Save/Publish 트리거 재생성 산출물(이전 A020) | T036 Tiptap Editor Save/Publish 핸들러 구현 시 결정 | T036 중 |
| OQ-BING-WMT | Bing Webmaster Tools 등록 — MVP 후 등록 예정. F019에 third channel로 추가할지 | non-blocking — 운영 안정화 후 | MVP 완료 후 |
| OQ-MOTION-LIB | Motion 라이브러리 도입 재검토 — CSS-only @keyframes/transition로 시작했으나, 추후 인터랙션 보강 시 framer-motion 등 도입 여부 | non-blocking — 사용자 피드백 수집 후 | MVP 운영 안정화 후 |
| OQ-JWT-LIB | Workers측 JWT verifier 라이브러리 — `jose` 후보 / 자체 web-crypto 구현. Cloudflare Access JWT 검증용 | T030 access-guard 미들웨어 구현 전 차단 | T030 시작 전 |

---

## 14. 부록 (Appendix)

### 14.1 참조 자료 (References)
- docs/PROJECT-STRUCTURE.md — 프로젝트 구조 정본(MANDATORY)
- docs/ROADMAP.md — 구현 순서 정본(MANDATORY)
- docs/glossary.md — 도메인 용어 사전(엔티티 명명 1:1 매핑)
- docs/design-system/prototype.html — 디자인 정본(HTML)
- docs/design-system/proto/*.jsx — 디자인 정본(React 18 + babel-standalone 데모)
- docs/design-system/styles.css — Tailwind v4 `@theme` 토큰 정본 소스
- CLAUDE.md — Core Principles / Launch Gate / Workers Paid 설정
- wrangler.toml — Workers + D1 + R2 + KV binding + `[vars] SITE_LAUNCHED` Launch Gate flag
- workers/app.ts — host canonical 301 + Launch Gate 적용 진입점
- Cloudflare Access docs — https://developers.cloudflare.com/cloudflare-one/applications/
- Cloudflare D1 docs — https://developers.cloudflare.com/d1/
- Cloudflare R2 docs — https://developers.cloudflare.com/r2/
- Drizzle ORM docs — https://orm.drizzle.team/docs/get-started-sqlite#cloudflare-d1
- Satori README — https://github.com/vercel/satori
- velite docs — https://velite.js.org/
- Tiptap docs — https://tiptap.dev/

### 14.2 문서 변경 이력 (Document History)
| 일자 | 작성자 | 변경 내용 |
| --- | --- | --- |
| 2026-05-13 | prd-generator (Claude Opus 4.7) | v2.0 — 14-section 표준 템플릿으로 재구성. 정보 손실 0 원칙: 기존 PRD v1의 모든 H2/H3 헤더, 표, 정책 문장(Cache-Control / rate-limit / search-index size limit / Launch Gate / host canonical 등)을 흡수. F015 자리 보존(placeholder Deferred). Acceptance Criteria — 기존 9개 feature 보존 + 14개 feature는 Page-by-Page Key Features bullet에서 합성. Roles: anonymous/admin/bot 3-role. Assumptions Register 정리: 8개 항목 [FACT]로 흡수, 나머지 9개는 open_questions[]로 이동(blocking deadline 명시) |
| 2026-05-08 | prd-validator | v1.x — Phase 0~6 (T001-T022) production deploy 완료. Phase 7 CMS(F020-F023)는 Draft/InProgress 상태 유지 |
