# Role System Architecture Plan
**Version:** 1.0
**Date:** 2026-01-10
**Status:** Planning

## Executive Summary

This document outlines a comprehensive redesign of the LMS role and permission system to provide "systemic clarity" by:
1. Creating a unified `IRole` interface that defines all available roles system-wide
2. Implementing a `UserType → Role Hierarchy` that supports department-scoped roles for **both learners and staff**
3. Adding a role concatenation function that provides complete role visibility
4. Introducing a `defaultDashboard` field for predictable navigation
5. Supporting:
   - **Learner roles**: Department-scoped (course-taker, auditor, supervisor) - role applies to ALL courses in that department
   - **Staff roles**: Department-scoped (instructor, content-admin, department-admin, billing-admin) - independent roles per department with aggregated dashboard
   - **System-admin roles**: System-wide (system-admin, user-admin, integration-admin, settings-admin) - no department scoping

## Problem Statement

### Current Issues
1. **Multiple Role Stores**: Roles exist in both `User.roles[]` and `Staff.departmentMemberships[].roles[]` causing confusion
2. **No Clear UserType**: Must infer user type from profile existence (Staff vs Learner)
3. **Navigation Ambiguity**: No explicit `defaultDashboard` field causes unpredictable redirects
4. **Missing Contract**: No system-wide definition of which roles are valid for which userTypes
5. **Scope Confusion**: Department-scoped roles not clearly integrated with global roles

### User's Core Requirement
> "We need systemic clarity here. We need there to be a definition of a system wide role interface, similar to IRole. Every person should have access to the IRole interface which would give the specific role that are available to that userType."

---

## Architecture Overview

### Three Distinct Role Scoping Models by UserType

**Critical Architectural Decision:** Both Learner and Staff roles are department-scoped. System-admin roles are system-wide.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    LEARNER UserType                                  │
│  Roles: Department-Scoped                                           │
├─────────────────────────────────────────────────────────────────────┤
│  • Roles assigned PER DEPARTMENT (not per course)                  │
│  • One role per department applies to ALL courses in that dept      │
│  • Examples: course-taker, auditor, supervisor                      │
│                                                                       │
│  Dashboard Behavior:                                                 │
│  - Shows all courses across all enrolled departments                │
│  - Aggregates progress and analytics across departments             │
│                                                                       │
│  Operations:                                                          │
│  - Course viewing/enrollment scoped to department                   │
│  - Exam taking scoped to department role                            │
│  - If 'course-taker' in CS → can take ALL CS courses               │
│  - If 'auditor' in Math → can only view Math courses (no exams)   │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    STAFF UserType                                    │
│  Roles: Department-Scoped                                           │
├─────────────────────────────────────────────────────────────────────┤
│  • Roles assigned independently PER DEPARTMENT                      │
│  • Can have different roles in different departments                │
│  • Can have multiple roles within same department                   │
│  • Examples: instructor, content-admin, department-admin            │
│                                                                       │
│  Dashboard Behavior:                                                 │
│  - Shows aggregated data from ALL departments by default            │
│  - Combined view of classes, students, courses across depts         │
│  - Can drill down to specific department                            │
│                                                                       │
│  Operations:                                                          │
│  - Viewing is PERMISSIVE (see all cross-department data)           │
│  - Actions are RESTRICTIVE (must have role in that department)     │
│  - Creating course → requires content-admin in THAT department     │
│  - Managing class → requires instructor/dept-admin in THAT dept    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                SYSTEM-ADMIN UserType                                 │
│  Roles: System-Wide (No Department Scoping)                         │
├─────────────────────────────────────────────────────────────────────┤
│  • Roles apply system-wide, no department restrictions              │
│  • Examples: system-admin, user-admin, integration-admin            │
│                                                                       │
│  Dashboard Behavior:                                                 │
│  - Shows system-wide analytics and settings                         │
│  - Access to all departments without membership                     │
│                                                                       │
│  Operations:                                                          │
│  - Add/remove users to departments                                  │
│  - Manage cohorts/classes across all departments                    │
│  - Configure system settings and UI elements                        │
│  - Assign roles to users                                            │
│  - Future: Settings-admin can have sub-scopes for setting groups   │
└─────────────────────────────────────────────────────────────────────┘
```

### Three Pillars of the New System

```
┌─────────────────────────────────────────────────────────────┐
│                    IRole Contract                            │
│  (System-wide definition of all available roles)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              UserType → Role Hierarchy                       │
│  (Defines which roles are valid for each userType)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│           Role Concatenation Function                        │
│  (Provides complete view of all user roles with scope)      │
└─────────────────────────────────────────────────────────────┘
```

### Two-Section Navigation Architecture

**Critical UI Pattern:** The sidebar uses a two-section structure for managing department-scoped operations:

```
┌────────────────────────────────────────────────────┐
│  SIDEBAR STRUCTURE                                 │
├────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 1: GLOBAL NAVIGATION                      │
│  ════════════════════════════════                  │
│  • UserType-based links (always visible)          │
│  • Work across ALL departments                     │
│  • Examples: Dashboard, My Profile, Analytics      │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 2: DEPARTMENT SELECTOR                    │
│  ════════════════════════════════                  │
│  • Lists all user's departments                    │
│  • Click to select/activate department             │
│  • Visual indicator shows current selection        │
│  • Remembers last accessed per user                │
│                                                     │
├────────────────────────────────────────────────────┤
│                                                     │
│  SECTION 3: DEPARTMENT ACTIONS                     │
│  ════════════════════════════════                  │
│  • Only visible when department selected           │
│  • Shows actions for THAT specific department      │
│  • Filtered by user's roles IN THAT DEPARTMENT     │
│  • Path includes department ID context             │
│                                                     │
└────────────────────────────────────────────────────┘

FLOW EXAMPLE:
1. User logs in → Global Nav visible, NO dept selected
2. User clicks "CS Department" → CS becomes active
3. Department Actions populate with CS-specific links
4. User clicks "Create Course" → Creates in CS department
5. Selection persisted → Next login remembers CS dept
```

**Default Behavior:**
- **Initial state**: NO department selected
- **Department actions**: Greyed out/hidden until department selected
- **Persistence**: Last accessed department remembered per user
- **Mobile**: Sidebar slides in, shows department selector first

**Why This Matters:**
- **Prevents ambiguity**: User always knows which department they're working in
- **Proper scoping**: Operations automatically scoped to selected department
- **Role clarity**: Only shows actions user can perform in selected department
- **Scales**: Works for 1 department or 20+ departments

---

## 1. IRole Interface Definition

### Core Interface

```typescript
/**
 * System-wide role definition
 * All roles in the system must conform to this interface
 */
interface IRole {
  /** Unique role identifier */
  name: string;

  /** Human-readable role name */
  displayName: string;

  /** Description of role purpose and capabilities */
  description: string;

  /** Which userTypes can have this role */
  applicableUserTypes: UserType[];

  /** Can this role be scoped to a specific entity? */
  scopeType: 'none' | 'department' | 'system-setting-group';

  /** Is this role required to have a scope? */
  requiresScope: boolean;

  /**
   * Scoping clarification:
   * - 'none': Role applies system-wide (e.g., system-admin, guest learner)
   * - 'department': Role applies per department (BOTH learner and staff roles)
   * - 'system-setting-group': Role applies to specific setting groups (system-admin subroles)
   */

  /** Permissions granted by this role */
  permissions: string[];

  /** Is this role active/available in the system? */
  isActive: boolean;

  /** Priority for defaultDashboard calculation (higher = takes precedence) */
  dashboardPriority: number;
}
```

### UserType Definition

```typescript
/**
 * Core user types in the system
 */
type UserType = 'learner' | 'staff' | 'system-admin';

/**
 * Dashboard options corresponding to userTypes
 */
type DashboardType = 'learner' | 'staff' | 'admin';

/**
 * Mapping from userType to dashboard route
 */
