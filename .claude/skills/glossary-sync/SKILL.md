---
name: glossary-sync
description: |
  Manual full-rescan of `docs/glossary.md` from PRD / ROADMAP / source code.
  Invoked via `/glossary-sync`. Detects new domain nouns and technical verbs,
  surfaces conflicts (same English identifier ↔ different Korean phrase, or
  vice versa) via `AskUserQuestion`, and writes confirmed entries back to
  `docs/glossary.md`.
---

# Glossary Sync

> **When to invoke**: User explicitly runs `/glossary-sync`. The harness does
> NOT call this skill automatically — automatic paths are `prd-generator`
> seed (post-PRD), `development-planner` augment (post-ROADMAP), and the
> `post-commit-glossary-sync.sh` hook (warn-only diff). Use this skill when
> the agent suspects glossary drift after manual edits, or when onboarding
> an existing codebase that pre-dates the glossary system.

## Inputs

- `docs/glossary.md` — current Ubiquitous Language SoT (read + write)
- `docs/PRD.md` (if present) — domain noun source
- `docs/ROADMAP.md` (if present) — feature/task verb source
- `src/**/*.{ts,tsx}` — actual code identifiers (read-only)

## Procedure

### Step 1 — Snapshot current glossary

Read `docs/glossary.md`. Build two in-memory maps:

```
domain_entities: Map<english_id, { korean, definition, forbidden[] }>
technical_verbs: Map<english_id, { korean, definition, forbidden[] }>
```

### Step 2 — Extract candidates

- **PRD domain nouns**: noun phrases that name a business concept
  (entities, value objects, aggregates). Heuristic — capitalized
  multi-word phrases or repeated Korean nouns.
- **ROADMAP/task technical verbs**: action verbs in task subjects
  (`run`, `create`, `validate`, `sync`...). Strip tense and conjugation.
- **Source code identifiers**: exported class / function / type names
  in `src/domain/**` and `src/application/**`. Use the layer convention
  from `ca-rules`. Skip Infrastructure/Presentation — they are
  framework-shaped and pollute the domain vocabulary.

### Step 3 — Diff against glossary

For each candidate:

1. **Already present (exact match)** → skip
2. **New entry** → stage for confirmation
3. **Conflict** (same English id, different Korean phrase OR same
   Korean phrase, different English id) → stage for `AskUserQuestion`

### Step 4 — Conflict resolution (interview-protocol)

For each conflict, call `AskUserQuestion` with options:

- Keep current glossary entry (ignore code/doc usage)
- Replace glossary entry with code/doc usage
- Keep both as separate entries with disambiguating qualifier
- Reject candidate (mark code/doc usage as wrong — produce a TODO)

> **Korean phrasing**. Group ≤ 4 conflicts per call. See
> [`interview-protocol/SKILL.md`](../interview-protocol/SKILL.md) §"Ask one
> focused batch at a time".

### Step 5 — Stage new entries

For each new entry without conflict, ask the user once for:

- Korean canonical phrase
- One-line definition
- Forbidden synonyms (optional — if user lists deprecated phrasings)

Default to skipping the entry if the user is unsure (`AskUserQuestion`
includes "Skip — not a glossary candidate").

### Step 6 — Write back

Reorder rows alphabetically by English identifier within each table.
Preserve the file's preamble verbatim. Use `Edit` (not `Write`) to keep
diff scope tight.

### Step 7 — Report

Print a Korean summary:

```
## /glossary-sync 결과
- 신규 추가: N개 (Domain Entities n, Technical Verbs m)
- 충돌 해결: N건
- 건너뜀: N개
- 변경된 파일: docs/glossary.md
```

If the file diff is empty (no new entries, no conflicts), print
`Glossary 는 이미 일치합니다.` and exit.

## Out of scope

- Multi-language (Korean only — see plan §Out of Scope)
- Per-entry history tracking — git log on `docs/glossary.md` is the
  authoritative history
- LLM API cost optimization for the rescan — full re-read each invocation
- Auto-renaming source identifiers to match glossary — surface as TODO,
  do not edit code

## Anti-patterns

- ❌ Silently overwriting an existing entry — always go through
  `AskUserQuestion` on conflict
- ❌ Adding speculative entries the user didn't confirm
- ❌ Editing PRD/ROADMAP from this skill — glossary is the only write target
- ❌ Running in background sub-agent context — `AskUserQuestion` fails
  silently (see `interview-protocol/SKILL.md` §"Background mode is
  incompatible")
