/**
 * Custom hook for navigation utilities
 * Combines react-router-dom navigation with our navigation store
 */

import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStore } from './navigationStore';
import type { Breadcrumb } from './types';

export const useNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeRoute,
    breadcrumbs,
    history,
    setActiveRoute,
    setBreadcrumbs,
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapse,
    setSidebarCollapsed,
  } = useNavigationStore();

  // Update active route when location changes
  useEffect(() => {
    setActiveRoute(location.pathname);
  }, [location.pathname, setActiveRoute]);

  const goTo = (path: string) => {
    navigate(path);
  };

  const goBack = () => {
    navigate(-1);
  };

  const goForward = () => {
    navigate(1);
  };

  const updateBreadcrumbs = (crumbs: Breadcrumb[]) => {
    setBreadcrumbs(crumbs);
  };

  return {
    activeRoute,
    breadcrumbs,
    history,
    location,
    goTo,
    goBack,
    goForward,
    updateBreadcrumbs,
    isSidebarOpen,
    isSidebarCollapsed,
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapse,
    setSidebarCollapsed,
  };
};