const USER_TYPE_DASHBOARD_MAP: Record<UserType, DashboardType> = {
  'learner': 'learner',
  'staff': 'staff',
  'system-admin': 'admin'
};
```

---

## 2. Role Catalog by UserType

### Learner Roles (Department-Scoped)

**IMPORTANT: Department-Scoped Learner Roles**

Learner roles are assigned **per department enrollment**, NOT per course. This means:
- A learner can be a `course-taker` in the CS department but an `auditor` in the Math department
- A learner can have different roles in different departments (e.g., `supervisor` in one, `course-taker` in another)
- The learner's role applies to **ALL courses within that department**
- Dashboard shows all enrolled courses across all departments
- Abilities within courses depend on the learner's role **in that course's department**

**Dashboard Analytics Behavior:**
- Dashboard shows all courses across all departments the learner is enrolled in
- Analytics and progress tracking aggregate across all department enrollments
- Learners can filter/drill down to view department-specific progress

**Permission Types:**
- `dashboard:*` - Dashboard viewing permissions (automatically aggregate across all learner's departments)
- `course:*-department` - Course operations scoped to specific department
- `exam:*-department` - Exam operations scoped to specific department

```typescript
const LEARNER_ROLES: IRole[] = [
  {
    name: 'course-taker',
    displayName: 'Course Taker',
    description: 'Standard learner who can enroll in and complete courses within a department',
    applicableUserTypes: ['learner'],
    scopeType: 'department',
    requiresScope: true,  // Must be assigned per department
    permissions: [
      // Dashboard permissions (aggregated across all departments)
      'dashboard:view-my-courses',
      'dashboard:view-my-progress',
      'dashboard:view-my-grades',
      'dashboard:view-my-certificates',

      // Department-scoped course access
      'course:view-department',
      'course:enroll-department',
      'lesson:view-department',
      'lesson:complete-department',
      'exam:attempt-department',
      'exam:view-results-own',
      'grade:view-own-department',
      'certificate:view-own-department',
      'certificate:download-own-department',

      // Class participation (within department)
      'class:view-own-department',
      'class:participate-department',
      'discussion:view-department',
      'discussion:post-department'
    ],
    isActive: true,
    dashboardPriority: 10
  },
  {
    name: 'auditor',
    displayName: 'Auditor',
    description: 'Learner who can view course content but cannot earn credit or complete exams within a department',
    applicableUserTypes: ['learner'],
    scopeType: 'department',
    requiresScope: true,  // Must be assigned per department
    permissions: [
      // Dashboard permissions (view only)
      'dashboard:view-my-courses',

      // Limited department-scoped access (view only, no exams/grades)
      'course:view-department',
      'lesson:view-department',
      'class:view-own-department',
      'discussion:view-department'
      // Note: No exam:attempt, grade:view, or certificate permissions
    ],
    isActive: true,
    dashboardPriority: 5
  },
  {
    name: 'supervisor',
    displayName: 'Course Supervisor',
    description: 'Learner with elevated permissions to help facilitate courses within a department (e.g., TA, peer mentor)',
    applicableUserTypes: ['learner'],
    scopeType: 'department',
    requiresScope: true,  // Must be assigned per department
    permissions: [
      // All course-taker permissions
      'dashboard:view-my-courses',
      'dashboard:view-my-progress',
      'dashboard:view-my-grades',
      'course:view-department',
      'course:enroll-department',
      'lesson:view-department',
      'lesson:complete-department',
      'exam:attempt-department',
      'exam:view-results-own',
      'grade:view-own-department',

      // Plus supervision permissions
      'course:view-all-enrollments-department',
      'student:view-department',
      'discussion:moderate-department',
      'discussion:pin-department',
      'grade:view-others-department',  // Can see other students' grades
      'report:view-course-progress-department'
    ],
    isActive: true,
    dashboardPriority: 15
  },
  {
    name: 'guest',
    displayName: 'Guest Learner',
    description: 'Limited access learner, can preview public courses only (not department-scoped)',
    applicableUserTypes: ['learner'],
    scopeType: 'none',  // No department scope - system-wide guest access
    requiresScope: false,
    permissions: [
      'course:view-public',
      'lesson:view-public',
      'course:preview-public'
    ],
    isActive: true,
    dashboardPriority: 1
  }
];
```

**Example: Multi-Department Learner**

```typescript
// Alex is enrolled in 3 departments with different roles:
{
  departmentEnrollments: [
    {
      departmentId: "dept_cs",
      role: 'course-taker',  // Can take exams, earn credit in CS
      enrolledAt: "2025-09-01",
      isActive: true
    },
    {
      departmentId: "dept_math",
      role: 'auditor',  // Can only view content in Math
      enrolledAt: "2025-09-01",
      isActive: true
    },
    {
      departmentId: "dept_business",
      role: 'supervisor',  // Is a TA/mentor in Business
      enrolledAt: "2025-08-15",
      isActive: true
    }
  ]
}

// Alex's Dashboard Shows:
// - All courses from CS, Math, and Business departments
// - Progress and grades for CS and Business courses only (not Math - auditor)
// - Additional supervision tools for Business department courses
//
// Alex's Abilities:
// - CS Courses: Full participation, can take exams, earn certificates
// - Math Courses: View-only, cannot take exams or earn credit
// - Business Courses: Full participation + can view other students' progress
```

### Staff Roles (Department-Scoped)

**IMPORTANT: Multi-Department Role Assignment**

Staff roles are assigned **independently per department**. A single user can have:
- Different roles in different departments (e.g., instructor in CS, department-admin in Math)
- The same role in multiple departments (e.g., content-admin in both CS and Business)
- Multiple roles within the same department (e.g., both instructor and content-admin in CS)

**Dashboard Analytics Behavior:**
- Dashboard analytics **automatically aggregate across ALL departments** the user belongs to
- The dashboard shows combined data from all departments by default
- Users can drill down to view department-specific data
- Operations (create, edit, delete) are scoped to the specific department based on role

**Permission Types:**
- `dashboard:*` - Dashboard viewing permissions (automatically aggregate across all user's departments)
- `*:view-department` - View operations scoped to specific department
- `*:manage-department` - Management operations scoped to specific department
- `*:create`, `*:edit`, `*:delete` - Must be performed within a department context

```typescript
const STAFF_ROLES: IRole[] = [
  {
    name: 'instructor',
    displayName: 'Instructor',
    description: 'Teaches classes and grades student work within assigned department',
    applicableUserTypes: ['staff'],
    scopeType: 'department',
    requiresScope: true,  // Must be assigned per department
    permissions: [
      // Dashboard permissions (aggregated across all departments user is instructor in)
      'dashboard:view-my-classes',
      'dashboard:view-my-students',
      'dashboard:view-my-grades',

      // Department-scoped view permissions
      'class:view-department',
      'class:manage-own',
      'course:view-department',
      'student:view-department',
      'grade:view-department',
      'grade:manage',
      'exam-attempt:view-department',
      'exam-attempt:grade',

      // Class-level operations (scoped to classes they teach)
      'class:edit-own',
      'class:attendance-own',
      'class:roster-own',

      // Reporting (scoped to their classes)
      'report:view-own-classes',
      'report:generate-own-classes'
    ],
    isActive: true,
    dashboardPriority: 50
  },
  {
    name: 'content-admin',
    displayName: 'Content Administrator',
    description: 'Creates and manages courses and programs within assigned department',
    applicableUserTypes: ['staff'],
    scopeType: 'department',
    requiresScope: true,
    permissions: [
      // Dashboard permissions (aggregated across all departments)
      'dashboard:view-courses',
      'dashboard:view-course-analytics',

      // Department-scoped course management
      'course:view-department',
      'course:create-department',
      'course:edit-department',
      'course:delete-department',
      'course:publish-department',
      'course-segment:manage-department',
      'lesson:manage-department',
      'exam:manage-department',
      'question:manage-department',

      // Program management (scoped to department)
      'program:view-department',
      'program:create-department',
      'program:edit-department',
      'program:delete-department',

      // Reporting (scoped to department courses)
      'report:view-department-courses',
      'report:generate-department-courses',
      'analytics:view-department-courses'
    ],
    isActive: true,
    dashboardPriority: 60
  },
  {
    name: 'department-admin',
    displayName: 'Department Administrator',
    description: 'Manages all department operations including staff, classes, and reporting',
    applicableUserTypes: ['staff'],
    scopeType: 'department',
    requiresScope: true,
    permissions: [
      // Dashboard permissions (aggregated across all departments they admin)
      'dashboard:view-department-overview',
      'dashboard:view-department-analytics',
      'dashboard:view-department-staff',
      'dashboard:view-department-students',

      // All instructor permissions within department
      'class:view-department',
      'class:manage-own',
      'class:view-all-department',
      'class:create-department',
      'class:edit-all-department',
      'class:delete-department',
      'course:view-department',
      'student:view-department',
      'student:view-all-department',
      'grade:view-department',
      'grade:manage',
      'exam-attempt:view-department',
      'exam-attempt:grade',

      // Department management
      'department:view',
      'department:edit',

      // Staff management within department
      'staff:view-department',
      'staff:assign-department',
      'staff:remove-department',

      // Full reporting access within department
      'report:view-department-all',
      'report:generate-department-all',
      'analytics:view-department-all',
      'analytics:export-department'
    ],
    isActive: true,
    dashboardPriority: 70
  },
  {
    name: 'billing-admin',
    displayName: 'Billing Administrator',
    description: 'Manages billing and financial operations within department',
    applicableUserTypes: ['staff'],
    scopeType: 'department',
    requiresScope: true,
    permissions: [
      // Dashboard permissions (aggregated across all departments)
      'dashboard:view-billing',
      'dashboard:view-financial-summary',

      // Billing operations (scoped to department)
      'billing:view-department',
      'billing:manage-department',
      'invoice:view-department',
      'invoice:create-department',
      'invoice:edit-department',
      'invoice:send-department',
      'payment:view-department',
      'payment:process-department',
      'payment:refund-department',

      // Financial reporting (scoped to department)
      'report:view-financial-department',
      'report:generate-financial-department',
      'analytics:view-financial-department'
    ],
    isActive: true,
    dashboardPriority: 65
  },
  {
    name: 'reporting-analyst',
    displayName: 'Reporting Analyst',
    description: 'Views and generates reports across all system departments with drill-down capability',
    applicableUserTypes: ['staff'],
    scopeType: 'none',  // NOT scoped to departments - cross-department access
    requiresScope: false,
    permissions: [
      // Dashboard permissions (system-wide)
      'dashboard:view-all-departments',
      'dashboard:view-system-analytics',

      // Cross-department reporting
      'report:view-all-departments',
      'report:generate-all-departments',
      'report:drill-down-department',
      'report:compare-departments',
      'analytics:view-all-departments',
      'analytics:drill-down-department',
      'analytics:compare-departments',
      'export:reports-all'
    ],
    isActive: true,
    dashboardPriority: 55
  }
];
```

**Example: Multi-Department Staff Member**

```typescript
// Sarah is in 3 departments with different roles:
{
  departmentMemberships: [
    {
      departmentId: "dept_cs",
      roles: ['instructor', 'content-admin'],  // Multiple roles in CS
      isPrimary: true
    },
    {
      departmentId: "dept_math",
      roles: ['department-admin'],  // Different role in Math
      isPrimary: false
    },
    {
      departmentId: "dept_business",
      roles: ['instructor'],  // Same role as CS, different dept
      isPrimary: false
    }
  ]
}

