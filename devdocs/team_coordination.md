# Team Coordination - Contract Alignment Sprint
**Date:** 2026-01-11
**Sprint:** Role System Contract Alignment
**Status:** Active

---

## Purpose

This document tracks all events, signals, checkpoints, and coordination between agents working on the contract alignment sprint.

---

## Event Registry

### Phase 1 Events

#### EVENT: `dept-api-ready`
- **Emitted by:** Track A (dept-api-agent)
- **When:** After `switchDepartment()` function added to authApi.ts and SwitchDepartmentResponse handling complete
- **Consumed by:** Track B (nav-store-agent)
- **Payload:**
  ```json
  {
    "event": "dept-api-ready",
    "timestamp": "2026-01-11T14:55:00Z",
    "trackId": "A",
    "agentId": "dept-api-agent",
    "deliverables": {
      "file": "src/entities/auth/api/authApi.ts",
      "function": "switchDepartment",
      "types": "SwitchDepartmentResponse in src/shared/types/auth.ts",
      "tests": "src/entities/auth/api/__tests__/authApi.test.ts",
      "testsPassing": true,
      "testCount": 16,
      "branch": "feature/contract-align/track-a/dept-api",
      "commit": "ff50eb3"
    }
  }
  ```
- **Status:** ✅ EMITTED (2026-01-11 14:55)

#### EVENT: `phase-1-track-a-complete`
- **Emitted by:** Track A (dept-api-agent)
- **When:** All Track A deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** ✅ EMITTED (2026-01-11 14:55)
- **Summary:** switchDepartment API verified, enhanced, and fully tested (16 tests passing)

#### EVENT: `phase-1-track-b-complete`
- **Emitted by:** Track B (nav-store-agent)
- **When:** All Track B deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** 🔲 Pending

---

### Phase 2 Events

#### EVENT: `dept-context-hook-ready`
- **Emitted by:** Track C (dept-context-agent)
- **When:** `useDepartmentContext()` hook created and exported
- **Consumed by:** Track D (ui-context-agent)
- **Payload:**
  ```json
  {
    "event": "dept-context-hook-ready",
    "timestamp": "ISO-8601",
    "trackId": "C",
    "agentId": "dept-context-agent",
    "deliverables": {
      "file": "src/shared/hooks/useDepartmentContext.ts",
      "exported": true,
      "returnType": "DepartmentContext"
    }
  }
  ```
- **Status:** 🔲 Pending

#### EVENT: `phase-2-track-c-complete`
- **Emitted by:** Track C (dept-context-agent)
- **When:** All Track C deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** 🔲 Pending

#### EVENT: `phase-2-track-d-complete`
- **Emitted by:** Track D (ui-context-agent)
- **When:** All Track D deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** 🔲 Pending

---

### Phase 3 Events

#### EVENT: `displayas-types-ready`
- **Emitted by:** Track E (types-displayas-agent)
- **When:** `UserTypeObject` and `RoleObject` interfaces added, LoginResponse updated
- **Consumed by:** Track F (store-displayas-agent)
- **Payload:**
  ```json
  {
    "event": "displayas-types-ready",
    "timestamp": "ISO-8601",
    "trackId": "E",
    "agentId": "types-displayas-agent",
    "deliverables": {
      "file": "src/shared/types/auth.ts",
      "types": ["UserTypeObject", "RoleObject"],
      "loginResponseUpdated": true
    }
  }
  ```
- **Status:** ⚠️ ERROR - Types missing (reported by Track F at 2026-01-11)

#### EVENT: `phase-3-track-e-complete`
- **Emitted by:** Track E (types-displayas-agent)
- **When:** All Track E deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** 🔲 Pending

#### EVENT: `phase-3-track-f-complete`
- **Emitted by:** Track F (store-displayas-agent)
- **When:** All Track F deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** 🔲 Pending

---

### Phase 4 Events

#### EVENT: `phase-4-track-g-complete`
- **Emitted by:** Track G (scoped-permissions-agent)
- **When:** All Track G deliverables complete and committed
- **Consumed by:** Integration coordinator
- **Status:** 🔲 Pending

---

## Synchronization Points

### Sync Point 1: Phase 1 Complete
**Timing:** End of Day 2
**Condition:** `phase-1-track-a-complete` AND `phase-1-track-b-complete`
**Participants:**
- Track A (dept-api-agent)
- Track B (nav-store-agent)

**Integration Tasks:**
1. Integration agent merges `feature/contract-align/track-a/*` → main
2. Integration agent merges `feature/contract-align/track-b/*` → main
3. Resolve conflicts if any
4. Run integration tests
5. Verify `switchDepartment()` works end-to-end

**Deliverables:**
- ✅ Department switching API integrated
- ✅ NavigationStore calls API on department selection
- ✅ Roles and accessRights cached from response

**Status:** 🔲 Pending

---

