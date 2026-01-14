/**
 * Race & Ethnicity Section - Learner Demographics (Section 4.2)
 * IPEDS Reporting Context
 * Multi-select race with Hispanic/Latino flag and tribal affiliation
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { VoluntaryBadge } from '../shared/VoluntaryBadge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { Race } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

const raceOptions: { value: Race; label: string }[] = [
  { value: 'american-indian-alaska-native', label: 'American Indian or Alaska Native' },
  { value: 'asian', label: 'Asian' },
  { value: 'black-african-american', label: 'Black or African American' },
  { value: 'native-hawaiian-pacific-islander', label: 'Native Hawaiian or Other Pacific Islander' },
  { value: 'white', label: 'White' },
  { value: 'two-or-more-races', label: 'Two or More Races' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
];

export function LearnerRaceEthnicitySection() {
  const { data } = useDemographics();
  const [selectedRaces, setSelectedRaces] = useState<Race[]>(data?.race || []);
  const [isHispanicLatino, setIsHispanicLatino] = useState<boolean>(data?.isHispanicLatino || false);
  const [tribalAffiliation, setTribalAffiliation] = useState(data?.tribalAffiliation || '');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setSelectedRaces(data?.race || []);
    setIsHispanicLatino(data?.isHispanicLatino || false);
    setTribalAffiliation(data?.tribalAffiliation || '');
  }, [data]);

  const showTribalAffiliation = selectedRaces.includes('american-indian-alaska-native');

  const handleRaceToggle = async (race: Race, checked: boolean) => {
    let updatedRaces: Race[];
    if (checked) {
      updatedRaces = [...selectedRaces, race];
    } else {
      updatedRaces = selectedRaces.filter((r) => r !== race);
    }
    setSelectedRaces(updatedRaces);

    // Clear tribal affiliation if unchecking American Indian/Alaska Native
    const updates: any = { race: updatedRaces };
    if (race === 'american-indian-alaska-native' && !checked) {
      updates.tribalAffiliation = undefined;
      setTribalAffiliation('');
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

  const handleHispanicToggle = async (checked: boolean) => {
    setIsHispanicLatino(checked);

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ isHispanicLatino: checked });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleTribalAffiliationBlur = async (value: string) => {
    if (tribalAffiliation === value) return;

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ tribalAffiliation: value });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection
      title="Race & Ethnicity"
      badge={<VoluntaryBadge context="ipeds" />}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          This information is collected for IPEDS (Integrated Postsecondary Education Data System)
          reporting and helps ensure equal educational opportunities. You may select one or more racial
          categories that apply to you.
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

        {/* Hispanic/Latino - Separate Question */}
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <Label className="text-base font-semibold">Ethnicity</Label>
          <div className="flex items-center space-x-3">
            <Checkbox
              id="hispanic-latino"
              checked={isHispanicLatino}
              onCheckedChange={handleHispanicToggle}
            />
            <Label htmlFor="hispanic-latino" className="cursor-pointer font-normal">
              Hispanic or Latino
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            A person of Cuban, Mexican, Puerto Rican, South or Central American, or other Spanish
            culture or origin, regardless of race
          </p>
        </div>

        {/* Race - Multi-Select */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Race (Select all that apply)</Label>
          <div className="space-y-2">
            {raceOptions.map((option) => (
              <div key={option.value} className="flex items-start space-x-3">
                <Checkbox
                  id={`race-${option.value}`}
                  checked={selectedRaces.includes(option.value)}
                  onCheckedChange={(checked) => handleRaceToggle(option.value, checked as boolean)}
                />
                <div className="flex-1">
                  <Label
                    htmlFor={`race-${option.value}`}
                    className="cursor-pointer font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conditional Tribal Affiliation Field */}
        {showTribalAffiliation && (
          <div className="pl-6 border-l-2 border-amber-200 space-y-3">
            <Badge variant="outline" className="mb-2 bg-amber-50">
              Tribal Information
            </Badge>
            <div className="space-y-2">
              <Label htmlFor="tribalAffiliation">Tribal Affiliation (Optional)</Label>
              <Input
                id="tribalAffiliation"
                value={tribalAffiliation}
                onChange={(e) => setTribalAffiliation(e.target.value)}
                onBlur={(e) => handleTribalAffiliationBlur(e.target.value)}
                placeholder="e.g., Cherokee Nation, Navajo Nation"
                maxLength={200}
              />
              <p className="text-xs text-gray-500">
                If you are enrolled or affiliated with a specific tribe, please provide the name
              </p>
            </div>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
