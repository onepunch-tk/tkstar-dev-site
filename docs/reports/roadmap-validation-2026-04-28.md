# ROADMAP Validation Report: tkstarDev

> **Validation Date**: 2026-04-28
> **Validated Document**: `docs/ROADMAP.md` (572 lines, Phase 0~6, Task 001~022)
> **Cross-checked Against**: `docs/PRD.md` (F001~F019 + AC + A001~A012), `docs/PROJECT-STRUCTURE.md` (CA 4-layer), `docs/reports/prd-validation-2026-04-28.md`, `CLAUDE.md`
> **Platform**: Web (React Router v7 Framework + Cloudflare Workers SSR)
> **Scale**: Small (1인 정적 사이트, DB 없음, 인증 없음)
> **Validator**: roadmap-validator

---

## Validation Summary

### Validation Path

1. **File Collection** — 4개 문서 전부 읽음 (ROADMAP / PRD / PROJECT-STRUCTURE / PRD validation report)
2. **Structure-First Analysis** — 7개 phase 모두 Skeleton-First + Inside-Out 준수
3. **Task Decomposition** — 22 task 모두 PR 1개 단위 적정. 6개는 다소 큼 (003/004/008/014/017/019)이나 응집도 높아 OK
4. **Dependency Verification** — 순환 없음. Inside-Out (Domain → Application → Infrastructure → Presentation) 준수
5. **PRD Coverage** — F001~F019(F015 제외) 18개 = 100% 매핑. 11개 페이지 단위 모두 task에 존재
6. **AC Mapping** — 18개 AC (F003×3, F008×4, F009×3, F011×3, F016×5) 모두 task에 명시
7. **Assumption Resolution** — A001~A012 12개 모두 phase 게이트와 일치 (A003/A004는 더 이른 해소로 정합성 강화)
8. **PR-only Workflow** — chore/feature/docs 분류 일관, CLAUDE.md 정책과 일치
9. **PROJECT-STRUCTURE 정합성** — 모든 산출물 경로가 layer 정의와 일치 (단, `infrastructure/ratelimit/` 신규 모듈은 PROJECT-STRUCTURE.md에 미등록)
10. **DoD 명확성** — 7개 phase 모두 명령어/테스트/AC 기준으로 측정 가능. "잘 동작" 류 모호 표현 없음

### Confidence Distribution

- **High Confidence** [FACT]: ~85% (ROADMAP 본문에서 직접 확인)
- **Medium Confidence** [INFERENCE]: ~12% (의존 그래프 + Phase 묶음 합리성 추론)
- **Low Confidence** [UNCERTAIN]: ~0%
- **Issues Found** [MISSING/INCONSISTENT]: ~3% (7건, Blocker 0 / High 1 / Medium 4 / Low 2)

---

## Detailed Findings

### Step 1: Structure-First Compliance

[FACT] **Phase 순서**:
- Phase 0 (Setup) → Phase 1 (Routing Skeleton + Domain + Theme) → Phase 2 (Content Pipeline) → Phase 3 (Core Pages) → Phase 4 (Forms + Palette) → Phase 5 (SEO/OG) → Phase 6 (Deploy)
- Task 002 (CA 4-layer skeleton) → Task 004 (라우트 13개 placeholder) → Task 006 (Domain Zod schema) 순서로 골격이 기능보다 먼저.

[FACT] **Inside-Out 검증**:
- Domain (T006) ─→ Application Ports (T008) ─→ Infrastructure Repos (T008) ─→ Presentation routes (T010~T015): 정확히 안→밖.

**준수 점수: 7/7 phase 정확하게 정렬됨.**

### Step 2: Task 분해 품질

| 카테고리 | 갯수 | 비고 |
|---------|------|------|
| 적정 크기 | 16 / 22 | T001/002/005/006/007/009/010/011/012/013/015/016/018/020/021/022 |
| 다소 큼 (PR 1개로 가능) | 6 / 22 | T003 (Vite+RR7+Workers+Tailwind), T004 (라우트 13개+layout 2개), T008 (Ports+3repos+6services), T014 (Blog+Detail+RSS), T017 (Form+Turnstile+Resend+KV), T019 (Sitemap+Robots+meta×11+JSON-LD) |
| 너무 작음 | 0 / 22 | — |

