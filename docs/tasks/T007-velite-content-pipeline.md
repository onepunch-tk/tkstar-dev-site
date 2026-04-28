# Task 007 — velite 설치 + 컬렉션 정의 + seed 콘텐츠 + shiki 코드블록

| Field | Value |
|-------|-------|
| **Task ID** | T007 |
| **Phase** | Phase 2 — Content Pipeline |
| **Layer** | Infrastructure (build-time ETL) + `content/` |
| **Branch** | `feature/issue-N-velite-content-pipeline` |
| **Depends on** | T006 |
| **Blocks** | T008 |
| **PRD Features** | F004, F005, F006, F007, F014 (콘텐츠 정본) |
| **PRD AC** | — (빌드 산출물 정상 build로 검증) |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
velite를 도입하여 `content/{projects,posts,legal/apps}/**/*.mdx`를 빌드 타임에 Zod 검증 → `.velite/` JSON 출력하는 ETL 파이프라인을 가동시키고, shiki + rehype-slug 플러그인으로 코드블록 highlight + 헤딩 anchor를 동시에 갖춘다. seed 콘텐츠 3종을 작성한다 (가정 A002 1단계, A006 해소).

## Context
- **Why**: Domain 스키마(T006)가 정의되었으므로 velite가 같은 스키마를 import하여 frontmatter 검증을 빌드 타임에 적용하면 "정본 1개"가 유지된다. shiki는 코드블록 디자인의 정본이고, rehype-slug는 후속 T013(Project Detail TOC)에서 헤딩 anchor 추출에 필수.
- **Phase 진입/완료 연결**: Phase 1 종료 후 Phase 2 시작점. T007 Done이면 `.velite/projects.json` 등 정적 산출물이 존재 → T008 repository가 이를 import 가능.
- **관련 PRD 섹션**: PRD `Tech Stack — Content Pipeline`, `Data Model`, `Page-by-Page` Project Detail / Blog Detail Key Features (shiki)
- **관련 PROJECT-STRUCTURE 디렉토리**: `velite.config.ts` (루트), `content/{projects,posts,legal/apps/[slug]}/`, `.velite/` (gitignore), `app/presentation/components/content/`

## Scope

### In Scope
- `bun add -D velite shiki rehype-slug` 설치
- `velite.config.ts` — 3개 컬렉션 정의 + Domain `*.schema.ts` import + rehype 플러그인 (`rehype-slug`, shiki via `@shikijs/rehype` 또는 velite의 mdx options)
- seed 콘텐츠: `content/projects/example-project.mdx`, `content/posts/2026-04-shipping-solo.mdx`, `content/legal/apps/moai/{terms,privacy}.mdx`
- `MdxRenderer`, `CodeBlock` 컴포넌트 골격 (velite body → React 트리, shiki 출력 외곽 컨테이너)
- `bunx velite build` 명령이 성공하고 `.velite/projects.json`, `posts.json`, `legal.json` 생성
- `package.json`에 `prebuild: "velite build"` 또는 `dev: "velite dev"` 등 hook 추가

### Out of Scope
- Application Ports + Repository 구현 (T008)
- velite afterBuild 훅으로 TOC 추출 / search-index 빌드 (T013 / T016)
- Satori OG 이미지 (T018)

## Acceptance Criteria
- [ ] `bunx velite build` 성공 → `.velite/{projects,posts,legal}.json` 생성
- [ ] `.velite/projects.json`에 seed `example-project`가 포함되고 frontmatter 필드(slug/title/summary/date/tags/stack/metrics)가 모두 매핑됨
- [ ] frontmatter Zod 위반 콘텐츠(예: `metrics`를 string으로 작성)를 추가하면 `velite build`가 실패
- [ ] seed MDX의 코드블록(```ts ... ```)이 shiki로 highlight되어 `<pre>` HTML 안에 토큰별 `<span style="color: ...">`가 들어감
- [ ] seed MDX의 `## ...` 헤딩에 rehype-slug가 `id` 속성을 자동 부여
- [ ] `MdxRenderer` 컴포넌트가 velite body(`code` HTML 또는 `MDXComponent`)를 React로 렌더 가능
- [ ] `bun run typecheck` + `bun run lint` 통과

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/components/content/__tests__/MdxRenderer.test.tsx`
  - velite 빌드 산출물 형태(html string 또는 MDX component)를 mock하여 `<MdxRenderer body={mock} />`이 정상 마운트
  - 코드블록 mock에 shiki style이 보존됨 (innerHTML에 `<span style="color:`)
- `velite.config.ts` 자체는 직접 테스트보다 `velite build` 명령 실행으로 e2e 검증 (script test로 대체):
  - `test/integration/velite-build.test.ts` (선택) — `execSync("bunx velite build")` 후 `.velite/projects.json` 존재 검증

