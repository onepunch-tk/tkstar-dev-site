---
name: git
description: |
  Git automation skill. Provides task selection UI when /git command is executed.
  Choose from commit, push, sync, merge operations.
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - AskUserQuestion
---

# Git Automation Skill

Select a task when the `/git` command is executed.

## Argument Parsing

Parse the `args` parameter when the skill is invoked to separate the action and message.

### Parsing Rules

| Input Example | Parsing Result |
|---------------|----------------|
| (none) | action=none, message=none |
| `"Login feature"` | action=none, message="Login feature" |
| `commit` | action=commit, message=none |
| `commit "Login feature"` | action=commit, message="Login feature" |
| `sync` | action=sync, message=none |
| `sync "Login feature"` | action=sync, message="Login feature" |
| `push` | action=push |
| `merge` | action=merge |
| `issue` | action=issue, message=none |
| `issue "Login feature"` | action=issue, message="Login feature" |
| `pr` | action=pr, message=none |
| `pr "Login feature"` | action=pr, message="Login feature" |
| `release` | action=release, message=none |
| `release "v1.0.0"` | action=release, message="v1.0.0" |

### Parsing Method

1. If args starts with quotes → treat entire content as message (no action)
2. If args starts with `commit`, `sync`, `push`, `merge`, `issue`, `pr`, `release` → use that value as action, rest as message
3. Otherwise → no action, treat entire content as message

## Execution Flow

### 1. If no action → Display task selection UI

**Channel Detection**: When the request originates from an external channel message (`<channel source="plugin:discord:discord" ...>`):
- `AskUserQuestion` is unavailable (terminal only)
- Send task selection options as text via Discord reply, then wait for user's response
- Example reply:
  ```
  Select a git operation:
  1. commit — Analyze changes and commit
  2. push — Push current branch
  3. sync — add → commit → push full workflow
  4. merge — Trunk-based merge (current branch → main)
  ```

**Terminal**: Call AskUserQuestion tool to provide task selection UI.

#### GitHub Mode Detection

Before displaying options, check CLAUDE.md `Remote Platform` setting:
- `GitHub` → show all options including issue, pr, release
- Not set / empty → hide issue, pr, release options

#### If no message:

```json
{
  "questions": [
    {
      "header": "Git Task",
      "question": "Which Git operation would you like to perform?",
      "multiSelect": false,
      "options": [
        { "label": "commit", "description": "Analyze changes and commit" },
        { "label": "push", "description": "Push current branch" },
        { "label": "sync", "description": "Full workflow: add → commit → push" },
        { "label": "issue", "description": "Create GitHub Issue (GitHub Mode)" },
        { "label": "pr", "description": "Create PR + merge to development (GitHub Mode)" },
        { "label": "merge", "description": "Local merge to development (Local Mode)" },
        { "label": "release", "description": "Release: development → main PR + tag (GitHub Mode)" }
      ]
    }
  ]
}
```

> **Note**: `issue`, `pr`, `release` options are only shown when `Remote Platform: GitHub` is set in CLAUDE.md. `merge` is only shown when GitHub is NOT configured (Local Mode). In GitHub Mode, `/git merge` redirects to `/git pr`.

#### If message exists (e.g., `/git "Login feature"`):

```json
{
  "questions": [
    {
      "header": "Git Task",
      "question": "Which Git operation would you like to perform? (message: \"Login feature\")",
      "multiSelect": false,
      "options": [
        { "label": "commit", "description": "Commit with provided message" },
        { "label": "sync", "description": "add → commit → push with provided message" },
        { "label": "issue", "description": "Create Issue with provided message (GitHub Mode)" },
        { "label": "pr", "description": "Create PR with provided message (GitHub Mode)" },
        { "label": "push", "description": "Push current branch (message not used)" },
        { "label": "merge", "description": "Local merge to development (Local Mode, message not used)" },
        { "label": "release", "description": "Release with version (GitHub Mode)" }
      ]
    }
  ]
}
```

**When Other is selected from UI:**
- Treat input as message for commit/sync operations

### 2. If action exists → Execute that operation directly

| action | message | behavior |
|--------|---------|----------|
| commit | none | Auto-generate message and commit |
| commit | exists | Commit with provided message |
| sync | none | Auto-generate message then add → commit → push |
| sync | exists | add → commit → push with provided message |
| push | - | Push immediately |
| issue | none | Auto-generate title from context and create Issue |
| issue | exists | Create Issue with provided title |
| pr | none | Auto-generate PR body and create PR + merge |
| pr | exists | Create PR with provided description + merge |
| merge | - | Local Mode: merge to development. GitHub Mode: redirect to `/git pr` |
| release | none | Create release PR (development → main) + auto-detect version |
| release | exists | Create release PR with provided version tag |

### 3. Reference Documents by Operation

| Operation | Reference Document | Mode |
|-----------|-------------------|------|
| commit | [references/commit.md](references/commit.md) | All |
| push | [references/push.md](references/push.md) | All |
| sync | [references/sync.md](references/sync.md) | All |
| issue | [references/issue.md](references/issue.md) | GitHub only |
| pr | [references/pr.md](references/pr.md) | GitHub only |
| merge | [references/merge.md](references/merge.md) | Local only |
| release | [references/release.md](references/release.md) | GitHub only |

## Common Rules

### Commit Message Format (Conventional Commits)

```
<emoji> <type>[scope][!]: <description>

- [detailed change 1]
- [detailed change 2]
```

### Type & Emoji Map

See [references/commit-prefix-rules.md](references/commit-prefix-rules.md) for the complete type/emoji table.

### Commit Message Rules

- **Subject under 72 characters** (including emoji + type + scope)
- **Imperative mood** ("Add" not "Added")
- **Atomic commits** (single purpose)
- Split unrelated changes

### Language Rules

- Commit messages, Issue titles, PR titles: **Detect user's language from conversation context** and write in the same language
- Variable/function names: **English**
- All user-facing output (summaries, status messages): **Match user's language**

### Prohibited [Important]

- ❌ **Do NOT use `Co-Authored-By` pattern** (e.g., `Co-Authored-By: Claude ...`)
- ❌ **Do NOT use non-standard types** (types not in the table above)
- ❌ **Do NOT use `hotfix:` type** → Use `fix`
- ❌ **Do NOT use `merge:` type** → Use Git auto-generated message
- ❌ **No force push** (Exception: `--force-with-lease` after interactive rebase, with user confirmation)

## GitHub Mode

Operations marked "GitHub only" require `Remote Platform: GitHub` in CLAUDE.md.

When `Remote Platform` is not set or empty:
- `issue`, `pr`, `release` → inform the user that GitHub configuration is required (`Remote Platform: GitHub` in CLAUDE.md)
- `merge` → use Local Mode (direct git merge to `development`)

When GitHub is configured but `/git merge` is called:
- Redirect to `/git pr` with guidance to use `/git pr` in GitHub Mode

## Reference Documents

- [Commit Workflow](references/commit.md)
- [Push Workflow](references/push.md)
- [Sync Workflow](references/sync.md)
- [Issue Workflow](references/issue.md) (GitHub Mode)
- [PR Workflow](references/pr.md) (GitHub Mode)
- [Merge Workflow](references/merge.md) (Local Mode)
- [Release Workflow](references/release.md) (GitHub Mode)
- [Commit Prefix Rules](references/commit-prefix-rules.md)
