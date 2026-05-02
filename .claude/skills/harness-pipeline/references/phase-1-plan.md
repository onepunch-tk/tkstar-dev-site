# Phase 1: Plan (All Modes)

> **Default**: `EnterPlanMode` (local planning — always available)
> **Upgrade**: ultraplan (cloud-based planning — requires user to manually trigger via `/ultraplan` command)

| Step | Action |
|------|--------|
| 1 | Read `CLAUDE.md`. Read `docs/ROADMAP.md` if it exists (skip if not — e.g., bug fix without roadmap) |
| 1a | **CA Structure Check**: Read `docs/PROJECT-STRUCTURE.md`. If it does NOT exist → auto-invoke `project-structure` skill to generate it from the CA template |
| 1b | **Load CA Template**: Run framework detection per [`shared/framework-detection`](../../shared/framework-detection/SKILL.md) (and [`shared/monorepo-detection`](../../shared/monorepo-detection/SKILL.md) first if relevant) to pick the target directory and framework. Load the matching CA template from `.claude/skills/project-structure/references/` (react-router, nestjs, or expo). Use the template's **File Location Summary by Task** table as the file placement guide. |
| 1c | **GitHub Mode Check**: Read `Remote Platform` from CLAUDE.md. If set to `GitHub` → run `gh auth status`. If auth fails → instruct user to run `! gh auth login` and **STOP**. If not set → Local Mode (skip Issue/PR steps). Store result in `github_mode` variable for later steps. |
| 2 | **Enter plan mode**: Call `EnterPlanMode` to start local planning. Output a summary of gathered context and task description for the user. Inform the user they can upgrade to ultraplan via `/ultraplan` if desired. |
| 2a | **Pipeline State → `plan`**: Set `pipeline-state.json` `current_phase` to `"plan"`, `plan_approved` to `false`, `github_mode` to detected value, `issue_number` to `null`. (ABAC hook blocks source code modifications during plan phase). Mode is finalized after Step 4, so set `"pending"` for now. (see Pipeline State Management in SKILL.md) |
| 2b | **Create GitHub Issue** (GitHub Mode only — skip if Local Mode): Agent composes title/body, then calls `.claude/hooks/git-issue.sh --title "..." --body "..." --label "..."`. Parse `ISSUE_NUMBER=N` from the last line of output and store in `pipeline-state.json` `issue_number`. |
| 3 | Analyze current state and create detailed step-by-step plan in the plan file. **File placement MUST follow the CA template's layer structure**: Domain → Application → Infrastructure → Presentation. Use the Phase 0 intent summary as the source of truth for user intent — do NOT re-litigate decisions already confirmed there. |
| 4 | **Count files and features** → determine execution mode (Sequential / Team) |
| 4-ui | **UI Detection**: First read `docs/PROJECT-STRUCTURE.md` for the project's Presentation layer paths and use those as the primary match set. Fall back to the default glob patterns (`**/presentation/components/**`, `**/presentation/routes/**`, `**/presentation/layouts/**`, `**/presentation/pages/**`, `**/presentation/screens/**`, `app/routes/**`) if the structure doc does not enumerate them. Also check the task description for UI keywords (`component`, `page`, `screen`, `layout`, `UI`, `design`, `디자인`, `화면`). If ANY match → set `ui_involved = true`, otherwise `false`. **When `ui_involved = true`, the plan MUST allocate visual sub-tasks to `ux-design-lead` — see "UI/Design Delegation" section below.** |
| 4z | **Pipeline State mode finalized**: Update `pipeline-state.json` with the mode determined in Step 4 (`"sequential"` \| `"team"`) and `"ui_involved"` from Step 4-ui |
| 5 | Plan review → approve via `ExitPlanMode` (user may upgrade to ultraplan at this point) |
| 5z | **Automatic**: On `ExitPlanMode` approval the `post-plan-approval.sh` PostToolUse hook flips `pipeline-state.json` `plan_approved` to `true`. **Agents MUST NOT attempt to write `plan_approved: true` manually** — a system-level safety filter blocks that pattern to prevent plan-mode skipping, and the hook is the only sanctioned flip path. If the hook somehow fails (check with `cat .claude/runtime/pipeline-state.json`), stop and escalate — do not try to bypass. The `pipeline-guardian` hook will **block Phase 2 entry** while `plan_approved` is `false`. |
| 5zz | **MANDATORY ordering before Phase 2 (context gate)**: After approval the agent MUST execute, in this exact order, within the same response: (1) Steps 5a → 5a-clean → 5a-sync → 5b — sync `development` and create the feature branch; (2) the **Task Creation** section below — call `TaskCreate` to register ALL upfront pipeline tasks for the entire workflow (Phase 2 TDD red/green cycles, Phase 3 review, Phase 4 validate + PR), each task a concrete action derived from the approved plan. The first `TaskCreate` call triggers `post-task-created.sh`, which flips `pipeline-state.tasks_created` to `true` AND emits an `additionalContext` directive carrying the `/compact` advisory verbatim (with the focus prompt inlined as a copy-pasteable one-liner) — the same body is mirrored to stderr as a fallback for terminal-watching users. (3) STOP — do NOT advance `current_phase` to `"tdd"`, do NOT spawn sub-agents, do NOT begin Phase 2 work. The agent's next response relays the advisory verbatim and waits. **Unblocking replies**: user runs `/compact` themselves; user explicitly says to skip compact and proceed; user gives new direction. **Rationale**: with tasks created before compaction the user retains full pipeline visibility through the focus prompt; without this ordering the model silently enters TDD carrying Phase 1 reconnaissance noise that the plan file already captures, defeating the Context Engineering principle in CLAUDE.md. |

