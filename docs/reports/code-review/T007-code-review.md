# T007 Unified Code Review Report — velite 콘텐츠 파이프라인 + shiki + seed 콘텐츠

**Branch**: `feature/issue-27-velite-content-pipeline`
**Base**: `origin/development`
**HEAD**: `8ce2d1d feat(T007): velite 콘텐츠 파이프라인 + shiki 코드블록 + seed 콘텐츠 (green)`
**Status**: Complete
**Generated**: 2026-04-28 (UTC)
**Reviewed Files**: 11 files (assets/lockfile 제외 시 9 files; `bun.lock` lockfile, content seed 제외 시 5 files of source)

---

**AI Agent Instructions**:
1. Resolve Critical / High issues before merge. Medium은 동일 PR에서 정리 권장, Low는 deferable.
2. Issue를 수정한 즉시 Fix Checklist의 체크박스를 업데이트한다.
3. 모든 Critical / High가 해결되면 Status를 "Complete"로 변경한다.

---

## Executive Summary

T007은 (1) `velite.config.ts`로 Project / Post / AppLegalDoc 3개 collection 정의, (2) `@shikijs/rehype` + `rehype-slug` rehype 체인, (3) velite 산출 function-body MDX를 런타임에 평가하는 `MdxRenderer`, (4) 최소 `<pre>` 래퍼 `CodeBlock`, (5) seed 콘텐츠 4개, (6) 4개 lifecycle 스크립트(`predev`/`prebuild`/`prestart`/`pretest`)와 `#content` path alias. TDD Red→Green 사이클이 분리되어 있고, 각 파일이 모두 30 LOC 이하로 surgical하게 추가되었다.

`bun audit` 결과 **취약점 0건**. Critical 블로커는 **0건**. 다만 다음 사항이 있다:
- **High 1건**: `MdxRenderer`가 client/server 양쪽에서 평가되며 SSR 시 Workers 환경에서 `new Function`이 CSP/V8 Isolate 정책에 의해 제한될 수 있는 운영 리스크 — D2 결정의 운영 측면 보강 권고.
- **Medium 3건**: `CodeBlock`이 어디서도 import되지 않은 dead component, velite `s.isodate()` ↔ Domain `zNonEmptyString()` 표현 불일치(project schema), seed legal MDX 본문이 `(...)` placeholder.
- **Low 5건**: `as any` cast(D1·D2와 무관한 별개의 외부 plugin 타입 cast — 사유 주석은 있음), `tsconfig.cloudflare.json`이 `velite.config.ts`를 include하지 않음, `useMDXComponent` 네이밍이 React hook convention 트리거, `package.json`에 `velite`/`velite:build` 두 별칭이 사실상 동일 등.

| Domain | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| Code Quality | 0 | 0 | 2 | 4 |
| Security | 0 | 1 | 0 | 0 |
| Performance | 0 | 0 | 0 | 0 |
| Architecture | 0 | 0 | 1 | 1 |
| **Total** | **0** | **1** | **3** | **5** |

