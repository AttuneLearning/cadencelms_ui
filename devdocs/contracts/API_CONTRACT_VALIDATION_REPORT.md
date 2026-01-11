# API Contract Validation Report
## LMS UI v2 ↔ LMS Node V2 Backend

**Generated:** 2026-01-08
**Frontend:** `/home/adam/github/lms_ui/1_lms_ui_v2`
**Backend:** `/home/adam/github/lms_node/1_LMS_Node_V2`

---

## 🚨 Executive Summary

**CRITICAL:** Significant API contract mismatches detected between frontend and backend implementations. The backend appears to be designed for a traditional academic LMS, while the frontend is designed for a modern e-learning platform. **Major refactoring required** on either backend or frontend before integration.

### Severity Levels
- 🔴 **CRITICAL**: Breaking changes, incompatible data structures
- 🟡 **WARNING**: Minor differences, requires adaptation
- 🟢 **OK**: Contracts align

---

## 1. Authentication Endpoints

### Status: 🟡 **WARNING** - Partially Compatible

#### 1.1 Login Endpoint

**Frontend Expectation:**
```typescript
POST /auth/login
Request: { email: string, password: string }
Response: {
  data: {
    accessToken: string;
    role: 'learner' | 'staff' | 'global-admin';
    roles: Role[];
  }
}
```

**Backend Implementation:**
```typescript
POST /api/v2/auth/login
Request: { email: string, password: string }
Response: {
  status: 'success',
  message: 'Login successful',
  data: {
    user: IUser,
    staff?: object,
    learner?: object,
    accessToken: string,
    refreshToken: string
  }
}
```

**Issues:**
1. 🟡 **Base Path Mismatch**: Frontend uses `/auth/*`, Backend uses `/api/v2/auth/*`
2. 🟡 **Response Structure**: Backend wraps in `{ status, message, data }`, Frontend expects direct data
3. 🟡 **Role Types**: Backend uses `'instructor' | 'content-admin' | 'department-admin' | 'billing-admin' | 'system-admin'`, Frontend expects `'learner' | 'staff' | 'global-admin'`
4. 🟡 **Extra Data**: Backend returns `user`, `staff`, and `learner` objects that frontend doesn't expect
5. 🟡 **Refresh Token**: Backend returns `refreshToken` in response body, unclear if frontend handles this

#### 1.2 Refresh Token Endpoint

**Frontend Expectation:**
```typescript
POST /auth/refresh
Response: { data: { accessToken: string } }
```

**Backend Implementation:**
```typescript
POST /api/v2/auth/refresh
Request: { refreshToken: string }
Response: {
  status: 'success',
  data: {
    accessToken: string,
    refreshToken: string
  }
}
```

**Issues:**
1. 🟡 **Request Body**: Backend expects `refreshToken` in body, frontend doesn't specify
2. 🟡 **Response**: Backend returns both `accessToken` and `refreshToken`, frontend only expects `accessToken`

#### 1.3 Logout Endpoint

**Frontend Expectation:**
```typescript
POST /auth/logout
```

**Backend Implementation:**
```typescript
POST /api/v2/auth/logout
Requires: Bearer token in headers
```

**Issues:**
1. 🟢 **Compatible** - Both expect authenticated request with no body

#### 1.4 Get Current User

**Frontend Expectation:**
```typescript
GET /auth/me
Response: {
  data: {
    _id: string,
    email: string,
    roles: ('learner' | 'staff' | 'global-admin')[]
  }
}
```

**Backend Implementation:**
```typescript
GET /api/v2/auth/me
Response: {
  status: 'success',
  data: {
    user: { _id, email, roles, isActive, createdAt, updatedAt },
    staff?: object,
    learner?: object,
    accessToken: '',
    refreshToken: ''
  }
}
```

**Issues:**
1. 🟡 **Extra Fields**: Backend returns timestamps, `isActive`, and related staff/learner objects
2. 🟡 **Role Format**: See role mismatch above

---

## 2. Course Endpoints

### Status: 🔴 **CRITICAL** - Completely Incompatible

#### 2.1 Data Model Comparison

