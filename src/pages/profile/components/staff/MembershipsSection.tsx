/**
 * Professional Memberships Section (Staff - Section 1.7)
 * Array field with active status toggle
 */

import React, { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Switch } from '@/shared/ui/switch';
import { useUpdateStaffExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IProfessionalMembership } from '@/entities/user-profile/model/types';
import { Plus, Trash2, CheckCircle2, Loader2, Users } from 'lucide-react';

interface MembershipsSectionProps {
  data: {
    professionalMemberships?: IProfessionalMembership[];
  };
}

export function MembershipsSection({ data }: MembershipsSectionProps) {
  const [memberships, setMemberships] = useState<IProfessionalMembership[]>(
    data.professionalMemberships || []
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateStaffExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ professionalMemberships: memberships });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAdd = () => {
    const newMembership: IProfessionalMembership = {
      organizationName: '',
      isActive: true,
    };
    setMemberships([...memberships, newMembership]);
    setEditingIndex(memberships.length);
  };

  const handleRemove = (index: number) => {
    setMemberships(memberships.filter((_, i) => i !== index));
  };

  const handleUpdate = (index: number, field: keyof IProfessionalMembership, value: any) => {
    const updated = [...memberships];
    updated[index] = { ...updated[index], [field]: value };
    setMemberships(updated);
  };

  const isValid = (membership: IProfessionalMembership) => {
    return membership.organizationName;
  };

  return (
    <CollapsibleSection
      title="Professional Memberships"
      badge={memberships.length > 0 && <Badge>{memberships.length}</Badge>}
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
          {memberships.map((membership, index) => (
            <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  {membership.isActive ? (
                    <Badge variant="default" className="bg-green-500">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRemove(index)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Organization Name *</Label>
                    <Input
                      value={membership.organizationName}
                      onChange={(e) => handleUpdate(index, 'organizationName', e.target.value)}
                      placeholder="e.g., Association for Computing Machinery (ACM)"
                      maxLength={150}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Membership Type</Label>
                      <Input
                        value={membership.membershipType || ''}
                        onChange={(e) => handleUpdate(index, 'membershipType', e.target.value)}
                        placeholder="e.g., Professional, Student, Fellow"
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Member ID</Label>
                      <Input
                        value={membership.memberId || ''}
                        onChange={(e) => handleUpdate(index, 'memberId', e.target.value)}
                        placeholder="e.g., ACM-123456"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={membership.startDate || ''}
                        onChange={(e) => handleUpdate(index, 'startDate', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={membership.endDate || ''}
                        onChange={(e) => handleUpdate(index, 'endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`active-${index}`}
                      checked={membership.isActive}
                      onCheckedChange={(checked) => handleUpdate(index, 'isActive', checked)}
                    />
                    <Label htmlFor={`active-${index}`} className="cursor-pointer">
                      Active Membership
                    </Label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isValid(membership)}>
                      Save
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="font-semibold">{membership.organizationName}</div>
                  {membership.membershipType && (
                    <div className="text-sm text-gray-600">Type: {membership.membershipType}</div>
                  )}
                  {membership.memberId && (
                    <div className="text-sm text-gray-600">Member ID: {membership.memberId}</div>
                  )}
                  {membership.startDate && (
                    <div className="text-sm text-gray-600">
                      Since: {new Date(membership.startDate).toLocaleDateString()}
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
          Add Membership
        </Button>
      </div>
    </CollapsibleSection>
  );
}
