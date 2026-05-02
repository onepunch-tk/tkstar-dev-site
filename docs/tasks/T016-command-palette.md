# Task 016 — F016 Cmd+K Command Palette (글로벌 검색 네비)

| Field | Value |
|-------|-------|
| **Task ID** | T016 |
| **Phase** | Phase 4 — Forms / Email |
| **Layer** | Application(`build-search-index.service`) + Presentation(palette UI/hook) |
| **Branch** | `feature/issue-N-command-palette` |
| **Depends on** | T003, T008, T009, T010 |
| **Blocks** | — |
| **PRD Features** | **F016** (Cmd+K Command Palette) |
| **PRD AC** | **AC-F016-1**, **AC-F016-2**, **AC-F016-3**, **AC-F016-4**, **AC-F016-5** |
| **예상 작업 시간** | 1.5d |
| **Status** | Done |

## Goal
사이트의 주 네비게이션 패러다임인 Cmd+K Command Palette를 가동시킨다. ⌘K(macOS) / Ctrl+K(Windows·Linux) / `/` 단축키로 오픈, 토큰 기반 다중 키워드 필터, 키보드/마우스 네비, 빌드 타임 검색 인덱스 lazy fetch까지 모두 AC 통과.

## Context
- **Why**: 검색이 주 네비게이션이라는 사이트 패러다임의 핵심. 기존 메뉴 버튼 대신 palette 1개로 모든 라우트 + project/post slug에 도달.
- **Phase 진입/완료 연결**: T010 Done 이후 (Home의 검색 트리거가 palette를 oepn). T016 Done이면 모든 페이지에서 단축키로 palette 사용 가능.
- **관련 PRD 섹션**: PRD `F016`, AC-F016-1~5
- **관련 PROJECT-STRUCTURE 디렉토리**: `app/application/search/services/build-search-index.service.ts`, `app/presentation/hooks/useCommandPalette.ts`, `app/presentation/components/palette/CommandPalette.tsx`, `public/search-index.json`(빌드 산출물)

## Scope

### In Scope
- `build-search-index.service.ts` — `.velite/{projects,posts}.json`에서 `{slug, title, summary, tags}`만 추출 + 정적 라우트(`/about`, `/projects`, `/blog`, `/contact`, `/legal`) 머지 → `public/search-index.json` 출력 (velite afterBuild 훅 또는 별도 build 스크립트)
- `useCommandPalette` hook — 단축키(⌘K/Ctrl+K/`/`) 토글 + input/textarea 포커스 시 무시 + 토큰 기반 필터 + 키보드 네비
- `<CommandPalette />` UI — 모달 + 그룹 헤더(pages/projects/posts) + lazy fetch 1회 + ↑↓/↵/Esc + 마우스 호버 인덱스 동기화
- `app/root.tsx`에 `<CommandPalette />` 마운트
- 가정 A007 해소 — 단순 includes/score 토큰 검색 채택

### Out of Scope
- FlexSearch/Fuse 도입 (콘텐츠 100+ 시 재검토)

## Acceptance Criteria (PRD AC 인용)
- [ ] **AC-F016-1**: 페이지에 입력 포커스가 없다 → ⌘K(macOS) 또는 Ctrl+K(Win/Linux) 또는 `/` 입력 → palette가 열리고 검색 input에 자동 포커스
- [ ] **AC-F016-2**: input/textarea/contenteditable에 포커스가 있다 → 위 단축키 입력 → palette가 열리지 않고 기본 입력 동작 유지
- [ ] **AC-F016-3**: palette 열림 + 검색어 "rou nav" → 토큰 기반 필터 → "rou"와 "nav"를 모두 포함하는 항목만 그룹 헤더(pages/projects/posts) 별로 표시
- [ ] **AC-F016-4**: 결과 리스트 → ↓ ↑로 네비 + ↵로 진입 + Esc로 닫기 → 키보드만으로 모든 동작 + 마우스 호버 시 선택 인덱스 동기화
- [ ] **AC-F016-5**: 사이트가 처음 로드 → 검색 인덱스 fetch → JSON gzip 100KB 이하 + 본문(body) 미포함 + 세션당 1회만 fetch

### Task 추가 AC (Issue #7 보강)
- [ ] cross-platform 단축키 분기 명시: macOS는 `event.metaKey === true`, Windows·Linux는 `event.ctrlKey === true`, `/`는 공통 — RTL `userEvent.keyboard('{Meta>}k{/Meta}')` / `'{Control>}k{/Control}'` / `'/'` 3 케이스 모두 통과

## Implementation Plan (TDD Cycle)

### Red
- `app/presentation/hooks/__tests__/useCommandPalette.test.ts`
  - **AC-F016-1 macOS**: `userEvent.keyboard('{Meta>}k{/Meta}')` → `isOpen === true`
  - **AC-F016-1 Win/Linux**: `userEvent.keyboard('{Control>}k{/Control}')` → open
  - **AC-F016-1 `/`**: 공통 → open
  - **AC-F016-2**: `<input>` focus 상태에서 위 3 단축키 모두 → palette 미오픈
  - **AC-F016-3**: query="rou nav" → mock index에서 "router navigation" 항목만 포함, "router" 단독 항목은 제외
  - **AC-F016-4**: open 상태에서 ArrowDown → activeIndex 증가, ArrowUp → 감소, Enter → 결과 항목 onClick, Escape → close
