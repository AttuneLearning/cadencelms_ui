/**
 * Reporting Consent Section (Demographics - Section 1.14 / 2.17)
 * Demo: Consent toggles with explanations, default true (opt-out)
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { ConsentToggle } from '../shared/ConsentToggle';
import { useUpdateDemographics } from '@/entities/user-profile/model/useUserProfile';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ReportingConsentSectionProps {
  data: {
    allowReporting: boolean;
    allowResearch: boolean;
    lastUpdated?: string;
  };
  context: 'staff' | 'learner';
}

export function ReportingConsentSection({ data, context }: ReportingConsentSectionProps) {
  const [allowReporting, setAllowReporting] = useState(data.allowReporting);
  const [allowResearch, setAllowResearch] = useState(data.allowResearch);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  // Sync with prop changes
  useEffect(() => {
    setAllowReporting(data.allowReporting);
    setAllowResearch(data.allowResearch);
  }, [data.allowReporting, data.allowResearch]);

  const handleToggle = async (field: 'allowReporting' | 'allowResearch', value: boolean) => {
    if (field === 'allowReporting') {
      setAllowReporting(value);
    } else {
      setAllowResearch(value);
    }

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ [field]: value });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const compliancePrograms = context === 'staff'
    ? 'EEO-1, VEVRAA, ADA compliance'
    : 'IPEDS, Title IX, Section 504 compliance';

  return (
    <CollapsibleSection
      title="Reporting Consent"
      defaultExpanded={true}
    >
      <div className="space-y-4">
        {/* Information Alert */}
        <Alert>
          <AlertDescription>
            <p className="mb-2">
              <strong>Your privacy is important.</strong> All demographic data is anonymized for reporting purposes.
            </p>
            <p>
              These settings control how your demographic information may be used. You can change these at any time.
            </p>
          </AlertDescription>
        </Alert>

        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {saveStatus === 'saving' && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            )}
            {saveStatus === 'saved' && (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Saved</span>
              </>
            )}
          </div>
        )}

        {/* Allow Reporting Toggle */}
        <ConsentToggle
          id="allowReporting"
          label="Allow Compliance Reporting"
          description={`Allow this information to be included in anonymized compliance reports (${compliancePrograms}). Your individual identity will never be disclosed.`}
          checked={allowReporting}
          onCheckedChange={(checked) => handleToggle('allowReporting', checked)}
        />

        {/* Allow Research Toggle */}
        <ConsentToggle
          id="allowResearch"
          label="Allow Institutional Research"
          description="Allow this information to be used for anonymized institutional research studies to improve programs and services. Your individual identity will never be disclosed."
          checked={allowResearch}
          onCheckedChange={(checked) => handleToggle('allowResearch', checked)}
        />

        {/* Last Updated */}
        {data.lastUpdated && (
          <p className="text-xs text-gray-500">
            Last updated: {new Date(data.lastUpdated).toLocaleDateString()}
          </p>
        )}

        {/* Explanation */}
        <div className="text-sm text-gray-600 space-y-2 pt-4 border-t">
          <p>
            <strong>Why we collect this information:</strong> Federal law requires educational institutions
            and employers to report demographic data to ensure equal opportunity and compliance with civil rights laws.
          </p>
          <p>
            <strong>How it's used:</strong> Data is aggregated and anonymized before being included in reports.
            No individual can be identified from these reports.
          </p>
          <p>
            <strong>Your rights:</strong> Providing this information is voluntary. You may opt out at any time
            by toggling these settings off.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
