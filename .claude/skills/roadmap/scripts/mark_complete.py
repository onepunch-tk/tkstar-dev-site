"""Mark a task as completed by editing markdown files directly.

Used by Phase 4 doc-sync to flip a task's DoD checkboxes, append a Change
History entry, and switch the ROADMAP entry from `- [ ]` to `- [x] ... ✅`.
Does NOT round-trip through roadmap-input.json — pure markdown surgery so
that a single task's completion does not require re-rendering the entire
roadmap.

For structural changes (adding/removing tasks, re-ordering phases), edit
docs/.harness/roadmap-input.json and re-run generate_roadmap.py instead.

Usage:
    python3 mark_complete.py \
      --task T013 \
      --change "Phase 2 (T013) 머지" \
      --author "TaekyungHa" \
      --roadmap docs/ROADMAP.md \
      --tasks-dir docs/tasks
"""

from __future__ import annotations

import argparse
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

TASK_ID_RE = re.compile(r"^T\d{3}$")


def find_task_file(tasks_dir: Path, task_id: str) -> Path:
    matches = sorted(tasks_dir.glob(f"{task_id}-*.md"))
    if not matches:
        raise FileNotFoundError(
            f"no task file matching {task_id}-*.md under {tasks_dir}"
        )
    if len(matches) > 1:
        raise RuntimeError(
            f"multiple task files matched {task_id}: "
            f"{', '.join(p.name for p in matches)}"
        )
    return matches[0]


def flip_dod(body: str) -> tuple[str, int]:
    """Flip every `- [ ]` to `- [x]` inside the `## DoD` section."""
    lines = body.splitlines(keepends=True)
    in_dod = False
    flipped = 0
    out: list[str] = []
    for ln in lines:
        if ln.startswith("## "):
            in_dod = ln.strip() == "## DoD"
            out.append(ln)
            continue
        if in_dod:
            new = re.sub(r"^(\s*-\s*)\[ \]", r"\1[x]", ln)
            if new != ln:
                flipped += 1
            out.append(new)
        else:
            out.append(ln)
    return "".join(out), flipped


def append_change_history(body: str, date: str, change: str, author: str) -> str:
    """Append a row to the `## Change History` table.

    If the existing table has only the placeholder row `| - | - | - |`,
    replace that row with the new entry. Otherwise, insert the new row
    immediately after the separator row (keeping newest at the top).
    """
    lines = body.splitlines(keepends=True)
    in_history = False
    sep_idx = -1
    placeholder_idx = -1
    last_table_idx = -1

    for i, ln in enumerate(lines):
        if ln.startswith("## "):
            in_history = ln.strip() == "## Change History"
            continue
        if not in_history:
            continue
        stripped = ln.strip()
        if stripped.startswith("|") and stripped.endswith("|"):
            last_table_idx = i
            if re.match(r"^\|\s*-+\s*\|", stripped) and "---" in stripped:
                sep_idx = i
            elif re.match(r"^\|\s*-\s*\|\s*-\s*\|\s*-\s*\|$", stripped):
                placeholder_idx = i

    new_row = f"| {date} | {change} | {author} |\n"
    if sep_idx == -1:
        sys.stderr.write(
            "[WARN] could not locate Change History table; appending row at end\n"
        )
        return body.rstrip() + "\n\n" + new_row

    if placeholder_idx >= 0:
        lines[placeholder_idx] = new_row
    else:
        insert_at = sep_idx + 1
        lines.insert(insert_at, new_row)
    _ = last_table_idx
    return "".join(lines)


def flip_roadmap_entry(roadmap: str, task_id: str) -> tuple[str, bool]:
    """Replace `- [ ] **T013 — ...**` with `- [x] **T013 — ...** ✅`."""
    pattern = re.compile(
        rf"^(- )\[ \]( \*\*{re.escape(task_id)} —[^\n]*?\*\*)([^\n]*)$",
        re.MULTILINE,
    )
    found = False

    def _replace(m: re.Match[str]) -> str:
        nonlocal found
        found = True
        tail = m.group(3)
        if "✅" not in tail:
            tail = (tail.rstrip() + " ✅").lstrip(" ") if tail.strip() else " ✅"
            tail = (
                tail
                if tail.startswith(" ")
                else " " + tail
            )
        return f"{m.group(1)}[x]{m.group(2)}{tail}"

    new_roadmap = pattern.sub(_replace, roadmap, count=1)
    return new_roadmap, found


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Mark a task as completed in ROADMAP.md and its task file"
    )
    parser.add_argument("--task", required=True, help="Task ID, e.g. T013")
    parser.add_argument(
        "--change", required=True, help="Change-history entry text"
    )
    parser.add_argument("--author", required=True, help="Author name")
    parser.add_argument(
        "--roadmap", required=True, type=Path, help="Path to docs/ROADMAP.md"
    )
    parser.add_argument(
        "--tasks-dir", required=True, type=Path, help="Path to docs/tasks/"
    )
    parser.add_argument(
        "--date",
        default=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        help="ISO date for the Change History row (default: today UTC)",
    )
    args = parser.parse_args(argv)

    if not TASK_ID_RE.match(args.task):
        sys.stderr.write(f"[REJECT] --task {args.task!r} must match /^T\\d{{3}}$/\n")
        return 1

    if not args.roadmap.exists():
        sys.stderr.write(f"[REJECT] roadmap not found: {args.roadmap}\n")
        return 1
    if not args.tasks_dir.exists():
        sys.stderr.write(f"[REJECT] tasks dir not found: {args.tasks_dir}\n")
        return 1

    try:
        task_file = find_task_file(args.tasks_dir, args.task)
    except (FileNotFoundError, RuntimeError) as e:
        sys.stderr.write(f"[REJECT] {e}\n")
        return 1

    body = task_file.read_text(encoding="utf-8")
    body2, flipped = flip_dod(body)
    if flipped == 0:
        sys.stderr.write(
            f"[WARN] {task_file.name}: no `- [ ]` items flipped in ## DoD "
            "(already complete or section missing)\n"
        )
    body3 = append_change_history(body2, args.date, args.change, args.author)
    task_file.write_text(body3, encoding="utf-8")

    roadmap_text = args.roadmap.read_text(encoding="utf-8")
    new_roadmap, replaced = flip_roadmap_entry(roadmap_text, args.task)
    if not replaced:
        sys.stderr.write(
            f"[REJECT] {args.roadmap}: no `- [ ] **{args.task} — ...` line found\n"
        )
        return 1
    args.roadmap.write_text(new_roadmap, encoding="utf-8")

    print(f"[OK] {task_file}: DoD flipped ({flipped} items), Change History updated")
    print(f"[OK] {args.roadmap}: {args.task} marked [x] ✅")
    return 0


if __name__ == "__main__":
    sys.exit(main())
