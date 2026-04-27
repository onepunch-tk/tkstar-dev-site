## Output Template

### Small Scale Template

```markdown
# [Project Name] Mobile App PRD

## Core Information

**Purpose**: [Problem this app solves in one line]
**Users**: [Target users specifically in one line]

## User Journey

1. [App Launch] → Splash Screen
   ↓ [Auth Check]

2. [Not Logged In] → Login Screen
   ↓ [Login Success]

3. [Home Tab] → [Main content screen]
   ↓ [User taps item]

4. [Detail Screen] → [Actions available]
   ↓ [Back gesture / Tab switch]

5. [Other tabs] → [Supporting screens]

## Feature Specifications

### 1. Core Features

| ID | Feature Name | Description | Priority | Related Screens |
|----|--------------|-------------|---------------|-----------------|
| **F001** | [Feature Name] | [Brief Description] | [Core Value] | [Screen1], [Screen2] |
| **F002** | [Feature Name] | [Brief Description] | [Core Logic] | [Screen1] |

### 2. Required Support Features

| ID | Feature Name | Description | Priority | Related Screens |
|----|--------------|-------------|---------------|-----------------|
| **F010** | Basic Auth | Signup/Login/Logout | Minimum auth | Login Screen, Signup Screen |

### 3. Deferred Features

- [List of deferred features]

## Tab/Navigation Structure

📱 Tab Navigator (Bottom)
├── 🏠 Home Tab (Stack)
│   ├── Home Screen → F001
│   └── Detail Screen → F002
├── 🔍 Search Tab (Stack)
│   ├── Search Screen → F003
│   └── Result Screen → F003
└── 👤 Profile Tab (Stack)
    ├── Profile Screen → F010
    └── Settings Screen → F010

🔐 Auth Stack (Before Login)
├── Login Screen → F010
└── Signup Screen → F010

📋 Modal Screens
└── [Modal Screen] → F004

## Screen-by-Screen Detailed Features

### [Screen Name]

> **Implemented Features:** `F001`, `F002` | **Navigator:** [Tab/Stack/Modal]

| Item | Content |
|------|---------|
| **Role** | [Core purpose of this screen] |
| **Entry Path** | [How users reach this screen - tab tap, push, modal present] |
| **User Actions** | [Taps, swipes, pull-to-refresh, form input, etc.] |
| **Key Features** | • [Feature1]<br>• [Feature2]<br>• **[Main CTA]** button |
| **Next Navigation** | Push → [Screen], Back ← [Screen], Tab → [Tab] |
| **Platform Notes** | None (or iOS/Android specific behavior) |

## Data Model

### [Model Name] (Description)

- id, [field1], [field2], [field3]
- Storage: Server / Local / Both

### [Model Name2] (Description)

- id, [field1], [field2], owner_id
- Storage: Server

## Tech Stack (Latest Versions)

### Core Framework

- **Expo SDK [version from package.json]** - React Native development platform
- **React Native [version from package.json]** - Mobile UI framework (New Architecture only)
- **TypeScript [version from package.json]** - Type safety
- **React [version from package.json]** - UI library
- **Expo Router [version from package.json]** - File-based navigation

### UI & Styling

- **NativeWind [version from package.json]** (TailwindCSS) - Utility styling
- **Unistyles [version from package.json]** - C++ powered StyleSheet with superpowers (theming, responsive, variants)
- **React Native Reusables [version from package.json]** - shadcn/ui for React Native
- **Lucide React Native [version from package.json]** - Icon library

### State & Data

- **TanStack Query [version from package.json]** - Server state management
- **Zustand [version from package.json]** - Client state management
- **MMKV [version from package.json]** - Fast local storage

### Forms & Validation

- **React Hook Form [version from package.json]** - Form state management
- **Zod [version from package.json]** - Schema validation

### Backend & Database

- **Supabase [version from package.json]** - BaaS (Auth, Database, Storage)

### Deployment

- **EAS Build** - Cloud builds for iOS/Android
- **EAS Submit** - App store submission

### Package Management

- **bun [version from package.json]** - Dependency management
```

### Medium Scale Template

