# Task 011 — About Page + F003 PDF 인쇄 스타일

| Field | Value |
|-------|-------|
| **Task ID** | T011 |
| **Phase** | Phase 3 — Core Pages UI |
| **Layer** | Presentation |
| **Branch** | `feature/issue-N-about-page-print` |
| **Depends on** | T005, T008, T009 |
| **Blocks** | — |
| **PRD Features** | **F002** (About), **F003** (PDF 저장) |
| **PRD AC** | **AC-F003-1**, **AC-F003-2**, **AC-F003-3** |
| **예상 작업 시간** | 1.5d |
| **Status** | Completed |

## Goal
About 페이지를 사이트 자체 이력서 역할로 완성하고, `[⎙ PDF]` 버튼 클릭 시 `window.print()`을 호출하여 `@media print` 전용 스타일로 깨끗한 PDF가 저장되게 한다 (AC-F003-1/2/3 모두 통과).

## Context
- **Why**: B2B 청중의 1차 검토 자료. PDF 트리를 별도로 두지 않고 CSS print로 완전히 대체. A001 가정 해소 시점.
- **Phase 진입/완료 연결**: T005(Chrome) + T008(read-side) + T009(DI) Done 후. 다른 task를 막지 않음.
- **관련 PRD 섹션**: PRD `Page-by-Page — About Page`, `F002`, `F003`, AC-F003-1/2/3
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/presentation/routes/about.tsx`, `app/presentation/components/about/`, `app/presentation/lib/print.ts`, `app/app.css` (`@media print` 블록)

## Scope

### In Scope
- About 페이지 콘텐츠 — 헤더(이름 + 포지셔닝 + 이메일 + `[⎙ PDF]` 버튼) / 기술스택 카드 3개(frontend / edge·backend / quality) / 경력(역순) / 학력 / 수상 카드 2개
- `[⎙ PDF]` 버튼 → `triggerPrint()` 래퍼 호출 (테스트 가능한 분리)
- `@media print` 블록 — Topbar/Footer/검색트리거/토글 `display: none`, `@page { size: A4; margin: 0 }`, `print-color-adjust: exact`, h2 `break-after: avoid`
- Snapshot 또는 DOM 구조 assertion으로 print-only 스타일 적용 검증
- A001 해소 — 자격증은 frontmatter optional 필드 자리만 (현재는 데이터 0개)

### Out of Scope
- 자격증 데이터 추가 (운영 task)
- 페이지별 meta export — T019
- About에서 직접 Project Detail 링크 — T013에서 prev/next 패턴 확정 후 검토

## Acceptance Criteria (PRD AC 인용)
- [x] **AC-F003-1**: About 페이지에서 사용자가 `[⎙ PDF]` 버튼을 클릭한다 → `window.print()` 다이얼로그가 열린다 → `@page { size: A4; margin: 0 }` 적용 + Topbar/Footer/검색트리거/토글이 `display: none`으로 시각적으로 숨겨짐
- [x] **AC-F003-2**: 본문에 OKLCH 색상이 포함된 섹션이 존재 → 인쇄 미리보기를 본다 → `print-color-adjust: exact`가 적용되어 화면과 동일한 색이 유지됨 (또는 sRGB로 자동 변환되어도 가독성 손상 없음)
- [x] **AC-F003-3**: 인쇄 미리보기가 열린 상태 → 페이지 경계에 도달 → 섹션 헤딩(`h2`)이 페이지 하단에 고립되지 않음 (`break-after: avoid` 또는 `page-break-inside: avoid`)

### Task 추가 AC
- [x] About 페이지에 헤더 / 기술스택 3 카드 / 경력 / 학력 / 수상 5 영역이 모두 렌더
- [x] `triggerPrint()`가 unit test에서 `window.print` mock을 1회 호출

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/lib/__tests__/print.test.ts`
  - `triggerPrint()` 호출 시 `window.print` mock이 1회 호출됨 (jsdom)
- `app/presentation/components/about/__tests__/AboutHeader.test.tsx`
  - `[⎙ PDF]` 버튼 클릭 시 `triggerPrint`가 호출됨 (mock injection)
- `app/presentation/routes/__tests__/about.test.tsx`
  - 5 영역(헤더/스택/경력/학력/수상) 모두 렌더
  - DOM에 `@media print` 적용 시 hide 대상이 되는 elements들이 정확한 `data-print-hidden` 또는 className 보유 (snapshot 검증)
- `app/presentation/components/about/__tests__/print-styles.test.ts` (선택)
  - `@media print` 적용된 computed style이 jsdom에서 시뮬레이션 가능한 부분만 검증 (jsdom은 print media 일부만 지원하므로 className/data attr 기반 검증으로 대체)

