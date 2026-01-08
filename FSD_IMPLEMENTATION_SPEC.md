# LMS UI V2 - Feature-Slice Design Implementation Specification

> **Architecture:** Feature-Slice Design (FSD) with Offline-First Core
> **Created:** 2026-01-07
> **Status:** Formalized - Ready for Implementation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architectural Decisions](#architectural-decisions)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Development Workflow](#development-workflow)
6. [Feature Slice Specifications](#feature-slice-specifications)
7. [Offline Architecture](#offline-architecture)
8. [State Management Strategy](#state-management-strategy)
9. [Testing Strategy](#testing-strategy)
10. [Performance Requirements](#performance-requirements)
11. [Implementation Roadmap](#implementation-roadmap)
12. [AI Agent Guidelines](#ai-agent-guidelines)

---

## Executive Summary

The LMS UI V2 will be built using **Feature-Slice Design (FSD)** architecture with a focus on:

- **Maintainability:** Clear layer boundaries enforced by ESLint
- **Mobile Readiness:** Business logic structured for extraction to React Native (6-12 month timeline)
- **Offline-First:** SCORM + documents available offline with sync
- **AI-Assisted Development:** Architecture optimized for agentic team development
- **Performance:** Lighthouse 90+ score target

### Key Characteristics

- **Fresh Start:** No migration from V1 - clean slate implementation
- **First Feature:** Learner Dashboard + Course Viewer
- **Team Model:** AI agents with human oversight
- **State Approach:** TanStack Query (server state) + Zustand (client state)
- **Styling:** Tailwind CSS + shadcn/ui components
- **Testing:** Unit tests (primary) + essential integration tests

---

## Architectural Decisions

### AD-001: Architecture Pattern
**Decision:** Feature-Slice Design (FSD)
**Rationale:**
- Clear layer boundaries prevent architectural decay
- Natural fit for AI agent development (isolated slices)
- ESLint-enforced rules prevent cross-layer violations
- Easier to extract business logic for mobile later

**Alternatives Considered:**
- Monorepo + React Native Web: Too complex for web-first approach
- Micro-frontends: Overkill for team size and deployment needs

### AD-002: Styling System
**Decision:** Tailwind CSS + shadcn/ui
**Rationale:**
- Utility-first approach speeds development
- shadcn/ui provides accessible, unstyled primitives
- Easy dark mode via Tailwind dark: variants
- Mobile-first responsive design
- Components can be wrapped for React Native later

**Configuration:**
- Dark mode: class-based strategy
- WCAG 2.1 AA compliance required
- Custom design tokens in tailwind.config.ts

### AD-003: State Management
**Decision:** TanStack Query + Zustand
**Rationale:**
- TanStack Query: Server state, caching, offline persistence
- Zustand: Client state (UI, auth, preferences)
- Clear separation of concerns
- Excellent offline support via persistence plugins

**State Categories:**
- **Server State (TanStack Query):** Courses, content, enrollments, user data
- **Client State (Zustand):** Auth tokens, role, UI state, user preferences
- **Form State (React Hook Form):** Temporary form data

### AD-004: Offline Strategy
**Decision:** SCORM + Documents with IndexedDB + File System API
**Rationale:**
- Covers 80% of use cases (SCORM is priority)
- Videos stream only (too large for offline)
- Modern File System API for large SCORM packages (fallback to IndexedDB)
- Service Worker for asset caching

**Offline Capabilities:**
- SCORM 1.2/2004 packages fully functional offline
- Document content (PDF, text) available offline
- Progress tracking syncs when online
- Conflict resolution for CMI data

### AD-005: Mobile Strategy
**Decision:** Structure for 6-12 month extraction
**Rationale:**
- Mobile not immediate priority (6-12 months)
- FSD entities/ and features/*/model contain business logic
- Can extract shared packages later without refactoring
- Platform-agnostic API client in shared/

**Mobile Readiness Checklist:**
- ✅ Business logic in pure TypeScript (no DOM dependencies)
- ✅ UI components in separate files from logic
- ✅ API client uses Axios (works in React Native)
- ✅ Use Tailwind patterns that map to React Native styles

### AD-006: Team Structure
**Decision:** Agentic/AI-assisted development
**Rationale:**
- AI agents (like Claude) build features from specifications
- Human oversight for code review and architecture decisions
- Requires crystal-clear boundaries and documentation

**Requirements for AI Development:**
- Strict ESLint rules with FSD plugin
- Comprehensive TypeScript types
- JSDoc documentation on all public APIs
- Feature slice specifications (this document)

### AD-007: Testing Approach
**Decision:** Unit tests (primary) + Essential integration tests
**Rationale:**
- Fast feedback for AI agents
- 70-80% coverage target for business logic
- Integration tests for critical flows (auth, offline sync, SCORM)
- E2E for final validation before releases

**Testing Tools:**
- Vitest for unit tests
- React Testing Library for components
- MSW for API mocking
- Playwright for critical E2E flows

### AD-008: First Feature Priority
**Decision:** Learner Dashboard + Course Viewer
**Rationale:**
- Core value proposition (learners taking courses)
- Tests full stack: auth → API → UI → offline
- Establishes patterns for other roles
- Delivers business value early

### AD-009: Performance Targets
**Decision:** Lighthouse 90+ score
**Rationale:**
- Industry standard for production apps
- Enforced in CI pipeline
- Good mobile experience indicator

**Metrics:**
- Performance: 90+
- Accessibility: 90+ (WCAG 2.1 AA)
- Best Practices: 90+
- SEO: 90+

### AD-010: Permissions Model
**Decision:** Component-level permission checks
**Rationale:**
- Fine-grained UI control (show/hide features)
- Better UX than route-level guards
- Permissions cached in auth store

**Pattern:**
```typescript
const { hasPermission } = useAuth();
{hasPermission('course:update') && <EditButton />}
```

### AD-011: Error Handling
**Decision:** Sentry + React Error Boundaries
**Rationale:**
- Industry standard error tracking
- Great developer experience
- Performance monitoring included
- Session replay for debugging

### AD-012: Documentation
**Decision:** JSDoc + TypeScript types
**Rationale:**
- AI agents can read inline documentation
- TypeScript provides structural documentation
- No separate docs to maintain

### AD-013: CI/CD
**Decision:** GitHub Actions
**Rationale:**
- Integrated with repository
- Free for public/private repos
- Good caching for Turborepo
- Easy deployment to Vercel/Netlify or custom servers

### AD-014: Design System Features
**Decision:** Dark mode, WCAG 2.1 AA, Mobile-first
**Rationale:**
- Dark mode is user expectation
- Accessibility required for education
- Mobile-first prepares for React Native

**Implementation:**
- Tailwind dark: class strategy
- Persisted theme preference in localStorage
- All components keyboard accessible
- Focus indicators, ARIA labels

---

## Technology Stack

### Core Framework
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "typescript": "^5.4.0",
  "vite": "^6.0.0"
}
```

### UI & Styling
```json
{
  "tailwindcss": "^3.4.0",
  "@tailwindcss/forms": "^0.5.7",
  "@tailwindcss/typography": "^0.5.10",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

**shadcn/ui components** (installed as source code):
- button, card, dialog, dropdown-menu, form, input
- label, select, table, toast, tooltip, tabs
- sheet, badge, avatar, separator, skeleton

### State Management
```json
{
  "@tanstack/react-query": "^5.17.0",
  "@tanstack/react-query-devtools": "^5.17.0",
  "@tanstack/react-query-persist-client": "^5.17.0",
  "zustand": "^4.5.0"
}
```

### Routing
```json
{
  "react-router-dom": "^6.22.0",
  "@tanstack/react-router": "^1.15.0"
}
```

**Note:** Consider TanStack Router for better type safety, or stick with React Router 6 (proven in V1).

### Forms & Validation
```json
{
  "react-hook-form": "^7.51.0",
  "zod": "^3.23.0",
  "@hookform/resolvers": "^3.3.4"
}
```

### API Client
```json
{
  "axios": "^1.7.0"
}
```

### Offline Storage
```json
{
  "dexie": "^4.0.0",
  "idb-keyval": "^6.2.1",
  "workbox-core": "^7.0.0",
  "workbox-precaching": "^7.0.0",
  "workbox-routing": "^7.0.0",
  "workbox-strategies": "^7.0.0"
}
```

### SCORM Runtime
```json
{
  "scorm-again": "^2.0.0"
}
```

**Note:** May need custom SCORM adapter for offline CMI data persistence.

### Error Tracking
```json
{
  "@sentry/react": "^7.99.0"
}
```

### Testing
```json
{
  "vitest": "^1.3.0",
  "@testing-library/react": "^14.2.0",
  "@testing-library/user-event": "^14.5.0",
  "@testing-library/jest-dom": "^6.4.0",
  "msw": "^2.0.0",
  "@playwright/test": "^1.41.0"
}
```

### Development Tools
```json
{
  "@feature-sliced/eslint-config": "^0.1.1",
  "eslint-plugin-boundaries": "^4.2.0",
  "prettier": "^3.2.0",
  "prettier-plugin-tailwindcss": "^0.5.11"
}
```

---

## Project Structure

```
1_lms_ui_v2/
├── public/
│   └── service-worker.js          # Service Worker for offline
│
├── src/
│   ├── app/                        # Application layer (highest)
│   │   ├── index.tsx              # Root component
│   │   ├── providers/             # React context providers
│   │   │   ├── QueryProvider.tsx  # TanStack Query setup
│   │   │   ├── AuthProvider.tsx   # Auth context
│   │   │   └── ThemeProvider.tsx  # Dark mode
│   │   ├── router/                # Route definitions
│   │   │   ├── index.tsx          # Router config
│   │   │   ├── routes.tsx         # Route declarations
│   │   │   └── guards.tsx         # ProtectedRoute wrapper
│   │   ├── styles/                # Global styles
│   │   │   └── globals.css        # Tailwind directives + globals
│   │   └── sentry.ts              # Sentry initialization
│   │
│   ├── processes/                  # Business processes (cross-feature)
│   │   ├── auth/                  # Authentication flow
│   │   │   ├── model.ts           # Auth state machine
│   │   │   └── index.ts
│   │   ├── offline-sync/          # Offline synchronization
│   │   │   ├── model.ts           # Sync queue logic
│   │   │   ├── ui.tsx             # Sync status indicator
│   │   │   └── index.ts
│   │   └── course-download/       # Course download workflow
│   │       ├── model.ts
│   │       ├── ui.tsx
│   │       └── index.ts
│   │
│   ├── pages/                      # Page components (routes)
│   │   ├── learner/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CoursePage.tsx
│   │   │   ├── CourseViewerPage.tsx
│   │   │   └── ProgressPage.tsx
│   │   ├── staff/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CourseBuilderPage.tsx
│   │   │   └── AnalyticsPage.tsx
│   │   ├── admin/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── CoursesPage.tsx
│   │   │   └── DepartmentsPage.tsx
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   └── NotFoundPage.tsx
│   │
│   ├── widgets/                    # Composite UI blocks
│   │   ├── course-card/
│   │   │   ├── CourseCard.tsx
│   │   │   └── index.ts
│   │   ├── progress-widget/
│   │   │   ├── ProgressWidget.tsx
│   │   │   └── index.ts
│   │   ├── scorm-player/
│   │   │   ├── ScormPlayer.tsx
│   │   │   ├── ScormControls.tsx
│   │   │   └── index.ts
│   │   └── header/
│   │       ├── Header.tsx
│   │       ├── UserMenu.tsx
│   │       └── index.ts
│   │
│   ├── features/                   # User interactions (business features)
│   │   ├── auth/
│   │   │   ├── api/
│   │   │   │   ├── authApi.ts     # Login, logout, refresh
│   │   │   │   └── passwordApi.ts
│   │   │   ├── model/
│   │   │   │   ├── authStore.ts   # Zustand auth state
│   │   │   │   └── useAuth.ts     # Auth hook
│   │   │   ├── ui/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── LogoutButton.tsx
│   │   │   │   └── RoleSelector.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── course-enrollment/
│   │   │   ├── api/
│   │   │   │   └── enrollmentApi.ts
│   │   │   ├── model/
│   │   │   │   ├── useEnroll.ts
│   │   │   │   └── useUnenroll.ts
│   │   │   ├── ui/
│   │   │   │   ├── EnrollButton.tsx
│   │   │   │   └── EnrollmentModal.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── content-progress/
│   │   │   ├── api/
│   │   │   │   └── progressApi.ts
│   │   │   ├── model/
│   │   │   │   ├── useProgress.ts
│   │   │   │   └── useUpdateProgress.ts
│   │   │   ├── ui/
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   └── ProgressStats.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── course-download/
│   │   │   ├── model/
│   │   │   │   ├── useDownloadCourse.ts
│   │   │   │   └── downloadStore.ts
│   │   │   ├── ui/
│   │   │   │   ├── DownloadButton.tsx
│   │   │   │   └── DownloadProgress.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── scorm-runtime/
│   │       ├── model/
│   │       │   ├── useScormSession.ts
│   │       │   └── scormAdapter.ts
│   │       ├── ui/
│   │       │   └── ScormIframe.tsx
│   │       └── index.ts
│   │
│   ├── entities/                   # Business entities (domain models)
│   │   ├── user/
│   │   │   ├── api/
│   │   │   │   └── userApi.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts       # User, Staff, Learner types
│   │   │   │   ├── useUser.ts     # TanStack Query hook
│   │   │   │   └── useUsers.ts
│   │   │   ├── ui/
│   │   │   │   ├── UserCard.tsx
│   │   │   │   ├── UserAvatar.tsx
│   │   │   │   └── UserBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── course/
│   │   │   ├── api/
│   │   │   │   └── courseApi.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   ├── useCourse.ts
│   │   │   │   └── useCourses.ts
│   │   │   ├── ui/
│   │   │   │   ├── CourseCard.tsx
│   │   │   │   ├── CourseList.tsx
│   │   │   │   └── CourseBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── content/
│   │   │   ├── api/
│   │   │   │   └── contentApi.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts       # Content, SCORM types
│   │   │   │   ├── useContent.ts
│   │   │   │   └── useContents.ts
│   │   │   ├── ui/
│   │   │   │   ├── ContentCard.tsx
│   │   │   │   └── ContentTypeBadge.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── enrollment/
│   │   │   ├── api/
│   │   │   │   └── enrollmentApi.ts
│   │   │   ├── model/
│   │   │   │   ├── types.ts
│   │   │   │   └── useEnrollment.ts
│   │   │   └── index.ts
│   │   │
│   │   └── department/
│   │       ├── api/
│   │       │   └── departmentApi.ts
│   │       ├── model/
│   │       │   ├── types.ts
│   │       │   └── useDepartment.ts
│   │       └── index.ts
│   │
│   └── shared/                     # Shared utilities (lowest layer)
│       ├── api/
│       │   ├── client.ts          # Axios instance with interceptors
│       │   ├── endpoints.ts       # API endpoint constants
│       │   └── types.ts           # Common API types
│       │
│       ├── ui/                     # Shared UI components (shadcn/ui)
│       │   ├── button.tsx
│       │   ├── card.tsx
│       │   ├── dialog.tsx
│       │   ├── form.tsx
│       │   ├── input.tsx
│       │   ├── select.tsx
│       │   ├── table.tsx
│       │   ├── toast.tsx
│       │   └── ...
│       │
│       ├── lib/
│       │   ├── storage/
│       │   │   ├── db.ts          # Dexie IndexedDB schema
│       │   │   ├── queries.ts     # IndexedDB query helpers
│       │   │   └── sync.ts        # Offline sync engine
│       │   │
│       │   ├── scorm/
│       │   │   ├── runtime.ts     # SCORM runtime adapter
│       │   │   ├── offline.ts     # Offline SCORM handler
│       │   │   └── types.ts       # SCORM types
│       │   │
│       │   ├── permissions/
│       │   │   ├── rbac.ts        # Permission checking
│       │   │   └── types.ts       # Permission types
│       │   │
│       │   └── utils/
│       │       ├── cn.ts          # Tailwind merge utility
│       │       ├── dates.ts       # Date formatting
│       │       ├── errors.ts      # Error handling
│       │       └── validation.ts  # Zod schemas
│       │
│       ├── hooks/
│       │   ├── useMediaQuery.ts
│       │   ├── useDebounce.ts
│       │   ├── useLocalStorage.ts
│       │   └── useOnlineStatus.ts
│       │
│       ├── config/
│       │   ├── constants.ts       # App constants
│       │   └── env.ts             # Environment variables
│       │
│       └── types/
│           └── global.d.ts        # Global type declarations
│
├── .eslintrc.cjs                   # ESLint config with FSD plugin
├── .prettierrc                     # Prettier config
├── tailwind.config.ts              # Tailwind configuration
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite config
├── vitest.config.ts                # Vitest config
├── package.json
├── pnpm-lock.yaml
│
├── docs/
│   ├── adr/                        # Architecture Decision Records
│   │   ├── 001-fsd-architecture.md
│   │   ├── 002-styling-system.md
│   │   └── ...
│   └── features/                   # Feature specifications
│       ├── learner-dashboard.md
│       ├── course-viewer.md
│       └── offline-sync.md
│
└── FSD_IMPLEMENTATION_SPEC.md      # This document
```

### Layer Dependencies (Import Rules)

FSD enforces strict layer dependencies via ESLint:

```
app       → processes, pages, widgets, features, entities, shared
processes → pages, widgets, features, entities, shared
pages     → widgets, features, entities, shared
widgets   → features, entities, shared
features  → entities, shared
entities  → shared
shared    → (no internal dependencies)
```

**Key Rules:**
- ❌ Features cannot import from other features
- ❌ Entities cannot import from features
- ❌ Shared cannot import from anywhere
- ✅ Higher layers can import from lower layers
- ✅ Same-layer imports only via public API (index.ts)

---

## Development Workflow

### Setting Up Development Environment

1. **Clone and Install:**
```bash
cd /home/adam/github/lms_ui/1_lms_ui_v2
pnpm install
```

2. **Environment Variables:**
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:3000/api/v2
VITE_SENTRY_DSN=your-sentry-dsn
VITE_ENV=development
```

3. **Start Development Server:**
```bash
pnpm dev
```

4. **Run Tests:**
```bash
pnpm test          # Unit tests
pnpm test:watch    # Watch mode
pnpm test:ui       # Vitest UI
pnpm e2e           # Playwright E2E
```

5. **Linting and Formatting:**
```bash
pnpm lint          # ESLint
pnpm lint:fix      # Auto-fix issues
pnpm format        # Prettier
```

6. **Type Checking:**
```bash
pnpm typecheck
```

### Creating a New Feature Slice

Use the following template when AI agents create new features:

```bash
# Example: Creating "course-rating" feature
src/features/course-rating/
├── api/
│   └── ratingApi.ts          # API calls for ratings
├── model/
│   ├── types.ts              # Rating types
│   ├── useRating.ts          # Query hook
│   └── useSubmitRating.ts    # Mutation hook
├── ui/
│   ├── RatingForm.tsx        # Rating input form
│   ├── RatingDisplay.tsx     # Display rating stars
│   └── RatingList.tsx        # List of ratings
└── index.ts                   # Public API
```

**index.ts (Public API):**
```typescript
// features/course-rating/index.ts
export { RatingForm, RatingDisplay, RatingList } from './ui';
export { useRating, useSubmitRating } from './model';
export type { Rating, RatingFormData } from './model/types';
```

**ESLint Configuration:**
```javascript
// .eslintrc.cjs
module.exports = {
  extends: [
    '@feature-sliced/eslint-config',
  ],
  plugins: ['boundaries'],
  rules: {
    'boundaries/element-types': ['error', {
      default: 'disallow',
      rules: [
        {
          from: 'features',
          allow: ['entities', 'shared'],
        },
        {
          from: 'entities',
          allow: ['shared'],
        },
        // ... other layer rules
      ],
    }],
  },
};
```

### Git Workflow

**Branch Strategy:**
```
main                    # Production-ready code
├── develop            # Integration branch
│   ├── feature/learner-dashboard
│   ├── feature/course-viewer
│   ├── feature/offline-sync
│   └── bugfix/auth-token-refresh
```

**Commit Convention:**
```
feat(learner): add course dashboard page
fix(auth): resolve token refresh race condition
chore(deps): upgrade tailwind to 3.4.1
docs(adr): add decision record for state management
test(course): add unit tests for course entity
```

**PR Requirements:**
- [ ] All tests passing
- [ ] ESLint with no errors
- [ ] TypeScript with no errors
- [ ] Lighthouse score 90+ (for pages)
- [ ] Documentation updated (if API changes)
- [ ] Reviewed by human (for AI-generated code)

---

## Feature Slice Specifications

### 1. Authentication Feature

**Location:** `src/features/auth/`

**Responsibilities:**
- User login with email/password
- Token refresh logic
- Logout (single and all devices)
- Role management
- Permission checking

**API Endpoints:**
- `POST /api/v2/auth/login`
- `POST /api/v2/auth/refresh`
- `POST /api/v2/auth/logout`
- `GET /api/v2/auth/me`

**State (Zustand):**
```typescript
interface AuthState {
  accessToken: string | null;
  role: Role | null;
  roles: Role[];
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}
```

**Components:**
- `LoginForm` - Email/password form with validation
- `LogoutButton` - Logout action
- `RoleSelector` - Switch between roles (if multiple)

**Testing:**
- Unit: authStore, hasPermission logic
- Integration: login flow with API mock
- E2E: full login → navigate → logout

---

### 2. Course Entity

**Location:** `src/entities/course/`

**Responsibilities:**
- Course data model and types
- Course API queries (TanStack Query)
- Course UI primitives (card, list, badge)

**API Endpoints:**
- `GET /api/v2/courses` - List courses
- `GET /api/v2/courses/:id` - Get course details
- `POST /api/v2/courses` - Create course (staff/admin)
- `PUT /api/v2/courses/:id` - Update course
- `DELETE /api/v2/courses/:id` - Delete course

**Types:**
```typescript
interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  departmentId: string;
  credits: number;
  prerequisites: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Queries (TanStack Query):**
```typescript
// entities/course/model/useCourse.ts
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.getCourse(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// entities/course/model/useCourses.ts
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseApi.getCourses(filters),
    staleTime: 5 * 60 * 1000,
  });
};
```

**Components:**
- `CourseCard` - Course preview card
- `CourseList` - List of courses
- `CourseBadge` - Status badge (active, inactive, draft)

**Offline:**
- Courses cached in IndexedDB
- Read-only offline access
- Sync on reconnect

---

### 3. Content Entity

**Location:** `src/entities/content/`

**Responsibilities:**
- Content data model (SCORM, video, document, quiz, etc.)
- Content API queries
- Content type detection and rendering

**API Endpoints:**
- `GET /api/v2/content/:id` - Get content details
- `GET /api/v2/courses/:courseId/content` - Course content list

**Types:**
```typescript
type ContentType = 'scorm' | 'video' | 'document' | 'quiz' | 'assignment' | 'external-link' | 'text';

interface Content {
  _id: string;
  title: string;
  description: string;
  type: ContentType;
  fileUrl?: string;
  duration?: number;
  scormData?: {
    version: '1.2' | '2004';
    manifestPath: string;
    launchPath: string;
    masteryScore?: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

**Offline:**
- SCORM packages fully downloaded to IndexedDB + File System API
- Documents (PDF, text) stored in IndexedDB
- Videos: stream only (no offline)

**Components:**
- `ContentCard` - Content preview
- `ContentTypeBadge` - Icon + label for content type

---

### 4. Course Enrollment Feature

**Location:** `src/features/course-enrollment/`

**Responsibilities:**
- Enroll learner in course
- Unenroll from course
- Check enrollment status

**API Endpoints:**
- `POST /api/v2/enrollments` - Enroll
- `DELETE /api/v2/enrollments/:id` - Unenroll
- `GET /api/v2/enrollments/me` - My enrollments

**Mutations:**
```typescript
// features/course-enrollment/model/useEnroll.ts
export const useEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
```

**Components:**
- `EnrollButton` - Enroll action button
- `EnrollmentModal` - Confirmation modal
- `UnenrollButton` - Unenroll action

---

### 5. Content Progress Feature

**Location:** `src/features/content-progress/`

**Responsibilities:**
- Track content completion
- Update progress percentage
- Display progress stats

**API Endpoints:**
- `POST /api/v2/content-attempts` - Create/update attempt
- `GET /api/v2/content-attempts/me` - My attempts

**Types:**
```typescript
interface ContentAttempt {
  _id: string;
  contentId: string;
  learnerId: string;
  attemptNumber: number;
  status: 'not-attempted' | 'in-progress' | 'completed' | 'passed' | 'failed';
  score?: number;
  maxScore?: number;
  percentage?: number;
  startedAt: string;
  completedAt?: string;
  duration: number;
}
```

**Offline:**
- Progress tracked locally in IndexedDB
- Synced when online
- Conflict resolution: latest timestamp wins

**Components:**
- `ProgressBar` - Visual progress indicator
- `ProgressStats` - Numeric stats (X/Y completed)

---

### 6. SCORM Runtime Feature

**Location:** `src/features/scorm-runtime/`

**Responsibilities:**
- Load SCORM package (online or offline)
- SCORM API wrapper (window.API or window.API_1484_11)
- CMI data persistence
- Progress tracking

**SCORM Adapter:**
```typescript
// features/scorm-runtime/model/scormAdapter.ts
export class OfflineScormAdapter {
  private cmiData: CMIData;
  private contentId: string;
  private attemptId: string;

  Initialize(): boolean;
  Terminate(): boolean;
  GetValue(element: string): string;
  SetValue(element: string, value: string): boolean;
  Commit(): boolean;

  // Offline-specific
  saveToIndexedDB(): Promise<void>;
  loadFromIndexedDB(): Promise<void>;
  syncToServer(): Promise<void>;
}
```

**Offline:**
- SCORM packages stored in File System API (if available) or IndexedDB
- CMI data in IndexedDB (persisted per attempt)
- Sync CMI data to server when online

**Components:**
- `ScormPlayer` - Iframe wrapper for SCORM content
- `ScormControls` - Previous/Next navigation

---

### 7. Course Download Feature

**Location:** `src/features/course-download/`

**Responsibilities:**
- Download course for offline access
- Download progress indicator
- Manage downloaded courses (view, delete)

**State:**
```typescript
interface DownloadState {
  downloads: Map<string, DownloadProgress>;
  downloadCourse: (courseId: string) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;
  getDownloadProgress: (courseId: string) => DownloadProgress | null;
}

interface DownloadProgress {
  courseId: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number; // 0-100
  totalSize: number;
  downloadedSize: number;
}
```

**Implementation:**
1. Fetch course metadata
2. Fetch all content items
3. Download SCORM packages (to File System API or IndexedDB)
4. Download documents (to IndexedDB)
5. Store course data in IndexedDB
6. Mark course as "available offline"

**Components:**
- `DownloadButton` - Initiate download
- `DownloadProgress` - Progress bar + cancel
- `DownloadedCoursesList` - Manage offline courses

---

### 8. Offline Sync Process

**Location:** `src/processes/offline-sync/`

**Responsibilities:**
- Detect online/offline status
- Queue mutations when offline
- Sync queued mutations when online
- Conflict resolution

**Sync Queue:**
```typescript
interface SyncQueueItem {
  id: string;
  type: 'content-attempt' | 'scorm-cmi' | 'enrollment';
  action: 'create' | 'update' | 'delete';
  data: unknown;
  timestamp: number;
  retries: number;
}
```

**Implementation:**
```typescript
// processes/offline-sync/model.ts
export const useSyncQueue = () => {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    if (isOnline) {
      syncEngine.processQueue();
    }
  }, [isOnline]);

  return {
    addToQueue: syncEngine.addToQueue,
    queueSize: syncEngine.getQueueSize(),
  };
};
```

**Conflict Resolution:**
- **Content Attempts:** Latest timestamp wins
- **SCORM CMI:** Merge CMI data (offline takes precedence for progress)
- **Enrollments:** Server state wins (cannot enroll offline)

**Components:**
- `SyncStatusIndicator` - Shows sync status (synced, syncing, offline)

---

## Offline Architecture

### IndexedDB Schema (Dexie)

```typescript
// shared/lib/storage/db.ts
import Dexie, { Table } from 'dexie';

export class LMSDatabase extends Dexie {
  courses!: Table<Course>;
  content!: Table<Content>;
  contentAttempts!: Table<ContentAttempt>;
  scormAttempts!: Table<ScormAttempt>;
  scormPackages!: Table<ScormPackage>;
  syncQueue!: Table<SyncQueueItem>;

  constructor() {
    super('LMSDatabase');
    this.version(1).stores({
      courses: '_id, code, departmentId, isActive',
      content: '_id, type, courseId, isActive',
      contentAttempts: '_id, contentId, learnerId, status, updatedAt',
      scormAttempts: '_id, contentId, learnerId, attemptNumber, status',
      scormPackages: 'contentId, version',
      syncQueue: '++id, type, timestamp',
    });
  }
}

export const db = new LMSDatabase();
```

### Service Worker (Workbox)

```typescript
// public/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';

// Precache app shell
precacheAndRoute(self.__WB_MANIFEST);

// API calls: Network first, fallback to cache
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/v2'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
  })
);

// Static assets: Cache first
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new CacheFirst({
    cacheName: 'static-assets',
  })
);

// SCORM packages: Cache first (large files)
registerRoute(
  ({ url }) => url.pathname.includes('/scorm/'),
  new CacheFirst({
    cacheName: 'scorm-packages',
  })
);

// Images, fonts: Stale while revalidate
registerRoute(
  ({ request }) => request.destination === 'image' || request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'media-cache',
  })
);
```

### TanStack Query Persistence

```typescript
// app/providers/QueryProvider.tsx
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 24 * 60 * 60 * 1000, // 24 hours
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'LMS_QUERY_CACHE',
});

export const QueryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  );
};
```

### File System API for SCORM Packages

```typescript
// shared/lib/storage/fileSystem.ts

/**
 * Store large SCORM packages using File System Access API (Chrome/Edge)
 * Falls back to IndexedDB for other browsers
 */
export class ScormFileStorage {
  private supportsFileSystem: boolean;

  constructor() {
    this.supportsFileSystem = 'showDirectoryPicker' in window;
  }

  async saveScormPackage(contentId: string, blob: Blob): Promise<void> {
    if (this.supportsFileSystem) {
      return this.saveToFileSystem(contentId, blob);
    } else {
      return this.saveToIndexedDB(contentId, blob);
    }
  }

  private async saveToFileSystem(contentId: string, blob: Blob): Promise<void> {
    const dirHandle = await this.getDirectoryHandle();
    const fileHandle = await dirHandle.getFileHandle(`${contentId}.zip`, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(blob);
    await writable.close();
  }

  private async saveToIndexedDB(contentId: string, blob: Blob): Promise<void> {
    await db.scormPackages.put({
      contentId,
      blob,
      savedAt: Date.now(),
    });
  }

  async loadScormPackage(contentId: string): Promise<Blob | null> {
    if (this.supportsFileSystem) {
      return this.loadFromFileSystem(contentId);
    } else {
      return this.loadFromIndexedDB(contentId);
    }
  }

  private async getDirectoryHandle(): Promise<FileSystemDirectoryHandle> {
    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      await navigator.storage.persist();
    }

    // Get OPFS directory
    const root = await navigator.storage.getDirectory();
    return await root.getDirectoryHandle('scorm-packages', { create: true });
  }
}
```

---

## State Management Strategy

### TanStack Query (Server State)

**Use Cases:**
- Fetching data from API (courses, content, users, enrollments)
- Caching API responses
- Automatic refetching and revalidation
- Optimistic updates
- Offline persistence

**Query Configuration:**
```typescript
// entities/course/model/useCourses.ts
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: () => courseApi.getCourses(filters),
    staleTime: 5 * 60 * 1000,     // Fresh for 5 minutes
    cacheTime: 24 * 60 * 60 * 1000, // Keep in cache for 24 hours
    retry: 2,                       // Retry failed requests twice
    refetchOnWindowFocus: false,    // Don't refetch on tab focus
    refetchOnReconnect: true,       // Refetch when coming online
  });
};
```

**Mutation with Optimistic Update:**
```typescript
// features/course-enrollment/model/useEnroll.ts
export const useEnroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => enrollmentApi.enroll(courseId),

    // Optimistic update
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ['enrollments'] });

      const previousEnrollments = queryClient.getQueryData(['enrollments']);

      queryClient.setQueryData(['enrollments'], (old: Enrollment[]) => [
        ...old,
        { courseId, status: 'pending', enrollmentDate: new Date().toISOString() },
      ]);

      return { previousEnrollments };
    },

    // Rollback on error
    onError: (err, courseId, context) => {
      queryClient.setQueryData(['enrollments'], context?.previousEnrollments);
    },

    // Refetch on success
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
};
```

**Offline Mutations (Sync Queue):**
```typescript
// shared/lib/storage/sync.ts
export const useOfflineMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables>
) => {
  const isOnline = useOnlineStatus();

  return useMutation({
    mutationFn: async (variables: TVariables) => {
      if (isOnline) {
        return mutationFn(variables);
      } else {
        // Add to sync queue
        await db.syncQueue.add({
          type: 'mutation',
          action: 'create',
          data: variables,
          timestamp: Date.now(),
          retries: 0,
        });

        // Return optimistic result
        return {} as TData;
      }
    },
    ...options,
  });
};
```

---

### Zustand (Client State)

**Use Cases:**
- Authentication state (token, role, user)
- UI state (theme, sidebar open/closed)
- User preferences (language, notifications)
- Download state (progress, queue)

**Auth Store:**
```typescript
// features/auth/model/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  role: Role | null;
  roles: Role[];
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      role: null,
      roles: [],
      isAuthenticated: false,

      login: async (credentials) => {
        const response = await authApi.login(credentials);
        set({
          accessToken: response.accessToken,
          role: response.role,
          roles: response.roles,
          isAuthenticated: true,
        });
      },

      logout: async () => {
        await authApi.logout();
        set({
          accessToken: null,
          role: null,
          roles: [],
          isAuthenticated: false,
        });
      },

      refreshToken: async () => {
        const response = await authApi.refresh();
        set({ accessToken: response.accessToken });
      },

      hasPermission: (permission) => {
        const { role, roles } = get();
        return checkPermission(role, roles, permission);
      },

      setToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        role: state.role,
        roles: state.roles,
      }),
    }
  )
);
```

**Download Store:**
```typescript
// features/course-download/model/downloadStore.ts
import { create } from 'zustand';

