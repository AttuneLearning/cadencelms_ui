# Role System Architecture Plan - UI & Frontend
**Version:** 1.0
**Date:** 2026-01-10
**Status:** Planning
**Scope:** Frontend Components, State Management, and User Interface

## Executive Summary

This document covers the **frontend/UI changes** required for the role system redesign:
- Auth store updates
- Navigation store for department selection
- Two-section sidebar implementation
- Protected route components
- Login flow updates

For backend/API changes, see: `Role_System_API_Model_Plan.md`

---

## Table of Contents

1. [Frontend State Management](#1-frontend-state-management)
2. [Two-Section Sidebar Navigation](#2-two-section-sidebar-navigation)
3. [Login Flow Updates](#3-login-flow-updates)
4. [Protected Routes](#4-protected-routes)
5. [Component Examples](#5-component-examples)
6. [Mobile Considerations](#6-mobile-considerations)
7. [Implementation Checklist](#7-implementation-checklist)

---

## 1. Frontend State Management

### Auth Store Interface

```typescript
/**
 * Enhanced auth store with role hierarchy
 * Located at: src/features/auth/model/authStore.ts
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

  /** Complete role hierarchy from backend */
  roleHierarchy: RoleHierarchy | null;

  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string, scope?: { type: 'department'; id: string }) => boolean;
}

/**
 * Role hierarchy structure (matches backend response)
 */
interface RoleHierarchy {
  primaryUserType: UserType;
  allUserTypes: UserType[];
  defaultDashboard: DashboardType;
  globalRoles: RoleAssignment[];
  staffRoles?: StaffRoleGroup;
  learnerRoles?: LearnerRoleGroup;
  allPermissions: string[];
}

interface RoleAssignment {
  role: string;
  displayName: string;
  scopeType: 'none' | 'department' | 'system-setting-group';
  scopeId?: string;
  scopeName?: string;
  permissions: string[];
}

interface StaffRoleGroup {
  departmentRoles: Array<{
    departmentId: string;
    departmentName: string;
    isPrimary: boolean;
    roles: RoleAssignment[];
  }>;
  globalRoles: RoleAssignment[];
}

interface LearnerRoleGroup {
  departmentRoles: Array<{
    departmentId: string;
    departmentName: string;
    role: RoleAssignment;
  }>;
  globalRole?: RoleAssignment;
}
```

### Auth Store Implementation

```typescript
/**
 * Implementation using Zustand
 */
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

    // Clear department selection on logout
    useNavigationStore.getState().clearDepartmentSelection();
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

    // Check department-scoped permissions
    if (scope.type === 'department') {
      // Check staff roles
      if (roleHierarchy.staffRoles) {
        for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
          if (deptGroup.departmentId === scope.id) {
            return deptGroup.roles.some(r => r.permissions.includes(permission));
          }
        }
      }

      // Check learner roles
      if (roleHierarchy.learnerRoles) {
        for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
          if (deptGroup.departmentId === scope.id) {
            return deptGroup.role.permissions.includes(permission);
          }
        }
      }
    }

    return false;
  }
}));
```

### Navigation Store for Department Selection

```typescript
/**
 * Separate store for navigation/department selection
 * Located at: src/shared/stores/navigationStore.ts
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

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set) => ({
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
      },

      clearDepartmentSelection: () => {
        set({ selectedDepartmentId: null });
      }
    }),
    {
      name: 'navigation-storage'
    }
  )
);
```

---

## 2. Two-Section Sidebar Navigation

### Sidebar Architecture Overview

The sidebar has three distinct sections:

```
┌────────────────────────────────────────────────────┐
│  1. GLOBAL NAVIGATION                              │
│     • UserType-based links (always visible)       │
│     • Work across ALL departments                  │
├────────────────────────────────────────────────────┤
│  2. DEPARTMENT SELECTOR                            │
│     • Lists all user's departments                 │
│     • Click to select/activate                     │
│     • Remembers last accessed                      │
├────────────────────────────────────────────────────┤
│  3. DEPARTMENT ACTIONS                             │
│     • Only visible when department selected        │
│     • Filtered by roles in THAT department         │
│     • Path includes department ID                  │
└────────────────────────────────────────────────────┘
```

### Navigation Item Definitions

```typescript
/**
 * Global navigation items (UserType-based)
 * Located at: src/widgets/sidebar/navItems.ts
 */
interface GlobalNavItem {
  label: string;
  path: string;
  icon: React.ComponentType;
  requiredPermission?: string;
  userTypes: UserType[];  // Which userTypes see this
}

export const GLOBAL_NAV_ITEMS: GlobalNavItem[] = [
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
  {
    label: 'Certificates',
    path: '/learner/certificates',
    icon: Award,
    userTypes: ['learner'],
    requiredPermission: 'certificate:view-own-department'
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
  {
    label: 'Reports',
    path: '/staff/reports',
    icon: FileText,
    userTypes: ['staff'],
    requiredPermission: 'report:view-own-classes'
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
    label: 'Department Management',
    path: '/admin/departments',
    icon: Building,
    userTypes: ['system-admin'],
    requiredPermission: 'department:view'
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

export const DEPARTMENT_NAV_ITEMS: DepartmentNavItem[] = [
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
    label: 'Student Progress',
    pathTemplate: '/staff/departments/:deptId/students',
    icon: Users,
    requiredPermission: 'student:view-department',
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
  },
  {
    label: 'Department Progress',
    pathTemplate: '/learner/departments/:deptId/progress',
    icon: TrendingUp,
    requiredPermission: 'dashboard:view-my-progress',
    userTypes: ['learner']
  }
];
```

### Sidebar Component Implementation

```typescript
/**
 * Main Sidebar Component with Two-Section Navigation
 * Located at: src/widgets/sidebar/Sidebar.tsx
 */
import { GLOBAL_NAV_ITEMS, DEPARTMENT_NAV_ITEMS } from './navItems';

export const Sidebar: React.FC = () => {
  const { roleHierarchy, user } = useAuthStore();
  const { selectedDepartmentId, setSelectedDepartment, rememberDepartment, lastAccessedDepartments } = useNavigationStore();

  if (!roleHierarchy || !user) return null;

  const primaryUserType = roleHierarchy.primaryUserType;

  // Filter global nav items for this userType
  const globalNavItems = GLOBAL_NAV_ITEMS.filter(item => {
    if (!item.userTypes.includes(primaryUserType)) return false;
    if (item.requiredPermission) {
      return roleHierarchy.allPermissions.includes(item.requiredPermission);
    }
    return true;
  });

  // Get user's departments
  const userDepartments: Array<{
    id: string;
    name: string;
    isPrimary: boolean;
    type: 'staff' | 'learner';
  }> = [];

  if (roleHierarchy.staffRoles) {
    for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
      userDepartments.push({
        id: deptGroup.departmentId,
        name: deptGroup.departmentName,
        isPrimary: deptGroup.isPrimary,
        type: 'staff'
      });
    }
  }

  if (roleHierarchy.learnerRoles) {
    for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
      userDepartments.push({
        id: deptGroup.departmentId,
        name: deptGroup.departmentName,
        isPrimary: false,
        type: 'learner'
      });
    }
  }

  // Auto-select last accessed department on mount
  React.useEffect(() => {
    if (user && userDepartments.length > 0 && !selectedDepartmentId) {
      const lastDept = lastAccessedDepartments[user._id];

      // Use last accessed department if it's still valid
      if (lastDept && userDepartments.some(d => d.id === lastDept)) {
        setSelectedDepartment(lastDept);
      }
      // Otherwise, default to NO department selected (user must choose)
    }
  }, [user?._id, userDepartments.length]);

  // Handle department selection
  const handleDepartmentSelect = (deptId: string | null) => {
    setSelectedDepartment(deptId);

    if (user && deptId) {
      rememberDepartment(user._id, deptId);
    }
  };

  // Get department-specific nav items
  const getDepartmentNavItems = () => {
    if (!selectedDepartmentId) return [];

    return DEPARTMENT_NAV_ITEMS.filter(item => {
      if (!item.userTypes.includes(primaryUserType)) return false;

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
      {/* Section 1: Global Navigation */}
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

      {/* Section 2: Department Selector */}
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

      {/* Section 3: Department-Specific Actions */}
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

---

## 3. Login Flow Updates

### Enhanced Login Form

```typescript
/**
 * Enhanced login form with defaultDashboard navigation
 * Located at: src/features/auth/ui/LoginForm.tsx
 */
export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

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

  // ... rest of form implementation
};
```

---

## 4. Protected Routes

### Updated ProtectedRoute Component

```typescript
/**
 * Enhanced ProtectedRoute that checks permissions
 * Located at: src/app/router/ProtectedRoute.tsx
 */
export const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  requiredPermission?: string;
  requireAllPermissions?: string[];
  requiredDepartment?: boolean;  // Requires department to be selected
}> = ({
  children,
  requiredPermission,
  requireAllPermissions,
  requiredDepartment
}) => {
  const { isAuthenticated, roleHierarchy } = useAuthStore();
  const { selectedDepartmentId } = useNavigationStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!roleHierarchy) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading permissions...</p>
        </div>
      </div>
    );
  }

  // Check if department selection is required
  if (requiredDepartment && !selectedDepartmentId) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Department Selection Required</CardTitle>
            <CardDescription>
              Please select a department from the sidebar to access this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
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

  return <>{children}</>;
};
```

### Router Configuration Example

```typescript
/**
 * Router with protected routes
 * Located at: src/app/router/index.tsx
 */
export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Learner Routes */}
      <Route path="/learner" element={<AppLayout />}>
        <Route path="dashboard" element={
          <ProtectedRoute requiredPermission="dashboard:view-my-courses">
            <LearnerDashboard />
          </ProtectedRoute>
        } />
        <Route path="departments/:deptId/courses" element={
          <ProtectedRoute requiredPermission="course:view-department" requiredDepartment>
            <DepartmentCoursesPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Staff Routes */}
      <Route path="/staff" element={<AppLayout />}>
        <Route path="dashboard" element={
          <ProtectedRoute requiredPermission="dashboard:view-my-classes">
            <StaffDashboard />
          </ProtectedRoute>
        } />
        <Route path="departments/:deptId/courses/create" element={
          <ProtectedRoute requiredPermission="course:create-department" requiredDepartment>
            <CreateCoursePage />
          </ProtectedRoute>
        } />
      </Route>
    </Routes>
  );
};
```

---

## 5. Component Examples

### Department Context Provider

```typescript
/**
 * Provides department context to child components
 * Located at: src/shared/contexts/DepartmentContext.tsx
 */
