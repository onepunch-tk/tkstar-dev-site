## Output Template

### Small Scale Template

```markdown
# [Project Name] API PRD

## Core Information

**Purpose**: [Problem this API solves in one line]
**Consumers**: [Who/what consumes this API in one line]

## API Consumer Flow

1. Consumer → [Auth endpoint] → Receive token
2. Consumer → [Main endpoint] with token → Response
3. On error → [Error handling approach]

## Feature Specifications

### 1. Core Features

| ID | Feature Name | Description | Priority | Endpoint Group |
|----|--------------|-------------|---------------|----------------|
| **F001** | [Feature Name] | [Brief Description] | [Core Value] | [Resource Group] |
| **F002** | [Feature Name] | [Brief Description] | [Core Logic] | [Resource Group] |

### 2. Required Support Features

| ID | Feature Name | Description | Priority | Endpoint Group |
|----|--------------|-------------|---------------|----------------|
| **F010** | Basic Auth | Signup/Login/Token | Minimum auth | Auth |

### 3. Deferred Features

- [List of deferred features]

## API Endpoint Groups

### Auth

| Method | Endpoint | Description | Feature ID |
|--------|----------|-------------|------------|
| POST | /auth/signup | User registration | F010 |
| POST | /auth/login | User login | F010 |

### [Resource Group]

| Method | Endpoint | Description | Feature ID |
|--------|----------|-------------|------------|
| GET | /[resource] | List [resources] | F001 |
| POST | /[resource] | Create [resource] | F001 |
| GET | /[resource]/:id | Get [resource] detail | F001 |
| PUT | /[resource]/:id | Update [resource] | F002 |
| DELETE | /[resource]/:id | Delete [resource] | F002 |

## Request/Response Specifications

### POST /[resource] (Create)

**Request Body:**
```json
{
  "field1": "string (required)",
  "field2": "number (optional)"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "field1": "string",
  "field2": "number",
  "created_at": "datetime"
}
```

**Error Responses:** 400 (Validation), 401 (Unauthorized), 409 (Conflict)

## Data Model

### [Model Name] (Description)

- id, [field1], [field2], [field3], [field4]

### [Model Name2] (Description)

- id, [field1], [field2], owner_id

## Error Handling

### Standard Error Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Human readable message"
  }
}
```

### HTTP Status Codes

- 200: Success
- 201: Created
- 400: Validation Error
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 500: Internal Server Error

## Tech Stack (Latest Versions)

### Runtime & Framework

- **NestJS [version from package.json]** - API framework
- **TypeScript [version from package.json]** - Type safety
- **Node.js [version from package.json]** - Runtime

### Database & ORM

- **PostgreSQL** - Relational database
- **Drizzle ORM [version from package.json]** or **Prisma [version from package.json]** - Type-safe ORM
- **Supabase [version from package.json]** - BaaS option (Auth, Database, Storage)

### Validation & Serialization

- **class-validator [version from package.json]** - Decorator-based validation
- **class-transformer [version from package.json]** - Serialization / DTO transformation
- **Zod [version from package.json]** - Schema validation (pipes, standalone)

### Authentication

- **better-auth [version from package.json]** or **Passport.js [version from package.json]** - Auth library
- **JWT** - Token-based authentication

### Deployment

- **Docker Compose** - Containerized deployment

### Package Management

- **bun [version from package.json]** - Dependency management
```

### Medium Scale Template

```markdown
# [Project Name] API PRD

## Core Information

**Purpose**: [Problem this API solves in one line]
**Consumers**: [API consumer types]
**Key Constraints**: [Technical or business constraints]
**Scale**: [Expected request volume, data size]

## Auth & Permissions

### Authentication

- **Method**: [JWT / Session / OAuth2 / API Key]
- **Provider**: [better-auth / Supabase Auth / custom]
- **Token Lifecycle**: Access token [duration], Refresh token [duration]

### Role Definitions

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| [Role1] | [Description] | [What they can do] |
| [Role2] | [Description] | [What they can do] |
| [Admin] | [Description] | [What they can do] |

### Permission Matrix

| Resource Domain | [Role1] | [Role2] | [Admin] |
|----------------|---------|---------|---------|
| [Domain1] | Read | CRUD | CRUD + Manage |
| [Domain2] | — | Read/Create | CRUD + Manage |

## API Consumer Flow

### [Consumer Type 1] Flow

1. [Auth] → [Main interaction] → [Result]

### [Consumer Type 2] Flow

1. [Auth] → [Main interaction] → [Result]

