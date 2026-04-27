## Output Template

### Small Scale Template

```markdown
# [Project Name] PRD

## Core Information

**Purpose**: [Problem to solve in one line]
**Users**: [Target users specifically in one line]

## User Journey

1. [Start Page]
   ↓ [Action/Button Click]

2. [Next Page]
   ↓ [Condition Check]

   [Condition A] → [Page A] → [Next Step]
   [Condition B] → [Page B] → [Next Step]
   ↓

3. [Final Page]
   ↓ [Post-Completion Action]

4. [Complete] → [Next Action Options]

## Feature Specifications

### 1. Core Features

| ID | Feature Name | Description | Priority | Related Pages |
|----|--------------|-------------|---------------|---------------|
| **F001** | [Feature Name] | [Brief Description] | [Core Value Delivery] | [Page Name1], [Page Name2] |
| **F002** | [Feature Name] | [Brief Description] | [Core Business Logic] | [Page Name1], [Page Name2] |

### 2. Required Support Features

| ID | Feature Name | Description | Priority | Related Pages |
|----|--------------|-------------|---------------|---------------|
| **F010** | Basic Auth | Signup/Login/Logout only | Minimum auth for service usage | Login Page, Signup Page |

### 3. Deferred Features

- [List of deferred features]

## Menu Structure

📱 [Project Name] Navigation
├── 🏠 Home
│   └── Feature: F002 ([Feature Description])
├── 🔍 [Menu Name]
│   └── Feature: F001 ([Feature Description])
└── 👤 Auth (Not Logged In)
    ├── Login - F010
    └── Signup - F010

👤 User Menu (After Login)
├── 📦 [Menu Name]
│   └── Feature: F004 ([Feature Description])
└── 🚪 Logout

## Page-by-Page Detailed Features

### [Page Name]

> **Implemented Features:** `F001`, `F002` | **Menu Location:** [Location Description]

| Item | Content |
|------|---------|
| **Role** | [Core purpose and role of this page] |
| **Entry Path** | [How users reach this page] |
| **User Actions** | [Specific actions users take on this page] |
| **Key Features** | • [Specific Feature1]<br>• [Specific Feature2]<br>• **[Main Action]** button |
| **Next Navigation** | Success → [Next Page Name], Failure → Error display |

## Data Model

### [Model Name] (Description)

- id, [field1], [field2], [field3], [field4]

### [Model Name2] (Description)

- id, [field1], [field2], [field3]

## Tech Stack (Latest Versions)

### Frontend Framework

- **React Router Framework [version from package.json]** - React full-stack framework
- **TypeScript [version from package.json]** - Type safety
- **React [version from package.json]** - UI library

### Styling & UI

- **TailwindCSS [version from package.json]** - Utility CSS framework
- **shadcn/ui [version from package.json]** - React component library
- **Lucide React [version from package.json]** - Icon library

### Forms & Validation

- **React Hook Form [version from package.json]** - Form state management
- **Zod [version from package.json]** - Schema validation library

### Backend & Database

- **Supabase [version from package.json]** - BaaS (Auth, Database, Realtime subscriptions)
- **PostgreSQL** - Relational database

### Deployment & Hosting

- **CloudFlare Workers** or **Docker Compose** (Node)

### Package Management

- **bun [version from package.json]** - Dependency management
```

### Medium Scale Template