// Sarah's Dashboard Shows:
// - Combined view of ALL classes she teaches (CS + Business)
// - Combined view of ALL courses she can manage (CS only)
// - Combined view of ALL department analytics (Math only as dept-admin)
//
// Sarah's Operations:
// - Can create courses ONLY in CS (has content-admin there)
// - Can manage ALL classes in Math dept (has department-admin there)
// - Can grade students in CS and Business (has instructor in both)
// - Dashboard automatically filters/aggregates based on her role scopes
```

### System Admin Roles

```typescript
const SYSTEM_ADMIN_ROLES: IRole[] = [
  {
    name: 'system-admin',
    displayName: 'System Administrator',
    description: 'Full system access including settings and configuration',
    applicableUserTypes: ['system-admin'],
    scopeType: 'none',
    requiresScope: false,
    permissions: [
      'system:*',  // Wildcard for all system operations
      'settings:*',
      'user:*',
      'department:*',
      'audit:view',
      'audit:export'
    ],
    isActive: true,
    dashboardPriority: 100
  },
  {
    name: 'settings-admin',
    displayName: 'Settings Administrator',
    description: 'Manages specific groups of system settings',
    applicableUserTypes: ['system-admin'],
    scopeType: 'system-setting-group',
    requiresScope: true,  // Future: scope to setting groups like 'authentication', 'integrations', etc.
    permissions: [
      'settings:view',
      'settings:edit-scoped',
      'audit:view-settings'
    ],
    isActive: true,
    dashboardPriority: 90
  },
  {
    name: 'user-admin',
    displayName: 'User Administrator',
    description: 'Manages user accounts and permissions',
    applicableUserTypes: ['system-admin'],
    scopeType: 'none',
    requiresScope: false,
    permissions: [
      'user:view',
      'user:create',
      'user:edit',
      'user:deactivate',
      'role:assign',
      'audit:view-users'
    ],
    isActive: true,
    dashboardPriority: 85
  },
  {
    name: 'integration-admin',
    displayName: 'Integration Administrator',
    description: 'Manages external integrations and API access',
    applicableUserTypes: ['system-admin'],
    scopeType: 'none',
    requiresScope: false,
    permissions: [
      'integration:view',
      'integration:configure',
      'api-key:manage',
      'webhook:manage',
      'audit:view-integrations'
    ],
    isActive: true,
    dashboardPriority: 80
  }
];
```

---

## 3. Database Schema Changes

### Updated User Model

```typescript
/**
 * Enhanced User model with userTypes and defaultDashboard
 */
interface IUser {
  _id: ObjectId;
  email: string;
  password: string;

  /** Array of userTypes this user has */
  userTypes: UserType[];

  /** Which dashboard to load by default on login */
  defaultDashboard: DashboardType;

