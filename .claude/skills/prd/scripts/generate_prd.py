"""Generate docs/PRD.md from a structured prd-input.json.

stdlib-only: dataclass schemas with __post_init__ validation enforce required
fields and the AC Coverage Rule (every feature has a happy-path AC; Core
features additionally need an edge or error AC). Missing or malformed input
exits 1 with a [REJECT] message on stderr.

Usage:
    python3 generate_prd.py --input docs/.harness/prd-input.json --output docs/PRD.md
"""

from __future__ import annotations

import argparse
import json
import shutil
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

VALID_PLATFORMS = {"web", "mobile", "backend"}
VALID_PRIORITY = {"Core", "Support", "Deferred"}
VALID_STATUS = {"Draft", "Approved", "InProgress", "Done"}
VALID_AC_KIND = {"happy", "edge", "error"}
VALID_SURFACE_PLATFORM = {"web", "mobile"}

PLATFORM_LABEL = {"web": "Web", "mobile": "Mobile", "backend": "Backend"}


def _require(value: str, name: str) -> None:
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f"{name} is required and must be a non-empty string")


# ---------------------------------------------------------------------------
# §1 Meta + Overview
# ---------------------------------------------------------------------------


@dataclass
class Meta:
    project_name: str
    platforms: list[str]
    doc_version: str

    def __post_init__(self) -> None:
        _require(self.project_name, "meta.project_name")
        _require(self.doc_version, "meta.doc_version")
        if not isinstance(self.platforms, list) or not self.platforms:
            raise ValueError("meta.platforms must be a non-empty list")
        invalid = [p for p in self.platforms if p not in VALID_PLATFORMS]
        if invalid:
            raise ValueError(
                f"meta.platforms contains invalid entries {invalid}; "
                f"must be a subset of {sorted(VALID_PLATFORMS)}"
            )


@dataclass
class TargetUser:
    persona: str
    description: str
    context: str

    def __post_init__(self) -> None:
        _require(self.persona, "target_user.persona")
        _require(self.description, "target_user.description")
        _require(self.context, "target_user.context")


@dataclass
class Overview:
    purpose: str
    background: str
    target_users: list[TargetUser]
    key_constraints: list[str]
    out_of_scope: list[str]

    def __post_init__(self) -> None:
        _require(self.purpose, "overview.purpose")
        _require(self.background, "overview.background")
        if not self.target_users:
            raise ValueError("overview.target_users must have ≥1 entry")


# ---------------------------------------------------------------------------
# §2 Roles & Permissions
# ---------------------------------------------------------------------------


@dataclass
class Role:
    role: str
    description: str
    key_capabilities: str


@dataclass
class PermissionRow:
    role: str
    permissions: dict[str, str]


@dataclass
class PermissionMatrix:
    domains: list[str]
    rows: list[PermissionRow]


@dataclass
class Roles:
    definitions: list[Role]
    permission_matrix: PermissionMatrix

    def __post_init__(self) -> None:
        if not self.definitions:
            raise ValueError("roles.definitions must have ≥1 role")


# ---------------------------------------------------------------------------
# §3 User Journeys
# ---------------------------------------------------------------------------


@dataclass
class UserJourney:
    role: str
    flow_name: str
    steps: list[str]

    def __post_init__(self) -> None:
        _require(self.role, "user_journey.role")
        _require(self.flow_name, "user_journey.flow_name")
        if not self.steps:
            raise ValueError(f"user_journey {self.flow_name!r}: steps must have ≥1 entry")


# ---------------------------------------------------------------------------
# §4 Feature Specifications
# ---------------------------------------------------------------------------


@dataclass
class AcceptanceCriterion:
    kind: str
    given: str
    when: str
    then: str

    def __post_init__(self) -> None:
        if self.kind not in VALID_AC_KIND:
            raise ValueError(
                f"acceptance_criterion.kind must be one of {sorted(VALID_AC_KIND)}, "
                f"got {self.kind!r}"
            )
        _require(self.given, "acceptance_criterion.given")
        _require(self.when, "acceptance_criterion.when")
        _require(self.then, "acceptance_criterion.then")


@dataclass
class Feature:
    name: str
    description: str
    priority: str
    surface: str
    status: str
    user_story: str
    acceptance_criteria: list[AcceptanceCriterion]
    edge_cases: list[str] = field(default_factory=list)
    dependencies: list[str] = field(default_factory=list)
    out_of_scope_local: list[str] = field(default_factory=list)

    def __post_init__(self) -> None:
        _require(self.name, "feature.name")
        _require(self.description, "feature.description")
        _require(self.surface, "feature.surface")
        _require(self.user_story, "feature.user_story")
        if self.priority not in VALID_PRIORITY:
            raise ValueError(
                f"feature {self.name!r}: priority must be one of "
                f"{sorted(VALID_PRIORITY)}, got {self.priority!r}"
            )
        if self.status not in VALID_STATUS:
            raise ValueError(
                f"feature {self.name!r}: status must be one of "
                f"{sorted(VALID_STATUS)}, got {self.status!r}"
            )
        if not self.acceptance_criteria:
            raise ValueError(
                f"feature {self.name!r}: acceptance_criteria must have ≥1 entry"
            )
        kinds = {ac.kind for ac in self.acceptance_criteria}
        if "happy" not in kinds:
            raise ValueError(
                f"feature {self.name!r}: missing happy-path AC "
                "(every feature must have ≥1 'happy' kind)"
            )
        if self.priority == "Core" and not (kinds & {"edge", "error"}):
            raise ValueError(
                f"Core feature {self.name!r}: needs ≥1 edge|error AC "
                "(coverage rule: Core features must cover both happy path "
                "and an exception scenario)"
            )