- `app/presentation/components/palette/__tests__/CommandPalette.test.tsx`
  - lazy fetch가 첫 open 시 1회만 호출 (AC-F016-5)
  - 그룹 헤더 (pages/projects/posts) 노출
  - 마우스 hover → activeIndex 동기화
- `app/application/search/services/__tests__/build-search-index.service.test.ts`
  - mock projects + posts → 정적 라우트와 머지된 인덱스 객체 반환
  - body 필드 미포함
  - 인덱스 size 측정 (gzip 모방을 위해 raw size로 검증, 100KB 이하)

### Green
- `build-search-index.service.ts` — 순수 함수, 부수효과로 `public/search-index.json` 쓰기
- `velite.config.ts`에 afterBuild 훅 또는 별도 npm script `build:search-index` 추가 → `package.json` `prebuild`에 chain
- `useCommandPalette` hook — `useEffect`로 keydown listener + cross-platform 분기
- `<CommandPalette />` UI — 모달 + lazy fetch (`useEffect` first open) + group header
- `app/root.tsx`에 마운트

### Refactor
- 토큰 검색 함수(`tokenSearch(items, query)`)를 `app/application/search/lib/token-search.ts`로 추출 + unit test 별도

## Files to Create / Modify

### Application — Service
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/search/services/build-search-index.service.ts` | velite output → search-index.json |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/application/search/services/__tests__/build-search-index.service.test.ts` | unit |

### Presentation — Hook
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/useCommandPalette.ts` | T010에서 만든 placeholder를 본체로 채움 |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/hooks/__tests__/useCommandPalette.test.ts` | RTL + 3 OS 분기 |

### Presentation — Component
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/palette/CommandPalette.tsx` | 모달 UI |
| `/Users/tkstart/Desktop/project/tkstar-dev/app/presentation/components/palette/__tests__/CommandPalette.test.tsx` | RTL + lazy fetch mock |

### Root (수정)
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/app/root.tsx` | `<CommandPalette />` 마운트 |

### Build Hook
| Path | Change |
|------|--------|
| `/Users/tkstart/Desktop/project/tkstar-dev/velite.config.ts` | afterBuild 훅에서 `build-search-index.service` 호출 (또는 별도 script) |
| `/Users/tkstart/Desktop/project/tkstar-dev/package.json` | scripts에 `build:search-index: "node scripts/build-search-index.mjs"` (또는 velite afterBuild로 통합) |

### Public Asset (생성)
| Path | Responsibility |
|------|---------------|
| `/Users/tkstart/Desktop/project/tkstar-dev/public/search-index.json` | 빌드 산출물 (gitignore 검토 — 빌드 시 항상 재생성되므로 commit 금지) |

## Verification Steps

### 자동
- `bun run test` — `useCommandPalette` (3 OS), `CommandPalette` (lazy fetch + 그룹 헤더), `build-search-index` 모두 Green
- AC-F016-1~5 매핑 테스트가 명시적으로 통과 (test 이름에 AC ID 포함)
- `bun run build`(또는 velite build) 후 `public/search-index.json` 생성 + size 검증

### 수동
- macOS Chrome에서 ⌘K → palette open
- Windows/Linux 가상 머신 또는 키보드 layout 변경으로 Ctrl+K 검증
- input focus 시 단축키 무시 확인
- "rou nav" 같은 토큰 검색 결과 시각 확인
- 키보드만으로 ↑↓ + Enter + Esc 모두 동작
- 마우스 hover 시 선택 인덱스 동기화

### 측정
- `public/search-index.json` size — gzip(`gzip -c public/search-index.json | wc -c`) ≤ 100KB

## Dependencies
- **Depends on**: T003 (root.tsx 마운트), T008 (`.velite/*.json`), T009 (DI), T010 (Home에서 검색 트리거 placeholder)
- **Blocks**: 없음

## Risks & Mitigations
- **Risk**: 콘텐츠 100+ 도달 시 토큰 검색 성능 저하.
  - **Mitigation**: 가정 A007 — 100+ 도달 시 FlexSearch/Fuse 도입 검토. MVP에서는 단순 검색으로 충분.
- **Risk**: gzip 100KB threshold가 빌드 시점에 깨질 수 있음.
  - **Mitigation**: `build:search-index` script에 size assertion 추가 → CI에서 깨지면 빌드 fail.
- **Risk**: macOS의 Cmd+K가 일부 브라우저(Chrome)에서 검색 바 단축키와 충돌.
  - **Mitigation**: `event.preventDefault()` + Cmd 단축키 가로채기. 충돌 발생 시 사용자 노출은 미미.

## References
- PRD `F016`, AC-F016-1~5
- PROJECT-STRUCTURE.md `D3. F016 검색 인덱스: 빌드 타임 정적 산출물` (line 578~)
- ROADMAP.md `Phase 4` Task 016 (Issue #7 cross-platform 보강 반영), 가정 A007 해소
- [React Router v7 useEffect + keyboard event](https://react.dev/reference/react/useEffect)

## Change History
| Date | Changes | Author |
|------|---------|--------|
| - | - | - |