### Green
- `app/presentation/routes/about.tsx` — 5 영역 컴포넌트 조립
- `app/presentation/components/about/AboutHeader.tsx` — 이름 + 포지셔닝 + 이메일 + `[⎙ PDF]` 버튼
- `app/presentation/components/about/StackCards.tsx` — 3 카드 (frontend / edge·backend / quality)
- `app/presentation/components/about/CareerTimeline.tsx`
- `app/presentation/components/about/EducationCard.tsx`
- `app/presentation/components/about/AwardsCard.tsx`
- `app/presentation/lib/print.ts` — `export function triggerPrint() { window.print(); }`
- `app/app.css`에 `@media print` 블록:
  ```css
  @media print {
    @page { size: A4; margin: 0; }
    [data-chrome="topbar"], [data-chrome="footer"], [data-chrome="search-trigger"], [data-chrome="theme-toggle"] { display: none !important; }
    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    h2 { break-after: avoid; page-break-after: avoid; }
  }
  ```

### Refactor
- 5 영역 데이터를 `app/presentation/lib/about-data.ts`로 추출 (자격증 추가 시 단일 진입점)

## Files to Create / Modify

### Presentation — Route
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/about.tsx` | 5 영역 컴포넌트 조립 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/routes/__tests__/about.test.tsx` | RTL + AC-F003 매핑 |

### Presentation — Components
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/about/AboutHeader.tsx` | 헤더 + PDF 버튼 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/about/StackCards.tsx` | 3 카드 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/about/CareerTimeline.tsx` | 역순 경력 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/about/EducationCard.tsx` | 학력 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/about/AwardsCard.tsx` | 수상 (자격증은 future optional) |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/about/__tests__/AboutHeader.test.tsx` | RTL |

### Presentation — Lib
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/print.ts` | `triggerPrint()` |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/__tests__/print.test.ts` | window.print mock |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/lib/about-data.ts` | 정적 about 데이터 (Refactor 단계) |

### CSS (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/app.css` | `@media print` 블록 추가. T005에서 `[data-chrome]` data attribute를 chrome 컴포넌트들에 미리 부착했어야 print에서 hide 대상이 됨 — T011 PR에서 chrome 컴포넌트도 `data-chrome` 추가 |

## Verification Steps

### 자동
- `bun run test` — print/AboutHeader/about route 테스트 모두 Green
- AC-F003-1/2/3 매핑 테스트가 명시적으로 통과 (each test 이름에 AC ID 포함)

### 수동
- Chrome 인쇄 미리보기 → Topbar/Footer/검색트리거/토글 미노출, A4 size, 색상 유지, h2 페이지 하단 고립 부재
- Safari 인쇄 미리보기 추가 검증 (선택)
- 다크모드에서 인쇄 → 색상 적절하게 변환 (light scheme 자동 fallback이 디자인 의도와 맞는지 확인; PRD는 `print-color-adjust: exact`로 화면과 동일 색을 유도)

### 측정
- 없음

## Dependencies
- **Depends on**: T005 (chrome data attribute), T008 (Page-by-Page 데이터 — 정적이지만 Phase 2 후 시작), T009 (DI)
- **Blocks**: 없음

## Risks & Mitigations
- **Risk**: jsdom에서 `@media print` 적용 시 computed style이 정확히 시뮬레이션되지 않음.
  - **Mitigation**: print 스타일 적용을 `data-print-hidden` className 기반으로 검증 + 실제 화면 검증은 수동(Chrome 인쇄 미리보기). AC-F003-1/2/3은 자동 + 수동 조합으로 매핑.
- **Risk**: `print-color-adjust: exact`가 일부 브라우저에서 무시됨.
  - **Mitigation**: `-webkit-print-color-adjust` prefixed 함께 작성. AC-F003-2는 "또는 sRGB로 자동 변환되어도 가독성 손상이 없다"로 fallback 허용.

## References
- PRD `Page-by-Page — About Page`, `F002`, `F003`, AC-F003-1/2/3
- ROADMAP.md `Phase 3` Task 011, 가정 A001 해소
- [print-color-adjust MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/print-color-adjust)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| 2026-04-30 | T011 완료 — About 페이지 5 영역(헤더/스택/경력/학력/수상) + `triggerPrint` wrapper + chrome `data-chrome` attribute + `@media print` 블록(A4/light scheme 강제/chrome hide/h2 break-after). 자격증은 A001 후속 PR 셋업으로 type + 빈 배열만. AC-F003-1/2/3 자동(133/133) + 수동 인쇄 미리보기 검증 완료. | TaekyungHa |
| 2026-04-30 | 후속 확장 결정 — A013 신규 가정 등록. 경력 timeline을 회사 재직 + solo 프로젝트 통합으로 확장 예정 (`type: "company" \| "solo"` discriminated union). solo entry는 velite project frontmatter 끌어오기. T011은 Completed 유지, 별도 운영 PR로 진행. | TaekyungHa |