```markdown
# [Project Name] Mobile App PRD

## Core Information

**Purpose**: [Problem this app solves in one line]
**Target Users**: [User segments by role]
**Platform**: iOS and Android (cross-platform)
**Key Constraints**: [Technical or business constraints]

## User Roles & Permissions

### Role Definitions

| Role | Description | Key Capabilities |
|------|-------------|-----------------|
| [Role1] | [Description] | [What they can do] |
| [Role2] | [Description] | [What they can do] |

### Permission Matrix

| Feature Domain | [Role1] | [Role2] |
|---------------|---------|---------|
| [Domain1] | View | View + Create + Edit |
| [Domain2] | View + Create | View + Manage |

## User Journey

### [Role1] Flow

1. [App Launch] → [Auth] → [Home] → [Core Action] → [Result]

### [Role2] Flow

1. [App Launch] → [Auth] → [Dashboard] → [Management Action] → [Result]

## Feature Specifications

### 1. [Domain1] Features

| ID | Feature Name | Description | Auth Level | Related Screens |
|----|--------------|-------------|-----------|-----------------|
| **F-DOMAIN1-001** | [Feature] | [Description] | [Role1, Role2] | [Screen1] |
| **F-DOMAIN1-002** | [Feature] | [Description] | [Role2] | [Screen2] |

### 2. Auth & System Features

| ID | Feature Name | Description | Auth Level | Related Screens |
|----|--------------|-------------|-----------|-----------------|
| **F-AUTH-001** | Signup | User registration | Public | Signup Screen |
| **F-AUTH-002** | Login | Authentication | Public | Login Screen |
| **F-AUTH-003** | Biometric Login | Fingerprint/Face ID | Authenticated | Login Screen |

### 3. Deferred Features

- [List of deferred features]

## Tab/Navigation Structure

📱 [Project Name] Navigation

🔐 Auth Stack (Before Login)
├── Welcome Screen → F-AUTH-001, F-AUTH-002
├── Login Screen → F-AUTH-002, F-AUTH-003
└── Signup Screen → F-AUTH-001

👤 [Role1] Tab Navigator
├── 🏠 Home Tab (Stack)
│   ├── Home Screen → F-DOMAIN1-001
│   └── Detail Screen → F-DOMAIN1-001
├── 🔍 Search Tab (Stack)
│   └── Search Screen → F-DOMAIN1-003
├── ❤️ Favorites Tab (Stack)
│   └── Favorites Screen → F-DOMAIN2-001
└── 👤 Profile Tab (Stack)
    └── Profile Screen → F-AUTH-004

🏪 [Role2] Tab Navigator
├── 📊 Dashboard Tab (Stack)
│   └── Dashboard Screen → F-DOMAIN1-001, F-DOMAIN1-002
├── 📦 Management Tab (Stack)
│   ├── List Screen → F-DOMAIN2-001
│   └── Edit Screen → F-DOMAIN2-002
└── 👤 Profile Tab (Stack)
    └── Profile Screen → F-AUTH-004

📋 Shared Modal Screens
├── [Modal Screen1] → F-DOMAIN1-002
└── [Modal Screen2] → F-DOMAIN2-003

## Screen-by-Screen Detailed Features

### [Screen Name]

> **Implemented Features:** `F-DOMAIN1-001`, `F-DOMAIN1-002` | **Access:** [Role1], [Role2]

| Item | Content |
|------|---------|
| **Role** | [Core purpose of this screen] |
| **Entry Path** | [How users reach this screen] |
| **User Actions** | [Taps, swipes, inputs, gestures] |
| **Key Features** | • [Feature1]<br>• [Feature2]<br>• **[Main CTA]** button |
| **Next Navigation** | Push → [Screen], Modal → [Screen] |
| **Platform Notes** | iOS: [behavior] / Android: [behavior] |
| **Access Control** | [Role1]: View only / [Role2]: Full CRUD |

## Data Model

### [Model Name] (Description)

| Field | Description | Type/Relation | Storage |
|-------|-------------|---------------|---------|
| id | Unique identifier | UUID | Server |
| [field_name] | [Description] | [Type] | Server |
| [field_name] | [Description] | → [Model].id | Server |
| [local_field] | [Description] | [Type] | Local (MMKV) |

### Entity Relationships

- User 1:N [Model2] (ownership)
- [Model2] N:M [Model3] (association)

## Device Capabilities & Platform

### Required Permissions

| Permission | Purpose | Required/Optional |
|-----------|---------|-------------------|
| Camera | [Purpose] | Required |
| Location | [Purpose] | Optional |
| Push Notifications | [Purpose] | Required |
| Biometric | [Purpose] | Optional |

### Platform Differences

| Feature | iOS | Android |
|---------|-----|---------|
| Biometric | Face ID / Touch ID | Fingerprint |
| Push | APNs | FCM |
| [Feature] | [Behavior] | [Behavior] |

### Push Notification Triggers

| Event | Title | Body | Deep Link |
|-------|-------|------|-----------|
| [event] | [Title] | [Body] | [Screen Name] |
| [event] | [Title] | [Body] | [Screen Name] |

## Offline & Data Sync Strategy

### Offline Available Data

| Data | Storage | Sync Strategy |
|------|---------|--------------|
| [User profile] | MMKV | Sync on launch |
| [Cached items] | SQLite | Background sync every [interval] |
| [Draft data] | MMKV | Sync when online |

### Conflict Resolution

- **Strategy**: [Last-write-wins / Server-wins / Manual merge]
- **Queue**: Offline actions queued and replayed on reconnect

### Network State Handling

- Online: Normal API calls
- Offline: Show cached data + queue mutations
- Reconnecting: Auto-sync queued changes

## Tech Stack (Latest Versions)

### Core Framework

- **Expo SDK [version from package.json]** - React Native development platform
- **React Native [version from package.json]** - Mobile UI framework (New Architecture only)
- **TypeScript [version from package.json]** - Type safety
- **React [version from package.json]** - UI library
- **Expo Router [version from package.json]** - File-based navigation

### UI & Styling

- **NativeWind [version from package.json]** (TailwindCSS) - Utility styling
- **Unistyles [version from package.json]** - C++ powered StyleSheet with superpowers (theming, responsive, variants)
- **React Native Reusables [version from package.json]** - shadcn/ui for React Native
- **Lucide React Native [version from package.json]** - Icon library
- **React Native Reanimated [version from package.json]** - Animations

### State & Data

- **TanStack Query [version from package.json]** - Server state + offline support
- **Zustand [version from package.json]** - Client state management
- **MMKV [version from package.json]** - Fast local storage
- **Expo SQLite [version from package.json]** - Structured local database (if needed)

### Forms & Validation

- **React Hook Form [version from package.json]** - Form state management
- **Zod [version from package.json]** - Schema validation

### Device Features

- **expo-camera [version from package.json]** - Camera access
- **expo-location [version from package.json]** - GPS/Location
- **expo-notifications [version from package.json]** - Push notifications
- **expo-local-authentication [version from package.json]** - Biometric auth

### Backend & Database

- **Supabase [version from package.json]** - BaaS (Auth, Database, Realtime, Storage)

### Deployment

- **EAS Build** - Cloud builds for iOS/Android
- **EAS Submit** - App store submission
- **EAS Update** - OTA updates

### Package Management

- **bun [version from package.json]** - Dependency management
```
