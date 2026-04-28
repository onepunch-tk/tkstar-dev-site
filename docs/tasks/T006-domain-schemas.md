# Task 006 — Domain Schemas (Project / Post / AppLegalDoc / ContactSubmission / ThemePreference)

| Field | Value |
|-------|-------|
| **Task ID** | T006 |
| **Phase** | Phase 1 — Foundation |
| **Layer** | **Domain** (innermost) |
| **Branch** | `feature/issue-N-domain-schemas` |
| **Depends on** | T002 |
| **Blocks** | T007, T008, T009, T017 |
| **PRD Features** | F002, F004, F005, F006, F007, F008, F010, F014, F017 (read-side 데이터 모델) |
| **PRD AC** | AC-F008-2 (RFC 5322), AC-F008-3 (메시지 10~5000자) — `ContactSubmission` schema에 정의 |
| **예상 작업 시간** | 1d |
| **Status** | Not Started |

## Goal
Clean Architecture의 가장 안쪽 레이어인 Domain에 5개 콘텐츠/입력 모델의 Zod 스키마를 정의한다. 이 스키마는 velite frontmatter 검증(T007)과 Application 유스케이스(T008/T017) 양쪽이 단일 정본으로 공유한다. A001(About 자격증), A003(AppLegalDoc version/effective_date) 가정도 이 단계에서 해소.

## Context
- **Why**: Domain layer는 외부 의존성이 일체 없어야 하며(zod만 허용), Project/Post/AppLegalDoc 엔티티의 형태가 이후의 모든 read-side adapter와 페이지 컴포넌트의 타입 계약이 된다. ContactSubmission schema는 AC-F008-2/3을 단위 테스트 수준에서 직접 검증할 수 있는 첫 지점.
- **Phase 진입/완료 연결**: T002(디렉토리) 완료 후 즉시. T006 Done 후 T007(velite가 이 스키마를 import) + T017(ContactSubmission이 Form action에 사용)이 시작 가능.
- **관련 PRD 섹션**: PRD `Data Model` 5개 모델, AC-F008-2/3
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/domain/{project,post,legal,contact,theme}/`

## Scope

### In Scope
- 5개 도메인 모듈에 entity/schema/errors/value object 파일 작성 + `__tests__/`
- Zod 스키마는 PRD `Data Model` 섹션의 필드를 정확히 반영
- `ContactSubmission` schema는 AC-F008-2 (RFC 5322 이메일), AC-F008-3 (메시지 10~5000자) 검증 룰 포함
- `AppLegalDoc` schema에 `version` (string) + `effective_date` (ISO date) 필드 명시 (A003 해소)
- `Project` schema의 `featured: boolean (optional)` 필드 (A001 해소: 자격증은 frontmatter optional 필드로 자리만 확보 — Project가 아닌 경우 별도 entity 추가는 보류)

### Out of Scope
- velite 컬렉션 정의 (T007이 이 스키마를 import)
- Repository 구현 (T008)
- velite raw output → Domain Entity mapper (T008)
- ContactSubmission을 사용하는 Form/Action (T017)

## Acceptance Criteria
- [ ] `app/domain/project/project.schema.ts`가 정상 frontmatter (slug/title/summary/date/tags/stack/metrics/featured?/cover?)를 통과시킨다
- [ ] `app/domain/post/post.schema.ts`가 정상 frontmatter (slug/title/lede/date/tags/read)를 통과시킨다
- [ ] `app/domain/legal/app-legal-doc.schema.ts`가 정상 frontmatter (app_slug/doc_type/version/effective_date)를 통과시킨다
- [ ] `app/domain/contact/contact-submission.schema.ts`가 RFC 5322 위반 이메일을 reject (AC-F008-2)
- [ ] `app/domain/contact/contact-submission.schema.ts`가 메시지 10자 미만 / 5000자 초과를 reject (AC-F008-3)
- [ ] `app/domain/theme/theme-preference.vo.ts`가 `"dark" | "light"` literal type을 export
- [ ] 모든 5개 모듈의 `__tests__/`가 정상값 통과 + 이상값 reject 케이스를 포함하여 100% Green
- [ ] `bun run test` + `bun run typecheck` 통과

## Implementation Plan (TDD Cycle)

### Red
모든 스키마 테스트는 (a) 정상 입력 통과 (b) 각 필수 필드 누락 reject (c) 타입 위반 reject 3 카테고리를 최소 포함:

- `app/domain/project/__tests__/project.schema.test.ts`
  - 정상 frontmatter (필수 필드 모두 + featured/cover optional 미포함) → `safeParse({success: true})`
  - `slug` 누락 → reject
  - `metrics`가 `[string, string][]`이 아닌 경우 reject
  - `featured: true`가 통과
- `app/domain/post/__tests__/post.schema.test.ts`
  - 정상 frontmatter → pass
  - `read`가 number가 아니면 reject
- `app/domain/legal/__tests__/app-legal-doc.schema.test.ts`
  - `doc_type: "terms"` / `"privacy"` 통과, `"foo"` reject
  - `effective_date` ISO 8601이 아니면 reject
- `app/domain/contact/__tests__/contact-submission.schema.test.ts`
  - `"foo@bar.com"` 통과, `"foo@"` / `"bar.com"` reject (AC-F008-2)
  - 메시지 길이 9자 reject, 10자 통과, 5000자 통과, 5001자 reject (AC-F008-3)
  - `inquiry_type`은 `"B2B" | "B2C" | "etc"` 외 값 reject
  - `company` 미입력(undefined)도 통과 (optional)
- `app/domain/theme/__tests__/theme-preference.test.ts` (선택, type-only면 생략 가능)

### Green
- `app/domain/project/project.entity.ts` — `Project` interface (Zod `infer`로 derive)
- `app/domain/project/project.schema.ts` — Zod schema
- `app/domain/project/project.errors.ts` — `ProjectNotFoundError extends Error`
- `app/domain/post/post.{entity,schema}.ts`
- `app/domain/legal/app-legal-doc.{entity,schema}.ts`
- `app/domain/contact/contact-submission.vo.ts`, `contact-submission.schema.ts`, `contact.errors.ts`
- `app/domain/theme/theme-preference.vo.ts` — `export type ThemePreference = "dark" | "light"`

### Refactor
- 공통 Zod helper(`zIso8601Date`, `zNonEmptyString`)를 `app/domain/_shared/zod-helpers.ts`로 추출 (의존성 그래프 외부화 금지)
- entity 파일이 schema 파일을 import하는 단방향 흐름 정리

## Files to Create / Modify

### Domain — Project
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/project/project.entity.ts` | `export type Project = z.infer<typeof projectSchema>` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/project/project.schema.ts` | Zod frontmatter schema (slug/title/summary/date/tags/stack/metrics/featured?/cover?) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/project/project.errors.ts` | `ProjectNotFoundError`, `InvalidProjectFrontmatterError` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/project/__tests__/project.schema.test.ts` | Red 4 cases |

### Domain — Post
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/post/post.entity.ts` | `Post` type |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/post/post.schema.ts` | slug/title/lede/date/tags/read |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/post/__tests__/post.schema.test.ts` | Red 2 cases |

