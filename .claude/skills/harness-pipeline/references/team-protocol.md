# Team Protocol

## Teammate Execution Steps

> **This section is auto-injected by the lead when spawning teammates.**
> **Teammates do NOT invoke `/harness-pipeline` themselves.**

| Step | Action | Sub-Agent |
|------|--------|-----------|
| 1 | Read `CLAUDE.md`, `docs/PROJECT-STRUCTURE.md`, assigned task file. Load the CA template for the project's framework type from `.claude/skills/project-structure/references/` | — |
| 2 | Run `unit-test-writer` sub-agent (Red Phase). **NEVER analyze patterns or write test code yourself — always delegate to the `unit-test-writer` subagent.** | `Agent(subagent_type="unit-test-writer")` |
| 3 | Implement code to pass tests (Green Phase) → run the project's test command (see CLAUDE.md Commands). **Follow CA Inside-Out order**: Domain → Application → Infrastructure → Presentation. **If UI task**: implement component structure and behavior only — do NOT apply design tokens or visual styling. Lead handles design application via `ux-design-lead` after all teammates complete. | — |

> **Library Documentation Lookup (Step 3)**: Before calling external library APIs, verify correctness via context7 MCP.
> Use `resolve-library-id` → `query-docs` when: first use of external library API in this session, uncertain about installed version's API, or test failure suggesting wrong API usage.
> Skip for: language built-ins, already-verified libraries, internal modules, type-only imports.
| 4 | Run the project's coverage command (see CLAUDE.md Commands) | — |
| 5 | Commit per [workflow-commits.md](../../git/references/workflow-commits.md) | — |
| 6 | Message lead: files changed, test results, remaining issues | — |

## File Ownership Rules

- **ONLY modify files** assigned to you
- **NEVER touch** files owned by another teammate
- **Shared files** (barrel `index.ts`, `routes.ts`): message lead before modifying
- **New files**: create freely within your task scope
- **Do NOT create branches** — work on the feature branch created by lead

## Communication Protocol

| Event | Action |
|-------|--------|
| Task complete | Message lead with summary |
| Blocked by another task | Message lead, pick up next task |
| Found issue in shared code | Message lead (don't fix directly) |
| Need design decision | Message lead with options + recommendation |

## Merge Strategy

```
main
 └── development
      └── {working-branch}  ← single branch, all teammates work here
           ├── teammate-A commits (owns: file-list-A)
           ├── teammate-B commits (owns: file-list-B)
           └── teammate-C commits (owns: file-list-C)

After all teammates done → Phase 3
```

### Git Conventions

See [workflow-commits.md](../../git/references/workflow-commits.md)

## Cost Notes

- **Teammates**: Use `opus` model — NO `code-reviewer` per teammate (TDD cycle is the quality gate, lead handles all review in Phase 3)
- **Lead**: Runs `code-reviewer` + `e2e-tester` as the single review gate post-merge
- Minimize sub-agent calls per teammate
- Avoid broadcast messages — message lead directly
