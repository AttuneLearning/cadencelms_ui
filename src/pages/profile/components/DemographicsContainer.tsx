/**
 * Demographics Container
 * Demo: Integrates demographics sections (shared between staff/learner)
 */

import React from 'react';
import { useDemographics } from '@/entities/user-profile/model/useUserProfile';
import { ReportingConsentSection } from './demographics/ReportingConsentSection';
import { StaffIdentityGenderSection } from './demographics/StaffIdentityGenderSection';
import { StaffRaceEthnicitySection } from './demographics/StaffRaceEthnicitySection';
import { StaffVeteranStatusSection } from './demographics/StaffVeteranStatusSection';
import { StaffWorkAuthorizationSection } from './demographics/StaffWorkAuthorizationSection';
import { StaffDisabilitySection } from './demographics/StaffDisabilitySection';
import { StaffLanguageProficiencySection } from './demographics/StaffLanguageProficiencySection';
import { LearnerIdentityGenderSection } from './demographics/LearnerIdentityGenderSection';
import { LearnerRaceEthnicitySection } from './demographics/LearnerRaceEthnicitySection';
import { LearnerCitizenshipVisaSection } from './demographics/LearnerCitizenshipVisaSection';
import { LearnerFirstGenerationSection } from './demographics/LearnerFirstGenerationSection';
import { LearnerVeteranStatusSection } from './demographics/LearnerVeteranStatusSection';
import { LearnerDisabilitySection } from './demographics/LearnerDisabilitySection';
import { LearnerLanguageProficiencySection } from './demographics/LearnerLanguageProficiencySection';
import { LearnerFinancialStatusSection } from './demographics/LearnerFinancialStatusSection';
import { LearnerReligiousAccommodationsSection } from './demographics/LearnerReligiousAccommodationsSection';
import { Skeleton } from '@/shared/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { AlertCircle } from 'lucide-react';

interface DemographicsContainerProps {
  context: 'staff' | 'learner';
}

export function DemographicsContainer({ context }: DemographicsContainerProps) {
  const { data, isLoading, error } = useDemographics();

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
          Failed to load demographics: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // Default values per clarifications (opt-out approach)
  const allowReporting = data?.allowReporting ?? true;
  const allowResearch = data?.allowResearch ?? true;

  return (
    <div className="space-y-6">
      {/* Context-Specific Demographics Sections */}
      {context === 'staff' ? (
        <>
          {/* Staff Demographics Sections (3.1 - 3.6) */}
          <StaffIdentityGenderSection />
          <StaffRaceEthnicitySection />
          <StaffVeteranStatusSection />
          <StaffWorkAuthorizationSection />
          <StaffDisabilitySection />
          <StaffLanguageProficiencySection />
        </>
      ) : (
        <>
          {/* Learner Demographics Sections (4.1 - 4.9) */}
          <LearnerIdentityGenderSection />
          <LearnerRaceEthnicitySection />
          <LearnerCitizenshipVisaSection />
          <LearnerFirstGenerationSection />
          <LearnerVeteranStatusSection />
          <LearnerDisabilitySection />
          <LearnerLanguageProficiencySection />
          <LearnerFinancialStatusSection />
          <LearnerReligiousAccommodationsSection />
        </>
      )}

      {/* Shared Section: Reporting Consent */}
      <ReportingConsentSection
        data={{
          allowReporting,
          allowResearch,
          lastUpdated: data?.lastUpdated,
        }}
        context={context}
      />
    </div>
  );
}
