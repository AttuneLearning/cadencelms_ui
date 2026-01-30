# LMS UI V2 Architecture Options

## 1. Executive Summary

This document presents three distinct architecture options for the LMS UI V2 project, each addressing the core requirements of maintainability, mobile-first design, offline capabilities, and support for agentic team development. The architectures range from a unified cross-platform approach to a highly modular micro-frontend design.

### Key Decision Factors

| Factor | Weight | Rationale |
|--------|--------|-----------|
| Offline-First Capability | High | Critical for course access without connectivity |
| Mobile Code Sharing | High | Future React Native app requirement |
| Maintainability | High | Team development and long-term sustainability |
| SCORM Support | High | Must work offline with full state management |
| Development Velocity | Medium | Time-to-market considerations |
| Bundle Size | Medium | Performance on mobile devices |
| Team Scalability | Medium | Support for multiple concurrent developers |

### Architecture Options Overview

1. **Cross-Platform Monorepo with React Native Web** - Maximum code reuse between web and mobile platforms using a shared component library
2. **Feature-Slice Design with Offline-First Core** - Modular feature-based architecture with a dedicated offline synchronization layer
3. **Micro-Frontend Architecture with Module Federation** - Independent deployable modules for maximum team autonomy

---

## 2. Architecture Option 1: Cross-Platform Monorepo with React Native Web

### Overview

This architecture leverages `react-native-web` to create truly cross-platform components that compile to both web and native platforms. Using a Turborepo monorepo structure, shared business logic, UI components, and offline capabilities are centralized in packages that can be consumed by both the web application and a future React Native mobile app.

### Architecture Diagram

```
+------------------------------------------------------------------+
|                        MONOREPO (Turborepo)                       |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------+  +------------------+  +------------------+ |
|  |   apps/web       |  |  apps/mobile     |  |   apps/admin     | |
|  |   (Vite + RN-Web)|  |  (Expo/RN)       |  |   (Vite)         | |
|  +--------+---------+  +--------+---------+  +--------+---------+ |
|           |                     |                     |           |
|           +----------+----------+----------+----------+           |
|                      |                     |                      |
|  +-------------------v---------------------v-------------------+  |
|  |                    packages/ui                              |  |
|  |  (React Native Web Components - Tamagui/NativeWind)        |  |
|  |  +--------+ +--------+ +----------+ +--------+ +--------+  |  |
|  |  | Button | | Card   | | DataGrid | | Modal  | | Forms  |  |  |
|  |  +--------+ +--------+ +----------+ +--------+ +--------+  |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|  +---------------------------v---------------------------------+  |
|  |                   packages/core                             |  |
|  |  +------------+ +-------------+ +------------+ +----------+ |  |
|  |  | api-client | | auth-store  | | sync-engine| | types    | |  |
|  |  +------------+ +-------------+ +------------+ +----------+ |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|  +---------------------------v---------------------------------+  |
|  |                 packages/offline                            |  |
|  |  +-------------+ +---------------+ +-------------------+    |  |
|  |  | IndexedDB   | | ServiceWorker | | SCORM-Offline     |    |  |
|  |  | Adapter     | | Manager       | | Runtime           |    |  |
|  |  +-------------+ +---------------+ +-------------------+    |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
                              |
                              v
+------------------------------------------------------------------+
|                    LMS Node V2 API                                |
|  +-------+ +--------+ +-------+ +-------+ +--------+ +--------+  |
|  | Auth  | | Courses| | SCORM | | Users | | Content| | Reports|  |
|  +-------+ +--------+ +-------+ +-------+ +--------+ +--------+  |
+------------------------------------------------------------------+
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Monorepo** | Turborepo 2.x | Build orchestration, caching, task dependencies |
| **UI Framework** | React 18.3 + React Native Web | Cross-platform components |
| **Styling** | Tamagui or NativeWind | Universal styling system |
| **State Management** | Zustand + TanStack Query | Client & server state |
| **Offline Storage** | IndexedDB (Dexie.js) | Structured offline data |
| **Sync Engine** | Custom + Workbox | Background sync, conflict resolution |
| **Forms** | React Hook Form + Zod | Validation with type inference |
| **Routing** | React Router 7 (web), React Navigation (mobile) | Platform-specific routing |
| **Build** | Vite 6 (web), Metro (mobile) | Fast builds |
| **Testing** | Vitest + React Testing Library | Unit and integration |
| **E2E** | Playwright (web), Detox (mobile) | End-to-end testing |
| **TypeScript** | 5.4+ | Full type safety |

### Project Structure

```
lms-ui-v2/
├── turbo.json
├── package.json
├── tsconfig.base.json
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/                          # Main web application
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   ├── public/
│   │   │   └── sw.js                 # Service worker entry
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── routes/
│   │       │   ├── index.tsx
│   │       │   ├── learner/
│   │       │   ├── staff/
│   │       │   └── admin/
│   │       ├── layouts/
│   │       │   ├── AppShell.tsx
│   │       │   ├── LearnerLayout.tsx
│   │       │   └── AdminLayout.tsx
│   │       └── features/
│   │           ├── dashboard/
│   │           ├── courses/
│   │           ├── scorm/
│   │           └── assessments/
│   │
│   ├── mobile/                       # React Native app (future)
│   │   ├── package.json
│   │   ├── app.json
│   │   ├── metro.config.js
│   │   └── src/
│   │       ├── App.tsx
│   │       ├── navigation/
│   │       └── screens/
│   │
│   └── admin/                        # Separate admin portal (optional)
│       └── ...
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── primitives/           # Base components
│   │       │   ├── Button.tsx
│   │       │   ├── Text.tsx
│   │       │   ├── Input.tsx
│   │       │   └── Card.tsx
│   │       ├── composites/           # Complex components
│   │       │   ├── DataTable.tsx
│   │       │   ├── Modal.tsx
│   │       │   ├── Drawer.tsx
│   │       │   └── CourseCard.tsx
│   │       ├── forms/
│   │       │   ├── FormField.tsx
│   │       │   └── FormSelect.tsx
│   │       └── theme/
│   │           ├── tokens.ts
│   │           └── tamagui.config.ts
│   │
│   ├── core/                         # Business logic & API
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   ├── endpoints.ts
│   │       │   └── modules/
│   │       │       ├── auth.ts
│   │       │       ├── courses.ts
│   │       │       ├── scorm.ts
│   │       │       ├── enrollments.ts
│   │       │       └── content.ts
│   │       ├── stores/
│   │       │   ├── auth.store.ts
│   │       │   ├── courses.store.ts
│   │       │   └── offline.store.ts
│   │       ├── hooks/
│   │       │   ├── useAuth.ts
│   │       │   ├── useCourses.ts
│   │       │   └── useOfflineStatus.ts
│   │       └── types/
│   │           ├── api.types.ts
│   │           ├── models.types.ts
│   │           └── scorm.types.ts
│   │
│   ├── offline/                      # Offline capabilities
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── storage/
│   │       │   ├── db.ts             # Dexie IndexedDB schema
│   │       │   ├── courses.table.ts
│   │       │   ├── content.table.ts
│   │       │   └── scorm.table.ts
│   │       ├── sync/
│   │       │   ├── SyncManager.ts
│   │       │   ├── ConflictResolver.ts
│   │       │   └── QueueProcessor.ts
│   │       ├── scorm/
│   │       │   ├── OfflineScormRuntime.ts
│   │       │   ├── ScormStateManager.ts
│   │       │   └── ScormPackageCache.ts
│   │       └── sw/
│   │           ├── serviceWorker.ts
│   │           └── strategies.ts
│   │
│   ├── scorm/                        # SCORM runtime
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── runtime/
│   │       │   ├── Scorm12API.ts
│   │       │   ├── Scorm2004API.ts
│   │       │   └── ScormBridge.ts
│   │       └── models/
│   │           └── ScormDataModel.ts
│   │
│   └── shared/                       # Shared utilities
│       ├── package.json
│       └── src/
│           ├── utils/
│           ├── constants/
│           └── validators/
│
└── tooling/
    ├── eslint-config/
    ├── typescript-config/
    └── tailwind-config/
```

### Mobile Compatibility Strategy

**Approach: React Native Web with Tamagui**

The architecture uses `react-native-web` as the foundation, allowing components written with React Native primitives to compile to web. Tamagui provides a styling solution that generates optimal CSS for web while maintaining React Native StyleSheet semantics for mobile.

```typescript
// packages/ui/src/primitives/Button.tsx
import { styled, Stack, Text } from 'tamagui';

