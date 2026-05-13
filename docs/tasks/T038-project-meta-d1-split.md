# T038 — feature: Project meta D1 분리 — cover/cover_alt/featured 만 D1 project_meta 로 이관

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T024](T024-drizzle-d1-setup.md), [T033](T033-r2-bucket-setup.md)
> **후행**: [T039](T039-admin-projects-meta-ui.md), [T040](T040-build-search-index-service.md)

---

## 목적

Project 는 본문이 거의 정적 (Case Study) 이지만 cover 이미지와 featured 플래그는 사이트 컨디션에 따라 admin 이 자주 바꾼다. velite frontmatter 를 매번 git commit 하기 번거로움 해소 — `project_meta` D1 테이블 (slug PK + cover / cover_alt / featured / featured_order / updated_at) 분리. velite 의 본문/메타데이터는 그대로, overlay 만 D1.

## PRD Feature ID 매핑

- F004
- F005
- F017

## 입력·출력 계약

**입력**: velite project collection + D1 셋업. **출력**: `app/infrastructure/db/schema.ts` 의 `project_meta` 테이블 + migration + `app/application/content/services/list-projects.ts` / `get-project-detail.ts` 의 overlay 로직 갱신 + container 의 ProjectRepository 합성 + `__tests__/`. **검증**: velite project + project_meta overlay → ProjectEntity (cover, cover_alt, featured 가 D1 우선), D1 미존재 slug 는 frontmatter fallback, `bun run db:migrate:local` 성공.

## 시퀀스

```
1. schema.ts — `project_meta` (slug TEXT PK, cover TEXT NULL, cover_alt TEXT NULL, featured INTEGER 0/1, featured_order INTEGER NULL, updated_at INTEGER)
2. migration 생성 + apply
3. Infrastructure — `ProjectMetaRepository` (findBySlug, findAll, upsert)
4. Infrastructure — `ProjectRepository` 합성 어댑터 — velite-project.repo + project-meta.repo 두 source 합성 후 ProjectEntity 반환
5. Application services (`list-projects`, `get-project-detail`, `get-featured-project`) 변경 없음 — port 만 의존
6. Featured 결정 우선순위: project_meta.featured 가 있으면 그것, 없으면 velite frontmatter.featured
7. Vitest — overlay 로직 (D1 우선 / fallback) 케이스 4종
8. 기존 frontmatter cover 데이터는 본 task 머지 시점 그대로 — admin (T039) 으로 점진 편집
```

## 엣지 케이스 + 구현

## Implementation Notes

- Project 본문/스킬/링크 등은 velite 유지 — 본 task 는 'admin 이 자주 바꾸는 메타' 만 D1 으로.
- overlay 정책: D1 row 존재 시 cover/cover_alt/featured 우선, 미존재 시 frontmatter fallback. featured_order 도 D1 우선.
- featured_order NULL 이면 published 또는 created 순.
- ProjectRepository 합성 어댑터는 두 repo 의 합집합 — velite slug 기준 outer-loop, D1 lookup inner.
- ProjectMetaRepository.upsert 는 T039 admin UI 가 사용.
- 본 task 의 cover 갱신 시 KV / OG 캐시 (T018) invalidation 은 updated_at 으로 자동.
- F017 의 Featured Project 결정 로직이 본 task 부터 D1 으로 전환.
- A011 (R2 노출 경로) — cover_url 도 media.tkstar.dev 호스트.

## Change History from previous body

- feature branch PR: `feature/issue-N-project-meta-d1-split`.
- Phase 7.4 의 데이터 분리 진입.

## DoD

- [ ] schema.ts project_meta 테이블 + migration
- [ ] `bun run db:migrate:local` 성공
- [ ] ProjectMetaRepository CRUD
- [ ] ProjectRepository 합성 어댑터 (velite + project_meta)
- [ ] Application services 시그니처 변경 없음 (port 의존)
- [ ] overlay 우선순위 (D1 우선 / fallback) 검증
- [ ] Vitest 4 케이스 Green
- [ ] 기존 frontmatter cover 의 점진 마이그레이션 경로 확보 (manual)

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
