---
name: prd
description: PRD generation rules, platform-specific templates, and consistency validation for Web, Backend, Mobile, and multi-platform projects.
---

# PRD Generation Rules & Templates

Platform-specific PRD generation rules, output templates, and consistency validation for Small and Medium scale projects.

## Platform Detection

Identify the target platform(s) from the user's input:

| Signal | Platform |
|--------|----------|
| "web app", "website", "React Router", "Next.js", "SPA", page/menu mentions | **Web** |
| "API", "backend", "server", "REST", "GraphQL", "NestJS", "microservice", endpoint mentions | **Backend** |
| "mobile app", "iOS", "Android", "Expo", "React Native", screen/tab mentions | **Mobile** |
| Multiple platforms mentioned, "full-stack with mobile", "backend + web" | **Multi-platform** |

If the user does not specify a platform, default to **Web**.

## Template & Rules Selection

| Platform | Rules File | Template File |
|----------|-----------|---------------|
| Web (React Router) | `references/web.rules.md` | `references/web.template.md` |
| Backend/API (NestJS) | `references/backend.rules.md` | `references/backend.template.md` |
| Mobile (Expo) | `references/mobile.rules.md` | `references/mobile.template.md` |
| Multi-platform | `references/multi-platform.rules.md` | (use per-platform templates) |

For multi-platform projects, read `multi-platform.rules.md` **in addition to** each detected platform's rules and template files.

## Scale Detection

Before generating the PRD, determine the project scale from the user's request:

**-> Small** (default):
- Solo developer / personal project
- Single user role or no role distinction
- Simple CRUD operations
- Limited scope (5-15 features)
- No complex auth requirements

**-> Medium**:
- User explicitly mentions "medium" or "large-scale project"
- Multiple user roles mentioned (admin, seller, buyer, driver, etc.)
- Complex domain with 3+ feature groups
- Mentions dashboards, management panels, or multi-tenant
- 10-25+ features with domain grouping needed

If ambiguous, default to **Small**.

## Common MUST Generate Sections (All Platforms)

### 1. Project Core

**Small** (2-3 items):
- **Purpose**: Core problem this project solves (1 line)
- **Target Users / Consumers**: Specific user segment or API consumer (1 line)
- **Scope Note**: Key constraint or boundary, if any (1 line, optional)

**Medium** (4-6 items):
- **Purpose**: Core problem this project solves (1 line)
- **Target Users / Consumers**: Specific user segments by role or consumer type (1-2 lines)
- **Key Constraints**: Technical or business constraints (1 line)
- **Scale Indicator**: Expected user count range, request volume, or data volume (1 line)

### 4. Feature Specifications - Consistency Baseline (Common Format)

- Include features as scoped by the user, categorized by priority
- Categorize features by priority: Core (must-have), Support (should-have), Deferred (nice-to-have)
- **MUST assign Feature ID to each feature**
- **MUST specify implementation location** (page name / endpoint group / screen name per platform)

**Small**: Sequential IDs -> `F001, F002, F003...`
**Medium**: Domain-grouped IDs -> `F-AUTH-001, F-ORDER-001, F-ADMIN-001...`
- Group features by domain
- Include **Auth Level** column indicating required role

### 7. Data Model (Common Format)

**Small**:
- List only required table/model names
- 3-5 core fields per table (field names only, no types)

**Medium**:
- List all required tables with descriptions
- 5-10 fields per table with types and relations
- Indicate foreign key relationships with `-> [Model].id`
- Include a brief entity relationship summary

### Tech Stack (Latest Versions Required)

- Detailed tech stack categorized by purpose
- **MUST resolve versions from package.json** before writing
- Platform-specific default stacks are defined in each platform's rules file

## Version Resolution Rule

**BEFORE writing any tech stack section**, you MUST:

### Step 1: Workspace Detection
Check if the project uses a monorepo/workspace structure:

