# Domain Glossary — tkstarDev

> **Single Source of Truth** for tkstarDev 의 도메인 어휘 (Ubiquitous Language). PRD / ROADMAP / 코드 / 대화에서 동일 개념을 가리킬 때는 본 표의 영어 식별자와 한국어 표현을 **그대로** 사용한다.
>
> **Auto-import**: `CLAUDE.md` 하단의 `@docs/glossary.md` 라인이 본 파일을 자동으로 로드한다. 인터뷰·플래닝·리팩터링 sub-agent 들도 본 파일을 정본으로 참조한다.
>
> **갱신 경로**:
> - 수동 리스캔: `/glossary-sync` skill (PRD/ROADMAP/code 에서 후보 추출 → AskUserQuestion 으로 확정)
> - 자동 발견: `prd-generator` (post-PRD seed), `development-planner` (post-ROADMAP augment)
> - 일관성 점검: `post-commit-glossary-sync.sh` hook (warn-only diff)
>
> **표 정렬**: English identifier 알파벳순.

---

## Domain Entities

> 비즈니스 도메인의 명사 — Entity / Value Object / Aggregate. `app/domain/**` 코드 식별자와 1:1 매핑되어야 한다 (변환 시 `app/application/**` 의 use-case 입력/출력으로 등장).

| English | 한국어 | 정의 | Forbidden synonyms |
|---------|--------|------|---------------------|
| **AppLegalDoc** | 앱 법률 문서 | 출시한 앱별 이용약관/개인정보처리방침 (terms/privacy) MDX 문서. `content/legal/apps/[app]/{terms,privacy}.mdx` 정본. | App Legal, Legal Document, 약관 문서 |
| **Audience** | 청중 | tkstarDev 의 두 사용자 군 — B2B (기업·HR 채용 담당자) / B2C (프리랜서 플랫폼 의뢰 클라이언트). 단일 도메인에서 콘텐츠 라우팅(About → B2B / Projects → B2C)으로 자연 수렴. | 사용자 군, 타깃 |
| **ChromeFreeLayout** | 앱 WebView 레이아웃 | `.legal` 컨테이너만 노출하는 chrome-free 레이아웃 (max-width 680px). App Terms / App Privacy 페이지 전용으로 Topbar/Footer 미노출 — 출시 앱 내부 WebView 친화. | chrome-less layout, 약관 레이아웃 |
| **ChromeLayout** | 일반 레이아웃 | Topbar(브랜드/경로/검색트리거/테마토글) + Footer(GitHub/X/RSS/Contact/Legal Index) 가 노출되는 기본 레이아웃. App Terms/Privacy 외 모든 페이지에 적용. | default layout, full-chrome layout |
| **CommandPalette** | 커맨드 팔레트 | tkstarDev 의 주 네비게이션 패러다임. routes / projects 슬러그 / posts 슬러그를 인덱싱한 클라이언트 사이드 검색 (⌘K / Ctrl+K / `/` 단축키). | search palette, 검색 모달, omnibox |
| **ContactSubmission** | 컨택 제출 | Contact form 에서 제출된 1회성 인메모리 페이로드 (`name`, `company?`, `email`, `inquiry_type`, `message`, `turnstile_token`). 영속 저장 없이 Resend 발신 후 폐기. | contact payload, 문의 폼 데이터 |
| **InquiryType** | 의뢰 유형 | `ContactSubmission` 의 discriminated union 키 `'B2B' \| 'B2C' \| 'etc'`. `Audience` 구분과 연동해 메일 라우팅·통계 구분에 사용. | inquiry kind, 의뢰 종류 |
| **OgImage** | OG 이미지 | 사이트 공유 링크 렌더링용 1200×630 PNG. Project/Post slug 별로 Satori standalone 으로 SSR 동적 생성. | open graph image, 미리보기 이미지 |
| **Post** | 블로그 글 | 월 1편 운영 원칙의 기술 글 콘텐츠. velite + MDX, RSS/OG 결식. `content/posts/*.mdx` 정본. | article, blog entry, 포스트 |
| **Project** | 프로젝트 | B2C 청중의 신뢰성 검증 단위인 case study 콘텐츠. velite + MDX collection. `content/projects/*.mdx` 정본. | portfolio item, case study, 작품 |
| **RssFeed** | RSS 피드 | Post 컬렉션을 RSS 2.0 XML 로 직렬화한 구독자 채널. `/rss.xml` resource route 로 동적 생성. | RSS, 피드 |
| **Sitemap** | 사이트맵 | index 가능 페이지(Home/About/Projects 외 9종)만 포함하는 검색엔진용 XML. App Terms/Privacy·404 는 noindex 정책으로 제외. | sitemap.xml |
| **ThemePreference** | 테마 설정 | 다크모드 상태 값 `'dark' \| 'light'`. browser localStorage 키 `proto-theme` 로 영속, 시스템 추종 fallback. | theme mode, 테마 모드 |