## Stakeholder Consultation — Removed

> Stakeholder Consultation (former Step 3a) has been **removed** from Phase 1.
> Its purpose (surfacing ambiguities and gathering user intent) is now owned
> entirely by **Phase 0 (Discovery)**. See
> [`phase-0-discovery.md`](phase-0-discovery.md) and the
> `interview-protocol` skill. The Phase 0 intent summary written to the plan
> file is the contract Phase 1 reads from — re-asking the same questions in
> Phase 1 is redundant.

---

## Ultraplan (Optional Upgrade)

Ultraplan is a cloud-based planning feature. **Agents cannot trigger ultraplan programmatically** — the keyword trigger only works when typed by the user, not when output by an agent.

The user can upgrade to ultraplan via:

| Method | How It Works |
|--------|-------------|
| **User command** | User runs `/ultraplan <task>` directly in CLI |
| **From local plan** | User chooses "refine with Ultraplan" at local plan approval dialog |

> If the user does not trigger ultraplan, proceed with local plan mode (`EnterPlanMode`) — this is the default path.

### Status Indicators (ultraplan active)

| Status | Meaning |
|--------|---------|
| `◇ ultraplan` | Drafting the plan |
| `◇ ultraplan needs your input` | Clarifying question — open session link |
| `◆ ultraplan ready` | Plan ready for browser review |

### Approval Options

**Default (local plan mode):**
- Call `ExitPlanMode` → user reviews and approves the plan file
- User may upgrade to ultraplan via `/ultraplan` or "refine with Ultraplan"

**If user activated ultraplan:**
- **Approve & execute on the web** → implementation continues in the cloud session, opens PR when done
- **Approve & teleport to terminal** → plan is sent back to CLI for local execution with full environment access

> After approval (either path), the pipeline continues directly to Phase 2 (TDD). No separate confirmation needed.

## CA File Placement Rules

When planning file locations, refer to the **CA template loaded in Step 1b** and `docs/PROJECT-STRUCTURE.md` for actual layer paths. Place each file type in the matching CA layer:

| File Type | CA Layer |
|-----------|----------|
| Entity, Schema, VO, Error | **Domain** (innermost) |
| Service, Port, DTO, Mapper | **Application** |
| Repository impl, API client, Config | **Infrastructure** |
| Controller, Route, Component, Hook | **Presentation** (outermost) |

> Use the template's **"File Location Summary by Task"** table for exact directory paths — do NOT assume fixed folder names.

> **Dependency Rule**: see [`shared/ca-rules`](../../shared/ca-rules/SKILL.md) for the single source of truth on the layer dependency direction and TDD-exemption list.

> After plan approval, create ALL tasks for the entire pipeline upfront via `TaskCreate`, then execute sequentially. No separate confirmation needed.

## UI/Design Delegation (Planning-Time)

> **Applies when `ui_involved = true` (Step 4-ui).**
> Visual output is the `ux-design-lead` sub-agent's domain. The main agent is the **orchestrator**, not the designer. Delegation must be **declared in the plan**, not deferred to Phase 2/3.

### What MUST be delegated to `ux-design-lead`

Allocate these sub-tasks to `ux-design-lead` during planning:

