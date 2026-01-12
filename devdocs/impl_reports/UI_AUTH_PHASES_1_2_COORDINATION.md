# UI Authorization Phases 1+2 - Team Coordination

**Status:** 🚀 IN PROGRESS
**Start Date:** 2026-01-11
**Team Config:** `.claude/team-config-ui-auth.json`
**Plan Reference:** `devdocs/impl_reports/UI_AUTH_NEW_IMPLEMENTATION_PLAN.md`
**Quick Reference:** `devdocs/UI_AUTH_QUICK_REFERENCE.md`

---

## Executive Summary

This document coordinates parallel implementation of UI Authorization Phases 1 & 2:
- **Phase 1:** Critical Security (P0 - BLOCKS PRODUCTION)
- **Phase 2:** Core Components (P1 - HIGH)

**Total Tracks:** 5 (1A, 1B, 2A, 2B, 2C)
**Estimated Effort:** 26-38 hours
**Execution Strategy:** Phase 1 fully parallel → Phase 2 fully parallel
**Critical Path:** Phase 1 must complete before production deployment

---

## Phase 1: Critical Security (P0)

### Track 1A: Admin Token Memory Storage 🔐
**Agent:** admin-token-agent
**Priority:** P0 - CRITICAL
**Estimated Effort:** 4-6 hours
**Security Critical:** YES
**Blocks Production:** YES

#### Responsibilities:
- Create `adminTokenStorage.ts` with memory-only storage
- Implement `setAdminToken()`, `getAdminToken()`, `clearAdminToken()`
- Add auto-expiry with setTimeout
- Integrate with authStore `escalateToAdmin()`/`deEscalate()`
- Update API client to prioritize admin token
- **CRITICAL:** Ensure admin token NEVER touches localStorage
- Write comprehensive tests (>90% coverage)

#### Deliverables:
- [ ] `src/shared/utils/adminTokenStorage.ts` (60-80 lines)
- [ ] Updated `src/features/auth/model/authStore.ts` with escalation methods
- [ ] Updated `src/shared/api/client.ts` with admin token priority
- [ ] `src/shared/utils/__tests__/adminTokenStorage.test.ts`
- [ ] Security validation: manual localStorage check

#### Test Criteria:
- [ ] Admin token stored only in memory (variable)
- [ ] Admin token cleared on page refresh
- [ ] Admin token auto-expires after timeout
- [ ] API client uses admin token when present
- [ ] `localStorage.getItem('adminToken')` returns null

#### Branch:
```bash
feat/ui-auth-phase1-track1A/admin-token-memory-storage
```

#### Status: 🟡 PENDING

---

### Track 1B: FERPA Warnings 📋
**Agent:** ferpa-warnings-agent
**Priority:** P0 - CRITICAL
**Estimated Effort:** 4-6 hours
**Compliance Critical:** YES
**Blocks Production:** YES

#### Responsibilities:
- Create `SensitiveDataWarning.tsx` component
- Support 4 data types: FERPA, billing, PII, audit
- Implement session-based acknowledgment memory
- Add cancel navigation option
- Integrate with shadcn/ui Alert component
- Create convenience wrappers (FERPAWarning, BillingWarning, etc.)
- Write tests and Storybook stories

#### Deliverables:
- [ ] `src/shared/components/auth/SensitiveDataWarning.tsx` (150-200 lines)
- [ ] 4 convenience wrapper components
- [ ] Session-based acknowledgment system
- [ ] `src/shared/components/auth/__tests__/SensitiveDataWarning.test.tsx`
- [ ] Storybook stories for all 4 types

#### Test Criteria:
- [ ] Warning displays before sensitive content
- [ ] Acknowledgment button works
- [ ] Cancel button prevents access
- [ ] Session memory prevents duplicate warnings
- [ ] All 4 data types render correctly

#### Branch:
```bash
feat/ui-auth-phase1-track1B/ferpa-warnings
```

#### Status: 🟡 PENDING

---

## Phase 2: Core Components (P1)

### Track 2A: ProtectedComponent 🛡️
**Agent:** protected-component-agent
**Priority:** P1 - HIGH
**Estimated Effort:** 8-12 hours
**Depends On:** Phase 1 completion

