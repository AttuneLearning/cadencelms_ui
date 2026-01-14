/**
 * Credentials & Certifications Section (Staff - Section 1.3)
 * Array field with add/edit/remove
 */

import React, { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import type { ICredential, CredentialType } from '@/entities/user-profile/model/types';
import { Plus, Trash2, CheckCircle2, Loader2, Award } from 'lucide-react';

interface CredentialsSectionProps {
  data: {
    credentials?: ICredential[];
  };
}

const credentialTypeOptions: { value: CredentialType; label: string }[] = [
  { value: 'degree', label: 'Degree' },
  { value: 'certification', label: 'Certification' },
  { value: 'license', label: 'License' },
  { value: 'other', label: 'Other' },
];

export function CredentialsSection({ data }: CredentialsSectionProps) {
  const [credentials, setCredentials] = useState<ICredential[]>(data.credentials || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ credentials });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAdd = () => {
    const newCredential: ICredential = {
      type: 'degree',
      name: '',
      issuingOrganization: '',
    };
    setCredentials([...credentials, newCredential]);
    setEditingIndex(credentials.length);
  };

  const handleRemove = (index: number) => {
    setCredentials(credentials.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof ICredential, value: any) => {
    const updated = [...credentials];
    updated[index] = { ...updated[index], [field]: value };
    setCredentials(updated);
  };

  const isValid = (cred: ICredential) => {
    return cred.name && cred.issuingOrganization && cred.type;
  };

  return (
    <CollapsibleSection
      title="Credentials & Certifications"
      badge={credentials.length > 0 && <Badge>{credentials.length}</Badge>}
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
          {credentials.map((cred, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-400" />
                  <Badge variant="outline">{credentialTypeOptions.find(o => o.value === cred.type)?.label}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select
                      value={cred.type}
                      onValueChange={(value) => handleUpdate(index, 'type', value as CredentialType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {credentialTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Name *</Label>
                      <Input
                        value={cred.name}
                        onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                        placeholder="e.g., Ph.D. in Computer Science"
                        maxLength={150}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization *</Label>
                      <Input
                        value={cred.issuingOrganization}
                        onChange={(e) => handleUpdate(index, 'issuingOrganization', e.target.value)}
                        placeholder="e.g., Stanford University"
                        maxLength={150}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Field of Study</Label>
                      <Input
                        value={cred.fieldOfStudy || ''}
                        onChange={(e) => handleUpdate(index, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g., Machine Learning"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Credential ID</Label>
                      <Input
                        value={cred.credentialId || ''}
                        onChange={(e) => handleUpdate(index, 'credentialId', e.target.value)}
                        placeholder="e.g., ABC-123-XYZ"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Date Earned</Label>
                      <Input
                        type="date"
                        value={cred.dateEarned || ''}
                        onChange={(e) => handleUpdate(index, 'dateEarned', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date</Label>
                      <Input
                        type="date"
                        value={cred.expirationDate || ''}
                        onChange={(e) => handleUpdate(index, 'expirationDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isValid(cred)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold">{cred.name}</div>
                  <div className="text-sm text-gray-600">{cred.issuingOrganization}</div>
                  {cred.fieldOfStudy && <div className="text-sm text-gray-600">Field: {cred.fieldOfStudy}</div>}
                  {cred.dateEarned && (
                    <div className="text-sm text-gray-600">
                      Earned: {new Date(cred.dateEarned).toLocaleDateString()}
                    </div>
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
          Add Credential
        </Button>
      </div>
    </CollapsibleSection>
  );
}
