# Project-Structure Input JSON Schema (Authoritative: Python dataclasses)

Authoritative source: `scripts/generate_project_structure.py` dataclasses. Outline:

```jsonc
{
  "meta": {
    "project_name": str,
    "doc_version": str,                         // e.g. "0.1"
    "repo_layout": "single" | "monorepo",
    "monorepo_tool": "turbo" | "pnpm-workspaces" | "workspaces" | "nx" | "lerna" | null
  },
  "overview_ko": str,                           // 1-2 paragraphs, Korean body
  "sub_packages": [
    {
      "name": str,                              // "apps/web", "src" (single-pkg), etc.
      "framework": "react-router" | "expo" | "nestjs" | "tauri",
      "framework_variant": str | null,          // nestjs: "layer-first"/"module-first"; tauri: variant string
      "directory_tree": str,                    // tree fence content (NOT code)
      "layers": [
        {
          "name": "Domain" | "Application" | "Infrastructure" | "Presentation",
          "paths": [str],                       // ["src/domain/", ...]
          "role_ko": str,                       // Korean role description
          "contains_ko": str                    // Korean contents description
        }
      ],
      "path_aliases": [
        { "pattern": str, "resolves_to": str }
      ],
      "framework_extras": [
        { "section_title_ko": str, "content_md": str }  // free markdown, no code
      ],
      "file_location_summary": [
        { "task_ko": str, "location": str }
      ]
    }
  ]
}
```

## Validation Rules (Python-Enforced — `[REJECT]` triggers)

- **Schema** — required fields missing, wrong types, invalid enum values
- **Framework enum** — only `react-router`, `expo`, `nestjs`, `tauri`
- **Repo layout enum** — only `single` or `monorepo`
- **Monorepo tool consistency** — `single` requires `monorepo_tool=null`; `monorepo` requires a non-null tool from the enum
- **Single-package count** — exactly 1 sub-package when `repo_layout=single`
- **Sub-package name uniqueness**
- **Layer name uniqueness within a sub-package** + enum (4 standard names)
- **Code leak detection** — `directory_tree`, `overview_ko`, and `framework_extras[].content_md` are scanned for `class /interface /function /export /import /=> /fn (/#[tauri::command]` patterns. Match → `[REJECT]` (project-structure describes directories, not code).
- **Disallowed top-level keys** — `data_model`, `entities`, `features`, `user_journeys`, `business_logic`, `code_examples`, `tech_stack`, `nfr`, etc. (PRD territory) → `[REJECT]`
