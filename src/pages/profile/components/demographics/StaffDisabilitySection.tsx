/**
 * Disability Status Section - Staff Demographics (Section 3.5)
 * ADA Compliance Context
 * Multi-select disability types with accommodations flag
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { VoluntaryBadge } from '../shared/VoluntaryBadge';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { DisabilityType } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

const disabilityTypeOptions: { value: DisabilityType; label: string }[] = [
  { value: 'physical', label: 'Physical Disability' },
  { value: 'visual', label: 'Visual Impairment' },
  { value: 'hearing', label: 'Hearing Impairment' },
  { value: 'learning', label: 'Learning Disability' },
  { value: 'mental-health', label: 'Mental Health Condition' },
  { value: 'chronic-illness', label: 'Chronic Illness' },
  { value: 'other', label: 'Other' },
];

export function StaffDisabilitySection() {
  const { data } = useDemographics();
  const [hasDisability, setHasDisability] = useState<boolean>(data?.hasDisability || false);
  const [selectedTypes, setSelectedTypes] = useState<DisabilityType[]>(data?.disabilityType || []);
  const [accommodationsRequired, setAccommodationsRequired] = useState<boolean>(
    data?.accommodationsRequired || false
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setHasDisability(data?.hasDisability || false);
    setSelectedTypes(data?.disabilityType || []);
    setAccommodationsRequired(data?.accommodationsRequired || false);
  }, [data]);

  const handleHasDisabilityToggle = async (checked: boolean) => {
    setHasDisability(checked);

    const updates: any = { hasDisability: checked };
    // Clear disability details if toggled off
    if (!checked) {
      updates.disabilityType = [];
      updates.accommodationsRequired = false;
      setSelectedTypes([]);
      setAccommodationsRequired(false);
    }

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync(updates);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleTypeToggle = async (type: DisabilityType, checked: boolean) => {
    let updated: DisabilityType[];
    if (checked) {
      updated = [...selectedTypes, type];
    } else {
      updated = selectedTypes.filter((t) => t !== type);
    }
    setSelectedTypes(updated);

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ disabilityType: updated });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAccommodationsToggle = async (checked: boolean) => {
    setAccommodationsRequired(checked);

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ accommodationsRequired: checked });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection
      title="Disability Status"
      badge={<VoluntaryBadge context="ada" />}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          This information is collected for ADA (Americans with Disabilities Act) compliance and to
          ensure reasonable accommodations are provided. Providing this information is voluntary and
          confidential.
        </div>

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

        {/* Primary Question */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="has-disability"
              checked={hasDisability}
              onCheckedChange={handleHasDisabilityToggle}
            />
            <Label htmlFor="has-disability" className="cursor-pointer font-semibold">
              I have a disability or chronic health condition
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            A disability is a physical or mental impairment that substantially limits one or more major
            life activities
          </p>
        </div>

        {/* Conditional Disability Details */}
        {hasDisability && (
          <div className="pl-6 border-l-2 border-blue-200 space-y-4">
            <Badge variant="outline" className="bg-blue-50">
              Disability Details
            </Badge>

            {/* Disability Types - Multi-Select */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Type of Disability (Select all that apply)
              </Label>
              <div className="space-y-2">
                {disabilityTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-start space-x-3">
                    <Checkbox
                      id={`disability-${option.value}`}
                      checked={selectedTypes.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleTypeToggle(option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`disability-${option.value}`}
                      className="cursor-pointer font-normal"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Accommodations Required */}
            <div className="space-y-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="accommodations-required"
                  checked={accommodationsRequired}
                  onCheckedChange={handleAccommodationsToggle}
                />
                <Label htmlFor="accommodations-required" className="cursor-pointer font-semibold">
                  I require workplace accommodations
                </Label>
              </div>
              <p className="text-xs text-gray-600 ml-6">
                Check this box if you need reasonable accommodations to perform your job duties. HR
                will contact you to discuss accommodation options.
              </p>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