**Frontend Course Model:**
```typescript
interface Course {
  _id: string;
  title: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  duration?: number; // minutes
  level?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  tags?: string[];
  prerequisites?: string[];
  learningObjectives?: string[];
  isPublished: boolean;
  publishedAt?: string;
  lessonCount?: number;
  enrollmentCount?: number;
  completionRate?: number;
}
```

**Backend Course Model:**
```typescript
interface ICourse {
  name: string;              // ❌ Frontend uses 'title'
  code: string;              // ❌ Not in frontend
  description?: string;       // ✅ Match
  departmentId: ObjectId;    // ❌ Not in frontend
  credits: number;           // ❌ Not in frontend
  prerequisites?: ObjectId[]; // ⚠️ Frontend uses string[], backend uses ObjectId[]
  isActive: boolean;         // ⚠️ Frontend uses 'status' enum
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Critical Differences:**
- 🔴 **Field Name**: `name` vs `title`
- 🔴 **Course Structure**: Backend is academic (departments, credits), Frontend is e-learning (levels, categories, tags)
- 🔴 **Missing Fields**: Frontend expects `thumbnail`, `shortDescription`, `level`, `category`, `tags`, `learningObjectives`, `lessonCount`, `enrollmentCount` - NONE exist in backend
- 🔴 **Extra Fields**: Backend has `code`, `departmentId`, `credits` - NOT used by frontend
- 🔴 **Status Field**: Backend uses `isActive: boolean`, Frontend uses `status: 'draft' | 'published' | 'archived'`

#### 2.2 Endpoint Comparison

**Frontend Expected Endpoints:**
```
GET    /courses              - List courses (paginated, filtered)
GET    /courses/:id          - Get course details
GET    /courses/my-courses   - Get enrolled courses
POST   /courses              - Create course (admin)
PUT    /courses/:id          - Update course (admin)
DELETE /courses/:id          - Delete course (admin)
POST   /courses/:id/enroll   - Enroll in course
POST   /courses/:id/unenroll - Unenroll from course
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No course routes exist in backend
- 🔴 **Controllers Empty** - `/src/controllers/courses/` directory is empty
- 🔴 **Services Empty** - `/src/services/courses/` directory is empty

---

## 3. Lesson Endpoints

### Status: 🔴 **CRITICAL** - Not Implemented

**Frontend Expected Endpoints:**
```
GET  /courses/:courseId/lessons              - List lessons
GET  /courses/:courseId/lessons/:lessonId    - Get lesson
POST /courses/:courseId/lessons/:lessonId/complete - Mark complete
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No lesson routes, controllers, or services
- ❌ **No Lesson Model** - Backend doesn't have a Lesson model at all

---

## 4. Content Endpoints

### Status: 🔴 **CRITICAL** - Model Mismatch

#### 4.1 Content Type Comparison

**Frontend ContentType:**
```typescript
type ContentType = 'video' | 'document' | 'scorm' | 'quiz' | 'assignment' | 'external-link';
```

**Backend ContentType:**
```typescript
type ContentType = 'scorm' | 'video' | 'document' | 'quiz' | 'assignment' | 'external-link' | 'text';
```

**Differences:**
- 🟡 Backend includes `'text'` type not used by frontend
- 🟢 All other types match

#### 4.2 Data Model Comparison

**Frontend Content Model:**
```typescript
interface Content {
  _id: string;
  title: string;
  description?: string;
  type: ContentType;
  status: 'draft' | 'published' | 'archived';  // ❌ Not in backend
  fileUrl?: string;
  externalUrl?: string;              // ❌ Not in backend
  mimeType?: string;
  fileSize?: number;
  duration?: number;
  transcript?: string;               // ❌ Not in backend
  metadata?: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDownloadable?: boolean;          // ❌ Not in backend
  thumbnailUrl?: string;             // ❌ Not in backend
}
```

**Backend Content Model:**
```typescript
interface IContent {
  title: string;
  description?: string;
  type: ContentType;
  fileUrl?: string;
  fileSize?: number;
  mimeType?: string;
  duration?: number;
  scormData?: ISCORMData;            // ❌ Not in frontend top level
  quizData?: IQuizData;              // ❌ Not in frontend top level
  createdBy?: ObjectId;              // ⚠️ Frontend uses string
  updatedBy?: ObjectId;              // ❌ Not in frontend
  isActive: boolean;                 // ⚠️ Frontend uses 'status'
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}
```

**Issues:**
- 🟡 **Status Field**: Backend uses `isActive: boolean`, Frontend uses `status` enum
- 🟡 **Missing Frontend Fields**: `externalUrl`, `transcript`, `thumbnailUrl`, `isDownloadable`
- 🟡 **Extra Backend Fields**: `scormData`, `quizData`, `updatedBy`

#### 4.3 Endpoints

**Frontend Expected:**
```
GET    /content            - List content
GET    /content/:id        - Get content
POST   /content            - Create content
PUT    /content/:id        - Update content
DELETE /content/:id        - Delete content
POST   /content/scorm/upload - Upload SCORM package
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No content routes
- 🔴 **Controllers Empty** - `/src/controllers/content/` directory is empty
- 🔴 **Services Empty** - `/src/services/content/` directory is empty