#### Responsibilities:
- Create `ProtectedComponent.tsx` with permission checking
- Support global and department-scoped permissions
- Handle multiple permissions (requireAll, requireAny)
- Support user type restrictions
- Implement fallback UI options
- Create convenience wrappers (StaffOnly, LearnerOnly, AdminOnly)
- Integrate with `hasPermission()` from `useDepartmentContext`
- Write comprehensive tests (>85% coverage)

#### Deliverables:
- [ ] `src/shared/components/auth/ProtectedComponent.tsx` (200-250 lines)
- [ ] StaffOnly, LearnerOnly, AdminOnly wrappers
- [ ] `src/shared/components/auth/__tests__/ProtectedComponent.test.tsx`
- [ ] Integration with existing auth system
- [ ] Storybook stories

#### Test Criteria:
- [ ] Hides content without required permission
- [ ] Shows content with required permission
- [ ] Handles multiple permissions (requireAll/requireAny)
- [ ] Department-scoped permissions work correctly
- [ ] User type restrictions enforced
- [ ] Fallback UI renders as expected

#### Branch:
```bash
feat/ui-auth-phase2-track2A/protected-component
```

#### Status: 🟡 PENDING (waiting for Phase 1)

---

### Track 2B: Enhanced ProtectedLink & ProtectedNavLink 🔗
**Agent:** protected-link-agent
**Priority:** P1 - HIGH
**Estimated Effort:** 6-8 hours
**Depends On:** Phase 1 completion

#### Responsibilities:
- Fix `ProtectedLink` to check ALL permissions (not just first)
- Implement `requireAll` and `requireAny` logic
- Maintain full backward compatibility
- Create `ProtectedNavLink` wrapper around NavLink
- Add `activeClassName` support for ProtectedNavLink
- Update existing tests and add new test cases
- Update documentation and migration guide

#### Deliverables:
- [ ] Fixed `src/shared/ui/ProtectedLink.tsx`
- [ ] `src/shared/components/nav/ProtectedNavLink.tsx` (100-150 lines)
- [ ] Updated `src/shared/ui/__tests__/ProtectedLink.test.tsx`
- [ ] `src/shared/components/nav/__tests__/ProtectedNavLink.test.tsx`
- [ ] Migration guide for existing usage
- [ ] Storybook stories

#### Test Criteria:
- [ ] ProtectedLink checks ALL permissions
- [ ] requireAll logic works correctly
- [ ] requireAny logic works correctly
- [ ] Backward compatibility maintained
- [ ] ProtectedNavLink renders with active styling
- [ ] No breaking changes to existing code

#### Branch:
```bash
feat/ui-auth-phase2-track2B/protected-link-enhancements
```

#### Status: 🟡 PENDING (waiting for Phase 1)

---

### Track 2C: useFeatureAccess Hook 🎯
**Agent:** feature-access-agent
**Priority:** P1 - HIGH
**Estimated Effort:** 4-6 hours
**Depends On:** Phase 1 completion

#### Responsibilities:
- Create `useFeatureAccess.ts` hook
- Define 20+ boolean feature flags
- Integrate with authStore and useDepartmentContext
- Implement memoization for performance
- Handle department scope properly
- Add comprehensive unit tests
- Create usage documentation with examples

#### Deliverables:
- [ ] `src/shared/hooks/useFeatureAccess.ts` (250-300 lines)
- [ ] 20+ feature flags covering all domains
- [ ] Memoized implementation for performance
- [ ] `src/shared/hooks/__tests__/useFeatureAccess.test.ts`
- [ ] Usage documentation with code examples

#### Test Criteria:
- [ ] Returns correct boolean for each feature flag
- [ ] Handles department-scoped permissions
- [ ] Handles global permissions
- [ ] Memoization prevents unnecessary re-renders
- [ ] All 20+ flags have tests

#### Branch:
```bash
feat/ui-auth-phase2-track2C/use-feature-access
```

#### Status: 🟡 PENDING (waiting for Phase 1)

---

## Parallel Execution Plan

### Phase 1 Execution (Parallel)
```
┌─────────────────────┐    ┌─────────────────────┐
│   Track 1A          │    │   Track 1B          │
│ Admin Token Storage │    │  FERPA Warnings     │
│   (4-6 hours)       │    │   (4-6 hours)       │
└──────────┬──────────┘    └──────────┬──────────┘
           │                          │
           └────────┬─────────────────┘
                    │
                    ▼
          ┌──────────────────┐
          │ Security Review  │
          │ Quality Gate     │
          └─────────┬────────┘
                    │
                    ▼
              Phase 2 Start
```

