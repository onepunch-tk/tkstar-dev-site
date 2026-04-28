# PRD Technical Verification Result: tkstarDev (`tkstar.dev`)

> **Validation Date**: 2026-04-28
> **Validated Document**: `docs/PRD.md` (35,721 bytes)
> **Cross-checked Against**: `docs/PROJECT-STRUCTURE.md`, `package.json`, `CLAUDE.md`, `docs/design-system/`
> **Platform**: Web (React Router v7 Framework mode, SSR on Cloudflare Workers)
> **Scale**: Small (solo developer, no auth/RBAC, single locale)
> **Validator**: prd-validator

---

## Chain of Thought Verification Summary

### Reasoning Path
1. **Initial Observation** — Static personal-brand site, DB-less, MDX-driven, Cloudflare Workers SSR.
2. **Hypothesis** — Tech stack is internally consistent and the dominant risk is the gap between the design source (React 18 + babel-standalone) and the production target (React Router v7 + React 19 ESM), plus a *cross-document* mismatch between PRD/PROJECT-STRUCTURE (web) and `CLAUDE.md` (Expo/React Native).
3. **Step-by-step Verification** — Versions resolved against `package.json`; external service claims (Resend, Turnstile, Satori, velite, Tailwind v4, RR v7) cross-checked.
4. **Logical Connection** — Feature -> Page -> Menu cross-references in `PRD.md` reconciled with the `app/presentation/routes/` layout in `PROJECT-STRUCTURE.md`.
5. **Comprehensive Judgment** — Conditional Pass with one Blocker (CLAUDE.md misalignment) and several High/Medium issues to harden before implementation.

### Technical Confidence Distribution
- **High Confidence** [FACT]: ~70% — versions match `package.json`; external services (Resend free tier, Turnstile siteverify, Satori standalone, velite Zod) verified against official docs.
- **Medium Confidence** [INFERENCE]: ~25% — architecture-level claims about CA layering, on-this-page TOC, search index strategy.
- **Low Confidence** [UNCERTAIN]: ~5% — assumptions explicitly tagged in PRD (rehype-toc choice, asset fetch path, cert-issuance channel, Bing later) — acceptable.

### Key Findings
- **Aligned with Expectations**: package.json versions match PRD's "Tech Stack (Latest Versions)" exactly (RR 7.14.0, React 19.2.4, TypeScript 5.9.3, Tailwind 4.2.2, Vite 8.0.3, Vitest 4.1.5, Biome 2.4.13, wrangler 4.85.0, @cloudflare/vite-plugin 1.33.2, isbot 5.1.36).
- **Different from Expectations** (Blocker): `CLAUDE.md` describes an **Expo/React Native** project (Metro, `expo run:ios`, `react-test-renderer`, `jest.config.js`, `babel.config.js`, `setupFilesAfterEnv`). The actual codebase is a **web-only React Router v7 + Cloudflare Workers** project (Vite, Vitest). All native/Expo guidance in `CLAUDE.md` is dead instruction for this PRD.
- **Different from Expectations** (High): PRD does not define a Non-Functional Requirements (NFR) section — no measurable targets for performance, accessibility, security, or content limits, despite the design referencing `backdrop-filter` blur, `oklch()`, `color-mix()`, and a print stylesheet that all carry browser-support and contrast obligations.
- **Additional Considerations**: F003 PDF export ("Save as PDF" via `window.print()`) is brand-specific (different rendering between Chrome/Safari/Firefox print engines) and lacks an acceptance criterion for what a "valid PDF" looks like.

---

## Step-by-Step Verification Results

### Step 0 - Platform Detection
- Signals (page-by-page, menu, SSR, React Router v7, ⌘K palette) clearly identify **Web**.
- Scale signals (single user, no auth, sequential `F001..F019` IDs, single brand) identify **Small**.
- Multi-platform signals: **none** — `CLAUDE.md`'s Expo references are inconsistent with the rest of the project (see Issue #1).

