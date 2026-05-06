# T023 — Workers 번들 사이즈 PoC + 의존성 합산 측정 보고서

| Field | Value |
|---|---|
| **작성일** | 2026-05-06 |
| **Branch** | `chore/issue-88-cms-bundle-poc` |
| **Issue** | #88 |
| **Task** | [T023](../tasks/T023-workers-bundle-poc.md) |
| **연관 ROADMAP** | Phase 7.1 진입 게이트 |
| **PRD 영향 Features** | F020 (Post 작성/발행), F021 (D1 마이그레이션), F022 (R2 미디어), F023 (Cloudflare Access) |
| **본 PR 결정 범위** | 측정 + 권고안만 — stack 최종 결정은 T024/T027/T030/T033/T034/T035 에서 |

## TL;DR

- **Cloudflare Workers Free 3 MiB gzip 한계 대비 권장 stack 은 PASS** — 합산 약 1.49 MiB, 헤드룸 약 1.51 MiB.
- **단 1개 빨간 깃발: `shiki` runtime** — 단독으로 1.64 MiB gzip 으로 즉시 절반 잠식. 현재 `@shikijs/rehype` 가 velite 안 빌드타임에서만 실행되므로 **그대로 유지** 권고. runtime compile 시도 금지.
- **카테고리별 winner**:
  - MDX runtime compiler: **`marked` (13.59 KiB gzip)**
  - R2 client: **R2 Workers binding (0.12 KiB gzip — 코드 0)** > `aws4fetch` (3.69 KiB) ≫ `@aws-sdk/client-s3` (117.61 KiB)
  - JWT: `jose` (10.71 KiB) — 다른 후보 없음
  - ORM: `drizzle-orm/d1` (30.96 KiB) — 다른 후보 없음
- **Tiptap admin client bundle**: v2 = 90.21 KiB gzip / v3 = 115.39 KiB gzip. Workers 번들과 무관 (client bundle). v3 가 +28% 더 크지만 React 19 호환 + 최신 API. 최종 채택은 T035 한국어 IME PoC 결과로 결정.

## 측정 환경

- 측정일: 2026-05-06
- Branch: `chore/issue-88-cms-bundle-poc` (Phase 6 production 머지 후)
- Wrangler: 4.85.0
- Build: `bunx wrangler deploy --dry-run --outdir <tmp>` 의 출력 .js + .wasm 파일 합산
- Gzip: Node `zlib.gzipSync` (level 9 default)
- 단위: KiB (= 1024 bytes)

## 1. Baseline (현재 Phase 6 production 번들)

`chore/issue-88-cms-bundle-poc` (PoC 코드 추가 전) 에서 `bun run build` + `bunx wrangler deploy --dry-run`.

### Workers Total Upload
| 단위 | Size |
|---|---|
| raw  | 4601.08 KiB (≈ 4.49 MiB) |
| gzip | **1467.10 KiB (≈ 1.43 MiB)** |

### Per-module breakdown (raw)
| Module | Type | Size (KiB) |
|---|---|---|
| `assets/index_bg-Blvrv-U2.wasm` (resvg)   | compiled-wasm | 2420.51 |
| `assets/server.edge-7lFzlrh_.js`           | esm           |  424.52 |
| `assets/server-build-DmxqE0eu.js`          | esm           |  246.34 |
| `assets/errors-CPNwJYJk.js`                | esm           |  207.69 |
| `assets/yoga-sbSbVeWy.wasm`                | compiled-wasm |   70.05 |
| `assets/react-V0x5gfW_.js`                 | esm           |   15.24 |
| `assets/rolldown-runtime-BmBEPrd9.js`      | esm           |    1.63 |
| 7-module subtotal                          |               | 3385.99 |
| (build/client static assets)               |               |  ~1215  |

### Free 3 MiB gzip 한계 대비 헤드룸
| 항목 | gzip (KiB) |
|---|---|
| 한계 (Free)               | 3072.00 |
| 현재 baseline             | 1467.10 |
| **헤드룸**                | **1604.90** |

