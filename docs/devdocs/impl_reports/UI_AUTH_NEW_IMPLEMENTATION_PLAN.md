# UI Authorization New Implementation Plan

**Date:** 2026-01-11
**Based On:** `api_contracts/UI_AUTHORIZATION_IMPLEMENTATION_GUIDE.md`
**Status:** 📋 READY FOR IMPLEMENTATION
**Target:** Full compliance with V2 Authorization Architecture

---

## Executive Summary

This plan brings the UI into full compliance with the latest V2 Authorization Implementation Guide (`UI_AUTHORIZATION_IMPLEMENTATION_GUIDE.md`). The guide represents the most recent API contracts and authorization patterns.

### Current State Analysis

**What's Already Compatible:** ✅
1. ✅ `ProtectedRoute` component exists with comprehensive features
2. ✅ `useAuthStore` hook provides authentication state
3. ✅ `useDepartmentContext` hook provides department-scoped data
4. ✅ `hasPermission()` with scope support in authStore
5. ✅ Permission checking with wildcard support (`system:*`, `domain:*`)
6. ✅ `currentDepartmentAccessRights` cached from API
7. ✅ `currentDepartmentRoles` cached from API
8. ✅ API client with authorization headers
9. ✅ 401/403 error handling in API client
10. ✅ `ProtectedLink` component (with minor limitation)

**What Needs Implementation:** ❌
1. ❌ **ProtectedComponent wrapper** - UI element visibility control
2. ❌ **ProtectedNavLink** - Navigation link wrapper
3. ❌ **SensitiveDataWarning** - FERPA/PII/Billing warnings
4. ❌ **Data masking utilities** - Frontend masking detection
5. ❌ **Admin token memory storage** - Currently uses localStorage (insecure)
6. ❌ **useFeatureAccess hook** - Centralized feature flags
7. ❌ **Audit logging** - Frontend logging for sensitive data access
8. ❌ **AuthorizationError components** - Better error displays
9. ❌ **Data masking UI components** - LearnerName component
10. ❌ **Updated ProtectedLink** - Fix multiple permission limitation

**Priority:** HIGH - Security and compliance requirements

---

## Gap Analysis

### Critical Gaps (Security/Compliance)

| Gap | Current | Required | Impact | Priority |
|-----|---------|----------|--------|----------|
| Admin token storage | localStorage | Memory only | **HIGH** - XSS vulnerability | P0 - CRITICAL |
| FERPA warnings | None | SensitiveDataWarning | **HIGH** - Compliance risk | P0 - CRITICAL |
| Audit logging | None | logSensitiveDataAccess() | **MEDIUM** - Compliance | P1 - HIGH |
| Data masking detection | None | Utility functions | **MEDIUM** - Privacy | P1 - HIGH |

### Functional Gaps (UX/DX)

| Gap | Current | Required | Impact | Priority |
|-----|---------|----------|--------|----------|
| ProtectedComponent | None | Full wrapper | **HIGH** - DX degradation | P1 - HIGH |
| useFeatureAccess | None | Feature flags hook | **MEDIUM** - Code duplication | P2 - MEDIUM |
| ProtectedNavLink | None | Nav wrapper | **MEDIUM** - Consistency | P2 - MEDIUM |
| ProtectedLink multi-perm | Limited | Full support | **LOW** - Workaround exists | P3 - LOW |
| AuthorizationError UI | Basic | Rich components | **LOW** - UX polish | P3 - LOW |

---

## Implementation Phases

### Phase 1: Critical Security Fixes (Week 1, Days 1-2)
**Goal:** Fix security vulnerabilities immediately

**Priority:** P0 - CRITICAL
**Duration:** 2 days
**Effort:** 8-12 hours
**Team:** 1 Senior Developer
**Blocker:** BLOCKS production deployment

#### Track 1A: Admin Token Memory Storage (Day 1)
**Effort:** 4-6 hours

**Implementation:**
```typescript
// src/shared/utils/adminTokenStorage.ts (NEW FILE)

/**
 * Admin Token Storage - MEMORY ONLY
 * Admin tokens are NEVER persisted to localStorage or sessionStorage
 * for security reasons. They are lost on page refresh (acceptable).
 */

let adminToken: string | null = null;
let adminTokenExpiry: Date | null = null;
let adminTokenTimeout: NodeJS.Timeout | null = null;

export function setAdminToken(token: string, expiresIn: number): void {
  adminToken = token;
  adminTokenExpiry = new Date(Date.now() + expiresIn * 1000);

  // Clear any existing timeout
  if (adminTokenTimeout) {
    clearTimeout(adminTokenTimeout);
  }

  // Auto-clear token on expiry
  adminTokenTimeout = setTimeout(() => {
    clearAdminToken();
    console.log('[AdminToken] Token expired and cleared');
  }, expiresIn * 1000);

  console.log('[AdminToken] Stored in memory, expires in', expiresIn, 'seconds');
}

export function getAdminToken(): string | null {
  // Check expiry
  if (adminTokenExpiry && new Date() > adminTokenExpiry) {
    clearAdminToken();
    return null;
  }
  return adminToken;
}

export function clearAdminToken(): void {
  adminToken = null;
  adminTokenExpiry = null;

  if (adminTokenTimeout) {
    clearTimeout(adminTokenTimeout);
    adminTokenTimeout = null;
  }
}

export function isAdminSessionActive(): boolean {
  return getAdminToken() !== null;
}

export function getRemainingTime(): number {
  if (!adminTokenExpiry) return 0;
  return Math.max(0, adminTokenExpiry.getTime() - Date.now());
}
```

