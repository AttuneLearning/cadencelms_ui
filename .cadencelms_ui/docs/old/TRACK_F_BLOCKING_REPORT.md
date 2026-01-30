# Track F (store-displayas-agent) Blocking Report

**Date:** 2026-01-11
**Agent:** store-displayas-agent (Track F)
**Status:** ⏸️ BLOCKED
**Blocked By:** Track E (types-displayas-agent) - incomplete type definitions

---

## Summary

Track F (DisplayAs Store Integration) cannot proceed with implementation because Track E (DisplayAs Type Definitions) has not completed their deliverables. The required type definitions and interfaces are missing from the codebase.

---

## Mission

Track F is responsible for:
1. Updating authStore to handle `UserTypeObject[]` instead of `UserType[]`
2. Building display maps from server-provided `displayAs` values
3. Updating Header.tsx to use server-provided displayAs with fallback
4. Removing hardcoded client-side label mapping
5. Writing unit tests with ≥85% coverage

---

## Blocking Issue

### Required Dependencies from Track E

Track F requires the following type definitions before implementation can begin:

#### 1. UserTypeObject Interface
```typescript
export interface UserTypeObject {
  _id: 'learner' | 'staff' | 'global-admin';
  displayAs: string;
}
```
**Status:** ❌ NOT FOUND in `src/shared/types/auth.ts`

#### 2. RoleObject Interface
```typescript
export interface RoleObject {
  _id: string;
  displayAs: string;
}
```
**Status:** ❌ NOT FOUND in `src/shared/types/auth.ts`

#### 3. Updated LoginResponse Type
```typescript
export interface LoginResponse {
  success: boolean;
  data: {
    // ... other fields ...
    userTypes: UserTypeObject[];  // CHANGED from UserType[]
    // ... other fields ...
  };
}
```
**Status:** ❌ LoginResponse.userTypes is still `UserType[]` (string array)

#### 4. Updated RoleHierarchy with Display Maps
```typescript
export interface RoleHierarchy {
  // ... existing fields ...

  // NEW: Display mappings from server
  userTypeDisplayMap?: Record<UserType, string>;
  roleDisplayMap?: Record<string, string>;
}
```
**Status:** ❌ Display maps NOT present in RoleHierarchy interface

### Current State Verification

**File Checked:** `/home/adam/github/lms_ui/1_lms_ui_v2/src/shared/types/auth.ts`

**Findings:**
- Line 16: `export type UserType = 'learner' | 'staff' | 'global-admin';` (string type, not object)
- Line 156: `userTypes: UserType[];` in LoginResponse (not UserTypeObject[])
- Lines 340-366: RoleHierarchy interface has NO userTypeDisplayMap or roleDisplayMap fields
- No UserTypeObject interface definition found
- No RoleObject interface definition found

---

## Event Status

### Expected Event from Track E
**Event Name:** `displayas-types-ready`

**Expected Payload:**
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

**Status:** ❌ NOT EMITTED

### Error Event Emitted by Track F
**Event Name:** `ERROR: displayas-types-missing`

**Timestamp:** 2026-01-11

**Details:**
```
❌ ERROR: displayas-types-missing
From: store-displayas-agent (Track F)
Track: F
Issue: UserTypeObject and RoleObject types not found in src/shared/types/auth.ts
Waiting For: Track E (types-displayas-agent) to complete type definitions
```

---

## Track E Deliverables (Required)

According to `team-config.json` and the implementation plan, Track E must deliver:

1. ✅ Add `UserTypeObject` interface to auth types
2. ✅ Add `RoleObject` interface to auth types
3. ✅ Update `LoginResponse.userTypes` to `UserTypeObject[]`
4. ✅ Add `userTypeDisplayMap` to RoleHierarchy
5. ✅ Add `roleDisplayMap` to RoleHierarchy
6. ✅ Export display mapping utilities (optional)

**Current Status:** ❌ INCOMPLETE - None of the above items are present in the codebase

---

## Contract References

### API Contract (auth-v2.contract.ts)

Lines 27-28 import the required types:
```typescript
import { UserTypeObject } from './lookup-values.contract';
```

Lines 113-114 specify the login response format:
```typescript
/** Array of user's userTypes (V2.1: now includes displayAs) */
userTypes: 'UserTypeObject[]',
```

Lines 163-166 show the example format:
```typescript
userTypes: [
  { _id: 'staff', displayAs: 'Staff' },
  { _id: 'global-admin', displayAs: 'System Admin' }
],
```

### Implementation Plan (ROLE_SYSTEM_CHANGE_IMPLEMENTATION.md)