interface DownloadState {
  downloads: Map<string, DownloadProgress>;

  startDownload: (courseId: string) => void;
  updateProgress: (courseId: string, progress: number) => void;
  completeDownload: (courseId: string) => void;
  failDownload: (courseId: string, error: string) => void;
  cancelDownload: (courseId: string) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  downloads: new Map(),

  startDownload: (courseId) =>
    set((state) => {
      const newDownloads = new Map(state.downloads);
      newDownloads.set(courseId, {
        courseId,
        status: 'downloading',
        progress: 0,
        totalSize: 0,
        downloadedSize: 0,
      });
      return { downloads: newDownloads };
    }),

  updateProgress: (courseId, progress) =>
    set((state) => {
      const newDownloads = new Map(state.downloads);
      const current = newDownloads.get(courseId);
      if (current) {
        newDownloads.set(courseId, { ...current, progress });
      }
      return { downloads: newDownloads };
    }),

  completeDownload: (courseId) =>
    set((state) => {
      const newDownloads = new Map(state.downloads);
      const current = newDownloads.get(courseId);
      if (current) {
        newDownloads.set(courseId, { ...current, status: 'completed', progress: 100 });
      }
      return { downloads: newDownloads };
    }),

  failDownload: (courseId, error) =>
    set((state) => {
      const newDownloads = new Map(state.downloads);
      const current = newDownloads.get(courseId);
      if (current) {
        newDownloads.set(courseId, { ...current, status: 'failed' });
      }
      return { downloads: newDownloads };
    }),

