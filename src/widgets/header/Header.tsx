/**
 * Header Component - Phase 3 Update (Track F)
 * Version: 2.1.0
 * Date: 2026-01-11
 *
 * Updated to use server-provided displayAs labels from roleHierarchy
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Menu, LogOut, Settings, BookOpen, Building2 } from 'lucide-react';
import { ThemeToggle } from '@/features/theme/ui/ThemeToggle';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useNavigation } from '@/shared/lib/navigation';
import { useDepartmentContext } from '@/shared/hooks';
import { Button } from '@/shared/ui/button';
import { Separator } from '@/shared/ui/separator';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { getUserTypeDisplayLabel } from '@/shared/lib/displayUtils';
import type { UserType } from '@/shared/types/auth';

interface NavItem {
  label: string;
  path: string;
  userTypes: UserType[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    userTypes: ['learner', 'staff', 'global-admin'],
  },
  {
    label: 'Courses',
    path: '/courses',
    userTypes: ['learner', 'staff', 'global-admin'],
  },
  {
    label: 'Admin',
    path: '/admin',
    userTypes: ['global-admin'],
  },
];

export const Header: React.FC = () => {
  const { isAuthenticated, user, roleHierarchy, logout } = useAuthStore();
  const { toggleSidebar } = useNavigation();
  const {
    currentDepartmentName,
    currentDepartmentRoles,
    hasPermission,
  } = useDepartmentContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    const email = user.email;
    return email.charAt(0).toUpperCase();
  };

  // Get primary user type display label using server displayAs
  const getPrimaryUserTypeLabel = (): string => {
    if (!roleHierarchy?.primaryUserType) return 'User';

    // Use server-provided displayAs from roleHierarchy
    return getUserTypeDisplayLabel(
      roleHierarchy.primaryUserType,
      roleHierarchy.userTypeDisplayMap
    );
  };

  // Filter nav items based on user types
  const filteredNavItems = navItems.filter(
    (item) => user?.userTypes.some(ut => item.userTypes.includes(ut))
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Mobile menu button */}
        {isAuthenticated && (
          <Button
            variant="ghost"
            size="sm"
            className="mr-2 lg:hidden"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <div className="mr-4 flex items-center">
          <Link
            to="/"
            className="mr-4 flex items-center space-x-2"
            aria-label="LMS UI V2 Home"
          >
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="hidden font-bold text-lg sm:inline-block">LMS UI V2</span>
          </Link>

          {/* Desktop navigation */}
          {isAuthenticated && (
            <>
              <Separator orientation="vertical" className="mx-2 h-6 hidden md:block" />
              <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full"
                      aria-label="User menu"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>{getUserInitials()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.email || 'User'}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {getPrimaryUserTypeLabel()}
                        </p>
                        {currentDepartmentName && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                            <Building2 className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {currentDepartmentName}
                            </span>
                          </div>
                        )}
                        {currentDepartmentRoles.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {currentDepartmentRoles.slice(0, 3).map((role) => (
                              <Badge key={role} variant="secondary" className="text-xs">
                                {role}
                              </Badge>
                            ))}
                            {currentDepartmentRoles.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{currentDepartmentRoles.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/courses" className="cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4" />
                        <span>My Courses</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
