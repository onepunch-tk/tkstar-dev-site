#!/bin/bash
set -euo pipefail

# doc-structure-linter — PROJECT-STRUCTURE ↔ filesystem 3-way diff tool
#
# NOT a hook. Call from hooks (guardian, gate) or by hand for drift review.
#
# Usage:
#   doc-structure-linter.sh [--json|--human] [--fail-on=high|--fail-on=med]
#
# Env (all optional):
#   STRUCTURE_FILE  tree doc to parse   (default: docs/PROJECT-STRUCTURE.md)
#   SCAN_ROOTS      fs roots to scan    (default: "src docs .maestro assets")
#   TASKS_ROOT      task-file root      (default: tasks)

MODE="human"
FAIL_ON=""
for arg in "$@"; do
    case "$arg" in
        --json)          MODE="json" ;;
        --human)         MODE="human" ;;
        --fail-on=high)  FAIL_ON="high" ;;
        --fail-on=med)   FAIL_ON="med" ;;
        --fail-on=*)     echo "unknown --fail-on value: ${arg#--fail-on=}" >&2; exit 2 ;;
        -h|--help)
            sed -n '3,15p' "$0" | sed 's/^# \{0,1\}//'
            exit 0 ;;
        *) echo "unknown arg: $arg" >&2; exit 2 ;;
    esac
done

STRUCTURE_FILE="${STRUCTURE_FILE:-docs/PROJECT-STRUCTURE.md}"
TASKS_ROOT="${TASKS_ROOT:-tasks}"

if [[ ! -f "$STRUCTURE_FILE" ]]; then
    echo "linter: STRUCTURE_FILE not found: $STRUCTURE_FILE" >&2
    exit 2
fi

# Tooling / build / IDE directories excluded from filesystem scan. Kept as a
# single source of truth so `find` invocations below stay in sync.
PRUNE_NAMES=(
    node_modules .git dist build .cache __pycache__ coverage
    .expo .next .turbo .react-router
    ios android
    .claude .vscode .cursor .idea
)

# Same list, also applied when auto-deriving SCAN_ROOTS from STRUCTURE_FILE —
# tooling dirs that happen to show up in a project-root tree should not become
# scan roots (too noisy, not "project code").
is_tooling_dir() {
    local n="$1"
    local t
    for t in "${PRUNE_NAMES[@]}"; do
        [[ "$n" == "$t" ]] && return 0
    done
    return 1
}

