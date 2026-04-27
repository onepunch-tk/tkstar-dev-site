# Backend Platform Rules

Platform-specific rules for Backend/API (NestJS) PRD generation.

## Platform-Specific MUST Generate Sections

### Auth & Permissions (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Authentication method (JWT, session, API key, OAuth2)
- Role definitions with clear responsibilities
- Permission matrix: Role x Resource access (CRUD level)
- Token lifecycle and refresh strategy

### API Consumer Flow

- Complete request flow diagram (consumer -> API -> response)
- Key interaction sequences between consumer and API
- Error handling flow and retry expectations
- **(Medium)**: Separate flows per consumer type where they diverge

### API Endpoint Groups - Feature Connection Verification

**Small**: Simple table format

| Method | Endpoint | Description | Feature ID |
|--------|----------|-------------|------------|
| POST | /auth/signup | User registration | F001 |
| GET | /items | List items | F002 |

**Medium**: Grouped by domain with auth requirements

| Method | Endpoint | Description | Feature ID | Auth | Roles |
|--------|----------|-------------|------------|------|-------|
| POST | /auth/signup | User registration | F-AUTH-001 | Public | -- |
| GET | /orders | List orders | F-ORDER-001 | Bearer | buyer, admin |

- **All endpoints must map to Feature IDs**
- **All Feature IDs must have at least one endpoint**
- Group endpoints by resource/domain

### Request/Response Specifications

For each key endpoint, specify:

- **Request**: Method, path params, query params, request body schema
- **Response**: Success response schema, error response codes
- **Validation Rules**: Required fields, format constraints

**Small**: Cover 3-5 most critical endpoints
**Medium**: Cover all endpoints grouped by domain

### Error Handling Strategy

- Standard error response format
- HTTP status code usage conventions
- Business error code definitions (for key scenarios)

### Event & Integration Architecture (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Event types and triggers (domain events)
- Message queue / pub-sub patterns if applicable
- External service integrations (payment, email, storage, etc.)
- Webhook definitions for consumers

## Feature Specifications - Backend Format

- **MUST specify endpoint group where each feature is implemented**

**Small**: Sequential IDs -> `F001, F002, F003...`
- Include only minimal authentication (signup/login/token)
- Exclude admin features, analytics, advanced notifications

**Medium**: Domain-grouped IDs -> `F-AUTH-001, F-ORDER-001, F-NOTIFY-001...`
- Group features by domain (AUTH, USER, ORDER, PRODUCT, NOTIFY, ADMIN, etc.)
- Include **Auth Level** column indicating required role/permission
- Include moderate support features (admin CRUD, webhooks) if core to service

## Processing Workflow - Backend Specific Steps

1. **Design API consumer flow** - Request/response patterns
2. **(Medium) Define auth strategy and permission matrix**
3. **Map endpoints per feature** - Connect as F001 -> POST /resource format
4. Design endpoint groups - Complete API surface (linked to Feature IDs)
5. Request/response specifications - Schema definitions for key endpoints
6. Design required data models
7. **(Medium) Define event architecture and integrations**

## Tech Stack Selection Principles - Backend

- **NestJS**: TypeScript-first, decorator-based API framework with enterprise-grade architecture
- **class-validator + class-transformer**: NestJS standard validation/serialization pipeline
- **Drizzle ORM or Prisma**: Type-safe database access
- **Zod**: Schema validation for pipes and standalone use cases
- **Supabase**: Minimize infrastructure, leverage built-in auth and realtime
- **Prioritize type safety and developer experience**
- **Prioritize active community and long-term supported technologies**

## Consistency Validation Checklist - Backend Specific

**Execution Order: MUST validate after PRD writing completion**

### Step 1: Feature Specs -> Endpoint Connection Validation

- [ ] Do all Feature IDs in Feature Specifications have corresponding endpoints in API Endpoint Groups?
- [ ] Do all Endpoint Group names in Feature Specifications actually exist in API Endpoint Groups?

### Step 2: Endpoint Groups -> Feature Connection Validation

- [ ] Do all endpoints in API Endpoint Groups reference valid Feature IDs?
- [ ] Are there any endpoints without a corresponding Feature ID?

### Step 3: Data Model -> Endpoint Connection Validation

- [ ] Are all models in Data Model referenced by at least one endpoint's request/response?
- [ ] Do all entity references (foreign keys) point to existing models?

### Step 4: Missing and Orphan Item Validation

- [ ] Are there features only in Feature Specifications not covered by any endpoint? (Remove or add endpoint)
- [ ] Are there endpoints not linked to any feature? (Add to Feature Specifications)
- [ ] Are there models not used by any endpoint? (Remove or add endpoint)

### Step 5: Permission Consistency Validation (Medium ONLY)

- [ ] Do all roles in Auth & Permissions have corresponding access rules in endpoint tables?
- [ ] Does the Roles column in each endpoint match the Permission Matrix?
- [ ] Are Auth Level values in Feature Specifications consistent with the Permission Matrix?
- [ ] Are there endpoints accessible to roles that shouldn't have access?

### Step 6: Domain Group Validation (Medium ONLY)

- [ ] Are all Feature IDs properly grouped by domain prefix? (F-AUTH-xxx, F-ORDER-xxx, etc.)
- [ ] Does each domain group have at least one feature?
- [ ] Are domain names consistent between Feature Specifications and Endpoint Groups?

### Step 7: Request/Response Validation

- [ ] Do all specified request/response schemas reference fields that exist in Data Model?
- [ ] Are error codes consistent across endpoints?

**On Validation Failure: Fix the item and re-run entire checklist**
