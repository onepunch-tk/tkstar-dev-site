# T006 — feature: Domain Schemas — Project / Post / AppLegalDoc / ContactSubmission / ThemePreference

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T002](T002-ca-4layer-skeleton.md)
> **후행**: [T007](T007-velite-content-pipeline.md), [T008](T008-content-ports-repos.md), [T009](T009-di-container.md)

---

## 목적

Domain layer (innermost) 의 콘텐츠·폼·테마 스키마를 Zod 로 확정한다. velite frontmatter 검증, Contact form validation, ThemePreference VO 의 source-of-truth 를 만들어 이후 Application/Infrastructure layer 가 의존할 수 있는 안정적 contract 를 제공.

## PRD Feature ID 매핑

- F002
- F004
- F005
- F006
- F007
- F008
- F010
- F014
- F017

## 입력·출력 계약

**입력**: T002 의 `app/domain/*` 빈 모듈. **출력**: 각 도메인에 entity + schema + errors + `__tests__/` 작성. **검증**: Domain `__tests__/` 의 Zod 스키마 테스트 (정상값 통과 / 이상값 reject) 100% Green.

## 시퀀스

```
1. project — entity + schema + errors + `__tests__/project.schema.test.ts` (slug/tags/featured/cover 필드)
2. post — entity + schema + `__tests__/post.schema.test.ts` (Phase 7.1 에서 D1 schema 로 갱신 예정)
3. legal — `app-legal-doc.entity.ts` + schema + `__tests__/` (version + effective_date 표준 메타)
4. contact — `contact-submission.vo.ts` + schema + errors + `__tests__/contact-submission.schema.test.ts` (RFC 5322 이메일 + 메시지 10~5000자)
5. theme — `theme-preference.vo.ts` (auto / light / dark enum)
6. 모든 `__tests__/` 의 정상값/이상값 케이스 Green
```

## 엣지 케이스 + 구현

## Implementation Notes

- Zod 버전: 프로젝트 표준 (Zod 4 internal). velite 는 Zod 3 internal 이라 T007 에서 schema mirror 로 격리 — 본 task 에선 신경 안 써도 됨.
- AppLegalDoc 표준 메타: `version` (semver), `effective_date` (ISO 8601 date). A003 해소.
- ContactSubmission validation: RFC 5322 이메일 정규식 + message length 10..5000 (AC-F008-2/3).
- About 자격증 카드 (A001): velite Project frontmatter 의 optional 필드로 자리만 — entity/schema 에 optional 로 정의, 본 task 에선 데이터 입력 없음.
- ThemePreference VO 는 `'auto' | 'light' | 'dark'` 3-state.
- Project entity 의 `cover` / `cover_alt` 는 본 task 시점엔 frontmatter 채택 — T038 에서 D1 project_meta 로 이관 예정.

## Change History from previous body

- A001 (자격증 데이터 카드) 해소 — frontmatter optional 필드.
- A003 (Legal 표준 메타) 해소 — `version` + `effective_date`.
- feature branch PR: `feature/issue-N-domain-schemas`.

## DoD

- [x] `app/domain/project/{project.entity.ts, project.schema.ts, project.errors.ts}` + `__tests__/project.schema.test.ts` 작성
- [x] `app/domain/post/{post.entity.ts, post.schema.ts}` + `__tests__/post.schema.test.ts` 작성
- [x] `app/domain/legal/{app-legal-doc.entity.ts, app-legal-doc.schema.ts}` + `__tests__/` 작성
- [x] `app/domain/contact/{contact-submission.vo.ts, contact-submission.schema.ts, contact.errors.ts}` + `__tests__/contact-submission.schema.test.ts` 작성
- [x] `app/domain/theme/theme-preference.vo.ts` 작성
- [x] Domain `__tests__/` 모두 Green (정상값 + 이상값)
- [x] A001 (자격증 카드 frontmatter optional) 해소 기록
- [x] A003 (Legal 표준 메타 version + effective_date) 해소 기록

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | T006 머지 — Domain schemas 5종 + A001/A003 해소 (branch `feature/issue-N-domain-schemas`) | TaekyungHa |