# Auto-derive SCAN_ROOTS from STRUCTURE_FILE when caller didn't set it.
# Approach: take the first non-Target tree block and collect its depth-1 dir
# entries (those ending with "/"), minus anything in PRUNE_NAMES. This matches
# the "canonical" scan-roots for the project without the linter hardcoding a
# specific set. Any repo with a sensible PROJECT-STRUCTURE.md gets a useful
# default; callers can always override via env.
derive_scan_roots() {
    awk '
    BEGIN { in_block = 0; is_target = 0; last_line = ""; found = 0; out = "" }
    /^```/ {
        if (in_block) {
            # Closing the first non-Target tree block — stop scanning.
            if (found && out != "") exit
            in_block = 0; is_target = 0
        } else {
            in_block = 1
            is_target = (last_line ~ /[Tt]arget structure/ || last_line ~ /[Pp]latform-specific/) ? 1 : 0
        }
        next
    }
    !in_block { if ($0 != "") last_line = $0; next }
    is_target { next }
    {
        line = $0
        gsub(/│/, "|", line)
        gsub(/├── /, "<T>", line)
        gsub(/└── /, "<L>", line)
        if (line ~ /<[TL]>/) {
            found = 1
            if (match(line, /<[TL]>/)) {
                prefix = substr(line, 1, RSTART - 1)
                name   = substr(line, RSTART + RLENGTH)
                sub(/[[:space:]]*#.*$/, "", name)
                sub(/[[:space:]]+$/, "", name)
                sub(/^[[:space:]]+/, "", name)
                depth = int(length(prefix) / 4) + 1
                if (depth == 1 && name ~ /\/$/) {
                    n = name; sub(/\/$/, "", n)
                    out = out " " n
                }
            }
        }
    }
    END { if (found && out != "") print out }
    ' "$STRUCTURE_FILE"
}

if [[ -z "${SCAN_ROOTS:-}" || -z "${SCAN_ROOTS// /}" ]]; then
    DERIVED=$(derive_scan_roots)
    # Filter out tooling dirs.
    FILTERED=""
    for r in $DERIVED; do
        is_tooling_dir "$r" && continue
        FILTERED+=" $r"
    done
    SCAN_ROOTS="${FILTERED# }"
    if [[ -z "$SCAN_ROOTS" ]]; then
        echo "linter: SCAN_ROOTS not set and could not be derived from $STRUCTURE_FILE." >&2
        echo "        Set SCAN_ROOTS (e.g. 'src docs') in the env or your hook wrapper." >&2
        exit 2
    fi
fi

SCAN_ROOTS_ARR=()
for r in $SCAN_ROOTS; do SCAN_ROOTS_ARR+=("${r%/}"); done

# Anchor is "scan-relevant" if it IS a scan root or lives under one.
is_scan_relevant() {
    local candidate="$1"
    local r
    for r in "${SCAN_ROOTS_ARR[@]}"; do
        [[ "$candidate" == "$r" ]] && return 0
        [[ "$candidate" == "$r"/* ]] && return 0
    done
    return 1
}

# ─── Step 1: Parse STRUCTURE_FILE tree diagrams ───
#
# awk normalizes box-drawing chars (│/├──/└──) then emits TSV records:
#   R\t<root-line>                 one per tree block (root anchor)
#   N\t<depth>\t<name>             one per ├──/└── entry
# bash rebuilds full paths via depth-indexed path stack. If the block's anchor
# is not scan-relevant (e.g. "habit-tracking/" as repo-root), it's stripped
# from child paths so they align with the filesystem scan.

AWK_PARSE='
BEGIN { in_block = 0; is_tree = 0; is_target = 0; last_line = "" }

/^```/ {
    if (in_block) {
        in_block = 0; is_tree = 0; is_target = 0
    } else {
        in_block = 1
        # A block is "target" (forward-looking) when the preceding non-empty
        # line marks it. "Current reality" blocks are the default.
        if (last_line ~ /[Tt]arget structure/ || last_line ~ /[Pp]latform-specific/) {
            is_target = 1
        } else {
            is_target = 0
        }
    }
    next
}

!in_block {
    if ($0 != "") last_line = $0
    next
}

{
    line = $0
    gsub(/│/, "|", line)
    gsub(/├── /, "<T>", line)
    gsub(/└── /, "<L>", line)

    has_marker = (line ~ /<[TL]>/)

    if (!is_tree) {
        if (has_marker) {
            is_tree = 1
            # fall through
        } else {
            # Root anchor detection (BSD awk safe — no "/" inside "[]"):
            #   ends with /, no whitespace/tree chars, first char alphanumeric,
            #   all chars ∈ [A-Za-z0-9_.-/] (checked via gsub-strip).
            candidate = $0
            sub(/[[:space:]]+$/, "", candidate)
            if (candidate ~ /\/$/ && candidate !~ /[[:space:]]/ && candidate ~ /^[A-Za-z0-9_.]/) {
                rem = candidate
                gsub(/[A-Za-z0-9_.-]/, "", rem)
                gsub(/\//, "", rem)
                if (rem == "") {
                    print "R\t" candidate "\t" is_target
                    next
                }
            }
            next
        }
    }

    if (match(line, /<[TL]>/)) {
        prefix = substr(line, 1, RSTART - 1)
        name   = substr(line, RSTART + RLENGTH)
        sub(/[[:space:]]*#.*$/, "", name)
        sub(/[[:space:]]+$/, "", name)
        sub(/^[[:space:]]+/, "", name)

        # Each level contributes 4 cells ("|   " or "    ") to the prefix.
        depth = int(length(prefix) / 4) + 1
        print "N\t" depth "\t" name "\t" is_target
    }
}
'

DOC_PATHS_FILE=$(mktemp -t doc-lint-doc.XXXXXX)
DOC_CURRENT_FILE=$(mktemp -t doc-lint-doc-cur.XXXXXX)
DOC_TARGET_ANC_FILE=$(mktemp -t doc-lint-doc-anc.XXXXXX)
DOC_CUR_EFF_FILE=$(mktemp -t doc-lint-doc-eff.XXXXXX)
FS_ALL_FILE=$(mktemp -t doc-lint-fs-all.XXXXXX)
FS_DIRS_FILE=$(mktemp -t doc-lint-fs-dirs.XXXXXX)
FS_FILES_FILE=$(mktemp -t doc-lint-fs-files.XXXXXX)
NEW_FILE=$(mktemp -t doc-lint-new.XXXXXX)
GHOST_FILE=$(mktemp -t doc-lint-ghost.XXXXXX)
NEW_SEV_FILE=$(mktemp -t doc-lint-new-sev.XXXXXX)
GHOST_SEV_FILE=$(mktemp -t doc-lint-ghost-sev.XXXXXX)
DRILLED_FILE=$(mktemp -t doc-lint-drilled.XXXXXX)
trap 'rm -f "$DOC_PATHS_FILE" "$DOC_CURRENT_FILE" "$DOC_TARGET_ANC_FILE" "$DOC_CUR_EFF_FILE" "$FS_ALL_FILE" "$FS_DIRS_FILE" "$FS_FILES_FILE" "$NEW_FILE" "$GHOST_FILE" "$NEW_SEV_FILE" "$GHOST_SEV_FILE" "$DRILLED_FILE"' EXIT

path_stack=()
root_anchor=""
strip_anchor=0
current_is_target=0

# Emit a documented full path.
#   - DOC_PATHS_FILE         : always (both current + target)
#   - DOC_CURRENT_FILE       : only for current-reality blocks
#   - DOC_TARGET_ANC_FILE    : for target blocks, every ancestor of the path
#                              (so "src/presentation" is marked under construction
#                              when a target tree drills into it)
emit_doc_full_path() {
    local joined="$1"
    local out="$joined"
    if (( strip_anchor == 1 )) && [[ -n "$root_anchor" ]]; then
        out="${joined#$root_anchor/}"
        [[ "$out" == "$joined" ]] && return  # anchor itself — don't emit
    fi
    echo "$out" >> "$DOC_PATHS_FILE"
    if (( current_is_target == 0 )); then
        echo "$out" >> "$DOC_CURRENT_FILE"
    else
        # Record ancestors — e.g. src/presentation/components/ui ⇒
        #   src/presentation/components, src/presentation, src
        local anc="$out"
        while [[ "$anc" == */* ]]; do
            anc="${anc%/*}"
            echo "$anc" >> "$DOC_TARGET_ANC_FILE"
        done
    fi
}

while IFS=$'\t' read -r rec_type a b c; do
    case "$rec_type" in
        R)
            root_anchor="${a%/}"
            current_is_target="${b:-0}"
            path_stack=("$root_anchor")
            if is_scan_relevant "$root_anchor"; then
                strip_anchor=0
                echo "$root_anchor" >> "$DOC_PATHS_FILE"
                (( current_is_target == 0 )) && echo "$root_anchor" >> "$DOC_CURRENT_FILE"
            else
                strip_anchor=1
            fi
            ;;
        N)
            depth=$a
            name="${b%/}"
            current_is_target="${c:-0}"
            [[ -z "$name" ]] && continue
            if (( depth > ${#path_stack[@]} )); then
                continue
            fi
            path_stack=("${path_stack[@]:0:$depth}")
            # Split name on '/' — intermediate dirs are implicit ancestors.
            old_ifs="$IFS"; IFS=/
            name_parts=($name)
            IFS="$old_ifs"
            for part in "${name_parts[@]}"; do
                [[ -z "$part" ]] && continue
                path_stack+=("$part")
                old_ifs="$IFS"; IFS=/
                full_path="${path_stack[*]}"
                IFS="$old_ifs"
                emit_doc_full_path "$full_path"
            done
            ;;
    esac
done < <(awk "$AWK_PARSE" "$STRUCTURE_FILE")

sort -u -o "$DOC_PATHS_FILE" "$DOC_PATHS_FILE"
[[ -s "$DOC_CURRENT_FILE" ]]    && sort -u -o "$DOC_CURRENT_FILE"    "$DOC_CURRENT_FILE"    || :
[[ -s "$DOC_TARGET_ANC_FILE" ]] && sort -u -o "$DOC_TARGET_ANC_FILE" "$DOC_TARGET_ANC_FILE" || :

# DOC_CURRENT effective = DOC_CURRENT - DOC_TARGET_ANC.
# Rationale: if a target tree drills into a path, that path is "under
# construction" and shouldn't be flagged GHOST just for being empty on disk.
comm -23 "$DOC_CURRENT_FILE" "$DOC_TARGET_ANC_FILE" > "$DOC_CUR_EFF_FILE" || true

# Drilled-into set = parents of any documented path. Used for severity to avoid
# flagging leaves (e.g. documented "assets/" with no drill-down shouldn't make
# every asset/* file count as drift).
awk -F/ '{
    if (NF > 1) {
        path = $1
        for (i = 2; i < NF; i++) { path = path "/" $i; print path }
        # parent of full path
        parent = $1
        for (i = 2; i < NF; i++) parent = parent "/" $i
        print parent
    }
}' "$DOC_PATHS_FILE" | sort -u > "$DRILLED_FILE"

# ─── Step 2: Filesystem scan ───
#
# Build the find(1) prune expression once from PRUNE_NAMES, then scan each
# SCAN_ROOT twice (once per -type) — find can't stream mixed types to
# separate files in a single pass without GNU-only -printf.
FIND_PRUNE_ARGS=(-name "${PRUNE_NAMES[0]}")
for ((i = 1; i < ${#PRUNE_NAMES[@]}; i++)); do
    FIND_PRUNE_ARGS+=(-o -name "${PRUNE_NAMES[$i]}")
done

for root in $SCAN_ROOTS; do
    root="${root%/}"
    [[ -e "$root" ]] || continue
    echo "$root" >> "$FS_DIRS_FILE"
    find "$root" \( "${FIND_PRUNE_ARGS[@]}" \) -prune \
        -o -type f -print 2>/dev/null >> "$FS_FILES_FILE" || true
    find "$root" \( "${FIND_PRUNE_ARGS[@]}" \) -prune \
        -o -type d -print 2>/dev/null >> "$FS_DIRS_FILE" || true
done

sort -u -o "$FS_FILES_FILE" "$FS_FILES_FILE"
sort -u -o "$FS_DIRS_FILE"  "$FS_DIRS_FILE"
cat "$FS_FILES_FILE" "$FS_DIRS_FILE" | sort -u > "$FS_ALL_FILE"

# ─── Step 3: 3-way diff ───
#
# NEW   = FS - DOC_PATHS (all)        undocumented on-disk paths
# GHOST = DOC_CUR_EFF - FS, filtered  current-reality paths missing on disk,
#                                     excluding ancestors of target blocks AND
#                                     paths outside SCAN_ROOTS (out of jurisdiction).
comm -23 "$FS_ALL_FILE" "$DOC_PATHS_FILE"    > "$NEW_FILE" || true

GHOST_RAW=$(comm -13 "$FS_ALL_FILE" "$DOC_CUR_EFF_FILE" 2>/dev/null || true)

# Filter GHOST: keep only paths whose first segment is a scan root.
: > "$GHOST_FILE"
while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    first_seg="${p%%/*}"
    for r in "${SCAN_ROOTS_ARR[@]}"; do
        if [[ "$first_seg" == "$r" ]]; then
            echo "$p" >> "$GHOST_FILE"
            break
        fi
    done
done <<< "$GHOST_RAW"

# ─── Step 4: Severity assignment ───
#
# NEW:
#   LOW  = matches generated pattern (migrations / __tests__ / __generated__ / …)
#   HIGH = directory whose parent is in drilled_into (new subdir in enumerated area)
#   MED  = file      whose parent is in drilled_into (new file in enumerated area)
#   -    = parent is a leaf or itself NEW (count-suppressed)
#
# GHOST:
#   HIGH = referenced in $TASKS_ROOT/**/*.md (broken task link)
#   MED  = unreferenced

classify_new_awk='
BEGIN {
    while ((getline line < drilledf) > 0) drilled[line] = 1
    while ((getline line < dirsf) > 0)    dirs[line]    = 1
    close(drilledf); close(dirsf)
}
{
    p = $0
    if (p == "") next

    if (p ~ /(^|\/)(migrations|__tests__|__generated__|__snapshots__|coverage|\.next|\.turbo)(\/|$)/) {
        print "LOW\t" p; next
    }

    parent = p
    sub(/\/[^\/]+$/, "", parent)
    if (parent == p) parent = ""

    if (parent in drilled) {
        if (p in dirs) print "HIGH\t" p
        else           print "MED\t"  p
    } else {
        print "-\t" p
    }
}
'

awk -v drilledf="$DRILLED_FILE" -v dirsf="$FS_DIRS_FILE" "$classify_new_awk" "$NEW_FILE" > "$NEW_SEV_FILE"

while IFS= read -r p; do
    [[ -z "$p" ]] && continue
    if [[ -d "$TASKS_ROOT" ]] && grep -rFq --include='*.md' -- "$p" "$TASKS_ROOT" 2>/dev/null; then
        printf "HIGH\t%s\n" "$p"
    else
        printf "MED\t%s\n" "$p"
    fi
done < "$GHOST_FILE" > "$GHOST_SEV_FILE"

HIGH=$(awk -F'\t' '$1 == "HIGH"' "$NEW_SEV_FILE" "$GHOST_SEV_FILE" | wc -l | tr -d ' ')
MED=$( awk -F'\t' '$1 == "MED"'  "$NEW_SEV_FILE" "$GHOST_SEV_FILE" | wc -l | tr -d ' ')
LOW=$( awk -F'\t' '$1 == "LOW"'  "$NEW_SEV_FILE" "$GHOST_SEV_FILE" | wc -l | tr -d ' ')

# ─── Step 5: Output ───

emit_json() {
    local new_json ghost_json
    new_json=$(jq -R . < "$NEW_FILE"   | jq -s 'map(select(length > 0))')
    ghost_json=$(jq -R . < "$GHOST_FILE" | jq -s 'map(select(length > 0))')
    jq -n \
        --argjson new "$new_json" \
        --argjson ghost "$ghost_json" \
        --argjson high "$HIGH" \
        --argjson med  "$MED" \
        --argjson low  "$LOW" \
        '{
            new: $new,
            ghost: $ghost,
            severity: { high: $high, med: $med, low: $low }
        }'
}

emit_human() {
    echo "Doc-structure drift report"
    echo "  STRUCTURE_FILE = $STRUCTURE_FILE"
    echo "  SCAN_ROOTS     = $SCAN_ROOTS"
    echo "  TASKS_ROOT     = $TASKS_ROOT"
    echo ""
    echo "NEW (on disk, not documented):"
    if [[ ! -s "$NEW_SEV_FILE" ]]; then
        echo "  (none)"
    else
        awk -F'\t' '{ printf "  [%-4s] %s\n", $1, $2 }' "$NEW_SEV_FILE"
    fi
    echo ""
    echo "GHOST (documented, missing on disk):"
    if [[ ! -s "$GHOST_SEV_FILE" ]]; then
        echo "  (none)"
    else
        awk -F'\t' '{ printf "  [%-4s] %s\n", $1, $2 }' "$GHOST_SEV_FILE"
    fi
    echo ""
    echo "Summary: HIGH=$HIGH MED=$MED LOW=$LOW"
}

case "$MODE" in
    json)  emit_json ;;
    human) emit_human ;;
esac

# ─── Step 6: Fail-on gating ───
case "$FAIL_ON" in
    high) (( HIGH > 0 )) && exit 1 || exit 0 ;;
    med)  (( HIGH + MED > 0 )) && exit 1 || exit 0 ;;
    "")   exit 0 ;;
esac
