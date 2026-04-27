#!/bin/bash
# detect-project.sh — Probe the project for the values needed to render the
# Cloudflare Workers deploy workflow. Emits a single JSON object on stdout.
#
# Detected fields:
#   package_manager      : bun | pnpm | yarn | npm   (lockfile-based, with .claude/config.json override)
#   install_cmd          : install command honoring lockfile-frozen flag
#   has_test             : true if package.json defines `test` script
#   has_typecheck        : true if package.json defines `typecheck` script
#   has_lint             : true if package.json defines `lint` script
#   has_build            : true if package.json defines `build` script
#   build_cmd            : the literal build script value (or empty)
#   has_cf_typegen       : true if package.json defines `cf:typegen` script
#                          (`wrangler types`). If present, CI runs it before
#                          typecheck so generated worker-configuration.d.ts is
#                          available.
#   has_wrangler_dep     : true if `wrangler` is in dependencies / devDependencies.
#                          When false, the skill prompts to install via the
#                          detected package manager (see SKILL.md Step 2.5).
#   production_branch    : from .claude/config.json .productionBranch (default: main)
#   integration_branch   : from .claude/config.json .integrationBranch (default: development)
#   uses_react_router    : true if "react-router" or "@react-router/*" appears in deps
#   wrangler_config_kind : toml | jsonc | json | none
#   working_directory    : "" (root) or the relative path passed via --cwd
#
# Reuses the harness `detect_package_manager` from .claude/hooks/lib/config.sh
# so the skill never duplicates that logic.

set -uo pipefail

PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$PWD}"
CWD="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --cwd) CWD="$2"; shift 2 ;;
    --root) PROJECT_ROOT="$2"; shift 2 ;;
    *) shift ;;
  esac
done

TARGET_DIR="$PROJECT_ROOT/$CWD"
[[ "$CWD" == "." ]] && TARGET_DIR="$PROJECT_ROOT"

# Source the harness's package-manager detector so we honor any explicit
# .claude/config.json override (e.g. user pinned `pnpm` even though a stray
# bun.lock exists).
LIB="$PROJECT_ROOT/.claude/hooks/lib/config.sh"
if [[ -f "$LIB" ]]; then
  # shellcheck disable=SC1090
  CLAUDE_PROJECT_DIR="$PROJECT_ROOT" source "$LIB"
  PM=$(CLAUDE_PROJECT_DIR="$TARGET_DIR" detect_package_manager)
else
  # Standalone fallback: probe lockfiles in the same priority order as the
  # harness so behavior matches when this skill runs in a project without
  # the cc-ecosystem hooks installed.
  if [[ -f "$TARGET_DIR/bun.lock" || -f "$TARGET_DIR/bun.lockb" ]]; then PM=bun
  elif [[ -f "$TARGET_DIR/pnpm-lock.yaml" ]]; then PM=pnpm
  elif [[ -f "$TARGET_DIR/yarn.lock" ]]; then PM=yarn
  elif [[ -f "$TARGET_DIR/package-lock.json" ]]; then PM=npm
  else PM=npm
  fi
fi

# Frozen-lockfile install per package manager. The flags differ enough that
# generating the wrong one silently downgrades CI from "verify lockfile" to
# "resolve fresh", which defeats the point of running CI on a lockfile.
case "$PM" in
  bun)  INSTALL_CMD="bun install --frozen-lockfile" ;;
  pnpm) INSTALL_CMD="pnpm install --frozen-lockfile" ;;
  yarn) INSTALL_CMD="yarn install --frozen-lockfile" ;;
  npm)  INSTALL_CMD="npm ci" ;;
  *)    INSTALL_CMD="npm ci" ;;
esac

