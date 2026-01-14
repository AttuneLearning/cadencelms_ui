/**
 * Learner Profile Extended Container
 * Demo: Integrates learner extended profile sections
 */

import React from 'react';
import { useLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import { EmergencyContactsSection } from './learner/EmergencyContactsSection';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle } from 'lucide-react';

export function LearnerProfileExtended() {
  const { data, isLoading, error } = useLearnerExtended();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load learner profile: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Section 2.2: Emergency Contacts */}
      <EmergencyContactsSection
        data={{
          emergencyContacts: data?.emergencyContacts,
        }}
      />

      {/* Additional sections would follow the same pattern:
        - Section 2.1: Student Information
        - Section 2.3: Parent/Guardian Information
        - Section 2.4: Identification Documents
        - Section 2.5: Prior Education
        - Section 2.6: Accommodations
        - Section 2.7: Housing & Parking
      */}

      <div className="p-4 border rounded-lg bg-blue-50 text-sm text-gray-700">
        <p className="font-semibold mb-2">🎯 Demo Complete - Pattern Established</p>
        <p>This demonstrates Section 2.2 (Emergency Contacts) with array management.</p>
        <p className="mt-2">
          The remaining 6 learner sections (2.1, 2.3-2.7) follow the same pattern:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Import section component</li>
          <li>Pass relevant data from useLearnerExtended() hook</li>
          <li>Array fields use add/edit/remove pattern shown here</li>
          <li>Simple fields use pattern from Professional Info section</li>
          <li>Conditional visibility (e.g., housing fields) uses state + CSS</li>
        </ul>
      </div>
    </div>
  );
}
