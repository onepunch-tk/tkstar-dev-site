---
name: review-report
description: |
  Standardized review-finding format for the code-reviewer and ux-design-lead
  sub-agents. Defines severity levels, confidence filtering, and the structured
  summary returned to the parent agent.
model: sonnet
allowed-tools:
  - Read
user-invocable: false
---

# Review Report Skill

Standardizes how reviewer sub-agents (`code-reviewer`, `ux-design-lead`) report findings to the parent agent. Findings are returned as a structured **tool-result summary** — no files are written. The parent agent uses the summary to drive `pipeline-state.json.review_unresolved_count` (or `design_review_unresolved_count`) and to begin fixing.

---

## Workflow

### 1. Load Template

Load `references/report-template.md` as the issue-classification structure (severity / domain / confidence dimensions and language conventions).

### 2. Collect Issues

Each finding must include:

- **severity**: critical | high | medium | low
- **domain**: quality | security | performance (code review) — or design-system / accessibility / responsiveness (design review)
- **confidence**: high (90%+) | medium (70-89%) | low (<70%)
- **location**: `file:line`
- **category**: issue classification
- **problem**: problem description
- **impact**: why it matters
- **suggestion**: how to fix
- **evidence**: code snippet or reference
- **references**: documentation links (optional)

### 3. Apply Confidence Filtering

| Confidence | Treatment |
|------------|-----------|
| High (90%+) | Include in main findings |
| Medium (70-89%) | Include in main findings with advisory note |
| Low (<70%) | Mention as advisory only |

### 4. Return Tool Result Summary (MANDATORY)

The summary returned in your final assistant message is the immediate work signal for the parent agent. The sub-agent itself does not persist findings to disk — the parent agent records `issue_count` into `pipeline-state.json` so the counter survives across turns and sub-agent boundaries.

Required summary fields:

```
issue_count: <integer — total findings across all severities>
severity_breakdown:
  critical: <int>
  high: <int>
  medium: <int>
  low: <int>
top_issues:
  - <severity> | <location> | <one-line problem statement>
  - ...   (up to 5 most important — favor critical/high)
findings:
  - severity: <level>
    domain: <domain>
    confidence: <level>
    location: <file:line>
    category: <category>
    problem: <description>
    impact: <why it matters>
    suggestion: <how to fix>
    evidence: <code snippet or reference>
  - ...   (one entry per included finding)
```

The parent agent (or harness-pipeline Phase 3 main flow):

1. Sets `pipeline-state.json.review_unresolved_count = issue_count` (or `design_review_unresolved_count` for design reports) using `jq` in-place.
2. Begins fixing issues, decrementing the counter as each is resolved.
3. When the counter hits 0, Phase 4 transition is unblocked by `phase-gate.sh`.

`top_issues` is the at-a-glance triage list; `findings` is the actionable detail. The parent reads `findings` directly from the tool result — no file round-trip needed.

---

## Severity Definitions

| Level | Emoji | Definition | Required Action |
|-------|-------|------------|-----------------|
| Critical | 🔴 | Bugs, security vulnerabilities, production blockers | Must fix before merge |
| High | 🟠 | Important issues affecting maintainability/security | Should fix before merge |
| Medium | 🟡 | Code quality issues, potential problems | Fix soon |
| Low | 🟢 | Style suggestions, minor improvements | Optional |

---

## Reference Template

- [Report Template](references/report-template.md) — finding-classification language and category vocabulary used inside the structured summary.
