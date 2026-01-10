# API Endpoint Centralization Migration Plan

**Date:** 2026-01-09
**Status:** 📋 PLANNING
**Priority:** 🟡 Medium (Architectural Improvement)

---

## Executive Summary

This plan outlines the migration from **hardcoded endpoint paths** in individual API files to a **centralized endpoint management system** using `/src/shared/api/endpoints.ts` as the single source of truth.

### Current State
- ✅ All paths now follow correct pattern (no `/api/v2` prefix)
- ❌ 23 entity API files have hardcoded endpoint strings
- ⚠️ Changes to endpoints require editing multiple files
- ⚠️ No type safety for endpoint strings

### Target State
- ✅ Single source of truth for all endpoints
- ✅ Type-safe endpoint access
- ✅ Easy to update and maintain
- ✅ Consistent pattern across codebase

---

## Problem Statement

### Current Pattern (Hardcoded)
```typescript
// src/entities/enrollment/api/enrollmentApi.ts
export async function listEnrollments(filters?: EnrollmentFilters) {
  const response = await client.get<ApiResponse<EnrollmentsListResponse>>(
    '/enrollments',  // ❌ Hardcoded string
    { params: filters }
  );
  return response.data.data;
}
```

### Target Pattern (Centralized)
```typescript
// src/entities/enrollment/api/enrollmentApi.ts
import { endpoints } from '@/shared/api/endpoints';

export async function listEnrollments(filters?: EnrollmentFilters) {
  const response = await client.get<ApiResponse<EnrollmentsListResponse>>(
    endpoints.enrollments.list,  // ✅ Centralized, type-safe
    { params: filters }
  );
  return response.data.data;
}
```

---

## Benefits

### 1. Single Source of Truth
- All endpoints defined in one file
- Easy to see all API routes at a glance
- Changes propagate automatically

### 2. Type Safety
- TypeScript autocomplete for endpoints
- Catch typos at compile time
- Refactoring is safer

### 3. Maintainability
- Backend API changes require updating only one file
- Easier onboarding for new developers
- Consistent naming conventions

### 4. Discoverability
- Developers can explore available endpoints
- Documentation is implicit in the structure
- Reduces duplication

---

## Current Endpoint Coverage

### ✅ Already in endpoints.ts (Partial Coverage)

```typescript
endpoints = {
  auth: { login, logout, refresh, me },
  courses: { list, byId, myCourses, enroll, progress },
  courseSegments: { list, byId, create, update, delete, reorder },
  lessons: { list, byId, complete },
  enrollments: { list, byId, myCourses },
  users: { list, byId, profile, updateProfile },
  content: { scormPackages, uploadScorm, byId },
  admin: {
    users, staff, learners, departments, academicYears, courses, reports
  },
  analytics: { userProgress, courseStats, learningPath },
  progress: { stats },
  classes: { list, byId, roster, enrollments, progress },
  learningEvents: { list, byId, create, createBatch, stats },
  examAttempts: { list, byId, create, submitAnswers, results, grade }
}
```

### ❌ Missing from endpoints.ts

Based on the 23 API files, these entities are NOT in the centralized file:

1. **academic-year** - Calendar years, terms, cohorts
2. **content-attempt** - SCORM/video content tracking
3. **course-segment** - Modules within courses (partially covered)
4. **department** - Already in admin.departments, needs entity section
5. **exercise** - Quiz/exercise management
6. **learner** - Learner entity (different from admin.learners)
7. **learner-management** - Admin learner operations
8. **learning-event** - Already covered
9. **lesson** - Already covered
10. **program** - Program entity
11. **program-level** - Program levels within programs
12. **question** - Question bank
13. **staff** - Staff entity (different from admin.staff)
14. **staff-management** - Admin staff operations
15. **template** - Course/content templates
16. **user** - User entity operations
17. **user-profile** - User profile management

---

## Migration Strategy

### Phase 1: Expand endpoints.ts (Week 1)
**Goal:** Add all missing endpoints to centralized file

**Tasks:**
1. Audit all 23 API files for their endpoints
2. Add missing entities to `endpoints.ts`
3. Group by logical categories (entities, admin, features)
4. Ensure naming consistency

**Example additions:**
```typescript
export const endpoints = {
  // ... existing ...

  // Entity endpoints
  programs: {
    list: '/programs',
    byId: (id: string) => `/programs/${id}`,
    create: '/programs',
    update: (id: string) => `/programs/${id}`,
    delete: (id: string) => `/programs/${id}`,
    levels: (id: string) => `/programs/${id}/levels`,
  },

  exercises: {
    list: '/content/exercises',
    byId: (id: string) => `/content/exercises/${id}`,
    create: '/content/exercises',
    update: (id: string) => `/content/exercises/${id}`,
    delete: (id: string) => `/content/exercises/${id}`,
    questions: (id: string) => `/content/exercises/${id}/questions`,
  },

  contentAttempts: {
    list: '/content-attempts',
    byId: (id: string) => `/content-attempts/${id}`,
    create: '/content-attempts',
    updateProgress: (id: string) => `/content-attempts/${id}/progress`,
    complete: (id: string) => `/content-attempts/${id}/complete`,
  },

  // ... more entities
} as const;
```

