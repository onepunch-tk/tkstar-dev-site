---
name: prd
description: PRD generation rules and unified template enforced by a Python script. Single 14-section structure for Web, Backend, Mobile, and multi-platform projects.
user-invocable: false
---

# PRD Generation — Unified Template (Python-Backed)

The PRD is rendered by a deterministic Python script from a structured input
JSON. The agent's job is to **interview the user** and write a complete
`docs/.harness/prd-input.json`; the script does all markdown formatting, section
ordering, placeholder insertion, and schema enforcement.

## Mandatory Workflow

1. **Pre-flight check (Python)**
   ```bash
   python3 --version
   ```
   If `python3` is not on `PATH` or the command fails, **STOP**. Report the
   blocker to the main agent verbatim and do not attempt any workaround.

2. **Platform detection** — derive `meta.platforms` (subset of
   `{"web","mobile","backend"}`) from the user's request. See table below.

3. **Workspace detection** — for monorepos, identify the target sub-package
   via `turbo.json` / `pnpm-workspace.yaml` / root `package.json#workspaces`,
   then read versions from that sub-package's `package.json`. See "Version
   Resolution" below.

4. **Interview** — fill every required field of the JSON schema (see
   `## JSON Input Schema` below). Use `interview-protocol` discipline:
   ambiguity = 0 before writing.

5. **Write input file**
   ```
   Write tool → docs/.harness/prd-input.json
   ```
   This file is committed (PR diff = structured review surface). Use the
   Write tool, not Bash heredoc — JSON formatting must be clean.

6. **Invoke Python**
   ```bash
   python3 .claude/skills/prd/scripts/generate_prd.py \
     --input docs/.harness/prd-input.json \
     --output docs/PRD.md
   ```

7. **Handle REJECT** — if the script exits non-zero, stderr will contain a
   single `[REJECT] <reason>` line. Read the reason, fix the JSON, re-run.
   Maximum 2 retry attempts; after that, surface the issue to the user and
   ask for guidance instead of guessing.

> **Output location is fixed**: always `docs/PRD.md`. The script
> automatically backs up any existing file to `docs/PRD.md.bak.<timestamp>`
> before overwriting.

## Platform Detection

| Signal | `meta.platforms` entry |
|--------|------------------------|
| "web app", "website", "React Router", "Next.js", "SPA", page/menu mentions | `"web"` |
| "API", "backend", "server", "REST", "GraphQL", "NestJS", "microservice", endpoint mentions | `"backend"` |
| "mobile app", "iOS", "Android", "Expo", "React Native", screen/tab mentions | `"mobile"` |

Multiple signals → multiple entries (e.g., `["backend", "mobile"]`). If the
user does not specify, **ask** before defaulting — do not infer silently.

## Version Resolution

**Before** populating `tech_stack.*.items[].version`:

1. **Workspace detection** — check in order:
   - `turbo.json` exists at project root → Turborepo
   - `pnpm-workspace.yaml` exists at project root → pnpm workspaces
   - Root `package.json` contains `workspaces` field → npm/yarn/bun workspaces

2. **If monorepo**: identify the target sub-package per platform:
   - Web: directory containing `react-router.config.ts` or `next.config.*`
   - Mobile: directory containing Expo config (`app.config.ts/.js` or
     `app.json` with an `expo` key) AND `expo` in `package.json` dependencies
   - Backend: directory containing `nest-cli.json`
   - Read that sub-package's `package.json` for versions; fall back to root
     only for shared dependencies.

3. **Single project**: read root `package.json`.

4. **Override**: if the user (or main agent) explicitly specifies a stack,
   prioritize their choice. Defaults apply only when no preference is given.

## JSON Input Schema

Authoritative source: `scripts/generate_prd.py` dataclasses. Field-by-field outline lives in [`references/input-schema.md`](references/input-schema.md). Top-level keys: `meta` / `overview` / `roles` / `user_journeys` / `features` / `deferred_features` / `surface_map` / `surface_details` / `endpoint_specs` / `data_model` / `backend_specifics` / `mobile_specifics` / `security` / `nfr` / `tech_stack` / `assumptions_open_questions` / `appendix`.

## Coverage Rule (AC Quality Gate)

The Python validator enforces, per feature:

- **≥1** acceptance criterion
- **≥1** AC with `kind: "happy"`
- **Core** priority features additionally need **≥1** AC with `kind: "edge"` or `kind: "error"`

Violations exit with `[REJECT] feature ...: needs ≥1 edge|error AC (coverage rule)`.

## NEVER Generate (Scope Discipline)

These items are excluded from every section of every PRD:

- Development priorities, milestones, timelines, workflow, personas-as-marketing
- Infrastructure provisioning details

**Business metrics / success targets — excluded entirely.** Do NOT generate
any of the following, in any section, in any wording:

- Success Metrics / KPI / 목표지수 / 성공 지표
- DAU / MAU / WAU / active-user targets
- Retention / 리텐션 / Churn / 이탈률 targets
- Conversion / 전환율 / signup conversion targets
- LTV / CAC / ARPU / ARR / MRR / payback-period figures
- Adoption rate / Stickiness / DAU:MAU ratio targets
- NPS / CSAT / satisfaction score targets
- Performance benchmarks framed as **business goals** (e.g., "reach <200 ms P95 to hit SLA")

**Technical specifications remain allowed** when they define the system
contract: response-time targets on a specific endpoint, page-size limits,
timeouts, max upload size, rate-limit thresholds, pagination defaults. These
describe how the system behaves, not what business outcome it commits to.
The `prd-validator` flags violations as `[SCOPE_VIOLATION]`.

## Cross-Section Consistency (enforced by Python where mechanical)

The Python script enforces:

- `meta.platforms` ↔ presence of `backend_specifics`/`mobile_specifics`
- `meta.platforms` includes `backend` ↔ `endpoint_specs` non-empty
- UI platforms (`web`/`mobile`) ↔ at least one matching `surface_details` entry
- `features[].dependencies` resolve to known feature names

The agent is responsible for the rest:

1. Every feature in `features[]` is implemented by at least one
   `surface_details[]` entry (UI platforms) or `endpoint_specs[]` entry (backend)
2. Every `surface_details[].implements` reference exists in `features[]`
3. Roles in `roles.definitions` appear consistently in `permission_matrix`,
   `surface_details[].access`, `data_access_scoping`
4. Entities in `data_model.entities` are referenced by at least one feature
   or endpoint

The `prd-validator` agent verifies these post-generation.

## Writing Guidelines

1. **Body language is Korean**. Section headers are bilingual Korean + English (rendered automatically by Python).
2. **Be specific**. Banish vague phrasing — replace "so the user can use it well" with measurable criteria like "after F-001 is added, visual feedback appears at the top of the list within 0.5s".
3. **User-perspective wording**. Describe what the user does, not how the system is implemented.
4. **Development-ready detail**. A developer must be able to start coding from this document alone, without back-channel clarification.
5. **Use real versions**. `tech_stack.*.items[].version` must be extracted from `package.json` (or the relevant sub-package's `package.json` in a monorepo). Do not invent or stale-cache versions.
6. **No page-length limits**. Python always emits every section in full; do not branch on project size or scale.
