/**
 * Professional Information Section (Staff - Section 1.1)
 * Demo: Basic fields, enums, auto-save on blur
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import type { AcademicRank, ContractType } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

interface ProfessionalInfoSectionProps {
  data: {
    professionalTitle?: string;
    headline?: string;
    academicRank?: AcademicRank;
    contractType?: ContractType;
  };
}

const academicRankOptions: { value: AcademicRank; label: string }[] = [
  { value: 'instructor', label: 'Instructor' },
  { value: 'assistant-professor', label: 'Assistant Professor' },
  { value: 'associate-professor', label: 'Associate Professor' },
  { value: 'professor', label: 'Professor' },
  { value: 'distinguished-professor', label: 'Distinguished Professor' },
];

const contractTypeOptions: { value: ContractType; label: string }[] = [
  { value: 'full-time', label: 'Full-Time' },
  { value: 'part-time', label: 'Part-Time' },
  { value: 'adjunct', label: 'Adjunct' },
  { value: 'visiting', label: 'Visiting' },
  { value: 'emeritus', label: 'Emeritus' },
  { value: 'contract', label: 'Contract' },
];

export function ProfessionalInfoSection({ data }: ProfessionalInfoSectionProps) {
  const [localData, setLocalData] = useState(data);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  // Sync with prop changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleBlur = async (field: keyof typeof localData, value: any) => {
    if (localData[field] === value) return; // No change

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
      title="Professional Information"
      defaultExpanded={true}
    >
      <div className="space-y-4">
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

        {/* Professional Title */}
        <div className="space-y-2">
          <Label htmlFor="professionalTitle">Professional Title</Label>
          <Input
            id="professionalTitle"
            placeholder="e.g., Senior Instructor, Department Chair"
            maxLength={100}
            value={localData.professionalTitle || ''}
            onChange={(e) => setLocalData({ ...localData, professionalTitle: e.target.value })}
            onBlur={(e) => handleBlur('professionalTitle', e.target.value)}
          />
          <p className="text-xs text-gray-500">Optional - Your professional title or position</p>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
          <Textarea
            id="headline"
            placeholder="Brief professional summary (max 200 characters)"
            maxLength={200}
            rows={2}
            value={localData.headline || ''}
            onChange={(e) => setLocalData({ ...localData, headline: e.target.value })}
            onBlur={(e) => handleBlur('headline', e.target.value)}
          />
          <p className="text-xs text-gray-500">
            {localData.headline?.length || 0}/200 characters
          </p>
        </div>

        {/* Academic Rank */}
        <div className="space-y-2">
          <Label htmlFor="academicRank">Academic Rank</Label>
          <Select
            value={localData.academicRank || ''}
            onValueChange={(value) => {
              const newValue = value as AcademicRank;
              setLocalData({ ...localData, academicRank: newValue });
              handleBlur('academicRank', newValue);
            }}
          >
            <SelectTrigger id="academicRank">
              <SelectValue placeholder="Select academic rank" />
            </SelectTrigger>
            <SelectContent>
              {academicRankOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Contract Type */}
        <div className="space-y-2">
          <Label htmlFor="contractType">Contract Type</Label>
          <Select
            value={localData.contractType || ''}
            onValueChange={(value) => {
              const newValue = value as ContractType;
              setLocalData({ ...localData, contractType: newValue });
              handleBlur('contractType', newValue);
            }}
          >
            <SelectTrigger id="contractType">
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              {contractTypeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </CollapsibleSection>
  );
}
