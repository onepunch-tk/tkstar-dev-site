# ROADMAP Input JSON Schema (Authoritative: Python dataclasses)

Authoritative source: `scripts/generate_roadmap.py` dataclasses. Outline:

```jsonc
{
  "meta": {
    "project_name": str,
    "doc_version": str,
    "prd_path": "docs/PRD.md"
  },
  "overview": {
    "summary": str,                 // one-liner shown under the H1 title
    "core_features": [str]          // 3-5 bullets
  },
  "phases": [{
    "id": "P1",                     // /^P\d+$/
    "title": str,
    "description": str,             // optional narrative
    "status": "Pending"|"InProgress"|"Completed",
    "task_ids": ["T001","T002"]     // every member must appear in tasks[]
  }],
  "tasks": [{
    "id": "T001",                   // /^T\d{3}$/
    "slug": "route-structure",      // lowercase kebab-case
    "title": str,                   // free Korean
    "branch_type": "feature"|"fix"|"chore"|"docs"|"refactor"|"test",
    "phase_id": "P1",
    "status": "Pending"|"Priority"|"InProgress"|"Completed",
    "purpose": str,                 // 2-4 sentences
    "prd_feature_ids": ["F001"],    // must exist in docs/PRD.md
    "blocked_by": ["none"|"T###"],
    "blocks": ["none"|"T###"],
    "io_contract": str,             // markdown, free-form Korean
    "sequence": [str],              // 3-10 lines, plain text
    "edge_cases_impl": str,         // markdown — most detailed section
    "dod": [{"text": str, "completed": bool}],
    "open_questions": [{"text": str, "default": str|null, "needs_user": bool}],
    "change_history": [{"date": str, "changes": str, "author": str}]
  }],
  "prd_feature_coverage": [{
    "feature_id": "F001",
    "feature_name": str,
    "task_ids": ["T001","T002"]
  }],
  "dependency_graph_render": "mermaid"|"text"|"none"
}
```

## Validation Rules (Python-Enforced — `[REJECT]` triggers)

- **Schema** — required fields missing, wrong types, invalid enum values
- **ID format** — `T###` for tasks, `P\d+` for phases, `F###` or `F-XXX-###` for PRD features
- **Slug shape** — lowercase kebab-case
- **Uniqueness** — task IDs unique, no task listed in multiple phases
- **Phase ↔ Tasks consistency** — every `phase.task_ids[]` exists in `tasks[]`, every task's `phase_id` matches the phase that lists it
- **Dependency DAG** — no cycles in `blocked_by` ∪ `blocks` graph; references resolve to known task IDs
- **Sequence length** — 3-10 lines
- **DoD non-empty** — ≥1 item per task
- **Completed consistency** — `status="Completed"` ⇒ all DoD items `completed=true` AND `change_history` non-empty
- **PRD cross-check** — every `prd_feature_ids[]` appears in `docs/PRD.md` (parsed from `#### F001 — ...` headings); skipped with a warning if PRD is missing
