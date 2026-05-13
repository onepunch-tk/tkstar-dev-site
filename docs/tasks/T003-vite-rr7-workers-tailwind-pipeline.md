# T003 — chore: Vite + React Router v7 Framework + Cloudflare Workers + Tailwind v4 빌드 파이프라인

> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)
> **branch type**: `chore/`
> **선행**: [T001](T001-scaffold-bun-rr7-biome.md)
> **후행**: [T004](T004-route-skeleton.md), [T005](T005-theme-tokens.md), [T016](T016-command-palette.md)

---

## 목적

Vite + React Router v7 Framework + Cloudflare Workers + Tailwind v4 + Vitest coverage 파이프라인을 가동시켜, SSR 첫 응답·dev 서버·테스트 커버리지 리포트가 모두 무오류로 동작하는 상태를 만든다. 이후 모든 페이지·라우트·테스트가 이 파이프라인 위에서 동작.

## PRD Feature ID 매핑

_해당 없음_

## 입력·출력 계약

**입력**: T001 셸 + T002 골격. **출력**: `vite.config.ts`, `react-router.config.ts`, `wrangler.toml`, `workers/app.ts`, `app/{root,routes,entry.server,entry.client,app.css,env.d.ts}` 최소 동작본, `app/presentation/routes/_index.tsx` placeholder, `vitest.config.ts` coverage threshold. **검증**: `bun run dev` Vite dev 부팅, `bunx wrangler dev` Workers dev 부팅, 빈 root SSR 200, `bun run test:coverage` 빈 상태 리포트 생성 + threshold 통과.

## 시퀀스

```
1. vite.config.ts — `@cloudflare/vite-plugin 1.33.2` + `@tailwindcss/vite 4.2.2` + `@vitejs/plugin-react 6.0.1` 활성
2. react-router.config.ts — `ssr: true`
3. wrangler.toml — `name = tkstar-dev`, `main = workers/app.ts`, `compatibility_date = 2026-04-01`, `[assets] binding=ASSETS directory=./public`
4. workers/app.ts — fetch handler → React Router request handler 스텁
5. app/{root.tsx, routes.ts, entry.server.tsx, entry.client.tsx, app.css, env.d.ts} 최소 동작본 작성
6. app/routes.ts — `flatRoutes({ rootDirectory: 'presentation/routes' })`
7. app/presentation/routes/_index.tsx — 빈 placeholder
8. vitest.config.ts — coverage threshold `{ lines: 80, branches: 75, functions: 80, statements: 80 }` + 제외 경로 명시
```

## 엣지 케이스 + 구현

## Implementation Notes

- 1인 정적 사이트 기준 coverage threshold `lines:80, branches:75, functions:80, statements:80` 채택. T021 진입 시 동일 수치로 재확인.
- coverage 제외 경로: `**/*.config.*`, `**/__tests__/**`, `**/*.d.ts`, `workers/app.ts` (SSR entry), `app/entry.{server,client}.tsx`.
- `compatibility_date = 2026-04-01` 은 wrangler types 발행 시점 기준 — nodejs_compat 활성은 T023 PoC 시점에 추가됨.
- Tailwind v4 는 `@tailwindcss/vite` plugin 으로 동작 — `app/app.css` 의 `@theme` block 은 T005 에서 채워짐.
- `flatRoutes({ rootDirectory: 'presentation/routes' })` 채택으로 라우트 파일을 CA Presentation layer 안에 그대로 둠.

## Change History from previous body

- 본 task 가 후속 T004 (라우트 스켈레톤) / T005 (theme tokens) / T016 (Cmd+K palette) 의 진입 조건. 
- PR #14 머지로 첫 SSR + dev 서버 가동.
- chore branch (no Issue) PR: `chore/vite-rr7-workers-tailwind-pipeline`.

## DoD

- [x] `bun run dev` Vite dev server 부팅 성공
- [x] `bunx wrangler dev` Workers dev 부팅 성공
- [x] 빈 root 페이지가 SSR 200 응답
- [x] `bun run test:coverage` 가 빈 상태에서도 Vitest coverage 리포트 생성
- [x] coverage threshold `{ lines: 80, branches: 75, functions: 80, statements: 80 }` 설정 + 통과
- [x] wrangler.toml 에 ASSETS binding 정의됨
- [x] vite.config.ts 에 `@cloudflare/vite-plugin` + `@tailwindcss/vite` + react plugin 활성

## Open Questions

모두 해결됨 (No open questions)

## Change History

| 날짜 | 변경 | 작성자 |
| --- | --- | --- |
| 2026-04-28 | T003 머지 — Vite + RR7 + Workers + Tailwind v4 파이프라인 (PR #14, branch `chore/vite-rr7-workers-tailwind-pipeline`) | TaekyungHa |
