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
| **AccessIdentity** | 관리자 인증 정보 | F023 Cloudflare Access (Zero Trust) 가 발급한 JWT (`Cf-Access-Jwt-Assertion`) 에서 도출되는 admin email / sub claim. 본인 1명 allowlist. Workers 가 공개키 검증 후 도메인으로 승격해 use case 입력에 등장 — 자체 세션·쿠키·비밀번호 없음. (Phase 7.2, T030 참조) | admin user, logged-in user, 로그인 사용자 |
| **AppLegalDoc** | 앱 법률 문서 | 출시한 앱별 이용약관/개인정보처리방침 (terms/privacy) MDX 문서. `content/legal/apps/[app]/{terms,privacy}.mdx` 정본. | App Legal, Legal Document, 약관 문서 |
| **Audience** | 청중 | tkstarDev 의 두 사용자 군 — B2B (기업·HR 채용 담당자) / B2C (프리랜서 플랫폼 의뢰 클라이언트). 단일 도메인에서 콘텐츠 라우팅(About → B2B / Projects → B2C)으로 자연 수렴. | 사용자 군, 타깃 |
| **ChromeFreeLayout** | 앱 WebView 레이아웃 | `.legal` 컨테이너만 노출하는 chrome-free 레이아웃 (max-width 680px). App Terms / App Privacy 페이지 전용으로 Topbar/Footer 미노출 — 출시 앱 내부 WebView 친화. | chrome-less layout, 약관 레이아웃 |
| **ChromeLayout** | 일반 레이아웃 | Topbar(브랜드/경로/검색트리거/테마토글) + Footer(GitHub/X/RSS/Contact/Legal Index) 가 노출되는 기본 레이아웃. App Terms/Privacy 외 모든 페이지에 적용. | default layout, full-chrome layout |
| **CommandPalette** | 커맨드 팔레트 | tkstarDev 의 주 네비게이션 패러다임. routes / projects 슬러그 / posts 슬러그를 인덱싱한 클라이언트 사이드 검색 (⌘K / Ctrl+K / `/` 단축키). | search palette, 검색 모달, omnibox |
| **ContactSubmission** | 컨택 제출 | Contact form 에서 제출된 1회성 인메모리 페이로드 (`name`, `company?`, `email`, `inquiry_type`, `message`, `turnstile_token`). 영속 저장 없이 Resend 발신 후 폐기. | contact payload, 문의 폼 데이터 |
| **InquiryType** | 의뢰 유형 | `ContactSubmission` 의 discriminated union 키 `'B2B' \| 'B2C' \| 'etc'`. `Audience` 구분과 연동해 메일 라우팅·통계 구분에 사용. | inquiry kind, 의뢰 종류 |
| **MediaAsset** | 미디어 파일 | F022 admin 이 R2 에 업로드한 이미지/PDF/영상 등 미디어 파일. 키 패턴 `media/{yyyy}/{mm}/{nanoid}.{ext}`, public read URL 로 Post 본문·`ProjectMeta` cover 에서 참조. (Phase 7.3, T034 참조) | upload, attachment, media resource, 첨부 파일 |
| **OgImage** | OG 이미지 | 사이트 공유 링크 렌더링용 1200×630 PNG. Project/Post slug 별로 Satori standalone 으로 SSR 동적 생성. | open graph image, 미리보기 이미지 |
| **Post** | 블로그 글 | 월 1편 운영 원칙의 기술 글 콘텐츠. RSS/OG 결식. **현재** velite + MDX (`content/posts/*.mdx` 정본), **Phase 7 이후** D1 + raw markdown (Drizzle, `posts` 테이블) 으로 이관해 admin (본인 1명) 이 모바일/외부에서 작성 — T025/T026 참조. | article, blog entry, 포스트 |
| **PostStatus** | Post 상태 | `Post` 의 lifecycle VO `'draft' \| 'published'`. draft 는 admin 만 조회 가능, published 만 RSS / sitemap / search index 노출. (Phase 7.1, T025 참조) | post lifecycle, publish state, 발행 단계 |
| **Project** | 프로젝트 | B2C 청중의 신뢰성 검증 단위인 case study 콘텐츠. velite + MDX collection (`content/projects/*.mdx` 본문 정본). cover/cover_alt 메타는 **Phase 7.4 이후** `ProjectMeta` 로 D1 분리 (T038 참조). | portfolio item, case study, 작품 |
| **ProjectMeta** | 프로젝트 대표 이미지 | `Project` 의 frontmatter 중 cover / cover_alt 만 분리한 D1 레코드. Project 본문 MDX 는 그대로 velite 빌드, 대표 이미지만 admin (R2 업로드) 으로 갱신 가능. (Phase 7.4, T038 참조) | project cover, project frontmatter, project metadata |
| **RssFeed** | RSS 피드 | Post 컬렉션을 RSS 2.0 XML 로 직렬화한 구독자 채널. `/rss.xml` resource route 로 동적 생성. | RSS, 피드 |
| **Sitemap** | 사이트맵 | index 가능 페이지(Home/About/Projects 외 9종)만 포함하는 검색엔진용 XML. App Terms/Privacy·404 는 noindex 정책으로 제외. | sitemap.xml |
| **ThemePreference** | 테마 설정 | 다크모드 상태 값 `'dark' \| 'light'`. browser localStorage 키 `proto-theme` 로 영속, 시스템 추종 fallback. | theme mode, 테마 모드 |