interface DepartmentContextValue {
  departmentId: string | null;
  departmentName: string | null;
  hasPermission: (permission: string) => boolean;
}

const DepartmentContext = createContext<DepartmentContextValue | null>(null);

export const DepartmentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { selectedDepartmentId } = useNavigationStore();
  const { roleHierarchy } = useAuthStore();

  const departmentName = React.useMemo(() => {
    if (!selectedDepartmentId || !roleHierarchy) return null;

    // Find department name from role hierarchy
    const staffDept = roleHierarchy.staffRoles?.departmentRoles.find(
      d => d.departmentId === selectedDepartmentId
    );
    if (staffDept) return staffDept.departmentName;

    const learnerDept = roleHierarchy.learnerRoles?.departmentRoles.find(
      d => d.departmentId === selectedDepartmentId
    );
    if (learnerDept) return learnerDept.departmentName;

    return null;
  }, [selectedDepartmentId, roleHierarchy]);

  const hasPermission = React.useCallback((permission: string) => {
    if (!selectedDepartmentId) return false;
    return useAuthStore.getState().hasPermission(permission, {
      type: 'department',
      id: selectedDepartmentId
    });
  }, [selectedDepartmentId]);

  return (
    <DepartmentContext.Provider
      value={{
        departmentId: selectedDepartmentId,
        departmentName,
        hasPermission
      }}
    >
      {children}
    </DepartmentContext.Provider>
  );
};

