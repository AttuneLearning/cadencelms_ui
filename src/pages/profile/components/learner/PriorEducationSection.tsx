/**
 * Prior Education Section (Learner - Section 2.5)
 * Array field for education history with GPA, dates, and institution details
 */

import React, { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { useUpdateLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IPriorEducation, InstitutionType, EducationLevel } from '@/entities/user-profile/model/types';
import { Plus, Trash2, CheckCircle2, Loader2, GraduationCap } from 'lucide-react';

interface PriorEducationSectionProps {
  data: {
    priorEducation?: IPriorEducation[];
  };
}

const institutionTypeOptions: { value: InstitutionType; label: string }[] = [
  { value: 'high-school', label: 'High School' },
  { value: 'community-college', label: 'Community College' },
  { value: 'college', label: 'College' },
  { value: 'university', label: 'University' },
  { value: 'vocational', label: 'Vocational/Technical School' },
  { value: 'online', label: 'Online Institution' },
  { value: 'other', label: 'Other' },
];

const degreeOptions: { value: EducationLevel; label: string }[] = [
  { value: 'high-school', label: 'High School Diploma/GED' },
  { value: 'some-college', label: 'Some College (No Degree)' },
  { value: 'associates', label: "Associate's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctoral Degree' },
];

export function PriorEducationSection({ data }: PriorEducationSectionProps) {
  const [education, setEducation] = useState<IPriorEducation[]>(data.priorEducation || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateLearnerExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ priorEducation: education });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAdd = () => {
    const newEd: IPriorEducation = {
      institutionName: '',
      institutionType: 'high-school',
      creditsEarned: 0,
    };
    setEducation([...education, newEd]);
    setEditingIndex(education.length);
  };

  const handleRemove = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof IPriorEducation, value: any) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const isValid = (ed: IPriorEducation) => {
    return ed.institutionName && ed.institutionType;
  };

  return (
    <CollapsibleSection
      title="Prior Education"
      badge={education.length > 0 && <Badge>{education.length}</Badge>}
      defaultExpanded={false}
    >
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

        <div className="space-y-3">
          {education.map((ed, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  <Badge variant="outline">
                    {institutionTypeOptions.find((opt) => opt.value === ed.institutionType)?.label}
                  </Badge>
                  {ed.graduationDate && <Badge>Graduated</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Institution Name *</Label>
                      <Input
                        value={ed.institutionName}
                        onChange={(e) => handleUpdate(index, 'institutionName', e.target.value)}
                        placeholder="School or college name"
                        maxLength={200}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Institution Type *</Label>
                      <Select
                        value={ed.institutionType}
                        onValueChange={(value) => handleUpdate(index, 'institutionType', value as InstitutionType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {institutionTypeOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Degree/Certificate Earned</Label>
                    <Select
                      value={ed.degreeEarned || ''}
                      onValueChange={(value) => handleUpdate(index, 'degreeEarned', value as EducationLevel)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select degree level" />
                      </SelectTrigger>
                      <SelectContent>
                        {degreeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Major/Field of Study</Label>
                    <Input
                      value={ed.major || ''}
                      onChange={(e) => handleUpdate(index, 'major', e.target.value)}
                      placeholder="e.g., Computer Science"
                      maxLength={100}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>GPA</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="4.0"
                        value={ed.gpa || ''}
                        onChange={(e) => handleUpdate(index, 'gpa', parseFloat(e.target.value) || undefined)}
                        placeholder="0.00"
                      />
                      <p className="text-xs text-gray-500">Scale: 4.0</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Credits Earned</Label>
                      <Input
                        type="number"
                        min="0"
                        value={ed.creditsEarned}
                        onChange={(e) => handleUpdate(index, 'creditsEarned', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Credits Transferred</Label>
                      <Input
                        type="number"
                        min="0"
                        value={ed.creditsTransferred || ''}
                        onChange={(e) => handleUpdate(index, 'creditsTransferred', parseInt(e.target.value) || undefined)}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={ed.startDate || ''}
                        onChange={(e) => handleUpdate(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={ed.endDate || ''}
                        onChange={(e) => handleUpdate(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Graduation Date</Label>
                      <Input
                        type="date"
                        value={ed.graduationDate || ''}
                        onChange={(e) => handleUpdate(index, 'graduationDate', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Switch
                        id={`transcript-${index}`}
                        checked={ed.transcriptOnFile || false}
                        onCheckedChange={(checked) => handleUpdate(index, 'transcriptOnFile', checked)}
                      />
                      <Label htmlFor={`transcript-${index}`} className="cursor-pointer">
                        Transcript on File
                      </Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={ed.notes || ''}
                      onChange={(e) => handleUpdate(index, 'notes', e.target.value)}
                      placeholder="Additional information about this education"
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isValid(ed)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold">{ed.institutionName}</div>
                  {ed.major && (
                    <div className="text-sm text-gray-600">Major: {ed.major}</div>
                  )}
                  {ed.degreeEarned && (
                    <div className="text-sm text-gray-600">
                      {degreeOptions.find((opt) => opt.value === ed.degreeEarned)?.label}
                    </div>
                  )}
                  {ed.gpa && (
                    <div className="text-sm text-gray-600">GPA: {ed.gpa.toFixed(2)}</div>
                  )}
                  <div className="text-sm text-gray-600">
                    Credits Earned: {ed.creditsEarned}
                    {ed.creditsTransferred && ed.creditsTransferred > 0 && (
                      <span className="ml-2 text-green-600">
                        ({ed.creditsTransferred} transferred)
                      </span>
                    )}
                  </div>
                  {ed.graduationDate && (
                    <div className="text-sm text-gray-600">
                      Graduated: {new Date(ed.graduationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                      })}
                    </div>
                  )}
                  {ed.transcriptOnFile && (
                    <Badge variant="secondary" className="text-xs">
                      Transcript on File
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setEditingIndex(index)}>
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={handleAdd} className="w-full" disabled={editingIndex !== null}>
          <Plus className="h-4 w-4 mr-2" />
          Add Prior Education
        </Button>
      </div>
    </CollapsibleSection>
  );
}