export const Button = styled(Stack, {
  name: 'Button',
  tag: 'button',
  role: 'button',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: '$4',
  paddingVertical: '$2',
  borderRadius: '$md',
  backgroundColor: '$accent',
  pressStyle: { opacity: 0.8 },

  variants: {
    variant: {
      primary: { backgroundColor: '$accent' },
      secondary: { backgroundColor: '$surface', borderWidth: 1 },
      ghost: { backgroundColor: 'transparent' },
    },
    size: {
      sm: { height: 32, paddingHorizontal: '$3' },
      md: { height: 40, paddingHorizontal: '$4' },
      lg: { height: 48, paddingHorizontal: '$5' },
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});
```

**Code Sharing Target: 85-90%**
- UI components: 95% shared
- Business logic: 100% shared
- Navigation: Platform-specific wrappers
- Storage: Abstracted with platform adapters

### Offline Capabilities Strategy

```
+-------------------------------------------------------------------+
|                      OFFLINE ARCHITECTURE                          |
+-------------------------------------------------------------------+
|                                                                    |
|   +------------------+          +-------------------+              |
|   |  Service Worker  |<-------->|   Cache Storage   |              |
|   |  (Workbox)       |          |   (Static Assets) |              |
|   +--------+---------+          +-------------------+              |
|            |                                                       |
|            v                                                       |
|   +------------------+          +-------------------+              |
|   |   Sync Manager   |<-------->|    IndexedDB      |              |
|   |                  |          |    (Dexie.js)     |              |
|   +--------+---------+          +-------------------+              |
|            |                           |                           |
|            v                           v                           |
|   +------------------+          +-------------------+              |
|   |  Queue Processor |          |  SCORM Runtime    |              |
|   |  (Background)    |          |  (Offline Mode)   |              |
|   +------------------+          +-------------------+              |
|                                                                    |
+-------------------------------------------------------------------+
```

**IndexedDB Schema (Dexie.js)**

```typescript
// packages/offline/src/storage/db.ts
import Dexie, { Table } from 'dexie';

interface OfflineCourse {
  id: string;
  data: object;
  downloadedAt: Date;
  lastSyncedAt: Date;
  version: number;
}

interface OfflineContent {
  id: string;
  courseId: string;
  type: 'scorm' | 'video' | 'document' | 'quiz';
  blob?: Blob;
  metadata: object;
}

interface ScormState {
  attemptId: string;
  contentId: string;
  learnerId: string;
  cmiData: object;
  suspendData: string;
  status: string;
  syncStatus: 'pending' | 'synced' | 'conflict';
  lastModified: Date;
}

interface SyncQueue {
  id?: number;
  operation: 'create' | 'update' | 'delete';
  endpoint: string;
  payload: object;
  createdAt: Date;
  retryCount: number;
}

class LMSOfflineDB extends Dexie {
  courses!: Table<OfflineCourse>;
  content!: Table<OfflineContent>;
  scormState!: Table<ScormState>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('lms-offline');
    this.version(1).stores({
      courses: 'id, downloadedAt, lastSyncedAt',
      content: 'id, courseId, type',
      scormState: 'attemptId, contentId, learnerId, syncStatus',
      syncQueue: '++id, operation, createdAt',
    });
  }
}

export const db = new LMSOfflineDB();
```

**SCORM Offline Runtime**

```typescript
// packages/offline/src/scorm/OfflineScormRuntime.ts
import { db } from '../storage/db';

export class OfflineScormRuntime {
  private attemptId: string;
  private cmiData: Record<string, string> = {};

  async initialize(contentId: string, learnerId: string): Promise<boolean> {
    const existing = await db.scormState
      .where({ contentId, learnerId })
      .first();

    if (existing) {
      this.attemptId = existing.attemptId;
      this.cmiData = existing.cmiData as Record<string, string>;
    } else {
      this.attemptId = crypto.randomUUID();
      await db.scormState.add({
        attemptId: this.attemptId,
        contentId,
        learnerId,
        cmiData: {},
        suspendData: '',
        status: 'not-attempted',
        syncStatus: 'pending',
        lastModified: new Date(),
      });
    }
    return true;
  }

  async setValue(element: string, value: string): Promise<string> {
    this.cmiData[element] = value;
    await this.persistState();
    return 'true';
  }

  private async persistState(): Promise<void> {
    await db.scormState.update(this.attemptId, {
      cmiData: this.cmiData,
      syncStatus: 'pending',
      lastModified: new Date(),
    });
  }
}
```

### State Management Approach

```
+-------------------------------------------------------------------+
|                    STATE MANAGEMENT LAYERS                         |
+-------------------------------------------------------------------+
|                                                                    |
|  +-----------------------+    +-----------------------+            |
|  |    UI State (Local)   |    |   Server State        |            |
|  |    Zustand            |    |   TanStack Query      |            |
|  |                       |    |                       |            |
|  |  - Modal open/close   |    |  - API data cache     |            |
|  |  - Form state         |    |  - Auto refetch       |            |
|  |  - Navigation state   |    |  - Optimistic updates |            |
|  +-----------+-----------+    +-----------+-----------+            |
|              |                            |                        |
|              +------------+---------------+                        |
|                           |                                        |
|              +------------v---------------+                        |
|              |    Offline State           |                        |
|              |    Zustand + IndexedDB     |                        |
|              |                            |                        |
|              |  - Downloaded courses      |                        |
|              |  - SCORM progress          |                        |
|              |  - Sync queue              |                        |
|              |  - Conflict resolution     |                        |
|              +----------------------------+                        |
|                                                                    |
+-------------------------------------------------------------------+
```

**Store Example**

```typescript
// packages/core/src/stores/offline.store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { db } from '@lms/offline';

interface OfflineState {
  isOnline: boolean;
  downloadedCourses: string[];
  syncPending: number;
  lastSyncAt: Date | null;

  setOnline: (status: boolean) => void;
  downloadCourse: (courseId: string) => Promise<void>;
  syncAll: () => Promise<void>;
}

export const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      downloadedCourses: [],
      syncPending: 0,
      lastSyncAt: null,

      setOnline: (status) => set({ isOnline: status }),

      downloadCourse: async (courseId) => {
        // Download course content to IndexedDB
        // Update downloadedCourses list
      },

      syncAll: async () => {
        const queue = await db.syncQueue.toArray();
        // Process sync queue
        set({ syncPending: 0, lastSyncAt: new Date() });
      },
    }),
    {
      name: 'lms-offline-state',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        downloadedCourses: state.downloadedCourses,
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);
```

### Team Roles & Responsibilities

| Role | Responsibilities | Package Ownership |
|------|------------------|-------------------|
| **Platform Lead** | Architecture decisions, package boundaries, build system | turbo.json, tooling/ |
| **UI Engineers (2-3)** | Cross-platform components, design system | packages/ui |
| **Core Engineers (2)** | API integration, state management, auth | packages/core |
| **Offline Engineers (2)** | IndexedDB, sync engine, service workers | packages/offline |
| **SCORM Specialist (1)** | SCORM runtime, offline SCORM, compliance | packages/scorm |
| **Web App Engineers (2-3)** | Feature development, routing, layouts | apps/web |
| **Mobile Engineers (1-2)** | React Native integration, native features | apps/mobile |
| **QA Engineers (1-2)** | Testing strategy, E2E, accessibility | test utilities |

### Development Workflow

```
Feature Development Flow
========================

1. Issue Assignment
   └── Agent/Developer picks task from backlog

2. Branch Creation
   └── feature/LMS-XXX-description

3. Package Identification
   └── Determine which packages are affected

4. Development
   ├── packages/ui (if new components needed)
   ├── packages/core (if new API/stores)
   ├── packages/offline (if offline features)
   └── apps/web (feature integration)

5. Local Testing
   ├── turbo run test --filter=@lms/web
   └── turbo run typecheck

6. PR Creation
   └── Auto-assigns reviewers based on CODEOWNERS

7. CI Pipeline
   ├── Lint + Type check
   ├── Unit tests (affected packages)
   ├── Build verification
   └── Preview deployment

8. Code Review
   └── Package owners review their domains

9. Merge & Deploy
   └── Automated staging deployment
```

**Turborepo Commands**

```bash
# Development
turbo dev                           # All apps in dev mode
turbo dev --filter=@lms/web         # Web app only

# Building
turbo build                         # Build all
turbo build --filter=@lms/web...    # Web + dependencies

# Testing
turbo test                          # All tests
turbo test --filter=@lms/core       # Core package tests