```markdown
# [Project Name] PRD

## Core Information

**Purpose**: [Problem to solve in one line]
**Target Users**: [User segments by role]
**Key Constraints**: [Technical or business constraints]
**Scale**: [Expected user count, data volume]

## User Roles & Permissions

### Role Definitions

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| [Role1] | [Description] | [What they can do] |
| [Role2] | [Description] | [What they can do] |
| [Admin] | [Description] | [What they can do] |

### Permission Matrix

| Feature Domain | [Role1] | [Role2] | [Admin] |
|---------------|---------|---------|---------|
| [Domain1] | Read | CRUD | CRUD + Manage |
| [Domain2] | Read/Create | Read | CRUD + Manage |
| [Domain3] | — | Read/Create | CRUD + Manage |

## User Journey

### [Role1] Flow

1. [Start] → [Step] → [Step] → [End]

### [Role2] Flow

1. [Start] → [Step] → [Step] → [End]

### [Admin] Flow

1. [Start] → [Step] → [Step] → [End]

## Feature Specifications

### 1. [Domain1] Features

| ID | Feature Name | Description | Auth Level | Related Pages |
|----|--------------|-------------|-----------|---------------|
| **F-DOMAIN1-001** | [Feature Name] | [Brief Description] | [Role1, Role2] | [Page Name1] |
| **F-DOMAIN1-002** | [Feature Name] | [Brief Description] | [Admin] | [Admin Page] |

### 2. [Domain2] Features

| ID | Feature Name | Description | Auth Level | Related Pages |
|----|--------------|-------------|-----------|---------------|
| **F-DOMAIN2-001** | [Feature Name] | [Brief Description] | [Role2] | [Page Name1] |

### 3. Auth & System Features

| ID | Feature Name | Description | Auth Level | Related Pages |
|----|--------------|-------------|-----------|---------------|
| **F-AUTH-001** | Signup | User registration | Public | Signup Page |
| **F-AUTH-002** | Login | User authentication | Public | Login Page |
| **F-AUTH-003** | Role-based Access | Route guard by role | System | All Pages |

### 4. Deferred Features

- [List of deferred features]

## Menu Structure

📱 [Project Name] Navigation

🔓 Public (Not Logged In)
├── 🏠 Home → F-DOMAIN1-001
├── 🔐 Login → F-AUTH-002
└── 📝 Signup → F-AUTH-001

👤 [Role1] Menu
├── 📦 [Menu Name] → F-DOMAIN1-001
├── 📋 [Menu Name] → F-DOMAIN2-001
└── ⚙️ Settings → F-AUTH-004

🏪 [Role2] Menu
├── 📊 Dashboard → F-DOMAIN1-001, F-DOMAIN1-002
├── 🎨 [Menu Name] → F-DOMAIN2-001
└── ⚙️ Settings → F-AUTH-004

🛡️ Admin Menu
├── 👥 User Management → F-ADMIN-001
├── 📊 System Dashboard → F-ADMIN-002
└── ⚙️ System Settings → F-ADMIN-003

## Page-by-Page Detailed Features

### [Page Name]

> **Implemented Features:** `F-DOMAIN1-001`, `F-DOMAIN1-002` | **Access:** [Role1], [Role2], [Admin]

| Item | Content |
|------|---------|
| **Role** | [Core purpose and role of this page] |
| **Entry Path** | [How users reach this page] |
| **User Actions** | [Specific actions users take on this page] |
| **Key Features** | • [Specific Feature1]<br>• [Specific Feature2]<br>• **[Main Action]** button |
| **Next Navigation** | Success → [Next Page Name], Failure → Error display |
| **Access Control** | [Role1]: View only / [Role2]: View + Edit / [Admin]: Full CRUD |

## Data Model

### [Model Name] (Description)

| Field | Description | Type/Relation |
|-------|-------------|---------------|
| id | Unique identifier | UUID |
| [field_name] | [Field description] | [Type] |
| [field_name] | [Field description] | → [RelatedModel].id |
| role | User role | Enum: [Role1, Role2, Admin] |
| created_at | Creation timestamp | DateTime |

### [Model Name2] (Description)

| Field | Description | Type/Relation |
|-------|-------------|---------------|
| id | Unique identifier | UUID |
| [field_name] | [Field description] | [Type] |
| owner_id | Owner reference | → User.id |

### Entity Relationships

- User 1:N [Model2] (ownership)
- [Model2] N:M [Model3] (association)

## Security & Auth Overview

### Authentication

- **Method**: [Session-based / JWT / OAuth providers]
- **Provider**: [Supabase Auth / better-auth / etc.]

### Authorization (RBAC)

| Enforcement Point | Method |
|-------------------|--------|
| Route Level | Middleware guard checking user role |
| Page Level | Loader-based role check with redirect |
| Component Level | Conditional rendering by role |
| Data Level | RLS policies scoping data to owner/role |

### Data Access Scoping

- [Role1]: Own data only
- [Role2]: Own data + related [Role1] data
- [Admin]: All data

## Tech Stack (Latest Versions)

### Frontend Framework

- **React Router Framework [version from package.json]** - React full-stack framework
- **TypeScript [version from package.json]** - Type safety
- **React [version from package.json]** - UI library

### Styling & UI

- **TailwindCSS [version from package.json]** - Utility CSS framework
- **shadcn/ui [version from package.json]** - React component library
- **Lucide React [version from package.json]** - Icon library

### Forms & Validation

- **React Hook Form [version from package.json]** - Form state management
- **Zod [version from package.json]** - Schema validation library

### Backend & Database

- **Supabase [version from package.json]** - BaaS (Auth, Database, Realtime subscriptions)
- **PostgreSQL** - Relational database

### Deployment & Hosting

- **CloudFlare Workers** or **Docker Compose** (Node)

### Package Management

- **bun [version from package.json]** - Dependency management
```
