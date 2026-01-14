/**
 * Staff Profile Extended Container
 * Demo: Integrates staff extended profile sections
 */

import React from 'react';
import { useStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import { ProfessionalInfoSection } from './staff/ProfessionalInfoSection';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle } from 'lucide-react';

export function StaffProfileExtended() {
  const { data, isLoading, error } = useStaffExtended();

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
          Failed to load staff profile: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo Section 1.1: Professional Information */}
      <ProfessionalInfoSection
        data={{
          professionalTitle: data?.professionalTitle,
          headline: data?.headline,
          academicRank: data?.academicRank,
          contractType: data?.contractType,
        }}
      />

      {/* Additional sections would follow the same pattern:
        - Section 1.2: Employment Details
        - Section 1.3: Credentials & Certifications
        - Section 1.4: Office Hours
        - Section 1.5: Research & Publications
        - Section 1.6: Professional Links
        - Section 1.7: Professional Memberships
      */}

      <div className="p-4 border rounded-lg bg-blue-50 text-sm text-gray-700">
        <p className="font-semibold mb-2">🎯 Demo Complete - Pattern Established</p>
        <p>This demonstrates Section 1.1 (Professional Information).</p>
        <p className="mt-2">
          The remaining 6 staff sections (1.2-1.7) follow the same pattern:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Import section component</li>
          <li>Pass relevant data from useStaffExtended() hook</li>
          <li>Auto-save handles persistence</li>
          <li>CollapsibleSection provides consistent UI</li>
        </ul>
      </div>
    </div>
  );
}