# Type checking
turbo typecheck                     # All packages
```

### Pros

1. **Maximum Code Reuse** - 85-90% code sharing between web and mobile platforms
2. **Unified Design System** - Single source of truth for UI components across platforms
3. **Atomic Deployment** - Packages version together, reducing integration issues
4. **Strong Type Safety** - Shared types across all packages ensure consistency
5. **Optimized Builds** - Turborepo caching dramatically speeds up CI/CD
6. **Offline-First Foundation** - Dedicated offline package with clear abstractions
7. **Future Mobile Ready** - React Native app can be added without architecture changes

### Cons

1. **High Initial Complexity** - Monorepo setup and tooling requires expertise
2. **Learning Curve** - Team needs to learn Tamagui/React Native Web paradigms
3. **Build Complexity** - Multiple build systems (Vite + Metro) to maintain
4. **Bundle Size Overhead** - React Native Web adds ~30-50KB to web bundle
5. **Debugging Challenges** - Cross-package debugging can be complex
6. **Package Versioning** - Internal package changes affect all consumers
7. **Native Limitations** - Some platform-specific features require escape hatches

### Best Fit For

- Teams planning to build both web and mobile applications
- Organizations prioritizing long-term code reuse over short-term velocity
- Projects with dedicated resources for infrastructure and tooling
- Scenarios where offline-first is a primary requirement

---

## 3. Architecture Option 2: Feature-Slice Design with Offline-First Core

### Overview

This architecture implements Feature-Sliced Design (FSD) methodology, organizing code by feature domains with clear layer boundaries. A dedicated offline-first core provides robust synchronization capabilities while maintaining a simpler single-repository structure optimized for web development with future mobile compatibility through shared business logic.

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                    FEATURE-SLICE DESIGN                            |
+-------------------------------------------------------------------+
|                                                                    |
|  +-------------------+  LAYERS (Horizontal)  +------------------+  |
|  |                                                              |  |
|  |  app/          Application initialization, providers, routes |  |
|  |  processes/    Complex cross-feature workflows               |  |
|  |  pages/        Page compositions, route entries              |  |
|  |  widgets/      Large compositional UI blocks                 |  |
|  |  features/     User interactions, business features          |  |
|  |  entities/     Business entities (Course, User, Content)     |  |
|  |  shared/       Reusable utilities, UI kit, API client        |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                              |                                     |
|  +---------------------------v----------------------------------+  |
|  |                    OFFLINE-FIRST CORE                        |  |
|  |                                                              |  |
|  |  +-------------+  +---------------+  +------------------+    |  |
|  |  | Sync Engine |  | Offline Store |  | SCORM Runtime    |    |  |
|  |  | (Background)|  | (IndexedDB)   |  | (Local-First)    |    |  |
|  |  +-------------+  +---------------+  +------------------+    |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                              |                                     |
|                              v                                     |
|  +--------------------------------------------------------------+  |
|  |                    LMS Node V2 API                           |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+-------------------------------------------------------------------+

SLICES (Vertical - per feature domain)
======================================

+--------+  +----------+  +---------+  +-------+  +----------+
| auth   |  | courses  |  | content |  | scorm |  | reports  |
+--------+  +----------+  +---------+  +-------+  +----------+
|ui      |  |ui        |  |ui       |  |ui     |  |ui        |
|model   |  |model     |  |model    |  |model  |  |model     |
|api     |  |api       |  |api      |  |api    |  |api       |
|lib     |  |lib       |  |lib      |  |lib    |  |lib       |
+--------+  +----------+  +---------+  +-------+  +----------+
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Build** | Vite 6 | Fast development and production builds |
| **UI Framework** | React 18.3 | Component library |
| **Styling** | CSS Modules + CSS Custom Properties | Maintainable theming |
| **State - UI** | Zustand | Local UI state |
| **State - Server** | TanStack Query v5 | Server state with offline support |
| **Offline Storage** | IndexedDB (Dexie.js) | Structured data storage |
| **Offline Sync** | TanStack Query Persister + Custom Sync | Persistence and sync |
| **Service Worker** | Workbox | Asset caching and offline |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **Routing** | TanStack Router | Type-safe routing |
| **Testing** | Vitest + MSW + Testing Library | Comprehensive testing |
| **TypeScript** | 5.4+ | Full type safety |
| **Linting** | ESLint + @feature-sliced/eslint | Architecture enforcement |

### Project Structure

```
lms-ui-v2/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── public/
│   ├── sw.js
│   └── manifest.json
├── src/
│   │
│   ├── app/                              # Application layer
│   │   ├── index.tsx                     # App entry point
│   │   ├── App.tsx                       # Root component
│   │   ├── providers/
│   │   │   ├── QueryProvider.tsx
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── OfflineProvider.tsx
│   │   │   └── ThemeProvider.tsx
│   │   ├── router/
│   │   │   ├── index.tsx
│   │   │   ├── routes.tsx
│   │   │   └── guards.tsx
│   │   └── styles/
│   │       ├── global.css
│   │       └── tokens.css
│   │
│   ├── processes/                        # Cross-feature workflows
│   │   ├── course-download/
│   │   │   ├── model/
│   │   │   │   └── downloadProcess.ts
│   │   │   └── ui/
│   │   │       └── DownloadManager.tsx
│   │   ├── scorm-sync/
│   │   │   └── model/
│   │   │       └── scormSyncProcess.ts
│   │   └── enrollment-workflow/
│   │       └── model/
│   │           └── enrollmentProcess.ts
│   │
│   ├── pages/                            # Page compositions
│   │   ├── learner/
│   │   │   ├── dashboard/
│   │   │   │   ├── index.tsx
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── courses/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── CoursesListPage.tsx
│   │   │   │   └── CourseDetailPage.tsx
│   │   │   └── offline/
│   │   │       └── OfflineCoursesPage.tsx
│   │   ├── staff/
│   │   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   └── course-builder/
│   │   ├── admin/
│   │   │   ├── dashboard/
│   │   │   ├── users/
│   │   │   ├── content/
│   │   │   └── settings/
│   │   └── auth/
│   │       ├── login/
│   │       ├── forgot-password/
│   │       └── reset-password/
│   │
│   ├── widgets/                          # Compositional UI blocks
│   │   ├── course-viewer/
│   │   │   ├── ui/
│   │   │   │   ├── CourseViewer.tsx
│   │   │   │   ├── ContentPlayer.tsx
│   │   │   │   └── ProgressTracker.tsx
│   │   │   └── model/
│   │   │       └── viewerState.ts
│   │   ├── navigation/
│   │   │   ├── ui/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MobileNav.tsx
│   │   │   └── model/
│   │   │       └── navigationState.ts
│   │   ├── scorm-player/
│   │   │   ├── ui/
│   │   │   │   └── ScormPlayer.tsx
│   │   │   └── lib/
│   │   │       └── scormBridge.ts
│   │   └── offline-indicator/
│   │       └── ui/
│   │           └── OfflineIndicator.tsx
│   │
│   ├── features/                         # User interactions
│   │   ├── auth/
│   │   │   ├── ui/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── LogoutButton.tsx
│   │   │   ├── model/
│   │   │   │   └── authStore.ts
│   │   │   ├── api/
│   │   │   │   └── authApi.ts
│   │   │   └── lib/
│   │   │       └── tokenManager.ts
│   │   ├── course-enrollment/
│   │   │   ├── ui/
│   │   │   │   └── EnrollButton.tsx
│   │   │   ├── model/
│   │   │   │   └── enrollmentStore.ts
│   │   │   └── api/
│   │   │       └── enrollmentApi.ts
│   │   ├── course-download/
│   │   │   ├── ui/
│   │   │   │   ├── DownloadButton.tsx
│   │   │   │   └── DownloadProgress.tsx
│   │   │   ├── model/
│   │   │   │   └── downloadStore.ts
│   │   │   └── api/
│   │   │       └── downloadApi.ts
│   │   ├── content-progress/
│   │   │   ├── ui/
│   │   │   │   └── ProgressBar.tsx
│   │   │   ├── model/
│   │   │   │   └── progressStore.ts
│   │   │   └── api/
│   │   │       └── progressApi.ts
│   │   ├── scorm-tracking/
│   │   │   ├── model/
│   │   │   │   └── scormTrackingStore.ts
│   │   │   └── api/
│   │   │       └── scormApi.ts
│   │   └── offline-sync/
│   │       ├── ui/
│   │       │   └── SyncButton.tsx
│   │       └── model/
│   │           └── syncStore.ts
│   │
│   ├── entities/                         # Business entities
│   │   ├── user/
│   │   │   ├── ui/
│   │   │   │   ├── UserAvatar.tsx
│   │   │   │   └── UserCard.tsx
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── userStore.ts
│   │   │   └── api/
│   │   │       └── userApi.ts
│   │   ├── course/
│   │   │   ├── ui/
│   │   │   │   ├── CourseCard.tsx
│   │   │   │   └── CourseList.tsx
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── courseStore.ts
│   │   │   └── api/
│   │   │       └── courseApi.ts
│   │   ├── content/
│   │   │   ├── ui/
│   │   │   │   └── ContentCard.tsx
│   │   │   ├── model/
│   │   │   │   └── types.ts
│   │   │   └── api/
│   │   │       └── contentApi.ts
│   │   ├── scorm-attempt/
│   │   │   ├── model/
│   │   │   │   └── types.ts
│   │   │   └── api/
│   │   │       └── scormAttemptApi.ts
│   │   └── enrollment/
│   │       ├── model/
│   │       │   └── types.ts
│   │       └── api/
│   │           └── enrollmentApi.ts
│   │
│   ├── shared/                           # Reusable infrastructure
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints.ts
│   │   │   └── queryClient.ts
│   │   ├── ui/
│   │   │   ├── Button/
│   │   │   ├── Input/
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── DataTable/
│   │   │   └── index.ts
│   │   ├── lib/
│   │   │   ├── storage/
│   │   │   │   ├── db.ts               # Dexie database
│   │   │   │   └── tables.ts
│   │   │   ├── offline/
│   │   │   │   ├── SyncEngine.ts
│   │   │   │   ├── OfflineManager.ts
│   │   │   │   └── ConflictResolver.ts
│   │   │   ├── scorm/
│   │   │   │   ├── Scorm12Runtime.ts
│   │   │   │   ├── Scorm2004Runtime.ts
│   │   │   │   └── OfflineScormAdapter.ts
│   │   │   └── utils/
│   │   │       ├── date.ts
│   │   │       ├── format.ts
│   │   │       └── validation.ts
│   │   ├── config/
│   │   │   ├── constants.ts
│   │   │   └── env.ts
│   │   └── types/
│   │       ├── api.ts
│   │       └── common.ts
│   │
│   └── main.tsx                          # Entry point
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
└── .fsd/                                 # FSD tooling config
    └── fsd.config.json
