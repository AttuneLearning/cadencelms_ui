/**
 * Demographics Container
 * Demo: Integrates demographics sections (shared between staff/learner)
 */

import React from 'react';
import { useDemographics } from '@/entities/user-profile/model/useUserProfile';
import { ReportingConsentSection } from './demographics/ReportingConsentSection';
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
      {/* Demo Section 1.14 / 2.17: Reporting Consent */}
      <ReportingConsentSection
        data={{
          allowReporting,
          allowResearch,
          lastUpdated: data?.lastUpdated,
        }}
        context={context}
      />

      {/* Additional sections would follow the same pattern:

        STAFF DEMOGRAPHICS (Sections 1.8 - 1.13):
        - 1.8: Identity & Gender (EEO)
        - 1.9: Race & Ethnicity (EEO-1)
        - 1.10: Veteran Status (VEVRAA)
        - 1.11: Work Authorization (citizenship, visa)
        - 1.12: Disability (ADA/Section 503)
        - 1.13: Language (primary, proficiency)

        LEARNER DEMOGRAPHICS (Sections 2.8 - 2.16):
        - 2.8: Identity & Gender (Title IX)
        - 2.9: Race & Ethnicity (IPEDS)
        - 2.10: Citizenship & Visa (international students)
        - 2.11: First Generation Student
        - 2.12: Veteran Status (GI Bill)
        - 2.13: Disability (Section 504)
        - 2.14: Language (ESL services)
        - 2.15: Personal & Family Status (financial aid)
        - 2.16: Religious Accommodations
      */}

      <div className="p-4 border rounded-lg bg-blue-50 text-sm text-gray-700">
        <p className="font-semibold mb-2">🎯 Demo Complete - Pattern Established</p>
        <p>This demonstrates Section 1.14/2.17 (Reporting Consent) with consent toggles.</p>
        <p className="mt-2">
          The remaining demographics sections follow similar patterns:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Simple fields:</strong> Use pattern from Professional Info (text, select, radio)</li>
          <li><strong>Conditional visibility:</strong> Show visa fields only if visa-holder selected</li>
          <li><strong>Multi-select:</strong> Race checkboxes allow multiple selections</li>
          <li><strong>Voluntary badges:</strong> Use VoluntaryBadge component with appropriate context</li>
          <li><strong>Auto-save:</strong> All sections use useDemographics() hook</li>
        </ul>
      </div>
    </div>
  );
}
