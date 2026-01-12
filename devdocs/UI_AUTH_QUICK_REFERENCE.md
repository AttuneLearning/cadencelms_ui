# UI Authorization Implementation - Quick Reference

**Full Plan:** `devdocs/impl_reports/UI_AUTH_NEW_IMPLEMENTATION_PLAN.md`
**Based On:** `api_contracts/UI_AUTHORIZATION_IMPLEMENTATION_GUIDE.md`
**Status:** Ready to Start
**Timeline:** 1.5-2 weeks

---

## What's Already Done ✅

| Component | Status |
|-----------|--------|
| ProtectedRoute | ✅ Fully functional |
| useAuthStore | ✅ Working |
| useDepartmentContext | ✅ Working |
| hasPermission with scopes | ✅ Working |
| Permission wildcards | ✅ Working |
| API auth headers | ✅ Working |
| 401/403 handling | ✅ Working |
| ProtectedLink | ✅ Working (minor limitation) |

---

## Critical Security Issues 🚨

### Issue #1: Admin Token in localStorage
**Risk:** HIGH - XSS can steal admin tokens
**Current:** Stored in localStorage (insecure)
**Required:** Memory-only storage
**Phase:** 1 (P0 - CRITICAL)
**Effort:** 4-6 hours

### Issue #2: No FERPA Warnings
**Risk:** HIGH - Compliance violation
**Current:** No warnings on sensitive data
**Required:** SensitiveDataWarning component
**Phase:** 1 (P0 - CRITICAL)
**Effort:** 4-6 hours

**⚠️ These must be fixed before production deployment**

---

## Implementation Phases

### Phase 1: Critical Security (2 days) 🔴

**Priority:** P0 - BLOCKS PRODUCTION
**Effort:** 8-12 hours
**Team:** 1 Senior Developer

✅ **Track 1A: Admin Token Memory Storage** (Day 1, 4-6h)
- Create `adminTokenStorage.ts` (memory only)
- Integrate with authStore
- Update API client to use admin token
- Auto-expiry with timeout
- **Impact:** Fixes XSS vulnerability

✅ **Track 1B: FERPA Warnings** (Day 2, 4-6h)
- Create `SensitiveDataWarning.tsx`
- 4 types: FERPA, billing, PII, audit
- Session-based acknowledgment
- **Impact:** Compliance requirement met

**Start Immediately** - Critical for production

---

### Phase 2: Core Components (3 days) 🟡

**Priority:** P1 - HIGH
**Effort:** 18-24 hours
**Team:** 2 Developers (parallel)

✅ **Track 2A: ProtectedComponent** (Days 3-4, 8-12h)
- Universal wrapper for UI elements
- Global & scoped permissions
- Convenience wrappers (StaffOnly, LearnerOnly, AdminOnly)

✅ **Track 2B: Enhanced ProtectedLink** (Days 3-4, 6-8h)
- Fix multiple permission limitation
- Create ProtectedNavLink wrapper
- Full backward compatibility

✅ **Track 2C: useFeatureAccess** (Day 5, 4-6h)
- Centralized feature flags
- 20+ boolean flags
- Reduces code duplication

**Start After:** Phase 1 (can overlap)

---

### Phase 3: Privacy & Audit (3 days) 🟡

**Priority:** P1 - HIGH
**Effort:** 18-24 hours
**Team:** 2 Developers (parallel)
**Depends On:** Phase 1

✅ **Track 3A: Data Masking** (Days 1-2, 10-14h)
- Masking detection utilities
- LearnerName component with 🔒 indicator
- Email formatting

✅ **Track 3B: Audit Logging** (Day 3, 6-8h)
- `logSensitiveDataAccess()` function
- useAuditLog hook
- Failed log queue with retry

**Start After:** Phase 1 complete

---

### Phase 4: Polish (2 days) 🟢

**Priority:** P3 - LOW
**Effort:** 10-12 hours
**Team:** 1 Developer
**Depends On:** Phases 1-3

✅ **Track 4A: Error Components** (6-8h)
- AuthorizationError component
- Better error messages
- Clear user actions

✅ **Track 4B: Documentation** (4h)
- Storybook stories
- Migration guide
- API documentation

**Start After:** Phases 1-3 complete

---

## Priority Matrix

```
HIGH IMPACT  │ Phase 1         │ Phase 2, 3      │
CRITICAL     │ Admin Token     │ ProtectedComp   │
             │ FERPA Warnings  │ Data Masking    │
─────────────┼─────────────────┼─────────────────┤
MEDIUM       │                 │ useFeatureAccess│
IMPACT       │                 │ Audit Logging   │
─────────────┼─────────────────┼─────────────────┤
LOW IMPACT   │                 │                 │ Phase 4
NICE TO HAVE │                 │                 │ Error UI
             │                 │                 │ Docs
             └─────────────────┴─────────────────┘
                QUICK (<1 week)   MEDIUM (1-2 weeks)
```