```

### Mobile Compatibility Strategy

**Approach: Shared Business Logic via Package Extraction**

Rather than using React Native Web for UI, this architecture focuses on extracting business logic into shareable modules that can be consumed by a separate React Native project.

```
Future Mobile Architecture
===========================

lms-monorepo/
├── packages/
│   ├── business-logic/          # Extracted from src/entities, features
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── scorm/
│   │   └── offline/
│   └── api-client/              # Extracted from src/shared/api
│       └── ...
├── apps/
│   ├── web/                     # Current FSD app (adapted)
│   └── mobile/                  # New React Native app
```

**Extraction Strategy**

```typescript
// Business logic designed for extraction
// entities/course/model/courseStore.ts

// Interface-based approach allows different implementations
interface CourseRepository {
  getAll(): Promise<Course[]>;
  getById(id: string): Promise<Course | null>;
  getOffline(): Promise<Course[]>;
  downloadForOffline(id: string): Promise<void>;
}

// Implementation can be swapped for mobile
export const createCourseStore = (repository: CourseRepository) => {
  return create<CourseState>((set, get) => ({
    courses: [],
    loading: false,

    fetchCourses: async () => {
      set({ loading: true });
      const courses = await repository.getAll();
      set({ courses, loading: false });
    },

    downloadCourse: async (id: string) => {
      await repository.downloadForOffline(id);
      // Update local state
    },
  }));
};
```

**Mobile Code Sharing Target: 60-70%**
- Business logic/stores: 90% shared (via extraction)
- API client: 100% shared
- UI components: 0% shared (platform-native)
- Offline logic: 80% shared (IndexedDB vs AsyncStorage adapter)

### Offline Capabilities Strategy

```
+-------------------------------------------------------------------+
|               OFFLINE-FIRST ARCHITECTURE                           |
+-------------------------------------------------------------------+
|                                                                    |
|  Online Mode                          Offline Mode                 |
|  ==========                          ============                  |
|                                                                    |
|  +----------+    API     +--------+                                |
|  | TanStack |<---------->| Server |                                |
|  | Query    |            +--------+                                |
|  +----+-----+                                                      |
|       |                                                            |
|       | persist                                                    |
|       v                                                            |
|  +----+-----+    sync    +--------+                                |
|  | IndexedDB|<---------->| Sync   |-----> Queue changes            |
|  | (Dexie)  |            | Engine |       for later sync           |
|  +----+-----+            +--------+                                |
|       |                                                            |
|       | hydrate                                                    |
|       v                                                            |
|  +----+-----+                                                      |
|  | Offline  |  <-- Works completely offline with local data        |
|  | Store    |                                                      |
|  +----------+                                                      |
|                                                                    |
+-------------------------------------------------------------------+
```

**TanStack Query with Offline Support**

```typescript
// shared/api/queryClient.ts
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { db } from '../lib/storage/db';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      networkMode: 'offlineFirst',
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 3,
    },
  },
});

// Custom persister using IndexedDB
const persister = {
  persistClient: async (client: PersistedClient) => {
    await db.queryCache.put({ id: 'main', data: client });
  },
  restoreClient: async () => {
    const cached = await db.queryCache.get('main');
    return cached?.data;
  },
  removeClient: async () => {
    await db.queryCache.delete('main');
  },
};

persistQueryClient({ queryClient, persister });

export { queryClient };
```

**Offline-First Course Hook**

```typescript
// features/course-download/model/useCourseOffline.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { db } from '@/shared/lib/storage/db';
import { courseApi } from '@/entities/course/api';

export function useCourseOffline(courseId: string) {
  // Check if course is available offline
  const offlineStatus = useQuery({
    queryKey: ['course', courseId, 'offline'],
    queryFn: async () => {
      const offlineCourse = await db.courses.get(courseId);
      return {
        isDownloaded: !!offlineCourse,
        downloadedAt: offlineCourse?.downloadedAt,
        size: offlineCourse?.size,
      };
    },
  });

  // Download course for offline use
  const downloadMutation = useMutation({
    mutationFn: async () => {
      // 1. Fetch course metadata
      const course = await courseApi.getById(courseId);

      // 2. Download all content
      const contents = await courseApi.getContents(courseId);
      for (const content of contents) {
        if (content.type === 'scorm') {
          await downloadScormPackage(content.id);
        } else if (content.type === 'video') {
          await downloadVideo(content.fileUrl);
        }
        // ... other content types
      }

      // 3. Store in IndexedDB
      await db.courses.put({
        id: courseId,
        data: course,
        contents: contents.map(c => c.id),
        downloadedAt: new Date(),
        size: calculateSize(contents),
      });
    },
    onSuccess: () => {
      offlineStatus.refetch();
    },
  });

  return {
    isDownloaded: offlineStatus.data?.isDownloaded ?? false,
    downloadedAt: offlineStatus.data?.downloadedAt,
    download: downloadMutation.mutate,
    isDownloading: downloadMutation.isPending,
    downloadProgress: downloadMutation.variables?.progress,
  };
}
```

**SCORM Offline Handler**

```typescript
// shared/lib/scorm/OfflineScormAdapter.ts
import { db } from '../storage/db';

export class OfflineScormAdapter {
  private attemptId: string;
  private contentId: string;
  private isOnline: boolean;
  private syncQueue: Array<{ element: string; value: string }> = [];

  constructor(contentId: string) {
    this.contentId = contentId;
    this.isOnline = navigator.onLine;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.flushSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  async setValue(element: string, value: string): Promise<void> {
    // Always save locally first (offline-first)
    await db.scormState.update(this.attemptId, {
      [`cmiData.${element}`]: value,
      lastModified: new Date(),
      syncStatus: 'pending',
    });

    if (this.isOnline) {
      // Try to sync immediately
      try {
        await this.syncToServer(element, value);
        await db.scormState.update(this.attemptId, { syncStatus: 'synced' });
      } catch (error) {
        this.syncQueue.push({ element, value });
      }
    } else {
      this.syncQueue.push({ element, value });
    }
  }

  private async flushSyncQueue(): Promise<void> {
    while (this.syncQueue.length > 0) {
      const item = this.syncQueue.shift()!;
      try {
        await this.syncToServer(item.element, item.value);
      } catch {
        this.syncQueue.unshift(item);
        break;
      }
    }
  }

  private async syncToServer(element: string, value: string): Promise<void> {
    // API call to sync SCORM data
  }
}
```

### State Management Approach

```typescript
// Layer-based state management

// 1. Server State (TanStack Query) - entities/*/api
// Handles: API data, caching, synchronization
const { data: courses } = useQuery({
  queryKey: ['courses'],
  queryFn: courseApi.getAll,
});

// 2. Feature State (Zustand) - features/*/model
// Handles: Feature-specific interactions, workflows
const useDownloadStore = create<DownloadState>((set) => ({
  activeDownloads: {},
  startDownload: (courseId) => { /* ... */ },
  cancelDownload: (courseId) => { /* ... */ },
}));

// 3. UI State (React useState/useReducer or Zustand)
// Handles: Modals, forms, temporary UI state
const [isModalOpen, setModalOpen] = useState(false);

// 4. Offline State (Zustand + IndexedDB)
// Handles: Offline availability, sync status
const useOfflineStore = create<OfflineState>()(
  persist(
    (set, get) => ({
      downloadedCourses: [],
      pendingSyncs: 0,
      lastSyncAt: null,
      // ...
    }),
    { name: 'offline-state' }
  )
);
```

### Team Roles & Responsibilities

| Role | Responsibilities | FSD Layers Owned |
|------|------------------|------------------|
| **Tech Lead** | Architecture decisions, layer boundaries, code review | app/, cross-cutting |
| **Feature Engineers (4-5)** | Feature development, feature-entity integration | features/, pages/ |
| **Entity Engineers (2)** | Business entity models, API integration | entities/ |
| **Platform Engineers (2)** | Shared infrastructure, offline capabilities | shared/, processes/ |
| **UI Engineers (2)** | Design system, widget development | shared/ui/, widgets/ |
| **SCORM Specialist (1)** | SCORM runtime, offline SCORM support | shared/lib/scorm/, features/scorm-* |
| **QA Engineers (1-2)** | Testing strategy, E2E automation | tests/ |

### Development Workflow

```
FSD Development Guidelines
==========================

1. Import Rules (Enforced by ESLint)
   - Layers can only import from layers below
   - app/ -> processes/ -> pages/ -> widgets/ -> features/ -> entities/ -> shared/
   - No imports from sibling slices within same layer

2. Slice Structure
   Each slice contains:
   - ui/      (React components)
   - model/   (Stores, types, business logic)
   - api/     (API integration)
   - lib/     (Utilities specific to slice)

3. Feature Development Flow

