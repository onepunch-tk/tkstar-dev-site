#!/bin/bash
# PostToolUse hook — matcher: Bash (filtered to `git commit`)
#
# Phase 4 (validate) commit hook — warn-only glossary drift detector.
#
# Reads the just-completed commit's diff, scans added/modified TypeScript
# identifiers (exported class/function/type names in src/domain/** and
# src/application/**) and added Korean noun phrases in docs/**, and compares
# against `docs/glossary.md`. Surfaces unknown identifiers via an
# additionalContext directive — the main agent decides whether to invoke
# `/glossary-sync` or update the glossary directly.
#
# Warn-only: this hook never blocks. It exits 0 always.
#
# Idempotency: the hook fires per `git commit` Bash call. There is no
# dedup by SHA — the same commit re-running the hook is harmless because
# the agent receives the same advisory and can choose to ignore it.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=lib/harness-debug.sh
source "$SCRIPT_DIR/lib/harness-debug.sh"

INPUT=$(cat)

# Skip if the tool reported an error (commit failed — nothing to scan).
if jq -e '.tool_response.error // empty' >/dev/null 2>&1 <<< "$INPUT"; then
  harness_debug post-commit-glossary-sync "tool_response.error present"
  exit 0
fi

# Filter: only act on `git commit` Bash calls. The matcher in
# settings.json scopes us to Bash, but Bash includes every shell command;
# narrow further by inspecting the command text.
COMMAND=$(jq -r '.tool_input.command // ""' <<< "$INPUT")
if ! grep -qE '(^|[[:space:]&;|])git[[:space:]]+commit($|[[:space:]])' <<< "$COMMAND"; then
  harness_debug post-commit-glossary-sync "command is not git commit"
  exit 0
fi

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$PWD}"
STATE_FILE="$PROJECT_DIR/.claude/runtime/pipeline-state.json"
GLOSSARY="$PROJECT_DIR/docs/glossary.md"

if [[ ! -f "$STATE_FILE" ]]; then
  harness_debug post-commit-glossary-sync "pipeline-state.json missing"
  exit 0
fi
if [[ ! -f "$GLOSSARY" ]]; then
  harness_debug post-commit-glossary-sync "docs/glossary.md missing"
  exit 0
fi

CURRENT_PHASE=$(jq -r '.current_phase // "none"' "$STATE_FILE")
if [[ "$CURRENT_PHASE" != "validate" ]]; then
  harness_debug post-commit-glossary-sync "current_phase=$CURRENT_PHASE (want validate)"
  exit 0
fi

cd "$PROJECT_DIR" || exit 0

# Scan the just-committed diff (HEAD vs HEAD~1). If HEAD~1 doesn't exist
# (initial commit), bail.
if ! git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
  harness_debug post-commit-glossary-sync "no parent commit"
  exit 0
fi

# Extract added/modified TS identifiers from src/domain and src/application.
# Heuristic: lines starting with `+export` then class/function/type/interface.
CANDIDATE_IDS=$(git diff HEAD~1..HEAD -- 'src/domain/**' 'src/application/**' 2>/dev/null \
  | grep -E '^\+[[:space:]]*export[[:space:]]+(class|function|type|interface|const)[[:space:]]+[A-Z][A-Za-z0-9_]*' \
  | sed -E 's/^\+[[:space:]]*export[[:space:]]+(class|function|type|interface|const)[[:space:]]+([A-Z][A-Za-z0-9_]*).*/\2/' \
  | sort -u)

if [[ -z "$CANDIDATE_IDS" ]]; then
  harness_debug post-commit-glossary-sync "no candidate identifiers in diff"
  exit 0
fi

# For each candidate, check presence in docs/glossary.md (English identifier
# column). Skip if already present.
UNKNOWN=()
while IFS= read -r ID; do
  [[ -z "$ID" ]] && continue
  if ! grep -qE "(^|[^A-Za-z0-9_])${ID}([^A-Za-z0-9_]|$)" "$GLOSSARY"; then
    UNKNOWN+=("$ID")
  fi
done <<< "$CANDIDATE_IDS"

if [[ ${#UNKNOWN[@]} -eq 0 ]]; then
  harness_debug post-commit-glossary-sync "all candidates already in glossary"
  exit 0
fi

UNKNOWN_LIST=$(printf -- '- %s\n' "${UNKNOWN[@]}")

ADVISORY_BODY=$(cat <<ADVISORY

─────────────────────────────────────────────────────────────
  GLOSSARY DRIFT (warn-only) — Phase 4 commit
─────────────────────────────────────────────────────────────

방금 commit 된 변경에서 docs/glossary.md 에 등록되지 않은 도메인/
애플리케이션 식별자가 발견되었습니다 (warn-only — commit 은 정상 완료):

$UNKNOWN_LIST

권장 조치:
  ① 의도한 신규 도메인 어휘라면 docs/glossary.md 에 추가 후 amend
     또는 후속 chore commit
  ② 명명 실수라면 식별자 rename + glossary 갱신
  ③ 무시하려면 그대로 진행 (단, 다음 /glossary-sync 시 재검출됨)

전체 재스캔이 필요하면: \`/glossary-sync\`
─────────────────────────────────────────────────────────────
ADVISORY
)

# Mirror to stderr (terminal fallback).
printf '%s\n' "$ADVISORY_BODY" >&2

# Primary path: surface to model context via additionalContext.
jq -n --arg body "$ADVISORY_BODY" '{
  hookSpecificOutput: {
    hookEventName: "PostToolUse",
    additionalContext: (
      "Phase 4 commit hook detected glossary drift (warn-only — commit succeeded).\n\n"
      + "Below is the warn-only advisory. Surface this to the user in your next response and let them decide whether to address it now or defer. Do NOT auto-edit docs/glossary.md without user confirmation.\n\n"
      + "=== BEGIN ADVISORY ===\n"
      + $body
      + "\n=== END ADVISORY ==="
    )
  }
}'

exit 0
