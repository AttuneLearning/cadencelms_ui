/**
 * ProfilePage Component (V2 - Person Data)
 *
 * Profile management page with auto-save functionality.
 * Uses Person Data v2.0 API and types.
 *
 * Features:
 * - Tabbed layout (Basic Info | Contact | Preferences | Consent)
 * - Fetches from getMyPerson() API
 * - Auto-save with 2-minute debounce
 * - Real-time save status indicators
 */

import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/shared/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle, User, Mail, Settings, Shield } from 'lucide-react';
import { PageHeader } from '@/shared/ui/page-header';
import { personApi } from '@/shared/api/personApi';
import type { IPerson } from '@/shared/types/person';
import { BasicInfoForm } from '@/features/profile/ui/BasicInfoForm';
import { ContactInfoForm } from '@/features/profile/ui/ContactInfoForm';
import { PreferencesForm } from '@/features/profile/ui/PreferencesForm';
import { ConsentForm } from '@/features/profile/ui/ConsentForm';

export const ProfilePageV2: React.FC = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [person, setPerson] = useState<IPerson | null>(null);

  /**
   * Fetch person data
   */
  const {
    data: personData,
    isLoading,
    error,
    refetch: _refetch,
  } = useQuery<IPerson, Error, IPerson>({
    queryKey: ['person', 'me'],
    queryFn: async () => {
      const response = await personApi.getMyPerson();
      return response.data;
    },
  });

  React.useEffect(() => {
    if (personData) {
      setPerson(personData);
    }
  }, [personData]);

  /**
   * Handle successful save - update local state
   */
  const handleSaveSuccess = useCallback((updatedPerson: IPerson) => {
    setPerson(updatedPerson);
  }, []);

  /**
   * Loading state
   */
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 space-y-6 max-w-5xl" data-testid="loading-skeleton">
        <div className="space-y-2">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  /**
   * Error state
   */
  if (error || !personData) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load profile data. Please try refreshing the page.
            {error instanceof Error && ` Error: ${error.message}`}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const currentPerson = person ?? personData;

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-5xl">
      {/* Header */}
      <PageHeader
        title="My Profile"
        description="Manage your personal information, contact details, and preferences. Changes are automatically saved."
      />

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="consent" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Consent</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <BasicInfoForm person={currentPerson} onSaveSuccess={handleSaveSuccess} />
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <ContactInfoForm person={currentPerson} onSaveSuccess={handleSaveSuccess} />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesForm person={currentPerson} onSaveSuccess={handleSaveSuccess} />
        </TabsContent>

        <TabsContent value="consent" className="space-y-6">
          <ConsentForm person={currentPerson} onSaveSuccess={handleSaveSuccess} />
        </TabsContent>
      </Tabs>

      {/* Help Text */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Auto-save enabled:</strong> Your changes are automatically saved 2 minutes after you
          stop typing, or immediately when you move to another field. Look for the save status indicator
          at the top right of each section.
        </AlertDescription>
      </Alert>
    </div>
  );
};