### Sync Point 2: Phase 2 Complete
**Timing:** End of Day 4
**Condition:** `phase-2-track-c-complete` AND `phase-2-track-d-complete` AND `phase-1-complete`
**Participants:**
- Track C (dept-context-agent)
- Track D (ui-context-agent)

**Dependencies:**
- ✅ Phase 1 must be complete (department switching working)

**Integration Tasks:**
1. Integration agent merges `feature/contract-align/track-c/*` → main
2. Integration agent merges `feature/contract-align/track-d/*` → main
3. Verify Header and Sidebar use new hook
4. Verify department context displays correctly

**Deliverables:**
- ✅ `useDepartmentContext()` hook available
- ✅ Header uses department context for role display
- ✅ Sidebar uses department context for navigation

**Status:** 🔲 Pending

---

### Sync Point 3: Phase 3 Complete
**Timing:** End of Day 4 (parallel with Phase 2)
**Condition:** `phase-3-track-e-complete` AND `phase-3-track-f-complete`
**Participants:**
- Track E (types-displayas-agent)
- Track F (store-displayas-agent)

**Integration Tasks:**
1. Integration agent merges `feature/contract-align/track-e/*` → main
2. Integration agent merges `feature/contract-align/track-f/*` → main
3. Verify login handles `UserTypeObject[]`
4. Verify Header displays server-provided labels

**Deliverables:**
- ✅ `UserTypeObject` and `RoleObject` types defined
- ✅ AuthStore handles object-based userTypes
- ✅ DisplayAs maps populated in RoleHierarchy
- ✅ Header uses server labels

**Status:** 🔲 Pending

---

### Sync Point 4: Phase 4 Complete
**Timing:** End of Day 6
**Condition:** `phase-4-track-g-complete` AND `phase-2-complete` AND `phase-3-complete`
**Participants:**
- Track G (scoped-permissions-agent)

**Dependencies:**
- ✅ Phase 2 complete (department context available)
- ✅ Phase 3 complete (displayAs integrated)

**Integration Tasks:**
1. Integration agent merges `feature/contract-align/track-g/*` → main
2. Verify scoped permission checks work
3. Verify sidebar links respect department permissions

**Deliverables:**
- ✅ `hasPermission()` supports department scope
- ✅ `usePermission()` hooks support scope
- ✅ Sidebar navigation uses scoped permissions

**Status:** 🔲 Pending

---

## Error Events

### ERROR: `track-a-api-incomplete`
- **Emitted by:** Track B (nav-store-agent)
- **When:** Track B attempts to use `switchDepartment()` API but it's not available/working
- **Action:** Track A investigates and fixes, then re-emits `dept-api-ready`

### ERROR: `dept-context-hook-missing`
- **Emitted by:** Track D (ui-context-agent)
- **When:** Track D attempts to import `useDepartmentContext` but it's not exported
- **Action:** Track C investigates and fixes, then re-emits `dept-context-hook-ready`

### ERROR: `displayas-types-missing`
- **Emitted by:** Track F (store-displayas-agent)
- **When:** Track F attempts to use `UserTypeObject` but types not defined
- **Action:** Track E investigates and fixes, then re-emits `displayas-types-ready`
- **Status:** ❌ ACTIVE (2026-01-11 - Track F waiting for Track E)

**Error Details:**
```
❌ ERROR: displayas-types-missing
From: store-displayas-agent (Track F)
Track: F
Issue: UserTypeObject and RoleObject types not found in src/shared/types/auth.ts
Waiting For: Track E (types-displayas-agent) to complete type definitions
Required Types:
  - UserTypeObject interface with _id and displayAs
  - RoleObject interface with displayAs
  - Updated LoginResponse.userTypes: UserTypeObject[]
  - userTypeDisplayMap in RoleHierarchy
  - roleDisplayMap in RoleHierarchy
```

### ERROR: `integration-conflict`
- **Emitted by:** Integration agent
- **When:** Merge conflicts occur during phase integration
- **Action:** Relevant track agents review and resolve conflicts

### ERROR: `test-coverage-insufficient`
- **Emitted by:** Any agent
- **When:** Test coverage < 85%
- **Action:** Agent writes additional tests to meet coverage target

---

## Progress Tracking

### Phase 1: Department Switching Integration

| Track | Agent | Branch | Status | Event Emitted | Committed | Tests Pass | Coverage |
|-------|-------|--------|--------|---------------|-----------|------------|----------|
| A | dept-api-agent | feature/contract-align/track-a/dept-api | ✅ Complete | ✅ Yes | ✅ ff50eb3 | ✅ 16/16 | 100% |
| B | nav-store-agent | feature/contract-align/track-b/nav-store | 🔲 Pending | ❌ | ❌ | ❌ | - |

**Phase Status:** 🔄 In Progress (Track A Complete, Track B Pending)

**Track A Completion Summary:**
- Verified `switchDepartment()` API function matches V2 contract exactly
- Enhanced error handling with detailed logging for all error codes (401/403/404)
- Created 16 comprehensive unit tests covering all scenarios
- All tests passing (16/16)
- Branch: feature/contract-align/track-a/dept-api
- Commit: ff50eb3
- Event `dept-api-ready` emitted for Track B

