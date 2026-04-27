#!/bin/bash
# generate-workflow.sh — Render the deploy workflow YAML from detect-project.sh
# output. Writes to .github/workflows/deploy-cloudflare-workers.yml unless a
# different --output path is given.
#
# Usage:
#   .claude/skills/cf-deploy/scripts/generate-workflow.sh \
#     [--cwd <subdir>] [--output <path>] [--dry-run]
#
# All decisions about which steps to include come from detect-project.sh — this
# script is pure templating. If something needs to change conditionally (e.g.
# skip the React Router cleanup), update the detector or this renderer, never
# the generated YAML by hand.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
CWD="."
OUTPUT=""
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cwd) CWD="$2"; shift 2 ;;
    --output) OUTPUT="$2"; shift 2 ;;
    --dry-run) DRY_RUN=true; shift ;;
    *) echo "Unknown arg: $1" >&2; exit 1 ;;
  esac
done

INFO=$("$SCRIPT_DIR/detect-project.sh" --cwd "$CWD" --root "$PROJECT_ROOT")

PM=$(jq -r '.package_manager' <<<"$INFO")
INSTALL_CMD=$(jq -r '.install_cmd' <<<"$INFO")
HAS_TEST=$(jq -r '.has_test' <<<"$INFO")
HAS_TYPECHECK=$(jq -r '.has_typecheck' <<<"$INFO")
HAS_LINT=$(jq -r '.has_lint' <<<"$INFO")
HAS_BUILD=$(jq -r '.has_build' <<<"$INFO")
HAS_CF_TYPEGEN=$(jq -r '.has_cf_typegen' <<<"$INFO")
HAS_WRANGLER_DEP=$(jq -r '.has_wrangler_dep' <<<"$INFO")
PROD_BRANCH=$(jq -r '.production_branch' <<<"$INFO")
INT_BRANCH=$(jq -r '.integration_branch' <<<"$INFO")
USES_RR=$(jq -r '.uses_react_router' <<<"$INFO")
WRANGLER_KIND=$(jq -r '.wrangler_config_kind' <<<"$INFO")
WORKING_DIR=$(jq -r '.working_directory' <<<"$INFO")

# Per-package-manager run prefix. This single prefix drives every CI script
# step so we never mix `bun run lint` and `npm run lint` in the same workflow.
case "$PM" in
  bun)  RUN_CMD="bun run" ;;
  pnpm) RUN_CMD="pnpm run" ;;
  yarn) RUN_CMD="yarn" ;;
  npm)  RUN_CMD="npm run" ;;
  *)    RUN_CMD="npm run" ;;
esac

# setup-* action selection. Versions reflect 2026-04 cross-checked sources:
#   - oven-sh/setup-bun@v2 (v2.2.0, Node 24, required after 2026-06-02)
#   - actions/setup-node@v4 (still maintained, Node 24 default)
emit_setup() {
  case "$PM" in
    bun)
      printf '%s\n' \
        '      - name: Setup Bun' \
        '        uses: oven-sh/setup-bun@v2' \
        '        with:' \
        '          bun-version: latest'
      ;;
    pnpm)
      printf '%s\n' \
        '      - name: Setup pnpm' \
        '        uses: pnpm/action-setup@v4' \
        '        with:' \
        '          run_install: false' \
        '' \
        '      - name: Setup Node' \
        '        uses: actions/setup-node@v4' \
        '        with:' \
        '          node-version: lts/*' \
        '          cache: pnpm'
      ;;
    yarn)
      printf '%s\n' \
        '      - name: Setup Node' \
        '        uses: actions/setup-node@v4' \
        '        with:' \
        '          node-version: lts/*' \
        '          cache: yarn'
      ;;
    *)
      printf '%s\n' \
        '      - name: Setup Node' \
        '        uses: actions/setup-node@v4' \
        '        with:' \
        '          node-version: lts/*' \
        '          cache: npm'
      ;;
  esac
}

emit_quality() {
  if [[ "$HAS_LINT" == "true" ]]; then
    printf '\n      - name: Lint\n        run: %s lint\n' "$RUN_CMD"
  fi
  # cf:typegen MUST run before typecheck. `wrangler types` writes
  # worker-configuration.d.ts with the Bindings/Env interface that the source
  # imports. On a fresh CI checkout that file does not exist, so typecheck
  # would fail with "Cannot find name 'Env'" without this step.
  if [[ "$HAS_CF_TYPEGEN" == "true" ]]; then
    printf '\n      - name: Generate Cloudflare types\n        run: %s cf:typegen\n' "$RUN_CMD"
  fi
  if [[ "$HAS_TYPECHECK" == "true" ]]; then
    printf '\n      - name: Typecheck\n        run: %s typecheck\n' "$RUN_CMD"
  fi
  if [[ "$HAS_TEST" == "true" ]]; then
    printf '\n      - name: Run tests\n        run: %s test\n' "$RUN_CMD"
  fi
}

emit_build() {
  if [[ "$HAS_BUILD" != "true" ]]; then return; fi
  printf '\n      - name: Build project\n'
  printf '        run: %s build\n' "$RUN_CMD"
  printf '        env:\n'
  printf '          CLOUDFLARE_ENV: ${{ env.DEPLOY_ENV }}\n'
}