### Phase 2: Migrate High-Priority APIs (Week 2)
**Goal:** Migrate most-used API files

**Priority order:**
1. ✅ **enrollment** - Already used by MyCoursesPage (HIGH PRIORITY)
2. **progress** - Used across learner/staff pages
3. **course** - Core entity used everywhere
4. **content** - Used by course player
5. **class** - Used by staff features

**For each file:**
1. Import `endpoints` from `@/shared/api/endpoints`
2. Replace hardcoded strings with endpoint references
3. Test the API calls still work
4. Run TypeScript check
5. Commit changes

**Migration template:**
```typescript
// Before
const response = await client.get('/enrollments');

// After
import { endpoints } from '@/shared/api/endpoints';
const response = await client.get(endpoints.enrollments.list);
```

### Phase 3: Migrate Remaining APIs (Week 3)
**Goal:** Complete migration for all API files

**Files to migrate:**
- Academic year, department, learner, staff entities
- Exercise, question, template management
- Program and program levels
- User profile management

### Phase 4: Add Developer Tooling (Week 3)
**Goal:** Prevent regression

**Tasks:**
1. Add ESLint rule to detect hardcoded `/` paths in API calls
2. Document the pattern in developer guide
3. Add pre-commit hook to check for violations
4. Update onboarding docs

---

## Step-by-Step Migration Process

### For Each API File:

#### 1. Analyze Current Endpoints
```bash
# Find all client.get/post/put/delete calls
grep -n "client\.\(get\|post\|put\|delete\)" src/entities/enrollment/api/enrollmentApi.ts
```

#### 2. Add to endpoints.ts
```typescript
// Add missing endpoints with proper structure
enrollments: {
  list: '/enrollments',
  byId: (id: string) => `/enrollments/${id}`,
  program: '/enrollments/program',
  course: '/enrollments/course',
  // ... etc
}
```

#### 3. Update API File
```typescript
// Add import
import { endpoints } from '@/shared/api/endpoints';

// Replace hardcoded paths
- const response = await client.get('/enrollments');
+ const response = await client.get(endpoints.enrollments.list);

- const response = await client.get(`/enrollments/${id}`);
+ const response = await client.get(endpoints.enrollments.byId(id));
```

#### 4. Test
```bash
# Run TypeScript check
npm run type-check

# Test the specific feature in browser
# Verify API calls work in Network tab
```

#### 5. Commit
```bash
git add -A
git commit -m "refactor(api): migrate enrollment API to use centralized endpoints"
```

---

## Migration Checklist

### ✅ Phase 0: Foundation (COMPLETED)
- [x] Fix doubled `/api/v2` path issue
- [x] Establish correct relative path pattern
- [x] Document pattern in endpoints.ts

### 📋 Phase 1: Expand endpoints.ts
- [ ] Audit all 23 API files
- [ ] Add programs endpoints
- [ ] Add exercises endpoints
- [ ] Add contentAttempts endpoints
- [ ] Add questions endpoints
- [ ] Add templates endpoints
- [ ] Add programLevels endpoints
- [ ] Add academicYear endpoints
- [ ] Add userProfile endpoints
- [ ] Review and organize structure
- [ ] Add JSDoc comments for each section

### 📋 Phase 2: Migrate High-Priority (5 files)
- [ ] Migrate enrollmentApi.ts
- [ ] Migrate progressApi.ts
- [ ] Migrate courseApi.ts
- [ ] Migrate contentApi.ts
- [ ] Migrate classApi.ts
- [ ] Test all migrated endpoints
- [ ] Run full TypeScript check

### 📋 Phase 3: Migrate Remaining (18 files)
- [ ] Migrate academicYearApi.ts
- [ ] Migrate contentAttemptApi.ts
- [ ] Migrate courseSegmentApi.ts
- [ ] Migrate departmentApi.ts
- [ ] Migrate examAttemptApi.ts
- [ ] Migrate exerciseApi.ts
- [ ] Migrate learnerApi.ts (entity)
- [ ] Migrate learnerApi.ts (management)
- [ ] Migrate learningEventApi.ts
- [ ] Migrate lessonApi.ts
- [ ] Migrate programApi.ts
- [ ] Migrate programLevelApi.ts
- [ ] Migrate questionApi.ts
- [ ] Migrate staffApi.ts (entity)
- [ ] Migrate staffApi.ts (management)
- [ ] Migrate templateApi.ts
- [ ] Migrate userApi.ts
- [ ] Migrate userProfileApi.ts
- [ ] Full integration test
- [ ] Documentation update