PKG_JSON="$TARGET_DIR/package.json"
HAS_TEST=false; HAS_TYPECHECK=false; HAS_LINT=false; HAS_BUILD=false
HAS_CF_TYPEGEN=false; HAS_WRANGLER_DEP=false
BUILD_CMD=""
USES_RR=false
if [[ -f "$PKG_JSON" ]]; then
  jq -e '.scripts.test // empty' "$PKG_JSON" >/dev/null 2>&1 && HAS_TEST=true
  jq -e '.scripts.typecheck // empty' "$PKG_JSON" >/dev/null 2>&1 && HAS_TYPECHECK=true
  jq -e '.scripts.lint // empty' "$PKG_JSON" >/dev/null 2>&1 && HAS_LINT=true
  if jq -e '.scripts.build // empty' "$PKG_JSON" >/dev/null 2>&1; then
    HAS_BUILD=true
    BUILD_CMD=$(jq -r '.scripts.build' "$PKG_JSON")
  fi
  # `cf:typegen` (= `wrangler types`) emits worker-configuration.d.ts so TS
  # sees the env Bindings interface. If it exists, we run it in CI before
  # typecheck — otherwise typecheck fails on a clean checkout.
  jq -e '.scripts["cf:typegen"] // empty' "$PKG_JSON" >/dev/null 2>&1 && HAS_CF_TYPEGEN=true
  # wrangler must be in devDependencies for `wrangler types` and `wrangler
  # deploy` to resolve via the package manager. wrangler-action also installs
  # its own copy, but having it in package.json keeps local + CI consistent.
  if jq -e '.devDependencies.wrangler // .dependencies.wrangler // empty' "$PKG_JSON" >/dev/null 2>&1; then
    HAS_WRANGLER_DEP=true
  fi
  # React Router 7 framework mode emits a `_redirects` file during build that
  # must be removed before deploying to Workers (SSR), or the worker enters a
  # redirect loop. Detect it once so the renderer can include the cleanup step
  # only when relevant.
  if jq -e '.dependencies["react-router"] // .dependencies["@react-router/node"] // .devDependencies["react-router"] // .devDependencies["@react-router/node"] // empty' "$PKG_JSON" >/dev/null 2>&1; then
    USES_RR=true
  fi
fi

# Branches come from the harness config.json so the workflow agrees with the
# project's protected-branch policy. Defaults match cc-ecosystem conventions.
CONFIG="$PROJECT_ROOT/.claude/config.json"
PROD_BRANCH="main"
INT_BRANCH="development"
if [[ -f "$CONFIG" ]]; then
  PROD_BRANCH=$(jq -r '.productionBranch // "main"' "$CONFIG")
  INT_BRANCH=$(jq -r '.integrationBranch // "development"' "$CONFIG")
fi

# Wrangler config detection. v3+ supports jsonc/json in addition to toml.
WRANGLER_KIND=none
for f in wrangler.toml wrangler.jsonc wrangler.json; do
  if [[ -f "$TARGET_DIR/$f" ]]; then
    case "$f" in
      *.toml)  WRANGLER_KIND=toml ;;
      *.jsonc) WRANGLER_KIND=jsonc ;;
      *.json)  WRANGLER_KIND=json ;;
    esac
    break
  fi
done

WORKING_DIR=""
[[ "$CWD" != "." ]] && WORKING_DIR="$CWD"

jq -n \
  --arg pm "$PM" \
  --arg install_cmd "$INSTALL_CMD" \
  --argjson has_test $HAS_TEST \
  --argjson has_typecheck $HAS_TYPECHECK \
  --argjson has_lint $HAS_LINT \
  --argjson has_build $HAS_BUILD \
  --arg build_cmd "$BUILD_CMD" \
  --argjson has_cf_typegen $HAS_CF_TYPEGEN \
  --argjson has_wrangler_dep $HAS_WRANGLER_DEP \
  --arg prod_branch "$PROD_BRANCH" \
  --arg int_branch "$INT_BRANCH" \
  --argjson uses_rr $USES_RR \
  --arg wrangler_kind "$WRANGLER_KIND" \
  --arg working_dir "$WORKING_DIR" \
  '{
    package_manager: $pm,
    install_cmd: $install_cmd,
    has_test: $has_test,
    has_typecheck: $has_typecheck,
    has_lint: $has_lint,
    has_build: $has_build,
    build_cmd: $build_cmd,
    has_cf_typegen: $has_cf_typegen,
    has_wrangler_dep: $has_wrangler_dep,
    production_branch: $prod_branch,
    integration_branch: $int_branch,
    uses_react_router: $uses_rr,
    wrangler_config_kind: $wrangler_kind,
    working_directory: $working_dir
  }'
