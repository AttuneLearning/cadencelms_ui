# Dual Team Operation Guide
## Running Backend & Frontend Teams Simultaneously

**Date:** 2026-01-08
**Status:** Ready to Operate

---

## ✅ Configuration Status

### Backend Team (`~/github/cadencelms_api`)
- **Team Config:** ✅ `/.claude/team-config.json`
- **Agents:** 4 (backend-lead, backend-models, backend-services, backend-qa)
- **Working Dir:** `~/github/cadencelms_api/`

### Frontend Team (`~/github/lms_ui/1_lms_ui_v2`)
- **Team Config:** ✅ `/.claude/team-config.json` (just created)
- **Agents:** 5 (frontend-lead, frontend-entities, frontend-features, frontend-ui, frontend-qa)
- **Working Dir:** `~/github/lms_ui/1_lms_ui_v2/`

---

## No Conflicts - Here's Why

### 1. **Separate Agent IDs**

**Backend agents:**
```
- backend-lead
- backend-models
- backend-services
- backend-qa
```

**Frontend agents:**
```
- frontend-lead
- frontend-entities
- frontend-features
- frontend-ui
- frontend-qa
```

✅ No overlap - Claude Code will treat them as separate agents

### 2. **Separate Working Directories**

**Backend:**
```
~/github/cadencelms_api/src/
~/github/cadencelms_api/contracts/
~/github/cadencelms_api/tests/
```

**Frontend:**
```
~/github/lms_ui/1_lms_ui_v2/src/
~/github/lms_ui/1_lms_ui_v2/tests/
```

✅ No overlap - teams work in their own directories

### 3. **Shared Contract Directory**

**Both teams reference:**
```
~/github/cadencelms_api/contracts/
```

- ✅ Backend team **writes** contracts
- ✅ Frontend team **reads** contracts
- ✅ Read-only from frontend = no conflicts

### 4. **Shared Devdocs (Read-Only)**

**Both teams reference:**
```
~/github/cadencelms_api/devdocs/
- Ideal_TypeScript_DataStructures.md
- Ideal_RestfulAPI_toCurrent_Crosswalk.md
- Ideal_MongoDB_DataObjects.md
- API_Endpoint_Normalization_Plan.md
```

✅ Both teams read specs - no write conflicts

---

## How Teams Coordinate

### Contract-Driven Development

```
┌─────────────────┐         ┌──────────────────┐
│  Backend Team   │────────▶│   contracts/     │
│   (Produces)    │  writes │   - api/         │
│                 │         │   - types/       │
└─────────────────┘         │   - openapi.json │
                            └──────────────────┘
                                     │
                                     │ reads
                                     ▼
                            ┌──────────────────┐
                            │  Frontend Team   │
                            │   (Consumes)     │
                            └──────────────────┘
```

### Workflow

**Backend Team:**
1. Implements model → service → controller → route
2. Exports contract to `/contracts/api/<resource>.json`
3. Updates OpenAPI spec
4. Commits with message: `feat(api): add courses endpoint`

**Frontend Team:**
1. Reads contract from `/contracts/api/<resource>.json`
2. Implements TypeScript types matching contract
3. Implements API client
4. Builds UI components
5. Tests against backend (or mocks)

---

## Starting Both Teams

### Terminal 1: Backend Team
```bash
cd ~/github/cadencelms_api
claude code

# In Claude Code:
"I'm backend-lead. Let's implement the courses API following the spec in devdocs/"
```

### Terminal 2: Frontend Team
```bash
cd ~/github/lms_ui/1_lms_ui_v2
claude code

# In Claude Code:
"I'm frontend-lead. Let's build entity modules based on backend contracts in ../cadencelms_api/contracts/"
```

**Both can run simultaneously without conflicts!**

---

## Team Responsibilities

### Backend Team (4 agents)

| Agent | Focus | Outputs |
|-------|-------|---------|
| **backend-lead** | Architecture, contracts, coordination | API designs, contract files |
| **backend-models** | Mongoose models, migrations | Model files, indexes, validation |
| **backend-services** | Business logic, controllers, routes | Service classes, controllers, routes |
| **backend-qa** | Testing, validation | Unit tests, integration tests |

### Frontend Team (5 agents)

| Agent | Focus | Outputs |
|-------|-------|---------|
| **frontend-lead** | Architecture, contract validation | Entity designs, type definitions |
| **frontend-entities** | Models, API clients, hooks | Entity modules, API functions, React Query hooks |
| **frontend-features** | Business logic, forms, state | Feature modules, Zustand stores |
| **frontend-ui** | Pages, layouts, components | Page components, UI components |
| **frontend-qa** | Testing, accessibility | Component tests, E2E tests, A11y validation |

---

## Communication Between Teams

### Method 1: Contracts Directory ✅
```
~/github/cadencelms_api/contracts/
├── api/
│   ├── courses.json          ← Backend writes, Frontend reads
│   ├── departments.json
│   └── programs.json
├── types/
│   └── shared-types.ts       ← Shared TypeScript types
└── openapi.json              ← Full API spec
```