- Design tokens (colors, spacing, radius, typography, shadow, breakpoints) and theme bridge files
- **Design runtime setup** — whatever file(s) bind design tokens to the styling runtime in the project's stack. The shape varies; what matters is the *role*: "hand tokens to the engine at startup." Examples across stacks:
  - *Utility/atomic CSS* (Tailwind, UnoCSS): `tailwind.config.*`, PostCSS pipeline, `@theme`/`:root` custom property sheets, preset files
  - *CSS-in-JS* (styled-components, Emotion, vanilla-extract, Stitches): `theme.ts` wired into the provider, `createTheme`/`createStitches` definitions, `.css.ts` global style entries
  - *Component libraries* (shadcn/ui, Chakra, MUI, Mantine, Radix Themes): theme override objects, `components.json`, style preset config
  - *React Native styling engines* (Unistyles, NativeWind, Tamagui, Restyle): `*.config.{ts,js}` files registering tokens + any babel/metro plugin entries those engines require
  - *Pure CSS / CSS Modules*: `:root` custom property declarations, global stylesheet imports

  **Rationale**: keeping tokens, theme, and the runtime that consumes them under one agent prevents drift between token shape and runtime expectations. **Detection pattern**: if the file's single responsibility is "make design tokens available to components," it belongs here — regardless of filename.
- UI components — variants, states (default / pressed / disabled / loading / error), responsive behavior, a11y props (`accessibilityLabel`, `accessibilityRole`, `testID`), hitSlop, touch targets
- Interaction patterns — press/hover feedback, micro-animations, transitions, gesture hints
- Layout primitives (Card, Section, Grid, Stack), visual hierarchy
- Icon / font / illustration library selection (verify via Context7 + WebSearch per `ux-design-lead` protocol)
- Dark / light mode visual parity, custom palette data
- Design review of existing UI (Phase 3 `design-reviewer` role)

### What the main agent keeps

- Test writing (delegated to `unit-test-writer`) — tests specify **behavior contracts** that `ux-design-lead` implements against
- **Provider wiring** — theme provider, services/DI provider, store subscription logic, the `useEffect`/`onMount`/etc. that syncs store state → runtime API (e.g., `store.themeMode` → `styling.setTheme(...)`). The *runtime call targets* come from the design system, but the *data-flow wiring* is state-management territory and stays with main.
- Non-design build config — bundler (webpack, vite, metro, turbopack), type config (`tsconfig.json` paths/references), test runner config (`jest.config.*`, `vitest.config.*`), deploy/CI config (`eas.json`, `vercel.json`, workflow files)
- Side-effect imports in framework entry points — root layout / `_app.tsx` / `root.tsx` / `main.tsx` importing the styling-engine config at the top level. Wiring decision, not visual decision.
- Service / hook / repository code that has no visual output
- Integration verification (`typecheck`, `lint`, `test`, native build)
- Orchestration of the TDD cycle (Red → Green → Commit), teammate spawning, merge decisions

### Role-split table (paste into the plan)

Every plan with `ui_involved = true` must include a table of this shape:

| Agent | Responsibility |
|-------|----------------|
| **Main (orchestrator)** | Runtime config, provider wiring, layout mounting, TDD orchestration, integration verification |
| **`ux-design-lead`** (sub-agent) | Tokens, theme, all visual components, variants/states, animations, a11y, responsive |
| **`unit-test-writer`** (sub-agent) | Red-phase behavior tests for every cycle |
| **`code-reviewer`** (Phase 3) | Quality / security / performance review |
| **`ux-design-lead`** (Phase 3, design-review mode) | Token consistency, state coverage, a11y, responsive parity, visual design |

> **Canonical reference**: Task 006 plan (`~/.claude/plans/noble-marinating-hummingbird.md`) — see its "Role Split" section for the full pattern.

### TDD Exemption — Setup & Data Files

> **Rule**: Setup, config, and pure data files are **NOT TDD targets**. Behavior/logic files **remain TDD**.

**Exempt from TDD** (do **not** create a matching `*.test.*`):

