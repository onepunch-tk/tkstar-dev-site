# PRD Input JSON Schema (Authoritative: Python dataclasses)

The Python script's dataclasses in `scripts/generate_prd.py` are the authoritative schema. The outline below mirrors them — consult the script for field types and validation rules.

```jsonc
{
  "meta":     { "project_name": str, "platforms": ["web"|"mobile"|"backend"], "doc_version": str },
  "overview": { "purpose": str, "background": str,
                "target_users": [{persona, description, context}],
                "key_constraints": [str], "out_of_scope": [str] },
  "roles":    { "definitions": [{role, description, key_capabilities}],
                "permission_matrix": { "domains": [str],
                                       "rows": [{role, permissions: {domain: str}}] } },
  "user_journeys": [{role, flow_name, steps: [str]}],
  "features": [{
    "name": str, "description": str,
    "priority": "Core"|"Support"|"Deferred",
    "surface": str,
    "status":   "Draft"|"Approved"|"InProgress"|"Done",
    "user_story": "{역할}로서, 나는 {목적}을 원한다, 왜냐하면 {이유}이기 때문이다",
    "acceptance_criteria": [{
      "kind": "happy"|"edge"|"error",
      "given": str, "when": str, "then": str
    }],
    "edge_cases": [str],
    "dependencies": [feature_name],   // resolved to F-IDs by Python
    "out_of_scope_local": [str]
  }],
  "deferred_features": [{name, reason, review_when}],
  "surface_map": {
    "web":     { "tree": str },                          // omit if not in platforms
    "mobile":  { "tree": str },
    "backend": { "endpoints": [{method, path, description, feature, auth, roles}] }
  },
  "surface_details": [{
    "name": str, "platform": "web"|"mobile",
    "implements": [feature_name], "access": [role],
    "purpose": str, "entry_path": str, "user_actions": str,
    "key_elements": str, "data_displayed": str, "next_navigation": str,
    "empty_state": str, "error_state": str, "access_control": str
  }],
  "endpoint_specs": [{method, path, request_body, response_200, error_codes: [int]}],
  "data_model": {
    "entities": [{name, description, fields: [{name, type, constraints, description}]}],
    "relationships": [str],
    "storage_strategy": {server, client?, cache?}
  },
  "backend_specifics": {     // omit if "backend" not in platforms
    "api_conventions": {base_url, versioning, auth_header},
    "request_response_standards": {pagination, filtering, sorting},
    "error_handling": [{code, http, description}],
    "domain_events":  [{event, trigger, consumers}],
    "external_integrations": [{service, purpose, method}]
  },
  "mobile_specifics": {      // omit if "mobile" not in platforms
    "permissions": [{permission, purpose, required: bool}],
    "platform_differences": [{feature, ios, android}],
    "offline_strategy": {storage, conflict, network_state},
    "push_notifications": [{event, title, body, deep_link}]
  },
  "security": {
    "authentication": {method, provider, token_lifecycle},
    "authorization":  [{enforcement_point, method}],
    "data_access_scoping": [{role, scope}]
  },
  "nfr": {
    "performance": [str], "reliability": [str], "accessibility": [str],
    "i18n": [str], "observability": [str]
  },
  "tech_stack": {
    "web":     { "items": [{name, version, purpose}] },  // omit if not in platforms
    "mobile":  { "items": [...] },
    "backend": { "items": [...] },
    "shared":  [{name, version, purpose}],
    "package_manager": {name, version}
  },
  "assumptions_open_questions": {
    "assumptions": [str],
    "open_questions": [{id, question, blocking, deadline}]
  },
  "appendix": {
    "references": [str],
    "history":    [{date, author, changes}]
  }
}
```