@dataclass
class DeferredFeature:
    name: str
    reason: str
    review_when: str


# ---------------------------------------------------------------------------
# §5 Surface Map
# ---------------------------------------------------------------------------


@dataclass
class WebSurfaceMap:
    tree: str = ""


@dataclass
class MobileSurfaceMap:
    tree: str = ""


@dataclass
class BackendEndpoint:
    method: str
    path: str
    description: str
    feature: str
    auth: str
    roles: list[str]


@dataclass
class BackendSurfaceMap:
    endpoints: list[BackendEndpoint] = field(default_factory=list)


@dataclass
class SurfaceMap:
    web: WebSurfaceMap | None = None
    mobile: MobileSurfaceMap | None = None
    backend: BackendSurfaceMap | None = None


# ---------------------------------------------------------------------------
# §6 Surface Details
# ---------------------------------------------------------------------------


@dataclass
class SurfaceDetail:
    name: str
    platform: str
    implements: list[str]
    access: list[str]
    purpose: str
    entry_path: str
    user_actions: str
    key_elements: str
    data_displayed: str
    next_navigation: str
    empty_state: str
    error_state: str
    access_control: str

    def __post_init__(self) -> None:
        if self.platform not in VALID_SURFACE_PLATFORM:
            raise ValueError(
                f"surface {self.name!r}: platform must be one of "
                f"{sorted(VALID_SURFACE_PLATFORM)}, got {self.platform!r}"
            )
        _require(self.name, "surface.name")


@dataclass
class EndpointSpec:
    method: str
    path: str
    request_body: Any
    response_200: Any
    error_codes: list[int]

    def __post_init__(self) -> None:
        for c in self.error_codes:
            if not isinstance(c, int) or isinstance(c, bool):
                raise ValueError(
                    f"endpoint {self.method} {self.path}: error_codes must "
                    f"contain integers, got {type(c).__name__}: {c!r}"
                )


# ---------------------------------------------------------------------------
# §7 Data Model
# ---------------------------------------------------------------------------


@dataclass
class FieldSpec:
    name: str
    type: str
    constraints: str
    description: str


@dataclass
class Entity:
    name: str
    description: str
    fields: list[FieldSpec]

    def __post_init__(self) -> None:
        _require(self.name, "entity.name")
        if not self.fields:
            raise ValueError(f"entity {self.name!r}: fields must have ≥1 entry")


@dataclass
class StorageStrategy:
    server: str
    client: str | None = None
    cache: str | None = None


@dataclass
class DataModel:
    entities: list[Entity]
    relationships: list[str]
    storage_strategy: StorageStrategy

    def __post_init__(self) -> None:
        if not self.entities:
            raise ValueError("data_model.entities must have ≥1 entity")


# ---------------------------------------------------------------------------
# §8 Backend Specifics
# ---------------------------------------------------------------------------


@dataclass
class APIConventions:
    base_url: str
    versioning: str
    auth_header: str


@dataclass
class RequestResponseStandards:
    pagination: str
    filtering: str
    sorting: str


@dataclass
class ErrorRow:
    code: str
    http: int
    description: str

    def __post_init__(self) -> None:
        if not isinstance(self.http, int) or isinstance(self.http, bool):
            raise ValueError(
                f"error_handling[{self.code!r}].http must be int, "
                f"got {type(self.http).__name__}: {self.http!r}"
            )


@dataclass
class DomainEvent:
    event: str
    trigger: str
    consumers: str


@dataclass
class ExternalIntegration:
    service: str
    purpose: str
    method: str


@dataclass
class BackendSpecifics:
    api_conventions: APIConventions
    request_response_standards: RequestResponseStandards
    error_handling: list[ErrorRow]
    domain_events: list[DomainEvent]
    external_integrations: list[ExternalIntegration]


# ---------------------------------------------------------------------------
# §9 Mobile Specifics
# ---------------------------------------------------------------------------


@dataclass
class PermissionEntry:
    permission: str
    purpose: str
    required: bool

    def __post_init__(self) -> None:
        if not isinstance(self.required, bool):
            raise ValueError(
                f"mobile_specifics.permissions[{self.permission!r}].required "
                f"must be bool, got {type(self.required).__name__}"
            )


@dataclass
class PlatformDifference:
    feature: str
    ios: str
    android: str


@dataclass
class OfflineStrategy:
    storage: str
    conflict: str
    network_state: str


@dataclass
class PushNotification:
    event: str
    title: str
    body: str
    deep_link: str


@dataclass
class MobileSpecifics:
    permissions: list[PermissionEntry]
    platform_differences: list[PlatformDifference]
    offline_strategy: OfflineStrategy
    push_notifications: list[PushNotification]


# ---------------------------------------------------------------------------
# §10 Security
# ---------------------------------------------------------------------------


@dataclass
class Authentication:
    method: str
    provider: str
    token_lifecycle: str


@dataclass
class AuthorizationRow:
    enforcement_point: str
    method: str


@dataclass
class DataAccessScope:
    role: str
    scope: str


@dataclass
class Security:
    authentication: Authentication
    authorization: list[AuthorizationRow]
    data_access_scoping: list[DataAccessScope]


# ---------------------------------------------------------------------------
# §11 NFR
# ---------------------------------------------------------------------------


