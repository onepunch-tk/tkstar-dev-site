---
name: project-structure
description: |
  Generate or update docs/PROJECT-STRUCTURE.md via a Python-backed, single
  unified template. Supports React Router Framework, Expo Router, NestJS,
  and Tauri 2 across single-package and monorepo layouts. The renderer
  enforces scope discipline — data model, features, code snippets, and
  tech-stack recommendations are rejected as PRD-territory.
user-invocable: false
---

# Project Structure Skill (Python-Backed)

The PROJECT-STRUCTURE.md document is rendered by a deterministic Python
script from a structured input JSON. The agent's job is to **detect** the
codebase layout, **interview** the user on ambiguous points, and write a
complete `docs/.harness/project-structure-input.json`; the script does all
markdown formatting, section ordering, schema validation, and scope
enforcement.

## Mandatory Workflow

1. **Pre-flight (Python)**
   ```bash
   python3 --version
   ```
   If `python3` is not on `PATH`, **STOP**. Report the blocker verbatim and
   do not attempt any workaround.

2. **Repo layout detection** — run [`monorepo-detection`](../monorepo-detection/SKILL.md).
   Result feeds `meta.repo_layout` (`single` | `monorepo`) and `meta.monorepo_tool`.

3. **Framework detection per sub-package** — run
   [`framework-detection`](../framework-detection/SKILL.md)
   inside each candidate directory. Map the result:

   | Detected framework | JSON `framework` value |
   |---|---|
   | `react-router` | `react-router` |
   | `expo` | `expo` |
   | `nestjs` | `nestjs` |
   | `tauri` | `tauri` |
   | `nextjs` / `remix` / `vite-react` / `unknown` | **Pass 1 question** — user picks the closest supported framework (never write the raw value) |

4. **Variant resolution** — for frameworks with variants, prepare a Pass 1
   question and never guess silently:
   - `nestjs`: `layer-first` vs `module-first` (heuristic: `src/modules/<name>/` exists → module-first candidate)
   - `tauri`: `rust-only` / `react+rust` / `vue+rust` / `svelte+rust` / `mobile-enabled` (heuristic: detect frontend framework inside `src/`; `src-tauri/gen/{apple,android}/` for mobile)

5. **Interview** — see `interview-protocol` skill. Sub-agent
   (`project-structure-generator`) runs Pass 1 enumeration → main agent
   interviews → Pass 2 render. Minimum confirmation areas:
   - Detection results (framework + monorepo + sub-package list)
   - CA layer mapping per sub-package
   - Framework variant per sub-package
   - Unsupported-framework replacement choice (if any)

6. **Write input file**
   ```
   Write tool → docs/.harness/project-structure-input.json
   ```
   Use the Write tool (clean JSON, no Bash heredoc).

7. **Invoke Python**
   ```bash
   python3 .claude/skills/project-structure/scripts/generate_project_structure.py \
     --input docs/.harness/project-structure-input.json \
     --output docs/PROJECT-STRUCTURE.md
   ```

8. **Handle `[REJECT]`** — script exits non-zero with one
   `[REJECT] <reason>` line on stderr. Read the reason, fix the JSON, re-run.
   **Maximum 2 retry attempts.** After that, surface to the user and ask
   for guidance.

> **Output location is fixed**: always `docs/PROJECT-STRUCTURE.md`. The
> script auto-backs up any existing file to
> `docs/PROJECT-STRUCTURE.md.bak.<timestamp>` before overwriting.

## JSON Input Schema + Validation Rules

Authoritative source: `scripts/generate_project_structure.py` dataclasses. Field-by-field outline and the full `[REJECT]` trigger list live in [`references/input-schema.md`](references/input-schema.md). Top-level keys: `meta` / `overview_ko` / `sub_packages[]` (each with `framework`, `framework_variant`, `directory_tree`, `layers[]`, `path_aliases[]`, `framework_extras[]`, `file_location_summary[]`).

## NEVER Generate (Scope Discipline)

The PROJECT-STRUCTURE document describes **directory structure + layer
mapping** only. The following belong to PRD and are excluded:

- **Data model / entity definition** (PRD §7) — entity names, fields,
  relationships, ERDs
- **Features / business logic / user flows** (PRD §3·§4) — what the system
  does, how policies are enforced, user journeys
- **Code examples / implementation snippets** — TypeScript / Rust code
  showing class bodies, function bodies, etc. Directory names like
  `class-helpers/` are fine, but `class User {}` is not.
- **Tech stack recommendations** (PRD `tech_stack`) — "Use Zustand for
  state", "Prefer TanStack Query", etc.
- **NFR / performance targets** (PRD `nfr`) — "P95 < 200ms", SLA figures.

The Python script enforces these via `DISALLOWED_TOP_LEVEL_KEYS` and code-
token regex. Agents drafting the JSON should also remove these proactively
during Pass 2.

## Monorepo Output Convention

When `repo_layout=monorepo`:

- A single `docs/PROJECT-STRUCTURE.md` is rendered at repo root.
- Each sub-package gets an `## {name} — {framework} ({variant})` H2 section.
- Each H2 contains: directory tree fence, CA layer map table, path
  aliases table, optional framework-conventions subsection, and per-
  sub-package file location summary.
  (The rendered Korean section headings are emitted by the Python script;
  the agent only writes the structured JSON fields.)

When `repo_layout=single`:

- A top-level "directory structure" section wraps the one sub-package.
- The same H3 subsections (tree / layer map / aliases / conventions /
  file summary) appear once.

## Sub-agent integration

The skill is invoked by the `project-structure-generator` sub-agent which
implements the 2-pass interview pattern (Pass 1 enumeration + Pass 2
render). The harness pipeline auto-invokes this skill in **Phase 1 Step 1a**
when `docs/PROJECT-STRUCTURE.md` is missing, and in **Phase 4 Step 14c**
when `doc-structure-linter.sh` reports drift.

## Reference templates (framework guides — not runtime placeholders)

Per-framework reference docs live under `references/`:

| Framework | Reference |
|---|---|
| React Router Framework v7+ | [`references/react-router.template.md`](./references/react-router.template.md) |
| Expo Router + RN | [`references/expo.template.md`](./references/expo.template.md) |
| NestJS | [`references/nestjs.template.md`](./references/nestjs.template.md) |
| Tauri 2 | [`references/tauri.template.md`](./references/tauri.template.md) |

These are **read-only guidance** for the sub-agent when filling JSON
fields (directory tree shape, path alias conventions, framework extras
candidates). They are NOT placeholder templates — markdown rendering is
always done by Python from the JSON.

## Writing Guidelines

1. **Body language is Korean**. Section headers may be bilingual (rendered
   automatically by Python). Code identifiers, paths, alias names stay ASCII.
2. **Describe directories only**. If you find yourself naming an entity,
   describing a feature, or pasting code — stop. That belongs in PRD.
3. **Use real paths**. Trees must reflect what is actually on disk (post-
   detection), not aspirational structure. Aspirational targets belong in a
   separate `## Target Structure` section if needed (out of scope for v1).
4. **Variants are user decisions**. Heuristic detection produces a
   suggestion; the user confirms (Pass 1 question is mandatory).
5. **Unsupported frameworks** never reach the JSON. Either the user picks a
   closest supported one in Pass 1, or the operation is blocked.