---

## Quick Start Checklist

### Before Starting
- [ ] Review full plan with team
- [ ] Assign Phase 1 to senior developer
- [ ] Schedule security review (after Phase 1)
- [ ] Create GitHub issues for tracking
- [ ] Set up feature flags

### Phase 1 Kickoff
- [ ] Create `adminTokenStorage.ts`
- [ ] Update authStore with escalateToAdmin/deEscalate
- [ ] Test admin token NEVER in localStorage
- [ ] Create `SensitiveDataWarning.tsx`
- [ ] Add to FERPA-protected pages

### Phase 2 Kickoff
- [ ] Create `ProtectedComponent.tsx`
- [ ] Fix ProtectedLink multiple permissions
- [ ] Create `ProtectedNavLink.tsx`
- [ ] Create `useFeatureAccess.ts`
- [ ] Write comprehensive tests

### Phase 3 Kickoff
- [ ] Create `dataMasking.ts` utilities
- [ ] Create `LearnerName.tsx` component
- [ ] Create `auditLog.ts` utilities
- [ ] Integrate with backend audit endpoint

### Phase 4 Kickoff
- [ ] Create `AuthorizationError.tsx`
- [ ] Write Storybook stories
- [ ] Create migration guide
- [ ] Update README

---

## Resource Requirements

| Phase | Developers | Skills | Duration |
|-------|------------|--------|----------|
| Phase 1 | 1 | Senior, Security | 2 days |
| Phase 2 | 2 | Mid-Senior, React | 3 days |
| Phase 3 | 2 | Mid-level | 3 days |
| Phase 4 | 1 | Mid-level | 2 days |

**Total:** 2-3 developers rotating over 10 days (1.5-2 weeks calendar)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Admin token security | 100% memory-only |
| FERPA warnings | 100% sensitive pages |
| Audit logging | 100% sensitive access |
| Data masking | 100% detection |
| Test coverage | >85% |
| TypeScript errors | 0 |
| Documentation | 100% components |

---

## Testing Checklist

### Phase 1 Testing
- [ ] Admin token NOT in localStorage
- [ ] Admin token cleared on page refresh
- [ ] FERPA warning appears before transcript page
- [ ] Warning can be acknowledged
- [ ] Session memory works (don't show again)

### Phase 2 Testing
- [ ] ProtectedComponent hides without permission
- [ ] ProtectedComponent shows with permission
- [ ] ProtectedLink works with multiple permissions
- [ ] useFeatureAccess flags are accurate

### Phase 3 Testing
- [ ] Masked names detected correctly
- [ ] LearnerName shows 🔒 for masked data
- [ ] Audit logs sent to backend
- [ ] Failed logs queued for retry

### Phase 4 Testing
- [ ] 401 error shows login button
- [ ] 403 error shows access denied
- [ ] Error messages are user-friendly

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Admin token breaks flow | Thorough testing, feature flag |
| FERPA warnings annoying | Session memory, one-time per resource |
| Audit API doesn't exist | Create mock, implement later |
| Performance impact | Memoization, useFeatureAccess caching |
| Breaking changes | Backward compatibility, gradual migration |

---

## Component Quick Reference

### New Components (Phase 1-4)

```tsx
// Phase 1
<SensitiveDataWarning dataType="ferpa" onAcknowledge={() => {}}>
  <TranscriptContent />
</SensitiveDataWarning>

// Phase 2
<ProtectedComponent requiredRights={['content:courses:manage']}>
  <CreateButton />
</ProtectedComponent>

<ProtectedNavLink to="/courses" requiredRights={['content:courses:read']}>
  Courses
</ProtectedNavLink>

const features = useFeatureAccess();
{features.canManageCourses && <Button />}

// Phase 3
<LearnerName learner={student} showMaskedIndicator />

useAuditLog({
  action: 'view_transcript',
  resourceId: studentId,
  sensitiveCategory: 'ferpa',
});

// Phase 4
<AuthorizationError status={403} message="Access denied" />
```

---

## Next Actions

1. **Today:** Review plan with engineering lead
2. **This Week:** Start Phase 1 (critical security)
3. **Next Week:** Complete Phases 2-3
4. **Following Week:** Phase 4 & deployment

---

**Full Details:** See `UI_AUTH_NEW_IMPLEMENTATION_PLAN.md` (1,446 lines)

**Created:** 2026-01-11
**Status:** Ready to Execute
