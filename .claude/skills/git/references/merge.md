# Git Merge (Local Mode)

Merge current feature branch into `development` branch. **Local Mode only** — used when `Remote Platform` is NOT set in CLAUDE.md.

> **GitHub Mode**: If `Remote Platform: GitHub` is configured, `/git merge` redirects to `/git pr`.

## Workflow

```
[1] Check current branch
       ↓
[2] Check for uncommitted changes
       ↓
[3] Update development branch
       ↓
[4] Checkout to development
       ↓
[5] Merge feature branch (--no-ff)
       ↓
[6] Push development
       ↓
[7] Ask about feature branch deletion
```

## Step-by-Step Details

### 1. Check Current Branch

```bash
git branch --show-current
```

**If on main or development branch**: Stop and notify user.

### 2. Check for Changes

```bash
git status
```

**If uncommitted changes exist**: Stop and notify user.

### 3. Update Development Branch

```bash
git fetch origin development
git checkout development
git pull origin development
```

### 4. Merge Feature Branch

```bash
git merge --no-ff <feature-branch> -m "🔀 merge: <feature-branch> → development

- Feature summary (based on change analysis)"
```

**`--no-ff`**: Creates merge commit to preserve branch history.

### 5. Push Development

```bash
git push origin development
```

### 6. Feature Branch Deletion

**Use AskUserQuestion** to ask whether to delete the feature branch:
- Delete (local + remote)
- Delete local only
- Keep

## Cautions

- Stop if executed from main or development branch
- Stop if uncommitted changes exist
- Guide manual resolution if merge conflict occurs
- Never perform force push
- Never add `Co-Authored-By` pattern
