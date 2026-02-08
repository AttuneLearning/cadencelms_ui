/**
 * Work Authorization Section - Staff Demographics (Section 3.4)
 * Citizenship and work authorization status
 * Conditional visa details if visa-holder
 */

import { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { Citizenship, VisaType } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const citizenshipOptions: { value: Citizenship; label: string }[] = [
  { value: 'us-citizen', label: 'U.S. Citizen' },
  { value: 'us-national', label: 'U.S. National' },
  { value: 'permanent-resident', label: 'Permanent Resident (Green Card)' },
  { value: 'visa-holder', label: 'Visa Holder' },
  { value: 'refugee-asylee', label: 'Refugee/Asylee' },
  { value: 'temporary-resident', label: 'Temporary Resident' },
  { value: 'other', label: 'Other' },
  { value: 'prefer-not-to-say', label: 'Prefer Not to Say' },
];

const visaTypeOptions: { value: VisaType; label: string }[] = [
  { value: 'h1b', label: 'H-1B (Specialty Occupation)' },
  { value: 'h4', label: 'H-4 (Dependent of H-1B)' },
  { value: 'f1', label: 'F-1 (Student)' },
  { value: 'j1', label: 'J-1 (Exchange Visitor)' },
  { value: 'm1', label: 'M-1 (Vocational Student)' },
  { value: 'other', label: 'Other Visa Type' },
];

export function StaffWorkAuthorizationSection() {
  const { data } = useDemographics();
  const [localData, setLocalData] = useState({
    citizenship: data?.citizenship,
    countryOfCitizenship: data?.countryOfCitizenship || '',
    visaType: data?.visaType,
    visaExpirationDate: data?.visaExpirationDate || '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setLocalData({
      citizenship: data?.citizenship,
      countryOfCitizenship: data?.countryOfCitizenship || '',
      visaType: data?.visaType,
      visaExpirationDate: data?.visaExpirationDate || '',
    });
  }, [data]);

  const showVisaFields = localData.citizenship === 'visa-holder';

  const handleCitizenshipChange = async (value: Citizenship) => {
    setLocalData({ ...localData, citizenship: value });

    // Clear visa details if not visa-holder
    const updates: any = { citizenship: value };
    if (value !== 'visa-holder') {
      updates.visaType = undefined;
      updates.visaExpirationDate = undefined;
      setLocalData({
        ...localData,
        citizenship: value,
        visaType: undefined,
        visaExpirationDate: '',
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

  // Check if visa is expiring soon (within 60 days)
  const visaExpiringSoon =
    localData.visaExpirationDate &&
    new Date(localData.visaExpirationDate) <= new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  const visaExpired =
    localData.visaExpirationDate && new Date(localData.visaExpirationDate) < new Date();

  return (
    <CollapsibleSection title="Work Authorization" defaultExpanded={false}>
      <div className="space-y-4">
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
          <Label htmlFor="citizenship">Citizenship/Work Authorization Status</Label>
          <Select
            value={localData.citizenship || ''}
            onValueChange={(value) => handleCitizenshipChange(value as Citizenship)}
          >
            <SelectTrigger id="citizenship">
              <SelectValue placeholder="Select citizenship status" />
            </SelectTrigger>
            <SelectContent>
              {citizenshipOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="countryOfCitizenship">Country of Citizenship</Label>
          <Input
            id="countryOfCitizenship"
            value={localData.countryOfCitizenship}
            onChange={(e) =>
              setLocalData({ ...localData, countryOfCitizenship: e.target.value })
            }
            onBlur={(e) => handleBlur('countryOfCitizenship', e.target.value)}
            placeholder="e.g., United States, Canada"
            maxLength={100}
          />
          <p className="text-xs text-gray-500">Full country name or ISO code</p>
        </div>

        {/* Conditional Visa Fields */}
        {showVisaFields && (
          <div className="pl-6 border-l-2 border-purple-200 space-y-3">
            <Badge variant="outline" className="mb-2 bg-purple-50">
              Visa Information
            </Badge>

            <div className="space-y-2">
              <Label htmlFor="visaType">Visa Type *</Label>
              <Select
                value={localData.visaType || ''}
                onValueChange={(value) => {
                  setLocalData({ ...localData, visaType: value as VisaType });
                  handleBlur('visaType', value as VisaType);
                }}
              >
                <SelectTrigger id="visaType">
                  <SelectValue placeholder="Select visa type" />
                </SelectTrigger>
                <SelectContent>
                  {visaTypeOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">Required for visa holders</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="visaExpirationDate">Visa Expiration Date *</Label>
              <Input
                id="visaExpirationDate"
                type="date"
                value={localData.visaExpirationDate}
                onChange={(e) =>
                  setLocalData({ ...localData, visaExpirationDate: e.target.value })
                }
                onBlur={(e) => handleBlur('visaExpirationDate', e.target.value)}
              />
              <p className="text-xs text-gray-500">Required for visa holders</p>
            </div>

            {/* Expiration Warnings */}
            {visaExpired && (
              <Alert className="border-red-200 bg-red-50/50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-800">
                  Your visa has expired. Please contact HR immediately to update your work
                  authorization status.
                </AlertDescription>
              </Alert>
            )}

            {visaExpiringSoon && !visaExpired && (
              <Alert className="border-amber-200 bg-amber-50/50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-sm text-amber-800">
                  Your visa expires soon (within 60 days). Please contact HR to begin the renewal
                  process.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </div>
    </CollapsibleSection>
  );
}