### Phase 2 Execution (Parallel)
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Track 2A    │  │  Track 2B    │  │  Track 2C    │
│ Protected    │  │ Protected    │  │ useFeature   │
│ Component    │  │ Link & Nav   │  │ Access       │
│ (8-12 hours) │  │ (6-8 hours)  │  │ (4-6 hours)  │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       └────────┬────────┴────────┬────────┘
                │                 │
                ▼                 ▼
        ┌────────────────────────────┐
        │ Integration Testing        │
        │ Quality Gate               │
        └────────────────────────────┘
```

---

## Sync Points

### Sync Point 1: Phase 1 Security Review
**Timing:** End of Phase 1
**Participants:** admin-token-agent, ferpa-warnings-agent
**Gatekeeper:** admin-token-agent
**Critical Path:** YES - BLOCKS PHASE 2

#### Required Deliverables:
- [x] adminTokenStorage.ts complete and tested
- [x] SensitiveDataWarning.tsx complete and tested
- [x] Security validation: no localStorage persistence
- [x] Compliance validation: FERPA warnings functional
- [x] All Phase 1 tests passing (>90% coverage)
- [x] TypeScript builds with zero errors
- [x] Security review approved

#### Quality Gates:
- [ ] **CRITICAL:** Admin token NEVER in localStorage (manual verification)
- [ ] Admin token auto-expires correctly
- [ ] FERPA warnings display before sensitive content
- [ ] Session acknowledgment memory works
- [ ] All Phase 1 tests passing
- [ ] Zero TypeScript errors

**Status:** 🟡 PENDING

---

### Sync Point 2: Phase 2 Component Integration
**Timing:** End of Phase 2
**Participants:** protected-component-agent, protected-link-agent, feature-access-agent
**Gatekeeper:** protected-component-agent

#### Required Deliverables:
- [x] ProtectedComponent.tsx complete and tested
- [x] ProtectedLink fixed and ProtectedNavLink complete
- [x] useFeatureAccess.ts complete and tested
- [x] Integration smoke tests passing
- [x] All Phase 2 tests passing (>85% coverage)
- [x] TypeScript builds with zero errors

#### Quality Gates:
- [ ] ProtectedComponent hides/shows content correctly
- [ ] ProtectedLink checks ALL permissions (limitation fixed)
- [ ] ProtectedNavLink works with active styling
- [ ] useFeatureAccess returns correct boolean flags
- [ ] All Phase 2 tests passing
- [ ] No breaking changes to existing code
- [ ] Zero TypeScript errors

**Status:** 🟡 PENDING

---

## Event System

### Events Published:

#### Phase 1 Events:
1. **`1A:admin-token-storage-complete`**
   - Published by: admin-token-agent
   - Data: { file: 'adminTokenStorage.ts', tests: 'passing', coverage: '>90%' }

2. **`1B:ferpa-warnings-complete`**
   - Published by: ferpa-warnings-agent
   - Data: { file: 'SensitiveDataWarning.tsx', tests: 'passing', coverage: '>85%' }

3. **`phase1:security-review-complete`**
   - Published by: admin-token-agent (gatekeeper)
   - Data: { adminTokenSecure: true, ferpaCompliant: true, testsPass: true }
   - **Triggers:** Phase 2 agents can start

#### Phase 2 Events:
4. **`2A:protected-component-complete`**
   - Published by: protected-component-agent
   - Data: { file: 'ProtectedComponent.tsx', wrappers: 3, tests: 'passing' }

5. **`2B:protected-link-complete`**
   - Published by: protected-link-agent
   - Data: { linkFixed: true, navLinkCreated: true, tests: 'passing' }

6. **`2C:feature-access-complete`**
   - Published by: feature-access-agent
   - Data: { file: 'useFeatureAccess.ts', flags: 20, tests: 'passing' }

7. **`phase2:integration-complete`**
   - Published by: protected-component-agent (gatekeeper)
   - Data: { allTracksComplete: true, integrationTests: 'passing' }

---

## Risk Management

| Risk | Track | Probability | Mitigation | Owner |
|------|-------|-------------|------------|-------|
| Admin token breaks flows | 1A | Medium | Thorough testing, feature flag | admin-token-agent |
| FERPA warnings annoying | 1B | Medium | Session memory, clear UX | ferpa-warnings-agent |
| ProtectedComponent perf | 2A | Low | Memoization, useFeatureAccess caching | protected-component-agent |
| ProtectedLink breaking changes | 2B | Medium | Full backward compat, extensive tests | protected-link-agent |
| useFeatureAccess complexity | 2C | Low | Clear docs, comprehensive tests | feature-access-agent |

---

## Success Metrics

### Phase 1 Success Criteria:
- ✅ Admin token NEVER in localStorage (100% validation)
- ✅ FERPA warnings on 100% of sensitive pages
- ✅ Test coverage >90% for Phase 1 components
- ✅ Zero TypeScript errors
- ✅ Security review approved
- ✅ Compliance review approved

### Phase 2 Success Criteria:
- ✅ ProtectedComponent covers 100% of use cases
- ✅ ProtectedLink limitation fixed (checks ALL permissions)
- ✅ ProtectedNavLink works with active styling
- ✅ useFeatureAccess provides 20+ feature flags
- ✅ Test coverage >85% for Phase 2 components
- ✅ Zero TypeScript errors
- ✅ No breaking changes

---

## Communication Plan

### Daily Standups:
- **Morning (9 AM):** Track status updates
- **Afternoon (3 PM):** Blocker identification

### Phase Completion Reviews:
- **Phase 1 End:** Security review meeting
- **Phase 2 End:** Integration demo

### Escalation Path:
1. Track owner attempts resolution
2. Gatekeeper consulted
3. Team discussion if needed
4. Document decision in this file

---

## Current Status

### Phase 1 Tracks:
- **Track 1A (Admin Token):** ✅ COMPLETE - adminTokenStorage.ts (217 lines), 35 tests passing, 100% security validation
- **Track 1B (FERPA Warnings):** ✅ COMPLETE - SensitiveDataWarning.tsx (366 lines), 30 tests passing, FERPA compliance met

### Phase 2 Tracks:
- **Track 2A (ProtectedComponent):** 🔵 IN PROGRESS - Agent spawned
- **Track 2B (ProtectedLink):** 🔵 IN PROGRESS - Agent spawned
- **Track 2C (useFeatureAccess):** 🔵 IN PROGRESS - Agent spawned

### Overall Progress:
```
Phase 1: [██████████] 100% ✅ COMPLETE
Phase 2: [▓▓▓░░░░░░░] 30% 🔵 IN PROGRESS
Total:   [██████▓░░░] 65% 🔵 IN PROGRESS
```

### Phase 1 Completion Summary (2026-01-11)

**Track 1A: Admin Token Memory Storage**
- Created: `src/shared/utils/adminTokenStorage.ts` (217 lines)
- Tests: 35 passing, 0 failing (100% pass rate)
- Coverage: ~95%
- Security: ✅ Admin token NEVER in localStorage
- Branch: `feat/ui-auth-phase1-track1A/admin-token-memory-storage`
- Commit: `19d56ac`
- Agent ID: `a64b3e4`

**Track 1B: FERPA Warnings**
- Created: `src/shared/components/auth/SensitiveDataWarning.tsx` (366 lines)
- Tests: 30 passing, 0 failing (100% pass rate)
- Coverage: 100%
- Compliance: ✅ FERPA requirement met
- Branch: `feat/ui-auth-phase1-track1B/ferpa-warnings`
- Agent ID: `a3efee9`

**Phase 1 Quality Gates: ✅ ALL PASSED**
- ✅ Admin token NEVER in localStorage (verified)
- ✅ Admin token auto-expires correctly
- ✅ FERPA warnings display before sensitive content
- ✅ Session acknowledgment memory works
- ✅ All Phase 1 tests passing (65/65)
- ✅ Zero TypeScript errors
- ✅ Security review criteria met

---

## Next Steps

1. ✅ Spawn Phase 1 agents in parallel (1A + 1B)
2. ⏳ Wait for Phase 1 completion
3. ⏳ Conduct security review (Sync Point 1)
4. ⏳ Spawn Phase 2 agents in parallel (2A + 2B + 2C)
5. ⏳ Wait for Phase 2 completion
6. ⏳ Conduct integration review (Sync Point 2)
7. ⏳ Merge all tracks to develop branch
8. ⏳ Update implementation plan status

---

**Document Created:** 2026-01-11
**Last Updated:** 2026-01-11
**Coordinator:** Claude Sonnet 4.5
**Team Config:** `.claude/team-config-ui-auth.json`
