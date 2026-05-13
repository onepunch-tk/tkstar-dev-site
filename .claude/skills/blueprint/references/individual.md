# Individual modes — single-doc operations

Each individual mode is a subset of [bootstrap.md](bootstrap.md). Same Pass 1/2
cycle and same issue-decision flow apply.

## `prd` mode

Sequence: `prd-gen → prd-validate → complete`

- Run bootstrap Step 1 (`prd-gen`), then Step 2 (`prd-validate`), then advance to `complete`.
- `args_seed` → `prd-generator`.

## `project-structure` mode

Sequence: `ps-gen → complete`

- Run bootstrap Step 3 (`ps-gen`), then advance to `complete`.
- No validator exists for this doc — Pass 2 success is final.
- `args_seed` → `project-structure-generator`.

## `roadmap` mode

Sequence: `roadmap-gen → roadmap-validate → complete`

**Precondition** (already checked in `SKILL.md` Phase 1): `docs/PRD.md` must
exist. If absent at runtime, abort with a hint to run Bootstrap first.

- Run bootstrap Step 4 (`roadmap-gen`), then Step 5 (`roadmap-validate`), then advance to `complete`.
- `args_seed` → `roadmap-generator`.

---

## args_seed routing summary

| mode | seed target |
|------|-------------|
| `prd` | `prd-generator` Pass 1 prompt |
| `project-structure` | `project-structure-generator` Pass 1 prompt |
| `roadmap` | `roadmap-generator` Pass 1 prompt |

If `args_seed` is `null`, omit the seed line from the Pass 1 prompt; the
subagent's interview will collect intent through its standard enumeration.

---

## What stays the same as Bootstrap

- Pass 1 → AskUserQuestion → Pass 2 protocol.
- Validator issue-decision (수정 / 무시 / 종료) — `수정` rewinds to the matching `*-gen` phase.
- Phase-gate hook enforcement on renderer scripts and state writes.
- Final wrap-up (commit + PR + merge) from `SKILL.md`.