@dataclass
class NFR:
    performance: list[str]
    reliability: list[str]
    accessibility: list[str]
    i18n: list[str]
    observability: list[str]


# ---------------------------------------------------------------------------
# §12 Tech Stack
# ---------------------------------------------------------------------------


@dataclass
class TechItem:
    name: str
    version: str
    purpose: str


@dataclass
class PlatformTechStack:
    items: list[TechItem]


@dataclass
class PackageManager:
    name: str
    version: str


@dataclass
class TechStack:
    web: PlatformTechStack | None
    mobile: PlatformTechStack | None
    backend: PlatformTechStack | None
    shared: list[TechItem]
    package_manager: PackageManager


# ---------------------------------------------------------------------------
# §13 Assumptions & Open Questions
# ---------------------------------------------------------------------------


@dataclass
class OpenQuestion:
    id: str
    question: str
    blocking: str
    deadline: str


@dataclass
class AssumptionsOpenQuestions:
    assumptions: list[str]
    open_questions: list[OpenQuestion]


# ---------------------------------------------------------------------------
# §14 Appendix
# ---------------------------------------------------------------------------


@dataclass
class HistoryEntry:
    date: str
    author: str
    changes: str


@dataclass
class Appendix:
    references: list[str]
    history: list[HistoryEntry]


# ---------------------------------------------------------------------------
# Top-level
# ---------------------------------------------------------------------------


