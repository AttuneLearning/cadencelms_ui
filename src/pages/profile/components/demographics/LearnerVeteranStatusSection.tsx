/**
 * Veteran Status Section - Learner Demographics (Section 4.5)
 * GI Bill Eligibility Context
 * Conditional military details if veteran/active-duty/reserve
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { VeteranStatus } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

const veteranStatusOptions: { value: VeteranStatus; label: string }[] = [
  { value: 'not-veteran', label: 'Not a Veteran' },
  { value: 'active-duty', label: 'Active Duty' },
  { value: 'veteran', label: 'Veteran' },
  { value: 'reserve', label: 'Reserve/National Guard' },
  { value: 'dependent', label: 'Military Dependent' },
  { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
];

export function LearnerVeteranStatusSection() {
  const { data } = useDemographics();
  const [localData, setLocalData] = useState({
    veteranStatus: data?.veteranStatus,
    militaryBranch: data?.militaryBranch || '',
    yearsOfService: data?.yearsOfService,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setLocalData({
      veteranStatus: data?.veteranStatus,
      militaryBranch: data?.militaryBranch || '',
      yearsOfService: data?.yearsOfService,
    });
  }, [data]);

  const showMilitaryDetails =
    localData.veteranStatus === 'active-duty' ||
    localData.veteranStatus === 'veteran' ||
    localData.veteranStatus === 'reserve';

  const handleVeteranStatusChange = async (value: VeteranStatus) => {
    setLocalData({ ...localData, veteranStatus: value });

    // Clear military details if not applicable
    const updates: any = { veteranStatus: value };
    if (value !== 'active-duty' && value !== 'veteran' && value !== 'reserve') {
      updates.militaryBranch = undefined;
      updates.yearsOfService = undefined;
      setLocalData({
        veteranStatus: value,
        militaryBranch: '',
        yearsOfService: undefined,
      });
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
    <CollapsibleSection title="Veteran Status" defaultExpanded={false}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          This information helps determine eligibility for GI Bill education benefits, VA services, and
          veteran support programs. Veterans and military dependents may qualify for tuition assistance,
          priority registration, and other benefits.
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
          <Label htmlFor="veteranStatus">Veteran Status</Label>
          <Select
            value={localData.veteranStatus || ''}
            onValueChange={(value) => handleVeteranStatusChange(value as VeteranStatus)}
          >
            <SelectTrigger id="veteranStatus">
              <SelectValue placeholder="Select veteran status" />
            </SelectTrigger>
            <SelectContent>
              {veteranStatusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Conditional Military Details */}
        {showMilitaryDetails && (
          <div className="pl-6 border-l-2 border-green-200 space-y-3">
            <Badge variant="outline" className="mb-2 bg-green-50">
              Military Service Details
            </Badge>

            <div className="space-y-2">
              <Label htmlFor="militaryBranch">Military Branch</Label>
              <Input
                id="militaryBranch"
                value={localData.militaryBranch}
                onChange={(e) => setLocalData({ ...localData, militaryBranch: e.target.value })}
                onBlur={(e) => handleBlur('militaryBranch', e.target.value)}
                placeholder="e.g., Army, Navy, Air Force, Marines, Coast Guard"
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearsOfService">Years of Service</Label>
              <Input
                id="yearsOfService"
                type="number"
                min="0"
                max="60"
                value={localData.yearsOfService || ''}
                onChange={(e) =>
                  setLocalData({
                    ...localData,
                    yearsOfService: parseInt(e.target.value) || undefined,
                  })
                }
                onBlur={(e) =>
                  handleBlur('yearsOfService', parseInt(e.target.value) || undefined)
                }
                placeholder="Total years of service"
              />
              <p className="text-xs text-gray-500">
                Include active duty, reserve, and National Guard service
              </p>
            </div>

            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="font-semibold mb-1">GI Bill Benefits</p>
              <p className="text-xs text-gray-700">
                Veterans and qualifying dependents may be eligible for education benefits. Contact the
                Veterans Services Office at veterans@institution.edu or call (555) 123-4567 for
                assistance with benefit applications.
              </p>
            </div>
          </div>
        )}

        {localData.veteranStatus === 'dependent' && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-semibold mb-1">Military Dependent Benefits</p>
            <p className="text-xs text-gray-700">
              As a military dependent, you may qualify for education benefits through programs like the
              Post-9/11 GI Bill transfer or Chapter 35 benefits. Contact Veterans Services for more
              information.
            </p>
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
