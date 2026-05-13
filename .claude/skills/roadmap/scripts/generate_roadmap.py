"""Generate docs/ROADMAP.md and docs/tasks/T###-*.md from roadmap-input.json.

stdlib-only. Validation enforced via dataclass __post_init__ and a top-level
RoadmapInput.__post_init__ that checks:
- DAG cycle detection on blocked_by/blocks
- task IDs unique and well-formed (T###)
- phase.task_ids ↔ tasks[]
- prd_feature_ids ↔ docs/PRD.md (extracted F-IDs); skipped with a warning
  if PRD.md is missing
- sequence 3-10 lines
- DoD ≥1 item
- Completed status consistency (status=Completed ⇒ all DoD checked AND
  change_history has ≥1 entry)
- branch_type in valid set

Renders:
- docs/ROADMAP.md
- docs/tasks/T###-{slug}.md (per task)

Usage:
    python3 generate_roadmap.py \
      --input docs/.harness/roadmap-input.json \
      --roadmap docs/ROADMAP.md \
      --tasks-dir docs/tasks
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VALID_TASK_STATUS = {"Pending", "Priority", "InProgress", "Completed"}
VALID_PHASE_STATUS = {"Pending", "InProgress", "Completed"}
VALID_BRANCH_TYPE = {"feature", "fix", "chore", "docs", "refactor", "test"}
VALID_GRAPH_RENDER = {"mermaid", "text", "none"}

TASK_ID_RE = re.compile(r"^T\d{3}$")
PHASE_ID_RE = re.compile(r"^P\d+$")
PRD_FEATURE_ID_RE = re.compile(r"^F\d{3}$|^F-[A-Z]+-\d{3}$")
# matches "#### F001 — ..." or "#### F-AUTH-001 — ..." inside docs/PRD.md
PRD_HEADING_RE = re.compile(r"^####\s+(F\d{3}|F-[A-Z]+-\d{3})\b")

PHASE_STATUS_BADGE = {
    "Completed": "✅ Completed",
    "InProgress": "🚧 InProgress",
    "Pending": "⏳ Pending",
}


def _require(value: str, name: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} is required and must be a non-empty string")


# ---------------------------------------------------------------------------
# Schema (dataclass tree)
# ---------------------------------------------------------------------------


@dataclass
class Meta:
    project_name: str
    doc_version: str
    prd_path: str

    def __post_init__(self) -> None:
        _require(self.project_name, "meta.project_name")
        _require(self.doc_version, "meta.doc_version")
        _require(self.prd_path, "meta.prd_path")


@dataclass
class Overview:
    summary: str
    core_features: list[str]

    def __post_init__(self) -> None:
        _require(self.summary, "overview.summary")
        if not self.core_features:
            raise ValueError("overview.core_features must have ≥1 entry")


@dataclass
class Phase:
    id: str
    title: str
    description: str
    status: str
    task_ids: list[str]

    def __post_init__(self) -> None:
        if not PHASE_ID_RE.match(self.id):
            raise ValueError(f"phase.id {self.id!r} must match /^P\\d+$/")
        _require(self.title, "phase.title")
        if self.status not in VALID_PHASE_STATUS:
            raise ValueError(
                f"phase {self.id}: status must be one of {sorted(VALID_PHASE_STATUS)}, "
                f"got {self.status!r}"
            )
        if not isinstance(self.task_ids, list):
            raise ValueError(f"phase {self.id}: task_ids must be a list")
        for tid in self.task_ids:
            if not TASK_ID_RE.match(tid):
                raise ValueError(
                    f"phase {self.id}: task_id {tid!r} must match /^T\\d{{3}}$/"
                )


@dataclass
class DoDItem:
    text: str
    completed: bool

    def __post_init__(self) -> None:
        _require(self.text, "dod_item.text")
        if not isinstance(self.completed, bool):
            raise ValueError(
                f"dod_item.completed must be bool, got {type(self.completed).__name__}"
            )


@dataclass
class OpenQuestion:
    text: str
    default: str | None = None
    needs_user: bool = True

    def __post_init__(self) -> None:
        _require(self.text, "open_question.text")
        if not isinstance(self.needs_user, bool):
            raise ValueError("open_question.needs_user must be bool")


@dataclass
class ChangeHistoryEntry:
    date: str
    changes: str
    author: str


@dataclass
class Task:
    id: str
    slug: str
    title: str
    branch_type: str
    phase_id: str
    status: str
    purpose: str
    prd_feature_ids: list[str]
    blocked_by: list[str]
    blocks: list[str]
    io_contract: str
    sequence: list[str]
    edge_cases_impl: str
    dod: list[DoDItem]
    open_questions: list[OpenQuestion] = field(default_factory=list)
    change_history: list[ChangeHistoryEntry] = field(default_factory=list)

    def __post_init__(self) -> None:
        if not TASK_ID_RE.match(self.id):
            raise ValueError(f"task.id {self.id!r} must match /^T\\d{{3}}$/")
        _require(self.slug, f"task {self.id}: slug")
        if not re.match(r"^[a-z0-9][a-z0-9-]*$", self.slug):
            raise ValueError(
                f"task {self.id}: slug {self.slug!r} must be lowercase kebab-case"
            )
        _require(self.title, f"task {self.id}: title")
        if self.branch_type not in VALID_BRANCH_TYPE:
            raise ValueError(
                f"task {self.id}: branch_type must be one of "
                f"{sorted(VALID_BRANCH_TYPE)}, got {self.branch_type!r}"
            )
        if not PHASE_ID_RE.match(self.phase_id):
            raise ValueError(
                f"task {self.id}: phase_id {self.phase_id!r} must match /^P\\d+$/"
            )
        if self.status not in VALID_TASK_STATUS:
            raise ValueError(
                f"task {self.id}: status must be one of {sorted(VALID_TASK_STATUS)}, "
                f"got {self.status!r}"
            )
        _require(self.purpose, f"task {self.id}: purpose")
        for fid in self.prd_feature_ids:
            if not PRD_FEATURE_ID_RE.match(fid):
                raise ValueError(
                    f"task {self.id}: prd_feature_id {fid!r} must match "
                    "/^F\\d{3}$|^F-[A-Z]+-\\d{3}$/"
                )
        for tid in self.blocked_by:
            if tid != "none" and not TASK_ID_RE.match(tid):
                raise ValueError(
                    f"task {self.id}: blocked_by entry {tid!r} must be 'none' or T###"
                )
        for tid in self.blocks:
            if tid != "none" and not TASK_ID_RE.match(tid):
                raise ValueError(
                    f"task {self.id}: blocks entry {tid!r} must be 'none' or T###"
                )
        _require(self.io_contract, f"task {self.id}: io_contract")
        if not (3 <= len(self.sequence) <= 10):
            raise ValueError(
                f"task {self.id}: sequence must have 3-10 lines, "
                f"got {len(self.sequence)}"
            )
        for line in self.sequence:
            _require(line, f"task {self.id}: sequence line")
        _require(self.edge_cases_impl, f"task {self.id}: edge_cases_impl")
        if not self.dod:
            raise ValueError(f"task {self.id}: dod must have ≥1 item")
        if self.status == "Completed":
            uncompleted = [d.text for d in self.dod if not d.completed]
            if uncompleted:
                raise ValueError(
                    f"task {self.id}: status=Completed but DoD has unchecked items: "
                    f"{uncompleted}"
                )
            if not self.change_history:
                raise ValueError(
                    f"task {self.id}: status=Completed but change_history is empty"
                )


@dataclass
class PRDFeatureCoverage:
    feature_id: str
    feature_name: str
    task_ids: list[str]

    def __post_init__(self) -> None:
        if not PRD_FEATURE_ID_RE.match(self.feature_id):
            raise ValueError(
                f"prd_feature_coverage.feature_id {self.feature_id!r} must match "
                "/^F\\d{3}$|^F-[A-Z]+-\\d{3}$/"
            )
        _require(self.feature_name, "prd_feature_coverage.feature_name")
        for tid in self.task_ids:
            if not TASK_ID_RE.match(tid):
                raise ValueError(
                    f"prd_feature_coverage[{self.feature_id}]: task_id {tid!r} invalid"
                )


@dataclass
class RoadmapInput:
    meta: Meta
    overview: Overview
    phases: list[Phase]
    tasks: list[Task]
    prd_feature_coverage: list[PRDFeatureCoverage]
    dependency_graph_render: str

    def __post_init__(self) -> None:
        if not self.phases:
            raise ValueError("phases must have ≥1 entry")
        if not self.tasks:
            raise ValueError("tasks must have ≥1 entry")
        if self.dependency_graph_render not in VALID_GRAPH_RENDER:
            raise ValueError(
                f"dependency_graph_render must be one of {sorted(VALID_GRAPH_RENDER)}"
            )

        seen: set[str] = set()
        for t in self.tasks:
            if t.id in seen:
                raise ValueError(f"task.id {t.id!r} is duplicated")
            seen.add(t.id)

        phase_ids = {p.id for p in self.phases}
        for t in self.tasks:
            if t.phase_id not in phase_ids:
                raise ValueError(
                    f"task {t.id}: phase_id {t.phase_id!r} not declared in phases"
                )

        task_ids = {t.id for t in self.tasks}
        for p in self.phases:
            for tid in p.task_ids:
                if tid not in task_ids:
                    raise ValueError(
                        f"phase {p.id}: task_id {tid!r} not present in tasks[]"
                    )
        phase_member_index: dict[str, str] = {}
        for p in self.phases:
            for tid in p.task_ids:
                if tid in phase_member_index:
                    raise ValueError(
                        f"task {tid} is listed in multiple phases: "
                        f"{phase_member_index[tid]} and {p.id}"
                    )
                phase_member_index[tid] = p.id
        for t in self.tasks:
            owner = phase_member_index.get(t.id)
            if owner is None:
                raise ValueError(
                    f"task {t.id} is not listed in any phase.task_ids"
                )
            if owner != t.phase_id:
                raise ValueError(
                    f"task {t.id}: phase_id={t.phase_id!r} but listed under {owner}"
                )

        for t in self.tasks:
            for tid in t.blocked_by:
                if tid != "none" and tid not in task_ids:
                    raise ValueError(
                        f"task {t.id}: blocked_by references unknown {tid!r}"
                    )
            for tid in t.blocks:
                if tid != "none" and tid not in task_ids:
                    raise ValueError(
                        f"task {t.id}: blocks references unknown {tid!r}"
                    )

        edges: dict[str, list[str]] = {t.id: [] for t in self.tasks}
        for t in self.tasks:
            for prev in t.blocked_by:
                if prev != "none":
                    edges[prev].append(t.id)
            for nxt in t.blocks:
                if nxt != "none" and nxt not in edges[t.id]:
                    edges[t.id].append(nxt)

        WHITE, GRAY, BLACK = 0, 1, 2
        color = {tid: WHITE for tid in edges}

        def _visit(node: str, stack: list[str]) -> None:
            if color[node] == GRAY:
                cycle = " → ".join(stack[stack.index(node):] + [node])
                raise ValueError(f"task dependency cycle: {cycle}")
            if color[node] == BLACK:
                return
            color[node] = GRAY
            for nxt in edges[node]:
                _visit(nxt, stack + [node])
            color[node] = BLACK

        for tid in edges:
            _visit(tid, [])

        for cov in self.prd_feature_coverage:
            for tid in cov.task_ids:
                if tid not in task_ids:
                    raise ValueError(
                        f"prd_feature_coverage[{cov.feature_id}]: "
                        f"task_id {tid!r} not present in tasks[]"
                    )


# ---------------------------------------------------------------------------
# Loader (raw dict → dataclass tree)
# ---------------------------------------------------------------------------


def _at(data: dict[str, Any], *path: str) -> Any:
    cur: Any = data
    walked: list[str] = []
    for key in path:
        walked.append(key)
        if not isinstance(cur, dict):
            raise ValueError(
                f"expected object at {'.'.join(walked[:-1]) or '<root>'}, "
                f"got {type(cur).__name__}"
            )
        if key not in cur:
            raise KeyError(f"missing required key: {'.'.join(walked)}")
        cur = cur[key]
    return cur


def load_input(raw: dict[str, Any]) -> RoadmapInput:
    meta = Meta(**_at(raw, "meta"))

    ov_raw = _at(raw, "overview")
    overview = Overview(
        summary=ov_raw["summary"],
        core_features=ov_raw.get("core_features", []),
    )

    phases = [Phase(**p) for p in _at(raw, "phases")]

    tasks: list[Task] = []
    for t in _at(raw, "tasks"):
        dod_items = [DoDItem(**d) for d in t.get("dod", [])]
        oqs = [OpenQuestion(**oq) for oq in t.get("open_questions", [])]
        ch = [ChangeHistoryEntry(**c) for c in t.get("change_history", [])]
        tasks.append(
            Task(
                id=t["id"],
                slug=t["slug"],
                title=t["title"],
                branch_type=t["branch_type"],
                phase_id=t["phase_id"],
                status=t["status"],
                purpose=t["purpose"],
                prd_feature_ids=t.get("prd_feature_ids", []),
                blocked_by=t.get("blocked_by", []) or ["none"],
                blocks=t.get("blocks", []) or ["none"],
                io_contract=t["io_contract"],
                sequence=t["sequence"],
                edge_cases_impl=t["edge_cases_impl"],
                dod=dod_items,
                open_questions=oqs,
                change_history=ch,
            )
        )

    coverage = [
        PRDFeatureCoverage(**c) for c in raw.get("prd_feature_coverage", [])
    ]

    graph_render = raw.get("dependency_graph_render", "mermaid")

    return RoadmapInput(
        meta=meta,
        overview=overview,
        phases=phases,
        tasks=tasks,
        prd_feature_coverage=coverage,
        dependency_graph_render=graph_render,
    )


# ---------------------------------------------------------------------------
# PRD F-ID cross-check
# ---------------------------------------------------------------------------


def extract_prd_feature_ids(prd_path: Path) -> set[str] | None:
    """Return the set of F-IDs present in PRD.md, or None if PRD missing."""
    if not prd_path.exists():
        return None
    ids: set[str] = set()
    for line in prd_path.read_text(encoding="utf-8").splitlines():
        m = PRD_HEADING_RE.match(line)
        if m:
            ids.add(m.group(1))
    return ids


def cross_check_prd(rmap: RoadmapInput, prd_ids: set[str] | None) -> None:
    if prd_ids is None:
        sys.stderr.write(
            f"[WARN] PRD not found at {rmap.meta.prd_path}; "
            "skipping prd_feature_ids cross-check\n"
        )
        return
    for t in rmap.tasks:
        for fid in t.prd_feature_ids:
            if fid not in prd_ids:
                raise ValueError(
                    f"task {t.id}: prd_feature_id {fid!r} not declared in "
                    f"{rmap.meta.prd_path}"
                )
    for cov in rmap.prd_feature_coverage:
        if cov.feature_id not in prd_ids:
            raise ValueError(
                f"prd_feature_coverage.feature_id {cov.feature_id!r} not "
                f"declared in {rmap.meta.prd_path}"
            )


# ---------------------------------------------------------------------------
# Render helpers
# ---------------------------------------------------------------------------


PLACEHOLDER_NA = "_해당 없음_"
PLACEHOLDER_EMPTY = "_없음_"


def _bullets(items: list[str]) -> str:
    if not items:
        return PLACEHOLDER_EMPTY
    return "\n".join(f"- {x}" for x in items)


def _table(headers: list[str], rows: list[list[Any]]) -> str:
    if not rows:
        return PLACEHOLDER_EMPTY
    head = "| " + " | ".join(headers) + " |"
    sep = "| " + " | ".join("---" for _ in headers) + " |"
    body = [
        "| " + " | ".join(_md_escape(c) for c in row) + " |" for row in rows
    ]
    return "\n".join([head, sep, *body])


def _md_escape(value: Any) -> str:
    text = str(value) if value is not None else ""
    return text.replace("|", "\\|").replace("\n", "<br>")


def _completion_marker(status: str) -> str:
    return "[x]" if status == "Completed" else "[ ]"


def _phase_label(p: Phase) -> str:
    if p.status == "Completed":
        return f"{p.title} ✅"
    return p.title


# ---------------------------------------------------------------------------
# ROADMAP renderer
# ---------------------------------------------------------------------------


def render_roadmap(rmap: RoadmapInput) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    parts: list[str] = []

    parts.append(f"# {rmap.meta.project_name} Development Roadmap\n")
    parts.append(
        f"\n> **생성일**: {today} | **문서 버전**: {rmap.meta.doc_version} | "
        f"**PRD**: [{rmap.meta.prd_path}](/{rmap.meta.prd_path}) | "
        "**작성자**: roadmap-generator\n"
    )
    parts.append(f"\n{rmap.overview.summary}\n")

    parts.append("\n## Overview\n")
    parts.append(_bullets(rmap.overview.core_features) + "\n")

    parts.append("\n## Phase 진행 현황\n")
    phase_rows = [
        [
            p.id,
            p.title,
            PHASE_STATUS_BADGE[p.status],
            ", ".join(p.task_ids) if p.task_ids else PLACEHOLDER_EMPTY,
        ]
        for p in rmap.phases
    ]
    parts.append(_table(["Phase", "제목", "상태", "Tasks"], phase_rows) + "\n")

    by_phase: dict[str, list[Task]] = {p.id: [] for p in rmap.phases}
    for t in rmap.tasks:
        by_phase[t.phase_id].append(t)

    for p in rmap.phases:
        parts.append(f"\n## {p.id}: {_phase_label(p)}\n")
        if p.description.strip():
            parts.append(f"\n{p.description}\n")

        if not by_phase[p.id]:
            parts.append(f"\n{PLACEHOLDER_EMPTY}\n")
            continue

        ordered = sorted(by_phase[p.id], key=lambda t: t.id)
        for t in ordered:
            mark = _completion_marker(t.status)
            tag = "✅" if t.status == "Completed" else (
                " — Priority" if t.status == "Priority" else ""
            )
            parts.append(
                f"\n- {mark} **{t.id} — {t.branch_type}: {t.title}**{tag}\n"
            )
            parts.append(
                f"  - **blockedBy**: "
                f"{', '.join(t.blocked_by) if t.blocked_by else 'none'}\n"
            )
            parts.append(
                f"  - **blocks**: "
                f"{', '.join(t.blocks) if t.blocks else 'none'}\n"
            )
            parts.append(
                f"  - **Must Read**: "
                f"[{t.id}-{t.slug}.md](/docs/tasks/{t.id}-{t.slug}.md)\n"
            )
            if t.prd_feature_ids:
                parts.append(
                    f"  - **PRD Features**: {', '.join(t.prd_feature_ids)}\n"
                )
            parts.append(f"  - {t.purpose}\n")

    parts.append("\n## Dependency Graph\n")
    if rmap.dependency_graph_render == "mermaid":
        parts.append("\n```mermaid\n")
        parts.append("graph TD\n")
        for t in rmap.tasks:
            parts.append(f"  {t.id}[\"{t.id}: {t.title}\"]\n")
        for t in rmap.tasks:
            for nxt in t.blocks:
                if nxt != "none":
                    parts.append(f"  {t.id} --> {nxt}\n")
        parts.append("```\n")
    elif rmap.dependency_graph_render == "text":
        parts.append("\n")
        for t in rmap.tasks:
            for nxt in t.blocks:
                if nxt != "none":
                    parts.append(f"- {t.id} → {nxt}\n")
    else:
        parts.append(f"\n{PLACEHOLDER_NA}\n")

    parts.append("\n## PRD Feature Coverage\n")
    if rmap.prd_feature_coverage:
        cov_rows = [
            [c.feature_id, c.feature_name, ", ".join(c.task_ids) or PLACEHOLDER_EMPTY]
            for c in rmap.prd_feature_coverage
        ]
        parts.append(
            _table(["Feature ID", "기능명", "담당 Tasks"], cov_rows) + "\n"
        )
    else:
        parts.append(f"\n{PLACEHOLDER_NA}\n")

    return "".join(parts)


# ---------------------------------------------------------------------------
# Task file renderer
# ---------------------------------------------------------------------------


def _render_dod(dod: list[DoDItem]) -> str:
    return "\n".join(
        f"- [{'x' if d.completed else ' '}] {d.text}" for d in dod
    )


def _render_open_questions(oqs: list[OpenQuestion]) -> str:
    if not oqs:
        return "모두 해결됨 (No open questions)"
    lines: list[str] = []
    for q in oqs:
        marker = "[NEEDS USER]" if q.needs_user else "[NOTE]"
        suffix = f" 기본 제안: {q.default}." if q.default else ""
        lines.append(f"- [ ] `{marker}` {q.text}{suffix}")
    return "\n".join(lines)


def _render_change_history(ch: list[ChangeHistoryEntry]) -> str:
    if not ch:
        return _table(["날짜", "변경", "작성자"], [["-", "-", "-"]])
    rows = [[e.date, e.changes, e.author] for e in ch]
    return _table(["날짜", "변경", "작성자"], rows)


def _resolve_task_links(
    ids: list[str], task_index: dict[str, Task]
) -> str:
    if not ids:
        return "none"
    parts: list[str] = []
    for tid in ids:
        if tid == "none":
            return "none"
        t = task_index.get(tid)
        if t is None:
            parts.append(tid)
        else:
            parts.append(f"[{tid}]({tid}-{t.slug}.md)")
    return ", ".join(parts)


def render_task(t: Task, task_index: dict[str, Task]) -> str:
    parts: list[str] = []
    parts.append(f"# {t.id} — {t.branch_type}: {t.title}\n")
    parts.append(f"\n> **상위 ROADMAP**: [`../ROADMAP.md`](../ROADMAP.md)\n")
    parts.append(f"> **branch type**: `{t.branch_type}/`\n")
    parts.append(
        f"> **선행**: {_resolve_task_links(t.blocked_by, task_index)}\n"
    )
    parts.append(
        f"> **후행**: {_resolve_task_links(t.blocks, task_index)}\n"
    )
    parts.append("\n---\n")

    parts.append("\n## 목적\n")
    parts.append(f"\n{t.purpose}\n")

    parts.append("\n## PRD Feature ID 매핑\n")
    if t.prd_feature_ids:
        parts.append("\n" + _bullets(t.prd_feature_ids) + "\n")
    else:
        parts.append(f"\n{PLACEHOLDER_NA}\n")

    parts.append("\n## 입력·출력 계약\n")
    parts.append(f"\n{t.io_contract}\n")

    parts.append("\n## 시퀀스\n")
    parts.append("\n```\n")
    for i, line in enumerate(t.sequence, start=1):
        cleaned = re.sub(r"^\s*\d+\.\s+", "", line)
        parts.append(f"{i}. {cleaned}\n")
    parts.append("```\n")

    parts.append("\n## 엣지 케이스 + 구현\n")
    parts.append(f"\n{t.edge_cases_impl}\n")

    parts.append("\n## DoD\n")
    parts.append(f"\n{_render_dod(t.dod)}\n")

    parts.append("\n## Open Questions\n")
    parts.append(f"\n{_render_open_questions(t.open_questions)}\n")

    parts.append("\n## Change History\n")
    parts.append(f"\n{_render_change_history(t.change_history)}\n")

    return "".join(parts)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def _backup(path: Path) -> Path | None:
    if not path.exists():
        return None
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup = path.with_name(f"{path.name}.bak.{ts}")
    shutil.copy(path, backup)
    return backup


def _write_if_changed(path: Path, content: str) -> tuple[bool, Path | None]:
    """Write only when content differs. Backup the prior version on change.

    Returns (changed, backup_path). Identical content → no-op (no backup,
    no write). New file → write without backup.
    """
    if path.exists() and path.read_text(encoding="utf-8") == content:
        return (False, None)
    backup = _backup(path)
    path.write_text(content, encoding="utf-8")
    return (True, backup)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate ROADMAP.md and task files from roadmap-input.json"
    )
    parser.add_argument("--input", required=True, type=Path)
    parser.add_argument("--roadmap", required=True, type=Path)
    parser.add_argument("--tasks-dir", required=True, type=Path)
    args = parser.parse_args(argv)

    if not args.input.exists():
        sys.stderr.write(f"[REJECT] input file not found: {args.input}\n")
        return 1

    try:
        raw = json.loads(args.input.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        sys.stderr.write(f"[REJECT] {args.input} is not valid JSON: {e}\n")
        return 1

    if not isinstance(raw, dict):
        sys.stderr.write(
            f"[REJECT] {args.input} must contain a JSON object at the root\n"
        )
        return 1

    try:
        rmap = load_input(raw)
    except (TypeError, ValueError, KeyError) as e:
        sys.stderr.write(f"[REJECT] {e}\n")
        return 1

    prd_path = Path(rmap.meta.prd_path)
    try:
        prd_ids = extract_prd_feature_ids(prd_path)
        cross_check_prd(rmap, prd_ids)
    except ValueError as e:
        sys.stderr.write(f"[REJECT] {e}\n")
        return 1

    args.tasks_dir.mkdir(parents=True, exist_ok=True)
    args.roadmap.parent.mkdir(parents=True, exist_ok=True)

    roadmap_md = render_roadmap(rmap)
    roadmap_changed, roadmap_backup = _write_if_changed(args.roadmap, roadmap_md)

    task_index = {t.id: t for t in rmap.tasks}
    changed_tasks: list[Path] = []
    skipped_tasks: list[Path] = []
    for t in rmap.tasks:
        out = args.tasks_dir / f"{t.id}-{t.slug}.md"
        changed, _ = _write_if_changed(out, render_task(t, task_index))
        (changed_tasks if changed else skipped_tasks).append(out)

    if roadmap_backup is not None:
        print(f"[OK] backup → {roadmap_backup}")
    if roadmap_changed:
        print(f"[OK] {args.roadmap} written ({len(roadmap_md):,} chars)")
    else:
        print(f"[SKIP] {args.roadmap} unchanged")
    for p in changed_tasks:
        print(f"[OK] {p} written")
    if skipped_tasks:
        print(f"[SKIP] {len(skipped_tasks)} task file(s) unchanged")
    return 0


if __name__ == "__main__":
    sys.exit(main())
