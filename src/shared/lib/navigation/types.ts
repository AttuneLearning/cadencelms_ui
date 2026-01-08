/**
 * Navigation types and interfaces
 */

export interface Breadcrumb {
  label: string;
  path: string;
}

export interface NavigationHistoryItem {
  path: string;
  timestamp: number;
}

export interface NavigationState {
  activeRoute: string;
  breadcrumbs: Breadcrumb[];
  history: NavigationHistoryItem[];
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
}
