/**
 * Parent/Guardian Information Section (Learner - Section 2.3)
 * Array field with show/hide toggle for age 18+
 * Includes FERPA access checkbox
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
import { Checkbox } from '@/shared/ui/checkbox';
import { useUpdateLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IParentGuardian, RelationshipType, EducationLevel } from '@/entities/user-profile/model/types';
import { Plus, Trash2, CheckCircle2, Loader2, UserCircle, Eye, EyeOff } from 'lucide-react';

interface ParentGuardianSectionProps {
  data: {
    parentGuardians?: IParentGuardian[];
  };
  userAge?: number; // Optional: to determine default visibility
}

const relationshipOptions: { value: RelationshipType; label: string }[] = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'legal-guardian', label: 'Legal Guardian' },
  { value: 'other', label: 'Other' },
];

const educationLevelOptions: { value: EducationLevel; label: string }[] = [
  { value: 'less-than-high-school', label: 'Less than High School' },
  { value: 'high-school', label: 'High School Diploma/GED' },
  { value: 'some-college', label: 'Some College (No Degree)' },
  { value: 'associates', label: "Associate's Degree" },
  { value: 'bachelors', label: "Bachelor's Degree" },
  { value: 'masters', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctoral Degree' },
];

export function ParentGuardianSection({ data, userAge }: ParentGuardianSectionProps) {
  const [guardians, setGuardians] = useState<IParentGuardian[]>(data.parentGuardians || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showSection, setShowSection] = useState(userAge ? userAge < 18 : true);
  const updateMutation = useUpdateLearnerExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ parentGuardians: guardians });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAdd = () => {
    const newGuardian: IParentGuardian = {
      fullName: '',
      relationship: 'mother',
      isCustodial: true,
      phones: [''],
    };
    setGuardians([...guardians, newGuardian]);
    setEditingIndex(guardians.length);
  };

  const handleRemove = (index: number) => {
    setGuardians(guardians.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof IParentGuardian, value: any) => {
    const updated = [...guardians];
    updated[index] = { ...updated[index], [field]: value };
    setGuardians(updated);
  };

  const handleAddPhone = (index: number) => {
    const updated = [...guardians];
    updated[index].phones = [...updated[index].phones, ''];
    setGuardians(updated);
  };

  const handleUpdatePhone = (guardianIndex: number, phoneIndex: number, value: string) => {
    const updated = [...guardians];
    updated[guardianIndex].phones[phoneIndex] = value;
    setGuardians(updated);
  };

  const handleRemovePhone = (guardianIndex: number, phoneIndex: number) => {
    const updated = [...guardians];
    updated[guardianIndex].phones = updated[guardianIndex].phones.filter((_, i) => i !== phoneIndex);
    setGuardians(updated);
  };

  const isValid = (guardian: IParentGuardian) => {
    return guardian.fullName && guardian.relationship && guardian.phones.length > 0 && guardian.phones[0];
  };

  if (!showSection && userAge && userAge >= 18) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Parent/Guardian Information</h3>
            <p className="text-sm text-gray-600 mt-1">Optional for adult learners</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSection(true)}>
            <Eye className="h-4 w-4 mr-2" />
            Show This Section
          </Button>
        </div>
      </div>
    );
  }

  return (
    <CollapsibleSection
      title="Parent/Guardian Information"
      badge={guardians.length > 0 && <Badge>{guardians.length}</Badge>}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        {userAge && userAge >= 18 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">Optional for adult learners</p>
            <Button variant="ghost" size="sm" onClick={() => setShowSection(false)}>
              <EyeOff className="h-4 w-4 mr-2" />
              Hide Section
            </Button>
          </div>
        )}

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
          {guardians.map((guardian, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                  <Badge variant="outline">
                    {relationshipOptions.find((r) => r.value === guardian.relationship)?.label}
                  </Badge>
                  {guardian.isCustodial && <Badge>Custodial</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={guardian.fullName}
                        onChange={(e) => handleUpdate(index, 'fullName', e.target.value)}
                        placeholder="Full name"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Select
                        value={guardian.relationship}
                        onValueChange={(value) => handleUpdate(index, 'relationship', value as RelationshipType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {relationshipOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`custodial-${index}`}
                      checked={guardian.isCustodial}
                      onCheckedChange={(checked) => handleUpdate(index, 'isCustodial', checked)}
                    />
                    <Label htmlFor={`custodial-${index}`} className="cursor-pointer">
                      Custodial Parent/Guardian
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Numbers * (at least 1)</Label>
                    {guardian.phones.map((phone, phoneIndex) => (
                      <div key={phoneIndex} className="flex gap-2">
                        <Input
                          type="tel"
                          value={phone}
                          onChange={(e) => handleUpdatePhone(index, phoneIndex, e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                        {guardian.phones.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemovePhone(index, phoneIndex)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => handleAddPhone(index)}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Phone
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Employer</Label>
                      <Input
                        value={guardian.employer || ''}
                        onChange={(e) => handleUpdate(index, 'employer', e.target.value)}
                        placeholder="Employer name"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={guardian.jobTitle || ''}
                        onChange={(e) => handleUpdate(index, 'jobTitle', e.target.value)}
                        placeholder="Job title"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Education Level</Label>
                    <Select
                      value={guardian.educationLevel || ''}
                      onValueChange={(value) => handleUpdate(index, 'educationLevel', value as EducationLevel)}
                    >
                      <SelectTrigger>
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

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`ferpa-${index}`}
                      checked={guardian.ferpaAccess || false}
                      onCheckedChange={(checked) => handleUpdate(index, 'ferpaAccess', checked)}
                    />
                    <Label htmlFor={`ferpa-${index}`} className="cursor-pointer text-sm">
                      FERPA Access (Allow access to educational records)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={guardian.notes || ''}
                      onChange={(e) => handleUpdate(index, 'notes', e.target.value)}
                      placeholder="Additional information"
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isValid(guardian)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold">{guardian.fullName}</div>
                  <div className="text-sm text-gray-600">
                    {guardian.phones.map((phone, i) => (
                      <div key={i}>Phone: {phone}</div>
                    ))}
                  </div>
                  {guardian.employer && (
                    <div className="text-sm text-gray-600">Employer: {guardian.employer}</div>
                  )}
                  {guardian.ferpaAccess && (
                    <Badge variant="secondary" className="text-xs">
                      FERPA Access Granted
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
          Add Parent/Guardian
        </Button>
      </div>
    </CollapsibleSection>
  );
}
