# Git Release

development → main Release PR + merge + tag. **GitHub Mode only**, **user-initiated only**.

## Agent Role (intelligence)

1. Confirm version with user (AskUserQuestion):
   - Query latest tag: `git describe --tags --abbrev=0`
   - Suggest Minor / Patch / Major bump
2. Compose release body (optional):
   - List included features/PRs
   - Script can auto-generate if body is omitted

## Execution (delegate to script)

```bash
.claude/hooks/git-release.sh \
  --version "v1.2.0" \
  --body "<release notes>"
```

Script handles automatically: development push, PR creation (→main), merge, tag creation, GitHub Release publishing, development checkout.

## Cautions

- Can only run from `development` branch
- `--version` is required (agent confirms with user before calling)
- `development` branch is NEVER deleted