# React Router 7 framework mode emits a stale _redirects file during build.
# Workers SSR doesn't need it and serving it produces a redirect loop. We use
# `find ... -delete` (not the truncated `-tyiles` from the user's example) and
# scope to build/public only so we don't touch the source tree.
emit_rr_cleanup() {
  if [[ "$USES_RR" != "true" ]]; then return; fi
  printf '\n      - name: Remove _redirects (Workers SSR does not need it)\n'
  printf '        run: |\n'
  printf '          find build public -name "_redirects" -type f -delete 2>/dev/null || true\n'
  printf '          echo "Removed any stale _redirects files"\n'
}

# wrangler-action config:
#   - apiToken/accountId from secrets (per Cloudflare's "don't commit token" rule)
#   - packageManager passed explicitly so the action doesn't have to re-detect
#   - command uses --env so Workers gets the {name}-{env} suffix from wrangler.toml
emit_wrangler() {
  printf '\n      - name: Deploy to Cloudflare Workers\n'
  printf '        uses: cloudflare/wrangler-action@v3\n'
  printf '        with:\n'
  printf '          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n'
  printf '          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}\n'
  printf '          packageManager: %s\n' "$PM"
  printf '          command: deploy --env ${{ env.DEPLOY_ENV }}\n'
  if [[ -n "$WORKING_DIR" ]]; then
    printf '          workingDirectory: %s\n' "$WORKING_DIR"
  fi
}

emit_defaults() {
  if [[ -z "$WORKING_DIR" ]]; then return; fi
  printf '\n    defaults:\n      run:\n        working-directory: %s\n' "$WORKING_DIR"
}

emit_workflow() {
  printf 'name: Deploy to Cloudflare Workers\n\n'
  printf 'on:\n'
  printf '  push:\n'
  printf '    branches:\n'
  printf '      - %s\n' "$PROD_BRANCH"
  printf '      - %s\n' "$INT_BRANCH"
  printf '  workflow_dispatch:\n'
  printf '    inputs:\n'
  printf '      environment:\n'
  printf "        description: 'Deployment environment'\n"
  printf '        required: true\n'
  printf '        type: choice\n'
  printf '        options:\n'
  printf '          - production\n'
  printf '          - staging\n\n'

  printf 'jobs:\n'
  printf '  deploy:\n'
  printf '    runs-on: ubuntu-latest\n'
  printf '    timeout-minutes: 60\n'
  printf '    permissions:\n'
  printf '      contents: read\n'
  printf '      deployments: write\n'
  emit_defaults

  printf '\n    steps:\n'
  printf '      - name: Checkout\n'
  printf '        uses: actions/checkout@v4\n\n'

  printf '      - name: Resolve deployment environment\n'
  printf '        id: set-env\n'
  printf '        run: |\n'
  printf '          if [ "${{ github.event_name }}" = "workflow_dispatch" ]; then\n'
  printf '            DEPLOY_ENV="${{ github.event.inputs.environment }}"\n'
  printf '          elif [ "${{ github.ref }}" = "refs/heads/%s" ]; then\n' "$PROD_BRANCH"
  printf '            DEPLOY_ENV="production"\n'
  printf '          elif [ "${{ github.ref }}" = "refs/heads/%s" ]; then\n' "$INT_BRANCH"
  printf '            DEPLOY_ENV="staging"\n'
  printf '          else\n'
  printf '            echo "Unknown branch ${{ github.ref }} — aborting deploy."\n'
  printf '            exit 1\n'
  printf '          fi\n'
  printf '          echo "DEPLOY_ENV=$DEPLOY_ENV" >> "$GITHUB_ENV"\n'
  printf '          echo "Deploying to: $DEPLOY_ENV"\n\n'

  emit_setup

  printf '\n      - name: Install dependencies\n'
  printf '        run: %s\n' "$INSTALL_CMD"

  emit_quality
  emit_build
  emit_rr_cleanup
  emit_wrangler

  if [[ "$WRANGLER_KIND" == "none" ]]; then
    printf '\n# NOTE: no wrangler.toml/jsonc/json detected at generation time.\n'
    printf '# Define [env.staging] and [env.production] before this workflow runs,\n'
    printf '# or wrangler-action will fail on the first push. See\n'
    printf '# .claude/skills/cf-deploy/references/cloudflare-workers.md\n'
    printf '# for a starter wrangler.toml template.\n'
  fi
  if [[ "$HAS_WRANGLER_DEP" == "false" || "$HAS_CF_TYPEGEN" == "false" ]]; then
    printf '\n# NOTE: prereqs missing (wrangler devDep and/or cf:typegen script).\n'
    printf '# Run the install script to resolve automatically:\n'
    printf '#   .claude/skills/cf-deploy/scripts/install-prereqs.sh\n'
    printf '# Then re-run generate-workflow.sh so the typegen step is included.\n'
  fi
}

WORKFLOW=$(emit_workflow)

if [[ "$DRY_RUN" == "true" ]]; then
  printf '%s\n' "$WORKFLOW"
  exit 0
fi

# Default destination: project root .github/workflows. The deploy file is
# always at the repo root regardless of monorepo working directory — GitHub
# Actions only reads workflows from $REPO/.github/workflows.
if [[ -z "$OUTPUT" ]]; then
  OUTPUT="$PROJECT_ROOT/.github/workflows/deploy-cloudflare-workers.yml"
fi
mkdir -p "$(dirname "$OUTPUT")"
printf '%s\n' "$WORKFLOW" > "$OUTPUT"

echo "Wrote: $OUTPUT"
echo "Detected:"
jq . <<<"$INFO"
