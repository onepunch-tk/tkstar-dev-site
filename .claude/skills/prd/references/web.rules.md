# Web Platform Rules

Platform-specific rules for Web (React Router Framework) PRD generation.

## Platform-Specific MUST Generate Sections

### User Roles & Permissions (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Define each user role with clear responsibilities
- Permission matrix: Role x Feature access (CRUD level)
- Role hierarchy and escalation rules

### User Journey (Page Flow)

- Complete user flow diagram (page navigation flow)
- Page transition conditions and automatic redirections
- User decision branch points
- **(Medium)**: Separate flows per role where they diverge

### Menu Structure - Page Connection Verification

- Menu structure providing at-a-glance navigation overview
- **MUST map menu names to Feature IDs**
- **IMPORTANT: Do NOT write URL paths** - Use menu names only
- **All menu items must have corresponding pages in 'Page-by-Page Detailed Features'**

**Small**: Categorize by header menu, user-specific menu, common menu
**Medium**: Categorize by role-based menu sections with access indicators

### Page-by-Page Detailed Features - Feature Implementation Verification

Exactly 5 items per page:

- **Role**: Core purpose and role of this page
- **User Actions**: What users specifically do on this page
- **Entry Conditions**: How users reach this page (linked to menu structure)
- **Feature List**: Specific features provided on this page
- **Implemented Feature IDs**: List of Feature IDs implemented on this page **REQUIRED**

**(Medium) Add 1 extra item per page:**
- **Access Control**: Which roles can access, what each role can do (view/edit/delete)

### Security & Auth Overview (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Authentication method (session-based, JWT, OAuth providers)
- RBAC enforcement points (middleware, page-level, component-level)
- Data access scoping rules (users see only their own data, admins see all, etc.)

## Feature Specifications - Web Format

- **MUST specify page name where each feature is implemented**
- **IMPORTANT: Do NOT write URL paths** - Use page names only

**Small**: Sequential IDs -> `F001, F002, F003...`
- Include authentication features as needed (signup/login at minimum)
- Exclude settings, detailed profiles, notifications, and other nice-to-have features

**Medium**: Domain-grouped IDs -> `F-AUTH-001, F-ORDER-001, F-ADMIN-001...`
- Group features by domain (AUTH, USER, ORDER, PRODUCT, ADMIN, etc.)
- Include **Auth Level** column indicating required role
- Include moderate support features (settings, notifications) if core to role workflow

## Processing Workflow - Web Specific Steps

1. **Design complete user journey flow** - Page navigation flow (page names only, no URLs)
2. **(Medium) Define user roles and permission matrix**
3. **Map implementation page names per feature** - Connect as F001 -> Login Page format (no URL paths)
4. Design menu structure - Complete navigation system (linked to Feature IDs, no URL paths)
5. Page-by-page detailed feature specification - MUST include implemented Feature IDs (page names only)
6. **(Medium) Define security & auth overview**

## Tech Stack Selection Principles - Web

- **React Router Framework**: Latest App Router, improved performance, React support
- **TailwindCSS**: Leverage new CSS engine without config file
- **TypeScript**: Code stability with latest type system
- **Supabase**: Minimize backend infrastructure, realtime features
- **Prioritize low learning curve and well-documented latest technologies**
- **Prioritize active community and long-term supported technologies**

**When writing tech stack, ALWAYS include**:
- React Router Framework (resolve version from package.json)
- React (resolve version from package.json)
- TailwindCSS (resolve version from package.json)
- Verify and specify actual version from package.json for each technology

## Consistency Validation Checklist - Web Specific

**Execution Order: MUST validate after PRD writing completion**

### Step 1: Feature Specs -> Page Connection Validation

- [ ] Do all Feature IDs in Feature Specifications exist in Page-by-Page Detailed Features?
- [ ] Do all Related Page names in Feature Specifications actually exist in Page-by-Page Detailed Features?

### Step 2: Menu Structure -> Page Connection Validation

- [ ] Do all menu items in Menu Structure exist as corresponding pages in Page-by-Page Detailed Features?
- [ ] Are all Feature IDs referenced in menu defined in Feature Specifications?

### Step 3: Page-by-Page Detailed Features -> Back-reference Validation

- [ ] Are all Implemented Feature IDs in Page-by-Page Detailed Features defined in Feature Specifications?
- [ ] Are all pages accessible from Menu Structure?

### Step 4: Missing and Orphan Item Validation

- [ ] Are there features only in Feature Specifications not implemented in any page? (Remove or add page)
- [ ] Are there features only in pages not defined in Feature Specifications? (Add to Feature Specifications)
- [ ] Are there menu items without actual pages? (Add page or remove from menu)

### Step 5: Permission Consistency Validation (Medium ONLY)

- [ ] Do all roles in User Roles have corresponding menu sections?
- [ ] Does the Access Control in each page match the Permission Matrix?
- [ ] Are Auth Level values in Feature Specifications consistent with the Permission Matrix?
- [ ] Are there pages accessible to roles that shouldn't have access?

### Step 6: Domain Group Validation (Medium ONLY)

- [ ] Are all Feature IDs properly grouped by domain prefix? (F-AUTH-xxx, F-ORDER-xxx, etc.)
- [ ] Does each domain group have at least one feature?
- [ ] Are domain names consistent between Feature Specifications and Menu Structure?

**On Validation Failure: Fix the item and re-run entire checklist**
