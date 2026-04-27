# Git Issue

Create a GitHub Issue. **GitHub Mode only** — requires `Remote Platform: GitHub` in CLAUDE.md.

## Language Rule

> **Issue title and body MUST be written in the user's language** (detected from conversation context).
> Template section headers (Description, Tasks, etc.) remain in English for consistency.

## Agent Role (intelligence)

1. Determine Issue title from task context (emoji prefix + description **in user's language**)
2. Fill in the template below (**content in user's language**, headers in English)
3. Select label matching the type

| Type | Label | Emoji |
|------|-------|-------|
| feature | `enhancement` | ✨ |
| bug | `bug` | 🐛 |
| docs | `documentation` | 📝 |
| refactor | `refactor` | ♻️ |

## Issue Body Template (MUST follow)

```markdown
## Description
{task description — in user's language}

## Tasks
- [ ] {specific task item 1}
- [ ] {specific task item 2}

## Acceptance Criteria
- {completion criteria 1}
- {completion criteria 2}

## Related
- {related Issue/PR if any, otherwise omit this section}
```

## Execution (delegate to script)

```bash
.claude/hooks/git-issue.sh \
  --title "<emoji> <description in user's language>" \
  --body "<body following template above>" \
  --label "<label>"
```

Script handles automatically: prerequisite checks, duplicate detection, issue creation, number extraction.

**Last line of output**: `ISSUE_NUMBER=42` — parse this for branch naming.
