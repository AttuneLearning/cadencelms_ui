/**
 * Identity & Gender Section - Staff Demographics (Section 3.1)
 * EEO Reporting Context
 * Voluntary with opt-out default (per ISS-010 Q5: default TRUE)
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { VoluntaryBadge } from '../shared/VoluntaryBadge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { LegalGender } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

const legalGenderOptions: { value: LegalGender; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non-binary', label: 'Non-Binary' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
];

export function StaffIdentityGenderSection() {
  const { data } = useDemographics();
  const [localData, setLocalData] = useState({
    legalGender: data?.legalGender,
    genderIdentity: data?.genderIdentity || '',
    pronouns: data?.pronouns || '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setLocalData({
      legalGender: data?.legalGender,
      genderIdentity: data?.genderIdentity || '',
      pronouns: data?.pronouns || '',
    });
  }, [data]);

  const handleBlur = async (field: keyof typeof localData, value: any) => {
    if (localData[field] === value) return;

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

  return (
    <CollapsibleSection
      title="Identity & Gender"
      badge={<VoluntaryBadge context="eeo" />}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          This information is collected for Equal Employment Opportunity (EEO) reporting purposes.
          Providing this information is voluntary and will not affect your employment.
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
          <Label htmlFor="legalGender">Legal Gender</Label>
          <Select
            value={localData.legalGender || ''}
            onValueChange={(value) => {
              const newValue = value as LegalGender;
              setLocalData({ ...localData, legalGender: newValue });
              handleBlur('legalGender', newValue);
            }}
          >
            <SelectTrigger id="legalGender">
              <SelectValue placeholder="Select legal gender" />
            </SelectTrigger>
            <SelectContent>
              {legalGenderOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Legal gender as it appears on official documents
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="genderIdentity">Gender Identity (Optional)</Label>
          <Input
            id="genderIdentity"
            value={localData.genderIdentity}
            onChange={(e) => setLocalData({ ...localData, genderIdentity: e.target.value })}
            onBlur={(e) => handleBlur('genderIdentity', e.target.value)}
            placeholder="How you identify"
            maxLength={100}
          />
          <p className="text-xs text-gray-500">
            Your self-identified gender, which may differ from legal gender
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pronouns">Pronouns (Optional)</Label>
          <Input
            id="pronouns"
            value={localData.pronouns}
            onChange={(e) => setLocalData({ ...localData, pronouns: e.target.value })}
            onBlur={(e) => handleBlur('pronouns', e.target.value)}
            placeholder="e.g., she/her, he/him, they/them"
            maxLength={50}
          />
          <p className="text-xs text-gray-500">
            Pronouns you would like others to use when referring to you
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
