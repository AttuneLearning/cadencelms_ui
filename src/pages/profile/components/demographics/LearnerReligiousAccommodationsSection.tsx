/**
 * Religious Accommodations Section - Learner Demographics (Section 4.9)
 * Religious affiliation and accommodations needs
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { VoluntaryBadge } from '../shared/VoluntaryBadge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import { CheckCircle2, Loader2 } from 'lucide-react';

export function LearnerReligiousAccommodationsSection() {
  const { data } = useDemographics();
  const [religiousAffiliation, setReligiousAffiliation] = useState(data?.religiousAffiliation || '');
  const [religiousAccommodations, setReligiousAccommodations] = useState<boolean>(
    data?.religiousAccommodations || false
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setReligiousAffiliation(data?.religiousAffiliation || '');
    setReligiousAccommodations(data?.religiousAccommodations || false);
  }, [data]);

  const handleBlur = async (field: 'religiousAffiliation', value: string) => {
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

  const handleAccommodationsToggle = async (checked: boolean) => {
    setReligiousAccommodations(checked);

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ religiousAccommodations: checked });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection
      title="Religious Accommodations"
      badge={<VoluntaryBadge context="general" />}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          This information is voluntary and helps the institution provide appropriate religious
          accommodations for observances, dietary needs, prayer space, and other religious practices. All
          information is kept confidential.
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

        <div className="space-y-2">
          <Label htmlFor="religiousAffiliation">Religious Affiliation (Optional)</Label>
          <Input
            id="religiousAffiliation"
            value={religiousAffiliation}
            onChange={(e) => setReligiousAffiliation(e.target.value)}
            onBlur={(e) => handleBlur('religiousAffiliation', e.target.value)}
            placeholder="e.g., Christian, Muslim, Jewish, Hindu, Buddhist, Other"
            maxLength={100}
          />
          <p className="text-xs text-gray-500">
            Your religious tradition or faith, if any. This field is completely optional.
          </p>
        </div>

        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="religious-accommodations"
              checked={religiousAccommodations}
              onCheckedChange={handleAccommodationsToggle}
            />
            <Label htmlFor="religious-accommodations" className="cursor-pointer font-semibold">
              I may require religious accommodations
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            Check this box if you anticipate needing accommodations for religious observances, dietary
            requirements, prayer times, holy days, or other religious practices. A staff member will
            contact you to discuss your specific needs.
          </p>
        </div>

        {religiousAccommodations && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-semibold mb-1">Religious Accommodations Support</p>
            <p className="text-xs text-gray-700">
              Our Student Affairs office works with students to provide reasonable religious
              accommodations including:
            </p>
            <ul className="text-xs text-gray-700 mt-2 ml-4 list-disc space-y-1">
              <li>Exam rescheduling for religious observances</li>
              <li>Dietary accommodations in dining facilities</li>
              <li>Access to prayer and meditation spaces</li>
              <li>Excused absences for holy days</li>
              <li>Course scheduling considerations</li>
            </ul>
            <p className="text-xs text-gray-700 mt-2">
              Contact Student Affairs at studentaffairs@institution.edu or call (555) 123-4567 to
              discuss your accommodation needs.
            </p>
          </div>
        )}

        <div className="text-sm text-gray-600 border-t pt-4">
          <p className="font-semibold mb-1">Privacy Notice</p>
          <p className="text-xs">
            Your religious affiliation and accommodation requests are kept strictly confidential and are
            used solely to provide appropriate support services. This information is not shared with
            faculty or other students without your explicit consent, except as necessary to fulfill
            specific accommodation requests.
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