## 2. Workers SSR 번들 후보 측정

각 후보 단독 entry (`scripts/poc-bundle/entries/<id>.ts`) → `wrangler deploy --dry-run --outdir` 의 .js + .wasm 합산. baseline = 빈 fetch handler.

| Candidate | raw (KiB) | gzip (KiB) | Δ raw vs baseline | Δ gzip vs baseline |
|---|---|---|---|---|
| baseline                       |    0.18 |    0.15 | — | — |
| **MDX compiler — marked**      |   53.89 |   13.74 |  +53.71 |  **+13.59** |
| MDX compiler — micromark       |  191.57 |   38.70 | +191.39 |  +38.55 |
| MDX compiler — `@mdx-js/mdx`   |  999.87 |  203.85 | +999.69 | +203.70 |
| **shiki (runtime, github-dark)**| 9731.65 | 1681.94 |+9731.47 |**+1681.79** |
| **jose (Access JWT)**          |   47.76 |   10.86 |  +47.58 |  **+10.71** |
| R2 — `aws4fetch`               |   12.02 |    3.84 |  +11.84 |   +3.69 |
| **R2 — Workers binding only**  |    0.42 |    0.27 |   +0.24 |   **+0.12** |
| R2 — `@aws-sdk/client-s3`      |  553.55 |  117.76 | +553.37 | +117.61 |
| **drizzle-orm/d1**             |  158.28 |   31.10 | +158.10 |  **+30.96** |

### 카테고리 winner
- **MDX runtime compiler**: `marked` 압도. micromark 대비 1/3, `@mdx-js/mdx` 대비 1/15. `@mdx-js/mdx` 는 MDX 컴포넌트 임베딩이 진짜 필요할 때만 — Post 본문은 plain markdown 이므로 marked 충분.
- **R2 client**: Workers binding 가 사실상 무료 (12 byte gzip). `aws4fetch` 는 binding 으로 안 풀리는 시나리오 (presigned URL 등) 백업. `@aws-sdk/client-s3` 는 multipart upload / streaming 이 진짜 필요할 때만 (현재 admin Post 이미지 업로드 시나리오에는 과잉).
- **shiki (runtime)**: 압도적으로 큰 단일 후보. 단 한 번도 runtime 에서 highlight 할 일 없음 — 현재 `@shikijs/rehype` 가 velite 안 빌드타임에서만 실행. 본 측정의 의의는 "runtime 으로 옮기면 즉시 한계 초과" 의 **negative result** 확인.

## 3. Admin client bundle (Tiptap) 측정

dummy admin route `app/presentation/routes/_admin.poc.tsx` (`useEditor + StarterKit + EditorContent` 만) 추가 후 `bun run build` 의 `build/client/assets/_admin.poc-*.js` chunk 측정.

| Tiptap stack | raw (KiB) | gzip (KiB) | markdown serializer |
|---|---|---|---|
| **v2** | 300.79 | **90.21**  | `tiptap-markdown@0.9.0` (v2 전용 wrapper) |
| **v3** | 367.00 | **115.39** | `prosemirror-markdown@1.13.4` (저수준 — admin 구현 시 wrapper 필요) |

### Notes
- Admin chunk 는 Cloudflare Workers 번들 한계와 **무관** (client bundle, 사용자 브라우저 다운로드). 단 admin 본인이 모바일/외부에서 첫 로드 시 부담 측면에서만 의미.
- v3 = +25.18 KiB gzip (+28%). v2 LTS 안정 vs v3 React 19 호환·tree-shaking 강화 trade-off.
- 최종 결정은 T035 의 **한국어 IME 동작 PoC** 결과로 — 본 task 범위 밖.

## 4. 권장 stack 합산 시뮬레이션

Phase 7.1~7.4 도입 예정 의존성 모두를 baseline 위에 쌓아 한계 대비 검증.

