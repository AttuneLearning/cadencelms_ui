/**
 * Profile Extended Demo Page
 * Testing ISS-010 demo sections before full integration
 */

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { StaffProfileExtended } from './components/StaffProfileExtended';
import { LearnerProfileExtended } from './components/LearnerProfileExtended';
import { DemographicsContainer } from './components/DemographicsContainer';
import { useAuthStore } from '@/features/auth/model/authStore';
import type { UserProfileContext } from '@/entities/user-profile/model/types';
import { User, FileText } from 'lucide-react';

export const ProfileExtendedDemo: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roleHierarchy } = useAuthStore();

  const profileContext = useMemo<UserProfileContext | undefined>(() => {
    if (location.pathname.startsWith('/staff')) return 'staff';
    if (location.pathname.startsWith('/learner')) return 'learner';

    const fallback = roleHierarchy?.defaultDashboard;
    return fallback === 'staff' || fallback === 'learner' ? fallback : undefined;
  }, [location.pathname, roleHierarchy?.defaultDashboard]);

  // Determine active tab from URL
  const activeTab = useMemo(() => {
    if (location.pathname.includes('/demographics')) return 'demographics';
    return 'extended';
  }, [location.pathname]);

  // Handle tab change by navigating to appropriate URL
  const handleTabChange = (value: string) => {
    const basePath = profileContext === 'staff' ? '/staff/profile' : '/learner/profile';
    if (value === 'demographics') {
      navigate(`${basePath}/demographics`);
    } else {
      navigate(`${basePath}/details`);
    }
  };

  if (!profileContext) {
    return (
      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Context Not Detected</CardTitle>
            <CardDescription>
              Unable to determine if you are viewing as staff or learner.
              Please access this page from /staff/profile or /learner/profile.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">
                {profileContext === 'staff' ? 'Professional Profile' : 'Learner Profile'}
              </CardTitle>
              <CardDescription>
                Manage your {profileContext === 'staff' ? 'professional' : 'learner'} information and demographic data
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              {profileContext === 'staff' ? 'Staff' : 'Learner'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              All changes are saved automatically as you edit. Expand each section to view and update your information.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extended" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {profileContext === 'staff' ? 'Professional Details' : 'Learner Details'}
          </TabsTrigger>
          <TabsTrigger value="demographics" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Demographics
          </TabsTrigger>
        </TabsList>

        {/* Extended Profile Tab */}
        <TabsContent value="extended" className="space-y-6 mt-6">
          {profileContext === 'staff' ? (
            <StaffProfileExtended />
          ) : (
            <LearnerProfileExtended />
          )}
        </TabsContent>

        {/* Demographics Tab */}
        <TabsContent value="demographics" className="space-y-6 mt-6">
          <DemographicsContainer context={profileContext} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