  cancelDownload: (courseId) =>
    set((state) => {
      const newDownloads = new Map(state.downloads);
      newDownloads.delete(courseId);
      return { downloads: newDownloads };
    }),
}));
```

---

## Testing Strategy

### Unit Tests (Vitest + Testing Library)

**Coverage Target:** 70-80% of business logic

**Test Structure:**
```typescript
// entities/course/model/useCourse.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCourse } from './useCourse';
import { courseApi } from '../api/courseApi';

// Mock API
vi.mock('../api/courseApi');

describe('useCourse', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
  });

  it('should fetch course data', async () => {
    const mockCourse = {
      _id: '1',
      name: 'Introduction to TypeScript',
      code: 'CS101',
      credits: 3,
    };

    vi.mocked(courseApi.getCourse).mockResolvedValue(mockCourse);

    const { result } = renderHook(() => useCourse('1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCourse);
  });

  it('should handle errors', async () => {
    vi.mocked(courseApi.getCourse).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCourse('1'), {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      ),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
  });
});
```

**Component Tests:**
```typescript
// entities/course/ui/CourseCard.test.tsx
import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  const mockCourse = {
    _id: '1',
    name: 'Introduction to TypeScript',
    code: 'CS101',
    description: 'Learn TypeScript basics',
    credits: 3,
    isActive: true,
  };

  it('should render course information', () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText('Introduction to TypeScript')).toBeInTheDocument();
    expect(screen.getByText('CS101')).toBeInTheDocument();
    expect(screen.getByText('3 credits')).toBeInTheDocument();
  });

  it('should show inactive badge when course is inactive', () => {
    render(<CourseCard course={{ ...mockCourse, isActive: false }} />);

    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<CourseCard course={mockCourse} onClick={onClick} />);

    await userEvent.click(screen.getByRole('article'));

    expect(onClick).toHaveBeenCalledWith(mockCourse);
  });
});
```

---

### Integration Tests

**Coverage:** Critical user flows (auth, offline sync, SCORM)

**Example:**
```typescript
// features/auth/auth.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { server } from '@/test/mocks/server';
import { http, HttpResponse } from 'msw';
import { App } from '@/app';