@dataclass
class PRDInput:
    meta: Meta
    overview: Overview
    roles: Roles
    user_journeys: list[UserJourney]
    features: list[Feature]
    deferred_features: list[DeferredFeature]
    surface_map: SurfaceMap
    surface_details: list[SurfaceDetail]
    endpoint_specs: list[EndpointSpec]
    data_model: DataModel
    backend_specifics: BackendSpecifics | None
    mobile_specifics: MobileSpecifics | None
    security: Security
    nfr: NFR
    tech_stack: TechStack
    assumptions_open_questions: AssumptionsOpenQuestions
    appendix: Appendix

    def __post_init__(self) -> None:
        if not self.features:
            raise ValueError("features must have ≥1 entry")
        if not self.user_journeys:
            raise ValueError("user_journeys must have ≥1 entry")

        platforms = self.meta.platforms

        if "backend" in platforms:
            if self.backend_specifics is None:
                raise ValueError(
                    "meta.platforms includes 'backend' but backend_specifics is missing"
                )
            if not self.endpoint_specs:
                raise ValueError(
                    "meta.platforms includes 'backend' but endpoint_specs is empty"
                )

        if "mobile" in platforms and self.mobile_specifics is None:
            raise ValueError(
                "meta.platforms includes 'mobile' but mobile_specifics is missing"
            )

        ui_platforms = {p for p in platforms if p in VALID_SURFACE_PLATFORM}
        if ui_platforms:
            ui_surface_count = sum(
                1 for sd in self.surface_details if sd.platform in ui_platforms
            )
            if ui_surface_count == 0:
                raise ValueError(
                    f"platforms {sorted(ui_platforms)} require ≥1 surface_details entry"
                )

        seen: set[str] = set()
        for feat in self.features:
            if feat.name in seen:
                raise ValueError(
                    f"feature name {feat.name!r} is duplicated; names must be unique"
                )
            seen.add(feat.name)

        feature_names = {f.name for f in self.features}
        for feat in self.features:
            for dep in feat.dependencies:
                if dep not in feature_names:
                    raise ValueError(
                        f"feature {feat.name!r}: dependency {dep!r} does not match "
                        "any feature name (case-sensitive)"
                    )

        graph = {f.name: list(f.dependencies) for f in self.features}
        WHITE, GRAY, BLACK = 0, 1, 2
        color = {name: WHITE for name in graph}

        def _visit(node: str, stack: list[str]) -> None:
            if color[node] == GRAY:
                cycle = " → ".join(stack[stack.index(node):] + [node])
                raise ValueError(f"feature dependency cycle: {cycle}")
            if color[node] == BLACK:
                return
            color[node] = GRAY
            for nxt in graph[node]:
                _visit(nxt, stack + [node])
            color[node] = BLACK

        for name in graph:
            _visit(name, [])

        for sd in self.surface_details:
            if sd.platform not in platforms:
                raise ValueError(
                    f"surface {sd.name!r}: platform={sd.platform!r} is not in "
                    f"meta.platforms {platforms}"
                )
            for fname in sd.implements:
                if fname not in feature_names:
                    raise ValueError(
                        f"surface {sd.name!r}: implements references unknown "
                        f"feature {fname!r} (case-sensitive)"
                    )

        if self.surface_map.web is not None and "web" not in platforms:
            raise ValueError(
                "surface_map.web is populated but 'web' is not in meta.platforms"
            )
        if self.surface_map.mobile is not None and "mobile" not in platforms:
            raise ValueError(
                "surface_map.mobile is populated but 'mobile' is not in meta.platforms"
            )
        if self.surface_map.backend is not None and "backend" not in platforms:
            raise ValueError(
                "surface_map.backend is populated but 'backend' is not in meta.platforms"
            )

        domains = set(self.roles.permission_matrix.domains)
        for row in self.roles.permission_matrix.rows:
            phantom = set(row.permissions.keys()) - domains
            if phantom:
                raise ValueError(
                    f"roles.permission_matrix.rows[{row.role!r}].permissions has "
                    f"keys not in domains: {sorted(phantom)} "
                    f"(declared domains: {sorted(domains)})"
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


def _load_surface_map(data: dict[str, Any]) -> SurfaceMap:
    sm_kwargs: dict[str, Any] = {}
    if "web" in data and data["web"] is not None:
        sm_kwargs["web"] = WebSurfaceMap(tree=data["web"].get("tree", ""))
    if "mobile" in data and data["mobile"] is not None:
        sm_kwargs["mobile"] = MobileSurfaceMap(tree=data["mobile"].get("tree", ""))
    if "backend" in data and data["backend"] is not None:
        endpoints = [
            BackendEndpoint(**ep) for ep in data["backend"].get("endpoints", [])
        ]
        sm_kwargs["backend"] = BackendSurfaceMap(endpoints=endpoints)
    return SurfaceMap(**sm_kwargs)


def _load_backend_specifics(data: dict[str, Any] | None) -> BackendSpecifics | None:
    if data is None:
        return None
    return BackendSpecifics(
        api_conventions=APIConventions(**data["api_conventions"]),
        request_response_standards=RequestResponseStandards(
            **data["request_response_standards"]
        ),
        error_handling=[ErrorRow(**e) for e in data.get("error_handling", [])],
        domain_events=[DomainEvent(**e) for e in data.get("domain_events", [])],
        external_integrations=[
            ExternalIntegration(**e) for e in data.get("external_integrations", [])
        ],
    )


def _load_mobile_specifics(data: dict[str, Any] | None) -> MobileSpecifics | None:
    if data is None:
        return None
    return MobileSpecifics(
        permissions=[PermissionEntry(**p) for p in data.get("permissions", [])],
        platform_differences=[
            PlatformDifference(**p) for p in data.get("platform_differences", [])
        ],
        offline_strategy=OfflineStrategy(**data["offline_strategy"]),
        push_notifications=[
            PushNotification(**p) for p in data.get("push_notifications", [])
        ],
    )


def _load_tech_stack(data: dict[str, Any]) -> TechStack:
    def _platform(key: str) -> PlatformTechStack | None:
        block = data.get(key)
        if block is None:
            return None
        return PlatformTechStack(items=[TechItem(**i) for i in block.get("items", [])])

    return TechStack(
        web=_platform("web"),
        mobile=_platform("mobile"),
        backend=_platform("backend"),
        shared=[TechItem(**i) for i in data.get("shared", [])],
        package_manager=PackageManager(**data["package_manager"]),
    )


def load_input(raw: dict[str, Any]) -> PRDInput:
    meta = Meta(**_at(raw, "meta"))

    overview_raw = _at(raw, "overview")
    overview = Overview(
        purpose=overview_raw["purpose"],
        background=overview_raw["background"],
        target_users=[TargetUser(**u) for u in overview_raw["target_users"]],
        key_constraints=overview_raw.get("key_constraints", []),
        out_of_scope=overview_raw.get("out_of_scope", []),
    )

    roles_raw = _at(raw, "roles")
    pm_raw = roles_raw["permission_matrix"]
    roles = Roles(
        definitions=[Role(**r) for r in roles_raw["definitions"]],
        permission_matrix=PermissionMatrix(
            domains=pm_raw["domains"],
            rows=[PermissionRow(**row) for row in pm_raw["rows"]],
        ),
    )

    journeys = [UserJourney(**uj) for uj in _at(raw, "user_journeys")]

    features = [
        Feature(
            name=f["name"],
            description=f["description"],
            priority=f["priority"],
            surface=f["surface"],
            status=f["status"],
            user_story=f["user_story"],
            acceptance_criteria=[
                AcceptanceCriterion(**ac) for ac in f["acceptance_criteria"]
            ],
            edge_cases=f.get("edge_cases", []),
            dependencies=f.get("dependencies", []),
            out_of_scope_local=f.get("out_of_scope_local", []),
        )
        for f in _at(raw, "features")
    ]

    deferred = [DeferredFeature(**d) for d in raw.get("deferred_features", [])]

    surface_map = _load_surface_map(_at(raw, "surface_map"))

    surface_details = [
        SurfaceDetail(**sd) for sd in raw.get("surface_details", [])
    ]

    endpoint_specs = [
        EndpointSpec(
            method=e["method"],
            path=e["path"],
            request_body=e.get("request_body"),
            response_200=e.get("response_200"),
            error_codes=e.get("error_codes", []),
        )
        for e in raw.get("endpoint_specs", [])
    ]

    dm_raw = _at(raw, "data_model")
    data_model = DataModel(
        entities=[
            Entity(
                name=ent["name"],
                description=ent["description"],
                fields=[FieldSpec(**fld) for fld in ent["fields"]],
            )
            for ent in dm_raw["entities"]
        ],
        relationships=dm_raw.get("relationships", []),
        storage_strategy=StorageStrategy(**dm_raw["storage_strategy"]),
    )

    backend_specifics = _load_backend_specifics(raw.get("backend_specifics"))
    mobile_specifics = _load_mobile_specifics(raw.get("mobile_specifics"))

    sec_raw = _at(raw, "security")
    security = Security(
        authentication=Authentication(**sec_raw["authentication"]),
        authorization=[AuthorizationRow(**a) for a in sec_raw["authorization"]],
        data_access_scoping=[
            DataAccessScope(**s) for s in sec_raw["data_access_scoping"]
        ],
    )

    nfr = NFR(**_at(raw, "nfr"))
    tech_stack = _load_tech_stack(_at(raw, "tech_stack"))

    aoq_raw = _at(raw, "assumptions_open_questions")
    aoq = AssumptionsOpenQuestions(
        assumptions=aoq_raw.get("assumptions", []),
        open_questions=[OpenQuestion(**oq) for oq in aoq_raw.get("open_questions", [])],
    )

    app_raw = _at(raw, "appendix")
    appendix = Appendix(
        references=app_raw.get("references", []),
        history=[HistoryEntry(**h) for h in app_raw.get("history", [])],
    )

    return PRDInput(
        meta=meta,
        overview=overview,
        roles=roles,
        user_journeys=journeys,
        features=features,
        deferred_features=deferred,
        surface_map=surface_map,
        surface_details=surface_details,
        endpoint_specs=endpoint_specs,
        data_model=data_model,
        backend_specifics=backend_specifics,
        mobile_specifics=mobile_specifics,
        security=security,
        nfr=nfr,
        tech_stack=tech_stack,
        assumptions_open_questions=aoq,
        appendix=appendix,
    )


# ---------------------------------------------------------------------------
# Render helpers
# ---------------------------------------------------------------------------


PLACEHOLDER_NA = "_해당 없음_"
PLACEHOLDER_EMPTY = "_없음_"


def _bullets(items: list[str]) -> str:
    if not items:
        return PLACEHOLDER_EMPTY
    return "\n".join(f"- {item}" for item in items)


def _table(headers: list[str], rows: list[list[Any]]) -> str:
    if not rows:
        return PLACEHOLDER_EMPTY
    head = "| " + " | ".join(headers) + " |"
    sep = "| " + " | ".join("---" for _ in headers) + " |"
    body_lines = [
        "| " + " | ".join(_md_escape_cell(c) for c in row) + " |" for row in rows
    ]
    return "\n".join([head, sep, *body_lines])


def _md_escape_cell(value: Any) -> str:
    text = str(value) if value is not None else ""
    return text.replace("|", "\\|").replace("\n", "<br>")


def _safe_fence(content: str, lang: str = "") -> str:
    """Wrap content in a backtick fence longer than any run inside the content.

    CommonMark allows fences of 3+ backticks; the closing fence must be at
    least as long. By detecting the longest backtick run in `content` and
    using one more, we guarantee no premature fence closure even when the
    body itself contains triple-backticks.
    """
    longest_run = 0
    current_run = 0
    for ch in content:
        if ch == "`":
            current_run += 1
            longest_run = max(longest_run, current_run)
        else:
            current_run = 0
    fence = "`" * max(3, longest_run + 1)
    return f"{fence}{lang}\n{content}\n{fence}"


def _assign_feature_ids(features: list[Feature]) -> dict[str, str]:
    return {f.name: f"F{i + 1:03d}" for i, f in enumerate(features)}


# ---------------------------------------------------------------------------
# Renderers
# ---------------------------------------------------------------------------


def render_header(prd: PRDInput) -> str:
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    platforms_label = " / ".join(PLATFORM_LABEL[p] for p in prd.meta.platforms)
    return (
        f"# {prd.meta.project_name} PRD\n\n"
        f"> **생성일**: {today} | **플랫폼**: {platforms_label} | "
        f"**문서 버전**: {prd.meta.doc_version} | **작성자**: prd-generator\n"
    )


def render_overview(o: Overview) -> str:
    target_rows = [[u.persona, u.description, u.context] for u in o.target_users]
    return (
        "## 1. 프로젝트 개요 (Project Overview)\n\n"
        f"### 1.1 목적 (Purpose)\n{o.purpose}\n\n"
        f"### 1.2 배경 및 동기 (Background & Motivation)\n{o.background}\n\n"
        "### 1.3 대상 사용자 (Target Users)\n"
        + _table(["페르소나", "설명", "사용 맥락"], target_rows)
        + "\n\n"
        "### 1.4 핵심 제약 (Key Constraints)\n"
        + _bullets(o.key_constraints)
        + "\n\n"
        "### 1.5 작업 범위 외 (Out of Scope)\n"
        + _bullets(o.out_of_scope)
        + "\n"
    )


def render_roles(r: Roles) -> str:
    def_rows = [[d.role, d.description, d.key_capabilities] for d in r.definitions]
    pm = r.permission_matrix
    pm_headers = ["역할", *pm.domains]
    pm_rows = [
        [row.role, *[row.permissions.get(d, "—") for d in pm.domains]] for row in pm.rows
    ]
    return (
        "## 2. 사용자 역할 및 권한 (User Roles & Permissions)\n\n"
        "### 2.1 역할 정의 (Role Definitions)\n"
        + _table(["역할", "설명", "핵심 권한"], def_rows)
        + "\n\n"
        "### 2.2 권한 매트릭스 (Permission Matrix)\n"
        + _table(pm_headers, pm_rows)
        + "\n"
    )


def render_user_journeys(journeys: list[UserJourney]) -> str:
    body_parts = ["## 3. 사용자 여정 (User Journeys)\n"]
    for i, uj in enumerate(journeys, start=1):
        steps = "\n".join(f"{j}. {step}" for j, step in enumerate(uj.steps, start=1))
        body_parts.append(f"\n### 3.{i} {uj.role} — {uj.flow_name}\n{steps}\n")
    return "".join(body_parts)


def render_features(
    features: list[Feature],
    deferred: list[DeferredFeature],
    feature_ids: dict[str, str],
) -> str:
    overview_rows = [
        [
            feature_ids[f.name],
            f.name,
            f.description,
            f.priority,
            f.surface,
            f.status,
        ]
        for f in features
    ]
    parts = [
        "## 4. 기능 명세 (Feature Specifications)\n\n",
        "### 4.1 기능 목록 (Feature Overview)\n",
        _table(
            ["ID", "기능명", "설명", "우선순위", "Surface", "상태"], overview_rows
        ),
        "\n\n### 4.2 기능 상세 (Feature Details)\n",
    ]
    for f in features:
        fid = feature_ids[f.name]
        ac_lines = [
            f"  - **{ac.kind}**: GIVEN {ac.given} WHEN {ac.when} THEN {ac.then}"
            for ac in f.acceptance_criteria
        ]
        deps_resolved = (
            ", ".join(feature_ids[d] for d in f.dependencies) if f.dependencies else "_없음_"
        )
        parts.append(
            f"\n#### {fid} — {f.name}\n"
            f"- **설명**: {f.description}\n"
            f"- **User Story**: {f.user_story}\n"
            f"- **Acceptance Criteria**:\n" + "\n".join(ac_lines) + "\n"
            f"- **Edge Cases**: {', '.join(f.edge_cases) if f.edge_cases else '_없음_'}\n"
            f"- **Dependencies**: {deps_resolved}\n"
            f"- **Out-of-scope (이 기능 한정)**: "
            f"{', '.join(f.out_of_scope_local) if f.out_of_scope_local else '_없음_'}\n"
        )
    deferred_rows = [[d.name, d.reason, d.review_when] for d in deferred]
    parts.append(
        "\n### 4.3 보류 기능 (Deferred Features)\n"
        + _table(["기능명", "보류 사유", "검토 시점"], deferred_rows)
        + "\n"
    )
    return "".join(parts)


def render_surface_map(sm: SurfaceMap, platforms: list[str]) -> str:
    parts = ["## 5. 정보 구조 (Surface Map / Information Architecture)\n\n"]

    parts.append("### 5.1 Web Surfaces\n")
    if "web" in platforms and sm.web is not None and sm.web.tree.strip():
        parts.append(_safe_fence(sm.web.tree) + "\n")
    else:
        parts.append(f"{PLACEHOLDER_NA}\n")

    parts.append("\n### 5.2 Mobile Surfaces\n")
    if "mobile" in platforms and sm.mobile is not None and sm.mobile.tree.strip():
        parts.append(_safe_fence(sm.mobile.tree) + "\n")
    else:
        parts.append(f"{PLACEHOLDER_NA}\n")

    parts.append("\n### 5.3 Backend Surfaces (Endpoint Groups)\n")
    if "backend" in platforms and sm.backend is not None and sm.backend.endpoints:
        rows = [
            [
                ep.method,
                ep.path,
                ep.description,
                ep.feature,
                ep.auth,
                ", ".join(ep.roles) if ep.roles else "—",
            ]
            for ep in sm.backend.endpoints
        ]
        parts.append(
            _table(
                ["Method", "Path", "Description", "Feature", "Auth", "Roles"], rows
            )
            + "\n"
        )
    else:
        parts.append(f"{PLACEHOLDER_NA}\n")

    return "".join(parts)


def render_surface_details(
    surface_details: list[SurfaceDetail],
    endpoint_specs: list[EndpointSpec],
    feature_ids: dict[str, str],
) -> str:
    parts = ["## 6. Surface 상세 (Surface Details)\n"]
    counter = 1
    for sd in surface_details:
        impl_resolved = ", ".join(
            feature_ids[name] for name in sd.implements if name in feature_ids
        ) or "_없음_"
        access_label = ", ".join(sd.access) if sd.access else "_없음_"
        rows = [
            ["역할 (Purpose)", sd.purpose],
            ["진입 경로 (Entry Path)", sd.entry_path],
            ["사용자 행동 (User Actions)", sd.user_actions],
            ["핵심 요소 (Key Elements)", sd.key_elements],
            ["표시 데이터 (Data Displayed)", sd.data_displayed],
            ["다음 이동 (Next Navigation)", sd.next_navigation],
            ["빈 상태 (Empty State)", sd.empty_state],
            ["에러 상태 (Error State)", sd.error_state],
            ["접근 제어 (Access Control)", sd.access_control],
        ]
        parts.append(
            f"\n### 6.{counter} {sd.name}\n"
            f"> **구현 기능**: {impl_resolved} | **접근 권한**: {access_label} | "
            f"**플랫폼**: {PLATFORM_LABEL[sd.platform]}\n\n"
            + _table(["항목", "내용"], rows)
            + "\n"
        )
        counter += 1

    if endpoint_specs:
        parts.append(f"\n### 6.{counter} Backend Endpoint Specs\n")
        for ep in endpoint_specs:
            errs = ", ".join(str(c) for c in ep.error_codes) if ep.error_codes else "—"
            parts.append(f"\n#### `{ep.method} {ep.path}`\n")
            if ep.request_body is None:
                parts.append("- **Request Body**: —\n")
            else:
                req = json.dumps(ep.request_body, ensure_ascii=False, indent=2)
                parts.append(
                    "- **Request Body**:\n" + _safe_fence(req, "json") + "\n"
                )
            if ep.response_200 is None:
                parts.append("- **Response (200)**: —\n")
            else:
                res = json.dumps(ep.response_200, ensure_ascii=False, indent=2)
                parts.append(
                    "- **Response (200)**:\n" + _safe_fence(res, "json") + "\n"
                )
            parts.append(f"- **Error Codes**: {errs}\n")
    elif not surface_details:
        parts.append(f"\n{PLACEHOLDER_NA}\n")

    return "".join(parts)


def render_data_model(dm: DataModel) -> str:
    parts = [
        "## 7. 데이터 모델 (Data Model)\n\n",
        "### 7.1 엔티티 정의 (Entity Definitions)\n",
    ]
    for ent in dm.entities:
        rows = [[f.name, f.type, f.constraints, f.description] for f in ent.fields]
        parts.append(
            f"\n#### {ent.name}\n"
            f"_{ent.description}_\n\n"
            + _table(["필드", "타입", "제약", "설명"], rows)
            + "\n"
        )
    parts.append(
        "\n### 7.2 엔티티 관계 (Entity Relationships)\n"
        + _bullets(dm.relationships)
        + "\n\n"
        "### 7.3 데이터 저장 전략 (Data Storage Strategy)\n"
        f"- **서버**: {dm.storage_strategy.server}\n"
        f"- **클라이언트**: {dm.storage_strategy.client or PLACEHOLDER_NA}\n"
        f"- **캐시**: {dm.storage_strategy.cache or PLACEHOLDER_NA}\n"
    )
    return "".join(parts)


def render_backend_specifics(
    bs: BackendSpecifics | None, has_backend: bool
) -> str:
    if not has_backend or bs is None:
        return (
            "## 8. Backend 명세 (Backend Specifics)\n\n"
            "_이 프로젝트는 Backend를 포함하지 않습니다._\n"
        )
    api = bs.api_conventions
    rrs = bs.request_response_standards
    err_rows = [[e.code, e.http, e.description] for e in bs.error_handling]
    evt_rows = [[e.event, e.trigger, e.consumers] for e in bs.domain_events]
    int_rows = [[i.service, i.purpose, i.method] for i in bs.external_integrations]
    return (
        "## 8. Backend 명세 (Backend Specifics)\n\n"
        "### 8.1 API 컨벤션\n"
        f"- **Base URL**: `{api.base_url}`\n"
        f"- **버전 전략**: {api.versioning}\n"
        f"- **Auth Header**: `{api.auth_header}`\n\n"
        "### 8.2 요청/응답 표준\n"
        f"- **Pagination**: {rrs.pagination}\n"
        f"- **Filtering**: {rrs.filtering}\n"
        f"- **Sorting**: {rrs.sorting}\n\n"
        "### 8.3 에러 처리\n"
        + _table(["코드", "HTTP", "설명"], err_rows)
        + "\n\n"
        "### 8.4 도메인 이벤트 (Domain Events)\n"
        + _table(["이벤트", "트리거", "컨슈머"], evt_rows)
        + "\n\n"
        "### 8.5 외부 통합 (External Integrations)\n"
        + _table(["서비스", "목적", "연동 방식"], int_rows)
        + "\n"
    )


def render_mobile_specifics(ms: MobileSpecifics | None, has_mobile: bool) -> str:
    if not has_mobile or ms is None:
        return (
            "## 9. Mobile 명세 (Mobile Specifics)\n\n"
            "_이 프로젝트는 Mobile을 포함하지 않습니다._\n"
        )
    perm_rows = [
        [p.permission, p.purpose, "필수" if p.required else "선택"]
        for p in ms.permissions
    ]
    diff_rows = [[d.feature, d.ios, d.android] for d in ms.platform_differences]
    push_rows = [
        [p.event, p.title, p.body, p.deep_link] for p in ms.push_notifications
    ]
    return (
        "## 9. Mobile 명세 (Mobile Specifics)\n\n"
        "### 9.1 필수 권한\n"
        + _table(["권한", "목적", "필수/선택"], perm_rows)
        + "\n\n"
        "### 9.2 플랫폼 차이 (iOS / Android)\n"
        + _table(["기능", "iOS", "Android"], diff_rows)
        + "\n\n"
        "### 9.3 오프라인 및 동기화 전략\n"
        f"- **Storage**: {ms.offline_strategy.storage}\n"
        f"- **Conflict Resolution**: {ms.offline_strategy.conflict}\n"
        f"- **Network State**: {ms.offline_strategy.network_state}\n\n"
        "### 9.4 푸시 알림\n"
        + _table(["이벤트", "제목", "본문", "Deep Link"], push_rows)
        + "\n"
    )


def render_security(s: Security) -> str:
    auth_rows = [[a.enforcement_point, a.method] for a in s.authorization]
    scope_rows = [[ds.role, ds.scope] for ds in s.data_access_scoping]
    return (
        "## 10. 보안 및 인가 (Security & Authorization)\n\n"
        "### 10.1 인증 (Authentication)\n"
        f"- **방식**: {s.authentication.method}\n"
        f"- **제공자**: {s.authentication.provider}\n"
        f"- **토큰 라이프사이클**: {s.authentication.token_lifecycle}\n\n"
        "### 10.2 인가 (Authorization / RBAC)\n"
        + _table(["적용 지점", "방법"], auth_rows)
        + "\n\n"
        "### 10.3 데이터 접근 범위 (Data Access Scoping)\n"
        + _table(["역할", "범위"], scope_rows)
        + "\n"
    )


def render_nfr(n: NFR) -> str:
    return (
        "## 11. 비기능 요구사항 (Non-Functional Requirements)\n\n"
        "> 모든 항목은 **기술적 contract**입니다. KPI/DAU/전환율 등 "
        "비즈니스 성과 약속은 포함되지 않습니다.\n\n"
        f"### 11.1 성능 (Performance)\n{_bullets(n.performance)}\n\n"
        f"### 11.2 신뢰성 (Reliability)\n{_bullets(n.reliability)}\n\n"
        f"### 11.3 접근성 (Accessibility)\n{_bullets(n.accessibility)}\n\n"
        f"### 11.4 국제화 (Internationalization)\n{_bullets(n.i18n)}\n\n"
        f"### 11.5 관측성 (Observability)\n{_bullets(n.observability)}\n"
    )


def _render_tech_block(stack: PlatformTechStack | None) -> str:
    if stack is None or not stack.items:
        return PLACEHOLDER_NA
    return "\n".join(
        f"- **{i.name} {i.version}** — {i.purpose}" for i in stack.items
    )


def render_tech_stack(t: TechStack, platforms: list[str]) -> str:
    web_block = _render_tech_block(t.web) if "web" in platforms else PLACEHOLDER_NA
    mobile_block = (
        _render_tech_block(t.mobile) if "mobile" in platforms else PLACEHOLDER_NA
    )
    backend_block = (
        _render_tech_block(t.backend) if "backend" in platforms else PLACEHOLDER_NA
    )
    shared = (
        "\n".join(f"- **{i.name} {i.version}** — {i.purpose}" for i in t.shared)
        if t.shared
        else PLACEHOLDER_EMPTY
    )
    return (
        "## 12. 기술 스택 (Tech Stack)\n\n"
        "> 모든 버전은 `package.json`에서 추출. monorepo는 sub-package 우선.\n\n"
        f"### 12.1 Web\n{web_block}\n\n"
        f"### 12.2 Mobile\n{mobile_block}\n\n"
        f"### 12.3 Backend\n{backend_block}\n\n"
        f"### 12.4 공통 의존성 (Shared Dependencies)\n{shared}\n\n"
        "### 12.5 패키지 매니저 (Package Manager)\n"
        f"- **{t.package_manager.name} {t.package_manager.version}**\n"
    )


def render_assumptions_open_questions(aoq: AssumptionsOpenQuestions) -> str:
    oq_rows = [
        [q.id, q.question, q.blocking, q.deadline] for q in aoq.open_questions
    ]
    return (
        "## 13. 가정 및 미결 질문 (Assumptions & Open Questions)\n\n"
        f"### 13.1 가정 (Assumptions)\n{_bullets(aoq.assumptions)}\n\n"
        "### 13.2 미결 질문 (Open Questions)\n"
        + _table(["ID", "질문", "차단 영향", "결정 기한"], oq_rows)
        + "\n"
    )


def render_appendix(a: Appendix) -> str:
    history_rows = [[h.date, h.author, h.changes] for h in a.history]
    return (
        "## 14. 부록 (Appendix)\n\n"
        f"### 14.1 참조 자료 (References)\n{_bullets(a.references)}\n\n"
        "### 14.2 문서 변경 이력 (Document History)\n"
        + _table(["일자", "작성자", "변경 내용"], history_rows)
        + "\n"
    )


def render(prd: PRDInput) -> str:
    feature_ids = _assign_feature_ids(prd.features)
    platforms = prd.meta.platforms

    sections = [
        render_header(prd),
        "\n---\n\n",
        render_overview(prd.overview),
        "\n---\n\n",
        render_roles(prd.roles),
        "\n---\n\n",
        render_user_journeys(prd.user_journeys),
        "\n---\n\n",
        render_features(prd.features, prd.deferred_features, feature_ids),
        "\n---\n\n",
        render_surface_map(prd.surface_map, platforms),
        "\n---\n\n",
        render_surface_details(
            prd.surface_details, prd.endpoint_specs, feature_ids
        ),
        "\n---\n\n",
        render_data_model(prd.data_model),
        "\n---\n\n",
        render_backend_specifics(prd.backend_specifics, "backend" in platforms),
        "\n---\n\n",
        render_mobile_specifics(prd.mobile_specifics, "mobile" in platforms),
        "\n---\n\n",
        render_security(prd.security),
        "\n---\n\n",
        render_nfr(prd.nfr),
        "\n---\n\n",
        render_tech_stack(prd.tech_stack, platforms),
        "\n---\n\n",
        render_assumptions_open_questions(prd.assumptions_open_questions),
        "\n---\n\n",
        render_appendix(prd.appendix),
    ]
    return "".join(sections)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def _backup_existing(output: Path) -> Path | None:
    if not output.exists():
        return None
    ts = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")
    backup = output.with_name(f"{output.name}.bak.{ts}")
    shutil.copy(output, backup)
    return backup


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(
        description="Generate docs/PRD.md from a structured prd-input.json"
    )
    parser.add_argument("--input", required=True, type=Path, help="Path to prd-input.json")
    parser.add_argument("--output", required=True, type=Path, help="Path to PRD.md to write")
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
        prd = load_input(raw)
    except (TypeError, ValueError, KeyError) as e:
        sys.stderr.write(f"[REJECT] {e}\n")
        return 1

    md = render(prd)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    backup = _backup_existing(args.output)
    args.output.write_text(md, encoding="utf-8")

    if backup is not None:
        print(f"[OK] backup → {backup}")
    print(f"[OK] {args.output} written ({len(md):,} chars)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