---

## 5. Enrollment Endpoints

### Status: 🔴 **CRITICAL** - Model Incompatibility

#### 5.1 Enrollment Model Comparison

**Frontend Enrollment Model:**
```typescript
// Frontend expects course-based enrollments
{
  _id: string;
  userId: string;
  courseId: string;
  status: string;
  enrolledAt: string;
  progress?: number;
}
```

**Backend Enrollment Model:**
```typescript
// Backend implements program-based enrollments
interface IEnrollment {
  learnerId: ObjectId;
  programId: ObjectId;          // ❌ Not courses!
  academicYearId: ObjectId;     // ❌ Not in frontend
  status: 'pending' | 'active' | 'suspended' | 'withdrawn' | 'completed' | 'graduated';
  enrollmentDate: Date;
  startDate?: Date;
  completionDate?: Date;
  graduationDate?: Date;
  withdrawalDate?: Date;
  withdrawalReason?: string;
  currentTerm?: string;         // ❌ Academic concept
  cumulativeGPA?: number;       // ❌ Academic concept
  totalCreditsEarned?: number;  // ❌ Academic concept
}
```

**Critical Differences:**
- 🔴 **Fundamental Mismatch**: Backend enrolls learners in *programs*, Frontend enrolls users in *courses*
- 🔴 **Different Entity**: Backend ties to `Program` and `AcademicYear`, Frontend ties to `Course`
- 🔴 **Academic Focus**: Backend tracks GPA, credits, terms - NOT relevant to frontend

#### 5.2 Endpoints

**Frontend Expected:**
```
GET  /enrollments/my-courses  - Get user's enrolled courses
POST /courses/:id/enroll      - Enroll in course
POST /courses/:id/unenroll    - Unenroll from course
GET  /enrollments/:courseId/check - Check enrollment status
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No enrollment routes
- 🔴 **Model Mismatch** - Enrollment model is incompatible

---

## 6. User/Profile Endpoints

### Status: 🟡 **WARNING** - Needs Mapping

**Frontend Expected:**
```
GET  /users/profile          - Get current user profile
PUT  /users/profile          - Update profile
GET  /admin/users            - List users (admin)
POST /admin/users            - Create user (admin)
PUT  /admin/users/:id        - Update user (admin)
DELETE /admin/users/:id      - Delete user (admin)
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No user routes
- 🟢 **Models Exist** - User, Staff, Learner models are implemented
- 🔴 **Controllers Empty** - `/src/controllers/users/` directory is empty

---

## 7. Analytics Endpoints

### Status: 🔴 **CRITICAL** - Not Implemented

**Frontend Expected:**
```
GET /analytics/user-progress
GET /analytics/courses/:courseId/stats
GET /analytics/learning-path
GET /progress/stats
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No analytics routes, controllers, or services

---

## 8. Admin Endpoints

### Status: 🔴 **CRITICAL** - Not Implemented

**Frontend Expected:**
```
GET /admin/reports/overview
GET /admin/reports/course-completion
GET /admin/reports/user-activity
```

**Backend Status:**
- 🔴 **NOT IMPLEMENTED** - No admin routes (except potentially under auth)

---

## 9. API Response Format

### Status: 🟡 **WARNING** - Wrapper Mismatch

**Frontend Expectation:**
```typescript
// Direct data response
interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number; // HTTP status
}