describe('Authentication Flow', () => {
  it('should login user and redirect to dashboard', async () => {
    render(<App />);

    // User is on login page
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    // Enter credentials
    await userEvent.type(screen.getByLabelText(/email/i), 'learner@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Should redirect to learner dashboard
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    });

    // Should show user info
    expect(screen.getByText(/learner@example.com/i)).toBeInTheDocument();
  });

  it('should show error on invalid credentials', async () => {
    server.use(
      http.post('/api/v2/auth/login', () => {
        return HttpResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      })
    );

    render(<App />);

    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });
});
```

---

### E2E Tests (Playwright)

**Coverage:** Smoke tests for critical paths

**Example:**
```typescript
// e2e/learner-course-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Learner Course Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as learner
    await page.goto('/login');
    await page.fill('input[name="email"]', 'learner@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/learners/dashboard');
  });

  test('should browse and enroll in course', async ({ page }) => {
    // See available courses
    await expect(page.locator('h2').filter({ hasText: 'Available Courses' })).toBeVisible();

    // Click on a course
    await page.click('article:has-text("Introduction to TypeScript")');

    // Should navigate to course page
    await page.waitForURL(/\/courses\/\w+/);
    await expect(page.locator('h1')).toContainText('Introduction to TypeScript');

    // Enroll in course
    await page.click('button:has-text("Enroll")');

    // Should show success message
    await expect(page.locator('[role="status"]')).toContainText('Enrolled successfully');

    // Button should change to "Go to Course"
    await expect(page.locator('button:has-text("Go to Course")')).toBeVisible();
  });

  test('should download course for offline access', async ({ page }) => {
    await page.goto('/learners/courses');

    // Click download button
    await page.click('button[aria-label="Download course"]');

    // Should show download progress
    await expect(page.locator('[role="progressbar"]')).toBeVisible();

    // Wait for download to complete
    await expect(page.locator('text=Download complete')).toBeVisible({ timeout: 30000 });

    // Go offline
    await page.context().setOffline(true);

    // Should still be able to access course
    await page.reload();
    await expect(page.locator('h1')).toContainText('Introduction to TypeScript');
  });
});
```

---

## Performance Requirements

### Lighthouse Scores

**Target:** 90+ for all metrics

```bash
# Run Lighthouse in CI
pnpm lighthouse --url=http://localhost:5173 --output=json --output-path=./lighthouse-report.json
```

**CI Enforcement:**
```yaml
# .github/workflows/ci.yml
- name: Run Lighthouse
  uses: treosh/lighthouse-ci-action@v10
  with:
    urls: |
      http://localhost:5173/
      http://localhost:5173/learners/dashboard
      http://localhost:5173/courses/1
    uploadArtifacts: true
    temporaryPublicStorage: true
    runs: 3
    budgets: |
      {
        "performance": 90,
        "accessibility": 90,
        "best-practices": 90,
        "seo": 90
      }