### Method 2: Git Commits
- Backend commits include: `[CONTRACT]` tag when contracts change
- Frontend watches for these commits
- Frontend pulls latest contracts before building

### Method 3: Validation Scripts
```bash
# Frontend runs this to validate against backend
npm run validate:contracts

# Checks:
# 1. All referenced endpoints exist in backend contracts
# 2. All TypeScript types match backend models
# 3. No missing required fields
```

---

## Preventing Issues

### ✅ DO:
- **Backend:** Export contracts immediately after implementing endpoints
- **Frontend:** Read contracts before implementing entities
- **Both:** Use the same field names (e.g., `_id`, not `id`)
- **Both:** Use the same enums/status values
- **Both:** Follow the naming conventions in devdocs

### ❌ DON'T:
- **Backend:** Change contracts without updating contract files
- **Frontend:** Make assumptions about data structures
- **Frontend:** Rename fields for "convenience"
- **Both:** Skip validation steps
- **Both:** Implement features not in the spec

---

## Monitoring Progress

### Backend Progress
```bash
cd ~/github/cadencelms_api

# Check implemented routes
grep -r "app.use" src/app.ts

# Check controllers
ls src/controllers/*/

# Check tests
npm test
```

### Frontend Progress
```bash
cd ~/github/lms_ui/1_lms_ui_v2

# Check entities
ls src/entities/

# Check API integration
npm run build

# Check tests
npm test
```

### Integration Check
```bash
# Backend: Start server
cd ~/github/cadencelms_api
npm run dev

# Frontend: Run against real backend
cd ~/github/lms_ui/1_lms_ui_v2
VITE_API_URL=http://localhost:3000 npm run dev

# Test E2E
npm run test:e2e
```

---

## Example: Building Courses Feature

### Backend Team (Day 1-2)

**backend-models:**
```bash
# Already done - Course.model.ts exists ✅
```

**backend-services:**
```typescript
// Implements: src/services/courses/course.service.ts
// - getCourses(filters)
// - getCourse(id)
// - createCourse(data)
// - updateCourse(id, data)
// - deleteCourse(id)
// - publishCourse(id)
```

**backend-services:**
```typescript
// Implements: src/controllers/courses/course.controller.ts
// Implements: src/routes/course.routes.ts
// Registers: app.use('/api/v2/courses', courseRoutes)
```

**backend-lead:**
```json
// Exports: contracts/api/courses.json
{
  "resource": "courses",
  "baseUrl": "/api/v2/courses",
  "endpoints": [
    {
      "method": "GET",
      "path": "/",
      "query": ["page", "limit", "departmentId", "status"],
      "response": {
        "type": "PaginatedResponse<Course>",
        "status": 200
      }
    },
    // ... more endpoints
  ]
}
```

### Frontend Team (Day 2-3, parallel)

**frontend-lead:**
```typescript
// Reads: ../cadencelms_api/contracts/api/courses.json
// Reads: ../cadencelms_api/devdocs/Ideal_TypeScript_DataStructures.md
// Creates design for: src/entities/course/
```

**frontend-entities:**
```typescript
// Implements: src/entities/course/model/types.ts
export interface Course {
  _id: string;
  name: string;              // From contract: "name" not "title"
  code: string;              // From contract
  departmentId: string;      // From contract
  credits: number;           // From contract
  // ... all fields from contract
}

// Implements: src/entities/course/api/courseApi.ts
export async function getCourses(params?: CourseQueryParams) {
  const response = await client.get('/api/v2/courses', { params });
  return response.data;
}

// Implements: src/entities/course/model/useCourses.ts
export function useCourses(params?: CourseQueryParams) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => getCourses(params)
  });
}
```

**frontend-ui:**
```typescript
// Implements: src/pages/admin/courses/CourseListPage.tsx
// Uses: useCourses() hook
// Displays: Course data in table
```

---

## Success Criteria

### ✅ Teams Are Working Well When:
1. Backend exports contracts after every endpoint
2. Frontend reads contracts before implementing
3. No type mismatches between frontend and backend
4. Integration tests pass
5. E2E tests pass against real backend
6. Both teams stay in their directories
7. Clear git history for both projects

### 🚨 Teams Need Alignment When:
1. Frontend can't find expected endpoints
2. Type errors when integrating
3. Field names don't match
4. Status values differ
5. Contract files are outdated
6. Tests fail during integration

---

## Quick Reference

### Backend Starts First
```bash
cd ~/github/cadencelms_api
claude code
# "backend-lead: implement courses API per spec"
```

### Frontend Follows
```bash
cd ~/github/lms_ui/1_lms_ui_v2
claude code
# "frontend-lead: build course entity from backend contract"
```

### Both Work in Parallel
- Backend implements → exports contracts
- Frontend reads contracts → implements UI
- Both meet at integration testing

---

## Summary

✅ **Configurations are compatible**
✅ **No conflicts in agent IDs**
✅ **Clear separation of responsibilities**
✅ **Shared contracts directory for coordination**
✅ **Both teams can run simultaneously**

**Ready to start dual-team development!**
