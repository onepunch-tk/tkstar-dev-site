# T001 — chore: 프로젝트 스캐폴딩 + Bun + TypeScript + Biome 셋업

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: none
> **후행**: [T002](T002-ca-4layer-skeleton.md), [T003](T003-vite-rr7-workers-tailwind-pipeline.md)

---

## 목적

빈 git 저장소에 Bun + TypeScript + Biome 기반의 빈 프로젝트 셸을 깔아, 이후 모든 phase 의 진입 조건인 `bun --version` / `bun run typecheck` / `bun run lint` / `bun run format` 을 무오류 통과시킨다. 모든 후속 task 는 이 셸 위에서 동작하므로 toolchain 일관성 확보가 본 task 의 단일 책임이다.

## PRD Feature ID 매핑

_해당 없음_

## 입력·출력 계약

**입력**: 빈 git 저장소. **출력**: `package.json` + `tsconfig.json` + `tsconfig.app.json` + `biome.json` + `.gitignore` 보강 + `bun.lock` 생성. **검증 명령**: `bun --version` → 1.x, `bun install`, `bun run typecheck`, `bun run lint`, `bun run format` 전부 무오류.

## 시퀀스

```
1. git init 직후 빈 디렉토리에서 `bun init` 으로 package.json 골격 생성
2. react 19.2.4 / react-router 7.14.0 / typescript 5.9.3 / biome 2.4.13 dependency 등록
3. tsconfig.json + tsconfig.app.json 작성 — strict true, path alias `~/*` → `./app/*`
4. biome.json 작성 — Biome 2.4.13 lint + format rule set
5. .gitignore 5개 항목 추가 — `.velite/`, `.react-router/`, `node_modules/`, `dist/`, `.wrangler/`
6. scripts: `typecheck` / `lint` / `format` / `test` placeholder 등록
7. 검증 명령 5종 모두 통과 확인 후 PR open
```

## 엣지 케이스 + 구현

## Implementation Notes

- chore branch policy: `chore/*` 는 CLAUDE.md 정책상 Plan/TDD phase 가 면제되며 PR 리뷰가 안전망. 단 AC 는 모두 명령어 수준에서 검증 가능해야 함.
- bun 버전 핀: 1.x 메이저 — minor 는 dev 시 자유.
- biome 2.4.13 은 1.x 와 호환성 깨짐이 일부 있음 — `biome.json` schema URL 도 2.x 로 고정.
- typecheck 시 빈 프로젝트라도 tsc 가 path alias 인식하는지 확인. include 미설정으로 인한 silent pass 회피.
- React 19.2.4 + react-router 7.14.0 조합은 후속 T003 vite plugin 호환성을 위한 명시적 pin.

## Change History from previous body

- chore branch (no Issue) PR: `chore/scaffold-bun-rr7-biome`.
- T002/T003 가 본 task 산출물의 path alias 와 .gitignore 항목에 의존하므로 본 task 가 우선.

## DoD

- [x] `bun --version` 이 1.x 출력
- [x] `bun install` 후 `bun.lock` 생성됨
- [x] `bun run typecheck` 무오류 통과 (빈 프로젝트라도 tsc 가 path alias 인식)
- [x] `bun run lint` 가 Biome 룰로 동작 (`No files to check.` 도 OK)
- [x] `bun run format` 이 Biome formatter 호출
- [x] `.gitignore` 에 5개 항목(`.velite/`, `.react-router/`, `node_modules/`, `dist/`, `.wrangler/`) 모두 존재

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | T001 초기 머지 — Bun + TS + Biome 셋업 (branch `chore/scaffold-bun-rr7-biome`) | TaekyungHa |
