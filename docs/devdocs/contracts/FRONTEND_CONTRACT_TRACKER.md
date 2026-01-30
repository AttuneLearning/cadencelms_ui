# Frontend Implementation Tracker
# Contract-Driven Development from Backend Contracts

**Last Updated:** 2026-01-08
**Strategy:** Implement frontend as backend contracts arrive
**Backend Contract Plan:** `/home/adam/github/cadencelms_api/contracts/PENDING.md`
**Backend Implementation Plan:** `/home/adam/github/cadencelms_api/devdocs/CONTRACT_IMPLEMENTATION_PLAN.md`

---

## 📋 Status Legend

| Status | Meaning |
|--------|---------|
| ✅ Complete | Entity types, API client, hooks, UI components, tests complete |
| 🔨 In Progress | Implementation started |
| 📝 Ready | Contract received, ready to implement |
| ⏳ Waiting | Waiting for backend contract |
| 🔲 Blocked | Depends on other contracts |

---

## 🔥 Phase 1: Core Identity & Organization (Days 1-2)

**Backend Status:** Creating contracts now

| Entity | Contract File | Status | Types | API | Hooks | UI | Tests | Notes |
|--------|--------------|--------|-------|-----|-------|----|----|-------|
| Auth | `auth.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **ARRIVED 2026-01-08 20:19** - Login/logout/refresh/reset |
| Users | `users.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **ARRIVED 2026-01-08 20:58** - 6 endpoints, 945 lines |
| Staff | `staff.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **ARRIVED 2026-01-08 20:58** - 6 endpoints, 924 lines |
| Learners | `learners.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **ARRIVED 2026-01-08 20:58** - 5 endpoints, 837 lines |
| Departments | `departments.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **ARRIVED 2026-01-08 21:00** - 8 endpoints, 1330 lines |
| Academic Years | `academic-years.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **ARRIVED 2026-01-08 20:59** - 15 endpoints, 1762 lines |

**Frontend Actions When Contract Arrives:**
1. Read contract from backend repo
2. Create TypeScript interfaces matching contract types
3. Build API client with typed functions
4. Create React Query hooks
5. Build UI components
6. Write tests
7. Mark as ✅ Complete in this tracker

---

## ⚡ Phase 2: Programs & Courses (Days 3-4)

**Backend Status:** Contracts pending

| Entity | Contract File | Status | Types | API | Hooks | UI | Tests | Notes |
|--------|--------------|--------|-------|-----|-------|----|----|-------|
| Programs | `programs.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Program CRUD + levels |
| Program Levels | `program-levels.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Level shortcuts |
| Courses | `courses.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Course CRUD + publish + duplicate |
| Course Segments | `course-segments.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Modules + reorder |
| Classes | `classes.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Class instances + roster |

---

## ⚡ Phase 3: Content & Templates (Days 5-6)

**Backend Status:** Contracts pending

| Entity | Contract File | Status | Types | API | Hooks | UI | Tests | Notes |
|--------|--------------|--------|-------|-----|-------|----|----|-------|
| Content | `content.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | SCORM + media library |
| Exercises | `exercises.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Custom exercises/exams |
| Questions | `questions.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Question bank + bulk import |
| Templates | `templates.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Course templates |

---

## 🔥 Phase 4: Enrollments & Progress (Days 7-8)

**Backend Status:** Contracts pending (🔥 HIGH PRIORITY - User Priority #1)

| Entity | Contract File | Status | Types | API | Hooks | UI | Tests | Notes |
|--------|--------------|--------|-------|-----|-------|----|----|-------|
| Enrollments | `enrollments.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Program/course/class enrollments |
| Progress | `progress.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | **TOP PRIORITY - Progress tracking** |
| Content Attempts | `content-attempts.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Attempts + SCORM CMI |
| Learning Events | `learning-events.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Activity feeds |

---

## ⚡ Phase 5: Assessments & Results (Days 9-10)

**Backend Status:** Contracts pending

| Entity | Contract File | Status | Types | API | Hooks | UI | Tests | Notes |
|--------|--------------|--------|-------|-----|-------|----|----|-------|
| Exam Attempts | `exam-attempts.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Take exams + submit answers |
| Reports | `reports.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Completion + performance + transcript |

---

## 🔸 Phase 6: System & Settings (Days 11-12)

**Backend Status:** Contracts pending

| Entity | Contract File | Status | Types | API | Hooks | UI | Tests | Notes |
|--------|--------------|--------|-------|-----|-------|----|----|-------|
| Settings | `settings.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | System settings |
| Audit Logs | `audit-logs.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Audit trails |
| Permissions | `permissions.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Permission management |
| System | `system.contract.ts` | ⏳ Waiting | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Health + metrics |

---

## 📁 Frontend Implementation Structure

When implementing each entity from contract:

```
src/entities/{entity-name}/
├── model/
│   ├── types.ts              # TypeScript interfaces from contract
│   ├── use{Entity}.ts         # React Query hook
│   ├── use{Entity}List.ts     # List hook with pagination
│   ├── use{Entity}Mutation.ts # Create/update/delete hooks
│   └── {entity}Keys.ts        # Query keys
├── api/
│   └── {entity}Api.ts         # API client functions
├── ui/
│   ├── {Entity}Card.tsx       # Display component
│   ├── {Entity}List.tsx       # List component
│   ├── {Entity}Form.tsx       # Create/edit form
│   └── {Entity}Detail.tsx     # Detail view
├── lib/
│   └── {entity}Utils.ts       # Utility functions
└── index.ts                   # Public exports
```