- **Design token / theme source files** — pure data declarations regardless of format: token objects under `**/styles/**` or `**/design-system/**`, CSS custom property sheets, Tailwind `theme.extend` blocks, Emotion/styled-components/MUI/Chakra theme override objects, component-library theme config (shadcn `components.json`, Radix Themes presets)
- **Styling-engine runtime config** — any file whose sole job is "hand tokens to the engine at startup." Examples by stack: Tailwind/PostCSS config, UnoCSS presets, vanilla-extract `globalStyle`, CSS-in-JS `createTheme` definitions, RN styling engine `*.config.*` (Unistyles `StyleSheet.configure` + `declare module`, NativeWind/Tamagui config)
- **Build tooling** — bundler config (`webpack.config.*`, `vite.config.*`, `metro.config.*`, `next.config.*`, `turbo.json`), compiler config (`babel.config.*`, `swc.config.*`), type config (`tsconfig.json`), test config (`jest.config.*`, `vitest.config.*`, `jest.setup.*`), deploy config (`eas.json`, `vercel.json`), generated framework dirs (`.expo/*`, `.next/*`, `.nuxt/*`)
- **Pure stylesheets** — `.css`, `.scss`, `.sass`, `.less`, `.module.css`, `.css.ts` (vanilla-extract), generated class-name maps — no runtime assertion surface
- **Asset manifests** — font/image/icon registration: `app.json`/`app.config.*` asset lists, `next/font` entries, static asset imports, splash/launch screen configs

**Why**: These files *declare* data or plumbing. A failing "token equals 16" assertion doesn't catch a bug — it catches a contract mismatch that the next consuming file surfaces immediately via type error or visual regression. Testing declarations tests the test harness, not the product.

**Still TDD** (every file listed below is a **behavior contract**):

