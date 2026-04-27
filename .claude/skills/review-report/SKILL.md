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
| `.claude/runtime/reviews/code/` | Unified code review report (quality + security + performance) |
| `.claude/runtime/reviews/design/` | Design review report (when called by `ux-design-lead`) |

Reports are **ephemeral** — written to a gitignored runtime directory, not committed. They serve as an autocompact-resilient checklist for the main agent within the current Phase 3, then are discarded with the rest of the harness runtime state on PR merge. Permanent record of resolved issues lives in the PR description, not in the repo.

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

```bash
TYPE_DIR=".claude/runtime/reviews/code"   # or ".claude/runtime/reviews/design"
mkdir -p "$TYPE_DIR"
# Write the report to "$TYPE_DIR/${FILENAME}"
```

The directory is gitignored (`.claude/runtime/`). Do NOT `git add` or commit the report.

### 7. Return Tool Result Summary (MANDATORY)

After saving the report, return a structured summary to the parent agent in your tool result so the parent can act on findings without re-reading the file. The file remains as the autocompact-resilient checklist; the summary is the immediate work signal.

Required summary fields (in your final assistant message):

```
report_path: .claude/runtime/reviews/code/<commit_hash>_<YYYYMMDD>.md
issue_count: <integer — total findings across all severities>
severity_breakdown:
  critical: <int>
  high: <int>
  medium: <int>
  low: <int>
top_issues:
  - <severity> | <location> | <one-line problem statement>
  - ...   (up to 5 most important — favor critical/high)
```

The parent agent (or harness-pipeline Phase 3 main flow) takes this summary and:
1. Sets `pipeline-state.json.review_unresolved_count = issue_count` (or `design_review_unresolved_count` for design reports) using `jq` in-place.
2. Begins fixing issues, decrementing the counter as each is resolved.
3. When the counter hits 0, Phase 4 transition is unblocked by `phase-gate.sh`.

**Why a summary, not just a file**: the file alone forces the parent to Read it back, costing tokens and turn-time. The summary is the immediate hand-off; the file is the persistence layer that survives autocompact.

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