[FACT] **모든 task에 다음이 명시됨**:
- Task ID (T001~T022) ✅
- Layer 매핑 (Domain/Application/Infrastructure/Presentation/Platform Adapter) ✅
- 관련 Feature ID (F00X) ✅
- 관련 AC ID (AC-F00X-N) ✅
- 의존성 (blockedBy / blocks) ✅
- 검증 방법 (명령어 / 테스트 / AC) ✅
- 산출물 (파일 경로) ✅
- PR 브랜치 명 ✅

### Step 3: Dependency Order

```
T001 ─→ T002 ─→ T006 (Domain) ─┐
       ↘                        ↓
T001 ─→ T003 ─→ T004 (Routes)   T007 (velite) ─→ T008 (Ports/Repos/Services) ─→ T009 (DI)
              ↘                                                                      ↓
              T005 (Theme) ──────────────────────────────────────────────────────┤
                                                                                     ↓
                                          T010 ║ T011 ║ T012 ║ T013 ║ T014 ║ T015 (병렬)
                                                                                     ↓
                                                T016 (Cmd+K, T010 후) + T017 (Contact, T006/008/009)
                                                                                     ↓
                                                    T013/T014 → T018 (OG)
                                                                                     ↓
                                              T010~T015,T018 → T019 (SEO) → T020 → T021 → T022
```

[FACT] **순환 없음**, 병렬 가능 task가 명시 (`||` 표기).