---

### Phase 2: Department Context & Hooks

| Track | Agent | Branch | Status | Event Emitted | Committed | Tests Pass | Coverage |
|-------|-------|--------|--------|---------------|-----------|------------|----------|
| C | dept-context-agent | feature/contract-align/track-c/dept-context | 🔲 Pending | ❌ | ❌ | ❌ | - |
| D | ui-context-agent | feature/contract-align/track-d/ui-context | 🔲 Pending | ❌ | ❌ | ❌ | - |

**Phase Status:** 🔲 Not Started

---

### Phase 3: DisplayAs Integration

| Track | Agent | Branch | Status | Event Emitted | Committed | Tests Pass | Coverage |
|-------|-------|--------|--------|---------------|-----------|------------|----------|
| E | types-displayas-agent | feature/contract-align/track-e/displayas-types | 🔲 Pending | ❌ | ❌ | ❌ | - |
| F | store-displayas-agent | feature/contract-align/track-f/displayas-store | ⏸️ Blocked | ❌ | ❌ | ❌ | - |

**Phase Status:** ⚠️ Blocked - Track F waiting for Track E to complete type definitions

---

### Phase 4: Scoped Permissions & Polish

| Track | Agent | Branch | Status | Event Emitted | Committed | Tests Pass | Coverage |
|-------|-------|--------|--------|---------------|-----------|------------|----------|
| G | scoped-permissions-agent | feature/contract-align/track-g/scoped-perms | 🔲 Pending | ❌ | ❌ | ❌ | - |

**Phase Status:** 🔲 Not Started

---

## Communication Protocol

### Agent Start
When an agent starts work:
```
🚀 AGENT START: <agent-id>
Track: <track>
Phase: <phase>
Branch: <branch-name>
Working Directory: <path>
```

### Agent Progress
When an agent makes significant progress:
```
📊 AGENT PROGRESS: <agent-id>
Status: <status>
Completed: <list of completed items>
Next: <next task>
```

### Event Emission
When an agent emits an event:
```
📡 EVENT EMITTED: <event-name>
From: <agent-id>
Timestamp: <ISO-8601>
Payload: <json>
```

### Agent Complete
When an agent finishes:
```
✅ AGENT COMPLETE: <agent-id>
Track: <track>
Phase: <phase>
Branch: <branch-name>
Committed: <commit-hash>
Tests: PASS | FAIL
Coverage: <percentage>%
Deliverables: <list>
```

### Error Report
When an agent encounters an error:
```
❌ ERROR: <error-event-name>
From: <agent-id>
Track: <track>
Issue: <description>
Waiting For: <dependency>
```

---

## Integration Checkpoints

### Pre-Integration Checklist
Before merging any phase:
- [ ] All track branches in phase committed
- [ ] All track tests passing
- [ ] All track coverage ≥85%
- [ ] All events emitted
- [ ] No blocking errors

### Post-Integration Verification
After merging each phase:
- [ ] Main branch builds successfully
- [ ] Integration tests pass
- [ ] No TypeScript errors
- [ ] Manual smoke test passes
- [ ] Documentation updated

---

## Status Legend

- 🔲 Pending - Not started
- 🔄 In Progress - Agent working
- ⏸️ Blocked - Waiting on dependency
- ⚠️ Error - Encountered issue
- ✅ Complete - Finished and committed
- 🎉 Integrated - Merged to main

---

## Active Blocking Issues

### 🚨 BLOCKER: Track F Cannot Proceed Without Track E

**Date:** 2026-01-11
**Blocking Agent:** Track F (store-displayas-agent)
**Blocked By:** Track E (types-displayas-agent) - incomplete

**Issue:**
Track F requires the following type definitions from Track E before implementation can begin:
1. `UserTypeObject` interface with `_id` and `displayAs` fields
2. `RoleObject` interface with displayAs support
3. Updated `LoginResponse.userTypes` from `UserType[]` to `UserTypeObject[]`
4. `userTypeDisplayMap?: Record<UserType, string>` added to `RoleHierarchy`
5. `roleDisplayMap?: Record<string, string>` added to `RoleHierarchy`

**Current State:**
- Checked `/home/adam/github/lms_ui/1_lms_ui_v2/src/shared/types/auth.ts`
- `UserTypeObject` NOT FOUND
- `RoleObject` NOT FOUND
- `LoginResponse.userTypes` is still `UserType[]` (string array)
- Display maps NOT present in `RoleHierarchy`

**Action Required:**
Track E must complete their deliverables and emit `EVENT: displayas-types-ready` before Track F can proceed.

**Track F Status:** ⏸️ BLOCKED - Waiting for Track E completion

---

**Document Version:** 1.1
**Last Updated:** 2026-01-11 (Track F blocking report added)
**Auto-Update:** Agents update this document as they progress
