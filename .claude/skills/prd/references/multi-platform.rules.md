# Multi-Platform Rules

Rules for generating unified PRDs that span multiple platforms (Backend + Web + Mobile).

## When to Apply

Apply these rules when the user's project involves **two or more platforms** (e.g., "NestJS backend + React web app", "API server + mobile client", "full-stack with web and mobile").

## Development Flow Section

### Platform Ordering Rule

Generate a **Development Flow** section that orders platform implementation by dependency:

1. **Backend first** - When API contracts exist (REST, GraphQL, tRPC), backend must be implemented first so other platforms can consume the API
2. **Web second** - Web frontend typically depends on backend APIs
3. **Mobile third** - Mobile app depends on backend APIs and may share data models with web

### Development Flow Format

```markdown
## Development Flow

### Phase 1: Backend/API
- Define and implement API contracts
- Set up authentication and authorization
- Implement core business logic endpoints
- Provide API documentation or SDK for consumers

### Phase 2: Web Frontend
- Consume backend APIs
- Implement web-specific UI and interactions
- Integrate shared authentication flow

### Phase 3: Mobile App
- Consume same backend APIs as web
- Implement mobile-specific UI and navigation
- Add device-specific features (push notifications, camera, etc.)
- Implement offline support if required
```

### Dependency Notes

- If there is no backend (e.g., web + mobile both using Supabase directly), order by complexity: Web -> Mobile
- If only Backend + one client, use two phases
- Always note which platform's API contract the others depend on

## Shared Architecture Section

### Data Model Sharing

When multiple platforms share the same backend:

- Define the **canonical Data Model once** in the Backend section
- Web and Mobile sections reference the backend Data Model rather than redefining it
- Each client section specifies only **client-specific additions** (e.g., local storage models for mobile, UI state models for web)

### Authentication Sharing

When authentication is handled by a shared backend:

- Define the **auth strategy once** in the Backend section
- Web section describes how it integrates (session cookies, JWT in headers, etc.)
- Mobile section describes how it integrates (secure token storage, biometric unlock, etc.)
- Each client section only specifies its **platform-specific auth behavior**

### Shared Architecture Format

```markdown
## Shared Architecture

### Data Model
> Defined in Backend section. Web and Mobile consume via API.

### Authentication
> Defined in Backend section.
- **Web**: [integration method - cookie/JWT/session]
- **Mobile**: [integration method - secure storage/biometric]

### Shared Feature IDs
> Feature IDs that span multiple platforms use a shared prefix.
> Example: F-AUTH-001 (signup) is implemented in Backend (endpoint), Web (page), and Mobile (screen).
```

## Multi-Platform Consistency Validation

Run these checks **in addition to** each platform's own validation checklist.

### Cross-Platform Feature ID Consistency

- [ ] Are Feature IDs consistent across all platform sections? (F-AUTH-001 in Backend must match F-AUTH-001 in Web/Mobile)
- [ ] Do shared features (auth, user profile, etc.) use the same Feature IDs across all platforms?
- [ ] Are platform-specific features clearly marked as such? (e.g., F-PUSH-001 only in Mobile, F-SSR-001 only in Web)

### Shared Model References

- [ ] Does the Web section reference the Backend Data Model rather than redefining it?
- [ ] Does the Mobile section reference the Backend Data Model rather than redefining it?
- [ ] Are client-specific models (local storage, UI state) clearly separated from shared models?
- [ ] Do foreign key references in client models point to valid Backend models?

### API Contract Consistency

- [ ] Do Web API calls match the endpoints defined in the Backend section?
- [ ] Do Mobile API calls match the endpoints defined in the Backend section?
- [ ] Are request/response schemas consistent between Backend definitions and client expectations?

### Authentication Flow Consistency

- [ ] Is the auth method consistent across all platforms? (same JWT strategy, same OAuth providers)
- [ ] Do all platforms handle token refresh the same way?
- [ ] Are role definitions consistent across Backend permission matrix and client access controls?

**On Validation Failure: Fix the item and re-run entire checklist including platform-specific checklists**

## Platform Priority Rules

| Scenario | Priority Order | Reason |
|----------|---------------|--------|
| Backend + Web + Mobile | Backend -> Web -> Mobile | API contracts drive all clients |
| Backend + Web | Backend -> Web | API contract drives web |
| Backend + Mobile | Backend -> Mobile | API contract drives mobile |
| Web + Mobile (no backend) | Web -> Mobile | Web is simpler baseline |
| Web + Mobile (BaaS like Supabase) | Parallel | Both consume BaaS directly |

## PRD Structure for Multi-Platform

The unified PRD should follow this high-level structure:

1. **Project Core** (shared across all platforms)
2. **Shared Architecture** (data model, auth, shared Feature IDs)
3. **Development Flow** (platform ordering)
4. **Backend Section** (if applicable) - follows backend.rules.md
5. **Web Section** (if applicable) - follows web.rules.md
6. **Mobile Section** (if applicable) - follows mobile.rules.md
7. **Tech Stack** (per platform, with shared dependencies noted)
8. **Multi-Platform Consistency Validation** (this checklist)