```

### Bundle Size

**Target:** Initial bundle < 500KB gzipped

**Analysis:**
```bash
pnpm build
pnpm vite-bundle-visualizer
```

**Optimization Strategies:**
- Code splitting per route
- Lazy load feature slices
- Tree shaking (ESM imports)
- Dynamic imports for heavy libraries (e.g., SCORM runtime)

```typescript
// Lazy load SCORM player
const ScormPlayer = lazy(() => import('@/widgets/scorm-player'));

// In component
<Suspense fallback={<Skeleton />}>
  <ScormPlayer contentId={id} />
</Suspense>
```

### Core Web Vitals

**Targets:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Monitoring:**
```typescript
// app/index.tsx
import { onLCP, onFID, onCLS } from 'web-vitals';

onLCP(console.log);
onFID(console.log);
onCLS(console.log);
```

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1: Project Setup**
- [x] Initialize Vite project with TypeScript 5.4
- [x] Install dependencies (see Technology Stack)
- [x] Configure Tailwind CSS + shadcn/ui
- [x] Configure ESLint with FSD plugin
- [x] Set up Vitest
- [x] Create project structure (FSD layers)
- [x] Configure GitHub Actions CI

**Week 2: Core Infrastructure**
- [ ] Implement `shared/api/client.ts` (Axios with interceptors)
- [ ] Set up TanStack Query with persistence
- [ ] Implement `shared/lib/storage/db.ts` (Dexie schema)
- [ ] Create auth store (Zustand)
- [ ] Set up Sentry error tracking
- [ ] Configure environment variables

**Week 3: Authentication**
- [ ] Create auth feature slice (`features/auth/`)
- [ ] Implement login API and form
- [ ] Implement token refresh logic
- [ ] Implement logout
- [ ] Create ProtectedRoute wrapper
- [ ] Add role-based routing

**Week 4: Design System**
- [ ] Install shadcn/ui components (button, card, form, input, etc.)
- [ ] Create dark mode toggle
- [ ] Set up design tokens in Tailwind config
- [ ] Create shared UI components (layout, header, footer)
- [ ] Test accessibility (keyboard nav, screen readers)

**Milestone:** User can log in, see authenticated app shell, dark mode works

---

### Phase 2: Learner Dashboard (Weeks 5-8)

**Week 5: Course Entity**
- [ ] Define course types (`entities/course/model/types.ts`)
- [ ] Implement course API (`entities/course/api/courseApi.ts`)
- [ ] Create TanStack Query hooks (`useCourse`, `useCourses`)
- [ ] Build CourseCard component
- [ ] Build CourseList component
- [ ] Write unit tests for course entity

**Week 6: Content Entity**
- [ ] Define content types (SCORM, video, document, etc.)
- [ ] Implement content API
- [ ] Create TanStack Query hooks
- [ ] Build ContentCard component
- [ ] Build ContentTypeBadge component
- [ ] Write unit tests

**Week 7: Enrollment Feature**
- [ ] Define enrollment types
- [ ] Implement enrollment API
- [ ] Create TanStack Query hooks and mutations
- [ ] Build EnrollButton component
- [ ] Build EnrollmentModal component
- [ ] Write integration tests for enrollment flow

**Week 8: Learner Dashboard Page**
- [ ] Create DashboardPage (`pages/learner/DashboardPage.tsx`)
- [ ] Display enrolled courses
- [ ] Display available courses
- [ ] Add course search and filters
- [ ] Add enrollment action
- [ ] Write E2E test for learner dashboard

**Milestone:** Learner can log in, view courses, enroll in courses

---

### Phase 3: Course Viewer (Weeks 9-12)

**Week 9: Course Viewer Page**
- [ ] Create CourseViewerPage (`pages/learner/CourseViewerPage.tsx`)
- [ ] Display course content list
- [ ] Display content details
- [ ] Add content navigation (previous/next)
- [ ] Handle different content types (document, video, quiz)

**Week 10: Content Progress Feature**
- [ ] Define ContentAttempt types
- [ ] Implement progress API
- [ ] Create TanStack Query hooks and mutations
- [ ] Build ProgressBar component
- [ ] Build ProgressStats component
- [ ] Track content completion

**Week 11: SCORM Runtime (Online)**
- [ ] Install scorm-again library
- [ ] Create SCORM adapter (`features/scorm-runtime/model/scormAdapter.ts`)
- [ ] Build ScormPlayer widget
- [ ] Implement SCORM API wrapper (window.API)
- [ ] Track SCORM progress to server
- [ ] Handle SCORM completion

**Week 12: Testing & Polish**
- [ ] Write unit tests for content progress
- [ ] Write integration tests for SCORM runtime
- [ ] Write E2E test for course viewer
- [ ] Fix accessibility issues
- [ ] Optimize performance (lazy loading, code splitting)

**Milestone:** Learner can view course content, track progress, complete SCORM packages (online)

---

### Phase 4: Offline Capabilities (Weeks 13-16)

**Week 13: Offline Infrastructure**
- [ ] Set up Service Worker with Workbox
- [ ] Implement IndexedDB sync engine (`shared/lib/storage/sync.ts`)
- [ ] Create sync queue for offline mutations
- [ ] Implement online/offline detection hook
- [ ] Create SyncStatusIndicator widget

**Week 14: Course Download Feature**
- [ ] Create download feature slice (`features/course-download/`)
- [ ] Implement course download logic
- [ ] Build DownloadButton component
- [ ] Build DownloadProgress component
- [ ] Store course data in IndexedDB
- [ ] Track download progress

**Week 15: SCORM Offline**
- [ ] Implement File System API storage for SCORM packages
- [ ] Fallback to IndexedDB for browsers without File System API
- [ ] Modify SCORM adapter for offline CMI data persistence
- [ ] Implement offline SCORM player
- [ ] Queue SCORM progress for sync when online

**Week 16: Offline Sync & Testing**
- [ ] Implement conflict resolution for synced data
- [ ] Test offline course download
- [ ] Test offline SCORM playback
- [ ] Test sync when coming online
- [ ] Write E2E tests for offline scenarios
- [ ] Optimize IndexedDB queries

**Milestone:** Learner can download courses, access SCORM offline, sync progress when online

---

### Phase 5: Staff & Admin Features (Weeks 17-20)

**Week 17: Staff Dashboard**
- [ ] Create staff dashboard page
- [ ] Display assigned courses
- [ ] Display analytics (enrollments, completions)
- [ ] Add course management actions

**Week 18: Course Builder (Basic)**
- [ ] Create course builder page
- [ ] Implement course creation form
- [ ] Add course content assignment
- [ ] Support content sequencing
- [ ] Add course preview

**Week 19: Admin Dashboard**
- [ ] Create admin dashboard page
- [ ] Display platform metrics
- [ ] Add user management (list, create, edit, delete)
- [ ] Add department management
- [ ] Add enrollment management

**Week 20: Admin Features**
- [ ] Add content library management
- [ ] Add course approval workflow
- [ ] Add reporting (enrollment reports, progress reports)
- [ ] Add settings management

**Milestone:** Staff can manage courses, admin can manage users and platform

---

### Phase 6: Mobile Preparation (Weeks 21-22)

**Week 21: Business Logic Extraction**
- [ ] Audit entities/ for DOM dependencies
- [ ] Extract API client to shared package
- [ ] Extract business logic to pure functions
- [ ] Document mobile extraction strategy
- [ ] Create mobile-readiness checklist

**Week 22: Mobile-Compatible Patterns**
- [ ] Refactor UI components to separate logic from presentation
- [ ] Use react-hook-form for forms (works in React Native)
- [ ] Use platform-agnostic date libraries (date-fns)
- [ ] Test API client in Node.js environment (simulate React Native)

**Milestone:** Business logic ready for extraction to React Native

---

### Phase 7: Polish & Optimization (Weeks 23-24)

**Week 23: Performance Optimization**
- [ ] Run Lighthouse audits on all pages
- [ ] Optimize bundle size (code splitting, tree shaking)
- [ ] Optimize images (WebP, lazy loading)
- [ ] Implement route-based code splitting
- [ ] Add loading skeletons
- [ ] Optimize IndexedDB queries

**Week 24: Final Testing & Documentation**
- [ ] Run full E2E test suite
- [ ] Fix accessibility issues (WCAG 2.1 AA)
- [ ] Update documentation (feature specs, API docs)
- [ ] Create deployment guide
- [ ] Create user guides (for learners, staff, admin)
- [ ] Prepare for production launch

**Milestone:** Production-ready LMS UI V2

---

## AI Agent Guidelines

### For AI Agents Building Features

When you are assigned to build a feature slice, follow these guidelines:

#### 1. Understand the Feature Specification

Read the feature specification in this document or in `docs/features/*.md`. Understand:
- The feature's purpose and responsibilities
- API endpoints and data models
- UI components required
- State management approach
- Offline requirements (if any)

#### 2. Follow FSD Structure

Create files in the correct FSD layers:

```
src/features/[feature-name]/
├── api/          # API calls (if feature makes API calls)
├── model/        # Business logic, hooks, types
├── ui/           # React components
└── index.ts      # Public API (export only what's needed)
```

**Import Rules:**
- ✅ Features can import from `entities/` and `shared/`
- ❌ Features CANNOT import from other features
- ❌ Features CANNOT import from `pages/`, `widgets/`, `processes/`

#### 3. Use TypeScript Strictly

- All functions must have type signatures
- All props must have TypeScript interfaces
- Use Zod for runtime validation of API responses
- Export types from `model/types.ts`

#### 4. Write JSDoc Comments

Document all public APIs:

```typescript
/**
 * Hook to fetch a course by ID.
 *
 * @param id - The course ID
 * @returns TanStack Query result with course data
 *
 * @example
 * ```tsx
 * const { data: course, isLoading } = useCourse('123');
 * ```
 */