- **Providers that react to state** — anything that subscribes to a store/context and triggers runtime side effects (e.g., theme provider that reads a setting and calls the styling engine's `setTheme(...)`, services provider that wires DI into context, i18n provider that reacts to locale changes). The runtime call is observable and testable.
- **UI components** — buttons, cards, forms, lists — variant matrix, disabled/loading behavior, event callbacks, accessibility props, controlled/uncontrolled state
- **Hooks** — custom hooks with side effects, derived state, async work, or return shape worth pinning down
- **Services, repositories, validators, mappers, reducers, selectors with logic** — anything that takes input and produces output

**Test for borderline cases**: "Does this file **do** something at runtime, or just **declare** something?" Declarations are exempt. Doing requires a test.

**Retroactive rule**: If an earlier cycle produced a test file for a now-exempt target (a test of a styling-engine config, a token/theme snapshot, a build-config roundtrip), delete the test file when the rule is introduced. The implementation file stays; the test file leaves.

### When NOT to delegate to `ux-design-lead`

Do **not** route these to `ux-design-lead` even if the task touches UI files:

- Pure logic (domain entities, scoring algorithms, date math, validation schemas)
- Backend / API / infrastructure (repositories, ports, DI containers, migration scripts)
- Test files (unit, integration, E2E) — always `unit-test-writer` or main
- Non-visual wiring (provider skeletons with no styling, hook factories, route file placement)
- Plumbing that only moves data (selectors, adapters, mappers)
- Build/config files (babel, metro, tsconfig, eas.json)

### Delegation prompt checklist (for the main agent, when invoking `ux-design-lead`)

When spawning `ux-design-lead` for a cycle, the prompt must include:

1. **File list** — exact paths from the plan's Critical Files section
2. **Design sources** — `docs/design-system/**` files to read (do not assume layout; `ux-design-lead` reads the bundle per its Pre-Work protocol)
3. **Behavior contract** — link to the Red-phase test file committed in the same cycle
4. **Project conventions** — `docs/PROJECT-STRUCTURE.md` rule applied, naming/testID conventions, styling API version (e.g., Unistyles v3 `StyleSheet.create((theme, rt) => ...)`)
5. **Non-regression guarantee** — existing tests must stay green
6. **Ask-when-ambiguous** — `ux-design-lead` should ask the user, not guess, when the bundle or plan is ambiguous

## Task Creation (Immediately After Plan Approval)

> Create tasks for every phase up front so the user can track overall progress. Tasks must describe **what to actually do**, not just pipeline flow labels. Break down into the smallest actionable units — each task should be a concrete, executable action that the agent performs.

**Bad** (pipeline flow labels — too abstract):
```
- TDD Red: hero-section test
- TDD Green: hero-section implementation
```

**Good** (concrete actions — what actually gets done):
```
- Install React Router Framework via bun create react-router
- Remove demo welcome page and home route
- Create CA directories (domain, application, infrastructure, presentation)
- Install vitest, @testing-library/react, jsdom and configure vitest.config.ts
- Update routes.ts to point to presentation/routes/_index.tsx
- Write test: HeroSection renders company name and tagline
- Implement HeroSection — company name, tagline, gradient background, 2 CTA buttons
- Run code-reviewer and fix reported issues
- Run E2E test to verify page renders correctly
- Merge feature/company-intro-page → development
```

> **NOTE**: The example above is for reference only. Actual tasks MUST be derived from the approved plan and the current project state.

## Git Setup (Immediately After Plan Approval)

> **CRITICAL**: Branch creation MUST happen immediately after plan approval, BEFORE any code changes.

| Step | Action |
|------|--------|
| 5a | **Hard enforce upstream sync for `development`**: `git fetch origin && { git checkout development 2>/dev/null \|\| git checkout -b development origin/development 2>/dev/null \|\| git checkout -b development main; }`. Then `git pull origin development --ff-only` — if this fails (non-fast-forward), **abort** and request user to rebase/resolve manually. Do NOT use `\|\| true` fallback. Rationale: stale development leaks into every downstream feature branch. |
| 5a-clean | **Ensure development is clean before branching**: Check `git status --porcelain`. If uncommitted changes exist on `development`, commit them with appropriate type prefix and push: `git add -A && git commit -m "🔧 chore: commit pending changes on development" && git push origin development`. This prevents dirty state from leaking into feature branches. |
| 5a-sync | **Hard enforce upstream sync before feature branch creation**: `git pull origin development --ff-only` (again, immediately before `git checkout -b <feature>`). If Step 5a was moments ago and no remote changes landed in between, this is a no-op; the second call is a safety gate for long-running plan sessions where development may have advanced via another PR. **Abort if non-fast-forward.** |
| 5b | Create feature branch from `development` (only after 5a + 5a-clean + 5a-sync succeed). Branch naming depends on mode: |

**Branch Naming Convention:**

| Mode | Pattern | Example |
|------|---------|---------|
| GitHub Mode | `{type}/issue-{N}-{slug}` | `feature/issue-42-login` |
| Local Mode | `{type}/{slug}` | `feature/login` |

Branch type MUST follow [commit-prefix-rules.md](../../git/references/commit-prefix-rules.md): `feature/*`, `fix/*`, `docs/*`, `refactor/*`, `test/*`, `chore/*`. Derive the slug dynamically from the task content.

## Team Mode Addition (Phase 1)

| Step | Action |
|------|--------|
| 4a | Break work into tasks with **clear file ownership** (no overlapping files) |
| 4b | Verify NO file overlap between tasks before spawning teammates |
| 4c | Prepare teammate task prompts with file ownership lists. If `ui_involved` is true, include in each teammate's prompt: "After Green phase, do NOT apply design tokens or styling yourself — lead will handle design application via ux-design-lead after all teammates complete." |

> **WARNING: File Ownership is CRITICAL**
> Overlapping file assignments = merge conflicts = wasted work.
> Lead MUST verify NO file overlap before spawning teammates.

## Context Tip (End of Phase 1)

After the plan is approved and the feature branch + tasks are set up, the plan
file plus the GitHub Issue body hold everything the TDD phase needs.

Two hooks coordinate the plan→tdd boundary:

1. **`post-plan-approval.sh`** — `PostToolUse:ExitPlanMode`. Flips
   `plan_approved=true`, resets `tasks_created=false`, and emits an
   `additionalContext` directive instructing the agent to (a) create the
   feature branch via Steps 5a–5b, (b) call `TaskCreate` for ALL upfront
   pipeline tasks, and (c) STOP without entering Phase 2.
2. **`post-task-created.sh`** — `PostToolUse:TaskCreate`. On the first
   `TaskCreate` call inside plan phase (where `plan_approved==true && tasks_created==false`),
   flips `tasks_created=true` and emits an `additionalContext` directive
   carrying the `/compact` advisory verbatim (focus prompt inlined as a
   copy-pasteable one-liner) — the same body is mirrored to stderr as a
   fallback. Subsequent `TaskCreate` calls early-exit (idempotent — the
   `false → true` transition is the natural dedup gate).

The advisory is non-blocking (exit 0) and the agent cannot trigger
`/compact` itself — only a user-entered slash command executes it.
**Therefore Step 5zz is mandatory**: the agent must complete branch
creation and TaskCreate within the same response as approval, then stop
so the advisory has fired and the user can act on it. See SKILL.md
`## Context Management` for the full policy.