### Domain — Legal
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/legal/app-legal-doc.entity.ts` | `AppLegalDoc` type |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/legal/app-legal-doc.schema.ts` | app_slug/doc_type/version/effective_date |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/legal/__tests__/app-legal-doc.schema.test.ts` | Red 2 cases |

### Domain — Contact
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/contact/contact-submission.vo.ts` | Value Object (immutable) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/contact/contact-submission.schema.ts` | RFC 5322 email + 10~5000자 message (AC-F008-2/3) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/contact/contact.errors.ts` | `InvalidContactSubmissionError` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/contact/__tests__/contact-submission.schema.test.ts` | Red 4+ cases (AC-F008-2/3 직접 매핑) |

### Domain — Theme
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/theme/theme-preference.vo.ts` | `export type ThemePreference = "dark" \| "light"` |

### Shared (Refactor 단계에서)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/domain/_shared/zod-helpers.ts` | `zIso8601Date`, `zNonEmptyString`, `zRfc5322Email` 등 |

## Verification Steps

### 자동
- `bun run test` → 5개 도메인 모듈의 모든 테스트 Green
- `bun run typecheck` → Zod `infer`된 타입이 entity 타입과 일치
- `bun run lint` 통과

### 수동
- 없음

### 측정
- 없음

## Dependencies
- **Depends on**: T002 (Domain 디렉토리)
- **Blocks**: T007 (velite가 이 스키마 import), T008 (Application 유스케이스가 entity 타입 사용), T009 (DI container가 ContactSubmissionError 등 처리), T017 (Contact form action이 ContactSubmission schema 사용)

## Risks & Mitigations
- **Risk**: Zod의 RFC 5322 이메일 검증이 `.email()` 기본 룰에서 일부 valid 이메일 reject할 수 있음.
  - **Mitigation**: AC-F008-2은 PRD에 "RFC 5322 위반 형식(`foo@`, `foo.com`)"으로 명시. Zod `.email()` 기본 룰이 이 위반을 reject하면 충분. 더 엄격한 케이스는 추후 보강.
- **Risk**: AppLegalDoc의 `version` 형식이 자유 문자열인지 SemVer인지 모호.
  - **Mitigation**: PRD `Data Model`에 `version: string`으로만 명시 → free string으로 채택. SemVer 강제는 운영 단계에서 결정.

## References
- PRD `Data Model` (Project / Post / AppLegalDoc / ContactSubmission / ThemePreference)
- PRD `Acceptance Criteria — F008` AC-F008-2/3
- PROJECT-STRUCTURE.md `app/domain/` (line 95~132)
- ROADMAP.md `Phase 1` Task 006, 가정 A001/A003 해소
- [Zod docs](https://zod.dev/)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