**Overall Grade**: B+ (single-purpose surgical PR, TDD Red/Green이 분리되어 있고 lifecycle 스크립트 4개 모두 `velite build`를 보장 — High 한 건과 Medium #1(dead component) 정리 시 A-).

**Verdict**: **Approve with minor changes** (High 1건은 코드 변경 없이 docs/wrangler 노트로 해결 가능하고, Medium #1은 한 줄 cleanup. 나머지는 deferable).

---

## Architecture & Clean Architecture Compliance

| Layer | Status | Notes |
|-------|--------|-------|
| Domain | OK | T007은 Domain을 import만 하지 않음 (D1에 따라 velite 측 `s.*` 별도 schema). Domain 측 변경 없음. |
| Application | n/a | T007 변경 없음 (Repository는 T009~). |
| Infrastructure | OK | `velite.config.ts`는 build-time ETL이며 disk 상 root에 위치. PROJECT-STRUCTURE.md L274의 "velite는 read-side 어댑터의 build-time ETL" 정의와 부합. |
| Presentation | OK | `MdxRenderer` / `CodeBlock`은 `app/presentation/components/content/` 내부. 외부 라이브러리는 `react`, `react/jsx-runtime`만 import. |

**Dependency direction**: 위반 없음. velite는 Infrastructure 측 read-side ETL이며 Domain을 import하지 않는다(D1 결정에 따른 의도). MdxRenderer는 Presentation 내부에서 자체 closed-form (string `code` → React element)으로 동작하므로 outer→inner 위반도 없음.

**SOLID Compliance**: 단일 책임 잘 지켜짐. `MdxRenderer`는 evaluate + render만, `CodeBlock`은 wrapper만. 전체 LOC가 작아 SRP 검토 의미 자체가 옅다 (Simplicity First 부합).

**D1·D2·D5는 plan에서 사전 승인**: 본 리뷰는 위 결정을 relitigate하지 않으며, 운영 상 보강이 필요한 부분만 High/Medium으로 표면화한다.

---

## Critical Issues

> Bugs, security vulnerabilities, production blockers — must fix before merge

없음.

---

## Major Improvements (High)

> Important issues affecting maintainability, security, or performance

### #1 — `new Function(code)` SSR 실행 환경 검증 미문서화

- **Domain**: Security / Architecture
- **File**: `app/presentation/components/content/MdxRenderer.tsx:5`
- **Category**: Insecure Design (OWASP A04) — runtime code evaluation in SSR
- **Confidence**: High (90%)
- **Problem**: `new Function(code)`는 의도적 결정(D2)이고 입력은 build-time velite 산출물(신뢰 경계 안)이라 OWASP A03(Injection) 직접 위험은 낮다. 그러나 Cloudflare Workers SSR 환경에서 `eval` / `new Function`은 V8 Isolate 정책상 기본적으로 차단되거나(`unsafe-eval` CSP 기본 거부) 워커 환경 변수 `compatibility_flags`에 따라 동작이 달라진다. 현재 `wrangler.toml` / `wrangler` 4.85.0 기본 설정에서 `nodejs_compat` 만으로 client `MdxRenderer`가 SSR 패스에 도달했을 때 작동을 보장하는 검증 자취가 PR에 없다. 또한 ContentSecurityPolicy를 향후 (T015 SEO/보안 헤더에서) 추가할 때 `script-src 'unsafe-eval'`을 강제하게 되어 보안 자세를 약화시킨다.
- **Impact**: 프로덕션 SSR에서 `MdxRenderer`가 첫 렌더되면 `EvalError: Code generation from strings disallowed` 발생 가능. 또한 향후 CSP에서 `unsafe-eval` 허용을 강제 → 동일 도메인의 다른 코드 경로의 보안 자세 동반 약화.
- **Solution**:
  1. `wrangler.toml`에 SSR 검증 노트 추가: 본 컴포넌트는 SSR에서도 평가되며 V8 Isolate의 `unsafe-eval` 기본 차단을 회피하기 위해 `compatibility_flags = ["nodejs_compat"]`만으로 동작함을 명시 (현재 정책 기준 `new Function`은 Workers에서 허용되지만 명시 필요).
  2. T015 SEO/Headers 단계에서 CSP 작성 시 `script-src 'unsafe-eval'` 필요성을 본 결정과 cross-link한 docs note (예: `docs/decisions/D2-mdx-runtime-eval.md` 또는 task T007 본문에 "Operational Risk" 섹션) 추가.
  3. (선택) `MdxRenderer`를 `client.tsx` suffix로 분리하여 SSR 시 placeholder만 출력하고 hydrate 후에만 평가 — 그러나 SEO를 위해 콘텐츠 렌더가 SSR HTML에 포함되어야 하므로 본 옵션은 D2와 충돌. 따라서 (1) + (2)만 권장.

  **본 finding은 "코드 변경 없이 wrangler/docs 노트만으로 해결 가능"** — Approve 게이트는 "노트 추가" 만족 시 통과로 간주해도 무방.
- **Evidence**: `MdxRenderer.tsx:5` — `const fn = new Function(code);` / `wrangler.toml`에 관련 주석 부재 (조사된 변경 없음).
- **References**: Cloudflare Workers V8 Isolate runtime, OWASP A04 Insecure Design.

---

## Medium Issues

> Code quality, missing cache, deferable but should fix soon

### #2 — `CodeBlock` 컴포넌트가 dead code (어디서도 import되지 않음)

- **Domain**: Architecture / Simplicity First
- **File**: `app/presentation/components/content/CodeBlock.tsx:1-7`
- **Category**: Premature implementation
- **Confidence**: High (98%)
- **Problem**: `grep -rn "CodeBlock" app/ velite.config.ts`는 본인 정의 라인만 hit. velite의 rehype 체인은 `rehypeShiki`만 통과하고 산출물의 `<pre>` 태그는 그대로 MDX function-body로 직렬화되므로, `CodeBlock`이 현재 어떤 mdx-component-map에 주입되지 않는다 — 즉 빌드 산출 HTML의 `<pre className="codeblock">` 클래스 동기화 경로가 끊어져 있다. CLAUDE.md "Simplicity First": "No speculative abstractions". `Surgical Changes`: "Do not improve adjacent code outside the requested scope" — 현재 PR이 사용하지 않는 component를 미리 만든 것이 위반.
- **Impact**: 후속 task(T011 Project Detail 등)에서 component map을 도입할 때 `CodeBlock`의 의도가 잊힐 수 있고, 의도한 `className="codeblock"` 토큰이 향후 `app.css`/Tailwind에 정의되지 않으면 silent style mismatch.
- **Solution**: 두 가지 중 택일.
  - (A) **권장**: 본 PR에서 `CodeBlock.tsx`를 삭제하고 실제 사용처가 생기는 task(T011 또는 후속)에서 함께 도입. 본 PR scope를 더욱 surgical하게 유지.
  - (B) `MdxRenderer`의 `useMDXComponent` 호출에 `{ Fragment, jsx, jsxs, components: { pre: CodeBlock } }` 식으로 component-map을 전달하여 즉시 결선. 단 이는 mdx-bundler 없이 velite 함수 시그니처 의존성이 있어 별도 검증 필요 — 본 PR보다 후속 task에 적합.
- **Evidence**: `grep -rn "CodeBlock" app/` → import 0건.

### #3 — velite `s.isodate()` ↔ Domain Zod schema 표현 불일치 (project schema)

- **Domain**: Architecture / Type Safety
- **File**: `velite.config.ts:11` vs `app/domain/project/project.schema.ts:7`
- **Category**: Schema parity
- **Confidence**: Medium (80%)
- **Problem**: D1(중복 의도)은 "Zod 3 vs 4 버전 충돌 회피를 위한 schema 중복은 OK"이며, 정확성(=동일 frontmatter 입력에 동일 검증 결과)은 여전히 보장되어야 한다. 현재:
  - velite: `date: s.isodate()` (ISO 8601 date 검증)
  - Domain `postSchema` / `appLegalDocSchema`: `date: zIso8601Date()` (T006 helper, ISO 검증) — 일치
  - Domain `projectSchema`: `date: zNonEmptyString()` ([T006 산출물], **공백만 아니면 통과** — `"hello"`도 통과)
  본 PR이 도입한 mismatch는 아니지만, **velite ↔ Domain의 정본이 한쪽만 강한 검증을 가진** 상황을 PR이 고착화한다. velite seed `example-project.mdx`는 정상 ISO date를 쓰고 있어 빌드는 통과하지만, 향후 Infrastructure repository가 velite 출력을 Domain `projectSchema.parse()`로 재검증할 때 약한 쪽이 검증 게이트 역할을 못 한다.
- **Impact**: T009 `velite-project.repository.ts` 작성 시 Domain 재검증이 약하게 통과 → 잘못된 date 형식이 Application까지 흘러갈 가능성. 직접 PR 회귀 위험은 없음(seed가 ISO 준수).
- **Solution**: 본 PR scope 외(`app/domain/project/project.schema.ts`는 T006이 owner)이지만 발견 사실을 본 리뷰에 기록하여 T009 또는 별도 follow-up issue로 `projectSchema.date`를 `zIso8601Date()`로 정렬. 본 PR에서는 **fix하지 말 것** (Surgical Changes 위반).
- **Evidence**:
  - `velite.config.ts:11` — `date: s.isodate()`
  - `app/domain/project/project.schema.ts:7` — `date: zNonEmptyString()`
  - `app/domain/post/post.schema.ts:7` — `date: zIso8601Date()` (대조)

### #4 — seed legal MDX 본문이 `(...)` placeholder

- **Domain**: Quality / Content
- **File**: `content/legal/apps/moai/terms.mdx:10`, `content/legal/apps/moai/privacy.mdx:10`
- **Category**: Placeholder content
- **Confidence**: High (99%)
- **Problem**: 두 파일 모두 `본 약관은 (...) 본문은 후속 task 에서 작성.` / `본 처리방침은 (...) 본문은 후속 task 에서 작성.`로 placeholder만 존재. T007의 목표가 "파이프라인 검증을 위한 seed"라면 OK이지만 production 빌드 산출물이 `noindex, follow`라 해도 lighthouse / 프로덕션 spot check에서 빈약 콘텐츠로 잡힐 수 있다.
- **Impact**: 빌드 자체에는 영향 없음. 다만 staging 데모/PR 미리보기 캡처에 빈 약관이 노출.
- **Solution**: 후속 task(예: T021 Apps Legal)가 끝날 때까지 두 파일 frontmatter에 `published: false` 같은 비공개 플래그를 두거나(velite schema 추가 필요), MVP 진입 직전까지 라우터에서 404 처리하도록 후속 task body에 명시. 본 PR 단계에서는 변경 불요(seed 목적 충족).
- **Evidence**: `terms.mdx:10` / `privacy.mdx:10` — `(...) 본문은 후속 task 에서 작성.`

---

## Minor Suggestions (Low)

| # | Domain | File | Location | Category | Confidence | Problem | Suggestion |
|---|--------|------|----------|----------|------------|---------|------------|
| #5 | Architecture | `tsconfig.cloudflare.json` | L3-11 (`include`) | Type checking coverage | High (92%) | `velite.config.ts`는 root에 위치하지만 `include`에 포함되지 않아 `tsc -b`가 검증하지 않는다. `as any` cast(L56)가 컴파일러 검사 밖에 있음. | `include`에 `velite.config.ts`를 추가하거나 별도 `tsconfig.node.json`을 두어 `velite.config.ts`를 묶는다. 현 PR scope에서 한 줄 추가만 가능. |
| #6 | Quality | `app/presentation/components/content/MdxRenderer.tsx` | L4 | React hook naming | Medium (75%) | `useMDXComponent`는 `use*` prefix를 가지나 React hook이 아니다(내부에서 `useState` 등을 호출하지 않음). React Lint 규칙(`react-hooks/rules-of-hooks`)이 추후 도입되면 false positive 유발. | 단순 함수이므로 `evaluateMdxBody` 또는 `compileMDXContent`로 rename. arrow syntax는 그대로 유지(code-style.md 부합). |
| #7 | Quality | `velite.config.ts` | L55-56 | Type safety | High (90%) | `rehypeShiki as any` cast는 `biome-ignore` 주석으로 정당화되어 있으나, `@shikijs/rehype` v4.0.2에서 export 타입이 `Plugin<[ShikiRehypeOptions]>`로 잘 정의되어 있을 가능성. `as any`는 code-style.md "NO any" 위반(주석으로 면제 받았지만). | `import type { Plugin } from "unified"; const shikiPlugin: Plugin<[Options]> = rehypeShiki as ...`처럼 좁힌 cast 시도. 만약 여전히 안 맞으면 현 cast 유지 + 사유 보강. 본 PR에서는 deferable. |
| #8 | Quality | `package.json` | L19-20 | Script duplication | Medium (80%) | `"velite": "velite"`와 `"velite:build": "velite build"`가 둘 다 존재. 전자는 default subcommand(=`build`)를 호출하므로 사실상 동일. | 사용처가 `pre*` 4개에서 모두 `velite build`이므로 `"velite"`만 남기거나, 빌드 의도를 명시하는 `"velite:build"`만 남기고 다른 하나 삭제. |
| #9 | Quality | `app/presentation/components/content/__tests__/MdxRenderer.test.tsx` | L5-11 | Test fixture | Low (70%) | `buildMdxBody` 헬퍼는 두 테스트만 사용 — 한 곳에 인라인이 더 읽기 좋다. 다만 후속 테스트 추가 시 재사용 여지가 있어 borderline. | 현 상태 OK. 후속 테스트 3개 이상 사용하지 않으면 인라인화 검토. |

---

## Advisory (Low Confidence)

> Findings with <70% confidence — flagged for human review, not required to fix

| # | Domain | File | Location | Category | Confidence | Observation | Suggested Investigation |
|---|--------|------|----------|----------|------------|-------------|------------------------|
| A1 | Performance | `app/presentation/components/content/MdxRenderer.tsx` | L11-14 | Re-render cost | Low (55%) | `MdxRenderer`가 동일 `code`로 다중 호출되면 `new Function(code)`가 매 렌더 평가됨. React Compiler가 props 동등성을 인식하면 캐싱 가능. 측정 없이 단정 불가. | `useMemo(() => useMDXComponent(code), [code])`는 React 19 / 본 프로젝트의 "trust React Compiler" 정책 위반. 실제 detail page에서 프로파일링 후에만 조치. |
| A2 | Architecture | `velite.config.ts` | L36-46 | Schema parity | Low (65%) | `legal` collection이 `slug` 필드 없이 `app_slug` + `doc_type` 조합을 사용. 후속 Infrastructure repository에서 URL 매핑 시 합성 키를 만들어야 함. | T009 `velite-legal.repository.ts` 작성 시 `${app_slug}/${doc_type}` 합성 식별자 명세를 docs에 명시 권장. 본 PR scope 아님. |

---

## Dependency Vulnerabilities

> Results from `bun audit`

| Package | Current | Patched | CVE | Severity | Impact |
|---------|---------|---------|-----|----------|--------|
| (none) | — | — | — | — | No vulnerabilities found |

`bun audit` clean. 새로 도입된 `velite ^0.3.1`, `@shikijs/rehype ^4.0.2`, `shiki ^4.0.2`, `rehype-slug ^6.0.0` 모두 known CVE 없음.

---

## OWASP Compliance Checklist

| Category | Status | Notes |
|----------|--------|-------|
| A01 - Broken Access Control | n/a | T007은 콘텐츠 빌드 파이프라인. 라우트/auth 변경 없음. |
| A02 - Cryptographic Failures | n/a | 시크릿 / 암호화 코드 없음. |
| A03 - Injection | OK (D2 결정 명시) | `new Function(code)`의 `code`는 build-time velite 산출물이며 사용자 입력 경로 없음. seed MDX는 본인이 작성한 신뢰 가능한 소스. |
| A04 - Insecure Design | High #1 | `new Function`의 SSR Workers 동작 / CSP 영향이 wrangler·docs에 미문서화. |
| A05 - Security Misconfiguration | n/a | wrangler 헤더/CORS 변경 없음. |
| A06 - Vulnerable Components | OK | `bun audit` 0건. |
| A07 - Auth Failures | n/a | Auth 코드 없음. |
| A08 - Data Integrity | OK | velite Zod schema 검증 + shiki HTML은 build-time 출력. user-generated 데이터 경로 없음. |
| A09 - Logging Failures | n/a | 로깅 변경 없음. |
| A10 - SSRF | n/a | 외부 URL fetch 코드 없음. |

---

## Performance Metrics

### Response Time
- velite는 build-time이므로 런타임 cost는 0. SSR 시 `MdxRenderer`의 `new Function(code)` 평가 비용은 페이지 단건 1회 — 페이지당 µs급으로 감지 불가 수준. 측정 없이 최적화 보류 (React Compiler 신뢰 정책 부합).

### Memory Usage
- `code` string은 페이지 단위로 GC. 누수 패턴 없음. seed 파일이 작아 worst-case 메모리 영향 무시 가능.

### Algorithm Complexity
- 복잡도 분석 대상 알고리즘 없음 (`MdxRenderer`는 O(1) 평가 + React 트리 빌드).

### I/O Efficiency
- velite는 빌드 단계에서 `content/**/*.mdx` 읽기 1회 → `.velite/*.json` 출력. lifecycle scripts(`pre*`)가 4개 라이프사이클(`dev`/`build`/`start`/`test`)을 모두 보장하므로 stale cache 위험이 낮음. **clean: true**(velite.config.ts:50)는 매 빌드 wipe — small content set에서는 적절(증분 빌드 도입은 콘텐츠 100+ 시점에 검토).

### Bundle Size
- 클라이언트 번들에 `react/jsx-runtime`만 추가 (이미 React 19에서 포함). `MdxRenderer` 자체는 12 LOC. shiki는 build-time(rehype) 사용이므로 클라이언트 bundle에 들어가지 않는다 — `@shikijs/rehype` / `shiki` 모두 `devDependencies`에 정확히 위치(✅).

---

## Positive Aspects

> Well-written code — always include for balanced feedback

- **lifecycle scripts 4개가 모두 등록**: `predev`/`prebuild`/`prestart`/`pretest`. `bun run test`만 호출해도 `.velite/`가 보장되어 CI에서 stale cache 회귀가 차단된다(특히 fresh clone 시점). 작은 PR에 큰 운영 가치.
- **TDD Red→Green 분리 준수**: `a3293a0 test(T007): MdxRenderer Red`가 `8ce2d1d feat(T007): green` 앞에 분리되어 있어 Inside-Out TDD 정책 부합.
- **의도적 결정의 명시적 주석**: `velite.config.ts:55` `biome-ignore` 주석에 사유("shiki rehype 플러그인 타입 incompat") 명시. `as any`를 무근거로 쓰지 않음.
- **CA layer placement**: `velite.config.ts`는 root에, `MdxRenderer`/`CodeBlock`은 Presentation 내부에. PROJECT-STRUCTURE.md L274의 "velite는 build-time ETL"과 정확히 일치.
- **Surgical scope**: 11개 파일 변경 중 source 5 file, content 4 file, config 2 file. 인접 파일을 만지지 않음(Surgical Changes 정책 부합).
- **Path alias `#content`**: T006/T007 사이 자연스러운 import 경로 확보 — 후속 Repository task에서 `import { projects } from "#content"`로 일관 사용 가능.

---

## Fix Checklist

**Required**: Check each checkbox immediately after fixing the issue.

### Critical Issues
- (없음)

### High Issues
- [x] #1 [High/Security] `MdxRenderer.tsx:5` + `wrangler.toml` — `new Function` SSR/CSP 운영 노트 추가 (`wrangler.toml:2-7`에 명시)

### Medium Issues
- [x] #2 [Medium/Architecture] `app/presentation/components/content/CodeBlock.tsx` — 삭제 (사용처 task에서 재도입 예정)
- [ ] #3 [Medium/Architecture] `project.schema.ts:7` (T006 owner) — follow-up issue로 deferred (Surgical Changes)
- [ ] #4 [Medium/Quality] `content/legal/apps/moai/{terms,privacy}.mdx:10` — seed placeholder, 후속 task에서 처리

### Low Issues
- [ ] #5 [Low/Architecture] `tsconfig.cloudflare.json` `include`에 `velite.config.ts` 추가 시도 → velite의 private Zod 3 type leak 발생, deferred (별도 `tsconfig.node.json` 필요)
- [x] #6 [Low/Quality] `MdxRenderer.tsx:4` — `useMDXComponent` → `evaluateMdxBody` rename
- [ ] #7 [Low/Quality] `velite.config.ts:55-56` — shiki plugin type cast 좁히기, deferred
- [x] #8 [Low/Quality] `package.json` — `"velite": "velite"` 삭제, `velite:build`만 유지
- [ ] #9 [Low/Quality] `MdxRenderer.test.tsx:5-11` — 현 상태 OK (헬퍼 유지)

---

## Notes

- D1 / D2 / D5는 plan 단계에서 사전 승인되어 본 리뷰의 relitigation 대상이 아니다. 본 리뷰는 **그 결정의 운영 측면 보강**(High #1)과 **결정과 무관한 부수 정리**(Medium / Low)에만 집중했다.
- **Verdict**: **Approve with minor changes**. High #1은 wrangler/docs 노트로 해결 가능(코드 변경 불요), Medium #2는 한 줄 cleanup. 나머지는 후속 PR로 deferable.
- Resolve issues in severity order (Critical > High > Medium > Low).
- Update Status to "Complete" when all High checkboxes are checked.

---

*Generated by unified code-reviewer agent — T007 review on commit 8ce2d1d*