## Feature Specifications

### 1. [Domain1] Features

| ID | Feature Name | Description | Auth Level | Endpoint Group |
|----|--------------|-------------|-----------|----------------|
| **F-DOMAIN1-001** | [Feature Name] | [Description] | [Role1, Role2] | [Group] |
| **F-DOMAIN1-002** | [Feature Name] | [Description] | [Admin] | [Group] |

### 2. Auth & System Features

| ID | Feature Name | Description | Auth Level | Endpoint Group |
|----|--------------|-------------|-----------|----------------|
| **F-AUTH-001** | Signup | User registration | Public | Auth |
| **F-AUTH-002** | Login | User authentication | Public | Auth |
| **F-AUTH-003** | Role-based Access | Route guard by role | System | Middleware |

### 3. Deferred Features

- [List of deferred features]

## API Endpoint Groups

### Auth

| Method | Endpoint | Description | Feature ID | Auth | Roles |
|--------|----------|-------------|------------|------|-------|
| POST | /auth/signup | User registration | F-AUTH-001 | Public | — |
| POST | /auth/login | User login | F-AUTH-002 | Public | — |
| POST | /auth/refresh | Refresh token | F-AUTH-002 | Bearer | All |

### [Domain1]

| Method | Endpoint | Description | Feature ID | Auth | Roles |
|--------|----------|-------------|------------|------|-------|
| GET | /[resource] | List resources | F-DOMAIN1-001 | Bearer | Role1, Role2 |
| POST | /[resource] | Create resource | F-DOMAIN1-001 | Bearer | Role2, Admin |

## Request/Response Specifications

### [Domain1] Endpoints

#### POST /[resource] (Create)

**Request Body:**
```json
{
  "field1": "string (required)",
  "field2": "number (optional)"
}
```

**Success Response (201):**
```json
{
  "id": "uuid",
  "field1": "string",
  "created_at": "datetime"
}
```

**Error Responses:** 400 (Validation), 401 (Unauthorized), 403 (Forbidden)

## Data Model

### [Model Name] (Description)

| Field | Description | Type/Relation |
|-------|-------------|---------------|
| id | Unique identifier | UUID |
| [field_name] | [Description] | [Type] |
| owner_id | Owner reference | → User.id |
| created_at | Creation timestamp | DateTime |

### Entity Relationships

- User 1:N [Model2] (ownership)
- [Model2] N:M [Model3] (association)

## Error Handling

### Standard Error Format

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Human readable message",
    "details": {}
  }
}
```

### Business Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| AUTH_INVALID_CREDENTIALS | 401 | Wrong email or password |
| AUTH_TOKEN_EXPIRED | 401 | Access token expired |
| RESOURCE_NOT_FOUND | 404 | Resource does not exist |
| PERMISSION_DENIED | 403 | Insufficient role permission |

## Event & Integration Architecture

### Domain Events

| Event | Trigger | Consumers |
|-------|---------|-----------|
| [event.created] | When [resource] is created | [Notification service], [Analytics] |
| [event.updated] | When [resource] status changes | [Consumer service] |

### External Integrations

| Service | Purpose | Integration Method |
|---------|---------|-------------------|
| [Email service] | Transactional emails | REST API |
| [Payment service] | Payment processing | REST API + Webhook |

### Webhooks (Outbound)

| Event | Payload | Retry Policy |
|-------|---------|-------------|
| [event.completed] | { id, status, timestamp } | 3 retries, exponential backoff |

## Tech Stack (Latest Versions)

### Runtime & Framework

- **NestJS [version from package.json]** - API framework
- **TypeScript [version from package.json]** - Type safety
- **Node.js [version from package.json]** - Runtime

### Database & ORM

- **PostgreSQL** - Relational database
- **Drizzle ORM [version from package.json]** or **Prisma [version from package.json]** - Type-safe ORM
- **Supabase [version from package.json]** - BaaS option

### Validation & Serialization

- **class-validator [version from package.json]** - Decorator-based validation
- **class-transformer [version from package.json]** - Serialization / DTO transformation
- **Zod [version from package.json]** - Schema validation (pipes, standalone)

### Authentication

- **better-auth [version from package.json]** or **Supabase Auth [version from package.json]** - Auth provider
- **JWT** - Token-based authentication

### Message Queue (if applicable)

- **BullMQ [version from package.json]** or **Supabase Realtime [version from package.json]** - Async job processing

### Deployment

- **Docker Compose** - Containerized deployment

### Package Management

- **bun [version from package.json]** - Dependency management
```