### 📋 Phase 4: Tooling & Prevention
- [ ] Add ESLint rule for hardcoded paths
- [ ] Update developer guide
- [ ] Add pre-commit hook
- [ ] Update PR template checklist
- [ ] Team training session

---

## Risk Assessment

### Low Risk ⚠️
- **Regression:** TypeScript will catch incorrect endpoint references
- **Testing:** Can test incrementally, one file at a time
- **Rollback:** Easy to revert individual commits

### Potential Issues
1. **Dynamic paths** - Some endpoints use complex dynamic segments
   - **Solution:** Use functions in endpoints.ts

2. **Naming conflicts** - Multiple entities may have similar names
   - **Solution:** Use nested structure (e.g., `entities.x`, `admin.x`)

3. **Circular dependencies** - If endpoints.ts imports types
   - **Solution:** Keep endpoints.ts as pure constants, no type imports

---

## Success Metrics

### Before Migration
- ❌ 23 API files with hardcoded strings
- ❌ ~150+ hardcoded endpoint strings total
- ❌ No autocomplete for endpoints
- ❌ Multiple places to update when API changes

### After Migration
- ✅ 1 source of truth (endpoints.ts)
- ✅ 23 API files using centralized endpoints
- ✅ Full TypeScript autocomplete
- ✅ API changes in 1 place

---

## Example: Complete Before/After

### Before
```typescript
// src/entities/course/api/courseApi.ts
import { client } from '@/shared/api/client';

export async function getCourses() {
  const response = await client.get('/courses');
  return response.data.data;
}

export async function getCourseById(id: string) {
  const response = await client.get(`/courses/${id}`);
  return response.data.data;
}

export async function createCourse(payload: CoursePayload) {
  const response = await client.post('/courses', payload);
  return response.data.data;
}

export async function updateCourse(id: string, payload: Partial<CoursePayload>) {
  const response = await client.put(`/courses/${id}`, payload);
  return response.data.data;
}
```

### After
```typescript
// src/entities/course/api/courseApi.ts
import { client } from '@/shared/api/client';
import { endpoints } from '@/shared/api/endpoints';

export async function getCourses() {
  const response = await client.get(endpoints.courses.list);
  return response.data.data;
}

export async function getCourseById(id: string) {
  const response = await client.get(endpoints.courses.byId(id));
  return response.data.data;
}

export async function createCourse(payload: CoursePayload) {
  const response = await client.post(endpoints.courses.create, payload);
  return response.data.data;
}

export async function updateCourse(id: string, payload: Partial<CoursePayload>) {
  const response = await client.put(endpoints.courses.update(id), payload);
  return response.data.data;
}
```

### Updated endpoints.ts
```typescript
// src/shared/api/endpoints.ts
export const endpoints = {
  // ... other endpoints ...

  courses: {
    list: '/courses',
    byId: (id: string) => `/courses/${id}`,
    create: '/courses',
    update: (id: string) => `/courses/${id}`,
    delete: (id: string) => `/courses/${id}`,
    myCourses: '/courses/my-courses',
    enroll: (id: string) => `/courses/${id}/enroll`,
    progress: (id: string) => `/courses/${id}/progress`,
  },
} as const;
```

---

## Timeline

| Phase | Duration | Effort | Dependencies |
|-------|----------|--------|--------------|
| Phase 1: Expand endpoints.ts | 2-3 days | 8 hours | None |
| Phase 2: Migrate high-priority | 3-4 days | 12 hours | Phase 1 |
| Phase 3: Migrate remaining | 5-7 days | 20 hours | Phase 2 |
| Phase 4: Tooling | 2-3 days | 8 hours | Phase 3 |
| **Total** | **12-17 days** | **48 hours** | - |

*Can be parallelized with other development work - not a blocker for features*

---

## Recommendation

**Proceed with migration in phases:**

1. ✅ **Now:** Foundation is complete (correct path pattern established)
2. **Next Sprint:** Phase 1 - Expand endpoints.ts with all missing endpoints
3. **Following Sprints:** Phases 2-3 - Migrate API files incrementally
4. **Final Sprint:** Phase 4 - Add tooling to prevent regression

**Priority:** Medium - This is a quality/maintainability improvement, not a critical bug fix. Can be done alongside feature development.

---

## Notes

- This migration does NOT change API behavior - purely refactoring
- Each API file can be migrated independently
- No breaking changes for consumers of the API functions
- Can pause/resume migration at any phase boundary
- Consider doing this during a code freeze or between major releases

---

## Related Documents

- `/src/shared/api/endpoints.ts` - Centralized endpoints file
- `/src/shared/api/client.ts` - Axios client with baseURL configuration
- Phase 4-7 Implementation Reports - Feature implementations using APIs

---

**Status:** Ready for Phase 1 execution
**Next Action:** Audit all API files and expand endpoints.ts