### Step 1 - Initial Analysis
**Project type**: Static personal-brand site delivered via Cloudflare Workers SSR.
**Main tech stack** (verified against `/Users/tkstart/Desktop/project/tkstar-dev/package.json`):
- `react-router 7.14.0`, `react 19.2.4`, `react-dom 19.2.4` — [FACT] match PRD section "Tech Stack > Frontend Framework".
- `@react-router/dev 7.14.0`, `@cloudflare/vite-plugin ^1.33.2`, `wrangler ^4.85.0` — [FACT] match.
- `tailwindcss ^4.2.2`, `@tailwindcss/vite ^4.2.2` — [FACT] match.
- `vite ^8.0.3`, `vitest ^4.1.5`, `@vitejs/plugin-react ^6.0.1`, `jsdom ^29.1.0`, `@testing-library/react ^16.3.2`, `@testing-library/jest-dom ^6.9.1`, `@testing-library/dom ^10.4.1` — [FACT] match.
- `@biomejs/biome 2.4.13`, `typescript ^5.9.3`, `isbot ^5.1.36` — [FACT] match.

**External-service dependencies** (not yet in package.json, marked `[ASSUMPTION: 미설치]` in PRD — acceptable):
- velite, MDX, shiki, Satori, React Email, Resend SDK, Turnstile (client widget + server siteverify call).

**Initial Hypothesis**: "Stack is internally coherent and well-versioned. The dominant risks are (1) the design-source porting gap (React 18 IIFE -> React 19 ESM), (2) the absence of measurable NFRs, and (3) cross-document drift in `CLAUDE.md`."

### Step 2 - Technical Verification & Alternatives

