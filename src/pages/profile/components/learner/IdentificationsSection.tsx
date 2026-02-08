/**
 * Identification Documents Section (Learner - Section 2.4)
 * Array field with ID number masking (show last 4 digits only)
 * Sensitive data with security indicators
 */

import { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Badge } from '@/shared/ui/badge';
import { Alert, AlertDescription } from '@/shared/ui/alert';
import { useUpdateLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IIdentification, IdType } from '@/entities/user-profile/model/types';
import { Plus, Trash2, CheckCircle2, Loader2, Shield, Lock, AlertCircle } from 'lucide-react';

interface IdentificationsSectionProps {
  data: {
    identifications?: IIdentification[];
  };
}

const idTypeOptions: { value: IdType; label: string }[] = [
  { value: 'passport', label: 'Passport' },
  { value: 'drivers-license', label: "Driver's License" },
  { value: 'state-id', label: 'State ID' },
  { value: 'student-id', label: 'Student ID' },
  { value: 'visa', label: 'Visa' },
  { value: 'birth-certificate', label: 'Birth Certificate' },
  { value: 'other', label: 'Other' },
];

/**
 * Masks ID number to show only last 4 digits
 * Per ISS-010 clarification Q4: API encrypts/decrypts, UI masks display
 */
const maskIdNumber = (fullId: string): string => {
  if (!fullId || fullId.length < 4) return '••••';
  const lastFour = fullId.slice(-4);
  const masked = '•'.repeat(Math.max(0, fullId.length - 4));
  return masked + lastFour;
};

export function IdentificationsSection({ data }: IdentificationsSectionProps) {
  const [identifications, setIdentifications] = useState<IIdentification[]>(data.identifications || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateLearnerExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ identifications });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAdd = () => {
    const newId: IIdentification = {
      idType: 'passport',
      idNumber: '',
      issuingAuthority: '',
    };
    setIdentifications([...identifications, newId]);
    setEditingIndex(identifications.length);
  };

  const handleRemove = (index: number) => {
    setIdentifications(identifications.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof IIdentification, value: any) => {
    const updated = [...identifications];
    updated[index] = { ...updated[index], [field]: value };
    setIdentifications(updated);
  };

  const isValid = (id: IIdentification) => {
    return id.idType && id.idNumber && id.issuingAuthority;
  };

  return (
    <CollapsibleSection
      title="Identification Documents"
      badge={identifications.length > 0 && <Badge>{identifications.length}</Badge>}
      defaultExpanded={false}
    >
      <div className="space-y-4">
        <Alert className="border-amber-200 bg-amber-50/50">
          <Lock className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm text-amber-800">
            ID numbers are encrypted and only the last 4 digits are displayed for security.
          </AlertDescription>
        </Alert>

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
          {identifications.map((id, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <Badge variant="outline">
                    {idTypeOptions.find((opt) => opt.value === id.idType)?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Encrypted
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Document Type *</Label>
                    <Select
                      value={id.idType}
                      onValueChange={(value) => handleUpdate(index, 'idType', value as IdType)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {idTypeOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label>ID Number *</Label>
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="h-3 w-3 mr-1" />
                        Secure
                      </Badge>
                    </div>
                    <Input
                      type="text"
                      value={id.idNumber}
                      onChange={(e) => handleUpdate(index, 'idNumber', e.target.value)}
                      placeholder="Enter full ID number"
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      ID numbers are encrypted in transit and at rest. Only last 4 digits shown after save.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Issuing Authority *</Label>
                    <Input
                      value={id.issuingAuthority}
                      onChange={(e) => handleUpdate(index, 'issuingAuthority', e.target.value)}
                      placeholder="e.g., U.S. Department of State, CA DMV"
                      maxLength={100}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Issue Date</Label>
                      <Input
                        type="date"
                        value={id.issueDate || ''}
                        onChange={(e) => handleUpdate(index, 'issueDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expiration Date</Label>
                      <Input
                        type="date"
                        value={id.expirationDate || ''}
                        onChange={(e) => handleUpdate(index, 'expirationDate', e.target.value)}
                      />
                    </div>
                  </div>

                  {id.expirationDate && new Date(id.expirationDate) < new Date() && (
                    <Alert className="border-red-200 bg-red-50/50">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-sm text-red-800">
                        This document has expired. Please update with current information.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isValid(id)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-500" />
                    {maskIdNumber(id.idNumber)}
                  </div>
                  <div className="text-sm text-gray-600">
                    Issued by: {id.issuingAuthority}
                  </div>
                  {id.expirationDate && (
                    <div className="text-sm text-gray-600">
                      Expires: {new Date(id.expirationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {new Date(id.expirationDate) < new Date() && (
                        <Badge variant="destructive" className="ml-2 text-xs">
                          Expired
                        </Badge>
                      )}
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
          Add Identification Document
        </Button>
      </div>
    </CollapsibleSection>
  );
}