   a. Identify affected layers
   b. Start from entities (if new data model)
   c. Build features (user interactions)
   d. Compose in widgets (if reusable)
   e. Integrate in pages
   f. Add to router

4. Naming Conventions
   - Slices: kebab-case (course-enrollment)
   - Components: PascalCase (CourseCard.tsx)
   - Stores: camelCase with Store suffix (courseStore.ts)
   - API: camelCase with Api suffix (courseApi.ts)
```

**ESLint FSD Rules**

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['@feature-sliced/eslint-plugin-fsd'],
  rules: {
    '@feature-sliced/fsd/layers-slices': 'error',
    '@feature-sliced/fsd/public-api': 'error',
    '@feature-sliced/fsd/absolute-relative': 'error',
  },
};
```

### Pros

1. **Clear Architecture Boundaries** - FSD enforces strict layer dependencies, preventing spaghetti code
2. **Feature Isolation** - Features are self-contained, enabling parallel development
3. **Simpler Build Setup** - Single Vite configuration, no monorepo complexity
4. **Gradual Mobile Migration** - Business logic can be extracted incrementally
5. **Proven Methodology** - FSD is battle-tested in large-scale applications
6. **Smaller Bundle** - No React Native Web overhead
7. **Easier Onboarding** - Standard React patterns, just organized differently

### Cons

1. **Less Mobile Code Reuse** - UI components need to be rewritten for React Native
2. **Extraction Overhead** - Moving to mobile requires architectural refactoring
3. **Learning FSD** - Team needs to learn FSD methodology
4. **Boilerplate** - Slice structure can feel verbose for small features
5. **Tooling Limitations** - FSD tooling is less mature than monorepo tools
6. **Cross-Slice Communication** - Complex workflows require processes layer
7. **No Shared Design System** - Different UI implementations for web and mobile

### Best Fit For

- Teams focused primarily on web application delivery
- Projects where mobile development is 6+ months away
- Organizations with limited DevOps/tooling expertise
- Scenarios where clear code organization is the priority

---

## 4. Architecture Option 3: Micro-Frontend Architecture with Module Federation

### Overview

This architecture divides the LMS into independently deployable micro-frontends, each owned by a dedicated team. Using Vite's Module Federation plugin, these modules can be developed, tested, and deployed separately while sharing common dependencies and runtime. This maximizes team autonomy and enables independent release cycles.

### Architecture Diagram

```
+-------------------------------------------------------------------+
|                    MICRO-FRONTEND ARCHITECTURE                     |
+-------------------------------------------------------------------+
|                                                                    |
|  +---------------------+  HOST APPLICATION  +-------------------+  |
|  |                           (Shell)                            |  |
|  |   +----------+  +-------------+  +------------------+        |  |
|  |   | Router   |  | Auth State  |  | Offline Manager  |        |  |
|  |   +----------+  +-------------+  +------------------+        |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|              |                |                |                    |
|              v                v                v                    |
|  +--------------------------------------------------------------+  |
|  |                    REMOTE MODULES                            |  |
|  |                                                              |  |
|  |  +----------------+  +----------------+  +----------------+  |  |
|  |  |    learner     |  |     staff      |  |     admin      |  |  |
|  |  |    module      |  |    module      |  |    module      |  |  |
|  |  |                |  |                |  |                |  |  |
|  |  | - Dashboard    |  | - Dashboard    |  | - Dashboard    |  |  |
|  |  | - Courses      |  | - Analytics    |  | - Users        |  |  |
|  |  | - SCORM Player |  | - Course Build |  | - Content      |  |  |
|  |  | - Progress     |  | - Grading      |  | - Settings     |  |  |
|  |  +----------------+  +----------------+  +----------------+  |  |
|  |                                                              |  |
|  |  +----------------+  +----------------+  +----------------+  |  |
|  |  |     scorm      |  |    content     |  |   reporting    |  |  |
|  |  |    module      |  |    module      |  |    module      |  |  |
|  |  |                |  |                |  |                |  |  |
|  |  | - SCORM 1.2    |  | - Video Player |  | - Analytics    |  |  |
|  |  | - SCORM 2004   |  | - Doc Viewer   |  | - Exports      |  |  |
|  |  | - Offline RT   |  | - Quiz Engine  |  | - Dashboards   |  |  |
|  |  +----------------+  +----------------+  +----------------+  |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                              |                                     |
|  +---------------------------v----------------------------------+  |
|  |                    SHARED PACKAGES                           |  |
|  |                                                              |  |
|  |  +----------+  +----------+  +----------+  +----------+      |  |
|  |  |    ui    |  |   core   |  | offline  |  |  types   |      |  |
|  |  | library  |  |  utils   |  | storage  |  |          |      |  |
|  |  +----------+  +----------+  +----------+  +----------+      |  |
|  |                                                              |  |
|  +--------------------------------------------------------------+  |
|                                                                    |
+-------------------------------------------------------------------+

Deployment Topology
==================

+----------+     +-----------+     +------------+
| Shell    |<--->| CDN/Edge  |<--->|  API GW    |
| (host)   |     |           |     |            |
+----------+     +-----------+     +-----+------+
                      ^                  |
     +----------------+------------------+
     |                |                  |
+----v----+     +-----v-----+     +------v------+
| learner |     |   staff   |     |    admin    |
| module  |     |  module   |     |   module    |
+---------+     +-----------+     +-------------+
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Module Federation** | @originjs/vite-plugin-federation | Micro-frontend composition |
| **Build** | Vite 6 | Fast development builds |
| **UI Framework** | React 18.3 | Component library |
| **Shared UI** | Radix UI + Tailwind CSS | Design system |
| **State - Global** | Zustand (shared) | Cross-module state |
| **State - Module** | TanStack Query | Module-specific data |
| **Routing** | React Router 7 | Nested micro-frontend routing |
| **Offline** | IndexedDB + Service Workers | Module-aware caching |
| **Communication** | Custom Events + Shared Store | Inter-module messaging |
| **Testing** | Vitest + Playwright | Unit and E2E |
| **TypeScript** | 5.4+ | Shared type definitions |
| **Deployment** | Vercel/CloudFlare (per module) | Independent deployment |

### Project Structure

```
lms-ui-v2/
├── package.json                      # Workspace root
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.base.json
│
├── apps/
│   │
│   ├── shell/                        # Host application
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── public/
│   │   │   ├── sw.js
│   │   │   └── manifest.json
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── App.tsx
│   │       ├── bootstrap.tsx         # Federation bootstrap
│   │       ├── router/
│   │       │   ├── index.tsx
│   │       │   ├── moduleRoutes.tsx
│   │       │   └── LazyModule.tsx
│   │       ├── providers/
│   │       │   ├── AuthProvider.tsx
│   │       │   ├── OfflineProvider.tsx
│   │       │   └── ModuleContext.tsx
│   │       ├── layouts/
│   │       │   ├── AppLayout.tsx
│   │       │   └── ModuleLayout.tsx
│   │       └── components/
│   │           ├── ModuleLoader.tsx
│   │           ├── ErrorBoundary.tsx
│   │           └── OfflineIndicator.tsx
│   │
│   ├── learner/                      # Learner micro-frontend
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── main.tsx              # Standalone entry
│   │       ├── bootstrap.tsx         # Federation export
│   │       ├── Module.tsx            # Root component
│   │       ├── routes/
│   │       │   ├── index.tsx
│   │       │   ├── Dashboard.tsx
│   │       │   ├── MyCourses.tsx
│   │       │   ├── CourseView.tsx
│   │       │   └── OfflineCourses.tsx
│   │       ├── components/
│   │       │   ├── CourseCard.tsx
│   │       │   ├── ProgressWidget.tsx
│   │       │   └── DownloadManager.tsx
│   │       ├── hooks/
│   │       │   ├── useCourses.ts
│   │       │   └── useProgress.ts
│   │       └── api/
│   │           └── learnerApi.ts
│   │
│   ├── staff/                        # Staff micro-frontend
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── Module.tsx
│   │       ├── routes/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Analytics.tsx
│   │       │   ├── CourseBuilder.tsx
│   │       │   └── Grading.tsx
│   │       ├── components/
│   │       └── api/
│   │
│   ├── admin/                        # Admin micro-frontend
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── Module.tsx
│   │       ├── routes/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Users.tsx
│   │       │   ├── Content.tsx
│   │       │   ├── Settings.tsx
│   │       │   └── Permissions.tsx
│   │       ├── components/
│   │       └── api/
│   │
│   ├── scorm/                        # SCORM player micro-frontend
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   └── src/
│   │       ├── Module.tsx
│   │       ├── runtime/
│   │       │   ├── Scorm12API.ts
│   │       │   ├── Scorm2004API.ts
│   │       │   └── OfflineRuntime.ts
│   │       ├── components/
│   │       │   ├── ScormPlayer.tsx
│   │       │   └── ScormFrame.tsx
│   │       └── hooks/
│   │           └── useScormAttempt.ts
│   │
│   └── content/                      # Content player micro-frontend
│       ├── package.json
│       ├── vite.config.ts
│       └── src/
│           ├── Module.tsx
│           ├── players/
│           │   ├── VideoPlayer.tsx
│           │   ├── DocumentViewer.tsx
│           │   └── QuizEngine.tsx
│           └── components/
│
├── packages/
│   │
│   ├── ui/                           # Shared UI library
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── components/
│   │       │   ├── Button.tsx
│   │       │   ├── Card.tsx
│   │       │   ├── Modal.tsx
│   │       │   ├── DataTable.tsx
│   │       │   └── FormField.tsx
│   │       └── styles/
│   │           ├── tokens.css
│   │           └── tailwind.config.js
│   │
│   ├── core/                         # Shared core utilities
│   │   ├── package.json
│   │   └── src/
│   │       ├── api/
│   │       │   ├── client.ts
│   │       │   └── endpoints.ts
│   │       ├── auth/
│   │       │   ├── authStore.ts
│   │       │   └── tokenManager.ts
│   │       ├── events/
│   │       │   ├── eventBus.ts
│   │       │   └── moduleEvents.ts
│   │       └── utils/
│   │
│   ├── offline/                      # Shared offline utilities
│   │   ├── package.json
│   │   └── src/
│   │       ├── storage/
│   │       │   └── db.ts
│   │       ├── sync/
│   │       │   ├── SyncManager.ts
│   │       │   └── ModuleSync.ts
│   │       └── sw/
│   │           └── strategies.ts
│   │
│   └── types/                        # Shared TypeScript types
│       ├── package.json
│       └── src/
│           ├── api.types.ts
│           ├── module.types.ts
│           ├── course.types.ts
│           └── scorm.types.ts
│
└── tooling/
    ├── eslint-config/
    └── federation-config/
        └── sharedDeps.ts
```

### Mobile Compatibility Strategy

**Approach: API-First with Separate Native App**

The micro-frontend architecture naturally separates concerns, making it easier to build a completely native mobile app that consumes the same API. The shared `types` and `core` packages can be published to npm and used by the React Native project.

```
Mobile Strategy
===============

Phase 1: Web Micro-frontends
- Build and stabilize all web modules
- Establish API contracts

Phase 2: Shared Package Publishing
- Publish @lms/types to npm
- Publish @lms/core (API client) to npm
- Publish @lms/offline (adapted) to npm

Phase 3: Native Mobile App
- Create separate React Native project
- Consume shared packages
- Build native UI from scratch
- Reuse offline sync logic
```

**Shared API Client**

```typescript
// packages/core/src/api/client.ts
// Works in both web and React Native environments

export const createApiClient = (config: ApiConfig) => {
  return {
    auth: {
      login: (credentials: LoginCredentials) =>
        fetch(`${config.baseUrl}/auth/login`, {
          method: 'POST',
          body: JSON.stringify(credentials),
        }),
      // ...
    },
    courses: {
      getAll: () => fetch(`${config.baseUrl}/courses`),
      getById: (id: string) => fetch(`${config.baseUrl}/courses/${id}`),
      // ...
    },
    // Each module's API methods
  };
};
```

**Mobile Code Sharing Target: 40-50%**
- Type definitions: 100% shared
- API client: 100% shared
- Business logic: 70% shared (via packages)
- Offline logic: 60% shared (storage adapters differ)
- UI components: 0% shared

### Offline Capabilities Strategy

```
+-------------------------------------------------------------------+
|              MODULE-AWARE OFFLINE ARCHITECTURE                     |
+-------------------------------------------------------------------+
|                                                                    |
|  Shell (Host)                                                      |
|  +-----------------------------------------------------------+    |
|  |   Global Service Worker                                    |    |
|  |   - Routes requests to module workers                      |    |
|  |   - Manages shared cache                                   |    |
|  |   - Coordinates sync                                       |    |
|  +----------------------------+------------------------------+    |
|                               |                                    |
|         +---------------------+---------------------+              |
|         |                     |                     |              |
|         v                     v                     v              |
|  +-------------+       +-------------+       +-------------+       |
|  | Learner     |       | SCORM       |       | Content     |       |
|  | Module      |       | Module      |       | Module      |       |
|  | Storage     |       | Storage     |       | Storage     |       |
|  +-------------+       +-------------+       +-------------+       |
|  | - My courses|       | - Packages  |       | - Videos    |       |
|  | - Progress  |       | - CMI data  |       | - Documents |       |
|  | - Downloads |       | - Attempts  |       | - Quiz data |       |
|  +-------------+       +-------------+       +-------------+       |
|                                                                    |
|  Sync Coordination                                                 |
|  +-----------------------------------------------------------+    |
|  | Module Sync Registry                                       |    |
|  | - Each module registers sync handlers                      |    |
|  | - Shell coordinates sync order                             |    |
|  | - Conflict resolution per module                           |    |
|  +-----------------------------------------------------------+    |
|                                                                    |
+-------------------------------------------------------------------+
```

**Module Federation Vite Config**

```typescript
// apps/shell/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'shell',
      remotes: {
        learner: 'http://localhost:3001/assets/remoteEntry.js',
        staff: 'http://localhost:3002/assets/remoteEntry.js',
        admin: 'http://localhost:3003/assets/remoteEntry.js',
        scorm: 'http://localhost:3004/assets/remoteEntry.js',
        content: 'http://localhost:3005/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'zustand', '@tanstack/react-query'],
    }),
  ],
});

