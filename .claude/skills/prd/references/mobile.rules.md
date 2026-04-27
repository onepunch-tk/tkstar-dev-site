# Mobile Platform Rules

Platform-specific rules for Mobile (Expo / React Native) PRD generation.

## Platform-Specific MUST Generate Sections

### User Roles & Permissions (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Define each user role with clear responsibilities
- Permission matrix: Role x Feature access
- Role-specific navigation and screen access

### User Journey (Screen Flow)

- Complete user flow diagram (screen navigation flow)
- Screen transition conditions (gestures, taps, swipes)
- Deep link entry points
- **(Medium)**: Separate flows per role where they diverge

### Tab/Navigation Structure - Screen Connection Verification

- Navigation structure providing at-a-glance overview
- **MUST map screen names to Feature IDs**
- **All navigation items must have corresponding screens in 'Screen-by-Screen Detailed Features'**

**Small**: Simple tab + stack structure

**Medium**: Role-based navigation with nested navigators

Navigation types to specify:
- **Tab Navigator**: Bottom tabs (main navigation)
- **Stack Navigator**: Push/pop screen sequences
- **Drawer Navigator**: Side menu (if applicable)
- **Modal**: Overlay screens

### Screen-by-Screen Detailed Features - Feature Implementation Verification

Exactly 6 items per screen:

- **Role**: Core purpose of this screen
- **User Actions**: What users specifically do (taps, swipes, inputs)
- **Entry Conditions**: How users reach this screen (navigation path)
- **Feature List**: Specific features provided on this screen
- **Implemented Feature IDs**: List of Feature IDs implemented **REQUIRED**
- **Platform Notes**: Any iOS/Android differences (or "None" if identical)

**(Medium) Add 1 extra item per screen:**
- **Access Control**: Which roles can access, what each role can do

### Device Capabilities & Platform (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Required device permissions (camera, location, notifications, etc.)
- Platform-specific behavior differences (iOS vs Android)
- Background task requirements
- Push notification strategy and triggers

### Offline & Data Sync Strategy (Medium ONLY)

> Skip this section entirely for Small scale projects.

- Which data is available offline
- Sync strategy (optimistic, pessimistic, conflict resolution)
- Local storage approach (AsyncStorage, SQLite, MMKV)
- Network state handling

## Feature Specifications - Mobile Format

- **MUST specify screen name where each feature is implemented**

**Small**: Sequential IDs -> `F001, F002, F003...`
- Include authentication features as needed (signup/login at minimum)
- Exclude settings, detailed profiles, advanced notifications

**Medium**: Domain-grouped IDs -> `F-AUTH-001, F-TRACK-001, F-SOCIAL-001...`
- Group features by domain (AUTH, USER, TRACK, SOCIAL, ADMIN, etc.)
- Include **Auth Level** column indicating required role
- Include device-dependent features (camera, GPS, biometrics) with platform notes

## Data Model - Mobile Specific

**Small**:
- List only required table/model names
- 3-5 core fields per table (field names only, no types)
- Indicate which data is stored locally vs server

**Medium**:
- List all required tables with descriptions
- 5-10 fields per table with types and relations
- Indicate foreign key relationships with `-> [Model].id`
- Specify local storage vs server storage for each model
- Include offline-capable flag per model

## Processing Workflow - Mobile Specific Steps

1. **Design complete user journey flow** - Screen navigation flow (screen names only)
2. **(Medium) Define user roles and permission matrix**
3. **Map implementation screen names per feature** - Connect as F001 -> Home Screen format
4. Design tab/navigation structure - Complete navigation tree (linked to Feature IDs)
5. Screen-by-screen detailed feature specification - MUST include implemented Feature IDs
6. Minimize required data models, specify local vs server storage
7. **(Medium) Define device capabilities, notifications, and offline strategy**

## Tech Stack Selection Principles - Mobile

- **Expo SDK**: Managed workflow for faster development (New Architecture only)
- **Expo Router**: File-based navigation consistent with web patterns
- **NativeWind**: TailwindCSS for React Native, consistent with web styling
- **Unistyles**: C++ powered alternative/complement to NativeWind for advanced theming and responsive styles
- **React Native Reusables**: shadcn/ui port for React Native
- **Supabase**: Minimize backend infrastructure, leverage built-in auth and realtime
- **Prioritize Expo ecosystem for maximum compatibility**
- **Prioritize active community and long-term supported technologies**

## Consistency Validation Checklist - Mobile Specific

**Execution Order: MUST validate after PRD writing completion**

### Step 1: Feature Specs -> Screen Connection Validation

- [ ] Do all Feature IDs in Feature Specifications exist in Screen-by-Screen Detailed Features?
- [ ] Do all Related Screen names in Feature Specifications actually exist in Screen-by-Screen Detailed Features?

### Step 2: Navigation Structure -> Screen Connection Validation

- [ ] Do all navigation items in Tab/Navigation Structure exist as corresponding screens in Screen-by-Screen Detailed Features?
- [ ] Are all Feature IDs referenced in navigation defined in Feature Specifications?

### Step 3: Screen-by-Screen -> Back-reference Validation

- [ ] Are all Implemented Feature IDs in Screen-by-Screen Detailed Features defined in Feature Specifications?
- [ ] Are all screens accessible from Tab/Navigation Structure?

### Step 4: Missing and Orphan Item Validation

- [ ] Are there features only in Feature Specifications not implemented in any screen? (Remove or add screen)
- [ ] Are there features only in screens not defined in Feature Specifications? (Add to Feature Specifications)
- [ ] Are there navigation items without actual screens? (Add screen or remove from navigation)

### Step 5: Permission Consistency Validation (Medium ONLY)

- [ ] Do all roles in User Roles have corresponding navigation sections (separate Tab Navigators)?
- [ ] Does the Access Control in each screen match the Permission Matrix?
- [ ] Are Auth Level values in Feature Specifications consistent with the Permission Matrix?

### Step 6: Domain Group Validation (Medium ONLY)

- [ ] Are all Feature IDs properly grouped by domain prefix? (F-AUTH-xxx, F-TRACK-xxx, etc.)
- [ ] Does each domain group have at least one feature?
- [ ] Are domain names consistent between Feature Specifications and Navigation Structure?

### Step 7: Platform & Device Validation (Medium ONLY)

- [ ] Are all required device permissions listed in Device Capabilities?
- [ ] Do features using device APIs have corresponding permission entries?
- [ ] Are platform differences documented for features that behave differently on iOS vs Android?
- [ ] Are push notification triggers linked to valid Feature IDs?

### Step 8: Storage Consistency Validation

- [ ] Is storage location (Local/Server/Both) specified for each data model?
- [ ] Are offline-available models consistent with the Offline & Data Sync strategy? (Medium)
- [ ] Do local storage models have appropriate sync strategies defined? (Medium)

**On Validation Failure: Fix the item and re-run entire checklist**
