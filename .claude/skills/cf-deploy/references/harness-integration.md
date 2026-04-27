# Harness integration — what to mirror in CI, what stays local

The cc-ecosystem harness wires a lot of behavior to local Claude Code hooks
(`.claude/hooks/*.sh`). This file documents which of those have CI parallels
in the generated workflow, and which intentionally don't.

## Mirrored: quality gates that block PR merge

These hooks run locally as `PostToolUse:Edit|Write` — they need a CI
counterpart so the same gate enforces on PRs from contributors who don't
run the hooks (external collaborators, future-you on a fresh checkout).

| Local hook | CI step | Triggered when package.json has |
|------------|---------|--------------------------------|
| `biome-format.sh` | `Lint` step (`<pm> run lint`) | `scripts.lint` |
| `typecheck.sh` | `Typecheck` step (`<pm> run typecheck`) | `scripts.typecheck` |
| (none — TDD discipline is local) | `Run tests` step (`<pm> run test`) | `scripts.test` |

The detector probes for each script and only emits the step if the script
exists. Emitting `bun run lint` for a project with no `lint` script would
fail every CI run.

## Not mirrored — these are local-only by design

The harness has many hooks that are policy/state machinery, not quality
gates. They have no place in CI:

| Hook | Why local-only |
|------|----------------|
| `abac-phase-policy.sh`, `phase-gate.sh`, `plan-enforcement.sh` | Enforce TDD/Plan discipline on the **author**, not on merged code |
| `protect-files.sh`, `rbac-agent-role.sh`, `rebac-ownership.sh`, `rebac-teammate-idle.sh` | Multi-agent ownership in Team Mode — irrelevant once code is merged |
| `block-dangerous-commands.sh` | Protects the local dev environment |
| `gh-auth-check.sh`, `pre-merge-ask.sh`, `git-pr-create.sh`, `git-pr-merge.sh` | Local git workflow helpers |
| `docs-sync-gate.sh`, `ensure-runtime-gitignore.sh` | Project state hygiene at edit time |
| `pipeline-guardian.sh`, `post-plan-approval.sh`, `post-task-created.sh`, `load-pipeline-context.sh` | Pipeline state machine |

Trying to run any of these in CI would either no-op (no `pipeline-state.json`
to consult) or fail (no `gh auth status` in a workflow runner).

## Branch policy alignment

The detector reads `.claude/config.json`:

```json
{
  "protectedBranches": ["main", "development"],
  "integrationBranch": "development",
  "productionBranch": "main"
}
```

and uses `productionBranch` / `integrationBranch` to populate `on.push.branches`
and the deploy-env resolution step. This guarantees the workflow stays in
sync with the harness's notion of protected branches — change the config
once, regenerate the workflow, no drift.

If the project changes branch convention (e.g. `develop` → `development`,
or adopting `staging` as a dedicated branch), update `.claude/config.json`
**first**, then regenerate.

## CLAUDE.md PR-only policy

CLAUDE.md mandates PR-only workflow with no direct pushes to `main` /
`development`. The generated workflow respects this in two ways:

1. **No deploy on PR** — the `on:` block triggers only on `push` to the
   protected branches and on `workflow_dispatch`. PRs trigger no deploy,
   which means a contributor cannot accidentally publish a Worker by
   opening a PR.
2. **Branch-protected push triggers** — once a PR is squash-merged into
   `development` or `main`, the resulting push event triggers the deploy.
   This is intentional; it's the only path to production.

The skill itself, when generating or modifying the workflow, MUST follow
the same PR-only policy: create a `chore/add-cloudflare-deploy-workflow`
branch, open a PR, get review, squash merge.