---

## 🔄 Implementation Workflow (Per Contract)

### Step 1: Contract Received
```bash
# Monitor backend contracts directory
cd ~/github/cadencelms_api/contracts/api
ls -lt | head -5

# Read new contract
cat users.contract.ts
```

### Step 2: Create Types
```typescript
// src/entities/user/model/types.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'global-admin' | 'staff' | 'learner';
  // ... match contract exactly
}

export interface UserProfile extends User {
  departments?: string[];        // Staff only
  permissions?: string[];         // Staff only
  enrollments?: string[];         // Learner only
  profileImage?: string | null;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  profileImage?: string | null;
}
```

### Step 3: Build API Client
```typescript
// src/entities/user/api/userApi.ts
import { client } from '@/shared/api';
import { ApiResponse } from '@/shared/api/types';
import { UserProfile, UpdateProfilePayload } from '../model/types';

export async function getUserProfile(): Promise<UserProfile> {
  const response = await client.get<ApiResponse<UserProfile>>('/users/me');
  return response.data.data;
}

export async function updateUserProfile(
  payload: UpdateProfilePayload
): Promise<UserProfile> {
  const response = await client.put<ApiResponse<UserProfile>>(
    '/users/me',
    payload
  );
  return response.data.data;
}
```

### Step 4: Create React Query Hooks
```typescript
// src/entities/user/model/useUserProfile.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '../api/userApi';

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: userKeys.profile(),
    queryFn: getUserProfile,
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.profile(), data);
    },
  });
}
```

### Step 5: Build UI Components
```typescript
// src/entities/user/ui/UserProfileCard.tsx
import { useUserProfile, useUpdateUserProfile } from '../model/useUserProfile';

export function UserProfileCard() {
  const { data: profile, isLoading } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  if (isLoading) return <Skeleton />;
  if (!profile) return <ErrorState />;

  return (
    <Card>
      <h2>{profile.firstName} {profile.lastName}</h2>
      <p>{profile.email}</p>
      <p>Role: {profile.role}</p>
      {/* Edit form... */}
    </Card>
  );
}
```

### Step 6: Write Tests
```typescript
// src/entities/user/model/useUserProfile.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUserProfile } from './useUserProfile';

describe('useUserProfile', () => {
  it('fetches user profile', async () => {
    const { result } = renderHook(() => useUserProfile());

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      email: expect.any(String),
      firstName: expect.any(String),
      role: expect.stringMatching(/^(global-admin|staff|learner)$/),
    });
  });
});
```

### Step 7: Update This Tracker
```markdown
| Users | `users.contract.ts` | ✅ Complete | ✅ | ✅ | ✅ | ✅ | ✅ | Fully implemented |
```

---

## 📊 Progress Summary

**Total Contracts:** 23+
**Completed:** 0
**In Progress:** 0
**Ready to Implement:** 0
**Waiting for Contract:** 23

**Estimated Timeline:**
- Phase 1 (6 contracts): 3-4 days
- Phase 2 (5 contracts): 3-4 days
- Phase 3 (4 contracts): 2-3 days
- Phase 4 (4 contracts): 4-5 days (includes complex progress tracking UI)
- Phase 5 (2 contracts): 2-3 days
- Phase 6 (4 contracts): 2-3 days

**Total Estimated:** 16-22 days for full frontend implementation

---

## 🎯 Priority Queue

When multiple contracts arrive simultaneously, implement in this order:

### 🔥 Critical (Implement First)
1. **users.contract.ts** - Required for user context throughout app
2. **progress.contract.ts** - User's #1 priority

### ⚡ High (Implement Next)
3. **departments.contract.ts** - Required for course organization
4. **courses.contract.ts** - Core content management
5. **enrollments.contract.ts** - Core learner workflow
6. **content.contract.ts** - Content library

### 🔹 Medium (Implement After High)
7. **programs.contract.ts** - Program structure
8. **staff.contract.ts** - Admin features
9. **learners.contract.ts** - Admin features
10. **classes.contract.ts** - Scheduling

### 🔸 Low (Implement Last)
11. All Phase 5-6 contracts - Admin/system features

---

## 🔗 Related Documents

- **Backend Contracts:** `~/github/cadencelms_api/contracts/api/`
- **Backend Status:** `~/github/cadencelms_api/contracts/PENDING.md`
- **Backend Plan:** `~/github/cadencelms_api/devdocs/CONTRACT_IMPLEMENTATION_PLAN.md`
- **Coordination Guide:** `~/github/TEAM_COORDINATION_GUIDE.md`
- **Autonomous Setup:** `~/github/AUTONOMOUS_TEAM_SETUP.md`

---

## 📝 How to Update This File

**When Contract Received:**
```markdown
| Users | `users.contract.ts` | 📝 Ready | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | Contract received |
```

**When Starting Implementation:**
```markdown
| Users | `users.contract.ts` | 🔨 In Progress | 🔨 | 🔨 | 🔲 | 🔲 | 🔲 | Implementing... |
```

**When Complete:**
```markdown
| Users | `users.contract.ts` | ✅ Complete | ✅ | ✅ | ✅ | ✅ | ✅ | Fully implemented |
```

---

**Status:** ⏳ Monitoring for Phase 1 contracts from backend team
**Next Action:** Implement first entity when contract arrives
**Current Focus:** Phase 1 - Core Identity & Organization