// apps/learner/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'learner',
      filename: 'remoteEntry.js',
      exposes: {
        './Module': './src/Module.tsx',
        './routes': './src/routes/index.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom', 'zustand', '@tanstack/react-query'],
    }),
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
});
```

**Inter-Module Communication**

```typescript
// packages/core/src/events/eventBus.ts
type EventCallback = (payload: any) => void;

class ModuleEventBus {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  subscribe(event: string, callback: EventCallback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: string, payload: any): void {
    this.listeners.get(event)?.forEach(callback => callback(payload));
  }
}

// Singleton shared across modules
export const eventBus = new ModuleEventBus();

// Event types
export const ModuleEvents = {
  COURSE_DOWNLOADED: 'course:downloaded',
  SCORM_COMPLETED: 'scorm:completed',
  SYNC_REQUIRED: 'sync:required',
  AUTH_EXPIRED: 'auth:expired',
} as const;
```

**Module-Aware Offline Storage**

```typescript
// packages/offline/src/storage/db.ts
import Dexie from 'dexie';

// Each module has its own tables with prefixed names
export const createModuleStorage = (moduleName: string) => {
  const db = new Dexie(`lms-${moduleName}`);

  // Common schema for all modules
  db.version(1).stores({
    cache: 'key, expires',
    syncQueue: '++id, operation, createdAt',
  });

  return db;
};

// Module-specific extensions
// apps/learner/src/storage/learnerDb.ts
export const learnerDb = createModuleStorage('learner');
learnerDb.version(2).stores({
  courses: 'id, downloadedAt',
  progress: 'courseId, contentId',
});

// apps/scorm/src/storage/scormDb.ts
export const scormDb = createModuleStorage('scorm');
scormDb.version(2).stores({
  packages: 'id, downloadedAt',
  attempts: 'attemptId, contentId, learnerId, syncStatus',
  cmiData: 'attemptId',
});
```

### State Management Approach

```
+-------------------------------------------------------------------+
|                    MICRO-FRONTEND STATE                            |
+-------------------------------------------------------------------+
|                                                                    |
|  SHELL (HOST) - Global State                                       |
|  +-----------------------------------------------------------+    |
|  |   Auth Store (Zustand - shared)                            |    |
|  |   - User session                                           |    |
|  |   - Permissions                                            |    |
|  |   - Token management                                       |    |
|  +-----------------------------------------------------------+    |
|  |   Offline Store (Zustand - shared)                         |    |
|  |   - Online/offline status                                  |    |
|  |   - Global sync state                                      |    |
|  +-----------------------------------------------------------+    |
|  |   Module Registry (Context)                                |    |
|  |   - Loaded modules                                         |    |
|  |   - Module health                                          |    |
|  +-----------------------------------------------------------+    |
|                                                                    |
|  MODULES - Local State                                             |
|  +-------------------+  +-------------------+  +-----------------+ |
|  | Learner Module    |  | Staff Module      |  | SCORM Module    | |
|  |                   |  |                   |  |                 | |
|  | TanStack Query:   |  | TanStack Query:   |  | Zustand:        | |
|  | - My courses      |  | - Analytics data  |  | - SCORM state   | |
|  | - Progress        |  | - Students        |  | - CMI data      | |
|  |                   |  |                   |  |                 | |
|  | Zustand:          |  | Zustand:          |  | TanStack Query: | |
|  | - Download queue  |  | - Builder state   |  | - Attempts      | |
|  | - UI preferences  |  | - Draft content   |  | - Sync status   | |
|  +-------------------+  +-------------------+  +-----------------+ |
|                                                                    |
+-------------------------------------------------------------------+
```

**Shared Auth Store**

```typescript
// packages/core/src/auth/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  roles: string[];

  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<string | null>;
}