---

## Technical Verbs

> 도메인 동사 — Application layer use-case 의 의미 핵심을 표현. `app/application/**/services/*.service.ts` 의 export 식별자와 1:1 매핑되어야 한다.

| English | 한국어 | 정의 | Forbidden synonyms |
|---------|--------|------|---------------------|
| **buildRssFeed / buildSitemap** | 피드/사이트맵 빌드 | velite collection 을 RSS 2.0 XML 또는 sitemap.xml 로 렌더링하는 use case. resource route 로더에서 호출. | generate feed, render rss |
| **buildSearchIndex** | 검색 인덱스 빌드 | F016 use case — `{slug, title, summary, tags}` 만 추출해 `search-index.json` 으로 직렬화 (본문 제외로 클라이언트 다운로드 크기 최소화). **현재** `.velite/{projects,posts}.json` 머지, **Phase 7.4 이후** Project velite + Post D1 (published 만) 머지로 source 이중화하고 admin Save/Publish lifecycle 에서 트리거 — T039 참조. | build index, generate search |
| **getFeaturedProject / getRecentPosts** | Home 대표 항목 조회 | F017 Home 섹션용 세트 — `featured: true` 최상단 1개 Project + 최신 N 개 Post 를 함께 반환. | get featured, fetch recent, 추천 항목 가져오기 |
| **getProjectDetail / getPostDetail** | 상세 조회 | slug 로 특정 Project/Post 와 `prev` · `next` 를 함께 반환하는 use case. | fetch detail, retrieve detail, 단건 조회 |
| **listProjects / listPosts** | 목록 조회 | Repository 에서 전체 Project/Post 를 불러와 태그 필터 적용 가능한 리스트를 반환하는 use case. | get list, fetch all, 전체 조회 |
| **publishPost** | 글 발행 | F020 use case — admin Editor 의 Publish 버튼이 호출. `Post.status` 를 `published` 로 전환 + KV body cache invalidate + `buildSearchIndex` 트리거. (Phase 7.3 + 7.4, T036 + T040 참조) | publish, post live, 발행하기 |
| **renderOgImage** | OG 이미지 렌더링 | F011 use case — Project/Post frontmatter 를 Satori standalone 으로 1200×630 PNG 로 직렬화. yoga.wasm + JetBrainsMono ttf 는 Workers Asset Binding 으로 로드. | generate og, render og |
| **savePostDraft** | 글 임시저장 | F020 use case — admin Editor 의 Save 버튼이 호출. `Post.status='draft'` 로 D1 INSERT/UPDATE. RSS / sitemap / search index 노출 X (admin 전용 조회). (Phase 7.3, T036 참조) | save draft, autosave, 자동저장 |
| **submitContactForm** | 컨택 제출 | F008 + F009 use case — `ContactSubmission` 검증 → Turnstile 서버 검증 → Resend 발신 + 자동응답 메일. (명사 `ContactSubmission` 과 동일 한국어를 동사 맥락에서 사용) | send contact, post form, 메시지 보내기 |
| **uploadMedia** | 미디어 업로드 | F022 use case — admin Editor / Media Library 가 호출하는 Workers proxy (`POST /admin/api/upload`). 클라이언트 → Workers → R2 PUT (R2 Workers binding 1순위 / `aws4fetch` 2순위 / `@aws-sdk/client-s3` 3순위 — T033 결정), 응답으로 public URL 반환. Cloudflare Access 게이트 안에 위치. (Phase 7.3, T034 참조) | upload file, upload image, 파일 업로드 |
| **verifyAccessJwt** | Access JWT 검증 | F023 use case — Workers 가 `Cf-Access-Jwt-Assertion` 헤더의 JWT 를 `https://<team>.cloudflareaccess.com/cdn-cgi/access/certs` 의 공개키로 검증해 `AccessIdentity` 발급. 헤더 위조 우회 차단을 위해 `Cf-Access-Authenticated-User-Email` 만 신뢰하지 않음. `jose` 라이브러리, 공개키 1시간 캐시. (Phase 7.2, T030 참조) | verify access header, check cf-access, JWT 검증 |
| **verifyTurnstile** | Turnstile 검증 | F009 use case — 클라이언트 `cf-turnstile-response` 토큰을 `https://challenges.cloudflare.com/turnstile/v0/siteverify` 에 POST 해 `success` boolean 판정. | verify captcha, validate turnstile |

---

## Out of Scope (이 표에 포함하지 않는 어휘)

다음은 의도적으로 본 glossary 에서 제외했다 (`/glossary-sync` skill 규칙):

- **Infrastructure 어휘** (Resend / Turnstile / Cloudflare Workers / KV 등) — framework-shaped 이며 도메인 어휘를 오염시킨다.
- **Presentation 컴포넌트명** (Hero / Topbar / Footer / ProjectRow 등) — UI 표현이며 도메인 의미가 아니다.
- **빌드 도구 / 라이브러리명** (velite / shiki / Satori / vite 등).
- **개발 메타 동사** (scaffold / deploy / lint / test 등) — 도메인이 아니다.

위 어휘들은 PR2/PR3 진행 중 의미 있게 발생할 경우 별도 운영 규칙(예: `docs/PROJECT-STRUCTURE.md` Cross-cutting Concerns)으로 흡수하거나, 본 표에 신규 entry 로 추가할 가치가 있을 때 `/glossary-sync` 를 다시 돌려 결정한다.