Section 2A.4 "Required Changes" (lines 152-235) specifies:
- Update Type Definitions (lines 154-180)
- Update authStore Login Handler (lines 182-200)
- Add Display Map to RoleHierarchy (lines 202-213)
- Update Header to Use Server Labels (lines 215-235)

Tasks listed (lines 282-291):
- Priority ⚡ High: Add `UserTypeObject` interface to types
- Priority ⚡ High: Update `LoginResponse.userTypes` type
- Priority ⚡ High: Update authStore to extract displayAs
- Priority ⚡ High: Add `userTypeDisplayMap` to RoleHierarchy

---

## Impact on Timeline

### Phase 3 Schedule
**Estimated Days:** 2 days
**Current Status:** Day 1 - BLOCKED

### Dependencies Chain
```
Phase 3: DisplayAs Integration
├── Track E (types-displayas-agent) ──▶ Must complete FIRST
│   └── Deliverable: Type definitions in auth.ts
│   └── Signal: EVENT: displayas-types-ready
│
└── Track F (store-displayas-agent) ──▶ BLOCKED - Cannot start
    └── Waiting for: Track E completion
    └── Deliverable: AuthStore updates, Header updates
    └── Signal: EVENT: phase-3-track-f-complete
```

### Recommended Actions

1. **Immediate:** Track E agent must be spawned/resumed to complete type definitions
2. **Priority:** Focus on core type definitions (UserTypeObject, RoleObject, LoginResponse update)
3. **Optional:** Display utility functions can be added later if needed
4. **Once Complete:** Track E emits `displayas-types-ready` event
5. **Then:** Track F can proceed with authStore and Header updates

---

## Critical Requirements (Once Unblocked)

From Q&A document (line 74):
> **Q:** Do we need to maintain backward compatibility with string-based userTypes?
>
> **A:** No. Do not maintain backward compatibility. Nothing is in production. Feel free to make breaking changes. Keep code only current with the most current contracts.

**Implementation Note:** Track F will NOT implement backward compatibility. All code will use `UserTypeObject[]` format only, per the contracts.

---

## Communication Protocol

### Agent Start Signal (Once Unblocked)
```
🚀 AGENT START: store-displayas-agent
Track: F
Phase: phase-3
Branch: feature/contract-align/track-f/displayas-store
Working Directory: src/features/auth/model/, src/widgets/header/
Waiting For: Track E completion event
```

### Current Status Signal
```
⏸️ AGENT BLOCKED: store-displayas-agent
Track: F
Phase: phase-3
Blocked By: Track E (types-displayas-agent)
Reason: Required type definitions not found
Waiting For: EVENT: displayas-types-ready
```

---

## Next Steps

### For Track E (types-displayas-agent)
1. Read contract files:
   - `/home/adam/github/lms_ui/1_lms_ui_v2/api_contracts/api/auth-v2.contract.ts`
   - `/home/adam/github/lms_ui/1_lms_ui_v2/api_contracts/api/lookup-values.contract.ts`
2. Implement required interfaces in `/home/adam/github/lms_ui/1_lms_ui_v2/src/shared/types/auth.ts`
3. Update LoginResponse type
4. Update RoleHierarchy interface
5. Create branch: `feature/contract-align/track-e/displayas-types`
6. Commit changes
7. Emit `EVENT: displayas-types-ready`
8. Update `devdocs/team_coordination.md`

### For Track F (store-displayas-agent) - WAITING
1. Monitor `devdocs/team_coordination.md` for Track E completion
2. Wait for `EVENT: displayas-types-ready`
3. Verify type definitions are present
4. Begin implementation per mission brief
5. Update authStore login handler
6. Update Header.tsx
7. Write unit tests (≥85% coverage)
8. Emit `EVENT: phase-3-track-f-complete`

---

## Documentation Updates

The following files have been updated to reflect this blocking issue:

1. **devdocs/team_coordination.md**
   - Event status updated: `displayas-types-ready` marked as ERROR
   - Error section updated with Track F blocking details
   - Phase 3 progress table: Track F status changed to ⏸️ Blocked
   - Active Blocking Issues section added

2. **This Report**
   - Created: `TRACK_F_BLOCKING_REPORT.md`
   - Comprehensive documentation of blocking issue
   - References to contracts and implementation plan
   - Clear action items for both tracks

---

## Contact Information

**Track F Agent:** store-displayas-agent
**Track E Agent:** types-displayas-agent
**Phase:** Phase 3 - DisplayAs Integration
**Coordination Document:** `devdocs/team_coordination.md`

---

**Report Generated:** 2026-01-11
**Report Status:** Active - Blocking Issue
**Resolution:** Pending Track E completion