// This store is shared across all modules via federation
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      roles: [],

      login: async (credentials) => {
        const response = await authApi.login(credentials);
        set({
          user: response.user,
          accessToken: response.accessToken,
          isAuthenticated: true,
          roles: response.roles,
        });
      },

      logout: () => {
        set({ user: null, accessToken: null, isAuthenticated: false, roles: [] });
        eventBus.emit(ModuleEvents.AUTH_EXPIRED, {});
      },

      refreshToken: async () => {
        // ...
      },
    }),
    { name: 'lms-auth' }
  )
);
```

### Team Roles & Responsibilities

| Role | Responsibilities | Module/Package Ownership |
|------|------------------|--------------------------|
| **Platform Team (3)** | Shell, federation config, shared infra | apps/shell, packages/core, tooling |
| **Learner Team (3)** | Learner experience, course consumption | apps/learner |
| **Staff Team (3)** | Instructor tools, analytics, grading | apps/staff |
| **Admin Team (2)** | Platform administration, user management | apps/admin |
| **SCORM Team (2)** | SCORM runtime, compliance, offline SCORM | apps/scorm |
| **Content Team (2)** | Media players, document viewers | apps/content |
| **UI/Design System Team (2)** | Shared component library | packages/ui |
| **Offline/Sync Team (2)** | Offline capabilities, sync engine | packages/offline |

### Development Workflow

```
Micro-Frontend Development Flow
================================

Independent Module Development:
1. Clone monorepo
2. Navigate to assigned module (e.g., apps/learner)
3. Run `pnpm dev` - starts module in isolation
4. Develop features using shared packages
5. Test in isolation with MSW mocks
6. PR to module branch

Integration Testing:
1. Shell team maintains integration environment
2. Weekly integration builds
3. E2E tests run against composed application
4. Contract tests validate module interfaces

Deployment:
1. Each module has independent CI/CD pipeline
2. Module deploys to its own CDN path
3. Shell detects new module versions via manifest
4. Gradual rollout with feature flags
```

**Module Contract Example**

```typescript
// Each module must implement this contract
// packages/types/src/module.types.ts

export interface LMSModule {
  name: string;
  version: string;

  // Routes exposed by module
  routes: RouteConfig[];

  // Navigation items for shell sidebar
  navigation?: NavigationItem[];

  // Initialization hook
  onMount?: () => Promise<void>;

  // Cleanup hook
  onUnmount?: () => void;

  // Offline sync registration
  syncHandlers?: SyncHandler[];
}

// apps/learner/src/Module.tsx
export const LearnerModule: LMSModule = {
  name: 'learner',
  version: '1.0.0',

  routes: [
    { path: '/dashboard', element: <Dashboard /> },
    { path: '/courses', element: <MyCourses /> },
    { path: '/courses/:id', element: <CourseView /> },
    { path: '/offline', element: <OfflineCourses /> },
  ],

  navigation: [
    { label: 'Dashboard', path: '/learner/dashboard', icon: 'home' },
    { label: 'My Courses', path: '/learner/courses', icon: 'book' },
    { label: 'Offline', path: '/learner/offline', icon: 'cloud-off' },
  ],

  syncHandlers: [
    {
      name: 'progress',
      sync: async () => { /* sync progress */ },
      priority: 1,
    },
  ],
};
```

### Pros

1. **Maximum Team Autonomy** - Teams can develop, test, and deploy independently
2. **Technology Freedom** - Modules can use different tools/frameworks if needed
3. **Scalable Teams** - Easy to add teams without coordination overhead
4. **Independent Deployment** - Ship features without full application release
5. **Fault Isolation** - Module failures don't crash entire application
6. **Clear Ownership** - Each module has dedicated team accountability
7. **Incremental Migration** - Can migrate modules to new tech individually

### Cons

1. **Complexity Overhead** - Federation setup and maintenance is complex
2. **Runtime Coordination** - Shared dependencies must be carefully managed
3. **Larger Initial Bundle** - Multiple module entries increase initial load
4. **Testing Challenges** - Integration testing across modules is difficult
5. **Lowest Mobile Code Reuse** - Architecture is web-centric
6. **Version Coordination** - Shared package updates affect all modules
7. **Development Environment** - Running all modules locally is resource-intensive

### Best Fit For

- Large organizations with multiple dedicated teams
- Projects with distinct feature domains and ownership
- Scenarios requiring independent deployment cycles
- Platforms expected to have many features developed in parallel

---

## 5. Comparison Matrix

| Criteria | Option 1: Monorepo + RN Web | Option 2: Feature-Slice | Option 3: Micro-Frontend |
|----------|----------------------------|-------------------------|--------------------------|
| **Maintainability** | 8/10 | 9/10 | 7/10 |
| **Mobile Readiness** | 10/10 | 6/10 | 4/10 |
| **Offline Capability** | 9/10 | 9/10 | 8/10 |
| **Development Complexity** | High | Medium | High |
| **Initial Setup Time** | 3-4 weeks | 1-2 weeks | 3-4 weeks |
| **Team Size (Minimum)** | 8-10 | 6-8 | 12-15 |
| **Team Size (Optimal)** | 12-15 | 8-12 | 15-20 |
| **Scalability** | 8/10 | 7/10 | 10/10 |
| **Code Reusability** | 9/10 | 7/10 | 5/10 |
| **Learning Curve** | Hard | Medium | Hard |
| **Build Performance** | Good (Turborepo cache) | Excellent | Good (per module) |
| **Bundle Size** | Medium (+RN Web overhead) | Small | Medium (per module) |
| **Testing Isolation** | Good | Excellent | Challenging |
| **CI/CD Complexity** | Medium | Low | High |
| **Debugging** | Challenging | Easy | Very Challenging |
| **Type Safety** | Excellent | Excellent | Good |
| **Offline SCORM** | Excellent | Excellent | Good |
| **V1 Migration Ease** | Medium | High | Low |

### Scoring Summary

| Architecture | Total Score (out of 100) | Best For |
|--------------|--------------------------|----------|
| **Option 1: Monorepo + RN Web** | 78 | Mobile-first, code reuse priority |
| **Option 2: Feature-Slice** | 82 | Web-first, maintainability priority |
| **Option 3: Micro-Frontend** | 68 | Large teams, independent deployment |

---

## 6. Recommended Architecture

### Recommendation: Option 2 - Feature-Slice Design with Offline-First Core

### Justification

Based on the project requirements and constraints, **Feature-Slice Design (FSD) with an Offline-First Core** is the recommended architecture for the following reasons:

#### 1. Alignment with V1 Migration Path

The current V1 architecture already uses a feature-based organization pattern. FSD provides a more structured evolution of this approach with clear layer boundaries. This reduces migration risk and allows incremental adoption.

```
V1 Current Structure          V2 FSD Structure
==================           ================
src/features/admin/    -->   src/pages/admin/
                             src/features/admin-*/
                             src/entities/user/

src/features/learner/  -->   src/pages/learner/
                             src/features/course-*/
                             src/entities/course/

