/**
 * SelectDepartmentPage - Phase 4 Implementation
 * Version: 2.0.0
 * Date: 2026-01-10
 *
 * Page for selecting department context when required by a route
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { useAuthStore } from '@/features/auth/model';
import { useNavigationStore } from '@/shared/stores';
import { Folder, ChevronRight, AlertCircle } from 'lucide-react';

interface DepartmentOption {
  id: string;
  name: string;
  type: 'staff' | 'learner';
  isPrimary: boolean;
}

export const SelectDepartmentPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roleHierarchy, user } = useAuthStore();
  const { setSelectedDepartment, rememberDepartment } = useNavigationStore();

  // Get the intended destination from location state
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Extract user's departments
  const departments: DepartmentOption[] = React.useMemo(() => {
    const depts: DepartmentOption[] = [];

    if (!roleHierarchy) return depts;

    // Staff departments
    if (roleHierarchy.staffRoles) {
      for (const deptGroup of roleHierarchy.staffRoles.departmentRoles) {
        depts.push({
          id: deptGroup.departmentId,
          name: deptGroup.departmentName,
          type: 'staff',
          isPrimary: deptGroup.isPrimary,
        });
      }
    }

    // Learner departments
    if (roleHierarchy.learnerRoles) {
      for (const deptGroup of roleHierarchy.learnerRoles.departmentRoles) {
        depts.push({
          id: deptGroup.departmentId,
          name: deptGroup.departmentName,
          type: 'learner',
          isPrimary: false,
        });
      }
    }

    return depts;
  }, [roleHierarchy]);

  // Handle department selection
  const handleSelectDepartment = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    if (user) {
      rememberDepartment(user._id, departmentId);
    }
    // Navigate to intended destination
    navigate(from, { replace: true });
  };

  // Handle cancel - go to dashboard
  const handleCancel = () => {
    const defaultDashboard = roleHierarchy?.defaultDashboard || 'learner';
    navigate(`/${defaultDashboard}/dashboard`, { replace: true });
  };

  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="h-6 w-6 text-primary" />
            <CardTitle>Select Department</CardTitle>
          </div>
          <CardDescription>
            The page you're trying to access requires a department context. Please select a
            department to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {departments.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                You don't have access to any departments.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Contact your administrator for department access.
              </p>
              <Button onClick={handleCancel} variant="outline" className="mt-4">
                Go to Dashboard
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {departments.map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => handleSelectDepartment(dept.id)}
                    className="w-full flex items-center gap-3 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
                  >
                    <Folder className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{dept.name}</span>
                        {dept.isPrimary && (
                          <Badge variant="secondary" className="text-xs flex-shrink-0">
                            Primary
                          </Badge>
                        )}
                        <Badge
                          variant="outline"
                          className="text-xs capitalize flex-shrink-0"
                        >
                          {dept.type}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
              <div className="pt-4 border-t">
                <Button onClick={handleCancel} variant="ghost" className="w-full">
                  Cancel
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
