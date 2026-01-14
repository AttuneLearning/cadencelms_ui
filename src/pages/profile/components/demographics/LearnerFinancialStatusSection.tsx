/**
 * Financial Status Section - Learner Demographics (Section 4.8)
 * Personal/family status and financial aid indicators
 * Includes ISS-012 readonly fields: pellEligible, lowIncomeStatus
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { VoluntaryBadge } from '../shared/VoluntaryBadge';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { MaritalStatus, HouseholdIncomeRange } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2, Lock, CheckCircle, XCircle, HelpCircle } from 'lucide-react';

const maritalStatusOptions: { value: MaritalStatus; label: string }[] = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'domestic-partnership', label: 'Domestic Partnership' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
];

const householdIncomeOptions: { value: HouseholdIncomeRange; label: string }[] = [
  { value: 'under-25k', label: 'Under $25,000' },
  { value: '25k-50k', label: '$25,000 - $50,000' },
  { value: '50k-75k', label: '$50,000 - $75,000' },
  { value: '75k-100k', label: '$75,000 - $100,000' },
  { value: '100k-150k', label: '$100,000 - $150,000' },
  { value: 'over-150k', label: 'Over $150,000' },
  { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
];

export function LearnerFinancialStatusSection() {
  const { data } = useDemographics();
  const [localData, setLocalData] = useState({
    maritalStatus: data?.maritalStatus,
    numberOfDependents: data?.numberOfDependents,
    householdIncomeRange: data?.householdIncomeRange,
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setLocalData({
      maritalStatus: data?.maritalStatus,
      numberOfDependents: data?.numberOfDependents,
      householdIncomeRange: data?.householdIncomeRange,
    });
  }, [data]);

  const handleBlur = async (field: keyof typeof localData, value: any) => {
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
      title="Financial & Personal Status"
      badge={<VoluntaryBadge context="general" />}
      defaultExpanded={false}
    >
      <div className="space-y-6">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          This information helps determine eligibility for financial aid, scholarships, and support
          programs. All information is kept confidential and will not affect your admission or enrollment
          status.
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

        {/* Personal Status */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Personal & Family Status</h4>

          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Marital Status</Label>
            <Select
              value={localData.maritalStatus || ''}
              onValueChange={(value) => {
                const newValue = value as MaritalStatus;
                setLocalData({ ...localData, maritalStatus: newValue });
                handleBlur('maritalStatus', newValue);
              }}
            >
              <SelectTrigger id="maritalStatus">
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                {maritalStatusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numberOfDependents">Number of Dependents</Label>
            <Input
              id="numberOfDependents"
              type="number"
              min="0"
              max="20"
              value={localData.numberOfDependents || ''}
              onChange={(e) =>
                setLocalData({
                  ...localData,
                  numberOfDependents: parseInt(e.target.value) || undefined,
                })
              }
              onBlur={(e) =>
                handleBlur('numberOfDependents', parseInt(e.target.value) || undefined)
              }
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              Number of children or other family members you financially support
            </p>
          </div>
        </div>

        {/* Household Income */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-semibold text-gray-900">Household Financial Information</h4>

          <div className="space-y-2">
            <Label htmlFor="householdIncomeRange">Household Income Range</Label>
            <Select
              value={localData.householdIncomeRange || ''}
              onValueChange={(value) => {
                const newValue = value as HouseholdIncomeRange;
                setLocalData({ ...localData, householdIncomeRange: newValue });
                handleBlur('householdIncomeRange', newValue);
              }}
            >
              <SelectTrigger id="householdIncomeRange">
                <SelectValue placeholder="Select income range" />
              </SelectTrigger>
              <SelectContent>
                {householdIncomeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Total annual household income from all sources
            </p>
          </div>
        </div>

        {/* ISS-012 Financial Aid Indicators (Readonly) */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-gray-900">Financial Aid Eligibility</h4>
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Readonly
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            These indicators are calculated by the Financial Aid office based on your FAFSA data and
            cannot be edited directly.
          </p>

          {/* Pell Eligibility */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <Label>Pell Grant Eligible</Label>
              {data?.pellEligible === true && (
                <Badge className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Eligible
                </Badge>
              )}
              {data?.pellEligible === false && (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Eligible
                </Badge>
              )}
              {data?.pellEligible === null && (
                <Badge variant="outline">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Not Determined
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Eligibility for federal Pell Grant program determined by Financial Aid office
            </p>
          </div>

          {/* Low Income Status */}
          <div className="space-y-2 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <Label>Low Income Status</Label>
              {data?.lowIncomeStatus === true && (
                <Badge className="bg-blue-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Qualified
                </Badge>
              )}
              {data?.lowIncomeStatus === false && (
                <Badge variant="secondary">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Qualified
                </Badge>
              )}
              {data?.lowIncomeStatus === null && (
                <Badge variant="outline">
                  <HelpCircle className="h-3 w-3 mr-1" />
                  Not Determined
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Low income status for eligibility in support programs, determined by Financial Aid office
            </p>
          </div>

          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-semibold mb-1">Questions About Financial Aid?</p>
            <p className="text-xs text-gray-700">
              Contact the Financial Aid office at finaid@institution.edu or call (555) 123-4567 for
              information about your eligibility status, available programs, or to discuss your FAFSA
              application.
            </p>
          </div>
        </div>
      </div>
    </CollapsibleSection>
  );
}
