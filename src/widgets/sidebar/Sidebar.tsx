/**
 * Sidebar navigation component
 * Role-based menu with active route highlighting and responsive behavior
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/features/auth/model/useAuth';
import { useNavigation } from '@/shared/lib/navigation';
import {
  Home,
  BookOpen,
  GraduationCap,
  Users,
  Settings,
  BarChart,
  FileText,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Package,
  FileCode,
  ListChecks,
  HelpCircle,
  Search,
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import type { Role } from '@/features/auth/model/types';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home,
    roles: ['learner', 'staff', 'global-admin'],
  },
  {
    label: 'Browse Courses',
    path: '/learner/catalog',
    icon: Search,
    roles: ['learner'],
  },
  {
    label: 'My Courses',
    path: '/learner/courses',
    icon: BookOpen,
    roles: ['learner'],
  },
  {
    label: 'My Learning',
    path: '/learner/learning',
    icon: GraduationCap,
    roles: ['learner'],
  },
  {
    label: 'Progress',
    path: '/learner/progress',
    icon: BarChart,
    roles: ['learner'],
  },
  {
    label: 'Certificates',
    path: '/learner/certificates',
    icon: FileText,
    roles: ['learner'],
  },
  {
    label: 'Course Management',
    path: '/staff/courses',
    icon: BookOpen,
    roles: ['staff', 'global-admin'],
  },
  {
    label: 'Content Library',
    path: '/staff/content',
    icon: FileText,
    roles: ['staff', 'global-admin'],
  },
  {
    label: 'Learners',
    path: '/staff/learners',
    icon: Users,
    roles: ['staff', 'global-admin'],
  },
  {
    label: 'Analytics',
    path: '/staff/analytics',
    icon: BarChart,
    roles: ['staff', 'global-admin'],
  },
  {
    label: 'Schedule',
    path: '/staff/schedule',
    icon: Calendar,
    roles: ['staff', 'global-admin'],
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: Users,
    roles: ['global-admin'],
  },
  {
    label: 'Program Management',
    path: '/admin/programs',
    icon: Layers,
    roles: ['global-admin'],
  },
  {
    label: 'Course Management',
    path: '/admin/courses',
    icon: BookOpen,
    roles: ['global-admin'],
  },
  {
    label: 'Class Management',
    path: '/admin/classes',
    icon: Calendar,
    roles: ['global-admin'],
  },
  {
    label: 'Content Library',
    path: '/admin/content',
    icon: Package,
    roles: ['global-admin'],
  },
  {
    label: 'Templates',
    path: '/admin/templates',
    icon: FileCode,
    roles: ['global-admin'],
  },
  {
    label: 'Exercises',
    path: '/admin/exercises',
    icon: ListChecks,
    roles: ['global-admin'],
  },
  {
    label: 'Question Bank',
    path: '/admin/questions',
    icon: HelpCircle,
    roles: ['global-admin'],
  },
  {
    label: 'System Settings',
    path: '/admin/settings',
    icon: Settings,
    roles: ['global-admin'],
  },
  {
    label: 'Roles & Permissions',
    path: '/admin/roles',
    icon: Shield,
    roles: ['global-admin'],
  },
  {
    label: 'Reports',
    path: '/admin/reports',
    icon: BarChart,
    roles: ['global-admin'],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { role } = useAuth();
  const { isSidebarOpen, isSidebarCollapsed, setSidebarOpen, toggleSidebarCollapse } =
    useNavigation();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => role && item.roles.includes(role)
  );

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

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
          'fixed left-0 top-14 z-50 h-[calc(100vh-3.5rem)] border-r bg-background transition-all duration-300',
          'lg:sticky lg:top-14 lg:z-30',
          isSidebarCollapsed ? 'w-16' : 'w-64',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Collapse toggle button */}
          <div className="flex items-center justify-end p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebarCollapse}
              className="h-8 w-8 p-0"
              aria-label={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation items */}
          <nav className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-accent hover:text-accent-foreground',
                    active
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground',
                    isSidebarCollapsed && 'justify-center px-2'
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isSidebarCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer section */}
          <div className="border-t p-2">
            <Link
              to="/settings"
              onClick={() => setSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground text-muted-foreground',
                isSidebarCollapsed && 'justify-center px-2'
              )}
              title={isSidebarCollapsed ? 'Settings' : undefined}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Settings</span>}
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};