**Integration with authStore:**
```typescript
// src/features/auth/model/authStore.ts

import {
  setAdminToken,
  getAdminToken,
  clearAdminToken,
  isAdminSessionActive
} from '@/shared/utils/adminTokenStorage';

interface AuthState {
  // ... existing fields

  // Admin session
  isAdminSessionActive: boolean;
  adminTokenExpiresAt: Date | null;

  // Actions
  escalateToAdmin: (credentials: EscalationCredentials) => Promise<void>;
  deEscalateFromAdmin: () => void;
}

// In store implementation:
escalateToAdmin: async (credentials) => {
  try {
    const response = await escalateToAdminAPI(credentials);
    const { adminToken: token, expiresIn } = response.data;

    // Store in MEMORY only
    setAdminToken(token, expiresIn);

    set({
      isAdminSessionActive: true,
      adminTokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
    });

    console.log('[AuthStore] Escalated to admin');
  } catch (error) {
    console.error('[AuthStore] Admin escalation failed:', error);
    throw error;
  }
},

deEscalateFromAdmin: () => {
  clearAdminToken();

  set({
    isAdminSessionActive: false,
    adminTokenExpiresAt: null,
  });

  console.log('[AuthStore] De-escalated from admin');
},
```

**API Client Integration:**
```typescript
// src/shared/api/client.ts

import { getAdminToken, isAdminSessionActive } from '@/shared/utils/adminTokenStorage';

apiClient.interceptors.request.use((config) => {
  // Priority: Admin token > Access token
  if (isAdminSessionActive()) {
    const adminToken = getAdminToken();
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
      return config;
    }
  }

  // Fallback to regular access token
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});
```

**Deliverables:**
- ✅ Admin token stored in memory only
- ✅ Auto-expiry with timeout
- ✅ Integration with authStore
- ✅ API client uses admin token when active
- ✅ 15+ unit tests

**Tests:**
- Token storage in memory (not localStorage)
- Auto-expiry after timeout
- Manual clear function
- Integration with API client
- Page refresh clears token

---

#### Track 1B: FERPA/Sensitive Data Warnings (Day 2)
**Effort:** 4-6 hours

**Implementation:**
```typescript
// src/shared/components/auth/SensitiveDataWarning.tsx (NEW FILE)

import React, { useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Button } from '@/shared/ui/button';
import { AlertTriangle, Lock, DollarSign, Shield } from 'lucide-react';

type SensitiveDataType = 'ferpa' | 'billing' | 'pii' | 'audit';

interface SensitiveDataWarningProps {
  /** Type of sensitive data */
  dataType: SensitiveDataType;

  /** Callback when acknowledged */
  onAcknowledge: () => void;

  /** Children to show after acknowledgment */
  children: React.ReactNode;

  /** Optional: Skip warning if user previously acknowledged (session) */
  sessionKey?: string;
}

const WARNING_CONFIG: Record<SensitiveDataType, {
  title: string;
  message: string;
  icon: React.ComponentType<any>;
  variant: 'destructive' | 'default';
}> = {
  ferpa: {
    title: 'FERPA-Protected Student Data',
    message: 'You are about to access student education records protected by FERPA. Access is logged for audit purposes. Only access this data if you have a legitimate educational interest.',
    icon: Lock,
    variant: 'destructive',
  },
  billing: {
    title: 'Financial Data Access',
    message: 'You are about to access financial information. All access is logged and monitored. Ensure you have proper authorization.',
    icon: DollarSign,
    variant: 'default',
  },
  pii: {
    title: 'Personally Identifiable Information',
    message: 'You are accessing PII. Handle this data in compliance with privacy policies and regulations.',
    icon: Shield,
    variant: 'default',
  },
  audit: {
    title: 'Audit Log Access',
    message: 'You are accessing system audit logs. This access is itself logged. Use responsibly.',
    icon: AlertTriangle,
    variant: 'default',
  },
};

export function SensitiveDataWarning({
  dataType,
  onAcknowledge,
  children,
  sessionKey,
}: SensitiveDataWarningProps) {
  const [acknowledged, setAcknowledged] = useState(() => {
    // Check session storage for previous acknowledgment
    if (sessionKey) {
      return sessionStorage.getItem(`warning_ack_${sessionKey}`) === 'true';
    }
    return false;
  });

  if (acknowledged) {
    return <>{children}</>;
  }

  const config = WARNING_CONFIG[dataType];
  const Icon = config.icon;

  const handleAcknowledge = () => {
    setAcknowledged(true);

    // Remember acknowledgment for this session
    if (sessionKey) {
      sessionStorage.setItem(`warning_ack_${sessionKey}`, 'true');
    }

    onAcknowledge();
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Alert variant={config.variant} className="max-w-2xl">
        <Icon className="h-6 w-6" />
        <AlertTitle className="text-xl mb-2">{config.title}</AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-base">{config.message}</p>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleAcknowledge} variant="default">
              I Understand - Continue
            </Button>
            <Button onClick={handleCancel} variant="outline">
              Cancel
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

**Usage Example:**
```typescript
// src/pages/staff/transcripts/TranscriptPage.tsx

