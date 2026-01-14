/**
 * Language Proficiency Section - Learner Demographics (Section 4.7)
 * ESL Services Context
 * Primary language, English proficiency, and other languages
 */

import React, { useState, useEffect } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useUpdateDemographics, useDemographics } from '@/entities/user-profile/model/useUserProfile';
import type { EnglishProficiency } from '@/entities/user-profile/model/types';
import { CheckCircle2, Loader2, Plus, X } from 'lucide-react';

const englishProficiencyOptions: { value: EnglishProficiency; label: string }[] = [
  { value: 'native', label: 'Native Speaker' },
  { value: 'fluent', label: 'Fluent' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'basic', label: 'Basic' },
  { value: 'limited', label: 'Limited' },
];

export function LearnerLanguageProficiencySection() {
  const { data } = useDemographics();
  const [primaryLanguage, setPrimaryLanguage] = useState(data?.primaryLanguage || '');
  const [englishProficiency, setEnglishProficiency] = useState<EnglishProficiency | undefined>(
    data?.englishProficiency
  );
  const [otherLanguages, setOtherLanguages] = useState<string[]>(data?.otherLanguages || []);
  const [newLanguage, setNewLanguage] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateDemographics();

  useEffect(() => {
    setPrimaryLanguage(data?.primaryLanguage || '');
    setEnglishProficiency(data?.englishProficiency);
    setOtherLanguages(data?.otherLanguages || []);
  }, [data]);

  const showESLInfo =
    englishProficiency === 'basic' ||
    englishProficiency === 'limited' ||
    englishProficiency === 'intermediate';

  const handleBlur = async (field: 'primaryLanguage' | 'englishProficiency', value: any) => {
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

  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) return;

    const updated = [...otherLanguages, newLanguage.trim()];
    setOtherLanguages(updated);
    setNewLanguage('');

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ otherLanguages: updated });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleRemoveLanguage = async (index: number) => {
    const updated = otherLanguages.filter((_, i) => i !== index);
    setOtherLanguages(updated);

    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ otherLanguages: updated });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  return (
    <CollapsibleSection title="Language Proficiency" defaultExpanded={false}>
      <div className="space-y-4">
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          Language proficiency information helps identify students who may benefit from English as a
          Second Language (ESL) support services, tutoring, or other language assistance programs.
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
          <Label htmlFor="primaryLanguage">Primary Language</Label>
          <Input
            id="primaryLanguage"
            value={primaryLanguage}
            onChange={(e) => setPrimaryLanguage(e.target.value)}
            onBlur={(e) => handleBlur('primaryLanguage', e.target.value)}
            placeholder="e.g., English, Spanish, Mandarin"
            maxLength={100}
          />
          <p className="text-xs text-gray-500">
            The language you are most comfortable speaking (ISO 639-1 code or full name)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="englishProficiency">English Proficiency</Label>
          <Select
            value={englishProficiency || ''}
            onValueChange={(value) => {
              const newValue = value as EnglishProficiency;
              setEnglishProficiency(newValue);
              handleBlur('englishProficiency', newValue);
            }}
          >
            <SelectTrigger id="englishProficiency">
              <SelectValue placeholder="Select English proficiency level" />
            </SelectTrigger>
            <SelectContent>
              {englishProficiencyOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">
            Your level of English language proficiency
          </p>
        </div>

        {/* ESL Services Information */}
        {showESLInfo && (
          <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="font-semibold mb-1">ESL Support Services Available</p>
            <p className="text-xs text-gray-700">
              Based on your English proficiency level, you may be eligible for ESL tutoring, writing
              center support, and language development programs. Contact Student Services at
              esl@institution.edu or call (555) 123-4567 to learn more about available resources.
            </p>
          </div>
        )}

        {/* Other Languages */}
        <div className="space-y-3 pt-4 border-t">
          <Label className="text-base font-semibold">Other Languages</Label>
          <p className="text-sm text-gray-600">
            Additional languages you speak besides your primary language
          </p>

          {otherLanguages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {otherLanguages.map((lang, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {lang}
                  <button
                    onClick={() => handleRemoveLanguage(index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Add another language"
              maxLength={100}
              onKeyPress={(e) => e.key === 'Enter' && handleAddLanguage()}
            />
            <Button onClick={handleAddLanguage} disabled={!newLanguage.trim()}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Press Enter or click Add to include additional languages
          </p>
        </div>
      </div>
    </CollapsibleSection>
  );
}