// Paginated responses
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

**Backend Implementation:**
```typescript
// Wrapped response
interface ApiSuccessResponse<T> {
  status: 'success';
  message?: string;
  data: T;
  pagination?: PaginationInfo;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

**Issues:**
1. 🟡 **Status Field**: Backend uses `status: 'success'` string, Frontend uses `status: number` (HTTP code)
2. 🟡 **Pagination Field Names**:
   - Backend: `page`, `limit`, `total`, `hasNext`, `hasPrev`
   - Frontend: `currentPage`, `pageSize`, `totalCount`, `hasNextPage`, `hasPreviousPage`

---

## 10. Summary of Issues

### Critical (Blocking) Issues

1. 🔴 **Course Model Incompatibility**
   - Backend designed for academic courses (departments, credits, codes)
   - Frontend designed for e-learning courses (levels, categories, thumbnails)
   - **Recommendation**: Redesign backend Course model to match frontend, OR redesign frontend to match backend academic model

2. 🔴 **Enrollment Model Mismatch**
   - Backend: Program-based enrollments with academic tracking
   - Frontend: Course-based enrollments with simple progress
   - **Recommendation**: Create new CourseEnrollment model in backend separate from program Enrollment

3. 🔴 **Missing Backend Implementation**
   - No routes for: Courses, Lessons, Content, Enrollments, Users, Analytics, Admin
   - Only Auth routes are implemented
   - **Recommendation**: Implement all missing routes and controllers

4. 🔴 **No Lesson Concept**
   - Frontend expects lessons within courses
   - Backend has no lesson model or concept
   - **Recommendation**: Create Lesson model and CRUD operations

### Major (Important) Issues

1. 🟡 **API Base Path Mismatch**
   - Backend uses `/api/v2/*`, Frontend expects `/*`
   - **Fix**: Configure frontend API client base URL to `/api/v2`

2. 🟡 **Response Wrapper Format**
   - Different status field formats
   - Different pagination field names
   - **Fix**: Create adapter layer in frontend client or modify backend response format

3. 🟡 **Role Type Mismatch**
   - Backend has 6 detailed roles, Frontend has 3 simplified roles
   - **Fix**: Create role mapping layer

### Minor Issues

1. 🟢 **ContentType**: Backend includes 'text' type, easily handled
2. 🟢 **Authentication Flow**: Core auth works, just needs response adaptation

---

## 11. Recommended Actions

### Option A: Modify Backend (Recommended)

**Pros:**
- Frontend is feature-complete and tested
- Backend is still being implemented
- Easier to modify backend at this stage

**Actions:**
1. ✅ **Redesign Course Model** - Change to match frontend e-learning model
2. ✅ **Create Lesson Model** - Add lesson entity with relation to courses
3. ✅ **Create CourseEnrollment Model** - Separate from Program enrollment
4. ✅ **Implement All Routes** - Add missing controllers and services
5. ✅ **Align Response Format** - Match frontend expectations for wrappers
6. ✅ **Adjust Pagination Fields** - Use frontend naming convention

**Estimated Effort:** 3-5 days

### Option B: Modify Frontend

**Pros:**
- Backend models are well-designed for academic LMS
- Full test coverage exists for backend

**Cons:**
- Frontend is already built and tested
- Requires significant rework of UI components and state management

**Actions:**
1. ⚠️ Redesign Course entity in frontend
2. ⚠️ Remove Lesson concept or map to backend equivalent
3. ⚠️ Change enrollment to program-based
4. ⚠️ Update all API calls and types

**Estimated Effort:** 5-7 days

### Option C: Create Adapter Layer (Compromise)

**Pros:**
- Keeps both codebases as-is
- Allows independent evolution

**Cons:**
- Adds complexity
- Performance overhead
- Maintenance burden

**Actions:**
1. Create backend API adapter service
2. Map academic Course → e-learning Course
3. Map Program enrollment → Course enrollment
4. Transform response formats

**Estimated Effort:** 2-3 days

---

## 12. Decision Required

⚠️ **The frontend and backend cannot communicate without significant changes to one or both systems.**

Please decide on:
1. Which system should be modified?
2. Timeline for modifications
3. Whether to create an adapter layer as temporary solution

---

**Report End**