### Stack A — 권장 (가장 가벼운 조합)
```
baseline                                      1467.10 KiB
+ drizzle-orm/d1                                30.96 KiB
+ marked (MDX runtime compiler)                 13.59 KiB
+ jose (Access JWT)                             10.71 KiB
+ R2 binding (no install)                        0.12 KiB
─────────────────────────────────────────────────────────
Total gzip                                    1522.48 KiB  (≈ 1.487 MiB)
한계 (3 MiB)                                  3072.00 KiB
헤드룸                                        1549.52 KiB  (≈ 1.513 MiB)
```
→ **PASS** (한계의 49.6% 만 사용, 1.51 MiB 헤드룸).

### Stack B — 보수적 (signing 필요 시 aws4fetch 대체)
```
baseline + drizzle + marked + jose + aws4fetch = 1526.05 KiB  (≈ 1.490 MiB)
헤드룸                                            1545.95 KiB  (≈ 1.510 MiB)
```
→ **PASS**.

### Stack C — Worst case (heavy MDX + heavy R2 모두 채택)
```
baseline                                      1467.10 KiB
+ drizzle-orm/d1                                30.96 KiB
+ @mdx-js/mdx (MDX 컴포넌트 임베딩)            203.70 KiB
+ jose                                          10.71 KiB
+ @aws-sdk/client-s3 (multipart/streaming)     117.61 KiB
─────────────────────────────────────────────────────────
Total gzip                                    1830.08 KiB  (≈ 1.787 MiB)
헤드룸                                        1241.92 KiB  (≈ 1.213 MiB)
```
→ **PASS** (한계의 59.6% 사용).

### FAIL 시나리오 — shiki runtime 추가 시
```
Stack C + shiki runtime                       3511.87 KiB  (≈ 3.43 MiB) ← 초과
```
→ **FAIL**. shiki 는 절대 runtime 으로 옮기지 말 것.

## 5. 권고안

| 카테고리 | 권고 | 근거 |
|---|---|---|
| **MDX runtime compiler (T027)** | `marked` 1순위, micromark 2순위 | marked = 13.59 KiB gzip 압도. Post 본문은 plain markdown — `@mdx-js/mdx` 의 컴포넌트 임베딩 기능 불필요 |
| **R2 client (T033/T034)** | R2 Workers binding 1순위, `aws4fetch` 2순위 | binding = 0.12 KiB. signing 필요 시 aws4fetch (3.69 KiB). aws-sdk 는 multipart/streaming 이 진짜 필요할 때만 |
| **JWT (T030)** | `jose` 채택 | 10.71 KiB, 합리. 다른 후보 검토 불필요 |
| **ORM (T024)** | `drizzle-orm/d1` 채택 | 30.96 KiB, edge SQLite (D1) first-class support. 합리 |
| **shiki** | **빌드타임 사용 그대로 유지** (`@shikijs/rehype` in velite) | runtime 으로 옮기면 즉시 +1.64 MiB → FAIL 위험. 빌드타임은 client/Workers 번들 모두 영향 0 |
| **Tiptap (T035)** | 본 PR 결정 X — T035 한국어 IME PoC 결과로 | v2/v3 사이즈 차 +28% 는 trade-off 결정 기준 아님. IME / API 안정성이 주요 결정 인자 |

### Workers Free 3 MiB 한계 vs Paid 트랙
- **현재 권장 stack 으로 PASS** — Workers Free 유지 OK.
- 단 향후 OG image 의 폰트 임베딩 추가, 다국어 wasm 추가 등으로 baseline 자체가 ≥ 2.5 MiB 로 늘어나면 (a) `@shikijs/rehype` 빌드타임 산출물 size 점검 / (b) resvg.wasm 의 lite 변형 검토 / (c) Workers Paid 전환 검토.

## 6. 본 PR 의 변경 범위

- **머지 대상 (working tree 에 남는 파일)**:
  - `docs/tasks/T023-workers-bundle-poc.md` (T023 task 정의)
  - `docs/reports/cms-bundle-poc-2026-05-06.md` (본 보고서)
  - `docs/ROADMAP.md` (T023 체크박스 [x] + 본 보고서 링크)
