/**
 * Profile Extended Demo Page
 * Testing ISS-010 demo sections before full integration
 */

import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
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
  const [activeTab, setActiveTab] = useState('extended');
  const location = useLocation();
  const { roleHierarchy } = useAuthStore();

  const profileContext = useMemo<UserProfileContext | undefined>(() => {
    if (location.pathname.startsWith('/staff')) return 'staff';
    if (location.pathname.startsWith('/learner')) return 'learner';

    const fallback = roleHierarchy?.defaultDashboard;
    return fallback === 'staff' || fallback === 'learner' ? fallback : undefined;
  }, [location.pathname, roleHierarchy?.defaultDashboard]);

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
              <CardTitle className="text-2xl">Extended Profile - Demo</CardTitle>
              <CardDescription>
                Testing ISS-010 demo sections (3 of 31 sections implemented)
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-lg">
              {profileContext === 'staff' ? 'Staff' : 'Learner'} Context
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>🧪 Demo Mode:</strong> This page demonstrates 3 complete sections with
              reusable patterns. Auto-save on blur is enabled. The remaining 28 sections
              follow the same patterns shown here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="extended" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Extended Profile
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

      {/* Footer Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3 text-sm text-gray-600">
            <h4 className="font-semibold text-gray-900">Implementation Status:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="font-medium text-gray-700">Completed (3 sections):</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Professional Information (Staff 1.1)</li>
                  <li>Emergency Contacts (Learner 2.2)</li>
                  <li>Reporting Consent (Demographics)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700">Remaining Staff (6):</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Employment Details</li>
                  <li>Credentials & Certifications</li>
                  <li>Office Hours</li>
                  <li>Research & Publications</li>
                  <li>Professional Links</li>
                  <li>Professional Memberships</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-gray-700">Remaining Learner (6):</p>
                <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                  <li>Student Information</li>
                  <li>Parent/Guardian</li>
                  <li>Identification Documents</li>
                  <li>Prior Education</li>
                  <li>Accommodations</li>
                  <li>Housing & Parking</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="font-medium text-gray-700">Plus 16 Demographics Sections (Shared):</p>
              <p className="text-xs mt-1">
                Identity, Race/Ethnicity, Veteran Status, Citizenship, Disability, Language,
                Financial Status (learner), Religious Accommodations (learner), etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