| Claim (PRD) | Verification | Tag | Evidence |
|---|---|---|---|
| React Router 7.14 Framework mode runs SSR on Cloudflare Workers via `@cloudflare/vite-plugin 1.33.2` | Verified — Cloudflare ships an official RR v7 template and the Vite plugin is GA. | [FACT] | [Cloudflare Workers / React Router](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/), [Cloudflare Vite plugin announcement](https://blog.cloudflare.com/introducing-the-cloudflare-vite-plugin/) |
| Tailwind v4 `@variant dark (&:where([data-theme='dark'], [data-theme='dark'] *))` enables data-attribute dark mode | Verified — Tailwind v4 docs explicitly support `@custom-variant` with `[data-theme=...]`. | [FACT] | [Tailwind v4 theme variables docs](https://tailwindcss.com/docs/theme), [Custom themes in Tailwind v4](https://dev.to/vrauuss_softwares/-create-custom-themes-in-tailwind-css-v4-custom-variant-12-2nf0) |
| Tailwind 4.2.x is current; `oklch()` / `color-mix(in oklab, ...)` are usable | Verified — 4.2.0 released 2026-02-18; modern color functions are core CSS. | [FACT] | [Tailwind 4.2 release notes](https://www.infoq.com/news/2026/04/tailwind-css-4-2-webpack/) |
| Satori standalone build with manual `yoga.wasm` load is required on Workers, served via Asset Binding | Verified — Workers cannot compile WASM from arbitrary blobs; standalone build + module import is the documented path. | [FACT] | [Satori standalone build](https://deepwiki.com/vercel/satori/2.4-text-rendering), [Workers static asset binding](https://developers.cloudflare.com/workers/static-assets/binding/), [Satori on Cloudflare Workers writeup](https://code.charliegleason.com/satori-vite-remix-cloudflare) |
| Resend free tier = 3,000 emails/month, 100/day, 1 custom domain | Verified — current Resend free tier exactly matches. | [FACT] | [Resend new free tier](https://resend.com/blog/new-free-tier), [Cloudflare Workers + Resend tutorial](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/) |
| Turnstile siteverify endpoint validates the token server-side | Verified — `POST https://challenges.cloudflare.com/turnstile/v0/siteverify` with `secret`+`response`; tokens valid 5 min, single-use. | [FACT] | [Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) |
| velite turns MDX + Zod into a typed JSON data layer (used as Infrastructure read-side) | Verified — velite official docs describe exactly this workflow. | [FACT] | [velite Introduction](https://velite.js.org/guide/introduction), [velite MDX support](https://velite.js.org/guide/using-mdx), [velite repo](https://github.com/zce/velite) |
| velite + RR v7 Framework + Cloudflare Workers all play together | No first-party docs show this exact triple stack working out of the box; conceptually it is fine because velite is a *build-time* ETL that emits static JSON consumable by any Vite-based runtime. | [INFERENCE] | velite output is a normal `.velite/` JSON tree that is statically import-friendly; no runtime Workers constraint applies. |
| `window.print()`-based PDF export reliably produces a usable resume | Browser print engines differ in handling `@page`, page-break rules, OKLCH colors, backdrop-filter, and webfont embedding. No PRD-defined acceptance criteria. | [UNCERTAIN] | See Issue #5. |
| Cloudflare Web Analytics is cookie-less | Confirmed by product positioning — but PRD does not capture how the snippet is loaded under SSR + CSP. | [INFERENCE] | Acceptable, but tighten via NFR/security section. |
| `[ASSUMPTION: rehype-toc 또는 velite 후처리]` for on-this-page TOC | Both options are valid; PRD correctly tags as assumption. | [FACT] tag policy correct |  |

**Alternatives explored**:
- (F011 OG generation) If Satori standalone proves too heavy, **build-time pre-rendered PNGs per slug** is a viable fallback (content is fully static).
- (F016 search) Single in-bundle JSON works for current scale; **FlexSearch / MiniSearch** can be deferred and PRD already says so.
- (F008 email) MailChannels is **EOL** (2024-06-30), so Resend is correctly chosen as the only practical option.

### Step 3 - Logical Consistency

**Cross-references (PRD self-consistency)** — checked manually:
- Every Feature ID `F001..F019` (excluding intentionally removed F015) is mapped to at least one page in "Page-by-Page Detailed Features".
- Every page in "Page-by-Page Detailed Features" lists its `Implemented Features`.
- Menu Structure references match the page list (Brand/Topbar/Footer/palette/colocated content links).
- Removed features (F001 split-CTA, F015 audience memory) are explicitly documented under "Deferred / Removed".
- `F018` indexing policy is consistently restated on `App Terms`, `App Privacy`, and `Not Found` pages.

**Cross-references (PRD <-> PROJECT-STRUCTURE)**:
- Routes in `PROJECT-STRUCTURE.md` (`app/presentation/routes/_index.tsx`, `about.tsx`, `projects.$slug.tsx`, `blog.$slug.tsx`, `contact.tsx`, `legal._index.tsx`, `legal.$app.terms.tsx`, `legal.$app.privacy.tsx`, `rss[.xml].tsx`, `sitemap[.xml].tsx`, `robots[.txt].tsx`, `og.projects.$slug[.png].tsx`, `og.blog.$slug[.png].tsx`, `$.tsx`) — **fully consistent** with PRD pages and resource routes.
- Cross-cutting concerns table in `PROJECT-STRUCTURE.md` covers F010, F011, F012, F013, F016, F018, F019, F008/F009 — **all PRD features have a CA layer mapping**.
- velite collections (`Project`, `Post`, `AppLegalDoc`) and `ContactSubmission` VO + `ThemePreference` VO match PRD's Data Model section.

**Inconsistency**:
- `CLAUDE.md` Commands table lists `bun run start` (Metro), `bun run ios` / `bun run android` (`expo run:*`), and references `babel.config.js`, `metro.config.js`, `react-test-renderer`, `setupFilesAfterEnv` in `jest.config.js`. None of these exist in this project. `package.json` exposes `dev` (`react-router dev`), `build`, `deploy`, `test` (vitest), `typecheck`. This is a **document-level contradiction** that will mislead future automation, planners, and humans (Blocker #1).

### Step 4 - Complexity & Risk Assessment

| Area | Complexity (1-5) | Evidence |
|---|---|---|
| Static content pipeline (velite + MDX + Zod + shiki) | 2 | Standard Vite-era pattern; velite explicitly supports MDX. |
| Cmd+K Command Palette (F016) with build-time index | 2 | In-memory token search over a small static index; well-trodden. |
| Contact form (F008/F009) on Workers | 3 | Resend SDK + Turnstile siteverify both have small footprints; main risk is secret hygiene. |
| Satori OG on Workers (F011) | 4 | Requires standalone build, manual `yoga.wasm` load via Asset Binding, font ttf delivery; non-trivial but documented. |
| Print resume (F003) | 3 | Browser-print quirks; not technically risky but acceptance criteria are missing. |
| SSR + dual-meta + JSON-LD per page (F018) | 2 | RR v7 `meta` export is the canonical primitive. |
| Sitemap / robots / RSS resource routes (F018, F012) | 1 | Trivial loaders that emit XML/text. |
| chrome-free WebView mode (App Terms/Privacy) | 1 | Layout swap. |

**Time estimation (solo dev, 3-6 month corridor)**: PRD does not specify timeline — acceptable for a Small-scale PRD per the `prd` skill's NEVER-Generate rule (no milestones / no business metrics). Implementation effort distribution looks naturally bounded inside the corridor for a solo developer.

**Scale suitability**: Small scope is appropriate; the codebase plan in `PROJECT-STRUCTURE.md` (CA 4-layer + DI container as plain object/Map) is right-sized for this scale.

### Step 4.5 - Scope Compliance: Business Metrics Absence

**Grep over PRD for prohibited tokens** (Success Metrics / KPI / DAU / MAU / WAU / 리텐션 / Retention / Churn / 이탈률 / Conversion / 전환율 / LTV / CAC / ARPU / ARR / MRR / Adoption / Stickiness / NPS / CSAT / 만족도 / 성공 지표 / 목표지수 / 핵심 성과 지표):

- **Zero hits** for any of the prohibited business-outcome keywords. The PRD never frames any number as a business goal.
- The "metrics" field in the `Project` data model (`metrics: [string, string][]`) refers to **per-case-study result metrics that the user fills in inside MDX content** (e.g., `["MAU", "12k"]`) — this is **content payload**, not a project-level success target. **[ALLOWED]**
- The phrase "월 1편 작성 운영" in F006 is an **operating cadence note for content creation**, not a retention/adoption target. **[ALLOWED]**
- The phrase "평균 회신 24시간 이내" in F008 is a **user-facing copy on the success screen**, not a measured SLA. **[ALLOWED]**

**Result**: **0 `[SCOPE_VIOLATION]` entries**. The PRD is fully scope-compliant for this dimension.

### Step 5 - Hypothesis Verification & Revision

- **Initial hypothesis confirmed**: design-source -> production gap and absent NFRs are the dominant risks.
- **Newly discovered (and elevated to Blocker)**: `CLAUDE.md` describes a different project (Expo/RN) than the rest of the repository. This is the single most consequential finding because it will pollute every future agent's context (this is the file at the root of every conversation).
- **Final revised hypothesis**: PRD content itself is implementable as-is; the **cross-document hygiene** must be fixed (CLAUDE.md) and **NFRs must be added** before implementation begins.

---

## Critical Issues (Immediate Correction Required)

### Issue #1 — `CLAUDE.md` describes a different project than `PRD.md` / `PROJECT-STRUCTURE.md` / `package.json`
- **Severity**: **Blocker**
- **Location**: `/Users/tkstart/Desktop/project/tkstar-dev/CLAUDE.md` lines 47-73 ("Commands > Test & Quality" and "Build & Native" tables, "Presentation test notes" paragraph)
- **Reproducible evidence**:
  - `CLAUDE.md` line 53: `bun run test:coverage` — script does not exist in `package.json` (no `test:coverage` script).
  - `CLAUDE.md` line 53 references `coverageThreshold` in `jest.config.js` — file does not exist; the project uses `vitest.config.ts`.
  - `CLAUDE.md` line 54 references `babel.config.js` / `metro.config.js` — neither file exists; this project uses `vite.config.ts`.
  - `CLAUDE.md` line 58 references `@testing-library/react-native` and `react-test-renderer` — `package.json` only has `@testing-library/react`. There is no React Native at all.
  - `CLAUDE.md` lines 62-66 list `bun run start` (Metro), `bun run ios` (`expo run:ios`), `bun run android` (`expo run:android`), and `bunx expo prebuild --clean`. None of these scripts/tools exist; `package.json` defines `dev` (`react-router dev`), `build` (`react-router build`), `deploy` (`react-router build && wrangler deploy`), `test` (`vitest run`), `typecheck`.
  - `package.json` confirms the project type: `"react-router": "7.14.0"` and `"wrangler": "^4.85.0"` only — pure web stack.
- **Why this is a Blocker**: `CLAUDE.md` is loaded as project instructions on **every** Claude Code session and is referenced by the harness pipeline. Stale Expo/RN guidance will (a) push agents toward non-existent commands, (b) make TDD/Red-Green cycles fail (`jest.config.js` is missing), (c) mislead future PRD/plan/code-review work into believing a mobile target exists.
- **Resolution recommendation**:
  1. Replace the `Test & Quality` and `Build & Native` tables with the actual web stack: `bun run dev`, `bun run build`, `bun run deploy`, `bun run typecheck`, `bun run test`, `bun run test:watch`, `bun run lint`, `bun run format`, `bun run check`.
  2. Drop the "Presentation test notes" paragraph entirely (RN/Jest specifics do not apply).
  3. Drop the "Recommended workflow after dependency install" block (no `expo prebuild`).
  4. Fill in `Service Name`, `Goal`, `Target Users` placeholders in the header so future agents have correct project framing.
- **Urgency**: **High** — fix before next harness pipeline run.

---

## Major Issues (Improvement Recommended Before Development)

### Issue #2 — Missing Non-Functional Requirements (NFR) section
- **Severity**: **High**
- **Location**: `docs/PRD.md` (no NFR section exists between "Data Model" and "Tech Stack")
- **Risk analysis**: Without measurable NFRs, the TDD-First principle in `CLAUDE.md` cannot produce verifiable tests for cross-cutting concerns. Specifically:
  - **Performance**: Hero LCP, Time-to-Interactive, OG-image cold-start budget, search-index payload size — none specified. Satori on Workers is a known soft spot (CPU time, ~50ms budget).
  - **Accessibility**: PRD references `oklch()` and dark/light contrast but specifies no WCAG target (e.g., AA contrast ratio for text, `prefers-reduced-motion` handling for the `@keyframes blink` cursor in F010 / Hero).
  - **Security**: No CSP policy specified for Cloudflare Web Analytics + Turnstile + Satori inline SVG; no rate limit on `/contact` action; no maximum message length (the `contact-submission.schema.ts` mentions "10자 이상" minimum but no maximum).
  - **Browser support**: PRD says "모던 브라우저만 타깃" but does not enumerate (e.g., Chrome >= 119 for `oklch()`, Safari >= 16.4 for `color-mix()`).
  - **i18n**: Explicitly out of scope (Korean only) — that is fine, but the `lang="ko"` attribute requirement should be captured.
- **Improvement**: Add an **NFR** section with explicit, testable thresholds. Suggested skeleton:
  - Performance: LCP < 2.5s on 4G + low-end mobile; sitemap size < 10MB; search-index < 100KB gzipped; OG render < 1.5s p95.
  - Accessibility: WCAG 2.1 AA contrast; `prefers-reduced-motion` disables blink/fade keyframes; keyboard trap-free Command Palette with focus return on close.
  - Security: CSP allow-list for `challenges.cloudflare.com` (Turnstile), `static.cloudflareinsights.com` (Web Analytics); contact `message` field 10..5000 chars; per-IP rate limit 5/hour on `submitContactForm`.
  - Browser support: Chrome/Edge >= 119, Safari >= 16.4, Firefox >= 113 (minimum bar for `oklch()` + `color-mix()`).
- **Alternatives**: If a full NFR section feels heavy for a personal site, at minimum embed the contrast/CSP/rate-limit numbers next to the relevant features (F010 dark mode, F008 contact, F013 analytics).
- **Better option**: Move all numeric *technical* constraints (contrast, payload sizes, CSP) into a single NFR section — this stays scope-compliant per the `prd` skill (numbers describe system contract, not business outcomes).

### Issue #3 — `[ASSUMPTION]` items have no resolution checkpoint
- **Severity**: **High**
- **Location**: `docs/PRD.md` — assumption tags scattered across:
  - About Page Key Features (자격증 데이터 카드)
  - Project Detail Key Features (rehype-toc 또는 velite 후처리)
  - Tech Stack > Typography (Satori asset fetch path)
  - Tech Stack > Content Pipeline (velite, shiki, Satori, on-this-page TOC — 미설치)
  - Tech Stack > Forms & Email (React Email, Resend, Turnstile — 미설치)
  - Tech Stack > Hosting (도메인 등록 채널)
  - Tech Stack > SEO (Google/Naver 토큰 발급 시점)
  - Not Found Fallback (splat 또는 ErrorBoundary)
- **Risk**: Tags are correctly applied (good), but PRD provides no "resolution gate" — i.e., when must each assumption be resolved? Without a gate, assumptions silently leak into implementation and then into production.
- **Improvement**: Add a small "Assumptions Register" at the bottom of PRD (or inside `PROJECT-STRUCTURE.md` "Architectural Decisions Open" subsection — `Resolved` already exists in the latter as D1-D5). Each entry: owner / resolution-by phase / current state.
- **Alternative**: If a register is too heavy, append `[Resolve before: <phase name from ROADMAP.md>]` to each assumption tag. This piggy-backs on the existing ROADMAP.

### Issue #4 — No DoD / Acceptance Criteria per feature
- **Severity**: **High**
- **Location**: `docs/PRD.md` — every Feature ID and every Page-by-Page row has `Key Features` (descriptive) but no `Acceptance Criteria` (testable / Given-When-Then).
- **Risk**: TDD-First requires verifiable success criteria. CLAUDE.md "Goal-Driven Execution" explicitly forbids weak criteria like "make it work". As-is, F003 (PDF), F008/F009 (contact pipeline), F011 (OG), F016 (palette) cannot be opened as Red-phase tests without authoring the criteria first.
- **Improvement**: For each Core feature, add 2-4 testable bullets. Examples:
  - F003 PDF: "When user clicks `[⎙ PDF]`, `window.print()` is invoked once and Topbar/Footer/SearchTrigger/ThemeToggle have `display: none` in `@media print`."; "Page breaks do not split a single experience block (CSS `break-inside: avoid` on `.experience` rows)."
  - F008 Contact: "Submitting a valid form triggers exactly one `email-sender.send` call and one auto-reply call."; "On `email-sender` failure the form is preserved and a `mailto:` fallback link is rendered."
  - F009 Turnstile: "Server-side `siteverify` is called with `secret` + `response`, and a non-`success` response rejects the submission with HTTP 400."
  - F016 Palette: "`Cmd+K`, `Ctrl+K`, and `/` open the palette; inside an `<input>`/`<textarea>`/`[contenteditable]` the `/` shortcut is suppressed."; "`Esc` closes the palette and returns focus to the trigger."

### Issue #5 — F003 PDF export is brand-/engine-dependent and lacks an acceptance criterion
- **Severity**: **Medium**
- **Location**: `docs/PRD.md` F003 row + About Page Key Features
- **Risk analysis**: `window.print()` produces output that varies between Chrome (Skia print pipeline), Safari (CG print), and Firefox (Cairo). Known pitfalls for this stack:
  - `oklch()` and `color-mix()` may be rasterized inconsistently in print preview on Safari < 17.
  - `backdrop-filter: blur()` regions can be rendered as solid blocks in print.
  - Self-hosted woff2 may not be embedded by default in some print pipelines (FOIT in PDF).
  - `@media print` style is required to hide Topbar/Footer (PRD does say this) but not specified for `@page` margins, page breaks, or color profile.
- **Improvement**: Add to F003:
  - Target browsers: Chrome/Edge latest + Safari 17+ (drop or call out earlier Safari).
  - Force `print-color-adjust: exact` on the resume container to preserve OKLCH colors.
  - Define `@page { margin: 18mm 16mm; }` and `break-inside: avoid` on experience/award rows.
  - Add a manual smoke test step in the harness: print to PDF on each target browser and visually compare.

### Issue #6 — Contact pipeline lacks a server-side rate-limit and message-size cap
- **Severity**: **Medium**
- **Location**: `docs/PRD.md` F008 / F009 + `domain/contact/contact-submission.schema.ts` reference in `PROJECT-STRUCTURE.md`
- **Risk**: Turnstile catches bot traffic but does not protect against authenticated abuse (a single user mashing submit) or oversized payloads (a 10MB message would be valid by current schema). Resend free tier is hard-capped at 100 emails/day - sustained abuse drains quota.
- **Improvement**:
  - Add NFR: per-IP rate limit, e.g., 5 submissions / hour using Workers KV or Durable Objects.
  - Add domain rule: `message.length <= 5000` (or similar) to `contact-submission.schema.ts`.
  - On Resend send failure, the existing `mailto:` fallback (PRD already specifies) is the right design — explicitly capture this as an acceptance criterion (Issue #4).

### Issue #7 — Satori OG hot-path budget unspecified, with no fallback for cold start
- **Severity**: **Medium**
- **Location**: `docs/PRD.md` F011, Tech Stack > Content Pipeline, `PROJECT-STRUCTURE.md` D5
- **Risk**: Workers paid plan caps a single request at 30s CPU; the free plan caps at 10ms in some configurations. Satori + yoga.wasm + ttf load can exceed the budget on cold start, especially when the Asset Binding ttf is fetched for each request.
- **Improvement**:
  - Cache the rendered PNG: set `Cache-Control: public, max-age=31536000, immutable` on the resource route response (PRD currently does not specify caching).
  - For the static-site-with-rare-changes case, prefer **build-time** PNG generation (run Satori during `react-router build`) and store in `public/og/<slug>.png`. The `og.*[.png].tsx` resource routes can fall back to runtime only when the static file is missing.
  - Add an NFR: OG cold-start p95 < 1500ms; warm < 200ms.

---

## Minor Suggestions (Optional Improvements)

### Suggestion #1 — Capture `lang="ko"` and OG locale explicitly
- **Opportunity**: PRD says i18n is out of scope but `<html lang="...">` and `<meta property="og:locale" content="ko_KR">` should still be enforced.
- **Expected effect**: SEO clarity for Korean engines (Naver in particular) and screen-reader correctness.
- **Priority**: Low.

### Suggestion #2 — Define the design-system port checklist
- **Opportunity**: The "design source -> production" gap is mentioned but no concrete porting checklist exists. Consider listing each `proto/*.jsx` file and its target `app/presentation/components/*.tsx` location with the "what changes" delta (React 18 -> 19, IIFE -> ESM, `window.X` -> module imports).
- **Expected effect**: Reduces ambiguity during the implementation phase; gives a clean unit of work for each PR.
- **Priority**: Medium.

### Suggestion #3 — Tighten the Search Index DoD
- **Opportunity**: PRD says the index is built from velite collections; PROJECT-STRUCTURE D3 confirms `public/search-index.json`. Add: "index size budget < 100KB gzipped at MVP", "index excludes MDX body", "client lazy-fetches once per session".
- **Expected effect**: Clear Red-phase tests for `build-search-index.service.ts`.
- **Priority**: Low.

### Suggestion #4 — Capture analytics + Turnstile under CSP
- **Opportunity**: With Cloudflare Web Analytics + Turnstile + inline JSON-LD `<script>`, a CSP needs `script-src` allow-listed. Currently neither PRD nor PROJECT-STRUCTURE captures this.
- **Expected effect**: Production-ready security headers from day one.
- **Priority**: Medium.

---

## Final Verification Verdict

### Chain of Thought Summary
1. **Because** package.json and PRD's "Tech Stack (Latest Versions)" section line up exactly, and every external service claim (RR v7 + Workers, Tailwind v4 data-attribute variant, Satori standalone, Resend free tier, Turnstile siteverify, velite + Zod) is supported by official documentation [FACT]...
2. **And** the PRD self-consistency (Feature -> Page -> Menu) and the cross-document consistency with PROJECT-STRUCTURE.md (CA 4-layer mapping, route file conventions, DI container approach) are both intact [INFERENCE]...
3. **But** `CLAUDE.md` describes an Expo/React Native project that does not exist (Blocker), and the PRD is missing a Non-Functional Requirements section + per-feature Acceptance Criteria, which collide directly with TDD-First and Goal-Driven Execution [FACT]...
4. **Therefore** the PRD's *content* is implementable as designed; the *surrounding documents* and a small set of testable-criteria gaps must be tightened before kicking off the harness pipeline.

### Technical Verdict
**Selected Verdict**: **Conditional Pass**

**Verdict Basis**:
1. [FACT] Stack versions and external services are verified and aligned.
2. [FACT] PRD-internal cross-references are complete; PROJECT-STRUCTURE provides a coherent CA mapping.
3. [FACT] `CLAUDE.md` is internally inconsistent with the rest of the repository — a Blocker for any pipeline run.
4. [INFERENCE] Adding NFRs and Acceptance Criteria is the cheapest way to unlock TDD-First.
5. **Therefore**: pass conditionally, fix Issue #1 first, then Issues #2-#4, then implement.

### Confidence and Risk Levels
- **Technical Confidence**: 8/10 (versions and external services solid; OG-on-Workers and PDF print are the soft spots)
- **Implementation Complexity**: 5/10 (small surface area, standard patterns; Satori is the only sharp edge)
- **External Dependency Risk**: 4/10 (Resend / Turnstile / Cloudflare Workers all are stable; velite is single-maintainer but mature for the use case)
- **Overall Risk**: 4/10

### Development Progression Recommendations
1. **Immediate Resolution (before next pipeline run)**:
   - Issue #1 — rewrite `CLAUDE.md` Commands and Notes to reflect the actual web stack.
2. **Pre-Development Verification**:
   - Issue #2 — author the NFR section.
   - Issue #4 — add Acceptance Criteria to each Core feature (F001-F009, F016).
   - Issue #3 — add an Assumptions Register or `[Resolve before: <phase>]` annotations.
3. **Consider During Development**:
   - Issue #5 — F003 PDF browser-matrix smoke test in CI or harness manual step.
   - Issue #6 — Contact rate-limit + message size cap.
   - Issue #7 — Satori caching + build-time fallback.
4. **Continuous Review**:
   - Velite, Satori, and Cloudflare Vite plugin minor releases (these are the youngest dependencies in this stack).
   - Workers CPU budgets — re-validate Satori p95 numbers once real traffic begins.

---

## One-line Go / No-Go Decision

**Conditional Go** — the PRD is technically implementable as designed; ship Issue #1 (CLAUDE.md realignment) and Issues #2-#4 (NFR + Acceptance Criteria + Assumptions resolution gates) **before** opening the first feature PR.

---

## Sources
- [Cloudflare Workers / React Router framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/)
- [Cloudflare Vite plugin announcement](https://blog.cloudflare.com/introducing-the-cloudflare-vite-plugin/)
- [React Router File Route Conventions](https://reactrouter.com/how-to/file-route-conventions)
- [React Router Type Safety](https://reactrouter.com/explanation/type-safety)
- [Tailwind CSS v4.0 release](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind v4 Theme variables](https://tailwindcss.com/docs/theme)
- [Tailwind v4.2 release notes (InfoQ)](https://www.infoq.com/news/2026/04/tailwind-css-4-2-webpack/)
- [Custom themes in Tailwind v4 (data-theme)](https://dev.to/vrauuss_softwares/-create-custom-themes-in-tailwind-css-v4-custom-variant-12-2nf0)
- [Satori standalone build (DeepWiki)](https://deepwiki.com/vercel/satori/2.4-text-rendering)
- [Satori on Cloudflare Workers walkthrough](https://code.charliegleason.com/satori-vite-remix-cloudflare)
- [Cloudflare Workers Static Assets Binding](https://developers.cloudflare.com/workers/static-assets/binding/)
- [Resend new free tier](https://resend.com/blog/new-free-tier)
- [Cloudflare Workers + Resend tutorial](https://developers.cloudflare.com/workers/tutorials/send-emails-with-resend/)
- [Cloudflare Turnstile server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [velite Introduction](https://velite.js.org/guide/introduction)
- [velite MDX support](https://velite.js.org/guide/using-mdx)