- **PoC commit revert 대상 (history 에는 추가 + revert 흔적, working tree 에는 0)**:
  - `package.json` / `bun.lock` 의 임시 deps
  - `scripts/poc-bundle/**` 측정 인프라
  - `app/presentation/routes/_admin.poc.tsx` Tiptap dummy

## 7. Reproducibility

본 PR 머지 후 measurement script 는 `git revert` 되어 working tree 에 남지 않는다. 재현 시:

```bash
git checkout chore/issue-88-cms-bundle-poc~N  # PoC commit 시점
node scripts/poc-bundle/measure.mjs
```

또는 본 보고서의 매트릭스 행을 그대로 사용 (deps 버전 고정 — Section 8 의 lockfile 스냅샷 참조).

> **Squash merge 후 한계**: 본 PR 은 squash merge 정책 (`gh pr merge --squash --delete-branch`) — merge 이후에는 PoC commit + revert commit 이 단일 squash commit 에 흡수되고 `chore/issue-88-cms-bundle-poc` 브랜치도 삭제된다. 즉 squash merge 이후의 재측정은 위의 `git checkout` 절차로는 불가능하며, 본 보고서의 매트릭스 + Section 8 deps 버전 스냅샷을 기준으로 `scripts/poc-bundle/` 측정 인프라를 재작성해야 한다.

## 8. 측정 시점 deps 버전

| Package | Version |
|---|---|
| wrangler | 4.85.0 |
| marked | 18.0.3 |
| micromark | 4.0.2 |
| @mdx-js/mdx | 3.1.1 |
| shiki | 4.0.2 (devDependency — 빌드타임 사용. 본 PoC runtime 측정은 langs=`['typescript','javascript','shell']` + theme=`github-dark` 기준) |
| jose | 6.2.3 |
| aws4fetch | 1.0.20 |
| @aws-sdk/client-s3 | 3.1043.0 |
| drizzle-orm | 0.45.2 |
| @tiptap/core (v2) | 2.27.2 |
| tiptap-markdown | 0.9.0 |
| @tiptap/core (v3) | 3.22.5 |
| prosemirror-markdown | 1.13.4 |

## 9. 후속 task 영향

- **T024 (D1/Drizzle)**: `drizzle-orm@0.45.2` 채택 OK — 30.96 KiB gzip 부담 정당화
- **T027 (MDX runtime compiler)**: `marked` 채택 권고
- **T030 (jose)**: `jose@6` 채택 OK
- **T033 (R2 client)**: R2 Workers binding 1순위, aws4fetch 2순위 선정. aws-sdk 후보 탈락 (단 multipart/streaming 진짜 필요할 때 재논의)
- **T034 (uploadMedia use case)**: R2 binding 기반 구현 — `MEDIA_BUCKET.put` 직접 호출
- **T035 (Tiptap 한국어 IME PoC)**: v2/v3 모두 한계 안에서 선택 가능 — 사이즈 X, IME 동작이 결정 인자

## 10. 한계 / 가정

- 본 측정은 Workers SSR bundle = `wrangler dry-run outdir 의 .js + .wasm 합산` 정의에 의존. 실제 Cloudflare Worker upload 한계는 wrangler `Total Upload` 와 동일하므로 측정 정의는 정합.
- 각 후보 측정은 dummy fetch handler 1 개 + import 만 — 실제 use case 의 호출 패턴이 추가 코드 (예: drizzle 의 schema 정의) 를 요구하면 실제 합산은 본 보고서 + α (대개 1~10 KiB).
- shiki 의 runtime 측정은 `createHighlighter({ themes: ['github-dark'], langs: ['typescript', 'javascript', 'shell'] })` 기준 — langs 늘리면 더 커진다.
- gzip 은 정적 압축 (zlib level 9). Cloudflare Edge 의 brotli 압축은 보통 gzip 대비 -10~-15% 더 작음 — 본 보고서 수치는 보수적 (실제는 더 여유).