export const useCourse = (id: string) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => courseApi.getCourse(id),
  });
};
```

#### 5. Use TanStack Query for API Calls

- Use `useQuery` for GET requests
- Use `useMutation` for POST/PUT/DELETE
- Set appropriate `staleTime` and `cacheTime`
- Implement optimistic updates for mutations
- Invalidate related queries on mutation success

#### 6. Use Zustand for Client State (Only When Needed)

- Use Zustand ONLY for client state (auth, theme, UI state)
- Do NOT use Zustand for server state (use TanStack Query)
- Use `persist` middleware for persistent state

#### 7. Build Accessible Components

- Use semantic HTML (`<button>`, `<input>`, `<form>`, not `<div>` with click handlers)
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers (if possible)
- Use shadcn/ui components (already accessible)

#### 8. Write Tests

For each feature slice, write:

- **Unit tests** for business logic (model/ layer)
- **Component tests** for UI (ui/ layer)
- **Integration tests** for critical flows (if needed)

Use this test template:

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createWrapper } from '@/test/utils';

describe('useCourse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch course data', async () => {
    // Test implementation
  });

  it('should handle errors', async () => {
    // Test implementation
  });
});
```

#### 9. Handle Errors Gracefully

- Use React Error Boundaries for component errors
- Show user-friendly error messages (via toast)
- Log errors to Sentry (in production)
- Provide fallback UI (skeleton, empty state)