export const useDepartmentContext = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error('useDepartmentContext must be used within DepartmentProvider');
  }
  return context;
};
```

### Permission-Based UI Component

```typescript
/**
 * Component that conditionally renders based on permissions
 * Located at: src/shared/components/PermissionGate.tsx
 */
interface PermissionGateProps {
  permission: string;
  departmentScoped?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  departmentScoped = false,
  fallback = null,
  children
}) => {
  const { selectedDepartmentId } = useNavigationStore();
  const { hasPermission } = useAuthStore();

  const hasAccess = React.useMemo(() => {
    if (departmentScoped && selectedDepartmentId) {
      return hasPermission(permission, {
        type: 'department',
        id: selectedDepartmentId
      });
    }
    return hasPermission(permission);
  }, [permission, departmentScoped, selectedDepartmentId, hasPermission]);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

// Usage example:
<PermissionGate permission="course:create-department" departmentScoped>
  <Button onClick={handleCreateCourse}>Create Course</Button>
</PermissionGate>
```

---

## 6. Mobile Considerations

### Responsive Sidebar Behavior

```typescript
/**
 * Mobile-aware sidebar with slide-in behavior
 */
export const Sidebar: React.FC = () => {
  const { isSidebarOpen, setSidebarOpen } = useNavigation();

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] border-r bg-background',
          'lg:sticky lg:top-14 lg:z-30',
          'w-64 transition-transform duration-300',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar content */}
      </aside>
    </>
  );
};
```

### Mobile Department Selection

On mobile, the department selector remains at the top of the sidebar. When a user selects a department:
1. Department becomes highlighted
2. Department Actions section appears below
3. User can scroll to see actions
4. Tapping outside sidebar closes it (retains department selection)

Future enhancement: Dedicated "Department Actions" page that appears after department selection.

---

## 7. Implementation Checklist

### State Management
- [ ] Update AuthState interface with roleHierarchy
- [ ] Implement NavigationState store
- [ ] Add hasPermission method to auth store
- [ ] Add department selection persistence
- [ ] Clear department on logout

### Navigation Components
- [ ] Define GLOBAL_NAV_ITEMS array
- [ ] Define DEPARTMENT_NAV_ITEMS array
- [ ] Implement Sidebar with three sections
- [ ] Implement NavLink component
- [ ] Add department selector UI
- [ ] Add empty states (no department, no actions)

### Routing
- [ ] Update ProtectedRoute component
- [ ] Add requiredDepartment prop
- [ ] Update all route definitions
- [ ] Add department selection required screen

### Helper Components
- [ ] Implement DepartmentProvider
- [ ] Implement PermissionGate
- [ ] Add loading states
- [ ] Add error boundaries

### Login Flow
- [ ] Update LoginForm to use defaultDashboard
- [ ] Test navigation for each userType
- [ ] Handle token refresh
- [ ] Handle logout cleanup

### Mobile
- [ ] Test sidebar slide-in on mobile
- [ ] Test department selection on mobile
- [ ] Ensure touch targets are adequate
- [ ] Test landscape orientation

### Testing
- [ ] Unit tests for navigation store
- [ ] Unit tests for hasPermission
- [ ] Integration tests for sidebar filtering
- [ ] Integration tests for protected routes
- [ ] E2E tests for login → department selection → action
- [ ] E2E tests for department switching

### Documentation
- [ ] Document navigation item structure
- [ ] Document permission naming conventions
- [ ] Create component usage examples
- [ ] Update developer onboarding docs

---

## Estimated Timeline

- **Week 1**: State management updates (auth + navigation stores)
- **Week 2**: Sidebar component with two-section structure
- **Week 3**: Protected routes and permission gates
- **Week 4**: Mobile optimization and testing

**Total**: 4 weeks for frontend implementation

**Note**: Can run in parallel with backend work (weeks 1-2 can use mock data)
