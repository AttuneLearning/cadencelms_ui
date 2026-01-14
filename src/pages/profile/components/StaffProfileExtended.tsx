/**
 * Staff Profile Extended Container
 * Demo: Integrates staff extended profile sections
 */

import React from 'react';
import { useStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import { ProfessionalInfoSection } from './staff/ProfessionalInfoSection';
import { EmploymentSection } from './staff/EmploymentSection';
import { CredentialsSection } from './staff/CredentialsSection';
import { OfficeHoursSection } from './staff/OfficeHoursSection';
import { ResearchSection } from './staff/ResearchSection';
import { ProfessionalLinksSection } from './staff/ProfessionalLinksSection';
import { MembershipsSection } from './staff/MembershipsSection';
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
      {/* Section 1.1: Professional Information */}
      <ProfessionalInfoSection
        data={{
          professionalTitle: data?.professionalTitle,
          headline: data?.headline,
          academicRank: data?.academicRank,
          contractType: data?.contractType,
        }}
      />

      {/* Section 1.2: Employment Details */}
      <EmploymentSection
        data={{
          employeeId: data?.employeeId,
          hireDate: data?.hireDate,
          officeLocation: data?.officeLocation,
        }}
      />

      {/* Section 1.3: Credentials & Certifications */}
      <CredentialsSection
        data={{
          credentials: data?.credentials,
        }}
      />

      {/* Section 1.4: Office Hours */}
      <OfficeHoursSection
        data={{
          officeHours: data?.officeHours,
        }}
      />

      {/* Section 1.5: Research & Publications */}
      <ResearchSection
        data={{
          researchInterests: data?.researchInterests,
          publications: data?.publications,
        }}
      />

      {/* Section 1.6: Professional Links */}
      <ProfessionalLinksSection
        data={{
          linkedInUrl: data?.linkedInUrl,
          orcidId: data?.orcidId,
          googleScholarUrl: data?.googleScholarUrl,
          websiteUrl: data?.websiteUrl,
        }}
      />

      {/* Section 1.7: Professional Memberships */}
      <MembershipsSection
        data={{
          professionalMemberships: data?.professionalMemberships,
        }}
      />
    </div>
  );
}
