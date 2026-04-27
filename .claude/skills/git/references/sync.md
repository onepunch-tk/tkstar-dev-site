# Git Sync

Stage changes, commit in Conventional Commits format, and push all at once.

## Parameters

`$ARGUMENTS`: Optional commit message. Uses provided message if given, auto-generates if not.

## Workflow

```
[0] Upstream sync precheck (warning only)
       ↓
[1] Collect and analyze changes
       ↓
[2] Determine commit message (see commit.md)
       ↓
[3] git add .
       ↓
[4] git commit -m "<emoji> <type>: ..."
       ↓
[5] git push origin <current-branch>
       ↓
[6] Completion report
```

## Step-by-Step Details

### 0. Upstream Sync Precheck (Warning)

Before committing, check whether the current branch is in sync with its upstream:

```bash
git fetch origin --quiet
UPSTREAM=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "")
if [[ -n "$UPSTREAM" ]]; then
    AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo 0)
    BEHIND=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo 0)
    if [[ $BEHIND -gt 0 ]]; then
        echo "⚠️  Current branch is $BEHIND commit(s) behind $UPSTREAM."
        echo "   Consider 'git pull --rebase' before continuing to avoid non-fast-forward push."
    fi
fi
```

**Not a hard block** — sync is informational. If push fails later (non-fast-forward), guide user to `git pull --rebase` and retry. The Phase 1 Step 5a in harness-pipeline is where hard enforce happens; `/git sync` is a terminal user convenience and warnings suffice here.

### 1. Collect Changes

```bash
git status
git diff --cached
git diff
git branch --show-current
```

### 2. Determine Commit Message

Apply message generation rules from [commit.md](commit.md):
- If $ARGUMENTS provided → Use that message
- If $ARGUMENTS not provided → Auto-generate based on changes
- Type & emoji inference: See [commit-prefix-rules.md](commit-prefix-rules.md)

### 3. Stage and Commit

```bash
git add .
git commit -m "<emoji> <type>: message subject

- detailed change 1
- detailed change 2"
```

### 4. Push

```bash
git push origin <current-branch>
```

## Output Format

```
═══════════════════════════════════════
🔄 Git Sync Started
═══════════════════════════════════════

[1/4] Analyzing changes...
      Changed files: N

[2/4] Generating commit message...
      Type: feat
      Emoji: ✨
      Subject: Add new feature

[3/4] Committing...
      ✅ Commit complete

[4/4] Pushing...
      Branch: main
      ✅ Push complete

───────────────────────────────────────
✅ Git Sync Complete
───────────────────────────────────────
```

## Examples

### When Arguments Provided

Input:
```
Implement login feature
```

Result:
```
✨ feat: Implement login feature

- Add login form component
- Connect authentication API
```

### Example with Scope

Input:
```
Auth module token refresh feature
```

Result:
```
✨ feat(auth): Auth module token refresh feature

- Implement automatic access token refresh
- Add refresh token handling logic
```

### When Arguments Not Provided

Auto-generates message after analyzing changed files.

## Cautions

- Stop if no changes exist
- Report error if push fails after commit
- Warn if sensitive files are included
- Never perform force push
- Never add `Co-Authored-By` pattern