---

## Technical Verbs

> 도메인 동사 — Application layer use-case 의 의미 핵심을 표현. `app/application/**/services/*.service.ts` 의 export 식별자와 1:1 매핑되어야 한다.

| English | 한국어 | 정의 | Forbidden synonyms |
|---------|--------|------|---------------------|
| **buildRssFeed / buildSitemap** | 피드/사이트맵 빌드 | velite collection 을 RSS 2.0 XML 또는 sitemap.xml 로 렌더링하는 use case. resource route 로더에서 호출. | generate feed, render rss |
| **buildSearchIndex** | 검색 인덱스 빌드 | F016 use case — `.velite/{projects,posts}.json` 의 `{slug, title, summary, tags}` 만 추출해 `public/search-index.json` 으로 직렬화. 본문 제외로 클라이언트 다운로드 크기 최소화. | build index, generate search |
| **getFeaturedProject / getRecentPosts** | Home 대표 항목 조회 | F017 Home 섹션용 세트 — `featured: true` 최상단 1개 Project + 최신 N 개 Post 를 함께 반환. | get featured, fetch recent, 추천 항목 가져오기 |
| **getProjectDetail / getPostDetail** | 상세 조회 | slug 로 특정 Project/Post 와 `prev` · `next` 를 함께 반환하는 use case. | fetch detail, retrieve detail, 단건 조회 |
| **listProjects / listPosts** | 목록 조회 | Repository 에서 전체 Project/Post 를 불러와 태그 필터 적용 가능한 리스트를 반환하는 use case. | get list, fetch all, 전체 조회 |
| **renderOgImage** | OG 이미지 렌더링 | F011 use case — Project/Post frontmatter 를 Satori standalone 으로 1200×630 PNG 로 직렬화. yoga.wasm + JetBrainsMono ttf 는 Workers Asset Binding 으로 로드. | generate og, render og |
| **submitContactForm** | 컨택 제출 | F008 + F009 use case — `ContactSubmission` 검증 → Turnstile 서버 검증 → Resend 발신 + 자동응답 메일. (명사 `ContactSubmission` 과 동일 한국어를 동사 맥락에서 사용) | send contact, post form, 메시지 보내기 |
| **verifyTurnstile** | Turnstile 검증 | F009 use case — 클라이언트 `cf-turnstile-response` 토큰을 `https://challenges.cloudflare.com/turnstile/v0/siteverify` 에 POST 해 `success` boolean 판정. | verify captcha, validate turnstile |

---

## Out of Scope (이 표에 포함하지 않는 어휘)

다음은 의도적으로 본 glossary 에서 제외했다 (`/glossary-sync` skill 규칙):

- **Infrastructure 어휘** (Resend / Turnstile / Cloudflare Workers / KV 등) — framework-shaped 이며 도메인 어휘를 오염시킨다.
- **Presentation 컴포넌트명** (Hero / Topbar / Footer / ProjectRow 등) — UI 표현이며 도메인 의미가 아니다.
- **빌드 도구 / 라이브러리명** (velite / shiki / Satori / vite 등).
- **개발 메타 동사** (scaffold / deploy / lint / test 등) — 도메인이 아니다.

위 어휘들은 PR2/PR3 진행 중 의미 있게 발생할 경우 별도 운영 규칙(예: `docs/PROJECT-STRUCTURE.md` Cross-cutting Concerns)으로 흡수하거나, 본 표에 신규 entry 로 추가할 가치가 있을 때 `/glossary-sync` 를 다시 돌려 결정한다.
