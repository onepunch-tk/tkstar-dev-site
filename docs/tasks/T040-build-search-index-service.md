# T040 — feature: buildSearchIndex Application service 분리 + admin save 시 자동 재생성

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T027](T027-mdx-runtime-compiler-kv-cache.md), [T036](T036-admin-post-editor-tiptap.md), [T039](T039-admin-projects-meta-ui.md)
> **후행**: none

---

## 목적

T016 의 `scripts/build-search-index.ts` (빌드 타임) 를 Application service `buildSearchIndex` 로 승격하고, admin (T036 publish, T039 meta save) 트리거 시점에 R2 의 `search-index.json` 객체를 갱신한다. Cmd+K palette 의 검색 가능 콘텐츠가 빌드 사이클 없이 admin 작업 직후 즉시 반영되도록 한다.

## PRD Feature ID 매핑

- F016
- F020

## 입력·출력 계약

**입력**: D1 posts (published) + velite projects + project_meta + R2 bucket. **출력**: `app/application/search/services/build-search-index.ts` + `app/infrastructure/search/r2-index.writer.ts` + container wiring + T016 의 빌드 스크립트는 본 service 호출로 thin 하게 재정렬 + admin save/publish 액션 끝에 호출 hook + `__tests__/`. **검증**: T036 publish 후 R2 `search-index.json` 갱신, T039 meta save 후 갱신, Cmd+K palette 가 즉시 새 항목 검색 가능 (브라우저 캐시 무효화 포함).

## 시퀀스

```
1. Application — `build-search-index.ts` (input: 없음, output: SearchIndex[]). 내부에서 posts/projects 합쳐 SearchIndex entry 생성
2. Infrastructure — `r2-index.writer.ts` (R2 `search-index.json` put + cacheControl `public, max-age=60`)
3. T036 publish-post action + T039 admin.projects action 끝에 `buildSearchIndex` 호출 (best-effort, 실패해도 save 자체는 성공)
4. T016 의 빌드 스크립트는 본 service 호출 + 결과를 `public/search-index.json` 에 쓰는 thin wrapper 로 재정렬
5. 정적 빌드 (deploy 시) vs 동적 R2 (admin save 시) — 우선순위는 R2 (최신). Cmd+K 가 R2 URL fetch 로 전환
6. Cmd+K (T016) — index source URL 을 `/search-index.json` (정적) → `https://media.tkstar.dev/search-index.json` 또는 worker 프록시로 전환
7. cache-busting — `search-index.json?v=<updated_at>` 쿼리스트링 또는 cacheControl 60s
8. Vitest — buildSearchIndex output 검증 + R2 put 호출 검증 + admin save → index 갱신 통합 케이스
```

## 엣지 케이스 + 구현

## Implementation Notes

- 빌드 타임 vs 런타임 — 둘 다 유지. deploy 직후엔 정적 산출물, admin 작업 후엔 R2 의 동적 산출물. Cmd+K 는 R2 우선 fetch, fail 시 정적 fallback.
- SearchIndex entry 구조 (T016 호환) — { type, title, slug, summary?, tags? }.
- R2 put 의 cacheControl 60s — admin 작업 직후 1분 내 반영 보장.
- best-effort 정책 — index 갱신 실패는 save 자체를 막지 않음 (admin UX 우선). Workers tail 로 모니터링.
- 본 task 가 머지되면 T016 의 `scripts/build-search-index.ts` 는 본 service 의 thin wrapper. ROADMAP 의 'CMS Project Meta + Search Index' 분리 의도 완수.
- F016 의 Cmd+K palette 가 본 task 로 실시간성 확보 — '검색 우선 네비게이션' 의 사이트 동기화 완성.
- F020 의 admin save flow 의 끝단도 본 task 로 마무리.

## Change History from previous body

- feature branch PR: `feature/issue-N-build-search-index-service`.
- Phase 7.4 의 종결 task — 본 task 머지 후 CMS 인프라 1차 완료.

## DoD

- [ ] buildSearchIndex Application service 정의
- [ ] Infrastructure r2-index.writer.ts 구현
- [ ] T036 publish action 후 index 자동 갱신
- [ ] T039 meta save action 후 index 자동 갱신
- [ ] T016 빌드 스크립트가 본 service 의 thin wrapper 로 재정렬
- [ ] Cmd+K palette 가 R2 index 우선 fetch + 정적 fallback
- [ ] cache-busting (cacheControl 60s 또는 ?v= 쿼리)
- [ ] admin save → 1분 이내 Cmd+K 결과 반영 (수동 검증)
- [ ] best-effort — index 갱신 실패가 save 를 막지 않음
- [ ] Vitest 3 케이스 (build / R2 put / publish hook) Green

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| - | - | - |