```typescript
try {
  await enrollmentApi.enroll(courseId);
  toast.success('Enrolled successfully');
} catch (error) {
  console.error('Enrollment failed:', error);
  toast.error('Failed to enroll. Please try again.');
}
```

#### 10. Follow Naming Conventions

- **Files:** kebab-case (e.g., `course-card.tsx`, `use-course.ts`)
- **Components:** PascalCase (e.g., `CourseCard`, `EnrollButton`)
- **Hooks:** camelCase with `use` prefix (e.g., `useCourse`, `useEnroll`)
- **Types:** PascalCase (e.g., `Course`, `Enrollment`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

#### 11. Optimize for Performance

- Use `React.memo` for expensive components
- Use `useMemo` and `useCallback` to prevent re-renders
- Lazy load heavy components (SCORM player, chart libraries)
- Use code splitting (`React.lazy`) for routes

```typescript
const ScormPlayer = lazy(() => import('@/widgets/scorm-player'));
```

#### 12. Make It Mobile-Ready

- Use responsive Tailwind classes (`sm:`, `md:`, `lg:`)
- Avoid browser-specific APIs in business logic
- Keep business logic in `model/` layer (can be extracted later)
- Test on mobile viewport

#### 13. Document Your Work

- Update feature specification (if behavior changes)
- Add JSDoc to public APIs
- Add comments for complex logic
- Update README if new patterns introduced

#### 14. Submit for Review

Before marking your task as complete:
- [ ] All tests pass (`pnpm test`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Feature works in browser (manual test)
- [ ] Accessibility tested (keyboard navigation)
- [ ] Responsive design tested (mobile, tablet, desktop)
- [ ] Documentation updated

---

### Common Pitfalls (Avoid These)

❌ **DON'T:**
- Import from other features (violates FSD)
- Use Zustand for server state (use TanStack Query)
- Hardcode API URLs (use `shared/api/endpoints.ts`)
- Ignore TypeScript errors
- Skip tests
- Use `any` type
- Make API calls directly in components (use hooks)

✅ **DO:**
- Follow FSD layer structure
- Use TanStack Query for API calls
- Write TypeScript types
- Add JSDoc comments
- Write tests
- Use shadcn/ui components
- Handle errors gracefully

---

## Appendix

### A. Environment Variables

```bash
# .env.local (development)
VITE_API_BASE_URL=http://localhost:3000/api/v2
VITE_SENTRY_DSN=
VITE_ENV=development

# .env.production (production)
VITE_API_BASE_URL=https://api.lms.example.com/api/v2
VITE_SENTRY_DSN=your-production-sentry-dsn
VITE_ENV=production
```

### B. API Endpoints Reference

See `/home/adam/github/lms_node/1_LMS_Node_V2/devdocs/API_Endpoint_Normalization_Plan.md` for complete API specification.

**Base URL:** `http://localhost:3000/api/v2` (development)

**Auth:**
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

**Courses:**
- `GET /courses` - List courses
- `GET /courses/:id` - Get course
- `POST /courses` - Create course (staff/admin)
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

**Content:**
- `GET /content/:id` - Get content
- `GET /courses/:courseId/content` - List course content

**Enrollments:**
- `POST /enrollments` - Enroll in course
- `GET /enrollments/me` - My enrollments
- `DELETE /enrollments/:id` - Unenroll

**Content Attempts:**
- `POST /content-attempts` - Create/update attempt
- `GET /content-attempts/me` - My attempts

**SCORM:**
- `GET /scorm/:contentId` - Get SCORM package
- `POST /scorm/attempts` - Create SCORM attempt
- `PUT /scorm/attempts/:attemptId` - Update SCORM progress

### C. Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "streetsidesoftware.code-spell-checker",
    "vitest.explorer",
    "ms-playwright.playwright",
    "Gruntfuggly.todo-tree"
  ]
}
```

### D. References

- [Feature-Sliced Design Documentation](https://feature-sliced.design/)
- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [SCORM 1.2 Specification](https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/)
- [SCORM 2004 Specification](https://scorm.com/scorm-explained/technical-scorm/scorm-2004-overview/)

---

**End of Specification**

This document is a living specification and will be updated as the project evolves.