### Green
- `velite.config.ts`:
  ```ts
  import { defineConfig, defineCollection } from "velite";
  import { projectSchema } from "./app/domain/project/project.schema";
  // ... 3 collections (projects, posts, legal)
  // mdx: { rehypePlugins: [rehypeSlug, [rehypeShiki, { theme: "github-dark" }]] }
  ```
- `content/projects/example-project.mdx` — frontmatter + problem/approach/results 본문 + 코드블록 1개
- `content/posts/2026-04-shipping-solo.mdx` — frontmatter + 본문 + 코드블록
- `content/legal/apps/moai/terms.mdx` + `privacy.mdx` — frontmatter (version, effective_date)만, 본문은 placeholder
- `app/presentation/components/content/MdxRenderer.tsx`, `CodeBlock.tsx`

### Refactor
- velite collection 정의를 `velite.config.ts`에서 분리해서 `velite/collections/{projects,posts,legal}.ts`로 (선택; 1파일 유지가 단순)
- shiki theme 토큰을 디자인 토큰과 정렬 (옵션)

## Files to Create / Modify

### Build / Config
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/velite.config.ts` | 3 컬렉션 정의 (Domain schemas import) + rehype plugins |
| `/Users/tkstart/Desktop/project/tkstar-dev/package.json` | scripts에 `prebuild: "velite build"` 또는 `dev: "velite --watch & vite dev"` 통합. `devDependencies`에 `velite`, `shiki`, `@shikijs/rehype`, `rehype-slug` 추가 |

### Content (seed)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/content/projects/example-project.mdx` | seed Project (slug, title, summary, date, tags, stack, metrics, featured: true) |
| `/Users/tkstart/Desktop/project/tkstar-dev/content/posts/2026-04-shipping-solo.mdx` | seed Post (slug, title, lede, date, tags, read) |
| `/Users/tkstart/Desktop/project/tkstar-dev/content/legal/apps/moai/terms.mdx` | seed AppLegalDoc (terms) |
| `/Users/tkstart/Desktop/project/tkstar-dev/content/legal/apps/moai/privacy.mdx` | seed AppLegalDoc (privacy) |

### Presentation — Content Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/content/MdxRenderer.tsx` | velite body → React (html string render 또는 useMDXComponent) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/content/CodeBlock.tsx` | shiki 출력의 외곽 `<pre className="codeblock">` 컨테이너 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/content/__tests__/MdxRenderer.test.tsx` | RTL 1~2 cases |

### gitignore (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/.gitignore` | 이미 T001에서 `.velite/` 추가됨 — no-op 확인 |

## Verification Steps

### 자동
- `bunx velite build` exit code 0 + `.velite/{projects,posts,legal}.json` 존재 (CI에서 `bun run prebuild` 통해 동작)
- `bun run test` — `MdxRenderer.test.tsx` Green
- 의도적으로 `metrics: "broken"` 같은 위반 frontmatter를 추가한 임시 MDX → `velite build` 실패 (수동으로 1회 검증)

### 수동
- VSCode에서 `.velite/projects.json` 열어 seed 데이터가 Domain entity 타입과 호환되는지 시각 확인
- `wrangler dev`에서 `<MdxRenderer body={veliteProjectBody} />`가 코드블록 + 헤딩 anchor 렌더하는지 sample 페이지(임시)로 확인 (필요 시)

### 측정
- `.velite/projects.json` size 확인 — 본문 포함되므로 클라이언트 번들에 직접 import하지 않도록 주의

## Dependencies
- **Depends on**: T006 (Domain 스키마)
- **Blocks**: T008 (Repository는 `.velite/*.json`을 import하여 Entity 매핑)

## Risks & Mitigations
- **Risk**: shiki는 WASM 기반이며 Cloudflare Workers 런타임에서 동적 로드가 불가능할 수 있음.
  - **Mitigation**: shiki는 **빌드 타임에만** 동작 (velite의 mdx 처리 단계). 런타임 Workers에는 shiki bundle이 들어가지 않고 이미 highlighted된 HTML 문자열만 `.velite/*.json`에 저장됨. 따라서 Workers 런타임 영향 없음.
- **Risk**: rehype-slug가 한국어 헤딩(`## 결과`)에서 anchor를 영어로 변환하여 깨질 수 있음.
  - **Mitigation**: rehype-slug 기본값은 한글을 그대로 slug에 포함 (`id="결과"`). 깨질 경우 `github-slugger` 옵션 조정.

## References
- PRD `Tech Stack — Content Pipeline`, `Data Model`
- PROJECT-STRUCTURE.md `content/ and .velite/` (line 405~)
- PROJECT-STRUCTURE.md `velite Content Pipeline 노트` (line 240)
- ROADMAP.md `Phase 2` Task 007, 가정 A002(1단계)/A006 해소
- [velite docs](https://velite.js.org/)
- [Shiki](https://shiki.style/), [rehype-slug](https://github.com/rehypejs/rehype-slug)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
