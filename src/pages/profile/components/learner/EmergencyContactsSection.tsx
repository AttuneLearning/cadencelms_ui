/**
 * Emergency Contacts Section (Learner - Section 2.2)
 * Demo: Array field management, priority ordering, required fields
 */

import { useState } from 'react';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { useUpdateLearnerExtended } from '@/entities/user-profile/model/useUserProfile';
import type { IEmergencyContact } from '@/entities/user-profile/model/types';
import { Plus, Trash2, GripVertical, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/shared/ui/alert';

interface EmergencyContactsSectionProps {
  data: {
    emergencyContacts?: IEmergencyContact[];
  };
}

export function EmergencyContactsSection({ data }: EmergencyContactsSectionProps) {
  const [contacts, setContacts] = useState<IEmergencyContact[]>(data.emergencyContacts || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const updateMutation = useUpdateLearnerExtended();

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await updateMutation.mutateAsync({ emergencyContacts: contacts });
      setSaveStatus('saved');
      setEditingIndex(null);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('idle');
      console.error('Failed to save:', error);
    }
  };

  const handleAddContact = () => {
    const newContact: IEmergencyContact = {
      fullName: '',
      relationship: '',
      primaryPhone: '',
      priority: contacts.length + 1,
    };
    setContacts([...contacts, newContact]);
    setEditingIndex(contacts.length);
  };

  const handleRemoveContact = (index: number) => {
    const updatedContacts = contacts.filter((_, i) => i !== index);
    // Reorder priorities
    const reorderedContacts = updatedContacts.map((contact, i) => ({
      ...contact,
      priority: i + 1,
    }));
    setContacts(reorderedContacts);
  };

  const handleUpdateContact = (index: number, field: keyof IEmergencyContact, value: any) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = {
      ...updatedContacts[index],
      [field]: value,
    };
    setContacts(updatedContacts);
  };

  const isContactValid = (contact: IEmergencyContact) => {
    return contact.fullName && contact.relationship && contact.primaryPhone;
  };

  const hasValidContacts = contacts.length > 0 && contacts.every(isContactValid);

  return (
    <CollapsibleSection
      title="Emergency Contacts"
      badge={
        <Badge variant={hasValidContacts ? 'default' : 'destructive'}>
          {contacts.length === 0 ? 'Required' : `${contacts.length} contact${contacts.length !== 1 ? 's' : ''}`}
        </Badge>
      }
      defaultExpanded={true}
    >
      <div className="space-y-4">
        {/* Required Notice */}
        <Alert>
          <AlertDescription>
            <strong>At least 1 emergency contact is required.</strong> Contacts are listed in priority order.
          </AlertDescription>
        </Alert>

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

        {/* Contact Cards */}
        <div className="space-y-3">
          {contacts.map((contact, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 space-y-3 bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-5 w-5 text-gray-400" />
                  <Badge variant="outline">Priority {contact.priority}</Badge>
                  {index === 0 && <Badge>Primary</Badge>}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveContact(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        value={contact.fullName}
                        onChange={(e) => handleUpdateContact(index, 'fullName', e.target.value)}
                        placeholder="John Doe"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Relationship *</Label>
                      <Input
                        value={contact.relationship}
                        onChange={(e) => handleUpdateContact(index, 'relationship', e.target.value)}
                        placeholder="Spouse, Parent, Sibling"
                        maxLength={50}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Primary Phone *</Label>
                      <Input
                        type="tel"
                        value={contact.primaryPhone}
                        onChange={(e) => handleUpdateContact(index, 'primaryPhone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Secondary Phone</Label>
                      <Input
                        type="tel"
                        value={contact.secondaryPhone || ''}
                        onChange={(e) => handleUpdateContact(index, 'secondaryPhone', e.target.value)}
                        placeholder="+1 (555) 987-6543"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={contact.email || ''}
                      onChange={(e) => handleUpdateContact(index, 'email', e.target.value)}
                      placeholder="john.doe@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={contact.notes || ''}
                      onChange={(e) => handleUpdateContact(index, 'notes', e.target.value)}
                      placeholder="Additional information"
                      rows={2}
                      maxLength={500}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={!isContactValid(contact)}>
                      Save Contact
                    </Button>
                    <Button variant="outline" onClick={() => setEditingIndex(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <strong>{contact.fullName}</strong> ({contact.relationship})
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Primary: {contact.primaryPhone}</div>
                    {contact.secondaryPhone && <div>Secondary: {contact.secondaryPhone}</div>}
                    {contact.email && <div>Email: {contact.email}</div>}
                  </div>
                  {contact.notes && (
                    <p className="text-sm text-gray-600">{contact.notes}</p>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingIndex(index)}
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add Contact Button */}
        <Button
          variant="outline"
          onClick={handleAddContact}
          className="w-full"
          disabled={editingIndex !== null}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Emergency Contact
        </Button>

        {contacts.length === 0 && (
          <p className="text-sm text-red-600">At least one emergency contact is required.</p>
        )}
      </div>
    </CollapsibleSection>
  );
}
