# LMS UI V2 - Current Development State

**Last Updated**: 2026-01-11

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Common patterns, hooks, and component usage |
| [ROADMAP.md](ROADMAP.md) | Feature roadmap and development priorities |
| [V2_ROLE_SYSTEM_USAGE_GUIDE.md](V2_ROLE_SYSTEM_USAGE_GUIDE.md) | Complete guide to Role System V2 |

---

## Current Architecture

### Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5.4.21
- **State Management**: Zustand (client) + React Query (server)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Architecture**: Feature-Sliced Design (FSD)

### Role System V2
- **UserTypes**: `learner`, `staff`, `global-admin`
- **Department Scoping**: All roles are department-scoped
- **Access Rights Pattern**: `domain:resource:action`
- **Admin Escalation**: Separate password, 15-min timeout, memory-only token

### Token Storage Strategy
| Token | Storage | Purpose |
|-------|---------|---------|
| Access Token | sessionStorage | API authentication |
| Refresh Token | localStorage | Token refresh |
| Admin Token | Memory only | Admin session security |

---

## Active Features

### Completed
- ✅ Authentication (login, logout, token refresh)
- ✅ Role System V2 integration
- ✅ Admin escalation/de-escalation
- ✅ Protected routes (Staff, Learner, Admin)
- ✅ Department selection flow
- ✅ Header with context-aware user type display
- ✅ Dashboard switching (Staff ↔ Learner ↔ Admin)
- ✅ Course management (CRUD)
- ✅ Module editor with content blocks
- ✅ Content uploader

### In Progress
- 🔄 Admin dashboard full navigation (22 routes, 4 in sidebar)
- 🔄 Department selector in sidebar
- 🔄 Role-based sidebar sections

### Planned
- 📋 Certificate management
- 📋 Learning events
- 📋 Discussion/messaging system
- 📋 Reporting dashboard

---

## Directory Structure

```
devdocs/
├── CURRENT_STATE.md          # This file - current state overview
├── QUICK_REFERENCE.md        # Common patterns and usage
├── ROADMAP.md                # Development roadmap
├── V2_ROLE_SYSTEM_USAGE_GUIDE.md  # Role system documentation
├── architecture/             # System architecture docs
├── contracts/                # API contracts and compatibility
├── enhancements/             # Proposed enhancements
├── impl_reports/             # Completed implementation reports
└── plans/                    # Implementation plans
```

---

## Key Files

### Auth System
| File | Purpose |
|------|---------|
| `src/features/auth/model/authStore.ts` | Main auth Zustand store |
| `src/shared/utils/tokenStorage.ts` | Token storage utilities |
| `src/shared/api/client.ts` | Axios client with auth interceptors |
| `src/shared/types/auth.ts` | Auth type definitions |

### Navigation
| File | Purpose |
|------|---------|
| `src/widgets/header/Header.tsx` | Main header with user dropdown |
| `src/widgets/sidebar/Sidebar.tsx` | Main navigation sidebar |
| `src/shared/stores/navigationStore.ts` | Department selection state |

### Routing
| File | Purpose |
|------|---------|
| `src/app/router/ProtectedRoute.tsx` | Route protection HOCs |
| `src/app/router/index.tsx` | Route definitions |

---

## Test Accounts

| Role | Email | Password | Escalation |
|------|-------|----------|------------|
| Staff | staff@test.com | password123 | - |
| Admin | admin@test.com | password123 | Escalate123! |
| Learner | learner@test.com | password123 | - |

---

## Development Commands

```bash
# Start development server
npm run dev

# Type checking
npx tsc --noEmit

# Run tests
npm test

# Build for production
npm run build
```

---

## Recent Changes (2026-01-11)

1. **Header UX Improvements**
   - Context-aware userType display (Staff/Learner/System Admin based on current page)
   - Fixed avatar initials to use firstName
   - Added role badges with hover tooltips
   - Fixed dashboard switching links logic

2. **Admin Escalation**
   - Fixed token storage mismatch (sessionStorage vs localStorage)
   - Admin Dashboard link shows when admin access available and not on admin pages

3. **Documentation Reorganization**
   - Organized devdocs into subdirectories (impl_reports, contracts, plans, architecture, enhancements)

---

## Known Issues

1. **Admin Sidebar Gap**: 22 admin routes exist but only 4 appear in sidebar navigation
2. **Department Context**: Role badges don't yet filter by selected department (TODO in code)

---

## Next Steps

1. Complete admin sidebar navigation
2. Implement department selector in sidebar
3. Add department context to role badge display
4. Review and update ROADMAP.md with current priorities
