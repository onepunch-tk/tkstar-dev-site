# ROADMAP & Task File Rendered Output Templates

These are produced by `generate_roadmap.py`. The agent does not write them by hand — they are reference only.

## Task File Template

```markdown
# T013 — feature: Place 모듈 (스키마 + tRPC place.*)

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `feature/`
> **선행**: [T007](T007-database-module.md)
> **후행**: [T014](T014-...), [T015](T015-...)

---

## 목적
…2-4문장…

## PRD Feature ID 매핑
- F-FREE-008
- F-PRO-007

## 의존
- **선행 (blockedBy)**: [T007](T007-database-module.md)
- **후행 (blocks)**: [T014](T014-...), [T015](T015-...)

## 입력·출력 계약
…자유 양식 한국어…

## 시퀀스
\`\`\`
1. client → server: 요청
2. server: 입력 검증
…
\`\`\`

## 엣지 케이스 + 구현
…가장 상세한 섹션…

## DoD
- [ ] …
- [x] …

## Open Questions
- [ ] `[NEEDS USER]` …. 기본 제안: ….
또는: `모두 해결됨 (No open questions)`

## Change History
| 날짜 | 변경 | 작성자 |
|------|------|--------|
| - | - | - |
```

## ROADMAP Template

```markdown
# {project} Development Roadmap

> **생성일**: YYYY-MM-DD | **문서 버전**: 0.1 | **PRD**: docs/PRD.md | **작성자**: roadmap-generator

{summary}

## Overview
- {core feature 1}
- {core feature 2}
- …

## Phase 진행 현황
| Phase | 제목 | 상태 | Tasks |
| --- | --- | --- | --- |
| P1 | … | ✅ Completed | T001, T002 |

## P1: … ✅
{phase description}

- [x] **T001 — feature: …** ✅
  - **blockedBy**: none
  - **blocks**: T002
  - **Must Read**: [T001-….md](/docs/tasks/T001-….md)
  - **PRD Features**: F001
  - {purpose}

- [ ] **T002 — feature: …** — Priority
  …

## Dependency Graph
\`\`\`mermaid
graph TD
  T001["T001: …"]
  T002["T002: …"]
  T001 --> T002
\`\`\`

## PRD Feature Coverage
| Feature ID | 기능명 | 담당 Tasks |
| --- | --- | --- |
| F001 | … | T001, T006 |
```