  /**
   * Global roles (typically system-admin roles)
   * Department/course-scoped roles live in Staff/Learner models
   */
  globalRoles: string[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Virtual/computed fields
  allRoles?: RoleHierarchy;  // Populated by getAllRoles() method
}

/**
 * Schema definition
 */
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userTypes: {
    type: [String],
    enum: ['learner', 'staff', 'system-admin'],
    default: ['learner'],
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'User must have at least one userType'
    }
  },
  defaultDashboard: {
    type: String,
    enum: ['learner', 'staff', 'admin'],
    required: true
  },
  globalRoles: {
    type: [String],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

/**
 * Pre-save middleware to set defaultDashboard based on userTypes
 */
UserSchema.pre('save', function(next) {
  if (this.isModified('userTypes') || this.isNew) {
    this.defaultDashboard = calculateDefaultDashboard(this.userTypes);
  }
  next();
});

/**
 * Calculate defaultDashboard based on userType priority
 * Priority: system-admin (100) > staff (50-70) > learner (1-10)
 */
function calculateDefaultDashboard(userTypes: UserType[]): DashboardType {
  if (userTypes.includes('system-admin')) return 'admin';
  if (userTypes.includes('staff')) return 'staff';
  return 'learner';
}
```

### Updated Staff Model

```typescript
/**
 * Enhanced Staff model with explicit role objects
 */
interface IStaff {
  _id: ObjectId;  // Shared with User._id
  firstName: string;
  lastName: string;
  title?: string;

  /** Department-scoped roles */
  departmentMemberships: DepartmentMembership[];

  /** Global staff roles (like reporting-analyst) */
  globalStaffRoles: string[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Department membership with scoped roles
 */
interface DepartmentMembership {
  departmentId: ObjectId;

  /** Roles this staff member has in this department */
  roles: string[];  // e.g., ['instructor', 'content-admin']

  /** Is this their primary department? */
  isPrimary: boolean;

  /** When did they join this department? */
  joinedAt: Date;

  /** Are they currently active in this department? */
  isActive: boolean;
}

const StaffSchema = new Schema<IStaff>({
  _id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  title: String,
  departmentMemberships: [{
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    roles: {
      type: [String],
      enum: ['instructor', 'content-admin', 'department-admin', 'billing-admin'],
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  globalStaffRoles: {
    type: [String],
    enum: ['reporting-analyst'],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
```

### Updated Learner Model

```typescript
/**
 * Enhanced Learner model with department-scoped roles
 */
interface ILearner {
  _id: ObjectId;  // Shared with User._id
  firstName: string;
  lastName: string;
  dateOfBirth?: Date;
  address?: Address;
  emergencyContact?: EmergencyContact;

  /** Department enrollments with roles */
  departmentEnrollments: DepartmentEnrollment[];

  /** Global learner role (typically 'guest' if any) */
  globalLearnerRole?: string;

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Department enrollment with scoped role
 * Learner has ONE role per department that applies to ALL courses in that department
 */
interface DepartmentEnrollment {
  departmentId: ObjectId;

  /** Role in this department (applies to all courses within) */
  role: 'course-taker' | 'auditor' | 'supervisor';

  /** When did they enroll in this department? */
  enrolledAt: Date;

  /** Is this enrollment currently active? */
  isActive: boolean;
}

const LearnerSchema = new Schema<ILearner>({
  _id: {
    type: Schema.Types.ObjectId,
    required: true
  },
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: Date,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  departmentEnrollments: [{
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    role: {
      type: String,
      enum: ['course-taker', 'auditor', 'supervisor'],
      required: true
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  globalLearnerRole: {
    type: String,
    enum: ['guest'],
    default: undefined
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
```

**Note on Course Enrollments:**
- Course enrollment data (status, progress, finalGrade) will exist in a separate `Enrollment` collection
- The `Enrollment` collection links learner + course + class with progress tracking
- The learner's **role** comes from their department enrollment
- The learner's **progress** comes from the Enrollment record

```typescript
/**
 * Separate Enrollment collection for tracking course progress
 * This is distinct from the role (which is department-level)
 */
interface IEnrollment {
  _id: ObjectId;
  learnerId: ObjectId;  // Reference to Learner
  courseId: ObjectId;   // Reference to Course
  classId: ObjectId;    // Reference to Class (specific instance)
  departmentId: ObjectId; // Reference to Department

  /** Status of this specific course enrollment */
  status: 'active' | 'completed' | 'withdrawn';

  /** Progress percentage */
  progress: number;

  /** Final grade if completed */
  finalGrade?: number;

  enrolledAt: Date;
  completedAt?: Date;
}
```

---

## 4. Role Concatenation Function

### Implementation on User Model

```typescript
/**
 * Complete role hierarchy for a user
 */
interface RoleHierarchy {
  /** Primary userType for this user */
  primaryUserType: UserType;

  /** All userTypes */
  allUserTypes: UserType[];

  /** Default dashboard */
  defaultDashboard: DashboardType;

  /** Global roles (from User.globalRoles) */
  globalRoles: RoleAssignment[];

  /** Staff roles (from Staff model if exists) */
  staffRoles?: StaffRoleGroup;

  /** Learner roles (from Learner model if exists) */
  learnerRoles?: LearnerRoleGroup;

  /** Flattened permissions (all permissions from all roles) */
  allPermissions: string[];
}

/**
 * A single role assignment
 */
interface RoleAssignment {
  role: string;
  displayName: string;
  scopeType: IRole['scopeType'];
  scopeId?: string;  // Department ID, Course ID, etc.
  scopeName?: string;  // Department name, Course name, etc.
  permissions: string[];
}

/**
 * Staff-specific role grouping
 */
interface StaffRoleGroup {
  /** Roles scoped to specific departments */
  departmentRoles: Array<{
    departmentId: string;
    departmentName: string;
    isPrimary: boolean;
    roles: RoleAssignment[];
  }>;

  /** Global staff roles (like reporting-analyst) */
  globalRoles: RoleAssignment[];
}

/**
 * Learner-specific role grouping
 */
interface LearnerRoleGroup {
  /** Roles scoped to specific departments */
  departmentRoles: Array<{
    departmentId: string;
    departmentName: string;
    role: RoleAssignment;  // Single role per department
  }>;

  /** Global learner role (like guest) */
  globalRole?: RoleAssignment;
}

/**
 * Method to get complete role hierarchy
 * This is added to the User model as an instance method
 */
UserSchema.methods.getAllRoles = async function(): Promise<RoleHierarchy> {
  const user = this as IUser;

  // Initialize hierarchy
  const hierarchy: RoleHierarchy = {
    primaryUserType: user.userTypes[0],
    allUserTypes: [...user.userTypes],
    defaultDashboard: user.defaultDashboard,
    globalRoles: [],
    allPermissions: []
  };

  // 1. Process global roles from User model
  for (const roleName of user.globalRoles) {
    const roleDefinition = await RoleRegistry.getRole(roleName);
    if (roleDefinition) {
      hierarchy.globalRoles.push({
        role: roleName,
        displayName: roleDefinition.displayName,
        scopeType: 'none',
        permissions: roleDefinition.permissions
      });
      hierarchy.allPermissions.push(...roleDefinition.permissions);
    }
  }

  // 2. Process Staff roles if user is staff
  if (user.userTypes.includes('staff')) {
    const staff = await Staff.findById(user._id).populate('departmentMemberships.departmentId');
    if (staff) {
      hierarchy.staffRoles = {
        departmentRoles: [],
        globalRoles: []
      };

      // Department-scoped roles
      for (const membership of staff.departmentMemberships) {
        if (!membership.isActive) continue;

        const deptRoles: RoleAssignment[] = [];
        for (const roleName of membership.roles) {
          const roleDefinition = await RoleRegistry.getRole(roleName);
          if (roleDefinition) {
            deptRoles.push({
              role: roleName,
              displayName: roleDefinition.displayName,
              scopeType: 'department',
              scopeId: membership.departmentId.toString(),
              scopeName: membership.departmentId.name,
              permissions: roleDefinition.permissions
            });
            hierarchy.allPermissions.push(...roleDefinition.permissions);
          }
        }

        hierarchy.staffRoles.departmentRoles.push({
          departmentId: membership.departmentId._id.toString(),
          departmentName: membership.departmentId.name,
          isPrimary: membership.isPrimary,
          roles: deptRoles
        });
      }

      // Global staff roles
      for (const roleName of staff.globalStaffRoles) {
        const roleDefinition = await RoleRegistry.getRole(roleName);
        if (roleDefinition) {
          hierarchy.staffRoles.globalRoles.push({
            role: roleName,
            displayName: roleDefinition.displayName,
            scopeType: 'none',
            permissions: roleDefinition.permissions
          });
          hierarchy.allPermissions.push(...roleDefinition.permissions);
        }
      }
    }
  }

  // 3. Process Learner roles if user is learner
  if (user.userTypes.includes('learner')) {
    const learner = await Learner.findById(user._id).populate('departmentEnrollments.departmentId');
    if (learner) {
      hierarchy.learnerRoles = {
        departmentRoles: []
      };

      // Department-scoped roles
      for (const enrollment of learner.departmentEnrollments) {
        if (!enrollment.isActive) continue;

        const roleDefinition = await RoleRegistry.getRole(enrollment.role);
        if (roleDefinition) {
          const departmentRole: RoleAssignment = {
            role: enrollment.role,
            displayName: roleDefinition.displayName,
            scopeType: 'department',
            scopeId: enrollment.departmentId._id.toString(),
            scopeName: enrollment.departmentId.name,
            permissions: roleDefinition.permissions
          };

          hierarchy.learnerRoles.departmentRoles.push({
            departmentId: departmentRole.scopeId!,
            departmentName: departmentRole.scopeName!,
            role: departmentRole
          });

          hierarchy.allPermissions.push(...roleDefinition.permissions);
        }
      }

      // Global learner role
      if (learner.globalLearnerRole) {
        const roleDefinition = await RoleRegistry.getRole(learner.globalLearnerRole);
        if (roleDefinition) {
          hierarchy.learnerRoles.globalRole = {
            role: learner.globalLearnerRole,
            displayName: roleDefinition.displayName,
            scopeType: 'none',
            permissions: roleDefinition.permissions
          };
          hierarchy.allPermissions.push(...roleDefinition.permissions);
        }
      }
    }
  }

  // 4. Deduplicate permissions
  hierarchy.allPermissions = [...new Set(hierarchy.allPermissions)];

  return hierarchy;
};

/**
 * Helper method to check if user has a specific permission
 * Optionally scoped to a specific entity
 */
UserSchema.methods.hasPermission = async function(
  permission: string,
  scope?: { type: 'department'; id: string }
): Promise<boolean> {
  const hierarchy = await this.getAllRoles();

  // Check for wildcard permission (system-admin)
  if (hierarchy.allPermissions.includes('system:*')) {
    return true;
  }

  // If no scope specified, check if permission exists anywhere
  if (!scope) {
    return hierarchy.allPermissions.includes(permission);
  }

  // Check department-scoped permissions (both staff and learner roles use departments)
  if (scope.type === 'department') {
    // Check staff roles
    if (hierarchy.staffRoles) {
      for (const deptGroup of hierarchy.staffRoles.departmentRoles) {
        if (deptGroup.departmentId === scope.id) {
          const hasPermission = deptGroup.roles.some(r =>
            r.permissions.includes(permission)
          );
          if (hasPermission) return true;
        }
      }
    }

    // Check learner roles
    if (hierarchy.learnerRoles) {
      for (const deptGroup of hierarchy.learnerRoles.departmentRoles) {
        if (deptGroup.departmentId === scope.id) {
          const hasPermission = deptGroup.role.permissions.includes(permission);
          if (hasPermission) return true;
        }
      }
    }
  }

  return false;
};
```

### Role Registry Service

```typescript
/**
 * Centralized registry for all role definitions
 * Provides access to IRole interface data
 */
class RoleRegistryService {
  private roles: Map<string, IRole> = new Map();

  constructor() {
    this.initializeRoles();
  }

  /**
   * Load all role definitions
   */
  private initializeRoles(): void {
    // Load learner roles
    for (const role of LEARNER_ROLES) {
      this.roles.set(role.name, role);
    }

    // Load staff roles
    for (const role of STAFF_ROLES) {
      this.roles.set(role.name, role);
    }

    // Load system admin roles
    for (const role of SYSTEM_ADMIN_ROLES) {
      this.roles.set(role.name, role);
    }
  }

  /**
   * Get role definition by name
   */
  async getRole(roleName: string): Promise<IRole | null> {
    return this.roles.get(roleName) || null;
  }

  /**
   * Get all roles for a specific userType
   */
  async getRolesByUserType(userType: UserType): Promise<IRole[]> {
    return Array.from(this.roles.values()).filter(role =>
      role.applicableUserTypes.includes(userType)
    );
  }

  /**
   * Get all available roles
   */
  async getAllRoles(): Promise<IRole[]> {
    return Array.from(this.roles.values());
  }

  /**
   * Check if a role exists
   */
  async roleExists(roleName: string): Promise<boolean> {
    return this.roles.has(roleName);
  }

  /**
   * Get roles that require a specific scope type
   */
  async getRolesByScopeType(scopeType: IRole['scopeType']): Promise<IRole[]> {
    return Array.from(this.roles.values()).filter(role =>
      role.scopeType === scopeType
    );
  }
}

export const RoleRegistry = new RoleRegistryService();
```

---

## 5. Frontend Integration

### Updated Auth Store

```typescript
/**
 * Enhanced auth store with role hierarchy
 */
interface AuthState {
  accessToken: string | null;
  user: {
    _id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    userTypes: UserType[];
    defaultDashboard: DashboardType;
  } | null;

  /** Complete role hierarchy */
  roleHierarchy: RoleHierarchy | null;

  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string, scope?: { type: 'department'; id: string }) => boolean;
}

/**
 * Navigation store for department selection
 * Separate from auth store to maintain single responsibility
 */
interface NavigationState {
  /** Currently selected department ID (null = no department selected) */
  selectedDepartmentId: string | null;

  /** Map of userId to their last accessed department ID */
  lastAccessedDepartments: Record<string, string>;

  /** Set the currently active department */
  setSelectedDepartment: (deptId: string | null) => void;

  /** Remember a user's department selection for next login */
  rememberDepartment: (userId: string, deptId: string) => void;

  /** Clear department selection (logout, switch user type, etc.) */
  clearDepartmentSelection: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  accessToken: null,
  user: null,
  roleHierarchy: null,
  isAuthenticated: false,

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { accessToken, refreshToken, user, roleHierarchy } = response.data;

    // Store tokens
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    set({
      accessToken,
      user,
      roleHierarchy,
      isAuthenticated: true
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    set({
      accessToken: null,
      user: null,
      roleHierarchy: null,
      isAuthenticated: false
    });
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken, user, roleHierarchy } = response.data;

    localStorage.setItem('accessToken', accessToken);

    set({
      accessToken,
      user,
      roleHierarchy
    });
  },

  hasPermission: (permission, scope) => {
    const { roleHierarchy } = get();
    if (!roleHierarchy) return false;

    // Check wildcard
    if (roleHierarchy.allPermissions.includes('system:*')) {
      return true;
    }

    // No scope - check anywhere
    if (!scope) {
      return roleHierarchy.allPermissions.includes(permission);
    }

    // Check scoped permissions
    if (scope.type === 'department' && roleHierarchy.staffRoles) {
      for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
        if (deptGroup.departmentId === scope.id) {
          return deptGroup.roles.some(r => r.permissions.includes(permission));
        }
      }
    }

    if (scope.type === 'course' && roleHierarchy.learnerRoles) {
      for (const courseGroup of roleHierarchy.learnerRoles.courseRoles) {
        if (courseGroup.courseId === scope.id) {
          return courseGroup.roles.some(r => r.permissions.includes(permission));
        }
      }
    }

    return false;
  }
}));
```

### Updated Login Flow

```typescript
/**
 * Enhanced login form with defaultDashboard navigation
 */
const handleLogin = async (data: LoginFormData) => {
  try {
    await login(data);

    // Get auth state
    const authState = useAuthStore.getState();
    const user = authState.user;

    if (!user) {
      throw new Error('Login failed - no user data');
    }

    // Navigate to defaultDashboard
    const dashboardRoutes: Record<DashboardType, string> = {
      'learner': '/learner/dashboard',
      'staff': '/staff/dashboard',
      'admin': '/admin/dashboard'
    };

    const destination = dashboardRoutes[user.defaultDashboard];
    console.log('[LoginForm] Navigating to defaultDashboard:', destination);

    navigate(destination);
  } catch (error) {
    console.error('[LoginForm] Login error:', error);
    setFormErrors({ submit: 'Invalid email or password' });
  }
};
```

### Updated Sidebar with Two-Section Navigation

**Architecture:** The sidebar has two distinct sections:
1. **Global Navigation** - UserType-based, always visible, works across all departments
2. **Department Selector + Department-Specific Actions** - Only visible when user has department-scoped roles

```typescript
/**
 * Enhanced sidebar with two-section navigation
 * Supports department selection and scoped actions
 */

// Navigation store for managing selected department
interface NavigationState {
  selectedDepartmentId: string | null;
  lastAccessedDepartments: Record<string, string>; // userId -> departmentId
  setSelectedDepartment: (deptId: string | null) => void;
  rememberDepartment: (userId: string, deptId: string) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      selectedDepartmentId: null,
      lastAccessedDepartments: {},

      setSelectedDepartment: (deptId) => {
        set({ selectedDepartmentId: deptId });
      },

      rememberDepartment: (userId, deptId) => {
        set((state) => ({
          lastAccessedDepartments: {
            ...state.lastAccessedDepartments,
            [userId]: deptId
          }
        }));
      }
    }),
    {
      name: 'navigation-storage'
    }
  )
);

/**
 * Global navigation items (UserType-based)
 */
interface GlobalNavItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  requiredPermission?: string;
  userTypes: UserType[];  // Which userTypes see this
}

const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
  // Learner Global Nav
  {
    label: 'Dashboard',
    path: '/learner/dashboard',
    icon: Home,
    userTypes: ['learner']
  },
  {
    label: 'My Profile',
    path: '/learner/profile',
    icon: User,
    userTypes: ['learner']
  },
  {
    label: 'My Progress',
    path: '/learner/progress',
    icon: TrendingUp,
    userTypes: ['learner']
  },

  // Staff Global Nav
  {
    label: 'Dashboard',
    path: '/staff/dashboard',
    icon: Home,
    userTypes: ['staff']
  },
  {
    label: 'My Profile',
    path: '/staff/profile',
    icon: User,
    userTypes: ['staff']
  },
  {
    label: 'My Classes',
    path: '/staff/classes',
    icon: Calendar,
    userTypes: ['staff'],
    requiredPermission: 'class:view-own'
  },
  {
    label: 'Analytics',
    path: '/staff/analytics',
    icon: BarChart,
    userTypes: ['staff'],
    requiredPermission: 'dashboard:view-department-overview'
  },

  // System Admin Global Nav
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: Home,
    userTypes: ['system-admin']
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    userTypes: ['system-admin'],
    requiredPermission: 'user:view'
  },
  {
    label: 'System Settings',
    path: '/admin/settings',
    icon: Settings,
    userTypes: ['system-admin'],
    requiredPermission: 'settings:view'
  }
];

/**
 * Department-scoped navigation items
 * These only appear when a department is selected
 */
interface DepartmentNavItem {
  label: string;
  pathTemplate: string;  // e.g., '/staff/departments/:deptId/courses'
  icon: React.ComponentType;
  requiredPermission: string;  // Must have this permission in selected department
  userTypes: UserType[];  // Which userTypes can see this
}

const DEPARTMENT_NAV_ITEMS: DepartmentNavItem[] = [
  // Staff Department Actions
  {
    label: 'Create Course',
    pathTemplate: '/staff/departments/:deptId/courses/create',
    icon: Plus,
    requiredPermission: 'course:create-department',
    userTypes: ['staff']
  },
  {
    label: 'Manage Courses',
    pathTemplate: '/staff/departments/:deptId/courses',
    icon: BookOpen,
    requiredPermission: 'course:view-department',
    userTypes: ['staff']
  },
  {
    label: 'Manage Classes',
    pathTemplate: '/staff/departments/:deptId/classes',
    icon: Calendar,
    requiredPermission: 'class:view-department',
    userTypes: ['staff']
  },
  {
    label: 'Department Reports',
    pathTemplate: '/staff/departments/:deptId/reports',
    icon: FileText,
    requiredPermission: 'report:view-department-all',
    userTypes: ['staff']
  },
  {
    label: 'Department Settings',
    pathTemplate: '/staff/departments/:deptId/settings',
    icon: Settings,
    requiredPermission: 'department:edit',
    userTypes: ['staff']
  },

  // Learner Department Actions
  {
    label: 'Browse Courses',
    pathTemplate: '/learner/departments/:deptId/courses',
    icon: Search,
    requiredPermission: 'course:view-department',
    userTypes: ['learner']
  },
  {
    label: 'My Enrollments',
    pathTemplate: '/learner/departments/:deptId/enrollments',
    icon: BookOpen,
    requiredPermission: 'course:enroll-department',
    userTypes: ['learner']
  }
];

/**
 * Main Sidebar Component
 */
export const Sidebar: React.FC = () => {
  const { roleHierarchy, user } = useAuthStore();
  const { selectedDepartmentId, setSelectedDepartment, rememberDepartment } = useNavigationStore();

  if (!roleHierarchy || !user) return null;

  // Get user's primary userType
  const primaryUserType = roleHierarchy.primaryUserType;

  // Filter global nav items for this userType
  const globalNavItems = GLOBAL_NAV_ITEMS.filter(item => {
    // Check if item applies to this userType
    if (!item.userTypes.includes(primaryUserType)) return false;

    // Check permission if required
    if (item.requiredPermission) {
      return roleHierarchy.allPermissions.includes(item.requiredPermission);
    }

    return true;
  });

  // Get user's departments
  const userDepartments = [];

  // Add staff departments
  if (roleHierarchy.staffRoles) {
    for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
      userDepartments.push({
        id: deptGroup.departmentId,
        name: deptGroup.departmentName,
        isPrimary: deptGroup.isPrimary,
        type: 'staff' as const
      });
    }
  }

  // Add learner departments
  if (roleHierarchy.learnerRoles) {
    for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
      userDepartments.push({
        id: deptGroup.departmentId,
        name: deptGroup.departmentName,
        isPrimary: false,
        type: 'learner' as const
      });
    }
  }

  // Auto-select last accessed department on mount
  React.useEffect(() => {
    if (user && userDepartments.length > 0 && !selectedDepartmentId) {
      const lastDept = useNavigationStore.getState().lastAccessedDepartments[user._id];

      // Use last accessed department if it's still valid
      if (lastDept && userDepartments.some(d => d.id === lastDept)) {
        setSelectedDepartment(lastDept);
      }
      // Otherwise, default to NO department selected (user must choose)
    }
  }, [user, userDepartments.length]);

  // Handle department selection
  const handleDepartmentSelect = (deptId: string | null) => {
    setSelectedDepartment(deptId);

    // Remember this selection for next login
    if (user && deptId) {
      rememberDepartment(user._id, deptId);
    }
  };

  // Get department-specific nav items
  const getDepartmentNavItems = () => {
    if (!selectedDepartmentId) return [];

    return DEPARTMENT_NAV_ITEMS.filter(item => {
      // Check if item applies to this userType
      if (!item.userTypes.includes(primaryUserType)) return false;

      // Check if user has required permission in selected department
      return useAuthStore.getState().hasPermission(
        item.requiredPermission,
        { type: 'department', id: selectedDepartmentId }
      );
    }).map(item => ({
      ...item,
      path: item.pathTemplate.replace(':deptId', selectedDepartmentId)
    }));
  };

  const departmentNavItems = getDepartmentNavItems();

  return (
    <aside className="sidebar h-full flex flex-col">
      {/* Global Navigation Section */}
      <div className="flex-shrink-0">
        <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Navigation
        </div>
        <nav className="space-y-1 px-2">
          {globalNavItems.map(item => (
            <NavLink key={item.path} {...item} />
          ))}
        </nav>
      </div>

      {/* Department Selector Section */}
      {userDepartments.length > 0 && (
        <div className="flex-shrink-0 mt-4 border-t pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            My Departments
          </div>
          <div className="space-y-1 px-2">
            {userDepartments.map(dept => (
              <button
                key={dept.id}
                onClick={() => handleDepartmentSelect(
                  selectedDepartmentId === dept.id ? null : dept.id
                )}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors',
                  selectedDepartmentId === dept.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent text-muted-foreground'
                )}
              >
                {selectedDepartmentId === dept.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Folder className="h-4 w-4" />
                <span className="flex-1 text-left">{dept.name}</span>
                {dept.isPrimary && (
                  <Badge variant="secondary" className="text-xs">Primary</Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Department-Specific Actions Section */}
      {userDepartments.length > 0 && (
        <div className="flex-1 overflow-y-auto mt-4 border-t pt-4">
          <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Department Actions
          </div>

          {!selectedDepartmentId ? (
            <div className="px-4 py-8 text-center">
              <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a department above to see available actions
              </p>
            </div>
          ) : departmentNavItems.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">
                No actions available for this department
              </p>
            </div>
          ) : (
            <nav className="space-y-1 px-2">
              {departmentNavItems.map(item => (
                <NavLink
                  key={item.path}
                  label={item.label}
                  path={item.path}
                  icon={item.icon}
                />
              ))}
            </nav>
          )}
        </div>
      )}

      {/* Settings Footer */}
      <div className="flex-shrink-0 border-t p-2">
        <NavLink
          label="Settings"
          path="/settings"
          icon={Settings}
        />
      </div>
    </aside>
  );
};

/**
 * NavLink component for individual navigation items
 */
const NavLink: React.FC<{
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}> = ({ label, path, icon: Icon }) => {
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Link
      to={path}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  );
};
```

**Key Features:**

1. **Two-Section Structure:**
   - Global Navigation (always visible)
   - Department Selector + Department Actions (conditional)

2. **Department Selection State:**
   - Stored in Zustand with localStorage persistence
   - Remembers last accessed department per user
   - Default: NO department selected (user must choose)

3. **Dynamic Department Actions:**
   - Path template uses `:deptId` placeholder
   - Actions filtered by permissions in selected department
   - Greyed out/hidden when no department selected

4. **Mobile Behavior:**
   - Sidebar slides in front (handled by AppLayout)
   - Shows department selector
   - User selects department → sees actions

5. **Visual States:**
   - Selected department highlighted
   - Primary department badged
   - No selection: shows "Select a department" message
   - No actions: shows "No actions available" message

### Updated Router Protection

```typescript
/**
 * Enhanced ProtectedRoute that checks permissions
 */
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
  requireAllPermissions?: string[];
}> = ({
  children,
  requiredPermission,
  requiredRole,
  requireAllPermissions
}) => {
  const { isAuthenticated, roleHierarchy } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!roleHierarchy) {
    return <div>Loading permissions...</div>;
  }

  // Check single permission
  if (requiredPermission && !roleHierarchy.allPermissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }

  // Check all permissions
  if (requireAllPermissions) {
    const hasAll = requireAllPermissions.every(perm =>
      roleHierarchy.allPermissions.includes(perm)
    );
    if (!hasAll) {
      return <Navigate to="/unauthorized" />;
    }
  }

  // Check role
  if (requiredRole) {
    const hasRole = (
      roleHierarchy.globalRoles.some(r => r.role === requiredRole) ||
      roleHierarchy.staffRoles?.departmentRoles.some(d =>
        d.roles.some(r => r.role === requiredRole)
      ) ||
      roleHierarchy.learnerRoles?.courseRoles.some(c =>
        c.roles.some(r => r.role === requiredRole)
      )
    );

    if (!hasRole) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return <>{children}</>;
};
```

---

## 6. Backend API Changes

### Enhanced Login Endpoint

```typescript
/**
 * POST /api/v1/auth/login
 * Enhanced to return roleHierarchy
 */
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Get complete role hierarchy
  const roleHierarchy = await user.getAllRoles();

  // Generate tokens
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Return enhanced user data
  res.json({
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      email: user.email,
      userTypes: user.userTypes,
      defaultDashboard: user.defaultDashboard
    },
    roleHierarchy
  });
};
```

### New Role Info Endpoint

```typescript
/**
 * GET /api/v1/roles
 * Get all available role definitions
 */
export const getRoles = async (req: Request, res: Response) => {
  const roles = await RoleRegistry.getAllRoles();
  res.json({ roles });
};

/**
 * GET /api/v1/roles/:roleName
 * Get specific role definition
 */
export const getRole = async (req: Request, res: Response) => {
  const { roleName } = req.params;
  const role = await RoleRegistry.getRole(roleName);

  if (!role) {
    return res.status(404).json({ message: 'Role not found' });
  }

  res.json({ role });
};

/**
 * GET /api/v1/roles/user-type/:userType
 * Get all roles available for a userType
 */
export const getRolesByUserType = async (req: Request, res: Response) => {
  const { userType } = req.params;

  if (!['learner', 'staff', 'system-admin'].includes(userType)) {
    return res.status(400).json({ message: 'Invalid userType' });
  }

  const roles = await RoleRegistry.getRolesByUserType(userType as UserType);
  res.json({ roles });
};
```

### Enhanced User Profile Endpoint

```typescript
/**
 * GET /api/v1/users/me
 * Get current user with complete role hierarchy
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user._id;  // From auth middleware

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const roleHierarchy = await user.getAllRoles();

  res.json({
    user: {
      _id: user._id,
      email: user.email,
      userTypes: user.userTypes,
      defaultDashboard: user.defaultDashboard
    },
    roleHierarchy
  });
};
```

---

## 7. Migration Strategy

### Phase 1: Database Migration (Week 1)

1. **Add new fields to User model**
   - `userTypes: UserType[]`
   - `defaultDashboard: DashboardType`
   - `globalRoles: string[]` (rename from `roles`)

2. **Update Staff model**
   - Add `globalStaffRoles: string[]`
   - Keep `departmentMemberships` structure

3. **Update Learner model**
   - Add `courseEnrollments` structure
   - Add `globalLearnerRole?: string`

4. **Migration script**

```typescript
/**
 * Migration: Add userTypes and defaultDashboard to existing users
 */
async function migrateUsers() {
  const users = await User.find({});

  for (const user of users) {
    // Determine userTypes based on existing profiles
    const userTypes: UserType[] = [];

    const staff = await Staff.findById(user._id);
    const learner = await Learner.findById(user._id);

    if (staff && staff.isActive) {
      userTypes.push('staff');
    }

    if (learner && learner.isActive) {
      userTypes.push('learner');
    }

    // Check for system-admin role in existing roles
    if (user.roles?.includes('system-admin')) {
      userTypes.push('system-admin');
    }

    // Default to learner if no types found
    if (userTypes.length === 0) {
      userTypes.push('learner');
    }

    // Calculate defaultDashboard
    const defaultDashboard = calculateDefaultDashboard(userTypes);

    // Rename roles to globalRoles and filter out non-global roles
    const globalRoles = user.roles?.filter(r =>
      ['system-admin', 'user-admin', 'integration-admin', 'settings-admin'].includes(r)
    ) || [];

    // Update user
    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          userTypes,
          defaultDashboard,
          globalRoles
        },
        $unset: {
          roles: ''
        }
      }
    );

    console.log(`Migrated user ${user.email}: types=${userTypes.join(',')}, dashboard=${defaultDashboard}`);
  }
}
```

### Phase 2: Backend Implementation (Week 2-3)

1. **Implement RoleRegistry service**
   - Define all IRole objects
   - Create service class
   - Add to dependency injection

2. **Add getAllRoles() method to User model**
   - Implement role concatenation logic
   - Add hasPermission() helper

3. **Update auth endpoints**
   - Modify login to return roleHierarchy
   - Add role info endpoints
   - Update token refresh

4. **Update existing middleware**
   - Replace role checks with permission checks
   - Support scoped permission checks

### Phase 3: Frontend Implementation (Week 3-4)

1. **Update auth store**
   - Add roleHierarchy state
   - Add hasPermission helper
   - Update login/logout flows

2. **Update LoginForm**
   - Navigate to user.defaultDashboard
   - Store roleHierarchy

3. **Update Sidebar**
   - Use roleHierarchy instead of single role
   - Filter by permissions

4. **Update ProtectedRoute**
   - Check permissions instead of roles
   - Support scoped checks

### Phase 4: Testing & Validation (Week 4-5)

1. **Unit tests**
   - Test getAllRoles() with various user configurations
   - Test hasPermission() with scoped checks
   - Test calculateDefaultDashboard()

2. **Integration tests**
   - Test login flow with different user types
   - Test navigation based on defaultDashboard
   - Test sidebar rendering for each role

3. **E2E tests**
   - Test multi-role user workflows
   - Test department-scoped operations
   - Test reporting with drill-down

---

## 8. Example Use Cases

### Example 1: Emily Carter - Multi-Department Staff

```typescript
// Emily's User record
{
  _id: "emily_001",
  email: "emily.carter@university.edu",
  userTypes: ['staff', 'learner'],
  defaultDashboard: 'staff',  // Staff takes precedence
  globalRoles: [],
  isActive: true
}

// Emily's Staff record
{
  _id: "emily_001",
  firstName: "Emily",
  lastName: "Carter",
  departmentMemberships: [
    {
      departmentId: "dept_cs",
      roles: ['instructor', 'content-admin'],
      isPrimary: true,
      isActive: true
    },
    {
      departmentId: "dept_math",
      roles: ['instructor'],
      isPrimary: false,
      isActive: true
    }
  ],
  globalStaffRoles: [],
  isActive: true
}

// Emily's Learner record (she's also taking courses in Education department)
{
  _id: "emily_001",
  firstName: "Emily",
  lastName: "Carter",
  departmentEnrollments: [
    {
      departmentId: "dept_education",
      role: 'course-taker',  // Taking professional development courses
      enrolledAt: "2025-08-01",
      isActive: true
    }
  ],
  isActive: true
}

// Emily's roleHierarchy after login
{
  primaryUserType: 'staff',
  allUserTypes: ['staff', 'learner'],
  defaultDashboard: 'staff',
  globalRoles: [],
  staffRoles: {
    departmentRoles: [
      {
        departmentId: "dept_cs",
        departmentName: "Computer Science",
        isPrimary: true,
        roles: [
          {
            role: 'instructor',
            displayName: 'Instructor',
            scopeType: 'department',
            scopeId: "dept_cs",
            scopeName: "Computer Science",
            permissions: ['class:view', 'class:manage-own', 'grade:manage', ...]
          },
          {
            role: 'content-admin',
            displayName: 'Content Administrator',
            scopeType: 'department',
            scopeId: "dept_cs",
            scopeName: "Computer Science",
            permissions: ['course:create', 'course:edit', 'course:delete', ...]
          }
        ]
      },
      {
        departmentId: "dept_math",
        departmentName: "Mathematics",
        isPrimary: false,
        roles: [
          {
            role: 'instructor',
            displayName: 'Instructor',
            scopeType: 'department',
            scopeId: "dept_math",
            scopeName: "Mathematics",
            permissions: ['class:view', 'class:manage-own', 'grade:manage', ...]
          }
        ]
      }
    ],
    globalRoles: []
  },
  learnerRoles: {
    departmentRoles: [
      {
        departmentId: "dept_education",
        departmentName: "Education",
        role: {
          role: 'course-taker',
          displayName: 'Course Taker',
          scopeType: 'department',
          scopeId: "dept_education",
          scopeName: "Education",
          permissions: [
            'dashboard:view-my-courses',
            'dashboard:view-my-progress',
            'course:view-department',
            'lesson:view-department',
            'exam:attempt-department',
            ...
          ]
        }
      }
    ]
  },
  allPermissions: [
    // Deduplicated list of all permissions from all roles
    'class:view', 'class:manage-own', 'grade:manage', 'course:create',
    'course:edit', 'course:view-department', 'lesson:view-department',
    'exam:attempt-department', 'dashboard:view-my-courses', ...
  ]
}
```

**Emily's Experience:**
- Logs in → Navigates to `/staff/dashboard` (defaultDashboard: 'staff')
- Sidebar shows staff navigation options
- Can create courses in CS department
- Can only teach classes in CS and Math departments
- Can view her own course progress as a learner
- Can switch to learner dashboard via user menu

### Example 2: John Doe - System Admin

```typescript
// John's User record
{
  _id: "john_001",
  email: "john.doe@university.edu",
  userTypes: ['system-admin', 'staff'],
  defaultDashboard: 'admin',  // System-admin takes highest precedence
  globalRoles: ['system-admin', 'user-admin'],
  isActive: true
}

// John's Staff record (also on faculty)
{
  _id: "john_001",
  firstName: "John",
  lastName: "Doe",
  departmentMemberships: [
    {
      departmentId: "dept_it",
      roles: ['department-admin'],
      isPrimary: true,
      isActive: true
    }
  ],
  globalStaffRoles: ['reporting-analyst'],  // Can see cross-department reports
  isActive: true
}

// John's roleHierarchy after login
{
  primaryUserType: 'system-admin',
  allUserTypes: ['system-admin', 'staff'],
  defaultDashboard: 'admin',
  globalRoles: [
    {
      role: 'system-admin',
      displayName: 'System Administrator',
      scopeType: 'none',
      permissions: ['system:*', 'settings:*', 'user:*', ...]
    },
    {
      role: 'user-admin',
      displayName: 'User Administrator',
      scopeType: 'none',
      permissions: ['user:view', 'user:create', 'user:edit', ...]
    }
  ],
  staffRoles: {
    departmentRoles: [
      {
        departmentId: "dept_it",
        departmentName: "Information Technology",
        isPrimary: true,
        roles: [
          {
            role: 'department-admin',
            displayName: 'Department Administrator',
            scopeType: 'department',
            scopeId: "dept_it",
            scopeName: "Information Technology",
            permissions: ['department:view', 'department:edit', 'staff:assign-department', ...]
          }
        ]
      }
    ],
    globalRoles: [
      {
        role: 'reporting-analyst',
        displayName: 'Reporting Analyst',
        scopeType: 'none',
        permissions: ['report:view-all-departments', 'analytics:view-all-departments', ...]
      }
    ]
  },
  allPermissions: [
    'system:*',  // Wildcard covers everything
    'settings:*', 'user:*', 'department:view', 'department:edit', ...
  ]
}
```

**John's Experience:**
- Logs in → Navigates to `/admin/dashboard` (defaultDashboard: 'admin')
- Has full system access via `system:*` wildcard
- Can manage users across all departments
- Can view reports across all departments with drill-down
- Can manage IT department specifically
- Can switch to staff dashboard to focus on department work

### Example 3: Sarah Lee - Simple Learner

```typescript
// Sarah's User record
{
  _id: "sarah_001",
  email: "sarah.lee@university.edu",
  userTypes: ['learner'],
  defaultDashboard: 'learner',
  globalRoles: [],
  isActive: true
}

// Sarah's Learner record
{
  _id: "sarah_001",
  firstName: "Sarah",
  lastName: "Lee",
  departmentEnrollments: [
    {
      departmentId: "dept_cs",
      role: 'course-taker',  // Can take exams/earn credit in CS courses
      enrolledAt: "2025-09-01",
      isActive: true
    },
    {
      departmentId: "dept_math",
      role: 'auditor',  // Can only view Math courses
      enrolledAt: "2025-09-01",
      isActive: true
    }
  ],
  isActive: true
}

// Sarah's roleHierarchy after login
{
  primaryUserType: 'learner',
  allUserTypes: ['learner'],
  defaultDashboard: 'learner',
  globalRoles: [],
  learnerRoles: {
    departmentRoles: [
      {
        departmentId: "dept_cs",
        departmentName: "Computer Science",
        role: {
          role: 'course-taker',
          displayName: 'Course Taker',
          scopeType: 'department',
          scopeId: "dept_cs",
          scopeName: "Computer Science",
          permissions: [
            'dashboard:view-my-courses',
            'dashboard:view-my-progress',
            'dashboard:view-my-grades',
            'course:view-department',
            'course:enroll-department',
            'lesson:view-department',
            'lesson:complete-department',
            'exam:attempt-department',
            'exam:view-results-own',
            'grade:view-own-department',
            'certificate:view-own-department',
            'certificate:download-own-department',
            ...
          ]
        }
      },
      {
        departmentId: "dept_math",
        departmentName: "Mathematics",
        role: {
          role: 'auditor',
          displayName: 'Auditor',
          scopeType: 'department',
          scopeId: "dept_math",
          scopeName: "Mathematics",
          permissions: [
            'dashboard:view-my-courses',
            'course:view-department',
            'lesson:view-department',
            'class:view-own-department',
            'discussion:view-department'
            // Note: No exam, grade, or certificate permissions
          ]
        }
      }
    ]
  },
  allPermissions: [
    'dashboard:view-my-courses',
    'dashboard:view-my-progress',
    'dashboard:view-my-grades',
    'course:view-department',
    'course:enroll-department',
    'lesson:view-department',
    'lesson:complete-department',
    'exam:attempt-department',
    'exam:view-results-own',
    'grade:view-own-department',
    'certificate:view-own-department',
    'certificate:download-own-department',
    'class:view-own-department',
    'discussion:view-department',
    ...
  ]
}
```

**Sarah's Experience:**
- Logs in → Navigates to `/learner/dashboard` (defaultDashboard: 'learner')
- Sees courses from both CS and Math departments on dashboard
- **CS Department courses**: Can enroll, take exams, view grades, earn certificates
- **Math Department courses**: View-only, cannot take exams or earn credit (auditor)
- Dashboard aggregates progress from both departments
- Sidebar shows learner-specific navigation
- Simple, focused learner experience

**Important Note:**
- Sarah's role applies to **ALL courses in that department**
- If CS department adds a new course, Sarah automatically has `course-taker` access to it
- If Math department adds a new course, Sarah automatically has `auditor` access to it
- Course-specific enrollment and progress tracked separately in `Enrollment` collection

### Example 4: Cross-Department Reporting

```typescript
// Maria's User record (Reporting Analyst)
{
  _id: "maria_001",
  email: "maria.garcia@university.edu",
  userTypes: ['staff'],
  defaultDashboard: 'staff',
  globalRoles: [],
  isActive: true
}

// Maria's Staff record
{
  _id: "maria_001",
  firstName: "Maria",
  lastName: "Garcia",
  departmentMemberships: [],  // Not assigned to specific department
  globalStaffRoles: ['reporting-analyst'],  // Cross-department access
  isActive: true
}

// Maria's permission check example
await user.hasPermission('report:view-all-departments');  // true
await user.hasPermission('report:drill-down-department');  // true
await user.hasPermission('course:create', { type: 'department', id: 'dept_cs' });  // false

// Maria's UI experience
// Reports page shows dropdown with all departments:
// - "All Departments" (default view)
// - "Computer Science" (can drill down)
// - "Mathematics" (can drill down)
// - "Information Technology" (can drill down)

// She can generate cross-department reports and export them
// but cannot create courses or manage classes
```

---

## 9. Benefits of This Architecture

### 1. Systemic Clarity
- **Single source of truth**: `IRole` interface defines all roles
- **Clear contracts**: Every role has explicit permissions and scope requirements
- **No ambiguity**: `defaultDashboard` eliminates navigation confusion

### 2. Flexibility
- **Multi-role users**: Users can have multiple userTypes simultaneously
- **Scoped permissions**: Department, course, and setting-group scopes supported
- **Extensible**: Easy to add new roles, userTypes, or scope types

### 3. Security
- **Explicit permissions**: Every operation checks specific permissions
- **Scope enforcement**: Department/course operations validated by scope
- **Least privilege**: Users only get permissions they need

### 4. Developer Experience
- **Type safety**: TypeScript interfaces prevent errors
- **Simple checks**: `hasPermission()` method is easy to use
- **Clear debugging**: `getAllRoles()` shows complete role hierarchy

### 5. User Experience
- **Predictable navigation**: Always lands on correct dashboard
- **Appropriate UI**: Sidebar shows relevant options
- **Role awareness**: Users understand their capabilities

---

## 10. Implementation Checklist

### Database Layer
- [ ] Update User model schema
- [ ] Update Staff model schema
- [ ] Update Learner model schema
- [ ] Create migration script for existing users
- [ ] Run migration on development database
- [ ] Validate migrated data

### Backend Services
- [ ] Define all IRole objects (Learner, Staff, System-Admin)
- [ ] Implement RoleRegistry service
- [ ] Add getAllRoles() method to User model
- [ ] Add hasPermission() method to User model
- [ ] Update login endpoint to return roleHierarchy
- [ ] Add role info endpoints (/api/v1/roles/*)
- [ ] Update auth middleware to use permissions
- [ ] Add scoped permission checks

### Frontend State
- [ ] Update AuthState interface
- [ ] Add roleHierarchy to auth store
- [ ] Implement hasPermission() in store
- [ ] Update login action
- [ ] Update logout action
- [ ] Update token refresh action

### Frontend Components
- [ ] Update LoginForm to use defaultDashboard
- [ ] Update Sidebar to use roleHierarchy
- [ ] Update ProtectedRoute to check permissions
- [ ] Update user profile display
- [ ] Add role/permission debugging panel (dev only)

### Testing
- [ ] Unit tests for RoleRegistry
- [ ] Unit tests for getAllRoles()
- [ ] Unit tests for hasPermission()
- [ ] Integration tests for login flow
- [ ] Integration tests for permission checks
- [ ] E2E tests for multi-role workflows
- [ ] E2E tests for scoped operations

### Documentation
- [ ] Update API documentation
- [ ] Create role assignment guide for admins
- [ ] Document permission naming conventions
- [ ] Create troubleshooting guide
- [ ] Update developer onboarding docs

---

## 11. Future Enhancements

### Phase 6: Dynamic Role Management (Future)
- Admin UI to create custom roles
- Role templates and cloning
- Permission bundling

### Phase 7: Advanced Scoping (Future)
- Class-level scoping for instructors
- Student group scoping
- Time-based role assignments (temporary access)

### Phase 8: Audit and Compliance (Future)
- Role change audit log
- Permission usage analytics
- Compliance reporting (who has access to what)

### Phase 9: Role Delegation (Future)
- Temporary role delegation (e.g., substitute instructor)
- Role request/approval workflow
- Self-service role requests

---

## 12. Risks and Mitigations

### Risk 1: Migration Complexity
**Risk**: Migrating existing users might miss edge cases
**Mitigation**:
- Comprehensive testing on copy of production data
- Rollback plan with database backups
- Phased rollout (dev → staging → production)

### Risk 2: Performance Impact
**Risk**: `getAllRoles()` might be slow with many department/course memberships
**Mitigation**:
- Cache roleHierarchy in Redis after login
- Optimize with database indexes
- Paginate course enrollments if needed

### Risk 3: Permission Explosion
**Risk**: Too many granular permissions becomes hard to manage
**Mitigation**:
- Use permission wildcards (e.g., `course:*`)
- Group related permissions into roles thoughtfully
- Regular permission audit and consolidation

### Risk 4: Frontend Bundle Size
**Risk**: Large roleHierarchy object increases payload
**Mitigation**:
- Only send necessary fields to frontend
- Compress API responses
- Lazy load detailed role info when needed

---

## Conclusion

This architecture provides the "systemic clarity" requested by:

1. **Defining a unified contract** (IRole) for all roles
2. **Supporting scoped roles** (department, course, settings) while keeping them organized
3. **Providing complete visibility** via getAllRoles() method
4. **Eliminating navigation ambiguity** with explicit defaultDashboard
5. **Maintaining flexibility** for multi-role users and future extensions

The implementation is backward-compatible via migration scripts and can be rolled out incrementally without disrupting existing functionality.

**Estimated Timeline**: 5 weeks (4 implementation + 1 testing)
**Team Size**: 2-3 developers
**Risk Level**: Medium (requires careful migration)
**Business Value**: High (eliminates confusion, improves security, enables growth)
