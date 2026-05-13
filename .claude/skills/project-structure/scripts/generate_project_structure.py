"""Generate docs/PROJECT-STRUCTURE.md from a structured project-structure-input.json.

stdlib-only: dataclass schemas with __post_init__ validation enforce the
scope discipline (no data_model / no features / no code snippets / no
tech-stack recommendations) and the supported-framework enum. Missing or
malformed input exits 1 with a [REJECT] message on stderr.

Usage:
    python3 generate_project_structure.py \\
        --input docs/.harness/project-structure-input.json \\
        --output docs/PROJECT-STRUCTURE.md
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

# ---------------------------------------------------------------------------
# Enum sets
# ---------------------------------------------------------------------------

SUPPORTED_FRAMEWORKS = {"react-router", "expo", "nestjs", "tauri"}
SUPPORTED_LAYOUTS = {"single", "monorepo"}
SUPPORTED_MONOREPO_TOOLS = {"turbo", "pnpm-workspaces", "workspaces", "nx", "lerna"}
STANDARD_LAYER_NAMES = {"Domain", "Application", "Infrastructure", "Presentation"}

# Token patterns that suggest the input contains code rather than directory /
# prose. Patterns require a body character ([^}]) or follow-up keyword so
# directory names like `class-helpers/` and prose references that mention
# `#[tauri::command]` inside backticks do not false-trigger. Prose fields
# strip backtick-fenced inline / block code before matching (see
# _strip_md_code).
CODE_TOKEN_PATTERNS = [
    re.compile(r"\bclass\s+\w+\s*\{[^}]"),
    re.compile(r"\bclass\s+\w+\s+extends\s+\w"),
    re.compile(r"\binterface\s+\w+\s*\{[^}]"),
    re.compile(r"\bfunction\s+\w+\s*\([^)]*\)\s*\{[^}]"),
    re.compile(r"\bexport\s+(const|function|class|default|interface)\s+\w"),
    re.compile(r"^\s*import\s+.*\sfrom\s+['\"]", re.MULTILINE),
    re.compile(r"=>\s*\{[^}]"),
    # Rust fn body: fn name(args) { OR fn name(args) -> Type {
    re.compile(r"\bfn\s+\w+\s*\([^)]*\)\s*(->\s*[^\{]+)?\s*\{[^}]"),
    # tauri command attribute followed by an fn declaration
    re.compile(r"#\[tauri::command\][^\n]*\n\s*(pub\s+)?fn\s+\w+"),
]

# Markdown inline-code (`...`) and fenced-block (```...```) patterns for
# stripping prose fields before token scan. Trees are NOT stripped — they
# have no Markdown semantics; code tokens in trees should not occur at all
# under the narrow regex above.
_MD_FENCED_BLOCK = re.compile(r"```[\s\S]*?```")
_MD_INLINE_CODE = re.compile(r"`[^`\n]*`")


def _strip_md_code(text: str) -> str:
    return _MD_INLINE_CODE.sub("", _MD_FENCED_BLOCK.sub("", text))

# Disallowed JSON top-level keys — declared explicitly so accidental scope
# leakage (data model, features, etc.) fails fast with [REJECT].
DISALLOWED_TOP_LEVEL_KEYS = {
    "data_model",
    "entities",
    "features",
    "user_journeys",
    "user_flows",
    "business_logic",
    "code_examples",
    "code_snippets",
    "tech_stack",
    "tech_stack_recommendations",
    "nfr",
    "nfr_targets",
    "performance_targets",
}


def _require(value: Any, name: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} is required and must be a non-empty string")


def _check_code_tokens(text: str, label: str, *, strip_md_code: bool = False) -> None:
    target = _strip_md_code(text) if strip_md_code else text
    for pat in CODE_TOKEN_PATTERNS:
        match = pat.search(target)
        if match:
            raise ValueError(
                f"{label}: appears to contain code, not directory structure "
                f"or prose (matched pattern '{match.group(0).strip()}'). "
                f"project-structure document must describe directories and "
                f"layer responsibilities only — no class / interface / "
                f"function / import / fn body / tauri command body. "
                f"Inline-code references in prose are fine when wrapped in "
                f"backticks (e.g. \"`#[tauri::command]` 매크로\")."
            )


def _check_single_line(value: str, name: str) -> None:
    if "\n" in value or "\r" in value:
        raise ValueError(
            f"{name} must be a single line (no newlines). Multi-line values "
            f"break Markdown table rendering. If a longer explanation is "
            f"needed, move it into `framework_extras.content_md`."
        )


# ---------------------------------------------------------------------------
# Dataclass schema
# ---------------------------------------------------------------------------


@dataclass
class Meta:
    project_name: str
    doc_version: str
    repo_layout: str
    monorepo_tool: str | None = None

    def __post_init__(self) -> None:
        _require(self.project_name, "meta.project_name")
        _require(self.doc_version, "meta.doc_version")
        if self.repo_layout not in SUPPORTED_LAYOUTS:
            raise ValueError(
                f"meta.repo_layout '{self.repo_layout}' invalid; must be one of "
                f"{sorted(SUPPORTED_LAYOUTS)}"
            )
        if self.repo_layout == "monorepo":
            if not self.monorepo_tool:
                raise ValueError(
                    "meta.monorepo_tool is required when repo_layout='monorepo'"
                )
            if self.monorepo_tool not in SUPPORTED_MONOREPO_TOOLS:
                raise ValueError(
                    f"meta.monorepo_tool '{self.monorepo_tool}' invalid; must be one of "
                    f"{sorted(SUPPORTED_MONOREPO_TOOLS)}"
                )
        else:  # single
            if self.monorepo_tool:
                raise ValueError(
                    "meta.monorepo_tool must be null/absent when repo_layout='single'"
                )


@dataclass
class Layer:
    name: str
    paths: list[str]
    role_ko: str
    contains_ko: str

    def __post_init__(self) -> None:
        if self.name not in STANDARD_LAYER_NAMES:
            raise ValueError(
                f"layer.name '{self.name}' invalid; must be one of "
                f"{sorted(STANDARD_LAYER_NAMES)}"
            )
        if not isinstance(self.paths, list) or not self.paths:
            raise ValueError(f"layer[{self.name}].paths must be a non-empty list")
        for p in self.paths:
            _require(p, f"layer[{self.name}].paths[]")
            _check_single_line(p, f"layer[{self.name}].paths[]")
        _require(self.role_ko, f"layer[{self.name}].role_ko")
        _check_single_line(self.role_ko, f"layer[{self.name}].role_ko")
        _check_code_tokens(
            self.role_ko, f"layer[{self.name}].role_ko", strip_md_code=True
        )
        _require(self.contains_ko, f"layer[{self.name}].contains_ko")
        _check_single_line(self.contains_ko, f"layer[{self.name}].contains_ko")
        _check_code_tokens(
            self.contains_ko, f"layer[{self.name}].contains_ko", strip_md_code=True
        )


@dataclass
class Alias:
    pattern: str
    resolves_to: str

    def __post_init__(self) -> None:
        _require(self.pattern, "alias.pattern")
        _require(self.resolves_to, "alias.resolves_to")


@dataclass
class FrameworkExtras:
    section_title_ko: str
    content_md: str

    def __post_init__(self) -> None:
        _require(self.section_title_ko, "framework_extras.section_title_ko")
        _check_single_line(
            self.section_title_ko, "framework_extras.section_title_ko"
        )
        _require(self.content_md, "framework_extras.content_md")
        _check_code_tokens(
            self.content_md, "framework_extras.content_md", strip_md_code=True
        )


@dataclass
class FileLocationRow:
    task_ko: str
    location: str

    def __post_init__(self) -> None:
        _require(self.task_ko, "file_location_row.task_ko")
        _check_single_line(self.task_ko, "file_location_row.task_ko")
        _check_code_tokens(
            self.task_ko, "file_location_row.task_ko", strip_md_code=True
        )
        _require(self.location, "file_location_row.location")
        _check_single_line(self.location, "file_location_row.location")
        _check_code_tokens(
            self.location, "file_location_row.location", strip_md_code=True
        )


@dataclass
class SubPackage:
    name: str
    framework: str
    directory_tree: str
    layers: list[Layer]
    path_aliases: list[Alias]
    file_location_summary: list[FileLocationRow]
    framework_variant: str | None = None
    framework_extras: list[FrameworkExtras] = field(default_factory=list)

    def __post_init__(self) -> None:
        _require(self.name, "sub_package.name")
        if self.framework not in SUPPORTED_FRAMEWORKS:
            raise ValueError(
                f"sub_package[{self.name}].framework '{self.framework}' invalid; "
                f"must be one of {sorted(SUPPORTED_FRAMEWORKS)}. "
                f"If the actual framework is unsupported (next.js, vite-react, "
                f"remix, etc.), Pass 1 must ask the user to pick the closest "
                f"supported framework — never write the unsupported value here."
            )
        _require(self.directory_tree, f"sub_package[{self.name}].directory_tree")
        _check_code_tokens(
            self.directory_tree,
            f"sub_package[{self.name}].directory_tree",
            strip_md_code=False,
        )
        if not self.layers:
            raise ValueError(f"sub_package[{self.name}].layers must have ≥1 entry")
        layer_names = [layer.name for layer in self.layers]
        if len(layer_names) != len(set(layer_names)):
            raise ValueError(
                f"sub_package[{self.name}].layers contains duplicate layer names"
            )
        if not self.file_location_summary:
            raise ValueError(
                f"sub_package[{self.name}].file_location_summary must have ≥1 entry"
            )


@dataclass
class ProjectStructureInput:
    meta: Meta
    overview_ko: str
    sub_packages: list[SubPackage]

    def __post_init__(self) -> None:
        _require(self.overview_ko, "overview_ko")
        _check_code_tokens(self.overview_ko, "overview_ko", strip_md_code=True)
        if not self.sub_packages:
            raise ValueError("sub_packages must have ≥1 entry")
        if self.meta.repo_layout == "single" and len(self.sub_packages) != 1:
            raise ValueError(
                "sub_packages must have exactly 1 entry when repo_layout='single'; "
                f"got {len(self.sub_packages)}"
            )
        names = [sp.name for sp in self.sub_packages]
        if len(names) != len(set(names)):
            raise ValueError(f"sub_packages contains duplicate names: {names}")


# ---------------------------------------------------------------------------
# JSON → dataclass
# ---------------------------------------------------------------------------


def _build_layer(raw: dict) -> Layer:
    return Layer(
        name=raw.get("name", ""),
        paths=list(raw.get("paths", [])),
        role_ko=raw.get("role_ko", ""),
        contains_ko=raw.get("contains_ko", ""),
    )


def _build_alias(raw: dict) -> Alias:
    return Alias(
        pattern=raw.get("pattern", ""),
        resolves_to=raw.get("resolves_to", ""),
    )


def _build_extras(raw: dict) -> FrameworkExtras:
    return FrameworkExtras(
        section_title_ko=raw.get("section_title_ko", ""),
        content_md=raw.get("content_md", ""),
    )


def _build_file_row(raw: dict) -> FileLocationRow:
    return FileLocationRow(
        task_ko=raw.get("task_ko", ""),
        location=raw.get("location", ""),
    )


def _build_sub_package(raw: dict) -> SubPackage:
    return SubPackage(
        name=raw.get("name", ""),
        framework=raw.get("framework", ""),
        framework_variant=raw.get("framework_variant"),
        directory_tree=raw.get("directory_tree", ""),
        layers=[_build_layer(l) for l in raw.get("layers", [])],
        path_aliases=[_build_alias(a) for a in raw.get("path_aliases", [])],
        framework_extras=[_build_extras(e) for e in raw.get("framework_extras", [])],
        file_location_summary=[
            _build_file_row(r) for r in raw.get("file_location_summary", [])
        ],
    )


def _build_input(raw: Any) -> ProjectStructureInput:
    if not isinstance(raw, dict):
        raise ValueError(
            f"input must contain a JSON object at the root "
            f"(got {type(raw).__name__})"
        )
    leaked = sorted(set(raw.keys()) & DISALLOWED_TOP_LEVEL_KEYS)
    if leaked:
        raise ValueError(
            f"input contains disallowed top-level keys {leaked}. "
            f"project-structure document must describe directory structure only — "
            f"data model / features / code examples / tech stack belong to "
            f"PRD.md (docs/PRD.md), not PROJECT-STRUCTURE.md."
        )
    meta_raw = raw.get("meta")
    if not isinstance(meta_raw, dict):
        raise ValueError("meta is required and must be an object")
    meta = Meta(
        project_name=meta_raw.get("project_name", ""),
        doc_version=meta_raw.get("doc_version", ""),
        repo_layout=meta_raw.get("repo_layout", ""),
        monorepo_tool=meta_raw.get("monorepo_tool"),
    )
    return ProjectStructureInput(
        meta=meta,
        overview_ko=raw.get("overview_ko", ""),
        sub_packages=[_build_sub_package(s) for s in raw.get("sub_packages", [])],
    )


# ---------------------------------------------------------------------------
# Markdown renderer
# ---------------------------------------------------------------------------


def _md_escape(text: str) -> str:
    return text.replace("|", "\\|")


def _render_layer_table(layers: list[Layer]) -> str:
    lines = [
        "| Layer | 경로 | 역할 | 포함 항목 |",
        "| --- | --- | --- | --- |",
    ]
    for layer in layers:
        paths = ", ".join(f"`{p}`" for p in layer.paths)
        lines.append(
            f"| {layer.name} | {paths} | {_md_escape(layer.role_ko)} | "
            f"{_md_escape(layer.contains_ko)} |"
        )
    return "\n".join(lines)


def _render_alias_table(aliases: list[Alias]) -> str:
    if not aliases:
        return "_정의된 path alias 없음._"
    lines = ["| Alias | 해석 |", "| --- | --- |"]
    for a in aliases:
        lines.append(f"| `{a.pattern}` | `{a.resolves_to}` |")
    return "\n".join(lines)


def _render_file_summary(rows: list[FileLocationRow]) -> str:
    lines = ["| 작업 | 위치 |", "| --- | --- |"]
    for r in rows:
        lines.append(f"| {_md_escape(r.task_ko)} | `{r.location}` |")
    return "\n".join(lines)


def _render_sub_package(sp: SubPackage, *, heading_level: int) -> str:
    h = "#" * heading_level
    title_suffix = (
        f" — {sp.framework}"
        + (f" ({sp.framework_variant})" if sp.framework_variant else "")
    )
    out: list[str] = [f"{h} {sp.name}{title_suffix}", ""]
    out.append(f"{h}# Directory Tree")
    out.append("")
    out.append("```tree")
    out.append(sp.directory_tree.rstrip())
    out.append("```")
    out.append("")
    out.append(f"{h}# CA Layer 매핑 (Layer Map)")
    out.append("")
    out.append(_render_layer_table(sp.layers))
    out.append("")
    out.append(f"{h}# Path Aliases")
    out.append("")
    out.append(_render_alias_table(sp.path_aliases))
    out.append("")
    if sp.framework_extras:
        out.append(f"{h}# Framework Conventions")
        out.append("")
        for extra in sp.framework_extras:
            out.append(f"{h}## {extra.section_title_ko}")
            out.append("")
            out.append(extra.content_md.rstrip())
            out.append("")
    out.append(f"{h}# File Location Summary")
    out.append("")
    out.append(_render_file_summary(sp.file_location_summary))
    out.append("")
    return "\n".join(out)


def render(data: ProjectStructureInput) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    out: list[str] = []
    out.append(f"# {data.meta.project_name} Project Structure")
    out.append("")
    out.append(
        f"> 생성일: {now} · 문서 버전: {data.meta.doc_version} · "
        f"Generator: project-structure-generator"
    )
    out.append("")
    out.append("## 개요 (Overview)")
    out.append("")
    out.append(data.overview_ko.rstrip())
    out.append("")
    out.append("## 저장소 구성 (Repository Layout)")
    out.append("")
    out.append(f"- 형태: `{data.meta.repo_layout}`")
    out.append(f"- 모노레포 도구: `{data.meta.monorepo_tool or 'N/A'}`")
    out.append(f"- 서브패키지 수: {len(data.sub_packages)}")
    out.append("")

    if data.meta.repo_layout == "single":
        sp = data.sub_packages[0]
        out.append("## 디렉토리 구조 (Directory Structure)")
        out.append("")
        out.append(f"_프레임워크: **{sp.framework}**"
                   + (f" ({sp.framework_variant})" if sp.framework_variant else "")
                   + "_")
        out.append("")
        out.append("### Directory Tree")
        out.append("")
        out.append("```tree")
        out.append(sp.directory_tree.rstrip())
        out.append("```")
        out.append("")
        out.append("### CA Layer 매핑 (Layer Map)")
        out.append("")
        out.append(_render_layer_table(sp.layers))
        out.append("")
        out.append("### Path Aliases")
        out.append("")
        out.append(_render_alias_table(sp.path_aliases))
        out.append("")
        if sp.framework_extras:
            out.append("### Framework Conventions")
            out.append("")
            for extra in sp.framework_extras:
                out.append(f"#### {extra.section_title_ko}")
                out.append("")
                out.append(extra.content_md.rstrip())
                out.append("")
        out.append("## File Location Summary")
        out.append("")
        out.append(_render_file_summary(sp.file_location_summary))
        out.append("")
    else:
        out.append("## 서브패키지 (Sub-packages)")
        out.append("")
        for sp in data.sub_packages:
            out.append(_render_sub_package(sp, heading_level=3))

    return "\n".join(out).rstrip() + "\n"


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def _backup(path: Path) -> Path | None:
    if not path.exists():
        return None
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup = path.with_suffix(path.suffix + f".bak.{ts}")
    shutil.copy2(path, backup)
    return backup


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(
        description="Generate PROJECT-STRUCTURE.md from a structured JSON input.",
    )
    parser.add_argument(
        "--input",
        type=Path,
        default=Path("docs/.harness/project-structure-input.json"),
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("docs/PROJECT-STRUCTURE.md"),
    )
    args = parser.parse_args(argv)

    if not args.input.exists():
        print(f"[REJECT] input file not found: {args.input}", file=sys.stderr)
        return 1

    try:
        raw = json.loads(args.input.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        print(f"[REJECT] input is not valid JSON: {exc}", file=sys.stderr)
        return 1

    try:
        data = _build_input(raw)
    except ValueError as exc:
        print(f"[REJECT] {exc}", file=sys.stderr)
        return 1

    markdown = render(data)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    backup = _backup(args.output)
    args.output.write_text(markdown, encoding="utf-8")

    if backup:
        print(f"[OK] backup → {backup}")
    print(f"[OK] {args.output} written ({len(markdown):,} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