1. **Detection signals** (check in order):
   - `turbo.json` exists at project root -> Turborepo
   - `pnpm-workspace.yaml` exists at project root -> pnpm workspaces
   - Root `package.json` contains `workspaces` field -> npm/yarn/bun workspaces

2. **If monorepo detected**: Identify the target sub-package based on the work context:
   - Web/Frontend: Look for directory containing `react-router.config.ts` or `next.config.*`
   - Mobile: Look for directory containing Expo config (`app.config.ts`, `app.config.js`, or `app.json` with `expo` key) AND `expo` in `package.json` dependencies
   - Backend/API: Look for directory containing `nest-cli.json`
   - Read that sub-package's `package.json` for version resolution
   - Fall back to root `package.json` only for shared dependencies

3. **If single project**: Read root `package.json` as normal

### Step 2: Version Resolution
1. Use the versions found in the identified `package.json` as the authoritative source
2. Only fall back to the versions listed in the platform rules if `package.json` does not exist or does not include the relevant package

> The hardcoded versions in agent definitions are **defaults only**. Always prefer real project versions.

## User Override Principle

If the user or main agent explicitly specifies a different tech stack, prioritize their choice over the defaults. The default stack applies only when no explicit preference is given.

## NEVER Generate (All Platforms)

These items are ALWAYS excluded regardless of scale or platform:

- Development priorities
- Infrastructure provisioning details
- Milestones or timelines
- Development workflow
- Personas

**Business metrics / success targets — excluded entirely.** The PRD captures product characteristics (problem, users, features, acceptance criteria, UX flows, tech stack). It does NOT forecast or commit to business outcomes. Do NOT generate any of the following, in any section:

- Success Metrics / 성공 지표 / KPI / 목표지수 sections
- DAU / MAU / WAU / active-user targets
- Retention rate / 리텐션 / Churn rate / 이탈률 targets
- Conversion rate / 전환율 / signup conversion targets
- LTV / CAC / ARPU / ARR / MRR / payback-period figures
- Adoption rate / Stickiness / DAU:MAU ratio targets
- NPS / CSAT / satisfaction score targets
- Performance benchmarks that are framed as business goals (e.g. "reach <200 ms P95 to hit SLA").

**Technical specifications remain allowed** when they define the system contract: response-time requirements on a specific endpoint, page-size limits, timeouts, max upload size, rate-limit thresholds, pagination defaults. Such numbers describe how the system behaves, not what business outcome it aims for.

The `prd-validator` enforces this by grepping for the prohibited keywords above and tagging any match as `[SCOPE_VIOLATION]`.

**Included in Medium only (excluded from Small):**
- Authentication & Authorization / RBAC section
- Platform-specific Medium-only sections (see each platform's rules file)

## Document Consistency Principles

**All sections must be cross-referenced and maintain consistency:**

1. **All features in Feature Specifications** must be implemented in the platform-specific structure section (pages/endpoints/screens)
2. **All items in the structure section** must be defined in Feature Specifications
3. **All items in the navigation/menu/endpoint group** must have corresponding detail entries
4. **No omissions**: Features that exist in only one section are strictly prohibited
5. **No duplication**: Same features must not be scattered across multiple locations
6. **(Medium) All roles** must have corresponding access rules throughout the document
7. **(Multi-platform) Feature IDs** must be consistent across all platform sections

## Writing Guidelines (All Platforms)

1. **Specificity**: Use precise descriptions, not generic terms
2. **User/Consumer Perspective**: Focus on what users do, not technical implementation
3. **Development Ready**: Level where developers can start coding just by reading this document
4. **Feature Scoping**: Categorize features by user-specified scope and priority
5. **Latest Tech**: **MUST resolve versions from package.json** before writing tech stack
6. **Page Limits**:
   - Small: Maximum **2 A4 pages**
   - Medium: Maximum **5 A4 pages**
   - Multi-platform: Maximum **8 A4 pages** (combined)