import { SensitiveDataWarning } from '@/shared/components/auth/SensitiveDataWarning';

export function TranscriptPage({ studentId }: { studentId: string }) {
  return (
    <SensitiveDataWarning
      dataType="ferpa"
      sessionKey={`transcript_${studentId}`}
      onAcknowledge={() => {
        // Log access
        console.log('User acknowledged FERPA warning');
      }}
    >
      <TranscriptContent studentId={studentId} />
    </SensitiveDataWarning>
  );
}
```

**Deliverables:**
- ✅ SensitiveDataWarning component
- ✅ 4 data types supported (FERPA, billing, PII, audit)
- ✅ Session-based acknowledgment memory
- ✅ Cancel navigation back
- ✅ 12+ component tests

---

**Phase 1 Success Criteria:**
- ✅ Admin tokens NEVER in localStorage
- ✅ Admin session lost on page refresh (acceptable)
- ✅ FERPA warnings before sensitive data
- ✅ All tests passing
- ✅ Security audit approved

**Phase 1 Risks:**
- **LOW** - Straightforward implementations
- **Mitigation:** Code review by security-aware developer

---

### Phase 2: Core Authorization Components (Week 1, Days 3-5)
**Goal:** Implement reusable authorization UI components

**Priority:** P1 - HIGH
**Duration:** 3 days
**Effort:** 18-24 hours
**Team:** 2 Developers (parallel tracks)
**Dependencies:** None (can run in parallel with Phase 1)

---

#### Track 2A: ProtectedComponent Wrapper (Days 3-4)
**Effort:** 8-12 hours
**Owner:** Developer A

**Implementation:**
```typescript
// src/shared/components/auth/ProtectedComponent.tsx (NEW FILE)

import React from 'react';
import { useAuthStore } from '@/features/auth/model';
import { useDepartmentContext } from '@/shared/hooks';

interface ProtectedComponentProps {
  /** Required access rights (OR logic - user needs ANY) */
  requiredRights?: string[];

  /** Required access rights (AND logic - user needs ALL) */
  requireAllRights?: string[];

  /** Required roles */
  requiredRoles?: string[];

  /** Require department context */
  requireDepartment?: boolean;

  /** Fallback content when no access */
  fallback?: React.ReactNode;

  /** Children to render when authorized */
  children: React.ReactNode;

  /** Show loading state */
  showLoading?: boolean;

  /** Optional: Use scoped permissions (current department) */
  departmentScoped?: boolean;
}

