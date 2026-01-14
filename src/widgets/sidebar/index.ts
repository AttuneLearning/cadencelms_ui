/**
 * Sidebar widget exports
 * Version: 3.0.0 (ISS-007)
 */

export { Sidebar } from './Sidebar';
export {
  BASE_NAV_ITEMS,
  LEARNER_CONTEXT_NAV,
  STAFF_CONTEXT_NAV,
  ADMIN_CONTEXT_NAV,
  DEPARTMENT_NAV_ITEMS,
  getCurrentDashboardPath,
  getDefaultDashboardPath,
  getPrimaryDashboardPath, // @deprecated
} from './config/navItems';
export type {
  BaseNavItem,
  ContextNavItem,
  DepartmentNavItem,
} from './config/navItems';
export { NavLink } from './ui/NavLink';