src/api/               -->   src/shared/api/
                             src/entities/*/api/
```

#### 2. Offline-First Without Over-Engineering

The FSD architecture naturally separates concerns in a way that makes offline capabilities straightforward to implement:

- **Shared layer** contains IndexedDB storage and sync engine
- **Entities** define what data can be stored offline
- **Features** implement download/sync UI
- **Processes** handle complex offline workflows

This is simpler than managing offline across micro-frontends or coordinating between monorepo packages.

#### 3. Mobile Strategy Flexibility

While Option 1 offers maximum mobile code reuse, FSD provides a pragmatic middle ground:

- Business logic in `entities/` and `features/*/model` can be extracted later
- API client in `shared/api/` is already platform-agnostic
- If mobile becomes urgent, the business logic package extraction is straightforward

This avoids the upfront complexity of React Native Web while keeping the door open.

#### 4. Team Development Support

FSD's strict layer rules are enforceable via ESLint, making it ideal for agentic development:

- Clear import rules prevent circular dependencies
- Slice isolation enables parallel work on features
- Public API patterns (`index.ts` exports) create clear contracts
- Layer ownership maps naturally to team responsibilities

#### 5. Maintainability Priority

FSD's explicit architecture rules result in:

- **Predictable file locations** - Developers always know where to find code
- **Enforced boundaries** - Can't accidentally couple features
- **Self-documenting structure** - Architecture is visible in folder structure
- **Refactoring safety** - Changes in one slice don't ripple unexpectedly

#### 6. Build Simplicity

A single Vite configuration with no federation or monorepo tooling means:

- Faster developer onboarding
- Simpler CI/CD pipelines
- Fewer points of failure
- Easier debugging

### Risk Mitigation

| Risk | Mitigation Strategy |
|------|---------------------|
| Mobile code reuse limited | Design business logic for extraction from day 1; use interfaces |
| FSD learning curve | Comprehensive documentation, pair programming, ESLint enforcement |
| Offline complexity | Dedicated offline package with clear API; incremental rollout |
| Large application size | Aggressive code splitting; route-based lazy loading |
| SCORM offline challenges | Dedicated SCORM offline runtime in shared layer |

### Hybrid Elements from Other Options

The recommended architecture incorporates valuable elements from the other options:

**From Option 1 (Monorepo):**
- Shared `packages/` concept for truly reusable utilities
- Can evolve to Turborepo later if mobile app is prioritized

**From Option 3 (Micro-Frontend):**
- Role-based code splitting (learner/staff/admin routes lazy-loaded)
- Clear team ownership boundaries via FSD slices

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Project Setup**
- [ ] Initialize Vite project with TypeScript 5.4
- [ ] Configure ESLint with `@feature-sliced/eslint-plugin-fsd`
- [ ] Set up CSS Modules with design tokens (migrate from V1)
- [ ] Configure Vitest for testing
- [ ] Set up CI pipeline (lint, type-check, test)

**Week 3-4: Core Infrastructure**
- [ ] Implement `shared/api/client.ts` with token refresh (port from V1)
- [ ] Set up TanStack Query with offline-first configuration
- [ ] Implement `shared/lib/storage/db.ts` (Dexie schema)
- [ ] Create basic `app/` layer with providers
- [ ] Port `authStore` to FSD structure

```typescript
// Milestone: Basic app shell with auth working
src/
├── app/
│   ├── index.tsx
│   ├── providers/
│   │   └── QueryProvider.tsx
│   └── router/
├── features/
│   └── auth/
│       ├── api/
│       ├── model/
│       └── ui/
├── shared/
│   ├── api/
│   └── lib/
└── entities/
    └── user/
```

### Phase 2: Core Features (Weeks 5-10)

**Week 5-6: Entity Layer**
- [ ] Define all entity types based on LMS Node V2 models
- [ ] Implement entity API modules (courses, content, enrollments)
- [ ] Create entity UI components (cards, lists)

**Week 7-8: Learner Features**
- [ ] Implement learner dashboard page
- [ ] Course listing and detail views
- [ ] Basic content viewer (non-SCORM)
- [ ] Progress tracking feature

**Week 9-10: Staff & Admin Features**
- [ ] Staff dashboard with analytics
- [ ] Admin user management
- [ ] Basic content management
- [ ] Role-based routing

```typescript
// Milestone: Basic LMS functionality for all roles
src/
├── pages/
│   ├── learner/
│   ├── staff/
│   └── admin/
├── features/
│   ├── auth/
│   ├── course-enrollment/
│   ├── content-progress/
│   └── user-management/
└── entities/
    ├── user/
    ├── course/
    ├── content/
    └── enrollment/
```

### Phase 3: Offline Capabilities (Weeks 11-16)

**Week 11-12: Offline Infrastructure**
- [ ] Implement Service Worker with Workbox
- [ ] Create `shared/lib/offline/SyncEngine.ts`
- [ ] Set up IndexedDB tables for offline data
- [ ] Implement TanStack Query persister

**Week 13-14: SCORM Offline**
- [ ] Port SCORM 1.2/2004 runtime from V1
- [ ] Implement `shared/lib/scorm/OfflineScormAdapter.ts`
- [ ] Create SCORM state persistence in IndexedDB
- [ ] Build offline-aware SCORM player widget

**Week 15-16: Course Download**
- [ ] Implement course download feature
- [ ] Content caching (video, documents, SCORM packages)
- [ ] Offline course access pages
- [ ] Sync conflict resolution UI

```typescript
// Milestone: Full offline course access
src/
├── processes/
│   ├── course-download/
│   └── scorm-sync/
├── features/
│   ├── course-download/
│   ├── offline-sync/
│   └── scorm-tracking/
├── widgets/
│   ├── scorm-player/
│   └── offline-indicator/
└── shared/
    └── lib/
        ├── offline/
        ├── scorm/
        └── storage/
```

### Phase 4: Mobile Preparation (Weeks 17-20)

**Week 17-18: Business Logic Extraction**
- [ ] Audit all `model/` directories for mobile compatibility
- [ ] Create interface-based abstractions for storage
- [ ] Extract platform-agnostic utilities
- [ ] Document extraction patterns

**Week 19-20: Package Structure**
- [ ] Set up monorepo structure (optional Turborepo)
- [ ] Extract `@lms/core` package
- [ ] Extract `@lms/types` package
- [ ] Create `@lms/offline` package
- [ ] Publish packages to private npm

```
// Optional monorepo evolution
lms-monorepo/
├── apps/
│   └── web/           # Current FSD app
├── packages/
│   ├── core/          # Extracted from shared/
│   ├── types/         # All TypeScript types
│   └── offline/       # Offline utilities
└── package.json
```

### Phase 5: Polish & Optimization (Weeks 21-24)

**Week 21-22: Performance**
- [ ] Analyze bundle size, implement code splitting
- [ ] Optimize images and assets
- [ ] Implement virtual scrolling for large lists
- [ ] Cache optimization and stale-while-revalidate patterns

**Week 23-24: Quality & Launch**
- [ ] E2E test suite with Playwright
- [ ] Accessibility audit and fixes
- [ ] Documentation completion
- [ ] Beta testing and bug fixes
- [ ] Production deployment

### Milestone Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Foundation | 4 weeks | Auth working, basic structure |
| Core Features | 6 weeks | All user roles functional |
| Offline | 6 weeks | Full offline course access |
| Mobile Prep | 4 weeks | Extracted packages |
| Polish | 4 weeks | Production-ready |
| **Total** | **24 weeks** | **Complete V2** |

---

## Appendix A: Technology Quick Reference

### Core Dependencies

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@tanstack/react-query": "^5.40.0",
    "@tanstack/react-router": "^1.30.0",
    "zustand": "^4.5.2",
    "dexie": "^4.0.4",
    "react-hook-form": "^7.51.5",
    "zod": "^3.23.8",
    "workbox-precaching": "^7.0.0",
    "workbox-routing": "^7.0.0",
    "workbox-strategies": "^7.0.0"
  },
  "devDependencies": {
    "typescript": "^5.4.5",
    "vite": "^5.2.0",
    "@vitejs/plugin-react": "^4.3.0",
    "vitest": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "msw": "^2.3.0",
    "eslint": "^8.57.0",
    "@feature-sliced/eslint-plugin-fsd": "^0.1.0",
    "playwright": "^1.44.0"
  }
}
```

### Key Configuration Files

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.ts',
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt'],
      manifest: {
        name: 'LMS',
        short_name: 'LMS',
        theme_color: '#ffffff',
        icons: [/* ... */],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          router: ['@tanstack/react-router'],
        },
      },
    },
  },
});
```

**tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

## Appendix B: V1 to V2 Migration Mapping

| V1 Location | V2 Location | Notes |
|-------------|-------------|-------|
| `src/api/client.ts` | `src/shared/api/client.ts` | Enhanced with offline support |
| `src/api/endpoints.ts` | `src/shared/api/endpoints.ts` | Direct port |
| `src/api/*.ts` | `src/entities/*/api/*.ts` | Split by entity |
| `src/store/authStore.ts` | `src/features/auth/model/authStore.ts` | Enhanced with multi-role |
| `src/store/notificationStore.ts` | `src/shared/lib/notifications/store.ts` | Shared utility |
| `src/features/admin/*` | `src/pages/admin/*` + `src/features/admin-*/*` | Split pages/features |
| `src/features/learner/*` | `src/pages/learner/*` + `src/features/learner-*/*` | Split pages/features |
| `src/features/staff/*` | `src/pages/staff/*` + `src/features/staff-*/*` | Split pages/features |
| `src/features/scorm/*` | `src/widgets/scorm-player/*` + `src/shared/lib/scorm/*` | Extract runtime |
| `src/components/common/*` | `src/shared/ui/*` | Design system |
| `src/components/forms/*` | `src/shared/ui/forms/*` | Form components |
| `src/utils/*` | `src/shared/lib/utils/*` | Utilities |
| `src/styles/*` | `src/app/styles/*` | Global styles |
| `src/routes/*` | `src/app/router/*` | Routing config |
| `src/layouts/*` | `src/widgets/navigation/*` + `src/app/layouts/*` | Layouts |
| `src/hooks/*` | Distributed to features/entities | Context-specific |
| `src/mocks/*` | `tests/mocks/*` | Test infrastructure |

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: Architecture Team*