export function ProtectedComponent({
  requiredRights = [],
  requireAllRights = [],
  requiredRoles = [],
  requireDepartment = false,
  fallback = null,
  children,
  showLoading = false,
  departmentScoped = false,
}: ProtectedComponentProps) {
  const {
    isAuthenticated,
    roleHierarchy,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading: authLoading,
  } = useAuthStore();

  const {
    currentDepartmentId,
    currentDepartmentRoles,
    currentDepartmentAccessRights,
    hasPermission: hasDeptPermission,
    hasAnyPermission: hasAnyDeptPermission,
    hasAllPermissions: hasAllDeptPermissions,
  } = useDepartmentContext();

  // Loading state
  if (authLoading && showLoading) {
    return <div>Loading...</div>;
  }

  // Must be authenticated
  if (!isAuthenticated || !roleHierarchy) {
    return <>{fallback}</>;
  }

  // Check department requirement
  if (requireDepartment && !currentDepartmentId) {
    return <>{fallback}</>;
  }

  // Choose permission checking method
  const checkPermission = departmentScoped ? hasDeptPermission : hasPermission;
  const checkAnyPermission = departmentScoped ? hasAnyDeptPermission : hasAnyPermission;
  const checkAllPermissions = departmentScoped ? hasAllDeptPermissions : hasAllPermissions;

  // Check OR rights (any)
  if (requiredRights.length > 0) {
    if (!checkAnyPermission(requiredRights)) {
      return <>{fallback}</>;
    }
  }

  // Check AND rights (all)
  if (requireAllRights.length > 0) {
    if (!checkAllPermissions(requireAllRights)) {
      return <>{fallback}</>;
    }
  }

  // Check roles
  if (requiredRoles.length > 0) {
    const roles = departmentScoped ? currentDepartmentRoles : roleHierarchy.globalRoles.map(r => r.role);
    const hasRole = requiredRoles.some(role => roles.includes(role));
    if (!hasRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

// Convenience wrappers
export function StaffOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { roleHierarchy } = useAuthStore();
  const isStaff = roleHierarchy?.allUserTypes.includes('staff');
  return isStaff ? <>{children}</> : <>{fallback}</>;
}

export function LearnerOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { roleHierarchy } = useAuthStore();
  const isLearner = roleHierarchy?.allUserTypes.includes('learner');
  return isLearner ? <>{children}</> : <>{fallback}</>;
}

export function AdminOnly({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { roleHierarchy, isAdminSessionActive } = useAuthStore();
  const isAdmin = roleHierarchy?.allUserTypes.includes('global-admin') && isAdminSessionActive;
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}
```

**Usage Examples:**
```typescript
// Hide/show UI elements
<ProtectedComponent requiredRights={['content:courses:manage']}>
  <Button onClick={createCourse}>Create Course</Button>
</ProtectedComponent>

// Department-scoped permissions
<ProtectedComponent
  requiredRights={['grades:own-classes:manage']}
  departmentScoped
  requireDepartment
>
  <GradebookButton />
</ProtectedComponent>

// Multiple requirements with fallback
<ProtectedComponent
  requireAllRights={['system:settings:manage']}
  fallback={<AccessDeniedMessage />}
>
  <AdminPanel />
</ProtectedComponent>

// Convenience wrappers
<StaffOnly>
  <StaffDashboardWidget />
</StaffOnly>
```

**Deliverables:**
- ✅ ProtectedComponent with full feature set
- ✅ Support for both global and scoped permissions
- ✅ Convenience wrappers (StaffOnly, LearnerOnly, AdminOnly)
- ✅ 25+ unit tests
- ✅ Storybook stories

---

#### Track 2B: Enhanced ProtectedLink & ProtectedNavLink (Days 3-4)
**Effort:** 6-8 hours
**Owner:** Developer B

**Tasks:**
1. Fix ProtectedLink multiple permission limitation
2. Create ProtectedNavLink wrapper
3. Update existing usages

**Implementation:**
```typescript
// src/shared/ui/ProtectedLink.tsx (UPDATE EXISTING)

import React, { useMemo } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/model';
import { useDepartmentContext } from '@/shared/hooks';

export interface ProtectedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  departmentScoped?: boolean;
  departmentId?: string;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}

export const ProtectedLink: React.FC<ProtectedLinkProps> = ({
  to,
  requiredPermission,
  requiredPermissions,
  requireAll = false,
  departmentScoped = false,
  departmentId,
  fallback = null,
  children,
  className,
  ...linkProps
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();
  const {
    hasPermission: hasDeptPermission,
    hasAnyPermission: hasAnyDeptPermission,
    hasAllPermissions: hasAllDeptPermissions,
    currentDepartmentId,
  } = useDepartmentContext();

  // Determine which permissions to check
  const permissionsToCheck = useMemo(() => {
    if (requiredPermissions && requiredPermissions.length > 0) {
      return requiredPermissions;
    }
    if (requiredPermission) {
      return [requiredPermission];
    }
    return [];
  }, [requiredPermission, requiredPermissions]);

  // If no permissions required, always show
  if (permissionsToCheck.length === 0) {
    return (
      <Link to={to} className={className} {...linkProps}>
        {children}
      </Link>
    );
  }

  // Choose permission checking functions
  let hasAccess = false;

  if (departmentId) {
    // Specific department
    if (requireAll) {
      hasAccess = permissionsToCheck.every(p =>
        hasPermission(p, { type: 'department', id: departmentId })
      );
    } else {
      hasAccess = permissionsToCheck.some(p =>
        hasPermission(p, { type: 'department', id: departmentId })
      );
    }
  } else if (departmentScoped && currentDepartmentId) {
    // Current department
    hasAccess = requireAll
      ? hasAllDeptPermissions(permissionsToCheck)
      : hasAnyDeptPermission(permissionsToCheck);
  } else {
    // Global permissions
    hasAccess = requireAll
      ? hasAllPermissions(permissionsToCheck)
      : hasAnyPermission(permissionsToCheck);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return (
    <Link to={to} className={className} {...linkProps}>
      {children}
    </Link>
  );
};
```

**ProtectedNavLink:**
```typescript
// src/shared/components/nav/ProtectedNavLink.tsx (NEW FILE)

import { NavLink, NavLinkProps } from 'react-router-dom';
import { ProtectedComponent } from '@/shared/components/auth/ProtectedComponent';

interface ProtectedNavLinkProps extends Omit<NavLinkProps, 'to'> {
  to: string;
  requiredRights?: string[];
  requireAllRights?: string[];
  requiredRoles?: string[];
  departmentScoped?: boolean;
  children: React.ReactNode;
}

export function ProtectedNavLink({
  to,
  requiredRights,
  requireAllRights,
  requiredRoles,
  departmentScoped,
  children,
  ...navLinkProps
}: ProtectedNavLinkProps) {
  return (
    <ProtectedComponent
      requiredRights={requiredRights}
      requireAllRights={requireAllRights}
      requiredRoles={requiredRoles}
      departmentScoped={departmentScoped}
    >
      <NavLink to={to} {...navLinkProps}>
        {children}
      </NavLink>
    </ProtectedComponent>
  );
}
```

**Deliverables:**
- ✅ ProtectedLink fixed for multiple permissions
- ✅ ProtectedNavLink wrapper created
- ✅ Backward compatible with existing code
- ✅ 20+ tests (update existing + new)

---

#### Track 2C: useFeatureAccess Hook (Day 5)
**Effort:** 4-6 hours
**Owner:** Developer A or B

**Implementation:**
```typescript
// src/shared/hooks/useFeatureAccess.ts (NEW FILE)

import { useMemo } from 'react';
import { useAuthStore } from '@/features/auth/model';
import { useDepartmentContext } from './useDepartmentContext';

/**
 * Centralized feature access flags
 * Provides boolean flags for all major features
 */
export function useFeatureAccess() {
  const {
    roleHierarchy,
    isAdminSessionActive,
    hasPermission,
  } = useAuthStore();

  const {
    currentDepartmentId,
    hasPermission: hasDeptPermission,
  } = useDepartmentContext();

  return useMemo(() => {
    if (!roleHierarchy) {
      return {} as FeatureAccessFlags;
    }

    const userTypes = roleHierarchy.allUserTypes;

    return {
      // User type flags
      isLearner: userTypes.includes('learner'),
      isStaff: userTypes.includes('staff'),
      isGlobalAdmin: userTypes.includes('global-admin'),
      isAdminActive: isAdminSessionActive,

      // Department context
      hasDepartmentSelected: !!currentDepartmentId,

      // Course features (department-scoped)
      canViewCourses: hasDeptPermission('content:courses:read'),
      canManageCourses: hasDeptPermission('content:courses:manage'),
      canCreateCourses: hasDeptPermission('content:courses:manage'),

      // Class features
      canViewClasses: hasDeptPermission('class:own:read'),
      canManageClasses: hasDeptPermission('class:own:manage'),

      // Grading features
      canGradeOwnClasses: hasDeptPermission('grades:own-classes:manage'),
      canViewAllGrades: hasDeptPermission('learner:grades:read'),
      canViewOwnGrades: hasDeptPermission('grades:own:read'),

      // Learner data (FERPA-protected)
      canViewTranscripts: hasDeptPermission('learner:transcripts:read'),
      canViewPII: hasDeptPermission('learner:pii:read'),
      canViewLearnerProgress: hasDeptPermission('learner:progress:read'),

      // Reporting
      canViewDepartmentReports: hasDeptPermission('reports:department:read'),
      canViewOwnClassReports: hasDeptPermission('reports:own-classes:read'),
      canViewOwnReports: hasDeptPermission('reports:own:read'),

      // Financial features
      canViewBilling: hasDeptPermission('billing:transactions:read'),
      canManageBilling: hasDeptPermission('billing:transactions:manage'),

      // Settings
      canManageDepartmentSettings: hasDeptPermission('settings:department:manage'),
      canManageSystemSettings: hasPermission('system:settings:manage'),

      // Admin dashboard
      canAccessAdminDashboard: userTypes.includes('global-admin') && isAdminSessionActive,

      // Audit logs
      canViewAuditLogs: hasPermission('system:audit-logs:read'),
    };
  }, [roleHierarchy, isAdminSessionActive, currentDepartmentId, hasPermission, hasDeptPermission]);
}

export interface FeatureAccessFlags {
  // User types
  isLearner: boolean;
  isStaff: boolean;
  isGlobalAdmin: boolean;
  isAdminActive: boolean;

  // Context
  hasDepartmentSelected: boolean;

  // Features
  canViewCourses: boolean;
  canManageCourses: boolean;
  canCreateCourses: boolean;
  canViewClasses: boolean;
  canManageClasses: boolean;
  canGradeOwnClasses: boolean;
  canViewAllGrades: boolean;
  canViewOwnGrades: boolean;
  canViewTranscripts: boolean;
  canViewPII: boolean;
  canViewLearnerProgress: boolean;
  canViewDepartmentReports: boolean;
  canViewOwnClassReports: boolean;
  canViewOwnReports: boolean;
  canViewBilling: boolean;
  canManageBilling: boolean;
  canManageDepartmentSettings: boolean;
  canManageSystemSettings: boolean;
  canAccessAdminDashboard: boolean;
  canViewAuditLogs: boolean;
}
```

**Usage:**
```typescript
function MyComponent() {
  const features = useFeatureAccess();

  return (
    <div>
      {features.canManageCourses && <CreateCourseButton />}
      {features.canGradeOwnClasses && <GradebookLink />}
      {features.canViewTranscripts && <TranscriptsSection />}
      {features.isAdminActive && <AdminMenu />}
    </div>
  );
}
```

**Deliverables:**
- ✅ useFeatureAccess hook
- ✅ 20+ feature flags
- ✅ Comprehensive documentation
- ✅ 15+ tests

---

**Phase 2 Success Criteria:**
- ✅ ProtectedComponent works in all scenarios
- ✅ ProtectedLink handles multiple permissions
- ✅ useFeatureAccess reduces code duplication
- ✅ All components have >85% test coverage
- ✅ Storybook documentation complete

---

### Phase 3: Data Masking & Audit Logging (Week 2, Days 1-3)
**Goal:** Privacy compliance and audit trail

**Priority:** P1 - HIGH
**Duration:** 3 days
**Effort:** 18-24 hours
**Team:** 2 Developers
**Dependencies:** Phase 1 complete (SensitiveDataWarning)

---

#### Track 3A: Data Masking Utilities (Days 1-2)
**Effort:** 10-14 hours

**Implementation:**
```typescript
// src/shared/lib/dataMasking.ts (NEW FILE)

/**
 * Data Masking Utilities
 * Detect and handle masked data from backend
 */

/**
 * Check if a name appears to be masked
 * Backend masks as: "FirstName L." or "FirstName L"
 */
export function isMaskedName(name: string): boolean {
  if (!name) return false;

  // Pattern: "FirstName L." or "FirstName L"
  const maskedPattern = /^[A-Z][a-z]+\s[A-Z]\.?$/;
  return maskedPattern.test(name.trim());
}

/**
 * Check if learner data is masked
 */
export function isLearnerMasked(learner: {
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}): boolean {
  if (!learner) return false;

  // Check lastName is single letter
  if (learner.lastName && learner.lastName.length === 1) return true;

  // Check name field follows masked pattern
  if (learner.name && isMaskedName(learner.name)) return true;

  // Check email is hidden
  if (learner.email === '(hidden)' || !learner.email) return true;

  return false;
}

/**
 * Format learner name consistently
 */
export function formatLearnerName(learner: {
  name?: string;
  firstName?: string;
  lastName?: string;
}): string {
  if (!learner) return '(Unknown)';

  // Prefer name field
  if (learner.name) return learner.name;

  // Fallback to firstName + lastName
  if (learner.firstName && learner.lastName) {
    return `${learner.firstName} ${learner.lastName}`;
  }

  if (learner.firstName) return learner.firstName;

  return '(Unknown)';
}

/**
 * Check if email is masked
 */
export function isMaskedEmail(email: string): boolean {
  return email === '(hidden)' || email === '' || !email;
}

/**
 * Format email for display (handle masked)
 */
export function formatEmail(email: string): string {
  if (isMaskedEmail(email)) {
    return '(Privacy Protected)';
  }
  return email;
}
```

**UI Components:**
```typescript
// src/shared/components/data/LearnerName.tsx (NEW FILE)

import { formatLearnerName, isLearnerMasked } from '@/shared/lib/dataMasking';
import { Lock } from 'lucide-react';

interface LearnerNameProps {
  learner: {
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  showMaskedIndicator?: boolean;
  className?: string;
}

export function LearnerName({
  learner,
  showMaskedIndicator = true,
  className = '',
}: LearnerNameProps) {
  const name = formatLearnerName(learner);
  const masked = isLearnerMasked(learner);

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span>{name}</span>
      {masked && showMaskedIndicator && (
        <Lock
          className="h-3 w-3 text-muted-foreground"
          title="Full name hidden for privacy"
        />
      )}
    </span>
  );
}
```

**Deliverables:**
- ✅ Data masking detection utilities
- ✅ LearnerName component
- ✅ Email formatting utilities
- ✅ 25+ unit tests

---

#### Track 3B: Audit Logging (Day 3)
**Effort:** 6-8 hours

**Implementation:**
```typescript
// src/shared/lib/auditLog.ts (NEW FILE)

import apiClient from '@/shared/api/client';

export type SensitiveCategory = 'ferpa' | 'billing' | 'pii' | 'audit';

export interface AuditLogEntry {
  action: string;
  resourceType: string;
  resourceId: string;
  sensitiveCategory: SensitiveCategory;
  timestamp?: string;
  metadata?: Record<string, any>;
}

/**
 * Log sensitive data access
 * Sends to backend audit log endpoint
 */
export async function logSensitiveDataAccess(entry: AuditLogEntry): Promise<void> {
  try {
    await apiClient.post('/audit-logs', {
      ...entry,
      timestamp: entry.timestamp || new Date().toISOString(),
      source: 'ui',
    });

    console.log('[AuditLog] Logged:', entry.action);
  } catch (error) {
    // Log locally if API fails (don't block user)
    console.error('[AuditLog] Failed to log:', error);

    // Store in local queue for retry
    queueFailedLog(entry);
  }
}

// Queue for failed logs (retry on next API call)
let failedLogQueue: AuditLogEntry[] = [];

function queueFailedLog(entry: AuditLogEntry): void {
  failedLogQueue.push(entry);

  // Limit queue size
  if (failedLogQueue.length > 50) {
    failedLogQueue = failedLogQueue.slice(-50);
  }
}

/**
 * Retry failed audit logs
 */
export async function retryFailedLogs(): Promise<void> {
  if (failedLogQueue.length === 0) return;

  const logsToRetry = [...failedLogQueue];
  failedLogQueue = [];

  for (const entry of logsToRetry) {
    try {
      await logSensitiveDataAccess(entry);
    } catch (error) {
      // Re-queue if still failing
      queueFailedLog(entry);
    }
  }
}

/**
 * Hook to auto-log sensitive data access
 */
export function useAuditLog(entry: AuditLogEntry, condition: boolean = true) {
  React.useEffect(() => {
    if (condition) {
      logSensitiveDataAccess(entry);
    }
  }, [condition, entry.resourceId]); // Re-log if resource changes
}
```

**Usage:**
```typescript
// In components
function TranscriptPage({ studentId }: { studentId: string }) {
  useAuditLog({
    action: 'view_transcript',
    resourceType: 'transcript',
    resourceId: studentId,
    sensitiveCategory: 'ferpa',
  });

  return <TranscriptContent studentId={studentId} />;
}

// Or manual
const handleDownloadTranscript = async () => {
  await logSensitiveDataAccess({
    action: 'download_transcript',
    resourceType: 'transcript',
    resourceId: studentId,
    sensitiveCategory: 'ferpa',
    metadata: { format: 'pdf' },
  });

  // Proceed with download
  downloadPDF();
};
```

**Deliverables:**
- ✅ Audit logging utility
- ✅ useAuditLog hook
- ✅ Failed log queue with retry
- ✅ 15+ tests

---

**Phase 3 Success Criteria:**
- ✅ All masked data detected and displayed correctly
- ✅ All FERPA access logged
- ✅ Failed logs queued for retry
- ✅ >85% test coverage

---

### Phase 4: Error Handling & Polish (Week 2, Days 4-5)
**Goal:** Better error UX

**Priority:** P3 - LOW
**Duration:** 2 days
**Effort:** 10-12 hours
**Team:** 1 Developer
**Dependencies:** Phases 1-3 complete

#### Track 4A: Authorization Error Components
**Effort:** 6-8 hours

**Implementation:**
```typescript
// src/shared/components/errors/AuthorizationError.tsx (NEW FILE)

import { Button } from '@/shared/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/shared/ui/alert';
import { Lock, AlertCircle } from 'lucide-react';

interface AuthorizationErrorProps {
  status: 401 | 403;
  code?: string;
  message?: string;
  onRetry?: () => void;
  onGoBack?: () => void;
}

const ERROR_CONFIG = {
  401: {
    title: 'Authentication Required',
    description: 'Your session has expired. Please log in again.',
    action: 'Log In',
    icon: Lock,
  },
  403: {
    title: 'Access Denied',
    description: 'You do not have permission to access this resource.',
    action: 'Go Back',
    icon: AlertCircle,
  },
};

export function AuthorizationError({
  status,
  code,
  message,
  onRetry,
  onGoBack,
}: AuthorizationErrorProps) {
  const config = ERROR_CONFIG[status];
  const Icon = config.icon;

  const handleAction = () => {
    if (status === 401) {
      window.location.href = '/login';
    } else if (onGoBack) {
      onGoBack();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Alert variant={status === 401 ? 'default' : 'destructive'} className="max-w-md">
        <Icon className="h-5 w-5" />
        <AlertTitle>{config.title}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{message || config.description}</p>
          {code && (
            <p className="text-sm text-muted-foreground">Error Code: {code}</p>
          )}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleAction} size="sm">
              {config.action}
            </Button>
            {onRetry && status === 403 && (
              <Button onClick={onRetry} variant="outline" size="sm">
                Retry
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

**Deliverables:**
- ✅ AuthorizationError component
- ✅ Error boundary wrapper
- ✅ Integration with API client
- ✅ 10+ tests

#### Track 4B: Documentation & Examples
**Effort:** 4 hours

**Deliverables:**
- ✅ Update README with new components
- ✅ Create Storybook stories
- ✅ Add JSDoc comments
- ✅ Create migration guide

---

**Phase 4 Success Criteria:**
- ✅ Better error messages
- ✅ Clear actions for users
- ✅ Comprehensive documentation

---

## Implementation Timeline

| Phase | Duration | Parallel? | Dependencies |
|-------|----------|-----------|--------------|
| **Phase 1** | 2 days | Track A & B parallel | None |
| **Phase 2** | 3 days | All tracks parallel | None |
| **Phase 3** | 3 days | Track A & B parallel | Phase 1 |
| **Phase 4** | 2 days | Single track | Phases 1-3 |
| **Total** | **10 days** | With parallelization | 2 weeks calendar |

**With full parallelization:** 1.5-2 weeks calendar time

---

## Resource Allocation

| Phase | Developers | Skills Required | Time Commitment |
|-------|------------|-----------------|-----------------|
| Phase 1 | 1-2 | Senior, security-aware | 2 days |
| Phase 2 | 2 | Mid-Senior, React | 3 days |
| Phase 3 | 2 | Mid-level | 3 days |
| Phase 4 | 1 | Mid-level | 2 days |

**Total Effort:** 56-72 hours
**Team Size:** 2-3 developers (rotating)

---

## Testing Strategy

### Unit Tests
- **Target:** >85% coverage for all new code
- **Tools:** Vitest, React Testing Library
- **Focus:** Component behavior, permission logic

### Integration Tests
- **Target:** All authorization flows
- **Tools:** MSW for API mocking
- **Focus:** End-to-end permission checking

### Manual Testing Checklist
- [ ] Admin token memory storage (check localStorage is empty)
- [ ] FERPA warnings on sensitive pages
- [ ] Masked data displays correctly
- [ ] Audit logs sent to backend
- [ ] Protected components hide/show correctly
- [ ] Navigation respects permissions
- [ ] 401/403 errors handled gracefully

---

## Success Metrics

| Metric | Before | After | Target |
|--------|--------|-------|--------|
| Admin token in localStorage | Yes (insecure) | No (memory) | 100% secure |
| FERPA warnings | 0% pages | 100% pages | 100% coverage |
| Audit logging | None | All sensitive | 100% logged |
| Data masking detection | None | All learner data | 100% detected |
| Authorization components | 2 | 8 | Full coverage |
| Test coverage | N/A | >85% | >85% |

---

## Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Admin token breaks existing flow | LOW | HIGH | Thorough testing, feature flag |
| FERPA warnings annoying users | MEDIUM | LOW | Session memory, one-time per resource |
| Audit log API doesn't exist | LOW | MEDIUM | Create mock endpoint, implement later |
| Performance impact (many checks) | LOW | MEDIUM | Memoization, useFeatureAccess |
| Breaking changes to existing code | MEDIUM | MEDIUM | Backward compatibility, gradual migration |

---

## Migration Strategy

### Backward Compatibility
- ✅ All new components optional
- ✅ Existing ProtectedRoute still works
- ✅ Existing ProtectedLink enhanced, not replaced
- ✅ No breaking changes to authStore

### Gradual Adoption
1. **Week 1:** Deploy Phase 1 (security fixes) immediately
2. **Week 2:** Deploy Phase 2-3 (new components) with feature flag
3. **Week 3:** Migrate existing code to new components
4. **Week 4:** Remove old patterns, cleanup

---

## Documentation Deliverables

1. **Component API Docs** - All new components documented
2. **Migration Guide** - How to adopt new components
3. **Security Best Practices** - Do's and don'ts
4. **Storybook Stories** - Visual examples
5. **Testing Guide** - How to test authorization

---

## Next Steps

1. ✅ Review this plan with engineering team
2. ✅ Allocate developers for Phase 1
3. ✅ Schedule security review for admin token changes
4. ✅ Create tracking issues (GitHub/JIRA)
5. ✅ Set up feature flags for gradual rollout
6. 🚀 **Kick off Phase 1 - Critical Security Fixes**

---

## Appendix

### A. Component Compatibility Matrix

| Component | Guide Required | Currently Exists | Status | Phase |
|-----------|---------------|------------------|--------|-------|
| ProtectedRoute | ✅ | ✅ | Compatible | N/A |
| ProtectedComponent | ✅ | ❌ | Missing | Phase 2 |
| ProtectedNavLink | ✅ | ❌ | Missing | Phase 2 |
| ProtectedLink | ✅ | ⚠️ | Needs enhancement | Phase 2 |
| SensitiveDataWarning | ✅ | ❌ | Missing | Phase 1 |
| Admin token storage | ✅ | ❌ | Insecure | Phase 1 |
| useFeatureAccess | ✅ | ❌ | Missing | Phase 2 |
| Data masking utils | ✅ | ❌ | Missing | Phase 3 |
| Audit logging | ✅ | ❌ | Missing | Phase 3 |
| AuthorizationError | ✅ | ❌ | Missing | Phase 4 |

### B. Access Rights Reference

Commonly used access rights in the system:

**Content:**
- `content:courses:read` - View courses
- `content:courses:manage` - Create/edit/delete courses

**Grading:**
- `grades:own-classes:manage` - Grade own classes
- `learner:grades:read` - View all learner grades
- `grades:own:read` - View own grades

**FERPA-Protected:**
- `learner:transcripts:read` - View transcripts
- `learner:pii:read` - View PII
- `learner:progress:read` - View progress

**System:**
- `system:settings:manage` - Manage system settings
- `system:audit-logs:read` - View audit logs
- `system:*` - All system permissions (global-admin)

---

**Document Version:** 1.0
**Created:** 2026-01-11
**Owner:** Frontend Architecture Team
**Status:** Ready for Approval

---

**End of Plan**
