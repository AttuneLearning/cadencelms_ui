/**
 * Sidebar widget exports
 * Version: 4.0.0 (Navigation Redesign 2026-02-05)
 */

export { Sidebar } from './Sidebar';

// New section-based configuration (v4.0.0)
export {
  STAFF_SECTIONS,
  LEARNER_SECTIONS,
  ADMIN_SECTIONS,
  DEPARTMENT_ACTIONS,
  getSectionsForDashboard,
  getDepartmentActionsForDashboard,
  buildDepartmentActionPath,
} from './config/sectionConfig';
export type {
  SectionId,
  DashboardType,
  NavItem,
  NavSection,
  DashboardSections,
  DepartmentActionItem,
} from './config/sectionConfig';

// Legacy exports (v3.x) - kept for backward compatibility with other parts of codebase
export {
  BASE_NAV_ITEMS,
  LEARNER_CONTEXT_NAV,
  STAFF_CONTEXT_NAV,
  ADMIN_CONTEXT_NAV,
  DEPARTMENT_NAV_ITEMS,
  DEPARTMENT_ACTION_GROUPS,
  getCurrentDashboardPath,
  getDefaultDashboardPath,
  getPrimaryDashboardPath,
} from './config/navItems';
export type {
  BaseNavItem,
  ContextNavItem,
  DepartmentNavItem,
  DepartmentActionGroup,
} from './config/navItems';

export { NavLink } from './ui/NavLink';
