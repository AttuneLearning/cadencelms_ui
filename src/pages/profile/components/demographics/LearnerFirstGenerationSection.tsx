/**
 * First Generation College Student Section - Learner Demographics (Section 4.4)
 * Tracks first-generation status with parent education levels
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Checkbox } from '@/shared/ui/checkbox';
import { Badge } from '@/shared/ui/badge';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { EducationLevel } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

const educationLevelOptions: { value: EducationLevel; label: string }[] = [
  { value: 'less-than-high-school', label: 'Less than High School' },
  { value: 'high-school', label: 'High School Diploma/GED' },
  { value: 'some-college', label: 'Some College (No Degree)' },
  { value: 'associates', label: "Associate's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctoral Degree' },
];

export function LearnerFirstGenerationSection() {
  const { data } = useDemographics();
  const [firstGeneration, setFirstGeneration] = useState<boolean>(
    data?.firstGenerationStudent || false
  );
  const [parent1Level, setParent1Level] = useState<EducationLevel | undefined>(
    data?.parent1EducationLevel
  );
  const [parent2Level, setParent2Level] = useState<EducationLevel | undefined>(
    data?.parent2EducationLevel
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setFirstGeneration(data?.firstGenerationStudent || false);
    setParent1Level(data?.parent1EducationLevel);
    setParent2Level(data?.parent2EducationLevel);
  }, [data]);

  const handleFirstGenToggle = async (checked: boolean) => {
    setFirstGeneration(checked);

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ firstGenerationStudent: checked });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleParentEducationChange = async (
    parent: 'parent1' | 'parent2',
    value: EducationLevel | undefined
  ) => {
    if (parent === 'parent1') {
      setParent1Level(value);
    } else {
      setParent2Level(value);
    }

    const field = parent === 'parent1' ? 'parent1EducationLevel' : 'parent2EducationLevel';

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
    <CollapsibleSection title="First Generation College Student" defaultExpanded={false}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          First-generation college students are those whose parents/guardians did not complete a
          bachelor's degree. This information helps identify students who may benefit from additional
          support services.
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

        <div className="space-y-3 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="first-generation"
              checked={firstGeneration}
              onCheckedChange={handleFirstGenToggle}
            />
            <Label htmlFor="first-generation" className="cursor-pointer font-semibold">
              I am a first-generation college student
            </Label>
          </div>
          <p className="text-xs text-gray-500 ml-6">
            Check this box if you will be the first in your family to complete a bachelor's degree
          </p>
        </div>

        {/* Parent/Guardian Education Levels */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">Parent/Guardian Education (Optional)</h4>
            <Badge variant="secondary" className="text-xs">
              Helps determine eligibility
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            Providing parent/guardian education levels helps verify first-generation status and identify
            relevant support programs.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="parent1Education">Parent/Guardian 1 Education</Label>
              <Select
                value={parent1Level || ''}
                onValueChange={(value) =>
                  handleParentEducationChange('parent1', value as EducationLevel)
                }
              >
                <SelectTrigger id="parent1Education">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent2Education">Parent/Guardian 2 Education</Label>
              <Select
                value={parent2Level || ''}
                onValueChange={(value) =>
                  handleParentEducationChange('parent2', value as EducationLevel)
                }
              >
                <SelectTrigger id="parent2Education">
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevelOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(parent1Level === 'bachelors' ||
            parent1Level === 'masters' ||
            parent1Level === 'doctorate' ||
            parent2Level === 'bachelors' ||
            parent2Level === 'masters' ||
            parent2Level === 'doctorate') &&
            firstGeneration && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Note: You indicated you are first-generation, but at least one parent has a bachelor's
                degree or higher. You may want to review your first-generation status.
              </div>
            )}
        </div>
      </div>
    </CollapsibleSection>
  );
}
