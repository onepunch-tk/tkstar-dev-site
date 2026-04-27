---
name: review-report
description: |
  Generates standardized review reports for the code-reviewer agent.
  Called by reviewer agents to produce consistent, structured report output.
model: sonnet
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
---

# Review Report Skill

Generates a standardized unified review report for the code-reviewer agent.

---

## Output

| Location | Description |
|----------|-------------|
| `docs/reports/code-review/` | Unified review report (quality + security + performance) |

---

## Workflow

### 1. Get Commit Hash and Date
```bash
COMMIT_HASH=$(git rev-parse --short HEAD)
DATE=$(date +%Y%m%d)
FILENAME="${COMMIT_HASH}_${DATE}.md"
```

### 2. Load Template
Load `references/report-template.md` as the report structure.

### 3. Collect Issues
Collect issues from the calling agent with required fields:
- **severity**: critical | high | medium | low
- **domain**: quality | security | performance
- **confidence**: high (90%+) | medium (70-89%) | low (<70%)
- **location**: file:line
- **category**: issue classification
- **problem**: problem description
- **impact**: why it matters
- **suggestion**: how to fix
- **evidence**: code snippet or reference
- **references**: documentation links (optional)

### 4. Apply Confidence Filtering
| Confidence | Treatment |
|------------|-----------|
| High (90%+) | Include in main findings tables |
| Medium (70-89%) | Include in main findings with advisory note |
| Low (<70%) | Include in Advisory section only |

### 5. Generate Report
Apply collected data to the template and generate the markdown report.

### 6. Save Report
Save to `docs/reports/{code|design}-review/{commit_hash}_{YYYYMMDD}.md`.

### 7. Stage and Commit the Report (MANDATORY)

Immediately after saving, stage and commit the report so it becomes
branch-scoped from the first review cycle:

```bash
TYPE_DIR="docs/reports/code-review"   # or "docs/reports/design-review"
git add "$TYPE_DIR/${FILENAME}"
git commit -m "📝 docs(review): ${TYPE_DIR##*/} report for ${COMMIT_HASH}"
```

**Why this matters**: the `phase-gate.sh` Gate 2 hook uses
`git diff --name-only origin/development...HEAD` to find reports this
branch has produced. Until the report is committed, it is untracked and
invisible to the hook — the review-phase commit reminder will not fire
on subsequent fix commits, and any ignored `- [ ]` items will only be
caught at the `review → validate` transition (Gate 1, hard block). A
report that is committed immediately lets Gate 2 remind the author to
tick checkboxes inside the same fix commit that resolves the issue.

Skipping this step is a **hook-alignment bug**, not a stylistic choice —
both `code-reviewer` and `ux-design-lead` (design-review mode) depend
on it. If the calling agent lacks shell access, it MUST return the
report path + intended commit message to the parent agent and request
the commit explicitly.

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

- [Report Template](references/report-template.md)
