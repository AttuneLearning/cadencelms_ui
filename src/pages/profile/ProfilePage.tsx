/**
 * User Profile Page
 * Displays and allows editing of the current user's profile
 */

import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  useUserProfile,
  useUserDepartments,
  UserProfileCard,
  UserProfileForm,
  type UserDepartment,
} from '@/entities/user-profile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { Badge } from '@/shared/ui/badge';
import { useToast } from '@/shared/ui/use-toast';
import { useNavigation } from '@/shared/lib/navigation/useNavigation';
import { AlertCircle, Edit, X, Building2, Users, FlaskConical } from 'lucide-react';
import type { UserProfileContext } from '@/entities/user-profile/model/types';
import { useAuthStore } from '@/features/auth/model/authStore';

export const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const { updateBreadcrumbs } = useNavigation();
  const location = useLocation();
  const { roleHierarchy } = useAuthStore();

  const profileContext = useMemo<UserProfileContext | undefined>(() => {
    if (location.pathname.startsWith('/staff')) return 'staff';
    if (location.pathname.startsWith('/learner')) return 'learner';

    const fallback = roleHierarchy?.defaultDashboard;
    return fallback === 'staff' || fallback === 'learner' ? fallback : undefined;
  }, [location.pathname, roleHierarchy?.defaultDashboard]);

  // Fetch user profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError,
  } = useUserProfile(profileContext);

  // Fetch departments only if user is staff
  const {
    data: departments,
    isLoading: isLoadingDepartments,
    error: departmentsError,
  } = useUserDepartments({
    enabled: profile?.role === 'staff',
  });

  // Set breadcrumbs
  useEffect(() => {
    updateBreadcrumbs([
      { label: 'Home', path: '/' },
      { label: 'Profile', path: '/profile' },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle successful profile update
  const handleUpdateSuccess = () => {
    setIsEditing(false);
    toast({
      title: 'Profile updated',
      description: 'Your profile has been successfully updated.',
    });
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Loading state
  if (isLoadingProfile) {
    return (
      <div className="container mx-auto py-8 space-y-8 max-w-4xl">
        <div>
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardHeader>
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (profileError || !profile) {
    return (
      <div className="container mx-auto py-8 max-w-4xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            View and manage your personal information
          </p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Profile Card or Edit Form */}
      {isEditing ? (
        <div className="space-y-4">
          <UserProfileForm profile={profile} onSuccess={handleUpdateSuccess} context={profileContext} />
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleCancelEdit}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <UserProfileCard profile={profile} showDetails />
      )}

      {/* Departments Section (Staff only) */}
      {profile.role === 'staff' && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                My Departments
              </CardTitle>
              <CardDescription>
                Departments you are assigned to and your roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              {departmentsError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Failed to load departments. Please try again later.
                  </AlertDescription>
                </Alert>
              )}

              {isLoadingDepartments ? (
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-6 w-20" />
                    </div>
                  ))}
                </div>
              ) : departments && departments.length > 0 ? (
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <DepartmentCard key={dept.id} department={dept} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium mb-2">No departments assigned</p>
                  <p className="text-muted-foreground">
                    You are not currently assigned to any departments
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}

      {/* Account Information */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              System-level details about your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Account Status
                </div>
                <Badge
                  variant={profile.status === 'active' ? 'default' : 'secondary'}
                  className={
                    profile.status === 'active'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-yellow-500/10 text-yellow-500'
                  }
                >
                  {profile.status}
                </Badge>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  User Role
                </div>
                <Badge
                  variant="outline"
                  className={
                    profile.role === 'global-admin'
                      ? 'bg-red-500/10 text-red-500'
                      : profile.role === 'staff'
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-green-500/10 text-green-500'
                  }
                >
                  {profile.role === 'global-admin' ? 'Admin' : profile.role}
                </Badge>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Account Created
                </div>
                <div className="text-sm">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Last Login
                </div>
                <div className="text-sm">
                  {profile.lastLoginAt
                    ? new Date(profile.lastLoginAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </div>
              </div>
            </div>

            {profile.studentId && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Student ID
                </div>
                <div className="text-sm font-mono">{profile.studentId}</div>
              </div>
            )}

            {profile.permissions && profile.permissions.length > 0 && (
              <div className="pt-4 border-t">
                <div className="text-sm font-medium text-muted-foreground mb-2">
                  Permissions
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* ISS-010 Profile Details & Demographics Sections */}
      <section>
        <Card>
          <CardHeader>
            <CardTitle>Profile Details & Demographics</CardTitle>
            <CardDescription>
              Additional profile information and demographic data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">
              Access your detailed profile information including professional details, education history, and demographic information.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={profileContext === 'staff' ? '/staff/profile/extended-demo' : '/learner/profile/extended-demo'}>
                <Button variant="outline" className="w-full sm:w-auto">
                  View Profile Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

// Department Card Component
interface DepartmentCardProps {
  department: UserDepartment;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department }) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold">{department.name}</h4>
          <Badge variant="outline" className="text-xs">
            {department.code}
          </Badge>
          {!department.isActive && (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
        {department.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {department.description}
          </p>
        )}
      </div>
      {department.userRole && (
        <Badge variant="secondary" className="ml-4">
          {department.userRole}
        </Badge>
      )}
    </div>
  );
};