[INCONSISTENT] **사소한 의존성 누락**: T008의 `blockedBy`에 T002 누락. transitive로 보장되나 명시성 권장. (Issue #2)

### Step 4: PRD Feature Coverage

| Feature | 1차 Task | 매핑 |
|---------|---------|------|
| F001 Hero | T010 | ✅ |
| F002 About | T011 | ✅ |
| F003 PDF | T011 (+ AC-F003-1/2/3) | ✅ |
| F004 Projects 목록 | T012 | ✅ |
| F005 Project Case Study | T013 | ✅ |
| F006 Blog 목록 | T014 | ✅ |
| F007 Blog 상세 | T014 | ✅ |
| F008 Contact Form | T017 (+ AC-F008-1/2/3/4) | ✅ |
| F009 Turnstile | T017 (+ AC-F009-1/2/3) | ✅ |
| F010 다크모드 | T005 | ✅ |
| F011 SSR + 동적 OG | T018 (+ AC-F011-1/2/3) | ✅ |
| F012 RSS | T014 | ✅ |
| F013 Web Analytics | T020 | ✅ |
| F014 앱 약관 | T015 | ✅ |
| F015 (Removed) | — | ✅ 미할당 명시 |
| F016 Cmd+K | T016 (+ AC-F016-1~5) | ✅ |
| F017 Featured/Recent | T010 | ✅ |
| F018 SEO Meta | T019 | ✅ |
| F019 검색엔진 등록 | T020 | ✅ |

[FACT] **F001~F019(F015 제외) 18개 = 100% coverage**. 누락된 Feature **없음**. 11개 페이지 단위(Home/About/Projects/ProjectDetail/Blog/BlogDetail/Contact/LegalIndex/AppTerms/AppPrivacy/NotFound) 모두 task에 존재.

### Step 5: Acceptance Criteria 매핑

[FACT] **AC를 가진 5개 Feature × 18개 AC 모두 매핑됨**:
- AC-F003-1/2/3 → T011 line 252
- AC-F008-1/2/3/4 → T017 line 350
- AC-F009-1/2/3 → T017 line 350
- AC-F011-1/2/3 → T018 line 388
- AC-F016-1/2/3/4/5 → T016 line 332

또한 T021 통합 QA에서 18개 AC 전수 회귀 매트릭스로 한 번 더 점검 (line 453).

### Step 6: Assumptions Register 정합성

[FACT] A001~A012 12개 모두 ROADMAP의 phase 게이트와 일치. A003/A004는 PRD 게이트(F014/F018-F019 PR)보다 더 이른 단계(Phase 1)에서 해소되도록 ROADMAP이 강화. A011/A012는 명시적 Post-MVP 분리.

### Step 7: PR-only Workflow

[FACT] 브랜치 명명 일관성:
- chore: T001/002/003/021/022 (toolchain/QA/deploy)
- feature: T004~T020 (F00X 기능 구현)
- CLAUDE.md의 chore/* docs/* Plan/TDD 면제 정책 (line 64~65)과 ROADMAP 정책 매트릭스 (line 39~44) 일치.

### Step 8: TDD-First 적용 가능성

[FACT] T005/006/008/009/011/013/014/016/017/018/019는 자동 테스트 명시. T010/012/015는 "UI 표시 위주"로 자동 테스트 항목 부족 → **High severity Issue #1** (PRD 검증 리포트 Issue #4 잔여 영향).

### Step 9: PROJECT-STRUCTURE.md 정합성

[FACT] 모든 산출물 경로가 layer 정의와 일치. 다만 T017이 도입하는 `app/infrastructure/ratelimit/kv-rate-limiter.ts`는 PROJECT-STRUCTURE.md `app/infrastructure/` 트리에 미등록 → **Medium severity Issue #3**.

### Step 10: DoD 명확성

[FACT] 7개 phase의 진입 조건/완료 조건이 모두 명령어/테스트/AC 기준으로 측정 가능. "잘 동작", "작동 확인" 류 모호 표현 부재.

---

## Risk Items

### High Severity

#### Issue #1 — Task 010/012/015 자동 테스트 항목 부족 (TDD-First 약점)

- **Severity**: High
- **위치**: Phase 3 / T010 (Home), T012 (Projects List), T015 (Legal)
- **재현 가능 근거**:
  - ROADMAP line 241 (T010): "관련 AC: 없음 (Page-by-Page Key Features로 검증)"
  - ROADMAP line 269 (T012): "관련 AC: 없음 (UI 표시 위주)"
  - ROADMAP line 311 (T015): "관련 AC: 없음 (Page-by-Page Key Features + F018 차등 인덱싱은 Phase 5)"
  - CLAUDE.md Core Principles `TDD-First`: "All implementations must be preceded by writing tests first"
  - CLAUDE.md `Goal-Driven Execution`: "Reject weak criteria like 'make it work'"
- **위험**: "UI 표시 위주" 문구는 Red-phase 테스트로 변환하기 어려움. 테스트 누락 시 Phase 3 정상 종료 판정이 흔들림.
- **권장 수정안**:
  - **T010**: 검증에 추가 — `Home loader가 getFeaturedProject + getRecentPosts(3)를 호출 (vitest mock)`, `RecentPostsList component가 3개 PostRow를 렌더 (RTL)`, `Featured 미존재 시 fallback 처리 검증`
  - **T012**: 검증에 추가 — `Projects loader가 listProjects(tag?)를 호출`, `TagFilterChips 클릭 시 URLSearchParam 변경 (RTL + memoryRouter)`, `행 클릭 시 /projects/:slug 네비게이션 검증`
  - **T015**: 검증에 추가 — `Legal Index loader가 listApps()를 호출`, `appCount === 0이면 Footer Legal 링크 미렌더 (RTL)`, `ChromeFreeLayout이 Topbar/Footer를 미렌더 + max-width 680px 적용 검증`

### Medium Severity

#### Issue #2 — Task 008 의존성에 Task 002 누락 (명시성)

- **Severity**: Medium
- **위치**: Phase 2 / T008
- **재현 가능 근거**: ROADMAP line 189 `blockedBy: Task 006, Task 007`. T008 산출물(line 195~210)은 `app/application/content/`, `app/infrastructure/content/` 디렉토리를 사용하는데 그 디렉토리는 T002(line 71~84)에서 생성됨. T006의 `blockedBy: Task 002`(line 147)로 transitive 보장은 되나 명시성 부족.
- **권장 수정안**: T008의 `blockedBy`를 `Task 002, Task 006, Task 007`로 보강.

#### Issue #3 — `app/infrastructure/ratelimit/` 모듈이 PROJECT-STRUCTURE.md 미등록

- **Severity**: Medium
- **위치**: T017 산출물 line 366 `app/infrastructure/ratelimit/kv-rate-limiter.ts`
- **재현 가능 근거**: PROJECT-STRUCTURE.md line 213~238의 `app/infrastructure/` 트리에 `ratelimit/` 모듈 부재. PROJECT-STRUCTURE.md "Cross-cutting Concerns Mapping" (line 549~560)에도 rate-limit 항목 없음. PRD 검증 리포트 Issue #6에서 contact rate-limit 추가 요구가 ROADMAP T017에 반영되었으나 PROJECT-STRUCTURE 갱신 누락.
- **권장 수정안**: T017 PR에 PROJECT-STRUCTURE.md 업데이트 포함하거나, 별도 `docs/update-rate-limiter-module` 브랜치로 선행 PR. 추가 위치:
  - PROJECT-STRUCTURE.md line 213~238 트리에 `├── ratelimit/` 항목
  - line 549~560 Cross-cutting Concerns에 rate-limit 행 추가

#### Issue #4 — Task 014 묶음 크기 (F006+F007+F012)

- **Severity**: Medium (선택적 개선)
- **위치**: Phase 3 / T014 (line 291~305)
- **재현 가능 근거**: Blog Page + Blog Detail + RSS Resource Route + ShareTools + build-rss-feed.service + 테스트 = PR 1개. Blog 관련 파일 5개 + Application service + 테스트.
- **위험**: PR 리뷰 부담 증가, 리뷰 중 부분 회귀 발생 가능.
- **권장 수정안 (선택)**: T014a (Blog Page + Blog Detail) ─→ T014b (RSS Feed). 다만 1인 개발 + RSS가 Blog와 의미상 묶이므로 그대로 유지도 무방. **분할 의무는 아님**.

#### Issue #5 — Task 017 KV namespace 사전 생성 단계 명시 부족

- **Severity**: Medium
- **위치**: T017 산출물 line 366, 371
- **재현 가능 근거**: T017이 KV `RATE_LIMIT_KV` namespace를 사용하지만 검증 항목 line 351~357에 `wrangler kv namespace create` 사전 단계가 빠짐. Workers KV는 dashboard/CLI로 namespace를 먼저 만들고 ID를 wrangler.toml에 주입해야 동작.
- **권장 수정안**: T017 검증에 추가 — `bunx wrangler kv namespace create RATE_LIMIT_KV` 실행 + 반환된 namespace ID를 `wrangler.toml`의 `[[kv_namespaces]]` 블록에 기록 + staging/production 환경별 분리.

### Low Severity

#### Issue #6 — Phase 6 진입 조건의 coverage threshold 수치 미명시

- **Severity**: Low
- **위치**: Phase 6 line 446 + T021 line 455
- **재현 가능 근거**: "전체 F001~F019 자동 테스트 Green" + "`bun run test:coverage` 전체 100% Green + threshold 통과"는 명확하나 threshold 수치(lines/branches/functions %) 미명시.
- **권장 수정안**: T021 검증에 vitest.config.ts coverage threshold 권장 수치 명시 (예: `lines: 80, branches: 75, functions: 80, statements: 80` — 1인 정적 사이트 기준).

#### Issue #7 — Task 016 단축키 cross-platform 검증 명시 부족

- **Severity**: Low
- **위치**: T016 (line 328~344)
- **재현 가능 근거**: AC-F016-1은 ⌘K(macOS) / Ctrl+K(Win/Linux) / `/` 단축키를 모두 요구. T016 검증 line 334은 "⌘K/Ctrl+K/`/` 단축키 토글" 단일 줄. macOS-Windows-Linux 3OS 차이를 vitest mock으로 어떻게 분기할지 미명시.
- **권장 수정안**: T016 검증에 `navigator.platform` 또는 `event.metaKey` vs `event.ctrlKey` mock 분기 명시 + RTL `userEvent.keyboard('{Meta>}k{/Meta}')` / `'{Control>}k{/Control}'` 두 케이스 작성.

---

## Critical Issues (Must Fix Before Development)

**없음.** Blocker 부재.

---

## Final Validation Verdict

### Chain of Thought Summary

1. **Because** ROADMAP은 PRD F001~F019(F015 제외) 18개 Feature와 18개 AC를 100% task에 매핑하고, A001~A012 12개 가정의 해소 게이트를 phase별로 명시했고, Structure-First + Inside-Out (Domain → Application → Infrastructure → Presentation) 순서를 정확히 준수했고, 22 task 모두 Layer/Feature/AC/의존성/검증/산출물/브랜치를 빠짐없이 기재했고 [FACT]...
2. **And** PROJECT-STRUCTURE.md의 4-layer 구조와 모든 산출물 경로가 일치하며, 7개 phase의 DoD가 명령어·테스트·AC 기준으로 측정 가능하고, PR-only workflow + chore/feature/docs 분류가 CLAUDE.md 정책과 일관되며, 의존 그래프에 순환이 없고 병렬 가능 task가 명시되어 있고 [FACT]...
3. **But** Task 010/012/015 3개 task가 "UI 표시 위주"로 자동 테스트 항목이 부족하고 (TDD-First 원칙 약점, High), `app/infrastructure/ratelimit/` 신규 모듈이 PROJECT-STRUCTURE.md에 미등록(Medium), Task 008의 T002 의존성 명시 누락(Medium), Task 017의 KV namespace 사전 생성 단계 미명시(Medium) 같은 보강 가능 항목이 있고 [FACT/INCONSISTENT]...
4. **Therefore** ROADMAP은 **개발 준비 완료** 상태이며 첫 PR(Task 001 `chore/scaffold-bun-rr7-biome`) 작업 시작 가능. 단, **Task 010/012/015의 자동 테스트 항목 보강(Issue #1)은 Phase 3 진입 직전까지 반영**하면 TDD-First 원칙을 완전 충족.

### Validation Verdict

**Selected Verdict**: **CONDITIONAL_PASS** (마이너 이슈 존재하나 첫 PR 시작 가능)

**Verdict Basis**:
1. [FACT] PRD Feature/AC/Assumption 매핑 100% 달성
2. [FACT] Structure-First + Inside-Out + Clean Architecture 4-layer 모두 정확히 준수
3. [FACT] PR-only workflow + chore/feature 분류 CLAUDE.md 정책 일치
4. [FACT] DoD 측정 가능, 모호 표현 없음
5. [INCONSISTENT] Task 010/012/015 자동 테스트 약점 (Issue #1, High)이 유일한 즉각 보강 필요 항목
6. [INFERENCE] 나머지 4개 Medium 이슈는 해당 task 진입 시점까지 반영하면 충분

### Confidence Levels

- **Structure Compliance**: 10/10
- **Task Quality**: 8/10 (다소 큰 묶음 6개, T010/012/015 테스트 약점)
- **PRD/AC Coverage**: 10/10
- **Assumption Resolution**: 10/10
- **PROJECT-STRUCTURE 정합성**: 9/10 (ratelimit 모듈 미등록)
- **Dependency Ordering**: 9/10 (T008→T002 transitive)
- **DoD 명확성**: 10/10
- **Overall Readiness**: **9/10**

### Recommended Actions

**Immediate (Task 001 PR 시작 전)**:
- 없음. **Task 001 (`chore/scaffold-bun-rr7-biome`) 작업 시작 가능**.

**Phase 3 진입 직전 (Task 010 시작 전)**:
1. **Issue #1 해결**: T010/012/015 검증 항목에 RTL component test + route loader test를 명시 (위 "권장 수정안" 참조).

**해당 task PR에 포함**:
2. **Issue #2**: T008 PR에서 `blockedBy: Task 002, Task 006, Task 007`로 ROADMAP 갱신.
3. **Issue #3**: T017 PR에 PROJECT-STRUCTURE.md `ratelimit/` 모듈 추가 docs 변경 동봉 또는 선행 docs PR.
4. **Issue #5**: T017 검증에 `wrangler kv namespace create RATE_LIMIT_KV` 사전 단계 추가.

**Optional**:
5. **Issue #4**: T014 분할 검토 (분할 의무 아님).
6. **Issue #6**: T021 coverage threshold 수치 명시.
7. **Issue #7**: T016 cross-platform 단축키 mock 분기 명시.

---

## One-line Go / No-Go Decision

**GO** — ROADMAP은 100% PRD coverage + Structure-First/Inside-Out/CA 4-layer 준수 + 모든 AC·Assumption 매핑이 완료되어 **첫 PR(Task 001 `chore/scaffold-bun-rr7-biome`) 작업 시작 가능**. T010/012/015의 자동 테스트 항목 보강(Issue #1)은 Phase 3 진입 직전까지 반영하면 TDD-First 원칙 완전 충족.
